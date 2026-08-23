import { buildNormalizer } from "./normalizer.js";
import { tokenize } from "./tokenizer.js";
import { scoreEntry } from "./scorer.js";
import { createContext, resolvePronouns, updateContextFromEntry } from "./context.js";

function safeEntry(e){
  if (!e || typeof e !== "object") return null;
  return {
    id: e.id || null,
    question: e.question || "",
    aliases: Array.isArray(e.aliases) ? e.aliases : [],
    keywords: Array.isArray(e.keywords) ? e.keywords : [],
    answer: e.answer || "",
    category: e.category || "General",
    sourceId: e.sourceId || null,
    source: e.source || null,
    confidence: typeof e.confidence === "number" ? e.confidence : 1,
    intent: e.intent || null,
    entity: e.entity || null
  };
}

function buildIndex(entries){
  // inverted index: token -> Set(entryIndex)
  const inv = new Map();
  for (let i=0;i<entries.length;i++){
    const tks = entries[i]._tokens || [];
    for (const t of new Set(tks)){
      if (!inv.has(t)) inv.set(t, []);
      inv.get(t).push(i);
    }
  }
  return inv;
}

function unique(arr){
  return [...new Set(arr)];
}

function pickTopK(scored, k=5){
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,k);
}

function isSensitive(text){
  const t = text.toLowerCase();
  const emergency = /\b(i want to die|suicide|self harm|kill myself)\b/.test(t);
  const medical = /\b(dose|medication|diagnose|symptom|chest pain|heart attack|stroke)\b/.test(t);
  const legal = /\b(i got arrested|sue|lawsuit|contract|legal advice)\b/.test(t);
  const financial = /\b(guaranteed profit|get rich|insider trading|loan shark)\b/.test(t);
  return { emergency, medical, legal, financial, any: emergency||medical||legal||financial };
}

export async function createEngine(registry, seedContext = null){
  const rules = registry.rules || { minimumConfidence: 0.55, neverInventFacts: true, allowFuzzyMatching: true, useCorrections: true };
  const corrections = registry.corrections || {};
  const sources = registry.sources || {};
  const entities = registry.entities || {};
  const intents = registry.intents || {};
  const responses = registry.responses || {};
  const current = registry.current || null;

  const normalizer = buildNormalizer({ corrections, rules });

  // Flatten knowledge modules
  const modules = registry.knowledgeModules || [];
  const allEntries = [];
  for (const mod of modules){
    const arr = Array.isArray(mod?.data) ? mod.data : (Array.isArray(mod) ? mod : []);
    for (const raw of arr){
      const e = safeEntry(raw);
      if (!e || !e.question || !e.answer) continue;

      const qNorm = normalizer.normalizeForMatch(e.question);
      const aliasNorms = (e.aliases||[]).map(a=>normalizer.normalizeForMatch(a)).filter(Boolean);
      const kwNorm = (e.keywords||[]).map(k=>normalizer.normalizeForMatch(k)).join(" ");
      const tokens = unique(tokenize(`${qNorm} ${aliasNorms.join(" ")} ${kwNorm}`));

      e._qNorm = qNorm;
      e._aliasNorms = aliasNorms;
      e._tokens = tokens;
      e._kw = unique(tokenize(kwNorm));
      allEntries.push(e);
    }
  }

  const inv = buildIndex(allEntries);

  const ctx = createContext(seedContext);

  function getStats(){
    const cats = new Set(allEntries.map(e=>e.category || "General"));
    return { categories: cats.size, entries: allEntries.length };
  }

  function resetContext(){
    const fresh = createContext(null);
    Object.assign(ctx, fresh);
  }

  function getContext(){
    return JSON.parse(JSON.stringify(ctx));
  }

  function sourceFor(entry){
    const list = [];
    if (entry?.sourceId && sources[entry.sourceId]) list.push(sources[entry.sourceId]);
    if (entry?.source && typeof entry.source === "string") list.push({ id: "inline", title: entry.source, note: "Provided in dataset" });
    if (current?.lastUpdated) list.push({ id:"current", title:"Dataset update info", note:`Current info pack: ${current.status} (lastUpdated ${current.lastUpdated})` });
    return list;
  }

  function pickResponse(key, fallback){
    const v = responses[key];
    if (Array.isArray(v) && v.length) return v[Math.floor(Math.random()*v.length)];
    if (typeof v === "string") return v;
    return fallback;
  }

  function detectConversationIntent(q){
    const t = q.toLowerCase().trim();
    const patterns = intents.conversation || [];
    for (const it of patterns){
      if (it?.re && new RegExp(it.re, "i").test(t)) return it.intent;
    }
    return null;
  }

  function detectCommandIntent(qNorm){
    const patterns = intents.commands || [];
    for (const it of patterns){
      if (it?.re && new RegExp(it.re, "i").test(qNorm)) return it.intent;
    }
    return null;
  }

  function findCandidates(queryTokens){
    const idxs = [];
    for (const t of new Set(queryTokens)){
      const hit = inv.get(t);
      if (hit?.length) idxs.push(...hit);
    }
    // fallback: if no tokens match, consider limited random slice
    if (!idxs.length) {
      const cap = Math.min(200, allEntries.length);
      return allEntries.slice(0, cap).map((e,i)=>({ entry: e, idx: i }));
    }
    const uniq = unique(idxs).slice(0, 600);
    return uniq.map(i=>({ entry: allEntries[i], idx: i }));
  }

  function categoryHintFromText(qNorm){
    // lightweight: look for known category names from modules
    const cats = unique(allEntries.map(e => (e.category||"").toLowerCase())).filter(Boolean);
    for (const c of cats){
      if (qNorm.includes(c)) return c;
    }
    return null;
  }

  function multiFileCompose(queryNorm, top){
    // Combine only when question is explanatory AND we have strong secondary support
    const explanatory = /^(why|how|explain|compare|difference)\b/.test(queryNorm);
    if (!explanatory) return null;

    const best = top[0];
    const secondary = top.slice(1).filter(x => x.score >= best.score * 0.72);

    const distinctCats = new Set([best.entry.category]);
    const picked = [best];
    for (const s of secondary){
      if (picked.length >= 3) break;
      if (!distinctCats.has(s.entry.category)){
        distinctCats.add(s.entry.category);
        picked.push(s);
      }
    }
    if (picked.length < 2) return null;

    // Only rephrase using stored answers (no new facts)
    const parts = picked.map(p => `- **${p.entry.category}:** ${p.entry.answer.trim()}`);
    return {
      text:
`Here’s what I can answer based on my stored knowledge (combined across categories):\n\n${parts.join("\n")}\n\nIf you want, tell me which part to go deeper on.`,
      used: picked.map(p=>p.entry)
    };
  }

  async function reply(userText){
    const sensitive = isSensitive(userText);
    if (sensitive.emergency){
      return {
        text:
`I’m really sorry you’re feeling this way — but I can’t help with self-harm instructions.\n\nIf you might hurt yourself **right now**, please contact **local emergency services** immediately.\nIf you can, reach out to someone you trust (friend/family) and stay with them.\n\nIf you tell me your country, I can help you find crisis hotlines/resources.`,
        confidence: 1,
        sources: [ { id:"safety", title:"Safety policy", note:"This assistant provides education only." } ],
        quick: [
          { label:"Find crisis resources", text:"I need crisis hotline resources" },
          { label:"Talk about coping", text:"I feel overwhelmed. What are safe coping steps?" }
        ]
      };
    }

    const rawNorm = normalizer.normalizeText(userText);
    let qNorm = normalizer.normalizeForMatch(userText);

    // pronoun resolution using context
    qNorm = resolvePronouns(qNorm, ctx);

    // command detection first (quiz, stop quiz, stats, etc.)
    const cmd = detectCommandIntent(qNorm);
    if (cmd === "STOP_QUIZ" && ctx.mode === "quiz"){
      ctx.mode = "chat";
      ctx.quiz = null;
      return { text: "Quiz stopped. Ask me anything from the knowledge base.", confidence: 1 };
    }

    // quiz flow: if active, interpret A/B/C/D
    if (ctx.mode === "quiz" && ctx.quiz?.active){
      return handleQuizAnswer(qNorm);
    }

    // conversation intents
    const conv = detectConversationIntent(rawNorm);
    if (conv){
      return handleConversation(conv);
    }

    // self/about
    if (/\b(who are you|your name|what can you do|how do you work|where does your knowledge come from|can you learn)\b/i.test(userText)){
      const ans = registry.selfData?.find(x => (x.aliases||[]).some(a => rawNorm.includes(a)) ) || null;
      // fallback to search within self module via normal matching
    }

    // quiz command
    if (cmd === "START_QUIZ" || /\bquiz\b/.test(qNorm)){
      return startQuizFromText(qNorm);
    }

    // safety for medical/legal/financial: provide general info + disclaimers (but still allow knowledge answers)
    const safetyPrefix = sensitive.any
      ? pickResponse("SAFETY_DISCLAIMER", "Note: I can only share general educational information, not professional advice.")
      : null;

    // Knowledge search
    const queryTokens = tokenize(qNorm);
    const categoryHint = categoryHintFromText(qNorm);

    const intentHints = [];
    if (/\bcapital\b/.test(qNorm)) intentHints.push("capital");
    if (/\bwhere\b/.test(qNorm)) intentHints.push("where");
    if (/\bdefine|meaning\b/.test(qNorm)) intentHints.push("definition");

    const candidates = findCandidates(queryTokens);
    const scored = [];
    const cap = Math.min(220, candidates.length);

    for (let i=0;i<cap;i++){
      const { entry } = candidates[i];
      const score = scoreEntry({ entry, queryNorm: qNorm, queryTokens, intentHints, categoryHint });
      if (score > 0.5) scored.push({ entry, score });
    }

    if (!scored.length){
      return {
        text: "I couldn’t find a reliable match for that yet. Try using a few different words (or add this topic to my data files).",
        confidence: 0,
        quick: [
          { label:"Show what you know", text:"What subjects do you know?" },
          { label:"Try a quiz", text:"Quiz me on Assam" }
        ]
      };
    }

    const top = pickTopK(scored, 5);
    const best = top[0];
    const bestConfidence = Math.min(1, best.score / 100); // normalize to ~0..1

    if (bestConfidence < (rules.minimumConfidence ?? 0.55)){
      return {
        text:
`I’m not confident I have that information in my current knowledge base.\n\nTry asking another way, or add this topic to my data files.`,
        confidence: bestConfidence,
        quick: [
          { label:"Rephrase example", text:`Explain ${qNorm}` },
          { label:"Ask simpler", text: queryTokens.slice(0,6).join(" ") }
        ]
      };
    }

    // Multi-file compose (only for explanatory questions)
    const composed = multiFileCompose(qNorm, top);
    if (composed){
      // update context based on primary entry
      updateContextFromEntry(ctx, composed.used[0], entities);
      return {
        text: (safetyPrefix ? `${safetyPrefix}\n\n` : "") + composed.text,
        confidence: bestConfidence,
        sources: unique(composed.used.flatMap(sourceFor)),
        quick: [
          { label:"Go deeper", text:`Explain more about ${ctx.lastEntity || composed.used[0].category}` },
          { label:"Another question", text:`Tell me about ${composed.used[0].category}` }
        ]
      };
    }

    // Normal single answer
    updateContextFromEntry(ctx, best.entry, entities);

    const answer = best.entry.answer?.trim() || "";
    const finalText = safetyPrefix ? `${safetyPrefix}\n\n${answer}` : answer;

    return {
      text: finalText,
      confidence: bestConfidence,
      sources: sourceFor(best.entry),
      quick: buildFollowups(best.entry)
    };
  }

  function buildFollowups(entry){
    const cat = entry?.category || "General";
    const ent = ctx.lastEntity;
    const qs = [];
    if (ent) qs.push({ label:`Where is ${ent}?`, text:`Where is ${ent} located?` });
    qs.push({ label:`More in ${cat}`, text:`Give me more facts about ${cat}` });
    qs.push({ label:"Start a quiz", text:`Quiz me on ${cat}` });
    return qs.slice(0,3);
  }

  function handleConversation(intent){
    if (intent === "HELLO") return { text: pickResponse("HELLO", "Hello! Ask me anything from my knowledge base."), confidence: 1 };
    if (intent === "THANKS") return { text: pickResponse("THANKS", "You’re welcome!"), confidence: 1 };
    if (intent === "BYE") return { text: pickResponse("BYE", "Goodbye!"), confidence: 1 };
    if (intent === "HOW_ARE_YOU") return { text: pickResponse("HOW_ARE_YOU", "I’m doing well — ready to search my knowledge files."), confidence: 1 };
    if (intent === "WHAT_CAN_YOU_DO") {
      return {
        text:
`I’m a **frontend JavaScript knowledge AI**.\n\nI can:\n- Search my local knowledge files (no cloud model)\n- Handle aliases, capitalization, extra spaces, and common spelling mistakes\n- Use basic conversation context for follow-ups\n- Run a quiz mode\n\nIf I don’t have enough stored information, I’ll say so instead of guessing.`,
        confidence: 1
      };
    }
    if (intent === "SUBJECTS") {
      const stats = getStats();
      return { text: `Right now I have **${stats.entries}** stored entries across **${stats.categories}** categories (from the loaded data pack).`, confidence: 1 };
    }
    return { text: "Hi! Ask me a question.", confidence: 1 };
  }

  function startQuizFromText(qNorm){
    const bank = registry.quizBank || [];
    if (!bank.length) return { text: "Quiz mode isn’t available because no quiz bank is loaded.", confidence: 1 };

    // category detection
    let cat = null;
    const m = qNorm.match(/\b(on|about)\s+([a-z ]+)\b/);
    if (m) cat = m[2].trim();

    let pool = bank;
    if (cat){
      pool = bank.filter(q => (q.category||"").toLowerCase().includes(cat.toLowerCase()));
      if (!pool.length) pool = bank; // fallback
    }

    const count = Math.max(5, Math.min(10, pool.length));
    const picked = shuffle(pool).slice(0, count);

    ctx.mode = "quiz";
    ctx.quiz = { active: true, score: 0, index: 0, questions: picked, current: null };

    return askNextQuizQuestion("Quiz started! Answer with **A / B / C / D** (or tap).");
  }

  function askNextQuizQuestion(prefix=null){
    const q = ctx.quiz.questions[ctx.quiz.index];
    if (!q){
      const total = ctx.quiz.questions.length;
      const score = ctx.quiz.score;
      ctx.mode = "chat";
      ctx.quiz.active = false;
      return {
        text: `Quiz finished. Your score: **${score} / ${total}**.\n\nWant another quiz?`,
        confidence: 1,
        quick: [{ label:"Quiz again", text:"Give me a quiz" }]
      };
    }

    ctx.quiz.current = q;
    const n = ctx.quiz.index + 1;
    const total = ctx.quiz.questions.length;

    return {
      text: `${prefix ? prefix + "\n\n" : ""}**Question ${n}/${total}:** ${q.question}`,
      confidence: 1,
      quizOptions: q.choices,
      sources: q.sourceId && sources[q.sourceId] ? [sources[q.sourceId]] : []
    };
  }

  function handleQuizAnswer(qNorm){
    const cur = ctx.quiz?.current;
    if (!cur) return askNextQuizQuestion();

    const letter = (qNorm.match(/\b(a|b|c|d)\b/) || [])[1];
    let idx = null;
    if (letter) idx = {a:0,b:1,c:2,d:3}[letter];
    if (idx == null){
      // try match by choice text
      const lc = qNorm.toLowerCase();
      idx = cur.choices.findIndex(c => lc === String(c).toLowerCase());
      if (idx < 0) {
        return {
          text: `Please answer with **A**, **B**, **C**, or **D** (or tap an option).`,
          confidence: 1,
          quizOptions: cur.choices
        };
      }
    }

    const correct = cur.correctIndex;
    const ok = idx === correct;

    if (ok) ctx.quiz.score += 1;
    ctx.quiz.index += 1;

    const feedback = ok
      ? "✅ Correct."
      : `❌ Not quite. Correct answer: **${String.fromCharCode(65+correct)}. ${cur.choices[correct]}**.`;

    const explain = cur.explanation ? `\n\n${cur.explanation}` : "";
    return askNextQuizQuestion(`${feedback}${explain}`);
  }

  function shuffle(a){
    const arr = a.slice();
    for (let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  return { reply, getStats, getContext, resetContext };
}

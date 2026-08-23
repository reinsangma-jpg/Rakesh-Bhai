import { createEngine } from "./ai/engine.js";
import { loadMemory, saveMemory, clearMemory } from "./ai/memory.js";
import { formatAssistantMessage, formatUserMessage } from "./ai/formatter.js";
import registry from "./data/registry.js";

const els = {
  chat: document.getElementById("chat"),
  input: document.getElementById("input"),
  send: document.getElementById("btnSend"),
  mic: document.getElementById("btnMic"),
  clear: document.getElementById("btnClear"),
  theme: document.getElementById("btnTheme"),
  quiz: document.getElementById("btnQuiz"),
  progress: document.getElementById("progress"),
  quickRow: document.getElementById("quickRow"),
  btnStats: document.getElementById("btnStats"),
  drawer: document.getElementById("statsDrawer"),
  btnCloseDrawer: document.getElementById("btnCloseDrawer"),
  statCategories: document.getElementById("statCategories"),
  statEntries: document.getElementById("statEntries"),
  statStatus: document.getElementById("statStatus"),
};

const state = {
  engine: null,
  thinking: false,
  speech: null,
};

initTheme();
initParticles();

(async function boot(){
  const mem = loadMemory();
  const engine = await createEngine(registry, mem.context);
  state.engine = engine;

  // restore chat
  if (mem.chat?.length) {
    for (const m of mem.chat) appendMessage(m);
    scrollToBottom();
  } else {
    appendMessage(formatAssistantMessage("Hello! I’m **Maa AI** — a frontend JavaScript knowledge assistant. Ask me something like:\n\n- “capital of assam”\n- “quiz me on geography”\n- “what is climate vs weather”"));
    renderQuick([
      { label: "Assam: capital?", text: "What is the capital of Assam?" },
      { label: "Start a quiz", text: "Give me a quiz" },
      { label: "What can you do?", text: "What can you do?" },
    ]);
  }

  // stats
  const stats = engine.getStats();
  els.statCategories.textContent = String(stats.categories);
  els.statEntries.textContent = String(stats.entries);

  bindUI();
})();

function bindUI(){
  els.send.addEventListener("click", onSend);
  els.input.addEventListener("keydown", (e)=>{ if(e.key==="Enter") onSend(); });

  els.clear.addEventListener("click", ()=>{
    if (!confirm("Clear chat and memory?")) return;
    els.chat.innerHTML = "";
    clearMemory();
    state.engine.resetContext();
    appendMessage(formatAssistantMessage("Cleared. I’m ready when you are."));
    renderQuick([]);
  });

  els.theme.addEventListener("click", toggleTheme);

  els.quiz.addEventListener("click", ()=>{
    els.input.value = "Give me a quiz";
    onSend();
  });

  els.btnStats.addEventListener("click", ()=>{
    els.drawer.hidden = !els.drawer.hidden;
  });
  els.btnCloseDrawer.addEventListener("click", ()=> els.drawer.hidden = true);

  els.mic.addEventListener("click", startVoiceInput);

  // quick action buttons (delegation)
  els.quickRow.addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-text]");
    if (!btn) return;
    els.input.value = btn.dataset.text;
    onSend();
  });
}

async function onSend(){
  if (!state.engine) return;
  const text = (els.input.value || "").trim();
  if (!text) {
    appendMessage(formatAssistantMessage("Type a question first — even a short one is fine."));
    return;
  }
  if (text.length > 1000) {
    appendMessage(formatAssistantMessage("That message is very long. Please shorten it so I can match it reliably."));
    return;
  }

  els.input.value = "";
  renderQuick([]);
  appendMessage(formatUserMessage(text));
  scrollToBottom();

  setThinking(true);

  try{
    const result = await state.engine.reply(text);

    // render assistant
    appendMessage(formatAssistantMessage(result.text, result));
    scrollToBottom();

    // quick suggestions
    if (result.quick?.length) renderQuick(result.quick);

    // persist
    persist();
  }catch(err){
    console.error(err);
    appendMessage(formatAssistantMessage("Something went wrong while searching my knowledge. Try rephrasing your question."));
  }finally{
    setThinking(false);
    scrollToBottom();
  }
}

function appendMessage(msg){
  // msg is {role, html, raw, meta}
  const wrap = document.createElement("div");
  wrap.className = `msg ${msg.role}`;

  if (msg.role === "ai") {
    const av = document.createElement("div");
    av.className = "avatar";
    av.textContent = "🤖";
    wrap.appendChild(av);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = msg.html;
  wrap.appendChild(bubble);

  els.chat.appendChild(wrap);

  // bind source toggle inside bubble
  bubble.querySelectorAll("[data-source-toggle]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-source-toggle");
      const panel = bubble.querySelector(`[data-source-panel="${id}"]`);
      if (!panel) return;
      panel.hidden = !panel.hidden;
    });
  });

  // bind quiz option buttons
  bubble.querySelectorAll("button[data-quiz-answer]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      els.input.value = btn.getAttribute("data-quiz-answer");
      onSend();
    });
  });
}

function scrollToBottom(){
  els.chat.scrollTop = els.chat.scrollHeight;
}

function setThinking(on){
  state.thinking = on;
  els.progress.hidden = !on;
}

function persist(){
  const chat = [];
  els.chat.querySelectorAll(".msg").forEach(node=>{
    const role = node.classList.contains("user") ? "user" : "ai";
    const bubble = node.querySelector(".bubble");
    chat.push({ role, html: bubble?.innerHTML || "" });
  });
  saveMemory({ chat, context: state.engine.getContext() });
}

function renderQuick(items){
  els.quickRow.innerHTML = "";
  for (const it of (items || [])){
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.text = it.text;
    b.textContent = it.label;
    els.quickRow.appendChild(b);
  }
}

/* Theme */
function initTheme(){
  const saved = localStorage.getItem("maa_ai_theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("maa_ai_theme", next);
}

/* Voice input (optional) */
function startVoiceInput(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    appendMessage(formatAssistantMessage("Voice input isn’t supported in this browser. You can still type your question."));
    return;
  }
  if (state.speech) {
    state.speech.stop();
    state.speech = null;
  }
  const rec = new SR();
  state.speech = rec;
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (e)=>{
    const t = e.results?.[0]?.[0]?.transcript || "";
    if (t.trim()) {
      els.input.value = t.trim();
      onSend();
    }
  };
  rec.onerror = ()=> appendMessage(formatAssistantMessage("I couldn’t capture audio clearly. Try again or type instead."));
  rec.start();
}

/* Particles */
function initParticles(){
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let w=0,h=0, dpr=1;
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dots = Array.from({length: prefersReduced ? 18 : 42}, ()=>({
    x: Math.random(), y: Math.random(),
    r: Math.random()*1.8 + 0.6,
    vx: (Math.random()-.5)*0.06,
    vy: (Math.random()-.5)*0.06,
    a: Math.random()*0.35 + 0.10
  }));

  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth+"px";
    canvas.style.height = innerHeight+"px";
  }
  window.addEventListener("resize", resize, {passive:true});
  resize();

  function tick(){
    if (!ctx) return;
    ctx.clearRect(0,0,w,h);

    for (const p of dots){
      p.x += p.vx; p.y += p.vy;
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05;
      if (p.y > 1.05) p.y = -0.05;

      const x = p.x*w, y=p.y*h;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.arc(x,y,p.r*dpr,0,Math.PI*2);
      ctx.fill();
    }
    if (!prefersReduced) requestAnimationFrame(tick);
  }
  tick();
}

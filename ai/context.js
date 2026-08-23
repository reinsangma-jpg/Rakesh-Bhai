export function createContext(seed = null){
  return {
    lastEntity: seed?.lastEntity || null,
    lastCategory: seed?.lastCategory || null,
    lastEntryId: seed?.lastEntryId || null,
    mode: seed?.mode || "chat", // "chat" | "quiz"
    quiz: seed?.quiz || null,   // { active, score, index, questions, current }
  };
}

export function resolvePronouns(queryNorm, ctx){
  if (!ctx?.lastEntity) return queryNorm;
  const hasPronoun = /\b(it|that|there|he|she|they|this|those|these)\b/.test(queryNorm);
  const hasNouny = queryNorm.split(" ").some(t => t.length >= 4);
  if (hasPronoun && !hasNouny) return `${queryNorm} ${ctx.lastEntity}`.trim();
  if (hasPronoun && !queryNorm.includes(ctx.lastEntity)) return `${queryNorm} ${ctx.lastEntity}`.trim();
  return queryNorm;
}

export function updateContextFromEntry(ctx, entry, entitiesMap = {}){
  if (!entry) return;
  ctx.lastEntryId = entry.id || ctx.lastEntryId;
  ctx.lastCategory = entry.category || ctx.lastCategory;

  // pick a stable “entity” for follow-ups
  // prefer explicit entity mapping, else first keyword, else topic word from question
  let ent = null;

  if (entry.keywords?.length) ent = entry.keywords[0];
  if (entry.entity) ent = entry.entity;

  // detect well-known entities mentioned in answer/question
  const hay = `${entry.question||""} ${entry.answer||""}`.toLowerCase();
  for (const [name, syns] of Object.entries(entitiesMap)){
    if (hay.includes(name.toLowerCase())) { ent = name; break; }
    if (Array.isArray(syns) && syns.some(s=>hay.includes(String(s).toLowerCase()))) { ent = name; break; }
  }

  if (ent) ctx.lastEntity = ent;
}

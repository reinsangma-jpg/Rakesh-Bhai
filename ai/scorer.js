import { jaccard, dice, similarity, phraseContainment } from "./matcher.js";

export function scoreEntry({ entry, queryNorm, queryTokens, intentHints = [], categoryHint = null }){
  let score = 0;

  const qn = entry._qNorm || "";
  const aliasNorms = entry._aliasNorms || [];
  const kw = entry._kw || [];
  const cat = (entry.category || "").toLowerCase();

  // Strong phrase match
  score += 50 * phraseContainment(queryNorm, qn);

  // Alias match
  let bestAlias = 0;
  for (const an of aliasNorms) bestAlias = Math.max(bestAlias, phraseContainment(queryNorm, an));
  score += 30 * bestAlias;

  // Token overlap
  const et = entry._tokens || [];
  const jac = jaccard(queryTokens, et);
  const di = dice(queryTokens, et);
  score += 18 * jac;
  score += 12 * di;

  // Keyword overlap
  if (kw.length){
    const kwSet = new Set(kw);
    const hit = queryTokens.filter(t=>kwSet.has(t)).length;
    score += Math.min(20, hit * 6);
  }

  // Fuzzy similarity to question + best alias
  const fuzzQ = similarity(queryNorm, qn);
  let fuzzA = 0;
  for (const an of aliasNorms) fuzzA = Math.max(fuzzA, similarity(queryNorm, an));
  score += 15 * Math.max(fuzzQ, fuzzA);

  // Intent/category hints
  if (intentHints.length){
    const hay = `${qn} ${aliasNorms.join(" ")} ${kw.join(" ")}`;
    const hits = intentHints.filter(t=>hay.includes(t)).length;
    score += Math.min(20, hits * 7);
  }
  if (categoryHint && cat){
    if (cat.includes(categoryHint.toLowerCase())) score += 12;
  }

  // Entry confidence weight
  const conf = typeof entry.confidence === "number" ? entry.confidence : 1;
  score *= (0.75 + Math.min(1, Math.max(0.2, conf)) * 0.25);

  return score;
}

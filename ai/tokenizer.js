export function tokenize(normText){
  if (!normText) return [];
  return normText.split(" ").map(t=>t.trim()).filter(Boolean);
}

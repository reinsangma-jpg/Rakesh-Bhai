export function buildNormalizer({ corrections = {}, rules = {} } = {}){
  const contractions = {
    "what's":"what is",
    "whats":"what is",
    "who's":"who is",
    "it's":"it is",
    "that's":"that is",
    "can't":"can not",
    "cannot":"can not",
    "won't":"will not",
    "i'm":"i am",
    "you're":"you are",
    "we're":"we are",
    "they're":"they are",
    "assam's":"assam",
    "india's":"india",
  };

  const filler = new Set([
    "please","pls","plz","kindly","tell","me","about","info","information",
    "could","would","can","you","just","actually","basically","maybe"
  ]);

  function normalizeText(input){
    let s = String(input ?? "");
    s = s.replace(/\u00A0/g, " ");

    // Lowercase
    s = s.toLowerCase();

    // Expand contractions (simple)
    s = s.split(/\s+/).map(t => contractions[t] || t).join(" ");

    // Remove punctuation (keep spaces)
    s = s.replace(/['’]/g, "");          // remove apostrophes
    s = s.replace(/[^a-z0-9\s]/g, " ");  // remove punctuation/symbols
    s = s.replace(/\s+/g, " ").trim();

    // Token-level safe corrections (only exact known mistakes)
    if (rules?.useCorrections !== false){
      const toks = s.split(" ").filter(Boolean).map(t => corrections[t] || t);
      s = toks.join(" ");
    }

    // Remove repeated words (light)
    s = s.replace(/\b(\w+)(\s+\1\b)+/g, "$1");

    return s;
  }

  function normalizeForMatch(input){
    const s = normalizeText(input);
    const toks = s.split(" ").filter(Boolean).filter(t => !filler.has(t));
    return toks.join(" ").trim();
  }

  return { normalizeText, normalizeForMatch };
}

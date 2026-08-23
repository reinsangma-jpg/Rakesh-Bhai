export function jaccard(aTokens, bTokens){
  const A = new Set(aTokens);
  const B = new Set(bTokens);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter/union : 0;
}

export function dice(aTokens, bTokens){
  const A = new Set(aTokens);
  const B = new Set(bTokens);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return (2*inter)/(A.size + B.size);
}

export function levenshtein(a,b, max=120){
  a = (a||"").slice(0,max);
  b = (b||"").slice(0,max);
  const n=a.length, m=b.length;
  if (!n) return m;
  if (!m) return n;
  const dp = new Array(m+1);
  for (let j=0;j<=m;j++) dp[j]=j;
  for (let i=1;i<=n;i++){
    let prev = dp[0];
    dp[0]=i;
    for (let j=1;j<=m;j++){
      const tmp = dp[j];
      const cost = a[i-1]===b[j-1] ? 0 : 1;
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j-1] + 1,
        prev + cost
      );
      prev = tmp;
    }
  }
  return dp[m];
}

export function similarity(a,b){
  const A = a||"", B = b||"";
  const maxLen = Math.max(A.length, B.length);
  if (!maxLen) return 1;
  const dist = levenshtein(A,B);
  return Math.max(0, 1 - dist/maxLen);
}

export function phraseContainment(queryNorm, candidateNorm){
  if (!queryNorm || !candidateNorm) return 0;
  if (queryNorm === candidateNorm) return 1;
  if (candidateNorm.includes(queryNorm)) return 0.85;
  if (queryNorm.includes(candidateNorm)) return 0.75;
  return 0;
}

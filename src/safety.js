// Phrases that suggest someone may be at risk.
// Keyword-based, so it can miss indirect phrasing.
const riskPatterns = [
  /\bkill (myself|me)\b/,
  /\bsuicid(e|al)\b/,
  /\bend (my|it all|my life)\b/,
  /\bwant(ed)? to die\b/,
  /\bdon'?t want to (live|be alive|exist)\b/,
  /\b(hurt|harm|cut) myself\b/,
  /\bself[- ]?harm\b/,
  /\bno reason to live\b/,
  /\bbetter off (dead|without me)\b/,
];

export function needsSupport(text) {
  const lower = text.toLowerCase();
  return riskPatterns.some((pattern) => pattern.test(lower));
}
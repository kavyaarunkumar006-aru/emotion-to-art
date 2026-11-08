// Colors based on Jonauskaite et al. (2020) color-emotion research
export const moods = {
  happy:   { words: ["happy", "joy", "excited", "great"], colors: ["#FFD93D", "#FF8C42", "#FF9EC7"], speed: 3, style: "burst" },
  calm:    { words: ["calm", "peaceful", "relaxed", "hopeful"], colors: ["#6BCB77", "#4D96FF", "#F4F7FF"], speed: 1, style: "waves" },
  sad:     { words: ["sad", "lonely", "down", "tired"], colors: ["#6E6E73", "#9A9AA0", "#5A6577"], speed: 1, style: "rain" },
  angry:   { words: ["angry", "mad", "frustrated", "annoyed"], colors: ["#FF4B4B", "#8B0000"], speed: 5, style: "shards" },
  anxious: { words: ["nervous", "anxious", "worried", "scared", "stressed"], colors: ["#2B2B35", "#8E7CC3", "#C9C9D6"], speed: 4, style: "jitter" },
};

const neutralStyle = { colors: ["#CCCCCC", "#888888"], speed: 2, style: "drift" };

// Builds the mood object used everywhere in the app
export function buildMood({ primary, secondary = null, intensity = 1, confidence = null }) {
  const p = primary === "neutral" ? neutralStyle : moods[primary];
  const s = secondary ? moods[secondary] : null;
  return {
    name: secondary ? `${primary} + ${secondary}` : primary,
    primary: { ...p },
    secondary: s ? { ...s } : null,
    intensity,
    confidence,
  };
}

export const neutral = buildMood({ primary: "neutral" });

// Reads intensity words: "very" → stronger, "a bit" → softer
export function getIntensity(text) {
  const lower = text.toLowerCase();
  let level = 1;
  if (/\b(very|so|extremely|really|super|too|totally)\b/.test(lower)) level += 0.5;
  if (/\b(a bit|slightly|little|kinda|kind of|somewhat)\b/.test(lower)) level -= 0.4;
  if (/!{2,}/.test(text) || /[A-Z]{3,}/.test(text)) level += 0.3;
  return Math.min(Math.max(level, 0.5), 1.8);
}

// Keyword backup (used if the AI fails)
export function getMood(text) {
  const lower = text.toLowerCase();
  const found = Object.entries(moods)
    .filter(([, m]) => m.words.some((w) => lower.includes(w)))
    .map(([name]) => name);

  if (found.length === 0) return neutral;
  return buildMood({ primary: found[0], secondary: found[1] || null, intensity: getIntensity(text) });
}
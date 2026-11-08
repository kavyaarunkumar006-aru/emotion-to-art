import { pipeline } from "@huggingface/transformers";
import { moods, neutral, buildMood, getIntensity } from "./moodMapper";

let classifier = null;

export async function getAIMood(text) {
  if (!classifier) {
    classifier = await pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli");
  }

  const labels = Object.keys(moods);
  const result = await classifier(text, labels, {
    hypothesis_template: "The person feels {}.",
    multi_label: true, // score each emotion separately
  });

  const [first, second] = result.labels;
  const [s1, s2] = result.scores;

  // Not confident about anything → neutral
  if (s1 < 0.5) return { ...neutral, confidence: s1 };

  // Second emotion counts only if it's also strong and close to the first
  const secondary = s2 >= 0.5 && s1 - s2 < 0.35 ? second : null;

  // Intensity = words like "very" + how sure the AI is
  const intensity = getIntensity(text) * (0.7 + 0.3 * s1);

  return buildMood({ primary: first, secondary, intensity, confidence: s1 });
}
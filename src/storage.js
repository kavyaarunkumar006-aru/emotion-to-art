const KEY = "emotion-journal";

export function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveEntries(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("Could not save entries:", err);
  }
}
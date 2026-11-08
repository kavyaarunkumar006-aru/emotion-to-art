import { useState, useEffect } from "react";
import { getMood, neutral } from "./moodMapper";
import { getAIMood } from "./aiMood";
import { loadEntries, saveEntries } from "./storage";
import { needsSupport } from "./safety";
import ArtCanvas from "./ArtCanvas";
import Journal from "./Journal";
import RatingCheck from "./RatingCheck";
import SafetyCard from "./SafetyCard";
import MoodConstellation from "./MoodConstellation";

const SESSION_MS = 32000;

function App() {
  const [feeling, setFeeling] = useState("");
  const [mood, setMood] = useState(neutral);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("mirror");
  const [entries, setEntries] = useState(() => loadEntries());
  const [currentEntryId, setCurrentEntryId] = useState(null);
  const [showSafety, setShowSafety] = useState(false);

  const [calmStep, setCalmStep] = useState("idle");
  const [beforeScore, setBeforeScore] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  useEffect(() => {
    if (calmStep !== "running") return;
    const timer = setTimeout(() => setCalmStep("after"), SESSION_MS);
    return () => clearTimeout(timer);
  }, [calmStep]);

  const createArt = async (text) => {
    setLoading(true);

    let newMood;
    try {
      newMood = await getAIMood(text);
    } catch (err) {
      console.error("AI failed, using keywords:", err);
      newMood = getMood(text);
    }

    setMood(newMood);

    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      text,
      mood: newMood,
      sessions: [],
    };
    setEntries((prev) => [entry, ...prev]);
    setCurrentEntryId(entry.id);

    setMode("mirror");
    setCalmStep("idle");
    setLastResult(null);
    setFeeling("");
    setLoading(false);
  };

  const handleCreate = () => {
    const text = feeling.trim();
    if (!text) return;

    if (needsSupport(text)) {
      setShowSafety(true);
      return;
    }
    createArt(text);
  };

  const handleSafetyContinue = () => {
    setShowSafety(false);
    setFeeling("");
  };

  const handleSelect = (entry) => {
    setMood(entry.mood);
    setCurrentEntryId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (id === currentEntryId) setCurrentEntryId(null);
  };

  const chooseMirror = () => {
    setMode("mirror");
    setCalmStep("idle");
  };

  const chooseCalm = () => {
    setLastResult(null);
    setCalmStep("before");
  };

  const handleBefore = (score) => {
    setBeforeScore(score);
    setMode("calm");
    setCalmStep("running");
  };

  const skipBefore = () => {
    setBeforeScore(null);
    setMode("calm");
    setCalmStep("running");
  };

  const handleAfter = (score) => {
    if (beforeScore != null) {
      const session = { before: beforeScore, after: score, date: new Date().toISOString() };
      setLastResult(session);

      if (currentEntryId) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === currentEntryId
              ? { ...e, sessions: [...(e.sessions || []), session] }
              : e
          )
        );
      }
    }
    setCalmStep("done");
  };

  const badgeBg = mood.secondary
    ? `linear-gradient(90deg, ${mood.primary.colors[0]}, ${mood.secondary.colors[0]})`
    : mood.primary.colors[0];

  const intensityLabel = mood.intensity > 1.2 ? "strong" : mood.intensity < 0.8 ? "mild" : "";

  return (
    <div className="app">
      <h1 className="title">Emotion to Art</h1>
      <p className="subtitle">Describe how you feel, and watch it become art.</p>

      <input
        className="feeling-input"
        type="text"
        placeholder="e.g. I'm excited but nervous about the interview"
        value={feeling}
        onChange={(e) => setFeeling(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
      />

      <button className="download-btn" onClick={handleCreate} disabled={loading}>
        {loading ? "Thinking…" : "Create Art"}
      </button>

      {showSafety && <SafetyCard onContinue={handleSafetyContinue} />}

      <div className="mode-toggle">
        <button className={mode === "mirror" ? "active" : ""} onClick={chooseMirror}>
          🪞 Mirror
        </button>
        <button
          className={mode === "calm" || calmStep === "before" ? "active" : ""}
          onClick={chooseCalm}
        >
          🌿 Help me calm down
        </button>
      </div>

      {calmStep === "before" && (
        <RatingCheck
          question="Before we start: how tense do you feel?"
          onPick={handleBefore}
          onSkip={skipBefore}
        />
      )}

      {calmStep === "running" && (
        <p className="calm-hint">Follow the breathing for about 30 seconds…</p>
      )}

      {calmStep === "after" && (
        <RatingCheck question="How tense do you feel now?" onPick={handleAfter} />
      )}

      {calmStep === "done" && lastResult && (
        <p className="calm-result">
          Tension: {lastResult.before} → {lastResult.after}
          {lastResult.after < lastResult.before
            ? " 🌿 Nice, you feel calmer."
            : " That's okay. Try another round anytime."}
        </p>
      )}

      <div>
        <span className="mood-badge" style={{ background: badgeBg }}>
          {intensityLabel && `${intensityLabel} `}
          {mood.name}
          {mood.confidence != null && ` · ${Math.round(mood.confidence * 100)}%`}
        </span>
      </div>

      <ArtCanvas mood={mood} mode={mode} />

      <MoodConstellation entries={entries} onSelect={handleSelect} />

      <Journal entries={entries} onSelect={handleSelect} onDelete={handleDelete} />

      <p className="disclaimer">
        Emotion to Art is a wellbeing tool, not a replacement for professional help. If you're
        struggling, call Tele-MANAS at 14416 (free, 24/7).
      </p>
    </div>
  );
}

export default App;
// Vertical position: pleasant (top) → unpleasant (bottom)
const valence = {
  happy: 0.12,
  calm: 0.3,
  neutral: 0.5,
  anxious: 0.68,
  angry: 0.78,
  sad: 0.88,
};

const negative = ["sad", "angry", "anxious"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const primaryName = (entry) => entry.mood.name.split(" + ")[0];

function getInsights(entries) {
  if (entries.length < 3) return null;

  // Most common mood
  const moodCounts = {};
  entries.forEach((e) => {
    const m = primaryName(e);
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  });
  const [topMood, topCount] = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  // Toughest weekday (most sad/angry/anxious check-ins)
  const dayCounts = {};
  entries.forEach((e) => {
    if (negative.includes(primaryName(e))) {
      const d = new Date(e.date).getDay();
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    }
  });
  const toughest = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

  // Calm session results
  const sessions = entries.flatMap((e) => e.sessions || []);
  const avgDrop =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.before - s.after), 0) / sessions.length
      : null;

  return {
    topMood,
    topPercent: Math.round((topCount / entries.length) * 100),
    toughestDay: toughest && toughest[1] >= 2 ? days[toughest[0]] : null,
    sessionCount: sessions.length,
    avgDrop,
  };
}

function MoodConstellation({ entries, onSelect }) {
  if (entries.length === 0) return null;

  const W = 600;
  const H = 260;
  const pad = 36;

  // Oldest → newest, left → right
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const stars = sorted.map((entry, i) => {
    const x = sorted.length === 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (sorted.length - 1);
    const v = valence[primaryName(entry)] ?? 0.5;
    const wobble = (entry.id % 21) - 10; // small fixed offset so stars don't line up perfectly
    const y = pad + v * (H - 2 * pad) + wobble;
    const r = 4 + (entry.mood.intensity || 1) * 3;
    return { entry, x, y, r, color: entry.mood.primary.colors[0], i };
  });

  const insights = getInsights(entries);

  return (
    <div className="constellation">
      <h2 className="journal-title">Your mood constellation</h2>

      <svg viewBox={`0 0 ${W} ${H}`} className="constellation-svg">
        <rect x="0" y="0" width={W} height={H} rx="16" fill="#0d0c22" />

        <text x="12" y="20" className="axis-label">pleasant</text>
        <text x="12" y={H - 10} className="axis-label">unpleasant</text>

        {/* Lines connecting the stars */}
        <polyline
          points={stars.map((s) => `${s.x},${s.y}`).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
        />

        {stars.map((s) => (
          <g
            key={s.entry.id}
            className="star"
            style={{ animationDelay: `${(s.i % 7) * 0.4}s` }}
            onClick={() => onSelect(s.entry)}
          >
            <title>
              {new Date(s.entry.date).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" · "}
              {s.entry.text}
            </title>
            <circle cx={s.x} cy={s.y} r={s.r * 2.5} fill={s.color} opacity="0.2" />
            <circle cx={s.x} cy={s.y} r={s.r} fill={s.color} />
            <circle cx={s.x} cy={s.y} r={s.r * 0.35} fill="white" opacity="0.8" />
          </g>
        ))}
      </svg>

      {insights ? (
        <div className="insights">
          <div className="insight">
            <span className="insight-value">{insights.topMood}</span>
            <span className="insight-label">most common mood ({insights.topPercent}%)</span>
          </div>

          <div className="insight">
            <span className="insight-value">{insights.toughestDay || "None yet"}</span>
            <span className="insight-label">toughest day</span>
          </div>

          <div className="insight">
            <span className="insight-value">
              {insights.avgDrop != null ? `−${insights.avgDrop.toFixed(1)}` : "–"}
            </span>
            <span className="insight-label">
              avg tension drop ({insights.sessionCount} calm sessions)
            </span>
          </div>
        </div>
      ) : (
        <p className="journal-empty">Add a few more check-ins to see your patterns.</p>
      )}
    </div>
  );
}

export default MoodConstellation;
const options = [
  { value: 1, emoji: "😌", label: "Very relaxed" },
  { value: 2, emoji: "🙂", label: "Relaxed" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😟", label: "Tense" },
  { value: 5, emoji: "😣", label: "Very tense" },
];

function RatingCheck({ question, onPick, onSkip }) {
  return (
    <div className="rating-check">
      <p className="rating-question">{question}</p>
      <div className="rating-options">
        {options.map((o) => (
          <button key={o.value} onClick={() => onPick(o.value)} title={o.label}>
            <span className="rating-emoji">{o.emoji}</span>
            <span className="rating-label">{o.label}</span>
          </button>
        ))}
      </div>
      {onSkip && (
        <button className="rating-skip" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  );
}

export default RatingCheck;
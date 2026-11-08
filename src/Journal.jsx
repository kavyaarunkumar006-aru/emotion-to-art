function Journal({ entries, onSelect, onDelete }) {
  if (entries.length === 0) {
    return <p className="journal-empty">Your check-ins will appear here.</p>;
  }

  return (
    <div className="journal">
      <h2 className="journal-title">Your journal</h2>

      {entries.map((entry) => (
        <div key={entry.id} className="journal-entry" onClick={() => onSelect(entry)}>
          <span
            className="journal-dot"
            style={{ background: entry.mood.primary.colors[0] }}
          ></span>

          <div className="journal-body">
            <p className="journal-date">
              {new Date(entry.date).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="journal-text">{entry.text}</p>
            <p className="journal-mood">{entry.mood.name}</p>

            {entry.sessions?.map((s, i) => (
              <p key={i} className="journal-session">
                🌿 Calm session: tension {s.before} → {s.after}
                {s.after < s.before ? " ✓" : ""}
              </p>
            ))}
          </div>

          <button
            className="journal-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default Journal;
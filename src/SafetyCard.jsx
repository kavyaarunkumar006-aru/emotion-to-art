function SafetyCard({ onContinue }) {
  return (
    <div className="safety-card">
      <p className="safety-title">💙 It sounds like you're going through something really hard.</p>
      <p>You don't have to handle this alone. Talking to someone can help, right now.</p>

      <div className="safety-lines">
        <a href="tel:14416" className="safety-call">
          📞 Tele-MANAS: <strong>14416</strong>
        </a>
        <a href="tel:18008914416" className="safety-call">
          📞 Toll-free: <strong>1-800-891-4416</strong>
        </a>
        <a href="tel:112" className="safety-call">
          🚨 Emergency: <strong>112</strong>
        </a>
      </div>

      <p className="safety-note">
        Free, 24/7 and confidential, in many Indian languages. You can also reach out to a
        friend, family member or your college counsellor.
      </p>

      <button className="safety-continue" onClick={onContinue}>
        I'm okay, continue
      </button>
    </div>
  );
}

export default SafetyCard;
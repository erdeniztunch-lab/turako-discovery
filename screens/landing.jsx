// Landing page and onboarding flow — shown before the app stage

const Landing = ({ onStartDemo, onStartEmpty }) => (
  <div className="landing">
    <div className="landing-nav">
      <div className="row-flex">
        <div className="brandmark">T</div>
        <div className="brand-name" style={{ fontSize: 15 }}>Turako</div>
      </div>
      <div className="row-flex">
        <span className="muted" style={{ fontSize: 13 }}>For product teams</span>
        <button className="btn primary" onClick={onStartDemo}>Open the demo</button>
      </div>
    </div>
    <div className="landing-hero">
      <div>
        <div className="landing-eyebrow">Continuous decision system</div>
        <h1 className="landing-h1">What should we build next?</h1>
        <p className="landing-sub">
          Turako turns scattered product feedback into traceable, evidence-backed decisions. One visible loop from raw notes to shipped learning.
        </p>
        <div className="row-flex">
          <button className="btn primary lg" onClick={onStartDemo}>Start with sample data <Icon name="arrow-right" size={13} /></button>
          <button className="btn lg" onClick={onStartEmpty}>Empty workspace</button>
        </div>
      </div>
      <div className="flow-diagram">
        <div className="section-label" style={{ marginBottom: 14 }}>The loop</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Source", body: "Paste a customer interview, ticket batch, or analytics note." },
            { label: "Signal", body: "Stated, observed, or inferred — with strength." },
            { label: "Problem", body: "Recurring pattern with visible confidence and trend." },
            { label: "Opportunity", body: "A possible product response, framed and weighed." },
            { label: "Decision", body: "Build, test, watch, or drop — explainable end-to-end." },
            { label: "Learning", body: "Outcome feeds back into confidence." },
          ].map((s, i) => (
            <div key={s.label} style={{ display: "grid", gridTemplateColumns: "20px 100px 1fr", gap: 14, alignItems: "center" }}>
              <span className="mono dim" style={{ fontSize: 11 }}>0{i + 1}</span>
              <span className="bold" style={{ fontSize: 13 }}>{s.label}</span>
              <span className="muted" style={{ fontSize: 13 }}>{s.body}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Onboarding = ({ onDone }) => {
  const [name, setName] = React.useState("");
  return (
    <div className="fullscreen">
      <div className="onboard-card">
        <div className="row-flex" style={{ marginBottom: 24 }}>
          <div className="brandmark">T</div>
          <div className="brand-name">Turako</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>What's the product?</div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 22 }}>One short line. Turako uses this to keep recommendations grounded.</div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onDone({ name: name.trim(), segments: [], focus: "" }, false); }}
          placeholder="e.g. Pulseboard — analytics for SaaS PMs"
          style={{ width: "100%", padding: "12px 14px", background: "var(--bg-elev-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", fontSize: 15 }}
        />
        <div className="row-flex" style={{ marginTop: 24 }}>
          <button className="btn ghost" onClick={() => onDone({ name: "", segments: [], focus: "" }, true)}>Use sample data instead</button>
          <span className="spacer" />
          <button
            className="btn primary"
            disabled={!name.trim()}
            onClick={() => onDone({ name: name.trim(), segments: [], focus: "" }, false)}
          >
            Open Turako <Icon name="arrow-right" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Landing, Onboarding });

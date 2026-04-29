// Landing page and onboarding flow - shown before the app stage

const FIRST_EVIDENCE_EXAMPLE =
  "11 support tickets this week mention dashboard slow, timeout on funnel, or export stuck. Six tickets came from accounts above 200k events. Support tagged four tickets as urgent because users could not finish weekly reporting.";

const INTENT_OPTIONS = [
  "What should we build next?",
  "Which customer problem is most urgent?",
  "Which roadmap item should we cut?",
  "What should we validate before building?",
];

const Landing = ({ onStartDemo, onStartEmpty }) => (
  <div className="landing">
    <div className="landing-nav">
      <div className="row-flex">
        <div className="brandmark">T</div>
        <div className="brand-name" style={{ fontSize: 15 }}>Turako</div>
      </div>
      <div className="row-flex">
        <span className="muted" style={{ fontSize: 13 }}>AI decision copilot for product teams</span>
        <button className="btn primary" onClick={onStartDemo}>Open the demo</button>
      </div>
    </div>
    <div className="landing-hero">
      <div>
        <div className="landing-eyebrow">Continuous decision system</div>
        <h1 className="landing-h1">What should we build next?</h1>
        <p className="landing-sub">
          Turako turns scattered product evidence into a decision brief: what is supported, what is risky, and what proof is still missing.
        </p>
        <div className="row-flex">
          <button className="btn primary lg" onClick={onStartEmpty}>Generate first decision brief <Icon name="arrow-right" size={13} /></button>
          <button className="btn lg" onClick={onStartDemo}>Start with sample data</button>
        </div>
      </div>
      <div className="flow-diagram">
        <div className="section-label" style={{ marginBottom: 14 }}>Decision loop</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Evidence", body: "Connect or paste the feedback, tickets, and analytics you already have." },
            { label: "Signals", body: "Turako extracts stated, observed, and inferred product signals." },
            { label: "Problems", body: "Related signals become problems with confidence, impact, and risk." },
            { label: "Brief", body: "The copilot shows the strongest next move and missing proof." },
            { label: "Decision", body: "You decide. Turako keeps the trail explainable end-to-end." },
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
  const [step, setStep] = React.useState(0);
  const [decisionIntent, setDecisionIntent] = React.useState(INTENT_OPTIONS[0]);
  const [customIntent, setCustomIntent] = React.useState("");
  const [product, setProduct] = React.useState({
    name: "",
    description: "",
    segmentsText: "",
    focus: "",
  });
  const [evidenceText, setEvidenceText] = React.useState("");
  const [brief, setBrief] = React.useState(null);

  const resolvedIntent = customIntent.trim() || decisionIntent;
  const segments = product.segmentsText
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const productPayload = {
    name: product.name.trim(),
    description: product.description.trim(),
    segments,
    focus: product.focus.trim(),
  };

  const canContinue =
    step === 0 ? Boolean(resolvedIntent) :
    step === 1 ? Boolean(productPayload.name && productPayload.focus) :
    step === 2 ? Boolean(evidenceText.trim()) :
    true;

  const goNext = () => {
    if (!canContinue) return;
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    const generated = buildOnboardingDecisionBrief({
      product: productPayload,
      decisionIntent: resolvedIntent,
      evidenceText,
    });
    setBrief(generated);
    setStep(3);
  };

  const startWithBrief = () => {
    if (!brief) return;
    onDone({ workspace: brief.workspace, brief });
  };

  const useSample = () => onDone({ useSample: true });

  const updateProduct = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fullscreen">
      <div className="onboard-card decision-onboard">
        <div className="row-flex" style={{ marginBottom: 22 }}>
          <div className="brandmark">T</div>
          <div>
            <div className="brand-name">Turako</div>
            <div className="mono dim" style={{ fontSize: 10 }}>Decision copilot setup</div>
          </div>
          <span className="spacer" />
          <button className="btn ghost sm" onClick={useSample}>Use sample instead</button>
        </div>

        <div className="onboard-steps" aria-label="Onboarding progress">
          {["Intent", "Context", "Evidence", "Brief"].map((label, index) => (
            <div key={label} className={`onboard-step ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}>
              <span>{index + 1}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="onboard-pane">
            <div className="section-label">Decision intent</div>
            <h1 className="onboard-title">What decision are you trying to make?</h1>
            <p className="muted onboard-copy">Turako will use this as the lens for the first decision brief.</p>
            <div className="intent-grid">
              {INTENT_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`intent-option ${decisionIntent === option && !customIntent.trim() ? "active" : ""}`}
                  onClick={() => {
                    setDecisionIntent(option);
                    setCustomIntent("");
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <input
              value={customIntent}
              onChange={(e) => setCustomIntent(e.target.value)}
              placeholder="Or write your own decision question..."
              className="onboard-input"
            />
          </div>
        )}

        {step === 1 && (
          <div className="onboard-pane">
            <div className="section-label">Product context</div>
            <h1 className="onboard-title">Give Turako enough context to judge the evidence.</h1>
            <div className="onboard-form">
              <input
                autoFocus
                value={product.name}
                onChange={(e) => updateProduct("name", e.target.value)}
                placeholder="Product name, e.g. Pulseboard"
                className="onboard-input"
              />
              <input
                value={product.focus}
                onChange={(e) => updateProduct("focus", e.target.value)}
                placeholder="Current goal, e.g. improve activation for new teams"
                className="onboard-input"
              />
              <input
                value={product.segmentsText}
                onChange={(e) => updateProduct("segmentsText", e.target.value)}
                placeholder="Target users, comma separated"
                className="onboard-input"
              />
              <textarea
                value={product.description}
                onChange={(e) => updateProduct("description", e.target.value)}
                placeholder="Short product description"
                className="onboard-textarea compact"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-pane">
            <div className="section-label">First evidence</div>
            <h1 className="onboard-title">Paste the first messy thing you want Turako to reason over.</h1>
            <p className="muted onboard-copy">A support batch, interview note, CRM summary, or analytics observation is enough.</p>
            <textarea
              autoFocus
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              placeholder="Paste raw evidence..."
              className="onboard-textarea"
            />
            <div className="row-flex" style={{ marginTop: 10 }}>
              <button className="btn ghost sm" onClick={() => setEvidenceText(FIRST_EVIDENCE_EXAMPLE)}>Use example evidence</button>
              <span className="spacer" />
              <span className="mono dim" style={{ fontSize: 11 }}>{evidenceText.trim().length} chars</span>
            </div>
          </div>
        )}

        {step === 3 && brief && (
          <div className="onboard-pane">
            <div className="section-label">AI decision brief</div>
            <h1 className="onboard-title">Turako suggests a first decision brief.</h1>
            <p className="muted onboard-copy">You decide. Turako shows the trail, the risk, and the missing proof.</p>

            <div className="decision-brief">
              <div className="brief-hero">
                <div>
                  <div className="reco-eyebrow" style={{ marginBottom: 8 }}><span className="pulse" /> Strongest supported problem</div>
                  <div className="brief-title">{brief.strongestProblem.title}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>{brief.nextAction}</div>
                </div>
                <div className="brief-stat">
                  <span className="mono">{brief.signals.length}</span>
                  <small>signals</small>
                </div>
              </div>

              <div className="brief-grid">
                <div className="brief-box">
                  <div className="section-label">Problem cluster</div>
                  {brief.clusters.map((cluster) => (
                    <div key={cluster.title} className="brief-row">
                      <span>{cluster.title}</span>
                      <ConfidenceBar value={cluster.confidence} width={120} />
                    </div>
                  ))}
                </div>
                <div className="brief-box">
                  <div className="section-label">Evidence preview</div>
                  {brief.signals.slice(0, 3).map((signal) => (
                    <div key={signal.id} className="evidence-preview">
                      <StrengthTag strength={signal.strength} />
                      <span>{signal.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="brief-callouts">
                <div className="brief-callout warn">
                  <Tag kind="warn">risk</Tag>
                  <span>{brief.riskyArea}</span>
                </div>
                <div className="brief-callout">
                  <Tag>missing proof</Tag>
                  <span>{brief.missingEvidence}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row-flex onboard-actions">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>{step === 3 ? "Edit evidence" : "Back"}</button>}
          <span className="spacer" />
          {step < 3 ? (
            <button className="btn primary" disabled={!canContinue} onClick={goNext}>
              {step === 2 ? "Generate decision brief" : "Continue"} <Icon name="arrow-right" size={13} />
            </button>
          ) : (
            <button className="btn primary" onClick={startWithBrief}>
              Start workspace with this brief <Icon name="arrow-right" size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Landing, Onboarding });

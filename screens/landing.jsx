// Landing page and onboarding flow - shown before the app stage

const FIRST_EVIDENCE_EXAMPLE =
  "11 support tickets this week mention dashboard slow, timeout on funnel, or export stuck. Six tickets came from accounts above 200k events. Support tagged four tickets as urgent because users could not finish weekly reporting.";

const PRESSURE_OPTIONS = [
  "Too many feature requests",
  "Enterprise pressure vs core product",
  "Retention/churn signals",
  "Activation/onboarding drop-off",
  "Roadmap prioritization",
];

const STREAM_LABELS = {
  hubspot: "Sales / CRM",
  zendesk: "Support tickets",
  ga: "Analytics",
  cs: "CS notes",
  slack: "Slack threads",
  interviews: "Interviews",
  linear: "Linear / Jira",
  competitor: "Competitor reviews",
  founder: "Founder / customer DMs",
};

const Landing = ({ onStartDemo, onStartEmpty }) => (
  <div className="landing">
    <div className="landing-nav">
      <div className="row-flex">
        <div className="brandmark">T</div>
        <div className="brand-name" style={{ fontSize: 15 }}>Turako</div>
      </div>
      <div className="row-flex">
        <span className="muted" style={{ fontSize: 13 }}>Product intelligence for messy feedback</span>
        <button className="btn primary" onClick={onStartDemo}>Open the demo</button>
      </div>
    </div>
    <div className="landing-hero">
      <div>
        <div className="landing-eyebrow">Continuous decision system</div>
        <h1 className="landing-h1">What should we build next?</h1>
        <p className="landing-sub">
          Turako continuously turns incoming feedback into decision-ready product signals, so growing teams can see what is rising, what is noise, and what to decide next.
        </p>
        <div className="row-flex">
          <button className="btn primary lg" onClick={onStartEmpty}>Map your feedback streams <Icon name="arrow-right" size={13} /></button>
          <button className="btn lg" onClick={onStartDemo}>Start with sample data</button>
        </div>
      </div>
      <div className="flow-diagram">
        <div className="section-label" style={{ marginBottom: 14 }}>Decision loop</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Streams", body: "Preview the places feedback continuously arrives." },
            { label: "Signals", body: "Turako extracts patterns across support, sales, analytics, and notes." },
            { label: "Clusters", body: "Related signals become emerging problem areas with risk." },
            { label: "Surface", body: "The team sees what is rising, noisy, or decision-ready." },
            { label: "Brief", body: "Turako prepares evidence-backed decision briefs. The PM stays in control." },
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
  const [decisionPressure, setDecisionPressure] = React.useState(PRESSURE_OPTIONS[0]);
  const [product, setProduct] = React.useState({
    name: "",
    description: "",
    segmentsText: "",
    focus: "",
  });
  const [selectedSourceIds, setSelectedSourceIds] = React.useState(["zendesk"]);
  const [includeManualEvidence, setIncludeManualEvidence] = React.useState(true);
  const [evidenceText, setEvidenceText] = React.useState("");
  const [streamMap, setStreamMap] = React.useState(null);

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
    step === 0 ? Boolean(productPayload.name && productPayload.focus) :
    step === 1 ? selectedSourceIds.length > 0 || includeManualEvidence :
    step === 2 ? Boolean(decisionPressure) :
    step === 3 ? selectedSourceIds.length > 0 || Boolean(evidenceText.trim()) :
    true;

  const goNext = () => {
    if (!canContinue) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const generated = buildFeedbackStreamMap({
      product: productPayload,
      decisionPressure,
      manualEvidence: evidenceText,
      selectedSourceIds,
    });
    setStreamMap(generated);
    setStep(4);
  };

  const startWithBrief = () => {
    if (!streamMap) return;
    onDone({ workspace: streamMap.workspace, integrations: streamMap.integrations, brief: streamMap });
  };

  const useSample = () => onDone({ useSample: true });

  const updateProduct = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSource = (id) => {
    setSelectedSourceIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const selectedIntegrations = INTEGRATION_CATALOG.filter((item) => selectedSourceIds.includes(item.id));

  return (
    <div className="fullscreen">
      <div className="onboard-card decision-onboard">
        <div className="row-flex" style={{ marginBottom: 22 }}>
          <div className="brandmark">T</div>
          <div>
            <div className="brand-name">Turako</div>
            <div className="mono dim" style={{ fontSize: 10 }}>Product intelligence setup</div>
          </div>
          <span className="spacer" />
          <button className="btn ghost sm" onClick={useSample}>Use sample instead</button>
        </div>

        <div className="onboard-steps" aria-label="Onboarding progress">
          {["Context", "Streams", "Pressure", "Preview", "Signal map"].map((label, index) => (
            <div key={label} className={`onboard-step ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}>
              <span>{index + 1}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="onboard-pane">
            <div className="section-label">Product context</div>
            <h1 className="onboard-title">What product are we helping you make decisions for?</h1>
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

        {step === 1 && (
          <div className="onboard-pane">
            <div className="section-label">Feedback streams</div>
            <h1 className="onboard-title">Where does feedback continuously come from?</h1>
            <p className="muted onboard-copy">Connect later, preview now. Use example streams to see how Turako turns feedback into problem intelligence.</p>
            <div className="onboard-source-grid">
              {INTEGRATION_CATALOG.map((item) => {
                const selected = selectedSourceIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    className={`integration-card onboard-source-card ${selected ? "selected" : ""}`}
                    onClick={() => toggleSource(item.id)}
                  >
                    <div className="integration-topline">
                      <div>
                        <div className="integration-name">{STREAM_LABELS[item.id] || item.name}</div>
                        <div className="integration-kind">{item.kind}</div>
                      </div>
                      <Tag kind={selected ? "accent" : ""}>{selected ? "previewing" : "use example"}</Tag>
                    </div>
                    <p className="integration-copy">{item.description}</p>
                    <div className="integration-foot mono">Connect later, preview now</div>
                  </button>
                );
              })}
            </div>
            <button
              className={`manual-source-card ${includeManualEvidence ? "selected" : ""}`}
              onClick={() => setIncludeManualEvidence((value) => !value)}
            >
              <div>
                <div className="row-title">Paste a few customer notes, tickets, or Slack threads</div>
                <div className="row-sub">Fastest path to the first problem map.</div>
              </div>
              <Tag kind={includeManualEvidence ? "accent" : ""}>{includeManualEvidence ? "included" : "include"}</Tag>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-pane">
            <div className="section-label">Decision pressure</div>
            <h1 className="onboard-title">What makes prioritization hard right now?</h1>
            <p className="muted onboard-copy">Turako uses this to frame the first signal map for a growing product team.</p>
            <div className="intent-grid">
              {PRESSURE_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`intent-option ${decisionPressure === option ? "active" : ""}`}
                  onClick={() => setDecisionPressure(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboard-pane">
            <div className="section-label">First sync preview</div>
            <h1 className="onboard-title">Paste a few customer notes, tickets, or Slack threads.</h1>
            <p className="muted onboard-copy">Selected streams use example data in this preview. Manual batch evidence is optional when a stream is included.</p>
            {selectedIntegrations.length > 0 && (
              <div className="tool-preview-list">
                {selectedIntegrations.map((item) => (
                  <div key={item.id} className="tool-preview-row">
                    <Tag kind="accent">{item.name}</Tag>
                    <span>{item.sampleTitle}</span>
                  </div>
                ))}
              </div>
            )}
            {includeManualEvidence && (
              <>
                <textarea
                  autoFocus={selectedIntegrations.length === 0}
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder={selectedIntegrations.length > 0 ? "Add optional messy raw feedback..." : "Paste messy raw feedback..."}
                  className="onboard-textarea"
                />
                <div className="row-flex" style={{ marginTop: 10 }}>
                  <button className="btn ghost sm" onClick={() => setEvidenceText(FIRST_EVIDENCE_EXAMPLE)}>Use example evidence</button>
                  <span className="spacer" />
                  <span className="mono dim" style={{ fontSize: 11 }}>{evidenceText.trim().length} chars</span>
                </div>
              </>
            )}
            {!includeManualEvidence && (
              <div className="connected-summary">
                <Icon name="check" size={13} />
                <span>Manual batch skipped. Turako will use selected stream evidence for this first map.</span>
              </div>
            )}
            <div className="connected-summary">
              <Icon name="signal" size={13} />
              <span>{selectedIntegrations.length} feedback stream{selectedIntegrations.length !== 1 ? "s" : ""}{includeManualEvidence ? " + manual batch" : ""} selected.</span>
            </div>
          </div>
        )}

        {step === 4 && streamMap && (
          <div className="onboard-pane">
            <div className="section-label">Problem map</div>
            <h1 className="onboard-title">This is not a feature request list.</h1>
            <p className="muted onboard-copy">This is a problem map with evidence strength. The team decides; Turako prepares the reasoning.</p>

            <div className="decision-brief">
              <div className="brief-hero">
                <div>
                  <div className="reco-eyebrow" style={{ marginBottom: 8 }}><span className="pulse" /> Strongest decision area</div>
                  <div className="brief-title">{streamMap.strongestProblem?.title || "Feedback streams need more evidence"}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>{streamMap.nextAction}</div>
                </div>
                <div className="brief-stat">
                  <span className="mono">{streamMap.signals.length}</span>
                  <small>signals</small>
                </div>
              </div>

              <div className="connected-evidence-summary">
                <div>
                  <span className="mono">{streamMap.connectedSources.length}</span>
                  <small>streams</small>
                </div>
                <div>
                  <span className="mono">{streamMap.clusters.length}</span>
                  <small>problem clusters</small>
                </div>
                <div>
                  <span className="mono">{streamMap.sourceCount}</span>
                  <small>sources read</small>
                </div>
              </div>

              <div className="brief-grid">
                <div className="brief-box">
                  <div className="section-label">Emerging problem clusters</div>
                  {streamMap.clusters.map((cluster) => (
                    <div key={cluster.title} className="problem-map-row">
                      <div>
                        <div className="row-title">{cluster.title}</div>
                        <div className="row-sub">
                          <Tag kind={cluster.evidenceStrength === "High" ? "accent" : cluster.evidenceStrength === "Low" ? "danger" : "warn"}>{cluster.evidenceStrength} evidence</Tag>
                          <span className="mono dim">{cluster.signalCount} signals</span>
                        </div>
                      </div>
                      <ConfidenceBar value={cluster.confidence} width={110} />
                    </div>
                  ))}
                </div>
                <div className="brief-box">
                  <div className="section-label">Strongest cluster detail</div>
                  {streamMap.clusters[0] && (
                    <div className="cluster-detail-list">
                      <div><span>Sources involved</span><strong>{streamMap.clusters[0].sourceCount}</strong></div>
                      <div><span>Customer diversity</span><strong>{streamMap.clusters[0].customerDiversity}</strong></div>
                      <div><span>Analytics support</span><strong>{streamMap.clusters[0].analyticsSupport}</strong></div>
                      <div><span>Suggested cheap test</span><strong>{streamMap.clusters[0].nextAction}</strong></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="brief-callouts">
                <div className="brief-callout warn">
                  <Tag kind="warn">risk</Tag>
                  <span>{streamMap.riskyArea}</span>
                </div>
                <div className="brief-callout">
                  <Tag>missing proof</Tag>
                  <span>{streamMap.missingEvidence}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row-flex onboard-actions">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>{step === 4 ? "Edit evidence" : "Back"}</button>}
          <span className="spacer" />
          {step < 4 ? (
            <button className="btn primary" disabled={!canContinue} onClick={goNext}>
              {step === 3 ? "Generate signal map" : "Continue"} <Icon name="arrow-right" size={13} />
            </button>
          ) : (
            <button className="btn primary" onClick={startWithBrief}>
              Open live decision workspace <Icon name="arrow-right" size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Landing, Onboarding });

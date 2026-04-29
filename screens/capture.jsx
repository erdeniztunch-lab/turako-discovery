// Capture screen — paste-to-process-to-problem flow

const FLAVORS = [
  { id: "interview", label: "Interview" },
  { id: "support", label: "Support" },
  { id: "sales", label: "Sales call" },
  { id: "analytics", label: "Analytics" },
  { id: "email", label: "Email" },
];

const EXAMPLES = {
  interview: "Maria from Acme said dashboards take too long to load on accounts above 200k events. They've been exporting to CSV every Friday for the last three weeks as a workaround.",
  support: "11 tickets this week mention 'dashboard slow' or 'timeout on funnel'. Two are from logo accounts (Northwind, Hooli). Recurring across the last three weeks.",
  sales: "Three of four enterprise prospects in Q2 brought up SSO + SAML during the demo. One said it's a procurement blocker.",
  analytics: "Onboarding completion fell from 64% to 51% week over week after the new event-mapping step shipped. Largest drop on step 3.",
  email: "Northwind asked again whether we plan to support custom cohorts. Their CSM noted they considered churning to a competitor in Q1.",
};

const IntegrationPanel = ({ integrations, connectIntegration, syncIntegration }) => (
  <div className="integration-grid" data-tour="integrations">
    {INTEGRATION_CATALOG.map((item) => {
      const state = integrations[item.id] || DEFAULT_INTEGRATIONS[item.id];
      const synced = state.status === "synced";
      const connected = state.status === "connected" || synced;
      return (
        <div key={item.id} className={`integration-card ${synced ? "synced" : ""}`}>
          <div className="integration-topline">
            <div>
              <div className="integration-name">{item.name}</div>
              <div className="integration-kind">{item.kind}</div>
            </div>
            <Tag kind={synced ? "accent" : connected ? "warn" : ""}>
              {synced ? "synced" : connected ? "connected" : "disconnected"}
            </Tag>
          </div>
          <p className="integration-copy">{item.description}</p>
          <div className="integration-actions">
            <button className="btn sm" disabled={connected} onClick={() => connectIntegration(item.id)}>
              {connected ? "Connected" : "Connect"}
            </button>
            <button className="btn primary sm" onClick={() => syncIntegration(item.id)}>
              {synced ? "Sync again" : "Sync now"}
            </button>
          </div>
          <div className="integration-foot mono">
            {state.lastSync ? `Last sync ${state.lastSync}` : "Frontend-only mock import"}
          </div>
        </div>
      );
    })}
  </div>
);

const CaptureView = ({ ws, setWs, navigateTo, integrations, connectIntegration, syncIntegration }) => {
  const [text, setText] = React.useState("");
  const [flavor, setFlavor] = React.useState("interview");
  const [showExample, setShowExample] = React.useState(false);
  const [captured, setCaptured] = React.useState(null); // { signalCount, signalIds }
  const [newProblemText, setNewProblemText] = React.useState("");
  const [linked, setLinked] = React.useState(null); // problem title after linking
  const [integrationsOpen, setIntegrationsOpen] = React.useState(false);

  const process = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const sourceId = `src-${Date.now()}`;
    const newSignals = extractSignalsFromText(trimmed, sourceId);
    const newSource = {
      id: sourceId,
      title: `${flavor[0].toUpperCase() + flavor.slice(1)} note — ${new Date().toLocaleDateString()}`,
      flavor,
      addedAt: new Date().toISOString().slice(0, 10),
      excerpt: trimmed.slice(0, 200),
      signals: newSignals.map((s) => s.id),
    };
    setWs({
      ...ws,
      sources: [newSource, ...ws.sources],
      signals: [...newSignals, ...ws.signals],
    });
    setCaptured({ signalCount: newSignals.length, signalIds: newSignals.map((s) => s.id) });
    setLinked(null);
    setNewProblemText("");
    setText("");
  };

  const linkToExisting = (problemId) => {
    const problem = ws.problems.find((p) => p.id === problemId);
    setWs({
      ...ws,
      signals: ws.signals.map((s) => captured.signalIds.includes(s.id) ? { ...s, problem: problemId } : s),
    });
    setLinked(problem.title);
  };

  const linkToNew = () => {
    if (!newProblemText.trim()) return;
    const probId = `prob-${Date.now()}`;
    const newProblem = {
      id: probId,
      title: newProblemText.trim(),
      summary: "",
      trend: "stable",
      impact: 5,
      opportunities: [],
    };
    setWs({
      ...ws,
      signals: ws.signals.map((s) => captured.signalIds.includes(s.id) ? { ...s, problem: probId } : s),
      problems: [...ws.problems, newProblem],
    });
    setLinked(newProblemText.trim());
  };

  const dismiss = () => {
    setCaptured(null);
    setLinked(null);
    setNewProblemText("");
  };

  const useExample = () => {
    setText(EXAMPLES[flavor] || "");
    setShowExample(false);
  };

  const renderMainCard = () => {
    if (!captured) {
      return (
        <div className="card">
          <div className="paste-area">
            <textarea
              className="paste-textarea"
              placeholder="Paste raw notes, tickets, transcript snippets, or analytics observations…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-tour="paste"
            />
            <div className="paste-toolbar">
              <span className="section-label" style={{ marginRight: 8 }}>Type</span>
              {FLAVORS.map((f) => (
                <button
                  key={f.id}
                  className={`flavor-chip ${flavor === f.id ? "active" : ""}`}
                  onClick={() => setFlavor(f.id)}
                >
                  {f.label}
                </button>
              ))}
              <span className="spacer" />
              <button className="btn ghost sm" onClick={() => setShowExample((v) => !v)}>
                {showExample ? "Hide example" : "See example"}
              </button>
              <button className="btn primary" onClick={process} disabled={!text.trim()}>
                Process <Icon name="arrow-right" size={13} />
              </button>
            </div>
            {showExample && (
              <div style={{ padding: "12px 14px", background: "var(--bg-elev-2)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text-muted)" }}>
                <div className="section-label" style={{ marginBottom: 6 }}>Example for {flavor}</div>
                "{EXAMPLES[flavor]}"
                <button className="btn sm" style={{ marginTop: 10 }} onClick={useExample}>Use this</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (linked) {
      return (
        <div className="card" style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 14, color: "var(--accent)" }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
            {captured.signalCount} signal{captured.signalCount !== 1 ? "s" : ""} linked to "{linked}"
          </div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 24 }}>
            They'll strengthen the confidence score as you add more evidence.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="btn primary" onClick={dismiss}>Capture another</button>
            <button className="btn ghost" onClick={() => { dismiss(); navigateTo("problems"); }}>Go to Problems</button>
          </div>
        </div>
      );
    }

    return (
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 16px 12px" }}>
          <div className="section-label" style={{ marginBottom: 4 }}>
            +{captured.signalCount} signal{captured.signalCount !== 1 ? "s" : ""} extracted
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Which problem does this support?</div>
          <div className="muted" style={{ fontSize: 13 }}>All signals will be linked to the problem you pick.</div>
        </div>

        <div style={{ maxHeight: 260, overflowY: "auto", borderTop: "1px solid var(--border)" }}>
          {ws.problems.length === 0 && (
            <div className="empty">No problems yet — create one below.</div>
          )}
          {ws.problems.map((p) => (
            <div
              key={p.id}
              className="row"
              style={{ cursor: "pointer" }}
              onClick={() => linkToExisting(p.id)}
            >
              <div>
                <div className="row-title">{p.title}</div>
                <div className="row-sub">
                  <span className="mono dim">{ws.signals.filter((s) => s.problem === p.id).length} signals</span>
                </div>
              </div>
              <Icon name="arrow-right" size={13} />
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <input
            autoFocus={ws.problems.length === 0}
            placeholder="New problem…"
            value={newProblemText}
            onChange={(e) => setNewProblemText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newProblemText.trim()) linkToNew(); }}
            style={{ flex: 1, padding: "8px 12px", background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13 }}
          />
          <button className="btn primary sm" disabled={!newProblemText.trim()} onClick={linkToNew}>Create</button>
        </div>

        <div style={{ padding: "0 16px 14px" }}>
          <button className="btn ghost sm" onClick={dismiss}>Not sure yet</button>
        </div>
      </div>
    );
  };

  return (
    <div className="page" data-tour="sources">
      <div className="page-header">
        <div>
          <h1 className="page-title">Capture</h1>
          <p className="page-sub">Paste a note, interview, ticket batch, or analytics observation. Turako extracts the signals.</p>
        </div>
      </div>

      {renderMainCard()}

      <div className="card flush">
        <div
          className="card-header"
          style={{ cursor: "pointer" }}
          onClick={() => setIntegrationsOpen((v) => !v)}
        >
          <h3 className="card-title">Connect tools</h3>
          <span className="mono dim" style={{ fontSize: 11 }}>{integrationsOpen ? "▲" : "▼"}</span>
        </div>
        {integrationsOpen && (
          <div style={{ padding: "0 16px 16px" }}>
            <IntegrationPanel
              integrations={integrations}
              connectIntegration={connectIntegration}
              syncIntegration={syncIntegration}
            />
          </div>
        )}
      </div>

      <div className="card flush">
        <div className="card-header">
          <h3 className="card-title">All sources <span className="muted-count">{ws.sources.length}</span></h3>
        </div>
        {ws.sources.length === 0 && (
          <div className="empty">No sources yet. Paste your first one above.</div>
        )}
        {ws.sources.map((s) => (
          <div key={s.id} className="row">
            <div>
              <div className="row-title">{s.title}</div>
              <div className="row-sub">
                <Tag>{s.flavor}</Tag>
                {s.integrationName && <Tag kind="accent">{s.integrationName}</Tag>}
                <span className="mono dim">{s.addedAt}</span>
                <span>·</span>
                <span className="mono dim">{ws.signals.filter((sig) => sig.source === s.id).length} signals</span>
              </div>
              <div style={{ marginTop: 6, color: "var(--text-muted)", fontSize: 12, maxWidth: 720, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.excerpt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { CaptureView, IntegrationPanel });

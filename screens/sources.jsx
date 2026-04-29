// Sources screen — paste-to-process flow

const FLAVORS = [
  { id: "interview", label: "Interview", soon: false },
  { id: "support", label: "Support", soon: false },
  { id: "sales", label: "Sales call", soon: false },
  { id: "analytics", label: "Analytics", soon: false },
  { id: "email", label: "Email", soon: false },
  { id: "intercom", label: "Intercom", soon: true },
];

const EXAMPLES = {
  interview: "Maria from Acme said dashboards take too long to load on accounts above 200k events. They've been exporting to CSV every Friday for the last three weeks as a workaround.",
  support: "11 tickets this week mention 'dashboard slow' or 'timeout on funnel'. Two are from logo accounts (Northwind, Hooli). Recurring across the last three weeks.",
  sales: "Three of four enterprise prospects in Q2 brought up SSO + SAML during the demo. One said it's a procurement blocker.",
  analytics: "Onboarding completion fell from 64% to 51% week over week after the new event-mapping step shipped. Largest drop on step 3.",
  email: "Northwind asked again whether we plan to support custom cohorts. Their CSM noted they considered churning to a competitor in Q1.",
};

const IntegrationPanel = ({ integrations, connectIntegration, syncIntegration, compact }) => (
  <div className={compact ? "integration-grid compact" : "integration-grid"} data-tour="integrations">
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

const SourcesView = ({ ws, setWs, navigateTo, integrations, connectIntegration, syncIntegration }) => {
  const [text, setText] = React.useState("");
  const [flavor, setFlavor] = React.useState("interview");
  const [title, setTitle] = React.useState("");
  const [showExample, setShowExample] = React.useState(false);
  const [lastImpact, setLastImpact] = React.useState(null);
  const [linking, setLinking] = React.useState(null);

  const process = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const sourceId = `src-${Date.now()}`;
    const newSignals = extractSignalsFromText(trimmed, sourceId);
    const newSource = {
      id: sourceId,
      title: title.trim() || `${flavor[0].toUpperCase() + flavor.slice(1)} note — ${new Date().toLocaleDateString()}`,
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
    setLastImpact({
      sourceId,
      signalCount: newSignals.length,
      observed: newSignals.filter((s) => s.type === "observed").length,
      strong: newSignals.filter((s) => s.strength === "strong").length,
      newSignals,
    });
    setText("");
    setTitle("");
  };

  const useExample = () => {
    setText(EXAMPLES[flavor] || "");
    setShowExample(false);
  };

  return (
    <div className="page" data-tour="sources">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sources</h1>
          <p className="page-sub">Connect mock tools or paste raw notes. Turako turns both into reviewable signals.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-kicker">Connected inputs</div>
        <div className="card-heading-row">
          <div>
            <h3 className="inline-title">Sync the tools your evidence already lives in</h3>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              These frontend-only integrations simulate how Turako will keep feedback, tickets, and analytics flowing without manual note entry.
            </p>
          </div>
        </div>
        <IntegrationPanel integrations={integrations} connectIntegration={connectIntegration} syncIntegration={syncIntegration} />
      </div>

      <div className="card">
        <div className="card-kicker">Manual input</div>
        <div className="paste-area">
          <input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid var(--border)",
              fontSize: 14,
              fontWeight: 500,
            }}
          />
          <textarea
            className="paste-textarea"
            placeholder="Paste raw notes, tickets, transcript snippets, or analytics observations…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            data-tour="paste"
          />
          <div className="paste-toolbar">
            <span className="section-label" style={{ marginRight: 8 }}>Flavor</span>
            {FLAVORS.map((f) => (
              <button
                key={f.id}
                className={`flavor-chip ${flavor === f.id && !f.soon ? "active" : ""}`}
                onClick={() => !f.soon && setFlavor(f.id)}
                disabled={f.soon}
                style={f.soon ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                {f.label}
                {f.soon && <span className="badge-soon">soon</span>}
              </button>
            ))}
            <span className="spacer" />
            <button className="btn ghost sm" onClick={() => setShowExample((v) => !v)}>
              {showExample ? "Hide example" : "See example"}
            </button>
            <button className="btn primary" onClick={process} disabled={!text.trim()}>
              Process source <Icon name="arrow-right" size={13} />
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

      {lastImpact && (
        <>
          <div className="impact-card">
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div className="impact-stat">
                <div className="impact-num">+{lastImpact.signalCount}</div>
                <div className="impact-label">New signals</div>
              </div>
              <div className="impact-stat">
                <div className="impact-num">{lastImpact.observed}</div>
                <div className="impact-label">Observed</div>
              </div>
              <div className="impact-stat">
                <div className="impact-num">{lastImpact.strong}</div>
                <div className="impact-label">Strong</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 16, paddingTop: 14 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>Which problem do these signals support?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {lastImpact.newSignals.map((sig) => {
                  const current = ws.signals.find((s) => s.id === sig.id);
                  const linked = current?.problem ? ws.problems.find((p) => p.id === current.problem) : null;
                  return (
                    <div key={sig.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg-elev-2)", borderRadius: "var(--radius)", padding: "8px 12px" }}>
                      <div style={{ flex: 1, fontSize: 13 }}>{sig.text}</div>
                      <div style={{ flexShrink: 0 }}>
                        {linked ? (
                          <Tag kind="accent"><Icon name="link" size={11} /> {linked.title.slice(0, 32)}{linked.title.length > 32 ? "…" : ""}</Tag>
                        ) : (
                          <button className="btn sm" onClick={() => setLinking(sig.id)}>Link →</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn ghost sm" onClick={() => setLastImpact(null)}>Dismiss</button>
              <button className="btn sm" onClick={() => { setLastImpact(null); navigateTo("signals"); }}>Review all signals</button>
            </div>
          </div>
          {linking && (
            <LinkModal
              ws={ws}
              setWs={setWs}
              onClose={() => setLinking(null)}
              onPick={(probId) => {
                setWs({ ...ws, signals: ws.signals.map((s) => s.id === linking ? { ...s, problem: probId } : s) });
                setLinking(null);
              }}
              bulk={false}
            />
          )}
        </>
      )}

      <div className="card flush">
        <div className="card-header">
          <h3 className="card-title">All sources <span className="muted-count">{ws.sources.length}</span></h3>
        </div>
        {ws.sources.length === 0 && (
          <div className="empty">
            No sources yet. Paste your first one above.
          </div>
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

Object.assign(window, { SourcesView, IntegrationPanel });

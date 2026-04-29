// Feedback streams screen - incoming evidence and suggested clustering

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
              <div className="integration-name">{STREAM_LABELS[item.id] || item.name}</div>
              <div className="integration-kind">{item.kind}</div>
            </div>
            <Tag kind={synced ? "accent" : connected ? "warn" : ""}>
              {synced ? "previewed" : connected ? "ready" : "example stream"}
            </Tag>
          </div>
          <p className="integration-copy">{item.description}</p>
          <div className="integration-actions">
            <button className="btn sm" disabled={connected} onClick={() => connectIntegration(item.id)}>
              {connected ? "Preview ready" : "Connect later"}
            </button>
            <button className="btn primary sm" onClick={() => syncIntegration(item.id)}>
              {synced ? "Preview again" : "Use example stream"}
            </button>
          </div>
          <div className="integration-foot mono">
            {state.lastSync ? `Last sync ${state.lastSync}` : "Frontend-only stream preview"}
          </div>
        </div>
      );
    })}
  </div>
);

const CaptureView = ({ ws, setWs, navigateTo, integrations, connectIntegration, syncIntegration }) => {
  const [text, setText] = React.useState("");
  const [flavor, setFlavor] = React.useState("support");
  const [showExample, setShowExample] = React.useState(false);
  const [captured, setCaptured] = React.useState(null);
  const [renames, setRenames] = React.useState({});
  const [integrationsOpen, setIntegrationsOpen] = React.useState(true);

  const connectedCount = Object.values(integrations).filter((item) => item.status === "connected" || item.status === "synced").length;
  const needsReviewCount = ws.signals.filter((signal) => signal.review === "needs_review").length;
  const noisyCount = ws.problems.filter((problem) => ws.signals.filter((signal) => signal.problem === problem.id).length <= 1).length;
  const clusteredShare = ws.signals.length ? Math.round((ws.signals.filter((signal) => signal.problem).length / ws.signals.length) * 100) : 0;

  const process = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const map = buildFeedbackStreamMap({
      product: ws.product,
      selectedSourceIds: [],
      decisionPressure: ws.product.focus || "Roadmap prioritization",
      manualEvidence: trimmed,
    });
    setWs({
      ...ws,
      sources: [...map.workspace.sources, ...ws.sources],
      signals: [...map.workspace.signals, ...ws.signals],
      problems: [...map.workspace.problems, ...ws.problems],
      opportunities: [...map.workspace.opportunities, ...ws.opportunities],
    });
    setCaptured(map);
    setText("");
  };

  const acceptCluster = (cluster) => {
    setWs((current) => ({
      ...current,
      signals: current.signals.map((signal) => cluster.signalIds.includes(signal.id) ? { ...signal, review: "accepted" } : signal),
    }));
  };

  const renameCluster = (cluster) => {
    const title = (renames[cluster.id] || "").trim();
    if (!title) return;
    setWs((current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === cluster.id ? { ...problem, title } : problem),
    }));
    setCaptured((current) => current ? {
      ...current,
      clusters: current.clusters.map((item) => item.id === cluster.id ? { ...item, title } : item),
    } : current);
    setRenames((current) => ({ ...current, [cluster.id]: "" }));
  };

  const requestMoreEvidence = (cluster) => {
    setWs((current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === cluster.id ? {
        ...problem,
        summary: `${problem.summary} More evidence requested: ${cluster.missingEvidence}`,
      } : problem),
    }));
  };

  const acceptAllClusters = () => {
    if (!captured) return;
    const ids = new Set(captured.signals.map((signal) => signal.id));
    setWs((current) => ({
      ...current,
      signals: current.signals.map((signal) => ids.has(signal.id) ? { ...signal, review: "accepted" } : signal),
    }));
  };

  const useExample = () => {
    setText(EXAMPLES[flavor] || "");
    setShowExample(false);
  };

  return (
    <div className="page" data-tour="sources">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incoming feedback stream review</h1>
          <p className="page-sub">Review incoming signals, suggested problem clusters, noisy areas, missing evidence, and PM actions.</p>
        </div>
      </div>

      <div className="grid cols-3">
        <div className="card stream-stat">
          <span className="meta-label">Connected streams</span>
          <strong className="mono">{connectedCount}</strong>
        </div>
        <div className="card stream-stat">
          <span className="meta-label">Needs review</span>
          <strong className="mono">{needsReviewCount}</strong>
        </div>
        <div className="card stream-stat">
          <span className="meta-label">Clustered signals</span>
          <strong className="mono">{clusteredShare}%</strong>
        </div>
      </div>

      <div className="card flush">
        <div className="card-header" style={{ cursor: "pointer" }} onClick={() => setIntegrationsOpen((value) => !value)}>
          <h3 className="card-title">Feedback stream previews</h3>
          <span className="mono dim" style={{ fontSize: 11 }}>{integrationsOpen ? "open" : "closed"}</span>
        </div>
        {integrationsOpen && (
          <div style={{ padding: "0 16px 16px" }}>
            <IntegrationPanel integrations={integrations} connectIntegration={connectIntegration} syncIntegration={syncIntegration} />
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-kicker">Manual batch</div>
        <div className="paste-area">
          <textarea
            className="paste-textarea"
            placeholder="Paste a few customer notes, tickets, or Slack threads..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            data-tour="paste"
          />
          <div className="paste-toolbar">
            <span className="section-label" style={{ marginRight: 8 }}>Batch type</span>
            {FLAVORS.map((item) => (
              <button key={item.id} className={`flavor-chip ${flavor === item.id ? "active" : ""}`} onClick={() => setFlavor(item.id)}>
                {item.label}
              </button>
            ))}
            <span className="spacer" />
            <button className="btn ghost sm" onClick={() => setShowExample((value) => !value)}>
              {showExample ? "Hide example" : "See example"}
            </button>
            <button className="btn primary" onClick={process} disabled={!text.trim()}>
              Cluster batch <Icon name="arrow-right" size={13} />
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

      {captured && (
        <div className="card flush">
          <div className="card-header">
            <h3 className="card-title">Problem map <span className="muted-count">{captured.clusters.length}</span></h3>
            <div className="row-flex">
              <button className="btn primary sm" onClick={acceptAllClusters}>Accept all</button>
              <button className="btn sm" onClick={() => navigateTo("signals")}>Review in Signals</button>
              <button className="btn ghost sm" onClick={() => setCaptured(null)}>Dismiss</button>
            </div>
          </div>
          <div className="aha-strip">This is not a feature request list. This is a problem map with evidence strength.</div>
          {captured.clusters.map((cluster) => (
            <div key={cluster.id} className="problem-cluster-card">
              <div className="problem-cluster-main">
                <div className="row-title">{cluster.title}</div>
                <div className="row-sub" style={{ flexWrap: "wrap" }}>
                  <Tag kind={cluster.evidenceStrength === "High" ? "accent" : cluster.evidenceStrength === "Low" ? "danger" : "warn"}>{cluster.evidenceStrength} evidence</Tag>
                  <span className="mono dim">{cluster.signalCount} signals</span>
                  <span>|</span>
                  <span className="mono dim">{cluster.sourceCount} streams</span>
                  <span>|</span>
                  <span className="mono dim">diversity {cluster.customerDiversity}</span>
                  <span>|</span>
                  <span className="mono dim">analytics {cluster.analyticsSupport}</span>
                  <span>|</span>
                  <Tag kind={cluster.risk === "Needs review" ? "" : "warn"}>{cluster.risk}</Tag>
                </div>
                <div className="cluster-test-line">
                  <span className="meta-label">Suggested cheap test</span>
                  <span>{cluster.nextAction}</span>
                </div>
                <div className="cluster-controls">
                  <input
                    value={renames[cluster.id] || ""}
                    onChange={(event) => setRenames((current) => ({ ...current, [cluster.id]: event.target.value }))}
                    placeholder="Rename cluster..."
                    className="cluster-rename-input"
                  />
                  <button className="btn sm" disabled={!(renames[cluster.id] || "").trim()} onClick={() => renameCluster(cluster)}>Rename</button>
                </div>
              </div>
              <div className="cluster-actions">
                <button className="btn primary sm" onClick={() => acceptCluster(cluster)}>Accept suggestion</button>
                <button className="btn sm" onClick={() => requestMoreEvidence(cluster)}>Request more evidence</button>
                <button className="btn sm" onClick={() => navigateTo("signals")}>Move signal</button>
                <button className="btn sm" onClick={() => navigateTo("opportunities", captured.workspace.opportunities[0]?.id)}>Create decision brief</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card flush">
        <div className="card-header">
          <h3 className="card-title">All sources <span className="muted-count">{ws.sources.length}</span></h3>
          {noisyCount > 0 && <Tag kind="warn">{noisyCount} noisy areas</Tag>}
        </div>
        {ws.sources.length === 0 && <div className="empty">No sources yet. Preview a stream or paste your first feedback batch above.</div>}
        {ws.sources.map((source) => (
          <div key={source.id} className="row">
            <div>
              <div className="row-title">{source.title}</div>
              <div className="row-sub">
                <Tag>{source.flavor}</Tag>
                {source.integrationName && <Tag kind="accent">{source.integrationName}</Tag>}
                <span className="mono dim">{source.addedAt}</span>
                <span>|</span>
                <span className="mono dim">{ws.signals.filter((signal) => signal.source === source.id).length} signals</span>
              </div>
              <div style={{ marginTop: 6, color: "var(--text-muted)", fontSize: 12, maxWidth: 720, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {source.excerpt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { CaptureView, IntegrationPanel });

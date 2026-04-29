// Signals screen - review AI-suggested clusters

const SignalsView = ({ ws, setWs }) => {
  const [filter, setFilter] = React.useState("all");
  const [linking, setLinking] = React.useState(null);
  const [selected, setSelected] = React.useState(new Set());

  const isNeedsReview = (signal) => signal.review === "needs_review";
  const isHighConfidence = (signal) => (signal.clusterConfidence || 0) >= 70;
  const isNoisy = (signal) => signal.review === "noise" || (!signal.problem && signal.review !== "accepted");

  const filtered = ws.signals.filter((signal) => {
    if (filter === "all") return true;
    if (filter === "needs-review") return isNeedsReview(signal);
    if (filter === "high-confidence") return isHighConfidence(signal);
    if (filter === "noisy") return isNoisy(signal);
    if (filter === "observed") return signal.type === "observed";
    return true;
  });

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const acceptSignals = (ids) => {
    setWs({
      ...ws,
      signals: ws.signals.map((signal) => ids.has(signal.id) ? { ...signal, review: "accepted" } : signal),
    });
    setSelected(new Set());
  };

  const markNoise = (ids) => {
    setWs({
      ...ws,
      signals: ws.signals.map((signal) => ids.has(signal.id) ? { ...signal, review: "noise", problem: null } : signal),
    });
    setSelected(new Set());
  };

  const moveSignals = (problemId) => {
    const ids = linking === "__bulk__" ? selected : new Set([linking]);
    setWs({
      ...ws,
      signals: ws.signals.map((signal) => ids.has(signal.id) ? { ...signal, problem: problemId, suggestedProblem: problemId, review: "accepted" } : signal),
    });
    setSelected(new Set());
    setLinking(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Signals</h1>
          <p className="page-sub">Review AI-suggested clusters. Accept what looks right, move what is wrong, or mark noise.</p>
        </div>
        <div className="row-flex">
          {selected.size > 0 && (
            <>
              <button className="btn primary sm" onClick={() => acceptSignals(selected)}>Accept suggestions</button>
              <button className="btn sm" onClick={() => setLinking("__bulk__")}>Move</button>
              <button className="btn danger sm" onClick={() => markNoise(selected)}>Mark noise</button>
            </>
          )}
        </div>
      </div>

      <div className="row-flex" style={{ gap: 6, flexWrap: "wrap" }}>
        {[
          { id: "all", label: "All", count: ws.signals.length },
          { id: "needs-review", label: "Needs review", count: ws.signals.filter(isNeedsReview).length },
          { id: "high-confidence", label: "High confidence", count: ws.signals.filter(isHighConfidence).length },
          { id: "noisy", label: "Noisy", count: ws.signals.filter(isNoisy).length },
          { id: "observed", label: "Observed", count: ws.signals.filter((signal) => signal.type === "observed").length },
        ].map((item) => (
          <button key={item.id} className={`flavor-chip ${filter === item.id ? "active" : ""}`} onClick={() => setFilter(item.id)}>
            {item.label} <span className="mono dim" style={{ fontSize: 11 }}>{item.count}</span>
          </button>
        ))}
      </div>

      <div className="card flush">
        {filtered.length === 0 && <div className="empty">No signals match this filter.</div>}
        {filtered.map((signal) => {
          const problem = ws.problems.find((item) => item.id === signal.problem);
          const source = ws.sources.find((item) => item.id === signal.source);
          const rowIds = new Set([signal.id]);
          return (
            <div key={signal.id} className="row" onClick={() => toggleSelect(signal.id)}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  checked={selected.has(signal.id)}
                  onChange={() => toggleSelect(signal.id)}
                  onClick={(event) => event.stopPropagation()}
                  style={{ marginTop: 4, accentColor: "var(--accent)" }}
                />
                <div style={{ minWidth: 0 }}>
                  <div className="row-title">{signal.text}</div>
                  <div className="row-sub" style={{ flexWrap: "wrap" }}>
                    <StrengthTag strength={signal.strength} />
                    <TypeTag type={signal.type} />
                    <span className="mono dim">{source?.integrationName || source?.flavor || "source"}</span>
                    {problem && <Tag kind="accent"><Icon name="link" size={11} /> {problem.title.slice(0, 34)}{problem.title.length > 34 ? "..." : ""}</Tag>}
                    {signal.review === "needs_review" && <Tag kind="warn">needs review</Tag>}
                    {signal.review === "accepted" && <Tag kind="accent">accepted</Tag>}
                    {signal.review === "noise" && <Tag kind="danger">noise</Tag>}
                    {(signal.clusterConfidence || 0) > 0 && <span className="mono dim">{signal.clusterConfidence} confidence</span>}
                  </div>
                </div>
              </div>
              <div className="row-flex" onClick={(event) => event.stopPropagation()}>
                {signal.review !== "accepted" && problem && (
                  <button className="btn primary sm" onClick={() => acceptSignals(rowIds)}>Accept</button>
                )}
                <button className="btn sm" onClick={() => setLinking(signal.id)}>Move</button>
                <button className="btn ghost sm" onClick={() => markNoise(rowIds)}>Noise</button>
              </div>
            </div>
          );
        })}
      </div>

      {linking && (
        <LinkModal
          ws={ws}
          setWs={setWs}
          onClose={() => setLinking(null)}
          onPick={moveSignals}
          bulk={linking === "__bulk__"}
        />
      )}
    </div>
  );
};

Object.assign(window, { SignalsView });

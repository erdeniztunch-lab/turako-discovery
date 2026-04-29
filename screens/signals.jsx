// Signals screen with linking modal

const SignalsView = ({ ws, setWs }) => {
  const [filter, setFilter] = React.useState("all");
  const [linking, setLinking] = React.useState(null); // signal id
  const [selected, setSelected] = React.useState(new Set());

  const filtered = ws.signals.filter((s) => {
    if (filter === "all") return true;
    if (filter === "unlinked") return !s.problem;
    if (filter === "observed") return s.type === "observed";
    if (filter === "strong") return s.strength === "strong";
    return true;
  });

  const linkOne = (signalId, problemId) => {
    setWs({
      ...ws,
      signals: ws.signals.map((s) => s.id === signalId ? { ...s, problem: problemId } : s),
    });
    setLinking(null);
  };

  const toggleSelect = (id) => {
    const ns = new Set(selected);
    if (ns.has(id)) ns.delete(id); else ns.add(id);
    setSelected(ns);
  };

  const bulkLink = (problemId) => {
    setWs({
      ...ws,
      signals: ws.signals.map((s) => selected.has(s.id) ? { ...s, problem: problemId } : s),
    });
    setSelected(new Set());
    setLinking(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Signals</h1>
          <p className="page-sub">Review extracted evidence. Link signals to the problem they support.</p>
        </div>
        <div className="row-flex">
          {selected.size > 0 && (
            <button className="btn primary sm" onClick={() => setLinking("__bulk__")}>
              Link {selected.size} to problem
            </button>
          )}
        </div>
      </div>

      <div className="row-flex" style={{ gap: 6 }}>
        {[
          { id: "all", label: "All", count: ws.signals.length },
          { id: "unlinked", label: "Unlinked", count: ws.signals.filter((s) => !s.problem).length },
          { id: "observed", label: "Observed", count: ws.signals.filter((s) => s.type === "observed").length },
          { id: "strong", label: "Strong", count: ws.signals.filter((s) => s.strength === "strong").length },
        ].map((f) => (
          <button key={f.id} className={`flavor-chip ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label} <span className="mono dim" style={{ fontSize: 11 }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className="card flush">
        {filtered.length === 0 && <div className="empty">No signals match this filter.</div>}
        {filtered.map((s) => {
          const prob = ws.problems.find((p) => p.id === s.problem);
          const src = ws.sources.find((x) => x.id === s.source);
          return (
            <div key={s.id} className="row" onClick={() => toggleSelect(s.id)}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggleSelect(s.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: 4, accentColor: "var(--accent)" }}
                />
                <div style={{ minWidth: 0 }}>
                  <div className="row-title">{s.text}</div>
                  <div className="row-sub" style={{ flexWrap: "wrap" }}>
                    <StrengthTag strength={s.strength} />
                    <span className="mono dim">{s.addedAt}</span>
                    <span>·</span>
                    <span className="dim">from {src?.title || "source"}</span>
                  </div>
                </div>
              </div>
              <div className="row-flex">
                {prob ? (
                  <Tag kind="accent"><Icon name="link" size={11} /> {prob.title.slice(0, 36)}{prob.title.length > 36 ? "…" : ""}</Tag>
                ) : (
                  <button className="btn sm" onClick={(e) => { e.stopPropagation(); setLinking(s.id); }}>
                    Link to problem
                  </button>
                )}
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
          onPick={(probId) => {
            if (linking === "__bulk__") bulkLink(probId);
            else linkOne(linking, probId);
          }}
          bulk={linking === "__bulk__"}
        />
      )}
    </div>
  );
};

Object.assign(window, { SignalsView });

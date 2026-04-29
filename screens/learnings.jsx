// Learnings screen — decision outcomes fed back into confidence

const LearningsView = ({ ws }) => (
  <div className="page">
    <div className="page-header">
      <div>
        <h1 className="page-title">Learnings</h1>
        <p className="page-sub">Outcomes from decisions, fed back into confidence.</p>
      </div>
    </div>
    <div className="card flush">
      {ws.learnings.length === 0 && <div className="empty">No learnings yet.</div>}
      {ws.learnings.map((l) => {
        const dec = ws.decisions.find((d) => d.id === l.decision);
        return (
          <div key={l.id} className="row">
            <div>
              <div className="row-title">{l.note}</div>
              <div className="row-sub">
                <Tag kind={l.outcome === "validated" ? "accent" : l.outcome === "invalidated" ? "danger" : "warn"}>{l.outcome}</Tag>
                <span className="dim">→ {dec?.title || "decision"}</span>
                <span>·</span>
                <span className="mono dim">{l.addedAt}</span>
              </div>
            </div>
            <span className="mono" style={{ color: l.confidenceDelta >= 0 ? "var(--accent)" : "var(--danger)" }}>
              {l.confidenceDelta >= 0 ? "+" : ""}{l.confidenceDelta}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

Object.assign(window, { LearningsView });

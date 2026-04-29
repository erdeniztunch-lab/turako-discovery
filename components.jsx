// Shared components: icons, tags, confidence bar, etc.

const Icon = ({ name, size = 14 }) => {
  const s = size;
  const p = { width: s, height: s, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home": return <svg {...p}><path d="M2 7l6-5 6 5v7H2V7z"/><path d="M6 14V9h4v5"/></svg>;
    case "source": return <svg {...p}><rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/><path d="M5 6h6M5 8.5h6M5 11h4"/></svg>;
    case "signal": return <svg {...p}><path d="M2 10l3-4 3 3 6-6"/><path d="M14 3v4M14 3h-4"/></svg>;
    case "problem": return <svg {...p}><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11v.01"/></svg>;
    case "opportunity": return <svg {...p}><path d="M8 1.5l1.8 4.4 4.7.4-3.6 3.1 1.1 4.6L8 11.6 4 14l1.1-4.6L1.5 6.3l4.7-.4L8 1.5z"/></svg>;
    case "decision": return <svg {...p}><path d="M3 8l3 3 7-7"/></svg>;
    case "learning": return <svg {...p}><path d="M2 4l6-2 6 2v6l-6 4-6-4V4z"/><path d="M8 8v6"/></svg>;
    case "settings": return <svg {...p}><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"/></svg>;
    case "search": return <svg {...p}><circle cx="7" cy="7" r="4.5"/><path d="M11 11l3 3"/></svg>;
    case "arrow-right": return <svg {...p}><path d="M3 8h10M9 4l4 4-4 4"/></svg>;
    case "arrow-up": return <svg {...p}><path d="M8 13V3M4 7l4-4 4 4"/></svg>;
    case "arrow-down": return <svg {...p}><path d="M8 3v10M4 9l4 4 4-4"/></svg>;
    case "minus": return <svg {...p}><path d="M3 8h10"/></svg>;
    case "plus": return <svg {...p}><path d="M8 3v10M3 8h10"/></svg>;
    case "check": return <svg {...p}><path d="M3 8l3 3 7-7"/></svg>;
    case "x": return <svg {...p}><path d="M4 4l8 8M12 4l-8 8"/></svg>;
    case "warn": return <svg {...p}><path d="M8 2l6.5 11h-13L8 2z"/><path d="M8 7v3M8 11.5v.01"/></svg>;
    case "sparkle": return <svg {...p}><path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M4 12l2-2M10 6l2-2"/></svg>;
    case "play": return <svg {...p}><path d="M5 3l8 5-8 5V3z" fill="currentColor"/></svg>;
    case "info": return <svg {...p}><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5v.01"/></svg>;
    case "help": return <svg {...p}><circle cx="8" cy="8" r="6"/><path d="M6.4 6.2A1.8 1.8 0 018 5.2c1 0 1.8.6 1.8 1.5 0 .8-.5 1.2-1.1 1.6-.5.3-.7.7-.7 1.2"/><path d="M8 11.8v.01"/></svg>;
    case "more": return <svg {...p}><circle cx="3.5" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12.5" cy="8" r="1" fill="currentColor"/></svg>;
    case "clock": return <svg {...p}><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2 1.5"/></svg>;
    case "chevron-right": return <svg {...p}><path d="M6 3l5 5-5 5"/></svg>;
    case "link": return <svg {...p}><path d="M7 9a3 3 0 003 3h2a3 3 0 100-6h-1"/><path d="M9 7a3 3 0 00-3-3H4a3 3 0 100 6h1"/></svg>;
    default: return null;
  }
};

const Trend = ({ trend }) => {
  const map = { rising: "↑", stable: "—", declining: "↓" };
  return <span className={`trend ${trend}`}>{map[trend]} {trend}</span>;
};

const ConfidenceBar = ({ value, showLabel = true, width }) => {
  const cls = value < 35 ? "low" : value < 65 ? "warn" : "";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, width: width || "100%" }}>
      <div className={`confidence-bar ${cls}`} style={{ flex: 1 }}>
        <span style={{ width: `${value}%` }} />
      </div>
      {showLabel && <span className="mono dim" style={{ fontSize: 11, minWidth: 28, textAlign: "right" }}>{value}</span>}
    </div>
  );
};

const Tag = ({ children, kind }) => <span className={`tag ${kind || ""}`}>{children}</span>;

const StatusTag = ({ status }) => {
  const map = {
    build: { label: "build", kind: "accent" },
    test: { label: "test", kind: "warn" },
    watch: { label: "watch", kind: "" },
    drop: { label: "drop", kind: "danger" },
  };
  const m = map[status] || { label: status, kind: "" };
  return <Tag kind={m.kind}>{m.label}</Tag>;
};

const StrengthTag = ({ strength }) => (
  <Tag kind={strength === "strong" ? "accent" : strength === "weak" ? "danger" : "warn"}>
    {strength}
  </Tag>
);

const TypeTag = ({ type }) => (
  <Tag>{type}</Tag>
);

const ReadinessTag = ({ readiness }) => {
  const m = { ready: "accent", validate: "warn", explore: "" };
  return <Tag kind={m[readiness]}>{readiness}</Tag>;
};

const LinkModal = ({ ws, setWs, onClose, onPick, bulk }) => {
  const [newProb, setNewProb] = React.useState("");
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">{bulk ? "Link selected signals to a problem" : "Link signal to a problem"}</h3>
        </div>
        <div className="modal-body">
          <div className="section-label" style={{ marginBottom: 8 }}>Existing problems</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ws.problems.length === 0 && <div className="empty" style={{ padding: "8px 0" }}>No problems yet — create one below.</div>}
            {ws.problems.map((p) => (
              <button
                key={p.id}
                className="row"
                style={{ borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 4 }}
                onClick={() => onPick(p.id)}
              >
                <div style={{ textAlign: "left" }}>
                  <div className="row-title">{p.title}</div>
                  <div className="row-sub">
                    <Trend trend={p.trend} />
                    <span>·</span>
                    <span className="mono">{ws.signals.filter((s) => s.problem === p.id).length} signals</span>
                  </div>
                </div>
                <Icon name="arrow-right" size={13} />
              </button>
            ))}
          </div>
          <div className="section-label" style={{ marginTop: 18, marginBottom: 8 }}>Or create a new problem</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              autoFocus={ws.problems.length === 0}
              placeholder="New problem title…"
              value={newProb}
              onChange={(e) => setNewProb(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newProb.trim()) e.currentTarget.nextElementSibling?.click();
              }}
              style={{ flex: 1, padding: "8px 12px", background: "var(--bg-elev-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}
            />
            <button
              className="btn primary"
              disabled={!newProb.trim()}
              onClick={() => {
                const id = `prob-${Date.now()}`;
                const newP = {
                  id, title: newProb.trim(),
                  summary: "Created from signal review.",
                  trend: "stable", impact: 5,
                  addedAt: new Date().toISOString().slice(0, 10),
                  opportunities: [],
                };
                setWs({ ...ws, problems: [...ws.problems, newP] });
                setTimeout(() => onPick(id), 50);
              }}
            >
              Create & link
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Icon, Trend, ConfidenceBar, Tag, StatusTag, StrengthTag, TypeTag, ReadinessTag, LinkModal });

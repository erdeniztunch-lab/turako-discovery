// Sidebar + Topbar shell

const PRIMARY_NAV = [
  { id: "home", label: "Home", icon: "home" },
  { id: "capture", label: "Capture", icon: "source", countKey: "sources" },
  { id: "problems", label: "Problems", icon: "problem", countKey: "problems" },
  { id: "decisions", label: "Decisions", icon: "decision", countKey: "decisions" },
];

const SECONDARY_NAV = [
  { id: "signals", label: "Signals", icon: "signal", countKey: "signals" },
  { id: "opportunities", label: "Opportunities", icon: "opportunity", countKey: "opportunities" },
  { id: "learnings", label: "Learnings", icon: "learning", countKey: "learnings" },
];

const Sidebar = ({ route, setRoute, ws, onOpenSearch, isSample }) => (
  <aside className="sidebar" data-tour="sidebar">
    <div className="sidebar-brand">
      <div className="brandmark">T</div>
      <div className="brand-name">Turako</div>
    </div>

    <div className="sidebar-section-label">Workspace</div>
    {PRIMARY_NAV.map((item) => (
      <button
        key={item.id}
        data-tour={`nav-${item.id}`}
        className={`nav-item ${route === item.id ? "active" : ""}`}
        onClick={() => setRoute(item.id)}
      >
        <span className="nav-icon"><Icon name={item.icon} /></span>
        <span>{item.label}</span>
        {item.countKey && ws[item.countKey].length > 0 && (
          <span className="nav-count">{ws[item.countKey].length}</span>
        )}
      </button>
    ))}

    <div className="sidebar-section-label" style={{ marginTop: 16 }}>Pipeline detail</div>
    {SECONDARY_NAV.map((item) => (
      <button
        key={item.id}
        data-tour={`nav-${item.id}`}
        className={`nav-item ${route === item.id ? "active" : ""}`}
        onClick={() => setRoute(item.id)}
        style={{ opacity: 0.72 }}
      >
        <span className="nav-icon"><Icon name={item.icon} /></span>
        <span>{item.label}</span>
        {item.countKey && ws[item.countKey].length > 0 && (
          <span className="nav-count">{ws[item.countKey].length}</span>
        )}
      </button>
    ))}

    <div className="sidebar-section-label" style={{ marginTop: 16 }}>System</div>
    <button className={`nav-item ${route === "settings" ? "active" : ""}`} onClick={() => setRoute("settings")}>
      <span className="nav-icon"><Icon name="settings" /></span>
      <span>Settings</span>
    </button>

    <div className="sidebar-footer">
      <div className="workspace-pill">
        <span className="dot" />
        <span>{ws.product.name || "Untitled"}</span>
        {isSample && <span className="mono" style={{ marginLeft: "auto", fontSize: 10 }}>SAMPLE</span>}
      </div>
    </div>
  </aside>
);

const Topbar = ({ route, onOpenSearch, onStartTour }) => {
  const labels = {
    home: "Home", capture: "Capture", signals: "Signals", problems: "Problems",
    opportunities: "Opportunities", decisions: "Decisions", learnings: "Learnings", settings: "Settings",
  };
  return (
    <header className="topbar">
      <div className="crumbs">
        <span>Turako</span>
        <span className="sep">/</span>
        <span className="here">{labels[route]}</span>
      </div>
      <button className="topbar-search" onClick={onOpenSearch} data-tour="search">
        <Icon name="search" size={13} />
        <span>Search signals, problems, decisions…</span>
        <span className="kbd">⌘K</span>
      </button>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={onStartTour} title="Help and product tour" aria-label="Help and product tour">
          <Icon name="help" size={14} />
        </button>
      </div>
    </header>
  );
};

// App-level overlays — search and guided tour

const SearchModal = ({ ws, onClose, navigateTo }) => {
  const [q, setQ] = React.useState("");
  const [focus, setFocus] = React.useState(0);
  const items = React.useMemo(() => {
    const all = [
      ...ws.problems.map((p) => ({ kind: "problem", id: p.id, label: p.title, sub: "Problem" })),
      ...ws.opportunities.map((o) => ({ kind: "opportunity", id: o.id, label: o.title, sub: "Opportunity" })),
      ...ws.decisions.map((d) => ({ kind: "decision", id: d.id, label: d.title, sub: `Decision · ${d.status}` })),
      ...ws.signals.map((s) => ({ kind: "signal", id: s.id, label: s.text, sub: `Signal · ${s.type}` })),
      ...ws.sources.map((s) => ({ kind: "source", id: s.id, label: s.title, sub: `Source · ${s.flavor}` })),
    ];
    if (!q.trim()) return all.slice(0, 8);
    const lc = q.toLowerCase();
    return all.filter((i) => i.label.toLowerCase().includes(lc)).slice(0, 12);
  }, [q, ws]);

  const go = (item) => {
    const map = { problem: "problems", opportunity: "opportunities", decision: "decisions", signal: "signals", source: "capture" };
    navigateTo(map[item.kind], item.id);
    onClose();
  };

  return (
    <div className="search-bg" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="search-input"
          placeholder="Search signals, problems, decisions…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setFocus(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { setFocus((f) => Math.min(items.length - 1, f + 1)); e.preventDefault(); }
            if (e.key === "ArrowUp") { setFocus((f) => Math.max(0, f - 1)); e.preventDefault(); }
            if (e.key === "Enter" && items[focus]) go(items[focus]);
          }}
        />
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {items.length === 0 && <div className="empty">No results</div>}
          {items.map((it, i) => (
            <div key={it.kind + it.id} className={`search-result ${i === focus ? "focused" : ""}`} onClick={() => go(it)}>
              <div>
                <div className="row-title">{it.label}</div>
                <div className="row-sub mono dim" style={{ fontSize: 11 }}>{it.sub}</div>
              </div>
              <Icon name="arrow-right" size={13} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TOUR_STEPS = [
  { selector: '[data-tour="reco"]', title: "Home is the decision surface", body: "Turako starts with one recommended next move, backed by confidence, impact, and trend.", placement: "bottom", route: "home" },
  { selector: '[data-tour="nav-capture"]', title: "Capture is your evidence inbox", body: "Paste a note, ticket batch, or analytics observation. Turako extracts signals and asks which problem they support.", placement: "right", route: "home" },
  { selector: '[data-tour="integrations"]', title: "Connect your tools", body: "HubSpot, Zendesk, and Google Analytics are simulated here as frontend-only imports that feed the same signal pipeline.", placement: "bottom", route: "capture" },
  { selector: '[data-tour="sidebar"]', title: "The loop stays traceable", body: "Capture → Problem → Decision. Each artifact is linked end-to-end so you can explain every call.", placement: "right", route: "home" },
  { selector: '[data-tour="search"]', title: "Find and replay anytime", body: "Use search for any artifact. The help button replays this guide without touching your workspace data.", placement: "bottom", route: "home" },
];

const TourOverlay = ({ step, onNext, onPrev, onClose, total, demoActive }) => {
  const [rect, setRect] = React.useState(null);
  React.useEffect(() => {
    const update = () => {
      const el = document.querySelector(step.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
      } else {
        setRect(null);
      }
    };
    update();
    const t = setTimeout(update, 50);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("resize", update); clearTimeout(t); };
  }, [step]);

  const cardPos = React.useMemo(() => {
    if (!rect) return { top: 80, left: 80 };
    const placement = step.placement || "bottom";
    if (placement === "right") return { top: rect.top, left: rect.left + rect.width + 16 };
    if (placement === "left") return { top: rect.top, left: Math.max(20, rect.left - 320 - 16) };
    return { top: rect.top + rect.height + 16, left: Math.max(20, rect.left) };
  }, [rect, step]);

  return (
    <div className="tour-overlay">
      <div className="tour-mask" onClick={onClose} />
      {rect && <div className="tour-spotlight" style={rect} />}
      <div className="tour-card" style={cardPos}>
        <div className="tour-step-label">Step {step.idx + 1} / {total}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{step.title}</div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>{step.body}</div>
        {demoActive && step.idx === total - 1 && (
          <div className="tour-finish-note">
            Finish or skip clears the demo data so you can start with an empty workspace.
          </div>
        )}
        <div className="row-flex">
          <button className="btn ghost sm" onClick={onClose}>Skip</button>
          <span className="spacer" />
          {step.idx > 0 && <button className="btn sm" onClick={onPrev}>Back</button>}
          <button className="btn primary sm" onClick={onNext}>{step.idx === total - 1 ? "Done" : "Next"}</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Sidebar, Topbar, SearchModal, TOUR_STEPS, TourOverlay });

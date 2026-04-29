// Problems, Opportunities, Decisions — the core pipeline screens

const ProblemsView = ({ ws, setWs, navigateTo, focusedId, clearFocus }) => {
  const items = ws.problems.map((p) => {
    const probSignals = ws.signals.filter((s) => s.problem === p.id);
    const lastEvidence = probSignals.reduce((max, s) => (s.addedAt > max ? s.addedAt : max), "");
    const sourceCount = new Set(probSignals.map((s) => s.source)).size;
    const openDecision = ws.decisions.find(
      (d) => d.status !== "drop" && p.opportunities.some((oId) => {
        const o = ws.opportunities.find((o) => o.id === oId);
        return o && o.decision === d.id;
      })
    );
    return {
      ...p,
      conf: computeConfidence(p, ws.signals, ws.learnings, ws.decisions),
      sigCount: probSignals.length,
      lastEvidence,
      sourceCount,
      openDecision,
    };
  });
  const [openId, setOpenId] = React.useState(focusedId || null);
  React.useEffect(() => { if (focusedId) setOpenId(focusedId); }, [focusedId]);

  const open = items.find((p) => p.id === openId);

  if (open) {
    return <ProblemDetail problem={open} ws={ws} setWs={setWs} onBack={() => { setOpenId(null); clearFocus && clearFocus(); }} navigateTo={navigateTo} />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Problems</h1>
          <p className="page-sub">Recurring patterns that may be worth acting on.</p>
        </div>
      </div>
      <div className="card flush">
        {items.length === 0 && <div className="empty">No problems yet. Link signals to create one.</div>}
        {items.map((p) => (
          <div key={p.id} className="row" onClick={() => setOpenId(p.id)}>
            <div>
              <div className="row-title">{p.title}</div>
              <div className="row-sub" style={{ flexWrap: "wrap" }}>
                <Trend trend={p.trend} />
                <span>·</span>
                <span className="mono">{p.sigCount} signal{p.sigCount !== 1 ? "s" : ""}{p.sourceCount > 1 ? ` from ${p.sourceCount} sources` : ""}</span>
                {p.lastEvidence && <><span>·</span><span className="mono dim">last {p.lastEvidence}</span></>}
                {p.openDecision && <><span>·</span><Tag kind="accent">↗ {p.openDecision.status}</Tag></>}
              </div>
            </div>
            <ConfidenceBar value={p.conf} width={120} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ProblemDetail = ({ problem, ws, setWs, onBack, navigateTo }) => {
  const signals = ws.signals.filter((s) => s.problem === problem.id);
  const opps = ws.opportunities.filter((o) => o.problem === problem.id);
  const conf = computeConfidence(problem, ws.signals, ws.learnings, ws.decisions);
  const [framing, setFraming] = React.useState("");

  const makeDecision = () => {
    if (!framing.trim()) return;
    const oppId = `opp-${Date.now()}`;
    const decId = `dec-${Date.now()}`;
    const newOpp = {
      id: oppId, title: framing.trim(),
      framing: framing.trim(),
      problem: problem.id, readiness: "ready", decision: decId,
    };
    const newDec = {
      id: decId, title: framing.trim(), status: "build",
      opportunity: oppId,
      addedAt: new Date().toISOString().slice(0, 10),
      lastReview: new Date().toISOString().slice(0, 10),
      learnings: [], note: "",
    };
    setWs({
      ...ws,
      opportunities: [...ws.opportunities, newOpp],
      decisions: [newDec, ...ws.decisions],
      problems: ws.problems.map((p) => p.id === problem.id ? { ...p, opportunities: [...p.opportunities, oppId] } : p),
    });
    setFraming("");
    setTimeout(() => navigateTo("decisions", decId), 100);
  };

  return (
    <div className="page">
      <div>
        <button className="btn ghost sm" onClick={onBack}>← Problems</button>
      </div>
      <div className="page-header">
        <div>
          <div className="section-label">Problem</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>{problem.title}</h1>
          <p className="page-sub">{problem.summary}</p>
        </div>
      </div>

      <div className="detail">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card flush">
            <div className="card-header">
              <h3 className="card-title">Supporting signals <span className="muted-count">{signals.length}</span></h3>
            </div>
            {signals.map((s) => (
              <div key={s.id} className="row dense">
                <div>
                  <div className="row-title">{s.text}</div>
                  <div className="row-sub">
                    <StrengthTag strength={s.strength} />
                  </div>
                </div>
              </div>
            ))}
            {signals.length === 0 && <div className="empty">No signals linked.</div>}
          </div>

          <div className="card flush">
            <div className="card-header">
              <h3 className="card-title">Opportunities <span className="muted-count">{opps.length}</span></h3>
            </div>
            {opps.map((o) => (
              <div key={o.id} className="row" onClick={() => navigateTo("opportunities", o.id)}>
                <div>
                  <div className="row-title">{o.title}</div>
                  <div className="row-sub">
                    <ReadinessTag readiness={o.readiness} />
                    {o.decision && <Tag kind="accent">→ decision</Tag>}
                  </div>
                </div>
                <Icon name="chevron-right" size={13} />
              </div>
            ))}
            <div style={{ padding: 14, display: "flex", gap: 8 }}>
              <input
                placeholder="What's the decision?"
                value={framing}
                onChange={(e) => setFraming(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && framing.trim()) makeDecision(); }}
                style={{ flex: 1, padding: "8px 12px", background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
              />
              <button className="btn primary" disabled={!framing.trim()} onClick={makeDecision}>Decide</button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card">
            <div className="section-label" style={{ marginBottom: 14 }}>Health</div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div className="meta-label" style={{ marginBottom: 6 }}>Confidence</div>
                <ConfidenceBar value={conf} />
              </div>
              <div className="meta-row"><span className="meta-label">Trend</span><Trend trend={problem.trend} /></div>
              <div className="meta-row"><span className="meta-label">Impact</span><span className="meta-value mono">{problem.impact}/10</span></div>
              <div className="meta-row"><span className="meta-label">Sources</span>
                <span className="meta-value mono">{new Set(signals.map((s) => s.source)).size}</span>
              </div>
              <div className="meta-row"><span className="meta-label">Evidence types</span>
                <span className="meta-value mono">{new Set(signals.map((s) => s.type)).size}/3</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="section-label" style={{ marginBottom: 12 }}>Trace</div>
            <div className="trace">
              <div className="trace-step"><div className="trace-bullet active">1</div><div><div className="trace-label">Sources</div><div className="trace-content">{new Set(signals.map((s) => s.source)).size}</div></div></div>
              <div className="trace-step"><div className="trace-bullet active">2</div><div><div className="trace-label">Signals</div><div className="trace-content">{signals.length}</div></div></div>
              <div className="trace-step"><div className="trace-bullet active">3</div><div><div className="trace-label">Problem</div><div className="trace-content">{problem.title}</div></div></div>
              <div className="trace-step"><div className={`trace-bullet ${opps.length ? "active" : ""}`}>4</div><div><div className="trace-label">Opportunities</div><div className="trace-content">{opps.length}</div></div></div>
              <div className="trace-step"><div className={`trace-bullet ${opps.some((o) => o.decision) ? "active" : ""}`}>5</div><div><div className="trace-label">Decisions</div><div className="trace-content">{opps.filter((o) => o.decision).length}</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OpportunitiesView = ({ ws, setWs, navigateTo, focusedId, clearFocus }) => {
  const promote = (oppId) => {
    const opp = ws.opportunities.find((o) => o.id === oppId);
    if (!opp || opp.decision) return;
    const decId = `dec-${Date.now()}`;
    const newDec = {
      id: decId, title: opp.title, status: "build",
      opportunity: oppId,
      addedAt: new Date().toISOString().slice(0, 10),
      lastReview: new Date().toISOString().slice(0, 10),
      learnings: [], note: "Promoted from opportunity.",
    };
    setWs({
      ...ws,
      decisions: [newDec, ...ws.decisions],
      opportunities: ws.opportunities.map((o) => o.id === oppId ? { ...o, decision: decId } : o),
    });
    setTimeout(() => navigateTo("decisions", decId), 100);
  };
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Opportunities</h1>
          <p className="page-sub">Possible product responses derived from problems. Promote one when you're ready.</p>
        </div>
      </div>
      <div className="card flush">
        {ws.opportunities.length === 0 && <div className="empty">No opportunities yet.</div>}
        {ws.opportunities.map((o) => {
          const prob = ws.problems.find((p) => p.id === o.problem);
          return (
            <div key={o.id} className={`row ${focusedId === o.id ? "flash" : ""}`}>
              <div>
                <div className="row-title">{o.title}</div>
                <div className="row-sub" style={{ flexWrap: "wrap" }}>
                  <ReadinessTag readiness={o.readiness} />
                  <span className="dim">→ {prob?.title}</span>
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6, maxWidth: 720 }}>{o.framing}</div>
              </div>
              <div className="row-flex">
                {o.decision ? (
                  <button className="btn sm" onClick={() => navigateTo("decisions", o.decision)}>View decision →</button>
                ) : (
                  <button className="btn primary sm" onClick={() => promote(o.id)}>Promote to decision</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DecisionsView = ({ ws, setWs, navigateTo, focusedId, clearFocus }) => {
  const [openId, setOpenId] = React.useState(focusedId || null);
  const [expandedId, setExpandedId] = React.useState(null);
  const [logOutcome, setLogOutcome] = React.useState("validated");
  const [logNote, setLogNote] = React.useState("");

  React.useEffect(() => { if (focusedId) setOpenId(focusedId); }, [focusedId]);
  const open = ws.decisions.find((d) => d.id === openId);

  const setStatus = (id, status) => {
    setWs({
      ...ws,
      decisions: ws.decisions.map((d) => d.id === id ? { ...d, status, lastReview: new Date().toISOString().slice(0, 10) } : d),
    });
  };

  const logLearning = (decisionId) => {
    if (!logNote.trim()) return;
    const id = `lrn-${Date.now()}`;
    const delta = { validated: 12, mixed: 0, invalidated: -15 }[logOutcome];
    const newL = { id, decision: decisionId, outcome: logOutcome, note: logNote.trim(), addedAt: new Date().toISOString().slice(0, 10), confidenceDelta: delta };
    setWs({
      ...ws,
      learnings: [newL, ...ws.learnings],
      decisions: ws.decisions.map((d) => d.id === decisionId ? { ...d, learnings: [...d.learnings, id], lastReview: new Date().toISOString().slice(0, 10) } : d),
    });
    setLogNote("");
    setExpandedId(null);
  };

  if (open) return <DecisionDetail decision={open} ws={ws} setWs={setWs} onBack={() => { setOpenId(null); clearFocus && clearFocus(); }} setStatus={setStatus} />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Decisions</h1>
          <p className="page-sub">What you've committed to. Move them as work progresses.</p>
        </div>
      </div>
      <div className="card flush">
        {ws.decisions.length === 0 && <div className="empty">No decisions yet.</div>}
        {ws.decisions.map((d) => (
          <div key={d.id}>
            <div className="row" onClick={() => setOpenId(d.id)}>
              <div>
                <div className="row-title">{d.title}</div>
                <div className="row-sub">
                  <StatusTag status={d.status} />
                  <span className="mono dim">reviewed {d.lastReview}</span>
                  {d.learnings.length > 0 && <><span>·</span><span className="mono dim">{d.learnings.length} learnings</span></>}
                </div>
              </div>
              <div className="row-flex" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn sm"
                  onClick={() => {
                    setExpandedId(expandedId === d.id ? null : d.id);
                    setLogNote("");
                    setLogOutcome("validated");
                  }}
                >
                  {expandedId === d.id ? "Cancel" : "Log outcome"}
                </button>
                <Icon name="chevron-right" size={13} />
              </div>
            </div>
            {expandedId === d.id && (
              <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-elev-2)" }} onClick={(e) => e.stopPropagation()}>
                <div className="row-flex" style={{ gap: 6, marginBottom: 10 }}>
                  {["validated", "mixed", "invalidated"].map((o) => (
                    <button key={o} className={`flavor-chip ${logOutcome === o ? "active" : ""}`} onClick={() => setLogOutcome(o)}>{o}</button>
                  ))}
                </div>
                <textarea
                  autoFocus
                  placeholder="What happened? What did you learn?"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  style={{ width: "100%", minHeight: 56, padding: 10, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, resize: "none" }}
                />
                <button
                  className="btn primary sm"
                  disabled={!logNote.trim()}
                  onClick={() => logLearning(d.id)}
                  style={{ marginTop: 10 }}
                >
                  Save learning
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const DecisionDetail = ({ decision, ws, setWs, onBack, setStatus }) => {
  const opp = ws.opportunities.find((o) => o.id === decision.opportunity);
  const prob = opp ? ws.problems.find((p) => p.id === opp.problem) : null;
  const signals = prob ? ws.signals.filter((s) => s.problem === prob.id) : [];
  const learnings = ws.learnings.filter((l) => l.decision === decision.id);
  const [outcome, setOutcome] = React.useState("validated");
  const [note, setNote] = React.useState("");

  const logLearning = () => {
    if (!note.trim()) return;
    const id = `lrn-${Date.now()}`;
    const delta = { validated: 12, mixed: 0, invalidated: -15 }[outcome];
    const newL = {
      id, decision: decision.id, outcome,
      note: note.trim(), addedAt: new Date().toISOString().slice(0, 10),
      confidenceDelta: delta,
    };
    setWs({
      ...ws,
      learnings: [newL, ...ws.learnings],
      decisions: ws.decisions.map((d) => d.id === decision.id ? { ...d, learnings: [...d.learnings, id], lastReview: new Date().toISOString().slice(0, 10) } : d),
    });
    setNote("");
  };

  return (
    <div className="page">
      <div><button className="btn ghost sm" onClick={onBack}>← Decisions</button></div>
      <div className="page-header">
        <div>
          <div className="section-label">Decision</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>{decision.title}</h1>
          <p className="page-sub">{decision.note}</p>
        </div>
        <div className="row-flex">
          {["build", "test", "watch", "drop"].map((s) => (
            <button key={s} className={`flavor-chip ${decision.status === s ? "active" : ""}`} onClick={() => setStatus(decision.id, s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="detail">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card flush">
            <div className="card-header"><h3 className="card-title">Learnings <span className="muted-count">{learnings.length}</span></h3></div>
            {learnings.map((l) => (
              <div key={l.id} className="row dense">
                <div>
                  <div className="row-title">{l.note}</div>
                  <div className="row-sub">
                    <Tag kind={l.outcome === "validated" ? "accent" : l.outcome === "invalidated" ? "danger" : "warn"}>{l.outcome}</Tag>
                    <span className="mono dim">{l.addedAt}</span>
                    <span>·</span>
                    <span className="mono dim">{l.confidenceDelta >= 0 ? "+" : ""}{l.confidenceDelta} confidence</span>
                  </div>
                </div>
              </div>
            ))}
            {learnings.length === 0 && <div className="empty">No learnings logged yet.</div>}
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border)" }}>
              <div className="row-flex" style={{ gap: 6 }}>
                {["validated", "mixed", "invalidated"].map((o) => (
                  <button key={o} className={`flavor-chip ${outcome === o ? "active" : ""}`} onClick={() => setOutcome(o)}>{o}</button>
                ))}
              </div>
              <textarea
                placeholder="What happened? What did you learn?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ minHeight: 60, padding: 10, background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
              />
              <button className="btn primary" disabled={!note.trim()} onClick={logLearning} style={{ alignSelf: "flex-start" }}>Log learning</button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card">
            <div className="section-label" style={{ marginBottom: 12 }}>Trace</div>
            <div className="trace">
              <div className="trace-step"><div className="trace-bullet active">1</div><div><div className="trace-label">Sources</div><div className="trace-content">{new Set(signals.map((s) => s.source)).size}</div></div></div>
              <div className="trace-step"><div className="trace-bullet active">2</div><div><div className="trace-label">Signals</div><div className="trace-content">{signals.length}</div></div></div>
              <div className="trace-step"><div className="trace-bullet active">3</div><div><div className="trace-label">Problem</div><div className="trace-content">{prob?.title || "—"}</div></div></div>
              <div className="trace-step"><div className="trace-bullet active">4</div><div><div className="trace-label">Opportunity</div><div className="trace-content">{opp?.title || "—"}</div></div></div>
              <div className="trace-step"><div className="trace-bullet active">5</div><div><div className="trace-label">Decision</div><div className="trace-content">{decision.title}</div></div></div>
            </div>
          </div>
          <div className="card">
            <div className="section-label" style={{ marginBottom: 12 }}>Status</div>
            <div className="meta-row"><span className="meta-label">Current</span><StatusTag status={decision.status} /></div>
            <div className="meta-row" style={{ marginTop: 10 }}><span className="meta-label">Last review</span><span className="meta-value mono">{decision.lastReview}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ProblemsView, OpportunitiesView, DecisionsView });

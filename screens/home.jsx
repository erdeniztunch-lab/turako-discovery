// Home screen — the decision surface

const HomeView = ({ ws, setWs, setRoute, navigateTo, recommendation, blindSpots, recommendations, showBlindSpots }) => {
  const [learningForms, setLearningForms] = React.useState({});
  const getLF = (id) => learningForms[id] || { outcome: "validated", note: "" };
  const setLF = (id, patch) => setLearningForms((prev) => ({ ...prev, [id]: { ...getLF(id), ...patch } }));

  const logLearningFromHome = (decisionId) => {
    const { outcome, note } = getLF(decisionId);
    if (!note.trim()) return;
    const id = `lrn-${Date.now()}`;
    const delta = { validated: 12, mixed: 0, invalidated: -15 }[outcome];
    const newL = { id, decision: decisionId, outcome, note: note.trim(), addedAt: new Date().toISOString().slice(0, 10), confidenceDelta: delta };
    setWs({
      ...ws,
      learnings: [newL, ...ws.learnings],
      decisions: ws.decisions.map((d) => d.id === decisionId ? { ...d, learnings: [...d.learnings, id], lastReview: new Date().toISOString().slice(0, 10) } : d),
    });
    setLF(decisionId, { outcome: "validated", note: "" });
  };

  const recent = [...ws.signals].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 5);
  const recentDecisions = [...ws.decisions].sort((a, b) => b.lastReview.localeCompare(a.lastReview)).slice(0, 4);
  const topProblems = [...ws.problems]
    .map((p) => ({ ...p, conf: computeConfidence(p, ws.signals, ws.learnings, ws.decisions) }))
    .sort((a, b) => b.conf * b.impact - a.conf * a.impact)
    .slice(0, 3);
  const topOpps = ws.opportunities.filter((o) => !o.decision).slice(0, 3);

  const totalSignals = ws.signals.length;
  const observedShare = totalSignals
    ? Math.round((ws.signals.filter((s) => s.type === "observed").length / totalSignals) * 100)
    : 0;
  const linkedShare = totalSignals
    ? Math.round((ws.signals.filter((s) => s.problem).length / totalSignals) * 100)
    : 0;

  const learningDue = ws.decisions.filter((d) => {
    if (d.status !== "build" && d.status !== "test") return false;
    const days = (Date.now() - new Date(d.lastReview).getTime()) / 86400000;
    return days >= 14 && d.learnings.length === 0;
  }).slice(0, 2);

  const unlinkedCount = ws.signals.filter((s) => !s.problem).length;
  const staleDecisions = ws.decisions.filter((d) => {
    const days = (Date.now() - new Date(d.lastReview).getTime()) / 86400000;
    return days > 21;
  });

  const headingText = unlinkedCount > 0
    ? `${unlinkedCount} signal${unlinkedCount > 1 ? "s" : ""} waiting to be linked`
    : staleDecisions.length > 0
    ? `${staleDecisions.length} decision${staleDecisions.length > 1 ? "s" : ""} need${staleDecisions.length === 1 ? "s" : ""} review`
    : totalSignals > 0
    ? "You're up to date."
    : "What should we build next?";

  return (
    <div className="page wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">{headingText}</h1>
          {totalSignals > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {unlinkedCount > 0 && (
                <button
                  onClick={() => setRoute("signals")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}
                >
                  <Icon name="signal" size={11} />
                  {unlinkedCount} unlinked signal{unlinkedCount > 1 ? "s" : ""}
                </button>
              )}
              {staleDecisions.length > 0 && (
                <button
                  onClick={() => setRoute("decisions")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--warn-soft)", color: "var(--warn)", fontSize: 12, cursor: "pointer" }}
                >
                  <Icon name="clock" size={11} />
                  {staleDecisions.length} stale decision{staleDecisions.length > 1 ? "s" : ""}
                </button>
              )}
              {unlinkedCount === 0 && staleDecisions.length === 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12 }}>
                  <Icon name="check" size={11} />
                  All caught up
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {learningDue.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {learningDue.map((d) => {
            const days = Math.floor((Date.now() - new Date(d.lastReview).getTime()) / 86400000);
            const lf = getLF(d.id);
            return (
              <div key={d.id} className="card" style={{ borderLeft: "3px solid var(--warn)" }}>
                <div className="row-flex" style={{ marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{d.title}</div>
                    <div className="muted" style={{ fontSize: 12 }}>in progress · {days} day{days !== 1 ? "s" : ""} without a learning</div>
                  </div>
                  <Tag kind="warn">review due</Tag>
                </div>
                <div className="row-flex" style={{ gap: 6, marginBottom: 10 }}>
                  {["validated", "mixed", "invalidated"].map((o) => (
                    <button key={o} className={`flavor-chip ${lf.outcome === o ? "active" : ""}`} onClick={() => setLF(d.id, { outcome: o })}>
                      {o}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="What happened?"
                  value={lf.note}
                  onChange={(e) => setLF(d.id, { note: e.target.value })}
                  style={{ width: "100%", minHeight: 52, padding: 10, background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, resize: "none" }}
                />
                <button
                  className="btn primary sm"
                  disabled={!lf.note.trim()}
                  onClick={() => logLearningFromHome(d.id)}
                  style={{ marginTop: 8 }}
                >
                  Save learning
                </button>
              </div>
            );
          })}
        </div>
      )}

      {ws.sources.length === 0 ? (
        <div className="card" style={{ padding: "52px 40px", textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: 14 }}>Get started</div>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Start by pasting a customer note
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Turako extracts signals from it. You link them to problems and build evidence-backed decisions.
          </p>
          <button className="btn primary lg" onClick={() => setRoute("capture")}>
            Add your first source <Icon name="arrow-right" size={13} />
          </button>
        </div>
      ) : (
        <>
          {recommendation ? (
            <div className="reco-hero" data-tour="reco">
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="reco-eyebrow"><span className="pulse" /> Strongest next move</div>
                <h2 className="reco-title">{recommendation.title}</h2>
                <p className="reco-reason">{recommendation.reason}</p>
                <div className="reco-actions">
                  <button
                    className="btn primary"
                    onClick={() => {
                      if (recommendation.target.type === "opportunity") navigateTo("opportunities", recommendation.target.id);
                      else if (recommendation.target.type === "problem") navigateTo("problems", recommendation.target.id);
                      else if (recommendation.target.type === "decision") navigateTo("decisions", recommendation.target.id);
                    }}
                  >
                    {recommendation.cta} <Icon name="arrow-right" size={13} />
                  </button>
                  <button className="btn ghost" onClick={() => setRoute("opportunities")}>See alternatives</button>
                </div>
              </div>
              <div className="reco-meta">
                <div className="meta-row">
                  <span className="meta-label">Confidence</span>
                  <ConfidenceBar value={recommendation.confidence} width={140} />
                </div>
                <div className="meta-row">
                  <span className="meta-label">Impact</span>
                  <span className="meta-value mono">
                    {(() => {
                      const opp = ws.opportunities.find((o) => o.id === recommendation.target.id);
                      const prob = opp ? ws.problems.find((p) => p.id === opp.problem) : ws.problems.find((p) => p.id === recommendation.target.id);
                      return prob ? `${prob.impact}/10` : "—";
                    })()}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Trend</span>
                  <span className="meta-value">
                    {(() => {
                      const opp = ws.opportunities.find((o) => o.id === recommendation.target.id);
                      const prob = opp ? ws.problems.find((p) => p.id === opp.problem) : ws.problems.find((p) => p.id === recommendation.target.id);
                      return prob ? <Trend trend={prob.trend} /> : "—";
                    })()}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Kind</span>
                  <Tag kind="accent">{recommendation.kind}</Tag>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty">
                No recommendations yet. Add sources and link signals to problems to get started.
              </div>
            </div>
          )}

          <div className="grid home">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
              <div className="card flush">
                <div className="card-header">
                  <h3 className="card-title">Top problems <span className="muted-count">{ws.problems.length}</span></h3>
                  <button className="btn ghost sm" onClick={() => setRoute("problems")}>View all</button>
                </div>
                {topProblems.length === 0 && <div className="empty">No problems yet</div>}
                {topProblems.map((p) => (
                  <div key={p.id} className="row" onClick={() => navigateTo("problems", p.id)}>
                    <div>
                      <div className="row-title">{p.title}</div>
                      <div className="row-sub">
                        <Trend trend={p.trend} />
                        <span>·</span>
                        <span className="mono">{ws.signals.filter((s) => s.problem === p.id).length} signals</span>
                        <span>·</span>
                        <span className="mono">impact {p.impact}/10</span>
                      </div>
                    </div>
                    <ConfidenceBar value={p.conf} width={110} />
                  </div>
                ))}
              </div>

              <div className="card flush">
                <div className="card-header">
                  <h3 className="card-title">Top opportunities <span className="muted-count">{topOpps.length}</span></h3>
                  <button className="btn ghost sm" onClick={() => setRoute("opportunities")}>View all</button>
                </div>
                {topOpps.length === 0 && <div className="empty">All opportunities have been promoted</div>}
                {topOpps.map((o) => {
                  const prob = ws.problems.find((p) => p.id === o.problem);
                  return (
                    <div key={o.id} className="row" onClick={() => navigateTo("opportunities", o.id)}>
                      <div>
                        <div className="row-title">{o.title}</div>
                        <div className="row-sub">
                          <ReadinessTag readiness={o.readiness} />
                          <span className="dim">→ {prob?.title}</span>
                        </div>
                      </div>
                      <Icon name="chevron-right" size={14} />
                    </div>
                  );
                })}
              </div>

              <div className="card flush">
                <div className="card-header">
                  <h3 className="card-title">Recent signals</h3>
                  <button className="btn ghost sm" onClick={() => setRoute("signals")}>View all</button>
                </div>
                {recent.map((s) => (
                  <div key={s.id} className="row dense" onClick={() => setRoute("signals")}>
                    <div>
                      <div className="row-title">{s.text}</div>
                      <div className="row-sub">
                        <StrengthTag strength={s.strength} />
                        <span className="mono dim">{s.addedAt}</span>
                      </div>
                    </div>
                    <Icon name="chevron-right" size={14} />
                  </div>
                ))}
                {recent.length === 0 && <div className="empty">No signals yet</div>}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
              <div className="card">
                <div className="section-label" style={{ marginBottom: 14 }}>Evidence snapshot</div>
                <div style={{ display: "grid", gap: 14 }}>
                  <div className="meta-row">
                    <span className="meta-label">Total signals</span>
                    <span className="meta-value mono">{totalSignals}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Observed</span>
                    <span className="meta-value mono">{observedShare}%</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Linked to a problem</span>
                    <span className="meta-value mono">{linkedShare}%</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Sources</span>
                    <span className="meta-value mono">{ws.sources.length}</span>
                  </div>
                </div>
              </div>

              {showBlindSpots && (
                <div className="card flush" data-tour="blindspots">
                  <div className="card-header">
                    <h3 className="card-title">
                      <Icon name="warn" size={13} />
                      Blind spots <span className="muted-count">{blindSpots.length}</span>
                    </h3>
                  </div>
                  {blindSpots.length === 0 && <div className="empty">No blind spots detected.</div>}
                  {blindSpots.slice(0, 4).map((b) => (
                    <div key={b.id} className="row dense" onClick={() => navigateTo(b.target.type === "problem" ? "problems" : "decisions", b.target.id)}>
                      <div>
                        <div className="row-title" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Tag kind="warn">{b.kind}</Tag>
                          {b.title}
                        </div>
                        <div className="row-sub">{b.detail}</div>
                      </div>
                      <span className="mono dim" style={{ fontSize: 11 }}>{b.action} →</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="card flush">
                <div className="card-header">
                  <h3 className="card-title">Recent decisions</h3>
                </div>
                {recentDecisions.map((d) => (
                  <div key={d.id} className="row dense" onClick={() => navigateTo("decisions", d.id)}>
                    <div>
                      <div className="row-title">{d.title}</div>
                      <div className="row-sub">
                        <StatusTag status={d.status} />
                        <span className="mono dim">reviewed {d.lastReview}</span>
                      </div>
                    </div>
                    <Icon name="chevron-right" size={14} />
                  </div>
                ))}
                {recentDecisions.length === 0 && <div className="empty">No decisions yet</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

Object.assign(window, { HomeView });

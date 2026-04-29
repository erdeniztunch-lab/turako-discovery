// Settings screen

const SettingsView = ({ ws, setWs, isSample, setIsSample, integrations, connectIntegration, syncIntegration, restartTour, resetAll }) => (
  <div className="page">
    <div className="page-header">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Workspace, sample mode, and tour controls.</p>
      </div>
    </div>
    <div className="card">
      <div className="section-label" style={{ marginBottom: 12 }}>Workspace</div>
      <div style={{ display: "grid", gap: 14 }}>
        <div className="meta-row">
          <span className="meta-label">Product name</span>
          <input
            value={ws.product.name}
            onChange={(e) => setWs({ ...ws, product: { ...ws.product, name: e.target.value } })}
            style={{ background: "var(--bg-elev-2)", padding: "6px 10px", borderRadius: "var(--radius)", border: "1px solid var(--border)", minWidth: 240 }}
          />
        </div>
        <div className="meta-row">
          <span className="meta-label">Focus question</span>
          <input
            value={ws.product.focus}
            onChange={(e) => setWs({ ...ws, product: { ...ws.product, focus: e.target.value } })}
            style={{ background: "var(--bg-elev-2)", padding: "6px 10px", borderRadius: "var(--radius)", border: "1px solid var(--border)", minWidth: 320 }}
          />
        </div>
      </div>
    </div>

    <div className="card">
      <div className="section-label" style={{ marginBottom: 12 }}>Sample workspace</div>
      <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
        {isSample ? "You're in the sample workspace. Switch off to start with your own data." : "Load realistic mock data to explore the full workflow without committing your own."}
      </p>
      <div className="row-flex">
        <button className={`btn ${isSample ? "" : "primary"}`} onClick={() => setIsSample(true)}>Use sample data</button>
        <button className={`btn ${isSample ? "primary" : ""}`} onClick={() => setIsSample(false)}>Use empty workspace</button>
      </div>
    </div>

    <div className="card">
      <div className="section-label" style={{ marginBottom: 12 }}>Guided tour</div>
      <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Walk through the core decision loop again.</p>
      <button className="btn" onClick={restartTour}>Replay tour</button>
    </div>

    <div className="card">
      <div className="section-label" style={{ marginBottom: 12 }}>Integrations</div>
      <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Frontend-only connectors show how Turako will read evidence from the systems your team already uses.</p>
      <IntegrationPanel integrations={integrations} connectIntegration={connectIntegration} syncIntegration={syncIntegration} compact />
    </div>

    <div className="card">
      <div className="section-label" style={{ marginBottom: 12 }}>Reset</div>
      <button className="btn danger" onClick={resetAll}>Reset onboarding & local data</button>
    </div>
  </div>
);

Object.assign(window, { SettingsView });

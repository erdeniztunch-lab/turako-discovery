// Main app — routing, state, glue

const STORAGE_KEY = "turako:state:v1";

const App = () => {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "aesthetic": "calm",
    "density": "spacious",
    "theme": "dark",
    "accentHue": 145,
    "showBlindSpots": true,
    "useSample": true
  }/*EDITMODE-END*/;

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [stage, setStage] = React.useState("loading"); // loading | landing | onboarding | app
  const [route, setRoute] = React.useState("home");
  const [ws, setWs] = React.useState(SAMPLE_WORKSPACE);
  const [isSample, setIsSample] = React.useState(true);
  const [integrations, setIntegrations] = React.useState(DEFAULT_INTEGRATIONS);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [tourIdx, setTourIdx] = React.useState(-1);
  const [demoActive, setDemoActive] = React.useState(false);
  const [focusedId, setFocusedId] = React.useState(null);

  // Apply tweaks to root
  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.aesthetic = tweaks.aesthetic;
    root.dataset.density = tweaks.density;
    root.dataset.theme = tweaks.theme;
    root.style.setProperty("--accent", `oklch(0.7 0.14 ${tweaks.accentHue})`);
    root.style.setProperty("--accent-strong", `oklch(0.78 0.16 ${tweaks.accentHue})`);
    root.style.setProperty("--accent-soft", `oklch(0.7 0.14 ${tweaks.accentHue} / 0.12)`);
  }, [tweaks]);

  // Apply useSample tweak — when toggled, swap workspace
  React.useEffect(() => {
    if (stage !== "app") return;
    if (tweaks.useSample && !isSample) {
      setWs(SAMPLE_WORKSPACE);
      setIsSample(true);
    } else if (!tweaks.useSample && isSample) {
      setWs(EMPTY_WORKSPACE);
      setIsSample(false);
    }
    // eslint-disable-next-line
  }, [tweaks.useSample]);

  // Boot
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setWs(saved.ws || SAMPLE_WORKSPACE);
        setIsSample(saved.isSample ?? true);
        setIntegrations(saved.integrations || DEFAULT_INTEGRATIONS);
        setStage(saved.stage || "landing");
        setTourIdx(saved.tourSeen ? -1 : -1);
        setDemoActive(false);
      } else {
        setStage("landing");
      }
    } catch (e) {
      setStage("landing");
    }
  }, []);

  // Persist
  React.useEffect(() => {
    if (stage === "loading") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ws, isSample, integrations, stage, tourSeen: true }));
    } catch (e) {}
  }, [ws, isSample, integrations, stage]);

  // ⌘K shortcut
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        if (tourIdx >= 0) setTourIdx(-1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tourIdx]);

  const navigateTo = (r, id) => {
    setRoute(r);
    if (id) setFocusedId(id);
    else setFocusedId(null);
  };

  const cleanWorkspace = () => {
    setWs(EMPTY_WORKSPACE);
    setIntegrations(DEFAULT_INTEGRATIONS);
    setIsSample(false);
    setTweak("useSample", false);
  };

  const finishTour = () => {
    if (demoActive) {
      cleanWorkspace();
      setDemoActive(false);
      setRoute("home");
    }
    setTourIdx(-1);
  };

  const startTour = () => { setRoute("home"); setDemoActive(false); setTourIdx(0); };

  const connectIntegration = (integrationId) => {
    setIntegrations({
      ...integrations,
      [integrationId]: { id: integrationId, status: "connected", lastSync: integrations[integrationId]?.lastSync || null },
    });
  };

  const syncIntegration = (integrationId) => {
    const now = new Date().toISOString().slice(0, 10);
    const imported = buildIntegrationImport(integrationId, ws.sources);
    if (!imported) return;

    setIntegrations({
      ...integrations,
      [integrationId]: { id: integrationId, status: "synced", lastSync: now },
    });

    if (imported.alreadySynced) return;
    setWs({
      ...ws,
      sources: [imported.source, ...ws.sources],
      signals: [...imported.signals, ...ws.signals],
    });
  };

  const blindSpots = React.useMemo(() => detectBlindSpots(ws), [ws]);
  const recommendations = React.useMemo(() => buildRecommendation(ws), [ws]);
  const recommendation = recommendations[0];

  React.useEffect(() => {
    if (tourIdx < 0) return;
    const step = TOUR_STEPS[tourIdx];
    if (step?.route && step.route !== route) setRoute(step.route);
  }, [tourIdx, route]);

  if (stage === "loading") return null;

  if (stage === "landing") return (
    <>
      <Landing
        onStartDemo={() => {
          setWs(SAMPLE_WORKSPACE);
          setIsSample(true);
          setIntegrations(DEFAULT_INTEGRATIONS);
          setDemoActive(true);
          setTweak("useSample", true);
          setStage("app");
          setTimeout(() => setTourIdx(0), 400);
        }}
        onStartEmpty={() => {
          setTweak("useSample", false);
          setStage("onboarding");
        }}
      />
      <TweaksMount tweaks={tweaks} setTweak={setTweak} />
    </>
  );

  if (stage === "onboarding") return (
    <>
      <Onboarding onDone={(payload) => {
        if (payload?.useSample) {
          setWs(SAMPLE_WORKSPACE);
          setIsSample(true);
          setIntegrations(DEFAULT_INTEGRATIONS);
          setDemoActive(true);
          setTweak("useSample", true);
          setStage("app");
          setTimeout(() => setTourIdx(0), 400);
          return;
        }

        if (payload?.workspace) {
          setWs(payload.workspace);
          setIsSample(false);
          setIntegrations(DEFAULT_INTEGRATIONS);
          setDemoActive(false);
          setTweak("useSample", false);
          setRoute("home");
          setStage("app");
          return;
        }

        setWs(EMPTY_WORKSPACE);
        setIsSample(false);
        setIntegrations(DEFAULT_INTEGRATIONS);
        setDemoActive(false);
        setTweak("useSample", false);
        setStage("app");
      }} />
      <TweaksMount tweaks={tweaks} setTweak={setTweak} />
    </>
  );

  // App stage
  const screen = (() => {
    switch (route) {
      case "home": return <HomeView ws={ws} setWs={setWs} setRoute={setRoute} navigateTo={navigateTo} recommendation={recommendation} recommendations={recommendations} blindSpots={blindSpots} showBlindSpots={tweaks.showBlindSpots} />;
      case "capture": return <CaptureView ws={ws} setWs={setWs} navigateTo={navigateTo} integrations={integrations} connectIntegration={connectIntegration} syncIntegration={syncIntegration} />;
      case "signals": return <SignalsView ws={ws} setWs={setWs} />;
      case "problems": return <ProblemsView ws={ws} setWs={setWs} navigateTo={navigateTo} focusedId={focusedId} clearFocus={() => setFocusedId(null)} />;
      case "opportunities": return <OpportunitiesView ws={ws} setWs={setWs} navigateTo={navigateTo} focusedId={focusedId} clearFocus={() => setFocusedId(null)} />;
      case "decisions": return <DecisionsView ws={ws} setWs={setWs} navigateTo={navigateTo} focusedId={focusedId} clearFocus={() => setFocusedId(null)} />;
      case "learnings": return <LearningsView ws={ws} />;
      case "settings": return <SettingsView ws={ws} setWs={setWs} isSample={isSample} integrations={integrations} connectIntegration={connectIntegration} syncIntegration={syncIntegration} setIsSample={(v) => { setIsSample(v); setTweak("useSample", v); setWs(v ? SAMPLE_WORKSPACE : EMPTY_WORKSPACE); setIntegrations(DEFAULT_INTEGRATIONS); }} restartTour={() => { setRoute("home"); setDemoActive(false); setTimeout(() => setTourIdx(0), 100); }} resetAll={() => { localStorage.removeItem(STORAGE_KEY); setIntegrations(DEFAULT_INTEGRATIONS); setDemoActive(false); setStage("landing"); }} />;
      default: return null;
    }
  })();

  return (
    <>
      <div className="app">
        <Sidebar route={route} setRoute={setRoute} ws={ws} onOpenSearch={() => setSearchOpen(true)} isSample={isSample} />
        <div className="main">
          <Topbar route={route} onOpenSearch={() => setSearchOpen(true)} onStartTour={startTour} />
          {screen}
        </div>
      </div>
      {searchOpen && <SearchModal ws={ws} onClose={() => setSearchOpen(false)} navigateTo={navigateTo} />}
      {tourIdx >= 0 && tourIdx < TOUR_STEPS.length && (
        <TourOverlay
          step={{ ...TOUR_STEPS[tourIdx], idx: tourIdx }}
          total={TOUR_STEPS.length}
          demoActive={demoActive}
          onNext={() => tourIdx + 1 < TOUR_STEPS.length ? setTourIdx(tourIdx + 1) : finishTour()}
          onPrev={() => setTourIdx(Math.max(0, tourIdx - 1))}
          onClose={finishTour}
        />
      )}
      <TweaksMount tweaks={tweaks} setTweak={setTweak} />
    </>
  );
};

const TweaksMount = ({ tweaks, setTweak }) => (
  <TweaksPanel title="Tweaks">
    <TweakSection title="Aesthetic">
      <TweakRadio
        label="Style"
        value={tweaks.aesthetic}
        onChange={(v) => setTweak("aesthetic", v)}
        options={[
          { value: "calm", label: "Calm" },
          { value: "editorial", label: "Editorial" },
          { value: "operational", label: "Ops" },
        ]}
      />
      <TweakRadio
        label="Theme"
        value={tweaks.theme}
        onChange={(v) => setTweak("theme", v)}
        options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]}
      />
      <TweakRadio
        label="Density"
        value={tweaks.density}
        onChange={(v) => setTweak("density", v)}
        options={[
          { value: "tight", label: "Tight" },
          { value: "medium", label: "Medium" },
          { value: "spacious", label: "Spacious" },
        ]}
      />
      <TweakSlider label="Accent hue" min={0} max={360} step={1} value={tweaks.accentHue} onChange={(v) => setTweak("accentHue", v)} />
    </TweakSection>
    <TweakSection title="Workspace">
      <TweakToggle label="Sample data" value={tweaks.useSample} onChange={(v) => setTweak("useSample", v)} />
      <TweakToggle label="Show blind spots" value={tweaks.showBlindSpots} onChange={(v) => setTweak("showBlindSpots", v)} />
    </TweakSection>
  </TweaksPanel>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

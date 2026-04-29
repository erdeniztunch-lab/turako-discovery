// Sample workspace: a B2B SaaS analytics product called "Pulseboard"
// All data is deterministic. Confidence updates when signals/learnings change.

const SAMPLE_PRODUCT = {
  name: "Pulseboard",
  description: "Product analytics for B2B SaaS teams",
  segments: ["Growth-stage SaaS", "Founder PMs", "Customer Success leads"],
  focus: "Reduce time-to-insight for non-technical PMs",
};

const SAMPLE_SOURCES = [
  {
    id: "src-1",
    title: "Customer interview — Acme Co (Maria, Head of Product)",
    flavor: "interview",
    addedAt: "2026-04-22",
    excerpt:
      "We export to CSV every Friday because the dashboards take too long to load on accounts with > 200k events. Maria mentioned this is the third week in a row her team hit it.",
    signals: ["sig-1", "sig-2"],
  },
  {
    id: "src-2",
    title: "Support tickets — week of Apr 14",
    flavor: "support",
    addedAt: "2026-04-19",
    excerpt:
      "11 tickets referencing 'dashboard slow', 'timeout on funnel', 'export stuck'. Two from logo accounts (Northwind, Hooli). Recurring across last 3 weeks.",
    signals: ["sig-3", "sig-4"],
  },
  {
    id: "src-3",
    title: "Sales call notes — Q2 enterprise pipeline",
    flavor: "sales",
    addedAt: "2026-04-17",
    excerpt:
      "Three of four enterprise prospects in Q2 brought up SSO + SAML during demo. One said it's a procurement blocker. The fourth assumed we already had it.",
    signals: ["sig-5"],
  },
  {
    id: "src-4",
    title: "Product analytics — funnel completion",
    flavor: "analytics",
    addedAt: "2026-04-15",
    excerpt:
      "Onboarding completion fell from 64% to 51% week over week after the new event-mapping step shipped. Largest drop on step 3 (define key event).",
    signals: ["sig-6", "sig-7"],
  },
  {
    id: "src-5",
    title: "Email — Northwind QBR followup",
    flavor: "email",
    addedAt: "2026-04-10",
    excerpt:
      "Northwind asked again whether we plan to support custom cohorts. Their CSM noted they'd considered churning to a competitor in Q1 partly for this reason.",
    signals: ["sig-8"],
  },
];

const SAMPLE_SIGNALS = [
  {
    id: "sig-1",
    text: "Dashboards time out on workspaces over 200k events",
    type: "stated",
    strength: "strong",
    source: "src-1",
    problem: "prob-1",
    addedAt: "2026-04-22",
  },
  {
    id: "sig-2",
    text: "Weekly CSV export workaround used by Acme team",
    type: "observed",
    strength: "medium",
    source: "src-1",
    problem: "prob-1",
    addedAt: "2026-04-22",
  },
  {
    id: "sig-3",
    text: "11 support tickets/week mentioning dashboard slowness",
    type: "observed",
    strength: "strong",
    source: "src-2",
    problem: "prob-1",
    addedAt: "2026-04-19",
  },
  {
    id: "sig-4",
    text: "Funnel timeouts cited by two logo accounts",
    type: "stated",
    strength: "medium",
    source: "src-2",
    problem: "prob-1",
    addedAt: "2026-04-19",
  },
  {
    id: "sig-5",
    text: "SSO/SAML expected by enterprise procurement",
    type: "stated",
    strength: "strong",
    source: "src-3",
    problem: "prob-2",
    addedAt: "2026-04-17",
  },
  {
    id: "sig-6",
    text: "Onboarding completion dropped 13pp after event-mapping ship",
    type: "observed",
    strength: "strong",
    source: "src-4",
    problem: "prob-3",
    addedAt: "2026-04-15",
  },
  {
    id: "sig-7",
    text: "Step 3 'define key event' is the largest drop-off",
    type: "observed",
    strength: "medium",
    source: "src-4",
    problem: "prob-3",
    addedAt: "2026-04-15",
  },
  {
    id: "sig-8",
    text: "Custom cohorts requested; tied to retention risk at Northwind",
    type: "stated",
    strength: "medium",
    source: "src-5",
    problem: "prob-4",
    addedAt: "2026-04-10",
  },
];

const SAMPLE_PROBLEMS = [
  {
    id: "prob-1",
    title: "Dashboards slow or fail on large workspaces",
    summary:
      "Workspaces above ~200k events report timeouts on funnel and retention dashboards. Customers self-route to CSV exports.",
    trend: "rising",
    impact: 9,
    addedAt: "2026-04-19",
    opportunities: ["opp-1"],
  },
  {
    id: "prob-2",
    title: "Enterprise prospects blocked by missing SSO",
    summary:
      "SSO/SAML is showing up as a procurement requirement in enterprise deals. Currently treated as a future item.",
    trend: "stable",
    impact: 8,
    addedAt: "2026-04-17",
    opportunities: ["opp-2"],
  },
  {
    id: "prob-3",
    title: "New event-mapping step breaking onboarding",
    summary:
      "Onboarding completion fell 13pp after the event-mapping step shipped. Concentrated on step 3.",
    trend: "rising",
    impact: 7,
    addedAt: "2026-04-15",
    opportunities: ["opp-3", "opp-4"],
  },
  {
    id: "prob-4",
    title: "Retention risk from missing custom cohorts",
    summary:
      "One logo account citing custom cohorts as a churn factor. Single source so far — needs more evidence.",
    trend: "declining",
    impact: 6,
    addedAt: "2026-04-10",
    opportunities: [],
  },
];

const SAMPLE_OPPORTUNITIES = [
  {
    id: "opp-1",
    title: "Ship server-side aggregation for large workspaces",
    framing:
      "Move heavy aggregations to a precomputed layer so dashboards stay under 3s for 1M+ event workspaces.",
    problem: "prob-1",
    readiness: "ready",
    decision: "dec-1",
  },
  {
    id: "opp-2",
    title: "Add SSO + SAML as paid add-on",
    framing:
      "Enterprise SSO via SAML 2.0, scoped as a paid add-on to unblock procurement without distorting pricing.",
    problem: "prob-2",
    readiness: "validate",
    decision: null,
  },
  {
    id: "opp-3",
    title: "Revert event-mapping to optional step",
    framing:
      "Make step 3 optional with sensible defaults; recover onboarding completion immediately.",
    problem: "prob-3",
    readiness: "ready",
    decision: "dec-2",
  },
  {
    id: "opp-4",
    title: "Auto-detect key events from existing data",
    framing:
      "Use heuristics to suggest key events instead of asking the user to define them manually.",
    problem: "prob-3",
    readiness: "explore",
    decision: null,
  },
];

const SAMPLE_DECISIONS = [
  {
    id: "dec-1",
    title: "Server-side aggregation for large workspaces",
    status: "build",
    opportunity: "opp-1",
    addedAt: "2026-04-20",
    lastReview: "2026-04-25",
    learnings: [],
    note: "Owner: Priya. Targeting May 12 ship.",
  },
  {
    id: "dec-2",
    title: "Revert event-mapping to optional step",
    status: "test",
    opportunity: "opp-3",
    addedAt: "2026-04-16",
    lastReview: "2026-04-24",
    learnings: ["lrn-1"],
    note: "A/B against current required-step flow.",
  },
  {
    id: "dec-3",
    title: "Custom cohorts (deferred)",
    status: "watch",
    opportunity: null,
    addedAt: "2026-03-02",
    lastReview: "2026-03-02",
    learnings: [],
    note: "Stale — needs review or downgrade.",
  },
];

const SAMPLE_LEARNINGS = [
  {
    id: "lrn-1",
    decision: "dec-2",
    outcome: "validated",
    note:
      "A/B showed +9pp completion when step 3 was optional. Promoting to build.",
    addedAt: "2026-04-24",
    confidenceDelta: +12,
  },
];

const EMPTY_WORKSPACE = {
  product: { name: "", description: "", segments: [], focus: "" },
  sources: [],
  signals: [],
  problems: [],
  opportunities: [],
  decisions: [],
  learnings: [],
};

const DEFAULT_INTEGRATIONS = {
  hubspot: { id: "hubspot", status: "disconnected", lastSync: null },
  zendesk: { id: "zendesk", status: "disconnected", lastSync: null },
  ga: { id: "ga", status: "disconnected", lastSync: null },
  cs: { id: "cs", status: "disconnected", lastSync: null },
  slack: { id: "slack", status: "disconnected", lastSync: null },
  interviews: { id: "interviews", status: "disconnected", lastSync: null },
  linear: { id: "linear", status: "disconnected", lastSync: null },
  competitor: { id: "competitor", status: "disconnected", lastSync: null },
  founder: { id: "founder", status: "disconnected", lastSync: null },
};

const INTEGRATION_CATALOG = [
  {
    id: "hubspot",
    name: "HubSpot",
    kind: "CRM + email",
    flavor: "email",
    description: "Pull customer emails, sales notes, and account context into the evidence loop.",
    sampleTitle: "HubSpot import - expansion and churn notes",
    sampleText:
      "Three renewal emails mention admins asking for custom cohorts before committing to expansion. Sales notes say two enterprise prospects asked whether SSO is included in procurement. One customer success note flags churn risk because reporting exports still take hours every Friday.",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    kind: "Support tickets",
    flavor: "support",
    description: "Turn recurring support themes into reviewable product signals.",
    sampleTitle: "Zendesk sync - dashboard reliability tickets",
    sampleText:
      "17 tickets this week mention dashboard slow, timeout on funnel, or export stuck. Six tickets came from accounts above 200k events. Support tagged four tickets as urgent because users could not finish weekly reporting.",
  },
  {
    id: "ga",
    name: "Google Analytics",
    kind: "Product analytics",
    flavor: "analytics",
    description: "Bring traffic and funnel movement into the same decision trail as qualitative feedback.",
    sampleTitle: "Google Analytics sync - onboarding drop-off",
    sampleText:
      "Onboarding completion dropped from 61% to 49% after the new setup step shipped. Step 3 has the largest drop-off at 34%. Returning users spend 42% longer on the dashboard page when reports include more than 12 widgets.",
  },
  {
    id: "cs",
    name: "CS notes",
    kind: "Customer success",
    flavor: "support",
    description: "Preview QBR notes, renewal risks, and account health themes as a continuous feedback stream.",
    sampleTitle: "CS stream - QBR and renewal risks",
    sampleText:
      "Customer success notes flag three renewal accounts asking for faster reporting workflows. Two admins say weekly export cleanup is slowing their team. One QBR notes churn risk if onboarding remains confusing for new workspace admins.",
  },
  {
    id: "slack",
    name: "Slack threads",
    kind: "Internal feedback",
    flavor: "email",
    description: "Simulate customer messages and internal escalation threads shared across the team.",
    sampleTitle: "Slack stream - customer escalations",
    sampleText:
      "Sales shared a Slack thread where a founder asked for SSO before expansion. Support posted another thread about dashboard timeout complaints. Product marketing noted competitors are positioning faster setup as a differentiator.",
  },
  {
    id: "interviews",
    name: "Interviews",
    kind: "Discovery notes",
    flavor: "interview",
    description: "Use example discovery notes to see how Turako separates stated needs from underlying problems.",
    sampleTitle: "Interview stream - PM discovery notes",
    sampleText:
      "Three PMs said setup feels confusing because they do not know which events matter. One user requested templates, but the underlying problem seems to be low confidence during onboarding. Another PM still exports reports for weekly stakeholder updates.",
  },
  {
    id: "linear",
    name: "Linear / Jira",
    kind: "Issue tracker",
    flavor: "support",
    description: "Preview recurring issue patterns and roadmap pressure from product and engineering queues.",
    sampleTitle: "Issue stream - recurring requests",
    sampleText:
      "Linear has eight issues tagged dashboard reliability and five tagged onboarding confusion. Two bugs mention funnel timeout. Three roadmap requests ask for custom cohorts but only one includes customer context.",
  },
  {
    id: "competitor",
    name: "Competitor reviews",
    kind: "Market signals",
    flavor: "sales",
    description: "Simulate market and competitor signals without treating them as direct customer proof.",
    sampleTitle: "Market stream - competitor review notes",
    sampleText:
      "Competitor reviews praise fast dashboard loading and guided setup templates. Several reviews complain that advanced cohort building is hard. Sales says prospects compare us against tools with SSO in the base enterprise package.",
  },
  {
    id: "founder",
    name: "Founder DMs",
    kind: "Direct customer messages",
    flavor: "email",
    description: "Preview high-signal but potentially biased founder and leadership customer conversations.",
    sampleTitle: "Founder stream - direct customer DMs",
    sampleText:
      "A founder DM says a large prospect will not move forward without SSO. Another customer asked leadership for custom cohorts. One power user says dashboards are too slow for Friday reporting, but this is from a single account.",
  },
];

const SAMPLE_WORKSPACE = {
  product: SAMPLE_PRODUCT,
  sources: SAMPLE_SOURCES,
  signals: SAMPLE_SIGNALS,
  problems: SAMPLE_PROBLEMS,
  opportunities: SAMPLE_OPPORTUNITIES,
  decisions: SAMPLE_DECISIONS,
  learnings: SAMPLE_LEARNINGS,
};

// Deterministic source-to-signals extractor.
// We don't actually do NLP — we split on sentences and tag by keyword.
function extractSignalsFromText(text, sourceId) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return [];
  const chunks = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
    .slice(0, 6);

  const observedHints = ["%", "tickets", "dropped", "rose", "fell", "weekly", "every", "hours", "users", "pp", "200k", "1m"];
  const inferredHints = ["seems", "probably", "might", "could", "likely", "feels"];
  const strongHints = ["blocker", "churn", "lost", "broken", "down", "timeout", "fail"];
  const mediumHints = ["slow", "confusing", "unclear", "asked", "requested", "wants"];

  return chunks.map((c, i) => {
    const lc = c.toLowerCase();
    let type = "stated";
    if (observedHints.some((h) => lc.includes(h))) type = "observed";
    else if (inferredHints.some((h) => lc.includes(h))) type = "inferred";
    let strength = "weak";
    if (strongHints.some((h) => lc.includes(h))) strength = "strong";
    else if (mediumHints.some((h) => lc.includes(h))) strength = "medium";
    return {
      id: `sig-${sourceId}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      text: c.replace(/\s+/g, " ").slice(0, 180),
      type,
      strength,
      source: sourceId,
      problem: null,
      addedAt: new Date().toISOString().slice(0, 10),
    };
  });
}

// Confidence: 0-100 from signals + diversity + learnings
function computeConfidence(problem, signals, learnings, decisions) {
  const linked = signals.filter((s) => s.problem === problem.id);
  if (!linked.length) return 0;
  const strengthScore = linked.reduce((sum, s) => sum + ({ weak: 1, medium: 2, strong: 3 }[s.strength] || 1), 0);
  const types = new Set(linked.map((s) => s.type));
  const diversity = types.size; // 1-3
  let base = Math.min(60, strengthScore * 7);
  base += Math.min(25, diversity * 8);
  base += Math.min(10, (linked.length - 1) * 2);
  // learning boosts via decisions
  const decisionsForProblem = decisions.filter((d) => {
    const opp = (problem.opportunities || []).includes(d.opportunity);
    return opp;
  });
  const validated = learnings.filter(
    (l) => l.outcome === "validated" && decisionsForProblem.find((d) => d.id === l.decision)
  );
  base += Math.min(15, validated.length * 8);
  return Math.max(0, Math.min(100, Math.round(base)));
}

// Recommendation engine — deterministic
function buildRecommendation(ws) {
  const items = [];
  // For each opportunity ready w/ no decision: promote
  ws.opportunities.forEach((opp) => {
    if (opp.decision) return;
    const prob = ws.problems.find((p) => p.id === opp.problem);
    if (!prob) return;
    const conf = computeConfidence(prob, ws.signals, ws.learnings, ws.decisions);
    const trendW = { rising: 1.3, stable: 1.0, declining: 0.7 }[prob.trend] || 1;
    const readyW = { ready: 1.5, validate: 1.0, explore: 0.7 }[opp.readiness] || 1;
    const score = (conf / 100) * (prob.impact / 10) * trendW * readyW;
    items.push({
      kind: "promote",
      score,
      title: `Promote: ${opp.title}`,
      reason: `${prob.title} is ${prob.trend}, confidence ${conf}, opportunity is ${opp.readiness}.`,
      cta: "Promote to decision",
      target: { type: "opportunity", id: opp.id },
      confidence: conf,
      problem: prob.id,
    });
  });
  // For each problem with thin evidence
  ws.problems.forEach((p) => {
    const linked = ws.signals.filter((s) => s.problem === p.id);
    if (linked.length <= 1) {
      items.push({
        kind: "investigate",
        score: 0.2 * (p.impact / 10),
        title: `Investigate: ${p.title}`,
        reason: `Only ${linked.length} signal supports this problem. Add more sources before acting.`,
        cta: "Add evidence",
        target: { type: "problem", id: p.id },
        confidence: computeConfidence(p, ws.signals, ws.learnings, ws.decisions),
      });
    }
  });
  // Stale decisions
  ws.decisions.forEach((d) => {
    const last = new Date(d.lastReview);
    const days = (Date.now() - last.getTime()) / 86400000;
    if (days > 21 && d.status === "watch") {
      items.push({
        kind: "review",
        score: 0.15,
        title: `Review stale decision: ${d.title}`,
        reason: `Not reviewed in ${Math.round(days)} days. Decide whether to promote, downgrade, or drop.`,
        cta: "Review decision",
        target: { type: "decision", id: d.id },
        confidence: 0,
      });
    }
  });
  items.sort((a, b) => b.score - a.score);
  return items;
}

// Blind spots
function detectBlindSpots(ws) {
  const out = [];
  ws.problems.forEach((p) => {
    const linked = ws.signals.filter((s) => s.problem === p.id);
    if (linked.length === 1) {
      out.push({
        id: `bs-thin-${p.id}`,
        kind: "thin",
        title: "Thin evidence",
        detail: `"${p.title}" rests on a single signal.`,
        action: "Add more sources",
        target: { type: "problem", id: p.id },
      });
    }
    const types = new Set(linked.map((s) => s.type));
    const sources = new Set(linked.map((s) => s.source));
    if (linked.length >= 2 && types.size === 1 && types.has("stated")) {
      out.push({
        id: `bs-stated-${p.id}`,
        kind: "stated-only",
        title: "Stated-only evidence",
        detail: `"${p.title}" has no observed proof.`,
        action: "Add observed evidence",
        target: { type: "problem", id: p.id },
      });
    }
    if (linked.length >= 2 && sources.size === 1) {
      out.push({
        id: `bs-stream-${p.id}`,
        kind: "single-stream",
        title: "Single-stream bias",
        detail: `"${p.title}" is supported by one feedback stream only.`,
        action: "Add another stream",
        target: { type: "problem", id: p.id },
      });
    }
  });
  ws.decisions.forEach((d) => {
    const last = new Date(d.lastReview);
    const days = (Date.now() - last.getTime()) / 86400000;
    if (days > 21) {
      out.push({
        id: `bs-stale-${d.id}`,
        kind: "stale",
        title: "Stale decision",
        detail: `"${d.title}" hasn't been reviewed in ${Math.round(days)} days.`,
        action: "Review or downgrade",
        target: { type: "decision", id: d.id },
      });
    }
  });
  return out;
}

function buildIntegrationImport(integrationId, existingSources) {
  const integration = INTEGRATION_CATALOG.find((item) => item.id === integrationId);
  if (!integration) return null;
  const existing = existingSources.some((source) => source.integrationId === integrationId);
  if (existing) return { alreadySynced: true, integration };

  const sourceId = `src-${integrationId}-${Date.now()}`;
  const signals = extractSignalsFromText(integration.sampleText, sourceId);
  const source = {
    id: sourceId,
    title: integration.sampleTitle,
    flavor: integration.flavor,
    integrationId,
    integrationName: integration.name,
    addedAt: new Date().toISOString().slice(0, 10),
    excerpt: integration.sampleText.slice(0, 200),
    signals: signals.map((signal) => signal.id),
  };
  return { alreadySynced: false, integration, source, signals };
}

const FEEDBACK_CLUSTER_THEMES = [
  {
    id: "performance",
    match: ["dashboard", "slow", "timeout", "load", "export", "report", "widget"],
    title: "Reporting reliability is slowing product adoption",
    missing: "Add product analytics from affected accounts to confirm frequency and revenue impact.",
    action: "Validate a performance-focused fix before committing build capacity.",
  },
  {
    id: "onboarding",
    match: ["onboarding", "setup", "activation", "drop", "completion", "step", "mapping"],
    title: "Setup friction is blocking activation",
    missing: "Add funnel data and session notes for the failing setup step.",
    action: "Test the smallest onboarding change that removes the highest-friction step.",
  },
  {
    id: "enterprise",
    match: ["sso", "saml", "enterprise", "procurement", "security", "admin"],
    title: "Enterprise readiness is creating deal risk",
    missing: "Add CRM deal notes and lost-reason data before treating this as roadmap-critical.",
    action: "Validate the enterprise requirement with sales and customer success evidence.",
  },
  {
    id: "retention",
    match: ["churn", "renewal", "retention", "cohort", "expansion", "risk"],
    title: "Missing workflow depth may be increasing retention risk",
    missing: "Add renewal notes and usage data to separate one-off requests from churn drivers.",
    action: "Investigate whether this is a segment-specific retention problem.",
  },
  {
    id: "feature-requests",
    match: ["asked", "requested", "wants", "feature", "custom", "need"],
    title: "Feature requests need priority filtering",
    missing: "Add source diversity before turning these requests into roadmap commitments.",
    action: "Separate recurring segment needs from one-off requests before building.",
  },
];

function pickFeedbackTheme(text, fallbackId = "feature-requests") {
  const lc = text.toLowerCase();
  return FEEDBACK_CLUSTER_THEMES.find((theme) => theme.match.some((word) => lc.includes(word)))
    || FEEDBACK_CLUSTER_THEMES.find((theme) => theme.id === fallbackId)
    || FEEDBACK_CLUSTER_THEMES[0];
}

function buildFeedbackStreamMap({ product, selectedSourceIds = [], decisionPressure, manualEvidence = "" }) {
  const now = Date.now();
  const addedAt = new Date().toISOString().slice(0, 10);
  const sourceText = manualEvidence.trim();
  const selectedIntegrations = INTEGRATION_CATALOG.filter((item) => selectedSourceIds.includes(item.id));
  const evidenceItems = [
    ...selectedIntegrations.map((integration) => ({
      id: `src-onboarding-${integration.id}-${now}`,
      title: `${integration.name} stream - first signal map`,
      flavor: integration.flavor,
      integrationId: integration.id,
      integrationName: integration.name,
      text: integration.sampleText,
    })),
    ...(sourceText ? [{
      id: `src-onboarding-manual-${now}`,
      title: "Manual batch - first signal map",
      flavor: "interview",
      text: sourceText,
    }] : []),
  ];
  const sources = evidenceItems.map((item) => {
    const signalsForSource = extractSignalsFromText(item.text, item.id);
    return {
      source: {
        id: item.id,
        title: item.title,
        flavor: item.flavor,
        integrationId: item.integrationId,
        integrationName: item.integrationName,
        addedAt,
        excerpt: item.text.slice(0, 200),
        signals: signalsForSource.map((signal) => signal.id),
      },
      signals: signalsForSource,
    };
  });
  const grouped = {};
  sources.flatMap((item) => item.signals).forEach((signal) => {
    const theme = pickFeedbackTheme(signal.text);
    if (!grouped[theme.id]) grouped[theme.id] = { theme, signals: [] };
    grouped[theme.id].signals.push(signal);
  });

  const clusters = Object.values(grouped)
    .sort((a, b) => b.signals.length - a.signals.length)
    .slice(0, 4)
    .map((group, index) => {
      const problemId = `prob-stream-${group.theme.id}-${now}-${index}`;
      const observedCount = group.signals.filter((signal) => signal.type === "observed").length;
      const strongCount = group.signals.filter((signal) => signal.strength === "strong").length;
      const sourceCount = new Set(group.signals.map((signal) => signal.source)).size;
      const analyticsSignals = group.signals.filter((signal) => {
        const source = sources.find((item) => item.source.id === signal.source)?.source;
        return source?.flavor === "analytics" || source?.integrationId === "ga";
      }).length;
      const confidence = Math.min(94, Math.max(26, observedCount * 16 + strongCount * 14 + sourceCount * 10 + group.signals.length * 5));
      const evidenceStrength = confidence >= 70 ? "High" : confidence >= 45 ? "Medium" : "Low";
      const analyticsSupport = analyticsSignals > 0 ? "present" : "weak";
      const customerDiversity = sourceCount >= 3 ? "broad" : sourceCount === 2 ? "mixed" : "narrow";
      const risk = group.signals.length <= 1
        ? "Thin evidence"
        : sourceCount === 1
          ? "Single-stream bias"
          : observedCount === 0
            ? "Missing observed proof"
            : "Needs review";
      return {
        id: problemId,
        theme: group.theme,
        title: group.theme.title,
        signalIds: group.signals.map((signal) => signal.id),
        signalCount: group.signals.length,
        sourceCount,
        confidence,
        evidenceStrength,
        customerDiversity,
        analyticsSupport,
        risk,
        missingEvidence: group.theme.missing,
        nextAction: group.theme.action,
      };
    });

  const strongest = clusters[0];
  const signals = sources.flatMap((item) => item.signals).map((signal) => {
    const cluster = clusters.find((item) => item.signalIds.includes(signal.id));
    return {
      ...signal,
      problem: cluster?.id || null,
      suggestedProblem: cluster?.id || null,
      review: "needs_review",
      clusterConfidence: cluster?.confidence || 0,
    };
  });

  const problems = clusters.map((cluster) => ({
    id: cluster.id,
    title: cluster.title,
    summary: `Turako clustered ${cluster.signalCount} signal${cluster.signalCount !== 1 ? "s" : ""} across ${cluster.sourceCount} feedback stream${cluster.sourceCount !== 1 ? "s" : ""}. Risk: ${cluster.risk}.`,
    trend: cluster.signalCount >= 2 || cluster.sourceCount > 1 ? "rising" : "stable",
    impact: cluster.confidence >= 70 ? 8 : cluster.confidence >= 45 ? 6 : 5,
    addedAt,
    opportunities: strongest && cluster.id === strongest.id ? [`opp-stream-${now}`] : [],
  }));

  const opportunities = strongest ? [{
    id: `opp-stream-${now}`,
    title: strongest.nextAction,
    framing: "Suggested from the first feedback stream map. Validate with the team before committing roadmap capacity.",
    problem: strongest.id,
    readiness: strongest.confidence >= 70 ? "ready" : "validate",
    decision: null,
  }] : [];

  const workspace = {
    product: {
      name: product.name || "Untitled product",
      description: product.description || "",
      segments: product.segments || [],
      focus: product.focus || decisionPressure || "",
    },
    sources: sources.map((item) => item.source),
    signals,
    problems,
    opportunities,
    decisions: [],
    learnings: [],
  };

  const integrations = selectedSourceIds.reduce((acc, id) => {
    acc[id] = { id, status: "synced", lastSync: addedAt };
    return acc;
  }, { ...DEFAULT_INTEGRATIONS });

  return {
    decisionPressure,
    sources: workspace.sources,
    signals,
    clusters,
    strongestProblem: problems.find((problem) => problem.id === strongest?.id) || null,
    riskyArea: clusters.filter((cluster) => cluster.risk !== "Needs review").length
      ? `${clusters.filter((cluster) => cluster.risk !== "Needs review").length} noisy or thin area${clusters.filter((cluster) => cluster.risk !== "Needs review").length !== 1 ? "s" : ""} need review.`
      : "The first map has enough diversity to start prioritizing, but the team should still review clusters.",
    missingEvidence: strongest?.missingEvidence || "Add another feedback stream before making a roadmap call.",
    nextAction: strongest?.nextAction || "Preview feedback streams before deciding what to build next.",
    connectedSources: selectedIntegrations.map((item) => ({ id: item.id, name: item.name })),
    manualIncluded: Boolean(sourceText),
    sourceCount: workspace.sources.length,
    integrations,
    workspace,
  };
}

function buildOnboardingDecisionBrief({ product, decisionIntent, evidenceText, selectedSourceIds = [] }) {
  return buildFeedbackStreamMap({
    product,
    selectedSourceIds,
    decisionPressure: decisionIntent,
    manualEvidence: evidenceText,
  });
}

Object.assign(window, {
  SAMPLE_WORKSPACE,
  EMPTY_WORKSPACE,
  DEFAULT_INTEGRATIONS,
  INTEGRATION_CATALOG,
  extractSignalsFromText,
  computeConfidence,
  buildRecommendation,
  detectBlindSpots,
  buildIntegrationImport,
  buildFeedbackStreamMap,
  buildOnboardingDecisionBrief,
});

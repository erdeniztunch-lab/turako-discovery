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

function buildOnboardingDecisionBrief({ product, decisionIntent, evidenceText }) {
  const now = Date.now();
  const addedAt = new Date().toISOString().slice(0, 10);
  const sourceId = `src-onboarding-${now}`;
  const problemId = `prob-onboarding-${now}`;
  const opportunityId = `opp-onboarding-${now}`;
  const sourceText = evidenceText.trim();
  const rawSignals = extractSignalsFromText(sourceText, sourceId);
  const signals = rawSignals.map((signal) => ({ ...signal, problem: problemId }));
  const lc = sourceText.toLowerCase();

  const themes = [
    {
      id: "performance",
      match: ["dashboard", "slow", "timeout", "load", "export", "report"],
      title: "Reporting reliability is slowing product adoption",
      missing: "Add product analytics from affected accounts to confirm frequency and revenue impact.",
      action: "Validate a performance-focused fix before committing build capacity.",
    },
    {
      id: "onboarding",
      match: ["onboarding", "setup", "activation", "drop", "completion", "step"],
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
  ];

  const selectedTheme = themes.find((theme) => theme.match.some((word) => lc.includes(word))) || {
    id: "general",
    title: decisionIntent || "A customer problem needs clearer evidence",
    missing: "Add one observed data point and one more customer source before making a roadmap call.",
    action: "Collect a second source, then decide whether this problem deserves a product response.",
  };

  const observedCount = signals.filter((signal) => signal.type === "observed").length;
  const strongCount = signals.filter((signal) => signal.strength === "strong").length;
  const statedOnly = signals.length > 0 && signals.every((signal) => signal.type === "stated");
  const thinEvidence = signals.length <= 1;
  const confidenceHint = Math.min(92, Math.max(28, observedCount * 18 + strongCount * 14 + signals.length * 8));
  const impact = strongCount > 0 ? 8 : observedCount > 0 ? 7 : 5;
  const trend = lc.includes("week") || lc.includes("again") || lc.includes("recurring") || lc.includes("every") ? "rising" : "stable";

  const problem = {
    id: problemId,
    title: selectedTheme.title,
    summary: `Turako suggests this problem from the first evidence set: ${sourceText.slice(0, 150)}${sourceText.length > 150 ? "..." : ""}`,
    trend,
    impact,
    addedAt,
    opportunities: [opportunityId],
  };

  const opportunity = {
    id: opportunityId,
    title: selectedTheme.action,
    framing: "Suggested by the onboarding decision brief. Treat this as a next move to validate, not an automatic roadmap decision.",
    problem: problemId,
    readiness: thinEvidence || statedOnly ? "validate" : "ready",
    decision: null,
  };

  const source = {
    id: sourceId,
    title: "First evidence - onboarding brief",
    flavor: observedCount > 0 ? "analytics" : "interview",
    addedAt,
    excerpt: sourceText.slice(0, 200),
    signals: signals.map((signal) => signal.id),
  };

  const clusters = [
    {
      title: selectedTheme.title,
      signalCount: signals.length,
      confidence: confidenceHint,
    },
  ];

  const riskyArea = thinEvidence
    ? "Risk: thin evidence. This problem rests on a very small first sample."
    : statedOnly
      ? "Risk: stated-only evidence. Customers said it, but observed proof is still missing."
      : "Risk: early evidence. The direction is promising, but Turako would still look for a second source.";

  const workspace = {
    product: {
      name: product.name || "Untitled product",
      description: product.description || "",
      segments: product.segments || [],
      focus: product.focus || decisionIntent || "",
    },
    sources: [source],
    signals,
    problems: [problem],
    opportunities: [opportunity],
    decisions: [],
    learnings: [],
  };

  return {
    decisionIntent,
    source,
    signals,
    clusters,
    strongestProblem: problem,
    riskyArea,
    missingEvidence: selectedTheme.missing,
    nextAction: selectedTheme.action,
    workspace,
  };
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
  buildOnboardingDecisionBrief,
});

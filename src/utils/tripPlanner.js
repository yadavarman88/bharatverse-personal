import heritageData from "../data/heritage.json";

// ---------------------------------------------------------------------------
// Trip Planner engine — pure functions, no side effects, fully unit-testable.
// All costs are clearly-labelled editable assumptions (in INR), NOT official
// ASI tariffs. Users can override them in the UI before generating a plan.
// ---------------------------------------------------------------------------

export const TRAVEL_STYLES = {
  budget: {
    label: "Budget",
    lodgingPerNight: 1200,
    foodPerDay: 600,
    intercityHop: 1500, // train / bus between states
    localPerDay: 400, // cabs / autos inside a city
  },
  standard: {
    label: "Standard",
    lodgingPerNight: 3500,
    foodPerDay: 1500,
    intercityHop: 3000, // flights / AC trains
    localPerDay: 900,
  },
  premium: {
    label: "Premium",
    lodgingPerNight: 9000,
    foodPerDay: 3200,
    intercityHop: 6500,
    localPerDay: 2000,
  },
};

// Approximate ASI entry-fee assumption per heritage site (domestic visitor).
// Editable in the UI so the numbers stay honest and adjustable.
export const DEFAULT_TICKET_FEE = 50;

/** Sites grouped by state, in stable order */
export const groupByState = (siteIds) => {
  const sites = siteIds
    .map((id) => heritageData.find((s) => s.id === id))
    .filter(Boolean);
  const groups = [];
  for (const site of sites) {
    const last = groups[groups.length - 1];
    if (last && last.state === site.state) {
      last.sites.push(site);
    } else {
      groups.push({ state: site.state, sites: [site] });
    }
  }
  return groups;
};

/** Distribute state-groups across N days (max 2 groups/day to keep it sane) */
export const buildItinerary = (siteIds, days) => {
  const groups = groupByState(siteIds);
  const itinerary = [];
  if (groups.length === 0 || days < 1) return itinerary;

  // Aim: spread groups over days, min 1 group per day.
  let dayIndex = 0;
  let perDay = Math.max(1, Math.ceil(groups.length / days));
  if (perDay > 2) perDay = 2; // avoid cramming
  for (let d = 0; d < days; d++) {
    itinerary.push({ day: d + 1, title: "", sites: [] });
  }
  dayIndex = 0;
  let placed = 0;
  for (const group of groups) {
    if (placed >= perDay && dayIndex < days - 1) {
      dayIndex += 1;
      placed = 0;
    }
    itinerary[dayIndex].sites.push(...group.sites);
    placed++;
  }
  // Titles + trim empty trailing days
  return itinerary
    .filter((d) => d.sites.length > 0)
    .map((d) => ({
      ...d,
      title: [...new Set(d.sites.map((s) => s.state))].join(" → "),
    }));
};

/** Produce a full plan object with budget, or return validation errors */
export const generatePlan = ({
  siteIds,
  days,
  travelers = 1,
  costs = TRAVEL_STYLES.budget,
  ticketFee = DEFAULT_TICKET_FEE,
}) => {
  const errors = [];
  if (!siteIds || siteIds.length === 0)
    errors.push("Pick at least one heritage site to visit.");
  if (!days || days < 1 || days > 30)
    errors.push("Trip length must be between 1 and 30 days.");
  if (!travelers || travelers < 1 || travelers > 20)
    errors.push("Number of travellers must be between 1 and 20.");
  if (errors.length > 0) return { plan: null, errors };

  const itinerary = buildItinerary(siteIds, days);
  const states = groupByState(siteIds);
  const intercityHop = Math.max(0, states.length - 1);
  const nights = Math.max(0, days - 1);

  // Ticket fees are per person per site
  const ticketTotal = siteIds.length * ticketFee * travelers;

  const budgetLines = [
    {
      label: "Entry tickets",
      detail: `${siteIds.length} sites × ₹${ticketFee} × ${travelers} traveller(s)`,
      amount: ticketTotal,
    },
    {
      label: "Accommodation",
      detail: `${nights} night(s) × ₹${costs.lodgingPerNight} × ${travelers} room(s)`,
      amount: nights * costs.lodgingPerNight * travelers,
    },
    {
      label: "Food",
      detail: `${days} day(s) × ₹${costs.foodPerDay} × ${travelers} traveller(s)`,
      amount: days * costs.foodPerDay * travelers,
    },
    {
      label: "Intercity transport",
      detail: `${intercityHop} state hop(s) × ₹${costs.intercityHop} × ${travelers}`,
      amount: intercityHop * costs.intercityHop * travelers,
    },
    {
      label: "Local transport",
      detail: `${days} day(s) × ₹${costs.localPerDay} × ${travelers}`,
      amount: days * costs.localPerDay * travelers,
    },
  ];

  return {
    errors: null,
    plan: {
      siteIds: [...siteIds],
      days,
      travelers,
      costs,
      ticketFee,
      itinerary,
      budgetLines,
      total: budgetLines.reduce((sum, l) => sum + l.amount, 0),
      states: states.map((g) => g.state),
      generatedAt: new Date().toISOString(),
    },
  };
};

/** Markdown export for download / clipboard / print */
export const planToMarkdown = (plan) => {
  if (!plan) return "";
  const fmt = (n) => "₹" + n.toLocaleString("en-IN");
  const lines = [];
  lines.push(`# BharatVerse Trip Plan`);
  lines.push("");
  lines.push(
    `**${plan.days} day${plan.days > 1 ? "s" : ""} · ${plan.travelers} traveller(s) · States: ${plan.states.join(", ")}**`
  );
  lines.push("");
  for (const day of plan.itinerary) {
    lines.push(`## Day ${day.day} — ${day.title}`);
    for (const site of day.sites) {
      lines.push(`- **${site.title}** (${site.state}) — ${site.description}`);
    }
    lines.push("");
  }
  lines.push(`## Budget breakdown (approx.)`);
  for (const line of plan.budgetLines) {
    lines.push(`- ${line.label}: ${fmt(line.amount)} — _${line.detail}_`);
  }
  lines.push(`- **Total: ${fmt(plan.total)}**`);
  lines.push("");
  lines.push(
    `> Costs are editable assumptions for planning purposes, not official tariffs.`
  );
  lines.push(`_Generated ${new Date(plan.generatedAt).toLocaleString()}_`);
  return lines.join("\n");
};

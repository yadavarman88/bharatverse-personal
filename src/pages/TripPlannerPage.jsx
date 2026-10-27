import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Download,
  Copy,
  Check,
  Search,
  Trash2,
  Sparkles,
  AlertCircle,
  Save,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import { generatePlan, planToMarkdown, TRAVEL_STYLES, DEFAULT_TICKET_FEE } from "../utils/tripPlanner";
import heritageData from "../data/heritage.json";
import { useLocalStorage } from "../hooks/useLocalStorage";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const TripPlannerPage = ({ onSearchChange }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]); // array of site ids (ordered)
  const [days, setDays] = useState("4");
  const [travelers, setTravelers] = useState("2");
  const [style, setStyle] = useState("budget");
  const [ticketFee, setTicketFee] = useState(String(DEFAULT_TICKET_FEE));
  const [plan, setPlan] = useState(null);
  const [errors, setErrors] = useState([]);
  const [copied, setCopied] = useState(false);
  const [savedPlans, setSavedPlans] = useLocalStorage("bharatverse_trip_plans", []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = heritageData;
    if (!q) return all.slice(0, 12);
    return all
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) || s.state.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [search]);

  const toggleSite = (site) => {
    setSelected((prev) =>
      prev.includes(site.id)
        ? prev.filter((id) => id !== site.id)
        : [...prev, site.id]
    );
  };

  const removeSite = (id) => setSelected((prev) => prev.filter((x) => x !== id));

  const handleGenerate = () => {
    const customCosts = TRAVEL_STYLES[style];
    const { plan: newPlan, errors: newErrors } = generatePlan({
      siteIds: selected,
      days: parseInt(days, 10),
      travelers: parseInt(travelers, 10),
      costs: customCosts,
      ticketFee: Number(ticketFee) || DEFAULT_TICKET_FEE,
    });
    if (newErrors) {
      setErrors(newErrors);
      setPlan(null);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors([]);
    setPlan(newPlan);
    toast.success("Trip plan generated!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = () => {
    if (!plan) return;
    setSavedPlans([
      ...savedPlans.slice(-4),
      { ...plan, savedAt: new Date().toISOString() },
    ]);
    toast.success("Plan saved locally (last 5 kept).");
  };

  const handleDownload = () => {
    if (!plan) return;
    const blob = new Blob([planToMarkdown(plan)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bharatverse-trip-plan.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Itinerary downloaded as Markdown.");
  };

  const handleCopy = async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(planToMarkdown(plan));
      setCopied(true);
      toast.success("Itinerary copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard access was blocked by the browser.");
    }
  };

  useEffect(() => {
    onSearchChange?.("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-heritage-gradient text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heritage font-bold mb-3">
            Plan Your Heritage Trip
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto">
            Pick heritage sites, choose your travel style, and get a day-by-day
            itinerary with an honest, editable budget estimate.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: site picker */}
          <section className="lg:col-span-3 space-y-6" aria-label="Site picker">
            <div className="heritage-card p-6">
              <h2 className="text-xl font-heritage font-bold mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-saffron-600" /> Select sites to
                visit
              </h2>
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search 60+ heritage sites by name or state…"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-saffron-500"
                  aria-label="Search heritage sites"
                />
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No sites match “{search}”. Try a state name like “Rajasthan”.
                </div>
              )}
              <ul className="grid sm:grid-cols-2 gap-3">
                {filtered.map((site) => {
                  const active = selected.includes(site.id);
                  const order = selected.indexOf(site.id) + 1;
                  return (
                    <li key={site.id}>
                      <button
                        onClick={() => toggleSite(site)}
                        aria-pressed={active}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          active
                            ? "border-saffron-500 bg-saffron-50 shadow-md"
                            : "border-gray-200 hover:border-saffron-300 hover:bg-orange-50/50"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                            active
                              ? "bg-saffron-600 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                          aria-hidden
                        >
                          {active ? order : "+"}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-gray-900 text-sm truncate">
                            {site.title}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {site.state}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Selected sites */}
            <div className="heritage-card p-6">
              <h2 className="text-xl font-heritage font-bold mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-saffron-600" />
                Your route ({selected.length} site{selected.length === 1 ? "" : "s"})
              </h2>
              {selected.length === 0 ? (
                <p className="text-sm text-gray-500 flex items-center gap-2 py-2">
                  <AlertCircle size={16} /> Nothing selected yet — pick a few
                  sites above to build your route.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selected.map((id, i) => {
                    const site = heritageData.find(
                      (s) => s.id === id
                    );
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 bg-white border border-saffron-200 text-sm rounded-full pl-3 pr-1.5 py-1.5"
                      >
                        <span className="text-saffron-700 font-semibold">
                          {i + 1}. {site.title}
                        </span>
                        <button
                          onClick={() => removeSite(id)}
                          aria-label={`Remove ${site.title}`}
                          className="w-6 h-6 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 flex items-center justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Right: controls */}
          <section className="lg:col-span-2 space-y-6" aria-label="Trip options">
            <div className="heritage-card p-6 space-y-5">
              <h2 className="text-xl font-heritage font-bold flex items-center gap-2">
                <Wallet size={20} className="text-saffron-600" /> Trip details
              </h2>

              {errors.length > 0 && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 space-y-1"
                >
                  {errors.map((e) => (
                    <p key={e} className="flex items-center gap-2">
                      <AlertCircle size={14} /> {e}
                    </p>
                  ))}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Trip length (days)
                </span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Travellers
                </span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </label>

              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 mb-2">
                  Travel style
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TRAVEL_STYLES).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => setStyle(key)}
                      aria-pressed={style === key}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        style === key
                          ? "bg-saffron-600 text-white border-saffron-600 shadow"
                          : "border-gray-300 text-gray-600 hover:border-saffron-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Entry fee per site (₹ — assumption, editable)
                </span>
                <input
                  type="number"
                  min="0"
                  value={ticketFee}
                  onChange={(e) => setTicketFee(e.target.value)}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleGenerate}
                  className="btn-heritage py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} /> Generate plan
                </button>
                <button
                  onClick={handleSave}
                  disabled={!plan}
                  className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Save size={18} /> Save plan
                </button>
              </div>
            </div>

            {savedPlans.length > 0 && (
              <div className="heritage-card p-6">
                <h3 className="font-heritage font-bold mb-3">
                  Saved plans ({savedPlans.length})
                </h3>
                <ul className="space-y-2 text-sm">
                  {savedPlans
                    .slice()
                    .reverse()
                    .map((p, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="text-gray-600">
                          {p.days}d · {p.siteIds.length} sites · {fmt(p.total)}
                        </span>
                        <button
                          onClick={() => {
                            setPlan(p);
                            setSelected(p.siteIds);
                            setDays(String(p.days));
                            setTravelers(String(p.travelers));
                            toast.success("Saved plan loaded.");
                          }}
                          className="text-saffron-600 hover:underline font-medium"
                        >
                          Load
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Itinerary */}
        {plan && (
          <section id="itinerary" className="mt-12" aria-label="Generated itinerary">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-3xl font-heritage font-bold heritage-text-gradient">
                Your {plan.days}-Day Itinerary
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-xl border border-saffron-300 text-saffron-700 font-semibold text-sm hover:bg-saffron-50 flex items-center gap-2"
                >
                  <Download size={16} /> Download .md
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl border border-saffron-300 text-saffron-700 font-semibold text-sm hover:bg-saffron-50 flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <ol className="space-y-4 mb-10">
              {plan.itinerary.map((day) => (
                <li key={day.day} className="heritage-card p-6">
                  <h3 className="text-lg font-heritage font-bold mb-3 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-saffron-500 to-heritage-red-500 text-white flex items-center justify-center text-sm font-bold">
                      D{day.day}
                    </span>
                    {day.title}
                  </h3>
                  <ul className="space-y-2">
                    {day.sites.map((site) => (
                      <li
                        key={site.id}
                        className="flex items-start gap-3 text-sm text-gray-700 bg-orange-50/50 rounded-xl p-3"
                      >
                        <MapPin
                          size={15}
                          className="text-saffron-600 mt-0.5 shrink-0"
                        />
                        <span>
                          <strong>{site.title}</strong> — {site.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            {/* Budget */}
            <div className="heritage-card p-6">
              <h3 className="text-xl font-heritage font-bold mb-5 flex items-center gap-2">
                <IndianRupee size={20} className="text-saffron-600" /> Budget
                breakdown
                {plan.travelers > 1 && (
                  <span className="text-sm font-normal text-gray-500">
                    (for {plan.travelers} travellers)
                  </span>
                )}
              </h3>
              <dl className="space-y-3">
                {plan.budgetLines.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-center justify-between gap-4 text-sm border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <dt className="font-semibold text-gray-800">
                        {line.label}
                      </dt>
                      <dd className="text-xs text-gray-500">{line.detail}</dd>
                    </div>
                    <dd className="font-bold text-gray-900 whitespace-nowrap">
                      {fmt(line.amount)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-base">
                  <dt className="font-heritage font-bold text-saffron-700">
                    Estimated total
                  </dt>
                  <dd className="font-heritage font-bold text-saffron-700 text-xl">
                    {fmt(plan.total)}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-gray-500 mt-4">
                Costs are editable assumptions for travel planning — not official
                ASI tariffs or live prices. Adjust the fee and style inputs and
                regenerate for a different estimate.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TripPlannerPage;

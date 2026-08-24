"use client";
import { useEffect, useMemo, useState } from "react";
import { Tracker, StatusPill, VerticalTimeline } from "@/components/Tracker";
import Link from "next/link";

type Project = any;

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"/></svg>
);
const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>
);

export default function TrackPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [inputQ, setInputQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load from URL ?q= on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const qq = params.get("q") ?? params.get("lotNo") ?? params.get("lot") ?? "";
    if (id) setActiveId(id);
    if (qq) {
      setQ(qq);
      setInputQ(qq);
      doSearch(qq);
    }
  }, []);

  async function doSearch(query: string) {
    const qq = query.trim();
    if (!qq) {
      setError("Please enter a Lot number");
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    setQ(qq);
    const url = new URL(window.location.href);
    url.searchParams.set("q", qq);
    window.history.replaceState({}, "", url.toString());
    try {
      const r = await fetch(`/api/track?q=${encodeURIComponent(qq)}`);
      const j = await r.json();
      setProjects(j.projects ?? []);
      if (j.projects?.length) setActiveId(j.projects[0].id);
      else setActiveId(null);
    } catch (e: any) {
      setError("Failed to fetch — try again");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(inputQ);
  }

  const filtered = useMemo(() => {
    let list = projects;
    if (statusFilter !== "ALL") list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [projects, statusFilter]);

  const active = useMemo(() => projects.find((p) => p.id === activeId) ?? filtered[0] ?? projects[0] ?? null, [projects, activeId, filtered]);

  const hasResults = searched && !loading;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-4 items-end justify-between border-b border-[#dcd3b8] pb-4">
        <div>
          <div className="rule-label !text-[10px] text-[#1d3820]">Public Status Board</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#17170f] mt-1">Track My Project</h1>
          <p className="text-sm text-[#645b41] mt-1">No login needed — just type your <b>Lot Number</b> (e.g., 105). Ikaw ra mag-input, si client kay view ra.</p>
        </div>
        <Link href="/staff" className="hidden sm:inline-flex items-center gap-2 bg-[#1f1c12] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#17170f] transition-colors">Staff — input details<ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>

      {/* PUBLIC SEARCH — hero */}
      <form onSubmit={onSubmit} className="mt-6 bg-[#fcfaf1] border border-[#dcd3b8] card p-5 relative overflow-hidden">
        <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-[#1d3820]" />
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              placeholder="Enter Lot Number — e.g., 105"
              className="w-full border border-[#c9bfa3] bg-white pl-10 pr-4 py-3.5 text-[17px] sm:text-[15px] font-medium placeholder:text-[#a79c7d] focus:outline-none focus:ring-2 focus:ring-[#1d3820]/15 focus:border-[#1d3820]"
              autoFocus
              inputMode="numeric"
            />
            <SearchIcon className="absolute left-3.5 top-4 text-[#837858]" />
          </div>
          <button type="submit" disabled={loading} className="bg-[#1d3820] hover:bg-[#16301a] disabled:opacity-50 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.08em] shrink-0">
            {loading ? "Searching…" : "Track"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 items-center font-mono text-xs text-[#645b41]">
          <span>Try:</span>
          <button type="button" onClick={() => { setInputQ("105"); doSearch("105"); }} className="px-3 py-1.5 border border-[#dcd3b8] bg-white hover:border-[#1d3820]">105</button>
          <button type="button" onClick={() => { setInputQ("9999"); doSearch("9999"); }} className="px-3 py-1.5 border border-[#dcd3b8] bg-white hover:border-[#1d3820]">9999</button>
          <button type="button" onClick={() => { setInputQ("Khent"); doSearch("Khent"); }} className="px-3 py-1.5 border border-[#dcd3b8] bg-white hover:border-[#1d3820]">Khent</button>
          <span className="hidden sm:inline text-[#a79c7d]">• Also works with TCT, Tax Dec, or name</span>
        </div>
        {error && <div className="mt-3 text-sm text-[#7a2a24] bg-[#f9ebea] border border-[#e6c0bb] px-3 py-2">{error}</div>}
      </form>

      {/* status filter — only show after search */}
      {searched && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1">
            {["ALL", "CLIENT_REQUEST", "DOCUMENT_CHECK", "QUOTATION", "PAYMENT_CONFIRMATION", "SITE_SURVEY", "PROCESSING", "DOCUMENTATION", "COMPLETED"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.05em] border whitespace-nowrap ${statusFilter === s ? "bg-[#1f1c12] text-white border-[#1f1c12]" : "bg-[#fcfaf1] text-[#645b41] border-[#dcd3b8] hover:border-[#1d3820]"}`}>
                {s === "ALL" ? `All (${projects.length})` : s.replaceAll("_", " ")}
              </button>
            ))}
          </div>
          {hasResults && <span className="font-mono text-[11px] text-[#837858]">{filtered.length} result(s) for &quot;{q}&quot;</span>}
        </div>
      )}

      {/* results */}
      {!searched ? (
        <div className="mt-6 border border-[#b9caae] bg-[#eef3e9] p-8 text-center">
          <div className="mx-auto h-12 w-12 bg-white border border-[#b9caae] grid place-items-center font-mono font-bold text-[#1d3820]">SL</div>
          <div className="font-display font-bold text-lg mt-3 text-[#17170f]">Dili na kinahanglan mag tawag o muanhi sa balay</div>
          <div className="text-sm text-[#645b41] mt-1 max-w-xl mx-auto">Si client kay mutype lang sa Lot Number sa taas, mugawas dayon ang status sa iyang papel — e.g., &quot;kulang tax declaration&quot; or &quot;submit na sa DENR&quot;. Ikaw ra ang mag-handle sa input sa staff portal.</div>
          <div className="mt-4 inline-flex flex-wrap gap-2 font-mono text-[11px]">
            <span className="bg-white border border-[#dcd3b8] px-3 py-1.5">Lot 105 — Relocation — Aug 2, 2026</span>
            <span className="bg-white border border-[#dcd3b8] px-3 py-1.5">Status: kulang tax declaration</span>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#fcfaf1] border border-[#dcd3b8] card overflow-hidden">
            <div className="p-4 border-b border-[#dcd3b8] flex justify-between items-center">
              <div className="font-semibold text-sm text-[#17170f]">Results</div>
              <span className="font-mono text-[11px] border border-[#dcd3b8] bg-[#f0ebdd] px-2 py-1 text-[#4a4230]">{filtered.length} / {projects.length}</span>
            </div>
            <div className="divide-y divide-[#e2dac4] max-h-[68vh] overflow-auto">
              {loading && <div className="p-6 text-sm font-mono text-[#645b41]">Searching lot {q}…</div>}
              {!loading && hasResults && filtered.length === 0 && (
                <div className="p-8 text-center">
                  <div aria-hidden className="mx-auto h-10 w-10 border border-[#dcd3b8] bg-[#f0ebdd] grid place-items-center font-mono text-xs text-[#837858]">—</div>
                  <div className="font-medium mt-2 text-sm text-[#17170f]">No record for &quot;{q}&quot;</div>
                  <div className="text-xs text-[#837858]">Check lot number or ask staff to input. Example try 9999.</div>
                </div>
              )}
              {filtered.map((p) => {
                const active_ = active?.id === p.id;
                const surveyDateLabel = p.surveyDate ? new Date(p.surveyDate).toLocaleDateString() : p.appointments?.[0]?.date ? new Date(p.appointments[0].date).toLocaleDateString() : null;
                return (
                  <button key={p.id} onClick={() => setActiveId(p.id)} className={`w-full text-left p-4 hover:bg-white transition flex gap-3 ${active_ ? "bg-[#eef3e9]" : ""}`}>
                    <div aria-hidden className={`h-9 w-9 border grid place-items-center font-mono text-[10px] font-bold tracking-widest shrink-0 ${active_ ? "bg-[#1d3820] text-white border-[#1d3820]" : "bg-white border-[#dcd3b8] text-[#645b41]"}`}>{p.property?.lotNo?.slice(0,2) ?? p.property?.label?.slice(0,2).toUpperCase() ?? "PR"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-2 items-center"><span className="font-medium text-sm text-[#17170f] truncate">{p.property?.label}</span><span className="hidden sm:inline"><StatusPill status={p.status} /></span></div>
                      <div className="text-xs text-[#645b41] truncate font-mono">
                        {p.surveyType.replaceAll("_", " ")} • {p.property?.municipality} • Lot {p.property?.lotNo ?? "—"} {p.guestName ? `• ${p.guestName}` : ""}
                      </div>
                      {p.statusMessage && <div className="text-xs text-[#8a3d16] truncate mt-0.5">→ {p.statusMessage}</div>}
                      {surveyDateLabel && <div className="text-xs text-[#837858]">Survey: {surveyDateLabel}</div>}
                      <div className="sm:hidden mt-1"><StatusPill status={p.status} /></div>
                    </div>
                    <div aria-hidden className={`h-6 w-6 grid place-items-center ${active_ ? "text-[#1d3820]" : "text-[#a79c7d]"}`}><ArrowRight className="h-4 w-4" /></div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!active ? (
              <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-10 text-center">
                <div aria-hidden className="mx-auto h-10 w-10 border border-[#1d3820]/30 bg-[#eef3e9] grid place-items-center font-mono text-[10px] font-bold text-[#1d3820]">SL</div>
                <div className="font-semibold mt-3 text-[#17170f]">Select a result</div>
                <div className="text-sm text-[#645b41]">Makita nimo ang full status, survey date, ug history diri.</div>
              </div>
            ) : (
              <>
                {/* statusMessage banner — most important for client */}
                {active.statusMessage && (
                  <div className="bg-[#fbf3df] border border-[#ebd094] p-4 flex gap-3 items-start">
                    <div className="h-8 w-8 shrink-0 bg-[#c08a2d] text-white grid place-items-center font-bold">!</div>
                    <div className="flex-1 min-w-0">
                      <div className="rule-label !text-[9px] text-[#714814]">Status Update From Staff</div>
                      <div className="text-sm font-medium text-[#17170f] mt-0.5 whitespace-pre-wrap">{active.statusMessage}</div>
                      <div className="font-mono text-[11px] text-[#645b41] mt-1">Updated {new Date(active.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                )}

                <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-6 relative overflow-hidden">
                  <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-[#1d3820]" />
                  <div className="flex flex-wrap gap-3 items-start justify-between">
                    <div className="min-w-0">
                      <h2 className="font-display font-bold tracking-tight text-[18px] text-[#17170f] truncate">{active.property?.label} <span className="font-mono font-normal text-[#837858] text-xs text-[#a79c7d]">#{active.id.slice(0,8)}</span></h2>
                      <div className="text-xs text-[#645b41] font-mono">
                        {active.surveyType.replaceAll("_", " ")} • {active.property?.barangay ? active.property.barangay + ", " : ""}{active.property?.municipality}, {active.property?.province} • Lot {active.property?.lotNo ?? "—"} {active.guestName ? `• Client: ${active.guestName}` : ""}
                      </div>
                      <div className="text-xs text-[#837858]">Survey Date: {active.surveyDate ? new Date(active.surveyDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : active.appointments?.[0] ? new Date(active.appointments[0].date).toLocaleDateString() : "—"} {active.preferredSchedule ? `• Preferred: ${active.preferredSchedule}` : ""}</div>
                    </div>
                    <StatusPill status={active.status} />
                  </div>
                  <div className="mt-5"><Tracker status={active.status} /></div>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="border border-[#dcd3b8] bg-[#f0ebdd] p-4">
                      <div className="rule-label !text-[9px] text-[#645b41]">Property</div>
                      <div className="font-medium mt-1 text-[#17170f]">{active.property?.label}</div>
                      <div className="text-xs text-[#645b41] font-mono">{active.property?.lotNo ? `Lot ${active.property.lotNo} • ` : ""}TCT {active.property?.titleNo ?? "— (untitled)"} {active.property?.taxDecNo ? `• Tax Dec ${active.property.taxDecNo}` : ""} • {active.property?.areaSqm ? `${active.property.areaSqm} sqm` : ""}</div>
                      <div className="text-xs text-[#837858] mt-1">{active.property?.addressNotes ?? ""}</div>
                    </div>
                    <div className="border border-[#dcd3b8] bg-[#f0ebdd] p-4">
                      <div className="rule-label !text-[9px] text-[#645b41]">Request</div>
                      <div className="mt-1 text-[#17170f]">{active.purpose}</div>
                      <div className="text-xs text-[#645b41] mt-1">Preferred: {active.preferredSchedule ?? "—"}</div>
                      <Link href={`/projects/${active.id}`} className="inline-flex mt-3 text-xs font-bold text-[#1d3820] hover:underline uppercase tracking-[0.05em]">Open details →</Link>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5">
                    <div className="font-semibold text-sm text-[#17170f]">History</div>
                    <div className="font-mono text-[11px] text-[#837858]">Every update logged — staff note + date.</div>
                    <div className="mt-4 max-h-[260px] overflow-auto pr-1">
                      <VerticalTimeline status={active.status} history={(active.statusHistory ?? []).map((h:any)=> ({ fromStatus:h.fromStatus, toStatus:h.toStatus, createdAt:h.createdAt, note:h.note }))} />
                    </div>
                  </div>
                  <div className="bg-[#16301a] text-white border border-[#0c1a0e] p-5">
                    <div className="font-semibold">Need help?</div>
                    <div className="font-mono text-[11px] text-white/80">Dili na kinahanglan mutawag — pero kung naa pangutana, contact staff. Ikaw ra ang mag-update sa status.</div>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="border border-white/20 bg-white text-[#17170f] p-3 font-mono text-xs">Latest: {active.statusMessage ?? "No extra note — check timeline for live updates."}</li>
                      <li className="border border-white/20 bg-white/10 p-3 font-mono text-xs">Survey: {active.surveyDate ? new Date(active.surveyDate).toLocaleDateString() : "TBD"} • {active.surveyType.replaceAll("_"," ")}</li>
                    </ul>
                    <Link href={`/projects/${active.id}`} className="mt-3 inline-flex bg-white text-[#16301a] px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#eef3e9]">View full details</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

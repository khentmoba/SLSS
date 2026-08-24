"use client";
import { useEffect, useMemo, useState } from "react";
import { Tracker, StatusPill, VerticalTimeline } from "@/components/Tracker";
import Link from "next/link";

type Project = any;

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
    // update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("q", qq);
    window.history.replaceState({}, "", url.toString());
    try {
      const r = await fetch(`/api/track?q=${encodeURIComponent(qq)}`);
      const j = await r.json();
      setProjects(j.projects ?? []);
      // auto-select first
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Track My Project</h1>
          <p className="text-sm text-zinc-600">No login needed — just type your <b>Lot Number</b> (e.g., 105). Ikaw ra mag-input, si client kay view ra.</p>
        </div>
        <Link href="/staff" className="hidden sm:inline-flex bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold">Staff — input details →</Link>
      </div>

      {/* PUBLIC SEARCH — hero */}
      <form onSubmit={onSubmit} className="mt-6 bg-white rounded-[20px] border border-zinc-200 card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              placeholder="Enter Lot Number — e.g., 105"
              className="w-full rounded-full border border-zinc-300 bg-white pl-10 pr-4 py-3.5 text-[17px] sm:text-[15px] font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              autoFocus
              inputMode="numeric"
            />
            <span aria-hidden="true" className="absolute left-3.5 top-3.5 text-zinc-500 text-lg">⌕</span>
          </div>
          <button type="submit" disabled={loading} className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-wide shrink-0">
            {loading ? "Searching…" : "TRACK →"}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 items-center text-xs text-zinc-600">
          <span>Try:</span>
          <button type="button" onClick={() => { setInputQ("105"); doSearch("105"); }} className="px-3 py-1.5 rounded-full border bg-zinc-50 hover:bg-zinc-100">105</button>
          <button type="button" onClick={() => { setInputQ("9999"); doSearch("9999"); }} className="px-3 py-1.5 rounded-full border bg-zinc-50 hover:bg-zinc-100">9999</button>
          <button type="button" onClick={() => { setInputQ("Khent"); doSearch("Khent"); }} className="px-3 py-1.5 rounded-full border bg-zinc-50 hover:bg-zinc-100">Khent</button>
          <span className="hidden sm:inline text-zinc-400">• Also works with TCT, Tax Dec, or name</span>
        </div>
        {error && <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}
      </form>

      {/* status filter — only show after search */}
      {searched && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1">
            {["ALL", "CLIENT_REQUEST", "DOCUMENT_CHECK", "QUOTATION", "PAYMENT_CONFIRMATION", "SITE_SURVEY", "PROCESSING", "DOCUMENTATION", "COMPLETED"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3.5 py-2 rounded-full text-xs font-medium border whitespace-nowrap ${statusFilter === s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"}`}>
                {s === "ALL" ? `All (${projects.length})` : s.replaceAll("_", " ")}
              </button>
            ))}
          </div>
          {hasResults && <span className="text-xs text-zinc-500">{filtered.length} result(s) for &quot;{q}&quot;</span>}
        </div>
      )}

      {/* results */}
      {!searched ? (
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-[20px] p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-emerald-100 grid place-items-center text-emerald-700 font-bold">SL</div>
          <div className="font-semibold mt-3">Dili na kinahanglan mag tawag o muanhi sa balay</div>
          <div className="text-sm text-zinc-600 mt-1 max-w-xl mx-auto">Si client kay mutype lang sa Lot Number sa taas, mugawas dayon ang status sa iyang papel — e.g., &quot;kulang tax declaration&quot; or &quot;submit na sa DENR&quot;. Ikaw ra ang mag-handle sa input sa staff portal.</div>
          <div className="mt-4 inline-flex gap-2 text-xs">
            <span className="bg-white border px-3 py-1.5 rounded-full">Lot 105 — Relocation — Aug 2, 2026</span>
            <span className="bg-white border px-3 py-1.5 rounded-full">Status: kulang tax declaration</span>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-[20px] border border-zinc-200 card overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="font-semibold text-sm">Results</div>
              <span className="text-xs bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-full">{filtered.length} / {projects.length}</span>
            </div>
            <div className="divide-y max-h-[68vh] overflow-auto">
              {loading && <div className="p-6 text-sm text-zinc-600">Searching lot {q}…</div>}
              {!loading && hasResults && filtered.length === 0 && (
                <div className="p-8 text-center">
                  <div aria-hidden="true" className="mx-auto h-10 w-10 rounded-xl bg-zinc-50 border grid place-items-center text-[10px] font-bold tracking-widest text-zinc-700">—</div>
                  <div className="font-medium mt-2 text-sm">No record for &quot;{q}&quot;</div>
                  <div className="text-xs text-zinc-600">Check lot number or ask staff to input. Example try 9999.</div>
                </div>
              )}
              {filtered.map((p) => {
                const active_ = active?.id === p.id;
                const surveyDateLabel = p.surveyDate ? new Date(p.surveyDate).toLocaleDateString() : p.appointments?.[0]?.date ? new Date(p.appointments[0].date).toLocaleDateString() : null;
                return (
                  <button key={p.id} onClick={() => setActiveId(p.id)} className={`w-full text-left p-4 hover:bg-zinc-50 transition flex gap-3 ${active_ ? "bg-emerald-50/70" : ""}`}>
                    <div aria-hidden="true" className={`h-9 w-9 rounded-xl border grid place-items-center text-[10px] font-bold tracking-widest shrink-0 ${active_ ? "bg-emerald-700 text-white border-emerald-700" : "bg-zinc-50 border-zinc-200 text-zinc-700"}`}>{p.property?.lotNo?.slice(0,2) ?? p.property?.label?.slice(0,2).toUpperCase() ?? "PR"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-2 items-center"><span className="font-medium text-sm truncate">{p.property?.label}</span><span className="hidden sm:inline"><StatusPill status={p.status} /></span></div>
                      <div className="text-xs text-zinc-600 truncate">
                        {p.surveyType.replaceAll("_", " ")} • {p.property?.municipality} • Lot {p.property?.lotNo ?? "—"} {p.guestName ? `• ${p.guestName}` : ""}
                      </div>
                      {p.statusMessage && <div className="text-xs text-amber-700 truncate mt-0.5">→ {p.statusMessage}</div>}
                      {surveyDateLabel && <div className="text-xs text-zinc-500">Survey: {surveyDateLabel}</div>}
                      <div className="sm:hidden mt-1"><StatusPill status={p.status} /></div>
                    </div>
                    <div aria-hidden="true" className={`h-6 w-6 rounded-full border grid place-items-center text-xs ${active_ ? "bg-emerald-700 text-white border-emerald-700" : "border-zinc-200 text-zinc-500"}`}>›</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!active ? (
              <div className="bg-white rounded-[20px] border border-zinc-200 card p-10 text-center">
                <div aria-hidden="true" className="mx-auto h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center text-[10px] font-bold tracking-widest text-emerald-800">SL</div>
                <div className="font-semibold mt-2">Select a result</div>
                <div className="text-sm text-zinc-600">Makita nimo ang full status, survey date, ug history diri.</div>
              </div>
            ) : (
              <>
                {/* statusMessage banner — most important for client */}
                {active.statusMessage && (
                  <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-full bg-amber-500 text-white grid place-items-center shrink-0">!</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs tracking-widest font-bold text-amber-800">STATUS UPDATE FROM STAFF</div>
                      <div className="text-sm font-medium text-zinc-900 mt-0.5 whitespace-pre-wrap">{active.statusMessage}</div>
                      <div className="text-xs text-zinc-600 mt-1">Updated {new Date(active.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-[20px] border border-zinc-200 card p-6">
                  <div className="flex flex-wrap gap-3 items-start justify-between">
                    <div className="min-w-0">
                      <h2 className="font-bold tracking-tight text-[17px] truncate">{active.property?.label} <span className="font-normal text-zinc-500 text-xs">#{active.id.slice(0,8)}</span></h2>
                      <div className="text-xs text-zinc-600">
                        {active.surveyType.replaceAll("_", " ")} • {active.property?.barangay ? active.property.barangay + ", " : ""}{active.property?.municipality}, {active.property?.province} • Lot {active.property?.lotNo ?? "—"} {active.guestName ? `• Client: ${active.guestName}` : ""}
                      </div>
                      <div className="text-xs text-zinc-600">Survey Date: {active.surveyDate ? new Date(active.surveyDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : active.appointments?.[0] ? new Date(active.appointments[0].date).toLocaleDateString() : "—"} {active.preferredSchedule ? `• Preferred: ${active.preferredSchedule}` : ""}</div>
                    </div>
                    <StatusPill status={active.status} />
                  </div>
                  <div className="mt-5"><Tracker status={active.status} /></div>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                      <div className="text-xs tracking-widest font-semibold text-zinc-500">PROPERTY</div>
                      <div className="font-medium mt-1">{active.property?.label}</div>
                      <div className="text-xs text-zinc-600">{active.property?.lotNo ? `Lot ${active.property.lotNo} • ` : ""}TCT {active.property?.titleNo ?? "— (untitled)"} {active.property?.taxDecNo ? `• Tax Dec ${active.property.taxDecNo}` : ""} • {active.property?.areaSqm ? `${active.property.areaSqm} sqm` : ""}</div>
                      <div className="text-xs text-zinc-600 mt-1">{active.property?.addressNotes ?? ""}</div>
                    </div>
                    <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                      <div className="text-xs tracking-widest font-semibold text-zinc-500">REQUEST</div>
                      <div className="mt-1">{active.purpose}</div>
                      <div className="text-xs text-zinc-600 mt-1">Preferred: {active.preferredSchedule ?? "—"}</div>
                      <Link href={`/projects/${active.id}`} className="inline-flex mt-3 text-xs font-semibold text-emerald-700 hover:underline">Open details →</Link>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
                    <div className="text-sm font-semibold">History</div>
                    <div className="text-xs text-zinc-600">Every update logged — staff note + date.</div>
                    <div className="mt-4 max-h-[260px] overflow-auto pr-1">
                      <VerticalTimeline status={active.status} history={(active.statusHistory ?? []).map((h:any)=> ({ fromStatus:h.fromStatus, toStatus:h.toStatus, createdAt:h.createdAt, note:h.note }))} />
                    </div>
                  </div>
                  <div className="bg-emerald-700 text-white rounded-[20px] p-5">
                    <div className="text-sm font-semibold">Need help?</div>
                    <div className="text-xs text-white/90">Dili na kinahanglan mutawag — pero kung naa pangutana, contact staff. Ikaw ra ang mag-update sa status.</div>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="rounded-xl bg-white text-zinc-800 p-3 border text-xs">Latest: {active.statusMessage ?? "No extra note — check timeline for live updates."}</li>
                      <li className="rounded-xl bg-white/10 p-3 border border-white/20 text-xs">Survey: {active.surveyDate ? new Date(active.surveyDate).toLocaleDateString() : "TBD"} • {active.surveyType.replaceAll("_"," ")}</li>
                    </ul>
                    <Link href={`/projects/${active.id}`} className="mt-3 inline-flex bg-white text-emerald-800 px-4 py-2 rounded-full text-xs font-semibold">View full details</Link>
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
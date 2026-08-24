"use client";
import { useEffect, useMemo, useState } from "react";
import { Tracker, StatusPill, VerticalTimeline } from "@/components/Tracker";
import Link from "next/link";

type Project = any;

export default function TrackPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) setActiveId(id);
    fetch("/api/projects").then(r=>r.json()).then(j=>{ setProjects(j.projects ?? []); setLoading(false); });
  }, []);

  const filtered = useMemo(()=>{
    let list = projects;
    if(statusFilter!=="ALL") list = list.filter(p=>p.status===statusFilter);
    if(q.trim()){
      const qq = q.toLowerCase();
      list = list.filter(p=> (p.property?.label+" "+p.property?.municipality+" "+p.surveyType+" "+p.id).toLowerCase().includes(qq));
    }
    return list;
  },[projects, q, statusFilter]);

  const active = useMemo(()=> projects.find(p=>p.id===activeId) ?? filtered[0] ?? projects[0] ?? null, [projects, activeId, filtered]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Track My Project</h1>
          <p className="text-sm text-zinc-600">Live 8-step tracker • history • notifications. Search by lot, TCT, or survey type.</p>
        </div>
        <Link href="/request" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">+ New request</Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[220px] max-w-md relative">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Lot 1234, TCT, Cabadbaran…" className="w-full rounded-full border border-zinc-200 bg-white pl-9 pr-3 py-2.5 text-[16px] sm:text-sm" />
          <span aria-hidden="true" className="absolute left-3 top-2.5 text-zinc-600">⌕</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {["ALL","CLIENT_REQUEST","DOCUMENT_CHECK","QUOTATION","PAYMENT_CONFIRMATION","SITE_SURVEY","PROCESSING","DOCUMENTATION","COMPLETED"].map(s=> (
            <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3.5 py-2 rounded-full text-xs font-medium border whitespace-nowrap ${statusFilter===s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"}`}>{s==="ALL" ? `All (${projects.length})` : s.replaceAll("_"," ")}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[20px] border border-zinc-200 card overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="font-semibold text-sm">My Projects</div>
            <span className="text-xs bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-full">{filtered.length} / {projects.length}</span>
          </div>
          <div className="divide-y max-h-[68vh] overflow-auto">
            {loading && <div className="p-6 text-sm text-zinc-600">Loading…</div>}
            {!loading && filtered.length===0 && <div className="p-8 text-center"><div aria-hidden="true" className="mx-auto h-10 w-10 rounded-xl bg-zinc-50 border grid place-items-center text-[10px] font-bold tracking-widest text-zinc-700">—</div><div className="font-medium mt-2 text-sm">No matches</div><div className="text-xs text-zinc-600">Try another search or <Link href="/request" className="underline text-emerald-700">start a survey</Link></div></div>}
            {filtered.map(p=> {
              const active_ = active?.id===p.id;
              return (
                <button key={p.id} onClick={()=>setActiveId(p.id)} className={`w-full text-left p-4 hover:bg-zinc-50 transition flex gap-3 ${active_ ? "bg-emerald-50/70" : ""}`}>
                  <div aria-hidden="true" className={`h-9 w-9 rounded-xl border grid place-items-center text-[10px] font-bold tracking-widest shrink-0 ${active_ ? "bg-emerald-700 text-white border-emerald-700" : "bg-zinc-50 border-zinc-200 text-zinc-700"}`}>{p.property?.label?.slice(0,2).toUpperCase() ?? "PR"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-2 items-center"><span className="font-medium text-sm truncate">{p.property?.label}</span><span className="hidden sm:inline"><StatusPill status={p.status} /></span></div>
                    <div className="text-xs text-zinc-600 truncate">{p.surveyType.replaceAll("_"," ")} • {p.property?.municipality} • #{p.id.slice(0,6)}</div>
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
              <div className="font-semibold mt-2">Select a project</div>
              <div className="text-sm text-zinc-600">Your 8-step tracker and history will appear here. No more “Unsa na status?”</div>
              <Link href="/request" className="inline-flex mt-4 bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">Start your survey</Link>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-[20px] border border-zinc-200 card p-6">
                <div className="flex flex-wrap gap-3 items-start justify-between">
                  <div className="min-w-0">
                    <h2 className="font-bold tracking-tight text-[17px] truncate">{active.property?.label} <span className="font-normal text-zinc-500 text-xs">#{active.id.slice(0,8)}</span></h2>
                    <div className="text-xs text-zinc-600">{active.surveyType.replaceAll("_"," ")} • {active.property?.barangay ? active.property.barangay+", " : ""}{active.property?.municipality}, {active.property?.province} • Created {new Date(active.createdAt).toLocaleDateString()}</div>
                  </div>
                  <StatusPill status={active.status} />
                </div>
                <div className="mt-5"><Tracker status={active.status} /></div>
                <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                    <div className="text-xs tracking-widest font-semibold text-zinc-500">PROPERTY</div>
                    <div className="font-medium mt-1">{active.property?.label}</div>
                    <div className="text-xs text-zinc-600">{active.property?.lotNo ? `Lot ${active.property.lotNo} • ` : ""}TCT {active.property?.titleNo ?? "— (untitled)"} • {active.property?.areaSqm ? `${active.property.areaSqm} sqm` : ""}</div>
                    <div className="text-xs text-zinc-600 mt-1">{active.property?.addressNotes ?? ""}</div>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                    <div className="text-xs tracking-widest font-semibold text-zinc-500">REQUEST</div>
                    <div className="mt-1">{active.purpose}</div>
                    <div className="text-xs text-zinc-600 mt-1">Preferred: {active.preferredSchedule ?? "—"}</div>
                    <Link href={`/projects/${active.id}`} className="inline-flex mt-3 text-xs font-semibold text-emerald-700 hover:underline">Open details & documents →</Link>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
                  <div className="text-sm font-semibold">History</div>
                  <div className="text-xs text-zinc-600">Every transition is logged with who & when.</div>
                  <div className="mt-4 max-h-[260px] overflow-auto pr-1">
                    <VerticalTimeline status={active.status} history={(active.statusHistory ?? []).map((h:any)=> ({ fromStatus:h.fromStatus, toStatus:h.toStatus, createdAt:h.createdAt, note:h.note }))} />
                  </div>
                </div>
                <div className="bg-emerald-700 text-white rounded-[20px] p-5">
                  <div className="text-sm font-semibold">Notifications</div>
                  <div className="text-xs text-white">In-app is source of truth; email + SMS for time-critical.</div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="rounded-xl bg-white text-zinc-800 p-3 border">Survey Schedule Confirmed<div className="text-xs text-zinc-600">Your site survey is set — check Appointment tab.</div></li>
                    <li className="rounded-xl bg-white text-zinc-800 p-3 border">Document Required<div className="text-xs text-zinc-600">Please upload Tax Declaration to continue.</div></li>
                    <li className="rounded-xl bg-white text-zinc-800 p-3 border">Project Update<div className="text-xs text-zinc-600">Status changed — see history.</div></li>
                  </ul>
                  <Link href={`/projects/${active.id}`} className="mt-3 inline-flex bg-white text-emerald-800 px-4 py-2 rounded-full text-xs font-semibold">Manage documents</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

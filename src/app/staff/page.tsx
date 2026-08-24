"use client";
import { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/Tracker";
import Link from "next/link";
import { PIPELINE, PIPELINE_LABEL } from "@/lib/status";

type Project = any;

export default function StaffPage() {
  const [staff, setStaff] = useState<any>(null);
  const [email, setEmail] = useState("estimator@sanco.ph");
  const [pass, setPass] = useState("sanco123");
  const [projects, setProjects] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const [activeCol, setActiveCol] = useState<string>("ALL");

  async function login() {
    const r= await fetch("/api/staff/login",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, password: pass })});
    const j=await r.json(); if(r.ok){ setStaff(j.staff); load(); } else alert(j.error ?? JSON.stringify(j));
  }
  async function me(){ const r= await fetch("/api/staff/me"); const j=await r.json(); if(j.staff) setStaff(j.staff); }
  async function load(){ const r= await fetch("/api/projects"); const j=await r.json(); setProjects(j.projects ?? []); }
  useEffect(()=>{ me(); load(); },[]);
  useEffect(()=>{ if(staff) load(); },[staff]);

  const grouped = useMemo(()=>{
    const g: Record<string, Project[]> = {};
    for(const s of [...PIPELINE, "ON_HOLD","CANCELLED"] as string[]) g[s]=[];
    for(const p of projects) (g[p.status] ??= []).push(p);
    // sort each col oldest first (waiting longest top)
    for(const k of Object.keys(g)) g[k].sort((a,b)=> new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    return g;
  },[projects]);

  const filtered = useMemo(()=>{
    if(activeCol==="ALL"){
      if(!q) return projects;
      const qq=q.toLowerCase(); return projects.filter(p=> `${p.property.label} ${p.property.municipality} ${p.property.titleNo} ${p.surveyType} ${p.guestPhone} ${p.id}`.toLowerCase().includes(qq));
    }
    let list = grouped[activeCol] ?? [];
    if(q) { const qq=q.toLowerCase(); list = list.filter(p=> `${p.property.label} ${p.property.municipality} ${p.property.titleNo} ${p.surveyType}`.toLowerCase().includes(qq)); }
    return list;
  },[projects, grouped, activeCol, q]);

  if(!staff) return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-[20px] border border-zinc-200 card p-6 md:p-8">
        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white grid place-items-center">🧑‍💼</div>
        <h1 className="text-xl font-bold tracking-tight mt-3">Staff Admin Portal</h1>
        <p className="text-sm text-zinc-500 mt-1">2-person team — shared queue. One Estimator prices quotations. Walk-in/phone/FB leads are created with guest phone → client claims later via OTP.</p>
        <div className="mt-6 space-y-3">
          <label className="block"><div className="text-xs font-medium">Email</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="estimator@sanco.ph" className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm" /></label>
          <label className="block"><div className="text-xs font-medium">Password</div><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm" /></label>
          <button onClick={login} className="w-full bg-zinc-900 text-white py-3 rounded-full font-semibold">Sign in</button>
          <div className="text-xs bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800">Dev: auto-creates <b>estimator@sanco.ph / sanco123</b> on first login. Use same endpoint for second staff account.</div>
        </div>
      </div>
      <div className="bg-emerald-700 text-white rounded-[20px] p-6">
        <div className="text-sm font-semibold">How staff works</div>
        <ol className="mt-3 space-y-2 text-sm text-white/90 list-decimal list-inside">
          <li>Triage <b>CLIENT REQUEST</b> → verify docs at <b>DOCUMENT CHECK</b> (or override with reason).</li>
          <li>Send <b>QUOTATION</b> with line items; 30-day validity.</li>
          <li>Client <b>ACCEPTS</b> → payment gate unlocks <b>SITE SURVEY</b>.</li>
          <li>Confirm appointment → complete → <b>PROCESSING</b> (AutoCAD) → <b>DOCUMENTATION</b> → <b>COMPLETED</b>.</li>
        </ol>
        <div className="mt-4 rounded-xl bg-white text-zinc-800 p-3 text-sm border">Duplicate phone? We warn if TCT/title already exists, and if one property already has an active project.</div>
      </div>
    </div>
  );

  const cols = activeCol==="ALL" ? [...PIPELINE, "ON_HOLD","CANCELLED"] : [activeCol];

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Staff Kanban — {staff.name} <span className="font-normal text-zinc-500">({staff.role})</span></h1>
          <div className="text-xs text-zinc-500">{projects.length} total • oldest first per column • search by lot/TCT/phone</div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search lot, TCT, phone…" className="rounded-full border bg-white pl-9 pr-3 py-2 text-sm w-64" />
            <span className="absolute left-3 top-2 text-zinc-400">⌕</span>
          </div>
          <button onClick={async()=>{ await fetch("/api/staff/login",{method:"DELETE"}); setStaff(null);}} className="px-4 py-2 rounded-full border bg-white text-sm">Log out</button>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto scrollbar-none pb-2">
        <button onClick={()=>setActiveCol("ALL")} className={`px-3.5 py-2 rounded-full text-xs font-semibold border whitespace-nowrap ${activeCol==="ALL"?"bg-zinc-900 text-white border-zinc-900":"bg-white border-zinc-200"}`}>All {projects.length}</button>
        {[...PIPELINE,"ON_HOLD","CANCELLED"].map(s=> (
          <button key={s} onClick={()=>setActiveCol(s)} className={`px-3.5 py-2 rounded-full text-xs font-semibold border whitespace-nowrap ${activeCol===s?"bg-emerald-700 text-white border-emerald-700":"bg-white border-zinc-200"}`}>{(PIPELINE_LABEL as any)[s] ?? s} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] ${activeCol===s ? "bg-white/20" : "bg-zinc-100"}`}>{grouped[s]?.length ?? 0}</span></button>
        ))}
      </div>

      {activeCol==="ALL" ? (
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length===0 && <div className="col-span-full bg-white rounded-[20px] border p-10 text-center text-sm text-zinc-500">No projects — new CLIENT REQUESTs appear at top.</div>}
          {filtered.map(p=> (
            <Link key={p.id} href={`/projects/${p.id}`} className="bg-white rounded-[20px] border border-zinc-200 card p-4 hover:shadow-md hover:border-zinc-300 transition">
              <div className="flex justify-between gap-2"><span className="font-semibold text-sm truncate">{p.property.label}</span><StatusPill status={p.status} /></div>
              <div className="text-xs text-zinc-500 mt-1">{p.surveyType.replaceAll("_"," ")} • {p.property.municipality} • TCT {p.property.titleNo ?? "—"}</div>
              <div className="text-xs text-zinc-600 mt-2 line-clamp-2">{p.purpose}</div>
              <div className="mt-3 flex gap-1.5 text-[11px]">
                <span className="bg-zinc-100 border px-2 py-1 rounded-full">#{p.id.slice(0,6)}</span>
                <span className="bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">{Math.floor((Date.now()-new Date(p.updatedAt).getTime())/86400000)}d wait</span>
                <span className="ml-auto text-zinc-400">{p.clientId ? "client" : p.guestPhone ? `guest ${p.guestPhone}` : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
          {cols.map(col=> (
            <div key={col} className="min-w-[300px] max-w-[360px] flex-1 bg-zinc-50 rounded-[20px] border border-zinc-200 p-3">
              <div className="flex justify-between items-center px-1">
                <div className="text-xs font-bold tracking-widest text-zinc-600">{(PIPELINE_LABEL as any)[col] ?? col}</div>
                <span className="text-xs bg-white border px-2 py-1 rounded-full">{grouped[col]?.length ?? 0}</span>
              </div>
              <div className="mt-3 space-y-3 max-h-[66vh] overflow-auto pr-1">
                {(grouped[col] ?? []).filter(p=> !q || `${p.property.label} ${p.property.titleNo} ${p.surveyType}`.toLowerCase().includes(q.toLowerCase())).map(p=> (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block bg-white rounded-2xl border p-3 hover:shadow">
                    <div className="font-medium text-sm truncate">{p.property.label}</div>
                    <div className="text-xs text-zinc-500">{p.surveyType.replaceAll("_"," ")} • {p.property.municipality}</div>
                    <div className="text-xs text-zinc-600 mt-1 line-clamp-2">{p.purpose}</div>
                    <div className="mt-2 flex justify-between text-[11px] text-zinc-400"><span>#{p.id.slice(0,6)}</span><span>{Math.floor((Date.now()-new Date(p.updatedAt).getTime())/86400000)}d</span></div>
                  </Link>
                ))}
                {(grouped[col]?.length ?? 0)===0 && <div className="text-xs text-zinc-400 text-center py-8">Empty</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/Tracker";
import Link from "next/link";
import { PIPELINE, PIPELINE_LABEL } from "@/lib/status";

type Project = any;

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"/></svg>
);

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
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6 items-start">
      <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-6 md:p-8 relative overflow-hidden">
        <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-[#1d3820]" />
        <div className="h-10 w-10 bg-[#1f1c12] text-[#dd5a24] grid place-items-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/><path d="M4.5 20c1.3-3.4 4-5 7.5-5s6.2 1.6 7.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#17170f] mt-4">Staff Admin Portal</h1>
        <p className="text-sm text-[#645b41] mt-1">2-person team — shared queue. One Estimator prices quotations. Walk-in/phone/FB leads are created with guest phone → client claims later via OTP.</p>
        <div className="mt-6 space-y-3">
          <label className="block"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Email</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="estimator@sanco.ph" className="mt-1.5 w-full border border-[#c9bfa3] bg-white px-3.5 py-3 text-sm focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none" /></label>
          <label className="block"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Password</div><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" className="mt-1.5 w-full border border-[#c9bfa3] bg-white px-3.5 py-3 text-sm focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none" /></label>
          <button onClick={login} className="w-full bg-[#1f1c12] text-white py-3 font-bold uppercase tracking-[0.06em] hover:bg-[#17170f]">Sign in</button>
          <div className="font-mono text-[11px] bg-[#fbf3df] border border-[#ebd094] p-3 text-[#714814]">Dev: auto-creates <b>estimator@sanco.ph / sanco123</b> on first login. Use same endpoint for second staff account.</div>
        </div>
      </div>
      <div className="bg-[#16301a] text-white border border-[#0c1a0e] p-6 relative overflow-hidden">
        <span aria-hidden className="absolute inset-0 draft-grid opacity-[0.05]" />
        <div className="relative">
          <div className="rule-label !text-[10px] text-[#dbe5d4]">How staff works</div>
          <ol className="mt-3 space-y-2 text-sm text-white/90 list-none">
            <li className="flex gap-2"><span className="text-[#dd5a24] font-mono">01</span><span>Triage <b>CLIENT REQUEST</b> → verify docs at <b>DOCUMENT CHECK</b> (or override with reason).</span></li>
            <li className="flex gap-2"><span className="text-[#dd5a24] font-mono">02</span><span>Send <b>QUOTATION</b> with line items; 30-day validity.</span></li>
            <li className="flex gap-2"><span className="text-[#dd5a24] font-mono">03</span><span>Client <b>ACCEPTS</b> → payment gate unlocks <b>SITE SURVEY</b>.</span></li>
            <li className="flex gap-2"><span className="text-[#dd5a24] font-mono">04</span><span>Confirm appointment → complete → <b>PROCESSING</b> (AutoCAD) → <b>DOCUMENTATION</b> → <b>COMPLETED</b>.</span></li>
          </ol>
          <div className="mt-4 border border-white/20 bg-white text-[#17170f] p-3 text-sm">Duplicate phone? We warn if TCT/title already exists, and if one property already has an active project.</div>
        </div>
      </div>
    </div>
  );

  const cols = activeCol==="ALL" ? [...PIPELINE, "ON_HOLD","CANCELLED"] : [activeCol];

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-[#dcd3b8] pb-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#17170f]">Staff Kanban — {staff.name} <span className="font-mono font-normal text-[#837858] text-sm">({staff.role})</span></h1>
          <div className="font-mono text-[11px] text-[#837858]">{projects.length} total • oldest first per column • search by lot/TCT/phone</div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search lot, TCT, phone…" className="border border-[#c9bfa3] bg-white pl-9 pr-3 py-2 text-sm w-64 focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none" />
            <SearchIcon className="absolute left-3 top-2.5 text-[#837858]" />
          </div>
          <button onClick={async()=>{ await fetch("/api/staff/login",{method:"DELETE"}); setStaff(null);}} className="px-4 py-2 border border-[#dcd3b8] bg-white text-sm hover:border-[#1d3820]">Log out</button>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto scrollbar-none pb-2">
        <button onClick={()=>setActiveCol("ALL")} className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.05em] border whitespace-nowrap ${activeCol==="ALL"?"bg-[#1f1c12] text-white border-[#1f1c12]":"bg-[#fcfaf1] border-[#dcd3b8] text-[#645b41]"}`}>All {projects.length}</button>
        {[...PIPELINE,"ON_HOLD","CANCELLED"].map(s=> {
          const colActive = activeCol===s;
          const colCls = colActive ? "bg-[#1d3820] text-white border-[#1d3820]" : "bg-[#fcfaf1] border-[#dcd3b8] text-[#645b41]";
          return (
            <button key={s} onClick={()=>setActiveCol(s)} className={"px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.05em] border whitespace-nowrap " + colCls}>
              {(PIPELINE_LABEL as any)[s] ?? s}
              <span className={"ml-1 px-1.5 py-0.5 text-[10px] font-mono " + (colActive ? "bg-white/20" : "bg-[#f0ebdd]")}>{grouped[s]?.length ?? 0}</span>
            </button>
          );
        })}
      </div>

      {activeCol==="ALL" ? (
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length===0 && <div className="col-span-full bg-[#fcfaf1] border border-[#dcd3b8] p-10 text-center text-sm font-mono text-[#837858]">No projects — new CLIENT REQUESTs appear at top.</div>}
          {filtered.map(p=> (
            <Link key={p.id} href={`/projects/${p.id}`} className="bg-[#fcfaf1] border border-[#dcd3b8] card p-4 hover:border-[#1d3820] hover:shadow-[4px_4px_0_rgba(29,56,32,0.12)] transition">
              <div className="flex justify-between gap-2 items-start"><span className="font-semibold text-sm text-[#17170f] truncate">{p.property.label}</span><StatusPill status={p.status} /></div>
              <div className="text-xs text-[#837858] mt-1 font-mono">{p.surveyType.replaceAll("_"," ")} • {p.property.municipality} • TCT {p.property.titleNo ?? "—"}</div>
              <div className="text-xs text-[#645b41] mt-2 line-clamp-2">{p.purpose}</div>
              <div className="mt-3 flex gap-1.5 font-mono text-[11px]">
                <span className="border border-[#dcd3b8] bg-[#f0ebdd] px-2 py-1">#{p.id.slice(0,6)}</span>
                <span className="border border-[#ebd094] bg-[#fbf3df] px-2 py-1 text-[#714814]">{Math.floor((Date.now()-new Date(p.updatedAt).getTime())/86400000)}d wait</span>
                <span className="ml-auto text-[#a79c7d]">{p.clientId ? "client" : p.guestPhone ? `guest ${p.guestPhone}` : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
          {cols.map(col=> (
            <div key={col} className="min-w-[300px] max-w-[360px] flex-1 bg-[#f0ebdd] border border-[#dcd3b8] p-3">
              <div className="flex justify-between items-center px-1">
                <div className="rule-label !text-[9px] text-[#4a4230]">{(PIPELINE_LABEL as any)[col] ?? col}</div>
                <span className="font-mono text-[11px] bg-[#fcfaf1] border border-[#dcd3b8] px-2 py-1">{grouped[col]?.length ?? 0}</span>
              </div>
              <div className="mt-3 space-y-3 max-h-[66vh] overflow-auto pr-1">
                {(grouped[col] ?? []).filter(p=> !q || `${p.property.label} ${p.property.titleNo} ${p.surveyType}`.toLowerCase().includes(q.toLowerCase())).map(p=> (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block bg-[#fcfaf1] border border-[#dcd3b8] p-3 hover:border-[#1d3820] transition-colors">
                    <div className="font-medium text-sm text-[#17170f] truncate">{p.property.label}</div>
                    <div className="text-xs text-[#837858] font-mono">{p.surveyType.replaceAll("_"," ")} • {p.property.municipality}</div>
                    <div className="text-xs text-[#645b41] mt-1 line-clamp-2">{p.purpose}</div>
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-[#a79c7d]"><span>#{p.id.slice(0,6)}</span><span>{Math.floor((Date.now()-new Date(p.updatedAt).getTime())/86400000)}d</span></div>
                  </Link>
                ))}
                {(grouped[col]?.length ?? 0)===0 && <div className="text-xs text-[#a79c7d] text-center py-8 font-mono">Empty</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

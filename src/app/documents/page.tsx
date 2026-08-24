"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"/></svg>
);

const TYPE_LABEL: Record<string, string> = {
  TCT_OCT: "TCT",
  TAX_DECLARATION: "TAX",
  VALID_ID: "ID",
  LOT_PLAN: "PLAN",
  DEED_OF_SALE: "DEED",
  OTHER: "DOC",
};

export default function DocumentsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("ALL");
  useEffect(()=>{ fetch("/api/projects").then(r=>r.json()).then(j=> setProjects(j.projects ?? [])); },[]);
  const allDocs = useMemo(()=>{
    const flat = projects.flatMap(p=> (p.documents ?? []).map((d:any)=> ({...d, projectLabel: p.property.label, projectId: p.id, status: p.status})));
    let list = flat;
    if(filter!=="ALL") list = list.filter(d=> d.state===filter);
    if(q) { const qq=q.toLowerCase(); list = list.filter(d=> `${d.type} ${d.projectLabel} ${d.fileName}`.toLowerCase().includes(qq)); }
    return list;
  },[projects, q, filter]);

  const missing = allDocs.filter(d=> d.state==="MISSING").length;
  const uploaded = allDocs.filter(d=> d.state==="UPLOADED").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-4 justify-between items-end border-b border-[#dcd3b8] pb-4">
        <div>
          <div className="rule-label !text-[10px] text-[#1d3820]">Document Registry</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#17170f] mt-1">My Documents</h1>
          <p className="text-sm text-[#645b41] mt-1">Grouped by project • missing docs block DOCUMENT CHECK → QUOTATION</p>
        </div>
        <div className="flex gap-2 font-mono text-[11px]">
          <span className="border border-[#ebd094] bg-[#fbf3df] text-[#714814] px-3 py-1.5 font-semibold">{missing} missing</span>
          <span className="border border-[#b9cede] bg-[#e8f0f6] text-[#24425c] px-3 py-1.5 font-semibold">{uploaded} to verify</span>
          <span className="border border-[#dcd3b8] bg-[#f0ebdd] px-3 py-1.5 text-[#4a4230] font-semibold">{allDocs.length} total</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-md">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search TCT, Valid ID, Lot 1234…" className="w-full border border-[#c9bfa3] bg-[#fcfaf1] pl-9 pr-3 py-2.5 text-[16px] sm:text-sm placeholder:text-[#a79c7d] focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none" />
          <SearchIcon className="absolute left-3 top-3 text-[#837858]" />
        </div>
        <div className="flex gap-1.5">
          {["ALL","MISSING","UPLOADED","VERIFIED","REJECTED"].map(s=> (
            <button key={s} onClick={()=>setFilter(s)} className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] border ${filter===s ? "bg-[#1f1c12] text-white border-[#1f1c12]" : "bg-[#fcfaf1] border-[#dcd3b8] text-[#645b41] hover:border-[#1d3820]"}`}>{s}</button>
          ))}
        </div>
      </div>

      {allDocs.length===0 && (
        <div className="mt-6 bg-[#fcfaf1] border border-[#dcd3b8] card p-10 text-center">
          <div aria-hidden className="mx-auto h-10 w-10 border border-[#dcd3b8] bg-[#f0ebdd] grid place-items-center font-mono text-[10px] font-bold tracking-widest text-[#837858]">DOC</div>
          <div className="font-semibold mt-3 text-[#17170f]">No documents yet</div>
          <div className="text-sm text-[#645b41] max-w-md mx-auto">Upload from project page. Required: TCT/OCT, Tax Declaration, Valid ID (varies by survey type).</div>
          <Link href="/track" className="inline-flex mt-4 bg-[#1d3820] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.06em]">Go to projects</Link>
        </div>
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-3">
        {allDocs.map((d:any)=> (
          <div key={d.id} className={`border p-4 flex gap-3 ${d.state==="VERIFIED" ? "bg-[#eef3e9] border-[#b9caae]" : d.state==="REJECTED" ? "bg-[#f9ebea] border-[#e6c0bb]" : d.state==="UPLOADED" ? "bg-[#fbf3df] border-[#ebd094]" : "bg-[#fcfaf1] border-[#dcd3b8]"}`}>
            <div aria-hidden className="h-10 w-10 shrink-0 border border-[#cdbf9a] bg-white grid place-items-center font-mono text-[10px] font-bold tracking-widest text-[#1d3820]">{TYPE_LABEL[d.type] ?? d.type.split("_")[0].slice(0,3)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex gap-1.5 items-center flex-wrap">
                <span className="text-sm font-semibold text-[#17170f]">{d.type.replaceAll("_"," ")}</span>
                <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-[0.06em] border ${d.state==="VERIFIED" ? "bg-[#1d3820] text-white border-[#1d3820]" : d.state==="MISSING" ? "bg-[#f0ebdd] text-[#4a4230] border-[#dcd3b8]" : "bg-white border-[#c9bfa3] text-[#645b41]"}`}>{d.state}</span>
                <span className="text-xs text-[#837858]">{d.requirement}</span>
              </div>
              <div className="text-xs text-[#645b41] truncate">{d.projectLabel} • {d.fileName ?? "No file"} • {d.status.replaceAll("_"," ")}</div>
              <div className="mt-2 flex gap-1.5">
                {d.fileUrl && <a href={d.fileUrl} target="_blank" className="text-[11px] font-semibold uppercase tracking-[0.05em] border border-[#dcd3b8] bg-white px-3 py-1.5 hover:border-[#1d3820]">View</a>}
                <Link href={`/projects/${d.projectId}`} className="text-[11px] font-bold uppercase tracking-[0.05em] bg-[#1f1c12] text-white px-3 py-1.5">Open project →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

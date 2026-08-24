"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 justify-between items-end">
        <div>
          <h1 className="text-xl font-bold tracking-tight">My Documents</h1>
          <p className="text-sm text-zinc-600">Grouped by project • missing docs block DOCUMENT CHECK → QUOTATION</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full">{missing} missing</span>
          <span className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full">{uploaded} to verify</span>
          <span className="bg-zinc-100 border px-3 py-1.5 rounded-full">{allDocs.length} total</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative flex-1 max-w-md">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search TCT, Valid ID, Lot 1234…" className="w-full rounded-full border bg-white pl-9 pr-3 py-2.5 text-[16px] sm:text-sm" />
          <span aria-hidden="true" className="absolute left-3 top-2.5 text-zinc-600">⌕</span>
        </div>
        <div className="flex gap-1.5">
          {["ALL","MISSING","UPLOADED","VERIFIED","REJECTED"].map(s=> (
            <button key={s} onClick={()=>setFilter(s)} className={`px-3.5 py-2 rounded-full text-xs font-medium border ${filter===s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200"}`}>{s}</button>
          ))}
        </div>
      </div>

      {allDocs.length===0 && <div className="mt-6 bg-white rounded-[20px] border border-zinc-200 card p-10 text-center"><div aria-hidden="true" className="mx-auto h-10 w-10 rounded-xl bg-zinc-50 border grid place-items-center text-[10px] font-bold tracking-widest text-zinc-700">DOC</div><div className="font-semibold mt-2">No documents yet</div><div className="text-sm text-zinc-600">Upload from project page. Required: TCT/OCT, Tax Declaration, Valid ID (varies by survey type).</div><Link href="/track" className="inline-flex mt-4 bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">Go to projects</Link></div>}

      <div className="mt-6 grid md:grid-cols-2 gap-3">
        {allDocs.map((d:any)=> (
          <div key={d.id} className={`rounded-[20px] border p-4 flex gap-3 ${d.state==="VERIFIED" ? "bg-emerald-50 border-emerald-200" : d.state==="REJECTED" ? "bg-red-50 border-red-200" : d.state==="UPLOADED" ? "bg-amber-50 border-amber-200" : "bg-white border-zinc-200"}`}>
            <div aria-hidden="true" className="h-10 w-10 rounded-xl bg-white border grid place-items-center shrink-0 text-[10px] font-bold tracking-widest text-zinc-700">{d.type.split("_")[0].slice(0,3)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex gap-1.5 items-center flex-wrap"><span className="text-sm font-semibold">{d.type.replaceAll("_"," ")}</span><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${d.state==="VERIFIED" ? "bg-emerald-600 text-white border-emerald-600" : d.state==="MISSING" ? "bg-zinc-100" : "bg-white"}`}>{d.state}</span><span className="text-xs text-zinc-600">{d.requirement}</span></div>
              <div className="text-xs text-zinc-600 truncate">{d.projectLabel} • {d.fileName ?? "No file"} • {d.status.replaceAll("_"," ")}</div>
              <div className="mt-2 flex gap-1.5">
                {d.fileUrl && <a href={d.fileUrl} target="_blank" className="text-xs border bg-white px-3 py-1.5 rounded-full">View</a>}
                <Link href={`/projects/${d.projectId}`} className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-full">Open project →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

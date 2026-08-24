"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function PropertiesPage() {
  const [props_, setProps] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(()=>{ fetch("/api/properties").then(r=>r.json()).then(j=>setProps(j.properties??[])); },[]);
  const filtered = useMemo(()=>{
    if(!q) return props_;
    const qq=q.toLowerCase();
    return props_.filter(p=> `${p.label} ${p.municipality} ${p.province} ${p.titleNo} ${p.lotNo}`.toLowerCase().includes(qq));
  },[props_, q]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 justify-between items-end">
        <div>
          <h1 className="text-xl font-bold tracking-tight">My Properties</h1>
          <p className="text-sm text-zinc-600">One client owns many parcels. Each property keeps its own history, documents & quotations.</p>
        </div>
        <Link href="/request" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">+ New property via request</Link>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Lot 1234, TCT, Cabadbaran…" className="w-full rounded-full border bg-white pl-9 pr-3 py-2.5 text-[16px] sm:text-sm" />
          <span aria-hidden="true" className="absolute left-3 top-2.5 text-zinc-600">⌕</span>
        </div>
        <span className="hidden sm:inline-flex items-center text-xs bg-zinc-100 border px-3 py-2 rounded-full">{filtered.length} properties</span>
      </div>

      {filtered.length===0 && <div className="mt-8 bg-white rounded-[20px] border border-zinc-200 card p-10 text-center"><div aria-hidden="true" className="mx-auto h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center text-[10px] font-bold tracking-widest text-emerald-800">PR</div><div className="font-semibold mt-2">No properties yet</div><div className="text-sm text-zinc-600">Create your first survey request to save a property. Untitled parcels allowed.</div><Link href="/request" className="inline-flex mt-4 bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">Start your survey</Link></div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((p)=> (
          <div key={p.id} className="bg-white rounded-[20px] border border-zinc-200 card overflow-hidden">
            <div className="p-5">
              <div aria-hidden="true" className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center text-[10px] font-bold tracking-widest text-emerald-800">{p.label.slice(0,2).toUpperCase()}</div>
              <div className="font-semibold mt-3 truncate">{p.label}</div>
              <div className="text-xs text-zinc-600">{p.barangay ? p.barangay+", " : ""}{p.municipality}, {p.province} {p.lotNo ? `• Lot ${p.lotNo}` : ""}</div>
              <div className="text-xs text-zinc-600">TCT {p.titleNo ?? "— (untitled)"} {p.taxDecNo ? `• Tax Dec ${p.taxDecNo}` : ""}</div>
              {p.areaSqm && <div className="text-xs text-zinc-600 mt-1">{p.areaSqm} sqm {p.gpsLat ? `• ${p.gpsLat.toFixed(3)}, ${p.gpsLng?.toFixed(3)}` : ""}</div>}
            </div>
            <div className="px-5 pb-4">
              <div className="text-xs font-semibold tracking-widest text-zinc-500">SURVEY HISTORY</div>
              <div className="mt-2 space-y-1.5 max-h-[180px] overflow-auto pr-1">
                {(p.projects??[]).length===0 && <div className="text-xs text-zinc-600">No surveys yet.</div>}
                {(p.projects??[]).slice(0,5).map((pr:any)=> (
                  <Link key={pr.id} href={`/projects/${pr.id}`} className="flex justify-between items-center rounded-xl border bg-zinc-50 px-3 py-2 hover:bg-white">
                    <span className="text-xs font-medium truncate">{pr.surveyType.replaceAll("_"," ")}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium bg-white ${pr.status==="COMPLETED" ? "text-emerald-700 border-emerald-200" : pr.status==="CANCELLED" ? "text-red-700 border-red-200" : "text-zinc-600"}`}>{pr.status.replaceAll("_"," ")}</span>
                  </Link>
                ))}
                {(p.projects??[]).length>5 && <div className="text-xs text-zinc-600">+ {p.projects.length-5} more</div>}
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/track?propertyId=${p.id}`} className="flex-1 text-center bg-zinc-900 text-white py-2 rounded-full text-xs font-semibold">View timeline</Link>
                <Link href={`/request?propertyId=${p.id}`} className="px-4 py-2 rounded-full border bg-white text-xs font-medium">New survey</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

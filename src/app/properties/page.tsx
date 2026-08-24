"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8"/><path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"/></svg>
);

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-4 justify-between items-end border-b border-[#dcd3b8] pb-4">
        <div>
          <div className="rule-label !text-[10px] text-[#1d3820]">Parcel Registry</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#17170f] mt-1">My Properties</h1>
          <p className="text-sm text-[#645b41] mt-1">One client owns many parcels. Each property keeps its own history, documents &amp; quotations.</p>
        </div>
        <Link href="/request" className="inline-flex items-center gap-2 bg-[#1d3820] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#16301a] transition-colors">+ New property via request</Link>
      </div>

      <div className="mt-5 flex gap-2 items-center">
        <div className="relative flex-1 max-w-md">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Lot 1234, TCT, Cabadbaran…" className="w-full border border-[#c9bfa3] bg-[#fcfaf1] pl-9 pr-3 py-2.5 text-[16px] sm:text-sm placeholder:text-[#a79c7d] focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none" />
          <SearchIcon className="absolute left-3 top-3 text-[#837858]" />
        </div>
        <span className="hidden sm:inline-flex items-center font-mono text-[11px] border border-[#dcd3b8] bg-[#f0ebdd] px-3 py-2 text-[#4a4230]">{filtered.length} properties</span>
      </div>

      {filtered.length===0 && (
        <div className="mt-8 bg-[#fcfaf1] border border-[#dcd3b8] card p-10 text-center">
          <div aria-hidden className="mx-auto h-10 w-10 border border-[#1d3820]/30 bg-[#eef3e9] grid place-items-center font-mono text-[10px] font-bold tracking-widest text-[#1d3820]">PR</div>
          <div className="font-semibold mt-3 text-[#17170f]">No properties yet</div>
          <div className="text-sm text-[#645b41] max-w-md mx-auto">Create your first survey request to save a property. Untitled parcels allowed.</div>
          <Link href="/request" className="inline-flex mt-4 bg-[#1d3820] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.06em]">Start your survey</Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((p)=> (
          <div key={p.id} className="bg-[#fcfaf1] border border-[#dcd3b8] card overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div aria-hidden className="h-10 w-10 border border-[#1d3820]/30 bg-[#eef3e9] grid place-items-center font-mono text-[10px] font-bold tracking-widest text-[#1d3820]">{p.label.slice(0,2).toUpperCase()}</div>
                {p.lotNo && <span className="font-mono text-[11px] text-[#837858]">LOT {p.lotNo}</span>}
              </div>
              <div className="font-display font-bold text-lg mt-3 text-[#17170f] truncate">{p.label}</div>
              <div className="text-xs text-[#645b41] mt-0.5">{p.barangay ? p.barangay+", " : ""}{p.municipality}, {p.province}</div>
              <div className="text-xs text-[#645b41]">TCT {p.titleNo ?? "— (untitled)"} {p.taxDecNo ? `• Tax Dec ${p.taxDecNo}` : ""}</div>
              {p.areaSqm && <div className="font-mono text-[11px] text-[#837858] mt-1">{p.areaSqm} sqm {p.gpsLat ? `• ${p.gpsLat.toFixed(3)}, ${p.gpsLng?.toFixed(3)}` : ""}</div>}
            </div>
            <div className="px-5 pb-5 border-t border-dashed border-[#dcd3b8] pt-4">
              <div className="rule-label !text-[9px] text-[#837858]">Survey History</div>
              <div className="mt-2 space-y-1.5 max-h-[180px] overflow-auto pr-1">
                {(p.projects??[]).length===0 && <div className="text-xs font-mono text-[#837858]">No surveys yet.</div>}
                {(p.projects??[]).slice(0,5).map((pr:any)=> (
                  <Link key={pr.id} href={`/projects/${pr.id}`} className="flex justify-between items-center border border-[#dcd3b8] bg-white px-3 py-2 hover:border-[#1d3820] transition-colors">
                    <span className="text-xs font-medium truncate text-[#17170f]">{pr.surveyType.replaceAll("_"," ")}</span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-[0.05em] border ml-2 shrink-0 ${pr.status==="COMPLETED" ? "text-[#1d3820] border-[#b9caae] bg-[#eef3e9]" : pr.status==="CANCELLED" ? "text-[#7a2a24] border-[#e6c0bb] bg-[#f9ebea]" : "text-[#645b41] border-[#dcd3b8] bg-[#f8f5ec]"}`}>{pr.status.replaceAll("_"," ")}</span>
                  </Link>
                ))}
                {(p.projects??[]).length>5 && <div className="text-xs font-mono text-[#837858]">+ {p.projects.length-5} more</div>}
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/track?propertyId=${p.id}`} className="flex-1 text-center bg-[#1f1c12] text-white py-2 text-[11px] font-bold uppercase tracking-[0.06em] hover:bg-[#17170f]">View timeline</Link>
                <Link href={`/request?propertyId=${p.id}`} className="px-4 py-2 border border-[#dcd3b8] bg-white text-[11px] font-semibold uppercase tracking-[0.06em] text-[#1f1c12] hover:border-[#1d3820]">New survey</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

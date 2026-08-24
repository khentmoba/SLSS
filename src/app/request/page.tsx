"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SURVEYS = [
  { v: "LAND_PROPERTY_SURVEY", l: "Land / Property Survey", d: "General survey & lot plan", abbr: "LP", docs: "TCT, Tax Dec, Valid ID" },
  { v: "RELOCATION_SURVEY", l: "Relocation Survey", d: "Re-establish missing monuments", abbr: "RL", docs: "TCT + Lot Plan + ID" },
  { v: "SUBDIVISION_SURVEY", l: "Subdivision Survey", d: "Split one lot into many", abbr: "SD", docs: "TCT + Lot Plan + Tax Dec + ID" },
  { v: "CONSOLIDATION_SURVEY", l: "Consolidation Survey", d: "Merge lots into one title", abbr: "CN", docs: "TCTs + ID" },
  { v: "TOPOGRAPHIC_SURVEY", l: "Topographic Survey", d: "Elevation & features", abbr: "TP", docs: "Lot Plan (opt) + ID" },
  { v: "BOUNDARY_VERIFICATION", l: "Boundary Verification", d: "Confirm boundaries", abbr: "BV", docs: "Tax Dec + ID" },
  { v: "OTHER", l: "Other", d: "Tell us what you need", abbr: "OT", docs: "Valid ID" },
];

const inputCls = "w-full border border-[#c9bfa3] bg-white px-3.5 py-2.5 text-[16px] sm:text-sm placeholder:text-[#a79c7d] focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none transition";

export default function RequestPage() {
  const router = useRouter();
  const [step, setStep] = useState<1|2|3>(1);
  const [surveyType, setSurveyType] = useState("RELOCATION_SURVEY");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [props_, setProps] = useState<any[]>([]);
  const [useExisting, setUseExisting] = useState(false);
  const [propertyId, setPropertyId] = useState("");

  useEffect(()=>{ fetch("/api/properties").then(r=>r.json()).then(j=> setProps(j.properties ?? [])).catch(()=>{}); },[]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setLoading(true); setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(fd.entries());
    payload.surveyType = surveyType;
    if(useExisting && propertyId) payload.propertyId = propertyId;
    if(payload.areaSqm) payload.areaSqm = Number(payload.areaSqm);
    if(payload.gpsLat) payload.gpsLat = Number(payload.gpsLat);
    if(payload.gpsLng) payload.gpsLng = Number(payload.gpsLng);
    const res = await fetch("/api/projects", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const j = await res.json(); setLoading(false);
    if(!res.ok){ setMsg(j.error ?? JSON.stringify(j)); return; }
    router.push(`/projects/${j.project.id}`);
  }

  const sel = SURVEYS.find(s=>s.v===surveyType)!;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="border-b border-[#dcd3b8] pb-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 border border-[#1d3820] bg-[#1d3820] text-white grid place-items-center font-mono text-sm font-bold">S</span>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#17170f]">Request a Survey</h1>
            <p className="font-mono text-[11px] text-[#645b41]">Your inquiry becomes a Project at <b className="text-[#17170f]">CLIENT REQUEST</b> → auto <b className="text-[#17170f]">DOCUMENT CHECK</b></p>
          </div>
        </div>
      </div>

      {/* stepper */}
      <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-[11px]">
        {[
          { n:1, t:"Survey" },
          { n:2, t:"Property" },
          { n:3, t:"Review" },
        ].map(s=> (
          <div key={s.n} className={`border px-3 py-2 text-center font-semibold uppercase tracking-[0.06em] ${step===s.n ? "bg-[#1d3820] text-white border-[#1d3820]" : step>s.n ? "bg-[#eef3e9] text-[#1d3820] border-[#b9caae]" : "bg-[#fcfaf1] text-[#645b41] border-[#dcd3b8]"}`}>{s.n}. {s.t}</div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 bg-[#fcfaf1] border border-[#dcd3b8] card overflow-hidden relative">
        <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-[#1d3820]" />
        {step===1 && (
          <div className="p-6 animate-fadeIn">
            <div className="text-sm font-semibold text-[#17170f]">Choose survey type</div>
            <div className="text-xs text-[#645b41] font-mono mt-0.5">Required documents per type shown — we’ll verify at DOCUMENT CHECK before quoting.</div>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {SURVEYS.map(s=> (
                <button type="button" key={s.v} aria-label={s.l} aria-pressed={surveyType===s.v} onClick={()=> setSurveyType(s.v)} className={`text-left border p-4 transition ${surveyType===s.v ? "bg-[#1d3820] text-white border-[#1d3820]" : "bg-white border-[#dcd3b8] hover:border-[#1d3820]"}`}>
                  <div className="flex gap-3">
                    <div aria-hidden className={`h-9 w-9 border grid place-items-center shrink-0 font-mono text-[10px] font-bold tracking-widest ${surveyType===s.v ? "bg-[#dd5a24] text-[#17170f] border-[#dd5a24]" : "bg-[#eef3e9] border-[#b9caae] text-[#1d3820]"}`}>{s.abbr}</div>
                    <div>
                      <div className={`text-sm font-semibold ${surveyType===s.v ? "text-white" : "text-[#17170f]"}`}>{s.l}</div>
                      <div className={`text-xs ${surveyType===s.v ? "text-[#b9caae]" : "text-[#645b41]"}`}>{s.d}</div>
                      <div className={`text-xs mt-1 font-mono ${surveyType===s.v ? "text-[#b9caae]" : "text-[#837858]"}`}>Docs: {s.docs}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Purpose *</div>
                <input name="purpose" required placeholder="e.g., For titling / loan / subdivision" className={inputCls} />
                <div className="font-mono text-[11px] text-[#837858]">Helps estimator scope travel &amp; monuments.</div>
              </label>
              <label className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Preferred schedule</div>
                <input name="preferredSchedule" placeholder="Aug 30, 9am — or flexible" className={inputCls} />
                <div className="font-mono text-[11px] text-[#837858]">We’ll confirm after payment.</div>
              </label>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <a href="/login" className="text-xs text-[#645b41] underline">Have an account? Verify phone to claim</a>
              <button type="button" onClick={()=>setStep(2)} className="bg-[#1f1c12] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#17170f]">Continue →</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="p-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#17170f]">Property</div>
              {props_.length>0 && (
                <label className="flex items-center gap-2 text-xs font-mono text-[#4a4230]">
                  <input type="checkbox" checked={useExisting} onChange={e=> setUseExisting(e.target.checked)} className="accent-[#1d3820]" />
                  Use existing property
                </label>
              )}
            </div>

            {useExisting ? (
              <div className="mt-3">
                <select value={propertyId} onChange={e=> setPropertyId(e.target.value)} required className={inputCls}>
                  <option value="">Select property</option>
                  {props_.map((p:any)=> <option key={p.id} value={p.id}>{p.label} • {p.municipality} • TCT {p.titleNo ?? "—"}</option>)}
                </select>
                <div className="font-mono text-[11px] text-[#837858] mt-2">Only one active Project per Property (we’ll block duplicates).</div>
              </div>
            ) : (
              <>
                <div className="mt-3 grid md:grid-cols-2 gap-4">
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Property label (optional)</div><input name="propertyLabel" placeholder="Lot 1234 – Cabadbaran" className={inputCls} /></label>
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Lot No.</div><input name="lotNo" placeholder="1234" className={inputCls} /></label>
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Title No. (TCT/OCT) — leave blank if untitled</div><input name="titleNo" placeholder="TCT-12345" className={inputCls} /></label>
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Tax Dec No.</div><input name="taxDecNo" placeholder="" className={inputCls} /></label>
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Barangay</div><input name="barangay" placeholder="Bay-ang" className={inputCls} /></label>
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Municipality *</div><input name="municipality" required placeholder="Cabadbaran" className={inputCls} /></label>
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Province *</div><input name="province" required placeholder="Agusan del Norte" className={inputCls} /></label>
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Area sqm</div><input name="areaSqm" placeholder="1000" className={inputCls} /></label>
                  <label className="md:col-span-2 space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Address / directions</div><input name="addressNotes" placeholder="Near bridge, red gate, 200m from highway" className={inputCls} /></label>
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">GPS Lat (optional map pin)</div><input name="gpsLat" placeholder="9.1234" className={inputCls} /></label>
                  <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">GPS Lng</div><input name="gpsLng" placeholder="125.534" className={inputCls} /></label>
                </div>
                <div className="mt-4 border border-[#ebd094] bg-[#fbf3df] p-3 font-mono text-[11px] text-[#714814]">DPA note: by continuing you consent to storing TCT/ID securely. Uploads happen after this step on the project page (also available via camera).</div>
              </>
            )}

            <div className="mt-6 flex justify-between">
              <button type="button" onClick={()=>setStep(1)} className="px-5 py-2.5 border border-[#dcd3b8] bg-white text-xs font-semibold uppercase tracking-[0.06em]">← Back</button>
              <button type="button" onClick={()=>setStep(3)} className="bg-[#1f1c12] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#17170f]">Review →</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="p-6 animate-fadeIn">
            <div className="text-sm font-semibold text-[#17170f]">Review &amp; submit</div>
            <div className="mt-3 border border-[#dcd3b8] bg-[#f0ebdd] p-4 text-sm">
              <div><b className="text-[#17170f]">{sel.l}</b> — {sel.d}</div>
              <div className="font-mono text-[11px] text-[#645b41] mt-1">Docs required: {sel.docs}. You’ll upload after submit; we verify before quoting.</div>
              {useExisting ? <div className="font-mono text-[11px] mt-2 text-[#4a4230]">Existing property: <b>{props_.find(p=>p.id===propertyId)?.label ?? propertyId}</b></div> : <div className="font-mono text-[11px] mt-2 text-[#4a4230]">New property will be created and tied to your phone. Verify via OTP to claim.</div>}
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Client Name (e.g., Khent Felary Sanco) — for public track</div><input name="guestName" placeholder="Khent Felary Sanco" className={inputCls} /></label>
              <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Survey Date (for tracking)</div><input name="surveyDate" type="date" className={inputCls} /></label>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Status Message — visible sa client sa /track (e.g., kulang tax declaration / submit na sa DENR)</div>
              <input name="statusMessage" placeholder="Kulang ang papel ug tax declaration — palihog provide Tax Dec" className={inputCls} />
              <div className="font-mono text-[11px] text-[#837858]">Kini ang una makita ni client inig search niya sa lot number — no login needed.</div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <label className="space-y-1.5"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Guest phone (if not signed in)</div><input name="guestPhone" placeholder="09171234567" className={inputCls} /><div className="font-mono text-[11px] text-[#837858]">Same phone = same My Properties. OTP claims provisionals.</div></label>
              <div className="border border-[#b9caae] bg-[#eef3e9] p-3 font-mono text-[11px] text-[#1d3820]">
                What happens next: <b>DOCUMENT CHECK</b> (we verify) → <b>QUOTATION</b> (we price) → <b>PAYMENT</b> (you confirm) → <b>SITE SURVEY</b>.
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={()=>setStep(2)} className="px-5 py-2.5 border border-[#dcd3b8] bg-white text-xs font-semibold uppercase tracking-[0.06em] flex-1">← Back</button>
              <button disabled={loading} className="flex-1 bg-[#dd5a24] text-[#17170f] px-6 py-3 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#d04f18] disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Submitting…" : "Submit request →"}</button>
            </div>
            {msg && <div className="mt-3 text-sm p-3 bg-[#f9ebea] border border-[#e6c0bb] whitespace-pre-wrap text-[#7a2a24]">{msg}</div>}
          </div>
        )}
      </form>

      <div className="mt-4 text-center font-mono text-[11px] text-[#645b41]">Need help? <a href="/contact" className="underline text-[#1d3820]">Contact Sanco</a> • Staff can create request on your behalf (walk-in/phone/FB).</div>
    </div>
  );
}

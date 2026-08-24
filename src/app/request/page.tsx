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
    // drop empty property fields when using existing
    const res = await fetch("/api/projects", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const j = await res.json(); setLoading(false);
    if(!res.ok){ setMsg(j.error ?? JSON.stringify(j)); return; }
    router.push(`/projects/${j.project.id}`);
  }

  const sel = SURVEYS.find(s=>s.v===surveyType)!;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-xs">
        <span className="h-7 w-7 rounded-full bg-emerald-700 text-white grid place-items-center font-bold">S</span>
        <span className="font-semibold tracking-tight">Request a Survey</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-600">Your inquiry becomes a Project at <b className="text-zinc-800">CLIENT REQUEST</b> → auto <b className="text-zinc-800">DOCUMENT CHECK</b></span>
      </div>

      {/* stepper */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {[
          { n:1, t:"Survey" },
          { n:2, t:"Property" },
          { n:3, t:"Review" },
        ].map(s=> (
          <div key={s.n} className={`rounded-full px-3 py-2 text-center border font-medium ${step===s.n ? "bg-emerald-700 text-white border-emerald-700" : step>s.n ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-white text-zinc-600 border-zinc-200"}`}>{s.n}. {s.t}</div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 bg-white rounded-[20px] border border-zinc-200 card overflow-hidden">
        {step===1 && (
          <div className="p-6 animate-fadeIn">
            <div className="text-sm font-semibold">Choose survey type</div>
            <div className="text-xs text-zinc-600">Required documents per type shown — we’ll verify at DOCUMENT CHECK before quoting.</div>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {SURVEYS.map(s=> (
                <button type="button" key={s.v} aria-label={s.l} aria-pressed={surveyType===s.v} onClick={()=> setSurveyType(s.v)} className={`text-left rounded-2xl border p-4 hover:shadow-sm transition ${surveyType===s.v ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
                  <div className="flex gap-3">
                    <div aria-hidden="true" className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 text-[10px] font-bold tracking-widest ${surveyType===s.v ? "bg-white text-emerald-700" : "bg-emerald-50 border border-emerald-100 text-emerald-800"}`}>{s.abbr}</div>
                    <div>
                      <div className={`text-sm font-semibold ${surveyType===s.v ? "text-white" : "text-zinc-900"}`}>{s.l}</div>
                      <div className={`text-xs ${surveyType===s.v ? "text-white" : "text-zinc-600"}`}>{s.d}</div>
                      <div className={`text-xs mt-1 ${surveyType===s.v ? "text-white" : "text-zinc-600"}`}>Docs: {s.docs}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <div className="text-xs font-medium">Purpose *</div>
                <input name="purpose" required placeholder="e.g., For titling / loan / subdivision" className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[16px] sm:text-sm" />
                <div className="text-xs text-zinc-600">Helps estimator scope travel & monuments.</div>
              </label>
              <label className="space-y-1.5">
                <div className="text-xs font-medium">Preferred schedule</div>
                <input name="preferredSchedule" placeholder="Aug 30, 9am — or flexible" className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[16px] sm:text-sm" />
                <div className="text-xs text-zinc-600">We’ll confirm after payment.</div>
              </label>
            </div>

            <div className="mt-5 flex justify-between">
              <a href="/login" className="text-xs text-zinc-600 underline">Have an account? Verify phone to claim</a>
              <button type="button" onClick={()=>setStep(2)} className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold">Continue →</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="p-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Property</div>
              {props_.length>0 && (
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={useExisting} onChange={e=> setUseExisting(e.target.checked)} />
                  Use existing property
                </label>
              )}
            </div>

            {useExisting ? (
              <div className="mt-3">
                <select value={propertyId} onChange={e=> setPropertyId(e.target.value)} required className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[16px] sm:text-sm">
                  <option value="">Select property</option>
                  {props_.map((p:any)=> <option key={p.id} value={p.id}>{p.label} • {p.municipality} • TCT {p.titleNo ?? "—"}</option>)}
                </select>
                <div className="text-xs text-zinc-600 mt-2">Only one active Project per Property (we’ll block duplicates).</div>
              </div>
            ) : (
              <>
                <div className="mt-3 grid md:grid-cols-2 gap-4">
                  <label className="space-y-1.5"><div className="text-xs font-medium">Property label (optional)</div><input name="propertyLabel" placeholder="Lot 1234 – Cabadbaran" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="space-y-1.5"><div className="text-xs font-medium">Lot No.</div><input name="lotNo" placeholder="1234" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="space-y-1.5"><div className="text-xs font-medium">Title No. (TCT/OCT) — leave blank if untitled</div><input name="titleNo" placeholder="TCT-12345" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="space-y-1.5"><div className="text-xs font-medium">Tax Dec No.</div><input name="taxDecNo" placeholder="" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="space-y-1.5"><div className="text-xs font-medium">Barangay</div><input name="barangay" placeholder="Bay-ang" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="space-y-1.5"><div className="text-xs font-medium">Municipality *</div><input name="municipality" required placeholder="Cabadbaran" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="space-y-1.5"><div className="text-xs font-medium">Province *</div><input name="province" required placeholder="Agusan del Norte" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="space-y-1.5"><div className="text-xs font-medium">Area sqm</div><input name="areaSqm" placeholder="1000" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="md:col-span-2 space-y-1.5"><div className="text-xs font-medium">Address / directions</div><input name="addressNotes" placeholder="Near bridge, red gate, 200m from highway" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <label className="space-y-1.5"><div className="text-xs font-medium">GPS Lat (optional map pin)</div><input name="gpsLat" placeholder="9.1234" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                  <label className="space-y-1.5"><div className="text-xs font-medium">GPS Lng</div><input name="gpsLng" placeholder="125.534" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
                </div>
                <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">DPA note: by continuing you consent to storing TCT/ID securely. Uploads happen after this step on the project page (also available via camera).</div>
              </>
            )}

            <div className="mt-5 flex justify-between">
              <button type="button" onClick={()=>setStep(1)} className="px-5 py-2.5 rounded-full border bg-white text-sm font-medium">← Back</button>
              <button type="button" onClick={()=>setStep(3)} className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold">Review →</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="p-6 animate-fadeIn">
            <div className="text-sm font-semibold">Review & submit</div>
            <div className="mt-3 rounded-2xl bg-zinc-50 border p-4 text-sm">
              <div><b>{sel.l}</b> — {sel.d}</div>
              <div className="text-xs text-zinc-600 mt-1">Docs required: {sel.docs}. You’ll upload after submit; we verify before quoting.</div>
              {useExisting ? <div className="text-xs mt-2">Existing property: <b>{props_.find(p=>p.id===propertyId)?.label ?? propertyId}</b></div> : <div className="text-xs mt-2 text-zinc-600">New property will be created and tied to your phone. Verify via OTP to claim.</div>}
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <label className="space-y-1.5"><div className="text-xs font-medium">Client Name (e.g., Khent Felary Sanco) — for public track</div><input name="guestName" placeholder="Khent Felary Sanco" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
              <label className="space-y-1.5"><div className="text-xs font-medium">Survey Date (for tracking)</div><input name="surveyDate" type="date" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /></label>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="text-xs font-medium">Status Message — visible sa client sa /track (e.g., kulang tax declaration / submit na sa DENR)</div>
              <input name="statusMessage" placeholder="Kulang ang papel ug tax declaration — palihog provide Tax Dec" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" />
              <div className="text-xs text-zinc-500">Kini ang una makita ni client inig search niya sa lot number — no login needed.</div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <label className="space-y-1.5"><div className="text-xs font-medium">Guest phone (if not signed in)</div><input name="guestPhone" placeholder="09171234567" className="w-full rounded-xl border px-3.5 py-2.5 text-[16px] sm:text-sm border-zinc-200" /><div className="text-xs text-zinc-600">Same phone = same My Properties. OTP claims provisionals.</div></label>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                What happens next: <b>DOCUMENT CHECK</b> (we verify) → <b>QUOTATION</b> (we price) → <b>PAYMENT</b> (you confirm) → <b>SITE SURVEY</b>.
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={()=>setStep(2)} className="px-5 py-2.5 rounded-full border bg-white text-sm font-medium flex-1">← Back</button>
              <button disabled={loading} className="flex-1 bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Submitting…" : "Submit request →"}</button>
            </div>
            {msg && <div className="mt-3 text-sm p-3 bg-red-50 border border-red-200 rounded-xl whitespace-pre-wrap text-red-700">{msg}</div>}
          </div>
        )}
      </form>

      <div className="mt-4 text-center text-xs text-zinc-600">Need help? <a href="/contact" className="underline">Contact Sanco</a> • Staff can create request on your behalf (walk-in/phone/FB).</div>
    </div>
  );
}

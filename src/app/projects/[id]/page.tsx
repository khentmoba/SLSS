"use client";
import { useEffect, useState, useCallback } from "react";
import { Tracker, StatusPill, VerticalTimeline } from "@/components/Tracker";
import { useParams } from "next/navigation";

type Tab = "overview"|"documents"|"quotation"|"appointment"|"history";

const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>
);
const Check = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><path d="m4 12 5 5L20 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square"/></svg>
);

const inputCls = "w-full border border-[#c9bfa3] bg-white px-3 py-2.5 text-sm focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none transition";

const DOC_MARKS: Record<string, string> = {
  TCT_OCT: "TCT",
  TAX_DECLARATION: "TAX",
  VALID_ID: "ID",
  LOT_PLAN: "PLAN",
  DEED_OF_SALE: "DEED",
  OTHER: "DOC",
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [msg, setMsg] = useState<string|null>(null);
  const [uploadType, setUploadType] = useState("TCT_OCT");
  const [qFee, setQFee] = useState(28000);
  const [otherLabel, setOtherLabel] = useState("Travel");
  const [otherAmt, setOtherAmt] = useState(2000);
  const [isStaff, setIsStaff] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSurveyDate, setEditSurveyDate] = useState("");
  const [editStatusMsg, setEditStatusMsg] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [appt, setAppt] = useState({ date:"", time:"09:00 AM", siteLocation:"", contactPerson:"", contactPhone:"" });

  const load = useCallback(()=> {
    fetch(`/api/projects/${id}`).then(r=>r.json()).then(j=> setP(j.project));
  },[id]);
  useEffect(()=>{ load(); fetch("/api/staff/me").then(r=>r.json()).then(j=> setIsStaff(!!j.staff)).catch(()=>{}); },[load]);
  useEffect(()=>{ if(p){ setEditName(p.guestName ?? ""); setEditSurveyDate(p.surveyDate ? new Date(p.surveyDate).toISOString().slice(0,10) : ""); setEditStatusMsg(p.statusMessage ?? ""); } },[p]);

  async function transition(to: string, extra: any = {}) {
    const r = await fetch(`/api/projects/${id}/transition`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ to, ...extra })});
    const j = await r.json(); if(!r.ok) setMsg(j.error ?? JSON.stringify(j)); else { setMsg(`Moved to ${to}`); load(); }
  }
  async function sendQuotation() {
    const r = await fetch(`/api/projects/${id}/quotations`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ surveyFee: qFee, otherFees: otherLabel ? [{label: otherLabel, amount: otherAmt}] : [], validDays:30 })});
    const j=await r.json(); if(!r.ok) setMsg(j.error ?? JSON.stringify(j)); else { setMsg(`Quotation v${j.quotation.version} ₱${j.quotation.total.toLocaleString()} sent`); load(); }
  }
  async function acceptQuotation() {
    const q = p.quotations?.[0]; if(!q) return setMsg("No quotation");
    const r= await fetch(`/api/projects/${id}/quotations`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ action:"accept", quotationId: q.id })});
    const j=await r.json(); if(!r.ok) setMsg(j.error ?? JSON.stringify(j)); else { setMsg("Accepted — payment confirmed, unlocked SITE SURVEY"); load(); }
  }
  async function uploadDoc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("type", uploadType);
    const r= await fetch(`/api/projects/${id}/documents`, { method:"POST", body: fd });
    const j=await r.json(); if(!r.ok) setMsg(j.error ?? JSON.stringify(j)); else { setMsg(`Uploaded ${j.document.type}`); (e.target as HTMLFormElement).reset(); load(); }
  }
  async function verifyDoc(docId: string, action: "verify"|"reject") {
    const r= await fetch(`/api/projects/${id}/documents`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ documentId: docId, action })});
    const j=await r.json(); if(!r.ok) setMsg(j.error ?? JSON.stringify(j)); else load();
  }
  async function createAppt(e: React.FormEvent) {
    e.preventDefault();
    const r= await fetch(`/api/projects/${id}/appointments`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(appt)});
    const j=await r.json(); if(!r.ok) setMsg(j.error ?? JSON.stringify(j)); else { setMsg(j.appointment.status==="CONFIRMED" ? "Appointment confirmed" : "Appointment requested — staff will confirm"); load(); }
  }

  async function saveMeta(){
    setSavingMeta(true);
    const payload:any = {};
    payload.guestName = editName || null;
    payload.surveyDate = editSurveyDate || null;
    payload.statusMessage = editStatusMsg || null;
    const r = await fetch(`/api/projects/${id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)});
    const j = await r.json();
    setSavingMeta(false);
    if(!r.ok) setMsg(j.error ?? JSON.stringify(j));
    else { setMsg("Public track info updated - client will see new status instantly on /track"); load(); }
  }

  if(!p) return <div className="max-w-5xl mx-auto px-4 py-10"><div className="h-6 w-40 bg-[#e2dac4] animate-pulse"/><div className="h-32 bg-[#f0ebdd] border border-[#dcd3b8] mt-4 animate-pulse"/></div>;

  const requiredDocs = (p.documents??[]).filter((d:any)=> d.requirement==="REQUIRED");
  const missingRequired = requiredDocs.filter((d:any)=> d.state!=="VERIFIED");
  const canQuote = missingRequired.length===0;

  const tabs: {k:Tab,l:string}[] = [
    {k:"overview", l:"Overview"},
    {k:"documents", l:`Documents ${missingRequired.length ? `• ${missingRequired.length} needed` : "✓"}`},
    {k:"quotation", l:`Quotation ${p.quotations?.length ? `(${p.quotations.length})` : ""}`},
    {k:"appointment", l:"Appointment"},
    {k:"history", l:"History"},
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* header */}
      <div className="bg-[#fcfaf1] border border-[#dcd3b8] card overflow-hidden">
        <div className="p-6 relative">
          <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-[#1d3820]" />
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="min-w-0">
              <div className="rule-label !text-[9px] text-[#1d3820]">Project — {p.surveyType.replaceAll("_"," ")}</div>
              <h1 className="font-display font-extrabold tracking-tight text-xl text-[#17170f] truncate mt-1">{p.property.label} <span className="font-mono text-[#a79c7d] font-normal text-sm">#{p.id.slice(0,8)}</span></h1>
              <div className="font-mono text-[11px] text-[#645b41] mt-1">{p.property.barangay ? p.property.barangay+", " : ""}{p.property.municipality}, {p.property.province} • Lot {p.property.lotNo ?? "—"} • TCT {p.property.titleNo ?? "— (untitled)"}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusPill status={p.status} />
              <div className="font-mono text-[11px] text-[#837858]">{isStaff ? "Staff view" : "Client view"} • Created {new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mt-5"><Tracker status={p.status} /></div>

          {/* contextual next-step banner */}
          <div className={`mt-4 border p-3 flex flex-wrap gap-2 items-center justify-between ${
            p.status==="DOCUMENT_CHECK" && !canQuote ? "bg-[#fbf3df] border-[#ebd094]" :
            p.status==="QUOTATION" ? "bg-[#e8f0f6] border-[#b9cede]" :
            p.status==="PAYMENT_CONFIRMATION" ? "bg-[#f2edf7] border-[#d4c7e3]" :
            "bg-[#f8f5ec] border-[#dcd3b8]"}`}>
            <div className="text-sm text-[#1f1c12]">
              {p.status==="DOCUMENT_CHECK" && !canQuote && <span><b>{missingRequired.length} required document(s) need upload/verification</b> — upload below or staff overrides with reason.</span>}
              {p.status==="DOCUMENT_CHECK" && canQuote && <span>Documents verified — <b>ready for quotation</b>. Staff can send quote.</span>}
              {p.status==="QUOTATION" && <span>Quotation ready — review total, validity, line items. <b>Accept</b> to unlock site survey.</span>}
              {p.status==="PAYMENT_CONFIRMATION" && <span>Payment confirmed — <b>schedule your site survey</b> in Appointment tab.</span>}
              {p.status==="SITE_SURVEY" && <span>Site survey scheduled — staff will mark complete after field work → auto PROCESSING.</span>}
              {p.status==="PROCESSING" && <span>Processing in AutoCAD — we’re preparing your lot plan.</span>}
              {p.status==="DOCUMENTATION" && <span>Documentation — final deliverables being prepared.</span>}
              {p.status==="COMPLETED" && <span>Completed — your deliverables are ready.</span>}
              {p.status==="CLIENT_REQUEST" && <span>Request received — moving to document check.</span>}
            </div>
            <div className="flex gap-2">
              {p.status==="DOCUMENT_CHECK" && canQuote && isStaff && <button onClick={()=>transition("QUOTATION")} className="bg-[#1d3820] text-white px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#16301a]">Mark ready for quotation</button>}
              {p.status==="PAYMENT_CONFIRMATION" && <button onClick={()=> setTab("appointment")} className="bg-[#4a3a5e] text-white px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#3c2f4e]">Schedule →</button>}
              {isStaff && p.status!=="COMPLETED" && p.status!=="CANCELLED" && <span className="text-xs font-mono text-[#837858]">Staff quick actions in each tab</span>}
            </div>
          </div>

          {msg && <div className="mt-3 text-xs p-3 bg-[#fbf3df] border border-[#ebd094] whitespace-pre-wrap text-[#714814]">{msg}</div>}
        </div>

        {/* tabs */}
        <div className="border-t border-[#dcd3b8] bg-[#f0ebdd] px-2 py-2 flex gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map(t=> (
            <button key={t.k} onClick={()=> setTab(t.k)} className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] whitespace-nowrap border ${tab===t.k ? "bg-[#1f1c12] text-white border-[#1f1c12]" : "bg-[#fcfaf1] text-[#4a4230] border-[#dcd3b8] hover:border-[#1d3820]"}`}>{t.l}</button>
          ))}
          {isStaff && <span className="ml-auto hidden sm:inline-flex items-center gap-2 font-mono text-[11px] bg-[#fbf3df] border border-[#ebd094] text-[#714814] px-3 py-1">Staff mode — verify, quote, confirm</span>}
        </div>
      </div>

      {/* content */}
      <div className="mt-4">
        {tab==="overview" && (
          <div className="space-y-4">
            {isStaff && (
              <div className="bg-[#fbf3df] border border-[#ebd094] p-5">
                <div className="flex gap-2 items-center">
                  <span className="h-7 w-7 bg-[#c08a2d] text-white grid place-items-center font-bold text-xs shrink-0">!</span>
                  <div className="font-semibold text-sm text-[#5a3a11]">Staff — Public Track Editor (no login needed for client)</div>
                  <span className="ml-auto text-xs font-mono bg-white border border-[#ebd094] px-2 py-1 text-[#714814]">{p.statusMessage ? "Live" : "No message yet"}</span>
                </div>
                <div className="text-xs text-[#714814] mt-1">Kini ang makita ni client pag mag-type siya og Lot Number sa /track. Ikaw ray mag-handle. Example: &quot;Kulang ang papel ug tax declaration&quot; or &quot;Submit na sa DENR&quot;.</div>
                <div className="mt-4 grid md:grid-cols-3 gap-3">
                  <label className="space-y-1"><div className="text-xs font-medium text-[#5a3a11]">Client Name (e.g., Khent Felary Sanco)</div><input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Khent Felary Sanco" className={inputCls} /></label>
                  <label className="space-y-1"><div className="text-xs font-medium text-[#5a3a11]">Survey Date</div><input type="date" value={editSurveyDate} onChange={e=>setEditSurveyDate(e.target.value)} className={inputCls} /></label>
                  <label className="space-y-1 md:col-span-1"><div className="text-xs font-medium text-[#5a3a11]">Status — free text (visible to client)</div><input value={editStatusMsg} onChange={e=>setEditStatusMsg(e.target.value)} placeholder="Kulang tax declaration / Submit na sa DENR" className={inputCls} /></label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={saveMeta} disabled={savingMeta} className="bg-[#a9731f] hover:bg-[#8a5c18] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.06em] disabled:opacity-50">{savingMeta ? "Saving..." : "Save — update public track"}</button>
                  <button onClick={()=>{ setEditStatusMsg("Kulang ang papel ug tax declaration - palihog provide Tax Dec"); }} className="px-4 py-2.5 border border-[#ebd094] bg-white text-xs font-semibold uppercase tracking-[0.05em] text-[#5a3a11]">Preset: kulang tax</button>
                  <button onClick={()=>{ setEditStatusMsg("Submit na sa DENR - waiting for approval"); }} className="px-4 py-2.5 border border-[#ebd094] bg-white text-xs font-semibold uppercase tracking-[0.05em] text-[#5a3a11]">Preset: DENR</button>
                </div>
                <div className="font-mono text-[11px] text-[#714814] mt-2">Preview sa client: <b>{editStatusMsg || "- no message -"}</b> — makita dayon sa <a href={`/track?q=${encodeURIComponent(p.property?.lotNo ?? "")}`} className="underline text-[#8a5c18]">/track?q={p.property?.lotNo}</a></div>
              </div>
            )}
            <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5">
                <div className="rule-label !text-[9px] text-[#1d3820]">Request details</div>
                <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="border border-[#dcd3b8] bg-[#f0ebdd] p-4"><div className="rule-label !text-[9px] text-[#645b41]">Purpose</div><div className="mt-1 text-[#17170f]">{p.purpose}</div><div className="font-mono text-[11px] text-[#837858] mt-2">Preferred: {p.preferredSchedule ?? "—"}</div></div>
                  <div className="border border-[#dcd3b8] bg-[#f0ebdd] p-4"><div className="rule-label !text-[9px] text-[#645b41]">Property</div><div className="font-medium text-[#17170f]">{p.property.label}</div><div className="font-mono text-[11px] text-[#837858]">{p.property.barangay}, {p.property.municipality} • {p.property.areaSqm ? `${p.property.areaSqm} sqm` : ""}</div><div className="font-mono text-[11px] text-[#837858]">GPS: {p.property.gpsLat ? `${p.property.gpsLat}, ${p.property.gpsLng}` : "—"}</div></div>
                </div>
              </div>
              <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5">
                <div className="rule-label !text-[9px] text-[#1d3820]">What’s next?</div>
                <ol className="mt-3 space-y-2 text-sm">
                  <li className="flex gap-3"><span className="h-6 w-6 shrink-0 bg-[#1d3820] text-white grid place-items-center font-mono text-xs font-bold">1</span><span><b>Upload documents</b> <span className="text-[#837858] font-mono text-xs">— TCT/OCT, Tax Dec, Valid ID (required per survey type)</span></span></li>
                  <li className="flex gap-3"><span className="h-6 w-6 shrink-0 bg-[#f0ebdd] border border-[#dcd3b8] grid place-items-center font-mono text-xs">2</span><span><b>Receive quotation</b> <span className="text-[#837858] font-mono text-xs">— estimator prices within 48h of doc check</span></span></li>
                  <li className="flex gap-3"><span className="h-6 w-6 shrink-0 bg-[#f0ebdd] border border-[#dcd3b8] grid place-items-center font-mono text-xs">3</span><span><b>Confirm &amp; schedule</b> <span className="text-[#837858] font-mono text-xs">— accept → payment gate → site survey</span></span></li>
                </ol>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5">
                <div className="rule-label !text-[9px] text-[#1d3820]">Timeline</div>
                <div className="mt-4 max-h-[280px] overflow-auto pr-1">
                  <VerticalTimeline status={p.status} history={(p.statusHistory??[]).map((h:any)=> ({fromStatus:h.fromStatus,toStatus:h.toStatus,createdAt:h.createdAt,note:h.note}))} />
                </div>
              </div>
              <div className="bg-[#16301a] text-white border border-[#0c1a0e] p-5">
                <div className="font-semibold">Need help?</div>
                <div className="font-mono text-[11px] text-white/80 mt-1">Contact Sanco — we also handle FB Messenger / walk-in intake for you.</div>
                <a href="/contact" className="mt-3 inline-flex items-center gap-2 bg-white text-[#16301a] px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#eef3e9]">Contact<ArrowRight className="h-3 w-3" /></a>
              </div>
            </div>
          </div>
          </div>
        )}

        {tab==="documents" && (
          <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5 relative overflow-hidden">
            <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-[#1d3820]" />
            <div className="flex flex-wrap gap-3 justify-between">
              <div><div className="rule-label !text-[9px] text-[#1d3820]">Documents</div><div className="text-xs font-mono text-[#645b41] mt-1">Required docs must be <b>VERIFIED</b> before QUOTATION. Override needs reason.</div></div>
              <div className={`font-mono text-[11px] px-3 py-1.5 border font-semibold ${canQuote ? "bg-[#eef3e9] text-[#1d3820] border-[#b9caae]" : "bg-[#fbf3df] text-[#714814] border-[#ebd094]"}`}>{canQuote ? "✓ Ready to quote" : `${missingRequired.length} required missing`}</div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {(p.documents??[]).map((d:any)=> (
                <div key={d.id} className={`border p-4 flex gap-3 ${d.state==="VERIFIED" ? "bg-[#eef3e9] border-[#b9caae]" : d.state==="REJECTED" ? "bg-[#f9ebea] border-[#e6c0bb]" : d.state==="UPLOADED" ? "bg-[#fbf3df] border-[#ebd094]" : "bg-white border-[#dcd3b8]"}`}>
                  <div className={`h-10 w-10 shrink-0 border grid place-items-center font-mono text-[10px] font-bold tracking-widest ${d.state==="VERIFIED" ? "bg-[#1d3820] text-white border-[#1d3820]" : "bg-[#f0ebdd] text-[#1d3820] border-[#dcd3b8]"}`}>{DOC_MARKS[d.type] ?? d.type.split("_")[0].slice(0,3)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-semibold text-[#17170f]">{d.type.replaceAll("_"," ")}</span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-[0.05em] border ${d.requirement==="REQUIRED" ? "bg-[#1f1c12] text-white border-[#1f1c12]" : "bg-white border-[#c9bfa3] text-[#645b41]"}`}>{d.requirement}</span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-[0.05em] border ${d.state==="VERIFIED" ? "bg-[#1d3820] text-white border-[#1d3820]" : d.state==="REJECTED" ? "bg-[#7a2a24] text-white border-[#7a2a24]" : d.state==="UPLOADED" ? "bg-[#c08a2d] text-white border-[#c08a2d]" : "bg-[#f0ebdd] border-[#dcd3b8] text-[#4a4230]"}`}>{d.state}</span>
                    </div>
                    <div className="text-xs text-[#645b41] truncate font-mono mt-1">{d.fileName ?? "No file — upload below"} {d.rejectionReason ? `• Rejected: ${d.rejectionReason}` : ""}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {d.fileUrl && <a href={d.fileUrl} target="_blank" className="text-[11px] font-semibold uppercase tracking-[0.05em] border border-[#dcd3b8] bg-white px-3 py-1.5 hover:border-[#1d3820]">View</a>}
                      {isStaff ? (
                        <>
                          <button onClick={()=>verifyDoc(d.id,"verify")} className="text-[11px] font-bold uppercase tracking-[0.05em] bg-[#1d3820] text-white px-3 py-1.5 hover:bg-[#16301a]">Verify</button>
                          <button onClick={()=>verifyDoc(d.id,"reject")} className="text-[11px] font-semibold uppercase tracking-[0.05em] border border-[#dcd3b8] bg-white px-3 py-1.5">Reject</button>
                        </>
                      ) : (
                        <span className="font-mono text-[11px] text-[#837858]">Staff will verify after you upload</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={uploadDoc} className="mt-5 border-2 border-dashed border-[#c9bfa3] bg-[#f8f5ec] p-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[160px]">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Upload document</div>
                <select value={uploadType} onChange={e=>setUploadType(e.target.value)} className="mt-1 w-full border border-[#c9bfa3] bg-white px-3 py-2.5 text-sm focus:border-[#1d3820] outline-none">
                  {["TCT_OCT","TAX_DECLARATION","DEED_OF_SALE","LOT_PLAN","VALID_ID","OTHER"].map(t=> <option key={t} value={t}>{t.replaceAll("_"," ")}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <input type="file" name="file" required className="w-full text-sm file:mr-3 file:border file:border-[#1f1c12] file:bg-[#1f1c12] file:text-white file:px-4 file:py-2 file:text-[11px] file:font-bold file:uppercase file:tracking-[0.05em]" />
                <div className="font-mono text-[11px] text-[#837858] mt-1">15MB max • pdf/jpg/png • camera capture supported</div>
              </div>
              <button className="bg-[#1f1c12] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#17170f]">Upload</button>
            </form>

            {isStaff && !canQuote && (
              <div className="mt-4 bg-[#fbf3df] border border-[#ebd094] p-4 flex flex-wrap justify-between items-center gap-2">
                <div className="text-sm text-[#5a3a11]"><b>Staff override:</b> proceed to quotation without all required docs?</div>
                <button onClick={()=>transition("QUOTATION",{override:true, note:"Override missing docs — client informed via notification"})} className="bg-[#a9731f] hover:bg-[#8a5c18] text-white px-4 py-2 text-xs font-bold uppercase tracking-[0.06em]">Override → QUOTATION</button>
              </div>
            )}
          </div>
        )}

        {tab==="quotation" && (
          <div className="space-y-4">
            <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5 relative overflow-hidden">
              <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-[#1d3820]" />
              <div className="flex flex-wrap gap-3 justify-between">
                <div><div className="rule-label !text-[9px] text-[#1d3820]">Quotations</div><div className="text-xs font-mono text-[#645b41] mt-1">Versioned per project • validity • line items</div></div>
                <div className="font-mono text-[11px] border border-[#dcd3b8] bg-[#f0ebdd] px-2 py-1 text-[#4a4230]">{p.quotations?.length ?? 0} version(s)</div>
              </div>
              <div className="mt-4 space-y-3">
                {(p.quotations??[]).length===0 && <div className="text-sm text-[#645b41] border border-[#dcd3b8] bg-[#f0ebdd] p-6 text-center font-mono">No quotation yet — staff sends after DOCUMENT CHECK. You’ll be notified via in-app + email + SMS.</div>}
                {(p.quotations??[]).map((q:any)=> (
                  <div key={q.id} className="border border-[#dcd3b8] p-4 bg-[#f0ebdd]">
                    <div className="flex flex-wrap gap-2 justify-between">
                      <div className="font-semibold text-[#17170f]">v{q.version} — ₱{Number(q.total).toLocaleString()} <span className={`ml-2 font-mono text-[10px] px-2 py-0.5 uppercase tracking-[0.05em] border ${q.status==="ACCEPTED" ? "bg-[#1d3820] text-white border-[#1d3820]" : q.status==="SENT" ? "bg-[#e8f0f6] text-[#24425c] border-[#b9cede]" : "bg-white border-[#dcd3b8] text-[#4a4230]"}`}>{q.status}</span> {new Date(q.validUntil) < new Date() && q.status!=="ACCEPTED" && <span className="text-xs text-[#7a2a24] font-mono">• EXPIRED</span>}</div>
                      <div className="font-mono text-[11px] text-[#837858]">Valid until {new Date(q.validUntil).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs text-[#645b41] mt-1 font-mono">Survey fee ₱{Number(q.surveyFee).toLocaleString()} {q.otherFees ? `+ ${JSON.stringify(q.otherFees)}` : ""}</div>
                    {q.note && <div className="text-xs text-[#837858] mt-1">Note: {q.note}</div>}
                  </div>
                ))}
              </div>

              <div className="mt-5 grid lg:grid-cols-2 gap-4">
                {isStaff && (
                  <div className="border border-[#b9cede] bg-[#e8f0f6] p-4">
                    <div className="text-sm font-semibold text-[#24425c]">Staff — send quotation</div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="space-y-1"><div className="text-xs font-medium text-[#24425c]">Survey fee ₱</div><input type="number" value={qFee} onChange={e=>setQFee(Number(e.target.value))} className={inputCls} /></label>
                      <label className="space-y-1"><div className="text-xs font-medium text-[#24425c]">Other fee</div><div className="flex gap-1"><input value={otherLabel} onChange={e=>setOtherLabel(e.target.value)} placeholder="Travel" className={`${inputCls} flex-1`} /><input type="number" value={otherAmt} onChange={e=>setOtherAmt(Number(e.target.value))} className={`${inputCls} w-24`} /></div></label>
                    </div>
                    <button onClick={sendQuotation} className="mt-3 w-full bg-[#2c5270] hover:bg-[#24425c] text-white py-2.5 text-xs font-bold uppercase tracking-[0.06em]">Send quotation to client</button>
                    <div className="font-mono text-[11px] text-[#24425c] mt-1">Client gets in-app + email + SMS. Expires in 30 days.</div>
                  </div>
                )}
                <div className={`border p-4 ${p.quotations?.[0]?.status==="ACCEPTED" ? "bg-[#eef3e9] border-[#b9caae]" : "bg-white border-[#dcd3b8]"}`}>
                  <div className="rule-label !text-[9px] text-[#1d3820]">Client action</div>
                  <div className="text-xs font-mono text-[#645b41]">Review total & line items. Accept = confirmation (MANUAL for MVP, GCash/Maya future).</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={acceptQuotation} disabled={!p.quotations?.length || p.quotations[0].status==="ACCEPTED"} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#1d3820] text-white py-2.5 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#16301a] disabled:opacity-40"><Check className="h-3.5 w-3.5" /> Accept Quotation</button>
                    <button onClick={async()=>{
                      const q=p.quotations?.[0]; if(!q) return;
                      await fetch(`/api/projects/${id}/quotations`,{method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({action:"clarify", quotationId:q.id, message:"Need clarification"})});
                      setMsg("Clarification requested — staff will revise"); load();
                    }} className="px-4 py-2.5 border border-[#dcd3b8] bg-white text-xs font-semibold uppercase tracking-[0.05em]">Request clarification</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="appointment" && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5 relative overflow-hidden">
              <span aria-hidden className="absolute top-0 left-0 right-0 h-[2px] bg-[#1d3820]" />
              <div className="rule-label !text-[9px] text-[#1d3820]">Schedule site survey</div>
              <div className="text-xs font-mono text-[#645b41]">Request-and-confirm • staff warns on overlap but doesn’t auto-reject (2-person team)</div>
              <form onSubmit={createAppt} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Date *</div><input type="date" required value={appt.date} onChange={e=>setAppt({...appt,date:e.target.value})} className={inputCls} /></label>
                  <label className="space-y-1"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Time *</div><input placeholder="09:00 AM" required value={appt.time} onChange={e=>setAppt({...appt,time:e.target.value})} className={inputCls} /></label>
                </div>
                <label className="space-y-1"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Site location *</div><input placeholder="Lot 8888, Poblacion, Cabadbaran" required value={appt.siteLocation} onChange={e=>setAppt({...appt,siteLocation:e.target.value})} className={inputCls} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Contact person *</div><input required value={appt.contactPerson} onChange={e=>setAppt({...appt,contactPerson:e.target.value})} className={inputCls} /></label>
                  <label className="space-y-1"><div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Contact phone</div><input value={appt.contactPhone} onChange={e=>setAppt({...appt,contactPhone:e.target.value})} placeholder="0917..." className={inputCls} /></label>
                </div>
                <button className="w-full bg-[#c04a18] hover:bg-[#a83d12] text-white py-2.5 text-xs font-bold uppercase tracking-[0.06em]">{isStaff ? "Confirm appointment" : "Request appointment"}</button>
              </form>
              <div className="mt-4 space-y-2 max-h-[200px] overflow-auto">
                {(p.appointments??[]).map((a:any)=> (
                  <div key={a.id} className="border border-[#dcd3b8] p-3 flex justify-between gap-2 text-sm bg-white">
                    <div><div className="font-medium text-[#17170f]">{new Date(a.date).toLocaleDateString()} • {a.time}</div><div className="text-xs text-[#645b41] font-mono">{a.siteLocation} • {a.contactPerson} {a.contactPhone ? `• ${a.contactPhone}` : ""}</div></div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-[0.05em] border ${a.status==="CONFIRMED" ? "bg-[#1d3820] text-white border-[#1d3820]" : a.status==="REQUESTED" ? "bg-[#fbf3df] border-[#ebd094] text-[#714814]" : "bg-white border-[#dcd3b8] text-[#4a4230]"}`}>{a.status}</span>
                      {isStaff && a.status==="REQUESTED" && <button onClick={async()=>{ await fetch(`/api/projects/${id}/appointments`,{method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({appointmentId:a.id, action:"confirm"})}); load(); }} className="text-xs underline">Confirm</button>}
                      {isStaff && a.status==="CONFIRMED" && <button onClick={async()=>{ await fetch(`/api/projects/${id}/appointments`,{method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({appointmentId:a.id, action:"complete"})}); load(); }} className="text-xs underline">Mark completed → PROCESSING</button>}
                    </div>
                  </div>
                ))}
                {(p.appointments??[]).length===0 && <div className="text-xs text-[#837858] text-center py-6 font-mono">No appointments yet.</div>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5">
                <div className="rule-label !text-[9px] text-[#1d3820]">Payment</div>
                <div className="text-xs font-mono text-[#645b41]">MANUAL for MVP (accept = confirmation). Future GCash/Maya auto-confirms same gate.</div>
                <div className="mt-3 space-y-2">
                  {(p.payments??[]).map((pay:any)=> (
                    <div key={pay.id} className="border border-[#dcd3b8] p-3 flex justify-between text-sm bg-white">
                      <span className="font-mono text-xs text-[#17170f]">{pay.method} • ₱{Number(pay.amount).toLocaleString()} • <b>{pay.status}</b></span>
                      <span className="text-xs text-[#837858] font-mono">{pay.confirmedAt ? new Date(pay.confiredAt ?? pay.confirmedAt).toLocaleDateString() : ""}{pay.proofUrl && <a href={pay.proofUrl} className="underline ml-2">Proof</a>}</span>
                    </div>
                  ))}
                  {(p.payments??[]).length===0 && <div className="text-xs font-mono text-[#837858]">No payment yet — accept quotation to auto-create MANUAL CONFIRMED.</div>}
                </div>
                {isStaff && <button onClick={()=>transition("SITE_SURVEY")} className="mt-3 w-full border border-[#dcd3b8] bg-white py-2 text-xs font-semibold uppercase tracking-[0.05em] hover:border-[#1d3820]">Bypass: try SITE_SURVEY (requires payment)</button>}
              </div>
              <div className="bg-[#1f1c12] text-white border border-[#17170f] p-5">
                <div className="rule-label !text-[9px] text-[#b9caae]">Next steps</div>
                <div className="font-mono text-[11px] text-white/70 mt-1">SITE_SURVEY → PROCESSING (AutoCAD) → DOCUMENTATION → COMPLETED. Each step is staff-moved with note + notification.</div>
                {isStaff && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["PROCESSING","DOCUMENTATION","COMPLETED"].map(s=> (
                      <button key={s} onClick={()=>transition(s)} className="bg-white text-[#17170f] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.05em] hover:bg-[#eef3e9]">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab==="history" && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5">
              <div className="rule-label !text-[9px] text-[#1d3820]">Timeline</div>
              <div className="mt-4 max-h-[320px] overflow-auto pr-1">
                <VerticalTimeline status={p.status} history={(p.statusHistory??[]).map((h:any)=> ({fromStatus:h.fromStatus,toStatus:h.toStatus,createdAt:h.createdAt,note:h.note}))} />
              </div>
            </div>
            <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5">
              <div className="rule-label !text-[9px] text-[#1d3820]">Danger zone (staff)</div>
              <div className="text-xs font-mono text-[#645b41]">Revert one step or hold/cancel with reason (notifies client).</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={()=>transition("ON_HOLD",{note:"Weather/awaiting docs"})} className="px-4 py-2 border bg-[#fbf3df] border-[#ebd094] text-[#714814] text-xs font-semibold uppercase tracking-[0.05em]">On Hold</button>
                <button onClick={()=>transition("CANCELLED",{note:"Client requested cancel"})} className="px-4 py-2 border bg-[#f9ebea] border-[#e6c0bb] text-[#7a2a24] text-xs font-semibold uppercase tracking-[0.05em]">Cancel project</button>
                <button onClick={()=>{
                  const order=["CLIENT_REQUEST","DOCUMENT_CHECK","QUOTATION","PAYMENT_CONFIRMATION","SITE_SURVEY","PROCESSING","DOCUMENTATION","COMPLETED"] as const;
                  const idx = order.indexOf(p.status);
                  if(idx>0) transition(order[idx-1],{note:"Revert for correction"});
                }} className="px-4 py-2 border border-[#dcd3b8] bg-white text-xs font-semibold uppercase tracking-[0.05em]">← Revert one step</button>
              </div>
              <div className="mt-4 font-mono text-[11px] text-[#a79c7d]">All transitions audited in history + notification sent.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

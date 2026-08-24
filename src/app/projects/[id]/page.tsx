"use client";
import { useEffect, useState, useCallback } from "react";
import { Tracker, StatusPill, VerticalTimeline } from "@/components/Tracker";
import { useParams } from "next/navigation";

type Tab = "overview"|"documents"|"quotation"|"appointment"|"history";

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

  if(!p) return <div className="max-w-5xl mx-auto px-4 py-10"><div className="h-6 w-40 bg-zinc-200 rounded animate-pulse"/><div className="h-32 bg-zinc-100 rounded-2xl mt-4 animate-pulse"/></div>;

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
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* header */}
      <div className="bg-white rounded-[20px] border border-zinc-200 card overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="min-w-0">
              <div className="text-[11px] tracking-[0.14em] font-semibold text-emerald-700">PROJECT • {p.surveyType.replaceAll("_"," ")}</div>
              <h1 className="font-bold tracking-tight text-lg truncate">{p.property.label} <span className="text-zinc-400 font-normal text-sm">#{p.id.slice(0,8)}</span></h1>
              <div className="text-xs text-zinc-500 mt-1">{p.property.barangay ? p.property.barangay+", " : ""}{p.property.municipality}, {p.property.province} • Lot {p.property.lotNo ?? "—"} • TCT {p.property.titleNo ?? "— (untitled)"}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusPill status={p.status} />
              <div className="text-xs text-zinc-500">{isStaff ? "Staff view" : "Client view"} • Created {new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mt-5"><Tracker status={p.status} /></div>

          {/* contextual next-step banner */}
          <div className="mt-4 rounded-2xl border p-3 flex flex-wrap gap-2 items-center justify-between"
               style={{ background: p.status==="DOCUMENT_CHECK" && !canQuote ? "#fffbeb" : p.status==="QUOTATION" ? "#eff6ff" : p.status==="PAYMENT_CONFIRMATION" ? "#faf5ff" : "#f9fafb", borderColor: p.status==="DOCUMENT_CHECK" && !canQuote ? "#fde68a" : p.status==="QUOTATION" ? "#bfdbfe" : "#e4e4e7"}}>
            <div className="text-sm">
              {p.status==="DOCUMENT_CHECK" && !canQuote && <span>📄 <b>{missingRequired.length} required document(s) need upload/verification</b> — upload below or staff overrides with reason.</span>}
              {p.status==="DOCUMENT_CHECK" && canQuote && <span>✅ Documents verified — <b>ready for quotation</b>. Staff can send quote.</span>}
              {p.status==="QUOTATION" && <span>💰 Quotation ready — review total, validity, line items. <b>Accept</b> to unlock site survey.</span>}
              {p.status==="PAYMENT_CONFIRMATION" && <span>✅ Payment confirmed — <b>schedule your site survey</b> in Appointment tab.</span>}
              {p.status==="SITE_SURVEY" && <span>📍 Site survey scheduled — staff will mark complete after field work → auto PROCESSING.</span>}
              {p.status==="PROCESSING" && <span>🗺️ Processing in AutoCAD — we’re preparing your lot plan.</span>}
              {p.status==="DOCUMENTATION" && <span>📑 Documentation — final deliverables being prepared.</span>}
              {p.status==="COMPLETED" && <span>🎉 Completed — your deliverables are ready.</span>}
              {p.status==="CLIENT_REQUEST" && <span>📝 Request received — moving to document check.</span>}
            </div>
            <div className="flex gap-2">
              {p.status==="DOCUMENT_CHECK" && canQuote && isStaff && <button onClick={()=>transition("QUOTATION")} className="bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-semibold">Mark ready for quotation</button>}
              {p.status==="PAYMENT_CONFIRMATION" && <button onClick={()=> setTab("appointment")} className="bg-purple-600 text-white px-4 py-2 rounded-full text-xs font-semibold">Schedule →</button>}
              {isStaff && p.status!=="COMPLETED" && p.status!=="CANCELLED" && <span className="text-xs text-zinc-500">Staff quick actions in each tab</span>}
            </div>
          </div>

          {msg && <div className="mt-3 text-xs p-3 bg-amber-50 border border-amber-200 rounded-xl whitespace-pre-wrap">{msg}</div>}
        </div>

        {/* tabs */}
        <div className="border-t bg-zinc-50/60 px-2 py-2 flex gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map(t=> (
            <button key={t.k} onClick={()=> setTab(t.k)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${tab===t.k ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"}`}>{t.l}</button>
          ))}
          {isStaff && <span className="ml-auto hidden sm:inline-flex items-center gap-2 text-xs bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1 rounded-full">Staff mode — verify, quote, confirm</span>}
        </div>
      </div>

      {/* content */}
      <div className="mt-4">
        {tab==="overview" && (
          <div className="space-y-4">
            {isStaff && (
              <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5">
                <div className="flex gap-2 items-center">
                  <span className="h-7 w-7 rounded-full bg-amber-500 text-white grid place-items-center text-xs font-bold">!</span>
                  <div className="font-semibold text-sm text-amber-900">Staff - Public Track Editor (no login needed for client)</div>
                  <span className="ml-auto text-xs bg-white border border-amber-200 px-2 py-1 rounded-full text-amber-800">{p.statusMessage ? "Live" : "No message yet"}</span>
                </div>
                <div className="text-xs text-amber-800 mt-1">Kini ang makita ni client pag mag-type siya og Lot Number sa /track. Ikaw ray mag-handle. Example: "Kulang ang papel ug tax declaration" or "Submit na sa DENR".</div>
                <div className="mt-4 grid md:grid-cols-3 gap-3">
                  <label className="space-y-1"><div className="text-xs font-medium text-zinc-700">Client Name (e.g., Khent Felary Sanco)</div><input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Khent Felary Sanco" className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label className="space-y-1"><div className="text-xs font-medium text-zinc-700">Survey Date</div><input type="date" value={editSurveyDate} onChange={e=>setEditSurveyDate(e.target.value)} className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm" /></label>
                  <label className="space-y-1 md:col-span-1"><div className="text-xs font-medium text-zinc-700">Status - free text (visible to client)</div><input value={editStatusMsg} onChange={e=>setEditStatusMsg(e.target.value)} placeholder="Kulang tax declaration / Submit na sa DENR" className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm" /></label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={saveMeta} disabled={savingMeta} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50">{savingMeta ? "Saving..." : "Save - update public track"}</button>
                  <button onClick={()=>{ setEditStatusMsg("Kulang ang papel ug tax declaration - palihog provide Tax Dec"); }} className="px-4 py-2.5 rounded-full border bg-white text-xs">Preset: kulang tax</button>
                  <button onClick={()=>{ setEditStatusMsg("Submit na sa DENR - waiting for approval"); }} className="px-4 py-2.5 rounded-full border bg-white text-xs">Preset: DENR</button>
                </div>
                <div className="text-xs text-zinc-600 mt-2">Preview sa client: <b>{editStatusMsg || "- no message -"}</b> - makita dayon sa <a href={`/track?q=${encodeURIComponent(p.property?.lotNo ?? "")}`} className="underline text-amber-700">/track?q={p.property?.lotNo}</a></div>
              </div>
            )}
            <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
                <div className="text-sm font-semibold">Request details</div>
                <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl bg-zinc-50 border p-4"><div className="text-xs tracking-widest font-semibold text-zinc-500">PURPOSE</div><div className="mt-1">{p.purpose}</div><div className="text-xs text-zinc-500 mt-2">Preferred: {p.preferredSchedule ?? "—"}</div></div>
                  <div className="rounded-2xl bg-zinc-50 border p-4"><div className="text-xs tracking-widest font-semibold text-zinc-500">PROPERTY</div><div className="font-medium">{p.property.label}</div><div className="text-xs text-zinc-500">{p.property.barangay}, {p.property.municipality} • {p.property.areaSqm ? `${p.property.areaSqm} sqm` : ""}</div><div className="text-xs text-zinc-500">GPS: {p.property.gpsLat ? `${p.property.gpsLat}, ${p.property.gpsLng}` : "—"}</div></div>
                </div>
              </div>
              <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
                <div className="text-sm font-semibold">What’s next?</div>
                <ol className="mt-3 space-y-2 text-sm">
                  <li className="flex gap-3"><span className="h-6 w-6 rounded-full bg-emerald-700 text-white grid place-items-center text-xs">1</span><span><b>Upload documents</b> <span className="text-zinc-500">— TCT/OCT, Tax Dec, Valid ID (required per survey type)</span></span></li>
                  <li className="flex gap-3"><span className="h-6 w-6 rounded-full bg-zinc-100 border grid place-items-center text-xs">2</span><span><b>Receive quotation</b> <span className="text-zinc-500">— estimator prices within 48h of doc check</span></span></li>
                  <li className="flex gap-3"><span className="h-6 w-6 rounded-full bg-zinc-100 border grid place-items-center text-xs">3</span><span><b>Confirm & schedule</b> <span className="text-zinc-500">— accept → payment gate → site survey</span></span></li>
                </ol>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
                <div className="text-sm font-semibold">Timeline</div>
                <div className="mt-4 max-h-[280px] overflow-auto pr-1">
                  <VerticalTimeline status={p.status} history={(p.statusHistory??[]).map((h:any)=> ({fromStatus:h.fromStatus,toStatus:h.toStatus,createdAt:h.createdAt,note:h.note}))} />
                </div>
              </div>
              <div className="bg-emerald-700 text-white rounded-[20px] p-5">
                <div className="text-sm font-semibold">Need help?</div>
                <div className="text-sm text-white/80">Contact Sanco — we also handle FB Messenger / walk-in intake for you.</div>
                <a href="/contact" className="mt-3 inline-flex bg-white text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">Contact</a>
              </div>
            </div>
          </div>
          </div>
        )}

        {tab==="documents" && (
          <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
            <div className="flex flex-wrap gap-3 justify-between">
              <div><div className="font-semibold">Documents</div><div className="text-xs text-zinc-500">Required docs must be <b>VERIFIED</b> before QUOTATION. Override needs reason.</div></div>
              <div className={`text-xs px-3 py-1.5 rounded-full border font-medium ${canQuote ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>{canQuote ? "✓ Ready to quote" : `${missingRequired.length} required missing`}</div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {(p.documents??[]).map((d:any)=> (
                <div key={d.id} className={`rounded-2xl border p-4 flex gap-3 ${d.state==="VERIFIED" ? "bg-emerald-50/50 border-emerald-200" : d.state==="REJECTED" ? "bg-red-50 border-red-200" : d.state==="UPLOADED" ? "bg-amber-50 border-amber-200" : "bg-white border-zinc-200"}`}>
                  <div className={`h-10 w-10 rounded-xl border grid place-items-center shrink-0 ${d.state==="VERIFIED" ? "bg-emerald-600 text-white border-emerald-600" : "bg-zinc-50"}`}>{d.type==="TCT_OCT" ? "📜" : d.type==="TAX_DECLARATION" ? "🏛️" : d.type==="VALID_ID" ? "🪪" : d.type==="LOT_PLAN" ? "🗺️" : "📄"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-2 items-center"><span className="text-sm font-semibold">{d.type.replaceAll("_"," ")}</span><span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${d.requirement==="REQUIRED" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600"}`}>{d.requirement}</span><span className={`text-[11px] px-2 py-0.5 rounded-full border ${d.state==="VERIFIED" ? "bg-emerald-600 text-white border-emerald-600" : d.state==="REJECTED" ? "bg-red-600 text-white border-red-600" : d.state==="UPLOADED" ? "bg-amber-500 text-white border-amber-500" : "bg-zinc-100 border-zinc-200"}`}>{d.state}</span></div>
                    <div className="text-xs text-zinc-500 truncate">{d.fileName ?? "No file — upload below"} {d.rejectionReason ? `• Rejected: ${d.rejectionReason}` : ""}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {d.fileUrl && <a href={d.fileUrl} target="_blank" className="text-xs border bg-white px-3 py-1.5 rounded-full hover:bg-zinc-50">View</a>}
                      {isStaff ? (
                        <>
                          <button onClick={()=>verifyDoc(d.id,"verify")} className="text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-full">Verify</button>
                          <button onClick={()=>verifyDoc(d.id,"reject")} className="text-xs border bg-white px-3 py-1.5 rounded-full">Reject</button>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-400">Staff will verify after you upload</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={uploadDoc} className="mt-5 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[160px]">
                <div className="text-xs font-medium">Upload document</div>
                <select value={uploadType} onChange={e=>setUploadType(e.target.value)} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm">
                  {["TCT_OCT","TAX_DECLARATION","DEED_OF_SALE","LOT_PLAN","VALID_ID","OTHER"].map(t=> <option key={t} value={t}>{t.replaceAll("_"," ")}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <input type="file" name="file" required className="w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-zinc-900 file:text-white file:px-4 file:py-2 file:text-xs" />
                <div className="text-[11px] text-zinc-500 mt-1">15MB max • pdf/jpg/png • camera capture supported</div>
              </div>
              <button className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold">Upload</button>
            </form>

            {isStaff && !canQuote && (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex justify-between items-center">
                <div className="text-sm"><b>Staff override:</b> proceed to quotation without all required docs?</div>
                <button onClick={()=>transition("QUOTATION",{override:true, note:"Override missing docs — client informed via notification"})} className="bg-amber-600 text-white px-4 py-2 rounded-full text-xs font-semibold">Override → QUOTATION</button>
              </div>
            )}
          </div>
        )}

        {tab==="quotation" && (
          <div className="space-y-4">
            <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
              <div className="flex flex-wrap gap-3 justify-between">
                <div><div className="font-semibold">Quotations</div><div className="text-xs text-zinc-500">Versioned per project • validity • line items</div></div>
                <div className="text-xs bg-zinc-100 border px-2 py-1 rounded-full">{p.quotations?.length ?? 0} version(s)</div>
              </div>
              <div className="mt-4 space-y-3">
                {(p.quotations??[]).length===0 && <div className="text-sm text-zinc-500 rounded-2xl bg-zinc-50 border p-6 text-center">No quotation yet — staff sends after DOCUMENT CHECK. You’ll be notified via in-app + email + SMS.</div>}
                {(p.quotations??[]).map((q:any)=> (
                  <div key={q.id} className="rounded-2xl border p-4 bg-zinc-50">
                    <div className="flex flex-wrap gap-2 justify-between">
                      <div className="font-semibold">v{q.version} — ₱{Number(q.total).toLocaleString()} <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${q.status==="ACCEPTED" ? "bg-emerald-600 text-white border-emerald-600" : q.status==="SENT" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-white"}`}>{q.status}</span> {new Date(q.validUntil) < new Date() && q.status!=="ACCEPTED" && <span className="text-xs text-red-600">• EXPIRED</span>}</div>
                      <div className="text-xs text-zinc-500">Valid until {new Date(q.validUntil).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs text-zinc-600 mt-1">Survey fee ₱{Number(q.surveyFee).toLocaleString()} {q.otherFees ? `+ ${JSON.stringify(q.otherFees)}` : ""}</div>
                    {q.note && <div className="text-xs text-zinc-500 mt-1">Note: {q.note}</div>}
                  </div>
                ))}
              </div>

              <div className="mt-5 grid lg:grid-cols-2 gap-4">
                {isStaff && (
                  <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                    <div className="text-sm font-semibold text-blue-900">Staff — send quotation</div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="space-y-1"><div className="text-xs font-medium">Survey fee ₱</div><input type="number" value={qFee} onChange={e=>setQFee(Number(e.target.value))} className="w-full rounded-xl border px-3 py-2.5 text-sm bg-white" /></label>
                      <label className="space-y-1"><div className="text-xs font-medium">Other fee</div><div className="flex gap-1"><input value={otherLabel} onChange={e=>setOtherLabel(e.target.value)} placeholder="Travel" className="flex-1 rounded-xl border px-2 py-2.5 text-sm bg-white" /><input type="number" value={otherAmt} onChange={e=>setOtherAmt(Number(e.target.value))} className="w-24 rounded-xl border px-2 py-2.5 text-sm bg-white" /></div></label>
                    </div>
                    <button onClick={sendQuotation} className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-full text-sm font-semibold">Send quotation to client</button>
                    <div className="text-[11px] text-blue-700 mt-1">Client gets in-app + email + SMS. Expires in 30 days.</div>
                  </div>
                )}
                <div className={`rounded-2xl border p-4 ${p.quotations?.[0]?.status==="ACCEPTED" ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}>
                  <div className="text-sm font-semibold">Client action</div>
                  <div className="text-xs text-zinc-500">Review total & line items. Accept = confirmation (MANUAL for MVP, GCash/Maya future).</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={acceptQuotation} disabled={!p.quotations?.length || p.quotations[0].status==="ACCEPTED"} className="flex-1 bg-emerald-700 text-white py-2.5 rounded-full text-sm font-semibold disabled:opacity-40">✓ ACCEPT QUOTATION</button>
                    <button onClick={async()=>{
                      const q=p.quotations?.[0]; if(!q) return;
                      await fetch(`/api/projects/${id}/quotations`,{method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({action:"clarify", quotationId:q.id, message:"Need clarification"})});
                      setMsg("Clarification requested — staff will revise"); load();
                    }} className="px-4 py-2.5 rounded-full border bg-white text-sm">Request clarification</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="appointment" && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
              <div className="font-semibold">Schedule site survey</div>
              <div className="text-xs text-zinc-500">Request-and-confirm • staff warns on overlap but doesn’t auto-reject (2-person team)</div>
              <form onSubmit={createAppt} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1"><div className="text-xs font-medium">Date *</div><input type="date" required value={appt.date} onChange={e=>setAppt({...appt,date:e.target.value})} className="w-full rounded-xl border px-3 py-2.5 text-sm bg-white" /></label>
                  <label className="space-y-1"><div className="text-xs font-medium">Time *</div><input placeholder="09:00 AM" required value={appt.time} onChange={e=>setAppt({...appt,time:e.target.value})} className="w-full rounded-xl border px-3 py-2.5 text-sm bg-white" /></label>
                </div>
                <label className="space-y-1"><div className="text-xs font-medium">Site location *</div><input placeholder="Lot 8888, Poblacion, Cabadbaran" required value={appt.siteLocation} onChange={e=>setAppt({...appt,siteLocation:e.target.value})} className="w-full rounded-xl border px-3 py-2.5 text-sm bg-white" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1"><div className="text-xs font-medium">Contact person *</div><input required value={appt.contactPerson} onChange={e=>setAppt({...appt,contactPerson:e.target.value})} className="w-full rounded-xl border px-3 py-2.5 text-sm bg-white" /></label>
                  <label className="space-y-1"><div className="text-xs font-medium">Contact phone</div><input value={appt.contactPhone} onChange={e=>setAppt({...appt,contactPhone:e.target.value})} placeholder="0917..." className="w-full rounded-xl border px-3 py-2.5 text-sm bg-white" /></label>
                </div>
                <button className="w-full bg-orange-600 text-white py-2.5 rounded-full text-sm font-semibold">{isStaff ? "Confirm appointment" : "Request appointment"}</button>
              </form>
              <div className="mt-4 space-y-2 max-h-[200px] overflow-auto">
                {(p.appointments??[]).map((a:any)=> (
                  <div key={a.id} className="rounded-xl border p-3 flex justify-between gap-2 text-sm bg-zinc-50">
                    <div><div className="font-medium">{new Date(a.date).toLocaleDateString()} • {a.time}</div><div className="text-xs text-zinc-500">{a.siteLocation} • {a.contactPerson} {a.contactPhone ? `• ${a.contactPhone}` : ""}</div></div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${a.status==="CONFIRMED" ? "bg-emerald-600 text-white border-emerald-600" : a.status==="REQUESTED" ? "bg-amber-100 border-amber-200" : "bg-white"}`}>{a.status}</span>
                      {isStaff && a.status==="REQUESTED" && <button onClick={async()=>{ await fetch(`/api/projects/${id}/appointments`,{method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({appointmentId:a.id, action:"confirm"})}); load(); }} className="text-xs underline">Confirm</button>}
                      {isStaff && a.status==="CONFIRMED" && <button onClick={async()=>{ await fetch(`/api/projects/${id}/appointments`,{method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({appointmentId:a.id, action:"complete"})}); load(); }} className="text-xs underline">Mark completed → PROCESSING</button>}
                    </div>
                  </div>
                ))}
                {(p.appointments??[]).length===0 && <div className="text-xs text-zinc-500 text-center py-6">No appointments yet.</div>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
                <div className="text-sm font-semibold">Payment</div>
                <div className="text-xs text-zinc-500">MANUAL for MVP (accept = confirmation). Future GCash/Maya auto-confirms same gate.</div>
                <div className="mt-3 space-y-2">
                  {(p.payments??[]).map((pay:any)=> (
                    <div key={pay.id} className="rounded-xl border p-3 flex justify-between text-sm bg-zinc-50">
                      <span>{pay.method} • ₱{Number(pay.amount).toLocaleString()} • <b>{pay.status}</b></span>
                      <span className="text-xs text-zinc-500">{pay.confirmedAt ? new Date(pay.confiredAt ?? pay.confirmedAt).toLocaleDateString() : ""}{pay.proofUrl && <a href={pay.proofUrl} className="underline ml-2">Proof</a>}</span>
                    </div>
                  ))}
                  {(p.payments??[]).length===0 && <div className="text-xs text-zinc-500">No payment yet — accept quotation to auto-create MANUAL CONFIRMED.</div>}
                </div>
                {isStaff && <button onClick={()=>transition("SITE_SURVEY")} className="mt-3 w-full border bg-white py-2 rounded-full text-sm font-medium">Bypass: try SITE_SURVEY (requires payment)</button>}
              </div>
              <div className="bg-zinc-900 text-white rounded-[20px] p-5">
                <div className="text-sm font-semibold">Next steps</div>
                <div className="text-sm text-white/70 mt-1">SITE_SURVEY → PROCESSING (AutoCAD) → DOCUMENTATION → COMPLETED. Each step is staff-moved with note + notification.</div>
                {isStaff && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["PROCESSING","DOCUMENTATION","COMPLETED"].map(s=> (
                      <button key={s} onClick={()=>transition(s)} className="bg-white text-zinc-900 px-3 py-1.5 rounded-full text-xs font-semibold">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab==="history" && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
              <div className="text-sm font-semibold">Timeline</div>
              <div className="mt-4 max-h-[320px] overflow-auto pr-1">
                <VerticalTimeline status={p.status} history={(p.statusHistory??[]).map((h:any)=> ({fromStatus:h.fromStatus,toStatus:h.toStatus,createdAt:h.createdAt,note:h.note}))} />
              </div>
            </div>
            <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
              <div className="text-sm font-semibold">Danger zone (staff)</div>
              <div className="text-xs text-zinc-500">Revert one step or hold/cancel with reason (notifies client).</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={()=>transition("ON_HOLD",{note:"Weather/awaiting docs"})} className="px-4 py-2 rounded-full border bg-amber-50 border-amber-200 text-amber-800 text-sm">ON HOLD</button>
                <button onClick={()=>transition("CANCELLED",{note:"Client requested cancel"})} className="px-4 py-2 rounded-full border bg-red-50 border-red-200 text-red-700 text-sm">CANCEL project</button>
                <button onClick={()=>{
                  const order=["CLIENT_REQUEST","DOCUMENT_CHECK","QUOTATION","PAYMENT_CONFIRMATION","SITE_SURVEY","PROCESSING","DOCUMENTATION","COMPLETED"] as const;
                  const idx = order.indexOf(p.status);
                  if(idx>0) transition(order[idx-1],{note:"Revert for correction"});
                }} className="px-4 py-2 rounded-full border bg-white text-sm">← Revert one step</button>
              </div>
              <div className="mt-4 text-xs text-zinc-400">All transitions audited in history + notification sent.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

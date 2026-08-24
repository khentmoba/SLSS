const base = "http://127.0.0.1:3000";
let cookies = "";
function headers(extra={}){ return { "Content-Type":"application/json", "Cookie": cookies, ...extra }; }
function storeCookies(res){
  const set = res.headers.getSetCookie?.() ?? [];
  if(set.length){ cookies = set.map(c=> c.split(";")[0]).join("; "); }
}
async function jfetch(path, opts={}){
  const res = await fetch(base+path, { ...opts, headers: headers(opts.headers) });
  storeCookies(res);
  const j = await res.json().catch(()=> ({}));
  return { status: res.status, j, res };
}
console.log("=== SANCO LIVE DEMO — 8-step pipeline ===");
console.log("Base:", base, "Cookies jar start empty");

// 1. OTP send + verify for demo client 09170002222
console.log("\n1) OTP send 09170002222");
let r = await jfetch("/api/auth/otp/send", { method:"POST", body: JSON.stringify({ phone:"09170002222" }) });
console.log("send:", r.status, r.j);
const code = r.j.codeForDev;
console.log("dev code:", code);
console.log("1b) OTP verify");
r = await jfetch("/api/auth/otp/verify", { method:"POST", body: JSON.stringify({ phone:"09170002222", code }) });
console.log("verify:", r.status, r.j, "cookies:", cookies.slice(0,60));

// 2. CLIENT REQUEST -> creates Property + Project (auto DOCUMENT_CHECK)
console.log("\n2) POST /api/projects CLIENT_REQUEST");
r = await jfetch("/api/projects", { method:"POST", body: JSON.stringify({
  surveyType:"SUBDIVISION_SURVEY",
  purpose:"For titling and subdivision of inherited lot",
  preferredSchedule:"Aug 28, 9am",
  lotNo:"8888",
  titleNo:"TCT-DEMO-"+Date.now(),
  barangay:"Poblacion",
  municipality:"Cabadbaran",
  province:"Agusan del Norte",
  areaSqm: 1200,
  addressNotes:"Near Sanco office, blue gate"
})});
console.log("create:", r.status, r.j.error ?? ("project "+r.j.project?.id+" status "+r.j.project?.status));
const pid = r.j.project?.id;
if(!pid) throw new Error("no project");

// 3. Check tracker
console.log("\n3) GET /api/projects/[id]");
r = await jfetch(`/api/projects/${pid}`);
console.log("status:", r.j.project.status, "docs:", r.j.project.documents.map(d=>d.type+":"+d.state).join(", "));

// 4. Staff login (estimator@sanco.ph)
console.log("\n4) Staff login");
r = await jfetch("/api/staff/login", { method:"POST", body: JSON.stringify({ email:"estimator@sanco.ph", password:"sanco123" })});
console.log("staff:", r.status, r.j.staff);
// cookies now have staff_id merged (jar keeps both)
console.log("cookies after staff:", cookies.slice(0,100));

// 5. DOCUMENT CHECK - verify all REQUIRED docs (simulate uploads via direct DB? we verify MISSING -> VERIFIED)
console.log("\n5) Verify documents (DOCUMENT_CHECK gate)");
for(const doc of r.j.project?.documents ?? []){
  // fetch fresh docs
}
let docs = (await jfetch(`/api/projects/${pid}`)).j.project.documents;
for(const d of docs){
  if(d.requirement==="REQUIRED"){
    const vr = await jfetch(`/api/projects/${pid}/documents`, { method:"PATCH", body: JSON.stringify({ documentId:d.id, action:"verify" })});
    console.log(` verify ${d.type}:`, vr.status);
  }
}

// 6. Transition DOCUMENT_CHECK -> QUOTATION (should succeed now)
console.log("\n6) Transition DOCUMENT_CHECK -> QUOTATION");
r = await jfetch(`/api/projects/${pid}/transition`, { method:"POST", body: JSON.stringify({ to:"QUOTATION", note:"Docs verified" })});
console.log(r.status, r.j.error ?? r.j.project.status);

// 7. Send Quotation v1
console.log("\n7) POST quotation");
r = await jfetch(`/api/projects/${pid}/quotations`, { method:"POST", body: JSON.stringify({ surveyFee:28000, otherFees:[{label:"Travel",amount:2500},{label:"Monument",amount:1500}], validDays:30 })});
console.log(r.status, r.j.quotation ? `v${r.j.quotation.version} total ₱${r.j.quotation.total}` : r.j.error);

// 8. Re-attach client cookie for accept (need client_id) - re-verify OTP to get client cookie back (staff cookie overwritten jar? we keep both)
console.log("\n8) Client ACCEPT quotation");
// need to ensure cookies has client_id; re-verify quickly with new code (or reuse)
let send2 = await jfetch("/api/auth/otp/send", { method:"POST", body: JSON.stringify({ phone:"09170002222" })});
let code2 = send2.j.codeForDev;
if(code2){ await jfetch("/api/auth/otp/verify", { method:"POST", body: JSON.stringify({ phone:"09170002222", code: code2 }) }); }
const fresh = await jfetch(`/api/projects/${pid}`);
const qid = fresh.j.project.quotations[0]?.id;
r = await jfetch(`/api/projects/${pid}/quotations`, { method:"PATCH", body: JSON.stringify({ action:"accept", quotationId: qid })});
console.log("accept:", r.status, r.j.error ?? "accepted -> PAYMENT_CONFIRMATION");

// 9. Verify PAYMENT_CONFIRMATION -> SITE_SURVEY gate
console.log("\n9) Check project status after accept");
r = await jfetch(`/api/projects/${pid}`);
console.log("status:", r.j.project.status, "payments:", r.j.project.payments.map(p=>p.method+":"+p.status).join(", "));
console.log("Transition PAYMENT_CONFIRMATION -> SITE_SURVEY");
r = await jfetch(`/api/projects/${pid}/transition`, { method:"POST", body: JSON.stringify({ to:"SITE_SURVEY" })});
console.log(r.status, r.j.error ?? r.j.project.status);

// 10. Appointment
console.log("\n10) Create appointment");
r = await jfetch(`/api/projects/${pid}/appointments`, { method:"POST", body: JSON.stringify({ date: new Date(Date.now()+3*864e5).toISOString().slice(0,10), time:"09:00 AM", siteLocation:"Lot 8888, Cabadbaran", contactPerson:"Demo Client", contactPhone:"09170002222" })});
console.log("appt:", r.status, r.j.appointment?.status ?? r.j.error);

// 11. Complete appointment -> should auto move SITE_SURVEY -> PROCESSING
if(r.j.appointment?.id){
  console.log("\n11) Complete appointment -> PROCESSING");
  let cr = await jfetch(`/api/projects/${pid}/appointments`, { method:"PATCH", body: JSON.stringify({ appointmentId: r.j.appointment.id, action:"complete" })});
  console.log(cr.status, cr.j.appointment?.status);
}
r = await jfetch(`/api/projects/${pid}`);
console.log("status after appt complete:", r.j.project.status);

// 12. PROCESSING -> DOCUMENTATION -> COMPLETED
console.log("\n12) PROCESSING -> DOCUMENTATION -> COMPLETED");
for(const step of ["DOCUMENTATION","COMPLETED"]){
  // need to go via PROCESSING if still there? We are at PROCESSING now, next is DOCUMENTATION
  // Actually we did SITE_SURVEY -> PROCESSING auto, so now PROCESSING -> DOCUMENTATION
  // We'll transition step by step
  // Ensure we are at correct from: if we are at PROCESSING, first to DOCUMENTATION, then to COMPLETED
  const cur = (await jfetch(`/api/projects/${pid}`)).j.project.status;
  const target = cur==="PROCESSING" ? "DOCUMENTATION" : cur==="DOCUMENTATION" ? "COMPLETED" : step;
  r = await jfetch(`/api/projects/${pid}/transition`, { method:"POST", body: JSON.stringify({ to: target })});
  console.log(` ${cur} -> ${target}:`, r.status, r.j.error ?? r.j.project.status);
}
r = await jfetch(`/api/projects/${pid}`);
console.log("\n=== FINAL ===");
console.log("Project", pid, "status:", r.j.project.status);
console.log("Timeline:", r.j.project.statusHistory.map(h=>h.fromStatus+"→"+h.toStatus).join(" | "));
console.log("\nDemo done — open:");
console.log(` http://127.0.0.1:3000/track?id=${pid}`);
console.log(` http://127.0.0.1:3000/projects/${pid}`);
console.log(` http://127.0.0.1:3000/staff  (kanban)`);
console.log(` http://127.0.0.1:3000/properties`);

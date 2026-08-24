import Link from "next/link";

const surveyCards = [
  { t: "Relocation Survey", sub: "Re-establish boundaries on ground", href: "/request?type=RELOCATION_SURVEY", abbr: "RS", docs: "TCT · Lot Plan · ID" },
  { t: "Subdivision", sub: "Split one lot into many", href: "/request?type=SUBDIVISION_SURVEY", abbr: "SD", docs: "TCT · Tax Dec · Lot Plan · ID" },
  { t: "Consolidation", sub: "Merge lots into one title", href: "/request?type=CONSOLIDATION_SURVEY", abbr: "CN", docs: "TCTs · ID" },
  { t: "Topographic", sub: "Elevation and features map", href: "/request?type=TOPOGRAPHIC_SURVEY", abbr: "TP", docs: "Lot Plan (opt) · ID" },
  { t: "Boundary Verification", sub: "Confirm existing monuments", href: "/request?type=BOUNDARY_VERIFICATION", abbr: "BV", docs: "Tax Dec · ID" },
  { t: "Land / Property", sub: "General survey and lot plan", href: "/request?type=LAND_PROPERTY_SURVEY", abbr: "LP", docs: "TCT · Tax Dec · ID" },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <section className="mt-6 rounded-[28px] overflow-hidden border bg-white card">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-7 md:p-10">
            <div className="inline-flex items-center text-xs tracking-[0.12em] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">SANCO LAND SURVEYING SERVICES — EST. CABADBARAN</div>
            <h1 className="text-[30px] md:text-[42px] font-black tracking-[-0.03em] leading-[0.92] mt-5">
              Your property.<br />
              <span className="text-emerald-800">Our precision.</span>
            </h1>
            <p className="text-[15px] leading-relaxed text-zinc-600 mt-3 max-w-[52ch]">From boundary monuments to bank-ready lot plans. Request a quotation without visiting the office, upload once, and follow your survey step by step.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/request" className="bg-emerald-800 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-emerald-900 shadow">Start your survey</Link>
              <Link href="/track" className="bg-white border border-zinc-200 px-7 py-3 rounded-full text-sm font-semibold hover:bg-zinc-50">Track my project</Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-600" />2-person team · 48h quote</span>
              <span aria-hidden="true" className="hidden sm:inline text-zinc-300">·</span>
              <span>Cabadbaran · Butuan · Bayugan</span>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { k: "500+", l: "Surveys completed" },
                { k: "8 steps", l: "Transparent tracker" },
                { k: "24h", l: "Avg. document check" },
              ].map(s=> (
                <div key={s.k} className="rounded-2xl bg-zinc-50 border p-3.5">
                  <div className="font-bold tracking-tight text-zinc-900">{s.k}</div>
                  <div className="text-xs text-zinc-600 leading-tight">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-zinc-600">One client can own many properties. Each property keeps its own full history.</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 p-6 md:p-7 flex flex-col gap-4">
            <div className="rounded-2xl bg-white shadow-xl border p-5">
              <div className="text-xs tracking-[0.14em] font-semibold text-emerald-800">8-STEP WORKFLOW</div>
              <div className="text-sm text-zinc-600 mt-1">No more “Unsa na status sa akong survey?” — every move is logged.</div>
              <ol className="mt-4 grid grid-cols-2 gap-2.5">
                {[
                  ["1", "Client Request", "Inquiry received"],
                  ["2", "Document Check", "We verify docs"],
                  ["3", "Quotation", "We price it"],
                  ["4", "Payment", "You confirm"],
                  ["5", "Site Survey", "Field work"],
                  ["6", "Processing", "AutoCAD"],
                  ["7", "Documentation", "Deliverables"],
                  ["8", "Completed", "Download"],
                ].map(([n, t, d])=> (
                  <li key={n} className="flex gap-2.5 rounded-xl bg-zinc-50 border px-3 py-2.5">
                    <span className="h-7 w-7 rounded-full bg-emerald-800 text-white grid place-items-center text-xs font-bold shrink-0">{n}</span>
                    <span className="min-w-0"><span className="block font-semibold text-xs leading-none text-zinc-900">{t}</span><span className="block text-xs leading-tight text-zinc-600">{d}</span></span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <div className="text-xs font-semibold tracking-[0.12em] text-zinc-500">MY PROPERTIES — PREVIEW</div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Lot 1234 — Cabadbaran", state: "Processing", tone: "bg-emerald-50 border-emerald-200 text-emerald-800" },
                  { label: "Lot 5678 — Butuan", state: "Completed", tone: "bg-zinc-50 border-zinc-200 text-zinc-700" },
                  { label: "Lot 9101 — Bayugan", state: "Quotation", tone: "bg-zinc-50 border-zinc-200 text-zinc-700" },
                ].map(r=> (
                  <div key={r.label} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 bg-white">
                    <span className="text-sm font-medium truncate text-zinc-900">{r.label}</span>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${r.tone}`}>{r.state}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-zinc-600 mt-3">A single phone number owns many parcels — each with its own timeline.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">What do you need today?</h2>
          <Link href="/request" className="text-sm font-semibold text-emerald-800 hover:underline">Start your survey</Link>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {surveyCards.map(s=> (
            <Link key={s.t} href={s.href} className="group relative bg-white rounded-2xl border p-5 hover:shadow-md hover:border-emerald-200 transition text-left">
              <div className="flex items-start justify-between gap-3">
                <div aria-hidden="true" className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center text-[11px] font-bold tracking-widest text-emerald-800">{s.abbr}</div>
                <span aria-hidden="true" className="text-zinc-400 group-hover:text-emerald-700 transition">→</span>
              </div>
              <div className="font-semibold mt-3 text-zinc-900 group-hover:text-emerald-800">{s.t}</div>
              <div className="text-sm text-zinc-600">{s.sub}</div>
              <div className="text-xs text-zinc-600 mt-2">Docs: {s.docs}</div>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          {[
            { label: "Track My Project", desc: "Live 8-step tracker and history", href: "/track", tone: "bg-emerald-800 text-white border-emerald-800" },
            { label: "My Documents", desc: "TCT, OCT, Tax Dec, Valid ID", href: "/documents", tone: "bg-white border text-zinc-900" },
            { label: "Book Appointment", desc: "Pick date, site, and contact", href: "/request", tone: "bg-white border text-zinc-900" },
          ].map(a=> (
            <Link key={a.label} href={a.href} className={`rounded-2xl p-5 border hover:shadow transition ${a.tone}`}> <div className="font-semibold">{a.label}</div><div className="text-sm opacity-75">{a.desc}</div></Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border p-6">
          <div className="text-xs tracking-[0.12em] font-semibold text-emerald-800">HOW IT WORKS</div>
          <h3 className="font-bold text-lg tracking-tight mt-1">Three steps to your lot plan</h3>
          <ol className="mt-4 grid md:grid-cols-3 gap-4">
            {[
              { n:"01", t:"Request + Documents", d:"Pick survey type, tell us your lot, upload TCT, Tax Dec, and ID. We check within 24 hours." },
              { n:"02", t:"Quotation + Confirm", d:"Estimator sends a priced quote with line items. Accept to confirm. Pay manually now, GCash later." },
              { n:"03", t:"Survey + Deliver", d:"We schedule, survey on site, process in AutoCAD, and deliver your lot plan." },
            ].map(s=> (
              <li key={s.n} className="rounded-2xl bg-zinc-50 border p-4">
                <div className="text-xs font-bold tracking-widest text-emerald-800">{s.n}</div>
                <div className="font-semibold mt-1 text-zinc-900">{s.t}</div>
                <div className="text-sm leading-relaxed text-zinc-600 mt-1">{s.d}</div>
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-emerald-800 text-white rounded-2xl p-6 flex flex-col border border-emerald-900">
          <div className="text-sm font-semibold">Contact Sanco</div>
          <div className="text-sm leading-relaxed text-white mt-1">Prefer Messenger or walk-in? We create the project for you — same tracker, same proof.</div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2.5">FB Messenger · Phone · Walk-in</div>
            <div className="bg-white text-emerald-900 rounded-xl px-3 py-2.5 font-semibold text-center border">We respond within 24 hours</div>
          </div>
          <Link href="/contact" className="mt-6 bg-white text-emerald-900 rounded-full py-3 text-center text-sm font-semibold hover:bg-zinc-50">Contact us</Link>
        </div>
      </section>
    </div>
  );
}

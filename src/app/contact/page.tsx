import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header banner — based on provided branding */}
      <div className="bg-white rounded-[20px] border border-zinc-200 card overflow-hidden">
        <div className="relative bg-[#0a4a3a] text-white p-6 sm:p-7 overflow-hidden">
          <div className="absolute inset-0 topo-grid opacity-[0.08]" aria-hidden />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" aria-hidden />
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.14em] font-bold bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                EST. 2018 — CABADBARAN CITY
              </div>
              <h1 className="text-[22px] sm:text-[24px] font-black tracking-[-0.02em] leading-tight mt-3">Sanco Land Surveying Services</h1>
              <p className="text-sm text-white/80 mt-1 italic">“Precision in Every Survey, Trust in Every Result.”</p>
              <p className="text-sm text-white/70 mt-2 max-w-[46ch]">Head office in Cabadbaran, serving Butuan and Bayugan. Prefer Messenger or walk-in? We create the project for you — same tracker, same proof.</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0 bg-white rounded-2xl px-4 py-3 border border-white/20 shadow-lg">
              <img src="/slss_logo.jpg" alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover border" />
              <div className="leading-tight">
                <div className="text-sm font-black tracking-tight text-zinc-900">SANCO</div>
                <div className="text-[11px] tracking-[0.12em] font-bold text-emerald-700">LAND SURVEYING</div>
                <div className="text-[10px] text-zinc-500">Your Property. Our Precision.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact grid — 4 cards mirroring banner footer */}
        <div className="p-5 sm:p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <a href="https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-zinc-200 p-4 bg-zinc-50/70 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition text-left">
              <div className="h-9 w-9 rounded-xl bg-[#0a4a3a] text-white grid place-items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s-6.5-4.35-6.5-10A6.5 6.5 0 0 1 12 3a6.5 6.5 0 0 1 6.5 8c0 5.65-6.5 10-6.5 10Z" fill="currentColor"/><circle cx="12" cy="11" r="2.5" fill="white"/></svg>
              </div>
              <div className="text-xs font-bold tracking-[0.12em] text-zinc-500 mt-3">VISIT US</div>
              <div className="text-sm font-semibold text-zinc-900 mt-1 leading-tight">Purok 6, Brgy. 9<br/>Cabadbaran City, Agusan del Norte</div>
              <div className="text-xs text-emerald-700 font-medium mt-2 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">Open in Maps <span aria-hidden>→</span></div>
            </a>

            <div className="rounded-2xl border border-zinc-200 p-4 bg-zinc-50/70 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition">
              <div className="h-9 w-9 rounded-xl bg-[#0a4a3a] text-white grid place-items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6.6 2.5 9.4 5l-2 2.2c1.4 3 3.6 5.3 6.6 6.7L16.2 12l2.6 2.3-1.3 3.1c-.4.9-1.5 1.3-2.4.9-3.2-1.5-5.8-3.9-7.6-7-.4-.8 0-1.9.9-2.3L9.5 8.2 7.5 6l2-2-.9-1.5c-.3-.5-1-.7-1.5-.4L2.8 4.6c-.5.3-.7 1-.4 1.5.1.2.2.4.4.6Z" fill="currentColor"/></svg>
              </div>
              <div className="text-xs font-bold tracking-[0.12em] text-zinc-500 mt-3">CALL OR TEXT</div>
              <div className="mt-1 space-y-1">
                <a href="tel:+639972868269" className="block text-sm font-semibold text-zinc-900 hover:text-emerald-700">0997 286 8269</a>
                <a href="tel:+639070104143" className="block text-sm font-semibold text-zinc-900 hover:text-emerald-700">0907 010 4143</a>
              </div>
              <div className="text-xs text-zinc-600 mt-2">Mon–Sat 8AM–5PM · Smart / TNT</div>
            </div>

            <a href="mailto:sancolandsurveyingservices@gmail.com" className="group rounded-2xl border border-zinc-200 p-4 bg-zinc-50/70 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition text-left">
              <div className="h-9 w-9 rounded-xl bg-[#0a4a3a] text-white grid place-items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M3.5 6 12 13l8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="text-xs font-bold tracking-[0.12em] text-zinc-500 mt-3">EMAIL</div>
              <div className="text-sm font-semibold text-zinc-900 mt-1 break-all leading-tight">sancolandsurveyingservices@gmail.com</div>
              <div className="text-xs text-emerald-700 font-medium mt-2 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">Send email <span aria-hidden>→</span></div>
            </a>

            <a href="https://www.facebook.com/sancolandsurveying" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-zinc-200 p-4 bg-zinc-50/70 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition text-left">
              <div className="h-9 w-9 rounded-xl bg-[#1877F2] text-white grid place-items-center font-black text-lg leading-none">f</div>
              <div className="text-xs font-bold tracking-[0.12em] text-zinc-500 mt-3">FACEBOOK</div>
              <div className="text-sm font-semibold text-zinc-900 mt-1 leading-tight">Sanco Land Surveying Services</div>
              <div className="text-xs text-emerald-700 font-medium mt-2 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">Message on Facebook <span aria-hidden>→</span></div>
            </a>
          </div>

          {/* Secondary details */}
          <div className="mt-6 grid lg:grid-cols-[1.35fr_0.85fr] gap-6">
            <div className="space-y-3">
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                <div className="text-sm font-semibold text-zinc-900">How we handle inquiries</div>
                <ul className="mt-2 text-sm space-y-2 text-zinc-700">
                  <li className="flex gap-2"><span className="text-emerald-700">💬</span><span><b>FB Messenger</b> — primary today. Staff copies portal notifications there manually for fast replies.</span></li>
                  <li className="flex gap-2"><span className="text-emerald-700">✉️</span><span><b>Email</b> — automated per status: quotation, appointment, document required.</span></li>
                  <li className="flex gap-2"><span className="text-emerald-700">📱</span><span><b>SMS</b> — time-critical: Appointment Confirmed, Document Required. Manual copy now, Semaphore API next.</span></li>
                </ul>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="text-sm font-semibold text-emerald-800">What to include when you message</div>
                <div className="text-sm text-emerald-700 mt-1 leading-relaxed">Lot location (Brgy./City), survey type (Relocation, Subdivision, etc.), and a photo of your TCT if available. We’ll create the project for you if you prefer walk-in or phone call.</div>
                <div className="mt-3 text-xs text-emerald-700/80">Response within 24 hours — even on walk-in / Messenger requests.</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-zinc-200 p-4 bg-white">
                <div className="text-sm font-semibold text-zinc-900">Quick actions</div>
                <div className="mt-3 grid gap-2">
                  <Link href="/request" className="bg-[#0a4a3a] text-white py-3 rounded-full text-center text-sm font-semibold hover:bg-emerald-900 transition">Start your survey →</Link>
                  <Link href="/track" className="border bg-white py-3 rounded-full text-center text-sm font-medium hover:bg-zinc-50 transition">Track my project</Link>
                  <Link href="/login" className="border bg-white py-3 rounded-full text-center text-sm font-medium hover:bg-zinc-50 transition">Verify phone</Link>
                </div>
                <div className="mt-4 rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                  <div className="text-xs font-semibold text-zinc-700">Office hours</div>
                  <div className="text-sm text-zinc-600 mt-1">Mon–Sat 8:00 AM – 5:00 PM</div>
                  <div className="text-xs text-zinc-500 mt-1">Field surveys by appointment — site work in Butuan & Bayugan as well.</div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                <div className="px-4 py-2 bg-white border-b flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.12em] text-zinc-500">FIND US</span>
                  <a href="https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-700 hover:underline">Open Google Maps →</a>
                </div>
                <div className="aspect-[16/9] bg-gradient-to-br from-emerald-50 to-stone-100 grid place-items-center p-4 text-center">
                  <div>
                    <div className="inline-flex h-10 w-10 rounded-full bg-[#0a4a3a] text-white place-items-center justify-center mx-auto">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s-6.5-4.35-6.5-10A6.5 6.5 0 0 1 12 3a6.5 6.5 0 0 1 6.5 8c0 5.65-6.5 10-6.5 10Z" fill="white"/></svg>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-2">Purok 6, Brgy. 9, Cabadbaran City</div>
                    <div className="text-xs text-zinc-600">Agusan del Norte · Head Office</div>
                    <a href="https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" target="_blank" rel="noopener noreferrer" className="inline-flex mt-3 bg-white border border-zinc-200 px-4 py-2 rounded-full text-xs font-semibold hover:bg-zinc-50">View on Google Maps</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500 border-t pt-4">
            <span className="font-semibold tracking-wide">SANCO LAND SURVEYING SERVICES · EST. 2018</span>
            <span className="h-3 w-px bg-zinc-300 hidden sm:block" aria-hidden />
            <span className="italic">Precision in Every Survey, Trust in Every Result.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

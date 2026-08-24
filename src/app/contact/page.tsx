import Link from "next/link";

const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>
);

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header banner */}
      <div className="bg-[#fcfaf1] border border-[#dcd3b8] card overflow-hidden">
        <div className="relative bg-[#16301a] text-white p-6 sm:p-7 overflow-hidden">
          <div className="absolute inset-0 draft-grid opacity-[0.05]" aria-hidden />
          <span aria-hidden className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[#dd5a24]" />
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 border border-white/20 px-3 py-1.5">
                <span className="h-1.5 w-1.5 bg-[#dd5a24]" />
                <span className="rule-label !text-[9px] text-white/90">Est. 2018 — Cabadbaran City</span>
              </div>
              <h1 className="font-display text-[26px] sm:text-[30px] font-extrabold tracking-[-0.01em] leading-tight mt-4">Sanco Land Surveying Services</h1>
              <p className="text-sm text-white/80 mt-1 italic">“Precision in Every Survey, Trust in Every Result.”</p>
              <p className="text-sm text-white/70 mt-2 max-w-[46ch]">Head office in Cabadbaran, serving Butuan and Bayugan. Prefer Messenger or walk-in? We create the project for you — same tracker, same proof.</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0 bg-white px-4 py-3 border border-white/20 shadow-[6px_6px_0_rgba(0,0,0,0.25)]">
              <img src="/slss_logo.jpg" alt="" width={44} height={44} className="h-11 w-11 object-cover border border-[#dcd3b8]" />
              <div className="leading-tight">
                <div className="font-display text-sm font-extrabold tracking-tight text-[#17170f]">SANCO</div>
                <div className="rule-label !text-[8px] text-[#1d3820]">Land Surveying</div>
                <div className="font-mono text-[10px] text-[#837858] mt-0.5">Your Property. Our Precision.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact grid — 4 cards */}
        <div className="p-5 sm:p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <a href="https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" target="_blank" rel="noopener noreferrer" className="group border border-[#dcd3b8] p-4 bg-[#f8f5ec] hover:bg-white hover:border-[#1d3820] hover:shadow-[4px_4px_0_rgba(29,56,32,0.12)] transition text-left">
              <span className="h-9 w-9 border border-[#1d3820] bg-[#1d3820] text-white grid place-items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s-6.5-4.35-6.5-10A6.5 6.5 0 0 1 12 3a6.5 6.5 0 0 1 6.5 8c0 5.65-6.5 10-6.5 10Z" fill="currentColor"/><circle cx="12" cy="11" r="2.4" fill="#16301a"/></svg>
              </span>
              <div className="rule-label !text-[9px] text-[#837858] mt-3">Visit Us</div>
              <div className="text-sm font-semibold text-[#17170f] mt-1 leading-tight">Purok 6, Brgy. 9<br/>Cabadbaran City, Agusan del Norte</div>
              <div className="text-xs font-bold text-[#1d3820] mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-[0.05em]">Open in Maps <ArrowRight className="h-3 w-3" /></div>
            </a>

            <div className="border border-[#dcd3b8] p-4 bg-[#f8f5ec] hover:bg-white hover:border-[#1d3820] hover:shadow-[4px_4px_0_rgba(29,56,32,0.12)] transition">
              <span className="h-9 w-9 border border-[#1d3820] bg-[#1d3820] text-white grid place-items-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6.6 2.5 9.4 5l-2 2.2c1.4 3 3.6 5.3 6.6 6.7L16.2 12l2.6 2.3-1.3 3.1c-.4.9-1.5 1.3-2.4.9-3.2-1.5-5.8-3.9-7.6-7-.4-.8 0-1.9.9-2.3L9.5 8.2 7.5 6l2-2-.9-1.5Z" fill="currentColor"/></svg>
              </span>
              <div className="rule-label !text-[9px] text-[#837858] mt-3">Call or Text</div>
              <div className="mt-1 space-y-1">
                <a href="tel:+639972868269" className="block text-sm font-semibold text-[#17170f] hover:text-[#1d3820]">0997 286 8269</a>
                <a href="tel:+639070104143" className="block text-sm font-semibold text-[#17170f] hover:text-[#1d3820]">0907 010 4143</a>
              </div>
              <div className="font-mono text-[11px] text-[#837858] mt-2">Mon–Sat 8AM–5PM · Smart / TNT</div>
            </div>

            <a href="mailto:sancolandsurveyingservices@gmail.com" className="group border border-[#dcd3b8] p-4 bg-[#f8f5ec] hover:bg-white hover:border-[#1d3820] hover:shadow-[4px_4px_0_rgba(29,56,32,0.12)] transition text-left">
              <span className="h-9 w-9 border border-[#1d3820] bg-[#1d3820] text-white grid place-items-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 6 12 13l8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <div className="rule-label !text-[9px] text-[#837858] mt-3">Email</div>
              <div className="text-sm font-semibold text-[#17170f] mt-1 break-all leading-tight">sancolandsurveyingservices@gmail.com</div>
              <div className="text-xs font-bold text-[#1d3820] mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-[0.05em]">Send email <ArrowRight className="h-3 w-3" /></div>
            </a>

            <a href="https://www.facebook.com/sancolandsurveying" target="_blank" rel="noopener noreferrer" className="group border border-[#dcd3b8] p-4 bg-[#f8f5ec] hover:bg-white hover:border-[#1d3820] hover:shadow-[4px_4px_0_rgba(29,56,32,0.12)] transition text-left">
              <span className="h-9 w-9 bg-[#1877F2] text-white grid place-items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3h2.5v7h2.5Z"/></svg>
              </span>
              <div className="rule-label !text-[9px] text-[#837858] mt-3">Facebook</div>
              <div className="text-sm font-semibold text-[#17170f] mt-1 leading-tight">Sanco Land Surveying Services</div>
              <div className="text-xs font-bold text-[#1d3820] mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-[0.05em]">Message us <ArrowRight className="h-3 w-3" /></div>
            </a>
          </div>

          {/* Secondary details */}
          <div className="mt-6 grid lg:grid-cols-[1.35fr_0.85fr] gap-6">
            <div className="space-y-3">
              <div className="border border-[#dcd3b8] bg-[#f0ebdd] p-4">
                <div className="rule-label !text-[9px] text-[#1d3820]">How we handle inquiries</div>
                <ul className="mt-2 text-sm space-y-2 text-[#4a4230]">
                  <li className="flex gap-2"><span className="font-mono text-[#1d3820]">01</span><span><b>FB Messenger</b> — primary today. Staff copies portal notifications there manually for fast replies.</span></li>
                  <li className="flex gap-2"><span className="font-mono text-[#1d3820]">02</span><span><b>Email</b> — automated per status: quotation, appointment, document required.</span></li>
                  <li className="flex gap-2"><span className="font-mono text-[#1d3820]">03</span><span><b>SMS</b> — time-critical: Appointment Confirmed, Document Required. Manual copy now, Semaphore API next.</span></li>
                </ul>
              </div>
              <div className="border border-[#b9caae] bg-[#eef3e9] p-4">
                <div className="text-sm font-semibold text-[#1d3820]">What to include when you message</div>
                <div className="text-sm text-[#355530] mt-1 leading-relaxed">Lot location (Brgy./City), survey type (Relocation, Subdivision, etc.), and a photo of your TCT if available. We’ll create the project for you if you prefer walk-in or phone call.</div>
                <div className="mt-3 font-mono text-[11px] text-[#1d3820]">Response within 24 hours — even on walk-in / Messenger requests.</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-[#dcd3b8] p-4 bg-[#fcfaf1]">
                <div className="rule-label !text-[9px] text-[#1d3820]">Quick actions</div>
                <div className="mt-3 grid gap-2">
                  <Link href="/request" className="inline-flex items-center justify-center gap-2 bg-[#1d3820] text-white py-3 text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#16301a] transition-colors">Start your survey<ArrowRight className="h-3.5 w-3.5" /></Link>
                  <Link href="/track" className="border border-[#dcd3b8] bg-white py-3 text-center text-xs font-semibold uppercase tracking-[0.06em] hover:border-[#1d3820] transition-colors">Track my project</Link>
                  <Link href="/login" className="border border-[#dcd3b8] bg-white py-3 text-center text-xs font-semibold uppercase tracking-[0.06em] hover:border-[#1d3820] transition-colors">Verify phone</Link>
                </div>
                <div className="mt-4 border border-[#dcd3b8] bg-[#f0ebdd] p-3">
                  <div className="text-xs font-semibold text-[#4a4230]">Office hours</div>
                  <div className="text-sm text-[#645b41] mt-1">Mon–Sat 8:00 AM – 5:00 PM</div>
                  <div className="font-mono text-[11px] text-[#837858] mt-1">Field surveys by appointment — site work in Butuan &amp; Bayugan as well.</div>
                </div>
              </div>
              <div className="border border-[#dcd3b8] bg-[#f0ebdd] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#fcfaf1] border-b border-[#dcd3b8] flex items-center justify-between">
                  <span className="rule-label !text-[9px] text-[#837858]">Find Us</span>
                  <a href="https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#1d3820] hover:underline uppercase tracking-[0.05em]">Open Google Maps →</a>
                </div>
                <div className="aspect-[16/9] bg-[#eef3e9] draft-grid grid place-items-center p-4 text-center">
                  <div>
                    <div className="inline-flex h-10 w-10 bg-[#16301a] text-white place-items-center justify-center mx-auto relative">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s-6.5-4.35-6.5-10A6.5 6.5 0 0 1 12 3a6.5 6.5 0 0 1 6.5 8c0 5.65-6.5 10-6.5 10Z" fill="currentColor"/><circle cx="12" cy="11" r="2.4" fill="#16301a"/></svg>
                      <span aria-hidden className="monument absolute inset-[-4px]" />
                    </div>
                    <div className="text-sm font-semibold text-[#17170f] mt-2">Purok 6, Brgy. 9, Cabadbaran City</div>
                    <div className="font-mono text-[11px] text-[#645b41]">Agusan del Norte · Head Office</div>
                    <a href="https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" target="_blank" rel="noopener noreferrer" className="inline-flex mt-3 bg-white border border-[#dcd3b8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] hover:border-[#1d3820]">View on Google Maps</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#dcd3b8] pt-4 font-mono text-[11px] text-[#837858]">
            <span className="font-semibold tracking-wide text-[#4a4230]">SANCO LAND SURVEYING SERVICES · EST. 2018</span>
            <span className="h-3 w-px bg-[#dcd3b8] hidden sm:block" aria-hidden />
            <span className="italic">Precision in Every Survey, Trust in Every Result.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

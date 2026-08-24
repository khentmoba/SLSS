"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const surveyCards = [
  { t: "Relocation Survey", sub: "Re-establish boundaries on ground", href: "/request?type=RELOCATION_SURVEY", abbr: "RS", docs: "TCT · Lot Plan · ID" },
  { t: "Subdivision", sub: "Split one lot into many", href: "/request?type=SUBDIVISION_SURVEY", abbr: "SD", docs: "TCT · Tax Dec · Lot Plan · ID" },
  { t: "Consolidation", sub: "Merge lots into one title", href: "/request?type=CONSOLIDATION_SURVEY", abbr: "CN", docs: "TCTs · ID" },
  { t: "Topographic", sub: "Elevation and features map", href: "/request?type=TOPOGRAPHIC_SURVEY", abbr: "TP", docs: "Lot Plan (opt) · ID" },
  { t: "Boundary Verification", sub: "Confirm existing monuments", href: "/request?type=BOUNDARY_VERIFICATION", abbr: "BV", docs: "Tax Dec · ID" },
  { t: "Land / Property", sub: "General survey and lot plan", href: "/request?type=LAND_PROPERTY_SURVEY", abbr: "LP", docs: "TCT · Tax Dec · ID" },
];

const workflow = [
  ["01", "Client Request", "Inquiry received", "You submit details online or via Messenger. We create a property record instantly."],
  ["02", "Document Check", "We verify docs", "Licensed GE reviews TCT, Tax Dec, and ID within 24 hours."],
  ["03", "Quotation", "We price it", "Itemized fee: field work, processing, docs. Valid for 7 days."],
  ["04", "Payment", "You confirm", "Manual payment now, GCash soon. Project moves to scheduling."],
  ["05", "Site Survey", "Field work", "2-person team on site with calibrated total station & GNSS."],
  ["06", "Processing", "AutoCAD", "We draft, compute, and cross-check against title data."],
  ["07", "Documentation", "Deliverables", "Lot plan, technical description, and supporting sheets prepared."],
  ["08", "Completed", "Download", "Bank-ready PDFs released to your portal. SMS + email notified."],
];

// Property states driven by active step 0..7
const propStates: { label: string; states: string[] }[] = [
  { label: "Lot 1234 — Cabadbaran", states: ["Inquiry received", "We verify docs", "We price it", "You confirm", "Field work", "Processing", "Deliverables", "Download ✓"] },
  { label: "Lot 5678 — Butuan", states: ["—", "—", "—", "You confirm", "Today 9AM", "AutoCAD", "Deliverables", "Download ✓"] },
  { label: "Lot 9101 — Bayugan", states: ["—", "—", "Quotation sent", "Payment pending", "—", "—", "—", "Completed ✓"] },
];

const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>
);
const ArrowDown = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><path d="M12 4v15m0 0-6-6m6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>
);
const Crosshair = ({ className = "" }: { className?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>
);
const Check = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className={className}><path d="m4 12 5 5L20 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square"/></svg>
);

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scrub, setScrub] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const scrubWrapRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrollY(y);
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(h > 0 ? Math.min(y / h, 1) : 0);

        // scrub: map scrubWrap section scroll to 0..1
        const el = scrubWrapRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const vh = window.innerHeight;
          const total = el.offsetHeight - vh + 84; // 84 = sticky top
          let p = 0;
          if (total > 0) p = Math.min(1, Math.max(0, -rect.top / total));
          setScrub(p);
        }

        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const heroParallax = scrollY * 0.18;
  const heroFade = Math.max(0, 1 - scrollY / 700);
  const activeStep = reducedMotion ? 7 : Math.min(7, Math.floor(scrub * 8 + 0.0001));

  return (
    <div className="relative bg-[#f4efe1]">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-[60] pointer-events-none">
        <div id="progress-bar" className="h-full bg-[#dd5a24]" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* NOTE: no overflow-hidden on this section — it breaks position:sticky for the pinned workflow column */}
      <section ref={heroRef} className="relative border-b border-[#dcd3b8] bg-[#f4efe1] overflow-visible">
        {/* drafting grid + monument marks */}
        <div className="absolute inset-0 draft-grid opacity-70" aria-hidden />
        <div className="absolute top-16 right-8 hidden lg:block" aria-hidden><Crosshair className="text-[#1d3820] opacity-25 h-16 w-16" /></div>
        <div className="absolute bottom-24 left-[38%] hidden lg:block" aria-hidden><Crosshair className="text-[#1d3820] opacity-15 h-28 w-28" /></div>

        <div className="relative w-full overflow-hidden border-y border-[#1d3820]/20 bg-white">
          <div className="rule-label !text-[10px] bg-[#16301a] text-[#dbe5d4] px-4 py-2 flex items-center justify-between max-w-6xl mx-auto">
            <span>SANCO LAND SURVEYING SERVICES</span>
            <span className="hidden sm:block">FIELD RECORD · EST. 2018</span>
            <span className="hidden md:block">9°12′N · 125°32′E</span>
          </div>
          <picture>
            <source srcSet="/sanco_landing_logo.webp" type="image/webp" />
            <img src="/sanco_landing_logo.png" alt="Sanco Land Surveying Services" width={2400} height={975} className="w-full h-auto block" draggable={false} fetchPriority="high" />
          </picture>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1.06fr_0.94fr] gap-8 lg:gap-8 pt-10 pb-10 lg:pt-14 lg:pb-12 items-start">
            <div className="relative lg:sticky lg:top-[84px]">
              <div className="reveal" style={{ opacity: heroFade, transform: `translateY(${scrollY * 0.06}px)` } as any}>
                <div className="inline-flex items-center gap-2.5 border border-[#1d3820]/25 bg-[#fcfaf1] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 bg-[#dd5a24]" />
                  <span className="rule-label !text-[10px] text-[#1d3820]">Sanco Land Surveying — Est. 2018</span>
                  <span className="hidden sm:inline text-[#837858] font-mono text-[10px]">· Agusan del Norte / Sur</span>
                </div>
              </div>
              <h1 className="reveal reveal-delay-1 mt-5 font-display text-[40px] sm:text-[52px] lg:text-[60px] font-extrabold tracking-[-0.03em] leading-[0.92] text-[#17170f] text-balance">
                Your property.<br />
                <span className="italic font-light text-[#1d3820]">Our precision.</span>
              </h1>
              <p className="reveal reveal-delay-2 mt-4 text-[15px] sm:text-[16px] leading-relaxed text-[#4a4230] max-w-[52ch]">
                Licensed geodetic engineers for relocation, subdivision, consolidation, and topographic surveys. Request a quotation without visiting the office — track every step to your lot plan.
              </p>
              <p className="reveal reveal-delay-2 mt-3 text-sm font-medium text-[#1d3820] italic">“Precision in Every Survey, Trust in Every Result.” — est. 2018, Cabadbaran City</p>
              <div className="reveal reveal-delay-2 mt-7 flex flex-wrap gap-3">
                <Link href="/request" className="inline-flex items-center justify-center gap-2 bg-[#dd5a24] text-[#17170f] px-7 py-3 text-sm font-bold uppercase tracking-[0.06em] hover:bg-[#d04f18] transition-colors" aria-label="Start your survey">
                  Start your survey<ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/track" className="inline-flex items-center justify-center bg-[#fcfaf1] border border-[#1d3820]/30 px-7 py-3 text-sm font-bold uppercase tracking-[0.06em] hover:bg-white hover:border-[#1d3820] transition-colors text-[#1f1c12]">
                  Track my project
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-[#645b41] hover:text-[#17170f] transition-colors uppercase tracking-[0.06em]">
                  Talk to SLSS
                </Link>
              </div>

              <div className="reveal reveal-delay-2 hidden lg:flex mt-7 items-center gap-2 text-[10px] font-mono tracking-[0.14em] text-[#837858]">
                <ArrowDown className="h-4 w-4" />
                <span>SCROLL TO PLAY THE WORKFLOW</span>
              </div>
            </div>

            {/* RIGHT: Scroll-driven workflow — pins while you scroll */}
            <div
              ref={scrubWrapRef}
              className="relative lg:pl-2 lg:h-[260vh] isolate"
              style={reducedMotion ? { height: "auto" } : undefined}
            >
              <div className={reducedMotion ? "relative" : "relative lg:sticky lg:top-[84px]"}>
                <div className="relative border border-[#16301a] bg-[#16301a] p-5 sm:p-6 shadow-[8px_8px_0_rgba(23,23,15,0.18)] overflow-hidden">
                  {/* corner ticks */}
                  <span aria-hidden className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-[#dd5a24]" />
                  <span aria-hidden className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-[#dd5a24]" />

                  {/* sheet header */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="rule-label !text-[10px] text-[#dbe5d4]">Project Workflow · 8 Steps</div>
                      <div className="font-mono text-[11px] text-[#b9caae] mt-1">No more “Unsa na status sa akong survey?” — every move is logged.</div>
                    </div>
                    <span
                      className="shrink-0 h-9 w-9 border border-[#dd5a24] text-[#dd5a24] grid place-items-center"
                      style={!reducedMotion ? { transform: `rotate(${scrub * 360}deg)`, transition: "transform 0.1s linear" } : undefined}
                      aria-hidden
                    >
                      <Crosshair className="h-5 w-5" />
                    </span>
                  </div>

                  {/* 8-step grid — each step lights as scrub advances */}
                  <ol className="mt-5 grid grid-cols-2 gap-2">
                    {[
                      ["1", "Client Request", "Inquiry received"],
                      ["2", "Document Check", "We verify docs"],
                      ["3", "Quotation", "We price it"],
                      ["4", "Payment", "You confirm"],
                      ["5", "Site Survey", "Field work"],
                      ["6", "Processing", "AutoCAD"],
                      ["7", "Documentation", "Deliverables"],
                      ["8", "Completed", "Download"],
                    ].map(([n, t, d], i) => {
                      const isActive = i === activeStep;
                      const isPast = i < activeStep;
                      return (
                        <li
                          key={n}
                          className={`flex gap-2.5 border p-3 transition-all duration-500 ${
                            isActive
                              ? "bg-white border-[#dd5a24] text-[#17170f]"
                              : isPast
                                ? "bg-[#1d3820] border-[#294626] text-[#dbe5d4]"
                                : "bg-[#0c1a0e] border-[#294626] text-[#92aa84]"
                          }`}
                          style={!reducedMotion ? { transitionDelay: `${Math.abs(i - activeStep) * 10}ms` } : undefined}
                        >
                          <span
                            className={`h-7 w-7 grid place-items-center text-xs font-mono font-bold shrink-0 border ${
                              isActive
                                ? "bg-[#dd5a24] text-[#17170f] border-[#dd5a24]"
                                : isPast
                                  ? "bg-[#294626] text-[#dbe5d4] border-[#355530]"
                                  : "bg-transparent text-[#92aa84] border-[#294626]"
                            }`}
                          >
                            {isPast && !isActive ? <Check className="h-3.5 w-3.5" /> : n}
                          </span>
                          <span className="min-w-0">
                            <span className={`block font-semibold text-xs leading-none font-sans ${isActive ? "text-[#17170f]" : "text-[#eef3e9]"}`}>{t}</span>
                            <span className={`block text-[11px] leading-tight mt-0.5 font-mono ${isActive ? "text-[#4a4230]" : "text-[#b9caae]"}`}>{d}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#b9caae]">
                    <span className={`h-1.5 w-1.5 ${activeStep === 7 ? "bg-[#dd5a24]" : "bg-[#dd5a24]"}`} />
                    <span>
                      {activeStep === 7 ? "All done — download your bank-ready PDFs" : `Live tracker · SMS + email on every transition — Step ${activeStep + 1} of 8`}
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 bg-[#0c1a0e] overflow-hidden lg:hidden">
                    <div className="h-full bg-[#dd5a24] origin-left transition-transform duration-100" style={{ transform: `scaleX(${reducedMotion ? 1 : scrub})` }} />
                  </div>
                </div>

                {/* My Properties — states driven by scrub */}
                <div
                  className="relative mt-4 border border-[#dcd3b8] bg-[#fcfaf1] p-4 shadow-[4px_4px_0_rgba(31,28,18,0.06)]"
                  style={!reducedMotion ? { transform: `translateY(${scrub * 8}px)` } as any : undefined}
                >
                  <div className="flex items-center justify-between">
                    <div className="rule-label !text-[10px] text-[#645b41]">My Properties — Live Preview</div>
                    <span className="rule-label !text-[10px] text-[#1d3820] bg-[#eef3e9] border border-[#b9caae] px-2 py-1 font-bold">3 active</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {propStates.map((r, idx) => {
                      const state = r.states[activeStep] ?? r.states[0];
                      const isDone = state.includes("✓") || state.includes("Download");
                      const isActiveLot = activeStep >= 3 && idx === 0;
                      const tone =
                        isDone
                          ? "bg-[#eef3e9] border-[#b9caae] text-[#1d3820]"
                          : state === "—"
                            ? "bg-[#f0ebdd] border-[#e2dac4] text-[#a79c7d]"
                            : activeStep >= 4
                              ? "bg-[#fbf3df] border-[#ebd094] text-[#714814]"
                              : "bg-[#e8f0f6] border-[#b9cede] text-[#24425c]";
                      return (
                        <div
                          key={r.label}
                          className={`flex items-center justify-between gap-3 border bg-white px-3 py-2.5 transition-all duration-500 ${isActiveLot ? "border-[#1d3820]" : "border-[#e2dac4]"} ${state === "—" ? "opacity-60" : "opacity-100"}`}
                          style={!reducedMotion ? { transform: `translateX(${isActiveLot ? 2 : 0}px)` } : undefined}
                        >
                          <span className="text-sm font-medium truncate text-[#17170f]">{r.label}</span>
                          <span className={`shrink-0 border px-2.5 py-1 font-mono text-[11px] font-semibold ${tone}`}>{state}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 font-mono text-[11px] text-[#645b41]">One phone number owns many parcels — each with its own timeline and documents.</div>
                  <div className="mt-2 h-1 bg-[#f0ebdd] overflow-hidden">
                    <div className="h-full bg-[#1d3820] origin-left transition-transform duration-100" style={{ transform: `scaleX(${reducedMotion ? 1 : 0.12 + scrub * 0.88})` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-center gap-2 pb-6 pt-6 font-mono text-[10px] tracking-[0.16em] text-[#837858]">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-[#dcd3b8] bg-[#fcfaf1]">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="reveal flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="rule-label !text-[10px] text-[#837858]">Trusted for boundaries, titles &amp; bank-ready plans</div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px]">
              <span className="inline-flex items-center gap-2 text-[#4a4230]"><Check className="h-3.5 w-3.5 text-[#1d3820]" />DENR · LRA accepted</span>
              <span aria-hidden className="h-4 w-px bg-[#dcd3b8] hidden sm:block" />
              <span className="inline-flex items-center gap-2 text-[#4a4230]"><Check className="h-3.5 w-3.5 text-[#1d3820]" />Bank &amp; registry compliant</span>
              <span aria-hidden className="h-4 w-px bg-[#dcd3b8] hidden sm:block" />
              <span className="inline-flex items-center gap-2 text-[#4a4230]"><Check className="h-3.5 w-3.5 text-[#1d3820]" />Calibrated instruments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="reveal flex flex-wrap items-end justify-between gap-4 border-b border-[#dcd3b8] pb-4">
          <div>
            <div className="rule-label !text-[10px] text-[#1d3820]">01 · Services</div>
            <h2 className="font-display text-[32px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-none text-[#17170f] mt-2">What do you need today?</h2>
            <p className="text-sm text-[#4a4230] mt-2 max-w-[60ch]">Pick a survey type — we show the exact documents, timeline, and fee structure before you commit. No office visit required.</p>
          </div>
          <Link href="/request" className="text-sm font-bold text-[#1d3820] hover:text-[#17170f] inline-flex items-center gap-1.5 uppercase tracking-[0.06em] group">
            Start your survey <span className="group-hover:translate-x-0.5 transition-transform"><ArrowRight className="h-4 w-4" /></span>
          </Link>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveyCards.map((s, i) => (
            <Link key={s.t} href={s.href} className={`reveal group relative bg-[#fcfaf1] border border-[#dcd3b8] p-5 sm:p-6 hover:border-[#1d3820] hover:shadow-[6px_6px_0_rgba(29,56,32,0.12)] transition text-left overflow-hidden ${i % 3 === 1 ? "reveal-delay-1" : i % 3 === 2 ? "reveal-delay-2" : ""}`}>
              <span aria-hidden className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[#dd5a24] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] tracking-[0.16em] text-[#a79c7d]">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-9 w-9 shrink-0 border border-[#1d3820]/25 bg-white grid place-items-center font-mono text-[11px] font-bold tracking-widest text-[#1d3820] group-hover:bg-[#1d3820] group-hover:text-white transition-colors">{s.abbr}</span>
              </div>
              <div className="font-display font-bold text-[19px] text-[#17170f] mt-5 group-hover:text-[#1d3820] transition-colors">{s.t}</div>
              <div className="text-sm text-[#645b41] leading-snug mt-1">{s.sub}</div>
              <div className="mt-5 record-top pt-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[#645b41]"><span className="h-1 w-1 bg-[#1d3820]" />Docs: {s.docs}</span>
                <span className="h-8 w-8 border border-[#dcd3b8] bg-white grid place-items-center text-[#645b41] group-hover:bg-[#17170f] group-hover:text-white group-hover:border-[#17170f] transition-colors"><ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { label: "Track My Project", desc: "Live 8-step tracker and history", href: "/track", primary: true },
            { label: "My Documents", desc: "TCT, OCT, Tax Dec, Valid ID", href: "/documents", primary: false },
            { label: "Book Appointment", desc: "Pick date, site, and contact", href: "/request", primary: false },
          ].map((a) => (
            <Link key={a.label} href={a.href} className={`reveal reveal-delay-1 group border p-5 transition flex items-center justify-between gap-3 ${a.primary ? "bg-[#1f1c12] text-white border-[#1f1c12] hover:bg-[#17170f]" : "bg-[#fcfaf1] border-[#dcd3b8] text-[#17170f] hover:border-[#1d3820] hover:shadow-[4px_4px_0_rgba(29,56,32,0.12)]"}`}>
              <div><div className="font-semibold text-sm">{a.label}</div><div className={`text-sm ${a.primary ? "text-[#b9caae]" : "text-[#645b41]"}`}>{a.desc}</div></div>
              <span className={`h-8 w-8 grid place-items-center shrink-0 transition-colors ${a.primary ? "bg-[#dd5a24] text-[#17170f]" : "bg-[#1d3820] text-white group-hover:bg-[#dd5a24] group-hover:text-[#17170f]"}`}><ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works + 8-step ledger */}
      <section className="bg-[#fcfaf1] border-y border-[#dcd3b8]">
        <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
            <div className="lg:sticky lg:top-[84px]">
              <div className="reveal">
                <div className="rule-label !text-[10px] text-[#1d3820]">02 · How it works</div>
                <h3 className="font-display text-[34px] sm:text-[40px] font-extrabold tracking-[-0.02em] leading-[0.9] text-[#17170f] mt-2">Three steps<br /><span className="italic font-light text-[#1d3820]">to your lot plan.</span></h3>
                <p className="text-sm leading-relaxed text-[#4a4230] mt-3 max-w-[46ch]">We turned the old “follow-up lang” into a logged, auditable workflow. You see the same timeline our staff sees — with SMS and email on every move.</p>
                <ol className="mt-7 space-y-3">
                  {[
                    { n: "01", t: "Request + Documents", d: "Pick survey type, pin your lot, upload TCT / Tax Dec / ID. We check within 24 hours." },
                    { n: "02", t: "Quotation + Confirm", d: "Estimator sends a priced quote with line items. Accept to confirm. Pay manually now, GCash later." },
                    { n: "03", t: "Survey + Deliver", d: "We schedule, survey on site, process in AutoCAD, and deliver your bank-ready plan." },
                  ].map((s) => (
                    <li key={s.n} className="flex gap-3 border border-[#dcd3b8] bg-white p-4">
                      <span className="h-8 w-8 shrink-0 border border-[#1d3820] text-[#1d3820] grid place-items-center font-mono text-xs font-bold font-sans mt-0.5">{s.n}</span>
                      <span><span className="block font-semibold text-sm text-[#17170f]">{s.t}</span><span className="block text-sm leading-relaxed text-[#645b41] mt-0.5">{s.d}</span></span>
                    </li>
                  ))}
                </ol>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/request" className="inline-flex items-center gap-2 bg-[#dd5a24] text-[#17170f] px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] hover:bg-[#d04f18] transition-colors">Start your survey<ArrowRight className="h-4 w-4" /></Link>
                  <Link href="/track" className="inline-flex items-center bg-white border border-[#dcd3b8] px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] hover:border-[#1d3820] transition-colors">See tracker demo</Link>
                </div>
              </div>
            </div>
            <div className="reveal">
              <div className="grid grid-cols-[auto_1fr] gap-0">
                <div aria-hidden className="hidden sm:block w-8 relative">
                  <div className="absolute left-1/2 top-1 -bottom-1 w-px bg-[#e2dac4]" />
                  <div className="absolute left-1/2 top-1 w-px bg-[#1d3820] transition-all duration-700" style={{ height: `${Math.min(100, Math.max(0, (progress * 1.6 - 0.35) * 100))}%` }} />
                </div>
                <div className="space-y-3">
                  {workflow.map(([n, t, tag, d], idx) => (
                    <div key={n} className={`group relative border bg-white p-4 flex gap-4 hover:border-[#1d3820] transition ${idx === 4 ? "border-[#1d3820]/40" : "border-[#e2dac4]"}`} style={{ transitionDelay: `${idx * 28}ms` } as any}>
                      <span className={`hidden sm:grid absolute -left-8 top-4 h-8 w-8 border bg-white place-items-center font-mono text-xs font-bold shrink-0 ${parseInt(n) <= 5 ? "border-[#1d3820] text-[#1d3820]" : "border-[#c9bfa3] text-[#837858]"}`}>{n}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-[#17170f]">{t}</span>
                          <span className={`font-mono text-[11px] px-2 py-0.5 border font-medium ${idx === 4 ? "bg-[#eef3e9] border-[#b9caae] text-[#1d3820]" : "bg-[#f8f5ec] border-[#e2dac4] text-[#645b41]"}`}>{tag}</span>
                        </div>
                        <div className="text-sm text-[#645b41] leading-relaxed mt-1">{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reveal mt-4 border border-[#ebd094] bg-[#fbf3df] p-4 flex gap-3">
                <span className="h-8 w-8 shrink-0 bg-[#c08a2d] text-white grid place-items-center">
                  <Crosshair className="h-4 w-4" />
                </span>
                <div><div className="text-sm font-semibold text-[#5a3a11]">One request, full history</div><div className="text-sm text-[#714814]/80 leading-relaxed">Each property keeps its own 8-step timeline — even if one phone number owns ten lots.</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Precision */}
      <section className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
          <div className="reveal order-2 lg:order-1">
            <div className="rule-label !text-[10px] text-[#1d3820]">03 · In the field &amp; office</div>
            <h3 className="font-display text-[34px] font-extrabold tracking-[-0.02em] leading-[0.9] text-[#17170f] mt-2">Licensed. Calibrated.<br /><span className="italic font-light text-[#1d3820]">Bank-accepted.</span></h3>
            <p className="text-sm leading-relaxed text-[#4a4230] mt-3">From monuments on the ground to technical descriptions on paper — we keep the chain of precision closed.</p>
            <div className="mt-6 grid gap-3">
              {[
                { title: "Licensed Geodetic Engineers", desc: "PRC-registered, DENR-accredited. Every plan is signed and sealed." },
                { title: "Calibrated instruments", desc: "Total station + GNSS, regularly checked. Raw data archived per project." },
                { title: "Registry-ready deliverables", desc: "Lot plans, technical descriptions, and subdivision sheets that pass LRA, DENR, and bank review." },
              ].map((b) => (
                <div key={b.title} className="flex gap-3 border border-[#dcd3b8] bg-[#fcfaf1] p-4 hover:border-[#1d3820] hover:shadow-[4px_4px_0_rgba(29,56,32,0.1)] transition">
                  <span className="h-8 w-8 shrink-0 bg-[#1d3820] text-white grid place-items-center"><Check className="h-4 w-4" /></span>
                  <div><div className="font-semibold text-sm text-[#17170f]">{b.title}</div><div className="text-sm text-[#645b41] leading-snug">{b.desc}</div></div>
                </div>
              ))}
            </div>
            <div className="mt-6 inline-flex items-center gap-3 border border-[#dcd3b8] bg-white px-4 py-2 font-mono text-xs text-[#645b41]">
              <span className="h-2 w-2 bg-[#1d3820]" /> Response within 24 hours — even on walk-in / Messenger requests
            </div>
          </div>
          <div className="reveal reveal-delay-1 order-1 lg:order-2 relative">
            <div className="relative border border-[#dcd3b8] bg-white shadow-[8px_8px_0_rgba(31,28,18,0.08)]">
              <div className="aspect-[4/3.2] relative bg-[#f8f5ec] p-6 sm:p-8">
                <div className="absolute inset-0 draft-grid opacity-60" aria-hidden />
                <svg viewBox="0 0 400 320" className="relative w-full h-full" aria-hidden>
                  <polygon points="60,80 320,60 300,240 80,260" fill="none" stroke="#1d3820" strokeWidth="1.6" strokeDasharray="6 4" opacity="0.9" />
                  <polygon points="60,80 320,60 300,240 80,260" fill="rgba(29,56,32,0.06)" />
                  <g fill="#1d3820"><circle cx="60" cy="80" r="5" /><circle cx="320" cy="60" r="5" /><circle cx="300" cy="240" r="5" /><circle cx="80" cy="260" r="5" /></g>
                  <g stroke="#1d3820" strokeWidth="0.7" opacity="0.6">
                    <line x1="60" y1="38" x2="320" y2="30" /><line x1="60" y1="32" x2="60" y2="44" /><line x1="320" y1="24" x2="320" y2="36" />
                    <text x="175" y="28" fontSize="8" fill="#1d3820" textAnchor="middle" fontWeight="700">125.42 m</text>
                    <line x1="340" y1="60" x2="318" y2="240" /><text x="352" y="150" fontSize="8" fill="#1d3820" textAnchor="middle" transform="rotate(90 352 150)" fontWeight="600">98.10 m</text>
                  </g>
                  <text x="180" y="100" fontSize="7.5" fill="#4a4230" textAnchor="middle">N 12°14′ E</text>
                  <text x="210" y="220" fontSize="7.5" fill="#4a4230" textAnchor="middle">S 78°05′ W</text>
                  <g transform="translate(185 150)"><circle r="18" fill="white" stroke="#1d3820" strokeWidth="1.2" /><g stroke="#1d3820" strokeWidth="1.1"><line x1="0" y1="-12" x2="0" y2="12" /><line x1="-12" y1="0" x2="12" y2="0" /></g><circle r="2.5" fill="#1d3820" /></g>
                </svg>
                <div className="absolute top-4 left-4 bg-[#1d3820] text-white text-[11px] font-mono font-bold tracking-widest px-3 py-1.5">LOT PLAN — 1:500</div>
                <div className="absolute bottom-4 right-4 border border-[#dcd3b8] bg-white px-3 py-2 text-xs shadow-[2px_2px_0_rgba(31,28,18,0.06)]"><div className="font-semibold text-[#17170f] leading-none">Blk 7 · Lot 1234</div><div className="text-[#645b41] leading-none mt-1">Cabadbaran City</div></div>
              </div>
              <div className="flex items-center justify-between px-5 py-3 bg-[#f0ebdd] border-t border-[#dcd3b8] font-mono text-xs"><span className="text-[#645b41]">AutoCAD · 2025 · Signed &amp; sealed</span><span className="font-bold text-[#1d3820]">Sanco GE-2025-0142</span></div>
            </div>
            <div className="absolute -bottom-4 -left-3 sm:left-auto sm:-right-4 border border-[#dcd3b8] bg-[#fcfaf1] shadow-[6px_6px_0_rgba(31,28,18,0.08)] p-3 flex items-center gap-3 max-w-[280px]">
              <span className="h-10 w-10 shrink-0 bg-[#1d3820] text-white grid place-items-center"><Check className="h-5 w-5" /></span>
              <div className="min-w-0"><div className="text-sm font-semibold text-[#17170f] leading-none">Accepted by banks</div><div className="text-xs text-[#645b41] leading-tight mt-1">LandBank · BDO · BPI · Registry of Deeds</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-[#16301a] text-white relative overflow-hidden border-y border-[#0c1a0e]">
        <div className="absolute inset-0 draft-grid opacity-[0.05]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 py-12 lg:py-16">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="rule-label !text-[10px] text-[#dbe5d4]">04 · Coverage</div>
              <h3 className="font-display text-[32px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-none mt-2">Cabadbaran · Butuan · Bayugan</h3>
              <p className="text-sm text-white/70 mt-2 max-w-[60ch]">Agusan del Norte and Agusan del Sur. Prefer Messenger or walk-in? We create the project for you — same tracker, same proof.</p>
            </div>
            <Link href="/contact" className="hidden sm:inline-flex items-center gap-2 bg-white text-[#16301a] px-6 py-3 text-sm font-bold uppercase tracking-[0.06em] hover:bg-[#eef3e9] transition-colors">Contact Sanco<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              { city: "Cabadbaran", role: "Head office · Est. 2018", addr: "Purok 6, Brgy. 9, Cabadbaran City · Agusan del Norte", time: "Mon–Sat 8AM–5PM · Walk-in welcome", accent: "border-[#dd5a24]/50", map: "https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" },
              { city: "Butuan", role: "Service area", addr: "Butuan City · Agusan del Norte", time: "Field work · By appointment", accent: "border-white/15", map: "https://www.google.com/maps/search/Butuan+City+Agusan+del+Norte" },
              { city: "Bayugan", role: "Service area", addr: "Bayugan City · Agusan del Sur", time: "Field work · By appointment", accent: "border-white/15", map: "https://www.google.com/maps/search/Bayugan+City+Agusan+del+Sur" },
            ].map((c: any) => (
              <a key={c.city} href={c.map} target="_blank" rel="noopener noreferrer" className={`reveal group relative border bg-white/[0.05] p-5 hover:bg-white/[0.08] transition block ${c.accent}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><div className="font-display font-bold text-[#f4efe1] tracking-tight">{c.city}</div><div className="rule-label !text-[9px] text-[#b9caae] mt-1">{c.role}</div></div>
                  <span className="h-8 w-8 border border-white/30 grid place-items-center text-white/80 group-hover:border-[#dd5a24] group-hover:text-[#dd5a24] transition-colors"><Crosshair className="h-4 w-4" /></span>
                </div>
                <div className="text-sm text-white/70 leading-relaxed mt-3">{c.addr}</div>
                <div className="font-mono text-[11px] text-white/50 mt-1">{c.time}</div>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/90 group-hover:text-white uppercase tracking-[0.06em]">View on map <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
              </a>
            ))}
          </div>
          <div className="reveal mt-6 border border-white/15 bg-white/[0.06] p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm">
              <div className="flex flex-wrap gap-4 text-white/90">
                <a href="tel:+639972868269" className="inline-flex items-center gap-2 hover:text-white font-medium">
                  <span className="h-7 w-7 border border-white/30 grid place-items-center" aria-hidden>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6.6 2.5 9.4 5l-2 2.2c1.4 3 3.6 5.3 6.6 6.7L16.2 12l2.6 2.3-1.3 3.1c-.4.9-1.5 1.3-2.4.9-3.2-1.5-5.8-3.9-7.6-7-.4-.8 0-1.9.9-2.3L9.5 8.2 7.5 6l2-2-.9-1.5Z" fill="currentColor"/></svg>
                  </span>
                  0997 286 8269 · 0907 010 4143
                </a>
                <a href="mailto:sancolandsurveyingservices@gmail.com" className="inline-flex items-center gap-2 hover:text-white">
                  <span className="h-7 w-7 border border-white/30 grid place-items-center" aria-hidden>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 6 12 13l8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  sancolandsurveyingservices@gmail.com
                </a>
              </div>
              <a href="https://www.facebook.com/sancolandsurveying" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-xs font-medium uppercase tracking-[0.06em]">
                <span className="h-7 w-7 bg-[#1877F2] text-white grid place-items-center" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3h2.5v7h2.5Z"/></svg>
                </span>
                Sanco Land Surveying Services
              </a>
            </div>
            <div className="font-mono text-[11px] text-white/50 mt-2.5 border-t border-white/10 pt-2.5">Purok 6, Brgy. 9, Cabadbaran City, Agusan del Norte — <span className="italic">Precision in Every Survey, Trust in Every Result.</span> · Est. 2018</div>
          </div>
          <div className="reveal mt-6 flex flex-wrap gap-2 text-xs">
            <span className="border border-white/15 px-3 py-1.5 text-white/80 font-mono">FB Messenger · Phone · Walk-in</span>
            <span className="bg-[#dd5a24] text-[#17170f] px-3 py-1.5 font-bold uppercase tracking-[0.06em]">We respond within 24 hours</span>
            <Link href="/contact" className="sm:hidden ml-auto bg-white text-[#16301a] px-5 py-2 font-bold uppercase tracking-[0.06em] text-xs">Contact us<ArrowRight className="h-3.5 w-3.5 inline" /></Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-10 lg:py-14">
        <div className="reveal relative border border-[#16301a] bg-[#16301a] p-7 sm:p-10 lg:p-12 shadow-[10px_10px_0_rgba(23,23,15,0.16)] overflow-hidden">
          <div aria-hidden className="absolute inset-0 draft-grid opacity-[0.05]" />
          <span aria-hidden className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[#dd5a24]" />
          <span aria-hidden className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#dd5a24]" />
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 font-mono text-xs font-semibold text-[#dbe5d4]"><span className="h-1.5 w-1.5 bg-[#dd5a24]" /> Ready when you are</div>
              <h3 className="font-display text-[32px] sm:text-[40px] font-extrabold tracking-[-0.02em] leading-[0.9] text-white mt-4">Let’s get your<br /><span className="italic font-light text-[#dbe5d4]">boundaries exact.</span></h3>
              <p className="text-sm leading-relaxed text-white/80 mt-3 max-w-[52ch]">Upload once, get a priced quotation, and follow your survey step by step. Your property keeps its full history — forever.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/request" className="inline-flex items-center gap-2 bg-[#f4efe1] text-[#16301a] px-7 py-3 text-sm font-bold uppercase tracking-[0.06em] hover:bg-white transition-colors">Start your survey<ArrowRight className="h-4 w-4" /></Link>
                <Link href="/track" className="inline-flex items-center border border-white/25 text-white px-7 py-3 text-sm font-bold uppercase tracking-[0.06em] hover:bg-white/10 transition-colors">Track my project</Link>
              </div>
            </div>
            <div className="relative">
              <div className="border border-white/20 bg-[#fcfaf1] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.25)]">
                <div className="rule-label !text-[10px] text-[#645b41]">What happens next</div>
                <ol className="mt-3 space-y-2.5 text-sm">
                  {["We acknowledge your request (SMS + email)", "We verify documents within 24h", "You receive an itemized quotation", "You confirm — we schedule field work"].map((t, i) => (
                    <li key={t} className="flex gap-3"><span className="h-6 w-6 shrink-0 bg-[#1d3820] text-white grid place-items-center font-mono text-xs font-bold">{i + 1}</span><span className="text-[#4a4230] leading-snug pt-0.5">{t}</span></li>
                  ))}
                </ol>
                <div className="mt-4 border border-[#dcd3b8] bg-[#f0ebdd] px-3 py-2.5 font-mono text-[11px] text-[#645b41]">No account needed to request. Sign in only to track and download.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-[#837858]">
          <span>© {new Date().getFullYear()} Sanco Land Surveying Services · Licensed GE · Cabadbaran City</span>
          <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 bg-[#1d3820]" /> One client, many properties — each with its own timeline</span>
        </div>
      </section>
    </div>
  );
}

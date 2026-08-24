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
          // on mobile where not sticky, fall back to viewport proximity
          if (window.innerWidth < 1024) {
            // map element visibility to 0..1
            const visibleTop = Math.max(0, vh - rect.top);
            const denom = rect.height + vh;
            p = Math.min(1, Math.max(0, visibleTop / denom * 2.2));
          }
          setScrub(p);
        }

        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <div className="relative bg-[#fdfcfb] overflow-clip">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-[60] pointer-events-none">
        <div id="progress-bar" className="h-full bg-emerald-700" style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }} />
      </div>

      <section ref={heroRef} className="relative overflow-hidden border-b border-zinc-200 bg-[#fdfcfb]">
        <div className="absolute inset-0 topo-grid opacity-[0.65]" aria-hidden />
        <div className="absolute -right-40 -top-28 h-[760px] w-[760px] rounded-full border border-emerald-100/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent parallax-slow opacity-80" style={{ transform: `translateY(${heroParallax}px)` }} aria-hidden />
        <div className="absolute -left-56 top-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-stone-100 to-transparent border border-stone-200/60 parallax-slow hidden lg:block" style={{ transform: `translateY(${scrollY * -0.06}px)` }} aria-hidden />
        <svg className="absolute inset-0 h-full w-full opacity-[0.07] pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden>
          <path d="M -40 120 C 120 80, 260 150, 400 110 S 680 60, 840 130" fill="none" stroke="#0a4a3a" strokeWidth="1" />
          <path d="M -40 180 C 140 140, 300 210, 480 170 S 700 120, 840 190" fill="none" stroke="#0a4a3a" strokeWidth="0.8" />
          <path d="M -40 240 C 160 200, 320 270, 520 230 S 720 180, 840 250" fill="none" stroke="#0a4a3a" strokeWidth="0.7" />
          <path d="M -40 300 C 180 260, 340 330, 560 290 S 740 240, 840 310" fill="none" stroke="#0a4a3a" strokeWidth="0.6" />
        </svg>
        <div className="relative w-full overflow-hidden bg-white border-y border-zinc-200 reveal" style={{ opacity: heroFade } as any}>
          <picture>
            <source srcSet="/sanco_landing_logo.webp" type="image/webp" />
            <img src="/sanco_landing_logo.png" alt="Sanco Land Surveying Services" width={2400} height={975} className="w-full h-auto block" draggable={false} fetchPriority="high" />
          </picture>
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr] gap-8 lg:gap-6 pt-10 pb-10 lg:pt-14 lg:pb-12 items-start">
            <div className="relative lg:sticky lg:top-[84px]">
              <div className="reveal" style={{ opacity: heroFade, transform: `translateY(${scrollY * 0.06}px)` } as any}>
                <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.14em] font-bold text-emerald-900 bg-white border border-emerald-200/70 px-3.5 py-1.5 rounded-full shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  SANCO LAND SURVEYING — EST. 2018
                  <span className="hidden sm:inline text-zinc-400 font-medium">· Agusan del Norte / Sur</span>
                </div>
              </div>
              <div className="hidden" aria-hidden />
              <h1 className="reveal reveal-delay-1 mt-5 text-[34px] sm:text-[42px] lg:text-[48px] font-black tracking-[-0.04em] leading-[0.88] text-zinc-900">
                Your property.<br /><span className="text-emerald-800 bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">Our precision.</span>
              </h1>
              <p className="reveal reveal-delay-2 mt-3 text-[15px] sm:text-[16px] leading-relaxed text-zinc-600 max-w-[52ch]">
                Licensed geodetic engineers for relocation, subdivision, consolidation, and topographic surveys. Request a quotation without visiting the office — track every step to your lot plan.
              </p>
              <p className="reveal reveal-delay-2 mt-2 text-sm font-medium text-emerald-800 italic">“Precision in Every Survey, Trust in Every Result.” — est. 2018, Cabadbaran City</p>
              <div className="reveal reveal-delay-2 mt-6 flex flex-wrap gap-3">
                <Link href="/request" className="inline-flex items-center justify-center gap-2 bg-emerald-800 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-emerald-900 shadow-[0_8px_20px_rgba(10,74,58,0.18)] hover:shadow-[0_12px_28px_rgba(10,74,58,0.22)] hover:translate-y-[-1px] active:translate-y-[0px] transition">
                  Start your survey<span aria-hidden className="text-white/80">→</span>
                </Link>
                <Link href="/track" className="inline-flex items-center justify-center bg-white border border-zinc-200 px-7 py-3 rounded-full text-sm font-semibold hover:bg-zinc-50 hover:border-zinc-300 hover:translate-y-[-1px] active:translate-y-[0px] transition text-zinc-900">
                  Track my project
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center px-5 py-3 rounded-full text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 transition">
                  Talk to SLSS
                </Link>
              </div>

              {/* Desktop hint that the card on the right is scrubbed by scroll */}
              <div className="reveal reveal-delay-2 hidden lg:flex mt-6 items-center gap-2 text-[11px] tracking-[0.14em] font-bold text-zinc-500">
                <span className="h-6 w-px bg-zinc-300" />
                <span>SCROLL TO PLAY THE WORKFLOW</span>
                <span className="h-5 w-5 rounded-full border border-zinc-300 grid place-items-center animate-bounce">↓</span>
              </div>
            </div>

            {/* RIGHT: Scroll-driven workflow — pins while you scroll */}
            <div
              ref={scrubWrapRef}
              className="relative lg:pl-2 lg:h-[240vh]"
              style={reducedMotion ? { height: "auto" } : undefined}
            >
              <div className={reducedMotion ? "relative" : "relative lg:sticky lg:top-[84px]"}>
                <div className="relative rounded-[28px] bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 p-5 sm:p-6 shadow-[0_20px_60px_rgba(10,74,58,0.25)] border border-emerald-900/20 overflow-hidden">
                  <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
                  <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-300/10 blur-2xl" aria-hidden />

                  {/* Progress dots + mobile rail - driven by scrub */}
                  <div className="absolute top-5 right-5 hidden sm:flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === activeStep ? "w-6 bg-white shadow" : i < activeStep ? "w-1.5 bg-white/70" : "w-1.5 bg-white/25"}`}
                        aria-hidden
                      />
                    ))}
                  </div>

                  <div className="relative rounded-2xl bg-white shadow-xl border border-white/60 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] tracking-[0.14em] font-bold text-emerald-800 flex items-center gap-2">
                          8-STEP WORKFLOW
                          {!reducedMotion && (
                            <span className="inline-flex items-center gap-1 text-[10px] tracking-normal font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> LIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-600 mt-1 leading-snug">No more “Unsa na status sa akong survey?” — every move is logged.</div>
                      </div>
                      <span
                        className="shrink-0 h-9 w-9 rounded-xl bg-emerald-800 text-white grid place-items-center text-sm border border-emerald-700 shadow-sm"
                        style={!reducedMotion ? { transform: `rotate(${scrub * 360}deg)`, transition: "transform 0.1s linear" } : undefined}
                      >
                        ◈
                      </span>
                    </div>

                    {/* 8-step grid — each step lights as scrub advances */}
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
                      ].map(([n, t, d], i) => {
                        const isActive = i === activeStep;
                        const isPast = i < activeStep;
                        return (
                          <li
                            key={n}
                            className={`flex gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-500 ${
                              isActive
                                ? "bg-white border-emerald-300 shadow-[0_8px_20px_rgba(10,74,58,0.12)] scale-[1.02] -translate-y-0.5"
                                : isPast
                                  ? "bg-white border-zinc-200 opacity-80"
                                  : "bg-zinc-50 border-zinc-200 opacity-60"
                            }`}
                            style={!reducedMotion ? { transitionDelay: `${Math.abs(i - activeStep) * 10}ms` } : undefined}
                          >
                            <span
                              className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold shrink-0 border transition-all duration-500 ${
                                isActive
                                  ? "bg-emerald-800 text-white border-emerald-800 scale-110 shadow-sm"
                                  : isPast
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-white text-zinc-500 border-zinc-200"
                              }`}
                            >
                              {isPast && !isActive ? "✓" : n}
                            </span>
                            <span className="min-w-0">
                              <span className={`block font-semibold text-xs leading-none ${isActive ? "text-emerald-900" : "text-zinc-900"}`}>{t}</span>
                              <span className={`block text-[11px] leading-tight mt-0.5 ${isActive ? "text-emerald-700 font-medium" : "text-zinc-600"}`}>{d}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ol>

                    <div className="mt-3 flex items-center gap-2 text-[11px] font-medium">
                      <span className={`h-1.5 w-1.5 rounded-full ${activeStep === 7 ? "bg-emerald-600 animate-pulse" : "bg-emerald-600"}`} />
                      <span className={activeStep === 7 ? "text-emerald-700 font-bold" : "text-emerald-700"}>
                        {activeStep === 7 ? "All done — download your bank-ready PDFs ✓" : `Live tracker · SMS + email on every transition — Step ${activeStep + 1} of 8`}
                      </span>
                    </div>

                    {/* mobile progress bar */}
                    <div className="mt-3 h-1.5 rounded-full bg-zinc-100 overflow-hidden lg:hidden">
                      <div className="h-full bg-emerald-700 origin-left transition-transform duration-100" style={{ transform: `scaleX(${reducedMotion ? 1 : scrub})`, transformOrigin: "left" }} />
                    </div>
                  </div>

                  {/* My Properties — states driven by scrub */}
                  <div
                    className="relative mt-4 rounded-2xl bg-white/95 backdrop-blur border border-white/60 p-4 shadow-lg"
                    style={!reducedMotion ? { transform: `translateY(${scrub * 8}px)` } as any : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold tracking-[0.12em] text-zinc-500">MY PROPERTIES — LIVE PREVIEW</div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">3 active</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {propStates.map((r, idx) => {
                        const state = r.states[activeStep] ?? r.states[0];
                        const isDone = state.includes("✓") || state.includes("Download");
                        const isActiveLot = activeStep >= 3 && idx === 0;
                        // color by index + state
                        const tone =
                          isDone
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : state === "—"
                              ? "bg-zinc-50 border-zinc-200 text-zinc-400"
                              : activeStep >= 4
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-sky-50 border-sky-200 text-sky-800";
                        return (
                          <div
                            key={r.label}
                            className={`flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2.5 transition-all duration-500 ${isActiveLot ? "border-emerald-200 shadow-sm" : "border-zinc-200"} ${state === "—" ? "opacity-60" : "opacity-100"}`}
                            style={!reducedMotion ? { transform: `translateX(${isActiveLot ? 2 : 0}px)` } : undefined}
                          >
                            <span className="text-sm font-medium truncate text-zinc-900">{r.label}</span>
                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-300 ${tone}`}>{state}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-xs text-zinc-600">One phone number owns many parcels — each with its own timeline and documents.</div>
                    <div className="mt-2 h-1 rounded-full bg-zinc-100 overflow-hidden">
                      <div className="h-full bg-emerald-700 origin-left transition-transform duration-100" style={{ transform: `scaleX(${reducedMotion ? 1 : 0.12 + scrub * 0.88})`, transformOrigin: "left" }} />
                    </div>
                  </div>

                  {/* scroll hint inside green stage */}
                  {!reducedMotion && scrub < 0.92 && (
                    <div className="hidden lg:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-1.5 text-[11px] tracking-[0.12em] font-bold text-white/80 bg-white/10 backdrop-blur border border-white/15 px-3 py-1.5 rounded-full pointer-events-none">
                      SCROLL <span className="animate-bounce">↓</span> TO PLAY
                    </div>
                  )}
                </div>

                {/* Licensed GE badge — parallax with scrub */}
                <div
                  className="hidden lg:flex absolute -left-6 -bottom-4 items-center gap-3 rounded-2xl bg-white border border-zinc-200 shadow-xl px-4 py-3"
                  style={!reducedMotion ? { transform: `translateY(${scrub * -10}px) translateX(${scrub * 6}px)`, transition: "transform 0.1s linear" } : undefined}
                >
                  <img src="/slss_logo.jpg" alt="" width={36} height={36} className="h-9 w-9 rounded-xl object-cover border border-zinc-200" />
                  <div>
                    <div className="text-xs font-bold tracking-tight text-zinc-900 leading-none">Licensed GE</div>
                    <div className="text-xs text-zinc-600 leading-none mt-1">PRC · DENR accredited</div>
                  </div>
                  <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center gap-2 pb-4 text-[11px] tracking-[0.14em] font-semibold text-zinc-500 pt-6" style={{ opacity: heroFade } as any}>
            <span>SCROLL TO EXPLORE</span>
            <span className="h-6 w-px bg-zinc-300" />
            <span className="h-5 w-5 rounded-full border border-zinc-300 grid place-items-center animate-bounce">↓</span>
          </div>
        </div>
      </section>
      <section className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="reveal flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-xs tracking-[0.14em] font-bold text-zinc-500">TRUSTED FOR BOUNDARIES, TITLES & BANK-READY PLANS</div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="inline-flex items-center gap-2 text-zinc-700"><span className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 grid place-items-center text-[10px] font-bold text-emerald-800">✓</span>DENR · LRA accepted</span>
              <span className="h-4 w-px bg-zinc-200 hidden sm:block" />
              <span className="inline-flex items-center gap-2 text-zinc-700"><span className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 grid place-items-center text-[10px] font-bold text-emerald-800">✓</span>Bank & registry compliant</span>
              <span className="h-4 w-px bg-zinc-200 hidden sm:block" />
              <span className="inline-flex items-center gap-2 text-zinc-700"><span className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 grid place-items-center text-[10px] font-bold text-emerald-800">✓</span>Calibrated instruments</span>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.14em] font-bold text-emerald-800">SERVICES</div>
            <h2 className="text-[28px] sm:text-[32px] font-black tracking-[-0.03em] leading-none text-zinc-900 mt-1">What do you need today?</h2>
            <p className="text-sm text-zinc-600 mt-2 max-w-[60ch]">Pick a survey type — we show the exact documents, timeline, and fee structure before you commit. No office visit required.</p>
          </div>
          <Link href="/request" className="text-sm font-semibold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1.5 group">Start your survey <span className="group-hover:translate-x-0.5 transition">→</span></Link>
        </div>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveyCards.map((s, i) => (
            <Link key={s.t} href={s.href} className={`reveal group relative bg-white rounded-[20px] border border-zinc-200 p-5 sm:p-6 hover:shadow-[0_12px_32px_rgba(16,24,20,0.08)] hover:border-emerald-200 hover:-translate-y-0.5 transition text-left overflow-hidden ${i % 3 === 1 ? "reveal-delay-1" : i % 3 === 2 ? "reveal-delay-2" : ""}`}>
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-[40px] opacity-0 group-hover:opacity-100 transition" aria-hidden />
              <div className="relative flex items-start justify-between gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center text-[11px] font-bold tracking-widest text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white group-hover:border-emerald-800 transition">{s.abbr}</div>
                <span className="h-8 w-8 rounded-full border border-zinc-200 bg-white grid place-items-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition text-sm">→</span>
              </div>
              <div className="relative font-semibold mt-4 text-zinc-900 group-hover:text-emerald-900 text-[16px]">{s.t}</div>
              <div className="text-sm text-zinc-600 leading-snug mt-0.5">{s.sub}</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-800 transition"><span className="h-1.5 w-1.5 rounded-full bg-zinc-400 group-hover:bg-emerald-600" /> Docs: {s.docs}</div>
            </Link>
          ))}
        </div>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { label: "Track My Project", desc: "Live 8-step tracker and history", href: "/track", primary: true },
            { label: "My Documents", desc: "TCT, OCT, Tax Dec, Valid ID", href: "/documents", primary: false },
            { label: "Book Appointment", desc: "Pick date, site, and contact", href: "/request", primary: false },
          ].map((a) => (
            <Link key={a.label} href={a.href} className={`reveal reveal-delay-1 group rounded-2xl p-5 border hover:shadow-md hover:-translate-y-0.5 transition flex items-center justify-between gap-3 ${a.primary ? "bg-zinc-900 text-white border-zinc-900 hover:bg-black" : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300"}`}>
              <div><div className="font-semibold text-sm">{a.label}</div><div className={`text-sm ${a.primary ? "text-white/70" : "text-zinc-600"}`}>{a.desc}</div></div>
              <span className={`h-8 w-8 rounded-full grid place-items-center shrink-0 transition ${a.primary ? "bg-white/15 text-white group-hover:bg-white group-hover:text-zinc-900" : "bg-zinc-900 text-white group-hover:bg-emerald-800"}`}> →</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-white border-y border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[0.95fr_1.15fr] gap-10 lg:gap-12 items-start">
            <div className="lg:sticky lg:top-[84px]">
              <div className="reveal">
                <div className="text-xs tracking-[0.14em] font-bold text-emerald-800">HOW IT WORKS</div>
                <h3 className="text-[28px] sm:text-[34px] font-black tracking-[-0.03em] leading-[0.9] text-zinc-900 mt-2">Three steps<br /><span className="text-emerald-800">to your lot plan.</span></h3>
                <p className="text-sm leading-relaxed text-zinc-600 mt-3 max-w-[46ch]">We turned the old “follow-up lang” into a logged, auditable workflow. You see the same timeline our staff sees — with SMS and email on every move.</p>
                <ol className="mt-6 space-y-3">
                  {[
                    { n: "01", t: "Request + Documents", d: "Pick survey type, pin your lot, upload TCT / Tax Dec / ID. We check within 24 hours." },
                    { n: "02", t: "Quotation + Confirm", d: "Estimator sends a priced quote with line items. Accept to confirm. Pay manually now, GCash later." },
                    { n: "03", t: "Survey + Deliver", d: "We schedule, survey on site, process in AutoCAD, and deliver your bank-ready plan." },
                  ].map((s) => (
                    <li key={s.n} className="flex gap-3 rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                      <span className="h-7 w-7 rounded-full bg-emerald-800 text-white grid place-items-center text-xs font-bold shrink-0 mt-0.5">{s.n}</span>
                      <span><span className="block font-semibold text-sm text-zinc-900">{s.t}</span><span className="block text-sm leading-relaxed text-zinc-600 mt-0.5">{s.d}</span></span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/request" className="bg-emerald-800 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-emerald-900 shadow-sm hover:shadow transition">Start your survey</Link>
                  <Link href="/track" className="bg-white border border-zinc-200 px-6 py-3 rounded-full text-sm font-semibold hover:bg-zinc-50 transition">See tracker demo</Link>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-zinc-200 hidden sm:block" aria-hidden />
              <div className="absolute left-[15px] top-2 w-px bg-emerald-700 hidden sm:block transition-all duration-700" style={{ height: `${Math.min(100, Math.max(0, (progress * 1.6 - 0.35) * 100))}%` }} aria-hidden />
              <div className="space-y-3">
                {workflow.map(([n, t, tag, d], idx) => (
                  <div key={n} className={`reveal group relative bg-white rounded-2xl border p-4 sm:pl-10 sm:pr-5 flex gap-4 hover:shadow-md hover:border-zinc-300 transition ${idx === 4 ? "ring-1 ring-emerald-200 shadow-sm" : "border-zinc-200"}`} style={{ transitionDelay: `${idx * 28}ms` } as any}>
                    <span className={`hidden sm:grid absolute left-0 top-4 h-8 w-8 rounded-full border-2 bg-white place-items-center text-xs font-bold shrink-0 shadow-sm ${parseInt(n) <= 5 ? "border-emerald-700 text-emerald-800 bg-emerald-50" : "border-zinc-300 text-zinc-600"}`}>{n}</span>
                    <span className="sm:hidden h-8 w-8 rounded-full bg-emerald-800 text-white grid place-items-center text-xs font-bold shrink-0">{n}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-sm text-zinc-900">{t}</span><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${idx === 4 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-zinc-50 border-zinc-200 text-zinc-600"}`}>{tag}</span></div>
                      <div className="text-sm text-zinc-600 leading-relaxed mt-1">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="reveal mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                <span className="h-8 w-8 rounded-xl bg-amber-500 text-white grid place-items-center shrink-0 text-sm">✦</span>
                <div><div className="text-sm font-semibold text-amber-900">One request, full history</div><div className="text-sm text-amber-800/80 leading-relaxed">Each property keeps its own 8-step timeline — even if one phone number owns ten lots.</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
          <div className="reveal order-2 lg:order-1">
            <div className="text-xs tracking-[0.14em] font-bold text-emerald-800">PRECISION IN THE FIELD & OFFICE</div>
            <h3 className="text-[28px] font-black tracking-[-0.03em] leading-[0.9] text-zinc-900 mt-2">Licensed. Calibrated.<br />Bank-accepted.</h3>
            <p className="text-sm leading-relaxed text-zinc-600 mt-3">From monuments on the ground to technical descriptions on paper — we keep the chain of precision closed.</p>
            <div className="mt-6 grid gap-3">
              {[
                { title: "Licensed Geodetic Engineers", desc: "PRC-registered, DENR-accredited. Every plan is signed and sealed." },
                { title: "Calibrated instruments", desc: "Total station + GNSS, regularly checked. Raw data archived per project." },
                { title: "Registry-ready deliverables", desc: "Lot plans, technical descriptions, and subdivision sheets that pass LRA, DENR, and bank review." },
              ].map((b) => (
                <div key={b.title} className="flex gap-3 rounded-2xl bg-white border border-zinc-200 p-4 hover:border-emerald-200 hover:shadow-sm transition">
                  <span className="h-8 w-8 rounded-xl bg-emerald-800 text-white grid place-items-center shrink-0 text-sm">✓</span>
                  <div><div className="font-semibold text-sm text-zinc-900">{b.title}</div><div className="text-sm text-zinc-600 leading-snug">{b.desc}</div></div>
                </div>
              ))}
            </div>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white border border-zinc-200 px-4 py-2 shadow-sm text-xs text-zinc-600">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> Response within 24 hours — even on walk-in / Messenger requests
            </div>
          </div>
          <div className="reveal reveal-delay-1 order-1 lg:order-2 relative">
            <div className="relative rounded-[28px] overflow-hidden border border-zinc-200 bg-white shadow-xl">
              <div className="aspect-[4/3.2] relative bg-gradient-to-br from-stone-50 to-white p-6 sm:p-8">
                <div className="absolute inset-0 topo-grid opacity-40" aria-hidden />
                <svg viewBox="0 0 400 320" className="relative w-full h-full" aria-hidden>
                  <polygon points="60,80 320,60 300,240 80,260" fill="none" stroke="#0a4a3a" strokeWidth="1.6" strokeDasharray="6 4" opacity="0.9" />
                  <polygon points="60,80 320,60 300,240 80,260" fill="rgba(10,74,58,0.06)" />
                  <g fill="#0a4a3a"><circle cx="60" cy="80" r="5" /><circle cx="320" cy="60" r="5" /><circle cx="300" cy="240" r="5" /><circle cx="80" cy="260" r="5" /></g>
                  <g stroke="#0a4a3a" strokeWidth="0.7" opacity="0.6">
                    <line x1="60" y1="38" x2="320" y2="30" /><line x1="60" y1="32" x2="60" y2="44" /><line x1="320" y1="24" x2="320" y2="36" />
                    <text x="175" y="28" fontSize="8" fill="#0a4a3a" textAnchor="middle" fontWeight="700">125.42 m</text>
                    <line x1="340" y1="60" x2="318" y2="240" /><text x="352" y="150" fontSize="8" fill="#0a4a3a" textAnchor="middle" transform="rotate(90 352 150)" fontWeight="600">98.10 m</text>
                  </g>
                  <text x="180" y="100" fontSize="7.5" fill="#52525b" textAnchor="middle">N 12°14′ E</text>
                  <text x="210" y="220" fontSize="7.5" fill="#52525b" textAnchor="middle">S 78°05′ W</text>
                  <g transform="translate(185 150)"><circle r="18" fill="white" stroke="#0a4a3a" strokeWidth="1.2" /><g stroke="#0a4a3a" strokeWidth="1.1"><line x1="0" y1="-12" x2="0" y2="12" /><line x1="-12" y1="0" x2="12" y2="0" /></g><circle r="2.5" fill="#0a4a3a" /></g>
                </svg>
                <div className="absolute top-4 left-4 rounded-full bg-emerald-800 text-white text-[11px] font-bold tracking-widest px-3 py-1.5">LOT PLAN — 1:500</div>
                <div className="absolute bottom-4 right-4 rounded-xl bg-white border border-zinc-200 shadow px-3 py-2 text-xs"><div className="font-semibold text-zinc-900 leading-none">Blk 7 · Lot 1234</div><div className="text-zinc-600 leading-none mt-1">Cabadbaran City</div></div>
              </div>
              <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 border-t border-zinc-200 text-xs"><span className="text-zinc-600">AutoCAD · 2025 · Signed & sealed</span><span className="font-semibold text-emerald-800">Sanco GE-2025-0142</span></div>
            </div>
            <div className="absolute -bottom-4 -left-3 sm:left-auto sm:-right-4 rounded-2xl bg-white border border-zinc-200 shadow-xl p-3 flex items-center gap-3 max-w-[280px]">
              <span className="h-10 w-10 rounded-xl bg-emerald-800 text-white grid place-items-center font-bold text-sm">✓</span>
              <div className="min-w-0"><div className="text-sm font-semibold text-zinc-900 leading-none">Accepted by banks</div><div className="text-xs text-zinc-600 leading-tight mt-1">LandBank · BDO · BPI · Registry of Deeds</div></div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" aria-hidden><div className="absolute inset-0 topo-grid" /></div>
        <div className="absolute -top-28 -right-28 h-[520px] w-[520px] rounded-full border border-white/10 bg-white/[0.03] hidden lg:block" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 py-12 lg:py-16">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs tracking-[0.14em] font-bold text-emerald-300">COVERAGE</div>
              <h3 className="text-[28px] sm:text-[32px] font-black tracking-[-0.03em] leading-none mt-1">Cabadbaran · Butuan · Bayugan</h3>
              <p className="text-sm text-white/70 mt-2 max-w-[60ch]">Agusan del Norte and Agusan del Sur. Prefer Messenger or walk-in? We create the project for you — same tracker, same proof.</p>
            </div>
            <Link href="/contact" className="hidden sm:inline-flex bg-white text-zinc-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-zinc-100 transition">Contact Sanco</Link>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              { city: "Cabadbaran", role: "Head office · Est. 2018", addr: "Purok 6, Brgy. 9, Cabadbaran City · Agusan del Norte", time: "Mon–Sat 8AM–5PM · Walk-in welcome", accent: "border-emerald-500/40", map: "https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" },
              { city: "Butuan", role: "Service area", addr: "Butuan City · Agusan del Norte", time: "Field work · By appointment", accent: "border-white/15", map: "https://www.google.com/maps/search/Butuan+City+Agusan+del+Norte" },
              { city: "Bayugan", role: "Service area", addr: "Bayugan City · Agusan del Sur", time: "Field work · By appointment", accent: "border-white/15", map: "https://www.google.com/maps/search/Bayugan+City+Agusan+del+Sur" },
            ].map((c: any) => (
              <a key={c.city} href={c.map} target="_blank" rel="noopener noreferrer" className={`reveal group relative rounded-2xl bg-white/[0.06] backdrop-blur border p-5 hover:bg-white/[0.08] transition block ${c.accent}`}>
                <div className="flex items-start justify-between gap-3"><div><div className="font-bold text-white tracking-tight">{c.city}</div><div className="text-xs text-emerald-200 font-semibold tracking-wide">{c.role}</div></div><span className="h-8 w-8 rounded-full bg-white text-zinc-900 grid place-items-center text-xs">●</span></div>
                <div className="text-sm text-white/70 leading-relaxed mt-3">{c.addr}</div>
                <div className="text-xs text-white/60 mt-1">{c.time}</div>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/90 group-hover:text-white">View on map <span className="group-hover:translate-x-0.5 transition">→</span></span>
              </a>
            ))}
          </div>
          <div className="reveal mt-6 rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm">
              <div className="flex flex-wrap gap-4 text-white/90">
                <a href="tel:+639****8269" className="inline-flex items-center gap-2 hover:text-white font-medium">
                  <span className="h-7 w-7 rounded-full bg-white text-zinc-900 grid place-items-center text-xs">☎</span>
                  0997 286 8269 · 0907 010 4143
                </a>
                <a href="mailto:sancolandsurveyingservices@gmail.com" className="inline-flex items-center gap-2 hover:text-white">
                  <span className="h-7 w-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[11px]">✉</span>
                  sancolandsurveyingservices@gmail.com
                </a>
              </div>
              <a href="https://www.facebook.com/sancolandsurveying" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-xs font-medium">
                <span className="h-7 w-7 rounded-full bg-[#1877F2] text-white grid place-items-center font-black text-sm leading-none">f</span>
                Sanco Land Surveying Services
              </a>
            </div>
            <div className="text-xs text-white/60 mt-2.5 border-t border-white/10 pt-2.5">Purok 6, Brgy. 9, Cabadbaran City, Agusan del Norte — <span className="italic">Precision in Every Survey, Trust in Every Result.</span> · Est. 2018</div>
          </div>
          <div className="reveal mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-white/80">FB Messenger · Phone · Walk-in</span>
            <span className="rounded-full bg-emerald-500 text-white px-3 py-1.5 font-semibold">We respond within 24 hours</span>
            <Link href="/contact" className="sm:hidden ml-auto bg-white text-zinc-900 px-5 py-2 rounded-full font-semibold">Contact us →</Link>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-10 lg:py-14">
        <div className="reveal relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-gradient-to-br from-emerald-800 via-emerald-800 to-teal-800 p-7 sm:p-10 lg:p-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-teal-300/10 blur-2xl" aria-hidden />
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/90"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> Ready when you are</div>
              <h3 className="text-[28px] sm:text-[34px] font-black tracking-[-0.03em] leading-[0.9] text-white mt-3">Let’s get your<br />boundaries exact.</h3>
              <p className="text-sm leading-relaxed text-white/80 mt-3 max-w-[52ch]">Upload once, get a priced quotation, and follow your survey step by step. Your property keeps its full history — forever.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/request" className="bg-white text-emerald-900 px-7 py-3 rounded-full text-sm font-bold hover:bg-zinc-50 shadow-sm hover:shadow transition inline-flex items-center justify-center">Start your survey</Link>
                <Link href="/track" className="bg-white/10 backdrop-blur border border-white/20 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-white/15 transition inline-flex items-center justify-center">Track my project</Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-white p-5 shadow-xl border border-white/60">
                <div className="text-xs font-bold tracking-[0.12em] text-zinc-500">WHAT HAPPENS NEXT</div>
                <ol className="mt-3 space-y-2.5 text-sm">
                  {["We acknowledge your request (SMS + email)", "We verify documents within 24h", "You receive an itemized quotation", "You confirm — we schedule field work"].map((t, i) => (
                    <li key={t} className="flex gap-3"><span className="h-6 w-6 rounded-full bg-emerald-800 text-white grid place-items-center text-xs font-bold shrink-0">{i + 1}</span><span className="text-zinc-700 leading-snug pt-0.5">{t}</span></li>
                  ))}
                </ol>
                <div className="mt-4 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-xs text-zinc-600">No account needed to request. Sign in only to track and download.</div>
              </div>
              <div className="absolute inset-0 -z-10 translate-y-2 translate-x-2 rounded-2xl bg-black/10 blur-[1px]" aria-hidden />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Sanco Land Surveying Services · Licensed GE · Cabadbaran City</span>
          <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> One client, many properties — each with its own timeline</span>
        </div>
      </section>
    </div>
  );
}



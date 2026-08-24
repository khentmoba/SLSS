"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/request", label: "Request" },
  { href: "/track", label: "Track" },
  { href: "/properties", label: "Properties" },
  { href: "/documents", label: "Documents" },
  { href: "/staff", label: "Staff" },
];

export function Nav() {
  const pathname = usePathname();
  const [staff, setStaff] = useState<any>(null);

  useEffect(() => {
    fetch("/api/staff/me").then(r=>r.json()).then(j=>{ if(j.staff) setStaff(j.staff); }).catch(()=>{});
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f4efe1]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f4efe1]/90 border-b border-[#dcd3b8]">
        <div className="max-w-6xl mx-auto px-4 h-[62px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative h-10 w-10 border border-[#1d3820] grid place-items-center bg-white/60">
              <img src="/slss_logo.jpg" alt="" aria-hidden="true" width={36} height={36} className="h-8 w-8 object-cover" />
              <span aria-hidden className="monument absolute inset-[-4px]" />
            </span>
            <span className="leading-none">
              <span className="block font-display font-extrabold tracking-tight text-[15px] text-[#17170f] leading-none group-hover:text-[#1d3820] transition-colors">SANCO</span>
              <span className="block rule-label !text-[9px] text-[#1d3820] mt-1 !tracking-[0.22em]">Land Surveying</span>
            </span>
            <span aria-hidden className="hidden lg:inline-flex ml-2 text-[11px] font-mono text-[#837858] border-l border-[#dcd3b8] pl-3 pt-px">Your Property. Our Precision.</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-0.5">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-2 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors ${active ? "text-[#1d3820]" : "text-[#645b41] hover:text-[#17170f]"}`}
                >
                  {l.label}
                  <span aria-hidden className={`absolute inset-x-2 -bottom-0.5 h-[2px] bg-[#dd5a24] transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/contact" className="hidden sm:inline-flex px-3 py-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-[#645b41] hover:text-[#17170f]">Contact</Link>
            <Link href="/login" className="inline-flex items-center gap-2 bg-[#1f1c12] text-white px-4 py-2 text-[12px] font-bold tracking-[0.08em] uppercase hover:bg-[#17170f] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#dd5a24]"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 0c2.2 0 6 1.6 6 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/></svg>
              <span className="hidden sm:inline">{staff ? staff.name : "Sign in"}</span>
              <span className="sm:hidden">Sign in</span>
            </Link>
          </div>
        </div>

        <nav aria-label="Sections" className="md:hidden border-t border-[#dcd3b8] bg-[#f4efe1]">
          <div className="max-w-6xl mx-auto px-2 py-1.5 flex gap-1 overflow-x-auto scrollbar-none">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={`px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap border ${active ? "bg-[#1d3820] text-white border-[#1d3820]" : "bg-[#fcfaf1] text-[#4a4230] border-[#dcd3b8]"}`}>
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#fcfaf1] border-t border-[#dcd3b8] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex gap-2">
        <Link href="/request" className="flex-1 bg-[#1d3820] text-white py-3 text-sm font-bold tracking-wide uppercase text-center">Start your survey</Link>
        <Link href="/track" className="px-5 py-3 border border-[#dcd3b8] bg-white text-sm font-medium">Track</Link>
      </div>
    </>
  );
}

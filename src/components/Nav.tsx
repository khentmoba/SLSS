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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/slss_logo.jpg" alt="" aria-hidden="true" width={36} height={36} className="h-9 w-9 rounded-xl object-cover border border-zinc-200 shadow-sm" />
            <div className="leading-none">
              <div className="font-bold tracking-tight text-zinc-900 text-[15px]">SANCO</div>
              <div className="text-xs tracking-[0.12em] font-semibold text-emerald-700 -mt-0.5">LAND SURVEYING</div>
            </div>
            <span className="hidden lg:inline-flex ml-2 text-xs tracking-[0.08em] font-semibold text-zinc-600 border-l pl-3">Your Property. Our Precision.</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${active ? "bg-emerald-800 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/contact" className="hidden sm:inline-flex text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-full">Contact</Link>
            <Link href="/login" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-black focus-visible:outline-offset-2">
              <span aria-hidden="true" className="h-5 w-5 rounded-full bg-white/15 grid place-items-center text-[11px]">◉</span>
              <span className="hidden sm:inline">{staff ? staff.name : "Sign in"}</span>
              <span className="sm:hidden">Sign in</span>
            </Link>
          </div>
        </div>

        <nav aria-label="Sections" className="md:hidden border-t bg-white">
          <div className="max-w-6xl mx-auto px-2 py-2 flex gap-1.5 overflow-x-auto scrollbar-none">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={`px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${active ? "bg-emerald-800 text-white border-emerald-800" : "bg-white text-zinc-700 border-zinc-200"}`}>
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex gap-2">
        <Link href="/request" className="flex-1 bg-emerald-800 text-white rounded-full py-3 text-sm font-semibold text-center">Start your survey</Link>
        <Link href="/track" className="px-5 py-3 rounded-full border bg-white text-sm font-medium">Track</Link>
      </div>
    </>
  );
}


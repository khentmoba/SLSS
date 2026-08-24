import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sanco Land Surveying Services — Your Property. Our Precision.",
  description: "Sanco Land Surveying Services — Est. 2018, Purok 6, Brgy. 9, Cabadbaran City, Agusan del Norte. Precision in Every Survey, Trust in Every Result. Request surveys, track projects, manage documents.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = { themeColor: "#0a4a3a", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fdfcfb]">
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 outline-none">{children}</main>
        <footer className="mt-10">
          {/* Contact strip — mirrors banner: dark green bar with 4 contact points */}
          <div className="bg-[#0a4a3a] text-white relative overflow-hidden">
            {/* subtle curved accent like banner */}
            <div className="absolute top-0 right-0 h-[2px] w-full bg-white/20 hidden md:block" aria-hidden />
            <div className="max-w-6xl mx-auto px-4 py-4 md:py-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/15">
                {/* Address */}
                <a href="https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-0 lg:px-5 py-2 lg:py-1 hover:bg-white/5 rounded-xl lg:rounded-none transition group">
                  <span className="h-9 w-9 shrink-0 rounded-full bg-white text-[#0a4a3a] grid place-items-center shadow-sm group-hover:scale-105 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s-6.5-4.35-6.5-10A6.5 6.5 0 0 1 12 3a6.5 6.5 0 0 1 6.5 8c0 5.65-6.5 10-6.5 10Z" fill="currentColor"/><circle cx="12" cy="11" r="2.5" fill="white" style={{fill:"#0a4a3a"}}/><circle cx="12" cy="11" r="2.5" fill="#0a4a3a" opacity="0.95"/></svg>
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block font-semibold">Purok 6, Brgy. 9</span>
                    <span className="block text-white/90">Cabadbaran City, Agusan del Norte</span>
                  </span>
                </a>
                {/* Phones */}
                <div className="flex items-center gap-3 px-0 lg:px-5 py-2 lg:py-1">
                  <span className="h-9 w-9 shrink-0 rounded-full bg-white text-[#0a4a3a] grid place-items-center shadow-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6.6 2.5 9.4 5l-2 2.2c1.4 3 3.6 5.3 6.6 6.7L16.2 12l2.6 2.3-1.3 3.1c-.4.9-1.5 1.3-2.4.9-3.2-1.5-5.8-3.9-7.6-7-.4-.8 0-1.9.9-2.3L9.5 8.2 7.5 6l2-2-.9-1.5c-.3-.5-1-.7-1.5-.4L2.8 4.6c-.5.3-.7 1-.4 1.5.1.2.2.4.4.6Z" fill="currentColor"/></svg>
                  </span>
                  <span className="text-sm leading-tight">
                    <a href="tel:+639972868269" className="block font-semibold hover:underline underline-offset-2">0997 286 8269</a>
                    <a href="tel:+639070104143" className="block text-white/90 hover:text-white hover:underline underline-offset-2">0907 010 4143</a>
                  </span>
                </div>
                {/* Email */}
                <a href="mailto:sancolandsurveying@gmail.com" className="flex items-center gap-3 px-0 lg:px-5 py-2 lg:py-1 hover:bg-white/5 rounded-xl lg:rounded-none transition group">
                  <span className="h-9 w-9 shrink-0 rounded-full bg-white text-[#0a4a3a] grid place-items-center shadow-sm group-hover:scale-105 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M3.5 6 12 13l8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 14.5 9.2 11M18 14.5 14.8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </span>
                  <span className="text-sm font-medium break-all leading-tight group-hover:underline underline-offset-2">sancolandsurveying@gmail.com</span>
                </a>
                {/* Facebook */}
                <a href="https://www.facebook.com/search/top/?q=Sanco%20Land%20Surveying%20Services" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-0 lg:px-5 py-2 lg:py-1 hover:bg-white/5 rounded-xl lg:rounded-none transition group">
                  <span className="h-9 w-9 shrink-0 rounded-full bg-white text-[#0a4a3a] grid place-items-center shadow-sm group-hover:scale-105 transition font-black text-[18px] leading-none">f</span>
                  <span className="text-sm leading-tight">
                    <span className="block font-semibold group-hover:underline underline-offset-2">Sanco Land Surveying Services</span>
                    <span className="block text-white/70 text-xs">Follow us on Facebook</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
          {/* Bottom footer */}
          <div className="bg-white border-t border-zinc-200">
            <div className="max-w-6xl mx-auto px-4 py-7 flex flex-col md:flex-row gap-6 justify-between">
              <div className="flex gap-3">
                <img src="/slss_logo.jpg" alt="Sanco Land Surveying Services — Est. 2018" width={44} height={44} className="h-11 w-11 rounded-xl object-cover border border-zinc-200 shadow-sm" />
                <div>
                  <div className="font-black tracking-tight text-[13px] leading-none text-zinc-900 flex items-center gap-2">SANCO LAND SURVEYING SERVICES <span className="text-[10px] font-bold tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">EST. 2018</span></div>
                  <div className="text-xs tracking-[0.12em] font-semibold text-emerald-700 mt-1">Your Property. Our Precision.</div>
                  <div className="text-[11px] italic text-zinc-500 mt-0.5">Precision in Every Survey, Trust in Every Result.</div>
                  <div className="text-xs text-zinc-600 mt-1.5">Cabadbaran · Butuan · Bayugan — Agusan del Norte / Sur</div>
                </div>
              </div>
              <div className="text-xs leading-relaxed text-zinc-600 max-w-md">
                Lead-generation portal: request a quotation without visiting the office. Track your 8-step project, upload documents securely, and get notified by SMS and email.
                <div className="mt-3 flex flex-wrap items-center gap-2 text-zinc-500">
                  <span>© {new Date().getFullYear()} Sanco. All rights reserved.</span>
                  <span className="hidden sm:inline h-3 w-px bg-zinc-300" aria-hidden />
                  <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Licensed GE · PRC · DENR accredited</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

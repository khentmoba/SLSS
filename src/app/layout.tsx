import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  title: "Sanco Land Surveying Services — Your Property. Our Precision.",
  description: "Sanco Land Surveying Services — Est. 2018, Purok 6, Brgy. 9, Cabadbaran City, Agusan del Norte. Precision in Every Survey, Trust in Every Result. Request surveys, track projects, manage documents.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = { themeColor: "#1d3820", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${grotesk.variable} ${plex.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f4efe1]">
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 outline-none">{children}</main>
        <footer className="mt-12">
          {/* Contact strip — pine-ink plate with drafting rules */}
          <div className="bg-[#16301a] text-white relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 draft-grid opacity-[0.06]" />
            <div aria-hidden className="absolute top-0 left-0 right-0 h-px bg-white/20" />
            <div className="max-w-6xl mx-auto px-4 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/15 lg:divide-x lg:divide-white/15">
                {/* Address */}
                <a href="https://www.google.com/maps/search/Purok+6+Brgy+9+Cabadbaran+City+Agusan+del+Norte" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-0 lg:px-5 py-3 lg:py-2 group">
                  <span aria-hidden className="h-8 w-8 shrink-0 border border-white/40 grid place-items-center text-white/90 group-hover:border-white group-hover:bg-white group-hover:text-[#16301a] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s-6.5-4.35-6.5-10A6.5 6.5 0 0 1 12 3a6.5 6.5 0 0 1 6.5 8c0 5.65-6.5 10-6.5 10Z" fill="currentColor"/><circle cx="12" cy="11" r="2.4" fill="#16301a"/></svg>
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block rule-label text-white/50 !text-[9px]">Office</span>
                    <span className="block font-medium mt-0.5">Purok 6, Brgy. 9</span>
                    <span className="block text-white/80 text-xs">Cabadbaran City, Agusan del Norte</span>
                  </span>
                </a>
                {/* Phones */}
                <div className="flex items-start gap-3 px-0 lg:px-5 py-3 lg:py-2">
                  <span aria-hidden className="h-8 w-8 shrink-0 border border-white/40 grid place-items-center text-white/90">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6.6 2.5 9.4 5l-2 2.2c1.4 3 3.6 5.3 6.6 6.7L16.2 12l2.6 2.3-1.3 3.1c-.4.9-1.5 1.3-2.4.9-3.2-1.5-5.8-3.9-7.6-7-.4-.8 0-1.9.9-2.3L9.5 8.2 7.5 6l2-2-.9-1.5Z" fill="currentColor"/></svg>
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block rule-label text-white/50 !text-[9px]">Mobile</span>
                    <a href="tel:+639972868269" className="block font-medium mt-0.5 hover:underline underline-offset-2">0997 286 8269</a>
                    <a href="tel:+639070104143" className="block text-white/80 text-xs hover:text-white hover:underline underline-offset-2">0907 010 4143</a>
                  </span>
                </div>
                {/* Email */}
                <a href="mailto:sancolandsurveyingservices@gmail.com" className="flex items-start gap-3 px-0 lg:px-5 py-3 lg:py-2 group">
                  <span aria-hidden className="h-8 w-8 shrink-0 border border-white/40 grid place-items-center text-white/90 group-hover:border-white group-hover:bg-white group-hover:text-[#16301a] transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 6 12 13l8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="text-sm leading-tight min-w-0">
                    <span className="block rule-label text-white/50 !text-[9px]">Email</span>
                    <span className="block font-medium mt-0.5 text-xs sm:text-sm break-all group-hover:underline underline-offset-2">sancolandsurveyingservices@gmail.com</span>
                  </span>
                </a>
                {/* Facebook */}
                <a href="https://www.facebook.com/sancolandsurveying" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-0 lg:px-5 py-3 lg:py-2 group">
                  <span aria-hidden className="h-8 w-8 shrink-0 border border-white/40 grid place-items-center text-white/90 group-hover:border-white group-hover:bg-white group-hover:text-[#16301a] transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3h2.5v7h2.5Z"/></svg>
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block rule-label text-white/50 !text-[9px]">Facebook</span>
                    <span className="block font-medium mt-0.5 group-hover:underline underline-offset-2">Sanco Land Surveying Services</span>
                    <span className="block text-white/70 text-xs">Message us</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
          {/* Bottom footer — field-note colophon */}
          <div className="bg-[#fcfaf1] border-t border-[#dcd3b8]">
            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 justify-between">
              <div className="flex gap-4">
                <img src="/slss_logo.jpg" alt="Sanco Land Surveying Services — Est. 2018" width={48} height={48} className="h-12 w-12 object-cover border border-[#dcd3b8]" />
                <div>
                  <div className="font-display text-[17px] font-extrabold tracking-tight leading-none text-[#17170f]">SANCO <span className="font-sans font-bold">Land Surveying Services</span></div>
                  <div className="rule-label text-[#645b41] mt-1.5">Your Property. Our Precision.</div>
                  <div className="text-xs italic text-[#837858] mt-0.5">Precision in Every Survey, Trust in Every Result.</div>
                  <div className="font-mono text-[11px] text-[#645b41] mt-2">Cabadbaran · Butuan · Bayugan — Agusan del Norte / Sur</div>
                </div>
              </div>
              <div className="text-xs leading-relaxed text-[#645b41] max-w-md border-t border-dashed border-[#dcd3b8] md:border-t-0 pt-4 md:pt-0">
                <span className="rule-label text-[#837858]">Surface note</span>
                <div className="mt-1">Lead-generation portal: request a quotation without visiting the office. Track your 8-step project, upload documents securely, and get notified by SMS and email.</div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#837858]">
                  <span>© {new Date().getFullYear()} Sanco. All rights reserved.</span>
                  <span aria-hidden className="hidden sm:inline h-3 w-px bg-[#dcd3b8]" />
                  <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-[#1d3820]" /> Licensed GE · PRC · DENR accredited</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

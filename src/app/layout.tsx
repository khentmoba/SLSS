import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sanco Land Surveying Services — Your Property. Our Precision.",
  description: "Request surveys, track projects, manage documents. From property boundaries to proper documentation — Sanco is with you every step.",
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
        <footer className="border-t bg-white mt-10">
          <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex gap-3">
              <img src="/slss_logo.jpg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10 rounded-xl object-cover border" />
              <div>
                <div className="font-bold tracking-tight text-[13px]">SANCO LAND SURVEYING SERVICES</div>
                <div className="text-xs tracking-[0.12em] font-semibold text-emerald-700">Your Property. Our Precision.</div>
                <div className="text-xs text-zinc-600 mt-1">Cabadbaran · Butuan · Bayugan — Agusan del Norte / Sur</div>
              </div>
            </div>
            <div className="text-xs leading-relaxed text-zinc-600 max-w-md">
              Lead-generation portal: request a quotation without visiting the office. Track your 8-step project, upload documents securely, and get notified by SMS and email.
              <div className="mt-2 text-zinc-500">© {new Date().getFullYear()} Sanco. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

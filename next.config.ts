import type { NextConfig } from "next";
// next-pwa is ESM; dynamic import for compatibility
// @ts-ignore - no types for next-pwa
import createNextPwa from "next-pwa";

const withPWA = (createNextPwa as any)({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // API-first: same origin serves PWA + API; future native shell (Capacitor) hits same /api
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "bindings"],
};

export default withPWA(nextConfig);

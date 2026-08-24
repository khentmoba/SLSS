// 8-step pipeline + terminal overlays
import { ProjectStatus } from "@/generated/prisma/client";

export const PIPELINE: ProjectStatus[] = [
  "CLIENT_REQUEST",
  "DOCUMENT_CHECK",
  "QUOTATION",
  "PAYMENT_CONFIRMATION",
  "SITE_SURVEY",
  "PROCESSING",
  "DOCUMENTATION",
  "COMPLETED",
];

export const PIPELINE_LABEL: Record<ProjectStatus, string> = {
  CLIENT_REQUEST: "Client Request",
  DOCUMENT_CHECK: "Document Check",
  QUOTATION: "Quotation",
  PAYMENT_CONFIRMATION: "Payment / Confirmation",
  SITE_SURVEY: "Site Survey",
  PROCESSING: "Processing",
  DOCUMENTATION: "Documentation",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

const INDEX = Object.fromEntries(PIPELINE.map((s, i) => [s, i])) as Record<ProjectStatus, number>;

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  if (from === "CANCELLED" || from === "COMPLETED") return false;
  if (to === "ON_HOLD" || to === "CANCELLED") return true; // overlay from any
  if (from === "ON_HOLD") {
    // revert to previous or forward one step
    return PIPELINE.includes(to);
  }
  const fi = INDEX[from];
  const ti = INDEX[to];
  if (fi === undefined || ti === undefined) return false;
  // allow forward 1 or revert 1 with reason
  return ti === fi + 1 || ti === fi - 1;
}

export function nextStatus(s: ProjectStatus): ProjectStatus | null {
  const i = INDEX[s];
  if (i === undefined || i >= PIPELINE.length - 1) return null;
  return PIPELINE[i + 1];
}

export function progressPercent(s: ProjectStatus): number {
  if (s === "CANCELLED") return 0;
  if (s === "ON_HOLD") return 50;
  const i = INDEX[s];
  if (i === undefined) return 0;
  return Math.round(((i + 1) / PIPELINE.length) * 100);
}


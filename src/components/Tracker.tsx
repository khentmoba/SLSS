"use client";
import { PIPELINE, PIPELINE_LABEL, progressPercent } from "@/lib/status";
import { ProjectStatus } from "@/generated/prisma/client";

const STEP_LABELS: Record<string, [string, string]> = {
  CLIENT_REQUEST: ["Client", "Request"],
  DOCUMENT_CHECK: ["Document", "Check"],
  QUOTATION: ["Quot." as string, "ation"],
  PAYMENT_CONFIRMATION: ["Payment", "Confirm"],
  SITE_SURVEY: ["Site", "Survey"],
  PROCESSING: ["Process", "-ing"],
  DOCUMENTATION: ["Docu", "-mentation"],
  COMPLETED: ["Compl", "-eted"],
};

export function Tracker({ status }: { status: ProjectStatus }) {
  const isTerminal = status === "CANCELLED" || status === "ON_HOLD";
  const idx = PIPELINE.indexOf(status as any);
  const pct = progressPercent(status);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 gap-3">
        <div className="rule-label !text-[10px] text-[#1d3820]">{PIPELINE_LABEL[status] ?? status} {isTerminal ? "" : `· ${pct}%`}</div>
        <div className="font-mono text-[11px] text-[#837858] hidden sm:block">8 steps — every move is logged</div>
      </div>
      <div className="h-2 bg-[#e2dac4] border border-[#dcd3b8] overflow-hidden">
        <div className="h-full bg-[#1d3820] transition-all duration-500" style={{ width: isTerminal ? "100%" : `${pct}%`, opacity: isTerminal ? 0.35 : 1 }} />
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 mt-4">
        {PIPELINE.map((s, i) => {
          const done = idx !== -1 && i < idx;
          const cur = s === status;
          const [t1, t2] = STEP_LABELS[s] ?? [PIPELINE_LABEL[s] ?? s, ""];
          return (
            <div key={s} className={`relative border p-2 text-center ${cur ? "bg-[#1d3820] border-[#1d3820] text-white" : done ? "bg-[#eef3e9] border-[#b9caae] text-[#1d3820]" : "bg-[#fcfaf1] border-[#e2dac4] text-[#645b41]"}`}>
              <div className={`mx-auto h-7 w-7 grid place-items-center font-mono text-xs font-bold border ${cur ? "bg-[#dd5a24] text-[#17170f] border-[#dd5a24]" : done ? "bg-[#1d3820] text-white border-[#1d3820]" : "bg-white text-[#837858] border-[#c9bfa3]"}`}>{done ? "✓" : i + 1}</div>
              <div className="text-[11px] font-semibold leading-none mt-2">{t1}</div>
              <div className={`text-[11px] leading-none mt-1 hidden md:block ${cur ? "text-[#b9caae]" : "text-[#837858]"}`}>{t2}</div>
              {cur && <span aria-hidden className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-[#dd5a24] border border-[#17170f]" />}
            </div>
          );
        })}
      </div>
      {isTerminal && (
        <div className={`mt-3 font-mono text-[11px] leading-relaxed px-3.5 py-2.5 border ${status === "CANCELLED" ? "bg-[#f9ebea] text-[#7a2a24] border-[#e6c0bb]" : "bg-[#fbf3df] text-[#714814] border-[#ebd094]"}`}>
          {status === "CANCELLED" ? "Project cancelled — contact Sanco to reopen." : "On hold — waiting for documents, payment, or weather. Staff will update you."}
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: ProjectStatus }) {
  const color: Record<string, string> = {
    CLIENT_REQUEST: "bg-[#1f1c12] text-white border-[#1f1c12]",
    DOCUMENT_CHECK: "bg-[#fbf3df] text-[#714814] border-[#ebd094]",
    QUOTATION: "bg-[#e8f0f6] text-[#24425c] border-[#b9cede]",
    PAYMENT_CONFIRMATION: "bg-[#f2edf7] text-[#4a3a5e] border-[#d4c7e3]",
    SITE_SURVEY: "bg-[#fbece4] text-[#8a3d16] border-[#ecc7a8]",
    PROCESSING: "bg-[#e8f4f0] text-[#1f4a3d] border-[#b5d8cc]",
    DOCUMENTATION: "bg-[#e9e9f5] text-[#3a3972] border-[#c6c5e3]",
    COMPLETED: "bg-[#eef3e9] text-[#1d3820] border-[#b9caae]",
    ON_HOLD: "bg-[#fbf3df] text-[#714814] border-[#ebd094]",
    CANCELLED: "bg-[#f9ebea] text-[#7a2a24] border-[#e6c0bb]",
  };
  const label = (PIPELINE_LABEL as any)[status] ?? status;
  return (
    <span className={`inline-flex items-center border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${color[status] ?? "bg-[#f0ebdd] text-[#4a4230] border-[#dcd3b8]"}`}>
      <span className="mr-1.5 h-1 w-1 opacity-70 bg-current" aria-hidden />
      {label}
    </span>
  );
}

export function VerticalTimeline({ status, history }: { status: ProjectStatus; history: { fromStatus: string; toStatus: string; createdAt: string; note?: string | null }[] }) {
  return (
    <ol className="relative border-l border-[#dcd3b8] ml-1 space-y-4">
      {history.length === 0 && <li className="ml-5 font-mono text-[11px] text-[#837858]">No steps yet — your request is being received.</li>}
      {history.map((h, i) => {
        const isCur = h.toStatus === status;
        return (
          <li key={i} className="ml-5 relative">
            <span className={`absolute -left-[23px] top-0 h-5 w-5 border grid place-items-center font-mono text-[10px] leading-none ${isCur ? "bg-[#1d3820] text-white border-[#1d3820]" : "bg-white border-[#c9bfa3] text-[#837858]"}`}>{isCur ? "◉" : "○"}</span>
            <div className="text-xs font-semibold text-[#17170f]">{(PIPELINE_LABEL as any)[h.toStatus] ?? h.toStatus}</div>
            <div className="text-xs text-[#645b41]">{new Date(h.createdAt).toLocaleString()} {h.note ? `· ${h.note}` : ""}</div>
          </li>
        );
      })}
    </ol>
  );
}

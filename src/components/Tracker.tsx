"use client";
import { PIPELINE, PIPELINE_LABEL, progressPercent } from "@/lib/status";
import { ProjectStatus } from "@/generated/prisma/client";

export function Tracker({ status }: { status: ProjectStatus }) {
  const isTerminal = status === "CANCELLED" || status === "ON_HOLD";
  const idx = PIPELINE.indexOf(status as any);
  const pct = progressPercent(status);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 gap-3">
        <div className="text-xs font-semibold tracking-[0.14em] text-emerald-800 uppercase">{PIPELINE_LABEL[status] ?? status} {isTerminal ? "" : `· ${pct}%`}</div>
        <div className="text-xs text-zinc-600 hidden sm:block">8 steps — every move is logged</div>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
        <div className="h-full bg-emerald-800 transition-all duration-500" style={{ width: isTerminal ? "100%" : `${pct}%`, opacity: isTerminal ? 0.35 : 1 }} />
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-4">
        {PIPELINE.map((s, i) => {
          const done = idx !== -1 && i < idx;
          const cur = s === status;
          return (
            <div key={s} className={`relative rounded-2xl border p-2.5 text-center ${cur ? "bg-emerald-800 text-white border-emerald-800 shadow-sm" : done ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-zinc-200 text-zinc-600"}`}>
              <div className={`mx-auto h-7 w-7 rounded-full grid place-items-center text-xs font-bold border ${cur ? "bg-white text-emerald-800 border-white" : done ? "bg-emerald-700 text-white border-emerald-700" : "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>{done ? "✓" : i + 1}</div>
              <div className="text-xs font-semibold leading-none mt-2">{(PIPELINE_LABEL as any)[s].split(" ")[0]}</div>
              <div className={`text-xs leading-none mt-1 ${cur ? "text-white" : "text-zinc-600"}`}>{(PIPELINE_LABEL as any)[s].split(" ").slice(1).join(" ") || ""}</div>
              {cur && <div aria-hidden="true" className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 bg-emerald-800 rotate-45" />}
            </div>
          );
        })}
      </div>
      {isTerminal && (
        <div className={`mt-3 text-xs leading-relaxed px-3.5 py-2.5 rounded-xl border ${status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
          {status === "CANCELLED" ? "Project cancelled — contact Sanco to reopen." : "On hold — waiting for documents, payment, or weather. Staff will update you."}
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: ProjectStatus }) {
  const color: Record<string, string> = {
    CLIENT_REQUEST: "bg-zinc-900 text-white border-zinc-900",
    DOCUMENT_CHECK: "bg-amber-100 text-amber-800 border-amber-200",
    QUOTATION: "bg-blue-100 text-blue-800 border-blue-200",
    PAYMENT_CONFIRMATION: "bg-purple-100 text-purple-800 border-purple-200",
    SITE_SURVEY: "bg-orange-100 text-orange-800 border-orange-200",
    PROCESSING: "bg-sky-100 text-sky-700 border-sky-200",
    DOCUMENTATION: "bg-indigo-100 text-indigo-800 border-indigo-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ON_HOLD: "bg-amber-100 text-amber-800 border-amber-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return <span className={`inline-flex items-center border px-2.5 py-1 rounded-full text-xs font-semibold ${color[status] ?? "bg-zinc-100"}`}>{(PIPELINE_LABEL as any)[status] ?? status}</span>;
}

export function VerticalTimeline({ status, history }: { status: ProjectStatus; history: { fromStatus: string; toStatus: string; createdAt: string; note?: string | null }[] }) {
  return (
    <ol className="relative border-l border-zinc-200 ml-3 space-y-4">
      {history.length === 0 && <li className="ml-6 text-xs text-zinc-600">No steps yet — your request is being received.</li>}
      {history.map((h, i) => {
        const isCur = h.toStatus === status;
        return (
          <li key={i} className="ml-6 relative">
            <span className={`absolute -left-[29px] top-0 h-5 w-5 rounded-full border grid place-items-center text-[10px] leading-none ${isCur ? "bg-emerald-800 text-white border-emerald-800" : "bg-white border-zinc-300 text-zinc-600"}`}>{isCur ? "●" : "○"}</span>
            <div className="text-xs font-semibold text-zinc-900">{(PIPELINE_LABEL as any)[h.toStatus] ?? h.toStatus}</div>
            <div className="text-xs text-zinc-600">{new Date(h.createdAt).toLocaleString()} {h.note ? `· ${h.note}` : ""}</div>
          </li>
        );
      })}
    </ol>
  );
}

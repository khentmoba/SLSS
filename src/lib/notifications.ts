// Notification abstraction â€” IN_APP source of truth; EMAIL/SMS/PUSH are channels.
import { prisma } from "./prisma";
import { NotificationChannel, NotificationType } from "@/generated/prisma/client";

export async function notify(opts: {
  clientId?: string | null;
  projectId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  payload?: unknown;
  channels?: NotificationChannel[]; // default [IN_APP]
}) {
  const channels = opts.channels ?? ["IN_APP" as NotificationChannel];
  const rows = channels.map((channel) => ({
    clientId: opts.clientId ?? null,
    projectId: opts.projectId ?? null,
    type: opts.type,
    channel,
    title: opts.title,
    body: opts.body,
    payload: opts.payload ?? undefined,
  }));
  await prisma.notification.createMany({ data: rows });

  // For SMS/PUSH: abstraction point. MVP logs; future plugs in Semaphore/FCM.
  for (const c of channels) {
    if (c === "SMS") console.log(`[SMS] ${opts.body}`);
    if (c === "PUSH") console.log(`[PUSH] ${opts.title}`);
    if (c === "EMAIL") console.log(`[EMAIL] ${opts.title}: ${opts.body}`);
  }
}

export const triggers = {
  projectCreated: (p: { id: string; clientId?: string | null; guestPhone?: string | null }) =>
    notify({ projectId: p.id, clientId: p.clientId ?? undefined, type: "PROJECT_CREATED", title: "Request Received", body: `Project ${p.id.slice(0,6)} is at CLIENT REQUEST` }),
  documentRequired: (pId: string, cId: string | null, missing: string[]) =>
    notify({ projectId: pId, clientId: cId ?? undefined, type: "DOCUMENT_REQUIRED", title: "Document Required", body: `Please upload: ${missing.join(", ")}`, channels: ["IN_APP", "EMAIL", "SMS"] }),
  quotationSent: (pId: string, cId: string | null) =>
    notify({ projectId: pId, clientId: cId ?? undefined, type: "QUOTATION_SENT", title: "Quotation Ready", body: "Your quotation is ready for review", channels: ["IN_APP", "EMAIL", "SMS"] }),
  statusChanged: (pId: string, cId: string | null, from: string, to: string) =>
    notify({ projectId: pId, clientId: cId ?? undefined, type: "STATUS_CHANGED", title: "Project Update", body: `Status: ${from} â†’ ${to}`, channels: ["IN_APP", "EMAIL"] }),
};


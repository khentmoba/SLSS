import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@/generated/prisma/client";
import { canTransition, PIPELINE_LABEL } from "@/lib/status";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const to = body?.to as ProjectStatus;
  const note: string | undefined = body?.note;
  const staffId = req.cookies.get("staff_id")?.value ?? body?.staffId ?? null;
  const clientId = req.cookies.get("client_id")?.value ?? null;

  if (!to || !(to in PIPELINE_LABEL)) return NextResponse.json({ error: "Invalid target status" }, { status: 400 });

  const project = await prisma.project.findUnique({ where: { id }, include: { client: true, property: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const from = project.status as ProjectStatus;
  if (!canTransition(from, to)) return NextResponse.json({ error: `Cannot transition ${from} -> ${to}` }, { status: 400 });

  // Gate: DOCUMENT_CHECK -> QUOTATION requires all REQUIRED docs VERIFIED or override
  if (from === "DOCUMENT_CHECK" && to === "QUOTATION") {
    const missing = await prisma.document.findMany({ where: { projectId: id, requirement: "REQUIRED", state: { not: "VERIFIED" } } });
    const isOverride = body?.override === true;
    if (missing.length > 0 && !isOverride) {
      return NextResponse.json({ error: "Required documents not verified", missing: missing.map((d) => d.type), needOverride: true }, { status: 409 });
    }
    if (isOverride && !note) return NextResponse.json({ error: "Override requires reason note" }, { status: 400 });
  }

  // Gate: PAYMENT_CONFIRMATION -> SITE_SURVEY requires payment CONFIRMED
  if (from === "PAYMENT_CONFIRMATION" && to === "SITE_SURVEY") {
    const pay = await prisma.payment.findFirst({ where: { projectId: id, status: "CONFIRMED" } });
    if (!pay) return NextResponse.json({ error: "Payment confirmation required before SITE_SURVEY" }, { status: 409 });
  }

  const update: any = { status: to };
  if (to === "ON_HOLD") {
    update.previousStatus = from;
    update.onHoldReason = note ?? body?.reason ?? null;
  }
  if (from === "ON_HOLD" && (PIPELINE_LABEL as any)[to]) {
    update.previousStatus = null;
    update.onHoldReason = null;
  }
  if (to === "CANCELLED") update.cancelReason = note ?? body?.reason ?? null;

  const updated = await prisma.project.update({ where: { id }, data: update });
  await prisma.projectStatusHistory.create({
    data: { projectId: id, fromStatus: from, toStatus: to, byStaffId: staffId ?? undefined, byClientId: clientId ?? undefined, note: note ?? null },
  });

  await notify({
    clientId: project.clientId ?? undefined,
    projectId: id,
    type: "STATUS_CHANGED",
    title: "Project Update",
    body: `${PIPELINE_LABEL[from]} -> ${PIPELINE_LABEL[to]} for ${project.property.label}`,
    payload: { from, to },
  });

  return NextResponse.json({ ok: true, project: updated });
}


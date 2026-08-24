import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quotationSchema } from "@/lib/validations";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = quotationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const staffId = req.cookies.get("staff_id")?.value ?? body?.staffId ?? null;
  const d = parsed.data;
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { quotations: true } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.status !== "QUOTATION" && project.status !== "DOCUMENT_CHECK") {
    return NextResponse.json({ error: `Cannot quote at status ${project.status}` }, { status: 409 });
  }
  const version = (project.quotations.length > 0 ? Math.max(...project.quotations.map((q: any) => q.version)) : 0) + 1;
  const total = d.surveyFee + d.otherFees.reduce((a: number, f: any) => a + f.amount, 0);
  const validUntil = new Date(Date.now() + d.validDays * 86400000);
  const q = await prisma.quotation.create({
    data: {
      projectId,
      version,
      surveyFee: d.surveyFee,
      otherFees: d.otherFees,
      total,
      validUntil,
      note: d.note,
      createdByStaffId: staffId ?? undefined,
    },
  });
  // ensure project is at QUOTATION
  if (project.status === "DOCUMENT_CHECK") {
    await prisma.project.update({ where: { id: projectId }, data: { status: "QUOTATION" } });
    await prisma.projectStatusHistory.create({ data: { projectId, fromStatus: "DOCUMENT_CHECK", toStatus: "QUOTATION", byStaffId: staffId ?? undefined, note: `Quotation v${version} sent` } });
  }
  await notify({ clientId: project.clientId ?? undefined, projectId, type: "QUOTATION_SENT", title: "Quotation Ready", body: `Quotation ₱${total.toLocaleString()} for ${projectId.slice(0,6)} valid until ${validUntil.toLocaleDateString()}`, channels: ["IN_APP", "EMAIL", "SMS"] as any });
  return NextResponse.json({ ok: true, quotation: q });
}

// PATCH for accept/clarify/expire
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json().catch(() => null);
  const action = body?.action as "accept" | "clarify" | "reject";
  const qId = body?.quotationId as string;
  const message = body?.message as string | undefined;
  const clientId = req.cookies.get("client_id")?.value ?? body?.clientId ?? null;
  if (!action || !qId) return NextResponse.json({ error: "action and quotationId required" }, { status: 400 });
  const q = await prisma.quotation.findUnique({ where: { id: qId } });
  if (!q || q.projectId !== projectId) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  if (action === "accept") {
    if (new Date() > q.validUntil) return NextResponse.json({ error: "Quotation expired" }, { status: 409 });
    await prisma.quotation.update({ where: { id: qId }, data: { status: "ACCEPTED" } });
    // move project to PAYMENT_CONFIRMATION and create manual payment row
    await prisma.project.update({ where: { id: projectId }, data: { status: "PAYMENT_CONFIRMATION" } });
    await prisma.projectStatusHistory.create({ data: { projectId, fromStatus: "QUOTATION", toStatus: "PAYMENT_CONFIRMATION", byClientId: clientId ?? undefined, note: `Accepted v${q.version} ₱${q.total}` } });
    // create PENDING payment then confirm manually (Accept = confirmation for MVP)
    const existing = await prisma.payment.findFirst({ where: { projectId, quotationId: qId } });
    if (!existing) {
      await prisma.payment.create({ data: { projectId, quotationId: qId, amount: q.total, method: "MANUAL", status: "CONFIRMED", confirmedAt: new Date() } });
    } else {
      await prisma.payment.update({ where: { id: existing.id }, data: { status: "CONFIRMED", confirmedAt: new Date() } });
    }
    await notify({ clientId, projectId, type: "QUOTATION_ACCEPTED", title: "Quotation Accepted", body: `Accepted ₱${q.total.toLocaleString()}`, channels: ["IN_APP", "EMAIL"] as any });
    return NextResponse.json({ ok: true });
  }
  if (action === "clarify") {
    await prisma.quotation.update({ where: { id: qId }, data: { status: "CLARIFICATION_REQUESTED" } });
    if (message) await prisma.quotationClarification.create({ data: { quotationId: qId, message, byClientId: clientId ?? undefined } });
    return NextResponse.json({ ok: true });
  }
  if (action === "reject") {
    await prisma.quotation.update({ where: { id: qId }, data: { status: "REJECTED" } });
    await prisma.project.update({ where: { id: projectId }, data: { status: "CANCELLED", cancelReason: message ?? "Quotation rejected" } });
    await prisma.projectStatusHistory.create({ data: { projectId, fromStatus: "QUOTATION", toStatus: "CANCELLED", byClientId: clientId ?? undefined, note: message ?? "Rejected" } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const qs = await prisma.quotation.findMany({ where: { projectId }, orderBy: { version: "desc" }, include: { clarifications: true } });
  return NextResponse.json({ quotations: qs });
}

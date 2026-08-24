import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json().catch(() => null);
  const { amount, method = "MANUAL", proofUrl, referenceId } = body ?? {};
  const staffId = req.cookies.get("staff_id")?.value ?? body?.staffId ?? null;
  if (!amount) return NextResponse.json({ error: "amount required" }, { status: 400 });
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const payment = await prisma.payment.create({
    data: {
      projectId,
      amount: Number(amount),
      method,
      status: method === "MANUAL" ? "CONFIRMED" : "PENDING",
      proofUrl: proofUrl ?? null,
      referenceId: referenceId ?? null,
      quotationId: projectId ? (await prisma.quotation.findFirst({ where: { projectId }, orderBy: { version: "desc" } }))?.id ?? null : null,
      confirmedAt: method === "MANUAL" ? new Date() : null,
      confirmedByStaffId: staffId ?? undefined,
    },
  });
  return NextResponse.json({ ok: true, payment });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json().catch(() => null);
  const { paymentId, action } = body ?? {};
  const staffId = req.cookies.get("staff_id")?.value ?? null;
  if (!paymentId || !action) return NextResponse.json({ error: "paymentId and action required" }, { status: 400 });
  const p = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!p || p.projectId !== projectId) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (action === "confirm") {
    const upd = await prisma.payment.update({ where: { id: paymentId }, data: { status: "CONFIRMED", confirmedAt: new Date(), confirmedByStaffId: staffId ?? undefined } });
    return NextResponse.json({ ok: true, payment: upd });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

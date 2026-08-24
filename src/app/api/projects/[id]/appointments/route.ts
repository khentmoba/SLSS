import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const staffId = req.cookies.get("staff_id")?.value ?? null;
  const d = parsed.data;
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { client: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // warn on overlap
  const date = new Date(d.date);
  const existing = await prisma.appointment.findFirst({ where: { date, status: "CONFIRMED" } });
  if (existing) console.log(`[WARN] appointment overlap on ${d.date}`);

  const appt = await prisma.appointment.create({
    data: {
      projectId,
      date,
      time: d.time,
      alternateDate: d.alternateDate ? new Date(d.alternateDate) : null,
      siteLocation: d.siteLocation,
      contactPerson: d.contactPerson,
      contactPhone: d.contactPhone,
      status: staffId ? "CONFIRMED" : "REQUESTED",
      confirmedByStaffId: staffId ?? undefined,
    },
  });
  await notify({ clientId: project.clientId ?? undefined, projectId, type: appt.status === "CONFIRMED" ? "APPOINTMENT_CONFIRMED" : "APPOINTMENT_REQUESTED", title: appt.status === "CONFIRMED" ? "Appointment Confirmed" : "Appointment Requested", body: `${d.date} ${d.time} at ${d.siteLocation}`, channels: ["IN_APP", "EMAIL", "SMS"] as any });
  return NextResponse.json({ ok: true, appointment: appt });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json().catch(() => null);
  const { appointmentId, action } = body ?? {};
  const staffId = req.cookies.get("staff_id")?.value ?? null;
  if (!appointmentId || !action) return NextResponse.json({ error: "appointmentId and action required" }, { status: 400 });
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.projectId !== projectId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let status: any = appt.status;
  if (action === "confirm") status = "CONFIRMED";
  if (action === "complete") status = "COMPLETED";
  if (action === "cancel") status = "CANCELLED";
  const upd = await prisma.appointment.update({ where: { id: appointmentId }, data: { status, confirmedByStaffId: staffId ?? undefined } });
  // auto-advance SITE_SURVEY → PROCESSING on completed
  if (action === "complete") {
    const proj = await prisma.project.findUnique({ where: { id: projectId } });
    if (proj?.status === "SITE_SURVEY") {
      await prisma.project.update({ where: { id: projectId }, data: { status: "PROCESSING" } });
      await prisma.projectStatusHistory.create({ data: { projectId, fromStatus: "SITE_SURVEY", toStatus: "PROCESSING", byStaffId: staffId ?? undefined, note: "Site survey completed" } });
    }
  }
  return NextResponse.json({ ok: true, appointment: upd });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const list = await prisma.appointment.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ appointments: list });
}

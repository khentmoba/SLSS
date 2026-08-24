import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations";
import { triggers } from "@/lib/notifications";

// POST /api/projects — CLIENT REQUEST (creates Property if needed + Project)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const clientPhone = req.cookies.get("client_phone")?.value ?? d.guestPhone ?? null;
  const clientId = req.cookies.get("client_id")?.value ?? null;
  const staffId = req.cookies.get("staff_id")?.value ?? null;

  // property handling
  let propertyId = d.propertyId ?? null;
  if (!propertyId) {
    if (!d.municipality || !d.province) return NextResponse.json({ error: "Municipality/province required for new property" }, { status: 400 });
    const label = d.propertyLabel ?? `Lot ${d.lotNo ?? "—"} – ${d.municipality}`;
    if (d.titleNo) {
      const dup = await prisma.property.findFirst({ where: { titleNo: d.titleNo } });
      if (dup) console.log(`[WARN] duplicate titleNo ${d.titleNo} vs property ${dup.id}`);
    }
    const prop = await prisma.property.create({
      data: {
        label,
        lotNo: d.lotNo,
        titleNo: d.titleNo,
        taxDecNo: d.taxDecNo,
        barangay: d.barangay,
        municipality: d.municipality,
        province: d.province,
        areaSqm: d.areaSqm,
        gpsLat: d.gpsLat,
        gpsLng: d.gpsLng,
        addressNotes: d.addressNotes,
        clientId: clientId ?? undefined,
        guestPhone: !clientId ? clientPhone : null,
      },
    });
    propertyId = prop.id;
  } else {
    const active = await prisma.project.findFirst({
      where: { propertyId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    });
    if (active) return NextResponse.json({ error: "This property already has an active project. Complete or cancel before new request.", activeProjectId: active.id }, { status: 409 });
  }

  // parse surveyDate if provided
  let surveyDate: Date | undefined = undefined;
  if (d.surveyDate) {
    const parsedDate = new Date(d.surveyDate);
    if (!isNaN(parsedDate.getTime())) surveyDate = parsedDate;
  }

  const project = await prisma.project.create({
    data: {
      propertyId: propertyId!,
      surveyType: d.surveyType,
      purpose: d.purpose,
      preferredSchedule: d.preferredSchedule,
      surveyDate,
      statusMessage: d.statusMessage ?? null,
      guestName: d.guestName ?? null,
      status: "CLIENT_REQUEST",
      createdBy: staffId ? "STAFF" : clientId ? "CLIENT" : d.guestPhone ? "GUEST" : "CLIENT",
      clientId: clientId ?? undefined,
      guestPhone: !clientId ? clientPhone : null,
      createdByStaffId: staffId ?? undefined,
    },
    include: { property: true },
  });

  await prisma.projectStatusHistory.create({
    data: { projectId: project.id, fromStatus: "CLIENT_REQUEST", toStatus: "CLIENT_REQUEST", byClientId: clientId ?? undefined, byStaffId: staffId ?? undefined, note: d.statusMessage ?? "Project created" },
  });

  const templates = await prisma.documentChecklistTemplate.findMany({ where: { surveyType: d.surveyType } });
  const defaults: Array<{ docType: any; req: "REQUIRED" | "OPTIONAL" }> =
    templates.length > 0
      ? templates.map((t) => ({ docType: t.docType, req: t.requirement as any }))
      : [
          { docType: "TCT_OCT", req: "REQUIRED" as const },
          { docType: "TAX_DECLARATION", req: "REQUIRED" as const },
          { docType: "VALID_ID", req: "REQUIRED" as const },
          { docType: "LOT_PLAN", req: "OPTIONAL" as const },
        ];

  for (const dl of defaults) {
    await prisma.document.create({
      data: {
        projectId: project.id,
        propertyId: propertyId!,
        type: dl.docType,
        requirement: dl.req,
        state: "MISSING",
      },
    });
  }

  await prisma.project.update({ where: { id: project.id }, data: { status: "DOCUMENT_CHECK" } });
  await prisma.projectStatusHistory.create({
    data: { projectId: project.id, fromStatus: "CLIENT_REQUEST", toStatus: "DOCUMENT_CHECK", byClientId: clientId ?? undefined, byStaffId: staffId ?? undefined, note: d.statusMessage ?? "Moved to document check" },
  });

  await triggers.projectCreated(project as any);

  // if statusMessage provided and different, ensure it's persisted (already set)
  return NextResponse.json({ ok: true, project });
}

export async function GET(req: NextRequest) {
  const phone = req.cookies.get("client_phone")?.value;
  const clientId = req.cookies.get("client_id")?.value;
  const staff = req.cookies.get("staff_id")?.value;
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");

  let where: any = {};
  if (!staff) {
    if (clientId) where = { OR: [{ clientId }, { guestPhone: phone }] };
    else if (phone) where = { guestPhone: phone };
    else return NextResponse.json({ projects: [] });
  }
  if (propertyId) where.propertyId = propertyId;

  const projects = await prisma.project.findMany({
    where,
    include: { property: true, quotations: { orderBy: { version: "desc" } }, documents: true, appointments: true, statusHistory: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ projects });
}
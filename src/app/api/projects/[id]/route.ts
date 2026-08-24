import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProjectMetaSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      property: true,
      client: true,
      quotations: { orderBy: { version: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
      documents: true,
      appointments: { orderBy: { createdAt: "desc" } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffId = req.cookies.get("staff_id")?.value;
  // allow staff only to update meta; but also allow if staffId passed in body for dev
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // allow unauthenticated staff update if no cookie but we are in staff context? For now require staff cookie OR allow any (since mom is main handler)
  // We will enforce staff check but fallback to allow if project exists (small team)
  const parsed = updateProjectMetaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: any = {};
  if (d.guestName !== undefined) data.guestName = d.guestName;
  if (d.statusMessage !== undefined) data.statusMessage = d.statusMessage;
  if (d.purpose !== undefined) data.purpose = d.purpose;
  if (d.surveyDate !== undefined) {
    if (d.surveyDate === null || d.surveyDate === "") data.surveyDate = null;
    else {
      const parsedDate = new Date(d.surveyDate);
      data.surveyDate = isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
  }

  if (Object.keys(data).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

  const updated = await prisma.project.update({ where: { id }, data });

  // log history if statusMessage changed
  if (d.statusMessage !== undefined) {
    await prisma.projectStatusHistory.create({
      data: {
        projectId: id,
        fromStatus: project.status,
        toStatus: project.status,
        byStaffId: staffId ?? undefined,
        note: d.statusMessage ? `Status update: ${d.statusMessage}` : "Status message cleared",
      },
    });
  }

  return NextResponse.json({ ok: true, project: updated });
}
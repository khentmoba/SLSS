import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import { DocumentType } from "@/generated/prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Missing form data" }, { status: 400 });
  const file = form.get("file") as File | null;
  const type = (form.get("type") as string) ?? "OTHER";
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "File too large (15MB max)" }, { status: 409 });

  const allowed = ["TCT_OCT", "TAX_DECLARATION", "DEED_OF_SALE", "LOT_PLAN", "VALID_ID", "OTHER", "SUPPORTING_RECORD"] as const;
  if (!(allowed as readonly string[]).includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveFile(buffer, file.name);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // upsert document row for this type + project
  const existing = await prisma.document.findFirst({ where: { projectId, type: type as DocumentType } });
  let doc;
  const clientId = req.cookies.get("client_id")?.value ?? null;
  const staffId = req.cookies.get("staff_id")?.value ?? null;
  if (existing) {
    doc = await prisma.document.update({
      where: { id: existing.id },
      data: {
        fileUrl: saved.url,
        fileName: file.name,
        fileSize: saved.size,
        mimeType: file.type,
        state: "UPLOADED",
        uploadedByClientId: clientId ?? undefined,
        uploadedByStaffId: staffId ?? undefined,
      },
    });
  } else {
    doc = await prisma.document.create({
      data: {
        projectId,
        propertyId: project.propertyId,
        type: type as DocumentType,
        requirement: "OPTIONAL",
        state: "UPLOADED",
        fileUrl: saved.url,
        fileName: file.name,
        fileSize: saved.size,
        mimeType: file.type,
        uploadedByClientId: clientId ?? undefined,
        uploadedByStaffId: staffId ?? undefined,
      },
    });
  }

  await prisma.documentAccessLog.create({ data: { documentId: doc.id, byClientId: clientId ?? undefined, byStaffId: staffId ?? undefined, action: "UPLOAD" } });
  return NextResponse.json({ ok: true, document: doc });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json().catch(() => null);
  const { documentId, action, reason } = body ?? {};
  const staffId = req.cookies.get("staff_id")?.value ?? body?.staffId ?? null;
  if (!documentId || !action) return NextResponse.json({ error: "documentId and action required" }, { status: 400 });
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.projectId !== projectId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (action === "verify") {
    const upd = await prisma.document.update({ where: { id: documentId }, data: { state: "VERIFIED", verifiedByStaffId: staffId ?? undefined } });
    await prisma.documentAccessLog.create({ data: { documentId, byStaffId: staffId ?? undefined, action: "VERIFY" } });
    return NextResponse.json({ ok: true, document: upd });
  }
  if (action === "reject") {
    const upd = await prisma.document.update({ where: { id: documentId }, data: { state: "REJECTED", rejectionReason: reason ?? "Rejected" } });
    await prisma.documentAccessLog.create({ data: { documentId, byStaffId: staffId ?? undefined, action: "REJECT" } });
    return NextResponse.json({ ok: true, document: upd });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const docs = await prisma.document.findMany({ where: { projectId }, orderBy: { type: "asc" } });
  return NextResponse.json({ documents: docs });
}


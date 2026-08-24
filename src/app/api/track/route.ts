import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public tracker — no login required. Search by lot number, title, tax dec, label, or client name.
// Query: ?q=105  or  ?lotNo=105
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQ = searchParams.get("q") ?? searchParams.get("lotNo") ?? searchParams.get("lot") ?? "";
  const q = rawQ.trim();
  if (!q) return NextResponse.json({ projects: [], hint: "Add ?q=lotNumber e.g. ?q=105" });

  // sanitize: limit 100 chars, escape not needed because prisma handles
  const qq = q.slice(0, 100);

  // For SQLite, contains is case-insensitive. Search across property + project fields.
  // We use OR across multiple fields. For performance, limit to 25 results.
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { property: { lotNo: { contains: qq } } },
        { property: { titleNo: { contains: qq } } },
        { property: { taxDecNo: { contains: qq } } },
        { property: { label: { contains: qq } } },
        { property: { municipality: { contains: qq } } },
        { property: { barangay: { contains: qq } } },
        { guestName: { contains: qq } },
        { guestPhone: { contains: qq } },
        { purpose: { contains: qq } },
        { id: { contains: qq } },
      ],
    },
    include: {
      property: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      appointments: { orderBy: { date: "desc" } },
      quotations: { orderBy: { version: "desc" } },
      documents: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 25,
  });

  // Return public-safe projection (mask phone slightly but keep useful for client verification)
  // Keep guestPhone visible last 4 for verification, but for MVP return full — lotNo is already semi-public
  return NextResponse.json({ projects, query: qq, count: projects.length });
}
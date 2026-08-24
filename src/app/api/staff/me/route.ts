import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const staffId = req.cookies.get("staff_id")?.value;
  if (!staffId) return NextResponse.json({ staff: null }, { status: 401 });
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) return NextResponse.json({ staff: null }, { status: 401 });
  return NextResponse.json({ staff: { id: staff.id, email: staff.email, name: staff.name, role: staff.role } });
}

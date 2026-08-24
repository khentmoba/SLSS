import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value;
  const phone = req.cookies.get("client_phone")?.value;
  const staff = req.cookies.get("staff_id")?.value;
  let where: any = {};
  if (staff) {
    // staff sees all via query param
    const q = new URL(req.url).searchParams.get("phone");
    if (q) where = { OR: [{ clientId: q }, { guestPhone: q }] };
  } else if (clientId) {
    where = { OR: [{ clientId }, { guestPhone: phone }] };
  } else if (phone) {
    where = { guestPhone: phone };
  } else return NextResponse.json({ properties: [] });

  const properties = await prisma.property.findMany({
    where,
    include: { projects: { orderBy: { updatedAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ properties });
}

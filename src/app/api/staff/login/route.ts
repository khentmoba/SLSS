import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// MVP staff login — email + passwordHash check (if no password set, auto-create for dev)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = (body?.email as string)?.trim().toLowerCase();
  const password = body?.password as string;
  const name = body?.name as string | undefined;
  if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });

  let staff = await prisma.staff.findUnique({ where: { email } });
  if (!staff) {
    // dev auto-create estimator account
    if (process.env.NODE_ENV !== "production") {
      staff = await prisma.staff.create({ data: { email, name: name ?? email.split("@")[0], role: "ESTIMATOR", passwordHash: password } });
    } else return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } else {
    if (staff.passwordHash && staff.passwordHash !== password) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (!staff.passwordHash) await prisma.staff.update({ where: { id: staff.id }, data: { passwordHash: password } });
  }
  const res = NextResponse.json({ ok: true, staff: { id: staff.id, email: staff.email, name: staff.name, role: staff.role } });
  res.cookies.set("staff_id", staff.id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 12 });
  res.cookies.set("staff_email", staff.email, { httpOnly: true, path: "/", maxAge: 60 * 60 * 12 });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("staff_id");
  res.cookies.delete("staff_email");
  return res;
}

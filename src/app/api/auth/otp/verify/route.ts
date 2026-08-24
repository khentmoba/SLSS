import { NextRequest, NextResponse } from "next/server";
import { otpVerifySchema } from "@/lib/validations";
import { verifyOtp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const r = await verifyOtp(parsed.data.phone, parsed.data.code);
  if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 400 });
  const res = NextResponse.json({ ok: true, client: r.client });
  // simple session cookie (httpOnly)
  res.cookies.set("client_phone", parsed.data.phone, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  res.cookies.set("client_id", r.client!.id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

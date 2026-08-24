import { NextRequest, NextResponse } from "next/server";
import { otpSendSchema } from "@/lib/validations";
import { sendOtp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = otpSendSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const r = await sendOtp(parsed.data.phone);
    if (!r.ok) return NextResponse.json({ error: "Please wait before resending", cooldown: r.cooldown }, { status: 429 });
    return NextResponse.json({ ok: true, codeForDev: r.codeForDev });
  } catch (e: any) {
    console.error("OTP send error", e, e?.stack);
    return NextResponse.json({ error: String(e?.message ?? e), stack: e?.stack }, { status: 500 });
  }
}

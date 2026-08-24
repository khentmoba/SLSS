// Phone OTP abstraction — Semaphore-ready, manual fallback
import { prisma } from "./prisma";

const OTP_TTL_MIN = 5;
const OTP_MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SEC = 60;

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string): Promise<{ ok: boolean; cooldown?: number; codeForDev?: string }> {
  const recent = await prisma.otpChallenge.findFirst({
    where: { phone, createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_SEC * 1000) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const sec = Math.ceil((recent.createdAt.getTime() + RESEND_COOLDOWN_SEC * 1000 - Date.now()) / 1000);
    if (sec > 0) return { ok: false, cooldown: sec };
  }
  const code = genCode();
  await prisma.otpChallenge.create({
    data: { phone, code, expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60 * 1000) },
  });

  // Abstraction point: integrate Semaphore / EngageSpark here when ready.
  // For MVP we log to console + return code in dev for testing.
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) console.log(`[OTP] ${phone} -> ${code} (expires ${OTP_TTL_MIN}m)`);

  // TODO: if (process.env.SEMAPHORE_API_KEY) await fetch(...)
  return { ok: true, codeForDev: isDev ? code : undefined };
}

export async function verifyOtp(phone: string, code: string) {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { phone, verified: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!challenge) return { ok: false, reason: "No active OTP. Request a new code." };
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "Too many attempts. Request new code." };

  if (challenge.code !== code) {
    await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: "Invalid code" };
  }

  await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { verified: true } });

  // upsert Client (auto-claim provisionals)
  let client = await prisma.client.findUnique({ where: { phone } });
  if (!client) {
    client = await prisma.client.create({ data: { phone, verifiedAt: new Date() } });
  } else if (!client.verifiedAt) {
    client = await prisma.client.update({ where: { phone }, data: { verifiedAt: new Date() } });
  }

  // claim provisionals: properties + projects with guestPhone = phone
  await prisma.property.updateMany({ where: { guestPhone: phone, clientId: null }, data: { clientId: client.id, guestPhone: null } });
  await prisma.project.updateMany({ where: { guestPhone: phone, clientId: null }, data: { clientId: client.id, guestPhone: null } });

  return { ok: true, client };
}

export type OtpResult = Awaited<ReturnType<typeof verifyOtp>>;

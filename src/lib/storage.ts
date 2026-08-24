// Storage abstraction — S3-compatible behind signed URLs.
// MVP: stores to local /public/uploads via filesystem fallback; future plugs R2/S3/Supabase.
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveFile(buffer: Buffer, originalName: string): Promise<{ url: string; fileName: string; size: number }> {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${randomUUID()}-${safe}`;
  // For local dev we store under public/uploads (not committed)
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, fileName);
  await writeFile(full, buffer);
  return { url: `/uploads/${fileName}`, fileName, size: buffer.length };
}

export function signedUrl(url: string): string {
  // In production this would sign S3 URL with expiry; MVP returns as-is
  return url;
}

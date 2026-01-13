import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

function isAllowed(email: string) {
  const allow = (process.env.ALLOWLIST_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return allow.includes(email.toLowerCase());
}

// Auto detect base URL (works local + vercel). APP_URL optional.
function getBaseUrl(req: Request) {
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) return appUrl.replace(/\/+$/, "");

  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return "http://localhost:3000";

  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  // Jangan bocorkan allowlist: tetap balas ok
  if (!isAllowed(email)) {
    return NextResponse.json({ ok: true });
  }

  const secret = process.env.JWT_MAGIC_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing JWT_MAGIC_SECRET" }, { status: 500 });
  }

  const ttlMin = Number(process.env.MAGIC_LINK_TTL_MIN || "15");

  const token = jwt.sign({ email, type: "magic" }, secret, {
    expiresIn: `${ttlMin}m`,
  });

  const baseUrl = getBaseUrl(req);
  const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: "Your login link",
    html: `
      <p>Click to sign in (valid for ${ttlMin} minutes):</p>
      <p><a href="${verifyUrl}">Sign in</a></p>
      <p>If you didn't request this, ignore.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
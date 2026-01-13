import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    console.warn("[verify] Missing token");
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  try {
    const secret = process.env.JWT_MAGIC_SECRET;
    if (!secret) {
      console.error("[verify] Missing JWT_MAGIC_SECRET");
      return NextResponse.redirect(new URL("/login", url.origin));
    }

    const payload = jwt.verify(token, secret) as any;
    console.info("[verify] Token verified", {
      email: payload?.email,
      type: payload?.type,
      exp: payload?.exp,
      iat: payload?.iat,
    });
    if (payload.type !== "magic" || !payload.email) {
      throw new Error("bad token");
    }

    const sessionId = randomUUID();
    const days = Number(process.env.SESSION_TTL_DAYS || "7");

    const isProd = process.env.NODE_ENV === "production";

    const res = NextResponse.redirect(new URL("/upload", url.origin));
    res.cookies.set("admin_session", sessionId, {
      httpOnly: true,
      secure: isProd,       // ✅ localhost = false, production = true
      // Lax allows cookie on top-level navigation from email link.
      sameSite: "lax",
      path: "/",
      maxAge: days * 24 * 60 * 60,
    });

    return res;
  } catch (e) {
    console.error("[verify] Token verification failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.redirect(new URL("/login", url.origin));
  }
}

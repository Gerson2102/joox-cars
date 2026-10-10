import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/", "/admin", "/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  return request.nextUrl.pathname.startsWith("/admin") ? adminGate(request) : languageRedirect(request);
}

/** "/" goes to the visitor's language: English when the browser prefers it, Spanish otherwise. */
function languageRedirect(request: NextRequest) {
  const accept = request.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  const locale = first.startsWith("en") ? "en" : "es";
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url);
}

/* ---------- The CMS at /admin, hidden from the public ---------- */

// Anyone without a valid access token gets a plain 404: to them, /admin doesn't
// exist. The client unlocks it once with the secret link (/admin?key=THE_SECRET),
// which sets a signed, expiring token cookie: the secret itself is never stored in
// the browser, the token can't be forged, and it expires. Changing CMS_ADMIN_KEY
// invalidates every token at once.
//
// Only active when CMS_ADMIN_KEY is set (in Vercel); locally /admin stays open. The
// real lock is GitHub: only collaborators with write access can sign in and save.

const COOKIE = "cms_access";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const encoder = new TextEncoder();

function toB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toB64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data))));
}

/** Constant-time comparison, so the time taken says nothing about the secret. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function createToken(secret: string): Promise<string> {
  const exp = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${exp}.${await sign(exp, secret)}`;
}

async function isValidToken(token: string, secret: string): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  if (!Number.isFinite(Number(exp)) || Number(exp) < Date.now()) return false;
  return safeEqual(token.slice(dot + 1), await sign(exp, secret));
}

async function adminGate(request: NextRequest) {
  const secret = process.env.CMS_ADMIN_KEY;
  if (!secret) return NextResponse.next();

  const key = request.nextUrl.searchParams.get("key");
  if (key && safeEqual(key, secret)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("key");
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, await createToken(secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: MAX_AGE_SECONDS,
    });
    return res;
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (token && (await isValidToken(token, secret))) return NextResponse.next();

  return new NextResponse("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

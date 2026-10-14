import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

// Starts the GitHub sign-in for the CMS at /admin. The CMS opens this in a popup
// (backend.base_url + auth_endpoint in public/admin/config.yml); we send it on to
// GitHub's consent screen. GitHub comes back to /api/callback.
export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new NextResponse("Falta la variable GITHUB_CLIENT_ID", { status: 500 });
  }

  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host");

  // CSRF protection: a random state, echoed back by GitHub and checked in the callback.
  const state = randomBytes(16).toString("hex");

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", `${proto}://${host}/api/callback`);
  authUrl.searchParams.set("scope", "public_repo"); // the repo is public: write access to public repos only
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("cms_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api", maxAge: 600 });
  return res;
}

import { NextResponse, type NextRequest } from "next/server";

/** "/" goes to the visitor's language: English when the browser prefers it, Spanish otherwise. */
export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  const locale = first.startsWith("en") ? "en" : "es";
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/"],
};

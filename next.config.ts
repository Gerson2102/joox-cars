import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Without nonces, so every page stays static (docs: content-security-policy, "Without Nonces").
// The only third party is the Google map on the contact band.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// The CMS at /admin (Sveltia CMS, public/admin/) gets its own policy, as its docs list it:
// the app from UNPKG (pinned, with its integrity hash, in index.html), its fonts from
// jsDelivr, the GitHub API, and the two free translation services the client may add a
// key for (Google Cloud Translation, Gemini). No inline scripts.
const adminCsp = [
  "default-src 'self'",
  "script-src 'self' https://unpkg.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' https://cdn.jsdelivr.net",
  "img-src 'self' blob: data: https://*.githubusercontent.com",
  "media-src blob:",
  "frame-src blob:",
  "worker-src blob:",
  "manifest-src blob:",
  [
    "connect-src 'self' blob: data:",
    "https://unpkg.com",
    "https://api.github.com https://www.githubstatus.com",
    "https://translation.googleapis.com https://generativelanguage.googleapis.com",
  ].join(" "),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // The root layout sits under [lang], so unmatched URLs need app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 78, 85],
  },
  async rewrites() {
    // The CMS is a static page: /admin serves public/admin/index.html.
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
      // Later rules win for the same header, so this replaces the site's policy under /admin.
      { source: "/admin", headers: [{ key: "Content-Security-Policy", value: adminCsp }] },
      { source: "/admin/:path*", headers: [{ key: "Content-Security-Policy", value: adminCsp }] },
    ];
  },
};

export default nextConfig;

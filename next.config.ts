import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const cspDirectives: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": isDev
    ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    : ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "font-src": ["'self'"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "*.google.com",
    "*.googleapis.com",
    "*.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    "*.googleapis.com",
    "*.firebaseio.com",
    "firestore.googleapis.com",
    "api.open-meteo.com",
  ],
  "frame-src": ["maps.google.com"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
};

const csp = Object.entries(cspDirectives)
  .map(([key, values]) => `${key} ${values.join(" ")}`)
  .join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

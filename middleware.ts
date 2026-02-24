import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Switzerland + bordering countries
const ALLOWED_COUNTRIES = new Set(["CH", "FR", "DE", "AT", "IT", "LI"]);

export function middleware(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country");

  // Allow in dev (no header) and from allowed countries
  if (!country || ALLOWED_COUNTRIES.has(country)) {
    return NextResponse.next();
  }

  return new NextResponse("Not available in your region", { status: 403 });
}

export const config = {
  matcher: ["/api/:path*"],
};

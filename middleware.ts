import { NextRequest, NextResponse } from "next/server";

// Common exploit paths — 404 them silently
const BLOCKED_PATHS = [
  "/wp-admin", "/wp-login", "/xmlrpc.php",
  "/.env", "/.git", "/.svn",
  "/config.php", "/admin.php", "/phpmyadmin",
  "/etc/passwd", "/proc/self",
  "/shell", "/cmd", "/eval",
  "/.aws", "/.ssh",
];

// Known scanner/attack user agents
const BLOCKED_UA = [
  /sqlmap/i, /nikto/i, /masscan/i, /zgrab/i,
  /nmap/i, /nuclei/i, /acunetix/i, /burpsuite/i,
  /dirbuster/i, /gobuster/i, /hydra/i, /metasploit/i,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get("user-agent") ?? "";

  // Block exploit paths
  if (BLOCKED_PATHS.some((p) => pathname.toLowerCase().startsWith(p))) {
    return new NextResponse(null, { status: 404 });
  }

  // Block malicious scanners
  if (BLOCKED_UA.some((p) => p.test(ua))) {
    return new NextResponse(null, { status: 403 });
  }

  const res = NextResponse.next();

  // HSTS — force HTTPS for 1 year, include subdomains, eligible for preload list
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // CORS — API routes only accept requests from our own domain
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") ?? "";
    const allowed =
      origin === "https://janitor.network" ||
      origin === "https://www.janitor.network" ||
      process.env.NODE_ENV === "development";

    if (!allowed && origin !== "") {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    res.headers.set("Access-Control-Allow-Origin", allowed ? origin : "https://janitor.network");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

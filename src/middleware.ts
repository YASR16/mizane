import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PRIVATE_PREFIXES = ["/dashboard", "/admin", "/rapport", "/resultats", "/optimiser", "/paiement", "/lancement", "/matching", "/connexion", "/inscription", "/retour-beta"];

function stripLocale(pathname: string) {
  return pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
}

function isPrivatePath(pathname: string) {
  const stripped = stripLocale(pathname);
  return PRIVATE_PREFIXES.some((p) => stripped === p || stripped.startsWith(`${p}/`));
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/files") || pathname.startsWith("/storage")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  const response = intlMiddleware(request);
  if (isPrivatePath(pathname) || pathname.startsWith("/api/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/api/files/:path*"],
};

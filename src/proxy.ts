import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

import { getAuthSecret } from "@/lib/auth-secret";
import { COOKIE } from "@/lib/constants";

const PUBLIC_ACCOUNT = new Set(["/account/login", "/account/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accountPrivate = pathname.startsWith("/account") && !PUBLIC_ACCOUNT.has(pathname);
  const admin = pathname.startsWith("/admin");
  if (!accountPrivate && !admin) return NextResponse.next();

  const token = request.cookies.get(COOKIE.session)?.value;
  const login = request.nextUrl.clone();
  login.pathname = "/account/login";
  login.search = "";
  login.searchParams.set("next", pathname);

  if (!token) return NextResponse.redirect(login);

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getAuthSecret()));
    if (admin && payload.role !== "ADMIN") {
      const home = request.nextUrl.clone();
      home.pathname = "/";
      home.search = "";
      home.searchParams.set("notice", "admin");
      return NextResponse.redirect(home);
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};

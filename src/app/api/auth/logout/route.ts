import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.delete(AUTH_COOKIE_NAME);
  return res;
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.delete(AUTH_COOKIE_NAME);
  return res;
}


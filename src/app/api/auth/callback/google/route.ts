import { NextRequest, NextResponse } from "next/server";
import { getDb, users } from "@/db";
import { eq } from "drizzle-orm";
import {
  signAuthToken,
  checkIsAdminEmail,
  AUTH_COOKIE_NAME,
  type AuthUser,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  const origin = req.nextUrl.origin;
  let returnTo = "/";

  if (stateParam) {
    try {
      const decodedState = JSON.parse(
        Buffer.from(stateParam, "base64url").toString("utf8")
      );
      if (decodedState?.returnTo && decodedState.returnTo.startsWith("/")) {
        returnTo = decodedState.returnTo;
      }
    } catch {
      // ignore state parse errors
    }
  }

  if (error || !code) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error || "no_code")}`, origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?auth_error=missing_credentials", origin));
  }

  try {
    const redirectUri = `${origin}/api/auth/callback/google`;

    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Failed to exchange Google token:", errText);
      return NextResponse.redirect(new URL("/?auth_error=token_exchange_failed", origin));
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      id_token?: string;
    };

    // 2. Fetch User Profile
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userinfoResponse.ok) {
      return NextResponse.redirect(new URL("/?auth_error=userinfo_failed", origin));
    }

    const profile = (await userinfoResponse.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };

    if (!profile.email) {
      return NextResponse.redirect(new URL("/?auth_error=no_email", origin));
    }

    // 3. Determine Role
    const isAdmin = checkIsAdminEmail(profile.email);
    const role: "USER" | "ADMIN" = isAdmin ? "ADMIN" : "USER";

    let authUser: AuthUser = {
      id: profile.sub,
      email: profile.email.toLowerCase(),
      name: profile.name || profile.email.split("@")[0],
      nickname: profile.name || profile.email.split("@")[0],
      image: profile.picture || "",
      role,
      unlockedChapters: [],
    };

    // 4. Save/Update in Cloudflare D1
    const db = await getDb();
    if (db) {
      try {
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, authUser.email))
          .limit(1);

        if (existingUsers.length > 0) {
          const existing = existingUsers[0];
          authUser = {
            id: existing.id,
            email: existing.email,
            name: existing.name || authUser.name,
            nickname: existing.nickname || existing.name || authUser.name,
            image: profile.picture || existing.image || "",
            role: (isAdmin ? "ADMIN" : existing.role) as "USER" | "ADMIN",
            unlockedChapters: Array.isArray(existing.unlockedChapters)
              ? (existing.unlockedChapters as string[])
              : [],
          };

          // Update latest image or role if promoted to admin
          await db
            .update(users)
            .set({
              image: authUser.image,
              role: authUser.role,
            })
            .where(eq(users.id, existing.id));
        } else {
          // New user insert
          await db.insert(users).values({
            id: authUser.id,
            email: authUser.email,
            name: authUser.name,
            nickname: authUser.nickname,
            image: authUser.image,
            role: authUser.role,
            unlockedChapters: [],
            createdAt: new Date(),
          });
        }
      } catch (dbErr) {
        console.error("D1 User upsert error:", dbErr);
      }
    }

    // 5. Sign JWT Cookie (Strategy: "jwt" - no DB hits on requests)
    const jwtToken = await signAuthToken(authUser);

    const response = NextResponse.redirect(new URL(returnTo, origin));
    response.cookies.set(AUTH_COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    response.cookies.delete("mn_auth_state");

    return response;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/?auth_error=oauth_error", origin));
  }
}


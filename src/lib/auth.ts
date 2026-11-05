import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  image?: string;
  role: "USER" | "ADMIN";
  unlockedChapters: string[];
}

const JWT_SECRET_STRING =
  process.env.AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "medianaranja_secret_salt_2026_super_secure_key_change_in_production";

const JWT_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
export const AUTH_COOKIE_NAME = "mn_auth_token";

const TRUSTED_ADMIN_EMAILS = [
  "phultt.it@gmail.com",
  "celinewang9494@gmail.com",
  "celinewang94@gmail.com",
  "levan09041980@gmail.com",
];

/**
 * Checks if an email is in the admin whitelist or ADMIN_EMAILS environment variable list.
 */
export function checkIsAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (TRUSTED_ADMIN_EMAILS.includes(normalized)) {
    return true;
  }
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  const adminList = adminEmailsEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminList.includes(normalized);
}

/**
 * Returns all admin emails configured in the system.
 */
export function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  const list = adminEmailsEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const combined = new Set([...TRUSTED_ADMIN_EMAILS, ...list]);
  return Array.from(combined);
}

/**
 * Signs a JWT token containing user session details.
 * Strategy: "jwt" - 0 D1 reads on requests.
 */
export async function signAuthToken(user: AuthUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    nickname: user.nickname || user.name,
    image: user.image || "",
    role: user.role,
    unlockedChapters: user.unlockedChapters || [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_KEY);
}

/**
 * Verifies a JWT token and returns AuthUser payload or null if invalid.
 */
export async function verifyAuthToken(token?: string | null): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_KEY);
    const email = String(payload.email || "");
    const isAdmin = payload.role === "ADMIN" || checkIsAdminEmail(email);

    return {
      id: String(payload.id),
      email,
      name: String(payload.name || ""),
      nickname: payload.nickname ? String(payload.nickname) : undefined,
      image: payload.image ? String(payload.image) : undefined,
      role: isAdmin ? "ADMIN" : "USER",
      unlockedChapters: Array.isArray(payload.unlockedChapters)
        ? (payload.unlockedChapters as string[])
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * Server-side helper to get current session from HTTP cookie (0 D1 Database reads).
 */
export async function getAuthSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifyAuthToken(token);
    if (session) {
      if (checkIsAdminEmail(session.email)) {
        session.role = "ADMIN";
      }
      return session;
    }

    // Also support admin logged in via admin password cookie
    const adminToken = cookieStore.get("admin_auth_token")?.value;
    if (adminToken) {
      const secret = process.env.ADMIN_PASSWORD || "admin_change_this_password";
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(`admin_${secret}_salt`)
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const expected = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      if (adminToken === expected) {
        return {
          id: "admin_local",
          email: "phultt.it@gmail.com",
          name: "Quản trị viên",
          nickname: "Admin",
          role: "ADMIN",
          unlockedChapters: [],
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}


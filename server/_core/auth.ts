/**
 * Self-contained email/password authentication.
 * Replaces Manus OAuth entirely — no external OAuth dependencies.
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";
import * as db from "../db";
import type { User } from "../../drizzle/schema";

const COOKIE_NAME = "tcn_session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 12;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is required");
  return new TextEncoder().encode(secret);
}

export { COOKIE_NAME, ONE_YEAR_MS };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1y")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader?: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieHeader) return map;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k) map.set(k.trim(), decodeURIComponent(v.join("=")));
  }
  return map;
}

export function getSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ONE_YEAR_MS,
  };
}

/**
 * Authenticate a request by reading the session cookie.
 * Returns the User or null.
 */
export async function authenticateRequest(
  cookieHeader?: string
): Promise<User | null> {
  const cookies = parseCookies(cookieHeader);
  const token = cookies.get(COOKIE_NAME);
  const openId = await verifySessionToken(token);
  if (!openId) return null;
  const user = await db.getUserByOpenId(openId);
  return user ?? null;
}

/**
 * Register a new user with email + password.
 * Returns the created user or throws on duplicate email.
 */
export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin" | "clinician";
}): Promise<User> {
  const existing = await db.getUserByEmail(params.email);
  if (existing) throw new Error("EMAIL_TAKEN");

  const passwordHash = await hashPassword(params.password);
  const openId = randomUUID();

  await db.upsertUser({
    openId,
    name: params.name,
    email: params.email.toLowerCase().trim(),
    passwordHash,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });

  const user = await db.getUserByOpenId(openId);
  if (!user) throw new Error("Failed to create user");
  return user;
}

/**
 * Login with email + password.
 * Returns the User or throws on invalid credentials.
 */
export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<User> {
  const user = await db.getUserByEmail(params.email.toLowerCase().trim());
  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (!user.passwordHash) throw new Error("INVALID_CREDENTIALS");

  const valid = await verifyPassword(params.password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
  return user;
}

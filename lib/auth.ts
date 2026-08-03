import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, getUserById } from "./db";
import { currentRequestIdentity } from "./security";
import type { SessionUser } from "./types";

const COOKIE = "mirtpage_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

type SessionRow = {
  id: number;
  user_id: number;
  last_seen_at: number;
};

export async function currentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token || token.length < 40) return null;
  const now = Date.now();
  const session = getDb().prepare(`
    SELECT id,user_id,last_seen_at
    FROM sessions
    WHERE token_hash=? AND revoked_at IS NULL AND expires_at>?
  `).get(hashToken(token), now) as SessionRow | undefined;
  if (!session) return null;
  if (now - Number(session.last_seen_at) > 15 * 60 * 1000) {
    getDb().prepare("UPDATE sessions SET last_seen_at=? WHERE id=?").run(now, session.id);
  }
  return getUserById(Number(session.user_id)) || null;
}

export async function requireUser(options: { allowTemporaryPassword?: boolean } = {}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.must_change_password && !options.allowTemporaryPassword) {
    redirect("/dashboard/account?required=1");
  }
  return user;
}

export async function apiUser() {
  const user = await currentUser();
  if (!user || user.must_change_password) return null;
  return user;
}

export async function setSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  const identity = await currentRequestIdentity();
  getDb().prepare("DELETE FROM sessions WHERE expires_at<=? OR revoked_at IS NOT NULL").run(now);
  getDb().prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at,last_seen_at,ip_hash,user_agent) VALUES(?,?,?,?,?,?,?)").run(
    hashToken(token), userId, now + SESSION_MS, now, now, identity.ipHash, identity.userAgent,
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
    priority: "high",
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) getDb().prepare("UPDATE sessions SET revoked_at=? WHERE token_hash=?").run(Date.now(), hashToken(token));
  jar.delete(COOKIE);
}

export function revokeAllUserSessions(userId: number) {
  getDb().prepare("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL").run(Date.now(), userId);
}

import { platformCookie, platformCookies } from "./platform-state";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authDriver } from "./config";
import { runtimeUserById } from "./catalog-runtime";
import { postgresRuntimeServices } from "./postgres-runtime-services";
import { currentRequestIdentity } from "./security";
import type { SessionUser } from "./types";
import { currentSupabaseIdentity, signOutSupabaseSession } from "./supabase-auth";
const COOKIE = platformCookies.session.current;
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
type SessionRow = {
    id: number;
    user_id: number;
    last_seen_at: number;
};
export async function currentUser(): Promise<SessionUser | null> {
    if (authDriver() === "supabase") {
        const identity = await currentSupabaseIdentity();
        if (!identity)
            return null;
        return (await runtimeUserById(identity.userId)) || null;
    }
    const jar = await cookies();
    const token = platformCookie(jar, "session");
    if (!token || token.length < 40)
        return null;
    const now = Date.now();
    const session = await postgresRuntimeServices().sessions.findActive(hashToken(token), now);
    if (!session)
        return null;
    if (now - Number(session.last_seen_at) > 15 * 60 * 1000) {
        await postgresRuntimeServices().sessions.touch(session.id, now);
    }
    return (await runtimeUserById(Number(session.user_id))) || null;
}
export async function requireUser(options: {
    allowTemporaryPassword?: boolean;
} = {}) {
    const user = await currentUser();
    if (!user)
        redirect("/login");
    if (authDriver() === "local" && user.must_change_password && !options.allowTemporaryPassword) {
        redirect("/dashboard/account?required=1");
    }
    return user;
}
export async function apiUser() {
    const user = await currentUser();
    if (!user || (authDriver() === "local" && user.must_change_password))
        return null;
    return user;
}
export async function setSession(userId: number) {
    if (authDriver() === "supabase") {
        throw new Error("Supabase Auth sessions must be created by an authenticated provider flow.");
    }
    const token = crypto.randomBytes(32).toString("base64url");
    const now = Date.now();
    const identity = await currentRequestIdentity();
    {
        await postgresRuntimeServices().sessions.create({ tokenHash: hashToken(token), userId, expiresAt: now + SESSION_MS, now, ipHash: identity.ipHash, userAgent: identity.userAgent });
    }
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
    if (authDriver() === "supabase") {
        await signOutSupabaseSession();
        const jar = await cookies();
        jar.delete(COOKIE);
        jar.delete(platformCookies.session.legacy);
        return;
    }
    const jar = await cookies();
    const tokens = new Set([jar.get(COOKIE)?.value, jar.get(platformCookies.session.legacy)?.value]);
    for (const token of tokens) {
        if (token) await postgresRuntimeServices().sessions.revokeByToken(hashToken(token), Date.now());
    }
    jar.delete(COOKIE);
    jar.delete(platformCookies.session.legacy);
}
export async function revokeAllUserSessions(userId: number) {
    await postgresRuntimeServices().sessions.revokeAllForUser(userId, Date.now());
}

import { createMirtPageSupabaseAdminClient, finalizeSupabaseIdentity, removePendingSupabaseIdentity } from "../lib/supabase-auth";
import { runtimeAll, runtimeGet, runtimeRun } from "../lib/runtime-sql";

type RetainedUser = { id: number; email: string; name: string; password_hash: string };

async function main() {
  const apply = process.argv.includes("--apply");
  if (apply && process.env.MIRTPAGE_APPROVE_AUTH_MIGRATION !== "1") {
    throw new Error("Set MIRTPAGE_APPROVE_AUTH_MIGRATION=1 for this one approved identity migration command.");
  }

  if (!await runtimeGet("SELECT 1 FROM schema_migrations WHERE version=37")) {
    throw new Error("Database migration 37 is required before identity migration.");
  }

  const admin = createMirtPageSupabaseAdminClient();
  const providerUsers = new Map<string, { id: string; linkedUserId: string }>();
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error("Supabase Auth users could not be enumerated.");
    for (const user of data.users) {
      if (user.email) providerUsers.set(user.email.trim().toLowerCase(), {
        id: user.id,
        linkedUserId: String(user.app_metadata?.mirtpage_user_id || ""),
      });
    }
    if (data.users.length < 1000) break;
  }

  const retained = await runtimeAll<RetainedUser>("SELECT id,email,name,password_hash FROM users ORDER BY id");
  let alreadyLinked = 0;
  let wouldCreate = 0;
  let linkedExisting = 0;
  let created = 0;
  let conflicts = 0;

  for (const user of retained) {
    if (await runtimeGet("SELECT 1 FROM auth_identity_links WHERE user_id=?", [user.id])) {
      alreadyLinked += 1;
      continue;
    }
    const existing = providerUsers.get(user.email.trim().toLowerCase());
    if (existing && existing.linkedUserId !== String(user.id)) {
      conflicts += 1;
      continue;
    }
    if (!apply) {
      if (existing) linkedExisting += 1;
      else wouldCreate += 1;
      continue;
    }

    let providerUserId = existing?.id || "";
    let createdProvider = false;
    if (!providerUserId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: user.email,
        password_hash: user.password_hash,
        email_confirm: true,
        user_metadata: { display_name: user.name },
        app_metadata: { mirtpage_user_id: String(user.id), mirtpage_link_state: "linked" },
      });
      if (error || !data.user) throw new Error("A retained identity could not be created; migration stopped.");
      providerUserId = data.user.id;
      createdProvider = true;
    }
    try {
      await runtimeRun("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,?,?)", [user.id, providerUserId, user.email, Date.now()]);
      if (!createdProvider) await finalizeSupabaseIdentity(providerUserId, user.id);
      if (createdProvider) created += 1;
      else linkedExisting += 1;
    } catch (error) {
      if (createdProvider) await removePendingSupabaseIdentity(providerUserId).catch(() => false);
      throw error;
    }
  }

  const linked = await runtimeGet<{ total: number }>("SELECT COUNT(*) total FROM auth_identity_links WHERE provider='supabase'");
  const result = { mode: apply ? "apply" : "dry-run", retained: retained.length, alreadyLinked, wouldCreate, linkedExisting, created, conflicts, linkedTotal: Number(linked?.total || 0) };
  console.log(JSON.stringify(result));
  if (conflicts) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Supabase identity migration failed.");
  process.exitCode = 1;
});

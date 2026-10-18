import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { removeEmptyTrackingSchema } from './testing/tracking-migration-compat';
import { SUPPORT_STAFF_REPLY_TARGET_MS, SUPPORT_REPLY_SWEEP_LIMIT, supportReplyState } from '../lib/support-response-contract';

function policy() {
  const start = 1_800_000_000_000, target = 10 * 60_000;
  assert.equal(SUPPORT_STAFF_REPLY_TARGET_MS, target);
  assert.equal(SUPPORT_REPLY_SWEEP_LIMIT, 25);
  const open = { status: 'open', awaitingStaffSince: start };
  assert.deepEqual(supportReplyState(open, start + target - 1), { replyState: 'needs_reply', staffReplyDueAt: start + target });
  assert.deepEqual(supportReplyState(open, start + target), { replyState: 'overdue', staffReplyDueAt: start + target });
  assert.deepEqual(supportReplyState({ ...open, status: 'waiting' }, start + target), { replyState: 'overdue', staffReplyDueAt: start + target });
  for (const terminal of [{ ...open, status: 'closed' }, { ...open, resolvedAt: start }]) {
    assert.deepEqual(supportReplyState(terminal, start + target), { replyState: null, staffReplyDueAt: null });
  }
  assert.deepEqual(supportReplyState({ status: 'open', awaitingParticipantSince: start }, start), { replyState: 'waiting_customer', staffReplyDueAt: null });
  assert.deepEqual(supportReplyState({ status: 'open' }, start), { replyState: null, staffReplyDueAt: null });
  for (const invalid of [-1, NaN, Infinity, Number.MAX_SAFE_INTEGER,8_640_000_000_000_000,9_000_000_000_000_000]) {
    assert.deepEqual(supportReplyState({ status: 'open', awaitingStaffSince: invalid }, start), { replyState: null, staffReplyDueAt: null });
  }
  assert.deepEqual(supportReplyState({ status: 'waiting', awaitingStaffSince: 0 }, target), { replyState: 'overdue', staffReplyDueAt: target });
}

async function main() {
  policy();
  const db = await getDb(), t = 1_780_000_000_000;
  try {
    const schema = (await db.prepare('SELECT current_schema() name').get()).name as string;
    await removeEmptyTrackingSchema(db);
    await db.exec(`DROP TABLE support_transport_plans;DROP INDEX support_transport_plan_events_latest;
      DROP TABLE attention_email_deliveries;
      ALTER TABLE support_conversations DROP COLUMN overdue_notified_assignment_id;
      DROP INDEX support_staff_reply_pending;
      DROP INDEX support_idle_end_evidence_latest;
      ALTER TABLE support_conversations DROP COLUMN awaiting_staff_since,DROP COLUMN awaiting_staff_message_id,
        DROP COLUMN overdue_notified_message_id,DROP COLUMN staff_joined_assignment_id;
      ALTER TABLE attention_notifications DROP CONSTRAINT attention_notifications_kind_check;
      ALTER TABLE attention_notifications ADD CONSTRAINT attention_notifications_kind_check
        CHECK(kind IN ('inquiry','waiting_chat','assigned','reassigned','joined','message','closed','reopened'));
      ALTER TABLE support_conversations DROP CONSTRAINT support_resolution_check;
      ALTER TABLE support_conversations ADD CONSTRAINT support_resolution_check
        CHECK(resolved_at IS NULL OR (status='closed' AND assistance_category IN ('buying_assistance','shipment_observation')));
      ALTER TABLE support_events DROP CONSTRAINT ck_support_events_1;
      ALTER TABLE support_events ADD CONSTRAINT ck_support_events_1 CHECK(event_type IN
        ('created','assigned','reassigned','message','closed','reopened','transport_handoff','joined'));
      DELETE FROM schema_migrations WHERE version IN (67,68,69,70)`);
    assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version, 66);
    const business = (await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('response-migration','Response migration','composition','active')").run()).insertedId;
    async function user(name: string, role: string) {
      const id = (await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused',?,'admin',?,0)").run(`${name}@example.test`, name, business)).insertedId;
      await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id, role);
      return id;
    }
    const owner = await user('response-owner', 'client'), colleague = await user('response-colleague', 'client'), staff = await user('response-staff', 'team_member');
    async function conversation(kind: 'visitor' | 'client', category = 'shipment_observation', status = 'open', resolved: number | null = null) {
      const id = (await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,visitor_token_hash,visitor_session_expires_at,
        assistance_category,requester_label,visitor_phone,subject,status,assigned_user_id,created_at,updated_at,last_message_at,resolved_at,staff_joined_user_id,staff_joined_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(`SUP-${crypto.randomBytes(6).toString('hex')}`, kind, kind === 'client' ? business : null,
        kind === 'client' ? owner : null, kind === 'visitor' ? crypto.randomUUID() : null, kind === 'visitor' ? t + 10_000_000 : null,
        category, 'Migration fixture', '+447700900999', 'Retained request', status, status === 'waiting' ? null : staff, t, t, t, resolved, staff, t + 1)).insertedId;
      await db.prepare("INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,'joined','retained historical read-generated join',?)").run(id, staff, t + 1);
      return id;
    }
    let sequence = 0;
    async function message(id: number, kind: 'visitor' | 'user', author: number | null, side: 'participant' | 'staff' | null, visible: boolean, at = t + (++sequence)) {
      return (await db.prepare(`INSERT INTO support_messages(conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,visitor_visible,sender_side)
        VALUES(?,?,?,?,?,?,?,?,?)`).run(id, author, kind, author ? `user:${author}` : `visitor:${id}`, `Retained body ${sequence}`, crypto.randomUUID(), at, visible, side)).insertedId;
    }
    const expected = new Map<number, { id: number; at: number }>();
    const guest = await conversation('visitor');
    const first = await message(guest, 'visitor', null, null, false, t + 10);
    await message(guest, 'visitor', null, 'participant', false, t + 20);
    await message(guest, 'user', staff, 'staff', false, t + 30); // Known transport note is not a public reply.
    expected.set(guest, { id: first, at: t + 10 });
    const replied = await conversation('visitor');
    await message(replied, 'visitor', null, null, false);
    await message(replied, 'user', staff, 'staff', true);
    const ownerCase = await conversation('client', 'general', 'waiting');
    const original = await message(ownerCase, 'user', owner, null, false, t + 40);
    expected.set(ownerCase, { id: original, at: t + 40 });
    // Current roles never reinterpret original participant authorship.
    await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(owner);
    const technicalReplied = await conversation('client', 'general');
    await message(technicalReplied, 'user', owner, 'participant', false);
    await message(technicalReplied, 'user', staff, 'staff', false); // Owner technical replies are public despite this transport-only field.
    const ambiguous = await conversation('visitor');
    await message(ambiguous, 'visitor', null, null, false);
    await message(ambiguous, 'user', staff, null, false); // Ambiguous legacy note/reply is a conservative boundary.
    const afterAmbiguous = await conversation('client', 'general');
    await message(afterAmbiguous, 'user', owner, null, false);
    await message(afterAmbiguous, 'user', colleague, null, false); // Do not infer a colleague's historical authority.
    const certainAfter = await message(afterAmbiguous, 'user', colleague, 'participant', false, t + 50);
    expected.set(afterAmbiguous, { id: certainAfter, at: t + 50 });
    const ambiguousOnly = await conversation('client', 'general');
    await message(ambiguousOnly, 'user', colleague, null, false);
    for (const [status, resolved] of [['closed', null], ['closed', t + 100]] as const) {
      const id = await conversation('visitor', 'shipment_observation', status, resolved);
      await message(id, 'visitor', null, 'participant', false);
    }
    const snapshot = async () => ({
      conversations: await db.prepare(`SELECT id,public_ref,participant_kind,business_id,opened_by_user_id,visitor_token_hash,visitor_session_expires_at,assistance_category,
        requester_label,visitor_phone,subject,status,assigned_user_id,created_at,updated_at,last_message_at,resolved_at,staff_joined_user_id,staff_joined_at,
        client_confirmed_read_message_id,staff_confirmed_read_message_id,visitor_confirmed_read_message_id,awaiting_participant_since,idle_ended_at
        FROM support_conversations ORDER BY id`).all(),
      messages: await db.prepare('SELECT * FROM support_messages ORDER BY id').all(),
      events: await db.prepare('SELECT * FROM support_events ORDER BY id').all(),
      alerts: await db.prepare('SELECT * FROM attention_notifications ORDER BY id').all(),
    });
    const before = await snapshot();
    const aborted = Error('Fixture migration rollback');
    await assert.rejects(() => db.runner.transaction(async () => {
      assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [67,68,69,70,71,72]);
      throw aborted;
    }), error => error === aborted);
    assert.equal((await db.prepare("SELECT COUNT(*) n FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='support_conversations' AND column_name='awaiting_staff_since'").get()).n, 0);
    assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version, 66);
    assert.deepEqual(await snapshot(), before, 'Rollback preserves schema66 data and all history');
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [67,68,69,70,71,72]);
    assert.deepEqual(await snapshot(), before, 'Migration never rewrites retained transcript, events, identity, read or old idle state');
    for (const c of before.conversations) {
      const row = await db.prepare('SELECT awaiting_staff_since,awaiting_staff_message_id,overdue_notified_message_id,staff_joined_assignment_id FROM support_conversations WHERE id=?').get(c.id);
      const cycle = expected.get(c.id);
      assert.deepEqual(row, { awaiting_staff_since: cycle?.at ?? null, awaiting_staff_message_id: cycle?.id ?? null,
        overdue_notified_message_id: cycle?.id ?? null, staff_joined_assignment_id: null });
    }
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM attention_notifications').get()).n, 0, 'Legacy cycles produce no catch-up notifications');
    const allAfter = await db.prepare('SELECT * FROM support_conversations ORDER BY id').all();
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    assert.deepEqual(await db.prepare('SELECT * FROM support_conversations ORDER BY id').all(), allAfter, 'No-op replay cannot move anchors or accept historical implicit joins');
    await db.prepare("INSERT INTO attention_notifications(source_key,recipient_key,user_id,conversation_id,kind,created_at) VALUES(?,?,?,?,'reply_overdue',?)").run('fixture-overdue', `user:${staff}`, staff, guest, t);
    await assert.rejects(() => db.prepare("INSERT INTO attention_notifications(source_key,recipient_key,user_id,conversation_id,kind,created_at) VALUES(?,?,?,?,'unexpected-kind',?)").run('fixture-invalid', `user:${staff}`, staff, guest, t), /check constraint/);
    for (const set of ['awaiting_staff_since=NULL,awaiting_staff_message_id=1', 'awaiting_staff_since=1,awaiting_staff_message_id=NULL', 'awaiting_staff_since=-1,awaiting_staff_message_id=1', 'overdue_notified_message_id=0', 'staff_joined_assignment_id=0']) {
      await assert.rejects(() => db.prepare(`UPDATE support_conversations SET ${set} WHERE id=?`).run(guest), /check constraint/);
    }
    const index = (await db.prepare("SELECT indexdef FROM pg_indexes WHERE schemaname=current_schema() AND indexname='support_staff_reply_pending'").get()).indexdef as string;
    for (const token of ['awaiting_staff_since, id', 'resolved_at IS NULL', 'overdue_notified_message_id IS DISTINCT FROM awaiting_staff_message_id']) assert.ok(index.includes(token), token);
    assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version, 72);
    console.log('PASS S125/S126 pure10-minute state boundaries and isolated schema66→71 migration compatibility: conservative original-side/opener backfill, no legacy push, explicit-join reset, history/read/contact preservation, atomic rollback, CHECK/index and no-op replay.');
  } finally { await closeDbForTests(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

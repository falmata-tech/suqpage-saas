import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  buildFeaturedProgramAgenda,
  DEFAULT_FEATURED_PROGRAM_POLICY,
  featuredBroadcastPhase,
  featuredProgramDisplayOrder,
  MAX_FEATURED_SHOWROOMS,
  resolveFeaturedProgramSessions,
  type FeaturedBoothWalkthrough,
  type FeaturedProgramBreak,
} from "../lib/featured-program";
import {
  FeaturedProgramSettingsError,
  featuredProgramPolicyFromForm,
  getFeaturedProgramDaySelection,
  getFeaturedProgramPolicy,
  listFeaturedProgramEligibleBusinesses,
  saveFeaturedProgramDay,
  updateFeaturedProgramPolicy,
  type FeaturedProgramWritePort,
} from "../lib/featured-program-settings";
import { migrateDatabase } from "../lib/schema";
import type { RuntimeSqlValue } from "../lib/runtime-sql";

const featuredUiSource = fs.readFileSync(path.join(process.cwd(), "components/FeaturedShowroomsWorkspace.tsx"), "utf8");
const discoveryCssSource = fs.readFileSync(path.join(process.cwd(), "app/discovery.css"), "utf8");
const lineupSelectorSource = fs.readFileSync(path.join(process.cwd(), "components/FeaturedLineupSelector.tsx"), "utf8");
const featuredAdminSource = fs.readFileSync(path.join(process.cwd(), "app/dashboard/admin/featured-schedule/page.tsx"), "utf8");
assert.match(featuredUiSource, /function TodayProgramSchedule/);
assert.match(featuredUiSource, /Today&apos;s schedule/);
assert.match(featuredUiSource, /if \(!featured\.isToday\) return null/);
assert.match(featuredUiSource, /featured\.booths\[slot - 1\]/, "public schedule names resolve from the same authoritative booth lineup");
assert.match(featuredUiSource, /entry\.kind === "booth" \|\| entry\.kind === "sponsor_break"/, "visitor schedule includes presentations and sponsor breaks without an expanded changeover wall");
assert.match(discoveryCssSource, /\.featured-agenda-body/);
assert.match(discoveryCssSource, /max-height:\s*min\(470px, 58dvh\)/, "the opened phone schedule remains bounded");
assert.match(lineupSelectorSource, /disabled=\{!selected && capacityReached\}/, "the admin selector prevents a forty-first browser selection");
assert.match(lineupSelectorSource, /Daily Featured accepts up to \{limit\} pages/, "the admin selector explains the capacity");
assert.match(featuredAdminSource, /sponsorForSlot\(entry\.sponsorSlot\)\?\.name/, "the internal agenda names each scheduled sponsor placement");
assert.match(featuredUiSource, /Sponsor spotlight/, "the public schedule and live rail disclose the active sponsor segment");

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-featured-schedule-"));
  const db = new DatabaseSync(path.join(root, "test.db"));
  try {
  db.exec("PRAGMA foreign_keys=ON");
  migrateDatabase(db);
  const settingsPort: FeaturedProgramWritePort = {
    async get<T>(sql: string, values: readonly RuntimeSqlValue[] = []) { return db.prepare(sql).get(...values) as T | undefined; },
    async all<T>(sql: string, values: readonly RuntimeSqlValue[] = []) { return db.prepare(sql).all(...values) as T[]; },
    async run(sql: string, values: readonly RuntimeSqlValue[] = []) { return db.prepare(sql).run(...values); },
    async transaction<T>(operation: () => Promise<T>) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const result = await operation();
        db.exec("COMMIT");
        return result;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
  assert.ok(db.prepare("SELECT 1 FROM schema_migrations WHERE version=32").get(), "migration 32 is recorded");
  assert.deepEqual(await getFeaturedProgramPolicy(settingsPort), DEFAULT_FEATURED_PROGRAM_POLICY, "migration 32 installs the 08:00-22:00 default policy");

  const agenda = buildFeaturedProgramAgenda("2026-08-10", 10, new Date("2026-08-10T10:05:00+03:00"));
  const booths = agenda.filter((entry) => entry.kind === "booth");
  assert.equal(booths.length, 10);
  assert.equal(booths.filter((entry) => entry.session === "morning").length, 5);
  assert.equal(booths.filter((entry) => entry.session === "afternoon").length, 5);
  assert.equal(booths[0].label, "10:05–10:35");
  assert.equal(booths[5].label, "19:05–19:35");
  assert.equal(agenda.filter((entry) => entry.kind === "sponsor_break").length, 2);
  const sponsorBreaks = agenda.filter(
    (entry): entry is FeaturedProgramBreak => entry.kind === "sponsor_break",
  );
  assert.deepEqual(sponsorBreaks.map((entry) => entry.sponsorSlot), [1, 2], "sponsor segments receive chronological placement slots");
  const intermission = agenda.find((entry) => entry.kind === "intermission");
  assert.equal(intermission?.kind === "intermission" ? intermission.timeLabel : "", "13:00–19:05");
  assert.equal(agenda.filter((entry) => entry.current).length, 1);
  const orderedWalkthroughs = agenda.filter((entry): entry is FeaturedBoothWalkthrough => entry.kind === "booth");
  assert.deepEqual(featuredProgramDisplayOrder(orderedWalkthroughs, new Date("2026-08-10T09:00:00+03:00")), [1,2,3,4,5,6,7,8,9,10], "the first slot leads before the program starts");
  assert.deepEqual(featuredProgramDisplayOrder(orderedWalkthroughs, orderedWalkthroughs[1].start + 1), [2,3,4,5,6,7,8,9,10,1], "the current presentation rotates to the lead");
  assert.deepEqual(featuredProgramDisplayOrder(orderedWalkthroughs, orderedWalkthroughs[1].end + 1), [2,3,4,5,6,7,8,9,10,1], "the latest completed presentation remains first during a break");
  assert.deepEqual(featuredProgramDisplayOrder(orderedWalkthroughs, orderedWalkthroughs.at(-1)!.end + 1), [10,1,2,3,4,5,6,7,8,9], "the final presentation remains first after the program ends");
  assert.equal(featuredBroadcastPhase("2026-08-10", 10, new Date("2026-08-10T15:00:00+03:00")), "intermission");
  assert.equal(buildFeaturedProgramAgenda("2026-08-10", 10, new Date("2026-08-10T15:00:00+03:00")).some((entry) => entry.kind === "booth" && entry.current), false);
  for (let index = 1; index < agenda.length; index += 1) {
    assert.ok(agenda[index - 1].end <= agenda[index].start, "agenda entries never overlap");
  }

  const leanSessions = resolveFeaturedProgramSessions(10);
  assert.deepEqual(leanSessions, {
    morning: { session: "morning", startMinute: 605, endMinute: 780, boothCount: 5 },
    afternoon: { session: "afternoon", startMinute: 1145, endMinute: 1320, boothCount: 5 },
  }, "ten booths contract into 10:05-13:00 and 19:05-22:00 sessions");
  const leanAgenda = buildFeaturedProgramAgenda("2026-08-10", 10, new Date("2026-08-10T10:05:00+03:00"));
  assert.ok(leanAgenda.filter((entry) => entry.kind === "booth").every((entry) => entry.end - entry.start === 30 * 60 * 1000), "contracted booth presentations retain the 30-minute target");
  assert.equal(leanAgenda.find((entry) => entry.kind === "booth")?.label, "10:05–10:35");
  const leanIntermission = leanAgenda.find((entry) => entry.kind === "intermission");
  assert.equal(leanIntermission?.kind === "intermission" ? leanIntermission.timeLabel : "", "13:00–19:05");
  assert.equal(featuredBroadcastPhase("2026-08-10", 10, new Date("2026-08-10T18:00:00+03:00")), "intermission");
  assert.equal(featuredBroadcastPhase("2026-08-10", 10, new Date("2026-08-10T19:05:00+03:00")), "live");
  assert.deepEqual(resolveFeaturedProgramSessions(2), {
    morning: { session: "morning", startMinute: 720, endMinute: 780, boothCount: 1 },
    afternoon: { session: "afternoon", startMinute: 1260, endMinute: 1320, boothCount: 1 },
  }, "the smallest two-booth lineup keeps one bounded session in both parts of the day");
  const fullAgenda = buildFeaturedProgramAgenda("2026-08-10", MAX_FEATURED_SHOWROOMS, new Date("2026-08-10T08:02:00+03:00"));
  const fullBooths = fullAgenda.filter((entry) => entry.kind === "booth");
  assert.equal(fullBooths.length, 40, "the agenda supports the complete forty-showroom Daily Featured floor");
  assert.equal(fullBooths.filter((entry) => entry.session === "morning").length, 20);
  assert.equal(fullBooths.filter((entry) => entry.session === "afternoon").length, 20);
  assert.equal(fullBooths[0].label, "08:00–08:09");
  assert.equal(fullBooths[20].label, "17:00–17:09");
  assert.equal(fullAgenda.filter((entry) => entry.kind === "sponsor_break").length, 12);
  const fullIntermission = fullAgenda.find((entry) => entry.kind === "intermission");
  assert.equal(fullIntermission?.kind === "intermission" ? fullIntermission.timeLabel : "", "13:00–17:00");
  for (let index = 1; index < fullAgenda.length; index += 1) {
    assert.ok(fullAgenda[index - 1].end <= fullAgenda[index].start, "the forty-showroom agenda never overlaps");
  }
  assert.throws(() => resolveFeaturedProgramSessions(MAX_FEATURED_SHOWROOMS + 1), /between 0 and 40/, "the agenda domain rejects an oversized featured floor");

  const adminId = Number(db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES(?,?,?,'admin')").run("schedule-admin@example.test", "hash", "Schedule Admin").lastInsertRowid);
  db.prepare("INSERT INTO discovery_industries(key,label,icon,position,active) VALUES('electronics','Electronics, electrical & appliances','circuit',1,1)").run();
  const scheduleBusinessNames = [
    "Alpha Workshop", "Beta Works", "Gamma Studio", "Delta Makers", "Epsilon Works", "Eta Studio",
    "Iota Factory", "Kappa Workshop", "Lambda Works", "Mu Makers", "Zeta Studio",
    ...Array.from({ length: 30 }, (_, index) => `Test Workshop ${String(index + 1).padStart(2, "0")}`),
  ];
  const businessIds = scheduleBusinessNames.map((name, index) => {
    const handle = `schedule-business-${index + 1}`;
    const businessId = Number(db.prepare("INSERT INTO businesses(handle,name,design_key,hero_image_path,status) VALUES(?,?,?,?,'active')").run(handle, name, "composition", `/heroes/${handle}.webp`).lastInsertRowid);
    db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'electronics')").run(businessId);
    db.prepare(`
      INSERT INTO business_discovery_profiles(
        business_id,booth_image_path,city,zone,region,latitude,longitude,
        fallback_style,is_featured,is_excluded,approved_at,updated_at
      ) VALUES(?,?,'Addis Ababa','Addis Ababa','Addis Ababa',9.03,38.75,'technical',0,0,?,?)
    `).run(businessId, `/booths/${handle}.webp`, Date.now(), Date.now());
    db.prepare("INSERT INTO products(business_id,name,slug,is_published) VALUES(?,?,?,1)").run(businessId, `${name} offering`, "primary-offering");
    return businessId;
  });

  const parsedPolicy = featuredProgramPolicyFromForm({
    morningStart: "08:00",
    morningEnd: "13:00",
    afternoonStart: "17:00",
    afternoonEnd: "22:00",
    changeoverMinutes: "5",
    sponsorBreakEvery: "3",
    sponsorBreakMinutes: "10",
    sponsorBreakLabel: "Partner message",
    intermissionLabel: "Lunch and program break",
  });
  await updateFeaturedProgramPolicy(parsedPolicy, adminId, settingsPort);
  assert.equal((await getFeaturedProgramPolicy(settingsPort)).sponsorBreakLabel, "Partner message");

  const eligible = await listFeaturedProgramEligibleBusinesses("electronics", settingsPort);
  assert.equal(eligible.length, 41);
  assert.deepEqual(eligible.slice(0, 3).map((business) => business.name), ["Alpha Workshop", "Beta Works", "Delta Makers"]);
  await saveFeaturedProgramDay({
    dateIso: "2026-08-11",
    mode: "manual",
    businessIds: [businessIds[2], businessIds[0]],
    eligibleBusinessIds: businessIds,
    actorUserId: adminId,
  }, settingsPort);
  assert.deepEqual(await getFeaturedProgramDaySelection("2026-08-11", settingsPort), {
    dateIso: "2026-08-11",
    mode: "manual",
    businessIds: [businessIds[2], businessIds[0]],
  });

  await assert.rejects(
    saveFeaturedProgramDay({
      dateIso: "2026-08-11",
      mode: "manual",
      businessIds: [999999],
      eligibleBusinessIds: businessIds,
      actorUserId: adminId,
    }, settingsPort),
    FeaturedProgramSettingsError,
  );
  assert.deepEqual((await getFeaturedProgramDaySelection("2026-08-11", settingsPort)).businessIds, [businessIds[2], businessIds[0]], "a rejected lineup leaves the retained order unchanged");

  await assert.rejects(
    saveFeaturedProgramDay({
      dateIso: "2026-08-11",
      mode: "manual",
      businessIds,
      eligibleBusinessIds: businessIds,
      actorUserId: adminId,
    }, settingsPort),
    /no more than 40/,
  );
  assert.deepEqual((await getFeaturedProgramDaySelection("2026-08-11", settingsPort)).businessIds, [businessIds[2], businessIds[0]], "an oversized lineup leaves the retained order unchanged");

  const automatic = await saveFeaturedProgramDay({
    dateIso: "2026-08-11",
    mode: "automatic",
    businessIds: [],
    eligibleBusinessIds: businessIds,
    actorUserId: adminId,
  }, settingsPort);
  assert.equal(automatic.participantCount, MAX_FEATURED_SHOWROOMS, "automatic mode reports only its supported capacity");
  assert.deepEqual(await getFeaturedProgramDaySelection("2026-08-11", settingsPort), { dateIso: "2026-08-11", mode: "automatic", businessIds: [] });
  assert.equal(Number((db.prepare("SELECT COUNT(*) total FROM featured_program_lineup").get() as { total: number }).total), 0, "automatic restoration removes the retained lineup");

  console.log("Daily Featured schedule policy, agenda, migration, and atomic override tests passed.");
  } finally {
    db.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

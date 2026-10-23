import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getDb, closeDbForTests } from "./testing/postgres-fixture";
import { automaticFeaturedLineup, buildFeaturedProgramAgenda, DEFAULT_FEATURED_PROGRAM_POLICY, featuredBroadcastPhase, featuredProgramDisplayOrder, MAX_FEATURED_SHOWROOMS, resolveFeaturedProgramSessions, type FeaturedBoothWalkthrough, type FeaturedProgramBreak, } from "../lib/featured-program";
import { FeaturedProgramSettingsError, getFeaturedProgramDaySelection, getFeaturedProgramPolicy, getFeaturedProgramCacheVersion, listFeaturedProgramEligibleBusinesses, saveFeaturedProgramDay, type FeaturedProgramWritePort, } from "../lib/featured-program-settings";
import {getFeaturedShowroomsView} from "../lib/discovery";
import type { RuntimeSqlValue } from "../lib/runtime-sql";
const featuredUiSource = fs.readFileSync(path.join(process.cwd(), "components/FeaturedShowroomsWorkspace.tsx"), "utf8");
const featuredBroadcastHeaderSource = fs.readFileSync(path.join(process.cwd(), "lib/featured-broadcast-header.ts"), "utf8");
const discoveryCssSource = fs.readFileSync(path.join(process.cwd(), "app/discovery.css"), "utf8");
const lineupSelectorSource = fs.readFileSync(path.join(process.cwd(), "components/FeaturedLineupSelector.tsx"), "utf8");
const featuredAdminSource = fs.readFileSync(path.join(process.cwd(), "app/dashboard/admin/featured-schedule/page.tsx"), "utf8");
assert.match(featuredUiSource, /function TodayProgramSchedule/);
assert.match(featuredUiSource, /featuredBroadcastHeader\(/, "the web header uses the shared scheduled-state presentation");
assert.match(featuredBroadcastHeaderSource, /Scheduled TikTok Live window is open/);
assert.doesNotMatch(featuredBroadcastHeaderSource, /Now broadcasting/);
assert.match(featuredUiSource, /t\("Today's schedule"\)/);
assert.match(featuredUiSource, /if \(!featured\.isToday\) return null/);
assert.match(featuredUiSource, /featured\.booths\[slot - 1\]/, "public schedule names resolve from the same authoritative booth lineup");
assert.match(featuredUiSource, /entry\.kind === "booth" \|\| entry\.kind === "sponsor_break"/, "visitor schedule includes presentations and sponsor breaks without an expanded changeover wall");
assert.match(discoveryCssSource, /\.featured-agenda-body/);
assert.match(discoveryCssSource, /max-height:\s*min\(470px, 58dvh\)/, "the opened phone schedule remains bounded");
assert.match(lineupSelectorSource, /disabled=\{!selected && capacityReached\}/, "the admin selector prevents a seventh browser selection");
assert.match(lineupSelectorSource, /t\("Daily Featured accepts up to \{limit\} pages\."\s*,\s*\{limit\}\)/, "the admin selector explains the capacity");
assert.match(featuredAdminSource, /sponsorForSlot\(entry\.sponsorSlot\)\?\.name/, "the internal agenda names each scheduled sponsor placement");
assert.match(featuredUiSource, /Sponsor spotlight/, "the public schedule and live rail disclose the active sponsor segment");
async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-featured-schedule-"));
    const db = await getDb();
    try {
        const settingsPort: FeaturedProgramWritePort = {
            async get<T>(sql: string, values: readonly RuntimeSqlValue[] = []) { return await db.prepare(sql).get(...values) as T | undefined; },
            async all<T>(sql: string, values: readonly RuntimeSqlValue[] = []) { return await db.prepare(sql).all(...values) as T[]; },
            async run(sql: string, values: readonly RuntimeSqlValue[] = []) { return await db.prepare(sql).run(...values); },
            async transaction<T>(operation: () => Promise<T>) {
                return db.runner.transaction(operation);
            },
        };
        assert.ok(await db.prepare("SELECT 1 FROM schema_migrations WHERE version=32").get(), "migration 32 is recorded");
        assert.deepEqual(await getFeaturedProgramPolicy(), DEFAULT_FEATURED_PROGRAM_POLICY, "historical DB policy cannot restore morning sessions");
        const date="2026-08-10", start=Date.parse(date+"T20:30:00+03:00"), end=Date.parse("2026-08-11T00:00:00+03:00");
        for(let count=0;count<=6;count++) {
          const agenda=buildFeaturedProgramAgenda(date,count,start);
          assert.equal(agenda.filter(entry=>entry.kind==='booth').length,count);
          if(!count){assert.deepEqual(agenda,[]);continue;}
          assert.equal(agenda[0].start,start);assert.ok(agenda.at(-1)!.end<=end);
          assert.equal(agenda.filter(entry=>entry.kind==='sponsor_break').length,4);
          assert.deepEqual(agenda.filter((entry):entry is FeaturedProgramBreak=>entry.kind==='sponsor_break').map(entry=>entry.sponsorSlot),[1,2,3,4]);
          assert.ok(agenda.every(entry=>entry.session==='evening'));
          for(let i=0;i<agenda.length;i++) {
            const entry=agenda[i];assert.ok(entry.end>entry.start);
            assert.equal(entry.end-entry.start,(entry.kind==='booth'?30:5)*60000);
            if(i)assert.equal(agenda[i-1].end,entry.start);
            const atBoundary=buildFeaturedProgramAgenda(date,count,entry.start);
            assert.equal(atBoundary.filter(row=>row.current).length,1);
            assert.equal(atBoundary[i].current,true);
          }
        }
        const agenda=buildFeaturedProgramAgenda(date,6,start),booths=agenda.filter((entry):entry is FeaturedBoothWalkthrough=>entry.kind==='booth');
        assert.equal(agenda.at(-1)!.end,end);assert.equal(agenda.filter(entry=>entry.kind==='changeover').length,2);
        const last=agenda.at(-1)!;assert.equal(last.kind==='sponsor_break'?last.timeLabel:'','11:55 PM–12:00 AM');
        assert.equal(featuredBroadcastPhase(date,6,start-1),'scheduled');assert.equal(featuredBroadcastPhase(date,6,start),'live');assert.equal(featuredBroadcastPhase(date,6,end),'ended');
        assert.ok(!buildFeaturedProgramAgenda(date,6,end).some(entry=>entry.current));
        assert.equal(booths[0].label,'8:30 PM–9:00 PM');
        assert.deepEqual(featuredProgramDisplayOrder(booths,booths[1].start),[2,3,4,5,6,1]);
        assert.deepEqual(featuredProgramDisplayOrder(booths,booths[1].end),[2,3,4,5,6,1]);
        assert.deepEqual(resolveFeaturedProgramSessions(6),{evening:{session:'evening',startMinute:1230,endMinute:1440,boothCount:6}});
        for(const invalid of [-1,7,1.5,NaN])assert.throws(()=>buildFeaturedProgramAgenda(date,invalid,start));
        assert.throws(()=>buildFeaturedProgramAgenda('2026-02-30',6,start));
        assert.throws(()=>buildFeaturedProgramAgenda(date,6,NaN));
        const pool=Array.from({length:13},(_,i)=>i+1);
        assert.deepEqual(automaticFeaturedLineup(date,pool),automaticFeaturedLineup(date,pool));
        assert.equal(new Set(automaticFeaturedLineup(date,pool)).size,6);
        assert.notDeepEqual(automaticFeaturedLineup(date,pool),automaticFeaturedLineup('2026-08-17',pool));
        const reached=new Set(Array.from({length:13},(_,i)=>automaticFeaturedLineup(new Date(Date.parse(date)+i*7*86400000).toISOString().slice(0,10),pool)).flat());
        assert.equal(reached.size,13);assert.deepEqual(automaticFeaturedLineup(date,[]),[]);
        assert.equal(automaticFeaturedLineup(date,[1,2]).length,2);
        const adminId = Number((await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES(?,?,?,'admin')").run("schedule-admin@example.test", "hash", "Schedule Admin")).insertedId);
        await db.prepare("INSERT INTO discovery_industries(key,label,icon,position,active) VALUES('electronics','Electronics, electrical & appliances','circuit',1,1) ON CONFLICT(key) DO NOTHING").run();
        const scheduleBusinessNames = [
            "Alpha Workshop", "Beta Works", "Gamma Studio", "Delta Makers", "Epsilon Works", "Eta Studio",
            "Iota Factory", "Kappa Workshop", "Lambda Works", "Mu Makers", "Zeta Studio",
            ...Array.from({ length: 30 }, (_, index) => `Test Workshop ${String(index + 1).padStart(2, "0")}`),
        ];
        const businessIds = await Promise.all(scheduleBusinessNames.map(async (name, index) => {
            const handle = `schedule-business-${index + 1}`;
            const businessId = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,hero_image_path,status) VALUES(?,?,?,?,'active')").run(handle, name, "composition", `/heroes/${handle}.webp`)).insertedId);
            await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'electronics')").run(businessId);
            await db.prepare(`
      INSERT INTO business_discovery_profiles(
        business_id,booth_image_path,city,zone,region,latitude,longitude,
        fallback_style,is_featured,is_excluded,approved_at,updated_at
      ) VALUES(?,?,'Addis Ababa','Addis Ababa','Addis Ababa',9.03,38.75,'technical',0,0,?,?)
    `).run(businessId, `/booths/${handle}.webp`, Date.now(), Date.now());
            await db.prepare("INSERT INTO products(business_id,name,slug,is_published) VALUES(?,?,?,1)").run(businessId, `${name} offering`, "primary-offering");
            return businessId;
        }));
        const eligible = await listFeaturedProgramEligibleBusinesses("electronics", settingsPort);
        assert.equal(eligible.length, 41);
        assert.deepEqual(eligible.slice(0, 3).map((business) => business.name), ["Alpha Workshop", "Beta Works", "Delta Makers"]);
        const projectionOptions={featuredDay:1,now:new Date('2026-08-10T21:00:00+03:00'),readPort:settingsPort};
        const autoView=await getFeaturedShowroomsView(projectionOptions);
        assert.deepEqual(autoView.featured.booths.flatMap(booth=>booth.revealed?[booth.showroom.id]:[]),automaticFeaturedLineup('2026-08-10',eligible).map(row=>row.id),'Admin and public share automatic order');
        const autoVersion=await getFeaturedProgramCacheVersion(projectionOptions.now,settingsPort);
        await saveFeaturedProgramDay({dateIso:'2026-08-10',mode:'manual',businessIds:[businessIds[2],businessIds[0]],eligibleBusinessIds:businessIds,actorUserId:adminId},settingsPort);
        assert.notEqual(await getFeaturedProgramCacheVersion(projectionOptions.now,settingsPort),autoVersion);
        const manualView=await getFeaturedShowroomsView(projectionOptions);
        assert.deepEqual(manualView.featured.booths.flatMap(booth=>booth.revealed?[booth.showroom.id]:[]),[businessIds[2],businessIds[0]]);
        await saveFeaturedProgramDay({dateIso:'2026-08-10',mode:'automatic',businessIds:[],eligibleBusinessIds:businessIds,actorUserId:adminId},settingsPort);
        assert.deepEqual((await getFeaturedShowroomsView(projectionOptions)).featured.booths,autoView.featured.booths);
        assert.equal(await getFeaturedProgramCacheVersion(projectionOptions.now,settingsPort),autoVersion);
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
        await assert.rejects(saveFeaturedProgramDay({
            dateIso: "2026-08-11",
            mode: "manual",
            businessIds: [999999],
            eligibleBusinessIds: businessIds,
            actorUserId: adminId,
        }, settingsPort), FeaturedProgramSettingsError);
        assert.deepEqual((await getFeaturedProgramDaySelection("2026-08-11", settingsPort)).businessIds, [businessIds[2], businessIds[0]], "a rejected lineup leaves the retained order unchanged");
        await assert.rejects(saveFeaturedProgramDay({
            dateIso: "2026-08-11",
            mode: "manual",
            businessIds,
            eligibleBusinessIds: businessIds,
            actorUserId: adminId,
        }, settingsPort), /no more than 6/);
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
        assert.equal(Number((await db.prepare("SELECT COUNT(*) total FROM featured_program_lineup").get() as {
            total: number;
        }).total), 0, "automatic restoration removes the retained lineup");
        console.log("Daily Featured schedule policy, agenda, migration, and atomic override tests passed.");
    }
    finally {
        await db.close();
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

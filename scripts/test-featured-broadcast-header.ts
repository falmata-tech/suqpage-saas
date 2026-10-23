import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { createUiText, type UiMessages } from "../lib/i18n/core";
import { publicLiveLink } from "../lib/public-live-link";
import { DEFAULT_FEATURED_PROGRAM_POLICY } from "../lib/featured-program";
import { featuredBroadcastHeader } from "../lib/featured-broadcast-header";

const catalogs = Object.fromEntries(["en", "am", "om"].map(locale => [
  locale,
  locale === "en" ? {} : JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`, "utf8")) as UiMessages,
]));
const start = Date.parse("2026-10-21T20:30:00+03:00");
const day = { dateIso: "2026-10-21", dayLabel: "Wednesday", isToday: true };
const tiktok = publicLiveLink("https://www.tiktok.com/@mirtpage", "tiktok");
const youtube = publicLiveLink("https://www.youtube.com/@mirtpage", "youtube");

for (const locale of ["en", "am", "om"] as const) {
  test(`FE-021 S159 ${locale}: broadcast header names the scheduled phase and localized next action`, () => {
    const t = createUiText(catalogs[locale]);
    const scheduled = featuredBroadcastHeader({ day, boothCount: 6, now: start - 1, policy: DEFAULT_FEATURED_PROGRAM_POLICY, tiktokUrl: tiktok, youtubeUrl: youtube, t });
    assert.match(scheduled.title, locale === "en" ? /TikTok Live is scheduled for 8:30 PM EAT today/ : /.+/);
    assert.match(scheduled.detail, /8:30 PM/);
    assert.equal(scheduled.actionLabel, t("Open TikTok"));

    const inWindow = featuredBroadcastHeader({ day, boothCount: 6, now: start, policy: DEFAULT_FEATURED_PROGRAM_POLICY, tiktokUrl: tiktok, youtubeUrl: youtube, t });
    assert.equal(inWindow.title, t("Scheduled TikTok Live window is open"));
    assert.equal(inWindow.note, t("Open TikTok to see whether the stream is live"));
    assert.equal(inWindow.actionLabel, t("Check TikTok Live"));
    assert.equal(inWindow.href, tiktok);
    assert.equal(inWindow.phase, "window");

    const ended = featuredBroadcastHeader({ day, boothCount: 6, now: Date.parse("2026-10-22T00:00:00+03:00"), policy: DEFAULT_FEATURED_PROGRAM_POLICY, tiktokUrl: tiktok, youtubeUrl: youtube, t });
    assert.equal(ended.title, t("Today's featured program has ended"));
    assert.equal(ended.actionLabel, t("View recordings"));
    assert.equal(ended.href, youtube);

    const empty = featuredBroadcastHeader({ day, boothCount: 0, now: start, policy: DEFAULT_FEATURED_PROGRAM_POLICY, tiktokUrl: tiktok, youtubeUrl: youtube, t });
    assert.equal(empty.phase, "empty");
    assert.equal(empty.title, t("No businesses are scheduled today"));
    assert.equal(empty.href, "");
  });
}

test("FE-021 S159: schedule is not a claim that an external stream has been verified", () => {
  const t = createUiText(catalogs.en);
  const status = featuredBroadcastHeader({ day, boothCount: 6, now: start, policy: DEFAULT_FEATURED_PROGRAM_POLICY, tiktokUrl: "", youtubeUrl: "", t });
  assert.equal(status.title, "Scheduled TikTok Live window is open");
  const scheduledWithoutLink = featuredBroadcastHeader({ day, boothCount: 6, now: start - 1, policy: DEFAULT_FEATURED_PROGRAM_POLICY, tiktokUrl: "", youtubeUrl: "", t });
  assert.equal(scheduledWithoutLink.title, "TikTok Live is scheduled for 8:30 PM EAT today");
  assert.equal(status.note, "");
  assert.equal(status.actionLabel, "");
  assert.equal(status.href, "");
  assert.equal(publicLiveLink("https://tiktok.com.evil.example/@mirtpage", "tiktok"), "");
  assert.equal(publicLiveLink("http://www.tiktok.com/@mirtpage", "tiktok"), "");
  assert.equal(publicLiveLink("https://www.youtube.com.evil.example/@mirtpage", "youtube"), "");
});

test("FE-021 S159: future and past weekly days use their own schedule wording without exposing business identity", () => {
  const t = createUiText(catalogs.en);
  const future = featuredBroadcastHeader({ day: { dateIso: "2026-10-22", dayLabel: "Thursday", isToday: false }, boothCount: 6, now: start, policy: DEFAULT_FEATURED_PROGRAM_POLICY, tiktokUrl: tiktok, youtubeUrl: youtube, t });
  assert.equal(future.title, "Featured program for Thursday");
  assert.equal(future.detail, "Starts at 8:30 PM EAT");
  assert.equal(future.phase, "scheduled");
  const past = featuredBroadcastHeader({ day: { dateIso: "2026-10-20", dayLabel: "Tuesday", isToday: false }, boothCount: 6, now: start, policy: DEFAULT_FEATURED_PROGRAM_POLICY, tiktokUrl: tiktok, youtubeUrl: youtube, t });
  assert.equal(past.title, "This featured program day has passed");
});

import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, expect } from "@playwright/test";
const out = ".local/mobile-marker-review";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errors = [];
  await context.route("https://tile.openstreetmap.org/**", r => r.fulfill({contentType: "image/png",
    body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=", "base64")}));
  const shops = [1,2].map(id => ({id, handle:`fixture-shop-${id}`, name:`Fixture Shop ${id}`, description:"Fixture details", heroImagePath:"",
    city:"Addis Ababa", region:"Addis Ababa", latitude:9.03, longitude:39.7, locationMode:"storefront", isLive:id===1, isFeatured:id===2}));
  await context.route("**/api/mobile/v1/market?**", r => r.fulfill({json:{items:[], showrooms:shops, categories:[], places:[], page:1,pages:1,total:2,
    nearbyGroups:[{key:"fixture",city:"Addis Ababa",latitude:9.03,longitude:39.7,showroomIds:[1,2]}]}}));
  const page = await context.newPage();
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", e => { if(e.type()==="error" && e.text().includes("unmount a root")) errors.push(e.text()); });
  await page.goto("http://localhost:8082");
  const cluster = page.getByRole("button", {name:"2 nearby businesses",exact:true});
  await expect(cluster).toBeVisible({timeout:30000});
  await expect(cluster.getByText("Featured",{exact:true})).toBeVisible();
  await page.screenshot({path:out+"/cluster-phone.png"});
  await cluster.click();
  await expect(page.locator('[aria-label="Business map"]')).toHaveAttribute("data-map-zoom","14");
  await expect(cluster.getByText("Nearby",{exact:true})).toBeVisible();
  await cluster.click();
  await page.getByRole("button",{name:"Fixture Shop 1",exact:true}).click();
  await expect(page.getByRole("button",{name:"Explore this business",exact:true})).toBeVisible();
  await expect(page.getByText("Fixture Shop 1",{exact:true})).toBeVisible();
  await expect(page.locator('[aria-label="Business map"]')).toHaveAttribute("data-map-zoom","14");
  await page.screenshot({path:out+"/nearby-preview-phone.png"});
  await page.getByRole("button",{name:"Close",exact:true}).last().click();
  await page.getByRole("tab",{name:"About",exact:true}).click();
  await page.getByRole("tab",{name:"Market",exact:true}).click();
  assert.deepEqual(errors,[]);
  console.log("Marker browser checks pass: counted featured cluster, expansion, nearby list, preview, no zoom-out and clean remount.");
} finally { await browser.close(); }

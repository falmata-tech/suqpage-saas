import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, expect } from "@playwright/test";
import { enabledLocales as ACTIVE_LOCALES } from "../lib/i18n/core.ts";
import { PLATFORM_BRAND } from "../lib/brand.ts";
import { installMapTileFixture } from "./testing/map-tile-fixture.mjs";

const base = process.env.SUQPAGE_TEST_BASE_URL || "http://127.0.0.1:3102";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname), "Local visual review only");
const output = process.env.SUQPAGE_VISUAL_OUTPUT || ".local/mobile-brand-review";
fs.mkdirSync(output, { recursive: true, mode: 0o700 });
const results = [];
const proof={passed:false,functionalComplete:false,browserMode:process.env.SUQPAGE_BROWSER_HEADLESS==='1'?'installed Google Chrome headless':'installed Google Chrome headed',results,lifecycle:[],unexpectedLifecycle:[],runtimeErrors:[],consoleErrors:[],requestFailures:[],expectedNavigationAborts:[],apiFailures:[],unexpectedWrites:[],analyticsControls:[],tileFixtures:[],limits:['Synthetic tiles prove geometry, not public-provider availability.','Cookie-selected locale snapshots are not language-selector interaction proof.','Optional existing protected storage state supplies workspace setup; no credentials are written by this capture.']};
let browser,teardown=false,currentStage='preflight',currentPage;
const save=()=>fs.writeFileSync(`${output}/verified.json`,JSON.stringify(proof,null,2),{mode:0o600});
const lifecycle=(event,detail={})=>{proof.lifecycle.push({at:new Date().toISOString(),event,stage:currentStage,...detail});save();};
const deadline=setTimeout(()=>{proof.deadlineExceeded=true;lifecycle('deadline.exceeded');void browser?.close();},600000);deadline.unref();
const shop = process.env.SUQPAGE_TEST_SHOP || "demo-aloe-field-care";
const publicRoutes = ["/", "/featured", "/about", "/login", `/@${shop}`];
const state = process.env.SUQPAGE_TEST_STORAGE_STATE;
const routes = state ? [...publicRoutes.filter(route => route !== "/login"), "/dashboard/products"] : publicRoutes;
try {
  browser=await chromium.launch({channel:'chrome',headless:process.env.SUQPAGE_BROWSER_HEADLESS==='1'});
  proof.browserVersion=browser.version();lifecycle('browser.launched');
  browser.on('disconnected',()=>{if(!teardown)proof.unexpectedLifecycle.push({event:'browser.disconnected',stage:currentStage});lifecycle('browser.disconnected',{planned:teardown});});
  for (const width of [320, 390, 1440]) {
    for (const locale of ACTIVE_LOCALES) {
      let plannedClose=false;
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: "reduce",serviceWorkers:'block', ...(state ? { storageState: state } : {}) });
      context.on('close',()=>{if(!plannedClose&&!teardown)proof.unexpectedLifecycle.push({event:'context.close',stage:currentStage});lifecycle('context.closed',{planned:plannedClose||teardown});});
      await context.route('**/*',route=>{const request=route.request(),url=new URL(request.url());if(url.origin===base&&['/api/analytics/visit','/api/events','/api/public-events'].includes(url.pathname)){proof.analyticsControls.push({path:url.pathname,method:request.method(),status:204});return route.fulfill({status:204});}if(url.origin===base&&url.pathname.startsWith('/api/')&&!['GET','HEAD','OPTIONS'].includes(request.method())){proof.unexpectedWrites.push({stage:currentStage,path:url.pathname,method:request.method()});return route.abort('blockedbyclient');}return route.continue();});
      const tiles=await installMapTileFixture(context);
      await context.addCookies([{ name: "suqpage-language", value: locale, url: base }]);
      const page = await context.newPage();
      currentPage=page;lifecycle('page.created',{width,locale});
      page.on('close',()=>{if(!plannedClose&&!teardown)proof.unexpectedLifecycle.push({event:'page.close',stage:currentStage});lifecycle('page.closed',{planned:plannedClose||teardown});});
      page.on('crash',()=>{proof.unexpectedLifecycle.push({event:'page.crash',stage:currentStage});lifecycle('page.crashed');});
      const errors = [];
      page.on("pageerror", error => {errors.push(error.message);proof.runtimeErrors.push({stage:currentStage,message:error.message});});
      page.on('console',message=>{if(message.type()==='error')proof.consoleErrors.push({stage:currentStage,message:message.text()});});
      page.on('requestfailed',request=>{const url=new URL(request.url());if(url.origin!==base||['/api/analytics/visit','/api/events','/api/public-events'].includes(url.pathname))return;const failure={stage:currentStage,path:url.pathname,method:request.method(),error:request.failure()?.errorText};if(currentStage.startsWith('/@')&&url.pathname==='/'&&failure.method==='GET'&&failure.error==='net::ERR_ABORTED')proof.expectedNavigationAborts.push(failure);else proof.requestFailures.push(failure);});
      page.on('response',response=>{const url=new URL(response.url());if(url.origin===base&&url.pathname.startsWith('/api/')&&response.status()>=400)proof.apiFailures.push({stage:currentStage,path:url.pathname,status:response.status()});});
      for (const route of locale === "en" ? routes : routes.filter(route => ["/", `/@${shop}`, "/dashboard/products"].includes(route))) {
        currentStage=`${route} ${width} ${locale}`;lifecycle('route.started');
        const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
        assert.equal(response.status(), 200);
        const shopPage = route.startsWith("/@");
        const dashboard = route.startsWith("/dashboard");
        const selector = dashboard ? (width <= 900 ? ".workspace-mobile-header" : ".sidebar") : (shopPage && width <= 680 ? ".showroom-host-bar-shell" : ".public-app-header");
        const header = page.locator(selector);
        const brand = header.locator(".suqpage-brand");
        await expect(brand).toBeVisible();
        await expect(brand.locator(".suqpage-wordmark")).toHaveText(PLATFORM_BRAND.name);
        const artwork=brand.locator('img').filter({visible:true});
        await expect(artwork).toHaveCount(1);
        await expect(artwork).toHaveAttribute('src',PLATFORM_BRAND.assets.wordmark);
        await expect(header.locator("select")).toBeVisible();
        await expect.poll(()=>artwork.evaluate(image=>image.complete&&image.naturalWidth>0)).toBe(true);
        const geometry=await header.evaluate(element=>{
          const brand=element.querySelector('.suqpage-brand').getBoundingClientRect();
          const image=[...element.querySelectorAll('.suqpage-brand img')].find(node=>node.getBoundingClientRect().width>0&&getComputedStyle(node).display!=='none');
          const art=image.getBoundingClientRect(),language=element.querySelector('select').getBoundingClientRect();
          return{brandTop:brand.top,brandRight:brand.right,languageLeft:language.left,brandHeight:brand.height,artRatio:art.width/art.height,artHeight:art.height,artCenter:art.top+art.height/2,brandCenter:brand.top+brand.height/2,sameRow:Math.abs(brand.top-language.top)<14,overflow:document.documentElement.scrollWidth>innerWidth+1};
        });
        assert.ok(!geometry.overflow,`${route} ${width} ${locale}: overflow`);
        assert.ok(geometry.brandTop>=0&&geometry.brandTop<80,'Brand visible immediately');
        assert.ok(geometry.brandHeight>=48,'Brand retains its touch target');
        assert.ok(Math.abs(geometry.artRatio-PLATFORM_BRAND.wordmark.width/PLATFORM_BRAND.wordmark.height)<.005,'Entire canonical outlined artwork scales uniformly');
        assert.ok(Math.abs(geometry.artCenter-geometry.brandCenter)<=1,'Artwork is centered in the target');
        const expectedHeight=shopPage&&width<=680?28:width<=(dashboard?900:680)?36:48;
        assert.equal(geometry.artHeight,expectedHeight,'Responsive scale preserves the canonical composition');
        // FE-070 parity scales the complete approved image consistently.
        if (width <= 680) {
          assert.ok(geometry.sameRow && geometry.brandRight <= geometry.languageLeft, "Brand and language fit in one row");
        }
        if (route === "/" && width <= 680) {
          const space = await page.evaluate(() => ({ content: document.querySelector(".public-market-experience").getBoundingClientRect().bottom, tabs: document.querySelector(".public-mobile-tabs").getBoundingClientRect().top }));
          assert.ok(space.content <= space.tabs + 1, "Market stays above bottom navigation");
        }
        if (route === "/") {
          const intro=await page.locator('.market-landing-introduction').evaluate(element=>{
            const heading=element.querySelector('h1').getBoundingClientRect(),description=element.querySelector('p').getBoundingClientRect();
            return {headingBottom:heading.bottom,descriptionTop:description.top,descriptionLeft:description.left,headingLeft:heading.left,overflow:description.right>innerWidth+1};
          });
          assert.ok(intro.descriptionTop>=intro.headingBottom&&Math.abs(intro.descriptionLeft-intro.headingLeft)<2&&!intro.overflow,'Supporting market copy sits below the headline without overflow');
        }
        if (route === "/about") {
          const footer=page.locator('footer').filter({hasText:'MarketVision Technology'});
          await expect(footer).toContainText('MarketVision Technology');
          await expect(footer).toContainText(locale==='am'?'ጅግጅጋ':locale==='om'?'Jigjiga':'Jigjiga');
          await footer.scrollIntoViewIfNeeded();
          await page.screenshot({path:`${output}/about-footer-${width}-${locale}.png`,caret:'initial'});
        }
        const label = `${dashboard ? "workspace" : shopPage ? "shop" : route.slice(1) || "market"}-${width}-${locale}`;
        if (locale === "en" || width === 320) await page.screenshot({ path: `${output}/${label}.png`,caret:'initial' });
        if (shopPage && locale === "en") {
          const back = page.locator(".showroom-host-back");
          await page.waitForFunction(element => Object.keys(element).some(key => key.startsWith("__reactProps$")), await back.elementHandle());
          await back.click();
          await expect(page).toHaveURL(url => url.origin === base && url.pathname === "/", { timeout: 15000 });
        }
        results.push({ route, width, locale });
        save();
      }
      assert.deepEqual(errors, []);
      tiles.assertNoExternalRequests();proof.tileFixtures.push({width,locale,fixture:tiles.fixtureId,served:tiles.servedCount(),external:tiles.externalCount()});
      plannedClose=true;lifecycle('context.close.requested');await context.close();
    }
  }
  proof.functionalComplete=true;proof.workspaceVerified=Boolean(state);
  for(const key of['runtimeErrors','consoleErrors','requestFailures','apiFailures','unexpectedWrites','unexpectedLifecycle'])assert.deepEqual(proof[key],[],key);
  proof.passed=true;save();
  console.log(`${results.length} responsive brand checks passed; screenshots in ${output}. Workspace ${state ? "checked" : "requires authenticated storage state"}.`);
} catch(error){
  proof.failure={stage:currentStage,message:String(error)};process.exitCode=1;
  try{await currentPage?.screenshot({path:`${output}/failure.png`,caret:'initial'});}catch{}
} finally {
  clearTimeout(deadline);teardown=true;lifecycle('teardown.requested');
  await browser?.close();proof.browserClosed=true;lifecycle('teardown.completed');save();
}

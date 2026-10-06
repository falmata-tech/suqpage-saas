import assert from "node:assert/strict";
import crypto from "node:crypto";
import { getDb, closeDbForTests } from "./testing/postgres-fixture";
import { handleMobileRequest } from "../lib/mobile/router";
import type { NativeIdentityPort } from "../lib/mobile/http";
import { createPublicClientWorkspace } from "../lib/signup";
import { runtimeUserById } from "../lib/catalog-runtime";
async function main() {
  const db = await getDb();
  try {
    const a = await createPublicClientWorkspace(
      {
        name: "Native Owner",
        businessName: "Native Studio",
        businessCategory: "home-living",
        phone: "+251911222333",
        consent: true,
        idempotencyKey: crypto.randomUUID(),
      },
      { providerUserId: crypto.randomUUID(), email: "native-a@example.test" },
    );
    const b = await createPublicClientWorkspace(
      {
        name: "Other Owner",
        businessName: "Other Studio",
        businessCategory: "home-living",
        phone: "+251911222334",
        consent: true,
        idempotencyKey: crypto.randomUUID(),
      },
      { providerUserId: crypto.randomUUID(), email: "native-b@example.test" },
    );
    const actor = (await runtimeUserById(a.userId))!;
    const token = "local_mobile_test_owner_token_12345";
    const port: NativeIdentityPort = {
      verify: async (t) =>
        t === token ? { id: "subject", email: actor.email } : null,
      linked: async () => actor.id,
      user: async () => runtimeUserById(actor.id),
    };
    async function call(path: string, body?: unknown, authorized = true) {
      return handleMobileRequest(
        new Request("https://suqpage.com/api/mobile/v1/" + path, {
          method: body === undefined ? "GET" : "POST",
          headers: {
            ...(authorized ? { authorization: `Bearer ${token}` } : {}),
            ...(body !== undefined
              ? { "content-type": "application/json" }
              : {}),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
        path.split("?")[0].split("/"),
        { identity: port, invalidate() {} },
      );
    }
    let r = await call("owner/home", undefined, false);
    assert.equal(r.status, 401);
    assert.equal(r.headers.get("cache-control"), "private, no-store");
    r = await call("owner/home");
    assert.equal(r.status, 200);
    const home = await r.json();
    assert.equal(home.shop.id, a.businessId);
    assert.ok(home.shop.products.length > 0);
    assert.equal(home.shop.status, "draft");
    // Opening screens/images must not consume the separate save allowance.
    for (let i = 0; i < 52; i++) {
      assert.equal((await call("owner/home")).status, 200);
    }
    r = await call("owner/business", { businessId: b.businessId, name: "Bad" });
    assert.equal(r.status, 400);
    const foreign = (
      await db
        .prepare("SELECT id FROM products WHERE business_id=? LIMIT 1")
        .get(b.businessId)
    ).id;
    const form = new FormData();
    form.set(
      "details",
      JSON.stringify({
        name: "Stolen",
        description: "No",
        priceMinor: null,
        expectedContentVersion: home.shop.version,
        idempotencyKey: crypto.randomUUID(),
        offeringKind: "service",
      }),
    );
    r = await handleMobileRequest(
      new Request(
        "https://suqpage.com/api/mobile/v1/owner/products/" + foreign,
        {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
          body: form,
        },
      ),
      ["owner", "products", String(foreign)],
      { identity: port, invalidate() {} },
    );
    assert.equal(r.status, 404);
    r = await call("owner/page", {
      action: "save",
      version: home.draft.version,
      content: {
        ...home.draft.content,
        about: "Native edited business story.",
      },
    });
    assert.equal(r.status, 200);
    const saved = await r.json();
    assert.equal(saved.content.about, "Native edited business story.");
    r = await call("owner/page", {
      action: "save",
      version: home.draft.version,
      content: home.draft.content,
    });
    assert.equal(r.status, 409);
    r = await call("owner/support", {
      subject: "Mobile test",
      message: "Owner message",
      idempotencyKey: crypto.randomUUID(),
    });
    assert.equal(r.status, 200);
    const support = await r.json();
    r = await call("owner/support/" + support.id);
    assert.equal(r.status, 200);
    assert.equal((await r.json()).messages[0].body, "Owner message");

    // Multipart support files use the same scoped domain/storage workflow.
    const fileKey=crypto.randomUUID();
    const pdf=new Blob(["%PDF-1.4\nmobile fixture\n%%EOF"],{type:"application/pdf"});
    async function attach(bodyFile:Blob=pdf,identity=port){
      const form=new FormData();form.set("message","Attached fixture");form.set("idempotencyKey",fileKey);form.set("attachment",bodyFile,"fixture.pdf");
      return handleMobileRequest(new Request(`https://suqpage.com/api/mobile/v1/owner/support/${support.id}/attachments`,{method:"POST",headers:{authorization:`Bearer ${token}`},body:form}),["owner","support",String(support.id),"attachments"],{identity,invalidate(){}});
    }
    r=await attach();assert.equal(r.status,200);
    r=await attach();assert.equal(r.status,200);assert.equal((await r.json()).duplicate,true);
    r=await call("owner/support/"+support.id);const thread=await r.json();
    const attachment=thread.messages.find((m:{attachment:unknown})=>m.attachment)?.attachment;assert.ok(attachment?.id);assert.equal(attachment.originalName,"fixture.pdf");assert.equal(attachment.storageKey,undefined);
    r=await call(`owner/support/${support.id}/attachments/${attachment.id}`);assert.equal(r.status,200);assert.equal(r.headers.get("content-type"),"application/pdf");assert.equal(r.headers.get("cache-control"),"private, no-store");assert.match(await r.text(),/^%PDF-/);
    const otherPort={...port,user:async()=>runtimeUserById(b.userId)};
    r=await handleMobileRequest(new Request(`https://suqpage.com/api/mobile/v1/owner/support/${support.id}/attachments/${attachment.id}`,{headers:{authorization:`Bearer ${token}`}}),["owner","support",String(support.id),"attachments",String(attachment.id)],{identity:otherPort});assert.equal(r.status,404);
    r=await attach(pdf,otherPort);assert.equal(r.status,404);
    r=await attach(new Blob(["not a pdf"],{type:"application/pdf"}));assert.equal(r.status,400);
    const stored=await db.prepare("SELECT storage_key FROM support_attachments WHERE id=?").get(attachment.id);
    const {getMediaObjectStore}=await import("../lib/media-storage");await getMediaObjectStore().remove("support",[stored.storage_key]);

    const createKey = crypto.randomUUID();
    async function createOffering() {
      const form = new FormData();
      form.set(
        "details",
        JSON.stringify({
          name: "Native repair service",
          description: "Repair work booked by inquiry.",
          priceMinor: 5000,
          expectedContentVersion: home.shop.version,
          idempotencyKey: createKey,
          offeringKind: "service",
          isPublished: true,
          media: [],
        }),
      );
      return handleMobileRequest(
        new Request("https://suqpage.com/api/mobile/v1/owner/products", {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
          body: form,
        }),
        ["owner", "products"],
        { identity: port, invalidate() {} },
      );
    }
    r = await createOffering();
    assert.equal(r.status, 200);
    const offering = await r.json();
    assert.ok(offering.productId);
    r = await createOffering();
    assert.equal(r.status, 200);
    assert.equal((await r.json()).productId, offering.productId);
    assert.equal(
      Number(
        (
          await db
            .prepare(
              "SELECT COUNT(*) n FROM products WHERE business_id=? AND name=?",
            )
            .get(a.businessId, "Native repair service")
        ).n,
      ),
      1,
    );
    const ownId = home.shop.products[0].id;
    const currentHome = await (await call("owner/home")).json();
    const hidden = new FormData();
    hidden.set("details", JSON.stringify({ name: "Hidden owner item", description: "Kept for owner editing.",
      priceMinor: null, offeringKind: "service", availability: "unavailable", isPublished: false,
      expectedContentVersion: currentHome.shop.version, idempotencyKey: crypto.randomUUID() }));
    r = await handleMobileRequest(new Request(`https://suqpage.com/api/mobile/v1/owner/products/${ownId}`, {
      method: "POST", headers: { authorization: `Bearer ${token}` }, body: hidden,
    }), ["owner", "products", String(ownId)], { identity: port, invalidate() {} });
    assert.equal(r.status, 200);
    const hiddenItem = (await (await call("owner/home")).json()).shop.products.find((p: {id:number}) => p.id === ownId);
    assert.equal(hiddenItem.published, false);
    assert.equal(hiddenItem.availability, "unavailable");
    const videoKey = crypto.randomUUID();
    r = await call("owner/video", {
      target: "product",
      productId: ownId,
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      idempotencyKey: videoKey,
    });
    assert.equal(r.status, 200);
    assert.equal(
      (
        await db
          .prepare(
            "SELECT status FROM support_video_requests WHERE business_id=?",
          )
          .get(a.businessId)
      ).status,
      "pending",
    );
    r = await call("owner/video", {
      target: "product",
      productId: foreign,
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      idempotencyKey: crypto.randomUUID(),
    });
    assert.equal(r.status, 400);
    r = await call("shops/" + home.shop.handle, undefined, false);
    assert.equal(r.status, 404, "drafts remain private");
    await db
      .prepare("UPDATE businesses SET status='active' WHERE id=?")
      .run(a.businessId);
    r = await call("shops/" + home.shop.handle, undefined, false);
    assert.equal(r.status, 200);
    const publicShop = await r.json();
    assert.equal(publicShop.id, a.businessId);
    assert.ok(!JSON.stringify(publicShop).includes(actor.email));
    assert.equal(publicShop.contact_email, undefined);

    const inquiryKey = crypto.randomUUID();
    r = await call(
      "inquiries",
      {
        businessId: a.businessId,
        customerName: "Visitor",
        contactMethod: "phone",
        contact: "+251911222335",
        idempotencyKey: inquiryKey,
        items: [{ productId: offering.productId, quantity: "", options: {} }],
      },
      false,
    );
    assert.equal(r.status, 200);
    const inquiry = await r.json();
    assert.ok(inquiry.inquiryId);
    r = await call("owner/inquiries");
    assert.equal(r.status, 200);
    assert.ok(
      (await r.json()).items.some(
        (i: { id: number }) => i.id === inquiry.inquiryId,
      ),
    );
    r = await call("owner/inquiries/" + inquiry.inquiryId, {
      status: "contacted",
    });
    assert.equal(r.status, 200);
    assert.equal(
      (
        await db
          .prepare("SELECT status FROM inquiries WHERE id=?")
          .get(inquiry.inquiryId)
      ).status,
      "contacted",
    );
    const buyingKey = crypto.randomUUID();
    r = await call(
      "buying",
      {
        action: "start",
        name: "Visitor",
        phone: "+251911222335",
        message: "Please help find a desk",
        idempotencyKey: buyingKey,
      },
      false,
    );
    assert.equal(r.status, 200);
    const buying = await r.json();
    assert.ok(buying.token);
    assert.equal(buying.conversation.status, "waiting");
    const end = (publicRef: string) =>
      handleMobileRequest(
        new Request("https://suqpage.com/api/mobile/v1/buying", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "X-Suqpage-Buying-Session": buying.token,
          },
          body: JSON.stringify({ action: "close", publicRef }),
        }),
        ["buying"],
        { identity: port, invalidate() {} },
      );
    assert.equal((await end("foreign-reference")).status, 409);
    r = await end(buying.conversation.publicRef);
    assert.equal(r.status, 200);
    assert.equal((await r.json()).conversation.status, "closed");
    const origin = new Request("https://suqpage.com/api/mobile/v1/owner/home", {
      headers: {
        origin: "https://evil.test",
        authorization: `Bearer ${token}`,
      },
    });
    assert.equal(
      (await handleMobileRequest(origin, ["owner", "home"], { identity: port }))
        .status,
      403,
    );
    // Logo updates use persisted versions and tenant-owned media, never client refs.
    const sharp=(await import('sharp')).default;
    const png=await sharp({create:{width:2,height:2,channels:3,background:'#cc3300'}}).png().toBuffer();
    r=await call('owner/business');const businessBefore=await r.json();
    const logoDetails={name:businessBefore.business.name,expectedVersion:businessBefore.business.content_version,locationVersion:businessBefore.proposal?.version||0};
    async function saveLogo(details:Record<string,unknown>,file?:Blob){
      const form=new FormData();form.set('details',JSON.stringify(details));if(file)form.set('logo',file,'logo.png');
      return handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/owner/business',{method:'POST',headers:{authorization:`Bearer ${token}`},body:form}),['owner','business'],{identity:port,invalidate(){}});
    }
    const logoBlob=new Blob([new Uint8Array(png)],{type:'image/png'});
    r=await saveLogo({...logoDetails,removeLogo:true},logoBlob);assert.equal(r.status,400);
    r=await saveLogo({...logoDetails,businessId:b.businessId},logoBlob);assert.equal(r.status,400);
    r=await saveLogo(logoDetails,logoBlob);assert.equal(r.status,200);
    r=await call('owner/business');const withLogo=await r.json();
    assert.match(withLogo.business.logo_path,new RegExp(`^/media/product-private-${a.businessId}-`));
    r=await saveLogo(logoDetails,logoBlob);assert.equal(r.status,409);
    r=await saveLogo({...logoDetails,expectedVersion:withLogo.business.content_version,removeLogo:true});assert.equal(r.status,200);
    r=await call('owner/business');assert.equal((await r.json()).business.logo_path,'');
    await getMediaObjectStore().remove('pages',[withLogo.business.logo_path.slice('/media/'.length)]);
    let limited = false;
    for (let i = 0; i < 51; i++) {
      const status = (await call("nonexistent-write", {})).status;
      assert.ok(status === 404 || status === 429);
      if (status === 429) { limited = true; break; }
    }
    assert.equal(limited, true, "Write abuse remains bounded independently of reads");
    assert.equal((await call("owner/home")).status, 200);
    console.log(
      "Mobile API PostgreSQL checks passed: owner read/save/conflict, foreign product denial, support/video queue, draft privacy, public projection, buying close/history and origins.",
    );
  } finally {
    await closeDbForTests();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

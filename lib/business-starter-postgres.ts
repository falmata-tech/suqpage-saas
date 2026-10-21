import { parseAccentColor } from "./storefront-accent";
import type { PostgresTransactionRunner } from './postgres-runtime';
import { findPlaceSuggestions, findKnownPlace } from './place-catalog';
import { isBusinessCategoryKey, type BusinessCategoryKey } from './business-categories';
import { STARTER_IMAGE_ROOT, starterContacts } from './business-starter';
import {categoryStarter} from './category-starter';
import {normalizeDiscoveryCategories} from './discovery-contract';

/** Runs in the creation transaction; safe to retry, never backfills existing content. */
export async function initializeBusinessStarter(runner: PostgresTransactionRunner, input: {
  businessId: number; actorUserId: number; category: BusinessCategoryKey; notificationEmail: string; accentColor?: string; placeId?:string;
}): Promise<boolean> {
  if (!Number.isSafeInteger(input.businessId) || input.businessId < 1 || !Number.isSafeInteger(input.actorUserId)
    || !isBusinessCategoryKey(input.category)) throw new Error('Invalid starter workspace.');
  const accentColor = parseAccentColor(input.accentColor);
  return runner.transaction(async () => {
    const actor = await runner.query(`SELECT 1 FROM users u JOIN user_access_profiles p ON p.user_id=u.id
      WHERE u.id=? AND ((p.access_role='client' AND u.business_id=?) OR p.access_role IN ('platform_admin','operations_manager'))`, [input.actorUserId, input.businessId]);
    if (!actor.rows.length) throw new Error('Starter workspace access denied.');
    const locked = await runner.query<{ name: string; status: string; content_version: number; pristine: boolean }>(
      `SELECT name,status,content_version,(
        COALESCE(description,'')='' AND COALESCE(logo_path,'')='' AND COALESCE(hero_image_path,'')=''
        AND COALESCE(public_email,'')='' AND COALESCE(public_phone,'')='' AND COALESCE(whatsapp,'')=''
        AND COALESCE(telegram,'')='' AND COALESCE(tiktok,'')='' AND COALESCE(process_video_ref,'')=''
        AND COALESCE(site_description,'')='' AND COALESCE(favicon_path,'')='' AND COALESCE(tagline,'')=''
        AND COALESCE(hero_title,'')='' AND COALESCE(hero_subtitle,'')='' AND live_url='' AND is_live=0
      ) AS pristine FROM businesses WHERE id=? FOR UPDATE`, [input.businessId]);
    const business = locked.rows[0];
    if (!business) throw new Error('Starter workspace not found.');
    const existing = await runner.query(`SELECT 1 FROM owner_page_drafts WHERE business_id=?
      UNION ALL SELECT 1 FROM products WHERE business_id=? UNION ALL SELECT 1 FROM collections WHERE business_id=?
      UNION ALL SELECT 1 FROM categories WHERE business_id=? UNION ALL SELECT 1 FROM owner_location_proposals WHERE business_id=? LIMIT 1`, Array(5).fill(input.businessId));
    if (business.status !== 'draft' || Number(business.content_version) !== 1 || !business.pristine || existing.rows.length) return false;
    const now = Date.now();
    const place = input.placeId ? findKnownPlace(input.placeId) : findPlaceSuggestions('Addis Ababa')[0];
    if (!place) throw new Error('Starter place is unavailable.');
    const sample=categoryStarter(input.category,place.name);
    await runner.query(`UPDATE businesses SET tagline=?,description=?,logo_path=?,favicon_path=?,hero_title=?,hero_subtitle=?,hero_image_path=?,
      process_video_ref=?,public_email=?,public_phone=?,whatsapp=?,telegram=?,tiktok=?,site_title=?,site_description=?,
      contact_email=CASE WHEN contact_email='' THEN ? ELSE contact_email END,live_platform='youtube',live_url=? WHERE id=?`, [
      'Sample collection and made-to-order products', sample.page.about, `${STARTER_IMAGE_ROOT}/logo.png`, `${STARTER_IMAGE_ROOT}/logo.png`,
      business.name, 'Explore our work and tell us what you need.', sample.page.heroImage, sample.videoRef,
      starterContacts.email!, starterContacts.phone!, starterContacts.whatsapp!, starterContacts.telegram!, starterContacts.tiktok!,
      business.name, 'Sample business page. Browse our collection and made-to-order products, then ask us about the details.',
      input.notificationEmail, sample.page.videoUrl, input.businessId,
    ]);
    const collection = await runner.query<{ id: number }>(`INSERT INTO collections(business_id,name,slug,description)
      VALUES(?,'Sample collection','sample-collection','Example products, including items made to order. Replace these items with your own.') RETURNING id`, [input.businessId]);
    const collectionId = collection.rows[0].id;
    const category = await runner.query<{ id: number }>(`INSERT INTO categories(business_id,collection_id,name,slug)
      VALUES(?,?,'Sample offerings','sample-offerings') RETURNING id`, [input.businessId, collectionId]);
    for (const [index, offering] of sample.offerings.entries()) {
      const product = await runner.query<{ id: number }>(`INSERT INTO products(business_id,collection_id,category_id,name,slug,eyebrow,description,image_path,video_ref,
        price_minor,quantity_unit,highlights_json,offering_kind,quantity_mode,availability,is_published,sort_order)
        VALUES(?,?,?,?,?,'Editable example',?,?,?,?,?,?,?,'optional','available',1,?) RETURNING id`, [input.businessId, collectionId, category.rows[0].id,
        offering.name, offering.slug, offering.description, offering.image, sample.videoRef, offering.priceMinor, offering.unit,
        JSON.stringify(offering.highlights), offering.kind, index]);
      await runner.query('UPDATE products SET media_json=? WHERE id=?', [JSON.stringify([
        {kind:'image',ref:offering.image},{kind:'image',ref:offering.galleryImage},
        {kind:'video',ref:sample.videoRef},
      ]),product.rows[0].id]);
      if (offering.option && offering.values.length) {
      const group = await runner.query<{ id: number }>('INSERT INTO option_groups(product_id,name,position) VALUES(?,?,0) RETURNING id', [product.rows[0].id, offering.option]);
      for (const value of offering.values) await runner.query('INSERT INTO option_values(option_group_id,value) VALUES(?,?)', [group.rows[0].id, value]);
      }
    }
    await runner.query(`INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at) VALUES(?,1,?,0,?,?)`,
      [input.businessId, JSON.stringify({ ...sample.page, ...(accentColor ? { accentColor } : {}) }), input.actorUserId, now]);
    await runner.query("INSERT INTO owner_page_events(business_id,version,actor_user_id,kind,created_at) VALUES(?,1,?,'created',?)", [input.businessId, input.actorUserId, now]);
    await runner.query(`INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,location_mode,latitude,longitude,place_id,place_latitude,place_longitude,country_code,reviewed_version,updated_at)
      VALUES(?,1,?,?,?,'area',NULL,NULL,?,?,?,?,0,?)`, [input.businessId, input.category, place.name, place.region, place.id, place.latitude, place.longitude, place.countryCode, now]);
    if(input.placeId) {
      // New public signup supplied a server-known city. Map placement remains an
      // approximate area; the private sample does not become public automatically.
      for(const category of normalizeDiscoveryCategories(input.category))
        await runner.query('INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)',[input.businessId,category]);
      await runner.query(`INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at,country_code,city_id)
        VALUES(?,?,?,?,?,?,?,?,?,?)`,[input.businessId,place.name,place.name,place.region,Math.round(place.latitude*10)/10,Math.round(place.longitude*10)/10,now,now,place.countryCode,place.id]);
      await runner.query('UPDATE owner_location_proposals SET reviewed_version=version WHERE business_id=?',[input.businessId]);
    }
    return true;
  });
}

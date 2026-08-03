function q(identifier: string) {
  if (!/^[a-z][a-z0-9_]*$/i.test(identifier)) {
    throw new Error("Invalid PostgreSQL identifier.");
  }
  return `"${identifier}"`;
}

export const POSTGRES_TRIGGER_NAMES = [
  "attached_request_cannot_become_public",
  "business_subscription_after_insert",
  "category_collection_same_business_insert",
  "category_collection_same_business_update",
  "delivery_inquiry_same_business_insert",
  "delivery_inquiry_same_business_update",
  "inquiry_item_same_business_insert",
  "product_category_same_business_insert",
  "product_category_same_business_update",
  "product_collection_same_business_insert",
  "product_collection_same_business_update",
  "public_request_attachment_denied",
  "public_request_attachment_move_denied",
  "submitted_revision_content_immutable",
] as const;

export function postgresTriggerDefinitions(schemaName: string) {
  const schema = q(schemaName);
  return `
CREATE FUNCTION ${schema}.deny_public_request_attachment() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM ${schema}.service_requests
    WHERE id = NEW.request_id AND submitter_kind = 'public'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'public interest requests cannot have attachments';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER public_request_attachment_denied
BEFORE INSERT ON ${schema}.request_attachments
FOR EACH ROW EXECUTE FUNCTION ${schema}.deny_public_request_attachment();

CREATE TRIGGER public_request_attachment_move_denied
BEFORE UPDATE OF request_id ON ${schema}.request_attachments
FOR EACH ROW EXECUTE FUNCTION ${schema}.deny_public_request_attachment();

CREATE FUNCTION ${schema}.deny_attached_request_becoming_public() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.submitter_kind = 'public' AND EXISTS (
    SELECT 1 FROM ${schema}.request_attachments WHERE request_id = NEW.id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'requests with attachments cannot become public interests';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER attached_request_cannot_become_public
BEFORE UPDATE OF submitter_kind ON ${schema}.service_requests
FOR EACH ROW EXECUTE FUNCTION ${schema}.deny_attached_request_becoming_public();

CREATE FUNCTION ${schema}.enforce_category_collection_business() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.collection_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM ${schema}.collections
    WHERE id = NEW.collection_id AND business_id = NEW.business_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'collection does not belong to business';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER category_collection_same_business_insert
BEFORE INSERT ON ${schema}.categories
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_category_collection_business();

CREATE TRIGGER category_collection_same_business_update
BEFORE UPDATE OF collection_id, business_id ON ${schema}.categories
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_category_collection_business();

CREATE FUNCTION ${schema}.enforce_product_collection_business() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.collection_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM ${schema}.collections
    WHERE id = NEW.collection_id AND business_id = NEW.business_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'collection does not belong to business';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER product_collection_same_business_insert
BEFORE INSERT ON ${schema}.products
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_product_collection_business();

CREATE TRIGGER product_collection_same_business_update
BEFORE UPDATE OF collection_id, business_id ON ${schema}.products
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_product_collection_business();

CREATE FUNCTION ${schema}.enforce_product_category_business() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM ${schema}.categories
    WHERE id = NEW.category_id AND business_id = NEW.business_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'category does not belong to business';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER product_category_same_business_insert
BEFORE INSERT ON ${schema}.products
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_product_category_business();

CREATE TRIGGER product_category_same_business_update
BEFORE UPDATE OF category_id, business_id ON ${schema}.products
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_product_category_business();

CREATE FUNCTION ${schema}.enforce_inquiry_item_business() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.product_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM ${schema}.inquiries i
    JOIN ${schema}.products p ON p.id = NEW.product_id
    WHERE i.id = NEW.inquiry_id AND i.business_id = p.business_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'product does not belong to inquiry business';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER inquiry_item_same_business_insert
BEFORE INSERT ON ${schema}.inquiry_items
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_inquiry_item_business();

CREATE FUNCTION ${schema}.enforce_delivery_inquiry_business() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.inquiry_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM ${schema}.inquiries
    WHERE id = NEW.inquiry_id AND business_id = NEW.business_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'inquiry does not belong to delivery business';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER delivery_inquiry_same_business_insert
BEFORE INSERT ON ${schema}.delivery_requests
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_delivery_inquiry_business();

CREATE TRIGGER delivery_inquiry_same_business_update
BEFORE UPDATE OF inquiry_id, business_id ON ${schema}.delivery_requests
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_delivery_inquiry_business();

CREATE FUNCTION ${schema}.enforce_submitted_revision_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status <> 'draft' THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'submitted revision content is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER submitted_revision_content_immutable
BEFORE UPDATE OF snapshot_json, snapshot_schema_version, summary,
  base_content_version, recipe_import_hash, recipe_metadata_json,
  recipe_imported_by_user_id, recipe_imported_at
ON ${schema}.content_revisions
FOR EACH ROW EXECUTE FUNCTION ${schema}.enforce_submitted_revision_immutable();

CREATE FUNCTION ${schema}.create_business_subscription() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  now_ms bigint := floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint;
BEGIN
  INSERT INTO ${schema}.business_subscriptions(
    business_id, plan_name, amount_minor, currency, starts_at,
    current_period_start, current_period_end, grace_ends_at, updated_at
  ) VALUES (
    NEW.id, 'MirtPage monthly', NULL, 'ETB', now_ms, now_ms,
    now_ms + 2592000000, now_ms + 2937600000, now_ms
  ) ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER business_subscription_after_insert
AFTER INSERT ON ${schema}.businesses
FOR EACH ROW EXECUTE FUNCTION ${schema}.create_business_subscription();
`;
}

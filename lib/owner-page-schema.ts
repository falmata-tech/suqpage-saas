// Native PostgreSQL owner-page schema.
export const OWNER_PAGE_SCHEMA_SQL = `
  CREATE TABLE owner_page_drafts (
    business_id INTEGER PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
    version INTEGER NOT NULL CHECK(version>=1),
    content_json TEXT NOT NULL CHECK(length(content_json)<=16000),
    assistance_enabled INTEGER NOT NULL DEFAULT 0 CHECK(assistance_enabled IN (0,1)),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    updated_at BIGINT NOT NULL
  );
  CREATE TABLE owner_page_events (
    business_id INTEGER NOT NULL REFERENCES owner_page_drafts(business_id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    actor_user_id INTEGER NOT NULL REFERENCES users(id),
    kind TEXT NOT NULL CHECK(kind IN ('created','content','consent_enabled','consent_revoked')),
    created_at BIGINT NOT NULL,
    PRIMARY KEY(business_id,version)
  );
`;

export const OWNER_PAGE_PUBLICATION_SCHEMA_SQL = `
  CREATE TABLE owner_page_publications (
    business_id INTEGER NOT NULL REFERENCES owner_page_drafts(business_id) ON DELETE CASCADE,
    revision INTEGER NOT NULL CHECK(revision>=1),
    draft_version INTEGER NOT NULL CHECK(draft_version>=1),
    content_json TEXT CHECK(content_json IS NULL OR length(content_json)<=16000),
    action TEXT NOT NULL CHECK(action IN ('publish','restore')),
    published_by INTEGER NOT NULL REFERENCES users(id),
    published_at BIGINT NOT NULL,
    CHECK(action='restore' OR content_json IS NOT NULL),
    PRIMARY KEY(business_id,revision)
  );
`;

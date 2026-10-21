export const PAGE_REVIEW_SCHEMA_SQL = `
CREATE TABLE owner_page_reviews (
 business_id INTEGER PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
 submission INTEGER NOT NULL CHECK(submission>=1),
 draft_version INTEGER NOT NULL CHECK(draft_version>=1),
 content_version INTEGER NOT NULL CHECK(content_version>=1),
 status TEXT NOT NULL CHECK(status IN ('pending','changes_requested','approved')),
 feedback TEXT NOT NULL DEFAULT '' CHECK(length(feedback)<=1000),
 submitted_by INTEGER NOT NULL REFERENCES users(id),
 submitted_at BIGINT NOT NULL,
 reviewed_by INTEGER REFERENCES users(id),
 reviewed_at BIGINT
);
CREATE INDEX owner_page_review_queue_idx ON owner_page_reviews(status,submitted_at,business_id);
`;

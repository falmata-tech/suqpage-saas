export const OWNER_BUSINESS_SCHEMA_SQL = `
CREATE TABLE owner_location_proposals (
 business_id INTEGER PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
 version INTEGER NOT NULL CHECK(version>=1),
 category_key TEXT NOT NULL,
 city TEXT NOT NULL CHECK(length(city) BETWEEN 1 AND 100),
 region TEXT NOT NULL CHECK(length(region) BETWEEN 1 AND 100),
 location_mode TEXT NOT NULL CHECK(location_mode IN ('area','storefront')),
 latitude DOUBLE PRECISION,
 longitude DOUBLE PRECISION,
 reviewed_version INTEGER NOT NULL DEFAULT 0 CHECK(reviewed_version>=0),
 updated_at BIGINT NOT NULL,
 CHECK((location_mode='area' AND latitude IS NULL AND longitude IS NULL) OR
 (location_mode='storefront' AND latitude BETWEEN 3 AND 15 AND longitude BETWEEN 32 AND 49 AND latitude IS NOT NULL AND longitude IS NOT NULL))
);
`;

export const OWNER_PLACE_ANCHOR_SCHEMA_SQL = `
ALTER TABLE owner_location_proposals
 ADD COLUMN place_id TEXT,
 ADD COLUMN place_latitude DOUBLE PRECISION,
 ADD COLUMN place_longitude DOUBLE PRECISION,
 ADD CONSTRAINT owner_location_place_anchor_check CHECK (
  (place_id IS NULL AND place_latitude IS NULL AND place_longitude IS NULL) OR
  (place_id IS NOT NULL AND length(place_id) BETWEEN 1 AND 100 AND
   place_latitude IS NOT NULL AND place_longitude IS NOT NULL AND
   place_latitude BETWEEN 3 AND 15 AND place_longitude BETWEEN 32 AND 49)
 );
`;

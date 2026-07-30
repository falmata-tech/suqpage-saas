import assert from "node:assert/strict";
import {
  HOMEPAGE_DIRECTORY_PAGE_SIZE,
  HOMEPAGE_FEATURED_LIMIT,
  buildHomepageFeaturedPool,
  paginateHomepageEntries,
} from "../lib/marketplace-home";

const entries = Array.from({ length: 23 }, (_, index) => ({ id: index + 1 }));
const firstPage = paginateHomepageEntries(entries, 1);
const finalPage = paginateHomepageEntries(entries, 99);

assert.equal(HOMEPAGE_DIRECTORY_PAGE_SIZE, 5);
assert.deepEqual(firstPage.entries.map((entry) => entry.id), [1, 2, 3, 4, 5]);
assert.equal(firstPage.totalPages, 5);
assert.equal(finalPage.page, 5);
assert.deepEqual(finalPage.entries.map((entry) => entry.id), [21, 22, 23]);
assert.equal(paginateHomepageEntries([], 1).totalPages, 0);

const featured = buildHomepageFeaturedPool(entries);
assert.equal(featured.length, HOMEPAGE_FEATURED_LIMIT);
assert.deepEqual(featured.map((entry) => entry.id), entries.slice(0, 10).map((entry) => entry.id));

console.log("Marketplace homepage domain tests passed.");

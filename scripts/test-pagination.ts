import assert from "node:assert/strict";
import {
  escapeLike,
  normalizePageRequest,
  normalizeSearch,
  pageHref,
  pageResult,
  pageWindow,
} from "../lib/pagination";

assert.deepEqual(normalizePageRequest({ page: "-9", pageSize: "500", search: " test " }), {
  page: 1,
  pageSize: 50,
  search: "test",
});
assert.equal(normalizePageRequest({ page: "3" }).page, 3);
assert.equal(normalizeSearch(`\u0000${"x".repeat(200)}`).length, 120);
assert.deepEqual(pageWindow(0, normalizePageRequest({ page: 99 })), {
  page: 1,
  totalPages: 1,
  limit: 20,
  offset: 0,
});
assert.deepEqual(pageWindow(41, normalizePageRequest({ page: 99 })), {
  page: 3,
  totalPages: 3,
  limit: 20,
  offset: 40,
});
assert.deepEqual(pageResult(["last"], 41, normalizePageRequest({ page: 99 })), {
  items: ["last"],
  totalItems: 41,
  page: 3,
  pageSize: 20,
  totalPages: 3,
  firstItem: 41,
  lastItem: 41,
});
assert.equal(escapeLike("100%_safe\\value"), "100\\%\\_safe\\\\value");
assert.equal(
  pageHref("/dashboard", { q: "metal work", page: 2, empty: "", absent: undefined }, "results"),
  "/dashboard?q=metal+work&page=2#results",
);

console.log("Pagination normalization, clamping, escaping, and URL tests passed.");

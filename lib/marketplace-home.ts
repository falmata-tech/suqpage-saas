export const HOMEPAGE_DIRECTORY_PAGE_SIZE = 5;
export const HOMEPAGE_FEATURED_LIMIT = 10;
export const HOMEPAGE_FEATURED_ADVANCE_MS = 4500;

export function paginateHomepageEntries<T>(entries: T[], requestedPage: number) {
  const totalPages = Math.ceil(entries.length / HOMEPAGE_DIRECTORY_PAGE_SIZE);
  const page = totalPages === 0
    ? 1
    : Math.min(Math.max(Math.trunc(requestedPage) || 1, 1), totalPages);
  const offset = (page - 1) * HOMEPAGE_DIRECTORY_PAGE_SIZE;

  return {
    entries: entries.slice(offset, offset + HOMEPAGE_DIRECTORY_PAGE_SIZE),
    page,
    totalPages,
  };
}

export function buildHomepageFeaturedPool<T>(entries: T[]) {
  return entries.slice(0, HOMEPAGE_FEATURED_LIMIT);
}

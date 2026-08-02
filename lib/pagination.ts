export const PUBLIC_PAGE_SIZE = 5;
export const WORKSPACE_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
export const MAX_SEARCH_LENGTH = 120;

export type PageRequest = {
  page: number;
  pageSize: number;
  search: string;
};

export type PageResult<T> = {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  firstItem: number;
  lastItem: number;
};

function integer(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizeSearch(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, MAX_SEARCH_LENGTH);
}

export function normalizePageRequest(
  input: { page?: unknown; pageSize?: unknown; search?: unknown },
  defaultPageSize = WORKSPACE_PAGE_SIZE,
): PageRequest {
  return {
    page: integer(input.page, 1),
    pageSize: Math.min(
      integer(input.pageSize, defaultPageSize),
      MAX_PAGE_SIZE,
    ),
    search: normalizeSearch(input.search),
  };
}

export function pageWindow(totalItems: number, request: PageRequest) {
  const totalPages = Math.max(1, Math.ceil(totalItems / request.pageSize));
  const page = Math.min(request.page, totalPages);
  return {
    page,
    totalPages,
    limit: request.pageSize,
    offset: (page - 1) * request.pageSize,
  };
}

export function pageResult<T>(
  items: T[],
  totalItems: number,
  request: PageRequest,
): PageResult<T> {
  const window = pageWindow(totalItems, request);
  const firstItem = totalItems === 0 ? 0 : window.offset + 1;
  return {
    items,
    totalItems,
    page: window.page,
    pageSize: request.pageSize,
    totalPages: window.totalPages,
    firstItem,
    lastItem: totalItems === 0 ? 0 : Math.min(window.offset + items.length, totalItems),
  };
}

export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function likePattern(value: string) {
  return `%${escapeLike(value.toLocaleLowerCase())}%`;
}

export function pageHref(
  pathname: string,
  values: Record<string, string | number | null | undefined>,
  hash?: string,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

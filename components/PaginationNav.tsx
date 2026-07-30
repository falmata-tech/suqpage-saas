import Link from "next/link";
import type { PageResult } from "@/lib/pagination";
import { pageHref } from "@/lib/pagination";

export default function PaginationNav({
  result,
  pathname,
  params = {},
  pageParam = "page",
  hash,
}: {
  result: Pick<
    PageResult<unknown>,
    "page" | "totalPages" | "totalItems" | "firstItem" | "lastItem"
  >;
  pathname: string;
  params?: Record<string, string | number | null | undefined>;
  pageParam?: string;
  hash?: string;
}) {
  if (result.totalItems === 0) return null;
  const previous = Math.max(1, result.page - 1);
  const next = Math.min(result.totalPages, result.page + 1);
  return (
    <nav className="workspace-pagination" aria-label="Result pages">
      <p aria-live="polite">
        Showing <strong>{result.firstItem}-{result.lastItem}</strong> of{" "}
        <strong>{result.totalItems}</strong>
      </p>
      <div>
        {result.page > 1 ? (
          <Link
            className="small-btn"
            href={pageHref(pathname, { ...params, [pageParam]: previous }, hash)}
            aria-label="Previous page"
          >
            Previous
          </Link>
        ) : (
          <span className="small-btn disabled" aria-disabled="true">
            Previous
          </span>
        )}
        <span>
          Page {result.page} of {result.totalPages}
        </span>
        {result.page < result.totalPages ? (
          <Link
            className="small-btn"
            href={pageHref(pathname, { ...params, [pageParam]: next }, hash)}
            aria-label="Next page"
          >
            Next
          </Link>
        ) : (
          <span className="small-btn disabled" aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}

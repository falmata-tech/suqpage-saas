
import { useUiText } from "@/lib/i18n/ui";
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
  const t = useUiText();
  if (result.totalItems === 0) return null;
  const previous = Math.max(1, result.page - 1);
  const next = Math.min(result.totalPages, result.page + 1);
  return (
    <nav className="workspace-pagination" aria-label={t("Result pages")}>
      <p aria-live="polite">
        {t("Showing")}{" "}<strong>{result.firstItem}-{result.lastItem}</strong> {" "}{t("of")}{" "}
        <strong>{result.totalItems}</strong>
      </p>
      <div>
        {result.page > 1 ? (
          <Link
            className="small-btn"
            href={pageHref(pathname, { ...params, [pageParam]: previous }, hash)}
            aria-label={t("Previous page")}
          >
            {t("Previous")}</Link>
        ) : (
          <span className="small-btn disabled" aria-disabled="true">
            {t("Previous")}</span>
        )}
        <span>
          {t("Page")}{" "}{result.page} {" "}{t("of")}{" "}{result.totalPages}
        </span>
        {result.page < result.totalPages ? (
          <Link
            className="small-btn"
            href={pageHref(pathname, { ...params, [pageParam]: next }, hash)}
            aria-label={t("Next page")}
          >
            {t("Next")}</Link>
        ) : (
          <span className="small-btn disabled" aria-disabled="true">
            {t("Next")}</span>
        )}
      </div>
    </nav>
  );
}

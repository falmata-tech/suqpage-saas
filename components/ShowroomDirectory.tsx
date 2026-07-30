import Image from "next/image";
import Link from "next/link";
import PaginationNav from "@/components/PaginationNav";
import { pageHref, type PageResult } from "@/lib/pagination";
import type { PublicShowroomRow } from "@/lib/scalable-queries";

export type ShowroomDirectoryEntry = PublicShowroomRow;

export default function ShowroomDirectory({
  result,
  industries,
  query,
  industry,
  sort,
}: {
  result: PageResult<PublicShowroomRow>;
  industries: Array<{ key: string; label: string }>;
  query: string;
  industry: string;
  sort: string;
}) {
  const shared = {
    showroomQ: query || undefined,
    showroomIndustry: industry === "all" ? undefined : industry,
    showroomSort: sort === "name" ? undefined : sort,
  };
  return (
    <div className="market-directory">
      <form className="directory-tools" action="/" method="get">
        {industry !== "all" ? (
          <input type="hidden" name="showroomIndustry" value={industry} />
        ) : null}
        <label className="directory-search">
          <span className="sr-only">Search showrooms</span>
          <span className="directory-search-icon" aria-hidden="true" />
          <input
            name="showroomQ"
            defaultValue={query}
            maxLength={120}
            placeholder="Search by name, /@handle, product..."
            aria-label="Search showrooms"
          />
        </label>
        <div className="directory-sort">
          <label>
            <span className="sr-only">Sort</span>
            <select name="showroomSort" defaultValue={sort} aria-label="Sort selector">
              <option value="name">Sort by name</option>
              <option value="handle">Sort by handle</option>
            </select>
          </label>
          <button type="submit">Apply</button>
          {query ? (
            <Link
              href={pageHref("/", {
                showroomIndustry: industry === "all" ? undefined : industry,
                showroomSort: sort === "name" ? undefined : sort,
              }, "showrooms")}
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <nav className="directory-filters" aria-label="Showroom industry filters">
        <Link
          className={industry === "all" ? "active" : ""}
          href={pageHref("/", {
            showroomQ: query || undefined,
            showroomSort: sort === "name" ? undefined : sort,
          }, "showrooms")}
        >
          All industries
        </Link>
        {industries.map((option) => (
          <Link
            key={option.key}
            className={industry === option.key ? "active" : ""}
            href={pageHref("/", {
              showroomQ: query || undefined,
              showroomIndustry: option.key,
              showroomSort: sort === "name" ? undefined : sort,
            }, "showrooms")}
          >
            {option.label}
          </Link>
        ))}
      </nav>

      {result.items.length ? (
        <>
          <div className="showroom-rail" id="showroom-results" aria-live="polite">
            {result.items.map((entry) => (
              <Link key={entry.id} className="market-showroom-card" href={`/@${entry.handle}?ref=directory`}>
                <div className="market-showroom-media">
                  {entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt=""
                      width={640}
                      height={400}
                      sizes="(max-width: 720px) 78vw, 280px"
                    />
                  ) : (
                    <span className="market-media-fallback" aria-hidden="true">
                      {entry.name.slice(0, 1)}
                    </span>
                  )}
                  {entry.featured ? (
                    <span className="market-featured-label">Featured</span>
                  ) : null}
                </div>
                <div className="market-showroom-copy">
                  <span className="market-card-industry">{entry.industry}</span>
                  <h3>{entry.name}</h3>
                  <strong>/@{entry.handle}</strong>
                  <p>{entry.tagline}</p>
                  <span className="market-card-link">
                    Open showroom <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <PaginationNav
            result={result}
            pathname="/"
            params={shared}
            pageParam="showroomPage"
            hash="showrooms"
          />
        </>
      ) : (
        <div className="directory-empty">No showrooms match that search.</div>
      )}
    </div>
  );
}

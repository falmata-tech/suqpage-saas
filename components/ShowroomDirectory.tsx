"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { paginateHomepageEntries } from "@/lib/marketplace-home";

export type ShowroomDirectoryEntry = {
  id: number;
  handle: string;
  name: string;
  tagline: string;
  imageUrl: string;
  industry: string;
  searchText: string;
};

export default function ShowroomDirectory({ entries }: { entries: ShowroomDirectoryEntry[] }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);

  const industryOptions = useMemo(
    () => [...new Set(entries.map((entry) => entry.industry).filter(Boolean))],
    [entries],
  );
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entries
      .filter((entry) => industry === "all" || entry.industry === industry)
      .filter((entry) => !normalizedQuery || entry.searchText.includes(normalizedQuery))
      .sort((left, right) => (
        sort === "handle"
          ? left.handle.localeCompare(right.handle)
          : left.name.localeCompare(right.name)
      ));
  }, [entries, industry, query, sort]);
  const paginated = paginateHomepageEntries(results, page);

  function selectIndustry(value: string) {
    setIndustry(value);
    setPage(1);
  }

  return (
    <div className="market-directory">
      <div className="directory-tools">
        <label className="directory-search">
          <span className="sr-only">Search showrooms</span>
          <span className="directory-search-icon" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, /@handle, product..."
            aria-label="Search showrooms"
          />
        </label>
        <div className="directory-sort">
          <label>
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort selector">
              <option value="name">Sort by name</option>
              <option value="handle">Sort by handle</option>
            </select>
          </label>
        </div>
      </div>

      <div className="directory-filters" aria-label="Showroom industry filters">
        <button type="button" className={industry === "all" ? "active" : ""} onClick={() => selectIndustry("all")}>All industries</button>
        {industryOptions.map((label) => (
          <button
            type="button"
            key={label}
            className={industry === label ? "active" : ""}
            onClick={() => selectIndustry(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {results.length ? (
        <>
          <div className="showroom-rail" id="showroom-results" aria-live="polite">
            {paginated.entries.map((entry) => (
              <Link key={entry.id} className="market-showroom-card" href={`/@${entry.handle}`}>
                <div className="market-showroom-media">
                  {entry.imageUrl ? (
                    <Image src={entry.imageUrl} alt="" width={640} height={400} sizes="(max-width: 720px) 78vw, 280px" />
                  ) : (
                    <span className="market-media-fallback" aria-hidden="true">{entry.name.slice(0, 1)}</span>
                  )}
                </div>
                <div className="market-showroom-copy">
                  <span className="market-card-industry">{entry.industry}</span>
                  <h3>{entry.name}</h3>
                  <strong>/@{entry.handle}</strong>
                  <p>{entry.tagline}</p>
                  <span className="market-card-link">Open showroom <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
          {paginated.totalPages > 1 && (
            <nav className="showroom-pagination" aria-label="Showroom pages">
              <button type="button" aria-label="Previous showroom page" title="Previous page" disabled={paginated.page === 1} onClick={() => setPage(paginated.page - 1)}>‹</button>
              <span>Page {paginated.page} of {paginated.totalPages}</span>
              <button type="button" aria-label="Next showroom page" title="Next page" disabled={paginated.page === paginated.totalPages} onClick={() => setPage(paginated.page + 1)}>›</button>
            </nav>
          )}
        </>
      ) : (
        <div className="directory-empty">No showrooms match that search.</div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type ShowroomDirectoryEntry = {
  id: number;
  handle: string;
  name: string;
  tagline: string;
  imageUrl: string;
  industry: string;
  category: string;
  searchText: string;
};

export default function ShowroomDirectory({ entries }: { entries: ShowroomDirectoryEntry[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [sort, setSort] = useState("name");

  const categoryOptions = useMemo(
    () => [...new Set(entries.map((entry) => entry.category).filter(Boolean))],
    [entries],
  );
  const industryOptions = useMemo(
    () => [...new Set(entries.map((entry) => entry.industry).filter(Boolean))],
    [entries],
  );
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entries
      .filter((entry) => category === "all" || entry.category === category)
      .filter((entry) => industry === "all" || entry.industry === industry)
      .filter((entry) => !normalizedQuery || entry.searchText.includes(normalizedQuery))
      .sort((left, right) => (
        sort === "handle"
          ? left.handle.localeCompare(right.handle)
          : left.name.localeCompare(right.name)
      ));
  }, [category, entries, industry, query, sort]);

  function resetDirectory() {
    setCategory("all");
    setIndustry("all");
    setQuery("");
    setSort("name");
  }

  return (
    <div className="market-directory">
      <div className="directory-tools">
        <label className="directory-search">
          <span className="sr-only">Search showrooms</span>
          <span className="directory-search-icon" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, /@handle, product..."
            aria-label="Search showrooms"
          />
        </label>
        <div className="directory-selects">
          <label>
            <span className="sr-only">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category selector">
              <option value="all">All Categories</option>
              {categoryOptions.map((label) => <option key={label} value={label}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Industry</span>
            <select value={industry} onChange={(event) => setIndustry(event.target.value)} aria-label="Industry selector">
              <option value="all">All Industries</option>
              {industryOptions.map((label) => <option key={label} value={label}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort selector">
              <option value="name">Sort by name</option>
              <option value="handle">Sort by handle</option>
            </select>
          </label>
          <button type="button" className="directory-reset" onClick={resetDirectory}>View all showrooms</button>
        </div>
      </div>

      <div className="directory-filters" aria-label="Showroom category filters">
        <button type="button" className={category === "all" && industry === "all" && !query ? "active" : ""} onClick={resetDirectory}>All businesses</button>
        {categoryOptions.map((label) => (
          <button
            type="button"
            key={label}
            className={category === label ? "active" : ""}
            onClick={() => setCategory(category === label ? "all" : label)}
          >
            {label}
          </button>
        ))}
      </div>

      {results.length ? (
        <div className="showroom-rail" id="showroom-results">
          {results.map((entry) => (
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
      ) : (
        <div className="directory-empty">No showrooms match that search.</div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { FeaturedProgramEligibleBusiness } from "@/lib/featured-program-settings";

type LineupBusiness = FeaturedProgramEligibleBusiness & {
  selected: boolean;
  position: number;
};

export default function FeaturedLineupSelector({
  businesses,
  limit,
}: {
  businesses: LineupBusiness[];
  limit: number;
}) {
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(businesses.filter((business) => business.selected).map((business) => business.id)),
  );
  const capacityReached = selectedIds.size >= limit;

  return <>
    <div className="featured-lineup-capacity" aria-live="polite">
      <strong>{selectedIds.size} of {limit} selected</strong>
      <span>Daily Featured accepts up to {limit} pages.</span>
    </div>
    <div className="featured-business-list" role="group" aria-label="Eligible featured pages">
      {businesses.map((business) => {
        const selected = selectedIds.has(business.id);
        return <label className={`featured-business-row${selected ? " selected" : ""}`} key={business.id}>
          <input
            type="checkbox"
            name="businessId"
            value={business.id}
            checked={selected}
            disabled={!selected && capacityReached}
            onChange={(event) => setSelectedIds((current) => {
              const next = new Set(current);
              if (event.target.checked) next.add(business.id);
              else next.delete(business.id);
              return next;
            })}
          />
          <span><strong>{business.name}</strong><small>@{business.handle} · {business.city}, {business.region}</small></span>
          <span><small>Order</small><input aria-label={`${business.name} order`} name={`position-${business.id}`} type="number" min="1" max={limit} defaultValue={business.position}/></span>
        </label>;
      })}
    </div>
  </>;
}

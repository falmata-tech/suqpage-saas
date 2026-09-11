type LoadingVariant = "market" | "featured" | "page";

function WorkspaceDataLoading({ variant }: { variant: "market" | "featured" }) {
  return <div className={`public-loading-${variant}`} aria-hidden="true">
    <div className="public-loading-toolbar"><i /><i /><i /></div>
    <div className="public-loading-canvas">
      {Array.from({ length: variant === "featured" ? 6 : 4 }, (_, index) => <i key={index} />)}
    </div>
  </div>;
}

export function MarketWorkspaceLoading() {
  return <section className="public-workspace-data-loading" aria-busy="true" aria-live="polite">
    <span className="sr-only">Updating Market results</span>
    <WorkspaceDataLoading variant="market" />
  </section>;
}

export function FeaturedWorkspaceLoading() {
  return <section className="public-workspace-data-loading" aria-busy="true" aria-live="polite">
    <span className="sr-only">Loading Daily Featured</span>
    <WorkspaceDataLoading variant="featured" />
  </section>;
}

export default function PublicWorkspaceLoading({ variant }: { variant: LoadingVariant }) {
  const label = variant === "market"
    ? "Loading Market results"
    : variant === "featured"
      ? "Loading Daily Featured"
      : "Loading AfricMade page";

  if (variant === "page") {
    return <section className="public-workspace-loading public-page-loading" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="public-loading-page-bar" aria-hidden="true" />
      <div className="public-loading-page-hero" aria-hidden="true"><i /><i /><i /></div>
      <div className="public-loading-page-grid" aria-hidden="true"><i /><i /><i /></div>
    </section>;
  }

  return <section className={`public-experience public-${variant}-experience public-workspace-loading`} aria-busy="true" aria-live="polite">
    <span className="sr-only">{label}</span>
    <header className="public-loading-heading" aria-hidden="true"><i /><b /><i /></header>
    <WorkspaceDataLoading variant={variant} />
  </section>;
}

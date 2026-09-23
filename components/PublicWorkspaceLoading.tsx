
import { useUiText } from "@/lib/i18n/ui";
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
  const t = useUiText();
  return <section className="public-workspace-data-loading" aria-busy="true" aria-live="polite">
    <span className="sr-only">{t("Updating Market results")}</span>
    <WorkspaceDataLoading variant="market" />
  </section>;
}

export function FeaturedWorkspaceLoading() {
  const t = useUiText();
  return <section className="public-workspace-data-loading" aria-busy="true" aria-live="polite">
    <span className="sr-only">{t("Loading Daily Featured")}</span>
    <WorkspaceDataLoading variant="featured" />
  </section>;
}

export default function PublicWorkspaceLoading({ variant }: { variant: LoadingVariant }) {
  const t = useUiText();
  const label = variant === "market"
    ? "Loading Market results"
    : variant === "featured"
      ? "Loading Daily Featured"
      : "Loading Suqpage page";

  if (variant === "page") {
    return <section className="public-workspace-loading public-page-loading" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t(label)}</span>
      <div className="public-loading-page-bar" aria-hidden="true" />
      <div className="public-loading-page-hero" aria-hidden="true"><i /><i /><i /></div>
      <div className="public-loading-page-grid" aria-hidden="true"><i /><i /><i /></div>
    </section>;
  }

  return <section className={`public-experience public-${variant}-experience public-workspace-loading`} aria-busy="true" aria-live="polite">
    <span className="sr-only">{t(label)}</span>
    <header className="public-loading-heading" aria-hidden="true"><i /><b /><i /></header>
    <WorkspaceDataLoading variant={variant} />
  </section>;
}

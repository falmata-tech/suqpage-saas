import { useUiText } from "@/lib/i18n/ui";
import styles from './PublicWorkspaceLoading.module.css';
type LoadingVariant = "market" | "featured" | "page";

function Block({className=''}:{className?:string}) {
  return <i className={`${styles.block} ${className}`}/>;
}
function Copy({title=false,compact=false}:{title?:boolean;compact?:boolean}) {
  return <div className={styles.copy}><Block className={styles.short}/>{title&&<Block className={styles.title}/>}<Block className={styles.line}/>{!compact&&<Block className={`${styles.line} ${styles.short}`}/>}</div>;
}
function Cards({products=false}:{products?:boolean}) {
  const cards=Array.from({length:6},(_,index)=><div key={index} className={styles.card}><Block className={styles.media}/><div className={`${styles.copy} ${styles.cardCopy}`}><Block className={styles.short}/><Block className={styles.title}/><Block className={styles.line}/>{products&&<Block className={styles.line}/>}</div></div>);
  return products?<div className={styles.products}>{cards}</div>:<div className={styles.galleryWrap}><div className={styles.gallery}>{cards}</div></div>;
}
function WorkspaceDataLoading({ variant }: { variant: "market" | "featured" }) {
  return variant==='market'?<div className={`${styles.surface} ${styles.market}`} aria-hidden="true" data-loading-layout="market">
    <div className={styles.mode}><div><Block/><Block/></div></div>
    <div className={styles.controls}><Block className={styles.search}/><div className={styles.filters}><Block/><Block/><Block/></div></div>
    <div className={styles.map}><div className={styles.mapTools}><Block/><Block/><Block/><Block/></div><Block className={styles.mapPeek}/></div>
  </div>:<div className={`${styles.surface} ${styles.featured}`} aria-hidden="true" data-loading-layout="featured">
    <div className={styles.featuredHead}><Copy title compact/><Block className={styles.featuredStatus}/></div>
    <div className={styles.featuredBody}><div className={styles.week}>{Array.from({length:7},(_,index)=><div className={styles.category} key={index}><Block className={styles.categoryArt}/><div className={styles.copy}><Block className={styles.line}/><Block className={styles.line}/></div><Block className={styles.categoryDate}/></div>)}</div><Cards/><div className={styles.sponsors}><Block/><Block/><Block/></div></div>
  </div>;
}

export function MarketWorkspaceLoading() {
  const t = useUiText();
  return <section className="public-workspace-data-loading" aria-busy="true" role="status">
    <span className="sr-only">{t("Loading…")}</span>
    <WorkspaceDataLoading variant="market" />
  </section>;
}

export function FeaturedWorkspaceLoading() {
  const t = useUiText();
  return <section className="public-workspace-data-loading" aria-busy="true" role="status">
    <span className="sr-only">{t("Loading Daily Featured")}</span>
    <WorkspaceDataLoading variant="featured" />
  </section>;
}

export default function PublicWorkspaceLoading({ variant }: { variant: LoadingVariant }) {
  const t = useUiText();
  const label = variant === "featured" ? "Loading Daily Featured" : "Loading…";
  if (variant === "page") {
    return <section className={`public-workspace-loading ${styles.page}`} aria-busy="true" role="status">
      <span className="sr-only">{t(label)}</span>
      <div aria-hidden="true" data-loading-layout="showroom"><Block className={styles.pageBar}/></div>
      <div className={styles.hero} aria-hidden="true"><Block className={styles.heroMedia}/><Copy title/></div>
      <div className={styles.pageFilters} aria-hidden="true"><Block/><Block/><Block/></div>
      <div aria-hidden="true"><Cards products/></div>
    </section>;
  }
  return <section className={`public-experience public-${variant}-experience public-workspace-loading`} aria-busy="true" role="status">
    <span className="sr-only">{t(label)}</span>
    {variant==='market'&&<header className={styles.intro} aria-hidden="true"><div className={styles.copy}><Block className={styles.short}/><Block className={styles.title}/></div><div className={styles.copy}><Block className={styles.line}/><Block className={`${styles.line} ${styles.short}`}/></div></header>}
    <WorkspaceDataLoading variant={variant} />
  </section>;
}

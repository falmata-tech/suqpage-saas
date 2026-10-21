import type { CSSProperties } from "react";
import { useUiText } from "@/lib/i18n/ui";
import { PLATFORM_BRAND } from "@/lib/brand";
import Link from "next/link";
import styles from "./MirtPageBrand.module.css";

export type PlatformBrandProps = { href?: string; className?: string };

export default function MirtPageBrand({ href = "/", className = "" }: PlatformBrandProps) {
  const t = useUiText();
  return (
    <Link className={`suqpage-brand ${className}`.trim()} href={href} aria-label={t("MirtPage home")}
      style={{ "--suqpage-wordmark-shift": "0", minHeight: 48 } as CSSProperties}>
      <span className={styles.artwork} style={{width:`calc(var(--suqpage-mark-width, 32px) * ${PLATFORM_BRAND.wordmark.width / PLATFORM_BRAND.wordmark.height})`,height:"var(--suqpage-mark-width, 32px)"}}>
        {[['normal',PLATFORM_BRAND.assets.wordmark],['reverse',PLATFORM_BRAND.assets.wordmarkReverse]].map(([variant,src])=><img key={variant} className={variant==='normal'?styles.normal:styles.reverse} src={src} alt="" width={PLATFORM_BRAND.wordmark.width} height={PLATFORM_BRAND.wordmark.height} style={{width:'100%',height:'100%',maxWidth:'none',flex:'none',objectFit:'contain',border:0,borderRadius:0}}/>)}
      </span>
      <span className="suqpage-wordmark" lang="en" translate="no" style={{position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clip:'rect(0,0,0,0)',whiteSpace:'nowrap',transform:'none'}}><span>{PLATFORM_BRAND.wordmark.leading}</span><span>{PLATFORM_BRAND.wordmark.trailing}</span></span>
    </Link>
  );
}

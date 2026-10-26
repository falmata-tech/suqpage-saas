"use client";

import Link from 'next/link';
import {useUiText} from '@/lib/i18n/ui';
import {PUBLIC_SITE_FOOTER} from '@/lib/public-site-footer';
import styles from './PublicSiteFooter.module.css';

export default function PublicSiteFooter(){
  const t=useUiText();
  return <footer className={styles.footer} data-public-site-footer aria-label="AfricMade">
    <nav className={styles.utilities} aria-label={t('Explore AfricMade')}>
      {PUBLIC_SITE_FOOTER.utilities.map(link=><Link key={link.href} href={link.href}>{t(link.label)}</Link>)}
    </nav>
    <nav className={styles.legal} aria-label={t('Information')}>
      {PUBLIC_SITE_FOOTER.legal.map(link=><Link key={link.href} href={link.href}>{t(link.label)}</Link>)}
    </nav>
    <div className={styles.company}>
      <p>{t(PUBLIC_SITE_FOOTER.location)}</p>
      <p>© {new Date().getFullYear()} {PUBLIC_SITE_FOOTER.company}</p>
    </div>
  </footer>;
}

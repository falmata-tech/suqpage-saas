/** Public information links; merchant Pages and task workspaces keep their own UI. */
export const PUBLIC_SITE_FOOTER = {
  utilities: [
    {href: '/showrooms', label: 'Businesses'},
    {href: '/transport-partners', label: 'List your logistics company'},
  ],
  legal: [
    {href: '/privacy', label: 'Privacy'},
    {href: '/terms', label: 'Terms'},
    {href: '/account-deletion', label: 'Delete account'},
  ],
  location: 'Jigjiga, Somali Region, Ethiopia',
  company: 'MarketVision Technology',
} as const;

const WEB_FOOTER_PATHS = ['/about', '/showrooms', '/transport-partners', '/privacy', '/terms', '/account-deletion'];

export function showPublicSiteFooter(pathname: string): boolean {
  return WEB_FOOTER_PATHS.includes(pathname.replace(/\/+$/, '') || '/');
}

'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Shop } from '@africmade/contracts';
import { ClipboardList, MessageCircle, PackageOpen, Send, X } from 'lucide-react';
import { useUiText } from '@/lib/i18n/ui';
import { canOpenPublicContact } from '@/lib/demo-inquiry-policy';
import { inquiryHandoffs, selectionKey } from '@/lib/product-inquiry';
import {
  deliverShopQuote,
  remainingQuoteLines,
  resolveQuoteLine,
  shopQuote,
  type QuoteAttempt,
  type QuoteGroup,
  type QuoteLine,
} from '@/lib/quote-list';
import {
  webQuoteKey,
  finishWebQuote,
  publicQuoteShop,
  readShopLines,
  writeShopLines,
} from '@/lib/web-quote-list';
import { useQuoteCatalogs } from '@/lib/use-quote-catalogs';
import { copyBrowserText, openCopiedBrowserLink } from '@/lib/browser-clipboard';
import { publicContactDisplay, publicContactIsPhone } from '@/lib/public-contact-device';
import styles from './showroom/InquiryComposer.module.css';

type ShopLink = ReturnType<typeof inquiryHandoffs>[number];
function ShopOptions({
  shop,
  draft,
  links,
  clear,
  compose,
  busy,
}: {
  shop: Shop;
  draft: string;
  links: ShopLink[];
  clear: () => void;
  compose: () => void;
  busy: boolean;
}) {
  const t = useUiText(),
    [feedback, setFeedback] = useState(''),
    [manual, setManual] = useState('');
  const phone = publicContactIsPhone('web', navigator.userAgent);
  async function copy(text: string) {
    const copied = await copyBrowserText(text);
    setManual(copied ? '' : text);
    setFeedback(t(copied ? 'Copied' : 'Select and copy your message'));
  }
  async function handoff(event: React.MouseEvent<HTMLAnchorElement>, link: ShopLink) {
    if (!phone) return;
    event.preventDefault();
    const result = await openCopiedBrowserLink(draft, link.href, link.external);
    if (!result.copied) setManual(draft);
    if (!result.opened) setFeedback(t('Could not open the social app. Use the link below.'));
  }
  return (
    <>
      <div className={styles.shopChannels}>
        {links
          .filter((l) => l.kind !== 'phone')
          .map((l) => (
            <a
              key={l.kind}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => void handoff(e, l)}
            >
              {l.kind === 'whatsapp' ? <MessageCircle size={17} /> : <Send size={17} />}
              {t(l.kind === 'whatsapp' ? 'Send on WhatsApp' : 'Send on Telegram')}
            </a>
          ))}
      </div>
      <details className={styles.quoteOptions}>
        <summary>{t('More options')}</summary>
        <button disabled={busy} onClick={compose}>
          {t('Send to this business only')}
        </button>
        <button onClick={() => void copy(draft)}>{t('Copy message')}</button>
        {links
          .filter((l) => l.kind !== 'phone' || phone)
          .map((l) => {
            const identity = publicContactDisplay(l.kind, shop.contacts);
            return (
              <div key={l.kind}>
                {l.kind === 'phone' ? (
                  <a href={l.href} onClick={(e) => void handoff(e, l)}>
                    {t('Send SMS')}
                  </a>
                ) : (
                  <b>{l.label}</b>
                )}{' '}
                <span>{identity}</span>{' '}
                <button onClick={() => void copy(identity)}>{t('Copy contact')}</button>
              </div>
            );
          })}
        <button disabled={busy} onClick={clear}>
          {t('Clear this business’s items')}
        </button>
      </details>
      {feedback && <p role="status">{feedback}</p>}
      {manual && (
        <textarea readOnly aria-label={t('Copy message')} value={manual} onFocus={(e) => e.target.select()} />
      )}
    </>
  );
}

type Props = { groups: QuoteGroup[]; close: () => void };
export default function MultiShopInquiry({ groups, close }: Props) {
  const t = useUiText(),
    dialog = useRef<HTMLDialogElement>(null),
    lock = useRef(false),
    attempts = useRef(new Map<number, QuoteAttempt>());
  const { shops, retry } = useQuoteCatalogs(
    groups.map((g) => g.handle),
    publicQuoteShop,
  );
  const [details, setDetails] = useState(false),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState<string[]>([]);
  const [name, setName] = useState(''),
    [phone, setPhone] = useState(''),
    [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState<string | null>(null),
    [customDraft, setCustomDraft] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    const d = dialog.current;
    d?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      d?.close();
      document.body.style.overflow = old;
    };
  }, []);
  const sections = useMemo(
    () =>
      groups.map((group) => {
        const shop = shops[group.handle];
        const valid = Boolean(shop && group.lines.every((line) => resolveQuoteLine(shop, line)));
        const draft = shop && valid ? shopQuote(shop, group.lines, window.location.origin, t) : '';
        const links =
          shop && valid
            ? inquiryHandoffs(shop.contacts, draft).filter((link) =>
                canOpenPublicContact(shop.isDemo, shop.approvedDemoContactMethods, link.kind),
              )
            : [];
        return { group, shop, valid, links, draft };
      }),
    [groups, shops, t],
  );
  const targets = recipient ? sections.filter((s) => s.group.handle === recipient) : sections;
  const ready = targets.length > 0 && targets.every((section) => section.valid);
  function compose(handle: string | null, draft = '') {
    setRecipient(handle);
    setCustomDraft(draft);
    setDetails(true);
    requestAnimationFrame(() =>
      dialog.current?.querySelector<HTMLInputElement>('[autocomplete=name]')?.focus(),
    );
  }
  function edit(handle: string, line: QuoteLine, quantity?: string) {
    const key = selectionKey(line.productId, line.options);
    writeShopLines(
      handle,
      readShopLines(handle).flatMap((l) =>
        selectionKey(l.productId, l.options) !== key
          ? [l]
          : quantity === undefined
            ? []
            : [{ ...l, quantity }],
      ),
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lock.current || !ready) return;
    lock.current = true;
    setBusy(true);
    setErrors({});
    let failed = false;
    try {
      for (const { group, shop: catalog } of targets) {
        const shop = catalog!;
        try {
          await deliverShopQuote(
            shop,
            group.lines,
            {
              name,
              phone,
              message: recipient ? '' : message,
              editedDraft: recipient ? customDraft : undefined,
            },
            window.location.origin,
            t,
            attempts.current,
            (payload) => webQuoteKey(shop.id, payload),
            async (body) => {
              const r = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(25000),
              });
              const result = await r.json();
              if (!r.ok) throw Error(result.error || 'Your inquiry could not be sent. Please try again.');
              return result;
            },
          );
          writeShopLines(group.handle, remainingQuoteLines(readShopLines(group.handle), group.lines));
          finishWebQuote(shop.id);
          attempts.current.delete(shop.id);
          setSent((list) => [...list, shop.name]);
        } catch (e) {
          failed = true;
          setErrors((old) => ({
            ...old,
            [group.handle]: e instanceof Error ? e.message : 'Please try again.',
          }));
        }
      }
    } finally {
      if (!failed) {
        setName('');
        setPhone('');
        setMessage('');
        setDetails(false);
        setRecipient(null);
        setCustomDraft('');
      }
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className={styles.multiDialog}
      aria-labelledby="multi-inquiry-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) close();
      }}
    >
      <header className={styles.head}>
        <div>
          <h2 id="multi-inquiry-title">{t('Inquiry list')}</h2>
          <small>
            {groups.length === 1 ? t('1 business') : t('{count} businesses', { count: groups.length })}
          </small>
        </div>
        <button aria-label={t('Close')} disabled={busy} onClick={close}>
          <X />
        </button>
      </header>
      <div className={styles.multiScroll}>
        {sent.length > 0 && (
          <p className={styles.success} role="status">
            {t('Inquiry sent to')} {sent.join(', ')}
          </p>
        )}
        {sections.map(({ group: g, shop, links, draft, valid }) => {
          return (
            <section key={g.handle} className={styles.shopGroup} aria-label={shop?.name || g.handle}>
              <h3>
                <ClipboardList size={18} />
                {shop?.name || g.handle}
              </h3>
              {shop === undefined ? (
                <p role="status">{t('Loading…')}</p>
              ) : shop === null ? (
                <div role="alert">
                  {t('Business not available.')} <button onClick={retry}>{t('Retry')}</button>{' '}
                  <button onClick={() => writeShopLines(g.handle, [])}>{t('Remove')}</button>
                </div>
              ) : (
                <>
                  <ul className={styles.list}>
                    {g.lines.map((l) => {
                      const p = resolveQuoteLine(shop, l),
                        id = selectionKey(l.productId, l.options);
                      return (
                        <li key={id} className={styles.quoteLine}>
                          {p?.media.find((m) => m.kind === 'image') ? (
                            <img src={p.media.find((m) => m.kind === 'image')!.ref} alt="" loading="lazy" />
                          ) : (
                            <PackageOpen aria-hidden="true" />
                          )}
                          <div>
                            <strong>{p?.name || t('This product is not available for inquiry.')}</strong>
                            {Object.values(l.options).length > 0 && (
                              <small>{Object.values(l.options).join(' · ')}</small>
                            )}
                            {p && (
                              <label>
                                {t('Quantity')}
                                <input
                                  aria-label={t('Quantity') + ' · ' + p.name}
                                  value={l.quantity}
                                  disabled={busy}
                                  maxLength={80}
                                  onChange={(e) => edit(g.handle, l, e.target.value)}
                                />
                              </label>
                            )}
                          </div>
                          <button
                            disabled={busy}
                            onClick={() => edit(g.handle, l)}
                            aria-label={t('Remove {value1} from inquiry', {
                              value1: p?.name || String(l.productId),
                            })}
                          >
                            <X size={18} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {valid && !details && (
                    <ShopOptions
                      shop={shop}
                      draft={draft}
                      links={links}
                      busy={busy}
                      clear={() => writeShopLines(g.handle, [])}
                      compose={() => compose(g.handle, draft)}
                    />
                  )}
                </>
              )}
              {errors[g.handle] && (
                <p className={styles.error} role="alert">
                  {t(errors[g.handle])}
                </p>
              )}
            </section>
          );
        })}
        {groups.length === 0 && !sent.length && <p>{t('Your inquiry list is empty.')}</p>}
        {details && groups.length > 0 && (
          <form id="multi-shop-send" className={styles.platform} onSubmit={submit}>
            <label>
              {t('Your name')}
              <input
                autoComplete="name"
                required
                maxLength={80}
                value={name}
                disabled={busy}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              {t('Phone number')}
              <input
                type="tel"
                autoComplete="tel"
                required
                maxLength={60}
                value={phone}
                disabled={busy}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            {recipient && (
              <p>
                <strong>{targets[0]?.shop?.name}</strong>
              </p>
            )}
            {recipient ? (
              <label>
                {t('Your message')}
                <textarea
                  required
                  rows={4}
                  maxLength={10000}
                  value={customDraft}
                  disabled={busy}
                  onChange={(e) => setCustomDraft(e.target.value)}
                />
              </label>
            ) : (
              <label>
                {t('Message for all businesses (optional)')}
                <textarea
                  rows={3}
                  maxLength={1200}
                  value={message}
                  disabled={busy}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDetails(false);
                setRecipient(null);
              }}
            >
              {t('Back')}
            </button>
          </form>
        )}
      </div>
      <div className={styles.quoteFooter}>
        {groups.length === 0 ? (
          <button className={styles.platformButton} onClick={close}>
            {t('Continue browsing')}
          </button>
        ) : details ? (
          <button
            type="submit"
            form="multi-shop-send"
            disabled={busy || !ready || !name.trim() || !phone.trim() || (!!recipient && !customDraft.trim())}
            className={styles.platformButton}
          >
            {t(busy ? 'Sending…' : recipient ? 'Send inquiry' : 'Send to business inboxes')}
          </button>
        ) : (
          <button className={styles.platformButton} disabled={!ready} onClick={() => compose(null)}>
            {t('Send to business inboxes')}
          </button>
        )}
      </div>
    </dialog>
  );
}

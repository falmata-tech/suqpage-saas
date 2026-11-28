import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { copyBrowserText } from '../../../lib/browser-clipboard';
import { publicContactDisplay, publicContactIsPhone } from '../../../lib/public-contact-device';
import * as Crypto from 'expo-crypto';
import type { Shop, InquiryReceipt } from '@africmade/contracts';
import {
  deliverShopQuote,
  quoteRequestKey,
  remainingQuoteLines,
  resolveQuoteLine,
  shopQuote,
  type QuoteAttempt,
  type QuoteLine,
} from '../../../lib/quote-list';
import { useQuoteCatalogs } from '../../../lib/use-quote-catalogs';
import { inquiryHandoffs, selectionKey } from '../../../lib/product-inquiry';
import { canOpenPublicContact } from '../../../lib/demo-inquiry-policy';
import { API, request, secure, useApp } from './runtime';
import { businessInquiries, useQuoteInventory } from './use-business-inquiry';
import { useBlockedBusinesses } from './blocked-businesses';
import { Button, Card, Copy, Field, Status, colors, openLink } from './ui';
type Group = { id: number; lines: QuoteLine[] };
const roundKey = (id: number) => 'africmade-quote-' + API.replace(/[^a-z0-9.-]/gi, '_') + '-' + id;
const visitNonces = new Map<number, string>();
async function attemptKey(id: number, payload: string) {
  const key = roundKey(id);
  return quoteRequestKey(
    payload,
    async () => {
      try {
        const old = Platform.OS === 'web' ? localStorage.getItem(key) : await secure.getItem(key);
        if (old) return old;
      } catch {}
      const nonce = visitNonces.get(id) ?? Crypto.randomUUID();
      visitNonces.set(id, nonce);
      try {
        if (Platform.OS === 'web') localStorage.setItem(key, nonce);
        else await secure.setItem(key, nonce);
      } catch {}
      return nonce;
    },
    (value) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value),
  );
}
const loadShop = (id: string) => request<Shop>('shops/by-id/' + id);
type Handoff = ReturnType<typeof inquiryHandoffs>[number];
function ShopOptions({
  shop,
  draft,
  links,
  compose,
  clear,
}: {
  shop: Shop;
  draft: string;
  links: Handoff[];
  compose: () => void;
  clear: () => void;
}) {
  const { t } = useApp(),
    [more, setMore] = useState(false),
    [feedback, setFeedback] = useState(''),
    [manual, setManual] = useState('');
  const phone = publicContactIsPhone(Platform.OS, Platform.OS === 'web' ? navigator.userAgent : '');
  async function copy(value: string) {
    try {
      const copied =
        Platform.OS === 'web' ? await copyBrowserText(value) : await Clipboard.setStringAsync(value);
      if (!copied) setManual(value);
      setFeedback(t(copied ? 'Copied' : 'Select and copy your message'));
    } catch {
      setManual(value);
      setFeedback(t('Select and copy your message'));
    }
  }
  async function handoff(link: Handoff) {
    if (phone) await copy(draft);
    try {
      await openLink(link.href);
    } catch {
      setManual(draft);
      setMore(true);
      setFeedback(t('Could not open the social app. Use the contact details below.'));
    }
  }
  return (
    <View style={{ gap: 6 }}>
      {links
        .filter((l) => l.kind !== 'phone')
        .map((l) => (
          <Button
            secondary
            wrapLabel
            key={l.kind}
            label={t(l.kind === 'whatsapp' ? 'Send on WhatsApp' : 'Send on Telegram')}
            onPress={() => void handoff(l)}
          />
        ))}
      <Button secondary wrapLabel label={t('More options')} onPress={() => setMore(!more)} />
      {more && (
        <>
          <Button secondary wrapLabel label={t('Send to this business only')} onPress={compose} />
          <Button secondary wrapLabel label={t('Copy message')} onPress={() => void copy(draft)} />
          {links
            .filter((l) => l.kind !== 'phone' || phone)
            .map((l) => {
              const identity = publicContactDisplay(l.kind, shop.contacts);
              return (
                <View key={l.kind} style={{ gap: 4 }}>
                  <Copy selectable>
                    {l.label} · {identity}
                  </Copy>
                  {l.kind === 'phone' && (
                    <Button secondary label={t('Send SMS')} onPress={() => void handoff(l)} />
                  )}
                  <Button secondary label={t('Copy contact')} onPress={() => void copy(identity)} />
                </View>
              );
            })}
          <Button secondary wrapLabel label={t('Clear this business’s items')} onPress={clear} />
        </>
      )}
      {!!feedback && <Copy>{feedback}</Copy>}
      {!!manual && <Copy selectable>{manual}</Copy>}
    </View>
  );
}
export default function MultiBusinessInquiry() {
  const { t } = useApp(),
    inventory = useQuoteInventory(),
    blocked = useBlockedBusinesses();
  const groups = blocked.ready
    ? inventory.groups.filter((g) => !blocked.list.some((b) => b.id === g.id))
    : [];
  const { shops, retry } = useQuoteCatalogs(
    groups.map((g) => String(g.id)),
    loadShop,
  );
  const [name, setName] = useState(''),
    [phone, setPhone] = useState(''),
    [message, setMessage] = useState('');
  const [form, setForm] = useState(false),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState<string[]>([]),
    [errors, setErrors] = useState<Record<number, string>>({});
  const lock = useRef(false),
    attempts = useRef(new Map<number, QuoteAttempt>());
  const [recipient, setRecipient] = useState<number | null>(null),
    [customDraft, setCustomDraft] = useState('');
  const targets = recipient ? groups.filter((g) => g.id === recipient) : groups;
  const ready =
    targets.length > 0 &&
    targets.every((g) => shops[g.id]?.id === g.id && g.lines.every((l) => resolveQuoteLine(shops[g.id]!, l)));
  const list = useRef<FlatList<Group>>(null);
  function compose(id: number | null, draft = '') {
    setRecipient(id);
    setCustomDraft(draft);
    setForm(true);
    requestAnimationFrame(() => list.current?.scrollToEnd());
  }
  function edit(id: number, line: QuoteLine, quantity?: string) {
    const key = selectionKey(line.productId, line.options);
    void businessInquiries.replaceLines(id, (lines) =>
      lines.flatMap((l) =>
        selectionKey(l.productId, l.options) !== key
          ? [l]
          : quantity === undefined
            ? []
            : [{ ...l, quantity }],
      ),
    );
  }
  async function submit() {
    if (lock.current || !ready) return;
    lock.current = true;
    setBusy(true);
    setErrors({});
    let failed = false;
    try {
      for (const group of targets) {
        const shop = shops[group.id]!;
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
            API,
            t,
            attempts.current,
            (payload) => attemptKey(shop.id, payload),
            (body) => request<InquiryReceipt>('inquiries', { body }),
          );
          await businessInquiries.replaceLines(shop.id, (lines) => remainingQuoteLines(lines, group.lines));
          attempts.current.delete(shop.id);
          visitNonces.delete(shop.id);
          try {
            if (Platform.OS === 'web') localStorage.removeItem(roundKey(shop.id));
            else await secure.removeItem(roundKey(shop.id));
          } catch {}
          setSent((current) => [...current, shop.name]);
        } catch (error) {
          failed = true;
          setErrors((v) => ({
            ...v,
            [shop.id]: error instanceof Error ? error.message : 'Please try again.',
          }));
        }
      }
    } finally {
      if (!failed) {
        setName('');
        setPhone('');
        setMessage('');
        setForm(false);
        setRecipient(null);
        setCustomDraft('');
      }
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList<Group>
        ref={list}
        data={groups}
        keyExtractor={(g) => String(g.id)}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 14 }}
        ListHeaderComponent={
          <View style={{ gap: 8 }}>
            <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700', color: colors.ink }}>
              {t('Inquiry list')}
            </Text>
            {!!sent.length && (
              <Copy>
                {t('Inquiry sent to')} {sent.join(', ')}
              </Copy>
            )}
            <Status
              loading={!inventory.ready && !inventory.error}
              error={inventory.error}
              retry={inventory.retry}
            />
          </View>
        }
        renderItem={({ item: g }) => {
          const shop = shops[g.id];
          if (!shop)
            return (
              <Card>
                <Status
                  loading={shop === undefined}
                  error={shop === null ? t('Business not available.') : ''}
                  retry={retry}
                />
                {shop === null && (
                  <Button secondary label={t('Remove')} onPress={() => void businessInquiries.clear(g.id)} />
                )}
              </Card>
            );
          const valid = shop.id === g.id && g.lines.every((l) => resolveQuoteLine(shop, l));
          const draft = valid ? shopQuote(shop, g.lines, API, t) : '';
          const links = valid
            ? inquiryHandoffs(shop.contacts, draft).filter((l) =>
                canOpenPublicContact(shop.isDemo, shop.approvedDemoContactMethods, l.kind),
              )
            : [];
          return (
            <Card>
              <Text accessibilityRole="header" style={{ fontWeight: '700', fontSize: 18, color: colors.ink }}>
                {shop.name}
              </Text>
              {g.lines.map((l) => {
                const p = resolveQuoteLine(shop, l);
                return (
                  <View
                    key={selectionKey(l.productId, l.options)}
                    style={{ gap: 6, borderTopWidth: 1, borderColor: colors.line, paddingVertical: 10 }}
                  >
                    <Copy>{p?.name || t('This product is not available for inquiry.')}</Copy>
                    {Object.values(l.options).length > 0 && (
                      <Copy muted>{Object.values(l.options).join(' · ')}</Copy>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
                      {p && (
                        <View style={{ flexGrow: 1, minWidth: 120 }}>
                          <Field
                            label={t('Quantity')}
                            value={l.quantity}
                            maxLength={80}
                            editable={!busy}
                            onChangeText={(q) => edit(g.id, l, q)}
                          />
                        </View>
                      )}
                      <Button secondary disabled={busy} label={t('Remove')} onPress={() => edit(g.id, l)} />
                    </View>
                  </View>
                );
              })}
              {valid && !form && (
                <ShopOptions
                  shop={shop}
                  draft={draft}
                  links={links}
                  compose={() => compose(shop.id, draft)}
                  clear={() => void businessInquiries.clear(shop.id)}
                />
              )}
              <Status error={errors[g.id]} />
            </Card>
          );
        }}
        ListFooterComponent={
          <View style={{ gap: 12 }}>
            {!inventory.ready || !blocked.ready ? null : !groups.length ? (
              <>
                {!sent.length && <Copy>{t('Your inquiry list is empty.')}</Copy>}
                <Button
                  secondary
                  label={t('Continue browsing')}
                  onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                />
              </>
            ) : form ? (
              <Card>
                {recipient && <Copy big>{shops[recipient]?.name}</Copy>}
                <Field
                  label={t('Your name')}
                  autoComplete="name"
                  maxLength={80}
                  editable={!busy}
                  value={name}
                  onChangeText={setName}
                />
                <Field
                  label={t('Phone number')}
                  autoComplete="tel"
                  keyboardType="phone-pad"
                  maxLength={60}
                  editable={!busy}
                  value={phone}
                  onChangeText={setPhone}
                />
                {recipient ? (
                  <Field
                    label={t('Your message')}
                    multiline
                    maxLength={10000}
                    editable={!busy}
                    value={customDraft}
                    onChangeText={setCustomDraft}
                  />
                ) : (
                  <Field
                    label={t('Message for all businesses (optional)')}
                    multiline
                    maxLength={1200}
                    editable={!busy}
                    value={message}
                    onChangeText={setMessage}
                  />
                )}
                <Button
                  secondary
                  disabled={busy}
                  label={t('Back')}
                  onPress={() => {
                    setForm(false);
                    setRecipient(null);
                  }}
                />
                <Button
                  wrapLabel
                  label={t(busy ? 'Sending…' : recipient ? 'Send inquiry' : 'Send to business inboxes')}
                  disabled={
                    !ready || busy || !name.trim() || !phone.trim() || (!!recipient && !customDraft.trim())
                  }
                  onPress={() => void submit()}
                />
              </Card>
            ) : (
              <Button
                wrapLabel
                disabled={!ready}
                label={t('Send to business inboxes')}
                onPress={() => compose(null)}
              />
            )}
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

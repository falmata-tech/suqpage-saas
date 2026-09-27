import { platformCookie, type CookieReader } from './platform-state';
import { getPublicSupportConversation, PUBLIC_SUPPORT_COOKIE, SupportError } from './support';

export const PUBLIC_HELP_COOKIE = 'suqpage_public_help';
export const PUBLIC_TRANSPORT_COOKIE = 'suqpage_public_transport';
export const PUBLIC_BUYING_COOKIE = 'suqpage_public_buying';
export type PublicSupportChannel = 'help' | 'transport' | 'buying';
export function supportChannel(value: string | null): PublicSupportChannel | null {
  if (value === null) return null; // Retained API compatibility.
  if (value === 'help' || value === 'transport' || value === 'buying') return value;
  throw new SupportError('Choose how Suqpage can help.', 'invalid_channel');
}
export function matchesSupportChannel(category: string, channel: PublicSupportChannel | null) {
  return channel === null || (channel === 'buying' ? category === 'buying_assistance' : channel === 'transport' ? category === 'shipment_observation' : category !== 'buying_assistance' && category !== 'shipment_observation');
}
export async function publicSupportSession(cookies: CookieReader, value: string | null) {
  const channel = supportChannel(value);
  const cookieName = channel === 'buying' ? PUBLIC_BUYING_COOKIE : channel === 'help' ? PUBLIC_HELP_COOKIE : channel === 'transport' ? PUBLIC_TRANSPORT_COOKIE : PUBLIC_SUPPORT_COOKIE;
  let token = channel ? cookies.get(cookieName)?.value || '' : platformCookie(cookies, 'support') || '';
  if (channel && !token) {
    const legacy = platformCookie(cookies, 'support');
    if (legacy) try {
      const conversation = await getPublicSupportConversation(legacy);
      if (matchesSupportChannel(conversation.category, channel)) token = legacy;
    } catch (error) { if (!(error instanceof SupportError && error.code === 'not_found')) throw error; }
  }
  return { channel, cookieName, token };
}
export async function channelConversation(token: string, channel: PublicSupportChannel | null) {
  const conversation = await getPublicSupportConversation(token);
  if (!matchesSupportChannel(conversation.category, channel)) throw new SupportError('Support conversation was not found.', 'not_found');
  return conversation;
}

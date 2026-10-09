export const attentionKinds = ['inquiry','waiting_chat','assigned','reassigned','joined','message','closed','reopened'] as const;
export type AttentionKind = typeof attentionKinds[number];
export type AttentionDestination = { screen: 'inquiries' | 'owner-chat' | 'transport-chat' | 'support-chat' | 'support-queue'; id?: number; businessId?:number };
export type AttentionItem = { id: number; kind: AttentionKind; channel: 'support' | 'transport' | null; createdAt: number; read: boolean; destination: AttentionDestination };
export type AttentionPreferences = { soundEnabled: boolean; language: 'en' | 'am' | 'om' | 'so' | 'ti' };
export type AttentionFeed = { items: AttentionItem[]; unread: number; latestId: number; preferences: AttentionPreferences; enabled?: {web:boolean;expo:boolean} };
export const defaultAttentionPreferences: AttentionPreferences = { soundEnabled: false, language: 'en' };

export function attentionPreferenceInput(raw: Record<string,unknown>): AttentionPreferences {
  if (typeof raw.soundEnabled !== 'boolean' || !['en','am','om','so','ti'].includes(String(raw.language))) throw new Error('Choose your alert settings.');
  return { soundEnabled: raw.soundEnabled, language: raw.language as AttentionPreferences['language'] };
}

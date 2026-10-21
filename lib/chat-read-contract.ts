/** A visible message acknowledgement, never a fetch/delivery acknowledgement. */
export type ChatReadCommand = { messageId: unknown; publicRef?: unknown };

export function confirmedMessageId(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw new Error('Choose a visible message.');
  }
  return value;
}

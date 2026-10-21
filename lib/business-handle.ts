/** Public page address validation; never grants ownership or publication rights. */
export function parseBusinessHandle(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Enter a page handle.');
  const handle = value.trim().replace(/^@/, '').toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,58}[a-z0-9]$/.test(handle)) {
    throw new Error('Use 3–60 English letters, numbers or hyphens.');
  }
  if (['suqpage', 'admin', 'support'].includes(handle)) throw new Error('This handle is not available.');
  return handle;
}

export const HANDLE_CHANGE_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;
export function nextHandleChangeAt(changedAt: number): number {
  return changedAt > 0 ? changedAt + HANDLE_CHANGE_INTERVAL_MS : 0;
}

/** Bounded browser HTTP adapter; callers retain their input for an explicit retry. */
export async function browserJson(
  url: string,
  init: RequestInit,
  options: {send?: typeof fetch; timeoutMs?: number} = {},
): Promise<{ok: boolean; body: Record<string, unknown>}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 20_000);
  try {
    const response = await (options.send || fetch)(url, {...init, signal: controller.signal});
    const body: unknown = await response.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('Invalid response');
    return {ok: response.ok, body: body as Record<string, unknown>};
  } catch {
    throw Error('Unable to connect. Please try again.');
  } finally {
    clearTimeout(timer);
  }
}

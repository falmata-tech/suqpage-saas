export type AuthFetchPort = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
const MAX_AUTH_BODY_BYTES = 2 * 1024 * 1024;
const connectionError = () => new Error("Unable to connect. Please try again.");

async function checkAuthBody(response: Response, signal: AbortSignal): Promise<void> {
  if (Number(response.headers.get("content-length") || 0) > MAX_AUTH_BODY_BYTES) {
    void response.body?.cancel().catch(() => {});
    throw connectionError();
  }
  // Native fetch implementations may expose arrayBuffer without a stream reader.
  if (!response.body?.getReader) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_AUTH_BODY_BYTES) throw connectionError();
    return;
  }
  const reader = response.body.getReader();
  let length = 0;
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    while (true) {
      if (signal.aborted) throw signal.reason || connectionError();
      const part = await reader.read();
      if (signal.aborted) throw signal.reason || connectionError();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > MAX_AUTH_BODY_BYTES) { cancel(); throw connectionError(); }
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}

/** Bound one existing Auth SDK HTTP call; retry and session policy remain with the SDK. */
export function boundedAuthFetch(send: AuthFetchPort = fetch, timeoutMs = 20_000): AuthFetchPort {
  return async (input, init) => {
    const controller = new AbortController();
    const caller = init?.signal !== undefined ? init.signal
      : typeof Request !== "undefined" && input instanceof Request ? input.signal : undefined;
    const forwardAbort = () => controller.abort(caller?.reason);
    const timer = setTimeout(() => controller.abort(connectionError()), timeoutMs);
    let rejectAbort: () => void = () => {};
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAbort = () => reject(controller.signal.reason || connectionError());
      controller.signal.addEventListener("abort", rejectAbort, { once: true });
    });
    if (caller?.aborted) forwardAbort();
    else caller?.addEventListener("abort", forwardAbort, { once: true });
    const operation = (async () => {
      if (controller.signal.aborted) throw controller.signal.reason || connectionError();
      const response = await send(input, { ...init, signal: controller.signal });
      // Retain the provider's response implementation. RN's global Response can
      // decode a reconstructed ArrayBuffer incorrectly for non-ASCII JSON data.
      const retained = response.clone();
      try {
        await checkAuthBody(response, controller.signal);
        if (controller.signal.aborted) throw controller.signal.reason || connectionError();
        return retained;
      } catch (error) {
        void retained.body?.cancel().catch(() => {});
        throw error;
      }
    })();
    try {
      return await Promise.race([operation, aborted]);
    } catch (error) {
      controller.abort(error);
      throw error;
    } finally {
      clearTimeout(timer);
      controller.signal.removeEventListener("abort", rejectAbort);
      caller?.removeEventListener("abort", forwardAbort);
    }
  };
}

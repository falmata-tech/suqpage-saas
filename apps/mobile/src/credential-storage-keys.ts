/** Credential namespaces are selected before any device storage access. */
export type CredentialStorageKeys = Readonly<{ owner: string; transport: string }>;

function encodedOrigin(value: string): string {
  let url: URL;
  try { url = new URL(value); }
  catch { throw new Error("A valid HTTP(S) credential origin is required."); }
  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.origin === "null")
    throw new Error("A valid HTTP(S) credential origin is required.");
  // URL.origin is canonical ASCII, without credentials/path/query. Hex is
  // lossless and uses only characters accepted by native SecureStore.
  return Array.from(url.origin, character => character.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

export function credentialStorageKeys(development: boolean, apiOrigin: string, authOrigin?: string): CredentialStorageKeys {
  if (!development) return { owner: "suqpage-owner-session", transport: "suqpage-transport" };
  const api = encodedOrigin(apiOrigin);
  const auth = authOrigin ? encodedOrigin(authOrigin) : "unconfigured";
  return {
    owner: `suqpage-owner-session.dev.${api}.${auth}`,
    transport: `suqpage-transport.dev.${api}`,
  };
}

import { execFile } from "node:child_process";

export type CredentialSource = "env" | "cli";
export class AuthCredentialError extends Error {}
type CommandOptions = { timeout: number; maxBuffer: number; env: NodeJS.ProcessEnv };
export type KeychainCommandPort = (
  command: string, args: string[], options: CommandOptions,
) => Promise<{ status: number; stdout: string }>;

const executeKeychain: KeychainCommandPort = (command, args, options) => new Promise(resolve => {
  execFile(command, args, { ...options, encoding: "utf8" }, (error, stdout) => {
    // Never retain or propagate subprocess errors: they can contain secret output.
    resolve({ status: error ? (typeof error.code === "number" ? error.code : -1) : 0, stdout });
  });
});

/** Default Supabase CLI profile only; no profile files, endpoint or dotenv discovery. */
export async function readCliKeychainToken(
  platform: NodeJS.Platform = process.platform, execute: KeychainCommandPort = executeKeychain,
): Promise<string> {
  if (platform !== "darwin") throw new AuthCredentialError("Saved CLI credentials currently require macOS Keychain; select env on this platform.");
  try {
    for (const account of ["supabase", "access-token"]) {
      const result = await execute("/usr/bin/security", ["find-generic-password", "-s", "Supabase CLI", "-a", account, "-w"],
        { timeout: 60_000, maxBuffer: 8192, env: { NODE_ENV: "production" } });
      // Supabase CLI treats a successful empty password as an absent credential.
      if (result.status === 44 || (result.status === 0 && result.stdout.trim() === "")) continue;
      if (result.status !== 0 || result.stdout.length > 8192) break;
      let token = result.stdout.trim();
      if (token.startsWith("go-keyring-base64:")) {
        const encoded = token.slice("go-keyring-base64:".length);
        const bytes = Buffer.from(encoded, "base64");
        if (bytes.toString("base64") !== encoded) break;
        token = bytes.toString("utf8");
      }
      if (!/^sbp_[A-Za-z0-9_-]{20,4096}$/.test(token)) break;
      return token;
    }
  } catch { /* Redact every native/process error. */ }
  throw new AuthCredentialError("Saved Supabase CLI login is missing, locked, denied or invalid. No alternate credential source was used.");
}

export async function resolveAuthCredential(
  selection: string = "env", envToken: string = "", readCli: () => Promise<string> = readCliKeychainToken,
): Promise<{ source: CredentialSource; token: string }> {
  if (selection !== "env" && selection !== "cli") throw new AuthCredentialError("Choose --credential-source env or cli.");
  if (selection === "cli") {
    if (envToken) throw new AuthCredentialError("Both env and cli credentials were selected. Unset SUPABASE_ACCESS_TOKEN to use the saved login explicitly.");
    try { return { source: "cli", token: await readCli() }; }
    catch { throw new AuthCredentialError("Saved Supabase CLI login could not be read. No environment fallback or provider request was made."); }
  }
  if (!envToken || envToken.length > 8192 || /\s/.test(envToken)) throw new AuthCredentialError("An explicit SUPABASE_ACCESS_TOKEN is required; choose --credential-source cli to use the saved login.");
  return { source: "env", token: envToken };
}

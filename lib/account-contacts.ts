export type AccountContacts = { email: string; account_phone: string };
export interface AccountContactPort {
  read(userId: number): Promise<AccountContacts | undefined>;
  savePhone(userId: number, phone: string): Promise<boolean>;
}

export function parseAccountPhone(input: unknown): string {
  if (typeof input !== "string" || input.length > 40 || /[\u0000-\u001f\u007f]/.test(input)) throw new Error("Enter a valid account phone with its country code.");
  const phone = input.trim().replace(/[ ()-]/g, "");
  if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error("Enter your account phone with + and its country code.");
  return phone;
}

// The actor comes from the authenticated session, never submitted form data.
export async function saveAccountPhone(port: AccountContactPort, actor: { id: number } | null, input: unknown) {
  if (!actor || !Number.isSafeInteger(actor.id) || actor.id <= 0) throw new Error("Sign in to update your account contacts.");
  const phone = parseAccountPhone(input);
  if (!await port.savePhone(actor.id, phone)) throw new Error("Your account was not found.");
}

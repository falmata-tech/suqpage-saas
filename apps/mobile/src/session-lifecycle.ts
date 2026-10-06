/** Clear private UI even when the provider or device storage cannot complete logout. */
export async function endLocalSession(port: {
  signOut: () => Promise<unknown>;
  clearPrivateState: () => void;
  removeStoredSession: () => Promise<void>;
}): Promise<void> {
  try {
    await port.signOut();
  } finally {
    port.clearPrivateState();
    await port.removeStoredSession();
  }
}

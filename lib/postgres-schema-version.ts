/** Required PostgreSQL history ends here; retired data-only27–30 form one group. */
export const LATEST_POSTGRES_MIGRATION_VERSION = 80;

/** Input is the bounded, ascending ledger. Only the two proven histories match. */
export function isSupportedPostgresMigrationLedger(versions: readonly unknown[]): boolean {
  const full = versions.length === LATEST_POSTGRES_MIGRATION_VERSION;
  if (!full && versions.length !== LATEST_POSTGRES_MIGRATION_VERSION - 4) return false;
  let index = 0;
  for (let version = 1; version <= LATEST_POSTGRES_MIGRATION_VERSION; version++) {
    if (!full && version >= 27 && version <= 30) continue;
    if (versions[index++] !== version) return false;
  }
  return true;
}

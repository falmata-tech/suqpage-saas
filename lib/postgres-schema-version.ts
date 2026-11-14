/** Required PostgreSQL history ends here; retired data-only27–30 form one group. */
export const LATEST_POSTGRES_MIGRATION_VERSION = 83;
// Migration81 changes permissions/settings only; schema80 stays compatible
// while the separately guarded hosted correction is being rolled out.
// Migration82 adds private, disabled demo state. Ordinary application readiness
// retains exact80/81 histories; the worker never fabricates a missing ledger/table.
export const MINIMUM_POSTGRES_MIGRATION_VERSION = 80;

/** Input is bounded and ascending; admit only exact reviewed rollout histories. */
export function isSupportedPostgresMigrationLedger(versions: readonly unknown[]): boolean {
  for (const end of [MINIMUM_POSTGRES_MIGRATION_VERSION,81,82,LATEST_POSTGRES_MIGRATION_VERSION]) {
    const full = versions.length === end;
    if (!full && versions.length !== end - 4) continue;
    const expected=Array.from({length:end},(_,index)=>index+1)
      .filter(version=>full||version<27||version>30);
    if (expected.every((version,index)=>versions[index]===version)) return true;
  }
  return false;
}

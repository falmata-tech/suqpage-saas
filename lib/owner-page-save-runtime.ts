import { isPageOwner, type OwnerPageDraft } from './owner-page-domain';
import { ownerPagePort } from './owner-page-runtime';
import { saveOwnerPage, startOwnerPage } from './owner-page-service';
import { changePagePublication, type PagePublication } from './owner-page-publication';
import { pagePublicationPort } from './owner-page-publication-runtime';
import { runtimeGet, runtimeTransaction } from './runtime-sql';
import type { SessionUser } from './types';

// Keep the draft and live publication in one PostgreSQL transaction. Staff saves
// remain drafts; only a canonical owner can replace publicly visible content.
export async function saveOwnerPageAndPublication(actor: SessionUser, businessId: number,
  input: { action: 'start' | 'save'; version?: unknown; content: unknown },
): Promise<OwnerPageDraft & { publication: PagePublication | null }> {
  return runtimeTransaction(async () => {
    const saved = input.action === 'start'
      ? await startOwnerPage(ownerPagePort, actor, businessId, input.content)
      : await saveOwnerPage(ownerPagePort, actor, businessId, input.version, input.content);
    const current = await pagePublicationPort.latest(businessId);
    const active = await runtimeGet("SELECT 1 FROM businesses WHERE id=? AND status='active'", [businessId]);
    const publication = isPageOwner(actor, businessId) && active
      ? await changePagePublication(ownerPagePort, pagePublicationPort, actor, businessId,
        { action: 'publish', version: saved.version, revision: current?.revision || 0 })
      : current;
    return { ...saved, publication };
  });
}

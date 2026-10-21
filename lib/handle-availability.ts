import { parseBusinessHandle } from './business-handle';
import { runtimeGet } from './runtime-sql';

export async function getHandleAvailability(value: unknown): Promise<{handle: string; available: boolean}> {
  const handle = parseBusinessHandle(value);
  // Draft, suspended and hidden businesses retain ownership of their address.
  const existing = await runtimeGet('SELECT 1 FROM business_handles WHERE handle=? LIMIT 1', [handle]);
  return {handle, available: !existing};
}

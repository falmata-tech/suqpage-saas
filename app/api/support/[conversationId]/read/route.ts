import { NextRequest, NextResponse } from 'next/server';
import { apiUser } from '@/lib/auth';
import { assertSameOrigin } from '@/lib/security';
import { acknowledgeSupportRead, SupportError } from '@/lib/support';
import {scheduleAttentionDelivery} from '@/lib/attention-after';

function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    try { assertSameOrigin(request); } catch { return json({ error: 'Request could not be accepted.' }, 403); }
    const user = await apiUser();
    if (!user) return json({ error: 'Sign in to continue.' }, 401);
    if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return json({ error: 'Send a JSON request.' }, 415);
    const id = Number((await params).conversationId);
    if (!Number.isSafeInteger(id) || id < 1) return json({ error: 'Support conversation was not found.' }, 404);
    const reader = request.body?.getReader();
    const parts: Uint8Array[] = []; let length = 0;
    if (reader) try { while (true) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > 1024) { await reader.cancel(); return json({ error: 'Request is too large.' }, 413); } parts.push(part.value); } } finally { reader.releaseLock(); }
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(parts).toString('utf8')); } catch { return json({ error: 'Request could not be accepted.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !['messageId','publicRef'].includes(key))) return json({ error: 'Request could not be accepted.' }, 400);
    const command = body as { messageId?: unknown; publicRef?: unknown };
    const result=await acknowledgeSupportRead(user, id, { messageId: command.messageId, publicRef: command.publicRef });
    if(result.joined)scheduleAttentionDelivery();return json(result);
  } catch (error) {
    if (error instanceof SupportError) return json({ error: error.message, code: error.code }, error.code === 'not_found' ? 404 : 400);
    return json({ error: 'Support is temporarily unavailable.' }, 500);
  }
}

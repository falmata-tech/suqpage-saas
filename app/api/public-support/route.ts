import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// Both transport and the legacy buying alias reached the transport queue.
// Product inquiries have their own API; no public chat channel remains open.
function retired() {
  return NextResponse.json({error:'Live support is available from your business dashboard.',code:'public_chat_retired'},
    {status:410,headers:{'Cache-Control':'private, no-store'}});
}
export async function GET(_request:NextRequest) {return retired();}
export async function POST(_request:NextRequest) {return retired();}
export async function DELETE(_request:NextRequest) {return retired();}

import {createTransportPlanHttpHandler} from '@/lib/transport-plan-http';
import {TransportPlanError} from '@/lib/transport-plan-contract';
import {consumeRuntimeRateLimit} from '@/lib/rate-limit-runtime';
import {hashPrivateValue,requestIpFromHeaders} from '@/lib/security';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const handler=createTransportPlanHttpHandler({
 read:async()=>{throw new TransportPlanError('Shipment record was not found.','not_found');},
 allow:async request=>(await consumeRuntimeRateLimit('transport-plan:'+hashPrivateValue(requestIpFromHeaders(request.headers)),600,60_000)).allowed,
});

export const GET=handler;
export const HEAD=handler;
export const POST=handler;
export const PUT=handler;
export const PATCH=handler;
export const DELETE=handler;
export const OPTIONS=handler;

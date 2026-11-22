const webRoots = [
  '/tracking', '/transport-plan', '/dashboard/tracking', '/dashboard/transport',
  '/api/tracking', '/api/transport-plan', '/api/owner-transport', '/api/public-support/attachments',
];

export function isRetiredTransportPath(path: string): boolean {
  return webRoots.some(root => path === root || path.startsWith(root + '/'))
    || /^\/dashboard\/support\/[^/]+\/plan(?:\/|$)/.test(path);
}

export function isRetiredMobileTransport(path: readonly string[]): boolean {
  return ['buying', 'transport', 'tracking', 'transport-plan', 'transport-partners'].includes(path[0])
    || path[0] === 'owner' && path[1] === 'transport';
}

export function retiredTransportResponse(): Response {
  return Response.json({error: 'This service is no longer available.', code:'transport_retired'}, {
    status: 410,
    headers: {'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'},
  });
}

export function activeBusinessSupport(participant: string | null, category: string | null): boolean {
  return participant === 'client' && category !== null && !['shipment_observation','buying_assistance'].includes(category);
}

export const BUSINESS_SUPPORT_SQL = `c.participant_kind='client' AND c.assistance_category NOT IN ('shipment_observation','buying_assistance')`;

import {test,expect} from './fixtures';

test('FE-078 the former transport surfaces are closed on web and mobile', async ({request}) => {
  for (const route of [
    '/tracking', '/tracking/example', '/transport-plan', '/dashboard/transport',
    '/dashboard/transport/history', '/dashboard/tracking', '/dashboard/tracking/new',
    '/dashboard/support/1/plan', '/api/owner-transport', '/api/public-support',
    '/api/public-support/attachments/1', '/api/tracking/records', '/api/transport-plan',
    '/api/mobile/v1/tracking/records', '/api/mobile/v1/owner/transport',
    '/api/mobile/v1/transport/attention', '/api/mobile/v1/buying', '/api/mobile/v1/transport-plan',
  ]) {
    const response = await request.get(route);
    expect(response.status(),route).toBe(410);
    expect(response.headers()['cache-control'],route).toContain('no-store');
  }
  for (const route of ['/api/owner-transport','/api/tracking/email/start','/api/mobile/v1/owner/transport']) {
    expect((await request.post(route,{data:{action:'start'}})).status(),route).toBe(410);
  }
});

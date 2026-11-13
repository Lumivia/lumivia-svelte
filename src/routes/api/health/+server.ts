import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  return json(
    {
      status: 'ok',
      service: 'lumivia-web',
      version: env.CF_PAGES_COMMIT_SHA || 'development',
      requestId: locals.requestId,
      timestamp: new Date().toISOString()
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
};

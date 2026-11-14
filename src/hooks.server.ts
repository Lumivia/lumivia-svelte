import type { Handle, HandleServerError } from '@sveltejs/kit';
import { registrarAdvertencia, registrarError } from '$lib/server/observabilidad';

export const handle: Handle = async ({ event, resolve }) => {
  const inicio = performance.now();
  const requestId = crypto.randomUUID();
  event.locals.requestId = requestId;

  const response = await resolve(event);
  const duracion = Math.round(performance.now() - inicio);
  const headers = new Headers(response.headers);
  headers.set('X-Request-Id', requestId);
  headers.append('Server-Timing', `app;dur=${duracion}`);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (event.url.protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  if (duracion >= 1500) {
    registrarAdvertencia('http.slow_request', {
      requestId,
      method: event.request.method,
      path: event.url.pathname,
      status: response.status,
      durationMs: duracion
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

export const handleError: HandleServerError = ({ error, event, status, message }) => {
  const requestId = event.locals.requestId || crypto.randomUUID();
  registrarError('http.unexpected_error', error, {
    requestId,
    method: event.request.method,
    path: event.url.pathname,
    status
  });

  return { message: status >= 500 ? 'Ocurrió un error inesperado.' : message, requestId };
};

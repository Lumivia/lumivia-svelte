import assert from 'node:assert/strict';
import test from 'node:test';
import { ErrorSolicitud, leerObjetoJson } from '../src/lib/server/request.ts';

test('acepta únicamente objetos JSON', async () => {
  const request = new Request('https://lumivia.app/api/prueba', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ destino: 'MAD' })
  });

  assert.deepEqual(await leerObjetoJson(request), { destino: 'MAD' });
});

test('rechaza JSON malformado con estado 400', async () => {
  const request = new Request('https://lumivia.app/api/prueba', { method: 'POST', body: '{' });

  await assert.rejects(
    () => leerObjetoJson(request),
    (error: unknown) => error instanceof ErrorSolicitud && error.status === 400
  );
});

test('rechaza arreglos como cuerpo de una API de objeto', async () => {
  const request = new Request('https://lumivia.app/api/prueba', { method: 'POST', body: '[]' });

  await assert.rejects(
    () => leerObjetoJson(request),
    (error: unknown) => error instanceof ErrorSolicitud && error.status === 400
  );
});

test('rechaza cuerpos mayores al límite con estado 413', async () => {
  const request = new Request('https://lumivia.app/api/prueba', {
    method: 'POST',
    body: JSON.stringify({ contenido: 'x'.repeat(17 * 1024) })
  });

  await assert.rejects(
    () => leerObjetoJson(request),
    (error: unknown) => error instanceof ErrorSolicitud && error.status === 413
  );
});

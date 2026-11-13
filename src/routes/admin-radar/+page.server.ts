import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { limitarSolicitud, obtenerClaveCliente } from '$lib/server/rate-limit';
import { registrarAdvertencia, registrarError, registrarEvento } from '$lib/server/observabilidad';

const COOKIE_SESION = 'lumivia_admin_radar';
const DURACION_SESION = 8 * 60 * 60;

function base64Url(bytes: Uint8Array): string {
  let binario = '';
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function firmar(valor: string, secreto: string): Promise<string> {
  const encoder = new TextEncoder();
  const llave = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const firma = await crypto.subtle.sign('HMAC', llave, encoder.encode(valor));
  return base64Url(new Uint8Array(firma));
}

function compararSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferencia === 0;
}

async function crearSesion(secreto: string): Promise<string> {
  const expira = String(Date.now() + DURACION_SESION * 1000);
  return `${expira}.${await firmar(expira, secreto)}`;
}

async function sesionValida(token: string | undefined, secreto: string): Promise<boolean> {
  if (!token) return false;
  const [expira, firma, extra] = token.split('.');
  if (!expira || !firma || extra || !/^\d+$/.test(expira) || Number(expira) <= Date.now()) return false;
  return compararSeguro(firma, await firmar(expira, secreto));
}

async function credencialValida(recibida: string, esperada: string): Promise<boolean> {
  const [hashRecibido, hashEsperado] = await Promise.all([
    firmar('credencial', recibida),
    firmar('credencial', esperada)
  ]);
  return compararSeguro(hashRecibido, hashEsperado);
}

export const load: PageServerLoad = async ({ cookies, setHeaders }) => {
  setHeaders({ 'Cache-Control': 'no-store' });
  const secreto = env.ADMIN_PASSWORD || '';

  return {
    configured: Boolean(secreto),
    authenticated: secreto ? await sesionValida(cookies.get(COOKIE_SESION), secreto) : false
  };
};

export const actions: Actions = {
  login: async ({ request, cookies, getClientAddress, locals, url }) => {
    const cliente = obtenerClaveCliente(request, getClientAddress);
    const limite = limitarSolicitud(`admin-radar:${cliente}`, 5, 15 * 60 * 1000);

    if (!limite.permitido) {
      registrarAdvertencia('admin_radar.rate_limited', { requestId: locals.requestId });
      return fail(429, { message: 'Demasiados intentos. Espera unos minutos antes de volver a intentar.' });
    }

    const secreto = env.ADMIN_PASSWORD || '';
    if (!secreto) {
      registrarError('admin_radar.config_error', 'ADMIN_PASSWORD ausente', { requestId: locals.requestId });
      return fail(503, { message: 'El acceso administrativo no está configurado.' });
    }

    const formData = await request.formData();
    const password = String(formData.get('password') ?? '').slice(0, 256);
    if (!password || !(await credencialValida(password, secreto))) {
      registrarAdvertencia('admin_radar.access_denied', { requestId: locals.requestId });
      return fail(401, { message: 'Credenciales incorrectas.' });
    }

    cookies.set(COOKIE_SESION, await crearSesion(secreto), {
      httpOnly: true,
      sameSite: 'strict',
      secure: url.protocol === 'https:',
      path: '/admin-radar',
      maxAge: DURACION_SESION
    });
    registrarEvento('admin_radar.login', { requestId: locals.requestId });
    throw redirect(303, '/admin-radar');
  },

  logout: async ({ cookies, locals }) => {
    cookies.delete(COOKIE_SESION, { path: '/admin-radar' });
    registrarEvento('admin_radar.logout', { requestId: locals.requestId });
    throw redirect(303, '/admin-radar');
  }
};

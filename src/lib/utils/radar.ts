export type SolicitudRadar = {
  nombre: string;
  origen: string;
  destino: string;
  mes: string;
  contacto: string;
  website?: string;
};

export async function crearRadar(solicitud: SolicitudRadar): Promise<void> {
  const respuesta = await fetch('/api/radar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solicitud)
  });

  if (!respuesta.ok) {
    const resultado = await respuesta.json().catch(() => null);
    throw new Error(resultado?.message || 'No pudimos activar el radar.');
  }
}

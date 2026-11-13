export class ErrorSolicitud extends Error {
  constructor(
    public readonly status: 400 | 413,
    message: string
  ) {
    super(message);
    this.name = 'ErrorSolicitud';
  }
}

export async function leerObjetoJson(
  request: Request,
  maximoBytes = 16 * 1024
): Promise<Record<string, unknown>> {
  const longitudDeclarada = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(longitudDeclarada) && longitudDeclarada > maximoBytes) {
    throw new ErrorSolicitud(413, 'La solicitud es demasiado grande.');
  }

  const texto = await request.text();
  if (new TextEncoder().encode(texto).byteLength > maximoBytes) {
    throw new ErrorSolicitud(413, 'La solicitud es demasiado grande.');
  }

  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch {
    throw new ErrorSolicitud(400, 'El cuerpo de la solicitud no es JSON válido.');
  }

  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    throw new ErrorSolicitud(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
  }

  return valor as Record<string, unknown>;
}

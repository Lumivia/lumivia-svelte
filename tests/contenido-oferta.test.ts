import assert from 'node:assert/strict';
import test from 'node:test';
import { separarContenidoOferta } from '../src/lib/utils/contenido-oferta.ts';

test('separa hospedaje y actividad de la descripción de la tarifa aérea', () => {
  const contenido = separarContenidoOferta(`Una opción directa para cambiar el estrés por el mar.

— Destino: Cancún
— Fechas: del 5 al 14 de marzo
— Tarifa Aérea: $2,111 MXN
— Conexiones: 0 escalas
— Hospedaje: Nomads Hotel & Rooftop Pool Cancún
— Actividad: Tour en catamarán a Isla Mujeres

El Caribe es una gran opción para recargar energía.

👇 Comenta la palabra VUELO`);

  assert.equal(contenido.sugerencias.length, 2);
  assert.deepEqual(contenido.sugerencias[0], {
    tipo: 'Hospedaje sugerido',
    detalle: 'Nomads Hotel & Rooftop Pool Cancún'
  });
  assert.deepEqual(contenido.sugerencias[1], {
    tipo: 'Actividad sugerida',
    detalle: 'Tour en catamarán a Isla Mujeres'
  });
  assert.equal(contenido.descripcion.includes('Hospedaje:'), false);
  assert.equal(contenido.descripcion.includes('Actividad:'), false);
  assert.equal(contenido.descripcion.includes('Tarifa Aérea: $2,111 MXN'), true);
  assert.equal(contenido.descripcion.includes('El Caribe es una gran opción'), true);
});

test('mantiene intacta una descripción que no contiene sugerencias', () => {
  const contenido = separarContenidoOferta('Vuelo directo de Ciudad de México a Cancún.');

  assert.equal(contenido.descripcion, 'Vuelo directo de Ciudad de México a Cancún.');
  assert.deepEqual(contenido.sugerencias, []);
});

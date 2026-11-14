import assert from 'node:assert/strict';
import test from 'node:test';
import {
  deduplicarOfertas,
  esOfertaVigente,
  filtrarOfertasPublicables,
  tituloOferta
} from '../src/lib/utils/ofertas.ts';

test('solo considera vigentes las ofertas activas con fecha válida', () => {
  assert.equal(esOfertaVigente({ fecha_salida: '2027-01-02' }, '2027-01-01'), true);
  assert.equal(esOfertaVigente({ fecha_salida: '2026-12-31' }, '2027-01-01'), false);
  assert.equal(esOfertaVigente({ fecha_salida: '2027-01-02', expirada_manualmente: true }, '2027-01-01'), false);
  assert.equal(esOfertaVigente({ fecha_salida: 'fecha-inválida' }, '2027-01-01'), false);
});

test('deduplica una ruta y conserva la oferta de mayor calidad', () => {
  const resultado = deduplicarOfertas([
    { id: 1, origen: 'MEX', destino: 'MAD', fecha_salida: '2027-02-01', fecha_regreso: '2027-02-08', precio: 12000, calidad_oferta: 7 },
    { id: 2, origen: 'MEX', destino: 'MAD', fecha_salida: '2027-02-01', fecha_regreso: '2027-02-08', precio: 12000, calidad_oferta: 9 }
  ]);

  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].id, 2);
});

test('filtra expiradas y duplicadas en una sola operación', () => {
  const resultado = filtrarOfertasPublicables([
    { id: 1, origen: 'MEX', destino: 'CUN', fecha_salida: '2027-03-01', fecha_regreso: '2027-03-05', precio: 3000 },
    { id: 2, origen: 'MEX', destino: 'CUN', fecha_salida: '2027-03-01', fecha_regreso: '2027-03-05', precio: 3000 },
    { id: 3, origen: 'MEX', destino: 'LAX', fecha_salida: '2026-01-01', fecha_regreso: '2026-01-05', precio: 4000 }
  ], '2027-01-01');

  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].destino, 'CUN');
});

test('genera un título útil cuando el título editorial es genérico', () => {
  assert.equal(tituloOferta({ titulo_gancho: 'Oferta especial', origen_nombre: 'Ciudad de México', destino_nombre: 'Madrid' }), 'Ciudad de México → Madrid');
  assert.equal(tituloOferta({ titulo_gancho: 'Madrid por menos' }), 'Madrid por menos');
});

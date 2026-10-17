import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import * as db from '../../src/datos/db';
import { avatarInicial, borrarJugadora, cambiarClaveAdulta, crearCuenta, crearJugadora, elegirJugadora, iniciar, jugadoraActual, leerEstado, verificarAdulta } from '../../src/datos/estado';
import { alimentarMascota, banarMascota, comprarItem, completarGrado, elegirMascota, elegirMeta, guardarEnAlcancia, ofertasDeLaSemana, perderMonedas, registrarIntento, sinLoNoComprado } from '../../src/datos/juego';
import { ITEMS } from '../../src/content/catalogo';
import { config, MUNDOS } from '../../src/content';
import { resumirJugadora, totales } from '../../src/datos/resumen';
import { esCreadora, gradoDesbloqueado, modoCreadora, mundoDesbloqueado } from '../../src/engine/progreso';

beforeEach(async () => {
  await db.borrarTodo();
  await iniciar();
});

describe('cuenta y perfiles', () => {
  it('si se olvida la contraseña, se crea otra y los perfiles quedan', async () => {
    await crearCuenta('mama@ejemplo.com', 'secreta123');
    await crearJugadora('Cometa', '2.º grado');
    await cambiarClaveAdulta('nuevaclave9');
    expect(await verificarAdulta('secreta123')).toBe(false);
    expect(await verificarAdulta('nuevaclave9')).toBe(true);
    expect(leerEstado().jugadoras).toHaveLength(1);
    expect(leerEstado().cuenta?.email).toBe('mama@ejemplo.com');
  });

  it('la contraseña de la adulta se guarda como hash', async () => {
    await crearCuenta('mama@ejemplo.com', 'secreta123');
    const c = await db.leerCuenta();
    expect(c?.hash).not.toContain('secreta');
    expect(await verificarAdulta('secreta123')).toBe(true);
    expect(await verificarAdulta('otra')).toBe(false);
  });

  it('borrar un perfil elimina todos sus datos', async () => {
    const j = await crearJugadora('Estrellita', '2.º grado');
    const otra = await crearJugadora('Lunita', '2.º grado');
    elegirJugadora(j.id);
    await registrarIntento({ nivelId: 'valle-1', plantillaId: 'suma', params: '{}', respuesta: '5', correcta: true, pistas: 0, ms: 1000 });
    elegirJugadora(otra.id);
    await registrarIntento({ nivelId: 'valle-1', plantillaId: 'suma', params: '{}', respuesta: '7', correcta: false, errorTag: 'suma.calculo', pistas: 0, ms: 1000 });
    await borrarJugadora(j.id);
    expect(await db.intentosDe(j.id)).toHaveLength(0);
    expect((await db.leerJugadoras()).map((x) => x.id)).toEqual([otra.id]);
    expect(await db.intentosDe(otra.id)).toHaveLength(1);
    expect(leerEstado().jugadoras.find((x) => x.id === j.id)).toBeUndefined();
  });
});

describe('premios y economía', () => {
  it('completar el grado 1 da monedas, estrellas y un ítem exclusivo; repetir da 10', async () => {
    const j = await crearJugadora('Estrellita', '2.º grado');
    elegirJugadora(j.id);
    const antes = jugadoraActual()!.monedas;
    const p = await completarGrado('isla-1', 1, 3, 20, 300);
    expect(p.items).toEqual(['premio-isla-1']);
    expect(p.estrellas).toBe(3);
    expect(jugadoraActual()!.monedas).toBe(antes + config.economia.monedas.completarGrado);
    expect(jugadoraActual()!.items).toContain('premio-isla-1');
    const r = await completarGrado('isla-1', 1, 3, 20, 300);
    expect(r.monedas).toBe(config.economia.monedas.repetirGrado);
    expect(r.items).toEqual([]);
    expect(r.estrellas).toBe(0);
  });

  it('los 5 grados dan el accesorio raro y la estampita; la jefa da su avatar', async () => {
    const j = await crearJugadora('Estrellita', '2.º grado');
    elegirJugadora(j.id);
    for (let g = 1; g <= 4; g++) await completarGrado('isla-2', g, 2, 50, 300);
    const p = await completarGrado('isla-2', 5, 2, 500, 300);
    expect(p.items).toContain('raro-isla-2');
    expect(p.estampita).toBe('estampita-isla-2');
    const jefe = await completarGrado('isla-jefe', 1, 3, 100, 300);
    expect(jefe.items.length).toBe(3);
    expect(jefe.monedas).toBeGreaterThanOrEqual(config.economia.monedas.completarGrado + config.economia.monedas.vencerJefe);
  });

  it('el nivel 4 de un mundo abre el siguiente (no hace falta terminarlo entero)', async () => {
    const j = await crearJugadora('Estrellita', '2.º grado');
    elegirJugadora(j.id);
    const tres = await completarGrado('isla-3', 1, 2, 50, 300);
    expect(tres.mundoNuevo).toBeUndefined();
    const cuatro = await completarGrado('isla-4', 1, 2, 50, 300);
    expect(cuatro.mundoNuevo).toBe('valle');
    expect(mundoDesbloqueado(jugadoraActual()!.progreso, 'valle')).toBe(true);
    // Del Valle se abren dos: la Montaña y el Mercado.
    const valle = await completarGrado('valle-4', 1, 2, 50, 300);
    expect(valle.mundosNuevos).toEqual(expect.arrayContaining(['montana', 'mercado']));
  });

  it('el perfil de la creadora tiene todo abierto', () => {
    expect(esCreadora('Kimbo')).toBe(true);
    expect(esCreadora('Estrellita')).toBe(false);
    modoCreadora(true);
    expect(mundoDesbloqueado({}, 'tesoro')).toBe(true);
    expect(gradoDesbloqueado({}, MUNDOS[6], 'tesoro-jefe', 5)).toBe(true);
    modoCreadora(false);
    expect(mundoDesbloqueado({}, 'tesoro')).toBe(false);
  });

  it('comprar descuenta monedas y no deja comprar sin saldo ni premios', async () => {
    const j = await crearJugadora('Estrellita', '2.º grado');
    elegirJugadora(j.id);
    const barato = ITEMS.find((i) => i.desbloqueo === 'tienda' && !ofertasDeLaSemana().includes(i.id) && i.rareza === 'comun')!;
    const m0 = jugadoraActual()!.monedas;
    expect(await comprarItem(barato.id)).toBe('ok');
    expect(jugadoraActual()!.monedas).toBe(m0 - config.economia.precioPorRareza.comun);
    expect(await comprarItem(barato.id)).toBe('ya-lo-tenes');
    expect(await comprarItem('alas-cristal')).toBe('no-se-vende');
    expect(await comprarItem('vestido-estrellas')).toBe('sin-monedas');
  });

  it('la alcancía guarda monedas y al llegar a la meta da el ítem y un bono', async () => {
    const j = await crearJugadora('Estrellita', '2.º grado');
    elegirJugadora(j.id);
    const meta = ITEMS.find((i) => i.desbloqueo === 'tienda' && i.rareza === 'comun' && !ofertasDeLaSemana().includes(i.id))!;
    await elegirMeta(meta.id);
    const precio = config.economia.precioPorRareza.comun;
    expect(await guardarEnAlcancia(precio / 2)).toBe('ok');
    expect(await guardarEnAlcancia(precio / 2)).toBe('meta');
    expect(jugadoraActual()!.items).toContain(meta.id);
    expect(jugadoraActual()!.monedas).toBe(config.economia.monedasIniciales - precio + Math.round(precio * config.economia.alcancia.bonoAlLlegar));
  });
});

describe('equivocarse, comida y probador (pedidos de Ga)', () => {
  it('equivocarse resta monedas, pero nunca por debajo de 0', async () => {
    const j = await crearJugadora('Estrellita', '2.º grado');
    elegirJugadora(j.id);
    const m0 = jugadoraActual()!.monedas;
    expect(await perderMonedas(1)).toBe(1);
    expect(jugadoraActual()!.monedas).toBe(m0 - 1);
    expect(await perderMonedas(m0 + 50)).toBe(m0 - 1);
    expect(jugadoraActual()!.monedas).toBe(0);
    expect(await perderMonedas(1)).toBe(0);
  });

  it('la mascota come (cuesta monedas) y con la panza llena no quiere más', async () => {
    const j = await crearJugadora('Estrellita', '2.º grado');
    elegirJugadora(j.id);
    await elegirMascota('gatito', 'Michi');
    const m0 = jugadoraActual()!.monedas;
    const manzana = config.mascota.comidas.find((c) => c.id === 'manzana')!;
    expect(await alimentarMascota('manzana')).toBe('ok');
    expect(jugadoraActual()!.monedas).toBe(m0 - manzana.precio);
    while ((await alimentarMascota('manzana')) === 'ok');
    expect(jugadoraActual()!.mascota!.panza).toBeGreaterThanOrEqual(config.mascota.panzaLlena);
    expect(await alimentarMascota('manzana')).toBe('llena');
    expect(await banarMascota()).toBe(true);
    expect(jugadoraActual()!.mascota!.limpieza).toBe(100);
    expect(await banarMascota()).toBe(false);
  });

  it('lo que se probó y no se compró no queda puesto al guardar', () => {
    const caro = ITEMS.find((i) => i.desbloqueo === 'tienda' && i.capa === 'cabeza')!;
    const a = sinLoNoComprado({ ...avatarInicial(), cabeza: caro.id }, [], avatarInicial());
    expect(a.cabeza).toBeUndefined();
    expect(sinLoNoComprado({ ...avatarInicial(), cabeza: caro.id }, [caro.id], avatarInicial()).cabeza).toBe(caro.id);
  });
});

describe('panel de la creadora', () => {
  it('resume el avance de un perfil sin datos personales', async () => {
    const j = await crearJugadora('Kimbo', '2.º grado');
    elegirJugadora(j.id);
    await completarGrado('isla-1', 1, 3, 50, 300);
    await completarGrado('isla-2', 1, 2, 50, 300);
    const r = resumirJugadora(jugadoraActual()!);
    expect(r.apodo).toBe('Kimbo');
    expect(r.gradosCompletados).toBe(2);
    expect(r.mundos[0]).toMatchObject({ id: 'isla', niveles: 2, abierto: true });
    expect(r.dondeEsta).toContain('nivel 3');
    expect(JSON.stringify(r)).not.toContain('dibujosHash');
    expect(totales([r]).perfiles).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import { type EstadoMascota, alimentar, alVolver, avisoBarra, cacasVisibles, curar, debeEnfermarse, enRegresoFeliz, etapaDe, jugar, limpiarCaca, necesidadDe, nuevaMascota, porEstrellas, sumarDias } from '../../src/engine/mascota';

const hoy = '2026-10-12';

describe('mascota', () => {
  it('etapas: bebé 0–99, joven 100–199, grande 200–300', () => {
    expect(etapaDe(0)).toBe('bebe');
    expect(etapaDe(99)).toBe('bebe');
    expect(etapaDe(100)).toBe('joven');
    expect(etapaDe(199)).toBe('joven');
    expect(etapaDe(200)).toBe('grande');
    expect(etapaDe(300)).toBe('grande');
  });

  it('sube +1 por estrella, +3 al alimentar y +2 al jugar (una vez por día)', () => {
    let m = nuevaMascota('dragon', 'Dragui', hoy);
    m = porEstrellas(m, 3, hoy);
    expect(m.crecimiento).toBe(3);
    m = alimentar(m, hoy);
    expect(m.crecimiento).toBe(6);
    m = jugar(m, hoy);
    expect(m.crecimiento).toBe(8);
    m = jugar(m, hoy);
    expect(m.crecimiento).toBe(8);
    m = jugar(m, sumarDias(hoy, 1));
    expect(m.crecimiento).toBe(10);
  });

  it('nunca pasa de 300', () => {
    let m = { ...nuevaMascota('gato', 'Michi', hoy), crecimiento: 299 };
    m = porEstrellas(m, 10, hoy);
    expect(m.crecimiento).toBe(300);
  });

  it('con la barra llena tarda 24 días en volver a joven y unos 44 en volver a bebé', () => {
    const llena = { ...nuevaMascota('dragon', 'Dragui', hoy), crecimiento: 300 };
    expect(etapaDe(alVolver(llena, sumarDias(hoy, 23)).crecimiento)).toBe('grande');
    expect(etapaDe(alVolver(llena, sumarDias(hoy, 24)).crecimiento)).toBe('joven');
    expect(etapaDe(alVolver(llena, sumarDias(hoy, 43)).crecimiento)).toBe('joven');
    expect(etapaDe(alVolver(llena, sumarDias(hoy, 44)).crecimiento)).toBe('bebe');
  });

  it('los primeros 3 días sin jugar no baja', () => {
    const m = { ...nuevaMascota('dragon', 'Dragui', hoy), crecimiento: 150 };
    expect(alVolver(m, sumarDias(hoy, 3)).crecimiento).toBe(150);
    expect(alVolver(m, sumarDias(hoy, 4)).crecimiento).toBe(145);
  });

  it('nunca desaparece: la etapa mínima es bebé y conserva nombre y accesorios', () => {
    const m = { ...nuevaMascota('dragon', 'Dragui', hoy), crecimiento: 20, accesorios: ['moño'] };
    const r = alVolver(m, sumarDias(hoy, 400));
    expect(r.crecimiento).toBe(0);
    expect(r.nombre).toBe('Dragui');
    expect(r.accesorios).toEqual(['moño']);
    expect(r.contento).toBeGreaterThanOrEqual(30);
    expect(r.panza).toBeGreaterThanOrEqual(20);
  });

  it('al volver gana puntos dobles por 3 días', () => {
    const m = { ...nuevaMascota('dragon', 'Dragui', hoy), crecimiento: 150 };
    const vuelta = sumarDias(hoy, 10);
    let r = alVolver(m, vuelta);
    expect(enRegresoFeliz(r, vuelta)).toBe(true);
    const antes = r.crecimiento;
    r = porEstrellas(r, 2, vuelta);
    expect(r.crecimiento).toBe(antes + 4);
    expect(enRegresoFeliz(r, sumarDias(vuelta, 2))).toBe(true);
    expect(enRegresoFeliz(r, sumarDias(vuelta, 3))).toBe(false);
  });

  it('avisa cuando falta poco para crecer y cuando está por volver a una etapa anterior', () => {
    const base = nuevaMascota('dragon', 'Dragui', hoy);
    expect(avisoBarra({ ...base, crecimiento: 190 })).toEqual({ tipo: 'crecer', faltan: 10 });
    expect(avisoBarra({ ...base, crecimiento: 205 }).tipo).toBe('bajar');
    expect(avisoBarra({ ...base, crecimiento: 160 })).toEqual({ tipo: 'crecer', faltan: 40 });
  });
});

describe('caca y enfermedad (pedido de Ga)', () => {
  const T0 = Date.parse('2026-10-12T15:00:00Z');
  it('un ratito después de comer hace caca, y se limpia tocándola', () => {
    let m = alimentar(nuevaMascota('gatito', 'Michi', hoy), hoy, 'manzana', undefined, T0);
    expect(cacasVisibles(m, T0)).toBe(0);
    expect(cacasVisibles(m, T0 + 3 * 60_000)).toBe(1);
    expect(necesidadDe(m, T0 + 3 * 60_000)).toBe('caca');
    m = limpiarCaca(m, T0 + 3 * 60_000);
    expect(cacasVisibles(m, T0 + 3 * 60_000)).toBe(0);
  });

  it('con mucha caca o muy sucia se enferma; el remedio la cura y queda protegida un rato', () => {
    let m: EstadoMascota = { ...nuevaMascota('gatito', 'Michi', hoy), cacas: [T0, T0, T0] };
    expect(debeEnfermarse(m, T0)).toBe(true);
    m = { ...m, enferma: true };
    expect(necesidadDe(m, T0)).toBe('enferma');
    m = curar(m, T0);
    expect(m.enferma).toBe(false);
    expect(debeEnfermarse(m, T0 + 60_000)).toBe(false);
    expect(debeEnfermarse(m, T0 + 7 * 3_600_000)).toBe(true);
  });

  it('si no la visitan, al volver hay caca y puede estar enfermita (nunca se va)', () => {
    const m = alVolver(nuevaMascota('gatito', 'Michi', hoy), sumarDias(hoy, 5), T0);
    expect(cacasVisibles(m, T0)).toBeGreaterThan(0);
    expect(m.enferma).toBe(true);
  });
});

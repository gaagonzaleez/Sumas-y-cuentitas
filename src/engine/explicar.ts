// Elige cómo explicar una cuenta según sus números, como lo haría una seño:
// contando, completando el 10, por decenas, por columnas o saltando de un número al otro.
// Acá solo se calculan los datos; las frases están en content/lecciones.json.
import { cifras, plural } from './generadores/comun';

const lista = (desde: number, hasta: number, paso: number) => {
  const l: number[] = [];
  for (let x = desde; paso > 0 ? x <= hasta : x >= hasta; x += paso) l.push(x);
  return l;
};

/** "8, 9, 10" (si son muchos: "8, 9, …, 20"). */
function conteo(nums: number[]): string {
  return nums.length <= 6 ? nums.join(', ') : `${nums.slice(0, 3).join(', ')}, …, ${nums[nums.length - 1]}`;
}

/** Grupos de decenas o centenas: "4 decenas", "6 centenas". */
function grupo(n: number, lugar: 'decena' | 'centena') {
  const k = lugar === 'centena' ? n / 100 : n / 10;
  return { k, txt: plural(k, lugar, `${lugar}s`) };
}

/** Saltos para ir de un número a otro pasando por números redondos: 185 → 190 → 200 → 203. */
export function saltos(desde: number, hasta: number) {
  const puntos = [desde];
  let cur = desde;
  const saltar = (j: number) => {
    if (j > 0) {
      cur += j;
      puntos.push(cur);
    }
  };
  if (cur % 10 !== 0) saltar(Math.min(10 - (cur % 10), hasta - cur));
  if (cur % 100 !== 0 && hasta - cur >= 10) saltar(Math.min(Math.ceil(cur / 100) * 100, cur + Math.floor((hasta - cur) / 10) * 10) - cur);
  if (hasta - cur >= 100) saltar(Math.floor((hasta - cur) / 100) * 100);
  if (hasta - cur >= 10) saltar(Math.floor((hasta - cur) / 10) * 10);
  saltar(hasta - cur);
  const tramos = puntos.slice(1).map((p, i) => p - puntos[i]);
  return {
    saltosTexto: puntos.join(' → '),
    sumaSaltos: tramos.join(' + '),
    variosSaltos: tramos.length > 1,
  };
}

/** Datos para "¿cuánto falta del {a} al {meta}?" */
export function datosFalta(a: number, meta: number) {
  return { a, meta, r: meta - a, desde: a, hasta: meta, ...saltos(a, meta) };
}

export function explicarSuma(a: number, b: number, c?: number): Record<string, string | number | boolean> {
  const r = a + b + (c ?? 0);
  const mayor = Math.max(a, b);
  const menor = Math.min(a, b);
  if (c !== undefined && c > 0) {
    // Tres números: si dos forman un número redondo, se suman primero.
    const nums = [a, b, c];
    let par: [number, number] = [0, 1];
    for (const [i, j] of [[0, 1], [0, 2], [1, 2]] as [number, number][]) {
      if ((nums[i] + nums[j]) % 10 === 0) {
        par = [i, j];
        break;
      }
    }
    const [x, y] = [nums[par[0]], nums[par[1]]];
    const z = nums[3 - par[0] - par[1]];
    const redondo = (x + y) % 100 === 0 || ((x + y) % 10 === 0 && x + y <= 100);
    return { estrategia: 'suma-tres', x, y, z, xy: x + y, redondo, cuentaCompleta: nums.join(' + '), r };
  }
  for (const lugar of ['centena', 'decena'] as const) {
    const t = lugar === 'centena' ? 100 : 10;
    if (a % t === 0 && b % t === 0 && a > 0 && b > 0 && (lugar === 'centena' || r <= 100)) {
      const ga = grupo(a, lugar);
      const gb = grupo(b, lugar);
      return { estrategia: 'suma-grupos', grupoA: ga.txt, grupoB: gb.txt, ka: ga.k, kb: gb.k, grupoR: grupo(r, lugar).txt, r };
    }
  }
  if (r <= 10 || (menor <= 3 && mayor < 1000)) {
    return { estrategia: 'suma-contando', desde: mayor, conteo: conteo(lista(mayor + 1, r, 1)), r };
  }
  if (menor < 10 && (mayor % 10) + menor > 10 && mayor < 100) {
    // Completar el número redondo: 8 + 5 = 8 + 2 + 3.
    const redondo = Math.ceil(mayor / 10) * 10;
    const f = redondo - mayor;
    return { estrategia: 'suma-diez', desde: mayor, redondo, f, faltan: f === 1 ? 'falta' : 'faltan', resto: menor - f, r, saltosTexto: `${mayor} → ${redondo} → ${r}` };
  }
  const [u1, d1 = 0, c1 = 0] = cifras(a);
  const [u2, d2 = 0, c2 = 0] = cifras(b);
  const su = u1 + u2;
  const lu = su >= 10 ? 1 : 0;
  const sd = d1 + d2 + lu;
  const tieneC = a >= 100 || b >= 100;
  const ld = tieneC && sd >= 10 ? 1 : 0;
  const sc = c1 + c2 + ld;
  return {
    estrategia: 'suma-columnas',
    cuentaU: `${u1} + ${u2} = ${su}`,
    cuentaD: lu ? `${d1} + ${d2} + 1 = ${sd}` : `${d1} + ${d2} = ${sd}`,
    cuentaC: ld ? `${c1} + ${c2} + 1 = ${sc}` : `${c1} + ${c2} = ${sc}`,
    llevada: Boolean(lu),
    llevaD: Boolean(ld),
    tieneC,
    ru: su % 10,
    rd: sd % 10,
    r,
  };
}

export function explicarResta(a: number, b: number): Record<string, string | number | boolean> {
  const r = a - b;
  const [u1, d1 = 0, c1 = 0] = cifras(a);
  const [u2, d2 = 0, c2 = 0] = cifras(b);
  for (const lugar of ['centena', 'decena'] as const) {
    const t = lugar === 'centena' ? 100 : 10;
    if (a % t === 0 && b % t === 0 && b > 0 && r > 0 && (lugar === 'centena' || a <= 100)) {
      const ga = grupo(a, lugar);
      const gb = grupo(b, lugar);
      return { estrategia: 'resta-grupos', grupoA: ga.txt, grupoB: gb.txt, ka: ga.k, kb: gb.k, grupoR: grupo(r, lugar).txt, r };
    }
  }
  if (a <= 10 || b <= 3) {
    return { estrategia: 'resta-contando', desde: a, conteo: conteo(lista(a - 1, r, -1)), r };
  }
  if (b < 10 && u1 > 0 && u1 < b && a < 100) {
    // Bajar hasta el número redondo: 13 − 5 = 13 − 3 − 2.
    return { estrategia: 'resta-diez', desde: a, redondo: a - u1, u1, resto: b - u1, r };
  }
  const dobleCero = u1 < u2 && d1 === 0 && a >= 100;
  if (dobleCero || (r <= 20 && b >= 10) || (a % 100 === 0 && a >= 100) || (u1 === 0 && b < 10)) {
    // Contar desde el chico hasta el grande (como el vuelto).
    return { estrategia: 'resta-saltando', desde: b, hasta: a, ...saltos(b, a), r };
  }
  const pideU = u1 < u2;
  const ru = (pideU ? u1 + 10 : u1) - u2;
  const d1p = d1 - (pideU ? 1 : 0);
  const tieneC = a >= 100;
  const pideD = tieneC && d1p < d2;
  const rd = (pideD ? d1p + 10 : d1p) - d2;
  const c1p = c1 - (pideD ? 1 : 0);
  const quedan = (n: number) => (n === 1 ? 'queda' : 'quedan');
  return {
    estrategia: 'resta-columnas',
    u1, u2, u1p: u1 + 10, ru,
    d1, d2, d1p, d1pp: d1p + 10, rd,
    c1, c2, c1p, rc: c1p - c2,
    prestamo: pideU,
    casoD: pideU ? (pideD ? 'quedanPide' : 'quedan') : pideD ? 'pide' : 'simple',
    quedanD: quedan(d1p),
    quedanC: quedan(c1p),
    casoC: !tieneC ? 'sin' : c1p === c2 ? 'cero' : pideD ? 'quedan' : 'simple',
    r,
  };
}

/** Tablas: contar de a saltos y usar la cuenta vecina. */
export function explicarGrupos(g: number, p: number) {
  const salto = lista(p, g * p, p);
  return {
    conteo: g <= 6 ? salto.join(', ') : `${salto.slice(0, 3).join(', ')}, …, ${g * p}`,
    gm: g - 1,
    prev: (g - 1) * p,
  };
}

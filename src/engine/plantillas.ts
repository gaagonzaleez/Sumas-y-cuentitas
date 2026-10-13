// Registro de plantillas: cada id de content/plantillas.json tiene su generador.
import type { Generador } from './generadores/comun';
import * as num from './generadores/numeros';
import * as sr from './generadores/sumasRestas';
import * as tab from './generadores/tablas';
import * as din from './generadores/dinero';
import * as prob from './generadores/problemas';
import * as fin from './generadores/finanzas';
import * as varios from './generadores/variedad';
import * as j from './generadores/juegos';

export const GENERADORES: Record<string, Generador> = {
  contar: num.contar,
  'leer-numero': num.leerNumero,
  'numero-en-letras': num.numeroEnLetras,
  'anterior-siguiente': num.anteriorSiguiente,
  comparar: num.comparar,
  ordenar: num.ordenar,
  familia: num.familia,
  descomponer: num.descomponer,
  'armar-bloques': num.armarBloques,
  centenas: num.centenas,
  secuencia: num.secuencia,
  'contar-bloques': num.contarBloques,
  'escribir-en-letras': num.escribirEnLetras,
  suma: sr.suma,
  resta: sr.resta,
  'cuanto-falta': sr.cuantoFalta,
  'cuenta-inversa': sr.cuentaInversa,
  'grupos-iguales': tab.gruposIguales,
  'suma-repetida': tab.sumaRepetida,
  tabla: tab.tabla,
  'memoria-tablas': tab.memoriaTablas,
  'armar-grupos': tab.armarGrupos,
  'reconocer-billete': din.reconocerBillete,
  'contar-plata': din.contarPlata,
  'armar-monto': din.armarMonto,
  'comparar-precios': din.compararPrecios,
  'dar-vuelto': din.darVuelto,
  'compra-varios': din.compraVarios,
  problema: prob.problema,
  finanzas: fin.finanzas,
  'necesidad-deseo': fin.necesidadDeseo,
  presupuesto: fin.presupuesto,
  'plan-ahorro': fin.planAhorro,
  'repartir-ahorro': fin.repartirAhorro,
  'cuenta-faltante': varios.cuentaFaltante,
  'verdadero-falso': varios.verdaderoFalso,
  'memoria-cuentas': varios.memoriaCuentas,
  dobles: varios.dobles,
  'guerra-cartas': j.guerraCartas,
  escoba: j.escoba,
  loteria: j.loteria,
  dados: j.dados,
  balanza: j.balanza,
  piramide: j.piramide,
  adivinanza: j.adivinanza,
  alcanza: j.alcanza,
  carrito: j.carrito,
  'ordenar-precios': j.ordenarPrecios,
  'menos-billetes': j.menosBilletes,
  'elegir-pregunta': j.elegirPregunta,
  'elegir-cuenta': j.elegirCuenta,
  estimar: j.estimar,
  'historia-vf': j.historiaVF,
  'falta-meta': j.faltaMeta,
  'trabajo-cobro': j.trabajoCobro,
  clasificar: j.clasificar,
};

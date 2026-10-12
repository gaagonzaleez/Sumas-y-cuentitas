// Tipos compartidos del motor de ejercicios.

export type Tema = 'numeros' | 'sumas' | 'restas' | 'tablas' | 'dinero' | 'problemas' | 'finanzas';

export type Modo =
  | 'opciones' // elegir una de 3 o 4 opciones
  | 'teclado' // completar con teclado numérico grande
  | 'bloques' // armar con centenas, decenas y unidades
  | 'ordenar' // ordenar de menor a mayor
  | 'dinero' // pagar con billetes y monedas
  | 'memoria' // unir cada cuenta con su resultado
  | 'arrastrar'; // mover objetos a grupos

export interface Opcion {
  valor: string;
  /** Texto a mostrar (si es distinto del valor). */
  texto?: string;
  /** Si es incorrecta, qué error representa. */
  errorTag?: string;
  /** Dibujo opcional para la opción (id de ícono o billete). */
  dibujo?: string;
}

/** Ayudas visuales que se dibujan junto a la consigna. */
export type Visual =
  | { tipo: 'objetos'; objeto: string; cantidad: number }
  | { tipo: 'grupos'; objeto: string; grupos: number; porGrupo: number }
  | { tipo: 'bloques'; numero: number }
  | { tipo: 'columnas'; a: number; b: number; c?: number; op: '+' | '−' }
  | { tipo: 'recta'; desde: number; hasta: number; marca?: number }
  | { tipo: 'billetes'; valores: number[] }
  | { tipo: 'productos'; productos: { objeto: string; nombre: string; precio: number }[] }
  | { tipo: 'escena'; objeto: string; cantidades: number[]; nombre?: string }
  | { tipo: 'alcancia'; meta: number; guardado: number }
  | { tipo: 'dibujo'; objeto: string };

export interface DatosModo {
  /** modo 'ordenar': números a ordenar (desordenados). */
  ordenar?: number[];
  /** modo 'dinero': precio a pagar y billetes disponibles. */
  dinero?: { precio: number; billetera: number[]; objeto: string; nombre: string };
  /** modo 'memoria': pares cuenta-resultado. */
  memoria?: { cuenta: string; resultado: string }[];
  /** modo 'arrastrar': cantidad por grupo y grupos. */
  arrastrar?: { grupos: number; porGrupo: number; objeto: string };
  /** modo 'bloques': número a armar. */
  bloques?: { numero: number };
}

export interface Ejercicio {
  uid: string;
  plantillaId: string;
  tema: Tema;
  modo: Modo;
  /** Consigna. El texto también es el subtítulo y se lee con la voz. */
  consigna: string;
  /** Cuenta grande que se muestra (por ejemplo "3 × 4 = ?"). */
  cuenta?: string;
  visual?: Visual;
  /** El visual solo aparece como pista si la escalera de ayudas lo esconde. */
  visualEsAyuda?: boolean;
  respuesta: string;
  opciones?: Opcion[];
  datos?: DatosModo;
  /** Respuestas incorrectas previstas para el modo teclado (valor → errorTag). */
  erroresPrevistos?: Record<string, string>;
  /** errorTag para cualquier otra respuesta incorrecta. */
  errorTagPorDefecto: string;
  /** Datos para completar los pasos de la minilección. */
  leccion: Record<string, string | number | boolean | undefined>;
  /** Frase que se muestra al acertar (por ejemplo "3 grupos de 4 son 12."). */
  explicacion: string;
  /** Pista con voz (primera pista). */
  pista: string;
  /** Parámetros usados (para registrar el intento y armar uno parecido). */
  params: Record<string, number | string | boolean | undefined>;
}

export interface CaracterGrado {
  ayudas: 'siempre' | 'a-veces' | 'nunca';
  problemas: number;
  llevadaForzada: boolean;
  tresTerminos: boolean;
  desafioTablas: boolean;
  descripcion: string;
}

export interface Contexto {
  /** Peldaño actual de la escalera (por ejemplo 40 = números hasta 40). */
  rango: number;
  /** Grado del nivel (1 a 5). */
  grado: number;
  caracter: CaracterGrado;
  /** Parámetros del nivel (vienen del JSON del mundo). */
  params: Record<string, unknown>;
}

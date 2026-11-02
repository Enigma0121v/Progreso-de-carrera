import type { Carrera, Estado, Materia, Progreso } from '../types';

export type Condicion = 'regularizada' | 'aprobada';

export interface Requisito {
  materia: Materia;
  condicion: Condicion;
  cumple: boolean;
}

export type Situacion =
  | 'aprobada'
  | 'regularizada' // regularizada y puede rendir el final
  | 'regularizada-sin-final' // regularizada pero le faltan correlativas para rendir
  | 'disponible' // puede cursarla
  | 'bloqueada';

export const estadoDe = (p: Progreso, n: number): Estado => p.materias[n]?.estado ?? 'pendiente';

const cumple = (estado: Estado, condicion: Condicion) =>
  condicion === 'aprobada' ? estado === 'aprobada' : estado !== 'pendiente';

const porNumero = (c: Carrera) => new Map(c.materias.map((m) => [m.n, m]));

/**
 * Requisitos para cursar (Ord. de correlatividades: "Para cursar y rendir").
 * Las de la columna "Cursada" alcanzan con estar regularizadas; las de "Aprobada" tienen que estar aprobadas.
 * Si un número aparece en ambas columnas, rige la condición más exigente.
 */
export function requisitosCursar(c: Carrera, m: Materia, p: Progreso): Requisito[] {
  const mapa = porNumero(c);
  const lista: Requisito[] = [];
  for (const n of m.aprobadas) {
    const r = mapa.get(n);
    if (r) lista.push({ materia: r, condicion: 'aprobada', cumple: cumple(estadoDe(p, n), 'aprobada') });
  }
  for (const n of m.cursadas) {
    if (m.aprobadas.includes(n)) continue;
    const r = mapa.get(n);
    if (r) lista.push({ materia: r, condicion: 'regularizada', cumple: cumple(estadoDe(p, n), 'regularizada') });
  }
  return lista.sort((a, b) => a.materia.nivel - b.materia.nivel || a.materia.n - b.materia.n);
}

/**
 * Requisitos para rendir el final: todas las correlativas aprobadas (reglamento de estudio de la UTN).
 * Proyecto Final: todas las asignaturas previas del plan aprobadas.
 */
export function requisitosRendir(c: Carrera, m: Materia, p: Progreso): Requisito[] {
  const nums = m.rendirRequiereTodas
    ? c.materias.filter((x) => x.n !== m.n).map((x) => x.n)
    : [...new Set([...m.cursadas, ...m.aprobadas])];
  const mapa = porNumero(c);
  return nums
    .map((n) => mapa.get(n))
    .filter((r): r is Materia => !!r)
    .map((r) => ({ materia: r, condicion: 'aprobada' as const, cumple: estadoDe(p, r.n) === 'aprobada' }))
    .sort((a, b) => a.materia.nivel - b.materia.nivel || a.materia.n - b.materia.n);
}

export const puedeCursar = (c: Carrera, m: Materia, p: Progreso) => requisitosCursar(c, m, p).every((r) => r.cumple);

export function puedeRendir(c: Carrera, m: Materia, p: Progreso) {
  if (!requisitosRendir(c, m, p).every((r) => r.cumple)) return false;
  if (m.rendirRequiereTodas) return horasElectivas(p).aprobadas >= c.electivas.horasRequeridas;
  return true;
}

export function situacion(c: Carrera, m: Materia, p: Progreso): Situacion {
  const e = estadoDe(p, m.n);
  if (e === 'aprobada') return 'aprobada';
  if (e === 'regularizada') return puedeRendir(c, m, p) ? 'regularizada' : 'regularizada-sin-final';
  return puedeCursar(c, m, p) ? 'disponible' : 'bloqueada';
}

export function horasElectivas(p: Progreso) {
  let aprobadas = 0;
  let regularizadas = 0;
  let cursando = 0;
  for (const e of p.electivas) {
    if (e.estado === 'aprobada') aprobadas += e.horas;
    else if (e.estado === 'regularizada') regularizadas += e.horas;
    else cursando += e.horas;
  }
  return { aprobadas, regularizadas, cursando };
}

/** Promedio de las notas de materias y electivas aprobadas que tienen nota cargada. */
export function promedio(c: Carrera, p: Progreso): { valor: number | null; cantidad: number } {
  const notas: number[] = [];
  for (const m of c.materias) {
    const r = p.materias[m.n];
    if (r?.estado === 'aprobada' && r.nota != null) notas.push(r.nota);
  }
  for (const e of p.electivas) if (e.estado === 'aprobada' && e.nota != null) notas.push(e.nota);
  if (!notas.length) return { valor: null, cantidad: 0 };
  return { valor: notas.reduce((a, b) => a + b, 0) / notas.length, cantidad: notas.length };
}

export function resumen(c: Carrera, p: Progreso) {
  let aprobadas = 0;
  let regularizadas = 0;
  for (const m of c.materias) {
    const e = estadoDe(p, m.n);
    if (e === 'aprobada') aprobadas++;
    else if (e === 'regularizada') regularizadas++;
  }
  const total = c.materias.length;
  return { aprobadas, regularizadas, total, porcentaje: total ? Math.round((aprobadas / total) * 100) : 0 };
}

export const notaValida = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 10;

export const progresoVacio = (): Progreso => ({ materias: {}, electivas: [] });

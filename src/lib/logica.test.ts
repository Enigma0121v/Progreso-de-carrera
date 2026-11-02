import { describe, expect, it } from 'vitest';
import { getCarrera } from '../data/carreras';
import type { Progreso } from '../types';
import { promedio, puedeCursar, puedeRendir, requisitosCursar, situacion } from './logica';

const elec = getCarrera('electronica')!;
const m = (n: number) => elec.materias.find((x) => x.n === n)!;
const prog = (e: Record<number, 'regularizada' | 'aprobada'>, notas: Record<number, number> = {}): Progreso => ({
  materias: Object.fromEntries(Object.entries(e).map(([k, v]) => [k, { estado: v, nota: notas[+k] ?? null }])),
  electivas: [],
});

describe('Electrónica: Análisis de Señales y Sistemas (9) = cursada 5 / aprobadas 2-3', () => {
  it('bloqueada sin nada', () => expect(situacion(elec, m(9), prog({}))).toBe('bloqueada'));
  it('se puede cursar con AM II regularizada y AGA + AM I aprobadas', () => {
    expect(puedeCursar(elec, m(9), prog({ 2: 'aprobada', 3: 'aprobada', 5: 'regularizada' }))).toBe(true);
  });
  it('no alcanza con AGA regularizada', () => {
    expect(puedeCursar(elec, m(9), prog({ 2: 'regularizada', 3: 'aprobada', 5: 'regularizada' }))).toBe(false);
  });
  it('regularizada pero sin AM II aprobada no puede rendir', () => {
    const p = prog({ 2: 'aprobada', 3: 'aprobada', 5: 'regularizada', 9: 'regularizada' });
    expect(situacion(elec, m(9), p)).toBe('regularizada-sin-final');
    p.materias[5] = { estado: 'aprobada', nota: 7 };
    expect(situacion(elec, m(9), p)).toBe('regularizada');
  });
  it('lista de requisitos en orden y con condición', () => {
    const r = requisitosCursar(elec, m(9), prog({ 2: 'aprobada' }));
    expect(r.map((x) => [x.materia.n, x.condicion, x.cumple])).toEqual([
      [2, 'aprobada', true],
      [3, 'aprobada', false],
      [5, 'regularizada', false],
    ]);
  });
});

describe('Proyecto Final', () => {
  it('para rendir pide todo aprobado y las horas electivas', () => {
    const todas = Object.fromEntries(elec.materias.filter((x) => x.n !== 37).map((x) => [x.n, 'aprobada' as const]));
    const p = prog({ ...todas, 37: 'regularizada' });
    expect(puedeRendir(elec, m(37), p)).toBe(false);
    p.electivas.push({ id: 'a', nombre: 'X', horas: 192, estado: 'aprobada', nota: 8 });
    expect(puedeRendir(elec, m(37), p)).toBe(true);
  });
});

describe('promedio', () => {
  it('promedia materias y electivas aprobadas con nota', () => {
    const p = prog({ 1: 'aprobada', 2: 'aprobada', 3: 'regularizada', 4: 'aprobada' }, { 1: 8, 2: 6, 3: 10 });
    p.electivas.push({ id: 'e', nombre: 'Y', horas: 48, estado: 'aprobada', nota: 10 });
    expect(promedio(elec, p)).toEqual({ valor: 8, cantidad: 3 });
  });
});

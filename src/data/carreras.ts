import type { Carrera } from '../types';
import aeroespacial from './carreras/aeroespacial.json';
import bioingenieria from './carreras/bioingenieria.json';
import electronica from './carreras/electronica.json';
import ferroviaria from './carreras/ferroviaria.json';
import industrial from './carreras/industrial.json';
import mecanica from './carreras/mecanica.json';

export const CARRERAS = [aeroespacial, bioingenieria, electronica, ferroviaria, industrial, mecanica] as Carrera[];

export const getCarrera = (id: string | undefined) => CARRERAS.find((c) => c.id === id);

export const TOTAL_MATERIAS = CARRERAS.reduce((s, c) => s + c.materias.length, 0);

/** Duración aproximada según la cantidad de niveles y las horas del último. */
export function duracion(c: Carrera): string {
  const niveles = Math.max(...c.materias.map((m) => m.nivel));
  return niveles >= 6 ? '5 años y medio' : `${niveles} años`;
}

export const COLORES: Record<string, { hex: string; suave: string }> = {
  cyan: { hex: '#22d3ee', suave: 'rgba(34,211,238,0.12)' },
  emerald: { hex: '#34d399', suave: 'rgba(52,211,153,0.12)' },
  amber: { hex: '#facc15', suave: 'rgba(250,204,21,0.12)' },
  orange: { hex: '#fb923c', suave: 'rgba(251,146,60,0.12)' },
  rose: { hex: '#fb7185', suave: 'rgba(251,113,133,0.12)' },
  violet: { hex: '#a78bfa', suave: 'rgba(167,139,250,0.12)' },
};

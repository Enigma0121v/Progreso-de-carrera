export type Estado = 'pendiente' | 'regularizada' | 'aprobada';

export interface Materia {
  n: number;
  nombre: string;
  nivel: number;
  horas: number;
  /** Correlativas que deben estar al menos regularizadas para cursar. */
  cursadas: number[];
  /** Correlativas que deben estar aprobadas para cursar. */
  aprobadas: number[];
  integradora?: boolean;
  cuatrimestre?: 1 | 2;
  /** La ordenanza da solo el requisito para cursar (Proyecto Final). */
  soloCursar?: boolean;
  /** Para rendir hay que tener aprobadas todas las demás materias del plan. */
  rendirRequiereTodas?: boolean;
}

export interface Carrera {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  plan: string;
  ordenanzaPlan: string;
  ordenanzaCorrelativas: string;
  electivas: {
    horasRequeridas: number;
    fuente: string;
    ofertaFRH?: { nombre: string; nivel: number; cursadas: number[]; aprobadas: number[] }[];
  };
  pps: { horas: number; requisito: string; comoMateria?: number; cursadas?: number[]; aprobadas?: number[] };
  materias: Materia[];
  dudas: string[];
}

export interface RegistroMateria {
  estado: Estado;
  nota: number | null;
}

export type EstadoElectiva = 'cursando' | 'regularizada' | 'aprobada';

export interface Electiva {
  id: string;
  nombre: string;
  horas: number;
  estado: EstadoElectiva;
  nota: number | null;
}

export interface Progreso {
  materias: Record<number, RegistroMateria>;
  electivas: Electiva[];
}

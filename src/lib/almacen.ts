import type { Electiva, Progreso, RegistroMateria } from '../types';
import { progresoVacio } from './logica';
import { supabase } from './supabase';

/** Guardado del progreso: en la cuenta (Supabase) o, sin sesión, en este dispositivo. */
export interface Almacen {
  cargar(carreraId: string): Promise<Progreso>;
  guardarMateria(carreraId: string, n: number, r: RegistroMateria | null): Promise<void>;
  guardarElectiva(carreraId: string, e: Electiva): Promise<void>;
  borrarElectiva(carreraId: string, id: string): Promise<void>;
  reiniciar(carreraId: string): Promise<void>;
}

const claveLocal = (c: string) => `avutn:progreso:${c}`;

export function leerLocal(carreraId: string): Progreso {
  try {
    const raw = localStorage.getItem(claveLocal(carreraId));
    if (!raw) return progresoVacio();
    const p = JSON.parse(raw) as Progreso;
    return { materias: p.materias ?? {}, electivas: p.electivas ?? [] };
  } catch {
    return progresoVacio();
  }
}

function escribirLocal(carreraId: string, p: Progreso) {
  try {
    localStorage.setItem(claveLocal(carreraId), JSON.stringify(p));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function borrarLocal(carreraId: string) {
  try {
    localStorage.removeItem(claveLocal(carreraId));
  } catch {
    /* nada */
  }
}

export const hayProgresoLocal = (carreraId: string) => {
  const p = leerLocal(carreraId);
  return Object.keys(p.materias).length > 0 || p.electivas.length > 0;
};

export const almacenLocal: Almacen = {
  async cargar(c) {
    return leerLocal(c);
  },
  async guardarMateria(c, n, r) {
    const p = leerLocal(c);
    if (r) p.materias[n] = r;
    else delete p.materias[n];
    escribirLocal(c, p);
  },
  async guardarElectiva(c, e) {
    const p = leerLocal(c);
    const i = p.electivas.findIndex((x) => x.id === e.id);
    if (i >= 0) p.electivas[i] = e;
    else p.electivas.push(e);
    escribirLocal(c, p);
  },
  async borrarElectiva(c, id) {
    const p = leerLocal(c);
    p.electivas = p.electivas.filter((x) => x.id !== id);
    escribirLocal(c, p);
  },
  async reiniciar(c) {
    borrarLocal(c);
  },
};

function check<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

export async function cargarRemoto(userId: string, carreraId: string): Promise<Progreso> {
  if (!supabase) return progresoVacio();
  const [mat, ele] = await Promise.all([
    supabase.from('materias_estado').select('materia_n, estado, nota').eq('user_id', userId).eq('carrera_id', carreraId),
    supabase.from('electivas').select('id, nombre, horas, estado, nota').eq('user_id', userId).eq('carrera_id', carreraId).order('creado'),
  ]);
  const materias: Progreso['materias'] = {};
  for (const r of check(mat) ?? []) materias[r.materia_n] = { estado: r.estado, nota: r.nota };
  return { materias, electivas: (check(ele) ?? []) as Electiva[] };
}

export function almacenRemoto(userId: string): Almacen {
  const db = supabase!;
  return {
    cargar: (c) => cargarRemoto(userId, c),
    async guardarMateria(c, n, r) {
      if (!r || r.estado === 'pendiente') {
        check(await db.from('materias_estado').delete().match({ user_id: userId, carrera_id: c, materia_n: n }));
      } else {
        check(
          await db.from('materias_estado').upsert({
            user_id: userId,
            carrera_id: c,
            materia_n: n,
            estado: r.estado,
            nota: r.estado === 'aprobada' ? r.nota : null,
            actualizado: new Date().toISOString(),
          }),
        );
      }
    },
    async guardarElectiva(c, e) {
      check(
        await db.from('electivas').upsert({
          id: e.id,
          user_id: userId,
          carrera_id: c,
          nombre: e.nombre,
          horas: e.horas,
          estado: e.estado,
          nota: e.estado === 'aprobada' ? e.nota : null,
        }),
      );
    },
    async borrarElectiva(_c, id) {
      check(await db.from('electivas').delete().eq('id', id).eq('user_id', userId));
    },
    async reiniciar(c) {
      check(await db.from('materias_estado').delete().match({ user_id: userId, carrera_id: c }));
      check(await db.from('electivas').delete().match({ user_id: userId, carrera_id: c }));
    },
  };
}

/** Sube a la cuenta el progreso guardado en este dispositivo y lo borra del dispositivo. */
export async function subirLocalACuenta(userId: string, carreraId: string) {
  if (!supabase) return;
  const p = leerLocal(carreraId);
  const filas = Object.entries(p.materias)
    .filter(([, r]) => r.estado !== 'pendiente')
    .map(([n, r]) => ({
      user_id: userId,
      carrera_id: carreraId,
      materia_n: Number(n),
      estado: r.estado,
      nota: r.estado === 'aprobada' ? r.nota : null,
    }));
  if (filas.length) check(await supabase.from('materias_estado').upsert(filas));
  if (p.electivas.length) {
    check(
      await supabase.from('electivas').upsert(
        p.electivas.map((e) => ({
          id: e.id,
          user_id: userId,
          carrera_id: carreraId,
          nombre: e.nombre,
          horas: e.horas,
          estado: e.estado,
          nota: e.estado === 'aprobada' ? e.nota : null,
        })),
      ),
    );
  }
  borrarLocal(carreraId);
}

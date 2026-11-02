import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { almacenLocal, almacenRemoto, hayProgresoLocal, subirLocalACuenta } from '../lib/almacen';
import { progresoVacio } from '../lib/logica';
import type { Electiva, Progreso, RegistroMateria } from '../types';

/**
 * Progreso de una carrera. Con sesión iniciada se guarda en la cuenta; sin sesión, en este dispositivo.
 * Los cambios se aplican al instante en pantalla y se guardan en segundo plano; si falla el guardado,
 * se vuelve al estado anterior y se muestra el error.
 */
export function useProgreso(carreraId: string) {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const userId = usuario?.id ?? null;
  const almacen = useMemo(() => (userId ? almacenRemoto(userId) : almacenLocal), [userId]);
  const [progreso, setProgreso] = useState<Progreso>(progresoVacio);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPendiente, setLocalPendiente] = useState(false);
  const ref = useRef(progreso);
  ref.current = progreso;

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setProgreso(await almacen.cargar(carreraId));
      setLocalPendiente(!!userId && hayProgresoLocal(carreraId));
    } catch (e) {
      setError(`No se pudo cargar tu progreso: ${(e as Error).message}`);
    } finally {
      setCargando(false);
    }
  }, [almacen, carreraId, userId]);

  useEffect(() => {
    if (!cargandoAuth) void recargar();
  }, [cargandoAuth, recargar]);

  const aplicar = useCallback(async (cambio: (p: Progreso) => Progreso, guardar: () => Promise<void>) => {
    const anterior = ref.current;
    setProgreso(cambio(anterior));
    setError(null);
    try {
      await guardar();
    } catch (e) {
      setProgreso(anterior);
      setError(`No se pudo guardar: ${(e as Error).message}`);
    }
  }, []);

  const setMateria = useCallback(
    (n: number, r: RegistroMateria | null) =>
      aplicar(
        (p) => {
          const materias = { ...p.materias };
          if (r && r.estado !== 'pendiente') materias[n] = r;
          else delete materias[n];
          return { ...p, materias };
        },
        () => almacen.guardarMateria(carreraId, n, r && r.estado !== 'pendiente' ? r : null),
      ),
    [aplicar, almacen, carreraId],
  );

  const guardarElectiva = useCallback(
    (e: Electiva) =>
      aplicar(
        (p) => {
          const i = p.electivas.findIndex((x) => x.id === e.id);
          const electivas = i >= 0 ? p.electivas.map((x) => (x.id === e.id ? e : x)) : [...p.electivas, e];
          return { ...p, electivas };
        },
        () => almacen.guardarElectiva(carreraId, e),
      ),
    [aplicar, almacen, carreraId],
  );

  const borrarElectiva = useCallback(
    (id: string) =>
      aplicar(
        (p) => ({ ...p, electivas: p.electivas.filter((x) => x.id !== id) }),
        () => almacen.borrarElectiva(carreraId, id),
      ),
    [aplicar, almacen, carreraId],
  );

  const reiniciar = useCallback(
    () => aplicar(() => progresoVacio(), () => almacen.reiniciar(carreraId)),
    [aplicar, almacen, carreraId],
  );

  const importarLocal = useCallback(async () => {
    if (!userId) return;
    try {
      await subirLocalACuenta(userId, carreraId);
      await recargar();
    } catch (e) {
      setError(`No se pudo subir el progreso: ${(e as Error).message}`);
    }
  }, [userId, carreraId, recargar]);

  return {
    progreso,
    cargando: cargando || cargandoAuth,
    error,
    enCuenta: !!userId,
    localPendiente,
    setMateria,
    guardarElectiva,
    borrarElectiva,
    reiniciar,
    importarLocal,
    descartarLocal: () => setLocalPendiente(false),
  };
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Electivas } from '../components/Electivas';
import { PanelProgreso } from '../components/PanelProgreso';
import { PlanColumnas } from '../components/PlanColumnas';
import { Aviso } from '../components/ui';
import { COLORES, getCarrera } from '../data/carreras';
import { cargarRemoto } from '../lib/almacen';
import { supabase } from '../lib/supabase';
import type { Progreso } from '../types';

/** Vista de solo lectura del progreso de alguien que activó su perfil público. */
export function PerfilPublicoPage() {
  const { id } = useParams();
  const [estado, setEstado] = useState<
    { tipo: 'cargando' } | { tipo: 'privado' } | { tipo: 'ok'; nombre: string; carreraId: string; progreso: Progreso } | { tipo: 'error'; msg: string }
  >({ tipo: 'cargando' });

  useEffect(() => {
    if (!supabase || !id) return setEstado({ tipo: 'privado' });
    (async () => {
      const { data, error } = await supabase.from('perfiles').select('nombre, carrera_id').eq('id', id).maybeSingle();
      if (error) return setEstado({ tipo: 'error', msg: error.message });
      if (!data?.carrera_id) return setEstado({ tipo: 'privado' });
      try {
        setEstado({ tipo: 'ok', nombre: data.nombre ?? 'Estudiante', carreraId: data.carrera_id, progreso: await cargarRemoto(id, data.carrera_id) });
      } catch (e) {
        setEstado({ tipo: 'error', msg: (e as Error).message });
      }
    })();
  }, [id]);

  if (estado.tipo === 'cargando') return <p className="p-10 text-center text-tenue">Cargando…</p>;
  if (estado.tipo !== 'ok')
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Aviso tono={estado.tipo === 'error' ? 'error' : 'info'}>
          {estado.tipo === 'error' ? estado.msg : 'Este perfil es privado o no existe.'}
        </Aviso>
        <Link to="/carreras" className="mt-4 inline-block font-semibold text-acento">
          Ir al plan de estudio
        </Link>
      </div>
    );

  const carrera = getCarrera(estado.carreraId);
  if (!carrera) return <p className="p-10 text-center text-tenue">Carrera desconocida.</p>;
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-acento">PERFIL PÚBLICO</p>
          <h1 className="mt-2 text-3xl font-extrabold">{estado.nombre}</h1>
          <p className="mt-1 text-texto/75">{carrera.nombre} · Plan {carrera.plan}</p>
        </div>
        <PanelProgreso carrera={carrera} progreso={estado.progreso} colorHex={COLORES[carrera.color].hex} />
      </div>
      <div className="mt-6">
        <PlanColumnas carrera={carrera} progreso={estado.progreso} soloLectura />
      </div>
      <div className="mt-4">
        <Electivas carrera={carrera} progreso={estado.progreso} soloLectura />
      </div>
    </div>
  );
}

import { ArrowRight, Cog, Cpu, Factory, HeartPulse, Rocket, TrainFront, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CARRERAS, COLORES, duracion } from '../data/carreras';

export const ICONOS: Record<string, LucideIcon> = {
  aeroespacial: Rocket,
  bioingenieria: HeartPulse,
  electronica: Cpu,
  ferroviaria: TrainFront,
  industrial: Factory,
  mecanica: Cog,
};

export function CarrerasPage() {
  const { perfil } = useAuth();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-bold tracking-[0.18em] text-acento">PLAN DE ESTUDIO</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Elegí tu ingeniería</h1>
      <p className="mt-3 max-w-2xl text-texto/75">
        Las 6 ingenierías de grado que se dictan en la UTN Facultad Regional Haedo. Marcá cada materia como regular o aprobada,
        cargá tu nota y mirá qué podés cursar y qué finales podés rendir.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARRERAS.map((c) => {
          const Icono = ICONOS[c.id];
          const col = COLORES[c.color];
          const mia = perfil?.carrera_id === c.id;
          return (
            <Link
              key={c.id}
              to={`/carreras/${c.id}`}
              className="group flex flex-col rounded-2xl border border-borde bg-panel p-5 transition hover:-translate-y-0.5 hover:border-borde-2"
              style={{ borderTop: `3px solid ${col.hex}` }}
            >
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-xl" style={{ background: col.suave, color: col.hex, boxShadow: `inset 0 0 0 1px ${col.hex}55` }}>
                  <Icono size={22} />
                </span>
                <span className="flex gap-1.5">
                  {mia && <span className="rounded-full bg-acento/15 px-2.5 py-1 text-[11px] font-semibold text-sky-200">Tu carrera</span>}
                  <span className="rounded-full border border-borde-2 px-2.5 py-1 text-[11px] text-texto/80">{c.materias.length} materias</span>
                </span>
              </div>
              <h2 className="mt-5 text-lg font-extrabold">{c.nombre}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-texto/70">{c.descripcion}</p>
              <div className="mt-5 flex items-center gap-2 border-t border-borde pt-4 text-xs">
                <span className="rounded-md bg-white/[0.06] px-2 py-1 font-bold">Plan {c.plan}</span>
                <span className="rounded-md border border-borde-2 px-2 py-1 text-texto/80">{duracion(c)}</span>
                <span className="ml-auto flex items-center gap-1 text-sm font-bold" style={{ color: col.hex }}>
                  Ver plan <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

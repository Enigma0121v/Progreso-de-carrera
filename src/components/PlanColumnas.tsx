import { useState } from 'react';
import type { Carrera, Estado, Materia, Progreso, RegistroMateria } from '../types';
import { CorrelativasDialog } from './CorrelativasDialog';
import { MateriaCard } from './MateriaCard';

export function PlanColumnas({
  carrera,
  progreso,
  soloLectura = false,
  onCambiar,
}: {
  carrera: Carrera;
  progreso: Progreso;
  soloLectura?: boolean;
  onCambiar?: (n: number, r: RegistroMateria) => void;
}) {
  const [abierta, setAbierta] = useState<{ materia: Materia; estado?: Estado } | null>(null);
  const niveles = [...new Set(carrera.materias.map((m) => m.nivel))].sort((a, b) => a - b);

  return (
    <>
      <div className="scroll-fino -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {niveles.map((nivel) => {
            const materias = carrera.materias.filter((m) => m.nivel === nivel);
            const ok = materias.filter((m) => progreso.materias[m.n]?.estado === 'aprobada').length;
            return (
              <section key={nivel} className="w-full shrink-0 rounded-2xl border border-borde bg-panel md:w-[290px]">
                <header className="border-b border-borde px-4 pb-3 pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold tracking-wide">AÑO {nivel}</h2>
                    <span className="text-xs font-bold text-disponible">
                      {ok}/{materias.length}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full bg-disponible transition-all" style={{ width: `${(ok / materias.length) * 100}%` }} />
                  </div>
                </header>
                <div className="space-y-2.5 p-3">
                  {materias.map((m) => (
                    <MateriaCard
                      key={m.n}
                      carrera={carrera}
                      materia={m}
                      progreso={progreso}
                      soloLectura={soloLectura}
                      onCambiar={onCambiar}
                      onVer={(i) => setAbierta(i)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <CorrelativasDialog
        carrera={carrera}
        progreso={progreso}
        materia={abierta?.materia ?? null}
        intento={soloLectura ? undefined : abierta?.estado}
        onCerrar={() => setAbierta(null)}
        onCambiar={onCambiar}
      />
    </>
  );
}

import { Check, ChevronRight, Lock } from 'lucide-react';
import { requisitosCursar, requisitosRendir, situacion, type Situacion } from '../lib/logica';
import type { Carrera, Estado, Materia, Progreso, RegistroMateria } from '../types';

export interface Intento {
  materia: Materia;
  estado: Estado;
}

const ESTILO: Record<Situacion, string> = {
  aprobada: 'border-aprobada/35 bg-aprobada/[0.07]',
  regularizada: 'border-regular/40 bg-regular/[0.07]',
  'regularizada-sin-final': 'border-regular/30 bg-regular/[0.04]',
  disponible: 'border-borde-2 bg-panel-2 hover:border-white/25',
  bloqueada: 'border-borde bg-panel/60',
};

export function MateriaCard({
  carrera,
  materia: m,
  progreso,
  soloLectura = false,
  onCambiar,
  onVer,
}: {
  carrera: Carrera;
  materia: Materia;
  progreso: Progreso;
  soloLectura?: boolean;
  onCambiar?: (n: number, r: RegistroMateria) => void;
  onVer: (i: Intento | { materia: Materia; estado?: undefined }) => void;
}) {
  const sit = situacion(carrera, m, progreso);
  const reg = progreso.materias[m.n];
  const estado = reg?.estado ?? 'pendiente';
  const faltanCursar = requisitosCursar(carrera, m, progreso).filter((r) => !r.cumple).length;
  const faltanRendir = sit === 'regularizada-sin-final' ? requisitosRendir(carrera, m, progreso).filter((r) => !r.cumple).length : 0;

  const elegir = (nuevo: Estado) => {
    if (soloLectura || nuevo === estado) return;
    // Si no cumple las correlativas, se muestra qué falta y se pide confirmación.
    const bloqueaCursar = nuevo !== 'pendiente' && estado === 'pendiente' && sit === 'bloqueada';
    const bloqueaRendir = nuevo === 'aprobada' && (sit === 'bloqueada' || sit === 'regularizada-sin-final' || (sit === 'disponible' && requisitosRendir(carrera, m, progreso).some((r) => !r.cumple)));
    if (bloqueaCursar || bloqueaRendir) return onVer({ materia: m, estado: nuevo });
    onCambiar?.(m.n, { estado: nuevo, nota: nuevo === 'aprobada' ? (reg?.nota ?? null) : null });
  };

  return (
    <article className={`group rounded-xl border p-3.5 transition ${ESTILO[sit]}`}>
      <div className="flex items-start gap-2.5">
        <Indicador sit={sit} />
        <button onClick={() => onVer({ materia: m })} className="min-w-0 flex-1 text-left">
          <h3 className={`text-[13.5px] font-bold leading-snug ${sit === 'bloqueada' ? 'text-texto/60' : 'text-texto'}`}>{m.nombre}</h3>
          {m.integradora && <span className="mt-0.5 block text-[10px] font-bold tracking-wider text-disponible/90">INTEGRADORA</span>}
        </button>
        {reg?.estado === 'aprobada' && reg.nota != null && (
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-aprobada/15 text-sm font-extrabold text-aprobada" title="Nota">
            {reg.nota}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-2 pl-[34px] text-[11px]">
        <span className="rounded-md border border-borde-2 px-1.5 py-0.5 text-tenue">Año {m.nivel}</span>
        {m.cuatrimestre && <span className="text-tenue">{m.cuatrimestre}º cuat.</span>}
        <button onClick={() => onVer({ materia: m })} className="ml-auto flex items-center gap-0.5 text-tenue hover:text-texto">
          {sit === 'bloqueada' ? (
            <span className="text-tenue">
              Faltan {faltanCursar}
            </span>
          ) : sit === 'regularizada-sin-final' ? (
            <span className="text-disponible/90">Final: faltan {faltanRendir}</span>
          ) : sit === 'regularizada' ? (
            <span className="text-regular">Podés rendir</span>
          ) : (
            'Correlativas'
          )}
          <ChevronRight size={12} />
        </button>
      </div>

      {!soloLectura && (
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-black/25 p-0.5 text-[11px] font-semibold" role="radiogroup" aria-label={`Estado de ${m.nombre}`}>
          {(['pendiente', 'regularizada', 'aprobada'] as const).map((e) => (
            <button
              key={e}
              role="radio"
              aria-checked={estado === e}
              onClick={() => elegir(e)}
              className={`rounded-md py-1.5 transition ${
                estado === e
                  ? e === 'aprobada'
                    ? 'bg-aprobada text-black'
                    : e === 'regularizada'
                      ? 'bg-regular text-black'
                      : 'bg-white/10 text-texto'
                  : 'text-tenue hover:bg-white/5 hover:text-texto'
              }`}
            >
              {e === 'pendiente' ? 'Pendiente' : e === 'regularizada' ? 'Regular' : 'Aprobada'}
            </button>
          ))}
        </div>
      )}

      {!soloLectura && estado === 'aprobada' && (
        <label className="mt-2 flex items-center justify-between gap-2 pl-1 text-xs text-tenue">
          Nota del final
          <select
            value={reg?.nota ?? ''}
            onChange={(e) => onCambiar?.(m.n, { estado: 'aprobada', nota: e.target.value ? Number(e.target.value) : null })}
            className="rounded-md border border-borde-2 bg-fondo px-2 py-1 text-sm font-bold text-texto focus:border-acento focus:outline-none"
          >
            <option value="">—</option>
            {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
    </article>
  );
}

function Indicador({ sit }: { sit: Situacion }) {
  if (sit === 'aprobada')
    return (
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-aprobada text-black">
        <Check size={14} strokeWidth={3} />
      </span>
    );
  if (sit === 'regularizada' || sit === 'regularizada-sin-final')
    return <span className="grid size-6 shrink-0 place-items-center rounded-full bg-regular text-[11px] font-extrabold text-black">R</span>;
  if (sit === 'bloqueada')
    return (
      <span className="grid size-6 shrink-0 place-items-center text-bloqueada">
        <Lock size={14} />
      </span>
    );
  return <span className="size-6 shrink-0 rounded-full border-2 border-disponible/80" />;
}

import { Check, Lock } from 'lucide-react';
import { horasElectivas, requisitosCursar, requisitosRendir, type Requisito } from '../lib/logica';
import type { Carrera, Estado, Materia, Progreso, RegistroMateria } from '../types';
import { Modal } from './Modal';
import { Boton } from './ui';

export function CorrelativasDialog({
  carrera,
  progreso,
  materia: m,
  intento,
  onCerrar,
  onCambiar,
}: {
  carrera: Carrera;
  progreso: Progreso;
  materia: Materia | null;
  /** Estado que el usuario intentó marcar sin cumplir las correlativas. */
  intento?: Estado;
  onCerrar: () => void;
  onCambiar?: (n: number, r: RegistroMateria) => void;
}) {
  if (!m) return null;
  const cursar = requisitosCursar(carrera, m, progreso);
  const rendir = requisitosRendir(carrera, m, progreso);
  const faltanCursar = cursar.filter((r) => !r.cumple).length;
  const faltanRendir = rendir.filter((r) => !r.cumple).length;
  const horas = horasElectivas(progreso);
  const faltanHoras = m.rendirRequiereTodas ? Math.max(0, carrera.electivas.horasRequeridas - horas.aprobadas) : 0;

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={
        <>
          <p className="text-xs font-semibold tracking-wider text-tenue">
            Nº {m.n} · AÑO {m.nivel} · {m.horas} H{m.cuatrimestre ? ` · ${m.cuatrimestre}º CUATRIMESTRE` : ''}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-snug">Correlativas de {m.nombre}</h2>
        </>
      }
    >
      {intento && (
        <div className="border-b border-borde bg-disponible/10 p-5 text-sm text-amber-100">
          <p>
            Según el plan, todavía no podés {intento === 'aprobada' ? 'rendir el final de' : 'cursar'} esta materia. Si la tenés por
            equivalencia o por un plan anterior, podés marcarla igual.
          </p>
          <Boton
            variante="secundario"
            className="mt-3"
            onClick={() => {
              onCambiar?.(m.n, { estado: intento, nota: null });
              onCerrar();
            }}
          >
            Marcar igual como {intento === 'aprobada' ? 'aprobada' : 'regularizada'}
          </Boton>
        </div>
      )}

      <Seccion
        titulo="Para cursar"
        subtitulo={cursar.length ? 'Ord. de correlatividades: columnas "Cursada" y "Aprobada".' : undefined}
        lista={cursar}
        vacio="No tiene correlativas: la podés cursar desde el inicio."
        faltan={faltanCursar}
      />

      {m.rendirRequiereTodas ? (
        <div className="border-t border-borde p-5">
          <h3 className="text-sm font-bold">Para rendir</h3>
          <p className="mt-1 text-sm text-tenue">Todas las asignaturas previas del plan aprobadas y las horas de electivas completas.</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <Fila cumple={faltanRendir === 0} texto={`Materias aprobadas: ${rendir.length - faltanRendir} de ${rendir.length}`} />
            <Fila cumple={faltanHoras === 0} texto={`Electivas aprobadas: ${horas.aprobadas} de ${carrera.electivas.horasRequeridas} h`} />
          </ul>
        </div>
      ) : (
        <Seccion
          titulo="Para rendir el final"
          subtitulo="Todas las correlativas tienen que estar aprobadas."
          lista={rendir}
          vacio="No tiene correlativas para rendir."
          faltan={faltanRendir}
          soloAprobada
        />
      )}
    </Modal>
  );
}

function Seccion({
  titulo,
  subtitulo,
  lista,
  vacio,
  faltan,
  soloAprobada = false,
}: {
  titulo: string;
  subtitulo?: string;
  lista: Requisito[];
  vacio: string;
  faltan: number;
  soloAprobada?: boolean;
}) {
  return (
    <div className="border-t border-borde p-5 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-bold">{titulo}</h3>
        {lista.length > 0 &&
          (faltan ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-disponible">
              <Lock size={12} /> {faltan === 1 ? 'Falta 1 correlativa' : `Faltan ${faltan} correlativas`}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-aprobada">
              <Check size={12} /> Cumplidas
            </span>
          ))}
      </div>
      {subtitulo && lista.length > 0 && <p className="mt-0.5 text-xs text-tenue">{subtitulo}</p>}
      {lista.length === 0 ? (
        <p className="mt-2 text-sm text-tenue">{vacio}</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {lista.map((r) => (
            <li key={r.materia.n} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm odd:bg-white/[0.02]">
              {r.cumple ? (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-aprobada text-black">
                  <Check size={12} strokeWidth={3} />
                </span>
              ) : (
                <Lock size={15} className="mx-0.5 shrink-0 text-bloqueada" />
              )}
              <span className={`min-w-0 flex-1 ${r.cumple ? '' : 'text-texto/70'}`}>{r.materia.nombre}</span>
              {!soloAprobada && (
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    r.condicion === 'aprobada' ? 'bg-aprobada/15 text-aprobada' : 'bg-regular/15 text-regular'
                  }`}
                >
                  {r.condicion === 'aprobada' ? 'Aprobada' : 'Regular'}
                </span>
              )}
              <span className="w-10 shrink-0 text-right text-xs text-tenue">Año {r.materia.nivel}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Fila({ cumple, texto }: { cumple: boolean; texto: string }) {
  return (
    <li className="flex items-center gap-2.5">
      {cumple ? (
        <span className="grid size-5 place-items-center rounded-full bg-aprobada text-black">
          <Check size={12} strokeWidth={3} />
        </span>
      ) : (
        <Lock size={15} className="mx-0.5 text-bloqueada" />
      )}
      {texto}
    </li>
  );
}

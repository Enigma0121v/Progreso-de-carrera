import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { horasElectivas, promedio, resumen } from '../lib/logica';
import type { Carrera, Progreso } from '../types';

export function PanelProgreso({
  carrera,
  progreso,
  onReiniciar,
  colorHex,
}: {
  carrera: Carrera;
  progreso: Progreso;
  onReiniciar?: () => void;
  colorHex: string;
}) {
  const r = resumen(carrera, progreso);
  const prom = promedio(carrera, progreso);
  const h = horasElectivas(progreso);
  const req = carrera.electivas.horasRequeridas;
  const [confirmar, setConfirmar] = useState(false);
  const pctReg = r.total ? (r.regularizadas / r.total) * 100 : 0;

  return (
    <section className="w-full rounded-2xl border border-borde-2 bg-panel p-5 lg:w-[400px]" aria-label="Progreso">
      <p className="text-[11px] font-bold tracking-[0.18em] text-tenue">PROGRESO</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-3xl font-extrabold">
          {r.aprobadas}
          <span className="text-base font-semibold text-tenue"> / {r.total} aprobadas</span>
        </p>
        <p className="text-3xl font-extrabold" style={{ color: colorHex }}>
          {r.porcentaje}%
        </p>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-valuenow={r.porcentaje} aria-valuemin={0} aria-valuemax={100}>
        <div className="bg-aprobada transition-all" style={{ width: `${r.porcentaje}%` }} />
        <div className="bg-regular/70 transition-all" style={{ width: `${pctReg}%` }} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Dato titulo="Regulares" valor={String(r.regularizadas)} detalle="sin final" />
        <Dato
          titulo="Promedio"
          valor={prom.valor == null ? '—' : prom.valor.toFixed(2).replace('.', ',')}
          detalle={prom.cantidad ? `${prom.cantidad} nota${prom.cantidad > 1 ? 's' : ''}` : 'sin notas'}
        />
        <Dato
          titulo="Electivas"
          valor={`${h.aprobadas}/${req}`}
          detalle={h.regularizadas + h.cursando ? `h · +${h.regularizadas + h.cursando} en curso` : 'horas aprobadas'}
          href="#electivas"
        />
      </dl>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]" title="Horas electivas aprobadas">
        <div className="h-full bg-aprobada/80" style={{ width: `${Math.min(100, (h.aprobadas / req) * 100)}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-tenue">
        <Leyenda color="bg-aprobada" texto="Aprobada" />
        <Leyenda color="bg-regular" texto="Regular" />
        <Leyenda color="bg-disponible" texto="Disponible" />
        <Leyenda color="bg-bloqueada" texto="Bloqueada" />
        {onReiniciar &&
          (confirmar ? (
            <span className="ml-auto flex items-center gap-1">
              <button onClick={() => setConfirmar(false)} className="rounded-lg px-2 py-1.5 hover:text-texto">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setConfirmar(false);
                  onReiniciar();
                }}
                className="rounded-lg bg-rose-500/15 px-2.5 py-1.5 font-semibold text-rose-300 hover:bg-rose-500/25"
              >
                Borrar todo
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmar(true)}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-borde-2 px-2.5 py-1.5 font-semibold text-texto hover:bg-white/5"
            >
              <RotateCcw size={13} /> Reiniciar
            </button>
          ))}
      </div>
    </section>
  );
}

function Dato({ titulo, valor, detalle, href }: { titulo: string; valor: string; detalle: string; href?: string }) {
  const contenido = (
    <>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-tenue">{titulo}</dt>
      <dd className="mt-0.5 text-lg font-extrabold tabular-nums">{valor}</dd>
      <dd className="text-[10.5px] leading-tight text-tenue">{detalle}</dd>
    </>
  );
  const clase = 'rounded-xl bg-white/[0.03] px-2 py-2.5';
  return href ? (
    <a href={href} onClick={(e) => { e.preventDefault(); document.getElementById('electivas')?.scrollIntoView({ behavior: 'smooth' }); }} className={`${clase} hover:bg-white/[0.06]`}>
      {contenido}
    </a>
  ) : (
    <div className={clase}>{contenido}</div>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${color}`} /> {texto}
    </span>
  );
}

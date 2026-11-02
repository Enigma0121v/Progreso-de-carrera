import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { horasElectivas } from '../lib/logica';
import type { Carrera, Electiva, EstadoElectiva, Progreso } from '../types';
import { Boton } from './ui';

const nuevoId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

export function Electivas({
  carrera,
  progreso,
  soloLectura = false,
  onGuardar,
  onBorrar,
}: {
  carrera: Carrera;
  progreso: Progreso;
  soloLectura?: boolean;
  onGuardar?: (e: Electiva) => void;
  onBorrar?: (id: string) => void;
}) {
  const h = horasElectivas(progreso);
  const req = carrera.electivas.horasRequeridas;
  const [nombre, setNombre] = useState('');
  const [horas, setHoras] = useState('48');
  const [estado, setEstado] = useState<EstadoElectiva>('cursando');
  const sugeridas = (carrera.electivas.ofertaFRH ?? []).filter((s) => !progreso.electivas.some((e) => e.nombre === s.nombre));

  return (
    <section id="electivas" className="scroll-mt-24 rounded-2xl border border-borde bg-panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Materias electivas</h2>
          <p className="mt-0.5 text-sm text-tenue">
            El plan pide <strong className="text-texto">{req} h reloj</strong> de electivas aprobadas.{' '}
            <span className="text-tenue/80">({carrera.electivas.fuente})</span>
          </p>
        </div>
        <p className="text-sm">
          <span className="text-2xl font-extrabold text-aprobada">{h.aprobadas}</span>
          <span className="text-tenue"> / {req} h aprobadas</span>
          {h.regularizadas > 0 && <span className="text-regular"> · {h.regularizadas} h regulares</span>}
          {h.cursando > 0 && <span className="text-tenue"> · {h.cursando} h cursando</span>}
        </p>
      </div>

      {progreso.electivas.length > 0 && (
        <ul className="mt-4 divide-y divide-borde rounded-xl border border-borde">
          {progreso.electivas.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 text-sm">
              <span className="min-w-0 flex-1 basis-40 font-semibold">{e.nombre}</span>
              <span className="w-14 text-tenue tabular-nums">{e.horas} h</span>
              {soloLectura ? (
                <span className="capitalize text-tenue">
                  {e.estado}
                  {e.estado === 'aprobada' && e.nota != null && ` · ${e.nota}`}
                </span>
              ) : (
                <>
                  <select
                    value={e.estado}
                    onChange={(ev) => {
                      const est = ev.target.value as EstadoElectiva;
                      onGuardar?.({ ...e, estado: est, nota: est === 'aprobada' ? e.nota : null });
                    }}
                    className="rounded-md border border-borde-2 bg-fondo px-2 py-1 text-sm"
                    aria-label="Estado"
                  >
                    <option value="cursando">Cursando</option>
                    <option value="regularizada">Regular</option>
                    <option value="aprobada">Aprobada</option>
                  </select>
                  {e.estado === 'aprobada' && (
                    <select
                      value={e.nota ?? ''}
                      onChange={(ev) => onGuardar?.({ ...e, nota: ev.target.value ? Number(ev.target.value) : null })}
                      className="rounded-md border border-borde-2 bg-fondo px-2 py-1 text-sm font-bold"
                      aria-label="Nota"
                    >
                      <option value="">Nota</option>
                      {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  )}
                  <button onClick={() => onBorrar?.(e.id)} className="rounded-md p-1.5 text-tenue hover:bg-rose-500/10 hover:text-rose-300" aria-label={`Quitar ${e.nombre}`}>
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {!soloLectura && (
        <>
          <form
            className="mt-4 grid gap-2 sm:grid-cols-[1fr_110px_150px_auto]"
            onSubmit={(ev) => {
              ev.preventDefault();
              const hs = Number(horas);
              if (!nombre.trim() || !(hs > 0)) return;
              onGuardar?.({ id: nuevoId(), nombre: nombre.trim(), horas: hs, estado, nota: null });
              setNombre('');
            }}
          >
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la electiva"
              maxLength={120}
              required
              className="rounded-xl border border-borde-2 bg-fondo px-3 py-2 text-sm placeholder:text-tenue/60 focus:border-acento focus:outline-none"
            />
            <label className="flex items-center gap-2 rounded-xl border border-borde-2 bg-fondo px-3 text-sm focus-within:border-acento">
              <input
                type="number"
                min={1}
                max={500}
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                className="w-full bg-transparent py-2 focus:outline-none"
                aria-label="Horas reloj"
              />
              <span className="text-tenue">h</span>
            </label>
            <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoElectiva)} className="rounded-xl border border-borde-2 bg-fondo px-3 py-2 text-sm" aria-label="Estado">
              <option value="cursando">Cursando</option>
              <option value="regularizada">Regular</option>
              <option value="aprobada">Aprobada</option>
            </select>
            <Boton type="submit" variante="secundario">
              <Plus size={16} /> Agregar
            </Boton>
          </form>
          <p className="mt-2 text-xs text-tenue">Cargá las horas reloj totales que figuran en el programa de la electiva (una de 2 hs cátedra anual suele ser 48 h).</p>
          {sugeridas.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-tenue">
              Oferta FRH:
              {sugeridas.map((s) => (
                <button key={s.nombre} onClick={() => setNombre(s.nombre)} className="rounded-lg border border-borde-2 px-2 py-1 text-texto/90 hover:bg-white/5">
                  {s.nombre}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

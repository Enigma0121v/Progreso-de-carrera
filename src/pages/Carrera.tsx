import { ArrowLeft, CheckCircle2, CloudUpload, Info } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Electivas } from '../components/Electivas';
import { PanelProgreso } from '../components/PanelProgreso';
import { PlanColumnas } from '../components/PlanColumnas';
import { Aviso, Boton, Chip } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { COLORES, duracion, getCarrera } from '../data/carreras';
import { useProgreso } from '../hooks/useProgreso';
import type { Carrera } from '../types';

export function CarreraPage() {
  const { id } = useParams();
  const carrera = getCarrera(id);
  if (!carrera)
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-tenue">No encontramos esa carrera.</p>
        <Link to="/carreras" className="mt-4 inline-block font-semibold text-acento">
          Ver todas las carreras
        </Link>
      </div>
    );
  return <Vista key={carrera.id} carrera={carrera} />;
}

function Vista({ carrera }: { carrera: Carrera }) {
  const { configurado, usuario, perfil, actualizarPerfil } = useAuth();
  const p = useProgreso(carrera.id);
  const col = COLORES[carrera.color];

  // La primera carrera que abre un usuario queda como "su carrera" (se cambia desde el perfil).
  useEffect(() => {
    if (perfil && !perfil.carrera_id) void actualizarPerfil({ carrera_id: carrera.id }).catch(() => {});
  }, [perfil, carrera.id, actualizarPerfil]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <Link to="/carreras" className="inline-flex items-center gap-1.5 text-sm text-tenue hover:text-texto">
            <ArrowLeft size={15} /> Todas las carreras
          </Link>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: col.hex }} />
            {carrera.nombre}
          </h1>
          <p className="mt-2 text-texto/75">{carrera.descripcion}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip fuerte>Plan {carrera.plan}</Chip>
            <Chip>{duracion(carrera)}</Chip>
            <Chip>{carrera.materias.length} materias</Chip>
            <Chip>Ord. {carrera.ordenanzaPlan}</Chip>
            <Chip>UTN · FRHaedo</Chip>
          </div>
        </div>
        <PanelProgreso carrera={carrera} progreso={p.progreso} onReiniciar={p.reiniciar} colorHex={col.hex} />
      </div>

      <div className="mt-6 space-y-3">
        {p.error && <Aviso tono="error">{p.error}</Aviso>}
        {p.localPendiente && (
          <Aviso>
            <div className="flex flex-wrap items-center gap-3">
              <CloudUpload size={18} className="shrink-0" />
              <span className="flex-1">Tenés progreso de esta carrera guardado en este dispositivo. ¿Lo subimos a tu cuenta?</span>
              <Boton onClick={p.importarLocal} className="py-1.5">
                Subir a mi cuenta
              </Boton>
              <Boton variante="secundario" onClick={p.descartarLocal} className="py-1.5">
                Ahora no
              </Boton>
            </div>
          </Aviso>
        )}
        {!usuario && configurado && (
          <Aviso>
            Tu progreso se está guardando solo en este dispositivo.{' '}
            <Link to="/ingresar" state={{ volverA: `/carreras/${carrera.id}` }} className="font-semibold text-white underline underline-offset-2">
              Ingresá o creá una cuenta
            </Link>{' '}
            para guardarlo y verlo desde cualquier dispositivo.
          </Aviso>
        )}
        <p className="flex items-start gap-2 text-sm text-tenue">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-aprobada" />
          <span>
            Marcá cada materia como <strong className="text-regular">Regular</strong> (cursada) o{' '}
            <strong className="text-aprobada">Aprobada</strong> (final aprobado) y cargá la nota. Para cursar se piden correlativas
            regulares o aprobadas según el régimen ({/^\d+$/.test(carrera.ordenanzaCorrelativas) ? `Ord. ${carrera.ordenanzaCorrelativas}` : carrera.ordenanzaCorrelativas}); para rendir el final, todas aprobadas. Tocá una
            materia para ver qué te falta.
          </span>
        </p>
      </div>

      <div className={`mt-5 transition-opacity ${p.cargando ? 'pointer-events-none opacity-40' : ''}`} aria-busy={p.cargando}>
        <PlanColumnas carrera={carrera} progreso={p.progreso} onCambiar={p.setMateria} />
      </div>

      <div className="mt-4">
        <Electivas carrera={carrera} progreso={p.progreso} onGuardar={p.guardarElectiva} onBorrar={p.borrarElectiva} />
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs text-tenue">
        <Info size={14} className="mt-px shrink-0" />
        <span>
          Práctica Profesional Supervisada: {carrera.pps.horas} h. {carrera.pps.requisito}
        </span>
      </p>
    </div>
  );
}

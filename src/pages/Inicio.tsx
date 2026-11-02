import { BookOpenCheck, CalendarDays, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { CARRERAS, TOTAL_MATERIAS } from '../data/carreras';

export function InicioPage() {
  const { usuario, configurado } = useAuth();
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 35%, rgba(47,124,246,0.18), transparent 70%), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px) 0 0/48px 48px, linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px) 0 0/48px 48px',
          maskImage: 'radial-gradient(80% 70% at 50% 40%, black, transparent)',
        }}
      />
      <header className="relative flex items-center justify-between px-4 py-4 sm:px-8">
        <span className="flex items-center gap-2.5 font-bold">
          <Logo /> FRHaedo
        </span>
        <div className="flex gap-2">
          {configurado && !usuario && (
            <Link to="/ingresar" className="flex items-center gap-2 rounded-xl border border-borde-2 px-3.5 py-2 text-sm font-semibold hover:bg-white/5">
              <LogIn size={15} /> Ingresar
            </Link>
          )}
          <Link to="/carreras" className="rounded-xl border border-borde-2 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold hover:bg-white/[0.08]">
            Ver carreras
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-16 text-center">
        <span className="rounded-full border border-borde-2 bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold tracking-wide text-texto/90 sm:text-xs">
          UNIVERSIDAD TECNOLÓGICA NACIONAL · FACULTAD REGIONAL HAEDO
        </span>
        <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
          Agenda Virtual
          <br />
          <span className="bg-gradient-to-r from-sky-300 to-blue-500 bg-clip-text text-transparent">de la UTN</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-texto/80 sm:text-lg">
          Seguí materia por materia tu avance en el plan de estudios de las ingenierías de Haedo: regulares, finales, notas y
          horas electivas.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/carreras"
            className="flex items-center gap-2 rounded-xl bg-acento px-6 py-3.5 font-bold text-white shadow-lg shadow-acento/25 hover:bg-acento/90"
          >
            <BookOpenCheck size={18} /> Plan de Estudio
          </Link>
          <span
            className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-borde-2 bg-white/[0.04] px-6 py-3.5 font-bold text-texto/50"
            title="La agenda de eventos vuelve en una próxima versión"
          >
            <CalendarDays size={18} /> Agenda <span className="text-xs font-semibold">(pronto)</span>
          </span>
        </div>
        <p className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-tenue">
          <span>
            <strong className="text-texto">{CARRERAS.length}</strong> ingenierías
          </span>
          <span>
            <strong className="text-texto">{TOTAL_MATERIAS}</strong> materias organizadas por correlativas
          </span>
          <span>{configurado ? 'Tu progreso se guarda en tu cuenta' : 'Tu progreso se guarda en este dispositivo'}</span>
        </p>
      </main>
      <footer className="relative px-4 pb-5 text-center text-xs text-tenue sm:text-left">
        Proyecto independiente, sin vínculo oficial con la UTN. Datos orientativos, no oficiales.
      </footer>
    </div>
  );
}

import { BookOpenCheck, CalendarDays, ChevronLeft, LogIn, UserRound } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export function Layout() {
  const { usuario, perfil, configurado } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const enPlan = pathname.startsWith('/carreras');

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-borde bg-fondo/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="hidden rounded-lg p-2 text-tenue hover:bg-white/5 hover:text-texto sm:block"
            aria-label="Volver"
          >
            <ChevronLeft size={18} />
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <Logo />
            <span className="truncate text-[15px] font-bold">Agenda Virtual de la UTN</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            <span
              className="hidden cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-tenue/70 md:flex"
              title="La agenda de eventos vuelve en una próxima versión"
            >
              <CalendarDays size={16} /> Agenda <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">pronto</span>
            </span>
            <Link
              to="/carreras"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${enPlan ? 'bg-acento/15 text-white' : 'text-tenue hover:text-texto'}`}
            >
              <BookOpenCheck size={16} /> <span className="hidden sm:inline">Plan de Estudio</span>
            </Link>
            {configurado &&
              (usuario ? (
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 rounded-lg border border-borde px-3 py-2 text-sm font-semibold hover:border-borde-2"
                  title={usuario.email}
                >
                  <UserRound size={16} />
                  <span className="hidden max-w-[10rem] truncate sm:inline">{perfil?.nombre || 'Mi perfil'}</span>
                </Link>
              ) : (
                <Link
                  to="/ingresar"
                  state={{ volverA: pathname }}
                  className="flex items-center gap-2 rounded-lg bg-acento px-3 py-2 text-sm font-semibold text-white hover:bg-acento/90"
                >
                  <LogIn size={16} /> Ingresar
                </Link>
              ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-borde px-4 py-6 text-center text-xs leading-relaxed text-tenue">
      Planes de estudio 2023 y correlatividades según las ordenanzas de la UTN y la Res. CD FRH 324/2023.
      <br />
      <strong className="font-semibold text-texto/80">Datos orientativos, no oficiales.</strong> Verificá siempre con
      el SAE y tu departamento. Proyecto independiente, sin vínculo oficial con la UTN.
    </footer>
  );
}

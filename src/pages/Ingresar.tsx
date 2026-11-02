import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Aviso, Boton, Campo } from '../components/ui';
import { useAuth } from '../context/AuthContext';

type Modo = 'ingresar' | 'registro' | 'recuperar';

export function IngresarPage() {
  const { configurado, usuario, ingresar, registrarse, recuperar } = useAuth();
  const navigate = useNavigate();
  const volverA = (useLocation().state as { volverA?: string } | null)?.volverA ?? '/carreras';
  const [modo, setModo] = useState<Modo>('ingresar');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (usuario) navigate(volverA, { replace: true });
  }, [usuario, navigate, volverA]);

  if (!configurado)
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Aviso>
          Las cuentas todavía no están activadas en esta copia de la página (falta configurar Supabase). Mientras tanto, tu progreso
          se guarda en este dispositivo.
        </Aviso>
        <Link to="/carreras" className="mt-4 inline-block font-semibold text-acento">
          Ir al plan de estudio
        </Link>
      </div>
    );

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setEnviando(true);
    try {
      if (modo === 'ingresar') await ingresar(email.trim(), pass);
      else if (modo === 'registro') {
        const { requiereConfirmacion } = await registrarse(email.trim(), pass, nombre.trim());
        if (requiereConfirmacion) setMensaje(`Te mandamos un mail a ${email.trim()}. Abrí el enlace para confirmar tu cuenta y después ingresá.`);
      } else {
        await recuperar(email.trim());
        setMensaje('Si hay una cuenta con ese mail, te llega un enlace para elegir una contraseña nueva.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const titulo = { ingresar: 'Ingresá a tu cuenta', registro: 'Creá tu cuenta', recuperar: 'Recuperá tu contraseña' }[modo];

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-borde-2 bg-panel p-6 sm:p-8">
        <Logo grande />
        <h1 className="mt-5 text-2xl font-extrabold">{titulo}</h1>
        <p className="mt-1 text-sm text-tenue">Tu avance, tus notas y tus electivas quedan guardados en tu cuenta y se sincronizan entre dispositivos.</p>

        {modo !== 'recuperar' && (
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-black/30 p-1 text-sm font-semibold">
            {(['ingresar', 'registro'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setModo(m);
                  setError(null);
                  setMensaje(null);
                }}
                className={`rounded-lg py-2 ${modo === m ? 'bg-white/10 text-white' : 'text-tenue hover:text-texto'}`}
              >
                {m === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={enviar} className="mt-6 space-y-4">
          {modo === 'registro' && (
            <Campo label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} autoComplete="name" placeholder="Cómo querés que te muestre" />
          )}
          <Campo label="Mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          {modo !== 'recuperar' && (
            <Campo
              label="Contraseña"
              type="password"
              required
              minLength={6}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
              ayuda={modo === 'registro' ? 'Mínimo 6 caracteres.' : undefined}
            />
          )}
          {error && <Aviso tono="error">{error}</Aviso>}
          {mensaje && <Aviso tono="ok">{mensaje}</Aviso>}
          <Boton type="submit" disabled={enviando} className="w-full">
            {enviando ? 'Un momento…' : modo === 'ingresar' ? 'Ingresar' : modo === 'registro' ? 'Crear cuenta' : 'Mandarme el enlace'}
          </Boton>
        </form>

        <div className="mt-4 text-center text-sm">
          {modo === 'recuperar' ? (
            <button onClick={() => setModo('ingresar')} className="text-tenue hover:text-texto">
              Volver a ingresar
            </button>
          ) : (
            modo === 'ingresar' && (
              <button onClick={() => setModo('recuperar')} className="text-tenue hover:text-texto">
                Me olvidé la contraseña
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

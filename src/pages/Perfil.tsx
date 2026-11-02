import { Copy, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Aviso, Boton, Campo } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { CARRERAS } from '../data/carreras';

export function PerfilPage() {
  const { usuario, perfil, cargando, actualizarPerfil, salir, nuevaPassword } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [carrera, setCarrera] = useState('');
  const [publico, setPublico] = useState(false);
  const [pass, setPass] = useState('');
  const [aviso, setAviso] = useState<{ tono: 'ok' | 'error'; texto: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!cargando && !usuario) navigate('/ingresar', { replace: true, state: { volverA: '/perfil' } });
  }, [cargando, usuario, navigate]);

  useEffect(() => {
    if (!perfil) return;
    setNombre(perfil.nombre ?? '');
    setCarrera(perfil.carrera_id ?? '');
    setPublico(perfil.perfil_publico);
  }, [perfil]);

  if (!usuario || !perfil) return <p className="p-10 text-center text-tenue">Cargando…</p>;

  const enlace = `${window.location.origin}${window.location.pathname}#/u/${usuario.id}`;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actualizarPerfil({ nombre: nombre.trim() || null, carrera_id: carrera || null, perfil_publico: publico });
      setAviso({ tono: 'ok', texto: 'Cambios guardados.' });
    } catch (err) {
      setAviso({ tono: 'error', texto: (err as Error).message });
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-extrabold">Mi perfil</h1>
        <p className="mt-1 text-sm text-tenue">{usuario.email}</p>
      </div>

      <form onSubmit={guardar} className="space-y-5 rounded-2xl border border-borde-2 bg-panel p-6">
        <Campo label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-texto/90">Mi carrera</span>
          <select value={carrera} onChange={(e) => setCarrera(e.target.value)} className="w-full rounded-xl border border-borde-2 bg-fondo px-3.5 py-2.5 text-sm">
            <option value="">Sin elegir</option>
            {CARRERAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-borde p-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={publico} onChange={(e) => setPublico(e.target.checked)} className="mt-1 size-4 accent-[#2f7cf6]" />
            <span>
              <span className="block text-sm font-semibold">Perfil público</span>
              <span className="block text-sm text-tenue">
                Tus notas son privadas. Si activás esto, cualquiera con tu enlace puede ver tu nombre, tu progreso, tus notas y tu
                promedio. Lo podés desactivar cuando quieras.
              </span>
            </span>
          </label>
          {perfil.perfil_publico && (
            <div className="mt-3 flex items-center gap-2">
              <input readOnly value={enlace} className="min-w-0 flex-1 rounded-lg border border-borde-2 bg-fondo px-2.5 py-1.5 text-xs text-tenue" />
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(enlace).then(() => setCopiado(true))}
                className="flex items-center gap-1 rounded-lg border border-borde-2 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/5"
              >
                <Copy size={13} /> {copiado ? 'Copiado' : 'Copiar'}
              </button>
              <Link to={`/u/${usuario.id}`} className="text-xs font-semibold text-acento">
                Ver
              </Link>
            </div>
          )}
        </div>
        {aviso && <Aviso tono={aviso.tono}>{aviso.texto}</Aviso>}
        <Boton type="submit">Guardar cambios</Boton>
      </form>

      <form
        className="space-y-4 rounded-2xl border border-borde-2 bg-panel p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await nuevaPassword(pass);
            setPass('');
            setAviso({ tono: 'ok', texto: 'Contraseña actualizada.' });
          } catch (err) {
            setAviso({ tono: 'error', texto: (err as Error).message });
          }
        }}
      >
        <Campo label="Cambiar contraseña" type="password" minLength={6} required value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" />
        <Boton type="submit" variante="secundario">
          Actualizar contraseña
        </Boton>
      </form>

      <Boton
        variante="peligro"
        onClick={async () => {
          await salir();
          navigate('/');
        }}
      >
        <LogOut size={16} /> Cerrar sesión
      </Boton>
    </div>
  );
}

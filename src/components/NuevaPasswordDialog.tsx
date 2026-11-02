import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { Boton, Campo } from './ui';

/** Aparece cuando el usuario vuelve desde el mail de recuperación de contraseña. */
export function NuevaPasswordDialog() {
  const { recuperando, nuevaPassword } = useAuth();
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Modal abierto={recuperando} titulo={<h2 className="text-lg font-bold">Elegí una contraseña nueva</h2>}>
      <form
        className="space-y-4 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setEnviando(true);
          setError(null);
          try {
            await nuevaPassword(pass);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setEnviando(false);
          }
        }}
      >
        <Campo label="Contraseña nueva" type="password" minLength={6} required value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <Boton type="submit" disabled={enviando} className="w-full">
          {enviando ? 'Guardando…' : 'Guardar contraseña'}
        </Boton>
      </form>
    </Modal>
  );
}

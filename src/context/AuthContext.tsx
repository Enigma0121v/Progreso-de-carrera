import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, urlRetorno } from '../lib/supabase';

export interface Perfil {
  id: string;
  nombre: string | null;
  carrera_id: string | null;
  perfil_publico: boolean;
}

interface AuthValor {
  configurado: boolean;
  cargando: boolean;
  usuario: User | null;
  perfil: Perfil | null;
  /** true cuando el usuario llegó desde el mail de "olvidé mi contraseña". */
  recuperando: boolean;
  ingresar(email: string, password: string): Promise<void>;
  registrarse(email: string, password: string, nombre: string): Promise<{ requiereConfirmacion: boolean }>;
  salir(): Promise<void>;
  recuperar(email: string): Promise<void>;
  nuevaPassword(password: string): Promise<void>;
  actualizarPerfil(cambios: Partial<Omit<Perfil, 'id'>>): Promise<void>;
}

const Ctx = createContext<AuthValor | null>(null);

const traducir = (msg: string) => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'Mail o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Todavía no confirmaste tu mail. Revisá tu casilla (y el spam).';
  if (m.includes('already registered')) return 'Ya existe una cuenta con ese mail.';
  if (m.includes('password should be')) return 'La contraseña tiene que tener al menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Esperá unos minutos y probá de nuevo.';
  if (m.includes('unable to validate email')) return 'El mail no es válido.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'No se pudo conectar con el servidor. Revisá tu conexión y probá de nuevo.';
  return msg;
};

const lanzar = (error: { message: string } | null) => {
  if (error) throw new Error(traducir(error.message));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(!!supabase);
  const [recuperando, setRecuperando] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSession(s);
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase || !userId) {
      setPerfil(null);
      return;
    }
    supabase
      .from('perfiles')
      .select('id, nombre, carrera_id, perfil_publico')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => setPerfil(data ?? { id: userId, nombre: null, carrera_id: null, perfil_publico: false }));
  }, [userId]);

  const actualizarPerfil = useCallback(
    async (cambios: Partial<Omit<Perfil, 'id'>>) => {
      if (!supabase || !userId) return;
      const { data, error } = await supabase
        .from('perfiles')
        .upsert({ id: userId, ...cambios, actualizado: new Date().toISOString() })
        .select('id, nombre, carrera_id, perfil_publico')
        .single();
      lanzar(error);
      setPerfil(data);
    },
    [userId],
  );

  const valor: AuthValor = {
    configurado: !!supabase,
    cargando,
    usuario: session?.user ?? null,
    perfil,
    recuperando,
    async ingresar(email, password) {
      lanzar((await supabase!.auth.signInWithPassword({ email, password })).error);
    },
    async registrarse(email, password, nombre) {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: { data: { nombre }, emailRedirectTo: urlRetorno() },
      });
      lanzar(error);
      return { requiereConfirmacion: !data.session };
    },
    async salir() {
      await supabase?.auth.signOut();
    },
    async recuperar(email) {
      lanzar((await supabase!.auth.resetPasswordForEmail(email, { redirectTo: urlRetorno() })).error);
    },
    async nuevaPassword(password) {
      lanzar((await supabase!.auth.updateUser({ password })).error);
      setRecuperando(false);
    },
    actualizarPerfil,
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth fuera de AuthProvider');
  return v;
}

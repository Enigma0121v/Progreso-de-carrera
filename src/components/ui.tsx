import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export function Boton({
  variante = 'primario',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'peligro' }) {
  const estilos = {
    primario: 'bg-acento text-white hover:bg-acento/90',
    secundario: 'border border-borde-2 bg-white/[0.03] text-texto hover:bg-white/[0.07]',
    peligro: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30 hover:bg-rose-500/25',
  }[variante];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${estilos} ${className}`}
    />
  );
}

export function Campo({ label, ayuda, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; ayuda?: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-texto/90">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-borde-2 bg-fondo px-3.5 py-2.5 text-sm text-texto placeholder:text-tenue/60 focus:border-acento focus:outline-none"
      />
      {ayuda && <span className="mt-1 block text-xs text-tenue">{ayuda}</span>}
    </label>
  );
}

export function Chip({ children, fuerte = false }: { children: ReactNode; fuerte?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs ${fuerte ? 'border-white/20 bg-white/[0.06] font-bold text-white' : 'border-borde-2 text-texto/80'}`}
    >
      {children}
    </span>
  );
}

export function Aviso({ tono = 'info', children }: { tono?: 'info' | 'error' | 'ok'; children: ReactNode }) {
  const t = {
    info: 'border-acento/30 bg-acento/10 text-sky-100',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  }[tono];
  return <div className={`rounded-xl border px-4 py-3 text-sm ${t}`}>{children}</div>;
}

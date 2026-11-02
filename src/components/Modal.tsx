import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({
  abierto,
  onCerrar,
  titulo,
  children,
  ancho = 'max-w-md',
}: {
  abierto: boolean;
  onCerrar?: () => void;
  titulo: ReactNode;
  children: ReactNode;
  ancho?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar?.();
    window.addEventListener('keydown', tecla);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', tecla);
  }, [abierto, onCerrar]);
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onCerrar}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`max-h-[88dvh] w-full ${ancho} overflow-y-auto rounded-t-2xl border border-borde-2 bg-panel-2 shadow-2xl outline-none sm:rounded-2xl scroll-fino`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-borde p-5">
          <div className="min-w-0 flex-1">{titulo}</div>
          {onCerrar && (
            <button onClick={onCerrar} className="-m-1 rounded-lg p-1 text-tenue hover:bg-white/5 hover:text-texto" aria-label="Cerrar">
              <X size={18} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

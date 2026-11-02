import { GraduationCap } from 'lucide-react';

export function Logo({ grande = false }: { grande?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl bg-acento/15 text-acento ring-1 ring-acento/30 ${grande ? 'size-11' : 'size-9'}`}
    >
      <GraduationCap size={grande ? 22 : 18} />
    </span>
  );
}

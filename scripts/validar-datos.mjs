// Valida los JSON de src/data/carreras: referencias, ciclos, niveles y totales.
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'carreras');
let errores = 0;
const err = (c, m) => { errores++; console.error(`✗ [${c}] ${m}`); };

for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  const porN = new Map(c.materias.map((m) => [m.n, m]));
  if (porN.size !== c.materias.length) err(c.id, 'números de materia repetidos');
  for (const m of c.materias) {
    for (const campo of ['cursadas', 'aprobadas']) {
      for (const r of m[campo]) {
        const ref = porN.get(r);
        if (!ref) err(c.id, `${m.n} ${m.nombre}: ${campo} referencia inexistente ${r}`);
        else if (ref.nivel > m.nivel) err(c.id, `${m.n} ${m.nombre}: correlativa ${r} es de un nivel posterior`);
        if (r === m.n) err(c.id, `${m.n}: se referencia a sí misma`);
      }
    }
    const dup = m.cursadas.filter((r) => m.aprobadas.includes(r));
    if (dup.length) console.warn(`! [${c.id}] ${m.n} ${m.nombre}: ${dup} figura como cursada y aprobada (así está en la ordenanza; rige aprobada)`);
    if (!(m.horas > 0)) err(c.id, `${m.n}: horas inválidas`);
  }
  // ciclos
  const estado = new Map();
  const visitar = (n, camino) => {
    if (estado.get(n) === 1) { err(c.id, `ciclo: ${[...camino, n].join(' → ')}`); return; }
    if (estado.get(n) === 2) return;
    estado.set(n, 1);
    const m = porN.get(n);
    for (const r of [...(m?.cursadas ?? []), ...(m?.aprobadas ?? [])]) if (porN.has(r)) visitar(r, [...camino, n]);
    estado.set(n, 2);
  };
  for (const m of c.materias) visitar(m.n, []);
  const niveles = [...new Set(c.materias.map((m) => m.nivel))].sort();
  const horas = c.materias.reduce((s, m) => s + m.horas, 0);
  console.log(`✓ ${c.nombre}: ${c.materias.length} materias, niveles ${niveles.join(',')}, ${horas} h + ${c.electivas.horasRequeridas} h electivas, integradoras ${c.materias.filter((m) => m.integradora).map((m) => m.n).join(',') || '—'}`);
}
if (errores) { console.error(`\n${errores} error(es)`); process.exit(1); }
console.log('\nDatos OK');

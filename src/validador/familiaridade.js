// Familiaridade: quanto um número da barra de dominância se parece com os números
// que o último número puxou. Cada característica em comum com cada puxado vale
// 1 ponto, então um puxado que veio 3 vezes pesa 3 vezes.
import { COLUMNS } from "./engine.js";

const CLASSES = ["coluna", "duzia", "regtrack", "cor", "paridade", "altobaixo"]
  .map(key => COLUMNS.find(c => c.key === key));

export function emComum(a, b) {
  return CLASSES.map(c => c.fn(a)).filter((v, i) => v !== "—" && v === CLASSES[i].fn(b));
}

// Devolve os números de maior pontuação e, para cada um, o puxado mais parecido.
export function maisFamiliares(candidatos, puxados) {
  if (!candidatos.length || !puxados.length) return { nums: [], motivo: {} };
  const pontos = candidatos.map(n => puxados.reduce((s, p) => s + emComum(n, p).length, 0));
  const max = Math.max(...pontos);
  const nums = candidatos.filter((_, i) => pontos[i] === max);
  const motivo = {};
  for (const n of nums) {
    const com = puxados.reduce((m, p) => (emComum(n, p).length > emComum(n, m).length ? p : m));
    motivo[n] = { com, classes: emComum(n, com), pontos: max };
  }
  return { nums, motivo };
}

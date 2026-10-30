import { test } from "node:test";
import assert from "node:assert/strict";
import { COLUMNS, parseHistorico, juntarSobrepostas, validar, zCritico, padroes, situacao, cruzado } from "./engine.js";

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const aleatorio = (n, seed) => { const r = rng(seed); return Array.from({ length: n }, () => Math.floor(r() * 37)); };
const sessoesDe = (nums, tam = 200) => Array.from({ length: Math.ceil(nums.length / tam) }, (_, i) => ({ date: "2026-10-01", nums: nums.slice(i * tam, (i + 1) * tam) }));

test("cada coluna cobre os 37 números", () => {
  for (const c of COLUMNS) assert.equal(c.nums.flat().length, 37, c.key);
  const cor = COLUMNS.find(c => c.key === "cor");
  assert.equal(cor.fn(0), "Verde");
  assert.equal(cor.fn(32), "Vermelho");
});

test("importa linhas no formato colado e põe em ordem cronológica", () => {
  const nums = (a) => a.join(" ");
  const txt = `1. 30/10/2026 — ${nums(aleatorio(50, 1))}\n2. 22/09/2026 — ${nums(aleatorio(50, 2))}`;
  const b = parseHistorico(txt, true);
  assert.deepEqual(b.map(x => x.date), ["2026-09-22", "2026-10-30"]);
  assert.equal(b[0].nums.length, 50);
});

test("como na tabela, o primeiro número de cada linha é o mais recente", () => {
  const linha = "30/10/2026 — " + Array.from({ length: 12 }, (_, i) => i + 1).join(" ");
  assert.deepEqual(parseHistorico(linha)[0].nums, [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  assert.deepEqual(parseHistorico(linha, true, false)[0].nums, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test("junta blocos extraídos em duplicidade sem repetir números", () => {
  const base = aleatorio(300, 3);
  const r = juntarSobrepostas([{ date: "d", nums: base.slice(0, 200) }, { date: "d", nums: base.slice(60, 300) }]);
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].nums, base);
  const inv = juntarSobrepostas([{ date: "d", nums: base.slice(60, 300) }, { date: "d", nums: base.slice(0, 200) }]);
  assert.deepEqual(inv[0].nums, base);
});

test("histórico curto não dá sinal", () => {
  const v = validar(sessoesDe(aleatorio(300, 4)));
  assert.equal(v.sinal.entrar, false);
  assert.match(v.sinal.motivo, /Histórico curto/);
});

test("números aleatórios não liberam nenhuma estratégia", () => {
  for (const seed of [5, 6]) {
    const v = validar(sessoesDe(aleatorio(2000, seed)));
    assert.deepEqual(v.estrategias.filter(e => e.liberada).map(e => e.id), [], `seed ${seed}`);
    assert.equal(v.sinal.entrar, false);
  }
});

test("um padrão real é encontrado e vira sinal", () => {
  // Dúzia anda em ciclo D1 → D2 → D3, número sorteado dentro da dúzia.
  const r = rng(7);
  const nums = Array.from({ length: 1500 }, (_, i) => (i % 3) * 12 + 1 + Math.floor(r() * 12));
  const v = validar(sessoesDe(nums));
  assert.ok(v.estrategias.find(e => e.id === "pad:duzia:3").liberada);
  assert.ok(v.colunas.find(c => c.key === "duzia").estavel);
  assert.equal(v.sinal.entrar, true);
  // último número é da D3 (índice 1499 % 3 = 2), então o próximo é D1
  assert.ok(v.sinal.nums.every(n => n >= 1 && n <= 12), JSON.stringify(v.sinal.nums));
});

test("previsões passadas não mudam quando chegam números novos (não olha o futuro)", () => {
  const nums = aleatorio(900, 8);
  const curto = [nums.slice(0, 400), nums.slice(400, 800)];
  const longo = [nums.slice(0, 400), nums.slice(400, 900)];
  const col = COLUMNS.find(c => c.key === "rua");
  for (const run of [s => padroes(s, col, 3), s => situacao(s, 5), s => cruzado(s)]) {
    const a = run(curto).events;
    const b = run(longo).events.filter(e => e.g < 800);
    assert.ok(a.length > 0);
    assert.deepEqual(b, a);
  }
});

test("z crítico corrige por muitas estratégias", () => {
  assert.ok(Math.abs(zCritico(0.05) - 1.645) < 0.01);
  assert.ok(zCritico(0.05 / 72) > 3);
});

test("confluência: ranking em ordem e top 1 aposta em 1 número só", () => {
  const v = validar(sessoesDe(aleatorio(700, 9)));
  const r = v.confluencia;
  assert.ok(r.length > 0);
  for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].sinais >= r[i].sinais);
  const top1 = v.estrategias.find(e => e.id === "conf:top1");
  assert.equal(top1.geral.fichas, top1.geral.n);
  const alerta = v.estrategias.find(e => e.id === "conf:alerta");
  assert.ok(alerta.geral.n <= top1.geral.n);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sinaisDaSessao, TIPOS_TABELA } from "./sinaisTabela.js";

// Resultado do código real da tabela (App.jsx com os patches, rodado pelo Vite)
// na sessão de 30/10/2026: por sinal, quantos sinais, acertos e fichas.
const fixture = JSON.parse(readFileSync(new URL("./paridade.fixture.json", import.meta.url), "utf8"));

test("os sinais são os mesmos da tabela real, giro a giro", () => {
  const { nums, esperado } = fixture;
  const obtido = {};
  sinaisDaSessao(nums).forEach((lista, i) => {
    if (i >= nums.length - 1) return;
    for (const { tipo, nums: aposta } of lista) {
      const a = (obtido[tipo] ||= { n: 0, hits: 0, fichas: 0 });
      a.n++; a.hits += aposta.includes(nums[i + 1]) ? 1 : 0; a.fichas += aposta.length;
    }
  });
  assert.deepEqual(obtido, esperado);
});

test("todos os tipos de sinal são conhecidos", () => {
  const vistos = new Set(sinaisDaSessao(fixture.nums).flat().map(s => s.tipo));
  for (const t of vistos) assert.ok(TIPOS_TABELA.includes(t), t);
});

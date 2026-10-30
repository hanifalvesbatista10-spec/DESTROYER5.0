import { test } from "node:test";
import assert from "node:assert/strict";
import { cavalosRua, cavaloDoEspaco, ruaDe } from "./estrategiasPersonalizadas.js";

// As listas aqui vão do mais antigo ao mais novo.
const primeira = (nums) => cavalosRua(nums).ocorrencias[0];

test("espaço entre as repetições define o cavalo", () => {
  assert.equal(cavaloDoEspaco(0), "0369");
  assert.equal(cavaloDoEspaco(1), "147");
  assert.equal(cavaloDoEspaco(2), "258");
  assert.equal(cavaloDoEspaco(6), "0369");
  assert.deepEqual(ruaDe(2), [1, 2, 3]);
  assert.deepEqual(ruaDe(36), [34, 35, 36]);
  assert.deepEqual(ruaDe(0), [0]);
});

test("2, 2 e a rua volta depois de 3 rodadas sem ela: batida", () => {
  const oc = primeira([2, 2, 30, 8, 11, 3]);
  assert.equal(oc.cavalo, "0369");
  assert.equal(oc.status, "batida");
  assert.equal(oc.posicao, 3);
});

test("não veio na 3ª, veio depois de 6 rodadas sem a rua: complementada", () => {
  const oc = primeira([2, 2, 30, 8, 11, 20, 30, 8, 1]);
  assert.equal(oc.status, "complementada");
  assert.equal(oc.posicao, 6);
});

test("passou de 9 rodadas sem a rua: anulada", () => {
  const oc = primeira([2, 2, 30, 8, 11, 20, 30, 8, 11, 20, 30, 8, 1]);
  assert.equal(oc.status, "anulada");
});

test("rua apareceu fora da posição: a contagem recomeça dali", () => {
  // 1 sai com 1 rodada sem a rua (fora de 3/6/9) e zera; depois 3 rodadas sem e vem o 3
  const oc = primeira([2, 2, 30, 1, 8, 11, 20, 3]);
  assert.equal(oc.status, "batida");
  assert.equal(oc.eventos[0].aposta, false);
});

test("cavalo 147: 5, x, 5 e a rua 4-5-6 volta depois de 1 rodada", () => {
  const oc = primeira([5, 9, 5, 20, 6]);
  assert.equal(oc.cavalo, "147");
  assert.equal(oc.status, "batida");
});

test("cavalo 258: 8, x, y, 8 e a rua 7-8-9 volta depois de 2 rodadas", () => {
  const oc = primeira([8, 1, 30, 8, 20, 33, 7]);
  assert.equal(oc.cavalo, "258");
  assert.equal(oc.status, "batida");
});

test("aposta só nos giros de posição, e só para a frente", () => {
  const { apostas } = cavalosRua([2, 2, 30, 8, 11]);
  // depois do 11 (3 rodadas sem a rua) a próxima rodada é a posição 3
  assert.deepEqual(apostas[4].map(a => [a.cavalo, a.pos, a.nums]), [["0369", 3, [1, 2, 3]]]);
  assert.deepEqual(apostas[3], []);
});

test("repetição com mais de 9 números no meio não abre estratégia", () => {
  assert.equal(cavalosRua([2, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 2]).ocorrencias.length, 0);
});

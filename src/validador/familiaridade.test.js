import { test } from "node:test";
import assert from "node:assert/strict";
import { emComum, maisFamiliares } from "./familiaridade.js";

test("32 e 35: mesma coluna, dúzia e região", () => {
  const c = emComum(32, 35);
  for (const v of ["C2", "D3", "32-29"]) assert.ok(c.includes(v), v);
});

test("8 e 2: preto, par e baixo", () => {
  const c = emComum(8, 2);
  for (const v of ["Preto", "Par", "BAIXO"]) assert.ok(c.includes(v), v);
});

test("o zero não combina com ninguém por não ter paridade", () => {
  assert.ok(!emComum(0, 0).includes("—"));
});

test("15 puxou 35, 35, 35, 14, 8 e a barra deu 2, 4, 32, 34: o dourado é o 32", () => {
  const r = maisFamiliares([2, 4, 32, 34], [35, 35, 35, 14, 8]);
  assert.deepEqual(r.nums, [32]);
  assert.equal(r.motivo[32].com, 35);
});

test("sem números puxados não tem dourado", () => {
  assert.deepEqual(maisFamiliares([2, 4], []).nums, []);
});

test("empate dá dourado nos dois", () => {
  assert.deepEqual(maisFamiliares([7, 7], [7]).nums, [7, 7]);
});

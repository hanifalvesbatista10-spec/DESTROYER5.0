// Motor do Validador.
// Anda giro a giro pelo histórico, sem nunca olhar o futuro, e mede se cada
// estratégia previu o próximo número melhor que o acaso. Só libera sinal para
// estratégia que bateu o acaso com folga no treino E de novo em dados que ela
// nunca viu (os 25% mais recentes do histórico).

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const TIER = new Set([5,8,10,11,13,16,23,24,27,30,33,36]);
const ORPH = new Set([1,6,9,14,17,20,31,34]);
const PB_VA = new Set([0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10]);
const OPO_ZERO = new Set([26,3,35,12,28,7,29,18,22,32,15,19,4,21,2,25,17,34]);
const REGTRACK = {
  "32-29": [32,0,26,3,35,12,28,7,29], "25-30": [25,17,34,6,27,13,36,11,30],
  "15-2": [15,19,4,21,2], "8-24": [8,23,10,5,24], "16-18": [16,33,1,20,14,31,9,22,18],
};
const FRA = {
  F1e: [32,15,19,4,21,2], F2e: [25,17,34,6,27,13], F3e: [36,11,30,8,23,10],
  F1d: [26,3,35,12,28,7], F2d: [29,18,22,9,31,14], F3d: [20,1,33,16,24,5],
};
const GP = {
  d3V: [25,27,30,32,34,36], d3P: [26,28,29,31,33,35], d2P: [14,16,18,20,22,24],
  d2I: [13,15,17,19,21,23], d1V: [1,3,5,7,9,12], d1P: [2,4,6,8,10,11],
};
export const RACETRACK = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

const findIn = (map, n) => Object.keys(map).find(k => map[k].includes(n)) ?? "—";
function rua(n) {
  if (n === 0) return "0";
  const p = (n - 1) % 12;
  return p <= 2 ? "R1" : p <= 5 ? "R2" : p <= 8 ? "R3" : "R4";
}

// Mesmas colunas da tabela do DESTROYER (src/App.jsx).
export const COLUMNS = [
  { key: "rua", label: "Rua", fn: rua },
  { key: "parte", label: "Parte", fn: n => n === 0 ? "—" : (["R1","R2"].includes(rua(n)) ? "P1" : "P2") },
  { key: "coluna", label: "Coluna", fn: n => n === 0 ? "0" : "C" + ((n - 1) % 3 + 1) },
  { key: "ruaParidade", label: "Rua par/ímpar", fn: n => n === 0 ? "—" : (["R1","R3"].includes(rua(n)) ? "R.Ímpar" : "R.Par") },
  { key: "cavalo", label: "Cavalo", fn: n => [3,6,9,0].includes(n % 10) ? "369" : [2,5,8].includes(n % 10) ? "258" : "147" },
  { key: "altobaixo", label: "Alto/Baixo", fn: n => n === 0 ? "—" : (n <= 18 ? "BAIXO" : "ALTO") },
  { key: "cor", label: "Cor", fn: n => n === 0 ? "Verde" : RED.has(n) ? "Vermelho" : "Preto" },
  { key: "lado", label: "Lado", fn: n => PB_VA.has(n) ? "PB e VA" : "PA e VB" },
  { key: "regiao", label: "Região", fn: n => TIER.has(n) ? "Tier" : ORPH.has(n) ? "Orphelins" : "Voisins" },
  { key: "duzia", label: "Dúzia", fn: n => n === 0 ? "—" : "D" + (Math.floor((n - 1) / 12) + 1) },
  { key: "paridade", label: "Par/Ímpar", fn: n => n === 0 ? "—" : (n % 2 === 0 ? "Par" : "Ímpar") },
  { key: "gp", label: "GP", fn: n => findIn(GP, n) },
  { key: "setor", label: "Setor", fn: n => n === 0 ? "—" : "S" + (Math.floor((n - 1) / 6) + 1) },
  { key: "regtrack", label: "RegTrack", fn: n => findIn(REGTRACK, n) },
  { key: "fra", label: "FRA", fn: n => n === 0 ? "—" : findIn(FRA, n) },
  { key: "grupoDezena", label: "Casa", fn: n => String(Math.min(Math.floor(n / 10), 3) * 10) },
  { key: "opo", label: "OPO", fn: n => n === 0 ? "—" : (OPO_ZERO.has(n) ? "ZERO" : "DEZ") },
];

// Para cada coluna: lista de categorias, números de cada categoria e código de cada número.
for (const col of COLUMNS) {
  col.cats = [];
  col.nums = [];
  col.code = new Int8Array(37);
  for (let n = 0; n <= 36; n++) {
    const v = col.fn(n);
    let i = col.cats.indexOf(v);
    if (i === -1) { i = col.cats.length; col.cats.push(v); col.nums.push([]); }
    col.nums[i].push(n);
    col.code[n] = i;
  }
}

// Em quantas colunas dois números têm a mesma característica.
const MATCH = Array.from({ length: 37 }, (_, a) =>
  Int8Array.from({ length: 37 }, (_, b) => COLUMNS.reduce((s, c) => s + (c.code[a] === c.code[b]), 0)));

// ---------- importação do histórico ----------

const DATE_RE = /(\d{2})\/(\d{2})\/(\d{4})/;

// Aceita linhas como "1. 30/10/2026 — 34 28 21 ..." ou "30/10/2026|34 28 ...".
// Os números de cada linha vêm do mais antigo para o mais novo.
export function parseHistorico(text, maisRecentePrimeiro = true) {
  let blocos = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(DATE_RE);
    if (!m) continue;
    const resto = line.slice(m.index + m[0].length);
    const nums = (resto.match(/\d+/g) || []).map(Number).filter(n => n <= 36);
    if (nums.length < 10) continue;
    blocos.push({ date: `${m[3]}-${m[2]}-${m[1]}`, nums });
  }
  if (maisRecentePrimeiro) blocos.reverse();
  blocos = blocos.map((b, i) => ({ ...b, i })).sort((a, b) => a.date.localeCompare(b.date) || a.i - b.i);
  return juntarSobrepostas(blocos.map(({ date, nums }) => ({ date, nums })));
}

const RUN = 12;
function compartilhaTrecho(a, b) {
  const set = new Set();
  for (let i = 0; i + RUN <= a.length; i++) set.add(a.slice(i, i + RUN).join(","));
  for (let i = 0; i + RUN <= b.length; i++) if (set.has(b.slice(i, i + RUN).join(","))) return true;
  return false;
}

// Blocos extraídos duas vezes repetem trechos; contar duas vezes faria um padrão
// "se repetir" de mentira. Junta quando o fim de um é o começo do outro; senão fica o maior.
export function juntarSobrepostas(blocos) {
  const out = [];
  for (const b of blocos) {
    const a = out[out.length - 1];
    if (!a || !compartilhaTrecho(a.nums, b.nums)) { out.push({ ...b, nums: [...b.nums] }); continue; }
    // Dentro do mesmo dia a ordem da lista nem sempre é a do tempo: tenta os dois sentidos.
    let juntou = false;
    for (let k = Math.min(a.nums.length, b.nums.length); k >= RUN && !juntou; k--) {
      if (a.nums.slice(-k).join(",") === b.nums.slice(0, k).join(",")) {
        a.nums = a.nums.concat(b.nums.slice(k)); a.date = b.date; juntou = true;
      } else if (b.nums.slice(-k).join(",") === a.nums.slice(0, k).join(",")) {
        a.nums = b.nums.concat(a.nums.slice(k)); juntou = true;
      }
    }
    if (!juntou && b.nums.length > a.nums.length) out[out.length - 1] = { ...b, nums: [...b.nums] };
  }
  return out;
}

// ---------- estatística ----------

function phi(z) {
  // CDF da normal padrão (Abramowitz-Stegun 7.1.26).
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}
export function zCritico(alfa) {
  let lo = 0, hi = 10;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (1 - phi(m) > alfa) lo = m; else hi = m; }
  return hi;
}

function resumo(events) {
  let n = 0, hits = 0, exp = 0, varr = 0, fichas = 0, retorno = 0;
  for (const e of events) {
    const p = e.bet / 37;
    n++; hits += e.hit; exp += p; varr += p * (1 - p); fichas += e.bet; retorno += e.hit ? 36 : 0;
  }
  return { n, hits, taxa: n ? hits / n : 0, acaso: n ? exp / n : 0, z: varr ? (hits - exp) / Math.sqrt(varr) : 0, saldo: retorno - fichas, fichas };
}

// ---------- estratégias ----------
// Cada uma devolve { events: [{g, hit, bet}], agora: {nums, detalhe} | null }.
// g é a posição global do giro previsto; "agora" é a previsão para o próximo giro.

const PAD_MIN = 6, PAD_CONF = 0.6;

export function padroes(seqs, col, K) {
  const tab = new Map();
  const events = [];
  let g = 0, agora = null;
  seqs.forEach((s, si) => {
    const v = s.map(n => col.code[n]);
    const consulta = (t) => {
      const cnt = tab.get(v.slice(t - K, t).join(","));
      if (!cnt) return null;
      let tot = 0, best = 0;
      for (let i = 0; i < cnt.length; i++) { tot += cnt[i]; if (cnt[i] > cnt[best]) best = i; }
      return tot >= PAD_MIN && cnt[best] / tot >= PAD_CONF ? { best, tot, share: cnt[best] / tot } : null;
    };
    for (let t = 0; t < v.length; t++, g++) {
      if (t < K) continue;
      const r = consulta(t);
      if (r) events.push({ g, hit: v[t] === r.best ? 1 : 0, bet: col.nums[r.best].length });
      const key = v.slice(t - K, t).join(",");
      if (!tab.has(key)) tab.set(key, new Int32Array(col.cats.length));
      tab.get(key)[v[t]]++;
    }
    if (si === seqs.length - 1 && v.length >= K) {
      const r = consulta(v.length);
      if (r) agora = {
        nums: col.nums[r.best],
        detalhe: `${col.label}: a sequência ${v.slice(-K).map(i => col.cats[i]).join(" → ")} foi seguida por ${col.cats[r.best]} em ${Math.round(r.share * 100)}% de ${r.tot} vezes`,
      };
    }
  });
  return { events, agora };
}

const KNN_M = 40, KNN_TOP = 6, KNN_MIN_HIST = 300;

// Compara a situação atual (últimos W giros, nas 17 colunas) com todos os
// momentos anteriores e aposta nos números que mais vieram depois dos mais parecidos.
export function situacao(seqs, W) {
  const wins = [], next = [], gs = [];
  let g = 0;
  seqs.forEach((s, si) => {
    for (let t = 0; t <= s.length; t++) {
      if (t >= W && (t < s.length || si === seqs.length - 1)) {
        wins.push(s.slice(t - W, t)); next.push(t < s.length ? s[t] : -1); gs.push(t < s.length ? g + t : -1);
      }
    }
    g += s.length;
  });
  const events = [];
  let agora = null;
  const hist = new Int32Array(17 * W + 1);
  const score = new Int32Array(wins.length);
  for (let i = KNN_MIN_HIST; i < wins.length; i++) {
    hist.fill(0);
    const a = wins[i];
    for (let j = 0; j < i; j++) {
      if (next[j] < 0) continue;
      const b = wins[j];
      let sc = 0;
      for (let w = 0; w < W; w++) sc += MATCH[a[w]][b[w]];
      score[j] = sc; hist[sc]++;
    }
    let corte = hist.length - 1, acc = 0;
    while (corte > 0 && acc + hist[corte] < KNN_M) acc += hist[corte--];
    const cnt = new Int32Array(37);
    for (let j = 0; j < i; j++) if (next[j] >= 0 && score[j] >= corte) cnt[next[j]]++;
    const pred = [...Array(37).keys()].sort((x, y) => cnt[y] - cnt[x] || x - y).slice(0, KNN_TOP);
    if (next[i] >= 0) events.push({ g: gs[i], hit: pred.includes(next[i]) ? 1 : 0, bet: KNN_TOP });
    else agora = { nums: pred.sort((x, y) => x - y), detalhe: `Situação dos últimos ${W} giros comparada com o histórico: números que mais vieram depois das ${KNN_M} situações mais parecidas` };
  }
  return { events, agora };
}

const CR_W = 40, CR_Z = 2, CR_COLS = 3, CR_MAX = 12;

// Junta as colunas que estão mais quentes nos últimos 40 giros e aposta na interseção.
export function cruzado(seqs) {
  const events = [];
  let g = 0, agora = null;
  const prevê = (win) => {
    const fortes = [];
    for (const col of COLUMNS) {
      const cnt = new Int32Array(col.cats.length);
      for (const n of win) cnt[col.code[n]]++;
      let best = null;
      col.cats.forEach((_, k) => {
        const p = col.nums[k].length / 37;
        const z = (cnt[k] - win.length * p) / Math.sqrt(win.length * p * (1 - p));
        if (z >= CR_Z && (!best || z > best.z)) best = { col, k, z };
      });
      if (best) fortes.push(best);
    }
    fortes.sort((a, b) => b.z - a.z);
    const usados = fortes.slice(0, CR_COLS);
    if (!usados.length) return null;
    let nums = [...Array(37).keys()];
    for (const f of usados) nums = nums.filter(n => f.col.code[n] === f.k);
    return nums.length && nums.length <= CR_MAX ? { nums, usados } : null;
  };
  seqs.forEach((s, si) => {
    for (let t = CR_W; t < s.length; t++) {
      const r = prevê(s.slice(t - CR_W, t));
      if (r) events.push({ g: g + t, hit: r.nums.includes(s[t]) ? 1 : 0, bet: r.nums.length });
    }
    if (si === seqs.length - 1 && s.length >= CR_W) {
      const r = prevê(s.slice(-CR_W));
      if (r) agora = { nums: r.nums, detalhe: `Filtros cruzados dos últimos ${CR_W} giros: ${r.usados.map(f => `${f.col.label} ${f.col.cats[f.k]}`).join(" + ")}` };
    }
    g += s.length;
  });
  return { events, agora };
}

// ---------- validação ----------

export const MIN_HISTORICO = 500;
const PARTE_TESTE = 0.25;

export function validar(sessoes) {
  const seqs = sessoes.map(s => s.nums).filter(s => s.length);
  const total = seqs.reduce((a, s) => a + s.length, 0);
  const estrategias = [];
  for (const col of COLUMNS) for (const K of [3, 4, 5])
    estrategias.push({ id: `pad:${col.key}:${K}`, familia: "Padrão que se repete", coluna: col.key, label: `${col.label} — sequência de ${K}`, run: () => padroes(seqs, col, K) });
  for (const W of [5, 10])
    estrategias.push({ id: `sit:${W}`, familia: "Situação parecida", label: `Últimos ${W} giros × histórico`, run: () => situacao(seqs, W) });
  estrategias.push({ id: "cruzado", familia: "Filtros cruzados", label: "Colunas quentes (40 giros)", run: () => cruzado(seqs) });

  const zc = zCritico(0.05 / estrategias.length);
  const corte = Math.floor(total * (1 - PARTE_TESTE));
  const curto = total < MIN_HISTORICO;

  const res = estrategias.map(({ run, ...e }) => {
    const { events, agora } = curto ? { events: [], agora: null } : run();
    const treino = resumo(events.filter(x => x.g < corte));
    const teste = resumo(events.filter(x => x.g >= corte));
    let motivo;
    if (curto) motivo = "histórico curto";
    else if (treino.n < 30) motivo = `poucos sinais no treino (${treino.n})`;
    else if (treino.z < zc) motivo = `no treino acertou ${pct(treino.taxa)} contra ${pct(treino.acaso)} do acaso — diferença dentro do normal`;
    else if (treino.saldo <= 0) motivo = "acertou acima do acaso no treino, mas não o bastante para dar lucro";
    else if (teste.n < 20) motivo = `poucos sinais nos dados novos (${teste.n})`;
    else if (teste.z < 1.645 || teste.saldo <= 0) motivo = `funcionou no treino, mas nos dados novos acertou ${pct(teste.taxa)} contra ${pct(teste.acaso)}`;
    const liberada = !motivo;
    return { ...e, treino, teste, liberada, motivo: motivo || `acertou ${pct(teste.taxa)} contra ${pct(teste.acaso)} do acaso em ${teste.n} sinais novos`, agora };
  });

  const colunas = COLUMNS.map(col => {
    const doCol = res.filter(r => r.coluna === col.key);
    const melhor = doCol.reduce((a, b) => (b.treino.z > a.treino.z ? b : a));
    return { key: col.key, label: col.label, estavel: doCol.some(r => r.liberada), melhor };
  });

  const ativas = res.filter(r => r.liberada && r.agora);
  let sinal;
  if (curto) sinal = { entrar: false, motivo: `Histórico curto: ${total} de ${MIN_HISTORICO} números necessários para testar.` };
  else if (!res.some(r => r.liberada)) sinal = { entrar: false, motivo: `Nenhuma das ${res.length} estratégias bateu o acaso nos seus ${total} números.` };
  else if (!ativas.length) sinal = { entrar: false, motivo: "Há estratégia aprovada, mas a situação atual não forma sinal dela agora." };
  else {
    let nums = ativas[0].agora.nums;
    for (const a of ativas.slice(1)) {
      const inter = nums.filter(n => a.agora.nums.includes(n));
      if (inter.length) nums = inter;
    }
    sinal = { entrar: true, nums, fontes: ativas };
  }
  return { total, sessoes: seqs.length, zCritico: zc, corte, estrategias: res, colunas, sinal };
}

const pct = x => `${(x * 100).toFixed(1).replace(".", ",")}%`;
export { pct };

import { useState, useMemo, useRef } from "react";

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

const LADO_RACE = {
   0:"PB e VA", 32:"PB e VA", 15:"PB e VA", 19:"PB e VA",  4:"PB e VA",
  21:"PB e VA",  2:"PB e VA", 25:"PB e VA", 17:"PB e VA", 34:"PB e VA",
   6:"PB e VA", 27:"PB e VA", 13:"PB e VA", 36:"PB e VA", 11:"PB e VA",
  30:"PB e VA",  8:"PB e VA", 23:"PB e VA", 10:"PB e VA",
  26:"PA e VB",  3:"PA e VB", 35:"PA e VB", 12:"PA e VB", 28:"PA e VB",
   7:"PA e VB", 29:"PA e VB", 18:"PA e VB", 22:"PA e VB",  9:"PA e VB",
  31:"PA e VB", 14:"PA e VB", 20:"PA e VB",  1:"PA e VB", 33:"PA e VB",
  16:"PA e VB", 24:"PA e VB",  5:"PA e VB",
};

const TIER_NUMS = new Set([5,8,10,11,13,16,23,24,27,30,33,36]);
const ORPHELINS = new Set([1,6,9,14,17,20,31,34]);

const GP_MAP = {
  25:"d3V",27:"d3V",30:"d3V",32:"d3V",34:"d3V",36:"d3V",
  26:"d3P",28:"d3P",29:"d3P",31:"d3P",33:"d3P",35:"d3P",
  14:"d2P",16:"d2P",18:"d2P",20:"d2P",22:"d2P",24:"d2P",
  13:"d2I",15:"d2I",17:"d2I",19:"d2I",21:"d2I",23:"d2I",
   1:"d1V", 3:"d1V", 5:"d1V", 7:"d1V", 9:"d1V",12:"d1V",
   2:"d1P", 4:"d1P", 6:"d1P", 8:"d1P",10:"d1P",11:"d1P",
};

function getRua(n) {
  if (n===0) return "0";
  const pos = (n-1)%12;
  if (pos<=2) return "R1"; if (pos<=5) return "R2";
  if (pos<=8) return "R3"; return "R4";
}
function getParte(n) {
  if (n===0) return "—";
  const rua = getRua(n);
  return (rua==="R1"||rua==="R2") ? "P1" : "P2";
}
function getColuna(n) {
  if (n===0) return "0";
  const r = n%3;
  if (r===1) return "C1"; if (r===2) return "C2"; return "C3";
}
function getRuaParidade(n) {
  if (n === 0) return "—";
  const r = getRua(n);
  return (r==="R1"||r==="R3") ? "R.Ímpar" : "R.Par";
}
function getCavalo(n) {
  if (n === 0) return "369";
  const t = n % 10;
  if ([3,6,9,0].includes(t)) return "369";
  if ([2,5,8].includes(t)) return "258";
  if ([1,4,7].includes(t)) return "147";
  return "—";
}
function getAltoBaixo(n) {
  if (n === 0) return "—";
  return n <= 18 ? "BAIXO" : "ALTO";
}
function getColor(n)    { if(n===0) return "Verde"; if(RED_NUMS.has(n)) return "Vermelho"; return "Preto"; }
function getLado(n)     { return LADO_RACE[n]||"—"; }
function getRegiao(n)   { if(TIER_NUMS.has(n)) return "Tier"; if(ORPHELINS.has(n)) return "Orphelins"; return "Voisins"; }
function getDuzia(n)    { if(n===0) return "—"; if(n<=12) return "D1"; if(n<=24) return "D2"; return "D3"; }
function getParidade(n) { if(n===0) return "—"; return n%2===0?"Par":"Ímpar"; }
function getCorAbrev(c) { return c==="Vermelho"?"VRM":c==="Preto"?"PRT":"VRD"; }
function getGP(n)       { return GP_MAP[n]||"—"; }

function getSetor(n) {
  if (n === 0) return "—";
  if (n >= 1  && n <= 6)  return "S1";
  if (n >= 7  && n <= 12) return "S2";
  if (n >= 13 && n <= 18) return "S3";
  if (n >= 19 && n <= 24) return "S4";
  if (n >= 25 && n <= 30) return "S5";
  if (n >= 31 && n <= 36) return "S6";
  return "—";
}

const REGTRACK_MAP = {
  "32-29": new Set([32,0,26,3,35,12,28,7,29]),
  "25-30": new Set([25,17,34,6,27,13,36,11,30]),
  "15-2":  new Set([15,19,4,21,2]),
  "8-24":  new Set([8,23,10,5,24]),
  "16-18": new Set([16,33,1,20,14,31,9,22,18]),
};

function getRegTrack(n) {
  for(const [key, set] of Object.entries(REGTRACK_MAP)) {
    if(set.has(n)) return key;
  }
  return "—";
}

const FRA_MAP = {
  "F1e": new Set([32,15,19,4,21,2]),
  "F2e": new Set([25,17,34,6,27,13]),
  "F3e": new Set([36,11,30,8,23,10]),
  "F1d": new Set([26,3,35,12,28,7]),
  "F2d": new Set([29,18,22,9,31,14]),
  "F3d": new Set([20,1,33,16,24,5]),
};

const FRA_CELL = {
  "F1e": {bg:"#0e3460", text:"#93c5fd"},
  "F1d": {bg:"#1e4d8c", text:"#bfdbfe"},
  "F2e": {bg:"#14532d", text:"#86efac"},
  "F2d": {bg:"#166534", text:"#bbf7d0"},
  "F3e": {bg:"#7c2d00", text:"#fb923c"},
  "F3d": {bg:"#c2410c", text:"#fed7aa"},
  "—":   {bg:"#111",   text:"#444"},
};

function getFra(n) {
  if(n===0) return "—";
  for(const [key, set] of Object.entries(FRA_MAP)){
    if(set.has(n)) return key;
  }
  return "—";
}

const OPO_MAP = {
  "ZERO": new Set([26,3,35,12,28,7,29,18,22,32,15,19,4,21,2,25,17,34]),
  "DEZ":  new Set([6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9]),
};

const OPO_CELL = {
  "ZERO": {bg:"#14532d", text:"#86efac"},
  "DEZ":  {bg:"#1e3a8a", text:"#93c5fd"},
  "—":    {bg:"#111",   text:"#444"},
};

function getOpo(n) {
  if(n===0) return "—";
  if(OPO_MAP["ZERO"].has(n)) return "ZERO";
  if(OPO_MAP["DEZ"].has(n))  return "DEZ";
  return "—";
}

function buildEntry(n, id) {
  return { id, num:n, cor:getColor(n), corAbrev:getCorAbrev(getColor(n)),
    lado:getLado(n), regiao:getRegiao(n), duzia:getDuzia(n),
    paridade:getParidade(n), gp:getGP(n), rua:getRua(n), coluna:getColuna(n), parte:getParte(n), altobaixo:getAltoBaixo(n), setor:getSetor(n), regtrack:getRegTrack(n), cavalo:getCavalo(n), fra:getFra(n), opo:getOpo(n) };
}
function parseInput(raw) {
  return raw.split(/[\s,;\n\r]+/).map(t=>parseInt(t.trim())).filter(n=>!isNaN(n)&&n>=0&&n<=36);
}

const NUM_BALL  = { Vermelho:{bg:"#CC0000",border:"#ff6666",text:"#fff"}, Preto:{bg:"#111",border:"#555",text:"#fff"}, Verde:{bg:"#1B7A3E",border:"#4ade80",text:"#fff"} };
const COR_CELL  = { "Vermelho":{bg:"#CC0000",text:"#fff"}, "Preto":{bg:"#222222",text:"#e5e5e5"}, "Verde":{bg:"#1B7A3E",text:"#fff"} };
const LADO_CELL = { "PB e VA":{bg:"#6b0f1a",text:"#ffb3bb"}, "PA e VB":{bg:"#1e3a5f",text:"#93c5fd"}, "—":{bg:"#111",text:"#444"} };
const REGIAO_CELL = { Tier:{bg:"#7c2d12",text:"#fdba74"}, Orphelins:{bg:"#854d0e",text:"#fefce8"}, Voisins:{bg:"#166534",text:"#bbf7d0"} };
const DUZIA_CELL  = { D1:{bg:"#1e3a8a",text:"#bfdbfe"}, D2:{bg:"#92400e",text:"#fde68a"}, D3:{bg:"#7f1d1d",text:"#fca5a5"}, "—":{bg:"#111",text:"#444"} };
const PAR_CELL    = { "Par":{bg:"#0f1f5c",text:"#bfdbfe"}, "Ímpar":{bg:"#4b5563",text:"#e5e7eb"}, "—":{bg:"#111",text:"#444"} };
const ALTOBAIXO_CELL = { "ALTO":{ bg:"#7c0000", text:"#fca5a5" }, "BAIXO":{ bg:"#0c4a6e", text:"#7dd3fc" }, "—":{ bg:"#111", text:"#444" } };
const SETOR_CELL = { S1:{bg:"#0c2461",text:"#ffffff"}, S2:{bg:"#7d6608",text:"#fef9c3"}, S3:{bg:"#1a6b8a",text:"#ffffff"}, S4:{bg:"#935116",text:"#fef9c3"}, S5:{bg:"#0a3d62",text:"#90caf9"}, S6:{bg:"#5d4037",text:"#ffe0b2"} };
const COL_C1_CELL = {bg:"#4a5320",text:"#d9f99d"};
const COL_C2_CELL = {bg:"#0891b2",text:"#ffffff"};
const COL_C3_CELL = {bg:"#ea580c",text:"#ffffff"};

const REGTRACK_CELL = {
  "32-29": {bg:"#0e4f6b", text:"#00e5ff"},
  "25-30": {bg:"#7c2d00", text:"#fb923c"},
  "15-2":  {bg:"#2d1b69", text:"#c4b5fd"},
  "8-24":  {bg:"#4a0020", text:"#f9a8d4"},
  "16-18": {bg:"#022c1e", text:"#34d399"},
};

const GP_CELL = {
  "d1V": { bg:"#713f00", text:"#fef08a" },
  "d2P": { bg:"#44180a", text:"#d4a574" },
  "d3P": { bg:"#7c2d12", text:"#fdba74" },
  "d1P": { bg:"#1e3a8a", text:"#bfdbfe" },
  "d2I": { bg:"#164e63", text:"#67e8f9" },
  "d3V": { bg:"#0f2044", text:"#93c5fd" },
  "—":   { bg:"#111",   text:"#444"    },
};
const PARTE_CELL = {
  "P1": { bg:"#713f00", text:"#fef08a" },
  "P2": { bg:"#14532d", text:"#bbf7d0" },
  "—":  { bg:"#111",   text:"#444"    },
};
const CAVALO_CELL = { "369":{bg:"#7c3d00",text:"#fb923c"}, "258":{bg:"#0a1628",text:"#60a5fa"}, "147":{bg:"#4c1d95",text:"#ddd6fe"}, "—":{bg:"#111",text:"#444"} };
const RUA_CELL    = { R1:{bg:"#4a0080",text:"#e9d5ff"}, R2:{bg:"#005a5a",text:"#99f6e4"}, R3:{bg:"#7a1c4b",text:"#fbcfe8"}, R4:{bg:"#1a3a1a",text:"#bbf7d0"}, "0":{bg:"#1B7A3E",text:"#fff"} };
const COLUNA_CELL = { C1:{bg:"#4a5320",text:"#e5e5e5"}, C2:{bg:"#0891b2",text:"#0a0a0a"}, C3:{bg:"#ea580c",text:"#1a1a1a"}, "0":{bg:"#1B7A3E",text:"#fff"} };
const RUA_PAR_CELL = { "R.Ímpar":{bg:"#4a0080",text:"#e9d5ff"}, "R.Par":{bg:"#005a5a",text:"#99f6e4"}, "—":{bg:"#111",text:"#444"} };
const GOLD = "#D4AF37";

const CELL_VAL = (e, key) => {
  if (key==="cor")      return e.corAbrev;
  if (key==="lado")     return e.lado;
  if (key==="duzia")    return e.gp;
  if (key==="setor")    return e.setor;
  if (key==="regtrack") return e.regtrack;
  if (key==="paridade") return (e.paridade||"—").toUpperCase();
  if (key==="coluna")   return e.coluna;
  if (key==="rua")      return e.rua;
  if (key==="regiao")   return e.regiao.toUpperCase();
  if (key==="parte")    return e.parte;
  if (key==="cavalo")   return e.cavalo;
  if (key==="altobaixo") return e.altobaixo;
  if (key==="gp")        return e.gp;
  if (key==="gp_d1")     return e.duzia==="D1" ? "D1" : "";
  if (key==="gp_d2")     return e.duzia==="D2" ? "D2" : "";
  if (key==="gp_d3")     return e.duzia==="D3" ? "D3" : "";
  if (key==="fra")       return e.fra;
  if (key==="ruaPar")    return getRuaParidade(e.num);
  if (key==="opo")       return e.opo;
  if (key==="viz")       return "";
  if (key==="vn")        return "";
  if (key==="col_c1")    return e.coluna==="C1" ? "C1" : "";
  if (key==="col_c2")    return e.coluna==="C2" ? "C2" : "";
  if (key==="col_c3")    return e.coluna==="C3" ? "C3" : "";
  return "";
};

const CELL_SCHEME = (e, key) => {
  if (key==="cor")      return COR_CELL[e.cor]         || {bg:"#111",text:"#fff"};
  if (key==="lado")     return LADO_CELL[e.lado]        || LADO_CELL["—"];
  if (key==="duzia")    return GP_CELL[e.gp]            || GP_CELL["—"];
  if (key==="setor")    return SETOR_CELL[e.setor]      || {bg:"#111",text:"#aaa"};
  if (key==="regtrack") return REGTRACK_CELL[e.regtrack] || {bg:"#111",text:"#aaa"};
  if (key==="paridade") return PAR_CELL[e.paridade||"—"]  || PAR_CELL["—"];
  if (key==="coluna")   return COLUNA_CELL[e.coluna]    || {bg:"#111",text:"#fff"};
  if (key==="rua")      return RUA_CELL[e.rua]          || {bg:"#111",text:"#fff"};
  if (key==="regiao")   return REGIAO_CELL[e.regiao]    || {bg:"#111",text:"#fff"};
  if (key==="parte")    return PARTE_CELL[e.parte||"—"]  || PARTE_CELL["—"];
  if (key==="cavalo")   return CAVALO_CELL[e.cavalo]     || CAVALO_CELL["—"];
  if (key==="altobaixo") return ALTOBAIXO_CELL[e.altobaixo||"—"] || ALTOBAIXO_CELL["—"];
  if (key==="gp")        return GP_CELL[e.gp]           || GP_CELL["—"];
  if (key==="gp_d1") return e.duzia==="D1" ? DUZIA_CELL["D1"] : {bg:"#f5f0e8",text:"#f5f0e8"};
  if (key==="gp_d2") return e.duzia==="D2" ? DUZIA_CELL["D2"] : {bg:"#f5f0e8",text:"#f5f0e8"};
  if (key==="gp_d3") return e.duzia==="D3" ? DUZIA_CELL["D3"] : {bg:"#f5f0e8",text:"#f5f0e8"};
  if (key==="fra")    return FRA_CELL[e.fra] || FRA_CELL["—"];
  if (key==="ruaPar")  return RUA_PAR_CELL[getRuaParidade(e.num)] || {bg:"#111",text:"#444"};
  if (key==="opo")    return OPO_CELL[e.opo] || OPO_CELL["—"];
  if (key==="viz")    return {bg:"#0d0d0d",text:"#fff"};
  if (key==="col_c1") return e.coluna==="C1" ? {bg:"#4a5320",text:"#e5e5e5"} : {bg:"#f5f0e8",text:"#f5f0e8"};
  if (key==="col_c2") return e.coluna==="C2" ? {bg:"#0891b2",text:"#0a0a0a"} : {bg:"#f5f0e8",text:"#f5f0e8"};
  if (key==="col_c3") return e.coluna==="C3" ? {bg:"#ea580c",text:"#1a1a1a"} : {bg:"#f5f0e8",text:"#f5f0e8"};
  if (key==="vn")     return {bg:"#0d0d0d",text:"#e5e5e5"};
  return {bg:"#111",text:"#fff"};
};

const TERMINAL_VIZ = {
  0: { nums:[0,10,20,30], viz:{0:[26,32], 10:[5,23], 20:[14,1], 30:[11,8]} },
  1: { nums:[1,11,21,31], viz:{1:[20,33], 11:[36,30], 21:[4,2], 31:[9,14]} },
  2: { nums:[2,12,22,32], viz:{2:[21,25], 12:[35,28], 22:[18,9], 32:[0,15]} },
  3: { nums:[3,13,23,33], viz:{3:[26,35], 13:[27,36], 23:[10,8], 33:[1,16]} },
  4: { nums:[4,14,24,34], viz:{4:[19,21], 14:[31,20], 24:[16,5], 34:[17,6]} },
  5: { nums:[5,15,25,35], viz:{5:[24,10], 15:[32,19], 25:[2,17], 35:[3,12]} },
  6: { nums:[6,16,26,36], viz:{6:[34,27], 16:[33,24], 26:[3,0], 36:[13,11]} },
  7: { nums:[7,17,27],    viz:{7:[28,29], 17:[25,34], 27:[6,13]} },
  8: { nums:[8,18,28],    viz:{8:[30,23], 18:[29,22], 28:[12,7]} },
  9: { nums:[9,19,29],    viz:{9:[22,31], 19:[15,4], 29:[7,18]} },
};

const NUM_TO_TERMINALS = {};
for (let i = 0; i <= 36; i++) NUM_TO_TERMINALS[i] = new Set();
Object.entries(TERMINAL_VIZ).forEach(([t, {nums, viz}]) => {
  const tNum = parseInt(t);
  nums.forEach(n => NUM_TO_TERMINALS[n].add(tNum));
  Object.values(viz).forEach(vs => vs.forEach(v => NUM_TO_TERMINALS[v].add(tNum)));
});

function analyzeTerminal(puxouList) {
  if (!puxouList || puxouList.length === 0) return null;
  const counts = {};
  puxouList.forEach(h => {
    NUM_TO_TERMINALS[h.num]?.forEach(t => { counts[t] = (counts[t]||0) + 1; });
  });
  if (Object.keys(counts).length === 0) return null;
  const best = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  const terminal = parseInt(best[0]);
  const count = parseInt(best[1]);
  const pct = count / puxouList.length;
  if (pct < 0.8) return null;
  return { terminal, count, total: puxouList.length, pct: Math.round(pct*100) };
}

const MICRO_GROUPS = {
  "C1D1": { nums:[1,4,7,10],   viz:{1:[33,20],  4:[19,21],  7:[29,28],  10:[23,5]}  },
  "C2D1": { nums:[2,5,8,11],   viz:{2:[21,25],  5:[10,24],  8:[30,23],  11:[36,30]} },
  "C3D1": { nums:[3,6,9,12],   viz:{3:[35,26],  6:[34,27],  9:[31,22],  12:[28,35]} },
  "C1D2": { nums:[13,16,19,22],viz:{13:[27,36], 16:[24,33], 19:[15,4],  22:[9,18]}  },
  "C2D2": { nums:[14,17,20,23],viz:{14:[20,31], 17:[25,34], 20:[1,14],  23:[8,10]}  },
  "C3D2": { nums:[15,18,21,24],viz:{15:[32,19], 18:[22,29], 21:[4,2],   24:[5,16]}  },
  "C1D3": { nums:[25,28,31,34],viz:{25:[2,17],  28:[7,12],  31:[14,9],  34:[17,6]}  },
  "C2D3": { nums:[26,29,32,35],viz:{26:[3,0],   29:[18,7],  32:[0,15],  35:[12,3]}  },
  "C3D3": { nums:[27,30,33,36],viz:{27:[6,13],  30:[11,8],  33:[16,1],  36:[13,11]} },
};

const NUM_TO_MICRO = {};
for (let i = 0; i <= 36; i++) NUM_TO_MICRO[i] = new Set();
Object.entries(MICRO_GROUPS).forEach(([grp, {nums, viz}]) => {
  nums.forEach(n => NUM_TO_MICRO[n].add(grp));
  Object.values(viz).forEach(vs => vs.forEach(v => NUM_TO_MICRO[v].add(grp)));
});

function analyzeMicroGroup(last6) {
  if (!last6 || last6.length === 0) return null;
  const counts = {};
  last6.forEach(n => { NUM_TO_MICRO[n]?.forEach(grp => { counts[grp] = (counts[grp]||0) + 1; }); });
  if (Object.keys(counts).length === 0) return null;
  const best = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  const pct = Math.round(best[1] / last6.length * 100);
  if (pct < 80) return null;
  return { group: best[0], count: best[1], total: last6.length, pct };
}

const RACETRACK = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
function getRaceNeighbors(n) {
  const idx = RACETRACK.indexOf(n);
  if (idx === -1) return new Set();
  const len = RACETRACK.length;
  return new Set([RACETRACK[(idx-1+len)%len], RACETRACK[(idx+1)%len]]);
}

const BINARY_FIELDS = [
  {k:"parte",    fn:e=>e.parte,    label:"PTE", vals:["P1","P2"],           pal:PARTE_CELL},
  {k:"lado",     fn:e=>e.lado,     label:"LADO",vals:["PB e VA","PA e VB"], pal:LADO_CELL},
  {k:"altobaixo",fn:e=>e.altobaixo,label:"A/B", vals:["ALTO","BAIXO"],      pal:ALTOBAIXO_CELL},
  {k:"paridade", fn:e=>e.paridade, label:"P/I",  vals:["Par","Ímpar"],       pal:PAR_CELL},
];

const MULTI_FIELDS = [
  {k:"regiao",  fn:e=>e.regiao,  label:"ZNA", pal:REGIAO_CELL},
  {k:"gp",      fn:e=>e.gp,      label:"GP",  pal:GP_CELL},
  {k:"setor",   fn:e=>e.setor,   label:"SET", pal:SETOR_CELL},
  {k:"regtrack",fn:e=>e.regtrack,label:"RGT", pal:REGTRACK_CELL},
  {k:"fra",     fn:e=>e.fra,     label:"FRA", pal:FRA_CELL},
  {k:"opo",     fn:e=>e.opo,     label:"OPO", pal:OPO_CELL},
];

const PAIR_INTERVAL_FIELDS = [
  {k:"coluna", fn:e=>e.coluna, label:"COL", pal:{C1:COL_C1_CELL,C2:COL_C2_CELL,C3:COL_C3_CELL}},
  {k:"rua",    fn:e=>e.rua,    label:"RUA", pal:RUA_CELL},
  {k:"regiao", fn:e=>e.regiao, label:"ZNA", pal:REGIAO_CELL},
  {k:"cavalo", fn:e=>e.cavalo, label:"CAV", pal:CAVALO_CELL},
];

function detectRules(entries) {
  const signals = [];
  if(entries.length < 6) return signals;
  const last20 = entries.slice(-20);
  const allFields = [...BINARY_FIELDS, ...MULTI_FIELDS];

  allFields.forEach(({k,fn,label,pal,vals}) => {
    const seq = last20.map(fn).filter(v=>v&&v!=="—");
    if(seq.length < 5) return;
    const n = seq.length;

    if(n >= 6) {
      const A = seq[n-1];
      const B = seq[n-4];
      if(
        seq[n-1]===A && seq[n-2]===A &&
        seq[n-3]===B && seq[n-4]===B && seq[n-5]===B &&
        (n<6 || seq[n-6]!==B)
      ) {
        const palEntry = pal[A] || {bg:"#222",text:"#aaa"};
        signals.push({rule:1, label, val:A, pal:palEntry, desc:"3+2 → próx "+A});
      }
    }

    if(n >= 6) {
      const a = seq[n-6]; const b = seq[n-5];
      if(n>=6 &&
        seq[n-6]===a && seq[n-5]===b && seq[n-4]===b &&
        seq[n-3]===a && seq[n-2]===b && seq[n-1]===b &&
        a !== b
      ) {
        const palEntry = pal[b] || {bg:"#222",text:"#aaa"};
        signals.push({rule:2, label, val:b, pal:palEntry, desc:"ABBA → próx "+b});
      }
      if(n>=5 &&
        seq[n-5]===seq[n-2] &&
        seq[n-4]===seq[n-3] && seq[n-4]===seq[n-1] &&
        seq[n-5]!==seq[n-4]
      ) {
        const bVal = seq[n-1];
        const palEntry = pal[bVal] || {bg:"#222",text:"#aaa"};
        signals.push({rule:2, label, val:bVal, pal:palEntry, desc:"A BB A B → próx "+bVal});
      }
    }
  });

  PAIR_INTERVAL_FIELDS.forEach(({k,fn,label,pal}) => {
    const seq = last20.map(fn).filter(v=>v&&v!=="—");
    const n = seq.length;
    if(n < 8) return;
    const pairs = [];
    for(let i=0;i<n-1;i++) { if(seq[i]===seq[i+1]) pairs.push({val:seq[i], pos:i}); }
    if(pairs.length < 2) return;
    const pairsByVal = {};
    pairs.forEach(p => { if(!pairsByVal[p.val]) pairsByVal[p.val]=[]; pairsByVal[p.val].push(p.pos); });
    Object.entries(pairsByVal).forEach(([val, positions]) => {
      if(positions.length < 2) return;
      const intervals = [];
      for(let i=1;i<positions.length;i++) { intervals.push(positions[i]-positions[i-1]); }
      const lastInterval = intervals[intervals.length-1];
      const consistent = intervals.every(iv=>Math.abs(iv-lastInterval)<=1);
      if(!consistent) return;
      const lastPairPos = positions[positions.length-1];
      const projectedPos = lastPairPos + lastInterval;
      const distanceToNext = projectedPos - (n-1);
      if(distanceToNext >= 0 && distanceToNext <= 2) {
        const palMap = typeof pal === 'object' && pal[val] ? pal[val] : (pal[val]||{bg:"#222",text:"#aaa"});
        signals.push({ rule:3, label, val, pal:palMap, desc: distanceToNext===0 ? "Par "+val+" AGORA!" : "Par "+val+" em "+distanceToNext });
      }
    });
  });

  const seen = new Set();
  return signals.filter(s => {
    const key = s.label+s.val+s.rule;
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const INIT_COLS = [
  { key:"seq",       label:"#",    toggleable:false, mode:"fixed"    },
  { key:"num",       label:"Nº",   toggleable:false, mode:"fixed"    },
  { key:"hist",      label:"PUX",  toggleable:false, mode:"fixed"    },
  { key:"viz",       label:"VIZ",  toggleable:false, mode:"fixed"    },
  { key:"fra",       label:"FRA",  toggleable:true,  mode:"priority" },
  { key:"gp_d1",     label:"D1",   toggleable:true,  mode:"priority" },
  { key:"gp_d2",     label:"D2",   toggleable:true,  mode:"priority" },
  { key:"gp_d3",     label:"D3",   toggleable:true,  mode:"priority" },
  { key:"lado",      label:"LADO", toggleable:true,  mode:"pinned"   },
  { key:"opo",       label:"OPO",  toggleable:true,  mode:"pinned"   },
  { key:"parte",     label:"PTE",  toggleable:true,  mode:"pinned"   },
  { key:"col_c1",    label:"C1",   toggleable:true,  mode:"pinned"   },
  { key:"col_c2",    label:"C2",   toggleable:true,  mode:"pinned"   },
  { key:"col_c3",    label:"C3",   toggleable:true,  mode:"pinned"   },
  { key:"cor",       label:"COR",  toggleable:true,  mode:"auto"     },
  { key:"altobaixo", label:"A/B",  toggleable:true,  mode:"auto"     },
  { key:"paridade",  label:"P/I",  toggleable:true,  mode:"auto"     },
  { key:"regiao",    label:"ZNA",  toggleable:true,  mode:"auto"     },
  { key:"cavalo",    label:"CAV",  toggleable:true,  mode:"always"   },
  { key:"regtrack",  label:"RGT",  toggleable:true,  mode:"always"   },
  { key:"setor",     label:"SET",  toggleable:true,  mode:"always"   },
  { key:"rua",       label:"RUA",  toggleable:true,  mode:"always"   },
  { key:"ruaPar",    label:"R/P",  toggleable:true,  mode:"always"   },
  { key:"duzia",     label:"GP",   toggleable:true,  mode:"always"   },
];

const AUTO_RULE_FIELDS = {
  cor:       { field:"cor",       values:["Vermelho","Preto","Verde"] },
  lado:      { field:"lado",      values:["PB e VA","PA e VB"]        },
  altobaixo: { field:"altobaixo", values:["ALTO","BAIXO"]             },
  paridade:  { field:"paridade",  values:["Par","Ímpar"]              },
  parte:     { field:"parte",     values:["P1","P2"]                  },
  gp_d1:     { field:"gp", values:["d1V","d1P"] },
  gp_d2:     { field:"gp", values:["d2I","d2P"] },
  gp_d3:     { field:"gp", values:["d3V","d3P"] },
  regiao:    { field:"regiao",    values:["Tier","Orphelins","Voisins"] },
};

function getHistorico(entries, currentIndex, num) {
  const nexts = [];
  for (let i = 0; i < currentIndex; i++) {
    if (entries[i].num === num && i + 1 < entries.length) { nexts.push(entries[i + 1]); }
  }
  return nexts.slice(-5);
}

function calcRepAltPerValue(arr, field, value) {
  let rep = 0, alt = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if ((arr[i][field]||"—") !== value) continue;
    const next = arr[i+1][field]||"—";
    if (next === value) rep++; else alt++;
  }
  const total = rep + alt;
  return { rep, alt, repPct: total>0?Math.round(rep/total*100):0, altPct: total>0?Math.round(alt/total*100):0, total };
}

const RA_FIELDS = [
  { key:"cor",      label:"Cor",       values:["Vermelho","Preto","Verde"],        palette:{"Vermelho":{bg:"#CC0000",text:"#fff"},"Preto":{bg:"#222",text:"#ddd"},"Verde":{bg:"#1B7A3E",text:"#fff"}} },
  { key:"lado",     label:"Lado",      values:["PB e VA","PA e VB"],               palette:{"PB e VA":{bg:"#6b0f1a",text:"#ffb3bb"},"PA e VB":{bg:"#1e3a5f",text:"#93c5fd"}} },
  { key:"duzia",    label:"Dúzia",     values:["D1","D2","D3"],                    palette:{"D1":{bg:"#1e3a8a",text:"#bfdbfe"},"D2":{bg:"#92400e",text:"#fde68a"},"D3":{bg:"#7f1d1d",text:"#fca5a5"}} },
  { key:"paridade", label:"Par/Ímpar", values:["Par","Ímpar"],                     palette:{"Par":{bg:"#0f1f5c",text:"#bfdbfe"},"Ímpar":{bg:"#4b5563",text:"#e5e7eb"}} },
  { key:"coluna",   label:"Coluna",    values:["C1","C2","C3"],                    palette:{"C1":{bg:"#4a5320",text:"#e5e5e5"},"C2":{bg:"#0891b2",text:"#0a0a0a"},"C3":{bg:"#ea580c",text:"#1a1a1a"}} },
  { key:"parte",    label:"Parte",     values:["P1","P2"],                         palette:{"P1":{bg:"#713f00",text:"#fef08a"},"P2":{bg:"#14532d",text:"#bbf7d0"}} },
  { key:"altobaixo",label:"Alto/Baixo",values:["ALTO","BAIXO"],                    palette:{"ALTO":{bg:"#7c0000",text:"#fca5a5"},"BAIXO":{bg:"#0c4a6e",text:"#7dd3fc"}} },
  { key:"regiao",   label:"Região",    values:["Tier","Orphelins","Voisins"],       palette:{"Tier":{bg:"#7c2d12",text:"#fdba74"},"Orphelins":{bg:"#854d0e",text:"#fefce8"},"Voisins":{bg:"#166534",text:"#bbf7d0"}} },
];

function countBy(arr, key, values) {
  const r={};
  values.forEach(v=>{ r[v]=arr.filter(e=>e[key]===v).length; });
  return r;
}

function StatBlockH({ title, data, palette }) {
  const total = Object.values(data).reduce((a,b)=>a+b,0);
  return (
    <div style={{flex:1,minWidth:80}}>
      <div style={{fontSize:7,letterSpacing:"0.15em",color:"#CC0000",fontWeight:"bold",marginBottom:4,textTransform:"uppercase"}}>{title}</div>
      {Object.entries(data).map(([k,v]) => {
        const p = palette[k]||{bg:"#222",text:"#aaa"};
        const pct = total>0?Math.round((v/total)*100):0;
        return (
          <div key={k} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
            <div style={{width:52,fontSize:8,color:p.text,textAlign:"center",background:p.bg,padding:"1px 3px",borderRadius:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:"Arial, sans-serif",fontWeight:"bold",flexShrink:0}}>{k}</div>
            <div style={{flex:1,height:10,background:"#1a1a1a",borderRadius:1,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:p.bg,transition:"width 0.4s ease",boxSizing:"border-box"}}/>
            </div>
            <div style={{width:14,fontSize:8,color:"#ccc",textAlign:"right",fontFamily:"Arial, sans-serif",flexShrink:0}}>{v}</div>
          </div>
        );
      })}
    </div>
  );
}

const SK = "destroyer-pair-v6";

const TD_STYLE = {
  padding:"0 5px", height:28, textAlign:"center", verticalAlign:"middle",
  fontSize:11, fontWeight:600, letterSpacing:"0.02em", whiteSpace:"nowrap",
  fontFamily:"Arial, sans-serif",
  borderRight:"1px solid #000", borderBottom:"1px solid #000",
};

function CatalogCell({label, scheme}){
  const s = scheme || {bg:"#111",text:"#444"};
  const empty = !label || label==="—";
  return (
    <td style={{...TD_STYLE, background:empty?"#111":s.bg, color:empty?"#333":s.text}}>
      {empty?"—":label}
    </td>
  );
}

function CatalogNumBall({n, size=24}){
  const cor = getColor(n);
  const s = NUM_BALL[cor];
  return (
    <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      width:size,height:size,borderRadius:"50%",
      background:s.bg,border:`2px solid ${s.border}`,color:s.text,flexShrink:0}}>
      <span style={{fontSize:size>22?10:9,fontWeight:"bold",lineHeight:1}}>{n}</span>
    </div>
  );
}

const CatalogTH = ({children}) => (
  <th style={{background:"#CC0000",color:"#fff",padding:"5px 6px",textAlign:"center",
    fontSize:9,fontWeight:"bold",letterSpacing:"0.07em",
    borderBottom:"2px solid #000",borderRight:"1px solid #000",
    whiteSpace:"nowrap",fontFamily:"Arial, sans-serif"}}>{children}</th>
);

function CatalogTableRow({n, rank, count, total, maxCount}){
  const cor=getColor(n), corAbrev=getCorAbrev(cor), lado=getLado(n);
  const regiao=getRegiao(n), duzia=getDuzia(n), paridade=getParidade(n);
  const cavalo=getCavalo(n);
  const gp=getGP(n), rua=getRua(n), coluna=getColuna(n);
  const parte=getParte(n), ab=getAltoBaixo(n);
  const setor=getSetor(n), regtrack=getRegTrack(n);
  const pct=total>0?(count/total*100):0;
  const isRepeat = count > 1;
  const barPct=maxCount>0?Math.round(count/maxCount*100):0;
  const gpScheme=GP_CELL[gp]||GP_CELL["—"];
  return (
    <tr>
      <td style={{...TD_STYLE,background:"#0d0d0d",color:"#444",fontSize:10}}>#{rank}</td>
      <td style={{...TD_STYLE,background:"#0d0d0d",padding:"0 4px"}}>
        <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",
          justifyContent:"center",
          background: isRepeat ? "#FFD700" : NUM_BALL[cor].bg,
          boxShadow: isRepeat ? "0 0 6px #FFD700" : "none",
          border:`2px solid ${NUM_BALL[cor].border}`,
          color: isRepeat ? "#000" : NUM_BALL[cor].text,fontSize:10,fontWeight:"bold"}}>
          {n}
        </div>
      </td>
      <td style={{...TD_STYLE,background:gp!=="—"?gpScheme.bg:"#111",color:gp!=="—"?gpScheme.text:"#333",minWidth:36}}>{gp!=="—"?gp:"—"}</td>
      <CatalogCell label={lado} scheme={LADO_CELL[lado]||LADO_CELL["—"]}/>
      <CatalogCell label={coluna==="0"?"—":coluna} scheme={COLUNA_CELL[coluna]||{bg:"#111",text:"#444"}}/>
      <CatalogCell label={parte} scheme={PARTE_CELL[parte]||PARTE_CELL["—"]}/>
      <CatalogCell label={cavalo} scheme={CAVALO_CELL[cavalo]||CAVALO_CELL["—"]}/>
      <CatalogCell label={corAbrev} scheme={COR_CELL[cor]||{bg:"#111",text:"#444"}}/>
      <CatalogCell label={ab} scheme={ALTOBAIXO_CELL[ab]||ALTOBAIXO_CELL["—"]}/>
      <CatalogCell label={paridade==="—"?"—":paridade.toUpperCase()} scheme={PAR_CELL[paridade]||PAR_CELL["—"]}/>
      <CatalogCell label={regiao.toUpperCase()} scheme={REGIAO_CELL[regiao]||{bg:"#111",text:"#fff"}}/>
      <CatalogCell label={duzia} scheme={DUZIA_CELL[duzia]||DUZIA_CELL["—"]}/>
      <CatalogCell label={rua} scheme={RUA_CELL[rua]||{bg:"#111",text:"#fff"}}/>
      <CatalogCell label={setor} scheme={SETOR_CELL[setor]||{bg:"#111",text:"#aaa"}}/>
      <CatalogCell label={regtrack} scheme={REGTRACK_CELL[regtrack]||{bg:"#111",text:"#aaa"}}/>
      <td style={{...TD_STYLE,background:"#0d0d0d",color:"#fff",fontWeight:"bold",fontSize:12}}>{count}</td>
      <td style={{...TD_STYLE,background:"#0d0d0d",color:"#888"}}>{pct.toFixed(1)}%</td>
      <td style={{...TD_STYLE,background:"#0d0d0d",minWidth:70,padding:"0 6px"}}>
        <div style={{background:"#1a1a1a",height:5,borderRadius:2}}>
          <div style={{height:5,borderRadius:2,background:"#1e3a5f",width:`${barPct}%`}}/>
        </div>
      </td>
    </tr>
  );
}

function CatalogFooterStats({ entries, terminalStats }) {
  const allNums = entries.map(e => e.num);
  const queryNum = allNums.length > 0 ? allNums[allNums.length - 1] : null;
  if (queryNum === null) return null;

  const pairs = {};
  for (let i = 0; i < allNums.length - 1; i++) {
    if (allNums[i] === queryNum) { const b = allNums[i+1]; pairs[b] = (pairs[b]||0) + 1; }
  }
  const sorted = Object.entries(pairs).map(([k,v])=>({num:parseInt(k),count:v}));

  const termTop2 = terminalStats && terminalStats.topTerminals
    ? terminalStats.topTerminals.slice(0,2).map(x=>x.t) : [];

  const lastEntry = entries[entries.length - 1];
  const lastHist = (() => {
    const hist = [];
    for (let i = 0; i < entries.length - 1; i++) {
      if (entries[i].num === lastEntry.num) hist.push(entries[i+1]);
    }
    return hist.slice(-5);
  })();
  const vizResult = lastHist.length >= 1 ? analyzeTerminal(lastHist) : null;
  const vizTerminal = vizResult ? vizResult.terminal : null;
  const terminalInTop2 = vizTerminal !== null && termTop2.includes(vizTerminal);

  const dominants = [];
  if (terminalInTop2) {
    dominants.push({ label:"TERMINAL", val:"T"+vizTerminal, pct: vizResult.pct, pal:{bg:"#1a1a00",text:"#FFD700"} });
  }

  if (sorted.length > 0) {
    const fields = [
      {label:"Cor",   key:"cor",    vals:["Vermelho","Preto","Verde"],   pal:COR_CELL},
      {label:"Lado",  key:"lado",   vals:["PB e VA","PA e VB"],          pal:LADO_CELL},
      {label:"Par",   key:"par",    vals:["Par","Ímpar"],                pal:PAR_CELL},
      {label:"Parte", key:"parte",  vals:["P1","P2"],                    pal:PARTE_CELL},
      {label:"Dúzia", key:"duzia",  vals:["D1","D2","D3"],               pal:DUZIA_CELL},
      {label:"Zona",  key:"regiao", vals:["Tier","Orphelins","Voisins"], pal:REGIAO_CELL},
      {label:"Cavalo",key:"cavalo", vals:["369","258","147"],             pal:CAVALO_CELL},
      {label:"FRA",   key:"fra",    vals:["F1e","F2e","F3e","F1d","F2d","F3d"], pal:FRA_CELL},
      {label:"OPO",   key:"opo",    vals:["ZERO","DEZ"],                        pal:OPO_CELL},
    ];
    const puxados = sorted.map(p => {
      const arr = [];
      for(let k=0;k<p.count;k++) arr.push({
        cor:getColor(p.num), lado:getLado(p.num), par:getParidade(p.num),
        parte:getParte(p.num), duzia:getDuzia(p.num), regiao:getRegiao(p.num), cavalo:getCavalo(p.num)
      });
      return arr;
    }).flat();
    const total = puxados.length;
    fields.forEach(({label,key,vals,pal}) => {
      const best = vals.map(val=>({val,cnt:puxados.filter(p=>p[key]===val).length}))
        .sort((a,b)=>b.cnt-a.cnt)[0];
      if (!best || best.cnt === 0) return;
      const pct = Math.round(best.cnt/total*100);
      if (pct >= 50) dominants.push({label,val:best.val,pct,pal:pal[best.val]||{bg:"#222",text:"#aaa"}});
    });
  }

  if (dominants.length === 0) return null;
  dominants.sort((a,b)=>b.pct-a.pct);
  const top5cards = dominants.slice(0,5);

  return (
    <div style={{borderTop:"2px solid #1e1e1e",padding:"8px 12px",background:"#080808",flexShrink:0}}>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:6}}>PROBABILIDADE</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {top5cards.map(({label,val,pct,pal}) => (
          <div key={label} style={{display:"flex",flexDirection:"column",alignItems:"center",
            background:pal.bg,borderRadius:3,padding:"3px 7px",border:"1px solid "+pal.text+"88",minWidth:40,textAlign:"center"}}>
            <span style={{fontSize:7,color:pal.text,opacity:0.7,textTransform:"uppercase",display:"block"}}>{label}</span>
            <span style={{fontSize:11,fontWeight:"bold",color:pal.text,display:"block",lineHeight:1}}>{val}</span>
            <span style={{fontSize:12,color:pal.text,fontWeight:"900",display:"block"}}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MicroGroupCard({ entries }) {
  if (!entries || entries.length < 3) return null;
  const last6 = entries.slice(-6).map(e => e.num);
  const result = analyzeMicroGroup(last6);
  if (!result) return null;
  const grpData = MICRO_GROUPS[result.group];
  const col = result.group.substring(0,2);
  const duz = result.group.substring(2);
  const colScheme = COLUNA_CELL[col] || {bg:"#111",text:"#aaa"};
  const duzScheme = DUZIA_CELL[duz]  || {bg:"#111",text:"#aaa"};
  return (
    <div style={{borderTop:"2px solid #1e1e1e",padding:"8px 12px",background:"#0a0a0a",flexShrink:0}}>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:6}}>micro grupo ativo</div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:2}}>
          <span style={{fontSize:12,fontWeight:"bold",color:colScheme.text,background:colScheme.bg,padding:"2px 7px",borderRadius:3}}>{col}</span>
          <span style={{fontSize:12,fontWeight:"bold",color:duzScheme.text,background:duzScheme.bg,padding:"2px 7px",borderRadius:3}}>{duz}</span>
        </div>
        <span style={{fontSize:11,fontWeight:"bold",color:"#FFD700"}}>{result.pct}%</span>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {grpData.nums.map(n => {
            const c = getColor(n);
            return (
              <div key={n} style={{width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:NUM_BALL[c].bg,border:"1px solid "+NUM_BALL[c].border,color:"#fff",fontSize:8,fontWeight:"bold",flexShrink:0}}>{n}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ROULETTE ANALYZER ENGINE (fiel ao original) ──────────────────────────────
const RA_WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RA_NBR={};
RA_WHEEL.forEach(function(n,i){ RA_NBR[n]=[RA_WHEEL[(i-1+37)%37],RA_WHEEL[(i+1)%37]]; });
const RA_OPP={};
RA_WHEEL.forEach(function(n,i){ RA_OPP[n]=RA_WHEEL[(i+18)%37]; });
const RA_REGIONS={
  "2/3":{n:[2,11,20,14,21,25,30,36],c:"#a855f7"},
  "6/5":{n:[6,15,24,33,16,27,32],c:"#ef4444"},
  "7/6":{n:[7,18,25,34,6,17,28,29],c:"#f97316"},
  "8/3":{n:[8,26,35,0,3,12,30],c:"#eab308"},
  "9/4":{n:[9,18,27,36,13,31,22,29],c:"#22c55e"},
  "5"  :{n:[5,10,23,14,16,27,32],c:"#f59e0b"},
};
const RA_DEPS=[
  {reg:"6/5",trig:[16],pick:[19]},
  {reg:"7/6",trig:[18,19,29,16,4],pick:[27]},
  {reg:"8/3",trig:[20,27],pick:[17,25]},
  {reg:"8/3",trig:null,pick:[28],strongReg:"8/3"},
  {reg:"9/4",trig:[9,19],pick:[4]},
];
const RA_HIDDEN={1:[13],2:[18],3:[30,8],4:[7],5:[8],6:[14],7:[4],8:[5],9:[17]};
const RA_CONF={1:[7,5,4,3,9,6,8,2],2:[5,7,3,9,4,6,8],3:[3,8],4:[7],5:[8],6:[3,8,7],7:[4],8:[5],9:[5,3,7,6,8]};
const RA_RED_SET=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const RA_BLK_SET=new Set([2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]);

function raIsIn(arr,n){ return arr.indexOf(n)>=0; }
function raDigR(n){
  if(n===0) return [];
  const s=String(n);
  if(s.length===1) return [n];
  const a=parseInt(s[0]),b=parseInt(s[1]);
  const r=[];
  const soma=a+b, sub=Math.abs(a-b);
  if(soma>=1&&soma<=36) r.push(soma);
  if(sub>=1&&sub<=36&&sub!==soma) r.push(sub);
  return r;
}
function raCalcScores(l14){
  const sc={};
  Object.keys(RA_REGIONS).forEach(k=>{sc[k]=0;});
  l14.forEach((n,i)=>{
    const w=(i>=12&&i<14)?2:1;
    Object.keys(RA_REGIONS).forEach(k=>{ if(raIsIn(RA_REGIONS[k].n,n)) sc[k]+=w; });
  });
  return sc;
}
function raFullAnalyse(l14){
  let reds=0,blacks=0,greens=0;
  l14.forEach(n=>{ if(RA_RED_SET.has(n)) reds++; else if(n===0) greens++; else blacks++; });
  const cols=[{l:"Vermelho",v:reds,c:"#cc0000"},{l:"Preto",v:blacks,c:"#888888"},{l:"Verde",v:greens,c:"#22c55e"}];
  let dom=cols[0]; cols.forEach(x=>{if(x.v>dom.v)dom=x;});
  let mn=cols[0];  cols.forEach(x=>{if(x.v<mn.v)mn=x;});
  let cnums=[];
  if(dom.l==="Vermelho") cnums=[...RA_RED_SET].filter(n=>!raIsIn(l14,n));
  else if(dom.l==="Preto") cnums=[...RA_BLK_SET].filter(n=>!raIsIn(l14,n));
  // Dígitos
  const dc={};for(let i=0;i<=36;i++)dc[i]=0;
  l14.forEach(n=>{ raDigR(n).forEach(r=>{dc[r]++;}); });
  const tdn=Object.keys(dc).filter(k=>dc[k]>0).sort((a,b)=>dc[b]-dc[a]).slice(0,7).map(k=>({n:parseInt(k),v:dc[k]}));
  // Cor mínima → vizinhos → dígitos
  const minColorNums=l14.filter(n=>{
    if(mn.l==="Vermelho") return RA_RED_SET.has(n);
    if(mn.l==="Preto") return RA_BLK_SET.has(n);
    return n===0;
  });
  const nbrSet={};
  minColorNums.forEach(n=>{ (RA_NBR[n]||[]).forEach(nb=>{nbrSet[nb]=true;}); });
  const nbrList=Object.keys(nbrSet).map(Number);
  const ndc={};for(let j=0;j<=36;j++)ndc[j]=0;
  nbrList.forEach(n=>{ raDigR(n).forEach(r=>{ndc[r]++;}); });
  const topVO=Object.keys(ndc).filter(k=>ndc[k]>0).sort((a,b)=>ndc[b]-ndc[a]).slice(0,5).map(k=>({n:parseInt(k),v:ndc[k]}));
  // Alvo ouro
  const allDigCount={};for(let di=0;di<=11;di++)allDigCount[di]=0;
  l14.forEach(n=>{ raDigR(n).forEach(r=>{if(r>=1&&r<=36)allDigCount[r]++;}); });
  let topDig=0,topDigVal=0;
  for(let d=1;d<=9;d++){if(allDigCount[d]>topDigVal){topDigVal=allDigCount[d];topDig=d;}}
  const numsProduzem=[];
  for(let n2=1;n2<=36;n2++){if(raIsIn(raDigR(n2),topDig))numsProduzem.push(n2);}
  const scReg={};Object.keys(RA_REGIONS).forEach(k=>{scReg[k]=0;});
  l14.forEach((n,i)=>{const w=(i>=12&&i<14)?2:1;Object.keys(RA_REGIONS).forEach(k=>{if(raIsIn(RA_REGIONS[k].n,n))scReg[k]+=w;});});
  const regRanked=Object.keys(scReg).sort((a,b)=>scReg[b]-scReg[a]);
  let goldN=null,goldReg=null,goldCandidates=[];
  regRanked.forEach(rk=>{
    if(scReg[rk]===0) return;
    const matches=RA_REGIONS[rk].n.filter(n=>raIsIn(numsProduzem,n)&&!raIsIn(l14,n));
    matches.forEach(m=>{if(!goldCandidates.find(x=>x.n===m))goldCandidates.push({n:m,reg:rk,regScore:scReg[rk]});});
    if(goldN===null&&matches.length>0){goldN=matches[0];goldReg=rk;}
  });
  if(goldN===null&&regRanked.length>0){
    const rk0=regRanked[0];
    if(scReg[rk0]>0){const m2=RA_REGIONS[rk0].n.filter(n=>raIsIn(numsProduzem,n));if(m2.length>0){goldN=m2[0];goldReg=rk0;}}
  }
  const ocultosFrente=[];
  l14.forEach(n=>{
    if(n>=1&&n<=9&&RA_HIDDEN[n]){
      RA_HIDDEN[n].forEach(h=>{if(!raIsIn(l14,h)&&!raIsIn(ocultosFrente,h))ocultosFrente.push(h);});
    }
  });
  const confNums=[];
  l14.forEach(n=>{
    if(n>=1&&n<=9&&RA_CONF[n]){
      RA_CONF[n].forEach(c=>{if(!raIsIn(l14,c)&&!raIsIn(confNums,c))confNums.push(c);});
    }
  });
  let d1=0,d2=0,d3=0;
  l14.forEach(n=>{if(n>=1&&n<=12)d1++;else if(n>=13&&n<=24)d2++;else if(n>=25&&n<=36)d3++;});
  const topDuz=d1>=d2&&d1>=d3?[1,12]:d2>=d1&&d2>=d3?[13,24]:[25,36];
  const duzNums=cnums.filter(n=>n>=topDuz[0]&&n<=topDuz[1]).slice(0,4);
  return {reds,blacks,greens,dom,mn,cnums,tdn,minColorNums,nbrList,topVO,goldN,goldDig:topDig,goldReg,goldDigVal:topDigVal,goldCandidates,ocultosFrente,confNums,duzNums};
}

function raScoreAll(entries){
  if(!entries||entries.length<7) return [];
  const l14=entries.slice(-14).map(e=>e.num);
  const sc=raCalcScores(l14);
  let maxSc=0;Object.keys(sc).forEach(k=>{if(sc[k]>maxSc)maxSc=sc[k];});
  const ranked=Object.keys(sc).sort((a,b)=>sc[b]-sc[a]);
  const strongReg=maxSc>0?ranked[0]:null;
  if(!strongReg) return [];
  const an=raFullAnalyse(l14);
  const rc=RA_REGIONS[strongReg].c;
  const rn=RA_REGIONS[strongReg].n;
  const S={};
  const add=(n,pts,src,clr)=>{
    if(n<0||n>36) return;
    if(!S[n])S[n]={n,pts:0,srcs:[],clr:clr||"#888"};
    S[n].pts+=pts;
    if(!raIsIn(S[n].srcs,src))S[n].srcs.push(src);
    if(clr)S[n].clr=clr;
  };
  // REG
  rn.forEach(n=>{if(!raIsIn(l14,n)){const gap=l14.indexOf(n)<0?50:l14.indexOf(n);add(n,3+Math.min(gap,12),"REG",rc);}});
  // COR
  an.cnums.slice(0,10).forEach(n=>add(n,2,"COR",an.dom.c));
  // DIG
  an.tdn.forEach(x=>add(x.n,x.v*2,"DIG","#a78bfa"));
  // VIZ
  an.topVO.forEach(x=>add(x.n,x.v*2,"VIZ","#60a5fa"));
  // OURO
  if(an.goldN!==null)add(an.goldN,12,"OURO","#fbbf24");
  if(an.goldCandidates)an.goldCandidates.slice(1,3).forEach(c=>add(c.n,6,"OURO","#fbbf24"));
  // CONF
  an.confNums.slice(0,8).forEach(n=>add(n,4,"CONF","#34d399"));
  // DUZ
  an.duzNums.forEach(n=>add(n,2,"DUZ",an.dom.c));
  // DEP
  RA_DEPS.forEach(d=>{
    const active=d.strongReg?(strongReg===d.strongReg&&maxSc>0):l14.some(n=>raIsIn(d.trig||[],n));
    if(active)d.pick.forEach(p=>add(p,6,"DEP",RA_REGIONS[d.reg].c));
  });
  // OBS
  if(strongReg==="6/5")add(1,4,"OBS","#f97316");
  // OPP
  l14.slice(0,2).forEach(n=>{const op=RA_OPP[n];if(op!==undefined&&!raIsIn(l14.slice(0,2),op))add(op,4,"OPP","#a78bfa");});
  // CICLO
  l14.slice(7,10).forEach(n=>{if(!raIsIn(l14.slice(0,7),n))add(n,5,"CICLO","#34d399");});
  // OCT/HIDDEN
  an.ocultosFrente.forEach(h=>add(h,7,"OCT","#fbbf24"));
  Object.values(S).filter(x=>x.n>=1&&x.n<=9&&x.pts>=6).forEach(x=>{
    (RA_HIDDEN[x.n]||[]).forEach(h=>{if(!raIsIn(l14,h))add(h,Math.round(x.pts*0.5),"OCT","#fbbf24");});
  });
  an.tdn.slice(0,3).forEach(x=>{
    if(x.n>=1&&x.n<=9)(RA_HIDDEN[x.n]||[]).forEach(h=>{if(!raIsIn(l14,h))add(h,x.v,"OCT","#fbbf24");});
  });
  // Recency penalty
  l14.slice(0,2).forEach(n=>{if(S[n])S[n].pts=Math.round(S[n].pts*0.3);});
  // Bonus multi-fonte
  const bonusTable=[0,0,4,10,18,28,40];
  return Object.values(S).map(x=>{
    const b=bonusTable[Math.min(x.srcs.length,6)];
    x.finalScore=x.pts+b; return x;
  }).filter(x=>x.srcs.length>=2||x.pts>=12)
    .sort((a,b)=>b.finalScore-a.finalScore)
    .slice(0,8)
    .map(x=>({
      n:x.n,
      pts:Math.round(x.finalScore),
      tier:x.srcs.length>=4||x.finalScore>=35?"A":x.srcs.length>=3||x.finalScore>=20?"B":"C",
      sources:x.srcs,
      clr:x.clr,
    }));
}
// ── FIM ROULETTE ANALYZER ENGINE ─────────────────────────────────────────────

function TerminalPullAnalysis({ entries }) {
  if(!entries || entries.length < 10) return null;

  // For each terminal T0-T9, find last 3 exact occurrences and check what terminal followed
  const TERMINAL_MEMBERS = {
    0:[0,10,20,30], 1:[1,11,21,31], 2:[2,12,22,32], 3:[3,13,23,33],
    4:[4,14,24,34], 5:[5,15,25,35], 6:[6,16,26,36], 7:[7,17,27],
    8:[8,18,28], 9:[9,19,29]
  };

  const getTerminal = (n) => {
    for(const [t, members] of Object.entries(TERMINAL_MEMBERS)){
      if(members.includes(n)) return parseInt(t);
    }
    return null;
  };

  const results = [];

  for(let t=0; t<=9; t++){
    const members = TERMINAL_MEMBERS[t];
    // Find last 3 exact occurrences of this terminal (not neighbors)
    const occurrences = [];
    for(let i=entries.length-1; i>=0 && occurrences.length<3; i--){
      if(members.includes(entries[i].num) && i+1 < entries.length){
        const nextNum = entries[i+1]?.num;
        if(nextNum !== undefined){
          const nextT = getTerminal(nextNum);
          if(nextT !== null) occurrences.push({ num: entries[i].num, nextNum, nextT });
        }
      }
    }
    if(occurrences.length < 2) continue;

    // Check consistency — which terminal was pulled most
    const tCnt = {};
    occurrences.forEach(o=>{ tCnt[o.nextT]=(tCnt[o.nextT]||0)+1; });
    const best = Object.entries(tCnt).sort((a,b)=>b[1]-a[1])[0];
    if(!best) continue;
    const [bestT, cnt] = best;

    // Only show if at least 2/3 consistent
    if(cnt < 2) continue;

    results.push({
      srcT: t,
      dstT: parseInt(bestT),
      cnt,
      total: occurrences.length,
      occurrences,
    });
  }

  if(results.length === 0) return null;

  const tColors = ["#a855f7","#ef4444","#f97316","#eab308","#22c55e","#f59e0b","#60a5fa","#34d399","#f472b6","#818cf8"];

  return (
    <div style={{borderTop:"2px solid #1e1e1e",padding:"8px 12px",background:"#080808",flexShrink:0}}>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:8}}>TERMINAL PUXA TERMINAL</div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {results.map(({srcT,dstT,cnt,total,occurrences})=>{
          const srcC = tColors[srcT];
          const dstC = tColors[dstT];
          const pct = Math.round(cnt/total*100);
          return (
            <div key={srcT} style={{display:"flex",alignItems:"center",gap:6,
              background:"#0a0a0a",border:"1px solid #222",borderRadius:4,padding:"4px 8px"}}>
              {/* Source terminal */}
              <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",
                justifyContent:"center",background:srcC+"22",border:"2px solid "+srcC,
                color:srcC,fontSize:10,fontWeight:"bold",flexShrink:0}}>T{srcT}</div>
              {/* Arrow */}
              <span style={{fontSize:12,color:"#444"}}>→</span>
              {/* Dest terminal */}
              <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",
                justifyContent:"center",background:dstC+"22",border:"2px solid "+dstC,
                color:dstC,fontSize:10,fontWeight:"bold",flexShrink:0}}>T{dstT}</div>
              {/* Stats */}
              <span style={{fontSize:9,color:"#FFD700",fontWeight:"bold"}}>{cnt}/{total}</span>
              {/* Mini bar */}
              <div style={{flex:1,height:5,background:"#1a1a1a",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:pct+"%",background:pct===100?"#FFD700":dstC}}/>
              </div>
              <span style={{fontSize:8,color:"#555"}}>{pct}%</span>
              {/* Last occurrences mini */}
              <div style={{display:"flex",gap:2}}>
                {occurrences.map((o,idx)=>{
                  const match = o.nextT===dstT;
                  return (
                    <div key={idx} style={{width:14,height:14,borderRadius:"50%",
                      background:match?dstC+"44":"#111",
                      border:"1px solid "+(match?dstC:"#333"),
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:7,color:match?dstC:"#444"}}>{o.nextNum}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuadrantSignal({ entries }) {
  if(!entries || entries.length < 14) return null;
  const last5 = entries.slice(-5);
  const last14 = entries.slice(-14);

  const dominant = (arr, key) => {
    const cnt = {};
    arr.forEach(e=>{ if(e[key]&&e[key]!=="—") cnt[e[key]]=(cnt[e[key]]||0)+1; });
    const vals = arr.map(e=>e[key]);
    return Object.entries(cnt).sort((a,b)=>{
      if(b[1]!==a[1]) return b[1]-a[1];
      return vals.lastIndexOf(b[0]) - vals.lastIndexOf(a[0]);
    })[0] || null;
  };

  // 2 strongest columns in last 5
  const colCnt = {};
  last5.forEach(e=>{ if(e.coluna&&e.coluna!=="0"&&e.coluna!=="—") colCnt[e.coluna]=(colCnt[e.coluna]||0)+1; });
  const colVals = last5.map(e=>e.coluna);
  const top2cols = Object.entries(colCnt).sort((a,b)=>{
    if(b[1]!==a[1]) return b[1]-a[1];
    return colVals.lastIndexOf(b[0]) - colVals.lastIndexOf(a[0]);
  }).slice(0,2).map(([c])=>c);
  if(top2cols.length===0) return null;

  // Strongest parte in last 5
  const bestParte = dominant(last5, 'parte');
  if(!bestParte) return null;

  // Strongest duzia in last 14 AND last 5 — must match
  const duz14 = dominant(last14, 'duzia');
  const duz5 = dominant(last5, 'duzia');
  if(!duz14 || !duz5 || duz14[0] !== duz5[0]) return null;
  const duz = duz14[0];

  // Build target numbers: must be in top2cols + match parte + match duzia
  const targets = [];
  for(let n=1;n<=36;n++){
    if(!top2cols.includes(getColuna(n))) continue;
    if(getParte(n) !== bestParte[0]) continue;
    if(getDuzia(n) !== duz) continue;
    targets.push(n);
  }
  if(targets.length===0) return null;

  const parteSch = PARTE_CELL[bestParte[0]] || {bg:"#111",text:"#aaa"};
  const duzSch = DUZIA_CELL[duz] || {bg:"#111",text:"#aaa"};

  return (
    <div style={{borderTop:"2px solid #1e1e1e",padding:"8px 12px",background:"#080808",flexShrink:0}}>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:6}}>QUADRANTE</div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:6}}>
        {top2cols.map(c=>{
          const sch = c==="C1"?COL_C1_CELL:c==="C2"?COL_C2_CELL:COL_C3_CELL;
          return <span key={c} style={{fontSize:9,fontWeight:"bold",color:sch.text,background:sch.bg,padding:"2px 6px",borderRadius:2}}>{c}</span>;
        })}
        <span style={{fontSize:9,fontWeight:"bold",color:parteSch.text,background:parteSch.bg,padding:"2px 6px",borderRadius:2}}>{bestParte[0]}</span>
        <span style={{fontSize:9,fontWeight:"bold",color:duzSch.text,background:duzSch.bg,padding:"2px 6px",borderRadius:2}}>{duz}</span>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:7,color:"#FFD700",fontWeight:"bold",flexShrink:0}}>▶</span>
        {targets.map(n=>{
          const cor=getColor(n); const s=NUM_BALL[cor];
          return (
            <div key={n} style={{width:26,height:26,borderRadius:"50%",display:"flex",
              alignItems:"center",justifyContent:"center",
              background:s.bg,border:"2px solid #FFD700",
              color:s.text,fontSize:11,fontWeight:"bold",flexShrink:0}}>
              {n}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TargetNumbers({ entries }) {
  if(!entries || entries.length < 5) return null;
  const last5 = entries.slice(-5);

  // Dominant field in last 5 — tie-break by most recent
  const dominant = (arr, key) => {
    const cnt = {};
    arr.forEach(e=>{ if(e[key]&&e[key]!=="—") cnt[e[key]]=(cnt[e[key]]||0)+1; });
    const vals = arr.map(e=>e[key]);
    return Object.entries(cnt).sort((a,b)=>{
      if(b[1]!==a[1]) return b[1]-a[1];
      return vals.lastIndexOf(b[0]) - vals.lastIndexOf(a[0]);
    })[0] || null;
  };

  const bestDuz   = dominant(last5, 'duzia');
  const bestLado  = dominant(last5, 'lado');
  const bestParte = dominant(last5, 'parte');
  if(!bestDuz || !bestLado || !bestParte) return null;

  // Analyzer engine signal
  const analyzerNums = useMemo ? useMemo(()=>raScoreAll(entries),[entries]) : raScoreAll(entries);
  const analyzerSet = new Set(analyzerNums.map(x=>x.n));

  const [duz, duzQty] = bestDuz;
  const [lado, ladoQty] = bestLado;
  const [parte, parteQty] = bestParte;

  // Find numbers matching all 3
  const targets = [];
  for(let n=1;n<=36;n++){
    if(getDuzia(n)===duz && getLado(n)===lado && getParte(n)===parte) targets.push(n);
  }
  if(targets.length===0) return null;

  // 2 strongest columns in last 5 — tie-break by recency
  const colDom = dominant(last5, 'coluna');
  const colCnt = {};
  last5.forEach(e=>{ if(e.coluna&&e.coluna!=="0"&&e.coluna!=="—") colCnt[e.coluna]=(colCnt[e.coluna]||0)+1; });
  const colVals = last5.map(e=>e.coluna);
  const top2cols = Object.entries(colCnt).sort((a,b)=>{
    if(b[1]!==a[1]) return b[1]-a[1];
    return colVals.lastIndexOf(b[0]) - colVals.lastIndexOf(a[0]);
  }).slice(0,2).map(([c])=>c);

  const duzSch = DUZIA_CELL[duz]||{bg:"#111",text:"#aaa"};
  const ladoSch = LADO_CELL[lado]||{bg:"#111",text:"#aaa"};
  const parteSch = PARTE_CELL[parte]||{bg:"#111",text:"#aaa"};

  return (
    <div style={{borderTop:"2px solid #1e1e1e",padding:"8px 12px",background:"#080808",flexShrink:0}}>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:6}}>ALVOS ULT 5</div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:6}}>
        <span style={{fontSize:9,fontWeight:"bold",color:duzSch.text,background:duzSch.bg,padding:"2px 6px",borderRadius:2}}>{duz} {duzQty}/5</span>
        <span style={{fontSize:9,fontWeight:"bold",color:ladoSch.text,background:ladoSch.bg,padding:"2px 6px",borderRadius:2}}>{lado} {ladoQty}/5</span>
        <span style={{fontSize:9,fontWeight:"bold",color:parteSch.text,background:parteSch.bg,padding:"2px 6px",borderRadius:2}}>{parte} {parteQty}/5</span>
      </div>
      {top2cols.length > 0 && (
        <div style={{display:"flex",gap:3,marginBottom:6,alignItems:"center"}}>
          <span style={{fontSize:7,color:"#888",flexShrink:0}}>cols:</span>
          {top2cols.map(c=>{
            const sch = c==="C1"?COL_C1_CELL:c==="C2"?COL_C2_CELL:COL_C3_CELL;
            return <span key={c} style={{fontSize:9,fontWeight:"bold",color:sch.text,background:sch.bg,padding:"2px 6px",borderRadius:2}}>{c}</span>;
          })}
        </div>
      )}
      <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:7,color:"#FFD700",fontWeight:"bold",flexShrink:0}}>▶</span>
        {targets.map(n=>{
          const cor=getColor(n); const s=NUM_BALL[cor];
          const inTop2Col = top2cols.includes(getColuna(n));
          const fusion = analyzerSet.has(n);
          const analyzerEntry = analyzerNums.find(x=>x.n===n);
          return (
            <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
              <div style={{
                width: fusion ? 32 : inTop2Col ? 30 : 24,
                height: fusion ? 32 : inTop2Col ? 30 : 24,
                borderRadius:"50%",display:"flex",
                alignItems:"center",justifyContent:"center",
                background: fusion ? s.bg : s.bg,
                border: fusion ? "3px solid #FFD700" : inTop2Col ? "3px solid #00e5ff" : "1px solid "+s.border,
                boxShadow: fusion ? "0 0 12px #FFD700" : inTop2Col ? "0 0 8px #00e5ff" : "none",
                color:s.text,
                fontSize: fusion ? 13 : inTop2Col ? 12 : 10,
                fontWeight:"bold",flexShrink:0}}>
                {n}
              </div>
              {fusion && <span style={{fontSize:6,color:"#FFD700",fontWeight:"bold"}}>⚡</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PairCatalog({ sharedEntries }) {
  const [catalog, setCatalog] = useState({});
  const [totalSeq, setTotalSeq] = useState(0);
  const [totalNum, setTotalNum] = useState(0);
  const [status, setStatus] = useState("AGUARDANDO");
  const [resetConfirm, setResetConfirm] = useState(false);

  useState(() => {
    (async () => {
      try {
        const r = await window.storage.get(SK);
        if (r?.value) {
          const d = JSON.parse(r.value);
          setCatalog(d.catalog||{});
          setTotalSeq(d.totalSeq||0);
          setTotalNum(d.totalNum||0);
        }
      } catch(e) {}
    })();
  });

  async function save(cat, ts, tn) {
    setStatus("SALVANDO...");
    try {
      await window.storage.set(SK, JSON.stringify({catalog:cat, totalSeq:ts, totalNum:tn}));
      setStatus("SINCRONIZADO ✓");
    } catch { setStatus("ERRO"); }
    setTimeout(()=>setStatus("AGUARDANDO"), 2000);
  }

  const allNums = sharedEntries.map(e => e.num);
  const liveQ = allNums.length > 0 ? allNums[allNums.length - 1] : null;

  const liveCatalog = {};
  for (let i = 0; i < allNums.length - 1; i++) {
    const a = allNums[i], b = allNums[i+1];
    if (!liveCatalog[a]) liveCatalog[a] = {};
    liveCatalog[a][b] = (liveCatalog[a][b]||0) + 1;
  }

  const mergedCatalog = {...catalog};
  Object.entries(liveCatalog).forEach(([a, bMap]) => {
    Object.entries(bMap).forEach(([b, cnt]) => {
      if (!mergedCatalog[a]) mergedCatalog[a] = {};
      const existing = mergedCatalog[a][b];
      if (!existing) mergedCatalog[a][b] = {count: cnt, firstIdx: 0};
      else if (typeof existing === "number") mergedCatalog[a][b] = {count: existing + cnt, firstIdx: 0};
      else mergedCatalog[a][b] = {...existing, count: existing.count + cnt};
    });
  });

  const queryNum = liveQ;
  const pairs = queryNum !== null ? (mergedCatalog[queryNum]||{}) : {};
  const sorted = Object.entries(pairs).map(([k,v]) => {
    const count = typeof v === "number" ? v : v.count;
    const firstIdx = typeof v === "number" ? Infinity : v.firstIdx;
    return {num:parseInt(k), count, firstIdx};
  }).sort((a,b) => b.count !== a.count ? b.count-a.count : a.firstIdx-b.firstIdx);
  const pTotal = sorted.reduce((s,x) => s+x.count, 0);
  const pMax   = sorted.length ? sorted[0].count : 1;

  return (
    <div style={{padding:"12px 16px",background:"#0d0d0d",display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      {queryNum !== null && (
        <div style={{marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:9,color:"#555"}}>Consultando:</span>
            <CatalogNumBall n={queryNum} size={28}/>
            <span style={{fontSize:10,color:"#888"}}>{pTotal} apariç.</span>
          </div>
        </div>
      )}
      {queryNum !== null ? (
        sorted.length === 0 ? (
          <div style={{textAlign:"center",color:"#333",padding:24,fontSize:11,letterSpacing:"0.1em",border:"1px solid #1a1a1a",borderRadius:2,fontFamily:"Arial, sans-serif"}}>
            NENHUM DADO AINDA PARA O NÚMERO {queryNum}
          </div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",fontSize:11,width:"100%",borderLeft:"1px solid #000",borderTop:"1px solid #000"}}>
              <thead>
                <tr>
                  <CatalogTH>RNK</CatalogTH><CatalogTH>NÚM</CatalogTH>
                  <CatalogTH>GP</CatalogTH><CatalogTH>LADO</CatalogTH><CatalogTH>COL</CatalogTH>
                  <CatalogTH>PARTE</CatalogTH><CatalogTH>CAVALO</CatalogTH><CatalogTH>COR</CatalogTH>
                  <CatalogTH>A/B</CatalogTH><CatalogTH>PAR/ÍMP</CatalogTH><CatalogTH>ZONA</CatalogTH>
                  <CatalogTH>DÚZIA</CatalogTH><CatalogTH>RUA</CatalogTH>
                  <CatalogTH>SET</CatalogTH><CatalogTH>RGT</CatalogTH>
                  <CatalogTH>VEZES</CatalogTH><CatalogTH>%</CatalogTH><CatalogTH>FREQ</CatalogTH>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p,i) => (
                  <CatalogTableRow key={p.num} n={p.num} rank={i+1} count={p.count} total={pTotal} maxCount={pMax}/>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div style={{textAlign:"center",color:"#222",padding:32,fontSize:11,letterSpacing:"0.15em",border:"1px solid #1a1a1a",borderRadius:2,fontFamily:"Arial, sans-serif"}}>
          AGUARDANDO NÚMEROS DA TABELA PRINCIPAL
        </div>
      )}
    </div>
  );
}

function SignalsPanel({ entries, terminalStats }) {
  if (entries.length === 0) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>
      <span style={{fontSize:9,color:"#333",textTransform:"uppercase",letterSpacing:"0.1em",writingMode:"vertical-rl"}}>SINAIS</span>
    </div>
  );

  const lastEntry = entries[entries.length - 1];
  const puxadoHist = getHistorico(entries, entries.length - 1, lastEntry.num);

  const NFIELD = {
    cor:n=>getColor(n), lado:n=>getLado(n), altobaixo:n=>getAltoBaixo(n),
    paridade:n=>getParidade(n), parte:n=>getParte(n), cavalo:n=>getCavalo(n),
    regiao:n=>getRegiao(n), duzia:n=>getDuzia(n), coluna:n=>getColuna(n),
    ruaPar:n=>getRuaParidade(n),
  };

  const probDomVals = {};
  if (puxadoHist.length > 0) {
    const total = puxadoHist.length;
    const fieldChecks = [
      {k:"cor",fn:e=>e.cor},{k:"lado",fn:e=>e.lado},{k:"altobaixo",fn:e=>e.altobaixo},
      {k:"paridade",fn:e=>e.paridade},{k:"parte",fn:e=>e.parte},{k:"cavalo",fn:e=>e.cavalo},
      {k:"regiao",fn:e=>e.regiao},{k:"duzia",fn:e=>e.duzia},{k:"ruaPar",fn:e=>getRuaParidade(e.num)},
    ];
    fieldChecks.forEach(({k,fn}) => {
      const cnt = {};
      puxadoHist.forEach(e => { const v=fn(e); if(v&&v!=="—") cnt[v]=(cnt[v]||0)+1; });
      const best = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
      if (best && best[1]/total >= 0.70) probDomVals[k] = best[0];
    });
  }

  const probKeys = Object.keys(probDomVals);
  let step1 = [];
  for (let n = 0; n <= 36; n++) {
    if (probKeys.length === 0) break;
    if (probKeys.every(k => NFIELD[k] && NFIELD[k](n) === probDomVals[k])) step1.push(n);
  }

  const last5 = entries.slice(-5);
  const repDomVals = {};
  if (last5.length > 0) {
    const total5 = last5.length;
    const fieldChecks5 = [
      {k:"cor",fn:e=>e.cor},{k:"lado",fn:e=>e.lado},{k:"altobaixo",fn:e=>e.altobaixo},
      {k:"paridade",fn:e=>e.paridade},{k:"parte",fn:e=>e.parte},{k:"cavalo",fn:e=>e.cavalo},
      {k:"regiao",fn:e=>e.regiao},{k:"duzia",fn:e=>e.duzia},{k:"coluna",fn:e=>e.coluna},
      {k:"ruaPar",fn:e=>getRuaParidade(e.num)},{k:"setor",fn:e=>getSetor(e.num)},{k:"regtrack",fn:e=>getRegTrack(e.num)},
    ];
    fieldChecks5.forEach(({k,fn}) => {
      const cnt = {};
      last5.forEach(e => { const v=fn(e); if(v&&v!=="—") cnt[v]=(cnt[v]||0)+1; });
      const best = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
      if (best && best[1]/total5 >= 0.80) repDomVals[k] = best[0];
    });
  }
  const repKeys = Object.keys(repDomVals);
  const step2 = repKeys.length > 0
    ? step1.filter(n => repKeys.every(k => NFIELD[k] && NFIELD[k](n) === repDomVals[k]))
    : step1;

  const vizResult = puxadoHist.length >= 1 ? analyzeTerminal(puxadoHist) : null;
  const vizTerminal = vizResult ? vizResult.terminal : null;
  const termTop2 = terminalStats?.topTerminals?.slice(0,2).map(x=>x.t) || [];
  const terminalActive = vizTerminal !== null && termTop2.includes(vizTerminal);

  const candidates = step2.map(n => ({
    n,
    inTerminal: terminalActive && vizTerminal !== null && !!NUM_TO_TERMINALS[n]?.has(vizTerminal)
  }));

  if (candidates.length === 0) return (
    <div style={{padding:8,textAlign:"center"}}>
      <span style={{fontSize:9,color:"#333",writingMode:"vertical-rl"}}>SEM SINAIS</span>
    </div>
  );

  return (
    <div style={{padding:"8px 4px"}}>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#CC0000",fontWeight:"bold",textTransform:"uppercase",marginBottom:4,textAlign:"center"}}>SINAIS</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
        {candidates.map((c) => {
          const {n, inTerminal} = c;
          const cor = getColor(n);
          const s = NUM_BALL[cor];
          return (
            <div key={n} className={inTerminal ? "pulse-cell" : ""}
              style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:"50%",
                background:s.bg,border:inTerminal?"2px solid #FFD700":`2px solid ${s.border}`,
                boxShadow:inTerminal?"0 0 8px #FFD700":"none",color:s.text,flexShrink:0}}>
              <span style={{fontSize:10,fontWeight:"bold"}}>{n}</span>
            </div>
          );
        })}
      </div>
      {terminalActive && (
        <div style={{marginTop:4,textAlign:"center",fontSize:7,color:"#FFD700"}}>T{vizTerminal}</div>
      )}
    </div>
  );
}

let idCounter = 0;

export default function DestroyerRaceTable() {
  const [entries, setEntries] = useState([]);
  const [input, setInput]     = useState("");
  const [colOrder, setColOrder] = useState(() => INIT_COLS.map(c=>c.key));
  const [hidden, setHidden]     = useState(new Set());
  const [showRep, setShowRep] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [filterSel, setFilterSel] = useState({});
  const [excludedDom, setExcludedDom] = useState(new Set());
  const [showCards, setShowCards] = useState(true);

  const dragKey  = useRef(null);
  const dragOver = useRef(null);

  const cols = useMemo(() => {
    const ordered = colOrder.filter(k => INIT_COLS.find(c => c.key === k)).map(k => INIT_COLS.find(c => c.key === k));
    INIT_COLS.forEach(c => { if (!colOrder.includes(c.key)) ordered.push(c); });
    return ordered;
  }, [colOrder]);

  const toggleHide = (key) => {
    if (!INIT_COLS.find(c=>c.key===key)?.toggleable) return;
    setHidden(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const onDragStart = (key) => { dragKey.current = key; };
  const onDragEnter = (key) => { dragOver.current = key; };
  const onDragEnd   = () => {
    const from = dragKey.current, to = dragOver.current;
    if (!from || !to || from===to) { dragKey.current=null; dragOver.current=null; return; }
    setColOrder(prev => { const arr = [...prev]; const fi = arr.indexOf(from), ti = arr.indexOf(to); arr.splice(fi,1); arr.splice(ti,0,from); return arr; });
    dragKey.current=null; dragOver.current=null;
  };

  // Auto-reset excludedDom on new entry
  const prevEntriesLen = useRef(entries.length);
  if(prevEntriesLen.current !== entries.length){
    prevEntriesLen.current = entries.length;
    // Reset after render via state update trick
  }
  const entriesLen = entries.length;
  const [lastEntriesLen, setLastEntriesLen] = useState(0);
  if(entriesLen !== lastEntriesLen){
    setLastEntriesLen(entriesLen);
    if(excludedDom.size > 0) setExcludedDom(new Set());
  }

  const last14 = useMemo(()=>entries.slice(-14),[entries]);
  const last14b = useMemo(()=>entries.slice(-14),[entries]);

  const autoVisible = useMemo(() => {
    const result = {};
    Object.entries(AUTO_RULE_FIELDS).forEach(([key, {field, values}]) => {
      if (last14b.length < 3) { result[key] = false; return; }
      const total = last14b.length;
      let dominant = false, dominantVal = null;
      values.forEach(val => { const cnt = last14b.filter(e => (e[field]||"—") === val).length; if (cnt / total >= 0.7) { dominant = true; dominantVal = val; } });
      if (!dominant) { result[key] = false; return; }
      const {rep, alt} = calcRepAltPerValue(last14b, field, dominantVal);
      const repRate = (rep + alt) > 0 ? rep / (rep + alt) : 0;
      result[key] = repRate >= 0.55;
    });
    return result;
  }, [last14b]);

  const stats = useMemo(()=>({
    cor:      countBy(last14,"cor",      ["Vermelho","Preto","Verde"]),
    lado:     countBy(last14,"lado",     ["PB e VA","PA e VB"]),
    regiao:   countBy(last14,"regiao",   ["Tier","Orphelins","Voisins"]),
    duzia:    countBy(last14,"duzia",    ["D1","D2","D3"]),
    paridade: countBy(last14,"paridade", ["Par","Ímpar"]),
    col_c1:   countBy(last14,"coluna",   ["C1"]),
    col_c2:   countBy(last14,"coluna",   ["C2"]),
    col_c3:   countBy(last14,"coluna",   ["C3"]),
    parte:    countBy(last14,"parte",    ["P1","P2"]),
    cavalo:   countBy(last14,"cavalo",   ["369","258","147"]),
    altobaixo: countBy(last14,"altobaixo", ["ALTO","BAIXO"]),
    gp_d1:     countBy(last14,"gp",        ["d1V","d1P"]),
    gp_d2:     countBy(last14,"gp",        ["d2I","d2P"]),
    gp_d3:     countBy(last14,"gp",        ["d3V","d3P"]),
    ruaParidade: (()=>{ const imp=last14.filter(e=>e.rua==="R1"||e.rua==="R3").length; const par=last14.filter(e=>e.rua==="R2"||e.rua==="R4").length; return {"R. Ímpar":imp,"R. Par":par}; })(),
  }),[last14]);

  function addNumbers() {
    const nums = parseInput(input);
    if (!nums.length) return;
    setEntries(prev=>[...prev,...[...nums].reverse().map(n=>buildEntry(n,++idCounter))]);
    setInput("");
    setFilterSel({});
  }
  function handleKey(e) { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addNumbers();} }

  async function exportPDF() {
    try {
      if (!window.html2canvas) {
        await new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      }
      if (!window.jspdf) {
        await new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      }
      const tableEl = document.getElementById("destroyer-table");
      if (!tableEl) return;
      const canvas = await window.html2canvas(tableEl, { backgroundColor:"#0d0d0d", scale:2, useCORS:true, logging:false });
      const { jsPDF } = window.jspdf;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation:"landscape", unit:"px", format:[canvas.width/2, canvas.height/2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width/2, canvas.height/2);
      pdf.save("destroyer-race-table.pdf");
    } catch(err) { alert("Erro ao gerar PDF: " + err.message); }
  }

  function isColVisible(key) {
    const col = INIT_COLS.find(c => c.key === key);
    if (!col) return false;
    if (hidden.has(key)) return false;
    return true;
  }

  const colScores = useMemo(() => {
    const scores = {};
    Object.entries(AUTO_RULE_FIELDS).forEach(([key, {field, values}]) => {
      if (last14b.length < 3) { scores[key] = 0; return; }
      const total = last14b.length;
      let maxPct = 0, bestVal = null;
      values.forEach(val => { const cnt = last14b.filter(e => (e[field]||"—") === val).length; const pct = cnt/total; if (pct > maxPct) { maxPct = pct; bestVal = val; } });
      if (!bestVal) { scores[key] = 0; return; }
      const {rep, alt} = calcRepAltPerValue(last14b, field, bestVal);
      const repRate = (rep + alt) > 0 ? rep / (rep + alt) : 0;
      scores[key] = maxPct * repRate;
    });
    return scores;
  }, [last14b]);

  const orderedCols = useMemo(() => {
    const fixed    = cols.filter(c => INIT_COLS.find(x=>x.key===c.key)?.mode === "fixed");
    const priority = cols.filter(c => INIT_COLS.find(x=>x.key===c.key)?.mode === "priority");
    const pinned   = cols.filter(c => INIT_COLS.find(x=>x.key===c.key)?.mode === "pinned");
    const auto     = cols.filter(c => INIT_COLS.find(x=>x.key===c.key)?.mode === "auto").sort((a,b) => (colScores[b.key]||0) - (colScores[a.key]||0));
    const always   = cols.filter(c => INIT_COLS.find(x=>x.key===c.key)?.mode === "always");
    return [...fixed, ...priority, ...pinned, ...auto, ...always];
  }, [cols, colScores]);

  const visibleCols = orderedCols.filter(c=>isColVisible(c.key));
  const lastVisKey  = [...visibleCols].reverse()[0]?.key;

  const { pulseKeys, pulseLastIdx } = useMemo(() => {
    if (entries.length === 0) return { pulseKeys: new Set(), pulseLastIdx: {} };
    const lastEntry = entries[entries.length - 1];
    const hist = getHistorico(entries, entries.length - 1, lastEntry.num);
    if (hist.length === 0) return { pulseKeys: new Set(), pulseLastIdx: {} };
    const total = hist.length;
    const threshold = total - 0.1;
    const keys = new Set();
    const dominantVal = {};
    const check = (field, vals) => {
      const counts = {};
      hist.forEach(h => { const v = h[field]||"—"; counts[v] = (counts[v]||0) + 1; });
      const maxVal = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
      if (maxVal && maxVal[1] > threshold) { keys.add(field); dominantVal[field] = maxVal[0]; }
    };
    check("cor",["Vermelho","Preto","Verde"]); check("lado",["PB e VA","PA e VB"]);
    check("duzia",["D1","D2","D3"]); check("paridade",["Par","Ímpar"]);
    check("coluna",["C1","C2","C3"]); check("rua",["R1","R2","R3","R4"]);
    check("parte",["P1","P2"]); check("regiao",["Tier","Orphelins","Voisins"]);
    const lastIdx = {};
    keys.forEach(field => {
      const val = dominantVal[field];
      for (let i = entries.length - 2; i >= 0; i--) {
        if ((entries[i][field]||"—") === val) { lastIdx[field] = i; break; }
      }
    });
    return { pulseKeys: keys, pulseLastIdx: lastIdx };
  }, [entries]);

  const gpHighlight = useMemo(() => {
    if (entries.length === 0) return { ballIndices: new Set(), histGpNums: new Set() };
    const lastGp = entries[entries.length - 1].gp;
    if (lastGp === "—") return { ballIndices: new Set(), histGpNums: new Set() };
    const siblings = [];
    for (let i = entries.length - 2; i >= 0 && siblings.length < 3; i--) {
      if (entries[i].gp === lastGp) siblings.push(i);
    }
    const ballIndices = new Set([entries.length - 1, ...siblings]);
    const histGpNums = new Set();
    return { ballIndices, histGpNums };
  }, [entries]);

  const absentCard = useMemo(() => {
    if (entries.length < 1) return null;
    const last5 = entries.slice(-5);
    const result = {};
    const duziaVals = ["D1","D2","D3"];
    const duziaPresent = [...new Set(last5.map(e=>e.duzia).filter(v=>v!=="—"))];
    const duziaAbsent = duziaVals.filter(v=>!duziaPresent.includes(v));
    if (duziaAbsent.length === 1 && duziaPresent.length === 2) {
      result.duzia = { absent: duziaAbsent[0], present: duziaPresent };
    }
    const colunaVals = ["C1","C2","C3"];
    const colunaPresent = [...new Set(last5.map(e=>e.coluna).filter(v=>v!=="0"&&v!=="—"))];
    const colunaAbsent = colunaVals.filter(v=>!colunaPresent.includes(v));
    if (colunaAbsent.length === 1 && colunaPresent.length === 2) {
      result.coluna = { absent: colunaAbsent[0], present: colunaPresent };
    }
    return Object.keys(result).length > 0 ? result : null;
  }, [entries]);

  const terminalStats = useMemo(() => {
    if (entries.length < 3) return { acertos: 0, erros: 0, total: 0, taxa: 0, topTerminals: [] };
    let acertos = 0, erros = 0;
    const perTerminal = {};
    for (let i = 0; i < entries.length - 1; i++) {
      const hist = getHistorico(entries, i, entries[i].num);
      const prediction = analyzeTerminal(hist);
      if (!prediction) continue;
      const t = prediction.terminal;
      if (!perTerminal[t]) perTerminal[t] = { acertos: 0, erros: 0 };
      const nextNum = entries[i + 1].num;
      const nextTerminals = NUM_TO_TERMINALS[nextNum];
      if (nextTerminals && nextTerminals.has(t)) { acertos++; perTerminal[t].acertos++; }
      else { erros++; perTerminal[t].erros++; }
    }
    const total = acertos + erros;
    const taxa = total > 0 ? Math.round((acertos / total) * 100) : 0;

    const signalsByTerminalPre = {};
    for (let si = 1; si < entries.length; si++) {
      const sn = entries[si].num;
      const shist = [];
      for (let sj = 0; sj < si; sj++) {
        if (entries[sj].num === sn && sj+1 < si) shist.push(entries[sj+1]);
      }
      const spred = shist.length >= 1 ? analyzeTerminal(shist.slice(-5)) : null;
      if (!spred) continue;
      const st = spred.terminal;
      if (si < entries.length - 1) {
        const snext = NUM_TO_TERMINALS[entries[si+1].num];
        const shit = !!(snext && snext.has(st));
        if (!signalsByTerminalPre[st]) signalsByTerminalPre[st] = [];
        signalsByTerminalPre[st].push(shit);
      }
    }
    const topTerminals = Object.entries(signalsByTerminalPre)
      .map(([t, hits]) => {
        const last10 = hits.slice(-10);
        const ac = last10.filter(Boolean).length;
        const total = last10.length;
        const taxa = total > 0 ? Math.round(ac/total*100) : 0;
        return { t:parseInt(t), acertos:ac, total, taxa };
      })
      .filter(x => x.total >= 2)
      .sort((a,b) => b.taxa - a.taxa || b.acertos - a.acertos)
      .slice(0,3);

    const recentTop3 = Object.entries(signalsByTerminalPre)
      .map(([t, hits]) => {
        const last10 = hits.slice(-10);
        const ac = last10.filter(Boolean).length;
        const total2 = last10.length;
        const taxa2 = total2 > 0 ? Math.round(ac/total2*100) : 0;
        return { t:parseInt(t), ac, total:total2, taxa:taxa2 };
      })
      .filter(x => x.total >= 2)
      .sort((a,b) => b.taxa - a.taxa || b.ac - a.ac)
      .slice(0,3);

    return { acertos, erros, total, taxa, topTerminals, recentTop3 };
  }, [entries]);

  const colDominance = useMemo(() => {
    if (entries.length < 3) return {};
    const last5 = entries.slice(-6);
    const result = {};
    const checks = {
      cor:["Vermelho","Preto","Verde"], lado:["PB e VA","PA e VB"], altobaixo:["ALTO","BAIXO"],
      paridade:["Par","Ímpar"], parte:["P1","P2"], cavalo:["369","258","147"],
      regiao:["Tier","Orphelins","Voisins"], setor:["S1","S2","S3","S4","S5","S6"],
      regtrack:["32-29","25-30","15-2","8-24","16-18"],
      fra:["F1e","F2e","F3e","F1d","F2d","F3d"],
      opo:["ZERO","DEZ"],
      col_c1:["C1"], col_c2:["C2"], col_c3:["C3"],
      gp_d1:["d1V","d1P"], gp_d2:["d2I","d2P"], gp_d3:["d3V","d3P"],
      ruaPar:["R.Ímpar","R.Par"],
    };
    Object.entries(checks).forEach(([field, vals]) => {
      const getVal = (e) => {
        if (field==="ruaPar") return getRuaParidade(e.num);
        if (field==="setor") return getSetor(e.num);
        if (field==="regtrack") return getRegTrack(e.num);
        if (field==="fra") return getFra(e.num);
        if (field==="opo") return getOpo(e.num);
        if (field==="col_c1") return e.coluna==="C1" ? "C1" : null;
        if (field==="col_c2") return e.coluna==="C2" ? "C2" : null;
        if (field==="col_c3") return e.coluna==="C3" ? "C3" : null;
        if (field==="gp_d1") return ["d1V","d1P"].includes(e.gp) ? e.gp : null;
        if (field==="gp_d2") return ["d2I","d2P"].includes(e.gp) ? e.gp : null;
        if (field==="gp_d3") return ["d3V","d3P"].includes(e.gp) ? e.gp : null;
        return e[field]||null;
      };
      vals.forEach(val => {
        const cnt = last5.filter(e => getVal(e) === val).length;
        if (cnt / last5.length >= 0.8) { result[field] = { val, pct: Math.round(cnt/last5.length*100) }; }
      });
    });
    return result;
  }, [entries]);

  const top3Stats = useMemo(() => {
    if (entries.length === 0) return [];
    const last5e = entries.slice(Math.max(0, entries.length - 5));
    const allPuxou = [];
    last5e.forEach((e, relIdx) => {
      const absIdx = entries.length - last5e.length + relIdx;
      const hist = getHistorico(entries, absIdx, e.num);
      allPuxou.push(...hist);
    });
    if (allPuxou.length === 0) return [];
    const total = allPuxou.length;
    const fields = [
      { key:"cor",      vals:["Vermelho","Preto","Verde"],        palette:{"Vermelho":{bg:"#CC0000",text:"#fff"},"Preto":{bg:"#222",text:"#ddd"},"Verde":{bg:"#1B7A3E",text:"#fff"}} },
      { key:"lado",     vals:["PB e VA","PA e VB"],               palette:{"PB e VA":{bg:"#6b0f1a",text:"#ffb3bb"},"PA e VB":{bg:"#1e3a5f",text:"#93c5fd"}} },
      { key:"paridade", vals:["Par","Ímpar"],                     palette:{"Par":{bg:"#0f1f5c",text:"#bfdbfe"},"Ímpar":{bg:"#4b5563",text:"#e5e7eb"}} },
      { key:"parte",    vals:["P1","P2"],                         palette:{"P1":{bg:"#713f00",text:"#fef08a"},"P2":{bg:"#14532d",text:"#bbf7d0"}} },
      { key:"altobaixo",vals:["ALTO","BAIXO"],                    palette:{"ALTO":{bg:"#7c0000",text:"#fca5a5"},"BAIXO":{bg:"#0c4a6e",text:"#7dd3fc"}} },
      { key:"regiao",   vals:["Tier","Orphelins","Voisins"],       palette:{"Tier":{bg:"#7c2d12",text:"#fdba74"},"Orphelins":{bg:"#854d0e",text:"#fefce8"},"Voisins":{bg:"#166534",text:"#bbf7d0"}} },
      { key:"duzia",    vals:["D1","D2","D3"],                    palette:{"D1":{bg:"#1e3a8a",text:"#bfdbfe"},"D2":{bg:"#92400e",text:"#fde68a"},"D3":{bg:"#7f1d1d",text:"#fca5a5"}} },
    ];
    const results = [];
    fields.forEach(({key, vals, palette}) => {
      vals.forEach(val => {
        const matching = allPuxou.filter(h => (h[key]||"—") === val);
        const count = matching.length;
        if (count > 0) {
          const pct = Math.round((count / total) * 100);
          const numFreq = {};
          matching.forEach(h => { numFreq[h.num] = (numFreq[h.num]||0) + 1; });
          const top2nums = Object.entries(numFreq).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([n])=>parseInt(n));
          results.push({ label: val, pct, count, scheme: palette[val]||{bg:"#222",text:"#aaa"}, top2nums });
        }
      });
    });
    return results.sort((a,b) => b.pct - a.pct).slice(0, 3);
  }, [entries]);

  const repAltIndices = useMemo(() => {
    if ((!showRep && !showAlt) || entries.length < 2) return { rep: new Set(), alt: new Set() };
    const rep = new Set(), alt = new Set();
    if (showRep) {
      for (let i = 0; i < entries.length - 1; i++) {
        if (entries[i].gp !== "—" && entries[i].gp === entries[i+1].gp) { rep.add(i); rep.add(i+1); }
      }
    }
    if (showAlt) {
      for (let i = 0; i < entries.length - 2; i++) {
        if (entries[i].gp !== "—" && entries[i].gp === entries[i+2].gp && entries[i].gp !== entries[i+1].gp) { alt.add(i); alt.add(i+2); }
      }
    }
    return { rep, alt };
  }, [entries, showRep, showAlt]);

  const GP_BORDER_COLOR = { "d1V":"#fef08a","d2P":"#d4a574","d3P":"#fdba74","d1P":"#bfdbfe","d2I":"#67e8f9","d3V":"#93c5fd" };

  const duziaAlert = useMemo(() => {
    if (entries.length < 2) return null;
    const last = entries[entries.length - 1], prev = entries[entries.length - 2];
    if (last.duzia === "D2" && prev.duzia === "D1") return "gp_d3";
    if (last.duzia === "D2" && prev.duzia === "D3") return "gp_d1";
    return null;
  }, [entries]);

  const colunaAlert = useMemo(() => {
    if (entries.length < 2) return null;
    const last = entries[entries.length - 1], prev = entries[entries.length - 2];
    if (last.coluna === "C2" && prev.coluna === "C1") return "col_c3";
    if (last.coluna === "C2" && prev.coluna === "C3") return "col_c1";
    return null;
  }, [entries]);

  const top2Chars = useMemo(() => {
    if (last14.length < 3) return [];
    const fields = [
      { key:"duzia", vals:["D1","D2","D3"] }, { key:"paridade", vals:["Par","Ímpar"] },
      { key:"cor", vals:["Vermelho","Preto","Verde"] }, { key:"lado", vals:["PB e VA","PA e VB"] },
      { key:"parte", vals:["P1","P2"] }, { key:"regiao", vals:["Tier","Orphelins","Voisins"] },
    ];
    const results = [], total = last14.length;
    fields.forEach(({key, vals}) => {
      vals.forEach(val => {
        const cnt = last14.filter(e => (e[key]||"—") === val).length;
        if (cnt > 0) results.push({ key, val, pct: cnt/total });
      });
    });
    return results.sort((a,b)=>b.pct-a.pct).slice(0,2);
  }, [last14]);

  const matchesTop2 = (entry) => {
    if (top2Chars.length < 2) return false;
    return top2Chars.every(({key, val}) => (entry[key]||"—") === val);
  };

  return (
    <div style={{display:"flex",flexDirection:"row",minHeight:"100vh",width:"100vw",maxWidth:"100vw",margin:0,padding:0,background:"#0d0d0d",color:"#e5e5e5",fontFamily:"Arial, sans-serif"}}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow-x: hidden; }
        @keyframes pulseBorder { 0%,100% { box-shadow: inset 0 0 0 2px #FFD700, inset 0 0 8px #FFD700; } 50% { box-shadow: inset 0 0 0 2px #fff5a0, inset 0 0 16px #FFD700; } }
        .pulse-cell { animation: pulseBorder 0.9s ease-in-out infinite; outline: 2px solid #FFD700; outline-offset: -2px; position: relative; z-index: 1; }
        @keyframes pulseDuzia { 0%,100% { box-shadow: inset 0 0 0 2px #00e5ff, inset 0 0 10px #00e5ff; } 50% { box-shadow: inset 0 0 0 2px #80f4ff, inset 0 0 20px #00e5ff; } }
        .pulse-duzia { animation: pulseDuzia 0.7s ease-in-out infinite; outline: 2px solid #00e5ff; outline-offset: -2px; position: relative; z-index: 2; }
      `}</style>


      {/* ── Coluna central ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",padding:"8px 8px 0 8px"}}>

        <div style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:13,letterSpacing:"0.3em",color:"#CC0000",fontWeight:"bold"}}>DESTROYER</span>
          <span style={{fontSize:9,letterSpacing:"0.2em",color:"#555"}}>RACE TABLE</span>
          {entries.length>0&&<span style={{marginLeft:"auto",fontSize:9,color:"#555"}}>{entries.length} números</span>}
        </div>

        <div id="destroyer-table-wrap" style={{flex:1,overflowY:"auto",overflowX:"auto",marginBottom:8}}>
          <table id="destroyer-table" style={{width:"100%",borderCollapse:"collapse",borderTop:"1px solid #000",borderLeft:"1px solid #000"}}>
            <thead>
              <tr>
                {orderedCols.map(col => {
                  if (!isColVisible(col.key)) return null;
                  const isDraggable = col.toggleable;
                  const isBeingDragged = dragKey.current===col.key;
                  const firstAlwaysKey  = visibleCols.find(c=>INIT_COLS.find(x=>x.key===c.key)?.mode==="always")?.key;
                  const lastPriorityKey = [...visibleCols].reverse().find(c=>INIT_COLS.find(x=>x.key===c.key)?.mode==="priority")?.key;
                  const lastPinnedKey   = [...visibleCols].reverse().find(c=>INIT_COLS.find(x=>x.key===c.key)?.mode==="pinned")?.key;
                  const isSeparator     = col.key === firstAlwaysKey;
                  const isPrioritySep   = col.key === lastPriorityKey;
                  const isPinnedSep     = col.key === lastPinnedKey;
                  return (
                    <th key={col.key}
                      draggable={isDraggable}
                      onDragStart={isDraggable ? ()=>onDragStart(col.key) : undefined}
                      onDragEnter={isDraggable ? ()=>onDragEnter(col.key) : undefined}
                      onDragEnd={isDraggable ? onDragEnd : undefined}
                      onDragOver={e=>e.preventDefault()}
                      onDoubleClick={col.toggleable ? ()=>toggleHide(col.key) : undefined}
                      style={{
                        background: isBeingDragged ? "#990000" : "#CC0000",
                        color:"#ffffff", padding:"2px 1px", textAlign:"center",
                        fontSize:9, fontWeight:"bold", letterSpacing:"0em",
                        borderBottom:"2px solid #000", borderRight:"1px solid #000",
                        width: ["gp_d1","gp_d2","gp_d3","col_c1","col_c2","col_c3"].includes(col.key) ? 28 :
                               ["seq"].includes(col.key) ? 20 : ["num"].includes(col.key) ? 34 :
                               ["viz"].includes(col.key) ? 34 : ["hist"].includes(col.key) ? 114 :
                               ["vn"].includes(col.key) ? 34 :
                               ["lado","cor","altobaixo","paridade","parte","cavalo","regiao"].includes(col.key) ? 42 :
                               ["duzia","rua"].includes(col.key) ? 32 :
                               ["setor"].includes(col.key) ? 32 : ["regtrack"].includes(col.key) ? 36 : ["fra"].includes(col.key) ? 36 : ["opo"].includes(col.key) ? 36 : ["ruaPar"].includes(col.key) ? 36 : undefined,
                        minWidth: ["gp_d1","gp_d2","gp_d3","col_c1","col_c2","col_c3"].includes(col.key) ? 28 : 20,
                        borderLeft: isSeparator ? "3px solid #FFD700" : "none",
                        borderRight: isPrioritySep ? "3px solid #aaaaaa" : isPinnedSep ? "3px solid #aaaaaa" : "1px solid #000",
                        whiteSpace:"nowrap", fontFamily:"Arial, sans-serif",
                        cursor: isDraggable ? "grab" : "default", userSelect:"none", opacity: isBeingDragged ? 0.5 : 1,
                      }}>
                      {col.label}
                    </th>
                  );
                })}
                {[...hidden].map(key => {
                  const col = INIT_COLS.find(c=>c.key===key);
                  return (
                    <th key={"h-"+key} onClick={()=>toggleHide(key)} title={`Mostrar ${col?.label}`}
                      style={{background:"#1a0000",color:"#CC0000",padding:"5px 3px",textAlign:"center",fontSize:8,fontWeight:"bold",borderBottom:"2px solid #000",borderRight:"1px solid #000",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>▶</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {entries.length===0 ? (
                <tr><td colSpan={visibleCols.length+hidden.size} style={{textAlign:"center",padding:"3rem",color:"#333",fontSize:12,background:"#0d0d0d",borderBottom:"1px solid #1a1a1a",borderRight:"1px solid #1a1a1a"}}>Nenhum número inserido</td></tr>
              ) : (showAll ? entries : entries.slice(-20)).map((e,i) => {
                const realIndex = showAll ? i : entries.length - 20 + i;
                const posFromLast = entries.length - (showAll ? i : entries.length - 20 + i);
                const isGold  = false;
                const isWhite = posFromLast===5;
                const bTop = isWhite?"2px solid #ffffff":"none";
                const bBot = isWhite?"2px solid #ffffff":"1px solid #000";
                const firstAlwaysKeyRow  = visibleCols.find(c=>INIT_COLS.find(x=>x.key===c.key)?.mode==="always")?.key;
                const lastPriorityKeyRow = [...visibleCols].reverse().find(c=>INIT_COLS.find(x=>x.key===c.key)?.mode==="priority")?.key;
                const lastPinnedKeyRow   = [...visibleCols].reverse().find(c=>INIT_COLS.find(x=>x.key===c.key)?.mode==="pinned")?.key;
                const isPrioritySepRow   = (ckey) => ckey === lastPriorityKeyRow || ckey === lastPinnedKeyRow;
                const isLastRow = realIndex === entries.length - 1;
                const Cell = ({ckey, isLast}) => {
                  const scheme = CELL_SCHEME(e,ckey);
                  const pulse = pulseLastIdx[ckey] === realIndex;
                  const isSep = ckey === firstAlwaysKeyRow;
                  const isDuziaAlert = isLastRow && duziaAlert === ckey && CELL_VAL(e,ckey) === "";
                  const isColunaAlert = isLastRow && colunaAlert === ckey && CELL_VAL(e,ckey) === "";
                  return (
                    <td className={isDuziaAlert || isColunaAlert ? "pulse-duzia" : pulse ? "pulse-cell" : ""}
                      style={{background: isDuziaAlert || isColunaAlert ? "#001a1f" : scheme.bg, color:scheme.text,padding:"1px 2px",textAlign:"center",
                      fontSize:11,fontWeight:"700",fontFamily:"Arial, sans-serif",letterSpacing:"0em",whiteSpace:"nowrap",
                      borderTop: isDuziaAlert || isColunaAlert ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : bTop,
                      borderBottom: isDuziaAlert || isColunaAlert ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : bBot,
                      borderLeft: isSep ? "3px solid #FFD700" : "none",
                      borderRight: (isLast&&isGold) ? `2px solid ${GOLD}` : (isLast&&isWhite) ? "2px solid #ffffff" : (isDuziaAlert||isColunaAlert) ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : isPrioritySepRow(ckey) ? "3px solid #aaaaaa" : "1px solid #000"}}>
                      {CELL_VAL(e,ckey)}
                    </td>
                  );
                };
                return (
                  <tr key={e.id}>
                    {cols.map((col,ci) => {
                      if (!isColVisible(col.key)) return null;
                      const isLast = col.key===lastVisKey;
                      if (col.key==="seq") {
                        const bracketStart = posFromLast === 13;
                        const bracketEnd   = posFromLast === 19;
                        const bracketMid   = posFromLast >= 13 && posFromLast <= 19;
                        const bracketPos5  = posFromLast === 5;
                        return (
                          <td key="seq" style={{background:"#0d0d0d",fontSize:8,textAlign:"center",padding:"0",borderTop:bTop,borderBottom:bBot,borderLeft:"none",borderRight:"1px solid #000",fontFamily:"Arial, sans-serif",width:26,whiteSpace:"nowrap",position:"relative"}}>
                            {bracketMid && (
                              <div style={{
                                position:"absolute", top:0, bottom:0,
                                left:2, width:6,
                                borderTop: bracketStart ? "2px solid #FFD700" : "none",
                                borderBottom: bracketEnd ? "2px solid #FFD700" : "none",
                                borderLeft: "2px solid #FFD700",
                              }}/>
                            )}
                            {bracketPos5 && (
                              <div style={{
                                position:"absolute", top:"50%", left:1,
                                transform:"translateY(-50%)",
                                width:8, height:8, borderRadius:"50%",
                                background:"#ffffff", flexShrink:0,
                              }}/>
                            )}
                            <span style={{color:"#444",paddingLeft:bracketMid?10:0}}>{i+1}</span>
                          </td>
                        );
                      }
                      if (col.key==="num") {
                        const gpBall = gpHighlight.ballIndices.has(realIndex);
                        const isRep = repAltIndices.rep.has(realIndex);
                        const isAlt = repAltIndices.alt.has(realIndex);
                        const gpColor = GP_BORDER_COLOR[e.gp] || null;
                        const repAltBorder = (isRep || isAlt) && gpColor ? `2px solid ${gpColor}` : null;
                        const repAltShadow = (isRep || isAlt) && gpColor ? `0 0 6px ${gpColor}` : null;
                        const isPos513 = posFromLast === 5 || posFromLast === 13;
                        const isCharMatch = isPos513 && matchesTop2(e);
                        return (
                          <td key="num" style={{background:"#0d0d0d",padding:"1px 2px",textAlign:"center",borderTop:bTop,borderBottom:bBot,borderRight:"1px solid #000",width:40}}>
                            <div className={isCharMatch ? "pulse-cell" : ""}
                              style={{display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                              width:26,height:26,borderRadius:"50%",background:NUM_BALL[e.cor].bg,
                              border: isCharMatch ? "2px solid #FFD700" : repAltBorder || (gpBall ? "2px solid #3b82f6" : `2px solid ${NUM_BALL[e.cor].border}`),
                              boxShadow: isCharMatch ? "0 0 8px #FFD700" : repAltShadow || (gpBall ? "0 0 6px #3b82f6" : "none"),
                              color:NUM_BALL[e.cor].text,fontFamily:"Arial, sans-serif"}}>
                              <span style={{fontSize:11,fontWeight:"bold",lineHeight:1}}>{e.num}</span>
                              {e.gp!=="—"&&<span style={{fontSize:6,fontWeight:"normal",opacity:0.85,lineHeight:1}}>{e.gp}</span>}
                            </div>
                          </td>
                        );
                      }
                      if (col.key==="hist") {
                        const hist = getHistorico(entries, realIndex, e.num);
                        const histFullNums = [];
                        for(let j=0;j<i;j++){ if(entries[j].num===e.num && j+1<entries.length) histFullNums.push(entries[j+1].num); }
                        const histRepeatNums = new Set(Object.entries(histFullNums.reduce((a,n)=>{a[n]=(a[n]||0)+1;return a;},{})).filter(([,c])=>c>1).map(([n])=>parseInt(n)));
                        const lastGp = entries.length > 0 ? entries[entries.length-1].gp : "—";
                        const isLast3General = posFromLast >= 1 && posFromLast <= 4;
                        return (
                          <td key="hist" style={{background:"#0d0d0d",padding:"2px 5px",textAlign:"left",borderTop:bTop,borderBottom:bBot,borderRight:"1px solid #000",width:114,maxWidth:114}}>
                            <div style={{display:"flex",alignItems:"center",gap:1,flexWrap:"nowrap"}}>
                              {hist.length===0
                                ? <span style={{color:"#2a2a2a",fontSize:8}}>—</span>
                                : hist.map((h,hi) => {
                                    const isGpMatch = isLast3General && lastGp !== "—" && h.gp === lastGp;
                                    const isRepeat = histRepeatNums.has(h.num);
                                    return (
                                      <div key={hi} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,borderRadius:"50%",flexShrink:0,
                                        background: isRepeat ? "#FFD700" : NUM_BALL[h.cor].bg,
                                        boxShadow: isRepeat ? "0 0 6px #FFD700" : "none",
                                        border: isGpMatch ? "2px solid #3b82f6" : `2px solid ${NUM_BALL[h.cor].border}`,
                                        color: isRepeat ? "#000" : NUM_BALL[h.cor].text,
                                        fontSize:10,fontWeight:"bold"}}>{h.num}</div>
                                    );
                                  })
                              }
                            </div>
                          </td>
                        );
                      }
                      if (col.key==="viz") {
                        const hist = getHistorico(entries, realIndex, e.num);
                        const result = analyzeTerminal(hist);
                        return (
                          <td key="viz" style={{background:"#0d0d0d",padding:"1px 2px",textAlign:"center",borderTop:bTop,borderBottom:bBot,borderRight:"1px solid #000",minWidth:28}}>
                            {result ? (
                              <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:"50%",background:"#1a1a00",border:"2px solid #FFD700",color:"#FFD700",fontFamily:"Arial, sans-serif"}}>
                                <span style={{fontSize:10,fontWeight:"bold",lineHeight:1}}>T{result.terminal}</span>
                                <span style={{fontSize:6,lineHeight:1,opacity:0.85}}>{result.pct}%</span>
                              </div>
                            ) : <span style={{color:"#2a2a2a",fontSize:8}}>—</span>}
                          </td>
                        );
                      }
                      return <Cell key={col.key} ckey={col.key} isLast={isLast}/>;
                    })}
                    {[...hidden].map(key=>(
                      <td key={"ph-"+key} style={{background:"#0a0a0a",borderBottom:bBot,borderRight:"1px solid #111",width:8}}/>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>


        {/* Barra de dominância */}
        {Object.keys(colDominance).length > 0 && (() => {
          const sortedDomCols = visibleCols.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key)).sort((a,b)=>(colDominance[b.key]?.pct||0)-(colDominance[a.key]?.pct||0));
          const allDomVals = {};
          Object.entries(colDominance).filter(([k])=>!excludedDom.has(k)).forEach(([k,v]) => { allDomVals[k] = v.val; });
          const NFIELDX = {
            cor:n=>getColor(n), lado:n=>getLado(n), altobaixo:n=>getAltoBaixo(n),
            paridade:n=>getParidade(n), parte:n=>getParte(n), cavalo:n=>getCavalo(n),
            regiao:n=>getRegiao(n), duzia:n=>getDuzia(n), coluna:n=>getColuna(n),
            ruaPar:n=>getRuaParidade(n),
            fra:n=>getFra(n),
            opo:n=>getOpo(n),
            col_c1:n=>getColuna(n)==="C1"?"C1":null, col_c2:n=>getColuna(n)==="C2"?"C2":null, col_c3:n=>getColuna(n)==="C3"?"C3":null,
            gp_d1:n=>{const g=getGP(n);return["d1V","d1P"].includes(g)?g:null;},
            gp_d2:n=>{const g=getGP(n);return["d2I","d2P"].includes(g)?g:null;},
            gp_d3:n=>{const g=getGP(n);return["d3V","d3P"].includes(g)?g:null;},
          };
          const domKeys = Object.keys(allDomVals).filter(k=>NFIELDX[k]);
          const matchNums = [];
          for(let n=0;n<=36;n++){ if(domKeys.length>0 && domKeys.every(k=>NFIELDX[k](n)===allDomVals[k])) matchNums.push(n); }
          return (
            <div style={{display:"flex",gap:3,padding:"3px 0",flexWrap:"wrap",alignItems:"center",borderTop:"1px solid #1a1a1a",borderBottom:"1px solid #1a1a1a",marginTop:2,marginBottom:2}}>
              {sortedDomCols.map(col => {
                const dom = colDominance[col.key];
                if (!dom) return null;
                return (
                  <div key={col.key} onClick={()=>setExcludedDom(prev=>{const n=new Set(prev);n.has(col.key)?n.delete(col.key):n.add(col.key);return n;})} style={{display:"flex",flexDirection:"column",alignItems:"center",background:"#0a0a0a",border:"1px solid #333",borderRadius:3,padding:"3px 8px",minWidth:44,textAlign:"center",cursor:"pointer",userSelect:"none"}}>
                    <span style={{fontSize:7,color:"#777",lineHeight:1,textTransform:"uppercase"}}>{col.label}</span>
                    <span style={{fontSize:11,fontWeight:"bold",lineHeight:1.2,
                      color: col.key==="cor"?(dom.val==="Vermelho"?"#ff6666":dom.val==="Verde"?"#4ade80":"#e5e5e5"):col.key==="cavalo"?(CAVALO_CELL[dom.val]?.text||"#fff"):col.key==="paridade"?(PAR_CELL[dom.val]?.text||"#fff"):col.key==="parte"?(PARTE_CELL[dom.val]?.text||"#fff"):col.key==="lado"?(LADO_CELL[dom.val]?.text||"#fff"):col.key==="altobaixo"?(ALTOBAIXO_CELL[dom.val]?.text||"#fff"):col.key==="regiao"?(REGIAO_CELL[dom.val]?.text||"#fff"):col.key==="duzia"?(DUZIA_CELL[dom.val]?.text||"#fff"):"#00e5ff",
                      background: col.key==="cor"?(dom.val==="Vermelho"?"#CC0000":dom.val==="Verde"?"#1B7A3E":"#222"):col.key==="cavalo"?(CAVALO_CELL[dom.val]?.bg||"#111"):col.key==="paridade"?(PAR_CELL[dom.val]?.bg||"#111"):col.key==="parte"?(PARTE_CELL[dom.val]?.bg||"#111"):col.key==="lado"?(LADO_CELL[dom.val]?.bg||"#111"):col.key==="altobaixo"?(ALTOBAIXO_CELL[dom.val]?.bg||"#111"):col.key==="regiao"?(REGIAO_CELL[dom.val]?.bg||"#111"):col.key==="duzia"?(DUZIA_CELL[dom.val]?.bg||"#111"):col.key==="fra"?(FRA_CELL[dom.val]?.bg||"#111"):col.key==="opo"?(OPO_CELL[dom.val]?.bg||"#111"):"transparent",
                      padding:"1px 5px",borderRadius:2,display:"inline-block"}}>
                      {dom.val}
                    </span>
                    <span style={{fontSize:11,fontWeight:"bold",color:"#fff",lineHeight:1}}>{dom.pct}%</span>
                  </div>
                );
              })}
              {/* Excluded dom cards — show dimmed with strikethrough */}
              {[...excludedDom].filter(k=>colDominance[k]).map(k=>{
                const dom = colDominance[k];
                const col = visibleCols.find(c=>c.key===k);
                if(!col||!dom) return null;
                return (
                  <div key={"ex-"+k} onClick={()=>setExcludedDom(prev=>{const n=new Set(prev);n.delete(k);return n;})}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",
                      background:"#0a0a0a",border:"1px dashed #333",borderRadius:3,
                      padding:"3px 8px",minWidth:44,textAlign:"center",cursor:"pointer",
                      opacity:0.35,userSelect:"none"}}>
                    <span style={{fontSize:7,color:"#555",lineHeight:1,textTransform:"uppercase",textDecoration:"line-through"}}>{col.label}</span>
                    <span style={{fontSize:11,fontWeight:"bold",lineHeight:1.2,color:"#555",textDecoration:"line-through"}}>{dom.val}</span>
                    <span style={{fontSize:11,fontWeight:"bold",color:"#555",lineHeight:1,textDecoration:"line-through"}}>{dom.pct}%</span>
                  </div>
                );
              })}
              {colDominance.ruaPar && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",background:colDominance.ruaPar.val==="R.Par"?"#005a5a":"#4a0080",border:"1px solid #333",borderRadius:3,padding:"3px 8px",minWidth:44,textAlign:"center"}}>
                  <span style={{fontSize:7,color:"#aaa",lineHeight:1,textTransform:"uppercase"}}>RUA</span>
                  <span style={{fontSize:11,fontWeight:"bold",lineHeight:1.2,color:"#fff",padding:"1px 5px",borderRadius:2,display:"inline-block"}}>{colDominance.ruaPar.val}</span>
                  <span style={{fontSize:8,color:"#aaa",lineHeight:1}}>{colDominance.ruaPar.pct}%</span>
                </div>
              )}
              {matchNums.length > 0 && matchNums.length <= 12 && (
                <div style={{display:"flex",gap:2,alignItems:"center",marginLeft:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:7,color:"#555",flexShrink:0}}>▶</span>
                  {matchNums.map(n=>{
                    const cor=getColor(n);
                    return (
                      <div key={n} style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:NUM_BALL[cor].bg,border:"2px solid "+NUM_BALL[cor].border,color:"#fff",fontSize:11,fontWeight:"bold",flexShrink:0}}>{n}</div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Barra de toggle */}
        <div style={{display:"flex",gap:3,padding:"4px 0",flexWrap:"wrap",borderTop:"1px solid #1a1a1a",marginTop:4,alignItems:"center"}}>
          <button onClick={exportPDF} style={{padding:"1px 10px",background:"#7c0000",border:"1px solid #CC0000",borderRadius:2,color:"#fca5a5",fontSize:9,cursor:"pointer",fontFamily:"Arial, sans-serif",fontWeight:"bold",letterSpacing:"0.05em"}}>⬇ PDF</button>
          <div style={{width:"0.5px",height:14,background:"#2a2a2a"}}/>
          {INIT_COLS.filter(c=>c.toggleable).map(col => {
            const vis = isColVisible(col.key);
            return (
              <button key={col.key} onClick={()=>toggleHide(col.key)}
                style={{padding:"1px 7px",background:vis?"#1a1a1a":"#0a0a0a",border:vis?"1px solid #333":"1px solid #1a1a1a",borderRadius:2,color:vis?"#aaa":"#333",fontSize:9,cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.04em",transition:"all 0.15s"}}>
                {vis ? "−" : "+"} {col.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rodapé */}
      <div style={{background:"#080808",borderTop:"1px solid #1e1e1e",padding:"10px 16px"}}>
        <div style={{display:"flex",gap:8,marginBottom:last14.length>0?10:0}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Cole ou digite: 23 10 11  ou  23,10,11  — Enter para adicionar" rows={2}
            style={{flex:1,background:"#111",border:"1px solid #2a2a2a",borderRadius:2,color:"#e5e5e5",padding:"7px 10px",fontSize:12,fontFamily:"Arial, sans-serif",resize:"none",outline:"none"}}/>
          <button onClick={addNumbers} style={{padding:"0 20px",background:"#CC0000",border:"none",borderRadius:2,color:"#fff",fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",cursor:"pointer",fontFamily:"Arial, sans-serif"}}>ADD</button>
          <button onClick={()=>{ setEntries([]); try{ window.storage.set("destroyer-pair-v6", JSON.stringify({catalog:{},totalSeq:0,totalNum:0})); }catch(e){} }} style={{padding:"0 14px",background:"transparent",border:"1px solid #333",borderRadius:2,color:"#666",fontSize:11,cursor:"pointer",fontFamily:"Arial, sans-serif"}}>CLR</button>
          <button onClick={()=>{setEntries(prev=>prev.slice(0,-1));setFilterSel({});}} disabled={entries.length===0} style={{padding:"0 14px",background:"transparent",border:"1px solid #444",borderRadius:2,color:entries.length===0?"#333":"#aaa",fontSize:11,cursor:entries.length===0?"default":"pointer",fontFamily:"Arial, sans-serif"}}>↩</button>
          <button onClick={()=>setShowRep(v=>!v)} style={{padding:"0 12px",background:showRep?"#166534":"transparent",border:showRep?"1px solid #22c55e":"1px solid #333",borderRadius:2,color:showRep?"#22c55e":"#555",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.06em"}}>{showRep?"● REP":"○ REP"}</button>
          <button onClick={()=>setShowAlt(v=>!v)} style={{padding:"0 12px",background:showAlt?"#7c2d12":"transparent",border:showAlt?"1px solid #f97316":"1px solid #333",borderRadius:2,color:showAlt?"#f97316":"#555",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.06em"}}>{showAlt?"● ALT":"○ ALT"}</button>
          <button onClick={()=>setShowAll(v=>!v)} style={{padding:"0 12px",background:showAll?"#1e3a5f":"transparent",border:showAll?"1px solid #60a5fa":"1px solid #333",borderRadius:2,color:showAll?"#60a5fa":"#555",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.06em"}}>{showAll?"● HIST":"○ HIST"}</button>
          <button onClick={()=>setShowCards(v=>!v)} style={{padding:"0 12px",background:showCards?"#2d1a00":"transparent",border:showCards?"1px solid #f97316":"1px solid #333",borderRadius:2,color:showCards?"#f97316":"#555",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.06em"}}>{showCards?"● INFO":"○ INFO"}</button>
        </div>

        {showCards && <>

        {(top3Stats.length > 0 || absentCard) && (
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,marginTop:2,flexWrap:"wrap"}}>
            {top3Stats.length > 0 && <>
              <span style={{fontSize:7,color:"#555",letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0}}>ult 5 →</span>
              {top3Stats.map((s,idx) => {
                const hot = s.pct >= 80;
                return (
                  <div key={idx} className={hot ? "pulse-cell" : ""}
                    style={{display:"flex",alignItems:"center",gap:4,background:hot?s.scheme.bg:"#111",borderRadius:3,padding:"3px 8px",border:hot?"2px solid "+s.scheme.text:"0.5px solid #222",transition:"all 0.3s"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:hot?s.scheme.text:s.scheme.bg,border:"0.5px solid "+s.scheme.text,flexShrink:0}}/>
                    <span style={{fontSize:9,color:s.scheme.text,fontWeight:"bold",fontFamily:"Arial, sans-serif"}}>{s.label}</span>
                    <span style={{fontSize:9,color:hot?s.scheme.text:"#666",fontFamily:"Arial, sans-serif",fontWeight:hot?"bold":"normal"}}>{s.pct}%</span>
                  </div>
                );
              })}
            </>}
            {absentCard && (
              <div style={{display:"flex",gap:4,alignItems:"center",background:"#0a0a0a",border:"0.5px solid #1e1e1e",borderRadius:3,padding:"3px 8px"}}>
                <span style={{fontSize:7,color:"#555",textTransform:"uppercase",letterSpacing:"0.08em",flexShrink:0}}>ausente</span>
                {absentCard.duzia && (
                  <div style={{display:"flex",alignItems:"center",gap:3}}>
                    <span style={{fontSize:7,color:"#666"}}>D</span>
                    {absentCard.duzia.present.map(v=>(
                      <span key={v} style={{fontSize:8,fontWeight:"bold",color:DUZIA_CELL[v]?.text,background:DUZIA_CELL[v]?.bg,padding:"1px 4px",borderRadius:2}}>{v}</span>
                    ))}
                    <span style={{fontSize:7,color:"#555"}}>→</span>
                    <span style={{fontSize:8,fontWeight:"bold",color:"#fff",background:"#CC0000",padding:"1px 4px",borderRadius:2,border:"1px solid #ff6666"}}>{absentCard.duzia.absent}?</span>
                  </div>
                )}
                {absentCard.duzia && absentCard.coluna && <div style={{width:"0.5px",height:12,background:"#2a2a2a"}}/>}
                {absentCard.coluna && (
                  <div style={{display:"flex",alignItems:"center",gap:3}}>
                    <span style={{fontSize:7,color:"#666"}}>C</span>
                    {absentCard.coluna.present.map(v=>(
                      <span key={v} style={{fontSize:8,fontWeight:"bold",color:COLUNA_CELL[v]?.text,background:COLUNA_CELL[v]?.bg,padding:"1px 4px",borderRadius:2}}>{v}</span>
                    ))}
                    <span style={{fontSize:7,color:"#555"}}>→</span>
                    <span style={{fontSize:8,fontWeight:"bold",color:"#fff",background:"#CC0000",padding:"1px 4px",borderRadius:2,border:"1px solid #ff6666"}}>{absentCard.coluna.absent}?</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}



        {/* Ausência nos últimos 50 */}
        {entries.length >= 10 && (() => {
          const last50 = entries.slice(-50);
          const nums50 = last50.map(e=>e.num);

          // 1. Setor mais ausente
          const setores = ["S1","S2","S3","S4","S5","S6"];
          const setorAbsence = setores.map(s=>{
            const lastIdx = last50.map(e=>e.setor).lastIndexOf(s);
            const ausente = lastIdx===-1 ? last50.length : last50.length-1-lastIdx;
            return {val:s, ausente};
          }).sort((a,b)=>b.ausente-a.ausente)[0];

          // 2. GP mais ausente
          const gps = ["d1V","d1P","d2I","d2P","d3V","d3P"];
          const gpAbsence = gps.map(g=>{
            const lastIdx = last50.map(e=>e.gp).lastIndexOf(g);
            const ausente = lastIdx===-1 ? last50.length : last50.length-1-lastIdx;
            return {val:g, ausente};
          }).sort((a,b)=>b.ausente-a.ausente)[0];

          // 3. Número mais ausente (1-36)
          const numAbsence = Array.from({length:36},(_,i)=>i+1).map(n=>{
            const lastIdx = nums50.lastIndexOf(n);
            const ausente = lastIdx===-1 ? last50.length : last50.length-1-lastIdx;
            return {val:n, ausente};
          }).sort((a,b)=>b.ausente-a.ausente)[0];

          // 3b. Terminal mais ausente (T0-T9)
          const TERM_MEMBERS = {
            0:[0,10,20,30],1:[1,11,21,31],2:[2,12,22,32],3:[3,13,23,33],
            4:[4,14,24,34],5:[5,15,25,35],6:[6,16,26,36],7:[7,17,27],
            8:[8,18,28],9:[9,19,29]
          };
          const termAbsence = Object.entries(TERM_MEMBERS).map(([t,members])=>{
            const lastIdx = last50.map((e,i)=>members.includes(e.num)?i:-1).filter(i=>i>=0).pop();
            const ausente = lastIdx===undefined ? last50.length : last50.length-1-lastIdx;
            return {val:parseInt(t), ausente};
          }).sort((a,b)=>b.ausente-a.ausente)[0];

          const setorSch = SETOR_CELL[setorAbsence.val]||{bg:"#111",text:"#aaa"};
          const gpSch = GP_CELL[gpAbsence.val]||{bg:"#111",text:"#aaa"};
          const numCor = getColor(numAbsence.val);
          const numS = NUM_BALL[numCor];
          const tColors = ["#a855f7","#ef4444","#f97316","#eab308","#22c55e","#f59e0b","#60a5fa","#34d399","#f472b6","#818cf8"];
          const termC = tColors[termAbsence.val];

          return (
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",
              padding:"4px 0",marginTop:4,borderTop:"1px solid #1a1a1a"}}>
              <span style={{fontSize:7,color:"#555",textTransform:"uppercase",letterSpacing:"0.08em",flexShrink:0}}>AUSÊNCIA ULT 50:</span>

              {/* Setor */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",
                background:setorSch.bg,borderRadius:3,padding:"2px 8px",border:"1px solid "+setorSch.text+"55"}}>
                <span style={{fontSize:7,color:setorSch.text,opacity:0.7}}>SET</span>
                <span style={{fontSize:11,fontWeight:"bold",color:setorSch.text}}>{setorAbsence.val}</span>
                <span style={{fontSize:7,color:setorSch.text,opacity:0.8}}>{setorAbsence.ausente}x</span>
              </div>

              {/* GP */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",
                background:gpSch.bg,borderRadius:3,padding:"2px 8px",border:"1px solid "+gpSch.text+"55"}}>
                <span style={{fontSize:7,color:gpSch.text,opacity:0.7}}>GP</span>
                <span style={{fontSize:11,fontWeight:"bold",color:gpSch.text}}>{gpAbsence.val}</span>
                <span style={{fontSize:7,color:gpSch.text,opacity:0.8}}>{gpAbsence.ausente}x</span>
              </div>

              {/* Número */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <span style={{fontSize:7,color:"#555"}}>Nº</span>
                <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",
                  justifyContent:"center",background:numS.bg,border:"2px solid #FFD700",
                  color:numS.text,fontSize:11,fontWeight:"bold"}}>
                  {numAbsence.val}
                </div>
                <span style={{fontSize:7,color:"#888"}}>{numAbsence.ausente}x</span>
              </div>

              {/* Terminal */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <span style={{fontSize:7,color:"#555"}}>TRM</span>
                <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",
                  justifyContent:"center",background:termC+"22",border:"2px solid "+termC,
                  color:termC,fontSize:10,fontWeight:"bold"}}>
                  T{termAbsence.val}
                </div>
                <span style={{fontSize:7,color:"#888"}}>{termAbsence.ausente}x</span>
              </div>
            </div>
          );
        })()}

        {/* Top 5 e Top 2 GP */}
        {entries.length >= 5 && (() => {
          const last50 = entries.slice(-50);
          const numCnt = {};
          last50.forEach(e => { numCnt[e.num]=(numCnt[e.num]||0)+1; });
          const top5 = Object.entries(numCnt).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,c])=>({n:parseInt(n),c}));
          const gpCnt = {};
          last50.forEach(e => { if(e.gp&&e.gp!=="—") gpCnt[e.gp]=(gpCnt[e.gp]||0)+1; });
          const top2gp = Object.entries(gpCnt).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([g,c])=>({g,c}));
          return (
            <div style={{padding:"4px 0",borderTop:"1px solid #1a1a1a",marginTop:4}}>
              <div style={{display:"flex",gap:6,alignItems:"flex-end",marginBottom:6,flexWrap:"wrap"}}>
                <span style={{fontSize:9,color:"#888",letterSpacing:"0.1em",textTransform:"uppercase",flexShrink:0,fontWeight:"bold"}}>TOP 5 ULT 50</span>
                {top5.map(({n,c},i)=>{
                  const cor=getColor(n); const s=NUM_BALL[cor];
                  return (
                    <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <span style={{fontSize:9,color:"#FFD700",fontWeight:"bold"}}>#{i+1}</span>
                      <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:s.bg,border:"2px solid "+s.border,color:s.text,fontSize:10,fontWeight:"bold"}}>{n}</div>
                      <span style={{fontSize:9,color:"#888",fontWeight:"bold"}}>{c}x</span>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const last5gp = entries.slice(-5).map(e=>e.gp).filter(v=>v&&v!=="—");
                const gpAlert = top2gp.find(({g})=>last5gp.filter(v=>v===g).length>=3);
                return gpAlert ? (
                  <div style={{display:"flex",alignItems:"center",gap:6,background:"#1a0a00",border:"2px solid #FFD700",borderRadius:4,padding:"4px 10px",marginBottom:4}}>
                    <span style={{fontSize:9,color:"#FFD700",fontWeight:"bold"}}>⚡ TAKE</span>
                    <span style={{fontSize:12,fontWeight:"bold",color:GP_CELL[gpAlert.g]?.text||"#fff"}}>{gpAlert.g}</span>
                    <span style={{fontSize:9,color:"#FFD700"}}>{last5gp.filter(v=>v===gpAlert.g).length}/5</span>
                  </div>
                ) : null;
              })()}
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:9,color:"#888",letterSpacing:"0.1em",textTransform:"uppercase",flexShrink:0,fontWeight:"bold"}}>TOP 2 GP</span>
                {top2gp.map(({g,c},i)=>{
                  const sch=GP_CELL[g]||{bg:"#111",text:"#aaa"};
                  return (
                    <div key={g} style={{display:"flex",alignItems:"center",gap:4,background:sch.bg,borderRadius:3,padding:"3px 10px",border:"1px solid "+sch.text+"88"}}>
                      <span style={{fontSize:9,color:sch.text,opacity:0.7}}>#{i+1}</span>
                      <span style={{fontSize:13,fontWeight:"bold",color:sch.text}}>{g}</span>
                      <span style={{fontSize:10,color:sch.text,opacity:0.9}}>{c}x</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}



        </>}

        {/* Sinal 3 fichas — coluna dominante + parte + lado/OPO mais consistente */}
        {(() => {
          if(entries.length < 5) return null;
          const l5 = entries.slice(-5);

          // 1. Coluna mais forte com vantagem de 3+ números
          const colCnt = {C1:0,C2:0,C3:0};
          l5.forEach(e=>{ if(colCnt[e.coluna]!==undefined) colCnt[e.coluna]++; });
          const colSorted = Object.entries(colCnt).sort((a,b)=>b[1]-a[1]);
          const [bestCol, bestColCnt] = colSorted[0];
          const [,secondColCnt] = colSorted[1]||["",0];
          // Must have 3+ advantage (e.g. 4-1, 5-0, 3-0)
          if(bestColCnt - secondColCnt < 3) return null;

          // 2. Parte mais evidente nos últimos 5
          const parteCnt = {P1:0,P2:0};
          l5.forEach(e=>{ if(parteCnt[e.parte]!==undefined) parteCnt[e.parte]++; });
          const bestParte = Object.entries(parteCnt).sort((a,b)=>b[1]-a[1])[0][0];

          // 3. Lado race vs OPO — avalia qual tem mais consistência (presença + sequência)
          const ladoCnt = {"PB e VA":0,"PA e VB":0};
          const opoCnt  = {ZERO:0,DEZ:0};
          l5.forEach(e=>{
            if(ladoCnt[e.lado]!==undefined) ladoCnt[e.lado]++;
            if(opoCnt[e.opo]!==undefined)  opoCnt[e.opo]++;
          });
          const bestLado = Object.entries(ladoCnt).sort((a,b)=>b[1]-a[1])[0];
          const bestOpo  = Object.entries(opoCnt).sort((a,b)=>b[1]-a[1])[0];

          // Sequência consecutiva — quem tem mais números seguidos nos últimos 5
          const ladoSeq = (val) => {
            let max=0,cur=0;
            l5.forEach(e=>{ if(e.lado===val){cur++;max=Math.max(max,cur);}else cur=0; });
            return max;
          };
          const opoSeq = (val) => {
            let max=0,cur=0;
            l5.forEach(e=>{ if(e.opo===val){cur++;max=Math.max(max,cur);}else cur=0; });
            return max;
          };

          // Score: count + sequence bonus
          const ladoScore = bestLado[1] + ladoSeq(bestLado[0]);
          const opoScore  = bestOpo[1]  + opoSeq(bestOpo[0]);

          const useOpo = opoScore > ladoScore;
          const thirdKey   = useOpo ? "opo"  : "lado";
          const thirdVal   = useOpo ? bestOpo[0] : bestLado[0];
          const thirdCount = useOpo ? bestOpo[1]  : bestLado[1];
          const thirdFn    = useOpo ? n=>getOpo(n) : n=>getLado(n);
          const thirdSch   = useOpo ? (OPO_CELL[thirdVal]||{bg:"#111",text:"#aaa"}) : (LADO_CELL[thirdVal]||{bg:"#111",text:"#aaa"});

          // Build candidates
          const colSch   = thirdKey==="coluna"?COLUNA_CELL[bestCol]:(bestCol==="C1"?COL_C1_CELL:bestCol==="C2"?COL_C2_CELL:COL_C3_CELL);
          const parteSch = PARTE_CELL[bestParte]||{bg:"#111",text:"#aaa"};

          const cands = [];
          for(let n=1;n<=36;n++){
            if(getColuna(n)!==bestCol) continue;
            if(getParte(n)!==bestParte) continue;
            if(thirdFn(n)!==thirdVal) continue;
            cands.push(n);
          }
          if(cands.length===0) return null;

          // Fusion with analyzer
          const analyzerNums = raScoreAll(entries);
          const analyzerSet  = new Set(analyzerNums.map(x=>x.n));

          return (
            <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap",
              padding:"4px 6px",background:"#0a0a0a",border:"1px solid #333",borderRadius:3,marginBottom:4}}>
              <span style={{fontSize:8,fontWeight:"bold",color:"#aaa",flexShrink:0}}>3F:</span>
              <span style={{fontSize:9,fontWeight:"bold",color:colSch.text,background:colSch.bg,padding:"1px 6px",borderRadius:2}}>{bestCol} {bestColCnt}/5</span>
              <span style={{fontSize:9,fontWeight:"bold",color:parteSch.text,background:parteSch.bg,padding:"1px 6px",borderRadius:2}}>{bestParte}</span>
              <span style={{fontSize:9,fontWeight:"bold",color:thirdSch.text,background:thirdSch.bg,padding:"1px 6px",borderRadius:2}}>{thirdVal} {thirdCount}/5</span>
              <span style={{fontSize:7,color:"#555"}}>▶</span>
              {cands.map(n=>{
                const cor=getColor(n); const s=NUM_BALL[cor];
                const fusion = analyzerSet.has(n);
                return (
                  <div key={n} style={{
                    width:fusion?28:24,height:fusion?28:24,
                    borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                    background:s.bg,
                    border:fusion?"3px solid #FFD700":"2px solid "+s.border,
                    boxShadow:fusion?"0 0 8px #FFD700":"none",
                    color:s.text,fontSize:fusion?11:9,fontWeight:"bold",flexShrink:0}}>
                    {n}
                  </div>
                );
              })}
            </div>
          );
        })()}


        {/* Filtro manual de características */}
        {(() => {
          // MULTI_KEYS: duzia e coluna aceitam até 2 seleções (array), resto é single
          const MULTI_KEYS = ["duzia","coluna"];
          const FILTER_GROUPS = [
            { label:"LADO",   key:"lado",     vals:["PB e VA","PA e VB"],  pal:LADO_CELL },
            { label:"PARTE",  key:"parte",    vals:["P1","P2"],            pal:PARTE_CELL },
            { label:"COR",    key:"cor",      vals:["Vermelho","Preto"],   pal:{"Vermelho":{bg:"#CC0000",text:"#fff"},"Preto":{bg:"#222",text:"#e5e5e5"}} },
            { label:"P/I",    key:"paridade", vals:["Par","Ímpar"],        pal:PAR_CELL },
            { label:"A/B",    key:"altobaixo",vals:["ALTO","BAIXO"],       pal:ALTOBAIXO_CELL },
            { label:"DÚZIA",  key:"duzia",    vals:["D1","D2","D3"],       pal:DUZIA_CELL },
            { label:"COL",    key:"coluna",   vals:["C1","C2","C3"],       pal:COLUNA_CELL },
            { label:"CAVALO", key:"cavalo",   vals:["369","258","147"],     pal:CAVALO_CELL },
            { label:"OPO",    key:"opo",      vals:["ZERO","DEZ"],         pal:OPO_CELL },
            { label:"R/P",    key:"ruaPar",  vals:["R.Ímpar","R.Par"],    pal:RUA_PAR_CELL },
          ];

          const NFLD = {
            lado:n=>getLado(n), parte:n=>getParte(n), cor:n=>getColor(n),
            paridade:n=>getParidade(n), altobaixo:n=>getAltoBaixo(n),
            duzia:n=>getDuzia(n), coluna:n=>getColuna(n),
            cavalo:n=>getCavalo(n), opo:n=>getOpo(n),
          };

          const toggleFilter = (key, val) => {
            setFilterSel(prev => {
              if(MULTI_KEYS.includes(key)){
                const cur = Array.isArray(prev[key]) ? prev[key] : prev[key] ? [prev[key]] : [];
                if(cur.includes(val)){
                  const next = cur.filter(v=>v!==val);
                  const np = {...prev};
                  if(next.length===0) delete np[key]; else np[key]=next;
                  return np;
                }
                if(cur.length>=2) return {...prev, [key]:[cur[1],val]};
                return {...prev, [key]:[...cur,val]};
              } else {
                if(prev[key]===val){ const np={...prev}; delete np[key]; return np; }
                return {...prev, [key]:val};
              }
            });
          };

          const isActive = (key,val) => {
            if(MULTI_KEYS.includes(key)){
              const cur = Array.isArray(filterSel[key]) ? filterSel[key] : filterSel[key] ? [filterSel[key]] : [];
              return cur.includes(val);
            }
            return filterSel[key]===val;
          };

          const activeKeys = Object.keys(filterSel);
          const hasFilter = activeKeys.length > 0;

          const results = hasFilter
            ? Array.from({length:36},(_,i)=>i+1).filter(n =>
                activeKeys.every(k => {
                  const fn = NFLD[k];
                  if(!fn) return true;
                  const sel = filterSel[k];
                  if(Array.isArray(sel)) return sel.includes(fn(n));
                  return fn(n) === sel;
                })
              )
            : [];

          return (
            <div style={{padding:"8px 0",borderTop:"1px solid #CC0000",marginTop:4}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:8,color:"#CC0000",fontWeight:"bold",letterSpacing:"0.1em",textTransform:"uppercase"}}>◆ FILTRO</span>
                {hasFilter && (
                  <button onClick={()=>setFilterSel({})}
                    style={{fontSize:7,color:"#555",background:"transparent",border:"1px solid #333",borderRadius:2,padding:"1px 6px",cursor:"pointer"}}>
                    limpar
                  </button>
                )}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                {FILTER_GROUPS.map(({label,key,vals,pal})=>(
                  <div key={key} style={{display:"flex",alignItems:"center",gap:3}}>
                    <span style={{fontSize:7,color:"#444",minWidth:28,textAlign:"right"}}>{label}</span>
                    {vals.map(val=>{
                      const sch = pal[val]||{bg:"#111",text:"#888"};
                      const active = isActive(key,val);
                      return (
                        <button key={val} onClick={()=>toggleFilter(key,val)}
                          style={{
                            fontSize:9,fontWeight:"bold",
                            color: active ? sch.text : "#444",
                            background: active ? sch.bg : "#0d0d0d",
                            border: active ? "2px solid "+sch.text+"aa" : "1px solid #222",
                            borderRadius:2,padding:"2px 7px",cursor:"pointer",
                            fontFamily:"Arial, sans-serif",
                            transition:"all 0.15s",
                            boxShadow: active ? "0 0 6px "+sch.bg : "none",
                          }}>
                          {val==="Vermelho"?"VRM":val==="Preto"?"PRT":val}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              {hasFilter && (
                <div style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:7,color:"#CC0000",fontWeight:"bold",flexShrink:0}}>▶</span>
                  {results.length > 0 ? results.map(n=>{
                    const cor=getColor(n); const s=NUM_BALL[cor];
                    return (
                      <div key={n} style={{width:26,height:26,borderRadius:"50%",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        background:s.bg,border:"2px solid "+s.border,
                        color:s.text,fontSize:11,fontWeight:"bold",flexShrink:0}}>
                        {n}
                      </div>
                    );
                  }) : <span style={{fontSize:9,color:"#333",fontStyle:"italic"}}>nenhum número</span>}
                </div>
              )}
            </div>
          );
        })()}

      </div>{/* fim rodapé */}
      </div>{/* fim coluna central */}

      <div style={{width:220,flexShrink:0}}/>
      {/* ── Painel lateral: Pair Catalog ── */}
      <div style={{width:220,background:"#080808",borderLeft:"1px solid #1e1e1e",flexShrink:0,display:"flex",flexDirection:"column",height:"100vh",position:"fixed",top:0,right:0,zIndex:50}}>
        <CatalogFooterStats entries={entries} terminalStats={terminalStats}/>
        <div style={{flex:1,overflowY:"auto"}}>
          <PairCatalog sharedEntries={entries}/>
        </div>
        <MicroGroupCard entries={entries}/>
        <TerminalPullAnalysis entries={entries}/>
        <QuadrantSignal entries={entries}/>
        <TargetNumbers entries={entries}/>
      </div>
    </div>
  );
}

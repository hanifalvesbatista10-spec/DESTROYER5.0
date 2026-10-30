// Sinais da tabela DESTROYER, copiados do App.jsx já com os 24 patches aplicados
// (a lógica é a mesma da tela; só tirei cores e JSX). Cada função recebe as
// entradas até o giro atual e devolve os números que o sinal manda jogar agora.
// Se a lógica da tabela mudar, atualize aqui e rode o teste de paridade.
/* eslint-disable no-unused-vars */

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
function getPCA(n) {
  if ([2,4,6,13,15,17].includes(n)) return "P1.P.B";
  if ([1,3,5,14,16,18].includes(n)) return "P1.V.B";
  if ([20,22,24,31,33,35].includes(n)) return "P2.P.A";
  if ([19,21,23,32,34,36].includes(n)) return "P2.V.A";
  return "—";
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

function getGrupoDezena(n) {
  if (n >= 0 && n <= 9) return "0";
  if (n >= 10 && n <= 19) return "10";
  if (n >= 20 && n <= 29) return "20";
  if (n >= 30 && n <= 36) return "30";
  return "—";
}

const OPO_MAP = {
  "ZERO": new Set([26,3,35,12,28,7,29,18,22,32,15,19,4,21,2,25,17,34]),
  "DEZ":  new Set([6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9]),
};

const GRUPO_DEZENA_CELL = {
  "0":  {bg:"#14532d", text:"#bbf7d0"},
  "10": {bg:"#1e3a8a", text:"#bfdbfe"},
  "20": {bg:"#9a3412", text:"#fed7aa"},
  "30": {bg:"#581c87", text:"#e9d5ff"},
  "—":  {bg:"#111",   text:"#444"},
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
    paridade:getParidade(n), gp:getGP(n), rua:getRua(n), coluna:getColuna(n), parte:getParte(n), altobaixo:getAltoBaixo(n), setor:getSetor(n), regtrack:getRegTrack(n), cavalo:getCavalo(n), grupoDezena:getGrupoDezena(n), fra:getFra(n), opo:getOpo(n), pca:getPCA(n) };
}

const RACETRACK = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
function getRaceNeighbors(n) {
  const idx = RACETRACK.indexOf(n);
  if (idx === -1) return new Set();
  const len = RACETRACK.length;
  return new Set([RACETRACK[(idx-1+len)%len], RACETRACK[(idx+1)%len]]);
}


const BINARY_FIELDS = [
  {k:"parte",    fn:e=>e.parte,    label:"PTE", vals:["P1","P2"]},
  {k:"lado",     fn:e=>e.lado,     label:"LADO",vals:["PB e VA","PA e VB"]},
  {k:"altobaixo",fn:e=>e.altobaixo,label:"A/B", vals:["ALTO","BAIXO"]},
  {k:"paridade", fn:e=>e.paridade, label:"P/I",  vals:["Par","Ímpar"]},
];

const MULTI_FIELDS = [
  {k:"regiao",  fn:e=>e.regiao,  label:"ZNA"},
  {k:"gp",      fn:e=>e.gp,      label:"GP"},
  {k:"setor",   fn:e=>e.setor,   label:"SET"},
  {k:"regtrack",fn:e=>e.regtrack,label:"RGT"},
  {k:"fra",     fn:e=>e.fra,     label:"FRA"},
  {k:"opo",     fn:e=>e.opo,     label:"OPO"},
  {k:"pca",     fn:e=>e.pca,     label:"P/C/A"},
];

const PAIR_INTERVAL_FIELDS = [
  {k:"coluna", fn:e=>e.coluna, label:"COL"},
  {k:"rua",    fn:e=>e.rua,    label:"RUA"},
  {k:"regiao", fn:e=>e.regiao, label:"ZNA"},
  {k:"cavalo", fn:e=>e.cavalo, label:"CAV"},
];


function detectRules(entries) {
  const signals = [];
  if(entries.length < 6) return signals;
  const last20 = entries.slice(-20);
  const allFields = [...BINARY_FIELDS, ...MULTI_FIELDS];

  allFields.forEach(({fn,label}) => {
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
        
        signals.push({rule:1, label, val:A, desc:"3+2 → próx "+A});
      }
    }

    if(n >= 6) {
      const a = seq[n-6]; const b = seq[n-5];
      if(n>=6 &&
        seq[n-6]===a && seq[n-5]===b && seq[n-4]===b &&
        seq[n-3]===a && seq[n-2]===b && seq[n-1]===b &&
        a !== b
      ) {
        
        signals.push({rule:2, label, val:b, desc:"ABBA → próx "+b});
      }
      if(n>=5 &&
        seq[n-5]===seq[n-2] &&
        seq[n-4]===seq[n-3] && seq[n-4]===seq[n-1] &&
        seq[n-5]!==seq[n-4]
      ) {
        const bVal = seq[n-1];
        
        signals.push({rule:2, label, val:bVal, desc:"A BB A B → próx "+bVal});
      }
    }
  });

  PAIR_INTERVAL_FIELDS.forEach(({fn,label}) => {
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
        
        signals.push({ rule:3, label, val, desc: distanceToNext===0 ? "Par "+val+" AGORA!" : "Par "+val+" em "+distanceToNext });
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


function getHistorico(entries, currentIndex, num) {
  const nexts = [];
  for (let i = 0; i < currentIndex; i++) {
    if (entries[i].num === num && i + 1 < entries.length) { nexts.push(entries[i + 1]); }
  }
  return nexts.slice(-5);
}


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

// Sinais RADAR, QUADRANTE, TERMINAL e DOMINÂNCIA (bloco signalFeedback do App.jsx).
// Para cada giro i devolve o conjunto de números do sinal formado depois dele.
export function sinaisFeedback(entries) {
    if (!entries || entries.length < 2) return [];

    const events = [];
    const TERM_MEMBERS = {
      0:[0,10,20,30],1:[1,11,21,31],2:[2,12,22,32],3:[3,13,23,33],
      4:[4,14,24,34],5:[5,15,25,35],6:[6,16,26,36],7:[7,17,27],8:[8,18,28],9:[9,19,29]
    };
    const getTerminalLocal = (n) => {
      for (const [t,members] of Object.entries(TERM_MEMBERS)) if (members.includes(n)) return parseInt(t);
      return null;
    };
    const terminalCoverage = (t) => {
      const out = new Set(TERM_MEMBERS[t] || []);
      (TERM_MEMBERS[t] || []).forEach(n => getRaceNeighbors(n).forEach(v => out.add(v)));
      return out;
    };
    const dominantLocal = (arr, getter) => {
      const vals = arr.map(getter).filter(v=>v && v!=="—" && v!=="0");
      const cnt = {};
      vals.forEach(v=>cnt[v]=(cnt[v]||0)+1);
      return Object.entries(cnt).sort((a,b)=>b[1]-a[1] || vals.lastIndexOf(b[0])-vals.lastIndexOf(a[0]))[0] || null;
    };

    for (let i=0; i<entries.length; i++) {
      const snap = entries.slice(0,i+1);
      const current = snap[snap.length-1];
      if (!current) continue;

      // RADAR: se havia leitura forte de repetição da casa atual,
      // o próximo número apenas confirma ou não essa casa.
      if (snap.length >= 6) {
        const currentHouse = current.grupoDezena || getGrupoDezena(current.num);
        let total=0, repeats=0;
        for(let j=0;j<snap.length-1;j++){
          const aHouse=snap[j].grupoDezena||getGrupoDezena(snap[j].num);
          if(aHouse!==currentHouse) continue;
          total++;
          const bHouse=snap[j+1].grupoDezena||getGrupoDezena(snap[j+1].num);
          if(bHouse===currentHouse) repeats++;
        }
        const pct=total?Math.round(repeats/total*100):0;
        if(total>=4 && pct>=60){
          events.push({i,type:"RADAR",bet:[...Array(37).keys()].filter(n=>getGrupoDezena(n)===currentHouse)});
        }
      }

      // QUADRANTE: congela os números que apareciam no quadrante e observa somente o próximo número.
      if (snap.length >= 14) {
        const last5=snap.slice(-5), last14=snap.slice(-14);
        const colCnt={};
        last5.forEach(e=>{if(e.coluna&&e.coluna!=="0"&&e.coluna!=="—") colCnt[e.coluna]=(colCnt[e.coluna]||0)+1;});
        const colVals=last5.map(e=>e.coluna);
        const top2cols=Object.entries(colCnt).sort((a,b)=>b[1]-a[1]||colVals.lastIndexOf(b[0])-colVals.lastIndexOf(a[0])).slice(0,2).map(([c])=>c);
        const bestParte=dominantLocal(last5,e=>e.parte);
        const duz14=dominantLocal(last14,e=>e.duzia), duz5=dominantLocal(last5,e=>e.duzia);
        if(top2cols.length && bestParte && duz14 && duz5 && duz14[0]===duz5[0]){
          const targets=[];
          for(let n=1;n<=36;n++) if(top2cols.includes(getColuna(n))&&getParte(n)===bestParte[0]&&getDuzia(n)===duz14[0]) targets.push(n);
          if(targets.length){
            events.push({i,type:"QUADRANTE",bet:targets});
          }
        }
      }

      // TERMINAL PUXA TERMINAL: TAKE se o próximo cair no terminal indicado
      // ou em 1 vizinho de cada lado no Race.
      if (snap.length >= 10) {
        const srcT=getTerminalLocal(current.num);
        if(srcT!==null){
          const occ=[];
          const members=TERM_MEMBERS[srcT];
          for(let j=snap.length-2;j>=0&&occ.length<3;j--){
            if(members.includes(snap[j].num)){
              const t=getTerminalLocal(snap[j+1].num);
              if(t!==null) occ.push(t);
            }
          }
          if(occ.length>=2){
            const cnt={}; occ.forEach(t=>cnt[t]=(cnt[t]||0)+1);
            const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
            if(best && best[1]>=2){
              const dstT=parseInt(best[0]);
              events.push({i,type:"TERMINAL",bet:[...terminalCoverage(dstT)]});
            }
          }
        }
      }

      // DOMINÂNCIA: cruza todas as dominâncias ativas naquele momento.
      // Se o próximo número estiver no conjunto resultante, TAKE; senão FAIL.
      if (snap.length >= 3) {
        const last6=snap.slice(-6);
        const defs = [
          {vals:["0","10","20","30"],fn:n=>getGrupoDezena(n)},
          {vals:["P1","P2"],fn:n=>getParte(n)},
          {vals:["C1","C2","C3"],fn:n=>getColuna(n)},
          {vals:["PB e VA","PA e VB"],fn:n=>getLado(n)},
          {vals:["ZERO","DEZ"],fn:n=>getOpo(n)},
          {vals:["D1","D2","D3"],fn:n=>getDuzia(n)},
          {vals:["Vermelho","Preto","Verde"],fn:n=>getColor(n)},
          {vals:["ALTO","BAIXO"],fn:n=>getAltoBaixo(n)},
          {vals:["Par","Ímpar"],fn:n=>getParidade(n)},
          {vals:["Tier","Orphelins","Voisins"],fn:n=>getRegiao(n)},
          {vals:["369","258","147"],fn:n=>getCavalo(n)},
          {vals:["32-29","25-30","15-2","8-24","16-18"],fn:n=>getRegTrack(n)},
          {vals:["S1","S2","S3","S4","S5","S6"],fn:n=>getSetor(n)},
          {vals:["R1","R2","R3","R4","0"],fn:n=>getRua(n)},
          {vals:["R.Ímpar","R.Par"],fn:n=>getRuaParidade(n)},
          {vals:["F1e","F2e","F3e","F1d","F2d","F3d"],fn:n=>getFra(n)},
        ];
        const active=[];
        defs.forEach(d=>{
          d.vals.forEach(v=>{
            const c=last6.filter(e=>d.fn(e.num)===v).length;
            if(c/last6.length>=0.8) active.push({fn:d.fn,val:v});
          });
        });
        if(active.length){
          const targets=[];
          for(let n=0;n<=36;n++) if(active.every(d=>d.fn(n)===d.val)) targets.push(n);
          if(targets.length) events.push({i,type:"DOMINÂNCIA",bet:targets});
        }
      }
    }

    return events;
}

// Painel ALVOS ULT 5 (TargetNumbers do App.jsx).
function alvosUlt5(entries) {
  if(!entries || entries.length < 5) return { targets: [], top2cols: [], analyzerNums: raScoreAll(entries) };
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

  const bestDuz5  = dominant(last5, 'duzia');
  const last10 = entries.slice(-10);
  const bestDuz10 = dominant(last10, 'duzia');
  const bestLado  = dominant(last5, 'lado');
  const bestParte = dominant(last5, 'parte');
  if(!bestLado || !bestParte) return { targets: [], top2cols: [], analyzerNums: raScoreAll(entries) };

  const uniqueLeader = (arr, key, leader) => {
    if(!leader) return false;
    const counts = {};
    arr.forEach(e => {
      const v = e?.[key];
      if(v && v !== "—") counts[v] = (counts[v] || 0) + 1;
    });
    const sorted = Object.values(counts).sort((a,b)=>b-a);
    return sorted.length > 0 && sorted[0] === leader[1] && (sorted.length === 1 || sorted[0] > sorted[1]);
  };

  const duziaConfirmada = !!(
    bestDuz5 && bestDuz10 &&
    bestDuz5[0] === bestDuz10[0] &&
    uniqueLeader(last5, 'duzia', bestDuz5) &&
    uniqueLeader(last10, 'duzia', bestDuz10)
  );

  const bestDuz = duziaConfirmada ? bestDuz5 : null;

  // Analyzer engine signal
  const analyzerNums = raScoreAll(entries);
  const analyzerSet = new Set(analyzerNums.map(x=>x.n));

  const duz = bestDuz ? bestDuz[0] : null;
  const duzQty = bestDuz ? bestDuz[1] : 0;
  const duz10Qty = bestDuz10 && bestDuz && bestDuz10[0] === bestDuz[0] ? bestDuz10[1] : 0;
  const [lado, ladoQty] = bestLado;
  const [parte, parteQty] = bestParte;

  // Find numbers matching all 3
  const targets = [];
  for(let n=1;n<=36;n++){
    if(getDuzia(n)===duz && getLado(n)===lado && getParte(n)===parte) targets.push(n);
  }
  if(targets.length===0) return { targets: [], top2cols: [], analyzerNums: raScoreAll(entries) };

  // 2 strongest columns in last 5 — tie-break by recency
  const colDom = dominant(last5, 'coluna');
  const colCnt = {};
  last5.forEach(e=>{ if(e.coluna&&e.coluna!=="0"&&e.coluna!=="—") colCnt[e.coluna]=(colCnt[e.coluna]||0)+1; });
  const colVals = last5.map(e=>e.coluna);
  const top2cols = Object.entries(colCnt).sort((a,b)=>{
    if(b[1]!==a[1]) return b[1]-a[1];
    return colVals.lastIndexOf(b[0]) - colVals.lastIndexOf(a[0]);
  }).slice(0,2).map(([c])=>c);

  return { targets, top2cols, analyzerNums };
}

// Painel SINAIS (SignalsPanel do App.jsx), só a parte que escolhe os números.
function painelSinais(entries) {
  if (!entries.length) return [];
  const lastEntry = entries[entries.length - 1];
  const puxadoHist = getHistorico(entries, entries.length - 1, lastEntry.num);

  const NFIELD = {
    cor:n=>getColor(n), lado:n=>getLado(n), altobaixo:n=>getAltoBaixo(n),
    paridade:n=>getParidade(n), parte:n=>getParte(n), cavalo:n=>getCavalo(n),
    regiao:n=>getRegiao(n), duzia:n=>getDuzia(n), coluna:n=>getColuna(n),
    ruaPar:n=>getRuaParidade(n), pca:n=>getPCA(n),
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

  return step2;
}

// Sinal 3F, "3 fichas" (bloco escrito direto na tela do App.jsx): coluna com
// vantagem de 3+ nos últimos 5 + parte dominante + Lado ou OPO mais consistente.
function tresFichas(entries) {
          if(entries.length < 5) return [];
          const l5 = entries.slice(-5);

          // 1. Coluna mais forte com vantagem de 3+ números
          const colCnt = {C1:0,C2:0,C3:0};
          l5.forEach(e=>{ if(colCnt[e.coluna]!==undefined) colCnt[e.coluna]++; });
          const colSorted = Object.entries(colCnt).sort((a,b)=>b[1]-a[1]);
          const [bestCol, bestColCnt] = colSorted[0];
          const [,secondColCnt] = colSorted[1]||["",0];
          // Must have 3+ advantage (e.g. 4-1, 5-0, 3-0)
          if(bestColCnt - secondColCnt < 3) return [];

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
          // Build candidates

          const cands = [];
          for(let n=1;n<=36;n++){
            if(getColuna(n)!==bestCol) continue;
            if(getParte(n)!==bestParte) continue;
            if(thirdFn(n)!==thirdVal) continue;
            cands.push(n);
          }
          if(cands.length===0) return [];
  return cands;
}

const NUMEROS = Array.from({ length: 37 }, (_, n) => buildEntry(n, n));
const numerosCom = (pred) => NUMEROS.filter(pred).map(e => e.num);
const REGRAS = { 1: "REGRA 3+2", 2: "REGRA ABBA", 3: "REGRA PAR/INTERVALO" };
const TODOS_CAMPOS = [...BINARY_FIELDS, ...MULTI_FIELDS, ...PAIR_INTERVAL_FIELDS];

// Sinais que a tabela mostra para o momento atual (entradas até o último giro).
// Devolve [{ tipo, nums }]; um tipo pode aparecer mais de uma vez (regras).
export function sinaisDoMomento(snap) {
  const out = [];
  const push = (tipo, nums) => { if (nums.length) out.push({ tipo, nums }); };
  const a = alvosUlt5(snap);
  const ana = a.analyzerNums.map(x => x.n);
  push("ALVOS ULT 5", a.targets);
  push("ALVOS + COLUNA", a.targets.filter(n => a.top2cols.includes(getColuna(n))));
  push("FUSÃO ⚡", a.targets.filter(n => ana.includes(n)));
  push("ANALISADOR", ana);
  push("ANALISADOR tier A", a.analyzerNums.filter(x => x.tier === "A").map(x => x.n));
  push("SINAIS (painel)", painelSinais(snap));
  push("3F (3 fichas)", tresFichas(snap));
  const last = snap[snap.length - 1], prev = snap[snap.length - 2];
  if (prev && last.duzia === "D2" && (prev.duzia === "D1" || prev.duzia === "D3"))
    push("ALERTA DÚZIA", numerosCom(e => e.duzia === (prev.duzia === "D1" ? "D3" : "D1")));
  if (prev && last.coluna === "C2" && (prev.coluna === "C1" || prev.coluna === "C3"))
    push("ALERTA COLUNA", numerosCom(e => e.coluna === (prev.coluna === "C1" ? "C3" : "C1")));
  for (const r of detectRules(snap)) {
    const f = TODOS_CAMPOS.find(f => f.label === r.label);
    push(REGRAS[r.rule], numerosCom(e => f.fn(e) === r.val));
  }
  return out;
}

export const TIPOS_TABELA = ["RADAR", "QUADRANTE", "TERMINAL", "DOMINÂNCIA", "ALVOS ULT 5", "ALVOS + COLUNA", "FUSÃO ⚡",
  "ANALISADOR", "ANALISADOR tier A", "SINAIS (painel)", "3F (3 fichas)", "ALERTA DÚZIA", "ALERTA COLUNA", "REGRA 3+2", "REGRA ABBA", "REGRA PAR/INTERVALO"];

// Passa por uma sessão giro a giro. Para cada giro i (0 = primeiro número)
// lista os sinais formados com as entradas 0..i, que valem para o giro i+1.
export function sinaisDaSessao(nums) {
  const entries = nums.map((n, i) => buildEntry(n, i));
  const porGiro = entries.map(() => []);
  for (const e of sinaisFeedback(entries)) porGiro[e.i].push({ tipo: e.type, nums: e.bet });
  for (let i = 0; i < entries.length; i++) porGiro[i].push(...sinaisDoMomento(entries.slice(0, i + 1)));
  return porGiro;
}

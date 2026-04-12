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
function getColor(n)    { if(n===0) return "Verde"; if(RED_NUMS.has(n)) return "Vermelho"; return "Preto"; }
function getLado(n)     { return LADO_RACE[n]||"—"; }
function getRegiao(n)   { if(TIER_NUMS.has(n)) return "Tier"; if(ORPHELINS.has(n)) return "Orphelins"; return "Voisins"; }
function getDuzia(n)    { if(n===0) return "—"; if(n<=12) return "D1"; if(n<=24) return "D2"; return "D3"; }
function getParidade(n) { if(n===0) return "—"; return n%2===0?"Par":"Ímpar"; }
function getCorAbrev(c) { return c==="Vermelho"?"VRM":c==="Preto"?"PRT":"VRD"; }
function getGP(n)       { return GP_MAP[n]||"—"; }

function buildEntry(n, id) {
  return { id, num:n, cor:getColor(n), corAbrev:getCorAbrev(getColor(n)),
    lado:getLado(n), regiao:getRegiao(n), duzia:getDuzia(n),
    paridade:getParidade(n), gp:getGP(n), rua:getRua(n), coluna:getColuna(n), parte:getParte(n) };
}
function parseInput(raw) {
  return raw.split(/[\s,;\n\r]+/).map(t=>parseInt(t.trim())).filter(n=>!isNaN(n)&&n>=0&&n<=36);
}

const NUM_BALL  = { Vermelho:{bg:"#CC0000",border:"#ff6666",text:"#fff"}, Preto:{bg:"#111",border:"#555",text:"#fff"}, Verde:{bg:"#1B7A3E",border:"#4ade80",text:"#fff"} };
const COR_CELL  = { Vermelho:{bg:"#CC0000",text:"#fff"}, Preto:{bg:"#111",text:"#ddd"}, Verde:{bg:"#1B7A3E",text:"#fff"} };
const LADO_CELL = { "PB e VA":{bg:"#6b0f1a",text:"#ffb3bb"}, "PA e VB":{bg:"#1e3a5f",text:"#93c5fd"}, "—":{bg:"#111",text:"#444"} };
const REGIAO_CELL = { Tier:{bg:"#7c2d12",text:"#fdba74"}, Orphelins:{bg:"#854d0e",text:"#fefce8"}, Voisins:{bg:"#166534",text:"#bbf7d0"} };
const DUZIA_CELL  = { D1:{bg:"#1e3a8a",text:"#bfdbfe"}, D2:{bg:"#92400e",text:"#fde68a"}, D3:{bg:"#7f1d1d",text:"#fca5a5"}, "—":{bg:"#111",text:"#444"} };
const PAR_CELL    = { Par:{bg:"#0f1f5c",text:"#bfdbfe"}, Ímpar:{bg:"#4b5563",text:"#e5e7eb"}, "—":{bg:"#111",text:"#444"} };
const PARTE_CELL = {
  "P1": { bg:"#713f00", text:"#fef08a" },  // amarelo claro
  "P2": { bg:"#14532d", text:"#bbf7d0" },  // verde claro
  "—":  { bg:"#111",   text:"#444"    },
};
const RUA_CELL    = { R1:{bg:"#4a0080",text:"#e9d5ff"}, R2:{bg:"#005a5a",text:"#99f6e4"}, R3:{bg:"#7a1c4b",text:"#fbcfe8"}, R4:{bg:"#1a3a1a",text:"#bbf7d0"}, "0":{bg:"#1B7A3E",text:"#fff"} };
const COLUNA_CELL = { C1:{bg:"#4a5320",text:"#e5e5e5"}, C2:{bg:"#0891b2",text:"#0a0a0a"}, C3:{bg:"#ea580c",text:"#1a1a1a"}, "0":{bg:"#1B7A3E",text:"#fff"} };
const RUA_PAR_CELL = { "R. Ímpar":{bg:"#4a0080",text:"#e9d5ff"}, "R. Par":{bg:"#005a5a",text:"#99f6e4"} };
const GOLD = "#D4AF37";

// CELL_VAL: valor exibido na célula
const CELL_VAL = (e, key) => {
  if (key==="cor")      return e.corAbrev;
  if (key==="lado")     return e.lado;
  if (key==="duzia")    return e.duzia;
  if (key==="paridade") return e.paridade.toUpperCase();
  if (key==="coluna")   return e.coluna;
  if (key==="rua")      return e.rua;
  if (key==="regiao")   return e.regiao.toUpperCase();
  if (key==="parte")    return e.parte;
  return "";
};
// CELL_SCHEME: lookup key correto para a paleta (diferente do valor exibido)
const CELL_SCHEME = (e, key) => {
  if (key==="cor")      return COR_CELL[e.cor]         || {bg:"#111",text:"#fff"};
  if (key==="lado")     return LADO_CELL[e.lado]        || LADO_CELL["—"];
  if (key==="duzia")    return DUZIA_CELL[e.duzia]      || DUZIA_CELL["—"];
  if (key==="paridade") return PAR_CELL[e.paridade]     || PAR_CELL["—"];
  if (key==="coluna")   return COLUNA_CELL[e.coluna]    || {bg:"#111",text:"#fff"};
  if (key==="rua")      return RUA_CELL[e.rua]          || {bg:"#111",text:"#fff"};
  if (key==="regiao")   return REGIAO_CELL[e.regiao]    || {bg:"#111",text:"#fff"};
  if (key==="parte")    return PARTE_CELL[e.parte]      || PARTE_CELL["—"];
  return {bg:"#111",text:"#fff"};
};

const INIT_COLS = [
  { key:"seq",      label:"#",         toggleable:false },
  { key:"num",      label:"Nº",        toggleable:false },
  { key:"hist",     label:"PUXOU",     toggleable:false },
  { key:"parte",    label:"PARTE",     toggleable:true  },
  { key:"cor",      label:"COR",       toggleable:true  },
  { key:"lado",     label:"LADO RACE", toggleable:true  },
  { key:"duzia",    label:"DÚZIA",     toggleable:true  },
  { key:"paridade", label:"PAR/ÍMPAR", toggleable:true  },
  { key:"coluna",   label:"COLUNA",    toggleable:true  },
  { key:"rua",      label:"RUA",       toggleable:true  },
  { key:"regiao",   label:"REGIÃO",    toggleable:true  },
];

// Retorna os numeros que saíram APÓS cada ocorrência anterior do mesmo num
function getHistorico(entries, currentIndex, num) {
  const nexts = [];
  for (let i = 0; i < currentIndex; i++) {
    if (entries[i].num === num && i + 1 < entries.length) {
      nexts.push(entries[i + 1]);
    }
  }
  return nexts.slice(-5);
}


// ── Painel Repetição / Alternância ───────────────────────────────────────────
// Para cada valor específico de um campo, conta rep (saiu de novo na próxima) e alt (não saiu)
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
  { key:"regiao",   label:"Região",    values:["Tier","Orphelins","Voisins"],       palette:{"Tier":{bg:"#7c2d12",text:"#fdba74"},"Orphelins":{bg:"#854d0e",text:"#fefce8"},"Voisins":{bg:"#166534",text:"#bbf7d0"}} },
];

function RepAltPanel({ last14 }) {
  if (last14.length < 2) return <div style={{color:"#333",fontSize:10,padding:"8px 0"}}>Insira ao menos 2 números</div>;
  return (
    <div>
      {RA_FIELDS.map(({key, label, values, palette}) => (
        <div key={key} style={{marginBottom:10}}>
          <div style={{fontSize:7,letterSpacing:"0.12em",color:"#666",textTransform:"uppercase",marginBottom:4,borderBottom:"0.5px solid #1e1e1e",paddingBottom:2}}>{label}</div>
          {values.map(val => {
            const {rep, alt, repPct, altPct, total} = calcRepAltPerValue(last14, key, val);
            if (total === 0) return null;
            const p = palette[val] || {bg:"#222",text:"#aaa"};
            return (
              <div key={val} style={{marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:2}}>
                  <div style={{background:p.bg,color:p.text,fontSize:7,fontWeight:"bold",padding:"1px 4px",borderRadius:1,minWidth:36,textAlign:"center",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{val}</div>
                  <div style={{flex:1}}/>
                </div>
                {/* REP */}
                <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:1}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",flexShrink:0}}/>
                  <div style={{width:18,fontSize:7,color:"#22c55e"}}>REP</div>
                  <div style={{flex:1,height:7,background:"#1a1a1a",borderRadius:1,overflow:"hidden"}}>
                    <div style={{height:"100%",width:repPct+"%",background:"#166534",transition:"width 0.4s"}}/>
                  </div>
                  <div style={{width:22,fontSize:7,color:"#22c55e",textAlign:"right"}}>{repPct}%</div>
                  <div style={{width:10,fontSize:7,color:"#444",textAlign:"right"}}>{rep}</div>
                </div>
                {/* ALT */}
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#f97316",flexShrink:0}}/>
                  <div style={{width:18,fontSize:7,color:"#f97316"}}>ALT</div>
                  <div style={{flex:1,height:7,background:"#1a1a1a",borderRadius:1,overflow:"hidden"}}>
                    <div style={{height:"100%",width:altPct+"%",background:"#7c2d12",transition:"width 0.4s"}}/>
                  </div>
                  <div style={{width:22,fontSize:7,color:"#f97316",textAlign:"right"}}>{altPct}%</div>
                  <div style={{width:10,fontSize:7,color:"#444",textAlign:"right"}}>{alt}</div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Score de Rep/Alt ─────────────────────────────────────────────────────────
function ScorePanel({ last14 }) {
  if (last14.length < 2) return null;

  const fields = ["cor","lado","paridade","parte","regiao"];
  let totalRep = 0, totalAlt = 0;
  fields.forEach(field => {
    const vals = [...new Set(last14.map(e => e[field]||"—").filter(v=>v!=="—"))];
    vals.forEach(val => {
      const {rep, alt} = calcRepAltPerValue(last14, field, val);
      totalRep += rep;
      totalAlt += alt;
    });
  });

  const total = totalRep + totalAlt;
  if (total === 0) return null;
  const score = Math.round((totalRep / total) * 100);
  const isRepDominant = score >= 70;
  const isAltDominant = score <= 30;
  const isExtreme = isRepDominant || isAltDominant;
  const scoreColor = score >= 60 ? "#22c55e" : score <= 40 ? "#f97316" : "#facc15";
  const label = score >= 60 ? "REPETIÇÃO" : score <= 40 ? "ALTERNÂNCIA" : "NEUTRO";
  const labelColor = score >= 60 ? "#22c55e" : score <= 40 ? "#f97316" : "#facc15";

  return (
    <div style={{
      marginTop:14,
      border: isExtreme ? "2px solid " + scoreColor : "0.5px solid #2a2a2a",
      borderRadius:4,
      padding:"10px 10px",
      background:"#0d0d0d",
      animation: isExtreme ? "pulseBorder 0.9s ease-in-out infinite" : "none",
      outline: isExtreme ? "2px solid " + scoreColor : "none",
      outlineOffset: isExtreme ? "-2px" : "0",
    }}>
      <div style={{fontSize:7,letterSpacing:"0.15em",color:"#555",textTransform:"uppercase",marginBottom:8}}>Score Geral</div>
      {/* Barra de score */}
      <div style={{position:"relative",height:14,background:"#1a1a1a",borderRadius:2,overflow:"hidden",marginBottom:6}}>
        <div style={{
          position:"absolute",left:0,top:0,height:"100%",
          width:score+"%",
          background: score>=60?"#166534":score<=40?"#7c2d12":"#713f00",
          transition:"width 0.5s ease",
        }}/>
        <div style={{
          position:"absolute",left:"50%",top:0,bottom:0,width:"1px",background:"#444"
        }}/>
      </div>
      {/* Valor e label */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:20,fontWeight:"bold",color:scoreColor,fontFamily:"Arial, sans-serif"}}>{score}</span>
        <span style={{fontSize:9,fontWeight:"bold",color:labelColor,letterSpacing:"0.08em"}}>{label}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{fontSize:7,color:"#444"}}>ALT ← 0</span>
        <span style={{fontSize:7,color:"#444"}}>100 → REP</span>
      </div>
    </div>
  );
}

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
              <div style={{height:"100%",width:`${pct}%`,background:p.bg,transition:"width 0.4s ease",boxSizing:"border-box",border:p.bg==="#111111"?"1px solid rgba(255,255,255,0.4)":"none"}}/>
            </div>
            <div style={{width:14,fontSize:8,color:"#ccc",textAlign:"right",fontFamily:"Arial, sans-serif",flexShrink:0}}>{v}</div>
          </div>
        );
      })}
    </div>
  );
}

let idCounter = 0;

export default function DestroyerRaceTable() {
  const [entries, setEntries] = useState([]);
  const [input, setInput]     = useState("");
  const [colOrder, setColOrder] = useState(() => INIT_COLS.map(c=>c.key));
  const [hidden, setHidden]     = useState(new Set());
  const [acertos, setAcertos]   = useState(0);
  const [erros, setErros]       = useState(0);

  const dragKey   = useRef(null);
  const dragOver  = useRef(null);

  const cols = colOrder.map(k => INIT_COLS.find(c=>c.key===k));

  const toggleHide = (key) => {
    if (!INIT_COLS.find(c=>c.key===key)?.toggleable) return;
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const onDragStart = (key) => { dragKey.current = key; };
  const onDragEnter = (key) => { dragOver.current = key; };
  const onDragEnd   = () => {
    const from = dragKey.current, to = dragOver.current;
    if (!from || !to || from===to) { dragKey.current=null; dragOver.current=null; return; }
    setColOrder(prev => {
      const arr = [...prev];
      const fi = arr.indexOf(from), ti = arr.indexOf(to);
      arr.splice(fi,1); arr.splice(ti,0,from);
      return arr;
    });
    dragKey.current=null; dragOver.current=null;
  };

  const last14 = useMemo(()=>entries.slice(-14),[entries]);

  const stats = useMemo(()=>({
    cor:      countBy(last14,"cor",      ["Vermelho","Preto","Verde"]),
    lado:     countBy(last14,"lado",     ["PB e VA","PA e VB"]),
    regiao:   countBy(last14,"regiao",   ["Tier","Orphelins","Voisins"]),
    duzia:    countBy(last14,"duzia",    ["D1","D2","D3"]),
    paridade: countBy(last14,"paridade", ["Par","Ímpar"]),
    coluna:   countBy(last14,"coluna",   ["C1","C2","C3"]),
    parte:    countBy(last14,"parte",    ["P1","P2"]),
    ruaParidade: (()=>{ const imp=last14.filter(e=>e.rua==="R1"||e.rua==="R3").length; const par=last14.filter(e=>e.rua==="R2"||e.rua==="R4").length; return {"R. Ímpar":imp,"R. Par":par}; })(),
  }),[last14]);

  function addNumbers() {
    const nums = parseInput(input);
    if (!nums.length) return;
    setEntries(prev=>[...prev,...[...nums].reverse().map(n=>buildEntry(n,++idCounter))]);
    setInput("");
  }
  function handleKey(e) { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addNumbers();} }

  const visibleCols = cols.filter(c=>!hidden.has(c.key));
  const lastVisKey  = [...visibleCols].reverse()[0]?.key;

  // Compute which columns have 100% match AND the last occurrence index for each matched key
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

    check("cor",      ["Vermelho","Preto","Verde"]);
    check("lado",     ["PB e VA","PA e VB"]);
    check("duzia",    ["D1","D2","D3"]);
    check("paridade", ["Par","Ímpar"]);
    check("coluna",   ["C1","C2","C3"]);
    check("rua",      ["R1","R2","R3","R4"]);
    check("parte",    ["P1","P2"]);
    check("regiao",   ["Tier","Orphelins","Voisins"]);

    // For each matched key, find the last occurrence index (excluding the last entry itself)
    const lastIdx = {};
    keys.forEach(field => {
      const val = dominantVal[field];
      for (let i = entries.length - 2; i >= 0; i--) {
        if ((entries[i][field]||"—") === val) { lastIdx[field] = i; break; }
      }
    });

    return { pulseKeys: keys, pulseLastIdx: lastIdx };
  }, [entries]);

  const isLastEntry = (i) => i === entries.length - 1;

  return (
    <div style={{display:"flex",flexDirection:"row",minHeight:"100vh",background:"#0d0d0d",color:"#e5e5e5",fontFamily:"Arial, sans-serif"}}>
      <style>{`
        @keyframes pulseBorder {
          0%,100% { box-shadow: inset 0 0 0 2px #FFD700, inset 0 0 8px #FFD700; }
          50%      { box-shadow: inset 0 0 0 2px #fff5a0, inset 0 0 16px #FFD700; }
        }
        .pulse-cell {
          animation: pulseBorder 0.9s ease-in-out infinite;
          outline: 2px solid #FFD700;
          outline-offset: -2px;
          position: relative;
          z-index: 1;
        }
      `}</style>

      {/* ── Coluna central (tabela + rodapé) ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>

      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"12px 16px 0 16px"}}>

        <div style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:13,letterSpacing:"0.3em",color:"#CC0000",fontWeight:"bold"}}>DESTROYER</span>
          <span style={{fontSize:9,letterSpacing:"0.2em",color:"#555"}}>RACE TABLE</span>
          {entries.length>0&&<span style={{marginLeft:"auto",fontSize:9,color:"#555"}}>{entries.length} números</span>}
        </div>

        <div style={{flex:1,overflowY:"auto",marginBottom:8}}>
          <table style={{width:"100%",borderCollapse:"collapse",borderTop:"1px solid #000",borderLeft:"1px solid #000"}}>
            <thead>
              <tr>
                {cols.map(col => {
                  if (hidden.has(col.key)) return null;
                  const isDraggable = col.toggleable;
                  const isBeingDragged = dragKey.current===col.key;
                  return (
                    <th
                      key={col.key}
                      draggable={isDraggable}
                      onDragStart={isDraggable ? ()=>onDragStart(col.key) : undefined}
                      onDragEnter={isDraggable ? ()=>onDragEnter(col.key) : undefined}
                      onDragEnd={isDraggable ? onDragEnd : undefined}
                      onDragOver={e=>e.preventDefault()}
                      onDoubleClick={col.toggleable ? ()=>toggleHide(col.key) : undefined}
                      title={col.toggleable ? "Arraste para mover • 2x clique para ocultar" : ""}
                      style={{
                        background: isBeingDragged ? "#990000" : "#CC0000",
                        color:"#ffffff", padding:"5px 6px", textAlign:"center",
                        fontSize:9, fontWeight:"bold", letterSpacing:"0.07em",
                        borderBottom:"2px solid #000", borderRight:"1px solid #000",
                        whiteSpace:"nowrap", fontFamily:"Arial, sans-serif",
                        cursor: isDraggable ? "grab" : "default",
                        userSelect:"none", opacity: isBeingDragged ? 0.5 : 1,
                      }}
                    >
                      {col.label}
                    </th>
                  );
                })}
                {/* Colunas ocultas — ▶ clicável para restaurar */}
                {[...hidden].map(key => {
                  const col = INIT_COLS.find(c=>c.key===key);
                  return (
                    <th key={"h-"+key} onClick={()=>toggleHide(key)} title={`Mostrar ${col?.label}`}
                      style={{background:"#1a0000",color:"#CC0000",padding:"5px 3px",textAlign:"center",
                        fontSize:8,fontWeight:"bold",borderBottom:"2px solid #000",borderRight:"1px solid #000",
                        cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>▶</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {entries.length===0 ? (
                <tr><td colSpan={visibleCols.length+hidden.size} style={{textAlign:"center",padding:"3rem",color:"#333",fontSize:12,background:"#0d0d0d",borderBottom:"1px solid #1a1a1a",borderRight:"1px solid #1a1a1a"}}>Nenhum número inserido</td></tr>
              ) : entries.map((e,i) => {
                const posFromLast = entries.length - i;
                const isGold = posFromLast===12||posFromLast===13||posFromLast===14;
                const bTop = isGold?`2px solid ${GOLD}`:"none";
                const bBot = isGold?`2px solid ${GOLD}`:"1px solid #000";

                const Cell = ({ckey, isLast}) => {
                  const scheme = CELL_SCHEME(e,ckey);
                  const pulse = pulseLastIdx[ckey] === i;
                  return (
                    <td className={pulse ? "pulse-cell" : ""}
                      style={{background:scheme.bg,color:scheme.text,padding:"2px 5px",textAlign:"center",
                      fontSize:10,fontWeight:"600",fontFamily:"Arial, sans-serif",letterSpacing:"0.02em",whiteSpace:"nowrap",
                      borderTop: pulse ? "2px solid #FFD700" : bTop,
                      borderBottom: pulse ? "2px solid #FFD700" : bBot,
                      borderRight: (isLast&&isGold) ? `2px solid ${GOLD}` : pulse ? "2px solid #FFD700" : "1px solid #000"}}>
                      {CELL_VAL(e,ckey)}
                    </td>
                  );
                };

                return (
                  <tr key={e.id}>
                    {cols.map((col,ci) => {
                      if (hidden.has(col.key)) return null;
                      const isLast = col.key===lastVisKey;

                      if (col.key==="seq") return (
                        <td key="seq" style={{background:"#0d0d0d",color:"#444",fontSize:8,textAlign:"center",
                          padding:"1px 3px",borderTop:bTop,borderBottom:bBot,
                          borderLeft:isGold?`2px solid ${GOLD}`:"none",borderRight:"1px solid #000",
                          fontFamily:"Arial, sans-serif",width:22}}>{i+1}</td>
                      );
                      if (col.key==="num") return (
                        <td key="num" style={{background:"#0d0d0d",padding:"1px 3px",textAlign:"center",
                          borderTop:bTop,borderBottom:bBot,borderRight:"1px solid #000",width:40}}>
                          <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                            width:24,height:24,borderRadius:"50%",background:NUM_BALL[e.cor].bg,
                            border:`2px solid ${NUM_BALL[e.cor].border}`,color:NUM_BALL[e.cor].text,fontFamily:"Arial, sans-serif"}}>
                            <span style={{fontSize:10,fontWeight:"bold",lineHeight:1}}>{e.num}</span>
                            {e.gp!=="—"&&<span style={{fontSize:6,fontWeight:"normal",opacity:0.85,lineHeight:1}}>{e.gp}</span>}
                          </div>
                        </td>
                      );
                      if (col.key==="hist") {
                        const hist = getHistorico(entries, i, e.num);
                        return (
                          <td key="hist" style={{background:"#0d0d0d",padding:"2px 5px",textAlign:"left",
                            borderTop:bTop,borderBottom:bBot,borderRight:"1px solid #000",minWidth:82}}>
                            <div style={{display:"flex",alignItems:"center",gap:2,flexWrap:"nowrap"}}>
                              {hist.length===0
                                ? <span style={{color:"#2a2a2a",fontSize:8}}>—</span>
                                : hist.map((h,hi) => (
                                  <div key={hi} style={{
                                    display:"inline-flex",alignItems:"center",justifyContent:"center",
                                    width:16,height:16,borderRadius:"50%",flexShrink:0,
                                    background:NUM_BALL[h.cor].bg,
                                    border:`1px solid ${NUM_BALL[h.cor].border}`,
                                    color:NUM_BALL[h.cor].text,
                                    fontSize:7,fontWeight:"bold",
                                  }}>{h.num}</div>
                                ))
                              }
                            </div>
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
      </div>

      {/* Rodapé */}
      <div style={{background:"#080808",borderTop:"1px solid #1e1e1e",padding:"10px 16px"}}>
        <div style={{display:"flex",gap:8,marginBottom:last14.length>0?10:0}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Cole ou digite: 23 10 11  ou  23,10,11  — Enter para adicionar" rows={2}
            style={{flex:1,background:"#111",border:"1px solid #2a2a2a",borderRadius:2,color:"#e5e5e5",
              padding:"7px 10px",fontSize:12,fontFamily:"Arial, sans-serif",resize:"none",outline:"none"}}/>
          <button onClick={addNumbers} style={{padding:"0 20px",background:"#CC0000",border:"none",borderRadius:2,
            color:"#fff",fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",cursor:"pointer",fontFamily:"Arial, sans-serif"}}>ADD</button>
          <button onClick={()=>{ setEntries([]); setAcertos(0); setErros(0); }} style={{padding:"0 14px",background:"transparent",border:"1px solid #333",
            borderRadius:2,color:"#666",fontSize:11,cursor:"pointer",fontFamily:"Arial, sans-serif"}}>CLR</button>
          <button onClick={()=>setEntries(prev=>prev.slice(0,-1))} disabled={entries.length===0} style={{padding:"0 14px",background:"transparent",border:"1px solid #444",
            borderRadius:2,color:entries.length===0?"#333":"#aaa",fontSize:11,cursor:entries.length===0?"default":"pointer",fontFamily:"Arial, sans-serif"}}>↩</button>
        </div>

        {/* Contador de tentativas */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <button onClick={()=>setAcertos(a=>a+1)} style={{flex:1,padding:"3px 0",background:"#14532d",border:"none",borderRadius:3,
            color:"#4ade80",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.05em"}}>
            ✓ ACERTO
          </button>
          <button onClick={()=>setErros(e=>e+1)} style={{flex:1,padding:"3px 0",background:"#7f1d1d",border:"none",borderRadius:3,
            color:"#fca5a5",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.05em"}}>
            ✗ ERRO
          </button>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:60,background:"#111",borderRadius:3,padding:"4px 10px",border:"0.5px solid #222"}}>
            <span style={{fontSize:7,color:"#555",letterSpacing:"0.1em",textTransform:"uppercase"}}>tentativas</span>
            <div style={{display:"flex",gap:10,marginTop:2}}>
              <span style={{fontSize:13,fontWeight:"bold",color:"#4ade80"}}>{acertos}</span>
              <span style={{fontSize:13,color:"#333"}}>|</span>
              <span style={{fontSize:13,fontWeight:"bold",color:"#f87171"}}>{erros}</span>
            </div>
            <span style={{fontSize:7,color:"#555"}}>acertos | erros</span>
          </div>
          {(acertos+erros)>0 && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:48,background:"#111",borderRadius:3,padding:"4px 8px",border:"0.5px solid #222"}}>
              <span style={{fontSize:7,color:"#555",letterSpacing:"0.1em",textTransform:"uppercase"}}>taxa</span>
              <span style={{fontSize:13,fontWeight:"bold",color: acertos/(acertos+erros)>=0.5?"#4ade80":"#f87171"}}>{Math.round(acertos/(acertos+erros)*100)}%</span>
            </div>
          )}
        </div>

        {last14.length>0&&(
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <div style={{fontSize:7,letterSpacing:"0.15em",color:"#CC0000",fontWeight:"bold",textTransform:"uppercase",writingMode:"vertical-rl",transform:"rotate(180deg)",alignSelf:"center"}}>ult 14</div>
            <StatBlockH title="Cor"       data={stats.cor}         palette={COR_CELL}    />
            <div style={{width:"0.5px",background:"#1e1e1e"}}/>
            <StatBlockH title="Lado"      data={stats.lado}        palette={LADO_CELL}   />
            <div style={{width:"0.5px",background:"#1e1e1e"}}/>
            <StatBlockH title="Dúzia"     data={stats.duzia}       palette={DUZIA_CELL}  />
            <div style={{width:"0.5px",background:"#1e1e1e"}}/>
            <StatBlockH title="Par/Ímpar" data={stats.paridade}    palette={PAR_CELL}    />
            <div style={{width:"0.5px",background:"#1e1e1e"}}/>
            <StatBlockH title="Coluna"    data={stats.coluna}      palette={COLUNA_CELL} />
            <div style={{width:"0.5px",background:"#1e1e1e"}}/>
            <StatBlockH title="Parte"     data={stats.parte}       palette={PARTE_CELL}  />
            <div style={{width:"0.5px",background:"#1e1e1e"}}/>
            <StatBlockH title="Rua"       data={stats.ruaParidade} palette={RUA_PAR_CELL}/>
            <div style={{width:"0.5px",background:"#1e1e1e"}}/>
            <StatBlockH title="Região"    data={stats.regiao}      palette={REGIAO_CELL} />
          </div>
        )}
      </div>
      </div>{/* fim coluna central */}

      {/* ── Painel lateral: Rep/Alt ── */}
      <div style={{width:200,background:"#080808",borderLeft:"1px solid #1e1e1e",padding:"14px 12px",flexShrink:0,overflowY:"auto",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
        <div style={{fontSize:8,letterSpacing:"0.2em",color:"#CC0000",fontWeight:"bold",marginBottom:14,textTransform:"uppercase"}}>
          Rep / Alt — ult 14
        </div>
        <RepAltPanel last14={last14} />
        <ScorePanel last14={last14} />
      </div>

    </div>
  );
}

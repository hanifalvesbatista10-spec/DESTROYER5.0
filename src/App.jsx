import { useState, useMemo } from "react";

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
  if (n === 0) return "0";
  const pos = (n - 1) % 12;
  if (pos <= 2) return "R1";
  if (pos <= 5) return "R2";
  if (pos <= 8) return "R3";
  return "R4";
}

// Colunas da roleta: C1=1,4,7,10... C2=2,5,8,11... C3=3,6,9,12...
function getColuna(n) {
  if (n === 0) return "0";
  const r = n % 3;
  if (r === 1) return "C1";
  if (r === 2) return "C2";
  return "C3";
}

function getColor(n)    { if(n===0) return "Verde"; if(RED_NUMS.has(n)) return "Vermelho"; return "Preto"; }
function getLado(n)     { return LADO_RACE[n] || "—"; }
function getRegiao(n)   { if(TIER_NUMS.has(n)) return "Tier"; if(ORPHELINS.has(n)) return "Orphelins"; return "Voisins"; }
function getDuzia(n)    { if(n===0) return "—"; if(n<=12) return "D1"; if(n<=24) return "D2"; return "D3"; }
function getParidade(n) { if(n===0) return "—"; return n%2===0 ? "Par" : "Ímpar"; }
function getCorAbrev(c) { return c==="Vermelho"?"VRM":c==="Preto"?"PRT":"VRD"; }
function getGP(n)       { return GP_MAP[n] || "—"; }

function buildEntry(n, id) {
  return {
    id, num:n,
    cor:      getColor(n),
    corAbrev: getCorAbrev(getColor(n)),
    lado:     getLado(n),
    regiao:   getRegiao(n),
    duzia:    getDuzia(n),
    paridade: getParidade(n),
    gp:       getGP(n),
    rua:      getRua(n),
    coluna:   getColuna(n),
  };
}

function parseInput(raw) {
  return raw.split(/[\s,;\n\r]+/)
    .map(t => parseInt(t.trim()))
    .filter(n => !isNaN(n) && n >= 0 && n <= 36);
}

// ── Paleta ───────────────────────────────────────────────────────────────────
const NUM_BALL = {
  Vermelho: { bg:"#CC0000", border:"#ff6666", text:"#ffffff" },
  Preto:    { bg:"#111111", border:"#555555", text:"#ffffff" },
  Verde:    { bg:"#1B7A3E", border:"#4ade80", text:"#ffffff" },
};
const COR_CELL = {
  Vermelho: { bg:"#CC0000", text:"#ffffff" },
  Preto:    { bg:"#111111", text:"#dddddd" },
  Verde:    { bg:"#1B7A3E", text:"#ffffff" },
};
const LADO_CELL = {
  "PB e VA": { bg:"#6b0f1a", text:"#ffb3bb" },
  "PA e VB": { bg:"#1e3a5f", text:"#93c5fd" },
  "—":       { bg:"#111",   text:"#444444" },
};
const REGIAO_CELL = {
  Tier:      { bg:"#7c2d12", text:"#fdba74" },
  Orphelins: { bg:"#854d0e", text:"#fefce8" },
  Voisins:   { bg:"#166534", text:"#bbf7d0" },
};
const DUZIA_CELL = {
  D1:  { bg:"#1e3a8a", text:"#bfdbfe" },
  D2:  { bg:"#92400e", text:"#fde68a" },
  D3:  { bg:"#7f1d1d", text:"#fca5a5" },
  "—": { bg:"#111",   text:"#444444" },
};
const PAR_CELL = {
  Par:    { bg:"#0f1f5c", text:"#bfdbfe" },
  Ímpar:  { bg:"#4b5563", text:"#e5e7eb" },
  "—":    { bg:"#111",   text:"#444444" },
};
const RUA_CELL = {
  "R1": { bg:"#4a0080", text:"#e9d5ff" },
  "R2": { bg:"#005a5a", text:"#99f6e4" },
  "R3": { bg:"#7a1c4b", text:"#fbcfe8" },
  "R4": { bg:"#1a3a1a", text:"#bbf7d0" },
  "0":  { bg:"#1B7A3E", text:"#ffffff" },
};
// Colunas — cores distintas de vizinhos (PAR/ÍMPAR e RUA)
const COLUNA_CELL = {
  "C1": { bg:"#4a5320", text:"#e5e5e5" },  // verde militar
  "C2": { bg:"#0891b2", text:"#0a0a0a" },  // ciano
  "C3": { bg:"#ea580c", text:"#1a1a1a" },  // laranja
  "0":  { bg:"#1B7A3E", text:"#ffffff" },
};

const RUA_PAR_CELL = {
  "R. Ímpar": { bg:"#4a0080", text:"#e9d5ff" },
  "R. Par":   { bg:"#005a5a", text:"#99f6e4" },
};
const GOLD = "#D4AF37";

// ── Definição das colunas toggleáveis ────────────────────────────────────────
const COL_DEFS = [
  { key:"seq",      label:"#",         toggleable: false },
  { key:"num",      label:"Nº",        toggleable: false },
  { key:"cor",      label:"COR",       toggleable: true  },
  { key:"lado",     label:"LADO RACE", toggleable: true  },
  { key:"duzia",    label:"DÚZIA",     toggleable: true  },
  { key:"paridade", label:"PAR/ÍMPAR", toggleable: true  },
  { key:"coluna",   label:"COLUNA",    toggleable: true  },
  { key:"rua",      label:"RUA",       toggleable: true  },
  { key:"regiao",   label:"REGIÃO",    toggleable: true  },
];

// ── Micro estatística HORIZONTAL ─────────────────────────────────────────────
function countBy(arr, key, values) {
  const r = {};
  values.forEach(v => { r[v] = arr.filter(e => e[key]===v).length; });
  return r;
}

function StatBlockH({ title, data, palette }) {
  const total = Object.values(data).reduce((a,b)=>a+b,0);
  return (
    <div style={{ flex:1, minWidth:80 }}>
      <div style={{ fontSize:7, letterSpacing:"0.15em", color:"#CC0000", fontWeight:"bold", marginBottom:4, textTransform:"uppercase" }}>
        {title}
      </div>
      {Object.entries(data).map(([k, v]) => {
        const p = palette[k] || { bg:"#222", text:"#aaa" };
        const pct = total > 0 ? Math.round((v/total)*100) : 0;
        return (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
            <div style={{
              width:52, fontSize:8, color:p.text, textAlign:"center",
              background:p.bg, padding:"1px 3px", borderRadius:1,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              fontFamily:"Arial, sans-serif", fontWeight:"bold", flexShrink:0,
            }}>{k}</div>
            <div style={{ flex:1, height:10, background:"#1a1a1a", borderRadius:1, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:p.bg, transition:"width 0.4s ease", boxSizing:"border-box", border: p.bg==="#111111" ? "1px solid rgba(255,255,255,0.4)" : "none" }}/>
            </div>
            <div style={{ width:14, fontSize:8, color:"#ccc", textAlign:"right", fontFamily:"Arial, sans-serif", flexShrink:0 }}>{v}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
let idCounter = 0;

export default function DestroyerRaceTable() {
  const [entries, setEntries]   = useState([]);
  const [input, setInput]       = useState("");

  // estado de visibilidade: todas visíveis por default
  const initVisible = {};
  COL_DEFS.forEach(c => { initVisible[c.key] = true; });
  const [visible, setVisible] = useState(initVisible);

  const toggleCol = (key) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const last14 = useMemo(() => entries.slice(-14), [entries]);

  const stats = useMemo(() => ({
    cor:      countBy(last14, "cor",      ["Vermelho","Preto","Verde"]),
    lado:     countBy(last14, "lado",     ["PB e VA","PA e VB"]),
    regiao:   countBy(last14, "regiao",   ["Tier","Orphelins","Voisins"]),
    duzia:    countBy(last14, "duzia",    ["D1","D2","D3"]),
    paridade: countBy(last14, "paridade", ["Par","Ímpar"]),
    ruaParidade: (() => { const imp = last14.filter(e => e.rua==="R1"||e.rua==="R3").length; const par = last14.filter(e => e.rua==="R2"||e.rua==="R4").length; return {"R. Ímpar": imp, "R. Par": par}; })(),
    coluna:   countBy(last14, "coluna",   ["C1","C2","C3"]),
  }), [last14]);

  function addNumbers() {
    const nums = parseInput(input);
    if (!nums.length) return;
    const reversed = [...nums].reverse();
    setEntries(prev => [...prev, ...reversed.map(n => buildEntry(n, ++idCounter))]);
    setInput("");
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNumbers(); }
  }

  const visibleCols = COL_DEFS.filter(c => visible[c.key]);
  const totalCols   = visibleCols.length;

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"#0d0d0d", color:"#e5e5e5", fontFamily:"Arial, sans-serif" }}>

      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"12px 16px 0 16px" }}>

        {/* Título */}
        <div style={{ marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:13, letterSpacing:"0.3em", color:"#CC0000", fontWeight:"bold" }}>DESTROYER</span>
          <span style={{ fontSize:9, letterSpacing:"0.2em", color:"#555" }}>RACE TABLE</span>
          {entries.length > 0 && (
            <span style={{ marginLeft:"auto", fontSize:9, color:"#555" }}>{entries.length} números</span>
          )}
        </div>

        {/* Tabela */}
        <div style={{ flex:1, overflowY:"auto", marginBottom:8 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", borderTop:"1px solid #000", borderLeft:"1px solid #000" }}>
            <thead>
              <tr>
                {COL_DEFS.map((col, ci) => {
                  if (!visible[col.key]) return null;
                  const isLast = ci === COL_DEFS.length - 1 || COL_DEFS.slice(ci+1).every(c => !visible[c.key]);
                  return (
                    <th
                      key={col.key}
                      onClick={col.toggleable ? () => toggleCol(col.key) : undefined}
                      title={col.toggleable ? "Clique para ocultar" : ""}
                      style={{
                        background: "#CC0000",
                        color: "#ffffff",
                        padding:"5px 6px", textAlign:"center",
                        fontSize:9, fontWeight:"bold", letterSpacing:"0.07em",
                        borderBottom:"2px solid #000", borderRight:"1px solid #000",
                        whiteSpace:"nowrap", fontFamily:"Arial, sans-serif",
                        cursor: col.toggleable ? "pointer" : "default",
                        userSelect:"none",
                      }}
                    >
                      {col.label}
                    </th>
                  );
                })}
                {/* Colunas ocultas: mostrar como ícone clicável no header */}
                {COL_DEFS.filter(c => c.toggleable && !visible[c.key]).map(col => (
                  <th
                    key={"hidden-"+col.key}
                    onClick={() => toggleCol(col.key)}
                    title={`Mostrar ${col.label}`}
                    style={{
                      background:"#1a0000", color:"#CC0000",
                      padding:"5px 4px", textAlign:"center",
                      fontSize:8, fontWeight:"bold",
                      borderBottom:"2px solid #000", borderRight:"1px solid #000",
                      whiteSpace:"nowrap", fontFamily:"Arial, sans-serif",
                      cursor:"pointer", userSelect:"none", letterSpacing:0,
                    }}
                  >▶</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} style={{ textAlign:"center", padding:"3rem", color:"#333", fontSize:12, background:"#0d0d0d", borderBottom:"1px solid #1a1a1a", borderRight:"1px solid #1a1a1a" }}>
                    Nenhum número inserido
                  </td>
                </tr>
              ) : entries.map((e, i) => {
                const posFromLast = entries.length - i;
                const isGold = posFromLast === 12 || posFromLast === 13 || posFromLast === 14;
                const bTop = isGold ? `2px solid ${GOLD}` : "none";
                const bBot = isGold ? `2px solid ${GOLD}` : "1px solid #000";

                const Cell = ({ scheme, children, isLast }) => (
                  <td style={{
                    background: scheme.bg, color: scheme.text,
                    padding:"2px 5px", textAlign:"center",
                    fontSize:10, fontWeight:"600", fontFamily:"Arial, sans-serif",
                    letterSpacing:"0.02em", whiteSpace:"nowrap",
                    borderTop:bTop, borderBottom:bBot,
                    borderRight: isLast && isGold ? `2px solid ${GOLD}` : "1px solid #000",
                  }}>{children}</td>
                );

                // Determina qual é a última coluna visível
                const lastVisKey = [...COL_DEFS].reverse().find(c => visible[c.key])?.key;

                return (
                  <tr key={e.id}>
                    {/* # */}
                    {visible["seq"] && (
                      <td style={{
                        background:"#0d0d0d", color:"#444",
                        fontSize:8, textAlign:"center", padding:"1px 3px",
                        borderTop:bTop, borderBottom:bBot,
                        borderLeft: isGold ? `2px solid ${GOLD}` : "none",
                        borderRight:"1px solid #000",
                        fontFamily:"Arial, sans-serif", width:22,
                      }}>{i + 1}</td>
                    )}

                    {/* Bola */}
                    {visible["num"] && (
                      <td style={{
                        background:"#0d0d0d", padding:"1px 3px", textAlign:"center",
                        borderTop:bTop, borderBottom:bBot, borderRight:"1px solid #000", width:40,
                      }}>
                        <div style={{
                          display:"inline-flex", flexDirection:"column",
                          alignItems:"center", justifyContent:"center",
                          width:24, height:24, borderRadius:"50%",
                          background: NUM_BALL[e.cor].bg,
                          border:`2px solid ${NUM_BALL[e.cor].border}`,
                          color: NUM_BALL[e.cor].text, fontFamily:"Arial, sans-serif",
                        }}>
                          <span style={{ fontSize:10, fontWeight:"bold", lineHeight:1 }}>{e.num}</span>
                          {e.gp !== "—" && (
                            <span style={{ fontSize:6, fontWeight:"normal", opacity:0.85, lineHeight:1 }}>{e.gp}</span>
                          )}
                        </div>
                      </td>
                    )}

                    {visible["cor"]      && <Cell scheme={COR_CELL[e.cor]}                   isLast={lastVisKey==="cor"}>{e.corAbrev}</Cell>}
                    {visible["lado"]     && <Cell scheme={LADO_CELL[e.lado]}                  isLast={lastVisKey==="lado"}>{e.lado}</Cell>}
                    {visible["duzia"]    && <Cell scheme={DUZIA_CELL[e.duzia]}                isLast={lastVisKey==="duzia"}>{e.duzia}</Cell>}
                    {visible["paridade"] && <Cell scheme={PAR_CELL[e.paridade]}               isLast={lastVisKey==="paridade"}>{e.paridade.toUpperCase()}</Cell>}
                    {visible["coluna"]   && <Cell scheme={COLUNA_CELL[e.coluna]||COLUNA_CELL["C1"]} isLast={lastVisKey==="coluna"}>{e.coluna}</Cell>}
                    {visible["rua"]      && <Cell scheme={RUA_CELL[e.rua]||RUA_CELL["R1"]}   isLast={lastVisKey==="rua"}>{e.rua}</Cell>}
                    {visible["regiao"]   && <Cell scheme={REGIAO_CELL[e.regiao]}              isLast={lastVisKey==="regiao"}>{e.regiao.toUpperCase()}</Cell>}

                    {/* Placeholder cells para colunas ocultas */}
                    {COL_DEFS.filter(c => c.toggleable && !visible[c.key]).map(col => (
                      <td key={"ph-"+col.key} style={{
                        background:"#0a0a0a", borderBottom:bBot, borderRight:"1px solid #111", width:10,
                      }}/>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Rodapé ── */}
      <div style={{ background:"#080808", borderTop:"1px solid #1e1e1e", padding:"10px 16px" }}>
        <div style={{ display:"flex", gap:8, marginBottom: last14.length > 0 ? 10 : 0 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Cole ou digite: 23 10 11  ou  23,10,11  — Enter para adicionar"
            rows={2}
            style={{
              flex:1, background:"#111", border:"1px solid #2a2a2a",
              borderRadius:2, color:"#e5e5e5", padding:"7px 10px",
              fontSize:12, fontFamily:"Arial, sans-serif", resize:"none", outline:"none"
            }}
          />
          <button onClick={addNumbers} style={{
            padding:"0 20px", background:"#CC0000", border:"none", borderRadius:2,
            color:"#fff", fontSize:11, fontWeight:"bold", letterSpacing:"0.1em",
            cursor:"pointer", fontFamily:"Arial, sans-serif"
          }}>ADD</button>
          <button onClick={() => setEntries([])} style={{
            padding:"0 14px", background:"transparent", border:"1px solid #333",
            borderRadius:2, color:"#666", fontSize:11, cursor:"pointer",
            fontFamily:"Arial, sans-serif"
          }}>CLR</button>
        </div>

        {last14.length > 0 && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <div style={{ fontSize:7, letterSpacing:"0.15em", color:"#CC0000", fontWeight:"bold", textTransform:"uppercase", writingMode:"vertical-rl", transform:"rotate(180deg)", alignSelf:"center" }}>
              ult 14
            </div>
            <StatBlockH title="Cor"         data={stats.cor}      palette={COR_CELL}    />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Lado"        data={stats.lado}     palette={LADO_CELL}   />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Dúzia"       data={stats.duzia}    palette={DUZIA_CELL}  />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Par/Ímpar"   data={stats.paridade} palette={PAR_CELL}    />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Coluna"      data={stats.coluna}   palette={COLUNA_CELL} />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Rua" data={stats.ruaParidade} palette={RUA_PAR_CELL} />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Região"      data={stats.regiao}   palette={REGIAO_CELL} />
          </div>
        )}
      </div>
    </div>
  );
}

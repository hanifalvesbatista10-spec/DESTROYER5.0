import { useState, useMemo } from "react";

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

// PB e VA: 0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10
// PA e VB: 26,3,35,12,28,7,29,18,22,9,31,14,20,1,33,16,24,5
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

// Ruas: cada dúzia tem 4 ruas de 3 números
// D1: R1=1-3, R2=4-6, R3=7-9, R4=10-12
// D2: R1=13-15, R2=16-18, R3=19-21, R4=22-24
// D3: R1=25-27, R2=28-30, R3=31-33, R4=34-36
// 0: própria rua → "0"
function getRua(n) {
  if (n === 0) return "0";
  const pos = ((n - 1) % 12);
  if (pos <= 2) return "R1";
  if (pos <= 5) return "R2";
  if (pos <= 8) return "R3";
  return "R4";
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
// Ruas — 4 tons distintos, tonalidades não usadas: ciano, magenta escuro, oliva, índigo
const RUA_CELL = {
  "R1": { bg:"#4a0080", text:"#e9d5ff" },  // ciano escuro
  "R2": { bg:"#005a5a", text:"#99f6e4" },  // laranja queimado
  "R3": { bg:"#7a1c4b", text:"#fbcfe8" },  // verde oliva
  "R4": { bg:"#1a3a1a", text:"#bbf7d0" },  // índigo/lilás escuro
  "0":  { bg:"#1B7A3E", text:"#ffffff" },  // verde (igual ao zero)
};

const GOLD = "#D4AF37";

// ── Micro estatística HORIZONTAL ─────────────────────────────────────────────
function countBy(arr, key, values) {
  const r = {};
  values.forEach(v => { r[v] = arr.filter(e => e[key]===v).length; });
  return r;
}

function StatBlockH({ title, data, palette }) {
  const total = Object.values(data).reduce((a,b)=>a+b,0);
  return (
    <div style={{ flex:1, minWidth:90 }}>
      <div style={{ fontSize:7, letterSpacing:"0.15em", color:"#CC0000", fontWeight:"bold", marginBottom:4, textTransform:"uppercase" }}>
        {title}
      </div>
      {Object.entries(data).map(([k, v]) => {
        const p = palette[k] || { bg:"#222", text:"#aaa" };
        const pct = total > 0 ? Math.round((v/total)*100) : 0;
        return (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
            <div style={{
              width:56, fontSize:8, color:p.text, textAlign:"center",
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
  const [entries, setEntries] = useState([]);
  const [input, setInput]     = useState("");

  const last14 = useMemo(() => entries.slice(-14), [entries]);

  const stats = useMemo(() => ({
    cor:      countBy(last14, "cor",      ["Vermelho","Preto","Verde"]),
    lado:     countBy(last14, "lado",     ["PB e VA","PA e VB"]),
    regiao:   countBy(last14, "regiao",   ["Tier","Orphelins","Voisins"]),
    duzia:    countBy(last14, "duzia",    ["D1","D2","D3"]),
    paridade: countBy(last14, "paridade", ["Par","Ímpar"]),
    rua:      countBy(last14, "rua",      ["R1","R2","R3","R4","0"]),
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

  // padding reduzido em 25%: era "7px 10px" → "5px 8px", era "6px 6px" → "4px 5px"
  const HEADERS = ["#", "Nº", "COR", "LADO RACE", "DÚZIA", "PAR/ÍMPAR", "RUA", "REGIÃO"];

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"#0d0d0d", color:"#e5e5e5", fontFamily:"Arial, sans-serif" }}>

      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"16px 16px 0 16px" }}>

        {/* Título */}
        <div style={{ marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:14, letterSpacing:"0.3em", color:"#CC0000", fontWeight:"bold" }}>DESTROYER</span>
          <span style={{ fontSize:10, letterSpacing:"0.2em", color:"#555" }}>RACE TABLE</span>
          {entries.length > 0 && (
            <span style={{ marginLeft:"auto", fontSize:10, color:"#555" }}>{entries.length} números</span>
          )}
        </div>

        {/* Tabela */}
        <div style={{ flex:1, overflowY:"auto", marginBottom:10 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", borderTop:"1px solid #000", borderLeft:"1px solid #000" }}>
            <thead>
              <tr>
                {HEADERS.map(h => (
                  <th key={h} style={{
                    background:"#CC0000", color:"#ffffff",
                    padding:"5px 6px", textAlign:"center",
                    fontSize:10, fontWeight:"bold", letterSpacing:"0.07em",
                    borderBottom:"2px solid #000", borderRight:"1px solid #000",
                    whiteSpace:"nowrap", fontFamily:"Arial, sans-serif"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign:"center", padding:"3rem", color:"#333", fontSize:12, background:"#0d0d0d", borderBottom:"1px solid #1a1a1a", borderRight:"1px solid #1a1a1a" }}>
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

                return (
                  <tr key={e.id}>
                    {/* # */}
                    <td style={{
                      background:"#0d0d0d", color:"#444",
                      fontSize:9, textAlign:"center", padding:"1px 3px",
                      borderTop:bTop, borderBottom:bBot,
                      borderLeft: isGold ? `2px solid ${GOLD}` : "none",
                      borderRight:"1px solid #000",
                      fontFamily:"Arial, sans-serif", width:24,
                    }}>{i + 1}</td>

                    {/* Bola — menor: 32px */}
                    <td style={{
                      background:"#0d0d0d", padding:"1px 3px", textAlign:"center",
                      borderTop:bTop, borderBottom:bBot, borderRight:"1px solid #000", width:46,
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
                          <span style={{ fontSize:6, fontWeight:"normal", opacity:0.85, lineHeight:1, marginTop:0 }}>{e.gp}</span>
                        )}
                      </div>
                    </td>

                    <Cell scheme={COR_CELL[e.cor]}>{e.corAbrev}</Cell>
                    <Cell scheme={LADO_CELL[e.lado]}>{e.lado}</Cell>
                    <Cell scheme={DUZIA_CELL[e.duzia]}>{e.duzia}</Cell>
                    <Cell scheme={PAR_CELL[e.paridade]}>{e.paridade.toUpperCase()}</Cell>
                    <Cell scheme={RUA_CELL[e.rua] || RUA_CELL["R1"]}>{e.rua}</Cell>
                    <Cell scheme={REGIAO_CELL[e.regiao]} isLast={true}>{e.regiao.toUpperCase()}</Cell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Rodapé: input + estatísticas ── */}
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
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ fontSize:7, letterSpacing:"0.15em", color:"#CC0000", fontWeight:"bold", textTransform:"uppercase", writingMode:"vertical-rl", transform:"rotate(180deg)", alignSelf:"center", marginRight:2 }}>
              ult 14
            </div>
            <StatBlockH title="Cor"         data={stats.cor}      palette={COR_CELL}    />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Lado Race"   data={stats.lado}     palette={LADO_CELL}   />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Dúzia"       data={stats.duzia}    palette={DUZIA_CELL}  />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Par / Ímpar" data={stats.paridade} palette={PAR_CELL}    />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Rua"         data={stats.rua}      palette={RUA_CELL}    />
            <div style={{ width:"0.5px", background:"#1e1e1e" }}/>
            <StatBlockH title="Região"      data={stats.regiao}   palette={REGIAO_CELL} />
          </div>
        )}
      </div>
    </div>
  );
}

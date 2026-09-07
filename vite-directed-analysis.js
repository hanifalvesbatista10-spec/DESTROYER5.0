export default function directedAnalysisPatch() {
  return {
    name: 'directed-analysis-patch',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/App.jsx') && !id.endsWith('\\src\\App.jsx')) return null;
      if (code.includes('DIRECTED_STRATEGIES')) return null;

      const componentMarker = 'let idCounter = 0;';
      const stateMarker = '  const [input, setInput]     = useState("");';
      const headerMarker = '<span style={{fontSize:9,letterSpacing:"0.2em",color:"#555"}}>RACE TABLE</span>';
      const returnMarker = '  return (\n    <div style={{display:"flex",flexDirection:"row",minHeight:"100vh",width:"100vw",maxWidth:"100vw",margin:0,padding:0,background:"#0d0d0d",color:"#e5e5e5",fontFamily:"Arial, sans-serif"}}>';

      if (!code.includes(componentMarker) || !code.includes(stateMarker) || !code.includes(headerMarker) || !code.includes(returnMarker)) {
        console.warn('[directed-analysis-patch] App.jsx markers not found; patch skipped.');
        return null;
      }

      const directedComponent = `
const DIRECTED_STRATEGIES = [
  {
    id: "c3d3",
    label: "C3D3",
    primary: [27, 30, 33, 36],
    secondary: [1, 11, 13, 16],
    palette: { primary: "#0ea5e9", secondary: "#164e63" },
  },
  {
    id: "c2d2",
    label: "C2D2",
    primary: [29, 28, 35, 26, 32],
    secondary: [0, 3, 12, 7],
    palette: { primary: "#a855f7", secondary: "#581c87" },
  },
  {
    id: "32-19-21",
    label: "32-19-21",
    primary: [32, 19, 21],
    secondary: [4, 15, 0],
    palette: { primary: "#f59e0b", secondary: "#78350f" },
  },
  {
    id: "33-31-20",
    label: "33-31-20",
    primary: [33, 31, 20],
    secondary: [9, 14, 1, 16],
    palette: { primary: "#22c55e", secondary: "#14532d" },
  },
  {
    id: "c3-pa",
    label: "C3 PA",
    primary: [3, 12, 18, 19, 33, 24],
    secondary: [16, 22, 35],
    palette: { primary: "#ef4444", secondary: "#7f1d1d" },
  },
];

const DIRECTED_RACETRACK = [
  0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,
  5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26,
];

function DirectedAnalysis({
  entries,
  input,
  setInput,
  addNumbers,
  setEntries,
  setFilterSel,
  activeStrategyId,
  setActiveStrategyId,
  setActiveView,
}) {
  const [hoveredStrategyId, setHoveredStrategyId] = useState(null);
  const [hoveredNumber, setHoveredNumber] = useState(null);
  const [lockedNumber, setLockedNumber] = useState(null);
  const [strategyOpen, setStrategyOpen] = useState(false);

  const strategyId = hoveredStrategyId || activeStrategyId;
  const activeStrategy = DIRECTED_STRATEGIES.find(s => s.id === strategyId) || DIRECTED_STRATEGIES[0];
  const selectedNumber = hoveredNumber ?? lockedNumber;
  const primarySet = useMemo(() => new Set(activeStrategy.primary), [activeStrategy]);
  const secondarySet = useMemo(() => new Set(activeStrategy.secondary), [activeStrategy]);

  const classify = (num) => {
    if (selectedNumber !== null) return num === selectedNumber ? "selected-number" : "normal";
    if (primarySet.has(num)) return "primary";
    if (secondarySet.has(num)) return "secondary";
    return "normal";
  };

  const getCellStyle = (entry) => {
    const mode = classify(entry.num);
    if (mode === "selected-number") {
      return {
        background: "#f8fafc",
        color: "#020617",
        border: "2px solid #38bdf8",
        boxShadow: "inset 0 0 0 1px #0ea5e9",
        opacity: 1,
      };
    }
    if (mode === "primary") {
      return {
        background: activeStrategy.palette.primary,
        color: "#fff",
        border: "2px solid rgba(255,255,255,.78)",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,.32)",
        opacity: 1,
      };
    }
    if (mode === "secondary") {
      return {
        background: activeStrategy.palette.secondary,
        color: "#f8fafc",
        border: "1px solid rgba(255,255,255,.38)",
        opacity: 1,
      };
    }
    const ball = NUM_BALL[entry.cor] || NUM_BALL.Preto;
    return {
      background: ball.bg,
      color: ball.text,
      border: "1px solid #242424",
      opacity: selectedNumber !== null ? 0.22 : 0.48,
    };
  };

  const numberOccurrences = selectedNumber === null
    ? 0
    : entries.reduce((acc, e) => acc + (e.num === selectedNumber ? 1 : 0), 0);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addNumbers();
    }
  };

  return (
    <div style={{minHeight:"100vh",width:"100vw",maxWidth:"100vw",background:"#070909",color:"#e5e7eb",fontFamily:"Arial, sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{
        "*{box-sizing:border-box} html,body,#root{margin:0;padding:0;width:100%;min-height:100%;background:#070909} .da-scroll::-webkit-scrollbar{height:7px;width:7px}.da-scroll::-webkit-scrollbar-thumb{background:#303638;border-radius:6px}.da-history{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:3px}.da-num{min-height:34px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;transition:background .08s,border .08s,opacity .08s,transform .08s}.da-num:hover{transform:translateY(-1px)}"
      }</style>

      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderBottom:"1px solid #1c2323",background:"#090b0b",flexWrap:"wrap"}}>
        <span style={{fontSize:14,letterSpacing:"0.28em",color:"#CC0000",fontWeight:"bold",marginRight:4}}>DESTROYER</span>
        <button type="button" onClick={()=>setActiveView("race")}
          style={{padding:"5px 10px",background:"transparent",border:"1px solid #2b3030",borderRadius:4,color:"#6b7280",fontSize:9,fontWeight:"bold",letterSpacing:"0.13em",cursor:"pointer"}}>RACE TABLE</button>
        <button type="button"
          style={{padding:"5px 10px",background:"#171c1c",border:"1px solid #CC0000",borderRadius:4,color:"#f3f4f6",fontSize:9,fontWeight:"bold",letterSpacing:"0.10em",cursor:"default"}}>ANÁLISE DIRECIONADA</button>
        <span style={{marginLeft:"auto",fontSize:9,color:"#5f6767"}}>{entries.length} números</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"minmax(220px,290px) minmax(0,1fr)",gap:10,padding:10,flex:1,minHeight:0}}>
        <aside style={{background:"#0b0f0f",border:"1px solid #1d2626",borderRadius:5,padding:9,display:"flex",flexDirection:"column",gap:10,minWidth:0}}>
          <div>
            <div style={{fontSize:8,color:"#667070",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Estratégia</div>
            <button type="button" onClick={()=>setStrategyOpen(v=>!v)}
              style={{width:"100%",padding:"8px 9px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#111717",border:"1px solid #293232",borderRadius:4,color:"#e5e7eb",fontSize:11,fontWeight:"bold",cursor:"pointer"}}>
              <span>{(DIRECTED_STRATEGIES.find(s=>s.id===activeStrategyId)||DIRECTED_STRATEGIES[0]).label}</span>
              <span style={{color:"#7c8585"}}>{strategyOpen ? "▲" : "▼"}</span>
            </button>
            {strategyOpen && (
              <div style={{marginTop:4,border:"1px solid #202929",borderRadius:4,overflow:"hidden",background:"#0d1212"}}>
                {DIRECTED_STRATEGIES.map(s => {
                  const active = s.id === activeStrategyId;
                  return (
                    <button key={s.id} type="button"
                      onMouseEnter={()=>setHoveredStrategyId(s.id)}
                      onMouseLeave={()=>setHoveredStrategyId(null)}
                      onClick={()=>{setActiveStrategyId(s.id);setStrategyOpen(false);setLockedNumber(null);}}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"7px 8px",background:active?"#171d1d":"transparent",border:"none",borderBottom:"1px solid #161d1d",color:active?"#fff":"#a3aaaa",fontSize:10,textAlign:"left",cursor:"pointer"}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:s.palette.primary,flexShrink:0}}/>
                      <span style={{fontWeight:active?800:600}}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{padding:"8px",border:"1px solid #182020",borderRadius:4,background:"#090d0d"}}>
            <div style={{fontSize:8,color:"#677171",textTransform:"uppercase",letterSpacing:"0.11em",marginBottom:7}}>Destaques</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <span style={{width:11,height:11,borderRadius:2,background:activeStrategy.palette.primary,border:"1px solid rgba(255,255,255,.55)"}}/>
              <span style={{fontSize:9,color:"#bcc3c3"}}>Principais</span>
              <span style={{fontSize:9,color:"#788080",marginLeft:"auto"}}>{activeStrategy.primary.join(" · ")}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:11,height:11,borderRadius:2,background:activeStrategy.palette.secondary,border:"1px solid rgba(255,255,255,.25)"}}/>
              <span style={{fontSize:9,color:"#bcc3c3"}}>Secundários</span>
              <span style={{fontSize:9,color:"#788080",marginLeft:"auto"}}>{activeStrategy.secondary.join(" · ")}</span>
            </div>
          </div>

          <div style={{minWidth:0}}>
            <div style={{fontSize:8,color:"#667070",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Roleta / Racetrack</div>
            <div className="da-scroll" style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(34px,1fr))",gap:4,maxHeight:310,overflowY:"auto",paddingRight:2}}>
              {DIRECTED_RACETRACK.map(n => {
                const cor = getColor(n);
                const s = NUM_BALL[cor];
                const selected = selectedNumber === n;
                return (
                  <button key={n} type="button"
                    onMouseEnter={()=>setHoveredNumber(n)}
                    onMouseLeave={()=>setHoveredNumber(null)}
                    onClick={()=>setLockedNumber(v=>v===n?null:n)}
                    title={selectedNumber===n ? `${numberOccurrences} ocorrência(s)` : `Destacar ${n}`}
                    style={{height:34,borderRadius:17,background:selected?"#f8fafc":s.bg,color:selected?"#050505":s.text,border:selected?"2px solid #38bdf8":"1px solid "+s.border,fontSize:10,fontWeight:"bold",cursor:"pointer",opacity:selectedNumber!==null&&!selected?0.45:1}}>{n}</button>
                );
              })}
            </div>
            {selectedNumber !== null && (
              <div style={{marginTop:6,fontSize:9,color:"#8d9797"}}>
                Nº <b style={{color:"#e5e7eb"}}>{selectedNumber}</b> · {numberOccurrences} ocorrência(s) no histórico
              </div>
            )}
          </div>
        </aside>

        <main style={{minWidth:0,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{fontSize:8,color:"#687171",textTransform:"uppercase",letterSpacing:"0.12em"}}>Histórico geral</div>
            <div style={{height:1,background:"#1b2222",flex:1,minWidth:30}}/>
            {selectedNumber !== null && (
              <button type="button" onClick={()=>{setLockedNumber(null);setHoveredNumber(null)}}
                style={{padding:"4px 8px",border:"1px solid #2d3535",background:"transparent",color:"#909898",borderRadius:3,fontSize:8,cursor:"pointer"}}>LIMPAR Nº</button>
            )}
          </div>

          <div className="da-scroll" style={{flex:1,minHeight:280,maxHeight:"calc(100vh - 175px)",overflowY:"auto",background:"#090c0c",border:"1px solid #1a2222",borderRadius:5,padding:7}}>
            {entries.length === 0 ? (
              <div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:"#363f3f",fontSize:10,letterSpacing:"0.09em",textTransform:"uppercase"}}>Insira números para iniciar o histórico</div>
            ) : (
              <div className="da-history">
                {entries.map((entry, idx) => (
                  <div key={entry.id ?? idx} className="da-num"
                    onMouseEnter={()=>setHoveredNumber(entry.num)}
                    onMouseLeave={()=>setHoveredNumber(null)}
                    onClick={()=>setLockedNumber(v=>v===entry.num?null:entry.num)}
                    title={`#${idx+1} · número ${entry.num}`}
                    style={getCellStyle(entry)}>{entry.num}</div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <div style={{borderTop:"1px solid #1b2222",background:"#080b0b",padding:"8px 10px",display:"flex",gap:8,alignItems:"stretch"}}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Cole ou digite: 23 10 11  ou  23,10,11  — Enter para adicionar" rows={2}
          style={{flex:1,minWidth:0,background:"#101414",border:"1px solid #283030",borderRadius:3,color:"#e5e7eb",padding:"7px 10px",fontSize:12,fontFamily:"Arial, sans-serif",resize:"none",outline:"none"}}/>
        <button type="button" onClick={addNumbers}
          style={{padding:"0 20px",background:"#CC0000",border:"none",borderRadius:3,color:"#fff",fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",cursor:"pointer"}}>ADD</button>
        <button type="button" onClick={()=>{setEntries([]);setFilterSel({});}}
          style={{padding:"0 14px",background:"transparent",border:"1px solid #333",borderRadius:3,color:"#666",fontSize:11,cursor:"pointer"}}>CLR</button>
        <button type="button" onClick={()=>{setEntries(prev=>prev.slice(0,-1));setFilterSel({});}} disabled={entries.length===0}
          style={{padding:"0 14px",background:"transparent",border:"1px solid #444",borderRadius:3,color:entries.length===0?"#333":"#aaa",fontSize:11,cursor:entries.length===0?"default":"pointer"}}>↩</button>
      </div>
    </div>
  );
}

`;

      code = code.replace(componentMarker, directedComponent + componentMarker);
      code = code.replace(
        stateMarker,
        stateMarker + '\n  const [activeView, setActiveView] = useState("race");\n  const [activeStrategyId, setActiveStrategyId] = useState("c3d3");'
      );
      code = code.replace(
        headerMarker,
        `<button type="button" onClick={()=>setActiveView("race")} style={{padding:"3px 8px",background:"#171717",border:"1px solid #CC0000",borderRadius:3,color:"#e5e5e5",fontSize:9,fontWeight:"bold",letterSpacing:"0.12em",cursor:"default"}}>RACE TABLE</button>\n          <button type="button" onClick={()=>setActiveView("directed")} style={{padding:"3px 8px",background:"transparent",border:"1px solid #333",borderRadius:3,color:"#888",fontSize:9,fontWeight:"bold",letterSpacing:"0.08em",cursor:"pointer"}}>ANÁLISE DIRECIONADA</button>`
      );
      code = code.replace(
        returnMarker,
        `  if (activeView === "directed") {\n    return <DirectedAnalysis entries={entries} input={input} setInput={setInput} addNumbers={addNumbers} setEntries={setEntries} setFilterSel={setFilterSel} activeStrategyId={activeStrategyId} setActiveStrategyId={setActiveStrategyId} setActiveView={setActiveView} />;\n  }\n\n${returnMarker}`
      );

      return { code, map: null };
    },
  };
}

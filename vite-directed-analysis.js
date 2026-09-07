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
const DIRECTED_PALETTE = { primary: "#FFD700", secondary: "#7a6200", secondaryText: "#fff3a3" };

const DIRECTED_STRATEGIES = [
  { id:"c3d3", label:"C3D3", primary:[27,30,33,36], secondary:[1,11,13,16] },
  { id:"c2d2", label:"C2D2", primary:[29,28,35,26,32], secondary:[0,3,12,7] },
  { id:"32-19-21", label:"32-19-21", primary:[32,19,21], secondary:[4,15,0] },
  { id:"33-31-20", label:"33-31-20", primary:[33,31,20], secondary:[9,14,1,16] },
  { id:"c3-pa", label:"C3 PA", primary:[3,12,18,19,33,24], secondary:[16,22,35] },
];

const DIRECTED_RACETRACK = [
  0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,
  5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26,
];

const DIRECTED_REGION_NUMS = {
  jeuZero: new Set([12,35,3,26,0,32,15]),
  voisins: new Set([22,18,29,7,28,12,35,3,26,0,32,15,19,4,21,2,25]),
  orphelins: new Set([17,34,6,1,20,14,31,9]),
  tier: new Set([27,13,36,11,30,8,23,10,5,24,16,33]),
};

const FILTER_STYLE = {
  c1:{bg:"#4a5320",text:"#d9f99d",border:"#87964a"}, c2:{bg:"#0891b2",text:"#ffffff",border:"#22d3ee"}, c3:{bg:"#ea580c",text:"#ffffff",border:"#fb923c"},
  d1:{bg:"#1e3a8a",text:"#bfdbfe",border:"#60a5fa"}, d2:{bg:"#92400e",text:"#fde68a",border:"#f59e0b"}, d3:{bg:"#7f1d1d",text:"#fca5a5",border:"#ef4444"},
  tier:{bg:"#7c2d12",text:"#fdba74",border:"#f97316"}, orphelins:{bg:"#854d0e",text:"#fefce8",border:"#eab308"}, voisins:{bg:"#166534",text:"#bbf7d0",border:"#22c55e"},
  s1:{bg:"#0c2461",text:"#ffffff",border:"#3b82f6"}, s2:{bg:"#7d6608",text:"#fef9c3",border:"#eab308"}, s3:{bg:"#1a6b8a",text:"#ffffff",border:"#22d3ee"}, s4:{bg:"#935116",text:"#fef9c3",border:"#f59e0b"}, s5:{bg:"#0a3d62",text:"#90caf9",border:"#60a5fa"}, s6:{bg:"#5d4037",text:"#ffe0b2",border:"#a1887f"},
  par:{bg:"#0f1f5c",text:"#bfdbfe",border:"#60a5fa"}, impar:{bg:"#4b5563",text:"#e5e7eb",border:"#9ca3af"},
  baixo:{bg:"#0c4a6e",text:"#7dd3fc",border:"#38bdf8"}, alto:{bg:"#7c0000",text:"#fca5a5",border:"#ef4444"},
  vermelho:{bg:"#CC0000",text:"#fff",border:"#ff6666"}, preto:{bg:"#222222",text:"#e5e5e5",border:"#777"}, zero:{bg:"#1B7A3E",text:"#fff",border:"#4ade80"},
};
const TERMINAL_COLORS = ["#a855f7","#ef4444","#f97316","#eab308","#22c55e","#f59e0b","#60a5fa","#34d399","#f472b6","#818cf8"];

const DIRECTED_FILTERS = [
  { group:"COLUNA", items:[
    {id:"c1",label:"C1",match:n=>getColuna(n)==="C1"},{id:"c2",label:"C2",match:n=>getColuna(n)==="C2"},{id:"c3",label:"C3",match:n=>getColuna(n)==="C3"},
  ]},
  { group:"DÚZIA", items:[
    {id:"d1",label:"D1",match:n=>getDuzia(n)==="D1"},{id:"d2",label:"D2",match:n=>getDuzia(n)==="D2"},{id:"d3",label:"D3",match:n=>getDuzia(n)==="D3"},
  ]},
  { group:"REGIÃO", items:[
    {id:"tier",label:"TIER",match:n=>getRegiao(n)==="Tier"},{id:"orphelins",label:"ORP",match:n=>getRegiao(n)==="Orphelins"},{id:"voisins",label:"VOIS",match:n=>getRegiao(n)==="Voisins"},
  ]},
  { group:"SETOR", items:[1,2,3,4,5,6].map(v=>({id:"s"+v,label:"S"+v,match:n=>getSetor(n)===("S"+v)})) },
  { group:"TERMINAL", items:Array.from({length:10},(_,v)=>({id:"t"+v,label:"T"+v,match:n=>n%10===v})) },
  { group:"PARIDADE", items:[{id:"par",label:"PAR",match:n=>n!==0&&getParidade(n)==="Par"},{id:"impar",label:"ÍMPAR",match:n=>n!==0&&getParidade(n)==="Ímpar"}]},
  { group:"ALTURA", items:[{id:"baixo",label:"1-18",match:n=>n!==0&&getAltoBaixo(n)==="BAIXO"},{id:"alto",label:"19-36",match:n=>n!==0&&getAltoBaixo(n)==="ALTO"}]},
  { group:"COR", items:[{id:"vermelho",label:"VERM",match:n=>getColor(n)==="Vermelho"},{id:"preto",label:"PRETO",match:n=>getColor(n)==="Preto"},{id:"zero",label:"ZERO",match:n=>n===0}]},
];

function DirectedWheelSelector({ selectedNumber,setHoveredNumber,setLockedNumber,entries }) {
  const occurrenceCount=(n)=>entries.reduce((acc,e)=>acc+(e.num===n?1:0),0);
  const selectNumber=(n)=>setLockedNumber(v=>v===n?null:n);
  const wheelSize=302;

  const NumButton=({n})=>{
    const cor=getColor(n); const s=NUM_BALL[cor]||NUM_BALL.Preto; const selected=selectedNumber===n;
    return <button type="button" onMouseEnter={()=>setHoveredNumber(n)} onMouseLeave={()=>setHoveredNumber(null)} onClick={()=>selectNumber(n)} title={"Nº "+n+" · "+occurrenceCount(n)+" ocorrência(s)"}
      style={{width:25,height:25,borderRadius:"50%",padding:0,display:"flex",alignItems:"center",justifyContent:"center",background:selected?"#FFD700":s.bg,color:selected?"#111":s.text,border:selected?"2px solid #fff1a0":"1px solid "+s.border,boxShadow:selected?"0 0 0 2px #7a6200":"none",fontSize:9,fontWeight:900,cursor:"pointer",opacity:selectedNumber!==null&&!selected?.45:1}}>{n}</button>;
  };

  const RegionBlock=({label,sub,bg,border,style,onClick})=><button type="button" onClick={onClick} style={{position:"absolute",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:bg,border:"1px solid "+border,color:"#fff",fontWeight:900,cursor:"pointer",overflow:"hidden",...style}}><span style={{fontSize:10,letterSpacing:".06em",textShadow:"0 1px 2px #000"}}>{label}</span>{sub&&<span style={{fontSize:7,opacity:.72,marginTop:2}}>{sub}</span>}</button>;

  const activateRegion=(key)=>{
    const set=DIRECTED_REGION_NUMS[key];
    const first=[...set][0];
    setLockedNumber(null);
    setHoveredNumber(first);
    setTimeout(()=>setHoveredNumber(null),80);
  };

  return <div style={{border:"1px solid #242a26",borderRadius:8,background:"#080b09",padding:8}}>
    <div style={{fontSize:8,color:"#747d76",letterSpacing:".12em",fontWeight:800,marginBottom:7}}>ROLETA / RACETRACK</div>
    <div style={{position:"relative",width:wheelSize,height:wheelSize,maxWidth:"100%",margin:"0 auto",borderRadius:"50%",background:"radial-gradient(circle at center,#111712 0,#0b0f0c 55%,#050706 78%)",border:"2px solid #2e352f",boxShadow:"inset 0 0 0 6px #0b0e0c"}}>
      <div style={{position:"absolute",left:"50%",top:"50%",width:174,height:174,transform:"translate(-50%,-50%)",borderRadius:"50%",overflow:"hidden",border:"2px solid #394039",background:"#101410"}}>
        <RegionBlock label="Jeu Zéro" sub="12 · 35 · 3 · 26 · 0 · 32 · 15" bg="#27412d" border="#54735a" onClick={()=>activateRegion("jeuZero")} style={{left:44,top:4,width:86,height:35,borderRadius:"0 0 16px 16px"}}/>
        <RegionBlock label="Orphelins" bg="#8b7014" border="#c9aa28" onClick={()=>activateRegion("orphelins")} style={{left:4,top:38,width:48,height:97,borderRadius:"14px 0 0 14px"}}/>
        <RegionBlock label="Orphelins" bg="#8b7014" border="#c9aa28" onClick={()=>activateRegion("orphelins")} style={{right:4,top:38,width:48,height:97,borderRadius:"0 14px 14px 0"}}/>
        <RegionBlock label="Voisins de zéro" bg="#a24a09" border="#e27625" onClick={()=>activateRegion("voisins")} style={{left:50,top:39,width:74,height:82,borderRadius:4}}/>
        <RegionBlock label="Tier" bg="#1c6570" border="#53a9b5" onClick={()=>activateRegion("tier")} style={{left:42,bottom:4,width:90,height:45,borderRadius:"16px 16px 0 0"}}/>
      </div>
      {DIRECTED_RACETRACK.map((n,idx)=>{
        const a=(idx/DIRECTED_RACETRACK.length)*Math.PI*2-Math.PI/2;
        const x=50+45.2*Math.cos(a); const y=50+45.2*Math.sin(a);
        return <div key={n} style={{position:"absolute",left:x+"%",top:y+"%",transform:"translate(-50%,-50%)"}}><NumButton n={n}/></div>;
      })}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginTop:8}}>
      {[{k:"voisins",l:"VOISINS",c:"#a24a09"},{k:"tier",l:"TIER",c:"#1c6570"},{k:"orphelins",l:"ORPHELINS",c:"#8b7014"},{k:"jeuZero",l:"JEU ZÉRO",c:"#27412d"}].map(r=><button key={r.k} type="button" onClick={()=>activateRegion(r.k)} style={{padding:"5px 3px",background:r.c,border:"1px solid #ffffff22",borderRadius:3,color:"#fff",fontSize:7,fontWeight:900,cursor:"pointer"}}>{r.l}</button>)}
    </div>
  </div>;
}

function DirectedAnalysis({ entries,input,setInput,addNumbers,setEntries,setFilterSel,activeStrategyId,setActiveStrategyId,setActiveView }) {
  const [hoveredStrategyId,setHoveredStrategyId]=useState(null);
  const [hoveredNumber,setHoveredNumber]=useState(null);
  const [lockedNumber,setLockedNumber]=useState(null);
  const [strategyOpen,setStrategyOpen]=useState(false);
  const [filterOpen,setFilterOpen]=useState(true);
  const [activeFilters,setActiveFilters]=useState([]);

  const strategyId=hoveredStrategyId||activeStrategyId;
  const fixedStrategy=DIRECTED_STRATEGIES.find(s=>s.id===strategyId)||DIRECTED_STRATEGIES[0];
  const selectedNumber=hoveredNumber??lockedNumber;

  const filterStrategy=useMemo(()=>{
    if(!activeFilters.length) return null;
    const groups=DIRECTED_FILTERS.map(g=>({group:g.group,items:g.items.filter(i=>activeFilters.includes(i.id))})).filter(g=>g.items.length);
    const nums=[];
    for(let n=0;n<=36;n++) if(groups.every(g=>g.items.some(item=>item.match(n)))) nums.push(n);
    const labels=groups.flatMap(g=>g.items.map(i=>i.label));
    return {label:labels.join(" + "),primary:nums,secondary:[]};
  },[activeFilters]);

  const activeStrategy=filterStrategy||fixedStrategy;
  const primarySet=useMemo(()=>new Set(activeStrategy.primary),[activeStrategy]);
  const secondarySet=useMemo(()=>new Set(activeStrategy.secondary),[activeStrategy]);

  const getCellStyle=(entry)=>{
    if(selectedNumber!==null) {
      if(entry.num===selectedNumber) return {background:"#fff7bf",color:"#111",border:"2px solid #FFD700",boxShadow:"inset 0 0 0 1px #8a6d00",opacity:1};
      const ball=NUM_BALL[entry.cor]||NUM_BALL.Preto; return {background:ball.bg,color:ball.text,border:"1px solid #242424",opacity:.18};
    }
    if(primarySet.has(entry.num)) return {background:DIRECTED_PALETTE.primary,color:"#141100",border:"2px solid #fff1a0",boxShadow:"inset 0 0 0 1px #8a6d00",opacity:1};
    if(secondarySet.has(entry.num)) return {background:DIRECTED_PALETTE.secondary,color:DIRECTED_PALETTE.secondaryText,border:"1px solid #c9a900",opacity:1};
    const ball=NUM_BALL[entry.cor]||NUM_BALL.Preto; return {background:ball.bg,color:ball.text,border:"1px solid #242424",opacity:.42};
  };

  const toggleFilter=(id,group)=>{
    setHoveredStrategyId(null); setLockedNumber(null);
    setActiveFilters(prev=>{
      const groupIds=(DIRECTED_FILTERS.find(g=>g.group===group)?.items||[]).map(i=>i.id);
      if(prev.includes(id)) return prev.filter(x=>x!==id);
      return [...prev.filter(x=>!groupIds.includes(x)),id];
    });
  };
  const selectFixedStrategy=(id)=>{setActiveStrategyId(id);setActiveFilters([]);setStrategyOpen(false);setLockedNumber(null);};
  const handleKey=(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addNumbers();}};
  const numberOccurrences=selectedNumber===null?0:entries.reduce((acc,e)=>acc+(e.num===selectedNumber?1:0),0);

  return <div style={{minHeight:"100vh",width:"100vw",maxWidth:"100vw",background:"#070909",color:"#e5e7eb",fontFamily:"Arial, sans-serif",display:"flex",flexDirection:"column"}}>
    <style>{"*{box-sizing:border-box}html,body,#root{margin:0;padding:0;width:100%;min-height:100%;background:#070909}.da-scroll::-webkit-scrollbar{height:7px;width:7px}.da-scroll::-webkit-scrollbar-thumb{background:#303638;border-radius:6px}.da-history{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:3px}.da-num{min-height:34px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;transition:all .08s;cursor:pointer}.da-num:hover{transform:translateY(-1px)}.da-layout{display:grid;grid-template-columns:minmax(325px,365px) minmax(0,1fr);gap:10px;padding:10px;flex:1;min-height:0}@media(max-width:850px){.da-layout{grid-template-columns:1fr}.da-history{grid-template-columns:repeat(auto-fill,minmax(36px,1fr))}}"}</style>

    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderBottom:"1px solid #1c2323",background:"#090b0b",flexWrap:"wrap"}}>
      <span style={{fontSize:14,letterSpacing:"0.28em",color:"#CC0000",fontWeight:"bold",marginRight:4}}>DESTROYER</span>
      <button type="button" onClick={()=>setActiveView("race")} style={{padding:"5px 10px",background:"transparent",border:"1px solid #2b3030",borderRadius:4,color:"#6b7280",fontSize:9,fontWeight:"bold",letterSpacing:"0.13em",cursor:"pointer"}}>RACE TABLE</button>
      <button type="button" style={{padding:"5px 10px",background:"#211c00",border:"1px solid #FFD700",borderRadius:4,color:"#FFD700",fontSize:9,fontWeight:"bold",letterSpacing:"0.10em"}}>ANÁLISE DIRECIONADA</button>
      <span style={{marginLeft:"auto",fontSize:9,color:"#5f6767"}}>{entries.length} números</span>
    </div>

    <div className="da-layout">
      <aside style={{background:"#0b0f0f",border:"1px solid #1d2626",borderRadius:6,padding:9,display:"flex",flexDirection:"column",gap:9,minWidth:0}}>
        <div>
          <div style={{fontSize:8,color:"#667070",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Estratégia fixa</div>
          <button type="button" onClick={()=>setStrategyOpen(v=>!v)} style={{width:"100%",padding:"8px 9px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#111717",border:"1px solid #293232",borderRadius:4,color:"#e5e7eb",fontSize:11,fontWeight:"bold",cursor:"pointer"}}><span>{filterStrategy?("FILTRO · "+filterStrategy.label):fixedStrategy.label}</span><span style={{color:"#FFD700"}}>{strategyOpen?"▲":"▼"}</span></button>
          {strategyOpen&&<div style={{marginTop:4,border:"1px solid #202929",borderRadius:4,overflow:"hidden",background:"#0d1212"}}>{DIRECTED_STRATEGIES.map(s=>{const active=!filterStrategy&&s.id===activeStrategyId;return <button key={s.id} type="button" onMouseEnter={()=>setHoveredStrategyId(s.id)} onMouseLeave={()=>setHoveredStrategyId(null)} onClick={()=>selectFixedStrategy(s.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"7px 8px",background:active?"#2a2300":"transparent",border:"none",borderBottom:"1px solid #161d1d",color:active?"#FFD700":"#a3aaaa",fontSize:10,textAlign:"left",cursor:"pointer"}}><span style={{width:8,height:8,borderRadius:"50%",background:active?"#FFD700":"#7a6200"}}/><span style={{fontWeight:active?900:600}}>{s.label}</span></button>})}</div>}
        </div>

        <div style={{border:"1px solid #1c2420",borderRadius:5,background:"#090d0b"}}>
          <button type="button" onClick={()=>setFilterOpen(v=>!v)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 8px",background:"transparent",border:0,color:"#9ba39d",fontSize:8,fontWeight:900,letterSpacing:".11em",cursor:"pointer"}}><span>FILTROS RÁPIDOS</span><span style={{color:"#FFD700"}}>{filterOpen?"−":"+"}</span></button>
          {filterOpen&&<div style={{padding:"0 7px 7px",display:"flex",flexDirection:"column",gap:6}}>{DIRECTED_FILTERS.map(group=><div key={group.group}><div style={{fontSize:7,color:"#555f58",marginBottom:3}}>{group.group}</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{group.items.map(item=>{const active=activeFilters.includes(item.id);const term=item.id[0]==="t"&&item.id.length<=3;const base=term?{bg:TERMINAL_COLORS[parseInt(item.id.slice(1))]+"33",text:TERMINAL_COLORS[parseInt(item.id.slice(1))],border:TERMINAL_COLORS[parseInt(item.id.slice(1))]}:(FILTER_STYLE[item.id]||{bg:"#111512",text:"#777f79",border:"#292f2b"});return <button key={item.id} type="button" onClick={()=>toggleFilter(item.id,group.group)} style={{padding:"4px 6px",borderRadius:3,background:active?base.bg:"#111512",border:"1px solid "+(active?base.border:"#292f2b"),color:active?base.text:"#777f79",fontSize:8,fontWeight:900,cursor:"pointer",boxShadow:active?"inset 0 0 0 1px #ffffff15":"none"}}>{item.label}</button>})}</div></div>)}{activeFilters.length>0&&<div style={{display:"flex",alignItems:"center",gap:6,paddingTop:3,borderTop:"1px solid #1a211c"}}><span style={{fontSize:8,color:"#c6af32",fontWeight:800,flex:1}}>MONTADA: {filterStrategy?.label||"—"} · {filterStrategy?.primary.length||0} nº</span><button type="button" onClick={()=>setActiveFilters([])} style={{padding:"3px 6px",background:"transparent",border:"1px solid #3a3f3b",color:"#7d857f",borderRadius:3,fontSize:7,cursor:"pointer"}}>LIMPAR</button></div>}</div>}
        </div>

        {!filterStrategy&&<div style={{padding:"7px 8px",border:"1px solid #1b211d",borderRadius:4,background:"#090c0a"}}><div style={{fontSize:8,color:"#69716b",letterSpacing:".1em",marginBottom:6}}>DESTAQUES</div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}><span style={{width:11,height:11,borderRadius:2,background:DIRECTED_PALETTE.primary,border:"1px solid #fff1a0"}}/><span style={{fontSize:9,color:"#b8c0ba"}}>Principais</span><span style={{fontSize:8,color:"#7e857f",marginLeft:"auto"}}>{fixedStrategy.primary.join(" · ")}</span></div><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:11,height:11,borderRadius:2,background:DIRECTED_PALETTE.secondary,border:"1px solid #c9a900"}}/><span style={{fontSize:9,color:"#b8c0ba"}}>Secundários</span><span style={{fontSize:8,color:"#7e857f",marginLeft:"auto"}}>{fixedStrategy.secondary.join(" · ")}</span></div></div>}

        <DirectedWheelSelector selectedNumber={selectedNumber} setHoveredNumber={setHoveredNumber} setLockedNumber={setLockedNumber} entries={entries}/>
        {selectedNumber!==null&&<div style={{fontSize:9,color:"#8d9797"}}>Nº <b style={{color:"#FFD700"}}>{selectedNumber}</b> · {numberOccurrences} ocorrência(s)</div>}
      </aside>

      <main style={{minWidth:0,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><div style={{fontSize:8,color:"#687171",textTransform:"uppercase",letterSpacing:"0.12em"}}>Histórico geral</div><div style={{height:1,background:"#1b2222",flex:1,minWidth:30}}/>{filterStrategy&&<span style={{fontSize:8,color:"#FFD700",fontWeight:900}}>FILTRO: {filterStrategy.label}</span>}{selectedNumber!==null&&<button type="button" onClick={()=>{setLockedNumber(null);setHoveredNumber(null)}} style={{padding:"4px 8px",border:"1px solid #514500",background:"transparent",color:"#c8ad27",borderRadius:3,fontSize:8,cursor:"pointer"}}>LIMPAR Nº</button>}</div>
        <div className="da-scroll" style={{flex:1,minHeight:320,maxHeight:"calc(100vh - 175px)",overflowY:"auto",background:"#090c0c",border:"1px solid #1a2222",borderRadius:5,padding:7}}>{entries.length===0?<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:"#363f3f",fontSize:10,letterSpacing:"0.09em",textTransform:"uppercase"}}>Insira números para iniciar o histórico</div>:<div className="da-history">{entries.map((entry,idx)=><div key={entry.id??idx} className="da-num" onMouseEnter={()=>setHoveredNumber(entry.num)} onMouseLeave={()=>setHoveredNumber(null)} onClick={()=>setLockedNumber(v=>v===entry.num?null:entry.num)} title={"#"+(idx+1)+" · número "+entry.num} style={getCellStyle(entry)}>{entry.num}</div>)}</div>}</div>
      </main>
    </div>

    <div style={{borderTop:"1px solid #1b2222",background:"#080b0b",padding:"8px 10px",display:"flex",gap:8,alignItems:"stretch"}}>
      <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} placeholder="Cole ou digite: 23 10 11  ou  23,10,11  — Enter para adicionar" rows={2} style={{flex:1,minWidth:0,background:"#101414",border:"1px solid #283030",borderRadius:3,color:"#e5e7eb",padding:"7px 10px",fontSize:12,fontFamily:"Arial, sans-serif",resize:"none",outline:"none"}}/>
      <button type="button" onClick={addNumbers} style={{padding:"0 20px",background:"#CC0000",border:"none",borderRadius:3,color:"#fff",fontSize:11,fontWeight:"bold",letterSpacing:"0.1em",cursor:"pointer"}}>ADD</button>
      <button type="button" onClick={()=>{setEntries([]);setFilterSel({});}} style={{padding:"0 14px",background:"transparent",border:"1px solid #333",borderRadius:3,color:"#666",fontSize:11,cursor:"pointer"}}>CLR</button>
      <button type="button" onClick={()=>{setEntries(prev=>prev.slice(0,-1));setFilterSel({});}} disabled={entries.length===0} style={{padding:"0 14px",background:"transparent",border:"1px solid #444",borderRadius:3,color:entries.length===0?"#333":"#aaa",fontSize:11,cursor:entries.length===0?"default":"pointer"}}>↩</button>
    </div>
  </div>;
}

`;

      code = code.replace(componentMarker, directedComponent + componentMarker);
      code = code.replace(stateMarker, stateMarker + '\n  const [activeView, setActiveView] = useState("race");\n  const [activeStrategyId, setActiveStrategyId] = useState("c3d3");');
      code = code.replace(headerMarker, `<button type="button" onClick={()=>setActiveView("race")} style={{padding:"3px 8px",background:"#171717",border:"1px solid #CC0000",borderRadius:3,color:"#e5e5e5",fontSize:9,fontWeight:"bold",letterSpacing:"0.12em",cursor:"default"}}>RACE TABLE</button>\n          <button type="button" onClick={()=>setActiveView("directed")} style={{padding:"3px 8px",background:"transparent",border:"1px solid #333",borderRadius:3,color:"#888",fontSize:9,fontWeight:"bold",letterSpacing:"0.08em",cursor:"pointer"}}>ANÁLISE DIRECIONADA</button>`);
      code = code.replace(returnMarker, `  if (activeView === "directed") {\n    return <DirectedAnalysis entries={entries} input={input} setInput={setInput} addNumbers={addNumbers} setEntries={setEntries} setFilterSel={setFilterSel} activeStrategyId={activeStrategyId} setActiveStrategyId={setActiveStrategyId} setActiveView={setActiveView} />;\n  }\n\n${returnMarker}`);

      return { code, map: null };
    },
  };
}
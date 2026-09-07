export default function terminalSideAlertPatch() {
  return {
    name: 'destroyer-terminal-side-alert-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;
      const start = src.indexOf('function TerminalPullAnalysis({ entries }) {');
      const end = src.indexOf('\nfunction QuadrantSignal({ entries }) {', start);
      if (start === -1 || end === -1) return { code: src, map: null };

      const replacement = `function TerminalPullAnalysis({ entries, filterSel, onSelectTerminal }) {
  if(!entries || entries.length < 10) return null;

  const [ackKey, setAckKey] = useState(null);

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

    const tCnt = {};
    occurrences.forEach(o=>{ tCnt[o.nextT]=(tCnt[o.nextT]||0)+1; });
    const best = Object.entries(tCnt).sort((a,b)=>b[1]-a[1])[0];
    if(!best) continue;
    const [bestT, cnt] = best;
    if(cnt < 2) continue;

    results.push({srcT:t,dstT:parseInt(bestT),cnt,total:occurrences.length,occurrences});
  }

  if(results.length === 0) return null;

  const tColors = ["#a855f7","#ef4444","#f97316","#eab308","#22c55e","#f59e0b","#60a5fa","#34d399","#f472b6","#818cf8"];
  const lastEntry = entries[entries.length-1];
  const lastTerminal = getTerminal(lastEntry?.num);
  const eventKey = lastEntry ? String(lastEntry.id ?? entries.length) + ':' + String(lastEntry.num) : '';

  const terminalSelected = (t) => {
    const cur = filterSel?.terminal;
    const label = 'T'+t;
    return Array.isArray(cur) ? cur.includes(label) : cur === label;
  };

  const handleTerminalClick = (t, isHit) => {
    if(isHit) setAckKey(eventKey + ':T' + t);
    onSelectTerminal?.('terminal', 'T'+t);
  };

  return (
    <div style={{borderTop:"2px solid #1e1e1e",padding:"8px 12px",background:"#080808",flexShrink:0}}>
      <style>{\`
        @keyframes terminalHitPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,215,0,.20), 0 0 7px rgba(255,215,0,.55); transform:scale(1); }
          50% { box-shadow: 0 0 0 5px rgba(255,215,0,.05), 0 0 18px rgba(255,215,0,1); transform:scale(1.09); }
        }
        .terminal-hit-alert { animation: terminalHitPulse .62s ease-in-out infinite; }
      \`}</style>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:8}}>TERMINAL PUXA TERMINAL</div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {results.map(({srcT,dstT,cnt,total,occurrences})=>{
          const srcC=tColors[srcT], dstC=tColors[dstT];
          const pct=Math.round(cnt/total*100);
          const hitNow=lastTerminal===dstT;
          const alertKey=eventKey+':T'+dstT;
          const blinking=hitNow && ackKey!==alertKey;
          const srcSelected=terminalSelected(srcT);
          const dstSelected=terminalSelected(dstT);
          return (
            <div key={srcT} style={{display:"flex",alignItems:"center",gap:6,background:blinking?"#171300":"#0a0a0a",border:blinking?"1px solid #FFD700":"1px solid #222",borderRadius:4,padding:"4px 8px"}}>
              <button type="button" onClick={()=>handleTerminalClick(srcT,false)} title={srcSelected?"Remover T"+srcT+" do filtro":"Filtrar por T"+srcT}
                style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:srcSelected?srcC+"55":srcC+"22",border:srcSelected?"3px solid #FFD700":"2px solid "+srcC,color:srcC,fontSize:10,fontWeight:"bold",flexShrink:0,cursor:"pointer",padding:0}}>T{srcT}</button>
              <span style={{fontSize:12,color:"#444"}}>→</span>
              <button type="button" className={blinking?"terminal-hit-alert":""} onClick={()=>handleTerminalClick(dstT,hitNow)} title={blinking?"T"+dstT+" CHEGOU — clique para reconhecer e filtrar":dstSelected?"Remover T"+dstT+" do filtro":"Filtrar por T"+dstT}
                style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:blinking?"#FFD700":dstSelected?dstC+"55":dstC+"22",border:blinking?"3px solid #fff1a0":dstSelected?"3px solid #FFD700":"2px solid "+dstC,color:blinking?"#111":dstC,fontSize:10,fontWeight:"900",flexShrink:0,cursor:"pointer",padding:0}}>T{dstT}</button>
              {blinking && <span style={{fontSize:7,color:"#FFD700",fontWeight:"900",letterSpacing:".05em"}}>CHEGOU!</span>}
              <span style={{fontSize:9,color:"#FFD700",fontWeight:"bold"}}>{cnt}/{total}</span>
              <div style={{flex:1,height:5,background:"#1a1a1a",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:pct===100?"#FFD700":dstC}}/></div>
              <span style={{fontSize:8,color:"#555"}}>{pct}%</span>
              <div style={{display:"flex",gap:2}}>{occurrences.map((o,idx)=>{const match=o.nextT===dstT;return <div key={idx} style={{width:14,height:14,borderRadius:"50%",background:match?dstC+"44":"#111",border:"1px solid "+(match?dstC:"#333"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:match?dstC:"#444"}}>{o.nextNum}</div>})}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`;

      src = src.slice(0,start) + replacement + src.slice(end);
      src = src.replace(
        '<TerminalPullAnalysis entries={entries}/>',
        '<TerminalPullAnalysis entries={entries} filterSel={filterSel} onSelectTerminal={selectProbabilityFilter}/>'
      );

      return { code: src, map: null };
    },
  };
}

export default function directedWheelRefinePatch() {
  return {
    name: 'directed-wheel-refine-patch',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/App.jsx') && !id.endsWith('\\src\\App.jsx')) return null;
      const start = code.indexOf('function DirectedWheelSelector(');
      const end = code.indexOf('function DirectedAnalysis(', start);
      if (start < 0 || end < 0) return null;

      const refined = `function DirectedWheelSelector({ selectedNumber,setHoveredNumber,setLockedNumber,entries,setHoveredGroupNums,lockedGroupKey,setLockedGroupKey }) {
  const occurrenceCount=(n)=>entries.reduce((acc,e)=>acc+(e.num===n?1:0),0);
  const selectNumber=(n)=>{setLockedGroupKey(null);setLockedNumber(v=>v===n?null:n);};
  const size=324, center=162, radius=144;
  const activeGroup=(key)=>lockedGroupKey===key;
  const groupEnter=(key)=>setHoveredGroupNums(DIRECTED_REGION_NUMS[key]);
  const groupLeave=()=>setHoveredGroupNums(null);
  const groupClick=(key)=>{setLockedNumber(null);setLockedGroupKey(v=>v===key?null:key);};

  const NumButton=({n})=>{
    const cor=getColor(n); const s=NUM_BALL[cor]||NUM_BALL.Preto; const selected=selectedNumber===n;
    return <button type="button" onMouseEnter={()=>setHoveredNumber(n)} onMouseLeave={()=>setHoveredNumber(null)} onClick={()=>selectNumber(n)} title={"Nº "+n+" · "+occurrenceCount(n)+" ocorrência(s)"}
      style={{width:23,height:23,borderRadius:"50%",padding:0,display:"flex",alignItems:"center",justifyContent:"center",background:selected?"#FFD700":s.bg,color:selected?"#111":s.text,border:selected?"2px solid #fff1a0":"1px solid "+s.border,boxShadow:selected?"0 0 0 2px #7a6200":"none",fontSize:8,fontWeight:900,cursor:"pointer",opacity:selectedNumber!==null&&!selected?.42:1}}>{n}</button>;
  };

  const RegionHit=({k,label,x,y,fill,stroke})=>{
    const active=activeGroup(k);
    return <g role="button" tabIndex="0" style={{cursor:"pointer"}} onMouseEnter={()=>groupEnter(k)} onMouseLeave={groupLeave} onClick={()=>groupClick(k)}>
      <circle cx={x} cy={y} r={active?28:24} fill={active?"#FFD70022":"transparent"} stroke={active?"#FFD700":"transparent"} strokeWidth="2"/>
      <text x={x} y={y+3} textAnchor="middle" fill={active?"#FFD700":"#fff"} fontSize="11" fontWeight="800" style={{pointerEvents:"none",textShadow:"0 1px 2px #000"}}>{label}</text>
    </g>;
  };

  return <div style={{border:"1px solid #242a26",borderRadius:8,background:"#070a08",padding:"8px 8px 9px"}}>
    <div style={{fontSize:8,color:"#747d76",letterSpacing:".12em",fontWeight:800,marginBottom:6}}>ROLETA / RACETRACK</div>
    <div style={{position:"relative",width:size,height:size,maxWidth:"100%",margin:"0 auto"}}>
      <svg viewBox="0 0 324 324" width="100%" height="100%" aria-label="Racetrack europeu com regiões">
        <circle cx="162" cy="162" r="158" fill="#050706" stroke="#2b312d" strokeWidth="2"/>
        <circle cx="162" cy="162" r="126" fill="#0b0f0c" stroke="#242b26" strokeWidth="1"/>
        <circle cx="162" cy="162" r="104" fill="#334d3d" stroke="#596b5e" strokeWidth="1.2"/>

        {/* Voisins de zéro: região base superior/central */}
        <path d="M58 162 A104 104 0 0 1 266 162 L162 162 Z" fill="#334d3d" stroke="#18251d" strokeWidth="1"/>
        {/* Orphelins esquerdo */}
        <path d="M58 162 A104 104 0 0 0 107 252 L162 162 Z" fill="#e5a11a" stroke="#6f4d06" strokeWidth="1.2"/>
        {/* Tier */}
        <path d="M107 252 A104 104 0 0 0 217 252 L162 162 Z" fill="#405a86" stroke="#21334f" strokeWidth="1.2"/>
        {/* Orphelins direito */}
        <path d="M217 252 A104 104 0 0 0 266 162 L162 162 Z" fill="#e5a11a" stroke="#6f4d06" strokeWidth="1.2"/>
        {/* Jeu Zéro: faixa superior curva */}
        <path d="M108 73 A104 104 0 0 1 216 73 L199 109 Q162 94 125 109 Z" fill="#3f5947" stroke="#17231b" strokeWidth="1.2"/>

        <text x="162" y="102" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">Jeu Zéro</text>
        <text x="162" y="135" textAnchor="middle" fill="#fff" fontSize="12">Voisins de zéro</text>
        <text x="92" y="181" textAnchor="middle" fill="#171100" fontSize="10" fontWeight="800">Orphelins</text>
        <text x="232" y="181" textAnchor="middle" fill="#171100" fontSize="10" fontWeight="800">Orphelins</text>
        <text x="162" y="228" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">Tier</text>

        {/* áreas amplas de interação */}
        <g opacity="0.001">
          <path d="M58 162 A104 104 0 0 1 266 162 L162 162 Z" fill="#fff" onMouseEnter={()=>groupEnter("voisins")} onMouseLeave={groupLeave} onClick={()=>groupClick("voisins")} style={{cursor:"pointer"}}/>
          <path d="M58 162 A104 104 0 0 0 107 252 L162 162 Z" fill="#fff" onMouseEnter={()=>groupEnter("orphelins")} onMouseLeave={groupLeave} onClick={()=>groupClick("orphelins")} style={{cursor:"pointer"}}/>
          <path d="M217 252 A104 104 0 0 0 266 162 L162 162 Z" fill="#fff" onMouseEnter={()=>groupEnter("orphelins")} onMouseLeave={groupLeave} onClick={()=>groupClick("orphelins")} style={{cursor:"pointer"}}/>
          <path d="M107 252 A104 104 0 0 0 217 252 L162 162 Z" fill="#fff" onMouseEnter={()=>groupEnter("tier")} onMouseLeave={groupLeave} onClick={()=>groupClick("tier")} style={{cursor:"pointer"}}/>
          <path d="M108 73 A104 104 0 0 1 216 73 L199 109 Q162 94 125 109 Z" fill="#fff" onMouseEnter={()=>groupEnter("jeuZero")} onMouseLeave={groupLeave} onClick={()=>groupClick("jeuZero")} style={{cursor:"pointer"}}/>
        </g>
      </svg>

      {DIRECTED_RACETRACK.map((n,idx)=>{
        const a=(idx/DIRECTED_RACETRACK.length)*Math.PI*2-Math.PI/2;
        const x=center+radius*Math.cos(a); const y=center+radius*Math.sin(a);
        return <div key={n} style={{position:"absolute",left:x,top:y,transform:"translate(-50%,-50%)",zIndex:3}}><NumButton n={n}/></div>;
      })}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1.25fr 1fr",gap:4,marginTop:5}}>
      {[
        {k:"voisins",l:"VOISINS",bg:"#334d3d",fg:"#dff4e5"},
        {k:"tier",l:"TIER",bg:"#405a86",fg:"#e9f0ff"},
        {k:"orphelins",l:"ORPHELINS",bg:"#e5a11a",fg:"#171100"},
        {k:"jeuZero",l:"JEU ZÉRO",bg:"#3f5947",fg:"#fff"},
      ].map(r=>{
        const active=activeGroup(r.k);
        return <button key={r.k} type="button" onMouseEnter={()=>groupEnter(r.k)} onMouseLeave={groupLeave} onClick={()=>groupClick(r.k)} style={{padding:"5px 3px",background:r.bg,border:active?"2px solid #FFD700":"1px solid #ffffff22",borderRadius:3,color:active?"#FFD700":r.fg,fontSize:7,fontWeight:900,cursor:"pointer"}}>{r.l}</button>;
      })}
    </div>
  </div>;
}

`;

      code = code.slice(0,start) + refined + code.slice(end);

      const stateMarker='  const [activeFilters,setActiveFilters]=useState([]);';
      if (code.includes(stateMarker) && !code.includes('hoveredGroupNums,setHoveredGroupNums')) {
        code=code.replace(stateMarker,stateMarker+'\n  const [hoveredGroupNums,setHoveredGroupNums]=useState(null);\n  const [lockedGroupKey,setLockedGroupKey]=useState(null);');
      }

      const selectedMarker='  const selectedNumber=hoveredNumber??lockedNumber;';
      if (code.includes(selectedMarker) && !code.includes('const directedGroupNums=')) {
        code=code.replace(selectedMarker,selectedMarker+'\n  const directedGroupNums=hoveredGroupNums||(lockedGroupKey?DIRECTED_REGION_NUMS[lockedGroupKey]:null);');
      }

      const styleMarker='  const getCellStyle=(entry)=>{\n    if(selectedNumber!==null) {';
      if (code.includes(styleMarker) && !code.includes('directedGroupNums&&selectedNumber===null')) {
        code=code.replace(styleMarker,'  const getCellStyle=(entry)=>{\n    if(directedGroupNums&&selectedNumber===null){\n      const ball=NUM_BALL[entry.cor]||NUM_BALL.Preto;\n      if(directedGroupNums.has(entry.num)) return {background:ball.bg,color:ball.text,border:"2px solid #FFD700",boxShadow:"inset 0 0 0 1px #8a6d00",opacity:1};\n      return {background:ball.bg,color:ball.text,border:"1px solid #242424",opacity:.16};\n    }\n    if(selectedNumber!==null) {');
      }

      const oldCall='<DirectedWheelSelector selectedNumber={selectedNumber} setHoveredNumber={setHoveredNumber} setLockedNumber={setLockedNumber} entries={entries}/>';
      const newCall='<DirectedWheelSelector selectedNumber={selectedNumber} setHoveredNumber={setHoveredNumber} setLockedNumber={setLockedNumber} entries={entries} setHoveredGroupNums={setHoveredGroupNums} lockedGroupKey={lockedGroupKey} setLockedGroupKey={setLockedGroupKey}/>';
      if (code.includes(oldCall)) code=code.replace(oldCall,newCall);

      return {code,map:null};
    }
  };
}

export default function radarCleanup() {
  return {
    name: 'destroyer-radar-cleanup',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;
      const start = src.indexOf('function PatternCatalog({ entries, onApplyFilters }) {');
      const end = src.indexOf('\nlet idCounter = 0;', start);
      if (start === -1 || end === -1) return { code: src, map: null };

      const replacement = `function PatternCatalog({ entries }) {
  if(!entries || entries.length < 6) return null;

  const houseOf = (e) => e?.grupoDezena || getGrupoDezena(e?.num);

  // Somente características aprovadas para a leitura de repetição/alternância de CASA.
  // A/B, FRA e CAVALO ficam explicitamente fora desta análise.
  const featureDefs = [
    {key:"parte",label:"PTE",fn:e=>e?.parte||getParte(e?.num)},
    {key:"coluna",label:"COL",fn:e=>e?.coluna||getColuna(e?.num)},
    {key:"paridade",label:"P/I",fn:e=>e?.paridade||getParidade(e?.num)},
    {key:"lado",label:"LADO",fn:e=>e?.lado||getLado(e?.num)},
    {key:"opo",label:"OPO",fn:e=>e?.opo||getOpo(e?.num)},
    {key:"cor",label:"COR",fn:e=>e?.cor||getColor(e?.num)},
    {key:"duzia",label:"DÚZIA",fn:e=>e?.duzia||getDuzia(e?.num)},
    {key:"ruaPar",label:"R/P",fn:e=>getRuaParidade(e?.num)},
  ];

  const valid = (v) => v && v!=="—" && v!=="0";
  const current = entries[entries.length-1];
  const currentHouse = houseOf(current);
  const currentHouseScheme = GRUPO_DEZENA_CELL[currentHouse] || GRUPO_DEZENA_CELL["—"];

  // Todas as transições históricas que começaram na CASA atual.
  const sourceTransitions = [];
  for(let i=0;i<entries.length-1;i++){
    const a=entries[i], b=entries[i+1];
    if(houseOf(a)===currentHouse){
      sourceTransitions.push({a,b,repeated:houseOf(b)===currentHouse});
    }
  }

  const repeatedTransitions = sourceTransitions.filter(x=>x.repeated);
  const repeatPct = sourceTransitions.length
    ? Math.round(repeatedTransitions.length/sourceTransitions.length*100)
    : 0;

  // Entre as repetições reais de CASA, mede apenas se cada característica
  // permaneceu igual ou mudou.
  const strongRows = featureDefs.map(fd=>{
    const usable = repeatedTransitions.filter(x=>valid(fd.fn(x.a)) && valid(fd.fn(x.b)));
    if(!usable.length) return null;
    const same = usable.filter(x=>fd.fn(x.a)===fd.fn(x.b)).length;
    const changed = usable.length - same;
    const samePct = Math.round(same/usable.length*100);
    const changePct = Math.round(changed/usable.length*100);
    const keep = samePct >= changePct;
    const pct = keep ? samePct : changePct;
    return {...fd,usable:usable.length,same,changed,samePct,changePct,keep,pct};
  })
    .filter(Boolean)
    .filter(x=>x.usable>=4 && x.pct>=60)
    .sort((a,b)=>b.pct-a.pct || b.usable-a.usable);

  // Sinal favorável: mantém a repetição da CASA como contexto informativo,
  // mas não exige 60%. O sinal nasce quando existe amostra mínima da CASA
  // e pelo menos uma característica forte com concentração >=80%.
  const favorableHouseSignal = sourceTransitions.length >= 4 && strongRows.some(x=>x.pct>=80);

  return (
    <div style={{padding:"8px 0",borderTop:"1px solid #1a1a1a",marginTop:4}}>
      <div style={{background:favorableHouseSignal?"#0b130d":"#080808",border:favorableHouseSignal?"2px solid #22c55e":"1px solid #242424",borderRadius:5,padding:"8px 10px",boxShadow:favorableHouseSignal?"0 0 9px #22c55e22":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:7}}>
          <span style={{fontSize:8,color:"#CC0000",fontWeight:"bold",letterSpacing:"0.1em"}}>◆ RADAR DE REPETIÇÃO DE CASA</span>
          <span style={{fontSize:10,fontWeight:"bold",color:currentHouseScheme.text,background:currentHouseScheme.bg,padding:"2px 7px",borderRadius:2}}>CASA {currentHouse}</span>
          <span style={{fontSize:8,color:"#777"}}>{repeatedTransitions.length}/{sourceTransitions.length} repetições • {repeatPct}%</span>
          {favorableHouseSignal && (
            <span style={{fontSize:8,color:"#bbf7d0",background:"#14532d",border:"1px solid #22c55e",padding:"2px 7px",borderRadius:3,fontWeight:"bold",letterSpacing:"0.04em"}}>● SINAL FAVORÁVEL CASA {currentHouse}</span>
          )}
        </div>

        {strongRows.length>0 ? (
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {strongRows.map(x=>(
              <div key={x.key} title={\`Nas \${x.usable} repetições válidas da CASA \${currentHouse}, esta característica \${x.keep?"manteve":"mudou"} em \${x.pct}% dos casos.\`}
                style={{display:"grid",gridTemplateColumns:"70px 1fr 64px",gap:5,alignItems:"center",background:"#0b0b0b",padding:"4px 7px",borderRadius:3}}>
                <span style={{fontSize:7,color:"#666",fontWeight:"bold"}}>{x.label}</span>
                <span style={{fontSize:8,color:x.keep?"#86efac":"#fca5a5",fontWeight:"bold"}}>{x.keep?"MANTÉM":"MUDA"}</span>
                <span style={{fontSize:8,color:"#FFD700",fontWeight:"bold",textAlign:"right"}}>{x.pct}% <span style={{color:"#555",fontWeight:"normal"}}>({x.usable})</span></span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{fontSize:8,color:"#444"}}>Sem característica aprovada com amostra e concentração suficientes nesta CASA.</div>
        )}

        {!favorableHouseSignal && sourceTransitions.length>=4 && (
          <div style={{marginTop:7,fontSize:7,color:"#555"}}>CASA {currentHouse} monitorada, mas ainda sem condição favorável de sinal.</div>
        )}
      </div>
    </div>
  );
}
`;

      src = src.slice(0, start) + replacement + src.slice(end);
      return { code: src, map: null };
    },
  };
}

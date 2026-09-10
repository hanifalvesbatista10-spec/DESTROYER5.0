export default function terminalTop3Last10Patch() {
  return {
    name: 'destroyer-terminal-top3-last10-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;
      const marker = '<div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:6}}>TERMINAL PUXA TERMINAL</div>';
      if (!src.includes(marker) || src.includes('TOP 3 TERMINAIS • ÚLTIMOS 10')) return { code: src, map: null };

      const replacement = `<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginBottom:6}}>
        <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase"}}>TERMINAL PUXA TERMINAL</div>
        {(() => {
          const last10 = entries.slice(-10);
          const cnt = Array.from({length:10},()=>0);
          last10.forEach(e=>{
            const t=getTerminal(e.num);
            if(t!==null) cnt[t]++;
          });
          const latestPos = Array(10).fill(-1);
          last10.forEach((e,i)=>{ const t=getTerminal(e.num); if(t!==null) latestPos[t]=i; });
          const top3 = cnt.map((c,t)=>({t,c,last:latestPos[t]}))
            .sort((a,b)=>b.c-a.c || b.last-a.last || a.t-b.t)
            .slice(0,3);
          return <div title="Top 3 terminais por frequência nos últimos 10 números" style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
            <span style={{fontSize:6,color:"#444",fontWeight:"bold",letterSpacing:".05em",whiteSpace:"nowrap"}}>TOP 3 • U10</span>
            {top3.map((x,idx)=>{
              const c=tColors[x.t];
              return <div key={x.t} style={{display:"flex",alignItems:"center",gap:2,background:"#0b0b0b",border:"1px solid "+c+"66",borderRadius:10,padding:"2px 4px"}}>
                <span style={{fontSize:6,color:"#666",fontWeight:"bold"}}>#{idx+1}</span>
                <span style={{width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:c+"22",border:"1px solid "+c,color:c,fontSize:7,fontWeight:"900"}}>T{x.t}</span>
                <span style={{fontSize:7,color:"#aaa",fontWeight:"bold"}}>{x.c}x</span>
              </div>;
            })}
          </div>;
        })()}
      </div>`;

      src = src.replace(marker, replacement);
      return { code: src, map: null };
    },
  };
}

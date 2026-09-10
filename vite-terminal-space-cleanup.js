export default function terminalSpaceCleanupPatch() {
  return {
    name: 'destroyer-terminal-space-cleanup-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // Remove o bloco antigo TOP 5 ULT 50 + TOP 2 GP da lateral para liberar espaço.
      src = src.replace('      <SidebarTop50Summary entries={sharedEntries}/>\n', '');

      // O TOP 3 dos últimos 10 fica em uma faixa PRÓPRIA acima da tabela dos terminais.
      // Não divide mais a mesma linha com "TERMINAL PUXA TERMINAL", evitando quebra e compressão.
      const marker = '<div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:6}}>TERMINAL PUXA TERMINAL</div>';
      if (src.includes(marker) && !src.includes('TOP TERMINAIS • ÚLTIMOS 10')) {
        const replacement = `<div style={{width:"100%",boxSizing:"border-box",background:"#090909",border:"1px solid #1d1d1d",borderRadius:4,padding:"5px 6px",marginBottom:6,minWidth:0}}>
        <div style={{fontSize:6,color:"#555",fontWeight:"800",letterSpacing:".08em",textTransform:"uppercase",marginBottom:4,whiteSpace:"nowrap"}}>TOP TERMINAIS • ÚLTIMOS 10</div>
        {(() => {
          const last10 = entries.slice(-10);
          const cnt = Array.from({length:10},()=>0);
          const latestPos = Array(10).fill(-1);
          last10.forEach((e,i)=>{
            const t=getTerminal(e.num);
            if(t!==null){ cnt[t]++; latestPos[t]=i; }
          });
          const top3 = cnt.map((c,t)=>({t,c,last:latestPos[t]}))
            .sort((a,b)=>b.c-a.c || b.last-a.last || a.t-b.t)
            .slice(0,3);
          return <div title="Top 3 terminais nos últimos 10 números" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:4,width:"100%",minWidth:0}}>
            {top3.map((x,idx)=>{
              const c=tColors[x.t];
              return <div key={x.t} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,minWidth:0,background:"#0b0b0b",border:"1px solid "+c+"66",borderRadius:12,padding:"3px 4px"}}>
                <span style={{fontSize:6,color:"#666",fontWeight:"bold",flexShrink:0}}>#{idx+1}</span>
                <span style={{width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:c+"22",border:"1.5px solid "+c,color:c,fontSize:8,fontWeight:"900",lineHeight:1,flexShrink:0}}>T{x.t}</span>
                <span style={{fontSize:7,color:"#aaa",fontWeight:"900",whiteSpace:"nowrap",flexShrink:0}}>{x.c}x</span>
              </div>;
            })}
          </div>;
        })()}
      </div>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:6,whiteSpace:"nowrap"}}>TERMINAL PUXA TERMINAL</div>`;
        src = src.replace(marker, replacement);
      }

      return { code: src, map: null };
    },
  };
}

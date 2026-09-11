export default function filterResultsLayoutPatch() {
  return {
    name: 'destroyer-filter-results-layout-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // Bloco original de resultados do filtro (fica abaixo dos botoes no App base).
      const originalResults = `              {hasFilter && (
                <div style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:7,color:"#CC0000",fontWeight:"bold",flexShrink:0}}>▶</span>
                  {results.length > 0 ? results.map(n=>{
                    const cor=getColor(n); const s=NUM_BALL[cor];
                    return (
                      <div key={n} style={{width:26,height:26,borderRadius:"50%",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        background:s.bg,border:"2px solid "+s.border,
                        color:s.text,fontSize:11,fontWeight:"bold",flexShrink:0}}>
                        {n}
                      </div>
                    );
                  }) : <span style={{fontSize:9,color:"#333",fontStyle:"italic"}}>nenhum número</span>}
                </div>
              )}`;

      // Tambem reconhece a versao maior caso o transform passe duas vezes em dev/HMR.
      const enlargedResults = `              {hasFilter && (
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
                  <span style={{fontSize:9,color:"#CC0000",fontWeight:"bold",flexShrink:0}}>▶</span>
                  {results.length > 0 ? results.map(n=>{
                    const cor=getColor(n); const s=NUM_BALL[cor];
                    return (
                      <div key={n} style={{width:32,height:32,borderRadius:"50%",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        background:s.bg,border:"2px solid "+s.border,
                        color:s.text,fontSize:13,fontWeight:"900",flexShrink:0}}>
                        {n}
                      </div>
                    );
                  }) : <span style={{fontSize:9,color:"#333",fontStyle:"italic"}}>nenhum número</span>}
                </div>
              )}`;

      const newResults = enlargedResults;
      const filterGroupsAnchor = `              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                {FILTER_GROUPS.map`;

      // Remove o resultado de onde estiver e reinsere IMEDIATAMENTE antes dos botoes do filtro.
      // O anchor inclui FILTER_GROUPS.map para nao confundir com outros flexs da tela.
      let found = false;
      if (src.includes(originalResults)) {
        src = src.replace(originalResults, '');
        found = true;
      } else if (src.includes(enlargedResults)) {
        src = src.replace(enlargedResults, '');
        found = true;
      }

      if (found && src.includes(filterGroupsAnchor)) {
        src = src.replace(filterGroupsAnchor, newResults + '\n' + filterGroupsAnchor);
      }

      return { code: src, map: null };
    },
  };
}

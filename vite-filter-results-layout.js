export default function filterResultsLayoutPatch() {
  return {
    name: 'destroyer-filter-results-layout-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      const oldResults = `              {hasFilter && (
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

      const newResults = `              {hasFilter && (
                <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:9}}>
                  <span style={{fontSize:8,color:"#CC0000",fontWeight:"bold",flexShrink:0}}>▶</span>
                  {results.length > 0 ? results.map(n=>{
                    const cor=getColor(n); const s=NUM_BALL[cor];
                    return (
                      <div key={n} style={{width:30,height:30,borderRadius:"50%",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        background:s.bg,border:"2px solid "+s.border,
                        color:s.text,fontSize:12,fontWeight:"900",flexShrink:0}}>
                        {n}
                      </div>
                    );
                  }) : <span style={{fontSize:9,color:"#333",fontStyle:"italic"}}>nenhum número</span>}
                </div>
              )}`;

      const buttonsMarker = '              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>';

      if (src.includes(oldResults) && src.includes(buttonsMarker) && !src.includes('width:30,height:30,borderRadius:"50%"')) {
        src = src.replace(oldResults, '');
        src = src.replace(buttonsMarker, newResults + '\n' + buttonsMarker);
      }

      return { code: src, map: null };
    },
  };
}

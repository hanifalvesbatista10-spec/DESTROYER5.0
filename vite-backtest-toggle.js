export default function backtestTogglePatch() {
  return {
    name: 'destroyer-backtest-toggle-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;
      const marker = `function TerminalDominanceBacktest({ entries }) {\n  if(!entries || entries.length < 12) return null;`;
      const replacement = `function TerminalDominanceBacktest({ entries }) {\n  const [showBacktest, setShowBacktest] = useState(false);\n  if(!entries || entries.length < 12) return null;\n\n  if(!showBacktest) return (\n    <div style={{borderTop:\"2px solid #1e1e1e\",padding:\"6px 8px\",background:\"#070707\",flexShrink:0}}>\n      <button type=\"button\" onClick={()=>setShowBacktest(true)}\n        style={{width:\"100%\",background:\"#0a0a0a\",border:\"1px solid #2b2b2b\",borderRadius:3,color:\"#777\",fontSize:7,fontWeight:\"bold\",letterSpacing:\".08em\",padding:\"5px 7px\",cursor:\"pointer\",textAlign:\"left\"}}>\n        ▶ MOSTRAR BACKTEST TERMINAL + DOMINÂNCIA\n      </button>\n    </div>\n  );`;

      if (src.includes(marker)) src = src.replace(marker, replacement);

      const titleMarker = `<div style={{fontSize:7,color:\"#FFD700\",fontWeight:\"bold\",letterSpacing:\".08em\",marginBottom:5}}>BACKTEST TERMINAL + DOMINÂNCIA</div>`;
      const titleReplacement = `<div style={{display:\"flex\",alignItems:\"center\",justifyContent:\"space-between\",gap:6,marginBottom:5}}><div style={{fontSize:7,color:\"#FFD700\",fontWeight:\"bold\",letterSpacing:\".08em\"}}>BACKTEST TERMINAL + DOMINÂNCIA</div><button type=\"button\" onClick={()=>setShowBacktest(false)} style={{background:\"#111\",border:\"1px solid #333\",borderRadius:3,color:\"#777\",fontSize:6,fontWeight:\"bold\",padding:\"3px 5px\",cursor:\"pointer\",whiteSpace:\"nowrap\"}}>▼ OCULTAR</button></div>`;
      if (src.includes(titleMarker)) src = src.replace(titleMarker, titleReplacement);

      return { code: src, map: null };
    },
  };
}

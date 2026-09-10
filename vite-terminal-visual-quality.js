export default function terminalVisualQualityPatch() {
  return {
    name: 'destroyer-terminal-visual-quality-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;
      const start = src.indexOf('function TerminalPullAnalysis({ entries, filterSel, onSelectTerminal }) {');
      const end = src.indexOf('\nfunction TerminalDominanceBacktest({ entries }) {', start);
      if (start === -1 || end === -1) return { code: src, map: null };

      let block = src.slice(start, end);

      // Discreto aumento dos terminais principais + tipografia mais nítida.
      block = block.replace(
        'gridTemplateColumns:"30px 10px 28px auto 28px 1fr 27px"',
        'gridTemplateColumns:"32px 10px 30px auto 28px 1fr 27px"'
      );

      block = block.replace(
        'style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:blinking?',
        'style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:blinking?'
      );
      block = block.replace(
        'color:blinking?"#111":srcC,fontSize:9,fontWeight:"900",cursor:"pointer",padding:0}}>T{srcT}</button>',
        'color:blinking?"#111":srcC,fontSize:10,fontWeight:"900",lineHeight:1,fontFamily:"Arial, sans-serif",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",cursor:"pointer",padding:0}}>T{srcT}</button>'
      );

      block = block.replace(
        'style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:dstSelected?',
        'style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:dstSelected?'
      );
      block = block.replace(
        'color:dstC,fontSize:9,fontWeight:"bold",cursor:"pointer",padding:0}}>T{dstT}</button>',
        'color:dstC,fontSize:10,fontWeight:"900",lineHeight:1,fontFamily:"Arial, sans-serif",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",cursor:"pointer",padding:0}}>T{dstT}</button>'
      );

      // Histórico: bolinhas levemente maiores e números com mais contraste/nitidez.
      block = block.replace(
        'style={{width:14,height:14,borderRadius:"50%",background:bg,border:"1px solid "+border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color,fontWeight:isViz?"900":"700",flexShrink:0}}>{o.nextNum}</div>',
        'style={{width:16,height:16,borderRadius:"50%",background:bg,border:"1.5px solid "+border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color,fontWeight:"900",lineHeight:1,fontFamily:"Arial, sans-serif",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",textShadow:"0 0 1px rgba(255,255,255,.18)",flexShrink:0}}>{o.nextNum}</div>'
      );

      src = src.slice(0, start) + block + src.slice(end);
      return { code: src, map: null };
    },
  };
}

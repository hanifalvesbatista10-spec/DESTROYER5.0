export default function ruaModeRefinePatch(){
  return {
    name:'destroyer-rua-mode-refine',
    enforce:'pre',
    transform(code,id){
      if(!id.replace(/\\/g,'/').endsWith('/src/App.jsx')) return null;
      let src=code;

      src=src.replaceAll('🛣 FOCO RUAS','🛣 FOCO RUA');
      src=src.replaceAll('🎯 FOCO C/D','🎯 FOCO COLUNA DÚZIA');

      src=src.replace(
        '    if (!col.toggleable) return true;\n    if (focusRuas) return ["col_c1","col_c2","col_c3","ruaPar","altobaixo","paridade"].includes(key);',
        '    if (focusRuas && key==="viz") return false;\n    if (!col.toggleable) return true;\n    if (focusRuas) return ["col_c1","col_c2","col_c3","ruaPar","paridade","altobaixo"].includes(key);'
      );

      src=src.replace(
        '  const visibleCols = orderedCols.filter(c=>isColVisible(c.key));\n  const lastVisKey  = [...visibleCols].reverse()[0]?.key;',
        '  const visibleColsBase = orderedCols.filter(c=>isColVisible(c.key));\n  const ruaOrder = ["seq","num","hist","col_c1","col_c2","col_c3","ruaPar","paridade","altobaixo"];\n  const visibleCols = focusRuas ? ruaOrder.map(k=>cols.find(c=>c.key===k)).filter(Boolean) : visibleColsBase;\n  const lastVisKey  = [...visibleCols].reverse()[0]?.key;'
      );

      src=src.replace('{orderedCols.map(col => {','{(focusRuas ? visibleCols : orderedCols).map(col => {');
      src=src.replace('{cols.map((col,ci) => {','{(focusRuas ? visibleCols : cols).map((col,ci) => {');
      src=src.replaceAll('C + R/P + A/B + P/I','C + R/P + P/I + A/B');

      return {code:src,map:null};
    }
  };
}

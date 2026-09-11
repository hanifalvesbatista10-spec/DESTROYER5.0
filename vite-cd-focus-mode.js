export default function cdFocusModePatch() {
  return {
    name: 'destroyer-cd-focus-mode-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // 1) Novo modo: preserva o estado manual e trabalha separado do FOCO REPETIÇÃO.
      const stateMarker = '  const [focusRepetition, setFocusRepetition] = useState(false);\n  const manualHiddenBeforeFocus = useRef(null);';
      if (src.includes(stateMarker) && !src.includes('const [focusCD, setFocusCD]')) {
        src = src.replace(
          stateMarker,
          stateMarker + '\n  const [focusCD, setFocusCD] = useState(false);\n  const manualHiddenBeforeCD = useRef(null);'
        );
      }

      // 2) Avalia SOMENTE os 6 últimos números. PTE + C1/C2/C3 + D1/D2/D3 ficam fixos;
      // entre todas as demais características, entra apenas a característica cujo melhor
      // valor apareceu mais vezes. Empate: vence a ocorrência mais recente.
      const visMarker = '  function isColVisible(key) {';
      if (src.includes(visMarker) && !src.includes('const cdStrongestExtra = useMemo')) {
        const engine = `  const cdStrongestExtra = useMemo(() => {
    if (!focusCD || entries.length < 6) return null;
    const recent = entries.slice(-6);
    const defs = [
      {key:"grupoDezena",label:"10S",get:e=>e.grupoDezena||getGrupoDezena(e.num)},
      {key:"lado",label:"LADO",get:e=>e.lado||getLado(e.num)},
      {key:"opo",label:"OPO",get:e=>e.opo||getOpo(e.num)},
      {key:"cor",label:"COR",get:e=>e.cor||getColor(e.num)},
      {key:"altobaixo",label:"A/B",get:e=>e.altobaixo||getAltoBaixo(e.num)},
      {key:"paridade",label:"P/I",get:e=>e.paridade||getParidade(e.num)},
      {key:"regiao",label:"ZNA",get:e=>e.regiao||getRegiao(e.num)},
      {key:"cavalo",label:"CAV",get:e=>e.cavalo||getCavalo(e.num)},
      {key:"regtrack",label:"RGT",get:e=>e.regtrack||getRegTrack(e.num)},
      {key:"setor",label:"SET",get:e=>e.setor||getSetor(e.num)},
      {key:"rua",label:"RUA",get:e=>e.rua||getRua(e.num)},
      {key:"ruaPar",label:"R/P",get:e=>getRuaParidade(e.num)},
      {key:"duzia",label:"GP",get:e=>e.gp||getGP(e.num)},
    ];
    let best = null;
    defs.forEach((def, order) => {
      const counts = {}, lastPos = {};
      recent.forEach((e, i) => {
        const val = def.get(e);
        if (!val || val === "—") return;
        counts[val] = (counts[val] || 0) + 1;
        lastPos[val] = i;
      });
      const winner = Object.keys(counts).sort((a,b)=>counts[b]-counts[a] || lastPos[b]-lastPos[a])[0];
      if (!winner) return;
      const cand = {key:def.key,label:def.label,val:winner,count:counts[winner],last:lastPos[winner],order,total:6};
      if (!best || cand.count > best.count ||
          (cand.count === best.count && cand.last > best.last) ||
          (cand.count === best.count && cand.last === best.last && cand.order < best.order)) best = cand;
    });
    return best;
  }, [focusCD, entries]);

  const cdFocusKeys = useMemo(() => {
    if (!focusCD) return null;
    const keep = new Set(["parte","col_c1","col_c2","col_c3","gp_d1","gp_d2","gp_d3"]);
    if (cdStrongestExtra?.key) keep.add(cdStrongestExtra.key);
    return keep;
  }, [focusCD, cdStrongestExtra]);

`;
        src = src.replace(visMarker, engine + visMarker);
      }

      // 3) Nova prioridade de visibilidade, acima do FOCO REPETIÇÃO.
      src = src.replace(
        '    if (!col.toggleable) return true;\n    if (focusRepetition) return !!focusRepetitionKeys?.has(key);',
        '    if (!col.toggleable) return true;\n    if (focusCD) return !!cdFocusKeys?.has(key);\n    if (focusRepetition) return !!focusRepetitionKeys?.has(key);'
      );

      // 4) Em qualquer modo automático, bloqueia o toggle manual das colunas.
      src = src.replace(
        '  const toggleHide = (key) => {\n    if (focusRepetition) return;',
        '  const toggleHide = (key) => {\n    if (focusRepetition || focusCD) return;'
      );

      // 5) Botão novo ao lado de FOCO REPETIÇÃO.
      const focusEnd = '            ⚡ FOCO REPETIÇÃO{focusRepetition && focusRepetitionKeys ? ` · ${focusRepetitionKeys.size}` : ""}\n          </button>';
      if (src.includes(focusEnd) && !src.includes('🎯 FOCO COLUNA DÚZIA')) {
        const cdButton = `${focusEnd}
          <button
            onClick={()=>{
              if(!focusCD){
                manualHiddenBeforeCD.current = new Set(hidden);
                if(focusRepetition) setFocusRepetition(false);
                setFocusCD(true);
              } else {
                setFocusCD(false);
                if(manualHiddenBeforeCD.current) setHidden(new Set(manualHiddenBeforeCD.current));
              }
            }}
            title={focusCD
              ? (cdStrongestExtra ? "PTE + C1/C2/C3 + D1/D2/D3 + "+cdStrongestExtra.label+" "+cdStrongestExtra.val+" ("+cdStrongestExtra.count+"/6)" : "Aguardando 6 números")
              : "Manter PTE, D1/D2/D3 e C1/C2/C3; somar apenas a característica mais forte dos últimos 6 números"}
            style={{padding:"2px 9px",background:focusCD?"#0c4a6e":"#101820",border:focusCD?"1px solid #22d3ee":"1px solid #334155",borderRadius:2,color:focusCD?"#a5f3fc":"#cbd5e1",fontSize:8,cursor:"pointer",fontFamily:"Arial, sans-serif",fontWeight:"bold",letterSpacing:"0.04em",boxShadow:focusCD?"0 0 7px #22d3ee55":"none"}}>
            🎯 FOCO COLUNA DÚZIA{focusCD ? (cdStrongestExtra ? " · "+cdStrongestExtra.label+" "+cdStrongestExtra.val+" "+cdStrongestExtra.count+"/6" : " · AGUARDANDO 6") : ""}
          </button>`;
        src = src.replace(focusEnd, cdButton);
      }

      // Ao ligar o modo antigo, desliga o novo para os dois modos não disputarem visibilidade.
      src = src.replace(
        '              if(!focusRepetition){\n                manualHiddenBeforeFocus.current = new Set(hidden);',
        '              if(!focusRepetition){\n                if(focusCD) setFocusCD(false);\n                manualHiddenBeforeFocus.current = new Set(hidden);'
      );

      // 6) Destaque visual: C1/C2/C3 e D1/D2/D3 ficam maiores no cabeçalho.
      src = src.replace(
        'width: ["gp_d1","gp_d2","gp_d3","col_c1","col_c2","col_c3"].includes(col.key) ? 28 :',
        'width: ["gp_d1","gp_d2","gp_d3","col_c1","col_c2","col_c3"].includes(col.key) ? 40 :'
      );
      src = src.replace(
        'minWidth: ["gp_d1","gp_d2","gp_d3","col_c1","col_c2","col_c3"].includes(col.key) ? 28 : 20,',
        'minWidth: ["gp_d1","gp_d2","gp_d3","col_c1","col_c2","col_c3"].includes(col.key) ? 40 : 20,'
      );
      src = src.replace(
        'fontSize:9, fontWeight:"bold", letterSpacing:"0em",\n                        borderBottom:"2px solid #000", borderRight:"1px solid #000",',
        'fontSize:["gp_d1","gp_d2","gp_d3","col_c1","col_c2","col_c3"].includes(col.key)?11:9, fontWeight:"bold", letterSpacing:"0em",\n                        borderBottom:"2px solid #000", borderRight:"1px solid #000",'
      );

      // 7) E maiores também no corpo da tabela, sem alterar cores/alertas existentes.
      src = src.replace(
        '                  const scheme = CELL_SCHEME(e,ckey);\n                  const pulse = pulseLastIdx[ckey] === realIndex;',
        '                  const scheme = CELL_SCHEME(e,ckey);\n                  const isCoreCD = ["gp_d1","gp_d2","gp_d3","col_c1","col_c2","col_c3"].includes(ckey);\n                  const pulse = pulseLastIdx[ckey] === realIndex;'
      );
      src = src.replace(
        'style={{background: isDuziaAlert || isColunaAlert ? "#001a1f" : scheme.bg, color:scheme.text,padding:"1px 2px",textAlign:"center",\n                      fontSize:11,fontWeight:"700",fontFamily:"Arial, sans-serif",letterSpacing:"0em",whiteSpace:"nowrap",',
        'style={{background: isDuziaAlert || isColunaAlert ? "#001a1f" : scheme.bg, color:scheme.text,padding:isCoreCD?"3px 4px":"1px 2px",textAlign:"center",\n                      fontSize:isCoreCD?13:11,fontWeight:isCoreCD?"900":"700",width:isCoreCD?40:undefined,minWidth:isCoreCD?40:undefined,fontFamily:"Arial, sans-serif",letterSpacing:"0em",whiteSpace:"nowrap",'
      );

      return { code: src, map: null };
    },
  };
}

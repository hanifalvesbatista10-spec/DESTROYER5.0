export default function saturationFocusPatch() {
  return {
    name: 'destroyer-saturation-focus-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      const stateMarker = '  const [focusRuas, setFocusRuas] = useState(false);\n  const manualHiddenBeforeRuas = useRef(null);';
      if (src.includes(stateMarker) && !src.includes('const [focusSaturation, setFocusSaturation]')) {
        src = src.replace(
          stateMarker,
          stateMarker + '\n  const [focusSaturation, setFocusSaturation] = useState(false);\n  const manualHiddenBeforeSaturation = useRef(null);'
        );
      }

      const visMarker = '  function isColVisible(key) {';
      if (src.includes(visMarker) && !src.includes('const saturationFocusAnalysis = useMemo')) {
        const engine = `  const saturationFocusAnalysis = useMemo(() => {
    if (!focusSaturation) return { keys:null, top:[], waiting:false };

    if (entries.length < 10) {
      const waitingKeys = new Set(
        INIT_COLS.filter(c=>c.toggleable && c.key!=="pca").map(c=>c.key)
      );
      return { keys:waitingKeys, top:[], waiting:true };
    }

    const recent = entries.slice(-10);
    const candidates = [];

    const stabilityFor = (vals, allowedValues) => {
      const allowed = new Set(allowedValues);
      let longestRun = 0;
      let currentRun = 0;
      let repeatLinks = 0;
      let previous = null;

      vals.forEach(v => {
        if (!allowed.has(v)) {
          previous = null;
          currentRun = 0;
          return;
        }
        if (v === previous) {
          currentRun += 1;
          repeatLinks += 1;
        } else {
          currentRun = 1;
        }
        if (currentRun > longestRun) longestRun = currentRun;
        previous = v;
      });

      return { longestRun, repeatLinks };
    };

    const defs = [
      {key:"grupoDezena",label:"10S",get:e=>e.grupoDezena||getGrupoDezena(e.num)},
      {key:"parte",label:"PTE",get:e=>e.parte||getParte(e.num)},
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

    defs.forEach((def, order) => {
      const vals = recent.map(def.get);
      const counts = {};
      const lastPos = {};

      vals.forEach((v, i) => {
        if (!v || v === "—") return;
        counts[v] = (counts[v] || 0) + 1;
        lastPos[v] = i;
      });

      const winner = Object.keys(counts)
        .sort((a,b)=>counts[b]-counts[a] || lastPos[b]-lastPos[a])[0];
      if (!winner) return;

      const count = counts[winner];
      const pct = count / 10;
      if (pct < 0.70) return;

      const stability = stabilityFor(vals, [winner]);
      candidates.push({
        id:def.key,
        label:def.label,
        val:winner,
        pct,
        count,
        longestRun:stability.longestRun,
        repeatLinks:stability.repeatLinks,
        order,
        keys:[def.key],
      });
    });

    const addPairCandidate = ({id,label,get,values,keyMap,order}) => {
      const vals = recent.map(get);
      const counts = {};
      const lastPos = {};

      vals.forEach((v, i) => {
        if (!values.includes(v)) return;
        counts[v] = (counts[v] || 0) + 1;
        lastPos[v] = i;
      });

      const ranked = values
        .filter(v=>(counts[v]||0)>0)
        .sort((a,b)=>(counts[b]||0)-(counts[a]||0) || (lastPos[b]??-1)-(lastPos[a]??-1));

      if (!ranked.length) return;

      const selected = ranked.slice(0,2);
      const count = selected.reduce((sum,v)=>sum+(counts[v]||0),0);
      const pct = count / 10;
      if (pct < 0.70) return;

      const stability = stabilityFor(vals, selected);
      candidates.push({
        id,
        label,
        val:selected.join("+"),
        pct,
        count,
        longestRun:stability.longestRun,
        repeatLinks:stability.repeatLinks,
        order,
        keys:selected.map(v=>keyMap[v]).filter(Boolean),
      });
    };

    addPairCandidate({
      id:"colunaPair",
      label:"COL",
      get:e=>e.coluna||getColuna(e.num),
      values:["C1","C2","C3"],
      keyMap:{C1:"col_c1",C2:"col_c2",C3:"col_c3"},
      order:100,
    });

    addPairCandidate({
      id:"duziaPair",
      label:"DÚZIA",
      get:e=>e.duzia||getDuzia(e.num),
      values:["D1","D2","D3"],
      keyMap:{D1:"gp_d1",D2:"gp_d2",D3:"gp_d3"},
      order:101,
    });

    candidates.sort((a,b) =>
      b.pct - a.pct ||
      b.longestRun - a.longestRun ||
      b.repeatLinks - a.repeatLinks ||
      a.order - b.order
    );

    const top = candidates.slice(0,3);
    const keys = new Set();
    top.forEach(item => item.keys.forEach(k=>keys.add(k)));

    return { keys, top, waiting:false };
  }, [focusSaturation, entries]);

  const saturationFocusKeys = saturationFocusAnalysis.keys;

`;
        src = src.replace(visMarker, engine + visMarker);
      }

      src = src.replace(
        '    if (focusRuas && key==="viz") return false;\n    if (!col.toggleable) return true;\n    if (focusRuas) return ["col_c1","col_c2","col_c3","ruaPar","paridade","altobaixo"].includes(key);',
        '    if (focusRuas && key==="viz") return false;\n    if (focusSaturation && key==="pca") return false;\n    if (!col.toggleable) return true;\n    if (focusSaturation) return !!saturationFocusKeys?.has(key);\n    if (focusRuas) return ["col_c1","col_c2","col_c3","ruaPar","paridade","altobaixo"].includes(key);'
      );

      src = src.replace(
        '  const toggleHide = (key) => {\n    if (focusRepetition || focusCD || focusRuas) return;',
        '  const toggleHide = (key) => {\n    if (focusRepetition || focusCD || focusRuas || focusSaturation) return;'
      );

      src = src.replace(
        '              if(!focusRepetition){\n                if(focusCD) setFocusCD(false);\n                if(focusRuas) setFocusRuas(false);',
        '              if(!focusRepetition){\n                if(focusCD) setFocusCD(false);\n                if(focusRuas) setFocusRuas(false);\n                if(focusSaturation) setFocusSaturation(false);'
      );

      src = src.replace(
        '              if(!focusCD){\n                manualHiddenBeforeCD.current = new Set(hidden);\n                if(focusRepetition) setFocusRepetition(false);\n                if(focusRuas) setFocusRuas(false);',
        '              if(!focusCD){\n                manualHiddenBeforeCD.current = new Set(hidden);\n                if(focusRepetition) setFocusRepetition(false);\n                if(focusRuas) setFocusRuas(false);\n                if(focusSaturation) setFocusSaturation(false);'
      );

      src = src.replace(
        '              if(!focusRuas){\n                manualHiddenBeforeRuas.current = new Set(hidden);\n                if(focusRepetition) setFocusRepetition(false);\n                if(focusCD) setFocusCD(false);',
        '              if(!focusRuas){\n                manualHiddenBeforeRuas.current = new Set(hidden);\n                if(focusRepetition) setFocusRepetition(false);\n                if(focusCD) setFocusCD(false);\n                if(focusSaturation) setFocusSaturation(false);'
      );

      const ruasEnd = '            🛣 FOCO RUA{focusRuas ? " · C + R/P + P/I + A/B" : ""}\n          </button>';
      if (src.includes(ruasEnd) && !src.includes('🔥 FOCO SATURAÇÃO')) {
        const satButton = `${ruasEnd}
          <button
            onClick={()=>{
              if(!focusSaturation){
                manualHiddenBeforeSaturation.current = new Set(hidden);
                if(focusRepetition) setFocusRepetition(false);
                if(focusCD) setFocusCD(false);
                if(focusRuas) setFocusRuas(false);
                setFocusSaturation(true);
              } else {
                setFocusSaturation(false);
                if(manualHiddenBeforeSaturation.current) setHidden(new Set(manualHiddenBeforeSaturation.current));
              }
            }}
            title={focusSaturation
              ? (saturationFocusAnalysis.waiting
                  ? "Aguardando 10 números para calcular as 3 características mais saturadas"
                  : (saturationFocusAnalysis.top.length
                      ? saturationFocusAnalysis.top.map(x=>x.label+" "+x.val+" "+Math.round(x.pct*100)+"%").join(" · ")
                      : "Nenhuma característica atingiu 70% nos últimos 10"))
              : "Focar nas 3 características com maior saturação (mínimo 70%) dos últimos 10 números"}
            style={{padding:"2px 9px",background:focusSaturation?"#7c2d12":"#1c130d",border:focusSaturation?"1px solid #fb923c":"1px solid #7c2d12",borderRadius:2,color:focusSaturation?"#fed7aa":"#fdba74",fontSize:8,cursor:"pointer",fontFamily:"Arial, sans-serif",fontWeight:"bold",letterSpacing:"0.04em",boxShadow:focusSaturation?"0 0 7px #fb923c55":"none"}}>
            🔥 FOCO SATURAÇÃO{focusSaturation ? (saturationFocusAnalysis.waiting ? " · AGUARDANDO 10" : " · "+saturationFocusAnalysis.top.length+"/3") : ""}
          </button>`;
        src = src.replace(ruasEnd, satButton);
      }

      return { code: src, map: null };
    },
  };
}

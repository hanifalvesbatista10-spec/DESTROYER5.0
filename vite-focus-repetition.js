export default function focusRepetitionPatch() {
  return {
    name: 'destroyer-focus-repetition-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // 1) Estado do modo FOCO REPETIÇÃO e snapshot da configuração manual.
      src = src.replace(
        '  const [showAll, setShowAll] = useState(false);\n  const [filterSel, setFilterSel] = useState({});',
        `  const [showAll, setShowAll] = useState(false);
  const [focusRepetition, setFocusRepetition] = useState(false);
  const manualHiddenBeforeFocus = useRef(null);
  const [filterSel, setFilterSel] = useState({});`
      );

      // 2) Motor dinâmico: últimos 10 resultados. Enquanto houver menos de 10,
      // todas as colunas elegíveis ficam abertas. Depois, cada grupo é reavaliado
      // a cada novo número e só permanece visível se houver repetição ou concentração.
      const visMarker = '  function isColVisible(key) {';
      if (src.includes(visMarker)) {
        const focusEngine = `  const focusRepetitionKeys = useMemo(() => {
    if (!focusRepetition) return null;

    const allToggleable = INIT_COLS.filter(c=>c.toggleable).map(c=>c.key);
    if (entries.length < 10) return new Set(allToggleable);

    const recent = entries.slice(-10);

    const repetitionRate = (vals) => {
      if (vals.length < 2) return 0;
      let same = 0;
      for (let i=1; i<vals.length; i++) if (vals[i] === vals[i-1]) same++;
      return same / (vals.length - 1);
    };

    const concentration = (vals) => {
      const counts = {};
      vals.forEach(v => { if(v && v!=="—" && v!=="0") counts[v]=(counts[v]||0)+1; });
      const ordered = Object.values(counts).sort((a,b)=>b-a);
      const total = ordered.reduce((a,b)=>a+b,0);
      if (!total) return {top1:0, top2:0, distinct:0};
      return {
        top1:(ordered[0]||0)/total,
        top2:((ordered[0]||0)+(ordered[1]||0))/total,
        distinct:ordered.length,
      };
    };

    const groups = [
      { keys:["grupoDezena"], get:e=>e.grupoDezena||getGrupoDezena(e.num), kind:"house" },
      { keys:["parte"], get:e=>e.parte||getParte(e.num), kind:"binary" },
      { keys:["col_c1","col_c2","col_c3"], get:e=>e.coluna||getColuna(e.num), kind:"triple" },
      { keys:["lado"], get:e=>e.lado||getLado(e.num), kind:"binary" },
      { keys:["opo"], get:e=>e.opo||getOpo(e.num), kind:"binary" },
      { keys:["gp_d1","gp_d2","gp_d3"], get:e=>e.duzia||getDuzia(e.num), kind:"triple" },
      { keys:["cor"], get:e=>e.cor||getColor(e.num), kind:"triple" },
      { keys:["altobaixo"], get:e=>e.altobaixo||getAltoBaixo(e.num), kind:"binary" },
      { keys:["paridade"], get:e=>e.paridade||getParidade(e.num), kind:"binary" },
      { keys:["regiao"], get:e=>e.regiao||getRegiao(e.num), kind:"triple" },
      { keys:["cavalo"], get:e=>e.cavalo||getCavalo(e.num), kind:"triple" },
      { keys:["regtrack"], get:e=>e.regtrack||getRegTrack(e.num), kind:"multi" },
      { keys:["setor"], get:e=>e.setor||getSetor(e.num), kind:"multi" },
      { keys:["rua"], get:e=>e.rua||getRua(e.num), kind:"multi" },
      { keys:["ruaPar"], get:e=>getRuaParidade(e.num), kind:"binary" },
      { keys:["duzia"], get:e=>e.gp||getGP(e.num), kind:"multi" },
    ];

    const active = new Set();

    groups.forEach(group => {
      const vals = recent.map(group.get).filter(v=>v && v!=="—" && v!=="0");
      if (vals.length < 6) return;

      const rep = repetitionRate(vals);
      const conc = concentration(vals);
      let pass = false;

      if (group.kind === "binary") {
        // Binárias: 60% de concentração em um lado OU 60% de transições repetidas.
        pass = conc.top1 >= 0.60 || rep >= 0.60;
      } else if (group.kind === "house") {
        // CASAS: permite o padrão 10/30/10/30... quando 2 casas concentram >=80%.
        pass = conc.top1 >= 0.50 || conc.top2 >= 0.80 || rep >= 0.55;
      } else if (group.kind === "triple") {
        // Grupos de 3: uma opção >=50%, duas opções >=80%, ou repetição >=55%.
        pass = conc.top1 >= 0.50 || conc.top2 >= 0.80 || rep >= 0.55;
      } else {
        // Grupos mais fragmentados exigem concentração mais clara para não poluir a tela.
        pass = conc.top1 >= 0.50 || conc.top2 >= 0.75 || rep >= 0.55;
      }

      if (pass) group.keys.forEach(k=>active.add(k));
    });

    return active;
  }, [focusRepetition, entries]);

`;
        src = src.replace(visMarker, focusEngine + visMarker);
      }

      // 3) Visibilidade passa a ser comandada pelo modo de foco quando ele estiver ligado.
      src = src.replace(
`  function isColVisible(key) {
    const col = INIT_COLS.find(c => c.key === key);
    if (!col) return false;
    if (hidden.has(key)) return false;
    return true;
  }`,
`  function isColVisible(key) {
    const col = INIT_COLS.find(c => c.key === key);
    if (!col) return false;
    if (!col.toggleable) return true;
    if (focusRepetition) return !!focusRepetitionKeys?.has(key);
    if (hidden.has(key)) return false;
    return true;
  }`
      );

      // 4) Em modo automático os botões manuais de ocultar/mostrar não alteram o estado.
      src = src.replace(
`  const toggleHide = (key) => {
    if (!INIT_COLS.find(c=>c.key===key)?.toggleable) return;
    setHidden(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };`,
`  const toggleHide = (key) => {
    if (focusRepetition) return;
    if (!INIT_COLS.find(c=>c.key===key)?.toggleable) return;
    setHidden(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };`
      );

      // 5) Botão FOCO REPETIÇÃO na barra de toggle. Ao ligar, guarda a configuração
      // manual. Ao desligar, restaura exatamente como estava antes.
      const pdfButton = '<button onClick={exportPDF} style={{padding:"1px 10px",background:"#7c0000",border:"1px solid #CC0000",borderRadius:2,color:"#fca5a5",fontSize:9,cursor:"pointer",fontFamily:"Arial, sans-serif",fontWeight:"bold",letterSpacing:"0.05em"}}>⬇ PDF</button>';
      const focusButton = `${pdfButton}
          <button
            onClick={()=>{
              if(!focusRepetition){
                manualHiddenBeforeFocus.current = new Set(hidden);
                setFocusRepetition(true);
              } else {
                setFocusRepetition(false);
                if(manualHiddenBeforeFocus.current) setHidden(new Set(manualHiddenBeforeFocus.current));
              }
            }}
            title={focusRepetition ? "Desligar foco automático e restaurar colunas manuais" : "Analisar as últimas 10 rodadas e manter somente características com repetição ou concentração"}
            style={{padding:"2px 9px",background:focusRepetition?"#14532d":"#111827",border:focusRepetition?"1px solid #22c55e":"1px solid #475569",borderRadius:2,color:focusRepetition?"#bbf7d0":"#cbd5e1",fontSize:8,cursor:"pointer",fontFamily:"Arial, sans-serif",fontWeight:"bold",letterSpacing:"0.04em",boxShadow:focusRepetition?"0 0 7px #22c55e55":"none"}}>
            ⚡ FOCO REPETIÇÃO{focusRepetition && focusRepetitionKeys ? \` · \${focusRepetitionKeys.size}\` : ""}
          </button>`;
      if (src.includes(pdfButton)) src = src.replace(pdfButton, focusButton);

      return { code: src, map: null };
    },
  };
}

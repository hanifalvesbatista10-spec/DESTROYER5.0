export default function ruasFocusModePatch() {
  return {
    name: 'destroyer-ruas-focus-mode-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // Estado independente do modo antigo de análise por ruas.
      const stateMarker = '  const [focusCD, setFocusCD] = useState(false);\n  const manualHiddenBeforeCD = useRef(null);';
      if (src.includes(stateMarker) && !src.includes('const [focusRuas, setFocusRuas]')) {
        src = src.replace(
          stateMarker,
          stateMarker + '\n  const [focusRuas, setFocusRuas] = useState(false);\n  const manualHiddenBeforeRuas = useRef(null);'
        );
      }

      // Neste modo ficam abertas somente as características pedidas:
      // C1/C2/C3 + R/P (Rua Ímpar/Par) + ALTO/BAIXO + PAR/ÍMPAR.
      // As colunas estruturais fixas (#, Nº, PUX, CASA) continuam visíveis.
      const visMarker = '    if (!col.toggleable) return true;\n    if (focusCD) return !!cdFocusKeys?.has(key);\n    if (focusRepetition) return !!focusRepetitionKeys?.has(key);';
      if (src.includes(visMarker)) {
        src = src.replace(
          visMarker,
          '    if (!col.toggleable) return true;\n    if (focusRuas) return ["col_c1","col_c2","col_c3","ruaPar","altobaixo","paridade"].includes(key);\n    if (focusCD) return !!cdFocusKeys?.has(key);\n    if (focusRepetition) return !!focusRepetitionKeys?.has(key);'
        );
      }

      // Bloqueia o abre/fecha manual enquanto qualquer foco automático estiver ativo.
      src = src.replace(
        '  const toggleHide = (key) => {\n    if (focusRepetition || focusCD) return;',
        '  const toggleHide = (key) => {\n    if (focusRepetition || focusCD || focusRuas) return;'
      );

      // O modo FOCO REPETIÇÃO passa a desligar também o modo RUAS.
      src = src.replace(
        '              if(!focusRepetition){\n                if(focusCD) setFocusCD(false);\n                manualHiddenBeforeFocus.current = new Set(hidden);',
        '              if(!focusRepetition){\n                if(focusCD) setFocusCD(false);\n                if(focusRuas) setFocusRuas(false);\n                manualHiddenBeforeFocus.current = new Set(hidden);'
      );

      // O modo FOCO C/D também passa a desligar o modo RUAS.
      src = src.replace(
        '              if(!focusCD){\n                manualHiddenBeforeCD.current = new Set(hidden);\n                if(focusRepetition) setFocusRepetition(false);',
        '              if(!focusCD){\n                manualHiddenBeforeCD.current = new Set(hidden);\n                if(focusRepetition) setFocusRepetition(false);\n                if(focusRuas) setFocusRuas(false);'
      );

      // Botão novo ao lado dos modos existentes.
      const cdEnd = '            🎯 FOCO C/D{focusCD ? (cdStrongestExtra ? " · "+cdStrongestExtra.label+" "+cdStrongestExtra.val+" "+cdStrongestExtra.count+"/6" : " · AGUARDANDO 6") : ""}\n          </button>';
      if (src.includes(cdEnd) && !src.includes('🛣 FOCO RUAS')) {
        const ruasButton = `${cdEnd}\n          <button\n            onClick={()=>{\n              if(!focusRuas){\n                manualHiddenBeforeRuas.current = new Set(hidden);\n                if(focusRepetition) setFocusRepetition(false);\n                if(focusCD) setFocusCD(false);\n                setFocusRuas(true);\n              } else {\n                setFocusRuas(false);\n                if(manualHiddenBeforeRuas.current) setHidden(new Set(manualHiddenBeforeRuas.current));\n              }\n            }}\n            title={focusRuas ? "C1/C2/C3 + R/P (Rua Ímpar/Par) + ALTO/BAIXO + PAR/ÍMPAR" : "Abrir somente C1/C2/C3, R/P (Rua Ímpar/Par), ALTO/BAIXO e PAR/ÍMPAR"}\n            style={{padding:"2px 9px",background:focusRuas?"#3b0764":"#17111f",border:focusRuas?"1px solid #c084fc":"1px solid #4c1d95",borderRadius:2,color:focusRuas?"#e9d5ff":"#c4b5fd",fontSize:8,cursor:"pointer",fontFamily:"Arial, sans-serif",fontWeight:"bold",letterSpacing:"0.04em",boxShadow:focusRuas?"0 0 7px #a855f755":"none"}}>\n            🛣 FOCO RUAS{focusRuas ? " · C + R/P + A/B + P/I" : ""}\n          </button>`;
        src = src.replace(cdEnd, ruasButton);
      }

      return { code: src, map: null };
    },
  };
}

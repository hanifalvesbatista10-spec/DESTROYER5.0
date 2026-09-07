export default function terminalFilterPatch() {
  return {
    name: 'destroyer-terminal-filter-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // 1) TERMINAL vira um filtro multi-seleção. Cada T0..T9 representa
      // seus números-base + 1 vizinho de cada lado no RACETRACK, usando
      // a estrutura NUM_TO_TERMINALS já existente no app.
      src = src.replace(
        '          const MULTI_KEYS = ["duzia","coluna","grupoDezena"];',
        '          const MULTI_KEYS = ["duzia","coluna","grupoDezena","terminal"];'
      );

      // 2) Adiciona os botões T0..T9 ao filtro manual.
      const rpLine = '            { label:"R/P",    key:"ruaPar",  vals:["R.Ímpar","R.Par"],    pal:RUA_PAR_CELL },';
      const terminalLine = `${rpLine}\n            { label:"TRM",    key:"terminal", vals:["T0","T1","T2","T3","T4","T5","T6","T7","T8","T9"], pal:{\n              T0:{bg:"#3b0764",text:"#d8b4fe"}, T1:{bg:"#7f1d1d",text:"#fecaca"},\n              T2:{bg:"#9a3412",text:"#fed7aa"}, T3:{bg:"#713f12",text:"#fef08a"},\n              T4:{bg:"#14532d",text:"#bbf7d0"}, T5:{bg:"#78350f",text:"#fde68a"},\n              T6:{bg:"#1e3a8a",text:"#bfdbfe"}, T7:{bg:"#064e3b",text:"#a7f3d0"},\n              T8:{bg:"#831843",text:"#fbcfe8"}, T9:{bg:"#312e81",text:"#c7d2fe"}\n            } },`;
      if (src.includes(rpLine) && !src.includes('key:"terminal"')) {
        src = src.replace(rpLine, terminalLine);
      }

      // 3) Terminal pode acumular quantas seleções forem necessárias.
      // Mantém o comportamento antigo das demais MULTI_KEYS.
      src = src.replace(
        '                if(cur.length>=2) return {...prev, [key]:[cur[1],val]};',
        '                if(key!=="terminal" && cur.length>=2) return {...prev, [key]:[cur[1],val]};'
      );

      // 4) Integra TERMINAL e TODAS as características ocultas ao cruzamento AND.
      // O bug anterior acontecia porque chaves como regtrack/setor/rua/gp não
      // existiam em NFLD nesse ponto; então `if(!fn) return true` aprovava os 37 números.
      const resultsStart = src.indexOf('          const results = hasFilter');
      const resultsEnd = src.indexOf('\n            : [];', resultsStart);
      if (resultsStart !== -1 && resultsEnd !== -1) {
        const replacement = `          const results = hasFilter
            ? Array.from({length:37},(_,i)=>i).filter(n =>
                activeKeys.every(k => {
                  const sel = filterSel[k];

                  if(k === "terminal") {
                    const selected = Array.isArray(sel) ? sel : [sel];
                    const terminalsDoNumero = NUM_TO_TERMINALS[n] || new Set();
                    return selected.some(t => {
                      const tid = parseInt(String(t).replace("T",""), 10);
                      return Number.isInteger(tid) && terminalsDoNumero.has(tid);
                    });
                  }

                  const hiddenFn = k === "regtrack" ? getRegTrack
                    : k === "setor" ? getSetor
                    : k === "rua" ? getRua
                    : k === "gp" ? getGP
                    : k === "fra" ? getFra
                    : k === "opo" ? getOpo
                    : k === "grupoDezena" ? getGrupoDezena
                    : k === "ruaPar" ? getRuaParidade
                    : null;

                  const fn = hiddenFn || NFLD[k];
                  if(!fn) return false;
                  const value = fn(n);
                  if(Array.isArray(sel)) return sel.includes(value);
                  return value === sel;
                })
              )`;
        src = src.slice(0, resultsStart) + replacement + src.slice(resultsEnd);
      }

      return { code: src, map: null };
    },
  };
}

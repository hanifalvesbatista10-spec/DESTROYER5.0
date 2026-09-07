export default function hiddenCharacteristicsPatch() {
  return {
    name: 'destroyer-hidden-characteristics-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // Regra global de seleção:
      // características com MAIS DE 2 valores possíveis aceitam até 2 valores simultâneos.
      // Características binárias continuam single-select.
      const multiKeysLiteral = '["duzia","coluna","grupoDezena","cor","regiao","cavalo","setor","regtrack","rua","gp","fra","terminal"]';

      // selectProbabilityFilter (cliques vindos da tabela/barra de dominância)
      src = src.replace(
        '    const MULTI_KEYS=["duzia","coluna","grupoDezena"];',
        '    const MULTI_KEYS='+multiKeysLiteral+';'
      );
      src = src.replace(
        '    const MULTI_KEYS = ["duzia","coluna","grupoDezena"];',
        '    const MULTI_KEYS = '+multiKeysLiteral+';'
      );

      // toggleFilter do bloco manual (o terminalFilter já pode ter alterado esta linha)
      src = src.replace(
        '          const MULTI_KEYS = ["duzia","coluna","grupoDezena","terminal"];',
        '          const MULTI_KEYS = '+multiKeysLiteral+';'
      );
      src = src.replace(
        '          const MULTI_KEYS = ["duzia","coluna","grupoDezena"];',
        '          const MULTI_KEYS = '+multiKeysLiteral+';'
      );

      // Terminal também passa a respeitar o limite universal de 2 seleções.
      src = src.replace(
        '                if(key!=="terminal" && cur.length>=2) return {...prev, [key]:[cur[1],val]};',
        '                if(cur.length>=2) return {...prev, [key]:[cur[1],val]};'
      );

      // Nos últimos 5 resultados, D1/D2/D3 continuam sendo DÚZIA.
      // Isso evita D2 e D3 se sobrescreverem como se fossem um GP single-select.
      src = src.replace(
        '                    if (ckey === "gp_d1" && e.duzia === "D1") return {key:"gp", val:e.gp || getGP(e.num)};\n                    if (ckey === "gp_d2" && e.duzia === "D2") return {key:"gp", val:e.gp || getGP(e.num)};\n                    if (ckey === "gp_d3" && e.duzia === "D3") return {key:"gp", val:e.gp || getGP(e.num)};',
        '                    if (ckey === "gp_d1" && e.duzia === "D1") return {key:"duzia", val:"D1"};\n                    if (ckey === "gp_d2" && e.duzia === "D2") return {key:"duzia", val:"D2"};\n                    if (ckey === "gp_d3" && e.duzia === "D3") return {key:"duzia", val:"D3"};'
      );

      // Características adicionais clicáveis quando presentes/ocultas.
      src = src.replace(
        '                    if (ckey === "ruaPar") return {key:"ruaPar", val:getRuaParidade(e.num)};\n                    return null;',
        '                    if (ckey === "ruaPar" || ckey === "ruaParidade") return {key:"ruaPar", val:getRuaParidade(e.num)};\n                    if (ckey === "fra") return {key:"fra", val:e.fra || getFra(e.num)};\n                    if (ckey === "gp") return {key:"gp", val:e.gp || getGP(e.num)};\n                    return null;'
      );

      // O motor do filtro conhece também as características que normalmente
      // ficam fora do bloco manual visível. Assim o clique realmente cruza tudo.
      src = src.replace(
        '            ruaPar:n=>getRuaParidade(n),',
        '            ruaPar:n=>getRuaParidade(n), rua:n=>getRua(n), setor:n=>getSetor(n), regtrack:n=>getRegTrack(n), gp:n=>getGP(n),'
      );

      // Dominância/repetição também acompanha características ocultas.
      src = src.replace(
        '      opo:["ZERO","DEZ"],\n      grupoDezena:["0","10","20","30"],',
        '      opo:["ZERO","DEZ"],\n      ruaPar:["R.Ímpar","R.Par"],\n      rua:["R1","R2","R3","R4"],\n      gp:["d1V","d1P","d2I","d2P","d3V","d3P"],\n      grupoDezena:["0","10","20","30"],'
      );

      // Uma característica dominante pode aparecer mesmo se sua coluna estiver escondida.
      src = src.replace(
        'const sortedDomCols = visibleCols.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key))',
        'const sortedDomCols = INIT_COLS.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key))'
      );

      // Todos os alvos conhecidos ficam clicáveis na barra de dominância.
      src = src.replace(
        '["cor","lado","altobaixo","paridade","parte","cavalo","regiao","duzia","coluna","ruaPar","setor","regtrack","fra","opo","grupoDezena"].includes(col.key)',
        '["cor","lado","altobaixo","paridade","parte","cavalo","regiao","duzia","coluna","ruaPar","rua","setor","regtrack","fra","opo","grupoDezena","gp"].includes(col.key)'
      );

      return { code: src, map: null };
    },
  };
}

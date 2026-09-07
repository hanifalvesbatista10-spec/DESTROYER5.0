export default function hiddenCharacteristicsPatch() {
  return {
    name: 'destroyer-hidden-characteristics-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // 1) Nos últimos 5 resultados, cada característica da tabela passa a
      // alimentar o filtro real, mesmo quando a coluna correspondente costuma
      // ficar oculta. GP vira o GP exato (d1V/d1P/d2I/d2P/d3V/d3P), não apenas a dúzia.
      src = src.replace(
        '                    if (ckey === "gp_d1" && e.duzia === "D1") return {key:"duzia", val:"D1"};\n                    if (ckey === "gp_d2" && e.duzia === "D2") return {key:"duzia", val:"D2"};\n                    if (ckey === "gp_d3" && e.duzia === "D3") return {key:"duzia", val:"D3"};',
        '                    if (ckey === "gp_d1" && e.duzia === "D1") return {key:"gp", val:e.gp || getGP(e.num)};\n                    if (ckey === "gp_d2" && e.duzia === "D2") return {key:"gp", val:e.gp || getGP(e.num)};\n                    if (ckey === "gp_d3" && e.duzia === "D3") return {key:"gp", val:e.gp || getGP(e.num)};'
      );

      src = src.replace(
        '                    if (ckey === "ruaPar") return {key:"ruaPar", val:getRuaParidade(e.num)};\n                    return null;',
        '                    if (ckey === "ruaPar" || ckey === "ruaParidade") return {key:"ruaPar", val:getRuaParidade(e.num)};\n                    if (ckey === "fra") return {key:"fra", val:e.fra || getFra(e.num)};\n                    if (ckey === "gp") return {key:"gp", val:e.gp || getGP(e.num)};\n                    return null;'
      );

      // 2) O motor do filtro conhece também as características que normalmente
      // ficam fora do bloco manual visível. Assim o clique realmente cruza tudo.
      src = src.replace(
        '            ruaPar:n=>getRuaParidade(n),',
        '            ruaPar:n=>getRuaParidade(n), rua:n=>getRua(n), setor:n=>getSetor(n), regtrack:n=>getRegTrack(n), gp:n=>getGP(n),'
      );

      // 3) A dominância/repetição acompanha também as características ocultas.
      src = src.replace(
        '      opo:["ZERO","DEZ"],\n      grupoDezena:["0","10","20","30"],',
        '      opo:["ZERO","DEZ"],\n      ruaPar:["R.Ímpar","R.Par"],\n      rua:["R1","R2","R3","R4"],\n      gp:["d1V","d1P","d2I","d2P","d3V","d3P"],\n      grupoDezena:["0","10","20","30"],'
      );

      // 4) Uma característica dominante pode aparecer na barra de repetição
      // mesmo que sua coluna esteja escondida na tabela. A coluna continua oculta;
      // surge somente o card clicável quando houver repetição importante.
      src = src.replace(
        'const sortedDomCols = visibleCols.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key))',
        'const sortedDomCols = INIT_COLS.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key))'
      );

      // 5) Torna todos os alvos conhecidos clicáveis na barra de dominância.
      src = src.replace(
        '["cor","lado","altobaixo","paridade","parte","cavalo","regiao","duzia","coluna","ruaPar","setor","regtrack","fra","opo","grupoDezena"].includes(col.key)',
        '["cor","lado","altobaixo","paridade","parte","cavalo","regiao","duzia","coluna","ruaPar","rua","setor","regtrack","fra","opo","grupoDezena","gp"].includes(col.key)'
      );

      return { code: src, map: null };
    },
  };
}

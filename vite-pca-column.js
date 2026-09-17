export default function pcaColumnPatch() {
  return {
    name: 'destroyer-pca-column-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;
      let src = code;

      // P/C/A = Parte + Cor + Alto/Baixo. Somente os quatro grupos aprovados.
      src = src.replace(
        'function getColor(n)    { if(n===0) return "Verde"; if(RED_NUMS.has(n)) return "Vermelho"; return "Preto"; }',
        `function getPCA(n) {\n  if ([2,4,6,13,15,17].includes(n)) return "P1.P.B";\n  if ([1,3,5,14,16,18].includes(n)) return "P1.V.B";\n  if ([20,22,24,31,33,35].includes(n)) return "P2.P.A";\n  if ([19,21,23,32,34,36].includes(n)) return "P2.V.A";\n  return "—";\n}\nfunction getColor(n)    { if(n===0) return "Verde"; if(RED_NUMS.has(n)) return "Vermelho"; return "Preto"; }`
      );

      src = src.replace(
        'const RUA_PAR_CELL = { "R.Ímpar":{bg:"#4a0080",text:"#e9d5ff"}, "R.Par":{bg:"#005a5a",text:"#99f6e4"}, "—":{bg:"#111",text:"#444"} };',
        `const RUA_PAR_CELL = { "R.Ímpar":{bg:"#4a0080",text:"#e9d5ff"}, "R.Par":{bg:"#005a5a",text:"#99f6e4"}, "—":{bg:"#111",text:"#444"} };\n// Paleta de transição: cada grupo combina visualmente PTE + COR + A/B,\n// mantendo contraste com as colunas vizinhas sem copiar exatamente nenhuma delas.\nconst PCA_CELL = {\n  "P1.P.B":{bg:"#26364a",text:"#dbeafe"},\n  "P1.V.B":{bg:"#5b2638",text:"#fecdd3"},\n  "P2.P.A":{bg:"#34452d",text:"#dcfce7"},\n  "P2.V.A":{bg:"#6b2f2f",text:"#fee2e2"},\n  "—":{bg:"#111",text:"#444"}\n};`
      );

      src = src.replace(
        'grupoDezena:getGrupoDezena(n), fra:getFra(n), opo:getOpo(n) };',
        'grupoDezena:getGrupoDezena(n), fra:getFra(n), opo:getOpo(n), pca:getPCA(n) };'
      );

      src = src.replace(
        '  if (key==="opo")       return e.opo;',
        '  if (key==="opo")       return e.opo;\n  if (key==="pca")       return e.pca || getPCA(e.num);'
      );
      src = src.replace(
        '  if (key==="opo")    return OPO_CELL[e.opo] || OPO_CELL["—"];',
        '  if (key==="opo")    return OPO_CELL[e.opo] || OPO_CELL["—"];\n  if (key==="pca")    return PCA_CELL[e.pca || getPCA(e.num)] || PCA_CELL["—"];'
      );

      // Coluna neutra. Inserida após A/B para a leitura Parte/Cor/Altura ficar visualmente correlacionada.
      src = src.replace(
        '  { key:"altobaixo", label:"A/B",  toggleable:true,  mode:"auto"     },',
        '  { key:"altobaixo", label:"A/B",  toggleable:true,  mode:"auto"     },\n  { key:"pca",       label:"P/C/A",toggleable:true,  mode:"always"   },'
      );

      // Motores gerais: regras/sinais, dominância e análise estatística.
      src = src.replace(
        '  {k:"opo",     fn:e=>e.opo,     label:"OPO", pal:OPO_CELL},',
        '  {k:"opo",     fn:e=>e.opo,     label:"OPO", pal:OPO_CELL},\n  {k:"pca",     fn:e=>e.pca,     label:"P/C/A",pal:PCA_CELL},'
      );
      src = src.replace(
        '  { key:"regiao",   label:"Região",    values:["Tier","Orphelins","Voisins"],',
        '  { key:"pca",      label:"P/C/A",     values:["P1.P.B","P1.V.B","P2.P.A","P2.V.A"], palette:PCA_CELL },\n  { key:"regiao",   label:"Região",    values:["Tier","Orphelins","Voisins"],'
      );
      src = src.replace(
        '      grupoDezena:["0","10","20","30"],',
        '      pca:["P1.P.B","P1.V.B","P2.P.A","P2.V.A"],\n      grupoDezena:["0","10","20","30"],'
      );

      // Probabilidade: PCA passa a ser avaliada junto das características gerais.
      src = src.replace(
        '      {label:"R/P",   key:"ruaPar", vals:["R.Ímpar","R.Par"],                     pal:RUA_PAR_CELL},',
        '      {label:"R/P",   key:"ruaPar", vals:["R.Ímpar","R.Par"],                     pal:RUA_PAR_CELL},\n      {label:"P/C/A", key:"pca", vals:["P1.P.B","P1.V.B","P2.P.A","P2.V.A"], pal:PCA_CELL},'
      );
      src = src.replace(
        '        fra:getFra(p.num), opo:getOpo(p.num), grupoDezena:getGrupoDezena(p.num), ruaPar:getRuaParidade(p.num)',
        '        fra:getFra(p.num), opo:getOpo(p.num), grupoDezena:getGrupoDezena(p.num), ruaPar:getRuaParidade(p.num), pca:getPCA(p.num)'
      );

      // Botões do filtro manual e motor numérico do filtro.
      src = src.replace(
        '            { label:"R/P",    key:"ruaPar",  vals:["R.Ímpar","R.Par"],    pal:RUA_PAR_CELL },',
        '            { label:"R/P",    key:"ruaPar",  vals:["R.Ímpar","R.Par"],    pal:RUA_PAR_CELL },\n            { label:"P/C/A",  key:"pca",     vals:["P1.P.B","P1.V.B","P2.P.A","P2.V.A"], pal:PCA_CELL },'
      );
      src = src.replace(
        '            ruaPar:n=>getRuaParidade(n), rua:n=>getRua(n), setor:n=>getSetor(n), regtrack:n=>getRegTrack(n), gp:n=>getGP(n),',
        '            ruaPar:n=>getRuaParidade(n), rua:n=>getRua(n), setor:n=>getSetor(n), regtrack:n=>getRegTrack(n), gp:n=>getGP(n), pca:n=>getPCA(n),'
      );
      src = src.replace(
        '            ruaPar:n=>getRuaParidade(n),',
        '            ruaPar:n=>getRuaParidade(n), pca:n=>getPCA(n),'
      );

      // PCA tem quatro opções: mesma regra universal de até duas seleções.
      src = src.replace(/\["duzia","coluna","grupoDezena","cor","regiao","cavalo","setor","regtrack","rua","gp","fra","terminal"\]/g,
        '["duzia","coluna","grupoDezena","cor","regiao","cavalo","setor","regtrack","rua","gp","fra","terminal","pca"]');

      // Últimos 5: a própria célula PCA alimenta o filtro, como as demais características.
      src = src.replace(
        '                    if (ckey === "gp") return {key:"gp", val:e.gp || getGP(e.num)};\n                    return null;',
        '                    if (ckey === "gp") return {key:"gp", val:e.gp || getGP(e.num)};\n                    if (ckey === "pca" && (e.pca || getPCA(e.num)) !== "—") return {key:"pca", val:e.pca || getPCA(e.num)};\n                    return null;'
      );

      // Barra de dominância: PCA é um alvo clicável normal.
      src = src.replace(
        '["cor","lado","altobaixo","paridade","parte","cavalo","regiao","duzia","coluna","ruaPar","rua","setor","regtrack","fra","opo","grupoDezena","gp"].includes(col.key)',
        '["cor","lado","altobaixo","paridade","parte","cavalo","regiao","duzia","coluna","ruaPar","rua","setor","regtrack","fra","opo","grupoDezena","gp","pca"].includes(col.key)'
      );

      // Regra absoluta: nenhum modo FOCO existente ganha PCA automaticamente.
      // A coluna existe apenas na tabela neutra até ordem explícita para um novo foco.
      src = src.replace(
        'function isColVisible(key) {',
        'function isColVisible(key) {\n  if (key === "pca" && ((typeof focusCD !== "undefined" && focusCD) || (typeof focusRuas !== "undefined" && focusRuas) || (typeof focusRepetition !== "undefined" && focusRepetition))) return false;'
      );

      return { code: src, map: null };
    },
  };
}

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
        `const RUA_PAR_CELL = { "R.Ímpar":{bg:"#4a0080",text:"#e9d5ff"}, "R.Par":{bg:"#005a5a",text:"#99f6e4"}, "—":{bg:"#111",text:"#444"} };\n// Paleta de transição: cada grupo combina visualmente PTE + COR + A/B,\n// mantendo contraste com as colunas vizinhas sem copiar exatamente nenhuma delas.\nconst PCA_CELL = {\n  "P1.P.B":{bg:"#3f3f46",text:"#fde68a"},\n  "P1.V.B":{bg:"#991b1b",text:"#fde68a"},\n  "P2.P.A":{bg:"#1f2937",text:"#86efac"},\n  "P2.V.A":{bg:"#7f1d1d",text:"#86efac"},\n  "—":{bg:"#111",text:"#444"}\n};`
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

      // A tabela usa selectProbabilityFilter. PCA entra aqui como macro para preservar
      // o mesmo mecanismo de clique de TODAS as outras características.
      src = src.replace(
        'const selectProbabilityFilter = (key,val) => {',
        'const selectProbabilityFilter = (key,val) => {\n    if(key==="pca"){\n      const macro={\n        "P1.P.B":{parte:"P1",cor:"Preto",altobaixo:"BAIXO"},\n        "P1.V.B":{parte:"P1",cor:"Vermelho",altobaixo:"BAIXO"},\n        "P2.P.A":{parte:"P2",cor:"Preto",altobaixo:"ALTO"},\n        "P2.V.A":{parte:"P2",cor:"Vermelho",altobaixo:"ALTO"}\n      }[val];\n      if(!macro) return;\n      setFilterSel(prev=>{\n        const already=prev.parte===macro.parte && prev.cor===macro.cor && prev.altobaixo===macro.altobaixo;\n        const next={...prev};\n        if(already){delete next.parte;delete next.cor;delete next.altobaixo;}\n        else{next.parte=macro.parte;next.cor=macro.cor;next.altobaixo=macro.altobaixo;}\n        delete next.pca;\n        return next;\n      });\n      return;\n    }'
      );

      // P/C/A funciona como MACRO dos filtros nativos Parte + Cor + A/B.
      // Não cria um motor paralelo: clicar em um grupo aciona os três filtros existentes.
      src = src.replace(
        'const toggleFilter = (key, val) => {',
        'const toggleFilter = (key, val) => {\n            if(key==="pca"){\n              const macro={\n                "P1.P.B":{parte:"P1",cor:"Preto",altobaixo:"BAIXO"},\n                "P1.V.B":{parte:"P1",cor:"Vermelho",altobaixo:"BAIXO"},\n                "P2.P.A":{parte:"P2",cor:"Preto",altobaixo:"ALTO"},\n                "P2.V.A":{parte:"P2",cor:"Vermelho",altobaixo:"ALTO"}\n              }[val];\n              if(!macro) return;\n              setFilterSel(prev=>{\n                const already=prev.parte===macro.parte && prev.cor===macro.cor && prev.altobaixo===macro.altobaixo;\n                const next={...prev};\n                if(already){ delete next.parte; delete next.cor; delete next.altobaixo; }\n                else { next.parte=macro.parte; next.cor=macro.cor; next.altobaixo=macro.altobaixo; }\n                delete next.pca;\n                return next;\n              });\n              return;\n            }'
      );
      src = src.replace(
        'const isActive = (key,val) => {',
        'const isActive = (key,val) => {\n            if(key==="pca"){\n              const macro={\n                "P1.P.B":{parte:"P1",cor:"Preto",altobaixo:"BAIXO"},\n                "P1.V.B":{parte:"P1",cor:"Vermelho",altobaixo:"BAIXO"},\n                "P2.P.A":{parte:"P2",cor:"Preto",altobaixo:"ALTO"},\n                "P2.V.A":{parte:"P2",cor:"Vermelho",altobaixo:"ALTO"}\n              }[val];\n              return !!macro && filterSel.parte===macro.parte && filterSel.cor===macro.cor && filterSel.altobaixo===macro.altobaixo;\n            }'
      );

      // Botões do filtro manual e motor numérico do filtro.
      // O bloco real do App usa FILTER_GROUPS/NFLD; integrar diretamente nele.
      src = src.replace(
        '            { label:"R/P",    key:"ruaPar",  vals:["R.Ímpar","R.Par"],    pal:RUA_PAR_CELL },',
        '            { label:"R/P",    key:"ruaPar",  vals:["R.Ímpar","R.Par"],    pal:RUA_PAR_CELL },\n            { label:"P/C/A",  key:"pca",     vals:["P1.P.B","P1.V.B","P2.P.A","P2.V.A"], pal:PCA_CELL },'
      );
      src = src.replace(
        /ruaPar:n=>getRuaParidade\(n\),(\s*)};/,
        'ruaPar:n=>getRuaParidade(n), pca:n=>getPCA(n),$1};'
      );
      src = src.replace(
        'const MULTI_KEYS = ["duzia","coluna","grupoDezena"];',
        'const MULTI_KEYS = ["duzia","coluna","grupoDezena","pca"];'
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

      // Correção estrutural: cabeçalho e linhas DEVEM percorrer a mesma ordem calculada.
      // Sem isso, qualquer coluna nova após a ordenação automática desloca P/I, COR, A/B e R/P.
      src = src.replace(
        '                    {cols.map((col,ci) => {',
        '                    {orderedCols.map((col,ci) => {'
      );

      // P/C/A precisa manter largura compacta como as células vizinhas; nunca pode absorver o espaço livre da tabela.
      src = src.replace(
        '["lado","cor","altobaixo","paridade","parte","cavalo","regiao"].includes(col.key) ? 42 :',
        '["lado","cor","altobaixo","paridade","parte","cavalo","regiao","pca"].includes(col.key) ? 42 :'
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

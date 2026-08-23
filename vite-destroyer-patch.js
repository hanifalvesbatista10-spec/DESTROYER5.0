export default function destroyerPatch() {
  return {
    name: 'destroyer-casa-race-additive-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // 1) CASA: usa os 5 últimos PUX do número da linha. A casa é escolhida
      // somente pela maioria direta (mín. 3/5). Depois, vizinhos imediatos
      // no RACETRACK de qualquer número daquela casa reforçam a cobertura.
      {
        const start = src.indexOf('function analyzeCasaPuxada(puxouList) {');
        const end = src.indexOf('\nconst MICRO_GROUPS = {', start);
        if (start !== -1 && end !== -1) {
          const replacement = `function analyzeCasaPuxada(puxouList) {
  if (!puxouList || puxouList.length < 5) return null;

  const ultimos5 = puxouList.slice(-5);
  const casas = ["0", "10", "20", "30"];

  const stats = casas.map(casa => {
    const numsCasa = [];
    for (let n = 0; n <= 36; n++) {
      if (getGrupoDezena(n) === casa) numsCasa.push(n);
    }

    const vizRaceDaCasa = new Set();
    numsCasa.forEach(n => {
      getRaceNeighbors(n).forEach(v => {
        if (getGrupoDezena(v) !== casa) vizRaceDaCasa.add(v);
      });
    });

    const numsDentro = [];
    const numsVizinhos = [];
    const numsFora = [];

    ultimos5.forEach(h => {
      const n = h.num;
      if (getGrupoDezena(n) === casa) numsDentro.push(n);
      else if (vizRaceDaCasa.has(n)) numsVizinhos.push(n);
      else numsFora.push(n);
    });

    const dentro = numsDentro.length;
    const vizinhos = numsVizinhos.length;
    const apoio = dentro + vizinhos;

    return {
      casa,
      dentro,
      vizinhos,
      apoio,
      total: 5,
      pct: Math.round((dentro / 5) * 100),
      apoioPct: Math.round((apoio / 5) * 100),
      numsDentro,
      numsVizinhos,
      numsFora,
    };
  });

  const ranking = stats
    .filter(x => x.dentro >= 3)
    .sort((a, b) => b.dentro - a.dentro || b.vizinhos - a.vizinhos);

  if (!ranking.length) return null;
  return ranking[0];
}
`;
          src = src.slice(0, start) + replacement + src.slice(end);
        }
      }

      // 2) Todos os cards de filtro são aditivos por padrão. Somente pares de
      // características realmente opostas ficam exclusivos dentro da mesma chave.
      {
        const start = src.indexOf('  const selectProbabilityFilter = (key,val) => {');
        const end = src.indexOf('\n\n  const dragKey', start);
        if (start !== -1 && end !== -1) {
          const replacement = `  const selectProbabilityFilter = (key,val) => {
    const EXCLUSIVE_KEYS = new Set([
      "paridade",
      "parte",
      "lado",
      "altobaixo",
      "opo",
      "ruaPar"
    ]);

    setFilterSel(prev => {
      if (EXCLUSIVE_KEYS.has(key)) {
        const cur = prev[key];
        const isActive = Array.isArray(cur) ? cur.includes(val) : cur === val;
        if (isActive) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return { ...prev, [key]: val };
      }

      const cur = Array.isArray(prev[key]) ? prev[key] : prev[key] ? [prev[key]] : [];
      if (cur.includes(val)) {
        const values = cur.filter(v => v !== val);
        const next = { ...prev };
        if (values.length === 0) delete next[key];
        else next[key] = values;
        return next;
      }
      return { ...prev, [key]: [...cur, val] };
    });
  };`;
          src = src.slice(0, start) + replacement + src.slice(end);
        }
      }

      // 3) A coluna CASA passa a avaliar os PUX do próprio número da linha.
      {
        const start = src.indexOf('                      if (col.key==="viz") {');
        const end = src.indexOf('                      return <Cell key={col.key}', start);
        if (start !== -1 && end !== -1) {
          const replacement = `                      if (col.key==="viz") {
                        const ultimosPuxadosDoNumero = getHistorico(entries, realIndex, e.num);
                        const result = analyzeCasaPuxada(ultimosPuxadosDoNumero);
                        const casaScheme = result
                          ? (GRUPO_DEZENA_CELL[result.casa] || GRUPO_DEZENA_CELL["—"])
                          : GRUPO_DEZENA_CELL["—"];

                        return (
                          <td key="viz"
                            title={result
                              ? \`Nº \${e.num}: CASA \${result.casa} = \${result.dentro}/5 diretos (\${result.pct}%)\` + (result.vizinhos ? \` + \${result.vizinhos} vizinho(s) Race → \${result.apoio}/5 (\${result.apoioPct}%)\` : "")
                              : "Sem maioria de CASA nos últimos 5 PUX deste número"}
                            style={{background:"#0d0d0d",padding:"1px 2px",textAlign:"center",borderTop:bTop,borderBottom:bBot,borderRight:"1px solid #000",minWidth:38}}>
                            {result ? (
                              <div style={{
                                display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                                minWidth:36,height:28,borderRadius:3,padding:"0 3px",
                                background:casaScheme.bg,border:"2px solid "+casaScheme.text,
                                color:casaScheme.text,fontFamily:"Arial, sans-serif"
                              }}>
                                <span style={{fontSize:10,fontWeight:"bold",lineHeight:1}}>{result.casa}</span>
                                <span style={{fontSize:6,lineHeight:1,opacity:0.95}}>
                                  {result.dentro}D{result.vizinhos>0?\` +\${result.vizinhos}V\`:""} · {result.apoioPct}%
                                </span>
                              </div>
                            ) : <span style={{color:"#2a2a2a",fontSize:8}}>—</span>}
                          </td>
                        );
                      }
`;
          src = src.slice(0, start) + replacement + src.slice(end);
        }
      }

      // 4) CADÊNCIA antiga: mantém a lógica interna neutra para compatibilidade,
      // mas o quadro visual será removido mais abaixo.
      {
        const start = src.indexOf('  const cadenceStats = [1,2,3].map(gap=>{');
        const end = src.indexOf('  const strongRows = transitionStats', start);
        if (start !== -1 && end !== -1) {
          const replacement = `  const repetitionBlocks = [];
  for(let i=0;i<entries.length;){
    const house = houseOf(entries[i]);
    let j=i+1;
    while(j<entries.length && houseOf(entries[j])===house) j++;
    const len=j-i;
    if(house && house!=="—" && len>=2){
      repetitionBlocks.push({start:i,end:j-1,house,len});
    }
    i=j;
  }

  const cadenceStats = [];
  const activeCadence = null;

`;
          src = src.slice(0, start) + replacement + src.slice(end);
        }
      }

      // 5) DOMINÂNCIA: mantém a lei original intacta (mesma janela e corte de 80%),
      // mas passa a varrer TODAS as características da tabela.
      {
        const start = src.indexOf('  const colDominance = useMemo(() => {');
        const end = src.indexOf('\n\n  const top3Stats = useMemo(() => {', start);
        if (start !== -1 && end !== -1) {
          const replacement = `  const colDominance = useMemo(() => {
    if (entries.length < 3) return {};
    const last5 = entries.slice(-6);
    const result = {};
    const checks = {
      grupoDezena:["0","10","20","30"],
      parte:["P1","P2"],
      col_c1:["C1"], col_c2:["C2"], col_c3:["C3"],
      lado:["PB e VA","PA e VB"],
      opo:["ZERO","DEZ"],
      gp_d1:["d1V","d1P"], gp_d2:["d2I","d2P"], gp_d3:["d3V","d3P"],
      cor:["Vermelho","Preto","Verde"],
      altobaixo:["ALTO","BAIXO"],
      paridade:["Par","Ímpar"],
      regiao:["Tier","Orphelins","Voisins"],
      cavalo:["369","258","147"],
      regtrack:["32-29","25-30","15-2","8-24","16-18"],
      setor:["S1","S2","S3","S4","S5","S6"],
      rua:["R1","R2","R3","R4","0"],
      ruaPar:["R.Ímpar","R.Par"],
      duzia:["D1","D2","D3"],
      fra:["F1e","F2e","F3e","F1d","F2d","F3d"],
    };

    Object.entries(checks).forEach(([field, vals]) => {
      const getVal = (e) => {
        if (field==="ruaPar") return getRuaParidade(e.num);
        if (field==="rua") return getRua(e.num);
        if (field==="duzia") return getDuzia(e.num);
        if (field==="setor") return getSetor(e.num);
        if (field==="regtrack") return getRegTrack(e.num);
        if (field==="fra") return getFra(e.num);
        if (field==="opo") return getOpo(e.num);
        if (field==="grupoDezena") return e.grupoDezena || getGrupoDezena(e.num);
        if (field==="col_c1") return e.coluna==="C1" ? "C1" : null;
        if (field==="col_c2") return e.coluna==="C2" ? "C2" : null;
        if (field==="col_c3") return e.coluna==="C3" ? "C3" : null;
        if (field==="gp_d1") return ["d1V","d1P"].includes(e.gp) ? e.gp : null;
        if (field==="gp_d2") return ["d2I","d2P"].includes(e.gp) ? e.gp : null;
        if (field==="gp_d3") return ["d3V","d3P"].includes(e.gp) ? e.gp : null;
        return e[field]||null;
      };

      vals.forEach(val => {
        const cnt = last5.filter(e => getVal(e) === val).length;
        if (cnt / last5.length >= 0.8) {
          result[field] = { val, pct: Math.round(cnt/last5.length*100) };
        }
      });
    });
    return result;
  }, [entries]);`;
          src = src.slice(0, start) + replacement + src.slice(end);
        }
      }

      // 6) A barra de dominância não depende de a coluna estar visível.
      src = src.replace(
        'const sortedDomCols = visibleCols.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key)).sort((a,b)=>(colDominance[b.key]?.pct||0)-(colDominance[a.key]?.pct||0));',
        'const sortedDomCols = INIT_COLS.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key)).sort((a,b)=>(colDominance[b.key]?.pct||0)-(colDominance[a.key]?.pct||0));'
      );

      // 7) Remove visualmente o quadro de CADÊNCIA e deixa o Radar em largura total.
      src = src.replace(
        'gridTemplateColumns:"minmax(0,1.35fr) minmax(0,1fr)"',
        'gridTemplateColumns:"1fr"'
      );
      {
        const cadenceUiStart = src.indexOf('      <div style={{background:activeCadence?');
        const patternClose = src.indexOf('    </div>\n  );\n}\nlet idCounter', cadenceUiStart);
        if (cadenceUiStart !== -1 && patternClose !== -1) {
          src = src.slice(0, cadenceUiStart) + src.slice(patternClose);
        }
      }

      // 8) ÍNDICE DE TRANSIÇÃO DE CASA dentro da linha de dominância.
      // Usa a MESMA janela da dominância (últimos 6 números = 5 transições).
      // R = mesma casa; V = mudou de casa, mas o número seguinte é vizinho imediato
      // (1 de cada lado) do número anterior no RACETRACK; A = alternância sem proximidade.
      // O card é SOMENTE descritivo: não é clicável, não alimenta filtros e não gera candidatos.
      {
        const calcMarker = '          const matchNums = [];\n          for(let n=0;n<=36;n++){ if(domKeys.length>0 && domKeys.every(k=>NFIELDX[k](n)===allDomVals[k])) matchNums.push(n); }';
        const calcReplacement = `          const matchNums = [];
          for(let n=0;n<=36;n++){ if(domKeys.length>0 && domKeys.every(k=>NFIELDX[k](n)===allDomVals[k])) matchNums.push(n); }

          const houseTransitionIndex = (() => {
            const recent = entries.slice(-6);
            if (recent.length < 2) return null;
            let rep = 0, viz = 0, alt = 0;
            for (let i=0; i<recent.length-1; i++) {
              const a = recent[i];
              const b = recent[i+1];
              const sameHouse = getGrupoDezena(a.num) === getGrupoDezena(b.num);
              if (sameHouse) {
                rep++;
              } else if (getRaceNeighbors(a.num).has(b.num)) {
                viz++;
              } else {
                alt++;
              }
            }
            const total = rep + viz + alt;
            if (!total) return null;
            const continuidade = rep + viz;
            const pct = Math.round((continuidade / total) * 100);
            const altPct = Math.round((alt / total) * 100);
            if (pct < 60) return null;
            return { rep, viz, alt, total, pct, altPct };
          })();`;
        if (src.includes(calcMarker)) src = src.replace(calcMarker, calcReplacement);

        const renderMarker = '              {sortedDomCols.map(col => {';
        const renderReplacement = `              {houseTransitionIndex && (
                <div title={\`Últimas \${houseTransitionIndex.total} transições: \${houseTransitionIndex.rep} repetição(ões) de CASA, \${houseTransitionIndex.viz} aproximação(ões) por vizinho imediato no Race e \${houseTransitionIndex.alt} alternância(s). Leitura descritiva, sem inferência sobre o próximo resultado.\`}
                  style={{display:"flex",flexDirection:"column",alignItems:"center",background:"#111827",border:"1px solid #64748b",borderRadius:3,padding:"3px 8px",minWidth:58,textAlign:"center",cursor:"default",userSelect:"none"}}>
                  <span style={{fontSize:7,color:"#94a3b8",lineHeight:1,textTransform:"uppercase"}}>ÍNDICE CASA</span>
                  <span style={{fontSize:10,fontWeight:"bold",lineHeight:1.2,color:"#e2e8f0",padding:"1px 4px"}}>REP/VIZ</span>
                  <span style={{fontSize:11,fontWeight:"900",color:"#fff",lineHeight:1}}>{houseTransitionIndex.pct}%</span>
                  <span style={{fontSize:6,color:"#94a3b8",lineHeight:1.2}}>{houseTransitionIndex.rep}R + {houseTransitionIndex.viz}V · {houseTransitionIndex.alt}A</span>
                </div>
              )}
              {sortedDomCols.map(col => {`;
        if (src.includes(renderMarker)) src = src.replace(renderMarker, renderReplacement);
      }

      return { code: src, map: null };
    },
  };
}

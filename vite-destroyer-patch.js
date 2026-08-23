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

      // 4) CADÊNCIA: repetição contínua de 2, 3, 4... casas iguais é UM bloco.
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

  const cadenceStats = [1,2,3].map(gap=>{
    let trials=0, hits=0;
    for(let i=0;i<repetitionBlocks.length-1;i++){
      const first=repetitionBlocks[i];
      const second=repetitionBlocks[i+1];
      const between=second.start-first.end-1;
      if(between!==gap) continue;
      const baseIdx=second.end+gap;
      const nextIdx=baseIdx+1;
      if(nextIdx>=entries.length) continue;
      trials++;
      const third=repetitionBlocks[i+2] || null;
      if(third && third.start===baseIdx){
        hits++;
      }
    }
    return {gap,trials,hits,pct:trials?Math.round(hits/trials*100):0};
  });

  let activeCadence = null;
  for(let i=repetitionBlocks.length-2;i>=0 && !activeCadence;i--){
    const first=repetitionBlocks[i];
    const second=repetitionBlocks[i+1];
    const gap=second.start-first.end-1;
    if(gap<1 || gap>3) continue;
    const baseIdx=second.end+gap;
    if(baseIdx!==entries.length-1) continue;
    const laterBlock=repetitionBlocks[i+2] || null;
    if(laterBlock) continue;
    const stat=cadenceStats.find(x=>x.gap===gap);
    activeCadence={gap,first,second,baseIdx,base:entries[baseIdx],house:houseOf(entries[baseIdx]),stat};
  }

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
        // LEI ORIGINAL preservada: 80% ou mais.
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

      // 6) A barra de dominância não depende de a coluna estar visível para reconhecer o sinal.
      // Mantém apenas colunas de característica (toggleable), excluindo #/Nº/PUX/CASA técnica.
      src = src.replace(
        'const sortedDomCols = visibleCols.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key)).sort((a,b)=>(colDominance[b.key]?.pct||0)-(colDominance[a.key]?.pct||0));',
        'const sortedDomCols = INIT_COLS.filter(c=>c.toggleable&&colDominance[c.key]&&!excludedDom.has(c.key)).sort((a,b)=>(colDominance[b.key]?.pct||0)-(colDominance[a.key]?.pct||0));'
      );

      return { code: src, map: null };
    },
  };
}

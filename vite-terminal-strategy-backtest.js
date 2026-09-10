export default function terminalStrategyBacktestPatch() {
  return {
    name: 'destroyer-terminal-strategy-backtest-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;
      const start = src.indexOf('function TerminalPullAnalysis({ entries, filterSel, onSelectTerminal }) {');
      const end = src.indexOf('\nfunction QuadrantSignal({ entries }) {', start);
      if (start === -1 || end === -1) return { code: src, map: null };

      const replacement = `function TerminalPullAnalysis({ entries, filterSel, onSelectTerminal }) {
  if(!entries || entries.length < 10) return null;

  const [ackedAlerts, setAckedAlerts] = useState(() => new Set());

  const TERMINAL_MEMBERS = {
    0:[0,10,20,30], 1:[1,11,21,31], 2:[2,12,22,32], 3:[3,13,23,33],
    4:[4,14,24,34], 5:[5,15,25,35], 6:[6,16,26,36], 7:[7,17,27],
    8:[8,18,28], 9:[9,19,29]
  };

  const getTerminal = (n) => {
    for(const [t, members] of Object.entries(TERMINAL_MEMBERS)){
      if(members.includes(n)) return parseInt(t);
    }
    return null;
  };

  const isDirectRaceNeighbor = (a,b) => {
    const ia = RA_WHEEL.indexOf(a);
    if(ia < 0) return false;
    return RA_WHEEL[(ia-1+RA_WHEEL.length)%RA_WHEEL.length] === b || RA_WHEEL[(ia+1)%RA_WHEEL.length] === b;
  };

  const classifyForTerminal = (n,t) => {
    const members = TERMINAL_MEMBERS[t] || [];
    if(members.includes(n)) return 'direct';
    if(members.some(m => isDirectRaceNeighbor(m,n))) return 'viz';
    return 'miss';
  };

  const calculateCalls = (list) => {
    const out = [];
    for(let t=0; t<=9; t++){
      const members = TERMINAL_MEMBERS[t];
      const occurrences = [];
      for(let i=list.length-1; i>=0 && occurrences.length<3; i--){
        if(members.includes(list[i].num) && i+1 < list.length){
          const nextNum = list[i+1]?.num;
          if(nextNum !== undefined) occurrences.push({ num:list[i].num, nextNum });
        }
      }
      if(occurrences.length < 2) continue;

      const scored = [];
      for(let dst=0; dst<=9; dst++){
        let direct=0, viz=0;
        occurrences.forEach(o=>{
          const cls=classifyForTerminal(o.nextNum,dst);
          if(cls==='direct') direct++;
          else if(cls==='viz') viz++;
        });
        const hits=direct+viz;
        if(hits>0) scored.push({dst,hits,direct,viz});
      }
      scored.sort((a,b)=>b.hits-a.hits || b.direct-a.direct || a.dst-b.dst);
      const best=scored[0];
      if(!best || best.hits < 2) continue;

      const detailed = occurrences.map(o=>({
        ...o,
        classif: classifyForTerminal(o.nextNum,best.dst)
      }));
      out.push({srcT:t,dstT:best.dst,cnt:best.hits,direct:best.direct,viz:best.viz,total:occurrences.length,occurrences:detailed});
    }
    return out;
  };

  const results = calculateCalls(entries);
  if(results.length === 0) return null;

  const priorEntries = entries.slice(0,-1);
  const priorCalls = calculateCalls(priorEntries);

  const tColors = ["#a855f7","#ef4444","#f97316","#eab308","#22c55e","#f59e0b","#60a5fa","#34d399","#f472b6","#818cf8"];
  const lastEntry = entries[entries.length-1];
  const lastTerminal = getTerminal(lastEntry?.num);
  const eventBase = lastEntry ? String(lastEntry.id ?? entries.length) + ':' + String(lastEntry.num) : '';

  const activatedPairs = new Set(
    priorCalls
      .filter(r => r.srcT === lastTerminal)
      .map(r => r.srcT + '>' + r.dstT)
  );

  const terminalSelected = (t) => {
    const cur = filterSel?.terminal;
    const label = 'T'+t;
    return Array.isArray(cur) ? cur.includes(label) : cur === label;
  };

  const acknowledge = (alertKey) => {
    setAckedAlerts(prev => {
      const next = new Set(prev);
      next.add(alertKey);
      return next;
    });
  };

  const handleTerminalClick = (t, alertKey) => {
    if(alertKey) acknowledge(alertKey);
    onSelectTerminal?.('terminal', 'T'+t);
  };

  return (
    <div style={{borderTop:"2px solid #1e1e1e",padding:"7px 8px",background:"#080808",flexShrink:0,minWidth:0}}>
      <style>{\`
        @keyframes terminalHitPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,215,0,.20), 0 0 7px rgba(255,215,0,.55); transform:scale(1); }
          50% { box-shadow: 0 0 0 4px rgba(255,215,0,.05), 0 0 15px rgba(255,215,0,1); transform:scale(1.07); }
        }
        .terminal-hit-alert { animation: terminalHitPulse .62s ease-in-out infinite; }
      \`}</style>
      <div style={{fontSize:7,letterSpacing:"0.1em",color:"#555",textTransform:"uppercase",marginBottom:6}}>TERMINAL PUXA TERMINAL</div>
      <div style={{display:"flex",flexDirection:"column",gap:4,minWidth:0}}>
        {results.map(({srcT,dstT,cnt,direct,viz,total,occurrences})=>{
          const srcC=tColors[srcT], dstC=tColors[dstT];
          const pct=Math.round(cnt/total*100);
          const pairKey=srcT+'>'+dstT;
          const alertKey=eventBase+':'+pairKey;
          const activatedNow=activatedPairs.has(pairKey);
          const blinking=activatedNow && !ackedAlerts.has(alertKey);
          const srcSelected=terminalSelected(srcT);
          const dstSelected=terminalSelected(dstT);
          return (
            <div key={srcT} style={{background:blinking?"#171300":"#0a0a0a",border:blinking?"1px solid #FFD700":"1px solid #222",borderRadius:4,padding:"4px 5px",minWidth:0}}>
              <div style={{display:"grid",gridTemplateColumns:"30px 10px 28px auto 28px 1fr 27px",alignItems:"center",columnGap:3,minWidth:0}}>
                <button type="button" className={blinking?"terminal-hit-alert":""} onClick={()=>handleTerminalClick(srcT,blinking?alertKey:null)} title={blinking?"T"+srcT+" ATIVOU A CHAMADA PARA T"+dstT+" — clique para reconhecer":srcSelected?"Remover T"+srcT+" do filtro":"Filtrar por T"+srcT}
                  style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:blinking?"#FFD700":srcSelected?srcC+"55":srcC+"22",border:blinking?"3px solid #fff1a0":srcSelected?"3px solid #FFD700":"2px solid "+srcC,color:blinking?"#111":srcC,fontSize:9,fontWeight:"900",cursor:"pointer",padding:0}}>T{srcT}</button>
                <span style={{fontSize:10,color:"#444",textAlign:"center"}}>→</span>
                <button type="button" onClick={()=>handleTerminalClick(dstT,null)} title={dstSelected?"Remover T"+dstT+" do filtro":"Filtrar por T"+dstT}
                  style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:dstSelected?dstC+"55":dstC+"22",border:dstSelected?"3px solid #FFD700":"2px solid "+dstC,color:dstC,fontSize:9,fontWeight:"bold",cursor:"pointer",padding:0}}>T{dstT}</button>
                <span style={{fontSize:blinking?6:7,color:blinking?"#FFD700":"#777",fontWeight:blinking?"900":"700",letterSpacing:blinking?".03em":"0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{blinking?"CHAMOU!":""}</span>
                <span title={direct+" direto + "+viz+" viz"} style={{fontSize:8,color:"#FFD700",fontWeight:"bold",textAlign:"right",whiteSpace:"nowrap"}}>{cnt}/{total}</span>
                <div style={{height:4,background:"#1a1a1a",borderRadius:2,overflow:"hidden",minWidth:10}}><div style={{height:"100%",width:pct+"%",background:pct===100?"#FFD700":dstC}}/></div>
                <span style={{fontSize:7,color:"#555",textAlign:"right",whiteSpace:"nowrap"}}>{pct}%</span>
              </div>

              <div style={{display:"flex",alignItems:"center",gap:3,marginTop:3,paddingLeft:41,minWidth:0}}>
                <span style={{fontSize:6,color:"#414141",letterSpacing:".05em",flexShrink:0}}>HIST</span>
                <div style={{display:"flex",gap:2,minWidth:0,overflow:"hidden"}}>
                  {occurrences.map((o,idx)=>{
                    const isDirect=o.classif==='direct';
                    const isViz=o.classif==='viz';
                    const bg=isDirect?dstC+"55":isViz?"#0e749055":"#111";
                    const border=isDirect?dstC:isViz?"#22d3ee":"#333";
                    const color=isDirect?dstC:isViz?"#67e8f9":"#444";
                    const title="Depois de "+o.num+" saiu "+o.nextNum+(isDirect?" • DIRETO T"+dstT:isViz?" • VIZINHO DIRETO T"+dstT:" • FORA");
                    return <div key={idx} title={title} style={{width:14,height:14,borderRadius:"50%",background:bg,border:"1px solid "+border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color,fontWeight:isViz?"900":"700",flexShrink:0}}>{o.nextNum}</div>;
                  })}
                </div>
                {viz>0 && <span style={{fontSize:6,color:"#22d3ee",fontWeight:"bold",whiteSpace:"nowrap"}}>+{viz} VIZ</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TerminalDominanceBacktest({ entries }) {
  if(!entries || entries.length < 12) return null;

  const TERMINAL_MEMBERS_BT = {
    0:[0,10,20,30],1:[1,11,21,31],2:[2,12,22,32],3:[3,13,23,33],4:[4,14,24,34],
    5:[5,15,25,35],6:[6,16,26,36],7:[7,17,27],8:[8,18,28],9:[9,19,29]
  };
  const terminalOf = n => {
    for(const [t,m] of Object.entries(TERMINAL_MEMBERS_BT)) if(m.includes(n)) return +t;
    return null;
  };
  const raceNeighbor=(a,b)=>{
    const i=RA_WHEEL.indexOf(a);
    return i>=0 && (RA_WHEEL[(i-1+37)%37]===b || RA_WHEEL[(i+1)%37]===b);
  };
  const terminalHit=(n,t)=>{
    const set=NUM_TO_TERMINALS[n] || new Set();
    return set.has(t);
  };

  const callsAt = list => {
    const out=[];
    for(let srcT=0;srcT<=9;srcT++){
      const occ=[];
      for(let i=list.length-1;i>=0 && occ.length<3;i--){
        if(TERMINAL_MEMBERS_BT[srcT].includes(list[i].num) && i+1<list.length) occ.push(list[i+1].num);
      }
      if(occ.length<2) continue;
      const ranked=[];
      for(let dstT=0;dstT<=9;dstT++){
        let direct=0,viz=0;
        occ.forEach(n=>{
          if(TERMINAL_MEMBERS_BT[dstT].includes(n)) direct++;
          else if(TERMINAL_MEMBERS_BT[dstT].some(m=>raceNeighbor(m,n))) viz++;
        });
        ranked.push({dstT,hits:direct+viz,direct,viz});
      }
      ranked.sort((a,b)=>b.hits-a.hits||b.direct-a.direct||a.dstT-b.dstT);
      if(ranked[0]?.hits>=2) out.push({srcT,...ranked[0]});
    }
    return out;
  };

  const FEATURE_BT = [
    {key:'duzia',label:'DÚZIA',fn:getDuzia,vals:['D1','D2','D3']},
    {key:'coluna',label:'COL',fn:getColuna,vals:['C1','C2','C3']},
    {key:'parte',label:'PTE',fn:getParte,vals:['P1','P2']},
    {key:'lado',label:'LADO',fn:getLado,vals:['PB e VA','PA e VB']},
    {key:'cor',label:'COR',fn:getColor,vals:['Vermelho','Preto']},
    {key:'paridade',label:'P/I',fn:getParidade,vals:['Par','Ímpar']},
    {key:'altobaixo',label:'A/B',fn:getAltoBaixo,vals:['ALTO','BAIXO']},
    {key:'regiao',label:'ZONA',fn:getRegiao,vals:['Tier','Orphelins','Voisins']},
    {key:'opo',label:'OPO',fn:getOpo,vals:['ZERO','DEZ']},
    {key:'grupoDezena',label:'CASA',fn:getGrupoDezena,vals:['0','10','20','30']},
    {key:'ruaPar',label:'R/P',fn:getRuaParidade,vals:['R.Ímpar','R.Par']},
    {key:'rua',label:'RUA',fn:getRua,vals:['R1','R2','R3','R4']},
    {key:'setor',label:'SET',fn:getSetor,vals:['S1','S2','S3','S4','S5','S6']},
    {key:'regtrack',label:'RGT',fn:getRegTrack,vals:['32-29','25-30','15-2','8-24','16-18']},
    {key:'gp',label:'GP',fn:getGP,vals:['d1V','d1P','d2I','d2P','d3V','d3P']},
    {key:'fra',label:'FRA',fn:getFra,vals:['F1e','F2e','F3e','F1d','F2d','F3d']},
    {key:'cavalo',label:'CAV',fn:getCavalo,vals:['369','258','147']}
  ];

  const dominantAt = list => {
    const w=list.slice(-5);
    if(w.length<5) return [];
    const ranked=[];
    FEATURE_BT.forEach(f=>{
      const cnt={};
      w.forEach(e=>{const v=f.fn(e.num); if(v&&v!=='—'&&v!=='0') cnt[v]=(cnt[v]||0)+1;});
      const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1] || w.map(e=>f.fn(e.num)).lastIndexOf(b[0])-w.map(e=>f.fn(e.num)).lastIndexOf(a[0]))[0];
      if(!best) return;
      const pct=Math.round(best[1]/w.length*100);
      if(pct>=80) ranked.push({key:f.key,label:f.label,val:best[0],pct,fn:f.fn});
    });
    return ranked.sort((a,b)=>b.pct-a.pct);
  };

  const buildTargets=(dstT,doms,k)=>{
    const chosen=doms.slice(0,k);
    if(chosen.length<2) return {targets:[],chosen};
    const targets=[];
    for(let n=0;n<=36;n++){
      if(!terminalHit(n,dstT)) continue;
      if(chosen.every(d=>d.fn(n)===d.val)) targets.push(n);
    }
    return {targets,chosen};
  };

  const classify=(nextNum,targets)=>{
    if(targets.includes(nextNum)) return 'direct';
    if(targets.some(n=>raceNeighbor(n,nextNum))) return 'viz';
    return 'fail';
  };

  const variants={2:[],3:[]};
  for(let i=10;i<entries.length-1;i++){
    const before=entries.slice(0,i);
    const current=entries[i];
    const srcT=terminalOf(current.num);
    if(srcT===null) continue;
    const priorCalls=callsAt(before).filter(c=>c.srcT===srcT);
    if(!priorCalls.length) continue;
    const context=entries.slice(0,i+1);
    const doms=dominantAt(context);
    priorCalls.forEach(call=>{
      [2,3].forEach(k=>{
        const {targets,chosen}=buildTargets(call.dstT,doms,k);
        const row={i,srcT,dstT:call.dstT,targets,chosen,nextNum:entries[i+1].num};
        row.outcome=targets.length?classify(row.nextNum,targets):'noTarget';
        variants[k].push(row);
      });
    });
  }

  const summarize=rows=>{
    const signals=rows.length;
    const noTarget=rows.filter(r=>r.outcome==='noTarget').length;
    const valid=rows.filter(r=>r.outcome!=='noTarget');
    const direct=valid.filter(r=>r.outcome==='direct').length;
    const viz=valid.filter(r=>r.outcome==='viz').length;
    const fail=valid.filter(r=>r.outcome==='fail').length;
    const entriesN=valid.length;
    const directPct=entriesN?Math.round(direct/entriesN*100):0;
    const totalPct=entriesN?Math.round((direct+viz)/entriesN*100):0;
    return {signals,noTarget,entriesN,direct,viz,fail,directPct,totalPct};
  };
  const s2=summarize(variants[2]), s3=summarize(variants[3]);
  const allRows=variants[2];
  const byTerminal=[];
  for(let t=0;t<=9;t++){
    const r=allRows.filter(x=>x.srcT===t && x.outcome!=='noTarget');
    if(!r.length) continue;
    const d=r.filter(x=>x.outcome==='direct').length;
    const v=r.filter(x=>x.outcome==='viz').length;
    byTerminal.push({t,n:r.length,pct:Math.round((d+v)/r.length*100)});
  }
  byTerminal.sort((a,b)=>b.pct-a.pct || b.n-a.n);

  if(!s2.signals && !s3.signals) return null;

  const Row=({label,s})=><div style={{display:"grid",gridTemplateColumns:"52px 34px 34px 34px 34px 42px",gap:3,alignItems:"center",fontSize:7,padding:"3px 0",borderTop:"1px solid #171717"}}>
    <span style={{color:"#ddd",fontWeight:"bold"}}>{label}</span>
    <span style={{color:"#777",textAlign:"center"}}>{s.entriesN}</span>
    <span style={{color:"#86efac",textAlign:"center"}}>{s.direct}</span>
    <span style={{color:"#67e8f9",textAlign:"center"}}>{s.viz}</span>
    <span style={{color:"#fca5a5",textAlign:"center"}}>{s.fail}</span>
    <span style={{color:"#FFD700",fontWeight:"bold",textAlign:"right"}}>{s.totalPct}%</span>
  </div>;

  return <div style={{borderTop:"2px solid #1e1e1e",padding:"7px 8px",background:"#070707",flexShrink:0}}>
    <div style={{fontSize:7,color:"#FFD700",fontWeight:"bold",letterSpacing:".08em",marginBottom:5}}>BACKTEST TERMINAL + DOMINÂNCIA</div>
    <div style={{display:"grid",gridTemplateColumns:"52px 34px 34px 34px 34px 42px",gap:3,fontSize:6,color:"#444",paddingBottom:2}}>
      <span>MODELO</span><span style={{textAlign:"center"}}>ENT</span><span style={{textAlign:"center"}}>DIR</span><span style={{textAlign:"center"}}>VIZ</span><span style={{textAlign:"center"}}>FAIL</span><span style={{textAlign:"right"}}>D+V</span>
    </div>
    <Row label="T + TOP2" s={s2}/>
    <Row label="T + TOP3" s={s3}/>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:5,alignItems:"center"}}>
      <span style={{fontSize:6,color:"#444"}}>SINAIS {s2.signals} • SEM ALVO {s2.noTarget}</span>
      <span style={{fontSize:6,color:"#666"}}>DIRETO TOP2 {s2.directPct}%</span>
    </div>
    {byTerminal.length>0 && <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:5}}>
      {byTerminal.slice(0,5).map(x=><span key={x.t} title={x.n+" entradas no histórico"} style={{fontSize:6,color:x.pct>=70?"#FFD700":"#888",background:"#111",border:"1px solid #222",borderRadius:2,padding:"2px 4px"}}>T{x.t} {x.pct}% ({x.n})</span>)}
    </div>}
    <div style={{fontSize:6,color:"#3f3f3f",marginTop:5,lineHeight:1.35}}>Sem look-ahead: cada sinal usa apenas o histórico anterior ao gatilho; a dominância é congelada no giro do terminal de origem.</div>
  </div>;
}
`;

      src = src.slice(0,start) + replacement + src.slice(end);
      src = src.replace(
        '<TerminalPullAnalysis entries={entries} filterSel={filterSel} onSelectTerminal={selectProbabilityFilter}/>',
        '<TerminalPullAnalysis entries={entries} filterSel={filterSel} onSelectTerminal={selectProbabilityFilter}/>\n        <TerminalDominanceBacktest entries={entries}/>'
      );

      return { code: src, map: null };
    },
  };
}

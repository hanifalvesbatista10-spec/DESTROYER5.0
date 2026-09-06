export default function signalFeedbackPatch() {
  return {
    name: 'destroyer-signal-feedback-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      src = src.replace(
        '  const [showCards, setShowCards] = useState(true);',
        '  const [showCards, setShowCards] = useState(true);\n  const [showSignalFeedback, setShowSignalFeedback] = useState(false);'
      );

      const rootReturn = '  return (\n    <div style={{display:"flex",flexDirection:"row",minHeight:"100vh",width:"100vw",maxWidth:"100vw",margin:0,padding:0,background:"#0d0d0d",color:"#e5e5e5",fontFamily:"Arial, sans-serif"}}>';

      if (src.includes(rootReturn)) {
        const engine = `  const signalFeedback = useMemo(() => {
    if (!entries || entries.length < 2) return [];

    const events = [];
    const TERM_MEMBERS = {
      0:[0,10,20,30],1:[1,11,21,31],2:[2,12,22,32],3:[3,13,23,33],
      4:[4,14,24,34],5:[5,15,25,35],6:[6,16,26,36],7:[7,17,27],8:[8,18,28],9:[9,19,29]
    };
    const getTerminalLocal = (n) => {
      for (const [t,members] of Object.entries(TERM_MEMBERS)) if (members.includes(n)) return parseInt(t);
      return null;
    };
    const terminalCoverage = (t) => {
      const out = new Set(TERM_MEMBERS[t] || []);
      (TERM_MEMBERS[t] || []).forEach(n => getRaceNeighbors(n).forEach(v => out.add(v)));
      return out;
    };
    const dominantLocal = (arr, getter) => {
      const vals = arr.map(getter).filter(v=>v && v!=="—" && v!=="0");
      const cnt = {};
      vals.forEach(v=>cnt[v]=(cnt[v]||0)+1);
      return Object.entries(cnt).sort((a,b)=>b[1]-a[1] || vals.lastIndexOf(b[0])-vals.lastIndexOf(a[0]))[0] || null;
    };

    for (let i=0; i<entries.length-1; i++) {
      const snap = entries.slice(0,i+1);
      const current = snap[snap.length-1];
      const next = entries[i+1];
      if (!current || !next) continue;

      // RADAR: se havia leitura forte de repetição da casa atual,
      // o próximo número apenas confirma ou não essa casa.
      if (snap.length >= 6) {
        const currentHouse = current.grupoDezena || getGrupoDezena(current.num);
        let total=0, repeats=0;
        for(let j=0;j<snap.length-1;j++){
          const aHouse=snap[j].grupoDezena||getGrupoDezena(snap[j].num);
          if(aHouse!==currentHouse) continue;
          total++;
          const bHouse=snap[j+1].grupoDezena||getGrupoDezena(snap[j+1].num);
          if(bHouse===currentHouse) repeats++;
        }
        const pct=total?Math.round(repeats/total*100):0;
        if(total>=4 && pct>=60){
          const take=(next.grupoDezena||getGrupoDezena(next.num))===currentHouse;
          events.push({type:"RADAR",take,result:next.num});
        }
      }

      // QUADRANTE: congela os números que apareciam no quadrante e observa somente o próximo número.
      if (snap.length >= 14) {
        const last5=snap.slice(-5), last14=snap.slice(-14);
        const colCnt={};
        last5.forEach(e=>{if(e.coluna&&e.coluna!=="0"&&e.coluna!=="—") colCnt[e.coluna]=(colCnt[e.coluna]||0)+1;});
        const colVals=last5.map(e=>e.coluna);
        const top2cols=Object.entries(colCnt).sort((a,b)=>b[1]-a[1]||colVals.lastIndexOf(b[0])-colVals.lastIndexOf(a[0])).slice(0,2).map(([c])=>c);
        const bestParte=dominantLocal(last5,e=>e.parte);
        const duz14=dominantLocal(last14,e=>e.duzia), duz5=dominantLocal(last5,e=>e.duzia);
        if(top2cols.length && bestParte && duz14 && duz5 && duz14[0]===duz5[0]){
          const targets=[];
          for(let n=1;n<=36;n++) if(top2cols.includes(getColuna(n))&&getParte(n)===bestParte[0]&&getDuzia(n)===duz14[0]) targets.push(n);
          if(targets.length){
            events.push({type:"QUADRANTE",take:targets.includes(next.num),result:next.num});
          }
        }
      }

      // TERMINAL PUXA TERMINAL: TAKE se o próximo cair no terminal indicado
      // ou em 1 vizinho de cada lado no Race.
      if (snap.length >= 10) {
        const srcT=getTerminalLocal(current.num);
        if(srcT!==null){
          const occ=[];
          const members=TERM_MEMBERS[srcT];
          for(let j=snap.length-2;j>=0&&occ.length<3;j--){
            if(members.includes(snap[j].num)){
              const t=getTerminalLocal(snap[j+1].num);
              if(t!==null) occ.push(t);
            }
          }
          if(occ.length>=2){
            const cnt={}; occ.forEach(t=>cnt[t]=(cnt[t]||0)+1);
            const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
            if(best && best[1]>=2){
              const dstT=parseInt(best[0]);
              events.push({type:"TERMINAL",take:terminalCoverage(dstT).has(next.num),result:next.num});
            }
          }
        }
      }

      // DOMINÂNCIA: cruza todas as dominâncias ativas naquele momento.
      // Se o próximo número estiver no conjunto resultante, TAKE; senão FAIL.
      if (snap.length >= 3) {
        const last6=snap.slice(-6);
        const defs = [
          {vals:["0","10","20","30"],fn:n=>getGrupoDezena(n)},
          {vals:["P1","P2"],fn:n=>getParte(n)},
          {vals:["C1","C2","C3"],fn:n=>getColuna(n)},
          {vals:["PB e VA","PA e VB"],fn:n=>getLado(n)},
          {vals:["ZERO","DEZ"],fn:n=>getOpo(n)},
          {vals:["D1","D2","D3"],fn:n=>getDuzia(n)},
          {vals:["Vermelho","Preto","Verde"],fn:n=>getColor(n)},
          {vals:["ALTO","BAIXO"],fn:n=>getAltoBaixo(n)},
          {vals:["Par","Ímpar"],fn:n=>getParidade(n)},
          {vals:["Tier","Orphelins","Voisins"],fn:n=>getRegiao(n)},
          {vals:["369","258","147"],fn:n=>getCavalo(n)},
          {vals:["32-29","25-30","15-2","8-24","16-18"],fn:n=>getRegTrack(n)},
          {vals:["S1","S2","S3","S4","S5","S6"],fn:n=>getSetor(n)},
          {vals:["R1","R2","R3","R4","0"],fn:n=>getRua(n)},
          {vals:["R.Ímpar","R.Par"],fn:n=>getRuaParidade(n)},
          {vals:["F1e","F2e","F3e","F1d","F2d","F3d"],fn:n=>getFra(n)},
        ];
        const active=[];
        defs.forEach(d=>{
          d.vals.forEach(v=>{
            const c=last6.filter(e=>d.fn(e.num)===v).length;
            if(c/last6.length>=0.8) active.push({fn:d.fn,val:v});
          });
        });
        if(active.length){
          const targets=[];
          for(let n=0;n<=36;n++) if(active.every(d=>d.fn(n)===d.val)) targets.push(n);
          if(targets.length) events.push({type:"DOMINÂNCIA",take:targets.includes(next.num),result:next.num});
        }
      }
    }

    return events.reverse();
  }, [entries]);

  const signalFeedbackSummary = useMemo(() => {
    const names=["QUADRANTE","TERMINAL","RADAR","DOMINÂNCIA"];
    const byType={};
    names.forEach(type=>byType[type]={signals:0,takes:0,fails:0,pct:0});
    signalFeedback.forEach(e=>{
      const s=byType[e.type];
      if(!s) return;
      s.signals++;
      if(e.take) s.takes++; else s.fails++;
    });
    Object.values(byType).forEach(s=>{s.pct=s.signals?Math.round(s.takes/s.signals*100):0;});
    const signals=signalFeedback.length;
    const takes=signalFeedback.filter(e=>e.take).length;
    return {byType,signals,takes,pct:signals?Math.round(takes/signals*100):0};
  }, [signalFeedback]);

`;
        src = src.replace(rootReturn, engine + rootReturn);
      }

      const infoButton = '<button onClick={()=>setShowCards(v=>!v)} style={{padding:"0 12px",background:showCards?"#2d1a00":"transparent",border:showCards?"1px solid #f97316":"1px solid #333",borderRadius:2,color:showCards?"#f97316":"#555",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.06em"}}>{showCards?"● INFO":"○ INFO"}</button>';
      if(src.includes(infoButton)){
        src=src.replace(infoButton, infoButton + `
          <button onClick={()=>setShowSignalFeedback(v=>!v)}
            title="Ver TAKE/FAIL histórico dos sinais no próximo número"
            style={{padding:"0 12px",background:showSignalFeedback?"#052e2b":"transparent",border:showSignalFeedback?"1px solid #2dd4bf":"1px solid #333",borderRadius:2,color:showSignalFeedback?"#5eead4":"#64748b",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.05em"}}>
            📊 FEEDBACK{signalFeedbackSummary.signals?\` · \${signalFeedbackSummary.pct}%\`:""}
          </button>`);
      }

      const footerMarker = '      {/* Rodapé */}';
      if(src.includes(footerMarker)){
        const panel = `      {showSignalFeedback && (
        <div style={{margin:"4px 8px 8px",background:"#080808",border:"1px solid #24403d",borderRadius:5,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:"#5eead4",fontWeight:"bold",letterSpacing:"0.09em",marginBottom:7}}>◆ FEEDBACK DOS SINAIS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(110px,1fr))",gap:5,marginBottom:7}}>
            {["QUADRANTE","TERMINAL","RADAR","DOMINÂNCIA"].map(type=>{
              const s=signalFeedbackSummary.byType[type];
              return <div key={type} style={{background:"#0b0b0b",border:"1px solid #222",borderRadius:4,padding:"6px 8px"}}>
                <div style={{fontSize:7,color:"#777",fontWeight:"bold"}}>{type}</div>
                <div style={{fontSize:12,color:"#fff",fontWeight:"900"}}>{s.signals} sinais</div>
                <div style={{fontSize:8,color:"#86efac"}}>{s.takes} TAKE <span style={{color:"#555"}}>·</span> <span style={{color:"#fca5a5"}}>{s.fails} FAIL</span></div>
                <div style={{fontSize:11,color:"#FFD700",fontWeight:"bold",marginTop:2}}>{s.signals?s.pct+"%":"—"}</div>
              </div>;
            })}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:7,color:"#555"}}>ÚLTIMOS:</span>
            {signalFeedback.slice(0,10).map((e,idx)=><span key={idx} title={\`Resultado: \${e.result}\`} style={{fontSize:7,fontWeight:"bold",color:e.take?"#86efac":"#fca5a5",background:"#111",border:"1px solid #222",padding:"2px 5px",borderRadius:2}}>{e.type} {e.take?"TAKE":"FAIL"}</span>)}
            {signalFeedback.length===0&&<span style={{fontSize:8,color:"#444"}}>Ainda sem sinais avaliados.</span>}
          </div>
        </div>
      )}

`;
        src=src.replace(footerMarker,panel+footerMarker);
      }

      return { code: src, map: null };
    },
  };
}

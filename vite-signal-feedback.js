export default function signalFeedbackPatch() {
  return {
    name: 'destroyer-signal-feedback-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // Estado visual do painel. O motor é calculado continuamente a partir do histórico.
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
      const s = new Set(TERM_MEMBERS[t] || []);
      (TERM_MEMBERS[t] || []).forEach(n => getRaceNeighbors(n).forEach(v => s.add(v)));
      return s;
    };
    const dominantLocal = (arr, getter) => {
      const cnt = {};
      const vals = arr.map(getter).filter(v=>v && v!=="—" && v!=="0");
      vals.forEach(v=>{cnt[v]=(cnt[v]||0)+1;});
      return Object.entries(cnt).sort((a,b)=> b[1]-a[1] || vals.lastIndexOf(b[0])-vals.lastIndexOf(a[0]))[0] || null;
    };
    const statusFrom = (ok,total) => ok===total ? "CONFIRMOU" : ok>0 ? "PARCIAL" : "NÃO CONFIRMOU";

    const radarFeatures = [
      {label:"PTE",fn:e=>e?.parte||getParte(e?.num)},
      {label:"COL",fn:e=>e?.coluna||getColuna(e?.num)},
      {label:"P/I",fn:e=>e?.paridade||getParidade(e?.num)},
      {label:"LADO",fn:e=>e?.lado||getLado(e?.num)},
      {label:"OPO",fn:e=>e?.opo||getOpo(e?.num)},
      {label:"COR",fn:e=>e?.cor||getColor(e?.num)},
      {label:"DÚZIA",fn:e=>e?.duzia||getDuzia(e?.num)},
      {label:"R/P",fn:e=>getRuaParidade(e?.num)},
    ];
    const valid = v => v && v!=="—" && v!=="0";

    const dominanceChecks = [
      {label:"CASA", vals:["0","10","20","30"], fn:e=>e.grupoDezena||getGrupoDezena(e.num)},
      {label:"PTE", vals:["P1","P2"], fn:e=>e.parte||getParte(e.num)},
      {label:"C1", vals:["C1"], fn:e=>e.coluna==="C1"?"C1":null},
      {label:"C2", vals:["C2"], fn:e=>e.coluna==="C2"?"C2":null},
      {label:"C3", vals:["C3"], fn:e=>e.coluna==="C3"?"C3":null},
      {label:"LADO", vals:["PB e VA","PA e VB"], fn:e=>e.lado||getLado(e.num)},
      {label:"OPO", vals:["ZERO","DEZ"], fn:e=>e.opo||getOpo(e.num)},
      {label:"D1", vals:["d1V","d1P"], fn:e=>["d1V","d1P"].includes(e.gp)?e.gp:null},
      {label:"D2", vals:["d2I","d2P"], fn:e=>["d2I","d2P"].includes(e.gp)?e.gp:null},
      {label:"D3", vals:["d3V","d3P"], fn:e=>["d3V","d3P"].includes(e.gp)?e.gp:null},
      {label:"COR", vals:["Vermelho","Preto","Verde"], fn:e=>e.cor||getColor(e.num)},
      {label:"A/B", vals:["ALTO","BAIXO"], fn:e=>e.altobaixo||getAltoBaixo(e.num)},
      {label:"P/I", vals:["Par","Ímpar"], fn:e=>e.paridade||getParidade(e.num)},
      {label:"ZNA", vals:["Tier","Orphelins","Voisins"], fn:e=>e.regiao||getRegiao(e.num)},
      {label:"CAV", vals:["369","258","147"], fn:e=>e.cavalo||getCavalo(e.num)},
      {label:"RGT", vals:["32-29","25-30","15-2","8-24","16-18"], fn:e=>e.regtrack||getRegTrack(e.num)},
      {label:"SET", vals:["S1","S2","S3","S4","S5","S6"], fn:e=>e.setor||getSetor(e.num)},
      {label:"RUA", vals:["R1","R2","R3","R4","0"], fn:e=>getRua(e.num)},
      {label:"R/P", vals:["R.Ímpar","R.Par"], fn:e=>getRuaParidade(e.num)},
      {label:"DÚZIA", vals:["D1","D2","D3"], fn:e=>e.duzia||getDuzia(e.num)},
      {label:"FRA", vals:["F1e","F2e","F3e","F1d","F2d","F3d"], fn:e=>getFra(e.num)},
    ];

    for (let i=0; i<entries.length-1; i++) {
      const snap = entries.slice(0,i+1);
      const current = snap[snap.length-1];
      const next = entries[i+1];
      if (!current || !next) continue;

      // RADAR: só congela um evento quando a CASA atual já possui >=4 transições
      // históricas, taxa de repetição >=60% e ao menos uma característica forte.
      if (snap.length >= 6) {
        const currentHouse = current.grupoDezena || getGrupoDezena(current.num);
        const sourceTransitions = [];
        for (let j=0;j<snap.length-1;j++) {
          const a=snap[j], b=snap[j+1];
          const ha=a.grupoDezena||getGrupoDezena(a.num);
          if (ha===currentHouse) sourceTransitions.push({a,b,repeated:(b.grupoDezena||getGrupoDezena(b.num))===currentHouse});
        }
        const repeated = sourceTransitions.filter(x=>x.repeated);
        const repeatPct = sourceTransitions.length ? Math.round(repeated.length/sourceTransitions.length*100) : 0;
        const strong = radarFeatures.map(fd=>{
          const usable = repeated.filter(x=>valid(fd.fn(x.a))&&valid(fd.fn(x.b)));
          if (usable.length<4) return null;
          const same = usable.filter(x=>fd.fn(x.a)===fd.fn(x.b)).length;
          const samePct = Math.round(same/usable.length*100);
          const keep = samePct >= 50;
          const pct = keep ? samePct : 100-samePct;
          return pct>=60 ? {...fd,keep,pct,usable:usable.length} : null;
        }).filter(Boolean);
        if (sourceTransitions.length>=4 && repeatPct>=60 && strong.length) {
          const houseOk = (next.grupoDezena||getGrupoDezena(next.num))===currentHouse;
          const details = strong.map(s=>{
            const a=s.fn(current), b=s.fn(next);
            const ok=valid(a)&&valid(b)&&(s.keep ? a===b : a!==b);
            return {label:s.label, expectation:s.keep?"MANTÉM":"MUDA", ok};
          });
          const okCount = (houseOk?1:0)+details.filter(d=>d.ok).length;
          const total=1+details.length;
          events.push({type:"RADAR",at:i+1,result:next.num,status:statusFrom(okCount,total),okCount,total,
            headline:\`CASA \${currentHouse} · repetição histórica \${repeatPct}%\`,
            detail:[{label:\`CASA \${currentHouse}\`,expectation:"REPETE",ok:houseOk},...details]});
        }
      }

      // QUADRANTE: reproduz a regra visual atual e testa o próximo número no conjunto alvo congelado.
      if (snap.length >= 14) {
        const last5=snap.slice(-5), last14=snap.slice(-14);
        const colCnt={}; last5.forEach(e=>{if(e.coluna&&e.coluna!=="0"&&e.coluna!=="—")colCnt[e.coluna]=(colCnt[e.coluna]||0)+1;});
        const colVals=last5.map(e=>e.coluna);
        const top2cols=Object.entries(colCnt).sort((a,b)=>b[1]-a[1]||colVals.lastIndexOf(b[0])-colVals.lastIndexOf(a[0])).slice(0,2).map(([c])=>c);
        const bestParte=dominantLocal(last5,e=>e.parte);
        const duz14=dominantLocal(last14,e=>e.duzia), duz5=dominantLocal(last5,e=>e.duzia);
        if (top2cols.length && bestParte && duz14 && duz5 && duz14[0]===duz5[0]) {
          const targets=[];
          for(let n=1;n<=36;n++) if(top2cols.includes(getColuna(n))&&getParte(n)===bestParte[0]&&getDuzia(n)===duz14[0]) targets.push(n);
          if(targets.length){
            const ok=targets.includes(next.num);
            events.push({type:"QUADRANTE",at:i+1,result:next.num,status:ok?"CONFIRMOU":"NÃO CONFIRMOU",okCount:ok?1:0,total:1,
              headline:\`\${top2cols.join("+")} · \${bestParte[0]} · \${duz14[0]}\`,
              detail:[{label:\`Alvos: \${targets.join(", ")}\`,expectation:"CONJUNTO",ok}]});
          }
        }
      }

      // TERMINAL PUXA TERMINAL: avalia somente o terminal do número atual.
      if (snap.length >= 10) {
        const srcT=getTerminalLocal(current.num);
        if(srcT!==null){
          const occ=[];
          const members=TERM_MEMBERS[srcT];
          for(let j=snap.length-2;j>=0&&occ.length<3;j--){
            if(members.includes(snap[j].num)){
              const nextT=getTerminalLocal(snap[j+1].num);
              if(nextT!==null) occ.push(nextT);
            }
          }
          if(occ.length>=2){
            const cnt={};occ.forEach(t=>cnt[t]=(cnt[t]||0)+1);
            const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
            if(best && best[1]>=2){
              const dstT=parseInt(best[0]);
              const coverage=terminalCoverage(dstT);
              const ok=coverage.has(next.num);
              events.push({type:"TERMINAL",at:i+1,result:next.num,status:ok?"CONFIRMOU":"NÃO CONFIRMOU",okCount:ok?1:0,total:1,
                headline:\`T\${srcT} → T\${dstT} · \${best[1]}/\${occ.length}\`,
                detail:[{label:\`T\${dstT} + 1 vizinho Race/lado\`,expectation:"COBERTURA",ok}]});
            }
          }
        }
      }

      // DOMINÂNCIA: mesma janela de 6 e corte de 80%; congela todas as características dominantes.
      if (snap.length >= 3) {
        const last6=snap.slice(-6);
        const dom=[];
        dominanceChecks.forEach(ch=>{
          ch.vals.forEach(val=>{
            const c=last6.filter(e=>ch.fn(e)===val).length;
            if(c/last6.length>=0.8) dom.push({label:ch.label,val,pct:Math.round(c/last6.length*100),fn:ch.fn});
          });
        });
        if(dom.length){
          const detail=dom.map(d=>({label:\`\${d.label} \${d.val} · \${d.pct}%\`,expectation:"MANTÉM",ok:d.fn(next)===d.val}));
          const okCount=detail.filter(d=>d.ok).length,total=detail.length;
          events.push({type:"DOMINÂNCIA",at:i+1,result:next.num,status:statusFrom(okCount,total),okCount,total,
            headline:\`\${dom.length} característica\${dom.length>1?"s":""} dominante\${dom.length>1?"s":""}\`,detail});
        }
      }
    }

    return events.slice(-80).reverse();
  }, [entries]);

  const signalFeedbackSummary = useMemo(() => {
    const byType = {};
    signalFeedback.forEach(e=>{
      if(!byType[e.type]) byType[e.type]={events:0,confirmed:0,checks:0,okChecks:0};
      const s=byType[e.type]; s.events++; if(e.status==="CONFIRMOU")s.confirmed++; s.checks+=e.total||0; s.okChecks+=e.okCount||0;
    });
    const checks=signalFeedback.reduce((a,e)=>a+(e.total||0),0);
    const ok=signalFeedback.reduce((a,e)=>a+(e.okCount||0),0);
    return {byType,checks,ok,pct:checks?Math.round(ok/checks*100):0};
  }, [signalFeedback]);

`;
        src = src.replace(rootReturn, engine + rootReturn);
      }

      // Botão junto aos controles do rodapé.
      const infoButton = '<button onClick={()=>setShowCards(v=>!v)} style={{padding:"0 12px",background:showCards?"#2d1a00":"transparent",border:showCards?"1px solid #f97316":"1px solid #333",borderRadius:2,color:showCards?"#f97316":"#555",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.06em"}}>{showCards?"● INFO":"○ INFO"}</button>';
      if(src.includes(infoButton)){
        src=src.replace(infoButton, infoButton + `
          <button onClick={()=>setShowSignalFeedback(v=>!v)}
            title="Abrir/fechar auditoria histórica dos sinais"
            style={{padding:"0 12px",background:showSignalFeedback?"#052e2b":"transparent",border:showSignalFeedback?"1px solid #2dd4bf":"1px solid #333",borderRadius:2,color:showSignalFeedback?"#5eead4":"#666",fontSize:10,fontWeight:"bold",cursor:"pointer",fontFamily:"Arial, sans-serif",letterSpacing:"0.04em"}}>
            {showSignalFeedback?"●":"○"} FEEDBACK{signalFeedbackSummary.checks>0?\` · \${signalFeedbackSummary.pct}%\`:""}
          </button>`);
      }

      // Painel fica imediatamente antes do rodapé e só aparece ao clicar.
      const footerMarker = '      {/* Rodapé */}';
      if(src.includes(footerMarker)){
        const panel = `      {showSignalFeedback && (
        <div style={{margin:"4px 8px 8px",background:"#080808",border:"1px solid #24403d",borderRadius:5,padding:"8px 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:7}}>
            <span style={{fontSize:9,color:"#5eead4",fontWeight:"bold",letterSpacing:"0.09em"}}>◆ FEEDBACK DOS SINAIS</span>
            <span style={{fontSize:8,color:"#64748b"}}>avaliação congelada no momento do sinal → resultado seguinte</span>
            <span style={{marginLeft:"auto",fontSize:11,color:"#fff",fontWeight:"900"}}>{signalFeedbackSummary.checks?signalFeedbackSummary.pct+"%":"—"}</span>
          </div>

          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
            {["RADAR","QUADRANTE","TERMINAL","DOMINÂNCIA"].map(type=>{
              const s=signalFeedbackSummary.byType[type]||{events:0,confirmed:0,checks:0,okChecks:0};
              const pct=s.checks?Math.round(s.okChecks/s.checks*100):0;
              return <div key={type} style={{minWidth:105,background:"#0c1110",border:"1px solid #1f3532",borderRadius:4,padding:"5px 7px"}}>
                <div style={{fontSize:7,color:"#64748b",fontWeight:"bold"}}>{type}</div>
                <div style={{fontSize:12,color:s.checks?"#e2e8f0":"#475569",fontWeight:"900"}}>{s.checks?pct+"%":"—"}</div>
                <div style={{fontSize:7,color:"#64748b"}}>{s.events} evento{s.events===1?"":"s"} · {s.confirmed} total</div>
              </div>;
            })}
          </div>

          {signalFeedback.length ? (
            <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:250,overflowY:"auto"}}>
              {signalFeedback.slice(0,12).map((e,idx)=>{
                const good=e.status==="CONFIRMOU", partial=e.status==="PARCIAL";
                return <div key={e.type+"-"+e.at+"-"+idx} style={{background:"#0b0b0b",border:"1px solid "+(good?"#14532d":partial?"#854d0e":"#3f1d1d"),borderRadius:4,padding:"5px 7px"}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:8,color:"#94a3b8",fontWeight:"bold"}}>#{e.at} · {e.type}</span>
                    <span style={{fontSize:8,color:"#cbd5e1"}}>{e.headline}</span>
                    <span style={{fontSize:8,color:good?"#86efac":partial?"#fde68a":"#fca5a5",fontWeight:"bold"}}>{e.status}</span>
                    <span style={{fontSize:8,color:"#64748b"}}>→ resultado {e.result}</span>
                    <span style={{marginLeft:"auto",fontSize:8,color:"#fff",fontWeight:"bold"}}>{e.okCount}/{e.total}</span>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                    {e.detail.map((d,di)=><span key={di} style={{fontSize:7,color:d.ok?"#bbf7d0":"#fecaca",background:d.ok?"#052e16":"#2b1111",border:"1px solid "+(d.ok?"#166534":"#7f1d1d"),padding:"2px 5px",borderRadius:2}}>{d.ok?"✓":"×"} {d.label} · {d.expectation}</span>)}
                  </div>
                </div>;
              })}
            </div>
          ) : <div style={{fontSize:8,color:"#475569"}}>Ainda não há sinais concluídos para avaliar.</div>}

          <div style={{marginTop:7,fontSize:7,color:"#475569"}}>Leitura histórica de aderência ao sinal. Não altera filtros e não cria novos candidatos.</div>
        </div>
      )}

`;
        src=src.replace(footerMarker,panel+footerMarker);
      }

      return {code:src,map:null};
    },
  };
}

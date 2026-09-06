export default function targetDuziaPatch() {
  return {
    name: 'destroyer-target-duzia-confirmation-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // ALVOS ULT 5: a dúzia só é validada quando a MESMA dúzia lidera
      // de forma única tanto nos últimos 5 quanto nos últimos 10 resultados.
      // Isso evita um D1/D2/D3 aparecer só por um recorte curto ou por desempate de recência.
      const marker = "  const bestDuz   = dominant(last5, 'duzia');\n  const bestLado  = dominant(last5, 'lado');\n  const bestParte = dominant(last5, 'parte');\n  if(!bestDuz || !bestLado || !bestParte) return null;";
      const replacement = `  const bestDuz5  = dominant(last5, 'duzia');
  const last10 = entries.slice(-10);
  const bestDuz10 = dominant(last10, 'duzia');
  const bestLado  = dominant(last5, 'lado');
  const bestParte = dominant(last5, 'parte');
  if(!bestLado || !bestParte) return null;

  const uniqueLeader = (arr, key, leader) => {
    if(!leader) return false;
    const counts = {};
    arr.forEach(e => {
      const v = e?.[key];
      if(v && v !== "—") counts[v] = (counts[v] || 0) + 1;
    });
    const sorted = Object.values(counts).sort((a,b)=>b-a);
    return sorted.length > 0 && sorted[0] === leader[1] && (sorted.length === 1 || sorted[0] > sorted[1]);
  };

  const duziaConfirmada = !!(
    bestDuz5 && bestDuz10 &&
    bestDuz5[0] === bestDuz10[0] &&
    uniqueLeader(last5, 'duzia', bestDuz5) &&
    uniqueLeader(last10, 'duzia', bestDuz10)
  );

  const bestDuz = duziaConfirmada ? bestDuz5 : null;`;
      if (src.includes(marker)) src = src.replace(marker, replacement);

      // Evita destructuring quando a dúzia não foi confirmada nas duas janelas.
      src = src.replace(
        "  const [duz, duzQty] = bestDuz;\n  const [lado, ladoQty] = bestLado;",
        `  const duz = bestDuz ? bestDuz[0] : null;
  const duzQty = bestDuz ? bestDuz[1] : 0;
  const duz10Qty = bestDuz10 && bestDuz && bestDuz10[0] === bestDuz[0] ? bestDuz10[1] : 0;
  const [lado, ladoQty] = bestLado;`
      );

      // Targets: a dúzia participa apenas quando confirmada 5/10; caso contrário,
      // o restante do painel continua funcionando com LADO + PARTE.
      src = src.replace(
        "    if(getDuzia(n)!==duz) continue;\n    if(getLado(n)!==lado) continue;",
        `    if(duz && getDuzia(n)!==duz) continue;
    if(getLado(n)!==lado) continue;`
      );

      // Card da dúzia só aparece quando passou pela confirmação dupla.
      const card = '<span style={{fontSize:9,fontWeight:"bold",color:duzSch.text,background:duzSch.bg,padding:"2px 6px",borderRadius:2}}>{duz} {duzQty}/5</span>';
      const newCard = `{duz && <span title={\`Dúzia confirmada: \${duzQty}/5 e \${duz10Qty}/10\`} style={{fontSize:9,fontWeight:"bold",color:duzSch.text,background:duzSch.bg,padding:"2px 6px",borderRadius:2}}>{duz} {duzQty}/5 · {duz10Qty}/10</span>}`;
      if (src.includes(card)) src = src.replace(card, newCard);

      // Palette segura quando não existe sinal de dúzia confirmado.
      src = src.replace(
        '  const duzSch = DUZIA_CELL[duz]||{bg:"#111",text:"#aaa"};',
        '  const duzSch = duz ? (DUZIA_CELL[duz]||{bg:"#111",text:"#aaa"}) : {bg:"#111",text:"#aaa"};'
      );

      return { code: src, map: null };
    },
  };
}

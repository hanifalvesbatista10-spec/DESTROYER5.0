export default function terminalNeighborWeightPatch() {
  return {
    name: 'destroyer-terminal-neighbor-weight-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // Leitura lateral: acerto direto vale 1; vizinho direto no racetrack vale 0,5.
      // Para uma chamada ser considerada forte, exige pelo menos 1 acerto direto
      // e score ponderado >= 2. Assim, 3 vizinhos sem nenhum direto não formam sinal.
      src = src.replace(
        `        const hits=direct+viz;\n        if(hits>0) scored.push({dst,hits,direct,viz});\n      }\n      scored.sort((a,b)=>b.hits-a.hits || b.direct-a.direct || a.dst-b.dst);\n      const best=scored[0];\n      if(!best || best.hits < 2) continue;`,
        `        const hits=direct+viz;\n        const score=direct+(viz*0.5);\n        if(hits>0) scored.push({dst,hits,score,direct,viz});\n      }\n      scored.sort((a,b)=>b.score-a.score || b.direct-a.direct || b.hits-a.hits || a.dst-b.dst);\n      const best=scored[0];\n      if(!best || best.direct < 1 || best.score < 2) continue;`
      );

      src = src.replace(
        `      out.push({srcT:t,dstT:best.dst,cnt:best.hits,direct:best.direct,viz:best.viz,total:occurrences.length,occurrences:detailed});`,
        `      out.push({srcT:t,dstT:best.dst,cnt:best.score,direct:best.direct,viz:best.viz,total:occurrences.length,occurrences:detailed});`
      );

      // Backtest usa a MESMA regra de formação da chamada, evitando que o histórico
      // avalie um critério diferente do que aparece ao vivo na lateral.
      src = src.replace(
        `        ranked.push({dstT,hits:direct+viz,direct,viz});\n      }\n      ranked.sort((a,b)=>b.hits-a.hits||b.direct-a.direct||a.dstT-b.dstT);\n      if(ranked[0]?.hits>=2) out.push({srcT,...ranked[0]});`,
        `        const hits=direct+viz;\n        const score=direct+(viz*0.5);\n        ranked.push({dstT,hits,score,direct,viz});\n      }\n      ranked.sort((a,b)=>b.score-a.score||b.direct-a.direct||b.hits-a.hits||a.dstT-b.dstT);\n      if(ranked[0]?.direct>=1 && ranked[0]?.score>=2) out.push({srcT,...ranked[0]});`
      );

      // Exibição lateral: mostra score ponderado e percentual coerente.
      src = src.replace(
        `          const pct=Math.round(cnt/total*100);`,
        `          const pct=Math.round(cnt/total*100);\n          const cntLabel=Number.isInteger(cnt)?String(cnt):cnt.toFixed(1);`
      );
      src = src.replace(
        `>{cnt}/{total}</span>`,
        `>{cntLabel}/{total}</span>`
      );

      return { code: src, map: null };
    },
  };
}

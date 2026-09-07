export default function directedAnalysisHistoryLockPatch() {
  return {
    name: 'directed-analysis-history-lock-patch',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/App.jsx') && !id.endsWith('\\src\\App.jsx')) return null;
      if (!code.includes('DIRECTED_STRATEGIES')) return null;

      let next = code;

      // C3 PA: corrige 19 -> 9 nos números principais.
      next = next.replace(
        '{ id:"c3-pa", label:"C3 PA", primary:[3,12,18,19,33,24], secondary:[16,22,35] }',
        '{ id:"c3-pa", label:"C3 PA", primary:[3,12,18,9,33,24], secondary:[16,22,35] }'
      );

      // Quando uma estratégia/filtro está ativo, passar o mouse sobre o histórico
      // não pode substituir temporariamente o destaque visual da estratégia.
      // O clique continua disponível para uma inspeção intencional do número.
      next = next.replace(
        'onMouseEnter={()=>setHoveredNumber(entry.num)} onMouseLeave={()=>setHoveredNumber(null)} onClick={()=>setLockedNumber(v=>v===entry.num?null:entry.num)}',
        'onClick={()=>setLockedNumber(v=>v===entry.num?null:entry.num)}'
      );

      if (next === code) return null;
      return { code: next, map: null };
    },
  };
}

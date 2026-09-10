export default function terminalActivationNowPatch() {
  return {
    name: 'destroyer-terminal-activation-now-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      // A chamada lateral deve usar a relação válida já recalculada COM o número atual.
      // Ex.: 27 seguido de 27 pode completar a evidência de T7 e, ao mesmo tempo,
      // o segundo 27 já é um novo T7 disponível para ativar a próxima chamada.
      // Antes, o uso de priorCalls descartava esse cenário e o alerta não acendia.
      src = src.replace(
        `  const activatedPairs = new Set(\n    priorCalls\n      .filter(r => r.srcT === lastTerminal)\n      .map(r => r.srcT + '>' + r.dstT)\n  );`,
        `  const activatedPairs = new Set(\n    results\n      .filter(r => r.srcT === lastTerminal)\n      .map(r => r.srcT + '>' + r.dstT)\n  );`
      );

      return { code: src, map: null };
    },
  };
}

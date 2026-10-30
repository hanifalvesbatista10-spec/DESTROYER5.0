// Estratégias personalizadas.
//
// Cavalo × Rua: quando um número se repete, o espaço entre as duas vezes
// (quantos números saíram no meio) diz o cavalo pelo último dígito:
//   0, 3, 6, 9 → cavalo 0369 → posições 3, 6, 9
//   1, 4, 7    → cavalo 147  → posições 1, 4, 7
//   2, 5, 8    → cavalo 258  → posições 2, 5, 8
// Depois da repetição, conta as rodadas sem sair nenhum número da rua (de 3
// números) do número repetido. A rua tem que voltar depois de exatamente uma
// das posições do cavalo: na 1ª é BATIDA, na 2ª ou 3ª é COMPLEMENTADA; passou
// da última sem vir, ANULADA. Se a rua aparecer fora de uma posição, a
// contagem recomeça dali.

export const CAVALOS = {
  "0369": [3, 6, 9],
  "147": [1, 4, 7],
  "258": [2, 5, 8],
};
const ESPACO_MAX = 9;

export const cavaloDoEspaco = (espaco) => (espaco % 3 === 0 ? "0369" : espaco % 3 === 1 ? "147" : "258");

// Rua de 3 números da mesa: 1-2-3, 4-5-6 … 34-35-36. O zero fica sozinho.
export function ruaDe(n) {
  if (n === 0) return [0];
  const ini = Math.floor((n - 1) / 3) * 3 + 1;
  return [ini, ini + 1, ini + 2];
}

// Percorre uma sessão (do mais antigo ao mais novo).
// Devolve as ocorrências da estratégia e, para cada giro i, as apostas que
// valem para o giro seguinte ({ cavalo, nums, pos, ordem }).
export function cavalosRua(nums) {
  const ocorrencias = [];
  const apostas = nums.map(() => []);
  const ativas = [];
  const ultimaVez = new Map();

  nums.forEach((n, i) => {
    // 1) o número novo resolve ou avança as ocorrências que estavam abertas
    for (const oc of ativas) {
      if (oc.status !== "aguardando") continue;
      const posicoes = CAVALOS[oc.cavalo];
      if (oc.rua.includes(n)) {
        const k = posicoes.indexOf(oc.semRua);
        oc.eventos.push({ i, semRua: oc.semRua, veio: true, aposta: k >= 0 });
        if (k >= 0) { oc.status = k === 0 ? "batida" : "complementada"; oc.fim = i; oc.posicao = oc.semRua; }
        else oc.semRua = 0; // apareceu fora da posição: recomeça a contagem
      } else {
        if (posicoes.includes(oc.semRua)) oc.eventos.push({ i, semRua: oc.semRua, veio: false, aposta: true });
        oc.semRua++;
        if (oc.semRua > posicoes[posicoes.length - 1]) { oc.status = "anulada"; oc.fim = i; }
      }
    }

    // 2) repetição de número abre uma ocorrência nova
    if (ultimaVez.has(n)) {
      const espaco = i - ultimaVez.get(n) - 1;
      if (espaco <= ESPACO_MAX) {
        const oc = { inicio: i, numero: n, espaco, cavalo: cavaloDoEspaco(espaco), rua: ruaDe(n), semRua: 0, status: "aguardando", eventos: [] };
        ocorrencias.push(oc);
        ativas.push(oc);
      }
    }
    ultimaVez.set(n, i);

    // 3) apostas para o próximo giro: ocorrência abertas que chegaram numa posição
    for (const oc of ativas) {
      if (oc.status !== "aguardando") continue;
      const posicoes = CAVALOS[oc.cavalo];
      const ordem = posicoes.indexOf(oc.semRua);
      if (ordem >= 0) apostas[i].push({ cavalo: oc.cavalo, nums: oc.rua, pos: oc.semRua, ordem, oc });
    }
  });
  return { ocorrencias, apostas };
}

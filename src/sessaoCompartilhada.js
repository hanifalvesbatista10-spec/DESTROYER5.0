// Números compartilhados entre a tabela e o Validador.
// Guarda todas as sessões (a última é a sessão atual) e salva no navegador,
// então um número posto numa tela aparece na outra e sobrevive a recarregar a página.
import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "validador.sessoes.v1";
export const hoje = () => new Date().toISOString().slice(0, 10);

function carregar() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(s) && s.length) return s;
  } catch { /* sem armazenamento: começa vazio */ }
  return [{ date: hoje(), nums: [] }];
}

let sessoes = carregar();
const ouvintes = new Set();
const avisar = () => ouvintes.forEach(f => f());

export const getSessoes = () => sessoes;

export function setSessoes(next) {
  sessoes = typeof next === "function" ? next(sessoes) : next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessoes)); } catch { /* segue sem salvar */ }
  avisar();
}

export function subscribe(f) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

// Outra aba mexeu nos números: recarrega daqui também.
if (typeof window !== "undefined") {
  window.addEventListener("storage", e => {
    if (e.key === STORAGE_KEY) { sessoes = carregar(); avisar(); }
  });
}

export function useSessoes() {
  return [useSyncExternalStore(subscribe, getSessoes), setSessoes];
}

// Para a tabela: a sessão atual no formato de entradas que ela usa,
// com o mesmo jeito de chamar do useState (valor ou função).
export function useEntradasCompartilhadas(buildEntry) {
  const todas = useSyncExternalStore(subscribe, getSessoes);
  const nums = todas[todas.length - 1].nums;
  const entries = useMemo(() => nums.map((n, i) => buildEntry(n, i + 1)), [nums, buildEntry]);
  const setEntries = useCallback(up => {
    setSessoes(prev => {
      const atual = prev[prev.length - 1];
      const antes = atual.nums.map((n, i) => buildEntry(n, i + 1));
      const depois = typeof up === "function" ? up(antes) : up;
      return [...prev.slice(0, -1), { ...atual, nums: depois.map(e => e.num) }];
    });
  }, [buildEntry]);
  return [entries, setEntries];
}

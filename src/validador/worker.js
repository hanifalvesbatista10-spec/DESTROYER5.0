import { validar } from "./engine.js";

// Roda a validação fora da tela para os cliques não travarem.
self.onmessage = (e) => {
  self.postMessage({ id: e.data.id, res: validar(e.data.sessoes) });
};

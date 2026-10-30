import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { CONF_ALERTA, parseHistorico, pct, sessoesRepetidas } from "./validador/engine.js";
import { hoje, useSessoes } from "./sessaoCompartilhada.js";

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const numBg = n => n === 0 ? "#15803d" : RED.has(n) ? "#CC0000" : "#1f1f1f";
const dataBR = d => d.split("-").reverse().join("/");

const FONT = "Arial, sans-serif";
const PANEL = { background: "#111", border: "1px solid #262626", borderRadius: 6, padding: 14 };
const H2 = { margin: "0 0 10px", fontSize: 12, letterSpacing: 1.5, color: "#888", fontWeight: "bold", textTransform: "uppercase" };
const BTN = { background: "#1f1f1f", color: "#ddd", border: "1px solid #333", borderRadius: 4, padding: "6px 10px", fontSize: 12, fontFamily: FONT, cursor: "pointer" };
const TEXTAREA = { width: "100%", boxSizing: "border-box", background: "#0b0b0b", color: "#ddd", border: "1px solid #333", borderRadius: 4, padding: 8, fontFamily: "monospace", fontSize: 12 };

function Bola({ n, size = 28 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: "50%",
      background: numBg(n), color: "#fff", fontWeight: "bold", fontSize: size * 0.45, border: "1px solid #444", flexShrink: 0 }}>{n}</span>
  );
}

function Mesa({ onPick }) {
  const linhas = [3, 2, 1].map(r => Array.from({ length: 12 }, (_, i) => i * 3 + r));
  const cel = n => (
    <button key={n} onClick={() => onPick(n)} style={{ background: numBg(n), color: "#fff", border: "1px solid #333", fontWeight: "bold",
      fontSize: 12, height: 30, cursor: "pointer", fontFamily: FONT, padding: 0 }}>{n}</button>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "34px repeat(12, 1fr)", gap: 2 }}>
      <div style={{ gridRow: "span 3", display: "grid" }}>{cel(0)}</div>
      {linhas.flat().map(cel)}
    </div>
  );
}

function Sinal({ res, calculando }) {
  if (!res) return <div style={{ ...PANEL, textAlign: "center", padding: 40, color: "#666" }}>Calculando…</div>;
  const { sinal } = res;
  const melhor = [...res.estrategias].sort((a, b) => b.treino.z - a.treino.z)[0];
  if (!sinal.entrar) {
    return (
      <div style={{ ...PANEL, textAlign: "center", padding: "36px 20px", opacity: calculando ? 0.6 : 1 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: "#777" }}>SITUAÇÃO ATUAL</div>
        <div style={{ fontSize: 44, fontWeight: "bold", color: "#9ca3af", margin: "8px 0" }}>SEM SINAL</div>
        <div style={{ color: "#bbb", fontSize: 14 }}>{sinal.motivo}</div>
        {melhor && res.total >= 500 && (
          <div style={{ color: "#777", fontSize: 12, marginTop: 14 }}>
            Mais perto de passar: <b style={{ color: "#aaa" }}>{melhor.label}</b> — {melhor.motivo}.
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ ...PANEL, borderColor: "#15803d", textAlign: "center", padding: "28px 20px", opacity: calculando ? 0.6 : 1 }}>
      <div style={{ fontSize: 13, letterSpacing: 2, color: "#86efac" }}>ESTRATÉGIA APROVADA FORMOU SINAL</div>
      <div style={{ fontSize: 44, fontWeight: "bold", color: "#22c55e", margin: "6px 0 14px" }}>ENTRAR</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {sinal.nums.map(n => <Bola key={n} n={n} size={42} />)}
      </div>
      <div style={{ marginTop: 18, textAlign: "left" }}>
        {sinal.fontes.map(f => (
          <div key={f.id} style={{ fontSize: 13, color: "#ccc", borderTop: "1px solid #222", padding: "8px 0" }}>
            <div>{f.agora.detalhe}.</div>
            <div style={{ color: "#888", marginTop: 3 }}>
              Acerto real em dados que ela não tinha visto: <b style={{ color: "#ddd" }}>{pct(f.teste.taxa)}</b> contra {pct(f.teste.acaso)} do acaso, em {f.teste.n} sinais.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Colunas({ res }) {
  return (
    <div style={PANEL}>
      <h2 style={H2}>Colunas</h2>
      {!res ? <div style={{ color: "#666", fontSize: 12 }}>…</div> : res.colunas.map(c => (
        <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderTop: "1px solid #1d1d1d" }}>
          <span style={{ width: 92, fontSize: 12, color: "#ddd", fontWeight: "bold" }}>{c.label}</span>
          <span style={{ fontSize: 10, fontWeight: "bold", padding: "2px 6px", borderRadius: 3,
            background: c.estavel ? "#14532d" : "#262626", color: c.estavel ? "#86efac" : "#888" }}>{c.estavel ? "ESTÁVEL" : "INSTÁVEL"}</span>
          <span style={{ fontSize: 11, color: "#777", flex: 1 }}>
            {c.melhor.treino.n ? `${pct(c.melhor.treino.taxa)} vs ${pct(c.melhor.treino.acaso)} acaso` : "sem sinais ainda"}
          </span>
        </div>
      ))}
    </div>
  );
}

const retorno = r => (r.fichas ? r.saldo / r.fichas : 0);
const sinalRet = x => `${x >= 0 ? "+" : ""}${(x * 100).toFixed(1).replace(".", ",")}%`;

// Números em que mais sinais da tabela concordam agora. O alerta de "mais indicado"
// só acende se a estratégia de confluência tiver sido aprovada pelo validador.
function Confluencia({ res }) {
  if (!res) return null;
  const est = id => res.estrategias.find(e => e.id === id);
  const alerta = est("conf:alerta");
  const ranking = (res.confluencia || []).slice(0, 10);
  const topo = ranking[0];
  const max = topo?.sinais || 1;
  return (
    <div style={PANEL}>
      <h2 style={H2}>Confluência dos sinais</h2>
      {alerta.liberada && alerta.agora ? (
        <div style={{ border: "2px solid #FFD700", background: "#2a2200", borderRadius: 6, padding: 12, marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
          <Bola n={alerta.agora.nums[0]} size={46} />
          <div>
            <div style={{ color: "#FFD700", fontWeight: "bold", fontSize: 16 }}>⚠ MAIS INDICADO</div>
            <div style={{ color: "#ddd", fontSize: 12 }}>{alerta.agora.detalhe}.</div>
            <div style={{ color: "#aaa", fontSize: 11 }}>Acerto real em dados novos: {pct(alerta.teste.taxa)} contra {pct(alerta.teste.acaso)} do acaso.</div>
          </div>
        </div>
      ) : topo && topo.sinais >= CONF_ALERTA ? (
        <div style={{ border: "1px dashed #555", borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 12, color: "#aaa" }}>
          {topo.sinais} sinais concordam no <b style={{ color: "#ddd" }}>{topo.n}</b>, mas o alerta está desligado: quando isso aconteceu antes,
          acertou {pct(alerta.geral.taxa)} contra {pct(alerta.geral.acaso)} do acaso em {alerta.geral.n} vezes.
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#777", marginBottom: 10 }}>
          Alerta acende com {CONF_ALERTA} ou mais sinais no mesmo número, e só se essa regra for aprovada pelo validador.
        </div>
      )}
      {ranking.length ? ranking.map(({ n, sinais }) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
          <Bola n={n} size={22} />
          <div style={{ flex: 1, height: 8, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${(sinais / max) * 100}%`, height: "100%", background: sinais >= CONF_ALERTA ? "#FFD700" : "#4b5563" }} />
          </div>
          <span style={{ fontSize: 11, color: "#aaa", width: 62, textAlign: "right" }}>{sinais} sina{sinais > 1 ? "is" : "l"}</span>
        </div>
      )) : <div style={{ fontSize: 12, color: "#666" }}>Nenhum sinal da tabela formado agora.</div>}
      <div style={{ marginTop: 10, borderTop: "1px solid #1d1d1d", paddingTop: 8 }}>
        {["conf:top1", "conf:top3", "conf:alerta"].map(id => {
          const e = est(id);
          return (
            <div key={id} style={{ fontSize: 11, color: "#888", padding: "2px 0" }}>
              {e.label}: <span style={{ color: "#ccc" }}>{e.geral.n ? `${pct(e.geral.taxa)} vs ${pct(e.geral.acaso)} acaso, retorno ${sinalRet(retorno(e.geral))}` : "sem histórico"}</span>
              <span style={{ color: e.liberada ? "#22c55e" : "#666" }}> · {e.liberada ? "APROVADA" : "não aprovada"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Os 15 sinais que a tabela DESTROYER forma, com o resultado real de cada um.
function SinaisTabela({ res }) {
  if (!res) return null;
  const lista = res.estrategias.filter(e => e.familia === "Sinal da tabela").sort((a, b) => retorno(b.geral) - retorno(a.geral));
  const cell = { padding: "6px 6px", borderTop: "1px solid #1d1d1d", fontSize: 11, verticalAlign: "top" };
  const cor = x => (x > 0 ? "#86efac" : x < 0 ? "#fca5a5" : "#aaa");
  return (
    <div style={PANEL}>
      <h2 style={H2}>Sinais da tabela</h2>
      <div style={{ fontSize: 11, color: "#777", marginBottom: 8 }}>
        Cada sinal conferido com o número que saiu depois. Retorno = ganho ou perda apostando 1 ficha em cada número do sinal.
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", color: "#ccc", fontFamily: FONT }}>
          <thead><tr style={{ color: "#888", fontSize: 11, textAlign: "left" }}>
            <th style={cell}>Sinal</th><th style={cell}>Todo o histórico</th><th style={cell}>Sessão atual</th><th style={cell}>Último</th>
          </tr></thead>
          <tbody>{lista.map(e => (
            <Fragment key={e.id}>
            <tr>
              <td style={cell}>
                <div style={{ color: "#ddd", fontWeight: "bold" }}>{e.label}</div>
                <div style={{ color: e.liberada ? "#22c55e" : "#666", fontSize: 10 }}>{e.liberada ? "APROVADO" : "não aprovado"}</div>
              </td>
              <td style={cell}>
                {e.geral.n ? <>
                  <div>{pct(e.geral.taxa)} <span style={{ color: "#666" }}>vs {pct(e.geral.acaso)}</span></div>
                  <div style={{ color: cor(e.geral.saldo) }}>{sinalRet(retorno(e.geral))} <span style={{ color: "#666" }}>· {e.geral.n} sinais</span></div>
                </> : "—"}
              </td>
              <td style={cell}>
                {e.sessao.n ? <>
                  <div>{pct(e.sessao.taxa)} <span style={{ color: "#666" }}>vs {pct(e.sessao.acaso)}</span></div>
                  <div style={{ color: cor(e.sessao.saldo) }}>{sinalRet(retorno(e.sessao))} <span style={{ color: "#666" }}>· {e.sessao.n}</span></div>
                </> : "—"}
              </td>
              <td style={{ ...cell, color: e.ultimo ? (e.ultimo.hit ? "#22c55e" : "#f87171") : "#666", fontWeight: "bold", whiteSpace: "nowrap" }}>
                {e.ultimo ? (e.ultimo.hit ? "✓ acertou" : "✗ errou") : "—"}
              </td>
            </tr>
            {e.agora && (
              <tr>
                <td colSpan={4} style={{ padding: "0 6px 8px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center", opacity: e.liberada ? 1 : 0.55 }}>
                    <span style={{ fontSize: 10, color: "#888", marginRight: 4 }}>agora:</span>
                    {e.agora.nums.map(n => <Bola key={n} n={n} size={20} />)}
                  </div>
                </td>
              </tr>
            )}
            </Fragment>
          ))}</tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
        Números de sinal não aprovado aparecem apagados: são o que a tabela mostra, não uma indicação de entrada.
      </div>
    </div>
  );
}

function Estrategias({ res }) {
  const [aberto, setAberto] = useState(false);
  if (!res) return null;
  const lista = [...res.estrategias].sort((a, b) => b.treino.z - a.treino.z);
  const cell = { padding: "4px 6px", borderTop: "1px solid #1d1d1d", fontSize: 11 };
  return (
    <div style={PANEL}>
      <button style={BTN} onClick={() => setAberto(a => !a)}>{aberto ? "▾" : "▸"} Ver as {lista.length} estratégias testadas</button>
      {aberto && (
        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", color: "#ccc", fontFamily: FONT }}>
            <thead><tr style={{ color: "#888", fontSize: 11, textAlign: "left" }}>
              <th style={cell}>Estratégia</th><th style={cell}>Treino</th><th style={cell}>Dados novos</th><th style={cell}>Situação</th>
            </tr></thead>
            <tbody>{lista.map(e => (
              <tr key={e.id}>
                <td style={cell}><div style={{ color: "#ddd" }}>{e.label}</div><div style={{ color: "#666" }}>{e.familia}</div></td>
                <td style={cell}>{e.treino.n ? `${pct(e.treino.taxa)} vs ${pct(e.treino.acaso)} (${e.treino.n})` : "—"}</td>
                <td style={cell}>{e.teste.n ? `${pct(e.teste.taxa)} vs ${pct(e.teste.acaso)} (${e.teste.n})` : "—"}</td>
                <td style={{ ...cell, color: e.liberada ? "#22c55e" : "#777" }}>{e.liberada ? "APROVADA" : e.motivo}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Historico({ sessoes, setSessoes }) {
  const [texto, setTexto] = useState("");
  const [recentePrimeiro, setRecentePrimeiro] = useState(true);
  const [numeroRecentePrimeiro, setNumeroRecentePrimeiro] = useState(true);
  const [aviso, setAviso] = useState("");
  const importar = () => {
    const blocos = parseHistorico(texto, recentePrimeiro, numeroRecentePrimeiro);
    if (!blocos.length) { setAviso("Nenhuma linha com data e números encontrada."); return; }
    const atual = sessoes[sessoes.length - 1];
    const anteriores = sessoes.slice(0, -1);
    const juntas = [...anteriores, ...blocos, ...(atual.nums.length ? [atual] : [{ date: hoje(), nums: [] }])];
    // Sessão já salva antes (mesmo trecho, em qualquer ordem) não entra duas vezes.
    const repetidas = sessoesRepetidas(juntas);
    setSessoes(juntas.filter((_, i) => !repetidas.includes(i)));
    setTexto("");
    setAviso(`${blocos.length} sessões importadas (${blocos.reduce((a, b) => a + b.nums.length, 0)} números)` +
      (repetidas.length ? `; ${repetidas.length} sessões repetidas foram descartadas, ficou a cópia mais nova.` : "."));
  };
  const repetidasSalvas = useMemo(() => sessoesRepetidas(sessoes), [sessoes]);
  const exportar = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(sessoes)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `validador-${hoje()}.json`; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div style={PANEL}>
      <h2 style={H2}>Histórico</h2>
      {repetidasSalvas.length > 0 && (
        <div style={{ border: "1px solid #b45309", background: "#2a1a05", borderRadius: 4, padding: 10, marginBottom: 12, fontSize: 12, color: "#fcd34d" }}>
          {repetidasSalvas.length} sessões repetem números de outras (provavelmente o mesmo histórico importado duas vezes).
          Elas estão sendo ignoradas na validação, porque repetição faz estratégia parecer aprovada sem ser.
          <div style={{ marginTop: 8 }}>
            <button style={BTN} onClick={() => setSessoes(sessoes.filter((_, i) => !repetidasSalvas.includes(i)))}>Remover as repetidas do histórico</button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {sessoes.slice(0, -1).map((s, i) => (
          <span key={i} style={{ fontSize: 11, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 3, padding: "3px 6px", color: "#bbb" }}>
            {dataBR(s.date)} · {s.nums.length}
            <button title="Apagar sessão" onClick={() => setSessoes(sessoes.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", color: "#777", cursor: "pointer", marginLeft: 4, padding: 0 }}>×</button>
          </span>
        ))}
        {sessoes.length === 1 && <span style={{ fontSize: 12, color: "#666" }}>Nenhuma sessão anterior.</span>}
      </div>
      <textarea rows={4} value={texto} onChange={e => setTexto(e.target.value)} style={TEXTAREA}
        placeholder={"Uma sessão por linha, com data e números do mais antigo para o mais novo:\n30/10/2026 — 34 28 21 10 32 …"} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
        <button style={BTN} onClick={importar}>Importar sessões</button>
        <label style={{ fontSize: 12, color: "#999" }}>
          <input type="checkbox" checked={recentePrimeiro} onChange={e => setRecentePrimeiro(e.target.checked)} /> lista começa pela sessão mais recente
        </label>
        <label style={{ fontSize: 12, color: "#999" }}>
          <input type="checkbox" checked={numeroRecentePrimeiro} onChange={e => setNumeroRecentePrimeiro(e.target.checked)} /> em cada linha o primeiro número é o mais recente (igual à tabela)
        </label>
        <button style={{ ...BTN, marginLeft: "auto" }} onClick={exportar}>Exportar</button>
      </div>
      {aviso && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>{aviso}</div>}
    </div>
  );
}

export default function Validador() {
  const [sessoes, setSessoes] = useSessoes();
  const [resultado, setResultado] = useState(null);
  const [colar, setColar] = useState("");
  const worker = useRef(null);
  const pedido = useRef({ id: 0, sessoes: null });

  useEffect(() => {
    worker.current = new Worker(new URL("./validador/worker.js", import.meta.url), { type: "module" });
    worker.current.onmessage = e => {
      const p = pedido.current;
      if (e.data.id === p.id) setResultado({ res: e.data.res, para: p.sessoes });
    };
    return () => worker.current.terminate();
  }, []);

  useEffect(() => {
    const id = pedido.current.id + 1;
    pedido.current = { id, sessoes };
    const t = setTimeout(() => worker.current?.postMessage({ id, sessoes }), 150);
    return () => clearTimeout(t);
  }, [sessoes]);

  const res = resultado?.res ?? null;
  const calculando = resultado?.para !== sessoes;

  const atual = sessoes[sessoes.length - 1];
  const setAtual = nums => setSessoes([...sessoes.slice(0, -1), { ...atual, nums }]);
  const ultimos = useMemo(() => atual.nums.slice(-14).reverse(), [atual]);
  const adicionarColados = () => {
    // Mesma ordem da caixa da tabela: o primeiro número colado é o mais recente.
    const nums = (colar.match(/\d+/g) || []).map(Number).filter(n => n <= 36).reverse();
    if (nums.length) setAtual([...atual.nums, ...nums]);
    setColar("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ddd", fontFamily: FONT, padding: "14px 16px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <a href="#" style={{ ...BTN, textDecoration: "none" }}>← Tabela</a>
        <h1 style={{ margin: 0, fontSize: 20, letterSpacing: 2, color: "#fff" }}>VALIDADOR</h1>
        <span style={{ fontSize: 12, color: "#777" }}>
          {res ? `${res.total} números · ${res.sessoes} sessões · ${res.estrategias.length} estratégias testadas` : "…"}
          {calculando && " · recalculando"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 14, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={PANEL}>
            <h2 style={H2}>Sessão atual · {dataBR(atual.date)} · {atual.nums.length} números</h2>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", minHeight: 30, marginBottom: 10 }}>
              {ultimos.length ? ultimos.map((n, i) => <Bola key={i} n={n} />) : <span style={{ fontSize: 12, color: "#666" }}>Clique no número que saiu.</span>}
            </div>
            <Mesa onPick={n => setAtual([...atual.nums, n])} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button style={BTN} disabled={!atual.nums.length} onClick={() => setAtual(atual.nums.slice(0, -1))}>Desfazer</button>
              <button style={BTN} disabled={!atual.nums.length} onClick={() => setSessoes([...sessoes, { date: hoje(), nums: [] }])}>Nova sessão</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input value={colar} onChange={e => setColar(e.target.value)} onKeyDown={e => e.key === "Enter" && adicionarColados()}
                placeholder="ou cole vários, como na tabela: 23 10 11" style={{ ...TEXTAREA, flex: 1 }} />
              <button style={BTN} onClick={adicionarColados}>Adicionar</button>
            </div>
          </div>
          <Historico sessoes={sessoes} setSessoes={setSessoes} />
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <Sinal res={res} calculando={calculando} />
          <Confluencia res={res} />
          <SinaisTabela res={res} />
          <Estrategias res={res} />
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>
            Uma estratégia só é aprovada se acertar acima do acaso com folga estatística (corrigida pelo número de estratégias testadas),
            der lucro no treino e repetir isso nos 25% mais recentes do histórico, que ela não usou para aprender.
          </div>
        </div>

        <Colunas res={res} />
      </div>
    </div>
  );
}

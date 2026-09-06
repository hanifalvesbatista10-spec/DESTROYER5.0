export default function last3ClickFilterPatch() {
  return {
    name: 'destroyer-last3-click-filter-patch',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;

      let src = code;

      const marker = `                const Cell = ({ckey, isLast}) => {
                  const scheme = CELL_SCHEME(e,ckey);
                  const pulse = pulseLastIdx[ckey] === realIndex;
                  const isSep = ckey === firstAlwaysKeyRow;
                  const isDuziaAlert = isLastRow && duziaAlert === ckey && CELL_VAL(e,ckey) === "";
                  const isColunaAlert = isLastRow && colunaAlert === ckey && CELL_VAL(e,ckey) === "";
                  return (
                    <td className={isDuziaAlert || isColunaAlert ? "pulse-duzia" : pulse ? "pulse-cell" : ""}
                      style={{background: isDuziaAlert || isColunaAlert ? "#001a1f" : scheme.bg, color:scheme.text,padding:"1px 2px",textAlign:"center",
                      fontSize:11,fontWeight:"700",fontFamily:"Arial, sans-serif",letterSpacing:"0em",whiteSpace:"nowrap",
                      borderTop: isDuziaAlert || isColunaAlert ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : bTop,
                      borderBottom: isDuziaAlert || isColunaAlert ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : bBot,
                      borderLeft: isSep ? "3px solid #FFD700" : "none",
                      borderRight: (isLast&&isGold) ? \`2px solid \${GOLD}\` : (isLast&&isWhite) ? "2px solid #ffffff" : (isDuziaAlert||isColunaAlert) ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : isPrioritySepRow(ckey) ? "3px solid #aaaaaa" : "1px solid #000"}}>
                      {CELL_VAL(e,ckey)}
                    </td>
                  );
                };`;

      const replacement = `                const Cell = ({ckey, isLast}) => {
                  const scheme = CELL_SCHEME(e,ckey);
                  const pulse = pulseLastIdx[ckey] === realIndex;
                  const isSep = ckey === firstAlwaysKeyRow;
                  const isDuziaAlert = isLastRow && duziaAlert === ckey && CELL_VAL(e,ckey) === "";
                  const isColunaAlert = isLastRow && colunaAlert === ckey && CELL_VAL(e,ckey) === "";

                  // Últimos 3 números: clicar numa característica alimenta diretamente
                  // o MESMO filterSel usado pelos botões manuais. Assim, preservamos
                  // exatamente a regra aditiva/exclusiva de selectProbabilityFilter.
                  const isLast3Clickable = posFromLast >= 1 && posFromLast <= 3;
                  const clickTarget = (() => {
                    if (!isLast3Clickable) return null;
                    if (ckey === "grupoDezena") return {key:"grupoDezena", val:e.grupoDezena || getGrupoDezena(e.num)};
                    if (ckey === "parte") return {key:"parte", val:e.parte || getParte(e.num)};
                    if (ckey === "col_c1" && e.coluna === "C1") return {key:"coluna", val:"C1"};
                    if (ckey === "col_c2" && e.coluna === "C2") return {key:"coluna", val:"C2"};
                    if (ckey === "col_c3" && e.coluna === "C3") return {key:"coluna", val:"C3"};
                    if (ckey === "lado") return {key:"lado", val:e.lado || getLado(e.num)};
                    if (ckey === "opo") return {key:"opo", val:e.opo || getOpo(e.num)};
                    if (ckey === "gp_d1" && e.duzia === "D1") return {key:"duzia", val:"D1"};
                    if (ckey === "gp_d2" && e.duzia === "D2") return {key:"duzia", val:"D2"};
                    if (ckey === "gp_d3" && e.duzia === "D3") return {key:"duzia", val:"D3"};
                    if (ckey === "cor") return {key:"cor", val:e.cor || getColor(e.num)};
                    if (ckey === "altobaixo") return {key:"altobaixo", val:e.altobaixo || getAltoBaixo(e.num)};
                    if (ckey === "paridade") return {key:"paridade", val:e.paridade || getParidade(e.num)};
                    if (ckey === "regiao") return {key:"regiao", val:e.regiao || getRegiao(e.num)};
                    if (ckey === "cavalo") return {key:"cavalo", val:e.cavalo || getCavalo(e.num)};
                    if (ckey === "regtrack") return {key:"regtrack", val:e.regtrack || getRegTrack(e.num)};
                    if (ckey === "setor") return {key:"setor", val:e.setor || getSetor(e.num)};
                    if (ckey === "rua") return {key:"rua", val:e.rua || getRua(e.num)};
                    if (ckey === "ruaPar") return {key:"ruaPar", val:getRuaParidade(e.num)};
                    return null;
                  })();

                  const clickSelected = clickTarget ? (() => {
                    const cur = filterSel[clickTarget.key];
                    return Array.isArray(cur) ? cur.includes(clickTarget.val) : cur === clickTarget.val;
                  })() : false;

                  return (
                    <td className={isDuziaAlert || isColunaAlert ? "pulse-duzia" : pulse ? "pulse-cell" : ""}
                      onClick={clickTarget ? ()=>selectProbabilityFilter(clickTarget.key, clickTarget.val) : undefined}
                      title={clickTarget ? (clickSelected ? "Clique para remover esta característica do filtro" : "Clique para adicionar esta característica ao filtro") : undefined}
                      style={{background: isDuziaAlert || isColunaAlert ? "#001a1f" : scheme.bg, color:scheme.text,padding:"1px 2px",textAlign:"center",
                      fontSize:11,fontWeight:"700",fontFamily:"Arial, sans-serif",letterSpacing:"0em",whiteSpace:"nowrap",
                      cursor:clickTarget?"pointer":"default",userSelect:clickTarget?"none":undefined,
                      boxShadow:clickSelected?"inset 0 0 0 2px #22c55e, inset 0 0 7px #22c55e66":undefined,
                      borderTop: clickSelected ? "2px solid #22c55e" : isDuziaAlert || isColunaAlert ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : bTop,
                      borderBottom: clickSelected ? "2px solid #22c55e" : isDuziaAlert || isColunaAlert ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : bBot,
                      borderLeft: clickSelected ? "2px solid #22c55e" : isSep ? "3px solid #FFD700" : "none",
                      borderRight: clickSelected ? "2px solid #22c55e" : (isLast&&isGold) ? \`2px solid \${GOLD}\` : (isLast&&isWhite) ? "2px solid #ffffff" : (isDuziaAlert||isColunaAlert) ? "2px solid #00e5ff" : pulse ? "2px solid #FFD700" : isPrioritySepRow(ckey) ? "3px solid #aaaaaa" : "1px solid #000"}}>
                      {CELL_VAL(e,ckey)}
                    </td>
                  );
                };`;

      if (src.includes(marker)) {
        src = src.replace(marker, replacement);
      }

      return { code: src, map: null };
    },
  };
}

// Os patches procuram trechos com "\n". No Windows o git pode trazer o App.jsx
// com "\r\n" (core.autocrlf), e aí alguns patches não aplicam e o app quebra.
// Este plugin roda antes de todos e deixa as quebras de linha como "\n".
export default function lineEndingsPatch() {
  return {
    name: 'destroyer-line-endings',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.endsWith('/src/App.jsx')) return null;
      if (!code.includes('\r\n')) return null;
      return { code: code.replace(/\r\n/g, '\n'), map: null };
    },
  };
}

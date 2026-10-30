import { useEffect, useState } from 'react'
import App from './App.jsx'
import Validador from './Validador.jsx'

// Troca entre a tabela do DESTROYER e o Validador pelo endereço (#validador).
// As duas telas ficam montadas e só uma aparece, para nada se perder na troca;
// os números da sessão atual são os mesmos nas duas (src/sessaoCompartilhada.js).
export default function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const noValidador = hash === '#validador'
  return (
    <>
      <div style={{ display: noValidador ? 'none' : 'block' }}>
        <App />
        <a href="#validador" style={{ position: 'fixed', bottom: 8, right: 8, zIndex: 1000, background: '#CC0000', color: '#fff',
          fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: 11, letterSpacing: 1, padding: '6px 10px',
          borderRadius: 4, textDecoration: 'none' }}>VALIDADOR</a>
      </div>
      <div style={{ display: noValidador ? 'block' : 'none' }}>
        <Validador />
      </div>
    </>
  )
}

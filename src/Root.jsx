import { useEffect, useState } from 'react'
import App from './App.jsx'
import Validador from './Validador.jsx'

// Troca entre a tabela do DESTROYER e o Validador pelo endereço (#validador).
export default function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  if (hash === '#validador') return <Validador />
  return (
    <>
      <App />
      <a href="#validador" style={{ position: 'fixed', bottom: 8, right: 8, zIndex: 1000, background: '#CC0000', color: '#fff',
        fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: 11, letterSpacing: 1, padding: '6px 10px',
        borderRadius: 4, textDecoration: 'none' }}>VALIDADOR</a>
    </>
  )
}

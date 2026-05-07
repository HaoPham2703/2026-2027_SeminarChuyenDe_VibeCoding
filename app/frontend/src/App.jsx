import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking backend...')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setApiStatus(`Connected: ${data.service} (${data.status})`)
      } catch (error) {
        setApiStatus(`Cannot connect backend: ${error.message}`)
      }
    }

    fetchHealth()
  }, [])

  return (
    <main style={{ padding: '32px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Flash Card App</h1>
      <p>Frontend - Backend connection status:</p>
      <strong>{apiStatus}</strong>
    </main>
  )
}

export default App

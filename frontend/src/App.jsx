import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error))
  }, [])

  return (
    <>
      <h1>Test App</h1>
      <div className="card">
        {data ? (
          <div>
            <p>Backend Message: </p>
            <h3>{data.message}</h3>
            <p>Status: {data.status}</p>
          </div>
        ) : (
          <p>Loading data from backend...</p>
        )}
      </div>
    </>
  )
}

export default App

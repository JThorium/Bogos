import React from 'react'
import ReactDOM from 'react-dom/client'

// Simple test component to see if React renders at all
function TestApp() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: 'black', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '24px' 
    }}>
      AstroAnnihilator Test - React is Working!
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<TestApp />)

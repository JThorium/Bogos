import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GameProvider } from './game/GameProvider.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

// Add some global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Starting React app...');

// Add a loading indicator
const root = document.getElementById('root');
root.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: black; color: white; font-family: Arial;">Loading AstroAnnihilator...</div>';

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GameProvider>
        <App />
      </GameProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
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

// Test if we can even import React
console.log('Script starting...');

try {
  console.log('Creating React root...');
  const root = document.getElementById('root');
  const reactRoot = ReactDOM.createRoot(root);
  
  console.log('Rendering React app...');
  reactRoot.render(
    <React.StrictMode>
      <ErrorBoundary>
        <GameProvider>
          <App />
        </GameProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to mount React app:', error);
  const root = document.getElementById('root');
  root.innerHTML = `
    <div style="padding: 20px; background: red; color: white; font-family: Arial;">
      <h1>React Mount Error</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <pre style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; white-space: pre-wrap;">${error.stack}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: white; color: black; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}

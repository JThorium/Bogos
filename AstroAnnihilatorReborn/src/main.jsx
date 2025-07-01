import React from 'react'
import ReactDOM from 'react-dom/client'

// Add some global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Starting React app...');

// Simple test component first
function TestApp() {
  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'black',
      color: 'white',
      fontFamily: 'Arial',
      fontSize: '24px'
    }
  }, 'React is working! Loading game...');
}

// Add a loading indicator
const root = document.getElementById('root');
root.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: black; color: white; font-family: Arial;">Loading AstroAnnihilator...</div>';

try {
  console.log('Creating React root...');
  const reactRoot = ReactDOM.createRoot(root);
  console.log('React root created, rendering test app...');
  
  reactRoot.render(React.createElement(TestApp));
  
  console.log('React render called successfully');
  
  // If the test app works, load the real app after a delay
  setTimeout(async () => {
    try {
      console.log('Loading main app components...');
      
      const [
        { default: App },
        { GameProvider },
        { default: ErrorBoundary }
      ] = await Promise.all([
        import('./App.jsx'),
        import('./game/GameProvider.jsx'),
        import('./ErrorBoundary.jsx')
      ]);
      
      console.log('Components loaded, rendering main app...');
      
      reactRoot.render(
        React.createElement(React.StrictMode, null,
          React.createElement(ErrorBoundary, null,
            React.createElement(GameProvider, null,
              React.createElement(App)
            )
          )
        )
      );
      
      console.log('Main app rendered successfully');
    } catch (loadError) {
      console.error('Failed to load main app:', loadError);
      reactRoot.render(
        React.createElement('div', {
          style: {
            padding: '20px',
            background: 'red',
            color: 'white',
            fontFamily: 'Arial'
          }
        }, 
        React.createElement('h1', null, 'Component Load Error'),
        React.createElement('pre', {
          style: {
            background: 'rgba(0,0,0,0.5)',
            padding: '10px',
            borderRadius: '4px'
          }
        }, loadError.message + '\n' + loadError.stack)
        )
      );
    }
  }, 1000);
  
} catch (error) {
  console.error('Failed to mount React app:', error);
  root.innerHTML = `
    <div style="padding: 20px; background: red; color: white; font-family: Arial;">
      <h1>React Mount Error</h1>
      <pre style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px;">
        ${error.message}
        ${error.stack}
      </pre>
    </div>
  `;
}

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

// Test if we can even import React
console.log('Script starting...');

try {
  console.log('Attempting to import React...');
  
  // Test basic imports first
  import('./react-test.js').then(() => {
    console.log('React test module loaded successfully');
  }).catch(error => {
    console.error('Failed to load React test module:', error);
    
    // Fallback - try direct React test
    testReactDirectly();
  });

} catch (error) {
  console.error('Error in main script:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; background: red; color: white; font-family: Arial;">
      <h1>Script Error</h1>
      <pre>${error.message}\n${error.stack}</pre>
    </div>
  `;
}

function testReactDirectly() {
  console.log('Testing React directly...');
  
  try {
    // Test if React is available
    if (typeof window.React === 'undefined') {
      console.log('React not in window, trying dynamic import...');
      
      import('react').then(React => {
        console.log('React imported:', React);
        
        import('react-dom/client').then(ReactDOM => {
          console.log('ReactDOM imported:', ReactDOM);
          
          // Now try to create a simple component
          const root = document.getElementById('root');
          const reactRoot = ReactDOM.createRoot(root);
          
          const element = React.createElement('div', {
            style: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              background: 'green',
              color: 'white',
              fontFamily: 'Arial',
              fontSize: '24px'
            }
          }, '🎉 React is working! Game loading next...');
          
          reactRoot.render(element);
          console.log('React mounted successfully!');
          
          // Now load the actual game
          setTimeout(() => loadActualGame(React, ReactDOM), 2000);
          
        }).catch(err => {
          console.error('ReactDOM import failed:', err);
          showError('ReactDOM import failed', err);
        });
        
      }).catch(err => {
        console.error('React import failed:', err);
        showError('React import failed', err);
      });
      
    } else {
      console.log('React found in window');
    }
    
  } catch (error) {
    console.error('Direct React test failed:', error);
    showError('Direct React test failed', error);
  }
}

function loadActualGame(React, ReactDOM) {
  console.log('Loading actual game components...');
  
  Promise.all([
    import('./App.jsx'),
    import('./game/GameProvider.jsx'),
    import('./ErrorBoundary.jsx')
  ]).then(([
    { default: App },
    { GameProvider },
    { default: ErrorBoundary }
  ]) => {
    console.log('Game components loaded, rendering...');
    
    const root = document.getElementById('root');
    const reactRoot = ReactDOM.createRoot(root);
    
    const gameElement = React.createElement(React.StrictMode, null,
      React.createElement(ErrorBoundary, null,
        React.createElement(GameProvider, null,
          React.createElement(App)
        )
      )
    );
    
    reactRoot.render(gameElement);
    console.log('Game rendered successfully!');
    
  }).catch(error => {
    console.error('Failed to load game components:', error);
    showError('Game component loading failed', error);
  });
}

function showError(title, error) {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div style="padding: 20px; background: red; color: white; font-family: Arial;">
      <h1>${title}</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <pre style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; white-space: pre-wrap;">${error.stack}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: white; color: black; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}

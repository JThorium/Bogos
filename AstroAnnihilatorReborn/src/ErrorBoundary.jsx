import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
<<<<<<< HEAD
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Optionally log error to an external service here
=======
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
  }

  render() {
    if (this.state.hasError) {
      return (
<<<<<<< HEAD
        <div style={{ padding: 32, color: 'white', background: '#1a1a1a', minHeight: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ color: '#f87171', whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
          {this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', color: '#fbbf24' }}>
              {this.state.errorInfo.componentStack}
            </details>
          )}
          <button style={{ marginTop: 24, padding: '8px 16px', background: '#f59e0b', color: '#222', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: 16 }} onClick={() => window.location.reload()}>
=======
        <div style={{
          padding: '20px',
          backgroundColor: '#ff4444',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '14px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto',
          zIndex: 9999
        }}>
          <h1>Something went wrong!</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
            <p><strong>Stack:</strong></p>
            <pre>{this.state.error && this.state.error.stack}</pre>
            <p><strong>Component Stack:</strong></p>
            <pre>{this.state.errorInfo.componentStack}</pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
            Reload Page
          </button>
        </div>
      );
    }
<<<<<<< HEAD
=======

>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
    return this.props.children;
  }
}

<<<<<<< HEAD
export default ErrorBoundary; 
=======
export default ErrorBoundary;
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e

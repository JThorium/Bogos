import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Optionally log error to an external service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: 'white', background: '#1a1a1a', minHeight: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ color: '#f87171', whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
          {this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', color: '#fbbf24' }}>
              {this.state.errorInfo.componentStack}
            </details>
          )}
          <button style={{ marginTop: 24, padding: '8px 16px', background: '#f59e0b', color: '#222', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: 16 }} onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 
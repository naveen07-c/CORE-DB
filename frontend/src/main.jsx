import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '800px', margin: '50px auto', textAlign: 'center' }}>
          <h1 style={{ color: '#dc2626' }}>Something went wrong</h1>
          <pre style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', overflow: 'auto', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Show a loading indicator immediately
const rootEl = document.getElementById('root');
if (rootEl) {
  rootEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;background:#fafafa">
      <div style="text-align:center">
        <div style="width:40px;height:40px;border:3px solid #e5e7eb;border-top-color:#2563eb;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px"></div>
        <p style="color:#6b7280">Loading E-Shop...</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  `;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
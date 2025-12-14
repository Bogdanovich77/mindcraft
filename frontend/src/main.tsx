import { enableMapSet } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

// Enable Immer MapSet plugin to handle Map and Set objects in Redux state
enableMapSet();

// Ensure React is properly initialized
if (!React) {
  throw new Error('React failed to initialize. Check for multiple React instances.');
}

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Please ensure <div id="root"></div> exists in your HTML.');
}

// Check if root already exists to prevent multiple roots during HMR
// Clean up any existing roots to prevent conflicts
if ((rootElement as any)._reactRootContainer) {
  console.log('Cleaning up existing React root...');
  (rootElement as any)._reactRootContainer = null;
}

// Create new root with proper error handling
let root: ReactDOM.Root;
try {
  root = ReactDOM.createRoot(rootElement);
  // Store reference to prevent multiple roots
  (rootElement as any)._reactRootContainer = root;
} catch (error) {
  console.error('Failed to create React root:', error);
  throw new Error(`React root creation failed: ${error}`);
}

// Render with comprehensive error handling and initialization checks
const renderApp = () => {
  try {
    if (!root) {
      throw new Error('React root is not available');
    }
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Application Error:', error, errorInfo);
            // You can send error reports here
          }}
          onRetry={() => {
            // Clear any cached state and retry
            window.location.reload();
          }}
        >
          <Provider store={store}>
            <App />
          </Provider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render application:', error);
    // Fallback rendering without StrictMode if needed
    try {
      root.render(
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Fallback Application Error:', error, errorInfo);
          }}
          onRetry={() => {
            window.location.reload();
          }}
        >
          <Provider store={store}>
            <App />
          </Provider>
        </ErrorBoundary>
      );
    } catch (fallbackError) {
      console.error('Critical: Fallback rendering also failed:', fallbackError);
      // Last resort - show error message
      rootElement.innerHTML = `
        <div style="padding: 20px; color: red; font-family: monospace;">
          <h1>Application Failed to Load</h1>
          <p>React initialization failed. Please refresh the page.</p>
          <pre>${fallbackError}</pre>
        </div>
      `;
    }
  }
};

// Initial render
renderApp();

// Handle hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}

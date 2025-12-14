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

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Please ensure <div id="root"></div> exists in your HTML.');
}

// Check if root already exists to prevent multiple roots during HMR
let root = (rootElement as any)._reactRootContainer?._internalRoot?.containerInfo
  ? (rootElement as any)._reactRootContainer
  : ReactDOM.createRoot(rootElement);

// Store reference to prevent multiple roots
(rootElement as any)._reactRootContainer = root;

// Render with comprehensive error handling
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

// Handle hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}

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

const root = ReactDOM.createRoot(rootElement);

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

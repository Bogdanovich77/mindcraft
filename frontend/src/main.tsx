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

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore, type TypedUseSelectorHook } from 'react-redux';
import type { RootState } from './types';

// Import slices
import agentsReducer from './slices/agentsSlice';
import uiReducer from './slices/uiSlice';
import connectionReducer from './slices/connectionSlice';

export const store = configureStore({
  reducer: {
    agents: agentsReducer,
    ui: uiReducer,
    connection: connectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<RootState>();

export default store;
/**
 * Redux Store Configuration
 * 
 * Central store configuration combining all slices for the Mindcraft
 * cognitive dashboard.
 */

import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';

// Import all slices
import agentsReducer from './slices/agentsSlice';
import connectionReducer from './slices/connectionSlice';
import uiReducer from './slices/uiSlice';
import memoryReducer from './slices/memorySlice';
import skillsReducer from './slices/skillsSlice';
import goalsReducer from './slices/goalsSlice';
import socialReducer from './slices/socialSlice';
import performanceReducer from './slices/performanceSlice';
import environmentReducer from './slices/environmentSlice';

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Configure and create store
export const store = configureStore({
  reducer: combineReducers({
    agents: agentsReducer,
    connection: connectionReducer,
    ui: uiReducer,
    memory: memoryReducer,
    skills: skillsReducer,
    goals: goalsReducer,
    social: socialReducer,
    performance: performanceReducer,
    environment: environmentReducer
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<RootState>();

export default store;
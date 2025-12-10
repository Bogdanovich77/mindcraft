import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DashboardState } from '../../types/agent';

const initialState: DashboardState = {
  selectedAgent: null,
  agents: new Map(),
  connectionStatus: 'disconnected',
  systemStatus: 'offline',
  loading: false,
  error: null,
  activeTab: 'overview',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setGlobalError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    clearGlobalError: (state) => {
      state.error = null;
    },
    
    setSystemStatus: (state, action: PayloadAction<'online' | 'offline' | 'maintenance'>) => {
      state.systemStatus = action.payload;
    },
    
    updateDashboardData: (state, action: PayloadAction<Partial<DashboardState>>) => {
      Object.assign(state, action.payload);
    },
    
    resetDashboard: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setActiveTab,
  setGlobalLoading,
  setGlobalError,
  clearGlobalError,
  setSystemStatus,
  updateDashboardData,
  resetDashboard,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectActiveTab = (state: { ui: DashboardState }) => state.ui.activeTab;
export const selectGlobalLoading = (state: { ui: DashboardState }) => state.ui.loading;
export const selectGlobalError = (state: { ui: DashboardState }) => state.ui.error;
export const selectSystemStatus = (state: { ui: DashboardState }) => state.ui.systemStatus;
export const selectSelectedAgentId = (state: { ui: DashboardState }) => state.ui.selectedAgent;
export const selectDashboardAgents = (state: { ui: DashboardState }) => state.ui.agents;
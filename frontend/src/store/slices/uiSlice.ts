import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  selectedAgent: string | null;
  agents: Record<string, any>;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  systemStatus: 'online' | 'offline' | 'maintenance';
  loading: boolean;
  error: string | null;
  activeTab: string;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  read: boolean;
}

const initialState: UIState = {
  selectedAgent: null,
  agents: {},
  connectionStatus: 'disconnected',
  systemStatus: 'offline',
  loading: false,
  error: null,
  activeTab: 'overview',
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
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
    
    updateDashboardData: (state, action: PayloadAction<Partial<UIState>>) => {
      Object.assign(state, action.payload);
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.push(notification);
    },
    
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
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
  setSidebarOpen,
  setTheme,
  addNotification,
  markNotificationRead,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectActiveTab = (state: { ui: UIState }) => state.ui.activeTab;
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectGlobalError = (state: { ui: UIState }) => state.ui.error;
export const selectSystemStatus = (state: { ui: UIState }) => state.ui.systemStatus;
export const selectSelectedAgentId = (state: { ui: UIState }) => state.ui.selectedAgent;
export const selectDashboardAgents = (state: { ui: UIState }) => state.ui.agents;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectUnreadNotifications = (state: { ui: UIState }) =>
  state.ui.notifications.filter(n => !n.read);
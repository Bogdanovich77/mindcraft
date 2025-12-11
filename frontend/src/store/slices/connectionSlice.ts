import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getSocketService, type SocketServiceStatus, type ConnectionMetrics } from '../../services/socketService';

export interface ConnectionState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  error: string | null;
  lastConnected: number | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  metrics: ConnectionMetrics;
  connectionAttempts: number;
  isReconnecting: boolean;
  latency: number;
  lastPingTime: number | null;
}

const initialState: ConnectionState = {
  status: 'disconnected',
  error: null,
  lastConnected: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000, // Start with 1 second
  metrics: {
    connectedAt: null,
    lastDisconnected: null,
    totalReconnectAttempts: 0,
    connectionUptime: 0,
    averageLatency: 0,
    lastPingTime: null,
  },
  connectionAttempts: 0,
  isReconnecting: false,
  latency: 0,
  lastPingTime: null,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<'connected' | 'disconnected' | 'connecting' | 'error'>) => {
      state.status = action.payload;
      state.error = null;
      
      if (action.payload === 'connected') {
        state.lastConnected = Date.now();
        state.reconnectAttempts = 0;
        state.reconnectDelay = 1000;
        state.isReconnecting = false;
      }
    },
    
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.reconnectAttempts += 1;
      state.isReconnecting = true;
      
      // Exponential backoff for reconnection delay
      state.reconnectDelay = Math.min(
        state.reconnectDelay * 2,
        30000 // Max 30 seconds
      );
    },
    
    clearConnectionError: (state) => {
      state.error = null;
    },
    
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },
    
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
      state.reconnectDelay = 1000;
      state.isReconnecting = false;
    },
    
    setReconnectDelay: (state, action: PayloadAction<number>) => {
      state.reconnectDelay = action.payload;
    },
    
    disconnect: (state) => {
      state.status = 'disconnected';
      state.lastConnected = null;
      state.error = null;
      state.isReconnecting = false;
    },
    
    startConnecting: (state) => {
      state.status = 'connecting';
      state.error = null;
    },
    
    connectionLost: (state) => {
      state.status = 'disconnected';
      state.error = 'Connection lost';
      state.isReconnecting = true;
    },
    
    resetConnectionState: (state) => {
      Object.assign(state, initialState);
    },
    
    updateMetrics: (state, action: PayloadAction<ConnectionMetrics>) => {
      state.metrics = action.payload;
      state.latency = action.payload.averageLatency;
      state.lastPingTime = action.payload.lastPingTime;
    },
    
    updateConnectionAttempts: (state, action: PayloadAction<number>) => {
      state.connectionAttempts = action.payload;
    },
    
    setReconnecting: (state, action: PayloadAction<boolean>) => {
      state.isReconnecting = action.payload;
    },
  },
});

export const {
  setConnectionStatus,
  setConnectionError,
  clearConnectionError,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  setReconnectDelay,
  disconnect,
  startConnecting,
  connectionLost,
  resetConnectionState,
  updateMetrics,
  updateConnectionAttempts,
  setReconnecting,
} = connectionSlice.actions;

export default connectionSlice.reducer;

// Selectors
export const selectConnectionStatus = (state: { connection: ConnectionState }) => state.connection.status;
export const selectConnectionError = (state: { connection: ConnectionState }) => state.connection.error;
export const selectLastConnected = (state: { connection: ConnectionState }) => state.connection.lastConnected;
export const selectReconnectAttempts = (state: { connection: ConnectionState }) => state.connection.reconnectAttempts;
export const selectReconnectDelay = (state: { connection: ConnectionState }) => state.connection.reconnectDelay;
export const selectIsConnected = (state: { connection: ConnectionState }) => state.connection.status === 'connected';
export const selectIsConnecting = (state: { connection: ConnectionState }) => state.connection.status === 'connecting';
export const selectHasConnectionError = (state: { connection: ConnectionState }) => state.connection.status === 'error';
export const selectConnectionMetrics = (state: { connection: ConnectionState }) => state.connection.metrics;
export const selectConnectionAttempts = (state: { connection: ConnectionState }) => state.connection.connectionAttempts;
export const selectIsReconnecting = (state: { connection: ConnectionState }) => state.connection.isReconnecting;
export const selectLatency = (state: { connection: ConnectionState }) => state.connection.latency;
export const selectLastPingTime = (state: { connection: ConnectionState }) => state.connection.lastPingTime;

// Thunks for async connection logic
export const connectToServer = () => async (dispatch: any, getState: any) => {
  const state = getState();
  
  // Don't connect if already connected or connecting
  if (selectIsConnected(state) || selectIsConnecting(state)) {
    return;
  }
  
  dispatch(startConnecting());
  
  try {
    // Initialize socket connection
    const socketService = getSocketService();
    if (!socketService) {
      throw new Error('Socket service not available');
    }
    
    // Set up status change listener
    socketService.onStatusChange((status: SocketServiceStatus) => {
      dispatch(updateConnectionAttempts(status.connectionAttempts));
      dispatch(updateMetrics(status.metrics));
      
      if (status.isConnected) {
        dispatch(setConnectionStatus('connected'));
        dispatch(clearConnectionError());
        dispatch(setReconnecting(false));
      } else if (status.isConnecting) {
        dispatch(setConnectionStatus('connecting'));
        // Only set reconnecting to true if this is actually a reconnection attempt
        // (connectionAttempts > 1 means we've been connected before)
        if (status.connectionAttempts > 1) {
          dispatch(setReconnecting(true));
        } else {
          dispatch(setReconnecting(false));
        }
      } else {
        dispatch(setConnectionError(status.lastError || 'Connection failed'));
        dispatch(setReconnecting(false));
      }
    });
    
    await socketService.connect();
    dispatch(setConnectionStatus('connected'));
  } catch (error) {
    dispatch(setConnectionError(error instanceof Error ? error.message : 'Unknown connection error'));
  }
};

export const disconnectFromServer = () => async (dispatch: any) => {
  dispatch(disconnect());
  // Close socket connection
  const socketService = getSocketService();
  if (socketService) {
    socketService.offStatusChange(() => {}); // Remove all status listeners
    socketService.disconnect();
  }
};

export const reconnectToServer = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const attempts = selectReconnectAttempts(state);
  
  if (attempts >= state.connection.maxReconnectAttempts) {
    dispatch(setConnectionError('Maximum reconnection attempts reached'));
    return;
  }
  
  dispatch(incrementReconnectAttempts());
  dispatch(setReconnecting(true));
  
  try {
    // Force reconnect with socket service
    const socketService = getSocketService();
    if (!socketService) {
      throw new Error('Socket service not available');
    }
    await socketService.forceReconnect();
    dispatch(setConnectionStatus('connected'));
    dispatch(setReconnecting(false));
  } catch (error) {
    dispatch(setConnectionError(error instanceof Error ? error.message : 'Reconnection failed'));
    dispatch(setReconnecting(false));
  }
};

export const forceReconnect = () => async (dispatch: any) => {
  dispatch(startConnecting());
  dispatch(setReconnecting(true));
  
  try {
    const socketService = getSocketService();
    if (!socketService) {
      throw new Error('Socket service not available');
    }
    await socketService.forceReconnect();
    dispatch(setConnectionStatus('connected'));
    dispatch(setReconnecting(false));
  } catch (error) {
    dispatch(setConnectionError(error instanceof Error ? error.message : 'Force reconnection failed'));
    dispatch(setReconnecting(false));
  }
};
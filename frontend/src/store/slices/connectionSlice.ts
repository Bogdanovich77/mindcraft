import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ConnectionState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  error: string | null;
  lastConnected: number | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
}

const initialState: ConnectionState = {
  status: 'disconnected',
  error: null,
  lastConnected: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000, // Start with 1 second
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
      }
    },
    
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.reconnectAttempts += 1;
      
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
    },
    
    setReconnectDelay: (state, action: PayloadAction<number>) => {
      state.reconnectDelay = action.payload;
    },
    
    disconnect: (state) => {
      state.status = 'disconnected';
      state.lastConnected = null;
      state.error = null;
    },
    
    startConnecting: (state) => {
      state.status = 'connecting';
      state.error = null;
    },
    
    connectionLost: (state) => {
      state.status = 'disconnected';
      state.error = 'Connection lost';
    },
    
    resetConnectionState: (state) => {
      Object.assign(state, initialState);
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

// Thunks for async connection logic
export const connectToServer = () => async (dispatch: any, getState: any) => {
  const state = getState();
  
  // Don't connect if already connected or connecting
  if (selectIsConnected(state) || selectIsConnecting(state)) {
    return;
  }
  
  dispatch(startConnecting());
  
  try {
    // This will be implemented in the socket service
    // const socket = await initializeSocket();
    // dispatch(setConnectionStatus('connected'));
  } catch (error) {
    dispatch(setConnectionError(error instanceof Error ? error.message : 'Unknown connection error'));
  }
};

export const disconnectFromServer = () => async (dispatch: any) => {
  dispatch(disconnect());
  // This will be implemented in the socket service
  // await closeSocket();
};

export const reconnectToServer = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const attempts = selectReconnectAttempts(state);
  
  if (attempts >= state.connection.maxReconnectAttempts) {
    dispatch(setConnectionError('Maximum reconnection attempts reached'));
    return;
  }
  
  dispatch(incrementReconnectAttempts());
  dispatch(startConnecting());
  
  // Wait before attempting reconnection
  await new Promise(resolve => setTimeout(resolve, selectReconnectDelay(state)));
  
  try {
    // This will be implemented in the socket service
    // const socket = await initializeSocket();
    // dispatch(setConnectionStatus('connected'));
  } catch (error) {
    dispatch(setConnectionError(error instanceof Error ? error.message : 'Reconnection failed'));
  }
};
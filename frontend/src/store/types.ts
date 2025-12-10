import type { DashboardState } from '../types/agent';

import type { AgentsState } from '../store/slices/agentsSlice';

export interface RootState {
  agents: AgentsState;
  ui: DashboardState;
  connection: {
    status: 'connected' | 'disconnected' | 'connecting' | 'error';
    error: string | null;
    lastConnected: number | null;
    reconnectAttempts: number;
  };
}
import { createSlice, createAsyncThunk, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { AgentState, AgentSummary, WorldContext, ConversationState } from '../../types/agent';
import type { 
  AgentStateUpdateEvent, 
  AgentConnectionEvent, 
  AgentDisconnectionEvent 
} from '../../types/socketEvents';

// Performance optimization: Memoized selectors to prevent unnecessary recalculations
const selectAgentsState = (state: { agents: AgentsState }) => state.agents;
const selectAgentsObject = createSelector(
  [selectAgentsState],
  (agentsState) => agentsState.agents
);

// Socket.IO initialization thunk
export const initializeAgentsSocket = createAsyncThunk(
  'agents/initializeAgentsSocket',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Import socketService dynamically to avoid circular dependencies
      const { getSocketService } = await import('../../services/socketService');
      const socketService = getSocketService();
      
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Set up listener for the agentList event
      socketService.on('agentList', (data: any) => {
        console.log('[AgentsSlice] Received agentList:', data);
        
        // Extract the agents array from either format
        let agentsArray = Array.isArray(data) ? data : data.agents || [];
        
        // Transform the backend agent format to frontend AgentSummary format
        const agentSummaries: AgentSummary[] = agentsArray.map((agent: any) => ({
          id: agent.name,
          name: agent.name,
          profile: 'default', // Use 'default' as a placeholder profile
          status: agent.in_game ? 'online' : 'offline',
          position: { x: 0, y: 64, z: 0 }, // Use default position
          health: 20, // Use default health
          level: 1, // Use default level
          lastUpdate: Date.now(),
        }));
        
        // Dispatch the setAgents action with the transformed data
        dispatch(setAgents(agentSummaries));
      });

      console.log('✅ Agents socket initialization completed');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize agents socket:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize agents socket');
    }
  }
);

export interface AgentsState {
  agents: Record<string, AgentState>;
  selectedAgent: string | null;
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  // Real-time streaming state
  streaming: {
    isConnected: boolean;
    lastStreamUpdate: number | null;
    streamErrors: number;
    reconnectAttempts: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
    latency: number;
  };
  // Performance metrics for streaming
  performance: {
    updateFrequency: number;
    droppedUpdates: number;
    totalUpdates: number;
    averageUpdateSize: number;
  };
}

// Default world context for new agents
const createDefaultWorldContext = (): WorldContext => ({
  position: { x: 0, y: 64, z: 0 },
  health: 20,
  food: 100,
  experience: 0,
  level: 1,
  dimension: 'overworld',
  timeOfDay: 0,
  weather: 'clear',
  nearbyEntities: [],
  nearbyBlocks: [],
  inventory: { items: [], slots: 36, usedSlots: 0 },
  equipment: {},
});

// Default conversation state for new agents
const createDefaultConversationState = (): ConversationState => ({
  message: '',
  sender: '',
  isRequestForHelp: false,
  isOfferOfAssistance: false,
  timestamp: Date.now(),
});

// Create simplified agent state
const createSimplifiedAgentState = (summary: AgentSummary): AgentState => ({
  id: summary.id,
  name: summary.name,
  profile: summary.profile,
  status: summary.status as 'online' | 'offline' | 'idle' | 'busy',
  lastUpdate: summary.lastUpdate,
  
  // Core 7 fields for simplified architecture
  worldContext: {
    ...createDefaultWorldContext(),
    position: summary.position,
    health: summary.health,
    level: summary.level || 1,
  },
  personality: 'balanced', // Default personality string
  goals: 'survival and exploration', // Default goals string
  mandate: '', // No initial mandate
  conversation: createDefaultConversationState(),
  lastAction: 'idle', // Default action
  response: '', // Empty initial response
});

const initialState: AgentsState = {
  agents: {},
  selectedAgent: null,
  loading: false,
  error: null,
  lastUpdate: null,
  streaming: {
    isConnected: false,
    lastStreamUpdate: null,
    streamErrors: 0,
    reconnectAttempts: 0,
    connectionQuality: 'good',
    latency: 0,
  },
  performance: {
    updateFrequency: 0,
    droppedUpdates: 0,
    totalUpdates: 0,
    averageUpdateSize: 0,
  },
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<AgentSummary[] | { agents: AgentSummary[]; timestamp: number }>) => {
      state.loading = false;
      state.error = null;
      state.lastUpdate = Date.now();
      
      // Handle both old format (direct array) and new format (object with agents property)
      let agentsArray = Array.isArray(action.payload) ? action.payload : action.payload.agents;
      
      // Handle backend format transformation
      if (agentsArray.length > 0 && 'name' in agentsArray[0] && !('id' in agentsArray[0])) {
        // Transform backend format {name, in_game, viewerPort, socket_connected} to AgentSummary
        agentsArray = agentsArray.map((agent: any) => ({
          id: agent.name, // Use name as ID since backend doesn't send ID
          name: agent.name,
          profile: 'default', // Backend doesn't send profile
          status: agent.in_game ? 'online' : 'offline', // Convert boolean to string
          position: { x: 0, y: 0, z: 0 }, // Default position
          health: 100, // Default health
          level: 1, // Default level
          lastUpdate: Date.now(),
        }));
      }
      
      // Convert array to object using simplified agent state
      const agentsObj: Record<string, AgentState> = {};
      agentsArray.forEach(summary => {
        agentsObj[summary.id] = createSimplifiedAgentState(summary);
      });
      
      state.agents = agentsObj;
    },
    
    updateAgent: (state, action: PayloadAction<{ agentId: string; updates: Partial<AgentState> }>) => {
      const { agentId, updates } = action.payload;
      const existingAgent = state.agents[agentId];
      
      if (existingAgent) {
        state.agents[agentId] = { ...existingAgent, ...updates };
        state.lastUpdate = Date.now();
      }
    },
    
    selectAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgent = action.payload;
    },
    
    clearSelectedAgent: (state) => {
      state.selectedAgent = null;
    },
    
    setAgentLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setAgentError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearAgentError: (state) => {
      state.error = null;
    },
    
    removeAgent: (state, action: PayloadAction<string>) => {
      delete state.agents[action.payload];
      if (state.selectedAgent === action.payload) {
        state.selectedAgent = null;
      }
    },
    
    // Simplified update methods for core fields
    updateAgentWorldContext: (state, action: PayloadAction<{ agentId: string; worldContext: Partial<WorldContext> }>) => {
      const { agentId, worldContext } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.worldContext = { ...agent.worldContext, ...worldContext };
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentPersonality: (state, action: PayloadAction<{ agentId: string; personality: string }>) => {
      const { agentId, personality } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.personality = personality;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentGoals: (state, action: PayloadAction<{ agentId: string; goals: string }>) => {
      const { agentId, goals } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.goals = goals;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentMandate: (state, action: PayloadAction<{ agentId: string; mandate: string }>) => {
      const { agentId, mandate } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.mandate = mandate;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentConversation: (state, action: PayloadAction<{ agentId: string; conversation: Partial<ConversationState> }>) => {
      const { agentId, conversation } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.conversation = { ...agent.conversation, ...conversation };
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentLastAction: (state, action: PayloadAction<{ agentId: string; lastAction: string }>) => {
      const { agentId, lastAction } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.lastAction = lastAction;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentResponse: (state, action: PayloadAction<{ agentId: string; response: string }>) => {
      const { agentId, response } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.response = response;
        agent.lastUpdate = Date.now();
      }
    },
    
    // Legacy methods for backward compatibility
    updateAgentStatus: (state, action: PayloadAction<{ agentId: string; status: string }>) => {
      const { agentId, status } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.status = status as any;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentPosition: (state, action: PayloadAction<{ agentId: string; position: { x: number; y: number; z: number } }>) => {
      const { agentId, position } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.worldContext.position = position;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentHealth: (state, action: PayloadAction<{ agentId: string; health: number }>) => {
      const { agentId, health } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.worldContext.health = health;
        agent.lastUpdate = Date.now();
      }
    },

    // Real-time streaming actions (simplified)
    agentStateUpdate: (state, action: PayloadAction<AgentStateUpdateEvent>) => {
      const { agentId, state: agentState, timestamp } = action.payload;
      const existingAgent = state.agents[agentId];
      
      if (existingAgent) {
        // Update only the 7 core fields
        if (agentState.worldContext) {
          existingAgent.worldContext = { 
            ...existingAgent.worldContext, 
            ...agentState.worldContext 
          };
        }
        if (agentState.personality !== undefined) {
          existingAgent.personality = agentState.personality;
        }
        if (agentState.goals !== undefined) {
          existingAgent.goals = agentState.goals;
        }
        if (agentState.mandate !== undefined) {
          existingAgent.mandate = agentState.mandate;
        }
        if (agentState.conversation) {
          existingAgent.conversation = { 
            ...existingAgent.conversation, 
            ...agentState.conversation 
          };
        }
        if (agentState.lastAction !== undefined) {
          existingAgent.lastAction = agentState.lastAction;
        }
        if (agentState.response !== undefined) {
          existingAgent.response = agentState.response;
        }
        
        existingAgent.lastUpdate = timestamp;
        state.streaming.lastStreamUpdate = timestamp;
        state.performance.totalUpdates++;
      } else {
        // Create new simplified agent
        const newAgent: AgentState = {
          id: agentId,
          name: agentState.name || `Agent_${agentId}`,
          profile: 'default',
          status: 'online',
          lastUpdate: timestamp,
          worldContext: agentState.worldContext 
            ? { ...createDefaultWorldContext(), ...agentState.worldContext }
            : createDefaultWorldContext(),
          personality: agentState.personality || 'balanced',
          goals: agentState.goals || 'survival and exploration',
          mandate: agentState.mandate || '',
          conversation: agentState.conversation 
            ? { ...createDefaultConversationState(), ...agentState.conversation }
            : createDefaultConversationState(),
          lastAction: agentState.lastAction || 'idle',
          response: agentState.response || '',
        };
        
        state.agents[agentId] = newAgent;
        state.streaming.lastStreamUpdate = timestamp;
        state.performance.totalUpdates++;
      }
    },

    agentConnected: (state, action: PayloadAction<AgentConnectionEvent>) => {
      const { agentId, timestamp, connectionType } = action.payload;
      const agent = state.agents[agentId];
      
      if (agent) {
        agent.status = 'online';
        agent.lastUpdate = timestamp;
      }
      
      state.streaming.isConnected = true;
      state.streaming.lastStreamUpdate = timestamp;
      state.streaming.reconnectAttempts = 0;
    },

    agentDisconnected: (state, action: PayloadAction<AgentDisconnectionEvent>) => {
      const { agentId, timestamp, reason } = action.payload;
      const agent = state.agents[agentId];
      
      if (agent) {
        agent.status = 'offline';
        agent.lastUpdate = timestamp;
      }
      
      state.streaming.isConnected = false;
      state.streaming.lastStreamUpdate = timestamp;
    },

    updateStreamingStatus: (state, action: PayloadAction<{
      isConnected: boolean;
      latency?: number;
      connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
    }>) => {
      const { isConnected, latency, connectionQuality } = action.payload;
      state.streaming.isConnected = isConnected;
      
      if (latency !== undefined) {
        state.streaming.latency = latency;
        
        // Update connection quality based on latency if not provided
        if (!connectionQuality) {
          if (latency < 50) state.streaming.connectionQuality = 'excellent';
          else if (latency < 100) state.streaming.connectionQuality = 'good';
          else if (latency < 200) state.streaming.connectionQuality = 'fair';
          else state.streaming.connectionQuality = 'poor';
        }
      }
      
      if (connectionQuality) {
        state.streaming.connectionQuality = connectionQuality;
      }
    },

    streamingError: (state, action: PayloadAction<{ error: string; timestamp: number }>) => {
      state.streaming.streamErrors++;
      state.error = action.payload.error;
      state.streaming.lastStreamUpdate = action.payload.timestamp;
    },

    incrementReconnectAttempts: (state) => {
      state.streaming.reconnectAttempts++;
    },

    resetStreamingMetrics: (state) => {
      state.streaming.streamErrors = 0;
      state.streaming.reconnectAttempts = 0;
      state.performance.updateFrequency = 0;
      state.performance.droppedUpdates = 0;
      state.performance.totalUpdates = 0;
      state.performance.averageUpdateSize = 0;
    },

    updatePerformanceMetrics: (state, action: PayloadAction<{
      updateFrequency?: number;
      droppedUpdates?: number;
      averageUpdateSize?: number;
    }>) => {
      const { updateFrequency, droppedUpdates, averageUpdateSize } = action.payload;
      
      if (updateFrequency !== undefined) {
        state.performance.updateFrequency = updateFrequency;
      }
      
      if (droppedUpdates !== undefined) {
        state.performance.droppedUpdates = droppedUpdates;
      }
      
      if (averageUpdateSize !== undefined) {
        state.performance.averageUpdateSize = averageUpdateSize;
      }
    },
  },
});

export const {
  setAgents,
  updateAgent,
  selectAgent,
  clearSelectedAgent,
  setAgentLoading,
  setAgentError,
  clearAgentError,
  removeAgent,
  updateAgentStatus,
  updateAgentPosition,
  updateAgentHealth,
  // New simplified update methods
  updateAgentWorldContext,
  updateAgentPersonality,
  updateAgentGoals,
  updateAgentMandate,
  updateAgentConversation,
  updateAgentLastAction,
  updateAgentResponse,
  // Real-time streaming actions
  agentStateUpdate,
  agentConnected,
  agentDisconnected,
  updateStreamingStatus,
  streamingError,
  incrementReconnectAttempts,
  resetStreamingMetrics,
  updatePerformanceMetrics,
} = agentsSlice.actions;

export default agentsSlice.reducer;

// Performance optimization: Memoized selectors to prevent unnecessary recalculations
export const selectAllAgents = createSelector(
  [selectAgentsObject],
  (agents) => agents
);

export const selectAgentById = createSelector(
  [selectAgentsObject, (state: { agents: AgentsState }, agentId: string) => agentId],
  (agents, agentId) => agents[agentId]
);

export const selectSelectedAgent = createSelector(
  [selectAgentsObject, (state: { agents: AgentsState }) => state.agents.selectedAgent],
  (agents, selectedId) => selectedId ? agents[selectedId] || null : null
);

export const selectAgentIds = createSelector(
  [selectAgentsObject],
  (agents) => Object.keys(agents)
);

export const selectOnlineAgents = createSelector(
  [selectAgentsObject],
  (agents) => Object.values(agents).filter(agent => agent.status === 'online')
);

export const selectAgentsLoading = createSelector(
  [selectAgentsState],
  (agentsState) => agentsState.loading
);

export const selectAgentsError = createSelector(
  [selectAgentsState],
  (agentsState) => agentsState.error
);

// Streaming selectors with memoization
export const selectStreamingStatus = createSelector(
  [selectAgentsState],
  (agentsState) => agentsState.streaming
);

export const selectStreamingPerformance = createSelector(
  [selectAgentsState],
  (agentsState) => agentsState.performance
);

export const selectIsStreamingConnected = createSelector(
  [selectStreamingStatus],
  (streaming) => streaming.isConnected
);

export const selectConnectionQuality = createSelector(
  [selectStreamingStatus],
  (streaming) => streaming.connectionQuality
);

export const selectStreamingLatency = createSelector(
  [selectStreamingStatus],
  (streaming) => streaming.latency
);

export const selectStreamingErrors = createSelector(
  [selectStreamingStatus],
  (streaming) => streaming.streamErrors
);

export const selectUpdateFrequency = createSelector(
  [selectStreamingPerformance],
  (performance) => performance.updateFrequency
);

// Thunk actions for streaming
export const handleAgentStateStream = (event: AgentStateUpdateEvent) => (dispatch: any) => {
  dispatch(agentStateUpdate(event));
};

export const handleAgentConnectionStream = (event: AgentConnectionEvent) => (dispatch: any) => {
  dispatch(agentConnected(event));
};

export const handleAgentDisconnectionStream = (event: AgentConnectionEvent) => (dispatch: any) => {
  dispatch(agentDisconnected(event));
};

export const updateConnectionStatus = (status: {
  isConnected: boolean;
  latency?: number;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}) => (dispatch: any) => {
  dispatch(updateStreamingStatus(status));
};

export const handleStreamingError = (error: string) => (dispatch: any) => {
  dispatch(streamingError({ error, timestamp: Date.now() }));
};
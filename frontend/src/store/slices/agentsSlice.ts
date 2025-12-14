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
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      // Import socketService dynamically to avoid circular dependencies
      const { getSocketService } = await import('../../services/socketService');
      const socketService = getSocketService();
      
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Set up listener for the agentList event
      socketService.on('agents-status', (data: any) => {
        console.log('[AgentsSlice] Received agents-status:', data);
        
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

      // Also add listener for the old event name for backward compatibility
      socketService.on('agentList', (data: any) => {
        console.log('[AgentsSlice] Received agentList (legacy):', data);
        
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

      // Improved debouncing and throttling for agentUpdate events to prevent UI storms
      let lastUpdateTime = 0;
      let pendingUpdateTimeout: ReturnType<typeof setTimeout> | null = null;
      let pendingUpdateData: any = null;
      
      const UPDATE_THROTTLE_MS = 500; // Reduced to 500ms for more responsive updates
      const DEBOUNCE_DELAY_MS = 200; // Debounce rapid updates
      
      const processPendingUpdate = () => {
        if (pendingUpdateData) {
          const now = Date.now();
          console.log('[AgentsSlice] Processing debounced agent update:', pendingUpdateData);
          
          // Transform object format to array format
          const agentsArray = Object.entries(pendingUpdateData).map(([name, agentData]: [string, any]) => ({
            id: name,
            name: name,
            profile: 'default',
            status: agentData.gameplay?.in_game ? 'online' : 'offline',
            position: agentData.position || { x: 0, y: 64, z: 0 },
            health: agentData.gameplay?.health || 20,
            level: 1,
            lastUpdate: now,
          }));
          
          dispatch(setAgents(agentsArray));
          pendingUpdateData = null;
          lastUpdateTime = now;
        }
        pendingUpdateTimeout = null;
      };
      
      // Add listener for agentUpdate events with improved debouncing
      socketService.on('agentUpdate', (data: any) => {
        const now = Date.now();
        
        // Throttle check - skip if we updated too recently
        if (now - lastUpdateTime < UPDATE_THROTTLE_MS) {
          console.log('[AgentsSlice] Throttling agent update, skipping:', data);
          return;
        }
        
        // Store the latest data
        pendingUpdateData = data;
        
        // Clear any existing timeout
        if (pendingUpdateTimeout) {
          clearTimeout(pendingUpdateTimeout);
        }
        
        // Set new timeout to process the update after debounce delay
        pendingUpdateTimeout = setTimeout(processPendingUpdate, DEBOUNCE_DELAY_MS);
      });

      // Request agent list after setting up listeners with improved retry mechanism
      console.log('[AgentsSlice] Requesting agent list after initialization...');
      
      // Immediate request after listeners are set up
      socketService.requestAgentList();
      
      // Improved retry mechanism with exponential backoff and better error handling
      let retryCount = 0;
      const maxRetries = 5; // Increased max retries but with longer delays
      const baseRetryDelay = 2000; // Start with 2 seconds
      let retryTimeout: ReturnType<typeof setTimeout> | null = null;
      
      const retryAgentListRequest = async () => {
        if (retryCount >= maxRetries) {
          console.warn(`[AgentsSlice] Max retries (${maxRetries}) reached for agent list request`);
          return;
        }
        
        retryCount++;
        const delay = baseRetryDelay * Math.pow(2, retryCount - 1); // Exponential backoff
        const maxDelay = 16000; // Cap at 16 seconds
        const actualDelay = Math.min(delay, maxDelay);
        
        console.log(`[AgentsSlice] Retry attempt ${retryCount}/${maxRetries} for agent list (delay: ${actualDelay}ms)...`);
        
        // Clear any existing timeout
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
        
        retryTimeout = setTimeout(async () => {
          try {
            // Check if we have agents before retrying
            const currentState = getState() as { agents: AgentsState };
            const currentAgents = Object.keys(currentState.agents.agents);
            
            if (currentAgents.length > 0) {
              console.log(`[AgentsSlice] Agents received successfully! Found ${currentAgents.length} agents.`);
              return;
            }
            
            // Request agent list again
            socketService.requestAgentList();
            
            // Wait a bit for the response before checking again
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if we received agents after this request
            const updatedState = getState() as { agents: AgentsState };
            const updatedAgents = Object.keys(updatedState.agents.agents);
            
            if (updatedAgents.length > 0) {
              console.log(`[AgentsSlice] Agents received after retry ${retryCount}! Found ${updatedAgents.length} agents.`);
            } else {
              console.log(`[AgentsSlice] No agents received after retry ${retryCount}, scheduling next retry...`);
              retryAgentListRequest();
            }
            
          } catch (error) {
            console.error(`[AgentsSlice] Error during retry ${retryCount}:`, error);
            retryAgentListRequest(); // Retry on error as well
          }
        }, actualDelay);
      };
      
      // Start retry mechanism after a longer initial delay to allow for proper connection establishment
      setTimeout(() => {
        const currentState = getState() as { agents: AgentsState };
        const currentAgents = Object.keys(currentState.agents.agents);
        
        if (currentAgents.length === 0) {
          console.log('[AgentsSlice] No agents after initial request, starting improved retry mechanism...');
          retryAgentListRequest();
        } else {
          console.log(`[AgentsSlice] Initial agents received! Found ${currentAgents.length} agents.`);
        }
      }, 3000); // Increased from 2000ms to 3000ms
      
      // Cleanup function to clear retry timeout if component unmounts
      return () => {
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
      };

      console.log('✅ Agents socket initialization completed');
      
      // Return cleanup function for the event listeners
      return () => {
        // Clear any pending update timeout
        if (pendingUpdateTimeout) {
          clearTimeout(pendingUpdateTimeout);
          pendingUpdateTimeout = null;
        }
      };
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
  (agents) => {
    const values = Object.values(agents);
    return values.length === 0 ? EMPTY_AGENTS_ARRAY : values;
  },
  {
    // Add equality function to prevent unnecessary recalculations
    equalityCheck: (a, b) => {
      if (a === b) return true;
      if (!a || !b) return false;
      if (a.length !== b.length) return false;
      return a.every((agent, index) =>
        agent && b[index] &&
        agent.id === b[index].id &&
        agent.lastUpdate === b[index].lastUpdate
      );
    }
  }
);

// Cache empty array for agents
const EMPTY_AGENTS_ARRAY: any[] = Object.freeze([]);

export const selectAgentById = createSelector(
  [selectAgentsObject, (state: { agents: AgentsState }, agentId: string) => agentId],
  (agents, agentId) => agents[agentId]
);

export const selectSelectedAgent = createSelector(
  [selectAgentsObject, (state: { agents: AgentsState }) => state.agents.selectedAgent],
  (agents, selectedId) => selectedId ? agents[selectedId] || null : null
);

// Cache for sorted agent IDs to prevent new array creation
const sortedAgentsCache = new Map<string, string[]>();

// Create a memoized selector that properly handles array creation with improved caching
export const selectAgentIds = createSelector(
  [selectAgentsObject],
  (agents) => {
    const keys = Object.keys(agents);
    
    // Always return the same frozen empty array for empty state
    if (keys.length === 0) {
      return EMPTY_ARRAY;
    }
    
    // Create a stable cache key that accounts for agent order and content
    // Include both the count and the sorted keys to prevent collisions
    const sortedKeys = [...keys].sort();
    const cacheKey = `${keys.length}:${sortedKeys.join(',')}`;
    
    // Return cached array if available
    if (sortedAgentsCache.has(cacheKey)) {
      return sortedAgentsCache.get(cacheKey)!;
    }
    
    // Create and cache the new array
    const frozenArray = Object.freeze(sortedKeys);
    sortedAgentsCache.set(cacheKey, frozenArray);
    
    // Improved cache management - clean oldest entries when cache gets large
    if (sortedAgentsCache.size > 50) { // Reduced from 100 to prevent memory issues
      // Delete the oldest entries (first 25% of the cache)
      const entriesToDelete = Math.floor(sortedAgentsCache.size * 0.25);
      const keysToDelete = Array.from(sortedAgentsCache.keys()).slice(0, entriesToDelete);
      keysToDelete.forEach(key => sortedAgentsCache.delete(key));
    }
    
    return frozenArray;
  },
  {
    // Add equality function to prevent unnecessary recalculations
    equalityCheck: (a, b) => {
      if (a === b) return true;
      if (!a || !b) return false;
      if (a.length !== b.length) return false;
      return a.every((val, index) => val === b[index]);
    }
  }
);

// Cache empty array reference to prevent new array creation
const EMPTY_ARRAY: string[] = Object.freeze([]);

export const selectOnlineAgents = createSelector(
  [selectAgentsObject],
  (agents) => {
    const onlineAgents = Object.values(agents).filter(agent => agent.status === 'online');
    return onlineAgents.length === 0 ? EMPTY_AGENTS_ARRAY : onlineAgents;
  },
  {
    // Add equality function to prevent unnecessary recalculations
    equalityCheck: (a, b) => {
      if (a === b) return true;
      if (!a || !b) return false;
      if (a.length !== b.length) return false;
      return a.every((agent, index) =>
        agent && b[index] &&
        agent.id === b[index].id &&
        agent.status === b[index].status &&
        agent.lastUpdate === b[index].lastUpdate
      );
    }
  }
);

// Simplified selectors - direct property access instead of identity functions
export const selectAgentsLoading = (state: { agents: AgentsState }) => state.agents.loading;

export const selectAgentsError = (state: { agents: AgentsState }) => state.agents.error;

// Streaming selectors - direct property access for better performance
export const selectStreamingStatus = (state: { agents: AgentsState }) => state.agents.streaming;

export const selectStreamingPerformance = (state: { agents: AgentsState }) => state.agents.performance;

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
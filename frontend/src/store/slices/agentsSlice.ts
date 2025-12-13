import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AgentState, AgentSummary } from '../../types/agent';
import type { 
  AgentStateUpdateEvent, 
  AgentConnectionEvent, 
  AgentDisconnectionEvent 
} from '../../types/socketEvents';

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
      
      // Convert array to object for efficient lookup
      const agentsObj: Record<string, AgentState> = {};
      agentsArray.forEach(summary => {
        // Convert summary to full agent state (will be updated with full data later)
        agentsObj[summary.id] = {
          id: summary.id,
          name: summary.name,
          profile: summary.profile,
          status: summary.status as 'online' | 'offline' | 'idle' | 'busy',
          lastUpdate: summary.lastUpdate,
          context: {
            position: summary.position,
            health: summary.health,
            food: 100,
            experience: 0,
            level: summary.level || 1,
            dimension: 'overworld',
            timeOfDay: 0,
            weather: 'clear',
            nearbyEntities: [],
            nearbyBlocks: [],
            inventory: { items: [], slots: 36, usedSlots: 0 },
            equipment: {},
          },
          reactive: {
            activeMode: 'idle',
            emergencyConditions: [],
            lastReactiveAction: {
              mode: 'idle',
              priority: 0,
              timestamp: Date.now(),
              context: {},
              outcome: 'none',
            },
            interruptHistory: [],
          },
          cognitive: {
            purpose: {
              identity: {
                name: summary.name,
                role: 'agent',
                background: 'Unknown',
                corePurpose: 'Survival and exploration',
              },
              personality: {
                openness: 0.5,
                conscientiousness: 0.5,
                extraversion: 0.5,
                agreeableness: 0.5,
                neuroticism: 0.5,
                riskTolerance: 0.5,
                creativity: 0.5,
                patience: 0.5,
                competitiveness: 0.5,
                curiosity: 0.5,
              },
              motivations: [],
              values: [],
              ethics: {
                harmAvoidance: 0.8,
                fairness: 0.7,
                loyalty: 0.6,
                authority: 0.5,
                purity: 0.4,
              },
            },
            goals: {
              strategicGoals: [],
              tacticalGoals: [],
              operationalGoals: [],
              activeGoals: [],
              goalHistory: [],
            },
            skills: {},
            memory: {
              semantic: {
                concepts: {},
                facts: {},
                relationships: {},
              },
              episodic: {
                events: [],
                conversations: [],
                experiences: [],
              },
              procedural: {
                skills: {},
                procedures: {},
                habits: {},
              },
              working: {
                currentFocus: 'idle',
                activeTasks: [],
                conversationContext: null,
                buffer: [],
              },
            },
            processing: {
              currentPhase: 'perception',
              cognitiveLoad: 0,
              attentionLevel: 0.5,
              processingHistory: [],
            },
          },
          executive: {
            currentAction: {
              id: '',
              type: 'idle',
              description: 'Agent is idle',
              priority: 0,
              status: 'pending',
              createdAt: Date.now(),
              context: {},
            },
            actionQueue: [],
            decisionHistory: [],
            performanceMetrics: {
              reactiveResponseTime: 0,
              cognitiveProcessingTime: 0,
              successRate: 1.0,
              errorRate: 0.0,
              memoryUsage: 0,
              cpuUsage: 0,
            },
            responseHistory: [],
            processingMode: 'action',
          },
          social: {
            relationships: {},
            reputation: {
              globalScore: 0,
              factionScores: {},
              traitScores: {},
              recentEvents: [],
            },
            socialContext: {
              currentSituation: 'idle',
              nearbyAgents: [],
              socialNorms: [],
              culturalContext: 'default',
              groupDynamics: null,
            },
            mentalModels: {},
          },
        };
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
        agent.context.position = position;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentHealth: (state, action: PayloadAction<{ agentId: string; health: number }>) => {
      const { agentId, health } = action.payload;
      const agent = state.agents[agentId];
      if (agent) {
        agent.context.health = health;
        agent.lastUpdate = Date.now();
      }
    },

    // Real-time streaming actions
    agentStateUpdate: (state, action: PayloadAction<AgentStateUpdateEvent>) => {
      const { agentId, state: agentState, changes, timestamp } = action.payload;
      const existingAgent = state.agents[agentId];
      
      if (existingAgent) {
        // Update only the basic fields that come from the socket state
        const updatedAgent: AgentState = {
          ...existingAgent,
          lastUpdate: timestamp,
          status: agentState.status as any, // Handle status type compatibility
          // Update context fields if they exist in the incoming state
          context: {
            ...existingAgent.context,
            position: agentState.position || existingAgent.context.position,
            health: agentState.health ?? existingAgent.context.health,
            food: agentState.food ?? existingAgent.context.food,
            experience: agentState.experience ?? existingAgent.context.experience,
            level: agentState.level ?? existingAgent.context.level,
            dimension: agentState.context?.dimension || existingAgent.context.dimension,
            timeOfDay: agentState.context?.timeOfDay ?? existingAgent.context.timeOfDay,
            weather: agentState.context?.weather || existingAgent.context.weather,
          },
        };
        
        state.agents[agentId] = updatedAgent;
        state.streaming.lastStreamUpdate = timestamp;
        state.performance.totalUpdates++;
        
        // Calculate update frequency
        if (state.streaming.lastStreamUpdate) {
          const timeDiff = timestamp - state.streaming.lastStreamUpdate;
          state.performance.updateFrequency = 1000 / timeDiff; // Updates per second
        }
      } else {
        // New agent, create full state with default structure
        const newAgent: AgentState = {
          id: agentId,
          name: agentState.name,
          profile: {} as any,
          status: 'online',
          lastUpdate: timestamp,
          context: {
            position: agentState.position,
            health: agentState.health,
            food: agentState.food,
            experience: agentState.experience,
            level: agentState.level,
            dimension: agentState.context?.dimension || 'overworld',
            timeOfDay: agentState.context?.timeOfDay || 0,
            weather: agentState.context?.weather || 'clear',
            nearbyEntities: [],
            nearbyBlocks: [],
            inventory: { items: [], slots: 36, usedSlots: 0 },
            equipment: {},
          },
          reactive: {
            activeMode: 'idle',
            emergencyConditions: [],
            lastReactiveAction: {
              mode: 'idle',
              priority: 0,
              timestamp: Date.now(),
              context: {},
              outcome: 'none',
            },
            interruptHistory: [],
          },
          cognitive: {
            purpose: {
              identity: {
                name: agentState.name,
                role: 'agent',
                background: 'Unknown',
                corePurpose: 'Survival and exploration',
              },
              personality: {
                openness: 0.5,
                conscientiousness: 0.5,
                extraversion: 0.5,
                agreeableness: 0.5,
                neuroticism: 0.5,
                riskTolerance: 0.5,
                creativity: 0.5,
                patience: 0.5,
                competitiveness: 0.5,
                curiosity: 0.5,
              },
              motivations: [],
              values: [],
              ethics: {
                harmAvoidance: 0.8,
                fairness: 0.7,
                loyalty: 0.6,
                authority: 0.5,
                purity: 0.4,
              },
            },
            goals: {
              strategicGoals: [],
              tacticalGoals: [],
              operationalGoals: [],
              activeGoals: [],
              goalHistory: [],
            },
            skills: {},
            memory: {
              semantic: {
                concepts: {},
                facts: {},
                relationships: {},
              },
              episodic: {
                events: [],
                conversations: [],
                experiences: [],
              },
              procedural: {
                skills: {},
                procedures: {},
                habits: {},
              },
              working: {
                currentFocus: 'idle',
                activeTasks: [],
                conversationContext: null,
                buffer: [],
              },
            },
            processing: {
              currentPhase: 'perception',
              cognitiveLoad: 0,
              attentionLevel: 0.5,
              processingHistory: [],
            },
          },
          executive: {
            currentAction: {
              id: '',
              type: 'idle',
              description: 'Agent is idle',
              priority: 0,
              status: 'pending',
              createdAt: Date.now(),
              context: {},
            },
            actionQueue: [],
            decisionHistory: [],
            performanceMetrics: {
              reactiveResponseTime: 0,
              cognitiveProcessingTime: 0,
              successRate: 1.0,
              errorRate: 0.0,
              memoryUsage: 0,
              cpuUsage: 0,
            },
            responseHistory: [],
            processingMode: 'action',
          },
          social: {
            relationships: {},
            reputation: {
              globalScore: 0,
              factionScores: {},
              traitScores: {},
              recentEvents: [],
            },
            socialContext: {
              currentSituation: 'idle',
              nearbyAgents: [],
              socialNorms: [],
              culturalContext: 'default',
              groupDynamics: null,
            },
            mentalModels: {},
          },
        };
        
        state.agents[agentId] = newAgent;
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

    // Batch update for multiple agents (performance optimization)
    batchAgentUpdates: (state, action: PayloadAction<AgentStateUpdateEvent[]>) => {
      action.payload.forEach(update => {
        const { agentId, state: agentState, timestamp } = update;
        const existingAgent = state.agents[agentId];
        
        if (existingAgent) {
          const updatedAgent: AgentState = {
            ...existingAgent,
            lastUpdate: timestamp,
            status: agentState.status as any, // Handle status type compatibility
            // Update context fields if they exist in the incoming state
            context: {
              ...existingAgent.context,
              position: agentState.position || existingAgent.context.position,
              health: agentState.health ?? existingAgent.context.health,
              food: agentState.food ?? existingAgent.context.food,
              experience: agentState.experience ?? existingAgent.context.experience,
              level: agentState.level ?? existingAgent.context.level,
              dimension: agentState.context?.dimension || existingAgent.context.dimension,
              timeOfDay: agentState.context?.timeOfDay ?? existingAgent.context.timeOfDay,
              weather: agentState.context?.weather || existingAgent.context.weather,
            },
          };
          state.agents[agentId] = updatedAgent;
        } else {
          // For batch updates, create minimal agent state
          const newAgent: AgentState = {
            id: agentId,
            name: agentState.name,
            profile: {} as any,
            status: 'online',
            lastUpdate: timestamp,
            context: {
              position: agentState.position,
              health: agentState.health,
              food: agentState.food,
              experience: agentState.experience,
              level: agentState.level,
              dimension: agentState.context.dimension,
              timeOfDay: agentState.context.timeOfDay,
              weather: agentState.context.weather,
              nearbyEntities: [],
              nearbyBlocks: [],
              inventory: { items: [], slots: 36, usedSlots: 0 },
              equipment: {},
            },
            reactive: {
              activeMode: 'idle',
              emergencyConditions: [],
              lastReactiveAction: {
                mode: 'idle',
                priority: 0,
                timestamp: Date.now(),
                context: {},
                outcome: 'none',
              },
              interruptHistory: [],
            },
            cognitive: {
              purpose: {
                identity: {
                  name: agentState.name,
                  role: 'agent',
                  background: 'Unknown',
                  corePurpose: 'Survival and exploration',
                },
                personality: {
                  openness: 0.5,
                  conscientiousness: 0.5,
                  extraversion: 0.5,
                  agreeableness: 0.5,
                  neuroticism: 0.5,
                  riskTolerance: 0.5,
                  creativity: 0.5,
                  patience: 0.5,
                  competitiveness: 0.5,
                  curiosity: 0.5,
                },
                motivations: [],
                values: [],
                ethics: {
                  harmAvoidance: 0.8,
                  fairness: 0.7,
                  loyalty: 0.6,
                  authority: 0.5,
                  purity: 0.4,
                },
              },
              goals: {
                strategicGoals: [],
                tacticalGoals: [],
                operationalGoals: [],
                activeGoals: [],
                goalHistory: [],
              },
              skills: {},
              memory: {
                semantic: {
                  concepts: {},
                  facts: {},
                  relationships: {},
                },
                episodic: {
                  events: [],
                  conversations: [],
                  experiences: [],
                },
                procedural: {
                  skills: {},
                  procedures: {},
                  habits: {},
                },
                working: {
                  currentFocus: 'idle',
                  activeTasks: [],
                  conversationContext: null,
                  buffer: [],
                },
              },
              processing: {
                currentPhase: 'perception',
                cognitiveLoad: 0,
                attentionLevel: 0.5,
                processingHistory: [],
              },
            },
            executive: {
              currentAction: {
                id: '',
                type: 'idle',
                description: 'Agent is idle',
                priority: 0,
                status: 'pending',
                createdAt: Date.now(),
                context: {},
              },
              actionQueue: [],
              decisionHistory: [],
              performanceMetrics: {
                reactiveResponseTime: 0,
                cognitiveProcessingTime: 0,
                successRate: 1.0,
                errorRate: 0.0,
                memoryUsage: 0,
                cpuUsage: 0,
              },
              responseHistory: [],
              processingMode: 'action',
            },
            social: {
              relationships: {},
              reputation: {
                globalScore: 0,
                factionScores: {},
                traitScores: {},
                recentEvents: [],
              },
              socialContext: {
                currentSituation: 'idle',
                nearbyAgents: [],
                socialNorms: [],
                culturalContext: 'default',
                groupDynamics: null,
              },
              mentalModels: {},
            },
          };
          state.agents[agentId] = newAgent;
        }
      });
      
      state.streaming.lastStreamUpdate = Date.now();
      state.performance.totalUpdates += action.payload.length;
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
  // Real-time streaming actions
  agentStateUpdate,
  agentConnected,
  agentDisconnected,
  updateStreamingStatus,
  streamingError,
  incrementReconnectAttempts,
  resetStreamingMetrics,
  updatePerformanceMetrics,
  batchAgentUpdates,
} = agentsSlice.actions;

export default agentsSlice.reducer;

// Selectors
export const selectAllAgents = (state: { agents: AgentsState }) => state.agents.agents;
export const selectAgentById = (state: { agents: AgentsState }, agentId: string) => 
  state.agents.agents[agentId];
export const selectSelectedAgent = (state: { agents: AgentsState }) => {
  const selectedId = state.agents.selectedAgent;
  return selectedId ? state.agents.agents[selectedId] || null : null;
};
export const selectAgentsLoading = (state: { agents: AgentsState }) => state.agents.loading;
export const selectAgentsError = (state: { agents: AgentsState }) => state.agents.error;
export const selectAgentIds = (state: { agents: AgentsState }) => 
  Object.keys(state.agents.agents);
export const selectOnlineAgents = (state: { agents: AgentsState }) =>
  Object.values(state.agents.agents).filter(agent => agent.status === 'online');

// Streaming selectors
export const selectStreamingStatus = (state: { agents: AgentsState }) => state.agents.streaming;
export const selectStreamingPerformance = (state: { agents: AgentsState }) => state.agents.performance;
export const selectIsStreamingConnected = (state: { agents: AgentsState }) => state.agents.streaming.isConnected;
export const selectConnectionQuality = (state: { agents: AgentsState }) => state.agents.streaming.connectionQuality;
export const selectStreamingLatency = (state: { agents: AgentsState }) => state.agents.streaming.latency;
export const selectStreamingErrors = (state: { agents: AgentsState }) => state.agents.streaming.streamErrors;
export const selectUpdateFrequency = (state: { agents: AgentsState }) => state.agents.performance.updateFrequency;

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
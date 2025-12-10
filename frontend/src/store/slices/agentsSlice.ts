import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AgentState, AgentSummary } from '../../types/agent';

export interface AgentsState {
  agents: Map<string, AgentState>;
  selectedAgent: string | null;
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
}

const initialState: AgentsState = {
  agents: new Map(),
  selectedAgent: null,
  loading: false,
  error: null,
  lastUpdate: null,
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<AgentSummary[]>) => {
      state.loading = false;
      state.error = null;
      state.lastUpdate = Date.now();
      
      // Convert array to Map for efficient lookup
      const agentsMap = new Map<string, AgentState>();
      action.payload.forEach(summary => {
        // Convert summary to full agent state (will be updated with full data later)
        agentsMap.set(summary.id, {
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
            skills: new Map(),
            memory: {
              semantic: {
                concepts: new Map(),
                facts: new Map(),
                relationships: new Map(),
              },
              episodic: {
                events: [],
                conversations: [],
                experiences: [],
              },
              procedural: {
                skills: new Map(),
                procedures: new Map(),
                habits: new Map(),
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
            relationships: new Map(),
            reputation: {
              globalScore: 0,
              factionScores: new Map(),
              traitScores: new Map(),
              recentEvents: [],
            },
            socialContext: {
              currentSituation: 'idle',
              nearbyAgents: [],
              socialNorms: [],
              culturalContext: 'default',
              groupDynamics: null,
            },
            mentalModels: new Map(),
          },
        });
      });
      
      state.agents = agentsMap;
    },
    
    updateAgent: (state, action: PayloadAction<{ agentId: string; updates: Partial<AgentState> }>) => {
      const { agentId, updates } = action.payload;
      const existingAgent = state.agents.get(agentId);
      
      if (existingAgent) {
        state.agents.set(agentId, { ...existingAgent, ...updates });
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
      state.agents.delete(action.payload);
      if (state.selectedAgent === action.payload) {
        state.selectedAgent = null;
      }
    },
    
    updateAgentStatus: (state, action: PayloadAction<{ agentId: string; status: string }>) => {
      const { agentId, status } = action.payload;
      const agent = state.agents.get(agentId);
      if (agent) {
        agent.status = status as any;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentPosition: (state, action: PayloadAction<{ agentId: string; position: { x: number; y: number; z: number } }>) => {
      const { agentId, position } = action.payload;
      const agent = state.agents.get(agentId);
      if (agent) {
        agent.context.position = position;
        agent.lastUpdate = Date.now();
      }
    },
    
    updateAgentHealth: (state, action: PayloadAction<{ agentId: string; health: number }>) => {
      const { agentId, health } = action.payload;
      const agent = state.agents.get(agentId);
      if (agent) {
        agent.context.health = health;
        agent.lastUpdate = Date.now();
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
} = agentsSlice.actions;

export default agentsSlice.reducer;

// Selectors
export const selectAllAgents = (state: { agents: AgentsState }) => state.agents.agents;
export const selectAgentById = (state: { agents: AgentsState }, agentId: string) => 
  state.agents.agents.get(agentId);
export const selectSelectedAgent = (state: { agents: AgentsState }) => {
  const selectedId = state.agents.selectedAgent;
  return selectedId ? state.agents.agents.get(selectedId) || null : null;
};
export const selectAgentsLoading = (state: { agents: AgentsState }) => state.agents.loading;
export const selectAgentsError = (state: { agents: AgentsState }) => state.agents.error;
export const selectAgentIds = (state: { agents: AgentsState }) => 
  Array.from(state.agents.agents.keys());
export const selectOnlineAgents = (state: { agents: AgentsState }) => 
  Array.from(state.agents.agents.values()).filter(agent => agent.status === 'online');
import { createSlice, createAsyncThunk, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type {
  PersonalityState,
  PersonalityUIState,
  PersonalityEvolution,
  PersonalityUpdateEvent,
  PersonalityEvolutionEvent,
  PersonalityComparison,
  BehavioralPattern,
  CorrelationMatrix,
  PersonalityEvent,
  PersonalityInfluence,
  TraitCorrelation
} from '../../types/personality';
import type { PersonalityTraits } from '../../types/agent';
import type {
  PersonalityTraitUpdateEvent,
  PersonalityEmotionEvent,
  PersonalityMoodEvent,
  ConnectionStatusEvent
} from '../../types/socketEvents';

// Initial state
const initialPersonalityUIState: PersonalityUIState = {
  selectedAgent: null,
  comparisonAgents: [],
  timeRange: {
    start: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
    end: Date.now()
  },
  visualizationMode: 'radar' as const,
  filters: {
    traitCategories: ['big_five', 'gaming_specific'],
    minSignificance: 0.5,
    showEvents: true,
    showInfluences: true
  },
  loading: false,
  error: null
};

const initialCorrelationMatrix: CorrelationMatrix = {
  traits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism', 'riskTolerance', 'creativity', 'patience', 'competitiveness', 'curiosity'],
  matrix: [] as number[][],
  significantCorrelations: [],
  insights: {
    strongPositive: [],
    strongNegative: [],
    unexpected: []
  }
};

const initialPersonalityState: PersonalityState = {
  agents: {} as Record<string, PersonalityEvolution>,
  behavioralPatterns: {} as Record<string, BehavioralPattern[]>,
  comparisons: {} as Record<string, PersonalityComparison>,
  correlations: initialCorrelationMatrix,
  ui: initialPersonalityUIState
};

// Async thunks
export const fetchPersonalityEvolution = createAsyncThunk(
  'personality/fetchPersonalityEvolution',
  async (agentId: string, { rejectWithValue }) => {
    try {
      // This would typically make an API call to fetch personality evolution
      // For now, we'll simulate with mock data
      const evolution = {
        timestamp: Date.now(),
        traits: {
          openness: 0.7 + Math.random() * 0.3,
          conscientiousness: 0.6 + Math.random() * 0.4,
          extraversion: 0.5 + Math.random() * 0.5,
          agreeableness: 0.6 + Math.random() * 0.4,
          neuroticism: 0.2 + Math.random() * 0.3,
          riskTolerance: 0.4 + Math.random() * 0.6,
          creativity: 0.6 + Math.random() * 0.4,
          patience: 0.5 + Math.random() * 0.5,
          competitiveness: 0.4 + Math.random() * 0.6,
          curiosity: 0.7 + Math.random() * 0.3
        },
        experiences: [],
        influences: [],
        significantEvents: []
      };

      return { agentId, evolution };
    } catch (error) {
      return rejectWithValue(`Failed to fetch personality evolution for agent ${agentId}`);
    }
  }
);

export const fetchPersonalityComparison = createAsyncThunk(
  'personality/fetchPersonalityComparison',
  async ({ agent1Id, agent2Id }: { agent1Id: string; agent2Id: string }, { rejectWithValue }) => {
    try {
      // This would typically make an API call to fetch personality comparison
      const comparison = {
        agent1: {
          id: agent1Id,
          name: `Agent ${agent1Id}`,
          traits: {
            openness: 0.8,
            conscientiousness: 0.7,
            extraversion: 0.6,
            agreeableness: 0.7,
            neuroticism: 0.3,
            riskTolerance: 0.5,
            creativity: 0.8,
            patience: 0.6,
            competitiveness: 0.4,
            curiosity: 0.9
          }
        },
        agent2: {
          id: agent2Id,
          name: `Agent ${agent2Id}`,
          traits: {
            openness: 0.5,
            conscientiousness: 0.8,
            extraversion: 0.4,
            agreeableness: 0.9,
            neuroticism: 0.2,
            riskTolerance: 0.3,
            creativity: 0.4,
            patience: 0.8,
            competitiveness: 0.7,
            curiosity: 0.6
          }
        },
        similarities: [],
        differences: [],
        overallCompatibility: 0.7,
        analysis: {
          strengths: ['Both agents show balanced personality profiles'],
          conflicts: ['Different risk tolerance levels'],
          synergies: ['Complementary creativity and conscientiousness']
        }
      };

      return { comparisonKey: `${agent1Id}-${agent2Id}`, comparison };
    } catch (error) {
      return rejectWithValue(`Failed to fetch personality comparison for agents ${agent1Id} and ${agent2Id}`);
    }
  }
);

export const fetchBehavioralPatterns = createAsyncThunk(
  'personality/fetchBehavioralPatterns',
  async (agentId: string, { rejectWithValue }) => {
    try {
      // This would typically make an API call to fetch behavioral patterns
      const patterns = [
        {
          id: 'exploratory_pattern',
          name: 'Exploratory Behavior',
          description: 'Tendency to explore new areas and discover resources',
          traits: {
            openness: 0.9,
            conscientiousness: 0.3,
            extraversion: 0.7,
            agreeableness: 0.5,
            neuroticism: 0.2,
            riskTolerance: 0.8,
            creativity: 0.7,
            patience: 0.4,
            competitiveness: 0.3,
            curiosity: 0.9
          },
          frequency: 0.7,
          confidence: 0.85,
          contexts: ['exploration', 'resource_gathering'],
          outcomes: {
            success: 0.8,
            failure: 0.2,
            efficiency: 0.75
          }
        }
      ];

      return { agentId, patterns };
    } catch (error) {
      return rejectWithValue(`Failed to fetch behavioral patterns for agent ${agentId}`);
    }
  }
);

export const fetchTraitCorrelations = createAsyncThunk(
  'personality/fetchTraitCorrelations',
  async (_, { rejectWithValue }) => {
    try {
      // This would typically make an API call to fetch trait correlations
      const correlations = [
        {
          trait1: 'openness',
          trait2: 'creativity',
          correlation: 0.8,
          significance: 0.95,
          sampleSize: 1000,
          description: 'Strong positive correlation between openness and creativity'
        },
        {
          trait1: 'neuroticism',
          trait2: 'riskTolerance',
          correlation: -0.6,
          significance: 0.9,
          sampleSize: 1000,
          description: 'Moderate negative correlation between neuroticism and risk tolerance'
        }
      ];

      // Generate correlation matrix
      const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism', 'riskTolerance', 'creativity', 'patience', 'competitiveness', 'curiosity'];
      const matrix: number[][] = [];
      
      for (let i = 0; i < traits.length; i++) {
        matrix[i] = [] as number[];
        for (let j = 0; j < traits.length; j++) {
          if (i === j) {
            matrix[i]![j] = 1.0;
          } else {
            matrix[i]![j] = (Math.random() - 0.5) * 1.5; // Random correlation between -0.75 and 0.75
          }
        }
      }

      const correlationMatrix = {
        traits,
        matrix,
        significantCorrelations: correlations,
        insights: {
          strongPositive: correlations.filter(c => c.correlation > 0.6),
          strongNegative: correlations.filter(c => c.correlation < -0.6),
          unexpected: correlations.filter(c => Math.abs(c.correlation) < 0.3 && c.significance > 0.8)
        }
      };

      return correlationMatrix;
    } catch (error) {
      return rejectWithValue('Failed to fetch trait correlations');
    }
  }
);

// Personality slice
const personalitySlice = createSlice({
  name: 'personality',
  initialState: initialPersonalityState,
  reducers: {
    // Agent selection
    selectAgent: (state, action: PayloadAction<string>) => {
      state.ui.selectedAgent = action.payload;
    },
    deselectAgent: (state) => {
      state.ui.selectedAgent = null;
    },

    // Comparison management
    addToComparison: (state, action: PayloadAction<string>) => {
      const agentId = action.payload;
      if (!state.ui.comparisonAgents.includes(agentId)) {
        state.ui.comparisonAgents.push(agentId);
      }
    },
    removeFromComparison: (state, action: PayloadAction<string>) => {
      const agentId = action.payload;
      state.ui.comparisonAgents = state.ui.comparisonAgents.filter(id => id !== agentId);
    },
    clearComparison: (state) => {
      state.ui.comparisonAgents = [];
    },

    // Time range management
    setTimeRange: (state, action: PayloadAction<{ start: number; end: number }>) => {
      state.ui.timeRange = action.payload;
    },

    // Visualization mode
    setVisualizationMode: (state, action: PayloadAction<'radar' | 'timeline' | 'matrix' | 'comparison' | 'correlation'>) => {
      state.ui.visualizationMode = action.payload;
    },

    // Filters
    setTraitCategories: (state, action: PayloadAction<('big_five' | 'gaming_specific')[]>) => {
      state.ui.filters.traitCategories = action.payload;
    },
    setMinSignificance: (state, action: PayloadAction<number>) => {
      state.ui.filters.minSignificance = action.payload;
    },
    toggleShowEvents: (state) => {
      state.ui.filters.showEvents = !state.ui.filters.showEvents;
    },
    toggleShowInfluences: (state) => {
      state.ui.filters.showInfluences = !state.ui.filters.showInfluences;
    },

    // Real-time updates
    updatePersonalityTraits: (state, action: PayloadAction<PersonalityUpdateEvent>) => {
      const { agentId, traits, timestamp, influences, events } = action.payload;
      
      if (!state.agents[agentId]) {
        state.agents[agentId] = {
          timestamp,
          traits,
          experiences: [],
          influences: influences || [],
          significantEvents: events || []
        };
      } else {
        const evolution = state.agents[agentId];
        evolution.traits = traits;
        evolution.timestamp = timestamp;
        
        if (influences) {
          evolution.influences.push(...influences);
        }
        
        if (events) {
          evolution.significantEvents.push(...events);
        }
      }
    },

    // Enhanced real-time updates for emotional state
    updateEmotionalState: (state, action: PayloadAction<{ agentId: string; emotions: any; timestamp: number }>) => {
      const { agentId, emotions, timestamp } = action.payload;
      
      if (!state.agents[agentId]) {
        state.agents[agentId] = {
          timestamp,
          traits: {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
            riskTolerance: 0.5,
            creativity: 0.5,
            patience: 0.5,
            competitiveness: 0.5,
            curiosity: 0.5
          },
          experiences: [],
          influences: [],
          significantEvents: [{
            id: `emotion_${timestamp}`,
            type: 'personality_shift',
            timestamp,
            impact: { traitChanges: {}, significance: 0.7 },
            description: `Emotional state updated: ${JSON.stringify(emotions)}`,
            context: { source: 'realtime_update' }
          }]
        };
      } else {
        const evolution = state.agents[agentId];
        evolution.timestamp = timestamp;
        
        // Add emotional state as a significant event
        evolution.significantEvents.push({
          id: `emotion_${timestamp}`,
          type: 'personality_shift',
          timestamp,
          impact: { traitChanges: {}, significance: 0.7 },
          description: `Emotional state updated: ${JSON.stringify(emotions)}`,
          context: { source: 'realtime_update' }
        });
      }
    },

    // Enhanced real-time updates for mood state
    updateMoodState: (state, action: PayloadAction<{ agentId: string; mood: any; timestamp: number }>) => {
      const { agentId, mood, timestamp } = action.payload;
      
      if (!state.agents[agentId]) {
        state.agents[agentId] = {
          timestamp,
          traits: {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
            riskTolerance: 0.5,
            creativity: 0.5,
            patience: 0.5,
            competitiveness: 0.5,
            curiosity: 0.5
          },
          experiences: [],
          influences: [],
          significantEvents: [{
            id: `mood_${timestamp}`,
            type: 'personality_shift',
            timestamp,
            impact: { traitChanges: {}, significance: 0.6 },
            description: `Mood state updated: ${JSON.stringify(mood)}`,
            context: { source: 'realtime_update' }
          }]
        };
      } else {
        const evolution = state.agents[agentId];
        evolution.timestamp = timestamp;
        
        // Add mood state as a significant event
        evolution.significantEvents.push({
          id: `mood_${timestamp}`,
          type: 'personality_shift',
          timestamp,
          impact: { traitChanges: {}, significance: 0.6 },
          description: `Mood state updated: ${JSON.stringify(mood)}`,
          context: { source: 'realtime_update' }
        });
      }
    },

    // Streaming status management
    setStreamingStatus: (state, action: PayloadAction<{ component: string; status: string; lastUpdate: number }>) => {
      // Store streaming status in error field for now (temporary solution)
      state.ui.error = `Streaming status (${action.payload.component}): ${action.payload.status}`;
    },

    setStreamingError: (state, action: PayloadAction<{ component: string; error: string }>) => {
      // Store streaming error in UI state
      state.ui.error = `Streaming error (${action.payload.component}): ${action.payload.error}`;
    },

    setAgentSubscriptionStatus: (state, action: PayloadAction<{ agentId: string; component: string; subscribed: boolean; timestamp: number }>) => {
      // Store subscription status as a significant event for now (temporary solution)
      const subscriptionEvent = {
        id: `subscription_${action.payload.agentId}_${action.payload.component}_${action.payload.timestamp}`,
        type: 'milestone' as const,
        timestamp: action.payload.timestamp,
        impact: { traitChanges: {}, significance: 0.5 },
        description: `${action.payload.component} subscription ${action.payload.subscribed ? 'activated' : 'deactivated'} for agent ${action.payload.agentId}`,
        context: { source: 'realtime_update' }
      };

      if (!state.agents[action.payload.agentId]) {
        state.agents[action.payload.agentId] = {
          timestamp: action.payload.timestamp,
          traits: {
            openness: 0.5,
            conscientiousness: 0.5,
            extraversion: 0.5,
            agreeableness: 0.5,
            neuroticism: 0.5,
            riskTolerance: 0.5,
            creativity: 0.5,
            patience: 0.5,
            competitiveness: 0.5,
            curiosity: 0.5
          },
          experiences: [],
          influences: [],
          significantEvents: [subscriptionEvent]
        };
      } else {
        const evolution = state.agents[action.payload.agentId];
        evolution.significantEvents.push(subscriptionEvent);
      }
    },

    addPersonalityEvent: (state, action: PayloadAction<{ agentId: string; event: PersonalityEvent }>) => {
      const { agentId, event } = action.payload;
      
      if (state.agents[agentId]) {
        const evolution = state.agents[agentId];
        evolution.significantEvents.push(event);
      }
    },

    addPersonalityInfluence: (state, action: PayloadAction<{ agentId: string; influence: PersonalityInfluence }>) => {
      const { agentId, influence } = action.payload;
      
      if (state.agents[agentId]) {
        const evolution = state.agents[agentId];
        evolution.influences.push(influence);
      }
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.ui.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.ui.error = action.payload;
    },
    clearError: (state) => {
      state.ui.error = null;
    },

    // Data cleanup
    clearAgentData: (state, action: PayloadAction<string>) => {
      const agentId = action.payload;
      delete state.agents[agentId];
      delete state.behavioralPatterns[agentId];
      
      // Remove from comparisons
      Object.keys(state.comparisons).forEach(key => {
        if (key.includes(agentId)) {
          delete state.comparisons[key];
        }
      });
      
      // Remove from UI selection
      if (state.ui.selectedAgent === agentId) {
        state.ui.selectedAgent = null;
      }
      
      state.ui.comparisonAgents = state.ui.comparisonAgents.filter(id => id !== agentId);
    },

    clearAllData: (state) => {
      state.agents = {};
      state.behavioralPatterns = {};
      state.comparisons = {};
      state.ui.selectedAgent = null;
      state.ui.comparisonAgents = [];
    },

    // Reset personality state
    resetPersonality: () => {
      return initialPersonalityState;
    }
  },
  extraReducers: (builder) => {
    // Fetch personality evolution
    builder
      .addCase(fetchPersonalityEvolution.pending, (state) => {
        state.ui.loading = true;
        state.ui.error = null;
      })
      .addCase(fetchPersonalityEvolution.fulfilled, (state, action) => {
        state.ui.loading = false;
        const { agentId, evolution } = action.payload;
        state.agents[agentId] = evolution;
      })
      .addCase(fetchPersonalityEvolution.rejected, (state, action) => {
        state.ui.loading = false;
        state.ui.error = action.payload as string;
      });

    // Fetch personality comparison
    builder
      .addCase(fetchPersonalityComparison.pending, (state) => {
        state.ui.loading = true;
        state.ui.error = null;
      })
      .addCase(fetchPersonalityComparison.fulfilled, (state, action) => {
        state.ui.loading = false;
        const { comparisonKey, comparison } = action.payload;
        state.comparisons[comparisonKey] = comparison;
      })
      .addCase(fetchPersonalityComparison.rejected, (state, action) => {
        state.ui.loading = false;
        state.ui.error = action.payload as string;
      });

    // Fetch behavioral patterns
    builder
      .addCase(fetchBehavioralPatterns.pending, (state) => {
        state.ui.loading = true;
        state.ui.error = null;
      })
      .addCase(fetchBehavioralPatterns.fulfilled, (state, action) => {
        state.ui.loading = false;
        const { agentId, patterns } = action.payload;
        state.behavioralPatterns[agentId] = patterns;
      })
      .addCase(fetchBehavioralPatterns.rejected, (state, action) => {
        state.ui.loading = false;
        state.ui.error = action.payload as string;
      });

    // Fetch trait correlations
    builder
      .addCase(fetchTraitCorrelations.pending, (state) => {
        state.ui.loading = true;
        state.ui.error = null;
      })
      .addCase(fetchTraitCorrelations.fulfilled, (state, action) => {
        state.ui.loading = false;
        state.correlations = action.payload;
      })
      .addCase(fetchTraitCorrelations.rejected, (state, action) => {
        state.ui.loading = false;
        state.ui.error = action.payload as string;
      });
  }
});

// Selectors
export const selectPersonalityState = (state: { personality: PersonalityState }) => state.personality;
export const selectSelectedAgent = (state: { personality: PersonalityState }) => state.personality.ui.selectedAgent;
export const selectComparisonAgents = (state: { personality: PersonalityState }) => state.personality.ui.comparisonAgents;
export const selectVisualizationMode = (state: { personality: PersonalityState }) => state.personality.ui.visualizationMode;
export const selectPersonalityLoading = (state: { personality: PersonalityState }) => state.personality.ui.loading;
export const selectPersonalityError = (state: { personality: PersonalityState }) => state.personality.ui.error;
export const selectTimeRange = (state: { personality: PersonalityState }) => state.personality.ui.timeRange;
export const selectFilters = (state: { personality: PersonalityState }) => state.personality.ui.filters;

// Data selectors
export const selectAgentPersonality = (agentId: string) => (state: { personality: PersonalityState }) =>
  state.personality.agents[agentId] || null;

export const selectSelectedAgentPersonality = (state: { personality: PersonalityState }) => {
  const selectedAgent = state.personality.ui.selectedAgent;
  return selectedAgent ? state.personality.agents[selectedAgent] : null;
};

export const selectAgentBehavioralPatterns = (agentId: string) => (state: { personality: PersonalityState }) =>
  state.personality.behavioralPatterns[agentId] || null;

export const selectPersonalityComparison = (agent1Id: string, agent2Id: string) => (state: { personality: PersonalityState }) =>
  state.personality.comparisons[`${agent1Id}-${agent2Id}`] || null;

export const selectCorrelationMatrix = (state: { personality: PersonalityState }) => state.personality.correlations;

// Memoized selectors
export const selectAllAgents = createSelector(
  [selectPersonalityState],
  (personality: PersonalityState) => Object.keys(personality.agents)
);

export const selectPersonalityTraits = (agentId: string) => createSelector(
  [selectAgentPersonality(agentId)],
  (evolution: PersonalityEvolution | null) => evolution?.traits
);

export const selectPersonalityEvolution = (agentId: string) => createSelector(
  [selectAgentPersonality(agentId)],
  (evolution: PersonalityEvolution | null) => evolution
);

export const selectSignificantEvents = (agentId: string) => createSelector(
  [selectAgentPersonality(agentId)],
  (evolution: PersonalityEvolution | null) => evolution?.significantEvents || []
);

export const selectPersonalityInfluences = (agentId: string) => createSelector(
  [selectAgentPersonality(agentId)],
  (evolution: PersonalityEvolution | null) => evolution?.influences || []
);

export const selectFilteredPersonalityEvents = (agentId: string) => createSelector(
  [selectSignificantEvents(agentId), selectTimeRange, selectFilters],
  (events: PersonalityEvent[], timeRange: { start: number; end: number }, filters: any) => {
    return events.filter(event => 
      event.timestamp >= timeRange.start && 
      event.timestamp <= timeRange.end &&
      event.impact.significance >= filters.minSignificance
    );
  }
);

// Enhanced Socket.IO integration thunks with streaming service
export const initializePersonalitySocket = createAsyncThunk(
  'personality/initializeSocket',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { enhancedSocketService } = await import('../../services/enhancedSocketService');
      const { streamingService } = await import('../../services/streamingService');
      const { validateEvent } = await import('../../utils/eventValidation');
      
      const socketService = enhancedSocketService;
      const streamingSvc = streamingService;
      
      if (!socketService || !streamingSvc) {
        throw new Error('Socket or streaming service not initialized');
      }

      // Initialize streaming status
      dispatch(personalitySlice.actions.setStreamingStatus({
        component: 'personality',
        status: 'connecting',
        lastUpdate: Date.now()
      }));

      // Create cognitive streams - REMOVED: Now handled centrally in App.tsx
      // streamingSvc.createCognitiveStreams();

      // Set up event handlers
      socketService.setHandlers({
        onPersonalityTraitUpdate: (data: PersonalityTraitUpdateEvent) => {
          const validation = validateEvent('personality:trait:update', data);
          if (validation.isValid) {
            streamingSvc.pushData('personality', data);
            dispatch(personalitySlice.actions.updatePersonalityTraits({
              agentId: data.agentId,
              traits: data.traits,
              timestamp: data.timestamp,
              influences: data.changes ? [{
                type: 'experience' as const,
                traitName: 'updated',
                impact: 0.1,
                source: 'socket_update',
                timestamp: data.timestamp
              }] : [],
              events: []
            }));
          }
        },

        onPersonalityEmotionUpdate: (data: PersonalityEmotionEvent) => {
          const validation = validateEvent('personality:emotion:update', data);
          if (validation.isValid) {
            streamingSvc.pushData('emotions', data);
            dispatch(personalitySlice.actions.updateEmotionalState({
              agentId: data.agentId,
              emotions: { emotion: data.emotion, intensity: (data as any).intensity },
              timestamp: data.timestamp
            }));
          }
        },

        onPersonalityMoodUpdate: (data: PersonalityMoodEvent) => {
          const validation = validateEvent('personality:mood:update', data);
          if (validation.isValid) {
            dispatch(personalitySlice.actions.updateMoodState({
              agentId: data.agentId,
              mood: data.mood,
              timestamp: data.timestamp
            }));
          }
        },

        onPersonalityEvolution: (data: any) => {
          const validation = validateEvent('personality:evolution', data);
          if (validation.isValid) {
            dispatch(personalitySlice.actions.updatePersonalityTraits({
              agentId: data.agentId,
              traits: data.traits || (data.evolution?.traits) || {},
              timestamp: data.timestamp,
              influences: [],
              events: []
            }));
          }
        },

        onConnectionStatus: (data: ConnectionStatusEvent) => {
          dispatch(personalitySlice.actions.setStreamingStatus({
            component: 'personality',
            status: data.status,
            lastUpdate: data.timestamp
          }));
        }
      });

      // Connect to socket
      await socketService.connect();

      return { success: true, streamingEnabled: true };
    } catch (error) {
      return rejectWithValue(`Failed to initialize personality streaming: ${error}`);
    }
  }
);

export const subscribeToAgentPersonality = createAsyncThunk(
  'personality/subscribeToAgent',
  async (agentId: string, { dispatch, rejectWithValue }) => {
    try {
      const { enhancedSocketService } = await import('../../services/enhancedSocketService');
      const socketService = enhancedSocketService;
      
      if (!socketService) {
        throw new Error('Enhanced socket service not initialized');
      }

      // Subscribe to specific agent personality updates
      socketService.subscribeToAgent(agentId);
      socketService.subscribeToComponent('personality');

      // Fetch initial personality data for this agent
      await dispatch(fetchPersonalityEvolution(agentId));

      // Set subscription status
      dispatch(personalitySlice.actions.setAgentSubscriptionStatus({
        agentId,
        component: 'personality',
        subscribed: true,
        timestamp: Date.now()
      }));

      return { agentId, subscribed: true };
    } catch (error) {
      return rejectWithValue(`Failed to subscribe to agent ${agentId} personality updates: ${error}`);
    }
  }
);

export const unsubscribeFromAgentPersonality = createAsyncThunk(
  'personality/unsubscribeFromAgent',
  async (agentId: string, { dispatch, rejectWithValue }) => {
    try {
      const { enhancedSocketService } = await import('../../services/enhancedSocketService');
      const socketService = enhancedSocketService;
      
      if (!socketService) {
        throw new Error('Enhanced socket service not initialized');
      }

      // Unsubscribe from specific agent personality updates
      socketService.unsubscribeFromAgent(agentId);
      socketService.unsubscribeFromComponent('personality');

      // Clear agent data from store
      dispatch(personalitySlice.actions.clearAgentData(agentId));

      // Update subscription status
      dispatch(personalitySlice.actions.setAgentSubscriptionStatus({
        agentId,
        component: 'personality',
        subscribed: false,
        timestamp: Date.now()
      }));

      return { agentId, subscribed: false };
    } catch (error) {
      return rejectWithValue(`Failed to unsubscribe from agent ${agentId} personality updates: ${error}`);
    }
  }
);

// Real-time update actions
export const handleRealTimePersonalityUpdate = (data: PersonalityUpdateEvent) =>
  personalitySlice.actions.updatePersonalityTraits(data);

export const handleRealTimePersonalityEvent = (data: { agentId: string; event: PersonalityEvent }) =>
  personalitySlice.actions.addPersonalityEvent(data);

export const handleRealTimePersonalityInfluence = (data: { agentId: string; influence: PersonalityInfluence }) =>
  personalitySlice.actions.addPersonalityInfluence(data);

// Actions
export const {
  selectAgent,
  deselectAgent,
  addToComparison,
  removeFromComparison,
  clearComparison,
  setTimeRange,
  setVisualizationMode,
  setTraitCategories,
  setMinSignificance,
  toggleShowEvents,
  toggleShowInfluences,
  updatePersonalityTraits,
  addPersonalityEvent,
  addPersonalityInfluence,
  setLoading,
  setError,
  clearError,
  clearAgentData,
  clearAllData,
  resetPersonality
} = personalitySlice.actions;

// Enhanced selectors for real-time data
export const selectRealTimePersonalityUpdates = createSelector(
  [selectPersonalityState],
  (personality: PersonalityState) => ({
    lastUpdate: Math.max(...Object.values(personality.agents).map(e => e.timestamp)),
    totalEvents: Object.values(personality.agents).reduce((sum, e) => sum + e.significantEvents.length, 0),
    totalInfluences: Object.values(personality.agents).reduce((sum, e) => sum + e.influences.length, 0),
    activeAgents: Object.keys(personality.agents).length
  })
);

export const selectAgentPersonalityWithRealTimeData = (agentId: string) => createSelector(
  [selectAgentPersonality(agentId), selectRealTimePersonalityUpdates],
  (evolution: PersonalityEvolution | null, realTimeData: any) => {
    if (!evolution) return null;
    
    return {
      ...evolution,
      isRealTime: true,
      lastUpdate: evolution.timestamp,
      recentActivity: evolution.significantEvents.filter(
        event => Date.now() - event.timestamp < 60000 // Last minute
      ).length
    };
  }
);

// Export the state type
export type { PersonalityState };

// Reducer
export default personalitySlice.reducer;
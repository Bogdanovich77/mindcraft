import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  SocialState,
  SocialNetwork,
  SocialRelationship,
  SocialAgent,
  Community,
  InfluenceNetwork,
  TemporalEvolution,
  SocialAnalytics,
  SocialInteractionFilter,
  SocialVisualizationConfig,
  SocialInteraction,
  SocialDataUpdateEvent,
  SocialNetworkUpdateEvent,
  SocialInteractionEvent
} from '../../types/social';
import { getSocketService } from '../../services/socketService';
import { streamingService } from '../../services/streamingService';

const initialVisualizationConfig: SocialVisualizationConfig = {
  networkGraph: {
    nodeSize: 8,
    edgeWidth: 2,
    colorScheme: 'category10',
    layoutAlgorithm: 'force',
    showLabels: true,
    animationSpeed: 1000,
  },
  temporalView: {
    timeRange: {
      start: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      end: Date.now(),
    },
    granularity: 'day',
    showPredictions: true,
    animationEnabled: true,
  },
  influenceMap: {
    heatmapEnabled: true,
    flowVisualization: true,
    threshold: 0.1,
    colorGradient: ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'],
  },
  trustFriendship: {
    showCorrelation: true,
    showDistribution: true,
    colorScheme: 'blue',
    trustThreshold: 0.5,
    friendshipThreshold: 0.5,
    heatmapEnabled: true,
  },
  reputation: {
    showTrends: true,
    showEvents: true,
    colorScheme: 'green',
    threshold: 0.5,
    trendsEnabled: true,
  },
  communityView: {
    clusteringAlgorithm: 'louvain',
    showHierarchy: true,
    colorByCommunity: true,
    communityClustering: true,
    clusterThreshold: 0.5,
    showOverlaps: false,
  },
  communicationAnalysis: {
    showPatterns: true,
    showTimeline: true,
    colorScheme: 'purple',
    timeRange: { start: Date.now() - 7 * 24 * 60 * 60 * 1000, end: Date.now() },
    showOutcomes: true,
  },
};

const initialFilters: SocialInteractionFilter = {
  timeRange: {
    start: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
    end: Date.now(),
  },
  interactionTypes: [],
  participants: [],
  outcomes: [],
  communities: [],
  relationshipTypes: [],
};

const initialState: SocialState = {
  // Current data
  currentNetwork: null,
  selectedAgent: null,
  selectedRelationship: null,
  selectedCommunity: null,
  
  // Historical data
  historicalNetworks: {},
  evolutionData: null,
  
  // Visualization state
  visualizationConfig: initialVisualizationConfig,
  activeFilters: initialFilters,
  
  // Analytics and insights
  analytics: null,
  insights: [],
  
  // UI state
  loading: false,
  error: null,
  lastUpdated: 0,
  
  // Real-time updates
  realTimeUpdates: true,
  updateFrequency: 5000, // 5 seconds
  subscribedAgents: [],
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    // Network management
    setSocialNetwork: (state, action: PayloadAction<SocialNetwork>) => {
      state.currentNetwork = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    
    updateSocialNetwork: (state, action: PayloadAction<Partial<SocialNetwork>>) => {
      if (state.currentNetwork) {
        state.currentNetwork = { ...state.currentNetwork, ...action.payload };
        state.lastUpdated = Date.now();
      }
    },
    
    addHistoricalNetwork: (state, action: PayloadAction<{ timestamp: number; network: SocialNetwork }>) => {
      const { timestamp, network } = action.payload;
      state.historicalNetworks[timestamp] = network;
      
      // Keep only last 100 historical networks to prevent memory issues
      const timestamps = Object.keys(state.historicalNetworks).map(Number);
      if (timestamps.length > 100) {
        const oldestTimestamp = Math.min(...timestamps);
        delete state.historicalNetworks[oldestTimestamp];
      }
    },
    
    clearHistoricalNetworks: (state) => {
      state.historicalNetworks = {};
    },
    
    // Agent management
    addSocialAgent: (state, action: PayloadAction<SocialAgent>) => {
      if (state.currentNetwork) {
        const existingIndex = state.currentNetwork.agents.findIndex(a => a.id === action.payload.id);
        if (existingIndex >= 0) {
          state.currentNetwork.agents[existingIndex] = action.payload;
        } else {
          state.currentNetwork.agents.push(action.payload);
        }
        state.lastUpdated = Date.now();
      }
    },
    
    removeSocialAgent: (state, action: PayloadAction<string>) => {
      if (state.currentNetwork) {
        state.currentNetwork.agents = state.currentNetwork.agents.filter(a => a.id !== action.payload);
        state.currentNetwork.relationships = state.currentNetwork.relationships.filter(
          r => r.agentId !== action.payload && r.targetAgentId !== action.payload
        );
        if (state.selectedAgent === action.payload) {
          state.selectedAgent = null;
        }
        state.lastUpdated = Date.now();
      }
    },
    
    updateSocialAgent: (state, action: PayloadAction<{ agentId: string; updates: Partial<SocialAgent> }>) => {
      if (state.currentNetwork) {
        const { agentId, updates } = action.payload;
        const agentIndex = state.currentNetwork.agents.findIndex(a => a.id === agentId);
        if (agentIndex >= 0) {
          state.currentNetwork.agents[agentIndex] = { 
            ...state.currentNetwork.agents[agentIndex], 
            ...updates 
          };
          state.lastUpdated = Date.now();
        }
      }
    },
    
    // Relationship management
    addSocialRelationship: (state, action: PayloadAction<SocialRelationship>) => {
      if (state.currentNetwork) {
        const existingIndex = state.currentNetwork.relationships.findIndex(
          r => (r.agentId === action.payload.agentId && r.targetAgentId === action.payload.targetAgentId) ||
               (r.agentId === action.payload.targetAgentId && r.targetAgentId === action.payload.agentId)
        );
        
        if (existingIndex >= 0) {
          state.currentNetwork.relationships[existingIndex] = action.payload;
        } else {
          state.currentNetwork.relationships.push(action.payload);
        }
        state.lastUpdated = Date.now();
      }
    },
    
    removeSocialRelationship: (state, action: PayloadAction<string>) => {
      if (state.currentNetwork) {
        state.currentNetwork.relationships = state.currentNetwork.relationships.filter(
          r => r.id !== action.payload
        );
        if (state.selectedRelationship === action.payload) {
          state.selectedRelationship = null;
        }
        state.lastUpdated = Date.now();
      }
    },
    
    updateSocialRelationship: (state, action: PayloadAction<{ relationshipId: string; updates: Partial<SocialRelationship> }>) => {
      if (state.currentNetwork) {
        const { relationshipId, updates } = action.payload;
        const relationshipIndex = state.currentNetwork.relationships.findIndex(r => r.id === relationshipId);
        if (relationshipIndex >= 0) {
          state.currentNetwork.relationships[relationshipIndex] = { 
            ...state.currentNetwork.relationships[relationshipIndex], 
            ...updates 
          };
          state.lastUpdated = Date.now();
        }
      }
    },
    
    addSocialInteraction: (state, action: PayloadAction<{ relationshipId: string; interaction: SocialInteraction }>) => {
      if (state.currentNetwork) {
        const { relationshipId, interaction } = action.payload;
        const relationship = state.currentNetwork.relationships.find(r => r.id === relationshipId);
        if (relationship) {
          relationship.interactions.push(interaction);
          relationship.lastInteraction = interaction.timestamp;
          state.lastUpdated = Date.now();
        }
      }
    },
    
    // Community management
    addCommunity: (state, action: PayloadAction<Community>) => {
      if (state.currentNetwork) {
        const existingIndex = state.currentNetwork.communities.findIndex(c => c.id === action.payload.id);
        if (existingIndex >= 0) {
          state.currentNetwork.communities[existingIndex] = action.payload;
        } else {
          state.currentNetwork.communities.push(action.payload);
        }
        state.lastUpdated = Date.now();
      }
    },
    
    removeCommunity: (state, action: PayloadAction<string>) => {
      if (state.currentNetwork) {
        state.currentNetwork.communities = state.currentNetwork.communities.filter(c => c.id !== action.payload);
        if (state.selectedCommunity === action.payload) {
          state.selectedCommunity = null;
        }
        state.lastUpdated = Date.now();
      }
    },
    
    updateCommunity: (state, action: PayloadAction<{ communityId: string; updates: Partial<Community> }>) => {
      if (state.currentNetwork) {
        const { communityId, updates } = action.payload;
        const communityIndex = state.currentNetwork.communities.findIndex(c => c.id === communityId);
        if (communityIndex >= 0) {
          state.currentNetwork.communities[communityIndex] = { 
            ...state.currentNetwork.communities[communityIndex], 
            ...updates 
          };
          state.lastUpdated = Date.now();
        }
      }
    },
    
    // Influence network management
    setInfluenceNetwork: (state, action: PayloadAction<InfluenceNetwork>) => {
      if (state.currentNetwork) {
        state.currentNetwork.influenceNetwork = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    
    updateInfluenceNetwork: (state, action: PayloadAction<Partial<InfluenceNetwork>>) => {
      if (state.currentNetwork && state.currentNetwork.influenceNetwork) {
        state.currentNetwork.influenceNetwork = { 
          ...state.currentNetwork.influenceNetwork, 
          ...action.payload 
        };
        state.lastUpdated = Date.now();
      }
    },
    
    // Evolution data management
    setEvolutionData: (state, action: PayloadAction<TemporalEvolution>) => {
      state.evolutionData = action.payload;
    },
    
    updateEvolutionData: (state, action: PayloadAction<Partial<TemporalEvolution>>) => {
      if (state.evolutionData) {
        state.evolutionData = { ...state.evolutionData, ...action.payload };
      }
    },
    
    addTimePoint: (state, action: PayloadAction<{ timestamp: number; network: SocialNetwork }>) => {
      if (state.evolutionData) {
        // This would need to be implemented based on the specific TimePoint structure
        state.lastUpdated = Date.now();
      }
    },
    
    // Analytics management
    setSocialAnalytics: (state, action: PayloadAction<SocialAnalytics>) => {
      state.analytics = action.payload;
    },
    
    updateSocialAnalytics: (state, action: PayloadAction<Partial<SocialAnalytics>>) => {
      if (state.analytics) {
        state.analytics = { ...state.analytics, ...action.payload };
      }
    },
    
    addInsight: (state, action: PayloadAction<string>) => {
      state.insights.push(action.payload);
      // Keep only last 50 insights
      if (state.insights.length > 50) {
        state.insights = state.insights.slice(-50);
      }
    },
    
    clearInsights: (state) => {
      state.insights = [];
    },
    
    // Selection management
    selectSocialAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgent = action.payload;
      // Clear other selections when selecting an agent
      state.selectedRelationship = null;
      state.selectedCommunity = null;
    },
    
    selectSocialRelationship: (state, action: PayloadAction<string>) => {
      state.selectedRelationship = action.payload;
      // Clear other selections when selecting a relationship
      state.selectedAgent = null;
      state.selectedCommunity = null;
    },
    
    selectSocialCommunity: (state, action: PayloadAction<string>) => {
      state.selectedCommunity = action.payload;
      // Clear other selections when selecting a community
      state.selectedAgent = null;
      state.selectedRelationship = null;
    },
    
    clearSelections: (state) => {
      state.selectedAgent = null;
      state.selectedRelationship = null;
      state.selectedCommunity = null;
    },
    
    // Configuration management
    updateVisualizationConfig: (state, action: PayloadAction<Partial<SocialVisualizationConfig>>) => {
      state.visualizationConfig = { ...state.visualizationConfig, ...action.payload };
    },
    
    updateNetworkGraphConfig: (state, action: PayloadAction<Partial<SocialVisualizationConfig['networkGraph']>>) => {
      state.visualizationConfig.networkGraph = { 
        ...state.visualizationConfig.networkGraph, 
        ...action.payload 
      };
    },
    
    updateTemporalViewConfig: (state, action: PayloadAction<Partial<SocialVisualizationConfig['temporalView']>>) => {
      state.visualizationConfig.temporalView = { 
        ...state.visualizationConfig.temporalView, 
        ...action.payload 
      };
    },
    
    updateInfluenceMapConfig: (state, action: PayloadAction<Partial<SocialVisualizationConfig['influenceMap']>>) => {
      state.visualizationConfig.influenceMap = { 
        ...state.visualizationConfig.influenceMap, 
        ...action.payload 
      };
    },
    
    updateCommunityViewConfig: (state, action: PayloadAction<Partial<SocialVisualizationConfig['communityView']>>) => {
      state.visualizationConfig.communityView = { 
        ...state.visualizationConfig.communityView, 
        ...action.payload 
      };
    },
    
    // Filter management
    setFilters: (state, action: PayloadAction<SocialInteractionFilter>) => {
      state.activeFilters = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<SocialInteractionFilter>>) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.activeFilters = initialFilters;
    },
    
    // Real-time updates management
    setRealTimeUpdates: (state, action: PayloadAction<boolean>) => {
      state.realTimeUpdates = action.payload;
    },
    
    setUpdateFrequency: (state, action: PayloadAction<number>) => {
      state.updateFrequency = action.payload;
    },
    
    subscribeToAgent: (state, action: PayloadAction<string>) => {
      if (!state.subscribedAgents.includes(action.payload)) {
        state.subscribedAgents.push(action.payload);
      }
    },
    
    unsubscribeFromAgent: (state, action: PayloadAction<string>) => {
      state.subscribedAgents = state.subscribedAgents.filter(id => id !== action.payload);
    },
    
    setSubscribedAgents: (state, action: PayloadAction<string[]>) => {
      state.subscribedAgents = action.payload;
    },
    
    // UI state management
    setSocialLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setSocialError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearSocialError: (state) => {
      state.error = null;
    },
    
    // Socket.IO event handlers
    handleSocialDataUpdate: (state, action: PayloadAction<SocialDataUpdateEvent>) => {
      const { agentId, type, data } = action.payload;
      
      switch (type) {
        case 'relationship_update':
          if (state.currentNetwork) {
            const relationshipIndex = state.currentNetwork.relationships.findIndex(r => r.id === data.id);
            if (relationshipIndex >= 0) {
              state.currentNetwork.relationships[relationshipIndex] = data;
            }
          }
          break;
          
        case 'interaction_added':
          // Add interaction to appropriate relationship
          if (state.currentNetwork) {
            const relationship = state.currentNetwork.relationships.find(r => 
              (r.agentId === data.source && r.targetAgentId === data.target) ||
              (r.agentId === data.target && r.targetAgentId === data.source)
            );
            if (relationship) {
              relationship.interactions.push(data.interaction);
              relationship.lastInteraction = data.interaction.timestamp;
            }
          }
          break;
          
        case 'influence_change':
          if (state.currentNetwork && state.currentNetwork.influenceNetwork) {
            // Update influence metrics
            const influenceNode = state.currentNetwork.influenceNetwork.nodes.find(n => n.agentId === agentId);
            if (influenceNode) {
              influenceNode.influenceScore = data.newInfluenceScore;
            }
          }
          break;
          
        case 'community_update':
          if (state.currentNetwork) {
            const communityIndex = state.currentNetwork.communities.findIndex(c => c.id === data.id);
            if (communityIndex >= 0) {
              state.currentNetwork.communities[communityIndex] = data;
            }
          }
          break;
      }
      
      state.lastUpdated = Date.now();
    },
    
    handleSocialNetworkUpdate: (state, action: PayloadAction<SocialNetworkUpdateEvent>) => {
      if (state.currentNetwork) {
        const { changes } = action.payload;
        
        if (changes.addedAgents) {
          state.currentNetwork.agents.push(...changes.addedAgents);
        }
        
        if (changes.removedAgents) {
          state.currentNetwork.agents = state.currentNetwork.agents.filter(
            a => !changes.removedAgents!.includes(a.id)
          );
        }
        
        if (changes.addedRelationships) {
          state.currentNetwork.relationships.push(...changes.addedRelationships);
        }
        
        if (changes.removedRelationships) {
          state.currentNetwork.relationships = state.currentNetwork.relationships.filter(
            r => !changes.removedRelationships!.includes(r.id)
          );
        }
        
        if (changes.updatedRelationships) {
          changes.updatedRelationships.forEach(updated => {
            const index = state.currentNetwork!.relationships.findIndex(r => r.id === updated.id);
            if (index >= 0) {
              state.currentNetwork!.relationships[index] = updated;
            }
          });
        }
        
        state.lastUpdated = Date.now();
      }
    },
    
    handleSocialInteractionEvent: (state, action: PayloadAction<SocialInteractionEvent>) => {
      const { interaction, impact } = action.payload;
      
      if (state.currentNetwork) {
        // Add interaction to appropriate relationship
        const relationship = state.currentNetwork.relationships.find(r => 
          (r.agentId === interaction.participants[0] && r.targetAgentId === interaction.participants[1]) ||
          (r.agentId === interaction.participants[1] && r.targetAgentId === interaction.participants[0])
        );
        
        if (relationship) {
          relationship.interactions.push(interaction);
          relationship.lastInteraction = interaction.timestamp;
          
          // Apply impact to relationship metrics
          relationship.trustLevel = Math.max(0, Math.min(1, 
            relationship.trustLevel + (impact.trustChanges[relationship.id] || 0)
          ));
        }
        
        // Update agent social stats
        interaction.participants.forEach(participantId => {
          const agent = state.currentNetwork!.agents.find(a => a.id === participantId);
          if (agent) {
            const reputationChange = impact.reputationChanges[participantId] || 0;
            agent.socialStats.reputationScore = Math.max(0, Math.min(1, 
              agent.socialStats.reputationScore + reputationChange
            ));
          }
        });
        
        state.lastUpdated = Date.now();
      }
    },
    
    // Reset state
    resetSocialState: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setSocialNetwork,
  updateSocialNetwork,
  addHistoricalNetwork,
  clearHistoricalNetworks,
  addSocialAgent,
  removeSocialAgent,
  updateSocialAgent,
  addSocialRelationship,
  removeSocialRelationship,
  updateSocialRelationship,
  addSocialInteraction,
  addCommunity,
  removeCommunity,
  updateCommunity,
  setInfluenceNetwork,
  updateInfluenceNetwork,
  setEvolutionData,
  updateEvolutionData,
  addTimePoint,
  setSocialAnalytics,
  updateSocialAnalytics,
  addInsight,
  clearInsights,
  selectSocialAgent,
  selectSocialRelationship,
  selectSocialCommunity,
  clearSelections,
  updateVisualizationConfig,
  updateNetworkGraphConfig,
  updateTemporalViewConfig,
  updateInfluenceMapConfig,
  updateCommunityViewConfig,
  setFilters,
  updateFilters,
  resetFilters,
  setRealTimeUpdates,
  setUpdateFrequency,
  subscribeToAgent,
  unsubscribeFromAgent,
  setSubscribedAgents,
  setSocialLoading,
  setSocialError,
  clearSocialError,
  handleSocialDataUpdate,
  handleSocialNetworkUpdate,
  handleSocialInteractionEvent,
  resetSocialState,
} = socialSlice.actions;

// Export social actions object for easier importing
export const socialActions = {
  setSocialNetwork,
  updateSocialNetwork,
  addHistoricalNetwork,
  clearHistoricalNetworks,
  addSocialAgent,
  removeSocialAgent,
  updateSocialAgent,
  addSocialRelationship,
  removeSocialRelationship,
  updateSocialRelationship,
  addSocialInteraction,
  addCommunity,
  removeCommunity,
  updateCommunity,
  setInfluenceNetwork,
  updateInfluenceNetwork,
  setEvolutionData,
  updateEvolutionData,
  addTimePoint,
  setSocialAnalytics,
  updateSocialAnalytics,
  addInsight,
  clearInsights,
  selectSocialAgent,
  selectSocialRelationship,
  selectSocialCommunity,
  clearSelections,
  updateVisualizationConfig,
  updateNetworkGraphConfig,
  updateTemporalViewConfig,
  updateInfluenceMapConfig,
  updateCommunityViewConfig,
  setFilters,
  updateFilters,
  resetFilters,
  setRealTimeUpdates,
  setUpdateFrequency,
  subscribeToAgent,
  unsubscribeFromAgent,
  setSubscribedAgents,
  setSocialLoading,
  setSocialError,
  clearSocialError,
  handleSocialDataUpdate,
  handleSocialNetworkUpdate,
  handleSocialInteractionEvent,
  resetSocialState,
};

// Async thunks for Socket.IO integration
export const initializeSocialSocket = createAsyncThunk(
  'social/initializeSocket',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Note: Streams are now created centrally in App.tsx to avoid duplicates
      // streamingService.createStream('social', 'social', {
      //   window: 1000,
      //   enabled: true,
      //   function: (events) => events[events.length - 1] // Keep latest
      // });

      // Register event handlers
      const socketService = getSocketService();
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Social relationship updates
      socketService.on('social:relationship:update', (event: SocialDataUpdateEvent) => {
        // Handle relationship update based on event data
        if (event.type === 'relationship_update' && event.data) {
          dispatch(updateSocialRelationship({
            relationshipId: (event.data as any).id,
            updates: event.data as any
          }));
        }
      });

      // Social interaction events
      socketService.on('social:interaction:event', (event: SocialInteractionEvent) => {
        dispatch(handleSocialInteractionEvent({
          interaction: event.interaction,
          impact: event.impact,
          timestamp: event.timestamp
        }));
      });

      // Social network changes
      socketService.on('social:network:update', (event: SocialNetworkUpdateEvent) => {
        dispatch(handleSocialNetworkUpdate({
          networkId: 'default',
          timestamp: event.timestamp,
          changes: event.changes
        }));
      });

      // Agent social data updates
      socketService.on('social:agent:update', (event: { agentId: string; updates: Partial<SocialAgent> }) => {
        dispatch(updateSocialAgent({
          agentId: event.agentId,
          updates: event.updates
        }));
      });

      // Community updates
      socketService.on('social:community:update', (event: { communityId: string; updates: Partial<Community> }) => {
        dispatch(updateCommunity({
          communityId: event.communityId,
          updates: event.updates
        }));
      });

      // Influence network updates
      socketService.on('social:influence:update', (event: { updates: Partial<InfluenceNetwork> }) => {
        dispatch(updateInfluenceNetwork(event.updates));
      });

      // Social analytics updates
      socketService.on('social:analytics:update', (event: { analytics: Partial<SocialAnalytics> }) => {
        dispatch(updateSocialAnalytics(event.analytics));
      });

      // Evolution data updates
      socketService.on('social:evolution:update', (event: { evolutionData: Partial<TemporalEvolution> }) => {
        dispatch(updateEvolutionData(event.evolutionData));
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize social socket:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const subscribeToSocialAgent = createAsyncThunk(
  'social/subscribeToAgent',
  async (agentId: string, { dispatch, rejectWithValue }) => {
    try {
      const socketService = getSocketService();
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Subscribe to agent-specific social events
      socketService.send('social:subscribe', { agentId });
      
      // Handle agent-specific updates
      const handleAgentUpdate = (event: any) => {
        if (event.agentId === agentId) {
          dispatch(handleSocialDataUpdate(event));
        }
      };

      socketService.on('social:agent:update', handleAgentUpdate);

      return agentId;
    } catch (error) {
      console.error('Failed to subscribe to social agent:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const unsubscribeFromSocialAgent = createAsyncThunk(
  'social/unsubscribeFromAgent',
  async (agentId: string, { dispatch, rejectWithValue }) => {
    try {
      const socketService = getSocketService();
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Unsubscribe from agent-specific events
      socketService.send('social:unsubscribe', { agentId });
      
      // Remove event listeners
      socketService.off('social:agent:update');

      dispatch(unsubscribeFromAgent(agentId));

      return agentId;
    } catch (error) {
      console.error('Failed to unsubscribe from social agent:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Export the type for use in other components
export type { SocialState };

export default socialSlice.reducer;

// Selectors
export const selectCurrentNetwork = (state: { social: SocialState }) => state.social.currentNetwork;
export const selectSelectedSocialAgent = (state: { social: SocialState }) => {
  const selectedId = state.social.selectedAgent;
  return selectedId && state.social.currentNetwork 
    ? state.social.currentNetwork.agents.find(a => a.id === selectedId) || null 
    : null;
};
export const selectSelectedSocialRelationship = (state: { social: SocialState }) => {
  const selectedId = state.social.selectedRelationship;
  return selectedId && state.social.currentNetwork 
    ? state.social.currentNetwork.relationships.find(r => r.id === selectedId) || null 
    : null;
};
export const selectSelectedSocialCommunity = (state: { social: SocialState }) => {
  const selectedId = state.social.selectedCommunity;
  return selectedId && state.social.currentNetwork 
    ? state.social.currentNetwork.communities.find(c => c.id === selectedId) || null 
    : null;
};
export const selectSocialAgents = (state: { social: SocialState }) => 
  state.social.currentNetwork?.agents || [];
export const selectSocialRelationships = (state: { social: SocialState }) => 
  state.social.currentNetwork?.relationships || [];
export const selectSocialCommunities = (state: { social: SocialState }) => 
  state.social.currentNetwork?.communities || [];
export const selectInfluenceNetwork = (state: { social: SocialState }) => 
  state.social.currentNetwork?.influenceNetwork || null;
export const selectEvolutionData = (state: { social: SocialState }) => state.social.evolutionData;
export const selectSocialAnalytics = (state: { social: SocialState }) => state.social.analytics;
export const selectSocialInsights = (state: { social: SocialState }) => state.social.insights;
export const selectVisualizationConfig = (state: { social: SocialState }) => state.social.visualizationConfig;
export const selectSocialFilters = (state: { social: SocialState }) => state.social.activeFilters;
export const selectSocialLoading = (state: { social: SocialState }) => state.social.loading;
export const selectSocialError = (state: { social: SocialState }) => state.social.error;
export const selectSocialLastUpdated = (state: { social: SocialState }) => state.social.lastUpdated;
export const selectRealTimeUpdates = (state: { social: SocialState }) => state.social.realTimeUpdates;
export const selectUpdateFrequency = (state: { social: SocialState }) => state.social.updateFrequency;
export const selectSubscribedAgents = (state: { social: SocialState }) => state.social.subscribedAgents;
export const selectHistoricalNetworks = (state: { social: SocialState }) => state.social.historicalNetworks;

// Complex selectors
export const selectAgentRelationships = (state: { social: SocialState }, agentId: string) => {
  const relationships = state.social.currentNetwork?.relationships || [];
  return relationships.filter(r => r.agentId === agentId || r.targetAgentId === agentId);
};

export const selectAgentCommunities = (state: { social: SocialState }, agentId: string) => {
  const communities = state.social.currentNetwork?.communities || [];
  return communities.filter(c => c.members.includes(agentId));
};

export const selectCommunityMembers = (state: { social: SocialState }, communityId: string) => {
  const community = state.social.currentNetwork?.communities.find(c => c.id === communityId);
  const agents = state.social.currentNetwork?.agents || [];
  return community ? agents.filter(a => community.members.includes(a.id)) : [];
};

export const selectFilteredInteractions = (state: { social: SocialState }) => {
  const relationships = state.social.currentNetwork?.relationships || [];
  const filters = state.social.activeFilters;
  
  let allInteractions: SocialInteraction[] = [];
  relationships.forEach(r => {
    allInteractions.push(...r.interactions);
  });
  
  // Apply filters
  return allInteractions.filter(interaction => {
    // Time range filter
    if (interaction.timestamp < filters.timeRange.start || 
        interaction.timestamp > filters.timeRange.end) {
      return false;
    }
    
    // Interaction type filter
    if (filters.interactionTypes.length > 0 && 
        !filters.interactionTypes.includes(interaction.type)) {
      return false;
    }
    
    // Participants filter
    if (filters.participants.length > 0 && 
        !interaction.participants.some(p => filters.participants.includes(p))) {
      return false;
    }
    
    // Outcome filter
    if (filters.outcomes.length > 0 && 
        !filters.outcomes.includes(interaction.outcome)) {
      return false;
    }
    
    return true;
  });
};

export const selectNetworkMetrics = (state: { social: SocialState }) => {
  const network = state.social.currentNetwork;
  if (!network) return null;
  
  const agentCount = network.agents.length;
  const relationshipCount = network.relationships.length;
  const communityCount = network.communities.length;
  
  // Calculate basic metrics
  const density = agentCount > 1 ? (2 * relationshipCount) / (agentCount * (agentCount - 1)) : 0;
  
  const averageTrustLevel = relationshipCount > 0 
    ? network.relationships.reduce((sum, r) => sum + r.trustLevel, 0) / relationshipCount 
    : 0;
  
  const averageReputation = agentCount > 0 
    ? network.agents.reduce((sum, a) => sum + a.socialStats.reputationScore, 0) / agentCount 
    : 0;
  
  return {
    agentCount,
    relationshipCount,
    communityCount,
    density,
    averageTrustLevel,
    averageReputation,
    lastUpdated: state.social.lastUpdated,
  };
};
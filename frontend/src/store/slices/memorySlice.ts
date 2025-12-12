/**
 * Redux Memory Slice
 * Manages memory system state for the cognitive dashboard
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  MemorySystem,
  MemorySearchQuery,
  MemorySearchResult,
  MemoryVisualizationConfig,
  MemoryPerformanceMetrics,
  MemoryVisualizationPerformance,
  ConsolidationEvent,
} from '../../types/memory';
import { MemoryType } from '../../types/memory';
import { streamingService } from '../../services/streamingService';
import {
  validateEvent,
  sanitizeEvent,
  processEvent
} from '../../utils/eventValidation';

// Async thunks for memory operations
export const fetchMemorySystem = createAsyncThunk(
  'memory/fetchMemorySystem',
  async (agentId: string, { rejectWithValue }) => {
    try {
      // This would connect to the backend Socket.IO service
      // For now, returning mock data
      const mockMemorySystem: MemorySystem = {
        semantic: {
          concepts: [],
          relationships: [],
          knowledgeGraph: {
            concepts: [],
            relationships: [],
            clusters: [],
            metrics: {
              totalConcepts: 0,
              totalRelationships: 0,
              averageConnections: 0,
              clusteringCoefficient: 0,
              graphDensity: 0
            }
          },
          consolidationHistory: []
        },
        episodic: {
          events: [],
          experiences: [],
          timeline: {
            events: [],
            experiences: [],
            timeRange: { start: Date.now() - 86400000, end: Date.now() },
            significantEvents: [],
            patterns: []
          },
          emotionalHistory: [],
          socialInteractions: []
        },
        procedural: {
          skills: [],
          patterns: [],
          sequences: [],
          executionHistory: [],
          adaptationHistory: []
        },
        working: {
          currentFocus: '',
          activeTasks: [],
          attentionBuffer: [],
          shortTermMemory: [],
          cognitiveLoad: 0,
          processingCapacity: 1
        },
        consolidation: [],
        analytics: {
          accessPatterns: [],
          strengthDistribution: {
            memoryType: MemoryType.SEMANTIC,
            ranges: [],
            average: 0,
            median: 0,
            standardDeviation: 0
          },
          decayAnalysis: {
            memoryType: MemoryType.SEMANTIC,
            averageDecayRate: 0,
            criticalMemories: [],
            decayTrends: [],
            recommendations: []
          },
          consolidationMetrics: {
            totalEvents: 0,
            successRate: 0,
            averageDuration: 0,
            efficiencyByType: { 
              semantic_extraction: 0, 
              episodic_to_semantic: 0, 
              procedural_refinement: 0, 
              memory_forgetting: 0, 
              memory_reorganization: 0 
            },
            bottlenecks: []
          },
          correlationAnalysis: {
            correlations: [],
            insights: [],
            predictions: []
          }
        },
        lastUpdate: Date.now()
      };
      
      return { agentId, memorySystem: mockMemorySystem };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch memory system');
    }
  }
);

export const searchMemories = createAsyncThunk(
  'memory/searchMemories',
  async ({ agentId, query }: { agentId: string; query: MemorySearchQuery }, { rejectWithValue }) => {
    try {
      // This would connect to the backend search API
      const mockSearchResult: MemorySearchResult = {
        memories: [],
        totalCount: 0,
        suggestions: [],
        relatedQueries: []
      };
      
      return { agentId, query, result: mockSearchResult };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Search failed');
    }
  }
);

export const updateVisualizationConfig = createAsyncThunk(
  'memory/updateVisualizationConfig',
  async ({ agentId, config }: { agentId: string; config: MemoryVisualizationConfig }, { rejectWithValue }) => {
    try {
      // This would save the configuration to the backend
      return { agentId, config };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update configuration');
    }
  }
);

export const triggerMemoryConsolidation = createAsyncThunk(
  'memory/triggerConsolidation',
  async ({ agentId }: { agentId: string; type: string }, { rejectWithValue }) => {
    try {
      // This would trigger consolidation on the backend
      const mockConsolidationEvent: ConsolidationEvent = {
        id: `consolidation_${Date.now()}`,
        timestamp: Date.now(),
        strength: 0,
        decayRate: 0,
        lastAccessed: Date.now(),
        accessCount: 0,
        type: 'semantic_extraction' as any,
        sourceMemoryIds: [],
        process: {
          strategy: 'spaced_repetition' as any,
          parameters: {},
          stages: [],
          duration: 0
        },
        outcome: 'success' as any
      };
      
      return { agentId, consolidationEvent: mockConsolidationEvent };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Consolidation failed');
    }
  }
);

// Socket.IO initialization thunk
export const initializeMemorySocket = createAsyncThunk(
  'memory/initializeMemorySocket',
  async (_, { rejectWithValue }) => {
    try {
      // Import socketService dynamically to avoid circular dependencies
      const { getSocketService } = await import('../../services/socketService');
      const socketService = getSocketService();
      
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Register memory event handlers with error handling
      const memoryEvents = [
        'streaming:memory:semantic',
        'streaming:memory:episodic', 
        'streaming:memory:procedural',
        'streaming:memory:consolidation'
      ];

      for (const eventType of memoryEvents) {
        try {
          socketService.on(eventType, (event: any) => {
            console.log(`Memory ${eventType.split(':')[2]} update:`, event);
          });
        } catch (error) {
          console.warn(`⚠️ Failed to subscribe to ${eventType}:`, error);
          // Continue with other events even if one fails
        }
      }

      console.log('✅ Memory streaming initialized (with possible missing streams)');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize memory streaming:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize memory streaming');
    }
  }
);

// State interface
export interface MemoryState {
  // Memory data by agent
  memorySystems: Record<string, MemorySystem>;
  
  // Visualization state
  visualizationConfigs: Record<string, MemoryVisualizationConfig>;
  selectedMemories: Record<string, string[]>;
  activeFilters: Record<string, any>;
  
  // Search state
  searchResults: Record<string, MemorySearchResult>;
  searchQueries: Record<string, MemorySearchQuery>;
  isSearching: Record<string, boolean>;
  
  // Performance metrics
  performanceMetrics: Record<string, MemoryPerformanceMetrics>;
  visualizationPerformance: Record<string, MemoryVisualizationPerformance>;
  
  // Loading states
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  
  // Real-time updates
  lastUpdate: number;
  isRealTimeEnabled: boolean;
  updateFrequency: number;
}

// Initial state
const initialState: MemoryState = {
  memorySystems: {},
  visualizationConfigs: {},
  selectedMemories: {},
  activeFilters: {},
  searchResults: {},
  searchQueries: {},
  isSearching: {},
  performanceMetrics: {},
  visualizationPerformance: {},
  loading: {},
  error: {},
  lastUpdate: Date.now(),
  isRealTimeEnabled: true,
  updateFrequency: 1000 // 1 second
};

// Default visualization configuration
const defaultVisualizationConfig: MemoryVisualizationConfig = {
  layout: {
    type: 'force_directed' as any,
    spacing: 100,
    clustering: true,
    hierarchical: false,
    dimensions: 3
  },
  filters: [],
  colorScheme: {
    primary: '#1976d2',
    secondary: '#dc004e',
    accent: '#ff9800',
    background: '#fafafa',
    text: '#212121',
    memoryTypeColors: {
      semantic: '#2196f3',
      episodic: '#4caf50',
      procedural: '#ff9800',
      working: '#9c27b0'
    }
  },
  animation: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
    stagger: 50
  },
  interaction: {
    hoverEnabled: true,
    clickEnabled: true,
    dragEnabled: true,
    zoomEnabled: true,
    selectionEnabled: true
  }
};

// Slice definition
const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    // Real-time update actions
    updateMemorySystem: (state, action: PayloadAction<{ agentId: string; memorySystem: Partial<MemorySystem> }>) => {
      const { agentId, memorySystem } = action.payload;
      if (state.memorySystems[agentId]) {
        state.memorySystems[agentId] = {
          ...state.memorySystems[agentId],
          ...memorySystem,
          lastUpdate: Date.now()
        };
      } else {
        state.memorySystems[agentId] = {
          ...(memorySystem as MemorySystem),
          lastUpdate: Date.now()
        };
      }
      state.lastUpdate = Date.now();
    },

    // Socket.IO event actions
    updateSemanticMemory: (state, action: PayloadAction<{ agentId: string; semanticData: any }>) => {
      const { agentId, semanticData } = action.payload;
      if (!state.memorySystems[agentId]) {
        state.memorySystems[agentId] = {
          semantic: { concepts: [], relationships: [], knowledgeGraph: { concepts: [], relationships: [], clusters: [], metrics: { totalConcepts: 0, totalRelationships: 0, averageConnections: 0, clusteringCoefficient: 0, graphDensity: 0 } }, consolidationHistory: [] },
          episodic: { events: [], experiences: [], timeline: { events: [], experiences: [], timeRange: { start: Date.now() - 86400000, end: Date.now() }, significantEvents: [], patterns: [] }, emotionalHistory: [], socialInteractions: [] },
          procedural: { skills: [], patterns: [], sequences: [], executionHistory: [], adaptationHistory: [] },
          working: { currentFocus: '', activeTasks: [], attentionBuffer: [], shortTermMemory: [], cognitiveLoad: 0, processingCapacity: 1 },
          consolidation: [],
          analytics: {
            accessPatterns: [],
            strengthDistribution: { memoryType: MemoryType.SEMANTIC, ranges: [], average: 0, median: 0, standardDeviation: 0 },
            decayAnalysis: { memoryType: MemoryType.SEMANTIC, averageDecayRate: 0, criticalMemories: [], decayTrends: [], recommendations: [] },
            consolidationMetrics: { totalEvents: 0, successRate: 0, averageDuration: 0, efficiencyByType: { semantic_extraction: 0, episodic_to_semantic: 0, procedural_refinement: 0, memory_forgetting: 0, memory_reorganization: 0 }, bottlenecks: [] as any[] },
            correlationAnalysis: { correlations: [], insights: [], predictions: [] }
          },
          lastUpdate: Date.now()
        };
      }
      state.memorySystems[agentId].semantic = {
        ...state.memorySystems[agentId].semantic,
        ...semanticData
      };
      state.lastUpdate = Date.now();
    },

    updateEpisodicMemory: (state, action: PayloadAction<{ agentId: string; episodicData: any }>) => {
      const { agentId, episodicData } = action.payload;
      if (!state.memorySystems[agentId]) {
        state.memorySystems[agentId] = {
          semantic: { concepts: [], relationships: [], knowledgeGraph: { concepts: [], relationships: [], clusters: [], metrics: { totalConcepts: 0, totalRelationships: 0, averageConnections: 0, clusteringCoefficient: 0, graphDensity: 0 } }, consolidationHistory: [] },
          episodic: { events: [], experiences: [], timeline: { events: [], experiences: [], timeRange: { start: Date.now() - 86400000, end: Date.now() }, significantEvents: [], patterns: [] }, emotionalHistory: [], socialInteractions: [] },
          procedural: { skills: [], patterns: [], sequences: [], executionHistory: [], adaptationHistory: [] },
          working: { currentFocus: '', activeTasks: [], attentionBuffer: [], shortTermMemory: [], cognitiveLoad: 0, processingCapacity: 1 },
          consolidation: [],
          analytics: {
            accessPatterns: [],
            strengthDistribution: { memoryType: MemoryType.SEMANTIC, ranges: [], average: 0, median: 0, standardDeviation: 0 },
            decayAnalysis: { memoryType: MemoryType.SEMANTIC, averageDecayRate: 0, criticalMemories: [], decayTrends: [], recommendations: [] },
            consolidationMetrics: { totalEvents: 0, successRate: 0, averageDuration: 0, efficiencyByType: {} as any, bottlenecks: [] as any[] },
            correlationAnalysis: { correlations: [], insights: [], predictions: [] }
          },
          lastUpdate: Date.now()
        };
      }
      state.memorySystems[agentId].episodic = {
        ...state.memorySystems[agentId].episodic,
        ...episodicData
      };
      state.lastUpdate = Date.now();
    },

    updateProceduralMemory: (state, action: PayloadAction<{ agentId: string; proceduralData: any }>) => {
      const { agentId, proceduralData } = action.payload;
      if (!state.memorySystems[agentId]) {
        state.memorySystems[agentId] = {
          semantic: { concepts: [], relationships: [], knowledgeGraph: { concepts: [], relationships: [], clusters: [], metrics: { totalConcepts: 0, totalRelationships: 0, averageConnections: 0, clusteringCoefficient: 0, graphDensity: 0 } }, consolidationHistory: [] },
          episodic: { events: [], experiences: [], timeline: { events: [], experiences: [], timeRange: { start: Date.now() - 86400000, end: Date.now() }, significantEvents: [], patterns: [] }, emotionalHistory: [], socialInteractions: [] },
          procedural: { skills: [], patterns: [], sequences: [], executionHistory: [], adaptationHistory: [] },
          working: { currentFocus: '', activeTasks: [], attentionBuffer: [], shortTermMemory: [], cognitiveLoad: 0, processingCapacity: 1 },
          consolidation: [],
          analytics: {
            accessPatterns: [],
            strengthDistribution: { memoryType: MemoryType.SEMANTIC, ranges: [], average: 0, median: 0, standardDeviation: 0 },
            decayAnalysis: { memoryType: MemoryType.SEMANTIC, averageDecayRate: 0, criticalMemories: [], decayTrends: [], recommendations: [] },
            consolidationMetrics: { totalEvents: 0, successRate: 0, averageDuration: 0, efficiencyByType: {} as any, bottlenecks: [] as any[] },
            correlationAnalysis: { correlations: [], insights: [], predictions: [] }
          },
          lastUpdate: Date.now()
        };
      }
      state.memorySystems[agentId].procedural = {
        ...state.memorySystems[agentId].procedural,
        ...proceduralData
      };
      state.lastUpdate = Date.now();
    },

    addConsolidationEvent: (state, action: PayloadAction<{ agentId: string; consolidationEvent: ConsolidationEvent }>) => {
      const { agentId, consolidationEvent } = action.payload;
      if (!state.memorySystems[agentId]) {
        state.memorySystems[agentId] = {
          semantic: { concepts: [], relationships: [], knowledgeGraph: { concepts: [], relationships: [], clusters: [], metrics: { totalConcepts: 0, totalRelationships: 0, averageConnections: 0, clusteringCoefficient: 0, graphDensity: 0 } }, consolidationHistory: [] },
          episodic: { events: [], experiences: [], timeline: { events: [], experiences: [], timeRange: { start: Date.now() - 86400000, end: Date.now() }, significantEvents: [], patterns: [] }, emotionalHistory: [], socialInteractions: [] },
          procedural: { skills: [], patterns: [], sequences: [], executionHistory: [], adaptationHistory: [] },
          working: { currentFocus: '', activeTasks: [], attentionBuffer: [], shortTermMemory: [], cognitiveLoad: 0, processingCapacity: 1 },
          consolidation: [],
          analytics: {
            accessPatterns: [],
            strengthDistribution: { memoryType: MemoryType.SEMANTIC, ranges: [], average: 0, median: 0, standardDeviation: 0 },
            decayAnalysis: { memoryType: MemoryType.SEMANTIC, averageDecayRate: 0, criticalMemories: [], decayTrends: [], recommendations: [] },
            consolidationMetrics: { totalEvents: 0, successRate: 0, averageDuration: 0, efficiencyByType: { semantic_extraction: 0, episodic_to_semantic: 0, procedural_refinement: 0, memory_forgetting: 0, memory_reorganization: 0 }, bottlenecks: [] as any[] },
            correlationAnalysis: { correlations: [], insights: [], predictions: [] }
          },
          lastUpdate: Date.now()
        };
      }
      state.memorySystems[agentId].consolidation.push(consolidationEvent);
      state.lastUpdate = Date.now();
    },
    
    // Visualization configuration actions
    setVisualizationConfig: (state, action: PayloadAction<{ agentId: string; config: Partial<MemoryVisualizationConfig> }>) => {
      const { agentId, config } = action.payload;
      if (!state.visualizationConfigs[agentId]) {
        state.visualizationConfigs[agentId] = defaultVisualizationConfig;
      }
      state.visualizationConfigs[agentId] = {
        ...state.visualizationConfigs[agentId],
        ...config
      };
    },
    
    // Memory selection actions
    selectMemory: (state, action: PayloadAction<{ agentId: string; memoryId: string; memoryType: MemoryType }>) => {
      const { agentId, memoryId } = action.payload;
      if (!state.selectedMemories[agentId]) {
        state.selectedMemories[agentId] = [];
      }
      if (!state.selectedMemories[agentId].includes(memoryId)) {
        state.selectedMemories[agentId].push(memoryId);
      }
    },
    
    deselectMemory: (state, action: PayloadAction<{ agentId: string; memoryId: string }>) => {
      const { agentId, memoryId } = action.payload;
      if (state.selectedMemories[agentId]) {
        state.selectedMemories[agentId] = state.selectedMemories[agentId].filter(id => id !== memoryId);
      }
    },
    
    clearSelection: (state, action: PayloadAction<{ agentId: string }>) => {
      const { agentId } = action.payload;
      state.selectedMemories[agentId] = [];
    },
    
    // Filter actions
    setActiveFilters: (state, action: PayloadAction<{ agentId: string; filters: any }>) => {
      const { agentId, filters } = action.payload;
      state.activeFilters[agentId] = filters;
    },
    
    clearFilters: (state, action: PayloadAction<{ agentId: string }>) => {
      const { agentId } = action.payload;
      state.activeFilters[agentId] = {};
    },
    
    // Performance metrics actions
    updatePerformanceMetrics: (state, action: PayloadAction<{ agentId: string; metrics: MemoryPerformanceMetrics }>) => {
      const { agentId, metrics } = action.payload;
      state.performanceMetrics[agentId] = metrics;
    },
    
    updateVisualizationPerformance: (state, action: PayloadAction<{ agentId: string; performance: MemoryVisualizationPerformance }>) => {
      const { agentId, performance } = action.payload;
      state.visualizationPerformance[agentId] = performance;
    },
    
    // Real-time settings
    setRealTimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.isRealTimeEnabled = action.payload;
    },
    
    setUpdateFrequency: (state, action: PayloadAction<number>) => {
      state.updateFrequency = action.payload;
    },
    
    // Clear actions
    clearMemorySystem: (state, action: PayloadAction<{ agentId: string }>) => {
      const { agentId } = action.payload;
      delete state.memorySystems[agentId];
      delete state.visualizationConfigs[agentId];
      delete state.selectedMemories[agentId];
      delete state.activeFilters[agentId];
      delete state.searchResults[agentId];
      delete state.searchQueries[agentId];
      delete state.performanceMetrics[agentId];
      delete state.visualizationPerformance[agentId];
      delete state.loading[agentId];
      delete state.error[agentId];
    },
    
    // Error handling
    clearError: (state, action: PayloadAction<{ agentId: string }>) => {
      const { agentId } = action.payload;
      state.error[agentId] = null;
    }
  },
  extraReducers: (builder) => {
    // fetchMemorySystem
    builder
      .addCase(fetchMemorySystem.pending, (state, action) => {
        const agentId = action.meta.arg;
        state.loading[agentId] = true;
        state.error[agentId] = null;
      })
      .addCase(fetchMemorySystem.fulfilled, (state, action) => {
        const { agentId, memorySystem } = action.payload;
        state.loading[agentId] = false;
        state.memorySystems[agentId] = memorySystem;
        
        // Initialize default visualization config if not exists
        if (!state.visualizationConfigs[agentId]) {
          state.visualizationConfigs[agentId] = defaultVisualizationConfig;
        }
      })
      .addCase(fetchMemorySystem.rejected, (state, action) => {
        const agentId = action.meta.arg;
        state.loading[agentId] = false;
        state.error[agentId] = action.payload as string;
      });
    
    // searchMemories
    builder
      .addCase(searchMemories.pending, (state, action) => {
        const { agentId } = action.meta.arg;
        state.isSearching[agentId] = true;
      })
      .addCase(searchMemories.fulfilled, (state, action) => {
        const { agentId, query, result } = action.payload;
        state.isSearching[agentId] = false;
        state.searchResults[agentId] = result;
        state.searchQueries[agentId] = query;
      })
      .addCase(searchMemories.rejected, (state, action) => {
        const { agentId } = action.meta.arg;
        state.isSearching[agentId] = false;
        state.error[agentId] = action.payload as string;
      });
    
    // updateVisualizationConfig
    builder
      .addCase(updateVisualizationConfig.pending, (state, action) => {
        const { agentId } = action.meta.arg;
        state.loading[agentId] = true;
      })
      .addCase(updateVisualizationConfig.fulfilled, (state, action) => {
        const { agentId, config } = action.payload;
        state.loading[agentId] = false;
        state.visualizationConfigs[agentId] = config;
      })
      .addCase(updateVisualizationConfig.rejected, (state, action) => {
        const { agentId } = action.meta.arg;
        state.loading[agentId] = false;
        state.error[agentId] = action.payload as string;
      });
    
    // triggerMemoryConsolidation
    builder
      .addCase(triggerMemoryConsolidation.pending, (state, action) => {
        const { agentId } = action.meta.arg;
        state.loading[agentId] = true;
      })
      .addCase(triggerMemoryConsolidation.fulfilled, (state, action) => {
        const { agentId, consolidationEvent } = action.payload;
        state.loading[agentId] = false;
        
        // Add consolidation event to memory system
        if (state.memorySystems[agentId]) {
          state.memorySystems[agentId].consolidation.push(consolidationEvent);
        }
      })
      .addCase(triggerMemoryConsolidation.rejected, (state, action) => {
        const { agentId } = action.meta.arg;
        state.loading[agentId] = false;
        state.error[agentId] = action.payload as string;
      });
  }
});

// Export actions
export const {
  updateMemorySystem,
  updateSemanticMemory,
  updateEpisodicMemory,
  updateProceduralMemory,
  addConsolidationEvent,
  setVisualizationConfig,
  selectMemory,
  deselectMemory,
  clearSelection,
  setActiveFilters,
  clearFilters,
  updatePerformanceMetrics,
  updateVisualizationPerformance,
  setRealTimeEnabled,
  setUpdateFrequency,
  clearMemorySystem,
  clearError
} = memorySlice.actions;

// Selectors
export const selectMemorySystem = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.memorySystems[agentId];

export const selectVisualizationConfig = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.visualizationConfigs[agentId] || defaultVisualizationConfig;

export const selectSelectedMemories = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.selectedMemories[agentId] || [];

export const selectActiveFilters = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.activeFilters[agentId] || {};

export const selectSearchResults = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.searchResults[agentId];

export const selectIsSearching = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.isSearching[agentId] || false;

export const selectPerformanceMetrics = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.performanceMetrics[agentId];

export const selectVisualizationPerformance = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.visualizationPerformance[agentId];

export const selectLoading = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.loading[agentId] || false;

export const selectError = (state: { memory: MemoryState }, agentId: string) => 
  state.memory.error[agentId];

export const selectIsRealTimeEnabled = (state: { memory: MemoryState }) => 
  state.memory.isRealTimeEnabled;

export const selectUpdateFrequency = (state: { memory: MemoryState }) => 
  state.memory.updateFrequency;

// Export reducer
export default memorySlice.reducer;
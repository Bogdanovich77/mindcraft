import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { 
  AgentPosition, 
  EnvironmentData, 
  SpatialRegion, 
  EnvironmentState,
  AgentPositionUpdateEvent,
  EnvironmentUpdateEvent,
  SpatialRegionUpdateEvent
} from '../../types/environment';

// Async thunks for environment data fetching
export const fetchAgentPositions = createAsyncThunk(
  'environment/fetchAgentPositions',
  async (agentIds?: string[]) => {
    // Simulate API call to fetch agent positions
    const response = await fetch('/api/environment/agent-positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agent positions: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }
);

export const fetchEnvironmentData = createAsyncThunk(
  'environment/fetchEnvironmentData',
  async (bounds?: { minX: number; minY: number; maxX: number; maxY: number }) => {
    // Simulate API call to fetch environment data
    const response = await fetch('/api/environment/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bounds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch environment data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }
);

export const fetchSpatialRegions = createAsyncThunk(
  'environment/fetchSpatialRegions',
  async () => {
    const response = await fetch('/api/environment/spatial-regions');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch spatial regions: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }
);

// Initial state
const initialState: EnvironmentState = {
  agentPositions: {}, // Changed from new Map() to plain object
  environmentData: null,
  spatialRegions: [],
  selectedAgents: [],
  selectedRegions: [],
  visualizationConfig: {
    viewMode: '2d',
    showGrid: true,
    showLabels: true,
    showTrails: false,
    showTerrain: true,
    showStructures: false,
    showResources: false,
    showRegions: false,
    zoomLevel: 1,
    trailLength: 50,
    heatmapIntensity: 0.5,
    spatialAnalysis: true,
    updateFrequency: 1000,
    colorScheme: 'default'
  },
  analytics: null,
  loading: false,
  error: null,
  lastUpdated: Date.now(),
  realTimeUpdates: false,
  updateFrequency: 1000,
  subscribedAgents: [],
  subscribedRegions: [],
  environmentBounds: null,
  currentScale: 1,
  currentOffset: { x: 0, y: 0 }
};

// Slice definition
const environmentSlice = createSlice({
  name: 'environment',
  initialState,
  reducers: {
    // Update agent position
    updateAgentPosition: (state, action: PayloadAction<{ agentId: string; position: AgentPosition['position'] }>) => {
      const existingAgent = state.agentPositions[action.payload.agentId];
      if (existingAgent) {
        existingAgent.position = action.payload.position;
        existingAgent.lastUpdate = Date.now();
      } else {
        state.agentPositions[action.payload.agentId] = {
          id: action.payload.agentId,
          name: action.payload.agentId, // Default name
          position: action.payload.position,
          direction: 0,
          status: 'active',
          lastUpdate: Date.now(),
          velocity: { x: 0, y: 0 }
        };
      }
      state.lastUpdated = Date.now();
    },

    // Update multiple agent positions
    updateAgentPositions: (state, action: PayloadAction<AgentPosition[]>) => {
      action.payload.forEach(agent => {
        state.agentPositions[agent.id] = {
          ...agent,
          lastUpdate: Date.now()
        };
      });
      state.lastUpdated = Date.now();
    },

    // Update environment data
    updateEnvironmentData: (state, action: PayloadAction<EnvironmentData>) => {
      state.environmentData = action.payload;
      if (action.payload.bounds) {
        state.environmentBounds = action.payload.bounds;
      }
      state.lastUpdated = Date.now();
    },

    // Update spatial regions
    updateSpatialRegions: (state, action: PayloadAction<SpatialRegion[]>) => {
      state.spatialRegions = action.payload;
      state.lastUpdated = Date.now();
    },

    // Select/deselect agents
    selectAgent: (state, action: PayloadAction<string>) => {
      if (!state.selectedAgents.includes(action.payload)) {
        state.selectedAgents.push(action.payload);
      }
    },

    deselectAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgents = state.selectedAgents.filter(id => id !== action.payload);
    },

    // Select/deselect regions
    selectRegion: (state, action: PayloadAction<string>) => {
      if (!state.selectedRegions.includes(action.payload)) {
        state.selectedRegions.push(action.payload);
      }
    },

    deselectRegion: (state, action: PayloadAction<string>) => {
      state.selectedRegions = state.selectedRegions.filter(id => id !== action.payload);
    },

    // Update visualization config
    updateVisualizationConfig: (state, action: PayloadAction<Partial<EnvironmentState['visualizationConfig']>>) => {
      state.visualizationConfig = {
        ...state.visualizationConfig,
        ...action.payload
      };
    },

    // Update zoom and pan
    updateZoom: (state, action: PayloadAction<{ scale: number; offset: { x: number; y: number } }>) => {
      state.currentScale = action.payload.scale;
      state.currentOffset = action.payload.offset;
    },

    // Clear selected items
    clearSelections: (state) => {
      state.selectedAgents = [];
      state.selectedRegions = [];
    },

    // Set real-time updates
    setRealTimeUpdates: (state, action: PayloadAction<boolean>) => {
      state.realTimeUpdates = action.payload;
    },

    // Update analytics
    updateAnalytics: (state, action: PayloadAction<EnvironmentState['analytics']>) => {
      state.analytics = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Handle fetch agent positions
    builder
      .addCase(fetchAgentPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentPositions.fulfilled, (state, action) => {
        state.loading = false;
        // Convert array to plain object with agentId as key
        state.agentPositions = action.payload.reduce((acc: Record<string, AgentPosition>, agent: AgentPosition) => {
          acc[agent.id] = agent;
          return acc;
        }, {});
        state.lastUpdated = Date.now();
      })
      .addCase(fetchAgentPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch agent positions';
      });

    // Handle fetch environment data
    builder
      .addCase(fetchEnvironmentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnvironmentData.fulfilled, (state, action) => {
        state.loading = false;
        state.environmentData = action.payload;
        if (action.payload.bounds) {
          state.environmentBounds = action.payload.bounds;
        }
        state.lastUpdated = Date.now();
      })
      .addCase(fetchEnvironmentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch environment data';
      });

    // Handle fetch spatial regions
    builder
      .addCase(fetchSpatialRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpatialRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.spatialRegions = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchSpatialRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch spatial regions';
      });
  }
});

// Action creators
export const {
  updateAgentPosition,
  updateAgentPositions,
  updateEnvironmentData,
  updateSpatialRegions,
  selectAgent,
  deselectAgent,
  selectRegion,
  deselectRegion,
  updateVisualizationConfig,
  updateZoom,
  clearSelections,
  setRealTimeUpdates,
  updateAnalytics
} = environmentSlice.actions;

// Selectors
export const selectAgentPositions = (state: { environment: EnvironmentState }) => state.environment.agentPositions;
export const selectEnvironmentData = (state: { environment: EnvironmentState }) => state.environment.environmentData;
export const selectSpatialRegions = (state: { environment: EnvironmentState }) => state.environment.spatialRegions;
export const selectSelectedAgents = (state: { environment: EnvironmentState }) => state.environment.selectedAgents;
export const selectSelectedRegions = (state: { environment: EnvironmentState }) => state.environment.selectedRegions;
export const selectVisualizationConfig = (state: { environment: EnvironmentState }) => state.environment.visualizationConfig;
export const selectEnvironmentAnalytics = (state: { environment: EnvironmentState }) => state.environment.analytics;
export const selectEnvironmentLoading = (state: { environment: EnvironmentState }) => state.environment.loading;
export const selectEnvironmentError = (state: { environment: EnvironmentState }) => state.environment.error;
export const selectEnvironmentBounds = (state: { environment: EnvironmentState }) => state.environment.environmentBounds;

export default environmentSlice.reducer;
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  GoalConflict,
  Goal,
  GoalFilterCriteria,
  GoalUpdateEvent,
  GoalHierarchyEvent,
  GoalCreationRequest,
  GoalUpdateRequest,
  GoalHierarchyState
} from '../../types/goals';
// Socket.IO services will be imported when needed

// Async thunks for goal operations
export const fetchGoalHierarchy = createAsyncThunk(
  'goals/fetchHierarchy',
  async (agentId: string, { rejectWithValue }) => {
    try {
      // This would make an API call to fetch goal hierarchy
      const response = await fetch(`/api/agents/${agentId}/goals/hierarchy`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch goal hierarchy');
    }
  }
);

export const fetchGoalAnalytics = createAsyncThunk(
  'goals/fetchAnalytics',
  async (agentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/goals/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch goal analytics');
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async ({ agentId, goalRequest }: { agentId: string; goalRequest: GoalCreationRequest }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalRequest),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ agentId, goalRequest }: { agentId: string; goalRequest: GoalUpdateRequest }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/goals/${goalRequest.goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalRequest),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async ({ agentId, goalId }: { agentId: string; goalId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/goals/${goalId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return goalId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete goal');
    }
  }
);

export const detectGoalConflicts = createAsyncThunk(
  'goals/detectConflicts',
  async (agentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/goals/conflicts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to detect goal conflicts');
    }
  }
);

// Socket.IO initialization thunk
export const initializeGoalsSocket = createAsyncThunk(
  'goals/initializeGoalsSocket',
  async (_, { rejectWithValue }) => {
    try {
      // Dynamic imports to avoid circular dependencies
      const { enhancedSocketService } = await import('../../services/enhancedSocketService');
      
      // Register goal event handlers using type assertion
      const handlers: any = {
        'goal:strategic:update': (event: any) => {
          // Process strategic goal updates
          console.log('🎯 Strategic goal update received:', event);
        },
        'goal:tactical:update': (event: any) => {
          // Process tactical goal updates
          console.log('🎯 Tactical goal update received:', event);
        },
        'goal:operational:update': (event: any) => {
          // Process operational goal updates
          console.log('🎯 Operational goal update received:', event);
        },
        'goal:progress:update': (event: any) => {
          // Process goal progress updates
          console.log('📊 Goal progress update received:', event);
        }
      };
      
      enhancedSocketService.setHandlers(handlers);
      
      console.log('✅ Goal streaming initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize goal streaming:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize goal streaming');
    }
  }
);

// Initial state
const initialState: GoalHierarchyState = {
  hierarchy: null,
  goals: [],
  analytics: null,
  conflicts: [],
  selectedGoal: null,
  expandedNodes: new Set(),
  filterCriteria: {},
  viewMode: 'tree',
  isLoading: false,
  loading: false,
  error: null,
  lastUpdated: 0,
  filters: {
    status: 'all',
    type: 'all',
    priority: 'all',
    searchTerm: '',
    dateRange: { start: null, end: null }
  },
  statistics: null
};

// Goal slice
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    // Socket event handlers
    onGoalUpdate: (state, action: PayloadAction<GoalUpdateEvent>) => {
      const { goalId, updateType, goal } = action.payload;
      
      if (!state.hierarchy) return;

      // Update goal in the appropriate hierarchy level
      const updateGoalInArray = (goals: Goal[]) => {
        const index = goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
          if (updateType === 'deleted') {
            goals.splice(index, 1);
          } else {
            goals[index] = goal;
          }
        } else if (updateType === 'created') {
          goals.push(goal);
        }
      };

      switch (goal.type) {
        case 'strategic':
          updateGoalInArray(state.hierarchy.strategicGoals);
          break;
        case 'tactical':
          updateGoalInArray(state.hierarchy.tacticalGoals);
          break;
        case 'operational':
          updateGoalInArray(state.hierarchy.operationalGoals);
          break;
      }

      state.hierarchy.lastUpdated = action.payload.timestamp;
      state.lastUpdated = Date.now();
    },

    onHierarchyUpdate: (state, action: PayloadAction<GoalHierarchyEvent>) => {
      state.hierarchy = action.payload.hierarchy;
      state.lastUpdated = Date.now();
    },

    // Enhanced Socket.IO event actions
    updateStrategicGoals: (state, action: PayloadAction<{ agentId: string; goals: Goal[] }>) => {
      const { agentId, goals } = action.payload;
      if (!state.hierarchy) {
        state.hierarchy = {
          agentId,
          strategicGoals: [],
          tacticalGoals: [],
          operationalGoals: [],
          relationships: [],
          criticalPaths: [],
          lastUpdated: Date.now()
        };
      }
      state.hierarchy.strategicGoals = goals;
      state.hierarchy.lastUpdated = Date.now();
      state.lastUpdated = Date.now();
      
      // Update goals array
      state.goals = [
        ...goals,
        ...(state.hierarchy?.tacticalGoals || []),
        ...(state.hierarchy?.operationalGoals || [])
      ];
    },

    updateTacticalGoals: (state, action: PayloadAction<{ agentId: string; goals: Goal[] }>) => {
      const { agentId, goals } = action.payload;
      if (!state.hierarchy) {
        state.hierarchy = {
          agentId,
          strategicGoals: [],
          tacticalGoals: [],
          operationalGoals: [],
          relationships: [],
          criticalPaths: [],
          lastUpdated: Date.now()
        };
      }
      state.hierarchy.tacticalGoals = goals;
      state.hierarchy.lastUpdated = Date.now();
      state.lastUpdated = Date.now();
      
      // Update goals array
      state.goals = [
        ...(state.hierarchy?.strategicGoals || []),
        ...goals,
        ...(state.hierarchy?.operationalGoals || [])
      ];
    },

    updateOperationalGoals: (state, action: PayloadAction<{ agentId: string; goals: Goal[] }>) => {
      const { agentId, goals } = action.payload;
      if (!state.hierarchy) {
        state.hierarchy = {
          agentId,
          strategicGoals: [],
          tacticalGoals: [],
          operationalGoals: [],
          relationships: [],
          criticalPaths: [],
          lastUpdated: Date.now()
        };
      }
      state.hierarchy.operationalGoals = goals;
      state.hierarchy.lastUpdated = Date.now();
      state.lastUpdated = Date.now();
      
      // Update goals array
      state.goals = [
        ...(state.hierarchy?.strategicGoals || []),
        ...(state.hierarchy?.tacticalGoals || []),
        ...goals
      ];
    },

    updateGoalProgressFromSocket: (state, action: PayloadAction<{ agentId: string; goalId: string; progress: number; completedMilestones?: string[] }>) => {
      const { goalId, progress, completedMilestones } = action.payload;
      
      if (!state.hierarchy) return;

      const updateGoalInArray = (goals: Goal[]) => {
        const index = goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
          const goal = goals[index];
          goal.progress.current = progress;
          goal.progress.percentage = Math.round((progress / goal.progress.target) * 100);
          goal.progress.lastUpdated = Date.now();
          
          if (completedMilestones) {
            goal.progress.completedMilestones = completedMilestones;
            // Update milestone completion status
            goal.progress.milestones.forEach(milestone => {
              if (completedMilestones.includes(milestone.id)) {
                milestone.completed = true;
                milestone.completedAt = Date.now();
                milestone.currentValue = milestone.targetValue;
              }
            });
          }
          
          // Update status based on progress
          if (progress >= goal.progress.target) {
            goal.status = 'completed';
          } else if (progress > 0 && goal.status === 'pending') {
            goal.status = 'in_progress';
          }
          
          goal.updatedAt = Date.now();
        }
      };

      updateGoalInArray(state.hierarchy.strategicGoals);
      updateGoalInArray(state.hierarchy.tacticalGoals);
      updateGoalInArray(state.hierarchy.operationalGoals);
      
      // Update goals array
      state.goals = [
        ...state.hierarchy.strategicGoals,
        ...state.hierarchy.tacticalGoals,
        ...state.hierarchy.operationalGoals
      ];
      
      state.lastUpdated = Date.now();
    },

    // UI state management
    selectGoal: (state, action: PayloadAction<Goal | null>) => {
      state.selectedGoal = action.payload;
    },

    toggleNodeExpansion: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      if (state.expandedNodes.has(nodeId)) {
        state.expandedNodes.delete(nodeId);
      } else {
        state.expandedNodes.add(nodeId);
      }
    },

    expandAllNodes: (state) => {
      if (!state.hierarchy) return;
      
      const allGoalIds = [
        ...state.hierarchy.strategicGoals,
        ...state.hierarchy.tacticalGoals,
        ...state.hierarchy.operationalGoals
      ].map(goal => goal.id);
      
      state.expandedNodes = new Set(allGoalIds);
    },

    collapseAllNodes: (state) => {
      state.expandedNodes.clear();
    },

    setFilterCriteria: (state, action: PayloadAction<Partial<GoalFilterCriteria>>) => {
      state.filterCriteria = { ...state.filterCriteria, ...action.payload };
    },

    clearFilterCriteria: (state) => {
      state.filterCriteria = {};
    },

    setViewMode: (state, action: PayloadAction<'tree' | 'list' | 'dependency' | 'timeline'>) => {
      state.viewMode = action.payload;
    },

    // Goal management actions
    updateLocalGoal: (state, action: PayloadAction<{ goalId: string; updates: Partial<Goal> }>) => {
      const { goalId, updates } = action.payload;
      
      if (!state.hierarchy) return;

      const updateGoalInArray = (goals: Goal[]) => {
        const index = goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
          goals[index] = { ...goals[index], ...updates, updatedAt: Date.now() };
        }
      };

      // Update in all arrays since we don't know the type
      updateGoalInArray(state.hierarchy.strategicGoals);
      updateGoalInArray(state.hierarchy.tacticalGoals);
      updateGoalInArray(state.hierarchy.operationalGoals);
    },

    updateGoalProgress: (state, action: PayloadAction<{ goalId: string; progress: number; completedMilestones?: string[] }>) => {
      const { goalId, progress, completedMilestones } = action.payload;
      
      if (!state.hierarchy) return;

      const updateGoalInArray = (goals: Goal[]) => {
        const index = goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
          const goal = goals[index];
          goal.progress.current = progress;
          goal.progress.percentage = Math.round((progress / goal.progress.target) * 100);
          goal.progress.lastUpdated = Date.now();
          
          if (completedMilestones) {
            goal.progress.completedMilestones = completedMilestones;
            // Update milestone completion status
            goal.progress.milestones.forEach(milestone => {
              if (completedMilestones.includes(milestone.id)) {
                milestone.completed = true;
                milestone.completedAt = Date.now();
                milestone.currentValue = milestone.targetValue;
              }
            });
          }
          
          // Update status based on progress
          if (progress >= goal.progress.target) {
            goal.status = 'completed';
          } else if (progress > 0 && goal.status === 'pending') {
            goal.status = 'in_progress';
          }
          
          goal.updatedAt = Date.now();
        }
      };

      updateGoalInArray(state.hierarchy.strategicGoals);
      updateGoalInArray(state.hierarchy.tacticalGoals);
      updateGoalInArray(state.hierarchy.operationalGoals);
    },

    // Conflict management
    addConflict: (state, action: PayloadAction<GoalConflict>) => {
      const existingIndex = state.conflicts.findIndex(c => c.id === action.payload.id);
      if (existingIndex !== -1) {
        state.conflicts[existingIndex] = action.payload;
      } else {
        state.conflicts.push(action.payload);
      }
    },

    removeConflict: (state, action: PayloadAction<string>) => {
      state.conflicts = state.conflicts.filter(c => c.id !== action.payload);
    },

    clearConflicts: (state) => {
      state.conflicts = [];
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Reset state
    resetGoalState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Fetch hierarchy
    builder
      .addCase(fetchGoalHierarchy.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoalHierarchy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.hierarchy = action.payload;
        state.lastUpdated = Date.now();
        
        // Update goals array from hierarchy
        if (action.payload) {
          state.goals = [
            ...action.payload.strategicGoals,
            ...action.payload.tacticalGoals,
            ...action.payload.operationalGoals
          ];
        }
      })
      .addCase(fetchGoalHierarchy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch analytics
    builder
      .addCase(fetchGoalAnalytics.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchGoalAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(fetchGoalAnalytics.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create goal
    builder
      .addCase(createGoal.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        // Add the new goal to the hierarchy
        if (state.hierarchy) {
          const newGoal = action.payload;
          switch (newGoal.type) {
            case 'strategic':
              state.hierarchy.strategicGoals.push(newGoal);
              break;
            case 'tactical':
              state.hierarchy.tacticalGoals.push(newGoal);
              break;
            case 'operational':
              state.hierarchy.operationalGoals.push(newGoal);
              break;
          }
          state.hierarchy.lastUpdated = Date.now();
          
          // Update goals array
          state.goals = [
            ...state.hierarchy.strategicGoals,
            ...state.hierarchy.tacticalGoals,
            ...state.hierarchy.operationalGoals
          ];
        }
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update goal
    builder
      .addCase(updateGoal.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        // Update the goal in the hierarchy
        if (state.hierarchy) {
          const updatedGoal = action.payload;
          const updateGoalInArray = (goals: Goal[]) => {
            const index = goals.findIndex(g => g.id === updatedGoal.id);
            if (index !== -1) {
              goals[index] = updatedGoal;
            }
          };
          
          updateGoalInArray(state.hierarchy.strategicGoals);
          updateGoalInArray(state.hierarchy.tacticalGoals);
          updateGoalInArray(state.hierarchy.operationalGoals);
          state.hierarchy.lastUpdated = Date.now();
          
          // Update goals array
          state.goals = [
            ...state.hierarchy.strategicGoals,
            ...state.hierarchy.tacticalGoals,
            ...state.hierarchy.operationalGoals
          ];
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete goal
    builder
      .addCase(deleteGoal.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        const deletedGoalId = action.payload;
        
        if (state.hierarchy) {
          // Remove from all arrays
          state.hierarchy.strategicGoals = state.hierarchy.strategicGoals.filter(g => g.id !== deletedGoalId);
          state.hierarchy.tacticalGoals = state.hierarchy.tacticalGoals.filter(g => g.id !== deletedGoalId);
          state.hierarchy.operationalGoals = state.hierarchy.operationalGoals.filter(g => g.id !== deletedGoalId);
          
          // Remove from relationships
          state.hierarchy.relationships = state.hierarchy.relationships.filter(
            r => r.sourceGoalId !== deletedGoalId && r.targetGoalId !== deletedGoalId
          );
          
          // Remove from critical paths
          state.hierarchy.criticalPaths.forEach(path => {
            path.goals = path.goals.filter(gId => gId !== deletedGoalId);
          });
          
          state.hierarchy.lastUpdated = Date.now();
          
          // Update goals array
          state.goals = [
            ...state.hierarchy.strategicGoals,
            ...state.hierarchy.tacticalGoals,
            ...state.hierarchy.operationalGoals
          ];
        }
        
        // Clear selection if the deleted goal was selected
        if (state.selectedGoal?.id === deletedGoalId) {
          state.selectedGoal = null;
        }
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Detect conflicts
    builder
      .addCase(detectGoalConflicts.pending, (state) => {
        state.error = null;
      })
      .addCase(detectGoalConflicts.fulfilled, (state, action) => {
        state.conflicts = action.payload;
      })
      .addCase(detectGoalConflicts.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectGoalHierarchy = (state: { goals: GoalHierarchyState }) => state.goals.hierarchy;
export const selectAllGoals = (state: { goals: GoalHierarchyState }) => state.goals.goals;
export const selectGoalAnalytics = (state: { goals: GoalHierarchyState }) => state.goals.analytics;
export const selectGoalConflicts = (state: { goals: GoalHierarchyState }) => state.goals.conflicts;
export const selectSelectedGoal = (state: { goals: GoalHierarchyState }) => state.goals.selectedGoal;
export const selectGoalFilterCriteria = (state: { goals: GoalHierarchyState }) => state.goals.filterCriteria;
export const selectGoalViewMode = (state: { goals: GoalHierarchyState }) => state.goals.viewMode;
export const selectGoalLoadingState = (state: { goals: GoalHierarchyState }) => state.goals.isLoading;
export const selectGoalError = (state: { goals: GoalHierarchyState }) => state.goals.error;

// Filtered goals selector
export const selectFilteredGoals = (state: { goals: GoalHierarchyState }) => {
  const { hierarchy, filterCriteria } = state.goals;
  
  if (!hierarchy) return { strategic: [], tactical: [], operational: [] };
  
  const filterGoals = (goals: Goal[]): Goal[] => {
    return goals.filter(goal => {
      if (filterCriteria.type && goal.type !== filterCriteria.type) return false;
      if (filterCriteria.status && goal.status !== filterCriteria.status) return false;
      if (filterCriteria.priority && goal.priority !== filterCriteria.priority) return false;
      if (filterCriteria.agent && goal.assignedAgent !== filterCriteria.agent) return false;
      if (filterCriteria.tags && filterCriteria.tags.length > 0) {
        const hasMatchingTag = filterCriteria.tags.some(tag => goal.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      if (filterCriteria.searchText) {
        const searchLower = filterCriteria.searchText.toLowerCase();
        const matchesSearch = goal.description.toLowerCase().includes(searchLower) ||
          goal.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      if (filterCriteria.dateRange) {
        const createdAt = goal.createdAt;
        if (filterCriteria.dateRange.start !== null && createdAt < filterCriteria.dateRange.start) {
          return false;
        }
        if (filterCriteria.dateRange.end !== null && createdAt > filterCriteria.dateRange.end) {
          return false;
        }
      }
      return true;
    });
  };

  return {
    strategic: filterGoals(hierarchy.strategicGoals),
    tactical: filterGoals(hierarchy.tacticalGoals),
    operational: filterGoals(hierarchy.operationalGoals),
  };
};

// Goal statistics selector
export const selectGoalStatistics = (state: { goals: GoalHierarchyState }) => {
  const { hierarchy } = state.goals;
  
  if (!hierarchy) return null;
  
  const allGoals = [
    ...hierarchy.strategicGoals,
    ...hierarchy.tacticalGoals,
    ...hierarchy.operationalGoals
  ];
  
  const stats = {
    total: allGoals.length,
    byStatus: {
      pending: allGoals.filter(g => g.status === 'pending').length,
      active: allGoals.filter(g => g.status === 'active').length,
      in_progress: allGoals.filter(g => g.status === 'in_progress').length,
      completed: allGoals.filter(g => g.status === 'completed').length,
      failed: allGoals.filter(g => g.status === 'failed').length,
      paused: allGoals.filter(g => g.status === 'paused').length,
      cancelled: allGoals.filter(g => g.status === 'cancelled').length,
    },
    byType: {
      strategic: hierarchy.strategicGoals.length,
      tactical: hierarchy.tacticalGoals.length,
      operational: hierarchy.operationalGoals.length,
    },
    byPriority: {
      critical: allGoals.filter(g => g.priority === 0).length,
      high: allGoals.filter(g => g.priority === 1).length,
      medium: allGoals.filter(g => g.priority === 2).length,
      low: allGoals.filter(g => g.priority === 3).length,
    },
    averageProgress: allGoals.length > 0 
      ? allGoals.reduce((sum, g) => sum + g.progress.percentage, 0) / allGoals.length 
      : 0,
  };
  
  return stats;
};

export const {
  onGoalUpdate,
  onHierarchyUpdate,
  updateStrategicGoals,
  updateTacticalGoals,
  updateOperationalGoals,
  updateGoalProgressFromSocket,
  selectGoal,
  toggleNodeExpansion,
  expandAllNodes,
  collapseAllNodes,
  setFilterCriteria,
  clearFilterCriteria,
  setViewMode,
  updateLocalGoal,
  updateGoalProgress,
  addConflict,
  removeConflict,
  clearConflicts,
  clearError,
  setError,
  resetGoalState,
} = goalsSlice.actions;

// Export the state type
export type { GoalHierarchyState };

export default goalsSlice.reducer;
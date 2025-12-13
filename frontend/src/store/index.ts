/**
 * Redux Store Configuration
 * 
 * Central store configuration combining all slices for the Mindcraft
 * cognitive dashboard.
 */

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

// Import all reducers
import agentsReducer from './slices/agentsSlice';
import connectionReducer from './slices/connectionSlice';
import uiReducer from './slices/uiSlice';
import memoryReducer from './slices/memorySlice';
import skillsReducer from './slices/skillsSlice';
import goalsReducer from './slices/goalsSlice';
import socialReducer from './slices/socialSlice';
import performanceReducer from './slices/performanceSlice';
import environmentReducer from './slices/environmentSlice';
import dashboardReducer from './slices/dashboardSlice';

// Import all exports from slices with aliases to avoid conflicts
import * as AgentsSliceActions from './slices/agentsSlice';
import * as ConnectionSliceActions from './slices/connectionSlice';
import * as UISliceActions from './slices/uiSlice';
import * as MemorySliceActions from './slices/memorySlice';
import * as SkillsSliceActions from './slices/skillsSlice';
import * as GoalsSliceActions from './slices/goalsSlice';
import * as SocialSliceActions from './slices/socialSlice';
import * as PerformanceSliceActions from './slices/performanceSlice';
import * as EnvironmentSliceActions from './slices/environmentSlice';
import * as DashboardSliceActions from './slices/dashboardSlice';
import * as SkillsSlice from './slices/skillsSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    agents: agentsReducer,
    connection: connectionReducer,
    ui: uiReducer,
    memory: memoryReducer,
    skills: skillsReducer,
    goals: goalsReducer,
    social: socialReducer,
    performance: performanceReducer,
    environment: environmentReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<RootState>();

// Explicitly export all selectors, thunks, and actions with prefixes to avoid conflicts

// --- Agents Slice ---
export const {
  // Agents Slice Actions
  setAgents,
  updateAgent,
  selectAgent: selectAgentFromAgents,
  clearSelectedAgent: clearAgentsSelectedAgent,
  setAgentLoading,
  setAgentError,
  clearAgentError: clearAgentsError,
  removeAgent,
  updateAgentStatus,
  updateAgentPosition,
  updateAgentHealth,
  agentStateUpdate,
  agentConnected,
  agentDisconnected,
  updateStreamingStatus,
  streamingError,
  incrementReconnectAttempts,
  resetStreamingMetrics,
  updatePerformanceMetrics,
  batchAgentUpdates,
  // Agents Slice Selectors
  selectAllAgents,
  selectAgentById,
  selectSelectedAgent: selectAgentsSelectedAgent,
  selectAgentsLoading,
  selectAgentsError,
  selectAgentIds,
  selectOnlineAgents,
  selectStreamingStatus,
  selectStreamingPerformance,
  selectIsStreamingConnected,
  selectConnectionQuality,
  selectStreamingLatency,
  selectStreamingErrors,
  selectUpdateFrequency: selectAgentsUpdateFrequency,
  // Agents Slice Thunks
  handleAgentStateStream,
  handleAgentConnectionStream,
  handleAgentDisconnectionStream,
  updateConnectionStatus,
  handleStreamingError: handleAgentsStreamingError,
  initializeAgentsSocket
} = AgentsSliceActions;

// --- Connection Slice ---
export const {
  selectConnectionStatus,
  selectConnectionError,
  selectLastConnected,
  selectReconnectAttempts,
  selectReconnectDelay,
  selectIsConnected,
  selectIsConnecting,
  selectHasConnectionError,
  selectConnectionMetrics,
  selectConnectionAttempts,
  selectIsReconnecting,
  selectLatency,
  selectLastPingTime,
  connectToServer,
  disconnectFromServer,
  reconnectToServer,
  forceReconnect,
  setConnectionStatus,
  setConnectionError,
  clearConnectionError,
  incrementReconnectAttempts: incrementReconnectAttemptsAction,
  resetReconnectAttempts,
  setReconnectDelay,
  disconnect,
  startConnecting,
  connectionLost,
  resetConnectionState,
  updateMetrics: updateConnectionMetrics,
  updateConnectionAttempts,
  setReconnecting
} = ConnectionSliceActions;

// --- UI Slice ---
export const {
  selectActiveTab,
  selectGlobalLoading,
  selectGlobalError,
  selectSystemStatus,
  selectSelectedAgentId,
  selectDashboardAgents,
  selectSidebarOpen,
  selectTheme,
  selectNotifications,
  selectUnreadNotifications,
  setActiveTab: setActiveTabAction,
  setGlobalLoading,
  setGlobalError,
  clearGlobalError,
  setSystemStatus,
  updateDashboardData,
  resetDashboard,
  setSidebarOpen,
  setTheme,
  addNotification,
  markNotificationRead,
  clearNotifications
} = UISliceActions;

// --- Memory Slice ---
export const {
  fetchMemorySystem,
  searchMemories,
  updateVisualizationConfig: updateMemoryVisualizationConfig,
  triggerMemoryConsolidation,
  initializeMemorySocket,
  selectMemorySystem,
  selectVisualizationConfig: selectMemoryVisualizationConfig,
  selectSelectedMemories,
  selectActiveFilters,
  selectSearchResults,
  selectIsSearching,
  selectPerformanceMetrics: selectMemoryPerformanceMetrics,
  selectVisualizationPerformance,
  selectLoading: selectMemoryLoading,
  selectError: selectMemoryError,
  selectIsRealTimeEnabled: selectMemoryRealTimeEnabled,
  selectUpdateFrequency: selectMemoryUpdateFrequency,
  updateMemorySystem,
  updateSemanticMemory,
  updateEpisodicMemory,
  updateProceduralMemory,
  addConsolidationEvent,
  setVisualizationConfig: setMemoryVisualizationConfig,
  selectMemory: selectMemoryAction,
  deselectMemory,
  clearSelection: clearMemorySelection,
  setActiveFilters: setMemoryActiveFilters,
  clearFilters: clearMemoryFilters,
  updatePerformanceMetrics: updateMemoryPerformanceMetrics,
  updateVisualizationPerformance,
  setRealTimeEnabled: setMemoryRealTimeEnabled,
  setUpdateFrequency: setMemoryUpdateFrequency,
  clearMemorySystem,
  clearError: clearMemoryError
} = MemorySliceActions;

// --- Skills Slice ---
export const {
  // Skills Slice Actions
  setSkills,
  addSkill,
  updateSkill,
  removeSkill,
  selectSkill: selectSkillFromSkills,
  clearSkillSelection,
  setSkillProgression,
  updateSkillProgression,
  addExperiencePoint,
  setSynergies,
  addSynergy,
  updateSynergy,
  removeSynergy,
  addTransferEvent,
  setTransferEvents,
  setMilestones,
  addMilestone,
  updateMilestone,
  achieveMilestone,
  setAchievements,
  addAchievement,
  unlockAchievement,
  setSkillAnalytics,
  updateSkillAnalytics,
  addInsight,
  setInsights,
  clearInsights,
  addRecommendation,
  setRecommendations,
  clearRecommendations,
  acceptRecommendation,
  updateVisualizationConfig,
  updateProgressionChartsConfig,
  updateLearningAnalysisConfig,
  updateSynergyMappingConfig,
  updateMilestoneTrackingConfig,
  updatePerformanceTrendsConfig,
  updateSkillComparisonConfig,
  updateExperienceAnalysisConfig,
  updateRecommendationsConfig,
  setRealTimeUpdates,
  setUpdateFrequency: setSkillsUpdateFrequency,
  subscribeToSkill,
  unsubscribeFromSkill,
  setSubscribedSkills,
  setSkillsLoading,
  setSkillsError,
  clearSkillsError,
  handleSkillDataUpdate,
  handleSkillExperienceEvent,
  handleSkillMilestoneEvent,
  handleSkillSynergyEvent,
  resetSkillsState,
  // Skills Slice Selectors
  selectSkills,
  selectSelectedSkillId,
  selectSelectedSkillData,
  selectSkillById,
  selectSkillsByCategory,
  selectSkillsByType,
  selectSkillProgression,
  selectSkillSynergies,
  selectSkillMilestones,
  selectSkillAnalytics,
  selectSkillsInsights,
  selectSkillsRecommendations,
  selectSkillsVisualizationConfig,
  selectSkillsLoading,
  selectSkillsError,
  selectSkillsLastUpdated,
  selectRealTimeUpdates,
  selectUpdateFrequency: selectSkillsUpdateFrequencyFromSelector,
  selectSubscribedSkills,
  selectTransferEvents,
  selectAchievements,
  // Skills Slice Thunks
  initializeSkillsSocket,
  subscribeToSkillSocket,
  unsubscribeFromSkillSocket
} = SkillsSliceActions;

// --- Goals Slice ---
export const {
  fetchGoalHierarchy,
  fetchGoalAnalytics,
  createGoal,
  updateGoal,
  deleteGoal,
  detectGoalConflicts,
  initializeGoalsSocket,
  selectGoalHierarchy,
  selectAllGoals: selectAllGoalsFromGoals,
  selectGoalAnalytics,
  selectGoalConflicts,
  selectSelectedGoal: selectSelectedGoalFromGoals,
  selectGoalFilterCriteria,
  selectGoalViewMode,
  selectGoalLoadingState,
  selectGoalError,
  selectFilteredGoals,
  selectGoalStatistics,
  onGoalUpdate,
  onHierarchyUpdate,
  updateStrategicGoals,
  updateTacticalGoals,
  updateOperationalGoals,
  updateGoalProgressFromSocket,
  selectGoal: selectGoalAction,
  toggleNodeExpansion,
  expandAllNodes,
  collapseAllNodes,
  setFilterCriteria,
  clearFilterCriteria,
  setViewMode: setGoalsViewMode,
  updateLocalGoal,
  updateGoalProgress,
  addConflict,
  removeConflict,
  clearConflicts,
  clearError: clearGoalsError,
  setError: setGoalsError,
  resetGoalState
} = GoalsSliceActions;

// --- Social Slice ---
export const {
  initializeSocialSocket,
  subscribeToSocialAgent,
  unsubscribeFromSocialAgent,
  selectCurrentNetwork,
  selectSelectedSocialAgent,
  selectSelectedSocialRelationship,
  selectSelectedSocialCommunity,
  selectSocialAgents,
  selectSocialRelationships,
  selectSocialCommunities,
  selectInfluenceNetwork,
  selectEvolutionData,
  selectSocialAnalytics,
  selectSocialInsights,
  selectVisualizationConfig: selectSocialVisualizationConfig,
  selectSocialFilters,
  selectSocialLoading,
  selectSocialError,
  selectSocialLastUpdated,
  selectRealTimeUpdates: selectSocialRealTimeUpdates,
  selectUpdateFrequency: selectSocialUpdateFrequency,
  selectSubscribedAgents,
  selectHistoricalNetworks,
  selectAgentRelationships,
  selectAgentCommunities,
  selectCommunityMembers,
  selectFilteredInteractions,
  selectNetworkMetrics,
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
  addInsight: addSocialInsight,
  clearInsights: clearSocialInsights,
  selectSocialAgent,
  selectSocialRelationship,
  selectSocialCommunity,
  clearSelections,
  updateVisualizationConfig: updateSocialVisualizationConfig,
  updateNetworkGraphConfig,
  updateTemporalViewConfig,
  updateInfluenceMapConfig,
  updateCommunityViewConfig,
  setFilters,
  updateFilters,
  resetFilters,
  setRealTimeUpdates: setSocialRealTimeUpdates,
  setUpdateFrequency: setSocialUpdateFrequency,
  subscribeToAgent,
  unsubscribeFromAgent,
  setSubscribedAgents,
  setSocialLoading,
  setSocialError,
  clearSocialError,
  handleSocialDataUpdate,
  handleSocialNetworkUpdate,
  handleSocialInteractionEvent,
  resetSocialState
} = SocialSliceActions;

// --- Performance Slice ---
export const {
  fetchPerformanceMetrics,
  fetchPerformanceTrends,
  fetchSystemHealth,
  fetchResourceUtilization,
  fetchBenchmarks,
  generatePerformanceReport,
  fetchOptimizationRecommendations,
  selectPerformanceMetrics: selectPerformanceMetricsFromPerformance,
  selectPerformanceTrends,
  selectSystemHealth,
  selectResourceUtilization,
  selectBenchmarks,
  selectReports,
  selectCustomMetrics,
  selectOptimizations,
  selectSelectedAgent: selectPerformanceSelectedAgent,
  selectSelectedTimeRange,
  selectSelectedMetrics,
  selectViewMode: selectPerformanceViewMode,
  selectRealTimeEnabled: selectPerformanceRealTimeEnabled,
  selectUpdateInterval,
  selectAlertThresholds,
  selectPerformanceLoading,
  selectPerformanceError,
  selectActiveAlerts,
  selectCurrentAgentMetrics,
  selectCurrentAgentHistory,
  selectCurrentAgentHealth,
  selectCurrentAgentResources,
  selectMetricsHistory,
  setSelectedAgent: setPerformanceSelectedAgent,
  setSelectedTimeRange,
  setSelectedMetrics,
  setViewMode: setPerformanceViewMode,
  toggleRealTime,
  setUpdateInterval,
  setAlertThresholds,
  clearError: clearPerformanceError
} = PerformanceSliceActions;

// --- Environment Slice ---
export const {
  fetchAgentPositions,
  fetchEnvironmentData,
  fetchSpatialRegions,
  selectAgentPositions,
  selectEnvironmentData,
  selectSpatialRegions,
  selectSelectedAgents: selectEnvironmentSelectedAgents,
  selectSelectedRegions,
  selectVisualizationConfig: selectEnvironmentVisualizationConfig,
  selectEnvironmentAnalytics,
  selectEnvironmentLoading,
  selectEnvironmentError,
  selectEnvironmentBounds,
  updateAgentPosition: updateEnvironmentAgentPosition,
  updateAgentPositions,
  updateEnvironmentData,
  updateSpatialRegions,
  selectAgent: selectEnvironmentAgent,
  deselectAgent,
  selectRegion,
  deselectRegion,
  updateVisualizationConfig: updateEnvironmentVisualizationConfig,
  updateZoom,
  clearSelections: clearEnvironmentSelections,
  setRealTimeUpdates: setEnvironmentRealTimeUpdates,
  updateAnalytics
} = EnvironmentSliceActions;

// --- Dashboard Slice ---
export const {
  fetchDashboardData,
  selectDashboardState,
  selectSelectedAgentId: selectDashboardSelectedAgentId,
  selectAgentMetrics,
  selectAllMetrics,
  selectPerformanceData,
  selectAllPerformanceData,
  selectPositionData,
  selectAllPositionData,
  selectDashboardLoading,
  selectDashboardError,
  selectLastUpdate,
  selectAgentIds: selectDashboardAgentIds,
  selectAgentCount,
  selectConnectedAgents,
  selectDisconnectedAgents,
  selectAgentsByHealthStatus,
  selectDashboardSummary,
  selectAverageResponseTime: selectDashboardAverageResponseTime,
  selectAverageCognitiveLoad: selectDashboardAverageCognitiveLoad,
  selectAverageSuccessRate: selectDashboardAverageSuccessRate,
  selectAgentsWithHighCognitiveLoad,
  selectAgentsWithLowSuccessRate,
  selectDashboardDataForAgent,
  selectDashboardAnalytics,
  selectAgent,
  clearAgentSelection,
  updateAgentMetrics,
  updatePerformanceData,
  updatePositionData,
  updateSettings,
  setLoading: setDashboardLoading,
  setError: setDashboardError,
  clearError: clearDashboardError,
  clearData,
  clearAgentData,
  batchUpdateMetrics,
  batchUpdatePerformanceData,
  batchUpdatePositionData,
} = DashboardSliceActions;

export default store;

// --- Additional exports for components ---
// These exports are added to resolve import errors in components
// and provide direct access to commonly used selectors and actions.

// Performance Slice - Direct Exports
export const selectPerformanceMetrics = (state: RootState) => state.performance.currentMetrics;
export const selectSelectedAgent = (state: RootState) => state.performance.selectedAgent;
export const selectViewMode = (state: RootState) => state.performance.viewMode;
export const selectRealTimeEnabled = (state: RootState) => state.performance.realTimeEnabled;
export const setSelectedAgent = (agentId: string | null) => ({ type: 'performance/setSelectedAgent', payload: agentId });
export const setViewMode = (mode: any) => ({ type: 'performance/setViewMode', payload: mode });
export const clearError = () => ({ type: 'performance/clearError' });
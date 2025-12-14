/**
 * Redux Store Configuration
 *
 * Central store configuration for the simplified Mindcraft 
 * cognitive dashboard with 7-field AgentState structure.
 */

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

// Import essential reducers only
import agentsReducer from './slices/agentsSlice';
import connectionReducer from './slices/connectionSlice';
import uiReducer from './slices/uiSlice';
import environmentReducer from './slices/environmentSlice';
import dashboardReducer from './slices/dashboardSlice';

// Import essential exports from slices with aliases to avoid conflicts
import * as AgentsSliceActions from './slices/agentsSlice';
import * as ConnectionSliceActions from './slices/connectionSlice';
import * as UISliceActions from './slices/uiSlice';
import * as EnvironmentSliceActions from './slices/environmentSlice';
import * as DashboardSliceActions from './slices/dashboardSlice';

// Configure the simplified store
export const store = configureStore({
  reducer: {
    agents: agentsReducer,
    connection: connectionReducer,
    ui: uiReducer,
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

// Export essential slice actions, selectors, and thunks

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
  updateAgentWorldContext,
  updateAgentPersonality,
  updateAgentGoals,
  updateAgentMandate,
  updateAgentConversation,
  updateAgentLastAction,
  updateAgentResponse,
  // Agents Slice Streaming Actions
  agentStateUpdate,
  agentConnected,
  agentDisconnected,
  updateStreamingStatus,
  streamingError,
  incrementReconnectAttempts,
  resetStreamingMetrics,
  updatePerformanceMetrics,
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

// Legacy exports - marked as deprecated for backward compatibility
/** @deprecated No longer used in simplified architecture */
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
} = {} as any;

/** @deprecated Use simplified goals string instead */
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
} = {} as any;

/** @deprecated Use simplified personality string instead */
export const {
  selectPersonalitySystem,
  selectPersonalityTraits,
  selectPersonalityEvolution,
  selectPersonalityInsights,
  selectPersonalityVisualizationConfig,
  selectPersonalityLoading,
  selectPersonalityError,
  selectPersonalityLastUpdated,
  selectRealTimeUpdates: selectPersonalityRealTimeUpdates,
  selectUpdateFrequency: selectPersonalityUpdateFrequency,
  setPersonalitySystem,
  updatePersonalityTraits,
  updatePersonalityEvolution,
  addInsight: addPersonalityInsight,
  clearInsights: clearPersonalityInsights,
  updateVisualizationConfig: updatePersonalityVisualizationConfig,
  setRealTimeUpdates: setPersonalityRealTimeUpdates,
  setUpdateFrequency: setPersonalityUpdateFrequency,
  setPersonalityLoading,
  setPersonalityError,
  clearPersonalityError,
  handlePersonalityDataUpdate,
  resetPersonalityState
} = {} as any;

/** @deprecated No longer used in simplified architecture */
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
} = {} as any;

/** @deprecated No longer used in simplified architecture */
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
  handleSkillSyergyEvent,
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
} = {} as any;
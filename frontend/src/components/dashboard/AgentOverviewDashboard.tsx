import React, { useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  selectDashboardState,
  selectAgentMetrics,
  selectDashboardAgentIds,
  selectDashboardAverageResponseTime,
  selectDashboardAverageCognitiveLoad,
  selectDashboardAverageSuccessRate,
  selectPerformanceData,
  selectPositionData,
  fetchDashboardData,
  selectAgent,
  setDashboardLoading,
  setDashboardError,
  selectOnlineAgents,
} from '../../store';
import type { AgentOverviewDashboardProps } from '../../types/dashboard';

// Import dashboard components (we'll create these next)
// import CognitiveLoadGauge from './CognitiveLoadGauge';
// import AgentStatusIndicator from './AgentStatusIndicator';
// import PerformanceMetrics from './PerformanceMetrics';
// import AgentPositionMap from './AgentPositionMap';

// Import the missing interfaces from types/dashboard.ts
import type {
  AgentStatusIndicatorProps,
  PerformanceMetricsProps,
  AgentPositionMapProps,
  CognitiveLoadGaugeProps
} from '../../types/dashboard';

const CognitiveLoadGauge = React.memo((props: CognitiveLoadGaugeProps) => (
  <Box>Cognitive Load Gauge: {props.value}</Box>
));

const AgentStatusIndicator = React.memo((props: AgentStatusIndicatorProps) => (
  <Box>Agent Status Indicator: {props.agent.id}</Box>
));

const PerformanceMetrics = React.memo((props: PerformanceMetricsProps) => (
  <Box>Performance Metrics: {props.agentId}</Box>
));

const AgentPositionMap = React.memo((props: AgentPositionMapProps) => (
  <Box>Agent Position Map: {props.agentId}</Box>
));

/**
 * Main Agent Overview Dashboard Component
 * 
 * This component provides a comprehensive view of agent cognitive states,
 * performance metrics, and real-time monitoring capabilities.
 * 
 * Updated: Fixed import errors to use store exports instead of direct slice imports
 */
const AgentOverviewDashboard: React.FC<AgentOverviewDashboardProps> = ({ agent, performanceData, positionData, settings, onAgentSelect, className }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector(selectDashboardState);
  const selectedMetrics = useAppSelector((state) => 
    dashboardState.selectedAgentId ? selectAgentMetrics(dashboardState.selectedAgentId)(state) : null
  );
  const allAgentIds = useAppSelector(selectDashboardAgentIds);
  const onlineAgents = useAppSelector(selectOnlineAgents);

  const avgResponseTime = useAppSelector(selectDashboardAverageResponseTime);
  const avgCognitiveLoad = useAppSelector(selectDashboardAverageCognitiveLoad);
  const avgSuccessRate = useAppSelector(selectDashboardAverageSuccessRate);

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const totalAgents = allAgentIds.length;
    const onlineCount = onlineAgents.length;
    const offlineCount = totalAgents - onlineCount;
    const healthStatus = onlineAgents.filter(agent => 
      agent.context.health > 50 // Consider agents with health > 50 as healthy
    ).length;

    return {
      totalAgents,
      onlineCount,
      offlineCount,
      healthStatus,
      systemHealth: totalAgents > 0 ? (healthStatus / totalAgents) * 100 : 0,
      networkLatency: avgResponseTime,
      cognitiveLoad: avgCognitiveLoad * 100,
      successRate: avgSuccessRate * 100,
    };
  }, [allAgentIds, onlineAgents, avgResponseTime, avgCognitiveLoad, avgSuccessRate]);

  // Get performance and position data for selected agent
  const selectedPerformanceData = useAppSelector((state) => 
    dashboardState.selectedAgentId ? selectPerformanceData(dashboardState.selectedAgentId)(state) : null
  );
  const selectedPositionData = useAppSelector((state) => 
    dashboardState.selectedAgentId ? selectPositionData(dashboardState.selectedAgentId)(state) : null
  );

  // Local state for UI interactions
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Refresh data handler
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    dispatch(setDashboardLoading(true));
    
    try {
      if (dashboardState.selectedAgentId) {
        // Refresh selected agent data
        await dispatch(fetchDashboardData(dashboardState.selectedAgentId)).unwrap();
      } else {
        // Refresh all agents data (limited to first 10 for performance)
        const agentIdsToRefresh = allAgentIds.slice(0, 10);
        await Promise.all(
          agentIdsToRefresh.map(id => dispatch(fetchDashboardData(id)).unwrap())
        );
      }
    } catch (error) {
      dispatch(setDashboardError(error instanceof Error ? error.message : 'Failed to refresh data'));
    } finally {
      setIsRefreshing(false);
      dispatch(setDashboardLoading(false));
    }
  }, [dispatch, isRefreshing, dashboardState.selectedAgentId, allAgentIds]);

  // Auto-refresh effect
  useEffect(() => {
    if (!settings.refreshRate || settings.refreshRate <= 0) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, settings.refreshRate);

    return () => clearInterval(interval);
  }, [settings.refreshRate, handleRefresh]);

  // Fullscreen toggle handler
  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Agent selection handler
  const handleAgentSelect = useCallback((selectedAgentId: string) => {
    dispatch(selectAgent(selectedAgentId));
    onAgentSelect?.(selectedAgentId);
  }, [dispatch, onAgentSelect]);

  // Render loading state
  if (dashboardState.loading && !selectedMetrics) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        className={className}
      >
        <Box textAlign="center">
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Render error state
  if (dashboardState.error) {
    return (
      <Box className={className}>
        <Alert 
          severity="error" 
          action={
            <Fab 
              size="small" 
              color="error" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshIcon />
            </Fab>
          }
        >
          {dashboardState.error}
        </Alert>
      </Box>
    );
  }

  // Main dashboard render
  return (
    <Box 
      className={className}
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: theme.palette.background.default,
        '&.fullscreen': {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.modal,
        },
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          background: alpha(theme.palette.primary.main, 0.02),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Agent Overview Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time cognitive state monitoring and performance metrics
            </Typography>
          </Box>
          
          <Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh Data">
                <Fab
                  size="small"
                  color="primary"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshIcon sx={{
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }} />
                </Fab>
              </Tooltip>
              
              <Tooltip title="Settings">
                <Fab size="small" color="secondary">
                  <SettingsIcon />
                </Fab>
              </Tooltip>
              
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <Fab size="small" onClick={handleFullscreenToggle}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </Fab>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* System Metrics Overview */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(4, 1fr)'
          },
          gap: { xs: 1, sm: 1.5, md: 2, lg: 2, xl: 2 },
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Typography variant="h4" color="primary">
              {derivedMetrics.systemHealth.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {derivedMetrics.healthStatus} healthy agents
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Online Agents
            </Typography>
            <Typography variant="h4" color="success.main">
              {derivedMetrics.onlineCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              of {derivedMetrics.totalAgents} total
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Avg Response Time
            </Typography>
            <Typography variant="h4" color="info.main">
              {derivedMetrics.networkLatency.toFixed(0)}ms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              across all agents
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Avg Cognitive Load
            </Typography>
            <Typography variant="h4" color="warning.main">
              {derivedMetrics.cognitiveLoad.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              system-wide average
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Dashboard Content */}
      {selectedMetrics ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr',
              md: '2fr 1fr',
              lg: '2fr 1fr',
              xl: '2fr 1fr'
            },
            gap: { xs: 1, sm: 1.5, md: 2, lg: 2, xl: 2 },
          }}
        >
          {/* Selected Agent Details */}
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Agent Details: {selectedMetrics.agentId}
            </Typography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr',
                  md: '1fr 1fr',
                  lg: '1fr 1fr',
                  xl: '1fr 1fr'
                },
                gap: { xs: 1, sm: 1.5, md: 2, lg: 2, xl: 2 },
              }}
            >
              {/* Cognitive Load Gauge */}
              <Box>
                <CognitiveLoadGauge
                  value={selectedMetrics.cognitiveLoad.current}
                  threshold={selectedMetrics.cognitiveLoad.threshold}
                  trend={selectedMetrics.cognitiveLoad.trend}
                  size={'large' as const}
                  animated={settings.animations}
                  showThreshold={true}
                  showTrend={true}
                />
              </Box>

              {/* Agent Status Indicator */}
              <Box>
                <AgentStatusIndicator
                  agent={agent || {
                    id: selectedMetrics.agentId,
                    name: selectedMetrics.agentId,
                    profile: '',
                    status: 'online',
                    lastUpdate: Date.now(),
                    context: {
                      position: { x: 0, y: 0, z: 0 },
                      health: selectedMetrics.health.healthScore,
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
                          name: selectedMetrics.agentId,
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
                  }}
                  metrics={selectedMetrics}
                  selected={true}
                  onSelect={handleAgentSelect}
                  compact={false}
                  showDetails={true}
                />
              </Box>

              {/* Performance Metrics */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <PerformanceMetrics
                  agentId={selectedMetrics.agentId}
                  data={selectedPerformanceData || {
                    agentId: selectedMetrics.agentId,
                    timeRange: '1h',
                    metrics: {
                      responseTime: {
                        timestamps: [],
                        values: [],
                        average: 0,
                        min: 0,
                        max: 0,
                      },
                      cognitiveLoad: {
                        timestamps: [],
                        values: [],
                        average: 0,
                        peaks: [],
                      },
                      successRate: {
                        timestamps: [],
                        values: [],
                        average: 0,
                        trend: 'stable',
                      },
                      memoryUsage: {
                        timestamps: [],
                        values: [],
                        average: 0,
                        peak: 0,
                      },
                      cpuUsage: {
                        timestamps: [],
                        values: [],
                        average: 0,
                        peak: 0,
                      },
                    },
                  }}
                  timeRange="1h"
                  onTimeRangeChange={(range: any) => console.log('Time range changed:', range)}
                  chartType="line"
                  onChartTypeChange={(type: any) => console.log('Chart type changed:', type)}
                  onRefresh={handleRefresh}
                  showCharts={true}
                  compact={false}
                  loading={dashboardState.loading}
                />
              </Box>
            </Box>
          </Paper>

          {/* Position Map */}
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Agent Position
            </Typography>
            <AgentPositionMap
              agentId={selectedMetrics.agentId}
              positionData={selectedPositionData || {
                agentId: selectedMetrics.agentId,
                currentPosition: {
                  x: 0,
                  y: 0,
                  z: 0,
                  dimension: 'overworld',
                },
                positionHistory: [],
                movement: {
                  speed: 0,
                  direction: 0,
                  distance: 0,
                },
                nearbyEntities: [],
              }}
              showHistory={true}
              showEntities={true}
              mapStyle={settings.visualization.mapStyle}
              onCenterOnAgent={() => console.log('Center on agent')}
            />
          </Paper>
        </Box>
      ) : (
        /* No Agent Selected - Show Agent Grid */
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Select an Agent to View Details
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(250px, 1fr))',
                md: 'repeat(auto-fill, minmax(280px, 1fr))',
                lg: 'repeat(auto-fill, minmax(300px, 1fr))',
                xl: 'repeat(auto-fill, minmax(320px, 1fr))'
              },
              gap: { xs: 1, sm: 1.5, md: 2, lg: 2, xl: 2 },
            }}
          >
            {Object.values(dashboardState.metrics).slice(0, 12).map((agentMetrics) => (
              <AgentStatusIndicator
                key={agentMetrics.agentId}
                agent={agent || {
                  id: agentMetrics.agentId,
                  name: agentMetrics.agentId,
                  profile: '',
                  status: 'online',
                  lastUpdate: Date.now(),
                  context: {
                    position: { x: 0, y: 0, z: 0 },
                    health: agentMetrics.health.healthScore,
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
                        name: agentMetrics.agentId,
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
                }}
                metrics={agentMetrics}
                selected={dashboardState.selectedAgentId === agentMetrics.agentId}
                onSelect={handleAgentSelect}
                compact={true}
                showDetails={false}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Global styles for animations - using inline styles instead */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `,
        }}
      />
    </Box>
  );
};

export default React.memo(AgentOverviewDashboard);
import React, { useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store';
import { AgentOverviewDashboard, DEFAULT_DASHBOARD_SETTINGS } from '../dashboard';
import type { AgentState } from '../../types/agent';
import type {
  AgentRealTimeMetrics,
  PerformanceData,
  AgentPositionData
} from '../../types/dashboard';

interface OverviewTabProps {
  agent: AgentState;
}

/**
 * OverviewTab Component
 *
 * This tab now displays the sophisticated Agent Overview Dashboard
 * with real-time cognitive state visualization, performance metrics,
 * and agent status monitoring.
 */
const OverviewTab: React.FC<OverviewTabProps> = ({ agent }) => {
  const dashboardState = useAppSelector((state: any) => state.dashboard);

  // Generate mock metrics from agent data (in real implementation, this would come from Redux)
  const metrics = useMemo<AgentRealTimeMetrics>(() => ({
    agentId: agent.id,
    timestamp: Date.now(),
    cognitiveLoad: {
      current: agent.cognitive.processing.cognitiveLoad,
      trend: 'stable' as const,
      threshold: 0.8,
      history: [0.3, 0.4, 0.5, 0.6, 0.7, agent.cognitive.processing.cognitiveLoad],
    },
    performance: {
      responseTime: agent.executive.performanceMetrics.cognitiveProcessingTime,
      successRate: agent.executive.performanceMetrics.successRate,
      memoryUsage: agent.executive.performanceMetrics.memoryUsage,
      cpuUsage: 45, // Mock CPU usage
    },
    activity: {
      currentAction: agent.executive.currentAction.description,
      actionDuration: 5000, // Mock duration
      actionProgress: 0.75, // Mock progress
      goalProgress: 0.6, // Mock goal progress
    },
    health: {
      healthStatus: agent.context.health > 15 ? 'optimal' :
                   agent.context.health > 10 ? 'normal' :
                   agent.context.health > 5 ? 'warning' : 'critical',
      healthScore: (agent.context.health / 20) * 100,
      energyLevel: agent.context.food / 20,
      resourceLevel: 0.8, // Mock resource level
    },
  }), [agent]);

  // Generate mock performance data (in real implementation, this would come from Redux)
  const performanceData = useMemo<PerformanceData>(() => ({
    agentId: agent.id,
    timeRange: '1h',
    metrics: {
      responseTime: {
        timestamps: Array.from({ length: 10 }, (_, i) => Date.now() - (9 - i) * 60000),
        values: Array.from({ length: 10 }, () => agent.executive.performanceMetrics.cognitiveProcessingTime + Math.random() * 100 - 50),
        average: agent.executive.performanceMetrics.cognitiveProcessingTime,
        min: agent.executive.performanceMetrics.cognitiveProcessingTime - 50,
        max: agent.executive.performanceMetrics.cognitiveProcessingTime + 50,
      },
      cognitiveLoad: {
        timestamps: Array.from({ length: 10 }, (_, i) => Date.now() - (9 - i) * 60000),
        values: Array.from({ length: 10 }, () => agent.cognitive.processing.cognitiveLoad + Math.random() * 0.2 - 0.1),
        average: agent.cognitive.processing.cognitiveLoad,
        peaks: [0.8, 0.9],
      },
      successRate: {
        timestamps: Array.from({ length: 10 }, (_, i) => Date.now() - (9 - i) * 60000),
        values: Array.from({ length: 10 }, () => agent.executive.performanceMetrics.successRate + Math.random() * 0.1 - 0.05),
        average: agent.executive.performanceMetrics.successRate,
        trend: 'stable' as const,
      },
      memoryUsage: {
        timestamps: Array.from({ length: 10 }, (_, i) => Date.now() - (9 - i) * 60000),
        values: Array.from({ length: 10 }, () => agent.executive.performanceMetrics.memoryUsage + Math.random() * 20 - 10),
        average: agent.executive.performanceMetrics.memoryUsage,
        peak: agent.executive.performanceMetrics.memoryUsage + 20,
      },
      cpuUsage: {
        timestamps: Array.from({ length: 10 }, (_, i) => Date.now() - (9 - i) * 60000),
        values: Array.from({ length: 10 }, () => 45 + Math.random() * 20 - 10),
        average: 45,
        peak: 65,
      },
    },
  }), [agent]);

  // Generate mock position data (in real implementation, this would come from Redux)
  const positionData = useMemo<AgentPositionData>(() => ({
    agentId: agent.id,
    currentPosition: {
      x: agent.context.position.x,
      y: agent.context.position.y,
      z: agent.context.position.z,
      dimension: agent.context.dimension,
    },
    positionHistory: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (19 - i) * 30000,
      x: agent.context.position.x + Math.random() * 10 - 5,
      y: agent.context.position.y,
      z: agent.context.position.z + Math.random() * 10 - 5,
      dimension: agent.context.dimension,
    })),
    movement: {
      speed: 2.5, // Mock speed
      direction: 45, // Mock direction
      distance: 150, // Mock distance
    },
    nearbyEntities: [], // Mock empty entities
  }), [agent]);

  // Get dashboard settings from Redux or use defaults
  const settings = dashboardState?.settings || DEFAULT_DASHBOARD_SETTINGS;

  // Initialize dashboard data when component mounts
  useEffect(() => {
    console.log(`[OverviewTab] Initializing dashboard for agent: ${agent.name}`);
  }, [agent]);

  return (
    <AgentOverviewDashboard
      agentId={agent.id}
      agent={agent}
      metrics={metrics}
      performanceData={performanceData}
      positionData={positionData}
      settings={settings}
      onAgentSelect={(agentId) => {
        console.log(`[OverviewTab] Agent selected: ${agentId}`);
        // Handle agent selection if needed
      }}
      onSettingsChange={(newSettings) => {
        console.log(`[OverviewTab] Settings changed:`, newSettings);
        // Dispatch settings change to Redux if needed
        // dispatch(updateDashboardSettings(newSettings));
      }}
    />
  );
};

export default OverviewTab;
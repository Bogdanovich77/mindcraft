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
      current: 0.5, // Mock cognitive load for simplified architecture
      trend: 'stable' as const,
      threshold: 0.8,
      history: [0.3, 0.4, 0.5, 0.6, 0.7, 0.5], // Mock history
    },
    performance: {
      responseTime: 250, // Mock response time in ms
      successRate: 0.95, // Mock success rate
      memoryUsage: 128, // Mock memory usage in MB
      cpuUsage: 45, // Mock CPU usage
    },
    activity: {
      currentAction: agent.lastAction || 'idle',
      actionDuration: 5000, // Mock duration
      actionProgress: 0.75, // Mock progress
      goalProgress: 0.6, // Mock goal progress
    },
    health: {
      healthStatus: agent.worldContext.health > 15 ? 'optimal' :
                   agent.worldContext.health > 10 ? 'normal' :
                   agent.worldContext.health > 5 ? 'warning' : 'critical',
      healthScore: (agent.worldContext.health / 20) * 100,
      energyLevel: agent.worldContext.food / 20,
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
        values: Array.from({ length: 10 }, () => 250 + Math.random() * 100 - 50),
        average: 250,
        min: 200,
        max: 300,
      },
      cognitiveLoad: {
        timestamps: Array.from({ length: 10 }, (_, i) => Date.now() - (9 - i) * 60000),
        values: Array.from({ length: 10 }, () => 0.5 + Math.random() * 0.2 - 0.1),
        average: 0.5,
        peaks: [0.8, 0.9],
      },
      successRate: {
        timestamps: Array.from({ length: 10 }, (_, i) => Date.now() - (9 - i) * 60000),
        values: Array.from({ length: 10 }, () => 0.95 + Math.random() * 0.1 - 0.05),
        average: 0.95,
        trend: 'stable' as const,
      },
      memoryUsage: {
        timestamps: Array.from({ length: 10 }, (_, i) => Date.now() - (9 - i) * 60000),
        values: Array.from({ length: 10 }, () => 128 + Math.random() * 20 - 10),
        average: 128,
        peak: 148,
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
      x: agent.worldContext.position.x,
      y: agent.worldContext.position.y,
      z: agent.worldContext.position.z,
      dimension: agent.worldContext.dimension,
    },
    positionHistory: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (19 - i) * 30000,
      x: agent.worldContext.position.x + Math.random() * 10 - 5,
      y: agent.worldContext.position.y,
      z: agent.worldContext.position.z + Math.random() * 10 - 5,
      dimension: agent.worldContext.dimension,
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
import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store';
import { PerformanceMetricsDashboard } from '../performance';
import {
  selectCurrentAgentMetrics,
  selectPerformanceLoading,
  selectPerformanceError,
  initializePerformanceSocket,
  cleanupPerformanceSocket
} from '../../store/slices/performanceSlice';
import type { AgentState } from '../../types/agent';

interface PerformanceTabProps {
  agent?: AgentState;
  agentId?: string;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ agent, agentId }) => {
  const dispatch = useAppDispatch();
  
  // Get agent ID from either agent prop or direct agentId prop
  const currentAgentId = agent?.id || agentId || '';
  
  // Select live streaming data from Redux store
  const performanceMetrics = useAppSelector(selectCurrentAgentMetrics);
  const performanceLoading = useAppSelector(selectPerformanceLoading);
  const performanceError = useAppSelector(selectPerformanceError);

  // Initialize performance data subscription when component mounts
  useEffect(() => {
    if (currentAgentId) {
      console.log(`[PerformanceTab] Initializing performance visualization for agent: ${currentAgentId}`);
      
      // Initialize performance socket and subscribe to real-time data
      dispatch(initializePerformanceSocket(currentAgentId) as any);
    }

    return () => {
      // Cleanup subscription when component unmounts or agent changes
      if (currentAgentId) {
        dispatch(cleanupPerformanceSocket(currentAgentId) as any);
      }
    };
  }, [dispatch, currentAgentId]);

  // Handle loading and error states
  if (performanceLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading Performance Data...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch performance metrics for {currentAgentId}.
        </Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (performanceError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Performance Data Error</Typography>
        <Typography variant="body2" color="text.secondary">
          Failed to load performance data for agent {currentAgentId}: {performanceError}
        </Typography>
      </Box>
    );
  }

  if (!currentAgentId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No Agent Data Available</Typography>
        <Typography variant="body2" color="text.secondary">
          No agent data is available for {currentAgentId}. Please check if agent is properly connected.
        </Typography>
      </Box>
    );
  }

  return (
    <PerformanceMetricsDashboard
      agentId={currentAgentId}
    />
  );
};

export default PerformanceTab;
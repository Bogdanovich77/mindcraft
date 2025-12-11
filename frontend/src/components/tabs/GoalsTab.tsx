import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import type { AgentState } from '../../types/agent';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchGoalHierarchy } from '../../store/slices/goalsSlice';
import { initializeGoalSocketService, getGoalSocketService } from '../../services/goalSocketService';
import GoalHierarchyVisualization from '../goals/GoalHierarchyVisualization';
import { selectGoalHierarchy, selectGoalLoadingState, selectGoalError } from '../../store/slices/goalsSlice';

interface GoalsTabProps {
  agentId: string;
  agent?: AgentState;
}

const GoalsTab: React.FC<GoalsTabProps> = ({ agentId, agent }) => {
  const dispatch = useAppDispatch();
  
  // Get live goal data from Redux store
  const goalData = useAppSelector(state => selectGoalHierarchy(state, agentId));
  const goalLoading = useAppSelector(state => selectGoalLoadingState(state, agentId));
  const goalError = useAppSelector(state => selectGoalError(state, agentId));
  
  // Use live data if available, fallback to agent prop
  const currentAgent = agent || useAppSelector(state => selectAgentById(state, agentId));
  
  // Initialize goal socket service and fetch goals when component mounts or agent changes
  useEffect(() => {
    const goalSocketService = initializeGoalSocketService();
    
    if (currentAgent?.id) {
      // Subscribe to real-time goal updates
      goalSocketService.subscribeToGoals(currentAgent.id);
      
      // Request initial goal hierarchy
      goalSocketService.requestGoalHierarchy(currentAgent.id);
      
      // Fallback: also fetch via HTTP
      dispatch(fetchGoalHierarchy(currentAgent.id));
    }

    return () => {
      // Cleanup subscription when component unmounts or agent changes
      if (currentAgent?.id) {
        goalSocketService.unsubscribeFromGoals();
      }
    };
  }, [dispatch, currentAgent?.id]);

  // Handle loading and error states
  if (goalLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading Goal Data...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch goal hierarchy for {agentId}.
        </Typography>
      </Box>
    );
  }

  if (goalError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Goal Data Error</Typography>
        <Typography variant="body2" color="text.secondary">
          Failed to load goal data for agent {agentId}: {goalError}
        </Typography>
      </Box>
    );
  }

  if (!currentAgent) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No Agent Data Available</Typography>
        <Typography variant="body2" color="text.secondary">
          No agent data is available for {agentId}. Please check if agent is properly connected.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <GoalHierarchyVisualization
        agentId={agentId}
        goals={goalData ? [
          ...goalData.strategicGoals,
          ...goalData.tacticalGoals,
          ...goalData.operationalGoals
        ] : []}
      />
    </Box>
  );
};

export default GoalsTab;
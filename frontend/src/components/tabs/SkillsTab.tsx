import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store';
import { SkillProgressionVisualization } from '../skills';
import { 
  selectSkills, 
  selectSkillsLoading, 
  selectSkillsError,
  initializeSkillsSocket,
  subscribeToSkillSocket,
  unsubscribeFromSkillSocket
} from '../../store/slices/skillsSlice';
import type { AgentState } from '../../types/agent';

interface SkillsTabProps {
  agent?: AgentState;
  agentId?: string;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ agent, agentId }) => {
  const dispatch = useAppDispatch();
  
  // Get agent ID from either agent prop or direct agentId prop
  const currentAgentId = agent?.id || agentId || '';
  
  // Select live streaming data from Redux store
  const skills = useAppSelector(selectSkills);
  const skillsLoading = useAppSelector(selectSkillsLoading);
  const skillsError = useAppSelector(selectSkillsError);

  // Initialize skills data subscription when component mounts
  useEffect(() => {
    if (currentAgentId) {
      console.log(`[SkillsTab] Initializing skills visualization for agent: ${currentAgentId}`);
      
      // Initialize skills socket and subscribe to real-time data
      dispatch(initializeSkillsSocket() as any);
      dispatch(subscribeToSkillSocket(currentAgentId) as any);
    }

    return () => {
      // Cleanup subscription when component unmounts or agent changes
      if (currentAgentId) {
        dispatch(unsubscribeFromSkillSocket(currentAgentId) as any);
      }
    };
  }, [dispatch, currentAgentId]);

  // Handle loading and error states
  if (skillsLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading Skills Data...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch skills progression for {currentAgentId}.
        </Typography>
      </Box>
    );
  }

  if (skillsError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Skills Data Error</Typography>
        <Typography variant="body2" color="text.secondary">
          Failed to load skills data for agent {currentAgentId}: {skillsError}
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
    <SkillProgressionVisualization
      agentId={currentAgentId}
    />
  );
};

export default SkillsTab;
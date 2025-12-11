import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store';
import { SocialRelationshipVisualization } from '../social';
import { 
  selectCurrentNetwork, 
  selectSocialLoading, 
  selectSocialError,
  subscribeToSocialAgent,
  unsubscribeFromSocialAgent
} from '../../store/slices/socialSlice';
import type { AgentState } from '../../types/agent';

interface SocialTabProps {
  agent?: AgentState;
  agentId?: string;
}

const SocialTab: React.FC<SocialTabProps> = ({ agent, agentId }) => {
  const dispatch = useAppDispatch();
  
  // Get agent ID from either agent prop or direct agentId prop
  const currentAgentId = agent?.id || agentId || '';
  
  // Select live streaming data from Redux store
  const socialNetwork = useAppSelector(selectCurrentNetwork);
  const socialLoading = useAppSelector(selectSocialLoading);
  const socialError = useAppSelector(selectSocialError);

  // Initialize social data subscription when component mounts
  useEffect(() => {
    if (currentAgentId) {
      console.log(`[SocialTab] Initializing social visualization for agent: ${currentAgentId}`);
      
      // Subscribe to real-time social data for this agent
      dispatch(subscribeToSocialAgent(currentAgentId) as any);
    }

    return () => {
      // Cleanup subscription when component unmounts or agent changes
      if (currentAgentId) {
        dispatch(unsubscribeFromSocialAgent(currentAgentId) as any);
      }
    };
  }, [dispatch, currentAgentId]);

  // Handle loading and error states
  if (socialLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading Social Data...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch social network for {currentAgentId}.
        </Typography>
      </Box>
    );
  }

  if (socialError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Social Data Error</Typography>
        <Typography variant="body2" color="text.secondary">
          Failed to load social data for agent {currentAgentId}: {socialError}
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
    <SocialRelationshipVisualization
      agentId={currentAgentId}
    />
  );
};

export default SocialTab;
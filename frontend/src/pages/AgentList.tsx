import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  OnlinePrediction as OnlineIcon,
  OfflineBolt as OfflineIcon,
  Settings as IdleIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store';
import {
  selectAllAgents,
  selectAgentsLoading,
  selectAgentsError,
  updateAgentStatus,
  updateAgentPosition,
  updateAgentHealth,
} from '../store/slices/agentsSlice';
import type { AgentState } from '../types/agent';

const AgentList: React.FC = () => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector(selectAllAgents);
  const loading = useAppSelector(selectAgentsLoading);
  const error = useAppSelector(selectAgentsError);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial data loading
    dispatch(updateAgentStatus({ agentId: 'demo-1', status: 'online' }));
    dispatch(updateAgentPosition({ agentId: 'demo-1', position: { x: 100, y: 64, z: 200 } }));
    dispatch(updateAgentHealth({ agentId: 'demo-1', health: 20 }));
  }, [dispatch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <OnlineIcon color="success" />;
      case 'offline':
        return <OfflineIcon color="error" />;
      case 'idle':
        return <IdleIcon color="warning" />;
      case 'busy':
        return <PersonIcon color="info" />;
      default:
        return <OfflineIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'idle':
        return 'warning';
      case 'busy':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleAgentClick = (agent: AgentState) => {
    setSelectedAgentId(agent.id === selectedAgentId ? null : agent.id);
  };

  const handleRefresh = () => {
    // This would trigger a refresh from the server
    console.log('Refreshing agent list...');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6">Loading agents...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="error">
          Error loading agents: {error}
        </Typography>
      </Box>
    );
  }

  if (agents.size === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary">
          No agents available
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Agent Dashboard
        </Typography>
        <Tooltip title="Refresh agent list">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={3}
      >
        {Array.from(agents.values()).map((agent) => (
          <Box>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                border: selectedAgentId === agent.id ? 2 : 0,
                borderColor: selectedAgentId === agent.id ? 'primary.main' : 'transparent',
              }}
              onClick={() => handleAgentClick(agent)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {getStatusIcon(agent.status)}
                  <Box ml={1} flex={1}>
                    <Typography variant="h6" component="h2">
                      {agent.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {agent.profile}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Chip
                    label={agent.status.toUpperCase()}
                    color={getStatusColor(agent.status) as any}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                <Box display="flex" gap={2} flexWrap="wrap">
                  <Box sx={{ flex: '1 1 200px', minWidth: 120 }}>
                    <Typography variant="body2" color="text.secondary">
                      Health
                    </Typography>
                    <Typography variant="h6">
                      {agent.context.health}/20
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 120 }}>
                    <Typography variant="body2" color="text.secondary">
                      Level
                    </Typography>
                    <Typography variant="h6">
                      {agent.context.level}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 120 }}>
                    <Typography variant="body2" color="text.secondary">
                      Position
                    </Typography>
                    <Typography variant="body2" noWrap>
                      ({agent.context.position.x}, {agent.context.position.y}, {agent.context.position.z})
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 120 }}>
                    <Typography variant="body2" color="text.secondary">
                      Dimension
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {agent.context.dimension}
                    </Typography>
                  </Box>
                </Box>

                {agent.cognitive.processing.currentPhase && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Current Phase
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {agent.cognitive.processing.currentPhase}
                    </Typography>
                  </Box>
                )}

                {agent.reactive.lastReactiveAction && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Last Action
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {agent.reactive.lastReactiveAction.mode}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AgentList;
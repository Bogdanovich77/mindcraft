import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button,
  LinearProgress,
  Fade,
  Paper,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
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
  setAgents,
  updateAgent,
} from '../store/slices/agentsSlice';
import {
  connectToServer,
  reconnectToServer,
  clearConnectionError
} from '../store/slices/connectionSlice';
import { getSocketService } from '../services/socketService';
import ConnectionStatus from '../components/common/ConnectionStatus';
import DebugPanel from '../components/common/DebugPanel';
import type { AgentState } from '../types/agent';

const AgentList: React.FC = () => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector(selectAllAgents);
  const loading = useAppSelector(selectAgentsLoading);
  const error = useAppSelector(selectAgentsError);
  const connectionState = useAppSelector((state: any) => state.connection);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle connection management
  const handleReconnect = useCallback(() => {
    console.log('[AgentList] Manual reconnect triggered');
    dispatch(reconnectToServer());
  }, [dispatch]);


  const handleClearError = useCallback(() => {
    console.log('[AgentList] Clearing connection error');
    dispatch(clearConnectionError());
  }, [dispatch]);

  // Enhanced refresh with loading state
  const handleRefresh = useCallback(async () => {
    const socketService = getSocketService();
    if (!socketService) {
      console.error('[AgentList] Socket service not available');
      return;
    }

    console.log('[AgentList] Refreshing agent list...');
    setRefreshing(true);
    
    try {
      // Request agent list with multiple methods for reliability
      socketService.requestAgentList();
      socketService.send('getAgents', {});
      socketService.send('listen-to-agents', {});
      
      // Wait a bit for the response
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('[AgentList] Error refreshing agents:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    console.log('[AgentList] Component mounted, initializing connection');
    dispatch(connectToServer());
  }, [dispatch]);

  // Socket event handlers - Register immediately when socket service is available
  useEffect(() => {
    const socketService = getSocketService();
    
    if (!socketService) {
      console.error('[AgentList] Socket service not available');
      return;
    }

    console.log('[AgentList] Setting up socket event listeners immediately');

    // Handle agent list updates
    const handleAgentList = (data: any) => {
      console.log('[AgentList] Received agent list:', data);
      
      // Handle both formats: direct array and { agents: [...] }
      const agentsArray = Array.isArray(data) ? data : (data.agents || []);
      
      if (agentsArray.length === 0) {
        console.log('[AgentList] No agents found, clearing agent list');
        dispatch(setAgents([]));
        return;
      }
      
      // Transform backend data format to frontend format
      const agentSummaries = agentsArray.map((agent: any) => ({
        id: agent.name,
        name: agent.name,
        profile: 'default',
        status: agent.in_game ? 'online' : 'offline',
        position: { x: 0, y: 64, z: 0 },
        health: 20,
        level: 1,
        lastUpdate: Date.now(),
      }));
      
      dispatch(setAgents(agentSummaries));
    };

    // Handle individual agent state updates
    const handleAgentUpdate = (data: any) => {
      console.log('[AgentList] Received agent update:', data);
      
      Object.entries(data).forEach(([agentName, state]: [string, any]) => {
        if (state && typeof state === 'object' && !state.error) {
          const updates: Partial<AgentState> = {
            id: agentName,
            name: agentName,
            lastUpdate: Date.now(),
            status: 'online',
          };

          if (state.context?.position) {
            updates.context = {
              ...state.context,
              position: state.context.position,
            };
          }

          if (state.context?.health !== undefined) {
            updates.context = {
              position: { x: 0, y: 64, z: 0 },
              health: state.context.health,
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
              ...updates.context,
            };
          }

          dispatch(updateAgent({ agentId: agentName, updates }));
        }
      });
    };

    // Register event listeners immediately - don't wait for connection status
    socketService.on('agentList', handleAgentList);
    socketService.on('agents-status', handleAgentList);
    socketService.on('agentUpdate', handleAgentUpdate);

    // Request agents immediately if already connected, otherwise the connection
    // status change effect will handle it
    if (socketService.getStatus().isConnected) {
      console.log('[AgentList] Already connected, requesting agents immediately');
      setTimeout(() => {
        socketService.requestAgentList();
        socketService.send('getAgents', {});
        socketService.send('listen-to-agents', {});
      }, 100);
    }

    return () => {
      console.log('[AgentList] Cleaning up socket listeners');
      socketService.off('agentList', handleAgentList);
      socketService.off('agents-status', handleAgentList);
      socketService.off('agentUpdate', handleAgentUpdate);
    };
  }, [dispatch]); // Remove connectionState.status dependency to prevent re-registration


  // Status helpers
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

  // Loading state with progress indicator
  if (loading && agents.size === 0) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Agent Dashboard
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Open Debug Panel">
              <IconButton onClick={() => setDebugPanelOpen(true)}>
                <BugReportIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Initializing Agent Dashboard...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Establishing connection to MindServer
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Paper>
      </Box>
    );
  }

  // Error state with helpful information
  if (error && agents.size === 0) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Agent Dashboard
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Open Debug Panel">
              <IconButton onClick={() => setDebugPanelOpen(true)}>
                <BugReportIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleClearError}>
              Clear
            </Button>
          }
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" gutterBottom>
            Connection Error
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>

        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <ErrorIcon color="error" />
            <Typography variant="h6">
              Unable to connect to MindServer
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Please check the following:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2">
              MindServer is running and accessible
            </Typography>
            <Typography component="li" variant="body2">
              Network connection is stable
            </Typography>
            <Typography component="li" variant="body2">
              Firewall is not blocking the connection
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={handleReconnect}
            >
              Try Reconnect
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // No agents state
  if (agents.size === 0 && connectionState.status === 'connected') {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Agent Dashboard
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Open Debug Panel">
              <IconButton onClick={() => setDebugPanelOpen(true)}>
                <BugReportIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <WarningIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Agents Available
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Connected to MindServer, but no agents are currently running.
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header with connection status */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Agent Dashboard
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Open Debug Panel">
              <IconButton onClick={() => setDebugPanelOpen(true)}>
                <BugReportIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Connection Status Component */}
        <ConnectionStatus
          status={connectionState.status}
          error={connectionState.error}
          latency={connectionState.metrics?.latency}
          lastPingTime={connectionState.metrics?.lastPingTime}
          isReconnecting={connectionState.isReconnecting}
          onReconnect={handleReconnect}
          onRefresh={handleRefresh}
          showDetails={true}
          compact={false}
        />

        {/* Refresh progress */}
        <Fade in={refreshing}>
          <Box sx={{ mt: 1 }}>
            <LinearProgress />
          </Box>
        </Fade>
      </Box>

      {/* Agent Grid */}
      <Grid container spacing={3}>
        {Array.from(agents.values()).map((agent) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={agent.id}>
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
          </Grid>
        ))}
      </Grid>

      {/* Debug Panel */}
      <DebugPanel open={debugPanelOpen} onClose={() => setDebugPanelOpen(false)} />
    </Box>
  );
};

export default AgentList;
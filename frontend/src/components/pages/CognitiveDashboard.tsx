import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Alert,
  Button,
  LinearProgress,
  Fade,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Memory as MemoryIcon,
  Flag as FlagIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  selectAllAgents,
  selectAgentsLoading,
  selectAgentsError,
  selectSelectedAgent,
  selectAgent,
} from '../../store/slices/agentsSlice';
import {
  selectActiveTab,
  setActiveTab,
} from '../../store/slices/uiSlice';
import {
  connectToServer,
  reconnectToServer,
  clearConnectionError
} from '../../store/slices/connectionSlice';
import { selectAgent as selectAgentAction } from '../../store/slices/agentsSlice';
import { getSocketService } from '../../services/socketService';
import ConnectionStatus from '../common/ConnectionStatus';
import DebugPanel from '../common/DebugPanel';

// Import tab components (simplified for simplified architecture)
import OverviewTab from '../tabs/OverviewTab';
import PersonalityTab from '../tabs/PersonalityTab';
import ConversationLogTab from '../tabs/ConversationLogTab';
import DriveTab from '../tabs/DriveTab';
import SelfAwarenessTab from '../tabs/SelfAwarenessTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simplified-tabpanel-${index}`}
      aria-labelledby={`simplified-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `simplified-tab-${index}`,
    'aria-controls': `simplified-tabpanel-${index}`,
  };
};

const CognitiveDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector(selectAllAgents);
  const loading = useAppSelector(selectAgentsLoading);
  const error = useAppSelector(selectAgentsError);
  const selectedAgent = useAppSelector(selectSelectedAgent);
  const activeTab = useAppSelector(selectActiveTab);
  const connectionState = useAppSelector((state: any) => state.connection);
  
  const [tabValue, setTabValue] = useState(0);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simplified tab configuration for core functionality
  const tabs = [
    { label: 'Overview', icon: <DashboardIcon />, key: 'overview' },
    { label: 'Personality', icon: <PersonIcon />, key: 'personality' },
    { label: 'Conversation', icon: <MemoryIcon />, key: 'conversation' },
    { label: 'Drive', icon: <FlagIcon />, key: 'drive' },
    { label: 'Self-Awareness', icon: <PeopleIcon />, key: 'selfawareness' },
  ];

  // Handle tab changes
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    dispatch(setActiveTab(tabs[newValue].key));
  };

  // Handle connection management
  const handleReconnect = () => {
    console.log('[CognitiveDashboard] Manual reconnect triggered');
    dispatch(reconnectToServer());
  };
 
   
  const handleClearError = () => {
    console.log('[CognitiveDashboard] Clearing connection error');
    dispatch(clearConnectionError());
  };

  // Enhanced refresh with loading state
  const handleRefresh = async () => {
    const socketService = getSocketService();
    if (!socketService) {
      console.error('[CognitiveDashboard] Socket service not available');
      return;
    }
  
    console.log('[CognitiveDashboard] Refreshing agent list...');
    setRefreshing(true);
    
    try {
      socketService.requestAgentList();
      socketService.send('getAgents', {});
      socketService.send('listen-to-agents', {});
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('[CognitiveDashboard] Error refreshing agents:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize connection on mount
  useEffect(() => {
    console.log('[CognitiveDashboard] Component mounted, initializing connection');
    dispatch(connectToServer());
  }, [dispatch]);

  // Sync tab value with activeTab from store
  useEffect(() => {
    const tabIndex = tabs.findIndex(tab => tab.key === activeTab);
    if (tabIndex !== -1 && tabIndex !== tabValue) {
      setTabValue(tabIndex);
    }
  }, [activeTab, tabValue, tabs]);

  // Loading state
  if (loading && Object.keys(agents).length === 0) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Simplified Cognitive Dashboard
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
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Initializing Simplified Dashboard...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Establishing connection to MindServer
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Error state
  if (error && Object.keys(agents).length === 0) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Simplified Cognitive Dashboard
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
          <Typography variant="h6" gutterBottom>
            Unable to connect to MindServer
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Please check the following:
          </Typography>
          
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
  if (Object.keys(agents).length === 0 && connectionState.status === 'connected') {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Simplified Cognitive Dashboard
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
    <Box p={3} data-testid="cognitive-dashboard">
      {/* Header with connection status */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Simplified Cognitive Dashboard
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

      {/* Agent Selection */}
      {Object.keys(agents).length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Agent
          </Typography>
          <Grid container spacing={2}>
            {Object.values(agents).map((agent) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
                <Card
                  data-testid="agent-card"
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                    border: selectedAgent?.id === agent.id ? 2 : 0,
                    borderColor: selectedAgent?.id === agent.id ? 'primary.main' : 'transparent',
                  }}
                  onClick={() => dispatch(selectAgentAction(agent.id))}
                >
                  <CardContent sx={{ pb: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip
                        label={agent.status.toUpperCase()}
                        color={
                          agent.status === 'online' ? 'success' :
                          agent.status === 'offline' ? 'error' :
                          agent.status === 'idle' ? 'warning' : 'default'
                        }
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {agent.profile}
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div">
                      {agent.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Health: {agent.context.health}/20
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Main Tab Interface */}
      {selectedAgent ? (
        <Paper sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Simplified cognitive dashboard tabs"
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.key}
                  icon={tab.icon}
                  label={tab.label}
                  {...a11yProps(index)}
                  data-testid={`${tab.key}-tab`}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <OverviewTab agent={selectedAgent} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <PersonalityTab agent={selectedAgent} />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <ConversationLogTab agent={selectedAgent} />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <DriveTab agent={selectedAgent} />
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <SelfAwarenessTab agent={selectedAgent} />
          </TabPanel>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Select an Agent to View Simplified Cognitive Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose an agent from the cards above to explore their personality, conversation, drive, and self-awareness.
          </Typography>
        </Paper>
      )}

      {/* Debug Panel */}
      <DebugPanel open={debugPanelOpen} onClose={() => setDebugPanelOpen(false)} />
    </Box>
  );
};

export default CognitiveDashboard;
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  Badge,
  Switch,
  FormControlLabel,
  Drawer,
  useTheme,
  useMediaQuery,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Memory as MemoryIcon,
  Flag as GoalsIcon,
  People as SocialIcon,
  TrendingUp as SkillsIcon,
  Speed as PerformanceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import {
  selectAllAgents,
  selectAgentsLoading,
  selectAgentsError,
  setAgents,
} from '../store/slices/agentsSlice';
import {
  selectGlobalLoading,
  selectGlobalError,
} from '../store/slices/uiSlice';
import { getSocketService } from '../services/socketService';
import ErrorBoundary from '../components/common/ErrorBoundary';
import OverviewTab from '../components/tabs/OverviewTab';
import PersonalityTab from '../components/tabs/PersonalityTab';
import MemoryTab from '../components/tabs/MemoryTab';
import GoalsTab from '../components/tabs/GoalsTab';
import SocialTab from '../components/tabs/SocialTab';
import SkillsTab from '../components/tabs/SkillsTab';
import PerformanceTab from '../components/tabs/PerformanceTab';
import type { AgentState } from '../types/agent';

interface CognitiveDashboardProps {
  agentId?: string;
}

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      style={{
        height: '100%',
        overflow: 'auto',
        display: value === index ? 'block' : 'none',
      }}
    >
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
};

const CognitiveDashboard: React.FC<CognitiveDashboardProps> = ({ agentId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Redux state
  const agents = useAppSelector(selectAllAgents);
  const agentsLoading = useAppSelector(selectAgentsLoading);
  const agentsError = useAppSelector(selectAgentsError);
  const globalLoading = useAppSelector(selectGlobalLoading);
  const globalError = useAppSelector(selectGlobalError);

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agentId || '');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [darkMode, setDarkMode] = useState(theme.palette.mode === 'dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Socket service
  const socketService = getSocketService();

  // Set up socket event listeners for agent list
  useEffect(() => {
    const socketService = getSocketService();
    
    if (!socketService) {
      console.error('[CognitiveDashboard] Socket service not available');
      return;
    }

    console.log('[CognitiveDashboard] Setting up socket event listeners for agents');

    // Handle agent list updates
    const handleAgentList = (data: any) => {
      console.log('[CognitiveDashboard] Received agent list:', data);
      
      // Handle both formats: direct array and { agents: [...] }
      const agentsArray = Array.isArray(data) ? data : (data.agents || []);
      
      if (agentsArray.length === 0) {
        console.log('[CognitiveDashboard] No agents found, clearing agent list');
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
      
      console.log('[CognitiveDashboard] Dispatching agents to Redux:', agentSummaries);
      dispatch(setAgents(agentSummaries));
    };

    // Register event listeners
    socketService.on('agentList', handleAgentList);
    socketService.on('agents-status', handleAgentList);

    // Request agents immediately if already connected
    if (socketService.getStatus().isConnected) {
      console.log('[CognitiveDashboard] Already connected, requesting agents immediately');
      setTimeout(() => {
        socketService.requestAgentList();
        socketService.send('getAgents', {});
        socketService.send('listen-to-agents', {});
      }, 100);
    }

    return () => {
      console.log('[CognitiveDashboard] Cleaning up socket listeners');
      socketService.off('agentList', handleAgentList);
      socketService.off('agents-status', handleAgentList);
    };
  }, [dispatch]);

  // Get current agent data
  const currentAgent = useMemo(() => {
    return agents.find((agent: any) => agent.id === selectedAgentId);
  }, [agents, selectedAgentId]);

  // Tab configuration
  const tabs = useMemo(() => [
    { label: 'Overview', icon: <DashboardIcon />, component: OverviewTab },
    { label: 'Personality', icon: <PersonIcon />, component: PersonalityTab },
    { label: 'Memory', icon: <MemoryIcon />, component: MemoryTab },
    { label: 'Goals', icon: <GoalsIcon />, component: GoalsTab },
    { label: 'Social', icon: <SocialIcon />, component: SocialTab },
    { label: 'Skills', icon: <SkillsIcon />, component: SkillsTab },
    { label: 'Performance', icon: <PerformanceIcon />, component: PerformanceTab },
  ], []);

  // Connection status
  const connectionStatus = useMemo(() => {
    if (!socketService) return { status: 'disconnected', color: 'error' };
    
    const status = socketService.getStatus();
    return {
      status: status.isConnected ? 'connected' : status.isConnecting ? 'connecting' : 'disconnected',
      color: status.isConnected ? 'success' : status.isConnecting ? 'warning' : 'error',
      latency: status.metrics.averageLatency,
      uptime: status.metrics.connectionUptime,
    };
  }, [socketService]);

  // Handle tab change
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  // Handle agent selection
  const handleAgentSelect = useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
    // Update URL to reflect selected agent
    const params = new URLSearchParams(location.search);
    if (agentId) {
      params.set('agent', agentId);
    } else {
      params.delete('agent');
    }
    const newSearch = params.toString();
    navigate(`${location.pathname}?${newSearch}`, { replace: true });
  }, [location.pathname, navigate]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreenMode(true);
    } else {
      document.exitFullscreen();
      setFullscreenMode(false);
    }
  }, []);

  // Handle theme toggle
  const handleThemeToggle = useCallback(() => {
    const newMode = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    // In a real app, this would update the theme
    document.documentElement.setAttribute('data-theme', newMode);
  }, [darkMode]);

  // Handle settings menu
  const handleSettingsMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget);
  }, []);

  const handleSettingsMenuClose = useCallback(() => {
    setSettingsMenuAnchor(null);
  }, []);

  // Handle search toggle
  const handleSearchToggle = useCallback(() => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchTerm('');
    }
  }, [showSearch]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    // In a real implementation, this would filter data across all tabs
    console.log('Searching for:', term);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (socketService) {
      socketService.requestAgentList();
    }
  }, [socketService]);

  // Handle export
  const handleExport = useCallback(() => {
    if (currentAgent) {
      const exportData = {
        agent: currentAgent,
        timestamp: Date.now(),
        version: '1.0.0',
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-${currentAgent.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [currentAgent]);

  // Handle import
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          console.log('Imported data:', importData);
          // In a real implementation, this would update the agent data
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        handleSearchToggle();
      }
      
      // Ctrl/Cmd + / for command palette
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        // In a real implementation, this would open command palette
      }
      
      // Escape to close modals
      if (event.key === 'Escape') {
        setShowSearch(false);
        setSettingsMenuAnchor(null);
        setDebugPanelOpen(false);
      }
      
      // F11 for fullscreen
      if (event.key === 'F11') {
        event.preventDefault();
        handleFullscreenToggle();
      }
      
      // Ctrl/Cmd + R for refresh
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSearchToggle, handleFullscreenToggle, handleRefresh]);

  // Initialize selected agent from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlAgentId = params.get('agent');
    if (urlAgentId && urlAgentId !== selectedAgentId) {
      setSelectedAgentId(urlAgentId);
    }
  }, [location.search, selectedAgentId]);

  // Auto-select first agent if none selected
  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      const firstAgent = agents[0];
      if (firstAgent) {
        handleAgentSelect(firstAgent.id);
      }
    }
  }, [selectedAgentId, agents, handleAgentSelect]);

  // Render current tab content
  const renderTabContent = useCallback(() => {
    if (!currentAgent) return null;
    
    const CurrentTabComponent = tabs[activeTab].component;
    return (
      <ErrorBoundary errorId={`tab-${activeTab}`}>
        <CurrentTabComponent 
          agent={currentAgent}
          agentId={currentAgent.id}
        />
      </ErrorBoundary>
    );
  }, [activeTab, tabs, currentAgent]);

  // Loading state
  if (agentsLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6">Loading Agents...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch agent data from MindServer
        </Typography>
      </Box>
    );
  }

  // Error state
  if (agentsError) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error.main">Connection Error</Typography>
        <Typography variant="body2" color="text.secondary">
          Failed to load agents: {agentsError}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Left side - Agent selection and connection status */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
            {/* Connection Status Indicator */}
            <Tooltip title={`Connection: ${connectionStatus.status} (${connectionStatus.latency}ms)`}>
              <Badge 
                color={connectionStatus.color} 
                variant="dot"
                overlap="circular"
                sx={{ mr: 1 }}
              >
                {connectionStatus.status === 'connected' ? (
                  <WifiIcon />
                ) : (
                  <WifiOffIcon />
                )}
              </Badge>
            </Tooltip>

            {/* Agent Selection Dropdown */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Agent:
              </Typography>
              <select
                value={selectedAgentId}
                onChange={(e) => handleAgentSelect(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontSize: '14px',
                  minWidth: '150px',
                }}
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.status})
                  </option>
                ))}
                </select>
            </Box>
          </Box>

          {/* Center - Search */}
          {showSearch && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: 400 }}>
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <input
                type="text"
                placeholder="Search across all tabs..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontSize: '14px',
                }}
                autoFocus
              />
            </Box>
          )}

          {/* Right side - Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search Toggle */}
            <Tooltip title="Search (Ctrl+K)">
              <IconButton onClick={handleSearchToggle}>
                <SearchIcon />
              </IconButton>
            </Tooltip>

            {/* Refresh */}
            <Tooltip title="Refresh (Ctrl+R)">
              <IconButton onClick={handleRefresh} disabled={agentsLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={handleThemeToggle}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Fullscreen */}
            <Tooltip title={fullscreenMode ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}>
              <IconButton onClick={handleFullscreenToggle}>
                {fullscreenMode ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>

            {/* Settings */}
            <Tooltip title="Settings">
              <IconButton onClick={handleSettingsMenuOpen}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            {/* Debug (Development only) */}
            {import.meta.env.DEV && (
              <Tooltip title="Debug Panel">
                <IconButton onClick={() => setDebugPanelOpen(!debugPanelOpen)}>
                  <BugReportIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 64px)' }}>
        {/* Sidebar for mobile */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 240,
                boxSizing: 'border-box',
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Navigation
              </Typography>
              {tabs.map((tab, index) => (
                <Button
                  key={tab.label}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    mb: 1,
                    color: activeTab === index ? 'primary' : 'inherit'
                  }}
                  onClick={() => {
                    setActiveTab(index);
                    if (isMobile) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    {tab.icon}
                    <Typography variant="body2">{tab.label}</Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          </Drawer>
        )}

        {/* Main Content Area */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Global Loading Overlay */}
          {globalLoading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6">Processing...</Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we process your request
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Global Error Alert */}
          {globalError && (
            <Alert 
              severity="error" 
              sx={{ 
                position: 'absolute',
                top: 80,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9998,
                maxWidth: 600,
              }}
              action={
                <Button size="small" onClick={() => dispatch({ type: 'ui/clearError' })}>
                  Dismiss
                </Button>
              }
            >
              <Typography variant="h6">System Error</Typography>
              <Typography variant="body2">{globalError}</Typography>
            </Alert>
          )}

          {/* Tab Navigation (Desktop) */}
          {!isMobile && (
            <Paper sx={{ borderRadius: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                  },
                  '& .MuiTab-root': {
                    minHeight: 64,
                    textTransform: 'none',
                    fontWeight: 500,
                  },
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={tab.label}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {tab.icon}
                        <Typography variant="body2">{tab.label}</Typography>
                      </Box>
                    }
                    value={index}
                    aria-label={`${tab.label} tab`}
                  />
                ))}
              </Tabs>
            </Paper>
          )}

          {/* Tab Content */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {currentAgent ? (
              renderTabContent()
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                flexDirection: 'column',
                gap: 2
              }}>
                <WarningIcon sx={{ fontSize: 64, color: 'warning.main' }} />
                <Typography variant="h6" color="text.secondary">
                  No Agent Selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please select an agent from the dropdown above to view its cognitive dashboard
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={handleSettingsMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => { handleExport(); handleSettingsMenuClose(); }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Export Agent Data</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => { document.getElementById('import-file-input')?.click(); handleSettingsMenuClose(); }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Import Agent Data</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => { navigate('/agents'); handleSettingsMenuClose(); }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Agent Management</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => { window.open('/settings', '_blank'); handleSettingsMenuClose(); }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Global Settings</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => { window.print(); handleSettingsMenuClose(); }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Print Dashboard</Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Hidden file input for import */}
      <input
        id="import-file-input"
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      {/* Debug Panel (Development only) */}
      {import.meta.env.DEV && debugPanelOpen && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 300,
            maxHeight: 400,
            zIndex: 9999,
            p: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Debug Panel</Typography>
            <IconButton size="small" onClick={() => setDebugPanelOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" gutterBottom>
            Agent: {currentAgent?.name || 'None'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Tab: {tabs[activeTab].label}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Connection: {connectionStatus.status}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Latency: {connectionStatus.latency}ms
          </Typography>
          <Typography variant="body2" gutterBottom>
            Theme: {darkMode ? 'Dark' : 'Light'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Mobile: {isMobile ? 'Yes' : 'No'}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Agents: {agents.length}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Agent Names: {agents.map(a => a.name).join(', ') || 'None'}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Performance Metrics
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={connectionStatus.status === 'connected' ? 100 : 30} 
              sx={{ mt: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              CPU: {Math.floor(Math.random() * 30 + 20)}% | Memory: {Math.floor(Math.random() * 40 + 30)}%
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CognitiveDashboard;
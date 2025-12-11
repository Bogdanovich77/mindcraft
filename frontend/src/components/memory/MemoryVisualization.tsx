import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import type { RootState } from '../../store/types';
import { fetchMemorySystem, clearMemorySystem } from '../../store/slices/memorySlice';

// Import memory visualization components
import SemanticMemoryGraph from './SemanticMemoryGraph';
import EpisodicMemoryTimeline from './EpisodicMemoryTimeline';
import ProceduralMemoryPatterns from './ProceduralMemoryPatterns';
import MemoryConsolidationViewer from './MemoryConsolidationViewer';
import MemorySearchTool from './MemorySearchTool';
import MemoryStrengthVisualization from './MemoryStrengthVisualization';
import MemoryCorrelationAnalysis from './MemoryCorrelationAnalysis';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`memory-tabpanel-${index}`}
      aria-labelledby={`memory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `memory-tab-${index}`,
    'aria-controls': `memory-tabpanel-${index}`,
  };
}

interface MemoryVisualizationProps {
  agentId?: string;
  width?: number;
  height?: number;
  onMemorySelect?: (memoryId: string, type: string) => void;
}

const MemoryVisualization: React.FC<MemoryVisualizationProps> = ({
  agentId,
  width = 1200,
  height = 800,
  onMemorySelect,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    memorySystems,
    loading,
    error,
    lastUpdate
  } = useSelector((state: RootState) => state.memory);
  
  // Get current agent's memory system
  const memorySystem = agentId ? memorySystems[agentId] : undefined;
  const isLoading = agentId ? loading[agentId] || false : false;
  const currentError = agentId ? error[agentId] : null;
  
  const [currentTab, setCurrentTab] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (agentId) {
      dispatch(fetchMemorySystem(agentId));
    }
  }, [dispatch, agentId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleRefresh = () => {
    if (agentId) {
      dispatch(fetchMemorySystem(agentId));
    }
  };

  const handleClearData = () => {
    if (agentId) {
      dispatch(clearMemorySystem({ agentId }));
    }
  };

  const handleExportData = () => {
    if (memorySystem) {
      const dataStr = JSON.stringify(memorySystem, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `memory-system-${agentId || 'unknown'}-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Calculate memory statistics
  const memoryStats = React.useMemo(() => {
    if (!memorySystem) return null;

    const semanticCount = memorySystem.semantic?.concepts?.length || 0;
    const episodicCount = memorySystem.episodic?.events?.length || 0;
    const proceduralCount = memorySystem.procedural?.skills?.length || 0;
    const totalMemories = semanticCount + episodicCount + proceduralCount;

    const avgSemanticStrength = semanticCount > 0 
      ? memorySystem.semantic!.concepts.reduce((sum: number, c: any) => sum + c.strength, 0) / semanticCount
      : 0;
    
    const avgEpisodicSignificance = episodicCount > 0
      ? memorySystem.episodic!.events.reduce((sum: number, e: any) => sum + e.significance, 0) / episodicCount
      : 0;
    
    const avgProceduralProficiency = proceduralCount > 0
      ? memorySystem.procedural!.skills.reduce((sum: number, s: any) => sum + s.proficiency.overall, 0) / proceduralCount
      : 0;

    return {
      totalMemories,
      semanticCount,
      episodicCount,
      proceduralCount,
      avgSemanticStrength,
      avgEpisodicSignificance,
      avgProceduralProficiency,
    };
  }, [memorySystem]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Memory System...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (currentError) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading memory system: {currentError}
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          Retry
        </Button>
      </Paper>
    );
  }

  if (!memorySystem) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No memory data available. Please select an agent.
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          Refresh
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: 2, 
      height: isFullscreen ? '100vh' : height, 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Memory System Visualization
          {agentId && ` - Agent: ${agentId}`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExportData}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Data">
            <IconButton onClick={handleClearData}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle Fullscreen">
            <IconButton onClick={toggleFullscreen}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Memory Statistics */}
      {memoryStats && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 2,
          mb: 2
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {memoryStats.totalMemories}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Memories
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {memoryStats.semanticCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Semantic Concepts
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Strength: {memoryStats.avgSemanticStrength.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {memoryStats.episodicCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Episodic Events
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Significance: {memoryStats.avgEpisodicSignificance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {memoryStats.proceduralCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Procedural Skills
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Proficiency: {memoryStats.avgProceduralProficiency.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="Memory visualization tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Semantic Graph" {...a11yProps(0)} />
          <Tab label="Episodic Timeline" {...a11yProps(1)} />
          <Tab label="Procedural Patterns" {...a11yProps(2)} />
          <Tab label="Consolidation" {...a11yProps(3)} />
          <Tab label="Search" {...a11yProps(4)} />
          <Tab label="Strength & Decay" {...a11yProps(5)} />
          <Tab label="Correlations" {...a11yProps(6)} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={currentTab} index={0}>
          <SemanticMemoryGraph
            memorySystem={memorySystem}
          />
        </TabPanel>
        
        <TabPanel value={currentTab} index={1}>
          <EpisodicMemoryTimeline
            memorySystem={memorySystem}
          />
        </TabPanel>
        
        <TabPanel value={currentTab} index={2}>
          <ProceduralMemoryPatterns
            memorySystem={memorySystem}
          />
        </TabPanel>
        
        <TabPanel value={currentTab} index={3}>
          <MemoryConsolidationViewer
            memorySystem={memorySystem}
          />
        </TabPanel>
        
        <TabPanel value={currentTab} index={4}>
          <MemorySearchTool
            memorySystem={memorySystem}
            onResultSelect={(result) => onMemorySelect?.(result.id, result.type)}
          />
        </TabPanel>
        
        <TabPanel value={currentTab} index={5}>
          <MemoryStrengthVisualization
            memorySystem={memorySystem}
            width={width - 64}
            height={height - 300}
            onMemorySelect={onMemorySelect}
          />
        </TabPanel>
        
        <TabPanel value={currentTab} index={6}>
          <MemoryCorrelationAnalysis
            memorySystem={memorySystem}
            width={width - 64}
            height={height - 300}
            onCorrelationSelect={(correlation) => {
              // Handle correlation selection
              console.log('Correlation selected:', correlation);
            }}
          />
        </TabPanel>
      </Box>

      {/* Footer */}
      {lastUpdate && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(lastUpdate).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MemoryVisualization;
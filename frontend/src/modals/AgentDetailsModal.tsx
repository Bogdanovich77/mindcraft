import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Psychology as PsychologyIcon,
  Flag as FlagIcon,
  Memory as MemoryIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import type { AgentDetailsModalProps } from '../types/modals';

export const AgentDetailsModal: React.FC<AgentDetailsModalProps> = ({
  open,
  onClose,
  agentId,
  agent,
  onEdit,
  onDelete,
  onExport,
  showActions = true,
  activeTab = 'overview',
  maxWidth = 'lg',
  fullWidth = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  loading = false
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue as any);
  };

  const handleEdit = () => {
    if (onEdit && agent) {
      onEdit(agent);
    }
  };

  const handleDelete = () => {
    if (onDelete && agentId) {
      onDelete(agentId);
    }
    onClose();
  };

  const handleExport = () => {
    if (onExport && agent) {
      onExport(agent);
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (!disableBackdropClick) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!disableEscapeKeyDown && event.key === 'Escape') {
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'idle': return 'warning';
      default: return 'info';
    }
  };

  const renderOverviewTab = () => (
    <Stack spacing={2}>
      <Typography variant="h6" gutterBottom>
        Agent Overview
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" gutterBottom>
            Basic Information
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>ID:</strong> {agent?.id || agentId}
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {agent?.name || 'Unknown'}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> 
                <Chip 
                  label={agent?.status || 'Unknown'} 
                  color={getStatusColor(agent?.status || 'unknown') as any}
                  size="small"
                />
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {agent?.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'Unknown'}
              </Typography>
            </Stack>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" gutterBottom>
            Performance Metrics
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Cognitive Load:</strong> {agent?.cognitiveLoad || 'N/A'}%
              </Typography>
              <Typography variant="body2">
                <strong>Response Time:</strong> {agent?.responseTime || 'N/A'}ms
              </Typography>
              <Typography variant="body2">
                <strong>Success Rate:</strong> {agent?.successRate || 'N/A'}%
              </Typography>
              <Typography variant="body2">
                <strong>Uptime:</strong> {agent?.uptime || 'N/A'}%
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderPersonalityTab = () => (
    <Stack spacing={2}>
      <Typography variant="h6" gutterBottom>
        Personality Profile
      </Typography>
      
      {agent?.personality && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Big Five Traits
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Openness:</strong> {agent.personality.openness}/100
                </Typography>
                <Typography variant="body2">
                  <strong>Conscientiousness:</strong> {agent.personality.conscientiousness}/100
                </Typography>
                <Typography variant="body2">
                  <strong>Extraversion:</strong> {agent.personality.extraversion}/100
                </Typography>
                <Typography variant="body2">
                  <strong>Agreeableness:</strong> {agent.personality.agreeableness}/100
                </Typography>
                <Typography variant="body2">
                  <strong>Neuroticism:</strong> {agent.personality.neuroticism}/100
                </Typography>
              </Stack>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Gaming Traits
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Risk Tolerance:</strong> {agent.personality.riskTolerance}/100
                </Typography>
                <Typography variant="body2">
                  <strong>Creativity:</strong> {agent.personality.creativity}/100
                </Typography>
                <Typography variant="body2">
                  <strong>Patience:</strong> {agent.personality.patience}/100
                </Typography>
                <Typography variant="body2">
                  <strong>Competitiveness:</strong> {agent.personality.competitiveness}/100
                </Typography>
                <Typography variant="body2">
                  <strong>Curiosity:</strong> {agent.personality.curiosity}/100
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      )}
    </Stack>
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return renderOverviewTab();
      case 'personality':
        return renderPersonalityTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
      BackdropProps={{
        onClick: handleBackdropClick
      }}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <PersonIcon />
            <Typography variant="h6" component="div">
              Agent Details
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Overview" value="overview" icon={<PersonIcon />} />
            <Tab label="Personality" value="personality" icon={<PsychologyIcon />} />
            <Tab label="Goals" value="goals" icon={<FlagIcon />} />
            <Tab label="Memory" value="memory" icon={<MemoryIcon />} />
            <Tab label="Social" value="social" icon={<GroupsIcon />} />
            <Tab label="Skills" value="skills" icon={<SchoolIcon />} />
            <Tab label="Performance" value="performance" icon={<TrendingUpIcon />} />
          </Tabs>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          {renderContent()}
        </Box>
      </DialogContent>
      
      {showActions && (
        <DialogActions>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={handleEdit}
                variant="outlined"
                startIcon={<EditIcon />}
                disabled={loading || !agent}
              >
                Edit
              </Button>
              
              <Button
                onClick={handleExport}
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={loading || !agent}
              >
                Export
              </Button>
            </Box>
            
            <Button
              onClick={handleDelete}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AgentDetailsModal;
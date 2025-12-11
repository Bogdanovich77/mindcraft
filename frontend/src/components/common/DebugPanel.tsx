import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Paper,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/types';
import { clearConnectionError } from '../../store/slices/connectionSlice';
import { getSocketService } from '../../services/socketService';

interface DebugPanelProps {
  open: boolean;
  onClose: () => void;
}

interface DebugEvent {
  id: string;
  timestamp: number;
  type: 'socket' | 'agent' | 'system' | 'error';
  event: string;
  data: any;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const maxEvents = 100; // Fixed value, no setter needed
  const eventsEndRef = useRef<HTMLDivElement>(null);
  
  const connectionState = useSelector((state: RootState) => state.connection);
  const agentsState = useSelector((state: RootState) => state.agents);

  // Add event to debug log
  const addEvent = (type: DebugEvent['type'], event: string, data: any) => {
    const newEvent: DebugEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      event,
      data,
    };

    setEvents(prev => {
      const updated = [...prev, newEvent];
      // Keep only the last maxEvents
      if (updated.length > maxEvents) {
        return updated.slice(-maxEvents);
      }
      return updated;
    });
  };

  // Listen to socket events for debugging
  useEffect(() => {
    if (open) {
      // Get socket service for debugging
      const socketService = getSocketService();
      if (!socketService) {
        addEvent('system', 'socket_service_unavailable', 'Socket service not available');
        return;
      }

      // Note: This is a simplified implementation
      // In a real scenario, you'd need to access the actual socket from the service
      addEvent('system', 'debug_panel_active', 'Socket monitoring enabled');
    }
  }, [open]);

  // Auto-scroll to bottom when new events are added
  useEffect(() => {
    if (autoScroll && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  // Clear events
  const clearEvents = () => {
    setEvents([]);
  };

  // Copy events to clipboard
  const copyEvents = () => {
    const eventsText = events.map(e => 
      `[${new Date(e.timestamp).toISOString()}] ${e.type.toUpperCase()}: ${e.event}\n${JSON.stringify(e.data, null, 2)}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(eventsText);
  };

  // Get event type color
  const getEventTypeColor = (type: DebugEvent['type']) => {
    switch (type) {
      case 'socket': return 'primary';
      case 'agent': return 'success';
      case 'system': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: '50%', minWidth: 400, maxWidth: 800 },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <BugReportIcon color="action" />
              <Typography variant="h6">Debug Panel</Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FormControlLabel
              control={
                <Switch
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  size="small"
                />
              }
              label="Auto-scroll"
            />
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearEvents}
              variant="outlined"
            >
              Clear
            </Button>
            <Button
              size="small"
              startIcon={<CopyIcon />}
              onClick={copyEvents}
              variant="outlined"
            >
              Copy
            </Button>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => dispatch(clearConnectionError())}
              variant="outlined"
            >
              Clear Error
            </Button>
          </Box>
        </Box>

        {/* Connection Status */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>Connection Status</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={`Status: ${connectionState.status}`}
              color={connectionState.status === 'connected' ? 'success' : 
                     connectionState.status === 'connecting' ? 'warning' : 'error'}
              size="small"
            />
            <Chip
              label={`Agents: ${agentsState.agents.size}`}
              color="primary"
              size="small"
            />
            {connectionState.latency && (
              <Chip
                label={`Latency: ${connectionState.latency}ms`}
                color={connectionState.latency < 100 ? 'success' :
                       connectionState.latency < 300 ? 'warning' : 'error'}
                size="small"
              />
            )}
            {connectionState.isReconnecting && (
              <Chip
                label="Reconnecting"
                color="warning"
                size="small"
              />
            )}
          </Box>
          {connectionState.error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {connectionState.error}
            </Alert>
          )}
        </Box>

        {/* Events Log */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Event Log ({events.length})</Typography>
          
          {events.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <Typography color="text.secondary">No events logged yet</Typography>
            </Box>
          ) : (
            <Box>
              {events.map((event) => (
                <Accordion key={event.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      <Chip
                        label={event.type.toUpperCase()}
                        color={getEventTypeColor(event.type) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {event.event}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(event.timestamp)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Event Data:
                      </Typography>
                      <Paper sx={{ p: 1, mt: 1, bgcolor: 'grey.900' }}>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            color: 'grey.100',
                            fontSize: '0.75rem',
                            overflow: 'auto',
                            maxHeight: 200,
                          }}
                        >
                          {JSON.stringify(event.data, null, 2)}
                        </Typography>
                      </Paper>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
              <div ref={eventsEndRef} />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Debug information is for development purposes only
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default DebugPanel;
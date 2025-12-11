/**
 * Connection Status Indicator Component
 * 
 * Provides real-time visual feedback about Socket.IO connection status,
 * including connection state, latency, and error information.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  SignalCellular4Bar,
  SignalCellular3Bar,
  SignalCellular2Bar,
  SignalCellular1Bar,
  SignalCellularConnectedNoInternet4Bar,
  Error,
  Refresh,
  Settings,
  Info,
  CheckCircle,
  Warning,
  ReportProblem
} from '@mui/icons-material';

// Types for connection status
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting' | 'error';

export interface ConnectionMetrics {
  latency: number;
  uptime: number;
  reconnectAttempts: number;
  lastConnected?: number;
  lastDisconnected?: number;
  messagesReceived: number;
  messagesSent: number;
  errors: number;
}

export interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  metrics: ConnectionMetrics;
  onReconnect?: () => void;
  onDisconnect?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  status,
  metrics,
  onReconnect,
  onDisconnect,
  showDetails = false,
  compact = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReconnect = () => {
    if (onReconnect) {
      onReconnect();
      setAlertMessage('Attempting to reconnect...');
      setShowAlert(true);
    }
    handleMenuClose();
  };

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
      setAlertMessage('Disconnected from server');
      setShowAlert(true);
    }
    handleMenuClose();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi color="success" />;
      case 'connecting':
        return <SignalCellularConnectedNoInternet4Bar color="warning" />;
      case 'reconnecting':
        return <Refresh color="warning" sx={{ animation: 'spin 1s linear infinite' }} />;
      case 'error':
        return <Error color="error" />;
      case 'disconnected':
      default:
        return <WifiOff color="disabled" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
      case 'reconnecting':
        return 'warning';
      case 'error':
        return 'error';
      case 'disconnected':
      default:
        return 'default';
    }
  };

  const getLatencyIcon = () => {
    if (metrics.latency < 50) return <SignalCellular4Bar color="success" />;
    if (metrics.latency < 100) return <SignalCellular3Bar color="success" />;
    if (metrics.latency < 200) return <SignalCellular2Bar color="warning" />;
    if (metrics.latency < 500) return <SignalCellular1Bar color="warning" />;
    return <ReportProblem color="error" />;
  };

  const getLatencyColor = () => {
    if (metrics.latency < 50) return 'success';
    if (metrics.latency < 100) return 'success';
    if (metrics.latency < 200) return 'warning';
    if (metrics.latency < 500) return 'warning';
    return 'error';
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatLatency = (ms: number) => {
    if (ms < 1) return '<1ms';
    return `${Math.round(ms)}ms`;
  };

  if (compact) {
    return (
      <>
        <Tooltip title={`Status: ${status} | Latency: ${formatLatency(metrics.latency)}`}>
          <IconButton size="small" onClick={handleMenuOpen}>
            <Badge badgeContent={metrics.errors > 0 ? metrics.errors : 0} color="error">
              {getStatusIcon()}
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 280 }
          }}
        >
          <MenuItem disabled>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="subtitle2">Connection Details</Typography>
            </ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem disabled>
            <ListItemIcon>
              {getStatusIcon()}
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Status: {status}</Typography>
            </ListItemText>
          </MenuItem>

          <MenuItem disabled>
            <ListItemIcon>
              {getLatencyIcon()}
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Latency: {formatLatency(metrics.latency)}</Typography>
            </ListItemText>
          </MenuItem>

          <MenuItem disabled>
            <ListItemIcon>
              <CheckCircle />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Uptime: {formatUptime(metrics.uptime)}</Typography>
            </ListItemText>
          </MenuItem>

          <MenuItem disabled>
            <ListItemIcon>
              <Warning />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Reconnects: {metrics.reconnectAttempts}</Typography>
            </ListItemText>
          </MenuItem>

          <Divider />

          {status === 'disconnected' || status === 'error' ? (
            <MenuItem onClick={handleReconnect}>
              <ListItemIcon>
                <Refresh />
              </ListItemIcon>
              <ListItemText>Reconnect</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={handleDisconnect}>
              <ListItemIcon>
                <WifiOff />
              </ListItemIcon>
              <ListItemText>Disconnect</ListItemText>
            </MenuItem>
          )}
        </Menu>

        <Snackbar
          open={showAlert}
          autoHideDuration={3000}
          onClose={() => setShowAlert(false)}
        >
          <Alert onClose={() => setShowAlert(false)} severity="info" sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Status Indicator */}
      <Chip
        icon={getStatusIcon()}
        label={status}
        color={getStatusColor() as any}
        variant="outlined"
        size="small"
      />

      {/* Latency Indicator */}
      <Chip
        icon={getLatencyIcon()}
        label={formatLatency(metrics.latency)}
        color={getLatencyColor() as any}
        variant="outlined"
        size="small"
      />

      {/* Error Badge */}
      {metrics.errors > 0 && (
        <Chip
          icon={<Error />}
          label={`${metrics.errors} errors`}
          color="error"
          variant="outlined"
          size="small"
        />
      )}

      {/* Settings Menu */}
      <IconButton size="small" onClick={handleMenuOpen}>
        <Settings />
      </IconButton>

      {/* Detailed Status Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 320 }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <Info />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="subtitle2">Connection Status</Typography>
          </ListItemText>
        </MenuItem>

        <Divider />

        {/* Connection Status */}
        <MenuItem disabled>
          <ListItemIcon>
            {getStatusIcon()}
          </ListItemIcon>
          <ListItemText>
            <Box>
              <Typography variant="body2">Status: {status}</Typography>
              <LinearProgress
                variant={status === 'connecting' || status === 'reconnecting' ? 'indeterminate' : 'determinate'}
                value={status === 'connected' ? 100 : 0}
                sx={{ mt: 1 }}
              />
            </Box>
          </ListItemText>
        </MenuItem>

        {/* Latency */}
        <MenuItem disabled>
          <ListItemIcon>
            {getLatencyIcon()}
          </ListItemIcon>
          <ListItemText>
            <Box>
              <Typography variant="body2">Latency: {formatLatency(metrics.latency)}</Typography>
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, 100 - (metrics.latency / 500) * 100))}
                color={getLatencyColor() as any}
                sx={{ mt: 1 }}
              />
            </Box>
          </ListItemText>
        </MenuItem>

        {/* Uptime */}
        <MenuItem disabled>
          <ListItemIcon>
            <CheckCircle />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Uptime: {formatUptime(metrics.uptime)}</Typography>
            <Typography variant="caption" color="textSecondary">
              Connected for {formatUptime(metrics.uptime)}
            </Typography>
          </ListItemText>
        </MenuItem>

        {/* Reconnect Attempts */}
        <MenuItem disabled>
          <ListItemIcon>
            <Warning />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Reconnect Attempts: {metrics.reconnectAttempts}</Typography>
            {metrics.lastConnected && (
              <Typography variant="caption" color="textSecondary">
                Last connected: {new Date(metrics.lastConnected).toLocaleTimeString()}
              </Typography>
            )}
          </ListItemText>
        </MenuItem>

        {/* Message Statistics */}
        <MenuItem disabled>
          <ListItemIcon>
            <Info />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Messages</Typography>
            <Typography variant="caption" color="textSecondary">
              Sent: {metrics.messagesSent} | Received: {metrics.messagesReceived}
            </Typography>
          </ListItemText>
        </MenuItem>

        {/* Error Count */}
        {metrics.errors > 0 && (
          <MenuItem disabled>
            <ListItemIcon>
              <Error color="error" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" color="error">Errors: {metrics.errors}</Typography>
              {metrics.lastDisconnected && (
                <Typography variant="caption" color="textSecondary">
                  Last error: {new Date(metrics.lastDisconnected).toLocaleTimeString()}
                </Typography>
              )}
            </ListItemText>
          </MenuItem>
        )}

        <Divider />

        {/* Action Buttons */}
        {status === 'disconnected' || status === 'error' ? (
          <MenuItem onClick={handleReconnect}>
            <ListItemIcon>
              <Refresh />
            </ListItemIcon>
            <ListItemText>Reconnect</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleDisconnect}>
            <ListItemIcon>
              <WifiOff />
            </ListItemIcon>
            <ListItemText>Disconnect</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Alert Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowAlert(false)} severity="info" sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Hook for managing connection status
export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    uptime: 0,
    reconnectAttempts: 0,
    messagesReceived: 0,
    messagesSent: 0,
    errors: 0
  });

  const updateStatus = (newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    
    if (newStatus === 'connected') {
      setMetrics(prev => ({
        ...prev,
        lastConnected: Date.now(),
        uptime: Date.now() - (prev.lastConnected || Date.now())
      }));
    } else if (newStatus === 'disconnected' || newStatus === 'error') {
      setMetrics(prev => ({
        ...prev,
        lastDisconnected: Date.now(),
        uptime: 0
      }));
    }
  };

  const updateMetrics = (newMetrics: Partial<ConnectionMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  const incrementMessages = (sent: boolean = false) => {
    setMetrics(prev => ({
      ...prev,
      messagesSent: sent ? prev.messagesSent + 1 : prev.messagesSent,
      messagesReceived: !sent ? prev.messagesReceived + 1 : prev.messagesReceived
    }));
  };

  const incrementErrors = () => {
    setMetrics(prev => ({
      ...prev,
      errors: prev.errors + 1,
      lastDisconnected: Date.now()
    }));
  };

  const resetMetrics = () => {
    setMetrics({
      latency: 0,
      uptime: 0,
      reconnectAttempts: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0
    });
  };

  return {
    status,
    metrics,
    updateStatus,
    updateMetrics,
    incrementMessages,
    incrementErrors,
    resetMetrics
  };
};

export default ConnectionIndicator;
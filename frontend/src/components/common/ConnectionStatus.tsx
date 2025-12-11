import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  SignalWifiOff as SignalWifiOffIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  error?: string | null;
  latency?: number;
  lastPingTime?: number | null;
  isReconnecting?: boolean;
  onReconnect?: () => void;
  onRefresh?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  error,
  latency,
  lastPingTime,
  isReconnecting = false,
  onReconnect,
  onRefresh,
  showDetails = true,
  compact = false,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <WifiIcon />;
      case 'connecting':
        return <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} />;
      case 'error':
        return <ErrorIcon />;
      case 'disconnected':
        return isReconnecting ? <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <WifiOffIcon />;
      default:
        return <SignalWifiOffIcon />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'error':
        return 'error';
      case 'disconnected':
        return isReconnecting ? 'warning' : 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting';
      case 'error':
        return 'Error';
      case 'disconnected':
        return isReconnecting ? 'Reconnecting' : 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const formatLatency = (ms: number) => {
    if (ms < 100) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getTimeSinceLastPing = () => {
    if (!lastPingTime) return null;
    const seconds = Math.floor((Date.now() - lastPingTime) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'success';
    if (latency < 300) return 'warning';
    return 'error';
  };

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor() as any}
          size="small"
          variant="outlined"
        />
        {status === 'connected' && latency !== undefined && (
          <Chip
            label={formatLatency(latency)}
            color={getLatencyColor(latency) as any}
            size="small"
            variant="outlined"
          />
        )}
        {(status === 'error' || status === 'disconnected') && onReconnect && (
          <Tooltip title="Reconnect">
            <IconButton size="small" onClick={onReconnect}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Fade in={status === 'connecting' || isReconnecting}>
            <CircularProgress size={16} />
          </Fade>
          <Chip
            icon={getStatusIcon()}
            label={getStatusText()}
            color={getStatusColor() as any}
            size="small"
          />
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          {onRefresh && (
            <Tooltip title="Refresh connection">
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          {(status === 'error' || status === 'disconnected') && onReconnect && (
            <Tooltip title="Force reconnect">
              <IconButton size="small" onClick={onReconnect} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {error && (
        <Box mb={1}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {showDetails && (
        <Box display="flex" gap={2} flexWrap="wrap">
          {status === 'connected' && latency !== undefined && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Latency
              </Typography>
              <Typography variant="body2" color={getLatencyColor(latency) + '.main' as any}>
                {formatLatency(latency)}
              </Typography>
            </Box>
          )}

          {lastPingTime && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Ping
              </Typography>
              <Typography variant="body2">
                {getTimeSinceLastPing()}
              </Typography>
            </Box>
          )}

          {isReconnecting && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2" color="warning.main">
                Attempting to reconnect...
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default ConnectionStatus;
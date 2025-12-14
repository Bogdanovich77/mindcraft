/**
 * Agent Status Display Component
 * 
 * Component to display running agent stats with real-time updates from the agentsSlice.
 * Shows health, position, inventory, equipment and other essential agent information.
 */

import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Health as HealthIcon,
  LocationOn as LocationIcon,
  Backpack as InventoryIcon,
  Security as EquipmentIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import type { AgentState } from '../types/agent';
import { useSelector } from 'react-redux';
import { selectAgentById } from '../store/slices/agentsSlice';

interface AgentStatusDisplayProps {
  agentId: string;
  compact?: boolean;
  showDetails?: boolean;
}

const AgentStatusDisplay: React.FC<AgentStatusDisplayProps> = ({
  agentId,
  compact = false,
  showDetails = true,
}) => {
  const agent = useSelector((state: any) => selectAgentById(state, agentId));

  if (!agent) {
    return (
      <Card sx={{ minWidth: 275, height: '100%' }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            Agent not found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = (health: number) => {
    if (health > 15) return 'success';
    if (health > 8) return 'warning';
    return 'error';
  };

  const getHealthProgress = (health: number) => {
    return (health / 20) * 100; // Assuming max health is 20
  };

  const formatPosition = (position: { x: number; y: number; z: number }) => {
    return `X: ${position.x.toFixed(1)}, Y: ${position.y.toFixed(1)}, Z: ${position.z.toFixed(1)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
        return 'success';
      case 'offline':
      case 'stopped':
        return 'default';
      case 'busy':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAvatarColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
        return '#4caf50';
      case 'offline':
      case 'stopped':
        return '#9e9e9e';
      case 'busy':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  if (compact) {
    return (
      <Card sx={{ minWidth: 200, height: '100%' }}>
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: getAvatarColor(agent.status),
                width: 32,
                height: 32,
                mr: 2,
              }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {agent.name}
              </Typography>
              <Chip
                size="small"
                label={agent.status}
                color={getStatusColor(agent.status) as any}
                sx={{ height: 16, fontSize: '0.6rem' }}
              />
            </Box>
          </Box>

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HealthIcon sx={{ fontSize: 16, mr: 0.5, color: getHealthColor(agent.worldContext.health) as any }} />
                <Typography variant="caption">
                  {agent.worldContext.health}/20
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption" noWrap>
                  {agent.worldContext.position.y.toFixed(0)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Last: {formatTime(agent.lastUpdate)}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 300, height: '100%' }}>
      <CardContent>
        {/* Agent Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: getAvatarColor(agent.status),
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {agent.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {agent.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                label={agent.status}
                color={getStatusColor(agent.status) as any}
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="caption" color="text.secondary">
                Level {agent.worldContext.level}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Health Bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <HealthIcon sx={{ mr: 1, color: getHealthColor(agent.worldContext.health) as any }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              Health: {agent.worldContext.health}/20
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(getHealthProgress(agent.worldContext.health))}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getHealthProgress(agent.worldContext.health)}
            color={getHealthColor(agent.worldContext.health) as any}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {showDetails && (
          <>
            <Divider sx={{ mb: 2 }} />

            {/* World Context */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Position
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                  {formatPosition(agent.worldContext.position)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                  Dimension: {agent.worldContext.dimension} | Time: {agent.worldContext.timeOfDay}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InventoryIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Inventory
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                  {agent.worldContext.inventory.usedSlots}/{agent.worldContext.inventory.slots} slots
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EquipmentIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Equipment
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                  {Object.keys(agent.worldContext.equipment).length} items
                </Typography>
              </Grid>
            </Grid>

            {/* Agent State */}
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Current State
                </Typography>
                <Stack spacing={1}>
                  <Tooltip title="Last action performed">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SpeedIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary">
                        Action: {agent.lastAction}
                      </Typography>
                    </Box>
                  </Tooltip>

                  <Tooltip title="Agent personality">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MemoryIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary">
                        Personality: {agent.personality}
                      </Typography>
                    </Box>
                  </Tooltip>

                  <Tooltip title="Current goals">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MemoryIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary">
                        Goals: {agent.goals}
                      </Typography>
                    </Box>
                  </Tooltip>

                  {agent.mandate && (
                    <Tooltip title="Current mandate">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MemoryIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary">
                          Mandate: {agent.mandate}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {/* Last Response */}
            {agent.response && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Last Response
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontStyle: 'italic',
                  }}
                >
                  "{agent.response}"
                </Typography>
              </>
            )}
          </>
        )}

        <Divider sx={{ mb: 1, mt: 2 }} />
        
        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {formatTime(agent.lastUpdate)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Profile: {agent.profile}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AgentStatusDisplay;
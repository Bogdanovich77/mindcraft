import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Favorite as HealthIcon,
  LocalPizza as FoodIcon,
  Stars as ExperienceIcon,
  LocationOn as LocationIcon,
  WbSunny as WeatherIcon,
  Inventory as InventoryIcon,
  Security as EquipmentIcon,
  People as EntitiesIcon,
} from '@mui/icons-material';
import type { AgentState } from '../../types/agent';

interface SelfAwarenessTabProps {
  agent: AgentState;
  agentId: string;
}

const SelfAwarenessTab: React.FC<SelfAwarenessTabProps> = ({ agent }) => {
  const { worldContext } = agent;

  if (!worldContext) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No world context data available for this agent.
      </Alert>
    );
  }

  // Health status color
  const getHealthColor = (health: number) => {
    if (health > 15) return 'success';
    if (health > 10) return 'warning';
    return 'error';
  };

  // Food status color
  const getFoodColor = (food: number) => {
    if (food > 15) return 'success';
    if (food > 10) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Self-Awareness - {agent.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Real-time world context and environmental awareness
      </Typography>

      <Grid container spacing={3}>
        {/* Health & Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HealthIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Vital Signs
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Health</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {worldContext.health}/20
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(worldContext.health / 20) * 100}
                  color={getHealthColor(worldContext.health)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Food</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {worldContext.food}/20
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(worldContext.food / 20) * 100}
                  color={getFoodColor(worldContext.food)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    <ExperienceIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Experience
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Level {worldContext.level}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(worldContext.experience % 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {worldContext.experience} XP
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Position & Environment */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Location & Environment
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Coordinates
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  X: {worldContext.position.x.toFixed(1)}, 
                  Y: {worldContext.position.y.toFixed(1)}, 
                  Z: {worldContext.position.z.toFixed(1)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Dimension
                </Typography>
                <Chip 
                  label={worldContext.dimension} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Environment
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    icon={<WeatherIcon />}
                    label={worldContext.weather} 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Time: ${worldContext.timeOfDay}:00`} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Inventory ({worldContext.inventory.usedSlots}/{worldContext.inventory.slots})
              </Typography>
              
              {worldContext.inventory.items.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {worldContext.inventory.items.map((item, index) => (
                    <Chip
                      key={index}
                      label={`${item.name} x${item.count}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Inventory is empty
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Equipment */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <EquipmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Equipment
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {worldContext.equipment.helmet && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Helmet</Typography>
                    <Typography variant="body2">{worldContext.equipment.helmet.name}</Typography>
                  </Box>
                )}
                {worldContext.equipment.chestplate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Chestplate</Typography>
                    <Typography variant="body2">{worldContext.equipment.chestplate.name}</Typography>
                  </Box>
                )}
                {worldContext.equipment.leggings && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Leggings</Typography>
                    <Typography variant="body2">{worldContext.equipment.leggings.name}</Typography>
                  </Box>
                )}
                {worldContext.equipment.boots && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Boots</Typography>
                    <Typography variant="body2">{worldContext.equipment.boots.name}</Typography>
                  </Box>
                )}
                {worldContext.equipment.weapon && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Weapon</Typography>
                    <Typography variant="body2">{worldContext.equipment.weapon.name}</Typography>
                  </Box>
                )}
                {worldContext.equipment.tool && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Tool</Typography>
                    <Typography variant="body2">{worldContext.equipment.tool.name}</Typography>
                  </Box>
                )}
                {!worldContext.equipment.helmet && !worldContext.equipment.chestplate && 
                 !worldContext.equipment.leggings && !worldContext.equipment.boots && 
                 !worldContext.equipment.weapon && !worldContext.equipment.tool && (
                  <Typography variant="body2" color="text.secondary">
                    No equipment equipped
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Nearby Entities */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <EntitiesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Nearby Entities ({worldContext.nearbyEntities.length})
              </Typography>
              
              {worldContext.nearbyEntities.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {worldContext.nearbyEntities.map((entity, index) => (
                    <Chip
                      key={index}
                      label={`${entity.name || entity.type} (${entity.distance?.toFixed(1)}m)`}
                      size="small"
                      color={entity.hostile ? 'error' : 'success'}
                      variant={entity.hostile ? 'filled' : 'outlined'}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No entities nearby
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Nearby Blocks */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nearby Blocks ({worldContext.nearbyBlocks.length})
              </Typography>
              
              {worldContext.nearbyBlocks.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {worldContext.nearbyBlocks.map((block, index) => (
                    <Chip
                      key={index}
                      label={`${block.type} (${block.distance?.toFixed(1)}m)`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No notable blocks nearby
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SelfAwarenessTab;
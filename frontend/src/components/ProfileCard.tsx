/**
 * Profile Card Component
 * 
 * Individual profile display card with boot/edit/delete functionality.
 * Features responsive design with Material-UI components and visual indicators.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Tooltip,
  LinearProgress,
  Avatar,
  Stack,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Settings as SettingsIcon,
  PowerSettingsNew as PowerIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { ProfileWithStatus } from '../types/profile';
import Button from './common/Button';

interface ProfileCardProps {
  profile: ProfileWithStatus;
  onBoot: (profileName: string) => void;
  onStop: (profileName: string) => void;
  onRestart: (profileName: string) => void;
  onEdit: (profile: ProfileWithStatus) => void;
  onDelete: (profileName: string) => void;
  onSelect: (profile: ProfileWithStatus) => void;
  isSelected: boolean;
  compact?: boolean;
  isBooting?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onBoot,
  onStop,
  onRestart,
  onEdit,
  onDelete,
  onSelect,
  isSelected,
  compact = false,
  isBooting = false,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleCardClick = () => {
    onSelect(profile);
  };

  const handleBoot = (event: React.MouseEvent) => {
    event.stopPropagation();
    onBoot(profile.name);
    handleMenuClose();
  };

  const handleStop = (event: React.MouseEvent) => {
    event.stopPropagation();
    onStop(profile.name);
    handleMenuClose();
  };

  const handleRestart = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRestart(profile.name);
    handleMenuClose();
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit(profile);
    handleMenuClose();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirmDelete) {
      onDelete(profile.name);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
    }
    handleMenuClose();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running':
      case 'online':
        return 'success';
      case 'booting':
      case 'starting':
        return 'warning';
      case 'error':
      case 'failed':
        return 'error';
      case 'stopped':
      case 'offline':
        return 'default';
      case 'restarting':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'running':
      case 'online':
        return 'Running';
      case 'booting':
      case 'starting':
        return 'Booting...';
      case 'error':
      case 'failed':
        return 'Error';
      case 'stopped':
      case 'offline':
        return 'Stopped';
      case 'restarting':
        return 'Restarting...';
      default:
        return 'Available';
    }
  };

  const getAvatarColor = (model: string) => {
    const colors = {
      'gpt-4': '#10a37f',
      'gpt-3.5-turbo': '#10a37f',
      'claude-3': '#d97706',
      'llama': '#8b5cf6',
      'default': '#6b7280',
    };
    return colors[model as keyof typeof colors] || colors.default;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      sx={{
        height: compact ? 'auto' : '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: isSelected ? 'action.hover' : 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          borderColor: 'primary.light',
        },
        position: 'relative',
        overflow: 'visible',
      }}
      onClick={handleCardClick}
    >
      {/* Status indicator badge */}
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          zIndex: 1,
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Chip
              size="small"
              label={getStatusText(profile.status)}
              color={getStatusColor(profile.status) as any}
              sx={{
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          }
        >
          <Avatar
            sx={{
              bgcolor: getAvatarColor(profile.model),
              width: 48,
              height: 48,
              border: 2,
              borderColor: 'background.paper',
            }}
          >
            {getInitials(profile.name)}
          </Avatar>
        </Badge>
      </Box>

      {/* Loading progress for booting */}
      {isBooting && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        {/* Profile header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            {profile.name}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ ml: 1 }}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        {/* Model and description */}
        {!compact && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Model: <strong>{profile.model}</strong>
            </Typography>

            {profile.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {profile.description}
              </Typography>
            )}

            {/* Personality preview */}
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontStyle: 'italic',
                display: '-webkit-box',
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              "{profile.personality}"
            </Typography>

            {/* Goals preview */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              <strong>Goals:</strong> {profile.goals}
            </Typography>

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {profile.tags.slice(0, 3).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                  {profile.tags.length > 3 && (
                    <Chip
                      label={`+${profile.tags.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Stack>
              </Box>
            )}

            {/* Metadata */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {profile.lastUsed ? `Used: ${new Date(profile.lastUsed).toLocaleDateString()}` : 'Never used'}
              </Typography>
              {profile.bootAttempts && profile.bootAttempts > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Attempts: {profile.bootAttempts}
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* Compact view - minimal info */}
        {compact && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {profile.model}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {profile.isRunning ? 'Running' : 'Available'}
            </Typography>
          </Box>
        )}

        {/* Error message */}
        {profile.error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Error: {profile.error}
          </Typography>
        )}
      </CardContent>

      {/* Card actions */}
      {!compact && (
        <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            {!profile.isRunning ? (
              <Button
                variant="primary"
                size="small"
                startIcon={<PlayIcon />}
                onClick={handleBoot}
                disabled={isBooting || !profile.canBoot}
                loading={isBooting}
                sx={{ flexGrow: 1 }}
              >
                {isBooting ? 'Booting...' : 'Boot'}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  startIcon={<StopIcon />}
                  onClick={handleStop}
                  sx={{ flexGrow: 0.5 }}
                >
                  Stop
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRestart}
                  sx={{ flexGrow: 0.5 }}
                  disabled={isBooting}
                >
                  Restart
                </Button>
              </>
            )}
            
            <Button
              variant="secondary"
              size="small"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ minWidth: 80 }}
            >
              Edit
            </Button>
          </Box>
        </CardActions>
      )}

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleBoot} disabled={profile.isRunning || isBooting || !profile.canBoot}>
          <ListItemIcon>
            <PlayIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Boot Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleStop} disabled={!profile.isRunning}>
          <ListItemIcon>
            <StopIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Stop Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleRestart} disabled={!profile.isRunning || isBooting}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Restart Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>
            {confirmDelete ? 'Confirm Delete?' : 'Delete Profile'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ProfileCard;
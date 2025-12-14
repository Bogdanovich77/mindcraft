/**
 * Profile List Component
 * 
 * Main profile listing component with filtering, sorting, and search functionality.
 * Displays all available profiles from the profiles/ directory with comprehensive management options.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Fab,
  Paper,
  Toolbar,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Drawer,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { ProfileWithStatus } from '../types/profile';
import ProfileCard from './ProfileCard';
import Button from './common/Button';

interface ProfileListProps {
  profiles: ProfileWithStatus[];
  loading: boolean;
  error: string | null;
  onBoot: (profileName: string) => void;
  onStop: (profileName: string) => void;
  onEdit: (profile: ProfileWithStatus) => void;
  onDelete: (profileName: string) => void;
  onSelect: (profile: ProfileWithStatus) => void;
  selectedProfile: string | null;
  onRefresh: () => void;
  onFilterChange: (filters: any) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  onCreateNew?: () => void;
}

const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  loading,
  error,
  onBoot,
  onStop,
  onEdit,
  onDelete,
  onSelect,
  selectedProfile,
  onRefresh,
  onFilterChange,
  onViewChange,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [modelFilter, setModelFilter] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastUsed' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Extract unique models and available statuses
  const availableModels = Array.from(new Set(profiles.map(p => p.model)));
  const availableStatuses = Array.from(new Set(profiles.map(p => p.status || 'available')));

  // Filter and sort profiles
  const filteredProfiles = profiles.filter(profile => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        profile.name.toLowerCase().includes(searchLower) ||
        profile.personality.toLowerCase().includes(searchLower) ||
        profile.goals.toLowerCase().includes(searchLower) ||
        (profile.description && profile.description.toLowerCase().includes(searchLower)) ||
        profile.model.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes(profile.status || 'available')) {
      return false;
    }

    // Model filter
    if (modelFilter.length > 0 && !modelFilter.includes(profile.model)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    // Handle date comparison
    if (sortBy === 'lastUsed' || sortBy === 'createdAt') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Handle filter changes
  useEffect(() => {
    onFilterChange({
      search: searchTerm,
      status: statusFilter,
      model: modelFilter,
    });
  }, [searchTerm, statusFilter, modelFilter, onFilterChange]);

  // Handle view mode change
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onViewChange(mode);
  };

  // Handle refresh
  const handleRefresh = () => {
    onRefresh();
    setNotification({
      open: true,
      message: 'Profiles refreshed successfully',
      severity: 'success',
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setModelFilter([]);
    setPage(1);
  };

  // Handle boot profile
  const handleBootProfile = (profileName: string) => {
    onBoot(profileName);
    setNotification({
      open: true,
      message: `Booting profile: ${profileName}`,
      severity: 'info',
    });
  };

  // Handle delete profile
  const handleDeleteProfile = (profileName: string) => {
    onDelete(profileName);
    setNotification({
      open: true,
      message: `Profile deleted: ${profileName}`,
      severity: 'success',
    });
  };

  // Get profile stats
  const stats = {
    total: profiles.length,
    running: profiles.filter(p => p.isRunning).length,
    available: profiles.filter(p => !p.isRunning && p.status !== 'error').length,
    error: profiles.filter(p => p.status === 'error').length,
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Toolbar disableGutters>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Profile Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* View mode toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, mode) => mode && handleViewModeChange(mode)}
              size="small"
            >
              <ToggleButton value="grid">
                <Tooltip title="Grid View">
                  <GridIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list">
                <Tooltip title="List View">
                  <ListIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Refresh button */}
            <Tooltip title="Refresh Profiles">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* Filters toggle */}
            <Tooltip title="Filters">
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <Badge badgeContent={statusFilter.length + modelFilter.length} color="primary">
                  <FilterIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Create new profile */}
            {onCreateNew && (
              <Button
                variant="primary"
                startIcon={<AddIcon />}
                onClick={onCreateNew}
              >
                New Profile
              </Button>
            )}
          </Box>
        </Toolbar>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Chip label={`Total: ${stats.total}`} color="default" />
          <Chip label={`Running: ${stats.running}`} color="success" />
          <Chip label={`Available: ${stats.available}`} color="primary" />
          <Chip label={`Error: ${stats.error}`} color="error" />
        </Box>
      </Paper>

      {/* Filters Panel */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <Button variant="secondary" size="small" onClick={clearFilters} startIcon={<ClearIcon />}>
              Clear All
            </Button>
          </Box>

          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Profiles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Model Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Model</InputLabel>
                <Select
                  multiple
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort controls */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="lastUsed">Last Used</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && profiles.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading profiles...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Results count */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Showing {paginatedProfiles.length} of {filteredProfiles.length} profiles
            </Typography>
          </Box>

          {/* Profile Grid/List */}
          {paginatedProfiles.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No profiles found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || statusFilter.length > 0 || modelFilter.length > 0
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first profile to get started'}
              </Typography>
              {onCreateNew && (
                <Button variant="primary" startIcon={<AddIcon />} onClick={onCreateNew}>
                  Create First Profile
                </Button>
              )}
            </Paper>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                  {paginatedProfiles.map((profile) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={profile.id}>
                      <ProfileCard
                        profile={profile}
                        onBoot={handleBootProfile}
                        onStop={onStop}
                        onEdit={onEdit}
                        onDelete={handleDeleteProfile}
                        onSelect={onSelect}
                        isSelected={selectedProfile === profile.id}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <List>
                  {paginatedProfiles.map((profile) => (
                    <ListItem key={profile.id} sx={{ mb: 1 }}>
                      <ProfileCard
                        profile={profile}
                        onBoot={handleBootProfile}
                        onStop={onStop}
                        onEdit={onEdit}
                        onDelete={handleDeleteProfile}
                        onSelect={onSelect}
                        isSelected={selectedProfile === profile.id}
                        compact
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { xs: 'flex', md: 'none' } }}
        onClick={onCreateNew}
      >
        <AddIcon />
      </Fab>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileList;
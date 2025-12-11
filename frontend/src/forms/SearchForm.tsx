import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Grid,
  Paper,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Filter as FilterIcon,
  Sort as SortIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import type { 
  SearchFormData, 
  FormValidationErrors, 
  BaseFormProps 
} from '../types/forms';

interface SearchFormProps extends BaseFormProps<SearchFormData> {
  onSearchSuccess?: (results: any) => void;
}

const INITIAL_SEARCH_DATA: SearchFormData = {
  query: '',
  scope: 'all',
  filters: {
    search: '',
    categories: [],
    dateRange: {
      start: null,
      end: null,
    },
    status: [],
    priority: [],
    tags: [],
    agents: [],
    customFilters: [],
  },
  sorting: {
    field: 'relevance',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

const SEARCH_SCOPES = [
  { value: 'all', label: 'All Data', description: 'Search across all data types' },
  { value: 'goals', label: 'Goals', description: 'Search goals and objectives' },
  { value: 'agents', label: 'Agents', description: 'Search agent configurations' },
  { value: 'performance', label: 'Performance', description: 'Search performance metrics' },
  { value: 'memory', label: 'Memory', description: 'Search memory data' },
  { value: 'social', label: 'Social', description: 'Search social interactions' },
  { value: 'skills', label: 'Skills', description: 'Search skill data' }
];

const SORT_FIELDS = [
  { value: 'relevance', label: 'Relevance', description: 'Sort by relevance score' },
  { value: 'date', label: 'Date', description: 'Sort by date created' },
  { value: 'name', label: 'Name', description: 'Sort alphabetically by name' },
  { value: 'priority', label: 'Priority', description: 'Sort by priority level' }
];

const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Ascending', description: 'A to Z, low to high' },
  { value: 'desc', label: 'Descending', description: 'Z to A, high to low' }
];

export const SearchForm: React.FC<SearchFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onValidate,
  onSearchSuccess,
  disabled = false,
  loading = false,
  validation = { realtime: true, showErrorSummary: true, focusFirstError: true },
  ui = { variant: 'outlined', size: 'medium', fullWidth: true, spacing: 2 }
}) => {
  const [searchData, setSearchData] = useState<SearchFormData>(INITIAL_SEARCH_DATA);
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [advancedMode, setAdvancedMode] = useState(false);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setSearchData({ ...INITIAL_SEARCH_DATA, ...initialData });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: FormValidationErrors = {};

    if (searchData.query.length > 0 && searchData.query.length < 3) {
      errors.query = 'Search query must be at least 3 characters';
    }

    setValidationErrors(errors);
    
    if (onValidate) {
      onValidate(searchData, errors);
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await onSubmit(searchData);
      if (result.success) {
        onSearchSuccess?.(result.data);
        handleReset();
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleReset = () => {
    setSearchData(INITIAL_SEARCH_DATA);
    setValidationErrors({});
    setAdvancedMode(false);
    onCancel?.();
  };

  const updateSearchQuery = (query: string) => {
    setSearchData(prev => ({
      ...prev,
      query
    }));
  };

  const updateSearchScope = (scope: string) => {
    setSearchData(prev => ({
      ...prev,
      scope: scope as any
    }));
  };

  const updateSortField = (field: string) => {
    setSearchData(prev => ({
      ...prev,
      sorting: {
        ...prev.sorting,
        field: field as any
      }
    }));
  };

  const updateSortDirection = (direction: string) => {
    setSearchData(prev => ({
      ...prev,
      sorting: {
        ...prev.sorting,
        direction: direction as any
      }
    }));
  };

  const updateDateRange = (start: Date | null, end: Date | null) => {
    setSearchData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        dateRange: { start, end }
      }
    }));
  };

  const addFilterTag = (tag: string) => {
    if (!searchData.filters.tags.includes(tag)) {
      setSearchData(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          tags: [...prev.filters.tags, tag]
        }
      }));
    }
  };

  const removeFilterTag = (tag: string) => {
    setSearchData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        tags: prev.filters.tags.filter(t => t !== tag)
      }
    }));
  };

  return (
    <Dialog open={true} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Advanced Search
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={advancedMode}
                onChange={(e) => setAdvancedMode(e.target.checked)}
                size="small"
              />
            }
            label="Advanced"
          />
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={ui.spacing || 2} sx={{ mt: 1 }}>
          {Object.keys(validationErrors).length > 0 && validation.showErrorSummary && (
            <Alert severity="error" onClose={() => setValidationErrors({})}>
              Please correct the following errors before submitting:
              <ul>
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Basic Search */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Search
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Search Query"
                  value={searchData.query}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  error={!!validationErrors.query}
                  helperText={validationErrors.query}
                  disabled={disabled}
                  InputProps={{
                    startAdornment: <SearchIcon />
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Search Scope</InputLabel>
                  <Select
                    value={searchData.scope}
                    label="Search Scope"
                    onChange={(e) => updateSearchScope(e.target.value)}
                    disabled={disabled}
                  >
                    {SEARCH_SCOPES.map(scope => (
                      <MenuItem key={scope.value} value={scope.value}>
                        <Box>
                          <Typography variant="body2">{scope.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {scope.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Sort Field</InputLabel>
                  <Select
                    value={searchData.sorting.field}
                    label="Sort Field"
                    onChange={(e) => updateSortField(e.target.value)}
                    disabled={disabled}
                  >
                    {SORT_FIELDS.map(field => (
                      <MenuItem key={field.value} value={field.value}>
                        <Box>
                          <Typography variant="body2">{field.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {field.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Sort Direction</InputLabel>
                  <Select
                    value={searchData.sorting.direction}
                    label="Sort Direction"
                    onChange={(e) => updateSortDirection(e.target.value)}
                    disabled={disabled}
                  >
                    {SORT_DIRECTIONS.map(direction => (
                      <MenuItem key={direction.value} value={direction.value}>
                        <Box>
                          <Typography variant="body2">{direction.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {direction.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Advanced Filters */}
          {advancedMode && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Advanced Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" gutterBottom>
                    Date Range
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={searchData.filters.dateRange.start}
                      onChange={(date) => updateDateRange(date, searchData.filters.dateRange.end)}
                      disabled={disabled}
                      sx={{ minWidth: 200 }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={searchData.filters.dateRange.end}
                      onChange={(date) => updateDateRange(searchData.filters.dateRange.start, date)}
                      disabled={disabled}
                      sx={{ minWidth: 200 }}
                    />
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" gutterBottom>
                    Filter Tags
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {searchData.filters.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => removeFilterTag(tag)}
                        disabled={disabled}
                      />
                    ))}
                    <TextField
                      label="Add Tag"
                      value=""
                      onChange={(e) => {
                        if (e.target.value && e.target.value.trim()) {
                          addFilterTag(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addFilterTag(e.currentTarget.value.trim());
                          e.currentTarget.value = '';
                        }
                      }}
                      disabled={disabled}
                      sx={{ minWidth: 200 }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleReset} startIcon={<CancelIcon />} disabled={loading}>
          Reset
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant={ui.variant} 
          startIcon={<SearchIcon />}
          disabled={loading || disabled}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchForm;
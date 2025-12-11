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
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DatePicker,
  Slider
} from '@mui/material';
import {
  Filter as FilterIcon,
  Search as SearchIcon,
  Cancel as CancelIcon,
  Apply as ApplyIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import type { 
  FilterFormData, 
  FormValidationErrors, 
  BaseFormProps 
} from '../types/forms';

interface FilterFormProps extends BaseFormProps<FilterFormData> {
  onFilterSuccess?: (filters: FilterFormData) => void;
}

const INITIAL_FILTER_DATA: FilterFormData = {
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
};

const CATEGORIES = [
  'Goals', 'Agents', 'Performance', 'Memory', 'Social', 'Skills'
];

const STATUS_OPTIONS = [
  'pending', 'active', 'completed', 'failed', 'paused'
];

const PRIORITY_OPTIONS = [
  'critical', 'high', 'medium', 'low'
];

export const FilterForm: React.FC<FilterFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onValidate,
  onFilterSuccess,
  disabled = false,
  loading = false,
  validation = { realtime: true, showErrorSummary: true, focusFirstError: true },
  ui = { variant: 'outlined', size: 'medium', fullWidth: true, spacing: 2 }
}) => {
  const [filterData, setFilterData] = useState<FilterFormData>(INITIAL_FILTER_DATA);
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [advancedMode, setAdvancedMode] = useState(false);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFilterData({ ...INITIAL_FILTER_DATA, ...initialData });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: FormValidationErrors = {};

    setValidationErrors(errors);
    
    if (onValidate) {
      onValidate(filterData, errors);
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await onSubmit(filterData);
      if (result.success) {
        onFilterSuccess?.(result.data);
        handleReset();
      }
    } catch (err) {
      console.error('Failed to apply filters:', err);
    }
  };

  const handleReset = () => {
    setFilterData(INITIAL_FILTER_DATA);
    setValidationErrors({});
    setAdvancedMode(false);
    onCancel?.();
  };

  const addCategory = (category: string) => {
    if (!filterData.categories.includes(category)) {
      setFilterData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
  };

  const removeCategory = (category: string) => {
    setFilterData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const addTag = (tag: string) => {
    if (!filterData.tags.includes(tag)) {
      setFilterData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFilterData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addCustomFilter = () => {
    const newFilter = {
      field: '',
      operator: 'equals' as const,
      value: ''
    };
    setFilterData(prev => ({
      ...prev,
      customFilters: [...prev.customFilters, newFilter]
    }));
  };

  const removeCustomFilter = (index: number) => {
    setFilterData(prev => ({
      ...prev,
      customFilters: prev.customFilters.filter((_, i) => i !== index)
    }));
  };

  const updateCustomFilter = (index: number, field: string, operator: string, value: any) => {
    setFilterData(prev => ({
      ...prev,
      customFilters: prev.customFilters.map((filter, i) => 
        i === index ? { ...filter, field, operator, value } : filter
      )
    }));
  };

  return (
    <Dialog open={true} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Filter Options
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

          {/* Basic Filters */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Search"
                  value={filterData.search}
                  onChange={(e) => setFilterData(prev => ({ ...prev, search: e.target.value }))}
                  disabled={disabled}
                  InputProps={{
                    startAdornment: <SearchIcon />
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" gutterBottom>
                  Categories
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {CATEGORIES.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => addCategory(category)}
                      onDelete={() => removeCategory(category)}
                      color={filterData.categories.includes(category) ? 'primary' : 'default'}
                      disabled={disabled}
                    />
                  ))}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Start Date</InputLabel>
                  <DatePicker
                    value={filterData.dateRange.start}
                    onChange={(date) => setFilterData(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: date }
                    }))}
                    disabled={disabled}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>End Date</InputLabel>
                  <DatePicker
                    value={filterData.dateRange.end}
                    onChange={(date) => setFilterData(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: date }
                    }))}
                    disabled={disabled}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Status and Priority Filters */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Status & Priority
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" gutterBottom>
                  Status
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {STATUS_OPTIONS.map(status => (
                    <Chip
                      key={status}
                      label={status}
                      onClick={() => {
                        const newStatus = filterData.status.includes(status) ? 
                          filterData.status.filter(s => s !== status) : 
                          [...filterData.status, status];
                        setFilterData(prev => ({ ...prev, status: newStatus }));
                      }}
                      onDelete={() => setFilterData(prev => ({ 
                        ...prev, 
                        status: prev.status.filter(s => s !== status) 
                      }))}
                      color={filterData.status.includes(status) ? 'primary' : 'default'}
                      disabled={disabled}
                    />
                  ))}
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" gutterBottom>
                  Priority
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {PRIORITY_OPTIONS.map(priority => (
                    <Chip
                      key={priority}
                      label={priority}
                      onClick={() => {
                        const newPriority = filterData.priority.includes(priority) ? 
                          filterData.priority.filter(p => p !== priority) : 
                          [...filterData.priority, priority];
                        setFilterData(prev => ({ ...prev, priority: newPriority }));
                      }}
                      onDelete={() => setFilterData(prev => ({ 
                        ...prev, 
                        priority: prev.priority.filter(p => p !== priority) 
                      }))}
                      color={filterData.priority.includes(priority) ? 'primary' : 'default'}
                      disabled={disabled}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Tags */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filterData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  disabled={disabled}
                />
              ))}
              <TextField
                label="Add Tag"
                value=""
                onChange={(e) => {
                  if (e.target.value && e.target.value.trim()) {
                    addTag(e.target.value.trim());
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addTag(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
                disabled={disabled}
                sx={{ minWidth: 200 }}
              />
            </Stack>
          </Paper>

          {/* Advanced Custom Filters */}
          {advancedMode && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Custom Filters
              </Typography>
              <Stack spacing={2}>
                {filterData.customFilters.map((filter, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          label="Field"
                          value={filter.field}
                          onChange={(e) => updateCustomFilter(index, e.target.value, filter.operator, filter.value)}
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth>
                          <InputLabel>Operator</InputLabel>
                          <Select
                            value={filter.operator}
                            label="Operator"
                            onChange={(e) => updateCustomFilter(index, filter.field, e.target.value, filter.value)}
                            disabled={disabled}
                          >
                            <MenuItem value="equals">Equals</MenuItem>
                            <MenuItem value="contains">Contains</MenuItem>
                            <MenuItem value="greater">Greater Than</MenuItem>
                            <MenuItem value="less">Less Than</MenuItem>
                            <MenuItem value="between">Between</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="Value"
                          value={filter.value}
                          onChange={(e) => updateCustomFilter(index, filter.field, filter.operator, e.target.value)}
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <Button
                          onClick={() => removeCustomFilter(index)}
                          disabled={disabled}
                          color="error"
                        >
                          <ClearIcon />
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                
                <Button
                  onClick={addCustomFilter}
                  disabled={disabled}
                  startIcon={<ApplyIcon />}
                >
                  Add Custom Filter
                </Button>
              </Stack>
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
          startIcon={<FilterIcon />}
          disabled={loading || disabled}
        >
          {loading ? 'Applying...' : 'Apply Filters'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterForm;
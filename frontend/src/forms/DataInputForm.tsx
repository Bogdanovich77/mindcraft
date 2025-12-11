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
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  Upload as UploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FileUpload as FileUploadIcon,
  Database as DatabaseIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import type { 
  DataInputFormData, 
  FormValidationErrors, 
  BaseFormProps 
} from '../types/forms';

interface DataInputFormProps extends BaseFormProps<DataInputFormData> {
  onImportSuccess?: (data: any) => void;
}

const INITIAL_DATA_INPUT_DATA: DataInputFormData = {
  source: 'manual',
  dataType: 'goals',
  format: 'json',
  data: null,
  mapping: {},
  validation: {
    strictMode: true,
    skipInvalid: false,
    reportErrors: true,
  },
  processing: {
    batchSize: 100,
    parallelProcessing: false,
    progressReporting: true,
  },
};

const DATA_SOURCES = [
  { value: 'manual', label: 'Manual Input', description: 'Enter data manually' },
  { value: 'file', label: 'File Upload', description: 'Upload data from file' },
  { value: 'api', label: 'API Import', description: 'Import from external API' },
  { value: 'database', label: 'Database Import', description: 'Import from database' }
];

const DATA_TYPES = [
  { value: 'goals', label: 'Goals', description: 'Goal hierarchy and progress data' },
  { value: 'agents', label: 'Agents', description: 'Agent configuration data' },
  { value: 'performance', label: 'Performance', description: 'Performance metrics and analytics' },
  { value: 'memory', label: 'Memory', description: 'Memory system data' },
  { value: 'social', label: 'Social', description: 'Social relationship data' },
  { value: 'skills', label: 'Skills', description: 'Skill progression data' }
];

const DATA_FORMATS = [
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'csv', label: 'CSV', description: 'Comma Separated Values' },
  { value: 'xml', label: 'XML', description: 'eXtensible Markup Language' },
  { value: 'yaml', label: 'YAML', description: 'YAML Ain\'t Markup Language' }
];

export const DataInputForm: React.FC<DataInputFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onValidate,
  onImportSuccess,
  disabled = false,
  loading = false,
  validation = { realtime: true, showErrorSummary: true, focusFirstError: true },
  ui = { variant: 'outlined', size: 'medium', fullWidth: true, spacing: 2 }
}) => {
  const [dataInputData, setDataInputData] = useState<DataInputFormData>(INITIAL_DATA_INPUT_DATA);
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [importProgress, setImportProgress] = useState(0);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setDataInputData({ ...INITIAL_DATA_INPUT_DATA, ...initialData });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: FormValidationErrors = {};

    if (!dataInputData.data && dataInputData.source !== 'manual') {
      errors.data = 'Data is required for file, API, or database import';
    }

    setValidationErrors(errors);
    
    if (onValidate) {
      onValidate(dataInputData, errors);
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await onSubmit(dataInputData);
      if (result.success) {
        onImportSuccess?.(result.data);
        handleReset();
      }
    } catch (err) {
      console.error('Failed to import data:', err);
    }
  };

  const handleReset = () => {
    setDataInputData(INITIAL_DATA_INPUT_DATA);
    setValidationErrors({});
    setImportProgress(0);
    onCancel?.();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let parsedData;
          
          switch (dataInputData.format) {
            case 'json':
              parsedData = JSON.parse(content);
              break;
            case 'csv':
              parsedData = parseCSV(content);
              break;
            case 'xml':
              parsedData = parseXML(content);
              break;
            case 'yaml':
              parsedData = parseYAML(content);
              break;
            default:
              parsedData = content;
          }
          
          setDataInputData(prev => ({ ...prev, data: parsedData }));
        } catch (error) {
          setValidationErrors({ data: `Failed to parse ${dataInputData.format}: ${error}` });
        }
      };
      
      reader.readAsText(file);
    }
  };

  const parseCSV = (content: string): any => {
    // Simple CSV parsing - in real implementation, use a proper CSV library
    const lines = content.split('\n');
    const headers = lines[0]?.split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers?.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim();
      });
      return obj;
    });
    return data;
  };

  const parseXML = (content: string): any => {
    // Simple XML parsing - in real implementation, use a proper XML library
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      return xmlDoc;
    } catch (error) {
      throw new Error(`XML parsing failed: ${error}`);
    }
  };

  const parseYAML = (content: string): any => {
    // Simple YAML parsing - in real implementation, use a proper YAML library
    try {
      // This is a placeholder - use js-yaml or similar in production
      const lines = content.split('\n');
      const data: any = {};
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          data[key.trim()] = valueParts.join(':').trim();
        }
      });
      return data;
    } catch (error) {
      throw new Error(`YAML parsing failed: ${error}`);
    }
  };

  return (
    <Dialog open={true} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Data Input
        </Typography>
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

          {/* Data Source Selection */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Data Source
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Data Source</InputLabel>
                  <Select
                    value={dataInputData.source}
                    label="Data Source"
                    onChange={(e) => setDataInputData(prev => ({ ...prev, source: e.target.value as any }))}
                    disabled={disabled}
                  >
                    {DATA_SOURCES.map(source => (
                      <MenuItem key={source.value} value={source.value}>
                        <Box>
                          <Typography variant="body2">{source.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {source.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Data Type</InputLabel>
                  <Select
                    value={dataInputData.dataType}
                    label="Data Type"
                    onChange={(e) => setDataInputData(prev => ({ ...prev, dataType: e.target.value as any }))}
                    disabled={disabled}
                  >
                    {DATA_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box>
                          <Typography variant="body2">{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* File Upload */}
          {dataInputData.source === 'file' && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                File Upload
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={disabled}
                >
                  Choose File
                  <input
                    type="file"
                    accept=".json,.csv,.xml,.yaml"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </Button>
                {dataInputData.data && (
                  <Typography variant="body2" color="text.secondary">
                    Data loaded: {typeof dataInputData.data === 'object' ? 
                      `${Object.keys(dataInputData.data).length} items` : 
                      `${dataInputData.data.length} characters`
                    }
                  </Typography>
                )}
              </Stack>
            </Paper>
          )}

          {/* Manual Input */}
          {dataInputData.source === 'manual' && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Manual Data Input
              </Typography>
              <TextField
                fullWidth
                label="Data (JSON format)"
                multiline
                rows={10}
                value={dataInputData.data ? JSON.stringify(dataInputData.data, null, 2) : ''}
                onChange={(e) => setDataInputData(prev => ({ 
                  ...prev, 
                  data: e.target.value ? JSON.parse(e.target.value) : null 
                }))}
                error={!!validationErrors.data}
                helperText={validationErrors.data}
                disabled={disabled}
              />
            </Paper>
          )}

          {/* Format Selection */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Data Format
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={dataInputData.format}
                label="Format"
                onChange={(e) => setDataInputData(prev => ({ ...prev, format: e.target.value as any }))}
                disabled={disabled}
              >
                {DATA_FORMATS.map(format => (
                  <MenuItem key={format.value} value={format.value}>
                    <Box>
                      <Typography variant="body2">{format.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Validation Settings */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Validation Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataInputData.validation.strictMode}
                      onChange={(e) => setDataInputData(prev => ({
                        ...prev,
                        validation: { ...prev.validation, strictMode: e.target.checked }
                      }))}
                      disabled={disabled}
                    />
                  }
                  label="Strict Mode"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataInputData.validation.skipInvalid}
                      onChange={(e) => setDataInputData(prev => ({
                        ...prev,
                        validation: { ...prev.validation, skipInvalid: e.target.checked }
                      }))}
                      disabled={disabled}
                    />
                  }
                  label="Skip Invalid"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataInputData.validation.reportErrors}
                      onChange={(e) => setDataInputData(prev => ({
                        ...prev,
                        validation: { ...prev.validation, reportErrors: e.target.checked }
                      }))}
                      disabled={disabled}
                    />
                  }
                  label="Report Errors"
                />
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleReset} startIcon={<CancelIcon />} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant={ui.variant} 
          startIcon={<SaveIcon />}
          disabled={loading || disabled}
        >
          {loading ? 'Importing...' : 'Import Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataInputForm;
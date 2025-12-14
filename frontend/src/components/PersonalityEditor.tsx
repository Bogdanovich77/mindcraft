/**
 * Personality Editor Component
 * 
 * Specialized editor for personality field with rich text support,
 * personality trait suggestions, and preset templates.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  Collapse,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  FormatQuote as QuoteIcon,
} from '@mui/icons-material';
import { personalityPresets, getPersonalityPresetsByTag, PersonalityPreset } from '../data/personalityPresets';

interface PersonalityEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  showPresets?: boolean;
  maxCharacters?: number;
}

const PersonalityEditor: React.FC<PersonalityEditorProps> = ({
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  showPresets = true,
  maxCharacters = 1000,
}) => {
  const [showPresetsPanel, setShowPresetsPanel] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get filtered presets based on search and tag
  const getFilteredPresets = () => {
    let filtered = personalityPresets;
    
    if (selectedTag !== 'all') {
      filtered = getPersonalityPresetsByTag(selectedTag);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(preset =>
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.personality.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get all unique tags
  const getAllTags = () => {
    const tags = new Set<string>();
    personalityPresets.forEach(preset => {
      preset.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  // Handle preset selection
  const handlePresetSelect = (preset: PersonalityPreset) => {
    onChange(preset.personality);
    setSelectedPreset(preset.id);
    setShowPresetsPanel(false);
  };

  // Clear personality
  const handleClear = () => {
    onChange('');
    setSelectedPreset(null);
  };

  // Get character count info
  const getCharacterCount = () => {
    return `${value.length}/${maxCharacters}`;
  };

  // Get character count color
  const getCharacterCountColor = () => {
    const percentage = (value.length / maxCharacters) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'text.secondary';
  };

  // Personality writing tips
  const writingTips = [
    'Describe how the bot speaks and communicates',
    'Include emotional tendencies and reactions',
    'Mention how they interact with others',
    'Add specific behavioral traits',
    'Keep it concise but descriptive',
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with title and controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon color="primary" />
          Personality Configuration
        </Typography>
        
        <Stack direction="row" spacing={1}>
          {showPresets && (
            <Button
              variant="outlined"
              size="small"
              startIcon={showPresetsPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowPresetsPanel(!showPresetsPanel)}
            >
              {showPresetsPanel ? 'Hide' : 'Show'} Presets
            </Button>
          )}
          
          <Tooltip title="Clear personality">
            <IconButton size="small" onClick={handleClear} disabled={disabled}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main personality textarea */}
      <TextField
        multiline
        rows={4}
        fullWidth
        label="Personality Description"
        placeholder="Describe the bot's personality, speaking style, and behavioral traits..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
        helperText={error || helperText}
        disabled={disabled}
        inputRef={textareaRef}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontFamily: 'monospace',
          },
        }}
        InputProps={{
          endAdornment: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
              <QuoteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color={getCharacterCountColor()}>
                {getCharacterCount()}
              </Typography>
            </Box>
          ),
        }}
      />

      {/* Character count warning */}
      {value.length >= maxCharacters * 0.9 && (
        <Alert severity={value.length >= maxCharacters ? 'error' : 'warning'} sx={{ mt: 1 }}>
          {value.length >= maxCharacters 
            ? 'Character limit reached'
            : 'Approaching character limit'
          }
        </Alert>
      )}

      {/* Writing tips */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbIcon fontSize="small" />
          Writing Tips:
        </Typography>
        <Grid container spacing={1}>
          {writingTips.map((tip, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Chip
                label={tip}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 'auto', py: 0.5 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Personality presets panel */}
      {showPresets && (
        <Collapse in={showPresetsPanel}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Personality Presets
              </Typography>
            </Divider>

            {/* Search and filter controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search presets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 200, flexGrow: 1 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Tag</InputLabel>
                <Select
                  value={selectedTag}
                  label="Filter by Tag"
                  onChange={(e) => setSelectedTag(e.target.value)}
                >
                  <MenuItem value="all">All Tags</MenuItem>
                  {getAllTags().map(tag => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Presets grid */}
            <Grid container spacing={2}>
              {getFilteredPresets().map(preset => (
                <Grid item xs={12} sm={6} md={4} key={preset.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      border: selectedPreset === preset.id ? 2 : 1,
                      borderColor: selectedPreset === preset.id ? 'primary.main' : 'divider',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <CardContent sx={{ pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: preset.color,
                            width: 40,
                            height: 40,
                            fontSize: '1.2rem',
                          }}
                        >
                          {preset.icon}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {preset.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {preset.tags.join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {preset.description}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        "{preset.personality}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {getFilteredPresets().length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No presets found matching your criteria.
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default PersonalityEditor;
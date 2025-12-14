/**
 * Profile Editor Component
 * 
 * Form-based editor for profile attributes with validation,
 * focusing on personality, goals, and mandate fields.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Divider,
  Alert,
  FormHelperText,
  Chip,
  Stack,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Flag as FlagIcon,
  Description as DescriptionIcon,
  LocalOffer as TagIcon,
  ModelTraining as ModelIcon,
} from '@mui/icons-material';
import type { ProfileFormData, ProfileValidationError, AvailableModel } from '../types/profile';
import PersonalityEditor from './PersonalityEditor';
import Button from './common/Button';

interface ProfileEditorProps {
  profile: ProfileFormData | null;
  isEditing: boolean;
  validationErrors: ProfileValidationError[];
  onSave: (profile: ProfileFormData) => void;
  onCancel: () => void;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  loading: boolean;
  availableModels?: AvailableModel[];
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  isEditing,
  validationErrors,
  onSave,
  onCancel,
  onChange,
  loading,
  availableModels = [],
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Initialize tags when profile changes
  useEffect(() => {
    if (profile?.tags) {
      setTags(profile.tags);
    } else {
      setTags([]);
    }
  }, [profile?.tags]);

  // Get validation error for a specific field
  const getFieldError = (field: keyof ProfileFormData) => {
    const error = validationErrors.find(err => err.field === field);
    return error?.message;
  };

  // Check if a field has an error
  const hasFieldError = (field: keyof ProfileFormData) => {
    return validationErrors.some(err => err.field === field);
  };

  // Handle tag input
  const handleTagInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        onChange('tags', updatedTags);
        setTagInput('');
      }
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    onChange('tags', updatedTags);
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (profile) {
      onSave(profile);
    }
  };

  // Validate individual field on change
  const handleFieldChange = (field: keyof ProfileFormData, value: any) => {
    onChange(field, value);
  };

  // Get field character count info
  const getFieldCharacterCount = (field: keyof ProfileFormData, maxChars: number) => {
    const value = profile?.[field] as string || '';
    return `${value.length}/${maxChars}`;
  };

  // Get character count color
  const getCharacterCountColor = (field: keyof ProfileFormData, maxChars: number) => {
    const value = profile?.[field] as string || '';
    const percentage = (value.length / maxChars) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'text.secondary';
  };

  if (!profile) {
    return (
      <Alert severity="info">
        No profile selected for editing.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {/* Basic Information Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            Basic Information
          </Typography>

          <Grid container spacing={3}>
            {/* Profile Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Profile Name"
                value={profile.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={hasFieldError('name')}
                helperText={getFieldError('name') || 'Unique identifier for this profile'}
                disabled={loading || isEditing} // Don't allow name changes during edit
                required
              />
            </Grid>

            {/* Model Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={hasFieldError('model')} required>
                <InputLabel>AI Model</InputLabel>
                <Select
                  value={profile.model}
                  label="AI Model"
                  onChange={(e) => handleFieldChange('model', e.target.value)}
                  disabled={loading}
                >
                  {availableModels.length > 0 ? (
                    availableModels.map(model => (
                      <MenuItem key={model.id} value={model.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {model.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {model.provider}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="gpt-4">GPT-4</MenuItem>
                    <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                    <MenuItem value="claude-3">Claude 3</MenuItem>
                  )}
                </Select>
                {hasFieldError('model') && (
                  <FormHelperText error>{getFieldError('model')}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={profile.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                error={hasFieldError('description')}
                helperText={getFieldError('description') || 'Brief description of this profile\'s purpose'}
                disabled={loading}
                placeholder="Describe what this bot is designed for..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Behavioral Configuration Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" />
            Behavioral Configuration
          </Typography>

          <Grid container spacing={3}>
            {/* Personality Editor */}
            <Grid item xs={12}>
              <PersonalityEditor
                value={profile.personality}
                onChange={(value) => handleFieldChange('personality', value)}
                error={getFieldError('personality')}
                helperText={getFieldError('personality') || 'Describe the bot\'s personality, speaking style, and behavioral traits'}
                disabled={loading}
                showPresets={true}
                maxCharacters={1000}
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" color={getCharacterCountColor('personality', 1000)}>
                  {getFieldCharacterCount('personality', 1000)}
                </Typography>
              </Box>
            </Grid>

            {/* Goals */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Goals"
                value={profile.goals}
                onChange={(e) => handleFieldChange('goals', e.target.value)}
                error={hasFieldError('goals')}
                helperText={getFieldError('goals') || 'Describe what this bot aims to accomplish autonomously'}
                disabled={loading}
                placeholder="e.g., Likes digging, building structures, exploring caves..."
                required
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" color={getCharacterCountColor('goals', 1000)}>
                  {getFieldCharacterCount('goals', 1000)}
                </Typography>
              </Box>
            </Grid>

            {/* Mandate */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Mandate"
                value={profile.mandate}
                onChange={(e) => handleFieldChange('mandate', e.target.value)}
                error={hasFieldError('mandate')}
                helperText={getFieldError('mandate') || 'Current orders or directives from players or other bots'}
                disabled={loading}
                placeholder="e.g., Build a shelter, gather resources, defend the base..."
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" color={getCharacterCountColor('mandate', 500)}>
                  {getFieldCharacterCount('mandate', 500)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TagIcon color="primary" />
            Tags
          </Typography>

          <TextField
            fullWidth
            label="Add Tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            helperText="Press Enter or comma to add tags"
            disabled={loading}
            placeholder="e.g., builder, explorer, warrior..."
            sx={{ mb: 2 }}
          />

          {tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors Summary */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Please fix the following errors:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {validationErrors.map((error, index) => (
              <Typography component="li" variant="body2" key={index}>
                {error.message}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {/* Form Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          loading={loading}
          disabled={loading || validationErrors.length > 0}
        >
          {isEditing ? 'Update Profile' : 'Create Profile'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileEditor;
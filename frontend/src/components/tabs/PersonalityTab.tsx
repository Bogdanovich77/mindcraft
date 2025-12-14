import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Alert,
  Tooltip,
  TextField,
} from '@mui/material';
import type { AgentState } from '../../types/agent';
import { useAppSelector } from '../../store';

interface PersonalityTabProps {
  agent: AgentState;
}

const PersonalityTab: React.FC<PersonalityTabProps> = ({ agent }) => {
  // In simplified architecture, personality is just a string
  const [isEditing, setIsEditing] = useState(false);
  const [editablePersonality, setEditablePersonality] = useState(agent.personality);

  // Handle personality text change
  const handlePersonalityChange = (value: string) => {
    setEditablePersonality(value);
  };

  // Reset to original value
  const handleReset = () => {
    setEditablePersonality(agent.personality);
    setIsEditing(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Personality Profile - {agent.name}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Current Personality Display */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Personality
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {agent.personality}
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              In the simplified architecture, personality is represented as a descriptive string that the LLM interprets to guide behavior and responses.
            </Alert>
          </Paper>
        </Grid>

        {/* Personality Editor */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Personality Editor
              </Typography>
              <Chip
                label={isEditing ? 'Editing' : 'View Only'}
                color={isEditing ? 'warning' : 'default'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Edit the personality description to see how it might affect behavior
              </Typography>
              <Chip
                label={isEditing ? 'Cancel' : 'Edit'}
                onClick={() => {
                  if (isEditing) {
                    handleReset();
                  } else {
                    setIsEditing(true);
                  }
                }}
                color={isEditing ? 'error' : 'primary'}
                size="small"
                clickable
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              value={editablePersonality}
              onChange={(e) => isEditing && handlePersonalityChange(e.target.value)}
              disabled={!isEditing}
              label="Personality Description"
              helperText="Describe the bot's personality traits, demeanor, and behavioral tendencies"
              sx={{ mb: 2 }}
            />

            {isEditing && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Changes are temporary and for preview only. Reset to original values when done.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Personality Examples */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personality Examples
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Here are some example personality descriptions that work well with the simplified architecture:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Grumpy Warrior
                  </Typography>
                  <Typography variant="body2">
                    "Grumpy, rude, hot-tempered warrior who loves combat and despises weakness. Always ready for a fight but loyal to allies."
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Friendly Builder
                  </Typography>
                  <Typography variant="body2">
                    "Friendly, helpful builder who enjoys creating structures and assisting others. Always looking for new building projects and collaboration opportunities."
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Curious Explorer
                  </Typography>
                  <Typography variant="body2">
                    "Curious, adventurous explorer who loves discovering new places and resources. Often gets distracted by interesting caves or mountains."
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cautious Miner
                  </Typography>
                  <Typography variant="body2">
                    "Cautious, methodical miner who prioritizes safety and efficiency. Always well-prepared with torches and equipment, avoids unnecessary risks."
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Playful Trickster
                  </Typography>
                  <Typography variant="body2">
                    "Playful trickster who enjoys harmless pranks and jokes. Loves to lighten the mood but knows when to be serious during important tasks."
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Stoic Guardian
                  </Typography>
                  <Typography variant="body2">
                    "Stoic, quiet guardian who protects the base and allies. Speaks rarely but acts decisively when threats appear. Highly dependable and observant."
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalityTab;
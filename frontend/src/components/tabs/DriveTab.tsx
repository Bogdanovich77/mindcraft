import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Psychology as PersonalityIcon,
  Flag as GoalsIcon,
  Assignment as MandateIcon,
  AutoAwesome as DriveIcon,
} from '@mui/icons-material';
import type { AgentState } from '../../types/agent';

interface DriveTabProps {
  agent: AgentState;
  agentId: string;
}

const DriveTab: React.FC<DriveTabProps> = ({ agent }) => {
  const theme = useTheme();
  const { personality, goals, mandate } = agent;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Drive & Motivation - {agent.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Core personality, autonomous goals, and current mandate
      </Typography>

      <Grid container spacing={3}>
        {/* Personality */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonalityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personality
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
                icon={<PersonalityIcon />}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  LLM-Interpreted Personality
                </Typography>
                <Typography variant="caption">
                  Raw string for LLM interpretation
                </Typography>
              </Alert>

              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.background.default,
                  minHeight: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontStyle: personality ? 'normal' : 'italic',
                    color: personality ? 'text.primary' : 'text.secondary',
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}
                >
                  {personality || 'No personality defined'}
                </Typography>
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This personality string is interpreted by the LLM to guide behavior and responses.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Goals */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <GoalsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Autonomous Goals
              </Typography>
              
              <Alert 
                severity="success" 
                sx={{ mb: 2 }}
                icon={<GoalsIcon />}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Intrinsic Drive
                </Typography>
                <Typography variant="caption">
                  Natural behavior tendencies
                </Typography>
              </Alert>

              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.background.default,
                  minHeight: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontStyle: goals ? 'normal' : 'italic',
                    color: goals ? 'text.primary' : 'text.secondary',
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}
                >
                  {goals || 'No autonomous goals defined'}
                </Typography>
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                These goals drive the agent's autonomous behavior when not following mandates.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Mandate */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <MandateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Current Mandate
              </Typography>
              
              <Alert 
                severity="warning" 
                sx={{ mb: 2 }}
                icon={<MandateIcon />}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Active Directive
                </Typography>
                <Typography variant="caption">
                    Overrides autonomous goals
                </Typography>
              </Alert>

              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.background.default,
                  minHeight: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: mandate ? `2px solid ${theme.palette.warning.main}` : undefined
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontStyle: mandate ? 'normal' : 'italic',
                    color: mandate ? 'text.primary' : 'text.secondary',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    fontWeight: mandate ? 'medium' : 'normal'
                  }}
                >
                  {mandate || 'No active mandate'}
                </Typography>
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {mandate 
                  ? 'This mandate takes priority over autonomous goals.'
                  : 'Agent will follow autonomous goals when no mandate is active.'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Drive Summary */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DriveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Drive System Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip 
                      label="Personality-Driven"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      All behavior is influenced by the personality string
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip 
                      label="Goal-Oriented"
                      color="success"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Autonomous behavior follows natural goals
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip 
                      label="Mandate-Priority"
                      color="warning"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      External mandates override autonomous goals
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Decision Priority:</strong> Mandate → Goals → Personality
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  The agent first checks for active mandates, then follows autonomous goals, 
                  with all actions filtered through their personality.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Examples */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Example Drive Configurations
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Warrior Bot
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      <strong>Personality:</strong> "brave, aggressive, loyal"<br/>
                      <strong>Goals:</strong> "protect allies, fight monsters, explore dangerous areas"<br/>
                      <strong>Mandate:</strong> "defend the base at all costs"
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Builder Bot
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      <strong>Personality:</strong> "creative, patient, meticulous"<br/>
                      <strong>Goals:</strong> "build structures, gather resources, organize storage"<br/>
                      <strong>Mandate:</strong> "construct a new house"
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Explorer Bot
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      <strong>Personality:</strong> "curious, adventurous, independent"<br/>
                      <strong>Goals:</strong> "explore new areas, map terrain, discover resources"<br/>
                      <strong>Mandate:</strong> "find the nearest village"
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Farmer Bot
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      <strong>Personality:</strong> "patient, nurturing, hardworking"<br/>
                      <strong>Goals:</strong> "grow crops, raise animals, maintain farm"<br/>
                      <strong>Mandate:</strong> "harvest the wheat field"
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriveTab;
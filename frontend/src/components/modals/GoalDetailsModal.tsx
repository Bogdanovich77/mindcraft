/**
 * Goal Details Modal
 * 
 * Comprehensive modal for viewing detailed goal information, including
 * progress tracking, resource management, and dependency visualization.
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Tab,
  Tabs,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  Timeline as TimelineIcon,
  Assignment as TaskIcon,
  AccountTree as DependencyIcon,
  Inventory as ResourceIcon,
  TrendingUp as ProgressIcon,
  Warning as WarningIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { AgentState } from '../../types/agent';
import * as d3 from 'd3';

interface GoalDetailsModalProps {
  open: boolean;
  onClose: () => void;
  goalId?: string;
  agentId?: string;
}

interface GoalProgressData {
  date: Date;
  progress: number;
  milestone?: string;
}

interface ResourceRequirement {
  type: string;
  amount: number;
  available: number;
  unit: string;
  status: 'available' | 'allocated' | 'in_use' | 'depleted';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({
  open,
  onClose,
  goalId,
  agentId
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { agents } = useSelector((state: RootState) => state.agents as any);
  
  // Component state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [expandedDependencies, setExpandedDependencies] = useState<string[]>([]);

  // Get goal and agent data
  const goal = goalId ? agents.find((a: any) => a.id === agentId)?.cognitive?.goals?.activeGoals?.find(g => g.id === goalId) : null;
  const agent = agentId ? agents.find((a: any) => a.id === agentId) : null;

  // Process progress data for timeline visualization
  const getProgressData = (): GoalProgressData[] => {
    if (!goal) return [];
    
    const data: GoalProgressData[] = [];
    
    // Add current progress
    data.push({
      date: new Date(),
      progress: goal.progress?.percentage || 0,
      milestone: goal.progress?.currentMilestone
    });
    
    // Add historical progress if available
    if (goal.progress?.history) {
      goal.progress.history.forEach((entry: any) => {
        data.push({
          date: new Date(entry.timestamp),
          progress: entry.percentage || 0,
          milestone: entry.milestone
        });
      });
    }
    
    return data.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Get resource status color
  const getResourceStatusColor = (status: string) => {
    switch (status) {
      case 'available': return theme.palette.success.main;
      case 'allocated': return theme.palette.warning.main;
      case 'in_use': return theme.palette.info.main;
      case 'depleted': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  // Handle dependency expansion
  const toggleDependency = (dependencyId: string) => {
    setExpandedDependencies(prev => 
      prev.includes(dependencyId) 
        ? prev.filter(id => id !== dependencyId)
        : [...prev, dependencyId]
    );
  };

  // Initialize and update D3 timeline
  useEffect(() => {
    if (!open || activeTab !== 2) return;

    const svg = d3.select('#goal-timeline');
    svg.selectAll('*').remove();

    const progressData = getProgressData();
    if (progressData.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(progressData, d => d.date) as [Date, Date] || [new Date(), new Date()])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Create line generator
    const line = d3.line<any>()
      .x(d => xScale(d.date))
      .y(d => d.progress)
      .curve(d3.curveMonotoneX);

    // Create SVG
    const svgElement = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Create main group
    const g = svgElement.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
      .selectAll('line')
      .data(yScale.ticks())
      .enter().append('line')
      .attr('x1', -5)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', theme.palette.divider)
      .attr('stroke-opacity', 0.3);

    // Add x-axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Add y-axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Add progress line
    g.append('path')
      .datum(progressData)
      .attr('fill', 'none')
      .attr('stroke', theme.palette.primary.main)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add data points
    g.selectAll('.dot')
      .data(progressData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.progress))
      .attr('r', 4)
      .attr('fill', theme.palette.primary.main)
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', theme.palette.background.paper)
      .style('border', `1px solid ${theme.palette.divider}`)
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px');

    g.selectAll('.dot')
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        
        const tooltipContent = `
          <div>
            <strong>${d.date.toLocaleDateString()}</strong><br/>
            Progress: ${d.progress.toFixed(1)}%<br/>
            ${d.milestone ? `Milestone: ${d.milestone}<br/>` : ''}
          </div>
        `;
        
        tooltip.html(tooltipContent)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [open, activeTab, goal]);

  if (!goal) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Goal Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue as number)}>
          <Tab label="Overview" value={0} icon={<TaskIcon />} />
          <Tab label="Progress" value={1} icon={<ProgressIcon />} />
          <Tab label="Resources" value={2} icon={<ResourceIcon />} />
          <Tab label="Dependencies" value={3} icon={<DependencyIcon />} />
        </Tabs>

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Goal Information</Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">ID:</Typography>
                        <Typography variant="body1">{goal.id}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Type:</Typography>
                        <Typography variant="body1">{goal.type}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Priority:</Typography>
                        <Chip 
                          label={goal.priority} 
                          size="small" 
                          color={getPriorityColor(goal.priority) as any}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Status:</Typography>
                        <Chip 
                          label={goal.status} 
                          size="small" 
                          color={goal.status === 'completed' ? 'success' : 'warning'}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      Description: {goal.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Progress</Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Current:</Typography>
                        <Typography variant="body1">{goal.progress?.percentage?.toFixed(1)}%</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Target:</Typography>
                        <Typography variant="body1">100%</Typography>
                      </Box>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress?.percentage || 0}
                      sx={{ mt: 2, height: 8 }}
                    />
                    
                    {goal.progress?.currentMilestone && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Current Milestone: {goal.progress.currentMilestone}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Timeline</Typography>
                    <Box id="goal-timeline" sx={{ height: 200, mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Progress Tab */}
        {activeTab === 1 && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Progress History</Typography>
            
            <List>
              {goal.progress?.history?.map((entry: any, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {entry.percentage >= 100 ? <CompleteIcon color="success" /> : <ProgressIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={new Date(entry.timestamp).toLocaleString()}
                    secondary={`Progress: ${entry.percentage.toFixed(1)}%${entry.milestone ? ` - ${entry.milestone}` : ''}`}
                  />
                </ListItem>
              )) || (
                <ListItem>
                  <ListItemText primary="No progress history available" />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {/* Resources Tab */}
        {activeTab === 2 && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Resource Requirements</Typography>
            
            <Grid container spacing={2}>
              {goal.resources?.required?.map((resource: ResourceRequirement, index: number) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1">{resource.type}</Typography>
                        <Chip
                          label={resource.status}
                          size="small"
                          color={getResourceStatusColor(resource.status) as any}
                        />
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Required:</Typography>
                        <Typography variant="body1">{resource.amount} {resource.unit}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Available:</Typography>
                        <Typography variant="body1">{resource.available} {resource.unit}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Priority:</Typography>
                        <Chip
                          label={resource.priority}
                          size="small"
                          color={getPriorityColor(resource.priority) as any}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )) || (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1" color="textSecondary">No resource requirements</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Dependencies Tab */}
        {activeTab === 3 && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Dependencies</Typography>
            
            <List>
              {goal.dependencies?.map((dependency: any, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <DependencyIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={dependency.name}
                    secondary={`Type: ${dependency.type} | Status: ${dependency.status}`}
                  />
                  <IconButton
                    onClick={() => toggleDependency(dependency.id)}
                    size="small"
                  >
                    {expandedDependencies.includes(dependency.id) ? <WarningIcon /> : <CompleteIcon />}
                  </IconButton>
                </ListItem>
              )) || (
                <ListItem>
                  <ListItemText primary="No dependencies" />
                </ListItem>
              )}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalDetailsModal;
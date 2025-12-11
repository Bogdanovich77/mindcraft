import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  Flag as FlagIcon,
  Assessment as AssessmentIcon,
  MoreVert as MoreVertIcon,
  AccountTree as TreeIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { Goal, GoalType, GoalStatus, GoalPriority } from '../../types/goals';

interface GoalTreeVisualizationProps {
  goals: Goal[];
  zoomLevel?: number;
  onGoalEdit?: (goal: Goal) => void;
  onGoalUpdate?: (goal: Goal) => void;
  height?: number;
  onGoalSelect?: (goal: Goal) => void;
}

interface TreeNode {
  _children?: TreeNode[];
  children?: TreeNode[];
  data: Goal;
}

const TYPE_COLORS: Record<GoalType, string> = {
  strategic: '#1976d2',
  tactical: '#388e3c',
  operational: '#f57c00'
};

const STATUS_COLORS: Record<GoalStatus, string> = {
  completed: '#4caf50',
  active: '#2196f3',
  pending: '#ff9800',
  failed: '#f44336',
  paused: '#9c27b0',
  cancelled: '#757575',
  in_progress: '#2196f3'
};

const PRIORITY_COLORS: Record<GoalPriority, string> = {
  0: '#d32f2f', // CRITICAL
  1: '#f57c00', // HIGH
  2: '#1976d2', // MEDIUM
  3: '#757575'  // LOW
};

export const GoalTreeVisualization: React.FC<GoalTreeVisualizationProps> = ({
  goals,
  zoomLevel = 1,
  onGoalEdit,
  onGoalUpdate,
  height = 600,
  onGoalSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; goal: Goal } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build hierarchical data structure
  const hierarchicalData = useMemo(() => {
    try {
      // Create a map of goals by ID
      const goalMap = new Map<string, Goal & { children: Goal[] }>();
      
      // Initialize all goals with empty children array
      goals.forEach(goal => {
        goalMap.set(goal.id, { ...goal, children: [] });
      });

      // Build the hierarchy
      const rootGoals: (Goal & { children: Goal[] })[] = [];
      
      goals.forEach(goal => {
        const goalNode = goalMap.get(goal.id);
        if (!goalNode) return;

        if (goal.parentGoal) {
          const parent = goalMap.get(goal.parentGoal);
          if (parent) {
            parent.children.push(goalNode);
          }
        } else {
          rootGoals.push(goalNode);
        }
      });

      // Create a virtual root if we have multiple root goals
      if (rootGoals.length === 0) {
        return null;
      } else if (rootGoals.length === 1) {
        return rootGoals[0];
      } else {
        // Create virtual root
        const virtualRoot: Goal & { children: Goal[] } = {
          id: 'virtual-root',
          title: 'All Goals',
          description: 'All Goals',
          type: 'strategic',
          priority: 2,
          status: 'active',
          dependencies: [],
          resources: { required: [], allocated: [], totalCost: 0 },
          progress: { current: 0, target: 100, percentage: 0, milestones: [], completedMilestones: [], lastUpdated: Date.now() },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          children: rootGoals,
          parentGoal: undefined,
          childGoals: rootGoals.map(g => g.id),
          estimatedDuration: 0,
          tags: [],
          notes: '',
          metadata: {}
        };
        return virtualRoot;
      }
    } catch (err) {
      console.error('Error building hierarchy:', err);
      setError('Failed to build goal hierarchy');
      return null;
    }
  }, [goals]);

  useEffect(() => {
    if (!svgRef.current || !hierarchicalData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const width = svgRef.current.clientWidth;
    const svgHeight = height || 600;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create main group
    const g = svg.append('g');

    // Create tree layout
    const treeLayout = d3.tree<any>()
      .size([width - 100, svgHeight - 100]);

    // Create hierarchy
    const root = d3.hierarchy(hierarchicalData, (d: any) => d.children || undefined);
    
    // Calculate layout
    treeLayout(root);

    // Create links
    const links = g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y + 50)
        .y((d: any) => d.x + 50) as any)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    // Create nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y + 50}, ${d.x + 50})`)
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        event.stopPropagation();
        const goal = d.data as Goal;
        setSelectedGoal(goal);
        onGoalSelect?.(goal);
      })
      .on('contextmenu', (event, d: any) => {
        event.preventDefault();
        const goal = d.data as Goal;
        setContextMenu({ x: event.clientX, y: event.clientY, goal });
      });

    // Add node circles
    nodes.append('circle')
      .attr('r', 8)
      .attr('fill', (d: any) => {
        const goal = d.data as Goal;
        return TYPE_COLORS[goal.type];
      })
      .attr('stroke', (d: any) => {
        const goal = d.data as Goal;
        return STATUS_COLORS[goal.status];
      })
      .attr('stroke-width', 3);

    // Add priority indicators
    nodes.append('circle')
      .attr('r', 4)
      .attr('cx', 6)
      .attr('cy', -6)
      .attr('fill', (d: any) => {
        const goal = d.data as Goal;
        return PRIORITY_COLORS[goal.priority];
      });

    // Add text labels
    nodes.append('text')
      .attr('dx', 15)
      .attr('dy', 4)
      .text((d: any) => {
        const goal = d.data as Goal;
        return goal.description.length > 30 
          ? goal.description.substring(0, 30) + '...' 
          : goal.description;
      })
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif')
      .attr('fill', '#333');

    // Add progress indicators for active goals
    nodes.filter((d: any) => d.data.status === 'active' || d.data.status === 'completed')
      .append('rect')
      .attr('x', -10)
      .attr('y', 15)
      .attr('width', 20)
      .attr('height', 4)
      .attr('rx', 2)
      .attr('fill', '#e0e0e0');

    nodes.filter((d: any) => d.data.status === 'active' || d.data.status === 'completed')
      .append('rect')
      .attr('x', -10)
      .attr('y', 15)
      .attr('width', (d: any) => (d.data.progress.percentage / 100) * 20)
      .attr('height', 4)
      .attr('rx', 2)
      .attr('fill', (d: any) => STATUS_COLORS[d.data.status as GoalStatus]);

    // Apply initial zoom
    const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(zoomLevel);
    svg.call(zoom.transform, initialTransform);

  }, [hierarchicalData, height, zoomLevel, onGoalSelect]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]);
    svg.transition().call(zoom.scaleBy, 1.2);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]);
    svg.transition().call(zoom.scaleBy, 0.8);
  };

  const handleCenter = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleMenuAction = (action: string, goal: Goal) => {
    handleContextMenuClose();
    switch (action) {
      case 'edit':
        onGoalEdit?.(goal);
        break;
      case 'view':
        setSelectedGoal(goal);
        onGoalSelect?.(goal);
        break;
      case 'update':
        onGoalUpdate?.(goal);
        break;
      case 'delete':
        // Handle delete action
        break;
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!hierarchicalData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="text.secondary">
          No goals to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" fontWeight="bold">
              Goal Hierarchy Tree
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                size="small" 
                label={`${goals.length} goals`}
                color="primary"
                variant="outlined"
              />
              {selectedGoal && (
                <Chip 
                  size="small" 
                  label={`Selected: ${selectedGoal.description.substring(0, 20)}...`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center View">
              <IconButton onClick={handleCenter}>
                <CenterIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Legend */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Legend
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {/* Goal Types */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 60 }}>Types:</Typography>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <Chip
                key={type}
                size="small"
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                sx={{ 
                  backgroundColor: color, 
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            ))}
          </Stack>
          
          {/* Status */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 60 }}>Status:</Typography>
            {Object.entries(STATUS_COLORS).slice(0, 4).map(([status, color]) => (
              <Chip
                key={status}
                size="small"
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                sx={{ 
                  backgroundColor: color, 
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* Tree Visualization */}
      <Paper sx={{ overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          style={{ border: '1px solid #e0e0e0' }}
        />
      </Paper>

      {/* Selected Goal Details */}
      {selectedGoal && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Selected Goal Details
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2">
                <strong>Description:</strong> {selectedGoal.description}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {selectedGoal.type}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedGoal.status}
              </Typography>
              <Typography variant="body2">
                <strong>Priority:</strong> {selectedGoal.priority}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2">
                <strong>Progress:</strong> {Math.round(selectedGoal.progress.percentage)}%
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {new Date(selectedGoal.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                <strong>Updated:</strong> {new Date(selectedGoal.updatedAt).toLocaleDateString()}
              </Typography>
              {selectedGoal.parentGoal && (
                <Typography variant="body2">
                  <strong>Parent Goal:</strong> {goals.find(g => g.id === selectedGoal.parentGoal)?.description || 'Unknown'}
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        open={!!contextMenu}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined
        }
      >
        {contextMenu && (
          <>
            <MenuItem onClick={() => handleMenuAction('view', contextMenu.goal)}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('edit', contextMenu.goal)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Goal</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleMenuAction('delete', contextMenu.goal)}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Goal</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default GoalTreeVisualization;
# Mindcraft Cognitive Dashboard - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Agent Management](#agent-management)
4. [Cognitive Features](#cognitive-features)
5. [Data Visualization](#data-visualization)
6. [Performance Monitoring](#performance-monitoring)
7. [Settings and Configuration](#settings-and-configuration)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Accessibility Features](#accessibility-features)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Welcome to Mindcraft Cognitive Dashboard

The Mindcraft Cognitive Dashboard provides a comprehensive interface for monitoring and managing LangGraph agents with advanced cognitive capabilities. This guide will help you navigate the dashboard and make the most of its features.

### System Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Screen Resolution**: 1024x768 minimum (1920x1080 recommended)
- **Internet**: Stable connection for real-time updates
- **JavaScript**: Enabled and up-to-date

### First-Time Setup

1. **Access the Dashboard**
   - Open your web browser
   - Navigate to the dashboard URL provided by your administrator
   - Log in with your credentials

2. **Initial Dashboard Tour**
   - The dashboard will automatically start a guided tour
   - Click "Next" to proceed through each section
   - Click "Skip" to exit the tour at any time

3. **Connect to Agents**
   - The dashboard will automatically detect available agents
   - Connection status is shown in the top-right corner
   - Green = Connected, Yellow = Connecting, Red = Disconnected

## Dashboard Overview

### Main Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Header Bar                              │
│  [Logo] [Navigation] [Search] [User] [Status]        │
├─────────────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────┐ │
│  │   Sidebar       │  │   Main Content  │  │   Side  │ │
│  │                 │  │                 │  │   Panel  │ │
│  │ • Overview      │  │ • Agent Details │  │ • Quick  │ │
│  │ • Personality   │  │ • Visualizations│  │ • Actions │ │
│  │ • Memory        │  │ • Charts        │  │ • Stats   │ │
│  │ • Goals         │  │ • Reports       │  │ • Logs    │ │
│  │ • Social        │  │                 │  │           │ │
│  │ • Skills        │  │                 │  │           │ │
│  │ • Performance   │  │                 │  │           │ │
│  └─────────────────┘  └─────────────────┘  └─────────┘ │
│                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Header Bar Features

#### Logo and Navigation
- **Logo**: Click to return to the main dashboard
- **Navigation Tabs**: Switch between different dashboard sections
- **Breadcrumbs**: Shows your current location in the dashboard

#### Search Bar
- **Global Search**: Find agents, goals, or data across all sections
- **Quick Filters**: Filter by agent status, type, or other attributes
- **Recent Searches**: Access your recent search history

#### User Menu
- **Profile**: View and edit your user profile
- **Preferences**: Customize dashboard appearance and behavior
- **Notifications**: View system notifications and alerts
- **Logout**: Securely log out of the dashboard

#### Connection Status
- **Real-time Status**: Shows connection to backend system
- **Agent Count**: Number of connected agents
- **System Health**: Overall system health indicator

### Sidebar Navigation

The sidebar provides access to all major dashboard sections:

#### Overview Tab
- **Agent Status**: Quick view of all agent states
- **System Health**: Overall system performance metrics
- **Recent Activity**: Latest agent actions and events
- **Quick Actions**: Common tasks and shortcuts

#### Personality Tab
- **Trait Visualization**: Interactive radar chart of personality traits
- **Trait History**: Track personality changes over time
- **Comparative Analysis**: Compare multiple agents' personalities
- **Trait Details**: In-depth information about each trait

#### Memory Tab
- **Memory Systems**: Visualize semantic, episodic, procedural, and working memory
- **Memory Search**: Search through agent memories
- **Memory Analytics**: Memory usage patterns and statistics
- **Consolidation Events**: Track memory consolidation processes

#### Goals Tab
- **Goal Hierarchy**: Visual representation of strategic, tactical, and operational goals
- **Goal Management**: Create, edit, and delete goals
- **Progress Tracking**: Monitor goal completion progress
- **Goal Dependencies**: View relationships between goals

#### Social Tab
- **Relationship Network**: Visual map of agent relationships
- **Trust Levels**: Monitor trust and friendship scores
- **Social Interactions**: Track social events and communications
- **Reputation System**: View reputation metrics and history

#### Skills Tab
- **Skill Progression**: Track skill development and experience
- **Skill Categories**: View skills by category (combat, crafting, etc.)
- **Experience History**: Detailed log of skill gains
- **Skill Synergies**: View skill interactions and bonuses

#### Performance Tab
- **Performance Metrics**: Real-time performance monitoring
- **Resource Utilization**: CPU, memory, and network usage
- **Anomaly Detection**: Automatic detection of unusual patterns
- **Performance Reports**: Detailed performance analysis and reports

## Agent Management

### Viewing Agent Details

#### Agent Cards
Each agent is displayed as a card showing:
- **Agent Name**: Unique identifier
- **Status**: Active, Idle, Busy, Offline
- **Health**: Current health status (color-coded)
- **Activity**: Current activity or goal
- **Performance**: Recent performance metrics

#### Agent Detail View
Click on any agent card to view detailed information:

#### Basic Information
- **Name**: Agent identifier
- **Type**: Agent type or role
- **Status**: Current operational status
- **Health**: Health metrics (HP, food, experience)
- **Location**: Current position in the world
- **Inventory**: Current items and resources

#### Cognitive State
- **Current Goal**: Active goal or task
- **Mood**: Current emotional state
- **Focus**: Current attention focus
- **Cognitive Load**: Mental workload indicator
- **Decision Process**: Current decision-making phase

#### Performance Metrics
- **Response Time**: Average response time
- **Task Completion**: Success rate for tasks
- **Learning Rate**: Speed of skill acquisition
- **Social Interactions**: Number and quality of social interactions

### Managing Agents

#### Agent Selection
- **Single Selection**: Click on agent card to view details
- **Multi-Selection**: Ctrl+Click to select multiple agents
- **Select All**: Use checkbox in header or Ctrl+A
- **Clear Selection**: Click outside cards or press Escape

#### Agent Actions
Right-click on agent cards or use the actions menu:

- **View Details**: Open detailed agent view
- **Send Command**: Direct command to agent
- **Set Goal**: Assign new goal to agent
- **Pause/Resume**: Control agent activity
- **Restart**: Restart agent if needed
- **View Logs**: Access agent activity logs

#### Bulk Operations
Select multiple agents to perform:
- **Bulk Commands**: Send commands to multiple agents
- **Group Goals**: Assign shared goals to agent groups
- **Performance Analysis**: Compare performance across agents
- **Status Updates**: Change status for multiple agents

## Cognitive Features

### Personality Visualization

#### Big Five Traits Radar Chart
- **Openness**: Creativity, curiosity, and preference for novelty
- **Conscientiousness**: Organization, discipline, and goal-orientation
- **Extraversion**: Social interaction, energy, and assertiveness
- **Agreeableness**: Cooperation, empathy, and social harmony
- **Neuroticism**: Emotional stability and stress response

#### Gaming-Specific Traits
- **Risk Tolerance**: Willingness to take risks
- **Creativity**: Problem-solving and creative thinking
- **Patience**: Ability to wait and persist
- **Competitiveness**: Drive to win and achieve
- **Curiosity**: Exploration and learning desire

#### Trait Interactions
- **Hover Effects**: Detailed trait information on hover
- **Trait Comparison**: Side-by-side trait comparison
- **Trait History**: Track trait changes over time
- **Trait Impact**: See how traits affect behavior

### Memory Systems

#### Semantic Memory
- **Knowledge Base**: Facts, concepts, and relationships
- **Search Function**: Find specific knowledge items
- **Knowledge Graph**: Visual representation of knowledge connections
- **Learning Events**: Track new knowledge acquisition

#### Episodic Memory
- **Event Timeline**: Chronological list of experiences
- **Memory Details**: Rich context for each memory
- **Memory Search**: Find specific events or experiences
- **Forgetting Curve**: Visualize memory decay over time

#### Procedural Memory
- **Skills and Habits**: Learned procedures and behaviors
- **Execution Patterns**: How skills are applied
- **Practice Sessions**: Track skill improvement
- **Automation**: Automatic behaviors and routines

#### Working Memory
- **Active Tasks**: Current mental tasks and focus
- **Attention Allocation**: How attention is distributed
- **Cognitive Load**: Current mental workload
- **Task Switching**: Track attention changes

### Goal Management

#### Goal Hierarchy
- **Strategic Goals**: Long-term objectives (weeks to months)
- **Tactical Goals**: Medium-term plans (days to weeks)
- **Operational Goals**: Short-term tasks (minutes to hours)

#### Goal Creation
1. Click "Create Goal" button
2. Select goal type (Strategic/Tactical/Operational)
3. Enter goal details:
   - **Title**: Brief, descriptive name
   - **Description**: Detailed explanation
   - **Priority**: Importance level (1-10)
   - **Dependencies**: Required prerequisites
   - **Deadline**: Optional completion date
4. Click "Create" to add goal

#### Goal Progress Tracking
- **Progress Bar**: Visual progress indicator
- **Milestones**: Key achievement points
- **Time Tracking**: Elapsed and estimated time
- **Success Metrics**: Completion quality indicators

#### Goal Dependencies
- **Dependency Graph**: Visual relationship between goals
- **Prerequisites**: Required before goals
- **Blocking Goals**: Goals preventing progress
- **Critical Path**: Sequence of dependent goals

### Social Features

#### Relationship Network
- **Network Graph**: Visual map of agent relationships
- **Relationship Types**: Different relationship categories
- **Strength Indicators**: Visual strength of relationships
- **Interactive Navigation**: Click to explore connections

#### Trust and Reputation
- **Trust Levels**: Numerical trust scores (0-100)
- **Friendship Scores**: Social bond strength
- **Reputation Metrics**: Overall reputation standing
- **Trust History**: Track trust changes over time

#### Social Interactions
- **Interaction Log**: History of social events
- **Communication Events**: Messages and conversations
- **Collaborative Activities**: Joint tasks and goals
- **Conflict Resolution**: Track and resolve disputes

## Data Visualization

### Interactive Charts

#### Performance Trends
- **Line Charts**: Track metrics over time
- **Area Charts**: Show cumulative values
- **Multi-series**: Compare multiple metrics
- **Time Range Selection**: Zoom and pan functionality

#### Comparative Analysis
- **Bar Charts**: Compare values across agents
- **Radar Charts**: Multi-dimensional comparison
- **Heatmaps**: Show intensity patterns
- **Scatter Plots**: Correlation analysis

#### Real-time Updates
- **Live Data**: Automatic updates without refresh
- **Streaming Indicators**: Show data flow
- **Change Highlights**: Highlight recent changes
- **Alert Notifications**: Notify of significant events

### Custom Visualizations

#### Personality Radar
- **Interactive Points**: Click to explore traits
- **Comparison Mode**: Overlay multiple agents
- **Trait Details**: Expandable information panels
- **Animation**: Smooth transitions between states

#### Goal Hierarchy
- **Tree View**: Hierarchical goal structure
- **Drag and Drop**: Reorganize goals
- **Progress Indicators**: Visual completion status
- **Collapsible Nodes**: Expand/collapse branches

#### Memory Networks
- **Knowledge Graph**: Interconnected concepts
- **Memory Clusters**: Grouped related memories
- **Temporal Flow**: Time-based memory navigation
- **Search Integration**: Find and highlight paths

## Performance Monitoring

### System Health

#### Health Indicators
- **Overall Status**: Green/Yellow/Red health status
- **Component Health**: Individual component status
- **Resource Usage**: CPU, memory, disk usage
- **Network Status**: Connection quality and latency

#### Performance Metrics
- **Response Times**: Average and percentiles
- **Error Rates**: Frequency and types of errors
- **Throughput**: Requests per second
- **Availability**: Uptime percentage

### Anomaly Detection

#### Automatic Alerts
- **Threshold Alerts**: When metrics exceed limits
- **Pattern Anomalies**: Unusual behavior patterns
- **Trend Changes**: Sudden metric changes
- **Correlation Alerts**: Related metric anomalies

#### Investigation Tools
- **Drill-down**: Detailed metric analysis
- **Historical Comparison**: Compare with past periods
- **Root Cause Analysis**: Identify potential causes
- **Impact Assessment**: Effect on system performance

## Settings and Configuration

### User Preferences

#### Display Settings
- **Theme**: Light/Dark/Auto theme selection
- **Language**: Interface language preference
- **Time Zone**: Local time zone setting
- **Date Format**: Preferred date and time format

#### Dashboard Settings
- **Default View**: Preferred dashboard tab
- **Refresh Rate**: Data update frequency
- **Notification Settings**: Alert preferences
- **Layout Options**: Panel arrangement preferences

#### Agent Settings
- **Display Density**: Compact/Normal/Spacious view
- **Sort Options**: Default agent sorting
- **Filter Defaults**: Standard filter settings
- **Grouping Options**: How to group agents

### Data Management

#### Export Options
- **CSV Export**: Download data in CSV format
- **JSON Export**: Export structured data
- **PDF Reports**: Generate PDF reports
- **Scheduled Exports**: Automatic data exports

#### Import Capabilities
- **Agent Data**: Import agent configurations
- **Goal Templates**: Import goal templates
- **Settings Import**: Restore preferences
- **Bulk Operations**: Mass data operations

## Keyboard Shortcuts

### Navigation Shortcuts
- **Ctrl+1**: Overview tab
- **Ctrl+2**: Personality tab
- **Ctrl+3**: Memory tab
- **Ctrl+4**: Goals tab
- **Ctrl+5**: Social tab
- **Ctrl+6**: Skills tab
- **Ctrl+7**: Performance tab

### Action Shortcuts
- **Ctrl+F**: Global search
- **Ctrl+N**: Create new goal
- **Ctrl+R**: Refresh data
- **Ctrl+S**: Save current view
- **Escape**: Clear selection/close modal

### Data Interaction Shortcuts
- **Space**: Select/deselect item
- **Enter**: Open selected item
- **Delete**: Remove selected item
- **Ctrl+A**: Select all items
- **Ctrl+Click**: Multi-selection

### Chart Interaction
- **Arrow Keys**: Navigate chart data
- **+/-**: Zoom in/out
- **R**: Reset chart view
- **T**: Toggle chart type
- **H**: Toggle help overlay

## Accessibility Features

### Visual Accessibility
- **High Contrast**: Enhanced contrast mode
- **Large Text**: Increased font size
- **Color Blind Friendly**: Color-blind compatible palette
- **Focus Indicators**: Clear keyboard navigation

### Screen Reader Support
- **ARIA Labels**: Comprehensive labeling
- **Screen Reader Announcements**: Important changes announced
- **Keyboard Navigation**: Full keyboard accessibility
- **Semantic HTML**: Proper heading structure

### Motor Accessibility
- **Large Click Targets**: Bigger interactive areas
- **Keyboard Shortcuts**: Alternative to mouse interaction
- **Gesture Support**: Touch-friendly interactions
- **Reduced Motion**: Option to disable animations

### Cognitive Accessibility
- **Clear Language**: Simple, direct language
- **Consistent Navigation**: Predictable interface
- **Error Prevention**: Confirmation for destructive actions
- **Help Documentation**: Built-in help system

## Troubleshooting

### Common Issues

#### Connection Problems
**Issue**: Dashboard shows "Disconnected" status
**Solutions**:
1. Check internet connection
2. Refresh the page (F5)
3. Clear browser cache
4. Contact administrator

#### Data Not Loading
**Issue**: Charts and data showing empty or loading
**Solutions**:
1. Wait for data to load (may take time on slow connections)
2. Check connection status in header
3. Try refreshing the specific tab
4. Check if backend is operational

#### Slow Performance
**Issue**: Dashboard is slow or unresponsive
**Solutions**:
1. Close other browser tabs
2. Disable browser extensions
3. Clear browser cache
4. Use a modern browser
5. Check system resources

#### Display Issues
**Issue**: Charts or visualizations not displaying correctly
**Solutions**:
1. Update browser to latest version
2. Enable JavaScript
3. Check screen resolution
4. Try different browser
5. Disable ad blockers

### Error Messages

#### Connection Errors
- **"Unable to connect to backend"**: Backend is down or network issue
- **"Authentication failed"**: Check login credentials
- **"Permission denied"**: Contact administrator for access

#### Data Errors
- **"Failed to load agent data"**: Try refreshing or check connection
- **"Invalid data format"**: Clear cache and reload
- **"Export failed"**: Check browser permissions

#### Performance Errors
- **"Dashboard is unresponsive"**: Refresh page and reduce data load
- **"Memory usage high"**: Close other applications
- **"Script error"**: Report to technical support

### Getting Help

#### Built-in Help
- **Help Button**: Click help icon (?) in any section
- **Contextual Help**: F1 key for current section help
- **Interactive Tutorial**: Available from main menu
- **FAQ Section**: Common questions and answers

#### Support Channels
- **In-app Support**: Use support chat or contact form
- **Email Support**: Send detailed error reports
- **Documentation**: Access full documentation library
- **Community Forum**: User community and discussions

#### Reporting Issues
When reporting issues, please include:
1. **Browser and Version**: Chrome 95, Firefox 88, etc.
2. **Operating System**: Windows 10, macOS 12, etc.
3. **Error Message**: Exact text of error
4. **Steps to Reproduce**: What you were doing when error occurred
5. **Expected Behavior**: What you expected to happen
6. **Actual Behavior**: What actually happened

### Tips and Best Practices

#### Performance Tips
- **Use Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Keep Browser Updated**: Enable automatic updates
- **Manage Extensions**: Disable unnecessary extensions
- **Monitor Resources**: Close unused applications

#### Navigation Tips
- **Use Keyboard Shortcuts**: Faster than mouse navigation
- **Learn Search**: Use global search for quick access
- **Customize Layout**: Arrange panels for your workflow
- **Use Bookmarks**: Save frequent views

#### Data Management Tips
- **Regular Backups**: Export important data regularly
- **Monitor Usage**: Keep track of data consumption
- **Clean Up**: Remove old or unnecessary data
- **Use Filters**: Focus on relevant information

---

For additional help or questions, please contact your system administrator or refer to the complete documentation library.
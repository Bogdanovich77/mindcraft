# Frontend Component Definitions and Dependencies

## Overview

This document provides comprehensive definitions and specifications for the Frontend Cognitive Dashboard components, dependencies, and data structures used in the Mindcraft LangGraph system visualization.

## Core Technologies

### Frontend Framework
- **React 19**: Latest version with concurrent features and automatic batching
- **TypeScript 5.2**: Strict type checking with comprehensive configuration
- **Vite 5.0**: Fast build tool with optimized development and production builds

### State Management
- **Redux Toolkit**: Modern Redux implementation with simplified state management
- **React Redux**: Official React bindings for Redux
- **Redux Thunk**: Middleware for asynchronous actions

### UI Framework
- **Material-UI v7**: Modern React component library with Material Design
- **@mui/icons-material**: Comprehensive icon set
- **@emotion/react**: CSS-in-JS solution used by Material-UI

### Data Visualization
- **D3.js**: Powerful data visualization library for complex cognitive graphs
- **Recharts**: React-specific charting library for metrics visualization
- **@types/d3**: TypeScript definitions for D3.js

### Communication
- **Socket.IO Client**: Real-time bidirectional communication with backend
- **Axios**: HTTP client for REST API requests

### Utilities
- **date-fns**: Modern date utility library
- **lodash**: Utility library for data manipulation
- **@types/lodash**: TypeScript definitions for Lodash

## Redux State Management

### Root State Interface

```typescript
interface RootState {
  agents: AgentsState;           // Agent data and status
  connection: ConnectionState;   // Socket connection status
  ui: UIState;                  // UI state and modals
  personality: PersonalityState; // Personality trait data
  memory: MemoryState;          // Memory system data
  goals: GoalsState;            // Goal hierarchy data
  social: SocialState;          // Social relationship data
  skills: SkillsState;          // Skill progression data
  performance: PerformanceState; // Performance metrics
}
```

### Agents Slice

```typescript
interface AgentsState {
  agents: Record<string, Agent>; // Agent data by ID
  selectedAgentId: string | null; // Currently selected agent
  loading: boolean;              // Loading state
  error: string | null;          // Error state
  filters: AgentFilters;         // Active filters
  sortBy: AgentSortField;        // Sort field
  sortOrder: 'asc' | 'desc';     // Sort order
}

interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  health: AgentHealth;
  position: Position;
  inventory: Inventory;
  cognitive: CognitiveState;
  performance: PerformanceMetrics;
  createdAt: string;
  updatedAt: string;
}
```

### Connection Slice

```typescript
interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastConnected: string | null;
  socketId: string | null;
}
```

### UI Slice

```typescript
interface UIState {
  activeTab: DashboardTab;
  sidebarOpen: boolean;
  loading: Record<string, boolean>;
  modals: Record<string, boolean>;
  notifications: Notification[];
  theme: 'light' | 'dark';
  zoom: number;
}
```

### Personality Slice

```typescript
interface PersonalityState {
  traits: PersonalityTraits;
  emotions: EmotionalState;
  mood: MoodState;
  updatedAt: string;
}

interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  riskTolerance: number;
  creativity: number;
  patience: number;
  competitiveness: number;
  curiosity: number;
}
```

### Memory Slice

```typescript
interface MemoryState {
  semantic: SemanticMemory[];
  episodic: EpisodicMemory[];
  procedural: ProceduralMemory[];
  working: WorkingMemory;
  consolidation: ConsolidationState;
}

interface SemanticMemory {
  id: string;
  type: 'concept' | 'fact' | 'relationship';
  content: string;
  confidence: number;
  importance: number;
  tags: string[];
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
}

interface EpisodicMemory {
  id: string;
  type: 'exploration' | 'social' | 'combat' | 'crafting' | 'other';
  description: string;
  location: Position;
  participants: string[];
  outcome: 'success' | 'failure' | 'partial';
  emotionalImpact: number;
  importance: number;
  timestamp: string;
  decayFactor: number;
}
```

### Goals Slice

```typescript
interface GoalsState {
  strategic: Goal[];
  tactical: Goal[];
  operational: Goal[];
  activeGoals: string[];
  goalHistory: GoalHistoryEntry[];
}

interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  priority: number;
  status: GoalStatus;
  progress: number;
  dependencies: string[];
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  estimatedDuration?: number;
}

enum GoalType {
  STRATEGIC = 'strategic',
  TACTICAL = 'tactical',
  OPERATIONAL = 'operational'
}

enum GoalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
```

### Social Slice

```typescript
interface SocialState {
  relationships: Relationship[];
  interactions: SocialInteraction[];
  reputation: Reputation;
  network: SocialNetwork;
}

interface Relationship {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  type: RelationshipType;
  trust: number;
  friendship: number;
  reputation: number;
  interactions: number;
  lastInteraction: string;
  createdAt: string;
  updatedAt: string;
}

enum RelationshipType {
  TRUST = 'trust',
  FRIENDSHIP = 'friendship',
  PROFESSIONAL = 'professional',
  ANTAGONISTIC = 'antagonistic'
}
```

### Skills Slice

```typescript
interface SkillsState {
  skills: Skill[];
  experience: ExperienceHistory[];
  synergies: SkillSynergy[];
  progression: SkillProgression;
}

interface Skill {
  id: string;
  type: SkillType;
  category: SkillCategory;
  level: number;
  experience: number;
  proficiency: SkillProficiency;
  usage: SkillUsage;
  createdAt: string;
  lastUsed: string;
}

interface SkillProficiency {
  knowledge: number;
  practical: number;
  creative: number;
  overall: number;
}

enum SkillType {
  MINING = 'mining',
  CRAFTING = 'crafting',
  COMBAT = 'combat',
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  BUILDING = 'building',
  AGRICULTURE = 'agriculture',
  TRADING = 'trading',
  MAGIC = 'magic',
  SURVIVAL = 'survival'
}
```

### Performance Slice

```typescript
interface PerformanceState {
  metrics: PerformanceMetrics;
  history: PerformanceHistory[];
  alerts: PerformanceAlert[];
  benchmarks: PerformanceBenchmark[];
}

interface PerformanceMetrics {
  responseTime: number;
  taskCompletionRate: number;
  learningRate: number;
  socialInteractionQuality: number;
  cognitiveLoad: number;
  memoryUsage: number;
  errorRate: number;
  uptime: number;
}
```

## Key Component Definitions

### Dashboard Components

#### AgentCard
```typescript
interface AgentCardProps {
  agent: Agent;
  onSelect: (agentId: string) => void;
  selected: boolean;
  compact?: boolean;
}

// Displays agent overview with:
// - Basic info (name, type, status)
// - Health indicators
// - Performance metrics
// - Quick action buttons
```

#### StatusIndicator
```typescript
interface StatusIndicatorProps {
  status: AgentStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

// Visual status indicator with:
// - Color-coded status display
// - Animated transitions
// - Accessibility support
```

#### PerformanceMetrics
```typescript
interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
  historical?: boolean;
  compact?: boolean;
}

// Performance visualization with:
// - Real-time metric displays
// - Trend indicators
// - Alert notifications
```

### Tab Components

#### OverviewTab
```typescript
interface OverviewTabProps {
  agent: Agent;
  onAgentUpdate: (agent: Agent) => void;
}

// Main dashboard view with:
// - Agent summary cards
// - Quick stats overview
// - Recent activity feed
// - System health indicators
```

#### PersonalityTab
```typescript
interface PersonalityTabProps {
  personality: PersonalityState;
  onPersonalityUpdate: (traits: PersonalityTraits) => void;
}

// Personality visualization with:
// - Big Five traits radar chart
// - Emotional state display
// - Mood trend analysis
// - Trait adjustment controls
```

#### MemoryTab
```typescript
interface MemoryTabProps {
  memory: MemoryState;
  onMemorySearch: (query: string) => void;
}

// Memory system visualization with:
// - Semantic network graph
// - Episodic timeline view
// - Working memory display
// - Memory search interface
```

#### GoalsTab
```typescript
interface GoalsTabProps {
  goals: GoalsState;
  onGoalUpdate: (goal: Goal) => void;
  onGoalCreate: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
}

// Goal management interface with:
// - Hierarchical goal tree
// - Progress tracking
// - Drag-and-drop reordering
// - Goal creation/editing forms
```

#### SocialTab
```typescript
interface SocialTabProps {
  social: SocialState;
  onInteractionCreate: (interaction: SocialInteraction) => void;
}

// Social relationship visualization with:
// - Network graph display
// - Relationship details
// - Interaction history
// - Social metrics dashboard
```

#### SkillsTab
```typescript
interface SkillsTabProps {
  skills: SkillsState;
  onSkillUpdate: (skill: Skill) => void;
}

// Skill progression visualization with:
// - Skill category charts
// - Experience tracking
// - Synergy visualization
// - Learning recommendations
```

#### PerformanceTab
```typescript
interface PerformanceTabProps {
  performance: PerformanceState;
  onBenchmarkUpdate: (benchmark: PerformanceBenchmark) => void;
}

// Performance monitoring with:
// - Real-time metrics charts
// - Historical trend analysis
// - Benchmark comparisons
// - Alert management
```

### Visualization Components

#### PersonalityRadar
```typescript
interface PersonalityRadarProps {
  traits: PersonalityTraits;
  comparisons?: PersonalityTraits[];
  interactive?: boolean;
  size?: number;
}

// D3.js radar chart for:
// - Big Five traits visualization
// - Multiple personality comparisons
// - Interactive trait exploration
// - Animated transitions
```

#### MemoryNetwork
```typescript
interface MemoryNetworkProps {
  memories: SemanticMemory[];
  selectedMemory?: string;
  onMemorySelect: (memoryId: string) => void;
  filters?: MemoryFilters;
}

// D3.js network graph for:
// - Semantic memory relationships
// - Interactive node exploration
// - Cluster visualization
// - Search and filtering
```

#### GoalHierarchy
```typescript
interface GoalHierarchyProps {
  goals: Goal[];
  selectedGoal?: string;
  onGoalSelect: (goalId: string) => void;
  onGoalReorder: (goalIds: string[]) => void;
  editable?: boolean;
}

// Interactive tree visualization for:
// - Goal hierarchy display
// - Drag-and-drop reordering
// - Progress indication
// - Collapsible branches
```

#### SocialGraph
```typescript
interface SocialGraphProps {
  relationships: Relationship[];
  agents: Record<string, Agent>;
  selectedAgent?: string;
  onAgentSelect: (agentId: string) => void;
  layoutType?: 'force' | 'circular' | 'hierarchical';
}

// D3.js social network visualization for:
// - Relationship network display
// - Interactive agent exploration
// - Relationship strength indicators
// - Multiple layout options
```

#### SkillProgression
```typescript
interface SkillProgressionProps {
  skills: Skill[];
  selectedSkill?: string;
  onSkillSelect: (skillId: string) => void;
  showSynergies?: boolean;
}

// Skill progression visualization with:
// - Experience bar charts
// - Category-based grouping
// - Synergy relationship display
// - Level progression tracking
```

### Service Layer

#### SocketService
```typescript
class SocketService {
  private socket: Socket;
  private store: Store;
  
  connect(): Promise<void>;
  disconnect(): void;
  
  // Agent events
  onAgentStateUpdate(callback: (agent: Agent) => void): void;
  onAgentConnected(callback: (agent: Agent) => void): void;
  onAgentDisconnected(callback: (agentId: string) => void): void;
  
  // System events
  onSystemStatus(callback: (status: SystemStatus) => void): void;
  
  // Actions
  sendAgentMessage(agentId: string, message: string): void;
  requestAgentList(): void;
}

// Socket.IO client service for:
// - Real-time data streaming
// - Connection management
// - Event handling
// - Error recovery
```

#### ApiService
```typescript
class ApiService {
  private axios: AxiosInstance;
  
  // Agent management
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent>;
  createAgent(agent: CreateAgentRequest): Promise<Agent>;
  updateAgent(id: string, agent: UpdateAgentRequest): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;
  
  // Goal management
  getAgentGoals(agentId: string): Promise<GoalsState>;
  createGoal(agentId: string, goal: CreateGoalRequest): Promise<Goal>;
  updateGoal(agentId: string, goalId: string, goal: UpdateGoalRequest): Promise<Goal>;
  deleteGoal(agentId: string, goalId: string): Promise<void>;
  
  // System management
  getSystemStatus(): Promise<SystemStatus>;
  getSystemConfig(): Promise<SystemConfig>;
  updateSystemConfig(config: UpdateSystemConfigRequest): Promise<SystemConfig>;
}

// HTTP API service for:
// - REST API communication
// - Data CRUD operations
// - Error handling
// - Request/response transformation
```

#### ValidationService
```typescript
class ValidationService {
  // Agent validation
  validateAgent(agent: Agent): ValidationResult;
  validateAgentCreate(request: CreateAgentRequest): ValidationResult;
  
  // Goal validation
  validateGoal(goal: Goal): ValidationResult;
  validateGoalCreate(request: CreateGoalRequest): ValidationResult;
  
  // Data validation
  validatePersonality(traits: PersonalityTraits): ValidationResult;
  validateMemory(memory: MemoryState): ValidationResult;
  validateSocial(social: SocialState): ValidationResult;
  validateSkills(skills: SkillsState): ValidationResult;
}

// Data validation service for:
// - Input validation
// - Type checking
// - Business rule validation
// - Error message generation
```

### Utility Components

#### ErrorBoundary
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Error boundary component for:
// - Error catching and handling
// - Graceful error display
// - Error reporting
// - Recovery mechanisms
```

#### LoadingIndicator
```typescript
interface LoadingIndicatorProps {
  loading: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'linear' | 'dots';
  message?: string;
}

// Loading indicator component for:
// - Loading state visualization
// - Progress indication
// - User feedback
// - Accessibility support
```

#### DataFormatter
```typescript
class DataFormatter {
  // Date formatting
  formatDate(date: string | Date): string;
  formatRelativeTime(date: string | Date): string;
  
  // Number formatting
  formatPercentage(value: number): string;
  formatDuration(milliseconds: number): string;
  
  // Agent data formatting
  formatAgentStatus(status: AgentStatus): string;
  formatAgentType(type: AgentType): string;
  
  // Performance formatting
  formatResponseTime(ms: number): string;
  formatMemoryUsage(bytes: number): string;
}

// Data formatting utility for:
// - Consistent data display
// - Localization support
// - Unit conversion
// - Accessibility formatting
```

## Data Flow Architecture

### Real-Time Data Flow

```
Backend (MindServer) → Socket.IO → Redux Store → React Components → UI Updates
```

### Component Data Flow

```
Props → Component State → Local Effects → Redux Actions → Redux Store → Component Re-render
```

### Event Handling Flow

```
User Interaction → Component Event Handler → Redux Action → API/Socket Call → Redux Update → UI Update
```

## Performance Considerations

### Component Optimization
- React.memo for expensive components
- useMemo for complex calculations
- useCallback for event handlers
- Virtual scrolling for large lists

### Data Optimization
- Redux selector optimization
- Data normalization
- Lazy loading for large datasets
- Throttled real-time updates

### Rendering Optimization
- D3.js rendering optimization
- Canvas rendering for complex visualizations
- Web Workers for data processing
- Code splitting for large applications

## TypeScript Configuration

### Strict Type Checking
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Path Mapping
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

## Testing Infrastructure

### Component Testing
- React Testing Library for component testing
- Jest for test framework
- TypeScript support for type-safe testing
- Mock implementations for services

### Integration Testing
- Socket.IO mocking for real-time features
- Redux store testing utilities
- API mocking with MSW
- End-to-end testing with Cypress

### Performance Testing
- Component rendering performance
- Memory usage monitoring
- Bundle size analysis
- Real-time update performance

## Development Workflow

### Component Development
1. Create TypeScript interfaces
2. Implement component with hooks
3. Add Redux integration
4. Create unit tests
5. Add integration tests
6. Performance optimization
7. Documentation updates

### State Management
1. Define slice interfaces
2. Implement slice with Redux Toolkit
3. Create selectors
4. Add middleware
5. Write tests
6. Performance optimization

### Service Integration
1. Define service interfaces
2. Implement service classes
3. Add error handling
4. Create mock implementations
5. Write integration tests
6. Documentation

This comprehensive component architecture provides a solid foundation for the Frontend Cognitive Dashboard, ensuring maintainability, performance, and extensibility while providing rich visualization capabilities for the LangGraph cognitive architecture.
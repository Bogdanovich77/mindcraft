# Mindcraft Cognitive Dashboard - Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [API Documentation](#api-documentation)
4. [Socket.IO Events](#socketio-events)
5. [Redux Store Structure](#redux-store-structure)
6. [Component Architecture](#component-architecture)
7. [Performance Optimization](#performance-optimization)
8. [Security Considerations](#security-considerations)
9. [TypeScript Interfaces](#typescript-interfaces)
10. [Integration Patterns](#integration-patterns)

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend System Architecture                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   React App    │  │   Redux Store   │  │  Socket.IO      │ │
│  │                 │  │                 │  │   Client        │ │
│  │ • Components   │  │ • State Mgmt   │  │ • Real-time    │ │
│  │ • Hooks        │  │ • Middleware   │  │ • Events       │ │
│  │ • Routing      │  │ • Persistence  │  │ • Reconnection  │ │
│  │ • Context      │  │ • DevTools     │  │ • Error Handling│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   D3.js        │  │   Recharts      │  │   Material-UI  │ │
│  │   Visualizers   │  │   Charts        │  │   Components    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Network      │  │ • Trends       │  │ • Layout       │ │
│  │ • Graphs       │  │ • Metrics      │  │ • Forms        │ │
│  │ • Heatmaps     │  │ • Analytics    │  │ • Navigation   │ │
│  │ • Animations   │  │ • Interactions  │  │ • Theming      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Vite         │  │   TypeScript    │  │   Testing       │ │
│  │                 │  │                 │  │                 │ │
│  │ • Build Tool   │  │ • Type Safety   │  │ • Unit Tests    │ │
│  │ • Dev Server   │  │ • Interfaces    │  │ • Integration   │ │
│  │ • HMR         │  │ • Compilation   │  │ • E2E Tests    │ │
│  │ • Optimizations│  │ • Linting      │  │ • Coverage     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
```
App
├── Router
├── ThemeProvider
├── ErrorBoundary
├── SocketProvider
├── ReduxProvider
└── MainLayout
    ├── Header
    ├── Navigation
    ├── SearchBar
    ├── UserMenu
    └── ConnectionStatus
    ├── Sidebar
    ├── TabNavigation
    └── QuickActions
    └── ContentArea
        ├── OverviewTab
        ├── AgentCards
        ├── SystemHealth
        └── RecentActivity
        ├── PersonalityTab
        ├── PersonalityRadar
        ├── TraitHistory
        └── TraitComparison
        ├── MemoryTab
        ├── MemoryVisualizer
        ├── MemorySearch
        └── MemoryAnalytics
        ├── GoalsTab
        ├── GoalHierarchy
        ├── GoalEditor
        └── ProgressTracker
        ├── SocialTab
        ├── RelationshipNetwork
        ├── TrustLevels
        └── SocialInteractions
        ├── SkillsTab
        ├── SkillProgression
        ├── ExperienceHistory
        └── SkillSynergies
        └── PerformanceTab
            ├── PerformanceMetrics
            ├── ResourceUtilization
            ├── AnomalyDetection
            └── PredictiveAnalytics
            └── PerformanceReports
```

### Data Flow Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Data Flow Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                     │
│  Backend API/Socket.IO                                  │
│         ↓                                             │
│  Socket.IO Service (Real-time)                          │
│  ↓ ↓ ↓ ↓                                             │
│  Redux Store (State Management)                          │
│  ↓ ↓ ↓ ↓                                             │
│  React Components (UI Updates)                           │
│         ↓                                             │
│  User Interface                                         │
│         ↑                                             │
│  User Interactions                                     │
│  ↑ ↑ ↑ ↑                                             │
│  Event Handlers                                        │
│  ↑ ↑ ↑ ↑                                             │
│  Action Dispatchers                                    │
│  ↑ ↑ ↑ ↑                                             │
│  Redux Actions                                         │
│  ↑ ↑ ↑ ↑                                             │
│  State Updates                                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Real-time Data Flow
```typescript
// Real-time data flow from backend to frontend
Backend (Mindcraft Server)
    ↓ Socket.IO Connection
Socket.IO Service (socketService.ts)
    ↓ Event Emission
Event Listeners (components/services)
    ↓ State Updates
Redux Store (slices/*.ts)
    ↓ Component Re-render
React Components (UI updates)
    ↓ User Actions
User Interactions (clicks, inputs)
    ↓ Action Dispatch
Redux Actions
    ↓ API Calls
Backend API (REST/Socket.IO)
```

### State Update Flow
```typescript
// State update flow example
1. User Action (e.g., select agent)
   dispatch(selectAgent(agentId))

2. Action Processing (agentsSlice.ts)
   case 'agents/selectAgent':
     state.selectedAgentId = action.payload

3. State Update (Redux)
   RootState.agents.selectedAgentId = agentId

4. Component Re-render (React)
   useSelector(state => state.agents.selectedAgentId)
   Component updates with new selected agent

5. Side Effects (if any)
   useEffect(() => {
     // Fetch agent details when selection changes
     fetchAgentDetails(agentId);
   }, [agentId]);
```

### Data Transformation Flow
```typescript
// Data transformation pipeline
Raw Data (Socket.IO/REST API)
    ↓ Validation & Sanitization
Validated Data (utils/validation.ts)
    ↓ Type Transformation
Typed Data (types/*.ts)
    ↓ Business Logic
Processed Data (slices/*.ts)
    ↓ UI Formatting
Display Data (components/*.tsx)
```

## API Documentation

### REST API Endpoints

#### Agent Management
```typescript
// Get all agents
GET /api/agents
Response: {
  agents: Agent[];
  total: number;
  page: number;
  pageSize: number;
}

// Get specific agent
GET /api/agents/:id
Response: {
  agent: Agent;
  status: 'active' | 'idle' | 'offline';
  lastUpdated: string;
}

// Create agent
POST /api/agents
Body: {
  name: string;
  type: string;
  configuration: AgentConfig;
}
Response: {
  agent: Agent;
  id: string;
}

// Update agent
PUT /api/agents/:id
Body: Partial<Agent>;
Response: {
  agent: Agent;
  updated: string[];
}

// Delete agent
DELETE /api/agents/:id
Response: {
  success: boolean;
  message: string;
}
```

#### Goal Management
```typescript
// Get agent goals
GET /api/agents/:id/goals
Response: {
  goals: Goal[];
  hierarchy: GoalHierarchy;
}

// Create goal
POST /api/agents/:id/goals
Body: {
  type: 'strategic' | 'tactical' | 'operational';
  title: string;
  description: string;
  priority: number;
  dependencies?: string[];
}
Response: {
  goal: Goal;
  id: string;
}

// Update goal
PUT /api/agents/:id/goals/:goalId
Body: Partial<Goal>;
Response: {
  goal: Goal;
  updated: string[];
}

// Delete goal
DELETE /api/agents/:id/goals/:goalId
Response: {
  success: boolean;
  message: string;
}
```

#### System Management
```typescript
// Get system status
GET /api/system/status
Response: {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
  metrics: SystemMetrics;
}

// Get system configuration
GET /api/system/config
Response: {
  config: SystemConfig;
  features: FeatureFlags;
}

// Update system configuration
PUT /api/system/config
Body: Partial<SystemConfig>;
Response: {
  config: SystemConfig;
  updated: string[];
}
```

### Error Handling
```typescript
// Standard error response format
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// HTTP Status Codes
200: Success
201: Created
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
429: Too Many Requests
500: Internal Server Error
503: Service Unavailable
```

## Socket.IO Events

### Connection Events
```typescript
// Connection established
'socket:connect': {
  socketId: string;
  timestamp: number;
}

// Connection lost
'socket:disconnect': {
  reason: string;
  timestamp: number;
}

// Connection error
'socket:error': {
  error: string;
  timestamp: number;
}
```

### Agent Lifecycle Events
```typescript
// Agent connected
'agent:connected': {
  agentId: string;
  agent: Agent;
  timestamp: number;
}

// Agent disconnected
'agent:disconnected': {
  agentId: string;
  reason: string;
  timestamp: number;
}

// Agent state update
'agent:state:update': {
  agentId: string;
  state: AgentState;
  changes: StateChange[];
  timestamp: number;
}

// Agent list update
'agent:list:update': {
  agents: Agent[];
  total: number;
  timestamp: number;
}
```

### Cognitive Component Events
```typescript
// Personality trait update
'personality:trait:update': {
  agentId: string;
  trait: string;
  value: number;
  previousValue: number;
  timestamp: number;
}

// Memory system update
'memory:semantic:update': {
  agentId: string;
  memories: SemanticMemory[];
  operation: 'add' | 'update' | 'delete';
  timestamp: number;
}

// Goal hierarchy update
'goal:hierarchy:update': {
  agentId: string;
  hierarchy: GoalHierarchy;
  changes: GoalChange[];
  timestamp: number;
}

// Social relationship update
'social:relationship:update': {
  agentId: string;
  relationship: Relationship;
  changeType: 'trust' | 'friendship' | 'reputation';
  timestamp: number;
}

// Skill progress update
'skill:progress:update': {
  agentId: string;
  skill: string;
  progress: SkillProgress;
  experienceGained: number;
  timestamp: number;
}
```

### Performance Events
```typescript
// Performance metrics update
'performance:metrics:update': {
  agentId: string;
  metrics: PerformanceMetrics;
  timestamp: number;
}

// Performance alert
'performance:alert:event': {
  agentId: string;
  alert: PerformanceAlert;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
}

// Anomaly detection
'performance:anomaly:detect': {
  agentId: string;
  anomaly: Anomaly;
  confidence: number;
  timestamp: number;
}
```

## Redux Store Structure

### Root State Interface
```typescript
interface RootState {
  agents: AgentsState;
  ui: UIState;
  connection: ConnectionState;
  dashboard: DashboardState;
  personality: PersonalityState;
  memory: MemoryState;
  goals: GoalHierarchyState;
  social: SocialState;
  skills: SkillsState;
}
```

### Agents Slice
```typescript
interface AgentsState {
  agents: Record<string, Agent>;
  selectedAgentId: string | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  filters: AgentFilters;
  sortBy: AgentSortOption;
  sortOrder: 'asc' | 'desc';
}

// Actions
interface AgentsActions {
  setAgents: (agents: Record<string, Agent>) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  selectAgent: (agentId: string) => void;
  setAgentsLoading: (loading: boolean) => void;
  setAgentsError: (error: string | null) => void;
  setFilters: (filters: AgentFilters) => void;
  setSorting: (sortBy: AgentSortOption, sortOrder: 'asc' | 'desc') => void;
}
```

### UI Slice
```typescript
interface UIState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  sidebarCollapsed: boolean;
  activeTab: string;
  notifications: Notification[];
  modals: {
    [key: string]: boolean;
  };
  loading: {
    [key: string]: boolean;
  };
}

// Actions
interface UIActions {
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: string) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  openModal: (modal: string) => void;
  closeModal: (modal: string) => void;
  setLoading: (key: string, loading: boolean) => void;
}
```

### Connection Slice
```typescript
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  metrics: ConnectionMetrics;
  reconnectAttempts: number;
  lastConnected: number | null;
  lastDisconnected: number | null;
}

interface ConnectionMetrics {
  connectedAt: number | null;
  lastDisconnected: number | null;
  totalReconnectAttempts: number;
  connectionUptime: number;
  averageLatency: number;
  lastPingTime: number | null;
}

// Actions
interface ConnectionActions {
  setConnected: (isConnected: boolean) => void;
  setConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  updateMetrics: (metrics: Partial<ConnectionMetrics>) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}
```

## Component Architecture

### Component Design Patterns

#### Functional Components with Hooks
```typescript
// Standard component pattern
interface ComponentProps {
  prop1: string;
  prop2: number;
  prop3?: boolean;
  onAction?: (data: any) => void;
}

const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  prop3 = false,
  onAction
}) => {
  // State hooks
  const [localState, setLocalState] = useState(initialState);
  
  // Redux hooks
  const dispatch = useAppDispatch();
  const globalState = useAppSelector(state => state.someSlice);
  
  // Effect hooks
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Memo hooks
  const memoizedValue = useMemo(() => {
    return expensiveComputation(prop1, prop2);
  }, [prop1, prop2]);
  
  // Callback hooks
  const handleAction = useCallback((data: any) => {
    onAction?.(data);
  }, [onAction]);
  
  return (
    <div className="component">
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

#### Container-Presenter Pattern
```typescript
// Container component (logic)
interface ContainerProps {
  agentId: string;
}

const Container: React.FC<ContainerProps> = ({ agentId }) => {
  const dispatch = useAppDispatch();
  const agent = useAppSelector(state => state.agents.agents[agentId]);
  
  const handleUpdate = useCallback((updates: Partial<Agent>) => {
    dispatch(updateAgent(agentId, updates));
  }, [dispatch, agentId]);
  
  return (
    <Presenter
      agent={agent}
      onUpdate={handleUpdate}
    />
  );
};

// Presenter component (UI)
interface PresenterProps {
  agent: Agent | null;
  onUpdate: (updates: Partial<Agent>) => void;
}

const Presenter: React.FC<PresenterProps> = ({ agent, onUpdate }) => {
  if (!agent) return <div>Loading...</div>;
  
  return (
    <div className="presenter">
      <h2>{agent.name}</h2>
      <p>Status: {agent.status}</p>
      <button onClick={() => onUpdate({ status: 'active' })}>
        Activate
      </button>
    </div>
  );
};
```

#### Higher-Order Components
```typescript
// HOC for authentication
interface WithAuthProps {
  authenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

const withAuth = <P extends object>(
  Component: React.ComponentType<P & WithAuthProps>
) => {
  return (props: P) => {
    const { user, login, logout } = useAuth();
    
    return (
      <Component
        {...props}
        authenticated={!!user}
        user={user}
        login={login}
        logout={logout}
      />
    );
  };
};

// Usage
const ProtectedComponent = withAuth(MyComponent);
```

### Custom Hooks

#### Data Fetching Hook
```typescript
function useAgentData(agentId: string): {
  agent: Agent | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const dispatch = useAppDispatch();
  const agent = useAppSelector(state => state.agents.agents[agentId]);
  const loading = useAppSelector(state => state.agents.loading);
  const error = useAppSelector(state => state.agents.error);
  
  const refresh = useCallback(() => {
    dispatch(fetchAgent(agentId));
  }, [dispatch, agentId]);
  
  useEffect(() => {
    if (agentId && !agent && !loading) {
      refresh();
    }
  }, [agentId, agent, loading, refresh]);
  
  return { agent, loading, error, refresh };
}
```

#### Performance Monitoring Hook
```typescript
function usePerformanceMonitor(componentName: string): {
  metrics: PerformanceMetrics;
  startRender: () => void;
  endRender: () => void;
  recordInteraction: (action: string) => void;
} {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    interactionCount: 0,
    lastInteraction: null,
    averageRenderTime: 0
  });
  
  const renderStartTime = useRef<number>();
  const renderHistory = useRef<number[]>([]);
  
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);
  
  const endRender = useCallback(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      renderHistory.current.push(renderTime);
      
      // Keep only last 10 renders
      if (renderHistory.current.length > 10) {
        renderHistory.current.shift();
      }
      
      const averageRenderTime = renderHistory.current.reduce((sum, time) => sum + time, 0) / renderHistory.current.length;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        averageRenderTime
      }));
    }
  }, []);
  
  const recordInteraction = useCallback((action: string) => {
    setMetrics(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      lastInteraction: { action, timestamp: Date.now() }
    }));
  }, []);
  
  return { metrics, startRender, endRender, recordInteraction };
}
```

## Performance Optimization

### Component Optimization

#### Memoization Strategies
```typescript
// React.memo for component memoization
const MemoizedComponent = React.memo(({ data, onUpdate }) => {
  return <div>{data.value}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.data.id === nextProps.data.id &&
         prevProps.data.value === nextProps.data.value;
});

// useMemo for expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data.id, data.complexField]); // Only recompute when dependencies change

// useCallback for stable function references
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]); // Stable reference
```

#### Virtual Scrolling
```typescript
// Virtual list for large datasets
import { FixedSizeList as List } from 'react-window';

const VirtualAgentList: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <AgentCard agent={agents[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={agents.length}
      itemSize={120}
      itemData={agents}
    >
      {Row}
    </List>
  );
};
```

### Bundle Optimization

#### Code Splitting
```typescript
// Lazy loading components
const LazyDashboard = lazy(() => import('./Dashboard'));
const LazySettings = lazy(() => import('./Settings'));

// Route-based code splitting
const routes = [
  {
    path: '/dashboard',
    component: LazyDashboard
  },
  {
    path: '/settings',
    component: LazySettings
  }
];

// Dynamic imports for features
const loadFeature = async (featureName: string) => {
  const module = await import(`./features/${featureName}`);
  return module.default;
};
```

#### Tree Shaking
```typescript
// Export specific functions to enable tree shaking
export { specificFunction1, specificFunction2 } from './utils';
// Instead of
export * from './utils';

// Use dynamic imports for optional features
const optionalFeature = await import('./optional-feature');
```

### Memory Management

#### Cleanup Patterns
```typescript
// Proper cleanup in useEffect
useEffect(() => {
  const timer = setInterval(() => {
    // Periodic work
  }, 1000);
  
  const subscription = dataService.subscribe(handleData);
  
  return () => {
    clearInterval(timer); // Cleanup timer
    subscription.unsubscribe(); // Cleanup subscription
  };
}, [dependencies]);

// Cleanup event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

## Security Considerations

### Input Validation
```typescript
// Sanitize user inputs
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: ['class', 'id']
  });
};

// Validate API responses
const validateApiResponse = (response: any): boolean => {
  return typeof response === 'object' &&
         typeof response.data !== 'undefined' &&
         Array.isArray(response.errors) === false;
};
```

### Authentication and Authorization
```typescript
// JWT token management
class AuthManager {
  private token: string | null = null;
  
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
  
  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }
  
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
  
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }
  
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
```

### Content Security Policy
```typescript
// CSP implementation
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'wss:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-ancestors': ["'none'"]
};

// Generate CSP header
const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};
```

### XSS Prevention
```typescript
// Prevent XSS in dynamic content
const SafeComponent: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content);
  }, [content]);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
};

// Use React components instead of HTML strings
const SafeList: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};
```

## TypeScript Interfaces

### Core Type Definitions
```typescript
// Agent types
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
  createdAt: number;
  updatedAt: number;
}

// Cognitive state types
interface CognitiveState {
  purpose: PurposeState;
  personality: PersonalityState;
  memory: MemoryState;
  goals: GoalState;
  social: SocialState;
  skills: SkillsState;
  processing: ProcessingState;
}

// Performance types
interface PerformanceMetrics {
  responseTime: number;
  taskCompletionRate: number;
  learningRate: number;
  socialInteractionQuality: number;
  resourceUtilization: ResourceUtilization;
  errorRate: number;
  uptime: number;
}
```

### API Response Types
```typescript
// Standard API response
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

// Error types
interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
}

interface ResponseMeta {
  pagination?: PaginationMeta;
  rateLimit?: RateLimitMeta;
  version: string;
  timestamp: string;
}
```

### Event Types
```typescript
// Socket.IO event types
interface SocketEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
  id: string;
}

// Agent lifecycle events
interface AgentConnectedEvent extends SocketEvent<Agent> {
  type: 'agent:connected';
}

interface AgentDisconnectedEvent extends SocketEvent {
  type: 'agent:disconnected';
  data: {
    agentId: string;
    reason: string;
  };
}

interface AgentStateUpdateEvent extends SocketEvent {
  type: 'agent:state:update';
  data: {
    agentId: string;
    state: Partial<AgentState>;
    changes: StateChange[];
  };
}
```

## Integration Patterns

### Service Integration
```typescript
// Service factory pattern
class ServiceFactory {
  static createSocketService(config: SocketServiceConfig): SocketService {
    return new SocketService(config);
  }
  
  static createApiService(config: ApiServiceConfig): ApiService {
    return new ApiService(config);
  }
  
  static createStorageService(type: 'local' | 'session'): StorageService {
    switch (type) {
      case 'local':
        return new LocalStorageService();
      case 'session':
        return new SessionStorageService();
      default:
        throw new Error(`Unknown storage type: ${type}`);
    }
  }
}

// Service registry
class ServiceRegistry {
  private services: Map<string, any> = new Map();
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T | null {
    return this.services.get(name) || null;
  }
  
  create<T>(name: string, factory: () => T): T {
    const service = this.get<T>(name);
    if (service) return service;
    
    const newService = factory();
    this.register(name, newService);
    return newService;
  }
}
```

### Plugin Architecture
```typescript
// Plugin interface
interface Plugin {
  name: string;
  version: string;
  dependencies: string[];
  initialize: (context: PluginContext) => Promise<void>;
  destroy: () => Promise<void>;
}

// Plugin manager
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  
  async loadPlugin(plugin: Plugin): Promise<void> {
    // Check dependencies
    await this.checkDependencies(plugin);
    
    // Initialize plugin
    await plugin.initialize(this.createContext(plugin));
    
    // Register plugin
    this.plugins.set(plugin.name, plugin);
  }
  
  unloadPlugin(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.destroy();
      this.plugins.delete(name);
    }
  }
  
  private createContext(plugin: Plugin): PluginContext {
    return {
      api: this.createApi(),
      events: this.createEventEmitter(),
      storage: this.createStorage(plugin.name),
      config: this.getConfig(plugin.name)
    };
  }
}
```

### Data Synchronization
```typescript
// Sync manager for data consistency
class SyncManager {
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  
  async sync(operation: SyncOperation): Promise<void> {
    this.syncQueue.push(operation);
    
    if (!this.isSyncing) {
      await this.processSyncQueue();
    }
  }
  
  private async processSyncQueue(): Promise<void> {
    this.isSyncing = true;
    
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift()!;
      
      try {
        await this.executeOperation(operation);
      } catch (error) {
        console.error('Sync operation failed:', error);
        // Retry logic
        if (operation.retryCount < 3) {
          operation.retryCount++;
          this.syncQueue.unshift(operation);
        }
      }
    }
    
    this.isSyncing = false;
  }
  
  private async executeOperation(operation: SyncOperation): Promise<void> {
    // Execute operation based on type
    switch (operation.type) {
      case 'create':
        return this.apiClient.create(operation.data);
      case 'update':
        return this.apiClient.update(operation.id, operation.data);
      case 'delete':
        return this.apiClient.delete(operation.id);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
}
```

---

This technical documentation provides comprehensive information for developers working with the Mindcraft Cognitive Dashboard frontend system.
# Mindcraft Cognitive Dashboard - Developer Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [Component API](#component-api)
5. [State Management](#state-management)
6. [Testing](#testing)
7. [Code Style](#code-style)
8. [Contribution Guidelines](#contribution-guidelines)
9. [Debugging](#debugging)
10. [Performance Optimization](#performance-optimization)

## Overview

The Mindcraft Cognitive Dashboard is a modern React 19 + TypeScript application designed to visualize and manage LangGraph agents with advanced cognitive capabilities. The system provides real-time monitoring, data visualization, and interactive management of agent states, personality traits, memory systems, goals, social relationships, and skill progression.

### Key Features
- **Real-time Agent Monitoring**: Live agent status and cognitive state updates
- **Advanced Data Visualization**: D3.js and Recharts-based visualizations
- **Interactive Dashboard**: Drag-and-drop goal management, skill progression tracking
- **Performance Monitoring**: Real-time performance metrics and anomaly detection
- **Responsive Design**: Mobile-friendly Material-UI interface
- **Type Safety**: Comprehensive TypeScript integration

## Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Architecture                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   React App    │  │   Redux Store   │  │  Socket.IO      │ │
│  │                 │  │                 │  │   Client        │ │
│  │ • Components   │  │ • State Mgmt   │  │ • Real-time    │ │
│  │ • Hooks        │  │ • Middleware   │  │ • Events       │ │
│  │ • Routing      │  │ • Persistence  │  │ • Reconnection  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   D3.js        │  │   Recharts      │  │   Material-UI  │ │
│  │   Visualizers   │  │   Charts        │  │   Components    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Network      │  │ • Trends       │  │ • Layout       │ │
│  │ • Graphs       │  │ • Metrics      │  │ • Forms        │ │
│  │ • Heatmaps     │  │ • Analytics    │  │ • Navigation   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure
```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── Button.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Loading.tsx
│   │   └── index.ts
│   ├── layout/           # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MainLayout.tsx
│   │   └── index.ts
│   ├── tabs/             # Tab system components
│   │   ├── OverviewTab.tsx
│   │   ├── PersonalityTab.tsx
│   │   ├── MemoryTab.tsx
│   │   ├── GoalsTab.tsx
│   │   ├── SocialTab.tsx
│   │   ├── SkillsTab.tsx
│   │   └── PerformanceTab.tsx
│   ├── visualizers/      # Data visualization
│   │   ├── PersonalityRadar.tsx
│   │   ├── MemoryHeatmap.tsx
│   │   ├── GoalHierarchy.tsx
│   │   ├── SocialNetwork.tsx
│   │   └── SkillProgression.tsx
│   ├── performance/      # Performance monitoring
│   │   ├── AnomalyDetection.tsx
│   │   ├── ResourceUtilization.tsx
│   │   ├── SystemHealth.tsx
│   │   ├── PredictiveAnalytics.tsx
│   │   └── PerformanceReports.tsx
│   └── charts/           # Chart components
│       ├── LineChart.tsx
│       ├── BarChart.tsx
│       ├── PieChart.tsx
│       └── CustomChart.tsx
├── store/                 # Redux store
│   ├── slices/           # Redux slices
│   │   ├── agentsSlice.ts
│   │   ├── uiSlice.ts
│   │   ├── connectionSlice.ts
│   │   ├── personalitySlice.ts
│   │   ├── memorySlice.ts
│   │   ├── goalsSlice.ts
│   │   ├── socialSlice.ts
│   │   └── skillsSlice.ts
│   ├── index.ts          # Store configuration
│   └── types.ts          # Type definitions
├── services/              # External services
│   ├── socketService.ts    # Socket.IO client
│   ├── streamingService.ts  # Streaming data service
│   └── apiService.ts      # REST API client
├── types/                 # TypeScript types
│   ├── agent.ts
│   ├── goals.ts
│   ├── memory.ts
│   ├── social.ts
│   └── skills.ts
├── utils/                 # Utility functions
│   ├── performance.ts
│   ├── validation.ts
│   ├── formatting.ts
│   └── helpers.ts
├── hooks/                 # Custom React hooks
│   ├── useSocket.ts
│   ├── useAgentData.ts
│   ├── usePerformanceMonitor.ts
│   └── useDebounce.ts
└── styles/                # Styles and themes
    ├── theme.ts
    ├── globals.css
    └── components.css
```

## Development Setup

### Prerequisites
- Node.js 18+ with npm
- Git for version control
- VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/your-org/mindcraft-frontend.git
cd mindcraft-frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.development

# Edit environment variables
nano .env.development
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Verify Setup**
- Open http://localhost:5173
- Check browser console for connection status
- Verify hot module replacement is working

### Environment Variables
```bash
# Development (.env.development)
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_TITLE=Mindcraft Dashboard (Dev)
VITE_ENABLE_DEBUG=true

# Production (.env.production)
VITE_API_URL=https://api.mindcraft.example.com
VITE_SOCKET_URL=https://socket.mindcraft.example.com
VITE_APP_TITLE=Mindcraft Dashboard
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

## Component API

### Common Components

#### Button Component
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Usage
<Button 
  variant="primary" 
  size="medium" 
  onClick={handleClick}
  loading={isLoading}
>
  Submit
</Button>
```

#### ErrorBoundary Component
```typescript
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{error: Error}>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: React.ReactNode;
}

// Usage
<ErrorBoundary 
  fallback={ErrorFallback}
  onError={logError}
>
  <YourComponent />
</ErrorBoundary>
```

#### Loading Component
```typescript
interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
}

// Usage
<Loading 
  size="medium" 
  message="Loading agent data..." 
  overlay={true}
/>
```

### Tab Components

#### OverviewTab
```typescript
interface OverviewTabProps {
  agentId: string;
  onAgentSelect?: (agentId: string) => void;
}

// Features
- Real-time agent status
- Performance metrics
- Quick actions
- System health indicators
```

#### PersonalityTab
```typescript
interface PersonalityTabProps {
  agentId: string;
  editable?: boolean;
}

// Features
- Big Five traits visualization
- Gaming-specific traits
- Personality radar chart
- Trait history tracking
```

#### MemoryTab
```typescript
interface MemoryTabProps {
  agentId: string;
  viewMode?: 'semantic' | 'episodic' | 'procedural' | 'working';
}

// Features
- Memory system visualization
- Memory search and filtering
- Memory consolidation tracking
- Memory performance metrics
```

### Visualization Components

#### PersonalityRadar
```typescript
interface PersonalityRadarProps {
  data: PersonalityData;
  width?: number;
  height?: number;
  interactive?: boolean;
  onTraitClick?: (trait: string) => void;
}

interface PersonalityData {
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

#### GoalHierarchy
```typescript
interface GoalHierarchyProps {
  goals: Goal[];
  selectedGoalId?: string;
  onGoalSelect?: (goalId: string) => void;
  onGoalUpdate?: (goalId: string, updates: Partial<Goal>) => void;
  onGoalReorder?: (goalOrder: GoalOrder[]) => void;
  draggable?: boolean;
}

interface Goal {
  id: string;
  type: 'strategic' | 'tactical' | 'operational';
  title: string;
  description: string;
  priority: number;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'failed';
  dependencies: string[];
  createdAt: number;
  updatedAt: number;
}
```

## State Management

### Redux Store Structure
```typescript
interface RootState {
  agents: AgentsState;
  ui: UIState;
  connection: ConnectionState;
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
}

// Actions
const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action) => {
      state.agents = action.payload;
      state.lastUpdated = Date.now();
    },
    updateAgent: (state, action) => {
      const { agentId, updates } = action.payload;
      if (state.agents[agentId]) {
        state.agents[agentId] = { ...state.agents[agentId], ...updates };
      }
    },
    selectAgent: (state, action) => {
      state.selectedAgentId = action.payload;
    },
    // ... other actions
  }
});
```

### Connection Slice
```typescript
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  metrics: ConnectionMetrics;
}

interface ConnectionMetrics {
  connectedAt: number | null;
  lastDisconnected: number | null;
  totalReconnectAttempts: number;
  connectionUptime: number;
  averageLatency: number;
}
```

### Custom Hooks

#### useSocket Hook
```typescript
function useSocket(config: SocketServiceConfig): {
  socket: SocketService | null;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
} {
  // Implementation handles socket lifecycle
  // Provides reactive socket state
}
```

#### useAgentData Hook
```typescript
function useAgentData(agentId: string): {
  agent: Agent | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  // Implementation handles agent data fetching
  // Provides reactive agent state
}
```

#### usePerformanceMonitor Hook
```typescript
function usePerformanceMonitor(componentName: string): {
  metrics: PerformanceMetrics;
  startRender: () => void;
  endRender: () => void;
  recordInteraction: (action: string) => void;
} {
  // Implementation tracks component performance
  // Provides performance analytics
}
```

## Testing

### Unit Testing
```typescript
// Example: Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// Example: AgentList.integration.test.tsx
import { renderWithProviders } from '../test/utils';
import { AgentList } from './AgentList';

describe('AgentList Integration', () => {
  test('loads and displays agents', async () => {
    const mockAgents = [
      { id: 'agent1', name: 'Agent 1', status: 'active' },
      { id: 'agent2', name: 'Agent 2', status: 'idle' }
    ];

    renderWithProviders(<AgentList />, {
      initialState: { agents: { agents: mockAgents } }
    });

    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Agent 2')).toBeInTheDocument();
    });
  });
});
```

### Performance Testing
```typescript
// Example: Performance.test.tsx
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from './usePerformanceMonitor';

describe('Performance Monitoring', () => {
  test('tracks render performance', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.startRender();
      // Simulate render work
      result.current.endRender();
    });

    expect(result.current.metrics.renderTime).toBeGreaterThan(0);
  });
});
```

### Test Commands
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

## Code Style

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```

### ESLint Rules
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Code Formatting
```typescript
// Function declarations
export function functionName(
  param1: string,
  param2: number,
  param3: boolean
): ReturnType {
  // Implementation
}

// React components
interface ComponentProps {
  prop1: string;
  prop2?: number;
  prop3: boolean;
}

export const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2 = 0,
  prop3
}) => {
  // Implementation
};

// Event handlers
const handleButtonClick = useCallback((event: React.MouseEvent) => {
  event.preventDefault();
  // Handler logic
}, [dependency]);

// Async operations
const fetchData = useCallback(async (): Promise<Data> => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}, []);
```

## Contribution Guidelines

### Development Workflow
1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Follow existing code patterns
- Add TypeScript types for new components
- Write tests for new functionality
- Update documentation

3. **Run Tests**
```bash
npm run validate
```

4. **Commit Changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

5. **Push and Create PR**
```bash
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

### Commit Message Convention
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation update
- style: Code style changes
- refactor: Code refactoring
- test: Test additions/changes
- chore: Build process or auxiliary tool changes

Examples:
feat(components): add personality radar chart
fix(connection): handle socket reconnection errors
docs(api): update socket service documentation
```

### Pull Request Requirements
- All tests must pass
- Code coverage must be >80%
- No TypeScript errors
- ESLint must pass with no warnings
- Documentation updated for new features
- Performance impact assessed

## Debugging

### Development Tools
- **React DevTools**: Component inspection and state debugging
- **Redux DevTools**: State history and action inspection
- **Network Tab**: Socket.IO and API request monitoring
- **Console**: Application logging and error tracking

### Debugging Techniques

#### Component Debugging
```typescript
// Debug component props
const Component = ({ prop1, prop2 }) => {
  console.log('Component props:', { prop1, prop2 });
  // Component logic
};

// Debug state changes
const [state, setState] = useState(initialState);
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

#### Redux Debugging
```typescript
// Debug actions
const dispatch = useAppDispatch();
dispatch(actionCreator(payload)); // Check Redux DevTools

// Debug selectors
const data = useAppSelector(selectData);
console.log('Selected data:', data);
```

#### Socket.IO Debugging
```typescript
// Debug connection
socketService.on('connect', () => {
  console.log('Socket connected');
});

socketService.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

// Debug events
socketService.on('agent_update', (data) => {
  console.log('Agent update received:', data);
});
```

### Common Issues and Solutions

#### Memory Leaks
```typescript
// Problem: Event listeners not cleaned up
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Missing cleanup
}, []);

// Solution: Cleanup event listeners
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### Infinite Re-renders
```typescript
// Problem: Object/array recreation in dependencies
useEffect(() => {
  // Effect logic
}, [objectDependency]); // Object recreated on every render

// Solution: Use stable references
useEffect(() => {
  // Effect logic
}, [objectDependency.id]); // Use primitive values
```

#### Socket Connection Issues
```typescript
// Problem: Multiple socket instances
const socket = io(url); // Created on every render

// Solution: Use singleton pattern
const socket = useMemo(() => io(url), [url]);
```

## Performance Optimization

### Component Optimization
```typescript
// Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive computation
  return <div>{result}</div>;
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data.id, data.value]); // Only recompute when dependencies change

// Memoize event handlers
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Bundle Optimization
```typescript
// Lazy loading components
const LazyComponent = lazy(() => import('./LazyComponent'));

// Code splitting
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./Dashboard'))
  },
  {
    path: '/agents',
    component: lazy(() => import('./Agents'))
  }
];
```

### Memory Management
```typescript
// Cleanup resources
useEffect(() => {
  const interval = setInterval(() => {
    // Periodic work
  }, 1000);

  return () => {
    clearInterval(interval); // Cleanup
  };
}, []);

// Cleanup subscriptions
useEffect(() => {
  const subscription = dataService.subscribe(handleData);
  
  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);
```

### Performance Monitoring
```typescript
// Track component performance
const useComponentPerformance = (componentName: string) => {
  const startTime = useRef<number>();
  
  const startRender = useCallback(() => {
    startTime.current = performance.now();
  }, []);
  
  const endRender = useCallback(() => {
    const renderTime = performance.now() - (startTime.current || 0);
    if (renderTime > 16) { // > 60fps threshold
      console.warn(`Slow render in ${componentName}: ${renderTime}ms`);
    }
  }, []);
  
  return { startRender, endRender };
};
```

## Additional Resources

### Documentation
- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Material-UI Documentation](https://mui.com/)
- [D3.js Documentation](https://d3js.org/)
- [Socket.IO Documentation](https://socket.io/docs/)

### Tools
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/)
- [TypeScript Playground](https://www.typescriptlang.org/play/)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

### Community
- [React Community](https://react.dev/community)
- [TypeScript Community](https://github.com/microsoft/TypeScript)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react+typescript)

---

For questions or support, please refer to the main project documentation or create an issue in the repository.
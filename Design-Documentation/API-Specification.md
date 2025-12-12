# Mindcraft LangGraph Rewrite - API Documentation

## Overview

The Mindcraft Cognitive Dashboard provides both REST API and real-time Socket.IO connections for integrating with the LangGraph agent system. This documentation covers all available endpoints, events, and integration patterns.

### Base URLs
- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging-api.mindcraft.example.com/api`
- **Production**: `https://api.mindcraft.example.com/api`

### Authentication
All API requests require authentication via JWT token:
```http
Authorization: Bearer <jwt_token>
```

### Response Format
All API responses follow this standard format:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z",
    "requestId": "req_123456789",
    "version": "1.0.0"
  }
}
```

## REST API

### Agent Management

#### Get All Agents
```http
GET /api/agents

Query Parameters:
- page: number (default: 1)
- pageSize: number (default: 20, max: 100)
- status: string (filter: active, idle, offline)
- type: string (filter by agent type)
- search: string (search by name or ID)

Response:
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "agent_001",
        "name": "Agent Alpha",
        "type": "cognitive",
        "status": "active",
        "health": {
          "hp": 100,
          "food": 80,
          "experience": 1500
        },
        "position": {
          "x": 100,
          "y": 64,
          "z": 200,
          "dimension": "overworld"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Specific Agent
```http
GET /api/agents/{agentId}

Path Parameters:
- agentId: string (required) - Unique agent identifier

Response:
{
  "success": true,
  "data": {
    "agent": {
      "id": "agent_001",
      "name": "Agent Alpha",
      "type": "cognitive",
      "status": "active",
      "health": { ... },
      "position": { ... },
      "cognitive": {
        "purpose": { ... },
        "personality": { ... },
        "memory": { ... },
        "goals": { ... },
        "social": { ... },
        "skills": { ... }
      },
      "performance": {
        "responseTime": 150,
        "taskCompletionRate": 0.85,
        "learningRate": 0.12,
        "socialInteractionQuality": 0.78
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z"
    }
  }
}
```

#### Create Agent
```http
POST /api/agents

Request Body:
{
  "name": "Agent Beta",
  "type": "cognitive",
  "configuration": {
    "purpose": {
      "identity": {
        "name": "Agent Beta",
        "role": "explorer",
        "background": "Created for exploration tasks"
      },
      "personality": {
        "traits": {
          "openness": 0.8,
          "conscientiousness": 0.7,
          "extraversion": 0.6,
          "agreeableness": 0.8,
          "neuroticism": 0.3,
          "riskTolerance": 0.7,
          "creativity": 0.9,
          "patience": 0.6,
          "competitiveness": 0.4,
          "curiosity": 0.9
        }
      },
      "goals": {
        "strategic": [
          {
            "title": "Explore New Regions",
            "description": "Discover and map unexplored areas",
            "priority": 8,
            "type": "strategic"
          }
        ]
      }
    },
    "initialLocation": {
      "x": 0,
      "y": 64,
      "z": 0,
      "dimension": "overworld"
    }
  }
}

Response:
{
  "success": true,
  "data": {
    "agent": {
      "id": "agent_002",
      "name": "Agent Beta",
      "type": "cognitive",
      "status": "initializing",
      "createdAt": "2025-01-01T12:30:00.000Z"
    }
  }
}
```

#### Update Agent
```http
PUT /api/agents/{agentId}

Path Parameters:
- agentId: string (required) - Agent to update

Request Body:
{
  "name": "Agent Alpha Updated",
  "configuration": {
    "purpose": {
      "personality": {
        "traits": {
          "openness": 0.85
        }
      }
    }
  }
}
```

#### Delete Agent
```http
DELETE /api/agents/{agentId}

Path Parameters:
- agentId: string (required) - Agent to delete

Response:
{
  "success": true,
  "data": {
    "message": "Agent agent_001 successfully deleted"
  }
}
```

### Goal Management

#### Get Agent Goals
```http
GET /api/agents/{agentId}/goals

Path Parameters:
- agentId: string (required) - Agent identifier

Query Parameters:
- type: string (filter: strategic, tactical, operational)
- status: string (filter: active, completed, paused, failed)
- priority: number (filter by minimum priority)

Response:
{
  "success": true,
  "data": {
    "goals": {
      "strategic": [
        {
          "id": "goal_strat_001",
          "title": "Explore New Regions",
          "description": "Discover and map unexplored areas",
          "priority": 8,
          "status": "active",
          "progress": 0.35,
          "createdAt": "2025-01-01T00:00:00.000Z",
          "dependencies": [],
          "subgoals": ["goal_tact_001", "goal_tact_002"]
        }
      ],
      "tactical": [
        {
          "id": "goal_tact_001",
          "title": "Gather Resources",
          "description": "Collect necessary resources for exploration",
          "priority": 7,
          "status": "active",
          "progress": 0.60,
          "parentId": "goal_strat_001",
          "dependencies": []
        }
      ],
      "operational": [
        {
          "id": "goal_op_001",
          "title": "Move to Forest",
          "description": "Navigate to forest biome",
          "priority": 6,
          "status": "active",
          "progress": 0.80,
          "parentId": "goal_tact_001",
          "dependencies": []
        }
      ]
    },
    "hierarchy": {
      "strategic": [
        {
          "id": "goal_strat_001",
          "subgoals": ["goal_tact_001", "goal_tact_002"],
          "progress": 0.35
        }
      ]
    }
  }
}
```

#### Create Goal
```http
POST /api/agents/{agentId}/goals

Path Parameters:
- agentId: string (required) - Agent identifier

Request Body:
{
  "type": "strategic",
  "title": "Build Shelter",
  "description": "Construct a safe shelter for survival",
  "priority": 9,
  "dependencies": [],
  "deadline": "2025-01-07T00:00:00.000Z"
}

Response:
{
  "success": true,
  "data": {
    "goal": {
      "id": "goal_strat_002",
      "title": "Build Shelter",
      "description": "Construct a safe shelter for survival",
      "priority": 9,
      "status": "pending",
      "progress": 0.0,
      "createdAt": "2025-01-01T14:00:00.000Z",
      "dependencies": []
    }
  }
}
```

#### Update Goal
```http
PUT /api/agents/{agentId}/goals/{goalId}

Path Parameters:
- agentId: string (required) - Agent identifier
- goalId: string (required) - Goal identifier

Request Body:
{
  "status": "completed",
  "progress": 1.0,
  "completedAt": "2025-01-01T16:00:00.000Z"
}

Response:
{
  "success": true,
  "data": {
    "goal": { ... updated goal ... },
    "updated": ["status", "progress", "completedAt"]
  }
}
```

#### Delete Goal
```http
DELETE /api/agents/{agentId}/goals/{goalId}

Path Parameters:
- agentId: string (required) - Agent identifier
- goalId: string (required) - Goal identifier

Response:
{
  "success": true,
  "data": {
    "message": "Goal goal_strat_001 successfully deleted"
  }
}
```

### System Management

#### Get System Status
```http
GET /api/system/status

Response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "version": "1.0.0",
    "environment": "production",
    "agents": {
      "total": 45,
      "active": 32,
      "idle": 8,
      "offline": 5
    },
    "resources": {
      "cpu": {
        "usage": 45.2,
        "limit": 100.0,
        "cores": 8
      },
      "memory": {
        "usage": 6.2,
        "limit": 16.0,
        "available": 9.8
      },
      "disk": {
        "usage": 125.6,
        "limit": 500.0,
        "available": 374.4
      },
      "network": {
        "bandwidth": {
          "in": 1024.5,
          "out": 856.3
        },
        "latency": 25.6
      }
    },
    "performance": {
      "averageResponseTime": 156.7,
      "errorRate": 0.02,
      "throughput": 1250.5
    }
  }
}
```

#### Get System Configuration
```http
GET /api/system/config

Response:
{
  "success": true,
  "data": {
    "config": {
      "maxAgents": 100,
      "defaultPersonality": { ... },
      "featureFlags": {
        "advancedGoals": true,
        "socialFeatures": true,
        "performanceMonitoring": true
      },
      "security": {
        "sessionTimeout": 3600,
        "maxLoginAttempts": 5,
        "passwordPolicy": { ... }
      }
    }
  }
}
```

#### Update System Configuration
```http
PUT /api/system/config

Request Body:
{
  "maxAgents": 150,
  "featureFlags": {
    "advancedGoals": true,
    "socialFeatures": true,
    "performanceMonitoring": true
  }
}

Response:
{
  "success": true,
  "data": {
    "config": { ... updated config ... },
    "updated": ["maxAgents", "featureFlags"]
  }
}
```

## Socket.IO Events

### Connection Events

#### Connect Event
```typescript
// Client connects to server
socket.on('connect', () => {
  console.log('Connected to server');
});

// Server emits connection confirmation
socket.emit('authenticate', {
  token: 'jwt_token_here'
});
```

#### Authentication Event
```typescript
// Authentication success
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
});

// Authentication failure
socket.on('authentication_error', (error) => {
  console.error('Authentication failed:', error);
});
```

#### Disconnect Event
```typescript
// Client disconnects
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

### Agent Lifecycle Events

#### Agent Connected
```typescript
socket.on('agent:connected', (data) => {
  console.log('Agent connected:', data);
});
```

#### Agent Disconnected
```typescript
socket.on('agent:disconnected', (data) => {
  console.log('Agent disconnected:', data);
});
```

#### Agent State Update
```typescript
socket.on('agent:state:update', (data) => {
  console.log('Agent state updated:', data);
});
```

### Cognitive Component Events

#### Personality Trait Update
```typescript
socket.on('personality:trait:update', (data) => {
  console.log('Personality trait updated:', data);
});
```

#### Memory System Update
```typescript
// Semantic memory update
socket.on('memory:semantic:update', (data) => {
  console.log('Semantic memory updated:', data);
});

// Episodic memory update
socket.on('memory:episodic:update', (data) => {
  console.log('Episodic memory updated:', data);
});
```

#### Goal System Update
```typescript
// Goal hierarchy update
socket.on('goal:hierarchy:update', (data) => {
  console.log('Goal hierarchy updated:', data);
});

// Goal progress update
socket.on('goal:progress:update', (data) => {
  console.log('Goal progress updated:', data);
});
```

#### Social System Update
```typescript
// Relationship update
socket.on('social:relationship:update', (data) => {
  console.log('Social relationship updated:', data);
});

// Social interaction event
socket.on('social:interaction:event', (data) => {
  console.log('Social interaction event:', data);
});
```

#### Skill System Update
```typescript
// Skill progress update
socket.on('skill:progress:update', (data) => {
  console.log('Skill progress updated:', data);
});
```

### Performance Events

#### Performance Metrics Update
```typescript
socket.on('performance:metrics:update', (data) => {
  console.log('Performance metrics updated:', data);
});
```

#### Performance Alert
```typescript
socket.on('performance:alert:event', (data) => {
  console.log('Performance alert:', data);
});
```

## Data Models

### Agent Models
```typescript
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

enum AgentType {
  COGNITIVE = 'cognitive',
  LEGACY = 'legacy',
  HYBRID = 'hybrid'
}

enum AgentStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ERROR = 'error'
}

interface AgentHealth {
  hp: number;
  food: number;
  experience: number;
  armor: number;
  weapon: Weapon | null;
}

interface Position {
  x: number;
  y: number;
  z: number;
  dimension: string;
}
```

### Cognitive State Models
```typescript
interface CognitiveState {
  purpose: PurposeState;
  personality: PersonalityState;
  memory: MemoryState;
  goals: GoalState;
  social: SocialState;
  skills: SkillsState;
  processing: ProcessingState;
}

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

### Goal Models
```typescript
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

interface GoalHierarchy {
  strategic: Goal[];
  tactical: Goal[];
  operational: Goal[];
}
```

### Memory Models
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

### Social Models
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

interface SocialInteraction {
  id: string;
  type: InteractionType;
  participants: string[];
  description: string;
  outcome: 'success' | 'failure' | 'partial';
  duration: number;
  emotionalImpact: number;
  timestamp: string;
  context: InteractionContext;
}
```

### Skill Models
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

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  success: false,
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
    field?: string;
  }
}
```

### Error Codes
```typescript
enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  TIMEOUT = 'TIMEOUT'
}
```

## Authentication

### JWT Token Management
```typescript
interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  scope: string[];
  role: string;
}

class AuthManager {
  private token: string | null = null;
  private refreshToken: string | null = null;
  
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.setTokens(result.data.token, result.data.refreshToken);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private setTokens(token: string, refreshToken: string): void {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }
  
  private clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }
}
```

### Permission System
```typescript
enum Permission {
  READ_AGENTS = 'read:agents',
  WRITE_AGENTS = 'write:agents',
  DELETE_AGENTS = 'delete:agents',
  READ_GOALS = 'read:goals',
  WRITE_GOALS = 'write:goals',
  DELETE_GOALS = 'delete:goals',
  READ_SYSTEM = 'read:system',
  WRITE_SYSTEM = 'write:system',
  ADMIN_ACCESS = 'admin:access'
}

class PermissionManager {
  static hasPermission(userScopes: string[], requiredPermission: Permission): boolean {
    return userScopes.includes(requiredPermission);
  }
  
  static hasAnyPermission(userScopes: string[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(permission => userScopes.includes(permission));
  }
  
  static hasAllPermissions(userScopes: string[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => userScopes.includes(permission));
  }
}
```

## Rate Limiting

### Client-side Rate Limiting
```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limits: Map<string, RateLimit> = new Map();
  
  constructor() {
    this.limits.set('api', { maxRequests: 1000, windowMs: 3600000 });
    this.limits.set('socket', { maxRequests: 100, windowMs: 60000 });
  }
  
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const limit = this.limits.get(key);
    if (!limit) return true;
    
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < limit.windowMs);
    
    if (validRequests.length >= limit.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}
```

## SDK and Libraries

### JavaScript/TypeScript SDK
```typescript
// Installation
npm install @mindcraft/dashboard-sdk

// Usage
import { MindcraftDashboardAPI } from '@mindcraft/dashboard-sdk';

const api = new MindcraftDashboardAPI({
  baseURL: 'https://api.mindcraft.example.com',
  token: 'your-jwt-token'
});

// Agent management
const agents = await api.agents.getAll();
const agent = await api.agents.get('agent_001');
const newAgent = await api.agents.create({
  name: 'New Agent',
  type: 'cognitive'
});

// Goal management
const goals = await api.goals.getAll('agent_001');
const newGoal = await api.goals.create('agent_001', {
  title: 'Explore Area',
  type: 'strategic'
});

// Real-time events
api.socket.on('agent:state:update', (data) => {
  console.log('Agent state updated:', data);
});

await api.socket.connect();
```

### React Components
```typescript
// Installation
npm install @mindcraft/dashboard-react-components

// Usage
import { 
  AgentCard,
  PersonalityRadar,
  GoalHierarchy,
  PerformanceChart 
} from '@mindcraft/dashboard-react-components';

function Dashboard() {
  const [agent, setAgent] = useState(null);
  
  return (
    <div>
      <AgentCard 
        agent={agent}
        onUpdate={setAgent}
      />
      <PersonalityRadar 
        personality={agent?.cognitive?.personality}
      />
      <GoalHierarchy 
        goals={agent?.cognitive?.goals}
      />
      <PerformanceChart 
        metrics={agent?.performance}
      />
    </div>
  );
}
```

---

This consolidated API documentation provides comprehensive information for integrating with Mindcraft Cognitive Dashboard system, including REST endpoints, Socket.IO events, data models, authentication, error handling, and SDK usage.
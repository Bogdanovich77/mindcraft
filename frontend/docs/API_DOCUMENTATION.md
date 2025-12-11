# Mindcraft Cognitive Dashboard - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [REST API](#rest-api)
3. [Socket.IO Events](#socketio-events)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)
7. [Rate Limiting](#rate-limiting)
8. [Webhooks](#webhooks)
9. [SDK and Libraries](#sdk-and-libraries)
10. [Examples](#examples)

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
          // Updated traits
        }
      }
    }
  }
}

Response:
{
  "success": true,
  "data": {
    "agent": { ... updated agent ... },
    "updated": ["name", "personality.traits.openness"]
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
  // data: {
  //   success: true,
  //   user: { id, name, role },
  //   permissions: ['read', 'write']
  // }
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
  // reason: 'io server disconnect' | 'ping timeout' | 'transport close'
});
```

### Agent Lifecycle Events

#### Agent Connected
```typescript
socket.on('agent:connected', (data) => {
  console.log('Agent connected:', data);
  // data: {
  //   agentId: 'agent_001',
  //   agent: { ... agent data ... },
  //   timestamp: 1640995200000
  // }
});
```

#### Agent Disconnected
```typescript
socket.on('agent:disconnected', (data) => {
  console.log('Agent disconnected:', data);
  // data: {
  //   agentId: 'agent_001',
  //   reason: 'connection_lost',
  //   timestamp: 1640995200000
  // }
});
```

#### Agent State Update
```typescript
socket.on('agent:state:update', (data) => {
  console.log('Agent state updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   state: {
  //     health: { hp: 95, food: 75, experience: 1520 },
  //     position: { x: 105, y: 64, z: 205 },
  //     status: 'active',
  //     currentGoal: 'goal_tact_001'
  //   },
  //   changes: [
  //     { field: 'health.hp', oldValue: 100, newValue: 95 },
  //     { field: 'position.x', oldValue: 100, newValue: 105 }
  //   ],
  //   timestamp: 1640995200000
  // }
});
```

### Cognitive Component Events

#### Personality Trait Update
```typescript
socket.on('personality:trait:update', (data) => {
  console.log('Personality trait updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   trait: 'openness',
  //   oldValue: 0.8,
  //   newValue: 0.85,
  //   reason: 'experience_based_learning',
  //   timestamp: 1640995200000
  // }
});
```

#### Memory System Update
```typescript
// Semantic memory update
socket.on('memory:semantic:update', (data) => {
  console.log('Semantic memory updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   operation: 'add' | 'update' | 'delete',
  //   memories: [
  //     {
  //       id: 'mem_001',
  //       type: 'concept',
  //       content: 'Forest biome contains oak trees',
  //       confidence: 0.9,
  //       timestamp: 1640995200000
  //     }
  //   ],
  //   timestamp: 1640995200000
  // }
});

// Episodic memory update
socket.on('memory:episodic:update', (data) => {
  console.log('Episodic memory updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   event: {
  //     id: 'event_001',
  //     type: 'exploration',
  //     description: 'Discovered new forest area',
  //     location: { x: 100, y: 64, z: 200 },
  //     participants: ['agent_001'],
  //     outcome: 'success',
  //     timestamp: 1640995200000
  //   },
  //   timestamp: 1640995200000
  // }
});
```

#### Goal System Update
```typescript
// Goal hierarchy update
socket.on('goal:hierarchy:update', (data) => {
  console.log('Goal hierarchy updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   hierarchy: {
  //     strategic: [...],
  //     tactical: [...],
  //     operational: [...]
  //   },
  //   changes: [
  //     {
  //       type: 'goal_created',
  //       goalId: 'goal_strat_002',
  //       parentId: null
  //     }
  //   ],
  //   timestamp: 1640995200000
  // }
});

// Goal progress update
socket.on('goal:progress:update', (data) => {
  console.log('Goal progress updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   goalId: 'goal_tact_001',
  //   oldProgress: 0.60,
  //   newProgress: 0.75,
  //   milestone: 'resources_collected',
  //   timestamp: 1640995200000
  // }
});
```

#### Social System Update
```typescript
// Relationship update
socket.on('social:relationship:update', (data) => {
  console.log('Social relationship updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   relationship: {
  //     targetAgentId: 'agent_002',
  //     type: 'trust',
  //     value: 0.75,
  //     oldValue: 0.70,
  //     reason: 'successful_collaboration'
  //   },
  //   timestamp: 1640995200000
  // }
});

// Social interaction event
socket.on('social:interaction:event', (data) => {
  console.log('Social interaction event:', data);
  // data: {
  //   agentId: 'agent_001',
  //   interaction: {
  //     id: 'interaction_001',
  //     type: 'collaboration',
  //     participants: ['agent_001', 'agent_002'],
  //     description: 'Worked together on exploration goal',
  //     outcome: 'success',
  //     duration: 1800,
  //     timestamp: 1640995200000
  //   },
  //   timestamp: 1640995200000
  // }
});
```

#### Skill System Update
```typescript
// Skill progress update
socket.on('skill:progress:update', (data) => {
  console.log('Skill progress updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   skill: {
  //     type: 'mining',
  //     level: 5,
  //     experience: 1250,
  //     proficiency: {
  //       knowledge: 0.8,
  //       practical: 0.7,
  //       creative: 0.6
  //     }
  //   },
  //   experienceGained: 50,
  //   reason: 'successful_ore_extraction',
  //   timestamp: 1640995200000
  // }
});
```

### Performance Events

#### Performance Metrics Update
```typescript
socket.on('performance:metrics:update', (data) => {
  console.log('Performance metrics updated:', data);
  // data: {
  //   agentId: 'agent_001',
  //   metrics: {
  //     responseTime: 145.6,
  //     taskCompletionRate: 0.87,
  //     learningRate: 0.13,
  //     resourceUtilization: {
  //       cpu: 45.2,
  //       memory: 6.8,
  //       network: 12.3
  //     }
  //   },
  //   timestamp: 1640995200000
  // }
});
```

#### Performance Alert
```typescript
socket.on('performance:alert:event', (data) => {
  console.log('Performance alert:', data);
  // data: {
  //   agentId: 'agent_001',
  //   alert: {
  //     id: 'alert_001',
  //     type: 'high_response_time',
  //     severity: 'warning',
  //     message: 'Response time exceeded threshold (500ms)',
  //     value: 625.4,
  //     threshold: 500.0,
  //     timestamp: 1640995200000
  //   }
  // }
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
  hp: number; // Health points (0-100)
  food: number; // Food level (0-100)
  experience: number; // Experience points
  armor: number; // Armor durability
  weapon: Weapon | null; // Current weapon
}

interface Position {
  x: number;
  y: number;
  z: number;
  dimension: string; // World dimension
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
  // Big Five traits
  openness: number; // (0-1)
  conscientiousness: number; // (0-1)
  extraversion: number; // (0-1)
  agreeableness: number; // (0-1)
  neuroticism: number; // (0-1)
  
  // Gaming-specific traits
  riskTolerance: number; // (0-1)
  creativity: number; // (0-1)
  patience: number; // (0-1)
  competitiveness: number; // (0-1)
  curiosity: number; // (0-1)
}
```

### Goal Models
```typescript
interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  priority: number; // (1-10, higher = more important)
  status: GoalStatus;
  progress: number; // (0-1, 1 = completed)
  dependencies: string[]; // Required prerequisite goals
  parentId: string | null; // Parent goal ID
  createdAt: string;
  updatedAt: string;
  deadline?: string; // Optional completion deadline
  estimatedDuration?: number; // Estimated completion time in seconds
}

enum GoalType {
  STRATEGIC = 'strategic', // Long-term objectives
  TACTICAL = 'tactical', // Medium-term plans
  OPERATIONAL = 'operational' // Short-term tasks
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
  confidence: number; // (0-1)
  importance: number; // (0-1)
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
  emotionalImpact: number; // (-1 to 1)
  importance: number; // (0-1)
  timestamp: string;
  decayFactor: number; // Memory decay over time
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
  trust: number; // (0-1)
  friendship: number; // (0-1)
  reputation: number; // (-1 to 1)
  interactions: number; // Total interaction count
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
  duration: number; // Interaction duration in seconds
  emotionalImpact: number; // (-1 to 1)
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
  level: number; // Current skill level
  experience: number; // Total experience points
  proficiency: SkillProficiency;
  usage: SkillUsage;
  createdAt: string;
  lastUsed: string;
}

interface SkillProficiency {
  knowledge: number; // Theoretical understanding (0-1)
  practical: number; // Practical application (0-1)
  creative: number; // Creative application (0-1)
  overall: number; // Overall proficiency (0-1)
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
    field?: string; // For validation errors
  }
}
```

### Error Codes
```typescript
enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  TIMEOUT = 'TIMEOUT'
}
```

### Error Handling Best Practices
```typescript
// Client-side error handling
class ApiClient {
  async request(endpoint: string, options?: RequestOptions): Promise<any> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
          ...options?.headers
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error.error.code, error.error.message);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        this.handleApiError(error);
      } else {
        this.handleNetworkError(error);
      }
      throw error;
    }
  }
  
  private handleApiError(error: ApiError): void {
    switch (error.code) {
      case ErrorCode.TOKEN_EXPIRED:
        this.refreshToken();
        break;
      case ErrorCode.RATE_LIMITED:
        this.scheduleRetry();
        break;
      default:
        this.showUserError(error.message);
    }
  }
  
  private handleNetworkError(error: Error): void {
    this.showUserError('Network connection failed. Please check your connection.');
    this.scheduleRetry();
  }
}
```

## Authentication

### JWT Token Management
```typescript
interface JwtPayload {
  sub: string; // User ID
  iat: number; // Issued at
  exp: number; // Expires at
  scope: string[]; // Permission scopes
  role: string; // User role
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
  
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
    } finally {
      this.clearTokens();
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
  
  getToken(): string | null {
    if (!this.token || this.isTokenExpired(this.token)) {
      await this.refreshToken();
    }
    return this.token;
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

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response
```typescript
interface RateLimitResponse {
  success: false,
  error: {
    code: 'RATE_LIMITED',
    message: 'Rate limit exceeded. Please try again later.',
    details: {
      limit: 1000,
      remaining: 0,
      resetTime: 1640995200,
      retryAfter: 60 // Seconds to wait
    }
  }
}
```

### Client-side Rate Limiting
```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limits: Map<string, RateLimit> = new Map();
  
  constructor() {
    // Configure rate limits
    this.limits.set('api', { maxRequests: 1000, windowMs: 3600000 }); // 1 hour
    this.limits.set('socket', { maxRequests: 100, windowMs: 60000 }); // 1 minute
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
  
  getRetryAfter(key: string): number {
    const limit = this.limits.get(key);
    const requests = this.requests.get(key) || [];
    
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return Math.ceil((oldestRequest + limit.windowMs - Date.now()) / 1000);
  }
}
```

## Webhooks

### Webhook Configuration
```typescript
interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retryPolicy: RetryPolicy;
}

interface RetryPolicy {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}
```

### Webhook Events
```typescript
// Agent lifecycle webhooks
'agent.created': Agent created
'agent.updated': Agent updated
'agent.deleted': Agent deleted
'agent.status_changed': Agent status changed

// Goal webhooks
'goal.created': Goal created
'goal.updated': Goal updated
'goal.completed': Goal completed
'goal.failed': Goal failed

// System webhooks
'system.alert': System alert generated
'system.maintenance': Maintenance mode changed
'system.performance': Performance threshold exceeded
```

### Webhook Payload
```typescript
interface WebhookPayload {
  id: string;
  event: string;
  timestamp: string;
  data: any;
  signature: string;
}

// Example webhook payload
{
  "id": "webhook_123456789",
  "event": "agent.created",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "data": {
    "agent": {
      "id": "agent_001",
      "name": "New Agent",
      "type": "cognitive",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  },
  "signature": "sha256=abcdef123456789"
}
```

### Webhook Verification
```typescript
class WebhookVerifier {
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(expectedSignature, signature);
  }
  
  static parseWebhook(request: Request): WebhookPayload {
    const signature = request.headers['x-webhook-signature'];
    const payload = request.body;
    
    if (!this.verifySignature(JSON.stringify(payload), signature, process.env.WEBHOOK_SECRET)) {
      throw new Error('Invalid webhook signature');
    }
    
    return payload;
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

### Python SDK
```python
# Installation
pip install mindcraft-dashboard-sdk

# Usage
from mindcraft_dashboard import MindcraftAPI

api = MindcraftAPI(
    base_url='https://api.mindcraft.example.com',
    token='your-jwt-token'
)

# Agent management
agents = api.agents.get_all()
agent = api.agents.get('agent_001')
new_agent = api.agents.create({
    'name': 'New Agent',
    'type': 'cognitive'
})

# Goal management
goals = api.goals.get_all('agent_001')
new_goal = api.goals.create('agent_001', {
    'title': 'Explore Area',
    'type': 'strategic'
})

# Real-time events
@api.socket.on('agent:state:update')
def on_agent_state_update(data):
    print(f"Agent state updated: {data}")

api.socket.connect()
```

## Examples

### Basic Agent Management
```typescript
import { MindcraftDashboardAPI } from '@mindcraft/dashboard-sdk';

async function exampleAgentManagement() {
  const api = new MindcraftDashboardAPI({
    baseURL: 'https://api.mindcraft.example.com',
    token: 'your-jwt-token'
  });

  try {
    // Get all agents
    const agents = await api.agents.getAll();
    console.log('Found agents:', agents.data.agents);

    // Create new agent
    const newAgent = await api.agents.create({
      name: 'Example Agent',
      type: 'cognitive',
      configuration: {
        purpose: {
          identity: {
            name: 'Example Agent',
            role: 'explorer'
          }
        }
      }
    });
    console.log('Created agent:', newAgent.data.agent);

    // Update agent
    const updatedAgent = await api.agents.update(newAgent.data.agent.id, {
      name: 'Updated Example Agent'
    });
    console.log('Updated agent:', updatedAgent.data.agent);

  } catch (error) {
    console.error('Error managing agents:', error);
  }
}
```

### Real-time Event Handling
```typescript
async function exampleRealTimeEvents() {
  const api = new MindcraftDashboardAPI({
    baseURL: 'https://api.mindcraft.example.com',
    token: 'your-jwt-token'
  });

  // Connect to real-time events
  await api.socket.connect();

  // Listen to agent state updates
  api.socket.on('agent:state:update', (data) => {
    console.log(`Agent ${data.agentId} state updated:`, data.state);
    
    // Update UI
    updateAgentUI(data.agentId, data.state);
  });

  // Listen to goal progress updates
  api.socket.on('goal:progress:update', (data) => {
    console.log(`Goal ${data.goalId} progress: ${data.newProgress}`);
    
    // Update progress bar
    updateGoalProgress(data.goalId, data.newProgress);
  });

  // Listen to performance alerts
  api.socket.on('performance:alert:event', (data) => {
    console.log(`Performance alert for ${data.agentId}:`, data.alert);
    
    // Show notification
    showNotification({
      type: data.alert.severity,
      message: data.alert.message,
      agentId: data.agentId
    });
  });

  // Handle connection events
  api.socket.on('disconnect', (reason) => {
    console.log('Disconnected from real-time events:', reason);
    
    // Show reconnection UI
    showReconnectionMessage();
  });

  api.socket.on('connect', () => {
    console.log('Connected to real-time events');
    
    // Hide reconnection UI
    hideReconnectionMessage();
  });
}
```

### Goal Management Example
```typescript
async function exampleGoalManagement() {
  const api = new MindcraftDashboardAPI({
    baseURL: 'https://api.mindcraft.example.com',
    token: 'your-jwt-token'
  });

  const agentId = 'agent_001';

  try {
    // Get agent goals
    const goalsResponse = await api.goals.getAll(agentId);
    const goals = goalsResponse.data.goals;
    console.log('Agent goals:', goals);

    // Create strategic goal
    const strategicGoal = await api.goals.create(agentId, {
      type: 'strategic',
      title: 'Build Base',
      description: 'Establish a permanent base of operations',
      priority: 9,
      dependencies: []
    });
    console.log('Created strategic goal:', strategicGoal.data.goal);

    // Create tactical subgoals
    const tacticalGoal1 = await api.goals.create(agentId, {
      type: 'tactical',
      title: 'Gather Resources',
      description: 'Collect materials for base construction',
      priority: 8,
      parentId: strategicGoal.data.goal.id,
      dependencies: []
    });

    const tacticalGoal2 = await api.goals.create(agentId, {
      type: 'tactical',
      title: 'Find Location',
      description: 'Identify suitable location for base',
      priority: 8,
      parentId: strategicGoal.data.goal.id,
      dependencies: []
    });

    // Create operational tasks
    await api.goals.create(agentId, {
      type: 'operational',
      title: 'Mine Stone',
      description: 'Mine 64 stone blocks',
      priority: 7,
      parentId: tacticalGoal1.data.goal.id,
      dependencies: []
    });

    await api.goals.create(agentId, {
      type: 'operational',
      title: 'Craft Tools',
      description: 'Craft necessary tools for construction',
      priority: 7,
      parentId: tacticalGoal1.data.goal.id,
      dependencies: []
    });

    // Update goal progress
    await api.goals.updateProgress(agentId, tacticalGoal1.data.goal.id, 0.25);

    console.log('Goal management completed');

  } catch (error) {
    console.error('Error in goal management:', error);
  }
}
```

---

This API documentation provides comprehensive information for integrating with the Mindcraft Cognitive Dashboard system.
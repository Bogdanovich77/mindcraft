# Mindcraft Frontend Revamp Design Document

## Executive Summary

This document outlines a comprehensive frontend revamp for the Mindcraft system to transform the current basic agent management interface into a sophisticated cognitive dashboard that provides real-time visibility into the "hearts of bots" - their personalities, memories, goals, social relationships, and cognitive processes.

## Current State Analysis

### Existing Frontend Capabilities
- Basic agent management (create, start, stop, destroy)
- Simple agent status display (health, hunger, position, inventory)
- Basic communication interface
- Settings management through forms
- Optional bot viewer (iframe)

### Identified Gaps
- No visualization of LangGraph cognitive architecture
- No access to personality traits and motivations
- No memory system visualization
- No goal hierarchy display
- No social relationship visualization
- No skill progression tracking
- No cognitive performance metrics

## Design Goals

1. **Transparency**: Provide complete visibility into agent cognitive processes
2. **Real-time**: Live updates of all cognitive states and changes
3. **Interactivity**: Allow users to explore and influence agent cognition
4. **Intuitiveness**: Make complex cognitive data easily understandable
5. **Performance**: Maintain responsive UI despite rich data visualization

## Architecture Overview

### Frontend Technology Stack
- **Framework**: Modern React or Vue.js with TypeScript
- **State Management**: Redux/Vuex for complex state handling
- **Visualization**: D3.js for complex cognitive visualizations
- **Real-time**: Socket.IO for live data updates
- **UI Components**: Material-UI or Ant Design for consistency
- **Charts**: Chart.js or Recharts for metrics visualization

### Backend Integration
- **Data Source**: Enhanced `get-full-state` endpoint from MindServer
- **Communication**: Socket.IO for real-time updates
- **API**: REST endpoints for historical data and configuration
- **Authentication**: Secure access to cognitive data

## Detailed Feature Specification

### 1. Agent Dashboard Overview

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Selector Row                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Overview   │ │ Personality  │ │   Memory    │ │
│  │             │ │             │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │    Goals    │ │   Social    │ │   Skills    │ │
│  │             │ │             │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            Performance & Analytics           │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Agent Selector
- **Multi-agent Support**: Switch between different agents
- **Status Indicators**: Online/offline, cognitive load, activity level
- **Quick Actions**: Start, stop, restart, configure
- **Search/Filter**: Find agents by name, status, or characteristics

### 2. Overview Tab

#### Core Status Display
- **Vital Signs**: Health, hunger, experience level with trend indicators
- **Position & Environment**: 3D coordinates, biome, time of day with mini-map
- **Current Activity**: Real-time action display with context
- **Cognitive Load**: Visual indicator of mental workload (0-100%)
- **System Health**: Memory usage, processing time, error rates

#### Performance Metrics
- **Response Times**: Cognitive processing, reactive response, communication latency
- **Success Rates**: Goal completion, action execution, social interactions
- **Learning Velocity**: Skill progression, memory consolidation, adaptation speed
- **Resource Utilization**: CPU, memory, network usage per agent

### 3. Personality Tab

#### Trait Visualization
```
┌─────────────────────────────────────────────────────────────┐
│                Big Five Traits                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Openness    │ │Conscientious│ │ Extraversion │ │
│  │    0.75     │ │    0.60     │ │    0.45     │ │
│  │ ████████▌   │ │ ██████▌     │ │ ███▌        │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│              Gaming-Specific Traits               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │Risk Tolerance│ │ Creativity   │ │ Patience     │ │
│  │    0.65     │ │    0.80     │ │    0.70     │ │
│  │ ██████▌     │ │ ████████▌   │ │ ██████▌     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Personality Components
- **Trait Bars**: Visual representation of all personality traits
- **Historical Evolution**: Timeline showing trait changes over time
- **Trait Influences**: Show how traits affect current behavior
- **Personality Editor**: Interactive trait adjustment with impact preview

#### Motivations & Values
- **Motivation Levels**: Visual indicators for primary/secondary motivations
- **Drive Satisfaction**: Current satisfaction levels with trend analysis
- **Value Hierarchy**: Ranked display of core values with priority weights
- **Ethical Framework**: Visual representation of moral constraints

### 4. Memory Tab

#### Memory System Overview
```
┌─────────────────────────────────────────────────────────────┐
│              Memory Architecture                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Semantic   │ │  Episodic   │ │ Procedural   │ │
│  │   Memory     │ │   Memory     │ │   Memory     │ │
│  │  2,847 facts │ │  1,234 events│ │   156 skills  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│              Working Memory                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Current Focus: "Mining iron ore"          │ │
│  │ Active Tasks:                           │ │
│  │ • Navigate to cave                       │ │
│  │ • Equip pickaxe                          │ │
│  │ • Mine iron ore                         │ │
│  │ Buffer: 7/10 items used                 │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Memory Exploration Features
- **Semantic Memory**: Interactive knowledge graph visualization
- **Episodic Memory**: Timeline of experiences with filtering options
- **Procedural Memory**: Skill and habit visualization
- **Working Memory**: Real-time view of current cognitive focus
- **Memory Search**: Search across all memory types with filters
- **Memory Analytics**: Access patterns, consolidation rates, forgetting curves

#### Memory Interactions
- **Memory Injection**: Add new memories or knowledge
- **Memory Modification**: Edit or strengthen existing memories
- **Memory Forgetting**: Trigger memory decay or removal
- **Memory Consolidation**: View and influence consolidation processes

### 5. Goals Tab

#### Goal Hierarchy Visualization
```
┌─────────────────────────────────────────────────────────────┐
│                Goal Hierarchy                   │
│                                                 │
│  Strategic Goals                                 │
│  ┌─────────────────────────────────────────┐         │
│  │ Become Master Builder                │         │
│  │ Progress: ████████▌ 80%           │         │
│  │ Timeline: 6 weeks remaining         │         │
│  └─────────────────────────────────────────┘         │
│                                                 │
│  Tactical Goals                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Build Base  │ │Collect Tools│ │Explore Area │ │
│  │███████▌ 60%│ │████████▌ 80%│ │███▌ 30%    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                 │
│  Operational Goals                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │Mine Iron   │ │Craft Pick  │ │Place Torches│ │
│  │In Progress │ │Axe        │ │            │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Goal Management Features
- **Hierarchical Display**: Strategic → Tactical → Operational breakdown
- **Progress Tracking**: Real-time progress bars and milestone indicators
- **Priority Management**: Visual priority queues with drag-and-drop reordering
- **Goal Dependencies**: Visual dependency graphs and critical paths
- **Resource Requirements**: Display needed resources and availability
- **Timeline View**: Gantt chart of goal schedules and deadlines

#### Goal Interactions
- **Goal Creation**: Add new goals at any hierarchy level
- **Goal Modification**: Edit existing goals and see cascading effects
- **Goal Prioritization**: Adjust priorities and observe system response
- **Goal Intervention**: Suggest actions or override agent decisions

### 6. Social Tab

#### Social Network Visualization
```
┌─────────────────────────────────────────────────────────────┐
│              Social Network                     │
│                                                 │
│     Agent A                                     │
│    ██████▌                                     │
│   /        \                                    │
│  Trust:0.8  Friendship:0.6                       │
│ /            \                                   │
│ Agent B      Agent C                               │
│ ███▌         ████████▌                             │
│ Trust:0.4    Trust:0.9                            │
│ Friendship:0.3 Friendship:0.7                         │
│                                                 │
│ Legend: ████ = Trust Level, ████ = Friendship Level    │
└─────────────────────────────────────────────────────────────┘
```

#### Social Components
- **Relationship Matrix**: Grid showing all agent relationships
- **Trust Levels**: Visual indicators of trust between agents
- **Friendship Scores**: Dynamic friendship strength visualization
- **Reputation System**: Agent reputation scores and history
- **Communication Logs**: History of social interactions
- **Social Analytics**: Relationship trends and network dynamics

#### Theory of Mind Display
- **Mental Models**: Visualization of what agent thinks about others
- **Intention Predictions**: Real-time prediction of other agents' intentions
- **Emotional Intelligence**: Empathy scores and emotional state modeling
- **Social Context**: Current social situation and group dynamics
- **Perspective Taking**: Multiple viewpoint visualization

### 7. Skills Tab

#### Skill Progression Visualization
```
┌─────────────────────────────────────────────────────────────┐
│               Skill System                     │
│                                                 │
│  Combat Skills          Crafting Skills           │
│ ┌─────────────┐       ┌─────────────┐         │
│ │ Sword       │       │ Woodworking │         │
│ │ ████████▌  │       │ ██████▌     │         │
│ │ Level: 7    │       │ Level: 4    │         │
│ │ XP: 2,340   │       │ XP: 1,120   │         │
│ └─────────────┘       └─────────────┘         │
│                                                 │
│  Exploration Skills      Social Skills              │
│ ┌─────────────┐       ┌─────────────┐         │
│ │ Navigation  │       │ Communication│         │
│ │ ███████▌  │       │ ███▌        │         │
│ │ Level: 6    │       │ Level: 2    │         │
│ │ XP: 1,890   │       │ XP: 450     │         │
│ └─────────────┘       └─────────────┘         │
│                                                 │
│  Learning Analytics                               │
│ ┌─────────────────────────────────────────┐         │
│ │ Total Skills: 47/50              │         │
│ │ Average Level: 4.2                │         │
│ │ Learning Velocity: +0.3 levels/day   │         │
│ │ Skill Synergies: 12 active          │         │
│ └─────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

#### Skill System Features
- **Skill Categories**: Organized by domain (combat, crafting, exploration, etc.)
- **Proficiency Metrics**: Knowledge, practical, creative components
- **Experience Tracking**: XP, levels, milestones with progress bars
- **Skill Synergies**: Visual representation of transfer learning
- **Learning Analytics**: Velocity, efficiency, plateau detection
- **Skill Recommendations**: Suggested skills to practice based on goals

#### Skill Interactions
- **Skill Training**: Trigger practice sessions and monitor progress
- **Skill Specialization**: Choose specializations and unlock abilities
- **Skill Synergy Management**: Enable/disable synergies and see effects
- **Experience Allocation**: Direct experience to specific skills

### 8. Performance & Analytics Tab

#### System Performance
```
┌─────────────────────────────────────────────────────────────┐
│              Performance Metrics                │
│                                                 │
│  Cognitive Performance                            │
│ ┌─────────────────────────────────────────┐         │
│ │ Processing Time: 245ms (target: <500ms)   │         │
│ │ Decision Quality: 87% (target: >80%)       │         │
│ │ Learning Efficiency: 92% (target: >85%)      │         │
│ │ Memory Access: 156ms (target: <200ms)       │         │
│ └─────────────────────────────────────────┘         │
│                                                 │
│  Resource Utilization                          │
│ ┌─────────────────────────────────────────┐         │
│ │ CPU Usage: 35% (target: <50%)           │         │
│ │ Memory: 1.2GB (target: <2GB)           │         │
│ │ Network: 2.3MB/s (target: <5MB/s)        │         │
│ │ Storage: 450MB (target: <1GB)            │         │
│ └─────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

#### Analytics Features
- **Performance Dashboards**: Real-time metrics with historical trends
- **Benchmarking**: Compare against target performance and other agents
- **Alert System**: Notifications for performance issues or anomalies
- **Resource Monitoring**: Track CPU, memory, network usage per agent
- **Error Tracking**: Monitor errors, failures, and recovery patterns
- **Optimization Suggestions**: AI-powered recommendations for improvement

## Technical Implementation

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                Frontend Application              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Router    │ │State Manager │ │   Socket     │ │
│  │             │ │             │ │   Client    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Components  │ │Visualizers │ │   Utils      │ │
│  │             │ │             │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Charts    │ │   Forms     │ │   Modals     │ │
│  │             │ │             │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                Data Flow Diagram               │
│                                                 │
│  Backend (MindServer)                           │
│  ┌─────────────┐                                 │
│  │get-full-state│                                 │
│  └─────┬───────┘                                 │
│        │                                         │
│        ▼                                         │
│  Socket.IO (Real-time)                            │
│  ┌─────────────┐                                 │
│  │state-update │                                 │
│  └─────┬───────┘                                 │
│        │                                         │
│        ▼                                         │
│  Frontend State Management                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Redux     │ │   VueX     │ │   Zustand  │ │
│  └─────┬───────┘ └─────┬───────┘ └─────┬───────┘ │
│        │                 │                 │         │
│        ▼                 ▼                 ▼         │
│  Component Rendering                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │  React     │ │   Vue.js   │ │   Svelte   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Backend Enhancements Required

#### Enhanced State Endpoint
```typescript
interface FullAgentState {
  // Existing gameplay data
  gameplay: {
    health: number;
    hunger: number;
    position: Vector3;
    inventory: InventoryState;
    // ... existing fields
  };
  
  // New cognitive data
  cognitive: {
    purpose: {
      personality: PersonalityTraits;
      motivations: MotivationState;
      values: ValueHierarchy;
      ethics: EthicalFramework;
    };
    goals: {
      strategic: StrategicGoal[];
      tactical: TacticalGoal[];
      operational: OperationalGoal[];
      activeGoals: Goal[];
      goalHistory: GoalHistory[];
    };
    memory: {
      semantic: SemanticMemoryState;
      episodic: EpisodicMemoryState;
      procedural: ProceduralMemoryState;
      working: WorkingMemoryState;
    };
    social: {
      relationships: RelationshipNetwork;
      theoryOfMind: TheoryOfMindState;
      reputation: ReputationScore;
    };
    skills: {
      skillProgression: SkillProgressionState;
      learningAnalytics: LearningAnalytics;
      synergies: SkillSynergies;
    };
    performance: {
      cognitiveMetrics: CognitivePerformanceMetrics;
      learningVelocity: LearningVelocity;
      adaptationRate: AdaptationRate;
    };
  };
}
```

#### Real-time Data Streaming
```typescript
// Enhanced Socket.IO events
interface CognitiveEvents {
  'personality-change': (agentName: string, traits: PersonalityTraits) => void;
  'memory-consolidation': (agentName: string, memoryData: MemoryConsolidation) => void;
  'goal-progress': (agentName: string, goalUpdate: GoalProgress) => void;
  'relationship-change': (agentName: string, relationshipUpdate: RelationshipUpdate) => void;
  'skill-progression': (agentName: string, skillUpdate: SkillProgression) => void;
  'cognitive-load-change': (agentName: string, loadLevel: number) => void;
  'theory-of-mind-update': (agentName: string, tomUpdate: TheoryOfMindUpdate) => void;
}
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
1. **Frontend Setup**
   - Initialize React/Vue.js project with TypeScript
   - Set up Socket.IO client for real-time communication
   - Configure state management (Redux/Vuex)
   - Create basic routing and layout structure

2. **Backend Enhancements**
   - Extend `get-full-state` endpoint with cognitive data
   - Add new Socket.IO events for cognitive updates
   - Implement data aggregation and caching
   - Add error handling and performance monitoring

### Phase 2: Core Features (Weeks 3-5)
1. **Overview Tab**
   - Implement basic agent status display
   - Add cognitive load indicators
   - Create performance metrics dashboard
   - Implement real-time updates

2. **Personality Tab**
   - Design trait visualization components
   - Implement personality trait displays
   - Add motivation and value visualization
   - Create personality editing interface

### Phase 3: Advanced Features (Weeks 6-8)
1. **Memory System**
   - Implement memory system visualizations
   - Create memory exploration interfaces
   - Add memory search and filtering
   - Implement memory interaction features

2. **Goals & Social**
   - Build goal hierarchy visualization
   - Implement social network display
   - Add theory of mind visualization
   - Create interaction interfaces

### Phase 4: Polish & Optimization (Weeks 9-10)
1. **Skills & Analytics**
   - Implement skill progression tracking
   - Create learning analytics dashboard
   - Add performance optimization tools
   - Implement alerting system

2. **Testing & Deployment**
   - Comprehensive testing of all features
   - Performance optimization and bug fixes
   - Documentation and user guides
   - Production deployment

## Success Metrics

### User Experience Goals
- **Transparency**: 100% visibility into agent cognitive processes
- **Responsiveness**: <100ms UI response time for all interactions
- **Intuitiveness**: <5 minutes to learn basic navigation
- **Reliability**: 99.9% uptime for real-time features

### Technical Performance Goals
- **Data Throughput**: Handle 100+ concurrent agents with <1s latency
- **Memory Efficiency**: <500MB frontend memory usage
- **CPU Usage**: <30% CPU usage during normal operation
- **Network Bandwidth**: <10MB/s data transfer for full cognitive state

### Feature Completeness Goals
- **Cognitive Coverage**: Visualize 100% of LangGraph cognitive components
- **Interactivity**: Enable user interaction with 90% of cognitive data
- **Real-time**: Provide live updates for all dynamic cognitive states
- **Historical Analysis**: Store and visualize 30+ days of cognitive history

## Conclusion

This frontend revamp will transform the Mindcraft system from a basic agent management tool into a comprehensive cognitive dashboard that provides unprecedented visibility into AI agent minds. The design leverages the sophisticated LangGraph architecture to create an intuitive, interactive, and powerful interface for understanding and influencing agent behavior.

The implementation roadmap provides a structured approach to deliver this complex system while maintaining stability and performance throughout development. The result will be a truly revolutionary tool for AI agent visualization and interaction.
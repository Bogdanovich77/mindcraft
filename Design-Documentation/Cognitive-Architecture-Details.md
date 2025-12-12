# Mindcraft LangGraph - Cognitive Architecture Details

## Overview

This document provides comprehensive architectural reference for the Mindcraft LangGraph hybrid agent system, serving as the definitive guide for understanding node relationships, state management, and system integration patterns.

## Core Architecture Overview

### Dual-Layer Processing Model

The Mindcraft LangGraph system implements a critical hybrid architecture combining:

**Reactive Layer (Real-time Survival)**
- **Purpose**: Immediate survival and emergency response
- **Response Time**: <100ms for survival behaviors
- **Priority**: Always takes precedence over cognitive processing
- **Components**: Emergency detection, interrupt controller, reactive modes

**Cognitive Layer (LangGraph Decision Making)**
- **Purpose**: Complex decision-making and long-term planning
- **Response Time**: 500ms-2000ms for complex decisions
- **Priority**: Processes when no emergency conditions exist
- **Components**: Purpose core, goal system, memory, learning

### Hybrid Architecture Design

```
┌─────────────────────────────────────────────────────┐
│                    Hybrid Agent Architecture                │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Reactive Layer │  │  Interrupt      │  │ Cognitive Layer │ │
│  │  (Real-time)    │  │  Controller     │  │ (LangGraph)     │ │
│  │                 │  │                 │  │                 │ │
│  │ • Survival      │  │ • Emergency     │  │ • Purpose Core  │ │
│  │ • Defense       │  │   Detection     │  │ • Goal System   │ │
│  │ • Escape        │  │ • Priority      │  │ • Memory        │ │
│  │ • <100ms        │  │   Management    │  │ • Learning      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Action         │  │  State          │  │  Learning       │ │
│  │  Coordinator    │  │  Synchronization│  │   Integration    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Reactive      │  │ • State Merge    │  │ • Experience    │ │
│  │   Override      │  │ • Context       │  │   Tracking      │ │
│  │ • Cognitive     │  │ • Sharing       │  │ • Adaptive      │ │
│  │   Planning      │  │ • Priority      │  │   Behaviors     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## State Graph Node Architecture

### 1. Perception Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:12)
**Function**: [`perceptionNode()`](src/agent/langgraph/state_nodes.ts:12)
**Purpose**:
- Update world context from mineflayer bot data
- Process sensory information (entities, blocks, environmental factors)
- Calculate cognitive load based on input complexity
- Initialize cognitive processing cycle

**State Population**:
- `context.position`, `context.health`, `context.inventory`
- `context.nearbyEntities`, `context.nearbyBlocks`
- `cognitive.processing.cognitiveLoad`

### 2. Message Analysis Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:509)
**Function**: [`messageAnalysisNode()`](src/agent/langgraph/state_nodes.ts:509)
**Purpose**:
- Analyze incoming messages to determine processing mode
- Distinguish between conversational messages and action commands
- Route to appropriate processing path
- Maintain conversation context

**State Population**:
- `context.lastMessage`
- `executive.processingMode` ('conversational' or 'action')
- `cognitive.memory.working.conversationContext`

### 3. Conversation Processing Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:585)
**Function**: [`conversationProcessingNode()`](src/agent/langgraph/state_nodes.ts:585)
**Purpose**:
- Generate conversational responses using existing prompter system
- Maintain agent personality in responses
- Handle multi-turn conversations
- Update conversation history

**State Population**:
- `executive.conversationalResponse`
- `cognitive.memory.episodic.conversationHistory`
- `cognitive.processing.currentPhase`

### 4. Reactive Check Node
**File**: [`src/agent/langgraph/core_graph.ts`](src/agent/langgraph/core_graph.ts:169)
**Function**: [`checkReactiveInterrupts()`](src/agent/langgraph/core_graph.ts:169)
**Purpose**:
- Check for emergency conditions requiring immediate response
- Calculate interrupt priority based on threat level
- Route processing to emergency response or cognitive processing
- Ensure survival behaviors are never blocked by cognitive processing

**Emergency Priority System**:
- EMERGENCY (0): Drowning, burning, falling (<50ms response)
- SURVIVAL (1): Low health, hostile nearby (<100ms response)
- OPPORTUNITY (2): Stuck situations (<200ms response)
- COGNITIVE (3): Normal goal-directed processing (>500ms)

**State Population**:
- `reactive.emergencyConditions`
- `reactive.interruptHistory`

### 5. Emergency Response Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:454)
**Function**: [`emergencyResponseNode()`](src/agent/langgraph/state_nodes.ts:454)
**Purpose**:
- Execute immediate survival actions
- Record reactive action for learning
- Update performance metrics
- Bypass cognitive processing entirely

**State Population**:
- `reactive.lastReactiveAction`
- `executive.performanceMetrics.reactiveResponseTime`

### 6. Analysis Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:70)
**Function**: [`analysisNode()`](src/agent/langgraph/state_nodes.ts:70)
**Purpose**:
- Analyze current situation and context
- Identify opportunities and threats
- Update working memory with analysis results
- Set cognitive processing phase

**State Population**:
- `cognitive.memory.working.currentFocus`
- `cognitive.memory.working.activeTasks`
- `cognitive.processing.currentPhase`

### 7. Planning Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:134)
**Function**: [`planningNode()`](src/agent/langgraph/state_nodes.ts:134)
**Purpose**:
- Review and prioritize hierarchical goals
- Generate action plans for top-priority goals
- Queue actions for execution
- Update goal state

**State Population**:
- `cognitive.goals.activeGoals`
- `executive.actionQueue`
- `cognitive.processing.currentPhase`

### 8. Decision Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:201)
**Function**: [`decisionNode()`](src/agent/langgraph/state_nodes.ts:201)
**Purpose**:
- Evaluate available action options
- Calculate utility and risk for each option
- Select best action based on purpose-driven criteria
- Record decision for learning

**State Population**:
- `executive.currentAction`
- `executive.decisionHistory`
- `cognitive.processing.currentPhase`

### 9. Execution Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:301)
**Function**: [`executionNode()`](src/agent/langgraph/state_nodes.ts:301)
**Purpose**:
- Execute selected actions
- Track action performance
- Update action status and queue
- Handle execution failures

**State Population**:
- `executive.currentAction` (cleared after execution)
- `executive.performanceMetrics.cognitiveProcessingTime`
- `executive.lastDecision`

### 10. Reflection Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:388)
**Function**: [`reflectionNode()`](src/agent/langgraph/state_nodes.ts:388)
**Purpose**:
- Learn from recent experiences
- Update memory systems (semantic, episodic, procedural)
- Adapt personality and motivations
- Update skill proficiencies

**State Population**:
- `cognitive.memory` (all memory subsystems)
- `cognitive.skills`
- `cognitive.purpose`

### 11. Response Routing Node
**File**: [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:671)
**Function**: [`responseRoutingNode()`](src/agent/langgraph/state_nodes.ts:671)
**Purpose**:
- Route conversational responses back to users
- Handle action command confirmations
- Maintain conversation flow
- Update message routing state

**State Population**:
- `executive.lastResponse`
- `executive.responseHistory`
- `context.lastMessage` (cleared after routing)

## AgentState Structure and Population

### Core State Interfaces
**File**: [`src/agent/langgraph/interfaces.ts`](src/agent/langgraph/interfaces.ts:452)

#### World Context
**Purpose**: Real-time world information from mineflayer
**Populated By**: Perception node every cycle
**Key Fields**:
- `position`, `health`, `food`, `experience`
- `nearbyEntities`, `nearbyBlocks`
- `inventory`, `equipment`
- `dimension`, `timeOfDay`, `weather`

#### Reactive State
**Purpose**: Emergency detection and response tracking
**Populated By**: Interrupt Controller and Reactive Layer
**Key Fields**:
- `activeMode`: Current reactive behavior
- `emergencyConditions`: Active emergency situations
- `lastReactiveAction`: Most recent reactive response
- `interruptHistory`: Historical interrupt events

#### Cognitive State
**Purpose**: Higher-level cognitive processing and learning
**Populated By**: Multiple cognitive nodes

**Purpose Core** ([`src/agent/cognitive/purpose_core.ts`](src/agent/cognitive/purpose_core.ts:56))
- `identity`: Agent name, role, background, core purpose
- `personality`: Big Five traits + gaming-specific traits
- `motivations`: Primary/secondary motivations, drives, satisfactions
- `values`: Core values, priorities, moral constraints
- `ethics`: Harm avoidance, fairness, loyalty, authority, purity

**Goal System** ([`src/agent/cognitive/goal_system.ts`](src/agent/cognitive/goal_system.ts:59))
- `strategicGoals`: Long-term strategic objectives
- `tacticalGoals`: Medium-term tactical plans
- `operationalGoals`: Short-term operational tasks
- `activeGoals`: Currently executing goals
- `goalHistory`: Completed and failed goal records

**Memory Systems**
- `semantic`: Facts, concepts, relationships
- `episodic`: Events, experiences, contexts
- `procedural`: Skills, procedures, habits
- `working`: Active tasks, focus, buffer

**Processing State**
- `currentPhase`: Current cognitive processing phase
- `cognitiveLoad`: Current mental workload
- `attentionLevel`: Focus and attention metrics
- `processingHistory`: Performance tracking

#### Executive State
**Purpose**: Action execution and performance tracking
**Populated By**: Decision and Execution nodes
**Key Fields**:
- `currentAction`: Currently executing action
- `actionQueue`: Pending actions for execution
- `decisionHistory`: Past decisions and outcomes
- `performanceMetrics`: Response times, success rates
- `conversationalResponse`: Generated conversational response
- `lastResponse`: Last response sent to user
- `responseHistory`: History of all responses
- `processingMode`: Current processing mode ('conversational' or 'action')

## Integration Components

### Reactive Behavior Layer
**File**: [`src/agent/langgraph/reactive_layer.ts`](src/agent/langgraph/reactive_layer.ts:117)
**Purpose**: Seamless integration between reactive and cognitive systems
**Key Features**:
- Emergency interrupt handling
- State synchronization
- Performance monitoring
- Learning integration

**State Population**:
- Updates `reactive` state based on emergency detection
- Provides interrupt signals to cognitive processing
- Records reactive actions for learning integration

### Interrupt Controller
**File**: [`src/agent/langgraph/interrupt_controller.ts`](src/agent/langgraph/interrupt_controller.ts:8)
**Purpose**: Emergency detection and cognitive preemption
**Key Features**:
- Real-time emergency detection
- Priority-based interrupt handling
- Performance tracking
- Adaptive threshold adjustment

**State Population**:
- `reactive.emergencyConditions`
- `reactive.interruptHistory`

### Purpose Core System
**File**: [`src/agent/cognitive/purpose_core.ts`](src/agent/cognitive/purpose_core.ts:56)
**Purpose**: Purpose-driven decision making
**Key Features**:
- Personality-based action selection
- Motivation-driven goal generation
- Value-based ethical filtering
- Learning and adaptation

**State Population**:
- `cognitive.purpose` (all purpose-related fields)
- `cognitive.goals.activeGoals`

## Data Flow Patterns

### Normal Processing Flow
1. **START** → **Perception**: Update world context
2. **Perception** → **Message Analysis**: Analyze incoming messages
3. **Message Analysis** → **Conversation Processing**: Conversational message detected
4. **Message Analysis** → **Reactive Check**: Action command or no message
5. **Reactive Check** → **Cognitive Processing**: No emergencies detected
6. **Cognitive Processing** → **Analysis**: Analyze situation
7. **Analysis** → **Planning**: Generate action plans
8. **Planning** → **Decision**: Select best action
9. **Decision** → **Execution**: Execute selected action
10. **Execution** → **Reflection**: Learn from experience
11. **Conversation Processing** → **Response Routing**: Route conversational response
12. **Reflection** → **Perception**: Continue cycle or END
13. **Response Routing** → **END**: Send response to user

### Emergency Processing Flow
1. **START** → **Perception**: Update world context
2. **Perception** → **Reactive Check**: Check for emergencies
3. **Reactive Check** → **Emergency Response**: Emergency detected
4. **Emergency Response** → **END**: Immediate survival action

### Conversation Processing Flow
1. **START** → **Perception**: Update world context
2. **Perception** → **Message Analysis**: Analyze incoming message
3. **Message Analysis** → **Conversation Processing**: Conversational message detected
4. **Conversation Processing** → **Response Routing**: Generate response using prompter
5. **Response Routing** → **END**: Send response to user

### State Synchronization Points
- **Every Cycle**: World context updated from mineflayer
- **Emergency Detection**: Reactive state updated with current conditions
- **Cognitive Processing**: All cognitive states updated as needed
- **Action Execution**: Executive state updated with results
- **Reflection**: Memory and learning systems updated

## Performance Requirements

### Response Time Targets
- **Emergency Response**: <50ms for life-threatening situations
- **Survival Response**: <100ms for health/safety threats
- **Cognitive Processing**: 500ms-2000ms for complex decisions
- **Opportunity Response**: <200ms for advantageous situations

### Resource Constraints
- **Memory Usage**: <2GB per agent
- **CPU Usage**: Linear scaling with concurrent agents
- **Network Bandwidth**: Optimized for multi-agent coordination
- **Storage**: Efficient state serialization and persistence

## Hybrid Processing Architecture

### Message Processing Flow

The implementation introduces a dual-path processing system that intelligently routes messages based on their content:

```
┌─────────────────────────────────────────────────────┐
│                    Message Input Flow                │
├─────────────────────────────────────────────────────┤
│ 1. Message Received → 2. Message Analysis → 3. Route Decision │
│                      ↓                    ↓                    │
│               Processing Mode     Conversational/Action      │
│                      ↓                    ↓                    │
│        Conversation Processing    Cognitive Processing       │
│                      ↓                    ↓                    │
│              Response Generation    Action Planning           │
│                      ↓                    ↓                    │
│                 Response Routing    Action Execution          │
│                      ↓                    ↓                    │
│                   Send Response     Learning & Reflection   │
└─────────────────────────────────────────────────────┘
```

### Mode Detection Logic

```typescript
function checkIfActionCommand(message: string): boolean {
  const actionCommands = [
    'go to', 'move to', 'walk to', 'run to',
    'get', 'take', 'pick up', 'collect',
    'craft', 'build', 'place', 'break',
    'attack', 'fight', 'defend',
    'follow', 'stop', 'wait'
  ];
  
  const lowerMessage = message.toLowerCase();
  return actionCommands.some(cmd => lowerMessage.includes(cmd));
}
```

## Key Implementation Files

### Core LangGraph Components
- [`src/agent/langgraph/interfaces.ts`](src/agent/langgraph/interfaces.ts:1) - All TypeScript interfaces
- [`src/agent/langgraph/core_graph.ts`](src/agent/langgraph/core_graph.ts:1) - Main StateGraph implementation
- [`src/agent/langgraph/state_nodes.ts`](src/agent/langgraph/state_nodes.ts:1) - All processing node functions
- [`src/agent/langgraph/reactive_layer.ts`](src/agent/langgraph/reactive_layer.ts:1) - Reactive behavior integration
- [`src/agent/langgraph/interrupt_controller.ts`](src/agent/langgraph/interrupt_controller.ts:1) - Emergency interrupt handling

### Cognitive Components
- [`src/agent/cognitive/purpose_core.ts`](src/agent/cognitive/purpose_core.ts:1) - Purpose-driven decision making
- [`src/agent/cognitive/goal_system.ts`](src/agent/cognitive/goal_system.ts:1) - Hierarchical goal management
- [`src/agent/cognitive/personality.ts`](src/agent/cognitive/personality.ts:1) - Personality system
- [`src/agent/cognitive/motivations.ts`](src/agent/cognitive/motivations.ts:1) - Motivation system
- [`src/agent/cognitive/values.ts`](src/agent/cognitive/values.ts:1) - Value hierarchy
- [`src/agent/cognitive/ethics.ts`](src/agent/cognitive/ethics.ts:1) - Ethical framework

### Memory Components
- [`src/agent/memory/semantic_memory.ts`](src/agent/memory/semantic_memory.ts:1) - Semantic memory system
- [`src/agent/memory/episodic_memory.ts`](src/agent/memory/episodic_memory.ts:1) - Episodic memory system
- [`src/agent/memory/procedural_memory.ts`](src/agent/memory/procedural_memory.ts:1) - Procedural memory system
- [`src/agent/memory/working_memory.ts`](src/agent/memory/working_memory.ts:1) - Working memory system

## Success Metrics

### Performance Targets
- **Reactive Response**: <100ms for survival behaviors
- **Cognitive Processing**: 500ms-2000ms for complex decisions
- **Memory Usage**: <2GB per agent
- **Concurrent Agents**: Linear scaling to 50+ agents

### Behavioral Validation
- NPCs maintain all current survival behaviors
- 300% increase in complex task completion rates
- Support for 10+ concurrent hierarchical goals
- Emergent authentic social behavior through theory of mind

This architecture transforms reactive Minecraft bots into sophisticated cognitive agents capable of complex long-term planning while maintaining essential survival behaviors that make them effective and believable.
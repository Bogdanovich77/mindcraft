# LangGraph Architecture Quick Reference

## System Overview
The Mindcraft LangGraph system implements a hybrid architecture combining reactive survival behaviors with cognitive decision-making through a state graph structure.

## Core Components

### 8 Processing Nodes
1. **Perception** - Update world context, process sensory input
2. **Reactive Check** - Detect emergencies, determine interrupt priority
3. **Emergency Response** - Execute immediate survival actions
4. **Analysis** - Analyze situation, identify opportunities/threats
5. **Planning** - Prioritize goals, generate action plans
6. **Decision** - Evaluate options, select best action
7. **Execution** - Execute selected actions, track performance
8. **Reflection** - Learn from experience, update memory systems

### State Structure
```typescript
AgentState {
  context: WorldContext;      // Real-time world information
  reactive: ReactiveState;     // Emergency conditions and responses
  cognitive: CognitiveState;   // Purpose, goals, memory, learning
  executive: ExecutiveState;   // Actions, decisions, performance
  metadata: SystemMetadata;    // Agent identification and system info
}
```

### Emergency Priority System
- **EMERGENCY (0)**: Drowning, burning, falling (<50ms response)
- **SURVIVAL (1)**: Low health, hostile nearby (<100ms response)
- **OPPORTUNITY (2)**: Stuck situations (<200ms response)
- **COGNITIVE (3)**: Planned/goal-directed actions (>500ms)

## Key Files

### Core LangGraph
- `src/agent/langgraph/interfaces.ts` - All TypeScript interfaces
- `src/agent/langgraph/core_graph.ts` - Main StateGraph implementation
- `src/agent/langgraph/state_nodes.ts` - All processing node functions
- `src/agent/langgraph/reactive_layer.ts` - Reactive behavior integration
- `src/agent/langgraph/interrupt_controller.ts` - Emergency interrupt handling

### Cognitive Systems
- `src/agent/cognitive/purpose_core.ts` - Purpose-driven decision making
- `src/agent/cognitive/goal_system.ts` - Hierarchical goal management
- `src/agent/cognitive/personality.ts` - Personality system
- `src/agent/cognitive/motivations.ts` - Motivation system
- `src/agent/cognitive/values.ts` - Value hierarchy
- `src/agent/cognitive/ethics.ts` - Ethical framework

### Memory Systems
- `src/agent/memory/semantic_memory.ts` - Semantic memory system
- `src/agent/memory/episodic_memory.ts` - Episodic memory system
- `src/agent/memory/procedural_memory.ts` - Procedural memory system
- `src/agent/memory/working_memory.ts` - Working memory system

## Data Flow

### Normal Processing
START → Perception → Reactive Check → Cognitive Processing → Analysis → Planning → Decision → Execution → Reflection → Continue/END

### Emergency Processing
START → Perception → Reactive Check → Emergency Response → END

## Performance Requirements
- **Emergency Response**: <50ms for life-threatening situations
- **Survival Response**: <100ms for health/safety threats
- **Cognitive Processing**: 500ms-2000ms for complex decisions
- **Memory Usage**: <2GB per agent
- **Concurrent Agents**: Linear scaling to 50+ agents

## Integration Points
- **Reactive-Cognitive Bridge**: Interrupt signals, emergency conditions
- **State Synchronization**: Updated context, action results
- **Learning Integration**: Experience data, model updates
- **Performance Monitoring**: Metrics, timing data

## Migration Phases
1. **Foundation** (Weeks 1-4): LangGraph setup, reactive integration
2. **Cognitive Core** (Weeks 5-8): Purpose, goals, skills, memory
3. **Advanced Features** (Weeks 9-12): Social, learning, coordination
4. **Production** (Weeks 13-16): Optimization, testing, deployment

## Success Metrics
- **Behavioral**: 300% increase in complex task completion
- **Performance**: Support for 10+ concurrent hierarchical goals
- **Social**: Emergent authentic social behavior
- **Scalability**: Linear scaling to 50+ concurrent agents

This architecture transforms reactive Minecraft bots into sophisticated cognitive agents while maintaining essential survival behaviors.
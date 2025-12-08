# Reactive-Cognitive Integration Architecture

## Critical Requirement Preservation
The current Mindcraft system's reactive modes provide essential survival behaviors that must operate independently of LLM/cognitive processing:

**Current Reactive Modes (Must Preserve):**
- `self_preservation`: Respond to drowning, burning, low health
- `self_defense`: Attack nearby hostile mobs
- `cowardice`: Run away from enemies
- `unstuck`: Detect and escape from stuck situations
- `hunting`, `item_collecting`, `torch_placing`: Opportunistic behaviors

## Hybrid Architecture Design

### Dual-Layer Processing Model
```
┌─────────────────────────────────────────────────────────────┐
│                    Hybrid Agent Architecture                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Reactive Layer │  │  Interrupt      │  │ Cognitive Layer │ │
│  │  (Real-time)    │  │  Controller     │  │ (LangGraph)     │ │
│  │                 │  │                 │  │                 │ │
│  │ • Survival      │  │ • Emergency     │  │ • Purpose Core  │ │
│  │ • Defense       │  │   Detection     │  │ • Goal System   │ │
│  │ • Escape        │  │ • Priority      │  │ • Memory        │ │
│  │ • <100ms        │  │   Management    │  │ • Learning      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Action         │  │  State          │  │  Learning       │ │
│  │  Coordinator    │  │  Synchronization│  │  Integration    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Reactive      │  │ • State Merge    │  │ • Experience    │ │
│  │   Override      │  │ • Context       │  │   Tracking      │ │
│  │ • Cognitive     │  │   Sharing       │  │ • Adaptive      │ │
│  │   Planning      │  │ • Priority      │  │   Behaviors     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Interrupt Priority System
```typescript
enum InterruptPriority {
  EMERGENCY = 0,    // Life-threatening situations (<50ms)
  SURVIVAL = 1,     // Health/safety threats (<100ms)
  OPPORTUNITY = 2,  // Resource/advantage opportunities (<200ms)
  COGNITIVE = 3     // Planned/goal-directed actions (>500ms)
}

interface InterruptController {
  checkEmergencyConditions(state: AgentState): InterruptPriority;
  preemptCognitiveProcessing(priority: InterruptPriority): void;
  resumeCognitiveProcessing(): void;
}
```

### Reactive Behavior Integration
```typescript
class ReactiveBehaviorLayer {
  private modes: ReactiveMode[]; // Existing modes system
  private interruptController: InterruptController;
  
  async update(agent: Agent, deltaTime: number): Promise<void> {
    // Check for emergency conditions first
    const priority = this.interruptController.checkEmergencyConditions(agent.state);
    
    if (priority <= InterruptPriority.SURVIVAL) {
      // Immediate reactive response, bypass cognitive processing
      await this.executeReactiveResponse(agent, priority);
      return;
    }
    
    // Allow cognitive processing with reactive monitoring
    if (agent.cognitive.isActive()) {
      await this.monitorAndInterruptIfNeeded(agent);
    }
  }
  
  private async executeReactiveResponse(agent: Agent, priority: InterruptPriority): Promise<void> {
    // Execute appropriate reactive mode
    const activeMode = this.selectReactiveMode(agent, priority);
    await activeMode.execute(agent);
    
    // Update cognitive state with reactive action context
    agent.state.lastReactiveAction = {
      mode: activeMode.name,
      priority,
      timestamp: Date.now(),
      context: agent.context
    };
  }
}
```

### State Graph Integration Points
```typescript
class HybridAgentGraph extends StateGraph<AgentState> {
  private reactiveLayer: ReactiveBehaviorLayer;
  
  constructor() {
    super();
    this.setupReactiveIntegration();
  }
  
  private setupReactiveIntegration(): void {
    // Insert reactive checks at critical points
    this.addConditionalEdges(
      "cognitive_processing",
      this.checkReactiveInterrupts.bind(this),
      {
        "emergency": "reactive_emergency_response",
        "normal": "continue_cognitive"
      }
    );
  }
  
  private checkReactiveInterrupts(state: AgentState): string {
    const priority = this.reactiveLayer.checkEmergencyConditions(state);
    return priority <= InterruptPriority.SURVIVAL ? "emergency" : "normal";
  }
}
```

### Learning Integration
```typescript
class ReactiveLearningIntegration {
  // Learn from reactive-cognitive interactions
  processReactiveExperience(action: ReactiveAction, context: AgentContext): void {
    // Update personality traits based on survival decisions
    this.updatePersonalityFromReactiveAction(action, context);
    
    // Enhance goal priorities based on reactive patterns
    this.adjustGoalPriorities(action, context);
    
    // Improve predictive models for threat detection
    this.trainThreatPrediction(action, context);
  }
}
```

## Performance Requirements
- **Reactive Response Time**: <100ms for survival behaviors
- **Cognitive Processing**: 500ms-2000ms for complex decisions
- **Interrupt Latency**: <50ms from threat detection to response
- **Memory Integration**: Reactive actions inform cognitive learning

## Migration Strategy
1. **Phase 1**: Preserve existing reactive system unchanged
2. **Phase 2**: Add interrupt controller and state synchronization
3. **Phase 3**: Integrate cognitive processing with reactive overrides
4. **Phase 4**: Enhance reactive behaviors with cognitive learning

This hybrid approach ensures NPCs remain survivable while gaining sophisticated cognitive capabilities.
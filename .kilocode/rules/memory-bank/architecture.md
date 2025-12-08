# Mindcraft LangGraph Rewrite - System Architecture

## Current Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Current Mindcraft System                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   NPC Data      │  │   Item Goals    │  │   Build Goals   │ │
│  │   (Flat State)  │  │   (Simple Tree) │  │   (Basic Exec)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Memory Bank    │  │   Modes System  │  │   Skills Lib    │ │
│  │ (Location Only) │  │ (Reactive Only) │  │ (Comprehensive) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Target LangGraph Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    LangGraph NPC Agent                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Purpose Core  │  │  Skills Manager │  │  Goal System    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Personality   │  │ • Skill Inventory│  │ • Strategic     │ │
│  │ • Motivations   │  │ • Proficiency   │  │   Goals         │ │
│  │ • Values        │  │ • Learning Rate │  │ • Tactical      │ │
│  │ • Ethics        │  │ • Experience    │  │   Objectives    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Memory System  │  │ Social Manager  │  │ Planning Engine │ │
│  │                 │  │                 │  │                 │ │
│  │ • Semantic      │  │ • Relationships │  │ • Pathfinding   │ │
│  │ • Episodic      │  │ • Reputation    │  │ • Resource      │ │
│  │ • Procedural    │  │ • Communication │  │   Assessment    │ │
│  │ • Working       │  │ • Cooperation   │  │ • Feasibility   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Source Code Paths
**Core Agent System:**
- `src/agent/agent.js` - Main agent class (to be refactored)
- `src/agent/npc/` - Current NPC implementation (legacy)
- `src/agent/library/skills.js` - Skill execution (to be integrated)

**New LangGraph Components:**
- `src/agent/langgraph/` - New state graph implementation
- `src/agent/cognitive/` - Purpose core and cognitive systems
- `src/agent/memory/` - Enhanced memory systems
- `src/agent/social/` - Social relationship management

## Key Technical Decisions
- **State Management**: LangGraph StateGraph for hierarchical cognitive states
- **Language**: TypeScript for type safety and interfaces
- **Compatibility**: Maintain backward compatibility during migration
- **Performance**: Real-time execution with sub-second decision cycles
- **Modularity**: Plugin architecture for extensible cognitive components

## Design Patterns in Use
- **State Graph Pattern**: For cognitive state transitions
- **Strategy Pattern**: For decision-making algorithms
- **Observer Pattern**: For event-driven learning
- **Factory Pattern**: For creating agent personalities
- **Command Pattern**: For skill execution and undo

## Component Relationships
```
Agent (StateGraph)
├── PurposeCore (influences all decisions)
├── SkillsManager (tracks capabilities)
├── GoalSystem (hierarchical objectives)
├── MemorySystem (knowledge storage)
├── SocialManager (relationship tracking)
└── PlanningEngine (action coordination)
```

## Critical Implementation Paths
1. **State Graph Foundation** → **Purpose Core** → **Skills Integration**
2. **Memory Systems** → **Learning Mechanisms** → **Social Cognition**
3. **Goal Hierarchy** → **Planning Engine** → **Multi-agent Coordination**
4. **Legacy Bridge** → **Migration Layer** → **Full Deployment**
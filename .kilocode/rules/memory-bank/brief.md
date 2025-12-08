# Mindcraft LangGraph Rewrite - Project Brief

## Project Overview
Mindcraft is a Minecraft bot system that enables AI agents to interact with and manipulate Minecraft environments. The current system uses a flat state management approach with basic goal systems and reactive behaviors.

## Current State
- **Architecture**: Flat state representation with simple item-quantity goals
- **Components**: Basic NPC controller, item goals, build goals, memory bank (location storage only)
- **Limitations**: No skill progression, minimal learning, reactive behavior patterns, limited social capabilities

## Target State
Complete architectural rewrite using LangGraph to implement:
- Hierarchical goal management (strategic, tactical, operational)
- Dynamic skill progression with experience-based learning
- Purpose-driven behavior with personality and motivation systems
- Semantic memory with episodic and procedural components
- Social relationship management and theory of mind
- Multi-agent coordination capabilities

## Key Technologies
- **Current**: Node.js, mineflayer, basic state management
- **Target**: LangGraph state graphs, TypeScript interfaces, cognitive architecture patterns

## Success Criteria
- 300% increase in complex task completion rates
- Support for 10+ concurrent hierarchical goals per agent
- Linear scaling up to 50 concurrent agents
- Emergent authentic social behavior and learning
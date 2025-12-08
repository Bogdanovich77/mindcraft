# Mindcraft LangGraph Rewrite - Technical Stack

## Technologies Used
**Core Framework:**
- **LangGraph**: State graph management for cognitive architecture
- **Node.js**: Runtime environment (ES modules)
- **TypeScript**: Type safety and interface definitions
- **Mineflayer 4.33.0**: Minecraft bot interaction

**Dependencies:**
- mineflayer-pathfinder: Navigation and pathfinding
- mineflayer-collectblock: Block collection
- mineflayer-armor-manager: Equipment management
- mineflayer-pvp: Combat mechanics
- minecraft-data: Game data and recipes
- vec3: 3D vector mathematics

**Development Tools:**
- ESLint: Code quality and linting
- patch-package: Dependency modification
- yargs: Command line interface

## Development Setup
**Environment Requirements:**
- Node.js 18+ with ES module support
- Minecraft server for testing
- TypeScript compiler for type checking

**Project Structure:**
```
src/agent/
├── langgraph/          # New state graph implementation
├── cognitive/          # Purpose core and cognitive systems  
├── memory/             # Enhanced memory systems
├── social/             # Social relationship management
├── npc/                # Legacy implementation (to be migrated)
└── library/           # Skills and utilities
```

## Technical Constraints
**Performance Requirements:**
- Real-time decision cycles (<1 second)
- Memory usage <2GB per agent
- Support for 50+ concurrent agents
- Linear scaling performance

**Compatibility Requirements:**
- Backward compatibility with existing profiles
- Migration path from current NPC system
- Support for existing skill library
- Integration with current modes system

## Dependencies
**New Dependencies to Add:**
- @langchain/langgraph: State graph implementation
- @langchain/core: Core LangChain utilities
- typescript: Type safety
- @types/node: Node.js type definitions

**Existing Dependencies to Maintain:**
- All mineflayer ecosystem packages
- Current AI model integrations
- Express and Socket.IO for web interface
- Canvas and Three.js for visualization

## Tool Usage Patterns
**Development Workflow:**
- TypeScript interfaces for all new components
- Gradual migration strategy with compatibility layers
- Comprehensive testing for each migration phase
- Performance monitoring and optimization

**Code Organization:**
- Modular cognitive components
- Plugin architecture for extensibility
- Clear separation between legacy and new systems
- Consistent naming conventions and documentation
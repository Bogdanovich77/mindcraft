/**
 * State Nodes for Mindcraft LangGraph System
 * Defines the core processing nodes: perception, analysis, planning, decision, execution, and reflection
 */
declare module './interfaces.js' {
    interface AgentState {
        antiIdleSystem?: AntiIdleSystem;
        multiAgentCoordinator?: MultiAgentCoordinator;
    }
}
import { AntiIdleSystem } from '../cognitive/anti_idle_system';
//# sourceMappingURL=state_nodes.d.ts.map
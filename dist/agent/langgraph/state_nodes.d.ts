/**
 * State Nodes for Simplified Mindcraft LangGraph System
 * Defines the core processing nodes for the 4-node architecture: Perception, Conversation, Decision, Execution
 */
/**
 * Execution Node - Executes chosen actions and updates state
 *
 * Responsibilities:
 * - Executes the lastAction chosen by the Decision node
 * - Handles both physical commands and chat responses
 * - Updates the mandate if a new task is accepted through conversation
 * - Integrates with existing mineflayer action systems
 * - Provides feedback on action execution results
 *
 * Performance Target: <100ms for action dispatch
 *
 * @param state Current AgentState with lastAction, response, and conversation
 * @param bot Mineflayer bot instance for action execution
 * @param agent Agent instance containing action manager and other systems
 * @returns Updated AgentState with execution results and potential mandate updates
 */
export declare function executionNode(state: any, bot?: any, agent?: any): Promise<Partial<any>>;
//# sourceMappingURL=state_nodes.d.ts.map
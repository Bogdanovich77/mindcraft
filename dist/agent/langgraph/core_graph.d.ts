import { AgentState } from './interfaces.js';
import { Bot } from 'mineflayer';
/**
 * Simplified Agent Graph with 4-node cognitive loop architecture
 *
 * This class replaces the complex HybridAgentGraph with a streamlined implementation
 * focused on core functionality: communication, personality, self-awareness, and autonomy.
 */
export declare class SimplifiedAgentGraph {
    private graph;
    private bot;
    private compiledGraph;
    constructor(bot: Bot);
    /**
     * Set up the simplified LangGraph structure with 4 core nodes
     *
     * Flow: START → Perception → Message Check → Conversation/Decision → Execution → END
     */
    private setupGraph;
    /**
     * Execute the simplified cognitive processing cycle
     */
    process(state: AgentState): Promise<AgentState>;
    /**
     * Get basic performance metrics
     */
    getStatus(): {
        isCompiled: boolean;
        nodeCount: number;
    };
}
//# sourceMappingURL=core_graph.d.ts.map
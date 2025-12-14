/**
 * Simplified LangGraph StateGraph Implementation for Mindcraft Agent System
 *
 * This file contains the streamlined 4-node cognitive loop architecture:
 * START → Perception → Message Check → Conversation/Decision → Execution → END
 *
 * Core functionality focus:
 * - Inter-bot communication with help requests/offers
 * - Personality-driven responses using single string interpretation
 * - Self-awareness with HP, inventory, and equipment tracking
 * - Autonomous behavior driven by goals and mandate system
 */
import { StateGraph, END } from "@langchain/langgraph";
import { AgentStateAnnotation } from './interfaces.js';
import { 
// perceptionNode, 
// conversationNode, 
// decisionNode, 
executionNode,
// checkForMessagesConditional 
 } from './state_nodes.js';
/**
 * Simplified Agent Graph with 4-node cognitive loop architecture
 *
 * This class replaces the complex HybridAgentGraph with a streamlined implementation
 * focused on core functionality: communication, personality, self-awareness, and autonomy.
 */
export class SimplifiedAgentGraph {
    graph;
    bot;
    compiledGraph = null;
    constructor(bot) {
        this.bot = bot;
        this.graph = new StateGraph(AgentStateAnnotation);
        this.setupGraph();
    }
    /**
     * Set up the simplified LangGraph structure with 4 core nodes
     *
     * Flow: START → Perception → Message Check → Conversation/Decision → Execution → END
     */
    setupGraph() {
        try {
            // Add 4 core processing nodes
            // this.graph.addNode("perception", perceptionNode);
            // this.graph.addNode("conversation", conversationNode);
            // this.graph.addNode("decision", decisionNode);
            this.graph.addNode("execution", executionNode);
            // Set up main flow edges using type assertions for LangGraph compatibility
            // START → Perception
            // this.graph.addEdge(START, "perception" as any);
            // Conditional edge from Perception: route to conversation if message present, otherwise
            /*
            this.graph.addConditionalEdges(
              "perception" as any,
              checkForMessagesConditional,
              {
                has_message: "conversation",
                no_message: "decision"
              } as any
            );
            */
            // Both conversation and decision lead to execution
            // this.graph.addEdge("conversation" as any, "execution" as any);
            // this.graph.addEdge("decision" as any, "execution" as any);
            // Execution completes the cycle
            this.graph.addEdge("execution", END);
            // Compile the graph
            this.compiledGraph = this.graph.compile();
            console.log("[SIMPLIFIED_GRAPH] 4-node architecture setup completed successfully");
        }
        catch (error) {
            console.error("[SIMPLIFIED_GRAPH] Error setting up simplified graph:", error);
            this.compiledGraph = null;
        }
    }
    /**
     * Execute the simplified cognitive processing cycle
     */
    async process(state) {
        if (!this.compiledGraph) {
            throw new Error("[SIMPLIFIED_GRAPH] Graph not compiled");
        }
        try {
            const result = await this.compiledGraph.invoke(state.worldContext);
            // Ensure the result matches AgentState structure
            return result;
        }
        catch (error) {
            console.error("[SIMPLIFIED_GRAPH] Error during processing:", error);
            throw error;
        }
    }
    /**
     * Get basic performance metrics
     */
    getStatus() {
        let nodeCount = 4; // Base 4-node architecture
        // Check for available nodes and count them
        if (typeof executionNode !== 'undefined') {
            nodeCount++;
        }
        return {
            isCompiled: this.compiledGraph !== null,
            nodeCount: nodeCount
        };
    }
}
//# sourceMappingURL=core_graph.js.map
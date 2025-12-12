/**
 * Core LangGraph StateGraph Implementation for Mindcraft Hybrid Agent System
 * Integrates reactive behavior layer with cognitive processing nodes
 */
import { AgentState, Agent } from './interfaces.js';
import { Bot } from 'mineflayer';
/**
 * Hybrid Agent Graph that combines reactive and cognitive processing
 */
export declare class HybridAgentGraph {
    private graph;
    private reactiveLayer;
    private interruptController;
    private bot;
    private isProcessing;
    private lastUpdateTime;
    private updateInterval;
    private compiledGraph;
    private interruptPoints;
    private performanceMonitor;
    private stateSync;
    private currentState?;
    constructor(bot: Bot);
    /**
     * Set up the LangGraph structure with all nodes and edges
     */
    private setupGraph;
    /**
     * Set up interrupt handling for emergency conditions
     */
    private setupInterruptHandling;
    /**
     * Set up integration with reactive behavior layer
     */
    private setupReactiveIntegration;
    /**
     * Check for reactive interrupts before cognitive processing
     */
    private checkReactiveInterrupts;
    /**
     * Determine processing mode based on message analysis
     */
    private determineProcessingMode;
    /**
     * Determine if decision should be executed or reconsidered
     */
    private shouldExecute;
    /**
     * Determine if cognitive processing should continue
     */
    private shouldContinueProcessing;
    /**
     * Main update loop for the hybrid agent
     */
    update(agent: Agent, deltaTime: number): Promise<void>;
    /**
     * Run cognitive processing through the state graph
     */
    private runCognitiveProcessing;
    /**
     * Fallback cognitive processing when graph compilation fails
     */
    private runFallbackCognitiveProcessing;
    /**
     * Handle emergency response
     */
    private handleEmergency;
    /**
     * Synchronize state between reactive and cognitive layers
     */
    private synchronizeState;
    /**
     * Sync world context between layers
     */
    private syncWorldContext;
    /**
     * Sync goal progress between layers
     */
    private syncGoalProgress;
    /**
     * Sync learning experiences between layers
     */
    private syncLearningExperiences;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Calculate confidence in an action decision
     */
    private calculateActionConfidence;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): any;
    /**
     * Reset the graph state
     */
    reset(): void;
    /**
     * Configure performance mode
     */
    setPerformanceMode(mode: 'survival' | 'balanced' | 'cognitive'): void;
}
/**
 * Create a hybrid agent graph for the given bot
 */
export declare function createHybridAgentGraph(bot: Bot): HybridAgentGraph;
/**
 * Initialize agent state for the hybrid system
 */
export declare function initializeAgentState(bot: Bot, agentId: string): AgentState;
//# sourceMappingURL=core_graph.d.ts.map
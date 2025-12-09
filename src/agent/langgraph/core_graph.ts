/**
 * Core LangGraph StateGraph Implementation for Mindcraft Hybrid Agent System
 * Integrates reactive behavior layer with cognitive processing nodes
 */

import { StateGraph, START, END } from "@langchain/langgraph";
import { 
  AgentState, 
  Agent, 
  InterruptPriority, 
  ReactiveBehaviorLayer,
  ProcessingPhase 
} from './interfaces.js';
import { InterruptController } from './interrupt_controller.js';
import { createReactiveBehaviorLayer } from './reactive_layer.js';
import {
  perceptionNode,
  analysisNode,
  planningNode,
  decisionNode,
  executionNode,
  reflectionNode,
  emergencyResponseNode,
  messageAnalysisNode,
  conversationProcessingNode,
  responseRoutingNode
} from './state_nodes.js';
import { Bot } from 'mineflayer';

/**
 * Hybrid Agent Graph that combines reactive and cognitive processing
 */
export class HybridAgentGraph {
  private graph: any; // Using any to avoid LangGraph type complexities for now
  private reactiveLayer: ReactiveBehaviorLayer;
  private interruptController: InterruptController;
  private bot: Bot;
  private isProcessing: boolean = false;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 50; // 20 FPS update rate
  private compiledGraph: any;
  
  // Private properties for performance monitoring
  private interruptPoints: string[] = [];
  private performanceMonitor: {
    responseTimes: number[];
    interruptFrequency: number;
    cognitiveLoadAverage: number;
    successRate: number;
  } = {
    responseTimes: [],
    interruptFrequency: 0,
    cognitiveLoadAverage: 0,
    successRate: 1.0
  };
  
  private stateSync: {
    lastSyncTime: number;
    syncInterval: number;
    pendingChanges: Set<string>;
  } = {
    lastSyncTime: 0,
    syncInterval: 100,
    pendingChanges: new Set<string>()
  };
  
  private currentState?: AgentState;
constructor(bot: Bot) {
  this.bot = bot;
  // Use any type to avoid LangGraph type complexities for now
  // Pass an empty schema object - LangGraph will infer the structure from usage
  this.graph = new StateGraph<any>({});
    this.interruptController = new InterruptController('default-bot');
    this.reactiveLayer = createReactiveBehaviorLayer(this.interruptController, bot);
    
    this.setupGraph();
    this.setupInterruptHandling();
    this.setupReactiveIntegration();
  }

  /**
   * Set up the LangGraph structure with all nodes and edges
   */
  private setupGraph(): void {
    try {
      // Add all processing nodes
      this.graph.addNode("perception", perceptionNode);
      this.graph.addNode("message_analysis", messageAnalysisNode);
      this.graph.addNode("conversation_processing", conversationProcessingNode);
      this.graph.addNode("analysis", analysisNode);
      this.graph.addNode("planning", planningNode);
      this.graph.addNode("decision", decisionNode);
      this.graph.addNode("execution", executionNode);
      this.graph.addNode("reflection", reflectionNode);
      this.graph.addNode("response_routing", responseRoutingNode);
      this.graph.addNode("emergency_response", emergencyResponseNode);
      
      // Set up conditional edges for interrupt handling
      this.graph.addConditionalEdges(
        START,
        this.checkReactiveInterrupts.bind(this),
        {
          emergency: "emergency_response",
          normal: "perception"
        }
      );
      
      // Perception leads to message analysis
      this.graph.addEdge("perception", "message_analysis");
      
      // Message analysis routes to conversation or cognitive processing
      this.graph.addConditionalEdges(
        "message_analysis",
        this.determineProcessingMode.bind(this),
        {
          conversational: "conversation_processing",
          action: "analysis"
        }
      );
      
      // Conversation processing leads to response routing
      this.graph.addEdge("conversation_processing", "response_routing");
      
      // Main cognitive processing flow
      this.graph.addEdge("analysis", "planning");
      this.graph.addEdge("planning", "decision");
      
      // Decision can lead to execution or back to planning
      this.graph.addConditionalEdges(
        "decision",
        this.shouldExecute.bind(this),
        {
          execute: "execution",
          replan: "planning",
          reflect: "reflection"
        }
      );
      
      // Execution leads to reflection
      this.graph.addEdge("execution", "reflection");
      
      // Reflection leads to response routing for unified flow
      this.graph.addEdge("reflection", "response_routing");
      
      // Response routing can continue processing or end cycle
      this.graph.addConditionalEdges(
        "response_routing",
        this.shouldContinueProcessing.bind(this),
        {
          continue: "perception",
          end: END
        }
      );
      
      // Emergency response always ends the current cycle
      this.graph.addEdge("emergency_response", END);
      
      // Compile the graph
      this.compiledGraph = this.graph.compile();
      
    } catch (error) {
      console.error("[GRAPH] Error setting up graph:", error);
      // Fallback to simple processing without full graph
      this.compiledGraph = null;
    }
  }

  /**
   * Set up interrupt handling for emergency conditions
   */
  private setupInterruptHandling(): void {
    // Configure interrupt checking at critical decision points
    this.interruptPoints = [
      "perception",
      "message_analysis",
      "conversation_processing",
      "analysis",
      "planning",
      "decision",
      "execution",
      "response_routing"
    ];
  }

  /**
   * Set up integration with reactive behavior layer
   */
  private setupReactiveIntegration(): void {
    // Configure reactive layer parameters
    // Note: These methods would need to be added to the interfaces
    console.log("[GRAPH] Reactive integration setup completed");
  }

  /**
   * Check for reactive interrupts before cognitive processing
   */
  private async checkReactiveInterrupts(state: AgentState): Promise<string> {
    const priority = this.interruptController.checkEmergencyConditions(state);
    
    if (priority <= InterruptPriority.SURVIVAL) {
      console.log(`[GRAPH] Emergency interrupt detected (priority: ${priority})`);
      return "emergency";
    }
    
    return "normal";
  }

  /**
   * Determine processing mode based on message analysis
   */
  private async determineProcessingMode(state: AgentState): Promise<string> {
    const processingMode = state.executive.processingMode;
    const hasMessage = state.context.lastMessage !== undefined;
    
    // If we have a message and it's conversational, route to conversation processing
    if (hasMessage && processingMode === 'conversational') {
      console.log("[GRAPH] Routing to conversation processing");
      return "conversational";
    }
    
    // Otherwise, continue with action/cognitive processing
    console.log("[GRAPH] Routing to cognitive processing");
    return "action";
  }

  /**
   * Determine if decision should be executed or reconsidered
   */
  private async shouldExecute(state: AgentState): Promise<string> {
    if (!state.executive.currentAction) {
      return "replan";
    }
    
    const action = state.executive.currentAction;
    const confidence = this.calculateActionConfidence(action, state);
    
    if (confidence < 0.3) {
      return "replan";
    }
    
    if (state.cognitive.processing.cognitiveLoad > 0.8) {
      return "reflect";
    }
    
    return "execute";
  }

  /**
   * Determine if cognitive processing should continue
   */
  private async shouldContinueProcessing(state: AgentState): Promise<string> {
    const now = Date.now();
    const cycleTime = now - this.lastUpdateTime;
    
    // Limit cognitive processing cycles to prevent blocking
    if (cycleTime > 2000) { // 2 second max per cycle
      console.log("[GRAPH] Cognitive cycle timeout, ending processing");
      return "end";
    }
    
    // Check if there are still active goals
    const hasActiveGoals = state.cognitive.goals.activeGoals.length > 0;
    
    // Check if cognitive load is manageable
    const cognitiveLoadAcceptable = state.cognitive.processing.cognitiveLoad < 0.9;
    
    if (hasActiveGoals && cognitiveLoadAcceptable) {
      return "continue";
    }
    
    return "end";
  }

  /**
   * Main update loop for the hybrid agent
   */
  async update(agent: Agent, deltaTime: number): Promise<void> {
    if (this.isProcessing) {
      console.warn("[GRAPH] Already processing, skipping update");
      return;
    }
    
    const now = Date.now();
    
    // Rate limiting
    if (now - this.lastUpdateTime < this.updateInterval) {
      return;
    }
    
    this.isProcessing = true;
    this.lastUpdateTime = now;
    this.currentState = agent.state;
    
    try {
      // Update reactive layer first (highest priority)
      await this.reactiveLayer.update(agent, deltaTime);
      
      // Check if emergency response is needed
      const priority = this.interruptController.checkEmergencyConditions(agent.state);
      
      if (priority <= InterruptPriority.SURVIVAL) {
        // Emergency handling bypasses cognitive processing
        await this.handleEmergency(agent, priority);
        this.isProcessing = false;
        return;
      }
      
      // Run cognitive processing through LangGraph
      await this.runCognitiveProcessing(agent);
      
      // Synchronize state between reactive and cognitive layers
      await this.synchronizeState(agent);
      
      // Update performance metrics
      this.updatePerformanceMetrics(agent, now);
      
    } catch (error) {
      console.error("[GRAPH] Error during update:", error);
      
      // Reset processing state on error
      this.isProcessing = false;
      agent.state.cognitive.processing.currentPhase = ProcessingPhase.REFLECTION;
    }
    
    this.isProcessing = false;
  }

  /**
   * Run cognitive processing through the state graph
   */
  private async runCognitiveProcessing(agent: Agent): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (this.compiledGraph) {
        // Execute the state graph
        const result = await this.compiledGraph.invoke(agent.state);
        
        // Update agent state with graph results
        Object.assign(agent.state, result);
      } else {
        // Fallback to manual node execution
        await this.runFallbackCognitiveProcessing(agent);
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`[GRAPH] Cognitive processing completed in ${processingTime}ms`);
      
      // Validate performance requirements
      if (processingTime > 2000) {
        console.warn(`[GRAPH] Cognitive processing exceeded 2s limit: ${processingTime}ms`);
      }
      
    } catch (error) {
      console.error("[GRAPH] Cognitive processing failed:", error);
      
      // Record failure in processing history
      agent.state.cognitive.processing.processingHistory.push({
        phase: ProcessingPhase.DECISION, // Generic phase for failures
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        success: false,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Fallback cognitive processing when graph compilation fails
   */
  private async runFallbackCognitiveProcessing(agent: Agent): Promise<void> {
    console.log("[GRAPH] Running fallback cognitive processing");
    
    try {
      // Run nodes manually in sequence
      let state = agent.state;
      
      state = { ...state, ...(await perceptionNode(state)) };
      state = { ...state, ...(await messageAnalysisNode(state)) };
      
      // Check processing mode after message analysis
      const processingMode = await this.determineProcessingMode(state);
      
      if (processingMode === "conversational") {
        // Conversation processing flow
        state = { ...state, ...(await conversationProcessingNode(state)) };
        state = { ...state, ...(await responseRoutingNode(state)) };
      } else {
        // Cognitive processing flow
        state = { ...state, ...(await analysisNode(state)) };
        state = { ...state, ...(await planningNode(state)) };
        state = { ...state, ...(await decisionNode(state)) };
        
        const shouldExecuteResult = await this.shouldExecute(state);
        if (shouldExecuteResult === "execute") {
          state = { ...state, ...(await executionNode(state)) };
          state = { ...state, ...(await reflectionNode(state)) };
        }
        
        // Route through response routing for unified flow
        state = { ...state, ...(await responseRoutingNode(state)) };
      }
      
      // Update agent state
      Object.assign(agent.state, state);
      
    } catch (error) {
      console.error("[GRAPH] Fallback processing failed:", error);
    }
  }

  /**
   * Handle emergency response
   */
  private async handleEmergency(agent: Agent, priority: InterruptPriority): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Preempt any ongoing cognitive processing
      this.interruptController.preemptCognitiveProcessing(priority);
      
      // Execute emergency response through reactive layer
      await this.reactiveLayer.executeReactiveResponse(agent, priority);
      
      // Resume cognitive processing after emergency
      this.interruptController.resumeCognitiveProcessing();
      
      const responseTime = Date.now() - startTime;
      console.log(`[GRAPH] Emergency response completed in ${responseTime}ms`);
      
      // Validate emergency response time
      if (priority <= InterruptPriority.EMERGENCY && responseTime > 50) {
        console.warn(`[GRAPH] Emergency response exceeded 50ms limit: ${responseTime}ms`);
      } else if (priority === InterruptPriority.SURVIVAL && responseTime > 100) {
        console.warn(`[GRAPH] Survival response exceeded 100ms limit: ${responseTime}ms`);
      }
      
    } catch (error) {
      console.error("[GRAPH] Emergency response failed:", error);
    }
  }

  /**
   * Synchronize state between reactive and cognitive layers
   */
  private async synchronizeState(agent: Agent): Promise<void> {
    const now = Date.now();
    
    if (now - this.stateSync.lastSyncTime < this.stateSync.syncInterval) {
      return;
    }
    
    try {
      // Sync world context from reactive to cognitive
      this.syncWorldContext(agent.state);
      
      // Sync goal progress from cognitive to reactive
      this.syncGoalProgress(agent.state);
      
      // Sync learning experiences
      this.syncLearningExperiences(agent.state);
      
      this.stateSync.lastSyncTime = now;
      
    } catch (error) {
      console.error("[GRAPH] State synchronization failed:", error);
    }
  }

  /**
   * Sync world context between layers
   */
  private syncWorldContext(state: AgentState): void {
    // Ensure both layers have consistent world context
    // This would involve merging sensor data from both systems
  }

  /**
   * Sync goal progress between layers
   */
  private syncGoalProgress(state: AgentState): void {
    // Update reactive layer with current goal priorities
    // This helps reactive behaviors align with cognitive goals
  }

  /**
   * Sync learning experiences between layers
   */
  private syncLearningExperiences(state: AgentState): void {
    // Share learning between reactive and cognitive systems
    // Reactive experiences inform cognitive learning and vice versa
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(agent: Agent, currentTime: number): void {
    const metrics = agent.state.executive.performanceMetrics;
    
    // Calculate average response times
    const reactiveTimes = metrics.reactiveResponseTime;
    const cognitiveTimes = metrics.cognitiveProcessingTime;
    
    if (reactiveTimes.length > 0) {
      const avgReactive = reactiveTimes.reduce((a, b) => a + b, 0) / reactiveTimes.length;
      console.log(`[GRAPH] Average reactive response time: ${avgReactive.toFixed(2)}ms`);
    }
    
    if (cognitiveTimes.length > 0) {
      const avgCognitive = cognitiveTimes.reduce((a, b) => a + b, 0) / cognitiveTimes.length;
      console.log(`[GRAPH] Average cognitive processing time: ${avgCognitive.toFixed(2)}ms`);
    }
  }

  /**
   * Calculate confidence in an action decision
   */
  private calculateActionConfidence(action: any, state: AgentState): number {
    // Placeholder implementation
    // Would consider factors like:
    // - Past success rate with similar actions
    // - Current cognitive load
    // - Environmental uncertainty
    // - Resource availability
    
    return Math.random() * 0.8 + 0.2; // Random confidence between 0.2 and 1.0
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): any {
    return {
      isProcessing: this.isProcessing,
      lastUpdateTime: this.lastUpdateTime,
      updateInterval: this.updateInterval,
      hasCompiledGraph: this.compiledGraph !== null
    };
  }

  /**
   * Reset the graph state
   */
  reset(): void {
    this.isProcessing = false;
    this.lastUpdateTime = 0;
    console.log("[GRAPH] Hybrid agent graph reset");
  }

  /**
   * Configure performance mode
   */
  setPerformanceMode(mode: 'survival' | 'balanced' | 'cognitive'): void {
    switch (mode) {
      case 'survival':
        this.updateInterval = 25; // 40 FPS for faster reactive response
        break;
      case 'balanced':
        this.updateInterval = 50; // 20 FPS (default)
        break;
      case 'cognitive':
        this.updateInterval = 100; // 10 FPS for more cognitive processing
        break;
    }
    
    console.log(`[GRAPH] Performance mode set to: ${mode} (${this.updateInterval}ms interval)`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a hybrid agent graph for the given bot
 */
export function createHybridAgentGraph(bot: Bot): HybridAgentGraph {
  return new HybridAgentGraph(bot);
}

/**
 * Initialize agent state for the hybrid system
 */
export function initializeAgentState(bot: Bot, agentId: string): AgentState {
  const now = Date.now();
  
  return {
    // World context (would be populated from mineflayer)
    context: {
      position: { x: 0, y: 64, z: 0 },
      health: 20,
      food: 20,
      experience: 0,
      dimension: 'overworld',
      timeOfDay: 0,
      weather: 'clear',
      nearbyEntities: [],
      nearbyBlocks: [],
      inventory: [],
      equipment: {}
    },
    
    // Reactive state
    reactive: {
      activeMode: 'none',
      emergencyConditions: [],
      interruptHistory: [],
      lastReactiveAction: undefined
    },
    
    // Cognitive state (minimal initialization)
    cognitive: {
      purpose: {
        identity: { name: agentId, role: 'worker', background: '', corePurpose: 'survive' },
        personality: {
          openness: 0.5, conscientiousness: 0.5, extraversion: 0.5,
          agreeableness: 0.5, neuroticism: 0.5, riskTolerance: 0.5,
          explorationDrive: 0.5, socialTendency: 0.5,
          buildingCreativity: 0.5, combatAggression: 0.5
        },
        motivations: {
          primaryMotivation: 'survival',
          secondaryMotivations: [],
          drives: {},
          satisfactions: {}
        },
        values: {
          coreValues: ['survival', 'efficiency'],
          valuePriorities: { survival: 1.0, efficiency: 0.8 },
          moralConstraints: ['no_harm_to_allies']
        },
        ethics: {
          harmAvoidance: 0.8, fairnessConcern: 0.7, loyaltyPriority: 0.6,
          authorityRespect: 0.5, purityConcern: 0.4
        }
      },
      goals: {
        strategicGoals: [],
        tacticalGoals: [],
        operationalGoals: [],
        activeGoals: [],
        goalHistory: []
      },
      skills: {
        skills: {},
        experience: [],
        learningRate: 0.1,
        skillSynergies: {}
      },
      memory: {
        semantic: { facts: {}, concepts: {}, relationships: {} },
        episodic: { episodes: [], currentIndex: 0, compressionLevel: 0 },
        procedural: { procedures: {}, sequences: {}, habits: [] },
        working: {
          currentFocus: 'survival',
          activeTasks: [],
          buffer: [],
          capacity: 7,
          decayRate: 0.1
        }
      },
      processing: {
        currentPhase: ProcessingPhase.PERCEPTION,
        cognitiveLoad: 0.1,
        attentionLevel: 1.0,
        decisionThreshold: 0.5,
        processingHistory: []
      }
    },
    
    // Executive state
    executive: {
      currentAction: undefined,
      actionQueue: [],
      decisionHistory: [],
      performanceMetrics: {
        reactiveResponseTime: [],
        cognitiveProcessingTime: [],
        successRate: 1.0,
        learningRate: 0.1,
        goalCompletionRate: 0.0,
        survivalEvents: 0,
        socialInteractions: 0
      },
      conversationalResponse: undefined,
      lastResponse: undefined,
      responseHistory: [],
      processingMode: 'action'
    },
    
    // Metadata
    metadata: {
      agentId,
      startTime: now,
      lastUpdate: now,
      version: '1.0.0',
      performanceMode: 'balanced'
    }
  };
}
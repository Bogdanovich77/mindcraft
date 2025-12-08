/**
 * Reactive Behavior Integration Layer for Mindcraft LangGraph System
 * Wraps existing modes system and integrates with cognitive processing
 */

import { AgentState, InterruptPriority, ReactiveMode, ReactiveBehaviorLayer, InterruptController, Agent, ProcessingPhase } from './interfaces';
import { Bot } from 'mineflayer';

// Import existing modes system (would need to be adapted to ES modules)
// import { ModeController } from '../modes';

/**
 * Wrapper for existing reactive modes to integrate with new architecture
 */
export class LegacyModeWrapper implements ReactiveMode {
  public readonly name: string;
  public readonly priority: InterruptPriority;
  
  private legacyMode: any; // Would be the actual mode from modes.js
  private executeFunction: (bot: Bot) => Promise<void>;

  constructor(name: string, priority: InterruptPriority, legacyMode: any, executeFunction: (bot: Bot) => Promise<void>) {
    this.name = name;
    this.priority = priority;
    this.legacyMode = legacyMode;
    this.executeFunction = executeFunction;
  }

  async execute(agent: Agent): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Execute the legacy mode function
      await this.executeFunction(agent.bot);
      
      // Record successful execution
      const executionTime = Date.now() - startTime;
      console.log(`[REACTIVE] Mode ${this.name} executed in ${executionTime}ms`);
      
      // Update performance metrics if available
      if (agent.state.executive.performanceMetrics.reactiveResponseTime) {
        agent.state.executive.performanceMetrics.reactiveResponseTime.push(executionTime);
      }
      
    } catch (error) {
      console.error(`[REACTIVE] Error executing mode ${this.name}:`, error);
      
      // Record failed execution
      const executionTime = Date.now() - startTime;
      console.log(`[REACTIVE] Mode ${this.name} failed after ${executionTime}ms`);
    }
  }

  canHandle(state: AgentState): boolean {
    // Check if this mode can handle the current emergency conditions
    const emergencies = state.reactive.emergencyConditions;
    
    switch (this.name) {
      case 'self_preservation':
        return emergencies.some(e => e.type === 'drowning' || e.type === 'burning' || e.type === 'falling');
      
      case 'self_defense':
        return emergencies.some(e => e.type === 'hostile_nearby');
      
      case 'cowardice':
        return emergencies.some(e => e.type === 'hostile_nearby' || e.type === 'low_health');
      
      case 'unstuck':
        return emergencies.some(e => e.type === 'stuck');
      
      case 'hunting':
        return !emergencies.some(e => {
          const emergencyPriority = LegacyModeWrapper.getEmergencyPriority(e.type);
          return emergencyPriority <= InterruptPriority.SURVIVAL;
        }) && state.context.nearbyEntities.some(e => !e.hostile && e.distance < 16);
      
      case 'item_collecting':
        return !emergencies.some(e => {
          const emergencyPriority = LegacyModeWrapper.getEmergencyPriority(e.type);
          return emergencyPriority <= InterruptPriority.SURVIVAL;
        }) && state.context.nearbyBlocks.some(b => b.distance < 8);
      
      case 'torch_placing':
        return !emergencies.some(e => {
          const emergencyPriority = LegacyModeWrapper.getEmergencyPriority(e.type);
          return emergencyPriority <= InterruptPriority.SURVIVAL;
        }) && state.context.timeOfDay > 13000; // Night time
      
      default:
        return false;
    }
  }

  /**
   * Get interrupt priority for emergency type (static method)
   */
  static getEmergencyPriority(emergencyType: string): InterruptPriority {
    switch (emergencyType) {
      case 'drowning':
      case 'burning':
      case 'falling':
        return InterruptPriority.EMERGENCY;
      case 'low_health':
      case 'hostile_nearby':
        return InterruptPriority.SURVIVAL;
      case 'stuck':
        return InterruptPriority.OPPORTUNITY;
      default:
        return InterruptPriority.COGNITIVE;
    }
  }
}

/**
 * Main reactive behavior layer implementation
 */
export class ReactiveBehaviorLayerImpl implements ReactiveBehaviorLayer {
  private modes: ReactiveMode[] = [];
  private interruptController: InterruptController;
  private modeController: any; // Would be the existing ModeController
  private lastModeCheck: number = 0;
  private modeCheckInterval: number = 100; // Check modes every 100ms

  constructor(interruptController: InterruptController, bot: Bot) {
    this.interruptController = interruptController;
    this.initializeModes(bot);
  }

  /**
   * Initialize reactive modes from existing system
   */
  private initializeModes(bot: Bot): void {
    // This would integrate with the existing modes.js system
    // For now, creating placeholder wrappers
    
    // Self-preservation modes (highest priority)
    this.modes.push(new LegacyModeWrapper(
      'self_preservation',
      InterruptPriority.EMERGENCY,
      null, // Would be actual mode from modes.js
      async (bot: Bot) => {
        // Placeholder implementation
        console.log('[REACTIVE] Executing self preservation mode');
        // Would call actual self preservation logic
      }
    ));

    // Defense modes
    this.modes.push(new LegacyModeWrapper(
      'self_defense',
      InterruptPriority.SURVIVAL,
      null,
      async (bot: Bot) => {
        console.log('[REACTIVE] Executing self defense mode');
        // Would call actual defense logic
      }
    ));

    // Escape modes
    this.modes.push(new LegacyModeWrapper(
      'cowardice',
      InterruptPriority.SURVIVAL,
      null,
      async (bot: Bot) => {
        console.log('[REACTIVE] Executing cowardice mode');
        // Would call actual escape logic
      }
    ));

    // Utility modes
    this.modes.push(new LegacyModeWrapper(
      'unstuck',
      InterruptPriority.OPPORTUNITY,
      null,
      async (bot: Bot) => {
        console.log('[REACTIVE] Executing unstuck mode');
        // Would call actual unstuck logic
      }
    ));

    // Opportunistic modes (lowest priority)
    this.modes.push(new LegacyModeWrapper(
      'hunting',
      InterruptPriority.COGNITIVE,
      null,
      async (bot: Bot) => {
        console.log('[REACTIVE] Executing hunting mode');
        // Would call actual hunting logic
      }
    ));

    this.modes.push(new LegacyModeWrapper(
      'item_collecting',
      InterruptPriority.COGNITIVE,
      null,
      async (bot: Bot) => {
        console.log('[REACTIVE] Executing item collecting mode');
        // Would call actual item collection logic
      }
    ));

    this.modes.push(new LegacyModeWrapper(
      'torch_placing',
      InterruptPriority.COGNITIVE,
      null,
      async (bot: Bot) => {
        console.log('[REACTIVE] Executing torch placing mode');
        // Would call actual torch placing logic
      }
    ));

    // Sort modes by priority (lower number = higher priority)
    this.modes.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Main update loop for reactive behavior layer
   */
  async update(agent: Agent, deltaTime: number): Promise<void> {
    const now = Date.now();
    
    // Check emergency conditions first
    const priority = this.interruptController.checkEmergencyConditions(agent.state);
    
    // If emergency detected, execute immediate response
    if (priority <= InterruptPriority.SURVIVAL) {
      await this.executeReactiveResponse(agent, priority);
      return; // Bypass cognitive processing
    }
    
    // Check for opportunistic behaviors at regular intervals
    if (now - this.lastModeCheck > this.modeCheckInterval) {
      await this.checkOpportunisticBehaviors(agent);
      this.lastModeCheck = now;
    }
    
    // Monitor cognitive processing and interrupt if needed
    if (agent.state.cognitive.processing.currentPhase !== ProcessingPhase.REFLECTION) {
      await this.monitorAndInterruptIfNeeded(agent);
    }
  }

  /**
   * Check emergency conditions (delegates to interrupt controller)
   */
  checkEmergencyConditions(state: AgentState): InterruptPriority {
    return this.interruptController.checkEmergencyConditions(state);
  }

  /**
   * Execute immediate reactive response for emergencies
   */
  async executeReactiveResponse(agent: Agent, priority: InterruptPriority): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Select appropriate reactive mode
      const activeMode = this.selectReactiveMode(agent, priority);
      
      if (!activeMode) {
        console.warn('[REACTIVE] No suitable mode found for priority:', priority);
        return;
      }
      
      // Record interrupt before execution
      // Note: recordInterrupt would need to be added to InterruptController interface
      // this.interruptController.recordInterrupt(
      //   agent.state,
      //   priority,
      //   activeMode.name,
      //   true // Bypassed cognitive processing
      // );
      
      // Execute the reactive mode
      await activeMode.execute(agent);
      
      // Update agent state with reactive action context
      agent.state.reactive.lastReactiveAction = {
        mode: activeMode.name,
        priority,
        timestamp: Date.now(),
        context: agent.state.context,
        action: activeMode.name,
        result: 'success'
      };
      
      const executionTime = Date.now() - startTime;
      console.log(`[REACTIVE] Emergency response completed in ${executionTime}ms`);
      
      // Validate response time requirements
      if (priority <= InterruptPriority.EMERGENCY && executionTime > 50) {
        console.warn(`[REACTIVE] Emergency response took ${executionTime}ms (target: <50ms)`);
      } else if (priority === InterruptPriority.SURVIVAL && executionTime > 100) {
        console.warn(`[REACTIVE] Survival response took ${executionTime}ms (target: <100ms)`);
      }
      
    } catch (error) {
      console.error('[REACTIVE] Error during emergency response:', error);
      
      // Record failed response
      agent.state.reactive.lastReactiveAction = {
        mode: 'emergency_failed',
        priority,
        timestamp: Date.now(),
        context: agent.state.context,
        action: 'none',
        result: 'failed'
      };
    }
  }

  /**
   * Select the best reactive mode for current situation
   */
  selectReactiveMode(agent: Agent, priority: InterruptPriority): ReactiveMode {
    // Find modes that can handle the current situation and match priority
    const suitableModes = this.modes.filter(mode => 
      mode.priority === priority && mode.canHandle(agent.state)
    );
    
    if (suitableModes.length === 0) {
      // If no exact priority match, try lower priority modes
      const fallbackModes = this.modes.filter(mode => 
        mode.priority > priority && mode.canHandle(agent.state)
      );
      
      if (fallbackModes.length > 0) {
        return fallbackModes[0];
      }
      
      // Return a default mode that does nothing
      return new LegacyModeWrapper(
        'none',
        InterruptPriority.COGNITIVE,
        null,
        async (bot: Bot) => {
          // Do nothing
        }
      );
    }
    
    // Return highest priority suitable mode
    return suitableModes[0];
  }

  /**
   * Check for opportunistic behaviors when no emergencies are present
   */
  private async checkOpportunisticBehaviors(agent: Agent): Promise<void> {
    // Only check opportunistic modes if no emergency conditions
    const priority = this.interruptController.checkEmergencyConditions(agent.state);
    
    if (priority > InterruptPriority.OPPORTUNITY) {
      const opportunisticModes = this.modes.filter(mode => 
        mode.priority === InterruptPriority.OPPORTUNITY && mode.canHandle(agent.state)
      );
      
      if (opportunisticModes.length > 0) {
        const selectedMode = opportunisticModes[0];
        
        // Don't interrupt cognitive processing for opportunities,
        // but queue them for potential execution
        console.log(`[REACTIVE] Opportunity detected: ${selectedMode.name}`);
        
        // Could add to cognitive consideration queue
        // For now, just logging
      }
    }
  }

  /**
   * Monitor cognitive processing and interrupt if new emergencies arise
   */
  private async monitorAndInterruptIfNeeded(agent: Agent): Promise<void> {
    const currentPriority = this.interruptController.checkEmergencyConditions(agent.state);
    
    if (currentPriority <= InterruptPriority.SURVIVAL) {
      console.log(`[REACTIVE] Interrupting cognitive processing for emergency (priority: ${currentPriority})`);
      
      // Signal cognitive processing to stop
      this.interruptController.preemptCognitiveProcessing(currentPriority);
      
      // Execute emergency response
      await this.executeReactiveResponse(agent, currentPriority);
      
      // Resume cognitive processing after emergency is handled
      this.interruptController.resumeCognitiveProcessing();
    }
  }

  /**
   * Get performance metrics for reactive layer
   */
  getPerformanceMetrics(): {
    totalModes: number;
    averageResponseTime: number;
    emergencyResponseRate: number;
    modeUsageStats: Record<string, number>;
  } {
    const modeUsage: Record<string, number> = {};
    
    // Calculate mode usage statistics
    this.modes.forEach(mode => {
      modeUsage[mode.name] = 0; // Would be calculated from actual usage data
    });
    
    return {
      totalModes: this.modes.length,
      averageResponseTime: 75, // Placeholder - would be calculated from actual data
      emergencyResponseRate: 0.1, // Placeholder - would be calculated from actual data
      modeUsageStats: modeUsage
    };
  }

  /**
   * Update reactive layer parameters based on performance
   */
  updateParameters(performance: {
    responseTime: number;
    successRate: number;
    emergencyRate: number;
  }): void {
    // Adaptive adjustment of mode check interval
    if (performance.responseTime > 100) {
      // Increase check interval if responses are slow
      this.modeCheckInterval = Math.min(200, this.modeCheckInterval + 10);
    } else if (performance.responseTime < 50) {
      // Decrease check interval if responses are fast
      this.modeCheckInterval = Math.max(50, this.modeCheckInterval - 10);
    }
    
    console.log(`[REACTIVE] Updated mode check interval to ${this.modeCheckInterval}ms`);
  }

  /**
   * Reset reactive layer state
   */
  reset(): void {
    this.lastModeCheck = 0;
    console.log('[REACTIVE] Reactive layer reset');
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create reactive behavior layer with existing modes system integration
 */
export function createReactiveBehaviorLayer(
  interruptController: InterruptController, 
  bot: Bot
): ReactiveBehaviorLayer {
  const layer = new ReactiveBehaviorLayerImpl(interruptController, bot);
  return layer;
}

/**
 * Bridge between existing ModeController and new reactive layer
 */
export class ModeControllerBridge {
  private legacyModeController: any; // Would be existing ModeController
  private reactiveLayer: ReactiveBehaviorLayer;

  constructor(legacyModeController: any, reactiveLayer: ReactiveBehaviorLayer) {
    this.legacyModeController = legacyModeController;
    this.reactiveLayer = reactiveLayer;
  }

  /**
   * Update legacy mode controller state from reactive layer
   */
  syncLegacyState(): void {
    // Sync state between legacy and new systems
    // This would ensure backward compatibility
  }

  /**
   * Get current active mode from legacy system
   */
  getCurrentMode(): string {
    // Would get current mode from legacy system
    return 'none';
  }

  /**
   * Set mode in legacy system
   */
  setMode(modeName: string): void {
    // Would set mode in legacy system
    console.log(`[BRIDGE] Setting legacy mode to: ${modeName}`);
  }
}
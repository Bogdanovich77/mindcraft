import { getSocketService } from './socketService';
import type { AgentStateUpdateEvent } from '../types/socketEvents';
import { store } from '../store';

/**
 * Simplified Goal Socket Service - Handles basic goal updates via Socket.IO
 * Integrates with Redux store for state management
 */
class GoalSocketService {
  private socketService = getSocketService();
  private currentAgentId: string | null = null;
  private isSubscribed = false;

  /**
   * Subscribe to goal updates for a specific agent
   */
  subscribeToGoals(agentId: string): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    if (this.currentAgentId === agentId && this.isSubscribed) {
      console.log('[GoalSocketService] Already subscribed to goals for agent:', agentId);
      return;
    }

    // Unsubscribe from previous agent if needed
    if (this.currentAgentId && this.isSubscribed) {
      this.unsubscribeFromGoals();
    }

    this.currentAgentId = agentId;
    this.isSubscribed = true;

    // Subscribe to simplified goal events
    this.socketService.subscribeToAgent(agentId);
    
    // Set up event listeners
    this.setupEventListeners();

    console.log('[GoalSocketService] Subscribed to goals for agent:', agentId);
  }

  /**
   * Unsubscribe from goal updates
   */
  unsubscribeFromGoals(): void {
    if (!this.socketService || !this.currentAgentId || !this.isSubscribed) {
      return;
    }

    this.socketService.unsubscribeFromAgent(this.currentAgentId);
    this.removeEventListeners();
    this.isSubscribed = false;
    this.currentAgentId = null;

    console.log('[GoalSocketService] Unsubscribed from goals');
  }

  /**
   * Update agent goals (simplified)
   */
  updateAgentGoals(agentId: string, goals: string): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.send('agent:goals:update', {
      agentId,
      goals,
      timestamp: Date.now()
    });
  }

  /**
   * Update agent mandate (simplified)
   */
  updateAgentMandate(agentId: string, mandate: string): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.send('agent:mandate:update', {
      agentId,
      mandate,
      timestamp: Date.now()
    });
  }

  /**
   * Set up Socket.IO event listeners for simplified goal updates
   */
  private setupEventListeners(): void {
    if (!this.socketService) return;

    // Agent state update (includes goals and mandate)
    this.socketService.on('agent:state:update', (data: AgentStateUpdateEvent) => {
      console.log('[GoalSocketService] Received agent state update:', data);
      
      // Update agent state in Redux store
      if (data.state && data.agentId) {
        store.dispatch({
          type: 'agents/updateAgentState',
          payload: {
            agentId: data.agentId,
            state: data.state,
            timestamp: data.timestamp
          }
        });
      }
    });

    // Goals updated
    this.socketService.on('agent:goals:updated', (data: { agentId: string; goals: string; timestamp: number }) => {
      console.log('[GoalSocketService] Received goals updated event:', data);
      
      store.dispatch({
        type: 'agents/updateAgentGoals',
        payload: {
          agentId: data.agentId,
          goals: data.goals,
          timestamp: data.timestamp
        }
      });
    });

    // Mandate updated
    this.socketService.on('agent:mandate:updated', (data: { agentId: string; mandate: string; timestamp: number }) => {
      console.log('[GoalSocketService] Received mandate updated event:', data);
      
      store.dispatch({
        type: 'agents/updateAgentMandate',
        payload: {
          agentId: data.agentId,
          mandate: data.mandate,
          timestamp: data.timestamp
        }
      });
    });

    // Action executed (related to goals)
    this.socketService.on('agent:action:executed', (data: { agentId: string; action: string; timestamp: number }) => {
      console.log('[GoalSocketService] Received action executed event:', data);
      
      store.dispatch({
        type: 'agents/updateAgentLastAction',
        payload: {
          agentId: data.agentId,
          lastAction: data.action,
          timestamp: data.timestamp
        }
      });
    });

    // Response sent (related to goals/conversation)
    this.socketService.on('agent:message:sent', (data: { agentId: string; response: string; timestamp: number }) => {
      console.log('[GoalSocketService] Received message sent event:', data);
      
      store.dispatch({
        type: 'agents/updateAgentResponse',
        payload: {
          agentId: data.agentId,
          response: data.response,
          timestamp: data.timestamp
        }
      });
    });
  }

  /**
   * Remove Socket.IO event listeners
   */
  private removeEventListeners(): void {
    if (!this.socketService) return;

    this.socketService.off('agent:state:update');
    this.socketService.off('agent:goals:updated');
    this.socketService.off('agent:mandate:updated');
    this.socketService.off('agent:action:executed');
    this.socketService.off('agent:message:sent');
  }

  /**
   * Check if subscribed to goals for an agent
   */
  isSubscribedToAgent(agentId: string): boolean {
    return this.currentAgentId === agentId && this.isSubscribed;
  }

  /**
   * Get current subscribed agent ID
   */
  getCurrentAgentId(): string | null {
    return this.currentAgentId;
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    this.unsubscribeFromGoals();
    this.removeEventListeners();
  }
}

// Singleton instance
let goalSocketServiceInstance: GoalSocketService | null = null;

export const initializeGoalSocketService = (): GoalSocketService => {
  if (!goalSocketServiceInstance) {
    goalSocketServiceInstance = new GoalSocketService();
  }
  return goalSocketServiceInstance;
};

export const getGoalSocketService = (): GoalSocketService | null => {
  return goalSocketServiceInstance;
};

export default GoalSocketService;
import { getSocketService } from './socketService';
import type { Goal, GoalHierarchy, GoalUpdateEvent, GoalHierarchyEvent } from '../types/goals';
import { store } from '../store';

/**
 * Goal Socket Service - Handles real-time goal updates via Socket.IO
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

    // Subscribe to goal events
    this.socketService.subscribeToGoals(agentId);
    
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

    this.socketService.unsubscribeFromGoals(this.currentAgentId);
    this.removeEventListeners();
    this.isSubscribed = false;
    this.currentAgentId = null;

    console.log('[GoalSocketService] Unsubscribed from goals');
  }

  /**
   * Request goal hierarchy for an agent
   */
  requestGoalHierarchy(agentId: string): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.requestGoalHierarchy(agentId);
  }

  /**
   * Create a new goal
   */
  createGoal(agentId: string, goal: Omit<Goal, 'id' | 'createdAt'>): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.createGoal(agentId, goal);
  }

  /**
   * Update an existing goal
   */
  updateGoal(agentId: string, goalId: string, updates: Partial<Goal>): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.updateGoal(agentId, goalId, updates);
  }

  /**
   * Delete a goal
   */
  deleteGoal(agentId: string, goalId: string): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.deleteGoal(agentId, goalId);
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(agentId: string, goalId: string, progress: number): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.updateGoalProgress(agentId, goalId, progress);
  }

  /**
   * Complete a milestone
   */
  completeMilestone(agentId: string, goalId: string, milestoneId: string): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.completeMilestone(agentId, goalId, milestoneId);
  }

  /**
   * Reorder goals
   */
  reorderGoals(agentId: string, goalOrder: { goalId: string; newParentId?: string; newIndex: number }[]): void {
    if (!this.socketService) {
      console.warn('[GoalSocketService] Socket service not available');
      return;
    }

    this.socketService.reorderGoals(agentId, goalOrder);
  }

  /**
   * Set up Socket.IO event listeners for goal updates
   */
  private setupEventListeners(): void {
    if (!this.socketService) return;

    // Goal hierarchy update
    this.socketService.on('goalHierarchyUpdate', (data: { agentId: string; hierarchy: GoalHierarchy }) => {
      console.log('[GoalSocketService] Received goal hierarchy update:', data);
      store.dispatch({
        type: 'goals/onHierarchyUpdate',
        payload: {
          agentId: data.agentId,
          hierarchy: data.hierarchy,
          timestamp: Date.now()
        }
      });
    });

    // Goal created
    this.socketService.on('goalCreated', (data: { agentId: string; goal: Goal }) => {
      console.log('[GoalSocketService] Received goal created event:', data);
      store.dispatch({
        type: 'goals/onGoalUpdate',
        payload: {
          agentId: data.agentId,
          goalId: data.goal.id,
          updateType: 'created' as const,
          goal: data.goal,
          timestamp: Date.now()
        }
      });
    });

    // Goal updated
    this.socketService.on('goalUpdated', (data: GoalUpdateEvent) => {
      console.log('[GoalSocketService] Received goal updated event:', data);
      store.dispatch({
        type: 'goals/onGoalUpdate',
        payload: {
          agentId: data.agentId,
          goalId: data.goalId,
          updateType: 'updated' as const,
          goal: data.goal,
          timestamp: data.timestamp
        }
      });
    });

    // Goal deleted
    this.socketService.on('goalDeleted', (data: { agentId: string; goalId: string }) => {
      console.log('[GoalSocketService] Received goal deleted event:', data);
      // Create a mock goal for the delete event
      const mockGoal: Goal = {
        id: data.goalId,
        type: 'operational',
        priority: 3,
        description: '',
        status: 'cancelled',
        dependencies: [],
        resources: { required: [], allocated: [], totalCost: 0 },
        progress: { current: 0, target: 0, percentage: 0, milestones: [], completedMilestones: [], lastUpdated: Date.now() },
        createdAt: 0,
        updatedAt: Date.now(),
        childGoals: [],
        tags: [],
        metadata: {},
        title: ''
      };

      store.dispatch({
        type: 'goals/onGoalUpdate',
        payload: {
          agentId: data.agentId,
          goalId: data.goalId,
          updateType: 'deleted' as const,
          goal: mockGoal,
          timestamp: Date.now()
        }
      });
    });

    // Goal progress updated
    this.socketService.on('goalProgressUpdated', (data: { agentId: string; goalId: string; progress: number; timestamp: number }) => {
      console.log('[GoalSocketService] Received goal progress updated event:', data);
      store.dispatch({
        type: 'goals/updateGoalProgress',
        payload: {
          goalId: data.goalId,
          progress: data.progress
        }
      });
    });

    // Milestone completed
    this.socketService.on('milestoneCompleted', (data: { agentId: string; goalId: string; milestoneId: string; timestamp: number }) => {
      console.log('[GoalSocketService] Received milestone completed event:', data);
      // This would typically update the milestone status in the goal
      // For now, we'll dispatch a goal update to refresh the data
      store.dispatch({
        type: 'goals/updateLocalGoal',
        payload: {
          goalId: data.goalId,
          updates: {
            progress: {
              ...{} as any, // Will be filled by the reducer
              lastUpdated: data.timestamp
            }
          }
        }
      });
    });

    // Goals reordered
    this.socketService.on('goalsReordered', (data: { agentId: string; goalOrder: { goalId: string; newParentId?: string; newIndex: number }[]; timestamp: number }) => {
      console.log('[GoalSocketService] Received goals reordered event:', data);
      // This would typically update the goal hierarchy structure
      // For now, we'll request a fresh hierarchy
      this.requestGoalHierarchy(data.agentId);
    });

    // Goal conflict detected
    this.socketService.on('goalConflictDetected', (data: { agentId: string; conflicts: any[]; timestamp: number }) => {
      console.log('[GoalSocketService] Received goal conflict detected event:', data);
      // Add conflicts to the store
      data.conflicts.forEach(conflict => {
        store.dispatch({
          type: 'goals/addConflict',
          payload: conflict
        });
      });
    });
  }

  /**
   * Remove Socket.IO event listeners
   */
  private removeEventListeners(): void {
    if (!this.socketService) return;

    this.socketService.off('goalHierarchyUpdate');
    this.socketService.off('goalCreated');
    this.socketService.off('goalUpdated');
    this.socketService.off('goalDeleted');
    this.socketService.off('goalProgressUpdated');
    this.socketService.off('milestoneCompleted');
    this.socketService.off('goalsReordered');
    this.socketService.off('goalConflictDetected');
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
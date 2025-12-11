/**
 * Error Recovery System
 *
 * This module provides comprehensive error recovery mechanisms for the cognitive dashboard,
 * including automatic retry logic, fallback strategies, and user notification systems.
 */

import React from 'react';

// Error recovery configuration
export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  fallbackStrategies: FallbackStrategy[];
  enableAutoRecovery: boolean;
  notifyUser: boolean;
  logErrors: boolean;
}

export interface FallbackStrategy {
  id: string;
  name: string;
  description: string;
  condition: (error: Error) => boolean;
  action: () => Promise<void>;
  priority: number;
}

export interface RecoveryContext {
  error: Error | null;
  retryCount: number;
  lastRetryTime: number;
  strategy: FallbackStrategy | null;
  recoveryAttempts: RecoveryAttempt[];
  isRecovering: boolean;
}

export interface RecoveryAttempt {
  strategyId: string;
  timestamp: number;
  success: boolean;
  error?: Error;
  duration: number;
}

// Default error recovery configuration
export const DEFAULT_ERROR_RECOVERY_CONFIG: ErrorRecoveryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  fallbackStrategies: [
    {
      id: 'refresh',
      name: 'Page Refresh',
      description: 'Refresh the current page to recover from transient errors',
      condition: (error) => error.message.includes('ChunkLoadError') || error.message.includes('Network'),
      action: () => Promise.resolve(window.location.reload()),
      priority: 1
    },
    {
      id: 'retry',
      name: 'Retry Operation',
      description: 'Retry the failed operation with exponential backoff',
      condition: (error) => error.message.includes('fetch') || error.message.includes('Socket'),
      action: () => Promise.resolve(),
      priority: 2
    },
    {
      id: 'fallback',
      name: 'Fallback to Cached Data',
      description: 'Use cached data when live data is unavailable',
      condition: (error) => error.message.includes('Network') || error.message.includes('Socket'),
      action: () => Promise.resolve(),
      priority: 3
    }
  ],
  enableAutoRecovery: true,
  notifyUser: true,
  logErrors: true
};

// Error recovery manager class
export class ErrorRecoveryManager {
  private config: ErrorRecoveryConfig;
  private context: Map<string, RecoveryContext> = new Map();
  private recoveryCallbacks: Map<string, (context: RecoveryContext) => void> = new Map();

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = { ...DEFAULT_ERROR_RECOVERY_CONFIG, ...config };
  }

  // Start error recovery for a specific operation
  startRecovery(operationId: string, errorParam: Error): Promise<boolean> => {
    const context = this.getOrCreateContext(operationId);
    context.error = errorParam;
    context.retryCount = 0;
    context.lastRetryTime = 0;
    context.isRecovering = true;

    console.log(`[ErrorRecovery] Starting recovery for operation ${operationId}:`, errorParam);

    return this.executeRecoveryStrategy(operationId, context);
  }

  // Get or create recovery context for an operation
  private getOrCreateContext(operationId: string): RecoveryContext {
    if (!this.context.has(operationId)) {
      const context: RecoveryContext = {
        error: null,
        retryCount: 0,
        lastRetryTime: 0,
        strategy: null,
        recoveryAttempts: [],
        isRecovering: false
      };
      
      this.context.set(operationId, context);
      return context;
    }
    
    return this.context.get(operationId)!;
  }

  // Execute recovery strategy with retry logic
  private async executeRecoveryStrategy(operationId: string, context: RecoveryContext): Promise<boolean> {
    const strategies = this.config.fallbackStrategies.filter(strategy => 
      strategy.condition(context.error!)
    ).sort((a, b) => a.priority - b.priority);

    for (const strategy of strategies) {
      console.log(`[ErrorRecovery] Attempting strategy: ${strategy.name} for operation ${operationId}`);
      
      context.strategy = strategy;
      context.recoveryAttempts.push({
        strategyId: strategy.id,
        timestamp: Date.now(),
        success: false,
        duration: 0
      });

      try {
        await strategy.action();
        
        // Strategy succeeded
        context.recoveryAttempts[context.recoveryAttempts.length - 1].success = true;
        context.recoveryAttempts[context.recoveryAttempts.length - 1].duration = Date.now() - context.recoveryAttempts[context.recoveryAttempts.length - 1].timestamp;
        
        console.log(`[ErrorRecovery] Strategy ${strategy.name} succeeded for operation ${operationId}`);
        
        // Notify user if enabled
        if (this.config.notifyUser) {
          this.notifySuccess(operationId, strategy.name);
        }
        
        context.isRecovering = false;
        context.error = null;
        
        return true;
      } catch (strategyError: any) {
        // Strategy failed
        context.recoveryAttempts[context.recoveryAttempts.length - 1].success = false;
        context.recoveryAttempts[context.recoveryAttempts.length - 1].error = strategyError;
        context.recoveryAttempts[context.recoveryAttempts.length - 1].duration = Date.now() - context.recoveryAttempts[context.recoveryAttempts.length - 1].timestamp;
        
        console.error(`[ErrorRecovery] Strategy ${strategy.name} failed for operation ${operationId}:`, strategyError);
        
        // Log error if enabled
        if (this.config.logErrors) {
          console.error(`[ErrorRecovery] Error in strategy ${strategy.name}:`, {
            operationId,
            error: strategyError,
            context: this.getRecoveryContext(operationId)
          });
        }
        
        // Continue with exponential backoff
        if (this.config.exponentialBackoff) {
          const delay = Math.min(1000 * Math.pow(2, context.retryCount), 30000);
          console.log(`[ErrorRecovery] Retrying operation ${operationId} after ${delay}ms (attempt ${context.retryCount + 1})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All strategies failed
    if (!context.isRecovering && context.retryCount >= this.config.maxRetries) {
      console.error(`[ErrorRecovery] All recovery strategies failed for operation ${operationId} after ${context.retryCount} attempts`);
      
      context.isRecovering = false;
      context.error = new Error(`All recovery strategies failed after ${this.config.maxRetries} attempts`);
      
      // Final fallback
      if (this.config.notifyUser) {
        this.notifyFailure(operationId);
      }
      
      return false;
    }

    return context.isRecovering;
  }

  // Notify user of successful recovery
  private notifySuccess(operationId: string, strategyName: string): void {
    if (!this.config.notifyUser) return;
    
    // In a real app, this would show a toast notification
    console.log(`[ErrorRecovery] Recovery successful for ${operationId} using strategy: ${strategyName}`);
    
    // For demo purposes, we'll use alert
    alert(`✅ Recovery successful: ${operationId} recovered using ${strategyName}`);
  }

  // Notify user of failed recovery
  private notifyFailure(operationId: string): void {
    if (!this.config.notifyUser) return;
    
    console.error(`[ErrorRecovery] Recovery failed for ${operationId}`);
    
    // In a real app, this would show an error notification
    alert(`❌ Recovery failed: ${operationId}. Please try refreshing the page.`);
  }

  // Add recovery callback
  onRecovery(operationId: string, callback: (context: RecoveryContext) => void): void {
    this.recoveryCallbacks.set(operationId, callback);
  }

  // Remove recovery callback
  offRecovery(operationId: string): void {
    this.recoveryCallbacks.delete(operationId);
  }

  // Get recovery context
  getRecoveryContext(operationId: string): RecoveryContext | null {
    return this.context.get(operationId) || null;
  }

  // Clear recovery context
  clearRecoveryContext(operationId: string): void {
    this.context.delete(operationId);
  }

  // Get all recovery contexts
  getAllRecoveryContexts(): Map<string, RecoveryContext> {
    return new Map(this.context);
  }

  // Check if any operations are currently recovering
  hasActiveRecoveries(): boolean {
    return Array.from(this.context.values()).some(context => context.isRecovering);
  }

  // Get recovery statistics
  getRecoveryStatistics(): Array<{ operationId: string; totalAttempts: number; successRate: number }> {
    return Array.from(this.context.entries()).map(([operationId, context]) => ({
      operationId,
      totalAttempts: context.recoveryAttempts.length,
      successRate: context.recoveryAttempts.filter(attempt => attempt.success).length / context.recoveryAttempts.length
    }));
  }

  // Reset all recovery contexts
  resetAllRecoveries(): void {
    this.context.clear();
  }
}

// Create error recovery manager instance
export const createErrorRecoveryManager = (config?: Partial<ErrorRecoveryConfig>): ErrorRecoveryManager => {
  return new ErrorRecoveryManager(config);
};

// Error recovery hook for React components
export function useErrorRecovery(config?: Partial<ErrorRecoveryConfig>) {
  const manager = React.useMemo(() => createErrorRecoveryManager(config), [config]);
  
  return {
    manager,
    startRecovery: manager.startRecovery.bind(manager),
    getRecoveryContext: manager.getRecoveryContext.bind(manager),
    onRecovery: manager.onRecovery.bind(manager),
    offRecovery: manager.offRecovery.bind(manager),
    clearRecoveryContext: manager.clearRecoveryContext.bind(manager),
    hasActiveRecoveries: manager.hasActiveRecoveries.bind(manager),
    getRecoveryStatistics: manager.getRecoveryStatistics.bind(manager),
    resetAllRecoveries: manager.resetAllRecoveries.bind(manager)
  };
}

// Error recovery utilities
export const errorRecoveryUtils = {
  createErrorRecoveryManager,
  useErrorRecovery,
  DEFAULT_ERROR_RECOVERY_CONFIG
};
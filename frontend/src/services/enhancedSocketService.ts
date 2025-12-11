/**
 * Enhanced Socket.IO Service for Live Data Streaming
 *
 * This service provides comprehensive real-time data streaming for all cognitive components
 * including agent states, personality traits, memory systems, goals, social relationships,
 * skills progression, and performance metrics.
 */

import { io, Socket } from 'socket.io-client';
import type {
  AgentState,
  AgentStateUpdateEvent,
  AgentConnectionEvent,
  PersonalityTraitUpdateEvent,
  PersonalityEmotionEvent,
  PersonalityMoodEvent,
  PersonalityEvolutionEvent,
  MemoryUpdateEvent,
  MemoryConsolidationEvent,
  GoalUpdateEvent,
  GoalHierarchyEvent,
  GoalProgressEvent,
  SocialDataUpdateEvent,
  SocialNetworkUpdateEvent,
  SocialInteractionEvent,
  SkillDataUpdateEvent,
  SkillExperienceEvent,
  SkillMilestoneEvent,
  SkillSynergyEvent,
  PerformanceMetricsUpdateEvent,
  PerformanceAlertEvent,
  PerformanceAnomalyEvent,
  SystemStatusUpdateEvent,
  SystemErrorEvent,
  ConnectionStatusEvent
} from '../types/socketEvents';

// Configuration interface
export interface EnhancedSocketConfig {
  url: string;
  autoConnect: boolean;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
  timeout: number;
  transports: ('polling' | 'websocket')[];
  forceNew: boolean;
  enablePerformanceOptimization: boolean;
  throttleInterval: number;
  maxBufferSize: number;
  enableValidation: boolean;
  enableBackpressure: boolean;
}

// Event handler interface
export interface SocketEventHandlers {
  // Agent events
  onAgentStateUpdate?: (data: AgentStateUpdateEvent) => void;
  onAgentConnected?: (data: AgentConnectionEvent) => void;
  onAgentDisconnected?: (data: AgentConnectionEvent) => void;
  
  // Personality events
  onPersonalityTraitUpdate?: (data: PersonalityTraitUpdateEvent) => void;
  onPersonalityEmotionUpdate?: (data: PersonalityEmotionEvent) => void;
  onPersonalityMoodUpdate?: (data: PersonalityMoodEvent) => void;
  onPersonalityEvolution?: (data: PersonalityEvolutionEvent) => void;
  
  // Memory events
  onMemorySemanticUpdate?: (data: MemoryUpdateEvent) => void;
  onMemoryEpisodicUpdate?: (data: MemoryUpdateEvent) => void;
  onMemoryProceduralUpdate?: (data: MemoryUpdateEvent) => void;
  onMemoryConsolidation?: (data: MemoryConsolidationEvent) => void;
  
  // Goal events
  onGoalStrategicUpdate?: (data: GoalUpdateEvent) => void;
  onGoalTacticalUpdate?: (data: GoalUpdateEvent) => void;
  onGoalOperationalUpdate?: (data: GoalUpdateEvent) => void;
  onGoalProgress?: (data: GoalProgressEvent) => void;
  onGoalHierarchy?: (data: GoalHierarchyEvent) => void;
  
  // Social events
  onSocialRelationshipUpdate?: (data: SocialDataUpdateEvent) => void;
  onSocialInteraction?: (data: SocialInteractionEvent) => void;
  onSocialNetworkUpdate?: (data: SocialNetworkUpdateEvent) => void;
  
  // Skill events
  onSkillProgressUpdate?: (data: SkillDataUpdateEvent) => void;
  onSkillExperience?: (data: SkillExperienceEvent) => void;
  onSkillSynergy?: (data: SkillSynergyEvent) => void;
  onSkillMilestone?: (data: SkillMilestoneEvent) => void;
  
  // Performance events
  onPerformanceMetricsUpdate?: (data: PerformanceMetricsUpdateEvent) => void;
  onPerformanceAlert?: (data: PerformanceAlertEvent) => void;
  onPerformanceAnomaly?: (data: PerformanceAnomalyEvent) => void;
  
  // System events
  onSystemStatusUpdate?: (data: SystemStatusUpdateEvent) => void;
  onSystemError?: (data: SystemErrorEvent) => void;
  onConnectionStatus?: (data: ConnectionStatusEvent) => void;
}

// Performance optimization interface
export interface PerformanceMetrics {
  eventsPerSecond: number;
  bufferSize: number;
  processingLatency: number;
  memoryUsage: number;
  droppedEvents: number;
  lastOptimization: number;
}

export class EnhancedSocketService {
  private socket: Socket | null = null;
  private config: EnhancedSocketConfig;
  private handlers: SocketEventHandlers = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private lastPing = 0;
  
  // Performance optimization
  private eventBuffer: Map<string, any[]> = new Map();
  private throttleTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private performanceMetrics: PerformanceMetrics = {
    eventsPerSecond: 0,
    bufferSize: 0,
    processingLatency: 0,
    memoryUsage: 0,
    droppedEvents: 0,
    lastOptimization: Date.now()
  };
  
  // Validation
  private eventValidators: Map<string, (data: any) => boolean> = new Map();
  
  // Backpressure handling
  private backpressureThreshold = 1000;
  private isBackpressureActive = false;
  
  constructor(config: Partial<EnhancedSocketConfig> = {}) {
    this.config = {
      url: (import.meta.env?.VITE_SOCKET_URL as string) || 'http://localhost:3001',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: false,
      enablePerformanceOptimization: true,
      throttleInterval: 100,
      maxBufferSize: 10000,
      enableValidation: true,
      enableBackpressure: true,
      ...config
    };
    
    this.initializeValidators();
  }
  
  /**
   * Initialize event validators for type safety
   */
  private initializeValidators(): void {
    // Agent event validators
    this.eventValidators.set('agent:state:update', (data: AgentStateUpdateEvent) => {
      return data && typeof data.agentId === 'string' && data.state && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('agent:connected', (data: any) => {
      return data && typeof data.agentId === 'string' && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('agent:disconnected', (data: any) => {
      return data && typeof data.agentId === 'string' && typeof data.timestamp === 'number';
    });
    
    // Personality event validators
    this.eventValidators.set('personality:trait:update', (data: PersonalityTraitUpdateEvent) => {
      return data && typeof data.agentId === 'string' && data.traits && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('personality:emotion:update', (data: any) => {
      return data && typeof data.agentId === 'string' && typeof data.emotion === 'string' && 
             typeof data.intensity === 'number' && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('personality:mood:update', (data: any) => {
      return data && typeof data.agentId === 'string' && typeof data.mood === 'string' && 
             typeof data.timestamp === 'number';
    });
    
    // Memory event validators
    this.eventValidators.set('memory:semantic:update', (data: MemoryUpdateEvent) => {
      return data && typeof data.agentId === 'string' && data.memoryType === 'semantic' && 
             typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('memory:episodic:update', (data: MemoryUpdateEvent) => {
      return data && typeof data.agentId === 'string' && data.memoryType === 'episodic' && 
             typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('memory:procedural:update', (data: MemoryUpdateEvent) => {
      return data && typeof data.agentId === 'string' && data.memoryType === 'procedural' && 
             typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('memory:consolidation:event', (data: MemoryConsolidationEvent) => {
      return data && typeof data.agentId === 'string' && data.consolidationId && typeof data.timestamp === 'number' ? true : false;
    });
    
    // Goal event validators
    this.eventValidators.set('goal:strategic:update', (data: GoalUpdateEvent) => {
      return data && typeof data.goalId === 'string' && data.goal && data.goal.type === 'strategic';
    });
    
    this.eventValidators.set('goal:tactical:update', (data: GoalUpdateEvent) => {
      return data && typeof data.goalId === 'string' && data.goal && data.goal.type === 'tactical';
    });
    
    this.eventValidators.set('goal:operational:update', (data: GoalUpdateEvent) => {
      return data && typeof data.goalId === 'string' && data.goal && data.goal.type === 'operational';
    });
    
    this.eventValidators.set('goal:progress:update', (data: GoalProgressEvent) => {
      return data && typeof data.goalId === 'string' && typeof data.progress === 'number' && 
             typeof data.timestamp === 'number';
    });
    
    // Social event validators
    this.eventValidators.set('social:relationship:update', (data: SocialDataUpdateEvent) => {
      return data && typeof data.agentId === 'string' && data.type === 'relationship_update' && 
             typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('social:interaction:event', (data: SocialInteractionEvent) => {
      return data && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('social:network:update', (data: SocialNetworkUpdateEvent) => {
      return data && data.changes && typeof data.timestamp === 'number';
    });
    
    // Skill event validators
    this.eventValidators.set('skill:progress:update', (data: SkillDataUpdateEvent) => {
      return data && typeof data.skillId === 'string' && data.type && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('skill:experience:event', (data: SkillExperienceEvent) => {
      return data && typeof data.skillId === 'string' && data.experience && data.impact && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('skill:synergy:update', (data: SkillSynergyEvent) => {
      return data && data.synergy && data.transferEvent && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('skill:milestone:event', (data: SkillMilestoneEvent) => {
      return data && typeof data.skillId === 'string' && data.milestone && data.abilities && typeof data.timestamp === 'number';
    });
    
    // Performance event validators
    this.eventValidators.set('performance:metrics:update', (data: PerformanceMetricsUpdateEvent) => {
      return data && typeof data.agentId === 'string' && data.metrics && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('performance:alert:event', (data: PerformanceAlertEvent) => {
      return data && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('performance:anomaly:detect', (data: PerformanceAnomalyEvent) => {
      return data && typeof data.timestamp === 'number';
    });
    
    // System event validators
    this.eventValidators.set('system:status:update', (data: SystemStatusUpdateEvent) => {
      return data && typeof data.timestamp === 'number';
    });
    
    this.eventValidators.set('system:error:event', (data: SystemErrorEvent) => {
      return data && typeof data.timestamp === 'number';
    });
  }
  
  /**
   * Connect to Socket.IO server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }
      
      try {
        this.socket = io(this.config.url, {
          autoConnect: this.config.autoConnect,
          reconnection: this.config.reconnection,
          reconnectionAttempts: this.config.reconnectionAttempts,
          reconnectionDelay: this.config.reconnectionDelay,
          reconnectionDelayMax: this.config.reconnectionDelayMax,
          timeout: this.config.timeout,
          transports: this.config.transports,
          forceNew: this.config.forceNew
        });
        
        this.setupEventListeners();
        
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionStatus('connected', 'Successfully connected to server');
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          this.isConnected = false;
          this.notifyConnectionStatus('error', `Connection error: ${error.message}`);
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.notifyConnectionStatus('disconnected', 'Disconnected from server');
    }
    
    // Clear all throttle timers
    this.throttleTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.clear();
    
    // Clear event buffer
    this.eventBuffer.clear();
  }
  
  /**
   * Set event handlers
   */
  setHandlers(handlers: SocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }
  
  /**
   * Setup event listeners for all cognitive components
   */
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    // Agent events
    this.socket.on('agent:state:update', (data: AgentStateUpdateEvent) => {
      this.handleEvent('agent:state:update', data, this.handlers.onAgentStateUpdate);
    });
    
    this.socket.on('agent:connected', (data: AgentConnectionEvent) => {
      this.handleEvent('agent:connected', data, this.handlers.onAgentConnected);
    });
    
    this.socket.on('agent:disconnected', (data: AgentConnectionEvent) => {
      this.handleEvent('agent:disconnected', data, this.handlers.onAgentDisconnected);
    });
    
    // Personality events
    this.socket.on('personality:trait:update', (data: PersonalityTraitUpdateEvent) => {
      this.handleEvent('personality:trait:update', data, this.handlers.onPersonalityTraitUpdate);
    });
    
    this.socket.on('personality:emotion:update', (data: PersonalityEmotionEvent) => {
      this.handleEvent('personality:emotion:update', data, this.handlers.onPersonalityEmotionUpdate);
    });
    
    this.socket.on('personality:mood:update', (data: PersonalityMoodEvent) => {
      this.handleEvent('personality:mood:update', data, this.handlers.onPersonalityMoodUpdate);
    });
    
    this.socket.on('personality:evolution', (data: PersonalityEvolutionEvent) => {
      this.handleEvent('personality:evolution', data, this.handlers.onPersonalityEvolution);
    });
    
    // Memory events
    this.socket.on('memory:semantic:update', (data: MemoryUpdateEvent) => {
      this.handleEvent('memory:semantic:update', data, this.handlers.onMemorySemanticUpdate);
    });
    
    this.socket.on('memory:episodic:update', (data: MemoryUpdateEvent) => {
      this.handleEvent('memory:episodic:update', data, this.handlers.onMemoryEpisodicUpdate);
    });
    
    this.socket.on('memory:procedural:update', (data: MemoryUpdateEvent) => {
      this.handleEvent('memory:procedural:update', data, this.handlers.onMemoryProceduralUpdate);
    });
    
    this.socket.on('memory:consolidation:event', (data: MemoryConsolidationEvent) => {
      this.handleEvent('memory:consolidation:event', data, this.handlers.onMemoryConsolidation);
    });
    
    // Goal events
    this.socket.on('goal:strategic:update', (data: GoalUpdateEvent) => {
      this.handleEvent('goal:strategic:update', data, this.handlers.onGoalStrategicUpdate);
    });
    
    this.socket.on('goal:tactical:update', (data: GoalUpdateEvent) => {
      this.handleEvent('goal:tactical:update', data, this.handlers.onGoalTacticalUpdate);
    });
    
    this.socket.on('goal:operational:update', (data: GoalUpdateEvent) => {
      this.handleEvent('goal:operational:update', data, this.handlers.onGoalOperationalUpdate);
    });
    
    this.socket.on('goal:progress:update', (data: GoalProgressEvent) => {
      this.handleEvent('goal:progress:update', data, this.handlers.onGoalProgress);
    });
    
    this.socket.on('goal:hierarchy', (data: GoalHierarchyEvent) => {
      this.handleEvent('goal:hierarchy', data, this.handlers.onGoalHierarchy);
    });
    
    // Social events
    this.socket.on('social:relationship:update', (data: SocialDataUpdateEvent) => {
      this.handleEvent('social:relationship:update', data, this.handlers.onSocialRelationshipUpdate);
    });
    
    this.socket.on('social:interaction:event', (data: SocialInteractionEvent) => {
      this.handleEvent('social:interaction:event', data, this.handlers.onSocialInteraction);
    });
    
    this.socket.on('social:network:update', (data: SocialNetworkUpdateEvent) => {
      this.handleEvent('social:network:update', data, this.handlers.onSocialNetworkUpdate);
    });
    
    // Skill events
    this.socket.on('skill:progress:update', (data: SkillDataUpdateEvent) => {
      this.handleEvent('skill:progress:update', data, this.handlers.onSkillProgressUpdate);
    });
    
    this.socket.on('skill:experience:event', (data: SkillExperienceEvent) => {
      this.handleEvent('skill:experience:event', data, this.handlers.onSkillExperience);
    });
    
    this.socket.on('skill:synergy:update', (data: SkillSynergyEvent) => {
      this.handleEvent('skill:synergy:update', data, this.handlers.onSkillSynergy);
    });
    
    this.socket.on('skill:milestone:event', (data: SkillMilestoneEvent) => {
      this.handleEvent('skill:milestone:event', data, this.handlers.onSkillMilestone);
    });
    
    // Performance events
    this.socket.on('performance:metrics:update', (data: PerformanceMetricsUpdateEvent) => {
      this.handleEvent('performance:metrics:update', data, this.handlers.onPerformanceMetricsUpdate);
    });
    
    this.socket.on('performance:alert:event', (data: PerformanceAlertEvent) => {
      this.handleEvent('performance:alert:event', data, this.handlers.onPerformanceAlert);
    });
    
    this.socket.on('performance:anomaly:detect', (data: PerformanceAnomalyEvent) => {
      this.handleEvent('performance:anomaly:detect', data, this.handlers.onPerformanceAnomaly);
    });
    
    // System events
    this.socket.on('system:status:update', (data: SystemStatusUpdateEvent) => {
      this.handleEvent('system:status:update', data, this.handlers.onSystemStatusUpdate);
    });
    
    this.socket.on('system:error:event', (data: SystemErrorEvent) => {
      this.handleEvent('system:error:event', data, this.handlers.onSystemError);
    });
    
    // Connection events
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.notifyConnectionStatus('disconnected', 'Lost connection to server');
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionStatus('connected', `Reconnected after ${attemptNumber} attempts`);
    });
    
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.reconnectAttempts = attemptNumber;
      this.notifyConnectionStatus('reconnecting', `Attempting to reconnect (${attemptNumber}/${this.config.reconnectionAttempts})`);
    });
    
    this.socket.on('reconnect_failed', () => {
      this.notifyConnectionStatus('failed', 'Failed to reconnect to server');
    });
  }
  
  /**
   * Handle incoming events with validation, throttling, and backpressure
   */
  private handleEvent<T>(eventType: string, data: T, handler?: (data: T) => void): void {
    const startTime = Date.now();
    
    try {
      // Validate event data if enabled
      if (this.config.enableValidation && !this.validateEvent(eventType, data)) {
        console.warn(`[EnhancedSocketService] Invalid event data for ${eventType}:`, data);
        this.performanceMetrics.droppedEvents++;
        return;
      }
      
      // Check backpressure
      if (this.config.enableBackpressure && this.isBackpressureActive) {
        this.bufferEvent(eventType, data, handler);
        return;
      }
      
      // Apply throttling if enabled
      if (this.config.enablePerformanceOptimization) {
        this.throttledHandleEvent(eventType, data, handler);
      } else {
        this.processEvent(eventType, data, handler);
      }
      
      // Update performance metrics
      this.performanceMetrics.processingLatency = Date.now() - startTime;
      this.performanceMetrics.eventsPerSecond = this.calculateEventsPerSecond();
      
    } catch (error) {
      console.error(`[EnhancedSocketService] Error handling event ${eventType}:`, error);
      this.performanceMetrics.droppedEvents++;
    }
  }
  
  /**
   * Validate event data
   */
  private validateEvent(eventType: string, data: any): boolean {
    const validator = this.eventValidators.get(eventType);
    if (!validator) {
      console.warn(`[EnhancedSocketService] No validator found for event type: ${eventType}`);
      return true; // Allow events without validators
    }
    
    try {
      return validator(data);
    } catch (error) {
      console.error(`[EnhancedSocketService] Validation error for ${eventType}:`, error);
      return false;
    }
  }
  
  /**
   * Buffer events during backpressure
   */
  private bufferEvent<T>(eventType: string, data: T, handler?: (data: T) => void): void {
    if (!this.eventBuffer.has(eventType)) {
      this.eventBuffer.set(eventType, []);
    }
    
    const buffer = this.eventBuffer.get(eventType)!;
    buffer.push({ data, handler, timestamp: Date.now() });
    
    // Limit buffer size
    if (buffer.length > this.config.maxBufferSize) {
      buffer.shift(); // Remove oldest event
      this.performanceMetrics.droppedEvents++;
    }
    
    this.performanceMetrics.bufferSize = Array.from(this.eventBuffer.values()).reduce((sum, buf) => sum + buf.length, 0);
  }
  
  /**
   * Process buffered events
   */
  private processBufferedEvents(): void {
    this.eventBuffer.forEach((buffer, eventType) => {
      while (buffer.length > 0) {
        const event = buffer.shift();
        if (event) {
          this.processEvent(eventType, event.data, event.handler);
        }
      }
    });
    
    this.eventBuffer.clear();
    this.performanceMetrics.bufferSize = 0;
  }
  
  /**
   * Throttled event handling
   */
  private throttledHandleEvent<T>(eventType: string, data: T, handler?: (data: T) => void): void {
    // Clear existing timer for this event type
    const existingTimer = this.throttleTimers.get(eventType);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.processEvent(eventType, data, handler);
      this.throttleTimers.delete(eventType);
    }, this.config.throttleInterval);
    
    this.throttleTimers.set(eventType, timer);
  }
  
  /**
   * Process event and call handler
   */
  private processEvent<T>(eventType: string, data: T, handler?: (data: T) => void): void {
    if (handler) {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EnhancedSocketService] Error in event handler for ${eventType}:`, error);
      }
    }
  }
  
  /**
   * Calculate events per second
   */
  private calculateEventsPerSecond(): number {
    // This is a simplified calculation - in production, you'd want a more sophisticated approach
    return this.performanceMetrics.eventsPerSecond * 0.9 + 0.1; // Exponential moving average
  }
  
  /**
   * Notify connection status
   */
  private notifyConnectionStatus(status: 'disconnected' | 'connected' | 'reconnecting' | 'failed' | 'error', message: string): void {
    if (this.handlers.onConnectionStatus) {
      this.handlers.onConnectionStatus({
        status,
        message,
        timestamp: Date.now(),
        reconnectAttempts: this.reconnectAttempts,
        lastPing: this.lastPing
      });
    }
  }
  
  /**
   * Subscribe to agent-specific events
   */
  subscribeToAgent(agentId: string): void {
    if (this.socket) {
      this.socket.emit('agent:subscribe', { agentId });
    }
  }
  
  /**
   * Unsubscribe from agent-specific events
   */
  unsubscribeFromAgent(agentId: string): void {
    if (this.socket) {
      this.socket.emit('agent:unsubscribe', { agentId });
    }
  }
  
  /**
   * Subscribe to cognitive component events
   */
  subscribeToComponent(component: 'personality' | 'memory' | 'goals' | 'social' | 'skills' | 'performance'): void {
    if (this.socket) {
      this.socket.emit('component:subscribe', { component });
    }
  }
  
  /**
   * Unsubscribe from cognitive component events
   */
  unsubscribeFromComponent(component: 'personality' | 'memory' | 'goals' | 'social' | 'skills' | 'performance'): void {
    if (this.socket) {
      this.socket.emit('component:unsubscribe', { component });
    }
  }
  
  /**
   * Send custom event to server
   */
  sendEvent(eventType: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventType, data);
    } else {
      console.warn(`[EnhancedSocketService] Cannot send event ${eventType}: not connected`);
    }
  }
  
  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    lastPing: number;
    performanceMetrics: PerformanceMetrics;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastPing: this.lastPing,
      performanceMetrics: this.performanceMetrics
    };
  }
  
  /**
   * Enable/disable performance optimization
   */
  setPerformanceOptimization(enabled: boolean): void {
    this.config.enablePerformanceOptimization = enabled;
    
    if (!enabled) {
      // Clear all throttle timers
      this.throttleTimers.forEach(timer => clearTimeout(timer));
      this.throttleTimers.clear();
      
      // Process any buffered events
      this.processBufferedEvents();
    }
  }
  
  /**
   * Set throttle interval
   */
  setThrottleInterval(interval: number): void {
    this.config.throttleInterval = interval;
  }
  
  /**
   * Enable/disable backpressure handling
   */
  setBackpressureHandling(enabled: boolean): void {
    this.config.enableBackpressure = enabled;
    
    if (!enabled) {
      this.isBackpressureActive = false;
      this.processBufferedEvents();
    }
  }
  
  /**
   * Enable/disable event validation
   */
  setEventValidation(enabled: boolean): void {
    this.config.enableValidation = enabled;
  }
  
  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      eventsPerSecond: 0,
      bufferSize: 0,
      processingLatency: 0,
      memoryUsage: 0,
      droppedEvents: 0,
      lastOptimization: Date.now()
    };
  }
}

// Export singleton instance
export const enhancedSocketService = new EnhancedSocketService();

// Export types are already declared above
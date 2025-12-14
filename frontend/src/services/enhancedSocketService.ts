/**
 * Enhanced Socket.IO Service for Live Data Streaming
 *
 * This service provides comprehensive real-time data streaming for simplified agent components
 * including agent states, messages, and actions.
 */

import { io, Socket } from 'socket.io-client';
import type {
  AgentStateUpdateEvent,
  AgentConnectionEvent
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

// Simplified event handler interface
export interface SocketEventHandlers {
  // Agent events
  onAgentStateUpdate?: (data: AgentStateUpdateEvent) => void;
  onAgentConnected?: (data: AgentConnectionEvent) => void;
  onAgentDisconnected?: (data: AgentConnectionEvent) => void;
  
  // Message events
  onAgentMessageSent?: (data: any) => void;
  
  // Action events
  onAgentActionExecuted?: (data: any) => void;
  
  // System events
  onSystemStatusUpdate?: (data: any) => void;
  onSystemError?: (data: any) => void;
  onConnectionStatus?: (data: any) => void;
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
    
    // Message event validators
    this.eventValidators.set('agent:message:sent', (data: any) => {
      return data && typeof data.agentId === 'string' && data.message && typeof data.timestamp === 'number';
    });
    
    // Action event validators
    this.eventValidators.set('agent:action:executed', (data: any) => {
      return data && typeof data.agentId === 'string' && data.action && typeof data.timestamp === 'number';
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
   * Setup event listeners for simplified agent components
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
    
    // Message events
    this.socket.on('agent:message:sent', (data: any) => {
      this.handleEvent('agent:message:sent', data, this.handlers.onAgentMessageSent);
    });
    
    // Action events
    this.socket.on('agent:action:executed', (data: any) => {
      this.handleEvent('agent:action:executed', data, this.handlers.onAgentActionExecuted);
    });
    
    // System events
    this.socket.on('system:status:update', (data: any) => {
      this.handleEvent('system:status:update', data, this.handlers.onSystemStatusUpdate);
    });
    
    this.socket.on('system:error:event', (data: any) => {
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
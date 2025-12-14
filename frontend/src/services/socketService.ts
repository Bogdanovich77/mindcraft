import { io, Socket } from 'socket.io-client';
import type { AgentUpdateEvent, AgentListEvent, SystemStatusEvent } from '../types/agent';
import type { AgentStateUpdateEvent } from '../types/socketEvents';
import { StreamingService, streamingService } from './streamingService';
import type { StreamingConfig } from './streamingService';
import { validateEvent, sanitizeEvent, processEvent } from '../utils/eventValidation';

export interface SocketServiceConfig {
  url: string;
  options?: {
    transports?: ('polling' | 'websocket')[];
    timeout?: number;
    forceNew?: boolean;
    reconnection?: boolean;
    reconnectionDelay?: number;
    reconnectionAttempts?: number;
  };
}

export interface ConnectionMetrics {
  connectedAt: number | null;
  lastDisconnected: number | null;
  totalReconnectAttempts: number;
  connectionUptime: number;
  averageLatency: number;
  lastPingTime: number | null;
}

export interface SocketServiceStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  lastError: string | null;
  metrics: ConnectionMetrics;
}

class SocketService {
  private socket: Socket | null = null;
  private config: SocketServiceConfig;
  private reconnectTimeout: number | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connectionAttempts: number = 0;
  private lastError: string | null = null;
  private metrics: ConnectionMetrics = {
    connectedAt: null,
    lastDisconnected: null,
    totalReconnectAttempts: 0,
    connectionUptime: 0,
    averageLatency: 0,
    lastPingTime: null,
  };
  private latencyHistory: number[] = [];
  private statusChangeCallbacks: ((status: SocketServiceStatus) => void)[] = [];
  private latencyInterval: number | null = null;
  private streamingService: StreamingService | null = null;
  private streamingEnabled: boolean = false;
  private isConnecting: boolean = false;
  private connectionLocks: Map<string, boolean> = new Map();
  private eventHandlerRefs: Map<string, Function[]> = new Map();
  private pingTimeouts: Map<number, ReturnType<typeof setTimeout>> = new Map();

  constructor(config: SocketServiceConfig) {
    this.config = {
      options: {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        ...config.options,
      },
      ...config,
    };
  }

  async connect(enableStreaming: boolean = false): Promise<void> {
    // Prevent concurrent connection attempts
    if (this.isConnecting) {
      console.log('[SocketService] Connection already in progress, skipping');
      return;
    }

    if (this.isConnected()) {
      console.log('[SocketService] Already connected');
      return;
    }

    this.isConnecting = true;
    const connectionId = Date.now().toString();
    this.connectionLocks.set(connectionId, true);

    return new Promise(async (resolve, reject) => {
      try {
        this.connectionAttempts++;
        console.log(`[SocketService] Connecting to ${this.config.url} (attempt ${this.connectionAttempts})`);
        this.lastError = null;
        this.streamingEnabled = enableStreaming;
        this.notifyStatusChange();
        
        // Clean up existing socket if any
        if (this.socket) {
          this.cleanupSocket();
        }
        
        this.socket = io(this.config.url, {
          ...this.config.options,
          reconnection: false, // Handle reconnection manually to prevent race conditions
        });

        this.setupEventHandlers();
        
        // Initialize streaming service if enabled
        if (enableStreaming) {
          try {
            await this.initializeStreamingService();
            console.log('[SocketService] Streaming service initialized');
          } catch (streamError) {
            console.warn('[SocketService] Failed to initialize streaming service:', streamError);
            // Continue without streaming - don't fail the connection
          }
        }
        
        this.socket.on('connect', () => {
          console.log(`[SocketService] Connected successfully on attempt ${this.connectionAttempts}`);
          this.metrics.connectedAt = Date.now();
          this.metrics.totalReconnectAttempts += this.connectionAttempts - 1;
          this.clearReconnectTimeout();
          this.connectionAttempts = 0;
          this.lastError = null;
          this.isConnecting = false;
          this.connectionLocks.delete(connectionId);
          this.notifyStatusChange();
          
          // Start periodic ping for latency monitoring
          this.startLatencyMonitoring();
          
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error(`[SocketService] Connection error on attempt ${this.connectionAttempts}:`, error);
          
          // Detailed error analysis
          let errorMessage = 'Unknown connection error';
          if (error.message) {
            if (error.message.includes('ECONNREFUSED')) {
              errorMessage = 'Backend server is not running or not accessible on port 8080';
            } else if (error.message.includes('timeout')) {
              errorMessage = 'Connection timeout - server may be overloaded or network issues';
            } else if (error.message.includes('WebSocket is closed')) {
              errorMessage = 'WebSocket connection failed - trying fallback transport';
            } else {
              errorMessage = `Connection failed: ${error.message}`;
            }
          }
          
          this.lastError = errorMessage;
          this.metrics.lastDisconnected = Date.now();
          this.isConnecting = false;
          this.connectionLocks.delete(connectionId);
          this.clearReconnectTimeout();
          this.notifyStatusChange();
          
          reject(new Error(errorMessage));
        });

      } catch (error) {
        console.error('[SocketService] Failed to create socket:', error);
        this.lastError = error instanceof Error ? error.message : 'Unknown socket error';
        this.isConnecting = false;
        this.connectionLocks.delete(connectionId);
        this.notifyStatusChange();
        reject(new Error(this.lastError));
      }
    });
  }

  disconnect(): void {
    if (this.streamingService) {
      this.streamingService.destroy();
      this.streamingService = null;
    }
    
    if (this.socket) {
      console.log('[SocketService] Disconnecting');
      this.clearReconnectTimeout();
      this.stopLatencyMonitoring();
      this.updateConnectionUptime();
      this.cleanupSocket();
      this.socket = null;
      this.metrics.connectedAt = null;
      this.isConnecting = false;
      this.notifyStatusChange();
    }
    
    this.streamingEnabled = false;
  }

  /**
   * Clean up socket event handlers to prevent memory leaks
   */
  private cleanupSocket(): void {
    if (!this.socket) return;

    // Remove all event handlers to prevent memory leaks
    this.eventHandlerRefs.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket?.off(event, handler as (...args: any[]) => void);
      });
    });
    this.eventHandlerRefs.clear();

    // Clear all ping timeouts
    this.pingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.pingTimeouts.clear();

    this.socket.disconnect();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    const disconnectHandler = (reason: string) => {
      console.log(`[SocketService] Disconnected: ${reason}`);
      this.metrics.lastDisconnected = Date.now();
      this.updateConnectionUptime();
      this.handleDisconnect(reason);
      
      // Disconnect streaming service
      if (this.streamingService) {
        this.streamingService.destroy();
        this.streamingService = null;
      }
    };

    this.socket.on('disconnect', disconnectHandler);
    this.eventHandlerRefs.set('disconnect', [disconnectHandler]);

    // Simplified event handlers for core functionality only
    this.setupSimplifiedEventHandlers();

    // Mindcraft specific events (legacy support)
    const agentsStatusHandler = (data: AgentListEvent) => {
      console.log('[SocketService] Received agents-status:', data);
      this.emit('agentList', data);
      this.emit('agents-status', data);
    };
    this.socket.on('agents-status', agentsStatusHandler);
    this.addEventHandler('agents-status', agentsStatusHandler);

    const stateUpdateHandler = (data: AgentUpdateEvent) => {
      console.log('[SocketService] Received agent update:', data);
      this.emit('agentUpdate', data);
    };
    this.socket.on('state-update', stateUpdateHandler);
    this.addEventHandler('state-update', stateUpdateHandler);

    const systemStatusHandler = (data: SystemStatusEvent) => {
      console.log('[SocketService] Received system status:', data);
      this.emit('systemStatus', data);
    };
    this.socket.on('system_status', systemStatusHandler);
    this.addEventHandler('system_status', systemStatusHandler);

    // Error handling
    const errorHandler = (error: any) => {
      console.error('[SocketService] Socket error:', error);
      this.lastError = `Socket error: ${error.message || 'Unknown socket error'}`;
      this.notifyStatusChange();
      this.emit('error', error);
    };
    this.socket.on('error', errorHandler);
    this.addEventHandler('error', errorHandler);
  }

  /**
   * Add event handler reference for cleanup
   */
  private addEventHandler(event: string, handler: Function): void {
    if (!this.eventHandlerRefs.has(event)) {
      this.eventHandlerRefs.set(event, []);
    }
    this.eventHandlerRefs.get(event)!.push(handler);
  }

  /**
   * Set up simplified event handlers for core functionality only
   */
  private setupSimplifiedEventHandlers(): void {
    if (!this.socket) return;

    // Core agent state events only - remove complex cognitive events
    const simplifiedEvents = [
      'agent:state:update', 
      'agent:connected', 
      'agent:disconnected',
      'agent:message:sent', 
      'agent:action:executed'
    ];

    simplifiedEvents.forEach(eventType => {
      const handler = (data: any) => this.handleSimplifiedEvent(eventType, data);
      this.socket?.on(eventType, handler);
      this.addEventHandler(eventType, handler);
    });

    // Remove complex cognitive event handlers
    this.removeComplexCognitiveEventHandlers();
  }

  /**
   * Remove complex cognitive event handlers that are no longer needed
   */
  private removeComplexCognitiveEventHandlers(): void {
    if (!this.socket) return;

    // List of complex cognitive events to remove
    const complexEvents = [
      'personality:trait:update',
      'memory:semantic:update',
      'memory:episodic:update',
      'goal:hierarchy:update',
      'goal:progress:update',
      'social:relationship:update',
      'social:interaction:event',
      'skill:progress:update',
      'performance:metrics:update',
      'performance:alert:event',
      'system:error:event'
    ];

    complexEvents.forEach(eventType => {
      this.socket?.off(eventType);
      console.log(`[SocketService] Removed complex cognitive event handler: ${eventType}`);
    });
  }

  /**
   * Handle simplified events with proper error handling and validation
   */
  private handleSimplifiedEvent(eventType: string, data: any): void {
    try {
      // Validate input data
      if (data === null || data === undefined) {
        console.warn(`[SocketService] Invalid simplified event data for ${eventType}: null/undefined`);
        return;
      }

      // Validate simplified event structure
      if (!this.validateSimplifiedEventData(eventType, data)) {
        console.warn(`[SocketService] Invalid simplified event structure for ${eventType}:`, data);
        return;
      }

      // Create SocketEvent object safely
      const event: any = {
        id: this.generateEventId(),
        type: eventType as any,
        timestamp: Date.now(),
        source: 'langgraph',
        data: this.sanitizeSimplifiedData(data)
      };

      // Emit to handlers with simplified data structure
      this.emit(eventType, data);
      this.emit('simplifiedEvent', event);

      console.log(`[SocketService] Processed simplified event: ${eventType}`, {
        agentId: data.agentId || 'unknown',
        timestamp: event.timestamp
      });

    } catch (error) {
      console.error('[SocketService] Error handling simplified event:', error);
    }
  }

  /**
   * Validate simplified event data structure
   */
  private validateSimplifiedEventData(eventType: string, data: any): boolean {
    switch (eventType) {
      case 'agent:state:update':
        return this.validateAgentStateUpdate(data);
      case 'agent:action:executed':
        return this.validateActionExecuted(data);
      case 'agent:message:sent':
        return this.validateMessageSent(data);
      case 'agent:connected':
      case 'agent:disconnected':
        return typeof data.agentId === 'string';
      default:
        return true; // Allow unknown events for forward compatibility
    }
  }

  /**
   * Validate agent state update event
   */
  private validateAgentStateUpdate(data: any): boolean {
    return (
      typeof data.agentId === 'string' &&
      typeof data.timestamp === 'number' &&
      // Check for the 7 core fields (allowing null/undefined for optional fields)
      (data.worldContext === undefined || typeof data.worldContext === 'object') &&
      (typeof data.personality === 'string') &&
      (typeof data.goals === 'string') &&
      (typeof data.mandate === 'string') &&
      (data.conversation === undefined || typeof data.conversation === 'object') &&
      (typeof data.lastAction === 'string') &&
      (typeof data.response === 'string')
    );
  }

  /**
   * Validate action executed event
   */
  private validateActionExecuted(data: any): boolean {
    return (
      typeof data.agentId === 'string' &&
      typeof data.action === 'string' &&
      typeof data.response === 'string' &&
      typeof data.timestamp === 'number'
    );
  }

  /**
   * Validate message sent event
   */
  private validateMessageSent(data: any): boolean {
    return (
      typeof data.agentId === 'string' &&
      typeof data.message === 'string' &&
      (data.target === undefined || data.target === null || typeof data.target === 'string') &&
      typeof data.timestamp === 'number'
    );
  }

  /**
   * Sanitize simplified event data
   */
  private sanitizeSimplifiedData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // For simplified events, only keep the essential fields
    const sanitized: any = {};
    
    // Always keep these core fields
    if (data.agentId) sanitized.agentId = String(data.agentId);
    if (data.timestamp) sanitized.timestamp = Number(data.timestamp);
    
    // Event-specific fields
    if (data.worldContext) sanitized.worldContext = this.sanitizeData(data.worldContext);
    if (typeof data.personality === 'string') sanitized.personality = data.personality.substring(0, 500);
    if (typeof data.goals === 'string') sanitized.goals = data.goals.substring(0, 500);
    if (typeof data.mandate === 'string') sanitized.mandate = data.mandate.substring(0, 500);
    if (data.conversation) sanitized.conversation = this.sanitizeData(data.conversation);
    if (typeof data.lastAction === 'string') sanitized.lastAction = data.lastAction.substring(0, 200);
    if (typeof data.response === 'string') sanitized.response = data.response.substring(0, 1000);
    if (typeof data.action === 'string') sanitized.action = data.action.substring(0, 200);
    if (typeof data.message === 'string') sanitized.message = data.message.substring(0, 1000);
    if (data.target !== undefined && data.target !== null) sanitized.target = String(data.target);
    
    return sanitized;
  }

  /**
   * Sanitize data to prevent prototype pollution and unsafe operations
   */
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
      }

      const sanitized: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key) && !key.startsWith('__') && key !== 'constructor' && key !== 'prototype') {
          sanitized[key] = this.sanitizeData(data[key]);
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Initialize the streaming service
   */
  private async initializeStreamingService(): Promise<void> {
    const environment = import.meta.env.MODE === 'development' ? 'development' : 'production';
    // Create a basic config
    const config = {
      enableAggregation: true,
      aggregationWindow: 1000,
      enableFiltering: true,
      enableCaching: true,
      cacheSize: 1000,
      cacheTimeout: 300000,
      enableTransformation: true,
      enableCompression: false,
      compressionThreshold: 1024,
      maxConcurrentStreams: 50,
      bufferSize: 100,
      flushInterval: 100
    };
    
    this.streamingService = new StreamingService(config);
    
    // Set up streaming event handlers
    this.setupStreamingEventHandlers();
  }

  /**
   * Set up streaming event handlers for simplified events
   */
  private setupStreamingEventHandlers(): void {
    if (!this.streamingService) return;

    // Only register handlers for simplified events - remove complex cognitive events
    const simplifiedEvents = [
      'agent:state:update',
      'agent:message:sent', 
      'agent:action:executed'
    ];

    simplifiedEvents.forEach(eventType => {
      streamingService.subscribe(eventType, (data: any) => {
        this.emit(`streaming:${eventType}`, data);
      });
    });

    console.log('[SocketService] Streaming handlers set up for simplified events only');
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleDisconnect(reason: string): void {
    this.clearReconnectTimeout();
    this.lastError = `Disconnected: ${reason}`;
    this.notifyStatusChange();

    // Don't attempt reconnection for intentional disconnections
    if (reason === 'io client disconnect') {
      console.log('[SocketService] Intentional disconnect');
      return;
    }

    // Schedule reconnection for unexpected disconnections
    if (this.config.options?.reconnection !== false) {
      this.scheduleReconnection();
    }
  }

  private scheduleReconnection(): void {
    // Prevent multiple reconnection schedules
    if (this.reconnectTimeout) {
      return;
    }

    const delay = this.calculateReconnectDelay();
    console.log(`[SocketService] Scheduling reconnection in ${delay}ms (attempt ${this.connectionAttempts + 1})`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      console.log(`[SocketService] Attempting reconnection (attempt ${this.connectionAttempts + 1})`);
      this.connect().catch((error) => {
        console.error('[SocketService] Reconnection failed:', error);
        // Schedule next reconnection attempt with exponential backoff
        if (this.connectionAttempts < (this.config.options?.reconnectionAttempts || 5)) {
          this.scheduleReconnection();
        } else {
          console.error('[SocketService] Maximum reconnection attempts reached');
          this.lastError = 'Maximum reconnection attempts reached';
          this.notifyStatusChange();
        }
      });
    }, delay);
  }

  private calculateReconnectDelay(): number {
    const baseDelay = this.config.options?.reconnectionDelay || 1000;
    const maxDelay = 30000; // 30 seconds max
    const maxAttempts = this.config.options?.reconnectionAttempts || 5;
    
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, Math.min(this.connectionAttempts, maxAttempts - 1));
    const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
    const delay = exponentialDelay + jitter;
    
    return Math.min(delay, maxDelay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.set(event, []);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SocketService] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send methods
  send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[SocketService] Cannot send message - not connected:', event, data);
    }
  }

  // Enhanced streaming methods
  subscribeToAgentData(agentId: string, dataTypes: string[] = []): void {
    if (this.streamingService) {
      // Only allow simplified event types
      const allowedTypes = [
        'agent:state:update',
        'agent:message:sent',
        'agent:action:executed'
      ];
      
      const filteredTypes = dataTypes.filter(type => allowedTypes.includes(type));
      
      if (filteredTypes.length !== dataTypes.length) {
        console.warn('[SocketService] Some data types filtered out - only simplified events allowed:', {
          requested: dataTypes,
          allowed: filteredTypes
        });
      }
      
      filteredTypes.forEach(dataType => {
        streamingService.subscribe(dataType, (data: any) => {
          this.emit(`streaming:${dataType}`, data);
        });
      });
    } else {
      console.warn('[SocketService] Streaming service not available for subscription');
    }
  }

  unsubscribeFromAgentData(agentId: string, dataTypes: string[] = []): void {
    if (this.streamingService) {
      dataTypes.forEach(dataType => {
        streamingService.deleteStream(dataType);
      });
    } else {
      console.warn('[SocketService] Streaming service not available for unsubscription');
    }
  }

  // Mindcraft specific methods (legacy support)
  subscribeToAgent(agentId: string): void {
    this.send('subscribe_agent', { agentId });
  }

  unsubscribeFromAgent(agentId: string): void {
    this.send('unsubscribe_agent', { agentId });
  }

  requestAgentList(): void {
    this.send('get_agent_list', {});
  }

  requestSystemStatus(): void {
    this.send('get_system_status', {});
  }

  // Health check with proper timeout management
  ping(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const startTime = Date.now();
      const pingId = startTime;
      
      const timeout = window.setTimeout(() => {
        this.pingTimeouts.delete(pingId);
        reject(new Error('Ping timeout'));
      }, 5000);

      this.pingTimeouts.set(pingId, timeout);

      const onPong = () => {
        const timeout = this.pingTimeouts.get(pingId);
        if (timeout) {
          clearTimeout(timeout);
          this.pingTimeouts.delete(pingId);
        }
        const latency = Date.now() - startTime;
        resolve(latency);
      };

      this.socket.once('pong', onPong);
      this.send('ping', { timestamp: startTime });
    });
  }

  // Enhanced methods for status monitoring with proper cleanup
  private startLatencyMonitoring(): void {
    // Clear any existing interval
    this.stopLatencyMonitoring();
    
    // Ping every 30 seconds to monitor connection health
    this.latencyInterval = window.setInterval(async () => {
      if (this.isConnected()) {
        try {
          const latency = await this.ping();
          this.updateLatencyMetrics(latency);
        } catch (error) {
          console.warn('[SocketService] Latency check failed:', error);
        }
      }
    }, 30000);
  }

  private stopLatencyMonitoring(): void {
    if (this.latencyInterval) {
      clearInterval(this.latencyInterval);
      this.latencyInterval = null;
    }
  }

  private updateLatencyMetrics(latency: number): void {
    this.latencyHistory.push(latency);
    
    // Keep only last 10 measurements
    if (this.latencyHistory.length > 10) {
      this.latencyHistory.shift();
    }
    
    // Calculate average latency
    this.metrics.averageLatency = this.latencyHistory.reduce((sum, lat) => sum + lat, 0) / this.latencyHistory.length;
    this.metrics.lastPingTime = Date.now();
    this.notifyStatusChange();
  }

  private updateConnectionUptime(): void {
    if (this.metrics.connectedAt) {
      this.metrics.connectionUptime += Date.now() - this.metrics.connectedAt;
    }
  }

  private notifyStatusChange(): void {
    const status = this.getStatus();
    this.statusChangeCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('[SocketService] Error in status change callback:', error);
      }
    });
  }

  public getStatus(): SocketServiceStatus {
    return {
      isConnected: this.isConnected(),
      isConnecting: this.isConnecting,
      connectionAttempts: this.connectionAttempts,
      lastError: this.lastError,
      metrics: { ...this.metrics },
    };
  }

  public onStatusChange(callback: (status: SocketServiceStatus) => void): void {
    this.statusChangeCallbacks.push(callback);
  }

  public offStatusChange(callback: (status: SocketServiceStatus) => void): void {
    const index = this.statusChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusChangeCallbacks.splice(index, 1);
    }
  }

  public forceReconnect(): Promise<void> {
    console.log('[SocketService] Force reconnect requested');
    this.disconnect();
    this.connectionAttempts = 0;
    return this.connect();
  }

  // Enhanced streaming methods
  updateStreamingConfig(config: Partial<StreamingConfig>): void {
    if (this.streamingService) {
      // Ensure required properties are present
      const fullConfig: StreamingConfig = {
        enableAggregation: config.enableAggregation ?? true,
        aggregationWindow: config.aggregationWindow ?? 1000,
        enableFiltering: config.enableFiltering ?? true,
        enableCaching: config.enableCaching ?? true,
        cacheSize: config.cacheSize ?? 1000,
        cacheTimeout: config.cacheTimeout ?? 300000,
        enableTransformation: config.enableTransformation ?? true,
        enableCompression: config.enableCompression ?? false,
        compressionThreshold: config.compressionThreshold ?? 1024,
        maxConcurrentStreams: config.maxConcurrentStreams ?? 50,
        bufferSize: config.bufferSize ?? 100,
        flushInterval: config.flushInterval ?? 100
      };
      
      this.streamingService = new StreamingService(fullConfig);
    }
  }

  getStreamingStats(): any {
    if (this.streamingService) {
      return this.streamingService.getMetrics();
    }
    return null;
  }

  isStreamingActive(): boolean {
    return this.streamingService !== null;
  }

  getComprehensiveStatus() {
    return {
      socket: this.isConnected() ? 'connected' : 'disconnected',
      streaming: 'active', // Simplified since we don't have getConnectionStatus
      streamingEnabled: this.streamingEnabled,
      initialized: this.streamingService !== null
    };
  }

  // Cleanup with comprehensive resource management
  destroy(): void {
    console.log('[SocketService] Destroying service and cleaning up resources');
    
    // Clear all timeouts and intervals
    this.clearReconnectTimeout();
    this.updateConnectionUptime();
    this.stopLatencyMonitoring();
    
    // Clear all ping timeouts
    this.pingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.pingTimeouts.clear();
    
    // Disconnect and cleanup socket
    this.disconnect();
    
    // Clear all event listeners
    this.listeners.clear();
    this.eventHandlerRefs.clear();
    this.statusChangeCallbacks.length = 0;
    this.latencyHistory.length = 0;
    
    // Clear connection locks
    this.connectionLocks.clear();
    
    // Reset state
    this.streamingEnabled = false;
    this.isConnecting = false;
    this.connectionAttempts = 0;
    this.lastError = null;
  }
}

// Singleton instance
let socketServiceInstance: SocketService | null = null;

export const initializeSocket = (config: SocketServiceConfig): SocketService => {
  if (socketServiceInstance) {
    console.log('[SocketService] Socket service already exists, reusing existing instance');
    return socketServiceInstance;
  }
  
  console.log('[SocketService] Creating new socket service instance');
  socketServiceInstance = new SocketService(config);
  return socketServiceInstance;
};

export const getSocketService = (): SocketService | null => {
  return socketServiceInstance;
};

export default SocketService;
import { io, Socket } from 'socket.io-client';
import type { AgentUpdateEvent, AgentListEvent, SystemStatusEvent } from '../types/agent';
import type { Goal, GoalHierarchy, GoalUpdateEvent } from '../types/goals';
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
    return new Promise(async (resolve, reject) => {
      try {
        this.connectionAttempts++;
        console.log(`[SocketService] Connecting to ${this.config.url} (attempt ${this.connectionAttempts})`);
        this.lastError = null;
        this.streamingEnabled = enableStreaming;
        this.notifyStatusChange();
        
        this.socket = io(this.config.url, {
          ...this.config.options,
          reconnection: this.config.options?.reconnection !== false, // Respect the config, but allow manual handling when needed
          reconnectionDelay: this.config.options?.reconnectionDelay || 1000,
          reconnectionAttempts: this.config.options?.reconnectionAttempts || 5,
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
          this.notifyStatusChange();
          
          // Start periodic ping for latency monitoring
          this.startLatencyMonitoring();
          
          // Start streaming service if enabled and connected
          if (enableStreaming && this.streamingService) {
            // Streaming service is already initialized, no need to call initialize()
            console.log('[SocketService] Streaming service ready');
          }
          
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
          this.clearReconnectTimeout();
          this.notifyStatusChange();
          
          // Provide helpful troubleshooting information
          console.error('[SocketService] Troubleshooting tips:');
          console.error('1. Ensure the MindServer backend is running: npm run dev or node main.js');
          console.error('2. Check that port 8080 is not blocked by firewall');
          console.error('3. Verify no other application is using port 8080');
          console.error('4. Try refreshing the page after starting the backend');
          
          reject(new Error(errorMessage));
        });

      } catch (error) {
        console.error('[SocketService] Failed to create socket:', error);
        this.lastError = error instanceof Error ? error.message : 'Unknown socket error';
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
      this.socket.disconnect();
      this.socket = null;
      this.metrics.connectedAt = null;
      this.notifyStatusChange();
    }
    
    this.streamingEnabled = false;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log(`[SocketService] Disconnected: ${reason}`);
      this.metrics.lastDisconnected = Date.now();
      this.updateConnectionUptime();
      this.handleDisconnect(reason);
      
      // Disconnect streaming service
      if (this.streamingService) {
        this.streamingService.destroy();
        this.streamingService = null;
      }
    });

    // Enhanced event handlers with streaming integration
    this.setupCognitiveEventHandlers();

    // Mindcraft specific events (legacy support)
    this.socket.on('agents-status', (data: AgentListEvent) => {
      console.log('[SocketService] Received agents-status:', data);
      
      // Emit the raw data directly - let the AgentList component handle transformation
      // This avoids double transformation and format mismatches
      this.emit('agentList', data);
      this.emit('agents-status', data); // Also emit the original event name
    });

    this.socket.on('state-update', (data: AgentUpdateEvent) => {
      console.log('[SocketService] Received agent update:', data);
      this.emit('agentUpdate', data);
    });

    this.socket.on('system_status', (data: SystemStatusEvent) => {
      console.log('[SocketService] Received system status:', data);
      this.emit('systemStatus', data);
    });

    // Goal hierarchy events (legacy support)
    this.socket.on('goal_hierarchy_update', (data: { agentId: string; hierarchy: GoalHierarchy }) => {
      console.log('[SocketService] Received goal hierarchy update:', data);
      this.emit('goalHierarchyUpdate', data);
    });

    this.socket.on('goal_created', (data: { agentId: string; goal: Goal }) => {
      console.log('[SocketService] Received goal created event:', data);
      this.emit('goalCreated', data);
    });

    this.socket.on('goal_updated', (data: GoalUpdateEvent) => {
      console.log('[SocketService] Received goal updated event:', data);
      this.emit('goalUpdated', data);
    });

    this.socket.on('goal_deleted', (data: { agentId: string; goalId: string }) => {
      console.log('[SocketService] Received goal deleted event:', data);
      this.emit('goalDeleted', data);
    });

    this.socket.on('goal_progress_updated', (data: { agentId: string; goalId: string; progress: number; timestamp: number }) => {
      console.log('[SocketService] Received goal progress updated event:', data);
      this.emit('goalProgressUpdated', data);
    });

    this.socket.on('milestone_completed', (data: { agentId: string; goalId: string; milestoneId: string; timestamp: number }) => {
      console.log('[SocketService] Received milestone completed event:', data);
      this.emit('milestoneCompleted', data);
    });

    this.socket.on('goals_reordered', (data: { agentId: string; goalOrder: { goalId: string; newParentId?: string; newIndex: number }[]; timestamp: number }) => {
      console.log('[SocketService] Received goals reordered event:', data);
      this.emit('goalsReordered', data);
    });

    this.socket.on('goal_conflict_detected', (data: { agentId: string; conflicts: any[]; timestamp: number }) => {
      console.log('[SocketService] Received goal conflict detected event:', data);
      this.emit('goalConflictDetected', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('[SocketService] Socket error:', error);
      this.lastError = `Socket error: ${error.message || 'Unknown socket error'}`;
      this.notifyStatusChange();
      this.emit('error', error);
    });
  }

  /**
   * Set up cognitive component event handlers for streaming integration
   */
  private setupCognitiveEventHandlers(): void {
    if (!this.socket) return;

    // Agent state events
    this.socket.on('agent:state:update', (data) => this.handleCognitiveEvent('agent:state:update', data));
    this.socket.on('agent:connected', (data) => this.handleCognitiveEvent('agent:connected', data));
    this.socket.on('agent:disconnected', (data) => this.handleCognitiveEvent('agent:disconnected', data));

    // Personality events
    this.socket.on('personality:trait:update', (data) => this.handleCognitiveEvent('personality:trait:update', data));
    this.socket.on('personality:emotion:update', (data) => this.handleCognitiveEvent('personality:emotion:update', data));
    this.socket.on('personality:mood:update', (data) => this.handleCognitiveEvent('personality:mood:update', data));

    // Memory events
    this.socket.on('memory:semantic:update', (data) => this.handleCognitiveEvent('memory:semantic:update', data));
    this.socket.on('memory:episodic:update', (data) => this.handleCognitiveEvent('memory:episodic:update', data));
    this.socket.on('memory:procedural:update', (data) => this.handleCognitiveEvent('memory:procedural:update', data));
    this.socket.on('memory:consolidation:event', (data) => this.handleCognitiveEvent('memory:consolidation:event', data));

    // Goal events
    this.socket.on('goal:strategic:update', (data) => this.handleCognitiveEvent('goal:strategic:update', data));
    this.socket.on('goal:tactical:update', (data) => this.handleCognitiveEvent('goal:tactical:update', data));
    this.socket.on('goal:operational:update', (data) => this.handleCognitiveEvent('goal:operational:update', data));
    this.socket.on('goal:progress:update', (data) => this.handleCognitiveEvent('goal:progress:update', data));

    // Social events
    this.socket.on('social:relationship:update', (data) => this.handleCognitiveEvent('social:relationship:update', data));
    this.socket.on('social:interaction:event', (data) => this.handleCognitiveEvent('social:interaction:event', data));
    this.socket.on('social:network:update', (data) => this.handleCognitiveEvent('social:network:update', data));

    // Skill events
    this.socket.on('skill:progress:update', (data) => this.handleCognitiveEvent('skill:progress:update', data));
    this.socket.on('skill:experience:event', (data) => this.handleCognitiveEvent('skill:experience:event', data));
    this.socket.on('skill:synergy:update', (data) => this.handleCognitiveEvent('skill:synergy:update', data));

    // Performance events
    this.socket.on('performance:metrics:update', (data) => this.handleCognitiveEvent('performance:metrics:update', data));
    this.socket.on('performance:alert:event', (data) => this.handleCognitiveEvent('performance:alert:event', data));
    this.socket.on('performance:anomaly:detect', (data) => this.handleCognitiveEvent('performance:anomaly:detect', data));

    // System events
    this.socket.on('system:status:update', (data) => this.handleCognitiveEvent('system:status:update', data));
    this.socket.on('system:error:event', (data) => this.handleCognitiveEvent('system:error:event', data));

    // Data management events
    this.socket.on('data:subscription', (data) => this.handleCognitiveEvent('data:subscription', data));
    this.socket.on('data:unsubscription', (data) => this.handleCognitiveEvent('data:unsubscription', data));
    this.socket.on('data:optimization', (data) => this.handleCognitiveEvent('data:optimization', data));
  }

  /**
   * Handle cognitive component events
   */
  private handleCognitiveEvent(eventType: string, data: any): void {
    try {
      // Create SocketEvent object
      const event: any = {
        id: this.generateEventId(),
        type: eventType as any,
        timestamp: Date.now(),
        source: 'langgraph',
        data
      };

      // Validate and sanitize event
      const validationResult = validateEvent(eventType, data);
      if (!validationResult.isValid) {
        console.warn('[SocketService] Invalid cognitive event received:', eventType, validationResult.errors);
        return;
      }

      const sanitizedData = sanitizeEvent(eventType, data);
      const validatedEvent = {
        id: this.generateEventId(),
        type: eventType as any,
        timestamp: Date.now(),
        source: 'langgraph',
        data: sanitizedData
      };

      // Emit to legacy handlers
      this.emit(eventType, data);
      this.emit('cognitiveEvent', validatedEvent);

    } catch (error) {
      console.error('[SocketService] Error handling cognitive event:', error);
    }
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
   * Set up streaming event handlers
   */
  private setupStreamingEventHandlers(): void {
    if (!this.streamingService) return;

    // Register handlers for all cognitive component events
    streamingService.subscribe('agent:state:update', (data: any) => {
      this.emit('streaming:agent:state:update', data);
    });

    streamingService.subscribe('personality:trait:update', (data: any) => {
      this.emit('streaming:personality:trait:update', data);
    });

    // Update memory stream subscriptions to match new stream names
    streamingService.subscribe('memory:semantic', (data: any) => {
      this.emit('streaming:memory:semantic', data);
    });

    streamingService.subscribe('memory:episodic', (data: any) => {
      this.emit('streaming:memory:episodic', data);
    });

    streamingService.subscribe('memory:procedural', (data: any) => {
      this.emit('streaming:memory:procedural', data);
    });

    streamingService.subscribe('memory:consolidation', (data: any) => {
      this.emit('streaming:memory:consolidation', data);
    });

    streamingService.subscribe('goal:strategic:update', (data: any) => {
      this.emit('streaming:goal:strategic:update', data);
    });

    streamingService.subscribe('social:relationship:update', (data: any) => {
      this.emit('streaming:social:relationship:update', data);
    });

    streamingService.subscribe('skill:progress:update', (data: any) => {
      this.emit('streaming:skill:progress:update', data);
    });

    streamingService.subscribe('performance:metrics:update', (data: any) => {
      this.emit('streaming:performance:metrics:update', data);
    });
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
    const delay = this.calculateReconnectDelay();
    console.log(`[SocketService] Scheduling reconnection in ${delay}ms (attempt ${this.connectionAttempts + 1})`);
    
    this.reconnectTimeout = setTimeout(() => {
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
      dataTypes.forEach(dataType => {
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

  // Goal hierarchy specific methods
  subscribeToGoals(agentId: string): void {
    this.send('subscribe_goals', { agentId });
  }

  unsubscribeFromGoals(agentId: string): void {
    this.send('unsubscribe_goals', { agentId });
  }

  requestGoalHierarchy(agentId: string): void {
    this.send('get_goal_hierarchy', { agentId });
  }

  createGoal(agentId: string, goal: Omit<Goal, 'id' | 'createdAt'>): void {
    this.send('create_goal', { agentId, goal });
  }

  updateGoal(agentId: string, goalId: string, updates: Partial<Goal>): void {
    this.send('update_goal', { agentId, goalId, updates });
  }

  deleteGoal(agentId: string, goalId: string): void {
    this.send('delete_goal', { agentId, goalId });
  }

  updateGoalProgress(agentId: string, goalId: string, progress: number): void {
    this.send('update_goal_progress', { agentId, goalId, progress });
  }

  completeMilestone(agentId: string, goalId: string, milestoneId: string): void {
    this.send('complete_milestone', { agentId, goalId, milestoneId });
  }

  reorderGoals(agentId: string, goalOrder: { goalId: string; newParentId?: string; newIndex: number }[]): void {
    this.send('reorder_goals', { agentId, goalOrder });
  }

  // Health check
  ping(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const startTime = Date.now();
      
      const timeout = setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 5000);

      const onPong = () => {
        clearTimeout(timeout);
        const latency = Date.now() - startTime;
        resolve(latency);
      };

      this.socket.once('pong', onPong);
      this.send('ping', { timestamp: startTime });
    });
  }

  // Enhanced methods for status monitoring
  private startLatencyMonitoring(): void {
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
      isConnecting: this.connectionAttempts > 0 && !this.isConnected(),
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

  getComprehensiveStatus(): {
    socket: string;
    streaming: string;
    streamingEnabled: boolean;
    initialized: boolean;
  } {
    return {
      socket: this.isConnected() ? 'connected' : 'disconnected',
      streaming: 'active', // Simplified since we don't have getConnectionStatus
      streamingEnabled: this.streamingEnabled,
      initialized: this.streamingService !== null
    };
  }

  // Cleanup
  destroy(): void {
    this.clearReconnectTimeout();
    this.updateConnectionUptime();
    this.stopLatencyMonitoring();
    this.disconnect();
    this.listeners.clear();
    this.statusChangeCallbacks.length = 0;
    this.latencyHistory.length = 0;
    this.streamingEnabled = false;
  }
}

// Singleton instance
let socketServiceInstance: SocketService | null = null;

export const initializeSocket = (config: SocketServiceConfig): SocketService => {
  if (socketServiceInstance) {
    socketServiceInstance.destroy();
  }
  
  socketServiceInstance = new SocketService(config);
  return socketServiceInstance;
};

export const getSocketService = (): SocketService | null => {
  return socketServiceInstance;
};

export default SocketService;
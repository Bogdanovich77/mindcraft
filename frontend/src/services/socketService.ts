import { io, Socket } from 'socket.io-client';
import type { AgentUpdateEvent, AgentListEvent, SystemStatusEvent } from '../types/agent';

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

class SocketService {
  private socket: Socket | null = null;
  private config: SocketServiceConfig;
  private reconnectTimeout: number | null = null;
  private listeners: Map<string, Function[]> = new Map();

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

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[SocketService] Connecting to ${this.config.url}`);
        
        this.socket = io(this.config.url, this.config.options);

        this.setupEventHandlers();
        
        this.socket.on('connect', () => {
          console.log('[SocketService] Connected successfully');
          this.clearReconnectTimeout();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('[SocketService] Connection error:', error);
          this.clearReconnectTimeout();
          reject(new Error(`Connection failed: ${error.message || 'Unknown error'}`));
        });

      } catch (error) {
        console.error('[SocketService] Failed to create socket:', error);
        reject(error instanceof Error ? error : new Error('Unknown socket error'));
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('[SocketService] Disconnecting');
      this.clearReconnectTimeout();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
      this.handleDisconnect(reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`[SocketService] Reconnected after ${attemptNumber} attempts`);
      this.clearReconnectTimeout();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[SocketService] Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[SocketService] Reconnection error:', error);
    });

    // Mindcraft specific events
    this.socket.on('agent_list', (data: AgentListEvent) => {
      console.log('[SocketService] Received agent list:', data);
      this.emit('agentList', data);
    });

    this.socket.on('agent_update', (data: AgentUpdateEvent) => {
      console.log('[SocketService] Received agent update:', data);
      this.emit('agentUpdate', data);
    });

    this.socket.on('system_status', (data: SystemStatusEvent) => {
      console.log('[SocketService] Received system status:', data);
      this.emit('systemStatus', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('[SocketService] Socket error:', error);
      this.emit('error', error);
    });
  }

  private handleDisconnect(reason: string): void {
    this.clearReconnectTimeout();

    // Don't attempt reconnection for intentional disconnections
    if (reason === 'io client disconnect') {
      console.log('[SocketService] Intentional disconnect');
      return;
    }

    // Schedule reconnection for unexpected disconnections
    if (this.config.options?.reconnection !== false) {
      const delay = this.calculateReconnectDelay();
      console.log(`[SocketService] Scheduling reconnection in ${delay}ms`);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log('[SocketService] Attempting reconnection');
        this.connect().catch((error) => {
          console.error('[SocketService] Reconnection failed:', error);
        });
      }, delay);
    }
  }

  private calculateReconnectDelay(): number {
    const baseDelay = this.config.options?.reconnectionDelay || 1000;
    const maxDelay = 30000; // 30 seconds max
    const attempts = 1; // Simplified - we'll track attempts differently
    
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempts - 1);
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

  // Mindcraft specific methods
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

  // Cleanup
  destroy(): void {
    this.clearReconnectTimeout();
    this.disconnect();
    this.listeners.clear();
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
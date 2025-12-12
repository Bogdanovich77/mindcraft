/**
 * Communication Protocols for Multi-Agent Coordination System
 * 
 * This file implements agent-to-agent messaging with priority queues,
 * broadcast/multicast capabilities, and message routing.
 */

import {
  CoordinationState,
  CommunicationState,
  CommunicationChannel,
  QueuedMessage,
  SentMessage,
  ReceivedMessage,
  BroadcastState,
  CommunicationMetrics,
  MessageType,
  MessagePriority,
  MessageDeliveryStatus,
  ReadStatus,
  ChannelType,
  ChannelState,
  MessagePayload,
  Broadcast,
  BroadcastType,
  BroadcastAudience,
  BroadcastFrequency,
  BroadcastStatus,
  SubscriptionManager,
  Subscription,
  MessageFilter,
  FilterOperator,
  SubscriptionPreferences,
  FrequencyControl,
  MessageLimit,
  RateLimiting,
  RateViolation,
  SpamProtection,
  CoordinationEvent,
  CoordinationEventType,
  EventPriority
} from './coordination_types.js';

import { AgentState, SocialState } from '../langgraph/interfaces.js';

/**
 * Communication Protocols Manager
 * Handles all agent-to-agent communication with priority queues and routing
 */
export class CommunicationProtocols {
  private state: CommunicationState;
  private agentId: string;
  private socialState: SocialState;
  private eventHandlers: Map<CoordinationEventType, Function[]>;
  private performanceMetrics: CommunicationMetrics;
  private messageProcessingQueue: QueuedMessage[];
  private isProcessing: boolean = false;

  constructor(agentId: string, socialState: SocialState) {
    this.agentId = agentId;
    this.socialState = socialState;
    this.eventHandlers = new Map();
    this.messageProcessingQueue = [];
    
    this.state = {
      activeChannels: new Map(),
      messageQueue: [],
      sentMessages: [],
      receivedMessages: [],
      broadcasting: {
        activeBroadcasts: new Map(),
        broadcastHistory: [],
        subscriptionManager: {
          subscriptions: new Map(),
          filters: [],
          preferences: {
            maxMessagesPerMinute: 100,
            priorityThreshold: MessagePriority.LOW,
            allowInterruptions: true,
            digestMode: false,
            quietHours: []
          }
        },
        frequencyControl: {
          messageLimits: new Map(),
          rateLimiting: {
            enabled: true,
            penaltyMultiplier: 1.5,
            recoveryRate: 0.1,
            violationHistory: []
          },
          spamProtection: {
            enabled: true,
            duplicateDetection: true,
            contentAnalysis: true,
            blacklist: [],
            whitelist: []
          }
        }
      },
      metrics: {
        messagesSent: 0,
        messagesReceived: 0,
        averageDeliveryTime: 0,
        successRate: 1.0,
        responseRate: 0.0,
        priorityDistribution: {
          [MessagePriority.CRITICAL]: 0,
          [MessagePriority.HIGH]: 0,
          [MessagePriority.MEDIUM]: 0,
          [MessagePriority.LOW]: 0,
          [MessagePriority.BACKGROUND]: 0
        },
        channelUtilization: new Map(),
        performanceScore: 1.0
      }
    };

    this.performanceMetrics = { ...this.state.metrics };
    this.initializeEventHandlers();
    this.startMessageProcessing();
  }

  /**
   * Initialize event handlers for communication events
   */
  private initializeEventHandlers(): void {
    // Register default event handlers
    this.registerEventHandler(CoordinationEventType.COMMUNICATION_ESTABLISHED, this.handleCommunicationEstablished.bind(this));
    this.registerEventHandler(CoordinationEventType.COMMUNICATION_LOST, this.handleCommunicationLost.bind(this));
    this.registerEventHandler(CoordinationEventType.PERFORMANCE_DEGRADED, this.handlePerformanceDegraded.bind(this));
    this.registerEventHandler(CoordinationEventType.PERFORMANCE_IMPROVED, this.handlePerformanceImproved.bind(this));
  }

  /**
   * Start message processing loop
   */
  private startMessageProcessing(): void {
    setInterval(() => {
      if (!this.isProcessing && this.messageProcessingQueue.length > 0) {
        this.processMessageQueue();
      }
    }, 10); // Process every 10ms for <100ms latency
  }

  /**
   * Process queued messages with priority ordering
   */
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      // Sort messages by priority (lower number = higher priority)
      this.messageProcessingQueue.sort((a, b) => a.priority - b.priority);
      
      // Process up to 10 messages per cycle to prevent blocking
      const messagesToProcess = this.messageProcessingQueue.splice(0, 10);
      
      for (const message of messagesToProcess) {
        await this.processMessage(message);
      }
      
      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(messagesToProcess.length, processingTime);
      
    } catch (error) {
      console.error('[COMMUNICATION_PROTOCOLS] Error processing message queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual message
   */
  private async processMessage(message: QueuedMessage): Promise<void> {
    const processingStart = Date.now();
    
    try {
      // Check rate limits
      if (!this.checkRateLimits(message)) {
        console.warn(`[COMMUNICATION_PROTOCOLS] Rate limit exceeded for message ${message.id}`);
        return;
      }

      // Check spam protection
      if (!this.checkSpamProtection(message)) {
        console.warn(`[COMMUNICATION_PROTOCOLS] Spam protection triggered for message ${message.id}`);
        return;
      }

      // Route message based on type and priority
      const deliveryResult = await this.routeMessage(message);
      
      // Update message status
      if (deliveryResult.success) {
        this.state.sentMessages.push({
          id: message.id,
          type: message.type,
          priority: message.priority,
          recipient: message.recipient || 'broadcast',
          recipients: message.recipients,
          channel: message.channel,
          payload: message.payload,
          timestamp: message.timestamp,
          deliveryStatus: MessageDeliveryStatus.DELIVERED,
          deliveryTime: Date.now() - processingStart,
          responseReceived: false
        });
        
        this.state.metrics.messagesSent++;
        this.state.metrics.priorityDistribution[message.priority]++;
      } else {
        // Handle failed delivery
        this.handleFailedDelivery(message, deliveryResult.error);
      }
      
    } catch (error) {
      console.error(`[COMMUNICATION_PROTOCOLS] Error processing message ${message.id}:`, error);
      this.handleFailedDelivery(message, error);
    }
  }

  /**
   * Route message to appropriate destination
   */
  private async routeMessage(message: QueuedMessage): Promise<{ success: boolean; error?: string }> {
    try {
      if (message.channel) {
        // Channel-based communication
        return await this.sendToChannel(message);
      } else if (message.recipient) {
        // Direct message
        return await this.sendDirectMessage(message);
      } else if (message.recipients && message.recipients.length > 0) {
        // Multicast message
        return await this.sendMulticastMessage(message);
      } else {
        return { success: false, error: 'No valid destination specified' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send message to specific channel
   */
  private async sendToChannel(message: QueuedMessage): Promise<{ success: boolean; error?: string }> {
    const channel = this.state.activeChannels.get(message.channel);
    
    if (!channel) {
      return { success: false, error: `Channel ${message.channel} not found` };
    }

    if (!this.checkChannelPermissions(channel, message)) {
      return { success: false, error: 'Insufficient permissions for channel' };
    }

    // Simulate message delivery to channel participants
    const deliveryPromises = channel.participants.map(participantId => 
      this.deliverToAgent(participantId, message)
    );

    const results = await Promise.allSettled(deliveryPromises);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      return { success: false, error: `Failed to deliver to ${failures.length} participants` };
    }

    return { success: true };
  }

  /**
   * Send direct message to specific agent
   */
  private async sendDirectMessage(message: QueuedMessage): Promise<{ success: boolean; error?: string }> {
    try {
      await this.deliverToAgent(message.recipient, message);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send multicast message to multiple agents
   */
  private async sendMulticastMessage(message: QueuedMessage): Promise<{ success: boolean; error?: string }> {
    if (!message.recipients || message.recipients.length === 0) {
      return { success: false, error: 'No recipients specified for multicast' };
    }

    try {
      const deliveryPromises = message.recipients.map(recipientId => 
        this.deliverToAgent(recipientId, message)
      );

      const results = await Promise.allSettled(deliveryPromises);
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        return { success: false, error: `Failed to deliver to ${failures.length} recipients` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Deliver message to specific agent (simulation)
   */
  private async deliverToAgent(agentId: string, message: QueuedMessage): Promise<void> {
    // Simulate network latency and delivery
    const deliveryLatency = Math.random() * 50 + 10; // 10-60ms
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In real implementation, this would send via network layer
        console.log(`[COMMUNICATION_PROTOCOLS] Delivering message ${message.id} to agent ${agentId}`);
        
        // Check if agent is available
        if (this.isAgentAvailable(agentId)) {
          resolve();
        } else {
          reject(new Error(`Agent ${agentId} is unavailable`));
        }
      }, deliveryLatency);
    });
  }

  /**
   * Check if agent is available for communication
   */
  private isAgentAvailable(agentId: string): boolean {
    // Check social relationships for availability
    const trustLevel = this.socialState.relationships.trustLevels[agentId] || 0;
    if (trustLevel < 0.3) {
      return false; // Low trust agents may be blocked
    }

    // Random availability simulation (90% available)
    return Math.random() > 0.1;
  }

  /**
   * Check channel permissions for message
   */
  private checkChannelPermissions(channel: CommunicationChannel, message: QueuedMessage): boolean {
    // Check if sender has write permissions
    if (!channel.permissions.canWrite.includes(this.agentId)) {
      return false;
    }

    // Check encryption requirements
    if (channel.permissions.requireAuthentication && !message.payload.encryption) {
      return false;
    }

    return true;
  }

  /**
   * Check rate limits for message
   */
  private checkRateLimits(message: QueuedMessage): boolean {
    const rateLimiting = this.state.broadcasting.frequencyControl.rateLimiting;
    if (!rateLimiting.enabled) return true;

    const now = Date.now();
    
    // Initialize message limit if not exists
    if (!rateLimiting.messageLimits.has(message.type)) {
      rateLimiting.messageLimits.set(message.type, {
        messageType: message.type,
        maxPerMinute: 100,
        maxPerHour: 1000,
        maxPerDay: 10000,
        currentCount: 0,
        resetTime: now + 60000 // 1 minute
      });
    }
    
    const messageLimit = rateLimiting.messageLimits.get(message.type);
    
    if (!messageLimit) return true;

    // Check current count against limits
    if (messageLimit.currentCount >= messageLimit.maxPerMinute) {
      // Add rate violation
      rateLimiting.violationHistory.push({
        timestamp: now,
        violationType: 'exceeded_rate_limit',
        penalty: rateLimiting.penaltyMultiplier,
        duration: 60000 // 1 minute penalty
      });
      return false;
    }

    messageLimit.currentCount++;
    return true;
  }

  /**
   * Check spam protection for message
   */
  private checkSpamProtection(message: QueuedMessage): boolean {
    const spamProtection = this.state.broadcasting.frequencyControl.spamProtection;
    if (!spamProtection.enabled) return true;

    // Check for duplicates
    if (spamProtection.duplicateDetection) {
      const recentMessages = this.state.sentMessages.slice(-10);
      const isDuplicate = recentMessages.some(sent => 
        sent.payload.content === message.payload.content &&
        Date.now() - sent.timestamp < 5000 // Within 5 seconds
      );
      
      if (isDuplicate) return false;
    }

    // Check blacklist
    if (spamProtection.blacklist.length > 0) {
      const content = message.payload.content?.toLowerCase() || '';
      const isBlacklisted = spamProtection.blacklist.some(term => 
        content.includes(term.toLowerCase())
      );
      
      if (isBlacklisted) return false;
    }

    return true;
  }

  /**
   * Handle failed message delivery
   */
  private handleFailedDelivery(message: QueuedMessage, error: any): void {
    message.retryCount++;
    
    if (message.retryCount < message.maxRetries) {
      // Re-queue message for retry
      this.messageProcessingQueue.push(message);
    } else {
      // Mark as failed after max retries
      console.error(`[COMMUNICATION_PROTOCOLS] Message ${message.id} failed after ${message.maxRetries} attempts:`, error);
      
      // Record failure in metrics
      this.state.metrics.successRate = (this.state.metrics.successRate * 0.9) + (0.1 * 0); // Decrease success rate
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(messagesProcessed: number, processingTime: number): void {
    const avgDeliveryTime = (this.state.metrics.averageDeliveryTime * 0.8) + (processingTime * 0.2);
    this.state.metrics.averageDeliveryTime = avgDeliveryTime;
    
    // Update performance score based on latency and success rate
    const latencyScore = Math.max(0, 1 - (avgDeliveryTime / 100)); // 100ms target
    const successScore = this.state.metrics.successRate;
    this.state.metrics.performanceScore = (latencyScore + successScore) / 2;
  }

  /**
   * Send message with priority queue
   */
  public sendMessage(
    type: MessageType,
    payload: MessagePayload,
    priority: MessagePriority = MessagePriority.MEDIUM,
    options: {
      recipient?: string;
      recipients?: string[];
      channel?: string;
      timeout?: number;
      maxRetries?: number;
    } = {}
  ): string {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message: QueuedMessage = {
      id: messageId,
      type,
      priority,
      sender: this.agentId,
      recipient: options.recipient,
      recipients: options.recipients,
      channel: options.channel,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3
    };

    // Add to priority queue
    this.messageProcessingQueue.push(message);
    this.state.messageQueue.push(message);

    console.log(`[COMMUNICATION_PROTOCOLS] Queued message ${messageId} with priority ${priority}`);
    
    return messageId;
  }

  /**
   * Send broadcast message
   */
  public sendBroadcast(
    type: BroadcastType,
    content: MessagePayload,
    audience: BroadcastAudience = BroadcastAudience.ALL,
    frequency: BroadcastFrequency = BroadcastFrequency.ONCE
  ): string {
    const broadcastId = `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const broadcast: Broadcast = {
      id: broadcastId,
      broadcasterId: this.agentId,
      type,
      content,
      targetAudience: audience,
      frequency,
      duration: frequency === BroadcastFrequency.ONCE ? 0 : 3600000, // 1 hour for recurring
      startTime: Date.now(),
      endTime: frequency === BroadcastFrequency.ONCE ? Date.now() + 60000 : undefined, // 1 minute expiry for once
      status: BroadcastStatus.ACTIVE
    };

    this.state.broadcasting.activeBroadcasts.set(broadcastId, broadcast);
    
    // Convert broadcast to message
    const recipients = this.determineBroadcastRecipients(audience);
    this.sendMessage(MessageType.STATUS_UPDATE, content, MessagePriority.MEDIUM, {
      recipients,
      channel: 'broadcast'
    });

    console.log(`[COMMUNICATION_PROTOCOLS] Broadcast ${broadcastId} sent to ${recipients.length} recipients`);
    
    return broadcastId;
  }

  /**
   * Determine broadcast recipients based on audience
   */
  private determineBroadcastRecipients(audience: BroadcastAudience): string[] {
    // In real implementation, this would query agent registry
    // For now, return empty array (would be populated by actual agent discovery)
    
    switch (audience) {
      case BroadcastAudience.ALL:
        return []; // All agents
      case BroadcastAudience.TEAM:
        return []; // Team members only
      case BroadcastAudience.NEARBY:
        return []; // Nearby agents only
      case BroadcastAudience.ROLE_BASED:
        return []; // Agents with specific roles
      case BroadcastAudience.RELATIONSHIP_BASED:
        return []; // Agents with certain relationship levels
      default:
        return [];
    }
  }

  /**
   * Create communication channel
   */
  public createChannel(
    name: string,
    type: ChannelType,
    participants: string[],
    options: {
      permissions?: {
        canRead: string[];
        canWrite: string[];
        canAdmin: string[];
        requireAuthentication: boolean;
        encryptionLevel: number;
      };
      priority?: MessagePriority;
      metadata?: {
        description?: string;
        maxParticipants?: number;
        persistenceDuration?: number;
        tags?: string[];
      };
    } = {}
  ): string {
    const channelId = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const channel: CommunicationChannel = {
      id: channelId,
      name,
      type,
      participants,
      permissions: options.permissions || {
        canRead: participants,
        canWrite: participants,
        canAdmin: [this.agentId],
        requireAuthentication: false,
        encryptionLevel: 0
      },
      priority: options.priority || MessagePriority.MEDIUM,
      state: ChannelState.ACTIVE,
      metadata: {
        createdAt: Date.now(),
        createdBy: this.agentId,
        description: options.metadata?.description || '',
        maxParticipants: options.metadata?.maxParticipants || 50,
        persistenceDuration: options.metadata?.persistenceDuration || 86400000, // 24 hours
        tags: options.metadata?.tags || []
      }
    };

    this.state.activeChannels.set(channelId, channel);
    
    console.log(`[COMMUNICATION_PROTOCOLS] Created channel ${channelId} with ${participants.length} participants`);
    
    return channelId;
  }

  /**
   * Join communication channel
   */
  public joinChannel(channelId: string): boolean {
    const channel = this.state.activeChannels.get(channelId);
    
    if (!channel) {
      console.error(`[COMMUNICATION_PROTOCOLS] Channel ${channelId} not found`);
      return false;
    }

    if (!channel.permissions.canRead.includes(this.agentId)) {
      console.error(`[COMMUNICATION_PROTOCOLS] No read permission for channel ${channelId}`);
      return false;
    }

    if (!channel.participants.includes(this.agentId)) {
      channel.participants.push(this.agentId);
    }

    console.log(`[COMMUNICATION_PROTOCOLS] Joined channel ${channelId}`);
    return true;
  }

  /**
   * Leave communication channel
   */
  public leaveChannel(channelId: string): boolean {
    const channel = this.state.activeChannels.get(channelId);
    
    if (!channel) {
      console.error(`[COMMUNICATION_PROTOCOLS] Channel ${channelId} not found`);
      return false;
    }

    const participantIndex = channel.participants.indexOf(this.agentId);
    if (participantIndex !== -1) {
      channel.participants.splice(participantIndex, 1);
    }

    console.log(`[COMMUNICATION_PROTOCOLS] Left channel ${channelId}`);
    return true;
  }

  /**
   * Register event handler
   */
  public registerEventHandler(eventType: CoordinationEventType, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Emit coordination event
   */
  public emitEvent(event: CoordinationEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[COMMUNICATION_PROTOCOLS] Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Get current communication state
   */
  public getState(): CommunicationState {
    return { ...this.state };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): CommunicationMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Event Handlers
   */
  private handleCommunicationEstablished(event: CoordinationEvent): void {
    console.log(`[COMMUNICATION_PROTOCOLS] Communication established:`, event.data);
  }

  private handleCommunicationLost(event: CoordinationEvent): void {
    console.log(`[COMMUNICATION_PROTOCOLS] Communication lost:`, event.data);
  }

  private handlePerformanceDegraded(event: CoordinationEvent): void {
    console.log(`[COMMUNICATION_PROTOCOLS] Performance degraded:`, event.data);
  }

  private handlePerformanceImproved(event: CoordinationEvent): void {
    console.log(`[COMMUNICATION_PROTOCOLS] Performance improved:`, event.data);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    // Clear active channels
    this.state.activeChannels.clear();
    
    // Clear message queues
    this.messageProcessingQueue = [];
    this.state.messageQueue = [];
    
    // Clear event handlers
    this.eventHandlers.clear();
    
    console.log('[COMMUNICATION_PROTOCOLS] Cleanup completed');
  }
}
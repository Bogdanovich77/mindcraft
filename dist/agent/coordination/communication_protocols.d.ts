/**
 * Communication Protocols for Multi-Agent Coordination System
 *
 * This file implements agent-to-agent messaging with priority queues,
 * broadcast/multicast capabilities, and message routing.
 */
import { CommunicationState, CommunicationMetrics, MessageType, MessagePriority, ChannelType, MessagePayload, BroadcastType, BroadcastAudience, BroadcastFrequency, CoordinationEvent, CoordinationEventType } from './coordination_types.js';
import { SocialState } from '../langgraph/interfaces.js';
/**
 * Communication Protocols Manager
 * Handles all agent-to-agent communication with priority queues and routing
 */
export declare class CommunicationProtocols {
    private state;
    private agentId;
    private socialState;
    private eventHandlers;
    private performanceMetrics;
    private messageProcessingQueue;
    private isProcessing;
    constructor(agentId: string, socialState: SocialState);
    /**
     * Initialize event handlers for communication events
     */
    private initializeEventHandlers;
    /**
     * Start message processing loop
     */
    private startMessageProcessing;
    /**
     * Process queued messages with priority ordering
     */
    private processMessageQueue;
    /**
     * Process individual message
     */
    private processMessage;
    /**
     * Route message to appropriate destination
     */
    private routeMessage;
    /**
     * Send message to specific channel
     */
    private sendToChannel;
    /**
     * Send direct message to specific agent
     */
    private sendDirectMessage;
    /**
     * Send multicast message to multiple agents
     */
    private sendMulticastMessage;
    /**
     * Deliver message to specific agent (simulation)
     */
    private deliverToAgent;
    /**
     * Check if agent is available for communication
     */
    private isAgentAvailable;
    /**
     * Check channel permissions for message
     */
    private checkChannelPermissions;
    /**
     * Check rate limits for message
     */
    private checkRateLimits;
    /**
     * Check spam protection for message
     */
    private checkSpamProtection;
    /**
     * Handle failed message delivery
     */
    private handleFailedDelivery;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Send message with priority queue
     */
    sendMessage(type: MessageType, payload: MessagePayload, priority?: MessagePriority, options?: {
        recipient?: string;
        recipients?: string[];
        channel?: string;
        timeout?: number;
        maxRetries?: number;
    }): string;
    /**
     * Send broadcast message
     */
    sendBroadcast(type: BroadcastType, content: MessagePayload, audience?: BroadcastAudience, frequency?: BroadcastFrequency): string;
    /**
     * Determine broadcast recipients based on audience
     */
    private determineBroadcastRecipients;
    /**
     * Create communication channel
     */
    createChannel(name: string, type: ChannelType, participants: string[], options?: {
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
    }): string;
    /**
     * Join communication channel
     */
    joinChannel(channelId: string): boolean;
    /**
     * Leave communication channel
     */
    leaveChannel(channelId: string): boolean;
    /**
     * Register event handler
     */
    registerEventHandler(eventType: CoordinationEventType, handler: Function): void;
    /**
     * Emit coordination event
     */
    emitEvent(event: CoordinationEvent): void;
    /**
     * Get current communication state
     */
    getState(): CommunicationState;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): CommunicationMetrics;
    /**
     * Event Handlers
     */
    private handleCommunicationEstablished;
    private handleCommunicationLost;
    private handlePerformanceDegraded;
    private handlePerformanceImproved;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
//# sourceMappingURL=communication_protocols.d.ts.map
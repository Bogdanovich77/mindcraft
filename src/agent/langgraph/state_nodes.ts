/**
 * State Nodes for Mindcraft LangGraph System
 * Defines the core processing nodes: perception, analysis, planning, decision, execution, and reflection
 */

// Extend AgentState to include antiIdleSystem and multiAgentCoordinator
declare module './interfaces.js' {
  interface AgentState {
    antiIdleSystem?: AntiIdleSystem;
    multiAgentCoordinator?: MultiAgentCoordinator;
  }
}

import { AgentState, ProcessingPhase, AgentAction, DecisionOption, WorldContext, InterruptPriority, SocialState, DecisionContext, MessageType, MessagePriority, CoordinationStatus, CoordinationMessage, CollaborationRequest, TaskDelegation, ConflictDetection, NegotiationProcess, MediationProcess, CoordinationMetrics, MultiAgentCoordinator, MessageAnalysis, ConversationProcessingResult } from './interfaces.js';
import { InterruptController } from './interrupt_controller.js';
import { AntiIdleSystem } from '../cognitive/anti_idle_system';
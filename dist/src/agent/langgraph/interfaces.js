/**
 * Core TypeScript interfaces for the Mindcraft LangGraph hybrid agent system
 *
 * This file contains all TypeScript interfaces and type definitions
 * for the agent state structure, supporting both reactive and cognitive
 * components with comprehensive social integration.
 */

import { StateGraph, Annotation } from "@langchain/langgraph";
import { AntiIdleSystem } from "../cognitive/anti_idle_system.js";

// Export empty objects for interfaces, as they are type-level only.
export const AgentState = {};
export const ProcessingPhase = {};
export const InterruptPriority = {};
export const EmergencyCondition = {};
export const ReactiveState = {};
export const CognitiveState = {};
export const ExecutiveState = {};
export const WorldContext = {};
export const MessageAnalysis = {};
export const ConversationProcessing = {};
export const ResponseRouting = {};
export const EnvironmentalOpportunityDetector = {};
export const AntiIdleGoalGenerator = {};
export const FeasibilityAnalyzer = {};
export const ResourceRequirement = {};
export const FeasibilityResult = {};
export const RiskLevel = {};
export const FeasibilityAnalysisResult = {};
export const RiskAnalysis = {};
export const RiskFactor = {};
export const FeasibilityFactor = {};
export const MultiAgentCoordinator = {};
export const CollaborativePlanning = {};
export const ConflictResolution = {};

// Re-export AntiIdleSystem
export { AntiIdleSystem };

// LangGraph State Annotation
export const AgentStateAnnotation = Annotation.Root({
    context: Annotation,
    reactive: Annotation,
    cognitive: (Annotation),
    executive: (Annotation),
    metadata: (Annotation),
    antiIdleSystem: (Annotation),
    multiAgentCoordinator: (Annotation)
});

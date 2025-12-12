/**
 * Core TypeScript interfaces for the Mindcraft LangGraph hybrid agent system
 *
 * This file contains all TypeScript interfaces and type definitions
 * for the agent state structure, supporting both reactive and cognitive
 * components with comprehensive social integration.
 */
import { Annotation } from "@langchain/langgraph";
export var ProcessingPhase;
(function (ProcessingPhase) {
    ProcessingPhase["PERCEPTION"] = "perception";
    ProcessingPhase["ANALYSIS"] = "analysis";
    ProcessingPhase["PLANNING"] = "planning";
    ProcessingPhase["DECISION"] = "decision";
    ProcessingPhase["EXECUTION"] = "execution";
    ProcessingPhase["REFLECTION"] = "reflection";
    ProcessingPhase["CONVERSATION"] = "conversation";
    ProcessingPhase["COORDINATION"] = "coordination";
})(ProcessingPhase || (ProcessingPhase = {}));
export var InterruptPriority;
(function (InterruptPriority) {
    InterruptPriority["EMERGENCY"] = "emergency";
    InterruptPriority["SURVIVAL"] = "survival";
    InterruptPriority["OPPORTUNITY"] = "opportunity";
    InterruptPriority["COGNITIVE"] = "cognitive";
})(InterruptPriority || (InterruptPriority = {}));
export var FeasibilityLevel;
(function (FeasibilityLevel) {
    FeasibilityLevel["IMPOSSIBLE"] = "impossible";
    FeasibilityLevel["VERY_DIFFICULT"] = "very_difficult";
    FeasibilityLevel["DIFFICULT"] = "difficult";
    FeasibilityLevel["MODERATE"] = "moderate";
    FeasibilityLevel["EASY"] = "easy";
    FeasibilityLevel["TRIVIAL"] = "trivial";
    // Add missing values for compatibility
    FeasibilityLevel["VERY_HIGH"] = "very_high";
    FeasibilityLevel["HIGH"] = "high";
    FeasibilityLevel["MEDIUM"] = "medium";
    FeasibilityLevel["LOW"] = "low";
    FeasibilityLevel["VERY_LOW"] = "very_low";
})(FeasibilityLevel || (FeasibilityLevel = {}));
export var RiskLevel;
(function (RiskLevel) {
    RiskLevel["EXTREME"] = "extreme";
    RiskLevel["HIGH"] = "high";
    RiskLevel["MODERATE"] = "moderate";
    RiskLevel["LOW"] = "low";
    RiskLevel["MINIMAL"] = "minimal";
    // Add missing values for compatibility
    RiskLevel["CRITICAL"] = "critical";
    RiskLevel["MEDIUM"] = "medium";
})(RiskLevel || (RiskLevel = {}));
// LangGraph State Annotation
export const AgentStateAnnotation = Annotation.Root({
    context: (Annotation),
    reactive: (Annotation),
    cognitive: (Annotation),
    executive: (Annotation),
    metadata: (Annotation),
    antiIdleSystem: (Annotation),
    multiAgentCoordinator: (Annotation)
});
//# sourceMappingURL=interfaces.js.map
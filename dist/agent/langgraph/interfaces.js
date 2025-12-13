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
export var PlanStatus;
(function (PlanStatus) {
    PlanStatus["PENDING"] = "pending";
    PlanStatus["ACTIVE"] = "active";
    PlanStatus["COMPLETED"] = "completed";
    PlanStatus["FAILED"] = "failed";
    PlanStatus["CANCELLED"] = "cancelled";
})(PlanStatus || (PlanStatus = {}));
export var DelegationStatus;
(function (DelegationStatus) {
    DelegationStatus["PENDING"] = "pending";
    DelegationStatus["ACCEPTED"] = "accepted";
    DelegationStatus["REJECTED"] = "rejected";
    DelegationStatus["COMPLETED"] = "completed";
    DelegationStatus["FAILED"] = "failed";
})(DelegationStatus || (DelegationStatus = {}));
// Skill types for experience tracking
export var SkillType;
(function (SkillType) {
    SkillType["COMBAT"] = "combat";
    SkillType["MINING"] = "mining";
    SkillType["BUILDING"] = "building";
    SkillType["CRAFTING"] = "crafting";
    SkillType["FARMING"] = "farming";
    SkillType["EXPLORATION"] = "exploration";
    SkillType["SOCIAL"] = "social";
    SkillType["TRADING"] = "trading";
    SkillType["MAGIC"] = "magic";
    SkillType["SURVIVAL"] = "survival";
})(SkillType || (SkillType = {}));
export var ExperienceSource;
(function (ExperienceSource) {
    ExperienceSource["PRACTICE"] = "practice";
    ExperienceSource["SUCCESS"] = "success";
    ExperienceSource["FAILURE"] = "failure";
    ExperienceSource["TEACHING"] = "teaching";
    ExperienceSource["OBSERVATION"] = "observation";
    ExperienceSource["EXPERIMENTATION"] = "experimentation";
    ExperienceSource["SOCIAL"] = "social";
    ExperienceSource["BREAKTHROUGH"] = "breakthrough";
})(ExperienceSource || (ExperienceSource = {}));
export var LearningMethod;
(function (LearningMethod) {
    LearningMethod["PRACTICE"] = "practice";
    LearningMethod["INSTRUCTION"] = "instruction";
    LearningMethod["OBSERVATION"] = "observation";
    LearningMethod["EXPERIMENTATION"] = "experimentation";
    LearningMethod["SOCIAL_LEARNING"] = "social_learning";
    LearningMethod["TRIAL_AND_ERROR"] = "trial_and_error";
})(LearningMethod || (LearningMethod = {}));
export var GoalType;
(function (GoalType) {
    GoalType["STRATEGIC"] = "strategic";
    GoalType["TACTICAL"] = "tactical";
    GoalType["OPERATIONAL"] = "operational";
    GoalType["SOCIAL"] = "social";
    GoalType["COLLABORATIVE"] = "collaborative";
})(GoalType || (GoalType = {}));
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
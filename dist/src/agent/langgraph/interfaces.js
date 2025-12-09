/**
 * Core TypeScript interfaces for the Mindcraft LangGraph hybrid agent system
 * Defines the complete agent state structure supporting both reactive and cognitive components
 */
import { Annotation } from "@langchain/langgraph";
// ============================================================================
// INTERRUPT PRIORITY SYSTEM
// ============================================================================
export var InterruptPriority;
(function (InterruptPriority) {
    InterruptPriority[InterruptPriority["EMERGENCY"] = 0] = "EMERGENCY";
    InterruptPriority[InterruptPriority["SURVIVAL"] = 1] = "SURVIVAL";
    InterruptPriority[InterruptPriority["OPPORTUNITY"] = 2] = "OPPORTUNITY";
    InterruptPriority[InterruptPriority["COGNITIVE"] = 3] = "COGNITIVE"; // Planned/goal-directed actions (>500ms)
})(InterruptPriority || (InterruptPriority = {}));
export var ProcessingPhase;
(function (ProcessingPhase) {
    ProcessingPhase["PERCEPTION"] = "perception";
    ProcessingPhase["ANALYSIS"] = "analysis";
    ProcessingPhase["PLANNING"] = "planning";
    ProcessingPhase["DECISION"] = "decision";
    ProcessingPhase["EXECUTION"] = "execution";
    ProcessingPhase["REFLECTION"] = "reflection";
})(ProcessingPhase || (ProcessingPhase = {}));
// ============================================================================
// LANGGRAPH STATE ANNOTATION
// ============================================================================
export const AgentStateAnnotation = Annotation.Root({
    // Core context
    context: (Annotation),
    // Reactive layer (always active)
    reactive: (Annotation),
    // Cognitive layer (LangGraph managed)
    cognitive: (Annotation),
    // Executive control
    executive: (Annotation),
    // System metadata
    metadata: (Annotation)
});

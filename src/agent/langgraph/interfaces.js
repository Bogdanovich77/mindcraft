/**
 * Simplified TypeScript interfaces for the Mindcraft LangGraph agent system
 *
 * This file contains the streamlined TypeScript interfaces and type definitions
 * for the simplified agent state structure, focusing on core functionality:
 * - Inter-bot communication with help requests/offers
 * - Personality-driven responses using single string interpretation
 * - Self-awareness with HP, inventory, and equipment tracking
 * - Autonomous behavior driven by goals and mandate system
 */
import { Annotation } from "@langchain/langgraph";
// LangGraph State Annotation for simplified AgentState
export const AgentStateAnnotation = Annotation.Root({
    worldContext: (Annotation),
    personality: (Annotation),
    goals: (Annotation),
    mandate: (Annotation),
    conversation: (Annotation),
    lastAction: (Annotation),
    response: (Annotation),
});

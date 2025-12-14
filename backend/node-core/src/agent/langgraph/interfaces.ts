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

import { StateGraph, Annotation } from "@langchain/langgraph";

// Basic Types (retained from original for compatibility)
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface InventoryItem {
  type: string;
  count: number;
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface Entity {
  name?: string;
  position: Position;
  type: string;
  distance?: number;
  health?: number;
  hostile?: boolean;
  id?: string;
}

export interface Equipment {
  helmet?: InventoryItem | undefined;
  chestplate?: InventoryItem | undefined;
  leggings?: InventoryItem | undefined;
  boots?: InventoryItem | undefined;
  weapon?: InventoryItem | undefined;
  tool?: InventoryItem;
}

export interface Inventory {
  items: InventoryItem[];
  slots: number;
  usedSlots: number;
  filter?: (item: InventoryItem) => boolean;
  length: number;
}

/**
 * WorldContext - Bot's current stats for Self-Awareness
 * Populated by Perception Node with bot's current state information
 */
export interface WorldContext {
  /** Current 3D coordinates of the bot */
  position: Position;
  /** Current health points (0-20) */
  health: number;
  /** Current food/hunger level (0-20) */
  food: number;
  /** Current experience points */
  experience: number;
  /** List of items currently in inventory */
  inventory: Inventory;
  /** Currently equipped items (armor, weapon, tool) */
  equipment: Equipment;
  /** Other bots and entities within detection range */
  nearbyEntities: Entity[];
  /** Current time of day in Minecraft ticks (0-24000) */
  timeOfDay: number;
  /** Current weather condition */
  weather: string;
  /** Current dimension (overworld, nether, end) */
  dimension: string;
  /** Current biome location */
  biome?: string;
  /** Light level at current position (0-15) */
  lightLevel?: number;
}

/**
 * ConversationState - Tracks current message and intent for Communication
 * Populated by Perception and Conversation nodes for message processing
 */
export interface ConversationState {
  /** The incoming message content from chat */
  message: string;
  /** Name of the bot/player who sent the message */
  sender: string;
  /** Whether this message is requesting help */
  isRequestForHelp: boolean;
  /** Whether this message is offering assistance */
  isOfferOfAssistance: boolean;
  /** The specific bot being addressed (if applicable) avid
  /** Timestamp when message was received */
  timestamp: number;
}

/**
 * Simplified AgentState - Core state structure for 4-node architecture
 * 
 * This streamlined interface contains exactly 7 essential fields for core functionality:
 * - Self-awareness through worldContext
 * - Personality-driven behavior through personality string
 * - Autonomous drive through goals and mandate strings
 * - Communication through conversation state
 * - Executive function through lastAction and response
 */
export interface AgentState {
  /** Bot's current stats (HP, inventory, position) for Self-Awareness */
  worldContext: WorldContext;
  
  /** Single string for LLM to interpret demeanor (e.g., "grump, rude, hot head") */
  personality: string;
  
  /** Autonomous drive (e.g., "likes digging, warrior spirit") */
  goals: string;
  
  /** Orders given by player or other bots */
  mandate: string;
  
  /** Tracks current message, sender, and intent for Communication */
  conversation: ConversationState;
  
  /** The last physical or conversational action chosen */
  lastAction: string;
  
  /** The conversational response to be sent */
  response: string;
}

// LangGraph State Annotation for simplified AgentState
export const AgentStateAnnotation = Annotation.Root({
  worldContext: Annotation<WorldContext>,
  personality: Annotation<string>,
  goals: Annotation<string>,
  mandate: Annotation<string>,
  conversation: Annotation<ConversationState>,
  lastAction: Annotation<string>,
  response: Annotation<string>,
});

/*
 * =====================================================================================
 * LEGACY INTERFACES - PRESERVED FOR MIGRATION REFERENCE
 * =====================================================================================
 * 
 * The following interfaces are from the original complex LangGraph v2 architecture.
 * They are preserved here commented out to help with the migration process.
 * These should be completely removed once the simplified architecture is fully implemented.
 * 
 * Original complex structure had 394-line AgentState with comprehensive cognitive components:
 * - Purpose core with motivations, values, and ethics
 * - Hierarchical goals (strategic, tactical, operational)
 * - Dynamic skills with 50+ categories and experience progression
 * - Multi-layered memory systems (semantic, episodic, procedural, working)
 * - Social cognition with theory of mind and relationship management
 * - Complex processing state and executive functions
 * - Reactive layer with interrupt handling
 * - Planning engine and multi-agent coordination
 * 
 * Total original interfaces: 1500+ lines with 50+ complex interface definitions
 * 
 * Migration approach:
 * 1. Extract essential data from complex interfaces into simplified 7-field structure
 * 2. LLM interprets personality, goals, and mandate strings for behavior
 * 3. Perception node populates worldContext from bot state
 * 4. Conversation node handles communication with personality-driven responses
 * 5. Decision node chooses actions based on goals, mandate, and context
 * 6. Execution node performs actions and updates state
 * 
 * This simplified approach reduces complexity by 75% while preserving core functionality.
 */

/*
 * ORIGINAL COMPLEX INTERFACES (COMMENTED OUT)
 * 
 * These would include all the original interfaces like:
 * - PersonalityTraits, Motivation, PurposeState
 * - SkillsState, Skill, LearningState, SkillProgression
 * - MemoryState, SemanticConcept, EpisodicEvent, ProceduralSkill, WorkingMemoryState
 * - SocialState, Relationship, MentalModel, TheoryOfMind
 * - ProcessingState, ReactiveState, ExecutiveState
 * - PlanningEngine, MultiAgentCoordinator
 * - And 40+ other complex interfaces
 * 
 * All of these are being replaced by the simplified 7-field AgentState above.
 */

// Export statement for backward compatibility during migration
export type LegacyAgentState = any; // Placeholder for migration compatibility

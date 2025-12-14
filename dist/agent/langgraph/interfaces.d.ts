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
export declare const AgentStateAnnotation: import("@langchain/langgraph").AnnotationRoot<{
    worldContext: {
        (): import("@langchain/langgraph").LastValue<WorldContext>;
        (annotation: import("@langchain/langgraph").SingleReducer<WorldContext, WorldContext>): import("@langchain/langgraph").BinaryOperatorAggregate<WorldContext, WorldContext>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    personality: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    goals: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    mandate: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    conversation: {
        (): import("@langchain/langgraph").LastValue<ConversationState>;
        (annotation: import("@langchain/langgraph").SingleReducer<ConversationState, ConversationState>): import("@langchain/langgraph").BinaryOperatorAggregate<ConversationState, ConversationState>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    lastAction: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    response: {
        (): import("@langchain/langgraph").LastValue<string>;
        (annotation: import("@langchain/langgraph").SingleReducer<string, string>): import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
}>;
export type LegacyAgentState = any;
//# sourceMappingURL=interfaces.d.ts.map
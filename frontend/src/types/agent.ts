// Agent state type definitions based on simplified LangGraph architecture
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Inventory {
  items: InventoryItem[];
  slots: number;
  usedSlots: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  durability?: number;
  maxDurability?: number;
  enchantments?: string[];
}

export interface WorldContext {
  position: Position;
  health: number;
  food: number;
  experience: number;
  level: number;
  dimension: string;
  timeOfDay: number;
  weather: string;
  nearbyEntities: Entity[];
  nearbyBlocks: Block[];
  inventory: Inventory;
  equipment: Equipment;
}

export interface Entity {
  id: string;
  type: string;
  name?: string;
  position: Position;
  health?: number;
  hostile?: boolean;
  distance?: number;
}

export interface Block {
  type: string;
  position: Position;
  distance?: number;
}

export interface Equipment {
  helmet?: InventoryItem;
  chestplate?: InventoryItem;
  leggings?: InventoryItem;
  boots?: InventoryItem;
  weapon?: InventoryItem;
  tool?: InventoryItem;
}

export interface ConversationState {
  message: string;
  sender: string;
  isRequestForHelp: boolean;
  isOfferOfAssistance: boolean;
  targetBot?: string;
  timestamp: number;
}

// Simplified Agent State with exactly 7 core fields
export interface AgentState {
  id: string;
  name: string;
  profile: string;
  status: 'online' | 'offline' | 'idle' | 'busy';
  lastUpdate: number;
  
  // Core 7 fields for simplified architecture
  worldContext: WorldContext;
  personality: string;
  goals: string;
  mandate: string;
  conversation: ConversationState;
  lastAction: string;
  response: string;
}

// Socket.IO Event Types (simplified)
export interface AgentUpdateEvent {
  agentId: string;
  state: Partial<AgentState>;
  timestamp: number;
}

export interface AgentListEvent {
  agents: AgentSummary[];
  timestamp: number;
}

export interface AgentSummary {
  id: string;
  name: string;
  profile: string;
  status: string;
  position: Position;
  health: number;
  level: number;
  lastUpdate: number;
}

export interface SystemStatusEvent {
  status: 'online' | 'offline' | 'maintenance';
  message?: string;
  timestamp: number;
}

// UI State Types (simplified)
export interface DashboardState {
  selectedAgent: string | null;
  agents: Record<string, AgentState>;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  systemStatus: 'online' | 'offline' | 'maintenance';
  loading: boolean;
  error: string | null;
  activeTab: string;
}

// Chart Data Types (kept for compatibility)
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface PerformanceChartData {
  responseTime: ChartDataPoint[];
  successRate: ChartDataPoint[];
  memoryUsage: ChartDataPoint[];
  cpuUsage: ChartDataPoint[];
}

// Legacy types - marked as deprecated
/** @deprecated Use simplified AgentState instead */
export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  riskTolerance: number;
  creativity: number;
  patience: number;
  competitiveness: number;
  curiosity: number;
}

/** @deprecated Use string personality field instead */
export interface PurposeState {
  identity: {
    name: string;
    role: string;
    background: string;
    corePurpose: string;
  };
  personality: PersonalityTraits;
  motivations: any[];
  values: any[];
  ethics: {
    harmAvoidance: number;
    fairness: number;
    loyalty: number;
    authority: number;
    purity: number;
  };
}

/** @deprecated Use simplified AgentState instead */
export interface MemoryState {
  semantic: any;
  episodic: any;
  procedural: any;
  working: any;
}

/** @deprecated Use simplified AgentState instead */
export interface SocialState {
  relationships: Record<string, any>;
  reputation: any;
  socialContext: any;
  mentalModels: Record<string, any>;
}

/** @deprecated Use simplified AgentState instead */
export interface ExecutiveState {
  currentAction: any;
  actionQueue: any[];
  decisionHistory: any[];
  performanceMetrics: any;
  conversationalResponse?: string;
  lastResponse?: any;
  responseHistory: any[];
  processingMode: 'conversational' | 'action';
}

/** @deprecated Use simplified AgentState instead */
export interface ReactiveState {
  activeMode: string;
  emergencyConditions: any[];
  lastReactiveAction: any;
  interruptHistory: any[];
}

/** @deprecated Use simplified AgentState instead */
export interface ProcessingState {
  currentPhase: 'perception' | 'analysis' | 'planning' | 'decision' | 'execution' | 'reflection';
  cognitiveLoad: number;
  attentionLevel: number;
  processingHistory: any[];
}
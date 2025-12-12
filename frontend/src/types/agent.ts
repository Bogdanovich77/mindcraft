// Agent state type definitions based on LangGraph architecture

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

// Cognitive State Types
export interface PersonalityTraits {
  openness: number;        // 0-1
  conscientiousness: number; // 0-1
  extraversion: number;     // 0-1
  agreeableness: number;    // 0-1
  neuroticism: number;      // 0-1
  riskTolerance: number;    // 0-1
  creativity: number;        // 0-1
  patience: number;          // 0-1
  competitiveness: number;   // 0-1
  curiosity: number;         // 0-1
}

export interface Motivation {
  id: string;
  type: string;
  strength: number;         // 0-1
  satisfaction: number;      // 0-1
  priority: number;         // 1-10
}

export interface Value {
  id: string;
  name: string;
  importance: number;       // 0-1
  priority: number;         // 1-10
}

export interface PurposeState {
  identity: {
    name: string;
    role: string;
    background: string;
    corePurpose: string;
  };
  personality: PersonalityTraits;
  motivations: Motivation[];
  values: Value[];
  ethics: {
    harmAvoidance: number;
    fairness: number;
    loyalty: number;
    authority: number;
    purity: number;
  };
}

export interface Skill {
  type: string;
  proficiency: {
    overall: number;         // 0-1
    knowledge: number;       // 0-1
    practical: number;       // 0-1
    creative: number;         // 0-1
  };
  experience: number;
  level: number;
  components: {
    knowledge: number;
    practical: number;
    creative: number;
  };
  learning: {
    rate: number;
    plateau: boolean;
    breakthrough: boolean;
  };
  usage: {
    frequency: number;
    success: number;
    efficiency: number;
  };
}

export interface Goal {
  id: string;
  type: 'strategic' | 'tactical' | 'operational';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'active' | 'completed' | 'failed' | 'paused';
  description: string;
  createdAt: number;
  updatedAt: number;
  dependencies: string[];
  resources: {
    required: ResourceRequirement[];
    allocated: ResourceRequirement[];
  };
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  isAntiIdle?: boolean;
}

export interface ResourceRequirement {
  type: string;
  amount: number;
  priority: number;
}

export interface MemoryState {
  semantic: {
    concepts: Record<string, any>;
    facts: Record<string, any>;
    relationships: Record<string, any>;
  };
  episodic: {
    events: EpisodicEvent[];
    conversations: ConversationEvent[];
    experiences: ExperienceEvent[];
  };
  procedural: {
    skills: Record<string, any>;
    procedures: Record<string, any>;
    habits: Record<string, any>;
  };
  working: {
    currentFocus: string;
    activeTasks: string[];
    conversationContext: any;
    buffer: any[];
  };
}

export interface EpisodicEvent {
  id: string;
  timestamp: number;
  type: string;
  description: string;
  context: any;
  importance: number;
  accessibility: number;
}

export interface ConversationEvent {
  id: string;
  timestamp: number;
  source: string;
  message: string;
  response?: string;
  context: any;
}

export interface ExperienceEvent {
  id: string;
  timestamp: number;
  skillType: string;
  amount: number;
  source: string;
  context: any;
  outcome: string;
}

export interface ProcessingState {
  currentPhase: 'perception' | 'analysis' | 'planning' | 'decision' | 'execution' | 'reflection';
  cognitiveLoad: number;     // 0-1
  attentionLevel: number;     // 0-1
  processingHistory: ProcessingRecord[];
}

export interface ProcessingRecord {
  timestamp: number;
  phase: string;
  duration: number;
  success: boolean;
  context: any;
}

export interface ReactiveState {
  activeMode: string;
  emergencyConditions: EmergencyCondition[];
  lastReactiveAction: ReactiveAction;
  interruptHistory: InterruptEvent[];
}

export interface EmergencyCondition {
  type: string;
  severity: number;
  timestamp: number;
  context: any;
}

export interface ReactiveAction {
  mode: string;
  priority: number;
  timestamp: number;
  context: any;
  outcome: string;
}

export interface InterruptEvent {
  timestamp: number;
  priority: number;
  source: string;
  context: any;
  action: string;
}

export interface ExecutiveState {
  currentAction: Action;
  actionQueue: Action[];
  decisionHistory: DecisionRecord[];
  performanceMetrics: PerformanceMetrics;
  conversationalResponse?: string;
  lastResponse?: ResponseRecord;
  responseHistory: ResponseRecord[];
  processingMode: 'conversational' | 'action';
}

export interface Action {
  id: string;
  type: string;
  description: string;
  priority: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  context: any;
}

export interface DecisionRecord {
  timestamp: number;
  context: any;
  options: ActionOption[];
  selected: ActionOption;
  reasoning: string;
  outcome: string;
}

export interface ActionOption {
  action: Action;
  utility: number;
  risk: number;
  confidence: number;
  reasoning: string;
}

export interface PerformanceMetrics {
  reactiveResponseTime: number;
  cognitiveProcessingTime: number;
  successRate: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ResponseRecord {
  source: string;
  message: string;
  response: string;
  timestamp: number;
  processingMode: 'conversational' | 'action';
  responseTime: number;
  success: boolean;
}

// Social State Types
export interface SocialState {
  relationships: Record<string, Relationship>;
  reputation: Reputation;
  socialContext: SocialContext;
  mentalModels: Record<string, MentalModel>;
}

export interface Relationship {
  agentId: string;
  name: string;
  trustLevel: number;        // 0-1
  friendshipScore: number;   // 0-1
  respectLevel: number;       // 0-1
  interactionHistory: InteractionEvent[];
  lastInteraction: number;
  status: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'ally' | 'enemy';
}

export interface Reputation {
  globalScore: number;       // -1 to 1
  factionScores: Record<string, number>;
  traitScores: Record<string, number>;
  recentEvents: ReputationEvent[];
}

export interface SocialContext {
  currentSituation: string;
  nearbyAgents: string[];
  socialNorms: string[];
  culturalContext: string;
  groupDynamics: any;
}

export interface MentalModel {
  agentId: string;
  personality: PersonalityTraits;
  intentions: IntentionPrediction[];
  emotions: EmotionalState;
  capabilities: Skill[];
  beliefs: Record<string, any>;
  lastUpdated: number;
}

export interface InteractionEvent {
  timestamp: number;
  type: string;
  outcome: string;
  impact: number;
  context: any;
}

export interface ReputationEvent {
  timestamp: number;
  type: string;
  impact: number;
  source: string;
  description: string;
}

export interface IntentionPrediction {
  intention: string;
  confidence: number;
  timeframe: number;
  context: any;
}

export interface EmotionalState {
  current: string;
  intensity: number;
  valence: number;          // -1 to 1 (negative to positive)
  arousal: number;          // 0-1 (calm to excited)
  lastUpdated: number;
}

// Main Agent State
export interface AgentState {
  id: string;
  name: string;
  profile: string;
  status: 'online' | 'offline' | 'idle' | 'busy';
  lastUpdate: number;
  
  // Core state components
  context: WorldContext;
  reactive: ReactiveState;
  cognitive: {
    purpose: PurposeState;
    goals: {
      strategicGoals: Goal[];
      tacticalGoals: Goal[];
      operationalGoals: Goal[];
      activeGoals: Goal[];
      goalHistory: Goal[];
    };
    skills: Record<string, Skill>;
    memory: MemoryState;
    processing: ProcessingState;
  };
  executive: ExecutiveState;
  social: SocialState;
}

// Socket.IO Event Types
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

// UI State Types
export interface DashboardState {
  selectedAgent: string | null;
  agents: Record<string, AgentState>;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  systemStatus: 'online' | 'offline' | 'maintenance';
  loading: boolean;
  error: string | null;
  activeTab: string;
}

// Chart Data Types
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

export interface SkillProgressData {
  skillName: string;
  current: number;
  target: number;
  progress: number;
  trend: 'up' | 'down' | 'stable';
}

export interface GoalProgressData {
  goalId: string;
  description: string;
  progress: number;
  priority: string;
  status: string;
  deadline?: number;
}
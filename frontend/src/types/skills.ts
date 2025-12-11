/**
 * Skills System TypeScript Interfaces
 * 
 * This file contains comprehensive TypeScript interfaces for the skills progression
 * visualization system, including skill types, progression data, learning curves,
 * synergy mapping, and all skill-related data structures.
 */

// ============================================================================
// Core Skill Data Types
// ============================================================================

export const SkillType = {
  // Combat Skills
  COMBAT: 'combat',
  ARCHERY: 'archery',
  SWORDSMANSHIP: 'swordsmanship',
  DEFENSE: 'defense',
  MAGIC: 'magic',
  
  // Crafting Skills
  CRAFTING: 'crafting',
  ALCHEMY: 'alchemy',
  ENCHANTING: 'enchanting',
  SMITHING: 'smithing',
  COOKING: 'cooking',
  
  // Exploration Skills
  EXPLORATION: 'exploration',
  NAVIGATION: 'navigation',
  SURVIVAL: 'survival',
  SCOUTING: 'scouting',
  
  // Building Skills
  BUILDING: 'building',
  ARCHITECTURE: 'architecture',
  CONSTRUCTION: 'construction',
  
  // Social Skills
  COMMUNICATION: 'communication',
  LEADERSHIP: 'leadership',
  NEGOTIATION: 'negotiation',
  TEACHING: 'teaching',
  
  // Resource Skills
  MINING: 'mining',
  LUMBERJACKING: 'lumberjacking',
  FARMING: 'farming',
  HUNTING: 'hunting',
  
  // Knowledge Skills
  RESEARCH: 'research',
  ANALYSIS: 'analysis',
  PLANNING: 'planning',
  
  // Artistic Skills
  ART: 'art',
  MUSIC: 'music',
  WRITING: 'writing',
  
  // Technical Skills
  MECHANICS: 'mechanics',
  PROGRAMMING: 'programming',
  ENGINEERING: 'engineering',
  
  // Business Skills
  TRADING: 'trading',
  MANAGEMENT: 'management',
  ENTREPRENEURSHIP: 'entrepreneurship'
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];

export const SkillCategory = {
  COMBAT: 'combat',
  CRAFTING: 'crafting',
  EXPLORATION: 'exploration',
  BUILDING: 'building',
  SOCIAL: 'social',
  RESOURCE: 'resource',
  KNOWLEDGE: 'knowledge',
  ARTISTIC: 'artistic',
  TECHNICAL: 'technical',
  BUSINESS: 'business'
} as const;

export type SkillCategory = typeof SkillCategory[keyof typeof SkillCategory];

export const ExperienceSource = {
  PRACTICE: 'practice',
  TEACHING: 'teaching',
  OBSERVATION: 'observation',
  COLLABORATION: 'collaboration',
  CHALLENGE: 'challenge',
  MISTAKE: 'mistake',
  RESEARCH: 'research',
  EXPERIMENTATION: 'experimentation'
} as const;

export type ExperienceSource = typeof ExperienceSource[keyof typeof ExperienceSource];

// ============================================================================
// Basic Skill Interfaces
// ============================================================================

export interface Skill {
  id: string;
  type: SkillType;
  category: SkillCategory;
  name: string;
  description: string;
  
  // Proficiency metrics
  proficiency: ProficiencyMetrics;
  
  // Skill components
  components: SkillComponents;
  
  // Learning characteristics
  learning: LearningCharacteristics;
  
  // Usage statistics
  usage: UsageStatistics;
  
  // Milestones and achievements
  milestones: SkillMilestone[];
  
  // Synergies with other skills
  synergies: SkillSynergy[];
  
  // Metadata
  metadata: {
    createdAt: number;
    lastUpdated: number;
    totalExperience: number;
    practiceTime: number;
    difficulty: number; // 0-1 scale
    prerequisites: string[]; // Skill IDs
    unlocks: string[]; // Skill IDs
  };
}

export interface ProficiencyMetrics {
  overall: number;           // 0-1 scale
  knowledge: number;         // 0-1 scale
  practical: number;         // 0-1 scale
  creative: number;          // 0-1 scale
  
  // Sub-skills
  subSkills: Map<string, number>; // sub-skill name -> proficiency
  
  // Progress tracking
  currentLevel: number;
  experienceToNext: number;
  totalExperience: number;
  
  // Performance metrics
  accuracy: number;          // 0-1 scale
  efficiency: number;        // 0-1 scale
  consistency: number;       // 0-1 scale
}

export interface SkillComponents {
  theoretical: number;       // Knowledge component
  practical: number;         // Hands-on application
  creative: number;          // Innovation and adaptation
  
  // Component breakdown
  knowledgeAreas: {
    name: string;
    proficiency: number;
    lastPracticed: number;
  }[];
  
  practicalSkills: {
    name: string;
    proficiency: number;
    lastUsed: number;
    successRate: number;
  }[];
  
  creativeAbilities: {
    name: string;
    proficiency: number;
    lastDemonstrated: number;
    innovationScore: number;
  }[];
}

export interface LearningCharacteristics {
  learningRate: number;       // Base learning rate
  personalityFactors: {
    openness: number;         // How open to new techniques
    conscientiousness: number; // How diligent in practice
    riskTolerance: number;    // Willingness to try difficult methods
    creativity: number;       // Creative problem solving
    curiosity: number;        // Desire to learn more
  };
  
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  
  // Learning modifiers
  environmentModifiers: {
    solo: number;             // Learning alone multiplier
    group: number;            // Learning with others multiplier
    teaching: number;         // Learning by teaching multiplier
    competitive: number;      // Learning under competition multiplier
  };
  
  // Retention and decay
  retentionRate: number;      // How well skill is retained
  decayRate: number;          // How quickly skill decays without practice
  
  // Plateau handling
  plateauThreshold: number;   // Experience needed to overcome plateau
  breakthroughProbability: number; // Chance of breakthrough
}

export interface UsageStatistics {
  totalUses: number;
  successfulUses: number;
  failedUses: number;
  
  // Usage over time
  usageHistory: {
    timestamp: number;
    success: boolean;
    duration: number;
    context: string;
    experience: number;
  }[];
  
  // Recent performance
  recentPerformance: {
    successRate: number;
    averageTime: number;
    qualityScore: number;
    efficiency: number;
  };
  
  // Context usage
  usageByContext: Map<string, number>; // context -> usage count
  
  // Time patterns
  usagePatterns: {
    preferredTimeOfDay: number[];
    weeklyFrequency: number;
    monthlyTrend: number;
  };
}

// ============================================================================
// Experience and Learning Types
// ============================================================================

export interface ExperienceEvent {
  id: string;
  skillId: string;
  amount: number;
  source: ExperienceSource;
  context: LearningContext;
  timestamp: number;
  description: string;
  
  // Learning factors
  difficulty: number;         // 0-1 scale
  riskLevel: number;          // 0-1 scale
  novelty: number;            // 0-1 scale
  
  // Social context
  socialContext: 'solo' | 'pair' | 'group' | 'teaching' | 'learning';
  
  // Outcome
  success: boolean;
  quality: number;            // 0-1 scale
  efficiency: number;         // 0-1 scale
  
  // Learning impact
  learningGain: number;
  retentionBoost: number;
  
  // Metadata
  metadata?: {
    [key: string]: any;
  };
}

export interface LearningContext {
  situation: string;
  location?: {
    x: number;
    y: number;
    z: number;
  };
  participants: string[];
  tools: string[];
  conditions: string[];
  objectives: string[];
  challenges: string[];
}

export interface SkillProgression {
  skillId: string;
  
  // Historical data
  experienceHistory: ExperiencePoint[];
  levelHistory: LevelProgress[];
  
  // Learning curve data
  learningCurve: LearningCurveData;
  
  // Performance trends
  performanceTrends: PerformanceTrend[];
  
  // Milestone progress
  milestoneProgress: MilestoneProgress[];
  
  // Predictions and forecasts
  predictions: SkillPrediction[];
  
  // Analytics
  analytics: SkillAnalytics;
}

export interface ExperiencePoint {
  timestamp: number;
  amount: number;
  cumulative: number;
  source: ExperienceSource;
  context: string;
  efficiency: number;
}

export interface LevelProgress {
  level: number;
  achievedAt: number;
  experienceRequired: number;
  timeSpent: number;
  practiceSessions: number;
}

export interface LearningCurveData {
  // Actual learning curve
  dataPoints: {
    x: number; // Experience or time
    y: number; // Proficiency
    timestamp: number;
  }[];
  
  // Curve parameters
  parameters: {
    learningRate: number;
    asymptote: number;
    inflectionPoint: number;
    steepness: number;
  };
  
  // Plateau detection
  plateaus: {
    start: number;
    end: number;
    duration: number;
    severity: number;
  }[];
  
  // Breakthrough events
  breakthroughs: {
    timestamp: number;
    proficiencyBefore: number;
    proficiencyAfter: number;
    trigger: string;
  }[];
}

export interface PerformanceTrend {
  timestamp: number;
  metric: 'accuracy' | 'efficiency' | 'consistency' | 'quality' | 'speed';
  value: number;
  context: string;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
}

export interface MilestoneProgress {
  milestoneId: string;
  name: string;
  description: string;
  requiredLevel: number;
  currentProgress: number; // 0-1 scale
  achievedAt?: number;
  abilities: string[];
  unlocked: boolean;
}

export interface SkillPrediction {
  type: 'level' | 'proficiency' | 'milestone' | 'plateau';
  timeframe: number; // Future timestamp
  confidence: number; // 0-1 scale
  predictedValue: number;
  factors: string[];
  accuracy: number; // Historical accuracy
}

// ============================================================================
// Synergy and Transfer Learning Types
// ============================================================================

export interface SkillSynergy {
  id: string;
  sourceSkillId: string;
  targetSkillId: string;
  
  // Synergy characteristics
  type: SynergyType;
  strength: number; // 0-1 scale
  direction: 'unidirectional' | 'bidirectional';
  
  // Learning transfer
  transferRate: number; // How much experience transfers
  transferEfficiency: number; // Efficiency of transfer
  
  // Context dependency
  contextDependency: number; // How context-dependent the synergy is
  applicableContexts: string[];
  
  // Evolution
  evolution: {
    discoveredAt: number;
    strengthenedAt: number;
    masteryLevel: number; // 0-1 scale
  };
}

export const SynergyType = {
  DIRECT: 'direct',           // Skills directly support each other
  ANALOGICAL: 'analogical',   // Similar concepts transfer
  CREATIVE: 'creative',       // Creative application of skills
  SEQUENTIAL: 'sequential',   // One skill builds on another
  PARALLEL: 'parallel',       // Skills practiced together
  INDIRECT: 'indirect'        // Subtle connections
} as const;

export type SynergyType = typeof SynergyType[keyof typeof SynergyType];

export interface TransferLearningEvent {
  id: string;
  sourceSkillId: string;
  targetSkillId: string;
  synergyId: string;
  
  // Transfer details
  experienceTransferred: number;
  efficiency: number; // 0-1 scale
  context: string;
  
  // Learning impact
  learningBoost: number;
  retentionImprovement: number;
  
  timestamp: number;
  description: string;
}

// ============================================================================
// Milestone and Achievement Types
// ============================================================================

export interface SkillMilestone {
  id: string;
  name: string;
  description: string;
  level: number;
  
  // Requirements
  requirements: {
    proficiency: number;
    experience: number;
    practiceTime: number;
    specificTasks?: string[];
  };
  
  // Rewards
  rewards: {
    abilities: string[];
    unlocks: string[];
    bonuses: {
      learningRate: number;
      efficiency: number;
      reputation: number;
    };
  };
  
  // Progress tracking
  progress: number; // 0-1 scale
  achievedAt?: number;
  
  // Dependencies
  prerequisites: string[]; // Other milestone IDs
  unlocks: string[]; // Milestone IDs this unlocks
}

export interface SkillAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // Achievement criteria
  criteria: {
    skillType?: SkillType;
    level: number;
    proficiency: number;
    specialConditions?: string[];
  };
  
  // Rewards
  rewards: {
    title: string;
    badge: string;
    bonuses: {
      learning: number;
      social: number;
      reputation: number;
    };
  };
  
  // Status
  achieved: boolean;
  achievedAt?: number;
  progress: number; // 0-1 scale
}

// ============================================================================
// Analytics and Insights Types
// ============================================================================

export interface SkillAnalytics {
  // Performance metrics
  performance: {
    averageAccuracy: number;
    averageEfficiency: number;
    averageQuality: number;
    consistencyScore: number;
  };
  
  // Learning metrics
  learning: {
    totalLearningTime: number;
    averageSessionLength: number;
    learningVelocity: number;
    retentionRate: number;
  };
  
  // Progress metrics
  progress: {
    levelUpRate: number;
    milestoneCompletionRate: number;
    skillMasteryProgress: number;
    overallDevelopmentScore: number;
  };
  
  // Usage metrics
  usage: {
    totalSessions: number;
    averageSessionFrequency: number;
    preferredContexts: string[];
    usagePatterns: UsagePattern[];
  };
  
  // Social metrics
  social: {
    collaborationFrequency: number;
    teachingOccurrences: number;
    learningFromOthers: number;
    socialLearningEfficiency: number;
  };
  
  // Insights and recommendations
  insights: SkillInsight[];
  recommendations: SkillRecommendation[];
}

export interface UsagePattern {
  pattern: string;
  frequency: number;
  efficiency: number;
  context: string;
  timeOfDay: number[];
}

export interface SkillInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'trend' | 'anomaly';
  title: string;
  description: string;
  confidence: number; // 0-1 scale
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  timestamp: number;
  metadata?: {
    [key: string]: any;
  };
}

export interface SkillRecommendation {
  id: string;
  type: RecommendationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Recommendation details
  title: string;
  description: string;
  rationale: string;
  
  // Expected outcomes
  expectedBenefits: {
    learningGain: number;
    efficiencyImprovement: number;
    synergyUnlock: string[];
  };
  
  // Implementation
  actionItems: string[];
  estimatedTime: number;
  difficulty: number; // 0-1 scale
  
  // Context
  context: string[];
  prerequisites: string[];
  
  // Validity
  validUntil: number;
  confidence: number; // 0-1 scale
}

export const RecommendationType = {
  PRACTICE: 'practice',
  LEARN: 'learn',
  COLLABORATE: 'collaborate',
  TEACH: 'teach',
  CHALLENGE: 'challenge',
  SPECIALIZE: 'specialize',
  DIVERSIFY: 'diversify',
  REVIEW: 'review'
} as const;

export type RecommendationType = typeof RecommendationType[keyof typeof RecommendationType];

// ============================================================================
// Visualization and UI Types
// ============================================================================

export interface SkillsVisualizationConfig {
  progressionCharts: {
    showExperienceHistory: boolean;
    showLearningCurve: boolean;
    showMilestones: boolean;
    showPredictions: boolean;
    colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'rainbow';
    animationEnabled: boolean;
  };
  
  learningAnalysis: {
    showPlateaus: boolean;
    showBreakthroughs: boolean;
    showEfficiency: boolean;
    showRetention: boolean;
    timeRange: { start: number; end: number };
    granularity: 'hour' | 'day' | 'week' | 'month';
  };
  
  synergyMapping: {
    showTransferPaths: boolean;
    showStrengthIndicators: boolean;
    showDirectionality: boolean;
    layoutAlgorithm: 'force' | 'circular' | 'hierarchical';
    threshold: number;
  };
  
  milestoneTracking: {
    showProgressBars: boolean;
    showDependencies: boolean;
    showTimeline: boolean;
    sortBy: 'level' | 'progress' | 'difficulty' | 'date';
    showCompleted: boolean;
  };
  
  performanceTrends: {
    metrics: ('accuracy' | 'efficiency' | 'consistency' | 'quality' | 'speed')[];
    showMovingAverage: boolean;
    showPredictions: boolean;
    timeWindow: number; // days
    smoothingFactor: number;
  };
  
  skillComparison: {
    compareBy: 'proficiency' | 'experience' | 'level' | 'progress';
    showSynergies: boolean;
    showDifferences: boolean;
    highlightStrengths: boolean;
    groupByCategory: boolean;
  };
  
  experienceAnalysis: {
    showSources: boolean;
    showContexts: boolean;
    showEfficiency: boolean;
    showRetention: boolean;
    aggregationLevel: 'daily' | 'weekly' | 'monthly';
  };
  
  recommendations: {
    showPriority: boolean;
    showDifficulty: boolean;
    showTimeEstimate: boolean;
    showBenefits: boolean;
    maxRecommendations: number;
    filterByType: RecommendationType[];
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface SkillProgressionVisualizationProps {
  agentId?: string;
  skillId?: string;
  config?: Partial<SkillsVisualizationConfig>;
  onSkillSelect?: (skillId: string) => void;
  onMilestoneSelect?: (milestoneId: string) => void;
  onSynergySelect?: (synergyId: string) => void;
  className?: string;
}

export interface ProgressionChartsProps {
  skills: Skill[];
  progression: SkillProgression[];
  config: SkillsVisualizationConfig['progressionCharts'];
  onSkillSelect?: (skillId: string) => void;
  onTimeSelect?: (timestamp: number) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface LearningCurveAnalysisProps {
  learningCurve: LearningCurveData;
  skill: Skill;
  config: SkillsVisualizationConfig['learningAnalysis'];
  onPlateauSelect?: (plateau: any) => void;
  onBreakthroughSelect?: (breakthrough: any) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface SkillSynergyMappingProps {
  skills: Skill[];
  synergies: SkillSynergy[];
  transferEvents: TransferLearningEvent[];
  config: SkillsVisualizationConfig['synergyMapping'];
  onSynergySelect?: (synergy: SkillSynergy) => void;
  onTransferSelect?: (transfer: TransferLearningEvent) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface MilestoneTrackingProps {
  milestones: SkillMilestone[];
  progress: MilestoneProgress[];
  config: SkillsVisualizationConfig['milestoneTracking'];
  onMilestoneSelect?: (milestone: SkillMilestone) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface PerformanceTrendsProps {
  trends: PerformanceTrend[];
  skill: Skill;
  config: SkillsVisualizationConfig['performanceTrends'];
  onTrendSelect?: (trend: PerformanceTrend) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface SkillComparisonProps {
  skills: Skill[];
  selectedSkills: string[];
  config: SkillsVisualizationConfig['skillComparison'];
  onSkillSelect?: (skillId: string) => void;
  onComparisonChange?: (skillIds: string[]) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface ExperienceRateAnalysisProps {
  experienceHistory: ExperiencePoint[];
  skill: Skill;
  config: SkillsVisualizationConfig['experienceAnalysis'];
  onPeriodSelect?: (start: number, end: number) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface SkillRecommendationsProps {
  recommendations: SkillRecommendation[];
  skill: Skill;
  config: SkillsVisualizationConfig['recommendations'];
  onRecommendationSelect?: (recommendation: SkillRecommendation) => void;
  onRecommendationAccept?: (recommendationId: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

// ============================================================================
// Redux State Types
// ============================================================================

export interface SkillsState {
  // Current data
  skills: Skill[];
  selectedSkill: string | null;
  selectedSkillData: Skill | null;
  
  // Progression data
  progressions: Map<string, SkillProgression>; // skillId -> progression
  
  // Synergy data
  synergies: SkillSynergy[];
  transferEvents: TransferLearningEvent[];
  
  // Milestone data
  milestones: SkillMilestone[];
  achievements: SkillAchievement[];
  
  // Analytics and insights
  analytics: Map<string, SkillAnalytics>; // skillId -> analytics
  insights: SkillInsight[];
  recommendations: SkillRecommendation[];
  
  // Visualization state
  visualizationConfig: SkillsVisualizationConfig;
  
  // UI state
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // Real-time updates
  realTimeUpdates: boolean;
  updateFrequency: number;
  subscribedSkills: string[];
}

// ============================================================================
// Socket.IO Event Types
// ============================================================================

export interface SkillDataUpdateEvent {
  agentId: string;
  skillId: string;
  type: 'experience_gained' | 'level_up' | 'milestone_achieved' | 'synergy_discovered' | 'proficiency_change';
  data: any;
  timestamp: number;
}

export interface SkillExperienceEvent {
  skillId: string;
  experience: ExperienceEvent;
  impact: {
    proficiencyGain: number;
    levelProgress: number;
    synergyActivation: string[];
  };
  timestamp: number;
}

export interface SkillMilestoneEvent {
  skillId: string;
  milestone: SkillMilestone;
  abilities: string[];
  timestamp: number;
}

export interface SkillSynergyEvent {
  synergy: SkillSynergy;
  transferEvent: TransferLearningEvent;
  timestamp: number;
}

// ============================================================================
// Additional Helper Types
// ============================================================================

export interface SkillFilter {
  categories: SkillCategory[];
  types: SkillType[];
  levelRange: { min: number; max: number };
  proficiencyRange: { min: number; max: number };
  experienceRange: { min: number; max: number };
  tags: string[];
}

export interface SkillGroup {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  groupType: 'category' | 'synergy' | 'workflow' | 'custom';
  metadata?: {
    [key: string]: any;
  };
}

export interface SkillComparison {
  skillIds: string[];
  metrics: ('proficiency' | 'experience' | 'level' | 'progress' | 'efficiency')[];
  results: ComparisonResult[];
}

export interface ComparisonResult {
  skillId: string;
  metric: string;
  value: number;
  rank: number;
  percentile: number;
  difference: number;
}

export interface SkillDevelopmentPlan {
  skillId: string;
  targetLevel: number;
  targetProficiency: number;
  timeframe: number; // days
  milestones: PlannedMilestone[];
  practiceSchedule: PracticeSession[];
  resourceRequirements: ResourceRequirement[];
}

export interface PlannedMilestone {
  milestoneId: string;
  targetDate: number;
  prerequisites: string[];
  estimatedEffort: number;
}

export interface PracticeSession {
  id: string;
  skillId: string;
  scheduledTime: number;
  duration: number;
  context: string;
  objectives: string[];
  expectedExperience: number;
}

export interface ResourceRequirement {
  type: 'time' | 'tools' | 'materials' | 'guidance' | 'environment';
  description: string;
  quantity: number;
  availability: boolean;
}
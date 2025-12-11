// Personality visualization types extending the base agent types

import type { PersonalityTraits, ExperienceEvent } from './agent';

// Enhanced personality trait definitions for visualization
export interface PersonalityTrait {
  name: string;
  value: number;           // 0-1 scale
  label: string;
  description: string;
  category: 'big_five' | 'gaming_specific';
  color: string;
  icon?: string;
}

// Big Five traits with visualization metadata
export const BIG_FIVE_TRAITS: PersonalityTrait[] = [
  {
    name: 'openness',
    value: 0,
    label: 'Openness',
    description: 'Creativity, curiosity, and preference for novelty',
    category: 'big_five',
    color: '#9C27B0',
    icon: 'psychology'
  },
  {
    name: 'conscientiousness',
    value: 0,
    label: 'Conscientiousness',
    description: 'Organization, responsibility, and work ethic',
    category: 'big_five',
    color: '#2196F3',
    icon: 'schedule'
  },
  {
    name: 'extraversion',
    value: 0,
    label: 'Extraversion',
    description: 'Sociability, assertiveness, and emotional expression',
    category: 'big_five',
    color: '#FF9800',
    icon: 'groups'
  },
  {
    name: 'agreeableness',
    value: 0,
    label: 'Agreeableness',
    description: 'Cooperation, trust, and compassion',
    category: 'big_five',
    color: '#4CAF50',
    icon: 'handshake'
  },
  {
    name: 'neuroticism',
    value: 0,
    label: 'Neuroticism',
    description: 'Emotional stability and anxiety tendencies',
    category: 'big_five',
    color: '#F44336',
    icon: 'mood_bad'
  }
];

// Gaming-specific traits with visualization metadata
export const GAMING_SPECIFIC_TRAITS: PersonalityTrait[] = [
  {
    name: 'riskTolerance',
    value: 0,
    label: 'Risk Tolerance',
    description: 'Willingness to take risks in dangerous situations',
    category: 'gaming_specific',
    color: '#FF5722',
    icon: 'dangerous'
  },
  {
    name: 'creativity',
    value: 0,
    label: 'Creativity',
    description: 'Creative problem-solving and building abilities',
    category: 'gaming_specific',
    color: '#E91E63',
    icon: 'palette'
  },
  {
    name: 'patience',
    value: 0,
    label: 'Patience',
    description: 'Ability to wait and persist with long-term tasks',
    category: 'gaming_specific',
    color: '#673AB7',
    icon: 'hourglass_empty'
  },
  {
    name: 'competitiveness',
    value: 0,
    label: 'Competitiveness',
    description: 'Drive to compete and win against others',
    category: 'gaming_specific',
    color: '#3F51B5',
    icon: 'emoji_events'
  },
  {
    name: 'curiosity',
    value: 0,
    label: 'Curiosity',
    description: 'Desire to explore and discover new things',
    category: 'gaming_specific',
    color: '#009688',
    icon: 'explore'
  }
];

// Personality evolution data
export interface PersonalityEvolution {
  timestamp: number;
  traits: PersonalityTraits;
  experiences: ExperienceEvent[];
  influences: PersonalityInfluence[];
  significantEvents: PersonalityEvent[];
}

export interface PersonalityInfluence {
  type: 'experience' | 'social' | 'environmental' | 'internal';
  traitName: string;
  impact: number;         // -1 to 1, negative or positive influence
  source: string;
  timestamp: number;
  decay?: number;         // How quickly this influence fades (0-1)
}

export interface PersonalityEvent {
  id: string;
  timestamp: number;
  type: 'trait_change' | 'personality_shift' | 'behavioral_pattern' | 'milestone';
  description: string;
  impact: {
    traitChanges: Partial<PersonalityTraits>;
    significance: number;    // 0-1, how significant this event was
  };
  context?: any;
}

// Behavioral analysis data
export interface BehavioralPattern {
  id: string;
  name: string;
  description: string;
  traits: PersonalityTraits;
  frequency: number;       // How often this pattern occurs
  confidence: number;      // How confident we are in this pattern
  contexts: string[];      // Situations where this pattern appears
  outcomes: {
    success: number;
    failure: number;
    efficiency: number;
  };
}

export interface BehavioralInfluence {
  traitName: string;
  influences: {
    behavior: string;
    strength: number;      // 0-1, how strongly this trait influences the behavior
    direction: 'positive' | 'negative';
    context?: string;
  }[];
}

// Personality comparison data
export interface PersonalityComparison {
  agent1: {
    id: string;
    name: string;
    traits: PersonalityTraits;
  };
  agent2: {
    id: string;
    name: string;
    traits: PersonalityTraits;
  };
  similarities: TraitSimilarity[];
  differences: TraitDifference[];
  overallCompatibility: number;  // 0-1
  analysis: {
    strengths: string[];
    conflicts: string[];
    synergies: string[];
  };
}

export interface TraitSimilarity {
  traitName: string;
  value1: number;
  value2: number;
  similarity: number;      // 0-1, how similar these values are
  significance: string;    // 'low' | 'medium' | 'high'
}

export interface TraitDifference {
  traitName: string;
  value1: number;
  value2: number;
  difference: number;      // 0-1, how different these values are
  impact: string;          // 'minor' | 'moderate' | 'major'
}

// Trait correlation analysis
export interface TraitCorrelation {
  trait1: string;
  trait2: string;
  correlation: number;     // -1 to 1, negative to positive correlation
  significance: number;    // 0-1, statistical significance
  sampleSize: number;
  context?: string;
  description: string;
}

export interface CorrelationPair {
  trait1: string;
  trait2: string;
  correlation: number;
  significance: number;
  sampleSize: number;
}

export interface CorrelationMatrix {
  traits: string[];
  matrix: number[][];
  significantCorrelations: TraitCorrelation[];
  insights: {
    strongPositive: TraitCorrelation[];
    strongNegative: TraitCorrelation[];
    unexpected: TraitCorrelation[];
  };
}

// Visualization data structures
export interface RadarChartData {
  trait: string;
  value: number;
  fill?: string;
}

export interface TimelineData {
  timestamp: number;
  traits: Partial<PersonalityTraits>;
  events?: PersonalityEvent[];
}

export interface MatrixCell {
  row: string;
  column: string;
  value: number;
  color: string;
  label?: string;
}

// UI State for personality components
export interface PersonalityUIState {
  selectedAgent: string | null;
  comparisonAgents: string[];
  timeRange: {
    start: number;
    end: number;
  };
  visualizationMode: 'radar' | 'timeline' | 'matrix' | 'comparison' | 'correlation';
  filters: {
    traitCategories: ('big_five' | 'gaming_specific')[];
    minSignificance: number;
    showEvents: boolean;
    showInfluences: boolean;
  };
  loading: boolean;
  error: string | null;
}

// Redux action types
export interface PersonalityState {
  agents: Map<string, PersonalityEvolution>;
  behavioralPatterns: Map<string, BehavioralPattern[]>;
  comparisons: Map<string, PersonalityComparison>;
  correlations: CorrelationMatrix;
  ui: PersonalityUIState;
}

// Socket event types for personality updates
export interface PersonalityUpdateEvent {
  agentId: string;
  traits: PersonalityTraits;
  timestamp: number;
  influences?: PersonalityInfluence[];
  events?: PersonalityEvent[];
}

export interface PersonalityEvolutionEvent {
  agentId: string;
  evolution: PersonalityEvolution;
  timestamp: number;
}

// Chart configuration types
export interface RadarChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  levels: number;
  maxValue: number;
  showLabels: boolean;
  showAxes: boolean;
  showLegend: boolean;
  colors: string[];
  animated: boolean;
  animationDuration: number;
}

export interface TimelineConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  showGrid: boolean;
  showEvents: boolean;
  showInfluences: boolean;
  timeFormat: string;
  colors: {
    traits: string[];
    events: string;
    influences: string;
  };
  animated?: boolean;
  animationDuration?: number;
}

export interface MatrixConfig {
  width: number;
  height: number;
  cellSize: number;
  margin: { top: number; right: number; bottom: number; left: number };
  colorScale: string[];
  showLabels: boolean;
  showValues: boolean;
  interactive: boolean;
}

// Utility types for component props
export interface PersonalityVisualizationProps {
  agentId: string;
  data: PersonalityEvolution;
  config?: Partial<RadarChartConfig>;
  onTraitClick?: (trait: string, value: number) => void;
  onEventClick?: (event: PersonalityEvent) => void;
  className?: string;
}

export interface TraitComparisonProps {
  agent1Id: string;
  agent2Id: string;
  comparison: PersonalityComparison;
  onAgentSelect?: (agentId: string) => void;
  className?: string;
}

export interface PersonalityTimelineProps {
  agentId: string;
  evolution: PersonalityEvolution[];
  config?: Partial<TimelineConfig>;
  onTimeRangeChange?: (start: number, end: number) => void;
  onEventClick?: (event: PersonalityEvent) => void;
  className?: string;
}

// Gaming traits visualization types
export interface GamingTraitsConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  animated: boolean;
  animationDuration: number;
  showLabels: boolean;
  showValues: boolean;
  colors: string[];
}

export interface GamingTraitsData {
  traits: {
    riskTolerance: number;
    creativity: number;
    patience: number;
    competitiveness: number;
    curiosity: number;
  };
  descriptions: {
    [key: string]: string;
  };
  categories: {
    [key: string]: string;
  };
}
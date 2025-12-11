// Personality visualization components for the cognitive dashboard

// Main components
export { default as PersonalityVisualization } from './PersonalityVisualization';

// Individual visualization components
export { default as TraitsRadarChart } from './TraitsRadarChart';
export { default as GamingTraitsChart } from './GamingTraitsChart';
export { default as PersonalityTimeline } from './PersonalityTimeline';
export { default as BehavioralMatrix } from './BehavioralMatrix';
export { default as TraitComparison } from './TraitComparison';
export { default as CorrelationAnalysis } from './CorrelationAnalysis';

// Re-export types for convenience
export type {
  PersonalityTrait,
  PersonalityEvolution,
  PersonalityInfluence,
  PersonalityEvent,
  BehavioralPattern,
  BehavioralInfluence,
  PersonalityComparison,
  TraitSimilarity,
  TraitDifference,
  TraitCorrelation,
  CorrelationMatrix,
  RadarChartData,
  TimelineData,
  MatrixCell,
  PersonalityUIState,
  PersonalityState,
  PersonalityUpdateEvent,
  PersonalityEvolutionEvent,
  RadarChartConfig,
  TimelineConfig,
  MatrixConfig,
  PersonalityVisualizationProps,
  TraitComparisonProps,
  PersonalityTimelineProps,
  GamingTraitsConfig,
  GamingTraitsData
} from '../../types/personality';

// Export constants
export { BIG_FIVE_TRAITS, GAMING_SPECIFIC_TRAITS } from '../../types/personality';
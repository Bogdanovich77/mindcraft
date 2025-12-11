// Memory visualization components
export { default as MemoryVisualization } from './MemoryVisualization';
export { default as SemanticMemoryGraph } from './SemanticMemoryGraph';
export { default as EpisodicMemoryTimeline } from './EpisodicMemoryTimeline';
export { default as ProceduralMemoryPatterns } from './ProceduralMemoryPatterns';
export { default as MemoryConsolidationViewer } from './MemoryConsolidationViewer';
export { default as MemorySearchTool } from './MemorySearchTool';
export { default as MemoryStrengthVisualization } from './MemoryStrengthVisualization';
export { default as MemoryCorrelationAnalysis } from './MemoryCorrelationAnalysis';

// Re-export types for convenience
export type {
  MemorySystem,
  SemanticMemory,
  EpisodicMemory,
  ProceduralMemory,
  Concept,
  Relationship,
  EpisodicEvent,
  Experience,
  ProceduralSkill,
  ActionPattern,
  SkillSequence,
  ConsolidationEvent,
  MemoryTransfer,
  MemoryDecay,
  MemorySearchResult,
  MemoryVisualizationConfig,
} from '../../types/memory';
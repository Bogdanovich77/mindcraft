/**
 * Environment System TypeScript Interfaces
 * 
 * This file contains comprehensive TypeScript interfaces for environment visualization
 * system, including agent positions, spatial regions, terrain features,
 * and environmental context data.
 */

// ============================================================================
// Core Environment Data Types
// ============================================================================

export interface AgentPosition {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  direction: number; // radians
  status: 'active' | 'idle' | 'busy' | 'offline' | 'error';
  health?: number;
  currentActivity?: string;
  velocity: {
    x: number;
    y: number;
    z?: number;
  };
  trail?: TrailPoint[];
  lastUpdate: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  z?: number;
  timestamp: number;
  opacity: number;
}

export interface EnvironmentData {
  terrain: TerrainFeature[];
  structures: StructureFeature[];
  resources: ResourceNode[];
  bounds: EnvironmentBounds;
  metadata: {
    dimension: string;
    biome: string;
    timeOfDay: number;
    weather: string;
    difficulty: number;
  };
}

export interface TerrainFeature {
  id: string;
  type: 'mountain' | 'water' | 'forest' | 'desert' | 'plains' | 'snow' | 'swamp';
  coordinates: {
    x: number;
    y: number;
    z?: number;
  }[];
  properties: {
    elevation?: number;
    passable: boolean;
    movementCost?: number;
    resources?: string[];
    dangers?: string[];
  };
  color?: string;
}

export interface StructureFeature {
  id: string;
  type: 'building' | 'bridge' | 'wall' | 'door' | 'fence' | 'tower' | 'monument';
  position: {
    x: number;
    y: number;
    z?: number;
  };
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  properties: {
    material: string;
    durability: number;
    owner?: string;
    accessLevel: 'public' | 'private' | 'restricted';
    functionality?: string[];
  };
}

export interface ResourceNode {
  id: string;
  type: 'ore' | 'wood' | 'food' | 'water' | 'energy' | 'rare';
  position: {
    x: number;
    y: number;
    z?: number;
  };
  quantity: number;
  quality: number; // 0-1 scale
  respawnRate?: number; // seconds
  depletionRate?: number; // per second
  properties: {
    harvestable: boolean;
    renewable: boolean;
    processingDifficulty?: number;
    requiredTools?: string[];
  };
}

export interface SpatialRegion {
  id: string;
  name: string;
  type: 'safe_zone' | 'danger_zone' | 'resource_area' | 'pvp_area' | 'no_build' | 'quest_area';
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  color?: string;
  description?: string;
  agentCount?: number;
  properties: {
    restrictions: string[];
    bonuses: string[];
    events?: string[];
  };
}

export interface EnvironmentBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

// ============================================================================
// Visualization and UI Types
// ============================================================================

export interface EnvironmentVisualizationConfig {
  viewMode: '2d' | '3d' | 'heatmap' | 'regions';
  showGrid: boolean;
  showLabels: boolean;
  showTrails: boolean;
  showTerrain: boolean;
  showStructures: boolean;
  showResources: boolean;
  showRegions: boolean;
  zoomLevel: number;
  trailLength: number;
  heatmapIntensity: number;
  spatialAnalysis: boolean;
  updateFrequency: number; // milliseconds
  colorScheme: 'default' | 'terrain' | 'thermal' | 'topographic' | 'population';
}

export interface EnvironmentAnalytics {
  spatialDistribution: {
    agentDensity: number;
    resourceDensity: number;
    coverage: number; // 0-1 scale
  };
  movementPatterns: {
    averageVelocity: number;
    commonRoutes: string[];
    hotspots: {
      x: number;
      y: number;
      intensity: number;
      description: string;
    }[];
  };
  resourceUtilization: {
    totalResources: number;
    harvestedResources: number;
    efficiency: number; // 0-1 scale
    depletionRate: number;
  };
  terrainAnalysis: {
    passableArea: number; // percentage
    obstacleCount: number;
    strategicPoints: {
      x: number;
      y: number;
      importance: number;
      type: string;
    }[];
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface AgentEnvironmentVisualizationProps {
  agentId?: string;
  config?: Partial<EnvironmentVisualizationConfig>;
  onAgentSelect?: (agentId: string) => void;
  onRegionSelect?: (region: SpatialRegion) => void;
  onTerrainSelect?: (terrain: TerrainFeature) => void;
  onStructureSelect?: (structure: StructureFeature) => void;
  onResourceSelect?: (resource: ResourceNode) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface SpatialAnalysisProps {
  region: SpatialRegion;
  agents: AgentPosition[];
  timeRange: { start: number; end: number };
  showHeatmap?: boolean;
  showFlowAnalysis?: boolean;
  showPathfinding?: boolean;
  onAnalysisComplete?: (analysis: SpatialAnalysisResult) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface SpatialAnalysisResult {
  regionId: string;
  agentFlow: {
    entryPoints: { x: number; y: number; timestamp: number }[];
    exitPoints: { x: number; y: number; timestamp: number }[];
    commonPaths: { start: { x: number; y: number }; end: { x: number; y: number }; frequency: number }[];
  };
  resourceDistribution: {
    type: string;
    quantity: number;
    utilization: number;
  }[];
  terrainImpact: {
    movementSpeed: number;
    visibility: number;
    tacticalAdvantage: number;
  };
  timestamp: number;
}

// ============================================================================
// Redux State Types
// ============================================================================

export interface EnvironmentState {
  // Current data
  agentPositions: Map<string, AgentPosition>;
  environmentData: EnvironmentData | null;
  spatialRegions: SpatialRegion[];
  selectedAgents: string[];
  selectedRegions: string[];
  
  // Visualization state
  visualizationConfig: EnvironmentVisualizationConfig;
  
  // Analytics
  analytics: EnvironmentAnalytics | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // Real-time updates
  realTimeUpdates: boolean;
  updateFrequency: number;
  subscribedAgents: string[];
  subscribedRegions: string[];
  
  // Bounds and scale
  environmentBounds: EnvironmentBounds | null;
  currentScale: number;
  currentOffset: { x: number; y: number };
}

// ============================================================================
// Socket.IO Event Types
// ============================================================================

export interface AgentPositionUpdateEvent {
  agentId: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  velocity?: {
    x: number;
    y: number;
    z?: number;
  };
  direction?: number;
  status?: string;
  timestamp: number;
}

export interface EnvironmentUpdateEvent {
  type: 'terrain_change' | 'structure_added' | 'structure_removed' | 'resource_spawned' | 'resource_depleted';
  data: any;
  position?: {
    x: number;
    y: number;
    z?: number;
  };
  region?: string;
  timestamp: number;
}

export interface SpatialRegionUpdateEvent {
  regionId: string;
  type: 'created' | 'modified' | 'deleted' | 'agent_entered' | 'agent_exited';
  data: any;
  agentId?: string;
  timestamp: number;
}

// ============================================================================
// Additional Helper Types
// ============================================================================

export interface EnvironmentFilter {
  agentStatus: ('active' | 'idle' | 'busy' | 'offline')[];
  terrainTypes: string[];
  structureTypes: string[];
  resourceTypes: string[];
  regionTypes: string[];
  bounds?: EnvironmentBounds;
  timeRange?: { start: number; end: number };
}

export interface EnvironmentQuery {
  type: 'nearest_agent' | 'nearest_resource' | 'path_to' | 'region_info' | 'terrain_at';
  parameters: {
    from?: { x: number; y: number };
    to?: { x: number; y: number };
    position?: { x: number; y: number };
    radius?: number;
    resourceType?: string;
    regionId?: string;
  };
  result?: any;
}

export interface PathfindingRequest {
  agentId: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  options: {
    algorithm: 'astar' | 'dijkstra' | 'jps' | 'flowfield';
    heuristic: 'manhattan' | 'euclidean' | 'diagonal';
    allowDiagonal: boolean;
    weightMap?: string;
  };
  timestamp: number;
}

export interface PathfindingResult {
  agentId: string;
  path: {
    x: number;
    y: number;
  }[];
  cost: number;
  length: number;
  algorithm: string;
  computationTime: number;
  timestamp: number;
}
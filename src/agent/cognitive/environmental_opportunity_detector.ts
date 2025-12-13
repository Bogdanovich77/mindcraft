/**
 * Environmental Opportunity Detection System
 * 
 * Scans agent's environment for opportunities that can prevent idleness
 * Identifies resources, structures, exploration areas, social interactions, and skill practice opportunities
 */

import { AgentState, PersonalityTraits, BlockInfo, EntityInfo } from '../langgraph/interfaces.js';
import { AntiIdleGoalGenerator } from './anti_idle_goal_generator.js';

/**
 * Opportunity types with priority levels
 */
export enum OpportunityType {
  RESOURCE = 'resource',
  STRUCTURE = 'structure',
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  SKILL = 'skill',
  DANGER = 'danger'
}

export enum OpportunityPriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

/**
 * Environmental opportunity definition
 */
export interface EnvironmentalOpportunity {
  id: string;
  type: OpportunityType;
  priority: OpportunityPriority;
  description: string;
  location: { x: number; y: number; z: number };
  requirements: OpportunityRequirement[];
  estimatedValue: number;
  timeWindow?: number; // milliseconds
  confidence: number; // 0-1
  personalityAlignment?: number; // 0-1
  context?: any;
}

/**
 * Requirements for pursuing an opportunity
 */
export interface OpportunityRequirement {
  type: 'tool' | 'item' | 'skill' | 'condition';
  name: string;
  quantity?: number;
  level?: number;
  description: string;
}

/**
 * Detection configuration
 */
export interface OpportunityDetectionConfig {
  scanRadius: number;           // blocks to scan around agent
  scanInterval: number;          // milliseconds between scans
  maxOpportunities: number;      // maximum opportunities to track
  minConfidence: number;         // minimum confidence to report
  personalityWeight: number;       // how much personality influences detection
  valueThresholds: {
    resource: number;
    structure: number;
    exploration: number;
    social: number;
    skill: number;
  };
}

/**
 * Detection scan results
 */
export interface OpportunityScanResult {
  timestamp: number;
  opportunities: EnvironmentalOpportunity[];
  scanDuration: number;
  areaScanned: { center: { x: number; y: number; z: number }; radius: number };
  confidence: number;
}

/**
 * Main environmental opportunity detector
 */
export class EnvironmentalOpportunityDetector {
  private config: OpportunityDetectionConfig;
  private lastScanTime: number = 0;
  private detectedOpportunities: Map<string, EnvironmentalOpportunity> = new Map();
  private scanHistory: OpportunityScanResult[] = [];

  constructor(
    private agentId: string,
    config?: Partial<OpportunityDetectionConfig>
  ) {
    this.config = {
      scanRadius: 32,           // 32 block radius
      scanInterval: 10000,       // 10 seconds
      maxOpportunities: 20,       // Track 20 opportunities
      minConfidence: 0.3,         // 30% minimum confidence
      personalityWeight: 0.7,       // 70% personality influence
      valueThresholds: {
        resource: 20,
        structure: 30,
        exploration: 25,
        social: 15,
        skill: 10
      },
      ...config
    };

    console.log(`[OPPORTUNITY_DETECTOR] Initialized for agent ${this.agentId}`);
  }

  /**
   * Scan for environmental opportunities
   */
  async scanForOpportunities(agentState: AgentState): Promise<EnvironmentalOpportunity[]> {
    const now = Date.now();
    
    // Check scan interval
    if (now - this.lastScanTime < this.config.scanInterval) {
      return Array.from(this.detectedOpportunities.values());
    }

    const startTime = Date.now();
    const opportunities: EnvironmentalOpportunity[] = [];
    const personality = this.extractPersonality(agentState);
    
    try {
      // Scan different types of opportunities
      opportunities.push(...this.detectResourceOpportunities(agentState, personality));
      opportunities.push(...this.detectStructureOpportunities(agentState, personality));
      opportunities.push(...this.detectExplorationOpportunities(agentState, personality));
      opportunities.push(...this.detectSocialOpportunities(agentState, personality));
      opportunities.push(...this.detectSkillOpportunities(agentState, personality));
      opportunities.push(...this.detectDangerOpportunities(agentState, personality));

      // Filter and prioritize opportunities
      const filteredOpportunities = this.filterAndPrioritizeOpportunities(
        opportunities, 
        personality, 
        agentState
      );

      // Update detected opportunities
      this.updateDetectedOpportunities(filteredOpportunities);

      // Record scan result
      const scanResult: OpportunityScanResult = {
        timestamp: now,
        opportunities: filteredOpportunities,
        scanDuration: Date.now() - startTime,
        areaScanned: {
          center: agentState.context.position,
          radius: this.config.scanRadius
        },
        confidence: this.calculateScanConfidence(filteredOpportunities)
      };

      this.scanHistory.push(scanResult);
      this.lastScanTime = now;

      // Keep only recent scan history
      if (this.scanHistory.length > 50) {
        this.scanHistory = this.scanHistory.slice(-50);
      }

      console.log(`[OPPORTUNITY_DETECTOR] Scan completed: ${filteredOpportunities.length} opportunities found`);
      return filteredOpportunities;

    } catch (error) {
      console.error('[OPPORTUNITY_DETECTOR] Error during opportunity scan:', error);
      return Array.from(this.detectedOpportunities.values());
    }
  }

  /**
   * Detect resource opportunities
   */
  private detectResourceOpportunities(
    agentState: AgentState,
    personality: PersonalityTraits
  ): EnvironmentalOpportunity[] {
    const opportunities: EnvironmentalOpportunity[] = [];
    const nearbyBlocks = agentState.context.nearbyBlocks || [];
    
    // Filter valuable resources
    const valuableBlocks = nearbyBlocks.filter(block => 
      this.isValuableResource(block.type) && 
      (block.accessible !== false) && 
      (block.distance !== undefined && block.distance <= this.config.scanRadius)
    );

    valuableBlocks.forEach(block => {
      const resourceType = this.getResourceType(block.type);
      const value = this.calculateResourceValue(block.type, personality);
      const priority = this.calculateResourcePriority(block.type, value);
      
      opportunities.push({
        id: `resource_${block.position.x}_${block.position.y}_${block.position.z}`,
        type: OpportunityType.RESOURCE,
        priority,
        description: `Collect ${block.type} at ${block.position}`,
        location: block.position,
        requirements: this.getResourceRequirements(block.type),
        estimatedValue: value,
        timeWindow: 60000, // 1 minute
        confidence: this.calculateResourceConfidence(block as BlockInfo),
        personalityAlignment: this.calculatePersonalityAlignment(
          OpportunityType.RESOURCE, 
          personality
        ),
        context: {
          blockType: block.type,
          distance: block.distance || 0,
          accessibility: block.accessible !== false
        }
      });
    });

    return opportunities;
  }

  /**
   * Detect structure opportunities
   */
  private detectStructureOpportunities(
    agentState: AgentState,
    personality: PersonalityTraits
  ): EnvironmentalOpportunity[] {
    const opportunities: EnvironmentalOpportunity[] = [];
    
    // Find suitable building locations
    const buildingSites = this.identifyBuildingSites(agentState);
    
    buildingSites.forEach(site => {
      const value = this.calculateStructureValue(site, personality);
      const priority = value > this.config.valueThresholds.structure ? 
        OpportunityPriority.HIGH : OpportunityPriority.MEDIUM;
      
      opportunities.push({
        id: `structure_${site.center.x}_${site.center.z}`,
        type: OpportunityType.STRUCTURE,
        priority,
        description: `Build structure at ${site.center}`,
        location: site.center,
        requirements: this.getStructureRequirements(site),
        estimatedValue: value,
        timeWindow: 300000, // 5 minutes
        confidence: this.calculateStructureConfidence(site),
        personalityAlignment: this.calculatePersonalityAlignment(
          OpportunityType.STRUCTURE, 
          personality
        ),
        context: {
          siteType: site.type,
          size: site.size,
          terrain: site.terrain
        }
      });
    });

    return opportunities;
  }

  /**
   * Detect exploration opportunities
   */
  private detectExplorationOpportunities(
    agentState: AgentState,
    personality: PersonalityTraits
  ): EnvironmentalOpportunity[] {
    const opportunities: EnvironmentalOpportunity[] = [];
    
    // Identify unexplored areas
    const unexploredAreas = this.identifyUnexploredAreas(agentState);
    
    unexploredAreas.forEach(area => {
      const value = this.calculateExplorationValue(area, personality);
      const priority = value > this.config.valueThresholds.exploration ? 
        OpportunityPriority.HIGH : OpportunityPriority.MEDIUM;
      
      opportunities.push({
        id: `exploration_${area.id}`,
        type: OpportunityType.EXPLORATION,
        priority,
        description: `Explore ${area.name} (${area.description})`,
        location: area.center,
        requirements: this.getExplorationRequirements(area),
        estimatedValue: value,
        timeWindow: 600000, // 10 minutes
        confidence: this.calculateExplorationConfidence(area),
        personalityAlignment: this.calculatePersonalityAlignment(
          OpportunityType.EXPLORATION, 
          personality
        ),
        context: {
          areaType: area.type,
          distance: area.distance,
          potentialResources: area.potentialResources
        }
      });
    });

    return opportunities;
  }

  /**
   * Detect social opportunities
   */
  private detectSocialOpportunities(
    agentState: AgentState,
    personality: PersonalityTraits
  ): EnvironmentalOpportunity[] {
    const opportunities: EnvironmentalOpportunity[] = [];
    const nearbyEntities = agentState.context.nearbyEntities || [];
    
    // Find other agents/players for social interaction
    const socialEntities = nearbyEntities.filter(entity => 
      entity.type === 'player' || entity.type === 'agent'
    );

    socialEntities.forEach(entity => {
      const entityInfo = entity as EntityInfo;
      const value = this.calculateSocialValue(entityInfo, personality);
      const priority = value > this.config.valueThresholds.social ? 
        OpportunityPriority.HIGH : OpportunityPriority.MEDIUM;
      
      opportunities.push({
        id: `social_${entity.id || entity.type}_${entity.position.x}_${entity.position.z}`,
        type: OpportunityType.SOCIAL,
        priority,
        description: `Interact with ${entity.type} at ${entity.position}`,
        location: entity.position,
        requirements: this.getSocialRequirements(entityInfo),
        estimatedValue: value,
        timeWindow: 120000, // 2 minutes
        confidence: this.calculateSocialConfidence(entityInfo),
        personalityAlignment: this.calculatePersonalityAlignment(
          OpportunityType.SOCIAL, 
          personality
        ),
        context: {
          entityType: entity.type,
          relationship: 'unknown',
          interactionType: this.suggestSocialInteraction(entityInfo, personality)
        }
      });
    });

    return opportunities;
  }

  /**
   * Detect skill practice opportunities
   */
  private detectSkillOpportunities(
    agentState: AgentState,
    personality: PersonalityTraits
  ): EnvironmentalOpportunity[] {
    const opportunities: EnvironmentalOpportunity[] = [];
    
    // Identify skill practice scenarios based on environment
    const skillScenarios = this.identifySkillScenarios(agentState);
    
    skillScenarios.forEach(scenario => {
      const value = this.calculateSkillValue(scenario, personality);
      const priority = value > this.config.valueThresholds.skill ? 
        OpportunityPriority.MEDIUM : OpportunityPriority.LOW;
      
      opportunities.push({
        id: `skill_${scenario.type}_${scenario.location.x}_${scenario.location.z}`,
        type: OpportunityType.SKILL,
        priority,
        description: `Practice ${scenario.skill} at ${scenario.location}`,
        location: scenario.location,
        requirements: this.getSkillRequirements(scenario),
        estimatedValue: value,
        timeWindow: 180000, // 3 minutes
        confidence: this.calculateSkillConfidence(scenario),
        personalityAlignment: this.calculatePersonalityAlignment(
          OpportunityType.SKILL, 
          personality
        ),
        context: {
          skillType: scenario.skill,
          difficulty: scenario.difficulty,
          practiceType: scenario.practiceType,
          expectedImprovement: scenario.expectedImprovement
        }
      });
    });

    return opportunities;
  }

  /**
   * Detect danger opportunities (threats to avoid or address)
   */
  private detectDangerOpportunities(
    agentState: AgentState,
    personality: PersonalityTraits
  ): EnvironmentalOpportunity[] {
    const opportunities: EnvironmentalOpportunity[] = [];
    const nearbyEntities = agentState.context.nearbyEntities || [];
    
    // Find hostile entities
    const hostileEntities = nearbyEntities.filter(entity => 
      entity.hostile === true && entity.distance !== undefined && entity.distance <= this.config.scanRadius
    );

    hostileEntities.forEach(entity => {
      const entityInfo = entity as EntityInfo;
      const value = this.calculateDangerValue(entityInfo, personality);
      const priority = OpportunityPriority.CRITICAL; // Always high priority
      
      opportunities.push({
        id: `danger_${entity.id || entity.type}_${entity.position.x}_${entity.position.z}`,
        type: OpportunityType.DANGER,
        priority,
        description: `Address ${entity.type} threat at ${entity.position}`,
        location: entity.position,
        requirements: this.getDangerRequirements(entityInfo),
        estimatedValue: value,
        timeWindow: 5000, // 5 seconds - immediate response needed
        confidence: this.calculateDangerConfidence(entityInfo),
        personalityAlignment: 1.0, // Always aligned regardless of personality
        context: {
          threatType: entity.type,
          threatLevel: entity.health?.toString() || 'unknown',
          escapeRoutes: this.identifyEscapeRoutes(agentState, entity.position)
        }
      });
    });

    return opportunities;
  }

  /**
   * Filter and prioritize opportunities
   */
  private filterAndPrioritizeOpportunities(
    opportunities: EnvironmentalOpportunity[],
    personality: PersonalityTraits,
    agentState: AgentState
  ): EnvironmentalOpportunity[] {
    // Filter by minimum confidence
    let filtered = opportunities.filter(opp => 
      opp.confidence >= this.config.minConfidence
    );

    // Filter by personality alignment
    if (this.config.personalityWeight > 0.5) {
      filtered = filtered.filter(opp => 
        !opp.personalityAlignment || opp.personalityAlignment >= 0.3
      );
    }

    // Sort by priority and value
    filtered.sort((a, b) => {
      // Priority first (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by estimated value
      return b.estimatedValue - a.estimatedValue;
    });

    // Limit to maximum opportunities
    return filtered.slice(0, this.config.maxOpportunities);
  }

  /**
   * Update detected opportunities
   */
  private updateDetectedOpportunities(opportunities: EnvironmentalOpportunity[]): void {
    // Clear old opportunities
    this.detectedOpportunities.clear();
    
    // Add new opportunities
    opportunities.forEach(opp => {
      this.detectedOpportunities.set(opp.id, opp);
    });
  }

  // Helper methods for opportunity evaluation

  private isValuableResource(blockType: string): boolean {
    const valuableResources = [
      'diamond_ore', 'iron_ore', 'gold_ore', 'coal_ore',
      'emerald_ore', 'redstone_ore', 'lapis_ore',
      'oak_log', 'birch_log', 'spruce_log', 'jungle_log',
      'cobblestone', 'stone', 'dirt', 'sand'
    ];
    return valuableResources.includes(blockType);
  }

  private getResourceType(blockType: string): string {
    if (blockType.includes('_ore')) return 'ore';
    if (blockType.includes('_log')) return 'wood';
    if (blockType.includes('stone')) return 'stone';
    return 'other';
  }

  private calculateResourceValue(blockType: string, personality: PersonalityTraits): number {
    const baseValues: Record<string, number> = {
      'diamond_ore': 100,
      'iron_ore': 50,
      'gold_ore': 40,
      'coal_ore': 20,
      'emerald_ore': 80,
      'redstone_ore': 30,
      'lapis_ore': 25,
      'oak_log': 15,
      'birch_log': 15,
      'spruce_log': 15,
      'jungle_log': 20,
      'cobblestone': 5,
      'stone': 8,
      'dirt': 3,
      'sand': 4
    };

    const baseValue = baseValues[blockType] || 10;
    const personalityModifier = (personality.conscientiousness + personality.openness) * 0.2;
    
    return baseValue * (1 + personalityModifier);
  }

  private calculateResourcePriority(blockType: string, value: number): OpportunityPriority {
    if (value >= 80) return OpportunityPriority.CRITICAL;
    if (value >= 50) return OpportunityPriority.HIGH;
    if (value >= 25) return OpportunityPriority.MEDIUM;
    return OpportunityPriority.LOW;
  }

  private calculateResourceConfidence(block: BlockInfo): number {
    let confidence = 0.8; // Base confidence
    
    // Adjust for distance
    if (block.distance > 20) confidence -= 0.2;
    if (block.distance > 30) confidence -= 0.3;
    
    // Adjust for accessibility
    if (!block.accessible) confidence -= 0.4;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private getResourceRequirements(blockType: string): OpportunityRequirement[] {
    const requirements: OpportunityRequirement[] = [];
    
    if (this.isHardMaterial(blockType)) {
      requirements.push({
        type: 'tool',
        name: 'pickaxe',
        description: 'Pickaxe required for mining'
      });
    }
    
    return requirements;
  }

  private isHardMaterial(blockType: string): boolean {
    const hardMaterials = [
      'iron_ore', 'gold_ore', 'diamond_ore', 'stone',
      'cobblestone', 'sandstone'
    ];
    return hardMaterials.includes(blockType);
  }

  private identifyBuildingSites(agentState: AgentState): any[] {
    // Placeholder implementation
    // In a real system, this would analyze terrain for flat areas
    return [
      {
        center: agentState.context.position,
        type: 'shelter',
        size: 100,
        terrain: 'plains'
      }
    ];
  }

  private calculateStructureValue(site: any, personality: PersonalityTraits): number {
    const baseValue = 30;
    const creativityBonus = personality.buildingCreativity * 20;
    const conscientiousnessBonus = personality.conscientiousness * 10;
    
    return baseValue + creativityBonus + conscientiousnessBonus;
  }

  private calculateStructureConfidence(site: any): number {
    return 0.7; // Placeholder
  }

  private getStructureRequirements(site: any): OpportunityRequirement[] {
    return [
      {
        type: 'item',
        name: 'wood',
        quantity: 64,
        description: 'Wood needed for building'
      },
      {
        type: 'tool',
        name: 'axe',
        description: 'Axe needed for wood gathering'
      }
    ];
  }

  private identifyUnexploredAreas(agentState: AgentState): any[] {
    // Placeholder implementation
    // In a real system, this would use memory to find unexplored regions
    return [
      {
        id: 'north_cave',
        name: 'Northern Cave System',
        description: 'Unexplored cave network to the north',
        center: { x: agentState.context.position.x + 50, y: 64, z: agentState.context.position.z },
        type: 'cave',
        distance: 50,
        potentialResources: ['iron_ore', 'coal_ore', 'diamond_ore']
      }
    ];
  }

  private calculateExplorationValue(area: any, personality: PersonalityTraits): number {
    const baseValue = 25;
    const curiosityBonus = personality.openness * 15;
    const explorationBonus = personality.explorationDrive * 20;
    
    return baseValue + curiosityBonus + explorationBonus;
  }

  private calculateExplorationConfidence(area: any): number {
    return 0.6; // Placeholder
  }

  private getExplorationRequirements(area: any): OpportunityRequirement[] {
    return [
      {
        type: 'tool',
        name: 'torch',
        description: 'Torches needed for cave exploration'
      },
      {
        type: 'tool',
        name: 'pickaxe',
        description: 'Pickaxe needed for resource gathering'
      }
    ];
  }

  private calculateSocialValue(entity: EntityInfo, personality: PersonalityTraits): number {
    const baseValue = 15;
    const extraversionBonus = personality.extraversion * 10;
    const agreeablenessBonus = personality.agreeableness * 5;
    
    return baseValue + extraversionBonus + agreeablenessBonus;
  }

  private calculateSocialConfidence(entity: EntityInfo): number {
    let confidence = 0.8;
    
    // Adjust for distance
    if (entity.distance > 10) confidence -= 0.2;
    if (entity.distance > 20) confidence -= 0.3;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private getSocialRequirements(entity: EntityInfo): OpportunityRequirement[] {
    return [
      {
        type: 'condition',
        name: 'proximity',
        description: 'Must be within interaction range'
      }
    ];
  }

  private suggestSocialInteraction(entity: EntityInfo, personality: PersonalityTraits): string {
    if (personality.extraversion > 0.7) return 'conversation';
    if (personality.agreeableness > 0.6) return 'collaboration';
    return 'observation';
  }

  private identifySkillScenarios(agentState: AgentState): any[] {
    // Placeholder implementation
    // In a real system, this would identify practice opportunities
    return [
      {
        type: 'combat',
        skill: 'combat',
        location: agentState.context.position,
        difficulty: 0.3,
        practiceType: 'sparring',
        expectedImprovement: 0.1
      }
    ];
  }

  private calculateSkillValue(scenario: any, personality: PersonalityTraits): number {
    const baseValue = 10;
    const curiosityBonus = personality.openness * 5;
    
    return baseValue + curiosityBonus;
  }

  private calculateSkillConfidence(scenario: any): number {
    return 0.5; // Placeholder
  }

  private getSkillRequirements(scenario: any): OpportunityRequirement[] {
    return [
      {
        type: 'condition',
        name: 'safety',
        description: 'Safe environment needed for practice'
      }
    ];
  }

  private calculateDangerValue(entity: EntityInfo, personality: PersonalityTraits): number {
    const baseValue = 100; // Always high value for danger
    const riskToleranceModifier = personality.riskTolerance * 20;
    
    return baseValue + riskToleranceModifier;
  }

  private calculateDangerConfidence(entity: EntityInfo): number {
    let confidence = 0.9;
    
    // Adjust for distance
    if (entity.distance > 15) confidence -= 0.1;
    
    return Math.max(0.5, Math.min(1.0, confidence));
  }

  private getDangerRequirements(entity: EntityInfo): OpportunityRequirement[] {
    return [
      {
        type: 'tool',
        name: 'weapon',
        description: 'Weapon needed for defense'
      }
    ];
  }

  private identifyEscapeRoutes(agentState: AgentState, threatPosition: { x: number; y: number; z: number }): string[] {
    // Placeholder implementation
    return ['north', 'south', 'east', 'west'];
  }

  private calculatePersonalityAlignment(opportunityType: OpportunityType, personality: PersonalityTraits): number {
    const alignments: Record<OpportunityType, number> = {
      [OpportunityType.RESOURCE]: (personality.conscientiousness + personality.openness) * 0.5,
      [OpportunityType.STRUCTURE]: (personality.buildingCreativity + personality.conscientiousness) * 0.5,
      [OpportunityType.EXPLORATION]: (personality.openness + personality.explorationDrive) * 0.5,
      [OpportunityType.SOCIAL]: personality.extraversion * 0.8,
      [OpportunityType.SKILL]: (personality.openness + personality.explorationDrive) * 0.5,
      [OpportunityType.DANGER]: 1.0 // Always aligned for survival
    };

    return alignments[opportunityType] || 0.5;
  }

  private extractPersonality(agentState: AgentState): PersonalityTraits {
    return agentState.cognitive?.purpose?.personality || {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
      riskTolerance: 0.5,
      creativity: 0.5,
      patience: 0.5,
      competitiveness: 0.5,
      curiosity: 0.5,
      explorationDrive: 0.5,
      socialTendency: 0.5,
      buildingCreativity: 0.5,
      combatAggression: 0.5
    };
  }

  private calculateScanConfidence(opportunities: EnvironmentalOpportunity[]): number {
    if (opportunities.length === 0) return 0;
    
    const totalConfidence = opportunities.reduce((sum, opp) => sum + opp.confidence, 0);
    return totalConfidence / opportunities.length;
  }

  // Public API methods

  /**
   * Get current configuration
   */
  getConfig(): OpportunityDetectionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<OpportunityDetectionConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log(`[OPPORTUNITY_DETECTOR] Configuration updated for agent ${this.agentId}:`, updates);
  }

  /**
   * Get detected opportunities
   */
  getDetectedOpportunities(): EnvironmentalOpportunity[] {
    return Array.from(this.detectedOpportunities.values());
  }

  /**
   * Get scan history
   */
  getScanHistory(): OpportunityScanResult[] {
    return [...this.scanHistory];
  }

  /**
   * Clear all opportunities
   */
  clearOpportunities(): void {
    this.detectedOpportunities.clear();
    console.log(`[OPPORTUNITY_DETECTOR] All opportunities cleared for agent ${this.agentId}`);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalOpportunities: number;
    opportunitiesByType: Record<OpportunityType, number>;
    averageConfidence: number;
    lastScanTime: number;
  } {
    const opportunities = Array.from(this.detectedOpportunities.values());
    const opportunitiesByType: Record<OpportunityType, number> = {
      [OpportunityType.RESOURCE]: 0,
      [OpportunityType.STRUCTURE]: 0,
      [OpportunityType.EXPLORATION]: 0,
      [OpportunityType.SOCIAL]: 0,
      [OpportunityType.SKILL]: 0,
      [OpportunityType.DANGER]: 0
    };

    opportunities.forEach(opp => {
      opportunitiesByType[opp.type]++;
    });

    const averageConfidence = opportunities.length > 0 ?
      opportunities.reduce((sum, opp) => sum + opp.confidence, 0) / opportunities.length : 0;

    return {
      totalOpportunities: opportunities.length,
      opportunitiesByType,
      averageConfidence,
      lastScanTime: this.lastScanTime
    };
  }
}
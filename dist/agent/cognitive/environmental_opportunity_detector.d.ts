/**
 * Environmental Opportunity Detection System
 *
 * Scans agent's environment for opportunities that can prevent idleness
 * Identifies resources, structures, exploration areas, social interactions, and skill practice opportunities
 */
import { AgentState } from '../langgraph/interfaces.js';
/**
 * Opportunity types with priority levels
 */
export declare enum OpportunityType {
    RESOURCE = "resource",
    STRUCTURE = "structure",
    EXPLORATION = "exploration",
    SOCIAL = "social",
    SKILL = "skill",
    DANGER = "danger"
}
export declare enum OpportunityPriority {
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
    location: {
        x: number;
        y: number;
        z: number;
    };
    requirements: OpportunityRequirement[];
    estimatedValue: number;
    timeWindow?: number;
    confidence: number;
    personalityAlignment?: number;
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
    scanRadius: number;
    scanInterval: number;
    maxOpportunities: number;
    minConfidence: number;
    personalityWeight: number;
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
    areaScanned: {
        center: {
            x: number;
            y: number;
            z: number;
        };
        radius: number;
    };
    confidence: number;
}
/**
 * Main environmental opportunity detector
 */
export declare class EnvironmentalOpportunityDetector {
    private agentId;
    private config;
    private lastScanTime;
    private detectedOpportunities;
    private scanHistory;
    constructor(agentId: string, config?: Partial<OpportunityDetectionConfig>);
    /**
     * Scan for environmental opportunities
     */
    scanForOpportunities(agentState: AgentState): Promise<EnvironmentalOpportunity[]>;
    /**
     * Detect resource opportunities
     */
    private detectResourceOpportunities;
    /**
     * Detect structure opportunities
     */
    private detectStructureOpportunities;
    /**
     * Detect exploration opportunities
     */
    private detectExplorationOpportunities;
    /**
     * Detect social opportunities
     */
    private detectSocialOpportunities;
    /**
     * Detect skill practice opportunities
     */
    private detectSkillOpportunities;
    /**
     * Detect danger opportunities (threats to avoid or address)
     */
    private detectDangerOpportunities;
    /**
     * Filter and prioritize opportunities
     */
    private filterAndPrioritizeOpportunities;
    /**
     * Update detected opportunities
     */
    private updateDetectedOpportunities;
    private isValuableResource;
    private getResourceType;
    private calculateResourceValue;
    private calculateResourcePriority;
    private calculateResourceConfidence;
    private getResourceRequirements;
    private isHardMaterial;
    private identifyBuildingSites;
    private calculateStructureValue;
    private calculateStructureConfidence;
    private getStructureRequirements;
    private identifyUnexploredAreas;
    private calculateExplorationValue;
    private calculateExplorationConfidence;
    private getExplorationRequirements;
    private calculateSocialValue;
    private calculateSocialConfidence;
    private getSocialRequirements;
    private suggestSocialInteraction;
    private identifySkillScenarios;
    private calculateSkillValue;
    private calculateSkillConfidence;
    private getSkillRequirements;
    private calculateDangerValue;
    private calculateDangerConfidence;
    private getDangerRequirements;
    private identifyEscapeRoutes;
    private calculatePersonalityAlignment;
    private extractPersonality;
    private calculateScanConfidence;
    /**
     * Get current configuration
     */
    getConfig(): OpportunityDetectionConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<OpportunityDetectionConfig>): void;
    /**
     * Get detected opportunities
     */
    getDetectedOpportunities(): EnvironmentalOpportunity[];
    /**
     * Get scan history
     */
    getScanHistory(): OpportunityScanResult[];
    /**
     * Clear all opportunities
     */
    clearOpportunities(): void;
    /**
     * Get statistics
     */
    getStatistics(): {
        totalOpportunities: number;
        opportunitiesByType: Record<OpportunityType, number>;
        averageConfidence: number;
        lastScanTime: number;
    };
}
//# sourceMappingURL=environmental_opportunity_detector.d.ts.map
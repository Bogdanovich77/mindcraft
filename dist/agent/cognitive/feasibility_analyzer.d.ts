/**
 * Feasibility Analyzer for Planning Engine
 *
 * Provides comprehensive plan viability assessment, risk analysis,
 * and success probability calculation for the Mindcraft LangGraph planning system.
 */
import { AgentState, Plan, FeasibilityAnalysisResult, FeasibilityResult } from '../langgraph/interfaces.js';
/**
 * Feasibility Analyzer class
 */
export declare class FeasibilityAnalyzer {
    private config;
    private analysisHistory;
    private riskFactors;
    constructor(config?: Partial<FeasibilityAnalyzerConfig>);
    /**
     * Analyze feasibility of a plan
     */
    analyzeFeasibility(plan: Plan, agentState: AgentState): Promise<FeasibilityAnalysisResult>;
    /**
     * Perform detailed feasibility analysis with all factors
     */
    performDetailedFeasibilityAnalysis(plan: Plan, agentState: AgentState): Promise<FeasibilityResult>;
    /**
     * Calculate overall feasibility score
     */
    private calculateFeasibilityScore;
    /**
     * Calculate skill feasibility
     */
    private calculateSkillFeasibility;
    /**
     * Calculate resource feasibility
     */
    private calculateResourceFeasibility;
    /**
     * Calculate complexity feasibility
     */
    private calculateComplexityFeasibility;
    /**
     * Calculate environmental feasibility
     */
    private calculateEnvironmentalFeasibility;
    /**
     * Calculate social feasibility
     */
    private calculateSocialFeasibility;
    /**
     * Determine feasibility level from score
     */
    private determineFeasibilityLevel;
    /**
     * Calculate confidence in analysis
     */
    private calculateConfidence;
    /**
     * Assess overall risk level
     */
    private assessRiskLevel;
    /**
     * Calculate risk score
     */
    private calculateRiskScore;
    /**
     * Identify blocking factors
     */
    private identifyBlockingFactors;
    /**
     * Generate alternative plans
     */
    private generateAlternativePlans;
    /**
     * Estimate time requirements
     */
    private estimateTime;
    /**
     * Estimate cost requirements
     */
    private estimateCost;
    /**
     * Calculate success probability
     */
    private calculateSuccessProbability;
    /**
     * Analyze skill feasibility in detail
     */
    private analyzeSkillFeasibility;
    /**
     * Analyze resource feasibility in detail
     */
    private analyzeResourceFeasibility;
    /**
     * Analyze complexity feasibility in detail
     */
    private analyzeComplexityFeasibility;
    /**
     * Perform detailed risk analysis
     */
    private performRiskAnalysis;
    private analyzeResourceRisks;
    private analyzeTimeRisks;
    private analyzeSkillRisks;
    private analyzeEnvironmentalRisks;
    private initializeRiskFactors;
    private cleanupHistory;
    private calculateAgentComplexityCapability;
    private calculateResourceRisk;
    private calculateTimeRisk;
    private calculateSkillRisk;
    private calculateEnvironmentalRisk;
    private calculateSocialRisk;
    private getRiskPenalty;
    private calculateSkillTimeMultiplier;
    private calculateEnvironmentalTimeMultiplier;
    private calculateBaseCost;
    private calculateResourceCostMultiplier;
    private calculateSkillCostMultiplier;
    private calculateOverallFeasibility;
    private generateFeasibilityRecommendations;
    private generateSimplerAlternative;
    private generateResourceEfficientAlternative;
    private generateFasterAlternative;
    private calculateOverallRisk;
    private calculateResidualRisk;
}
/**
 * Feasibility analyzer configuration
 */
export interface FeasibilityAnalyzerConfig {
    analysisTimeout: number;
    maxHistorySize: number;
    enableRiskAnalysis: boolean;
    enableAlternativeGeneration: boolean;
    confidenceThreshold: number;
    riskTolerance: number;
    timeBuffer: number;
    costBuffer: number;
    minSuccessProbability: number;
    skillWeight: number;
    resourceWeight: number;
    complexityWeight: number;
    riskWeight: number;
    riskFactors: {
        resource: number;
        time: number;
        skill: number;
        environmental: number;
        social: number;
    };
}
//# sourceMappingURL=feasibility_analyzer.d.ts.map
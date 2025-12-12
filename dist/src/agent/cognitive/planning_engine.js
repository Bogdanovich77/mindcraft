import { PlanStatus, PlanningStrategy, PlanningHorizon, PlanningScope, PlanningMode, ReplanningSystem, FeasibilityAnalyzer, RiskLevel, SkillType } from '../langgraph/interfaces';
/**
 * Planning Engine
 *
 * Main orchestrator for all planning activities including resource assessment,
 * feasibility analysis, and replanning. Integrates with existing cognitive
 * components and multi-agent coordination.
 */
export class PlanningEngine {
    config;
    resourceAssessment;
    feasibilityAnalyzer;
    replanningSystem;
    activePlans = new Map();
    planningHistory = [];
    lastPlanningTime = 0;
    constructor(config) {
        this.config = {
            planningTimeout: 5000,
            maxHistorySize: 100,
            enableResourceAssessment: true,
            enableFeasibilityAnalysis: true,
            enableReplanning: true,
            enableCollaborativePlanning: true,
            enableProgressiveRefinement: true,
            planningHorizons: {
                immediate: { duration: 300000, detail: 'high' }, // 5 minutes
                short: { duration: 3600000, detail: 'medium' }, // 1 hour
                medium: { duration: 86400000, detail: 'low' }, // 1 day
                long: { duration: 604800000, detail: 'minimal' } // 1 week
            },
            planningStrategies: {
                conservative: { riskTolerance: 0.2, resourceBuffer: 0.3, timeBuffer: 0.5 },
                balanced: { riskTolerance: 0.5, resourceBuffer: 0.2, timeBuffer: 0.3 },
                aggressive: { riskTolerance: 0.8, resourceBuffer: 0.1, timeBuffer: 0.1 }
            },
            maxConcurrentPlans: 10,
            enableLearningIntegration: true,
            enableSkillBasedPlanning: true,
            enableSocialCoordination: true,
            ...config
        };
        // Initialize components
        this.resourceAssessment = new ResourceAssessment();
        this.feasibilityAnalyzer = new FeasibilityAnalyzer();
        this.replanningSystem = new ReplanningSystem();
        console.log('[PLANNING_ENGINE] Initialized with config:', this.config);
    }
    /**
     * Main planning method - creates plans based on goals and context
     */
    async createPlan(request, agentState) {
        const startTime = Date.now();
        try {
            console.log(`[PLANNING_ENGINE] Creating plan for goal ${request.goalId}: ${request.description}`);
            // Validate request
            const validation = this.validatePlanningRequest(request, agentState);
            if (!validation.isValid) {
                return this.createPlanningResult(null, false, validation.reason || 'Invalid request', startTime);
            }
            // Check concurrent plan limit
            if (this.activePlans.size >= this.config.maxConcurrentPlans) {
                return this.createPlanningResult(null, false, 'Maximum concurrent plans reached', startTime);
            }
            // Create planning context
            const context = this.createPlanningContext(request, agentState);
            // Assess resources if enabled
            let resourceAssessment = null;
            if (this.config.enableResourceAssessment) {
                resourceAssessment = await this.resourceAssessment.assessResources(request.resourceRequirements || { items: {}, tools: [], location: undefined, time: 0, assistance: [] }, agentState);
            }
            // Generate initial plan
            const initialPlan = await this.generateInitialPlan(request, context, agentState);
            // Analyze feasibility if enabled
            let feasibility = null;
            if (this.config.enableFeasibilityAnalysis) {
                feasibility = await this.feasibilityAnalyzer.analyzeFeasibility(initialPlan, agentState);
            }
            // Optimize plan if feasible
            let finalPlan = initialPlan;
            if (feasibility && feasibility.feasibilityScore >= 0.7) {
                finalPlan = await this.optimizePlan(initialPlan, feasibility, resourceAssessment);
            }
            // Generate alternatives if feasibility is low
            let alternatives = [];
            if (feasibility && feasibility.feasibilityScore < 0.7) {
                alternatives = await this.generateAlternatives(initialPlan, feasibility, agentState);
            }
            // Create planning result
            const result = {
                plan: finalPlan,
                success: true,
                resourceAssessment,
                feasibility: this.convertFeasibilityResult(feasibility),
                alternatives,
                warnings: feasibility ? feasibility.blockingFactors.map(bf => bf.description) : [],
                planningTime: Date.now() - startTime
            };
            // Store plan and result
            this.activePlans.set(finalPlan.id, finalPlan);
            this.addToHistory(result);
            this.lastPlanningTime = Date.now();
            // Start monitoring if replanning is enabled
            if (this.config.enableReplanning) {
                this.replanningSystem.monitorPlan(finalPlan.id, agentState);
            }
            console.log(`[PLANNING_ENGINE] Plan created in ${result.planningTime}ms`);
            console.log(`[PLANNING_ENGINE] Plan ${finalPlan.id}: ${finalPlan.title}`);
            return result;
        }
        catch (error) {
            console.error('[PLANNING_ENGINE] Error creating plan:', error);
            return this.createPlanningResult(null, false, `Planning failed: ${error}`, startTime);
        }
    }
    /**
     * Update an existing plan
     */
    async updatePlan(planId, updates, agentState) {
        const startTime = Date.now();
        try {
            const existingPlan = this.activePlans.get(planId);
            if (!existingPlan) {
                return this.createPlanningResult(null, false, 'Plan not found', startTime);
            }
            // Create updated plan
            const updatedPlan = {
                ...existingPlan,
                ...updates,
                id: planId, // Preserve original ID
                updatedAt: Date.now()
            };
            // Re-validate feasibility
            let feasibility = null;
            if (this.config.enableFeasibilityAnalysis) {
                feasibility = await this.feasibilityAnalyzer.analyzeFeasibility(updatedPlan, agentState);
            }
            // Update plan if still feasible
            if (!feasibility || feasibility.feasibilityScore >= 0.3) {
                this.activePlans.set(planId, updatedPlan);
                const result = {
                    plan: updatedPlan,
                    success: true,
                    resourceAssessment: null,
                    feasibility: this.convertFeasibilityResult(feasibility),
                    alternatives: [],
                    warnings: feasibility ? feasibility.blockingFactors.map(bf => bf.description) : [],
                    planningTime: Date.now() - startTime
                };
                this.addToHistory(result);
                console.log(`[PLANNING_ENGINE] Plan ${planId} updated successfully`);
                return result;
            }
            else {
                return this.createPlanningResult(null, false, 'Updated plan is not feasible', startTime);
            }
        }
        catch (error) {
            console.error('[PLANNING_ENGINE] Error updating plan:', error);
            return this.createPlanningResult(null, false, `Plan update failed: ${error}`, startTime);
        }
    }
    /**
     * Execute a plan step
     */
    async executeStep(planId, stepId, agentState) {
        try {
            const plan = this.activePlans.get(planId);
            if (!plan) {
                console.error(`[PLANNING_ENGINE] Plan ${planId} not found`);
                return false;
            }
            const step = plan.steps.find(s => s.id === stepId);
            if (!step) {
                console.error(`[PLANNING_ENGINE] Step ${stepId} not found in plan ${planId}`);
                return false;
            }
            // Update step status
            step.status = PlanStatus.ACTIVE;
            step.startTime = Date.now();
            // Execute step (this would integrate with the action execution system)
            console.log(`[PLANNING_ENGINE] Executing step ${stepId}: ${step.description}`);
            // Mark step as completed (simplified)
            step.status = PlanStatus.COMPLETED;
            step.endTime = Date.now();
            // Update plan progress
            this.updatePlanProgress(plan);
            console.log(`[PLANNING_ENGINE] Step ${stepId} completed successfully`);
            return true;
        }
        catch (error) {
            console.error('[PLANNING_ENGINE] Error executing step:', error);
            return false;
        }
    }
    /**
     * Complete a plan
     */
    async completePlan(planId, agentState) {
        try {
            const plan = this.activePlans.get(planId);
            if (!plan) {
                console.error(`[PLANNING_ENGINE] Plan ${planId} not found`);
                return false;
            }
            // Update plan status
            plan.status = PlanStatus.COMPLETED;
            plan.completedAt = Date.now();
            // Stop monitoring
            if (this.config.enableReplanning) {
                this.replanningSystem.stopMonitoring(planId);
            }
            // Move to history
            this.activePlans.delete(planId);
            console.log(`[PLANNING_ENGINE] Plan ${planId} completed successfully`);
            return true;
        }
        catch (error) {
            console.error('[PLANNING_ENGINE] Error completing plan:', error);
            return false;
        }
    }
    /**
     * Cancel a plan
     */
    async cancelPlan(planId, reason) {
        try {
            const plan = this.activePlans.get(planId);
            if (!plan) {
                console.error(`[PLANNING_ENGINE] Plan ${planId} not found`);
                return false;
            }
            // Update plan status
            plan.status = PlanStatus.CANCELLED;
            plan.cancelledAt = Date.now();
            // Stop monitoring
            if (this.config.enableReplanning) {
                this.replanningSystem.stopMonitoring(planId);
            }
            // Move to history
            this.activePlans.delete(planId);
            console.log(`[PLANNING_ENGINE] Plan ${planId} cancelled: ${reason || 'No reason provided'}`);
            return true;
        }
        catch (error) {
            console.error('[PLANNING_ENGINE] Error cancelling plan:', error);
            return false;
        }
    }
    /**
     * Get active plans
     */
    getActivePlans() {
        return Array.from(this.activePlans.values());
    }
    /**
     * Get plan by ID
     */
    getPlan(planId) {
        return this.activePlans.get(planId) || null;
    }
    /**
     * Get planning history
     */
    getPlanningHistory() {
        return [...this.planningHistory];
    }
    /**
     * Clear planning history
     */
    clearHistory() {
        this.planningHistory = [];
        console.log('[PLANNING_ENGINE] History cleared');
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        console.log('[PLANNING_ENGINE] Configuration updated');
    }
    /**
     * Get planning statistics
     */
    getStatistics() {
        const totalPlans = this.planningHistory.length;
        const activePlans = this.activePlans.size;
        const completedPlans = this.planningHistory.filter(result => result.plan?.status === PlanStatus.COMPLETED).length;
        const cancelledPlans = this.planningHistory.filter(result => result.plan?.status === PlanStatus.CANCELLED).length;
        const successRate = totalPlans > 0 ? this.planningHistory.filter(result => result.success).length / totalPlans : 0;
        const averageTime = totalPlans > 0
            ? this.planningHistory.reduce((sum, result) => sum + result.planningTime, 0) / totalPlans
            : 0;
        return {
            totalPlans,
            activePlans,
            completedPlans,
            cancelledPlans,
            averagePlanningTime: averageTime,
            successRate,
            lastPlanningTime: this.lastPlanningTime
        };
    }
    // Private helper methods
    validatePlanningRequest(request, agentState) {
        if (!request.goalId) {
            return { isValid: false, reason: 'Goal ID is required' };
        }
        if (!request.description) {
            return { isValid: false, reason: 'Description is required' };
        }
        if (request.priority < 1 || request.priority > 10) {
            return { isValid: false, reason: 'Priority must be between 1 and 10' };
        }
        return { isValid: true };
    }
    createPlanningContext(request, agentState) {
        return {
            agentId: agentState.context.entityId || 'unknown',
            currentTime: Date.now(),
            location: agentState.context.position,
            availableResources: agentState.context.inventory,
            skills: agentState.cognitive.skills.skills,
            goals: agentState.cognitive.goals.activeGoals,
            constraints: request.constraints || [],
            objectives: request.objectives || [],
            strategy: request.strategy || PlanningStrategy.BALANCED,
            horizon: request.horizon || PlanningHorizon.SHORT,
            scope: request.scope || PlanningScope.INDIVIDUAL,
            mode: request.mode || PlanningMode.PROACTIVE
        };
    }
    async generateInitialPlan(request, context, agentState) {
        const planId = `plan_${request.goalId}_${Date.now()}`;
        // Generate plan steps based on goal type and context
        const steps = await this.generatePlanSteps(request, context, agentState);
        // Calculate estimated duration
        const estimatedDuration = steps.reduce((total, step) => total + (step.estimatedDuration || 0), 0);
        const plan = {
            id: planId,
            goalId: request.goalId,
            type: this.determinePlanType(request, context),
            title: request.title || `Plan for ${request.goalId}`,
            description: request.description,
            status: PlanStatus.PENDING,
            priority: request.priority,
            steps,
            dependencies: request.dependencies || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            estimatedDuration,
            deadline: request.deadline,
            resourceRequirements: request.resourceRequirements || { items: {}, tools: [], location: undefined, time: 0, assistance: [] },
            resourceAllocation: {
                planId,
                resources: {},
                conflicts: [],
                optimization: {
                    originalAllocation: {
                        planId,
                        resources: {},
                        conflicts: [],
                        totalCost: 0,
                        efficiency: 0.8,
                        utilization: 0.7
                    },
                    optimizedAllocation: {
                        planId,
                        resources: {},
                        conflicts: [],
                        totalCost: 0,
                        efficiency: 0.8,
                        utilization: 0.7
                    },
                    improvements: [],
                    totalSavings: 0,
                    efficiencyGain: 0,
                    utilizationImprovement: 0,
                    optimizationTime: 0,
                    conflictsResolved: 0
                },
                totalCost: 0,
                efficiency: 0.8,
                utilization: 0.7
            },
            riskLevel: RiskLevel.MEDIUM,
            feasibilityScore: 0.7,
            confidence: 0.8,
            blockingFactors: [],
            alternativePlans: [],
            learningOpportunities: []
        };
        return plan;
    }
    determinePlanType(request, context) {
        // Determine plan type based on scope and horizon
        if (context.scope === PlanningScope.COLLABORATIVE) {
            return 'collaborative';
        }
        if (context.horizon === PlanningHorizon.LONG) {
            return 'strategic';
        }
        if (context.horizon === PlanningHorizon.MEDIUM) {
            return 'tactical';
        }
        return 'operational';
    }
    async generatePlanSteps(request, context, agentState) {
        const steps = [];
        // Generate steps based on goal type (simplified)
        switch (request.goalId) {
            case 'resource_collection':
                steps.push({
                    id: 'locate_resources',
                    description: 'Locate required resources',
                    status: PlanStatus.PENDING,
                    estimatedDuration: 5000,
                    requiredSkills: [{ type: SkillType.EXPLORATION, minProficiency: 0.5 }],
                    requiredResources: []
                }, {
                    id: 'collect_resources',
                    description: 'Collect required resources',
                    status: PlanStatus.PENDING,
                    estimatedDuration: 10000,
                    requiredSkills: [{ type: SkillType.MINING, minProficiency: 0.7 }],
                    requiredResources: [{ type: 'pickaxe', amount: 1 }]
                });
                break;
            case 'construction':
                steps.push({
                    id: 'prepare_site',
                    description: 'Prepare construction site',
                    status: PlanStatus.PENDING,
                    estimatedDuration: 8000,
                    requiredSkills: [{ type: SkillType.BUILDING, minProficiency: 0.6 }],
                    requiredResources: []
                }, {
                    id: 'gather_materials',
                    description: 'Gather construction materials',
                    status: PlanStatus.PENDING,
                    estimatedDuration: 12000,
                    requiredSkills: [{ type: SkillType.GATHERING, minProficiency: 0.5 }],
                    requiredResources: []
                }, {
                    id: 'build_structure',
                    description: 'Build the structure',
                    status: PlanStatus.PENDING,
                    estimatedDuration: 15000,
                    requiredSkills: [{ type: SkillType.BUILDING, minProficiency: 0.8 }],
                    requiredResources: [{ type: 'materials', amount: 50 }]
                });
                break;
            default:
                // Generic steps
                steps.push({
                    id: 'analyze_situation',
                    description: 'Analyze current situation',
                    status: PlanStatus.PENDING,
                    estimatedDuration: 3000,
                    requiredSkills: [{ type: SkillType.PERCEPTION, minProficiency: 0.5 }],
                    requiredResources: []
                }, {
                    id: 'execute_plan',
                    description: 'Execute main plan actions',
                    status: PlanStatus.PENDING,
                    estimatedDuration: 10000,
                    requiredSkills: [],
                    requiredResources: []
                }, {
                    id: 'verify_completion',
                    description: 'Verify plan completion',
                    status: PlanStatus.PENDING,
                    estimatedDuration: 2000,
                    requiredSkills: [{ type: SkillType.PERCEPTION, minProficiency: 0.4 }],
                    requiredResources: []
                });
        }
        return steps;
    }
    async optimizePlan(plan, feasibility, resourceAssessment) {
        // Simple optimization - could be enhanced
        const optimizedPlan = {
            ...plan,
            updatedAt: Date.now(),
            feasibilityScore: feasibility?.feasibilityScore || 0.7,
            confidence: feasibility?.confidence || 0.8
        };
        return optimizedPlan;
    }
    async generateAlternatives(plan, feasibility, agentState) {
        // Generate alternative plans based on feasibility issues
        const alternatives = [];
        if (feasibility && feasibility.alternativePlans) {
            alternatives.push(...feasibility.alternativePlans);
        }
        return alternatives;
    }
    convertFeasibilityResult(feasibility) {
        if (!feasibility)
            return null;
        return {
            overallFeasibility: feasibility.feasibilityScore,
            isFeasible: feasibility.feasibilityScore >= 0.5,
            timeEstimate: {
                min: feasibility.timeEstimation.min,
                max: feasibility.timeEstimation.max,
                confidence: feasibility.timeEstimation.confidence
            },
            costEstimate: {
                min: feasibility.costEstimation.min,
                max: feasibility.costEstimation.max,
                confidence: feasibility.costEstimation.confidence
            },
            riskLevel: feasibility.riskLevel,
            blockingFactors: feasibility.blockingFactors,
            alternativePlans: feasibility.alternativePlans,
            confidence: feasibility.confidence,
            successProbability: feasibility.successProbability
        };
    }
    createPlanningResult(plan, success, message, startTime) {
        return {
            plan,
            success,
            resourceAssessment: null,
            feasibility: null,
            alternatives: [],
            warnings: success ? [] : [message],
            planningTime: Date.now() - startTime
        };
    }
    updatePlanProgress(plan) {
        const completedSteps = plan.steps.filter(step => step.status === PlanStatus.COMPLETED).length;
        const totalSteps = plan.steps.length;
        if (totalSteps > 0) {
            plan.progress = completedSteps / totalSteps;
            // Update plan status based on progress
            if (plan.progress === 1.0) {
                plan.status = PlanStatus.COMPLETED;
                plan.completedAt = Date.now();
            }
            else if (plan.progress > 0) {
                plan.status = PlanStatus.ACTIVE;
            }
        }
    }
    addToHistory(result) {
        this.planningHistory.push(result);
        // Maintain history size limit
        if (this.planningHistory.length > this.config.maxHistorySize) {
            this.planningHistory.shift();
        }
    }
}

import { PlanStatus } from '../langgraph/interfaces';
/**
 * Replanning System
 *
 * Handles dynamic plan adjustment, obstacle detection, alternative plan generation,
 * and real-time replanning based on changing conditions.
 */
export class ReplanningSystem {
    config;
    replanningHistory = [];
    activeMonitoring = new Map();
    lastReplanning = 0;
    constructor(config) {
        this.config = {
            replanningTimeout: 10000,
            maxHistorySize: 50,
            enableObstacleDetection: true,
            enableAutomaticReplanning: true,
            enableAlternativeGeneration: true,
            monitoringInterval: 5000,
            replanningThresholds: {
                failure: 0.3,
                obstacle: 0.5,
                resourceChange: 0.4,
                goalChange: 0.6,
                timePressure: 0.7,
                conflict: 0.5
            },
            maxConcurrentReplans: 3,
            enableProgressiveRefinement: true,
            ...config
        };
        console.log('[REPLANNING_SYSTEM] Initialized with config:', this.config);
        // Start monitoring if enabled
        if (this.config.enableObstacleDetection) {
            this.startMonitoring();
        }
    }
    /**
     * Main replanning method - handles all replanning triggers
     */
    async replan(trigger, agentState) {
        const startTime = Date.now();
        try {
            console.log(`[REPLANNING_SYSTEM] Replanning triggered by ${trigger.type}: ${trigger.description}`);
            // Check if we can replan (concurrent limit)
            if (this.replanningHistory.length >= this.config.maxConcurrentReplans) {
                return this.createReplanningResult(null, false, 'Maximum concurrent replans reached', startTime);
            }
            // Analyze current situation
            const situationAnalysis = await this.analyzeSituation(trigger, agentState);
            // Determine if replanning is necessary
            const shouldReplan = this.shouldReplan(trigger, situationAnalysis);
            if (!shouldReplan) {
                return this.createReplanningResult(null, false, 'Replanning not necessary', startTime);
            }
            // Get the current plan (would need to be passed or retrieved)
            const currentPlan = await this.getCurrentPlan(trigger, agentState);
            if (!currentPlan) {
                return this.createReplanningResult(null, false, 'No current plan found', startTime);
            }
            // Generate new plan based on trigger
            const newPlan = await this.generateNewPlan(currentPlan, trigger, situationAnalysis, agentState);
            // Validate new plan
            const validation = await this.validateNewPlan(newPlan, agentState);
            if (!validation.isValid) {
                return this.createReplanningResult(currentPlan.id, false, validation.reason, startTime);
            }
            // Create replanning result
            const result = {
                originalPlanId: currentPlan.id,
                newPlanId: newPlan.id,
                success: true,
                changes: this.calculatePlanChanges(currentPlan, newPlan),
                learningOpportunities: this.identifyLearningOpportunities(trigger, situationAnalysis),
                lessons: this.generateLessons(trigger, situationAnalysis),
                replanningTime: Date.now() - startTime
            };
            // Store in history
            this.addToHistory(result);
            this.lastReplanning = Date.now();
            console.log(`[REPLANNING_SYSTEM] Replanning completed in ${result.replanningTime}ms`);
            console.log(`[REPLANNING_SYSTEM] Generated ${result.changes.length} plan changes`);
            return result;
        }
        catch (error) {
            console.error('[REPLANNING_SYSTEM] Error during replanning:', error);
            return this.createReplanningResult(null, false, `Replanning failed: ${error}`, startTime);
        }
    }
    /**
     * Monitor plan execution for obstacles and issues
     */
    async monitorPlan(planId, agentState) {
        try {
            const monitoringData = this.activeMonitoring.get(planId);
            if (!monitoringData) {
                console.log(`[REPLANNING_SYSTEM] Starting monitoring for plan ${planId}`);
                this.activeMonitoring.set(planId, {
                    planId,
                    startTime: Date.now(),
                    lastCheck: Date.now(),
                    stepProgress: new Map(),
                    resourceUsage: this.getCurrentResourceUsage(agentState),
                    blockingFactors: [],
                    executionIssues: []
                });
                return;
            }
            // Update monitoring data
            monitoringData.lastCheck = Date.now();
            monitoringData.resourceUsage = this.getCurrentResourceUsage(agentState);
            // Check for execution issues
            const newIssues = await this.detectExecutionIssues(monitoringData, agentState);
            monitoringData.executionIssues.push(...newIssues);
            // Check for blocking factors
            const newBlockingFactors = await this.detectBlockingFactors(monitoringData, agentState);
            monitoringData.blockingFactors.push(...newBlockingFactors);
            // Trigger automatic replanning if enabled and necessary
            if (this.config.enableAutomaticReplanning) {
                for (const issue of newIssues) {
                    if (issue.severity === 'critical') {
                        const trigger = {
                            type: 'failure',
                            severity: 'critical',
                            description: `Critical execution issue: ${issue.description}`,
                            timestamp: Date.now(),
                            data: { issue }
                        };
                        // Trigger replanning asynchronously
                        this.replan(trigger, agentState).catch(error => {
                            console.error('[REPLANNING_SYSTEM] Automatic replanning failed:', error);
                        });
                        break; // Only trigger once per check
                    }
                }
            }
        }
        catch (error) {
            console.error(`[REPLANNING_SYSTEM] Error monitoring plan ${planId}:`, error);
        }
    }
    /**
     * Stop monitoring a plan
     */
    stopMonitoring(planId) {
        if (this.activeMonitoring.has(planId)) {
            this.activeMonitoring.delete(planId);
            console.log(`[REPLANNING_SYSTEM] Stopped monitoring plan ${planId}`);
        }
    }
    /**
     * Analyze current situation for replanning decisions
     */
    async analyzeSituation(trigger, agentState) {
        const resourceChanges = await this.analyzeResourceChanges(trigger, agentState);
        const environmentalChanges = await this.analyzeEnvironmentalChanges(trigger, agentState);
        const goalChanges = await this.analyzeGoalChanges(trigger, agentState);
        const timeConstraints = await this.analyzeTimeConstraints(trigger, agentState);
        const riskFactors = await this.analyzeRiskFactors(trigger, agentState);
        return {
            resourceChanges,
            environmentalChanges,
            goalChanges,
            timeConstraints,
            riskFactors
        };
    }
    /**
     * Determine if replanning is necessary
     */
    shouldReplan(trigger, analysis) {
        const threshold = this.config.replanningThresholds[trigger.type] || 0.5;
        // Check trigger severity
        if (trigger.severity === 'critical')
            return true;
        if (trigger.severity === 'high' && this.getTriggerScore(trigger) > threshold)
            return true;
        // Check situation analysis
        if (analysis.resourceChanges.confidence > threshold)
            return true;
        if (analysis.environmentalChanges.confidence > threshold)
            return true;
        if (analysis.goalChanges.confidence > threshold)
            return true;
        if (analysis.timeConstraints.pressure > threshold)
            return true;
        if (analysis.riskFactors.confidence > threshold)
            return true;
        return false;
    }
    /**
     * Get current plan (would need to be implemented based on plan storage)
     */
    async getCurrentPlan(trigger, agentState) {
        // This would need to be implemented based on how plans are stored
        // For now, return a mock plan
        return {
            id: 'current_plan_' + Date.now(),
            goalId: trigger.data?.goalId || 'default_goal',
            type: 'operational',
            title: 'Current Plan',
            description: 'Current active plan',
            status: PlanStatus.ACTIVE,
            priority: 2,
            steps: [],
            dependencies: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            estimatedDuration: 10000,
            resourceRequirements: {
                items: {},
                tools: [],
                location: undefined,
                time: 10000,
                assistance: []
            },
            resourceAllocation: {
                planId: 'current_plan_' + Date.now(),
                resources: {},
                conflicts: [],
                optimization: {
                    originalAllocation: {
                        planId: 'current_plan_' + Date.now(),
                        resources: {},
                        conflicts: [],
                        totalCost: 0,
                        efficiency: 0.8,
                        utilization: 0.7
                    },
                    optimizedAllocation: {
                        planId: 'current_plan_' + Date.now(),
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
            riskLevel: 'medium',
            feasibilityScore: 0.7,
            confidence: 0.8,
            blockingFactors: [],
            alternativePlans: [],
            learningOpportunities: []
        };
    }
    /**
     * Generate new plan based on trigger and analysis
     */
    async generateNewPlan(currentPlan, trigger, analysis, agentState) {
        const newPlanId = `replan_${currentPlan.id}_${Date.now()}`;
        // Create new plan based on trigger type
        switch (trigger.type) {
            case 'failure':
                return await this.generateFailureRecoveryPlan(currentPlan, trigger, analysis, agentState, newPlanId);
            case 'obstacle':
                return await this.generateObstacleAvoidancePlan(currentPlan, trigger, analysis, agentState, newPlanId);
            case 'resource_change':
                return await this.generateResourceAdaptationPlan(currentPlan, trigger, analysis, agentState, newPlanId);
            case 'goal_change':
                return await this.generateGoalAdaptationPlan(currentPlan, trigger, analysis, agentState, newPlanId);
            case 'time_pressure':
                return await this.generateTimeOptimizedPlan(currentPlan, trigger, analysis, agentState, newPlanId);
            case 'conflict':
                return await this.generateConflictResolutionPlan(currentPlan, trigger, analysis, agentState, newPlanId);
            default:
                return await this.generateGenericReplan(currentPlan, trigger, analysis, agentState, newPlanId);
        }
    }
    /**
     * Validate new plan
     */
    async validateNewPlan(plan, agentState) {
        // Check basic plan validity
        if (!plan.steps || plan.steps.length === 0) {
            return { isValid: false, reason: 'Plan has no steps' };
        }
        if (plan.estimatedDuration <= 0) {
            return { isValid: false, reason: 'Invalid estimated duration' };
        }
        // Check resource feasibility
        const resourceRequirements = Object.entries(plan.resourceRequirements.items);
        for (const [resourceType, amount] of resourceRequirements) {
            const available = agentState.context.inventory.find(item => item.type === resourceType)?.count || 0;
            if (available < amount) {
                return { isValid: false, reason: `Insufficient ${resourceType}: need ${amount}, have ${available}` };
            }
        }
        // Check deadline feasibility
        if (plan.deadline && plan.deadline < Date.now() + plan.estimatedDuration) {
            return { isValid: false, reason: 'Plan cannot be completed before deadline' };
        }
        return { isValid: true };
    }
    /**
     * Calculate plan changes between original and new plan
     */
    calculatePlanChanges(originalPlan, newPlan) {
        const changes = [];
        // Check for step additions
        const originalStepIds = new Set(originalPlan.steps.map(step => step.id));
        const addedSteps = newPlan.steps.filter(step => !originalStepIds.has(step.id));
        addedSteps.forEach(step => {
            changes.push({
                type: 'addition',
                description: `Added step: ${step.description}`,
                timestamp: Date.now(),
                data: { step }
            });
        });
        // Check for step removals
        const newStepIds = new Set(newPlan.steps.map(step => step.id));
        const removedSteps = originalPlan.steps.filter(step => !newStepIds.has(step.id));
        removedSteps.forEach(step => {
            changes.push({
                type: 'removal',
                description: `Removed step: ${step.description}`,
                timestamp: Date.now(),
                data: { step }
            });
        });
        // Check for priority changes
        if (originalPlan.priority !== newPlan.priority) {
            changes.push({
                type: 'priority_change',
                description: `Priority changed from ${originalPlan.priority} to ${newPlan.priority}`,
                timestamp: Date.now(),
                data: { oldPriority: originalPlan.priority, newPriority: newPlan.priority }
            });
        }
        // Check for resource reallocation
        const originalResources = JSON.stringify(originalPlan.resourceRequirements.items);
        const newResources = JSON.stringify(newPlan.resourceRequirements.items);
        if (originalResources !== newResources) {
            changes.push({
                type: 'resource_reallocation',
                description: 'Resource requirements changed',
                timestamp: Date.now(),
                data: {
                    original: originalPlan.resourceRequirements.items,
                    new: newPlan.resourceRequirements.items
                }
            });
        }
        return changes;
    }
    /**
     * Identify learning opportunities from replanning
     */
    identifyLearningOpportunities(trigger, analysis) {
        const opportunities = [];
        // Resource-related learning
        if (analysis.resourceChanges.hasShortages) {
            opportunities.push('Learn to better predict resource requirements');
            opportunities.push('Improve resource acquisition strategies');
        }
        // Environmental learning
        if (analysis.environmentalChanges.hasHighDanger) {
            opportunities.push('Learn to better assess environmental risks');
            opportunities.push('Develop safer alternative approaches');
        }
        // Time management learning
        if (analysis.timeConstraints.hasTimeOverruns) {
            opportunities.push('Improve time estimation accuracy');
            opportunities.push('Learn to optimize task sequencing');
        }
        // Risk management learning
        if (analysis.riskFactors.hasResourceRisks) {
            opportunities.push('Develop better risk mitigation strategies');
            opportunities.push('Learn to identify risks earlier');
        }
        return opportunities;
    }
    /**
     * Generate lessons from replanning
     */
    generateLessons(trigger, analysis) {
        const lessons = [];
        // Trigger-specific lessons
        switch (trigger.type) {
            case 'failure':
                lessons.push('Original plan assumptions were incorrect');
                lessons.push('Need better contingency planning');
                break;
            case 'obstacle':
                lessons.push('Unforeseen obstacles require flexible planning');
                lessons.push('Environment assessment needs improvement');
                break;
            case 'resource_change':
                lessons.push('Resource availability is more volatile than expected');
                lessons.push('Need better resource monitoring');
                break;
            case 'goal_change':
                lessons.push('Goals can change during execution');
                lessons.push('Need better goal alignment processes');
                break;
            case 'time_pressure':
                lessons.push('Time estimates were too optimistic');
                lessons.push('Need to include buffer time in plans');
                break;
            case 'conflict':
                lessons.push('Resource conflicts need better coordination');
                lessons.push('Need improved conflict resolution mechanisms');
                break;
        }
        return lessons;
    }
    // Analysis methods
    async analyzeResourceChanges(trigger, agentState) {
        // Simple analysis - could be enhanced with historical data
        return {
            hasShortages: trigger.type === 'resource_change',
            hasExcess: false,
            hasConflicts: trigger.type === 'conflict',
            confidence: trigger.severity === 'critical' ? 0.9 : 0.6
        };
    }
    async analyzeEnvironmentalChanges(trigger, agentState) {
        return {
            hasHighDanger: trigger.type === 'obstacle',
            hasWeatherIssues: false,
            hasTimeConstraints: trigger.type === 'time_pressure',
            confidence: trigger.severity === 'critical' ? 0.8 : 0.5
        };
    }
    async analyzeGoalChanges(trigger, agentState) {
        return {
            hasConflictingGoals: trigger.type === 'conflict',
            hasOutdatedGoals: trigger.type === 'goal_change',
            hasPriorityChanges: trigger.type === 'goal_change',
            confidence: 0.7
        };
    }
    async analyzeTimeConstraints(trigger, agentState) {
        return {
            hasDeadlinePressure: trigger.type === 'time_pressure',
            hasTimeOverruns: trigger.type === 'failure',
            pressure: trigger.severity === 'critical' ? 0.9 : 0.6,
            confidence: 0.8
        };
    }
    async analyzeRiskFactors(trigger, agentState) {
        return {
            hasResourceRisks: trigger.type === 'resource_change',
            hasEnvironmentalRisks: trigger.type === 'obstacle',
            hasSkillRisks: false,
            hasTimeRisks: trigger.type === 'time_pressure',
            confidence: 0.7
        };
    }
    // Plan generation methods
    async generateFailureRecoveryPlan(currentPlan, trigger, analysis, agentState, newPlanId) {
        return {
            ...currentPlan,
            id: newPlanId,
            title: `Recovery Plan: ${currentPlan.title}`,
            description: 'Plan generated to recover from failure',
            status: PlanStatus.PENDING,
            estimatedDuration: currentPlan.estimatedDuration * 1.5,
            updatedAt: Date.now(),
            steps: this.generateRecoverySteps(currentPlan, trigger),
            riskLevel: 'high',
            feasibilityScore: 0.6,
            confidence: 0.7
        };
    }
    async generateObstacleAvoidancePlan(currentPlan, trigger, analysis, agentState, newPlanId) {
        return {
            ...currentPlan,
            id: newPlanId,
            title: `Obstacle Avoidance: ${currentPlan.title}`,
            description: 'Plan modified to avoid obstacles',
            status: PlanStatus.PENDING,
            estimatedDuration: currentPlan.estimatedDuration * 1.2,
            updatedAt: Date.now(),
            steps: this.generateAvoidanceSteps(currentPlan, trigger),
            riskLevel: 'medium',
            feasibilityScore: 0.7,
            confidence: 0.8
        };
    }
    async generateResourceAdaptationPlan(currentPlan, trigger, analysis, agentState, newPlanId) {
        return {
            ...currentPlan,
            id: newPlanId,
            title: `Resource Adaptation: ${currentPlan.title}`,
            description: 'Plan adapted to resource changes',
            status: PlanStatus.PENDING,
            estimatedDuration: currentPlan.estimatedDuration * 1.1,
            updatedAt: Date.now(),
            steps: this.generateResourceAdaptationSteps(currentPlan, trigger),
            riskLevel: 'medium',
            feasibilityScore: 0.8,
            confidence: 0.8
        };
    }
    async generateGoalAdaptationPlan(currentPlan, trigger, analysis, agentState, newPlanId) {
        return {
            ...currentPlan,
            id: newPlanId,
            title: `Goal Adaptation: ${currentPlan.title}`,
            description: 'Plan adapted to goal changes',
            status: PlanStatus.PENDING,
            estimatedDuration: currentPlan.estimatedDuration,
            updatedAt: Date.now(),
            steps: this.generateGoalAdaptationSteps(currentPlan, trigger),
            riskLevel: 'low',
            feasibilityScore: 0.9,
            confidence: 0.9
        };
    }
    async generateTimeOptimizedPlan(currentPlan, trigger, analysis, agentState, newPlanId) {
        return {
            ...currentPlan,
            id: newPlanId,
            title: `Time Optimized: ${currentPlan.title}`,
            description: 'Plan optimized for time constraints',
            status: PlanStatus.PENDING,
            estimatedDuration: currentPlan.estimatedDuration * 0.8,
            updatedAt: Date.now(),
            steps: this.generateTimeOptimizedSteps(currentPlan, trigger),
            riskLevel: 'high',
            feasibilityScore: 0.6,
            confidence: 0.7
        };
    }
    async generateConflictResolutionPlan(currentPlan, trigger, analysis, agentState, newPlanId) {
        return {
            ...currentPlan,
            id: newPlanId,
            title: `Conflict Resolution: ${currentPlan.title}`,
            description: 'Plan modified to resolve conflicts',
            status: PlanStatus.PENDING,
            estimatedDuration: currentPlan.estimatedDuration * 1.3,
            updatedAt: Date.now(),
            steps: this.generateConflictResolutionSteps(currentPlan, trigger),
            riskLevel: 'medium',
            feasibilityScore: 0.7,
            confidence: 0.8
        };
    }
    async generateGenericReplan(currentPlan, trigger, analysis, agentState, newPlanId) {
        return {
            ...currentPlan,
            id: newPlanId,
            title: `Replanned: ${currentPlan.title}`,
            description: 'Plan regenerated due to changes',
            status: PlanStatus.PENDING,
            estimatedDuration: currentPlan.estimatedDuration,
            updatedAt: Date.now(),
            steps: this.generateGenericSteps(currentPlan, trigger),
            riskLevel: 'medium',
            feasibilityScore: 0.7,
            confidence: 0.7
        };
    }
    // Step generation methods
    generateRecoverySteps(originalPlan, trigger) {
        // Generate recovery steps based on failure
        return originalPlan.steps.map((step, index) => ({
            ...step,
            id: `recovery_step_${index}_${Date.now()}`,
            status: PlanStatus.PENDING,
            estimatedDuration: step.estimatedDuration ? step.estimatedDuration * 1.2 : undefined
        }));
    }
    generateAvoidanceSteps(originalPlan, trigger) {
        // Generate avoidance steps based on obstacle
        return originalPlan.steps.map((step, index) => ({
            ...step,
            id: `avoidance_step_${index}_${Date.now()}`,
            status: PlanStatus.PENDING,
            estimatedDuration: step.estimatedDuration ? step.estimatedDuration * 1.1 : undefined
        }));
    }
    generateResourceAdaptationSteps(originalPlan, trigger) {
        // Generate resource-adapted steps
        return originalPlan.steps.map((step, index) => ({
            ...step,
            id: `resource_step_${index}_${Date.now()}`,
            status: PlanStatus.PENDING
        }));
    }
    generateGoalAdaptationSteps(originalPlan, trigger) {
        // Generate goal-adapted steps
        return originalPlan.steps.map((step, index) => ({
            ...step,
            id: `goal_step_${index}_${Date.now()}`,
            status: PlanStatus.PENDING
        }));
    }
    generateTimeOptimizedSteps(originalPlan, trigger) {
        // Generate time-optimized steps
        return originalPlan.steps.map((step, index) => ({
            ...step,
            id: `time_step_${index}_${Date.now()}`,
            status: PlanStatus.PENDING,
            estimatedDuration: step.estimatedDuration ? step.estimatedDuration * 0.8 : undefined
        }));
    }
    generateConflictResolutionSteps(originalPlan, trigger) {
        // Generate conflict resolution steps
        return originalPlan.steps.map((step, index) => ({
            ...step,
            id: `conflict_step_${index}_${Date.now()}`,
            status: PlanStatus.PENDING,
            estimatedDuration: step.estimatedDuration ? step.estimatedDuration * 1.1 : undefined
        }));
    }
    generateGenericSteps(originalPlan, trigger) {
        // Generate generic replanned steps
        return originalPlan.steps.map((step, index) => ({
            ...step,
            id: `generic_step_${index}_${Date.now()}`,
            status: PlanStatus.PENDING
        }));
    }
    // Helper methods
    getTriggerScore(trigger) {
        const severityScores = { 'low': 0.2, 'medium': 0.5, 'high': 0.8, 'critical': 1.0 };
        return severityScores[trigger.severity] || 0.5;
    }
    getCurrentResourceUsage(agentState) {
        // Simple resource usage calculation
        return {
            items: agentState.context.inventory.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + item.count;
                return acc;
            }, {}),
            tools: {},
            time: Date.now(),
            skills: {},
            assistance: {}
        };
    }
    async detectExecutionIssues(monitoringData, agentState) {
        const issues = [];
        // Check for resource depletion
        const resourceUsage = monitoringData.resourceUsage.items;
        for (const [resourceType, usage] of Object.entries(resourceUsage)) {
            const available = agentState.context.inventory.find(item => item.type === resourceType)?.count || 0;
            if (available < usage) {
                issues.push({
                    type: 'resource_depletion',
                    severity: 'high',
                    description: `Resource depletion: ${resourceType}`,
                    stepId: 'unknown',
                    timestamp: Date.now()
                });
            }
        }
        return issues;
    }
    async detectBlockingFactors(monitoringData, agentState) {
        const factors = [];
        // Check for time overruns
        const elapsed = Date.now() - monitoringData.startTime;
        const estimatedTotal = Array.from(monitoringData.stepProgress.values())
            .reduce((sum, step) => sum + (step.estimatedDuration || 0), 0);
        if (elapsed > estimatedTotal * 1.5) {
            factors.push({
                type: 'time',
                severity: 'high',
                description: 'Significant time overrun detected',
                estimatedDelay: elapsed - estimatedTotal,
                mitigationStrategies: ['Optimize remaining steps', 'Consider parallel execution']
            });
        }
        return factors;
    }
    createReplanningResult(originalPlanId, success, reason, startTime) {
        return {
            originalPlanId: originalPlanId || 'unknown',
            newPlanId: success ? `replan_${Date.now()}` : 'failed',
            success,
            changes: [],
            learningOpportunities: [],
            lessons: [reason],
            replanningTime: Date.now() - startTime
        };
    }
    addToHistory(result) {
        this.replanningHistory.push(result);
        // Maintain history size limit
        if (this.replanningHistory.length > this.config.maxHistorySize) {
            this.replanningHistory.shift();
        }
    }
    startMonitoring() {
        setInterval(() => {
            // This would need to be connected to actual plan execution
            // For now, it's just a placeholder
        }, this.config.monitoringInterval);
    }
    /**
     * Get replanning history
     */
    getReplanningHistory() {
        return [...this.replanningHistory];
    }
    /**
     * Clear replanning history
     */
    clearHistory() {
        this.replanningHistory = [];
        console.log('[REPLANNING_SYSTEM] History cleared');
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
        console.log('[REPLANNING_SYSTEM] Configuration updated');
    }
    /**
     * Get replanning statistics
     */
    getStatistics() {
        const totalReplans = this.replanningHistory.length;
        const successfulReplans = this.replanningHistory.filter(result => result.success).length;
        const averageTime = totalReplans > 0
            ? this.replanningHistory.reduce((sum, result) => sum + result.replanningTime, 0) / totalReplans
            : 0;
        return {
            totalReplans,
            successfulReplans,
            averageReplanningTime: averageTime,
            lastReplanning: this.lastReplanning,
            activeMonitoring: this.activeMonitoring.size
        };
    }
}

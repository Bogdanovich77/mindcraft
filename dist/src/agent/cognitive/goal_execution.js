import { GoalStatus, GoalPriority } from './goal_types.js';
import { InterruptPriority } from '../langgraph/interfaces.js';
/**
 * Execution strategies for different goal types
 */
export var ExecutionStrategy;
(function (ExecutionStrategy) {
    ExecutionStrategy["SEQUENTIAL"] = "sequential";
    ExecutionStrategy["PARALLEL"] = "parallel";
    ExecutionStrategy["ADAPTIVE"] = "adaptive";
    ExecutionStrategy["OPPORTUNISTIC"] = "opportunistic";
    ExecutionStrategy["CONSERVATIVE"] = "conservative";
    ExecutionStrategy["AGGRESSIVE"] = "aggressive";
    ExecutionStrategy["COLLABORATIVE"] = "collaborative"; // Coordinate with other agents
})(ExecutionStrategy || (ExecutionStrategy = {}));
/**
 * Execution monitoring levels
 */
export var MonitoringLevel;
(function (MonitoringLevel) {
    MonitoringLevel["MINIMAL"] = "minimal";
    MonitoringLevel["STANDARD"] = "standard";
    MonitoringLevel["INTENSIVE"] = "intensive";
    MonitoringLevel["ADAPTIVE"] = "adaptive"; // Dynamic monitoring based on context
})(MonitoringLevel || (MonitoringLevel = {}));
/**
 * Goal execution engine
 */
export class GoalExecutionEngine {
    decompositionEngine;
    prioritizationEngine;
    activeExecutions;
    executionHistory;
    performanceMonitor;
    adaptationEngine;
    constructor(decompositionEngine, prioritizationEngine) {
        this.decompositionEngine = decompositionEngine;
        this.prioritizationEngine = prioritizationEngine;
        this.activeExecutions = new Map();
        this.executionHistory = [];
        this.performanceMonitor = new ExecutionPerformanceMonitor();
        this.adaptationEngine = new ExecutionAdaptationEngine();
    }
    /**
     * Execute a goal with specified strategy and monitoring
     */
    async executeGoal(goal, context, strategy, monitoringLevel) {
        const selectedStrategy = strategy || this.selectOptimalStrategy(goal, context);
        const selectedMonitoring = monitoringLevel || this.selectMonitoringLevel(goal, context);
        // Initialize execution state
        const executionState = {
            goalId: goal.id,
            strategy: selectedStrategy,
            monitoringLevel: selectedMonitoring,
            currentStep: 0,
            startTime: Date.now(),
            estimatedCompletion: Date.now() + (goal.estimatedDuration || 600000),
            actualProgress: 0,
            resourceUsage: [],
            errors: [],
            adaptations: [],
            checkpointsPassed: [],
            interruptHistory: []
        };
        this.activeExecutions.set(goal.id, executionState);
        try {
            // Update goal status
            goal.status = GoalStatus.ACTIVE;
            // Execute based on strategy
            const result = await this.executeWithStrategy(goal, context, executionState);
            // Record execution result
            this.executionHistory.push(result);
            // Update performance metrics
            this.performanceMonitor.recordExecution(result);
            return result;
        }
        catch (error) {
            const failureResult = this.createFailureResult(goal, error, executionState);
            this.executionHistory.push(failureResult);
            return failureResult;
        }
        finally {
            this.activeExecutions.delete(goal.id);
        }
    }
    /**
     * Monitor and update active goal executions
     */
    async updateExecutions(context, deltaTime) {
        const results = [];
        for (const [goalId, executionState] of this.activeExecutions) {
            try {
                // Check for interrupts
                const interrupt = this.checkForInterrupts(executionState, context);
                if (interrupt) {
                    await this.handleInterrupt(executionState, interrupt, context);
                    continue;
                }
                // Update progress based on monitoring level
                const progressUpdate = await this.updateExecutionProgress(executionState, context, deltaTime);
                if (progressUpdate.completed) {
                    // Goal completed
                    const result = await this.completeExecution(executionState, context);
                    results.push(result);
                }
                else if (progressUpdate.needsAdaptation) {
                    // Strategy needs adaptation
                    await this.adaptExecution(executionState, progressUpdate.adaptationReason || 'Unknown reason', context);
                }
            }
            catch (error) {
                const failureResult = this.createFailureResult({ id: goalId }, error, executionState);
                results.push(failureResult);
            }
        }
        return results;
    }
    /**
     * Execute goal using specific strategy
     */
    async executeWithStrategy(goal, context, executionState) {
        switch (executionState.strategy) {
            case ExecutionStrategy.SEQUENTIAL:
                return this.executeSequential(goal, context, executionState);
            case ExecutionStrategy.PARALLEL:
                return this.executeParallel(goal, context, executionState);
            case ExecutionStrategy.ADAPTIVE:
                return this.executeAdaptive(goal, context, executionState);
            case ExecutionStrategy.OPPORTUNISTIC:
                return this.executeOpportunistic(goal, context, executionState);
            case ExecutionStrategy.CONSERVATIVE:
                return this.executeConservative(goal, context, executionState);
            case ExecutionStrategy.AGGRESSIVE:
                return this.executeAggressive(goal, context, executionState);
            case ExecutionStrategy.COLLABORATIVE:
                return this.executeCollaborative(goal, context, executionState);
            default:
                return this.executeSequential(goal, context, executionState);
        }
    }
    /**
     * Sequential execution strategy
     */
    async executeSequential(goal, context, executionState) {
        const startTime = Date.now();
        const resourceUsage = [];
        const errors = [];
        const learning = [];
        // Execute steps in order
        if (goal.executionPlan) {
            for (let i = 0; i < goal.executionPlan.steps.length; i++) {
                const step = goal.executionPlan.steps[i];
                executionState.currentStep = i;
                try {
                    // Check prerequisites
                    if (!this.checkStepPrerequisites(step, context)) {
                        throw new Error(`Prerequisites not met for step: ${step.name}`);
                    }
                    // Execute step
                    const stepResult = await this.executeStep(step, context);
                    // Update progress
                    executionState.actualProgress = ((i + 1) / goal.executionPlan.steps.length) * 100;
                    this.updateGoalProgress(goal, executionState.actualProgress);
                    // Record resource usage
                    resourceUsage.push(...stepResult.resourceUsage);
                    // Check for completion after each step
                    if (this.checkGoalCompletion(goal, context)) {
                        break;
                    }
                }
                catch (error) {
                    const execError = {
                        type: 'system',
                        severity: 'medium',
                        message: error.message,
                        timestamp: Date.now(),
                        resolved: false
                    };
                    errors.push(execError);
                    // Decide whether to continue or abort
                    if (execError.severity === 'critical') {
                        break;
                    }
                }
            }
        }
        const duration = Date.now() - startTime;
        const success = this.checkGoalCompletion(goal, context);
        return {
            goalId: goal.id,
            success,
            status: success ? GoalStatus.COMPLETED : GoalStatus.FAILED,
            outcome: this.createExecutionOutcome(goal, success, duration),
            duration,
            resourcesUsed: resourceUsage,
            learning,
            errors,
            nextActions: this.generateNextActions(goal, success, context)
        };
    }
    /**
     * Parallel execution strategy
     */
    async executeParallel(goal, context, executionState) {
        const startTime = Date.now();
        const resourceUsage = [];
        const errors = [];
        const learning = [];
        if (goal.executionPlan) {
            // Identify parallelizable steps
            const parallelSteps = this.identifyParallelSteps(goal.executionPlan.steps);
            // Execute step groups in parallel
            for (const stepGroup of parallelSteps) {
                const stepPromises = stepGroup.map(step => this.executeStep(step, context).catch(error => ({
                    success: false,
                    error: error,
                    resourceUsage: [],
                    step
                })));
                const stepResults = await Promise.all(stepPromises);
                // Process results
                for (const result of stepResults) {
                    if (result.success === false) {
                        errors.push({
                            type: 'system',
                            severity: 'medium',
                            message: result.error.message,
                            timestamp: Date.now(),
                            resolved: false
                        });
                    }
                    else {
                        resourceUsage.push(...result.resourceUsage);
                    }
                }
                // Update progress
                const completedSteps = goal.executionPlan.steps.filter(s => stepResults.some(r => r.step?.id === s.id && r.success !== false)).length;
                executionState.actualProgress = (completedSteps / goal.executionPlan.steps.length) * 100;
                this.updateGoalProgress(goal, executionState.actualProgress);
            }
        }
        const duration = Date.now() - startTime;
        const success = this.checkGoalCompletion(goal, context);
        return {
            goalId: goal.id,
            success,
            status: success ? GoalStatus.COMPLETED : GoalStatus.FAILED,
            outcome: this.createExecutionOutcome(goal, success, duration),
            duration,
            resourcesUsed: resourceUsage,
            learning,
            errors,
            nextActions: this.generateNextActions(goal, success, context)
        };
    }
    /**
     * Adaptive execution strategy
     */
    async executeAdaptive(goal, context, executionState) {
        const startTime = Date.now();
        const resourceUsage = [];
        const errors = [];
        const learning = [];
        // Start with sequential execution, but adapt based on conditions
        let currentStrategy = ExecutionStrategy.SEQUENTIAL;
        while (!this.checkGoalCompletion(goal, context) && executionState.actualProgress < 100) {
            // Assess current conditions
            const assessment = this.assessExecutionConditions(goal, context, executionState);
            // Adapt strategy if needed
            if (assessment.recommendedStrategy !== currentStrategy) {
                const adaptation = await this.adaptationEngine.adaptStrategy(currentStrategy, assessment.recommendedStrategy, assessment.reason);
                if (adaptation.success) {
                    currentStrategy = assessment.recommendedStrategy;
                    executionState.adaptations.push({
                        timestamp: Date.now(),
                        reason: assessment.reason,
                        originalStrategy: executionState.strategy,
                        newStrategy: currentStrategy,
                        impact: assessment.impact,
                        success: true
                    });
                }
            }
            // Execute based on current strategy
            const stepResult = await this.executeStepWithStrategy(goal, context, executionState, currentStrategy);
            resourceUsage.push(...stepResult.resourceUsage);
            if (stepResult.error) {
                errors.push(stepResult.error);
            }
            // Update progress
            executionState.actualProgress = this.calculateProgress(goal, context);
            this.updateGoalProgress(goal, executionState.actualProgress);
            // Check for interrupts
            const interrupt = this.checkForInterrupts(executionState, context);
            if (interrupt && interrupt.priority <= InterruptPriority.SURVIVAL) {
                break;
            }
        }
        const duration = Date.now() - startTime;
        const success = this.checkGoalCompletion(goal, context);
        return {
            goalId: goal.id,
            success,
            status: success ? GoalStatus.COMPLETED : GoalStatus.FAILED,
            outcome: this.createExecutionOutcome(goal, success, duration),
            duration,
            resourcesUsed: resourceUsage,
            learning,
            errors,
            nextActions: this.generateNextActions(goal, success, context)
        };
    }
    /**
     * Opportunistic execution strategy
     */
    async executeOpportunistic(goal, context, executionState) {
        const startTime = Date.now();
        const resourceUsage = [];
        const errors = [];
        const learning = [];
        // Continuously scan for opportunities
        while (!this.checkGoalCompletion(goal, context)) {
            const opportunities = this.scanForOpportunities(goal, context);
            if (opportunities.length > 0) {
                // Execute highest-value opportunity
                const bestOpportunity = opportunities[0];
                const result = await this.executeOpportunity(bestOpportunity, context);
                resourceUsage.push(...result.resourceUsage);
                if (result.error) {
                    errors.push(result.error);
                }
            }
            else {
                // Fall back to standard execution
                const stepResult = await this.executeNextStep(goal, context, executionState);
                resourceUsage.push(...stepResult.resourceUsage);
                if (stepResult.error) {
                    errors.push(stepResult.error);
                }
            }
            // Update progress
            executionState.actualProgress = this.calculateProgress(goal, context);
            this.updateGoalProgress(goal, executionState.actualProgress);
            // Check for interrupts
            const interrupt = this.checkForInterrupts(executionState, context);
            if (interrupt && interrupt.priority <= InterruptPriority.SURVIVAL) {
                break;
            }
        }
        const duration = Date.now() - startTime;
        const success = this.checkGoalCompletion(goal, context);
        return {
            goalId: goal.id,
            success,
            status: success ? GoalStatus.COMPLETED : GoalStatus.FAILED,
            outcome: this.createExecutionOutcome(goal, success, duration),
            duration,
            resourcesUsed: resourceUsage,
            learning,
            errors,
            nextActions: this.generateNextActions(goal, success, context)
        };
    }
    /**
     * Conservative execution strategy
     */
    async executeConservative(goal, context, executionState) {
        const startTime = Date.now();
        const resourceUsage = [];
        const errors = [];
        const learning = [];
        // Extra validation and safety checks
        if (!this.validateSafetyConditions(goal, context)) {
            throw new Error('Safety conditions not met for conservative execution');
        }
        // Execute with maximum caution
        if (goal.executionPlan) {
            for (let i = 0; i < goal.executionPlan.steps.length; i++) {
                const step = goal.executionPlan.steps[i];
                executionState.currentStep = i;
                // Double-check prerequisites
                if (!this.checkStepPrerequisites(step, context)) {
                    // Wait for conditions to improve
                    await this.waitForSafeConditions(step, context);
                }
                // Execute with safety monitoring
                const stepResult = await this.executeStepSafely(step, context);
                resourceUsage.push(...stepResult.resourceUsage);
                if (stepResult.error) {
                    errors.push(stepResult.error);
                    // Conservative strategy aborts on any error
                    break;
                }
                // Update progress
                executionState.actualProgress = ((i + 1) / goal.executionPlan.steps.length) * 100;
                this.updateGoalProgress(goal, executionState.actualProgress);
            }
        }
        const duration = Date.now() - startTime;
        const success = this.checkGoalCompletion(goal, context);
        return {
            goalId: goal.id,
            success,
            status: success ? GoalStatus.COMPLETED : GoalStatus.FAILED,
            outcome: this.createExecutionOutcome(goal, success, duration),
            duration,
            resourcesUsed: resourceUsage,
            learning,
            errors,
            nextActions: this.generateNextActions(goal, success, context)
        };
    }
    /**
     * Aggressive execution strategy
     */
    async executeAggressive(goal, context, executionState) {
        const startTime = Date.now();
        const resourceUsage = [];
        const errors = [];
        const learning = [];
        // Execute with maximum speed and efficiency
        if (goal.executionPlan) {
            // Try to execute steps in parallel when possible
            const parallelSteps = this.identifyParallelSteps(goal.executionPlan.steps);
            for (const stepGroup of parallelSteps) {
                const stepPromises = stepGroup.map(step => this.executeStepAggressively(step, context));
                const stepResults = await Promise.allSettled(stepPromises);
                for (const result of stepResults) {
                    if (result.status === 'fulfilled') {
                        resourceUsage.push(...result.value.resourceUsage);
                    }
                    else {
                        errors.push({
                            type: 'system',
                            severity: 'low', // Aggressive strategy tolerates more errors
                            message: result.reason?.message || 'Unknown error',
                            timestamp: Date.now(),
                            resolved: false
                        });
                    }
                }
            }
        }
        const duration = Date.now() - startTime;
        const success = this.checkGoalCompletion(goal, context);
        return {
            goalId: goal.id,
            success,
            status: success ? GoalStatus.COMPLETED : GoalStatus.FAILED,
            outcome: this.createExecutionOutcome(goal, success, duration),
            duration,
            resourcesUsed: resourceUsage,
            learning,
            errors,
            nextActions: this.generateNextActions(goal, success, context)
        };
    }
    /**
     * Collaborative execution strategy
     */
    async executeCollaborative(goal, context, executionState) {
        const startTime = Date.now();
        const resourceUsage = [];
        const errors = [];
        const learning = [];
        // Coordinate with other agents
        const collaborators = this.identifyCollaborators(goal, context);
        if (collaborators.length > 0) {
            // Delegate tasks to collaborators
            const delegatedTasks = await this.delegateTasks(goal, collaborators, context);
            // Execute own tasks while monitoring collaborators
            await this.executeCollaborativeTasks(goal, context, executionState, delegatedTasks);
        }
        else {
            // Fall back to sequential execution
            return this.executeSequential(goal, context, executionState);
        }
        const duration = Date.now() - startTime;
        const success = this.checkGoalCompletion(goal, context);
        return {
            goalId: goal.id,
            success,
            status: success ? GoalStatus.COMPLETED : GoalStatus.FAILED,
            outcome: this.createExecutionOutcome(goal, success, duration),
            duration,
            resourcesUsed: resourceUsage,
            learning,
            errors,
            nextActions: this.generateNextActions(goal, success, context)
        };
    }
    /**
     * Helper methods for execution
     */
    selectOptimalStrategy(goal, context) {
        // Analyze goal characteristics and context to select best strategy
        const urgency = this.calculateUrgency(goal, context);
        const complexity = this.estimateComplexity(goal);
        const riskLevel = this.assessRiskLevel(goal, context);
        const collaborationOpportunity = this.assessCollaborationOpportunity(goal, context);
        if (collaborationOpportunity > 0.7) {
            return ExecutionStrategy.COLLABORATIVE;
        }
        if (urgency > 0.8 && riskLevel < 0.3) {
            return ExecutionStrategy.AGGRESSIVE;
        }
        if (riskLevel > 0.7) {
            return ExecutionStrategy.CONSERVATIVE;
        }
        if (complexity > 0.7) {
            return ExecutionStrategy.ADAPTIVE;
        }
        if (context.environmentalConditions.some(c => c.type === 'opportunity')) {
            return ExecutionStrategy.OPPORTUNISTIC;
        }
        return ExecutionStrategy.SEQUENTIAL;
    }
    selectMonitoringLevel(goal, context) {
        const importance = this.mapPriorityToImportance(goal.priority);
        const riskLevel = this.assessRiskLevel(goal, context);
        if (importance > 0.8 || riskLevel > 0.7) {
            return MonitoringLevel.INTENSIVE;
        }
        if (importance > 0.6 || riskLevel > 0.4) {
            return MonitoringLevel.STANDARD;
        }
        return MonitoringLevel.MINIMAL;
    }
    async executeStep(step, context) {
        // Placeholder for step execution
        // This would integrate with the actual skill execution system
        return {
            success: true,
            resourceUsage: []
        };
    }
    async executeStepWithStrategy(goal, context, executionState, strategy) {
        // Execute step based on strategy
        return { resourceUsage: [] };
    }
    async executeOpportunity(opportunity, context) {
        // Execute opportunity
        return { resourceUsage: [] };
    }
    async executeNextStep(goal, context, executionState) {
        // Execute next step in plan
        return { resourceUsage: [] };
    }
    async executeStepSafely(step, context) {
        // Execute step with safety monitoring
        return { resourceUsage: [] };
    }
    async executeStepAggressively(step, context) {
        // Execute step aggressively
        return { resourceUsage: [] };
    }
    checkStepPrerequisites(step, context) {
        // Check if step prerequisites are met
        return true;
    }
    checkGoalCompletion(goal, context) {
        // Check if goal success criteria are met
        return goal.progress.percentage >= 100;
    }
    updateGoalProgress(goal, progress) {
        goal.progress.percentage = Math.min(100, progress);
        goal.progress.lastUpdate = Date.now();
    }
    createExecutionOutcome(goal, success, duration) {
        return {
            completionPercentage: success ? 100 : goal.progress.percentage,
            qualityScore: success ? 0.8 : 0.3,
            unexpectedEvents: [],
            sideEffects: [],
            value: success ? 0.9 : 0.2
        };
    }
    generateNextActions(goal, success, context) {
        if (success) {
            return ['Goal completed successfully', 'Update learning systems', 'Plan next objectives'];
        }
        else {
            return ['Analyze failure causes', 'Adjust strategy', 'Retry with different approach'];
        }
    }
    createFailureResult(goal, error, executionState) {
        return {
            goalId: goal.id,
            success: false,
            status: GoalStatus.FAILED,
            outcome: {
                completionPercentage: executionState.actualProgress,
                qualityScore: 0.1,
                unexpectedEvents: [error.message],
                sideEffects: [],
                value: 0
            },
            duration: Date.now() - executionState.startTime,
            resourcesUsed: executionState.resourceUsage,
            learning: [],
            errors: [{
                    type: 'system',
                    severity: 'critical',
                    message: error.message,
                    timestamp: Date.now(),
                    resolved: false
                }],
            nextActions: ['Analyze failure', 'Recover resources', 'Plan retry']
        };
    }
    identifyParallelSteps(steps) {
        // Group steps that can be executed in parallel
        const groups = [];
        const processed = new Set();
        for (const step of steps) {
            if (processed.has(step.id))
                continue;
            // Find steps with no dependencies on each other
            const parallelGroup = [step];
            processed.add(step.id);
            for (const otherStep of steps) {
                if (processed.has(otherStep.id))
                    continue;
                const hasDependency = step.dependencies.includes(otherStep.id) ||
                    otherStep.dependencies.includes(step.id);
                if (!hasDependency) {
                    parallelGroup.push(otherStep);
                    processed.add(otherStep.id);
                }
            }
            groups.push(parallelGroup);
        }
        return groups;
    }
    assessExecutionConditions(goal, context, executionState) {
        // Assess current conditions and recommend strategy
        return {
            recommendedStrategy: ExecutionStrategy.SEQUENTIAL,
            reason: 'Standard conditions',
            impact: 'low'
        };
    }
    scanForOpportunities(goal, context) {
        // Scan for opportunities that could accelerate goal completion
        return [];
    }
    validateSafetyConditions(goal, context) {
        // Validate that conditions are safe for execution
        return context.environmentalConditions.every(c => c.type !== 'danger' || c.severity < 0.5);
    }
    async waitForSafeConditions(step, context) {
        // Wait for conditions to become safe
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    identifyCollaborators(goal, context) {
        // Identify potential collaborators
        return context.socialContext.nearbyAgents
            .filter(agent => agent.relationship === 'ally' || agent.relationship === 'friend')
            .map(agent => agent.agentId);
    }
    async delegateTasks(goal, collaborators, context) {
        // Delegate tasks to collaborators
        return [];
    }
    async executeCollaborativeTasks(goal, context, executionState, delegatedTasks) {
        // Execute tasks while monitoring collaborators
    }
    calculateUrgency(goal, context) {
        if (!goal.deadline)
            return 0;
        const timeRemaining = goal.deadline - Date.now();
        const totalTime = goal.estimatedDuration || timeRemaining;
        return Math.max(0, 1 - (timeRemaining / totalTime));
    }
    estimateComplexity(goal) {
        return (goal.requirements.length * 0.1) + (goal.dependencies.length * 0.15);
    }
    assessRiskLevel(goal, context) {
        const dangerousConditions = context.environmentalConditions.filter(c => c.type === 'danger' && c.severity > 0.5).length;
        return Math.min(1, dangerousConditions * 0.3);
    }
    assessCollaborationOpportunity(goal, context) {
        const allies = context.socialContext.nearbyAgents.filter(a => a.relationship === 'ally' || a.relationship === 'friend').length;
        return Math.min(1, allies * 0.2);
    }
    mapPriorityToImportance(priority) {
        switch (priority) {
            case GoalPriority.CRITICAL: return 1.0;
            case GoalPriority.HIGH: return 0.8;
            case GoalPriority.MEDIUM: return 0.6;
            case GoalPriority.LOW: return 0.4;
            case GoalPriority.BACKGROUND: return 0.2;
            default: return 0.5;
        }
    }
    calculateProgress(goal, context) {
        // Calculate actual progress based on current state
        return goal.progress.percentage;
    }
    checkForInterrupts(executionState, context) {
        // Check if execution should be interrupted
        const hasThreats = context.environmentalConditions.some(c => c.type === 'danger' && c.severity > 0.7);
        if (hasThreats) {
            return {
                timestamp: Date.now(),
                priority: InterruptPriority.SURVIVAL,
                reason: 'Environmental threat detected',
                handled: false
            };
        }
        return null;
    }
    async handleInterrupt(executionState, interrupt, context) {
        // Handle execution interrupt
        executionState.interruptHistory.push(interrupt);
        interrupt.handled = true;
    }
    async updateExecutionProgress(executionState, context, deltaTime) {
        // Update execution progress based on monitoring level
        return {
            completed: false,
            needsAdaptation: false
        };
    }
    async completeExecution(executionState, context) {
        // Complete execution and return result
        return {
            goalId: executionState.goalId,
            success: true,
            status: GoalStatus.COMPLETED,
            outcome: {
                completionPercentage: 100,
                qualityScore: 0.8,
                unexpectedEvents: [],
                sideEffects: [],
                value: 0.9
            },
            duration: Date.now() - executionState.startTime,
            resourcesUsed: executionState.resourceUsage,
            learning: [],
            errors: executionState.errors,
            nextActions: ['Goal completed', 'Plan next objectives']
        };
    }
    async adaptExecution(executionState, reason, context) {
        // Adapt execution strategy
        const adaptation = await this.adaptationEngine.adaptStrategy(executionState.strategy, ExecutionStrategy.ADAPTIVE, reason);
        if (adaptation.success) {
            executionState.strategy = ExecutionStrategy.ADAPTIVE;
            executionState.adaptations.push({
                timestamp: Date.now(),
                reason,
                originalStrategy: executionState.strategy,
                newStrategy: ExecutionStrategy.ADAPTIVE,
                impact: 'medium',
                success: true
            });
        }
    }
    /**
     * Get execution statistics
     */
    getExecutionStats() {
        const total = this.executionHistory.length;
        const successful = this.executionHistory.filter(r => r.success).length;
        const averageDuration = total > 0 ?
            this.executionHistory.reduce((sum, r) => sum + r.duration, 0) / total : 0;
        const errorCounts = new Map();
        for (const result of this.executionHistory) {
            for (const error of result.errors) {
                errorCounts.set(error.message, (errorCounts.get(error.message) || 0) + 1);
            }
        }
        const commonErrors = Array.from(errorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([message]) => message);
        return {
            totalExecutions: total,
            successRate: total > 0 ? successful / total : 0,
            averageDuration,
            commonErrors
        };
    }
}
/**
 * Execution performance monitor
 */
class ExecutionPerformanceMonitor {
    performanceHistory = [];
    recordExecution(result) {
        this.performanceHistory.push({
            timestamp: Date.now(),
            goalId: result.goalId,
            strategy: ExecutionStrategy.SEQUENTIAL, // Would be tracked in execution state
            duration: result.duration,
            success: result.success,
            quality: result.outcome.qualityScore
        });
        // Keep history manageable
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory = this.performanceHistory.slice(-1000);
        }
    }
    getPerformanceMetrics() {
        const total = this.performanceHistory.length;
        if (total === 0) {
            return {
                averageDuration: 0,
                successRate: 0,
                averageQuality: 0,
                strategyPerformance: {}
            };
        }
        const successful = this.performanceHistory.filter(h => h.success).length;
        const averageDuration = this.performanceHistory.reduce((sum, h) => sum + h.duration, 0) / total;
        const averageQuality = this.performanceHistory.reduce((sum, h) => sum + h.quality, 0) / total;
        // Calculate strategy-specific performance
        const strategyPerformance = {};
        for (const strategy of Object.values(ExecutionStrategy)) {
            const strategyResults = this.performanceHistory.filter(h => h.strategy === strategy);
            if (strategyResults.length > 0) {
                const strategySuccessful = strategyResults.filter(h => h.success).length;
                const strategyAvgDuration = strategyResults.reduce((sum, h) => sum + h.duration, 0) / strategyResults.length;
                strategyPerformance[strategy] = {
                    successRate: strategySuccessful / strategyResults.length,
                    averageDuration: strategyAvgDuration
                };
            }
        }
        return {
            averageDuration,
            successRate: successful / total,
            averageQuality,
            strategyPerformance
        };
    }
}
/**
 * Execution adaptation engine
 */
class ExecutionAdaptationEngine {
    adaptationHistory = [];
    async adaptStrategy(currentStrategy, newStrategy, reason) {
        // Analyze adaptation feasibility
        const confidence = this.calculateAdaptationConfidence(currentStrategy, newStrategy, reason);
        if (confidence > 0.6) {
            this.adaptationHistory.push({
                timestamp: Date.now(),
                fromStrategy: currentStrategy,
                toStrategy: newStrategy,
                reason,
                success: true
            });
            return { success: true, confidence };
        }
        return { success: false, confidence };
    }
    calculateAdaptationConfidence(from, to, reason) {
        // Simple heuristic for adaptation confidence
        if (from === to)
            return 0;
        // Some adaptations are more reliable than others
        const reliableAdaptations = new Map([
            [ExecutionStrategy.SEQUENTIAL, ExecutionStrategy.ADAPTIVE],
            [ExecutionStrategy.AGGRESSIVE, ExecutionStrategy.CONSERVATIVE],
            [ExecutionStrategy.CONSERVATIVE, ExecutionStrategy.SEQUENTIAL]
        ]);
        return reliableAdaptations.has(from) && reliableAdaptations.get(from) === to ? 0.8 : 0.5;
    }
}

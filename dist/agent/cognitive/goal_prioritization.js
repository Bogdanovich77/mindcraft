/**
 * Goal Prioritization Engine for LangGraph v2
 *
 * This engine calculates priority scores for goals based on multiple factors
 * including agent personality, motivations, skills, resources, and context.
 */
export class GoalPrioritizationEngine {
    strategicWeight = 0.25;
    tacticalWeight = 0.25;
    operationalWeight = 0.2;
    socialWeight = 0.1;
    personalWeight = 0.1;
    environmentalWeight = 0.05;
    temporalWeight = 0.05;
    /**
     * Calculate priority score for a goal
     */
    calculateGoalPriority(goal, agentState, context, executionContext) {
        // Create proper execution context if not provided
        const fullExecutionContext = executionContext || {
            currentStep: 0,
            status: 'running',
            startTime: Date.now(),
            lastUpdate: Date.now(),
            agentState,
            decisionContext: context
        };
        const factors = this.calculatePrioritizationFactors(goal, agentState, fullExecutionContext);
        const score = (factors.urgency * (factors.urgencyWeight || 0)) +
            (factors.valueAlignment * (factors.importanceWeight || 0)) +
            (factors.feasibility * (factors.feasibilityWeight || 0)) +
            (factors.socialImpact * (factors.alignmentWeight || 0)) +
            (factors.skillAlignment * (factors.resourceWeight || 0));
        return {
            goalId: goal.id,
            score: Math.max(0, Math.min(1, score)),
            factors,
            timestamp: Date.now()
        };
    }
    /**
     * Calculate individual factor scores for a goal
     */
    calculatePrioritizationFactors(goal, agentState, executionContext) {
        const urgency = this.calculateUrgencyFactor(goal, executionContext.decisionContext);
        const valueAlignment = this.calculateValueAlignment(goal, agentState.cognitive.purpose.values);
        const feasibility = this.calculateFeasibilityScore(goal, agentState, executionContext);
        const socialImpact = this.calculateSocialPriorityFactor(goal, agentState.cognitive.social);
        const skillAlignment = this.calculateSkillAlignmentFactor(goal, agentState.cognitive.skills);
        return {
            urgency,
            valueAlignment,
            feasibility,
            socialImpact,
            skillAlignment,
            urgencyWeight: this.temporalWeight,
            importanceWeight: this.strategicWeight + this.tacticalWeight,
            feasibilityWeight: 0.2,
            resourceWeight: this.environmentalWeight,
            alignmentWeight: this.personalWeight + this.socialWeight
        };
    }
    /**
     * Calculate urgency factor
     */
    calculateUrgencyFactor(goal, context) {
        let urgencyScore = 0.5;
        // Consider deadline urgency
        const now = Date.now();
        if (goal.deadline && goal.deadline > now) {
            const timeRemaining = goal.deadline - now;
            const totalDuration = goal.deadline - goal.createdAt;
            const timeRatio = timeRemaining / totalDuration;
            if (timeRatio < 0.1) {
                urgencyScore = 1.0; // Very urgent
            }
            else if (timeRatio < 0.3) {
                urgencyScore = 0.8; // Urgent
            }
            else if (timeRatio < 0.6) {
                urgencyScore = 0.6; // Moderate urgency
            }
            else {
                urgencyScore = 0.3; // Low urgency
            }
        }
        // Consider context urgency
        if (context.urgency) {
            urgencyScore += context.urgency * 0.3;
        }
        return Math.max(0, Math.min(1, urgencyScore));
    }
    /**
     * Calculate skill alignment factor
     */
    calculateSkillAlignmentFactor(goal, skills) {
        const requiredSkills = this.extractRequiredSkills(goal);
        let alignmentScore = 0;
        for (const skillType of requiredSkills) {
            const skill = skills.skills.get(skillType);
            if (skill) {
                alignmentScore += skill.proficiency.overall;
            }
        }
        return requiredSkills.length > 0 ? alignmentScore / requiredSkills.length : 0.5;
    }
    /**
     * Extract required skills from goal
     */
    extractRequiredSkills(goal) {
        const skills = [];
        const description = goal.description.toLowerCase();
        if (description.includes('craft') || description.includes('build')) {
            skills.push('crafting', 'construction');
        }
        if (description.includes('mine') || description.includes('dig')) {
            skills.push('mining', 'excavation');
        }
        if (description.includes('fight') || description.includes('combat')) {
            skills.push('combat', 'defense');
        }
        if (description.includes('explore') || description.includes('travel')) {
            skills.push('exploration', 'navigation');
        }
        if (description.includes('farm') || description.includes('grow')) {
            skills.push('farming', 'agriculture');
        }
        return skills;
    }
    /**
     * Calculate value alignment
     */
    calculateValueAlignment(goal, values) {
        let alignment = 0;
        const goalKeywords = goal.description.toLowerCase().split(/\s+/);
        values.forEach(value => {
            if (goalKeywords.includes(value.name.toLowerCase())) {
                alignment += value.priority;
            }
        });
        return Math.min(1.0, alignment);
    }
    /**
     * Calculate social priority factor
     */
    calculateSocialPriorityFactor(goal, socialState) {
        let collaborationFactor = 0;
        // Goals that help others get higher social priority
        if (goal.description.toLowerCase().includes('help')) {
            collaborationFactor += 0.5;
        }
        // Collaborative goals get higher priority when agents are nearby
        if (goal.resources.assistance && goal.resources.assistance.length > 0) {
            if (socialState.nearbyAgents.length > 0) {
                collaborationFactor += 0.3;
            }
        }
        // Consider reputation and trust levels
        const reputationScore = (socialState.reputation?.reputationScore || 0) / 100;
        collaborationFactor += Math.min(0.3, Math.max(0.1, reputationScore));
        return Math.max(0, Math.min(1, collaborationFactor));
    }
    /**
     * Calculate feasibility score
     */
    calculateFeasibilityScore(goal, agentState, executionContext) {
        // Resource availability assessment
        const resourceAvailability = this.calculateResourceAvailabilityFactor(goal, agentState.context.inventory);
        // Skill readiness assessment
        const skillReadiness = this.calculateSkillFactor(goal, agentState.cognitive.skills);
        // Environmental fit assessment
        const environmentalFit = this.calculateEnvironmentalFactor(goal, agentState);
        // Risk assessment
        const riskAssessment = this.calculateRisk(goal, agentState);
        const score = (resourceAvailability * 0.3) + (skillReadiness * 0.3) +
            (environmentalFit * 0.2) + (riskAssessment * 0.2);
        return Math.max(0, Math.min(1, score));
    }
    /**
     * Calculate resource availability factor
     */
    calculateResourceAvailabilityFactor(goal, inventory) {
        const requiredItems = goal.resources.items || [];
        if (!requiredItems || requiredItems.length === 0) {
            return 1.0;
        }
        let totalRequired = 0;
        let availabilityScore = 0;
        for (const required of requiredItems) {
            totalRequired += required.amount;
            const available = inventory.items.find((item) => item.type === required.type)?.count || 0;
            availabilityScore += Math.min(1, available / required.amount);
        }
        return totalRequired > 0 ? availabilityScore / requiredItems.length : 1.0;
    }
    /**
     * Calculate skill factor
     */
    calculateSkillFactor(goal, skills) {
        const requiredSkills = this.extractRequiredSkills(goal);
        if (requiredSkills.length === 0) {
            return 0.8; // Base score for goals without specific skill requirements
        }
        let totalSkillLevel = 0;
        for (const skillName of requiredSkills) {
            const skill = skills.skills.get(skillName);
            if (skill) {
                totalSkillLevel += skill.proficiency.overall;
            }
            else {
                totalSkillLevel += 0.1; // Low score for missing skills
            }
        }
        return totalSkillLevel / requiredSkills.length;
    }
    /**
     * Calculate environmental factor
     */
    calculateEnvironmentalFactor(goal, agentState) {
        const worldContext = agentState.context;
        let environmentalScore = 0.5;
        // Time of day considerations
        if (goal.description.includes('explore') && worldContext.timeOfDay >= 12000 && worldContext.timeOfDay <= 23000) {
            environmentalScore -= 0.3; // Night exploration penalty
        }
        // Weather considerations
        if (worldContext.weather === 'rain' && goal.description.includes('build')) {
            environmentalScore -= 0.2;
        }
        if (worldContext.weather === 'clear' && goal.description.includes('explore')) {
            environmentalScore += 0.2;
        }
        // Health considerations
        if (worldContext.health < 10 && goal.type !== 'strategic') {
            environmentalScore -= 0.4;
        }
        return Math.max(0, Math.min(1, environmentalScore));
    }
    /**
     * Calculate risk assessment
     */
    calculateRisk(goal, agentState) {
        let riskScore = 0.5;
        // Environmental risk
        const worldContext = agentState.context;
        if (worldContext.health < 15) {
            riskScore -= 0.3;
        }
        // Hostile entities nearby
        const hostileEntities = worldContext.nearbyEntities.filter(e => e.hostile);
        if (hostileEntities.length > 0) {
            riskScore -= hostileEntities.length * 0.1;
        }
        // Risky goal types
        if (goal.description.includes('combat') || goal.description.includes('danger')) {
            riskScore -= 0.2;
        }
        // Personality risk tolerance
        const riskTolerance = agentState.cognitive.purpose.personality.riskTolerance || 0.5;
        riskScore += (riskTolerance - 0.5) * 0.4;
        return Math.max(0, Math.min(1, riskScore));
    }
    /**
     * Prioritize multiple goals and return ranked results
     */
    prioritizeGoals(goals, context) {
        const startTime = Date.now();
        const goalScores = [];
        for (const goal of goals) {
            const priorityScoreResult = this.calculateGoalPriority(goal, context.agentState, context.decisionContext, context);
            const factors = {
                urgency: this.calculateUrgencyFactor(goal, context.agentState.executive?.decisionContext || { urgency: 0, situation: '', options: [], constraints: {}, priorities: {} }),
                valueAlignment: this.calculateValueAlignment(goal, context.agentState.cognitive.purpose.values),
                feasibility: this.calculateFeasibilityScore(goal, context.agentState, context),
                socialImpact: this.calculateSocialPriorityFactor(goal, context.agentState.cognitive.social),
                skillAlignment: this.calculateSkillAlignmentFactor(goal, context.agentState.cognitive.skills),
                urgencyWeight: this.temporalWeight,
                importanceWeight: this.strategicWeight + this.tacticalWeight,
                feasibilityWeight: 0.2,
                resourceWeight: this.environmentalWeight,
                alignmentWeight: this.personalWeight + this.socialWeight
            };
            const rankedGoal = {
                id: goal.id,
                type: goal.type,
                priority: goal.priority,
                status: goal.status,
                description: goal.description,
                createdAt: goal.createdAt,
                updatedAt: goal.updatedAt,
                dependencies: goal.dependencies,
                resources: goal.resources,
                progress: goal.progress,
                deadline: goal.deadline || 0, // Provide default value for optional property
                memberIds: goal.memberIds || [], // Provide default value for optional property
                isAntiIdle: goal.isAntiIdle || false, // Provide default value for optional property
                priorityScore: priorityScoreResult.score,
                factors,
                rank: 0, // Placeholder
            };
            goalScores.push(rankedGoal);
        }
        // Sort goals by priority score (descending)
        goalScores.sort((a, b) => b.priorityScore - a.priorityScore);
        // Assign ranks
        goalScores.forEach((goalScore, index) => {
            goalScore.rank = index + 1;
        });
        return {
            rankedGoals: goalScores,
            processingTime: Date.now() - startTime
        };
    }
    /**
     * Get current prioritization factors and weights
     */
    getFactors() {
        return {
            urgency: 0,
            valueAlignment: 0,
            feasibility: 0,
            socialImpact: 0,
            skillAlignment: 0,
            urgencyWeight: this.temporalWeight,
            importanceWeight: this.strategicWeight + this.tacticalWeight,
            feasibilityWeight: 0.2,
            resourceWeight: this.environmentalWeight,
            alignmentWeight: this.personalWeight + this.socialWeight
        };
    }
}
//# sourceMappingURL=goal_prioritization.js.map
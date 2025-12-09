/**
 * Resource types for goal management
 */
export var ResourceType;
(function (ResourceType) {
    ResourceType["ITEM"] = "item";
    ResourceType["TOOL"] = "tool";
    ResourceType["SKILL"] = "skill";
    ResourceType["TIME"] = "time";
    ResourceType["LOCATION"] = "location";
    ResourceType["ENERGY"] = "energy";
    ResourceType["SOCIAL"] = "social";
    ResourceType["INFORMATION"] = "information"; // Knowledge and information
})(ResourceType || (ResourceType = {}));
/**
 * Resource priority levels
 */
export var ResourcePriority;
(function (ResourcePriority) {
    ResourcePriority[ResourcePriority["CRITICAL"] = 0] = "CRITICAL";
    ResourcePriority[ResourcePriority["HIGH"] = 1] = "HIGH";
    ResourcePriority[ResourcePriority["MEDIUM"] = 2] = "MEDIUM";
    ResourcePriority[ResourcePriority["LOW"] = 3] = "LOW";
    ResourcePriority[ResourcePriority["OPTIONAL"] = 4] = "OPTIONAL"; // Can be substituted or skipped
})(ResourcePriority || (ResourcePriority = {}));
/**
 * Resource allocation strategies
 */
export var AllocationStrategy;
(function (AllocationStrategy) {
    AllocationStrategy["FIRST_COME_FIRST_SERVED"] = "first_come_first_served";
    AllocationStrategy["PRIORITY_BASED"] = "priority_based";
    AllocationStrategy["EFFICIENCY_MAXIMIZATION"] = "efficiency_maximization";
    AllocationStrategy["FAIR_DISTRIBUTION"] = "fair_distribution";
    AllocationStrategy["OPPORTUNISTIC"] = "opportunistic";
    AllocationStrategy["CONSERVATIVE"] = "conservative";
})(AllocationStrategy || (AllocationStrategy = {}));
/**
 * Resource reservation status
 */
export var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "pending";
    ReservationStatus["RESERVED"] = "reserved";
    ReservationStatus["ALLOCATED"] = "allocated";
    ReservationStatus["CONSUMED"] = "consumed";
    ReservationStatus["RELEASED"] = "released";
    ReservationStatus["EXPIRED"] = "expired";
})(ReservationStatus || (ReservationStatus = {}));
/**
 * Goal resource manager
 */
export class GoalResourceManager {
    reservations;
    allocationStrategy;
    scarcityCache;
    resourceOptimizer;
    acquisitionPlanner;
    constructor(allocationStrategy = AllocationStrategy.PRIORITY_BASED) {
        this.reservations = new Map();
        this.allocationStrategy = allocationStrategy;
        this.scarcityCache = new Map();
        this.resourceOptimizer = new ResourceOptimizer();
        this.acquisitionPlanner = new ResourceAcquisitionPlanner();
    }
    /**
     * Assess resource availability for a goal
     */
    async assessResourceAvailability(goal, context) {
        const available = [];
        const missing = [];
        const scarce = [];
        const alternatives = [];
        for (const requirement of goal.requirements) {
            const availableResource = this.findAvailableResource(requirement, context.availableResources);
            if (availableResource) {
                available.push(availableResource);
                // Check if quantity is sufficient
                if (availableResource.quantity < requirement.quantity) {
                    scarce.push(requirement);
                }
            }
            else {
                missing.push(requirement);
                // Find alternatives
                const resourceAlternatives = await this.findAlternatives(requirement, context);
                if (resourceAlternatives.length > 0) {
                    alternatives.push({
                        original: requirement,
                        alternatives: resourceAlternatives
                    });
                }
            }
        }
        return { available, missing, scarce, alternatives };
    }
    /**
     * Reserve resources for a goal
     */
    async reserveResources(goal, context) {
        const reservations = [];
        const errors = [];
        try {
            // Check resource availability
            const availability = await this.assessResourceAvailability(goal, context);
            // Handle missing critical resources
            for (const missing of availability.missing) {
                if (this.isCriticalResource(missing)) {
                    errors.push({
                        type: 'resource',
                        severity: 'critical',
                        message: `Critical resource missing: ${missing.name}`,
                        timestamp: Date.now(),
                        resolved: false
                    });
                }
            }
            // Create reservations for available resources
            for (const available of availability.available) {
                const reservation = await this.createReservation(goal, available, context);
                if (reservation) {
                    reservations.push(reservation);
                }
            }
            // Handle scarce resources
            for (const scarce of availability.scarce) {
                const partialReservation = await this.createPartialReservation(goal, scarce, context);
                if (partialReservation) {
                    reservations.push(partialReservation);
                }
            }
            // Update goal with allocated resources
            goal.allocatedResources = reservations.map(r => ({
                requirement: this.requirementFromReservation(r),
                allocated: r.quantity,
                efficiency: this.calculateAllocationEfficiency(r, context),
                reservationExpiry: r.expiresAt
            }));
            return {
                success: errors.length === 0,
                reservations,
                errors
            };
        }
        catch (error) {
            errors.push({
                type: 'resource',
                severity: 'high',
                message: `Resource reservation failed: ${error.message}`,
                timestamp: Date.now(),
                resolved: false
            });
            // Clean up any partial reservations
            await this.releaseReservations(reservations.map(r => r.id));
            return {
                success: false,
                reservations: [],
                errors
            };
        }
    }
    /**
     * Allocate resources based on strategy
     */
    async allocateResources(goals, context) {
        const allocations = new Map();
        const conflicts = [];
        switch (this.allocationStrategy) {
            case AllocationStrategy.PRIORITY_BASED:
                return this.allocateByPriority(goals, context);
            case AllocationStrategy.EFFICIENCY_MAXIMIZATION:
                return this.allocateForEfficiency(goals, context);
            case AllocationStrategy.FAIR_DISTRIBUTION:
                return this.allocateFairly(goals, context);
            case AllocationStrategy.OPPORTUNISTIC:
                return this.allocateOpportunistically(goals, context);
            case AllocationStrategy.CONSERVATIVE:
                return this.allocateConservatively(goals, context);
            default:
                return this.allocateByPriority(goals, context);
        }
    }
    /**
     * Optimize resource requirements for a goal
     */
    async optimizeResources(goal, context) {
        return this.resourceOptimizer.optimize(goal.requirements, context);
    }
    /**
     * Plan resource acquisition for missing resources
     */
    async planResourceAcquisition(goal, missingResources, context) {
        const plans = [];
        let totalTime = 0;
        let totalCost = 0;
        for (const resource of missingResources) {
            const plan = await this.acquisitionPlanner.createPlan(resource, context);
            const priority = this.calculateAcquisitionPriority(resource, goal);
            plans.push({
                resource,
                plan,
                priority,
                estimatedTime: plan.estimatedTime
            });
            totalTime += plan.estimatedTime;
            totalCost += plan.estimatedCost;
        }
        return {
            acquisitionPlans: plans,
            totalEstimatedTime: totalTime,
            totalEstimatedCost: totalCost
        };
    }
    /**
     * Monitor resource usage and availability
     */
    async monitorResources(context) {
        const scarcityAlerts = [];
        const expiringReservations = [];
        const usageEfficiency = {};
        const recommendations = [];
        // Check for resource scarcity
        for (const resource of context.availableResources) {
            const scarcity = await this.assessScarcity(resource, context);
            if (scarcity.scarcityLevel > 0.7) {
                scarcityAlerts.push(scarcity);
                recommendations.push(`Acquire more ${resource.name} - scarcity level: ${scarcity.scarcityLevel.toFixed(2)}`);
            }
        }
        // Check for expiring reservations
        const now = Date.now();
        for (const reservation of this.reservations.values()) {
            if (reservation.expiresAt && reservation.expiresAt - now < (60 * 60 * 1000)) { // 1 hour
                expiringReservations.push(reservation);
                recommendations.push(`Reservation for ${reservation.resourceName} expires soon`);
            }
        }
        // Calculate usage efficiency
        for (const [resourceName, amount] of this.calculateResourceUsage(context)) {
            usageEfficiency[resourceName] = amount;
        }
        return {
            scarcityAlerts,
            expiringReservations,
            usageEfficiency,
            recommendations
        };
    }
    /**
     * Release resources when goal is completed or cancelled
     */
    async releaseResources(goalId) {
        const released = [];
        const errors = [];
        for (const reservation of this.reservations.values()) {
            if (reservation.goalId === goalId) {
                try {
                    await this.releaseReservation(reservation.id);
                    released.push(reservation);
                }
                catch (error) {
                    errors.push(`Failed to release reservation ${reservation.id}: ${error.message}`);
                }
            }
        }
        return { released, errors };
    }
    /**
     * Helper methods
     */
    findAvailableResource(requirement, availableResources) {
        return availableResources.find(resource => resource.name === requirement.name &&
            resource.type === requirement.type &&
            resource.quantity >= requirement.quantity &&
            (!requirement.quality || resource.quality >= requirement.quality)) || null;
    }
    async findAlternatives(requirement, context) {
        const alternatives = [];
        // Define alternative resources based on type
        const alternativeMap = new Map([
            ['wood', ['stone', 'dirt', 'cobblestone']],
            ['stone', ['wood', 'cobblestone', 'iron']],
            ['iron', ['stone', 'wood', 'gold']],
            ['diamond', ['iron', 'stone', 'gold']],
            ['food', ['bread', 'apple', 'cooked_meat']],
            ['tool', ['bare_hands', 'simpler_tool']]
        ]);
        const possibleAlternatives = alternativeMap.get(requirement.name.toLowerCase()) || [];
        for (const altName of possibleAlternatives) {
            const available = context.availableResources.find(r => r.name.toLowerCase() === altName && r.type === requirement.type);
            if (available && available.quantity >= requirement.quantity) {
                alternatives.push({
                    ...requirement,
                    name: altName,
                    quantity: Math.max(requirement.quantity, Math.floor(requirement.quantity * 0.8)) // May need more of alternative
                });
            }
        }
        return alternatives;
    }
    isCriticalResource(requirement) {
        // Critical resources are those that prevent goal completion
        const criticalTypes = [ResourceType.TOOL, ResourceType.SKILL];
        return criticalTypes.includes(requirement.type) || requirement.quantity > 10;
    }
    async createReservation(goal, resource, context) {
        const reservation = {
            id: this.generateReservationId(),
            goalId: goal.id,
            resourceType: resource.type,
            resourceName: resource.name,
            quantity: Math.min(resource.quantity, this.getRequiredQuantity(goal, resource)),
            quality: resource.quality,
            priority: this.mapGoalPriorityToResourcePriority(goal.priority),
            status: ReservationStatus.PENDING,
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            conditions: [],
            alternatives: []
        };
        // Check if reservation can be fulfilled
        if (await this.canReserve(reservation, context)) {
            reservation.status = ReservationStatus.RESERVED;
            reservation.allocatedAt = Date.now();
            this.reservations.set(reservation.id, reservation);
            return reservation;
        }
        return null;
    }
    async createPartialReservation(goal, requirement, context) {
        // Find partial availability
        const available = context.availableResources.find(r => r.name === requirement.name && r.type === requirement.type);
        if (!available || available.quantity === 0) {
            return null;
        }
        const reservation = {
            id: this.generateReservationId(),
            goalId: goal.id,
            resourceType: requirement.type,
            resourceName: requirement.name,
            quantity: Math.min(available.quantity, requirement.quantity),
            quality: available.quality,
            priority: this.mapGoalPriorityToResourcePriority(goal.priority),
            status: ReservationStatus.PENDING,
            createdAt: Date.now(),
            expiresAt: Date.now() + (12 * 60 * 60 * 1000), // 12 hours for partial
            conditions: [`Additional ${requirement.quantity - available.quantity} needed`],
            alternatives: []
        };
        if (await this.canReserve(reservation, context)) {
            reservation.status = ReservationStatus.RESERVED;
            reservation.allocatedAt = Date.now();
            this.reservations.set(reservation.id, reservation);
            return reservation;
        }
        return null;
    }
    async canReserve(reservation, context) {
        // Check if resource can be reserved based on current conditions
        const existingReservations = Array.from(this.reservations.values()).filter(r => r.resourceName === reservation.resourceName &&
            r.status === ReservationStatus.RESERVED);
        const totalReserved = existingReservations.reduce((sum, r) => sum + r.quantity, 0);
        const available = context.availableResources.find(r => r.name === reservation.resourceName);
        if (!available)
            return false;
        return (totalReserved + reservation.quantity) <= available.quantity;
    }
    getRequiredQuantity(goal, resource) {
        const requirement = goal.requirements.find(r => r.name === resource.name && r.type === resource.type);
        return requirement?.quantity || 1;
    }
    mapGoalPriorityToResourcePriority(goalPriority) {
        switch (goalPriority) {
            case 0: return ResourcePriority.CRITICAL;
            case 1: return ResourcePriority.HIGH;
            case 2: return ResourcePriority.MEDIUM;
            case 3: return ResourcePriority.LOW;
            case 4: return ResourcePriority.OPTIONAL;
            default: return ResourcePriority.MEDIUM;
        }
    }
    calculateAllocationEfficiency(reservation, context) {
        // Calculate how efficiently the resource is allocated
        const available = context.availableResources.find(r => r.name === reservation.resourceName);
        if (!available)
            return 0;
        return Math.min(1, reservation.quantity / available.quantity);
    }
    requirementFromReservation(reservation) {
        return {
            type: reservation.resourceType,
            name: reservation.resourceName,
            quantity: reservation.quantity,
            quality: reservation.quality,
            consumable: true // Default assumption
        };
    }
    async allocateByPriority(goals, context) {
        const allocations = new Map();
        const conflicts = [];
        // Sort goals by priority
        const sortedGoals = goals.sort((a, b) => a.priority - b.priority);
        // Allocate resources to highest priority goals first
        for (const goal of sortedGoals) {
            const goalAllocations = await this.allocateForGoal(goal, context);
            allocations.set(goal.id, goalAllocations);
        }
        return { allocations, conflicts };
    }
    async allocateForEfficiency(goals, context) {
        const allocations = new Map();
        const conflicts = [];
        // Calculate efficiency scores for each goal-resource combination
        const efficiencyScores = await this.calculateEfficiencyScores(goals, context);
        // Allocate to maximize overall efficiency
        for (const goal of goals) {
            const goalAllocations = await this.allocateForGoal(goal, context);
            allocations.set(goal.id, goalAllocations);
        }
        return { allocations, conflicts };
    }
    async allocateFairly(goals, context) {
        const allocations = new Map();
        const conflicts = [];
        // Distribute resources evenly among goals
        for (const goal of goals) {
            const goalAllocations = await this.allocateForGoal(goal, context);
            allocations.set(goal.id, goalAllocations);
        }
        return { allocations, conflicts };
    }
    async allocateOpportunistically(goals, context) {
        const allocations = new Map();
        const conflicts = [];
        // Prioritize goals that can leverage current opportunities
        const opportunityGoals = this.sortByOpportunity(goals, context);
        for (const goal of opportunityGoals) {
            const goalAllocations = await this.allocateForGoal(goal, context);
            allocations.set(goal.id, goalAllocations);
        }
        return { allocations, conflicts };
    }
    async allocateConservatively(goals, context) {
        const allocations = new Map();
        const conflicts = [];
        // Allocate resources conservatively, keeping reserves
        for (const goal of goals) {
            const conservativeAllocations = await this.allocateForGoalConservatively(goal, context);
            allocations.set(goal.id, conservativeAllocations);
        }
        return { allocations, conflicts };
    }
    async allocateForGoal(goal, context) {
        const allocations = [];
        for (const requirement of goal.requirements) {
            const available = context.availableResources.find(r => r.name === requirement.name && r.type === requirement.type);
            if (available) {
                const allocated = Math.min(requirement.quantity, available.quantity);
                allocations.push({
                    requirement,
                    allocated,
                    efficiency: allocated / requirement.quantity,
                    reservationExpiry: Date.now() + (24 * 60 * 60 * 1000)
                });
            }
        }
        return allocations;
    }
    async allocateForGoalConservatively(goal, context) {
        const allocations = [];
        for (const requirement of goal.requirements) {
            const available = context.availableResources.find(r => r.name === requirement.name && r.type === requirement.type);
            if (available) {
                // Allocate conservatively - only 80% of what's available
                const allocated = Math.min(Math.floor(requirement.quantity * 0.8), Math.floor(available.quantity * 0.8));
                allocations.push({
                    requirement,
                    allocated,
                    efficiency: allocated / requirement.quantity,
                    reservationExpiry: Date.now() + (12 * 60 * 60 * 1000) // Shorter reservation
                });
            }
        }
        return allocations;
    }
    async calculateEfficiencyScores(goals, context) {
        const scores = new Map();
        for (const goal of goals) {
            let efficiency = 0;
            let totalRequirements = 0;
            for (const requirement of goal.requirements) {
                const available = context.availableResources.find(r => r.name === requirement.name && r.type === requirement.type);
                if (available) {
                    efficiency += Math.min(1, available.quantity / requirement.quantity);
                }
                totalRequirements++;
            }
            scores.set(goal.id, totalRequirements > 0 ? efficiency / totalRequirements : 0);
        }
        return scores;
    }
    sortByOpportunity(goals, context) {
        return goals.sort((a, b) => {
            const aOpportunity = this.calculateOpportunityScore(a, context);
            const bOpportunity = this.calculateOpportunityScore(b, context);
            return bOpportunity - aOpportunity;
        });
    }
    calculateOpportunityScore(goal, context) {
        let score = 0;
        // Check for environmental opportunities
        for (const condition of context.environmentalConditions) {
            if (condition.type === 'opportunity') {
                score += condition.severity;
            }
        }
        // Check for resource abundance
        for (const requirement of goal.requirements) {
            const available = context.availableResources.find(r => r.name === requirement.name && r.type === requirement.type);
            if (available && available.quantity > requirement.quantity * 2) {
                score += 0.2;
            }
        }
        return score;
    }
    async assessScarcity(resource, context) {
        const cacheKey = `${resource.type}_${resource.name}`;
        if (this.scarcityCache.has(cacheKey)) {
            const cached = this.scarcityCache.get(cacheKey);
            // Return cached if recent (within 5 minutes)
            if (Date.now() - cached.estimatedAvailability < 5 * 60 * 1000) {
                return cached;
            }
        }
        // Calculate scarcity based on current availability and demand
        const totalDemand = this.calculateTotalDemand(resource, context);
        const scarcityLevel = Math.max(0, Math.min(1, 1 - (resource.quantity / Math.max(1, totalDemand))));
        const scarcity = {
            resourceType: resource.type,
            resourceName: resource.name,
            scarcityLevel,
            estimatedAvailability: resource.quantity,
            replenishmentRate: this.estimateReplenishmentRate(resource),
            alternativeResources: await this.findAlternativeResources(resource, context),
            acquisitionDifficulty: this.estimateAcquisitionDifficulty(resource, context)
        };
        this.scarcityCache.set(cacheKey, scarcity);
        return scarcity;
    }
    calculateTotalDemand(resource, context) {
        let totalDemand = 0;
        // Sum up requirements from all active goals
        const allGoals = [
            ...(context.agentState.cognitive?.goals?.strategicGoals || []),
            ...(context.agentState.cognitive?.goals?.tacticalGoals || []),
            ...(context.agentState.cognitive?.goals?.operationalGoals || [])
        ];
        for (const goal of allGoals) {
            // Convert to our Goal interface format - the interfaces.ts Goal has different structure
            // For now, assume requirements exist or use a default
            const requirements = goal.requirements || [];
            for (const requirement of requirements) {
                if (requirement.name === resource.name && requirement.type === resource.type) {
                    totalDemand += requirement.quantity;
                }
            }
        }
        return totalDemand;
    }
    estimateReplenishmentRate(resource) {
        // Simple heuristic based on resource type
        switch (resource.type) {
            case 'item':
                return resource.name.includes('wood') ? 0.8 : 0.3;
            case 'tool':
                return 0.1; // Tools don't replenish naturally
            case 'energy':
                return 0.9; // Energy replenishes quickly
            default:
                return 0.5;
        }
    }
    async findAlternativeResources(resource, context) {
        // Return potential alternative resource names
        const alternatives = [];
        if (resource.type === 'item') {
            alternatives.push('stone', 'wood', 'dirt');
        }
        return alternatives;
    }
    estimateAcquisitionDifficulty(resource, context) {
        // Estimate how difficult it is to acquire more of this resource
        const scarcity = this.calculateTotalDemand(resource, context);
        return Math.min(1, scarcity / 10);
    }
    calculateAcquisitionPriority(resource, goal) {
        // Higher priority for critical resources and high-priority goals
        const criticality = this.isCriticalResource(resource) ? 1.0 : 0.5;
        const goalPriority = 1.0 - (goal.priority / 4.0); // Invert so lower number = higher priority
        return criticality * goalPriority;
    }
    calculateResourceUsage(context) {
        const usage = new Map();
        // Calculate current resource usage efficiency
        for (const resource of context.availableResources) {
            const totalReserved = Array.from(this.reservations.values())
                .filter(r => r.resourceName === resource.name && r.status === ReservationStatus.ALLOCATED)
                .reduce((sum, r) => sum + r.quantity, 0);
            const efficiency = resource.quantity > 0 ? totalReserved / resource.quantity : 0;
            usage.set(resource.name, efficiency);
        }
        return usage;
    }
    async releaseReservation(reservationId) {
        const reservation = this.reservations.get(reservationId);
        if (reservation) {
            reservation.status = ReservationStatus.RELEASED;
            this.reservations.delete(reservationId);
        }
    }
    async releaseReservations(reservationIds) {
        for (const id of reservationIds) {
            await this.releaseReservation(id);
        }
    }
    generateReservationId() {
        return `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get current resource status
     */
    getResourceStatus() {
        const total = this.reservations.size;
        const active = Array.from(this.reservations.values()).filter(r => r.status === ReservationStatus.RESERVED || r.status === ReservationStatus.ALLOCATED).length;
        const expired = Array.from(this.reservations.values()).filter(r => r.status === ReservationStatus.EXPIRED).length;
        const utilization = {};
        for (const reservation of this.reservations.values()) {
            utilization[reservation.resourceName] = (utilization[reservation.resourceName] || 0) + reservation.quantity;
        }
        return {
            totalReservations: total,
            activeReservations: active,
            expiredReservations: expired,
            resourceUtilization: utilization
        };
    }
}
/**
 * Resource optimizer for finding efficient resource combinations
 */
class ResourceOptimizer {
    async optimize(requirements, context) {
        const optimized = [...requirements];
        const substitutions = [];
        // Find potential substitutions
        for (const requirement of requirements) {
            const substitutes = await this.findSubstitutes(requirement, context);
            for (const substitute of substitutes) {
                const efficiency = this.calculateSubstitutionEfficiency(requirement, substitute, context);
                if (efficiency > 0.8) {
                    substitutions.push({
                        original: requirement,
                        substitute,
                        efficiency
                    });
                    // Replace in optimized requirements
                    const index = optimized.indexOf(requirement);
                    if (index !== -1) {
                        optimized[index] = substitute;
                    }
                }
            }
        }
        // Calculate savings
        const savings = this.calculateSavings(requirements, optimized);
        return {
            originalRequirements: requirements,
            optimizedRequirements: optimized,
            savings,
            substitutions,
            confidence: this.calculateOptimizationConfidence(substitutions)
        };
    }
    async findSubstitutes(requirement, context) {
        // Find potential substitutes based on resource type and properties
        const substitutes = [];
        const substitutionMap = new Map([
            ['diamond_pickaxe', ['iron_pickaxe', 'stone_pickaxe']],
            ['iron_sword', ['stone_sword', 'wooden_sword']],
            ['bread', ['apple', 'cooked_meat']],
            ['stone', ['cobblestone', 'wood']]
        ]);
        const possibleSubstitutes = substitutionMap.get(requirement.name.toLowerCase()) || [];
        for (const substitute of possibleSubstitutes) {
            const available = context.availableResources.find(r => r.name === substitute);
            if (available) {
                substitutes.push({
                    ...requirement,
                    name: substitute,
                    quantity: Math.ceil(requirement.quantity * 1.2) // May need more of lower-tier substitute
                });
            }
        }
        return substitutes;
    }
    calculateSubstitutionEfficiency(original, substitute, context) {
        // Calculate efficiency of substitution (0-1)
        const originalAvailable = context.availableResources.find(r => r.name === original.name);
        const substituteAvailable = context.availableResources.find(r => r.name === substitute.name);
        if (!originalAvailable && substituteAvailable) {
            return 1.0; // Perfect substitution if original unavailable
        }
        if (!substituteAvailable) {
            return 0.0; // No substitution possible
        }
        // Consider quality difference and availability
        const qualityRatio = (substituteAvailable.quality || 0) / (originalAvailable?.quality || 1);
        const availabilityRatio = originalAvailable ?
            substituteAvailable.quantity / originalAvailable.quantity : 1;
        return Math.min(1, qualityRatio * availabilityRatio);
    }
    calculateSavings(original, optimized) {
        let quantitySavings = 0;
        let costSavings = 0;
        let timeSavings = 0;
        for (let i = 0; i < original.length; i++) {
            const orig = original[i];
            const opt = optimized[i];
            if (orig.name !== opt.name) {
                // Calculate savings from substitution
                quantitySavings += orig.quantity - opt.quantity;
                costSavings += this.estimateResourceCost(orig) - this.estimateResourceCost(opt);
                timeSavings += this.estimateAcquisitionTime(orig) - this.estimateAcquisitionTime(opt);
            }
        }
        return {
            quantity: quantitySavings,
            cost: costSavings,
            time: timeSavings
        };
    }
    estimateResourceCost(requirement) {
        // Simple cost estimation based on resource type and quantity
        const baseCosts = {
            'diamond': 100,
            'iron': 50,
            'stone': 10,
            'wood': 5,
            'food': 20
        };
        const baseCost = baseCosts[requirement.name.toLowerCase()] || 10;
        return baseCost * requirement.quantity;
    }
    estimateAcquisitionTime(requirement) {
        // Estimate time to acquire resource (in minutes)
        const baseTimes = {
            'diamond': 30,
            'iron': 15,
            'stone': 5,
            'wood': 2,
            'food': 10
        };
        const baseTime = baseTimes[requirement.name.toLowerCase()] || 10;
        return baseTime * Math.ceil(requirement.quantity / 10);
    }
    calculateOptimizationConfidence(substitutions) {
        if (substitutions.length === 0)
            return 1.0;
        const avgEfficiency = substitutions.reduce((sum, sub) => sum + sub.efficiency, 0) / substitutions.length;
        return avgEfficiency;
    }
}
/**
 * Resource acquisition planner
 */
class ResourceAcquisitionPlanner {
    async createPlan(resource, context) {
        const strategies = await this.identifyAcquisitionStrategies(resource, context);
        const bestStrategy = this.selectBestStrategy(strategies, context);
        return {
            resource,
            strategy: bestStrategy.name,
            steps: bestStrategy.steps,
            estimatedTime: bestStrategy.estimatedTime,
            estimatedCost: bestStrategy.estimatedCost,
            requirements: bestStrategy.requirements,
            risks: bestStrategy.risks,
            alternatives: strategies.filter(s => s.name !== bestStrategy.name)
        };
    }
    async identifyAcquisitionStrategies(resource, context) {
        const strategies = [];
        // Mining strategy for resources
        if (resource.type === 'item' && this.isMineable(resource.name)) {
            strategies.push(this.createMiningStrategy(resource, context));
        }
        // Crafting strategy
        if (this.isCraftable(resource.name)) {
            strategies.push(this.createCraftingStrategy(resource, context));
        }
        // Trading strategy
        strategies.push(this.createTradingStrategy(resource, context));
        // Gathering strategy
        if (this.isGatherable(resource.name)) {
            strategies.push(this.createGatheringStrategy(resource, context));
        }
        return strategies;
    }
    selectBestStrategy(strategies, context) {
        // Select strategy based on efficiency, cost, and time
        return strategies.sort((a, b) => {
            const scoreA = (a.estimatedTime * 0.4) + (a.estimatedCost * 0.3) + (a.risks.length * 0.3);
            const scoreB = (b.estimatedTime * 0.4) + (b.estimatedCost * 0.3) + (b.risks.length * 0.3);
            return scoreA - scoreB;
        })[0] || strategies[0];
    }
    isMineable(resourceName) {
        const mineable = ['stone', 'iron', 'coal', 'diamond', 'gold', 'copper'];
        return mineable.includes(resourceName.toLowerCase());
    }
    isCraftable(resourceName) {
        const craftable = ['pickaxe', 'sword', 'armor', 'tool', 'bread'];
        return craftable.some(c => resourceName.toLowerCase().includes(c));
    }
    isGatherable(resourceName) {
        const gatherable = ['wood', 'food', 'apple', 'wheat'];
        return gatherable.includes(resourceName.toLowerCase());
    }
    createMiningStrategy(resource, context) {
        return {
            name: 'mining',
            steps: [
                'Find suitable mining location',
                'Gather mining tools',
                'Mine required resources',
                'Return to base'
            ],
            estimatedTime: Math.ceil(resource.quantity * 2), // 2 minutes per unit
            estimatedCost: resource.quantity * 5, // Tool wear cost
            requirements: [
                { type: 'tool', name: 'pickaxe', quantity: 1, quality: 0.5, consumable: false }
            ],
            risks: ['Cave collapse', 'Mob encounters', 'Getting lost']
        };
    }
    createCraftingStrategy(resource, context) {
        return {
            name: 'crafting',
            steps: [
                'Gather raw materials',
                'Access crafting table',
                'Craft required items',
                'Quality check'
            ],
            estimatedTime: Math.ceil(resource.quantity * 1), // 1 minute per unit
            estimatedCost: resource.quantity * 3, // Material cost
            requirements: [
                { type: 'item', name: 'raw_materials', quantity: resource.quantity * 2, quality: 0.5, consumable: true }
            ],
            risks: ['Insufficient materials', 'Crafting failure', 'Quality issues']
        };
    }
    createTradingStrategy(resource, context) {
        return {
            name: 'trading',
            steps: [
                'Find trading partners',
                'Prepare trade goods',
                'Negotiate trade',
                'Complete exchange'
            ],
            estimatedTime: Math.ceil(resource.quantity * 0.5), // 30 seconds per unit
            estimatedCost: resource.quantity * 10, // Trade cost
            requirements: [
                { type: 'item', name: 'trade_goods', quantity: resource.quantity, quality: 0.5, consumable: true }
            ],
            risks: ['No trading partners', 'Unfavorable rates', 'Scams']
        };
    }
    createGatheringStrategy(resource, context) {
        return {
            name: 'gathering',
            steps: [
                'Locate resource sources',
                'Travel to location',
                'Gather resources',
                'Return to storage'
            ],
            estimatedTime: Math.ceil(resource.quantity * 0.75), // 45 seconds per unit
            estimatedCost: resource.quantity * 2, // Travel cost
            requirements: [
                { type: 'tool', name: 'gathering_tools', quantity: 1, quality: 0.3, consumable: false }
            ],
            risks: ['Resource depletion', 'Environmental hazards', 'Competition']
        };
    }
}

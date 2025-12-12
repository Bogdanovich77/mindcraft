/**
 * Resource Assessment System for Planning Engine
 *
 * Provides comprehensive resource inventory tracking, requirement analysis,
 * and allocation optimization for the Mindcraft LangGraph planning system.
 */
import { ResourceAvailability } from '../langgraph/interfaces.js';
/**
 * Resource Assessment System class
 */
export class ResourceAssessmentSystem {
    config;
    lastAssessmentTime = 0;
    assessmentCache = new Map();
    cacheTimeout = 30000; // 30 seconds
    constructor(config) {
        this.config = {
            assessmentTimeout: 5000,
            enableCaching: true,
            cacheTimeout: 30000,
            maxCacheSize: 100,
            enableOptimization: true,
            optimizationThreshold: 0.1,
            enableConflictDetection: true,
            enableAllocationTracking: true,
            ...config
        };
    }
    /**
     * Assess current resource inventory and availability
     */
    async assessResources(agentState) {
        const startTime = Date.now();
        const cacheKey = this.generateCacheKey(agentState);
        // Check cache first
        if (this.config.enableCaching && this.assessmentCache.has(cacheKey)) {
            const cached = this.assessmentCache.get(cacheKey);
            if (Date.now() - cached.assessmentTime < this.config.cacheTimeout) {
                return cached;
            }
        }
        try {
            // Build resource inventory
            const inventory = await this.buildResourceInventory(agentState);
            // Analyze availability
            const availability = await this.analyzeAvailability(inventory);
            // Identify shortages and excess
            const shortages = await this.identifyShortages(inventory);
            const excess = await this.identifyExcess(inventory);
            // Generate recommendations
            const recommendations = await this.generateRecommendations(inventory, shortages, excess);
            // Calculate total value and accessibility
            const totalValue = this.calculateTotalValue(inventory);
            const accessibility = this.calculateAccessibility(inventory);
            const result = {
                inventory,
                availability,
                shortages,
                excess,
                totalValue,
                accessibility,
                recommendations,
                assessmentTime: Date.now() - startTime,
                overallAvailability: this.calculateOverallAvailability(availability),
                conflicts: []
            };
            // Cache result
            if (this.config.enableCaching) {
                this.assessmentCache.set(cacheKey, result);
                this.cleanupCache();
            }
            this.lastAssessmentTime = Date.now();
            return result;
        }
        catch (error) {
            console.error('[RESOURCE_ASSESSMENT] Error during assessment:', error);
            throw error;
        }
    }
    /**
     * Assess resource availability for specific requirements
     */
    async assessResourceAvailability(requirements, agentState) {
        const startTime = Date.now();
        try {
            // Get current inventory
            const inventory = await this.buildResourceInventory(agentState);
            // Check each requirement
            const availability = {};
            const shortages = [];
            const excess = [];
            for (const requirement of requirements) {
                const available = this.checkResourceAvailability(requirement, inventory);
                availability[requirement.type] = available;
                if (available === ResourceAvailability.UNAVAILABLE ||
                    available === ResourceAvailability.PARTIAL) {
                    shortages.push(this.createShortage(requirement, inventory));
                }
            }
            // Generate recommendations
            const recommendations = await this.generateRequirementRecommendations(requirements, inventory);
            const result = {
                inventory,
                availability,
                shortages,
                excess,
                totalValue: this.calculateTotalValue(inventory),
                accessibility: this.calculateAccessibility(inventory),
                recommendations,
                assessmentTime: Date.now() - startTime,
                overallAvailability: this.calculateOverallAvailability(availability),
                conflicts: []
            };
            return result;
        }
        catch (error) {
            console.error('[RESOURCE_ASSESSMENT] Error checking availability:', error);
            throw error;
        }
    }
    /**
     * Optimize resource allocation for better efficiency
     */
    async optimizeResourceAllocation(allocation, agentState) {
        const startTime = Date.now();
        if (!this.config.enableOptimization) {
            return {
                originalAllocation: allocation,
                optimizedAllocation: allocation,
                improvements: [],
                totalSavings: 0,
                efficiencyGain: 0,
                utilizationImprovement: 0,
                optimizationTime: Date.now() - startTime,
                conflictsResolved: 0
            };
        }
        try {
            // Analyze current allocation
            const analysis = await this.analyzeAllocation(allocation, agentState);
            // Generate optimizations
            const improvements = await this.generateOptimizations(allocation, analysis);
            // Create optimized allocation
            const optimizedAllocation = await this.applyOptimizations(allocation, improvements);
            // Calculate metrics
            const totalSavings = this.calculateSavings(allocation, optimizedAllocation);
            const efficiencyGain = this.calculateEfficiencyGain(allocation, optimizedAllocation);
            const utilizationImprovement = this.calculateUtilizationImprovement(allocation, optimizedAllocation);
            const conflictsResolved = improvements.filter(i => i.type === 'reallocation').length;
            const result = {
                originalAllocation: allocation,
                optimizedAllocation,
                improvements,
                totalSavings,
                efficiencyGain,
                utilizationImprovement,
                optimizationTime: Date.now() - startTime,
                conflictsResolved
            };
            return result;
        }
        catch (error) {
            console.error('[RESOURCE_ASSESSMENT] Error optimizing allocation:', error);
            throw error;
        }
    }
    /**
     * Build comprehensive resource inventory from agent state
     */
    async buildResourceInventory(agentState) {
        const inventory = {
            items: {},
            tools: {},
            locations: {},
            skills: {},
            time: Date.now(),
            totalValue: 0,
            accessibility: 0
        };
        // Process inventory items
        for (const item of agentState.context.inventory) {
            inventory.items[item.type] = {
                type: item.type,
                quantity: item.count,
                quality: this.estimateItemQuality(item),
                accessibility: this.calculateItemAccessibility(item),
                estimatedValue: this.estimateItemValue(item),
                location: agentState.context.position,
                durability: this.estimateItemDurability(item),
                metadata: item.metadata
            };
        }
        // Process equipment as tools
        const equipment = agentState.context.equipment;
        if (equipment.weapon) {
            inventory.tools[equipment.weapon.type] = {
                type: equipment.weapon.type,
                durability: this.estimateToolDurability(equipment.weapon),
                efficiency: this.estimateToolEfficiency(equipment.weapon),
                skillRequirements: this.getToolSkillRequirements(equipment.weapon.type),
                estimatedTime: this.estimateToolUsageTime(equipment.weapon),
                metadata: equipment.weapon.metadata
            };
        }
        // Process skills
        for (const [skillName, skill] of Object.entries(agentState.cognitive.skills.skills)) {
            inventory.skills[skillName] = skill;
        }
        // Calculate totals
        inventory.totalValue = this.calculateTotalValue(inventory);
        inventory.accessibility = this.calculateAccessibility(inventory);
        return inventory;
    }
    /**
     * Analyze resource availability
     */
    async analyzeAvailability(inventory) {
        const availability = {};
        // Analyze items
        for (const [itemType, item] of Object.entries(inventory.items)) {
            availability[itemType] = item.quantity > 0 ?
                ResourceAvailability.AVAILABLE :
                ResourceAvailability.UNAVAILABLE;
        }
        // Analyze tools
        for (const [toolType, tool] of Object.entries(inventory.tools)) {
            availability[toolType] = tool.durability > 0 ?
                ResourceAvailability.AVAILABLE :
                ResourceAvailability.UNAVAILABLE;
        }
        // Analyze skills
        for (const [skillName, skill] of Object.entries(inventory.skills)) {
            availability[skillName] = skill.proficiency.overall > 0.1 ?
                ResourceAvailability.AVAILABLE :
                ResourceAvailability.UNAVAILABLE;
        }
        return availability;
    }
    /**
     * Identify resource shortages
     */
    async identifyShortages(inventory) {
        const shortages = [];
        // Critical resources that should always be available
        const criticalResources = ['wood', 'stone', 'food', 'torch'];
        for (const resourceType of criticalResources) {
            const item = inventory.items[resourceType];
            if (!item || item.quantity < 10) {
                shortages.push({
                    type: resourceType,
                    required: 10,
                    available: item?.quantity || 0,
                    amount: Math.max(0, 10 - (item?.quantity || 0)),
                    priority: resourceType === 'food' ? 0 : 1
                });
            }
        }
        return shortages;
    }
    /**
     * Identify resource excess
     */
    async identifyExcess(inventory) {
        const excess = [];
        // Resources that might be in excess
        const excessThresholds = {
            'cobblestone': 64,
            'dirt': 64,
            'gravel': 32,
            'sand': 32
        };
        for (const [resourceType, threshold] of Object.entries(excessThresholds)) {
            const item = inventory.items[resourceType];
            if (item && item.quantity > threshold) {
                excess.push({
                    type: resourceType,
                    available: item.quantity,
                    required: threshold,
                    amount: item.quantity - threshold,
                    value: this.estimateItemValue({ type: resourceType, count: item.quantity, slot: 0 })
                });
            }
        }
        return excess;
    }
    /**
     * Generate recommendations based on assessment
     */
    async generateRecommendations(inventory, shortages, excess) {
        const recommendations = [];
        // Resource shortage recommendations
        if (shortages.length > 0) {
            recommendations.push('Prioritize gathering critical resources: ' +
                shortages.map(s => s.type).join(', '));
            if (shortages.some(s => s.type === 'food')) {
                recommendations.push('Hunt or gather food immediately to maintain energy levels');
            }
            if (shortages.some(s => s.type === 'wood')) {
                recommendations.push('Collect wood for tools and building materials');
            }
        }
        // Resource excess recommendations
        if (excess.length > 0) {
            recommendations.push('Consider trading or using excess resources: ' +
                excess.map(e => e.type).join(', '));
        }
        // Tool recommendations
        const damagedTools = Object.entries(inventory.tools)
            .filter(([_, tool]) => tool.durability < 0.3);
        if (damagedTools.length > 0) {
            recommendations.push('Repair damaged tools: ' + damagedTools.map(([name]) => name).join(', '));
        }
        // Skill recommendations
        const lowSkills = Object.entries(inventory.skills)
            .filter(([_, skill]) => skill.proficiency.overall < 0.3);
        if (lowSkills.length > 0) {
            recommendations.push('Practice skills to improve proficiency: ' +
                lowSkills.map(([name]) => name).join(', '));
        }
        return recommendations;
    }
    /**
     * Check availability of a specific resource
     */
    checkResourceAvailability(requirement, inventory) {
        const item = inventory.items[requirement.type];
        if (!item) {
            return ResourceAvailability.UNAVAILABLE;
        }
        if (item.quantity >= requirement.amount) {
            return ResourceAvailability.AVAILABLE;
        }
        if (item.quantity > 0) {
            return ResourceAvailability.PARTIAL;
        }
        return ResourceAvailability.UNAVAILABLE;
    }
    /**
     * Create shortage object
     */
    createShortage(requirement, inventory) {
        const item = inventory.items[requirement.type];
        const available = item?.quantity || 0;
        return {
            type: requirement.type,
            required: requirement.amount,
            available,
            amount: Math.max(0, requirement.amount - available),
            priority: this.calculateResourcePriority(requirement.type)
        };
    }
    /**
     * Generate recommendations for specific requirements
     */
    async generateRequirementRecommendations(requirements, inventory) {
        const recommendations = [];
        for (const requirement of requirements) {
            const available = this.checkResourceAvailability(requirement, inventory);
            if (available === ResourceAvailability.UNAVAILABLE) {
                recommendations.push(`Acquire ${requirement.amount} ${requirement.type} - currently unavailable`);
            }
            else if (available === ResourceAvailability.PARTIAL) {
                const item = inventory.items[requirement.type];
                const shortage = requirement.amount - (item?.quantity || 0);
                recommendations.push(`Acquire additional ${shortage} ${requirement.type} - have ${item?.quantity || 0}`);
            }
        }
        return recommendations;
    }
    /**
     * Analyze current allocation
     */
    async analyzeAllocation(allocation, agentState) {
        const analysis = {
            utilization: 0,
            efficiency: 0,
            conflicts: allocation.conflicts,
            bottlenecks: [],
            waste: 0,
            opportunities: []
        };
        // Calculate utilization
        const totalAllocated = Object.values(allocation.resources).reduce((sum, r) => sum + r.quantity, 0);
        const totalAvailable = Object.values(agentState.context.inventory).reduce((sum, i) => sum + i.count, 0);
        analysis.utilization = totalAvailable > 0 ? totalAllocated / totalAvailable : 0;
        // Calculate efficiency
        analysis.efficiency = allocation.efficiency;
        // Identify bottlenecks
        for (const conflict of allocation.conflicts) {
            if (conflict.severity === 'high' || conflict.severity === 'critical') {
                analysis.bottlenecks.push(conflict.type + ' conflict');
            }
        }
        // Calculate waste
        analysis.waste = this.calculateAllocationWaste(allocation);
        // Identify opportunities
        analysis.opportunities = this.identifyAllocationOpportunities(allocation, agentState);
        return analysis;
    }
    /**
     * Generate optimization strategies
     */
    async generateOptimizations(allocation, analysis) {
        const optimizations = [];
        // Conflict resolution optimizations
        for (const conflict of analysis.conflicts) {
            optimizations.push({
                type: 'reallocation',
                description: `Resolve ${conflict.type} conflict between ${conflict.competingPlans.join(' and ')}`,
                impact: this.calculateConflictImpact(conflict),
                cost: this.calculateResolutionCost(conflict),
                risk: this.calculateResolutionRisk(conflict)
            });
        }
        // Utilization optimizations
        if (analysis.utilization < 0.7) {
            optimizations.push({
                type: 'prioritization',
                description: 'Improve resource utilization through better prioritization',
                impact: 0.3 - analysis.utilization,
                cost: 0.1,
                risk: 0.05
            });
        }
        // Waste reduction optimizations
        if (analysis.waste > 0.1) {
            optimizations.push({
                type: 'substitution',
                description: 'Reduce waste through resource substitution',
                impact: analysis.waste,
                cost: 0.05,
                risk: 0.1
            });
        }
        return optimizations;
    }
    /**
     * Apply optimizations to create new allocation
     */
    async applyOptimizations(allocation, optimizations) {
        const optimizedAllocation = {
            ...allocation,
            resources: { ...allocation.resources },
            conflicts: [...allocation.conflicts],
            efficiency: allocation.efficiency,
            utilization: allocation.utilization
        };
        // Apply each optimization
        for (const optimization of optimizations) {
            switch (optimization.type) {
                case 'reallocation':
                    optimizedAllocation.conflicts = optimizedAllocation.conflicts.filter(c => !this.isConflictResolved(c, optimization));
                    break;
                case 'prioritization':
                    optimizedAllocation.utilization = Math.min(1.0, optimizedAllocation.utilization + optimization.impact);
                    break;
                case 'substitution':
                    optimizedAllocation.efficiency = Math.min(1.0, optimizedAllocation.efficiency + optimization.impact);
                    break;
            }
        }
        return optimizedAllocation;
    }
    /**
     * Calculate savings between allocations
     */
    calculateSavings(original, optimized) {
        return original.totalCost - optimized.totalCost;
    }
    /**
     * Calculate efficiency gain
     */
    calculateEfficiencyGain(original, optimized) {
        return optimized.efficiency - original.efficiency;
    }
    /**
     * Calculate utilization improvement
     */
    calculateUtilizationImprovement(original, optimized) {
        return optimized.utilization - original.utilization;
    }
    /**
     * Helper methods for resource analysis
     */
    calculateTotalValue(inventory) {
        return Object.values(inventory.items).reduce((sum, item) => sum + item.estimatedValue, 0);
    }
    calculateAccessibility(inventory) {
        if (Object.keys(inventory.items).length === 0)
            return 0;
        const totalAccessibility = Object.values(inventory.items).reduce((sum, item) => sum + item.accessibility, 0);
        return totalAccessibility / Object.keys(inventory.items).length;
    }
    estimateItemQuality(item) {
        // Simple quality estimation based on item type and metadata
        return item.metadata?.quality || 0.8;
    }
    calculateItemAccessibility(item) {
        // Accessibility based on slot position and quantity
        return item.count > 0 ? 1.0 : 0.0;
    }
    estimateItemValue(item) {
        // Simple value estimation
        const baseValues = {
            'wood': 1,
            'stone': 2,
            'iron': 10,
            'gold': 15,
            'diamond': 50,
            'food': 3
        };
        return (baseValues[item.type] || 1) * item.count;
    }
    estimateItemDurability(item) {
        return item.metadata?.durability || 1.0;
    }
    estimateToolDurability(tool) {
        return tool.metadata?.durability || 0.8;
    }
    estimateToolEfficiency(tool) {
        return tool.metadata?.efficiency || 0.7;
    }
    getToolSkillRequirements(toolType) {
        const requirements = {
            'pickaxe': ['mining'],
            'axe': ['woodcutting'],
            'sword': ['combat'],
            'shovel': ['digging']
        };
        return requirements[toolType] || [];
    }
    estimateToolUsageTime(tool) {
        return tool.metadata?.usageTime || 1000;
    }
    calculateResourcePriority(resourceType) {
        const priorities = {
            'food': 0,
            'wood': 1,
            'stone': 1,
            'iron': 2,
            'diamond': 3
        };
        return priorities[resourceType] || 2;
    }
    calculateAllocationWaste(allocation) {
        // Simple waste calculation based on over-allocation
        return allocation.conflicts.length * 0.1;
    }
    identifyAllocationOpportunities(allocation, agentState) {
        const opportunities = [];
        if (allocation.conflicts.length > 0) {
            opportunities.push('Resolve resource conflicts');
        }
        if (allocation.efficiency < 0.8) {
            opportunities.push('Improve allocation efficiency');
        }
        return opportunities;
    }
    calculateConflictImpact(conflict) {
        const severityMultipliers = {
            'low': 0.1,
            'medium': 0.3,
            'high': 0.6,
            'critical': 1.0
        };
        return severityMultipliers[conflict.severity] || 0.5;
    }
    calculateResolutionCost(conflict) {
        return conflict.competingPlans.length * 0.1;
    }
    calculateResolutionRisk(conflict) {
        return this.calculateConflictImpact(conflict) * 0.5;
    }
    isConflictResolved(conflict, optimization) {
        return optimization.description.includes(conflict.type);
    }
    calculateOverallAvailability(availability) {
        if (Object.keys(availability).length === 0)
            return 0;
        const availableCount = Object.values(availability).filter(a => a === ResourceAvailability.AVAILABLE).length;
        return availableCount / Object.keys(availability).length;
    }
    generateCacheKey(agentState) {
        return `${agentState.metadata.agentId}_${agentState.context.inventory.length}_${Date.now()}`;
    }
    cleanupCache() {
        if (this.assessmentCache.size > this.config.maxCacheSize) {
            const entries = Array.from(this.assessmentCache.entries());
            entries.sort((a, b) => a[1].assessmentTime - b[1].assessmentTime);
            // Remove oldest entries
            const toRemove = entries.slice(0, this.assessmentCache.size - this.config.maxCacheSize);
            toRemove.forEach(([key]) => this.assessmentCache.delete(key));
        }
    }
}
//# sourceMappingURL=resource_assessment.js.map
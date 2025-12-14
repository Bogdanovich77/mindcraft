/**
 * Legacy Adapter - Main compatibility layer for existing NPC system
 * Wraps the existing NPCData, ItemGoal, and BuildGoal systems to work with LangGraph
 */
// @ts-ignore - JS module without type definitions
import { NPCData } from '../npc/data.js';
// @ts-ignore - JS module without type definitions
import { NPCContoller } from '../npc/controller.js';
// @ts-ignore - JS module without type definitions
import { MemoryBank } from '../memory_bank.js';
/**
 * Legacy NPC Data Adapter
 * Converts between flat NPCData structure and hierarchical AgentState
 */
export class LegacyNPCDataAdapter {
    npcData; // Changed from NPCData to any to avoid type issues
    originalProfile;
    constructor(profileData) {
        this.originalProfile = profileData;
        this.npcData = NPCData.fromObject(profileData.npc || {});
    }
    /**
     * Extract purpose state from legacy profile
     */
    extractPurposeState() {
        return {
            identity: {
                name: this.originalProfile.username || 'Unknown',
                role: this.originalProfile.role || 'worker',
                background: this.originalProfile.background || 'Minecraft inhabitant',
                corePurpose: this.inferCorePurpose()
            },
            personality: this.extractPersonality(),
            motivations: [{
                    id: 'primary_motivation',
                    type: 'resource_acquisition',
                    strength: 0.8,
                    satisfaction: 0.5,
                    priority: 1
                }],
            values: [{
                    id: 'efficiency',
                    name: 'efficiency',
                    importance: 0.8,
                    priority: 1
                }],
            ethics: {
                harmAvoidance: 0.7,
                fairness: 0.5,
                loyalty: 0.6,
                authority: 0.4,
                purity: 0.3
            }
        };
    }
    /**
     * Extract goal state from flat NPC goals
     */
    extractGoalState() {
        const goals = [];
        // Convert flat goals to hierarchical goals
        if (this.npcData.goals) {
            this.npcData.goals.forEach((goal, index) => {
                const hierarchicalGoal = {
                    id: `legacy_goal_${index}`,
                    type: 'operational', // Legacy goals are operational by nature
                    priority: 'medium', // Changed from number to string enum
                    status: 'pending',
                    description: `Obtain ${goal.quantity}x ${goal.name}`,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    dependencies: [],
                    resources: {
                        required: [{ type: goal.name, amount: goal.quantity }],
                        allocated: [],
                        items: [{ type: goal.name, amount: goal.quantity }],
                        tools: this.inferRequiredTools(goal.name).map(tool => ({ type: tool, amount: 1 }))
                    },
                    progress: {
                        current: 0,
                        target: 100,
                        percentage: 0
                    }
                };
                goals.push(hierarchicalGoal);
            });
        }
        // Add current goal if exists
        if (this.npcData.curr_goal) {
            const currentGoal = {
                id: 'legacy_current_goal',
                type: 'operational',
                priority: 'high', // Changed from number to string enum
                status: 'active',
                description: `Current: Obtain ${this.npcData.curr_goal.quantity}x ${this.npcData.curr_goal.name}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                dependencies: [],
                resources: {
                    required: [{ type: this.npcData.curr_goal.name, amount: this.npcData.curr_goal.quantity }],
                    allocated: [],
                    items: [{ type: this.npcData.curr_goal.name, amount: this.npcData.curr_goal.quantity }],
                    tools: this.inferRequiredTools(this.npcData.curr_goal.name).map(tool => ({ type: tool, amount: 1 }))
                },
                progress: {
                    current: 0,
                    target: 100,
                    percentage: 0
                }
            };
            goals.push(currentGoal);
        }
        return {
            strategicGoals: [],
            tacticalGoals: [],
            operationalGoals: goals,
            activeGoals: goals.filter(g => g.status === 'active'),
            goalHistory: []
        };
    }
    /**
     * Extract skill state from legacy system
     */
    extractSkillState() {
        return {
            skills: new Map(),
            learning: {
                history: [],
                metrics: {
                    totalSessions: 0,
                    averageDuration: 0,
                    successRate: 0,
                    recentGains: 0,
                    plateauRisk: 0
                },
                learningRate: 0.1,
                adaptiveFactor: 1.0
            },
            progression: {
                level: 1,
                experience: 0,
                progressToNext: 0,
                totalExperience: 0,
                lastLevelUp: Date.now()
            },
            totalExperience: 0,
            recentGains: [],
            skillSynergies: new Map(),
            adaptiveLearning: {
                personalityInfluence: 0.5,
                socialInfluence: 0.3,
                environmentalInfluence: 0.2,
                recentAdaptations: []
            }
        };
    }
    /**
     * Extract memory state from legacy MemoryBank
     */
    extractMemoryState() {
        return {
            semantic: {
                concepts: new Map(),
                facts: new Map(),
                relationships: new Map()
            },
            episodic: {
                episodes: [],
                conversations: [],
                experiences: []
            },
            procedural: {
                skills: new Map(),
                procedures: new Map(),
                habits: new Map()
            },
            working: {
                currentFocus: '',
                activeTasks: [],
                conversationContext: null,
                buffer: [],
                capacity: 7,
                utilization: 0,
                items: [],
                decayRate: 0.1
            }
        };
    }
    /**
     * Convert legacy NPCData to AgentState cognitive components
     */
    toAgentState() {
        const agentState = {
            cognitive: {
                purpose: this.extractPurposeState(),
                goals: this.extractGoalState(),
                skills: this.extractSkillState(),
                memory: this.extractMemoryState(),
                processing: {
                    currentPhase: 'planning',
                    cognitiveLoad: 0.3,
                    attentionLevel: 0.8,
                    decisionThreshold: 0.7,
                    processingHistory: []
                },
                social: {
                    relationships: new Map(),
                    reputation: {
                        globalScore: 0.5,
                        factionScores: new Map(),
                        traitScores: new Map(),
                        recentEvents: [],
                        reputationScore: 0.5
                    },
                    socialContext: {
                        currentSituation: {},
                        nearbyAgents: [],
                        socialNorms: [],
                        culturalContext: 'default',
                        groupDynamics: {}
                    },
                    theoryOfMind: new Map(),
                    nearbyAgents: []
                }
            },
            metadata: {
                agentId: this.originalProfile.username || 'legacy_agent',
                startTime: Date.now(),
                lastUpdate: Date.now(),
                version: '1.0.0-legacy',
                performanceMode: 'balanced'
            }
        };
        return agentState;
    }
    /**
     * Update legacy NPCData from AgentState
     */
    updateFromAgentState(agentState) {
        // Update goals from hierarchical state
        const operationalGoals = agentState.cognitive.goals.operationalGoals;
        this.npcData.goals = operationalGoals
            .filter(g => g.status !== 'completed')
            .map(g => ({
            name: this.extractItemNameFromGoal(g.description),
            quantity: this.extractQuantityFromGoal(g.resources)
        }));
        // Update current goal
        const activeGoals = operationalGoals.filter(g => g.status === 'active');
        if (activeGoals.length > 0) {
            const current = activeGoals[0];
            if (current) {
                this.npcData.curr_goal = {
                    name: this.extractItemNameFromGoal(current.description),
                    quantity: this.extractQuantityFromGoal(current.resources)
                };
            }
        }
        // Update routine flags
        this.npcData.do_routine = this.shouldDoRoutine(agentState);
        this.npcData.do_set_goal = this.shouldSetGoals(agentState);
    }
    /**
     * Get the legacy NPCData instance
     */
    getNPCData() {
        return this.npcData;
    }
    /**
     * Get the original profile data
     */
    getOriginalProfile() {
        return this.originalProfile;
    }
    // Helper methods
    inferCorePurpose() {
        if (this.npcData.goals && this.npcData.goals.length > 0) {
            return 'Resource gathering and construction';
        }
        return 'Survival and exploration';
    }
    extractPersonality() {
        return {
            openness: 0.5,
            conscientiousness: 0.7,
            extraversion: 0.4,
            agreeableness: 0.6,
            neuroticism: 0.3,
            riskTolerance: 0.4,
            creativity: 0.5,
            patience: 0.6,
            competitiveness: 0.3,
            curiosity: 0.5,
            explorationDrive: 0.5,
            socialTendency: 0.3,
            buildingCreativity: 0.6,
            combatAggression: 0.2
        };
    }
    extractMotivations() {
        return [{
                id: 'primary_motivation',
                type: 'resource_acquisition',
                strength: 0.8,
                satisfaction: 0.5,
                priority: 1
            }];
    }
    extractValues() {
        return [{
                id: 'efficiency',
                name: 'efficiency',
                importance: 0.8,
                priority: 1
            }];
    }
    extractEthics() {
        return {
            harmAvoidance: 0.7,
            fairness: 0.5,
            loyalty: 0.6,
            authority: 0.4,
            purity: 0.3
        };
    }
    inferRequiredTools(itemName) {
        const toolMap = {
            'wood': ['axe'],
            'stone': ['pickaxe'],
            'iron': ['pickaxe'],
            'gold': ['pickaxe'],
            'diamond': ['pickaxe'],
            'coal': ['pickaxe'],
            'cobblestone': ['pickaxe']
        };
        for (const [material, tools] of Object.entries(toolMap)) {
            if (itemName.includes(material)) {
                return tools;
            }
        }
        return [];
    }
    extractItemNameFromGoal(description) {
        const match = description.match(/(\w+)\s*x?/);
        return match?.[1] || 'unknown';
    }
    extractQuantityFromGoal(resources) {
        if (resources.items && Object.keys(resources.items).length > 0) {
            return Object.values(resources.items)[0];
        }
        if (resources.required && resources.required.length > 0) {
            return resources.required[0].amount;
        }
        return 1;
    }
    shouldDoRoutine(agentState) {
        return this.npcData.do_routine; // Preserve existing setting
    }
    shouldSetGoals(agentState) {
        return this.npcData.do_set_goal; // Preserve existing setting
    }
}
/**
 * Legacy Controller Adapter
 * Wraps the existing NPCController to work with the new Agent interface
 */
export class LegacyControllerAdapter {
    controller; // Changed from NPCContoller to any
    dataAdapter;
    agent; // Changed from Agent to any
    constructor(agent, dataAdapter) {
        this.agent = agent;
        this.dataAdapter = dataAdapter;
        this.controller = new NPCContoller(agent);
    }
    /**
     * Initialize the legacy controller
     */
    async initialize() {
        this.controller.init();
    }
    /**
     * Execute next goal using legacy system
     */
    async executeNext() {
        if (!this.agent.isIdle())
            return false;
        try {
            await this.controller.executeNext();
            return true;
        }
        catch (error) {
            console.error('Legacy controller execution failed:', error);
            return false;
        }
    }
    /**
     * Set a goal using legacy system
     */
    async setGoal(name = null, quantity = 1) {
        await this.controller.setGoal(name, quantity);
    }
    /**
     * Get built positions from legacy system
     */
    getBuiltPositions() {
        return this.controller.getBuiltPositions();
    }
    /**
     * Get current building from legacy system
     */
    currentBuilding() {
        return this.controller.currentBuilding();
    }
    /**
     * Sync state between legacy and new systems
     */
    syncState() {
        // Update data adapter with current controller state
        const currentNPCData = this.controller.data;
        // Note: Agent.state will be added when LangGraph is integrated
        // For now, we sync only the legacy data
        if (this.agent.state) {
            this.dataAdapter.updateFromAgentState(this.agent.state);
        }
    }
    /**
     * Get the underlying controller for direct access if needed
     */
    getController() {
        return this.controller;
    }
}
/**
 * Legacy Memory Adapter
 * Bridges the old MemoryBank with new semantic memory system
 */
export class LegacyMemoryAdapter {
    memoryBank; // Changed from MemoryBank to any
    constructor(memoryData) {
        this.memoryBank = new MemoryBank();
        if (memoryData) {
            this.memoryBank.loadJson(memoryData);
        }
    }
    /**
     * Convert legacy memory to semantic memory format
     */
    toSemanticMemory() {
        const semanticMemory = {
            facts: {},
            concepts: {},
            relationships: {}
        };
        const memories = this.memoryBank.getJson();
        for (const [name, position] of Object.entries(memories)) {
            const [x, y, z] = position;
            semanticMemory.facts[name] = {
                content: `${name} is located at coordinates (${x}, ${y}, ${z})`,
                confidence: 1.0,
                source: 'legacy_memory_bank',
                learnedAt: Date.now(),
                lastAccessed: Date.now(),
                accessCount: 1
            };
        }
        return semanticMemory;
    }
    /**
     * Remember a place using legacy system
     */
    rememberPlace(name, x, y, z) {
        this.memoryBank.rememberPlace(name, x, y, z);
    }
    /**
     * Recall a place using legacy system
     */
    recallPlace(name) {
        return this.memoryBank.recallPlace(name);
    }
    /**
     * Get legacy memory data for persistence
     */
    getLegacyMemory() {
        return this.memoryBank.getJson();
    }
    /**
     * Get the underlying memory bank
     */
    getMemoryBank() {
        return this.memoryBank;
    }
}
//# sourceMappingURL=legacy_adapter.js.map
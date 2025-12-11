/**
 * Legacy Adapter - Main compatibility layer for existing NPC system
 * Wraps the existing NPCData, ItemGoal, and BuildGoal systems to work with LangGraph
 */
import { NPCData } from '../npc/data.js';
import { NPCContoller } from '../npc/controller.js';
import { MemoryBank } from '../memory_bank.js';
/**
 * Legacy NPC Data Adapter
 * Converts between flat NPCData structure and hierarchical AgentState
 */
export class LegacyNPCDataAdapter {
    npcData;
    originalProfile;
    constructor(profileData) {
        this.originalProfile = profileData;
        this.npcData = NPCData.fromObject(profileData.npc || {});
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
                    relationships: {
                        agentId: this.originalProfile.username || 'legacy_agent',
                        relationshipCount: 0,
                        activeRelationships: [],
                        trustLevels: {},
                        friendshipLevels: {},
                        reputationScore: 0.5,
                        lastUpdate: Date.now()
                    },
                    theoryOfMind: {
                        mentalModels: {},
                        activePredictions: [],
                        emotionalUnderstanding: {},
                        perspectiveTakingHistory: [],
                        lastUpdate: Date.now()
                    },
                    socialContext: {
                        nearbyAgents: [],
                        groupDynamics: {
                            leader: undefined,
                            cohesion: 0.5,
                            hierarchy: [],
                            roles: {},
                            alliances: []
                        },
                        socialNorms: [],
                        culturalContext: {
                            culturalBackground: 'default',
                            values: [],
                            practices: [],
                            communicationStyle: 'neutral',
                            socialHierarchy: []
                        },
                        currentSituation: {
                            type: 'neutral',
                            participants: [],
                            goals: [],
                            resources: [],
                            powerDynamics: {}
                        }
                    },
                    socialLearning: {
                        observedBehaviors: [],
                        learnedPatterns: [],
                        teachingHistory: [],
                        socialSkillProgress: {},
                        lastUpdate: Date.now()
                    }
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
            motivations: this.extractMotivations(),
            values: this.extractValues(),
            ethics: this.extractEthics()
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
                    description: `Obtain ${goal.quantity}x ${goal.name}`,
                    priority: 100 - index, // Simple priority based on order
                    dependencies: [],
                    resources: {
                        items: { [goal.name]: goal.quantity },
                        tools: this.inferRequiredTools(goal.name)
                    },
                    progress: {
                        percentage: 0,
                        completedSteps: [],
                        blockers: []
                    },
                    status: 'pending',
                    createdAt: Date.now()
                };
                goals.push(hierarchicalGoal);
            });
        }
        // Add current goal if exists
        if (this.npcData.curr_goal) {
            const currentGoal = {
                id: 'legacy_current_goal',
                type: 'operational',
                description: `Current: Obtain ${this.npcData.curr_goal.quantity}x ${this.npcData.curr_goal.name}`,
                priority: 200, // Highest priority for current goal
                dependencies: [],
                resources: {
                    items: { [this.npcData.curr_goal.name]: this.npcData.curr_goal.quantity },
                    tools: this.inferRequiredTools(this.npcData.curr_goal.name)
                },
                progress: {
                    percentage: 0,
                    completedSteps: [],
                    blockers: []
                },
                status: 'active',
                createdAt: Date.now()
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
            skills: {},
            experience: [],
            learningRate: 0.1,
            skillSynergies: {}
        };
    }
    /**
     * Extract memory state from legacy MemoryBank
     */
    extractMemoryState() {
        return {
            semantic: {
                facts: {},
                concepts: {},
                relationships: {}
            },
            episodic: {
                episodes: [],
                currentIndex: 0,
                compressionLevel: 0
            },
            procedural: {
                procedures: {},
                sequences: {},
                habits: []
            },
            working: {
                currentFocus: '',
                activeTasks: [],
                buffer: [],
                capacity: 7,
                decayRate: 0.1
            }
        };
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
            this.npcData.curr_goal = {
                name: this.extractItemNameFromGoal(current.description),
                quantity: this.extractQuantityFromGoal(current.resources)
            };
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
        if (this.npcData.goals.length > 0) {
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
            explorationDrive: 0.5,
            socialTendency: 0.3,
            buildingCreativity: 0.6,
            combatAggression: 0.2
        };
    }
    extractMotivations() {
        return {
            primaryMotivation: 'resource_acquisition',
            secondaryMotivations: ['construction', 'survival'],
            drives: {
                resource_acquisition: 0.8,
                construction: 0.6,
                survival: 0.9
            },
            satisfactions: {}
        };
    }
    extractValues() {
        return {
            coreValues: ['efficiency', 'completion', 'survival'],
            valuePriorities: {
                efficiency: 0.8,
                completion: 0.9,
                survival: 1.0
            },
            moralConstraints: []
        };
    }
    extractEthics() {
        return {
            harmAvoidance: 0.7,
            fairnessConcern: 0.5,
            loyaltyPriority: 0.6,
            authorityRespect: 0.4,
            purityConcern: 0.3
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
        return match ? match[1] : 'unknown';
    }
    extractQuantityFromGoal(resources) {
        if (resources.items && Object.keys(resources.items).length > 0) {
            return Object.values(resources.items)[0];
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
    controller;
    dataAdapter;
    agent;
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
    memoryBank;
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

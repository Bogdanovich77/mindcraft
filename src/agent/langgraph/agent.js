/**
 * LangGraph Agent
 * 
 * New agent implementation using LangGraph state graphs for cognitive processing.
 * Integrates with the existing Mindcraft systems while providing enhanced capabilities.
 */

import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, START, END } from '@langchain/langgraph';
import { PersonalitySystem } from '../cognitive/personality.js';
import { PurposeCore } from '../cognitive/purpose_core.js';
import { ReactiveBehaviorLayer } from './reactive_layer.js';
import { InterruptController } from './interrupt_controller.js';
import { AgentState, CognitiveInput, CognitiveOutput } from './interfaces.js';

export class LangGraphAgent {
    constructor() {
        this.profile = null;
        this.bot = null;
        this.purposeCore = null;
        this.reactiveLayer = null;
        this.interruptController = null;
        this.stateGraph = null;
        this.agentState = null;
        this.name = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the LangGraph agent
     */
    async start(options = {}) {
        try {
            console.log('Initializing LangGraph agent...');
            
            // Extract profile from options
            this.profile = options.profile;
            if (!this.profile) {
                throw new Error('Profile is required for LangGraph agent initialization');
            }
            
            this.name = this.profile.name;
            console.log(`Setting up LangGraph agent: ${this.name}`);
            
            // Initialize cognitive components
            await this.initializeCognitiveComponents();
            
            // Initialize state graph
            await this.initializeStateGraph();
            
            // Initialize reactive layer
            await this.initializeReactiveLayer();
            
            // Initialize Minecraft bot connection
            await this.initializeBotConnection();
            
            this.isInitialized = true;
            console.log(`LangGraph agent ${this.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize LangGraph agent:`, error);
            throw error;
        }
    }

    /**
     * Initialize cognitive components from profile
     */
    async initializeCognitiveComponents() {
        const purposeCoreData = this.profile.purposeCore || {};
        
        // Initialize Purpose Core with personality, motivations, values, ethics
        this.purposeCore = new PurposeCore({
            initialPersonality: purposeCoreData.personality?.traits,
            initialMotivations: purposeCoreData.motivations,
            initialValues: purposeCoreData.values,
            initialEthics: purposeCoreData.ethics,
            learningRate: this.profile.behavior?.adaptationRate || 0.1,
            decisionTimeLimit: 2000
        });
        
        console.log('Cognitive components initialized');
    }

    /**
     * Initialize the LangGraph state graph
     */
    async initializeStateGraph() {
        // Create state graph with AgentState
        this.stateGraph = new StateGraph(AgentState)
            .addNode('perception', this.handlePerception.bind(this))
            .addNode('reactive_check', this.handleReactiveCheck.bind(this))
            .addNode('cognitive_processing', this.handleCognitiveProcessing.bind(this))
            .addNode('action_execution', this.handleActionExecution.bind(this))
            .addNode('learning_update', this.handleLearningUpdate.bind(this))
            .addEdge(START, 'perception')
            .addEdge('perception', 'reactive_check')
            .addConditionalEdges(
                'reactive_check',
                this.shouldProcessCognitively.bind(this),
                {
                    'reactive_action': 'action_execution',
                    'cognitive_processing': 'cognitive_processing'
                }
            )
            .addEdge('cognitive_processing', 'action_execution')
            .addEdge('action_execution', 'learning_update')
            .addEdge('learning_update', END);
        
        // Compile the graph
        this.compiledGraph = this.stateGraph.compile();
        
        console.log('LangGraph state graph initialized');
    }

    /**
     * Initialize reactive behavior layer
     */
    async initializeReactiveLayer() {
        const reactiveModes = this.profile.behavior?.reactiveModes || {};
        
        this.reactiveLayer = new ReactiveBehaviorLayer({
            modes: reactiveModes,
            enabled: true
        });
        
        // Initialize interrupt controller
        this.interruptController = new InterruptController({
            emergencyThreshold: 0.8,
            survivalThreshold: 0.6
        });
        
        console.log('Reactive behavior layer initialized');
    }

    /**
     * Initialize Minecraft bot connection
     */
    async initializeBotConnection() {
        // Import and initialize bot connection
        const { initBot } = await import('../../utils/mcdata.js');
        this.bot = initBot(this.name);
        
        // Set up bot event handlers
        this.setupBotEventHandlers();
        
        console.log('Minecraft bot connection initialized');
    }

    /**
     * Set up bot event handlers
     */
    setupBotEventHandlers() {
        this.bot.on('spawn', () => {
            console.log(`${this.name} spawned in Minecraft world`);
            this.initializeAgentState();
        });

        this.bot.on('chat', (username, message) => {
            if (username !== this.name) {
                this.handleMessage(username, message);
            }
        });

        this.bot.on('health', () => {
            this.updateHealthState();
        });

        this.bot.on('death', () => {
            this.handleDeath();
        });
    }

    /**
     * Initialize agent state
     */
    initializeAgentState() {
        this.agentState = {
            context: {
                position: this.bot.entity.position,
                health: this.bot.health,
                hunger: this.bot.food,
                dimension: this.bot.game.dimension,
                time: this.bot.time.timeOfDay,
                inventory: this.getInventorySnapshot(),
                nearbyEntities: this.getNearbyEntities(),
                environmentalFactors: this.getEnvironmentalFactors()
            },
            reactive: {
                activeMode: null,
                emergencyLevel: 0,
                lastReactiveAction: null
            },
            cognitive: {
                purposeCore: this.purposeCore.getState(),
                currentGoal: null,
                activeGoals: [],
                decisionHistory: []
            },
            executive: {
                currentAction: null,
                actionQueue: [],
                lastDecision: null,
                processingTime: 0
            }
        };
        
        console.log('Agent state initialized');
    }

    /**
     * Handle incoming messages
     */
    async handleMessage(username, message) {
        try {
            console.log(`${this.name} received message from ${username}: ${message}`);
            
            // Update agent state with new message
            this.agentState.context.lastMessage = {
                username,
                message,
                timestamp: Date.now()
            };
            
            // Process through state graph
            await this.processCognitiveCycle();
            
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    /**
     * Main cognitive processing cycle
     */
    async processCognitiveCycle() {
        try {
            if (!this.isInitialized || !this.agentState) {
                console.warn('Agent not fully initialized, skipping cognitive cycle');
                return;
            }
            
            // Update context
            this.updateContext();
            
            // Run through state graph
            const result = await this.compiledGraph.invoke(this.agentState);
            
            // Update agent state with result
            this.agentState = result;
            
        } catch (error) {
            console.error('Error in cognitive cycle:', error);
        }
    }

    /**
     * State graph node handlers
     */
    
    async handlePerception(state) {
        // Update sensory information
        const updatedState = { ...state };
        updatedState.context = {
            ...updatedState.context,
            position: this.bot.entity.position,
            health: this.bot.health,
            hunger: this.bot.food,
            inventory: this.getInventorySnapshot(),
            nearbyEntities: this.getNearbyEntities(),
            timestamp: Date.now()
        };
        
        return updatedState;
    }

    async handleReactiveCheck(state) {
        // Check for emergency conditions
        const emergencyLevel = this.interruptController.checkEmergencyConditions(state);
        
        if (emergencyLevel > 0.6) {
            // Trigger reactive behavior
            const reactiveAction = await this.reactiveLayer.handleEmergency(state, emergencyLevel);
            
            const updatedState = { ...state };
            updatedState.reactive.emergencyLevel = emergencyLevel;
            updatedState.reactive.lastReactiveAction = reactiveAction;
            updatedState.executive.currentAction = reactiveAction;
            
            return updatedState;
        }
        
        return state;
    }

    async handleCognitiveProcessing(state) {
        // Process through purpose core
        const cognitiveInput = {
            situation: this.createSituationDescription(state),
            availableActions: this.getAvailableActions(state),
            context: state.context,
            timeConstraints: 2000,
            interruptLevel: this.getInterruptLevel(state)
        };
        
        const cognitiveOutput = await this.purposeCore.processCognitive(cognitiveInput);
        
        const updatedState = { ...state };
        updatedState.cognitive = {
            ...updatedState.cognitive,
            ...cognitiveOutput
        };
        
        if (cognitiveOutput.selectedAction) {
            updatedState.executive.currentAction = cognitiveOutput.selectedAction;
        }
        
        return updatedState;
    }

    async handleActionExecution(state) {
        const action = state.executive.currentAction;
        
        if (action) {
            try {
                // Execute the action
                const result = await this.executeAction(action);
                
                const updatedState = { ...state };
                updatedState.executive.lastDecision = {
                    action: action.type,
                    result: result,
                    timestamp: Date.now()
                };
                
                return updatedState;
                
            } catch (error) {
                console.error('Action execution failed:', error);
                return state;
            }
        }
        
        return state;
    }

    async handleLearningUpdate(state) {
        // Update learning systems based on action outcomes
        const lastDecision = state.executive.lastDecision;
        
        if (lastDecision) {
            const outcome = this.evaluateActionOutcome(lastDecision);
            
            // Update purpose core with experience
            if (outcome !== 'neutral') {
                this.purposeCore.processOutcome(
                    lastDecision.action,
                    outcome,
                    state.context
                );
            }
        }
        
        return state;
    }

    /**
     * Utility methods
     */
    
    shouldProcessCognitively(state) {
        return state.reactive.emergencyLevel > 0.6 ? 'reactive_action' : 'cognitive_processing';
    }

    updateContext() {
        if (!this.agentState) return;
        
        this.agentState.context = {
            ...this.agentState.context,
            position: this.bot.entity.position,
            health: this.bot.health,
            hunger: this.bot.food,
            timestamp: Date.now()
        };
    }

    getInventorySnapshot() {
        return this.bot.inventory.items().map(item => ({
            name: item.name,
            count: item.count,
            metadata: item.metadata
        }));
    }

    getNearbyEntities() {
        return Object.values(this.bot.entities)
            .filter(entity => entity.position.distanceTo(this.bot.entity.position) < 32)
            .map(entity => ({
                name: entity.name || entity.type,
                position: entity.position,
                distance: entity.position.distanceTo(this.bot.entity.position),
                type: entity.type
            }));
    }

    getEnvironmentalFactors() {
        return {
            danger_level: this.calculateDangerLevel(),
            time_pressure: this.calculateTimePressure(),
            resource_availability: this.calculateResourceAvailability(),
            social_pressure: this.calculateSocialPressure()
        };
    }

    calculateDangerLevel() {
        const hostileEntities = this.getNearbyEntities()
            .filter(entity => this.isHostileEntity(entity.type));
        
        return Math.min(1.0, hostileEntities.length * 0.2);
    }

    calculateTimePressure() {
        // Time pressure based on health, hunger, and time of day
        let pressure = 0;
        
        if (this.bot.health < 10) pressure += 0.3;
        if (this.bot.food < 10) pressure += 0.2;
        if (this.bot.time.timeOfDay > 12000) pressure += 0.1; // Night time
        
        return Math.min(1.0, pressure);
    }

    calculateResourceAvailability() {
        // Simple heuristic based on inventory
        const items = this.bot.inventory.items();
        const hasTools = items.some(item => item.name.includes('pickaxe') || item.name.includes('axe'));
        const hasFood = items.some(item => item.name.includes('food') || item.name.includes('bread'));
        
        return (hasTools ? 0.5 : 0) + (hasFood ? 0.5 : 0);
    }

    calculateSocialPressure() {
        // Based on nearby players and recent messages
        const nearbyPlayers = this.getNearbyEntities()
            .filter(entity => entity.type === 'player');
        
        return Math.min(1.0, nearbyPlayers.length * 0.3);
    }

    createSituationDescription(state) {
        const context = state.context;
        return `Agent ${this.name} at position ${context.position.x.toFixed(1)}, ${context.position.y.toFixed(1)}, ${context.position.z.toFixed(1)} in ${context.dimension}. Health: ${context.health}, Hunger: ${context.hunger}. Time: ${context.time}. Nearby entities: ${context.nearbyEntities.length}.`;
    }

    getAvailableActions(state) {
        // Return available actions based on context and capabilities
        return [
            { type: 'wait', utility: 0.1, description: 'Wait and observe' },
            { type: 'explore', utility: 0.3, description: 'Explore surroundings' },
            { type: 'gather_resources', utility: 0.4, description: 'Gather nearby resources' },
            { type: 'build_shelter', utility: 0.5, description: 'Build or improve shelter' },
            { type: 'socialize', utility: 0.2, description: 'Interact with nearby players' }
        ];
    }

    getInterruptLevel(state) {
        const emergencyLevel = state.reactive.emergencyLevel;
        if (emergencyLevel > 0.8) return 'emergency';
        if (emergencyLevel > 0.6) return 'high';
        if (emergencyLevel > 0.3) return 'medium';
        return 'low';
    }

    async executeAction(action) {
        console.log(`Executing action: ${action.type}`);
        
        // This would integrate with the existing action system
        switch (action.type) {
            case 'wait':
                await new Promise(resolve => setTimeout(resolve, 1000));
                return 'success';
                
            case 'explore':
                // Implement exploration logic
                return 'success';
                
            default:
                console.warn(`Unknown action type: ${action.type}`);
                return 'failed';
        }
    }

    evaluateActionOutcome(decision) {
        // Simple outcome evaluation
        if (decision.result === 'success') return 'success';
        if (decision.result === 'failed') return 'failure';
        return 'neutral';
    }

    isHostileEntity(entityType) {
        const hostileTypes = ['zombie', 'skeleton', 'creeper', 'spider', 'enderman'];
        return hostileTypes.some(type => entityType.toLowerCase().includes(type));
    }

    updateHealthState() {
        if (this.agentState) {
            this.agentState.context.health = this.bot.health;
            this.agentState.context.hunger = this.bot.food;
        }
    }

    handleDeath() {
        console.log(`${this.name} died`);
        // Handle death logic
    }

    /**
     * Get agent state for debugging/monitoring
     */
    getState() {
        return this.agentState;
    }

    /**
     * Get purpose core state
     */
    getPurposeCoreState() {
        return this.purposeCore ? this.purposeCore.getState() : null;
    }

    /**
     * Check if agent is ready
     */
    isReady() {
        return this.isInitialized && 
               this.purposeCore && 
               this.purposeCore.isReady() &&
               this.agentState !== null;
    }
}

export default LangGraphAgent;
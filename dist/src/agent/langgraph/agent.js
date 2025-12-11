/**
 * LangGraph Agent
 *
 * New agent implementation using LangGraph state graphs for cognitive processing.
 * Integrates with the existing Mindcraft systems while providing enhanced capabilities.
 */
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { PurposeCore } from '../cognitive/purpose_core.js';
import { ReactiveBehaviorLayerImpl } from './reactive_layer.js';
import { InterruptController } from './interrupt_controller.js';
import { InterruptPriority, ProcessingPhase, AgentStateAnnotation } from './interfaces.js';
import { Prompter } from '../../models/prompter.js';
import { messageAnalysisNode, conversationProcessingNode, responseRoutingNode } from './state_nodes.js';
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
        this.prompter = null;
        this.conversationHistory = [];
        // Memory management settings
        this.responseHistoryLimit = 100;
        this.memoryCleanupInterval = 60000; // 1 minute
        this.lastMemoryCleanup = Date.now();
        this.memoryUsageTracker = {
            initialMemory: process.memoryUsage(),
            peakMemory: process.memoryUsage(),
            lastCheck: Date.now()
        };
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
            // Initialize Minecraft bot connection
            await this.initializeBotConnection();
            // Initialize reactive layer
            await this.initializeReactiveLayer();
            this.isInitialized = true;
            console.log(`LangGraph agent ${this.name} initialized successfully`);
        }
        catch (error) {
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
        // Initialize Prompter for conversation processing
        this.prompter = new Prompter(this, this.profile);
        await this.prompter.initExamples();
        console.log('Cognitive components and prompter initialized');
    }
    /**
     * Initialize the LangGraph state graph
     */
    async initializeStateGraph() {
        // Create state graph with proper annotation schema
        this.stateGraph = new StateGraph(AgentStateAnnotation)
            .addNode('perception', this.handlePerception.bind(this))
            .addNode('message_analysis', messageAnalysisNode)
            .addNode('conversation_processing', (state) => conversationProcessingNode(state, this))
            .addNode('reactive_check', this.handleReactiveCheck.bind(this))
            .addNode('cognitive_processing', this.handleCognitiveProcessing.bind(this))
            .addNode('action_execution', this.handleActionExecution.bind(this))
            .addNode('learning_update', this.handleLearningUpdate.bind(this))
            .addNode('response_routing', (state) => responseRoutingNode(state, this))
            .addEdge(START, 'perception')
            .addEdge('perception', 'message_analysis')
            .addConditionalEdges('message_analysis', this.determineProcessingMode.bind(this), {
            'conversational': 'conversation_processing',
            'action': 'reactive_check'
        })
            .addEdge('conversation_processing', 'response_routing')
            .addConditionalEdges('reactive_check', this.shouldProcessCognitively.bind(this), {
            'reactive_action': 'action_execution',
            'cognitive_processing': 'cognitive_processing'
        })
            .addEdge('cognitive_processing', 'action_execution')
            .addEdge('action_execution', 'learning_update')
            .addEdge('learning_update', 'response_routing')
            .addEdge('response_routing', END);
        // Compile the graph
        this.compiledGraph = this.stateGraph.compile();
        console.log('LangGraph state graph initialized');
    }
    /**
     * Initialize reactive behavior layer
     */
    async initializeReactiveLayer() {
        // Initialize interrupt controller first
        this.interruptController = new InterruptController({
            emergencyThreshold: 0.8,
            survivalThreshold: 0.6
        });
        // Initialize reactive layer with correct parameters
        // The constructor expects: interruptController, bot, botId
        this.reactiveLayer = new ReactiveBehaviorLayerImpl(this.interruptController, this.bot, this.name);
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
            // Process any pending messages that were received before initialization
            this.processPendingMessages();
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
        // Check if bot.entity is available before accessing position
        const position = this.bot.entity ? this.bot.entity.position : { x: 0, y: 64, z: 0 };
        this.agentState = {
            context: {
                position: position,
                health: this.bot.health || 20,
                hunger: this.bot.food || 20,
                dimension: this.bot.game ? this.bot.game.dimension : 'overworld',
                time: this.bot.time ? this.bot.time.timeOfDay : 0,
                inventory: this.getInventorySnapshot(),
                nearbyEntities: this.getNearbyEntities(),
                environmentalFactors: this.getEnvironmentalFactors(),
                lastMessage: undefined
            },
            reactive: {
                activeMode: null,
                emergencyLevel: 0,
                lastReactiveAction: null,
                emergencyConditions: [],
                interruptHistory: []
            },
            cognitive: {
                purposeCore: this.purposeCore.getState(),
                currentGoal: null,
                activeGoals: [],
                decisionHistory: [],
                memory: {
                    working: {
                        currentFocus: null,
                        activeTasks: [],
                        buffer: []
                    },
                    episodic: {
                        episodes: []
                    }
                },
                processing: {
                    currentPhase: 'perception',
                    cognitiveLoad: 0,
                    processingHistory: []
                }
            },
            executive: {
                currentAction: null,
                actionQueue: [],
                lastDecision: null,
                processingTime: 0,
                conversationalResponse: undefined,
                lastResponse: undefined,
                responseHistory: [],
                processingMode: 'action'
            },
            metadata: {
                agentId: this.name,
                startTime: Date.now(),
                lastUpdate: Date.now(),
                version: '1.0.0',
                performanceMode: 'balanced'
            }
        };
        console.log('Agent state initialized');
    }
    /**
     * Process pending messages that were received before agent state was initialized
     */
    async processPendingMessages() {
        if (!this.pendingMessages || this.pendingMessages.length === 0) {
            return;
        }
        console.log(`${this.name} processing ${this.pendingMessages.length} pending messages`);
        // Process each pending message
        for (const { username, message, timestamp } of this.pendingMessages) {
            try {
                // Update agent state with pending message
                this.agentState.context.lastMessage = {
                    source: username,
                    message,
                    timestamp: timestamp,
                    type: this.determineMessageType(message),
                    priority: this.calculateMessagePriority(message)
                };
                // Process through state graph
                await this.processCognitiveCycle();
            }
            catch (error) {
                console.error(`Error processing pending message from ${username}:`, error);
            }
        }
        // Clear pending messages
        this.pendingMessages = [];
    }
    /**
     * Handle incoming messages
     */
    async handleMessage(username, message) {
        try {
            console.log(`${this.name} received message from ${username}: ${message}`);
            // Check if agent state is initialized
            if (!this.agentState) {
                console.warn(`${this.name} agent state not initialized, deferring message processing`);
                // Store message for later processing
                if (!this.pendingMessages) {
                    this.pendingMessages = [];
                }
                this.pendingMessages.push({ username, message, timestamp: Date.now() });
                return;
            }
            // Update agent state with new message
            this.agentState.context.lastMessage = {
                source: username,
                message,
                timestamp: Date.now(),
                type: this.determineMessageType(message),
                priority: this.calculateMessagePriority(message)
            };
            // Process through state graph
            await this.processCognitiveCycle();
        }
        catch (error) {
            console.error('Error handling message:', error);
            // Handle protocol errors gracefully
            if (error.message && error.message.includes('PartialReadError')) {
                console.log('Protocol error in LangGraph agent, ignoring message');
                return;
            }
            // Clear the message to prevent reprocessing
            if (this.agentState && this.agentState.context) {
                this.agentState.context.lastMessage = undefined;
            }
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
            // Update context with null checks
            this.updateContext();
            // Run through state graph for all processing (conversation and action)
            const result = await this.compiledGraph.invoke(this.agentState);
            // Update agent state with result
            this.agentState = result;
        }
        catch (error) {
            console.error('Error in cognitive cycle:', error);
        }
    }
    /**
     * Process conversational messages using prompter system
     */
    async processConversationalMessage() {
        try {
            // Check if agent state is available
            if (!this.agentState || !this.agentState.context) {
                console.warn(`${this.name} agent state not available for conversation processing`);
                return;
            }
            const message = this.agentState.context.lastMessage;
            if (!message)
                return;
            // Check for duplicate message to prevent infinite loops
            const recentMessages = this.agentState.executive.responseHistory || [];
            const isDuplicate = recentMessages.some(record => record.message === message.message &&
                record.source === message.source &&
                (Date.now() - record.timestamp) < 5000 // Within 5 seconds
            );
            if (isDuplicate) {
                console.log(`${this.name} detected duplicate message, skipping processing`);
                // Clear the message from context to prevent reprocessing
                this.agentState.context.lastMessage = undefined;
                return;
            }
            console.log(`${this.name} processing conversational message: "${message.message}"`);
            // Generate response using prompter
            const response = await this.generateConversationalResponse(message, this.agentState);
            // Route response back to user
            await this.routeResponse(message.source, response);
            // Update conversation history
            const responseRecord = {
                source: message.source,
                message: message.message,
                response: response,
                timestamp: Date.now(),
                processingMode: 'conversational',
                responseTime: Date.now() - message.timestamp,
                success: true
            };
            this.agentState.executive.responseHistory.push(responseRecord);
            this.agentState.executive.lastResponse = responseRecord;
            // Limit conversation history to prevent memory buildup
            if (this.agentState.executive.responseHistory.length > this.responseHistoryLimit) {
                this.agentState.executive.responseHistory = this.agentState.executive.responseHistory.slice(-this.responseHistoryLimit);
            }
            // Check if memory cleanup is needed
            this.checkMemoryUsage();
            // Clear the message from context
            this.agentState.context.lastMessage = undefined;
        }
        catch (error) {
            console.error('Error processing conversational message:', error);
        }
    }
    /**
     * State graph node handlers
     */
    async handlePerception(state) {
        // Update sensory information with null checks
        const updatedState = { ...state };
        updatedState.context = {
            ...updatedState.context,
            position: this.bot.entity ? this.bot.entity.position : state.context.position || { x: 0, y: 64, z: 0 },
            health: this.bot.health || state.context.health || 20,
            hunger: this.bot.food || state.context.hunger || 20,
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
            }
            catch (error) {
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
                this.purposeCore.processOutcome(lastDecision.action, outcome, state.context);
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
    determineProcessingMode(state) {
        if (!state.context.lastMessage) {
            return 'action';
        }
        const message = state.context.lastMessage.message.toLowerCase();
        // Check for action commands
        const actionCommands = [
            'go to', 'move to', 'walk to', 'run to',
            'get', 'take', 'pick up', 'collect',
            'craft', 'build', 'place', 'break',
            'attack', 'fight', 'defend',
            'follow', 'stop', 'wait', '!',
            '!goal'
        ];
        const isActionCommand = actionCommands.some(cmd => message.includes(cmd));
        return isActionCommand ? 'action' : 'conversational';
    }
    determineMessageType(message) {
        const lowerMessage = message.toLowerCase();
        // Check for action commands
        const actionCommands = [
            'go to', 'move to', 'walk to', 'run to',
            'get', 'take', 'pick up', 'collect',
            'craft', 'build', 'place', 'break',
            'attack', 'fight', 'defend',
            'follow', 'stop', 'wait',
            '!goal'
        ];
        const isActionCommand = actionCommands.some(cmd => lowerMessage.includes(cmd));
        return isActionCommand ? 'command' : 'conversational';
    }
    calculateMessagePriority(message) {
        const lowerMessage = message.toLowerCase();
        const urgencyIndicators = ['help', 'urgent', 'quick', 'fast', 'now', 'emergency', '!'];
        let priority = 0.5; // Base priority
        urgencyIndicators.forEach(indicator => {
            if (lowerMessage.includes(indicator)) {
                priority += 0.2;
            }
        });
        // Add priority for exclamation marks
        const exclamationCount = (message.match(/!/g) || []).length;
        priority += Math.min(0.3, exclamationCount * 0.1);
        return Math.min(1.0, priority);
    }
    /**
     * Generate conversational response using prompter system
     */
    async generateConversationalResponse(message, state) {
        if (!this.prompter) {
            return 'I apologize, but my conversation system is not initialized.';
        }
        try {
            // Build conversation history for prompter
            const history = this.buildConversationHistory(state);
            // Use prompter to generate response
            const response = await this.prompter.promptConvo(history);
            console.log(`${this.name} generated response: "${response}"`);
            return response;
        }
        catch (error) {
            console.error('Error generating conversational response:', error);
            return 'I apologize, but I\'m having trouble processing that right now.';
        }
    }
    /**
     * Build conversation history for prompter
     */
    buildConversationHistory(state) {
        const history = [];
        // Add action context as system message at the beginning
        const actionContext = this.buildActionContext(state);
        if (actionContext) {
            history.push({
                role: 'system',
                content: actionContext
            });
        }
        // Add recent conversation history
        const recentResponses = state.executive.responseHistory.slice(-5);
        recentResponses.forEach(record => {
            history.push({
                role: 'user',
                content: record.message
            });
            history.push({
                role: 'assistant',
                content: record.response
            });
        });
        // Add current message
        if (state.context.lastMessage) {
            history.push({
                role: 'user',
                content: state.context.lastMessage.message
            });
        }
        return history;
    }
    /**
     * Build action context information for conversation
     */
    buildActionContext(state) {
        let context = "Current Action Context:\n";
        // Add current goal information
        if (state.cognitive && state.cognitive.goals && state.cognitive.goals.activeGoals && state.cognitive.goals.activeGoals.length > 0) {
            const activeGoal = state.cognitive.goals.activeGoals[0];
            context += `- Current Goal: ${activeGoal.description} (${Math.round(activeGoal.progress.percentage || 0)}% complete)\n`;
        }
        else {
            context += "- Current Goal: No active goal\n";
        }
        // Add current action information
        if (state.executive && state.executive.currentAction) {
            const action = state.executive.currentAction;
            context += `- Current Action: ${action.type}`;
            if (action.parameters) {
                context += ` - ${JSON.stringify(action.parameters)}`;
            }
            context += `\n`;
            // Add action progress
            context += `- Action Progress: Status: ${action.status || 'unknown'}`;
            if (action.startTime) {
                const elapsed = Date.now() - action.startTime;
                context += `, Time elapsed: ${Math.round(elapsed / 1000)}s`;
            }
            context += `\n`;
        }
        else {
            context += "- Current Action: No current action\n";
            context += "- Action Progress: No action in progress\n";
        }
        // Add recent actions
        if (state.executive && state.executive.decisionHistory && state.executive.decisionHistory.length > 0) {
            const recent = state.executive.decisionHistory.slice(-3).reverse();
            context += "- Recent Actions:\n";
            recent.forEach(decision => {
                const time = new Date(decision.timestamp).toLocaleTimeString();
                context += `  * ${time}: ${decision.action || decision.selected} -> ${decision.outcome || 'unknown'}\n`;
            });
        }
        else {
            context += "- Recent Actions: No recent actions\n";
        }
        return context;
    }
    /**
     * Route response back to user
     */
    async routeResponse(source, response) {
        try {
            console.log(`${this.name} full response to ${source}: "${response}"`);
            if (this.bot && this.bot.chat) {
                // Send response through Minecraft chat
                this.bot.chat(response);
            }
            else {
                // Fallback to console for testing
                console.log(`${this.name} to ${source}: ${response}`);
            }
        }
        catch (error) {
            console.error('Error routing response:', error);
        }
    }
    /**
     * Test conversation processing
     */
    async testConversationProcessing(testMessage, source = 'test_user') {
        console.log(`\n=== Testing Conversation Processing ===`);
        console.log(`Message: "${testMessage}" from ${source}`);
        try {
            // Simulate receiving a message
            await this.handleMessage(source, testMessage);
            console.log(`=== Test Complete ===\n`);
        }
        catch (error) {
            console.error('Test failed:', error);
            console.log(`=== Test Failed ===\n`);
        }
    }
    updateContext() {
        if (!this.agentState)
            return;
        this.agentState.context = {
            ...this.agentState.context,
            position: this.bot.entity ? this.bot.entity.position : this.agentState.context.position || { x: 0, y: 64, z: 0 },
            health: this.bot.health || this.agentState.context.health || 20,
            hunger: this.bot.food || this.agentState.context.hunger || 20,
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
        // Check if bot.entity is available
        if (!this.bot.entity || !this.bot.entities) {
            return [];
        }
        const botPosition = this.bot.entity.position;
        return Object.values(this.bot.entities)
            .filter(entity => entity.position && botPosition && entity.position.distanceTo(botPosition) < 32)
            .map(entity => ({
            name: entity.name || entity.type,
            position: entity.position,
            distance: entity.position.distanceTo(botPosition),
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
        const nearbyEntities = this.getNearbyEntities();
        if (!nearbyEntities || nearbyEntities.length === 0) {
            return 0;
        }
        const hostileEntities = nearbyEntities
            .filter(entity => this.isHostileEntity(entity.type));
        return Math.min(1.0, hostileEntities.length * 0.2);
    }
    calculateTimePressure() {
        // Time pressure based on health, hunger, and time of day
        let pressure = 0;
        if (this.bot.health && this.bot.health < 10)
            pressure += 0.3;
        if (this.bot.food && this.bot.food < 10)
            pressure += 0.2;
        if (this.bot.time && this.bot.time.timeOfDay > 12000)
            pressure += 0.1; // Night time
        return Math.min(1.0, pressure);
    }
    calculateResourceAvailability() {
        // Simple heuristic based on inventory
        if (!this.bot.inventory || !this.bot.inventory.items) {
            return 0;
        }
        const items = this.bot.inventory.items();
        const hasTools = items.some(item => item.name.includes('pickaxe') || item.name.includes('axe'));
        const hasFood = items.some(item => item.name.includes('food') || item.name.includes('bread'));
        return (hasTools ? 0.5 : 0) + (hasFood ? 0.5 : 0);
    }
    calculateSocialPressure() {
        // Based on nearby players and recent messages
        const nearbyEntities = this.getNearbyEntities();
        if (!nearbyEntities || nearbyEntities.length === 0) {
            return 0;
        }
        const nearbyPlayers = nearbyEntities
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
        if (emergencyLevel > 0.8)
            return 'emergency';
        if (emergencyLevel > 0.6)
            return 'high';
        if (emergencyLevel > 0.3)
            return 'medium';
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
        if (decision.result === 'success')
            return 'success';
        if (decision.result === 'failed')
            return 'failure';
        return 'neutral';
    }
    isHostileEntity(entityType) {
        const hostileTypes = ['zombie', 'skeleton', 'creeper', 'spider', 'enderman'];
        return hostileTypes.some(type => entityType.toLowerCase().includes(type));
    }
    updateHealthState() {
        if (this.agentState && this.agentState.context) {
            this.agentState.context.health = this.bot.health || this.agentState.context.health || 20;
            this.agentState.context.hunger = this.bot.food || this.agentState.context.hunger || 20;
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
    /**
     * Check memory usage and perform cleanup if needed
     */
    checkMemoryUsage() {
        const now = Date.now();
        // Check memory usage at regular intervals
        if (now - this.memoryUsageTracker.lastCheck > 30000) { // Every 30 seconds
            const currentMemory = process.memoryUsage();
            this.memoryUsageTracker.lastCheck = now;
            // Update peak memory if current is higher
            if (currentMemory.heapUsed > this.memoryUsageTracker.peakMemory.heapUsed) {
                this.memoryUsageTracker.peakMemory = currentMemory;
            }
            // Log memory usage
            console.log(`[MEMORY] ${this.name} - Current: ${Math.round(currentMemory.heapUsed / 1024 / 1024)}MB, Peak: ${Math.round(this.memoryUsageTracker.peakMemory.heapUsed / 1024 / 1024)}MB`);
            // Trigger garbage collection if memory usage is high
            if (currentMemory.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
                console.log(`[MEMORY] High memory usage detected for ${this.name}, triggering garbage collection`);
                if (global.gc) {
                    global.gc();
                }
            }
        }
        // Perform periodic cleanup
        if (now - this.lastMemoryCleanup > this.memoryCleanupInterval) {
            this.performMemoryCleanup();
            this.lastMemoryCleanup = now;
        }
    }
    /**
     * Perform memory cleanup tasks
     */
    performMemoryCleanup() {
        try {
            console.log(`[MEMORY] Performing cleanup for ${this.name}`);
            // Clean up response history if it exceeds limit
            if (this.agentState && this.agentState.executive && this.agentState.executive.responseHistory) {
                if (this.agentState.executive.responseHistory.length > this.responseHistoryLimit) {
                    this.agentState.executive.responseHistory = this.agentState.executive.responseHistory.slice(-this.responseHistoryLimit);
                    console.log(`[MEMORY] Trimmed response history to ${this.responseHistoryLimit} entries`);
                }
            }
            // Clean up decision history if it exists
            if (this.agentState && this.agentState.executive && this.agentState.executive.decisionHistory) {
                if (this.agentState.executive.decisionHistory.length > 100) {
                    this.agentState.executive.decisionHistory = this.agentState.executive.decisionHistory.slice(-100);
                    console.log(`[MEMORY] Trimmed decision history to 100 entries`);
                }
            }
            // Trigger garbage collection if available
            if (global.gc) {
                global.gc();
                console.log(`[MEMORY] Garbage collection triggered for ${this.name}`);
            }
        }
        catch (error) {
            console.error(`[MEMORY] Error during cleanup for ${this.name}:`, error);
        }
    }
    /**
     * Get memory usage statistics
     */
    getMemoryStats() {
        const currentMemory = process.memoryUsage();
        return {
            current: {
                heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024),
                heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024),
                external: Math.round(currentMemory.external / 1024 / 1024)
            },
            peak: {
                heapUsed: Math.round(this.memoryUsageTracker.peakMemory.heapUsed / 1024 / 1024),
                heapTotal: Math.round(this.memoryUsageTracker.peakMemory.heapTotal / 1024 / 1024)
            },
            initial: {
                heapUsed: Math.round(this.memoryUsageTracker.initialMemory.heapUsed / 1024 / 1024),
                heapTotal: Math.round(this.memoryUsageTracker.initialMemory.heapTotal / 1024 / 1024)
            }
        };
    }
    /**
     * Connect to MindServer for UI visibility
     */
    async connectToMindServer(port = 8080) {
        try {
            const { io } = await import('socket.io-client');
            const socket = io(`http://localhost:${port}`);
            socket.on('connect', () => {
                console.log(`${this.name} connected to MindServer`);
                socket.emit('login-agent', this.name);
            });
            socket.on('disconnect', () => {
                console.log(`${this.name} disconnected from MindServer`);
            });
            this.mindServerSocket = socket;
        }
        catch (error) {
            console.error(`Failed to connect ${this.name} to MindServer:`, error);
        }
    }
}
export default LangGraphAgent;

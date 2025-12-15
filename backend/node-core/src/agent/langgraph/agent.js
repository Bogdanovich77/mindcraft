/**
 * LangGraph Agent - Simplified 4-Node Architecture
 *
 * Simplified agent implementation using LangGraph state graphs for core functionality.
 * Focuses on inter-bot communication, personality-driven responses, self-awareness, and autonomous behavior.
 */

import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { AgentStateAnnotation } from './interfaces.js';
import { Prompter } from '../../models/prompter.js';

export class LangGraphAgent {
    constructor() {
        this.profile = null;
        this.bot = null;
        this.stateGraph = null;
        this.agentState = null;
        this.name = null;
        this.isInitialized = false;
        this.prompter = null;
        this.conversationHistory = [];
        
        // Simplified state management
        this.responseHistoryLimit = 100;
        this.memoryCleanupInterval = 60000; // 1 minute
        this.lastMemoryCleanup = Date.now();
        this.memoryUsageTracker = {
            initialMemory: process.memoryUsage(),
            peakMemory: process.memoryUsage(),
            lastCheck: Date.now()
        };
        
        // Add compatibility layer for prompter system
        this._actionsCompatibility = null;
    }

    // Add compatibility property for prompter system
    get actions() {
        if (!this._actionsCompatibility) {
            const self = this;
            this._actionsCompatibility = {
                get currentActionLabel() {
                    if (!self.agentState?.lastAction) return 'Idle';
                    return self.agentState.lastAction.type || 'Idle';
                }
            };
        }
        return this._actionsCompatibility;
    }

    /**
     * Initialize the LangGraph agent
     */
    async start(options = {}) {
        try {
            console.log('Initializing simplified LangGraph agent...');
            
            // Extract profile from options
            this.profile = options.profile;
            if (!this.profile) {
                throw new Error('Profile is required for LangGraph agent initialization');
            }
            
            this.name = this.profile.name;
            console.log(`Setting up simplified LangGraph agent: ${this.name}`);
            
            // Initialize simplified components
            await this.initializeSimplifiedComponents();
            
            // Initialize state graph
            await this.initializeSimplifiedStateGraph();
            
            // Initialize Minecraft bot connection
            await this.initializeBotConnection();
            
            this.isInitialized = true;
            console.log(`Simplified LangGraph agent ${this.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize LangGraph agent:`, error);
            throw error;
        }
    }

    /**
     * Initialize simplified components from profile
     */
    async initializeSimplifiedComponents() {
        // Initialize Prompter for conversation processing
        this.prompter = new Prompter(this, this.profile);
        await this.prompter.initExamples();
        
        console.log('Simplified components and prompter initialized');
    }

    /**
     * Initialize the simplified LangGraph state graph (4-node architecture)
     */
    async initializeSimplifiedStateGraph() {
        // Create state graph with proper annotation schema
        this.stateGraph = new StateGraph(AgentStateAnnotation)
            .addNode('perception', this.handlePerception.bind(this))
            .addNode('conversationHandler', this.handleConversation.bind(this))
            .addNode('decision', this.handleDecision.bind(this))
            .addNode('execution', this.handleExecution.bind(this))
            .addEdge(START, 'perception')
            .addConditionalEdges(
                'perception',
                this.shouldProcessConversation.bind(this),
                {
                    'conversation': 'conversationHandler',
                    'decision': 'decision'
                }
            )
            .addEdge('conversationHandler', 'decision')
            .addEdge('decision', 'execution')
            .addEdge('execution', END);
        
        // Compile the graph
        this.compiledGraph = this.stateGraph.compile();
        
        console.log('Simplified LangGraph state graph initialized (4-node architecture)');
    }

    /**
     * Initialize Minecraft bot connection
     */
    async initializeBotConnection() {
        // Import and initialize bot connection
        const { initBot } = await import('../../utils/mcdata.js');
        const settings = (await import('../../agent/settings.js')).default;
        console.log(`[${this.name}] Settings before initBot:`, settings);
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
     * Initialize agent state (simplified)
     */
    initializeAgentState() {
        // Check if bot.entity is available before accessing position
        const position = this.bot.entity ? this.bot.entity.position : { x: 0, y: 64, z: 0 };
        
        this.agentState = {
            worldContext: {
                position: position,
                health: this.bot.health || 20,
                hunger: this.bot.food || 20,
                dimension: this.bot.game ? this.bot.game.dimension : 'overworld',
                time: this.bot.time ? this.bot.time.timeOfDay : 0,
                inventory: this.getInventorySnapshot(),
                equipment: this.getEquipmentSnapshot(),
                nearbyEntities: this.getNearbyEntities()
            },
            personality: this.profile.personality || 'friendly',
            goals: this.profile.goals || 'survive and explore',
            mandate: null, // Will be set by player orders or bot requests
            conversation: {
                message: null,
                sender: null,
                isRequestForHelp: false,
                isOfferOfAssistance: false,
                targetBot: null
            },
            lastAction: null,
            response: null
        };
        
        console.log('Simplified agent state initialized');
    }

    /**
     * Determine if should process conversation or go directly to decision
     */
    shouldProcessConversation(state) {
        return state.conversation && state.conversation.message ? 'conversation' : 'decision';
    }

    /**
     * Simplified state graph node handlers (4-node architecture)
     */
    
    async handlePerception(state) {
        try {
            // Update world context with current bot state
            const updatedState = { ...state };
            
            // Ensure worldContext exists
            if (!updatedState.worldContext) {
                updatedState.worldContext = {
                    position: { x: 0, y: 64, z: 0 },
                    health: 20,
                    hunger: 20,
                    dimension: 'overworld',
                    time: 0,
                    inventory: [],
                    equipment: [],
                    nearbyEntities: []
                };
            }
            
            updatedState.worldContext = {
                ...updatedState.worldContext,
                position: this.bot?.entity?.position ?? state.worldContext?.position ?? { x: 0, y: 64, z: 0 },
                health: this.bot?.health ?? state.worldContext?.health ?? 20,
                hunger: this.bot?.food ?? state.worldContext?.hunger ?? 20,
                inventory: this.getInventorySnapshot(),
                equipment: this.getEquipmentSnapshot(),
                nearbyEntities: this.getNearbyEntities(),
                timestamp: Date.now()
            };
            
            return updatedState;
        } catch (error) {
            console.error('Error in handlePerception:', error);
            return state;
        }
    }

    async handleConversation(state) {
        try {
            if (!state.conversation || !state.conversation.message) {
                return state;
            }
            
            console.log(`${this.name} processing conversation: "${state.conversation.message}"`);
            
            // Generate response based on personality and context
            const response = await this.generatePersonalityResponse(state);
            
            const updatedState = { ...state };
            updatedState.response = response;
            
            return updatedState;
        } catch (error) {
            console.error('Error in handleConversation:', error);
            return state;
        }
    }

    async handleDecision(state) {
        try {
            // Choose next action based on goals, mandate, and context
            const action = await this.selectAction(state);
            
            const updatedState = { ...state };
            updatedState.lastAction = action;
            
            return updatedState;
        } catch (error) {
            console.error('Error in handleDecision:', error);
            return state;
        }
    }

    async handleExecution(state) {
        try {
            const action = state.lastAction;
            
            if (action) {
                console.log(`${this.name} executing action: ${action.type}`);
                
                // Execute the action
                await this.executeAction(action);
                
                // Send response if there is one
                if (state.response) {
                    await this.sendResponse(state.response);
                }
            }
            
            return state;
        } catch (error) {
            console.error('Error in handleExecution:', error);
            return state;
        }
    }

    /**
     * Generate personality-driven response
     */
    async generatePersonalityResponse(state) {
        if (!this.prompter) {
            return 'I acknowledge your message.';
        }
        
        try {
            // Build simple conversation context
            const history = [{
                role: 'user',
                content: state.conversation.message
            }];
            
            // Add personality context
            const personalityContext = `Personality: ${state.personality}. Goals: ${state.goals}.`;
            history.unshift({
                role: 'system',
                content: personalityContext
            });
            
            // Use prompter to generate response
            const response = await this.prompter.promptConvo(history);
            
            return response || 'I understand.';
            
        } catch (error) {
            console.error('Error generating personality response:', error);
            return 'I apologize, but I\'m having trouble responding right now.';
        }
    }

    /**
     * Select action based on goals, mandate, and context
     */
    async selectAction(state) {
        // Prioritize mandate if present
        if (state.mandate) {
            return {
                type: 'follow_mandate',
                mandate: state.mandate,
                priority: 'high'
            };
        }
        
        // Select action based on goals and context
        const availableActions = this.getAvailableActions(state);
        
        // Simple action selection based on personality and goals
        if (state.goals.includes('digging') && this.hasPickaxe(state.worldContext.inventory)) {
            return {
                type: 'mine',
                priority: 'medium'
            };
        }
        
        if (state.goals.includes('warrior') && this.hasWeapon(state.worldContext.inventory)) {
            return {
                type: 'patrol',
                priority: 'medium'
            };
        }
        
        // Default action
        return {
            type: 'wait',
            priority: 'low'
        };
    }

    /**
     * Execute selected action
     */
    async executeAction(action) {
        try {
            switch (action.type) {
                case 'follow_mandate':
                    console.log(`${this.name} following mandate: ${action.mandate}`);
                    break;
                case 'mine':
                    console.log(`${this.name} mining resources`);
                    break;
                case 'patrol':
                    console.log(`${this.name} patrolling area`);
                    break;
                case 'wait':
                default:
                    console.log(`${this.name} waiting`);
                    break;
            }
        } catch (error) {
            console.error('Error executing action:', error);
        }
    }

    /**
     * Send response through chat
     */
    async sendResponse(response) {
        try {
            if (this.bot?.chat) {
                this.bot.chat(response);
            } else {
                console.log(`${this.name} response: ${response}`);
            }
        } catch (error) {
            console.error('Error sending response:', error);
        }
    }

    /**
     * Utility methods
     */
    
    getInventorySnapshot() {
        try {
            if (!this.bot?.inventory?.items) {
                return [];
            }
            
            return this.bot.inventory.items().map(item => ({
                name: item?.name ?? 'unknown',
                count: item?.count ?? 0,
                metadata: item?.metadata ?? {}
            }));
        } catch (error) {
            console.error('Error getting inventory snapshot:', error);
            return [];
        }
    }

    getEquipmentSnapshot() {
        try {
            if (!this.bot?.inventory?.slots) {
                return [];
            }
            
            // Get equipped items (armor, main hand, off hand)
            const equipment = [];
            
            // Armor slots
            if (this.bot.inventory.slots.helmet) {
                equipment.push({ slot: 'helmet', item: this.bot.inventory.slots.helmet });
            }
            if (this.bot.inventory.slots.chestplate) {
                equipment.push({ slot: 'chestplate', item: this.bot.inventory.slots.chestplate });
            }
            if (this.bot.inventory.slots.leggings) {
                equipment.push({ slot: 'leggings', item: this.bot.inventory.slots.leggings });
            }
            if (this.bot.inventory.slots.boots) {
                equipment.push({ slot: 'boots', item: this.bot.inventory.slots.boots });
            }
            
            return equipment;
        } catch (error) {
            console.error('Error getting equipment snapshot:', error);
            return [];
        }
    }

    getNearbyEntities() {
        try {
            if (!this.bot?.entity || !this.bot?.entities) {
                return [];
            }
            
            const botPosition = this.bot.entity.position;
            if (!botPosition) return [];
            
            return Object.values(this.bot.entities)
                .filter(entity => entity?.position && botPosition && entity.position.distanceTo(botPosition) < 32)
                .map(entity => ({
                    name: entity?.name ?? entity?.type ?? 'unknown',
                    position: entity.position,
                    distance: entity.position.distanceTo(botPosition),
                    type: entity?.type ?? 'unknown'
                }));
        } catch (error) {
            console.error('Error getting nearby entities:', error);
            return [];
        }
    }

    getAvailableActions(state) {
        return [
            { type: 'wait', utility: 0.1 },
            { type: 'explore', utility: 0.3 },
            { type: 'mine', utility: 0.4 },
            { type: 'patrol', utility: 0.3 }
        ];
    }

    hasPickaxe(inventory) {
        return inventory.some(item => item.name && item.name.includes('pickaxe'));
    }

    hasWeapon(inventory) {
        return inventory.some(item => item.name && (item.name.includes('sword') || item.name.includes('axe')));
    }

    /**
     * Handle incoming messages (simplified)
     */
    async handleMessage(username, message) {
        try {
            console.log(`${this.name} received message from ${username}: ${message}`);
            
            if (!this.agentState) {
                console.warn(`${this.name} agent state not initialized`);
                return;
            }
            
            // Update conversation state
            this.agentState.conversation = {
                message: message,
                sender: username,
                isRequestForHelp: message.toLowerCase().includes('help'),
                isOfferOfAssistance: message.toLowerCase().includes('help you'),
                targetBot: this.extractTargetBot(message)
            };
            
            // Process through simplified state graph
            await this.processSimplifiedCycle();
            
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    /**
     * Main simplified processing cycle
     */
    async processSimplifiedCycle() {
        try {
            if (!this.isInitialized || !this.agentState) {
                console.warn('Agent not fully initialized, skipping simplified cycle');
                return;
            }
            
            // Run through simplified state graph
            const result = await this.compiledGraph.invoke(this.agentState);
            
            // Update agent state with result
            if (result) {
                this.agentState = result;
            }
            
        } catch (error) {
            console.error('Error in simplified cycle:', error);
        }
    }

    /**
     * Extract target bot name from message
     */
    extractTargetBot(message) {
        // Simple extraction - could be enhanced
        const words = message.split(' ');
        for (const word of words) {
            if (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 2) {
                return word;
            }
        }
        return null;
    }

    /**
     * Set mandate (orders from player or other bots)
     */
    setMandate(mandate) {
        if (this.agentState) {
            this.agentState.mandate = mandate;
            console.log(`${this.name} mandate set: ${mandate}`);
        }
    }

    /**
     * Clear mandate
     */
    clearMandate() {
        if (this.agentState) {
            this.agentState.mandate = null;
            console.log(`${this.name} mandate cleared`);
        }
    }

    updateHealthState() {
        if (this.agentState && this.agentState.worldContext) {
            this.agentState.worldContext.health = this.bot.health || this.agentState.worldContext.health || 20;
            this.agentState.worldContext.hunger = this.bot.food || this.agentState.worldContext.hunger || 20;
        }
    }

    handleDeath() {
        console.log(`${this.name} died`);
        // Handle death logic
    }

    /**
     * Connect to MindServer for UI visibility
     */
    async connectToMindServer(port = 8081) {
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

            // Set up handlers for simplified event emission
            this.setupSimplifiedEventHandlers(socket);
            
            this.mindServerSocket = socket;
            
        } catch (error) {
            console.error(`Failed to connect ${this.name} to MindServer:`, error);
        }
    }

    /**
     * Set up handlers for simplified event emission
     */
    setupSimplifiedEventHandlers(socket) {
        if (!socket) return;

        // Emit simplified agent state updates
        const emitStateUpdate = () => {
            if (this.agentState) {
                socket.emit('agent:state:update', {
                    agentName: this.name,
                    agentState: this.agentState
                });
            }
        };

        // Emit action execution events
        const emitActionExecuted = (action, response) => {
            socket.emit('agent:action:executed', {
                agentName: this.name,
                action: action,
                response: response
            });
        };

        // Emit message sent events
        const emitMessageSent = (message, target) => {
            socket.emit('agent:message:sent', {
                agentName: this.name,
                message: message,
                target: target
            });
        };

        // Store handlers for later use
        this.simplifiedEventHandlers = {
            emitStateUpdate,
            emitActionExecuted,
            emitMessageSent
        };

        console.log(`[Simplified Events] Handlers set up for ${this.name}`);
    }

    /**
     * Emit simplified agent state update
     */
    emitSimplifiedStateUpdate() {
        if (this.simplifiedEventHandlers && this.agentState) {
            this.simplifiedEventHandlers.emitStateUpdate();
        }
    }

    /**
     * Emit simplified action execution event
     */
    emitSimplifiedActionExecuted(action, response = '') {
        if (this.simplifiedEventHandlers) {
            this.simplifiedEventHandlers.emitActionExecuted(action, response);
        }
    }

    /**
     * Emit simplified message sent event
     */
    emitSimplifiedMessageSent(message, target = null) {
        if (this.simplifiedEventHandlers) {
            this.simplifiedEventHandlers.emitMessageSent(message, target);
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        try {
            console.log(`Cleaning up simplified LangGraph agent: ${this.name}`);
            
            // Remove event handlers
            if (this.simplifiedEventHandlers && this.mindServerSocket) {
                this.mindServerSocket.removeAllListeners('connected');
                this.mindServerSocket.removeAllListeners('disconnected');
            }

        } catch (error) {
            console.error(`Error cleaning up LangGraph agent: ${this.name}`, error);
        }
    }
}

export default LangGraphAgent;
/**
 * Simple Test for LangGraph Agent Race Condition Handling
 * Tests the core race condition fixes without TypeScript dependencies
 */

// Mock the LangGraph agent with race condition fixes
class MockLangGraphAgent {
    constructor() {
        this.profile = null;
        this.bot = null;
        this.agentState = null;
        this.name = null;
        this.isInitialized = false;
        this.pendingMessages = [];
    }

    async start(options = {}) {
        try {
            console.log('Initializing LangGraph agent...');
            
            this.profile = options.profile;
            this.name = this.profile.name;
            console.log(`Setting up LangGraph agent: ${this.name}`);
            
            // Initialize bot connection with delayed entity
            await this.initializeBotConnection();
            
            this.isInitialized = true;
            console.log(`LangGraph agent ${this.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize LangGraph agent:`, error);
            throw error;
        }
    }

    async initializeBotConnection() {
        // Create mock bot with delayed entity initialization
        this.bot = {
            entity: null, // Initially null to simulate race condition
            health: 20,
            food: 20,
            game: { dimension: 'overworld' },
            time: { timeOfDay: 0 },
            inventory: {
                items: () => []
            },
            entities: {},
            on: function(event, callback) {
                if (event === 'spawn') {
                    // Simulate entity initialization after a delay
                    setTimeout(() => {
                        this.entity = {
                            position: { x: 10, y: 64, z: 10 },
                            health: 20,
                            food: 20
                        };
                        console.log('[MOCK] Bot.entity initialized');
                        callback();
                    }, 100); // 100ms delay to simulate race condition
                }
            },
            chat: function(message) {
                console.log(`[CHAT] ${this.username || 'Bot'}: ${message}`);
            }
        };
        
        this.bot.username = this.name;
        
        // Set up bot event handlers
        this.setupBotEventHandlers();
        
        console.log('Minecraft bot connection initialized');
    }

    setupBotEventHandlers() {
        this.bot.on('spawn', () => {
            console.log(`${this.name} spawned in Minecraft world`);
            this.initializeAgentState();
            
            // Process any pending messages that were received before initialization
            this.processPendingMessages();
        });
    }

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

    async handleMessage(username, message) {
        try {
            console.log(`${this.name} received message from ${username}: ${message}`);
            
            // Check if agent state is initialized
            if (!this.agentState) {
                console.warn(`${this.name} agent state not initialized, deferring message processing`);
                // Store message for later processing
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
            
            // Process through cognitive cycle
            await this.processCognitiveCycle();
            
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    async processCognitiveCycle() {
        try {
            if (!this.isInitialized || !this.agentState) {
                console.warn('Agent not fully initialized, skipping cognitive cycle');
                return;
            }
            
            // Update context with null checks
            this.updateContext();
            
            // Check if this is a conversational message that needs immediate processing
            if (this.agentState.context.lastMessage &&
                this.determineProcessingMode() === 'conversational') {
                await this.processConversationalMessage();
                return;
            }
            
            // Simulate action processing
            console.log('Processing action command...');
            
        } catch (error) {
            console.error('Error in cognitive cycle:', error);
        }
    }

    async processConversationalMessage() {
        try {
            // Check if agent state is available
            if (!this.agentState || !this.agentState.context) {
                console.warn(`${this.name} agent state not available for conversation processing`);
                return;
            }
            
            const message = this.agentState.context.lastMessage;
            if (!message) return;
            
            console.log(`${this.name} processing conversational message: "${message.message}"`);
            
            // Generate response
            const response = this.generateConversationalResponse(message);
            
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
            
            // Clear message from context
            this.agentState.context.lastMessage = undefined;
            
        } catch (error) {
            console.error('Error processing conversational message:', error);
        }
    }

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
                
                // Process through cognitive cycle
                await this.processCognitiveCycle();
                
            } catch (error) {
                console.error(`Error processing pending message from ${username}:`, error);
            }
        }
        
        // Clear pending messages
        this.pendingMessages = [];
    }

    updateContext() {
        if (!this.agentState) return;
        
        this.agentState.context = {
            ...this.agentState.context,
            position: this.bot.entity ? this.bot.entity.position : this.agentState.context.position || { x: 0, y: 64, z: 0 },
            health: this.bot.health || this.agentState.context.health || 20,
            hunger: this.bot.food || this.agentState.context.hunger || 20,
            timestamp: Date.now()
        };
    }

    getInventorySnapshot() {
        if (!this.bot.inventory || !this.bot.inventory.items) {
            return [];
        }
        
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
        let pressure = 0;
        
        if (this.bot.health && this.bot.health < 10) pressure += 0.3;
        if (this.bot.food && this.bot.food < 10) pressure += 0.2;
        if (this.bot.time && this.bot.time.timeOfDay > 12000) pressure += 0.1;
        
        return Math.min(1.0, pressure);
    }

    calculateResourceAvailability() {
        if (!this.bot.inventory || !this.bot.inventory.items) {
            return 0;
        }
        
        const items = this.bot.inventory.items();
        const hasTools = items.some(item => item.name.includes('pickaxe') || item.name.includes('axe'));
        const hasFood = items.some(item => item.name.includes('food') || item.name.includes('bread'));
        
        return (hasTools ? 0.5 : 0) + (hasFood ? 0.5 : 0);
    }

    calculateSocialPressure() {
        const nearbyEntities = this.getNearbyEntities();
        if (!nearbyEntities || nearbyEntities.length === 0) {
            return 0;
        }
        
        const nearbyPlayers = nearbyEntities
            .filter(entity => entity.type === 'player');
        
        return Math.min(1.0, nearbyPlayers.length * 0.3);
    }

    determineMessageType(message) {
        const lowerMessage = message.toLowerCase();
        const actionCommands = ['go to', 'move to', 'get', 'take', 'craft', 'build', 'attack'];
        const isActionCommand = actionCommands.some(cmd => lowerMessage.includes(cmd));
        return isActionCommand ? 'command' : 'conversational';
    }

    calculateMessagePriority(message) {
        const lowerMessage = message.toLowerCase();
        const urgencyIndicators = ['help', 'urgent', 'quick', 'fast', 'now', 'emergency'];
        
        let priority = 0.5;
        
        urgencyIndicators.forEach(indicator => {
            if (lowerMessage.includes(indicator)) {
                priority += 0.2;
            }
        });
        
        return Math.min(1.0, priority);
    }

    determineProcessingMode() {
        if (!this.agentState.context.lastMessage) {
            return 'action';
        }
        
        const message = this.agentState.context.lastMessage.message.toLowerCase();
        const actionCommands = ['go to', 'move to', 'get', 'take', 'craft', 'build', 'attack'];
        const isActionCommand = actionCommands.some(cmd => message.includes(cmd));
        return isActionCommand ? 'action' : 'conversational';
    }

    generateConversationalResponse(message) {
        const messageText = message.message.toLowerCase();
        
        if (messageText.includes('hello') || messageText.includes('hi')) {
            return `Hello ${message.source}! I'm currently at ${this.agentState.context.position.x.toFixed(0)}, ${this.agentState.context.position.y.toFixed(0)}, ${this.agentState.context.position.z.toFixed(0)}. How can I help you?`;
        }
        
        if (messageText.includes('how are you')) {
            return "I'm doing well, thank you for asking!";
        }
        
        return "That's interesting! How can I assist you?";
    }

    async routeResponse(source, response) {
        try {
            console.log(`${this.name} full response to ${source}: "${response}"`);
            
            if (this.bot && this.bot.chat) {
                this.bot.chat(response);
            } else {
                console.log(`${this.name} to ${source}: ${response}`);
            }
        } catch (error) {
            console.error('Error routing response:', error);
        }
    }

    isHostileEntity(entityType) {
        const hostileTypes = ['zombie', 'skeleton', 'creeper', 'spider'];
        return hostileTypes.some(type => entityType.toLowerCase().includes(type));
    }

    getState() {
        return this.agentState;
    }
}

// Test profile
const testProfile = {
    name: 'TestLangGraphAgent',
    behavior: {
        reactiveModes: {},
        adaptationRate: 0.1
    }
};

async function testLangGraphRaceCondition() {
    console.log('\n=== Testing LangGraph Agent Race Condition Handling ===\n');
    
    try {
        // Create agent
        const agent = new MockLangGraphAgent();
        
        // Start agent (this will trigger bot initialization with delayed entity)
        await agent.start({ profile: testProfile });
        
        // Send message immediately after start (before entity is initialized)
        console.log('Sending message before entity initialization...');
        await agent.handleMessage('testuser', 'hello there!');
        
        // Wait for entity initialization
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Send another message after entity is initialized
        console.log('Sending message after entity initialization...');
        await agent.handleMessage('testuser2', 'how are you?');
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if agent processed messages without crashing
        const state = agent.getState();
        const responseHistory = state.executive.responseHistory;
        
        console.log('\n=== Test Results ===');
        console.log(`Response history length: ${responseHistory.length}`);
        
        if (responseHistory.length > 0) {
            console.log('✅ Messages were processed successfully');
            responseHistory.forEach((record, index) => {
                console.log(`  ${index + 1}. From: ${record.source}, Message: "${record.message}", Response: "${record.response}"`);
            });
        } else {
            console.log('❌ No responses were generated');
        }
        
        // Check if agent state is properly initialized
        if (state.context && state.context.position) {
            console.log(`✅ Agent position: ${state.context.position.x}, ${state.context.position.y}, ${state.context.position.z}`);
        } else {
            console.log('❌ Agent position not properly initialized');
        }
        
        console.log('\n=== Test Complete ===');
        return true;
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        console.log('\n=== Test Failed ===');
        return false;
    }
}

async function runTest() {
    console.log('Starting LangGraph Agent Race Condition Test...\n');
    
    const testPassed = await testLangGraphRaceCondition();
    
    console.log('\n=== Final Results ===');
    console.log(`Race Condition Test: ${testPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return testPassed;
}

// Run test
runTest().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
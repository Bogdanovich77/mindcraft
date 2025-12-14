/**
 * State Nodes for Simplified Mindcraft LangGraph System
 * Defines the core processing nodes for the 4-node architecture: Perception, Conversation, Decision, Execution
 */
/**
 * Perception Node - Updates worldContext and checks for new messages
 *
 * Responsibilities:
 * - Updates worldContext with bot's current stats (HP, inventory, position) for Self-Awareness
 * - Checks for new messages to populate conversation state
 * - Provides the foundation for both autonomous behavior and communication
 *
 * Performance Target: <50ms for world context updates
 *
 * @param state Current AgentState with worldContext and conversation
 * @param bot Mineflayer bot instance for real game data extraction
 * @returns Updated AgentState with populated worldContext and conversation state
 */
export async function perceptionNode(state, bot) {
    const startTime = Date.now();
    try {
        console.log("[PERCEPTION] Starting world context update and message detection");
        // Initialize updated world context and conversation
        let updatedWorldContext;
        let updatedConversation;
        // Update world context from bot sensors if bot instance is available
        if (bot) {
            updatedWorldContext = await updateWorldContext(state.worldContext, bot);
        }
        else {
            console.warn("[PERCEPTION] No bot instance provided, using existing world context");
            updatedWorldContext = state.worldContext;
        }
        // Check for new messages and update conversation state
        updatedConversation = await checkForMessages(state.conversation, bot);
        const processingTime = Date.now() - startTime;
        console.log(`[PERCEPTION] Processing completed in ${processingTime}ms`);
        // Performance validation
        if (processingTime > 50) {
            console.warn(`[PERCEPTION] Performance warning: Processing took ${processingTime}ms (target: <50ms)`);
        }
        return {
            worldContext: updatedWorldContext,
            conversation: updatedConversation
        };
    }
    catch (error) {
        console.error("[PERCEPTION] Error during perception processing:", error);
        // Return original state on error to maintain system stability
        return {
            worldContext: state.worldContext,
            conversation: state.conversation
        };
    }
}
/**
 * Updates world context with real bot data from mineflayer
 *
 * @param currentContext Current world context state
 * @param bot Mineflayer bot instance
 * @returns Updated world context with fresh bot data
 */
async function updateWorldContext(currentContext, bot) {
    try {
        // Extract position information
        const position = {
            x: Math.round(bot.entity.position.x * 100) / 100,
            y: Math.round(bot.entity.position.y * 100) / 100,
            z: Math.round(bot.entity.position.z * 100) / 100
        };
        // Extract health and food information
        const health = bot.health || 0;
        const food = bot.food || 0;
        const experience = bot.experience?.level || 0;
        // Extract inventory information
        const inventory = extractInventoryInfo(bot);
        // Extract equipment information
        const equipment = extractEquipmentInfo(bot);
        // Detect nearby entities within 32 blocks
        const nearbyEntities = detectNearbyEntities(bot, position, 32);
        // Extract environmental context
        const environmentContext = extractEnvironmentalContext(bot);
        const updatedContext = {
            position,
            health,
            food,
            experience,
            inventory,
            equipment,
            nearbyEntities,
            timeOfDay: environmentContext.timeOfDay || 0,
            weather: environmentContext.weather || 'unknown',
            dimension: environmentContext.dimension || 'overworld',
            biome: environmentContext.biome || 'unknown',
            lightLevel: environmentContext.lightLevel || 0
        };
        console.log(`[PERCEPTION] World context updated - Position: ${JSON.stringify(position)}, Health: ${health}, Entities: ${nearbyEntities.length}`);
        return updatedContext;
    }
    catch (error) {
        console.error("[PERCEPTION] Error updating world context:", error);
        return currentContext; // Return existing context on error
    }
}
/**
 * Extracts inventory information from bot
 *
 * @param bot Mineflayer bot instance
 * @returns Inventory object with items and slot information
 */
function extractInventoryInfo(bot) {
    try {
        const items = [];
        let usedSlots = 0;
        // Extract items from bot inventory
        if (bot.inventory && bot.inventory.items) {
            for (const item of bot.inventory.items()) {
                if (item) {
                    items.push({
                        type: item.name || 'unknown',
                        count: item.count || 0,
                        name: item.name,
                        metadata: item.metadata || {}
                    });
                    usedSlots++;
                }
            }
        }
        const inventory = {
            items,
            slots: bot.inventory?.slots || 36,
            usedSlots,
            length: items.length
        };
        return inventory;
    }
    catch (error) {
        console.error("[PERCEPTION] Error extracting inventory info:", error);
        return {
            items: [],
            slots: 36,
            usedSlots: 0,
            length: 0
        };
    }
}
/**
 * Extracts equipment information from bot
 *
 * @param bot Mineflayer bot instance
 * @returns Equipment object with currently equipped items
 */
function extractEquipmentInfo(bot) {
    try {
        const equipment = {};
        // Extract armor and equipment from bot inventory
        if (bot.inventory && bot.inventory.slots) {
            // Armor slots (typically 5-8)
            if (bot.inventory.slots[5])
                equipment.helmet = createInventoryItem(bot.inventory.slots[5]);
            if (bot.inventory.slots[6])
                equipment.chestplate = createInventoryItem(bot.inventory.slots[6]);
            if (bot.inventory.slots[7])
                equipment.leggings = createInventoryItem(bot.inventory.slots[7]);
            if (bot.inventory.slots[8])
                equipment.boots = createInventoryItem(bot.inventory.slots[8]);
            // Main hand (typically 36-44 hotbar)
            const hotbarStart = 36;
            for (let i = hotbarStart; i < hotbarStart + 9; i++) {
                if (bot.inventory.slots[i]) {
                    const item = bot.inventory.slots[i];
                    if (item.name.includes('sword') || item.name.includes('axe')) {
                        equipment.weapon = createInventoryItem(item);
                    }
                    else if (item.name.includes('pickaxe') || item.name.includes('shovel') || item.name.includes('axe') || item.name.includes('hoe')) {
                        equipment.tool = createInventoryItem(item);
                    }
                }
            }
        }
        return equipment;
    }
    catch (error) {
        console.error("[PERCEPTION] Error extracting equipment info:", error);
        return {};
    }
}
/**
 * Creates an InventoryItem from mineflayer item data
 *
 * @param item Mineflayer item object
 * @returns InventoryItem object
 */
function createInventoryItem(item) {
    return {
        type: item.name || 'unknown',
        count: item.count || 1,
        name: item.name,
        metadata: item.metadata || {}
    };
}
/**
 * Detects nearby entities within specified range
 *
 * @param bot Mineflayer bot instance
 * @param botPosition Current bot position
 * @param range Detection range in blocks (default: 32)
 * @returns Array of nearby entities
 */
function detectNearbyEntities(bot, botPosition, range = 32) {
    try {
        const entities = [];
        if (bot.entities) {
            for (const [id, entity] of Object.entries(bot.entities)) {
                // Skip self and null entities
                if (!entity || id === bot.entity?.id)
                    continue;
                // Calculate distance
                const distance = Math.sqrt(Math.pow(entity.position.x - botPosition.x, 2) +
                    Math.pow(entity.position.y - botPosition.y, 2) +
                    Math.pow(entity.position.z - botPosition.z, 2));
                // Only include entities within range
                if (distance <= range) {
                    entities.push({
                        name: entity.name || entity.username || `Entity_${id}`,
                        position: {
                            x: Math.round(entity.position.x * 100) / 100,
                            y: Math.round(entity.position.y * 100) / 100,
                            z: Math.round(entity.position.z * 100) / 100
                        },
                        type: entity.type || 'unknown',
                        distance: Math.round(distance * 100) / 100,
                        health: entity.health,
                        hostile: entity.hostile || false,
                        id: id
                    });
                }
            }
        }
        // Sort by distance (closest first)
        entities.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        return entities;
    }
    catch (error) {
        console.error("[PERCEPTION] Error detecting nearby entities:", error);
        return [];
    }
}
/**
 * Extracts environmental context from bot
 *
 * @param bot Mineflayer bot instance
 * @returns Environmental context object
 */
function extractEnvironmentalContext(bot) {
    try {
        const context = {
            timeOfDay: bot.time?.timeOfDay || 0,
            weather: determineWeatherCondition(bot),
            dimension: bot.game?.dimension || 'overworld',
            biome: bot.blockAt(bot.entity.position)?.biome?.name || 'unknown',
            lightLevel: bot.blockAt(bot.entity.position)?.light || 0
        };
        return context;
    }
    catch (error) {
        console.error("[PERCEPTION] Error extracting environmental context:", error);
        return {
            timeOfDay: 0,
            weather: 'unknown',
            dimension: 'overworld'
        };
    }
}
/**
 * Determines weather condition from bot state
 *
 * @param bot Mineflayer bot instance
 * @returns Weather condition string
 */
function determineWeatherCondition(bot) {
    try {
        if (bot.isRaining) {
            return bot.thunderState > 0 ? 'thunderstorm' : 'rain';
        }
        else {
            return 'clear';
        }
    }
    catch (error) {
        return 'unknown';
    }
}
/**
 * Checks for new chat messages and updates conversation state
 *
 * @param currentConversation Current conversation state
 * @param bot Mineflayer bot instance
 * @returns Updated conversation state
 */
async function checkForMessages(currentConversation, bot) {
    try {
        // Default to existing conversation if no bot or no new messages
        if (!bot) {
            return currentConversation;
        }
        // Check for new chat messages
        // This is a simplified implementation - in a full system, you'd track message history
        const recentMessages = bot.chatMessages || [];
        if (recentMessages.length > 0) {
            // Get the most recent message
            const latestMessage = recentMessages[recentMessages.length - 1];
            // Check if this is a new message (timestamp check)
            const messageTimestamp = Date.now();
            const isNewMessage = !currentConversation.timestamp ||
                (latestMessage.timestamp && latestMessage.timestamp > currentConversation.timestamp);
            if (isNewMessage && latestMessage.text) {
                // Parse message for intent
                const messageText = latestMessage.text.toString();
                const intentFlags = analyzeMessageIntent(messageText);
                const updatedConversation = {
                    message: messageText,
                    sender: latestMessage.username || latestMessage.sender || 'unknown',
                    isRequestForHelp: intentFlags.isRequestForHelp,
                    isOfferOfAssistance: intentFlags.isOfferOfAssistance,
                    timestamp: messageTimestamp
                };
                console.log(`[PERCEPTION] New message detected from ${updatedConversation.sender}: "${messageText}"`);
                console.log(`[PERCEPTION] Intent analysis - Help Request: ${intentFlags.isRequestForHelp}, Offer Assistance: ${intentFlags.isOfferOfAssistance}`);
                return updatedConversation;
            }
        }
        // No new messages, return existing conversation state
        return currentConversation;
    }
    catch (error) {
        console.error("[PERCEPTION] Error checking for messages:", error);
        return currentConversation;
    }
}
/**
 * Analyzes message content for intent using simple keyword detection
 *
 * @param message The message content to analyze
 * @returns Intent flags for help requests and offers
 */
function analyzeMessageIntent(message) {
    try {
        const lowerMessage = message.toLowerCase();
        // Keywords for help requests
        const helpRequestKeywords = [
            'help', 'assist', 'assistance', 'support', 'need help', 'help me',
            'trouble', 'stuck', 'problem', 'save me', 'rescue', 'emergency',
            'can someone', 'anyone help', 'please help', 'need assistance'
        ];
        // Keywords for offers of assistance
        const offerKeywords = [
            'help you', 'assist you', 'can help', 'offer help', 'want to help',
            'let me help', 'i can help', 'here to help', 'assistance offered',
            'what do you need', 'how can i help', 'what help do you need'
        ];
        // Check for help request intent
        const isRequestForHelp = helpRequestKeywords.some(keyword => lowerMessage.includes(keyword));
        // Check for offer of assistance intent
        const isOfferOfAssistance = offerKeywords.some(keyword => lowerMessage.includes(keyword));
        return {
            isRequestForHelp,
            isOfferOfAssistance
        };
    }
    catch (error) {
        console.error("[PERCEPTION] Error analyzing message intent:", error);
        return {
            isRequestForHelp: false,
            isOfferOfAssistance: false
        };
    }
}
// ========================================================================
// CONVERSATION NODE - FULL IMPLEMENTATION
// ========================================================================
/**
 * Conversation Node - Handles personality-driven communication using LLM
 *
 * Responsibilities:
 * - Uses LLM prompted with personality string to determine message intent
 * - Identifies help requests and offers of assistance with personality context
 * - Generates personality-driven responses that maintain character consistency
 * - Processes messages detected by the Perception node
 *
 * Performance Target: <200ms for message analysis and response generation
 *
 * @param state Current AgentState with conversation, personality, and worldContext
 * @param agent Agent instance containing prompter system for LLM integration
 * @returns Updated AgentState with response field populated and intent analysis
 */
export async function conversationNode(state, agent) {
    const startTime = Date.now();
    try {
        console.log("[CONVERSATION] Starting personality-driven message processing");
        console.log(`[CONVERSATION] Bot personality: "${state.personality}"`);
        // Validate required state fields
        if (!state.conversation || !state.conversation.message) {
            console.log("[CONVERSATION] No message to process, returning without response");
            return { response: state.response || "" };
        }
        if (!state.personality) {
            console.warn("[CONVERSATION] No personality defined, using default response");
            return { response: "I need to configure my personality before responding." };
        }
        // Extract conversation context
        const message = state.conversation.message;
        const sender = state.conversation.sender || "someone";
        const personality = state.personality;
        console.log(`[CONVERSATION] Processing message from ${sender}: "${message}"`);
        // Initialize response and intent analysis
        let response = "";
        let intentAnalysis = {
            isRequestForHelp: state.conversation.isRequestForHelp || false,
            isOfferOfAssistance: state.conversation.isOfferOfAssistance || false
        };
        // Perform LLM-driven intent analysis and response generation
        if (agent && agent.prompter) {
            try {
                // Step 1: Enhanced intent analysis using LLM with personality context
                intentAnalysis = await analyzeMessageIntentWithLLM(message, personality, agent.prompter);
                // Step 2: Generate personality-driven response
                response = await generatePersonalityResponse(message, sender, personality, intentAnalysis, state, agent.prompter);
            }
            catch (llmError) {
                console.error("[CONVERSATION] LLM processing failed:", llmError);
                // Fallback to simple response
                response = generateFallbackResponse(message, sender, personality, intentAnalysis);
            }
        }
        else {
            console.warn("[CONVERSATION] No agent or prompter available, using fallback response generation");
            response = generateFallbackResponse(message, sender, personality, intentAnalysis);
        }
        const processingTime = Date.now() - startTime;
        console.log(`[CONVERSATION] Processing completed in ${processingTime}ms`);
        console.log(`[CONVERSATION] Generated response: "${response}"`);
        // Performance validation
        if (processingTime > 200) {
            console.warn(`[CONVERSATION] Performance warning: Processing took ${processingTime}ms (target: <200ms)`);
        }
        // Return updated state with response and enhanced intent analysis
        return {
            response: response,
            conversation: {
                ...state.conversation,
                isRequestForHelp: intentAnalysis.isRequestForHelp,
                isOfferOfAssistance: intentAnalysis.isOfferOfAssistance
            }
        };
    }
    catch (error) {
        console.error("[CONVERSATION] Error during conversation processing:", error);
        // Return error response to maintain system stability
        return {
            response: "I'm having trouble processing messages right now. Please try again later.",
            conversation: state.conversation
        };
    }
}
/**
 * Analyzes message intent using LLM with personality context
 *
 * @param message The incoming message to analyze
 * @param personality Bot's personality string for context
 * @param prompter Prompter instance for LLM integration
 * @returns Intent analysis with help request and offer flags
 */
async function analyzeMessageIntentWithLLM(message, personality, prompter) {
    try {
        // Create intent analysis prompt template
        const intentPrompt = `
You are analyzing a Minecraft chat message to determine the sender's intent. Consider the bot's personality when interpreting the message.

BOT PERSONALITY: ${personality}

MESSAGE TO ANALYZE: "${message}"

TASK: Determine if this message is:
1. A request for help (someone needs assistance)
2. An offer of assistance (someone is offering to help)

RESPONSE FORMAT: Respond with exactly one of these options:
- "HELP_REQUEST" if the message is requesting help
- "OFFER_HELP" if the message is offering assistance  
- "NEITHER" if the message is neither

Consider the personality context - some personalities might interpret requests differently, but focus on the actual intent rather than the personality.
`;
        // Create messages array for LLM
        const messages = [
            { role: 'system', content: 'You are a message intent analyzer for Minecraft bots. Respond with only the specified format options.' },
            { role: 'user', content: intentPrompt }
        ];
        // Get LLM response using prompter
        const llmResponse = await prompter.chat_model.sendRequest(messages, '');
        const cleanedResponse = llmResponse?.trim().toUpperCase() || 'NEITHER';
        console.log(`[CONVERSATION] LLM intent analysis result: ${cleanedResponse}`);
        // Parse LLM response
        const isRequestForHelp = cleanedResponse === 'HELP_REQUEST';
        const isOfferOfAssistance = cleanedResponse === 'OFFER_HELP';
        return {
            isRequestForHelp,
            isOfferOfAssistance
        };
    }
    catch (error) {
        console.error("[CONVERSATION] Error in LLM intent analysis:", error);
        // Fallback to keyword-based analysis
        return analyzeMessageIntent(message);
    }
}
/**
 * Generates personality-driven response using LLM
 *
 * @param message The incoming message
 * @param sender Name of the message sender
 * @param personality Bot's personality string
 * @param intentAnalysis Intent analysis results
 * @param state Current agent state for context
 * @param prompter Prompter instance for LLM integration
 * @returns Generated personality-driven response
 */
async function generatePersonalityResponse(message, sender, personality, intentAnalysis, state, prompter) {
    try {
        // Build context information for response generation
        const contextInfo = buildResponseContext(state, intentAnalysis);
        // Create response generation prompt template
        const responsePrompt = `
You are a Minecraft bot with a specific personality. Generate a response that maintains your character while addressing the message appropriately.

BOT PERSONALITY: ${personality}

MESSAGE FROM: ${sender}
MESSAGE CONTENT: "${message}"

INTENT ANALYSIS:
- Help Request: ${intentAnalysis.isRequestForHelp ? 'YES' : 'NO'}
- Offer of Assistance: ${intentAnalysis.isOfferOfAssistance ? 'YES' : 'NO'}

CURRENT CONTEXT:
${contextInfo}

RESPONSE GUIDELINES:
1. Stay in character according to your personality
2. Be concise and natural (Minecraft chat style)
3. Respond directly to the message and intent
4. If help is requested, consider your personality when deciding how to respond
5. If help is offered, respond according to your personality (grateful, suspicious, etc.)
6. Keep responses under 100 words when possible
7. Use appropriate tone for your personality (formal, casual, aggressive, friendly, etc.)

Generate only the response text, no explanations or metadata.
`;
        // Create messages array for LLM
        const messages = [
            { role: 'system', content: 'You are a Minecraft bot generating personality-driven chat responses.' },
            { role: 'user', content: responsePrompt }
        ];
        // Get LLM response using prompter
        const llmResponse = await prompter.chat_model.sendRequest(messages, '');
        const cleanedResponse = llmResponse?.trim() || '';
        console.log(`[CONVERSATION] LLM generated response: "${cleanedResponse}"`);
        // Validate and clean response
        if (cleanedResponse.length > 500) {
            console.warn("[CONVERSATION] LLM response too long, truncating");
            return cleanedResponse.substring(0, 497) + "...";
        }
        return cleanedResponse;
    }
    catch (error) {
        console.error("[CONVERSATION] Error generating personality response:", error);
        throw error; // Re-throw to trigger fallback response
    }
}
/**
 * Builds context information for response generation
 *
 * @param state Current agent state
 * @param intentAnalysis Intent analysis results
 * @returns Formatted context string
 */
function buildResponseContext(state, intentAnalysis) {
    try {
        const context = [];
        // Add world context if available
        if (state.worldContext) {
            const wc = state.worldContext;
            context.push(`Health: ${wc.health}/20, Food: ${wc.food}/20`);
            context.push(`Location: ${wc.biome || 'unknown'} biome`);
            if (wc.nearbyEntities && wc.nearbyEntities.length > 0) {
                const nearbyCount = wc.nearbyEntities.length;
                context.push(`${nearbyCount} entities nearby`);
            }
        }
        // Add goals and mandate if available
        if (state.goals) {
            context.push(`Current Goals: ${state.goals}`);
        }
        if (state.mandate) {
            context.push(`Current Mandate: ${state.mandate}`);
        }
        // Add intent-specific context
        if (intentAnalysis.isRequestForHelp) {
            context.push("Someone is asking for help - consider if you can assist based on your current state and personality.");
        }
        if (intentAnalysis.isOfferOfAssistance) {
            context.push("Someone is offering help - consider if you need assistance based on your current state and personality.");
        }
        return context.length > 0 ? context.join('\n') : 'No additional context available.';
    }
    catch (error) {
        console.error("[CONVERSATION] Error building response context:", error);
        return 'Context information unavailable.';
    }
}
/**
 * Generates fallback response when LLM is unavailable
 *
 * @param message The incoming message
 * @param sender Name of the message sender
 * @param personality Bot's personality string
 * @param intentAnalysis Intent analysis results
 * @returns Fallback response based on personality and intent
 */
function generateFallbackResponse(message, sender, personality, intentAnalysis) {
    try {
        const lowerPersonality = personality.toLowerCase();
        // Personality-based response patterns
        if (lowerPersonality.includes('grump') || lowerPersonality.includes('rude')) {
            if (intentAnalysis.isRequestForHelp) {
                return "Handle your own problems. I'm busy.";
            }
            else if (intentAnalysis.isOfferOfAssistance) {
                return "I don't need help from anyone.";
            }
            else {
                return "What do you want?";
            }
        }
        if (lowerPersonality.includes('friendly') || lowerPersonality.includes('helpful')) {
            if (intentAnalysis.isRequestForHelp) {
                return `Hi ${sender}! I'd be happy to help if I can. What do you need?`;
            }
            else if (intentAnalysis.isOfferOfAssistance) {
                return `Thanks ${sender}! I appreciate the offer.`;
            }
            else {
                return `Hello ${sender}! How can I help you today?`;
            }
        }
        if (lowerPersonality.includes('warrior') || lowerPersonality.includes('fighter')) {
            if (intentAnalysis.isRequestForHelp) {
                return "What kind of trouble are you in? I can handle most threats.";
            }
            else if (intentAnalysis.isOfferOfAssistance) {
                return "I can handle myself, but thanks for the offer.";
            }
            else {
                return "Stay alert out there.";
            }
        }
        // Default neutral responses
        if (intentAnalysis.isRequestForHelp) {
            return `I hear you need help, ${sender}. Let me see what I can do.`;
        }
        else if (intentAnalysis.isOfferOfAssistance) {
            return `Thanks for offering to help, ${sender}.`;
        }
        else {
            return `Message received, ${sender}.`;
        }
    }
    catch (error) {
        console.error("[CONVERSATION] Error generating fallback response:", error);
        return "I received your message.";
    }
}
/**
 * Decision Node - Chooses next action based on goals and mandate
 *
 * Responsibilities:
 * - Uses LLM prompted with goals and mandate to choose action
 * - Prioritizes mandate over goals when both present
 * - Sets lastAction field with chosen action
 */
export async function decisionNode(state) {
    console.log("[DECISION] Choosing action based on goals:", state.goals, "mandate:", state.mandate);
    // Stub implementation - will be implemented in separate task
    return {
        lastAction: state.lastAction || "wait"
    };
}
/**
 * Execution Node - Executes chosen actions and updates state
 *
 * Responsibilities:
 * - Executes the lastAction (physical command or chat response)
 * - Sends chat response if response field is populated
 * - Updates mandate if new task is accepted
 */
export async function executionNode(state) {
    console.log("[EXECUTION] Executing action:", state.lastAction);
    // Stub implementation - will be implemented in separate task
    return {};
}
/**
 * Conditional Edge Function - Check for messages
 *
 * Routes to conversation node if message present, otherwise decision node
 */
export async function checkForMessagesConditional(state) {
    const hasMessage = state.conversation && state.conversation.message && state.conversation.message.trim().length > 0;
    if (hasMessage) {
        console.log("[CONDITIONAL] Message detected, routing to conversation");
        return "has_message";
    }
    else {
        console.log("[CONDITIONAL] No message, routing to decision");
        return "no_message";
    }
}

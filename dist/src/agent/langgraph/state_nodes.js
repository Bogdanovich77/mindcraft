/**
 * State Nodes for Mindcraft LangGraph System
 * Defines the core processing nodes: perception, analysis, planning, decision, execution, and reflection
 */
import { ProcessingPhase, InterruptPriority } from './interfaces.js';
/**
 * Perception Node - Gather and process sensory information from the world
 */
export async function perceptionNode(state) {
    const startTime = Date.now();
    try {
        // Update world context from mineflayer bot
        const updatedContext = await updateWorldContext(state.context);
        // Process sensory information
        const sensoryData = await processSensoryInput(updatedContext);
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.PERCEPTION;
        state.cognitive.processing.cognitiveLoad = calculateCognitiveLoad(sensoryData);
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.PERCEPTION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: true,
            details: {
                entitiesProcessed: sensoryData.entities.length,
                blocksProcessed: sensoryData.blocks.length,
                contextUpdates: sensoryData.updates.length
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            context: updatedContext,
            cognitive: {
                ...state.cognitive,
                processing: state.cognitive.processing
            }
        };
    }
    catch (error) {
        console.error('[PERCEPTION] Error during perception processing:', error);
        // Record failed processing
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.PERCEPTION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
/**
 * Analysis Node - Analyze the perceived information and identify patterns/opportunities
 */
export async function analysisNode(state) {
    const startTime = Date.now();
    try {
        // Analyze current situation
        const situationAnalysis = await analyzeSituation(state);
        // Identify opportunities and threats
        const opportunities = await identifyOpportunities(state.context, situationAnalysis);
        const threats = await identifyThreats(state.context, situationAnalysis);
        // Update working memory with analysis results
        state.cognitive.memory.working.currentFocus = situationAnalysis.primaryFocus;
        state.cognitive.memory.working.activeTasks = opportunities.map(opp => opp.id);
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.ANALYSIS;
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.ANALYSIS,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: true,
            details: {
                opportunitiesFound: opportunities.length,
                threatsIdentified: threats.length,
                primaryFocus: situationAnalysis.primaryFocus
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            cognitive: {
                ...state.cognitive,
                memory: {
                    ...state.cognitive.memory,
                    working: state.cognitive.memory.working
                },
                processing: state.cognitive.processing
            }
        };
    }
    catch (error) {
        console.error('[ANALYSIS] Error during analysis processing:', error);
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.ANALYSIS,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
/**
 * Planning Node - Create and update action plans based on goals and current situation
 */
export async function planningNode(state) {
    const startTime = Date.now();
    try {
        // Review and prioritize goals
        const prioritizedGoals = await prioritizeGoals(state.cognitive.goals, state.context);
        // Generate action plans for top priority goals
        const actionPlans = await generateActionPlans(prioritizedGoals.slice(0, 3), state);
        // Update goal state
        state.cognitive.goals.activeGoals = prioritizedGoals.filter(g => g.status === 'active');
        // Queue actions for execution
        const newActions = actionPlans.flatMap(plan => plan.actions);
        state.executive.actionQueue = [...state.executive.actionQueue, ...newActions];
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.PLANNING;
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.PLANNING,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: true,
            details: {
                goalsPrioritized: prioritizedGoals.length,
                plansGenerated: actionPlans.length,
                actionsQueued: newActions.length
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            cognitive: {
                ...state.cognitive,
                goals: state.cognitive.goals,
                processing: state.cognitive.processing
            },
            executive: {
                ...state.executive,
                actionQueue: state.executive.actionQueue
            }
        };
    }
    catch (error) {
        console.error('[PLANNING] Error during planning processing:', error);
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.PLANNING,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
/**
 * Decision Node - Evaluate options and make decisions about next actions
 */
export async function decisionNode(state) {
    const startTime = Date.now();
    try {
        // Get available actions from queue
        const availableActions = state.executive.actionQueue.slice(0, 5); // Consider top 5 actions
        // Evaluate each action
        const decisionOptions = await Promise.all(availableActions.map(async (action) => {
            const utility = await calculateActionUtility(action, state);
            const risk = await assessActionRisk(action, state);
            const outcome = await predictActionOutcome(action, state);
            return {
                action: action.id,
                utility,
                risk,
                expectedOutcome: outcome,
                reasoning: `Utility: ${utility.toFixed(2)}, Risk: ${risk.toFixed(2)}`
            };
        }));
        // Select best action
        const selectedOption = decisionOptions.reduce((best, current) => current.utility > best.utility ? current : best);
        // Record decision
        const decisionRecord = {
            timestamp: Date.now(),
            context: state.context,
            options: decisionOptions,
            selected: selectedOption.action,
            reasoning: selectedOption.reasoning,
            outcome: selectedOption.expectedOutcome,
            confidence: Math.max(0, 1 - selectedOption.risk)
        };
        state.executive.decisionHistory.push(decisionRecord);
        // Set current action
        const selectedAction = availableActions.find(a => a.id === selectedOption.action);
        if (selectedAction) {
            state.executive.currentAction = selectedAction;
            selectedAction.status = 'executing';
            selectedAction.startTime = Date.now();
        }
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.DECISION;
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.DECISION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: true,
            details: {
                optionsEvaluated: decisionOptions.length,
                selectedUtility: selectedOption.utility,
                selectedRisk: selectedOption.risk
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            executive: {
                ...state.executive,
                currentAction: state.executive.currentAction,
                decisionHistory: state.executive.decisionHistory
            },
            cognitive: {
                ...state.cognitive,
                processing: state.cognitive.processing
            }
        };
    }
    catch (error) {
        console.error('[DECISION] Error during decision processing:', error);
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.DECISION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
/**
 * Execution Node - Execute the selected action
 */
export async function executionNode(state) {
    const startTime = Date.now();
    try {
        if (!state.executive.currentAction) {
            console.warn('[EXECUTION] No current action to execute');
            return state;
        }
        const action = state.executive.currentAction;
        // Execute the action
        const executionResult = await executeAction(action, state);
        // Update action status
        action.status = executionResult.success ? 'completed' : 'failed';
        action.endTime = Date.now();
        // Remove from queue
        state.executive.actionQueue = state.executive.actionQueue.filter(a => a.id !== action.id);
        // Update performance metrics
        const executionTime = Date.now() - startTime;
        state.executive.performanceMetrics.cognitiveProcessingTime.push(executionTime);
        // Keep only last 50 execution times
        if (state.executive.performanceMetrics.cognitiveProcessingTime.length > 50) {
            state.executive.performanceMetrics.cognitiveProcessingTime =
                state.executive.performanceMetrics.cognitiveProcessingTime.slice(-50);
        }
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.EXECUTION;
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.EXECUTION,
            startTime,
            endTime: Date.now(),
            duration: executionTime,
            success: executionResult.success,
            details: {
                actionId: action.id,
                actionType: action.type,
                result: executionResult.result
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            executive: {
                ...state.executive,
                currentAction: undefined,
                actionQueue: state.executive.actionQueue,
                performanceMetrics: state.executive.performanceMetrics
            },
            cognitive: {
                ...state.cognitive,
                processing: state.cognitive.processing
            }
        };
    }
    catch (error) {
        console.error('[EXECUTION] Error during action execution:', error);
        if (state.executive.currentAction) {
            state.executive.currentAction.status = 'failed';
            state.executive.currentAction.endTime = Date.now();
        }
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.EXECUTION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
/**
 * Reflection Node - Learn from experience and update internal models
 */
export async function reflectionNode(state) {
    const startTime = Date.now();
    try {
        // Analyze recent experiences
        const recentExperiences = await analyzeRecentExperiences(state);
        // Update memory systems
        await updateSemanticMemory(state, recentExperiences);
        await updateEpisodicMemory(state, recentExperiences);
        await updateProceduralMemory(state, recentExperiences);
        // Perform memory cleanup
        if (state.metadata && state.metadata.agentId) {
            checkMemoryUsage(state.metadata.agentId);
        }
        // Clean up episodic memory if needed
        if (state.cognitive && state.cognitive.memory && state.cognitive.memory.episodic && state.cognitive.memory.episodic.episodes) {
            state.cognitive.memory.episodic.episodes = cleanupEpisodicMemory(state.cognitive.memory.episodic.episodes, 100 // Keep max 100 episodes
            );
        }
        // Clean up working memory buffer if needed
        if (state.cognitive && state.cognitive.memory && state.cognitive.memory.working && state.cognitive.memory.working.buffer) {
            state.cognitive.memory.working.buffer = cleanupWorkingMemory(state.cognitive.memory.working.buffer, 50 // Keep max 50 buffer entries
            );
        }
        // Update skills based on experience
        await updateSkillProficiencies(state, recentExperiences);
        // Adjust personality and motivations based on experiences
        await updatePersonalityTraits(state, recentExperiences);
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.REFLECTION;
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.REFLECTION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: true,
            details: {
                experiencesAnalyzed: recentExperiences.length,
                memoryUpdates: recentExperiences.filter(e => e.memoryImpact > 0.5).length,
                skillUpdates: recentExperiences.filter(e => e.skillImpact > 0.5).length
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            cognitive: {
                ...state.cognitive,
                memory: state.cognitive.memory,
                skills: state.cognitive.skills,
                purpose: state.cognitive.purpose,
                processing: state.cognitive.processing
            }
        };
    }
    catch (error) {
        console.error('[REFLECTION] Error during reflection processing:', error);
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.REFLECTION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
/**
 * Emergency Response Node - Handle emergency interrupts
 */
export async function emergencyResponseNode(state) {
    const startTime = Date.now();
    try {
        const emergency = state.reactive.emergencyConditions[0]; // Get highest priority emergency
        if (!emergency) {
            return state;
        }
        // Execute emergency response
        const responseResult = await executeEmergencyResponse(emergency, state);
        // Record reactive action
        const reactiveAction = {
            mode: emergency.type,
            priority: getEmergencyPriority(emergency.type),
            timestamp: Date.now(),
            context: state.context,
            action: responseResult.action,
            result: (responseResult.success ? 'success' : 'failed')
        };
        state.reactive.lastReactiveAction = reactiveAction;
        // Update performance metrics
        const responseTime = Date.now() - startTime;
        state.executive.performanceMetrics.reactiveResponseTime.push(responseTime);
        // Keep only last 50 response times
        if (state.executive.performanceMetrics.reactiveResponseTime.length > 50) {
            state.executive.performanceMetrics.reactiveResponseTime =
                state.executive.performanceMetrics.reactiveResponseTime.slice(-50);
        }
        return {
            reactive: {
                ...state.reactive,
                lastReactiveAction: reactiveAction
            },
            executive: {
                ...state.executive,
                performanceMetrics: state.executive.performanceMetrics
            }
        };
    }
    catch (error) {
        console.error('[EMERGENCY] Error during emergency response:', error);
        return state;
    }
}
/**
 * Message Analysis Node - Analyze incoming messages to determine processing mode
 */
export async function messageAnalysisNode(state) {
    const startTime = Date.now();
    try {
        if (!state.context.lastMessage) {
            return state;
        }
        const message = state.context.lastMessage;
        // Analyze message to determine processing mode
        const analysis = await analyzeMessage(message, state);
        // Update executive state with processing mode
        state.executive.processingMode = analysis.processingMode;
        // Update working memory with conversation context
        if (analysis.processingMode === 'conversational') {
            state.cognitive.memory.working.currentFocus = 'conversation';
            state.cognitive.memory.working.activeTasks.push('process_conversation');
        }
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.ANALYSIS;
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.ANALYSIS,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: true,
            details: {
                messageType: message.type,
                processingMode: analysis.processingMode,
                isConversational: analysis.isConversational,
                confidence: analysis.confidence
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            executive: {
                ...state.executive,
                processingMode: state.executive.processingMode
            },
            cognitive: {
                ...state.cognitive,
                memory: {
                    ...state.cognitive.memory,
                    working: state.cognitive.memory.working
                },
                processing: state.cognitive.processing
            }
        };
    }
    catch (error) {
        console.error('[MESSAGE_ANALYSIS] Error during message analysis:', error);
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.ANALYSIS,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
/**
 * Conversation Processing Node - Generate conversational responses using prompter system
 */
export async function conversationProcessingNode(state, agent) {
    const startTime = Date.now();
    try {
        if (!state.context.lastMessage || state.executive.processingMode !== 'conversational') {
            return state;
        }
        const message = state.context.lastMessage;
        // Check for duplicate message to prevent infinite loops
        const recentMessages = state.executive.responseHistory || [];
        const isDuplicate = recentMessages.some(record => record.message === message.message &&
            record.source === message.source &&
            (Date.now() - record.timestamp) < 5000 // Within 5 seconds
        );
        if (isDuplicate) {
            console.log('[CONVERSATION_PROCESSING] Detected duplicate message, skipping processing');
            // Clear the message to prevent reprocessing
            state.context.lastMessage = undefined;
            return state;
        }
        console.log(`[CONVERSATION_PROCESSING] ${agent.name || 'Agent'} processing: "${message.message}"`);
        // Generate conversational response using agent's prompter
        let response;
        if (agent && agent.prompter) {
            try {
                // Build conversation history for prompter
                const history = agent.buildConversationHistory(state);
                // Use agent's prompter to generate response
                response = await agent.prompter.promptConvo(history);
                console.log(`[CONVERSATION_PROCESSING] ${agent.name || 'Agent'} generated response: "${response}"`);
            }
            catch (prompterError) {
                console.error('[CONVERSATION_PROCESSING] Error using prompter:', prompterError);
                response = 'I apologize, but I\'m having trouble processing that right now.';
            }
        }
        else {
            // Fallback to simple response generation
            const processingResult = await generateConversationalResponse(message, state);
            response = processingResult.response;
        }
        // Update executive state with response
        state.executive.conversationalResponse = response;
        // Record response in history
        const responseRecord = {
            source: message.source,
            message: message.message,
            response: response,
            timestamp: Date.now(),
            processingMode: 'conversational',
            responseTime: Date.now() - startTime,
            success: true
        };
        state.executive.responseHistory.push(responseRecord);
        state.executive.lastResponse = responseRecord;
        // Limit conversation history to prevent memory buildup
        if (state.executive.responseHistory.length > 100) {
            state.executive.responseHistory = state.executive.responseHistory.slice(-100);
        }
        // Update conversation context in episodic memory
        const processingResult = {
            response,
            processingTime: Date.now() - startTime,
            confidence: 0.8,
            personalityAlignment: 0.8,
            contextUpdated: true,
            followUpActions: []
        };
        await updateConversationContext(state, message, processingResult);
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.DECISION;
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.DECISION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: true,
            details: {
                responseType: 'conversational',
                confidence: processingResult.confidence,
                personalityAlignment: processingResult.personalityAlignment,
                responseTime: processingResult.processingTime
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            executive: {
                ...state.executive,
                conversationalResponse: state.executive.conversationalResponse,
                lastResponse: state.executive.lastResponse,
                responseHistory: state.executive.responseHistory
            },
            cognitive: {
                ...state.cognitive,
                memory: state.cognitive.memory,
                processing: state.cognitive.processing
            }
        };
    }
    catch (error) {
        console.error('[CONVERSATION_PROCESSING] Error during conversation processing:', error);
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.DECISION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
/**
 * Response Routing Node - Route responses back to users or continue with action processing
 */
export async function responseRoutingNode(state, agent) {
    const startTime = Date.now();
    try {
        // Check if we have a conversational response to send
        if (state.executive.conversationalResponse && state.executive.processingMode === 'conversational') {
            const lastResponse = state.executive.lastResponse;
            if (lastResponse && agent) {
                console.log(`[RESPONSE_ROUTING] ${agent.name || 'Agent'} sending response to ${lastResponse.source}: "${lastResponse.response}"`);
                // Use agent's routeResponse method to send the response
                await agent.routeResponse(lastResponse.source, lastResponse.response);
            }
            // Clear the conversational response after sending
            state.executive.conversationalResponse = undefined;
            // Clear the last message from context
            state.context.lastMessage = undefined;
        }
        // Update cognitive processing state
        state.cognitive.processing.currentPhase = ProcessingPhase.REFLECTION;
        // Store processing record
        const processingRecord = {
            phase: ProcessingPhase.REFLECTION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: true,
            details: {
                routedResponse: state.executive.lastResponse !== undefined,
                processingMode: state.executive.processingMode
            }
        };
        state.cognitive.processing.processingHistory.push(processingRecord);
        // Limit processing history to prevent memory buildup
        if (state.cognitive.processing.processingHistory.length > 100) {
            state.cognitive.processing.processingHistory = state.cognitive.processing.processingHistory.slice(-100);
        }
        return {
            context: state.context,
            executive: {
                ...state.executive,
                conversationalResponse: state.executive.conversationalResponse
            },
            cognitive: {
                ...state.cognitive,
                processing: state.cognitive.processing
            }
        };
    }
    catch (error) {
        console.error('[RESPONSE_ROUTING] Error during response routing:', error);
        state.cognitive.processing.processingHistory.push({
            phase: ProcessingPhase.REFLECTION,
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            success: false,
            details: { error: error instanceof Error ? error.message : String(error) }
        });
        return state;
    }
}
// ============================================================================
// CONVERSATION PROCESSING HELPER FUNCTIONS
// ============================================================================
async function analyzeMessage(message, state) {
    // Determine if message is conversational or action command
    const isActionCommand = checkIfActionCommand(message.message);
    const isConversational = !isActionCommand;
    // Extract intent and entities
    const extractedIntent = extractIntent(message.message);
    const entities = extractEntities(message.message);
    // Analyze emotional tone
    const emotionalTone = analyzeEmotionalTone(message.message);
    // Calculate urgency
    const urgency = calculateMessageUrgency(message.message);
    // Determine processing mode
    const processingMode = isConversational ? 'conversational' : 'action';
    // Calculate confidence in analysis
    const confidence = calculateAnalysisConfidence(message.message, isConversational);
    return {
        message: message.message,
        source: message.source,
        isConversational,
        isActionCommand,
        processingMode,
        confidence,
        extractedIntent,
        entities,
        emotionalTone,
        urgency
    };
}
async function generateConversationalResponse(message, state) {
    const startTime = Date.now();
    try {
        // Get the agent instance from the context (this would be passed in during node execution)
        // For now, we'll use the placeholder implementation but with better integration points
        // Add null checks for accessing state properties
        const personality = (state.cognitive && state.cognitive.purpose && state.cognitive.purpose.personality)
            ? state.cognitive.purpose.personality
            : { extraversion: 0.5, agreeableness: 0.5, conscientiousness: 0.5 };
        const context = state.context || { position: { x: 0, y: 64, z: 0 }, agentId: 'unknown' };
        // Build conversation history with null check
        const history = (state.executive && state.executive.responseHistory)
            ? state.executive.responseHistory.slice(-5)
            : []; // Last 5 conversations
        // Generate response based on personality and context
        // This will be overridden by the agent's prompter integration
        const response = await generatePersonalityBasedResponse(message, personality, context, history);
        const processingTime = Date.now() - startTime;
        // Calculate confidence and personality alignment
        const confidence = calculateResponseConfidence(response, message, personality);
        const personalityAlignment = calculatePersonalityAlignment(response, personality);
        // Determine if context was updated
        const contextUpdated = true; // Would be based on actual context changes
        return {
            response,
            processingTime,
            confidence,
            personalityAlignment,
            contextUpdated,
            followUpActions: extractFollowUpActions(response)
        };
    }
    catch (error) {
        console.error('Error generating conversational response:', error);
        return {
            response: 'I apologize, but I\'m having trouble processing that right now.',
            processingTime: Date.now() - startTime,
            confidence: 0.1,
            personalityAlignment: 0.1,
            contextUpdated: false
        };
    }
}
async function updateConversationContext(state, message, processingResult) {
    // Update episodic memory with conversation
    const conversationEntry = {
        id: `conv_${Date.now()}`,
        timestamp: Date.now(),
        source: message.source,
        message: message.message,
        response: processingResult.response,
        type: 'user',
        metadata: {
            confidence: processingResult.confidence,
            personalityAlignment: processingResult.personalityAlignment,
            processingTime: processingResult.processingTime
        }
    };
    // Add to episodic memory with null checks
    if (state.cognitive && state.cognitive.memory && state.cognitive.memory.episodic) {
        state.cognitive.memory.episodic.episodes.push({
            id: conversationEntry.id,
            timestamp: conversationEntry.timestamp,
            duration: processingResult.processingTime,
            location: state.context.position || { x: 0, y: 64, z: 0 },
            participants: [message.source, state.metadata ? state.metadata.agentId : 'unknown'],
            actions: [{
                    actor: state.metadata ? state.metadata.agentId : 'unknown',
                    action: 'respond',
                    target: message.source,
                    timestamp: Date.now(),
                    result: processingResult.response
                }],
            outcomes: [processingResult.response],
            emotionalImpact: calculateEmotionalImpact(processingResult.response),
            importance: calculateConversationImportance(message, processingResult),
            tags: ['conversation', 'social']
        });
    }
    // Update working memory with conversation context with null checks
    if (state.cognitive && state.cognitive.memory && state.cognitive.memory.working && state.cognitive.memory.working.buffer) {
        state.cognitive.memory.working.buffer.push({
            content: conversationEntry,
            type: 'conversation',
            timestamp: Date.now(),
            priority: 0.7
        });
    }
}
async function sendResponseToUser(state) {
    // This function is now handled directly in responseRoutingNode
    // Keeping this for backward compatibility but it's no longer used
    const lastResponse = state.executive.lastResponse;
    if (lastResponse) {
        console.log(`[ROUTING] Response ready for ${lastResponse.source}: "${lastResponse.response}"`);
    }
}
// ============================================================================
// CONVERSATION UTILITY FUNCTIONS
// ============================================================================
function checkIfActionCommand(message) {
    const actionCommands = [
        'go to', 'move to', 'walk to', 'run to',
        'get', 'take', 'pick up', 'collect',
        'craft', 'build', 'place', 'break',
        'attack', 'fight', 'defend',
        'follow', 'stop', 'wait',
        '!goal'
    ];
    const lowerMessage = message.toLowerCase();
    return actionCommands.some(cmd => lowerMessage.includes(cmd));
}
function extractIntent(message) {
    // Simple intent extraction
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return 'greeting';
    }
    if (message.toLowerCase().includes('help')) {
        return 'request_help';
    }
    if (message.toLowerCase().includes('how are you')) {
        return 'well_being_inquiry';
    }
    if (message.toLowerCase().includes('what are you doing')) {
        return 'activity_inquiry';
    }
    return 'general_conversation';
}
function extractEntities(message) {
    const entities = {};
    // Extract player names (simple pattern)
    const playerNames = message.match(/\b([A-Za-z0-9_]+)\b/g);
    if (playerNames) {
        entities.players = playerNames;
    }
    // Extract items/blocks (simple pattern)
    const items = ['wood', 'stone', 'iron', 'gold', 'diamond', 'sword', 'pickaxe'];
    const foundItems = items.filter(item => message.toLowerCase().includes(item));
    if (foundItems.length > 0) {
        entities.items = foundItems;
    }
    return entities;
}
function analyzeEmotionalTone(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('!') || lowerMessage.includes('help') || lowerMessage.includes('urgent')) {
        return 'urgent';
    }
    if (lowerMessage.includes('?')) {
        return 'inquisitive';
    }
    if (lowerMessage.includes('thank') || lowerMessage.includes('good')) {
        return 'positive';
    }
    if (lowerMessage.includes('sorry') || lowerMessage.includes('bad')) {
        return 'apologetic';
    }
    return 'neutral';
}
function calculateMessageUrgency(message) {
    const urgencyIndicators = ['help', 'urgent', 'quick', 'fast', 'now', 'emergency'];
    const lowerMessage = message.toLowerCase();
    let urgency = 0.1; // Base urgency
    urgencyIndicators.forEach(indicator => {
        if (lowerMessage.includes(indicator)) {
            urgency += 0.2;
        }
    });
    // Add urgency for exclamation marks
    const exclamationCount = (message.match(/!/g) || []).length;
    urgency += Math.min(0.3, exclamationCount * 0.1);
    return Math.min(1.0, urgency);
}
function calculateAnalysisConfidence(message, isConversational) {
    // Higher confidence for clear conversational messages
    if (isConversational && message.length > 5) {
        return 0.9;
    }
    if (isConversational && message.length > 2) {
        return 0.7;
    }
    // Lower confidence for very short or ambiguous messages
    return 0.5;
}
async function generatePersonalityBasedResponse(message, personality, context, history) {
    // This would integrate with the existing prompter system
    // For now, we'll create a simple personality-based response generator
    const traits = personality;
    const messageText = message.message.toLowerCase();
    // Generate responses based on personality traits
    if (traits.extraversion > 0.7) {
        if (messageText.includes('hello') || messageText.includes('hi')) {
            return `Hey there! Great to see you! I'm currently at ${context.position.x.toFixed(0)}, ${context.position.y.toFixed(0)}, ${context.position.z.toFixed(0)}. How's your day going?`;
        }
    }
    if (traits.agreeableness > 0.7) {
        if (messageText.includes('help')) {
            return "I'd be happy to help you! What do you need assistance with?";
        }
    }
    if (traits.conscientiousness > 0.7) {
        if (messageText.includes('what are you doing')) {
            return "I'm currently focused on my tasks and making sure everything is in order. Is there something specific you need help with?";
        }
    }
    // Default responses
    if (messageText.includes('hello') || messageText.includes('hi')) {
        return `Hello! I'm ${context.agentId || 'an agent'}. How can I help you today?`;
    }
    if (messageText.includes('how are you')) {
        return "I'm doing well, thank you for asking! Ready to help with whatever you need.";
    }
    if (messageText.includes('what are you doing')) {
        return "I'm currently exploring and working on my goals. What brings you here?";
    }
    // Generic response for other messages
    return "That's interesting! I'm here to help and learn. What would you like to do?";
}
function calculateResponseConfidence(response, message, personality) {
    // Higher confidence for longer, more contextual responses
    let confidence = 0.5;
    if (response.length > 20)
        confidence += 0.2;
    if (response.length > 50)
        confidence += 0.1;
    if (response.includes('?'))
        confidence += 0.1; // Engages with questions
    if (response.includes(message.source))
        confidence += 0.1; // Personalized
    return Math.min(1.0, confidence);
}
function calculatePersonalityAlignment(response, personality) {
    // Simple personality alignment calculation
    let alignment = 0.5;
    if (personality.extraversion > 0.7 && response.includes('!'))
        alignment += 0.2;
    if (personality.agreeableness > 0.7 && response.includes('help'))
        alignment += 0.2;
    if (personality.conscientiousness > 0.7 && response.length > 30)
        alignment += 0.2;
    return Math.min(1.0, alignment);
}
function extractFollowUpActions(response) {
    const actions = [];
    if (response.includes('help'))
        actions.push('offer_assistance');
    if (response.includes('explore'))
        actions.push('explore_area');
    if (response.includes('build'))
        actions.push('consider_building');
    if (response.includes('gather'))
        actions.push('gather_resources');
    return actions;
}
function calculateEmotionalImpact(response) {
    // Simple emotional impact calculation
    const positiveWords = ['great', 'good', 'happy', 'excellent', 'wonderful'];
    const negativeWords = ['bad', 'sad', 'sorry', 'unfortunately', 'problem'];
    const lowerResponse = response.toLowerCase();
    let impact = 0.5; // Neutral impact
    positiveWords.forEach(word => {
        if (lowerResponse.includes(word))
            impact += 0.1;
    });
    negativeWords.forEach(word => {
        if (lowerResponse.includes(word))
            impact -= 0.1;
    });
    return Math.max(0, Math.min(1, impact));
}
function calculateConversationImportance(message, processingResult) {
    let importance = 0.3; // Base importance
    // Higher importance for longer messages
    if (message.message.length > 20)
        importance += 0.2;
    if (message.message.length > 50)
        importance += 0.1;
    // Higher importance for urgent messages
    if (message.priority > 0.7)
        importance += 0.3;
    // Higher importance for high-confidence responses
    if (processingResult.confidence > 0.8)
        importance += 0.1;
    return Math.min(1.0, importance);
}
// ============================================================================
// HELPER FUNCTIONS (These would be implemented based on specific requirements)
// ============================================================================
async function updateWorldContext(context) {
    // This would interface with mineflayer to get current world state
    return context;
}
async function processSensoryInput(context) {
    // Process visual, auditory, and other sensory information
    return {
        entities: context.nearbyEntities,
        blocks: context.nearbyBlocks,
        updates: []
    };
}
function calculateCognitiveLoad(sensoryData) {
    // Calculate cognitive load based on sensory input complexity
    return Math.min(1.0, sensoryData.entities.length * 0.1 + sensoryData.blocks.length * 0.05);
}
async function analyzeSituation(state) {
    return {
        primaryFocus: 'survival',
        complexity: 0.5,
        opportunities: [],
        threats: []
    };
}
async function identifyOpportunities(context, analysis) {
    return [];
}
async function identifyThreats(context, analysis) {
    return [];
}
async function prioritizeGoals(goals, context) {
    return goals.activeGoals || [];
}
async function generateActionPlans(goals, state) {
    return goals.map(goal => ({
        goalId: goal.id,
        actions: []
    }));
}
async function calculateActionUtility(action, state) {
    return Math.random(); // Placeholder
}
async function assessActionRisk(action, state) {
    return Math.random(); // Placeholder
}
async function predictActionOutcome(action, state) {
    return 'success'; // Placeholder
}
async function executeAction(action, state) {
    return {
        success: true,
        result: 'completed'
    };
}
async function analyzeRecentExperiences(state) {
    return [];
}
async function updateSemanticMemory(state, experiences) {
    // Update semantic memory based on experiences
}
async function updateEpisodicMemory(state, experiences) {
    // Update episodic memory based on experiences
}
async function updateProceduralMemory(state, experiences) {
    // Update procedural memory based on experiences
}
async function updateSkillProficiencies(state, experiences) {
    // Update skill proficiencies based on experiences
}
async function updatePersonalityTraits(state, experiences) {
    // Update personality traits based on experiences
}
async function executeEmergencyResponse(emergency, state) {
    return {
        success: true,
        action: emergency.type + '_response'
    };
}
function getEmergencyPriority(emergencyType) {
    switch (emergencyType) {
        case 'drowning':
        case 'burning':
        case 'falling':
            return InterruptPriority.EMERGENCY;
        case 'low_health':
        case 'hostile_nearby':
            return InterruptPriority.SURVIVAL;
        case 'stuck':
            return InterruptPriority.OPPORTUNITY;
        default:
            return InterruptPriority.COGNITIVE;
    }
}
// ============================================================================
// MEMORY MANAGEMENT UTILITIES
// ============================================================================
/**
 * Check memory usage and perform cleanup if needed
 */
export function checkMemoryUsage(agentId = 'unknown') {
    const now = Date.now();
    // Check memory usage at regular intervals
    if (now - global.lastMemoryCheck > 30000) { // Every 30 seconds
        const currentMemory = process.memoryUsage();
        global.lastMemoryCheck = now;
        // Update peak memory if current is higher
        if (!global.peakMemory || currentMemory.heapUsed > global.peakMemory.heapUsed) {
            global.peakMemory = currentMemory;
        }
        // Log memory usage
        console.log(`[MEMORY] ${agentId} - Current: ${Math.round(currentMemory.heapUsed / 1024 / 1024)}MB, Peak: ${Math.round(global.peakMemory.heapUsed / 1024 / 1024)}MB`);
        // Trigger garbage collection if memory usage is high
        if (currentMemory.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
            console.log(`[MEMORY] High memory usage detected for ${agentId}, triggering garbage collection`);
            if (global.gc) {
                global.gc();
            }
        }
    }
}
/**
 * Perform memory cleanup tasks
 */
export function performMemoryCleanup(agentId = 'unknown') {
    try {
        console.log(`[MEMORY] Performing cleanup for ${agentId}`);
        // Trigger garbage collection if available
        if (global.gc) {
            global.gc();
            console.log(`[MEMORY] Garbage collection triggered for ${agentId}`);
        }
    }
    catch (error) {
        console.error(`[MEMORY] Error during cleanup for ${agentId}:`, error);
    }
}
/**
 * Get memory usage statistics
 */
export function getMemoryStats() {
    const currentMemory = process.memoryUsage();
    return {
        current: {
            heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024),
            heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024),
            external: Math.round(currentMemory.external / 1024 / 1024)
        },
        peak: {
            heapUsed: Math.round(global.peakMemory?.heapUsed / 1024 / 1024 || 0),
            heapTotal: Math.round(global.peakMemory?.heapTotal / 1024 / 1024 || 0)
        }
    };
}
/**
 * Initialize memory tracking
 */
export function initializeMemoryTracking() {
    global.lastMemoryCheck = Date.now();
    global.peakMemory = process.memoryUsage();
    console.log('[MEMORY] Memory tracking initialized');
}
/**
 * Clean up old episodic memories
 */
export function cleanupEpisodicMemory(episodes, maxEntries = 100) {
    if (episodes.length <= maxEntries) {
        return episodes;
    }
    // Keep the most recent episodes
    const sortedEpisodes = episodes.sort((a, b) => b.timestamp - a.timestamp);
    const keptEpisodes = sortedEpisodes.slice(0, maxEntries);
    console.log(`[MEMORY] Cleaned up episodic memory: ${episodes.length - keptEpisodes.length} old entries removed`);
    return keptEpisodes;
}
/**
 * Clean up old working memory buffer
 */
export function cleanupWorkingMemory(buffer, maxEntries = 50) {
    if (buffer.length <= maxEntries) {
        return buffer;
    }
    // Keep the most recent buffer entries
    const sortedBuffer = buffer.sort((a, b) => b.timestamp - a.timestamp);
    const keptBuffer = sortedBuffer.slice(0, maxEntries);
    console.log(`[MEMORY] Cleaned up working memory buffer: ${buffer.length - keptBuffer.length} old entries removed`);
    return keptBuffer;
}
// Initialize memory tracking on module load
initializeMemoryTracking();

/**
 * Test script to validate conversation-action context integration
 */

import { LangGraphAgent } from './src/agent/langgraph/agent.js';

async function testConversationActionContext() {
    console.log('\n=== Testing Conversation-Action Context Integration ===\n');
    
    try {
        // Create a test agent
        const agent = new LangGraphAgent();
        
        // Create a test profile with action context placeholders
        const testProfile = {
            name: 'TestBot',
            model: 'test',
            conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions: $RECENT_ACTIONS. Respond accordingly.',
            purposeCore: {
                personality: { traits: { openness: 0.5 } },
                motivations: ['explore'],
                values: ['curiosity'],
                ethics: { harmAvoidance: 0.8 }
            }
        };
        
        // Initialize agent with test profile
        await agent.start({ profile: testProfile });
        
        // Set up mock agent state with action context
        agent.agentState = {
            cognitive: {
                goals: {
                    activeGoals: [
                        {
                            description: 'Build a 50x50x3 wall',
                            progress: { percentage: 25 }
                        }
                    ]
                }
            },
            executive: {
                currentAction: {
                    type: 'build_wall',
                    parameters: { width: 50, height: 3, material: 'cobblestone' },
                    status: 'executing',
                    startTime: Date.now() - 30000 // Started 30 seconds ago
                },
                decisionHistory: [
                    {
                        timestamp: Date.now() - 60000,
                        action: 'collect_cobblestone',
                        outcome: 'success'
                    },
                    {
                        timestamp: Date.now() - 45000,
                        action: 'move_to_build_site',
                        outcome: 'success'
                    },
                    {
                        timestamp: Date.now() - 30000,
                        action: 'start_building_wall',
                        outcome: 'in_progress'
                    }
                ],
                responseHistory: []
            },
            context: {
                lastMessage: {
                    source: 'test_user',
                    message: 'What are you doing right now?',
                    timestamp: Date.now()
                }
            }
        };
        
        console.log('1. Testing action context placeholders...');
        
        // Test the buildConversationHistory method
        const history = agent.buildConversationHistory(agent.agentState);
        console.log('\n2. Built conversation history with action context:');
        console.log('System message:', history[0]?.content || 'No system message found');
        
        // Test the replaceStrings method with action context
        const testPrompt = 'Current Goal: $CURRENT_GOAL\nCurrent Action: $CURRENT_ACTION\nAction Progress: $ACTION_PROGRESS\nRecent Actions:\n$RECENT_ACTIONS';
        const processedPrompt = await agent.prompter.replaceStrings(testPrompt, history);
        
        console.log('\n3. Processed prompt with action context:');
        console.log(processedPrompt);
        
        // Test conversation processing
        console.log('\n4. Testing conversation processing...');
        await agent.processConversationalMessage();
        
        console.log('\n=== Test Complete ===\n');
        
    } catch (error) {
        console.error('Test failed:', error);
        console.log('\n=== Test Failed ===\n');
    }
}

// Run the test
testConversationActionContext();
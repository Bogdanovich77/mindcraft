/**
 * Simple test to validate action context placeholders in prompter
 */

import { readFileSync } from 'fs';
import { Prompter } from './src/models/prompter.js';

// Mock agent object with action context
const mockAgent = {
    name: 'TestBot',
    agentState: {
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
        }
    }
};

// Mock profile with action context placeholders
const mockProfile = {
    name: 'TestBot',
    model: 'openai/gpt-3.5-turbo',
    conversing: 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions:\n$RECENT_ACTIONS. Respond accordingly.'
};

async function testActionContextPlaceholders() {
    console.log('\n=== Testing Action Context Placeholders ===\n');
    
    try {
        // Create prompter instance
        const prompter = new Prompter(mockAgent, mockProfile);
        
        console.log('1. Testing $CURRENT_GOAL placeholder...');
        const testPrompt1 = 'Current Goal: $CURRENT_GOAL';
        const result1 = await prompter.replaceStrings(testPrompt1, []);
        console.log('Result:', result1);
        
        console.log('\n2. Testing $CURRENT_ACTION placeholder...');
        const testPrompt2 = 'Current Action: $CURRENT_ACTION';
        const result2 = await prompter.replaceStrings(testPrompt2, []);
        console.log('Result:', result2);
        
        console.log('\n3. Testing $ACTION_PROGRESS placeholder...');
        const testPrompt3 = 'Action Progress: $ACTION_PROGRESS';
        const result3 = await prompter.replaceStrings(testPrompt3, []);
        console.log('Result:', result3);
        
        console.log('\n4. Testing $RECENT_ACTIONS placeholder...');
        const testPrompt4 = 'Recent Actions:\n$RECENT_ACTIONS';
        const result4 = await prompter.replaceStrings(testPrompt4, []);
        console.log('Result:', result4);
        
        console.log('\n5. Testing combined prompt...');
        const testPrompt5 = 'You are $NAME. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions:\n$RECENT_ACTIONS. Respond accordingly.';
        const result5 = await prompter.replaceStrings(testPrompt5, []);
        console.log('Result:', result5);
        
        console.log('\n=== Test Complete ===\n');
        
    } catch (error) {
        console.error('Test failed:', error);
        console.log('\n=== Test Failed ===\n');
    }
}

// Run the test
testActionContextPlaceholders();
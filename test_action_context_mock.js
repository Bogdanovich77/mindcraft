/**
 * Mock test to validate action context placeholders without API dependencies
 */

// Mock the replaceStrings function directly to test our implementation
function mockReplaceStrings(prompt, agentState) {
    prompt = prompt.replaceAll('$NAME', 'TestBot');
    
    // Test new action context placeholders
    if (prompt.includes('$CURRENT_GOAL')) {
        let currentGoal = 'No active goal';
        if (agentState && agentState.cognitive && agentState.cognitive.goals && agentState.cognitive.goals.activeGoals && agentState.cognitive.goals.activeGoals.length > 0) {
            const activeGoal = agentState.cognitive.goals.activeGoals[0];
            currentGoal = `${activeGoal.description} (${Math.round(activeGoal.progress.percentage || 0)}% complete)`;
        }
        prompt = prompt.replaceAll('$CURRENT_GOAL', currentGoal);
    }
    
    if (prompt.includes('$CURRENT_ACTION')) {
        let currentAction = 'No current action';
        if (agentState && agentState.executive && agentState.executive.currentAction) {
            const action = agentState.executive.currentAction;
            currentAction = `${action.type}${action.parameters ? ' - ' + JSON.stringify(action.parameters) : ''}`;
        }
        prompt = prompt.replaceAll('$CURRENT_ACTION', currentAction);
    }
    
    if (prompt.includes('$ACTION_PROGRESS')) {
        let actionProgress = 'No action in progress';
        if (agentState && agentState.executive && agentState.executive.currentAction) {
            const action = agentState.executive.currentAction;
            actionProgress = `Status: ${action.status || 'unknown'}`;
            if (action.startTime) {
                const elapsed = Date.now() - action.startTime;
                actionProgress += `, Time elapsed: ${Math.round(elapsed / 1000)}s`;
            }
        }
        prompt = prompt.replaceAll('$ACTION_PROGRESS', actionProgress);
    }
    
    if (prompt.includes('$RECENT_ACTIONS')) {
        let recentActions = 'No recent actions';
        if (agentState && agentState.executive && agentState.executive.decisionHistory && agentState.executive.decisionHistory.length > 0) {
            const recent = agentState.executive.decisionHistory.slice(-3).reverse();
            recentActions = recent.map(decision => {
                const time = new Date(decision.timestamp).toLocaleTimeString();
                return `${time}: ${decision.action || decision.selected} -> ${decision.outcome || 'unknown'}`;
            }).join('\n');
        }
        prompt = prompt.replaceAll('$RECENT_ACTIONS', recentActions);
    }
    
    return prompt;
}

// Mock agent state with action context
const mockAgentState = {
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
        ]
    }
};

function testActionContextPlaceholders() {
    console.log('\n=== Testing Action Context Placeholders ===\n');
    
    try {
        console.log('1. Testing $CURRENT_GOAL placeholder...');
        const testPrompt1 = 'Current Goal: $CURRENT_GOAL';
        const result1 = mockReplaceStrings(testPrompt1, mockAgentState);
        console.log('Result:', result1);
        
        console.log('\n2. Testing $CURRENT_ACTION placeholder...');
        const testPrompt2 = 'Current Action: $CURRENT_ACTION';
        const result2 = mockReplaceStrings(testPrompt2, mockAgentState);
        console.log('Result:', result2);
        
        console.log('\n3. Testing $ACTION_PROGRESS placeholder...');
        const testPrompt3 = 'Action Progress: $ACTION_PROGRESS';
        const result3 = mockReplaceStrings(testPrompt3, mockAgentState);
        console.log('Result:', result3);
        
        console.log('\n4. Testing $RECENT_ACTIONS placeholder...');
        const testPrompt4 = 'Recent Actions:\n$RECENT_ACTIONS';
        const result4 = mockReplaceStrings(testPrompt4, mockAgentState);
        console.log('Result:', result4);
        
        console.log('\n5. Testing combined prompt...');
        const testPrompt5 = 'You are TestBot. Current Goal: $CURRENT_GOAL. Current Action: $CURRENT_ACTION. Action Progress: $ACTION_PROGRESS. Recent Actions:\n$RECENT_ACTIONS. Respond accordingly.';
        const result5 = mockReplaceStrings(testPrompt5, mockAgentState);
        console.log('Result:', result5);
        
        console.log('\n=== Test Complete ===\n');
        
    } catch (error) {
        console.error('Test failed:', error);
        console.log('\n=== Test Failed ===\n');
    }
}

// Run the test
testActionContextPlaceholders();
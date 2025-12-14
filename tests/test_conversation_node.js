/**
 * Test Suite for Conversation Node Implementation
 * Tests LLM-driven message processing with personality-driven responses
 */

import { conversationNode } from '../src/agent/langgraph/state_nodes.js';

// Mock prompter for testing
class MockPrompter {
  constructor() {
    this.chat_model = {
      sendRequest: async (messages, prompt) => {
        // Simulate LLM responses based on personality and message content
        const userMessage = messages[messages.length - 1]?.content || '';
        
        if (userMessage.includes('HELP_REQUEST')) {
          return 'HELP_REQUEST';
        } else if (userMessage.includes('OFFER_HELP')) {
          return 'OFFER_HELP';
        } else if (userMessage.includes('NEITHER')) {
          return 'NEITHER';
        }
        
        // Generate personality-based responses
        if (userMessage.includes('grump')) {
          return 'What do you want? Leave me alone.';
        } else if (userMessage.includes('friendly')) {
          return 'Hello there! I\'d be happy to help you! 😊';
        } else {
          return 'I received your message and will respond accordingly.';
        }
      }
    };
  }
}

// Test cases
const testCases = [
  {
    name: 'Grumpy personality with help request',
    state: {
      conversation: {
        message: 'I need help building a house',
        sender: 'Player1',
        isRequestForHelp: true,
        isOfferOfAssistance: false,
        timestamp: Date.now()
      },
      personality: 'grump, rude, hot head',
      goals: 'likes digging, warrior spirit',
      mandate: '',
      worldContext: {
        health: 20,
        food: 15,
        position: { x: 0, y: 64, z: 0 },
        inventory: { items: [], slots: 36, usedSlots: 0, length: 0 },
        equipment: {},
        nearbyEntities: [],
        timeOfDay: 6000,
        weather: 'clear',
        dimension: 'overworld'
      }
    },
    expectedResponse: 'What do you want? Leave me alone.'
  },
  {
    name: 'Friendly personality with help request',
    state: {
      conversation: {
        message: 'Can someone help me find diamonds?',
        sender: 'Player2',
        isRequestForHelp: true,
        isOfferOfAssistance: false,
        timestamp: Date.now()
      },
      personality: 'friendly, helpful, cheerful',
      goals: 'helping others, exploring',
      mandate: '',
      worldContext: {
        health: 18,
        food: 12,
        position: { x: 100, y: 5, z: 200 },
        inventory: { items: [], slots: 36, usedSlots: 0, length: 0 },
        equipment: {},
        nearbyEntities: [],
        timeOfDay: 12000,
        weather: 'rain',
        dimension: 'overworld'
      }
    },
    expectedResponse: 'Hello there! I\'d be happy to help you! 😊'
  },
  {
    name: 'No message to process',
    state: {
      conversation: {
        message: '',
        sender: '',
        isRequestForHelp: false,
        isOfferOfAssistance: false,
        timestamp: 0
      },
      personality: 'friendly',
      goals: '',
      mandate: '',
      worldContext: {
        health: 20,
        food: 20,
        position: { x: 0, y: 64, z: 0 },
        inventory: { items: [], slots: 36, usedSlots: 0, length: 0 },
        equipment: {},
        nearbyEntities: [],
        timeOfDay: 0,
        weather: 'clear',
        dimension: 'overworld'
      }
    },
    expectedResponse: ''
  },
  {
    name: 'No personality defined',
    state: {
      conversation: {
        message: 'Hello bot!',
        sender: 'Player3',
        isRequestForHelp: false,
        isOfferOfAssistance: false,
        timestamp: Date.now()
      },
      personality: '',
      goals: '',
      mandate: '',
      worldContext: {
        health: 20,
        food: 20,
        position: { x: 0, y: 64, z: 0 },
        inventory: { items: [], slots: 36, usedSlots: 0, length: 0 },
        equipment: {},
        nearbyEntities: [],
        timeOfDay: 0,
        weather: 'clear',
        dimension: 'overworld'
      }
    },
    expectedResponse: 'I need to configure my personality before responding.'
  }
];

// Mock agent with prompter
function createMockAgent() {
  return {
    prompter: new MockPrompter()
  };
}

// Run tests
async function runTests() {
  console.log('=== Conversation Node Test Suite ===\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`Running test: ${testCase.name}`);
    
    try {
      const agent = createMockAgent();
      const result = await conversationNode(testCase.state, agent);
      
      // Test results
      const hasResponse = result.response !== undefined;
      const responseMatches = result.response === testCase.expectedResponse;
      
      if (hasResponse && responseMatches) {
        console.log('✅ PASSED');
        console.log(`   Response: "${result.response}"`);
        passedTests++;
      } else {
        console.log('❌ FAILED');
        console.log(`   Expected: "${testCase.expectedResponse}"`);
        console.log(`   Actual: "${result.response}"`);
        console.log(`   Has response: ${hasResponse}`);
      }
      
    } catch (error) {
      console.log('❌ FAILED with error:');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Performance test
  console.log('Running performance test...');
  const performanceTestState = testCases[0]; // Use first test case
  const agent = createMockAgent();
  
  const startTime = Date.now();
  await conversationNode(performanceTestState.state, agent);
  const processingTime = Date.now() - startTime;
  
  console.log(`Processing time: ${processingTime}ms`);
  if (processingTime < 200) {
    console.log('✅ Performance target met (<200ms)');
  } else {
    console.log('❌ Performance target missed (>200ms)');
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }
}

// Run the test suite
runTests().catch(console.error);

export { runTests, testCases };
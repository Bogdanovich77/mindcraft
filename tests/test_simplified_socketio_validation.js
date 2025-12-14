/**
 * Simple Test for Simplified Socket.IO Event Validation
 * 
 * This test validates that the simplified Socket.IO events have the correct structure
 * and that validation works properly without external dependencies.
 */

// Mock simplified event structures
const mockSimplifiedAgentState = {
  worldContext: {
    position: { x: 0, y: 64, z: 0 },
    health: 20,
    inventory: [],
    equipment: {},
    nearbyEntities: []
  },
  personality: 'friendly, helpful',
  goals: 'likes digging, exploring',
  mandate: 'help build a shelter',
  conversation: {
    message: '',
    sender: '',
    isRequestForHelp: false,
    isOfferOfAssistance: false,
    targetBot: ''
  },
  lastAction: 'idle',
  response: '',
  timestamp: Date.now()
};

const mockActionEvent = {
  agentId: 'test-bot-1',
  lastAction: 'digging',
  response: 'I am digging at the mountain',
  timestamp: Date.now()
};

const mockMessageEvent = {
  agentId: 'test-bot-1',
  from: 'test-bot-1',
  to: 'test-bot-2',
  message: 'Can you help me build this shelter?',
  timestamp: Date.now()
};

// Test runner
function runTests() {
  let testsPassed = 0;
  let testsTotal = 0;
  
  function test(name, testFn) {
    testsTotal++;
    try {
      testFn();
      console.log(`✓ ${name}`);
      testsPassed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);
    }
  }
  
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
  
  function assertHasProperty(obj, prop, message) {
    if (!obj.hasOwnProperty(prop)) {
      throw new Error(message || `Missing property: ${prop}`);
    }
  }
  
  console.log('Running Simplified Socket.IO Event Validation Tests...\n');
  
  // Test Agent State Validation
  test('Agent state has required fields', () => {
    const state = mockSimplifiedAgentState;
    const requiredFields = ['worldContext', 'personality', 'goals', 'mandate', 'conversation', 'lastAction', 'response'];
    
    requiredFields.forEach(field => {
      assertHasProperty(state, field, `Missing required field: ${field}`);
    });
  });
  
  test('World context has required structure', () => {
    const worldContext = mockSimplifiedAgentState.worldContext;
    const requiredFields = ['position', 'health', 'inventory', 'equipment', 'nearbyEntities'];
    
    requiredFields.forEach(field => {
      assertHasProperty(worldContext, field, `Missing worldContext field: ${field}`);
    });
    
    assert(typeof worldContext.position.x === 'number', 'position.x should be number');
    assert(typeof worldContext.position.y === 'number', 'position.y should be number');
    assert(typeof worldContext.position.z === 'number', 'position.z should be number');
    assert(typeof worldContext.health === 'number', 'health should be number');
    assert(Array.isArray(worldContext.inventory), 'inventory should be array');
  });
  
  test('Conversation has required structure', () => {
    const conversation = mockSimplifiedAgentState.conversation;
    const requiredFields = ['message', 'sender', 'isRequestForHelp', 'isOfferOfAssistance', 'targetBot'];
    
    requiredFields.forEach(field => {
      assertHasProperty(conversation, field, `Missing conversation field: ${field}`);
    });
    
    assert(typeof conversation.message === 'string', 'message should be string');
    assert(typeof conversation.sender === 'string', 'sender should be string');
    assert(typeof conversation.isRequestForHelp === 'boolean', 'isRequestForHelp should be boolean');
    assert(typeof conversation.isOfferOfAssistance === 'boolean', 'isOfferOfAssistance should be boolean');
  });
  
  // Test Action Event Validation
  test('Action event has required structure', () => {
    const event = mockActionEvent;
    const requiredFields = ['agentId', 'lastAction', 'response', 'timestamp'];
    
    requiredFields.forEach(field => {
      assertHasProperty(event, field, `Missing action event field: ${field}`);
    });
    
    assert(typeof event.agentId === 'string', 'agentId should be string');
    assert(typeof event.lastAction === 'string', 'lastAction should be string');
    assert(typeof event.response === 'string', 'response should be string');
    assert(typeof event.timestamp === 'number', 'timestamp should be number');
  });
  
  // Test Message Event Validation
  test('Message event has required structure', () => {
    const event = mockMessageEvent;
    const requiredFields = ['agentId', 'from', 'to', 'message', 'timestamp'];
    
    requiredFields.forEach(field => {
      assertHasProperty(event, field, `Missing message event field: ${field}`);
    });
    
    assert(typeof event.agentId === 'string', 'agentId should be string');
    assert(typeof event.from === 'string', 'from should be string');
    assert(typeof event.to === 'string', 'to should be string');
    assert(typeof event.message === 'string', 'message should be string');
    assert(typeof event.timestamp === 'number', 'timestamp should be number');
  });
  
  // Test Validation Functions
  test('validateSimplifiedAgentState works correctly', () => {
    const result = validateSimplifiedAgentState(mockSimplifiedAgentState);
    assert(result.isValid === true, 'Valid state should pass validation');
    assertEqual(result.errors.length, 0, 'Valid state should have no errors');
  });
  
  test('validateSimplifiedAgentState detects missing fields', () => {
    const incompleteState = { ...mockSimplifiedAgentState };
    delete incompleteState.worldContext;
    
    const result = validateSimplifiedAgentState(incompleteState);
    assert(result.isValid === false, 'Incomplete state should fail validation');
    assert(result.errors.length > 0, 'Incomplete state should have errors');
    assert(result.errors[0].includes('worldContext'), 'Should mention missing worldContext');
  });
  
  test('validateActionEvent works correctly', () => {
    const result = validateActionEvent(mockActionEvent);
    assert(result.isValid === true, 'Valid action event should pass validation');
    assertEqual(result.errors.length, 0, 'Valid action event should have no errors');
  });
  
  test('validateActionEvent detects invalid types', () => {
    const invalidEvent = { ...mockActionEvent, agentId: 123 };
    
    const result = validateActionEvent(invalidEvent);
    assert(result.isValid === false, 'Invalid action event should fail validation');
    assert(result.errors.length > 0, 'Invalid action event should have errors');
    assert(result.errors[0].includes('agentId'), 'Should mention invalid agentId');
  });
  
  test('validateMessageEvent works correctly', () => {
    const result = validateMessageEvent(mockMessageEvent);
    assert(result.isValid === true, 'Valid message event should pass validation');
    assertEqual(result.errors.length, 0, 'Valid message event should have no errors');
  });
  
  test('validateMessageEvent detects missing fields', () => {
    const incompleteEvent = { ...mockMessageEvent };
    delete incompleteEvent.message;
    
    const result = validateMessageEvent(incompleteEvent);
    assert(result.isValid === false, 'Incomplete message event should fail validation');
    assert(result.errors.length > 0, 'Incomplete message event should have errors');
  });
  
  // Test Error Handling
  test('Error handling for malformed events', () => {
    try {
      emitSimplifiedEvent(null, 'agent:state:update', mockSimplifiedAgentState);
      assert(false, 'Should throw error for null socket');
    } catch (error) {
      assert(error.message.includes('Socket not connected'), 'Should throw socket connection error');
    }
  });
  
  test('Error handling for invalid event type', () => {
    const mockSocket = { connected: true, emit: () => {} };
    
    try {
      emitSimplifiedEvent(mockSocket, 'invalid:event', {});
      assert(false, 'Should throw error for invalid event type');
    } catch (error) {
      assert(error.message.includes('Unknown event type'), 'Should throw unknown event type error');
    }
  });
  
  // Results
  console.log(`\nTest Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests passed! Simplified Socket.IO event validation is working correctly.');
    return true;
  } else {
    console.log(`❌ ${testsTotal - testsPassed} tests failed.`);
    return false;
  }
}

// Validation functions
function validateSimplifiedAgentState(state) {
  const requiredFields = ['worldContext', 'personality', 'goals', 'mandate', 'conversation', 'lastAction', 'response'];
  const errors = [];
  
  for (const field of requiredFields) {
    if (!state.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate world context
  if (state.worldContext) {
    const worldContextFields = ['position', 'health', 'inventory', 'equipment', 'nearbyEntities'];
    for (const field of worldContextFields) {
      if (!state.worldContext.hasOwnProperty(field)) {
        errors.push(`Missing required worldContext field: ${field}`);
      }
    }
  }
  
  // Validate conversation
  if (state.conversation) {
    const conversationFields = ['message', 'sender', 'isRequestForHelp', 'isOfferOfAssistance', 'targetBot'];
    for (const field of conversationFields) {
      if (!state.conversation.hasOwnProperty(field)) {
        errors.push(`Missing required conversation field: ${field}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateActionEvent(event) {
  const requiredFields = ['agentId', 'lastAction', 'response', 'timestamp'];
  const errors = [];
  
  for (const field of requiredFields) {
    if (!event.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate data types
  if (event.agentId && typeof event.agentId !== 'string') {
    errors.push(`Invalid type for agentId: expected string`);
  }
  
  if (event.lastAction && typeof event.lastAction !== 'string') {
    errors.push(`Invalid type for lastAction: expected string`);
  }
  
  if (event.response && typeof event.response !== 'string') {
    errors.push(`Invalid type for response: expected string`);
  }
  
  if (event.timestamp && typeof event.timestamp !== 'number') {
    errors.push(`Invalid type for timestamp: expected number`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateMessageEvent(event) {
  const requiredFields = ['agentId', 'from', 'to', 'message', 'timestamp'];
  const errors = [];
  
  for (const field of requiredFields) {
    if (!event.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate data types
  if (event.agentId && typeof event.agentId !== 'string') {
    errors.push(`Invalid type for agentId: expected string`);
  }
  
  if (event.from && typeof event.from !== 'string') {
    errors.push(`Invalid type for from: expected string`);
  }
  
  if (event.to && typeof event.to !== 'string') {
    errors.push(`Invalid type for to: expected string`);
  }
  
  if (event.message && typeof event.message !== 'string') {
    errors.push(`Invalid type for message: expected string`);
  }
  
  if (event.timestamp && typeof event.timestamp !== 'number') {
    errors.push(`Invalid type for timestamp: expected number`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function emitSimplifiedEvent(socket, event, payload) {
  if (!socket || !socket.connected) {
    throw new Error('Socket not connected');
  }
  
  // Validate payload based on event type
  let validationResult;
  switch (event) {
    case 'agent:state:update':
      validationResult = validateSimplifiedAgentState(payload);
      break;
    case 'agent:action:executed':
      validationResult = validateActionEvent(payload);
      break;
    case 'agent:message:sent':
      validationResult = validateMessageEvent(payload);
      break;
    default:
      throw new Error(`Unknown event type: ${event}`);
  }
  
  if (!validationResult.isValid) {
    throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
  }
  
  socket.emit(event, payload);
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1);
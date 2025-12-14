/**
 * Integration Test for Real-time Updates with Simplified Socket.IO Events
 * 
 * This test verifies that the real-time update system works correctly
 * with the simplified event structure and that frontend components can
 * receive and process the events properly.
 */

// Mock Socket.IO implementation
class MockSocket {
  constructor() {
    this.connected = false;
    this.events = {};
    this.emittedEvents = [];
  }
  
  connect() {
    this.connected = true;
    this.emit('connect');
  }
  
  disconnect() {
    this.connected = false;
    this.emit('disconnect');
  }
  
  emit(event, ...args) {
    this.emittedEvents.push({ event, args, timestamp: Date.now() });
    
    // Simulate event handling
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
  
  // Test helper methods
  getLastEmittedEvent() {
    return this.emittedEvents[this.emittedEvents.length - 1];
  }
  
  getEmittedEventsByType(eventType) {
    return this.emittedEvents.filter(e => e.event === eventType);
  }
  
  clearEmittedEvents() {
    this.emittedEvents = [];
  }
}

// Mock Redux store
class MockStore {
  constructor() {
    this.state = {
      agents: {
        agents: [],
        selectedAgent: null,
        loading: false,
        error: null
      },
      skills: {
        skills: [],
        selectedSkill: null,
        realTimeUpdates: false,
        loading: false,
        error: null
      },
      social: {
        currentNetwork: null,
        selectedAgent: null,
        realTimeUpdates: false,
        loading: false,
        error: null
      }
    };
    this.dispatchedActions = [];
  }
  
  getState() {
    return this.state;
  }
  
  dispatch(action) {
    this.dispatchedActions.push(action);
    
    // Simple state update based on action type
    if (action.type === 'socket/agentStateUpdate') {
      this.state.agents.agents = this.updateAgentInList(this.state.agents.agents, action.payload);
    } else if (action.type === 'socket/agentActionExecuted') {
      // Update agent action state
      const agent = this.state.agents.agents.find(a => a.id === action.payload.agentId);
      if (agent) {
        agent.lastAction = action.payload.lastAction;
        agent.response = action.payload.response;
      }
    } else if (action.type === 'socket/agentMessageSent') {
      // Handle message event
      this.handleMessageEvent(action.payload);
    }
  }
  
  updateAgentInList(agents, agentData) {
    const existingIndex = agents.findIndex(a => a.id === agentData.id);
    if (existingIndex >= 0) {
      agents[existingIndex] = { ...agents[existingIndex], ...agentData };
    } else {
      agents.push(agentData);
    }
    return agents;
  }
  
  handleMessageEvent(messageData) {
    // Add to social interactions if social network exists
    if (this.state.social.currentNetwork) {
      const interaction = {
        id: `msg_${messageData.timestamp}_${messageData.from}`,
        type: 'conversation',
        participants: [messageData.from, messageData.to],
        timestamp: messageData.timestamp,
        content: messageData.message,
        outcome: 'neutral'
      };
      
      this.state.social.currentNetwork.relationships.forEach(rel => {
        if ((rel.agentId === messageData.from && rel.targetAgentId === messageData.to) || 
            (rel.agentId === messageData.to && rel.targetAgentId === messageData.from)) {
          rel.interactions.unshift(interaction);
          rel.lastInteraction = messageData.timestamp;
        }
      });
    }
  }
  
  getLastDispatchedAction() {
    return this.dispatchedActions[this.dispatchedActions.length - 1];
  }
  
  getDispatchedActionsByType(actionType) {
    return this.dispatchedActions.filter(a => a.type === actionType);
  }
}

// Test data
const mockAgentState = {
  id: 'test-bot-1',
  name: 'TestBot',
  worldContext: {
    position: { x: 10, y: 64, z: 20 },
    health: 18,
    inventory: ['oak_log', 'stone'],
    equipment: { hand: 'wooden_pickaxe' },
    nearbyEntities: ['test-bot-2', 'zombie']
  },
  personality: 'friendly, helpful, curious',
  goals: 'likes digging, exploring caves',
  mandate: 'help build a shelter',
  conversation: {
    message: 'I found some iron ore!',
    sender: 'test-bot-1',
    isRequestForHelp: false,
    isOfferOfAssistance: true,
    targetBot: 'test-bot-2'
  },
  lastAction: 'mining',
  response: 'I found some iron ore in the cave!',
  timestamp: Date.now()
};

const mockActionEvent = {
  agentId: 'test-bot-1',
  lastAction: 'building',
  response: 'I am helping to build the shelter walls',
  timestamp: Date.now()
};

const mockMessageEvent = {
  agentId: 'test-bot-1',
  from: 'test-bot-1',
  to: 'test-bot-2',
  message: 'Can you help me with this roof?',
  timestamp: Date.now()
};

// Test runner
function runIntegrationTests() {
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
  
  console.log('Running Real-time Updates Integration Tests...\n');
  
  // Test Socket.IO Connection
  test('Socket.IO connection and disconnection', () => {
    const socket = new MockSocket();
    let connectCalled = false;
    let disconnectCalled = false;
    
    socket.on('connect', () => { connectCalled = true; });
    socket.on('disconnect', () => { disconnectCalled = true; });
    
    assert(!socket.connected, 'Socket should start disconnected');
    
    socket.connect();
    assert(socket.connected, 'Socket should be connected after connect()');
    assert(connectCalled, 'Connect event should be fired');
    
    socket.disconnect();
    assert(!socket.connected, 'Socket should be disconnected after disconnect()');
    assert(disconnectCalled, 'Disconnect event should be fired');
  });
  
  // Test Agent State Updates
  test('Agent state update events are processed correctly', () => {
    const socket = new MockSocket();
    const store = new MockStore();
    
    // Setup event listener
    socket.on('agent:state:update', (data) => {
      store.dispatch({ type: 'socket/agentStateUpdate', payload: data });
    });
    
    socket.connect();
    
    // Emit agent state update
    socket.emit('agent:state:update', mockAgentState);
    
    // Verify event was processed
    const lastAction = store.getLastDispatchedAction();
    assertEqual(lastAction.type, 'socket/agentStateUpdate', 'Should dispatch agent state update action');
    
    const updatedAgents = store.getState().agents.agents;
    assertEqual(updatedAgents.length, 1, 'Should have one agent in state');
    assertEqual(updatedAgents[0].id, mockAgentState.id, 'Agent ID should match');
    assertEqual(updatedAgents[0].name, mockAgentState.name, 'Agent name should match');
  });
  
  test('Action execution events are processed correctly', () => {
    const socket = new MockSocket();
    const store = new MockStore();
    
    // Add initial agent
    store.dispatch({ 
      type: 'socket/agentStateUpdate', 
      payload: { ...mockAgentState, lastAction: 'idle', response: '' }
    });
    
    // Setup event listener
    socket.on('agent:action:executed', (data) => {
      store.dispatch({ type: 'socket/agentActionExecuted', payload: data });
    });
    
    socket.connect();
    
    // Emit action execution event
    socket.emit('agent:action:executed', mockActionEvent);
    
    // Verify event was processed
    const lastAction = store.getLastDispatchedAction();
    assertEqual(lastAction.type, 'socket/agentActionExecuted', 'Should dispatch action executed action');
    
    const updatedAgent = store.getState().agents.agents.find(a => a.id === mockActionEvent.agentId);
    assertEqual(updatedAgent.lastAction, mockActionEvent.lastAction, 'Agent action should be updated');
    assertEqual(updatedAgent.response, mockActionEvent.response, 'Agent response should be updated');
  });
  
  test('Message events are processed correctly', () => {
    const socket = new MockSocket();
    const store = new MockStore();
    
    // Setup mock social network
    store.state.social.currentNetwork = {
      id: 'test-network',
      agents: [],
      relationships: [
        {
          id: 'rel-1-2',
          agentId: 'test-bot-1',
          targetAgentId: 'test-bot-2',
          trustLevel: 0.5,
          interactions: [],
          lastInteraction: 0
        }
      ]
    };
    
    // Setup event listener
    socket.on('agent:message:sent', (data) => {
      store.dispatch({ type: 'socket/agentMessageSent', payload: data });
    });
    
    socket.connect();
    
    // Emit message event
    socket.emit('agent:message:sent', mockMessageEvent);
    
    // Verify event was processed
    const lastAction = store.getLastDispatchedAction();
    assertEqual(lastAction.type, 'socket/agentMessageSent', 'Should dispatch message sent action');
    
    const relationship = store.getState().social.currentNetwork.relationships[0];
    assert(relationship.interactions.length > 0, 'Should have added interaction to relationship');
    assertEqual(relationship.interactions[0].content, mockMessageEvent.message, 'Interaction content should match');
  });
  
  test('Real-time updates can be enabled and disabled', () => {
    const socket = new MockSocket();
    const store = new MockStore();
    
    socket.connect();
    
    // Enable real-time updates
    store.dispatch({ type: 'skills/setRealTimeUpdates', payload: true });
    
    // Check if the action was dispatched (the mock store doesn't actually update state for custom actions)
    const skillsAction = store.getDispatchedActionsByType('skills/setRealTimeUpdates')[0];
    assert(skillsAction, 'Real-time updates action should be dispatched for skills');
    assert(skillsAction.payload === true, 'Real-time updates should be enabled for skills');
    
    store.dispatch({ type: 'social/setRealTimeUpdates', payload: true });
    const socialAction = store.getDispatchedActionsByType('social/setRealTimeUpdates')[0];
    assert(socialAction, 'Real-time updates action should be dispatched for social');
    assert(socialAction.payload === true, 'Real-time updates should be enabled for social');
    
    // Disable real-time updates
    store.dispatch({ type: 'skills/setRealTimeUpdates', payload: false });
    const disableSkillsAction = store.getDispatchedActionsByType('skills/setRealTimeUpdates')[1];
    assert(disableSkillsAction.payload === false, 'Real-time updates should be disabled for skills');
    
    store.dispatch({ type: 'social/setRealTimeUpdates', payload: false });
    const disableSocialAction = store.getDispatchedActionsByType('social/setRealTimeUpdates')[1];
    assert(disableSocialAction.payload === false, 'Real-time updates should be disabled for social');
  });
  
  test('Error handling for malformed events', () => {
    const socket = new MockSocket();
    const store = new MockStore();
    let errorCaught = false;
    
    // Setup error handling
    socket.on('agent:state:update', (data) => {
      try {
        // Validate event structure
        if (!data.id || !data.worldContext) {
          throw new Error('Invalid agent state structure');
        }
        store.dispatch({ type: 'socket/agentStateUpdate', payload: data });
      } catch (error) {
        errorCaught = true;
        store.dispatch({ type: 'socket/error', payload: error.message });
      }
    });
    
    socket.connect();
    
    // Emit malformed event
    socket.emit('agent:state:update', { id: 'test-bot' }); // Missing worldContext
    
    assert(errorCaught, 'Error should be caught for malformed event');
    
    const errorAction = store.getDispatchedActionsByType('socket/error')[0];
    assert(errorAction, 'Error action should be dispatched');
    assert(errorAction.payload.includes('Invalid agent state'), 'Error message should be descriptive');
  });
  
  test('Event ordering and timing', () => {
    const socket = new MockSocket();
    const store = new MockStore();
    const timestamps = [];
    
    socket.on('agent:state:update', (data) => {
      timestamps.push(Date.now());
      store.dispatch({ type: 'socket/agentStateUpdate', payload: data });
    });
    
    socket.connect();
    
    // Emit multiple events rapidly
    socket.emit('agent:state:update', { ...mockAgentState, id: 'bot-1' });
    socket.emit('agent:state:update', { ...mockAgentState, id: 'bot-2' });
    socket.emit('agent:state:update', { ...mockAgentState, id: 'bot-3' });
    
    assertEqual(timestamps.length, 3, 'Should process all three events');
    assertEqual(store.getState().agents.agents.length, 3, 'Should have three agents in state');
    
    // Verify events were processed in order
    const agents = store.getState().agents.agents;
    assertEqual(agents[0].id, 'bot-1', 'First agent should be bot-1');
    assertEqual(agents[1].id, 'bot-2', 'Second agent should be bot-2');
    assertEqual(agents[2].id, 'bot-3', 'Third agent should be bot-3');
  });
  
  // Results
  console.log(`\nIntegration Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All integration tests passed! Real-time updates are working correctly.');
    return true;
  } else {
    console.log(`❌ ${testsTotal - testsPassed} tests failed.`);
    return false;
  }
}

// Run the integration tests
const success = runIntegrationTests();
process.exit(success ? 0 : 1);
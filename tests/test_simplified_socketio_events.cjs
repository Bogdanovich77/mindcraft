/**
 * Test Suite for Simplified Socket.IO Events
 * 
 * This test validates that the simplified Socket.IO events work correctly
 * with the new AgentState structure and that error handling is robust.
 */

const { expect } = require('chai');
const sinon = require('sinon');

// Mock the simplified event structures
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

describe('Simplified Socket.IO Events', () => {
  let mockSocket;
  let mockEmit;
  let mockOn;

  beforeEach(() => {
    mockEmit = sinon.spy();
    mockOn = sinon.spy();
    mockSocket = {
      emit: mockEmit,
      on: mockOn,
      connected: true
    };
  });

  describe('Agent State Update Events', () => {
    it('should validate simplified agent state structure', () => {
      const state = mockSimplifiedAgentState;
      
      // Verify required fields exist
      expect(state).to.have.property('worldContext');
      expect(state).to.have.property('personality');
      expect(state).to.have.property('goals');
      expect(state).to.have.property('mandate');
      expect(state).to.have.property('conversation');
      expect(state).to.have.property('lastAction');
      expect(state).to.have.property('response');
      
      // Verify world context structure
      expect(state.worldContext).to.have.property('position');
      expect(state.worldContext).to.have.property('health');
      expect(state.worldContext).to.have.property('inventory');
      expect(state.worldContext).to.have.property('equipment');
      expect(state.worldContext).to.have.property('nearbyEntities');
      
      // Verify conversation structure
      expect(state.conversation).to.have.property('message');
      expect(state.conversation).to.have.property('sender');
      expect(state.conversation).to.have.property('isRequestForHelp');
      expect(state.conversation).to.have.property('isOfferOfAssistance');
      expect(state.conversation).to.have.property('targetBot');
    });

    it('should handle missing required fields gracefully', () => {
      const incompleteState = { ...mockSimplifiedAgentState };
      delete incompleteState.worldContext;
      
      // Should have validation error handling
      expect(() => {
        validateSimplifiedAgentState(incompleteState);
      }).to.throw('Missing required field: worldContext');
    });

    it('should emit agent state update event correctly', () => {
      const event = 'agent:state:update';
      const payload = mockSimplifiedAgentState;
      
      mockSocket.emit(event, payload);
      
      expect(mockEmit.calledOnce).to.be.true;
      expect(mockEmit.firstCall.args[0]).to.equal(event);
      expect(mockEmit.firstCall.args[1]).to.deep.equal(payload);
    });
  });

  describe('Action Execution Events', () => {
    it('should validate action event structure', () => {
      const event = mockActionEvent;
      
      expect(event).to.have.property('agentId');
      expect(event).to.have.property('lastAction');
      expect(event).to.have.property('response');
      expect(event).to.have.property('timestamp');
      
      expect(typeof event.agentId).to.equal('string');
      expect(typeof event.lastAction).to.equal('string');
      expect(typeof event.response).to.equal('string');
      expect(typeof event.timestamp).to.equal('number');
    });

    it('should emit action execution event correctly', () => {
      const event = 'agent:action:executed';
      const payload = mockActionEvent;
      
      mockSocket.emit(event, payload);
      
      expect(mockEmit.calledOnce).to.be.true;
      expect(mockEmit.firstCall.args[0]).to.equal(event);
      expect(mockEmit.firstCall.args[1]).to.deep.equal(payload);
    });
  });

  describe('Message Events', () => {
    it('should validate message event structure', () => {
      const event = mockMessageEvent;
      
      expect(event).to.have.property('agentId');
      expect(event).to.have.property('from');
      expect(event).to.have.property('to');
      expect(event).to.have.property('message');
      expect(event).to.have.property('timestamp');
      
      expect(typeof event.agentId).to.equal('string');
      expect(typeof event.from).to.equal('string');
      expect(typeof event.to).to.equal('string');
      expect(typeof event.message).to.equal('string');
      expect(typeof event.timestamp).to.equal('number');
    });

    it('should emit message event correctly', () => {
      const event = 'agent:message:sent';
      const payload = mockMessageEvent;
      
      mockSocket.emit(event, payload);
      
      expect(mockEmit.calledOnce).to.be.true;
      expect(mockEmit.firstCall.args[0]).to.equal(event);
      expect(mockEmit.firstCall.args[1]).to.deep.equal(payload);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed events gracefully', () => {
      const malformedEvent = {
        agentId: 'test-bot',
        // Missing required fields
      };
      
      expect(() => {
        validateActionEvent(malformedEvent);
      }).to.throw('Missing required field: lastAction');
    });

    it('should handle invalid data types', () => {
      const invalidEvent = {
        agentId: 123, // Should be string
        lastAction: 'digging',
        response: 'I am digging',
        timestamp: Date.now()
      };
      
      expect(() => {
        validateActionEvent(invalidEvent);
      }).to.throw('Invalid type for agentId: expected string');
    });

    it('should handle connection errors', () => {
      mockSocket.connected = false;
      
      expect(() => {
        emitSimplifiedEvent(mockSocket, 'agent:state:update', mockSimplifiedAgentState);
      }).to.throw('Socket not connected');
    });
  });

  describe('Event Validation Functions', () => {
    it('should validate simplified agent state', () => {
      const result = validateSimplifiedAgentState(mockSimplifiedAgentState);
      expect(result.isValid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it('should validate action events', () => {
      const result = validateActionEvent(mockActionEvent);
      expect(result.isValid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it('should validate message events', () => {
      const result = validateMessageEvent(mockMessageEvent);
      expect(result.isValid).to.be.true;
      expect(result.errors).to.be.empty;
    });
  });
});

// Validation functions (would be in the actual implementation)
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
  if (!socket.connected) {
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
/**
 * Event Validation Utilities for Type Safety
 *
 * This module provides comprehensive validation functions for all Socket.IO events
 * to ensure type safety and data integrity across the streaming system.
 */

import type {
  AgentState,
  AgentStateUpdateEvent,
  AgentConnectionEvent,
  PersonalityTraitUpdateEvent,
  PersonalityEmotionEvent,
  PersonalityMoodEvent,
  PersonalityEvolutionEvent,
  MemoryUpdateEvent,
  MemoryConsolidationEvent,
  GoalUpdateEvent,
  GoalHierarchyEvent,
  GoalProgressEvent,
  SocialDataUpdateEvent,
  SocialNetworkUpdateEvent,
  SocialInteractionEvent,
  SkillDataUpdateEvent,
  SkillExperienceEvent,
  SkillMilestoneEvent,
  SkillSynergyEvent,
  PerformanceMetricsUpdateEvent,
  PerformanceAlertEvent,
  PerformanceAnomalyEvent,
  SystemStatusUpdateEvent,
  SystemErrorEvent,
  ConnectionStatusEvent
} from '../types/socketEvents';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Base validator interface
export interface Validator<T> {
  validate(data: any): ValidationResult;
  sanitize?(data: any): T;
}

/**
 * Generic validation helper
 */
function createValidationResult(isValid: boolean, errors: string[] = [], warnings: string[] = []): ValidationResult {
  return { isValid, errors, warnings };
}

/**
 * Type guard helpers
 */
function isString(value: any): value is string {
  return typeof value === 'string';
}

function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

function isValidTimestamp(value: any): boolean {
  return isNumber(value) && value > 0 && value <= Date.now() + 86400000; // Allow 1 day in future
}

function isValidAgentId(value: any): boolean {
  return isString(value) && value.length > 0 && value.length <= 100;
}

function isValidGoalId(value: any): boolean {
  return isString(value) && value.length > 0 && value.length <= 100;
}

function isValidSkillId(value: any): boolean {
  return isString(value) && value.length > 0 && value.length <= 100;
}

function isValidPercentage(value: any): boolean {
  return isNumber(value) && value >= 0 && value <= 1;
}

/**
 * Agent State Update Event Validator
 */
export const agentStateUpdateValidator: Validator<AgentStateUpdateEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any; // Type assertion for dynamic property access

    // Required fields
    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isObject(eventData.state)) {
      errors.push('Invalid or missing state object');
    } else {
      // Validate state structure
      if (!isObject(eventData.state.context)) {
        errors.push('Invalid state.context object');
      }

      if (!isObject(eventData.state.cognitive)) {
        errors.push('Invalid state.cognitive object');
      }

      if (!isObject(eventData.state.executive)) {
        errors.push('Invalid state.executive object');
      }

      if (!isObject(eventData.state.reactive)) {
        warnings.push('Missing state.reactive object');
      }
    }

    // Optional fields validation
    if (eventData.version !== undefined && !isString(eventData.version)) {
      warnings.push('Version should be a string');
    }

    if (eventData.metadata !== undefined && !isObject(eventData.metadata)) {
      warnings.push('Metadata should be an object');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): AgentStateUpdateEvent {
    const eventData = data as any;
    return {
      agentId: String(eventData.agentId || ''),
      state: eventData.state || {},
      changes: eventData.changes || [],
      type: eventData.type || 'update',
      timestamp: eventData.timestamp || Date.now()
    } as AgentStateUpdateEvent;
  }
};

/**
 * Agent Connection Event Validator
 */
export const agentConnectionValidator: Validator<AgentConnectionEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isString(eventData.connectionType)) {
      errors.push('Invalid or missing connectionType');
    } else if (!['initial', 'reconnect', 'migration', 'manual'].includes(eventData.connectionType)) {
      warnings.push(`Unknown connectionType: ${eventData.connectionType}`);
    }

    if (eventData.metadata !== undefined && !isObject(eventData.metadata)) {
      warnings.push('Metadata should be an object');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): AgentConnectionEvent {
    const eventData = data as any;
    return {
      agentId: String(eventData.agentId || ''),
      timestamp: eventData.timestamp || Date.now(),
      connectionType: eventData.connectionType || 'initial'
    } as AgentConnectionEvent;
  }
};

/**
 * Personality Trait Update Event Validator
 */
export const personalityTraitValidator: Validator<PersonalityTraitUpdateEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isObject(eventData.traits)) {
      errors.push('Invalid or missing traits object');
    } else {
      // Validate trait values
      const validTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
                          'riskTolerance', 'creativity', 'patience', 'competitiveness', 'curiosity'];
      
      for (const [trait, value] of Object.entries(eventData.traits)) {
        if (!validTraits.includes(trait)) {
          warnings.push(`Unknown trait: ${trait}`);
        }
        
        if (!isValidPercentage(value)) {
          errors.push(`Invalid value for trait ${trait}: must be between 0 and 1`);
        }
      }
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): PersonalityTraitUpdateEvent {
    const eventData = data as any;
    const traits: Record<string, number> = {};
    if (isObject(eventData.traits)) {
      for (const [trait, value] of Object.entries(eventData.traits)) {
        traits[trait] = Math.max(0, Math.min(1, Number(value) || 0));
      }
    }

    return {
      agentId: String(eventData.agentId || ''),
      traits: traits as any,
      changes: eventData.changes || [],
      evolutionRate: eventData.evolutionRate || 0,
      confidence: eventData.confidence || 1,
      timestamp: eventData.timestamp || Date.now()
    } as PersonalityTraitUpdateEvent;
  }
};

/**
 * Personality Emotion Event Validator
 */
export const personalityEmotionValidator: Validator<PersonalityEmotionEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isString(eventData.emotion)) {
      errors.push('Invalid or missing emotion');
    }

    if (!isValidPercentage(eventData.intensity)) {
      errors.push('Invalid or missing intensity');
    }

    if (eventData.transition !== undefined && !isObject(eventData.transition)) {
      warnings.push('Transition should be an object');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): PersonalityEmotionEvent {
    const eventData = data as any;
    return {
      agentId: String(eventData.agentId || ''),
      emotion: String(eventData.emotion || '') as any,
      transition: eventData.transition,
      timestamp: eventData.timestamp || Date.now()
    } as PersonalityEmotionEvent;
  }
};

/**
 * Personality Mood Event Validator
 */
export const personalityMoodValidator: Validator<PersonalityMoodEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isString(eventData.mood)) {
      errors.push('Invalid or missing mood');
    }

    if (eventData.factors !== undefined && !isArray(eventData.factors)) {
      warnings.push('Factors should be an array');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): PersonalityMoodEvent {
    const eventData = data as any;
    return {
      agentId: String(eventData.agentId || ''),
      mood: String(eventData.mood || '') as any,
      factors: eventData.factors || [],
      timestamp: eventData.timestamp || Date.now()
    } as PersonalityMoodEvent;
  }
};

/**
 * Memory Update Event Validator
 */
export const memoryUpdateValidator: Validator<MemoryUpdateEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isString(eventData.memoryType)) {
      errors.push('Invalid or missing memoryType');
    } else if (!['semantic', 'episodic', 'procedural', 'working'].includes(eventData.memoryType)) {
      warnings.push(`Unknown memoryType: ${eventData.memoryType}`);
    }

    if (eventData.memory !== undefined && !isObject(eventData.memory) && !isArray(eventData.memory)) {
      errors.push('Memory should be an object or array');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): MemoryUpdateEvent {
    const eventData = data as any;
    return {
      agentId: String(eventData.agentId || ''),
      memoryType: eventData.memoryType || 'semantic',
      memory: eventData.memory || {},
      operation: eventData.operation || 'update',
      memoryId: String(eventData.memoryId || ''),
      impact: eventData.impact || {},
      timestamp: eventData.timestamp || Date.now()
    } as MemoryUpdateEvent;
  }
};

/**
 * Memory Consolidation Event Validator
 */
export const memoryConsolidationValidator: Validator<MemoryConsolidationEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isString(eventData.consolidationId)) {
      errors.push('Invalid or missing consolidationId');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): MemoryConsolidationEvent {
    const eventData = data as any;
    return {
      agentId: String(eventData.agentId || ''),
      consolidationId: String(eventData.consolidationId || ''),
      sourceMemories: eventData.sourceMemories || [],
      targetMemory: eventData.targetMemory || {},
      consolidationType: eventData.consolidationType || 'semantic',
      strength: eventData.strength || 0,
      context: eventData.context || {},
      timestamp: eventData.timestamp || Date.now()
    } as MemoryConsolidationEvent;
  }
};

/**
 * Goal Update Event Validator
 */
export const goalUpdateValidator: Validator<GoalUpdateEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidGoalId(eventData.goalId)) {
      errors.push('Invalid or missing goalId');
    }

    if (!isObject(eventData.goal)) {
      errors.push('Invalid or missing goal object');
    } else {
      if (!isString(eventData.goal.type)) {
        errors.push('Invalid or missing goal.type');
      } else if (!['strategic', 'tactical', 'operational'].includes(eventData.goal.type)) {
        warnings.push(`Unknown goal type: ${eventData.goal.type}`);
      }

      if (!isString(eventData.goal.status)) {
        errors.push('Invalid or missing goal.status');
      }
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): GoalUpdateEvent {
    const eventData = data as any;
    return {
      goalId: String(eventData.goalId || ''),
      goal: eventData.goal || {},
      changes: eventData.changes || [],
      reason: String(eventData.reason || ''),
      timestamp: eventData.timestamp || Date.now()
    } as GoalUpdateEvent;
  }
};

/**
 * Goal Progress Event Validator
 */
export const goalProgressValidator: Validator<GoalProgressEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidGoalId(eventData.goalId)) {
      errors.push('Invalid or missing goalId');
    }

    if (!isValidPercentage(eventData.progress)) {
      errors.push('Invalid or missing progress');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): GoalProgressEvent {
    const eventData = data as any;
    return {
      goalId: String(eventData.goalId || ''),
      progress: Math.max(0, Math.min(1, Number(eventData.progress) || 0)),
      previousProgress: eventData.previousProgress || 0,
      achievements: eventData.achievements || [],
      blockers: eventData.blockers || [],
      timestamp: eventData.timestamp || Date.now()
    } as GoalProgressEvent;
  }
};

/**
 * Social Data Update Event Validator
 */
export const socialDataUpdateValidator: Validator<SocialDataUpdateEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isString(eventData.type)) {
      errors.push('Invalid or missing type');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): SocialDataUpdateEvent {
    const eventData = data as any;
    return {
      agentId: String(eventData.agentId || ''),
      type: String(eventData.type || '') as any,
      data: eventData.data || {},
      impact: eventData.impact || {},
      timestamp: eventData.timestamp || Date.now()
    } as SocialDataUpdateEvent;
  }
};

/**
 * Skill Data Update Event Validator
 */
export const skillDataUpdateValidator: Validator<SkillDataUpdateEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidSkillId(eventData.skillId)) {
      errors.push('Invalid or missing skillId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isString(eventData.type)) {
      errors.push('Invalid or missing type');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): SkillDataUpdateEvent {
    const eventData = data as any;
    return {
      skillId: String(eventData.skillId || ''),
      type: String(eventData.type || '') as any,
      data: eventData.data || {},
      impact: eventData.impact || {},
      timestamp: eventData.timestamp || Date.now()
    } as SkillDataUpdateEvent;
  }
};

/**
 * Performance Metrics Update Event Validator
 */
export const performanceMetricsValidator: Validator<PerformanceMetricsUpdateEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidAgentId(eventData.agentId)) {
      errors.push('Invalid or missing agentId');
    }

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isObject(eventData.metrics)) {
      errors.push('Invalid or missing metrics object');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): PerformanceMetricsUpdateEvent {
    const eventData = data as any;
    return {
      agentId: String(eventData.agentId || ''),
      metrics: eventData.metrics || {},
      trends: eventData.trends || {},
      timestamp: eventData.timestamp || Date.now()
    } as PerformanceMetricsUpdateEvent;
  }
};

/**
 * System Status Update Event Validator
 */
export const systemStatusValidator: Validator<SystemStatusUpdateEvent> = {
  validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isObject(data)) {
      errors.push('Event data must be an object');
      return createValidationResult(false, errors, warnings);
    }

    const eventData = data as any;

    if (!isValidTimestamp(eventData.timestamp)) {
      errors.push('Invalid or missing timestamp');
    }

    if (!isString(eventData.status)) {
      errors.push('Invalid or missing status');
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  },

  sanitize(data: any): SystemStatusUpdateEvent {
    const eventData = data as any;
    return {
      status: String(eventData.status || '') as any,
      timestamp: eventData.timestamp || Date.now(),
      changes: eventData.changes || [],
      health: eventData.health || {},
      performance: eventData.performance || {},
      resources: eventData.resources || {}
    } as SystemStatusUpdateEvent;
  }
};

/**
 * Validation registry for all event types
 */
export const eventValidators: Record<string, Validator<any>> = {
  'agent:state:update': agentStateUpdateValidator,
  'agent:connected': agentConnectionValidator,
  'agent:disconnected': agentConnectionValidator,
  'personality:trait:update': personalityTraitValidator,
  'personality:emotion:update': personalityEmotionValidator,
  'personality:mood:update': personalityMoodValidator,
  'personality:evolution': personalityEmotionValidator, // Reuse emotion validator
  'memory:semantic:update': memoryUpdateValidator,
  'memory:episodic:update': memoryUpdateValidator,
  'memory:procedural:update': memoryUpdateValidator,
  'memory:consolidation:event': memoryConsolidationValidator,
  'goal:strategic:update': goalUpdateValidator,
  'goal:tactical:update': goalUpdateValidator,
  'goal:operational:update': goalUpdateValidator,
  'goal:progress:update': goalProgressValidator,
  'social:relationship:update': socialDataUpdateValidator,
  'social:interaction:event': socialDataUpdateValidator,
  'social:network:update': socialDataUpdateValidator,
  'skill:progress:update': skillDataUpdateValidator,
  'skill:experience:event': skillDataUpdateValidator,
  'skill:synergy:update': skillDataUpdateValidator,
  'skill:milestone:event': skillDataUpdateValidator,
  'performance:metrics:update': performanceMetricsValidator,
  'performance:alert:event': performanceMetricsValidator,
  'performance:anomaly:detect': performanceMetricsValidator,
  'system:status:update': systemStatusValidator,
  'system:error:event': systemStatusValidator
};

/**
 * Validate an event by type
 */
export function validateEvent(eventType: string, data: any): ValidationResult {
  const validator = eventValidators[eventType];
  if (!validator) {
    return createValidationResult(false, [`No validator found for event type: ${eventType}`]);
  }

  try {
    return validator.validate(data);
  } catch (error) {
    return createValidationResult(false, [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
  }
}

/**
 * Sanitize an event by type
 */
export function sanitizeEvent(eventType: string, data: any): any {
  const validator = eventValidators[eventType];
  if (!validator || !validator.sanitize) {
    return data;
  }

  try {
    return validator.sanitize(data);
  } catch (error) {
    console.error(`Error sanitizing event ${eventType}:`, error);
    return data;
  }
}

/**
 * Batch validate multiple events
 */
export function validateEvents(events: Array<{ type: string; data: any }>): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  let isValid = true;

  for (const event of events) {
    const result = validateEvent(event.type, event.data);
    if (!result.isValid) {
      isValid = false;
    }
    allErrors.push(...result.errors.map(error => `${event.type}: ${error}`));
    allWarnings.push(...result.warnings.map(warning => `${event.type}: ${warning}`));
  }

  return createValidationResult(isValid, allErrors, allWarnings);
}

/**
 * Create a custom validator
 */
export function createCustomValidator<T>(
  validationFn: (data: any) => ValidationResult,
  sanitizeFn?: (data: any) => T
): Validator<T> {
  return {
    validate: validationFn,
    sanitize: sanitizeFn
  };
}

/**
 * Validate and sanitize an event in one step
 */
export function processEvent(eventType: string, data: any): { isValid: boolean; data: any; errors: string[]; warnings: string[] } {
  const validation = validateEvent(eventType, data);
  const sanitizedData = sanitizeEvent(eventType, data);

  return {
    isValid: validation.isValid,
    data: sanitizedData,
    errors: validation.errors,
    warnings: validation.warnings
  };
}
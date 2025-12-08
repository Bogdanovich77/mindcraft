/**
 * Value Hierarchy System
 * 
 * Provides a structured framework for moral and practical decision-making.
 * Values influence action selection but never override reactive survival behaviors.
 */

export type ValueType = 
  | 'survival' | 'security' | 'knowledge' | 'growth' | 'creativity' 
  | 'cooperation' | 'competition' | 'justice' | 'freedom' | 'loyalty'
  | 'honesty' | 'compassion' | 'courage' | 'wisdom' | 'efficiency';

export interface Value {
  type: ValueType;
  importance: number;        // How important this value is (0-1)
  strength: number;          // Current activation strength (0-1)
  flexibility: number;       // How flexible the value is (0-1)
  lastReinforced: number;    // Timestamp of last reinforcement
}

export interface ValueHierarchy {
  values: Map<ValueType, Value>;
  coreValues: ValueType[];   // Top 3-5 most important values
  valueConflicts: Map<string, { value1: ValueType; value2: ValueType; severity: number }>;
}

export interface ValueEvent {
  type: 'action_taken' | 'outcome_observed' | 'social_feedback' | 'personal_reflection';
  affectedValues: ValueType[];
  reinforcement: number;     // -1 to 1, positive or negative reinforcement
  context: any;
}

export class ValueSystem {
  private hierarchy: ValueHierarchy;
  private readonly VALUE_DECAY_RATE = 0.001;
  private readonly CONFLICT_THRESHOLD = 0.7;
  
  constructor(initialValues?: Partial<ValueHierarchy>) {
    this.hierarchy = {
      values: this.createDefaultValues(),
      coreValues: ['survival', 'security', 'knowledge'],
      valueConflicts: new Map(),
      ...initialValues
    };
    
    this.updateCoreValues();
  }
  
  /**
   * Create default value set
   */
  private createDefaultValues(): Map<ValueType, Value> {
    const values = new Map<ValueType, Value>();
    
    // Core survival values
    values.set('survival', {
      type: 'survival',
      importance: 0.9,
      strength: 0.8,
      flexibility: 0.2,
      lastReinforced: Date.now()
    });
    
    values.set('security', {
      type: 'security',
      importance: 0.8,
      strength: 0.7,
      flexibility: 0.3,
      lastReinforced: Date.now()
    });
    
    // Growth and development values
    values.set('knowledge', {
      type: 'knowledge',
      importance: 0.7,
      strength: 0.6,
      flexibility: 0.5,
      lastReinforced: Date.now()
    });
    
    values.set('growth', {
      type: 'growth',
      importance: 0.6,
      strength: 0.5,
      flexibility: 0.6,
      lastReinforced: Date.now()
    });
    
    values.set('creativity', {
      type: 'creativity',
      importance: 0.5,
      strength: 0.4,
      flexibility: 0.7,
      lastReinforced: Date.now()
    });
    
    // Social values
    values.set('cooperation', {
      type: 'cooperation',
      importance: 0.6,
      strength: 0.5,
      flexibility: 0.5,
      lastReinforced: Date.now()
    });
    
    values.set('competition', {
      type: 'competition',
      importance: 0.4,
      strength: 0.3,
      flexibility: 0.6,
      lastReinforced: Date.now()
    });
    
    values.set('justice', {
      type: 'justice',
      importance: 0.6,
      strength: 0.5,
      flexibility: 0.4,
      lastReinforced: Date.now()
    });
    
    values.set('loyalty', {
      type: 'loyalty',
      importance: 0.5,
      strength: 0.4,
      flexibility: 0.5,
      lastReinforced: Date.now()
    });
    
    values.set('compassion', {
      type: 'compassion',
      importance: 0.5,
      strength: 0.4,
      flexibility: 0.6,
      lastReinforced: Date.now()
    });
    
    // Personal values
    values.set('freedom', {
      type: 'freedom',
      importance: 0.6,
      strength: 0.5,
      flexibility: 0.5,
      lastReinforced: Date.now()
    });
    
    values.set('honesty', {
      type: 'honesty',
      importance: 0.6,
      strength: 0.5,
      flexibility: 0.4,
      lastReinforced: Date.now()
    });
    
    values.set('courage', {
      type: 'courage',
      importance: 0.5,
      strength: 0.4,
      flexibility: 0.6,
      lastReinforced: Date.now()
    });
    
    values.set('wisdom', {
      type: 'wisdom',
      importance: 0.7,
      strength: 0.6,
      flexibility: 0.3,
      lastReinforced: Date.now()
    });
    
    values.set('efficiency', {
      type: 'efficiency',
      importance: 0.5,
      strength: 0.4,
      flexibility: 0.7,
      lastReinforced: Date.now()
    });
    
    return values;
  }
  
  /**
   * Update value strengths based on time and events
   */
  update(deltaTime: number, events: ValueEvent[] = []): void {
    const currentTime = Date.now();
    
    // Natural decay of value strength
    this.hierarchy.values.forEach((value, type) => {
      value.strength = Math.max(0.1, value.strength - this.VALUE_DECAY_RATE * deltaTime);
      value.lastReinforced = currentTime;
    });
    
    // Process value-reinforcing events
    events.forEach(event => this.processValueEvent(event));
    
    // Update core values based on current importance
    this.updateCoreValues();
    
    // Detect and manage value conflicts
    this.updateValueConflicts();
  }
  
  /**
   * Process events that reinforce or diminish values
   */
  private processValueEvent(event: ValueEvent): void {
    event.affectedValues.forEach(valueType => {
      const value = this.hierarchy.values.get(valueType);
      if (!value) return;
      
      const reinforcement = event.reinforcement * value.flexibility;
      value.strength = Math.max(0.1, Math.min(1, value.strength + reinforcement));
      value.lastReinforced = Date.now();
      
      // Gradually adjust importance based on consistent reinforcement
      if (Math.abs(reinforcement) > 0.1) {
        const importanceChange = reinforcement * 0.01;
        value.importance = Math.max(0.1, Math.min(1, value.importance + importanceChange));
      }
    });
  }
  
  /**
   * Update core values (top 3-5 most important)
   */
  private updateCoreValues(): void {
    const sortedValues = Array.from(this.hierarchy.values.entries())
      .sort(([, a], [, b]) => b.importance - a.importance);
    
    this.hierarchy.coreValues = sortedValues
      .slice(0, Math.min(5, sortedValues.length))
      .map(([type]) => type);
  }
  
  /**
   * Detect conflicts between values
   */
  private updateValueConflicts(): void {
    this.hierarchy.valueConflicts.clear();
    
    const valueArray = Array.from(this.hierarchy.values.values());
    
    for (let i = 0; i < valueArray.length; i++) {
      for (let j = i + 1; j < valueArray.length; j++) {
        const value1 = valueArray[i];
        const value2 = valueArray[j];
        
        const conflictSeverity = this.calculateConflictSeverity(value1, value2);
        
        if (conflictSeverity > this.CONFLICT_THRESHOLD) {
          const conflictKey = `${value1.type}_${value2.type}`;
          this.hierarchy.valueConflicts.set(conflictKey, {
            value1: value1.type,
            value2: value2.type,
            severity: conflictSeverity
          });
        }
      }
    }
  }
  
  /**
   * Calculate how much two values conflict
   */
  private calculateConflictSeverity(value1: Value, value2: Value): number {
    const conflictPairs: Record<string, string[]> = {
      'cooperation': ['competition'],
      'competition': ['cooperation', 'compassion'],
      'freedom': ['security', 'loyalty'],
      'security': ['freedom'],
      'honesty': ['loyalty'],
      'loyalty': ['honesty', 'justice'],
      'justice': ['loyalty'],
      'efficiency': ['creativity', 'wisdom'],
      'creativity': ['efficiency'],
      'courage': ['security'],
      'compassion': ['competition']
    };
    
    if (conflictPairs[value1.type]?.includes(value2.type)) {
      return (value1.strength + value2.strength) / 2;
    }
    
    return 0;
  }
  
  /**
   * Get current value hierarchy
   */
  getHierarchy(): ValueHierarchy {
    return {
      ...this.hierarchy,
      values: new Map(this.hierarchy.values),
      valueConflicts: new Map(this.hierarchy.valueConflicts)
    };
  }
  
  /**
   * Calculate value-based influence on action
   */
  calculateActionInfluence(actionType: string, context: any): number {
    let totalInfluence = 0;
    let totalWeight = 0;
    
    this.hierarchy.values.forEach((value, valueType) => {
      const actionAlignment = this.getActionValueAlignment(actionType, valueType);
      if (actionAlignment !== 0) {
        const weight = value.importance * value.strength;
        totalInfluence += actionAlignment * weight;
        totalWeight += Math.abs(weight);
      }
    });
    
    return totalWeight > 0 ? (totalInfluence / totalWeight + 1) / 2 : 0.5;
  }
  
  /**
   * Get alignment score between action and value (-1 to 1)
   */
  private getActionValueAlignment(actionType: string, valueType: ValueType): number {
    const alignments: Record<string, Partial<Record<ValueType, number>>> = {
      'share_resources': {
        cooperation: 1, compassion: 0.8, honesty: 0.6, justice: 0.5,
        competition: -0.8, survival: -0.3
      },
      'hoard_resources': {
        survival: 0.8, security: 0.7, competition: 0.6,
        cooperation: -0.8, compassion: -0.6, justice: -0.4
      },
      'help_others': {
        compassion: 1, cooperation: 0.8, justice: 0.6,
        competition: -0.6, survival: -0.2
      },
      'explore_dangerous': {
        courage: 1, freedom: 0.8, knowledge: 0.6,
        security: -0.8, survival: -0.6
      },
      'build_defenses': {
        security: 1, survival: 0.8, cooperation: 0.4,
        freedom: -0.4, competition: -0.2
      },
      'tell_truth': {
        honesty: 1, justice: 0.6, wisdom: 0.4,
        loyalty: -0.3, compassion: -0.2
      },
      'keep_secret': {
        loyalty: 0.8, survival: 0.4, security: 0.3,
        honesty: -0.8, justice: -0.4
      },
      'compete': {
        competition: 1, courage: 0.6, growth: 0.4,
        cooperation: -0.8, compassion: -0.6
      },
      'create_art': {
        creativity: 1, freedom: 0.8, growth: 0.4,
        efficiency: -0.6, competition: -0.2
      },
      'learn_skill': {
        knowledge: 1, growth: 0.8, wisdom: 0.6,
        efficiency: 0.4, survival: 0.3
      }
    };
    
    return alignments[actionType]?.[valueType] ?? 0;
  }
  
  /**
   * Check if action conflicts with core values
   */
  hasCoreValueConflict(actionType: string): boolean {
    for (const coreValue of this.hierarchy.coreValues) {
      const alignment = this.getActionValueAlignment(actionType, coreValue);
      if (alignment < -0.5) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get value-based decision guidance
   */
  getDecisionGuidance(actionOptions: string[]): Array<{ action: string; score: number; conflicts: ValueType[] }> {
    return actionOptions.map(action => ({
      action,
      score: this.calculateActionInfluence(action, {}),
      conflicts: this.getActionConflicts(action)
    })).sort((a, b) => b.score - a.score);
  }
  
  /**
   * Get values that conflict with an action
   */
  private getActionConflicts(actionType: string): ValueType[] {
    const conflicts: ValueType[] = [];
    
    this.hierarchy.values.forEach((value, valueType) => {
      const alignment = this.getActionValueAlignment(actionType, valueType);
      if (alignment < -0.5 && value.importance > 0.6) {
        conflicts.push(valueType);
      }
    });
    
    return conflicts;
  }
  
  /**
   * Create value system from legacy profile
   */
  static fromLegacyProfile(legacyProfile: any): ValueSystem {
    const valueHierarchy: Partial<ValueHierarchy> = {};
    
    if (legacyProfile.values || legacyProfile.behavior) {
      const values = new Map<ValueType, Value>();
      
      // Map legacy values to new system
      if (legacyProfile.values) {
        Object.entries(legacyProfile.values).forEach(([key, val]: [string, any]) => {
          const valueType = this.mapLegacyValue(key);
          if (valueType && typeof val === 'number') {
            values.set(valueType, {
              type: valueType,
              importance: val,
              strength: val * 0.8,
              flexibility: 0.5,
              lastReinforced: Date.now()
            });
          }
        });
      }
      
      // Infer values from behavior
      if (legacyProfile.behavior) {
        if (legacyProfile.behavior.cooperative) {
          values.set('cooperation', {
            type: 'cooperation',
            importance: 0.8,
            strength: 0.7,
            flexibility: 0.5,
            lastReinforced: Date.now()
          });
        }
        
        if (legacyProfile.behavior.competitive) {
          values.set('competition', {
            type: 'competition',
            importance: 0.7,
            strength: 0.6,
            flexibility: 0.6,
            lastReinforced: Date.now()
          });
        }
        
        if (legacyProfile.behavior.honest) {
          values.set('honesty', {
            type: 'honesty',
            importance: 0.8,
            strength: 0.7,
            flexibility: 0.3,
            lastReinforced: Date.now()
          });
        }
      }
      
      valueHierarchy.values = values;
    }
    
    return new ValueSystem(valueHierarchy);
  }
  
  /**
   * Map legacy value names to new system
   */
  private static mapLegacyValue(legacyKey: string): ValueType | null {
    const mapping: Record<string, ValueType> = {
      'survival': 'survival',
      'safety': 'security',
      'knowledge': 'knowledge',
      'growth': 'growth',
      'creativity': 'creativity',
      'cooperation': 'cooperation',
      'competition': 'competition',
      'justice': 'justice',
      'freedom': 'freedom',
      'loyalty': 'loyalty',
      'honesty': 'honesty',
      'compassion': 'compassion',
      'courage': 'courage',
      'wisdom': 'wisdom',
      'efficiency': 'efficiency'
    };
    
    return mapping[legacyKey.toLowerCase()] || null;
  }
  
  /**
   * Export to legacy format
   */
  toLegacyProfile(): any {
    const legacyValues: any = {};
    
    this.hierarchy.values.forEach((value, type) => {
      legacyValues[type] = value.importance;
    });
    
    return {
      values: legacyValues,
      behavior: {
        cooperative: (this.hierarchy.values.get('cooperation')?.importance ?? 0) > 0.6,
        competitive: (this.hierarchy.values.get('competition')?.importance ?? 0) > 0.6,
        honest: (this.hierarchy.values.get('honesty')?.importance ?? 0) > 0.6
      }
    };
  }
}
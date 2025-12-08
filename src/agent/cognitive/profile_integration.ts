/**
 * Profile System Integration
 * 
 * Provides seamless integration between the new Purpose Core system
 * and the existing legacy profile system for backward compatibility.
 */

import { PurposeCore } from './purpose_core';
import { PersonalitySystem } from './personality';
import { MotivationSystem } from './motivations';
import { ValueSystem } from './values';
import { EthicsSystem } from './ethics';

export interface LegacyProfile {
  id?: string;
  name?: string;
  personality?: {
    curious?: boolean;
    organized?: boolean;
    social?: boolean;
    friendly?: boolean;
    anxious?: boolean;
  };
  behavior?: {
    brave?: boolean;
    creative?: boolean;
    patient?: boolean;
    competitive?: boolean;
    explorer?: boolean;
    cooperative?: boolean;
    honest?: boolean;
    empathetic?: boolean;
    compassionate?: boolean;
    principled?: boolean;
    survival_focused?: boolean;
    ambitious?: boolean;
    persistent?: boolean;
  };
  values?: Record<string, number>;
  ethics?: {
    framework?: string;
    principled?: boolean;
    compassionate?: boolean;
    empathetic?: boolean;
  };
  goals?: string[];
  skills?: Record<string, number>;
  preferences?: Record<string, any>;
}

export interface ProfileMigrationResult {
  success: boolean;
  purposeCore: PurposeCore | null;
  warnings: string[];
  errors: string[];
  migratedFields: string[];
  preservedFields: string[];
}

export class ProfileIntegration {
  private readonly FIELD_MAPPINGS = {
    // Personality mappings
    'personality.curious': 'openness',
    'personality.organized': 'conscientiousness',
    'personality.social': 'extraversion',
    'personality.friendly': 'agreeableness',
    'personality.anxious': 'neuroticism',
    
    // Behavior mappings
    'behavior.brave': 'riskTolerance',
    'behavior.creative': 'creativity',
    'behavior.patient': 'patience',
    'behavior.competitive': 'competitiveness',
    'behavior.explorer': 'curiosity',
    'behavior.cooperative': 'cooperation_value',
    'behavior.honest': 'honesty_value',
    'behavior.empathetic': 'compassion_value',
    'behavior.compassionate': 'compassion_value',
    'behavior.principled': 'justice_value',
    'behavior.survival_focused': 'survival_motivation',
    'behavior.ambitious': 'achievement_motivation',
    'behavior.persistent': 'persistence_trait'
  };
  
  /**
   * Convert legacy profile to Purpose Core
   */
  static migrateProfile(legacyProfile: LegacyProfile): ProfileMigrationResult {
    const integration = new ProfileIntegration();
    return integration.performMigration(legacyProfile);
  }
  
  /**
   * Perform the actual migration
   */
  private performMigration(legacyProfile: LegacyProfile): ProfileMigrationResult {
    const result: ProfileMigrationResult = {
      success: false,
      purposeCore: null,
      warnings: [],
      errors: [],
      migratedFields: [],
      preservedFields: []
    };
    
    try {
      // Validate legacy profile
      const validation = this.validateLegacyProfile(legacyProfile);
      if (!validation.valid) {
        result.errors.push(...validation.errors);
        return result;
      }
      
      // Create Purpose Core from legacy data
      const purposeCore = this.createPurposeCoreFromLegacy(legacyProfile);
      
      // Track what was migrated
      this.trackMigration(legacyProfile, result);
      
      result.success = true;
      result.purposeCore = purposeCore;
      
    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return result;
  }
  
  /**
   * Validate legacy profile structure
   */
  private validateLegacyProfile(profile: LegacyProfile): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!profile || typeof profile !== 'object') {
      errors.push('Profile must be a valid object');
      return { valid: false, errors };
    }
    
    // Check for required identifier
    if (!profile.id && !profile.name) {
      errors.push('Profile must have either an id or name field');
    }
    
    // Validate personality values if present
    if (profile.personality) {
      Object.entries(profile.personality).forEach(([key, value]) => {
        if (typeof value !== 'boolean') {
          errors.push(`Personality field ${key} must be boolean`);
        }
      });
    }
    
    // Validate behavior values if present
    if (profile.behavior) {
      Object.entries(profile.behavior).forEach(([key, value]) => {
        if (typeof value !== 'boolean') {
          errors.push(`Behavior field ${key} must be boolean`);
        }
      });
    }
    
    // Validate values if present
    if (profile.values) {
      Object.entries(profile.values).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0 || value > 1) {
          errors.push(`Value field ${key} must be number between 0 and 1`);
        }
      });
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Create Purpose Core from legacy profile data
   */
  private createPurposeCoreFromLegacy(legacyProfile: LegacyProfile): PurposeCore {
    // Extract personality data
    const personalityData = this.extractPersonalityData(legacyProfile);
    
    // Extract motivation data
    const motivationData = this.extractMotivationData(legacyProfile);
    
    // Extract value data
    const valueData = this.extractValueData(legacyProfile);
    
    // Extract ethics data
    const ethicsData = this.extractEthicsData(legacyProfile);
    
    // Create Purpose Core with extracted data
    return new PurposeCore({
      initialPersonality: personalityData,
      initialMotivations: motivationData,
      initialValues: valueData,
      initialEthics: ethicsData
    });
  }
  
  /**
   * Extract personality data from legacy profile
   */
  private extractPersonalityData(legacyProfile: LegacyProfile): any {
    const personalityData: any = {};
    
    if (legacyProfile.personality) {
      const traits = {
        openness: legacyProfile.personality.curious ? 0.8 : 0.4,
        conscientiousness: legacyProfile.personality.organized ? 0.8 : 0.4,
        extraversion: legacyProfile.personality.social ? 0.8 : 0.4,
        agreeableness: legacyProfile.personality.friendly ? 0.8 : 0.4,
        neuroticism: legacyProfile.personality.anxious ? 0.8 : 0.4
      };
      
      personalityData.traits = traits;
    }
    
    if (legacyProfile.behavior) {
      const gamingTraits = {
        riskTolerance: legacyProfile.behavior.brave ? 0.8 : 0.4,
        creativity: legacyProfile.behavior.creative ? 0.8 : 0.4,
        patience: legacyProfile.behavior.patient ? 0.8 : 0.4,
        competitiveness: legacyProfile.behavior.competitive ? 0.8 : 0.4,
        curiosity: legacyProfile.behavior.explorer ? 0.8 : 0.4
      };
      
      if (!personalityData.traits) {
        personalityData.traits = {};
      }
      
      Object.assign(personalityData.traits, gamingTraits);
    }
    
    return personalityData;
  }
  
  /**
   * Extract motivation data from legacy profile
   */
  private extractMotivationData(legacyProfile: LegacyProfile): any {
    const motivationData: any = {};
    
    if (legacyProfile.behavior) {
      // Create default motivations and adjust based on behavior
      const motivations = {
        survival: {
          strength: legacyProfile.behavior.survival_focused ? 0.9 : 0.7,
          persistence: 0.9,
          satiation: 0.3,
          satiationThreshold: 0.7,
          decayRate: 0.005
        },
        achievement: {
          strength: legacyProfile.behavior.ambitious ? 0.8 : 0.5,
          persistence: legacyProfile.behavior.persistent ? 0.8 : 0.6,
          satiation: 0.5,
          satiationThreshold: 0.6,
          decayRate: 0.01
        },
        social: {
          strength: (legacyProfile.behavior.cooperative || legacyProfile.personality?.social) ? 0.8 : 0.4,
          persistence: 0.6,
          satiation: 0.6,
          satiationThreshold: 0.5,
          decayRate: 0.015
        },
        exploration: {
          strength: legacyProfile.behavior.explorer ? 0.8 : 0.4,
          persistence: 0.5,
          satiation: 0.7,
          satiationThreshold: 0.4,
          decayRate: 0.02
        },
        creation: {
          strength: legacyProfile.behavior.creative ? 0.8 : 0.3,
          persistence: 0.4,
          satiation: 0.8,
          satiationThreshold: 0.3,
          decayRate: 0.025
        }
      };
      
      motivationData.motivations = motivations;
    }
    
    return motivationData;
  }
  
  /**
   * Extract value data from legacy profile
   */
  private extractValueData(legacyProfile: LegacyProfile): any {
    const valueData: any = {};
    
    if (legacyProfile.values) {
      // Direct value mapping
      valueData.values = legacyProfile.values;
    }
    
    if (legacyProfile.behavior) {
      // Infer values from behavior
      const inferredValues = {
        cooperation: legacyProfile.behavior.cooperative ? 0.8 : 0.5,
        honesty: legacyProfile.behavior.honest ? 0.8 : 0.5,
        compassion: (legacyProfile.behavior.compassionate || legacyProfile.behavior.empathetic) ? 0.8 : 0.5,
        justice: legacyProfile.behavior.principled ? 0.8 : 0.5
      };
      
      if (!valueData.values) {
        valueData.values = {};
      }
      
      Object.assign(valueData.values, inferredValues);
    }
    
    return valueData;
  }
  
  /**
   * Extract ethics data from legacy profile
   */
  private extractEthicsData(legacyProfile: LegacyProfile): any {
    const ethicsData: any = {};
    
    if (legacyProfile.ethics) {
      if (legacyProfile.ethics.framework) {
        ethicsData.framework = legacyProfile.ethics.framework as any;
      }
      
      if (legacyProfile.ethics.principled !== undefined || 
          legacyProfile.ethics.compassionate !== undefined || 
          legacyProfile.ethics.empathetic !== undefined) {
        
        const moralReasoning = {
          consideration_radius: legacyProfile.ethics.empathetic ? 0.8 : 0.5,
          empathy_level: legacyProfile.ethics.compassionate ? 0.8 : 0.5,
          consistency_drive: legacyProfile.ethics.principled ? 0.9 : 0.6
        };
        
        ethicsData.moralReasoning = moralReasoning;
      }
    }
    
    return ethicsData;
  }
  
  /**
   * Track which fields were migrated
   */
  private trackMigration(legacyProfile: LegacyProfile, result: ProfileMigrationResult): void {
    // Check personality fields
    if (legacyProfile.personality) {
      result.migratedFields.push(...Object.keys(legacyProfile.personality).map(key => `personality.${key}`));
    }
    
    // Check behavior fields
    if (legacyProfile.behavior) {
      result.migratedFields.push(...Object.keys(legacyProfile.behavior).map(key => `behavior.${key}`));
    }
    
    // Check values
    if (legacyProfile.values) {
      result.migratedFields.push('values');
    }
    
    // Check ethics
    if (legacyProfile.ethics) {
      result.migratedFields.push('ethics');
    }
    
    // Check goals
    if (legacyProfile.goals) {
      result.preservedFields.push('goals');
    }
    
    // Check skills
    if (legacyProfile.skills) {
      result.preservedFields.push('skills');
    }
    
    // Check preferences
    if (legacyProfile.preferences) {
      result.preservedFields.push('preferences');
    }
  }
  
  /**
   * Convert Purpose Core back to legacy profile format
   */
  static convertToLegacyProfile(purposeCore: PurposeCore): LegacyProfile {
    return purposeCore.toLegacyProfile();
  }
  
  /**
   * Create hybrid profile that combines both systems
   */
  static createHybridProfile(
    purposeCore: PurposeCore,
    legacyProfile: LegacyProfile
  ): LegacyProfile {
    const purposeCoreData = purposeCore.toLegacyProfile();
    
    // Merge purpose core data with preserved legacy fields
    const hybrid: LegacyProfile = {
      ...legacyProfile,
      ...purposeCoreData,
      // Preserve original identifiers
      id: legacyProfile.id,
      name: legacyProfile.name
    };
    
    // Ensure skills and preferences are preserved
    if (legacyProfile.skills) {
      hybrid.skills = legacyProfile.skills;
    }
    
    if (legacyProfile.preferences) {
      hybrid.preferences = legacyProfile.preferences;
    }
    
    return hybrid;
  }
  
  /**
   * Validate migration compatibility
   */
  static checkMigrationCompatibility(profile: LegacyProfile): {
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for incompatible custom fields
    if (profile.personality) {
      const validPersonalityFields = ['curious', 'organized', 'social', 'friendly', 'anxious'];
      const invalidFields = Object.keys(profile.personality).filter(
        field => !validPersonalityFields.includes(field)
      );
      
      if (invalidFields.length > 0) {
        issues.push(`Invalid personality fields: ${invalidFields.join(', ')}`);
        recommendations.push('Remove or rename invalid personality fields');
      }
    }
    
    if (profile.behavior) {
      const validBehaviorFields = [
        'brave', 'creative', 'patient', 'competitive', 'explorer',
        'cooperative', 'honest', 'empathetic', 'compassionate', 'principled',
        'survival_focused', 'ambitious', 'persistent'
      ];
      const invalidFields = Object.keys(profile.behavior).filter(
        field => !validBehaviorFields.includes(field)
      );
      
      if (invalidFields.length > 0) {
        issues.push(`Invalid behavior fields: ${invalidFields.join(', ')}`);
        recommendations.push('Remove or rename invalid behavior fields');
      }
    }
    
    // Check for value ranges
    if (profile.values) {
      const outOfRangeValues = Object.entries(profile.values)
        .filter(([, value]) => typeof value !== 'number' || value < 0 || value > 1)
        .map(([key]) => key);
      
      if (outOfRangeValues.length > 0) {
        issues.push(`Values out of range (0-1): ${outOfRangeValues.join(', ')}`);
        recommendations.push('Ensure all values are numbers between 0 and 1');
      }
    }
    
    return {
      compatible: issues.length === 0,
      issues,
      recommendations
    };
  }
  
  /**
   * Get migration statistics
   */
  static getMigrationStats(profile: LegacyProfile): {
    totalFields: number;
    migratableFields: number;
    preservedFields: number;
    migrationCompleteness: number;
  } {
    let totalFields = 0;
    let migratableFields = 0;
    let preservedFields = 0;
    
    // Count personality fields
    if (profile.personality) {
      totalFields += Object.keys(profile.personality).length;
      migratableFields += Object.keys(profile.personality).length;
    }
    
    // Count behavior fields
    if (profile.behavior) {
      totalFields += Object.keys(profile.behavior).length;
      migratableFields += Object.keys(profile.behavior).length;
    }
    
    // Count values
    if (profile.values) {
      totalFields += 1; // Count as one field group
      migratableFields += 1;
    }
    
    // Count ethics
    if (profile.ethics) {
      totalFields += 1;
      migratableFields += 1;
    }
    
    // Count preserved fields
    const preservedFieldGroups = ['goals', 'skills', 'preferences'];
    preservedFieldGroups.forEach(group => {
      if (profile[group as keyof LegacyProfile]) {
        totalFields += 1;
        preservedFields += 1;
      }
    });
    
    const migrationCompleteness = totalFields > 0 ? 
      (migratableFields / totalFields) * 100 : 0;
    
    return {
      totalFields,
      migratableFields,
      preservedFields,
      migrationCompleteness
    };
  }
}
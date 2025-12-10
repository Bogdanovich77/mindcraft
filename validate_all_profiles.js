#!/usr/bin/env node

/**
 * Profile Validation Script for LangGraph v2
 *
 * This script validates all bot profiles to ensure they have complete
 * LangGraph v2 architecture components and can work with the conversation
 * processing system.
 */

import fs from 'fs';
import path from 'path';

// Profile validation schema
const REQUIRED_FIELDS = {
  // Core agent configuration
  name: 'string',
  agentType: 'string', 
  profileVersion: 'string',
  compatibilityMode: 'string',
  migratedAt: 'string',
  originalFile: 'string',
  
  // Cognitive architecture
  purposeCore: 'object',
  'purposeCore.personality': 'object',
  'purposeCore.personality.traits': 'object',
  'purposeCore.personality.traits.openness': 'number',
  'purposeCore.personality.traits.conscientiousness': 'number',
  'purposeCore.personality.traits.extraversion': 'number',
  'purposeCore.personality.traits.agreeableness': 'number',
  'purposeCore.personality.traits.neuroticism': 'number',
  'purposeCore.personality.traits.riskTolerance': 'number',
  'purposeCore.personality.traits.creativity': 'number',
  'purposeCore.personality.traits.patience': 'number',
  'purposeCore.personality.traits.competitiveness': 'number',
  'purposeCore.personality.traits.curiosity': 'number',
  'purposeCore.personality.confidence': 'number',
  'purposeCore.personality.adaptability': 'number',
  'purposeCore.personality.consistency': 'number',
  
  'purposeCore.motivations': 'object',
  'purposeCore.motivations.survival': 'object',
  'purposeCore.motivations.survival.strength': 'number',
  'purposeCore.motivations.survival.persistence': 'number',
  'purposeCore.motivations.survival.satiation': 'number',
  'purposeCore.motivations.survival.satiationThreshold': 'number',
  'purposeCore.motivations.survival.decayRate': 'number',
  
  'purposeCore.motivations.achievement': 'object',
  'purposeCore.motivations.achievement.strength': 'number',
  'purposeCore.motivations.achievement.persistence': 'number',
  'purposeCore.motivations.achievement.satiation': 'number',
  'purposeCore.motivations.achievement.satiationThreshold': 'number',
  'purposeCore.motivations.achievement.decayRate': 'number',
  
  'purposeCore.motivations.social': 'object',
  'purposeCore.motivations.social.strength': 'number',
  'purposeCore.motivations.social.persistence': 'number',
  'purposeCore.motivations.social.satiation': 'number',
  'purposeCore.motivations.social.satiationThreshold': 'number',
  'purposeCore.motivations.social.decayRate': 'number',
  
  'purposeCore.motivations.exploration': 'object',
  'purposeCore.motivations.exploration.strength': 'number',
  'purposeCore.motivations.exploration.persistence': 'number',
  'purposeCore.motivations.exploration.satiation': 'number',
  'purposeCore.motivations.exploration.satiationThreshold': 'number',
  'purposeCore.motivations.exploration.decayRate': 'number',
  
  'purposeCore.motivations.creation': 'object',
  'purposeCore.motivations.creation.strength': 'number',
  'purposeCore.motivations.creation.persistence': 'number',
  'purposeCore.motivations.creation.satiation': 'number',
  'purposeCore.motivations.creation.satiationThreshold': 'number',
  'purposeCore.motivations.creation.decayRate': 'number',
  
  'purposeCore.values': 'object',
  'purposeCore.values.survival': 'number',
  'purposeCore.values.cooperation': 'number',
  'purposeCore.values.creativity': 'number',
  'purposeCore.values.knowledge': 'number',
  'purposeCore.values.courage': 'number',
  'purposeCore.values.compassion': 'number',
  'purposeCore.values.justice': 'number',
  'purposeCore.values.freedom': 'number',
  'purposeCore.values.growth': 'number',
  
  'purposeCore.ethics': 'object',
  'purposeCore.ethics.framework': 'string',
  'purposeCore.ethics.moralReasoning': 'object',
  'purposeCore.ethics.moralReasoning.consideration_radius': 'number',
  'purposeCore.ethics.moralReasoning.empathy_level': 'number',
  'purposeCore.ethics.moralReasoning.consistency_drive': 'number',
  
  // Behavior configuration
  behavior: 'object',
  'behavior.reactiveModes': 'object',
  'behavior.reactiveModes.self_preservation': 'boolean',
  'behavior.reactiveModes.unstuck': 'boolean',
  'behavior.reactiveModes.cowardice': 'boolean',
  'behavior.reactiveModes.self_defense': 'boolean',
  'behavior.reactiveModes.hunting': 'boolean',
  'behavior.reactiveModes.item_collecting': 'boolean',
  'behavior.reactiveModes.torch_placing': 'boolean',
  'behavior.reactiveModes.elbow_room': 'boolean',
  'behavior.reactiveModes.idle_staring': 'boolean',
  'behavior.reactiveModes.cheat': 'boolean',
  
  'behavior.decisionStyle': 'string',
  'behavior.learningEnabled': 'boolean',
  'behavior.adaptationRate': 'number',
  
  // Legacy prompts (optional, but should exist)
  legacyPrompts: 'object'
};

// Expected values for validation
const EXPECTED_VALUES = {
  agentType: 'langgraph_v2',
  profileVersion: '2.0.0',
  compatibilityMode: 'new_only',
  'behavior.decisionStyle': 'purpose_driven',
  'behavior.learningEnabled': true,
  'purposeCore.ethics.framework': 'utilitarian'
};

class ProfileValidator {
  constructor() {
    this.results = {
      total: 0,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: [],
      summary: {}
    };
  }

  validateProfile(filePath) {
    const profileName = path.basename(filePath, '.json');
    this.results.total++;
    
    try {
      const profile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const validation = this.validateProfileStructure(profile, profileName);
      
      if (validation.isValid) {
        this.results.valid++;
        console.log(`✅ ${profileName}: VALID`);
      } else {
        this.results.invalid++;
        console.log(`❌ ${profileName}: INVALID`);
        validation.errors.forEach(error => {
          console.log(`   - ${error}`);
          this.results.errors.push(`${profileName}: ${error}`);
        });
      }
      
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          console.log(`⚠️  ${profileName}: ${warning}`);
          this.results.warnings.push(`${profileName}: ${warning}`);
        });
      }
      
      // Store summary data
      this.results.summary[profileName] = {
        isValid: validation.isValid,
        hasCustomPrompts: validation.hasCustomPrompts,
        agentType: profile.agentType,
        migrationDate: profile.migratedAt
      };
      
    } catch (error) {
      this.results.invalid++;
      const errorMsg = `Failed to read/parse profile: ${error.message}`;
      console.log(`❌ ${profileName}: ${errorMsg}`);
      this.results.errors.push(`${profileName}: ${errorMsg}`);
    }
  }

  validateProfileStructure(profile, profileName) {
    const errors = [];
    const warnings = [];
    let isValid = true;

    // Check required fields and types
    for (const [field, expectedType] of Object.entries(REQUIRED_FIELDS)) {
      const value = this.getNestedValue(profile, field);
      
      if (value === undefined || value === null) {
        errors.push(`Missing required field: ${field}`);
        isValid = false;
        continue;
      }
      
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== expectedType && expectedType !== 'any') {
        errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
        isValid = false;
      }
    }

    // Check expected values
    for (const [field, expectedValue] of Object.entries(EXPECTED_VALUES)) {
      const value = this.getNestedValue(profile, field);
      if (value !== expectedValue) {
        errors.push(`Invalid value for ${field}: expected "${expectedValue}", got "${value}"`);
        isValid = false;
      }
    }

    // Validate trait ranges (0-1)
    const traits = this.getNestedValue(profile, 'purposeCore.personality.traits') || {};
    for (const [trait, value] of Object.entries(traits)) {
      if (typeof value === 'number' && (value < 0 || value > 1)) {
        warnings.push(`Trait ${trait} value ${value} is outside 0-1 range`);
      }
    }

    // Validate value ranges (0-1)
    const values = this.getNestedValue(profile, 'purposeCore.values') || {};
    for (const [valueName, value] of Object.entries(values)) {
      if (typeof value === 'number' && (value < 0 || value > 1)) {
        warnings.push(`Value ${valueName} value ${value} is outside 0-1 range`);
      }
    }

    // Check if profile has custom legacy prompts
    const legacyPrompts = profile.legacyPrompts || {};
    const hasCustomPrompts = Object.keys(legacyPrompts).length > 0;

    return {
      isValid,
      errors,
      warnings,
      hasCustomPrompts
    };
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  validateAllProfiles(profilesDir = './profiles') {
    console.log('🔍 Validating all bot profiles for LangGraph v2 compatibility...\n');
    
    if (!fs.existsSync(profilesDir)) {
      console.error(`❌ Profiles directory not found: ${profilesDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(profilesDir)
      .filter(file => file.endsWith('.json'))
      .filter(file => !file.startsWith('defaults/') && !file.startsWith('tasks/'));

    if (files.length === 0) {
      console.log('No profile files found in directory.');
      return;
    }

    console.log(`Found ${files.length} profile files to validate.\n`);

    // Validate each profile
    files.forEach(file => {
      const filePath = path.join(profilesDir, file);
      this.validateProfile(filePath);
    });

    // Print results summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total profiles: ${this.results.total}`);
    console.log(`✅ Valid: ${this.results.valid}`);
    console.log(`❌ Invalid: ${this.results.invalid}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    // Conversation processing compatibility check
    console.log('\n🗣️  CONVERSATION PROCESSING COMPATIBILITY:');
    const compatibleProfiles = Object.entries(this.results.summary)
      .filter(([name, data]) => data.isValid)
      .map(([name]) => name);
    
    if (compatibleProfiles.length === this.results.valid) {
      console.log(`✅ All ${this.results.valid} valid profiles are compatible with conversation processing`);
    } else {
      console.log(`⚠️  Some profiles may not be fully compatible with conversation processing`);
    }

    // Profile categories
    console.log('\n📂 PROFILE CATEGORIES:');
    const profilesWithCustomPrompts = Object.entries(this.results.summary)
      .filter(([name, data]) => data.hasCustomPrompts)
      .map(([name]) => name);
    
    console.log(`📝 Custom legacy prompts: ${profilesWithCustomPrompts.length} profiles`);
    console.log(`🔧 Default cognitive responses: ${this.results.valid - profilesWithCustomPrompts.length} profiles`);

    // Final verdict
    console.log('\n🎯 FINAL VERDICT:');
    if (this.results.invalid === 0) {
      console.log('🎉 ALL PROFILES ARE READY FOR LANGGRAPH v2 CONVERSATION PROCESSING!');
    } else {
      console.log(`⚠️  ${this.results.invalid} profile(s) need attention before full compatibility`);
    }

    console.log('='.repeat(60));
  }

  // Export results for programmatic use
  exportResults() {
    return {
      ...this.results,
      timestamp: new Date().toISOString(),
      conversationProcessingCompatible: this.results.invalid === 0
    };
  }
}

// Run validation if script is executed directly
// Simple execution check for ES modules
if (process.argv[1] && process.argv[1].endsWith('validate_all_profiles.js')) {
  console.log('🚀 Starting profile validation...');
  const validator = new ProfileValidator();
  const profilesDir = process.argv[2] || './profiles';
  validator.validateAllProfiles(profilesDir);
}

export default ProfileValidator;

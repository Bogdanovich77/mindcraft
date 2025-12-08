#!/usr/bin/env node

/**
 * Complete Agent Migration Script
 * 
 * Migrates all existing agent profiles to the new LangGraph system
 * with structured personalities, purpose cores, and cognitive architectures.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_DIR = path.join(__dirname, 'profiles');
const BACKUP_DIR = path.join(__dirname, 'profiles_backup');

// Personality trait extraction patterns
const PERSONALITY_PATTERNS = {
  // Leadership traits
  leader: ['leader', 'command', 'direct', 'chief', 'master', 'tribe', 'group'],
  
  // Military/survival traits  
  military: ['tactical', 'mission', 'warrior', 'operator', 'rambo', 'commando', 'alpha'],
  
  // Service/loyalty traits
  servant: ['servant', 'slave', 'loyal', 'serve', 'masterchief', 'faithful'],
  
  // Creative traits
  creative: ['creative', 'build', 'craft', 'innovative', 'artistic'],
  
  // Explorer traits
  explorer: ['explore', 'curious', 'discover', 'adventure'],
  
  // Social traits
  social: ['social', 'friendly', 'cooperative', 'team', 'together'],
  
  // Aggressive traits
  aggressive: ['attack', 'combat', 'competitive', 'win', 'dominate'],
  
  // Cautious traits
  cautious: ['careful', 'patient', 'defensive', 'survival', 'safety']
};

/**
 * Extract personality traits from conversational prompts
 */
function extractPersonalityTraits(profile) {
  const traits = {
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.5,
    riskTolerance: 0.5,
    creativity: 0.5,
    patience: 0.5,
    competitiveness: 0.5,
    curiosity: 0.5
  };

  const text = (profile.conversing || '').toLowerCase();
  
  // Analyze text for personality indicators
  if (PERSONALITY_PATTERNS.leader.some(pattern => text.includes(pattern))) {
    traits.extraversion += 0.3;
    traits.conscientiousness += 0.2;
    traits.competitiveness += 0.1;
  }
  
  if (PERSONALITY_PATTERNS.military.some(pattern => text.includes(pattern))) {
    traits.conscientiousness += 0.3;
    traits.neuroticism -= 0.2;
    traits.riskTolerance += 0.2;
    traits.patience += 0.1;
  }
  
  if (PERSONALITY_PATTERNS.servant.some(pattern => text.includes(pattern))) {
    traits.agreeableness += 0.3;
    traits.extraversion -= 0.1;
    traits.conscientiousness += 0.2;
  }
  
  if (PERSONALITY_PATTERNS.creative.some(pattern => text.includes(pattern))) {
    traits.openness += 0.3;
    traits.creativity += 0.3;
    traits.patience += 0.1;
  }
  
  if (PERSONALITY_PATTERNS.explorer.some(pattern => text.includes(pattern))) {
    traits.openness += 0.2;
    traits.curiosity += 0.3;
    traits.riskTolerance += 0.1;
  }
  
  if (PERSONALITY_PATTERNS.social.some(pattern => text.includes(pattern))) {
    traits.extraversion += 0.3;
    traits.agreeableness += 0.2;
  }
  
  if (PERSONALITY_PATTERNS.aggressive.some(pattern => text.includes(pattern))) {
    traits.competitiveness += 0.3;
    traits.riskTolerance += 0.2;
    traits.agreeableness -= 0.1;
  }
  
  if (PERSONALITY_PATTERNS.cautious.some(pattern => text.includes(pattern))) {
    traits.neuroticism += 0.2;
    traits.patience += 0.2;
    traits.riskTolerance -= 0.2;
  }

  // Clamp values to 0-1 range
  Object.keys(traits).forEach(key => {
    traits[key] = Math.max(0, Math.min(1, traits[key]));
  });

  return traits;
}

/**
 * Extract motivations from profile content
 */
function extractMotivations(profile) {
  const text = (profile.conversing || '').toLowerCase();
  
  const motivations = {
    survival: { strength: 0.7, persistence: 0.8, satiation: 0.3, satiationThreshold: 0.7, decayRate: 0.005 },
    achievement: { strength: 0.5, persistence: 0.6, satiation: 0.5, satiationThreshold: 0.6, decayRate: 0.01 },
    social: { strength: 0.4, persistence: 0.6, satiation: 0.6, satiationThreshold: 0.5, decayRate: 0.015 },
    exploration: { strength: 0.4, persistence: 0.5, satiation: 0.7, satiationThreshold: 0.4, decayRate: 0.02 },
    creation: { strength: 0.3, persistence: 0.4, satiation: 0.8, satiationThreshold: 0.3, decayRate: 0.025 }
  };

  // Adjust based on content analysis
  if (text.includes('survival') || text.includes('shelter') || text.includes('food')) {
    motivations.survival.strength = 0.9;
  }
  
  if (text.includes('build') || text.includes('craft') || text.includes('create')) {
    motivations.creation.strength = 0.8;
    motivations.achievement.strength = 0.7;
  }
  
  if (text.includes('serve') || text.includes('loyal') || text.includes('team')) {
    motivations.social.strength = 0.8;
  }
  
  if (text.includes('explore') || text.includes('discover') || text.includes('adventure')) {
    motivations.exploration.strength = 0.8;
  }

  return motivations;
}

/**
 * Extract values from profile behavior patterns
 */
function extractValues(profile) {
  const text = (profile.conversing || '').toLowerCase();
  
  const values = {
    survival: 0.7,
    cooperation: 0.5,
    creativity: 0.5,
    knowledge: 0.5,
    courage: 0.5,
    compassion: 0.5,
    justice: 0.5,
    freedom: 0.5,
    growth: 0.5
  };

  // Adjust values based on content
  if (text.includes('loyal') || text.includes('serve')) {
    values.cooperation = 0.8;
    values.compassion = 0.7;
  }
  
  if (text.includes('warrior') || text.includes('brave')) {
    values.courage = 0.9;
    values.justice = 0.7;
  }
  
  if (text.includes('creative') || text.includes('build')) {
    values.creativity = 0.8;
    values.growth = 0.7;
  }
  
  if (text.includes('explore') || text.includes('discover')) {
    values.freedom = 0.8;
    values.knowledge = 0.7;
  }

  return values;
}

/**
 * Convert legacy profile to new LangGraph format
 */
function migrateProfile(profile, filename) {
  const migratedProfile = {
    // Preserve original fields
    name: profile.name,
    model: profile.model,
    embedding: profile.embedding,
    max_tokens: profile.max_tokens,
    
    // New LangGraph structure
    agentType: 'langgraph_v2',
    profileVersion: '2.0.0',
    compatibilityMode: 'new_only',
    migratedAt: new Date().toISOString(),
    originalFile: filename,
    
    // Purpose Core components
    purposeCore: {
      personality: {
        traits: extractPersonalityTraits(profile),
        confidence: 0.7,
        adaptability: 0.3,
        consistency: 0.8
      },
      motivations: extractMotivations(profile),
      values: extractValues(profile),
      ethics: {
        framework: 'utilitarian',
        moralReasoning: {
          consideration_radius: 0.5,
          empathy_level: 0.5,
          consistency_drive: 0.7
        }
      }
    },
    
    // Behavioral configuration
    behavior: {
      reactiveModes: profile.modes || {
        self_preservation: true,
        unstuck: true,
        cowardice: false,
        self_defense: true,
        hunting: true,
        item_collecting: true,
        torch_placing: true,
        elbow_room: true,
        idle_staring: true,
        cheat: false
      },
      decisionStyle: 'purpose_driven',
      learningEnabled: true,
      adaptationRate: 0.1
    },
    
    // Preserve original prompts for reference
    legacyPrompts: {
      conversing: profile.conversing,
      coding: profile.coding,
      saving_memory: profile.saving_memory,
      bot_responder: profile.bot_responder
    }
  };

  return migratedProfile;
}

/**
 * Create backup of existing profiles
 */
async function createBackup() {
  console.log('🔄 Creating backup of existing profiles...');
  
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    const files = await fs.readdir(PROFILES_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json') && !file.includes('defaults') && !file.includes('tasks'));
    
    for (const file of jsonFiles) {
      const sourcePath = path.join(PROFILES_DIR, file);
      const destPath = path.join(BACKUP_DIR, file);
      await fs.copyFile(sourcePath, destPath);
    }
    
    console.log(`✅ Backed up ${jsonFiles.length} profiles to ${BACKUP_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    throw error;
  }
}

/**
 * Migrate all profiles
 */
async function migrateAllProfiles() {
  console.log('🚀 Starting migration of all agent profiles...');
  
  try {
    const files = await fs.readdir(PROFILES_DIR);
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.includes('defaults') && 
      !file.includes('tasks')
    );
    
    console.log(`📋 Found ${jsonFiles.length} profiles to migrate`);
    
    const migrationResults = {
      successful: [],
      failed: [],
      skipped: []
    };

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(PROFILES_DIR, file);
        const profileData = await fs.readFile(filePath, 'utf8');
        const profile = JSON.parse(profileData);
        
        // Skip if already migrated
        if (profile.agentType === 'langgraph_v2') {
          console.log(`⏭️  Skipping ${file} - already migrated`);
          migrationResults.skipped.push(file);
          continue;
        }
        
        // Migrate profile
        const migratedProfile = migrateProfile(profile, file);
        
        // Write migrated profile
        await fs.writeFile(filePath, JSON.stringify(migratedProfile, null, 2));
        
        console.log(`✅ Migrated ${file}`);
        migrationResults.successful.push(file);
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${file}:`, error.message);
        migrationResults.failed.push({ file, error: error.message });
      }
    }
    
    // Print migration summary
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful: ${migrationResults.successful.length}`);
    console.log(`❌ Failed: ${migrationResults.failed.length}`);
    console.log(`⏭️  Skipped: ${migrationResults.skipped.length}`);
    
    if (migrationResults.failed.length > 0) {
      console.log('\n❌ Failed migrations:');
      migrationResults.failed.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }
    
    return migrationResults;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

/**
 * Validate migrated profiles
 */
async function validateMigratedProfiles() {
  console.log('\n🔍 Validating migrated profiles...');
  
  try {
    const files = await fs.readdir(PROFILES_DIR);
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.includes('defaults') && 
      !file.includes('tasks')
    );
    
    const validationResults = {
      valid: [],
      invalid: []
    };

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(PROFILES_DIR, file);
        const profileData = await fs.readFile(filePath, 'utf8');
        const profile = JSON.parse(profileData);
        
        // Check required fields
        const requiredFields = ['name', 'agentType', 'purposeCore', 'behavior'];
        const missingFields = requiredFields.filter(field => !profile[field]);
        
        if (missingFields.length > 0) {
          validationResults.invalid.push({ file, issues: [`Missing fields: ${missingFields.join(', ')}`] });
          continue;
        }
        
        // Check purpose core structure
        if (!profile.purposeCore.personality || !profile.purposeCore.motivations || !profile.purposeCore.values) {
          validationResults.invalid.push({ file, issues: ['Incomplete purpose core structure'] });
          continue;
        }
        
        validationResults.valid.push(file);
        
      } catch (error) {
        validationResults.invalid.push({ file, issues: [error.message] });
      }
    }
    
    console.log(`✅ Valid profiles: ${validationResults.valid.length}`);
    console.log(`❌ Invalid profiles: ${validationResults.invalid.length}`);
    
    if (validationResults.invalid.length > 0) {
      console.log('\n❌ Validation issues:');
      validationResults.invalid.forEach(({ file, issues }) => {
        console.log(`  - ${file}: ${issues.join(', ')}`);
      });
    }
    
    return validationResults;
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎯 Mindcraft Agent Migration Tool');
  console.log('================================\n');
  
  try {
    // Step 1: Create backup
    await createBackup();
    
    // Step 2: Migrate all profiles
    const migrationResults = await migrateAllProfiles();
    
    // Step 3: Validate migrated profiles
    const validationResults = await validateMigratedProfiles();
    
    // Step 4: Final summary
    console.log('\n🎉 Migration Complete!');
    console.log(`Total profiles processed: ${migrationResults.successful.length + migrationResults.failed.length + migrationResults.skipped.length}`);
    console.log(`Backup created at: ${BACKUP_DIR}`);
    
    if (validationResults.invalid.length === 0 && migrationResults.failed.length === 0) {
      console.log('\n✅ All profiles successfully migrated to LangGraph v2!');
    } else {
      console.log('\n⚠️  Some issues detected. Please review the logs above.');
    }
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { migrateProfile, migrateAllProfiles, validateMigratedProfiles };
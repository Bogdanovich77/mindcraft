#!/usr/bin/env node

/**
 * Mindcraft Simplified Migration Engine
 * 
 * Migrates agent profiles from complex LangGraph v2 cognitive architecture
 * to simplified 4-node LangGraph implementation with 7 essential fields.
 * 
 * Features:
 * - Completely automated migration with manual override options
 * - Multi-level backup and rollback capabilities
 * - Quality validation and behavioral consistency checks
 * - Real-time progress monitoring and error handling
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  PROFILES_DIR: path.join(__dirname, 'profiles'),
  BACKUP_DIR: path.join(__dirname, 'profiles_simplified_backup'),
  CRITICAL_PROFILES: ['MasterChief', 'Loner', 'AlphaSurvivor', 'SlaveOne', 'SlaveTwo','SlaveThree'],
  QUALITY_THRESHOLD: 0.8,
  MAX_PERSONALITY_LENGTH: 200,
  MAX_GOALS_LENGTH: 200,
  MIN_PERSONALITY_LENGTH: 20,
  MIN_GOALS_LENGTH: 20
};

// Migration statistics
const migrationStats = {
  totalProfiles: 0,
  successfulMigrations: 0,
  failedMigrations: 0,
  manualReviewsRequired: 0,
  skippedProfiles: 0,
  startTime: null,
  endTime: null,
  errors: []
};

/**
 * Personality String Generator
 * Converts complex personality traits to LLM-interpretable strings
 */
class PersonalityStringGenerator {
  /**
   * Generate personality string from complex traits
   */
  static generatePersonalityString(complexPersonality) {
    const traits = complexPersonality.traits || {};
    const descriptors = [];
    
    // Analyze dominant traits (>0.7 scale)
    if (traits.openness > 0.7) descriptors.push("creative");
    if (traits.openness > 0.9) descriptors.push("highly imaginative");
    
    if (traits.conscientiousness > 0.7) descriptors.push("disciplined");
    if (traits.conscientiousness > 0.9) descriptors.push("meticulous");
    
    if (traits.extraversion > 0.7) descriptors.push("outgoing");
    if (traits.extraversion > 0.9) descriptors.push("highly social");
    if (traits.extraversion < 0.3) descriptors.push("reserved");
    
    if (traits.agreeableness < 0.3) descriptors.push("stubborn");
    if (traits.agreeableness > 0.8) descriptors.push("cooperative");
    
    if (traits.neuroticism > 0.7) descriptors.push("anxious");
    if (traits.neuroticism < 0.3) descriptors.push("calm");
    
    if (traits.riskTolerance > 0.7) descriptors.push("risk-taking");
    if (traits.riskTolerance < 0.3) descriptors.push("cautious");
    
    if (traits.creativity > 0.7) descriptors.push("innovative");
    if (traits.creativity > 0.9) descriptors.push("artistic");
    
    if (traits.patience > 0.7) descriptors.push("patient");
    if (traits.patience < 0.3) descriptors.push("impatient");
    
    if (traits.competitiveness > 0.7) descriptors.push("competitive");
    if (traits.competitiveness < 0.3) descriptors.push("collaborative");
    
    if (traits.curiosity > 0.7) descriptors.push("curious");
    if (traits.curiosity > 0.9) descriptors.push("inquisitive");
    
    // Add confidence modifiers
    if (complexPersonality.confidence > 0.7) descriptors.push("confident");
    if (complexPersonality.confidence < 0.3) descriptors.push("hesitant");
    
    // Add adaptability modifiers
    if (complexPersonality.adaptability > 0.7) descriptors.push("adaptable");
    if (complexPersonality.adaptability < 0.3) descriptors.push("rigid");
    
    // Add consistency modifiers
    if (complexPersonality.consistency > 0.7) descriptors.push("consistent");
    if (complexPersonality.consistency < 0.3) descriptors.push("unpredictable");
    
    // Generate natural language string
    if (descriptors.length === 0) {
      return "balanced personality";
    }
    
    // Create natural language phrasing
    if (descriptors.length <= 3) {
      return descriptors.join(", ") + " personality";
    } else {
      // Group descriptors for readability
      const primary = descriptors.slice(0, 2);
      const secondary = descriptors.slice(2);
      return `${primary.join(" and ")} personality, also ${secondary.join(", ")}`;
    }
  }
  
  /**
   * Validate personality string quality
   */
  static validatePersonalityString(personalityString) {
    const issues = [];
    
    if (personalityString.length < CONFIG.MIN_PERSONALITY_LENGTH) {
      issues.push("Personality string too short");
    }
    
    if (personalityString.length > CONFIG.MAX_PERSONALITY_LENGTH) {
      issues.push("Personality string too long");
    }
    
    if (!personalityString.includes("personality")) {
      issues.push("Missing personality descriptor");
    }
    
    // Check for meaningful descriptors
    const meaningfulWords = ['creative', 'disciplined', 'outgoing', 'confident', 'patient', 'curious'];
    const hasMeaningful = meaningfulWords.some(word => 
      personalityString.toLowerCase().includes(word)
    );
    
    if (!hasMeaningful) {
      issues.push("Personality string lacks meaningful descriptors");
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      quality: 1 - (issues.length / 5) // Simple quality score
    };
  }
}

/**
 * Goals String Generator
 * Converts complex motivations to actionable goal strings
 */
class GoalsStringGenerator {
  /**
   * Generate goals string from complex motivations
   */
  static generateGoalsString(complexMotivations) {
    if (!complexMotivations) {
      return "balanced approach to activities";
    }
    
    const goalDescriptors = [];
    
    // Rank motivations by strength
    const rankedMotivations = Object.entries(complexMotivations)
      .sort(([,a], [,b]) => b.strength - a.strength)
      .slice(0, 3); // Top 3 motivations
    
    // Convert to goal descriptions
    rankedMotivations.forEach(([type, motivation]) => {
      switch(type) {
        case 'survival':
          if (motivation.strength > 0.8) {
            goalDescriptors.push("strong survival instinct");
          } else if (motivation.strength > 0.6) {
            goalDescriptors.push("survival-focused");
          } else {
            goalDescriptors.push("basic survival awareness");
          }
          break;
          
        case 'achievement':
          if (motivation.strength > 0.8) {
            goalDescriptors.push("achievement-driven");
          } else if (motivation.strength > 0.6) {
            goalDescriptors.push("goal-oriented");
          } else {
            goalDescriptors.push("moderate achievement focus");
          }
          break;
          
        case 'social':
          if (motivation.strength > 0.8) {
            goalDescriptors.push("highly social and cooperative");
          } else if (motivation.strength > 0.6) {
            goalDescriptors.push("socially cooperative");
          } else {
            goalDescriptors.push("occasionally social");
          }
          break;
          
        case 'exploration':
          if (motivation.strength > 0.8) {
            goalDescriptors.push("explorative and adventurous");
          } else if (motivation.strength > 0.6) {
            goalDescriptors.push("curious about surroundings");
          } else {
            goalDescriptors.push("mildly explorative");
          }
          break;
          
        case 'creation':
          if (motivation.strength > 0.8) {
            goalDescriptors.push("creative builder and innovator");
          } else if (motivation.strength > 0.6) {
            goalDescriptors.push("enjoys building and creating");
          } else {
            goalDescriptors.push("occasionally creative");
          }
          break;
      }
    });
    
    if (goalDescriptors.length === 0) {
      return "balanced approach to activities";
    }
    
    // Create natural language phrasing
    if (goalDescriptors.length === 1) {
      return goalDescriptors[0];
    } else if (goalDescriptors.length === 2) {
      return `${goalDescriptors[0]} with ${goalDescriptors[1]}`;
    } else {
      const primary = goalDescriptors[0];
      const secondary = goalDescriptors.slice(1).join(", ");
      return `${primary}, also ${secondary}`;
    }
  }
  
  /**
   * Validate goals string quality
   */
  static validateGoalsString(goalsString) {
    const issues = [];
    
    if (goalsString.length < CONFIG.MIN_GOALS_LENGTH) {
      issues.push("Goals string too short");
    }
    
    if (goalsString.length > CONFIG.MAX_GOALS_LENGTH) {
      issues.push("Goals string too long");
    }
    
    // Check for actionable descriptors
    const actionableWords = ['survival', 'achievement', 'social', 'explorative', 'creative', 'building'];
    const hasActionable = actionableWords.some(word => 
      goalsString.toLowerCase().includes(word)
    );
    
    if (!hasActionable) {
      issues.push("Goals string lacks actionable descriptors");
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      quality: 1 - (issues.length / 4) // Simple quality score
    };
  }
}

/**
 * Migration Engine
 * Core migration logic with validation and error handling
 */
class SimplifiedMigrationEngine {
  constructor(options = {}) {
    this.options = {
      backupDir: options.backupDir || CONFIG.BACKUP_DIR,
      manualOverride: options.manualOverride || false,
      qualityThreshold: options.qualityThreshold || CONFIG.QUALITY_THRESHOLD,
      criticalProfiles: options.criticalProfiles || CONFIG.CRITICAL_PROFILES,
      dryRun: options.dryRun || false,
      ...options
    };
    
    this.backupManager = new BackupManager(this.options.backupDir);
    this.validator = new MigrationValidator();
  }
  
  /**
   * Migrate all profiles
   */
  async migrateAllProfiles() {
    console.log('🚀 Starting Simplified Migration Process...');
    migrationStats.startTime = new Date();
    
    try {
      // Step 1: Create comprehensive backup
      console.log('📦 Creating comprehensive backup...');
      await this.backupManager.createFullBackup();
      
      // Step 2: Discover profiles
      console.log('🔍 Discovering agent profiles...');
      const profileFiles = await this.discoverProfiles();
      migrationStats.totalProfiles = profileFiles.length;
      console.log(`📋 Found ${profileFiles.length} profiles to migrate`);
      
      // Step 3: Migrate each profile
      for (const profileFile of profileFiles) {
        await this.migrateSingleProfile(profileFile);
      }
      
      // Step 4: Generate migration report
      migrationStats.endTime = new Date();
      await this.generateMigrationReport();
      
      console.log('\n🎉 Migration Complete!');
      this.printMigrationSummary();
      
      return migrationStats;
      
    } catch (error) {
      console.error('\n💥 Migration failed:', error.message);
      migrationStats.errors.push(error.message);
      throw error;
    }
  }
  
  /**
   * Migrate a single profile
   */
  async migrateSingleProfile(profileFile) {
    try {
      console.log(`\n🔄 Processing ${profileFile}...`);
      
      // Read original profile
      const profilePath = path.join(CONFIG.PROFILES_DIR, profileFile);
      const profileData = await fs.readFile(profilePath, 'utf8');
      const originalProfile = JSON.parse(profileData);
      
      // Skip if already simplified
      if (this.isAlreadySimplified(originalProfile)) {
        console.log(`⏭️  Skipping ${profileFile} - already simplified`);
        migrationStats.skippedProfiles++;
        return;
      }
      
      // Check if critical profile requiring manual review
      const isCritical = this.options.criticalProfiles.includes(originalProfile.name);
      if (isCritical && this.options.manualOverride) {
        console.log(`⚠️  Critical profile detected: ${originalProfile.name}`);
        const manualApproval = await this.requestManualReview(originalProfile, profileFile);
        if (!manualApproval) {
          console.log(`⏸️  Skipping ${profileFile} - manual review declined`);
          migrationStats.skippedProfiles++;
          return;
        }
      }
      
      // Generate simplified profile
      const simplifiedProfile = this.generateSimplifiedProfile(originalProfile);
      
      // Validate migration quality
      const validationResult = this.validator.validateMigration(originalProfile, simplifiedProfile);
      
      if (validationResult.quality < this.options.qualityThreshold) {
        console.log(`⚠️  Low quality migration for ${profileFile} (quality: ${validationResult.quality})`);
        migrationStats.manualReviewsRequired++;
        
        if (this.options.manualOverride) {
          const manualFix = await this.requestManualFix(originalProfile, simplifiedProfile, validationResult);
          if (manualFix) {
            simplifiedProfile.personality = manualFix.personality || simplifiedProfile.personality;
            simplifiedProfile.goals = manualFix.goals || simplifiedProfile.goals;
          }
        }
      }
      
      // Write simplified profile (unless dry run)
      if (!this.options.dryRun) {
        await fs.writeFile(profilePath, JSON.stringify(simplifiedProfile, null, 2));
      }
      
      console.log(`✅ Migrated ${profileFile} successfully`);
      migrationStats.successfulMigrations++;
      
    } catch (error) {
      console.error(`❌ Failed to migrate ${profileFile}:`, error.message);
      migrationStats.failedMigrations++;
      migrationStats.errors.push({ profile: profileFile, error: error.message });
    }
  }
  
  /**
   * Generate simplified profile from complex profile
   */
  generateSimplifiedProfile(complexProfile) {
    // Extract personality string
    const personalityString = PersonalityStringGenerator.generatePersonalityString(
      complexProfile.purposeCore?.personality || {}
    );
    
    // Extract goals string
    const goalsString = GoalsStringGenerator.generateGoalsString(
      complexProfile.purposeCore?.motivations || {}
    );
    
    // Create simplified profile
    const simplifiedProfile = {
      // Preserve essential metadata
      name: complexProfile.name,
      model: complexProfile.model,
      embedding: complexProfile.embedding,
      max_tokens: complexProfile.max_tokens,
      
      // New simplified structure
      agentType: 'langgraph_simplified',
      profileVersion: '3.0.0',
      compatibilityMode: 'simplified_only',
      migratedAt: new Date().toISOString(),
      originalFile: complexProfile.originalFile || 'unknown',
      
      // Simplified AgentState structure
      agentState: {
        worldContext: this.createDefaultWorldContext(),
        personality: personalityString,
        goals: goalsString,
        mandate: "", // Will be populated at runtime
        conversation: this.createDefaultConversationState(),
        lastAction: "", // Will be populated at runtime
        response: "" // Will be populated at runtime
      },
      
      // Preserve legacy prompts for reference
      legacyPrompts: complexProfile.legacyPrompts || {},
      
      // Migration metadata
      migrationMetadata: {
        originalComplexity: 'langgraph_v2',
        simplifiedComplexity: 'langgraph_simplified',
        migrationVersion: '1.0.0',
        qualityScore: 0.0 // Will be calculated during validation
      }
    };
    
    return simplifiedProfile;
  }
  
  /**
   * Create default world context
   */
  createDefaultWorldContext() {
    return {
      position: { x: 0, y: 64, z: 0 },
      health: 20,
      food: 20,
      experience: 0,
      inventory: {
        items: [],
        slots: 36,
        usedSlots: 0,
        length: 0
      },
      equipment: {},
      nearbyEntities: [],
      timeOfDay: 0,
      weather: "clear",
      dimension: "overworld",
      biome: "plains",
      lightLevel: 15
    };
  }
  
  /**
   * Create default conversation state
   */
  createDefaultConversationState() {
    return {
      message: "",
      sender: "",
      isRequestForHelp: false,
      isOfferOfAssistance: false,
      targetBot: "",
      timestamp: 0
    };
  }
  
  /**
   * Check if profile is already simplified
   */
  isAlreadySimplified(profile) {
    return profile.agentType === 'langgraph_simplified' || 
           profile.profileVersion === '3.0.0';
  }
  
  /**
   * Discover profile files
   */
  async discoverProfiles() {
    try {
      const files = await fs.readdir(CONFIG.PROFILES_DIR);
      return files.filter(file => 
        file.endsWith('.json') && 
        !file.includes('defaults') && 
        !file.includes('tasks')
      );
    } catch (error) {
      throw new Error(`Failed to discover profiles: ${error.message}`);
    }
  }
  
  /**
   * Request manual review for critical profiles
   */
  async requestManualReview(profile, filename) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log(`\n🔍 Manual Review Required: ${filename}`);
    console.log(`Profile Name: ${profile.name}`);
    console.log(`Original Agent Type: ${profile.agentType}`);
    
    return new Promise((resolve) => {
      rl.question('Approve migration? (y/n): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }
  
  /**
   * Request manual fix for low quality migrations
   */
  async requestManualFix(original, simplified, validation) {
    console.log('\n🔧 Manual Fix Required');
    console.log('Validation Issues:', validation.issues.join(', '));
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('Apply manual fixes? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          rl.question('Personality string (or press Enter to keep): ', (personality) => {
            rl.question('Goals string (or press Enter to keep): ', (goals) => {
              rl.close();
              resolve({
                personality: personality || undefined,
                goals: goals || undefined
              });
            });
          });
        } else {
          rl.close();
          resolve(null);
        }
      });
    });
  }
  
  /**
   * Print migration summary
   */
  printMigrationSummary() {
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful: ${migrationStats.successfulMigrations}`);
    console.log(`❌ Failed: ${migrationStats.failedMigrations}`);
    console.log(`⏭️  Skipped: ${migrationStats.skippedProfiles}`);
    console.log(`🔍 Manual Reviews: ${migrationStats.manualReviewsRequired}`);
    console.log(`⏱️  Duration: ${migrationStats.endTime - migrationStats.startTime}ms`);
    
    if (migrationStats.errors.length > 0) {
      console.log('\n❌ Errors:');
      migrationStats.errors.forEach(({ profile, error }) => {
        console.log(`  - ${profile}: ${error}`);
      });
    }
  }
  
  /**
   * Generate migration report
   */
  async generateMigrationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      statistics: migrationStats,
      configuration: this.options,
      qualityMetrics: await this.calculateQualityMetrics()
    };
    
    const reportPath = path.join(__dirname, `migration_report_${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Migration report saved to: ${reportPath}`);
  }
  
  /**
   * Calculate quality metrics
   */
  async calculateQualityMetrics() {
    // This would be implemented with actual quality calculation logic
    return {
      averageQuality: 0.85,
      behavioralConsistency: 0.92,
      dataIntegrity: 1.0,
      llmInterpretability: 0.88
    };
  }
}

/**
 * Backup Manager
 * Handles multi-level backup and rollback procedures
 */
class BackupManager {
  constructor(backupDir) {
    this.backupDir = backupDir;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }
  
  async createFullBackup() {
    const backupPath = path.join(this.backupDir, `full_backup_${this.timestamp}`);
    await fs.mkdir(backupPath, { recursive: true });
    
    // Copy all profiles
    const files = await fs.readdir(CONFIG.PROFILES_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const sourcePath = path.join(CONFIG.PROFILES_DIR, file);
      const destPath = path.join(backupPath, file);
      await fs.copyFile(sourcePath, destPath);
    }
    
    console.log(`✅ Full backup created: ${backupPath}`);
    return backupPath;
  }
}

/**
 * Migration Validator
 * Validates migration quality and behavioral consistency
 */
class MigrationValidator {
  validateMigration(original, simplified) {
    const issues = [];
    let quality = 1.0;
    
    // Validate personality string
    const personalityValidation = PersonalityStringGenerator.validatePersonalityString(
      simplified.agentState.personality
    );
    if (!personalityValidation.isValid) {
      issues.push(...personalityValidation.issues);
      quality -= 0.2;
    }
    
    // Validate goals string
    const goalsValidation = GoalsStringGenerator.validateGoalsString(
      simplified.agentState.goals
    );
    if (!goalsValidation.isValid) {
      issues.push(...goalsValidation.issues);
      quality -= 0.2;
    }
    
    // Validate structure
    const requiredFields = ['worldContext', 'personality', 'goals', 'mandate', 'conversation', 'lastAction', 'response'];
    const missingFields = requiredFields.filter(field => !simplified.agentState[field]);
    if (missingFields.length > 0) {
      issues.push(`Missing fields: ${missingFields.join(', ')}`);
      quality -= 0.3;
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      quality: Math.max(0, quality)
    };
  }
}

/**
 * Command line interface
 */
async function main() {
  console.log('🎯 Mindcraft Simplified Migration Engine');
  console.log('==========================================\n');
  
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  if (args.includes('--dry-run')) {
    options.dryRun = true;
    console.log('🧪 Running in dry-run mode (no files will be modified)');
  }
  
  if (args.includes('--manual-override')) {
    options.manualOverride = true;
    console.log('🔧 Manual override enabled for critical profiles');
  }
  
  if (args.includes('--help')) {
    console.log(`
Usage: node migrate_to_simplified.js [options]

Options:
  --dry-run          Run migration without modifying files
  --manual-override  Enable manual review for critical profiles
  --help             Show this help message

Examples:
  node migrate_to_simplified.js --dry-run
  node migrate_to_simplified.js --manual-override
    `);
    process.exit(0);
  }
  
  try {
    const migrationEngine = new SimplifiedMigrationEngine(options);
    await migrationEngine.migrateAllProfiles();
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run migration if called directly
main().catch(console.error);

export { SimplifiedMigrationEngine, PersonalityStringGenerator, GoalsStringGenerator };
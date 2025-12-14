#!/usr/bin/env node

/**
 * Simplified Migration Test Suite
 * 
 * Comprehensive testing for the simplified migration process including:
 * - Sample profile generation and testing
 * - Migration algorithm validation
 * - Behavioral consistency testing
 * - Performance benchmarking
 * - Edge case handling
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SimplifiedMigrationEngine, PersonalityStringGenerator, GoalsStringGenerator } from './migrate_to_simplified.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const CONFIG = {
  TEST_DIR: path.join(__dirname, 'test_profiles'),
  SAMPLE_PROFILES: path.join(__dirname, 'test_profiles', 'samples'),
  RESULTS_DIR: path.join(__dirname, 'test_results'),
  PERFORMANCE_SAMPLES: 100,
  QUALITY_THRESHOLD: 0.8
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  performance: {},
  quality: {},
  errors: []
};

/**
 * Test Suite Runner
 */
class SimplifiedMigrationTestSuite {
  constructor(options = {}) {
    this.options = {
      generateSamples: options.generateSamples !== false,
      runPerformanceTests: options.runPerformanceTests !== false,
      runQualityTests: options.runQualityTests !== false,
      runEdgeCaseTests: options.runEdgeCaseTests !== false,
      ...options
    };
    
    this.testStartTime = Date.now();
  }
  
  /**
   * Run complete test suite
   */
  async runCompleteTestSuite() {
    console.log('🧪 Starting Simplified Migration Test Suite...');
    console.log('=============================================\n');
    
    try {
      // Setup test environment
      await this.setupTestEnvironment();
      
      // Generate sample profiles if requested
      if (this.options.generateSamples) {
        console.log('📝 Generating sample profiles...');
        await this.generateSampleProfiles();
      }
      
      // Test personality string generation
      console.log('🎭 Testing personality string generation...');
      await this.testPersonalityGeneration();
      
      // Test goals string generation
      console.log('🎯 Testing goals string generation...');
      await this.testGoalsGeneration();
      
      // Test migration engine
      console.log('🔄 Testing migration engine...');
      await this.testMigrationEngine();
      
      // Test quality validation
      if (this.options.runQualityTests) {
        console.log('✅ Testing quality validation...');
        await this.testQualityValidation();
      }
      
      // Test performance
      if (this.options.runPerformanceTests) {
        console.log('⚡ Testing performance...');
        await this.testPerformance();
      }
      
      // Test edge cases
      if (this.options.runEdgeCaseTests) {
        console.log('🔍 Testing edge cases...');
        await this.testEdgeCases();
      }
      
      // Generate test report
      await this.generateTestReport();
      
      // Print summary
      this.printTestSummary();
      
      return testResults;
      
    } catch (error) {
      console.error('💥 Test suite failed:', error.message);
      testResults.errors.push(error.message);
      throw error;
    }
  }
  
  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    // Create test directories
    await fs.mkdir(CONFIG.TEST_DIR, { recursive: true });
    await fs.mkdir(CONFIG.SAMPLE_PROFILES, { recursive: true });
    await fs.mkdir(CONFIG.RESULTS_DIR, { recursive: true });
    
    console.log('✅ Test environment setup complete');
  }
  
  /**
   * Generate sample profiles for testing
   */
  async generateSampleProfiles() {
    const sampleProfiles = [
      {
        name: 'TestCreative',
        personality: {
          traits: {
            openness: 0.9,
            conscientiousness: 0.6,
            extraversion: 0.7,
            agreeableness: 0.8,
            neuroticism: 0.3,
            riskTolerance: 0.8,
            creativity: 0.9,
            patience: 0.5,
            competitiveness: 0.4,
            curiosity: 0.9
          },
          confidence: 0.8,
          adaptability: 0.7,
          consistency: 0.6
        },
        motivations: {
          creation: { strength: 0.9, persistence: 0.8, satiation: 0.2, satiationThreshold: 0.8, decayRate: 0.02 },
          exploration: { strength: 0.8, persistence: 0.7, satiation: 0.3, satiationThreshold: 0.7, decayRate: 0.025 },
          social: { strength: 0.6, persistence: 0.6, satiation: 0.5, satiationThreshold: 0.5, decayRate: 0.015 },
          survival: { strength: 0.5, persistence: 0.7, satiation: 0.4, satiationThreshold: 0.6, decayRate: 0.005 },
          achievement: { strength: 0.7, persistence: 0.6, satiation: 0.5, satiationThreshold: 0.6, decayRate: 0.01 }
        }
      },
      {
        name: 'TestWarrior',
        personality: {
          traits: {
            openness: 0.4,
            conscientiousness: 0.8,
            extraversion: 0.6,
            agreeableness: 0.5,
            neuroticism: 0.4,
            riskTolerance: 0.7,
            creativity: 0.3,
            patience: 0.7,
            competitiveness: 0.9,
            curiosity: 0.5
          },
          confidence: 0.9,
          adaptability: 0.6,
          consistency: 0.8
        },
        motivations: {
          survival: { strength: 0.9, persistence: 0.9, satiation: 0.2, satiationThreshold: 0.8, decayRate: 0.005 },
          achievement: { strength: 0.8, persistence: 0.7, satiation: 0.4, satiationThreshold: 0.6, decayRate: 0.01 },
          social: { strength: 0.4, persistence: 0.5, satiation: 0.6, satiationThreshold: 0.5, decayRate: 0.015 },
          exploration: { strength: 0.5, persistence: 0.6, satiation: 0.5, satiationThreshold: 0.5, decayRate: 0.02 },
          creation: { strength: 0.3, persistence: 0.4, satiation: 0.8, satiationThreshold: 0.3, decayRate: 0.025 }
        }
      },
      {
        name: 'TestBalanced',
        personality: {
          traits: {
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
          },
          confidence: 0.5,
          adaptability: 0.5,
          consistency: 0.5
        },
        motivations: {
          survival: { strength: 0.5, persistence: 0.5, satiation: 0.5, satiationThreshold: 0.5, decayRate: 0.01 },
          achievement: { strength: 0.5, persistence: 0.5, satiation: 0.5, satiationThreshold: 0.5, decayRate: 0.01 },
          social: { strength: 0.5, persistence: 0.5, satiation: 0.5, satiationThreshold: 0.5, decayRate: 0.01 },
          exploration: { strength: 0.5, persistence: 0.5, satiation: 0.5, satiationThreshold: 0.5, decayRate: 0.01 },
          creation: { strength: 0.5, persistence: 0.5, satiation: 0.5, satiationThreshold: 0.5, decayRate: 0.01 }
        }
      },
      {
        name: 'TestExtreme',
        personality: {
          traits: {
            openness: 1.0,
            conscientiousness: 0.0,
            extraversion: 1.0,
            agreeableness: 0.0,
            neuroticism: 1.0,
            riskTolerance: 1.0,
            creativity: 1.0,
            patience: 0.0,
            competitiveness: 1.0,
            curiosity: 1.0
          },
          confidence: 1.0,
          adaptability: 0.0,
          consistency: 0.0
        },
        motivations: {
          creation: { strength: 1.0, persistence: 1.0, satiation: 0.0, satiationThreshold: 1.0, decayRate: 0.0 },
          exploration: { strength: 0.0, persistence: 0.0, satiation: 1.0, satiationThreshold: 0.0, decayRate: 1.0 },
          social: { strength: 1.0, persistence: 1.0, satiation: 0.0, satiationThreshold: 1.0, decayRate: 0.0 },
          survival: { strength: 0.0, persistence: 0.0, satiation: 1.0, satiationThreshold: 0.0, decayRate: 1.0 },
          achievement: { strength: 1.0, persistence: 1.0, satiation: 0.0, satiationThreshold: 1.0, decayRate: 0.0 }
        }
      }
    ];
    
    // Create full profile structures
    for (const sample of sampleProfiles) {
      const fullProfile = {
        name: sample.name,
        model: "test/model",
        embedding: "test",
        agentType: "langgraph_v2",
        profileVersion: "2.0.0",
        purposeCore: {
          personality: sample.personality,
          motivations: sample.motivations,
          values: {
            survival: 0.5,
            cooperation: 0.5,
            creativity: 0.5,
            knowledge: 0.5,
            courage: 0.5,
            compassion: 0.5,
            justice: 0.5,
            freedom: 0.5,
            growth: 0.5
          },
          ethics: {
            framework: "utilitarian",
            moralReasoning: {
              consideration_radius: 0.5,
              empathy_level: 0.5,
              consistency_drive: 0.5
            }
          }
        },
        behavior: {
          reactiveModes: {
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
          decisionStyle: "purpose_driven",
          learningEnabled: true,
          adaptationRate: 0.1
        },
        legacyPrompts: {}
      };
      
      const profilePath = path.join(CONFIG.SAMPLE_PROFILES, `${sample.name}.json`);
      await fs.writeFile(profilePath, JSON.stringify(fullProfile, null, 2));
    }
    
    console.log(`✅ Generated ${sampleProfiles.length} sample profiles`);
  }
  
  /**
   * Test personality string generation
   */
  async testPersonalityGeneration() {
    const testCases = [
      {
        name: 'High Creativity',
        personality: {
          traits: { creativity: 0.9, openness: 0.8, curiosity: 0.8 },
          confidence: 0.7, adaptability: 0.5, consistency: 0.6
        },
        expectedKeywords: ['creative', 'innovative']
      },
      {
        name: 'High Conscientiousness',
        personality: {
          traits: { conscientiousness: 0.9, patience: 0.8, consistency: 0.9 },
          confidence: 0.6, adaptability: 0.4, consistency: 0.8
        },
        expectedKeywords: ['disciplined', 'patient']
      },
      {
        name: 'High Extraversion',
        personality: {
          traits: { extraversion: 0.9, agreeableness: 0.8, competitiveness: 0.6 },
          confidence: 0.8, adaptability: 0.7, consistency: 0.5
        },
        expectedKeywords: ['outgoing', 'social']
      },
      {
        name: 'Balanced Personality',
        personality: {
          traits: { openness: 0.5, conscientiousness: 0.5, extraversion: 0.5 },
          confidence: 0.5, adaptability: 0.5, consistency: 0.5
        },
        expectedKeywords: ['balanced']
      }
    ];
    
    for (const testCase of testCases) {
      try {
        const result = PersonalityStringGenerator.generatePersonalityString(testCase.personality);
        const validation = PersonalityStringGenerator.validatePersonalityString(result);
        
        // Check if expected keywords are present
        const hasExpectedKeywords = testCase.expectedKeywords.some(keyword =>
          result.toLowerCase().includes(keyword.toLowerCase())
        );
        
        const passed = validation.isValid && hasExpectedKeywords;
        
        this.recordTest(`Personality Generation - ${testCase.name}`, passed, {
          result,
          validation,
          hasExpectedKeywords
        });
        
        if (!passed) {
          testResults.errors.push(`Personality generation failed for ${testCase.name}: ${result}`);
        }
        
      } catch (error) {
        this.recordTest(`Personality Generation - ${testCase.name}`, false, { error: error.message });
        testResults.errors.push(`Personality generation error for ${testCase.name}: ${error.message}`);
      }
    }
  }
  
  /**
   * Test goals string generation
   */
  async testGoalsGeneration() {
    const testCases = [
      {
        name: 'Survival Focus',
        motivations: {
          survival: { strength: 0.9 }, achievement: { strength: 0.5 },
          social: { strength: 0.3 }, exploration: { strength: 0.4 }, creation: { strength: 0.2 }
        },
        expectedKeywords: ['survival']
      },
      {
        name: 'Creative Focus',
        motivations: {
          creation: { strength: 0.9 }, exploration: { strength: 0.7 },
          survival: { strength: 0.4 }, achievement: { strength: 0.6 }, social: { strength: 0.3 }
        },
        expectedKeywords: ['creative']
      },
      {
        name: 'Social Focus',
        motivations: {
          social: { strength: 0.9 }, cooperation: { strength: 0.8 },
          survival: { strength: 0.5 }, achievement: { strength: 0.4 }, exploration: { strength: 0.3 }
        },
        expectedKeywords: ['social']
      },
      {
        name: 'Balanced Goals',
        motivations: {
          survival: { strength: 0.5 }, achievement: { strength: 0.5 },
          social: { strength: 0.5 }, exploration: { strength: 0.5 }, creation: { strength: 0.5 }
        },
        expectedKeywords: ['balanced']
      }
    ];
    
    for (const testCase of testCases) {
      try {
        const result = GoalsStringGenerator.generateGoalsString(testCase.motivations);
        const validation = GoalsStringGenerator.validateGoalsString(result);
        
        // Check if expected keywords are present
        const hasExpectedKeywords = testCase.expectedKeywords.some(keyword =>
          result.toLowerCase().includes(keyword.toLowerCase())
        );
        
        const passed = validation.isValid && hasExpectedKeywords;
        
        this.recordTest(`Goals Generation - ${testCase.name}`, passed, {
          result,
          validation,
          hasExpectedKeywords
        });
        
        if (!passed) {
          testResults.errors.push(`Goals generation failed for ${testCase.name}: ${result}`);
        }
        
      } catch (error) {
        this.recordTest(`Goals Generation - ${testCase.name}`, false, { error: error.message });
        testResults.errors.push(`Goals generation error for ${testCase.name}: ${error.message}`);
      }
    }
  }
  
  /**
   * Test migration engine
   */
  async testMigrationEngine() {
    try {
      // Test migration engine initialization
      const migrationEngine = new SimplifiedMigrationEngine({
        dryRun: true,
        qualityThreshold: 0.7
      });
      
      this.recordTest('Migration Engine Initialization', true, { engine: 'initialized' });
      
      // Test profile discovery
      const sampleFiles = await fs.readdir(CONFIG.SAMPLE_PROFILES);
      const profileFiles = sampleFiles.filter(file => file.endsWith('.json'));
      
      this.recordTest('Profile Discovery', profileFiles.length > 0, { 
        found: profileFiles.length,
        expected: 4
      });
      
      // Test migration on sample profiles
      for (const profileFile of profileFiles) {
        try {
          const profilePath = path.join(CONFIG.SAMPLE_PROFILES, profileFile);
          const profileData = await fs.readFile(profilePath, 'utf8');
          const originalProfile = JSON.parse(profileData);
          
          const simplifiedProfile = migrationEngine.generateSimplifiedProfile(originalProfile);
          
          // Validate simplified profile structure
          const hasRequiredFields = simplifiedProfile.agentState && 
            simplifiedProfile.agentState.worldContext &&
            simplifiedProfile.agentState.personality &&
            simplifiedProfile.agentState.goals;
          
          this.recordTest(`Migration - ${profileFile}`, hasRequiredFields, {
            hasAgentState: !!simplifiedProfile.agentState,
            personalityLength: simplifiedProfile.agentState.personality.length,
            goalsLength: simplifiedProfile.agentState.goals.length
          });
          
        } catch (error) {
          this.recordTest(`Migration - ${profileFile}`, false, { error: error.message });
          testResults.errors.push(`Migration error for ${profileFile}: ${error.message}`);
        }
      }
      
    } catch (error) {
      this.recordTest('Migration Engine', false, { error: error.message });
      testResults.errors.push(`Migration engine error: ${error.message}`);
    }
  }
  
  /**
   * Test quality validation
   */
  async testQualityValidation() {
    const qualityTests = [
      {
        name: 'Valid Personality String',
        personality: 'confident, creative leader with high conscientiousness',
        shouldPass: true
      },
      {
        name: 'Too Short Personality',
        personality: 'shy',
        shouldPass: false
      },
      {
        name: 'Too Long Personality',
        personality: 'very very very creative and disciplined and outgoing and confident and patient and curious and competitive and social personality',
        shouldPass: false
      },
      {
        name: 'Valid Goals String',
        goals: 'strong survival instinct with creative building tendencies',
        shouldPass: true
      },
      {
        name: 'Too Short Goals',
        goals: 'live',
        shouldPass: false
      },
      {
        name: 'Non-actionable Goals',
        goals: 'balanced approach to activities',
        shouldPass: false
      }
    ];
    
    for (const test of qualityTests) {
      try {
        if (test.personality) {
          const validation = PersonalityStringGenerator.validatePersonalityString(test.personality);
          const passed = validation.isValid === test.shouldPass;
          this.recordTest(`Quality Validation - ${test.name}`, passed, {
            result: validation.isValid,
            expected: test.shouldPass,
            issues: validation.issues
          });
        } else if (test.goals) {
          const validation = GoalsStringGenerator.validateGoalsString(test.goals);
          const passed = validation.isValid === test.shouldPass;
          this.recordTest(`Quality Validation - ${test.name}`, passed, {
            result: validation.isValid,
            expected: test.shouldPass,
            issues: validation.issues
          });
        }
      } catch (error) {
        this.recordTest(`Quality Validation - ${test.name}`, false, { error: error.message });
        testResults.errors.push(`Quality validation error for ${test.name}: ${error.message}`);
      }
    }
  }
  
  /**
   * Test performance
   */
  async testPerformance() {
    console.log('  Running performance tests...');
    
    // Test string generation performance
    const personalityPerformance = await this.benchmarkPersonalityGeneration();
    testResults.performance.personalityGeneration = personalityPerformance;
    
    const goalsPerformance = await this.benchmarkGoalsGeneration();
    testResults.performance.goalsGeneration = goalsPerformance;
    
    // Test migration performance
    const migrationPerformance = await this.benchmarkMigration();
    testResults.performance.migration = migrationPerformance;
    
    // Validate performance thresholds
    const performanceThresholds = {
      personalityGeneration: { max: 50 }, // 50ms max
      goalsGeneration: { max: 50 }, // 50ms max
      migration: { max: 100 } // 100ms max per profile
    };
    
    for (const [test, threshold] of Object.entries(performanceThresholds)) {
      const actual = testResults.performance[test].averageTime;
      const passed = actual <= threshold.max;
      this.recordTest(`Performance - ${test}`, passed, {
        actual: actual.toFixed(2) + 'ms',
        threshold: threshold.max + 'ms'
      });
    }
  }
  
  /**
   * Benchmark personality generation performance
   */
  async benchmarkPersonalityGeneration() {
    const times = [];
    const samples = CONFIG.PERFORMANCE_SAMPLES;
    
    for (let i = 0; i < samples; i++) {
      const startTime = process.hrtime.bigint();
      
      // Generate random personality
      const randomPersonality = {
        traits: {
          openness: Math.random(),
          conscientiousness: Math.random(),
          extraversion: Math.random(),
          agreeableness: Math.random(),
          neuroticism: Math.random(),
          riskTolerance: Math.random(),
          creativity: Math.random(),
          patience: Math.random(),
          competitiveness: Math.random(),
          curiosity: Math.random()
        },
        confidence: Math.random(),
        adaptability: Math.random(),
        consistency: Math.random()
      };
      
      PersonalityStringGenerator.generatePersonalityString(randomPersonality);
      
      const endTime = process.hrtime.bigint();
      times.push(Number(endTime - startTime) / 1000000); // Convert to milliseconds
    }
    
    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      samples: times.length
    };
  }
  
  /**
   * Benchmark goals generation performance
   */
  async benchmarkGoalsGeneration() {
    const times = [];
    const samples = CONFIG.PERFORMANCE_SAMPLES;
    
    for (let i = 0; i < samples; i++) {
      const startTime = process.hrtime.bigint();
      
      // Generate random motivations
      const randomMotivations = {
        survival: { strength: Math.random() },
        achievement: { strength: Math.random() },
        social: { strength: Math.random() },
        exploration: { strength: Math.random() },
        creation: { strength: Math.random() }
      };
      
      GoalsStringGenerator.generateGoalsString(randomMotivations);
      
      const endTime = process.hrtime.bigint();
      times.push(Number(endTime - startTime) / 1000000); // Convert to milliseconds
    }
    
    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      samples: times.length
    };
  }
  
  /**
   * Benchmark migration performance
   */
  async benchmarkMigration() {
    const times = [];
    const migrationEngine = new SimplifiedMigrationEngine({ dryRun: true });
    
    // Test on sample profiles
    const sampleFiles = await fs.readdir(CONFIG.SAMPLE_PROFILES);
    const profileFiles = sampleFiles.filter(file => file.endsWith('.json'));
    
    for (const profileFile of profileFiles) {
      const startTime = process.hrtime.bigint();
      
      try {
        const profilePath = path.join(CONFIG.SAMPLE_PROFILES, profileFile);
        const profileData = await fs.readFile(profilePath, 'utf8');
        const profile = JSON.parse(profileData);
        
        migrationEngine.generateSimplifiedProfile(profile);
        
        const endTime = process.hrtime.bigint();
        times.push(Number(endTime - startTime) / 1000000); // Convert to milliseconds
      } catch (error) {
        // Skip failed files
      }
    }
    
    if (times.length === 0) {
      return { averageTime: 0, minTime: 0, maxTime: 0, samples: 0 };
    }
    
    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      samples: times.length
    };
  }
  
  /**
   * Test edge cases
   */
  async testEdgeCases() {
    const edgeCases = [
      {
        name: 'Empty Personality',
        profile: { purposeCore: { personality: {} } },
        shouldHandle: true
      },
      {
        name: 'Null Motivations',
        profile: { purposeCore: { personality: { traits: {} }, motivations: null } },
        shouldHandle: true
      },
      {
        name: 'Missing Purpose Core',
        profile: {},
        shouldHandle: true
      },
      {
        name: 'Extreme Values',
        profile: {
          purposeCore: {
            personality: {
              traits: { openness: 1.0, conscientiousness: 0.0 },
              confidence: 1.0, adaptability: 0.0, consistency: 0.0
            }
          }
        },
        shouldHandle: true
      },
      {
        name: 'Invalid JSON Structure',
        profile: 'invalid json',
        shouldHandle: false
      }
    ];
    
    const migrationEngine = new SimplifiedMigrationEngine({ dryRun: true });
    
    for (const edgeCase of edgeCases) {
      try {
        if (edgeCase.profile === 'invalid json') {
          // Test error handling
          try {
            JSON.parse(edgeCase.profile);
            this.recordTest(`Edge Case - ${edgeCase.name}`, false, { 
              result: 'Should have thrown error',
              expected: 'Error'
            });
          } catch (error) {
            this.recordTest(`Edge Case - ${edgeCase.name}`, true, { 
              result: 'Correctly threw error',
              error: error.message
            });
          }
        } else {
          const simplifiedProfile = migrationEngine.generateSimplifiedProfile(edgeCase.profile);
          const hasRequiredStructure = simplifiedProfile.agentState && 
            typeof simplifiedProfile.agentState.personality === 'string' &&
            typeof simplifiedProfile.agentState.goals === 'string';
          
          const passed = hasRequiredStructure === edgeCase.shouldHandle;
          this.recordTest(`Edge Case - ${edgeCase.name}`, passed, {
            hasRequiredStructure,
            shouldHandle: edgeCase.shouldHandle
          });
        }
      } catch (error) {
        const passed = !edgeCase.shouldHandle; // Should throw error if not handleable
        this.recordTest(`Edge Case - ${edgeCase.name}`, passed, {
          error: error.message,
          expected: edgeCase.shouldHandle ? 'success' : 'error'
        });
      }
    }
  }
  
  /**
   * Record test result
   */
  recordTest(testName, passed, details = {}) {
    testResults.total++;
    
    if (passed) {
      testResults.passed++;
      console.log(`    ✅ ${testName}`);
    } else {
      testResults.failed++;
      console.log(`    ❌ ${testName}`);
      if (details.error) {
        console.log(`       Error: ${details.error}`);
      }
    }
    
    // Store detailed results
    if (!testResults.detailed) {
      testResults.detailed = {};
    }
    testResults.detailed[testName] = { passed, details };
  }
  
  /**
   * Generate test report
   */
  async generateTestReport() {
    const reportPath = path.join(CONFIG.RESULTS_DIR, `test_report_${Date.now()}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.testStartTime,
      configuration: this.options,
      results: testResults,
      summary: {
        totalTests: testResults.total,
        passedTests: testResults.passed,
        failedTests: testResults.failed,
        skippedTests: testResults.skipped,
        successRate: testResults.total > 0 ? (testResults.passed / testResults.total) : 0
      }
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Test report saved to: ${reportPath}`);
  }
  
  /**
   * Print test summary
   */
  printTestSummary() {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⏭️  Skipped: ${testResults.skipped}`);
    console.log(`📈 Total: ${testResults.total}`);
    console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      testResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (testResults.performance && Object.keys(testResults.performance).length > 0) {
      console.log('\n⚡ Performance Results:');
      Object.entries(testResults.performance).forEach(([test, metrics]) => {
        console.log(`  ${test}: ${metrics.averageTime.toFixed(2)}ms avg (${metrics.samples} samples)`);
      });
    }
    
    const success = testResults.failed === 0;
    console.log(`\n${success ? '🎉' : '⚠️'} Test suite ${success ? 'PASSED' : 'FAILED'}`);
  }
}

/**
 * Command line interface
 */
async function main() {
  console.log('🧪 Simplified Migration Test Suite');
  console.log('==================================\n');
  
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  if (args.includes('--no-performance')) {
    options.runPerformanceTests = false;
  }
  
  if (args.includes('--no-quality')) {
    options.runQualityTests = false;
  }
  
  if (args.includes('--no-edge-cases')) {
    options.runEdgeCaseTests = false;
  }
  
  if (args.includes('--no-samples')) {
    options.generateSamples = false;
  }
  
  if (args.includes('--help')) {
    console.log(`
Usage: node test_simplified_migration.js [options]

Options:
  --no-performance  Skip performance tests
  --no-quality      Skip quality validation tests
  --no-edge-cases   Skip edge case tests
  --no-samples      Skip sample profile generation
  --help            Show this help message

Examples:
  node test_simplified_migration.js
  node test_simplified_migration.js --no-performance
    `);
    process.exit(0);
  }
  
  try {
    const testSuite = new SimplifiedMigrationTestSuite(options);
    await testSuite.runCompleteTestSuite();
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SimplifiedMigrationTestSuite };
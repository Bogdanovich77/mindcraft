#!/usr/bin/env node

/**
 * Simplified Migration Validation Suite
 * 
 * Comprehensive validation and testing for the simplified LangGraph migration.
 * Validates structural integrity, behavioral consistency, and system performance.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  PROFILES_DIR: path.join(__dirname, 'profiles'),
  BACKUP_DIR: path.join(__dirname, 'profiles_simplified_backup'),
  REPORTS_DIR: path.join(__dirname, 'validation_reports'),
  QUALITY_THRESHOLDS: {
    STRUCTURAL: 0.95,
    BEHAVIORAL: 0.80,
    PERFORMANCE: 0.85,
    OVERALL: 0.85
  }
};

/**
 * Migration Validation Suite
 * Comprehensive validation for simplified migration
 */
class MigrationValidationSuite {
  constructor(options = {}) {
    this.options = {
      outputPath: options.outputPath || CONFIG.REPORTS_DIR,
      generateReport: options.generateReport !== false,
      runPerformanceTests: options.runPerformanceTests !== false,
      ...options
    };
    
    this.validationResults = {
      structural: {},
      behavioral: {},
      performance: {},
      overall: {
        passed: 0,
        failed: 0,
        total: 0,
        quality: 0.0
      }
    };
  }
  
  /**
   * Run complete validation suite
   */
  async runCompleteValidation() {
    console.log('🔍 Starting Complete Migration Validation...\n');
    
    try {
      // Ensure output directory exists
      await fs.mkdir(this.options.outputPath, { recursive: true });
      
      // Step 1: Structural validation
      console.log('🏗️  Running structural validation...');
      await this.runStructuralValidation();
      
      // Step 2: Behavioral validation
      console.log('🧠 Running behavioral validation...');
      await this.runBehavioralValidation();
      
      // Step 3: Performance validation
      if (this.options.runPerformanceTests) {
        console.log('⚡ Running performance validation...');
        await this.runPerformanceValidation();
      }
      
      // Step 4: Generate overall assessment
      console.log('📊 Generating overall assessment...');
      await this.generateOverallAssessment();
      
      // Step 5: Generate comprehensive report
      if (this.options.generateReport) {
        await this.generateValidationReport();
      }
      
      // Print summary
      this.printValidationSummary();
      
      return this.validationResults;
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Structural validation
   */
  async runStructuralValidation() {
    const profileFiles = await this.discoverProfiles();
    const structuralResults = {
      passed: 0,
      failed: 0,
      total: profileFiles.length,
      issues: [],
      quality: 0.0
    };
    
    for (const profileFile of profileFiles) {
      try {
        const profilePath = path.join(CONFIG.PROFILES_DIR, profileFile);
        const profileData = await fs.readFile(profilePath, 'utf8');
        const profile = JSON.parse(profileData);
        
        const validation = await this.validateProfileStructure(profile, profileFile);
        
        if (validation.isValid) {
          structuralResults.passed++;
        } else {
          structuralResults.failed++;
          structuralResults.issues.push({
            profile: profileFile,
            issues: validation.issues
          });
        }
        
      } catch (error) {
        structuralResults.failed++;
        structuralResults.issues.push({
          profile: profileFile,
          issues: [`Failed to read/parse: ${error.message}`]
        });
      }
    }
    
    structuralResults.quality = structuralResults.passed / structuralResults.total;
    this.validationResults.structural = structuralResults;
    
    console.log(`✅ Structural validation: ${structuralResults.passed}/${structuralResults.total} passed`);
  }
  
  /**
   * Validate individual profile structure
   */
  async validateProfileStructure(profile, filename) {
    const issues = [];
    
    // Check if it's a simplified profile
    if (profile.agentType !== 'langgraph_simplified') {
      issues.push('Profile is not simplified (agentType != langgraph_simplified)');
    }
    
    // Check required top-level fields
    const requiredTopLevelFields = ['name', 'agentType', 'profileVersion', 'agentState'];
    for (const field of requiredTopLevelFields) {
      if (!profile[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    }
    
    // Check agentState structure
    if (!profile.agentState) {
      issues.push('Missing agentState');
    } else {
      const requiredStateFields = ['worldContext', 'personality', 'goals', 'mandate', 'conversation', 'lastAction', 'response'];
      for (const field of requiredStateFields) {
        if (profile.agentState[field] === undefined) {
          issues.push(`Missing agentState field: ${field}`);
        }
      }
      
      // Validate worldContext structure
      if (profile.agentState.worldContext) {
        const worldContextIssues = await this.validateWorldContext(profile.agentState.worldContext);
        issues.push(...worldContextIssues);
      }
      
      // Validate conversation structure
      if (profile.agentState.conversation) {
        const conversationIssues = await this.validateConversationState(profile.agentState.conversation);
        issues.push(...conversationIssues);
      }
      
      // Validate string fields
      const stringFields = ['personality', 'goals', 'mandate', 'lastAction', 'response'];
      for (const field of stringFields) {
        if (typeof profile.agentState[field] !== 'string') {
          issues.push(`${field} must be a string`);
        }
      }
      
      // Validate personality and goals quality
      if (profile.agentState.personality) {
        const personalityIssues = await this.validatePersonalityString(profile.agentState.personality);
        issues.push(...personalityIssues);
      }
      
      if (profile.agentState.goals) {
        const goalsIssues = await this.validateGoalsString(profile.agentState.goals);
        issues.push(...goalsIssues);
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      quality: 1 - (issues.length / 20) // Simple quality calculation
    };
  }
  
  /**
   * Validate worldContext structure
   */
  async validateWorldContext(worldContext) {
    const issues = [];
    const requiredFields = ['position', 'health', 'food', 'experience', 'inventory', 'equipment', 'nearbyEntities'];
    
    for (const field of requiredFields) {
      if (!worldContext[field]) {
        issues.push(`worldContext missing ${field}`);
      }
    }
    
    // Validate position
    if (worldContext.position) {
      const posFields = ['x', 'y', 'z'];
      for (const field of posFields) {
        if (typeof worldContext.position[field] !== 'number') {
          issues.push(`worldContext.position.${field} must be a number`);
        }
      }
    }
    
    // Validate health and food ranges
    if (typeof worldContext.health !== 'number' || worldContext.health < 0 || worldContext.health > 20) {
      issues.push('worldContext.health must be a number between 0-20');
    }
    
    if (typeof worldContext.food !== 'number' || worldContext.food < 0 || worldContext.food > 20) {
      issues.push('worldContext.food must be a number between 0-20');
    }
    
    // Validate inventory structure
    if (worldContext.inventory) {
      const inventoryFields = ['items', 'slots', 'usedSlots', 'length'];
      for (const field of inventoryFields) {
        if (worldContext.inventory[field] === undefined) {
          issues.push(`worldContext.inventory missing ${field}`);
        }
      }
      
      if (!Array.isArray(worldContext.inventory.items)) {
        issues.push('worldContext.inventory.items must be an array');
      }
    }
    
    return issues;
  }
  
  /**
   * Validate conversation state structure
   */
  async validateConversationState(conversation) {
    const issues = [];
    const requiredFields = ['message', 'sender', 'isRequestForHelp', 'isOfferOfAssistance', 'timestamp'];
    
    for (const field of requiredFields) {
      if (conversation[field] === undefined) {
        issues.push(`conversation missing ${field}`);
      }
    }
    
    // Validate boolean fields
    const booleanFields = ['isRequestForHelp', 'isOfferOfAssistance'];
    for (const field of booleanFields) {
      if (typeof conversation[field] !== 'boolean') {
        issues.push(`conversation.${field} must be a boolean`);
      }
    }
    
    // Validate timestamp
    if (typeof conversation.timestamp !== 'number') {
      issues.push('conversation.timestamp must be a number');
    }
    
    return issues;
  }
  
  /**
   * Validate personality string
   */
  async validatePersonalityString(personality) {
    const issues = [];
    
    if (personality.length < 20) {
      issues.push('Personality string too short (< 20 chars)');
    }
    
    if (personality.length > 200) {
      issues.push('Personality string too long (> 200 chars)');
    }
    
    // Check for meaningful descriptors
    const meaningfulWords = ['creative', 'disciplined', 'outgoing', 'confident', 'patient', 'curious', 'social', 'competitive'];
    const hasMeaningful = meaningfulWords.some(word => 
      personality.toLowerCase().includes(word)
    );
    
    if (!hasMeaningful) {
      issues.push('Personality string lacks meaningful descriptors');
    }
    
    return issues;
  }
  
  /**
   * Validate goals string
   */
  async validateGoalsString(goals) {
    const issues = [];
    
    if (goals.length < 20) {
      issues.push('Goals string too short (< 20 chars)');
    }
    
    if (goals.length > 200) {
      issues.push('Goals string too long (> 200 chars)');
    }
    
    // Check for actionable descriptors
    const actionableWords = ['survival', 'achievement', 'social', 'explorative', 'creative', 'building'];
    const hasActionable = actionableWords.some(word => 
      goals.toLowerCase().includes(word)
    );
    
    if (!hasActionable) {
      issues.push('Goals string lacks actionable descriptors');
    }
    
    return issues;
  }
  
  /**
   * Behavioral validation
   */
  async runBehavioralValidation() {
    const profileFiles = await this.discoverProfiles();
    const behavioralResults = {
      passed: 0,
      failed: 0,
      total: profileFiles.length,
      issues: [],
      quality: 0.0
    };
    
    for (const profileFile of profileFiles) {
      try {
        const profilePath = path.join(CONFIG.PROFILES_DIR, profileFile);
        const profileData = await fs.readFile(profilePath, 'utf8');
        const profile = JSON.parse(profileData);
        
        const validation = await this.validateBehavioralConsistency(profile, profileFile);
        
        if (validation.isValid) {
          behavioralResults.passed++;
        } else {
          behavioralResults.failed++;
          behavioralResults.issues.push({
            profile: profileFile,
            issues: validation.issues
          });
        }
        
      } catch (error) {
        behavioralResults.failed++;
        behavioralResults.issues.push({
          profile: profileFile,
          issues: [`Failed to analyze: ${error.message}`]
        });
      }
    }
    
    behavioralResults.quality = behavioralResults.passed / behavioralResults.total;
    this.validationResults.behavioral = behavioralResults;
    
    console.log(`✅ Behavioral validation: ${behavioralResults.passed}/${behavioralResults.total} passed`);
  }
  
  /**
   * Validate behavioral consistency
   */
  async validateBehavioralConsistency(profile, filename) {
    const issues = [];
    
    // Check if we have backup for comparison
    const backupPath = path.join(CONFIG.BACKUP_DIR, filename);
    let originalProfile = null;
    
    try {
      const backupData = await fs.readFile(backupPath, 'utf8');
      originalProfile = JSON.parse(backupData);
    } catch (error) {
      issues.push('No backup available for behavioral comparison');
      return { isValid: false, issues, quality: 0.0 };
    }
    
    // Compare personality traits vs generated string
    if (originalProfile.purposeCore?.personality && profile.agentState?.personality) {
      const personalityConsistency = await this.validatePersonalityConsistency(
        originalProfile.purposeCore.personality,
        profile.agentState.personality
      );
      
      if (!personalityConsistency.isConsistent) {
        issues.push(...personalityConsistency.issues);
      }
    }
    
    // Compare motivations vs generated goals
    if (originalProfile.purposeCore?.motivations && profile.agentState?.goals) {
      const goalsConsistency = await this.validateGoalsConsistency(
        originalProfile.purposeCore.motivations,
        profile.agentState.goals
      );
      
      if (!goalsConsistency.isConsistent) {
        issues.push(...goalsConsistency.issues);
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      quality: 1 - (issues.length / 10)
    };
  }
  
  /**
   * Validate personality consistency
   */
  async validatePersonalityConsistency(originalPersonality, personalityString) {
    const issues = [];
    const traits = originalPersonality.traits || {};
    const lowerPersonality = personalityString.toLowerCase();
    
    // Check high-value traits are reflected
    if (traits.openness > 0.7 && !lowerPersonality.includes('creative')) {
      issues.push('High openness not reflected in personality string');
    }
    
    if (traits.conscientiousness > 0.7 && !lowerPersonality.includes('disciplined')) {
      issues.push('High conscientiousness not reflected in personality string');
    }
    
    if (traits.extraversion > 0.7 && !lowerPersonality.includes('outgoing') && !lowerPersonality.includes('social')) {
      issues.push('High extraversion not reflected in personality string');
    }
    
    if (traits.creativity > 0.7 && !lowerPersonality.includes('creative')) {
      issues.push('High creativity not reflected in personality string');
    }
    
    if (traits.patience > 0.7 && !lowerPersonality.includes('patient')) {
      issues.push('High patience not reflected in personality string');
    }
    
    return {
      isConsistent: issues.length === 0,
      issues
    };
  }
  
  /**
   * Validate goals consistency
   */
  async validateGoalsConsistency(originalMotivations, goalsString) {
    const issues = [];
    const lowerGoals = goalsString.toLowerCase();
    
    // Find top motivation
    const topMotivation = Object.entries(originalMotivations)
      .sort(([,a], [,b]) => b.strength - a.strength)[0];
    
    if (!topMotivation) {
      issues.push('No motivations found in original profile');
      return { isConsistent: false, issues };
    }
    
    const [motivationType, motivation] = topMotivation;
    
    // Check top motivation is reflected
    switch(motivationType) {
      case 'survival':
        if (motivation.strength > 0.7 && !lowerGoals.includes('survival')) {
          issues.push('High survival motivation not reflected in goals string');
        }
        break;
      case 'achievement':
        if (motivation.strength > 0.7 && !lowerGoals.includes('achievement')) {
          issues.push('High achievement motivation not reflected in goals string');
        }
        break;
      case 'social':
        if (motivation.strength > 0.7 && !lowerGoals.includes('social')) {
          issues.push('High social motivation not reflected in goals string');
        }
        break;
      case 'exploration':
        if (motivation.strength > 0.7 && !lowerGoals.includes('explor')) {
          issues.push('High exploration motivation not reflected in goals string');
        }
        break;
      case 'creation':
        if (motivation.strength > 0.7 && !lowerGoals.includes('creative')) {
          issues.push('High creation motivation not reflected in goals string');
        }
        break;
    }
    
    return {
      isConsistent: issues.length === 0,
      issues
    };
  }
  
  /**
   * Performance validation
   */
  async runPerformanceValidation() {
    const performanceResults = {
      passed: 0,
      failed: 0,
      total: 0,
      metrics: {},
      quality: 0.0
    };
    
    // Test profile loading performance
    const loadPerformance = await this.testProfileLoadingPerformance();
    performanceResults.metrics.profileLoading = loadPerformance;
    if (loadPerformance.averageTime < 100) { // 100ms threshold
      performanceResults.passed++;
    } else {
      performanceResults.failed++;
    }
    
    // Test memory usage
    const memoryUsage = await this.testMemoryUsage();
    performanceResults.metrics.memoryUsage = memoryUsage;
    if (memoryUsage.peakUsage < 100) { // 100MB threshold
      performanceResults.passed++;
    } else {
      performanceResults.failed++;
    }
    
    // Test string processing performance
    const stringProcessing = await this.testStringProcessingPerformance();
    performanceResults.metrics.stringProcessing = stringProcessing;
    if (stringProcessing.averageTime < 10) { // 10ms threshold
      performanceResults.passed++;
    } else {
      performanceResults.failed++;
    }
    
    performanceResults.total = performanceResults.passed + performanceResults.failed;
    performanceResults.quality = performanceResults.passed / performanceResults.total;
    this.validationResults.performance = performanceResults;
    
    console.log(`✅ Performance validation: ${performanceResults.passed}/${performanceResults.total} passed`);
  }
  
  /**
   * Test profile loading performance
   */
  async testProfileLoadingPerformance() {
    const profileFiles = await this.discoverProfiles();
    const times = [];
    
    for (const profileFile of profileFiles.slice(0, 10)) { // Test first 10 profiles
      const startTime = process.hrtime.bigint();
      
      try {
        const profilePath = path.join(CONFIG.PROFILES_DIR, profileFile);
        const profileData = await fs.readFile(profilePath, 'utf8');
        JSON.parse(profileData);
        
        const endTime = process.hrtime.bigint();
        times.push(Number(endTime - startTime) / 1000000); // Convert to milliseconds
        
      } catch (error) {
        // Skip failed files
      }
    }
    
    const averageTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    
    return {
      averageTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      samples: times.length
    };
  }
  
  /**
   * Test memory usage
   */
  async testMemoryUsage() {
    const initialMemory = process.memoryUsage();
    
    // Load and process all profiles
    const profileFiles = await this.discoverProfiles();
    const profiles = [];
    
    for (const profileFile of profileFiles) {
      try {
        const profilePath = path.join(CONFIG.PROFILES_DIR, profileFile);
        const profileData = await fs.readFile(profilePath, 'utf8');
        profiles.push(JSON.parse(profileData));
      } catch (error) {
        // Skip failed files
      }
    }
    
    const finalMemory = process.memoryUsage();
    const peakUsage = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024; // MB
    
    return {
      peakUsage,
      initialHeap: initialMemory.heapUsed / 1024 / 1024,
      finalHeap: finalMemory.heapUsed / 1024 / 1024,
      profilesLoaded: profiles.length
    };
  }
  
  /**
   * Test string processing performance
   */
  async testStringProcessingPerformance() {
    const testStrings = [
      "creative, disciplined, outgoing personality",
      "strong survival instinct with creative building tendencies",
      "confident, competitive leader with high conscientiousness",
      "explorative and adventurous, also achievement-driven",
      "patient, curious, and highly social personality"
    ];
    
    const times = [];
    
    for (const testString of testStrings) {
      const startTime = process.hrtime.bigint();
      
      // Simulate string processing
      const words = testString.split(' ');
      const descriptors = words.filter(word => word.length > 4);
      const processed = descriptors.join(', ');
      
      const endTime = process.hrtime.bigint();
      times.push(Number(endTime - startTime) / 1000000); // Convert to milliseconds
    }
    
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    return {
      averageTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      samples: times.length
    };
  }
  
  /**
   * Generate overall assessment
   */
  async generateOverallAssessment() {
    const structural = this.validationResults.structural;
    const behavioral = this.validationResults.behavioral;
    const performance = this.validationResults.performance;
    
    const overallResults = {
      passed: 0,
      failed: 0,
      total: 0,
      quality: 0.0,
      recommendations: []
    };
    
    // Structural assessment
    if (structural.quality >= CONFIG.QUALITY_THRESHOLDS.STRUCTURAL) {
      overallResults.passed++;
    } else {
      overallResults.failed++;
      overallResults.recommendations.push('Improve structural integrity of migrated profiles');
    }
    
    // Behavioral assessment
    if (behavioral.quality >= CONFIG.QUALITY_THRESHOLDS.BEHAVIORAL) {
      overallResults.passed++;
    } else {
      overallResults.failed++;
      overallResults.recommendations.push('Enhance behavioral consistency in migration');
    }
    
    // Performance assessment (if run)
    if (performance.quality !== undefined) {
      if (performance.quality >= CONFIG.QUALITY_THRESHOLDS.PERFORMANCE) {
        overallResults.passed++;
      } else {
        overallResults.failed++;
        overallResults.recommendations.push('Optimize performance of simplified profiles');
      }
      overallResults.total++;
    }
    
    overallResults.total = overallResults.passed + overallResults.failed;
    overallResults.quality = overallResults.total > 0 ? overallResults.passed / overallResults.total : 0;
    
    this.validationResults.overall = overallResults;
  }
  
  /**
   * Generate validation report
   */
  async generateValidationReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.options.outputPath, `validation_report_${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      configuration: this.options,
      thresholds: CONFIG.QUALITY_THRESHOLDS,
      results: this.validationResults,
      summary: {
        overallQuality: this.validationResults.overall.quality,
        passedTests: this.validationResults.overall.passed,
        failedTests: this.validationResults.overall.failed,
        recommendations: this.validationResults.overall.recommendations
      }
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Validation report saved to: ${reportPath}`);
    
    // Also generate HTML report
    await this.generateHtmlReport(report, timestamp);
  }
  
  /**
   * Generate HTML validation report
   */
  async generateHtmlReport(report, timestamp) {
    const htmlPath = path.join(this.options.outputPath, `validation_report_${timestamp}.html`);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Simplified Migration Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f9f9f9; border-radius: 3px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Simplified Migration Validation Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Overall Quality: ${(report.summary.overallQuality * 100).toFixed(1)}%</p>
    </div>
    
    <div class="section">
        <h2>📊 Summary</h2>
        <div class="metric">Passed Tests: <span class="success">${report.summary.passedTests}</span></div>
        <div class="metric">Failed Tests: <span class="error">${report.summary.failedTests}</span></div>
        <div class="metric">Total Tests: ${report.summary.passedTests + report.summary.failedTests}</div>
    </div>
    
    <div class="section">
        <h2>🏗️ Structural Validation</h2>
        <p>Quality Score: ${(report.results.structural.quality * 100).toFixed(1)}%</p>
        <p>Passed: ${report.results.structural.passed}/${report.results.structural.total}</p>
        ${report.results.structural.issues.length > 0 ? `
        <h3>Issues:</h3>
        <table>
            <tr><th>Profile</th><th>Issues</th></tr>
            ${report.results.structural.issues.map(issue => 
                `<tr><td>${issue.profile}</td><td>${issue.issues.join(', ')}</td></tr>`
            ).join('')}
        </table>
        ` : '<p class="success">✅ No structural issues found</p>'}
    </div>
    
    <div class="section">
        <h2>🧠 Behavioral Validation</h2>
        <p>Quality Score: ${(report.results.behavioral.quality * 100).toFixed(1)}%</p>
        <p>Passed: ${report.results.behavioral.passed}/${report.results.behavioral.total}</p>
        ${report.results.behavioral.issues.length > 0 ? `
        <h3>Issues:</h3>
        <table>
            <tr><th>Profile</th><th>Issues</th></tr>
            ${report.results.behavioral.issues.map(issue => 
                `<tr><td>${issue.profile}</td><td>${issue.issues.join(', ')}</td></tr>`
            ).join('')}
        </table>
        ` : '<p class="success">✅ No behavioral issues found</p>'}
    </div>
    
    ${report.results.performance.quality !== undefined ? `
    <div class="section">
        <h2>⚡ Performance Validation</h2>
        <p>Quality Score: ${(report.results.performance.quality * 100).toFixed(1)}%</p>
        <p>Passed: ${report.results.performance.passed}/${report.results.performance.total}</p>
        <h3>Metrics:</h3>
        <table>
            <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
            <tr>
                <td>Profile Loading</td>
                <td>${report.results.performance.metrics.profileLoading.averageTime.toFixed(2)}ms</td>
                <td class="${report.results.performance.metrics.profileLoading.averageTime < 100 ? 'success' : 'error'}">
                    ${report.results.performance.metrics.profileLoading.averageTime < 100 ? '✅ Pass' : '❌ Fail'}
                </td>
            </tr>
            <tr>
                <td>Memory Usage</td>
                <td>${report.results.performance.metrics.memoryUsage.peakUsage.toFixed(2)}MB</td>
                <td class="${report.results.performance.metrics.memoryUsage.peakUsage < 100 ? 'success' : 'error'}">
                    ${report.results.performance.metrics.memoryUsage.peakUsage < 100 ? '✅ Pass' : '❌ Fail'}
                </td>
            </tr>
            <tr>
                <td>String Processing</td>
                <td>${report.results.performance.metrics.stringProcessing.averageTime.toFixed(2)}ms</td>
                <td class="${report.results.performance.metrics.stringProcessing.averageTime < 10 ? 'success' : 'error'}">
                    ${report.results.performance.metrics.stringProcessing.averageTime < 10 ? '✅ Pass' : '❌ Fail'}
                </td>
            </tr>
        </table>
    </div>
    ` : ''}
    
    ${report.summary.recommendations.length > 0 ? `
    <div class="section">
        <h2>💡 Recommendations</h2>
        <ul>
            ${report.summary.recommendations.map(rec => `<li class="warning">${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    <div class="section">
        <h2>📋 Quality Thresholds</h2>
        <table>
            <tr><th>Category</th><th>Threshold</th><th>Result</th></tr>
            <tr>
                <td>Structural</td>
                <td>${(CONFIG.QUALITY_THRESHOLDS.STRUCTURAL * 100).toFixed(1)}%</td>
                <td class="${report.results.structural.quality >= CONFIG.QUALITY_THRESHOLDS.STRUCTURAL ? 'success' : 'error'}">
                    ${(report.results.structural.quality * 100).toFixed(1)}%
                </td>
            </tr>
            <tr>
                <td>Behavioral</td>
                <td>${(CONFIG.QUALITY_THRESHOLDS.BEHAVIORAL * 100).toFixed(1)}%</td>
                <td class="${report.results.behavioral.quality >= CONFIG.QUALITY_THRESHOLDS.BEHAVIORAL ? 'success' : 'error'}">
                    ${(report.results.behavioral.quality * 100).toFixed(1)}%
                </td>
            </tr>
            <tr>
                <td>Performance</td>
                <td>${(CONFIG.QUALITY_THRESHOLDS.PERFORMANCE * 100).toFixed(1)}%</td>
                <td class="${report.results.performance.quality >= CONFIG.QUALITY_THRESHOLDS.PERFORMANCE ? 'success' : 'error'}">
                    ${(report.results.performance.quality * 100).toFixed(1)}%
                </td>
            </tr>
            <tr>
                <td>Overall</td>
                <td>${(CONFIG.QUALITY_THRESHOLDS.OVERALL * 100).toFixed(1)}%</td>
                <td class="${report.summary.overallQuality >= CONFIG.QUALITY_THRESHOLDS.OVERALL ? 'success' : 'error'}">
                    ${(report.summary.overallQuality * 100).toFixed(1)}%
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;
    
    await fs.writeFile(htmlPath, html);
    console.log(`📄 HTML validation report saved to: ${htmlPath}`);
  }
  
  /**
   * Print validation summary
   */
  printValidationSummary() {
    const overall = this.validationResults.overall;
    
    console.log('\n📊 Validation Summary:');
    console.log(`✅ Passed: ${overall.passed}`);
    console.log(`❌ Failed: ${overall.failed}`);
    console.log(`📈 Overall Quality: ${(overall.quality * 100).toFixed(1)}%`);
    
    if (overall.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      overall.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    const success = overall.quality >= CONFIG.QUALITY_THRESHOLDS.OVERALL;
    console.log(`\n${success ? '🎉' : '⚠️'} Migration validation ${success ? 'PASSED' : 'FAILED'}`);
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
}

/**
 * Command line interface
 */
async function main() {
  console.log('🔍 Simplified Migration Validation Suite');
  console.log('========================================\n');
  
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  if (args.includes('--no-performance')) {
    options.runPerformanceTests = false;
  }
  
  if (args.includes('--no-report')) {
    options.generateReport = false;
  }
  
  if (args.includes('--help')) {
    console.log(`
Usage: node validate_simplified_migration.js [options]

Options:
  --no-performance  Skip performance validation tests
  --no-report       Skip generating detailed reports
  --help            Show this help message

Examples:
  node validate_simplified_migration.js
  node validate_simplified_migration.js --no-performance
    `);
    process.exit(0);
  }
  
  try {
    const validationSuite = new MigrationValidationSuite(options);
    await validationSuite.runCompleteValidation();
  } catch (error) {
    console.error('\n💥 Validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MigrationValidationSuite };
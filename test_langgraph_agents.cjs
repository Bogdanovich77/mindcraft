#!/usr/bin/env node

/**
 * Test Script for LangGraph Agents
 * 
 * Validates that migrated agents work correctly with the new system.
 */

const fs = require('fs/promises');
const path = require('path');

const PROFILES_DIR = path.join(__dirname, 'profiles');

/**
 * Test profile structure and validation
 */
async function testProfileStructure() {
    console.log('🔍 Testing profile structure validation...');
    
    const files = await fs.readdir(PROFILES_DIR);
    const jsonFiles = files.filter(file => 
        file.endsWith('.json') && 
        !file.includes('defaults') && 
        !file.includes('tasks')
    );
    
    const results = {
        valid: [],
        invalid: [],
        summary: {}
    };
    
    for (const file of jsonFiles) {
        try {
            const filePath = path.join(PROFILES_DIR, file);
            const profileData = await fs.readFile(filePath, 'utf8');
            const profile = JSON.parse(profileData);
            
            const validation = validateProfile(profile, file);
            
            if (validation.isValid) {
                results.valid.push({
                    file,
                    agentType: profile.agentType,
                    name: profile.name,
                    hasPurposeCore: !!profile.purposeCore,
                    migratedAt: profile.migratedAt
                });
            } else {
                results.invalid.push({
                    file,
                    errors: validation.errors
                });
            }
            
        } catch (error) {
            results.invalid.push({
                file,
                errors: [`Failed to read/parse: ${error.message}`]
            });
        }
    }
    
    // Generate summary
    results.summary = {
        total: jsonFiles.length,
        valid: results.valid.length,
        invalid: results.invalid.length,
        migrationRate: ((results.valid.length / jsonFiles.length) * 100).toFixed(1) + '%'
    };
    
    return results;
}

/**
 * Validate individual profile
 */
function validateProfile(profile, filename) {
    const validation = {
        isValid: true,
        errors: []
    };
    
    // Check required basic fields
    if (!profile.name) {
        validation.errors.push('Missing name field');
        validation.isValid = false;
    }
    
    if (!profile.model) {
        validation.errors.push('Missing model field');
        validation.isValid = false;
    }
    
    // Check LangGraph v2 specific fields
    if (profile.agentType === 'langgraph_v2' || profile.profileVersion === '2.0.0') {
        if (!profile.purposeCore) {
            validation.errors.push('Missing purposeCore for LangGraph agent');
            validation.isValid = false;
        } else {
            // Validate purpose core structure
            if (!profile.purposeCore.personality) {
                validation.errors.push('Missing personality in purposeCore');
                validation.isValid = false;
            }
            
            if (!profile.purposeCore.motivations) {
                validation.errors.push('Missing motivations in purposeCore');
                validation.isValid = false;
            }
            
            if (!profile.purposeCore.values) {
                validation.errors.push('Missing values in purposeCore');
                validation.isValid = false;
            }
            
            // Validate personality traits
            if (profile.purposeCore.personality.traits) {
                const traits = profile.purposeCore.personality.traits;
                const requiredTraits = [
                    'openness', 'conscientiousness', 'extraversion', 
                    'agreeableness', 'neuroticism', 'riskTolerance',
                    'creativity', 'patience', 'competitiveness', 'curiosity'
                ];
                
                for (const trait of requiredTraits) {
                    if (typeof traits[trait] !== 'number' || traits[trait] < 0 || traits[trait] > 1) {
                        validation.errors.push(`Invalid ${trait} trait: must be number between 0-1`);
                        validation.isValid = false;
                    }
                }
            }
        }
        
        if (!profile.behavior) {
            validation.errors.push('Missing behavior configuration');
            validation.isValid = false;
        }
        
        if (!profile.migratedAt) {
            validation.errors.push('Missing migratedAt timestamp');
            validation.isValid = false;
        }
    }
    
    return validation;
}

/**
 * Test personality trait extraction
 */
async function testPersonalityTraits() {
    console.log('🧠 Testing personality trait extraction...');
    
    const testCases = [
        {
            file: 'Loner.json',
            expectedTraits: {
                high: ['conscientiousness', 'patience', 'courage'],
                medium: ['openness', 'creativity']
            }
        },
        {
            file: 'MasterChief.json', 
            expectedTraits: {
                high: ['extraversion', 'agreeableness'],
                medium: ['conscientiousness', 'openness']
            }
        },
        {
            file: 'claude.json',
            expectedTraits: {
                medium: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
            }
        }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
        try {
            const filePath = path.join(PROFILES_DIR, testCase.file);
            const profileData = await fs.readFile(filePath, 'utf8');
            const profile = JSON.parse(profileData);
            
            if (profile.purposeCore && profile.purposeCore.personality && profile.purposeCore.personality.traits) {
                const traits = profile.purposeCore.personality.traits;
                
                const analysis = {
                    file: testCase.file,
                    traits: traits,
                    validation: validateTraitExpectations(traits, testCase.expectedTraits)
                };
                
                results.push(analysis);
            } else {
                results.push({
                    file: testCase.file,
                    error: 'No personality traits found'
                });
            }
            
        } catch (error) {
            results.push({
                file: testCase.file,
                error: error.message
            });
        }
    }
    
    return results;
}

/**
 * Validate trait expectations
 */
function validateTraitExpectations(traits, expected) {
    const validation = {
        passed: true,
        details: {}
    };
    
    // Check high traits (should be > 0.7)
    if (expected.high) {
        for (const trait of expected.high) {
            if (traits[trait] > 0.7) {
                validation.details[trait] = '✅ High as expected';
            } else {
                validation.details[trait] = `❌ Expected high, got ${traits[trait]}`;
                validation.passed = false;
            }
        }
    }
    
    // Check medium traits (should be 0.3-0.7)
    if (expected.medium) {
        for (const trait of expected.medium) {
            if (traits[trait] >= 0.3 && traits[trait] <= 0.7) {
                validation.details[trait] = '✅ Medium as expected';
            } else {
                validation.details[trait] = `❌ Expected medium, got ${traits[trait]}`;
                validation.passed = false;
            }
        }
    }
    
    return validation;
}

/**
 * Test system configuration
 */
async function testSystemConfiguration() {
    console.log('⚙️ Testing system configuration...');
    
    try {
        const settingsData = await fs.readFile('settings.js', 'utf8');
        const settingsMatch = settingsData.match(/"agent_system":\s*"([^"]+)"/);
        
        const agentSystem = settingsMatch ? settingsMatch[1] : 'legacy';
        const isLangGraphEnabled = agentSystem === 'langgraph';
        
        const profilesMatch = settingsData.match(/"profiles":\s*\[([\s\S]*?)\]/);
        const profilesSection = profilesMatch ? profilesMatch[1] : '';
        const activeProfiles = (profilesSection.match(/"([^"]+)"/g) || [])
            .map(match => match.replace(/"/g, ''));
        
        return {
            agentSystem,
            isLangGraphEnabled,
            activeProfiles: activeProfiles.length,
            profiles: activeProfiles
        };
        
    } catch (error) {
        return {
            error: error.message
        };
    }
}

/**
 * Generate comprehensive test report
 */
function generateTestReport(structureResults, personalityResults, configResults) {
    console.log('\n📊 LANGGRAPH AGENT MIGRATION TEST REPORT');
    console.log('='.repeat(50));
    
    // Structure validation
    console.log('\n🏗️  Profile Structure Validation:');
    console.log(`   Total Profiles: ${structureResults.summary.total}`);
    console.log(`   Valid Profiles: ${structureResults.summary.valid}`);
    console.log(`   Invalid Profiles: ${structureResults.summary.invalid}`);
    console.log(`   Migration Success Rate: ${structureResults.summary.migrationRate}`);
    
    if (structureResults.invalid.length > 0) {
        console.log('\n❌ Invalid Profiles:');
        structureResults.invalid.forEach(({ file, errors }) => {
            console.log(`   - ${file}: ${errors.join(', ')}`);
        });
    }
    
    // Personality traits validation
    console.log('\n🧠 Personality Traits Validation:');
    personalityResults.forEach(result => {
        if (result.error) {
            console.log(`   ❌ ${result.file}: ${result.error}`);
        } else {
            console.log(`   📋 ${result.file}:`);
            Object.entries(result.validation.details).forEach(([trait, status]) => {
                console.log(`      ${trait}: ${status}`);
            });
        }
    });
    
    // System configuration
    console.log('\n⚙️  System Configuration:');
    if (configResults.error) {
        console.log(`   ❌ Error: ${configResults.error}`);
    } else {
        console.log(`   Agent System: ${configResults.agentSystem}`);
        console.log(`   LangGraph Enabled: ${configResults.isLangGraphEnabled ? '✅' : '❌'}`);
        console.log(`   Active Profiles: ${configResults.activeProfiles}`);
        console.log(`   Profiles: ${configResults.profiles.join(', ')}`);
    }
    
    // Overall assessment
    const overallSuccess = structureResults.summary.invalid === 0 && 
                          personalityResults.every(r => !r.error || r.validation?.passed) &&
                          configResults.isLangGraphEnabled;
    
    console.log('\n🎯 Overall Assessment:');
    if (overallSuccess) {
        console.log('   ✅ SUCCESS: All agents successfully migrated to LangGraph v2!');
        console.log('   🚀 Ready to run with enhanced cognitive architecture');
    } else {
        console.log('   ⚠️  ISSUES DETECTED: Some problems need attention');
        console.log('   🔧 Review the errors above and fix as needed');
    }
    
    return overallSuccess;
}

/**
 * Main test execution
 */
async function main() {
    console.log('🧪 Starting LangGraph Agent Migration Tests...\n');
    
    try {
        // Test 1: Profile structure validation
        const structureResults = await testProfileStructure();
        
        // Test 2: Personality traits validation
        const personalityResults = await testPersonalityTraits();
        
        // Test 3: System configuration test
        const configResults = await testSystemConfiguration();
        
        // Generate comprehensive report
        const success = generateTestReport(structureResults, personalityResults, configResults);
        
        // Exit with appropriate code
        process.exit(success ? 0 : 1);
        
    } catch (error) {
        console.error('\n💥 Test execution failed:', error);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    testProfileStructure, 
    testPersonalityTraits, 
    testSystemConfiguration,
    main 
};
/**
 * Test suite for Profile Validation
 * Tests profile structure validation and error handling
 */

import ProfileManager from '../src/mindcraft/profileManager.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_PROFILES_DIR = path.join(__dirname, '../test_profiles');

class ProfileValidationTester {
    constructor() {
        this.testResults = [];
        this.profileManager = new ProfileManager();
        // Override profiles directory for testing
        this.profileManager.profilesDir = TEST_PROFILES_DIR;
    }

    async runAllTests() {
        console.log('🔍 Starting Profile Validation Tests...\n');

        try {
            await this.ensureTestDirectory();
            
            // Test validation methods
            await this.testProfileValidation();
            await this.testRequiredFields();
            await this.testAgentStateValidation();
            await this.testAgentTypeValidation();
            await this.testCompatibilityModeValidation();
            await this.testProfileCRUDValidation();
            
            // Cleanup
            await this.cleanup();
            
            // Print summary
            this.printTestSummary();
            
        } catch (error) {
            console.error('❌ Validation test suite failed:', error);
            process.exit(1);
        }
    }

    async ensureTestDirectory() {
        try {
            await fs.mkdir(TEST_PROFILES_DIR, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }
    }

    async cleanup() {
        try {
            const files = await fs.readdir(TEST_PROFILES_DIR);
            for (const file of files) {
                await fs.unlink(path.join(TEST_PROFILES_DIR, file));
            }
            await fs.rmdir(TEST_PROFILES_DIR);
        } catch (error) {
            // Directory might not exist or be empty
        }
    }

    async testProfileValidation() {
        console.log('🔧 Testing Basic Profile Validation...\n');

        // Test valid profile
        try {
            const validProfile = this.createValidProfile();
            this.profileManager.validateProfile(validProfile);
            this.logSuccess('Valid profile should pass validation');
        } catch (error) {
            this.logError('Valid profile should pass validation', error);
        }

        // Test invalid profile (null)
        try {
            this.profileManager.validateProfile(null);
            this.logError('Null profile should fail validation');
        } catch (error) {
            this.logSuccess('Null profile correctly failed validation');
        }

        // Test invalid profile (not object)
        try {
            this.profileManager.validateProfile('invalid');
            this.logError('String profile should fail validation');
        } catch (error) {
            this.logSuccess('String profile correctly failed validation');
        }
    }

    async testRequiredFields() {
        console.log('📋 Testing Required Fields Validation...\n');

        const requiredFields = ['name', 'model', 'agentType'];

        for (const field of requiredFields) {
            try {
                const profile = this.createValidProfile();
                delete profile[field];
                this.profileManager.validateProfile(profile);
                this.logError(`Profile without ${field} should fail validation`);
            } catch (error) {
                this.logSuccess(`Profile without ${field} correctly failed validation`);
            }
        }

        // Test empty required fields
        for (const field of requiredFields) {
            try {
                const profile = this.createValidProfile();
                profile[field] = '';
                this.profileManager.validateProfile(profile);
                this.logError(`Profile with empty ${field} should fail validation`);
            } catch (error) {
                this.logSuccess(`Profile with empty ${field} correctly failed validation`);
            }
        }
    }

    async testAgentStateValidation() {
        console.log('🧠 Testing Agent State Validation...\n');

        const requiredStateFields = ['worldContext', 'personality', 'goals', 'mandate', 'conversation', 'lastAction', 'response'];

        for (const field of requiredStateFields) {
            try {
                const profile = this.createValidProfile();
                delete profile.agentState[field];
                this.profileManager.validateProfile(profile);
                this.logError(`Profile without agentState.${field} should fail validation`);
            } catch (error) {
                this.logSuccess(`Profile without agentState.${field} correctly failed validation`);
            }
        }

        // Test profile without agentState
        try {
            const profile = this.createValidProfile();
            delete profile.agentState;
            this.profileManager.validateProfile(profile);
            this.logSuccess('Profile without agentState should pass validation (optional)');
        } catch (error) {
            this.logError('Profile without agentState should pass validation (optional)', error);
        }
    }

    async testAgentTypeValidation() {
        console.log('🤖 Testing Agent Type Validation...\n');

        const validAgentTypes = ['langgraph_simplified', 'langgraph_v2', 'legacy'];

        // Test valid agent types
        for (const agentType of validAgentTypes) {
            try {
                const profile = this.createValidProfile();
                profile.agentType = agentType;
                this.profileManager.validateProfile(profile);
                this.logSuccess(`Agent type ${agentType} should be valid`);
            } catch (error) {
                this.logError(`Agent type ${agentType} should be valid`, error);
            }
        }

        // Test invalid agent type
        try {
            const profile = this.createValidProfile();
            profile.agentType = 'invalid_agent_type';
            this.profileManager.validateProfile(profile);
            this.logError('Invalid agent type should fail validation');
        } catch (error) {
            this.logSuccess('Invalid agent type correctly failed validation');
        }
    }

    async testCompatibilityModeValidation() {
        console.log('🔧 Testing Compatibility Mode Validation...\n');

        const validModes = ['simplified_only', 'hybrid', 'legacy_only'];

        // Test valid compatibility modes
        for (const mode of validModes) {
            try {
                const profile = this.createValidProfile();
                profile.compatibilityMode = mode;
                this.profileManager.validateProfile(profile);
                this.logSuccess(`Compatibility mode ${mode} should be valid`);
            } catch (error) {
                this.logError(`Compatibility mode ${mode} should be valid`, error);
            }
        }

        // Test invalid compatibility mode
        try {
            const profile = this.createValidProfile();
            profile.compatibilityMode = 'invalid_mode';
            this.profileManager.validateProfile(profile);
            this.logError('Invalid compatibility mode should fail validation');
        } catch (error) {
            this.logSuccess('Invalid compatibility mode correctly failed validation');
        }
    }

    async testProfileCRUDValidation() {
        console.log('💾 Testing CRUD Operations Validation...\n');

        // Test creating invalid profile
        try {
            const invalidProfile = { name: '', model: '' };
            await this.profileManager.createProfile(invalidProfile);
            this.logError('Creating invalid profile should fail');
        } catch (error) {
            this.logSuccess('Creating invalid profile correctly failed');
        }

        // Test creating duplicate profile
        try {
            const validProfile = this.createValidProfile();
            await this.profileManager.createProfile(validProfile);
            await this.profileManager.createProfile(validProfile);
            this.logError('Creating duplicate profile should fail');
        } catch (error) {
            this.logSuccess('Creating duplicate profile correctly failed');
        }

        // Test getting non-existent profile
        try {
            await this.profileManager.getProfile('NonExistentProfile');
            this.logError('Getting non-existent profile should fail');
        } catch (error) {
            this.logSuccess('Getting non-existent profile correctly failed');
        }

        // Test updating invalid profile
        try {
            const invalidProfile = { name: 'Test', invalidField: 'value' };
            await this.profileManager.saveProfile('Test', invalidProfile);
            this.logError('Saving invalid profile should fail');
        } catch (error) {
            this.logSuccess('Saving invalid profile correctly failed');
        }

        // Test deleting non-existent profile
        try {
            await this.profileManager.deleteProfile('NonExistentProfile');
            this.logError('Deleting non-existent profile should fail');
        } catch (error) {
            this.logSuccess('Deleting non-existent profile correctly failed');
        }
    }

    createValidProfile() {
        return {
            name: 'ValidTestProfile',
            model: 'ollama/test-model',
            embedding: 'ollama/test-embedding',
            agentType: 'langgraph_simplified',
            profileVersion: '3.0.0',
            compatibilityMode: 'simplified_only',
            agentState: {
                worldContext: {
                    position: { x: 0, y: 64, z: 0 },
                    health: 20,
                    food: 20,
                    experience: 0,
                    inventory: { items: [], slots: 36, usedSlots: 0, length: 0 },
                    equipment: {},
                    nearbyEntities: [],
                    timeOfDay: 0,
                    weather: 'clear',
                    dimension: 'overworld',
                    biome: 'plains',
                    lightLevel: 15
                },
                personality: 'test personality',
                goals: 'test goals',
                mandate: '',
                conversation: {
                    message: '',
                    sender: '',
                    isRequestForHelp: false,
                    isOfferOfAssistance: false,
                    targetBot: '',
                    timestamp: 0
                },
                lastAction: '',
                response: ''
            }
        };
    }

    assert(condition, message) {
        if (condition) {
            this.testResults.push({ test: message, status: 'PASS' });
        } else {
            this.testResults.push({ test: message, status: 'FAIL' });
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    logSuccess(test) {
        console.log(`✅ ${test}`);
    }

    logError(test, error) {
        console.log(`❌ ${test}: ${error.message}`);
        this.testResults.push({ test: test, status: 'FAIL', error: error.message });
    }

    printTestSummary() {
        console.log('\n📊 Validation Test Results Summary:');
        console.log('='.repeat(50));

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;

        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`  - ${r.test}: ${r.error || 'Unknown error'}`));
        }

        console.log('\n' + '='.repeat(50));
        
        if (failed === 0) {
            console.log('🎉 All validation tests passed! Profile validation is working correctly.');
        } else {
            console.log('⚠️  Some validation tests failed. Please check the implementation.');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new ProfileValidationTester();
    tester.runAllTests().catch(console.error);
}

export default ProfileValidationTester;
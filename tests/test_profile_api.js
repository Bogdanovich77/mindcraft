/**
 * Test suite for Profile Management API
 * Tests both REST endpoints and Socket.IO events
 */

import { create } from 'socket.io-client';
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:8080';
const API_BASE = `${SERVER_URL}/api`;

// Test configuration
const TEST_PROFILE = {
    name: 'TestBot',
    model: 'ollama/test-model',
    embedding: 'ollama/test-embedding',
    agentType: 'langgraph_simplified',
    personality: 'friendly and test-oriented personality',
    goals: 'testing and validation'
};

class ProfileAPITester {
    constructor() {
        this.socket = null;
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🧪 Starting Profile Management API Tests...\n');

        try {
            // Test REST API endpoints
            await this.testRESTAPI();
            
            // Test Socket.IO events
            await this.testSocketIO();
            
            // Print summary
            this.printTestSummary();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        } finally {
            if (this.socket) {
                this.socket.disconnect();
            }
        }
    }

    async testRESTAPI() {
        console.log('📡 Testing REST API Endpoints...\n');

        // Test GET /api/profiles
        await this.testGetProfiles();

        // Test POST /api/profiles
        await this.testCreateProfile();

        // Test GET /api/profiles/:name
        await this.testGetSpecificProfile();

        // Test PUT /api/profiles/:name
        await this.testUpdateProfile();

        // Test DELETE /api/profiles/:name
        await this.testDeleteProfile();
    }

    async testSocketIO() {
        console.log('🔌 Testing Socket.IO Events...\n');

        // Connect to server
        await this.connectSocket();

        // Test Socket.IO events
        await this.testSocketGetProfiles();
        await this.testSocketGetProfile();
        await this.testSocketSaveProfile();
        await this.testSocketDeleteProfile();
    }

    async testGetProfiles() {
        try {
            const response = await fetch(`${API_BASE}/profiles`);
            const data = await response.json();

            this.assert(response.ok, 'GET /api/profiles should return 200');
            this.assert(data.success, 'Response should be successful');
            this.assert(Array.isArray(data.data), 'Data should be an array');
            this.assert(data.meta, 'Response should have metadata');

            this.logSuccess('GET /api/profiles');
        } catch (error) {
            this.logError('GET /api/profiles', error);
        }
    }

    async testCreateProfile() {
        try {
            const response = await fetch(`${API_BASE}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(TEST_PROFILE)
            });
            const data = await response.json();

            this.assert(response.status === 201, 'POST /api/profiles should return 201');
            this.assert(data.success, 'Profile creation should be successful');
            this.assert(data.data.name === TEST_PROFILE.name, 'Created profile should have correct name');

            this.logSuccess('POST /api/profiles');
        } catch (error) {
            this.logError('POST /api/profiles', error);
        }
    }

    async testGetSpecificProfile() {
        try {
            const response = await fetch(`${API_BASE}/profiles/${TEST_PROFILE.name}`);
            const data = await response.json();

            this.assert(response.ok, 'GET /api/profiles/:name should return 200');
            this.assert(data.success, 'Response should be successful');
            this.assert(data.data.name === TEST_PROFILE.name, 'Profile should have correct name');

            this.logSuccess('GET /api/profiles/:name');
        } catch (error) {
            this.logError('GET /api/profiles/:name', error);
        }
    }

    async testUpdateProfile() {
        try {
            const updateData = { ...TEST_PROFILE, personality: 'updated personality' };
            const response = await fetch(`${API_BASE}/profiles/${TEST_PROFILE.name}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            const data = await response.json();

            this.assert(response.ok, 'PUT /api/profiles/:name should return 200');
            this.assert(data.success, 'Profile update should be successful');
            this.assert(data.data.personality === 'updated personality', 'Profile should be updated');

            this.logSuccess('PUT /api/profiles/:name');
        } catch (error) {
            this.logError('PUT /api/profiles/:name', error);
        }
    }

    async testDeleteProfile() {
        try {
            const response = await fetch(`${API_BASE}/profiles/${TEST_PROFILE.name}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            this.assert(response.ok, 'DELETE /api/profiles/:name should return 200');
            this.assert(data.success, 'Profile deletion should be successful');

            this.logSuccess('DELETE /api/profiles/:name');
        } catch (error) {
            this.logError('DELETE /api/profiles/:name', error);
        }
    }

    async connectSocket() {
        return new Promise((resolve, reject) => {
            this.socket = create(SERVER_URL);
            
            this.socket.on('connect', () => {
                console.log('🔌 Connected to Socket.IO server');
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                reject(error);
            });

            setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
        });
    }

    async testSocketGetProfiles() {
        try {
            const result = await this.socketEmit('get-profiles');
            this.assert(result.success, 'Socket get-profiles should be successful');
            this.assert(Array.isArray(result.data), 'Socket get-profiles should return array');

            this.logSuccess('Socket get-profiles');
        } catch (error) {
            this.logError('Socket get-profiles', error);
        }
    }

    async testSocketGetProfile() {
        try {
            // First create a profile for testing
            await this.socketEmit('save-profile', TEST_PROFILE.name, TEST_PROFILE);
            
            const result = await this.socketEmit('get-profile', TEST_PROFILE.name);
            this.assert(result.success, 'Socket get-profile should be successful');
            this.assert(result.data.name === TEST_PROFILE.name, 'Socket get-profile should return correct profile');

            this.logSuccess('Socket get-profile');
        } catch (error) {
            this.logError('Socket get-profile', error);
        }
    }

    async testSocketSaveProfile() {
        try {
            const testProfile = { ...TEST_PROFILE, name: 'SocketTestBot' };
            const result = await this.socketEmit('save-profile', testProfile.name, testProfile);
            this.assert(result.success, 'Socket save-profile should be successful');
            this.assert(result.data.name === testProfile.name, 'Socket save-profile should return saved profile');

            this.logSuccess('Socket save-profile');
        } catch (error) {
            this.logError('Socket save-profile', error);
        }
    }

    async testSocketDeleteProfile() {
        try {
            const result = await this.socketEmit('delete-profile', 'SocketTestBot');
            this.assert(result.success, 'Socket delete-profile should be successful');

            this.logSuccess('Socket delete-profile');
        } catch (error) {
            this.logError('Socket delete-profile', error);
        }
    }

    async socketEmit(event, ...args) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Socket event ${event} timeout`));
            }, 5000);

            this.socket.emit(event, ...args, (response) => {
                clearTimeout(timeout);
                resolve(response);
            });
        });
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
        console.log('\n📊 Test Results Summary:');
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
            console.log('🎉 All tests passed! Profile Management API is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please check the implementation.');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new ProfileAPITester();
    tester.runAllTests().catch(console.error);
}

export default ProfileAPITester;
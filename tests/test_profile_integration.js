/**
 * Integration Test Suite for Profile Management System
 * Tests the complete profile management workflow
 */

import ProfileManager from '../src/mindcraft/profileManager.js';
import { create } from 'socket.io-client';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_URL = 'http://localhost:8080';
const API_BASE = `${SERVER_URL}/api`;

class ProfileIntegrationTester {
    constructor() {
        this.socket = null;
        this.profileManager = new ProfileManager();
        this.testResults = [];
        this.testProfiles = [];
    }

    async runAllTests() {
        console.log('🔗 Starting Profile Management Integration Tests...\n');

        try {
            // Test server connectivity
            await this.testServerConnectivity();

            // Test complete CRUD workflow
            await this.testCompleteCRUDWorkflow();

            // Test profile validation in context
            await this.testProfileValidationWorkflow();

            // Test error handling and edge cases
            await this.testErrorHandling();

            // Test concurrent operations
            await this.testConcurrentOperations();

            // Test backup and recovery
            await this.testBackupAndRecovery();

            // Cleanup
            await this.cleanup();

            // Print summary
            this.printTestSummary();

        } catch (error) {
            console.error('❌ Integration test suite failed:', error);
            await this.cleanup();
            process.exit(1);
        } finally {
            if (this.socket) {
                this.socket.disconnect();
            }
        }
    }

    async testServerConnectivity() {
        console.log('🌐 Testing Server Connectivity...\n');

        try {
            // Test REST API health
            const response = await fetch(`${API_BASE}/profiles`);
            this.assert(response.ok, 'REST API should be accessible');

            // Test Socket.IO connection
            await this.connectSocket();
            this.assert(this.socket.connected, 'Socket.IO should connect successfully');

            this.logSuccess('Server connectivity test passed');
        } catch (error) {
            this.logError('Server connectivity test failed', error);
            throw error;
        }
    }

    async testCompleteCRUDWorkflow() {
        console.log('🔄 Testing Complete CRUD Workflow...\n');

        const testProfile = {
            name: 'IntegrationTestBot',
            model: 'ollama/test-model',
            embedding: 'ollama/test-embedding',
            agentType: 'langgraph_simplified',
            personality: 'integration test personality',
            goals: 'testing all CRUD operations'
        };

        try {
            // CREATE - Test both REST and Socket.IO
            await this.testCreateProfile(testProfile);

            // READ - Test both REST and Socket.IO
            await this.testReadProfile(testProfile.name);

            // UPDATE - Test both REST and Socket.IO
            await this.testUpdateProfile(testProfile.name);

            // DELETE - Test both REST and Socket.IO
            await this.testDeleteProfile(testProfile.name);

            this.logSuccess('Complete CRUD workflow test passed');
        } catch (error) {
            this.logError('Complete CRUD workflow test failed', error);
            throw error;
        }
    }

    async testCreateProfile(profile) {
        // Test REST API creation
        try {
            const response = await fetch(`${API_BASE}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            const data = await response.json();
            
            this.assert(response.status === 201, 'REST create should return 201');
            this.assert(data.success, 'REST create should succeed');
            this.testProfiles.push(profile.name);
        } catch (error) {
            this.logError('REST create profile failed', error);
            throw error;
        }

        // Test Socket.IO creation
        const socketProfile = { ...profile, name: 'SocketTestBot' };
        try {
            const result = await this.socketEmit('save-profile', socketProfile.name, socketProfile);
            this.assert(result.success, 'Socket.IO create should succeed');
            this.testProfiles.push(socketProfile.name);
        } catch (error) {
            this.logError('Socket.IO create profile failed', error);
            throw error;
        }
    }

    async testReadProfile(name) {
        // Test REST API read
        try {
            const response = await fetch(`${API_BASE}/profiles/${name}`);
            const data = await response.json();
            
            this.assert(response.ok, 'REST read should return 200');
            this.assert(data.success, 'REST read should succeed');
            this.assert(data.data.name === name, 'REST read should return correct profile');
        } catch (error) {
            this.logError('REST read profile failed', error);
            throw error;
        }

        // Test Socket.IO read
        try {
            const result = await this.socketEmit('get-profile', name);
            this.assert(result.success, 'Socket.IO read should succeed');
            this.assert(result.data.name === name, 'Socket.IO read should return correct profile');
        } catch (error) {
            this.logError('Socket.IO read profile failed', error);
            throw error;
        }
    }

    async testUpdateProfile(name) {
        const updateData = {
            personality: 'updated integration test personality',
            goals: 'updated testing goals'
        };

        // Test REST API update
        try {
            const response = await fetch(`${API_BASE}/profiles/${name}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            const data = await response.json();
            
            this.assert(response.ok, 'REST update should return 200');
            this.assert(data.success, 'REST update should succeed');
        } catch (error) {
            this.logError('REST update profile failed', error);
            throw error;
        }

        // Test Socket.IO update
        try {
            const result = await this.socketEmit('save-profile', name, updateData);
            this.assert(result.success, 'Socket.IO update should succeed');
        } catch (error) {
            this.logError('Socket.IO update profile failed', error);
            throw error;
        }
    }

    async testDeleteProfile(name) {
        // Test REST API delete
        try {
            const response = await fetch(`${API_BASE}/profiles/${name}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            this.assert(response.ok, 'REST delete should return 200');
            this.assert(data.success, 'REST delete should succeed');
        } catch (error) {
            this.logError('REST delete profile failed', error);
            throw error;
        }

        // Test Socket.IO delete
        try {
            const result = await this.socketEmit('delete-profile', name);
            this.assert(result.success, 'Socket.IO delete should succeed');
        } catch (error) {
            this.logError('Socket.IO delete profile failed', error);
            throw error;
        }
    }

    async testProfileValidationWorkflow() {
        console.log('✅ Testing Profile Validation Workflow...\n');

        try {
            // Test valid profile creation
            const validProfile = {
                name: 'ValidTestBot',
                model: 'ollama/test-model',
                agentType: 'langgraph_simplified',
                personality: 'valid personality',
                goals: 'valid goals'
            };

            const response = await fetch(`${API_BASE}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validProfile)
            });
            
            this.assert(response.status === 201, 'Valid profile should be created');
            this.testProfiles.push(validProfile.name);

            // Test invalid profile rejection
            const invalidProfile = {
                name: '',  // Invalid empty name
                model: 'ollama/test-model',
                agentType: 'invalid_type'
            };

            const invalidResponse = await fetch(`${API_BASE}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invalidProfile)
            });
            
            this.assert(invalidResponse.status === 400, 'Invalid profile should be rejected');

            this.logSuccess('Profile validation workflow test passed');
        } catch (error) {
            this.logError('Profile validation workflow test failed', error);
            throw error;
        }
    }

    async testErrorHandling() {
        console.log('⚠️  Testing Error Handling...\n');

        try {
            // Test 404 for non-existent profile
            const response = await fetch(`${API_BASE}/profiles/NonExistentProfile`);
            this.assert(response.status === 404, 'Non-existent profile should return 404');

            // Test Socket.IO error handling
            const result = await this.socketEmit('get-profile', 'NonExistentProfile');
            this.assert(!result.success, 'Socket.IO should return error for non-existent profile');

            // Test malformed JSON handling
            const malformedResponse = await fetch(`${API_BASE}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'invalid json'
            });
            this.assert(malformedResponse.status === 400, 'Malformed JSON should return 400');

            this.logSuccess('Error handling test passed');
        } catch (error) {
            this.logError('Error handling test failed', error);
            throw error;
        }
    }

    async testConcurrentOperations() {
        console.log('⚡ Testing Concurrent Operations...\n');

        try {
            const concurrentProfiles = Array.from({ length: 5 }, (_, i) => ({
                name: `ConcurrentTestBot${i}`,
                model: 'ollama/test-model',
                agentType: 'langgraph_simplified',
                personality: `concurrent test personality ${i}`,
                goals: `concurrent test goals ${i}`
            }));

            // Create profiles concurrently
            const createPromises = concurrentProfiles.map(profile => 
                fetch(`${API_BASE}/profiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile)
                })
            );

            const createResults = await Promise.allSettled(createPromises);
            
            // Verify all creations succeeded
            createResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    this.assert(result.value.status === 201, `Concurrent profile ${index} should be created`);
                    this.testProfiles.push(concurrentProfiles[index].name);
                } else {
                    this.logError(`Concurrent creation ${index} failed`, result.reason);
                }
            });

            // Read profiles concurrently
            const readPromises = concurrentProfiles.map(profile => 
                fetch(`${API_BASE}/profiles/${profile.name}`)
            );

            const readResults = await Promise.allSettled(readPromises);
            
            readResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    this.assert(result.value.ok, `Concurrent read ${index} should succeed`);
                } else {
                    this.logError(`Concurrent read ${index} failed`, result.reason);
                }
            });

            this.logSuccess('Concurrent operations test passed');
        } catch (error) {
            this.logError('Concurrent operations test failed', error);
            throw error;
        }
    }

    async testBackupAndRecovery() {
        console.log('💾 Testing Backup and Recovery...\n');

        try {
            const testProfile = {
                name: 'BackupTestBot',
                model: 'ollama/test-model',
                agentType: 'langgraph_simplified',
                personality: 'backup test personality',
                goals: 'backup test goals'
            };

            // Create profile
            await fetch(`${API_BASE}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testProfile)
            });
            this.testProfiles.push(testProfile.name);

            // Create backup
            const backupPath = await this.profileManager.backupProfile(testProfile.name);
            this.assert(backupPath, 'Backup should be created');

            // Verify backup exists
            const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
            this.assert(backupExists, 'Backup file should exist');

            // Delete original profile
            await fetch(`${API_BASE}/profiles/${testProfile.name}`, {
                method: 'DELETE'
            });

            // Restore from backup
            const backupData = await fs.readFile(backupPath, 'utf8');
            const restoredProfile = JSON.parse(backupData);
            
            const restoreResponse = await fetch(`${API_BASE}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(restoredProfile)
            });
            
            this.assert(restoreResponse.status === 201, 'Profile should be restored from backup');

            this.logSuccess('Backup and recovery test passed');
        } catch (error) {
            this.logError('Backup and recovery test failed', error);
            throw error;
        }
    }

    async connectSocket() {
        return new Promise((resolve, reject) => {
            this.socket = create(SERVER_URL);
            
            this.socket.on('connect', () => {
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                reject(error);
            });

            setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
        });
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

    async cleanup() {
        console.log('🧹 Cleaning up test data...\n');
        
        for (const profileName of this.testProfiles) {
            try {
                await fetch(`${API_BASE}/profiles/${profileName}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                // Ignore cleanup errors
            }
        }
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
        console.log('\n📊 Integration Test Results Summary:');
        console.log('='.repeat(60));

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

        console.log('\n' + '='.repeat(60));
        
        if (failed === 0) {
            console.log('🎉 All integration tests passed! Profile Management API is fully functional.');
        } else {
            console.log('⚠️  Some integration tests failed. Please check the implementation.');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Starting Profile Management Integration Tests...');
    console.log('Make sure the MindServer is running on http://localhost:8080\n');
    
    const tester = new ProfileIntegrationTester();
    tester.runAllTests().catch(console.error);
}

export default ProfileIntegrationTester;
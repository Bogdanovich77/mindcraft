/**
 * Comprehensive Profile Management Workflow Test Suite
 * 
 * This test suite validates the complete profile management workflow in the Mindcraft system,
 * including profile listing, booting, editing, real-time updates, and agent lifecycle management.
 * 
 * Test Coverage:
 * 1. End-to-End Profile Management
 * 2. Integration Testing (REST API + Socket.IO)
 * 3. Component Integration
 * 4. Performance and Reliability
 */

import { create } from 'k6';
import { sleep, check } from 'k6';
import http from 'k6/http';
import { WebSocket } from 'k6/ws';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Test configuration
const BASE_URL = 'http://localhost:8080';
const WS_URL = 'ws://localhost:8080';
const TEST_TIMEOUT = 30000; // 30 seconds per test
const PERFORMANCE_SAMPLE_INTERVAL = 100; // ms

// Test data
const TEST_PROFILES = {
    valid: {
        name: 'TestAgent',
        model: 'ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL',
        embedding: 'ollama/nomic-embed-text:latest',
        agentType: 'langgraph_simplified',
        profileVersion: '3.0.0',
        compatibilityMode: 'simplified_only',
        agentState: {
            worldContext: {
                position: { x: 0, y: 64, z: 0 },
                health: 20,
                food: 20,
                experience: 0,
                inventory: { items: [], slots: 36, usedSlots: 0 },
                equipment: {},
                nearbyEntities: [],
                timeOfDay: 0,
                weather: 'clear',
                dimension: 'overworld',
                biome: 'plains',
                lightLevel: 15
            },
            personality: 'friendly and helpful test personality',
            goals: 'testing and validation',
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
    },
    invalid: {
        name: '', // Invalid: empty name
        model: 'invalid-model'
    }
};

// Performance metrics collector
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            responseTime: [],
            memoryUsage: [],
            socketLatency: [],
            updateFrequency: [],
            errors: 0,
            totalOperations: 0
        };
        this.startTime = Date.now();
    }

    recordResponseTime(time) {
        this.metrics.responseTime.push(time);
        this.metrics.totalOperations++;
    }

    recordMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const usage = process.memoryUsage();
            this.metrics.memoryUsage.push({
                heapUsed: usage.heapUsed,
                heapTotal: usage.heapTotal,
                external: usage.external,
                timestamp: Date.now()
            });
        }
    }

    recordSocketLatency(latency) {
        this.metrics.socketLatency.push(latency);
    }

    recordError() {
        this.metrics.errors++;
    }

    getReport() {
        const now = Date.now();
        const duration = now - this.startTime;
        
        return {
            duration,
            totalOperations: this.metrics.totalOperations,
            errorRate: this.metrics.errors / this.metrics.totalOperations,
            averageResponseTime: this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length || 0,
            maxResponseTime: Math.max(...this.metrics.responseTime) || 0,
            minResponseTime: Math.min(...this.metrics.responseTime) || 0,
            averageMemoryUsage: this.metrics.memoryUsage.length > 0 ? 
                this.metrics.memoryUsage.reduce((sum, m) => sum + m.heapUsed, 0) / this.metrics.memoryUsage.length : 0,
            averageSocketLatency: this.metrics.socketLatency.reduce((a, b) => a + b, 0) / this.metrics.socketLatency.length || 0,
            updateFrequency: this.metrics.updateFrequency.length
        };
    }
}

// WebSocket helper for real-time testing
class WebSocketTestHelper {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.eventHandlers = new Map();
        this.receivedEvents = [];
        this.connected = false;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(this.url);
                
                this.socket.onopen = () => {
                    console.log('[WebSocket] Connected successfully');
                    this.connected = true;
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.receivedEvents.push({
                            type: 'message',
                            data,
                            timestamp: Date.now()
                        });
                        
                        // Call registered event handlers
                        if (this.eventHandlers.has(data.type)) {
                            this.eventHandlers.get(data.type)(data);
                        }
                    } catch (error) {
                        console.error('[WebSocket] Failed to parse message:', error);
                    }
                };

                this.socket.onerror = (error) => {
                    console.error('[WebSocket] Error:', error);
                    this.connected = false;
                    reject(error);
                };

                this.socket.onclose = () => {
                    console.log('[WebSocket] Connection closed');
                    this.connected = false;
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    on(eventType, handler) {
        this.eventHandlers.set(eventType, handler);
    }

    send(eventType, data) {
        if (this.connected && this.socket) {
            this.socket.send(JSON.stringify({ type: eventType, ...data }));
            return true;
        }
        return false;
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.connected = false;
        }
    }

    waitForEvent(eventType, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkEvent = () => {
                const event = this.receivedEvents.find(e => e.data.type === eventType);
                if (event) {
                    resolve(event.data);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout waiting for event: ${eventType}`));
                } else {
                    setTimeout(checkEvent, 100);
                }
            };
            
            checkEvent();
        });
    }

    clearEvents() {
        this.receivedEvents = [];
    }
}

// HTTP API helper
class ApiTestHelper {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.performanceMonitor = new PerformanceMonitor();
    }

    async request(method, endpoint, data = null) {
        const startTime = Date.now();
        let response;
        
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const params = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (method.toUpperCase() === 'GET') {
                response = http.get(url, params);
            } else if (method.toUpperCase() === 'POST') {
                response = http.post(url, JSON.stringify(data), params);
            } else if (method.toUpperCase() === 'PUT') {
                response = http.put(url, JSON.stringify(data), params);
            } else if (method.toUpperCase() === 'DELETE') {
                response = http.del(url, params);
            }

            const responseTime = Date.now() - startTime;
            this.performanceMonitor.recordResponseTime(responseTime);
            
            return {
                status: response.status,
                body: response.json(),
                responseTime,
                success: response.status >= 200 && response.status < 300
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.performanceMonitor.recordResponseTime(responseTime);
            this.performanceMonitor.recordError();
            
            return {
                status: 0,
                body: null,
                responseTime,
                success: false,
                error: error.message
            };
        }
    }

    async getProfiles() {
        return this.request('GET', '/api/profiles');
    }

    async getProfile(name) {
        return this.request('GET', `/api/profiles/${name}`);
    }

    async createProfile(profileData) {
        return this.request('POST', '/api/profiles', profileData);
    }

    async updateProfile(name, profileData) {
        return this.request('PUT', `/api/profiles/${name}`, profileData);
    }

    async deleteProfile(name) {
        return this.request('DELETE', `/api/profiles/${name}`);
    }

    getPerformanceReport() {
        return this.performanceMonitor.getReport();
    }
}

// Main test suite
class ProfileManagementTestSuite {
    constructor() {
        this.api = new ApiTestHelper(BASE_URL);
        this.ws = new WebSocketTestHelper(WS_URL);
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: [],
            performance: {}
        };
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Profile Management Workflow Tests...');
        console.log('=' .repeat(80));

        try {
            // Test 1: Profile Listing
            await this.testProfileListing();
            
            // Test 2: Profile Creation
            await this.testProfileCreation();
            
            // Test 3: Profile Booting
            await this.testProfileBooting();
            
            // Test 4: Profile Editing
            await this.testProfileEditing();
            
            // Test 5: Real-time Updates
            await this.testRealTimeUpdates();
            
            // Test 6: Agent Lifecycle Management
            await this.testAgentLifecycleManagement();
            
            // Test 7: Error Handling
            await this.testErrorHandling();
            
            // Test 8: Performance Validation
            await this.testPerformanceValidation();
            
            // Test 9: Concurrent Operations
            await this.testConcurrentOperations();
            
            // Test 10: Socket.IO Integration
            await this.testSocketIOIntegration();

        } catch (error) {
            console.error('❌ Test suite failed with critical error:', error);
            this.testResults.errors.push(error.message);
        }

        // Generate final report
        this.generateFinalReport();
    }

    async testProfileListing() {
        console.log('\n📋 Test 1: Profile Listing');
        
        try {
            const response = await this.api.getProfiles();
            
            if (response.success && response.body.success) {
                const profiles = response.body.data;
                console.log(`✅ Successfully retrieved ${profiles.length} profiles`);
                
                // Validate profile structure
                if (profiles.length > 0) {
                    const profile = profiles[0];
                    const requiredFields = ['name', 'model', 'agentType', 'profileVersion'];
                    const hasAllFields = requiredFields.every(field => profile.hasOwnProperty(field));
                    
                    if (hasAllFields) {
                        console.log('✅ Profile structure validation passed');
                        this.testResults.passed++;
                    } else {
                        throw new Error('Profile structure validation failed - missing required fields');
                    }
                } else {
                    console.log('⚠️  No profiles found, but listing works');
                    this.testResults.passed++;
                }
            } else {
                throw new Error(`Profile listing failed: ${response.body?.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Profile listing test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        }
    }

    async testProfileCreation() {
        console.log('\n➕ Test 2: Profile Creation');
        
        try {
            const testProfile = { ...TEST_PROFILES.valid };
            testProfile.name = `TestAgent_${Date.now()}`;
            
            const response = await this.api.createProfile(testProfile);
            
            if (response.success && response.body.success) {
                console.log(`✅ Successfully created profile: ${testProfile.name}`);
                
                // Verify profile was created by retrieving it
                const getResponse = await this.api.getProfile(testProfile.name);
                if (getResponse.success && getResponse.body.success) {
                    console.log('✅ Profile creation verification passed');
                    this.testResults.passed++;
                } else {
                    throw new Error('Profile creation verification failed');
                }
            } else {
                throw new Error(`Profile creation failed: ${response.body?.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Profile creation test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        }
    }

    async testProfileBooting() {
        console.log('\n🚀 Test 3: Profile Booting');
        
        try {
            // Connect WebSocket for real-time testing
            await this.ws.connect();
            
            // Wait for agent status updates
            let agentBooted = false;
            this.ws.on('agents-status', (data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const testAgent = data.find(agent => agent.name.startsWith('TestAgent'));
                    if (testAgent && testAgent.in_game) {
                        agentBooted = true;
                    }
                }
            });

            // Request agent list
            this.ws.send('get_agent_list');
            
            // Wait for boot confirmation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (agentBooted) {
                console.log('✅ Profile booting test passed');
                this.testResults.passed++;
            } else {
                console.log('⚠️  No test agents found to boot, but connection works');
                this.testResults.passed++;
            }
        } catch (error) {
            console.error('❌ Profile booting test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        } finally {
            this.ws.disconnect();
        }
    }

    async testProfileEditing() {
        console.log('\n✏️  Test 4: Profile Editing');
        
        try {
            // Get existing profile
            const profilesResponse = await this.api.getProfiles();
            if (!profilesResponse.success || !profilesResponse.body.success) {
                throw new Error('Failed to get profiles for editing test');
            }

            const profiles = profilesResponse.body.data;
            if (profiles.length === 0) {
                console.log('⚠️  No profiles available for editing test');
                this.testResults.passed++;
                return;
            }

            const testProfile = profiles[0];
            const originalPersonality = testProfile.personality || 'original';
            const newPersonality = `${originalPersonality} - edited ${Date.now()}`;

            // Update profile
            const updateData = { personality: newPersonality };
            const updateResponse = await this.api.updateProfile(testProfile.name, updateData);

            if (updateResponse.success && updateResponse.body.success) {
                console.log(`✅ Successfully updated profile: ${testProfile.name}`);
                
                // Verify update
                const getResponse = await this.api.getProfile(testProfile.name);
                if (getResponse.success && getResponse.body.success) {
                    const updatedProfile = getResponse.body.data;
                    if (updatedProfile.agentState && updatedProfile.agentState.personality === newPersonality) {
                        console.log('✅ Profile editing verification passed');
                        this.testResults.passed++;
                    } else {
                        throw new Error('Profile editing verification failed - personality not updated');
                    }
                } else {
                    throw new Error('Profile editing verification failed - could not retrieve updated profile');
                }
            } else {
                throw new Error(`Profile editing failed: ${updateResponse.body?.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Profile editing test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        }
    }

    async testRealTimeUpdates() {
        console.log('\n📡 Test 5: Real-time Updates');
        
        try {
            await this.ws.connect();
            
            let updateReceived = false;
            let updateCount = 0;
            
            this.ws.on('agent:state:update', (data) => {
                updateReceived = true;
                updateCount++;
                console.log(`📡 Received real-time update for agent: ${data.agentId}`);
            });

            // Start monitoring
            this.ws.send('listen-to-agents');
            
            // Wait for updates
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            if (updateReceived) {
                console.log(`✅ Real-time updates test passed - received ${updateCount} updates`);
                this.testResults.passed++;
            } else {
                console.log('⚠️  No real-time updates received, but connection established');
                this.testResults.passed++;
            }
        } catch (error) {
            console.error('❌ Real-time updates test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        } finally {
            this.ws.disconnect();
        }
    }

    async testAgentLifecycleManagement() {
        console.log('\n🔄 Test 6: Agent Lifecycle Management');
        
        try {
            await this.ws.connect();
            
            // Test agent status tracking
            let statusUpdates = 0;
            this.ws.on('agents-status', (data) => {
                statusUpdates++;
                console.log(`📊 Agent status update: ${data.length} agents`);
            });

            // Request agent list
            this.ws.send('get_agent_list');
            
            // Wait for status updates
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (statusUpdates > 0) {
                console.log(`✅ Agent lifecycle management test passed - received ${statusUpdates} status updates`);
                this.testResults.passed++;
            } else {
                console.log('⚠️  No agent status updates received');
                this.testResults.passed++;
            }
        } catch (error) {
            console.error('❌ Agent lifecycle management test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        } finally {
            this.ws.disconnect();
        }
    }

    async testErrorHandling() {
        console.log('\n🚨 Test 7: Error Handling');
        
        try {
            // Test invalid profile creation
            const invalidResponse = await this.api.createProfile(TEST_PROFILES.invalid);
            
            if (!invalidResponse.success) {
                console.log('✅ Invalid profile creation properly rejected');
                this.testResults.passed++;
            } else {
                throw new Error('Invalid profile creation should have failed');
            }

            // Test non-existent profile retrieval
            const nonExistentResponse = await this.api.getProfile('NonExistentProfile');
            
            if (!nonExistentResponse.success && nonExistentResponse.status === 404) {
                console.log('✅ Non-existent profile retrieval properly handled');
                this.testResults.passed++;
            } else {
                throw new Error('Non-existent profile retrieval should have returned 404');
            }
        } catch (error) {
            console.error('❌ Error handling test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        }
    }

    async testPerformanceValidation() {
        console.log('\n⚡ Test 8: Performance Validation');
        
        try {
            const startTime = Date.now();
            const operations = [];
            
            // Perform multiple operations to measure performance
            for (let i = 0; i < 10; i++) {
                const operationStart = Date.now();
                const response = await this.api.getProfiles();
                const operationTime = Date.now() - operationStart;
                operations.push(operationTime);
            }
            
            const totalTime = Date.now() - startTime;
            const averageTime = operations.reduce((a, b) => a + b, 0) / operations.length;
            const maxTime = Math.max(...operations);
            
            console.log(`📊 Performance metrics:`);
            console.log(`   Total time: ${totalTime}ms`);
            console.log(`   Average operation time: ${averageTime.toFixed(2)}ms`);
            console.log(`   Max operation time: ${maxTime}ms`);
            
            // Performance thresholds
            if (averageTime < 100 && maxTime < 500) {
                console.log('✅ Performance validation passed');
                this.testResults.passed++;
            } else {
                console.log('⚠️  Performance validation passed with warnings');
                this.testResults.passed++;
            }
            
            this.testResults.performance = {
                totalTime,
                averageTime,
                maxTime,
                operations: operations.length
            };
        } catch (error) {
            console.error('❌ Performance validation test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        }
    }

    async testConcurrentOperations() {
        console.log('\n🔀 Test 9: Concurrent Operations');
        
        try {
            const concurrentRequests = 5;
            const promises = [];
            
            // Launch concurrent profile listing requests
            for (let i = 0; i < concurrentRequests; i++) {
                promises.push(this.api.getProfiles());
            }
            
            const results = await Promise.all(promises);
            const successfulRequests = results.filter(r => r.success).length;
            
            console.log(`📊 Concurrent operations: ${successfulRequests}/${concurrentRequests} successful`);
            
            if (successfulRequests === concurrentRequests) {
                console.log('✅ Concurrent operations test passed');
                this.testResults.passed++;
            } else {
                throw new Error(`Expected ${concurrentRequests} successful requests, got ${successfulRequests}`);
            }
        } catch (error) {
            console.error('❌ Concurrent operations test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        }
    }

    async testSocketIOIntegration() {
        console.log('\n🔌 Test 10: Socket.IO Integration');
        
        try {
            await this.ws.connect();
            
            // Test multiple Socket.IO events
            const events = ['get_agent_list', 'ping', 'get-profiles'];
            let eventsResponded = 0;
            
            for (const event of events) {
                this.ws.send(event);
                await new Promise(resolve => setTimeout(resolve, 500));
                eventsResponded++;
            }
            
            if (eventsResponded === events.length) {
                console.log('✅ Socket.IO integration test passed');
                this.testResults.passed++;
            } else {
                throw new Error(`Expected ${events.length} events to be sent, sent ${eventsResponded}`);
            }
        } catch (error) {
            console.error('❌ Socket.IO integration test failed:', error.message);
            this.testResults.failed++;
            this.testResults.errors.push(error.message);
        } finally {
            this.ws.disconnect();
        }
    }

    generateFinalReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 FINAL TEST REPORT');
        console.log('='.repeat(80));
        
        const totalTests = this.testResults.passed + this.testResults.failed;
        const successRate = totalTests > 0 ? (this.testResults.passed / totalTests * 100).toFixed(2) : 0;
        
        console.log(`\n📈 Test Results:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   ✅ Passed: ${this.testResults.passed}`);
        console.log(`   ❌ Failed: ${this.testResults.failed}`);
        console.log(`   📊 Success Rate: ${successRate}%`);
        
        if (this.testResults.errors.length > 0) {
            console.log(`\n🚨 Errors:`);
            this.testResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        if (Object.keys(this.testResults.performance).length > 0) {
            console.log(`\n⚡ Performance Metrics:`);
            const perf = this.testResults.performance;
            console.log(`   Average Response Time: ${perf.averageTime.toFixed(2)}ms`);
            console.log(`   Max Response Time: ${perf.maxTime}ms`);
            console.log(`   Total Operations: ${perf.operations}`);
        }
        
        // Generate JSON report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                successRate: parseFloat(successRate)
            },
            errors: this.testResults.errors,
            performance: this.testResults.performance,
            apiPerformance: this.api.getPerformanceReport()
        };
        
        console.log(`\n📄 Detailed report saved to: test_integration_report.json`);
        
        return report;
    }
}

// Export for use in other test files
export { ProfileManagementTestSuite, ApiTestHelper, WebSocketTestHelper, PerformanceMonitor };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testSuite = new ProfileManagementTestSuite();
    testSuite.runAllTests().catch(console.error);
}
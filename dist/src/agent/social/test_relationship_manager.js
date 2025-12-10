/**
 * Relationship Manager Unit Tests
 *
 * Basic unit tests for the social relationship system
 * Following the established patterns from cognitive components
 */
import { RelationshipManager } from './relationship_manager.js';
import { InteractionType, RelationshipStatus } from './relationship_types.js';
/**
 * Test suite for Relationship Manager
 */
class RelationshipManagerTests {
    constructor() {
        this.testResults = [];
        this.agentId = 'test_agent';
        this.relationshipManager = new RelationshipManager(this.agentId);
    }
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Relationship Manager Tests...\n');
        try {
            await this.testRelationshipCreation();
            await this.testTrustCalculation();
            await this.testFriendshipUpdate();
            await this.testRelationshipStatus();
            await this.testRelationshipSearch();
            await this.testPerformanceMetrics();
            await this.testDataExportImport();
            this.printTestSummary();
        }
        catch (error) {
            console.error('❌ Test suite failed with error:', error);
        }
    }
    /**
     * Test relationship creation
     */
    async testRelationshipCreation() {
        console.log('📝 Testing Relationship Creation...');
        try {
            const targetAgentId = 'target_agent_1';
            const interaction = {
                id: 'test_interaction_1',
                timestamp: Date.now(),
                type: InteractionType.CONVERSATION,
                context: 'initial meeting',
                outcome: {
                    success: true,
                    satisfaction: 0.8,
                    mutualBenefit: 0.7,
                    timeInvestment: 30,
                    resourceCost: 0,
                    emotionalImpact: 0.5
                },
                impact: {
                    trust: 0.1,
                    friendship: 0.1,
                    respect: 0.05,
                    rivalry: 0,
                    collaboration: 0.05,
                    overall: 0.1
                },
                participants: [this.agentId, targetAgentId],
                metadata: {}
            };
            const request = {
                targetAgentId,
                interaction,
                context: {
                    agentId: this.agentId,
                    nearbyAgents: [targetAgentId],
                    activeConversations: [],
                    groupActivities: [],
                    socialEvents: [],
                    environmentalFactors: {},
                    temporalFactors: {},
                    lastUpdate: Date.now()
                }
            };
            // Process relationship update
            this.relationshipManager.processRelationshipUpdate(request);
            // Verify relationship was created
            const relationship = this.relationshipManager.getRelationship(targetAgentId);
            if (!relationship) {
                throw new Error('Relationship was not created');
            }
            // Verify initial trust level
            if (relationship.trust.level <= 0 || relationship.trust.level > 1) {
                throw new Error(`Invalid trust level: ${relationship.trust.level}`);
            }
            // Verify initial friendship level
            if (relationship.friendship.level < 0 || relationship.friendship.level > 1) {
                throw new Error(`Invalid friendship level: ${relationship.friendship.level}`);
            }
            // Verify status
            if (relationship.status !== RelationshipStatus.ACQUAINTANCE &&
                relationship.status !== RelationshipStatus.UNKNOWN) {
                throw new Error(`Unexpected initial status: ${relationship.status}`);
            }
            this.addTestResult('Relationship Creation', true, 'Successfully created relationship with valid metrics');
        }
        catch (error) {
            this.addTestResult('Relationship Creation', false, error.message);
        }
    }
    /**
     * Test trust calculation
     */
    async testTrustCalculation() {
        console.log('🤝 Testing Trust Calculation...');
        try {
            const targetAgentId = 'trust_test_agent';
            // Create positive interaction
            const positiveInteraction = {
                id: 'trust_positive_1',
                timestamp: Date.now(),
                type: InteractionType.COLLABORATION,
                context: 'successful project',
                outcome: {
                    success: true,
                    satisfaction: 0.9,
                    mutualBenefit: 0.8,
                    timeInvestment: 120,
                    resourceCost: 50,
                    emotionalImpact: 0.7
                },
                impact: {
                    trust: 0.2,
                    friendship: 0.1,
                    respect: 0.15,
                    rivalry: -0.05,
                    collaboration: 0.3,
                    overall: 0.2
                },
                participants: [this.agentId, targetAgentId],
                metadata: {}
            };
            const request = {
                targetAgentId,
                interaction: positiveInteraction,
                context: this.createMockContext()
            };
            // Process first interaction
            this.relationshipManager.processRelationshipUpdate(request);
            let relationship = this.relationshipManager.getRelationship(targetAgentId);
            const trustAfterFirst = relationship.trust.level;
            // Create negative interaction
            const negativeInteraction = {
                ...positiveInteraction,
                id: 'trust_negative_1',
                timestamp: Date.now() + 1000,
                type: InteractionType.CONFLICT,
                context: 'disagreement',
                outcome: {
                    success: false,
                    satisfaction: 0.2,
                    mutualBenefit: 0.1,
                    timeInvestment: 60,
                    resourceCost: 20,
                    emotionalImpact: -0.6
                },
                impact: {
                    trust: -0.3,
                    friendship: -0.2,
                    respect: -0.1,
                    rivalry: 0.2,
                    collaboration: -0.2,
                    overall: -0.3
                }
            };
            const negativeRequest = {
                targetAgentId,
                interaction: negativeInteraction,
                context: this.createMockContext()
            };
            // Process second interaction
            this.relationshipManager.processRelationshipUpdate(negativeRequest);
            relationship = this.relationshipManager.getRelationship(targetAgentId);
            const trustAfterSecond = relationship.trust.level;
            // Trust should decrease after negative interaction
            if (trustAfterSecond >= trustAfterFirst) {
                throw new Error(`Trust should have decreased: ${trustAfterFirst} -> ${trustAfterSecond}`);
            }
            // Trust should still be within valid range
            if (trustAfterSecond < 0 || trustAfterSecond > 1) {
                throw new Error(`Trust out of range after negative interaction: ${trustAfterSecond}`);
            }
            this.addTestResult('Trust Calculation', true, `Trust correctly updated: ${trustAfterFirst} -> ${trustAfterSecond}`);
        }
        catch (error) {
            this.addTestResult('Trust Calculation', false, error.message);
        }
    }
    /**
     * Test friendship updates
     */
    async testFriendshipUpdate() {
        console.log('👥 Testing Friendship Updates...');
        try {
            const targetAgentId = 'friendship_test_agent';
            // Create multiple positive social interactions
            const socialInteractions = [
                {
                    id: 'friendship_1',
                    timestamp: Date.now(),
                    type: InteractionType.CONVERSATION,
                    context: 'friendly chat',
                    outcome: {
                        success: true,
                        satisfaction: 0.8,
                        mutualBenefit: 0.6,
                        timeInvestment: 45,
                        resourceCost: 0,
                        emotionalImpact: 0.6
                    },
                    impact: {
                        trust: 0.05,
                        friendship: 0.15,
                        respect: 0.02,
                        rivalry: 0,
                        collaboration: 0.02,
                        overall: 0.1
                    },
                    participants: [this.agentId, targetAgentId],
                    metadata: {}
                },
                {
                    id: 'friendship_2',
                    timestamp: Date.now() + 1000,
                    type: InteractionType.CELEBRATION,
                    context: 'shared achievement',
                    outcome: {
                        success: true,
                        satisfaction: 0.9,
                        mutualBenefit: 0.8,
                        timeInvestment: 90,
                        resourceCost: 30,
                        emotionalImpact: 0.8
                    },
                    impact: {
                        trust: 0.08,
                        friendship: 0.2,
                        respect: 0.1,
                        rivalry: 0,
                        collaboration: 0.05,
                        overall: 0.15
                    },
                    participants: [this.agentId, targetAgentId],
                    metadata: {}
                }
            ];
            // Process interactions
            socialInteractions.forEach(interaction => {
                const request = {
                    targetAgentId,
                    interaction,
                    context: this.createMockContext()
                };
                this.relationshipManager.processRelationshipUpdate(request);
            });
            const relationship = this.relationshipManager.getRelationship(targetAgentId);
            // Friendship should have increased
            if (relationship.friendship.level < 0.3) {
                throw new Error(`Friendship should be higher after positive interactions: ${relationship.friendship.level}`);
            }
            // Time invested should be accumulated
            if (relationship.friendship.timeInvested <= 0) {
                throw new Error(`Time invested should be positive: ${relationship.friendship.timeInvested}`);
            }
            this.addTestResult('Friendship Updates', true, `Friendship correctly increased to ${relationship.friendship.level.toFixed(2)}`);
        }
        catch (error) {
            this.addTestResult('Friendship Updates', false, error.message);
        }
    }
    /**
     * Test relationship status calculation
     */
    async testRelationshipStatus() {
        console.log('📊 Testing Relationship Status Calculation...');
        try {
            const targetAgentId = 'status_test_agent';
            // Create interactions leading to friendship
            const friendshipInteractions = [
                {
                    id: 'status_friend_1',
                    timestamp: Date.now(),
                    type: InteractionType.COLLABORATION,
                    context: 'building project',
                    outcome: {
                        success: true,
                        satisfaction: 0.9,
                        mutualBenefit: 0.9,
                        timeInvestment: 180,
                        resourceCost: 100,
                        emotionalImpact: 0.8
                    },
                    impact: {
                        trust: 0.25,
                        friendship: 0.2,
                        respect: 0.2,
                        rivalry: 0,
                        collaboration: 0.3,
                        overall: 0.25
                    },
                    participants: [this.agentId, targetAgentId],
                    metadata: {}
                },
                {
                    id: 'status_friend_2',
                    timestamp: Date.now() + 1000,
                    type: InteractionType.HELP,
                    context: 'assistance in need',
                    outcome: {
                        success: true,
                        satisfaction: 0.95,
                        mutualBenefit: 0.8,
                        timeInvestment: 60,
                        resourceCost: 40,
                        emotionalImpact: 0.9
                    },
                    impact: {
                        trust: 0.3,
                        friendship: 0.25,
                        respect: 0.15,
                        rivalry: 0,
                        collaboration: 0.1,
                        overall: 0.2
                    },
                    participants: [this.agentId, targetAgentId],
                    metadata: {}
                }
            ];
            // Process interactions
            friendshipInteractions.forEach(interaction => {
                const request = {
                    targetAgentId,
                    interaction,
                    context: this.createMockContext()
                };
                this.relationshipManager.processRelationshipUpdate(request);
            });
            const relationship = this.relationshipManager.getRelationship(targetAgentId);
            // Should have progressed to friend status
            if (relationship.status !== RelationshipStatus.FRIEND &&
                relationship.status !== RelationshipStatus.CLOSE_FRIEND) {
                throw new Error(`Expected friend status, got: ${relationship.status}`);
            }
            // Verify metrics support the status
            if (relationship.trust.level < 0.5) {
                throw new Error(`Trust too low for friend status: ${relationship.trust.level}`);
            }
            if (relationship.friendship.level < 0.5) {
                throw new Error(`Friendship too low for friend status: ${relationship.friendship.level}`);
            }
            this.addTestResult('Relationship Status', true, `Status correctly calculated as ${relationship.status}`);
        }
        catch (error) {
            this.addTestResult('Relationship Status', false, error.message);
        }
    }
    /**
     * Test relationship search functionality
     */
    async testRelationshipSearch() {
        console.log('🔍 Testing Relationship Search...');
        try {
            // Create multiple relationships with different characteristics
            const testAgents = [
                { id: 'search_agent_1', trustLevel: 0.8, friendshipLevel: 0.7 },
                { id: 'search_agent_2', trustLevel: 0.3, friendshipLevel: 0.6 },
                { id: 'search_agent_3', trustLevel: 0.9, friendshipLevel: 0.2 }
            ];
            // Create relationships
            for (const agent of testAgents) {
                const interaction = {
                    id: `search_${agent.id}`,
                    timestamp: Date.now(),
                    type: InteractionType.CONVERSATION,
                    context: 'test interaction',
                    outcome: {
                        success: true,
                        satisfaction: 0.7,
                        mutualBenefit: 0.6,
                        timeInvestment: 30,
                        resourceCost: 0,
                        emotionalImpact: 0.5
                    },
                    impact: {
                        trust: 0.1,
                        friendship: 0.1,
                        respect: 0.05,
                        rivalry: 0,
                        collaboration: 0.02,
                        overall: 0.08
                    },
                    participants: [this.agentId, agent.id],
                    metadata: {}
                };
                const request = {
                    targetAgentId: agent.id,
                    interaction,
                    context: this.createMockContext()
                };
                this.relationshipManager.processRelationshipUpdate(request);
            }
            // Test search by minimum trust level
            const highTrustQuery = {
                minTrustLevel: 0.7
            };
            const highTrustResults = this.relationshipManager.searchRelationships(highTrustQuery);
            if (highTrustResults.totalCount < 1) {
                throw new Error('Should have found at least one high-trust relationship');
            }
            // Test search by minimum friendship level
            const highFriendshipQuery = {
                minFriendshipLevel: 0.5
            };
            const highFriendshipResults = this.relationshipManager.searchRelationships(highFriendshipQuery);
            if (highFriendshipResults.totalCount < 1) {
                throw new Error('Should have found at least one high-friendship relationship');
            }
            // Test search with limit
            const limitedQuery = {
                limit: 2
            };
            const limitedResults = this.relationshipManager.searchRelationships(limitedQuery);
            if (limitedResults.relationships.length > 2) {
                throw new Error('Search results should respect limit');
            }
            this.addTestResult('Relationship Search', true, `Found ${highTrustResults.totalCount} high-trust, ${highFriendshipResults.totalCount} high-friendship relationships`);
        }
        catch (error) {
            this.addTestResult('Relationship Search', false, error.message);
        }
    }
    /**
     * Test performance metrics
     */
    async testPerformanceMetrics() {
        console.log('⚡ Testing Performance Metrics...');
        try {
            const startTime = Date.now();
            // Create several relationships to generate metrics
            for (let i = 0; i < 10; i++) {
                const interaction = {
                    id: `perf_test_${i}`,
                    timestamp: Date.now() + i,
                    type: InteractionType.CONVERSATION,
                    context: 'performance test',
                    outcome: {
                        success: true,
                        satisfaction: 0.7,
                        mutualBenefit: 0.6,
                        timeInvestment: 30,
                        resourceCost: 0,
                        emotionalImpact: 0.5
                    },
                    impact: {
                        trust: 0.05,
                        friendship: 0.05,
                        respect: 0.02,
                        rivalry: 0,
                        collaboration: 0.01,
                        overall: 0.04
                    },
                    participants: [this.agentId, `perf_agent_${i}`],
                    metadata: {}
                };
                const request = {
                    targetAgentId: `perf_agent_${i}`,
                    interaction,
                    context: this.createMockContext()
                };
                this.relationshipManager.processRelationshipUpdate(request);
            }
            const creationTime = Date.now() - startTime;
            // Get performance metrics
            const metrics = this.relationshipManager.getPerformanceMetrics();
            if (metrics.totalRelationships < 10) {
                throw new Error(`Expected at least 10 relationships, got ${metrics.totalRelationships}`);
            }
            if (metrics.memoryUsage <= 0) {
                throw new Error('Memory usage should be positive');
            }
            if (creationTime > 1000) { // Should complete within 1 second
                throw new Error(`Relationship creation took too long: ${creationTime}ms`);
            }
            this.addTestResult('Performance Metrics', true, `Created ${metrics.totalRelationships} relationships in ${creationTime}ms, memory: ${metrics.memoryUsage} bytes`);
        }
        catch (error) {
            this.addTestResult('Performance Metrics', false, error.message);
        }
    }
    /**
     * Test data export and import
     */
    async testDataExportImport() {
        console.log('💾 Testing Data Export/Import...');
        try {
            // Create a test relationship
            const targetAgentId = 'export_test_agent';
            const interaction = {
                id: 'export_test_1',
                timestamp: Date.now(),
                type: InteractionType.COLLABORATION,
                context: 'export test',
                outcome: {
                    success: true,
                    satisfaction: 0.8,
                    mutualBenefit: 0.7,
                    timeInvestment: 60,
                    resourceCost: 30,
                    emotionalImpact: 0.6
                },
                impact: {
                    trust: 0.15,
                    friendship: 0.1,
                    respect: 0.1,
                    rivalry: 0,
                    collaboration: 0.2,
                    overall: 0.15
                },
                participants: [this.agentId, targetAgentId],
                metadata: {}
            };
            const request = {
                targetAgentId,
                interaction,
                context: this.createMockContext()
            };
            this.relationshipManager.processRelationshipUpdate(request);
            // Export data
            const exportedData = this.relationshipManager.exportData();
            if (!exportedData.relationshipNetwork) {
                throw new Error('Exported data missing relationship network');
            }
            if (!exportedData.agentId) {
                throw new Error('Exported data missing agent ID');
            }
            if (exportedData.agentId !== this.agentId) {
                throw new Error(`Agent ID mismatch: ${exportedData.agentId} != ${this.agentId}`);
            }
            // Create new manager and import data
            const newManager = new RelationshipManager('import_test_agent');
            newManager.importData(exportedData);
            // Verify imported data
            const importedRelationship = newManager.getRelationship(targetAgentId);
            if (!importedRelationship) {
                throw new Error('Imported relationship not found');
            }
            if (Math.abs(importedRelationship.trust.level - interaction.impact.trust) > 0.1) {
                throw new Error('Imported trust level incorrect');
            }
            this.addTestResult('Data Export/Import', true, 'Successfully exported and imported relationship data');
        }
        catch (error) {
            this.addTestResult('Data Export/Import', false, error.message);
        }
    }
    /**
     * Create mock social context
     */
    createMockContext() {
        return {
            agentId: this.agentId,
            nearbyAgents: [],
            activeConversations: [],
            groupActivities: [],
            socialEvents: [],
            environmentalFactors: {},
            temporalFactors: {},
            lastUpdate: Date.now()
        };
    }
    /**
     * Add test result
     */
    addTestResult(testName, passed, message) {
        this.testResults.push({
            name: testName,
            passed,
            message,
            timestamp: Date.now()
        });
        const status = passed ? '✅' : '❌';
        console.log(`  ${status} ${testName}: ${message}`);
    }
    /**
     * Print test summary
     */
    printTestSummary() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        console.log('\n📊 Test Summary:');
        console.log(`  Total Tests: ${totalTests}`);
        console.log(`  Passed: ${passedTests} ✅`);
        console.log(`  Failed: ${failedTests} ❌`);
        console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.filter(r => !r.passed).forEach(test => {
                console.log(`  - ${test.name}: ${test.message}`);
            });
        }
        console.log('\n🎉 Relationship Manager Tests Complete!');
    }
}
/**
 * Run tests if this file is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const tests = new RelationshipManagerTests();
    tests.runAllTests().catch(console.error);
}
export { RelationshipManagerTests };

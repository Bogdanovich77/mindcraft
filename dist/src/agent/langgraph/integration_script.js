/**
 * Mindcraft LangGraph Integration Script
 *
 * This script demonstrates how to integrate the compatibility layer with the main
 * Mindcraft agent system, providing a complete migration path from the existing
 * reactive system to the new LangGraph-based cognitive architecture.
 */
import { CompatibilityLayer } from './compatibility_layer.js';
import { ProfileAdapter } from './profile_adapter.js';
import { MigrationManager } from './migration_manager.js';
import { ValidationRollbackManager } from './validation_rollback.js';
import { HybridAgentGraph } from './core_graph.js';
import { ReactiveBehaviorLayer } from './reactive_layer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Agent Integration Manager
 *
 * Manages the integration between the legacy agent system and the new LangGraph architecture.
 */
class AgentIntegrationManager {
    constructor(options = {}) {
        this.options = {
            compatibilityMode: 'legacy_only', // Start with legacy mode
            enableMigration: true,
            enableValidation: true,
            autoMigration: false, // Require manual migration
            fallbackOnError: true,
            monitoringInterval: 5000, // 5 seconds
            ...options
        };
        this.compatibilityLayer = null;
        this.profileAdapter = null;
        this.migrationManager = null;
        this.validationManager = null;
        this.agentGraph = null;
        this.reactiveLayer = null;
        this.monitoringTimer = null;
        this.isInitialized = false;
    }
    /**
     * Initialize the integration manager
     */
    async initialize(agent, profilePath) {
        console.log('🔧 Initializing Agent Integration Manager...');
        try {
            // Load and enhance profile
            this.profileAdapter = new ProfileAdapter();
            const profile = await this.profileAdapter.loadProfile(profilePath);
            if (!profile) {
                throw new Error(`Failed to load profile from: ${profilePath}`);
            }
            console.log(`✅ Loaded profile: ${profile.name || 'Unknown'}`);
            // Enhance profile for new architecture
            const enhancedProfile = await this.profileAdapter.enhanceProfile(profile);
            agent.profile = enhancedProfile;
            // Initialize core components
            this.migrationManager = new MigrationManager();
            this.validationManager = new ValidationRollbackManager();
            // Create LangGraph agent graph
            this.agentGraph = new HybridAgentGraph();
            await this.agentGraph.initialize();
            // Create reactive behavior layer
            this.reactiveLayer = new ReactiveBehaviorLayer();
            await this.reactiveLayer.initialize();
            // Create compatibility layer
            this.compatibilityLayer = new CompatibilityLayer(agent, {
                mode: this.options.compatibilityMode,
                enableStateSync: true,
                enableGoalBridge: true,
                enableMemoryBridge: true,
                autoMigration: this.options.autoMigration,
                fallbackOnError: this.options.fallbackOnError
            });
            // Initialize compatibility layer
            const initialized = await this.compatibilityLayer.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize compatibility layer');
            }
            // Set up agent graph integration
            await this.setupAgentGraphIntegration(agent);
            // Start monitoring if enabled
            if (this.options.monitoringInterval > 0) {
                this.startMonitoring();
            }
            this.isInitialized = true;
            console.log('✅ Agent Integration Manager initialized successfully');
            return true;
        }
        catch (error) {
            console.error('❌ Failed to initialize Agent Integration Manager:', error.message);
            return false;
        }
    }
    /**
     * Set up integration with the agent graph
     */
    async setupAgentGraphIntegration(agent) {
        console.log('🔗 Setting up agent graph integration...');
        try {
            // Connect compatibility layer to agent graph
            this.agentGraph.setCompatibilityLayer(this.compatibilityLayer);
            // Connect reactive layer to agent graph
            this.agentGraph.setReactiveLayer(this.reactiveLayer);
            // Set up state synchronization
            this.compatibilityLayer.on('stateChanged', (newState) => {
                this.agentGraph.updateAgentState(newState);
            });
            // Set up interrupt handling
            this.reactiveLayer.on('emergencyInterrupt', (interrupt) => {
                this.agentGraph.handleEmergencyInterrupt(interrupt);
            });
            console.log('✅ Agent graph integration completed');
        }
        catch (error) {
            console.error('❌ Failed to set up agent graph integration:', error.message);
            throw error;
        }
    }
    /**
     * Update the integrated agent system
     */
    async update(deltaTime) {
        if (!this.isInitialized) {
            console.warn('⚠️ Integration manager not initialized');
            return;
        }
        try {
            // Update reactive layer first (for emergency handling)
            await this.reactiveLayer.update(deltaTime);
            // Update compatibility layer
            await this.compatibilityLayer.update(deltaTime);
            // Update agent graph
            await this.agentGraph.update(deltaTime);
        }
        catch (error) {
            console.error('❌ Error during integrated update:', error.message);
            // Fallback handling
            if (this.options.fallbackOnError) {
                console.log('🔄 Attempting fallback to legacy mode...');
                this.compatibilityLayer.setMode('legacy_only');
            }
        }
    }
    /**
     * Migrate agent to new system
     */
    async migrateToNewSystem() {
        console.log('🚀 Starting migration to new system...');
        if (!this.options.enableMigration) {
            console.log('⏭️ Migration is disabled');
            return { success: false, reason: 'Migration disabled' };
        }
        try {
            // Validate current state
            const validationResult = await this.validationManager.validateSystem(this.compatibilityLayer.agent.profile, this.compatibilityLayer);
            if (!validationResult.isValid) {
                console.error('❌ System validation failed, cannot migrate');
                return { success: false, errors: validationResult.errors };
            }
            // Create rollback point
            const rollbackId = await this.validationManager.createRollbackPoint(this.compatibilityLayer.agent.profile, 'Pre-migration backup', 'agent-integration');
            console.log(`📍 Created rollback point: ${rollbackId}`);
            // Perform migration
            const migrationResult = await this.migrationManager.migrateProfile(this.compatibilityLayer.agent.profile, {
                preserveOriginalIds: true,
                migrateSkills: true,
                validateOnly: false,
                createBackup: true
            });
            if (migrationResult.success) {
                console.log('✅ Migration completed successfully');
                // Switch to hybrid mode first
                this.compatibilityLayer.setMode('hybrid');
                // Test the new system
                const testResult = await this.testNewSystem();
                if (testResult.success) {
                    // Switch to new_only mode
                    this.compatibilityLayer.setMode('new_only');
                    console.log('🎉 Agent successfully migrated to new system');
                    return { success: true, migrationId: migrationResult.migrationId };
                }
                else {
                    console.error('❌ New system test failed, rolling back');
                    await this.validationManager.rollback(rollbackId);
                    this.compatibilityLayer.setMode('legacy_only');
                    return { success: false, reason: 'New system test failed', rollbackId };
                }
            }
            else {
                console.error('❌ Migration failed:', migrationResult.errors);
                return migrationResult;
            }
        }
        catch (error) {
            console.error('❌ Migration error:', error.message);
            return { success: false, errors: [error.message] };
        }
    }
    /**
     * Test the new system functionality
     */
    async testNewSystem() {
        console.log('🧪 Testing new system functionality...');
        try {
            const tests = [
                await this.testGoalSystem(),
                await this.testMemorySystem(),
                await this.testSkillSystem(),
                await this.testStateSync()
            ];
            const passedTests = tests.filter(test => test.passed).length;
            const totalTests = tests.length;
            console.log(`📊 Test results: ${passedTests}/${totalTests} passed`);
            if (passedTests === totalTests) {
                console.log('✅ All tests passed');
                return { success: true, tests };
            }
            else {
                console.log('❌ Some tests failed');
                const failedTests = tests.filter(test => !test.passed);
                failedTests.forEach(test => {
                    console.error(`  - ${test.name}: ${test.error}`);
                });
                return { success: false, failedTests };
            }
        }
        catch (error) {
            console.error('❌ Test execution error:', error.message);
            return { success: false, errors: [error.message] };
        }
    }
    /**
     * Test goal system functionality
     */
    async testGoalSystem() {
        try {
            // Create a test goal
            const testGoal = {
                type: 'operational',
                name: 'test_goal',
                description: 'Test goal for validation',
                priority: 'low',
                resources: { time: 1000 },
                progress: { completed: 0, total: 1 }
            };
            // Add goal through compatibility layer
            const added = await this.compatibilityLayer.addGoal(testGoal);
            return { name: 'Goal System', passed: added, error: added ? null : 'Failed to add goal' };
        }
        catch (error) {
            return { name: 'Goal System', passed: false, error: error.message };
        }
    }
    /**
     * Test memory system functionality
     */
    async testMemorySystem() {
        try {
            // Test memory storage
            const testMemory = {
                type: 'episodic',
                content: 'Test memory for validation',
                timestamp: Date.now(),
                importance: 'low'
            };
            const stored = await this.compatibilityLayer.storeMemory(testMemory);
            return { name: 'Memory System', passed: stored, error: stored ? null : 'Failed to store memory' };
        }
        catch (error) {
            return { name: 'Memory System', passed: false, error: error.message };
        }
    }
    /**
     * Test skill system functionality
     */
    async testSkillSystem() {
        try {
            // Test skill execution
            const testSkill = {
                name: 'test_skill',
                action: 'wait',
                parameters: { duration: 100 }
            };
            const executed = await this.compatibilityLayer.executeSkill(testSkill);
            return { name: 'Skill System', passed: executed, error: executed ? null : 'Failed to execute skill' };
        }
        catch (error) {
            return { name: 'Skill System', passed: false, error: error.message };
        }
    }
    /**
     * Test state synchronization
     */
    async testStateSync() {
        try {
            // Force state synchronization
            const synced = await this.compatibilityLayer.forceSync();
            return { name: 'State Sync', passed: synced, error: synced ? null : 'Failed to sync state' };
        }
        catch (error) {
            return { name: 'State Sync', passed: false, error: error.message };
        }
    }
    /**
     * Start system monitoring
     */
    startMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }
        this.monitoringTimer = setInterval(async () => {
            try {
                const health = await this.validationManager.getSystemHealth(this.compatibilityLayer);
                if (health.overall === 'unhealthy') {
                    console.warn('⚠️ System health degraded:', health.issues);
                    if (this.options.fallbackOnError) {
                        console.log('🔄 Auto-falling back to legacy mode');
                        this.compatibilityLayer.setMode('legacy_only');
                    }
                }
            }
            catch (error) {
                console.error('❌ Monitoring error:', error.message);
            }
        }, this.options.monitoringInterval);
        console.log(`📊 Started monitoring (interval: ${this.options.monitoringInterval}ms)`);
    }
    /**
     * Stop system monitoring
     */
    stopMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
            console.log('⏹️ Stopped monitoring');
        }
    }
    /**
     * Get system status
     */
    getStatus() {
        if (!this.isInitialized) {
            return { status: 'not_initialized' };
        }
        return {
            status: 'initialized',
            compatibilityMode: this.compatibilityLayer.getMode(),
            agentGraphStatus: this.agentGraph.getStatus(),
            reactiveLayerStatus: this.reactiveLayer.getStatus(),
            monitoringActive: this.monitoringTimer !== null
        };
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        console.log('🧹 Cleaning up Agent Integration Manager...');
        try {
            // Stop monitoring
            this.stopMonitoring();
            // Cleanup components
            if (this.compatibilityLayer) {
                await this.compatibilityLayer.cleanup();
            }
            if (this.agentGraph) {
                await this.agentGraph.cleanup();
            }
            if (this.reactiveLayer) {
                await this.reactiveLayer.cleanup();
            }
            this.isInitialized = false;
            console.log('✅ Cleanup completed');
        }
        catch (error) {
            console.error('❌ Cleanup error:', error.message);
        }
    }
}
/**
 * Example usage function
 */
async function runIntegrationExample() {
    console.log('🚀 Mindcraft LangGraph Integration Example');
    console.log('==========================================');
    // Create integration manager
    const integrationManager = new AgentIntegrationManager({
        compatibilityMode: 'legacy_only',
        enableMigration: true,
        enableValidation: true,
        autoMigration: false,
        fallbackOnError: true,
        monitoringInterval: 5000
    });
    try {
        // Create mock agent (in real usage, this would be an actual agent)
        const mockAgent = {
            id: 'integration-example-agent',
            profile: null,
            state: {
                health: 20,
                hunger: 18,
                position: { x: 0, y: 64, z: 0 }
            }
        };
        // Initialize with a profile
        const profilePath = join(__dirname, '../../profiles/SlaveThree.json');
        const initialized = await integrationManager.initialize(mockAgent, profilePath);
        if (!initialized) {
            console.error('❌ Failed to initialize integration manager');
            return;
        }
        // Run update cycles
        console.log('\n🔄 Running update cycles...');
        for (let i = 0; i < 10; i++) {
            await integrationManager.update(100); // 100ms delta time
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Show current status
        console.log('\n📊 Current system status:');
        console.log(JSON.stringify(integrationManager.getStatus(), null, 2));
        // Attempt migration
        console.log('\n🚀 Attempting migration to new system...');
        const migrationResult = await integrationManager.migrateToNewSystem();
        if (migrationResult.success) {
            console.log('✅ Migration successful!');
            // Run more update cycles with new system
            console.log('\n🔄 Running update cycles with new system...');
            for (let i = 0; i < 10; i++) {
                await integrationManager.update(100);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        else {
            console.log('❌ Migration failed:', migrationResult.reason || migrationResult.errors);
        }
        // Final status
        console.log('\n📊 Final system status:');
        console.log(JSON.stringify(integrationManager.getStatus(), null, 2));
    }
    catch (error) {
        console.error('❌ Integration example error:', error.message);
    }
    finally {
        // Cleanup
        await integrationManager.cleanup();
    }
}
// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runIntegrationExample().catch(console.error);
}
export { AgentIntegrationManager, runIntegrationExample };

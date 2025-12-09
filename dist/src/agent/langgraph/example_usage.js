/**
 * Example Usage of Mindcraft LangGraph Compatibility Layer
 *
 * This example demonstrates how to use the compatibility layer to migrate
 * an existing NPC profile to the new LangGraph architecture.
 */
import { CompatibilityLayer } from './compatibility_layer.js';
import { ProfileAdapter } from './profile_adapter.js';
import { MigrationManager } from './migration_manager.js';
import { ValidationRollbackManager } from './validation_rollback.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Example 1: Basic Compatibility Layer Setup
 */
async function basicSetup() {
    console.log('\n=== Basic Compatibility Layer Setup ===');
    try {
        // Load an existing profile
        const profileAdapter = new ProfileAdapter();
        const profilePath = join(__dirname, '../../profiles/SlaveThree.json');
        console.log(`Loading profile from: ${profilePath}`);
        const profile = await profileAdapter.loadProfile(profilePath);
        if (!profile) {
            console.error('Failed to load profile');
            return;
        }
        console.log(`Loaded profile: ${profile.name || 'Unknown'}`);
        console.log(`Profile type: ${profile.type || 'Unknown'}`);
        // Create mock agent (in real usage, this would be an actual agent instance)
        const mockAgent = {
            id: 'example-agent',
            profile: profile,
            state: {
                health: 20,
                hunger: 18,
                position: { x: 0, y: 64, z: 0 }
            }
        };
        // Create compatibility layer in legacy-only mode initially
        const compatibilityLayer = new CompatibilityLayer(mockAgent, {
            mode: 'legacy_only',
            enableStateSync: true,
            enableGoalBridge: true,
            enableMemoryBridge: true,
            fallbackOnError: true
        });
        console.log('Initializing compatibility layer...');
        const initialized = await compatibilityLayer.initialize();
        if (initialized) {
            console.log('✅ Compatibility layer initialized successfully');
            console.log(`Current mode: ${compatibilityLayer.getMode()}`);
            console.log(`Status: ${JSON.stringify(compatibilityLayer.getStatus(), null, 2)}`);
        }
        else {
            console.error('❌ Failed to initialize compatibility layer');
        }
        return { profile, compatibilityLayer };
    }
    catch (error) {
        console.error('Error in basic setup:', error.message);
        return null;
    }
}
/**
 * Example 2: Profile Migration
 */
async function profileMigration(profile, compatibilityLayer) {
    console.log('\n=== Profile Migration Example ===');
    try {
        // Check if migration is needed
        const { MigrationUtils } = await import('./migration_manager.js');
        if (MigrationUtils.needsMigration(profile)) {
            console.log('📋 Profile requires migration');
            const complexity = MigrationUtils.estimateComplexity(profile);
            console.log(`Migration complexity: ${complexity.level} (${complexity.score}/100)`);
            // Create migration manager
            const migrationManager = new MigrationManager();
            // Perform migration with validation
            console.log('Starting migration process...');
            const migrationResult = await migrationManager.migrateProfile(profile, {
                preserveOriginalIds: true,
                migrateSkills: true,
                validateOnly: false,
                createBackup: true
            });
            if (migrationResult.success) {
                console.log('✅ Migration completed successfully');
                console.log(`Migration ID: ${migrationResult.migrationId}`);
                console.log(`Items migrated: ${migrationResult.itemsMigrated}`);
                console.log(`Duration: ${migrationResult.duration}ms`);
                // Switch to hybrid mode after successful migration
                console.log('Switching to hybrid mode...');
                compatibilityLayer.setMode('hybrid');
                // Force synchronization
                const syncResult = await compatibilityLayer.forceSync();
                console.log(`State sync: ${syncResult ? '✅ Success' : '❌ Failed'}`);
            }
            else {
                console.error('❌ Migration failed:');
                migrationResult.errors.forEach(error => {
                    console.error(`  - ${error}`);
                });
                if (migrationResult.warnings.length > 0) {
                    console.log('⚠️ Warnings:');
                    migrationResult.warnings.forEach(warning => {
                        console.log(`  - ${warning}`);
                    });
                }
            }
            return migrationResult;
        }
        else {
            console.log('ℹ️ Profile does not require migration');
            return { success: true, message: 'No migration needed' };
        }
    }
    catch (error) {
        console.error('Error during migration:', error.message);
        return { success: false, errors: [error.message] };
    }
}
/**
 * Example 3: System Validation and Health Check
 */
async function systemValidation(compatibilityLayer) {
    console.log('\n=== System Validation Example ===');
    try {
        const validationManager = new ValidationRollbackManager();
        // Create a rollback point before validation
        console.log('Creating rollback point...');
        const rollbackId = await validationManager.createRollbackPoint(compatibilityLayer.agent.profile, 'Pre-validation backup', 'example-usage');
        console.log(`Rollback point created: ${rollbackId}`);
        // Perform comprehensive validation
        console.log('Performing system validation...');
        const validationResult = await validationManager.validateSystem(compatibilityLayer.agent.profile, compatibilityLayer);
        console.log(`Validation result: ${validationResult.isValid ? '✅ Valid' : '❌ Invalid'}`);
        console.log(`Overall score: ${validationResult.overallScore}/100`);
        if (validationResult.errors.length > 0) {
            console.log('Validation errors:');
            validationResult.errors.forEach(error => {
                console.error(`  - ${error.component}: ${error.message}`);
            });
        }
        if (validationResult.warnings.length > 0) {
            console.log('Validation warnings:');
            validationResult.warnings.forEach(warning => {
                console.log(`  - ${warning.component}: ${warning.message}`);
            });
        }
        // Get system health status
        console.log('Checking system health...');
        const systemHealth = await validationManager.getSystemHealth(compatibilityLayer);
        console.log(`Overall health: ${systemHealth.overall}`);
        console.log('Component health:');
        Object.entries(systemHealth.components).forEach(([component, health]) => {
            console.log(`  ${component}: ${health.status} (${health.score}/100)`);
        });
        if (systemHealth.issues.length > 0) {
            console.log('Health issues:');
            systemHealth.issues.forEach(issue => {
                console.log(`  - ${issue.severity}: ${issue.message}`);
            });
        }
        return { validationResult, systemHealth };
    }
    catch (error) {
        console.error('Error during validation:', error.message);
        return null;
    }
}
/**
 * Example 4: Runtime Operation Simulation
 */
async function runtimeSimulation(compatibilityLayer) {
    console.log('\n=== Runtime Operation Simulation ===');
    try {
        console.log('Simulating runtime operation...');
        // Simulate several update cycles
        for (let i = 0; i < 5; i++) {
            console.log(`\nUpdate cycle ${i + 1}:`);
            // Update compatibility layer
            await compatibilityLayer.update(100); // 100ms delta time
            // Get current status
            const status = compatibilityLayer.getStatus();
            console.log(`  Mode: ${status.mode}`);
            console.log(`  State sync: ${status.stateSyncActive ? 'Active' : 'Inactive'}`);
            console.log(`  Last sync: ${status.lastStateSync ? new Date(status.lastStateSync).toISOString() : 'Never'}`);
            console.log(`  Errors: ${status.errors.length}`);
            // Simulate a simple action
            const mockAction = {
                type: 'move',
                target: { x: Math.random() * 10, y: 64, z: Math.random() * 10 },
                priority: 'normal'
            };
            const actionResult = await compatibilityLayer.executeAction(mockAction);
            console.log(`  Action executed: ${actionResult ? '✅ Success' : '❌ Failed'}`);
            // Small delay to simulate real-time operation
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        console.log('\n✅ Runtime simulation completed');
    }
    catch (error) {
        console.error('Error during runtime simulation:', error.message);
    }
}
/**
 * Main execution function
 */
async function main() {
    console.log('🚀 Mindcraft LangGraph Compatibility Layer Example');
    console.log('==================================================');
    try {
        // Step 1: Basic setup
        const setupResult = await basicSetup();
        if (!setupResult) {
            console.error('❌ Basic setup failed, exiting');
            return;
        }
        const { profile, compatibilityLayer } = setupResult;
        // Step 2: Profile migration
        const migrationResult = await profileMigration(profile, compatibilityLayer);
        // Step 3: System validation
        const validationResult = await systemValidation(compatibilityLayer);
        // Step 4: Runtime simulation (only if migration was successful)
        if (migrationResult && migrationResult.success) {
            await runtimeSimulation(compatibilityLayer);
        }
        else {
            console.log('⏭️ Skipping runtime simulation due to migration issues');
        }
        // Cleanup
        console.log('\n=== Cleanup ===');
        if (compatibilityLayer) {
            console.log('Compatibility layer cleanup completed');
        }
        console.log('\n✅ Example completed successfully!');
    }
    catch (error) {
        console.error('❌ Fatal error in example:', error);
        console.error(error.stack);
    }
}
// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
export { basicSetup, profileMigration, systemValidation, runtimeSimulation, main };

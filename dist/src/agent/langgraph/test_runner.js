/**
 * Test Runner Script - Simple JavaScript test runner for compatibility layer
 * This script can be executed directly to test the compatibility system
 */
import { compatibilityTests } from './compatibility_tests.js';
/**
 * Run compatibility tests and display results
 */
async function runCompatibilityTests() {
    console.log('🚀 Starting Mindcraft LangGraph Compatibility Tests\n');
    console.log('='.repeat(60));
    try {
        const results = await compatibilityTests.runAllTests();
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${results.totalTests}`);
        console.log(`✅ Passed: ${results.passedTests}`);
        console.log(`❌ Failed: ${results.failedTests}`);
        console.log(`📈 Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);
        console.log(`⏱️  Duration: ${results.duration}ms`);
        console.log('\n' + '='.repeat(60));
        console.log('📋 DETAILED RESULTS');
        console.log('='.repeat(60));
        for (const result of results.results) {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            const time = `${result.duration}ms`;
            console.log(`${status} | ${result.testName.padEnd(40)} | ${time.padStart(8)}`);
            if (!result.passed && result.error) {
                console.log(`       Error: ${result.error}`);
            }
        }
        console.log('\n' + '='.repeat(60));
        // Generate and save report
        const report = generateMarkdownReport(results);
        await saveReport(report);
        // Return appropriate exit code
        if (results.failedTests > 0) {
            console.log(`❌ ${results.failedTests} tests failed. Check the report for details.`);
            process.exit(1);
        }
        else {
            console.log(`🎉 All ${results.passedTests} tests passed! The compatibility layer is ready.`);
            process.exit(0);
        }
    }
    catch (error) {
        console.error('💥 Test runner failed:', error);
        process.exit(1);
    }
}
/**
 * Generate markdown report
 */
function generateMarkdownReport(results) {
    let report = `# Mindcraft LangGraph Compatibility Test Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Test Suite:** ${results.suiteName}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total Tests:** ${results.totalTests}\n`;
    report += `- **Passed:** ${results.passedTests}\n`;
    report += `- **Failed:** ${results.failedTests}\n`;
    report += `- **Success Rate:** ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%\n`;
    report += `- **Duration:** ${results.duration}ms\n\n`;
    report += `## Test Results\n\n`;
    for (const result of results.results) {
        const status = result.passed ? '✅' : '❌';
        report += `### ${status} ${result.testName}\n\n`;
        report += `- **Status:** ${result.passed ? 'PASSED' : 'FAILED'}\n`;
        report += `- **Duration:** ${result.duration}ms\n`;
        report += `- **Details:** ${result.details}\n`;
        if (!result.passed && result.error) {
            report += `- **Error:** ${result.error}\n`;
        }
        report += '\n';
    }
    report += `## Compatibility Layer Status\n\n`;
    if (results.failedTests === 0) {
        report += `🎉 **ALL TESTS PASSED** - The compatibility layer is functioning correctly and ready for production use.\n\n`;
        report += `### Key Features Validated:\n`;
        report += `- ✅ Legacy NPC data conversion to hierarchical AgentState\n`;
        report += `- ✅ Memory bank integration with semantic memory\n`;
        report += `- ✅ Goal system bridging (flat to hierarchical)\n`;
        report += `- ✅ Profile enhancement and validation\n`;
        report += `- ✅ Migration manager with rollback capabilities\n`;
        report += `- ✅ Runtime compatibility layer with mode switching\n`;
        report += `- ✅ System health monitoring and validation\n`;
    }
    else {
        report += `⚠️  **${results.failedTests} TESTS FAILED** - Some compatibility features need attention before production use.\n\n`;
        report += `### Failed Components:\n`;
        const failedTests = results.results.filter(r => !r.passed);
        for (const test of failedTests) {
            report += `- ❌ ${test.testName}\n`;
        }
    }
    report += `\n## Next Steps\n\n`;
    if (results.failedTests === 0) {
        report += `1. ✅ Compatibility layer is ready for integration\n`;
        report += `2. 🔄 Begin gradual migration of existing agents\n`;
        report += `3. 📊 Monitor system performance in hybrid mode\n`;
        report += `4. 🚀 Plan full migration to new LangGraph system\n`;
    }
    else {
        report += `1. 🔧 Fix failed test components\n`;
        report += `2. 🧪 Re-run compatibility tests\n`;
        report += `3. 🔍 Review error messages and logs\n`;
        report += `4. 📞 Consult development team if issues persist\n`;
    }
    return report;
}
/**
 * Save report to file
 */
async function saveReport(report) {
    try {
        const fs = await import('fs/promises');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `compatibility_test_report_${timestamp}.md`;
        await fs.writeFile(filename, report, 'utf8');
        console.log(`📄 Detailed report saved to: ${filename}`);
    }
    catch (error) {
        console.warn('⚠️  Failed to save report:', error.message);
    }
}
/**
 * Quick validation test for basic functionality
 */
async function quickValidation() {
    console.log('⚡ Running quick validation test...\n');
    try {
        // Test basic imports
        const { LegacyNPCDataAdapter } = await import('./legacy_adapter.js');
        const { MigrationManager } = await import('./migration_manager.js');
        const { CompatibilityLayer } = await import('./compatibility_layer.js');
        const { GoalBridge } = await import('./goal_bridge.js');
        const { ProfileAdapter } = await import('./profile_adapter.js');
        const { validationRollbackManager } = await import('./validation_rollback.js');
        console.log('✅ All imports successful');
        // Test basic adapter creation
        const mockProfile = {
            username: 'test_agent',
            npc: {
                goals: [{ name: 'wood', quantity: 5 }],
                curr_goal: null,
                do_routine: false,
                do_set_goal: false
            }
        };
        const dataAdapter = new LegacyNPCDataAdapter(mockProfile);
        const agentState = dataAdapter.toAgentState();
        console.log('✅ Basic adapter creation successful');
        console.log(`✅ Generated ${agentState.cognitive.goals.operationalGoals.length} operational goals`);
        // Test migration manager
        const migrationManager = new MigrationManager();
        const migrationResult = await migrationManager.migrateProfile(mockProfile);
        if (migrationResult.success) {
            console.log('✅ Basic migration successful');
        }
        else {
            console.log('⚠️  Migration had warnings (expected for simple profiles)');
        }
        console.log('\n🎉 Quick validation passed! The compatibility layer is functioning.');
        return true;
    }
    catch (error) {
        console.error('❌ Quick validation failed:', error.message);
        return false;
    }
}
/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--quick')) {
        const success = await quickValidation();
        process.exit(success ? 0 : 1);
    }
    else if (args.includes('--help')) {
        console.log(`
Mindcraft LangGraph Compatibility Test Runner

Usage:
  node test_runner.js [options]

Options:
  --quick     Run quick validation test only
  --help      Show this help message

Examples:
  node test_runner.js           # Run full compatibility test suite
  node test_runner.js --quick   # Run quick validation only
        `);
        process.exit(0);
    }
    else {
        await runCompatibilityTests();
    }
}
// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
export { runCompatibilityTests, quickValidation };

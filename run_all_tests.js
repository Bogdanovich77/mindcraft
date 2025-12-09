/**
 * Main test runner for Mindcraft LangGraph comprehensive test suite
 * Provides a single entry point for running all tests with detailed reporting
 */

import { runComprehensiveTests } from './test_coverage_reporter.js';

// Test configuration
const TEST_CONFIG = {
    testFiles: [
        'test_mode_transitions.js',
        'test_emergency_interrupts.js', 
        'test_concurrent_modes.js',
        'test_performance_requirements.js',
        'test_integration_scenarios.js',
        'test_reactive_integration.js',
        'test_pathstopped_handling.js'
    ],
    outputDir: './test_reports',
    parallel: false, // Run sequentially for better error tracking
    timeout: 60000, // 60 second timeout per test suite
    reportFormat: 'both' // Generate both JSON and HTML reports
};

// Main execution function
async function main() {
    console.log('🧪 Mindcraft LangGraph Comprehensive Test Suite');
    console.log('='.repeat(60));
    console.log(`Configuration:`);
    console.log(`  Test Files: ${TEST_CONFIG.testFiles.length}`);
    console.log(`  Output Directory: ${TEST_CONFIG.outputDir}`);
    console.log(`  Parallel Execution: ${TEST_CONFIG.parallel}`);
    console.log(`  Report Format: ${TEST_CONFIG.reportFormat}`);
    console.log('='.repeat(60));
    
    try {
        const result = await runComprehensiveTests(TEST_CONFIG);
        
        if (result.success) {
            console.log('\n🎉 All tests completed successfully!');
            console.log(`📊 Coverage report generated in: ${TEST_CONFIG.outputDir}`);
            console.log(`⏱️  Total execution time: ${(result.duration / 1000).toFixed(2)} seconds`);
            
            // Print key metrics
            const coverage = result.coverage.summary;
            console.log('\n📈 Key Metrics:');
            console.log(`  Overall Pass Rate: ${coverage.passRate.toFixed(1)}%`);
            console.log(`  Coverage Score: ${coverage.coverageScore.toFixed(1)}%`);
            console.log(`  Total Tests: ${coverage.total}`);
            console.log(`  Failed Tests: ${coverage.failed}`);
            
            // Exit with success code
            process.exit(0);
            
        } else {
            console.error('\n💥 Test suite failed!');
            console.error(`Error: ${result.error}`);
            console.error(`Execution time: ${(result.duration / 1000).toFixed(2)} seconds`);
            
            // Exit with error code
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n💥 Fatal error running test suite!');
        console.error(error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Handle command line arguments
function parseArguments() {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--parallel':
                TEST_CONFIG.parallel = true;
                break;
            case '--sequential':
                TEST_CONFIG.parallel = false;
                break;
            case '--output':
                TEST_CONFIG.outputDir = args[++i];
                break;
            case '--format':
                TEST_CONFIG.reportFormat = args[++i];
                break;
            case '--timeout':
                TEST_CONFIG.timeout = parseInt(args[++i]);
                break;
            case '--help':
                console.log(`
Mindcraft LangGraph Test Runner

Usage: node run_all_tests.js [options]

Options:
  --parallel         Run tests in parallel (default: sequential)
  --sequential       Run tests sequentially (default)
  --output <dir>     Output directory for reports (default: ./test_reports)
  --format <format>  Report format: json, html, or both (default: both)
  --timeout <ms>     Timeout per test suite in milliseconds (default: 60000)
  --help             Show this help message

Examples:
  node run_all_tests.js
  node run_all_tests.js --parallel --format html
  node run_all_tests.js --output ./reports --timeout 120000
                `);
                process.exit(0);
                break;
            default:
                console.warn(`Unknown argument: ${arg}`);
                break;
        }
    }
}

// Run the main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    parseArguments();
    main().catch(console.error);
}

export { main, TEST_CONFIG };
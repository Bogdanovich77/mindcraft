/**
 * Comprehensive Test Suite Runner
 * 
 * This script orchestrates all profile management workflow tests including:
 * - Integration tests
 * - Performance validation tests
 * - Manual testing validation
 * - Report generation
 * 
 * Usage: node run_comprehensive_test_suite.js [options]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test configuration
const TEST_CONFIG = {
    timeout: 300000, // 5 minutes total
    parallel: false, // Run tests sequentially for better reliability
    verbose: true,
    generateReports: true,
    cleanupAfter: true
};

// Test suite imports (we'll use dynamic imports for flexibility)
const TEST_SUITES = [
    {
        name: 'Integration Tests',
        file: './test_profile_management_workflow.js',
        class: 'ProfileManagementTestSuite',
        required: true
    },
    {
        name: 'Performance Tests',
        file: './test_performance_validation.js',
        class: 'PerformanceTestSuite',
        required: false
    }
];

/**
 * Test Runner Class
 * Orchestrates execution of all test suites
 */
class ComprehensiveTestRunner {
    constructor(config = {}) {
        this.config = { ...TEST_CONFIG, ...config };
        this.results = {
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            suites: {},
            summary: {
                totalSuites: TEST_SUITES.length,
                executedSuites: 0,
                passedSuites: 0,
                failedSuites: 0,
                skippedSuites: 0
            },
            environment: this.captureEnvironment(),
            issues: []
        };
        this.reportData = {};
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Profile Management Test Suite');
        console.log('='.repeat(80));
        console.log(`📅 Started: ${this.results.startTime}`);
        console.log(`⏱️  Timeout: ${this.config.timeout / 1000}s`);
        console.log(`🔧 Parallel: ${this.config.parallel ? 'Yes' : 'No'}`);
        console.log('='.repeat(80));

        const startTime = performance.now();

        try {
            // Pre-test validation
            await this.validateTestEnvironment();

            // Run each test suite
            for (const suiteConfig of TEST_SUITES) {
                await this.runTestSuite(suiteConfig);
            }

            // Generate final report
            await this.generateFinalReport();

        } catch (error) {
            console.error('❌ Critical error in test runner:', error);
            this.results.issues.push({
                severity: 'critical',
                message: error.message,
                stack: error.stack
            });
        } finally {
            // Finalize results
            const endTime = performance.now();
            this.results.endTime = new Date().toISOString();
            this.results.duration = endTime - startTime;

            // Cleanup if requested
            if (this.config.cleanupAfter) {
                await this.cleanup();
            }

            // Display final summary
            this.displayFinalSummary();
        }

        return this.results;
    }

    async validateTestEnvironment() {
        console.log('\n🔍 Validating Test Environment...');

        try {
            // Check if server is running
            const serverCheck = await this.checkServerHealth();
            if (!serverCheck.healthy) {
                throw new Error(`Server health check failed: ${serverCheck.error}`);
            }
            console.log('✅ Server health check passed');

            // Check required files exist
            const requiredFiles = [
                './test_profile_management_workflow.js',
                './test_performance_validation.js',
                './test_integration_report.json'
            ];

            for (const file of requiredFiles) {
                try {
                    await fs.access(file);
                    console.log(`✅ Required file found: ${file}`);
                } catch (error) {
                    throw new Error(`Required file missing: ${file}`);
                }
            }

            // Check directories exist
            const requiredDirs = [
                './profiles',
                './tests'
            ];

            for (const dir of requiredDirs) {
                try {
                    await fs.access(dir);
                    console.log(`✅ Required directory found: ${dir}`);
                } catch (error) {
                    console.warn(`⚠️  Optional directory missing: ${dir}`);
                }
            }

            console.log('✅ Test environment validation completed');

        } catch (error) {
            console.error('❌ Test environment validation failed:', error.message);
            throw error;
        }
    }

    async checkServerHealth() {
        try {
            const response = await fetch('http://localhost:8080/api/profiles', {
                method: 'GET',
                timeout: 5000
            });

            if (response.ok) {
                return { healthy: true };
            } else {
                return { 
                    healthy: false, 
                    error: `Server returned status ${response.status}` 
                };
            }
        } catch (error) {
            return { 
                healthy: false, 
                error: error.message 
            };
        }
    }

    async runTestSuite(suiteConfig) {
        console.log(`\n🧪 Running ${suiteConfig.name}...`);
        
        const suiteStartTime = performance.now();
        let suiteResult = {
            name: suiteConfig.name,
            status: 'running',
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            tests: {},
            errors: [],
            summary: {}
        };

        try {
            // Dynamic import of test suite
            const testModule = await import(suiteConfig.file);
            const TestSuiteClass = testModule[suiteConfig.class];

            if (!TestSuiteClass) {
                throw new Error(`Test class ${suiteConfig.class} not found in ${suiteConfig.file}`);
            }

            // Instantiate and run test suite
            const testSuite = new TestSuiteClass();
            
            if (typeof testSuite.runAllTests === 'function') {
                const result = await testSuite.runAllTests();
                suiteResult.tests = result;
                suiteResult.status = 'passed';
            } else {
                throw new Error(`runAllTests method not found in ${suiteConfig.class}`);
            }

        } catch (error) {
            console.error(`❌ ${suiteConfig.name} failed:`, error.message);
            suiteResult.status = 'failed';
            suiteResult.errors.push({
                message: error.message,
                stack: error.stack
            });

            if (suiteConfig.required) {
                this.results.issues.push({
                    severity: 'high',
                    suite: suiteConfig.name,
                    message: `Required test suite failed: ${error.message}`
                });
            }
        } finally {
            const suiteEndTime = performance.now();
            suiteResult.endTime = new Date().toISOString();
            suiteResult.duration = suiteEndTime - suiteStartTime;

            // Update summary
            this.results.summary.executedSuites++;
            if (suiteResult.status === 'passed') {
                this.results.summary.passedSuites++;
            } else if (suiteResult.status === 'failed') {
                this.results.summary.failedSuites++;
            } else {
                this.results.summary.skippedSuites++;
            }

            this.results.suites[suiteConfig.name] = suiteResult;

            console.log(`${suiteResult.status === 'passed' ? '✅' : '❌'} ${suiteConfig.name} completed in ${(suiteResult.duration / 1000).toFixed(2)}s`);
        }
    }

    async generateFinalReport() {
        if (!this.config.generateReports) {
            console.log('\n📊 Report generation skipped by configuration');
            return;
        }

        console.log('\n📊 Generating Comprehensive Test Report...');

        try {
            // Load the base report template
            const reportTemplate = JSON.parse(
                await fs.readFile('./test_integration_report.json', 'utf8')
            );

            // Update report with actual test results
            const updatedReport = this.updateReportTemplate(reportTemplate);

            // Save the updated report
            const reportFileName = `test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            await fs.writeFile(reportFileName, JSON.stringify(updatedReport, null, 2));

            // Generate human-readable summary
            await this.generateSummaryReport(updatedReport, reportFileName);

            console.log(`✅ Comprehensive test report saved as: ${reportFileName}`);

        } catch (error) {
            console.error('❌ Failed to generate test report:', error.message);
            this.results.issues.push({
                severity: 'medium',
                message: `Report generation failed: ${error.message}`
            });
        }
    }

    updateReportTemplate(template) {
        const now = new Date().toISOString();
        
        // Update metadata
        template.metadata.generatedAt = now;
        template.metadata.testSuite = "Profile Management Workflow - Comprehensive";
        
        // Update summary with actual results
        template.summary.totalTests = this.calculateTotalTests();
        template.summary.passed = this.calculateTotalPassed();
        template.summary.failed = this.calculateTotalFailed();
        template.summary.successRate = template.summary.totalTests > 0 ? 
            (template.summary.passed / template.summary.totalTests * 100) : 0;
        template.summary.executionTime = this.results.duration;
        template.summary.overallGrade = this.calculateOverallGrade();

        // Update test results with actual data
        Object.keys(this.results.suites).forEach(suiteName => {
            const suiteResult = this.results.suites[suiteName];
            this.updateSuiteResults(template, suiteName, suiteResult);
        });

        // Update performance metrics
        template.performanceMetrics = this.aggregatePerformanceMetrics();

        // Update issues
        template.issues.critical = this.results.issues.filter(i => i.severity === 'critical');
        template.issues.high = this.results.issues.filter(i => i.severity === 'high');
        template.issues.medium = this.results.issues.filter(i => i.severity === 'medium');
        template.issues.low = this.results.issues.filter(i => i.severity === 'low');

        // Generate recommendations
        template.recommendations = this.generateRecommendations();

        return template;
    }

    updateSuiteResults(template, suiteName, suiteResult) {
        // Find the corresponding test category in the template
        const categories = Object.keys(template.testResults);
        
        for (const category of categories) {
            const categoryData = template.testResults[category];
            
            // Map suite names to categories
            if (suiteName.includes('Integration') && category.includes('integration')) {
                this.updateCategoryTests(categoryData, suiteResult);
            } else if (suiteName.includes('Performance') && category.includes('performance')) {
                this.updateCategoryTests(categoryData, suiteResult);
            } else if (suiteName.includes('Functional') && category.includes('functional')) {
                this.updateCategoryTests(categoryData, suiteResult);
            }
        }
    }

    updateCategoryTests(categoryData, suiteResult) {
        if (suiteResult.tests && Array.isArray(suiteResult.tests)) {
            suiteResult.tests.forEach((test, index) => {
                if (categoryData.tests[index]) {
                    categoryData.tests[index].status = test.status || 'NOT_RUN';
                    categoryData.tests[index].duration = test.duration || 0;
                    categoryData.tests[index].metrics = test.metrics || {};
                    
                    // Update assertions
                    if (test.assertions) {
                        test.assertions.forEach((assertion, assertIndex) => {
                            if (categoryData.tests[index].assertions[assertIndex]) {
                                categoryData.tests[index].assertions[assertIndex].status = assertion.status || 'NOT_RUN';
                                categoryData.tests[index].assertions[assertIndex].actual = assertion.actual || null;
                            }
                        });
                    }
                }
            });
        }
    }

    calculateTotalTests() {
        let total = 0;
        Object.values(this.results.suites).forEach(suite => {
            if (suite.tests && Array.isArray(suite.tests)) {
                total += suite.tests.length;
            }
        });
        return total;
    }

    calculateTotalPassed() {
        let passed = 0;
        Object.values(this.results.suites).forEach(suite => {
            if (suite.tests && Array.isArray(suite.tests)) {
                passed += suite.tests.filter(test => test.status === 'passed').length;
            }
        });
        return passed;
    }

    calculateTotalFailed() {
        let failed = 0;
        Object.values(this.results.suites).forEach(suite => {
            if (suite.tests && Array.isArray(suite.tests)) {
                failed += suite.tests.filter(test => test.status === 'failed').length;
            }
        });
        return failed;
    }

    calculateOverallGrade() {
        const successRate = this.calculateTotalTests() > 0 ? 
            (this.calculateTotalPassed() / this.calculateTotalTests()) : 0;
        
        if (successRate >= 0.95) return 'EXCELLENT';
        if (successRate >= 0.85) return 'GOOD';
        if (successRate >= 0.70) return 'ACCEPTABLE';
        if (successRate >= 0.50) return 'POOR';
        return 'CRITICAL';
    }

    aggregatePerformanceMetrics() {
        // Aggregate performance data from all suites
        const metrics = {
            system: this.results.environment,
            application: {
                responseTime: { average: 0, p50: 0, p95: 0, p99: 0, max: 0 },
                throughput: { requestsPerSecond: 0, eventsPerSecond: 0, operationsPerSecond: 0 },
                errors: { errorRate: 0, totalErrors: 0, errorTypes: [] },
                resources: { memoryUsage: 0, connectionCount: 0, activeAgents: 0 }
            }
        };

        // Collect metrics from each suite
        Object.values(this.results.suites).forEach(suite => {
            if (suite.tests && suite.tests.performance) {
                // Aggregate performance data here
                Object.assign(metrics.application, suite.tests.performance);
            }
        });

        return metrics;
    }

    generateRecommendations() {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            performance: [],
            security: [],
            usability: []
        };

        // Generate recommendations based on test results
        if (this.results.summary.failedSuites > 0) {
            recommendations.immediate.push('Address failing test suites before deployment');
        }

        if (this.results.issues.some(i => i.severity === 'critical')) {
            recommendations.immediate.push('Resolve critical issues immediately');
        }

        const performanceIssues = this.results.issues.filter(i => i.message.includes('performance'));
        if (performanceIssues.length > 0) {
            recommendations.performance.push('Optimize performance bottlenecks identified in tests');
        }

        return recommendations;
    }

    async generateSummaryReport(detailedReport, reportFileName) {
        const summaryFileName = reportFileName.replace('.json', '_summary.md');
        
        const summary = `# Profile Management Workflow - Test Summary

## Executive Summary
- **Test Date**: ${detailedReport.metadata.generatedAt}
- **Overall Grade**: ${detailedReport.summary.overallGrade}
- **Success Rate**: ${detailedReport.summary.successRate.toFixed(2)}%
- **Execution Time**: ${(detailedReport.summary.executionTime / 1000).toFixed(2)}s

## Test Results Overview
| Category | Total | Passed | Failed | Status |
|----------|-------|--------|--------|--------|
| Functional Tests | ${detailedReport.testResults.functionalTests.tests.length} | ${detailedReport.testResults.functionalTests.tests.filter(t => t.status === 'passed').length} | ${detailedReport.testResults.functionalTests.tests.filter(t => t.status === 'failed').length} | ${detailedReport.testResults.functionalTests.tests.every(t => t.status === 'passed') ? '✅' : '❌'} |
| Integration Tests | ${detailedReport.testResults.integrationTests.tests.length} | ${detailedReport.testResults.integrationTests.tests.filter(t => t.status === 'passed').length} | ${detailedReport.testResults.integrationTests.tests.filter(t => t.status === 'failed').length} | ${detailedReport.testResults.integrationTests.tests.every(t => t.status === 'passed') ? '✅' : '❌'} |
| Performance Tests | ${detailedReport.testResults.performanceTests.tests.length} | ${detailedReport.testResults.performanceTests.tests.filter(t => t.status === 'passed').length} | ${detailedReport.testResults.performanceTests.tests.filter(t => t.status === 'failed').length} | ${detailedReport.testResults.performanceTests.tests.every(t => t.status === 'passed') ? '✅' : '❌'} |

## Critical Issues
${detailedReport.issues.critical.length > 0 ? detailedReport.issues.critical.map(issue => `- **${issue.suite}**: ${issue.message}`).join('\n') : 'No critical issues identified.'}

## Recommendations
### Immediate Actions
${detailedReport.recommendations.immediate.length > 0 ? detailedReport.recommendations.immediate.map(rec => `- ${rec}`).join('\n') : 'No immediate actions required.'}

### Performance Improvements
${detailedReport.recommendations.performance.length > 0 ? detailedReport.recommendations.performance.map(rec => `- ${rec}`).join('\n') : 'No performance improvements needed.'}

## Next Steps
1. Review detailed test report: \`${reportFileName}\`
2. Address any failed tests or issues
3. Run manual validation using: \`test_manual_validation_guide.md\`
4. Prepare for production deployment

---
*Report generated by Comprehensive Test Suite Runner*
`;

        await fs.writeFile(summaryFileName, summary);
        console.log(`✅ Test summary saved as: ${summaryFileName}`);
    }

    captureEnvironment() {
        return {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            pid: process.pid
        };
    }

    async cleanup() {
        console.log('\n🧹 Cleaning up test environment...');
        
        try {
            // Clean up any test data created during tests
            // This would include temporary profiles, test agents, etc.
            console.log('✅ Cleanup completed');
        } catch (error) {
            console.warn('⚠️  Cleanup warning:', error.message);
        }
    }

    displayFinalSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE TEST SUITE SUMMARY');
        console.log('='.repeat(80));
        
        console.log(`\n📈 Test Suite Results:`);
        console.log(`   Total Suites: ${this.results.summary.totalSuites}`);
        console.log(`   Executed: ${this.results.summary.executedSuites}`);
        console.log(`   ✅ Passed: ${this.results.summary.passedSuites}`);
        console.log(`   ❌ Failed: ${this.results.summary.failedSuites}`);
        console.log(`   ⏭️  Skipped: ${this.results.summary.skippedSuites}`);
        
        console.log(`\n⏱️  Timing:`);
        console.log(`   Started: ${this.results.startTime}`);
        console.log(`   Completed: ${this.results.endTime}`);
        console.log(`   Duration: ${(this.results.duration / 1000).toFixed(2)}s`);
        
        if (this.results.issues.length > 0) {
            console.log(`\n🚨 Issues Found: ${this.results.issues.length}`);
            this.results.issues.forEach((issue, index) => {
                const icon = issue.severity === 'critical' ? '🔴' : 
                            issue.severity === 'high' ? '🟠' : 
                            issue.severity === 'medium' ? '🟡' : '🟢';
                console.log(`   ${index + 1}. ${icon} ${issue.message}`);
            });
        } else {
            console.log(`\n✅ No issues found!`);
        }
        
        console.log('\n' + '='.repeat(80));
    }
}

// Command line interface
function parseArguments() {
    const args = process.argv.slice(2);
    const config = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--timeout':
                config.timeout = parseInt(args[++i]) * 1000;
                break;
            case '--parallel':
                config.parallel = true;
                break;
            case '--no-reports':
                config.generateReports = false;
                break;
            case '--no-cleanup':
                config.cleanupAfter = false;
                break;
            case '--verbose':
                config.verbose = true;
                break;
            case '--help':
                console.log(`
Comprehensive Test Suite Runner

Usage: node run_comprehensive_test_suite.js [options]

Options:
  --timeout <seconds>     Set test timeout (default: 300)
  --parallel              Run tests in parallel (default: false)
  --no-reports            Skip report generation
  --no-cleanup            Skip cleanup after tests
  --verbose               Enable verbose output
  --help                  Show this help message

Examples:
  node run_comprehensive_test_suite.js
  node run_comprehensive_test_suite.js --timeout 600 --parallel
  node run_comprehensive_test_suite.js --no-reports --verbose
                `);
                process.exit(0);
                break;
        }
    }
    
    return config;
}

// Main execution
async function main() {
    const config = parseArguments();
    const runner = new ComprehensiveTestRunner(config);
    
    try {
        const results = await runner.runAllTests();
        
        // Exit with appropriate code
        if (results.summary.failedSuites > 0 || results.issues.some(i => i.severity === 'critical')) {
            process.exit(1);
        } else {
            process.exit(0);
        }
        
    } catch (error) {
        console.error('💥 Test runner failed catastrophically:', error);
        process.exit(2);
    }
}

// Export for use in other files
export { ComprehensiveTestRunner };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
/**
 * Comprehensive test coverage reporting system for Mindcraft LangGraph testing
 * Aggregates results from all test suites and provides detailed coverage analysis
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// COVERAGE REPORTER
// ============================================================================

export class TestCoverageReporter {
    constructor(config = {}) {
        this.config = {
            outputDir: config.outputDir || './test_reports',
            reportFormat: config.reportFormat || 'both', // 'json', 'html', 'both'
            includeMetrics: config.includeMetrics !== false,
            includePerformance: config.includePerformance !== false,
            timestamp: config.timestamp || Date.now(),
            ...config
        };
        
        this.testSuites = new Map();
        this.coverageData = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            categories: {},
            performance: {},
            coverage: {},
            errors: [],
            warnings: []
        };
        
        this.startTime = Date.now();
    }
    
    addTestSuite(suiteName, suiteResults) {
        this.testSuites.set(suiteName, {
            name: suiteName,
            results: suiteResults,
            timestamp: Date.now()
        });
        
        this.aggregateSuiteResults(suiteName, suiteResults);
    }
    
    aggregateSuiteResults(suiteName, results) {
        // Update overall counts
        this.coverageData.totalTests += results.totalTests || 0;
        this.coverageData.passedTests += results.passedTests || 0;
        this.coverageData.failedTests += results.failedTests || 0;
        this.coverageData.skippedTests += results.skippedTests || 0;
        
        // Aggregate by category
        const category = this.categorizeSuite(suiteName);
        if (!this.coverageData.categories[category]) {
            this.coverageData.categories[category] = {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                suites: []
            };
        }
        
        const categoryData = this.coverageData.categories[category];
        categoryData.totalTests += results.totalTests || 0;
        categoryData.passedTests += results.passedTests || 0;
        categoryData.failedTests += results.failedTests || 0;
        categoryData.suites.push(suiteName);
        
        // Aggregate performance data
        if (results.performance) {
            this.coverageData.performance[suiteName] = results.performance;
        }
        
        // Aggregate coverage data
        if (results.coverage) {
            this.coverageData.coverage[suiteName] = results.coverage;
        }
        
        // Collect errors and warnings
        if (results.errors) {
            this.coverageData.errors.push(...results.errors.map(e => ({ suite: suiteName, ...e })));
        }
        
        if (results.warnings) {
            this.coverageData.warnings.push(...results.warnings.map(w => ({ suite: suiteName, ...w })));
        }
    }
    
    categorizeSuite(suiteName) {
        const categories = {
            'mode_transitions': 'reactive',
            'emergency_interrupts': 'reactive',
            'concurrent_modes': 'reactive',
            'performance_requirements': 'performance',
            'integration_scenarios': 'integration',
            'reactive_integration': 'integration',
            'pathstopped_handling': 'error_handling'
        };
        
        for (const [key, category] of Object.entries(categories)) {
            if (suiteName.includes(key)) {
                return category;
            }
        }
        
        return 'general';
    }
    
    calculateCoverageMetrics() {
        const total = this.coverageData.totalTests;
        const passed = this.coverageData.passedTests;
        const failed = this.coverageData.failedTests;
        
        return {
            overall: {
                total,
                passed,
                failed,
                skipped: this.coverageData.skippedTests,
                passRate: total > 0 ? (passed / total) * 100 : 0,
                failRate: total > 0 ? (failed / total) * 100 : 0,
                coverageScore: this.calculateCoverageScore()
            },
            byCategory: this.calculateCategoryMetrics(),
            bySuite: this.calculateSuiteMetrics()
        };
    }
    
    calculateCoverageScore() {
        // Weight different categories differently
        const weights = {
            reactive: 0.3,
            performance: 0.25,
            integration: 0.3,
            error_handling: 0.15
        };
        
        let totalScore = 0;
        let totalWeight = 0;
        
        for (const [category, data] of Object.entries(this.coverageData.categories)) {
            const weight = weights[category] || 0.1;
            const passRate = data.totalTests > 0 ? (data.passedTests / data.totalTests) * 100 : 0;
            
            totalScore += passRate * weight;
            totalWeight += weight;
        }
        
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }
    
    calculateCategoryMetrics() {
        const metrics = {};
        
        for (const [category, data] of Object.entries(this.coverageData.categories)) {
            const total = data.totalTests;
            const passed = data.passedTests;
            const failed = data.failedTests;
            
            metrics[category] = {
                total,
                passed,
                failed,
                passRate: total > 0 ? (passed / total) * 100 : 0,
                failRate: total > 0 ? (failed / total) * 100 : 0,
                suiteCount: data.suites.length,
                suites: data.suites
            };
        }
        
        return metrics;
    }
    
    calculateSuiteMetrics() {
        const metrics = {};
        
        for (const [suiteName, suiteData] of this.testSuites) {
            const results = suiteData.results;
            const total = results.totalTests || 0;
            const passed = results.passedTests || 0;
            const failed = results.failedTests || 0;
            
            metrics[suiteName] = {
                total,
                passed,
                failed,
                passRate: total > 0 ? (passed / total) * 100 : 0,
                duration: results.duration || 0,
                performance: results.performance || {}
            };
        }
        
        return metrics;
    }
    
    generateReport() {
        const metrics = this.calculateCoverageMetrics();
        const reportData = {
            metadata: {
                generatedAt: new Date().toISOString(),
                testDuration: Date.now() - this.startTime,
                config: this.config,
                version: '1.0.0'
            },
            summary: metrics.overall,
            categories: metrics.byCategory,
            suites: metrics.bySuite,
            performance: this.coverageData.performance,
            coverage: this.coverageData.coverage,
            errors: this.coverageData.errors,
            warnings: this.coverageData.warnings,
            recommendations: this.generateRecommendations(metrics)
        };
        
        return reportData;
    }
    
    generateRecommendations(metrics) {
        const recommendations = [];
        
        // Overall recommendations
        if (metrics.overall.passRate < 95) {
            recommendations.push({
                type: 'critical',
                category: 'overall',
                message: `Overall pass rate is ${(metrics.overall.passRate).toFixed(1)}%, consider reviewing failing tests`
            });
        }
        
        // Category-specific recommendations
        for (const [category, data] of Object.entries(metrics.byCategory)) {
            if (data.passRate < 90) {
                recommendations.push({
                    type: 'warning',
                    category,
                    message: `${category} tests have low pass rate (${data.passRate.toFixed(1)}%)`
                });
            }
            
            if (data.total < 10) {
                recommendations.push({
                    type: 'info',
                    category,
                    message: `Consider adding more tests to ${category} category (${data.total} tests currently)`
                });
            }
        }
        
        // Performance recommendations
        for (const [suite, perf] of Object.entries(this.coverageData.performance)) {
            if (perf.averageResponseTime && perf.averageResponseTime > 200) {
                recommendations.push({
                    type: 'performance',
                    category: 'performance',
                    suite,
                    message: `${suite} has slow average response time (${perf.averageResponseTime.toFixed(1)}ms)`
                });
            }
        }
        
        // Error recommendations
        if (this.coverageData.errors.length > 0) {
            recommendations.push({
                type: 'error',
                category: 'reliability',
                message: `${this.coverageData.errors.length} test errors need to be addressed`
            });
        }
        
        return recommendations;
    }
    
    async saveReports() {
        const reportData = this.generateReport();
        
        // Ensure output directory exists
        if (!fs.existsSync(this.config.outputDir)) {
            fs.mkdirSync(this.config.outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Save JSON report
        if (this.config.reportFormat === 'json' || this.config.reportFormat === 'both') {
            const jsonPath = path.join(this.config.outputDir, `coverage_report_${timestamp}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));
            console.log(`📊 JSON coverage report saved to: ${jsonPath}`);
        }
        
        // Save HTML report
        if (this.config.reportFormat === 'html' || this.config.reportFormat === 'both') {
            const htmlPath = path.join(this.config.outputDir, `coverage_report_${timestamp}.html`);
            const htmlContent = this.generateHtmlReport(reportData);
            fs.writeFileSync(htmlPath, htmlContent);
            console.log(`📊 HTML coverage report saved to: ${htmlPath}`);
        }
        
        return reportData;
    }
    
    generateHtmlReport(reportData) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mindcraft LangGraph Test Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .pass-rate-high { border-left-color: #28a745; }
        .pass-rate-high .metric-value { color: #28a745; }
        .pass-rate-medium { border-left-color: #ffc107; }
        .pass-rate-medium .metric-value { color: #ffc107; }
        .pass-rate-low { border-left-color: #dc3545; }
        .pass-rate-low .metric-value { color: #dc3545; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .category-card { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #dc3545 0%, #ffc107 50%, #28a745 100%); transition: width 0.3s ease; }
        .suite-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .suite-table th, .suite-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .suite-table th { background: #f8f9fa; font-weight: bold; }
        .recommendations { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; }
        .recommendation { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
        .critical { border-left: 4px solid #dc3545; }
        .warning { border-left: 4px solid #ffc107; }
        .info { border-left: 4px solid #17a2b8; }
        .performance { border-left: 4px solid #6f42c1; }
        .error { border-left: 4px solid #dc3545; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Mindcraft LangGraph Test Coverage Report</h1>
            <p>Generated on ${new Date(reportData.metadata.generatedAt).toLocaleString()}</p>
            <p>Test Duration: ${(reportData.metadata.testDuration / 1000).toFixed(2)} seconds</p>
        </div>

        <div class="section">
            <h2>📊 Overall Summary</h2>
            <div class="summary">
                <div class="metric-card ${this.getPassRateClass(reportData.summary.passRate)}">
                    <div class="metric-value">${reportData.summary.passRate.toFixed(1)}%</div>
                    <div class="metric-label">Pass Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${reportData.summary.total}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="metric-card pass-rate-high">
                    <div class="metric-value">${reportData.summary.passed}</div>
                    <div class="metric-label">Passed</div>
                </div>
                <div class="metric-card ${reportData.summary.failed > 0 ? 'pass-rate-low' : 'pass-rate-high'}">
                    <div class="metric-value">${reportData.summary.failed}</div>
                    <div class="metric-label">Failed</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${reportData.summary.coverageScore.toFixed(1)}%</div>
                    <div class="metric-label">Coverage Score</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📈 Coverage by Category</h2>
            <div class="category-grid">
                ${Object.entries(reportData.categories).map(([category, data]) => `
                    <div class="category-card">
                        <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.passRate}%"></div>
                        </div>
                        <p><strong>${data.passRate.toFixed(1)}%</strong> pass rate</p>
                        <p>${data.passed}/${data.total} tests passed</p>
                        <p>${data.suiteCount} test suites</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2>📋 Test Suite Details</h2>
            <table class="suite-table">
                <thead>
                    <tr>
                        <th>Test Suite</th>
                        <th>Total Tests</th>
                        <th>Passed</th>
                        <th>Failed</th>
                        <th>Pass Rate</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(reportData.suites).map(([suite, data]) => `
                        <tr>
                            <td>${suite}</td>
                            <td>${data.total}</td>
                            <td>${data.passed}</td>
                            <td>${data.failed}</td>
                            <td><span class="metric-value ${this.getPassRateClass(data.passRate)}">${data.passRate.toFixed(1)}%</span></td>
                            <td>${(data.duration / 1000).toFixed(2)}s</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${reportData.recommendations.length > 0 ? `
        <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="recommendations">
                ${reportData.recommendations.map(rec => `
                    <div class="recommendation ${rec.type}">
                        <strong>${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}:</strong> ${rec.message}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <p>Report generated by Mindcraft LangGraph Test Coverage Reporter v${reportData.metadata.version}</p>
        </div>
    </div>
</body>
</html>`;
    }
    
    getPassRateClass(passRate) {
        if (passRate >= 95) return 'pass-rate-high';
        if (passRate >= 80) return 'pass-rate-medium';
        return 'pass-rate-low';
    }
    
    printSummary() {
        const metrics = this.calculateCoverageMetrics();
        
        console.log('\n🧪 Test Coverage Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${metrics.overall.total}`);
        console.log(`Passed: ${metrics.overall.passed} (${metrics.overall.passRate.toFixed(1)}%)`);
        console.log(`Failed: ${metrics.overall.failed} (${metrics.overall.failRate.toFixed(1)}%)`);
        console.log(`Coverage Score: ${metrics.overall.coverageScore.toFixed(1)}%`);
        
        console.log('\n📊 Coverage by Category:');
        for (const [category, data] of Object.entries(metrics.byCategory)) {
            console.log(`  ${category}: ${data.passRate.toFixed(1)}% (${data.passed}/${data.total})`);
        }
        
        if (this.coverageData.errors.length > 0) {
            console.log(`\n❌ Errors: ${this.coverageData.errors.length}`);
        }
        
        if (this.coverageData.warnings.length > 0) {
            console.log(`\n⚠️  Warnings: ${this.coverageData.warnings.length}`);
        }
        
        console.log('\n' + '='.repeat(50));
    }
}

// ============================================================================
// TEST RUNNER INTEGRATION
// ============================================================================

export class ComprehensiveTestRunner {
    constructor(config = {}) {
        this.config = {
            testFiles: config.testFiles || [
                'test_mode_transitions.js',
                'test_emergency_interrupts.js',
                'test_concurrent_modes.js',
                'test_performance_requirements.js',
                'test_integration_scenarios.js',
                'test_reactive_integration.js',
                'test_pathstopped_handling.js'
            ],
            outputDir: config.outputDir || './test_reports',
            parallel: config.parallel || false,
            timeout: config.timeout || 30000,
            ...config
        };
        
        this.coverageReporter = new TestCoverageReporter({
            outputDir: this.config.outputDir
        });
        
        this.results = new Map();
    }
    
    async runAllTests() {
        console.log('🚀 Starting Comprehensive Test Suite...\n');
        
        const startTime = Date.now();
        
        try {
            if (this.config.parallel) {
                await this.runTestsParallel();
            } else {
                await this.runTestsSequential();
            }
            
            const totalTime = Date.now() - startTime;
            
            console.log(`\n✅ All tests completed in ${(totalTime / 1000).toFixed(2)} seconds`);
            
            // Generate and save coverage report
            const reportData = await this.coverageReporter.saveReports();
            
            // Print summary
            this.coverageReporter.printSummary();
            
            return {
                success: true,
                duration: totalTime,
                coverage: reportData
            };
            
        } catch (error) {
            console.error('\n❌ Test suite failed:', error.message);
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime
            };
        }
    }
    
    async runTestsSequential() {
        for (const testFile of this.config.testFiles) {
            console.log(`📁 Running ${testFile}...`);
            await this.runSingleTest(testFile);
        }
    }
    
    async runTestsParallel() {
        const promises = this.config.testFiles.map(testFile => 
            this.runSingleTest(testFile)
        );
        
        await Promise.all(promises);
    }
    
    async runSingleTest(testFile) {
        const startTime = Date.now();
        
        try {
            // Dynamic import of test file
            const testModule = await import(`./${testFile}`);
            
            // Look for main test function
            const testFunction = testModule.runTests || 
                               testModule.runModeTransitionTests ||
                               testModule.runEmergencyInterruptTests ||
                               testModule.runConcurrentModeTests ||
                               testModule.runPerformanceTests ||
                               testModule.runIntegrationTests ||
                               testModule.runEnhancedTests ||
                               testModule.main;
            
            if (!testFunction) {
                throw new Error(`No test function found in ${testFile}`);
            }
            
            // Execute the test
            const result = await testFunction();
            
            const duration = Date.now() - startTime;
            
            // Normalize result format
            const normalizedResult = this.normalizeTestResult(result, duration);
            
            this.results.set(testFile, normalizedResult);
            this.coverageReporter.addTestSuite(testFile, normalizedResult);
            
            console.log(`✅ ${testFile} completed in ${(duration / 1000).toFixed(2)}s`);
            
        } catch (error) {
            const duration = Date.now() - startTime;
            
            console.error(`❌ ${testFile} failed: ${error.message}`);
            
            const errorResult = {
                testFile,
                totalTests: 0,
                passedTests: 0,
                failedTests: 1,
                skippedTests: 0,
                duration,
                errors: [{ error: error.message, stack: error.stack }]
            };
            
            this.results.set(testFile, errorResult);
            this.coverageReporter.addTestSuite(testFile, errorResult);
        }
    }
    
    normalizeTestResult(result, duration) {
        // Handle different result formats from different test files
        if (typeof result === 'object' && result !== null) {
            return {
                totalTests: result.totalTests || result.summary?.totalTests || 0,
                passedTests: result.passedTests || result.summary?.passedTests || 0,
                failedTests: result.failedTests || result.summary?.failedTests || 0,
                skippedTests: result.skippedTests || result.summary?.skippedTests || 0,
                duration,
                performance: result.performance || result.report,
                coverage: result.coverage,
                errors: result.errors || [],
                warnings: result.warnings || []
            };
        }
        
        // Default fallback
        return {
            totalTests: 1,
            passedTests: 1,
            failedTests: 0,
            skippedTests: 0,
            duration,
            performance: {},
            coverage: {},
            errors: [],
            warnings: []
        };
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createCoverageReport(config = {}) {
    return new TestCoverageReporter(config);
}

export function runComprehensiveTests(config = {}) {
    const runner = new ComprehensiveTestRunner(config);
    return runner.runAllTests();
}

export default {
    TestCoverageReporter,
    ComprehensiveTestRunner,
    createCoverageReport,
    runComprehensiveTests
};
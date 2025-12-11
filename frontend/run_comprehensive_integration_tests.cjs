/**
 * Comprehensive Integration Test Runner
 * 
 * This is the main entry point for running all integration tests
 * for the frontend cognitive dashboard system. It orchestrates
 * the execution of all test suites and generates comprehensive reports.
 * 
 * @author Mindcraft Frontend Team
 * @version 1.0.0
 * @date 2025-12-11
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveIntegrationTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.testSuites = [
      'comprehensive_integration_validation',
      'integration_execution',
      'performance_validation'
    ];
    this.results = {
      execution: {
        startTime: this.startTime,
        endTime: null,
        totalDuration: 0,
        environment: process.env.NODE_ENV || 'test',
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
      },
      testSuites: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        passRate: 0,
        criticalIssues: 0,
        warnings: 0,
        productionReadiness: 'unknown'
      },
      performance: {
        averageResponseTime: 0,
        peakMemoryUsage: 0,
        cpuUtilization: 0,
        frameRate: 0,
        bundleSize: 0
      },
      recommendations: [],
      productionReadiness: {
        overall: 'unknown',
        score: 0,
        blockers: [],
        concerns: [],
        nextSteps: []
      }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Frontend Integration Tests');
    console.log('=' .repeat(80));
    console.log(`📅 Started: ${new Date(this.startTime).toISOString()}`);
    console.log(`🌐 Platform: ${process.platform} (${process.arch})`);
    console.log(`🟢 Node.js: ${process.version}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'test'}`);
    console.log('=' .repeat(80));
    
    try {
      // Step 1: Environment Validation
      await this.validateEnvironment();
      
      // Step 2: Run All Test Suites
      await this.runTestSuites();
      
      // Step 3: Aggregate Results
      this.aggregateResults();
      
      // Step 4: Generate Comprehensive Reports
      await this.generateComprehensiveReports();
      
      // Step 5: Validate Production Readiness
      this.validateProductionReadiness();
      
      // Step 6: Display Final Summary
      this.displayFinalSummary();
      
      console.log('✅ Comprehensive integration testing completed successfully');
      
    } catch (error) {
      console.error('❌ Comprehensive integration testing failed:', error);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('\n📋 Step 1: Validating test environment...');
    
    const checks = [
      {
        name: 'Node.js Version',
        check: () => {
          const version = process.version;
          const major = parseInt(version.split('.')[0]);
          return major >= 18;
        },
        required: true
      },
      {
        name: 'Dependencies Available',
        check: async () => {
          const packageJsonPath = path.join(__dirname, 'package.json');
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
          
          const requiredDeps = [
            'react',
            '@mui/material',
            '@reduxjs/toolkit',
            'socket.io-client'
          ];
          
          return requiredDeps.every(dep => 
            packageJson.dependencies[dep] || packageJson.devDependencies[dep]
          );
        },
        required: true
      },
      {
        name: 'Test Files Present',
        check: async () => {
          const testFiles = [
            'test_comprehensive_integration_validation.cjs',
            'test_integration_execution.cjs',
            'test_performance_validation.cjs'
          ];
          
          for (const testFile of testFiles) {
            const filePath = path.join(__dirname, testFile);
            try {
              await fs.access(filePath);
            } catch (error) {
              console.warn(`⚠️ Test file missing: ${testFile}`);
              return false;
            }
          }
          return true;
        },
        required: true
      },
      {
        name: 'Build Output Available',
        check: async () => {
          const distPath = path.join(__dirname, 'dist');
          try {
            await fs.access(distPath);
            return true;
          } catch (error) {
            console.warn('⚠️ Build output not found, will create during tests');
            return false;
          }
        },
        required: false
      }
    ];
    
    let allPassed = true;
    const results = {};
    
    for (const check of checks) {
      console.log(`  🔍 ${check.name}...`);
      const passed = await check.check();
      results[check.name] = { passed, required: check.required };
      
      if (passed) {
        console.log(`    ✅ ${check.name}: PASSED`);
      } else {
        console.log(`    ❌ ${check.name}: FAILED`);
        if (check.required) {
          allPassed = false;
        }
      }
    }
    
    this.results.environment = {
      ...this.results.execution,
      checks: results,
      allRequiredPassed: allPassed
    };
    
    if (!allPassed) {
      console.log('\n⚠️ Some required environment checks failed');
    } else {
      console.log('\n✅ All environment checks passed');
    }
  }

  async runTestSuites() {
    console.log('\n🧪 Step 2: Running all test suites...');
    
    for (const suiteName of this.testSuites) {
      console.log(`\n📊 Running ${suiteName}...`);
      
      try {
        const suitePath = path.join(__dirname, `${suiteName}.cjs`);
        
        // Check if test suite exists
        try {
          await fs.access(suitePath);
        } catch (error) {
          console.warn(`⚠️ Test suite ${suiteName} not found, skipping`);
          continue;
        }
        
        // Run test suite
        const suiteResult = await this.runTestSuite(suiteName, suitePath);
        this.results.testSuites[suiteName] = suiteResult;
        
        console.log(`  📊 ${suiteName} completed: ${suiteResult.summary.passRate}% pass rate`);
        
      } catch (error) {
        console.error(`  ❌ ${suiteName} failed:`, error);
        this.results.testSuites[suiteName] = {
          error: error.message,
          summary: { totalTests: 0, passedTests: 0, failedTests: 0, passRate: 0 }
        };
      }
    }
  }

  async runTestSuite(suiteName, suitePath) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Run test suite as child process
      const testProcess = spawn('node', [suitePath], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      let output = '';
      let errorOutput = '';
      
      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      testProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      testProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        try {
          // Try to extract JSON report from output
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const reportData = JSON.parse(jsonMatch[0]);
            resolve({
              suiteName,
              exitCode: code,
              duration,
              report: reportData,
              output,
              errorOutput
            });
          } else {
            // Fallback to parsing text output
            const summary = this.parseTextOutput(output);
            resolve({
              suiteName,
              exitCode: code,
              duration,
              summary,
              output,
              errorOutput
            });
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse test output: ${parseError.message}`));
        }
      });
      
      testProcess.on('error', (error) => {
        reject(error);
      });
      
      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        testProcess.kill('SIGTERM');
        reject(new Error(`Test suite ${suiteName} timed out`));
      }, 300000); // 5 minutes
    });
  }

  parseTextOutput(output) {
    const lines = output.split('\n');
    const summary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      passRate: 0
    };
    
    // Look for test result patterns
    for (const line of lines) {
      if (line.includes('Total Tests:')) {
        const match = line.match(/Total Tests:\s*(\d+)/);
        if (match) summary.totalTests = parseInt(match[1]);
      }
      
      if (line.includes('Passed:')) {
        const match = line.match(/Passed:\s*(\d+)/);
        if (match) summary.passedTests = parseInt(match[1]);
      }
      
      if (line.includes('Failed:')) {
        const match = line.match(/Failed:\s*(\d+)/);
        if (match) summary.failedTests = parseInt(match[1]);
      }
      
      if (line.includes('Pass Rate:')) {
        const match = line.match(/Pass Rate:\s*([\d.]+)/);
        if (match) summary.passRate = parseFloat(match[1]);
      }
    }
    
    summary.passRate = summary.totalTests > 0 ? 
      ((summary.passedTests / summary.totalTests) * 100) : 0;
    
    return summary;
  }

  aggregateResults() {
    console.log('\n📊 Step 3: Aggregating results from all test suites...');
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let criticalIssues = 0;
    
    // Aggregate results from all test suites
    for (const [suiteName, suiteResult] of Object.entries(this.results.testSuites)) {
      if (suiteResult.summary) {
        totalTests += suiteResult.summary.totalTests || 0;
        totalPassed += suiteResult.summary.passedTests || 0;
        totalFailed += suiteResult.summary.failedTests || 0;
      }
      
      // Extract critical issues from detailed results
      if (suiteResult.report && suiteResult.report.testResults) {
        const failedTests = suiteResult.report.testResults.filter(r => !r.passed);
        criticalIssues += failedTests.filter(t => 
          t.category === 'error-handling' || t.category === 'real-time-sync'
        ).length;
      }
    }
    
    this.results.summary = {
      ...this.results.summary,
      totalTests,
      passedTests: totalPassed,
      failedTests: totalFailed,
      passRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0,
      criticalIssues
    };
    
    console.log(`  📈 Aggregated ${totalTests} tests with ${totalPassed} passed (${this.results.summary.passRate}% pass rate)`);
    console.log(`  🚨 Identified ${criticalIssues} critical issues`);
  }

  async generateComprehensiveReports() {
    console.log('\n📝 Step 4: Generating comprehensive reports...');
    
    const reportData = {
      execution: {
        ...this.results.execution,
        endTime: Date.now(),
        totalDuration: Date.now() - this.startTime
      },
      environment: this.results.environment,
      testSuites: this.results.testSuites,
      summary: this.results.summary,
      performance: this.calculatePerformanceMetrics(),
      recommendations: this.generateRecommendations(),
      productionReadiness: this.assessProductionReadiness()
    };
    
    // Generate JSON report
    const jsonReport = this.generateJsonReport(reportData);
    const jsonPath = path.join(__dirname, 'COMPREHENSIVE_INTEGRATION_TEST_REPORT.json');
    await fs.writeFile(jsonPath, jsonReport);
    console.log(`  📄 JSON report: ${jsonPath}`);
    
    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport(reportData);
    const markdownPath = path.join(__dirname, 'COMPREHENSIVE_INTEGRATION_TEST_REPORT.md');
    await fs.writeFile(markdownPath, markdownReport);
    console.log(`  📝 Markdown report: ${markdownPath}`);
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport(reportData);
    const htmlPath = path.join(__dirname, 'COMPREHENSIVE_INTEGRATION_TEST_REPORT.html');
    await fs.writeFile(htmlPath, htmlReport);
    console.log(`  🌐 HTML report: ${htmlPath}`);
    
    // Generate executive summary
    const executivePath = path.join(__dirname, 'EXECUTIVE_SUMMARY.txt');
    await fs.writeFile(executivePath, this.generateExecutiveSummary(reportData));
    console.log(`  📋 Executive summary: ${executivePath}`);
  }

  calculatePerformanceMetrics() {
    const metrics = {
      averageResponseTime: 0,
      peakMemoryUsage: 0,
      cpuUtilization: 0,
      frameRate: 0,
      bundleSize: 0
    };
    
    // Extract performance metrics from test suites
    for (const suiteResult of Object.values(this.results.testSuites)) {
      if (suiteResult.report && suiteResult.report.performanceMetrics) {
        const perfMetrics = suiteResult.report.performanceMetrics;
        
        if (perfMetrics.averageResponseTime) {
          metrics.averageResponseTime = Math.max(
            metrics.averageResponseTime,
            perfMetrics.averageResponseTime
          );
        }
        
        if (perfMetrics.maxMemoryUsage) {
          metrics.peakMemoryUsage = Math.max(
            metrics.peakMemoryUsage,
            perfMetrics.maxMemoryUsage
          );
        }
        
        if (perfMetrics.avgCpuUsage) {
          metrics.cpuUtilization = Math.max(
            metrics.cpuUtilization,
            perfMetrics.avgCpuUsage
          );
        }
        
        if (perfMetrics.avgFrameRate) {
          metrics.frameRate = Math.max(
            metrics.frameRate,
            perfMetrics.avgFrameRate
          );
        }
      }
    }
    
    // Get bundle size if available
    try {
      const packageJsonPath = path.join(__dirname, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      metrics.bundleSize = packageJson.bundleSize || 0;
    } catch (error) {
      // Bundle size not available
    }
    
    return metrics;
  }

  generateRecommendations() {
    const recommendations = [];
    const { summary, testSuites } = this.results;
    
    // Analyze test results and generate recommendations
    if (summary.passRate < 95) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        title: 'Improve Test Coverage',
        description: `Overall pass rate of ${summary.passRate}% is below the 95% target.`,
        action: 'Review failed tests and address critical issues before production deployment'
      });
    }
    
    if (summary.criticalIssues > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'stability',
        title: 'Address Critical Issues',
        description: `${summary.criticalIssues} critical issues identified that could impact production stability.`,
        action: 'Immediately address all critical issues, focusing on error handling and real-time data synchronization'
      });
    }
    
    // Performance-specific recommendations
    for (const [suiteName, suiteResult] of Object.entries(testSuites)) {
      if (suiteResult.report && suiteResult.report.recommendations) {
        recommendations.push(...suiteResult.report.recommendations);
      }
    }
    
    // Remove duplicates and sort by priority
    const uniqueRecommendations = recommendations.filter((rec, index, arr) => 
      arr.findIndex(r => r.title === rec.title) === index
    );
    
    return uniqueRecommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  assessProductionReadiness() {
    const { summary, performance } = this.results;
    
    let score = 0;
    const maxScore = 100;
    const blockers = [];
    const concerns = [];
    const nextSteps = [];
    
    // Test coverage score (40% weight)
    if (summary.passRate >= 95) {
      score += 40;
    } else if (summary.passRate >= 85) {
      score += 30;
      concerns.push('Test pass rate below 95%');
    } else if (summary.passRate >= 70) {
      score += 20;
      concerns.push('Test pass rate below 85%');
      blockers.push('Test pass rate below 70%');
    } else {
      concerns.push('Test pass rate critically low');
      blockers.push('Test pass rate too low for production');
    }
    
    // Critical issues score (30% weight)
    if (summary.criticalIssues === 0) {
      score += 30;
    } else if (summary.criticalIssues <= 2) {
      score += 20;
      concerns.push('Some critical issues identified');
    } else if (summary.criticalIssues <= 5) {
      score += 10;
      concerns.push('Multiple critical issues identified');
      blockers.push('Too many critical issues for production');
    } else {
      concerns.push('Critical issues exceed acceptable limits');
      blockers.push('Critical issues exceed production thresholds');
    }
    
    // Performance score (20% weight)
    if (performance.averageResponseTime <= 100) {
      score += 20;
    } else if (performance.averageResponseTime <= 200) {
      score += 15;
      concerns.push('Average response time above 100ms');
    } else if (performance.averageResponseTime <= 500) {
      score += 10;
      concerns.push('Average response time above 200ms');
    } else {
      concerns.push('Response time performance inadequate');
      blockers.push('Response time performance too poor for production');
    }
    
    // Memory performance score (10% weight)
    if (performance.peakMemoryUsage <= 100 * 1024 * 1024) { // 100MB
      score += 10;
    } else if (performance.peakMemoryUsage <= 200 * 1024 * 1024) { // 200MB
      score += 7;
      concerns.push('Peak memory usage above 100MB');
    } else {
      concerns.push('Memory usage too high for production');
      blockers.push('Memory usage exceeds production limits');
    }
    
    // Determine overall readiness
    let overall = 'production-ready';
    if (score >= 90) {
      overall = 'production-ready';
      nextSteps.push(
        'Deploy to staging environment for final validation',
        'Conduct user acceptance testing',
        'Monitor production performance metrics',
        'Plan regular regression testing schedule'
      );
    } else if (score >= 80) {
      overall = 'ready-with-concerns';
      nextSteps.push(
        'Address identified concerns before production deployment',
        'Implement additional monitoring and alerting',
        'Prepare rollback procedures',
        'Schedule additional testing cycles'
      );
    } else if (score >= 70) {
      overall = 'needs-improvements';
      nextSteps.push(
        'Significant improvements required before production consideration',
        'Focus on addressing critical issues and performance bottlenecks',
        'Consider architectural changes if issues persist',
        'Plan comprehensive re-testing after improvements'
      );
    } else {
      overall = 'not-ready';
      nextSteps.push(
        'Major architectural and performance issues need resolution',
        'Complete redesign of problematic components',
        'Implement comprehensive testing strategy',
        'Consider postponing production deployment indefinitely'
      );
    }
    
    this.results.productionReadiness = {
      overall,
      score,
      blockers,
      concerns,
      nextSteps
    };
    
    return this.results.productionReadiness;
  }

  generateJsonReport(reportData) {
    return JSON.stringify(reportData, null, 2);
  }

  generateMarkdownReport(reportData) {
    const { execution, environment, summary, performance, recommendations, productionReadiness } = reportData;
    
    return `# Comprehensive Frontend Integration Test Report

**Generated:** ${new Date(execution.endTime).toLocaleString()}  
**Duration:** ${(execution.totalDuration / 1000 / 60).toFixed(2)} minutes  
**Environment:** ${environment.platform} (${environment.architecture})  
**Node.js Version:** ${environment.nodeVersion}

## Executive Summary

${this.getReadinessBadge(productionReadiness.overall)} **Production Readiness:** ${productionReadiness.overall.toUpperCase()}  
**Readiness Score:** ${productionReadiness.score}/100  
**Overall Pass Rate:** ${summary.passRate}%  
**Critical Issues:** ${summary.criticalIssues}

### Key Metrics
- **Total Tests:** ${summary.totalTests}
- **Passed:** ${summary.passedTests} ✅
- **Failed:** ${summary.failedTests} ❌
- **Test Duration:** ${(execution.totalDuration / 1000 / 60).toFixed(2)} minutes
- **Average Response Time:** ${performance.averageResponseTime}ms
- **Peak Memory Usage:** ${(performance.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB
- **CPU Utilization:** ${performance.cpuUtilization}%

## Test Suite Results

### Environment Validation
${Object.entries(environment.checks || {}).map(([name, result]) => 
  `- ${result.passed ? '✅' : '❌'} ${name}: ${result.passed ? 'PASSED' : 'FAILED'}`
).join('\n')}

### Test Suites Performance
${Object.entries(this.results.testSuites).map(([suite, result]) => 
  `#### ${suite}
- **Status:** ${result.error ? '❌ FAILED' : '✅ COMPLETED'}
- **Duration:** ${result.duration ? (result.duration / 1000).toFixed(2) + 's' : 'N/A'}
- **Pass Rate:** ${result.summary ? result.summary.passRate + '%' : 'N/A'}
${result.error ? `- **Error:** ${result.error}` : ''}
`).join('\n\n')}

## Production Readiness Assessment

### Overall Status: ${productionReadiness.overall}

### Score Breakdown
- **Test Coverage (40%):** ${summary.passRate >= 95 ? '40/40' : summary.passRate >= 85 ? '30/40' : summary.passRate >= 70 ? '20/40' : '0/40'}
- **Critical Issues (30%):** ${summary.criticalIssues === 0 ? '30/30' : summary.criticalIssues <= 2 ? '20/30' : summary.criticalIssues <= 5 ? '10/30' : '0/30'}
- **Performance (20%):** ${performance.averageResponseTime <= 100 ? '20/20' : performance.averageResponseTime <= 200 ? '15/20' : performance.averageResponseTime <= 500 ? '10/20' : '0/20'}
- **Memory Usage (10%):** ${performance.peakMemoryUsage <= 100 * 1024 * 1024 ? '10/10' : performance.peakMemoryUsage <= 200 * 1024 * 1024 ? '7/10' : '0/10'}

### Blockers
${productionReadiness.blockers.length > 0 ? 
  productionReadiness.blockers.map(blocker => `- **BLOCKER:** ${blocker}`).join('\n') : 
  '✅ No blockers identified'
}

### Concerns
${productionReadiness.concerns.length > 0 ? 
  productionReadiness.concerns.map(concern => `- **CONCERN:** ${concern}`).join('\n') : 
  '✅ No major concerns identified'
}

### Next Steps
${productionReadiness.nextSteps.map(step => `- ${step}`).join('\n')}

## Recommendations

${recommendations.map((rec, index) => 
  `### ${index + 1}. ${rec.title} (${rec.priority.toUpperCase()})
**Category:** ${rec.category}  
**Description:** ${rec.description}  
**Action:** ${rec.action}`
).join('\n\n')}

## Detailed Test Results

<details>
<summary>Click to expand detailed test results</summary>

\`\`\`json
${JSON.stringify(reportData, null, 2)}
\`\`\`

</details>

---
*Report generated by Mindcraft Frontend Comprehensive Integration Test Suite*
*Test execution completed: ${new Date().toISOString()}*
`;
  }

  generateHtmlReport(reportData) {
    const { execution, summary, performance, recommendations, productionReadiness } = reportData;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Integration Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5f; color: #333; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #e9ecef; padding-bottom: 20px; }
        .status { font-size: 64px; margin-bottom: 20px; font-weight: bold; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-bottom: 40px; }
        .metric { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2); }
        .metric-value { font-size: 48px; font-weight: bold; margin-bottom: 10px; }
        .metric-label { font-size: 16px; opacity: 0.9; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #2c3e50; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin-bottom: 20px; }
        .progress-bar { width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; margin: 10px 0; }
        .progress-fill { height: 100%; background: #28a745; border-radius: 4px; transition: width 0.3s ease; }
        .recommendations { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 30px; }
        .recommendation { background: white; border-radius: 6px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .rec-title { font-weight: bold; color: #2c3e50; margin-bottom: 8px; font-size: 18px; }
        .rec-priority { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px; font-weight: bold; }
        .priority-critical { background: #dc3545; color: white; }
        .priority-high { background: #fd7e14; color: #212529; }
        .priority-medium { background: #ffc107; color: #212529; }
        .priority-low { background: #28a745; color: white; }
        .footer { margin-top: 50px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #e9ecef; padding-top: 20px; }
        .ready-production { background: #28a745; }
        .ready-concerns { background: #ffc107; }
        .ready-needs-improvements { background: #fd7e14; }
        .ready-not-ready { background: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="status ${productionReadiness.overall.replace('-', ' ')}">
                ${productionReadiness.score}/100
            </div>
            <h1>Comprehensive Integration Test Report</h1>
            <p>Generated: ${new Date(execution.endTime).toLocaleString()}</p>
            <p>Duration: ${(execution.totalDuration / 1000 / 60).toFixed(2)} minutes</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric">
                <div class="metric-value">${summary.passRate}%</div>
                <div class="metric-label">PASS RATE</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.totalTests}</div>
                <div class="metric-label">TOTAL TESTS</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.passedTests}</div>
                <div class="metric-label">PASSED</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.failedTests}</div>
                <div class="metric-label">FAILED</div>
            </div>
            <div class="metric">
                <div class="metric-value">${performance.averageResponseTime}ms</div>
                <div class="metric-label">AVG RESPONSE TIME</div>
            </div>
            <div class="metric">
                <div class="metric-value">${(performance.peakMemoryUsage / 1024 / 1024).toFixed(1)}MB</div>
                <div class="metric-label">PEAK MEMORY</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Production Readiness</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${productionReadiness.score}%"></div>
            </div>
            <p><strong>Status:</strong> ${productionReadiness.overall.replace('-', ' ').toUpperCase()}</p>
            <p><strong>Score:</strong> ${productionReadiness.score}/100</p>
        </div>
        
        <div class="section recommendations">
            <h2>Recommendations</h2>
            ${recommendations.map((rec, index) => 
                `<div class="recommendation">
                    <div class="rec-title">
                        ${index + 1}. ${rec.title}
                        <span class="rec-priority priority-${rec.priority}">${rec.priority.toUpperCase()}</span>
                    </div>
                    <p><strong>Action:</strong> ${rec.action}</p>
                    <p>${rec.description}</p>
                </div>`
            ).join('')}
        </div>
        
        <div class="footer">
            <p>Report generated by Mindcraft Frontend Comprehensive Integration Test Suite</p>
            <p>Execution completed: ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>`;
  }

  generateExecutiveSummary(reportData) {
    const { execution, summary, performance, productionReadiness } = reportData;
    
    return `EXECUTIVE SUMMARY - COMPREHENSIVE INTEGRATION TESTS
================================================================

PRODUCTION READINESS: ${productionReadiness.overall.toUpperCase()}
READINESS SCORE: ${productionReadiness.score}/100
OVERALL PASS RATE: ${summary.passRate}%
CRITICAL ISSUES: ${summary.criticalIssues}

KEY METRICS:
- Total Tests: ${summary.totalTests}
- Passed: ${summary.passedTests}
- Failed: ${summary.failedTests}
- Test Duration: ${(execution.totalDuration / 1000 / 60).toFixed(2)} minutes
- Average Response Time: ${performance.averageResponseTime}ms
- Peak Memory Usage: ${(performance.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB

PRODUCTION READINESS ASSESSMENT:
${productionReadiness.overall === 'production-ready' ? '✅ READY FOR PRODUCTION DEPLOYMENT' :
  productionReadiness.overall === 'ready-with-concerns' ? '⚠️ READY WITH MINOR CONCERNS - ADDRESS BEFORE PRODUCTION' :
  productionReadiness.overall === 'needs-improvements' ? '🟡 NEEDS SIGNIFICANT IMPROVEMENTS BEFORE PRODUCTION CONSIDERATION' :
  '🔴 NOT READY FOR PRODUCTION - MAJOR ISSUES REQUIRE RESOLUTION'}

${productionReadiness.blockers.length > 0 ? 
  '\nBLOCKERS:\n' + productionReadiness.blockers.map(b => `- ${b}`).join('\n') : 
  '\n✅ No production blockers identified'
}

${productionReadiness.concerns.length > 0 ? 
  '\nCONCERNS:\n' + productionReadiness.concerns.map(c => `- ${c}`).join('\n') : 
  '\n✅ No major concerns identified'
}

NEXT STEPS:
${productionReadiness.nextSteps.map(step => `- ${step}`).join('\n')}

================================================================
Report generated: ${new Date().toISOString()}
`;
  }

  getReadinessBadge(status) {
    const badges = {
      'production-ready': '🟢',
      'ready-with-concerns': '🟡',
      'needs-improvements': '🟠',
      'not-ready': '🔴'
    };
    return badges[status] || '⚪';
  }

  displayFinalSummary() {
    const { summary, productionReadiness } = this.results;
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 COMPREHENSIVE INTEGRATION TESTS - FINAL SUMMARY');
    console.log('='.repeat(80));
    
    // Executive summary
    console.log('\n📊 EXECUTIVE SUMMARY:');
    console.log(`${this.getReadinessBadge(productionReadiness.overall)} Production Readiness: ${productionReadiness.overall.toUpperCase()}`);
    console.log(`📈 Readiness Score: ${productionReadiness.score}/100`);
    console.log(`📊 Overall Pass Rate: ${summary.passRate}%`);
    console.log(`⏱️ Test Duration: ${(this.results.execution.totalDuration / 1000 / 60).toFixed(2)} minutes`);
    console.log(`🚨 Critical Issues: ${summary.criticalIssues}`);
    
    // Production readiness details
    console.log('\n🎯 PRODUCTION READINESS ASSESSMENT:');
    if (productionReadiness.blockers.length > 0) {
      console.log('🚫 BLOCKERS:');
      productionReadiness.blockers.forEach(blocker => {
        console.log(`   ❌ ${blocker}`);
      });
    }
    
    if (productionReadiness.concerns.length > 0) {
      console.log('⚠️ CONCERNS:');
      productionReadiness.concerns.forEach(concern => {
        console.log(`   ⚠️ ${concern}`);
      });
    }
    
    if (productionReadiness.blockers.length === 0 && productionReadiness.concerns.length === 0) {
      console.log('✅ No production blockers or major concerns identified');
    }
    
    // Next steps
    console.log('\n📋 NEXT STEPS:');
    productionReadiness.nextSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Final verdict
    if (productionReadiness.overall === 'production-ready') {
      console.log('🎉 SYSTEM IS PRODUCTION READY!');
      console.log('   ✅ All critical requirements met');
      console.log('   ✅ Performance within acceptable thresholds');
      console.log('   ✅ No blocking issues identified');
      console.log('   ✅ Ready for deployment to production');
    } else if (productionReadiness.overall === 'ready-with-concerns') {
      console.log('⚠️ SYSTEM IS READY WITH CONCERNS');
      console.log('   ⚠️ Minor issues need attention');
      console.log('   ⚠️ Address concerns before production deployment');
      console.log('   ⚠️ Monitor closely after deployment');
    } else if (productionReadiness.overall === 'needs-improvements') {
      console.log('🟡 SYSTEM NEEDS IMPROVEMENTS');
      console.log('   🟡 Significant improvements required');
      console.log('   🟡 Address major issues before production');
      console.log('   🟡 Consider architectural changes');
    } else {
      console.log('🔴 SYSTEM IS NOT PRODUCTION READY');
      console.log('   🔴 Major issues require resolution');
      console.log('   🔴 Do not deploy to production');
      console.log('   🔴 Complete redesign may be necessary');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const runner = new ComprehensiveIntegrationTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = ComprehensiveIntegrationTestRunner;
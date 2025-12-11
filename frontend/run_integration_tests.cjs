/**
 * Frontend Integration Test Runner
 * 
 * This script executes the comprehensive integration test suite and generates
 * a detailed report of the frontend cognitive dashboard integration status.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds per test
  retries: 2,
  parallel: false, // Run tests sequentially for better error tracking
  reporter: 'spec' // Detailed output
};

// Test categories
const TEST_CATEGORIES = {
  SOCKET_IO: 'Socket.IO Service Integration',
  REDUX_STORE: 'Redux Store Integration',
  COMPONENTS: 'Component Integration',
  DATA_FLOW: 'Real-time Data Flow',
  ERROR_HANDLING: 'Error Handling & Graceful Degradation',
  PERFORMANCE: 'Performance Validation & Optimization',
  CROSS_COMPONENT: 'Cross-Component Integration'
};

// Results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  categories: {
    [TEST_CATEGORIES.SOCKET_IO]: { total: 0, passed: 0, failed: 0, errors: [] },
    [TEST_CATEGORIES.REDUX_STORE]: { total: 0, passed: 0, failed: 0, errors: [] },
    [TEST_CATEGORIES.COMPONENTS]: { total: 0, passed: 0, failed: 0, errors: [] },
    [TEST_CATEGORIES.DATA_FLOW]: { total: 0, passed: 0, failed: 0, errors: [] },
    [TEST_CATEGORIES.ERROR_HANDLING]: { total: 0, passed: 0, failed: 0, errors: [] },
    [TEST_CATEGORIES.PERFORMANCE]: { total: 0, passed: 0, failed: 0, errors: [] },
    [TEST_CATEGORIES.CROSS_COMPONENT]: { total: 0, passed: 0, failed: 0, errors: [] }
  },
  startTime: Date.now(),
  endTime: null
};

/**
 * Run the integration test suite
 */
function runIntegrationTests() {
  console.log('🚀 Starting Frontend Integration Test Suite');
  console.log('=====================================');
  
  testResults.startTime = Date.now();
  
  // Check if test file exists
  const testFilePath = path.join(__dirname, 'test_comprehensive_integration.cjs');
  if (!fs.existsSync(testFilePath)) {
    console.error('❌ Test file not found:', testFilePath);
    process.exit(1);
  }
  
  // Run tests with mocha
  const mochaArgs = [
    testFilePath,
    '--timeout', TEST_CONFIG.timeout.toString(),
    '--retries', TEST_CONFIG.retries.toString(),
    '--reporter', TEST_CONFIG.reporter,
    '--color', // Enable colored output
    '--grep', // Filter for specific test patterns
    '.*Frontend.*Integration.*' // Run all integration tests
  ];
  
  console.log('📋 Test Configuration:');
  console.log(`   Timeout: ${TEST_CONFIG.timeout}ms`);
  console.log(`   Retries: ${TEST_CONFIG.retries}`);
  console.log(`   Reporter: ${TEST_CONFIG.reporter}`);
  console.log('');
  
  console.log('🧪 Executing Tests...');
  
  const testProcess = spawn('npx', ['mocha', ...mochaArgs], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  let testOutput = '';
  let errorOutput = '';
  
  testProcess.stdout.on('data', (data) => {
    const output = data.toString();
    testOutput += output;
    process.stdout.write(output);
  });
  
  testProcess.stderr.on('data', (data) => {
    const output = data.toString();
    errorOutput += output;
    process.stderr.write(output);
  });
  
  testProcess.on('close', (code) => {
    testResults.endTime = Date.now();
    parseTestResults(testOutput, errorOutput);
    generateReport();
    
    if (code === 0) {
      console.log('✅ Integration tests completed successfully');
    } else {
      console.log(`❌ Integration tests failed with exit code: ${code}`);
      process.exit(code);
    }
  });
  
  testProcess.on('error', (error) => {
    console.error('❌ Failed to start test process:', error);
    process.exit(1);
  });
}

/**
 * Parse test results from mocha output
 */
function parseTestResults(stdout, stderr) {
  const lines = stdout.split('\n');
  let currentCategory = null;
  let currentTest = null;
  let testStatus = null;
  
  lines.forEach(line => {
    // Parse test category
    const categoryMatch = line.match(/describe\('(\d+)\. ([^']+)'/);
    if (categoryMatch) {
      currentCategory = categoryMatch[2];
      if (!testResults.categories[currentCategory]) {
        currentCategory = Object.keys(TEST_CATEGORIES).find(key => 
          TEST_CATEGORIES[key].toLowerCase().includes(currentCategory.toLowerCase())
        ) || 'UNKNOWN';
      }
    }
    
    // Parse test name
    const testMatch = line.match(/it\('([^']+)'/);
    if (testMatch) {
      currentTest = testMatch[1];
    }
    
    // Parse test status
    if (line.includes('✓') || line.includes('passing')) {
      testStatus = 'PASSED';
    } else if (line.includes('❌') || line.includes('failing') || line.includes('failed')) {
      testStatus = 'FAILED';
    } else if (line.includes('⏸') || line.includes('pending') || line.includes('skipped')) {
      testStatus = 'SKIPPED';
    }
    
    // Parse error details
    if (testStatus === 'FAILED' && currentTest && currentCategory) {
      const errorMatch = line.match(/Error: ([^\\n]+)/);
      if (errorMatch) {
        testResults.categories[currentCategory].errors.push({
          test: currentTest,
          error: errorMatch[1],
          line: line
        });
      }
    }
    
    // Update counters
    if (testStatus) {
      testResults.total++;
      
      if (currentCategory && testResults.categories[currentCategory]) {
        testResults.categories[currentCategory].total++;
        
        if (testStatus === 'PASSED') {
          testResults.passed++;
          testResults.categories[currentCategory].passed++;
        } else if (testStatus === 'FAILED') {
          testResults.failed++;
          testResults.categories[currentCategory].failed++;
        } else if (testStatus === 'SKIPPED') {
          testResults.skipped++;
        }
      }
    }
  });
  
  // Parse stderr for additional errors
  if (stderr) {
    const errorLines = stderr.split('\n');
    errorLines.forEach(line => {
      if (line.includes('Error:') || line.includes('TypeError:') || line.includes('ReferenceError:')) {
        testResults.errors.push({
          type: 'SYSTEM_ERROR',
          message: line.trim(),
          timestamp: Date.now()
        });
      }
    });
  }
}

/**
 * Generate comprehensive test report
 */
function generateReport() {
  const duration = testResults.endTime - testResults.startTime;
  const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) : 0;
  
  console.log('\n📊 INTEGRATION TEST REPORT');
  console.log('=============================');
  console.log(`⏱️  Total Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
  console.log(`📈  Success Rate: ${successRate}%`);
  console.log(`✅  Passed: ${testResults.passed}`);
  console.log(`❌  Failed: ${testResults.failed}`);
  console.log(`⏸  Skipped: ${testResults.skipped}`);
  console.log(`📊  Total: ${testResults.total}`);
  console.log('');
  
  // Category breakdown
  console.log('📋 CATEGORY BREAKDOWN:');
  Object.entries(testResults.categories).forEach(([category, results]) => {
    if (results.total > 0) {
      const categorySuccessRate = (results.passed / results.total * 100).toFixed(1);
      console.log(`\n🏷️  ${category}:`);
      console.log(`   Total: ${results.total}`);
      console.log(`   Passed: ${results.passed}`);
      console.log(`   Failed: ${results.failed}`);
      console.log(`   Success Rate: ${categorySuccessRate}%`);
      
      if (results.errors.length > 0) {
        console.log(`   Errors: ${results.errors.length}`);
        results.errors.forEach((error, index) => {
          console.log(`     ${index + 1}. ${error.test}: ${error.error}`);
        });
      }
    }
  });
  
  // Critical issues summary
  const criticalIssues = testResults.errors.filter(error => 
    error.type === 'SYSTEM_ERROR' || 
    error.error.includes('TypeError') || 
    error.error.includes('ReferenceError')
  );
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    criticalIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue.error}`);
    });
  }
  
  // Performance summary
  console.log('\n⚡ PERFORMANCE SUMMARY:');
  const performanceCategory = testResults.categories[TEST_CATEGORIES.PERFORMANCE];
  if (performanceCategory && performanceCategory.total > 0) {
    const performanceSuccessRate = (performanceCategory.passed / performanceCategory.total * 100).toFixed(1);
    console.log(`   Performance Tests: ${performanceCategory.passed}/${performanceCategory.total} (${performanceSuccessRate}%)`);
    
    if (performanceCategory.failed > 0) {
      console.log('   ⚠️  Performance issues detected that may impact user experience');
    }
  }
  
  // Integration status summary
  console.log('\n🔗 INTEGRATION STATUS:');
  const socketCategory = testResults.categories[TEST_CATEGORIES.SOCKET_IO];
  const reduxCategory = testResults.categories[TEST_CATEGORIES.REDUX_STORE];
  const componentCategory = testResults.categories[TEST_CATEGORIES.COMPONENTS];
  const dataflowCategory = testResults.categories[TEST_CATEGORIES.DATA_FLOW];
  
  const integrationHealth = {
    socket: socketCategory ? (socketCategory.passed / socketCategory.total) : 0,
    redux: reduxCategory ? (reduxCategory.passed / reduxCategory.total) : 0,
    components: componentCategory ? (componentCategory.passed / componentCategory.total) : 0,
    dataflow: dataflowCategory ? (dataflowCategory.passed / dataflowCategory.total) : 0
  };
  
  Object.entries(integrationHealth).forEach(([component, health]) => {
    const status = health >= 0.9 ? '✅ HEALTHY' : 
                  health >= 0.7 ? '⚠️  NEEDS ATTENTION' : 
                  '❌  CRITICAL ISSUES';
    console.log(`   ${component}: ${status} (${(health * 100).toFixed(1)}%)`);
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (successRate < 90) {
    console.log('   1. Address failing tests to improve overall system stability');
  }
  
  if (integrationHealth.socket < 0.9) {
    console.log('   2. Review Socket.IO service configuration and error handling');
  }
  
  if (integrationHealth.redux < 0.9) {
    console.log('   3. Verify Redux store state management and action handling');
  }
  
  if (integrationHealth.components < 0.9) {
    console.log('   4. Check component integration and data flow');
  }
  
  if (integrationHealth.dataflow < 0.9) {
    console.log('   5. Optimize real-time data streaming and state synchronization');
  }
  
  if (criticalIssues.length > 0) {
    console.log('   6. CRITICAL: Fix system errors before production deployment');
  }
  
  // Generate JSON report
  const jsonReport = {
    summary: {
      timestamp: new Date().toISOString(),
      duration: duration,
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      successRate: parseFloat(successRate)
    },
    categories: testResults.categories,
    integrationHealth,
    criticalIssues,
    recommendations: generateRecommendations()
  };
  
  const reportPath = path.join(__dirname, 'INTEGRATION_TEST_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log('\n🎯 OVERALL ASSESSMENT:');
  
  if (successRate >= 95) {
    console.log('✅ EXCELLENT: Frontend integration is production-ready');
  } else if (successRate >= 85) {
    console.log('✅ GOOD: Frontend integration is mostly functional with minor issues');
  } else if (successRate >= 70) {
    console.log('⚠️  FAIR: Frontend integration has significant issues requiring attention');
  } else {
    console.log('❌ POOR: Frontend integration has critical issues preventing deployment');
  }
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations() {
  const recommendations = [];
  
  const socketCategory = testResults.categories[TEST_CATEGORIES.SOCKET_IO];
  const reduxCategory = testResults.categories[TEST_CATEGORIES.REDUX_STORE];
  const componentCategory = testResults.categories[TEST_CATEGORIES.COMPONENTS];
  const dataflowCategory = testResults.categories[TEST_CATEGORIES.DATA_FLOW];
  const performanceCategory = testResults.categories[TEST_CATEGORIES.PERFORMANCE];
  
  // Socket.IO recommendations
  if (socketCategory && socketCategory.failed > 0) {
    recommendations.push({
      category: 'Socket.IO',
      priority: 'HIGH',
      issue: 'Connection stability issues detected',
      solution: 'Review connection handling, implement robust reconnection logic, and add comprehensive error recovery'
    });
  }
  
  // Redux recommendations
  if (reduxCategory && reduxCategory.failed > 0) {
    recommendations.push({
      category: 'Redux Store',
      priority: 'HIGH',
      issue: 'State management inconsistencies',
      solution: 'Verify action creators, update selectors, and ensure proper state synchronization'
    });
  }
  
  // Component recommendations
  if (componentCategory && componentCategory.failed > 0) {
    recommendations.push({
      category: 'Components',
      priority: 'MEDIUM',
      issue: 'Component integration failures',
      solution: 'Review component props, state management, and cross-component communication'
    });
  }
  
  // Data flow recommendations
  if (dataflowCategory && dataflowCategory.failed > 0) {
    recommendations.push({
      category: 'Data Flow',
      priority: 'HIGH',
      issue: 'Real-time data synchronization problems',
      solution: 'Optimize streaming service, implement proper data validation, and fix state propagation'
    });
  }
  
  // Performance recommendations
  if (performanceCategory && performanceCategory.failed > 0) {
    recommendations.push({
      category: 'Performance',
      priority: 'MEDIUM',
      issue: 'Performance bottlenecks detected',
      solution: 'Implement lazy loading, optimize rendering, and add performance monitoring'
    });
  }
  
  // General recommendations
  if (testResults.errors.length > 0) {
    recommendations.push({
      category: 'General',
      priority: 'CRITICAL',
      issue: 'System errors affecting stability',
      solution: 'Fix critical errors before production deployment, implement comprehensive error handling'
    });
  }
  
  return recommendations;
}

// Run the integration tests
if (require.main === module) {
  runIntegrationTests();
}

module.exports = {
  runIntegrationTests,
  generateReport,
  TEST_CATEGORIES,
  TEST_CONFIG
};
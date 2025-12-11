/**
 * Test Report Generator
 * Generates comprehensive test reports for all testing phases
 */

interface TestReport {
  timestamp: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage: number;
    duration: number;
  };
  suites: TestSuite[];
  performance: PerformanceMetrics;
  accessibility: AccessibilityResults;
  security: SecurityResults;
  recommendations: string[];
}

interface TestSuite {
  name: string;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  issues: TestIssue[];
}

interface TestIssue {
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  file?: string;
  line?: number;
}

interface PerformanceMetrics {
  renderTime: {
    average: number;
    max: number;
    min: number;
  };
  memoryUsage: {
    peak: number;
    average: number;
    growth: number;
  };
  networkRequests: {
    total: number;
    averageTime: number;
    timeoutRate: number;
  };
}

interface AccessibilityResults {
  violations: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  score: {
    overall: number;
    wcag: string;
  };
}

interface SecurityResults {
  vulnerabilities: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  score: {
    overall: number;
    grade: string;
  };
}

class TestReportGenerator {
  private reports: TestReport[] = [];

  generateReport(
    name: string,
    results: any,
    type: 'unit' | 'integration' | 'performance' | 'accessibility' | 'security' | 'e2e'
  ): TestReport {
    const timestamp = Date.now();
    
    switch (type) {
      case 'unit':
        return this.generateUnitReport(name, results);
      case 'integration':
        return this.generateIntegrationReport(name, results);
      case 'performance':
        return this.generatePerformanceReport(name, results);
      case 'accessibility':
        return this.generateAccessibilityReport(name, results);
      case 'security':
        return this.generateSecurityReport(name, results);
      case 'e2e':
        return this.generateE2EReport(name, results);
      default:
        return this.generateGenericReport(name, results, type);
    }
  }

  private generateUnitReport(name: string, results: any): TestReport {
    const summary = {
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: results.numPendingTests || 0,
      coverage: results.coverage?.map?.statements?.pct || 0,
      duration: results.startTime ? results.endTime - results.startTime : 0
    };

    const issues = this.extractIssues(results);
    
    return {
      timestamp: Date.now(),
      summary,
      suites: [{
        name,
        tests: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        duration: summary.duration,
        issues
      }],
      performance: this.extractPerformanceMetrics(results),
      accessibility: {} as AccessibilityResults,
      security: {} as SecurityResults,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private generateIntegrationReport(name: string, results: any): TestReport {
    const summary = {
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: results.numPendingTests || 0,
      coverage: 0,
      duration: results.startTime ? results.endTime - results.startTime : 0
    };

    const issues = this.extractIssues(results);
    
    return {
      timestamp: Date.now(),
      summary,
      suites: [{
        name,
        tests: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        duration: summary.duration,
        issues
      }],
      performance: this.extractPerformanceMetrics(results),
      accessibility: {} as AccessibilityResults,
      security: {} as SecurityResults,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private generatePerformanceReport(name: string, results: any): TestReport {
    const summary = {
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: 0,
      coverage: 0,
      duration: results.duration || 0
    };

    const issues = this.extractIssues(results);
    
    return {
      timestamp: Date.now(),
      summary,
      suites: [{
        name,
        tests: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        duration: summary.duration,
        issues
      }],
      performance: results.performance || {} as PerformanceMetrics,
      accessibility: {} as AccessibilityResults,
      security: {} as SecurityResults,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private generateAccessibilityReport(name: string, results: any): TestReport {
    const summary = {
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: 0,
      coverage: 0,
      duration: results.duration || 0
    };

    const issues = this.extractIssues(results);
    
    return {
      timestamp: Date.now(),
      summary,
      suites: [{
        name,
        tests: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        duration: summary.duration,
        issues
      }],
      performance: {} as PerformanceMetrics,
      accessibility: results.accessibility || {} as AccessibilityResults,
      security: {} as SecurityResults,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private generateSecurityReport(name: string, results: any): TestReport {
    const summary = {
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: 0,
      coverage: 0,
      duration: results.duration || 0
    };

    const issues = this.extractIssues(results);
    
    return {
      timestamp: Date.now(),
      summary,
      suites: [{
        name,
        tests: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        duration: summary.duration,
        issues
      }],
      performance: {} as PerformanceMetrics,
      accessibility: {} as AccessibilityResults,
      security: results.security || {} as SecurityResults,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private generateE2EReport(name: string, results: any): TestReport {
    const summary = {
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: results.numPendingTests || 0,
      coverage: 0,
      duration: results.duration || 0
    };

    const issues = this.extractIssues(results);
    
    return {
      timestamp: Date.now(),
      summary,
      suites: [{
        name,
        tests: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        duration: summary.duration,
        issues
      }],
      performance: {} as PerformanceMetrics,
      accessibility: {} as AccessibilityResults,
      security: {} as SecurityResults,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private generateGenericReport(name: string, results: any, type: string): TestReport {
    const summary = {
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: results.numPendingTests || 0,
      coverage: 0,
      duration: results.duration || 0
    };

    const issues = this.extractIssues(results);
    
    return {
      timestamp: Date.now(),
      summary,
      suites: [{
        name,
        tests: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        duration: summary.duration,
        issues
      }],
      performance: {} as PerformanceMetrics,
      accessibility: {} as AccessibilityResults,
      security: {} as SecurityResults,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private extractIssues(results: any): TestIssue[] {
    const issues: TestIssue[] = [];
    
    if (results.testResults) {
      results.testResults.forEach((test: any) => {
        if (test.status === 'failed') {
          issues.push({
            type: 'error',
            severity: 'high',
            message: test.message || 'Test failed',
            file: test.file || ''
          });
        } else if (test.status === 'pending') {
          issues.push({
            type: 'warning',
            severity: 'medium',
            message: test.message || 'Test pending',
            file: test.file || ''
          });
        }
      });
    }
    
    if (results.failures) {
      results.failures.forEach((failure: any) => {
        issues.push({
          type: 'error',
          severity: 'critical',
          message: failure.message || 'Test failure',
          file: failure.file || ''
        });
      });
    }
    
    return issues;
  }

  private extractPerformanceMetrics(results: any): PerformanceMetrics {
    if (results.performance) {
      return results.performance;
    }
    
    return {
      renderTime: { average: 0, max: 0, min: 0 },
      memoryUsage: { peak: 0, average: 0, growth: 0 },
      networkRequests: { total: 0, averageTime: 0, timeoutRate: 0 }
    };
  }

  private generateRecommendations(issues: TestIssue[]): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');
    const mediumIssues = issues.filter(issue => issue.severity === 'medium');
    
    if (criticalIssues.length > 0) {
      recommendations.push('CRITICAL: Fix critical issues before deployment');
    }
    
    if (highIssues.length > 0) {
      recommendations.push('HIGH: Address high-priority issues');
    }
    
    if (mediumIssues.length > 0) {
      recommendations.push('MEDIUM: Consider addressing medium-priority issues');
    }
    
    if (issues.length === 0) {
      recommendations.push('SUCCESS: All tests passed');
    }
    
    return recommendations;
  }

  saveReport(report: TestReport, format: 'json' | 'html' | 'markdown' = 'json'): void {
    const timestamp = new Date().toISOString().replace(/[:.]/, '-');
    const filename = `test-report-${timestamp}-${report.suites[0]?.name || 'unknown'}`;
    
    let content: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(report, null, 2);
        break;
      case 'html':
        content = this.generateHTMLReport(report);
        break;
      case 'markdown':
        content = this.generateMarkdownReport(report);
        break;
      default:
        content = JSON.stringify(report, null, 2);
    }
    
    // Save to file system (in Node.js environment)
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join('test-results', `${filename}.${format}`);
      fs.writeFileSync(filePath, content);
      
      console.log(`Test report saved to: ${filePath}`);
    }
  }

  private generateHTMLReport(report: TestReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${report.suites[0]?.name || 'Unknown'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .metric { background: #e8f5e8; padding: 15px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2e7d32; }
        .metric-label { font-size: 14px; color: #666; }
        .issues { background: #ffebee; padding: 20px; border-radius: 5px; }
        .issue { background: #ff4444; color: white; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .issue.error { background: #dc3545; }
        .issue.warning { background: #ff9800; }
        .issue.critical { background: #d32f2f; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 5px; }
        .recommendation { background: #fff; padding: 10px; margin: 5px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Report - ${report.suites[0]?.name || 'Unknown'}</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="metric-value">${report.summary.total}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.passed}</div>
            <div class="metric-label">Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${report.summary.failed}</div>
            <div class="metric-label">Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${Math.round(report.summary.coverage)}%</div>
            <div class="metric-label">Coverage</div>
        </div>
        <div class="metric">
            <div class="metric-value">${Math.round(report.summary.duration / 1000)}s</div>
            <div class="metric-label">Duration</div>
        </div>
    </div>
    
    ${report.suites.length > 0 ? `
    <div class="issues">
        <h2>Issues Found</h2>
        ${report.suites[0].issues.map(issue => 
          `<div class="issue ${issue.type} ${issue.severity}">${issue.message}</div>`
        ).join('')}
    </div>
    ` : ''}
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        ${report.recommendations.map(rec => 
          `<div class="recommendation">${rec}</div>`
        ).join('')}
    </div>
</body>
</html>`;
  }

  private generateMarkdownReport(report: TestReport): string {
    return `
# Test Report - ${report.suites[0]?.name || 'Unknown'}

**Generated:** ${new Date().toLocaleString()}

## Summary

- **Total Tests:** ${report.summary.total}
- **Passed:** ${report.summary.passed}
- **Failed:** ${report.summary.failed}
- **Coverage:** ${Math.round(report.summary.coverage)}%
- **Duration:** ${Math.round(report.summary.duration / 1000)}s

## Issues

${report.suites[0].issues.map(issue => 
  `- **${issue.severity.toUpperCase()}:** ${issue.message}`
).join('\n')}

## Recommendations

${report.recommendations.map(rec => 
  `- ${rec}`
).join('\n')}
`;
  }

  generateSummaryReport(reports: TestReport[]): void {
    const summary = {
      timestamp: Date.now(),
      totalTests: reports.reduce((sum, report) => sum + report.summary.total, 0),
      totalPassed: reports.reduce((sum, report) => sum + report.summary.passed, 0),
      totalFailed: reports.reduce((sum, report) => sum + report.summary.failed, 0),
      averageCoverage: reports.reduce((sum, report) => sum + report.summary.coverage, 0) / reports.length,
      averageDuration: reports.reduce((sum, report) => sum + report.summary.duration, 0) / reports.length
    };

    console.log('=== COMPREHENSIVE TEST SUMMARY ===');
    console.log(`Total Test Suites: ${reports.length}`);
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Total Passed: ${summary.totalPassed}`);
    console.log(`Total Failed: ${summary.totalFailed}`);
    console.log(`Average Coverage: ${Math.round(summary.averageCoverage)}%`);
    console.log(`Average Duration: ${Math.round(summary.averageDuration / 1000)}s`);
    console.log('=====================================');
  }
}

export default TestReportGenerator;
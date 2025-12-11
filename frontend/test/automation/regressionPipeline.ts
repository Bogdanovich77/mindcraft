/**
 * Automated Regression Pipeline
 * Runs comprehensive test suite on code changes
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import TestReportGenerator from '../reports/testReportGenerator';

interface RegressionConfig {
  testSuites: string[];
  thresholds: {
    coverage: number;
    passRate: number;
    performance: number;
  };
  notifications: {
    email: {
      enabled: boolean;
      recipients: string[];
    };
    slack: {
      enabled: boolean;
      webhook: string;
    };
  };
}

class RegressionPipeline {
  private config: RegressionConfig;
  private reportGenerator: TestReportGenerator;

  constructor(config: RegressionConfig) {
    this.config = config;
    this.reportGenerator = new TestReportGenerator();
  }

  async run(): Promise<void> {
    console.log('🚀 Starting automated regression pipeline...');
    
    try {
      // 1. Clean previous results
      this.cleanPreviousResults();
      
      // 2. Run test suites
      const results = await this.runTestSuites();
      
      // 3. Generate comprehensive report
      const report = this.reportGenerator.generateSummaryReport(results);
      
      // 4. Check thresholds
      const thresholdResults = this.checkThresholds(report);
      
      // 5. Save reports
      this.saveReports(report, thresholdResults);
      
      // 6. Send notifications
      await this.sendNotifications(report, thresholdResults);
      
      // 7. Update status
      this.updatePipelineStatus(report, thresholdResults);
      
      console.log('✅ Regression pipeline completed successfully');
      
    } catch (error) {
      console.error('❌ Regression pipeline failed:', error);
      this.sendFailureNotification(error);
      throw error;
    }
  }

  private cleanPreviousResults(): void {
    try {
      execSync('rm -rf test-results/*', { stdio: 'inherit' });
      console.log('🧹 Cleaned previous test results');
    } catch (error) {
      console.warn('⚠️ Failed to clean previous results:', error);
    }
  }

  private async runTestSuites(): Promise<any[]> {
    const results: any[] = [];
    
    for (const suite of this.config.testSuites) {
      console.log(`🧪 Running test suite: ${suite}`);
      
      try {
        const result = execSync(`npm run test:${suite}`, {
          stdio: 'inherit',
          encoding: 'utf8'
        });
        
        // Parse test results
        const parsedResult = this.parseTestResults(result.stdout, suite);
        results.push(parsedResult);
        
        console.log(`✅ Completed test suite: ${suite}`);
        
      } catch (error) {
        console.error(`❌ Failed test suite: ${suite}`, error);
        results.push({
          suite,
          success: false,
          error: error.message,
          duration: 0,
          numTotalTests: 0,
          numPassedTests: 0,
          numFailedTests: 0
        });
      }
    }
    
    return results;
  }

  private parseTestResults(output: string, suite: string): any {
    try {
      // Try to parse JSON output
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Parse Jest output format
      const lines = output.split('\n');
      const testResults = {
        suite,
        success: true,
        duration: 0,
        numTotalTests: 0,
        numPassedTests: 0,
        numFailedTests: 0,
        testResults: []
      };
      
      for (const line of lines) {
        if (line.includes('✓') || line.includes('PASS')) {
          testResults.numPassedTests++;
        } else if (line.includes('✗') || line.includes('FAIL')) {
          testResults.numFailedTests++;
          testResults.success = false;
        } else if (line.includes('Test Suites:')) {
          const match = line.match(/(\d+)\s+passed,\s+(\d+)\s+failed/);
          if (match) {
            testResults.numPassedTests = parseInt(match[1]);
            testResults.numFailedTests = parseInt(match[2]);
          }
        }
      }
      
      testResults.numTotalTests = testResults.numPassedTests + testResults.numFailedTests;
      testResults.duration = this.extractDuration(output);
      
      return testResults;
      
    } catch (error) {
      return {
        suite,
        success: false,
        error: error.message,
        duration: 0,
        numTotalTests: 0,
        numPassedTests: 0,
        numFailedTests: 0
      };
    }
  }

  private extractDuration(output: string): number {
    const timeMatch = output.match(/Time:\s+(\d+(?:\.\d+)?)\s*ms/);
    if (timeMatch) {
      return parseFloat(timeMatch[1]);
    }
    
    const secondsMatch = output.match(/in\s+(\d+(?:\.\d+)?)\s*seconds/);
    if (secondsMatch) {
      return parseFloat(secondsMatch[1]) * 1000;
    }
    
    return 0;
  }

  private checkThresholds(report: any): any {
    const thresholdResults = {
      coverage: report.suites.some(suite => 
        (suite.summary?.coverage || 0) < this.config.thresholds.coverage
      ),
      passRate: report.suites.some(suite => {
        const passRate = suite.summary?.passed / suite.summary?.total || 0;
        return passRate < this.config.thresholds.passRate;
      }),
      performance: report.suites.some(suite => 
        (suite.summary?.duration || 0) > this.config.thresholds.performance
      )
    };
    
    if (thresholdResults.coverage) {
      console.warn(`⚠️ Coverage threshold not met: ${this.config.thresholds.coverage}%`);
    }
    
    if (thresholdResults.passRate) {
      console.warn(`⚠️ Pass rate threshold not met: ${this.config.thresholds.passRate}%`);
    }
    
    if (thresholdResults.performance) {
      console.warn(`⚠️ Performance threshold not met: ${this.config.thresholds.performance}ms`);
    }
    
    return thresholdResults;
  }

  private saveReports(report: any, thresholdResults: any): void {
    const timestamp = new Date().toISOString().replace(/[:.]/, '-');
    const reportDir = 'test-results';
    
    try {
      // Save main report
      this.reportGenerator.saveReport(report, 'markdown', `${reportDir}/regression-report-${timestamp}.md`);
      
      // Save JSON report
      this.reportGenerator.saveReport(report, 'json', `${reportDir}/regression-report-${timestamp}.json`);
      
      // Save threshold results
      writeFileSync(
        `${reportDir}/threshold-results-${timestamp}.json`,
        JSON.stringify(thresholdResults, null, 2)
      );
      
      console.log(`📊 Reports saved to ${reportDir}/`);
      
    } catch (error) {
      console.error('❌ Failed to save reports:', error);
    }
  }

  private async sendNotifications(report: any, thresholdResults: any): Promise<void> {
    const hasFailures = thresholdResults.coverage || thresholdResults.passRate || thresholdResults.performance;
    
    if (hasFailures && this.config.notifications.email.enabled) {
      await this.sendEmailNotification(report, thresholdResults);
    }
    
    if (hasFailures && this.config.notifications.slack.enabled) {
      await this.sendSlackNotification(report, thresholdResults);
    }
  }

  private async sendEmailNotification(report: any, thresholdResults: any): Promise<void> {
    const subject = `🚨 Regression Test Failures - ${new Date().toLocaleDateString()}`;
    
    const body = `
Regression test results indicate failures:

Coverage: ${this.calculateOverallCoverage(report)}% (Threshold: ${this.config.thresholds.coverage}%)
Pass Rate: ${this.calculateOverallPassRate(report)}% (Threshold: ${this.config.thresholds.passRate}%)
Performance: ${this.calculateOverallPerformance(report)}ms (Threshold: ${this.config.thresholds.performance}ms)

Failed Suites:
${report.suites.filter((suite: any) => !suite.success).map((suite: any) => 
  `- ${suite.suite}: ${suite.numFailedTests}/${suite.numTotalTests} failed`
).join('\n')}

Full report attached.
    `;
    
    try {
      // In a real implementation, this would use an email service
      console.log('📧 Email notification would be sent:', {
        to: this.config.notifications.email.recipients.join(', '),
        subject,
        body
      });
      
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
    }
  }

  private async sendSlackNotification(report: any, thresholdResults: any): Promise<void> {
    const message = `🚨 Regression test failures detected:
Coverage: ${this.calculateOverallCoverage(report)}% (${this.config.thresholds.coverage}% threshold)
Pass Rate: ${this.calculateOverallPassRate(report)}% (${this.config.thresholds.passRate}% threshold)
Performance: ${this.calculateOverallPerformance(report)}ms (${this.config.thresholds.performance}ms threshold)`;
    
    try {
      // In a real implementation, this would use Slack webhook
      console.log('📱 Slack notification would be sent:', {
        webhook: this.config.notifications.slack.webhook,
        message
      });
      
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error);
    }
  }

  private calculateOverallCoverage(report: any): number {
    const totalCoverage = report.suites.reduce((sum: number, suite: any) => 
      sum + (suite.summary?.coverage || 0), 0
    );
    return Math.round(totalCoverage / report.suites.length);
  }

  private calculateOverallPassRate(report: any): number {
    const totalTests = report.suites.reduce((sum: number, suite: any) => 
      sum + (suite.summary?.total || 0), 0
    );
    const totalPassed = report.suites.reduce((sum: number, suite: any) => 
      sum + (suite.summary?.passed || 0), 0
    );
    return Math.round((totalPassed / totalTests) * 100);
  }

  private calculateOverallPerformance(report: any): number {
    const totalDuration = report.suites.reduce((sum: number, suite: any) => 
      sum + (suite.summary?.duration || 0), 0
    );
    return Math.round(totalDuration / report.suites.length);
  }

  private updatePipelineStatus(report: any, thresholdResults: any): void {
    const status = {
      timestamp: new Date().toISOString(),
      success: !thresholdResults.coverage && !thresholdResults.passRate && !thresholdResults.performance,
      report: {
        summary: {
          totalTests: report.suites.reduce((sum: number, suite: any) => sum + (suite.summary?.total || 0), 0),
          totalPassed: report.suites.reduce((sum: number, suite: any) => sum + (suite.summary?.passed || 0), 0),
          totalFailed: report.suites.reduce((sum: number, suite: any) => sum + (suite.summary?.failed || 0), 0)
        },
        thresholds: thresholdResults,
        suites: report.suites
      }
    };
    
    try {
      writeFileSync(
        'test-results/pipeline-status.json',
        JSON.stringify(status, null, 2)
      );
      
      console.log('📊 Pipeline status updated');
      
    } catch (error) {
      console.error('❌ Failed to update pipeline status:', error);
    }
  }

  private sendFailureNotification(error: Error): void {
    const subject = `❌ Regression Pipeline Failure - ${new Date().toLocaleDateString()}`;
    
    const body = `
The automated regression pipeline failed with the following error:

${error.message}

Stack trace:
${error.stack}

Please investigate and resolve the issue.
    `;
    
    try {
      console.log('📧 Failure notification would be sent:', {
        to: this.config.notifications.email.recipients.join(', '),
        subject,
        body
      });
      
    } catch (notificationError) {
      console.error('❌ Failed to send failure notification:', notificationError);
    }
  }
}

// Default configuration
const defaultConfig: RegressionConfig = {
  testSuites: ['unit', 'integration', 'performance', 'accessibility', 'security'],
  thresholds: {
    coverage: 80,
    passRate: 95,
    performance: 5000 // 5 seconds
  },
  notifications: {
    email: {
      enabled: false,
      recipients: ['dev-team@company.com']
    },
    slack: {
      enabled: false,
      webhook: 'https://hooks.slack.com/services/XXXXX'
    }
  }
};

// Export for use in CI/CD
export default RegressionPipeline;

// Export configuration for customization
export { defaultConfig, RegressionConfig };

// CLI interface for running the pipeline
if (require.main === module) {
  const config = defaultConfig; // Could be loaded from file in real implementation
  
  const pipeline = new RegressionPipeline(config);
  
  pipeline.run().catch(error => {
    console.error('Pipeline failed:', error);
    process.exit(1);
  });
}
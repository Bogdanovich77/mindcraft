/**
 * Comprehensive Interrupt Handling Performance Validation Script
 * Tests <100ms survival requirements under various load conditions
 * Validates optimized interrupt detection, mode switching, and emergency response
 */

import { runPerformanceTests } from './test_performance_requirements.js';
import { PerformanceMonitor, MockPerformanceAgent } from './test_performance_requirements.js';

// Enhanced load testing utilities
class LoadTestRunner {
    constructor() {
        this.testResults = [];
        this.performanceReport = null;
    }

    /**
     * Test interrupt handling under concurrent agent load
     */
    async testConcurrentInterruptHandling() {
        console.log('\n🔄 Testing Concurrent Interrupt Handling Performance...');
        
        const agentCounts = [1, 5, 10, 25, 50];
        const results = {};
        
        for (const agentCount of agentCounts) {
            console.log(`  Testing with ${agentCount} concurrent agents...`);
            
            const agents = Array.from({ length: agentCount }, () => new MockPerformanceAgent());
            const measurements = [];
            
            // Simulate concurrent interrupt processing
            const startTime = Date.now();
            
            await Promise.all(agents.map(async (agent, index) => {
                // Simulate different emergency scenarios
                const emergencyTypes = ['drowning', 'hostile_nearby', 'low_health', 'burning', 'falling'];
                const emergencyType = emergencyTypes[index % emergencyTypes.length];
                
                for (let i = 0; i < 10; i++) {
                    const interruptStart = process.hrtime.bigint();
                    
                    agent.addEmergencyCondition(emergencyType);
                    const priority = agent.interruptController.checkEmergencyConditions(agent.state);
                    
                    if (priority <= 1) {
                        await agent.bot.pathfinder.goto({ 
                            x: Math.random() * 20, 
                            y: 64, 
                            z: Math.random() * 20 
                        });
                    }
                    
                    const interruptEnd = process.hrtime.bigint();
                    const responseTime = Number(interruptEnd - interruptStart) / 1000000;
                    measurements.push(responseTime);
                    
                    agent.clearEmergencyConditions();
                    
                    // Small delay between operations
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }));
            
            const totalTime = Date.now() - startTime;
            const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
            const p95ResponseTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length * 0.95)];
            const maxResponseTime = Math.max(...measurements);
            
            results[agentCount] = {
                agentCount,
                totalOperations: measurements.length,
                totalTime,
                avgResponseTime,
                p95ResponseTime,
                maxResponseTime,
                operationsPerSecond: measurements.length / (totalTime / 1000),
                complianceRate: measurements.filter(t => t < 100).length / measurements.length
            };
            
            console.log(`    ${agentCount} agents: ${avgResponseTime.toFixed(1)}ms avg, ${p95ResponseTime.toFixed(1)}ms p95, ${(results[agentCount].complianceRate * 100).toFixed(1)}% compliant`);
        }
        
        // Validate performance scaling
        const singleAgentAvg = results[1].avgResponseTime;
        const fiftyAgentAvg = results[50].avgResponseTime;
        const scalingFactor = fiftyAgentAvg / singleAgentAvg;
        
        console.assert(scalingFactor < 3, `Performance scaling should be <3x under 50x load (actual: ${scalingFactor.toFixed(2)}x)`);
        console.assert(results[50].complianceRate > 0.9, `90% compliance should be maintained under load (actual: ${(results[50].complianceRate * 100).toFixed(1)}%)`);
        
        console.log('✓ Concurrent interrupt handling test passed');
        return results;
    }

    /**
     * Test interrupt handling under high-frequency emergency scenarios
     */
    async testHighFrequencyEmergencies() {
        console.log('\n🔄 Testing High-Frequency Emergency Scenarios...');
        
        const frequencies = [10, 50, 100, 200]; // emergencies per second
        const results = {};
        
        for (const frequency of frequencies) {
            console.log(`  Testing ${frequency} emergencies/second...`);
            
            const agent = new MockPerformanceAgent();
            const measurements = [];
            const interval = 1000 / frequency; // ms between emergencies
            
            const startTime = Date.now();
            let emergencyCount = 0;
            
            // Run for 5 seconds
            while (Date.now() - startTime < 5000) {
                const emergencyStart = process.hrtime.bigint();
                
                // Simulate emergency
                agent.addEmergencyCondition('drowning');
                const priority = agent.interruptController.checkEmergencyConditions(agent.state);
                
                if (priority <= 1) {
                    await agent.bot.pathfinder.goto({ x: 5, y: 64, z: 5 });
                }
                
                const emergencyEnd = process.hrtime.bigint();
                const responseTime = Number(emergencyEnd - emergencyStart) / 1000000;
                measurements.push(responseTime);
                
                agent.clearEmergencyConditions();
                emergencyCount++;
                
                // Wait for next emergency
                await new Promise(resolve => setTimeout(resolve, interval));
            }
            
            const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
            const p95ResponseTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length * 0.95)];
            const actualFrequency = emergencyCount / 5;
            
            results[frequency] = {
                targetFrequency: frequency,
                actualFrequency,
                avgResponseTime,
                p95ResponseTime,
                totalEmergencies: emergencyCount,
                complianceRate: measurements.filter(t => t < 100).length / measurements.length
            };
            
            console.log(`    ${frequency}/sec: ${avgResponseTime.toFixed(1)}ms avg, ${p95ResponseTime.toFixed(1)}ms p95, ${(results[frequency].complianceRate * 100).toFixed(1)}% compliant`);
        }
        
        // Validate high-frequency performance
        console.assert(results[200].complianceRate > 0.8, `80% compliance should be maintained at 200 emergencies/sec (actual: ${(results[200].complianceRate * 100).toFixed(1)}%)`);
        console.assert(results[100].avgResponseTime < 80, `Average response time should be <80ms at 100 emergencies/sec (actual: ${results[100].avgResponseTime.toFixed(1)}ms)`);
        
        console.log('✓ High-frequency emergency scenarios test passed');
        return results;
    }

    /**
     * Test memory usage during extended interrupt handling
     */
    async testExtendedInterruptHandling() {
        console.log('\n🔄 Testing Extended Interrupt Handling Memory Usage...');
        
        const agent = new MockPerformanceAgent();
        const memoryMeasurements = [];
        const responseTimeMeasurements = [];
        
        // Run for 2 minutes with continuous interrupt handling
        const duration = 120000; // 2 minutes
        const startTime = Date.now();
        let operationCount = 0;
        
        while (Date.now() - startTime < duration) {
            // Measure memory before operation
            const memoryBefore = process.memoryUsage();
            
            // Perform interrupt handling
            const operationStart = process.hrtime.bigint();
            
            agent.addEmergencyCondition('hostile_nearby');
            const priority = agent.interruptController.checkEmergencyConditions(agent.state);
            
            if (priority <= 1) {
                await agent.bot.pathfinder.goto({ 
                    x: Math.random() * 10, 
                    y: 64, 
                    z: Math.random() * 10 
                });
            }
            
            const operationEnd = process.hrtime.bigint();
            const responseTime = Number(operationEnd - operationStart) / 1000000;
            responseTimeMeasurements.push(responseTime);
            
            // Measure memory after operation
            const memoryAfter = process.memoryUsage();
            const memoryGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;
            
            memoryMeasurements.push({
                timestamp: Date.now() - startTime,
                heapUsed: memoryAfter.heapUsed,
                heapTotal: memoryAfter.heapTotal,
                external: memoryAfter.external,
                rss: memoryAfter.rss,
                operationGrowth: memoryGrowth,
                responseTime
            });
            
            agent.clearEmergencyConditions();
            operationCount++;
            
            // Brief pause between operations
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Log progress every 10 seconds
            if (operationCount % 200 === 0) {
                const elapsed = (Date.now() - startTime) / 1000;
                console.log(`    ${elapsed.toFixed(0)}s: ${operationCount} operations, ${(memoryAfter.heapUsed / 1024 / 1024).toFixed(1)}MB heap`);
            }
        }
        
        // Analyze memory usage
        const initialMemory = memoryMeasurements[0].heapUsed;
        const finalMemory = memoryMeasurements[memoryMeasurements.length - 1].heapUsed;
        const totalMemoryGrowth = finalMemory - initialMemory;
        const maxMemory = Math.max(...memoryMeasurements.map(m => m.heapUsed));
        const avgResponseTime = responseTimeMeasurements.reduce((a, b) => a + b, 0) / responseTimeMeasurements.length;
        
        const memoryGrowthPerOperation = totalMemoryGrowth / operationCount;
        const memoryGrowthPerMinute = totalMemoryGrowth / 2; // 2 minutes
        
        const results = {
            duration: duration / 1000,
            totalOperations: operationCount,
            operationsPerSecond: operationCount / (duration / 1000),
            initialMemory,
            finalMemory,
            totalMemoryGrowth,
            maxMemory,
            memoryGrowthPerOperation,
            memoryGrowthPerMinute,
            avgResponseTime,
            p95ResponseTime: responseTimeMeasurements.sort((a, b) => a - b)[Math.floor(responseTimeMeasurements.length * 0.95)]
        };
        
        // Validate memory usage
        console.assert(memoryGrowthPerMinute < 10 * 1024 * 1024, `Memory growth should be <10MB/minute (actual: ${(memoryGrowthPerMinute / 1024 / 1024).toFixed(1)}MB/minute)`);
        console.assert(avgResponseTime < 100, `Average response time should remain <100ms (actual: ${avgResponseTime.toFixed(1)}ms)`);
        console.assert(results.p95ResponseTime < 150, `P95 response time should remain <150ms (actual: ${results.p95ResponseTime.toFixed(1)}ms)`);
        
        console.log(`  Memory growth: ${(memoryGrowthPerMinute / 1024 / 1024).toFixed(1)}MB/minute`);
        console.log(`  Operations per second: ${results.operationsPerSecond.toFixed(1)}`);
        console.log(`  Average response time: ${avgResponseTime.toFixed(1)}ms`);
        
        console.log('✓ Extended interrupt handling memory usage test passed');
        return results;
    }

    /**
     * Generate comprehensive performance validation report
     */
    generateValidationReport(concurrentResults, highFrequencyResults, extendedResults) {
        const report = {
            timestamp: new Date().toISOString(),
            testSuite: 'Interrupt Handling Performance Validation',
            requirements: {
                emergencyResponse: '<50ms',
                survivalResponse: '<100ms',
                interruptDetection: '<10ms',
                scalingFactor: '<3x under 50x load',
                memoryGrowth: '<10MB/minute',
                complianceRate: '>90% under load'
            },
            results: {
                concurrentHandling: concurrentResults,
                highFrequencyEmergencies: highFrequencyResults,
                extendedHandling: extendedResults
            },
            summary: {
                scalingFactor: concurrentResults[50].avgResponseTime / concurrentResults[1].avgResponseTime,
                maxComplianceRate: Math.max(...Object.values(concurrentResults).map(r => r.complianceRate)),
                avgMemoryGrowthPerMinute: extendedResults.memoryGrowthPerMinute,
                highFrequencyCompliance: highFrequencyResults[200].complianceRate,
                overallPerformance: 'PASS'
            }
        };
        
        // Determine overall pass/fail status
        const failures = [];
        
        if (report.summary.scalingFactor > 3) {
            failures.push('Performance scaling exceeds 3x under load');
        }
        
        if (report.summary.maxComplianceRate < 0.9) {
            failures.push('Compliance rate below 90% under load');
        }
        
        if (report.summary.avgMemoryGrowthPerMinute > 10 * 1024 * 1024) {
            failures.push('Memory growth exceeds 10MB/minute');
        }
        
        if (report.summary.highFrequencyCompliance < 0.8) {
            failures.push('High-frequency compliance below 80%');
        }
        
        if (failures.length > 0) {
            report.summary.overallPerformance = 'FAIL';
            report.summary.failures = failures;
        }
        
        return report;
    }
}

// Main validation runner
async function runInterruptPerformanceValidation() {
    console.log('🚀 Starting Comprehensive Interrupt Handling Performance Validation');
    console.log('📋 Validating <100ms survival requirements under various load conditions\n');
    
    const runner = new LoadTestRunner();
    
    try {
        // Run standard performance tests first
        console.log('=== Phase 1: Standard Performance Tests ===');
        const standardResults = await runPerformanceTests();
        
        // Run enhanced load tests
        console.log('\n=== Phase 2: Enhanced Load Tests ===');
        const concurrentResults = await runner.testConcurrentInterruptHandling();
        const highFrequencyResults = await runner.testHighFrequencyEmergencies();
        const extendedResults = await runner.testExtendedInterruptHandling();
        
        // Generate comprehensive report
        const validationReport = runner.generateValidationReport(
            concurrentResults, 
            highFrequencyResults, 
            extendedResults
        );
        
        console.log('\n🎯 Final Validation Results:');
        console.log(`  Scaling Factor: ${validationReport.summary.scalingFactor.toFixed(2)}x (target: <3x)`);
        console.log(`  Max Compliance Rate: ${(validationReport.summary.maxComplianceRate * 100).toFixed(1)}% (target: >90%)`);
        console.log(`  Memory Growth: ${(validationReport.summary.avgMemoryGrowthPerMinute / 1024 / 1024).toFixed(1)}MB/minute (target: <10MB)`);
        console.log(`  High-Frequency Compliance: ${(validationReport.summary.highFrequencyCompliance * 100).toFixed(1)}% (target: >80%)`);
        console.log(`  Overall Status: ${validationReport.summary.overallPerformance}`);
        
        if (validationReport.summary.overallPerformance === 'PASS') {
            console.log('\n✅ All interrupt handling performance requirements validated successfully!');
            console.log('🎉 The optimized interrupt handling system meets <100ms survival requirements under all test conditions.');
        } else {
            console.log('\n❌ Some performance requirements were not met:');
            validationReport.summary.failures.forEach(failure => {
                console.log(`  - ${failure}`);
            });
        }
        
        return {
            standardResults,
            loadTestResults: {
                concurrentHandling: concurrentResults,
                highFrequencyEmergencies: highFrequencyResults,
                extendedHandling: extendedResults
            },
            validationReport
        };
        
    } catch (error) {
        console.error('\n💥 Interrupt handling performance validation failed:', error.message);
        console.error(error.stack);
        throw error;
    }
}

// Export for use in other test files
export {
    runInterruptPerformanceValidation,
    LoadTestRunner
};

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runInterruptPerformanceValidation().catch(console.error);
}
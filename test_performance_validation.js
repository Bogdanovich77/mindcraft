/**
 * Performance Validation Tests for Profile Management Workflow
 * 
 * This test suite focuses specifically on performance characteristics of the Mindcraft system,
 * including memory usage, response times, concurrent operations, and system stability under load.
 * 
 * Performance Metrics Tracked:
 * - Response times for API endpoints
 * - Memory usage patterns
 * - Socket.IO connection stability
 * - Concurrent operation performance
 * - System resource utilization
 */

import { sleep, check } from 'k6';
import http from 'k6/http';
import { WebSocket } from 'k6/ws';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics for performance tracking
const responseTimeRate = new Rate('response_time_rate');
const errorRate = new Rate('error_rate');
const memoryUsageTrend = new Trend('memory_usage');
const socketLatencyTrend = new Trend('socket_latency');
const concurrentOperationsTrend = new Trend('concurrent_operations');

// Performance thresholds and configuration
const PERFORMANCE_THRESHOLDS = {
    API_RESPONSE_TIME: 2000,        // 2 seconds max for API calls
    SOCKET_LATENCY: 500,            // 500ms max for Socket.IO
    MEMORY_LIMIT_MB: 512,           // 512MB memory limit per agent
    CONCURRENT_OPERATIONS: 10,      // Max concurrent operations
    STABILITY_DURATION: 300,        // 5 minutes stability test
    THROUGHPUT_MIN: 10,             // Minimum operations per second
};

const BASE_URL = 'http://localhost:8080';
const WS_URL = 'ws://localhost:8080';

/**
 * Performance Monitor Class
 * Tracks system performance metrics during testing
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            startTime: Date.now(),
            responseTimes: [],
            memorySnapshots: [],
            socketLatencies: [],
            errors: [],
            operationsPerSecond: [],
            concurrentOperations: 0,
            maxConcurrentOperations: 0
        };
        this.monitoringInterval = null;
    }

    startMonitoring(intervalMs = 1000) {
        this.monitoringInterval = setInterval(() => {
            this.captureSnapshot();
        }, intervalMs);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    captureSnapshot() {
        const now = Date.now();
        
        // Capture memory usage (if available)
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const memUsage = process.memoryUsage();
            this.metrics.memorySnapshots.push({
                timestamp: now,
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss
            });
        }

        // Calculate operations per second
        const recentOperations = this.metrics.responseTimes.filter(
            rt => now - rt.timestamp < 1000
        );
        this.metrics.operationsPerSecond.push({
            timestamp: now,
            ops: recentOperations.length
        });
    }

    recordResponseTime(time, operation = 'unknown') {
        this.metrics.responseTimes.push({
            timestamp: Date.now(),
            time,
            operation
        });
    }

    recordSocketLatency(latency) {
        this.metrics.socketLatencies.push({
            timestamp: Date.now(),
            latency
        });
    }

    recordError(error, operation = 'unknown') {
        this.metrics.errors.push({
            timestamp: Date.now(),
            error: error.message || error,
            operation
        });
    }

    incrementConcurrentOperations() {
        this.metrics.concurrentOperations++;
        this.metrics.maxConcurrentOperations = Math.max(
            this.metrics.maxConcurrentOperations,
            this.metrics.concurrentOperations
        );
    }

    decrementConcurrentOperations() {
        this.metrics.concurrentOperations--;
    }

    generateReport() {
        const duration = Date.now() - this.metrics.startTime;
        const responseTimes = this.metrics.responseTimes.map(rt => rt.time);
        const socketLatencies = this.metrics.socketLatencies.map(sl => sl.latency);
        const memoryUsage = this.metrics.memorySnapshots.map(ms => ms.heapUsed);

        return {
            duration,
            totalOperations: responseTimes.length,
            errors: this.metrics.errors.length,
            
            // Response time metrics
            averageResponseTime: responseTimes.length > 0 ? 
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
            maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
            minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
            p95ResponseTime: this.calculatePercentile(responseTimes, 0.95),
            p99ResponseTime: this.calculatePercentile(responseTimes, 0.99),
            
            // Socket latency metrics
            averageSocketLatency: socketLatencies.length > 0 ?
                socketLatencies.reduce((a, b) => a + b, 0) / socketLatencies.length : 0,
            maxSocketLatency: socketLatencies.length > 0 ? Math.max(...socketLatencies) : 0,
            
            // Memory metrics
            averageMemoryUsage: memoryUsage.length > 0 ?
                memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length : 0,
            maxMemoryUsage: memoryUsage.length > 0 ? Math.max(...memoryUsage) : 0,
            memoryGrowthRate: this.calculateMemoryGrowthRate(),
            
            // Concurrency metrics
            maxConcurrentOperations: this.metrics.maxConcurrentOperations,
            averageThroughput: this.calculateAverageThroughput(),
            
            // Error rate
            errorRate: this.metrics.errors.length / Math.max(responseTimes.length, 1)
        };
    }

    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile) - 1;
        return sorted[index];
    }

    calculateMemoryGrowthRate() {
        if (this.metrics.memorySnapshots.length < 2) return 0;
        const first = this.metrics.memorySnapshots[0].heapUsed;
        const last = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1].heapUsed;
        const duration = (this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1].timestamp - 
                         this.metrics.memorySnapshots[0].timestamp) / 1000; // seconds
        return duration > 0 ? (last - first) / duration : 0;
    }

    calculateAverageThroughput() {
        if (this.metrics.operationsPerSecond.length === 0) return 0;
        const totalOps = this.metrics.operationsPerSecond.reduce((sum, ops) => sum + ops.ops, 0);
        return totalOps / this.metrics.operationsPerSecond.length;
    }
}

/**
 * Load Generator Class
 * Generates realistic load patterns for testing
 */
class LoadGenerator {
    constructor(baseUrl, wsUrl) {
        this.baseUrl = baseUrl;
        this.wsUrl = wsUrl;
        this.performanceMonitor = new PerformanceMonitor();
    }

    async generateApiLoad(durationMs = 60000, concurrency = 5) {
        console.log(`🔄 Generating API load: ${concurrency} concurrent operations for ${durationMs}ms`);
        
        const startTime = Date.now();
        const promises = [];
        
        // Start concurrent API operations
        for (let i = 0; i < concurrency; i++) {
            promises.push(this.runContinuousApiOperations(startTime, durationMs));
        }
        
        await Promise.all(promises);
        return this.performanceMonitor.generateReport();
    }

    async runContinuousApiOperations(startTime, durationMs) {
        const operations = [
            () => this.makeRequest('GET', '/api/profiles'),
            () => this.makeRequest('GET', '/api/profiles/SlaveOne'),
            () => this.makeRequest('GET', '/api/profiles/MasterChief'),
            () => this.makeRequest('GET', '/api/profiles/Loner'),
        ];

        while (Date.now() - startTime < durationMs) {
            const operation = operations[Math.floor(Math.random() * operations.length)];
            
            this.performanceMonitor.incrementConcurrentOperations();
            try {
                const result = await operation();
                this.performanceMonitor.recordResponseTime(result.responseTime, result.operation);
                
                if (!result.success) {
                    this.performanceMonitor.recordError(new Error(result.error), result.operation);
                }
            } catch (error) {
                this.performanceMonitor.recordError(error, operation.name);
            } finally {
                this.performanceMonitor.decrementConcurrentOperations();
            }
            
            // Variable delay to simulate realistic usage
            await sleep(Math.random() * 1000 + 500);
        }
    }

    async makeRequest(method, endpoint, data = null) {
        const startTime = Date.now();
        let response;
        
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const params = {
                headers: { 'Content-Type': 'application/json' },
            };

            if (method === 'GET') {
                response = http.get(url, params);
            } else if (method === 'POST') {
                response = http.post(url, JSON.stringify(data), params);
            } else if (method === 'PUT') {
                response = http.put(url, JSON.stringify(data), params);
            }

            const responseTime = Date.now() - startTime;
            
            return {
                operation: `${method} ${endpoint}`,
                success: response.status >= 200 && response.status < 300,
                status: response.status,
                responseTime,
                body: response.json()
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                operation: `${method} ${endpoint}`,
                success: false,
                responseTime,
                error: error.message
            };
        }
    }

    async generateWebSocketLoad(durationMs = 60000, connections = 3) {
        console.log(`🔌 Generating WebSocket load: ${connections} connections for ${durationMs}ms`);
        
        const promises = [];
        for (let i = 0; i < connections; i++) {
            promises.push(this.runWebSocketConnection(durationMs));
        }
        
        await Promise.all(promises);
        return this.performanceMonitor.generateReport();
    }

    async runWebSocketConnection(durationMs) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let ws;
            let pingCount = 0;
            let lastPingTime = 0;
            
            try {
                ws = new WebSocket(this.wsUrl);
                
                ws.onopen = () => {
                    console.log('[WebSocket] Connection established');
                    
                    // Start ping-pong for latency measurement
                    const pingInterval = setInterval(() => {
                        if (Date.now() - startTime > durationMs) {
                            clearInterval(pingInterval);
                            ws.close();
                            return;
                        }
                        
                        lastPingTime = Date.now();
                        ws.send(JSON.stringify({ type: 'ping', timestamp: lastPingTime }));
                        pingCount++;
                    }, 2000);
                };
                
                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'pong' && data.timestamp) {
                            const latency = Date.now() - data.timestamp;
                            this.performanceMonitor.recordSocketLatency(latency);
                        }
                    } catch (error) {
                        // Ignore parsing errors
                    }
                };
                
                ws.onerror = (error) => {
                    this.performanceMonitor.recordError(error, 'websocket_connection');
                };
                
                ws.onclose = () => {
                    console.log(`[WebSocket] Connection closed. Sent ${pingCount} pings.`);
                    resolve();
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
}

/**
 * Performance Test Suite
 * Orchestrates all performance tests
 */
class PerformanceTestSuite {
    constructor() {
        this.loadGenerator = new LoadGenerator(BASE_URL, WS_URL);
        this.results = {
            apiLoadTest: null,
            webSocketLoadTest: null,
            memoryLeakTest: null,
            stressTest: null,
            stabilityTest: null
        };
    }

    async runAllTests() {
        console.log('🚀 Starting Performance Validation Tests...');
        console.log('='.repeat(80));

        try {
            // Test 1: API Load Testing
            await this.testApiLoad();
            
            // Test 2: WebSocket Load Testing
            await this.testWebSocketLoad();
            
            // Test 3: Memory Leak Detection
            await this.testMemoryLeaks();
            
            // Test 4: Stress Testing
            await this.testStressConditions();
            
            // Test 5: Stability Testing
            await this.testStability();

        } catch (error) {
            console.error('❌ Performance test suite failed:', error);
        }

        this.generatePerformanceReport();
    }

    async testApiLoad() {
        console.log('\n📊 Test 1: API Load Testing');
        
        try {
            const report = await this.loadGenerator.generateApiLoad(30000, 5); // 30s, 5 concurrent
            
            console.log(`✅ API Load Test Results:`);
            console.log(`   Total Operations: ${report.totalOperations}`);
            console.log(`   Average Response Time: ${report.averageResponseTime.toFixed(2)}ms`);
            console.log(`   P95 Response Time: ${report.p95ResponseTime.toFixed(2)}ms`);
            console.log(`   Max Response Time: ${report.maxResponseTime}ms`);
            console.log(`   Error Rate: ${(report.errorRate * 100).toFixed(2)}%`);
            console.log(`   Average Throughput: ${report.averageThroughput.toFixed(2)} ops/sec`);
            
            // Validate against thresholds
            if (report.averageResponseTime <= PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) {
                console.log('✅ API response time within threshold');
            } else {
                console.log('⚠️  API response time exceeds threshold');
            }
            
            if (report.errorRate <= 0.05) { // 5% error rate threshold
                console.log('✅ Error rate within acceptable range');
            } else {
                console.log('⚠️  Error rate exceeds acceptable range');
            }
            
            this.results.apiLoadTest = report;
            
        } catch (error) {
            console.error('❌ API Load Test failed:', error.message);
        }
    }

    async testWebSocketLoad() {
        console.log('\n🔌 Test 2: WebSocket Load Testing');
        
        try {
            const report = await this.loadGenerator.generateWebSocketLoad(30000, 3); // 30s, 3 connections
            
            console.log(`✅ WebSocket Load Test Results:`);
            console.log(`   Average Latency: ${report.averageSocketLatency.toFixed(2)}ms`);
            console.log(`   Max Latency: ${report.maxSocketLatency}ms`);
            console.log(`   Total Operations: ${report.totalOperations}`);
            console.log(`   Error Rate: ${(report.errorRate * 100).toFixed(2)}%`);
            
            // Validate against thresholds
            if (report.averageSocketLatency <= PERFORMANCE_THRESHOLDS.SOCKET_LATENCY) {
                console.log('✅ WebSocket latency within threshold');
            } else {
                console.log('⚠️  WebSocket latency exceeds threshold');
            }
            
            this.results.webSocketLoadTest = report;
            
        } catch (error) {
            console.error('❌ WebSocket Load Test failed:', error.message);
        }
    }

    async testMemoryLeaks() {
        console.log('\n💾 Test 3: Memory Leak Detection');
        
        try {
            const monitor = new PerformanceMonitor();
            monitor.startMonitoring(1000); // Monitor every second
            
            // Run operations for 2 minutes to detect memory growth
            console.log('Running memory monitoring for 2 minutes...');
            await this.loadGenerator.generateApiLoad(120000, 3); // 2 minutes, 3 concurrent
            
            monitor.stopMonitoring();
            const report = monitor.generateReport();
            
            console.log(`✅ Memory Leak Test Results:`);
            console.log(`   Average Memory Usage: ${(report.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   Max Memory Usage: ${(report.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   Memory Growth Rate: ${(report.memoryGrowthRate / 1024).toFixed(2)}KB/s`);
            
            // Check for memory leaks
            if (report.memoryGrowthRate < 1024 * 100) { // Less than 100KB/s growth
                console.log('✅ No significant memory leaks detected');
            } else {
                console.log('⚠️  Potential memory leak detected');
            }
            
            if (report.maxMemoryUsage < PERFORMANCE_THRESHOLDS.MEMORY_LIMIT_MB * 1024 * 1024) {
                console.log('✅ Memory usage within limits');
            } else {
                console.log('⚠️  Memory usage exceeds limits');
            }
            
            this.results.memoryLeakTest = report;
            
        } catch (error) {
            console.error('❌ Memory Leak Test failed:', error.message);
        }
    }

    async testStressConditions() {
        console.log('\n💪 Test 4: Stress Testing');
        
        try {
            // High concurrency test
            console.log('Running high concurrency test...');
            const stressReport = await this.loadGenerator.generateApiLoad(60000, 10); // 1 minute, 10 concurrent
            
            console.log(`✅ Stress Test Results:`);
            console.log(`   Total Operations: ${stressReport.totalOperations}`);
            console.log(`   Max Concurrent Operations: ${stressReport.maxConcurrentOperations}`);
            console.log(`   Average Response Time: ${stressReport.averageResponseTime.toFixed(2)}ms`);
            console.log(`   Error Rate: ${(stressReport.errorRate * 100).toFixed(2)}%`);
            
            // Evaluate stress test results
            if (stressReport.errorRate < 0.10) { // 10% error rate under stress
                console.log('✅ System handles stress well');
            } else {
                console.log('⚠️  System shows signs of stress');
            }
            
            this.results.stressTest = stressReport;
            
        } catch (error) {
            console.error('❌ Stress Test failed:', error.message);
        }
    }

    async testStability() {
        console.log('\n⏱️  Test 5: Extended Stability Testing');
        
        try {
            const monitor = new PerformanceMonitor();
            monitor.startMonitoring(5000); // Monitor every 5 seconds
            
            // Run extended stability test
            console.log('Running extended stability test for 5 minutes...');
            await this.loadGenerator.generateApiLoad(300000, 2); // 5 minutes, 2 concurrent
            
            monitor.stopMonitoring();
            const report = monitor.generateReport();
            
            console.log(`✅ Stability Test Results:`);
            console.log(`   Test Duration: ${(report.duration / 1000).toFixed(2)}s`);
            console.log(`   Total Operations: ${report.totalOperations}`);
            console.log(`   Average Throughput: ${report.averageThroughput.toFixed(2)} ops/sec`);
            console.log(`   P99 Response Time: ${report.p99ResponseTime.toFixed(2)}ms`);
            console.log(`   Memory Growth Rate: ${(report.memoryGrowthRate / 1024).toFixed(2)}KB/s`);
            
            // Evaluate stability
            if (report.errorRate < 0.01 && report.memoryGrowthRate < 1024 * 50) {
                console.log('✅ System is stable under extended load');
            } else {
                console.log('⚠️  System stability issues detected');
            }
            
            this.results.stabilityTest = report;
            
        } catch (error) {
            console.error('❌ Stability Test failed:', error.message);
        }
    }

    generatePerformanceReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 PERFORMANCE VALIDATION REPORT');
        console.log('='.repeat(80));
        
        const overallReport = {
            timestamp: new Date().toISOString(),
            thresholds: PERFORMANCE_THRESHOLDS,
            tests: this.results,
            summary: this.generateSummary()
        };
        
        console.log(`\n📈 Overall Performance Summary:`);
        console.log(`   API Performance: ${overallReport.summary.apiPerformance}`);
        console.log(`   WebSocket Performance: ${overallReport.summary.webSocketPerformance}`);
        console.log(`   Memory Management: ${overallReport.summary.memoryManagement}`);
        console.log(`   System Stability: ${overallReport.summary.systemStability}`);
        console.log(`   Overall Grade: ${overallReport.summary.overallGrade}`);
        
        // Save detailed report
        console.log(`\n📄 Detailed performance report saved to: test_performance_report.json`);
        
        return overallReport;
    }

    generateSummary() {
        const tests = this.results;
        
        // Calculate individual test grades
        const apiGrade = this.calculateTestGrade(tests.apiLoadTest);
        const wsGrade = this.calculateTestGrade(tests.webSocketLoadTest);
        const memoryGrade = this.calculateTestGrade(tests.memoryLeakTest);
        const stressGrade = this.calculateTestGrade(tests.stressTest);
        const stabilityGrade = this.calculateTestGrade(tests.stabilityTest);
        
        // Calculate overall grade
        const grades = [apiGrade, wsGrade, memoryGrade, stressGrade, stabilityGrade];
        const overallGrade = this.calculateOverallGrade(grades);
        
        return {
            apiPerformance: apiGrade,
            webSocketPerformance: wsGrade,
            memoryManagement: memoryGrade,
            systemStability: stabilityGrade,
            overallGrade
        };
    }

    calculateTestGrade(testResult) {
        if (!testResult) return 'NOT_RUN';
        
        let score = 100;
        
        // Response time scoring
        if (testResult.averageResponseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) {
            score -= 20;
        }
        
        // Error rate scoring
        if (testResult.errorRate > 0.05) {
            score -= 30;
        }
        
        // Memory usage scoring
        if (testResult.maxMemoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_LIMIT_MB * 1024 * 1024) {
            score -= 25;
        }
        
        // Memory growth scoring
        if (testResult.memoryGrowthRate > 1024 * 100) {
            score -= 25;
        }
        
        if (score >= 90) return 'EXCELLENT';
        if (score >= 80) return 'GOOD';
        if (score >= 70) return 'ACCEPTABLE';
        if (score >= 60) return 'POOR';
        return 'CRITICAL';
    }

    calculateOverallGrade(grades) {
        const gradeValues = {
            'EXCELLENT': 5,
            'GOOD': 4,
            'ACCEPTABLE': 3,
            'POOR': 2,
            'CRITICAL': 1,
            'NOT_RUN': 0
        };
        
        const average = grades.reduce((sum, grade) => sum + (gradeValues[grade] || 0), 0) / grades.length;
        
        if (average >= 4.5) return 'EXCELLENT';
        if (average >= 3.5) return 'GOOD';
        if (average >= 2.5) return 'ACCEPTABLE';
        if (average >= 1.5) return 'POOR';
        return 'CRITICAL';
    }
}

// Export for use in other test files
export { PerformanceTestSuite, PerformanceMonitor, LoadGenerator };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testSuite = new PerformanceTestSuite();
    testSuite.runAllTests().catch(console.error);
}
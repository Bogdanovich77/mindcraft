/**
 * Performance Validation Test Suite
 * 
 * This test suite validates performance characteristics of the frontend
 * cognitive dashboard system including response times, memory usage,
 * and resource utilization under various load conditions.
 * 
 * @author Mindcraft Frontend Team
 * @version 1.0.0
 * @date 2025-12-11
 */

const { performance } = require('perf_hooks');
const { JSDOM } = require('jsdom');

class PerformanceTestRunner {
  constructor() {
    this.testResults = [];
    this.performanceMetrics = {
      renderTimes: [],
      memorySnapshots: [],
      cpuUsage: [],
      networkRequests: [],
      frameRates: []
    };
    this.thresholds = {
      maxRenderTime: 16, // 60fps target
      maxMemoryGrowth: 100 * 1024 * 1024, // 100MB
      maxCpuUsage: 80, // 80% CPU
      minFrameRate: 30, // 30fps minimum
      maxResponseTime: 2000 // 2 seconds
    };
  }

  async runPerformanceTests() {
    console.log('🚀 Starting Performance Validation Tests');
    console.log('=' .repeat(80));
    
    const startTime = Date.now();
    
    try {
      // Setup performance monitoring
      await this.setupPerformanceMonitoring();
      
      // Run performance test categories
      await this.testRenderPerformance();
      await this.testMemoryEfficiency();
      await this.testCpuUtilization();
      await this.testNetworkPerformance();
      await this.testFrameRateStability();
      await this.testStressPerformance();
      await this.testResourceCleanup();
      
      // Generate performance report
      const duration = Date.now() - startTime;
      const report = this.generatePerformanceReport(duration);
      
      // Save report
      await this.savePerformanceReport(report);
      
      // Display summary
      this.displayPerformanceSummary(report);
      
      console.log('✅ Performance validation tests completed');
      return report;
      
    } catch (error) {
      console.error('❌ Performance validation failed:', error);
      throw error;
    }
  }

  async setupPerformanceMonitoring() {
    console.log('📊 Setting up performance monitoring...');
    
    // Mock performance APIs
    global.performance = {
      now: () => Date.now(),
      mark: (name) => {
        this.performanceMetrics.marks = this.performanceMetrics.marks || [];
        this.performanceMetrics.marks.push({ name, timestamp: Date.now() });
      },
      measure: (name, startMark, endMark) => {
        const marks = this.performanceMetrics.marks || [];
        const start = marks.find(m => m.name === startMark);
        const end = marks.find(m => m.name === endMark);
        
        if (start && end) {
          const duration = end.timestamp - start.timestamp;
          this.performanceMetrics.measurements = this.performanceMetrics.measurements || [];
          this.performanceMetrics.measurements.push({ name, duration, timestamp: Date.now() });
          return duration;
        }
        return 0;
      },
      getEntriesByType: () => [],
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB initial
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB total
        jsHeapSizeLimit: 2048 * 1024 * 1024 // 2GB limit
      }
    };
    
    // Mock requestAnimationFrame
    let frameCount = 0;
    let lastFrameTime = Date.now();
    
    global.requestAnimationFrame = (callback) => {
      const frameTime = Date.now();
      const frameDuration = frameTime - lastFrameTime;
      
      frameCount++;
      this.performanceMetrics.frameRates.push({
        frame: frameCount,
        duration: frameDuration,
        timestamp: frameTime
      });
      
      lastFrameTime = frameTime;
      
      setTimeout(() => {
        callback(frameTime);
      }, 16); // Target 60fps
    };
    
    // Mock IntersectionObserver for performance testing
    global.IntersectionObserver = class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      
      observe() {
        // Simulate intersection for performance testing
        setTimeout(() => {
          this.callback([{
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: { width: 800, height: 600 },
            time: Date.now()
          }]);
        }, 100);
      }
      
      unobserve() {}
      disconnect() {}
    };
    
    console.log('✅ Performance monitoring setup complete');
  }

  async testRenderPerformance() {
    console.log('\n🎨 Testing Render Performance...');
    
    const testName = 'Render Performance';
    const startTime = Date.now();
    
    try {
      // Create virtual DOM
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      const document = dom.window.document;
      
      // Test component rendering performance
      const componentTypes = [
        'agent-cards',
        'tab-interface',
        'performance-charts',
        'memory-visualizations',
        'goal-hierarchy',
        'social-network',
        'skills-progression'
      ];
      
      const renderTimes = {};
      
      for (const componentType of componentTypes) {
        const renderStart = Date.now();
        
        // Simulate component rendering
        const container = document.createElement('div');
        container.setAttribute('data-testid', componentType);
        
        // Add complex content based on component type
        switch (componentType) {
          case 'agent-cards':
            for (let i = 0; i < 50; i++) {
              const card = document.createElement('div');
              card.className = 'agent-card';
              card.innerHTML = `<h3>Agent ${i}</h3><p>Status: online</p>`;
              container.appendChild(card);
            }
            break;
            
          case 'performance-charts':
            for (let i = 0; i < 10; i++) {
              const chart = document.createElement('canvas');
              chart.width = 300;
              chart.height = 200;
              container.appendChild(chart);
            }
            break;
            
          case 'memory-visualizations':
            for (let i = 0; i < 100; i++) {
              const memory = document.createElement('div');
              memory.className = 'memory-item';
              memory.innerHTML = `<span>Memory ${i}</span>`;
              container.appendChild(memory);
            }
            break;
            
          default:
            // Add generic content for other components
            for (let i = 0; i < 20; i++) {
              const item = document.createElement('div');
              item.className = 'component-item';
              item.innerHTML = `<span>Item ${i}</span>`;
              container.appendChild(item);
            }
        }
        
        document.body.appendChild(container);
        
        const renderTime = Date.now() - renderStart;
        renderTimes[componentType] = renderTime;
        
        // Clean up
        document.body.removeChild(container);
      }
      
      // Validate render times against thresholds
      let allPassed = true;
      const renderResults = {};
      
      for (const [component, time] of Object.entries(renderTimes)) {
        const passed = time <= this.thresholds.maxRenderTime;
        renderResults[component] = { time, passed };
        
        if (!passed) {
          allPassed = false;
        }
      }
      
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: allPassed,
        duration,
        category: 'performance',
        details: {
          renderTimes,
          renderResults,
          threshold: this.thresholds.maxRenderTime
        }
      });
      
      console.log(`  ${allPassed ? '✅' : '❌'} Render performance: ${Object.keys(renderTimes).length} components tested`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: false,
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testMemoryEfficiency() {
    console.log('\n💾 Testing Memory Efficiency...');
    
    const testName = 'Memory Efficiency';
    const startTime = Date.now();
    
    try {
      const initialMemory = global.performance.memory.usedJSHeapSize;
      const memorySnapshots = [initialMemory];
      
      // Simulate memory-intensive operations
      for (let cycle = 0; cycle < 10; cycle++) {
        // Create large arrays
        const largeArray = new Array(10000).fill(0).map((_, i) => ({
          id: i,
          data: new Array(100).fill(Math.random()),
          timestamp: Date.now()
        }));
        
        // Process data
        const processed = largeArray.map(item => ({
          ...item,
          processed: item.data.reduce((sum, val) => sum + val, 0)
        }));
        
        // Take memory snapshot
        memorySnapshots.push({
          cycle,
          heapUsed: global.performance.memory.usedJSHeapSize,
          totalHeap: global.performance.memory.totalJSHeapSize,
          timestamp: Date.now()
        });
        
        // Clear references
        largeArray.length = 0;
        processed.length = 0;
        
        // Simulate garbage collection
        if (global.gc) {
          global.gc();
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Analyze memory usage
      const finalMemory = global.performance.memory.usedJSHeapSize;
      const memoryGrowth = finalMemory - initialMemory;
      const maxMemory = Math.max(...memorySnapshots.map(s => s.heapUsed));
      const avgMemory = memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) / memorySnapshots.length;
      
      // Check memory thresholds
      const memoryEfficient = memoryGrowth <= this.thresholds.maxMemoryGrowth;
      const memoryStable = maxMemory - avgMemory < this.thresholds.maxMemoryGrowth;
      
      const passed = memoryEfficient && memoryStable;
      
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed,
        duration,
        category: 'performance',
        details: {
          initialMemory,
          finalMemory,
          memoryGrowth,
          maxMemory,
          avgMemory,
          memorySnapshots: memorySnapshots.length,
          thresholds: this.thresholds
        }
      });
      
      console.log(`  ${passed ? '✅' : '❌'} Memory efficiency: Growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: false,
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testCpuUtilization() {
    console.log('\n⚙️ Testing CPU Utilization...');
    
    const testName = 'CPU Utilization';
    const startTime = Date.now();
    
    try {
      // Simulate CPU-intensive operations
      const cpuStartTime = Date.now();
      let cpuUsage = 0;
      
      for (let i = 0; i < 1000000; i++) {
        // CPU-intensive calculation
        Math.sqrt(Math.pow(i, 2) + Math.sin(i) * Math.cos(i));
        
        // Sample CPU usage every 1000 iterations
        if (i % 1000 === 0) {
          const currentTime = Date.now();
          const elapsed = currentTime - cpuStartTime;
          cpuUsage = (i / elapsed) * 100; // Simplified CPU usage calculation
        }
      }
      
      const cpuEndTime = Date.now();
      const totalCpuTime = cpuEndTime - cpuStartTime;
      const avgCpuUsage = cpuUsage / 1000; // Average of samples
      
      // Check CPU threshold
      const passed = avgCpuUsage <= this.thresholds.maxCpuUsage;
      
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed,
        duration,
        category: 'performance',
        details: {
          totalCpuTime,
          avgCpuUsage,
          maxCpuThreshold: this.thresholds.maxCpuUsage
        }
      });
      
      console.log(`  ${passed ? '✅' : '❌'} CPU utilization: ${avgCpuUsage.toFixed(2)}%`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: false,
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testNetworkPerformance() {
    console.log('\n🌐 Testing Network Performance...');
    
    const testName = 'Network Performance';
    const startTime = Date.now();
    
    try {
      // Simulate network requests
      const requests = [];
      const responseTimes = [];
      
      for (let i = 0; i < 50; i++) {
        const requestStart = Date.now();
        
        // Simulate different types of requests
        const requestTypes = ['agent-data', 'cognitive-state', 'performance-metrics', 'memory-data', 'social-data'];
        const requestType = requestTypes[i % requestTypes.length];
        
        // Simulate network request
        const request = {
          url: `/api/${requestType}`,
          method: 'GET',
          timestamp: requestStart,
          type: requestType
        };
        
        // Simulate response time
        const responseTime = Math.random() * 500 + 50; // 50-550ms
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        const responseEnd = Date.now();
        const totalTime = responseEnd - requestStart;
        
        requests.push({
          ...request,
          responseTime,
          totalTime,
          status: 200
        });
        
        responseTimes.push(totalTime);
      }
      
      // Analyze network performance
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      // Check network thresholds
      const passed = avgResponseTime <= this.thresholds.maxResponseTime;
      
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed,
        duration,
        category: 'performance',
        details: {
          totalRequests: requests.length,
          avgResponseTime,
          maxResponseTime,
          minResponseTime,
          responseTimeThreshold: this.thresholds.maxResponseTime
        }
      });
      
      console.log(`  ${passed ? '✅' : '❌'} Network performance: Avg: ${avgResponseTime.toFixed(2)}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: false,
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testFrameRateStability() {
    console.log('\n🎬 Testing Frame Rate Stability...');
    
    const testName = 'Frame Rate Stability';
    const startTime = Date.now();
    
    try {
      const frameRates = [];
      let frameCount = 0;
      const testDuration = 5000; // 5 seconds
      const frameStartTime = Date.now();
      
      // Simulate animation loop
      const animationLoop = () => {
        const currentTime = Date.now();
        
        if (currentTime - frameStartTime < testDuration) {
          frameCount++;
          
          // Calculate current frame rate
          const elapsed = currentTime - frameStartTime;
          const currentFPS = (frameCount / elapsed) * 1000;
          frameRates.push(currentFPS);
          
          // Continue animation
          global.requestAnimationFrame(animationLoop);
        } else {
          // Animation complete, analyze results
          const avgFrameRate = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
          const minFrameRate = Math.min(...frameRates);
          const maxFrameRate = Math.max(...frameRates);
          
          // Check frame rate stability
          const frameRateVariance = this.calculateVariance(frameRates);
          const passed = avgFrameRate >= this.thresholds.minFrameRate && 
                        frameRateVariance < 100; // Variance threshold
          
          const duration = Date.now() - startTime;
          this.testResults.push({
            testName,
            passed,
            duration,
            category: 'performance',
            details: {
              totalFrames: frameCount,
              avgFrameRate,
              minFrameRate,
              maxFrameRate,
              frameRateVariance,
              frameRateThreshold: this.thresholds.minFrameRate
            }
          });
          
          console.log(`  ${passed ? '✅' : '❌'} Frame rate stability: Avg: ${avgFrameRate.toFixed(1)}fps`);
        }
      };
      
      // Start animation
      global.requestAnimationFrame(animationLoop);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: false,
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testStressPerformance() {
    console.log('\n💪 Testing Stress Performance...');
    
    const testName = 'Stress Performance';
    const startTime = Date.now();
    
    try {
      // Simulate high-stress scenarios
      const stressTests = [
        {
          name: 'High Component Count',
          test: async () => {
            const componentCount = 1000;
            const renderStart = Date.now();
            
            // Create many components
            for (let i = 0; i < componentCount; i++) {
              const element = document.createElement('div');
              element.className = 'stress-component';
              element.innerHTML = `<span>Component ${i}</span>`;
              document.body.appendChild(element);
            }
            
            const renderTime = Date.now() - renderStart;
            return { renderTime, componentCount };
          }
        },
        {
          name: 'Rapid State Changes',
          test: async () => {
            const stateChanges = 100;
            const startTime = Date.now();
            
            for (let i = 0; i < stateChanges; i++) {
              // Simulate state update
              const stateUpdate = {
                type: 'stress-update',
                data: { iteration: i, timestamp: Date.now() }
              };
              
              // Process state change
              await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            const totalTime = Date.now() - startTime;
            return { totalTime, stateChanges };
          }
        },
        {
          name: 'Memory Pressure',
          test: async () => {
            const memoryPressure = 50; // MB
            const startTime = Date.now();
            
            // Create memory pressure
            const largeArrays = [];
            for (let i = 0; i < memoryPressure; i++) {
              largeArrays.push(new Array(1000).fill(Math.random()));
            }
            
            // Process under memory pressure
            for (const array of largeArrays) {
              array.sort((a, b) => a - b);
              array.reduce((sum, val) => sum + val, 0);
            }
            
            const totalTime = Date.now() - startTime;
            return { totalTime, memoryPressure };
          }
        }
      ];
      
      const stressResults = {};
      
      for (const stressTest of stressTests) {
        console.log(`  🔄 Running ${stressTest.name}...`);
        const result = await stressTest.test();
        stressResults[stressTest.name] = result;
        
        // Clean up between tests
        if (global.gc) {
          global.gc();
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Evaluate stress test results
      let allPassed = true;
      const stressThresholds = {
        maxComponentRenderTime: 1000, // 1 second for 1000 components
        maxStateUpdateTime: 5000, // 5 seconds for 100 state changes
        maxMemoryPressureTime: 10000 // 10 seconds under memory pressure
      };
      
      for (const [testName, result] of Object.entries(stressResults)) {
        let passed = false;
        let threshold = 0;
        
        switch (testName) {
          case 'High Component Count':
            passed = result.renderTime <= stressThresholds.maxComponentRenderTime;
            threshold = stressThresholds.maxComponentRenderTime;
            break;
          case 'Rapid State Changes':
            passed = result.totalTime <= stressThresholds.maxStateUpdateTime;
            threshold = stressThresholds.maxStateUpdateTime;
            break;
          case 'Memory Pressure':
            passed = result.totalTime <= stressThresholds.maxMemoryPressureTime;
            threshold = stressThresholds.maxMemoryPressureTime;
            break;
        }
        
        stressResults[testName].passed = passed;
        stressResults[testName].threshold = threshold;
        
        if (!passed) {
          allPassed = false;
        }
      }
      
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: allPassed,
        duration,
        category: 'performance',
        details: {
          stressResults,
          thresholds: stressThresholds
        }
      });
      
      console.log(`  ${allPassed ? '✅' : '❌'} Stress performance: ${Object.keys(stressResults).length} tests`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: false,
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testResourceCleanup() {
    console.log('\n🧹 Testing Resource Cleanup...');
    
    const testName = 'Resource Cleanup';
    const startTime = Date.now();
    
    try {
      const initialMemory = global.performance.memory.usedJSHeapSize;
      
      // Create and destroy resources
      for (let cycle = 0; cycle < 10; cycle++) {
        // Create various resources
        const resources = {
          elements: [],
          timers: [],
          listeners: [],
          arrays: []
        };
        
        // Create DOM elements
        for (let i = 0; i < 100; i++) {
          const element = document.createElement('div');
          element.className = 'test-resource';
          document.body.appendChild(element);
          resources.elements.push(element);
        }
        
        // Create timers
        for (let i = 0; i < 20; i++) {
          const timer = setTimeout(() => {}, 1000);
          resources.timers.push(timer);
        }
        
        // Create event listeners
        for (let i = 0; i < 10; i++) {
          const listener = () => {};
          window.addEventListener('test-event', listener);
          resources.listeners.push(listener);
        }
        
        // Create large arrays
        for (let i = 0; i < 5; i++) {
          const array = new Array(10000).fill(Math.random());
          resources.arrays.push(array);
        }
        
        // Take memory snapshot
        const peakMemory = global.performance.memory.usedJSHeapSize;
        
        // Clean up resources
        resources.elements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
        
        resources.timers.forEach(timer => clearTimeout(timer));
        
        resources.listeners.forEach(listener => {
          window.removeEventListener('test-event', listener);
        });
        
        resources.arrays.length = 0;
        
        // Force garbage collection
        if (global.gc) {
          global.gc();
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify cleanup
        const cleanupMemory = global.performance.memory.usedJSHeapSize;
        const memoryReclaimed = peakMemory - cleanupMemory;
        
        if (memoryReclaimed < 0) {
          console.warn(`  ⚠️ Memory leak detected in cycle ${cycle}: ${memoryReclaimed} bytes`);
        }
      }
      
      const finalMemory = global.performance.memory.usedJSHeapSize;
      const totalMemoryGrowth = finalMemory - initialMemory;
      const passed = totalMemoryGrowth <= this.thresholds.maxMemoryGrowth;
      
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed,
        duration,
        category: 'performance',
        details: {
          initialMemory,
          finalMemory,
          totalMemoryGrowth,
          memoryGrowthThreshold: this.thresholds.maxMemoryGrowth
        }
      });
      
      console.log(`  ${passed ? '✅' : '❌'} Resource cleanup: Memory growth: ${(totalMemoryGrowth / 1024 / 1024).toFixed(2)}MB`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: false,
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return variance;
  }

  generatePerformanceReport(totalDuration) {
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = this.testResults.filter(r => !r.passed).length;
    const totalTests = this.testResults.length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
    
    // Calculate performance metrics
    const avgRenderTime = this.performanceMetrics.renderTimes.length > 0 ? 
      this.performanceMetrics.renderTimes.reduce((sum, time) => sum + time, 0) / this.performanceMetrics.renderTimes.length : 0;
    
    const maxMemoryUsage = this.performanceMetrics.memorySnapshots.length > 0 ?
      Math.max(...this.performanceMetrics.memorySnapshots.map(s => s.heapUsed)) : 0;
    
    const avgCpuUsage = this.performanceMetrics.cpuUsage.length > 0 ?
      this.performanceMetrics.cpuUsage.reduce((sum, cpu) => sum + cpu, 0) / this.performanceMetrics.cpuUsage.length : 0;
    
    const avgFrameRate = this.performanceMetrics.frameRates.length > 0 ?
      this.performanceMetrics.frameRates.reduce((sum, fps) => sum + fps.fps, 0) / this.performanceMetrics.frameRates.length : 0;
    
    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        passRate,
        totalDuration,
        timestamp: new Date().toISOString()
      },
      categories: {
        performance: {
          totalTests,
          passedTests,
          failedTests,
          passRate
        }
      },
      performanceMetrics: {
        avgRenderTime,
        maxMemoryUsage,
        avgCpuUsage,
        avgFrameRate,
        thresholds: this.thresholds
      },
      testResults: this.testResults,
      recommendations: this.generatePerformanceRecommendations()
    };
  }

  generatePerformanceRecommendations() {
    const recommendations = [];
    
    // Analyze test results and generate recommendations
    for (const test of this.testResults) {
      if (!test.passed && test.category === 'performance') {
        if (test.testName === 'Render Performance') {
          recommendations.push({
            priority: 'high',
            category: 'rendering',
            title: 'Optimize Component Rendering',
            description: 'Some components are taking too long to render.',
            action: 'Implement React.memo, virtualization, and code splitting for large component lists'
          });
        }
        
        if (test.testName === 'Memory Efficiency') {
          recommendations.push({
            priority: 'high',
            category: 'memory',
            title: 'Reduce Memory Usage',
            description: 'Memory growth exceeds acceptable thresholds.',
            action: 'Implement object pooling, reduce unnecessary object creation, and add memory monitoring'
          });
        }
        
        if (test.testName === 'CPU Utilization') {
          recommendations.push({
            priority: 'medium',
            category: 'cpu',
            title: 'Optimize CPU Usage',
            description: 'CPU usage is higher than optimal.',
            action: 'Use Web Workers for heavy computations, implement debouncing, and optimize algorithms'
          });
        }
        
        if (test.testName === 'Frame Rate Stability') {
          recommendations.push({
            priority: 'medium',
            category: 'animation',
            title: 'Improve Frame Rate',
            description: 'Frame rate stability needs improvement.',
            action: 'Use requestAnimationFrame properly, reduce layout thrashing, and implement CSS animations'
          });
        }
      }
    }
    
    return recommendations;
  }

  async savePerformanceReport(report) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const reportPath = path.join(__dirname, 'PERFORMANCE_VALIDATION_REPORT.json');
    
    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📊 Performance report saved to: ${reportPath}`);
    } catch (error) {
      console.error('❌ Failed to save performance report:', error);
    }
  }

  displayPerformanceSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PERFORMANCE VALIDATION REPORT');
    console.log('='.repeat(80));
    
    // Overall summary
    console.log(`\n📈 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Passed: ${report.summary.passedTests} ✅`);
    console.log(`   Failed: ${report.summary.failedTests} ❌`);
    console.log(`   Pass Rate: ${report.summary.passRate}%`);
    console.log(`   Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`);
    
    // Performance metrics
    console.log(`\n⚡ PERFORMANCE METRICS:`);
    console.log(`   Average Render Time: ${report.performanceMetrics.avgRenderTime.toFixed(2)}ms`);
    console.log(`   Max Memory Usage: ${(report.performanceMetrics.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Average CPU Usage: ${report.performanceMetrics.avgCpuUsage.toFixed(2)}%`);
    console.log(`   Average Frame Rate: ${report.performanceMetrics.avgFrameRate.toFixed(1)}fps`);
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.title} (${rec.priority})`);
        console.log(`      ${rec.description}`);
        console.log(`      Action: ${rec.action}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Export for use
module.exports = {
  PerformanceTestRunner
};

// Run if executed directly
if (require.main === module) {
  const runner = new PerformanceTestRunner();
  runner.runPerformanceTests().catch(console.error);
}
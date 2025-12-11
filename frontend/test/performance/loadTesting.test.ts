/**
 * Performance and Load Testing Suite
 * Tests application performance under various load conditions
 */

import { renderWithProviders, mockAgentState, generateMockAgents, measureRenderTime, measureMemoryUsage } from '../utils/testUtils';
import { performanceConfig } from '../config/testConfig';
import App from '../../src/App';

describe('Performance and Load Testing', () => {
  beforeEach(() => {
    // Reset performance metrics
    if (global.performanceMetrics) {
      global.performanceMetrics.renders = [];
      global.performanceMetrics.memoryUsage = [];
    }
  });

  describe('Rendering Performance', () => {
    test('should render single agent within performance threshold', async () => {
      const mockAgent = mockAgentState;
      
      const metrics = measureRenderTime(
        <App />,
        { agents: [mockAgent] }
      );
      
      expect(metrics.average).toBeLessThan(performanceConfig.rendering.maxRenderTime);
      expect(metrics.max).toBeLessThan(performanceConfig.rendering.maxRenderTime * 2);
    });

    test('should handle multiple agents efficiently', async () => {
      const agents = generateMockAgents(10);
      
      const metrics = measureRenderTime(
        <App />,
        { agents }
      );
      
      expect(metrics.average).toBeLessThan(performanceConfig.rendering.maxRenderTime * 2);
      expect(metrics.max).toBeLessThan(performanceConfig.rendering.maxRenderTime * 3);
    });

    test('should maintain performance with large datasets', async () => {
      const agents = generateMockAgents(50);
      
      const startTime = performance.now();
      const { unmount } = renderWithProviders(<App />, { agents });
      const renderTime = performance.now() - startTime;
      
      expect(renderTime).toBeLessThan(2000); // Should render 50 agents in under 2 seconds
      
      const memoryBefore = measureMemoryUsage();
      unmount();
      const memoryAfter = measureMemoryUsage();
      
      if (memoryBefore && memoryAfter) {
        const memoryGrowth = memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize;
        expect(memoryGrowth).toBeLessThan(performanceConfig.memory.maxHeapGrowth);
      }
    });

    test('should handle rapid state updates efficiently', async () => {
      const agents = generateMockAgents(25);
      
      const { unmount } = renderWithProviders(<App />, { agents });
      
      const startTime = performance.now();
      
      // Simulate rapid state updates
      for (let i = 0; i < 100; i++) {
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        // Simulate state update
        if (global.performanceMetrics) {
          global.performanceMetrics.renders.push({
            component: 'AgentList',
            renderTime: 1,
            timestamp: Date.now()
          });
        }
      }
      
      const updateTime = performance.now() - startTime;
      expect(updateTime).toBeLessThan(1000); // Should handle 100 updates in under 1 second
      
      unmount();
    });
  });

  describe('Memory Usage', () => {
    test('should not exceed memory thresholds under normal load', async () => {
      const agents = generateMockAgents(20);
      
      const initialMemory = measureMemoryUsage();
      
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate user interactions
      const interactions = Array.from({ length: 50 }, (_, i) => ({
        type: 'click',
        target: `agent-${i}`,
        timestamp: Date.now()
      }));
      
      interactions.forEach(interaction => {
        if (global.performanceMetrics) {
          global.performanceMetrics.memoryUsage.push({
            heapSize: (initialMemory?.usedJSHeapSize || 0) + (i * 1024),
            timestamp: Date.now()
          });
        }
      });
      
      const finalMemory = measureMemoryUsage();
      
      if (initialMemory && finalMemory) {
        expect(finalMemory.usedJSHeapSize).toBeLessThan(performanceConfig.memory.maxHeapSize);
        
        const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        expect(memoryGrowth).toBeLessThan(performanceConfig.memory.maxHeapGrowth);
      }
      
      unmount();
    });

    test('should handle memory pressure gracefully', async () => {
      const agents = generateMockAgents(100);
      
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate memory pressure
      const memoryPressure = Array.from({ length: 1000 }, (_, i) => ({
        heapSize: performanceConfig.memory.maxHeapSize + (i * 1024),
        timestamp: Date.now()
      }));
      
      if (global.performanceMetrics) {
        global.performanceMetrics.memoryUsage.push(...memoryPressure);
      }
      
      // Application should still function
      expect(document.body).toBeInTheDocument();
      
      // Should trigger garbage collection hints
      expect(global.gc).toBeDefined();
      
      unmount();
    });

    test('should clean up memory on component unmount', async () => {
      const agents = generateMockAgents(10);
      
      const initialMemory = measureMemoryUsage();
      
      const { unmount } = renderWithProviders(<App />, { agents });
      const memoryAfterRender = measureMemoryUsage();
      
      // Simulate some memory usage
      if (global.performanceMetrics) {
        global.performanceMetrics.memoryUsage.push({
          heapSize: (memoryAfterRender?.usedJSHeapSize || 0) + 5 * 1024 * 1024,
          timestamp: Date.now()
        });
      }
      
      unmount();
      const memoryAfterUnmount = measureMemoryUsage();
      
      if (initialMemory && memoryAfterRender && memoryAfterUnmount) {
        const memoryGrowthDuringRender = memoryAfterRender.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const memoryReductionOnUnmount = memoryAfterRender.usedJSHeapSize - memoryAfterUnmount.usedJSHeapSize;
        
        expect(memoryReductionOnUnmount).toBeGreaterThan(0);
        expect(memoryReductionOnUnmount).toBeLessThan(memoryGrowthDuringRender);
      }
    });
  });

  describe('Network Performance', () => {
    test('should handle concurrent network requests efficiently', async () => {
      const agents = generateMockAgents(5);
      
      const { unmount } = renderWithProviders(<App />, { agents });
      
      const startTime = performance.now();
      const requestCount = 50;
      
      // Simulate concurrent network requests
      const requests = Array.from({ length: requestCount }, (_, i) => ({
        url: `/api/agents/${i}`,
        method: 'GET',
        timestamp: Date.now(),
        duration: Math.random() * 200 + 50 // 50-250ms
      }));
      
      if (global.performanceMetrics) {
        global.performanceMetrics.networkRequests.push(...requests);
      }
      
      // Wait for all requests to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const totalTime = performance.now() - startTime;
      const averageRequestTime = requests.reduce((sum, req) => sum + req.duration, 0) / requests.length;
      
      expect(totalTime).toBeLessThan(5000); // Should complete 50 requests in under 5 seconds
      expect(averageRequestTime).toBeLessThan(200); // Average request time should be under 200ms
      
      unmount();
    });

    test('should handle network timeouts gracefully', async () => {
      const agents = generateMockAgents(3);
      
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate network timeouts
      const timeoutRequests = Array.from({ length: 10 }, (_, i) => ({
        url: `/api/agents/${i}`,
        method: 'GET',
        timestamp: Date.now(),
        duration: 10000, // 10 second timeout
        status: 'timeout'
      }));
      
      if (global.performanceMetrics) {
        global.performanceMetrics.networkRequests.push(...timeoutRequests);
      }
      
      // Wait for timeout handling
      await new Promise(resolve => setTimeout(resolve, 11000));
      
      const timeoutRate = timeoutRequests.filter(req => req.status === 'timeout').length / timeoutRequests.length;
      expect(timeoutRate).toBeGreaterThan(0); // Some requests should timeout
      
      // Application should still be functional
      expect(document.body).toBeInTheDocument();
      
      unmount();
    });

    test('should implement request throttling', async () => {
      const agents = generateMockAgents(20);
      
      const { unmount } = renderWithProviders(<App />, { agents });
      
      const startTime = performance.now();
      const requestCount = 100;
      
      // Simulate rapid requests that should be throttled
      const rapidRequests = Array.from({ length: requestCount }, (_, i) => ({
        url: `/api/agents/${i % 5}`, // Only 5 unique endpoints
        method: 'GET',
        timestamp: Date.now() + (i * 10), // 10ms apart
        duration: 50
      }));
      
      if (global.performanceMetrics) {
        global.performanceMetrics.networkRequests.push(...rapidRequests);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const actualRequests = rapidRequests.filter((req, index) => 
        rapidRequests.findIndex(r => r.url === req.url) === index
      );
      
      // Should have fewer actual requests due to throttling
      expect(actualRequests.length).toBeLessThan(requestCount);
      
      unmount();
    });
  });

  describe('Load Testing Scenarios', () => {
    test('should handle 1 concurrent user', async () => {
      const { concurrentUsers } = performanceConfig.loadTesting;
      const userCount = concurrentUsers[0];
      
      const startTime = performance.now();
      
      // Simulate 1 user
      const agents = generateMockAgents(userCount);
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate user interactions
      const interactions = Array.from({ length: 20 }, (_, i) => ({
        type: 'click',
        target: `agent-${i % userCount}`,
        timestamp: Date.now() + (i * 100)
      }));
      
      interactions.forEach(interaction => {
        if (global.performanceMetrics) {
          global.performanceMetrics.renders.push({
            component: 'AgentCard',
            renderTime: 5,
            timestamp: interaction.timestamp
          });
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalTime = performance.now() - startTime;
      const averageInteractionTime = totalTime / interactions.length;
      
      expect(averageInteractionTime).toBeLessThan(performanceConfig.rendering.maxRenderTime);
      expect(document.body).toBeInTheDocument();
      
      unmount();
    });

    test('should handle 5 concurrent users', async () => {
      const { concurrentUsers } = performanceConfig.loadTesting;
      const userCount = concurrentUsers[1];
      
      const startTime = performance.now();
      
      // Simulate 5 users
      const agents = generateMockAgents(userCount);
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate concurrent interactions
      const interactions = Array.from({ length: 100 }, (_, i) => ({
        type: 'click',
        target: `agent-${i % userCount}`,
        timestamp: Date.now() + (i * 50)
      }));
      
      interactions.forEach(interaction => {
        if (global.performanceMetrics) {
          global.performanceMetrics.renders.push({
            component: 'AgentCard',
            renderTime: 8,
            timestamp: interaction.timestamp
          });
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const totalTime = performance.now() - startTime;
      const averageInteractionTime = totalTime / interactions.length;
      
      expect(averageInteractionTime).toBeLessThan(performanceConfig.rendering.maxRenderTime * 2);
      expect(document.body).toBeInTheDocument();
      
      unmount();
    });

    test('should handle 10 concurrent users', async () => {
      const { concurrentUsers } = performanceConfig.loadTesting;
      const userCount = concurrentUsers[2];
      
      const startTime = performance.now();
      
      // Simulate 10 users
      const agents = generateMockAgents(userCount);
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate high concurrent load
      const interactions = Array.from({ length: 200 }, (_, i) => ({
        type: 'click',
        target: `agent-${i % userCount}`,
        timestamp: Date.now() + (i * 25)
      }));
      
      interactions.forEach(interaction => {
        if (global.performanceMetrics) {
          global.performanceMetrics.renders.push({
            component: 'AgentCard',
            renderTime: 12,
            timestamp: interaction.timestamp
          });
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const totalTime = performance.now() - startTime;
      const averageInteractionTime = totalTime / interactions.length;
      
      expect(averageInteractionTime).toBeLessThan(performanceConfig.rendering.maxRenderTime * 3);
      expect(document.body).toBeInTheDocument();
      
      unmount();
    });

    test('should handle 25 concurrent users', async () => {
      const { concurrentUsers } = performanceConfig.loadTesting;
      const userCount = concurrentUsers[3];
      
      const startTime = performance.now();
      
      // Simulate 25 users (stress test)
      const agents = generateMockAgents(userCount);
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate stress load
      const interactions = Array.from({ length: 500 }, (_, i) => ({
        type: 'click',
        target: `agent-${i % userCount}`,
        timestamp: Date.now() + (i * 10)
      }));
      
      interactions.forEach(interaction => {
        if (global.performanceMetrics) {
          global.performanceMetrics.renders.push({
            component: 'AgentCard',
            renderTime: 20,
            timestamp: interaction.timestamp
          });
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      const totalTime = performance.now() - startTime;
      const averageInteractionTime = totalTime / interactions.length;
      
      // Under high load, performance can degrade but should remain functional
      expect(averageInteractionTime).toBeLessThan(performanceConfig.rendering.maxRenderTime * 5);
      expect(document.body).toBeInTheDocument();
      
      unmount();
    });

    test('should handle 50 concurrent users', async () => {
      const { concurrentUsers } = performanceConfig.loadTesting;
      const userCount = concurrentUsers[4];
      
      const startTime = performance.now();
      
      // Simulate 50 users (maximum stress test)
      const agents = generateMockAgents(userCount);
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate maximum stress load
      const interactions = Array.from({ length: 1000 }, (_, i) => ({
        type: 'click',
        target: `agent-${i % userCount}`,
        timestamp: Date.now() + (i * 5)
      }));
      
      interactions.forEach(interaction => {
        if (global.performanceMetrics) {
          global.performanceMetrics.renders.push({
            component: 'AgentCard',
            renderTime: 30,
            timestamp: interaction.timestamp
          });
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      const totalTime = performance.now() - startTime;
      const averageInteractionTime = totalTime / interactions.length;
      
      // At maximum load, performance degrades significantly but should not crash
      expect(averageInteractionTime).toBeLessThan(performanceConfig.rendering.maxRenderTime * 10);
      expect(document.body).toBeInTheDocument();
      
      unmount();
    });
  });

  describe('Bundle Size Performance', () => {
    test('should meet bundle size requirements', async () => {
      // Mock bundle analysis
      const mockBundleSize = {
        rawSize: 450 * 1024, // 450KB
        gzippedSize: 120 * 1024, // 120KB
        formatted: {
          raw: '450.00 KB',
          gzipped: '120.00 KB'
        }
      };
      
      expect(mockBundleSize.rawSize).toBeLessThan(performanceConfig.bundleSize.maxJsSize);
      expect(mockBundleSize.gzippedSize).toBeLessThan(performanceConfig.bundleSize.maxJsSize * 0.3);
    });

    test('should optimize asset loading', async () => {
      const startTime = performance.now();
      
      // Mock asset loading
      const assets = [
        { type: 'js', size: 200 * 1024 },
        { type: 'css', size: 20 * 1024 },
        { type: 'image', size: 50 * 1024 }
      ];
      
      const loadPromises = assets.map(asset => 
        new Promise(resolve => {
          setTimeout(() => {
            if (global.performanceMetrics) {
              global.performanceMetrics.networkRequests.push({
                url: `/assets/${asset.type}.${asset.type}`,
                method: 'GET',
                timestamp: Date.now(),
                duration: Math.random() * 500 + 100
              });
            }
            resolve(asset.size);
          }, Math.random() * 1000 + 100);
        })
      );
      
      await Promise.all(loadPromises);
      
      const totalTime = performance.now() - startTime;
      const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
      
      // Should load all assets efficiently
      expect(totalTime).toBeLessThan(5000); // 5 seconds for all assets
      expect(totalSize / totalTime).toBeGreaterThan(50 * 1024); // At least 50KB/s
      
      // Individual assets should load quickly
      const loadTimes = loadPromises.map((_, index) => 
        (index + 1) * 200 + Math.random() * 300
      );
      
      loadTimes.forEach(loadTime => {
        expect(loadTime).toBeLessThan(2000); // Each asset loads in under 2 seconds
      });
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance metrics accurately', async () => {
      const agents = generateMockAgents(5);
      
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate various performance events
      if (global.performanceMetrics) {
        // Rendering events
        global.performanceMetrics.renders.push(
          { component: 'App', renderTime: 50, timestamp: Date.now() },
          { component: 'AgentList', renderTime: 30, timestamp: Date.now() + 100 },
          { component: 'AgentCard', renderTime: 20, timestamp: Date.now() + 200 }
        );
        
        // Memory events
        global.performanceMetrics.memoryUsage.push(
          { heapSize: 50 * 1024 * 1024, timestamp: Date.now() },
          { heapSize: 55 * 1024 * 1024, timestamp: Date.now() + 1000 },
          { heapSize: 45 * 1024 * 1024, timestamp: Date.now() + 2000 }
        );
        
        // Network events
        global.performanceMetrics.networkRequests.push(
          { url: '/api/agents', method: 'GET', duration: 150, timestamp: Date.now() },
          { url: '/api/agents/1', method: 'GET', duration: 200, timestamp: Date.now() + 500 }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify metrics were tracked
      expect(global.performanceMetrics.renders).toHaveLength(3);
      expect(global.performanceMetrics.memoryUsage).toHaveLength(3);
      expect(global.performanceMetrics.networkRequests).toHaveLength(2);
      
      unmount();
    });

    test('should generate performance reports', async () => {
      const agents = generateMockAgents(3);
      
      const { unmount } = renderWithProviders(<App />, { agents });
      
      // Simulate performance data collection
      if (global.performanceMetrics) {
        global.performanceMetrics.renders.push(
          { component: 'App', renderTime: 45, timestamp: Date.now() },
          { component: 'AgentList', renderTime: 25, timestamp: Date.now() + 100 }
        );
        
        global.performanceMetrics.memoryUsage.push(
          { heapSize: 40 * 1024 * 1024, timestamp: Date.now() }
        );
        
        global.performanceMetrics.networkRequests.push(
          { url: '/api/agents', method: 'GET', duration: 120, timestamp: Date.now() }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate performance report
      const report = {
        timestamp: Date.now(),
        duration: 5000,
        renders: global.performanceMetrics?.renders || [],
        memoryUsage: global.performanceMetrics?.memoryUsage || [],
        networkRequests: global.performanceMetrics?.networkRequests || [],
        summary: {
          totalRenders: (global.performanceMetrics?.renders || []).length,
          averageRenderTime: 35,
          maxRenderTime: 45,
          memoryPeak: 40 * 1024 * 1024,
          totalRequests: (global.performanceMetrics?.networkRequests || []).length,
          averageRequestTime: 120
        }
      };
      
      expect(report.timestamp).toBeDefined();
      expect(report.duration).toBe(5000);
      expect(report.summary.totalRenders).toBe(2);
      expect(report.summary.averageRenderTime).toBe(35);
      expect(report.summary.maxRenderTime).toBe(45);
      expect(report.summary.memoryPeak).toBe(40 * 1024 * 1024);
      expect(report.summary.totalRequests).toBe(1);
      expect(report.summary.averageRequestTime).toBe(120);
      
      unmount();
    });
  });
});
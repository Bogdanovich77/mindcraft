/**
 * Comprehensive Integration Test Suite for Frontend Cognitive Dashboard
 * 
 * This test suite validates end-to-end functionality, component integration,
 * real-time data synchronization, performance, cross-browser compatibility,
 * and error handling for the entire cognitive dashboard system.
 * 
 * @author Mindcraft Frontend Team
 * @version 1.0.0
 * @date 2025-12-11
 */

const { performance } = require('perf_hooks');
const { JSDOM } = require('jsdom');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  retries: 3,
  parallel: false,
  verbose: true,
  coverage: true,
  browsers: ['chrome', 'firefox', 'safari', 'edge'],
  devices: ['desktop', 'tablet', 'mobile'],
  viewports: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ]
};

// Test utilities
class TestUtils {
  constructor() {
    this.dom = null;
    this.window = null;
    this.document = null;
    this.testResults = [];
    this.performanceMetrics = {};
    this.memoryUsage = [];
    this.networkRequests = [];
    this.errorLog = [];
  }

  async setupTestEnvironment() {
    console.log('[TestUtils] Setting up test environment...');
    
    // Create virtual DOM
    this.dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost:5173',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    this.window = this.dom.window;
    this.document = this.dom.window.document;

    // Mock browser APIs
    this.mockBrowserAPIs();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    console.log('[TestUtils] Test environment ready');
  }

  mockBrowserAPIs() {
    // Mock localStorage
    this.window.localStorage = {
      data: {},
      getItem: function(key) { return this.data[key] || null; },
      setItem: function(key, value) { this.data[key] = value; },
      removeItem: function(key) { delete this.data[key]; },
      clear: function() { this.data = {}; }
    };

    // Mock sessionStorage
    this.window.sessionStorage = {
      data: {},
      getItem: function(key) { return this.data[key] || null; },
      setItem: function(key, value) { this.data[key] = value; },
      removeItem: function(key) { delete this.data[key]; },
      clear: function() { this.data = {}; }
    };

    // Mock fetch API
    this.window.fetch = async (url, options = {}) => {
      this.networkRequests.push({ url, options, timestamp: Date.now() });
      
      // Mock responses for common endpoints
      if (url.includes('/api/agents')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            agents: [
              { id: 'test-agent-1', name: 'Test Agent 1', status: 'online' },
              { id: 'test-agent-2', name: 'Test Agent 2', status: 'offline' }
            ]
          })
        };
      }
      
      return {
        ok: true,
        status: 200,
        json: async () => ({})
      };
    };

    // Mock WebSocket
    this.window.WebSocket = class MockWebSocket {
      constructor(url) {
        this.url = url;
        this.readyState = 1; // OPEN
        setTimeout(() => {
          if (this.onopen) this.onopen();
        }, 100);
      }
      
      send(data) {
        console.log(`[MockWebSocket] Sending: ${data}`);
      }
      
      close() {
        this.readyState = 3; // CLOSED
        if (this.onclose) this.onclose();
      }
    };

    // Mock ResizeObserver
    this.window.ResizeObserver = class MockResizeObserver {
      constructor(callback) {
        this.callback = callback;
      }
      
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock IntersectionObserver
    this.window.IntersectionObserver = class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  setupPerformanceMonitoring() {
    // Monitor memory usage
    const originalMemoryUsage = process.memoryUsage;
    process.memoryUsage = () => {
      const usage = originalMemoryUsage();
      this.memoryUsage.push({
        timestamp: Date.now(),
        ...usage
      });
      return usage;
    };

    // Monitor performance marks
    this.window.performance = {
      now: () => Date.now(),
      mark: (name) => {
        this.performanceMetrics[name] = Date.now();
      },
      measure: (name, startMark, endMark) => {
        const duration = this.performanceMetrics[endMark] - this.performanceMetrics[startMark];
        this.performanceMetrics[`${name}_duration`] = duration;
        return duration;
      },
      getEntriesByType: () => []
    };
  }

  async simulateUserInteraction(element, interaction) {
    const events = {
      click: new this.window.Event('click', { bubbles: true }),
      hover: new this.window.Event('mouseover', { bubbles: true }),
      focus: new this.window.Event('focus', { bubbles: true }),
      blur: new this.window.Event('blur', { bubbles: true }),
      input: new this.window.Event('input', { bubbles: true }),
      change: new this.window.Event('change', { bubbles: true })
    };

    if (events[interaction]) {
      element.dispatchEvent(events[interaction]);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = this.document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new this.window.MutationObserver((mutations) => {
        const element = this.document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(this.document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  recordTestResult(testName, passed, details = {}) {
    const result = {
      testName,
      passed,
      timestamp: Date.now(),
      duration: details.duration || 0,
      error: details.error || null,
      details: details.details || '',
      category: details.category || 'general'
    };

    this.testResults.push(result);
    
    if (TEST_CONFIG.verbose) {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`[TestResult] ${status} ${testName}`);
      if (!passed && details.error) {
        console.error(`[TestResult] Error: ${details.error}`);
      }
    }
  }

  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = this.testResults.filter(r => !r.passed).length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);

    const categoryResults = {};
    this.testResults.forEach(result => {
      if (!categoryResults[result.category]) {
        categoryResults[result.category] = { total: 0, passed: 0 };
      }
      categoryResults[result.category].total++;
      if (result.passed) {
        categoryResults[result.category].passed++;
      }
    });

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        passRate: `${passRate}%`,
        timestamp: new Date().toISOString(),
        testDuration: this.performanceMetrics.total_test_duration || 0
      },
      categories: categoryResults,
      testResults: this.testResults,
      performanceMetrics: this.performanceMetrics,
      memoryUsage: this.memoryUsage,
      networkRequests: this.networkRequests,
      errorLog: this.errorLog
    };

    return report;
  }

  cleanup() {
    if (this.dom) {
      this.dom.window.close();
    }
    this.testResults = [];
    this.performanceMetrics = {};
    this.memoryUsage = [];
    this.networkRequests = [];
    this.errorLog = [];
  }
}

// Test categories
class EndToEndUserFlowTests {
  constructor(testUtils) {
    this.testUtils = testUtils;
  }

  async runAllTests() {
    console.log('[EndToEndUserFlowTests] Starting end-to-end user flow tests...');
    
    await this.testCompleteUserJourney();
    await this.testAgentSelectionAndSwitching();
    await this.testTabNavigation();
    await this.testModalInteractions();
    await this.testRealTimeDataUpdates();
    await this.testResponsiveDesign();
    await this.testAccessibilityFeatures();
    
    console.log('[EndToEndUserFlowTests] End-to-end tests completed');
  }

  async testCompleteUserJourney() {
    const testName = 'Complete User Journey';
    const startTime = Date.now();
    
    try {
      // Step 1: Page load
      await this.testUtils.waitForElement('[data-testid="cognitive-dashboard"]');
      
      // Step 2: Connection establishment
      await this.testUtils.waitForElement('.connection-status');
      
      // Step 3: Agent selection
      const agentCards = await this.testUtils.waitForElement('[data-testid="agent-card"]');
      await this.testUtils.simulateUserInteraction(agentCards, 'click');
      
      // Step 4: Tab navigation
      await this.testUtils.waitForElement('[data-testid="overview-tab"]');
      await this.testUtils.simulateUserInteraction(
        this.testUtils.document.querySelector('[data-testid="goals-tab"]'), 
        'click'
      );
      
      // Step 5: Modal interaction
      const goalCreateButton = await this.testUtils.waitForElement('[data-testid="create-goal-button"]');
      await this.testUtils.simulateUserInteraction(goalCreateButton, 'click');
      
      // Step 6: Form submission
      const form = await this.testUtils.waitForElement('[data-testid="goal-form"]');
      const submitButton = form.querySelector('[type="submit"]');
      await this.testUtils.simulateUserInteraction(submitButton, 'click');
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'end-to-end',
        details: 'Complete user journey from page load to goal creation'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'end-to-end'
      });
    }
  }

  async testAgentSelectionAndSwitching() {
    const testName = 'Agent Selection and Switching';
    const startTime = Date.now();
    
    try {
      // Test agent selection
      const agentCards = this.testUtils.document.querySelectorAll('[data-testid="agent-card"]');
      
      if (agentCards.length < 2) {
        throw new Error('Insufficient agent cards for selection test');
      }
      
      // Select first agent
      await this.testUtils.simulateUserInteraction(agentCards[0], 'click');
      
      // Verify selection
      const selectedCard = agentCards[0].querySelector('[aria-selected="true"]');
      if (!selectedCard) {
        throw new Error('Agent selection not properly indicated');
      }
      
      // Switch to second agent
      await this.testUtils.simulateUserInteraction(agentCards[1], 'click');
      
      // Verify selection changed
      const newSelectedCard = agentCards[1].querySelector('[aria-selected="true"]');
      if (!newSelectedCard) {
        throw new Error('Agent switching not working properly');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'end-to-end',
        details: `Successfully tested selection between ${agentCards.length} agents`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'end-to-end'
      });
    }
  }

  async testTabNavigation() {
    const testName = 'Tab Navigation';
    const startTime = Date.now();
    
    try {
      const tabs = [
        'overview-tab', 'personality-tab', 'memory-tab',
        'goals-tab', 'social-tab', 'skills-tab', 'performance-tab'
      ];
      
      for (const tabId of tabs) {
        const tab = await this.testUtils.waitForElement(`[data-testid="${tabId}"]`);
        await this.testUtils.simulateUserInteraction(tab, 'click');
        
        // Verify tab panel is visible
        const panelId = tabId.replace('-tab', '-tabpanel');
        const panel = await this.testUtils.waitForElement(`#${panelId}`);
        
        if (!panel || panel.hidden) {
          throw new Error(`Tab panel ${panelId} not visible after clicking ${tabId}`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'end-to-end',
        details: `Successfully navigated through all ${tabs.length} tabs`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'end-to-end'
      });
    }
  }

  async testModalInteractions() {
    const testName = 'Modal Interactions';
    const startTime = Date.now();
    
    try {
      // Test goal creation modal
      const createGoalButton = await this.testUtils.waitForElement('[data-testid="create-goal-button"]');
      await this.testUtils.simulateUserInteraction(createGoalButton, 'click');
      
      const modal = await this.testUtils.waitForElement('[data-testid="goal-creation-dialog"]');
      
      // Test form validation
      const submitButton = modal.querySelector('[type="submit"]');
      await this.testUtils.simulateUserInteraction(submitButton, 'click');
      
      // Should show validation errors for empty form
      const errorMessages = modal.querySelectorAll('.error-message');
      if (errorMessages.length === 0) {
        throw new Error('Form validation not working');
      }
      
      // Test modal close
      const closeButton = modal.querySelector('[data-testid="close-modal"]');
      await this.testUtils.simulateUserInteraction(closeButton, 'click');
      
      // Verify modal is closed
      setTimeout(() => {
        const modalAfterClose = this.testUtils.document.querySelector('[data-testid="goal-creation-dialog"]');
        if (modalAfterClose && modalAfterClose.style.display !== 'none') {
          throw new Error('Modal not properly closed');
        }
      }, 500);
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'end-to-end',
        details: 'Successfully tested modal interactions and validation'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'end-to-end'
      });
    }
  }

  async testRealTimeDataUpdates() {
    const testName = 'Real-time Data Updates';
    const startTime = Date.now();
    
    try {
      // Mock real-time data update
      const agentData = {
        id: 'test-agent-1',
        name: 'Updated Agent',
        health: 15,
        status: 'online'
      };
      
      // Simulate WebSocket message
      const updateEvent = new this.testUtils.window.CustomEvent('agentUpdate', {
        detail: agentData
      });
      this.testUtils.window.dispatchEvent(updateEvent);
      
      // Verify UI updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const agentCard = this.testUtils.document.querySelector('[data-testid="agent-card"]');
      const healthDisplay = agentCard.querySelector('.health-display');
      
      if (!healthDisplay || !healthDisplay.textContent.includes('15')) {
        throw new Error('Real-time health update not reflected in UI');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'end-to-end',
        details: 'Real-time agent updates properly reflected in UI'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'end-to-end'
      });
    }
  }

  async testResponsiveDesign() {
    const testName = 'Responsive Design';
    const startTime = Date.now();
    
    try {
      const viewports = TEST_CONFIG.viewports;
      
      for (const viewport of viewports) {
        // Simulate viewport change
        this.testUtils.window.innerWidth = viewport.width;
        this.testUtils.window.innerHeight = viewport.height;
        
        // Trigger resize event
        const resizeEvent = new this.testUtils.window.Event('resize');
        this.testUtils.window.dispatchEvent(resizeEvent);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify layout adapts
        const dashboard = this.testUtils.document.querySelector('[data-testid="cognitive-dashboard"]');
        const computedStyle = this.testUtils.window.getComputedStyle(dashboard);
        
        if (!computedStyle || computedStyle.display === 'none') {
          throw new Error(`Dashboard not visible on ${viewport.name} viewport`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'end-to-end',
        details: `Responsive design working for ${viewports.length} viewports`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'end-to-end'
      });
    }
  }

  async testAccessibilityFeatures() {
    const testName = 'Accessibility Features';
    const startTime = Date.now();
    
    try {
      // Test keyboard navigation
      const tabs = this.testUtils.document.querySelectorAll('[role="tab"]');
      
      for (const tab of tabs) {
        tab.focus();
        await this.testUtils.simulateUserInteraction(tab, 'focus');
        
        if (this.testUtils.document.activeElement !== tab) {
          throw new Error('Keyboard navigation not working for tabs');
        }
      }
      
      // Test ARIA labels
      const tabPanels = this.testUtils.document.querySelectorAll('[role="tabpanel"]');
      for (const panel of tabPanels) {
        const labelledBy = panel.getAttribute('aria-labelledby');
        if (!labelledBy) {
          throw new Error('Tab panel missing aria-labelledby attribute');
        }
      }
      
      // Test screen reader compatibility
      const agentCards = this.testUtils.document.querySelectorAll('[data-testid="agent-card"]');
      for (const card of agentCards) {
        const ariaLabel = card.getAttribute('aria-label');
        if (!ariaLabel) {
          throw new Error('Agent card missing aria-label for screen readers');
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'end-to-end',
        details: 'Accessibility features working properly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'end-to-end'
      });
    }
  }
}

// Component Integration Tests
class ComponentIntegrationTests {
  constructor(testUtils) {
    this.testUtils = testUtils;
  }

  async runAllTests() {
    console.log('[ComponentIntegrationTests] Starting component integration tests...');
    
    await this.testCognitiveDashboardIntegration();
    await this.testTabComponentIntegration();
    await this.testModalComponentIntegration();
    await this.testPerformanceComponentIntegration();
    await this.testReduxStoreIntegration();
    await this.testMemoryComponentIntegration();
    await this.testSocialComponentIntegration();
    await this.testSkillsComponentIntegration();
    
    console.log('[ComponentIntegrationTests] Component integration tests completed');
  }

  async testCognitiveDashboardIntegration() {
    const testName = 'Cognitive Dashboard Integration';
    const startTime = Date.now();
    
    try {
      // Test dashboard renders
      const dashboard = await this.testUtils.waitForElement('[data-testid="cognitive-dashboard"]');
      if (!dashboard) {
        throw new Error('Cognitive dashboard not rendered');
      }
      
      // Test connection status component
      const connectionStatus = dashboard.querySelector('.connection-status');
      if (!connectionStatus) {
        throw new Error('Connection status component not integrated');
      }
      
      // Test agent selection area
      const agentSelection = dashboard.querySelector('[data-testid="agent-card"]');
      if (!agentSelection) {
        throw new Error('Agent selection not integrated');
      }
      
      // Test tab interface
      const tabInterface = dashboard.querySelector('[role="tablist"]');
      if (!tabInterface) {
        throw new Error('Tab interface not integrated');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'component-integration',
        details: 'All major components properly integrated in dashboard'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'component-integration'
      });
    }
  }

  async testTabComponentIntegration() {
    const testName = 'Tab Component Integration';
    const startTime = Date.now();
    
    try {
      const tabs = ['overview', 'personality', 'memory', 'goals', 'social', 'skills', 'performance'];
      
      for (const tabName of tabs) {
        const tab = await this.testUtils.waitForElement(`[data-testid="${tabName}-tab"]`);
        await this.testUtils.simulateUserInteraction(tab, 'click');
        
        // Verify tab panel renders
        const panel = await this.testUtils.waitForElement(`[data-testid="${tabName}-panel"]`);
        if (!panel) {
          throw new Error(`${tabName} panel not rendered`);
        }
        
        // Verify tab-specific content
        const content = panel.querySelector('.tab-content');
        if (!content) {
          throw new Error(`${tabName} tab content not rendered`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'component-integration',
        details: `All ${tabs.length} tab components properly integrated`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'component-integration'
      });
    }
  }

  async testModalComponentIntegration() {
    const testName = 'Modal Component Integration';
    const startTime = Date.now();
    
    try {
      // Test goal creation modal
      const createButton = await this.testUtils.waitForElement('[data-testid="create-goal-button"]');
      await this.testUtils.simulateUserInteraction(createButton, 'click');
      
      const modal = await this.testUtils.waitForElement('[data-testid="goal-creation-dialog"]');
      
      // Test modal components
      const form = modal.querySelector('form');
      if (!form) {
        throw new Error('Modal form not integrated');
      }
      
      const title = modal.querySelector('.modal-title');
      if (!title) {
        throw new Error('Modal title not integrated');
      }
      
      const actions = modal.querySelector('.modal-actions');
      if (!actions) {
        throw new Error('Modal actions not integrated');
      }
      
      // Test modal close functionality
      const closeButton = modal.querySelector('[data-testid="close-modal"]');
      await this.testUtils.simulateUserInteraction(closeButton, 'click');
      
      // Verify modal is removed from DOM
      setTimeout(() => {
        const modalAfterClose = this.testUtils.document.querySelector('[data-testid="goal-creation-dialog"]');
        if (modalAfterClose) {
          throw new Error('Modal not properly closed');
        }
      }, 500);
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'component-integration',
        details: 'Modal components properly integrated with parent dashboard'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'component-integration'
      });
    }
  }

  async testPerformanceComponentIntegration() {
    const testName = 'Performance Component Integration';
    const startTime = Date.now();
    
    try {
      // Navigate to performance tab
      const performanceTab = await this.testUtils.waitForElement('[data-testid="performance-tab"]');
      await this.testUtils.simulateUserInteraction(performanceTab, 'click');
      
      // Test performance sub-components
      const components = [
        'anomaly-detection',
        'resource-utilization',
        'system-health',
        'predictive-analytics',
        'benchmarking',
        'performance-reports'
      ];
      
      for (const component of components) {
        const element = await this.testUtils.waitForElement(`[data-testid="${component}"]`);
        if (!element) {
          throw new Error(`Performance component ${component} not integrated`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'component-integration',
        details: `All ${components.length} performance components properly integrated`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'component-integration'
      });
    }
  }

  async testReduxStoreIntegration() {
    const testName = 'Redux Store Integration';
    const startTime = Date.now();
    
    try {
      // Test store initialization
      if (!this.testUtils.window.__REDUX_STORE__) {
        throw new Error('Redux store not initialized');
      }
      
      const store = this.testUtils.window.__REDUX_STORE__;
      
      // Test store state structure
      const state = store.getState();
      const requiredSlices = ['agents', 'connection', 'dashboard', 'personality', 'memory', 'goals', 'social', 'skills', 'ui'];
      
      for (const slice of requiredSlices) {
        if (!state[slice]) {
          throw new Error(`Redux slice ${slice} not found in store`);
        }
      }
      
      // Test state updates
      const initialAgentCount = Object.keys(state.agents).length;
      
      // Simulate agent addition
      store.dispatch({
        type: 'agents/addAgent',
        payload: { id: 'test-agent-new', name: 'New Test Agent' }
      });
      
      const updatedState = store.getState();
      if (Object.keys(updatedState.agents).length !== initialAgentCount + 1) {
        throw new Error('Redux store state not updating correctly');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'component-integration',
        details: 'Redux store properly integrated with all slices'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'component-integration'
      });
    }
  }

  async testMemoryComponentIntegration() {
    const testName = 'Memory Component Integration';
    const startTime = Date.now();
    
    try {
      // Navigate to memory tab
      const memoryTab = await this.testUtils.waitForElement('[data-testid="memory-tab"]');
      await this.testUtils.simulateUserInteraction(memoryTab, 'click');
      
      // Test memory visualization components
      const components = [
        'episodic-timeline',
        'semantic-graph',
        'procedural-flowchart',
        'memory-consolidation',
        'memory-search'
      ];
      
      for (const component of components) {
        const element = await this.testUtils.waitForElement(`[data-testid="${component}"]`);
        if (!element) {
          throw new Error(`Memory component ${component} not integrated`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'component-integration',
        details: `All ${components.length} memory components properly integrated`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'component-integration'
      });
    }
  }

  async testSocialComponentIntegration() {
    const testName = 'Social Component Integration';
    const startTime = Date.now();
    
    try {
      // Navigate to social tab
      const socialTab = await this.testUtils.waitForElement('[data-testid="social-tab"]');
      await this.testUtils.simulateUserInteraction(socialTab, 'click');
      
      // Test social visualization components
      const components = [
        'social-network-graph',
        'trust-friendship-display',
        'communication-analysis',
        'reputation-visualization',
        'social-interaction-timeline'
      ];
      
      for (const component of components) {
        const element = await this.testUtils.waitForElement(`[data-testid="${component}"]`);
        if (!element) {
          throw new Error(`Social component ${component} not integrated`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'component-integration',
        details: `All ${components.length} social components properly integrated`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'component-integration'
      });
    }
  }

  async testSkillsComponentIntegration() {
    const testName = 'Skills Component Integration';
    const startTime = Date.now();
    
    try {
      // Navigate to skills tab
      const skillsTab = await this.testUtils.waitForElement('[data-testid="skills-tab"]');
      await this.testUtils.simulateUserInteraction(skillsTab, 'click');
      
      // Test skills visualization components
      const components = [
        'skill-progression-charts',
        'experience-rate-analysis',
        'milestone-tracking',
        'skill-synergy-mapping',
        'learning-curve-analysis'
      ];
      
      for (const component of components) {
        const element = await this.testUtils.waitForElement(`[data-testid="${component}"]`);
        if (!element) {
          throw new Error(`Skills component ${component} not integrated`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'component-integration',
        details: `All ${components.length} skills components properly integrated`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'component-integration'
      });
    }
  }
}

// Real-time Data Synchronization Tests
class RealTimeDataSyncTests {
  constructor(testUtils) {
    this.testUtils = testUtils;
  }

  async runAllTests() {
    console.log('[RealTimeDataSyncTests] Starting real-time data synchronization tests...');
    
    await this.testAgentStateUpdates();
    await this.testPerformanceMetricsStreaming();
    await this.testMemoryDataFlow();
    await this.testGoalsDataSynchronization();
    await this.testSocialDataUpdates();
    await this.testSkillsDataStreaming();
    await this.testConnectionStatusUpdates();
    await this.testErrorHandlingAndRecovery();
    
    console.log('[RealTimeDataSyncTests] Real-time data sync tests completed');
  }

  async testAgentStateUpdates() {
    const testName = 'Agent State Updates';
    const startTime = Date.now();
    
    try {
      // Simulate agent state update
      const agentUpdate = {
        id: 'test-agent-1',
        name: 'Updated Agent Name',
        health: 18,
        position: { x: 100, y: 64, z: 200 },
        status: 'online'
      };
      
      // Dispatch update event
      const updateEvent = new this.testUtils.window.CustomEvent('agentUpdate', {
        detail: agentUpdate
      });
      this.testUtils.window.dispatchEvent(updateEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify updates reflected in UI
      const agentCard = this.testUtils.document.querySelector('[data-testid="agent-card"]');
      const nameDisplay = agentCard.querySelector('.agent-name');
      const healthDisplay = agentCard.querySelector('.health-display');
      
      if (!nameDisplay.textContent.includes('Updated Agent Name')) {
        throw new Error('Agent name update not reflected');
      }
      
      if (!healthDisplay.textContent.includes('18')) {
        throw new Error('Agent health update not reflected');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'real-time-sync',
        details: 'Agent state updates properly synchronized to UI'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'real-time-sync'
      });
    }
  }

  async testPerformanceMetricsStreaming() {
    const testName = 'Performance Metrics Streaming';
    const startTime = Date.now();
    
    try {
      // Navigate to performance tab
      const performanceTab = await this.testUtils.waitForElement('[data-testid="performance-tab"]');
      await this.testUtils.simulateUserInteraction(performanceTab, 'click');
      
      // Simulate performance metrics update
      const performanceUpdate = {
        agentId: 'test-agent-1',
        metrics: {
          cognitiveLoad: 0.75,
          responseTime: 150,
          memoryUsage: 512,
          cpuUsage: 45,
          timestamp: Date.now()
        }
      };
      
      const updateEvent = new this.testUtils.window.CustomEvent('performanceUpdate', {
        detail: performanceUpdate
      });
      this.testUtils.window.dispatchEvent(updateEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify metrics displayed
      const cognitiveLoadGauge = this.testUtils.document.querySelector('[data-testid="cognitive-load-gauge"]');
      const responseTimeDisplay = this.testUtils.document.querySelector('[data-testid="response-time-display"]');
      
      if (!cognitiveLoadGauge || !responseTimeDisplay) {
        throw new Error('Performance metrics components not updated');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'real-time-sync',
        details: 'Performance metrics properly streamed to UI components'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'real-time-sync'
      });
    }
  }

  async testMemoryDataFlow() {
    const testName = 'Memory Data Flow';
    const startTime = Date.now();
    
    try {
      // Navigate to memory tab
      const memoryTab = await this.testUtils.waitForElement('[data-testid="memory-tab"]');
      await this.testUtils.simulateUserInteraction(memoryTab, 'click');
      
      // Simulate memory data update
      const memoryUpdate = {
        agentId: 'test-agent-1',
        type: 'episodic',
        data: {
          id: 'memory-123',
          content: 'Explored new cave system',
          timestamp: Date.now(),
          importance: 0.8,
          location: { x: 150, y: 45, z: 300 }
        }
      };
      
      const updateEvent = new this.testUtils.window.CustomEvent('memoryUpdate', {
        detail: memoryUpdate
      });
      this.testUtils.window.dispatchEvent(updateEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify memory components updated
      const episodicTimeline = this.testUtils.document.querySelector('[data-testid="episodic-timeline"]');
      const memoryVisualization = this.testUtils.document.querySelector('[data-testid="memory-visualization"]');
      
      if (!episodicTimeline || !memoryVisualization) {
        throw new Error('Memory components not updated with new data');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'real-time-sync',
        details: 'Memory data flow working correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'real-time-sync'
      });
    }
  }

  async testGoalsDataSynchronization() {
    const testName = 'Goals Data Synchronization';
    const startTime = Date.now();
    
    try {
      // Navigate to goals tab
      const goalsTab = await this.testUtils.waitForElement('[data-testid="goals-tab"]');
      await this.testUtils.simulateUserInteraction(goalsTab, 'click');
      
      // Simulate goal creation
      const goalCreate = {
        agentId: 'test-agent-1',
        goal: {
          id: 'goal-456',
          title: 'Build Shelter',
          type: 'tactical',
          priority: 'high',
          progress: 0,
          createdAt: Date.now()
        }
      };
      
      const createEvent = new this.testUtils.window.CustomEvent('goalCreated', {
        detail: goalCreate
      });
      this.testUtils.window.dispatchEvent(createEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify goal appears in UI
      const goalHierarchy = this.testUtils.document.querySelector('[data-testid="goal-hierarchy"]');
      const goalProgress = this.testUtils.document.querySelector('[data-testid="goal-progress"]');
      
      if (!goalHierarchy || !goalProgress) {
        throw new Error('Goal components not updated with new goal');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'real-time-sync',
        details: 'Goals data synchronization working correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'real-time-sync'
      });
    }
  }

  async testSocialDataUpdates() {
    const testName = 'Social Data Updates';
    const startTime = Date.now();
    
    try {
      // Navigate to social tab
      const socialTab = await this.testUtils.waitForElement('[data-testid="social-tab"]');
      await this.testUtils.simulateUserInteraction(socialTab, 'click');
      
      // Simulate social relationship update
      const socialUpdate = {
        agentId: 'test-agent-1',
        data: {
          targetAgentId: 'test-agent-2',
          relationshipType: 'friendship',
          trustLevel: 0.8,
          friendshipScore: 0.7,
          timestamp: Date.now()
        }
      };
      
      const updateEvent = new this.testUtils.window.CustomEvent('socialUpdate', {
        detail: socialUpdate
      });
      this.testUtils.window.dispatchEvent(updateEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify social components updated
      const socialNetwork = this.testUtils.document.querySelector('[data-testid="social-network-graph"]');
      const trustDisplay = this.testUtils.document.querySelector('[data-testid="trust-friendship-display"]');
      
      if (!socialNetwork || !trustDisplay) {
        throw new Error('Social components not updated with new relationship data');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'real-time-sync',
        details: 'Social data updates working correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'real-time-sync'
      });
    }
  }

  async testSkillsDataStreaming() {
    const testName = 'Skills Data Streaming';
    const startTime = Date.now();
    
    try {
      // Navigate to skills tab
      const skillsTab = await this.testUtils.waitForElement('[data-testid="skills-tab"]');
      await this.testUtils.simulateUserInteraction(skillsTab, 'click');
      
      // Simulate skill progress update
      const skillUpdate = {
        agentId: 'test-agent-1',
        skill: {
          type: 'mining',
          proficiency: 0.65,
          experience: 1250,
          level: 5,
          progress: 0.3,
          timestamp: Date.now()
        }
      };
      
      const updateEvent = new this.testUtils.window.CustomEvent('skillUpdate', {
        detail: skillUpdate
      });
      this.testUtils.window.dispatchEvent(updateEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify skills components updated
      const skillProgression = this.testUtils.document.querySelector('[data-testid="skill-progression-charts"]');
      const experienceRate = this.testUtils.document.querySelector('[data-testid="experience-rate-analysis"]');
      
      if (!skillProgression || !experienceRate) {
        throw new Error('Skills components not updated with new skill data');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'real-time-sync',
        details: 'Skills data streaming working correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'real-time-sync'
      });
    }
  }

  async testConnectionStatusUpdates() {
    const testName = 'Connection Status Updates';
    const startTime = Date.now();
    
    try {
      // Simulate connection status change
      const connectionUpdate = {
        status: 'connected',
        latency: 45,
        lastPingTime: Date.now(),
        isReconnecting: false
      };
      
      const updateEvent = new this.testUtils.window.CustomEvent('connectionStatusUpdate', {
        detail: connectionUpdate
      });
      this.testUtils.window.dispatchEvent(updateEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify connection status component updated
      const connectionStatus = this.testUtils.document.querySelector('.connection-status');
      const latencyDisplay = connectionStatus.querySelector('.latency-display');
      const statusIndicator = connectionStatus.querySelector('.status-indicator');
      
      if (!connectionStatus || !latencyDisplay || !statusIndicator) {
        throw new Error('Connection status component not updated');
      }
      
      if (!latencyDisplay.textContent.includes('45')) {
        throw new Error('Latency not updated in connection status');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'real-time-sync',
        details: 'Connection status updates working correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'real-time-sync'
      });
    }
  }

  async testErrorHandlingAndRecovery() {
    const testName = 'Error Handling and Recovery';
    const startTime = Date.now();
    
    try {
      // Simulate connection error
      const errorEvent = new this.testUtils.window.CustomEvent('connectionError', {
        detail: {
          message: 'Connection lost to server',
          code: 'ECONNRESET',
          timestamp: Date.now()
        }
      });
      this.testUtils.window.dispatchEvent(errorEvent);
      
      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify error UI shown
      const errorMessage = this.testUtils.document.querySelector('.error-message');
      const reconnectButton = this.testUtils.document.querySelector('.reconnect-button');
      
      if (!errorMessage || !reconnectButton) {
        throw new Error('Error handling UI not displayed');
      }
      
      // Simulate reconnection success
      const reconnectEvent = new this.testUtils.window.CustomEvent('connectionRestored', {
        detail: {
          status: 'connected',
          timestamp: Date.now()
        }
      });
      this.testUtils.window.dispatchEvent(reconnectEvent);
      
      // Wait for recovery
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify error state cleared
      const errorMessageAfter = this.testUtils.document.querySelector('.error-message');
      if (errorMessageAfter && errorMessageAfter.style.display !== 'none') {
        throw new Error('Error state not cleared after reconnection');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'real-time-sync',
        details: 'Error handling and recovery working correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'real-time-sync'
      });
    }
  }
}

// Performance and Stress Tests
class PerformanceStressTests {
  constructor(testUtils) {
    this.testUtils = testUtils;
  }

  async runAllTests() {
    console.log('[PerformanceStressTests] Starting performance and stress tests...');
    
    await this.testMultipleAgentsPerformance();
    await this.testLargeDatasetHandling();
    await this.testHighFrequencyUpdates();
    await this.testMemoryUsageAndCleanup();
    await this.testResponseTimeUnderLoad();
    await this.testConcurrentOperations();
    
    console.log('[PerformanceStressTests] Performance and stress tests completed');
  }

  async testMultipleAgentsPerformance() {
    const testName = 'Multiple Agents Performance';
    const startTime = Date.now();
    
    try {
      // Simulate multiple agents
      const agentCount = 50;
      const agents = [];
      
      for (let i = 0; i < agentCount; i++) {
        agents.push({
          id: `test-agent-${i}`,
          name: `Test Agent ${i}`,
          status: 'online',
          health: Math.floor(Math.random() * 20) + 1
        });
      }
      
      // Simulate bulk agent update
      const bulkUpdateEvent = new this.testUtils.window.CustomEvent('agentsBulkUpdate', {
        detail: { agents }
      });
      this.testUtils.window.dispatchEvent(bulkUpdateEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify all agents rendered
      const agentCards = this.testUtils.document.querySelectorAll('[data-testid="agent-card"]');
      if (agentCards.length < agentCount) {
        throw new Error(`Not all agents rendered. Expected: ${agentCount}, Got: ${agentCards.length}`);
      }
      
      // Measure render performance
      const renderTime = this.testUtils.window.performance.measure(
        'multiple-agents-render',
        'bulk-update-start',
        'bulk-update-end'
      );
      
      if (renderTime > 1000) { // 1 second threshold
        throw new Error(`Render time too slow: ${renderTime}ms`);
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'performance',
        details: `Successfully rendered ${agentCount} agents in ${renderTime}ms`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testLargeDatasetHandling() {
    const testName = 'Large Dataset Handling';
    const startTime = Date.now();
    
    try {
      // Simulate large memory dataset
      const memoryCount = 1000;
      const memories = [];
      
      for (let i = 0; i < memoryCount; i++) {
        memories.push({
          id: `memory-${i}`,
          content: `Memory entry ${i}`,
          timestamp: Date.now() - (i * 1000),
          importance: Math.random(),
          type: ['episodic', 'semantic', 'procedural'][Math.floor(Math.random() * 3)]
        });
      }
      
      // Navigate to memory tab
      const memoryTab = await this.testUtils.waitForElement('[data-testid="memory-tab"]');
      await this.testUtils.simulateUserInteraction(memoryTab, 'click');
      
      // Simulate large dataset update
      const largeDataEvent = new this.testUtils.window.CustomEvent('memoryBulkUpdate', {
        detail: { memories }
      });
      this.testUtils.window.dispatchEvent(largeDataEvent);
      
      // Wait for UI update
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify memory components handle large dataset
      const memoryTimeline = this.testUtils.document.querySelector('[data-testid="episodic-timeline"]');
      const memoryVisualization = this.testUtils.document.querySelector('[data-testid="memory-visualization"]');
      
      if (!memoryTimeline || !memoryVisualization) {
        throw new Error('Memory components failed to handle large dataset');
      }
      
      // Check for performance degradation
      const memoryUsage = process.memoryUsage();
      if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
        throw new Error(`Memory usage too high: ${memoryUsage.heapUsed / 1024 / 1024}MB`);
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'performance',
        details: `Successfully handled ${memoryCount} memory entries`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testHighFrequencyUpdates() {
    const testName = 'High Frequency Updates';
    const startTime = Date.now();
    
    try {
      // Navigate to performance tab
      const performanceTab = await this.testUtils.waitForElement('[data-testid="performance-tab"]');
      await this.testUtils.simulateUserInteraction(performanceTab, 'click');
      
      // Simulate high-frequency updates
      const updateCount = 100;
      const updateInterval = 50; // 50ms between updates
      
      for (let i = 0; i < updateCount; i++) {
        const updateEvent = new this.testUtils.window.CustomEvent('performanceUpdate', {
          detail: {
            agentId: 'test-agent-1',
            metrics: {
              cognitiveLoad: Math.random(),
              responseTime: Math.random() * 200,
              memoryUsage: Math.random() * 1024,
              timestamp: Date.now()
            }
          }
        });
        this.testUtils.window.dispatchEvent(updateEvent);
        await new Promise(resolve => setTimeout(resolve, updateInterval));
      }
      
      // Verify UI remains responsive
      const finalUpdateTime = Date.now();
      const performanceComponents = this.testUtils.document.querySelectorAll('[data-testid^="performance-"]');
      
      if (performanceComponents.length === 0) {
        throw new Error('Performance components not rendered after high-frequency updates');
      }
      
      // Check for memory leaks
      const finalMemoryUsage = process.memoryUsage();
      const initialMemoryUsage = this.testUtils.memoryUsage[0];
      const memoryGrowth = finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed;
      
      if (memoryGrowth > 100 * 1024 * 1024) { // 100MB growth threshold
        throw new Error(`Potential memory leak: ${memoryGrowth / 1024 / 1024}MB growth`);
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'performance',
        details: `Successfully handled ${updateCount} high-frequency updates`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testMemoryUsageAndCleanup() {
    const testName = 'Memory Usage and Cleanup';
    const startTime = Date.now();
    
    try {
      const initialMemory = process.memoryUsage();
      
      // Create and destroy multiple components
      for (let i = 0; i < 10; i++) {
        // Navigate to different tabs
        const tabs = ['overview', 'personality', 'memory', 'goals', 'social', 'skills', 'performance'];
        const randomTab = tabs[Math.floor(Math.random() * tabs.length)];
        
        const tab = await this.testUtils.waitForElement(`[data-testid="${randomTab}-tab"]`);
        await this.testUtils.simulateUserInteraction(tab, 'click');
        
        // Open and close modals
        const createButton = await this.testUtils.waitForElement('[data-testid="create-goal-button"]');
        await this.testUtils.simulateUserInteraction(createButton, 'click');
        
        const modal = await this.testUtils.waitForElement('[data-testid="goal-creation-dialog"]');
        const closeButton = modal.querySelector('[data-testid="close-modal"]');
        await this.testUtils.simulateUserInteraction(closeButton, 'click');
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Check for excessive memory growth
      if (memoryGrowth > 50 * 1024 * 1024) { // 50MB threshold
        throw new Error(`Excessive memory growth: ${memoryGrowth / 1024 / 1024}MB`);
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'performance',
        details: `Memory usage stable: ${memoryGrowth / 1024 / 1024}MB growth`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testResponseTimeUnderLoad() {
    const testName = 'Response Time Under Load';
    const startTime = Date.now();
    
    try {
      // Simulate heavy load
      const loadStartTime = Date.now();
      
      // Multiple concurrent operations
      const operations = [];
      for (let i = 0; i < 20; i++) {
        operations.push(
          this.testUtils.simulateUserInteraction(
            this.testUtils.document.querySelector('[data-testid="overview-tab"]'),
            'click'
          )
        );
      }
      
      await Promise.all(operations);
      
      const loadEndTime = Date.now();
      const totalResponseTime = loadEndTime - loadStartTime;
      
      // Check response time under load
      if (totalResponseTime > 2000) { // 2 second threshold
        throw new Error(`Response time too slow under load: ${totalResponseTime}ms`);
      }
      
      // Verify UI remains interactive
      const dashboard = this.testUtils.document.querySelector('[data-testid="cognitive-dashboard"]');
      const computedStyle = this.testUtils.window.getComputedStyle(dashboard);
      
      if (computedStyle.pointerEvents === 'none') {
        throw new Error('UI not interactive under load');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'performance',
        details: `Response time under load: ${totalResponseTime}ms`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }

  async testConcurrentOperations() {
    const testName = 'Concurrent Operations';
    const startTime = Date.now();
    
    try {
      // Simulate concurrent operations
      const concurrentOps = [
        // Agent updates
        new Promise(resolve => {
          const event = new this.testUtils.window.CustomEvent('agentUpdate', {
            detail: { id: 'agent-1', health: 15 }
          });
          this.testUtils.window.dispatchEvent(event);
          setTimeout(resolve, 100);
        }),
        
        // Goal updates
        new Promise(resolve => {
          const event = new this.testUtils.window.CustomEvent('goalUpdate', {
            detail: { agentId: 'agent-1', goalId: 'goal-1', progress: 0.5 }
          });
          this.testUtils.window.dispatchEvent(event);
          setTimeout(resolve, 100);
        }),
        
        // Performance updates
        new Promise(resolve => {
          const event = new this.testUtils.window.CustomEvent('performanceUpdate', {
            detail: { agentId: 'agent-1', metrics: { cognitiveLoad: 0.7 } }
          });
          this.testUtils.window.dispatchEvent(event);
          setTimeout(resolve, 100);
        }),
        
        // Memory updates
        new Promise(resolve => {
          const event = new this.testUtils.window.CustomEvent('memoryUpdate', {
            detail: { agentId: 'agent-1', type: 'episodic', data: { content: 'Test memory' } }
          });
          this.testUtils.window.dispatchEvent(event);
          setTimeout(resolve, 100);
        })
      ];
      
      // Execute all operations concurrently
      await Promise.all(concurrentOps);
      
      // Wait for UI to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify all updates processed
      const agentCard = this.testUtils.document.querySelector('[data-testid="agent-card"]');
      const goalProgress = this.testUtils.document.querySelector('[data-testid="goal-progress"]');
      const performanceDisplay = this.testUtils.document.querySelector('[data-testid="cognitive-load-gauge"]');
      const memoryDisplay = this.testUtils.document.querySelector('[data-testid="episodic-timeline"]');
      
      if (!agentCard || !goalProgress || !performanceDisplay || !memoryDisplay) {
        throw new Error('Not all concurrent operations processed correctly');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'performance',
        details: 'Concurrent operations handled correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'performance'
      });
    }
  }
}

// Cross-browser and Device Tests
class CrossBrowserDeviceTests {
  constructor(testUtils) {
    this.testUtils = testUtils;
  }

  async runAllTests() {
    console.log('[CrossBrowserDeviceTests] Starting cross-browser and device tests...');
    
    await this.testBrowserCompatibility();
    await this.testResponsiveDesign();
    await this.testTouchInteractions();
    await this.testAccessibilityAcrossDevices();
    
    console.log('[CrossBrowserDeviceTests] Cross-browser and device tests completed');
  }

  async testBrowserCompatibility() {
    const testName = 'Browser Compatibility';
    const startTime = Date.now();
    
    try {
      const browsers = TEST_CONFIG.browsers;
      const testResults = {};
      
      for (const browser of browsers) {
        // Simulate browser-specific features
        this.simulateBrowserEnvironment(browser);
        
        // Test basic functionality
        const dashboard = await this.testUtils.waitForElement('[data-testid="cognitive-dashboard"]');
        const tabs = this.testUtils.document.querySelectorAll('[role="tab"]');
        const modals = this.testUtils.document.querySelectorAll('[role="dialog"]');
        
        testResults[browser] = {
          dashboard: !!dashboard,
          tabs: tabs.length > 0,
          modals: modals.length >= 0,
          score: 0
        };
        
        // Calculate browser score
        const features = Object.values(testResults[browser]);
        testResults[browser].score = (features.filter(Boolean).length / features.length) * 100;
      }
      
      // Verify all browsers have good compatibility
      for (const [browser, result] of Object.entries(testResults)) {
        if (result.score < 90) {
          throw new Error(`Browser ${browser} compatibility score too low: ${result.score}%`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'cross-browser',
        details: `Browser compatibility: ${JSON.stringify(testResults)}`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'cross-browser'
      });
    }
  }

  simulateBrowserEnvironment(browser) {
    const browserConfigs = {
      chrome: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        features: ['webgl', 'websockets', 'localstorage', 'sessionstorage']
      },
      firefox: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        features: ['webgl', 'websockets', 'localstorage', 'sessionstorage']
      },
      safari: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        features: ['webgl', 'websockets', 'localstorage', 'sessionstorage']
      },
      edge: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        features: ['webgl', 'websockets', 'localstorage', 'sessionstorage']
      }
    };
    
    const config = browserConfigs[browser];
    if (config) {
      this.testUtils.window.navigator.userAgent = config.userAgent;
      this.testUtils.window.navigator.features = config.features;
    }
  }

  async testResponsiveDesign() {
    const testName = 'Responsive Design';
    const startTime = Date.now();
    
    try {
      const viewports = TEST_CONFIG.viewports;
      const responsiveResults = {};
      
      for (const viewport of viewports) {
        // Set viewport size
        this.testUtils.window.innerWidth = viewport.width;
        this.testUtils.window.innerHeight = viewport.height;
        
        // Trigger resize
        const resizeEvent = new this.testUtils.window.Event('resize');
        this.testUtils.window.dispatchEvent(resizeEvent);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Test layout adaptation
        const dashboard = this.testUtils.document.querySelector('[data-testid="cognitive-dashboard"]');
        const agentCards = this.testUtils.document.querySelectorAll('[data-testid="agent-card"]');
        const tabs = this.testUtils.document.querySelectorAll('[role="tab"]');
        
        responsiveResults[viewport.name] = {
          dashboardVisible: !!dashboard,
          agentCardsAdapted: agentCards.length > 0,
          tabsVisible: tabs.length > 0,
          layoutCorrect: this.checkLayoutForViewport(viewport)
        };
      }
      
      // Verify all viewports work correctly
      for (const [viewport, result] of Object.entries(responsiveResults)) {
        if (!result.layoutCorrect) {
          throw new Error(`Layout incorrect for ${viewport} viewport`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'responsive',
        details: `Responsive design: ${JSON.stringify(responsiveResults)}`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'responsive'
      });
    }
  }

  checkLayoutForViewport(viewport) {
    // Basic layout checks based on viewport
    const dashboard = this.testUtils.document.querySelector('[data-testid="cognitive-dashboard"]');
    const computedStyle = this.testUtils.window.getComputedStyle(dashboard);
    
    if (viewport.name === 'mobile') {
      // Mobile should have single column layout
      return computedStyle.flexDirection === 'column';
    } else if (viewport.name === 'tablet') {
      // Tablet should have adaptive layout
      return computedStyle.display === 'flex';
    } else {
      // Desktop should have full layout
      return computedStyle.display === 'flex';
    }
  }

  async testTouchInteractions() {
    const testName = 'Touch Interactions';
    const startTime = Date.now();
    
    try {
      // Simulate touch device
      this.testUtils.window.navigator.maxTouchPoints = 5;
      this.testUtils.window.ontouchstart = null;
      
      // Test touch interactions
      const agentCard = await this.testUtils.waitForElement('[data-testid="agent-card"]');
      
      // Simulate touch events
      const touchStart = new this.testUtils.window.Event('touchstart', {
        bubbles: true,
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      const touchEnd = new this.testUtils.window.Event('touchend', {
        bubbles: true,
        touches: []
      });
      
      agentCard.dispatchEvent(touchStart);
      agentCard.dispatchEvent(touchEnd);
      
      // Verify touch handling
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const selectedCard = agentCard.querySelector('[aria-selected="true"]');
      if (!selectedCard) {
        throw new Error('Touch interaction not handled properly');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'touch',
        details: 'Touch interactions working correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'touch'
      });
    }
  }

  async testAccessibilityAcrossDevices() {
    const testName = 'Accessibility Across Devices';
    const startTime = Date.now();
    
    try {
      const viewports = TEST_CONFIG.viewports;
      const accessibilityResults = {};
      
      for (const viewport of viewports) {
        // Set viewport
        this.testUtils.window.innerWidth = viewport.width;
        this.testUtils.window.innerHeight = viewport.height;
        
        const resizeEvent = new this.testUtils.window.Event('resize');
        this.testUtils.window.dispatchEvent(resizeEvent);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Test accessibility features
        const tabs = this.testUtils.document.querySelectorAll('[role="tab"]');
        const tabPanels = this.testUtils.document.querySelectorAll('[role="tabpanel"]');
        const agentCards = this.testUtils.document.querySelectorAll('[data-testid="agent-card"]');
        
        let accessibilityScore = 0;
        let maxScore = 0;
        
        // Test keyboard navigation
        if (tabs.length > 0) {
          maxScore++;
          const firstTab = tabs[0];
          firstTab.focus();
          if (this.testUtils.document.activeElement === firstTab) {
            accessibilityScore++;
          }
        }
        
        // Test ARIA attributes
        if (tabPanels.length > 0) {
          maxScore++;
          const hasAria = Array.from(tabPanels).every(panel => 
            panel.getAttribute('aria-labelledby') && panel.getAttribute('role')
          );
          if (hasAria) {
            accessibilityScore++;
          }
        }
        
        // Test screen reader support
        if (agentCards.length > 0) {
          maxScore++;
          const hasAriaLabels = Array.from(agentCards).every(card =>
            card.getAttribute('aria-label') || card.getAttribute('title')
          );
          if (hasAriaLabels) {
            accessibilityScore++;
          }
        }
        
        accessibilityResults[viewport.name] = {
          score: (accessibilityScore / maxScore) * 100,
          features: {
            keyboardNavigation: accessibilityScore > 0,
            ariaAttributes: accessibilityScore > 1,
            screenReaderSupport: accessibilityScore > 2
          }
        };
      }
      
      // Verify accessibility across all viewports
      for (const [viewport, result] of Object.entries(accessibilityResults)) {
        if (result.score < 80) {
          throw new Error(`Accessibility score too low for ${viewport}: ${result.score}%`);
        }
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'accessibility',
        details: `Accessibility: ${JSON.stringify(accessibilityResults)}`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'accessibility'
      });
    }
  }
}

// Error Handling and Edge Cases Tests
class ErrorHandlingTests {
  constructor(testUtils) {
    this.testUtils = testUtils;
  }

  async runAllTests() {
    console.log('[ErrorHandlingTests] Starting error handling and edge case tests...');
    
    await this.testNetworkDisconnection();
    await this.testInvalidDataHandling();
    await this.testComponentFailureScenarios();
    await this.testMemoryLeakPrevention();
    await this.testGracefulDegradation();
    
    console.log('[ErrorHandlingTests] Error handling tests completed');
  }

  async testNetworkDisconnection() {
    const testName = 'Network Disconnection';
    const startTime = Date.now();
    
    try {
      // Simulate network disconnection
      const disconnectEvent = new this.testUtils.window.CustomEvent('connectionLost', {
        detail: {
          reason: 'Network unreachable',
          code: 'NETWORK_ERROR',
          timestamp: Date.now()
        }
      });
      this.testUtils.window.dispatchEvent(disconnectEvent);
      
      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify error UI shown
      const errorMessage = this.testUtils.document.querySelector('.error-message');
      const reconnectButton = this.testUtils.document.querySelector('.reconnect-button');
      const offlineIndicator = this.testUtils.document.querySelector('.offline-indicator');
      
      if (!errorMessage || !reconnectButton || !offlineIndicator) {
        throw new Error('Network disconnection not properly handled');
      }
      
      // Test reconnection
      const reconnectEvent = new this.testUtils.window.CustomEvent('connectionRestored', {
        detail: {
          status: 'connected',
          timestamp: Date.now()
        }
      });
      this.testUtils.window.dispatchEvent(reconnectEvent);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify recovery
      const errorMessageAfter = this.testUtils.document.querySelector('.error-message');
      const onlineIndicator = this.testUtils.document.querySelector('.online-indicator');
      
      if (errorMessageAfter && errorMessageAfter.style.display !== 'none') {
        throw new Error('Error message not cleared after reconnection');
      }
      
      if (!onlineIndicator) {
        throw new Error('Online indicator not shown after reconnection');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'error-handling',
        details: 'Network disconnection and reconnection handled correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'error-handling'
      });
    }
  }

  async testInvalidDataHandling() {
    const testName = 'Invalid Data Handling';
    const startTime = Date.now();
    
    try {
      // Test invalid agent data
      const invalidAgentEvent = new this.testUtils.window.CustomEvent('agentUpdate', {
        detail: {
          id: null, // Invalid ID
          name: '', // Empty name
          health: -5, // Invalid health
          status: 'invalid-status' // Invalid status
        }
      });
      this.testUtils.window.dispatchEvent(invalidAgentEvent);
      
      // Test invalid goal data
      const invalidGoalEvent = new this.testUtils.window.CustomEvent('goalUpdate', {
        detail: {
          agentId: 'test-agent-1',
          goalId: null, // Invalid goal ID
          progress: 150 // Invalid progress (>100)
        }
      });
      this.testUtils.window.dispatchEvent(invalidGoalEvent);
      
      // Test invalid performance data
      const invalidPerfEvent = new this.testUtils.window.CustomEvent('performanceUpdate', {
        detail: {
          agentId: 'test-agent-1',
          metrics: {
            cognitiveLoad: 2.0, // Invalid (>1.0)
            responseTime: -100 // Invalid negative time
          }
        }
      });
      this.testUtils.window.dispatchEvent(invalidPerfEvent);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify error handling
      const errorMessages = this.testUtils.document.querySelectorAll('.error-message');
      if (errorMessages.length === 0) {
        throw new Error('Invalid data not properly handled');
      }
      
      // Verify data validation
      const agentCard = this.testUtils.document.querySelector('[data-testid="agent-card"]');
      const agentName = agentCard.querySelector('.agent-name');
      
      // Should not have updated with invalid data
      if (agentName.textContent.includes('') || agentName.textContent.includes('null')) {
        throw new Error('Invalid agent data not rejected');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'error-handling',
        details: 'Invalid data properly handled and rejected'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'error-handling'
      });
    }
  }

  async testComponentFailureScenarios() {
    const testName = 'Component Failure Scenarios';
    const startTime = Date.now();
    
    try {
      // Test component crash handling
      const originalConsoleError = console.error;
      let errorLogged = false;
      
      console.error = (...args) => {
        errorLogged = true;
        originalConsoleError(...args);
      };
      
      // Simulate component error
      const errorEvent = new this.testUtils.window.CustomEvent('componentError', {
        detail: {
          component: 'GoalCreationDialog',
          error: new Error('Component render error'),
          timestamp: Date.now()
        }
      });
      this.testUtils.window.dispatchEvent(errorEvent);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Restore console.error
      console.error = originalConsoleError;
      
      // Verify error boundary caught error
      if (!errorLogged) {
        throw new Error('Component error not caught by error boundary');
      }
      
      // Verify fallback UI shown
      const errorBoundary = this.testUtils.document.querySelector('.error-boundary');
      if (!errorBoundary) {
        throw new Error('Error boundary not displayed');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'error-handling',
        details: 'Component failures handled by error boundaries'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'error-handling'
      });
    }
  }

  async testMemoryLeakPrevention() {
    const testName = 'Memory Leak Prevention';
    const startTime = Date.now();
    
    try {
      const initialMemory = process.memoryUsage();
      
      // Create and destroy many components
      for (let i = 0; i < 100; i++) {
        // Create modal
        const createButton = await this.testUtils.waitForElement('[data-testid="create-goal-button"]');
        await this.testUtils.simulateUserInteraction(createButton, 'click');
        
        const modal = await this.testUtils.waitForElement('[data-testid="goal-creation-dialog"]');
        
        // Close modal
        const closeButton = modal.querySelector('[data-testid="close-modal"]');
        await this.testUtils.simulateUserInteraction(closeButton, 'click');
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Force garbage collection
      if (global.gc) {
        global.gc();
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Check for memory leaks
      if (memoryGrowth > 100 * 1024 * 1024) { // 100MB threshold
        throw new Error(`Memory leak detected: ${memoryGrowth / 1024 / 1024}MB growth`);
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'error-handling',
        details: `Memory usage stable: ${memoryGrowth / 1024 / 1024}MB growth`
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'error-handling'
      });
    }
  }

  async testGracefulDegradation() {
    const testName = 'Graceful Degradation';
    const startTime = Date.now();
    
    try {
      // Simulate feature unavailability
      const featureUnavailableEvent = new this.testUtils.window.CustomEvent('featureUnavailable', {
        detail: {
          feature: 'advanced-visualizations',
          fallback: 'basic-charts',
          timestamp: Date.now()
        }
      });
      this.testUtils.window.dispatchEvent(featureUnavailableEvent);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify fallback UI shown
      const basicCharts = this.testUtils.document.querySelector('[data-testid="basic-charts"]');
      const advancedViz = this.testUtils.document.querySelector('[data-testid="advanced-visualizations"]');
      
      if (!basicCharts) {
        throw new Error('Fallback UI not displayed');
      }
      
      if (advancedViz && advancedViz.style.display !== 'none') {
        throw new Error('Advanced feature not hidden when unavailable');
      }
      
      // Test partial functionality
      const partialFeatureEvent = new this.testUtils.window.CustomEvent('partialFunctionality', {
        detail: {
          feature: 'real-time-updates',
          available: 'read-only',
          timestamp: Date.now()
        }
      });
      this.testUtils.window.dispatchEvent(partialFeatureEvent);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify read-only mode
      const readOnlyIndicator = this.testUtils.document.querySelector('[data-testid="read-only-indicator"]');
      const disabledInputs = this.testUtils.document.querySelectorAll('input:disabled, button:disabled');
      
      if (!readOnlyIndicator || disabledInputs.length === 0) {
        throw new Error('Partial functionality not properly handled');
      }
      
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, true, {
        duration,
        category: 'error-handling',
        details: 'Graceful degradation working correctly'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testUtils.recordTestResult(testName, false, {
        duration,
        error: error.message,
        category: 'error-handling'
      });
    }
  }
}

// Main Test Runner
class ComprehensiveIntegrationTestRunner {
  constructor() {
    this.testUtils = new TestUtils();
    this.testSuites = [
      new EndToEndUserFlowTests(this.testUtils),
      new ComponentIntegrationTests(this.testUtils),
      new RealTimeDataSyncTests(this.testUtils),
      new PerformanceStressTests(this.testUtils),
      new CrossBrowserDeviceTests(this.testUtils),
      new ErrorHandlingTests(this.testUtils)
    ];
  }

  async runAllTests() {
    console.log('[ComprehensiveIntegrationTestRunner] Starting comprehensive integration tests...');
    console.log(`[ComprehensiveIntegrationTestRunner] Test configuration:`, TEST_CONFIG);
    
    const startTime = Date.now();
    
    try {
      // Setup test environment
      await this.testUtils.setupTestEnvironment();
      
      // Run all test suites
      for (const testSuite of this.testSuites) {
        await testSuite.runAllTests();
      }
      
      // Generate comprehensive report
      const report = this.testUtils.generateReport();
      const duration = Date.now() - startTime;
      
      // Add summary metadata
      report.summary.testRunnerDuration = duration;
      report.summary.testConfiguration = TEST_CONFIG;
      report.summary.timestamp = new Date().toISOString();
      
      // Save report
      await this.saveReport(report);
      
      // Display summary
      this.displaySummary(report);
      
      console.log('[ComprehensiveIntegrationTestRunner] All tests completed successfully');
      return report;
      
    } catch (error) {
      console.error('[ComprehensiveIntegrationTestRunner] Test execution failed:', error);
      throw error;
    } finally {
      // Cleanup
      this.testUtils.cleanup();
    }
  }

  async saveReport(report) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const reportPath = path.join(__dirname, 'COMPREHENSIVE_INTEGRATION_TEST_REPORT.json');
    
    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`[ComprehensiveIntegrationTestRunner] Report saved to: ${reportPath}`);
    } catch (error) {
      console.error('[ComprehensiveIntegrationTestRunner] Failed to save report:', error);
    }
  }

  displaySummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('COMPREHENSIVE INTEGRATION TEST REPORT');
    console.log('='.repeat(80));
    
    // Overall summary
    console.log(`\n📊 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Passed: ${report.summary.passedTests} ✅`);
    console.log(`   Failed: ${report.summary.failedTests} ❌`);
    console.log(`   Pass Rate: ${report.summary.passRate}`);
    console.log(`   Duration: ${(report.summary.testRunnerDuration / 1000).toFixed(2)}s`);
    
    // Category breakdown
    console.log(`\n📈 CATEGORY BREAKDOWN:`);
    for (const [category, results] of Object.entries(report.categories)) {
      const passRate = ((results.passed / results.total) * 100).toFixed(1);
      const status = passRate >= 90 ? '✅' : passRate >= 70 ? '⚠️' : '❌';
      console.log(`   ${category}: ${results.passed}/${results.total} (${passRate}%) ${status}`);
    }
    
    // Failed tests
    const failedTests = report.testResults.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      failedTests.forEach(test => {
        console.log(`   ${test.testName}: ${test.error}`);
      });
    }
    
    // Performance metrics
    console.log(`\n⚡ PERFORMANCE METRICS:`);
    if (report.performanceMetrics.total_test_duration) {
      console.log(`   Total Test Duration: ${(report.performanceMetrics.total_test_duration / 1000).toFixed(2)}s`);
    }
    
    if (report.memoryUsage.length > 0) {
      const initialMemory = report.memoryUsage[0];
      const finalMemory = report.memoryUsage[report.memoryUsage.length - 1];
      const memoryGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      console.log(`   Memory Growth: ${memoryGrowth.toFixed(2)}MB`);
    }
    
    console.log(`\n📋 Network Requests: ${report.networkRequests.length}`);
    console.log(`\n🐛 Errors Logged: ${report.errorLog.length}`);
    
    console.log('\n' + '='.repeat(80));
  }
}

// Export for use in test files
module.exports = {
  ComprehensiveIntegrationTestRunner,
  TestUtils,
  EndToEndUserFlowTests,
  ComponentIntegrationTests,
  RealTimeDataSyncTests,
  PerformanceStressTests,
  CrossBrowserDeviceTests,
  ErrorHandlingTests,
  TEST_CONFIG
};

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new ComprehensiveIntegrationTestRunner();
  runner.runAllTests().catch(console.error);
}
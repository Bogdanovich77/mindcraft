/**
 * Comprehensive Testing Configuration
 * Central configuration for all testing scenarios
 */

import type { Config } from 'jest';

export const testConfig: Config = {
  // Test environment setup
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.ts'],
  
  // Module path mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // File patterns
  testMatch: [
    '<rootDir>/test/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.test.(ts|tsx|js|jsx)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/test/mocks/',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(ts|tsx|js|jsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Performance settings
  maxWorkers: '50%',
  testTimeout: 10000,
  
  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};

// Socket.IO testing configuration
export const socketIOConfig = {
  url: process.env.TEST_SOCKET_URL || 'ws://localhost:3000',
  namespace: '/agent',
  timeout: 5000,
  reconnectAttempts: 3,
  reconnectDelay: 1000,
};

// Performance testing configuration
export const performanceConfig = {
  // Load testing parameters
  loadTesting: {
    concurrentUsers: [1, 5, 10, 25, 50],
    duration: 30000, // 30 seconds
    rampUpTime: 5000, // 5 seconds
    thinkTime: 1000, // 1 second between actions
  },
  
  // Rendering performance thresholds
  rendering: {
    maxRenderTime: 16, // 60fps = 16.67ms per frame
    maxLayoutShift: 0.1,
    maxFirstInputDelay: 100,
    maxCumulativeLayoutShift: 0.25,
  },
  
  // Memory usage thresholds
  memory: {
    maxHeapSize: 100 * 1024 * 1024, // 100MB
    maxHeapGrowth: 10 * 1024 * 1024, // 10MB
    maxNodeCount: 10000,
  },
  
  // Bundle size thresholds
  bundleSize: {
    maxJsSize: 500 * 1024, // 500KB
    maxCssSize: 50 * 1024, // 50KB
    maxAssetSize: 1024 * 1024, // 1MB
  },
};

// Accessibility testing configuration
export const accessibilityConfig = {
  // WCAG 2.1 AA compliance levels
  wcagLevel: 'AA',
  
  // Axe-core rules configuration
  axeRules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-labels': { enabled: true },
    'focus-management': { enabled: true },
    'semantic-structure': { enabled: true },
    'image-alt-text': { enabled: true },
    'form-labels': { enabled: true },
    'link-purpose': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-roles': { enabled: true },
  },
  
  // Custom accessibility tests
  customTests: {
    'touch-target-size': { minSize: 44 }, // 44px minimum
    'text-resize': { maxZoom: 200 },
    'high-contrast': { contrastRatio: 4.5 },
    'reduced-motion': { respectPreference: true },
  },
};

// Security testing configuration
export const securityConfig = {
  // XSS protection tests
  xss: {
    vectors: [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '"><script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      '<svg onload=alert("xss")>',
    ],
    sanitization: true,
  },
  
  // CSRF protection tests
  csrf: {
    tokenValidation: true,
    sameOriginCheck: true,
  },
  
  // Content Security Policy tests
  csp: {
    scriptSrc: true,
    styleSrc: true,
    imgSrc: true,
    connectSrc: true,
    fontSrc: true,
    mediaSrc: true,
  },
  
  // Data validation tests
  dataValidation: {
    inputSanitization: true,
    outputEncoding: true,
    sqlInjectionProtection: true,
  },
};

// User experience testing configuration
export const uxConfig = {
  // Response time thresholds
  responseTime: {
    excellent: 100, // < 100ms
    good: 300, // < 300ms
    acceptable: 1000, // < 1s
    poor: 3000, // < 3s
  },
  
  // Usability metrics
  usability: {
    taskSuccessRate: 0.95, // 95%
    taskCompletionTime: 30000, // 30 seconds
    errorRate: 0.05, // 5%
    satisfactionScore: 4.0, // 4.0/5.0
  },
  
  // Mobile usability
  mobile: {
    touchTargetSize: 44, // 44px minimum
    readableTextSize: 16, // 16px minimum
    thumbReachability: 75, // 75% of screen
  },
  
  // Browser compatibility
  browsers: {
    chrome: { minVersion: 90 },
    firefox: { minVersion: 88 },
    safari: { minVersion: 14 },
    edge: { minVersion: 90 },
  },
};

// Deployment testing configuration
export const deploymentConfig = {
  // Environment validation
  environments: ['development', 'staging', 'production'],
  
  // Health check endpoints
  healthChecks: [
    '/health',
    '/api/health',
    '/socket.io/',
  ],
  
  // Performance budgets
  performanceBudgets: {
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    firstInputDelay: 100,
    cumulativeLayoutShift: 0.1,
    totalBlockingTime: 300,
  },
  
  // Error monitoring
  errorTracking: {
    errorRate: 0.01, // 1%
    crashRate: 0.001, // 0.1%
    responseTimeP95: 2000, // 2 seconds
  },
};

// Mock data configuration
export const mockDataConfig = {
  // Agent data generation
  agents: {
    count: 10,
    variation: 0.3, // 30% variation in values
    updateInterval: 1000, // 1 second
  },
  
  // Performance data simulation
  performance: {
    responseTimeRange: [50, 500],
    successRateRange: [0.8, 1.0],
    errorRateRange: [0.0, 0.2],
  },
  
  // Socket.IO event simulation
  events: [
    'agent:state',
    'agent:connected',
    'agent:disconnected',
    'system:status',
    'error',
  ],
  
  // Error simulation
  errors: {
    networkErrorRate: 0.05, // 5%
    socketDisconnectionRate: 0.02, // 2%
    dataCorruptionRate: 0.01, // 1%
  },
};

// Test reporting configuration
export const reportingConfig = {
  // Report formats
  formats: ['json', 'html', 'junit', 'markdown'],
  
  // Report destinations
  destinations: [
    './test-results',
    './coverage',
    './reports',
  ],
  
  // Notification settings
  notifications: {
    email: false,
    slack: false,
    github: false,
    console: true,
  },
  
  // Report content
  include: {
    summary: true,
    details: true,
    coverage: true,
    performance: true,
    accessibility: true,
    security: true,
  },
};

export default {
  testConfig,
  socketIOConfig,
  performanceConfig,
  accessibilityConfig,
  securityConfig,
  uxConfig,
  deploymentConfig,
  mockDataConfig,
  reportingConfig,
};
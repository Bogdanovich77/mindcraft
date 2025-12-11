/**
 * Jest Test Setup
 * Global configuration and mocks for all test files
 */

import '@testing-library/jest-dom';

// Mock Web APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    zIndex: '0',
  }),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    ...performance,
    getEntriesByType: () => [],
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
    now: () => Date.now(),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock canvas
HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({ data: new Array(4) }),
  putImageData: () => {},
  createImageData: () => ({ data: new Array(4) }),
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  fillText: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fill: () => {},
  measureText: () => ({ width: 0 }),
  transform: () => {},
  rect: () => {},
  clip: () => {},
}) as any;

// Mock fetch
global.fetch = () => Promise.resolve() as any;

// Mock WebSocket
global.WebSocket = class WebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  readyState = 1;
  close = () => {};
  send = () => {};
  addEventListener = () => {};
  removeEventListener = () => {};
} as any;

// Global test utilities
global.createMockEvent = (type: string, data: any = {}) => {
  return new Event(type, { ...data });
};

global.createMockMouseEvent = (type: string, options: any = {}) => {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

global.createMockKeyboardEvent = (type: string, options: any = {}) => {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear storage
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Performance monitoring setup
const performanceMetrics = {
  renders: [],
  memoryUsage: [],
  networkRequests: [],
};

global.performanceMetrics = performanceMetrics;

// Mock performance.now for consistent testing
let mockTime = 0;
Object.defineProperty(performance, 'now', {
  value: () => {
    mockTime += 16; // Simulate 60fps
    return mockTime;
  },
});

export default {
  performanceMetrics,
};
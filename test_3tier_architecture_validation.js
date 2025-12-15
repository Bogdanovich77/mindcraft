/**
 * 3-Tier Architecture Validation Test
 *
 * This script validates the complete 3-tier architecture connection:
 * Frontend (5173) → FastAPI Gateway (8000) → Node.js Core (8081)
 *
 * Tests for:
 * 1. All three services running on correct ports
 * 2. WebSocket connection through FastAPI Gateway
 * 3. REST API endpoints accessibility
 * 4. ProfileService socket service availability
 * 5. Emotion duplicate loading issues (via frontend check)
 */

import http from 'http';
import https from 'https';
import { io as ClientIO } from 'socket.io-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const SERVICES = {
  FRONTEND: { port: 5173, host: 'localhost', name: 'Frontend (Vite)' },
  FASTAPI: { port: 8000, host: 'localhost', name: 'FastAPI Gateway' },
  NODE_CORE: { port: 8081, host: 'localhost', name: 'Node.js Core' }
};

const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function recordTest(name, passed, details = '') {
  TEST_RESULTS.total++;
  if (passed) {
    TEST_RESULTS.passed++;
    log(`${name}: PASSED ${details}`, 'pass');
  } else {
    TEST_RESULTS.failed++;
    log(`${name}: FAILED ${details}`, 'fail');
  }
  TEST_RESULTS.details.push({ name, passed, details });
}

function checkPort(port, host) {
  return new Promise((resolve) => {
    const req = http.request({
      host: host,
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    }).on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

function makeHttpRequest(url, options = {}) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    }).on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    }).on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });
    
    if (options.timeout) {
      req.setTimeout(options.timeout);
    }
    
    if (options.data) {
      req.write(options.data);
    }
    
    req.end();
  });
}

// Test functions
async function testServiceAvailability() {
  log('Testing service availability...');
  
  for (const [key, service] of Object.entries(SERVICES)) {
    const isAvailable = await checkPort(service.port, service.host);
    recordTest(
      `${service.name} (port ${service.port})`,
      isAvailable,
      isAvailable ? `Service responding` : 'Service not reachable'
    );
  }
}

async function testFastAPIEndpoints() {
  log('Testing FastAPI Gateway endpoints...');
  
  const endpoints = [
    { path: '/api/profiles', method: 'GET' },
    { path: '/api/agents', method: 'GET' },
    { path: '/api/system/status', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    const url = `http://${SERVICES.FASTAPI.host}:${SERVICES.FASTAPI.port}${endpoint.path}`;
    const result = await makeHttpRequest(url, { method: endpoint.method, timeout: 5000 });
    
    recordTest(
      `FastAPI ${endpoint.method} ${endpoint.path}`,
      result.success,
      result.success ? `Status ${result.statusCode}` : result.error || 'Request failed'
    );
  }
}

async function testWebSocketConnection() {
  log('Testing WebSocket connection through FastAPI Gateway...');
  
  return new Promise((resolve) => {
    const socket = ClientIO(`http://${SERVICES.FASTAPI.host}:${SERVICES.FASTAPI.port}`, {
      transports: ['websocket'],
      timeout: 5000
    });
    
    let connected = false;
    let timeout = setTimeout(() => {
      if (!connected) {
        recordTest('WebSocket connection', false, 'Connection timeout');
        socket.disconnect();
        resolve();
      }
    }, 5000);
    
    socket.on('connect', () => {
      connected = true;
      clearTimeout(timeout);
      recordTest('WebSocket connection', true, 'Connected to FastAPI Gateway');
      
      // Test authentication
      socket.emit('authenticate', { token: 'test-token' });
    });
    
    socket.on('authenticated', () => {
      recordTest('WebSocket authentication', true, 'Authentication successful');
      socket.disconnect();
      resolve();
    });
    
    socket.on('authentication_error', () => {
      recordTest('WebSocket authentication', false, 'Authentication failed');
      socket.disconnect();
      resolve();
    });
    
    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      recordTest('WebSocket connection', false, `Connection error: ${error.message}`);
      resolve();
    });
  });
}

async function testInternalCommunication() {
  log('Testing FastAPI to Node.js Core internal communication...');
  
  // Test if FastAPI can communicate with Node.js Core
  const url = `http://${SERVICES.FASTAPI.host}:${SERVICES.FASTAPI.port}/api/system/status`;
  const result = await makeHttpRequest(url, { timeout: 5000 });
  
  if (result.success && result.data) {
    try {
      const statusData = JSON.parse(result.data);
      const hasNodeCoreConnection = statusData.data && statusData.data.node_core_status;
      recordTest(
        'Internal communication (FastAPI → Node.js Core)',
        hasNodeCoreConnection,
        hasNodeCoreConnection ? 'Node.js Core accessible' : 'Node.js Core not accessible'
      );
    } catch (e) {
      recordTest(
        'Internal communication (FastAPI → Node.js Core)',
        false,
        'Invalid response format'
      );
    }
  } else {
    recordTest(
      'Internal communication (FastAPI → Node.js Core)',
      false,
      result.error || 'Failed to get system status'
    );
  }
}

function checkEmotionDuplicateLoading() {
  log('Checking for emotion duplicate loading issues...');
  
  // Check frontend package.json for emotion duplicates
  const packageJsonPath = path.join(__dirname, 'frontend', 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      
      const emotionPackages = Object.keys({ ...dependencies, ...devDependencies })
        .filter(name => name.includes('@emotion'));
      
      const hasDuplicates = emotionPackages.some(pkg => 
        dependencies[pkg] && devDependencies[pkg]
      );
      
      recordTest(
        'Emotion duplicate loading check',
        !hasDuplicates,
        hasDuplicates ? 
          `Potential duplicates found: ${emotionPackages.join(', ')}` : 
          `No duplicate emotion packages: ${emotionPackages.join(', ')}`
      );
      
      // Check for multiple @emotion/react instances
      const reactEmotionInDeps = dependencies['@emotion/react'];
      const reactEmotionInDevDeps = devDependencies['@emotion/react'];
      
      if (reactEmotionInDeps && reactEmotionInDevDeps) {
        recordTest(
          '@emotion/react specific check',
          false,
          'Found in both dependencies and devDependencies'
        );
      } else {
        recordTest(
          '@emotion/react specific check',
          true,
          'Correctly placed in one section only'
        );
      }
      
    } catch (error) {
      recordTest(
        'Emotion duplicate loading check',
        false,
        `Error reading package.json: ${error.message}`
      );
    }
  } else {
    recordTest(
      'Emotion duplicate loading check',
      false,
      'package.json not found'
    );
  }
}

function checkProfileServiceConfiguration() {
  log('Checking ProfileService configuration...');
  
  // Check frontend socket service configuration
  const envPath = path.join(__dirname, 'frontend', '.env.development');
  
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const socketUrlMatch = envContent.match(/VITE_SOCKET_URL=(.+)/);
      
      if (socketUrlMatch) {
        const socketUrl = socketUrlMatch[1].trim();
        const isCorrectPort = socketUrl.includes(':8000');
        
        recordTest(
          'ProfileService socket URL configuration',
          isCorrectPort,
          isCorrectPort ? 
            `Correctly configured: ${socketUrl}` : 
            `Incorrect port, should be port 8000: ${socketUrl}`
        );
      } else {
        recordTest(
          'ProfileService socket URL configuration',
          false,
          'VITE_SOCKET_URL not found in .env.development'
        );
      }
    } catch (error) {
      recordTest(
        'ProfileService socket URL configuration',
        false,
        `Error reading .env.development: ${error.message}`
      );
    }
  } else {
    recordTest(
      'ProfileService socket URL configuration',
      false,
      '.env.development file not found'
    );
  }
}

async function testProfileServiceConnection() {
  log('Testing ProfileService socket connection simulation...');
  
  // Simulate what ProfileService would do
  return new Promise((resolve) => {
    const socket = ClientIO(`http://${SERVICES.FASTAPI.host}:${SERVICES.FASTAPI.port}`, {
      transports: ['websocket'],
      timeout: 5000
    });
    
    let connected = false;
    let timeout = setTimeout(() => {
      if (!connected) {
        recordTest('ProfileService socket connection', false, 'Connection timeout');
        socket.disconnect();
        resolve();
      }
    }, 5000);
    
    socket.on('connect', () => {
      connected = true;
      clearTimeout(timeout);
      recordTest('ProfileService socket connection', true, 'Socket service available');
      
      // Test agent state subscription
      socket.emit('agent:subscribe', { agentId: 'test' });
    });
    
    socket.on('agent:state:update', (data) => {
      recordTest('ProfileService agent state updates', true, 'Receiving state updates');
      socket.disconnect();
      resolve();
    });
    
    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      recordTest('ProfileService socket connection', false, `Connection error: ${error.message}`);
      resolve();
    });
    
    // Handle other potential errors
    socket.on('error', (error) => {
      clearTimeout(timeout);
      recordTest('ProfileService socket connection', false, `Socket error: ${error.message}`);
      resolve();
    });
  });
}

async function runComprehensiveTest() {
  log('🚀 Starting 3-Tier Architecture Validation Test');
  log('================================================');
  
  // Run all tests
  await testServiceAvailability();
  await testFastAPIEndpoints();
  await testWebSocketConnection();
  await testInternalCommunication();
  checkEmotionDuplicateLoading();
  checkProfileServiceConfiguration();
  await testProfileServiceConnection();
  
  // Print final results
  log('\n📊 TEST RESULTS SUMMARY');
  log('========================');
  log(`Total Tests: ${TEST_RESULTS.total}`);
  log(`Passed: ${TEST_RESULTS.passed}`);
  log(`Failed: ${TEST_RESULTS.failed}`);
  log(`Success Rate: ${((TEST_RESULTS.passed / TEST_RESULTS.total) * 100).toFixed(1)}%`);
  
  if (TEST_RESULTS.failed > 0) {
    log('\n❌ FAILED TESTS:');
    TEST_RESULTS.details
      .filter(test => !test.passed)
      .forEach(test => log(`  - ${test.name}: ${test.details}`, 'fail'));
  }
  
  log('\n🔧 ARCHITECTURE STATUS:');
  if (TEST_RESULTS.failed === 0) {
    log('✅ All components working correctly - 3-Tier Architecture is fully functional!');
  } else {
    log('⚠️ Some components need attention - see failed tests above');
  }
  
  // Generate report file
  const reportPath = path.join(__dirname, 'reports', '3tier_architecture_validation_report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: TEST_RESULTS.total,
      passed: TEST_RESULTS.passed,
      failed: TEST_RESULTS.failed,
      successRate: ((TEST_RESULTS.passed / TEST_RESULTS.total) * 100).toFixed(1)
    },
    details: TEST_RESULTS.details,
    architecture: {
      frontend: `http://${SERVICES.FRONTEND.host}:${SERVICES.FRONTEND.port}`,
      fastapi: `http://${SERVICES.FASTAPI.host}:${SERVICES.FASTAPI.port}`,
      nodeCore: `http://${SERVICES.NODE_CORE.host}:${SERVICES.NODE_CORE.port}`
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return TEST_RESULTS.failed === 0;
}

// Main execution
async function main() {
  try {
    const success = await runComprehensiveTest();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`Fatal error during testing: ${error.message}`, 'fail');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  runComprehensiveTest,
  testServiceAvailability,
  testFastAPIEndpoints,
  testWebSocketConnection,
  testInternalCommunication,
  checkEmotionDuplicateLoading,
  checkProfileServiceConfiguration,
  testProfileServiceConnection
};
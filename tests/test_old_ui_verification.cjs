const http = require('http');

console.log('=== Old UI (MindServer) Verification Test ===');
console.log('Testing the old UI running on port 8080\n');

// Test configuration
const OLD_UI_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 5000; // 5 seconds

const testResults = {
  serverResponding: false,
  hasCorrectContent: false,
  agentDataAccessible: false,
  errors: []
};

console.log(`[TEST] Checking MindServer at ${OLD_UI_URL}...`);

// Test HTTP connection to MindServer
const req = http.get(OLD_UI_URL, (res) => {
  console.log(`[TEST] ✓ MindServer responded with status: ${res.statusCode}`);
  testResults.serverResponding = true;
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`[TEST] ✓ Received ${data.length} bytes of content`);
    
    // Check if it contains expected MindServer content
    if (data.includes('MindServer') || data.includes('mindcraft') || data.includes('agent')) {
      console.log(`[TEST] ✓ Content appears to be from MindServer`);
      testResults.hasCorrectContent = true;
    } else {
      console.log(`[TEST] ⚠️  Content may not be from expected MindServer`);
      console.log(`[TEST] Content preview: ${data.substring(0, 200)}...`);
    }
    
    // Test complete
    completeTest();
  });
});

req.on('error', (error) => {
  console.log(`[TEST] ✗ Error connecting to MindServer: ${error.message}`);
  testResults.errors.push(`HTTP Error: ${error.message}`);
  completeTest();
});

req.setTimeout(TEST_TIMEOUT, () => {
  console.log(`[TEST] ✗ Request timed out after ${TEST_TIMEOUT}ms`);
  testResults.errors.push('Request timeout');
  req.destroy();
  completeTest();
});

function completeTest() {
  console.log('\n=== Test Results ===');
  
  const allTestsPassed = testResults.serverResponding && 
                         testResults.hasCorrectContent;
  
  console.log(`Server Responding: ${testResults.serverResponding ? '✓' : '✗'}`);
  console.log(`Has Correct Content: ${testResults.hasCorrectContent ? '✓' : '✗'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors encountered:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log(`\nOverall Result: ${allTestsPassed ? '✓ PASSED' : '✗ FAILED'}`);
  
  if (allTestsPassed) {
    console.log('\n✅ Old UI (MindServer) is working correctly!');
    console.log('   - Server is responding on port 8080');
    console.log('   - Content is being served properly');
    console.log('   - Old UI should be accessible in browser');
    console.log('\nTo access the old UI:');
    console.log('   1. Open your browser and navigate to http://localhost:8080');
    console.log('   2. You should see the MindServer interface');
    console.log('   3. Agent data should be visible and updating');
  } else {
    console.log('\n❌ Old UI (MindServer) issues detected:');
    if (!testResults.serverResponding) {
      console.log('   - MindServer is not responding on port 8080');
    }
    if (!testResults.hasCorrectContent) {
      console.log('   - Content is not from expected MindServer');
    }
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}
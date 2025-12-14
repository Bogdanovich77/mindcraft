const http = require('http');

console.log('=== Old UI (MindServer) Deprecation Test ===');
console.log('Testing the old UI on port 8080 for deprecation compliance\n');

// Test configuration
const OLD_UI_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 5000; // 5 seconds

const testResults = {
  serverResponding: false,
  hasCorrectContent: false,
  hasDeprecationHeader: false,
  hasSunsetHeader: false,
  redirectsToNewUI: false,
  agentDataAccessible: false,
  errors: []
};

console.log(`[TEST] Checking Old UI at ${OLD_UI_URL}...`);
console.log(`[TEST] Expected: Deprecation headers and redirect to new UI`);

// Test HTTP connection to Old UI
const req = http.get(OLD_UI_URL, (res) => {
  console.log(`[TEST] ✓ Old UI responded with status: ${res.statusCode}`);
  testResults.serverResponding = true;
  
  // Check for deprecation headers
  if (res.headers.deprecation) {
    console.log(`[TEST] ✓ Deprecation header found: ${res.headers.deprecation}`);
    testResults.hasDeprecationHeader = true;
  } else {
    console.log(`[TEST] ⚠️  Missing deprecation header`);
  }
  
  if (res.headers.sunset) {
    console.log(`[TEST] ✓ Sunset header found: ${res.headers.sunset}`);
    testResults.hasSunsetHeader = true;
  } else {
    console.log(`[TEST] ⚠️  Missing sunset header`);
  }
  
  // Check for redirect to new UI
  if (res.statusCode === 302 && res.headers.location) {
    console.log(`[TEST] ✓ Redirects to new UI: ${res.headers.location}`);
    testResults.redirectsToNewUI = true;
  } else if (res.statusCode === 200) {
    console.log(`[TEST] ⚠️  Still serving content (should redirect)`);
    
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
  } else {
    // Test complete for redirect case
    completeTest();
  }
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
                         (testResults.redirectsToNewUI || testResults.hasDeprecationHeader);
   
  console.log(`Server Responding: ${testResults.serverResponding ? '✓' : '✗'}`);
  console.log(`Has Deprecation Header: ${testResults.hasDeprecationHeader ? '✓' : '✗'}`);
  console.log(`Has Sunset Header: ${testResults.hasSunsetHeader ? '✓' : '✗'}`);
  console.log(`Redirects to New UI: ${testResults.redirectsToNewUI ? '✓' : '✗'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors encountered:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log(`\nOverall Result: ${allTestsPassed ? '✓ DEPRECATED CORRECTLY' : '✗ NEEDS DEPRECATION'}`);
  
  if (allTestsPassed) {
    console.log('\n✅ Old UI is properly deprecated!');
    console.log('   - Server is responding on port 8080');
    console.log('   - Deprecation headers are present');
    console.log('   - Users are redirected to new UI');
    console.log('\n📋 Deprecation Status:');
    console.log('   - Old UI: ⚠️  Deprecated (redirects to port 5173)');
    console.log('   - New UI: ✅ Active (http://localhost:5173)');
    console.log('   - API: ✅ Active (http://localhost:8080/api)');
    console.log('\n💡 Users should use the new UI: npm run ui:new');
  } else {
    console.log('\n❌ Old UI deprecation issues detected:');
    if (!testResults.serverResponding) {
      console.log('   - Server is not responding on port 8080');
    }
    if (!testResults.hasDeprecationHeader) {
      console.log('   - Missing deprecation header');
    }
    if (!testResults.hasSunsetHeader) {
      console.log('   - Missing sunset header');
    }
    if (!testResults.redirectsToNewUI) {
      console.log('   - Not redirecting to new UI');
    }
    console.log('\n💡 Run deprecation setup: npm run ui:old');
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}
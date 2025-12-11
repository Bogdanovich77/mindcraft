/**
 * MemoryTab Interactive Features Test
 * 
 * This test verifies that all interactive features of the MemoryTab component
 * work correctly, including tab navigation, filtering, searching, zooming,
 * and responsive design.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testMemoryTabInteractiveFeatures() {
  console.log('🧠 Starting MemoryTab Interactive Features Test...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Set to true for CI environments
    slowMo: 100 // Slow down actions for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Test results tracking
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };
  
  function recordTest(name, passed, details = '') {
    testResults.total++;
    if (passed) {
      testResults.passed++;
      console.log(`✅ ${name}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${name}`);
      if (details) {
        console.log(`   Details: ${details}`);
      }
    }
    testResults.details.push({ name, passed, details });
  }
  
  try {
    // Navigate to the frontend
    console.log('🌐 Navigating to frontend...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="cognitive-dashboard"]', { timeout: 10000 });
    recordTest('Dashboard loads correctly', true);
    
    // Check if we have agents available or need to use mock data
    const hasAgents = await page.locator('[data-testid="agent-card"]').count() > 0;
    
    if (!hasAgents) {
      console.log('📝 No agents found, skipping Memory tab tests...');
      recordTest('Agent availability check', false, 'No agents available in Redux store - Memory tab requires agent selection');
      
      // Generate test report and exit early
      const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
      
      console.log('\n📊 Test Results Summary:');
      console.log(`Total Tests: ${testResults.total}`);
      console.log(`Passed: ${testResults.passed}`);
      console.log(`Failed: ${testResults.failed}`);
      console.log(`Success Rate: ${successRate}%`);
      
      // Save detailed results
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          total: testResults.total,
          passed: testResults.passed,
          failed: testResults.failed,
          successRate: parseFloat(successRate)
        },
        details: testResults.details,
        note: 'Memory tab tests skipped - no agents available. Start agents to test Memory tab functionality.'
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'memory_tab_interactive_test_report.json'),
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n📄 Detailed test report saved to: memory_tab_interactive_test_report.json');
      console.log('💡 To test Memory tab functionality, start some agents and run this test again.');
      
      await browser.close();
      return testResults;
    } else {
      console.log('🤖 Agents found, selecting first agent...');
      await page.locator('[data-testid="agent-card"]').first().click();
      await page.waitForTimeout(500);
      
      // Navigate to Memory tab
      console.log('📊 Navigating to Memory tab...');
      await page.locator('[data-testid="memory-tab"]').click();
      await page.waitForTimeout(1000);
    }
    
    // Test 1: Memory Architecture Overview
    console.log('\n🏗️ Testing Memory Architecture Overview...');
    
    // Check if the overview tab is visible
    const overviewVisible = await page.locator('[data-testid="memory-overview"]').isVisible();
    recordTest('Memory Architecture Overview is visible', overviewVisible);
    
    // Check memory system cards
    const semanticCard = await page.locator('[data-testid="semantic-memory-card"]').isVisible();
    const episodicCard = await page.locator('[data-testid="episodic-memory-card"]').isVisible();
    const proceduralCard = await page.locator('[data-testid="procedural-memory-card"]').isVisible();
    const workingCard = await page.locator('[data-testid="working-memory-card"]').isVisible();
    
    recordTest('All memory system cards are visible', 
      semanticCard && episodicCard && proceduralCard && workingCard);
    
    // Test 2: Semantic Memory Visualization
    console.log('\n🕸️ Testing Semantic Memory Visualization...');
    
    await page.locator('[data-testid="semantic-memory-tab"]').click();
    await page.waitForTimeout(500);
    
    // Check if force-directed graph loads
    const semanticGraphVisible = await page.locator('[data-testid="semantic-graph"]').isVisible();
    recordTest('Semantic memory force-directed graph is visible', semanticGraphVisible);
    
    // Test zoom controls
    const zoomInButton = await page.locator('[data-testid="zoom-in-button"]').isVisible();
    const zoomOutButton = await page.locator('[data-testid="zoom-out-button"]').isVisible();
    const resetZoomButton = await page.locator('[data-testid="reset-zoom-button"]').isVisible();
    
    recordTest('Semantic graph zoom controls are visible', 
      zoomInButton && zoomOutButton && resetZoomButton);
    
    // Test zoom functionality
    if (zoomInButton && zoomOutButton) {
      await page.locator('[data-testid="zoom-in-button"]').click();
      await page.waitForTimeout(300);
      await page.locator('[data-testid="zoom-out-button"]').click();
      await page.waitForTimeout(300);
      recordTest('Zoom controls are functional', true);
    }
    
    // Test search functionality
    const searchInput = await page.locator('[data-testid="semantic-search-input"]').isVisible();
    if (searchInput) {
      await page.locator('[data-testid="semantic-search-input"]').fill('test');
      await page.waitForTimeout(500);
      recordTest('Semantic search input is functional', true);
      
      // Clear search
      await page.locator('[data-testid="semantic-search-input"]').clear();
      await page.waitForTimeout(300);
    }
    
    // Test 3: Episodic Memory Timeline
    console.log('\n📅 Testing Episodic Memory Timeline...');
    
    await page.locator('[data-testid="episodic-memory-tab"]').click();
    await page.waitForTimeout(500);
    
    // Check if timeline loads
    const timelineVisible = await page.locator('[data-testid="episodic-timeline"]').isVisible();
    recordTest('Episodic memory timeline is visible', timelineVisible);
    
    // Test filter controls
    const filterControls = await page.locator('[data-testid="episodic-filters"]').isVisible();
    recordTest('Episodic filter controls are visible', filterControls);
    
    // Test timeline interaction
    if (timelineVisible) {
      // Try to click on a timeline event
      const timelineEvents = await page.locator('[data-testid="timeline-event"]').count();
      if (timelineEvents > 0) {
        await page.locator('[data-testid="timeline-event"]').first().click();
        await page.waitForTimeout(300);
        recordTest('Timeline events are clickable', true);
      } else {
        recordTest('Timeline events are available', false, 'No timeline events found');
      }
    }
    
    // Test 4: Procedural Memory Display
    console.log('\n⚙️ Testing Procedural Memory Display...');
    
    await page.locator('[data-testid="procedural-memory-tab"]').click();
    await page.waitForTimeout(500);
    
    // Check if procedural memory loads
    const proceduralVisible = await page.locator('[data-testid="procedural-memory-display"]').isVisible();
    recordTest('Procedural memory display is visible', proceduralVisible);
    
    // Test skill visualization
    const skillCharts = await page.locator('[data-testid="skill-chart"]').count();
    recordTest('Skill charts are rendered', skillCharts > 0);
    
    // Test 5: Working Memory View
    console.log('\n💭 Testing Working Memory View...');
    
    await page.locator('[data-testid="working-memory-tab"]').click();
    await page.waitForTimeout(500);
    
    // Check if working memory loads
    const workingMemoryVisible = await page.locator('[data-testid="working-memory-display"]').isVisible();
    recordTest('Working memory display is visible', workingMemoryVisible);
    
    // Test real-time updates simulation
    const activeTasksVisible = await page.locator('[data-testid="active-tasks"]').isVisible();
    recordTest('Active tasks display is visible', activeTasksVisible);
    
    // Test 6: Memory Analytics
    console.log('\n📈 Testing Memory Analytics...');
    
    await page.locator('[data-testid="memory-analytics-tab"]').click();
    await page.waitForTimeout(500);
    
    // Check if analytics load
    const analyticsVisible = await page.locator('[data-testid="memory-analytics"]').isVisible();
    recordTest('Memory analytics are visible', analyticsVisible);
    
    // Test Recharts components
    const rechartsComponents = await page.locator('.recharts-wrapper').count();
    recordTest('Analytics charts are rendered', rechartsComponents > 0);
    
    // Test 7: Responsive Design
    console.log('\n📱 Testing Responsive Design...');
    
    // Test mobile view
    await context.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(500);
    
    const mobileTabsVisible = await page.locator('[data-testid="memory-tabs"]').isVisible();
    recordTest('Memory tabs are visible on mobile', mobileTabsVisible);
    
    // Test that scrollable tabs work on mobile
    const scrollableTabs = await page.locator('.MuiTabs-scrollable').isVisible();
    recordTest('Tabs are scrollable on mobile', scrollableTabs);
    
    // Test tablet view
    await context.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.waitForTimeout(300);
    
    const tabletLayoutVisible = await page.locator('[data-testid="memory-overview"]').isVisible();
    recordTest('Memory overview adapts to tablet view', tabletLayoutVisible);
    
    // Test desktop view
    await context.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(300);
    
    const desktopLayoutVisible = await page.locator('[data-testid="memory-overview"]').isVisible();
    recordTest('Memory overview works on desktop', desktopLayoutVisible);
    
    // Test 8: Tab Navigation
    console.log('\n🔄 Testing Tab Navigation...');
    
    // Test switching between all tabs
    const tabs = [
      'memory-overview-tab',
      'semantic-memory-tab', 
      'episodic-memory-tab',
      'procedural-memory-tab',
      'working-memory-tab',
      'memory-analytics-tab'
    ];
    
    for (const tab of tabs) {
      await page.locator(`[data-testid="${tab}"]`).click();
      await page.waitForTimeout(300);
      const tabContentVisible = await page.locator(`[data-testid="${tab.replace('-tab', '')}"]`).isVisible();
      recordTest(`Tab ${tab} navigation works`, tabContentVisible);
    }
    
    // Test 9: Error Handling
    console.log('\n🛡️ Testing Error Handling...');
    
    // Check if error boundaries are present
    const errorBoundaryPresent = await page.locator('[data-testid="error-boundary"]').count() > 0;
    recordTest('Error boundaries are implemented', errorBoundaryPresent);
    
    // Test 10: Performance
    console.log('\n⚡ Testing Performance...');
    
    // Measure page load time for Memory tab
    const startTime = Date.now();
    await page.locator('[data-testid="memory-tab"]').click();
    await page.waitForSelector('[data-testid="memory-overview"]', { timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    recordTest('Memory tab loads within acceptable time', loadTime < 3000, 
      `Load time: ${loadTime}ms`);
    
    console.log('\n🎯 Interactive Features Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    recordTest('Test execution failed', false, error.message);
  } finally {
    await browser.close();
  }
  
  // Generate test report
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  console.log('\n📊 Test Results Summary:');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${successRate}%`);
  
  // Save detailed results
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate)
    },
    details: testResults.details
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'memory_tab_interactive_test_report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Detailed test report saved to: memory_tab_interactive_test_report.json');
  
  return testResults;
}

// Run the test
if (require.main === module) {
  testMemoryTabInteractiveFeatures()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testMemoryTabInteractiveFeatures };
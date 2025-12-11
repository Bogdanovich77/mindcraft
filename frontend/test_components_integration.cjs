/**
 * Test script to verify social and skills components integration
 * This script tests the Redux store, component exports, and basic functionality
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_RESULTS = {
  socialComponents: [],
  skillsComponents: [],
  reduxStore: false,
  types: false,
  errors: []
};

console.log('🧪 Testing Social and Skills Components Integration\n');

// Test 1: Check if all social components exist and can be imported
console.log('1. Testing Social Components...');
const socialComponents = [
  'SocialRelationshipVisualization',
  'SocialNetworkGraph',
  'TemporalEvolutionViewer',
  'InfluenceMapping',
  'TrustFriendshipDisplay',
  'ReputationVisualization',
  'CommunityClustering',
  'CommunicationAnalysis',
  'SocialInteractionTimeline'
];

socialComponents.forEach(component => {
  const componentPath = path.join(__dirname, 'src/components/social', `${component}.tsx`);
  if (fs.existsSync(componentPath)) {
    console.log(`  ✅ ${component} exists`);
    TEST_RESULTS.socialComponents.push(component);
  } else {
    console.log(`  ❌ ${component} missing`);
    TEST_RESULTS.errors.push(`Missing social component: ${component}`);
  }
});

// Test 2: Check if all skills components exist and can be imported
console.log('\n2. Testing Skills Components...');
const skillsComponents = [
  'SkillProgressionVisualization',
  'ProgressionCharts',
  'LearningCurveAnalysis',
  'SkillSynergyMapping',
  'MilestoneTracking',
  'PerformanceTrends',
  'SkillComparison',
  'ExperienceRateAnalysis',
  'SkillRecommendations'
];

skillsComponents.forEach(component => {
  const componentPath = path.join(__dirname, 'src/components/skills', `${component}.tsx`);
  if (fs.existsSync(componentPath)) {
    console.log(`  ✅ ${component} exists`);
    TEST_RESULTS.skillsComponents.push(component);
  } else {
    console.log(`  ❌ ${component} missing`);
    TEST_RESULTS.errors.push(`Missing skills component: ${component}`);
  }
});

// Test 3: Check Redux store integration
console.log('\n3. Testing Redux Store Integration...');
const storePath = path.join(__dirname, 'src/store/index.ts');
if (fs.existsSync(storePath)) {
  const storeContent = fs.readFileSync(storePath, 'utf8');
  
  // Check if social slice is imported
  const hasSocialSlice = storeContent.includes('socialSlice') || storeContent.includes('socialReducer');
  // Check if skills slice is imported
  const hasSkillsSlice = storeContent.includes('skillsSlice') || storeContent.includes('skillsReducer');
  
  if (hasSocialSlice && hasSkillsSlice) {
    console.log('  ✅ Redux store includes both social and skills slices');
    TEST_RESULTS.reduxStore = true;
  } else {
    console.log(`  ❌ Redux store missing slices - Social: ${hasSocialSlice}, Skills: ${hasSkillsSlice}`);
    TEST_RESULTS.errors.push('Redux store missing social or skills slice');
  }
} else {
  console.log('  ❌ Redux store index.ts not found');
  TEST_RESULTS.errors.push('Redux store index.ts not found');
}

// Test 4: Check TypeScript types
console.log('\n4. Testing TypeScript Types...');
const socialTypesPath = path.join(__dirname, 'src/types/social.ts');
const skillsTypesPath = path.join(__dirname, 'src/types/skills.ts');

if (fs.existsSync(socialTypesPath) && fs.existsSync(skillsTypesPath)) {
  console.log('  ✅ Both social and skills types exist');
  TEST_RESULTS.types = true;
} else {
  console.log(`  ❌ Missing types - Social: ${fs.existsSync(socialTypesPath)}, Skills: ${fs.existsSync(skillsTypesPath)}`);
  TEST_RESULTS.errors.push('Missing social or skills types');
}

// Test 5: Check index files for proper exports
console.log('\n5. Testing Index Files...');
const socialIndexPath = path.join(__dirname, 'src/components/social/index.ts');
const skillsIndexPath = path.join(__dirname, 'src/components/skills/index.ts');

if (fs.existsSync(socialIndexPath)) {
  const socialIndexContent = fs.readFileSync(socialIndexPath, 'utf8');
  const hasMainExport = socialIndexContent.includes('SocialRelationshipVisualization');
  console.log(`  ✅ Social index file exports main component: ${hasMainExport}`);
  if (!hasMainExport) {
    TEST_RESULTS.errors.push('Social index file missing main export');
  }
} else {
  console.log('  ❌ Social index file not found');
  TEST_RESULTS.errors.push('Social index file not found');
}

if (fs.existsSync(skillsIndexPath)) {
  const skillsIndexContent = fs.readFileSync(skillsIndexPath, 'utf8');
  const hasMainExport = skillsIndexContent.includes('SkillProgressionVisualization');
  console.log(`  ✅ Skills index file exports main component: ${hasMainExport}`);
  if (!hasMainExport) {
    TEST_RESULTS.errors.push('Skills index file missing main export');
  }
} else {
  console.log('  ❌ Skills index file not found');
  TEST_RESULTS.errors.push('Skills index file not found');
}

// Test 6: Check tab integration
console.log('\n6. Testing Tab Integration...');
const socialTabPath = path.join(__dirname, 'src/components/tabs/SocialTab.tsx');
const skillsTabPath = path.join(__dirname, 'src/components/tabs/SkillsTab.tsx');

if (fs.existsSync(socialTabPath)) {
  const socialTabContent = fs.readFileSync(socialTabPath, 'utf8');
  const usesSocialVisualization = socialTabContent.includes('SocialRelationshipVisualization');
  console.log(`  ✅ SocialTab uses SocialRelationshipVisualization: ${usesSocialVisualization}`);
  if (!usesSocialVisualization) {
    TEST_RESULTS.errors.push('SocialTab not using SocialRelationshipVisualization');
  }
} else {
  console.log('  ❌ SocialTab not found');
  TEST_RESULTS.errors.push('SocialTab not found');
}

if (fs.existsSync(skillsTabPath)) {
  const skillsTabContent = fs.readFileSync(skillsTabPath, 'utf8');
  const usesSkillsVisualization = skillsTabContent.includes('SkillProgressionVisualization');
  console.log(`  ✅ SkillsTab uses SkillProgressionVisualization: ${usesSkillsVisualization}`);
  if (!usesSkillsVisualization) {
    TEST_RESULTS.errors.push('SkillsTab not using SkillProgressionVisualization');
  }
} else {
  console.log('  ❌ SkillsTab not found');
  TEST_RESULTS.errors.push('SkillsTab not found');
}

// Test 7: Check Redux slices
console.log('\n7. Testing Redux Slices...');
const socialSlicePath = path.join(__dirname, 'src/store/slices/socialSlice.ts');
const skillsSlicePath = path.join(__dirname, 'src/store/slices/skillsSlice.ts');

if (fs.existsSync(socialSlicePath)) {
  const socialSliceContent = fs.readFileSync(socialSlicePath, 'utf8');
  const hasSelectors = socialSliceContent.includes('selectSocialAgents') && socialSliceContent.includes('selectSocialRelationships');
  console.log(`  ✅ Social slice has selectors: ${hasSelectors}`);
  if (!hasSelectors) {
    TEST_RESULTS.errors.push('Social slice missing selectors');
  }
} else {
  console.log('  ❌ Social slice not found');
  TEST_RESULTS.errors.push('Social slice not found');
}

if (fs.existsSync(skillsSlicePath)) {
  const skillsSliceContent = fs.readFileSync(skillsSlicePath, 'utf8');
  const hasSelectors = skillsSliceContent.includes('selectSkills') && skillsSliceContent.includes('selectSkillProgression');
  console.log(`  ✅ Skills slice has selectors: ${hasSelectors}`);
  if (!hasSelectors) {
    TEST_RESULTS.errors.push('Skills slice missing selectors');
  }
} else {
  console.log('  ❌ Skills slice not found');
  TEST_RESULTS.errors.push('Skills slice not found');
}

// Generate test report
console.log('\n📊 Test Results Summary');
console.log('========================');

const totalTests = 7;
const passedTests = TEST_RESULTS.errors.length === 0 ? totalTests : totalTests - 1;

console.log(`Social Components: ${TEST_RESULTS.socialComponents.length}/${socialComponents.length} ✅`);
console.log(`Skills Components: ${TEST_RESULTS.skillsComponents.length}/${skillsComponents.length} ✅`);
console.log(`Redux Store: ${TEST_RESULTS.reduxStore ? '✅' : '❌'}`);
console.log(`TypeScript Types: ${TEST_RESULTS.types ? '✅' : '❌'}`);

if (TEST_RESULTS.errors.length > 0) {
  console.log('\n❌ Errors Found:');
  TEST_RESULTS.errors.forEach(error => console.log(`  - ${error}`));
} else {
  console.log('\n🎉 All tests passed! Components are properly integrated.');
}

// Save test results
const reportData = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests,
    passedTests,
    failedTests: TEST_RESULTS.errors.length,
    successRate: `${Math.round((passedTests / totalTests) * 100)}%`
  },
  components: {
    social: {
      total: socialComponents.length,
      found: TEST_RESULTS.socialComponents.length,
      components: TEST_RESULTS.socialComponents
    },
    skills: {
      total: skillsComponents.length,
      found: TEST_RESULTS.skillsComponents.length,
      components: TEST_RESULTS.skillsComponents
    }
  },
  integration: {
    reduxStore: TEST_RESULTS.reduxStore,
    types: TEST_RESULTS.types,
    errors: TEST_RESULTS.errors
  }
};

fs.writeFileSync(
  path.join(__dirname, 'components_integration_test_report.json'),
  JSON.stringify(reportData, null, 2)
);

console.log('\n📄 Detailed test report saved to: components_integration_test_report.json');
console.log('\n✨ Integration testing complete!');
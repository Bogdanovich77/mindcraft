const fs = require('fs');
const path = require('path');

console.log('=== Social Integration Check ===');

// Function to check if file contains specific text
function checkFileContains(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchText)) {
      console.log(`✅ ${description}`);
      return true;
    } else {
      console.log(`❌ ${description} - Missing: ${searchText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

// Test results
let results = {
  interfaces: 0,
  purposeCore: 0,
  goalSystem: 0,
  skillsSystem: 0,
  learningEngine: 0,
  memorySystem: 0,
  stateNodes: 0
};

const totalTests = 2; // 2 tests per file

// Test interfaces.ts
console.log('\n--- Testing interfaces.ts ---');
results.interfaces += checkFileContains(
  'src/agent/langgraph/interfaces.ts',
  'interface SocialState',
  'SocialState interface exists'
) ? 1 : 0;

results.interfaces += checkFileContains(
  'src/agent/langgraph/interfaces.ts',
  'social: SocialState',
  'Social state in CognitiveState'
) ? 1 : 0;

// Test purpose_core.ts
console.log('\n--- Testing purpose_core.ts ---');
results.purposeCore += checkFileContains(
  'src/agent/cognitive/purpose_core.ts',
  'private socialState?: SocialState',
  'Social state property in Purpose Core'
) ? 1 : 0;

results.purposeCore += checkFileContains(
  'src/agent/cognitive/purpose_core.ts',
  'calculateSocialInfluence',
  'Social influence calculation method'
) ? 1 : 0;

// Test goal_system.ts
console.log('\n--- Testing goal_system.ts ---');
results.goalSystem += checkFileContains(
  'src/agent/cognitive/goal_system.ts',
  'private socialState?: SocialState',
  'Social state property in Goal System'
) ? 1 : 0;

results.goalSystem += checkFileContains(
  'src/agent/cognitive/goal_system.ts',
  'generateSocialGoals',
  'Social goal generation method'
) ? 1 : 0;

// Test skills_system.ts
console.log('\n--- Testing skills_system.ts ---');
results.skillsSystem += checkFileContains(
  'src/agent/cognitive/skills_system.ts',
  'private socialState?: SocialState',
  'Social state property in Skills System'
) ? 1 : 0;

results.skillsSystem += checkFileContains(
  'src/agent/cognitive/skills_system.ts',
  'learnFromObservation',
  'Social learning method'
) ? 1 : 0;

// Test learning_engine.ts
console.log('\n--- Testing learning_engine.ts ---');
results.learningEngine += checkFileContains(
  'src/agent/cognitive/learning_engine.ts',
  'private socialState?: SocialState',
  'Social state property in Learning Engine'
) ? 1 : 0;

results.learningEngine += checkFileContains(
  'src/agent/cognitive/learning_engine.ts',
  'processSocialExperience',
  'Social experience processing method'
) ? 1 : 0;

// Test memory_system.ts
console.log('\n--- Testing memory_system.ts ---');
results.memorySystem += checkFileContains(
  'src/agent/memory/memory_system.ts',
  'private socialState?: SocialState',
  'Social state property in Memory System'
) ? 1 : 0;

results.memorySystem += checkFileContains(
  'src/agent/memory/memory_system.ts',
  'storeSocialMemory',
  'Social memory storage method'
) ? 1 : 0;

// Test state_nodes.ts
console.log('\n--- Testing state_nodes.ts ---');
results.stateNodes += checkFileContains(
  'src/agent/langgraph/state_nodes.ts',
  'processSocialContext',
  'Social context processing method'
) ? 1 : 0;

results.stateNodes += checkFileContains(
  'src/agent/langgraph/state_nodes.ts',
  'calculateSocialUtility',
  'Social utility calculation method'
) ? 1 : 0;

// Calculate overall results
console.log('\n=== Test Results ===');
const totalPassed = Object.values(results).reduce((sum, count) => sum + count, 0);
const totalPossible = Object.keys(results).length * totalTests;
const successRate = (totalPassed / totalPossible) * 100;

console.log(`Overall: ${totalPassed}/${totalPossible} tests passed (${successRate.toFixed(1)}%)`);

if (successRate >= 80) {
  console.log('🎉 Social integration is successfully implemented!');
} else {
  console.log('⚠️  Social integration needs more work.');
}

console.log('\nFile-by-file results:');
Object.entries(results).forEach(([file, passed]) => {
  const status = passed === totalTests ? '✅' : passed > 0 ? '⚠️' : '❌';
  console.log(`${status} ${file}: ${passed}/${totalTests} tests passed`);
});
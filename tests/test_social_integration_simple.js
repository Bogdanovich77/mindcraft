/**
 * Simple Social Context Integration Test
 * Tests basic integration functionality
 */

console.log('=== Simple Social Integration Test ===');

// Test 1: Check if social interfaces are properly defined
try {
  console.log('Test 1: Checking social interfaces...');
  
  // Import interfaces
  const fs = require('fs');
  const path = require('path');
  
  const interfacesPath = path.join(__dirname, 'src/agent/langgraph/interfaces.ts');
  const interfacesContent = fs.readFileSync(interfacesPath, 'utf8');
  
  // Check if SocialState interface exists
  if (interfacesContent.includes('interface SocialState')) {
    console.log('✅ SocialState interface found');
  } else {
    console.log('❌ SocialState interface not found');
  }
  
  // Check if social state is added to CognitiveState
  if (interfacesContent.includes('social: SocialState')) {
    console.log('✅ Social state added to CognitiveState');
  } else {
    console.log('❌ Social state not added to CognitiveState');
  }
  
} catch (error) {
  console.error('Test 1 failed:', error.message);
}

// Test 2: Check if purpose core has social integration
try {
  console.log('\nTest 2: Checking Purpose Core social integration...');
  
  const purposeCorePath = path.join(__dirname, 'src/agent/cognitive/purpose_core.ts');
  const purposeCoreContent = fs.readFileSync(purposeCorePath, 'utf8');
  
  // Check if social state is added
  if (purposeCoreContent.includes('private socialState: SocialState')) {
    console.log('✅ Social state added to Purpose Core');
  } else {
    console.log('❌ Social state not added to Purpose Core');
  }
  
  // Check if social influence calculation exists
  if (purposeCoreContent.includes('calculateSocialInfluence')) {
    console.log('✅ Social influence calculation found in Purpose Core');
  } else {
    console.log('❌ Social influence calculation not found in Purpose Core');
  }
  
} catch (error) {
  console.error('Test 2 failed:', error.message);
}

// Test 3: Check if goal system has social integration
try {
  console.log('\nTest 3: Checking Goal System social integration...');
  
  const goalSystemPath = path.join(__dirname, 'src/agent/cognitive/goal_system.ts');
  const goalSystemContent = fs.readFileSync(goalSystemPath, 'utf8');
  
  // Check if social state is added
  if (goalSystemContent.includes('private socialState: SocialState')) {
    console.log('✅ Social state added to Goal System');
  } else {
    console.log('❌ Social state not added to Goal System');
  }
  
  // Check if social goal generation exists
  if (goalSystemContent.includes('generateSocialGoals')) {
    console.log('✅ Social goal generation found in Goal System');
  } else {
    console.log('❌ Social goal generation not found in Goal System');
  }
  
} catch (error) {
  console.error('Test 3 failed:', error.message);
}

// Test 4: Check if skills system has social integration
try {
  console.log('\nTest 4: Checking Skills System social integration...');
  
  const skillsSystemPath = path.join(__dirname, 'src/agent/cognitive/skills_system.ts');
  const skillsSystemContent = fs.readFileSync(skillsSystemPath, 'utf8');
  
  // Check if social state is added
  if (skillsSystemContent.includes('private socialState: SocialState')) {
    console.log('✅ Social state added to Skills System');
  } else {
    console.log('❌ Social state not added to Skills System');
  }
  
  // Check if social learning exists
  if (skillsSystemContent.includes('learnFromObservation')) {
    console.log('✅ Social learning found in Skills System');
  } else {
    console.log('❌ Social learning not found in Skills System');
  }
  
} catch (error) {
  console.error('Test 4 failed:', error.message);
}

// Test 5: Check if learning engine has social integration
try {
  console.log('\nTest 5: Checking Learning Engine social integration...');
  
  const learningEnginePath = path.join(__dirname, 'src/agent/cognitive/learning_engine.ts');
  const learningEngineContent = fs.readFileSync(learningEnginePath, 'utf8');
  
  // Check if social state is added
  if (learningEngineContent.includes('private socialState: SocialState')) {
    console.log('✅ Social state added to Learning Engine');
  } else {
    console.log('❌ Social state not added to Learning Engine');
  }
  
  // Check if social experience processing exists
  if (learningEngineContent.includes('processSocialExperience')) {
    console.log('✅ Social experience processing found in Learning Engine');
  } else {
    console.log('❌ Social experience processing not found in Learning Engine');
  }
  
} catch (error) {
  console.error('Test 5 failed:', error.message);
}

// Test 6: Check if memory system has social integration
try {
  console.log('\nTest 6: Checking Memory System social integration...');
  
  const memorySystemPath = path.join(__dirname, 'src/agent/memory/memory_system.ts');
  const memorySystemContent = fs.readFileSync(memorySystemPath, 'utf8');
  
  // Check if social state is added
  if (memorySystemContent.includes('private socialState: SocialState')) {
    console.log('✅ Social state added to Memory System');
  } else {
    console.log('❌ Social state not added to Memory System');
  }
  
  // Check if social memory storage exists
  if (memorySystemContent.includes('storeSocialMemory')) {
    console.log('✅ Social memory storage found in Memory System');
  } else {
    console.log('❌ Social memory storage not found in Memory System');
  }
  
} catch (error) {
  console.error('Test 6 failed:', error.message);
}

// Test 7: Check if state nodes have social integration
try {
  console.log('\nTest 7: Checking State Nodes social integration...');
  
  const stateNodesPath = path.join(__dirname, 'src/agent/langgraph/state_nodes.ts');
  const stateNodesContent = fs.readFileSync(stateNodesPath, 'utf8');
  
  // Check if social context processing exists
  if (stateNodesContent.includes('processSocialContext')) {
    console.log('✅ Social context processing found in State Nodes');
  } else {
    console.log('❌ Social context processing not found in State Nodes');
  }
  
  // Check if social utility calculation exists
  if (stateNodesContent.includes('calculateSocialUtility')) {
    console.log('✅ Social utility calculation found in State Nodes');
  } else {
    console.log('❌ Social utility calculation not found in State Nodes');
  }
  
} catch (error) {
  console.error('Test 7 failed:', error.message);
}

console.log('\n=== Simple Social Integration Test Complete ===');
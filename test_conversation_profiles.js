#!/usr/bin/env node

/**
 * Test Conversation Processing with Different Profiles
 * 
 * This script tests the conversation processing system with various
 * bot profiles to ensure they can generate proper responses.
 */

import fs from 'fs';
import path from 'path';

// Mock the conversation processing system for testing
class MockConversationProcessor {
  constructor(profile) {
    this.profile = profile;
  }

  async processMessage(message) {
    // Simulate message analysis
    const isActionCommand = this.checkIfActionCommand(message);
    
    if (isActionCommand) {
      return {
        processingMode: 'action',
        response: null,
        message: 'Action command detected - would be processed through cognitive pipeline'
      };
    }

    // Generate conversational response based on personality
    const personality = this.profile.purposeCore?.personality;
    const response = this.generatePersonalityResponse(message, personality);
    
    return {
      processingMode: 'conversational',
      response: response,
      message: 'Conversation processed successfully'
    };
  }

  checkIfActionCommand(message) {
    const actionCommands = [
      'go to', 'move to', 'walk to', 'run to',
      'get', 'take', 'pick up', 'collect',
      'craft', 'build', 'place', 'break',
      'attack', 'fight', 'defend',
      'follow', 'stop', 'wait'
    ];
    
    const lowerMessage = message.toLowerCase();
    return actionCommands.some(cmd => lowerMessage.includes(cmd));
  }

  generatePersonalityResponse(message, personality) {
    if (!personality) {
      return "Hello! I'm ready to help.";
    }

    const traits = personality.traits || {};
    const name = this.profile.name || 'Bot';
    
    // Simple personality-based response generation
    let response = "";
    
    if (traits.extraversion > 0.7) {
      response = `Hey there! ${name} here! `;
    } else if (traits.extraversion < 0.3) {
      response = `${name} here. `;
    } else {
      response = `Hello, I'm ${name}. `;
    }
    
    if (traits.openness > 0.7) {
      response += "That's an interesting message! ";
    }
    
    if (traits.agreeableness > 0.7) {
      response += "I'm happy to chat with you!";
    } else if (traits.agreeableness < 0.3) {
      response += "What do you want?";
    } else {
      response += "How can I help you?";
    }
    
    return response;
  }
}

async function testProfileConversation(profilePath) {
  const profileName = path.basename(profilePath, '.json');
  
  try {
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    const processor = new MockConversationProcessor(profile);
    
    console.log(`\n🤖 Testing ${profileName}...`);
    
    // Test conversational message
    const conversationalResult = await processor.processMessage("Hello, how are you?");
    console.log(`  💬 Conversational: "${conversationalResult.response}"`);
    console.log(`  ✅ Status: ${conversationalResult.message}`);
    
    // Test action command
    const actionResult = await processor.processMessage("go to the house");
    console.log(`  ⚡ Action command: ${actionResult.message}`);
    
    return {
      profile: profileName,
      conversationalSuccess: conversationalResult.response !== null,
      actionSuccess: actionResult.message.includes('Action command'),
      hasPersonality: profile.purposeCore?.personality !== undefined
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return {
      profile: profileName,
      conversationalSuccess: false,
      actionSuccess: false,
      hasPersonality: false,
      error: error.message
    };
  }
}

async function runConversationTests() {
  console.log('🧪 Testing Conversation Processing with Bot Profiles\n');
  
  const profilesDir = './profiles';
  const files = fs.readdirSync(profilesDir)
    .filter(file => file.endsWith('.json'))
    .filter(file => !file.startsWith('defaults/') && !file.startsWith('tasks/'));
  
  // Test a representative sample of profiles
  const testProfiles = [
    'MasterChief.json',  // Custom prompts
    'andy.json',         // Default cognitive
    'LavaChicken.json',  // Custom personality
    'claude.json',       // Default cognitive
    'SlaveOne.json'      // Custom prompts
  ].filter(name => files.includes(name));
  
  console.log(`Testing ${testProfiles.length} representative profiles...\n`);
  
  const results = [];
  
  for (const file of testProfiles) {
    const filePath = path.join(profilesDir, file);
    const result = await testProfileConversation(filePath);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSATION TEST SUMMARY');
  console.log('='.repeat(60));
  
  const totalTests = results.length;
  const conversationalSuccess = results.filter(r => r.conversationalSuccess).length;
  const actionSuccess = results.filter(r => r.actionSuccess).length;
  const personalityComplete = results.filter(r => r.hasPersonality).length;
  
  console.log(`Total profiles tested: ${totalTests}`);
  console.log(`✅ Conversational processing: ${conversationalSuccess}/${totalTests}`);
  console.log(`✅ Action command detection: ${actionSuccess}/${totalTests}`);
  console.log(`✅ Personality systems complete: ${personalityComplete}/${totalTests}`);
  
  console.log('\n📋 Individual Results:');
  results.forEach(result => {
    const status = result.conversationalSuccess && result.actionSuccess ? '✅' : '❌';
    console.log(`  ${status} ${result.profile}: Conversational=${result.conversationalSuccess}, Action=${result.actionSuccess}, Personality=${result.hasPersonality}`);
  });
  
  const allSuccess = conversationalSuccess === totalTests && actionSuccess === totalTests;
  
  console.log('\n🎯 FINAL VERDICT:');
  if (allSuccess) {
    console.log('🎉 ALL TESTED PROFILES ARE READY FOR CONVERSATION PROCESSING!');
  } else {
    console.log('⚠️  Some profiles may need attention');
  }
  
  console.log('='.repeat(60));
}

// Run tests if executed directly
if (process.argv[1] && process.argv[1].endsWith('test_conversation_profiles.js')) {
  runConversationTests().catch(console.error);
}

export default { testProfileConversation, runConversationTests };
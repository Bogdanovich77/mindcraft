/**
 * Test script to verify performance fixes for duplicate stream creation
 * This script tests the streaming service optimizations we implemented
 */

import { streamingService } from './src/services/streamingService.js';

async function testStreamingOptimizations() {
  console.log('🧪 Testing streaming service optimizations...\n');

  try {
    // Test 1: Check if createCognitiveStreams handles duplicates properly
    console.log('Test 1: Testing duplicate stream creation prevention...');
    
    // First call - should create all streams
    const result1 = streamingService.createCognitiveStreams();
    console.log('✅ First call completed');
    
    // Second call - should handle duplicates gracefully
    const result2 = streamingService.createCognitiveStreams();
    console.log('✅ Second call completed (should handle duplicates)');
    
    // Check if streams exist
    const requiredStreams = ['agent-state', 'personality', 'emotions', 'memory', 'goals', 'social', 'skills', 'performance'];
    const existingStreams = Array.from(streamingService.streams.keys());
    
    const missingStreams = requiredStreams.filter(id => !existingStreams.includes(id));
    const duplicateStreams = existingStreams.filter((id, index) => existingStreams.indexOf(id) !== index);
    
    if (missingStreams.length === 0 && duplicateStreams.length === 0) {
      console.log('✅ All required streams created without duplicates');
    } else {
      console.log('❌ Stream issues detected:');
      if (missingStreams.length > 0) console.log(`  Missing: ${missingStreams.join(', ')}`);
      if (duplicateStreams.length > 0) console.log(`  Duplicates: ${duplicateStreams.join(', ')}`);
    }

    // Test 2: Check stream creation performance
    console.log('\nTest 2: Testing stream creation performance...');
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      streamingService.createCognitiveStreams();
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`✅ 10 stream creation calls took ${totalTime}ms`);
    if (totalTime < 100) {
      console.log('✅ Performance is optimal (< 100ms for 10 calls)');
    } else {
      console.log('⚠️ Performance could be improved (> 100ms for 10 calls)');
    }

    // Test 3: Check individual stream creation
    console.log('\nTest 3: Testing individual stream creation...');
    
    try {
      streamingService.createStream('test-stream', 'test', { window: 1000, enabled: true });
      console.log('✅ Individual stream creation works');
      
      // Try to create the same stream again
      streamingService.createStream('test-stream', 'test', { window: 1000, enabled: true });
      console.log('✅ Duplicate stream creation handled gracefully');
      
      // Clean up test stream
      streamingService.deleteStream('test-stream');
      console.log('✅ Test stream cleaned up');
    } catch (error) {
      console.log('❌ Individual stream creation failed:', error.message);
    }

    console.log('\n🎉 All streaming optimization tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testStreamingOptimizations();
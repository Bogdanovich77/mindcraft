#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const PROFILES_DIR = path.join(process.cwd(), 'profiles');

console.log('🔍 Debugging Migration Process...');
console.log('Profiles directory:', PROFILES_DIR);

try {
  // Check if profiles directory exists
  const stats = await fs.stat(PROFILES_DIR);
  console.log('✅ Profiles directory exists');
  
  // List files
  const files = await fs.readdir(PROFILES_DIR);
  console.log('📁 Files in profiles directory:', files.length);
  
  const jsonFiles = files.filter(file => 
    file.endsWith('.json') && 
    !file.includes('defaults') && 
    !file.includes('tasks')
  );
  
  console.log('📋 JSON files to migrate:', jsonFiles.length);
  jsonFiles.forEach(file => console.log('  -', file));
  
  // Test reading one file
  if (jsonFiles.length > 0) {
    const testFile = jsonFiles[0];
    const testPath = path.join(PROFILES_DIR, testFile);
    const content = await fs.readFile(testPath, 'utf8');
    const profile = JSON.parse(content);
    
    console.log('\n🧪 Test file:', testFile);
    console.log('  - agentType:', profile.agentType);
    console.log('  - profileVersion:', profile.profileVersion);
    console.log('  - Has purposeCore:', !!profile.purposeCore);
    console.log('  - Needs migration:', profile.agentType !== 'langgraph_simplified');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
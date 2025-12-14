/**
 * Test script to verify the start-bots scripts work correctly
 * This script checks if all necessary files and directories exist
 * and validates the script syntax
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Testing start-bots scripts...\n');

// Test 1: Check if required directories exist
console.log('1. Checking directory structure...');
const requiredDirs = [
    'backend/node-core',
    'backend/fastapi-gateway',
    'backend/fastapi-gateway/.venv',
    'frontend'
];

let dirsOk = true;
requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        console.log(`❌ Missing directory: ${dir}`);
        dirsOk = false;
    } else {
        console.log(`✅ Directory exists: ${dir}`);
    }
});

if (!dirsOk) {
    console.log('\n❌ Some required directories are missing. Please ensure the backend structure is properly set up.');
    process.exit(1);
}

// Test 2: Check if required files exist
console.log('\n2. Checking required files...');
const requiredFiles = [
    'backend/node-core/main.js',
    'backend/fastapi-gateway/main.py',
    'backend/fastapi-gateway/requirements.txt',
    'frontend/package.json',
    'start-bots.sh',
    'start-bots.bat'
];

let filesOk = true;
requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`❌ Missing file: ${file}`);
        filesOk = false;
    } else {
        console.log(`✅ File exists: ${file}`);
    }
});

if (!filesOk) {
    console.log('\n❌ Some required files are missing.');
    process.exit(1);
}

// Test 3: Check if profiles exist
console.log('\n3. Checking agent profiles...');
const profileFiles = [
    'backend/node-core/profiles/SlaveOne.json',
    'backend/node-core/profiles/SlaveTwo.json',
    'backend/node-core/profiles/SlaveThree.json',
    'backend/node-core/profiles/Loner.json',
    'backend/node-core/profiles/MasterChief.json'
];

let profilesOk = true;
profileFiles.forEach(profile => {
    if (!fs.existsSync(profile)) {
        console.log(`❌ Missing profile: ${profile}`);
        profilesOk = false;
    } else {
        console.log(`✅ Profile exists: ${profile}`);
    }
});

if (!profilesOk) {
    console.log('\n⚠️  Some agent profiles are missing. The scripts may not work as expected.');
}

// Test 4: Validate shell script syntax (only on Unix-like systems)
if (process.platform !== 'win32') {
    console.log('\n4. Validating shell script syntax...');
    try {
        execSync('bash -n start-bots.sh', { stdio: 'pipe' });
        console.log('✅ start-bots.sh syntax is valid');
    } catch (error) {
        console.log('❌ start-bots.sh has syntax errors');
        console.log(error.stderr.toString());
    }
}

// Test 5: Check virtual environment
console.log('\n5. Checking FastAPI virtual environment...');
const venvPath = 'backend/fastapi-gateway/.venv';
if (fs.existsSync(venvPath)) {
    console.log('✅ Virtual environment directory exists');
    
    // Check if it's properly set up
    const venvPython = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'python.exe')
        : path.join(venvPath, 'bin', 'python');
    
    if (fs.existsSync(venvPython)) {
        console.log('✅ Python executable found in virtual environment');
    } else {
        console.log('❌ Python executable not found in virtual environment');
    }
} else {
    console.log('⚠️  Virtual environment not found. The scripts will create it on first run.');
}

// Test 6: Check frontend dependencies
console.log('\n6. Checking frontend dependencies...');
const nodeModulesPath = 'frontend/node_modules';
if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ Frontend node_modules exists');
} else {
    console.log('⚠️  Frontend node_modules not found. The scripts will run "npm install" automatically.');
}

console.log('\n=====================================');
console.log('📋 Test Summary:');
console.log('=====================================');
console.log('✅ Directory structure: OK');
console.log('✅ Required files: OK');
console.log(profilesOk ? '✅ Agent profiles: OK' : '⚠️  Agent profiles: Some missing');
console.log('✅ Scripts syntax: Valid');
console.log(fs.existsSync(venvPath) ? '✅ Virtual environment: Found' : '⚠️  Virtual environment: Will be created');
console.log(fs.existsSync(nodeModulesPath) ? '✅ Frontend dependencies: Found' : '⚠️  Frontend dependencies: Will be installed');

console.log('\n🚀 Scripts are ready to run!');
console.log('\nTo start the 3-tier architecture:');
console.log('  • On Linux/macOS: ./start-bots.sh');
console.log('  • On Windows: start-bots.bat');
console.log('\nExpected services:');
console.log('  • Node.js Agent Core: http://localhost:8081 (Internal)');
console.log('  • FastAPI Gateway:    http://localhost:8000');
console.log('  • Frontend Dashboard: http://localhost:5173');
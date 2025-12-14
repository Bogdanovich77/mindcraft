#!/usr/bin/env node

/**
 * Mindcraft UI Migration Helper
 * 
 * This script helps users migrate from the old UI (port 8080) to the new UI (port 5173).
 * It checks the current setup, provides guidance, and can automate some migration steps.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

const execAsync = promisify(exec);
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function showHeader() {
  console.log('');
  colorLog('cyan', '🚀 Mindcraft UI Migration Helper');
  colorLog('yellow', '================================');
  console.log('');
  colorLog('bright', 'This tool will help you migrate from the old UI (port 8080) to the new UI (port 5173).');
  console.log('');
  colorLog('red', '⚠️  The old UI is deprecated and will be discontinued on 2026-12-31');
  console.log('');
}

async function checkPrerequisites() {
  colorLog('blue', '🔍 Checking prerequisites...');
  
  // Check Node.js version
  try {
    const { stdout } = await execAsync('node --version');
    const nodeVersion = stdout.trim();
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      colorLog('red', `❌ Node.js ${nodeVersion} detected. Version 18+ is recommended.`);
      return false;
    } else {
      colorLog('green', `✅ Node.js ${nodeVersion} detected.`);
    }
  } catch (error) {
    colorLog('red', '❌ Node.js not found. Please install Node.js 18+.');
    return false;
  }
  
  // Check if frontend directory exists
  if (!existsSync('frontend')) {
    colorLog('red', '❌ Frontend directory not found.');
    colorLog('yellow', '   Please ensure you\'re in the Mindcraft root directory.');
    return false;
  } else {
    colorLog('green', '✅ Frontend directory found.');
  }
  
  // Check if frontend has package.json
  if (!existsSync('frontend/package.json')) {
    colorLog('red', '❌ Frontend package.json not found.');
    return false;
  } else {
    colorLog('green', '✅ Frontend package.json found.');
  }
  
  return true;
}

async function checkCurrentSetup() {
  colorLog('blue', '📊 Checking current setup...');
  
  // Check if backend is running
  try {
    await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/', { timeout: 5000 });
    colorLog('green', '✅ Backend is running on port 8080.');
  } catch (error) {
    colorLog('yellow', '⚠️  Backend is not running on port 8080.');
  }
  
  // Check if new UI is running
  try {
    await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/', { timeout: 5000 });
    colorLog('green', '✅ New UI is already running on port 5173.');
  } catch (error) {
    colorLog('yellow', '⚠️  New UI is not running on port 5173.');
  }
  
  // Check frontend dependencies
  try {
    const { stdout } = await execAsync('cd frontend && npm list --depth=0', { timeout: 10000 });
    if (stdout.includes('empty')) {
      colorLog('yellow', '⚠️  Frontend dependencies not installed.');
      return false;
    } else {
      colorLog('green', '✅ Frontend dependencies are installed.');
    }
  } catch (error) {
    colorLog('yellow', '⚠️  Frontend dependencies may not be installed.');
    return false;
  }
  
  return true;
}

async function installDependencies() {
  colorLog('blue', '📦 Installing frontend dependencies...');
  try {
    await execAsync('cd frontend && npm install', { timeout: 120000 });
    colorLog('green', '✅ Frontend dependencies installed successfully.');
    return true;
  } catch (error) {
    colorLog('red', '❌ Failed to install frontend dependencies.');
    colorLog('yellow', '   Please run manually: cd frontend && npm install');
    return false;
  }
}

async function startNewUI() {
  colorLog('blue', '🚀 Starting new UI...');
  colorLog('cyan', '   The new UI will start on http://localhost:5173');
  colorLog('yellow', '   Press Ctrl+C to stop the UI when done.');
  console.log('');
  
  try {
    // Start the new UI
    const child = exec('cd frontend && npm run dev');
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:')) {
        colorLog('green', '✅ New UI is running!');
        colorLog('cyan', '   Open your browser to the URL shown above.');
      }
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      colorLog('yellow', '\n🛑 Stopping new UI...');
      child.kill('SIGINT');
      process.exit(0);
    });
    
    // Keep the process running
    await new Promise(() => {});
    
  } catch (error) {
    colorLog('red', '❌ Failed to start new UI.');
    colorLog('yellow', '   Please run manually: cd frontend && npm run dev');
    return false;
  }
}

function showMigrationSteps() {
  console.log('');
  colorLog('bright', '📋 Migration Steps:');
  console.log('');
  
  colorLog('cyan', '1. Update your workflow:');
  console.log('   Old: node main.js + open http://localhost:8080');
  console.log('   New: npm run ui:both + open http://localhost:5173');
  console.log('');
  
  colorLog('cyan', '2. Update your bookmarks:');
  console.log('   Remove: http://localhost:8080');
  console.log('   Add: http://localhost:5173');
  console.log('');
  
  colorLog('cyan', '3. New commands available:');
  console.log('   npm run ui:new      - Start new UI only');
  console.log('   npm run ui:old      - Start backend only (deprecated)');
  console.log('   npm run ui:both     - Start both (recommended)');
  console.log('');
  
  colorLog('cyan', '4. For more help:');
  console.log('   Read: UI_MIGRATION_GUIDE.md');
  console.log('   Join: Discord support');
  console.log('');
}

function showBenefits() {
  console.log('');
  colorLog('bright', '🎯 New UI Benefits:');
  console.log('');
  
  colorLog('green', '✅ Modern React-based interface');
  colorLog('green', '✅ Real-time updates and better performance');
  colorLog('green', '✅ Mobile-responsive design');
  colorLog('green', '✅ Enhanced debugging tools');
  colorLog('green', '✅ Better developer experience');
  console.log('');
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${COLORS.cyan}${question}${COLORS.reset} `, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  showHeader();
  
  // Check prerequisites
  const prerequisitesOk = await checkPrerequisites();
  if (!prerequisitesOk) {
    colorLog('red', '\n❌ Prerequisites not met. Please resolve the issues above and try again.');
    process.exit(1);
  }
  
  // Check current setup
  const setupOk = await checkCurrentSetup();
  
  console.log('');
  colorLog('bright', '🎯 What would you like to do?');
  console.log('');
  console.log('1. Install frontend dependencies');
  console.log('2. Start the new UI');
  console.log('3. Install dependencies and start UI');
  console.log('4. Show migration steps');
  console.log('5. Show new UI benefits');
  console.log('6. Exit');
  console.log('');
  
  const choice = await askQuestion('Enter your choice (1-6):');
  
  switch (choice) {
    case '1':
      await installDependencies();
      break;
    case '2':
      await startNewUI();
      break;
    case '3':
      const installed = await installDependencies();
      if (installed) {
        await startNewUI();
      }
      break;
    case '4':
      showMigrationSteps();
      break;
    case '5':
      showBenefits();
      break;
    case '6':
      colorLog('green', '👋 Goodbye! Remember to migrate to the new UI soon.');
      break;
    default:
      colorLog('red', '❌ Invalid choice. Please run the script again.');
      process.exit(1);
  }
  
  if (choice !== '2' && choice !== '3') {
    console.log('');
    colorLog('yellow', '📚 For more information, see:');
    colorLog('cyan', '   - UI_MIGRATION_GUIDE.md');
    colorLog('cyan', '   - README.md#ui-migration-guide');
    colorLog('cyan', '   - Discord support');
    console.log('');
  }
  
  rl.close();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  colorLog('red', `❌ Unexpected error: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  colorLog('red', `❌ Unhandled promise rejection: ${reason}`);
  process.exit(1);
});

// Run the migration helper
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    colorLog('red', `❌ Migration helper failed: ${error.message}`);
    process.exit(1);
  });
}
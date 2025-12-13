#!/usr/bin/env node

/**
 * React Instance Diagnostic Script
 * 
 * This script helps identify multiple React instances and dependency conflicts
 * that cause "Invalid hook call" errors.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 React Instance Diagnostic Tool');
console.log('=====================================\n');

// Check if we're in the frontend directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the frontend directory.');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log('📦 Package:', packageJson.name);
console.log('📋 Version:', packageJson.version);

// Check for React dependencies
const reactDeps = {};
const checkDep = (name, version) => {
  if (name.includes('react') || name.includes('@emotion')) {
    reactDeps[name] = version;
  }
};

Object.entries(packageJson.dependencies || {}).forEach(checkDep);
Object.entries(packageJson.devDependencies || {}).forEach(checkDep);

console.log('\n🧠 React-related Dependencies:');
Object.entries(reactDeps).forEach(([name, version]) => {
  console.log(`  ${name}: ${version}`);
});

// Check for overrides/resolutions
if (packageJson.overrides) {
  console.log('\n🔧 Overrides Found:');
  Object.entries(packageJson.overrides).forEach(([name, version]) => {
    if (name.includes('react') || name.includes('@emotion')) {
      console.log(`  ${name}: ${version}`);
    }
  });
}

if (packageJson.resolutions) {
  console.log('\n📐 Resolutions Found (Yarn-only):');
  Object.entries(packageJson.resolutions).forEach(([name, version]) => {
    if (name.includes('react') || name.includes('@emotion')) {
      console.log(`  ${name}: ${version}`);
    }
  });
  console.log('⚠️  Warning: resolutions only work with Yarn, not npm');
}

// Check node_modules if it exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('\n📂 Checking node_modules...');
  
  const reactPath = path.join(nodeModulesPath, 'react');
  const reactDomPath = path.join(nodeModulesPath, 'react-dom');
  const emotionReactPath = path.join(nodeModulesPath, '@emotion', 'react');
  
  const checks = [
    { name: 'react', path: reactPath },
    { name: 'react-dom', path: reactDomPath },
    { name: '@emotion/react', path: emotionReactPath },
  ];
  
  checks.forEach(({ name, path: checkPath }) => {
    if (fs.existsSync(checkPath)) {
      const pkgPath = path.join(checkPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        console.log(`  ✅ ${name}: ${pkg.version} (installed)`);
      } else {
        console.log(`  ⚠️  ${name}: installed but no package.json found`);
      }
    } else {
      console.log(`  ❌ ${name}: not installed`);
    }
  });
  
  // Check for duplicate React instances
  console.log('\n🔍 Scanning for duplicate React instances...');
  let duplicateCount = 0;
  
  const scanForReact = (dir, depth = 0) => {
    if (depth > 3) return; // Limit depth to avoid infinite recursion
    
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && item !== 'node_modules') {
          const reactPkgPath = path.join(itemPath, 'node_modules', 'react', 'package.json');
          if (fs.existsSync(reactPkgPath) && itemPath !== nodeModulesPath) {
            console.log(`  🚨 Duplicate React found in: ${itemPath}`);
            duplicateCount++;
          }
          
          // Recurse
          scanForReact(itemPath, depth + 1);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  };
  
  scanForReact(nodeModulesPath);
  
  if (duplicateCount === 0) {
    console.log('  ✅ No duplicate React instances found');
  } else {
    console.log(`  ❌ Found ${duplicateCount} duplicate React instances`);
  }
} else {
  console.log('\n📂 node_modules not found - run "npm install" first');
}

// Provide recommendations
console.log('\n💡 Recommendations:');
console.log('1. Remove node_modules and package-lock.json');
console.log('2. Clear npm cache: npm cache clean --force');
console.log('3. Reinstall dependencies: npm install');
console.log('4. Restart development server: npm run dev');

if (packageJson.resolutions && !packageJson.overrides) {
  console.log('5. Consider switching to Yarn or using overrides instead of resolutions');
}

console.log('\n✅ Diagnostic complete!');
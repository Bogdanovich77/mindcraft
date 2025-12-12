/**
 * Test Suite Validator - Quick health check for the Mindcraft LangGraph test suite
 * Validates that all test files are properly structured and can be executed
 */

import fs from 'fs/promises';
import path from 'path';

// Test file configuration
const TEST_FILES = [
    'test_mode_transitions.js',
    'test_emergency_interrupts.js',
    'test_concurrent_modes.js',
    'test_performance_requirements.js',
    'test_integration_scenarios.js',
    'test_reactive_integration.js',
    'test_pathstopped_handling.js'
];

const REQUIRED_FILES = [
    'test_utils.js',
    'test_coverage_reporter.js',
    'run_all_tests.js'
];

const REQUIRED_DIRECTORIES = [
    'src/agent/langgraph',
    'src/agent/cognitive',
    'src/agent/memory'
];

// Validation results
class ValidationResult {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.warnings = 0;
        this.errors = [];
        this.warningsList = [];
    }

    addSuccess(message) {
        this.passed++;
        console.log(`✅ ${message}`);
    }

    addError(message) {
        this.failed++;
        this.errors.push(message);
        console.log(`❌ ${message}`);
    }

    addWarning(message) {
        this.warnings++;
        this.warningsList.push(message);
        console.log(`⚠️  ${message}`);
    }

    getSummary() {
        const total = this.passed + this.failed + this.warnings;
        return {
            total,
            passed: this.passed,
            failed: this.failed,
            warnings: this.warnings,
            success: this.failed === 0,
            errors: this.errors,
            warnings: this.warningsList
        };
    }
}

// File validation utilities
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function validateFileStructure(filePath, expectedExports = []) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check for basic structure
        const hasImports = content.includes('import') || content.includes('require');
        const hasExports = content.includes('export') || content.includes('module.exports');
        const hasTests = /test|describe|it|should|validate/i.test(content);
        
        return {
            exists: true,
            hasImports,
            hasExports,
            hasTests,
            content: content.substring(0, 200) // First 200 chars for preview
        };
    } catch (error) {
        return {
            exists: false,
            error: error.message
        };
    }
}

// Main validation function
async function validateTestSuite() {
    console.log('🔍 Mindcraft LangGraph Test Suite Validator');
    console.log('='.repeat(60));
    
    const result = new ValidationResult();
    
    // 1. Validate required test files exist
    console.log('\n📁 Checking Test Files...');
    for (const testFile of TEST_FILES) {
        const exists = await fileExists(testFile);
        if (exists) {
            const validation = await validateFileStructure(testFile);
            if (validation.hasTests) {
                result.addSuccess(`Test file exists and contains tests: ${testFile}`);
            } else {
                result.addWarning(`Test file exists but may not contain tests: ${testFile}`);
            }
        } else {
            result.addError(`Missing test file: ${testFile}`);
        }
    }
    
    // 2. Validate utility files
    console.log('\n🛠️  Checking Utility Files...');
    for (const utilFile of REQUIRED_FILES) {
        const exists = await fileExists(utilFile);
        if (exists) {
            result.addSuccess(`Utility file exists: ${utilFile}`);
        } else {
            result.addError(`Missing utility file: ${utilFile}`);
        }
    }
    
    // 3. Validate source directories
    console.log('\n📂 Checking Source Directories...');
    for (const dir of REQUIRED_DIRECTORIES) {
        const exists = await fileExists(dir);
        if (exists) {
            result.addSuccess(`Source directory exists: ${dir}`);
        } else {
            result.addWarning(`Source directory missing: ${dir}`);
        }
    }
    
    // 4. Validate package.json for test dependencies
    console.log('\n📦 Checking Package Configuration...');
    try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        const hasTestScript = packageJson.scripts && packageJson.scripts.test;
        const hasDevDependencies = packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0;
        
        if (hasTestScript) {
            result.addSuccess('Package.json has test script');
        } else {
            result.addWarning('Package.json missing test script');
        }
        
        if (hasDevDependencies) {
            result.addSuccess('Package.json has dev dependencies');
        } else {
            result.addWarning('Package.json missing dev dependencies');
        }
    } catch (error) {
        result.addError(`Cannot read package.json: ${error.message}`);
    }
    
    // 5. Validate TypeScript configuration
    console.log('\n🔧 Checking TypeScript Configuration...');
    try {
        const tsConfig = JSON.parse(await fs.readFile('tsconfig.json', 'utf8'));
        const hasModuleResolution = tsConfig.compilerOptions && tsConfig.compilerOptions.moduleResolution;
        const hasTarget = tsConfig.compilerOptions && tsConfig.compilerOptions.target;
        
        if (hasModuleResolution) {
            result.addSuccess('TypeScript has module resolution configured');
        } else {
            result.addWarning('TypeScript missing module resolution configuration');
        }
        
        if (hasTarget) {
            result.addSuccess('TypeScript has target configured');
        } else {
            result.addWarning('TypeScript missing target configuration');
        }
    } catch (error) {
        result.addWarning(`Cannot read tsconfig.json: ${error.message}`);
    }
    
    // 6. Check for test report directory
    console.log('\n📊 Checking Report Directory...');
    const reportDir = './test_reports';
    try {
        await fs.access(reportDir);
        result.addSuccess('Test reports directory exists');
    } catch {
        result.addWarning('Test reports directory does not exist (will be created)');
    }
    
    // 7. Validate test file syntax
    console.log('\n🧪 Checking Test File Syntax...');
    for (const testFile of TEST_FILES) {
        try {
            // Try to import the file to check for syntax errors
            const testPath = path.resolve(testFile);
            await import(`file://${testPath}`);
            result.addSuccess(`Syntax valid: ${testFile}`);
        } catch (error) {
            if (error.message.includes('ENOENT')) {
                continue; // File already checked as missing
            }
            result.addError(`Syntax error in ${testFile}: ${error.message}`);
        }
    }
    
    // 8. Check for performance monitoring capabilities
    console.log('\n⏱️  Checking Performance Monitoring...');
    try {
        const testUtilsPath = path.resolve('test_utils.js');
        const testUtils = await import(`file://${testUtilsPath}`);
        
        if (testUtils.PerformanceMonitor) {
            result.addSuccess('Performance monitoring utilities available');
        } else {
            result.addWarning('Performance monitoring utilities may be missing');
        }
        
        if (testUtils.TestScenarioBuilder) {
            result.addSuccess('Test scenario builder available');
        } else {
            result.addWarning('Test scenario builder may be missing');
        }
    } catch (error) {
        result.addWarning(`Cannot validate test utilities: ${error.message}`);
    }
    
    return result.getSummary();
}

// Generate recommendations based on validation results
function generateRecommendations(summary) {
    console.log('\n💡 Recommendations:');
    
    if (summary.errors.length > 0) {
        console.log('🚨 Critical Issues to Fix:');
        summary.errors.forEach(error => {
            console.log(`   • ${error}`);
        });
    }
    
    if (summary.warnings > 0) {
        console.log('⚠️  Improvements to Consider:');
        summary.warningsList.forEach(warning => {
            console.log(`   • ${warning}`);
        });
    }
    
    if (summary.success) {
        console.log('✅ Test suite is ready to run!');
        console.log('   • Execute: node run_all_tests.js');
        console.log('   • View reports in ./test_reports/');
    } else {
        console.log('🔧 Fix the above issues before running the test suite');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Address any critical errors');
    console.log('2. Review and implement warnings');
    console.log('3. Run the test suite: node run_all_tests.js');
    console.log('4. Review generated reports');
    console.log('5. Set up CI/CD integration if needed');
}

// Main execution
async function main() {
    try {
        const summary = await validateTestSuite();
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 Validation Summary:');
        console.log(`   Total Checks: ${summary.total}`);
        console.log(`   ✅ Passed: ${summary.passed}`);
        console.log(`   ❌ Failed: ${summary.failed}`);
        console.log(`   ⚠️  Warnings: ${summary.warnings}`);
        console.log(`   🎯 Status: ${summary.success ? 'READY' : 'NEEDS ATTENTION'}`);
        console.log('='.repeat(60));
        
        generateRecommendations(summary);
        
        // Exit with appropriate code
        process.exit(summary.success ? 0 : 1);
        
    } catch (error) {
        console.error('\n💥 Validation failed with error:');
        console.error(error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { validateTestSuite, ValidationResult };
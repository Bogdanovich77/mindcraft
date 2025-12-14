#!/usr/bin/env node

/**
 * Profile Management Test Runner
 * Runs all profile management tests in sequence
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_FILES = [
    'tests/test_profile_validation.js',
    'tests/test_profile_api.js',
    'tests/test_profile_integration.js'
];

class TestRunner {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🧪 Profile Management Test Suite');
        console.log('='.repeat(50));
        console.log('Running all profile management tests...\n');

        // Check if server is running for integration tests
        await this.checkServerStatus();

        // Run each test file
        for (const testFile of TEST_FILES) {
            await this.runTestFile(testFile);
        }

        // Print final summary
        this.printFinalSummary();
    }

    async checkServerStatus() {
        console.log('🔍 Checking server status...');
        try {
            const response = await fetch('http://localhost:8080/api/profiles');
            if (response.ok) {
                console.log('✅ Server is running and accessible\n');
                return true;
            }
        } catch (error) {
            console.log('⚠️  Server is not running. Integration tests will fail.');
            console.log('   Start the server with: node src/mindcraft/mindserver.js\n');
            return false;
        }
    }

    async runTestFile(testFile) {
        console.log(`📁 Running ${testFile}...`);
        console.log('-'.repeat(40));

        try {
            const startTime = Date.now();
            
            // Run the test file
            execSync(`node ${testFile}`, { 
                stdio: 'inherit',
                timeout: 30000 // 30 second timeout
            });
            
            const duration = Date.now() - startTime;
            
            this.results.push({
                file: testFile,
                status: 'PASS',
                duration: duration,
                error: null
            });
            
            console.log(`✅ ${testFile} completed in ${duration}ms\n`);
            
        } catch (error) {
            const duration = Date.now() - startTime;
            
            this.results.push({
                file: testFile,
                status: 'FAIL',
                duration: duration,
                error: error.message
            });
            
            console.log(`❌ ${testFile} failed after ${duration}ms\n`);
        }
    }

    printFinalSummary() {
        const totalDuration = Date.now() - this.startTime;
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const total = this.results.length;

        console.log('📊 Final Test Results');
        console.log('='.repeat(50));
        console.log(`Total Duration: ${totalDuration}ms`);
        console.log(`Test Files: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Test Files:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => {
                    console.log(`  - ${r.file} (${r.duration}ms)`);
                    console.log(`    Error: ${r.error}`);
                });
        }

        console.log('\n' + '='.repeat(50));
        
        if (failed === 0) {
            console.log('🎉 All tests passed! Profile Management API is ready for production.');
        } else {
            console.log('⚠️  Some tests failed. Please review the errors above.');
            process.exit(1);
        }
    }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ This test runner requires Node.js 18+ with fetch support.');
    console.log('   Please upgrade Node.js or install node-fetch.');
    process.exit(1);
}

// Run the test suite
const runner = new TestRunner();
runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});
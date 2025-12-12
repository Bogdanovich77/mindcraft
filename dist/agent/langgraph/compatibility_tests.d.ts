/**
 * Compatibility Layer Tests - Comprehensive testing for legacy system integration
 * Tests migration, validation, and rollback capabilities with existing profiles
 */
/**
 * Test result interface
 */
interface TestResult {
    testName: string;
    passed: boolean;
    duration: number;
    error?: string;
    details: string;
}
/**
 * Test suite results
 */
interface TestSuiteResults {
    suiteName: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
    results: TestResult[];
}
/**
 * Compatibility Test Suite
 */
export declare class CompatibilityTests {
    private testProfiles;
    private mockAgents;
    constructor();
    /**
     * Run all compatibility tests
     */
    runAllTests(): Promise<TestSuiteResults>;
    /**
     * Test legacy adapters
     */
    private testLegacyAdapters;
    /**
     * Test migration manager
     */
    private testMigrationManager;
    /**
     * Test compatibility layer
     */
    private testCompatibilityLayer;
    /**
     * Test goal bridge
     */
    private testGoalBridge;
    /**
     * Test profile adapter
     */
    private testProfileAdapter;
    /**
     * Test validation and rollback
     */
    private testValidationRollback;
    /**
     * Test integration scenarios
     */
    private testIntegration;
    /**
     * Run a single test
     */
    private runTest;
    /**
     * Setup test profiles
     */
    private setupTestProfiles;
    /**
     * Generate test report
     */
    generateReport(results: TestSuiteResults): string;
}
/**
 * Test runner utility
 */
export declare class TestRunner {
    /**
     * Run compatibility tests and save report
     */
    static runTests(): Promise<void>;
}
export declare const compatibilityTests: CompatibilityTests;
export {};
//# sourceMappingURL=compatibility_tests.d.ts.map
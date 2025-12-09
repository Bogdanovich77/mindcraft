/**
 * Simple runner for final integration test
 */

import { runFinalIntegrationValidation } from './test_final_integration_validation.js';

console.log("Starting final integration test runner...");

// Run the test with error handling
runFinalIntegrationValidation()
    .then(() => {
        console.log("Test completed successfully");
    })
    .catch((error) => {
        console.error("Test failed with error:", error);
        process.exit(1);
    });
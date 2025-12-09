import { ResponseGenerationValidator } from './test_response_generation_validation.js';

console.log('🚀 Starting Response Generation and Routing Validation Tests');

const validator = new ResponseGenerationValidator();

validator.runAllTests()
    .then(report => {
        console.log('\nTest completed!');
        console.log(`Total: ${report.summary.total}, Passed: ${report.summary.passed}, Failed: ${report.summary.failed}`);
        const exitCode = report.summary.failed > 0 ? 1 : 0;
        process.exit(exitCode);
    })
    .catch(error => {
        console.error('Test execution failed:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    });
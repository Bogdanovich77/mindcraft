# Mindcraft LangGraph Comprehensive Test Suite

This test suite provides comprehensive validation of mode transitions, interrupt handling, and state management for the Mindcraft LangGraph system. It ensures that the hybrid reactive-cognitive architecture functions correctly across various scenarios and edge cases.

## 🎯 Test Coverage

### Core Test Areas

1. **Basic Mode Transitions** (`test_mode_transitions.js`)
   - Mode switching between different reactive modes
   - Emergency mode preemption validation
   - State consistency during transitions
   - Performance measurement of mode switches

2. **Emergency Interrupts** (`test_emergency_interrupts.js`)
   - Interrupt detection and handling
   - Cognitive processing preemption
   - Priority-based interrupt resolution
   - Emergency response timing validation

3. **Concurrent Modes** (`test_concurrent_modes.js`)
   - Simultaneous mode activation handling
   - Conflict resolution between mutually exclusive modes
   - Queue management for lower priority modes
   - Performance under concurrent load

4. **Performance Requirements** (`test_performance_requirements.js`)
   - Timing requirements validation (<100ms survival, <50ms emergency)
   - System load testing
   - Memory and resource usage validation
   - Performance monitoring and benchmarking

5. **Integration Scenarios** (`test_integration_scenarios.js`)
   - End-to-end scenario testing
   - Multi-agent coordination validation
   - Cognitive-reactive integration testing
   - Complex workflow validation

6. **Enhanced Reactive Integration** (`test_reactive_integration.js`)
   - Complex interleaving mode scenarios
   - Performance under stress conditions
   - Enhanced error recovery mechanisms
   - State validation during rapid transitions

7. **PathStopped Error Handling** (`test_pathstopped_handling.js`)
   - Graceful pathfinding interruption handling
   - Edge cases and recovery mechanisms
   - Performance impact validation
   - State cleanup verification

## 🚀 Quick Start

### Running All Tests

```bash
# Run the complete test suite
node run_all_tests.js

# Run with parallel execution
node run_all_tests.js --parallel

# Run with custom output directory
node run_all_tests.js --output ./test_results

# Run with HTML-only reports
node run_all_tests.js --format html
```

### Running Individual Test Files

```bash
# Run specific test suites
node test_mode_transitions.js
node test_emergency_interrupts.js
node test_concurrent_modes.js
node test_performance_requirements.js
node test_integration_scenarios.js
```

### Command Line Options

```
Usage: node run_all_tests.js [options]

Options:
  --parallel         Run tests in parallel (default: sequential)
  --sequential       Run tests sequentially (default)
  --output <dir>     Output directory for reports (default: ./test_reports)
  --format <format>  Report format: json, html, or both (default: both)
  --timeout <ms>     Timeout per test suite in milliseconds (default: 60000)
  --help             Show help message
```

## 📊 Test Reports

The test suite generates comprehensive reports in both JSON and HTML formats:

### JSON Reports
- Detailed test results with timing information
- Performance metrics and benchmarks
- Coverage statistics and recommendations
- Machine-readable format for CI/CD integration

### HTML Reports
- Visual dashboard with charts and graphs
- Interactive test result exploration
- Performance trend analysis
- Easy-to-share format for team review

### Report Structure
```
test_reports/
├── coverage_report.json          # Comprehensive coverage data
├── coverage_report.html          # Interactive HTML dashboard
├── test_results.json             # Detailed test results
├── performance_metrics.json      # Performance benchmark data
└── recommendations.md            # Improvement suggestions
```

## 🧪 Test Architecture

### Mock Environment

The test suite uses a comprehensive mock environment that simulates real-world conditions without requiring actual Minecraft connections:

- **MockBot**: Simulates mineflayer bot behavior
- **MockAgent**: Provides agent state and behavior simulation
- **MockWorld**: Creates controlled world scenarios
- **PerformanceMonitor**: Tracks timing and resource usage

### Test Utilities

Common utilities are provided in `test_utils.js`:

- **TestScenarioBuilder**: Creates complex test scenarios
- **PerformanceTracker**: Measures response times and resource usage
- **StateValidator**: Ensures state consistency during tests
- **MockEnvironment**: Manages mock objects and cleanup

### Performance Monitoring

All tests include comprehensive performance monitoring:

- **Response Time Tracking**: Validates timing requirements
- **Memory Usage Monitoring**: Ensures resource constraints
- **Cognitive Load Measurement**: Tracks system load
- **Interrupt Latency**: Measures emergency response times

## 📋 Test Requirements Validation

### Performance Requirements

| Requirement | Target | Test Validation |
|-------------|--------|-----------------|
| Emergency Response | <50ms | ✅ Interrupt timing tests |
| Survival Response | <100ms | ✅ Mode transition tests |
| Cognitive Processing | 500ms-2000ms | ✅ Performance benchmarks |
| Memory Usage | <2GB per agent | ✅ Resource monitoring |
| Concurrent Agents | Linear scaling to 50+ | ✅ Load testing |

### Behavioral Requirements

| Requirement | Validation | Test Coverage |
|-------------|------------|---------------|
| Mode Transition Accuracy | ✅ State consistency | Mode transition tests |
| Emergency Preemption | ✅ Priority handling | Interrupt tests |
| Concurrent Mode Resolution | ✅ Conflict management | Concurrent mode tests |
| Error Recovery | ✅ Graceful handling | Error scenario tests |
| State Persistence | ✅ Data integrity | Integration tests |

## 🔧 Test Configuration

### Environment Setup

The test suite requires:

- Node.js 18+ with ES module support
- TypeScript compiler (for TypeScript tests)
- Test framework dependencies (built-in)

### Configuration Options

Test behavior can be configured through:

- **Command line arguments**: Runtime configuration
- **Test files**: Individual test configuration
- **Environment variables**: System-wide settings

### Custom Test Scenarios

New test scenarios can be added using the TestScenarioBuilder:

```javascript
import { TestScenarioBuilder } from './test_utils.js';

const builder = new TestScenarioBuilder();
const scenario = builder
    .withEmergencyCondition('drowning')
    .withActiveMode('self_preservation')
    .withCognitiveLoad('high')
    .build();
```

## 📈 Coverage Metrics

The test suite tracks comprehensive coverage metrics:

### Test Coverage
- **Statement Coverage**: Code execution paths
- **Branch Coverage**: Decision logic paths
- **Function Coverage**: Method invocation coverage
- **Line Coverage**: Source line execution

### Performance Coverage
- **Timing Requirements**: Response time validation
- **Resource Usage**: Memory and CPU monitoring
- **Load Testing**: Concurrent execution validation
- **Stress Testing**: System limits validation

### Scenario Coverage
- **Happy Path**: Normal operation scenarios
- **Edge Cases**: Boundary condition testing
- **Error Conditions**: Failure mode validation
- **Integration Points**: System interaction testing

## 🐛 Debugging and Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are properly installed
2. **Timeout Issues**: Increase timeout values for complex tests
3. **Memory Issues**: Check for memory leaks in test utilities
4. **Performance Failures**: Verify system resources and load

### Debug Mode

Enable debug output with environment variables:

```bash
DEBUG=test:* node run_all_tests.js
```

### Individual Test Debugging

Run specific tests with verbose output:

```bash
node test_mode_transitions.js --verbose
```

## 🔄 Continuous Integration

### CI/CD Integration

The test suite is designed for CI/CD integration:

```bash
# Run tests in CI environment
CI=true node run_all_tests.js --format json --output ./ci_reports

# Exit with proper status codes
echo $?  # 0 for success, 1 for failure
```

### GitHub Actions Example

```yaml
- name: Run Mindcraft Tests
  run: |
    node run_all_tests.js --parallel --format json
    # Upload test reports as artifacts
```

## 📚 Test Documentation

### Test Structure

Each test file follows a consistent structure:

1. **Imports and Setup**: Dependencies and configuration
2. **Mock Environment**: Test fixtures and utilities
3. **Test Cases**: Individual test implementations
4. **Performance Validation**: Timing and resource checks
5. **Cleanup**: Resource cleanup and teardown

### Test Naming Convention

Tests use descriptive names that indicate:

- **Component**: System component being tested
- **Scenario**: Test scenario or condition
- **Expected Outcome**: What should happen
- **Performance**: Any timing requirements

Example: `test_emergency_interrupt_preempts_cognitive_processing_under_50ms`

## 🎯 Best Practices

### Test Development

1. **Isolation**: Tests should be independent and isolated
2. **Repeatability**: Tests should produce consistent results
3. **Performance**: Include timing validation where relevant
4. **Cleanup**: Properly clean up resources after tests
5. **Documentation**: Clear test descriptions and comments

### Performance Testing

1. **Baseline**: Establish performance baselines
2. **Thresholds**: Set realistic performance thresholds
3. **Monitoring**: Track performance trends over time
4. **Environment**: Test in consistent environments
5. **Reporting**: Generate detailed performance reports

### Error Handling

1. **Validation**: Test both success and failure scenarios
2. **Recovery**: Verify error recovery mechanisms
3. **Logging**: Ensure proper error logging
4. **State**: Validate state consistency after errors
5. **Performance**: Measure error handling performance

## 📞 Support and Contributing

### Adding New Tests

To add new test scenarios:

1. Create test files following the established pattern
2. Use the provided test utilities and mock environment
3. Include performance validation where relevant
4. Update the test runner configuration
5. Add documentation for new test cases

### Test Maintenance

- Regular test review and updates
- Performance threshold adjustments
- Mock environment enhancements
- Coverage metric improvements
- Documentation updates

---

**Note**: This test suite is designed to validate the Mindcraft LangGraph system's hybrid reactive-cognitive architecture, ensuring reliable mode transitions, interrupt handling, and state management across all scenarios and edge cases.
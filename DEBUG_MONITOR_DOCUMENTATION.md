# Mindcraft Debug Monitor Documentation

## Overview

The Mindcraft Debug Monitor is a comprehensive real-time monitoring and debugging system designed specifically for the Mindcraft AI agent platform. It provides automated error detection, WebSocket connection monitoring, intelligent debugging suggestions, and comprehensive logging capabilities.

## Features

### 🔍 Real-time Log Monitoring
- **Dual Process Monitoring**: Simultaneously monitors both backend (Node.js) and frontend (React/Vite) processes
- **Color-coded Output**: Visual distinction between different log types and severity levels
- **Log Buffer Management**: Intelligent buffering with automatic cleanup to prevent memory leaks
- **Pattern-based Detection**: Advanced regex patterns for identifying common issues

### 🚨 Intelligent Error Detection
- **Severity Classification**: Automatic categorization of errors into Critical, Warning, and Info levels
- **Pattern Matching**: Detects common error patterns like WebSocket failures, memory issues, port conflicts, and more
- **Alert Thresholds**: Configurable thresholds for automatic escalation and notifications
- **Context-aware Suggestions**: Provides specific debugging steps based on error type

### 🔌 WebSocket Connection Monitoring
- **Multi-layer Testing**: HTTP connectivity, WebSocket handshake, Socket.IO protocol, and message round-trip tests
- **Connection Quality Analysis**: Tracks success rates and performance metrics over time
- **Automatic Reconnection**: Configurable reconnection attempts with exponential backoff
- **Performance Metrics**: Response time tracking and trend analysis

### 🏥 Health Check System
- **Process Health Monitoring**: Detects process failures and automatic restart capabilities
- **System Resource Monitoring**: Memory usage tracking with leak detection
- **API Endpoint Testing**: Regular health checks for backend APIs
- **Status Reporting**: Comprehensive status reports with performance metrics

### 📊 Alerting and Notifications
- **Multi-channel Alerts**: Console output, desktop notifications, and file logging
- **Threshold-based Escalation**: Automatic escalation when error thresholds are exceeded
- **Emergency Reports**: Automated report generation for critical issues
- **Alert History**: Persistent storage of alert history for analysis

## Installation and Setup

### Prerequisites
- Node.js 18+ with ES module support
- Mindcraft project structure with frontend and backend directories
- Administrative access for system notifications (optional)

### Quick Start

1. **Basic Usage**
   ```bash
   node debug-monitor.js
   ```

2. **Verbose Mode**
   ```bash
   node debug-monitor.js --verbose
   ```

3. **Custom Configuration**
   ```bash
   node debug-monitor.js --config my-config.js
   ```

4. **Help and Options**
   ```bash
   node debug-monitor.js --help
   ```

## Configuration

### Default Configuration

The monitor uses a comprehensive default configuration that can be customized:

```javascript
const CONFIG = {
  backend: {
    command: 'node',
    args: ['main.js'],
    cwd: process.cwd(),
    env: { ...process.env }
  },
  frontend: {
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(process.cwd(), 'frontend'),
    env: { ...process.env }
  },
  monitoring: {
    enabled: true,
    logLevel: 'info',
    alertThreshold: 3,
    websocketTimeout: 5000,
    apiTimeout: 3000,
    alertThresholds: {
      critical: 1,
      warning: 3,
      total: 5
    },
    autoRestart: false,
    autoReconnect: true
  }
};
```

### Custom Configuration File

Create a custom configuration file (`my-config.js`) to override defaults:

```javascript
// my-config.js
export default {
  monitoring: {
    logLevel: 'debug',
    alertThreshold: 5,
    autoRestart: true,
    alertThresholds: {
      critical: 2,
      warning: 5,
      total: 8
    }
  },
  // Custom backend command
  backend: {
    command: 'node',
    args: ['--inspect', 'main.js']
  }
};
```

## Usage Guide

### Starting the Monitor

1. **Standard Mode**: Monitors both frontend and backend with default settings
2. **Verbose Mode**: Enables detailed diagnostic output and debugging information
3. **Custom Mode**: Uses your custom configuration file

### Real-time Monitoring

Once started, the monitor provides:

- **Live Log Streams**: Color-coded output from both processes
- **Error Detection**: Automatic identification and classification of issues
- **Health Reports**: Regular status updates every 30 seconds
- **Alert Notifications**: Immediate alerts for critical issues

### WebSocket Diagnostics

The monitor performs comprehensive WebSocket testing:

```bash
🔍 WebSocket Diagnostics:
  ✅ HTTP Connectivity: Response time: 45ms
  ❌ WebSocket Handshake: Error: Connection timeout
  ✅ Socket.IO Protocol: Response time: 123ms
  ❌ Message Round-Trip: Error: Message timeout
```

### Error Classification

Errors are automatically classified and handled:

#### Critical Errors (🚨)
- Memory exhaustion
- Process failures
- Maximum call stack exceeded
- Uncaught exceptions

#### Warning Errors (⚠️)
- Deprecated warnings
- Performance issues
- Timeout warnings
- High memory usage

#### Info Messages (ℹ️)
- Connection status
- Initialization messages
- Ready states

## Troubleshooting Guide

### Common Issues and Solutions

#### WebSocket Connection Issues

**Symptoms**: `WebSocket connection failed` or `Handshake timeout`

**Solutions**:
1. Check if backend is running: `curl -I http://localhost:8080`
2. Verify port availability: `netstat -an | grep 8080`
3. Check firewall settings
4. Restart backend process

#### Port Binding Errors

**Symptoms**: `EADDRINUSE: address already in use`

**Solutions**:
1. Kill existing processes: `npx kill-port 8080`
2. Find and kill manually: `lsof -ti:8080 | xargs kill`
3. Wait a few seconds and retry

#### Memory Issues

**Symptoms**: `High memory usage` or `out of memory`

**Solutions**:
1. Monitor with Node.js inspector: `node --inspect main.js`
2. Reduce agent count or system load
3. Check for memory leaks in agent loops
4. Clear agent cache and restart

#### Build/Compilation Errors

**Symptoms**: Frontend build failures or module resolution errors

**Solutions**:
1. Clear build cache: `rm -rf frontend/dist frontend/node_modules/.cache`
2. Reinstall dependencies: `cd frontend && npm install`
3. Check TypeScript configuration
4. Verify import paths and syntax

### Advanced Troubleshooting

#### Debug Mode

Enable verbose mode for detailed diagnostics:

```bash
node debug-monitor.js --verbose
```

This provides:
- Detailed WebSocket diagnostics
- Alert pattern matching details
- System resource monitoring
- Memory usage tracking

#### Custom Alert Thresholds

Configure alert thresholds for your environment:

```javascript
// custom-config.js
export default {
  monitoring: {
    alertThresholds: {
      critical: 2,    // Alert after 2 critical errors
      warning: 5,     // Alert after 5 warnings
      total: 10       // Alert after 10 total errors
    }
  }
};
```

#### Emergency Reports

When critical thresholds are exceeded, the monitor generates emergency reports:

```json
{
  "timestamp": "2025-12-12T13:30:00.000Z",
  "reason": "critical",
  "source": "backend",
  "system_status": {
    "isRunning": true,
    "backend": { "running": true, "errors": 5 },
    "frontend": { "running": true, "errors": 2 }
  },
  "recommendations": [
    "Immediate restart of the backend process",
    "Review recent code changes for breaking modifications",
    "Check system resources (memory, CPU, disk space)"
  ]
}
```

## Testing and Validation

### Running Tests

The debug monitor includes a comprehensive test suite:

```bash
node test-debug-monitor.js
```

### Test Coverage

The test suite validates:
- ✅ Basic startup and initialization
- ✅ Error detection and classification
- ✅ WebSocket monitoring functionality
- ✅ Health check systems
- ✅ Alert threshold mechanisms
- ✅ Log management and file saving
- ✅ Process recovery mechanisms
- ✅ Performance under load

### Expected Results

Successful test execution should show:
```
📊 Test Suite Results
================================
Total Tests: 8
Passed: 8
Failed: 0
Success Rate: 100.0%
✅ Test suite completed!
```

## Integration with Development Workflow

### Development Mode

Use during active development:

```bash
# Start monitoring with verbose output
node debug-monitor.js --verbose

# In another terminal, make code changes
# Monitor will detect and classify any issues
```

### CI/CD Integration

Integrate into your CI/CD pipeline:

```bash
# Run tests before deployment
node test-debug-monitor.js

# Monitor during staging deployment
node debug-monitor.js --config staging-config.js
```

### Production Monitoring

For production environments:

1. **Custom Configuration**: Create production-specific config
2. **Log Aggregation**: Integrate with your logging system
3. **Alert Routing**: Configure notifications to your monitoring tools
4. **Performance Tuning**: Adjust thresholds for production loads

## File Outputs and Logs

### Log Files

The monitor generates several output files:

- **`debug-logs-*.json`**: Complete log buffers with metadata
- **`debug-alerts.jsonl`**: Line-delimited alert history
- **`emergency-report-*.json`**: Critical incident reports
- **`test-results.json`**: Test suite results

### Log Format

Log files include comprehensive metadata:

```json
{
  "timestamp": "2025-12-12T13:30:00.000Z",
  "errorCounts": { "backend": 2, "frontend": 1 },
  "websocketStatus": { "connected": true, "successRate": 95.5 },
  "apiStatus": { "reachable": true, "lastCheck": 1702398600000 },
  "backendLogs": [
    { "timestamp": "...", "source": "stdout", "line": "Server started" }
  ],
  "frontendLogs": [
    { "timestamp": "...", "source": "stderr", "line": "Warning message" }
  ]
}
```

## Performance Considerations

### Resource Usage

The debug monitor is designed for minimal impact:
- **Memory Usage**: < 50MB typical usage
- **CPU Overhead**: < 5% during normal operation
- **Disk I/O**: Minimal, only during log saving

### Optimization Tips

1. **Log Buffer Size**: Adjust buffer sizes for your log volume
2. **Check Intervals**: Configure health check frequency
3. **Alert Thresholds**: Tune thresholds for your environment
4. **Verbose Mode**: Use only when debugging, not in production

### Scaling

For large-scale deployments:
- Use centralized log aggregation
- Configure remote monitoring
- Implement distributed alerting
- Consider dedicated monitoring instances

## API Reference

### DebugMonitor Class

#### Constructor
```javascript
const monitor = new DebugMonitor();
```

#### Methods

- `start()`: Start monitoring processes
- `getStatus()`: Get current system status
- `saveLogBuffer()`: Manually save log buffer

#### Configuration Options

See the Configuration section for all available options.

### Events and Callbacks

The monitor emits various events for integration:

```javascript
monitor.on('alert', (alert) => {
  // Handle custom alert logic
});

monitor.on('status-change', (status) => {
  // Handle status changes
});
```

## Contributing and Extensions

### Adding New Error Patterns

Extend error detection by adding patterns:

```javascript
const patterns = {
  critical: [
    // Add your custom patterns
    /your-custom-error-pattern/i
  ]
};
```

### Custom Notification Channels

Add custom notification methods:

```javascript
function sendCustomNotification(alert) {
  // Your custom notification logic
}
```

### Extending Health Checks

Add custom health checks:

```javascript
function customHealthCheck() {
  // Your custom health check logic
}
```

## Support and Troubleshooting

### Getting Help

1. **Documentation**: Refer to this guide first
2. **Verbose Mode**: Use `--verbose` for detailed diagnostics
3. **Test Suite**: Run tests to validate functionality
4. **Log Analysis**: Review generated log files

### Common Questions

**Q: Can I monitor only the backend or frontend?**
A: Yes, modify the configuration to disable the unwanted process.

**Q: How do I reduce memory usage?**
A: Decrease log buffer sizes and increase cleanup frequency.

**Q: Can I integrate with external monitoring tools?**
A: Yes, use the alert callbacks and log file outputs.

**Q: What if the monitor itself crashes?**
A: Enable auto-restart and use external process managers.

## License and Credits

This debug monitor is part of the Mindcraft AI agent platform and is designed to enhance development productivity and system reliability.

---

**Last Updated**: December 12, 2025  
**Version**: 1.0.0  
**Compatibility**: Mindcraft v2.0+
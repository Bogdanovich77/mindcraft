# Mindcraft Cognitive Dashboard - Maintenance Guide

## Table of Contents
1. [Overview](#overview)
2. [Regular Maintenance](#regular-maintenance)
3. [System Monitoring](#system-monitoring)
4. [Performance Optimization](#performance-optimization)
5. [Security Maintenance](#security-maintenance)
6. [Backup Procedures](#backup-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Emergency Procedures](#emergency-procedures)
9. [Maintenance Schedule](#maintenance-schedule)
10. [Documentation Updates](#documentation-updates)

## Overview

This guide provides comprehensive procedures for maintaining the Mindcraft Cognitive Dashboard in production environments. Regular maintenance ensures optimal performance, security, and reliability of the system.

### Maintenance Objectives
- **System Health**: Maintain optimal performance and availability
- **Security**: Protect against vulnerabilities and unauthorized access
- **Data Integrity**: Ensure data consistency and backup reliability
- **User Experience**: Provide smooth, responsive dashboard experience
- **Compliance**: Maintain adherence to security and operational standards

## Regular Maintenance

### Daily Tasks

#### System Health Checks
```bash
#!/bin/bash
# daily-health-check.sh

echo "Starting daily health checks..."

# Check application status
if curl -f http://localhost:8080/health; then
    echo "✅ Application is healthy"
else
    echo "❌ Application health check failed"
    # Send alert
    ./send-alert.sh "Application health check failed"
fi

# Check database connectivity
if curl -f http://localhost:5432/health; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    ./send-alert.sh "Database health check failed"
fi

# Check cache connectivity
if curl -f http://localhost:6379/ping; then
    echo "✅ Cache is healthy"
else
    echo "❌ Cache health check failed"
    ./send-alert.sh "Cache health check failed"
fi

# Check SSL certificate expiry
if openssl x509 -checkend 30 -noout -in /etc/ssl/cert.pem; then
    echo "⚠️  SSL certificate expires within 30 days"
    ./send-alert.sh "SSL certificate expiring soon"
else
    echo "✅ SSL certificate is valid"
fi

echo "Daily health checks completed"
```

#### Log Rotation
```bash
#!/bin/bash
# daily-log-rotation.sh

echo "Starting daily log rotation..."

# Rotate application logs
logrotate -f /etc/logrotate.d/mindcraft-frontend

# Rotate nginx logs
logrotate -f /etc/logrotate.d/nginx

# Rotate system logs
journalctl --rotate --vacuum-file=1d

echo "Log rotation completed"
```

#### Performance Monitoring
```bash
#!/bin/bash
# daily-performance-monitor.sh

echo "Starting daily performance monitoring..."

# Check response times
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:8080/health)
if (( $(echo "$RESPONSE_TIME < 0.5" | bc -l))); then
    echo "✅ Response time: ${RESPONSE_TIME}s (good)"
else
    echo "⚠️  Response time: ${RESPONSE_TIME}s (slow)"
    ./send-alert.sh "Slow response time detected: ${RESPONSE_TIME}s"
fi

# Check memory usage
MEMORY_USAGE=$(docker stats --no-stream --format "table {{.MemUsage}}" mindcraft-frontend | tail -1 | awk '{print $2}')
MEMORY_PERCENT=$(echo "$MEMORY_USAGE" | sed 's/%//')

if (( $(echo "$MEMORY_PERCENT > 80" | bc -l))); then
    echo "⚠️  Memory usage: ${MEMORY_PERCENT}% (high)"
    ./send-alert.sh "High memory usage: ${MEMORY_PERCENT}%"
else
    echo "✅ Memory usage: ${MEMORY_PERCENT}% (acceptable)"
fi

# Check CPU usage
CPU_USAGE=$(docker stats --no-stream --format "table {{.CPUPerc}}" mindcraft-frontend | tail -1 | awk '{print $2}')
if (( $(echo "$CPU_USAGE > 80" | bc -l))); then
    echo "⚠️  CPU usage: ${CPU_USAGE}% (high)"
    ./send-alert.sh "High CPU usage: ${CPU_USAGE}%"
else
    echo "✅ CPU usage: ${CPU_USAGE}% (acceptable)"
fi

echo "Performance monitoring completed"
```

### Weekly Tasks

#### Security Updates
```bash
#!/bin/bash
# weekly-security-updates.sh

echo "Starting weekly security updates..."

# Update Docker images
docker-compose pull

# Update system packages
apt update && apt upgrade -y

# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy:latest image mindcraft-frontend:latest

# Update SSL certificates if needed
if ! openssl x509 -checkend 7 -noout -in /etc/ssl/cert.pem; then
    echo "Renewing SSL certificates..."
    certbot renew --quiet
    docker-compose restart nginx
fi

echo "Security updates completed"
```

#### Database Maintenance
```bash
#!/bin/bash
# weekly-database-maintenance.sh

echo "Starting weekly database maintenance..."

# Database cleanup
docker-compose exec db psql -U postgres -d mindcraft -c "
    -- Clean up old sessions
    DELETE FROM user_sessions WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Update statistics
    ANALYZE agent_performance;
    ANALYZE user_activity;
    
    -- Rebuild indexes
    REINDEX INDEX CONCURRENTLY agent_performance_idx;
    REINDEX INDEX CONCURRENTLY user_activity_idx;
"

# Database backup
docker-compose exec db pg_dump -U postgres -d mindcraft | gzip > /backup/weekly-db-$(date +%Y%m%d).sql.gz

echo "Database maintenance completed"
```

#### Performance Optimization
```bash
#!/bin/bash
# weekly-performance-optimization.sh

echo "Starting weekly performance optimization..."

# Optimize database queries
docker-compose exec db psql -U postgres -d mindcraft -c "
    -- Update table statistics
    VACUUM ANALYZE;
    
    -- Rebuild fragmented indexes
    REINDEX DATABASE mindcraft;
"

# Clear application cache
curl -X POST http://localhost:8080/api/cache/clear \
    -H "Authorization: Bearer $ADMIN_TOKEN"

# Optimize static assets
find /var/www/html -name "*.js" -mtime +7 -delete
find /var/www/html -name "*.css" -mtime +7 -delete

# Restart services if needed
if [ $(docker stats mindcraft-frontend --format "table {{.MemUsage}}" | tail -1 | awk '{print $2}' | sed 's/%//') -gt 85 ]; then
    echo "Restarting due to high memory usage..."
    docker-compose restart frontend
fi

echo "Performance optimization completed"
```

### Monthly Tasks

#### Comprehensive System Audit
```bash
#!/bin/bash
# monthly-system-audit.sh

echo "Starting monthly system audit..."

# Security audit
./security-audit.sh

# Performance audit
./performance-audit.sh

# Configuration audit
./configuration-audit.sh

# Compliance audit
./compliance-audit.sh

# Generate audit report
cat > /reports/monthly-audit-$(date +%Y%m%d).json <<EOF
{
  "auditDate": "$(date -I)",
  "securityAudit": "$(cat /tmp/security-audit.json)",
  "performanceAudit": "$(cat /tmp/performance-audit.json)",
  "configurationAudit": "$(cat /tmp/configuration-audit.json)",
  "complianceAudit": "$(cat /tmp/compliance-audit.json)"
}
EOF

echo "Monthly system audit completed"
```

#### Capacity Planning
```bash
#!/bin/bash
# monthly-capacity-planning.sh

echo "Starting monthly capacity planning..."

# Analyze resource usage
CURRENT_USAGE=$(docker stats --no-stream --format "json" mindcraft-frontend | jq '.[0]')

# Analyze storage usage
STORAGE_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

# Analyze network usage
NETWORK_STATS=$(vnstat -s | tail -1)

# Generate capacity report
cat > /reports/capacity-planning-$(date +%Y%m%d).json <<EOF
{
  "reportDate": "$(date -I)",
  "resourceUsage": {
    "cpu": $(echo $CURRENT_USAGE | jq '.CPUPerc'),
    "memory": $(echo $CURRENT_USAGE | jq '.MemUsage'),
    "storage": "$STORAGE_USAGE",
    "network": {
      "rx": $(echo $NETWORK_STATS | awk '{print $2}'),
      "tx": $(echo $NETWORK_STATS | awk '{print $10}')
    }
  },
  "recommendations": [
    {
      "type": "cpu",
      "action": "Consider scaling if CPU usage > 80%",
      "priority": "medium"
    },
    {
      "type": "memory",
      "action": "Consider scaling if memory usage > 85%",
      "priority": "high"
    },
    {
      "type": "storage",
      "action": "Plan storage expansion if usage > 80%",
      "priority": "medium"
    }
  ]
}
EOF

echo "Capacity planning completed"
```

## System Monitoring

### Monitoring Setup

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'mindcraft-frontend'
    static_configs:
      - targets: ['mindcraft-frontend:9090']
    metrics_path: /metrics
    scrape_interval: 5s
    scrape_timeout: 5s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']
    metrics_path: /nginx_status
    scrape_interval: 5s
    scrape_timeout: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 5s
    scrape_timeout: 5s
```

#### Alert Rules
```yaml
# alert_rules.yml
groups:
  - name: mindcraft-frontend
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
          service: mindcraft-frontend
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: critical
          service: mindcraft-frontend
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: HighMemoryUsage
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) < 0.1
        for: 5m
        labels:
          severity: warning
          service: mindcraft-frontend
        annotations:
          summary: "High memory usage detected"
          description: "Available memory is {{ $value }} of total"

      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total[5m])) * 100) > 80
        for: 5m
        labels:
          severity: critical
          service: mindcraft-frontend
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is {{ $value }}%"
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Mindcraft Frontend Monitoring",
    "tags": ["mindcraft", "frontend"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ],
        "gridPos": {
          "h": 1,
          "w": 1
        }
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "gridPos": {
          "h": 1,
          "w": 2
        }
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Errors/sec"
          }
        ],
        "gridPos": {
          "h": 2,
          "w": 1
        }
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes",
            "legendFormat": "Available Memory"
          },
          {
            "expr": "process_resident_memory_bytes / node_memory_MemTotal_bytes",
            "legendFormat": "Used Memory"
          }
        ],
        "gridPos": {
          "h": 2,
          "w": 2
        }
      },
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (rate(node_cpu_seconds_total[5m])) * 100)",
            "legendFormat": "CPU %"
          }
        ],
        "gridPos": {
          "h": 3,
          "w": 1
        }
      }
    ]
  }
}
```

### Log Management

#### Centralized Logging
```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/mindcraft/*.log
  fields:
    service: mindcraft-frontend
    environment: production
  multiline.pattern: '^\d{4}-\d{2}-\d{2}'
  multiline.negate: true
  multiline.match: after

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "mindcraft-frontend-%{+yyyy.MM.dd}"
  template.name: "mindcraft"
  template.pattern: "mindcraft-*"
  setup.template.name: "mindcraft"
  setup.template.pattern: "mindcraft-*"

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_docker_metadata:
      when.not.contains.tags: forwarded
  - add_kubernetes_metadata:
      when.not.contains.tags: forwarded
```

#### Log Analysis
```bash
#!/bin/bash
# log-analysis.sh

echo "Starting log analysis..."

# Analyze error patterns
ERROR_PATTERNS=$(grep -E "(ERROR|FATAL|CRITICAL)" /var/log/mindcraft/app.log | tail -100 | jq -R .)

# Analyze performance issues
SLOW_REQUESTS=$(grep -E "response_time.*[0-9]{4,}" /var/log/mindcraft/nginx/access.log | tail -100)

# Analyze security events
SECURITY_EVENTS=$(grep -E "(unauthorized|forbidden|attack)" /var/log/mindcraft/nginx/access.log | tail -100)

# Generate analysis report
cat > /reports/log-analysis-$(date +%Y%m%d).json <<EOF
{
  "analysisDate": "$(date -I)",
  "errorPatterns": $ERROR_PATTERNS,
  "slowRequests": $SLOW_REQUESTS,
  "securityEvents": $SECURITY_EVENTS,
  "recommendations": [
    {
      "type": "error",
      "action": "Investigate frequent error patterns",
      "priority": "high"
    },
    {
      "type": "performance",
      "action": "Optimize slow endpoints",
      "priority": "medium"
    },
    {
      "type": "security",
      "action": "Review security events and implement protections",
      "priority": "critical"
    }
  ]
}
EOF

echo "Log analysis completed"
```

## Performance Optimization

### Database Optimization
```sql
-- Database optimization queries
-- Update statistics
ANALYZE agent_performance;
ANALYZE user_activity;
ANALYZE goal_hierarchy;

-- Rebuild indexes
REINDEX INDEX CONCURRENTLY agent_performance_idx;
REINDEX INDEX CONCURRENTLY user_activity_idx;

-- Clean up old data
DELETE FROM user_sessions WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Optimize configuration
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET effective_cache_size = '256MB';
```

### Application Optimization
```typescript
// Performance optimization settings
export const performanceConfig = {
  // Bundle optimization
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      maxAsyncRequests: 25,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    runtimeChunk: 'single'
  },
  
  // Service worker optimization
  pwa: {
    enabled: true,
    cacheId: 'mindcraft-v1',
    strategies: ['networkFirst', 'cacheFirst']
  },
  
  // Resource optimization
  resourceHints: {
    preload: ['/css/main.css', '/js/main.js'],
    prefetch: ['/api/agents', '/api/goals']
  },
  
  // Lazy loading
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px'
  }
};
```

### Caching Strategy
```nginx
# Advanced caching configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=mindcraft_cache:10m inactive=60m use_temp_path=off;

# Cache key optimization
proxy_cache_key "$scheme$request_method$host$request_uri$cookie_user";

# Cache bypass for dynamic content
proxy_cache_bypass $cookie_nocache $arg_nocache $http_pragma;

# Cache conditions
proxy_cache_valid 200 302;
proxy_cache_valid 404 1m;
proxy_cache_valid any 0s;

# Cache headers
add_header X-Cache-Status $upstream_cache_status always;
add_header X-Cache-Key $upstream_cache_key always;
```

## Security Maintenance

### Security Audit Script
```bash
#!/bin/bash
# security-audit.sh

echo "Starting security audit..."

# Check SSL certificate
if openssl x509 -checkend 30 -noout -in /etc/ssl/cert.pem; then
    SSL_STATUS="valid"
    SSL_DAYS=$(openssl x509 -noout -in /etc/ssl/cert.pem -dates | grep notAfter | cut -d= -f2)
else
    SSL_STATUS="expired"
    SSL_DAYS=0
fi

# Check security headers
SECURITY_HEADERS=$(curl -I https://mindcraft.example.com 2>/dev/null | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Strict-Transport-Security)")

# Check for open ports
OPEN_PORTS=$(nmap -sS -sV -p 80,443,3000,5432 localhost)

# Check file permissions
FILE_PERMISSIONS=$(find /var/www/html -type f -perm /o+w)

# Check for vulnerable packages
VULNERABILITIES=$(docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy:latest image mindcraft-frontend:latest --format json)

# Generate security report
cat > /tmp/security-audit.json <<EOF
{
  "auditDate": "$(date -I)",
  "sslCertificate": {
    "status": "$SSL_STATUS",
    "daysUntilExpiry": "$SSL_DAYS"
  },
  "securityHeaders": "$SECURITY_HEADERS",
  "openPorts": "$OPEN_PORTS",
  "filePermissions": "$FILE_PERMISSIONS",
  "vulnerabilities": $VULNERABILITIES,
  "recommendations": [
    {
      "type": "ssl",
      "action": "Renew SSL certificate if expiring within 30 days",
      "priority": "high"
    },
    {
      "type": "headers",
      "action": "Ensure all security headers are present",
      "priority": "medium"
    },
    {
      "type": "ports",
      "action": "Close unnecessary open ports",
      "priority": "medium"
    },
    {
      "type": "permissions",
      "action": "Remove write permissions from static files",
      "priority": "medium"
    },
    {
      "type": "vulnerabilities",
      "action": "Update packages to fix vulnerabilities",
      "priority": "critical"
    }
  ]
}
EOF

echo "Security audit completed"
```

### Access Control
```bash
#!/bin/bash
# access-control.sh

# Review user permissions
echo "Reviewing user permissions..."

# Check for unauthorized access attempts
UNAUTHORIZED_ATTEMPTS=$(grep "401" /var/log/nginx/access.log | tail -100 | wc -l)

# Check for suspicious activity
SUSPICIOUS_IPS=$(grep -E "(union|select|drop)" /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -10)

# Check for privilege escalation attempts
PRIVILEGE_ATTEMPTS=$(grep -E "(sudo|su|root)" /var/log/auth.log | tail -100)

# Generate access report
cat > /reports/access-control-$(date +%Y%m%d).json <<EOF
{
  "reportDate": "$(date -I)",
  "unauthorizedAttempts": $UNAUTHORIZED_ATTEMPTS,
  "suspiciousIPs": "$SUSPICIOUS_IPS",
  "privilegeEscalationAttempts": "$PRIVILEGE_ATTEMPTS",
  "recommendations": [
    {
      "type": "unauthorized",
      "action": "Implement rate limiting and account lockout",
      "priority": "high"
    },
    {
      "type": "suspicious",
      "action": "Block suspicious IP addresses",
      "priority": "medium"
    },
    {
      "type": "privilege",
      "action": "Monitor and restrict privileged access",
      "priority": "critical"
    }
  ]
}
EOF

echo "Access control review completed"
```

## Backup Procedures

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/mindcraft"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

echo "Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
echo "Backing up application files..."
tar -czf "$BACKUP_DIR/app-$DATE.tar.gz" \
    /var/www/html \
    /etc/nginx \
    --exclude="*.log" \
    --exclude="node_modules"

# Backup database
echo "Backing up database..."
docker-compose exec db pg_dump -U postgres -d mindcraft | gzip > "$BACKUP_DIR/db-$DATE.sql.gz"

# Backup configuration files
echo "Backing up configuration..."
tar -czf "$BACKUP_DIR/config-$DATE.tar.gz" \
    /etc/mindcraft \
    /root/.env.production

# Backup SSL certificates
echo "Backing up SSL certificates..."
tar -czf "$BACKUP_DIR/ssl-$DATE.tar.gz" \
    /etc/ssl

# Create backup manifest
cat > "$BACKUP_DIR/manifest-$DATE.json" <<EOF
{
  "backupDate": "$(date -I)",
  "backupId": "$DATE",
  "files": {
    "application": "app-$DATE.tar.gz",
    "database": "db-$DATE.sql.gz",
    "configuration": "config-$DATE.tar.gz",
    "ssl": "ssl-$DATE.tar.gz"
  },
  "checksums": {
    "application": "$(sha256sum $BACKUP_DIR/app-$DATE.tar.gz | cut -d' ' -f1)",
    "database": "$(sha256sum $BACKUP_DIR/db-$DATE.sql.gz | cut -d' ' -f1)",
    "configuration": "$(sha256sum $BACKUP_DIR/config-$DATE.tar.gz | cut -d' ' -f1)",
    "ssl": "$(sha256sum $BACKUP_DIR/ssl-$DATE.tar.gz | cut -d' ' -f1)"
  }
}
EOF

# Upload to cloud storage (optional)
if [ -n "$CLOUD_STORAGE_BUCKET" ]; then
    echo "Uploading to cloud storage..."
    aws s3 cp "$BACKUP_DIR" "s3://$CLOUD_STORAGE_BUCKET/mindcraft-backups/$DATE/" --recursive
    echo "Backup uploaded to cloud storage"
fi

# Clean up old backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "manifest-*.json" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed successfully!"
echo "Backup location: $BACKUP_DIR"
echo "Backup ID: $DATE"
```

### Recovery Procedures
```bash
#!/bin/bash
# recovery.sh

BACKUP_FILE=$1
RESTORE_DIR="/tmp/mindcraft-restore"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

echo "Starting recovery process from $BACKUP_FILE..."

# Extract backup
mkdir -p $RESTORE_DIR
tar -xzf $BACKUP_FILE -C $RESTORE_DIR

# Stop services
echo "Stopping services..."
docker-compose down

# Restore application files
echo "Restoring application files..."
if [ -f "$RESTORE_DIR/app-*.tar.gz" ]; then
    tar -xzf "$RESTORE_DIR/app-*.tar.gz" -C /var/www/html
fi

# Restore database
echo "Restoring database..."
if [ -f "$RESTORE_DIR/db-*.sql.gz" ]; then
    docker-compose up -d db
    sleep 10
    gunzip -c "$RESTORE_DIR/db-*.sql.gz" | docker-compose exec -T db psql -U postgres -d mindcraft
fi

# Restore configuration
echo "Restoring configuration..."
if [ -f "$RESTORE_DIR/config-*.tar.gz" ]; then
    tar -xzf "$RESTORE_DIR/config-*.tar.gz" -C /etc/mindcraft
fi

# Restore SSL certificates
echo "Restoring SSL certificates..."
if [ -f "$RESTORE_DIR/ssl-*.tar.gz" ]; then
    tar -xzf "$RESTORE_DIR/ssl-*.tar.gz" -C /etc/ssl
fi

# Start services
echo "Starting services..."
docker-compose up -d

# Health check
echo "Performing health check..."
sleep 30
if curl -f http://localhost:8080/health; then
    echo "✅ Recovery completed successfully"
else
    echo "❌ Recovery failed - health check failed"
    exit 1
fi

# Clean up
rm -rf $RESTORE_DIR

echo "Recovery process completed"
```

## Troubleshooting

### Common Issues and Solutions

#### Performance Issues
```bash
# High Response Times
# Check system resources
top
htop

# Check database performance
docker-compose exec db psql -U postgres -d mindcraft -c "
    SELECT query, mean_exec_time, calls 
    FROM pg_stat_statements 
    ORDER BY mean_exec_time DESC 
    LIMIT 10;
"

# Check network latency
ping -c 10 api.mindcraft.example.com

# Solutions:
# 1. Scale up resources
# 2. Optimize database queries
# 3. Implement caching
# 4. Use CDN for static assets
```

#### Memory Issues
```bash
# Memory Leaks
# Check application memory usage
docker stats mindcraft-frontend --no-stream --format "table {{.MemUsage}}{{.MemPerc}}"

# Check for memory leaks in Node.js
node --inspect=0.0.0.0:9229 app/server.js

# Solutions:
# 1. Restart application
# 2. Check for memory leaks in code
# 3. Increase memory limits
# 4. Implement memory monitoring
```

#### Database Issues
```bash
# Connection Issues
# Check database status
docker-compose exec db pg_isready

# Check connection pool
docker-compose exec db psql -U postgres -d mindcraft -c "
    SELECT state, count 
    FROM pg_stat_activity 
    WHERE state = 'active';
"

# Solutions:
# 1. Restart database
# 2. Check connection pool configuration
# 3. Optimize database queries
# 4. Increase database resources
```

#### SSL/TLS Issues
```bash
# Certificate Problems
# Check certificate validity
openssl x509 -noout -in /etc/ssl/cert.pem -text -noout

# Check certificate chain
openssl s_client -connect api.mindcraft.example.com:443 -servername api.mindcraft.example.com -showcerts

# Solutions:
# 1. Renew certificate
# 2. Update certificate configuration
# 3. Restart nginx
# 4. Implement certificate monitoring
```

## Emergency Procedures

### Incident Response Plan
```bash
#!/bin/bash
# incident-response.sh

INCIDENT_TYPE=$1
SEVERITY=$2
DESCRIPTION=$3

echo "Incident Response: $INCIDENT_TYPE - $SEVERITY"
echo "Description: $DESCRIPTION"

# Log incident
cat >> /var/log/mindcraft/incidents.log <<EOF
$(date -I): $INCIDENT_TYPE - $SEVERITY - $DESCRIPTION
EOF

# Based on severity, take action
case $SEVERITY in
  "critical")
    echo "CRITICAL INCIDENT - Immediate response required"
    # Page on-call engineer
    ./send-alert.sh "CRITICAL: $DESCRIPTION"
    # Implement emergency procedures
    ./emergency-procedures.sh
    ;;
  "high")
    echo "HIGH INCIDENT - Response within 1 hour"
    ./send-alert.sh "HIGH: $DESCRIPTION"
    # Implement high-priority procedures
    ;;
  "medium")
    echo "MEDIUM INCIDENT - Response within 4 hours"
    ./send-alert.sh "MEDIUM: $DESCRIPTION"
    # Implement medium-priority procedures
    ;;
  "low")
    echo "LOW INCIDENT - Response within 24 hours"
    ./send-alert.sh "LOW: $DESCRIPTION"
    # Implement low-priority procedures
    ;;
esac
```

### Emergency Procedures
```bash
#!/bin/bash
# emergency-procedures.sh

echo "Executing emergency procedures..."

# 1. Scale down non-critical services
docker-compose scale frontend=1

# 2. Enable maintenance mode
curl -X POST http://localhost:8080/api/maintenance/enable \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"message": "System maintenance in progress"}'

# 3. Clear caches
curl -X POST http://localhost:8080/api/cache/clear \
    -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Restart critical services
docker-compose restart db
docker-compose restart redis

# 5. Monitor system
./monitor-system.sh

echo "Emergency procedures completed"
```

## Maintenance Schedule

### Automated Scheduling
```bash
# Add to crontab
# crontab -e

# Daily at 2:00 AM
0 2 * * * /opt/mindcraft/scripts/daily-health-check.sh

# Daily at 3:00 AM
0 3 * * * /opt/mindcraft/scripts/daily-log-rotation.sh

# Weekly on Sunday at 1:00 AM
0 1 * * 0 /opt/mindcraft/scripts/weekly-security-updates.sh

# Weekly on Sunday at 2:00 AM
0 2 * * 0 /opt/mindcraft/scripts/weekly-database-maintenance.sh

# Weekly on Sunday at 3:00 AM
0 3 * * 0 /opt/mindcraft/scripts/weekly-performance-optimization.sh

# Monthly on 1st at 12:00 AM
0 12 1 * * /opt/mindcraft/scripts/monthly-system-audit.sh

# Monthly on 1st at 1:00 PM
0 13 1 * * /opt/mindcraft/scripts/monthly-capacity-planning.sh
```

### Maintenance Calendar
```markdown
# Maintenance Calendar 2025

| Date | Time | Task | Responsible | Status |
|------|------|------|-------------|--------|
| Jan 1 | 00:00 | Monthly System Audit | System Admin | Scheduled |
| Jan 1 | 01:00 | Monthly Capacity Planning | Operations | Scheduled |
| Jan 1 | 12:00 | SSL Certificate Renewal | Security Team | Scheduled |
| Weekly | 02:00 | Database Maintenance | DB Admin | Scheduled |
| Weekly | 03:00 | Performance Optimization | DevOps | Scheduled |
| Daily | 02:00 | Log Rotation | SysAdmin | Scheduled |
| Daily | 03:00 | Health Checks | Monitoring | Scheduled |
```

## Documentation Updates

### Maintenance Log
```markdown
# Maintenance Log

## 2025-01-01
### Monthly System Audit
- **Status**: Completed
- **Findings**: 
  - SSL certificate expires in 45 days
  - Memory usage at 75% capacity
  - No critical security vulnerabilities
- **Actions Taken**:
  - Scheduled SSL renewal
  - Planned memory upgrade
  - Updated security configurations
- **Next Review**: 2025-02-01

### Weekly Performance Optimization
- **Status**: Completed
- **Improvements**:
  - Database query optimization completed
  - Response time reduced by 25%
  - Cache hit rate improved to 85%
- **Next Review**: 2025-01-08
```

### Procedure Updates
When maintenance procedures are updated:
1. Update scripts in version control
2. Update documentation
3. Train team on new procedures
4. Update monitoring alerts
5. Test new procedures

---

This maintenance guide provides comprehensive procedures for ensuring the optimal operation of the Mindcraft Cognitive Dashboard system.
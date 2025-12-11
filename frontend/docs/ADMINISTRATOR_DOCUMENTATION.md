# Mindcraft Cognitive Dashboard - Administrator Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Deployment](#deployment)
6. [Monitoring](#monitoring)
7. [Security](#security)
8. [Maintenance](#maintenance)
9. [Backup and Recovery](#backup-and-recovery)
10. [Troubleshooting](#troubleshooting)

## Overview

The Mindcraft Cognitive Dashboard is a production-ready web application for monitoring and managing LangGraph agents. This guide is intended for system administrators responsible for deployment, configuration, and maintenance of the dashboard in production environments.

### Key Administrative Features
- **Production Deployment**: Docker-based deployment with security hardening
- **Configuration Management**: Environment-based configuration system
- **Monitoring and Alerting**: Real-time system health monitoring
- **Security Hardening**: Multi-layer security controls
- **Performance Optimization**: Built-in performance monitoring and optimization
- **Backup and Recovery**: Automated backup and disaster recovery procedures

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores (4+ recommended)
- **Memory**: 4GB RAM (8GB+ recommended)
- **Storage**: 20GB available space (50GB+ recommended)
- **Network**: Stable internet connection with HTTPS support
- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, Windows 10+

### Recommended Production Setup
- **CPU**: 4+ cores with 2.5GHz+ clock speed
- **Memory**: 16GB+ RAM
- **Storage**: 100GB+ SSD storage
- **Network**: 1Gbps+ connection with low latency
- **Load Balancer**: Nginx or similar for high availability
- **SSL Certificate**: Valid SSL certificate for HTTPS

### Software Dependencies
- **Docker**: 20.10+ with Docker Compose
- **Node.js**: 18+ (for local development)
- **Git**: 2.30+ for version control
- **SSL Certificate**: Valid certificate for production

## Installation

### Prerequisites
```bash
# Install Docker (Ubuntu)
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Install Docker (CentOS/RHEL)
sudo yum install docker docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional)
sudo usermod -aG docker $USER
```

### Quick Installation
```bash
# Clone repository
git clone https://github.com/your-org/mindcraft-frontend.git
cd mindcraft-frontend

# Copy environment template
cp .env.example .env.production

# Edit production configuration
nano .env.production

# Deploy with Docker Compose
docker-compose -f docker-compose.yml up -d
```

### Manual Installation
```bash
# Install Node.js dependencies
npm install --production

# Build application
npm run build

# Start production server
npm run preview
```

### Verification
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f

# Test application
curl -I http://localhost:8080
```

## Configuration

### Environment Variables
Create `.env.production` file with the following configuration:

```bash
# Application Configuration
VITE_APP_ENV=production
VITE_APP_TITLE=Mindcraft Cognitive Dashboard
VITE_APP_VERSION=1.0.0

# Backend Connection
VITE_API_URL=https://api.mindcraft.example.com
VITE_SOCKET_URL=https://socket.mindcraft.example.com

# Security Configuration
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Performance Configuration
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_SAMPLE_RATE=0.1

# Feature Flags
VITE_ENABLE_ADVANCED_FEATURES=true
VITE_ENABLE_BETA_FEATURES=false
VITE_ENABLE_DEBUG_MODE=false

# Cache Configuration
VITE_CACHE_DURATION=3600000
VITE_ENABLE_OFFLINE_SUPPORT=true

# Rate Limiting
VITE_API_RATE_LIMIT=100
VITE_SOCKET_RATE_LIMIT=50
```

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=${VITE_API_URL}
      - VITE_SOCKET_URL=${VITE_SOCKET_URL}
    volumes:
      - ./logs:/app/logs
      - ./ssl:/app/ssl:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    security_opt:
      - no-new-privileges:true
    user: "nodejs:nodejs"
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    user: "nginx:nginx"
```

### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=socket:10m rate=5r/s;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Upstream backend
    upstream frontend {
        server frontend:8080;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name mindcraft.example.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name mindcraft.example.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Socket.IO with rate limiting
        location /socket.io/ {
            limit_req zone=socket burst=10 nodelay;
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files with caching
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Cache static assets
            expires 1y;
            add_header Cache-Control "public, immutable";
            
            # Security for static files
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                add_header X-Content-Type-Options "nosniff" always;
            }
        }

        # Health check endpoint
        location /health {
            proxy_pass http://frontend;
            access_log off;
        }
    }
}
```

## Deployment

### Production Deployment Script
```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "Starting production deployment..."

# Backup current deployment
echo "Creating backup..."
docker-compose exec frontend tar -czf /tmp/backup-$(date +%Y%m%d-%H%M%S).tar.gz /app

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Build new image
echo "Building Docker image..."
docker-compose build --no-cache frontend

# Run database migrations (if applicable)
echo "Running migrations..."
docker-compose exec frontend npm run migrate

# Deploy new version
echo "Deploying new version..."
docker-compose up -d --force-recreate frontend

# Health check
echo "Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:8080/health; then
        echo "Health check passed!"
        break
    fi
    echo "Health check attempt $i/30..."
    sleep 10
done

# Clean up old images
echo "Cleaning up old Docker images..."
docker image prune -f

echo "Deployment completed successfully!"
```

### Blue-Green Deployment
```bash
#!/bin/bash
# blue-green-deploy.sh

set -e

ENVIRONMENT=${1:-production}
NEW_COLOR=${2:-blue}

echo "Starting $NEW_COLOR deployment to $ENVIRONMENT..."

# Deploy to new color
docker-compose -f docker-compose.$NEW_COLOR.yml up -d

# Health check new deployment
echo "Health checking $NEW_COLOR deployment..."
for i in {1..30}; do
    if curl -f http://localhost:8081/health; then
        echo "$NEW_COLOR deployment healthy!"
        break
    fi
    echo "Health check attempt $i/30..."
    sleep 10
done

# Switch traffic
echo "Switching traffic to $NEW_COLOR..."
# Update load balancer configuration
# This would integrate with your load balancer API

echo "Traffic switched to $NEW_COLOR!"

# Clean up old deployment
echo "Cleaning up old deployment..."
OLD_COLOR=$(echo $NEW_COLOR | tr 'blue' 'green' | tr 'green' 'blue')
docker-compose -f docker-compose.$OLD_COLOR.yml down

echo "Blue-green deployment completed!"
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Production Deployment

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run lint
      - run: npm run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          echo "${{ secrets.DOCKER_HUB_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_HUB_USERNAME }}" --password-stdin
          docker-compose -f docker-compose.prod.yml up -d
          curl -f http://your-domain.com/health
```

## Monitoring

### Health Check Endpoint
```typescript
// health-check.ts
import { Request, Response } from 'express';

export const healthCheck = async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      limit: 2048 // MB
    },
    cpu: {
      usage: process.cpuUsage().user / 1000000, // Convert to seconds
      limit: 2000 // 2 cores
    },
    services: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      external_api: await checkExternalApiHealth()
    }
  };

  const isHealthy = 
    health.status === 'healthy' &&
    health.memory.used < health.memory.limit * 0.8 &&
    health.services.database === 'healthy' &&
    health.services.redis === 'healthy';

  res.status(isHealthy ? 200 : 503).json(health);
};
```

### Monitoring Dashboard
```typescript
// monitoring-dashboard.ts
interface MonitoringMetrics {
  system: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  application: {
    activeUsers: number;
    requestsPerSecond: number;
    errorRate: number;
    responseTime: number;
  };
  database: {
    connections: number;
    queryTime: number;
    replicationLag: number;
  };
  cache: {
    hitRate: number;
    memoryUsage: number;
    evictionRate: number;
  };
}

class MonitoringService {
  private metrics: MonitoringMetrics;
  private alerts: Alert[] = [];

  async collectMetrics(): Promise<MonitoringMetrics> {
    // Collect system metrics
    this.metrics.system = await this.collectSystemMetrics();
    
    // Collect application metrics
    this.metrics.application = await this.collectApplicationMetrics();
    
    // Collect database metrics
    this.metrics.database = await this.collectDatabaseMetrics();
    
    // Collect cache metrics
    this.metrics.cache = await this.collectCacheMetrics();
    
    return this.metrics;
  }

  async checkAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // CPU alert
    if (this.metrics.system.cpu > 80) {
      alerts.push({
        type: 'cpu_high',
        severity: 'warning',
        message: `CPU usage is ${this.metrics.system.cpu}%`,
        timestamp: new Date()
      });
    }
    
    // Memory alert
    if (this.metrics.system.memory > 85) {
      alerts.push({
        type: 'memory_high',
        severity: 'critical',
        message: `Memory usage is ${this.metrics.system.memory}%`,
        timestamp: new Date()
      });
    }
    
    // Error rate alert
    if (this.metrics.application.errorRate > 5) {
      alerts.push({
        type: 'error_rate_high',
        severity: 'warning',
        message: `Error rate is ${this.metrics.application.errorRate}%`,
        timestamp: new Date()
      });
    }
    
    return alerts;
  }
}
```

### Log Management
```bash
# Log rotation configuration
# /etc/logrotate.d/mindcraft-frontend
/var/log/mindcraft/frontend/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        docker-compose exec frontend kill -USR1 1
    endscript
}
```

## Security

### Security Headers
```nginx
# Enhanced security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Container Security
```dockerfile
# Dockerfile security best practices
FROM node:18-alpine AS builder

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Build application
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set security labels
LABEL maintainer="Mindcraft Team" \
      security.scan="true" \
      version="1.0.0"

# Copy built application
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Set permissions
RUN chmod -R 755 /app && \
    chmod -R 644 /app/dist

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--", "node", "dist/server.js"]
```

### Security Monitoring
```bash
#!/bin/bash
# security-monitor.sh

# Check for suspicious activity
check_suspicious_activity() {
    # Check for unusual login patterns
    grep "Failed login" /var/log/nginx/access.log | tail -20
    
    # Check for unusual request patterns
    grep -E "(union|select|drop|insert)" /var/log/nginx/access.log | tail -10
    
    # Check for high error rates
    ERROR_RATE=$(grep " 5[0-9][0-9] " /var/log/nginx/access.log | wc -l)
    if [ $ERROR_RATE -gt 100 ]; then
        echo "High error rate detected: $ERROR_RATE errors in last hour"
    fi
}

# Check SSL certificate expiration
check_ssl_expiry() {
    EXPIRY=$(echo | openssl s_client -connect mindcraft.example.com:443 -servername mindcraft.example.com 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -lt 30 ]; then
        echo "SSL certificate expires in $DAYS_LEFT days"
    fi
}

# Run security checks
check_suspicious_activity
check_ssl_expiry
```

## Maintenance

### Regular Maintenance Tasks

#### Daily Tasks
```bash
#!/bin/bash
# daily-maintenance.sh

echo "Starting daily maintenance..."

# Log rotation
logrotate -f /etc/logrotate.d/mindcraft-frontend

# Cache cleanup
docker-compose exec frontend npm run cache:clear

# Health check
curl -f http://localhost:8080/health || echo "Health check failed"

echo "Daily maintenance completed"
```

#### Weekly Tasks
```bash
#!/bin/bash
# weekly-maintenance.sh

echo "Starting weekly maintenance..."

# Security updates
docker-compose pull frontend
docker-compose up -d

# Backup database
docker-compose exec db pg_dump mindcraft > /backup/backup-$(date +%Y%m%d).sql

# Clean up old logs
find /var/log/mindcraft -name "*.log" -mtime +7 -delete

# Performance optimization
docker-compose exec frontend npm run optimize:performance

echo "Weekly maintenance completed"
```

#### Monthly Tasks
```bash
#!/bin/bash
# monthly-maintenance.sh

echo "Starting monthly maintenance..."

# Full system update
apt update && apt upgrade -y

# Docker cleanup
docker system prune -a

# SSL certificate renewal
certbot renew --quiet

# Performance audit
npm run audit:performance

# Security audit
npm run audit:security

echo "Monthly maintenance completed"
```

### Performance Tuning

#### Application Performance
```typescript
// performance-optimization.ts
class PerformanceOptimizer {
  // Optimize bundle size
  optimizeBundle() {
    return {
      codeSplitting: {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25
      },
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            }
          }
        }
      }
    };
  }

  // Optimize caching
  optimizeCaching() {
    return {
      static: {
        maxAge: '1y',
        immutable: true
      },
      api: {
        maxAge: '5m',
        mustRevalidate: true
      }
    };
  }

  // Optimize database queries
  optimizeDatabase() {
    return {
      connectionPool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
      },
      queryCache: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000
      }
    };
  }
}
```

#### System Performance
```bash
#!/bin/bash
# system-tuning.sh

# Optimize system limits
echo "nodejs soft nofile 65536" >> /etc/security/limits.conf
echo "nodejs hard nofile 65536" >> /etc/security/limits.conf

# Optimize network settings
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
echo "net.core.netdev_max_backlog = 5000" >> /etc/sysctl.conf

# Apply settings
sysctl -p

# Optimize Docker settings
echo '{"default-ulimits": {"nofile": {"Name": "nofile", "Soft": 65536, "Hard": 65536}}}' > /etc/docker/daemon.json
systemctl restart docker
```

## Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/mindcraft"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="mindcraft-backup-$DATE.tar.gz"

echo "Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf "$BACKUP_DIR/app-$DATE.tar.gz" \
    /app/dist \
    /app/config \
    /app/logs

# Backup database (if applicable)
docker-compose exec db pg_dump mindcraft > "$BACKUP_DIR/db-$DATE.sql"

# Backup environment files
cp .env.production "$BACKUP_DIR/env-$DATE"

# Create comprehensive backup
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    "$BACKUP_DIR/app-$DATE.tar.gz" \
    "$BACKUP_DIR/db-$DATE.sql" \
    "$BACKUP_DIR/env-$DATE"

# Clean up individual files
rm "$BACKUP_DIR/app-$DATE.tar.gz"
rm "$BACKUP_DIR/db-$DATE.sql"
rm "$BACKUP_DIR/env-$DATE"

# Upload to cloud storage (optional)
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://mindcraft-backups/

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "mindcraft-backup-*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE"
```

### Recovery Script
```bash
#!/bin/bash
# recovery.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

echo "Starting recovery process from $BACKUP_FILE..."

# Stop application
docker-compose down

# Extract backup
tar -xzf $BACKUP_FILE -C /tmp/

# Restore application files
tar -xzf /tmp/app-*.tar.gz -C /app/

# Restore database (if applicable)
docker-compose up -d db
sleep 10
docker-compose exec -T db psql -U postgres -d mindcraft < /tmp/db-*.sql

# Restore environment files
cp /tmp/env-* .env.production

# Start application
docker-compose up -d

# Health check
sleep 30
curl -f http://localhost:8080/health || echo "Recovery failed - health check failed"

echo "Recovery completed from $BACKUP_FILE"
```

### Disaster Recovery Plan
```markdown
# Disaster Recovery Procedures

## 1. Immediate Response (0-1 hour)
- Assess damage and impact scope
- Activate incident response team
- Communicate with stakeholders
- Implement emergency measures

## 2. Short-term Recovery (1-24 hours)
- Restore from most recent backup
- Verify system functionality
- Monitor for issues
- Implement temporary fixes

## 3. Long-term Recovery (1-7 days)
- Analyze root cause
- Implement permanent fixes
- Update security measures
- Review and improve procedures

## 4. Post-recovery (1+ weeks)
- Conduct post-mortem
- Update documentation
- Implement monitoring improvements
- Train staff on new procedures
```

## Troubleshooting

### Common Issues and Solutions

#### Application Won't Start
```bash
# Check Docker logs
docker-compose logs frontend

# Check port conflicts
netstat -tulpn | grep :8080

# Check environment variables
docker-compose exec frontend env | grep VITE

# Restart services
docker-compose restart frontend
```

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Analyze memory leaks
docker-compose exec frontend npm run analyze:memory

# Restart application
docker-compose restart frontend

# Scale resources
docker-compose up -d --scale frontend=2
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec db pg_isready

# Check connection logs
docker-compose logs db

# Test connection manually
docker-compose exec frontend npm run test:db-connection

# Restart database
docker-compose restart db
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl s_client -connect mindcraft.example.com:443 -servername mindcraft.example.com

# Check certificate files
ls -la /etc/nginx/ssl/

# Renew certificate
certbot renew --force

# Restart nginx
docker-compose restart nginx
```

### Performance Issues
```bash
# Check system resources
top
htop
iotop

# Analyze application performance
docker-compose exec frontend npm run analyze:performance

# Check network latency
ping -c 10 api.mindcraft.example.com

# Optimize configuration
nano .env.production
```

### Monitoring and Alerting
```bash
# Set up monitoring alerts
curl -X POST https://monitoring.example.com/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mindcraft-frontend",
    "endpoint": "http://localhost:8080/health",
    "interval": 60,
    "alerts": [
      {"type": "down", "threshold": 1},
      {"type": "response_time", "threshold": 5000},
      {"type": "error_rate", "threshold": 5}
    ]
  }'
```

### Log Analysis
```bash
# Analyze error logs
grep "ERROR" /var/log/mindcraft/frontend/*.log | tail -50

# Analyze access patterns
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Analyze response times
awk '{print $NF}' /var/log/nginx/access.log | sort -n | tail -10
```

---

For additional support, please refer to the main documentation or contact the system administrator team.
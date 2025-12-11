# Mindcraft Frontend Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Mindcraft Cognitive Dashboard to production environments with full optimization, monitoring, and scalability features.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Docker Deployment](#docker-deployment)
5. [Service Worker & PWA](#service-worker--pwa)
6. [Performance Monitoring](#performance-monitoring)
7. [Error Tracking & Analytics](#error-tracking--analytics)
8. [CDN Integration](#cdn-integration)
9. [Health Checks](#health-checks)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **Docker**: 20.10.0 or higher
- **Docker Compose**: 1.29.0 or higher
- **Memory**: Minimum 4GB RAM
- **Storage**: Minimum 10GB free disk space

### External Dependencies
- **Reverse Proxy**: Nginx or similar (for SSL termination)
- **SSL Certificates**: Valid certificates for HTTPS
- **CDN**: Optional but recommended (CloudFlare, AWS CloudFront, etc.)
- **Monitoring**: Prometheus + Grafana (optional but recommended)
- **Database**: PostgreSQL or MySQL (for analytics if needed)

## Environment Configuration

### Environment Variables

The application supports three environments with specific configuration files:

#### Development (.env.development)
```bash
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_CDN_URL=
VITE_LOG_LEVEL=debug
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

#### Staging (.env.staging)
```bash
VITE_APP_ENV=staging
VITE_API_URL=https://staging-api.mindcraft.example.com
VITE_SOCKET_URL=https://staging-api.mindcraft.example.com
VITE_CDN_URL=https://staging-cdn.mindcraft.example.com
VITE_LOG_LEVEL=info
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA-STAGING-ID
```

#### Production (.env.production)
```bash
VITE_APP_ENV=production
VITE_API_URL=https://api.mindcraft.example.com
VITE_SOCKET_URL=https://api.mindcraft.example.com
VITE_CDN_URL=https://cdn.mindcraft.example.com
VITE_LOG_LEVEL=error
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_SENTRY_DSN=https://your-production-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA-PRODUCTION-ID
VITE_CLOUDFLARE_ANALYTICS_TOKEN=your-cloudflare-token
VITE_HOTJAR_ID=your-hotjar-id
```

## Build Process

### Local Development Build
```bash
# Install dependencies
npm ci

# Build for development
npm run build

# Build with analysis
npm run build && npm run analyze
```

### Production Build
```bash
# Make build script executable
chmod +x scripts/build.sh

# Build for production
./scripts/build.sh build

# Build for staging
./scripts/build.sh build --env=staging

# Build with tests
./scripts/build.sh build --skip-tests=false
```

### Build Optimization Features

The build process includes:

- **Code Splitting**: Automatic chunk splitting for vendor, MUI, charts, and utilities
- **Tree Shaking**: Removal of unused code
- **Minification**: Terser minification for JavaScript
- **Asset Optimization**: Gzip compression for static assets
- **Bundle Analysis**: Webpack Bundle Analyzer integration
- **Source Maps**: Generated for production debugging
- **Integrity Hashes**: Subresource integrity for security

## Docker Deployment

### Single Container Deployment
```bash
# Build Docker image
docker build -t mindcraft-frontend .

# Run container
docker run -p 8080:8080 -e VITE_API_URL=https://api.example.com mindcraft-frontend
```

### Docker Compose Deployment
```bash
# Build and start all services
docker-compose up --build

# Start specific services
docker-compose up -d frontend nginx

# Stop services
docker-compose down

# View logs
docker-compose logs -f frontend

# Scale frontend
docker-compose up -d --scale frontend=3
```

### Production Docker Compose
```bash
# Use production configuration
docker-compose -f docker-compose.yml --env-file .env.production up -d

# With monitoring stack
docker-compose -f docker-compose.yml --env-file .env.production up -d frontend nginx prometheus grafana
```

## Service Worker & PWA

### Service Worker Features
- **Caching Strategies**: Cache-first for static assets, network-first for API calls
- **Background Sync**: Offline action synchronization
- **Update Management**: Automatic service worker updates
- **Push Notifications**: Real-time agent update notifications
- **Performance Monitoring**: Built-in performance metrics collection

### PWA Features
- **Installable**: Can be installed as a native app
- **Offline Support**: Core functionality available offline
- **App Shortcuts**: Quick access to key features
- **Screen Adaptations**: Responsive design for all devices
- **Share Target**: Handle shared agent data

### Service Worker Registration
The service worker is automatically registered in [`index.html`](index.html:10) with fallback support.

## Performance Monitoring

### Built-in Metrics
- **Core Web Vitals**: LCP, FID, CLS, TTFB, FCP
- **Custom Metrics**: Bundle size, load time, render time
- **Resource Usage**: Memory usage, network information
- **User Interactions**: Clicks, scrolls, form submissions
- **Component Performance**: Per-component render times and error rates

### Performance Thresholds
```typescript
const thresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  bundleSize: { good: 250000, needsImprovement: 500000 }
};
```

### Performance Monitoring Usage
```typescript
import { getPerformanceMonitoringService } from './services/performanceMonitoring';

// Initialize monitoring
const monitoring = getPerformanceMonitoringService({
  enabled: true,
  sampleRate: 0.1,
  reportEndpoint: '/api/performance-metrics'
});

// Start component monitoring
monitoring.startComponentMonitoring('AgentOverview');

// Get performance score
const score = monitoring.getPerformanceScore();

// Get recommendations
const recommendations = monitoring.getRecommendations();
```

## Error Tracking & Analytics

### Sentry Integration
```typescript
import { createErrorTrackingService } from './services/errorTracking';

// Initialize error tracking
const errorTracking = createErrorTrackingService({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
  release: process.env.npm_package_version,
  userId: 'user-123',
  tags: {
    environment: process.env.VITE_APP_ENV,
    version: process.env.npm_package_version
  }
});

// Report error
errorTracking.reportError(new Error('Something went wrong'), {
  component: 'AgentOverview',
  action: 'load_agents'
});

// Report message
errorTracking.reportMessage('User interaction', 'info', {
  interaction: 'button_click',
  target: 'refresh_button'
});
```

### Google Analytics Integration
```typescript
// Analytics is automatically initialized based on environment variables
// Custom event tracking
errorTracking.reportMessage('page_view', 'info', {
  page: '/agents',
  title: 'Agent Overview'
});
```

## CDN Integration

### CDN Configuration
```typescript
import { createCDNIntegrationService } from './utils/cdnIntegration';

// Initialize CDN
const cdn = createCDNIntegrationService({
  enabled: true,
  baseUrl: 'https://cdn.mindcraft.example.com',
  fallbackUrl: 'http://localhost:8080',
  versioning: true,
  cacheHeaders: {
    'Cache-Control': 'public, max-age=31536000, immutable'
  }
});

// Load asset with CDN fallback
const assetInfo = await cdn.loadAsset('/src/main.tsx');
```

### CDN Features
- **Automatic Fallback**: Local server if CDN is unavailable
- **Version Management**: Cache-busting with query parameters
- **Integrity Checking**: Subresource integrity validation
- **Performance Monitoring**: CDN asset loading performance tracking
- **Preloading**: Critical asset preloading for better performance

## Health Checks

### Container Health
```bash
# Check container health
./docker-healthcheck.sh container

# Check application health
./docker-healthcheck.sh application

# Check resource usage
./docker-healthcheck.sh resources

# Check SSL certificates
./docker-healthcheck.sh ssl

# Generate health report
./docker-healthcheck.sh report
```

### Health Check Endpoints
- **Container Health**: `/health` - Returns container status
- **Application Health**: `/` - Main application health
- **Service Worker**: `/sw.js` - Service worker status
- **PWA Manifest**: `/manifest.json` - PWA configuration
- **Bundle Info**: `/build-info.json` - Build metadata

## CI/CD Pipeline

### GitHub Actions Workflow
The [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) provides:

- **Multi-Environment Support**: Development, staging, production
- **Automated Testing**: Unit, integration, and E2E tests
- **Security Scanning**: npm audit and Snyk security scanning
- **Build Optimization**: Bundle analysis and performance monitoring
- **Automated Deployment**: Docker-based deployment with rollback support
- **Performance Monitoring**: Lighthouse CI integration
- **Notification System**: Slack integration for deployment status

### Pipeline Triggers
- **Push to main**: Deploys to staging
- **Pull Requests**: Runs tests against all branches
- **Tags**: Deploys to production when tags are pushed
- **Manual**: Manual deployment triggers

### Environment-Specific Deployment
```yaml
# Staging deployment
name: Deploy to Staging
on:
  push:
    branches: [develop]
jobs:
  deploy-staging:
    environment: staging
    steps: ...
```

## Monitoring & Observability

### Prometheus Metrics
Key metrics are exposed for monitoring:

- **HTTP Metrics**: Request count, response time, status codes
- **Application Metrics**: Error rates, performance scores
- **Resource Metrics**: CPU, memory, disk usage
- **Business Metrics**: User interactions, feature usage

### Grafana Dashboards
Pre-configured dashboards include:

- **Application Performance**: Response times, error rates
- **Infrastructure Health**: Container status, resource usage
- **User Analytics**: Page views, user sessions
- **Error Tracking**: Error rates and patterns

### Alerting Rules
```yaml
groups:
  - name: critical
    rules:
      - alert: HighErrorRate
        for: 5m
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
      - alert: HighResponseTime
        for: 5m
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket))[5m] > 1
        
  - name: warnings
    rules:
      - alert: HighMemoryUsage
        for: 5m
        expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.8
```

## Security Configuration

### SSL/TLS
- **HTTPS Only**: Production requires HTTPS
- **Certificate Management**: Automated certificate renewal
- **Security Headers**: HSTS, CSP, and other security headers
- **Certificate Monitoring**: Expiration alerts and automated renewal

### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### Content Security Policy
- **Default-src**: Self-only for scripts
- **Script-src**: Allow inline scripts for React
- **Style-src**: Self-only for styles
- **Img-src**: Self and data: URIs for images
- **Connect-src**: Self and WebSocket for real-time features

## Troubleshooting

### Common Issues

#### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm ci
npm run build

# Check for memory issues
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Runtime Issues
```bash
# Check container logs
docker logs mindcraft-frontend

# Check resource usage
docker stats mindcraft-frontend

# Restart services
docker-compose restart frontend

# Scale resources
docker-compose up -d --scale frontend=2
```

#### Performance Issues
```bash
# Generate bundle analysis
npm run analyze

# Check performance scores
curl http://localhost:8080/api/performance-metrics

# Clear CDN cache
curl -X PURGE https://cdn.mindcraft.example.com/*
```

### Debug Mode
```bash
# Enable debug logging
VITE_LOG_LEVEL=debug npm run build

# Run with hot reload
npm run dev

# Check service worker status
navigator.serviceWorker.getRegistration()?.active?.state
```

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous version
docker-compose down
docker run -v $(git rev-parse HEAD~1):/app mindcraft-frontend:previous

# Tag current version as broken
git tag broken-$(date +%Y%m%d%H%M%S)
```

### Blue-Green Deployment
```bash
# Deploy to staging (blue)
./scripts/build.sh build --env=staging
./scripts/deploy.sh staging

# Test staging
./scripts/test-staging.sh

# Deploy to production (green)
./scripts/build.sh build --env=production
./scripts/deploy.sh production

# Switch traffic if needed
# Update load balancer configuration
```

### Database Rollback
```bash
# Rollback database migrations
npm run migrate:rollback

# Restore from backup
psql -h localhost -U postgres -d mindcraft < backup.sql
```

## Maintenance

### Regular Maintenance Tasks
- **Log Rotation**: Configure log rotation for container logs
- **Cache Cleanup**: Regular CDN and browser cache clearing
- **Security Updates**: Keep dependencies updated and scan for vulnerabilities
- **Performance Monitoring**: Regular performance score analysis and optimization
- **Backup Strategy**: Regular database and configuration backups

### Maintenance Windows
- **Daily**: Health checks and log rotation
- **Weekly**: Performance analysis and security scanning
- **Monthly**: Dependency updates and capacity planning

## Support

### Monitoring Contacts
- **Development Team**: dev-team@mindcraft.example.com
- **Operations Team**: ops-team@mindcraft.example.com
- **Emergency Contact**: +1-555-123-4567

### Escalation Procedures
1. **Level 1**: Frontend issues - Development team
2. **Level 2**: Infrastructure issues - Operations team
3. **Level 3**: Security incidents - Emergency contact

### Documentation Updates
- **API Documentation**: Keep API endpoints documented
- **Runbooks**: Maintain troubleshooting runbooks
- **Architecture Diagrams**: Update system architecture documentation
- **Change Log**: Document all changes and deployments

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: < 500KB (gzipped)
- **API Response Time**: < 500ms (95th percentile)
- **Error Rate**: < 1%

### Performance Testing
```bash
# Run Lighthouse audit
npm run lighthouse

# Load testing
k6 load --vus 10 --duration 30s http://localhost:8080

# Stress testing
k6 load --vus 50 --duration 60s http://localhost:8080
```

This deployment guide provides comprehensive coverage of all aspects of deploying the Mindcraft Cognitive Dashboard to production, ensuring high performance, security, and maintainability.
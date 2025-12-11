# Mindcraft Cognitive Dashboard - Deployment Documentation

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Cloud Platform Deployment](#cloud-platform-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Configuration Management](#configuration-management)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Security Hardening](#security-hardening)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

## Overview

This guide provides comprehensive instructions for deploying the Mindcraft Cognitive Dashboard in production environments. The deployment process supports multiple infrastructure options including Docker, Kubernetes, and various cloud platforms.

### Deployment Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Production Deployment Architecture          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Load Balancer │  │   Web Server    │  │   Application   │ │
│  │   (Nginx/HAProxy)│  │   (Nginx)      │  │   (Node.js)     │ │
│  │                 │  │                 │  │                 │ │
│  │ • SSL/TLS      │  │ • Static Files  │  │ • API Server    │ │
│  │ • Health Checks  │  │ • Compression   │  │ • Socket.IO     │ │
│  │ • Failover      │  │ • Caching       │  │ • Real-time     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Database      │  │   Cache         │  │   Monitoring    │ │
│  │   (PostgreSQL)   │  │   (Redis)      │  │   (Prometheus)  │ │
│  │                 │  │                 │  │                 │ │
│  │ • Agent Data    │  │ • Session Data  │  │ • Metrics      │ │
│  │ • Configuration │  │ • Query Cache  │  │ • Alerts       │ │
│  │ • Logs         │  │ • Real-time     │  │ • Dashboards    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+, CentOS 8+, RHEL 8+)
- **CPU**: 4+ cores (8+ recommended for high load)
- **Memory**: 8GB+ RAM (16GB+ recommended)
- **Storage**: 50GB+ available SSD storage (100GB+ recommended)
- **Network**: 1Gbps+ connection with low latency
- **SSL Certificate**: Valid SSL certificate for HTTPS

### Software Dependencies
- **Docker**: 20.10+ and Docker Compose 2.0+
- **Node.js**: 18+ (for local development)
- **Git**: 2.30+ for version control
- **SSL Certificate**: Valid certificate and private key
- **Domain Name**: Configured DNS records

### Network Requirements
- **Ports**: 80 (HTTP), 443 (HTTPS), 3000 (Backend API)
- **Firewall**: Allow inbound traffic on required ports
- **DNS**: A record for domain, optional AAAA for IPv6
- **CDN**: Optional CDN for static assets (recommended)

## Environment Setup

### Development Environment
```bash
# Clone repository
git clone https://github.com/your-org/mindcraft-frontend.git
cd mindcraft-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.development

# Start development server
npm run dev
```

### Staging Environment
```bash
# Create staging configuration
cp .env.example .env.staging

# Configure staging variables
nano .env.staging
# VITE_API_URL=https://staging-api.mindcraft.example.com
# VITE_SOCKET_URL=https://staging-socket.mindcraft.example.com
# VITE_APP_TITLE=Mindcraft Dashboard (Staging)
# VITE_ENABLE_DEBUG=true

# Build for staging
npm run build:staging

# Deploy to staging
./scripts/deploy-staging.sh
```

### Production Environment
```bash
# Create production configuration
cp .env.example .env.production

# Configure production variables
nano .env.production
# VITE_API_URL=https://api.mindcraft.example.com
# VITE_SOCKET_URL=https://socket.mindcraft.example.com
# VITE_APP_TITLE=Mindcraft Dashboard
# VITE_ENABLE_DEBUG=false
# VITE_ENABLE_ANALYTICS=true
# VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Build for production
npm run build:prod

# Deploy to production
./scripts/deploy-production.sh
```

## Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage Dockerfile for production deployment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (if using local files)
COPY ssl/ /etc/nginx/ssl/

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/ssl

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose ports
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/nginx/nginx.conf"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: mindcraft-frontend:latest
    container_name: mindcraft-frontend
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=${VITE_API_URL}
      - VITE_SOCKET_URL=${VITE_SOCKET_URL}
      - VITE_APP_TITLE=${VITE_APP_TITLE}
      - VITE_ENABLE_ANALYTICS=${VITE_ENABLE_ANALYTICS}
      - VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
    volumes:
      - ./logs/nginx:/var/log/nginx
      - ./ssl:/etc/nginx/ssl:ro
      - ./cache:/var/cache/nginx
    networks:
      - mindcraft-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    security_opt:
      - no-new-privileges:true
    user: "nginx:nginx"
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    container_name: mindcraft-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
      - ./cache:/var/cache/nginx
    networks:
      - mindcraft-network
    depends_on:
      - frontend
    security_opt:
      - no-new-privileges:true
    user: "nginx:nginx"

networks:
  mindcraft-network:
    driver: bridge

volumes:
  logs-nginx:
    driver: local
  cache-nginx:
    driver: local
  ssl:
    driver: local
```

### Deployment Scripts
```bash
#!/bin/bash
# deploy.sh

set -e

# Configuration
ENVIRONMENT=${1:-production}
DOCKER_REGISTRY=${2:-your-registry.com}
IMAGE_TAG=${3:-latest}

echo "Deploying Mindcraft Cognitive Dashboard to $ENVIRONMENT..."

# Build Docker image
echo "Building Docker image..."
docker build -t $DOCKER_REGISTRY/mindcraft-frontend:$IMAGE_TAG .

# Push to registry
echo "Pushing to registry..."
docker push $DOCKER_REGISTRY/mindcraft-frontend:$IMAGE_TAG

# Deploy based on environment
case $ENVIRONMENT in
  "staging")
    echo "Deploying to staging..."
    docker-compose -f docker-compose.staging.yml up -d
    ;;
  "production")
    echo "Deploying to production..."
    docker-compose -f docker-compose.prod.yml up -d
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

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

echo "Deployment completed successfully!"
```

## Kubernetes Deployment

### Kubernetes Manifests
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mindcraft
  labels:
    name: mindcraft
    app: mindcraft-dashboard

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mindcraft-config
  namespace: mindcraft
data:
  VITE_API_URL: "https://api.mindcraft.example.com"
  VITE_SOCKET_URL: "https://socket.mindcraft.example.com"
  VITE_APP_TITLE: "Mindcraft Cognitive Dashboard"
  VITE_ENABLE_ANALYTICS: "true"
  NODE_ENV: "production"

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mindcraft-secrets
  namespace: mindcraft
type: Opaque
data:
  VITE_SENTRY_DSN: <base64-encoded-sentry-dsn>
  SSL_CERT: <base64-encoded-ssl-cert>
  SSL_KEY: <base64-encoded-ssl-key>

---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mindcraft-frontend
  namespace: mindcraft
  labels:
    app: mindcraft-dashboard
    component: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mindcraft-dashboard
      component: frontend
  template:
    metadata:
      labels:
        app: mindcraft-dashboard
        component: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry.com/mindcraft-frontend:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: mindcraft-config
              key: NODE_ENV
        - name: VITE_API_URL
          valueFrom:
            configMapKeyRef:
              name: mindcraft-config
              key: VITE_API_URL
        - name: VITE_SOCKET_URL
          valueFrom:
            configMapKeyRef:
              name: mindcraft-config
              key: VITE_SOCKET_URL
        - name: VITE_SENTRY_DSN
          valueFrom:
            secretKeyRef:
              name: mindcraft-secrets
              key: VITE_SENTRY_DSN
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mindcraft-frontend-service
  namespace: mindcraft
  labels:
    app: mindcraft-dashboard
    component: frontend
spec:
  selector:
    app: mindcraft-dashboard
    component: frontend
  ports:
  - name: http
    port: 80
    targetPort: 8080
  type: ClusterIP

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mindcraft-frontend-ingress
  namespace: mindcraft
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - mindcraft.example.com
    secretName: mindcraft-tls
  rules:
  - host: mindcraft.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mindcraft-frontend-service
            port:
              number: 80
```

### Horizontal Pod Autoscaler
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mindcraft-frontend-hpa
  namespace: mindcraft
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mindcraft-frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
```

## Cloud Platform Deployment

### AWS Deployment

#### ECS Task Definition
```json
{
  "family": "mindcraft-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "mindcraft-frontend",
      "image": "your-account.dkr.ecr.amazonaws.com/mindcraft-frontend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "VITE_SENTRY_DSN",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:mindcraft-secrets:VITE_SENTRY_DSN"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mindcraft-frontend",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### ECS Service
```json
{
  "serviceName": "mindcraft-frontend-service",
  "taskDefinition": "mindcraft-frontend",
  "launchType": "FARGATE",
  "desiredCount": 2,
  "minimumHealthyPercent": 100,
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "deploymentCircuitBreaker": {
      "enable": false,
      "rollbackPercentage": 0
    }
  },
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-12345"],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/mindcraft-frontend-tg",
      "loadBalancerName": "mindcraft-frontend-alb",
      "containerName": "mindcraft-frontend",
      "containerPort": 8080
    }
  ]
}
```

### Google Cloud Deployment

#### Cloud Run Service
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: mindcraft-frontend
  annotations:
    run.googleapis.com/ingress: "all"
    run.googleapis.com/execution-environment: "production"
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        autoscaling.knative.dev/minScale: "2"
    spec:
      containerConcurrency: 100
      containers:
      - image: gcr.io/your-project/mindcraft-frontend:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: VITE_API_URL
          value: "https://api.mindcraft.example.com"
        - name: VITE_SOCKET_URL
          value: "https://socket.mindcraft.example.com"
        - name: VITE_SENTRY_DSN
          valueFrom:
            secretKeyRef:
              name: mindcraft-secrets
              key: VITE_SENTRY_DSN
        resources:
          limits:
            cpu: "1000m"
            memory: "1Gi"
```

### Azure Deployment

#### Container Instance
```yaml
apiVersion: 2021-10-01
type: Microsoft.ContainerInstance/containerGroups
location: eastus
name: mindcraft-frontend
properties:
  containerGroupName: mindcraft-frontend
  osType: Linux
  restartPolicy: Always
  ipAddressType: Public
  dnsNameLabel: mindcraft-frontend
  containers:
  - name: mindcraft-frontend
    properties:
      image: yourregistry.azurecr.io/mindcraft-frontend:latest
      ports:
      - port: 8080
        protocol: TCP
      environmentVariables:
      - name: NODE_ENV
        value: production
      - name: VITE_API_URL
        value: https://api.mindcraft.example.com
      - name: VITE_SOCKET_URL
        value: https://socket.mindcraft.example.com
      resources:
        requests:
          cpu: 1.0
          memoryInGb: 2.0
        limits:
          cpu: 2.0
          memoryInGb: 4.0
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Mindcraft Dashboard

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: mindcraft-frontend

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run lint
      - run: npm run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Extract metadata
        id: meta
        run: |
          echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.ref_name }}" >> $GITHUB_OUTPUT
          echo "tag=${{ github.ref_name }}" >> $GITHUB_OUTPUT
      - name: Build and push Docker image
        uses: docker/build-push-action@v3
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tag }}
          labels: ${{ steps.meta.outputs.image }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Add your staging deployment commands here

  deploy-production:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # Add your production deployment commands here
```

### GitLab CI/CD
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - security
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_NAME: mindcraft-frontend

test:
  stage: test
  script:
    - npm ci
    - npm run test:ci
    - npm run lint
  coverage: '/coverage'
  artifacts:
    reports:
      junit: coverage/junit.xml
    paths:
      - coverage/

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

security:
  stage: security
  script:
    - npm run security:scan
  artifacts:
    reports:
      sast: security-report.json

deploy-staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.mindcraft.example.com
  script:
    - echo "Deploying to staging..."
    # Add staging deployment commands

deploy-production:
  stage: deploy
  environment:
    name: production
    url: https://mindcraft.example.com
  when: manual
  script:
    - echo "Deploying to production..."
    # Add production deployment commands
```

## Configuration Management

### Environment Variables
```bash
# Production environment variables
export NODE_ENV=production
export VITE_API_URL=https://api.mindcraft.example.com
export VITE_SOCKET_URL=https://socket.mindcraft.example.com
export VITE_APP_TITLE=Mindcraft Cognitive Dashboard
export VITE_ENABLE_ANALYTICS=true
export VITE_ENABLE_ERROR_TRACKING=true
export VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
export VITE_ENABLE_PERFORMANCE_MONITORING=true
export VITE_CACHE_DURATION=3600000
export VITE_RATE_LIMIT_API=1000
export VITE_RATE_LIMIT_SOCKET=100
export VITE_MAX_CONCURRENT_CONNECTIONS=50
export VITE_ENABLE_OFFLINE_SUPPORT=true
export VITE_SERVICE_WORKER_PATH=/sw.js
export VITE_MANIFEST_PATH=/manifest.json
```

### Configuration Files
```yaml
# config/production.yml
app:
  name: Mindcraft Cognitive Dashboard
  version: 1.0.0
  environment: production
  
server:
  host: 0.0.0.0
  port: 8080
  ssl:
    enabled: true
    cert: /etc/ssl/cert.pem
    key: /etc/ssl/key.pem
    
database:
  type: postgresql
  host: localhost
  port: 5432
  name: mindcraft
  user: mindcraft_user
  password: ${DB_PASSWORD}
  pool:
    min: 2
    max: 10
    acquireTimeoutMillis: 30000
    
cache:
  type: redis
  host: localhost
  port: 6379
  password: ${REDIS_PASSWORD}
  ttl: 3600
  
logging:
  level: info
  format: json
  file: /var/log/mindcraft/app.log
  max_size: 100MB
  backup_count: 5
  
security:
  cors:
    enabled: true
    origins: ["https://mindcraft.example.com"]
    methods: ["GET", "POST", "PUT", "DELETE"]
    headers: ["Authorization", "Content-Type"]
  rate_limiting:
    enabled: true
    window_ms: 60000
    max_requests: 1000
    
monitoring:
  enabled: true
  metrics_endpoint: /metrics
  health_endpoint: /health
  prometheus:
    enabled: true
    port: 9090
```

## Monitoring and Logging

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'mindcraft-frontend'
    static_configs:
      - targets: ['mindcraft-frontend:9090']
    metrics_path: /metrics
    scrape_interval: 5s
    scrape_timeout: 5s
```

### Grafana Dashboard
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
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket[5m])",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

### Log Aggregation
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
- add_docker_metadata: ~
- add_kubernetes_metadata: ~
```

## Security Hardening

### SSL/TLS Configuration
```nginx
# SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/ssl/cert.pem;
ssl_certificate_key /etc/ssl/key.pem;
```

### Security Headers
```nginx
# Security headers
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
# Security best practices
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

# Copy built application with proper permissions
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Set security labels
LABEL maintainer="Mindcraft Team" \
      security.scan="true" \
      version="1.0.0"

# Set permissions and switch to non-root user
RUN chmod -R 755 /app && \
    chmod -R 644 /app/dist && \
    chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Use minimal base image
FROM scratch

# Copy only necessary files
COPY --from=production /app/dist ./dist
COPY --from=production /app/node_modules ./node_modules

# Add non-root user
COPY --from=production /etc/passwd /etc/passwd
COPY --from=production /etc/group /etc/group

# Expose port
EXPOSE 8080

# Use dumb-init for proper signal handling
USER nodejs
ENTRYPOINT ["dumb-init", "--", "node", "dist/server.js"]
```

## Performance Optimization

### Nginx Optimization
```nginx
# Performance optimization
worker_processes auto;
worker_connections 1024;

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

# Caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=mindcraft_cache:10m inactive=60m use_temp_path=off;
proxy_cache_min_uses 1;
proxy_cache_use_stale error timeout updating;
proxy_cache_valid 200 302 10m;
proxy_cache_key "$scheme$request_method$host$request_uri";

# Connection keep-alive
keepalive_timeout 65;
keepalive_requests 100;

# Buffer sizes
client_body_buffer_size 128k;
client_max_body_size 10m;
client_header_buffer_size 1k;
large_client_header_buffers 4 8k;

# Timeouts
client_body_timeout 12s;
client_header_timeout 12s;
keepalive_timeout 65s;
send_timeout 10s;
```

### Application Optimization
```typescript
// Performance optimization configuration
export const performanceConfig = {
  // Bundle optimization
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      maxAsyncRequests: 25
    },
    runtimeChunk: 'single'
  },
  
  // Service worker for caching
  pwa: {
    enabled: true,
    cacheId: 'mindcraft-v1',
    strategies: ['networkFirst', 'cacheFirst']
  },
  
  // Resource hints
  resourceHints: {
    preload: ['critical-css', 'critical-js'],
    prefetch: ['next-page-data'],
    preconnect: ['https://api.mindcraft.example.com']
  },
  
  // Lazy loading
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px'
  },
  
  // Virtual scrolling
  virtualScrolling: {
    enabled: true,
    itemHeight: 60,
    bufferSize: 10
  }
};
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Check disk space
df -h

# Check memory
free -h
```

#### Container Issues
```bash
# Check container logs
docker logs mindcraft-frontend

# Check container status
docker ps -a | grep mindcraft-frontend

# Check resource usage
docker stats mindcraft-frontend

# Restart container
docker restart mindcraft-frontend

# Enter container for debugging
docker exec -it mindcraft-frontend sh
```

#### Network Issues
```bash
# Check port availability
netstat -tulpn | grep :8080

# Check DNS resolution
nslookup api.mindcraft.example.com

# Test connectivity
curl -I https://api.mindcraft.example.com/health

# Check SSL certificate
openssl s_client -connect api.mindcraft.example.com:443 -servername api.mindcraft.example.com
```

#### Performance Issues
```bash
# Check system resources
top
htop
iotop

# Monitor network
iftop
nethogs

# Check disk I/O
iotop
iostat

# Analyze application performance
npm run analyze:performance
```

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

echo "Performing health checks..."

# Check application health
if curl -f http://localhost:8080/health; then
    echo "✅ Application health check passed"
else
    echo "❌ Application health check failed"
    exit 1
fi

# Check database connection
if curl -f http://localhost:5432/health; then
    echo "✅ Database health check passed"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check cache connection
if curl -f http://localhost:6379/ping; then
    echo "✅ Cache health check passed"
else
    echo "❌ Cache health check failed"
    exit 1
fi

# Check SSL certificate
if openssl x509 -checkend 30 -noout -in /etc/ssl/cert.pem; then
    echo "✅ SSL certificate valid"
else
    echo "❌ SSL certificate invalid or expired"
    exit 1
fi

echo "All health checks passed!"
```

### Rollback Procedures
```bash
#!/bin/bash
# rollback.sh

VERSION=$1
BACKUP_DIR="/backup/mindcraft"

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

echo "Rolling back to version: $VERSION"

# Find backup
BACKUP_FILE=$(find $BACKUP_DIR -name "mindcraft-backup-$VERSION*" | head -1)

if [ -z "$BACKUP_FILE" ]; then
    echo "Backup file not found for version: $VERSION"
    exit 1
fi

echo "Using backup: $BACKUP_FILE"

# Stop current deployment
docker-compose down

# Extract backup
tar -xzf $BACKUP_FILE -C /tmp/

# Restore application files
cp -r /tmp/app-* /app/

# Start services
docker-compose up -d

# Health check
sleep 30
if curl -f http://localhost:8080/health; then
    echo "✅ Rollback completed successfully"
else
    echo "❌ Rollback failed - health check failed"
    exit 1
fi

echo "Rollback to version $VERSION completed"
```

---

This deployment documentation provides comprehensive guidance for deploying the Mindcraft Cognitive Dashboard in various environments and platforms.
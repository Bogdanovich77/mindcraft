# Multi-stage build for production optimization with security hardening
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install security tools and dependencies
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies with security audit
RUN npm ci --only=production --audit=moderate && npm cache clean --force

# Copy source code
COPY . .

# Build application with optimization flags
RUN npm run build && \
    # Optimize bundle sizes
    npm run analyze || true && \
    # Remove source maps from production
    rm -rf dist/*.map

# Production stage with security hardening
FROM nginx:alpine AS production

# Install security and monitoring tools
RUN apk add --no-cache \
    curl \
    tini \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Copy custom nginx configuration with security enhancements
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy service worker registration script
COPY register-sw.js /usr/share/nginx/html/register-sw.js

# Create optimized directory structure
RUN mkdir -p /usr/share/nginx/html/static/{js,css,assets} && \
    chown -R nginx:nginx /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set proper ownership and permissions
RUN chown -R nodejs:nodejs /usr/share/nginx/html && \
    chown -R nodejs:nodejs /var/cache/nginx && \
    chown -R nodejs:nodejs /var/log/nginx && \
    chown -R nodejs:nodejs /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 644 /usr/share/nginx/html/static && \
    chmod -R 600 /usr/share/nginx/html/*.html

# Create health check script
COPY docker-healthcheck.sh /usr/local/bin/docker-healthcheck.sh
RUN chmod +x /usr/local/bin/docker-healthcheck.sh

# Create security monitoring script
COPY docker-security-monitor.sh /usr/local/bin/docker-security-monitor.sh
RUN chmod +x /usr/local/bin/docker-security-monitor.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Add security labels
LABEL maintainer="Mindcraft Team" \
      version="1.0.0" \
      description="Mindcraft Cognitive Dashboard - Production Optimized" \
      security.scan="true"

# Health check with enhanced monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/docker-healthcheck.sh

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--", "nginx", "-g", "daemon off;"]

# Default command
CMD ["nginx", "-g", "daemon off;"]
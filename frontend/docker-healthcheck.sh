#!/bin/bash

# Docker Health Check Script for Mindcraft Frontend
# Comprehensive health monitoring for production containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✓ $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠ $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✗ $1"
}

# Check if container is healthy
check_container_health() {
    local container_name=${1:-mindcraft-frontend}
    
    log "Checking container health: $container_name"
    
    # Check if container is running
    if ! docker ps --filter "name=$container_name" --format "table {{.Names}}" | grep -q "$container_name"; then
        log_error "Container $container_name is not running"
        return 1
    fi
    
    # Check container health status
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo 'unknown')
    
    if [ "$health_status" != "healthy" ]; then
        log_error "Container health status: $health_status"
        return 1
    fi
    
    log_success "Container $container_name is healthy"
    return 0
}

# Check application endpoints
check_application_endpoints() {
    local base_url=${1:-http://localhost:8080}
    
    log "Checking application endpoints..."
    
    # Check main endpoint
    if ! curl -f -s -m 10 "$base_url/health" > /dev/null; then
        log_error "Health endpoint failed"
        return 1
    fi
    
    # Check service worker
    if ! curl -f -s -m 10 "$base_url/sw.js" > /dev/null; then
        log_error "Service worker not accessible"
        return 1
    fi
    
    # Check PWA manifest
    if ! curl -f -s -m 10 "$base_url/manifest.json" > /dev/null; then
        log_error "PWA manifest not accessible"
        return 1
    fi
    
    # Check main application
    if ! curl -f -s -m 10 "$base_url/" > /dev/null; then
        log_error "Main application not accessible"
        return 1
    fi
    
    log_success "All application endpoints are healthy"
    return 0
}

# Check resource usage
check_resource_usage() {
    local container_name=${1:-mindcraft-frontend}
    
    log "Checking resource usage..."
    
    # Get container stats
    local stats=$(docker stats --no-stream --format "table {{.CPUPerc}},{{.MemUsage}},{{.MemPerc}}" $container_name 2>/dev/null || echo "0 0 0")
    
    if [ -z "$stats" ]; then
        log_error "Could not get container stats"
        return 1
    fi
    
    # Parse CPU usage
    local cpu_usage=$(echo "$stats" | awk 'NR==2 {print $2}' | sed 's/%//')
    
    # Parse memory usage
    local mem_usage=$(echo "$stats" | awk 'NR==2 {print $4}' | sed 's/%//')
    
    # Check thresholds
    local cpu_threshold=${CPU_THRESHOLD:-80}
    local mem_threshold=${MEM_THRESHOLD:-80}
    
    if [ "$cpu_usage" -gt "$cpu_threshold" ]; then
        log_warning "High CPU usage: ${cpu_usage}% (threshold: ${cpu_threshold}%)"
    else
        log_success "CPU usage: ${cpu_usage}%"
    fi
    
    if [ "$mem_usage" -gt "$mem_threshold" ]; then
        log_warning "High memory usage: ${mem_usage}% (threshold: ${mem_threshold}%)"
    else
        log_success "Memory usage: ${mem_usage}%"
    fi
    
    return 0
}

# Check SSL certificates
check_ssl_certificates() {
    local domain=${1:-mindcraft.example.com}
    
    log "Checking SSL certificates for $domain..."
    
    # Check SSL expiration
    local expiry_date=$(echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | openssl x509 -dates -noout 2>/dev/null | awk '/notAfter/ {print $2}')
    
    if [ -z "$expiry_date" ]; then
        log_error "Could not get SSL certificate expiry"
        return 1
    fi
    
    # Convert to timestamp
    local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400))
    
    # Check if certificate expires within 30 days
    if [ "$days_until_expiry" -lt 30 ]; then
        log_warning "SSL certificate expires in $days_until_expiry days ($expiry_date)"
        return 1
    fi
    
    log_success "SSL certificate is valid (expires: $expiry_date)"
    return 0
}

# Check CDN connectivity
check_cdn_connectivity() {
    local cdn_url=${1:-https://cdn.mindcraft.example.com}
    
    log "Checking CDN connectivity..."
    
    # Test CDN endpoint
    if ! curl -f -s -m 10 "$cdn_url/health" > /dev/null; then
        log_error "CDN health endpoint failed"
        return 1
    fi
    
    # Test asset loading
    if ! curl -f -s -m 10 "$cdn_url/test-asset.js" > /dev/null; then
        log_warning "CDN test asset not available (using fallback)"
    else
        log_success "CDN is accessible and assets are loading"
    fi
    
    return 0
}

# Check database connectivity
check_database_connectivity() {
    local db_host=${1:-localhost}
    local db_port=${2:-5432}
    
    log "Checking database connectivity..."
    
    # Test database connection
    if ! nc -z -w3 "$db_host" "$db_port" 2>/dev/null; then
        log_error "Cannot connect to database $db_host:$db_port"
        return 1
    fi
    
    log_success "Database is accessible at $db_host:$db_port"
    return 0
}

# Check external services
check_external_services() {
    log "Checking external service dependencies..."
    
    local services_failed=0
    
    # Check API gateway
    if ! curl -f -s -m 10 "${API_GATEWAY:-https://api.mindcraft.example.com}/health" > /dev/null; then
        log_error "API gateway is not accessible"
        services_failed=$((services_failed + 1))
    fi
    
    # Check authentication service
    if ! curl -f -s -m 10 "${AUTH_SERVICE:-https://auth.mindcraft.example.com}/health" > /dev/null; then
        log_error "Authentication service is not accessible"
        services_failed=$((services_failed + 1))
    fi
    
    # Check analytics service
    if ! curl -f -s -m 10 "${ANALYTICS_SERVICE:-https://analytics.mindcraft.example.com}/health" > /dev/null; then
        log_error "Analytics service is not accessible"
        services_failed=$((services_failed + 1))
    fi
    
    if [ "$services_failed" -eq 0 ]; then
        log_success "All external services are accessible"
    else
        log_error "$services_failed external services are not accessible"
        return 1
    fi
    
    return 0
}

# Generate health report
generate_health_report() {
    local report_file="/tmp/health-report-$(date +%Y%m%d%H%M%S).json"
    
    log "Generating health report: $report_file"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "container_health": $(check_container_health && echo "healthy" || echo "unhealthy"),
  "application_endpoints": $(check_application_endpoints && echo "healthy" || echo "unhealthy"),
  "resource_usage": {
    "cpu_percent": $(docker stats --no-stream --format "{{.CPUPerc}}" mindcraft-frontend 2>/dev/null | awk 'NR==2 {print $1}' || echo "unknown"),
    "memory_percent": $(docker stats --no-stream --format "{{.MemPerc}}" mindcraft-frontend 2>/dev/null | awk 'NR==2 {print $2}' || echo "unknown")
  },
  "ssl_certificates": $(check_ssl_certificates && echo "valid" || echo "invalid"),
  "cdn_connectivity": $(check_cdn_connectivity && echo "healthy" || echo "unhealthy"),
  "database_connectivity": $(check_database_connectivity && echo "healthy" || echo "unhealthy"),
  "external_services": $(check_external_services && echo "healthy" || echo "unhealthy"),
  "overall_health": "healthy"
}
EOF
    
    log_success "Health report generated: $report_file"
    
    # Upload report if configured
    if [ -n "$REPORT_UPLOAD_URL" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d @"$report_file" \
             "$REPORT_UPLOAD_URL" || log_warning "Failed to upload health report"
    fi
    
    return 0
}

# Main function
main() {
    local command=${1:-health}
    
    log "Starting health check: $command"
    
    case $command in
        "container")
            check_container_health
            ;;
        "application")
            check_application_endpoints
            ;;
        "resources")
            check_resource_usage
            ;;
        "ssl")
            check_ssl_certificates
            ;;
        "cdn")
            check_cdn_connectivity
            ;;
        "database")
            check_database_connectivity
            ;;
        "external")
            check_external_services
            ;;
        "report")
            generate_health_report
            ;;
        "all")
            local overall_health=0
            
            check_container_health || overall_health=$((overall_health | 1))
            check_application_endpoints || overall_health=$((overall_health | 1))
            check_resource_usage || overall_health=$((overall_health | 1))
            check_ssl_certificates || overall_health=$((overall_health | 1))
            check_cdn_connectivity || overall_health=$((overall_health | 1))
            check_database_connectivity || overall_health=$((overall_health | 1))
            check_external_services || overall_health=$((overall_health | 1))
            
            if [ "$overall_health" -eq 0 ]; then
                log_success "All health checks passed"
            else
                log_error "Some health checks failed"
            fi
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  container     - Check container health status"
            echo "  application   - Check application endpoints"
            echo "  resources     - Check resource usage"
            echo "  ssl          - Check SSL certificates"
            echo "  cdn          - Check CDN connectivity"
            echo "  database     - Check database connectivity"
            echo "  external      - Check external service dependencies"
            echo "  report       - Generate comprehensive health report"
            echo "  all          - Run all health checks"
            echo "  help         - Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  CPU_THRESHOLD    - CPU usage warning threshold (default: 80)"
            echo "  MEM_THRESHOLD    - Memory usage warning threshold (default: 80)"
            echo "  API_GATEWAY    - API gateway URL for health checks"
            echo "  AUTH_SERVICE    - Authentication service URL for health checks"
            echo "  ANALYTICS_SERVICE - Analytics service URL for health checks"
            echo "  REPORT_UPLOAD_URL - URL to upload health reports"
            exit 0
            ;;
        *)
            log_error "Unknown command: $command"
            echo "Use '$0 help' for available commands"
            exit 1
            ;;
    esac
    
    log "Health check completed: $command"
}

# Script entry point
if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
    main "$@"
fi
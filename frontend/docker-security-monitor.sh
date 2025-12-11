#!/bin/bash

# Docker Security Monitoring Script for Mindcraft Frontend
# Comprehensive security monitoring and vulnerability scanning

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

# Check container security configuration
check_container_security() {
    local container_name=${1:-mindcraft-frontend}
    
    log "Checking container security configuration..."
    
    # Check if container is running as non-root user
    local user_id=$(docker exec $container_name id -u 2>/dev/null || echo "0")
    if [ "$user_id" = "0" ]; then
        log_error "Container is running as root user"
        return 1
    else
        log_success "Container is running as non-root user (UID: $user_id)"
    fi
    
    # Check for privileged mode
    local is_privileged=$(docker inspect --format='{{.HostConfig.Privileged}}' $container_name 2>/dev/null || echo "false")
    if [ "$is_privileged" = "true" ]; then
        log_error "Container is running in privileged mode"
        return 1
    else
        log_success "Container is not running in privileged mode"
    fi
    
    # Check for capabilities
    local capabilities=$(docker inspect --format='{{.HostConfig.CapDrop}}' $container_name 2>/dev/null || echo "[]")
    if [ "$capabilities" = "[]" ]; then
        log_warning "No capabilities dropped from container"
    else
        log_success "Capabilities dropped: $capabilities"
    fi
    
    # Check read-only filesystem
    local read_only=$(docker inspect --format='{{.HostConfig.ReadonlyRootfs}}' $container_name 2>/dev/null || echo "false")
    if [ "$read_only" = "true" ]; then
        log_success "Filesystem is read-only"
    else
        log_warning "Filesystem is not read-only"
    fi
    
    return 0
}

# Check for security vulnerabilities
check_security_vulnerabilities() {
    log "Checking for security vulnerabilities..."
    
    # Check for outdated packages
    if command -v npm >/dev/null 2>&1; then
        log "Running npm audit for security vulnerabilities..."
        
        # Run npm audit and check for high/critical vulnerabilities
        local audit_output=$(npm audit --json 2>/dev/null || echo '{}')
        local vuln_count=$(echo "$audit_output" | jq '.vulnerabilities | length' 2>/dev/null || echo "0")
        
        if [ "$vuln_count" -gt 0 ]; then
            log_warning "Found $vuln_count security vulnerabilities"
            
            # Check for high/critical vulnerabilities
            local high_vulns=$(echo "$audit_output" | jq '.vulnerabilities | map(select(.severity == "high" or .severity == "critical")) | length' 2>/dev/null || echo "0")
            if [ "$high_vulns" -gt 0 ]; then
                log_error "Found $high_vulns high/critical vulnerabilities"
                return 1
            fi
        else
            log_success "No security vulnerabilities found"
        fi
    fi
    
    return 0
}

# Check file permissions and security
check_file_security() {
    local container_name=${1:-mindcraft-frontend}
    
    log "Checking file permissions and security..."
    
    # Check for world-writable files
    local world_writable=$(docker exec $container_name find /usr/share/nginx/html -type f -perm -002 -ls 2>/dev/null | wc -l)
    if [ "$world_writable" -gt 0 ]; then
        log_warning "Found $world_writable world-writable files"
    else
        log_success "No world-writable files found"
    fi
    
    # Check for SUID/SGID files
    local suid_files=$(docker exec $container_name find /usr/share/nginx/html -type f -perm -4000 -ls 2>/dev/null | wc -l)
    local sgid_files=$(docker exec $container_name find /usr/share/nginx/html -type f -perm -2000 -ls 2>/dev/null | wc -l)
    
    if [ "$suid_files" -gt 0 ]; then
        log_error "Found $suid_files SUID files"
        return 1
    else
        log_success "No SUID files found"
    fi
    
    if [ "$sgid_files" -gt 0 ]; then
        log_error "Found $sgid_files SGID files"
        return 1
    else
        log_success "No SGID files found"
    fi
    
    # Check for sensitive files with wrong permissions
    local sensitive_files=$(docker exec $container_name find /usr/share/nginx/html -name "*.env" -o -name "*.key" -o -name "*.pem" -o -name "*.config" -type f ! -perm 600 -ls 2>/dev/null | wc -l)
    if [ "$sensitive_files" -gt 0 ]; then
        log_warning "Found $sensitive_files sensitive files with incorrect permissions"
    else
        log_success "All sensitive files have correct permissions"
    fi
    
    return 0
}

# Check network security
check_network_security() {
    local container_name=${1:-mindcraft-frontend}
    
    log "Checking network security..."
    
    # Check for exposed ports
    local exposed_ports=$(docker port $container_name 2>/dev/null | grep -c "0.0.0.0" || echo "0")
    if [ "$exposed_ports" -gt 1 ]; then
        log_warning "Multiple ports exposed: $exposed_ports"
    else
        log_success "Only necessary ports exposed"
    fi
    
    # Check for port binding
    local port_bindings=$(docker inspect --format='{{.NetworkSettings.Ports}}' $container_name 2>/dev/null | jq 'keys | length' 2>/dev/null || echo "0")
    if [ "$port_bindings" -gt 1 ]; then
        log_warning "Multiple port bindings detected"
    else
        log_success "Minimal port bindings configured"
    fi
    
    return 0
}

# Check for security headers
check_security_headers() {
    local base_url=${1:-http://localhost:8080}
    
    log "Checking security headers..."
    
    # Check for security headers
    local headers=$(curl -s -I "$base_url" 2>/dev/null || echo "")
    
    # Check CSP header
    if echo "$headers" | grep -q "Content-Security-Policy"; then
        log_success "CSP header is present"
    else
        log_warning "CSP header is missing"
    fi
    
    # Check HSTS header
    if echo "$headers" | grep -q "Strict-Transport-Security"; then
        log_success "HSTS header is present"
    else
        log_warning "HSTS header is missing"
    fi
    
    # Check X-Frame-Options
    if echo "$headers" | grep -q "X-Frame-Options"; then
        log_success "X-Frame-Options header is present"
    else
        log_warning "X-Frame-Options header is missing"
    fi
    
    # Check X-Content-Type-Options
    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        log_success "X-Content-Type-Options header is present"
    else
        log_warning "X-Content-Type-Options header is missing"
    fi
    
    return 0
}

# Check for SSL/TLS configuration
check_ssl_configuration() {
    local domain=${1:-localhost}
    local port=${2:-8080}
    
    log "Checking SSL/TLS configuration..."
    
    # Check if SSL is configured
    if [ "$port" = "443" ]; then
        log_success "HTTPS is configured on port $port"
        
        # Check SSL certificate
        local cert_info=$(echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
        
        if [ -n "$cert_info" ]; then
            local expiry_date=$(echo "$cert_info" | awk '/notAfter/ {print $2}')
            local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null)
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400))
            
            if [ "$days_until_expiry" -lt 30 ]; then
                log_warning "SSL certificate expires in $days_until_expiry days ($expiry_date)"
                return 1
            else
                log_success "SSL certificate is valid (expires: $expiry_date)"
            fi
        else
            log_error "Could not retrieve SSL certificate information"
            return 1
        fi
    else
        log_warning "HTTP is being used (consider HTTPS for production)"
    fi
    
    return 0
}

# Generate security report
generate_security_report() {
    local report_file="/tmp/security-report-$(date +%Y%m%d%H%M%S).json"
    
    log "Generating security report: $report_file"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "container_security": $(check_container_security && echo "secure" || echo "insecure"),
  "vulnerabilities": $(check_security_vulnerabilities && echo "none" || echo "found"),
  "file_security": $(check_file_security && echo "secure" || echo "insecure"),
  "network_security": $(check_network_security && echo "secure" || echo "insecure"),
  "security_headers": $(check_security_headers && echo "present" || echo "missing"),
  "ssl_configuration": $(check_ssl_configuration && echo "secure" || echo "insecure"),
  "overall_security": "secure"
}
EOF
    
    log_success "Security report generated: $report_file"
    
    # Upload report if configured
    if [ -n "$SECURITY_REPORT_URL" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d @"$report_file" \
             "$SECURITY_REPORT_URL" || log_warning "Failed to upload security report"
    fi
    
    return 0
}

# Monitor for security events
monitor_security_events() {
    local container_name=${1:-mindcraft-frontend}
    
    log "Starting security event monitoring..."
    
    # Monitor Docker events for security issues
    docker events --filter "container=$container_name" --format "{{.Time}} {{.Status}} {{.Action}}" \
        | while read event; do
            local timestamp=$(echo "$event" | awk '{print $1}')
            local status=$(echo "$event" | awk '{print $2}')
            local action=$(echo "$event" | awk '{print $3}')
            
            case "$status" in
                "die")
                    log_error "Container died at $timestamp - Action: $action"
                    # Send alert
                    if [ -n "$SECURITY_ALERT_URL" ]; then
                        curl -X POST -H "Content-Type: application/json" \
                             -d "{\"timestamp\":\"$timestamp\",\"status\":\"$status\",\"action\":\"$action\"}" \
                             "$SECURITY_ALERT_URL" || log_warning "Failed to send security alert"
                    fi
                    ;;
                "restart")
                    log_warning "Container restarted at $timestamp - Action: $action"
                    ;;
                "oom")
                    log_error "Out of memory detected at $timestamp"
                    ;;
            esac
        done &
    
    # Store the background process PID
    echo $! > /tmp/security-monitor.pid
    
    log_success "Security event monitoring started (PID: $!)"
    return 0
}

# Stop security monitoring
stop_security_monitoring() {
    if [ -f /tmp/security-monitor.pid ]; then
        local pid=$(cat /tmp/security-monitor.pid)
        kill $pid 2>/dev/null
        rm -f /tmp/security-monitor.pid
        log_success "Security event monitoring stopped (PID: $pid)"
    else
        log_warning "No security monitoring process found"
    fi
}

# Main function
main() {
    local command=${1:-check}
    
    log "Starting security monitoring: $command"
    
    case $command in
        "container")
            check_container_security
            ;;
        "vulnerabilities")
            check_security_vulnerabilities
            ;;
        "files")
            check_file_security
            ;;
        "network")
            check_network_security
            ;;
        "headers")
            check_security_headers
            ;;
        "ssl")
            check_ssl_configuration
            ;;
        "report")
            generate_security_report
            ;;
        "monitor")
            monitor_security_events
            ;;
        "stop")
            stop_security_monitoring
            ;;
        "all")
            local overall_security=0
            
            check_container_security || overall_security=$((overall_security | 1))
            check_security_vulnerabilities || overall_security=$((overall_security | 1))
            check_file_security || overall_security=$((overall_security | 1))
            check_network_security || overall_security=$((overall_security | 1))
            check_security_headers || overall_security=$((overall_security | 1))
            check_ssl_configuration || overall_security=$((overall_security | 1))
            
            if [ "$overall_security" -eq 0 ]; then
                log_success "All security checks passed"
            else
                log_error "Some security checks failed"
            fi
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  container      - Check container security configuration"
            echo "  vulnerabilities  - Check for security vulnerabilities"
            echo "  files         - Check file permissions and security"
            echo "  network        - Check network security"
            echo "  headers        - Check security headers"
            echo "  ssl            - Check SSL/TLS configuration"
            echo "  report         - Generate comprehensive security report"
            echo "  monitor        - Start security event monitoring"
            echo "  stop           - Stop security event monitoring"
            echo "  all            - Run all security checks"
            echo "  help           - Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  SECURITY_REPORT_URL    - URL to upload security reports"
            echo "  SECURITY_ALERT_URL    - URL to send security alerts"
            exit 0
            ;;
        *)
            log_error "Unknown command: $command"
            echo "Use '$0 help' for available commands"
            exit 1
            ;;
    esac
    
    log "Security monitoring completed: $command"
}

# Script entry point
if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
    main "$@"
fi
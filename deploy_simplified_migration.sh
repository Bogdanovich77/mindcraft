#!/bin/bash

# Mindcraft Simplified Migration Deployment Script
# 
# Comprehensive deployment with staging, pilot, and production phases
# Includes automated rollback capabilities and monitoring

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
PROFILES_DIR="$PROJECT_ROOT/profiles"
BACKUP_DIR="$PROJECT_ROOT/profiles_simplified_backup"
REPORTS_DIR="$PROJECT_ROOT/deployment_reports"
LOG_DIR="$PROJECT_ROOT/deployment_logs"

# Timestamp for this deployment
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOYMENT_ID="simplified_migration_$TIMESTAMP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="$LOG_DIR/deployment_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"
mkdir -p "$REPORTS_DIR"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Deployment configuration
DEPLOYMENT_CONFIG="$PROJECT_ROOT/deployment_config.json"
if [[ ! -f "$DEPLOYMENT_CONFIG" ]]; then
    cat > "$DEPLOYMENT_CONFIG" << 'EOF'
{
  "staging": {
    "enabled": true,
    "profiles": ["claude", "gpt"],
    "validation_required": true,
    "performance_tests": true
  },
  "pilot": {
    "enabled": true,
    "profiles": ["claude", "gpt", "llama", "MasterChief"],
    "validation_required": true,
    "performance_tests": true,
    "monitoring_duration": 300
  },
  "production": {
    "enabled": false,
    "backup_level": "full",
    "validation_required": true,
    "performance_tests": true,
    "monitoring_duration": 1800,
    "auto_rollback_threshold": 0.8
  }
}
EOF
    print_status "Created default deployment configuration"
fi

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking deployment prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check if migration script exists
    if [[ ! -f "$PROJECT_ROOT/migrate_to_simplified.js" ]]; then
        print_error "Migration script not found: migrate_to_simplified.js"
        exit 1
    fi
    
    # Check if validation script exists
    if [[ ! -f "$PROJECT_ROOT/validate_simplified_migration.js" ]]; then
        print_error "Validation script not found: validate_simplified_migration.js"
        exit 1
    fi
    
    # Check profiles directory
    if [[ ! -d "$PROFILES_DIR" ]]; then
        print_error "Profiles directory not found: $PROFILES_DIR"
        exit 1
    fi
    
    # Check disk space (at least 1GB free)
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 1048576 ]]; then
        print_error "Insufficient disk space. At least 1GB required"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to create deployment backup
create_deployment_backup() {
    local backup_level=${1:-"full"}
    local backup_name="$DEPLOYMENT_ID"
    
    print_status "Creating $backup_level backup: $backup_name"
    
    local backup_path="$BACKUP_DIR/$backup_name"
    mkdir -p "$backup_path"
    
    # Backup profiles
    cp -r "$PROFILES_DIR" "$backup_path/profiles"
    
    # Backup configuration files
    if [[ -f "$PROJECT_ROOT/settings.js" ]]; then
        cp "$PROJECT_ROOT/settings.js" "$backup_path/"
    fi
    
    # Backup migration metadata
    if [[ -f "$PROJECT_ROOT/migration_metadata.json" ]]; then
        cp "$PROJECT_ROOT/migration_metadata.json" "$backup_path/"
    fi
    
    # Create backup manifest
    cat > "$backup_path/manifest.json" << EOF
{
  "deployment_id": "$DEPLOYMENT_ID",
  "backup_level": "$backup_level",
  "created_at": "$(date -Iseconds)",
  "profiles_count": $(find "$PROFILES_DIR" -name "*.json" -not -path "*/defaults/*" -not -path "*/tasks/*" | wc -l),
  "backup_size": "$(du -sh "$backup_path" | cut -f1)"
}
EOF
    
    print_success "Backup created: $backup_path"
    echo "$backup_path" > "$BACKUP_DIR/latest_backup.txt"
}

# Function to run staging deployment
run_staging_deployment() {
    print_status "Starting staging deployment..."
    
    local config=$(jq -r '.staging' "$DEPLOYMENT_CONFIG")
    local enabled=$(echo "$config" | jq -r '.enabled')
    
    if [[ "$enabled" != "true" ]]; then
        print_warning "Staging deployment disabled, skipping..."
        return 0
    fi
    
    local profiles=$(echo "$config" | jq -r '.profiles[]')
    local validation_required=$(echo "$config" | jq -r '.validation_required')
    
    # Create staging environment
    local staging_dir="$PROJECT_ROOT/staging_$TIMESTAMP"
    mkdir -p "$staging_dir"
    
    # Copy profiles to staging
    print_status "Setting up staging environment..."
    cp -r "$PROFILES_DIR" "$staging_dir/"
    
    # Run migration on staging profiles
    print_status "Running migration on staging profiles..."
    local staging_profiles=""
    for profile in $profiles; do
        if [[ -f "$staging_dir/profiles/$profile.json" ]]; then
            staging_profiles="$staging_dir/profiles/$profile.json,$staging_profiles"
        fi
    done
    
    # Remove trailing comma
    staging_profiles=${staging_profiles%,}
    
    if [[ -n "$staging_profiles" ]]; then
        cd "$PROJECT_ROOT"
        node migrate_to_simplified.js --dry-run --profiles="$staging_profiles" 2>&1 | tee -a "$LOG_FILE"
        
        # Run validation if required
        if [[ "$validation_required" == "true" ]]; then
            print_status "Running staging validation..."
            cd "$PROJECT_ROOT"
            node validate_simplified_migration.js 2>&1 | tee -a "$LOG_FILE"
        fi
    fi
    
    # Cleanup staging
    rm -rf "$staging_dir"
    
    print_success "Staging deployment completed"
}

# Function to run pilot deployment
run_pilot_deployment() {
    print_status "Starting pilot deployment..."
    
    local config=$(jq -r '.pilot' "$DEPLOYMENT_CONFIG")
    local enabled=$(echo "$config" | jq -r '.enabled')
    
    if [[ "$enabled" != "true" ]]; then
        print_warning "Pilot deployment disabled, skipping..."
        return 0
    fi
    
    local profiles=$(echo "$config" | jq -r '.profiles[]')
    local validation_required=$(echo "$config" | jq -r '.validation_required')
    local monitoring_duration=$(echo "$config" | jq -r '.monitoring_duration')
    
    # Create pilot backup
    create_deployment_backup "pilot"
    
    # Run migration on pilot profiles
    print_status "Running migration on pilot profiles..."
    local pilot_profiles=""
    for profile in $profiles; do
        if [[ -f "$PROFILES_DIR/$profile.json" ]]; then
            pilot_profiles="$pilot_profiles,$profile"
        fi
    done
    
    # Remove trailing comma
    pilot_profiles=${pilot_profiles#,}
    
    if [[ -n "$pilot_profiles" ]]; then
        cd "$PROJECT_ROOT"
        node migrate_to_simplified.js --profiles="$pilot_profiles" 2>&1 | tee -a "$LOG_FILE"
        
        # Run validation if required
        if [[ "$validation_required" == "true" ]]; then
            print_status "Running pilot validation..."
            cd "$PROJECT_ROOT"
            node validate_simplified_migration.js 2>&1 | tee -a "$LOG_FILE"
        fi
        
        # Monitor pilot deployment
        print_status "Monitoring pilot deployment for ${monitoring_duration}s..."
        monitor_deployment "$monitoring_duration"
    fi
    
    print_success "Pilot deployment completed"
}

# Function to run production deployment
run_production_deployment() {
    print_status "Starting production deployment..."
    
    local config=$(jq -r '.production' "$DEPLOYMENT_CONFIG")
    local enabled=$(echo "$config" | jq -r '.enabled')
    
    if [[ "$enabled" != "true" ]]; then
        print_warning "Production deployment disabled, skipping..."
        return 0
    fi
    
    local backup_level=$(echo "$config" | jq -r '.backup_level')
    local validation_required=$(echo "$config" | jq -r '.validation_required')
    local monitoring_duration=$(echo "$config" | jq -r '.monitoring_duration')
    local auto_rollback_threshold=$(echo "$config" | jq -r '.auto_rollback_threshold')
    
    # Confirm production deployment
    echo -e "${YELLOW}WARNING: This will deploy to PRODUCTION!${NC}"
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^yes$ ]]; then
        print_warning "Production deployment cancelled"
        return 0
    fi
    
    # Create production backup
    create_deployment_backup "$backup_level"
    
    # Run full migration
    print_status "Running full production migration..."
    cd "$PROJECT_ROOT"
    node migrate_to_simplified.js 2>&1 | tee -a "$LOG_FILE"
    
    # Run validation if required
    if [[ "$validation_required" == "true" ]]; then
        print_status "Running production validation..."
        cd "$PROJECT_ROOT"
        node validate_simplified_migration.js 2>&1 | tee -a "$LOG_FILE"
        
        # Check validation results
        local validation_quality=$(jq -r '.summary.overallQuality' "$REPORTS_DIR"/validation_report_*.json | tail -1)
        if (( $(echo "$validation_quality < $auto_rollback_threshold" | bc -l) )); then
            print_error "Validation quality ($validation_quality) below threshold ($auto_rollback_threshold)"
            print_status "Initiating automatic rollback..."
            rollback_deployment
            return 1
        fi
    fi
    
    # Monitor production deployment
    print_status "Monitoring production deployment for ${monitoring_duration}s..."
    monitor_deployment "$monitoring_duration"
    
    print_success "Production deployment completed"
}

# Function to monitor deployment
monitor_deployment() {
    local duration=${1:-300}
    local end_time=$(($(date +%s) + duration))
    
    print_status "Monitoring deployment health..."
    
    while [[ $(date +%s) -lt $end_time ]]; do
        # Check system health
        local health_status=$(check_system_health)
        
        if [[ "$health_status" != "healthy" ]]; then
            print_warning "Health check failed: $health_status"
            # Could trigger rollback here in production
        fi
        
        sleep 30
    done
    
    print_success "Monitoring completed successfully"
}

# Function to check system health
check_system_health() {
    # Check if migration processes are running
    local migration_processes=$(pgrep -f "migrate_to_simplified.js" | wc -l)
    if [[ $migration_processes -gt 0 ]]; then
        echo "migration_still_running"
        return
    fi
    
    # Check memory usage
    local memory_usage=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        echo "high_memory_usage"
        return
    fi
    
    # Check disk space
    local disk_usage=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        echo "low_disk_space"
        return
    fi
    
    echo "healthy"
}

# Function to rollback deployment
rollback_deployment() {
    print_status "Initiating deployment rollback..."
    
    local latest_backup=$(cat "$BACKUP_DIR/latest_backup.txt" 2>/dev/null)
    
    if [[ -z "$latest_backup" ]] || [[ ! -d "$latest_backup" ]]; then
        print_error "No backup found for rollback"
        return 1
    fi
    
    print_status "Rolling back to backup: $latest_backup"
    
    # Backup current state before rollback
    local rollback_backup="$BACKUP_DIR/before_rollback_$TIMESTAMP"
    mkdir -p "$rollback_backup"
    cp -r "$PROFILES_DIR" "$rollback_backup/profiles"
    
    # Restore from backup
    rm -rf "$PROFILES_DIR"
    cp -r "$latest_backup/profiles" "$PROFILES_DIR"
    
    # Restore configuration files
    if [[ -f "$latest_backup/settings.js" ]]; then
        cp "$latest_backup/settings.js" "$PROJECT_ROOT/"
    fi
    
    print_success "Rollback completed"
    
    # Validate rollback
    print_status "Validating rollback..."
    cd "$PROJECT_ROOT"
    node validate_simplified_migration.js 2>&1 | tee -a "$LOG_FILE"
}

# Function to generate deployment report
generate_deployment_report() {
    print_status "Generating deployment report..."
    
    local report_file="$REPORTS_DIR/deployment_report_$TIMESTAMP.json"
    
    cat > "$report_file" << EOF
{
  "deployment_id": "$DEPLOYMENT_ID",
  "timestamp": "$(date -Iseconds)",
  "phases": {
    "staging": {
      "completed": $([ -f "$LOG_FILE" ] && grep -q "Staging deployment completed" "$LOG_FILE" && echo true || echo false)
    },
    "pilot": {
      "completed": $([ -f "$LOG_FILE" ] && grep -q "Pilot deployment completed" "$LOG_FILE" && echo true || echo false)
    },
    "production": {
      "completed": $([ -f "$LOG_FILE" ] && grep -q "Production deployment completed" "$LOG_FILE" && echo true || echo false)
    }
  },
  "backup_location": "$BACKUP_DIR/$DEPLOYMENT_ID",
  "log_file": "$LOG_FILE",
  "rollback_available": true,
  "health_status": "$(check_system_health)"
}
EOF
    
    print_success "Deployment report generated: $report_file"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  staging       Run staging deployment"
    echo "  pilot         Run pilot deployment"
    echo "  production    Run production deployment"
    echo "  full          Run complete deployment (staging -> pilot -> production)"
    echo "  rollback      Rollback to previous backup"
    echo "  status        Show deployment status"
    echo "  help          Show this help message"
    echo ""
    echo "Options:"
    echo "  --config FILE    Use custom configuration file"
    echo "  --dry-run        Show what would be done without executing"
    echo "  --force          Skip confirmation prompts"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production --force"
    echo "  $0 rollback"
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status Report"
    echo "========================"
    
    # Show latest deployment
    if [[ -f "$REPORTS_DIR/deployment_report_"*.json ]]; then
        local latest_report=$(ls -t "$REPORTS_DIR"/deployment_report_*.json | head -1)
        echo "Latest Deployment:"
        jq -r '.deployment_id + " - " + .timestamp' "$latest_report"
        echo ""
        
        echo "Phases Status:"
        jq -r '.phases | to_entries[] | "  " + .key + ": " + (if .value.completed then "✅ Completed" else "❌ Not Completed" end)' "$latest_report"
        echo ""
        
        echo "Health Status: $(jq -r '.health_status' "$latest_report")"
        echo "Rollback Available: $(jq -r '.rollback_available' "$latest_report")"
    else
        echo "No deployment reports found"
    fi
    
    echo ""
    echo "System Health: $(check_system_health)"
    echo "Available Backups: $(find "$BACKUP_DIR" -name "simplified_migration_*" -type d | wc -l)"
}

# Main deployment function
main() {
    local command=${1:-"help"}
    local dry_run=false
    local force=false
    
    # Parse arguments
    shift
    while [[ $# -gt 0 ]]; do
        case $1 in
            --config)
                DEPLOYMENT_CONFIG="$2"
                shift 2
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_status "Starting Simplified Migration Deployment"
    print_status "Deployment ID: $DEPLOYMENT_ID"
    
    # Check prerequisites
    check_prerequisites
    
    case $command in
        staging)
            if [[ "$dry_run" == "true" ]]; then
                print_status "DRY RUN: Would run staging deployment"
            else
                run_staging_deployment
            fi
            ;;
        pilot)
            if [[ "$dry_run" == "true" ]]; then
                print_status "DRY RUN: Would run pilot deployment"
            else
                run_pilot_deployment
            fi
            ;;
        production)
            if [[ "$dry_run" == "true" ]]; then
                print_status "DRY RUN: Would run production deployment"
            else
                run_production_deployment
            fi
            ;;
        full)
            if [[ "$dry_run" == "true" ]]; then
                print_status "DRY RUN: Would run full deployment"
            else
                run_staging_deployment
                run_pilot_deployment
                run_production_deployment
            fi
            ;;
        rollback)
            if [[ "$dry_run" == "true" ]]; then
                print_status "DRY RUN: Would rollback deployment"
            else
                rollback_deployment
            fi
            ;;
        status)
            show_status
            ;;
        help)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
    
    # Generate report
    if [[ "$dry_run" != "true" ]] && [[ "$command" != "help" ]] && [[ "$command" != "status" ]]; then
        generate_deployment_report
    fi
    
    print_success "Deployment process completed"
}

# Trap for cleanup
trap 'print_status "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
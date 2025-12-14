/**
 * Validation and Rollback System - Comprehensive validation and rollback capabilities
 * Provides data integrity checks, system health monitoring, and safe rollback mechanisms
 */
import { CompatibilityLayer } from './compatibility_layer.js';
interface EnhancedProfile {
    username: string;
    name?: string;
    role?: string;
    background?: string;
    npc?: any;
    memory_bank?: any;
    modes?: any;
    skin?: any;
    agentState?: any;
    compatibilityMode?: 'legacy_only' | 'hybrid' | 'new_only';
    migrationVersion?: string;
    lastMigrated?: number;
    profileVersion: string;
    createdAt: number;
    lastUpdated: number;
}
/**
 * Validation result interface
 */
interface ValidationResult {
    isValid: boolean;
    severity: 'info' | 'warning' | 'error' | 'critical';
    issues: ValidationIssue[];
    recommendations: string[];
    score: number;
}
/**
 * Validation issue interface
 */
interface ValidationIssue {
    type: 'data_integrity' | 'compatibility' | 'performance' | 'migration' | 'configuration' | 'validation';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    component: string;
    suggestion?: string;
}
/**
 * Rollback point interface
 */
interface RollbackPoint {
    id: string;
    timestamp: number;
    description: string;
    data: any;
    metadata: {
        version: string;
        component: string;
        reason: string;
    };
}
/**
 * System health metrics
 */
interface SystemHealth {
    overall: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    components: ComponentHealth[];
    metrics: HealthMetrics;
    lastCheck: number;
}
/**
 * Component health interface
 */
interface ComponentHealth {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    issues: string[];
    performance: PerformanceMetrics;
}
/**
 * Health metrics interface
 */
interface HealthMetrics {
    memoryUsage: number;
    errorRate: number;
    responseTime: number;
    uptime: number;
    migrationSuccess: number;
}
/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
    cpu: number;
    memory: number;
    responseTime: number;
    throughput: number;
}
/**
 * Validation and Rollback Manager
 */
export declare class ValidationRollbackManager {
    private rollbackPoints;
    private maxRollbackPoints;
    private validationHistory;
    private healthHistory;
    private migrationManager;
    private profileAdapter;
    constructor();
    /**
     * Validate the entire compatibility system
     */
    validateSystem(profile: EnhancedProfile, compatibilityLayer?: CompatibilityLayer): Promise<ValidationResult>;
    /**
     * Create a rollback point with enhanced safety
     */
    createRollbackPoint(data: any, description: string, component: string): Promise<string>;
    /**
     * Rollback to a specific point with enhanced safety
     */
    rollback(rollbackId: string): Promise<any>;
    /**
     * Get system health status
     */
    getSystemHealth(compatibilityLayer?: CompatibilityLayer): Promise<SystemHealth>;
    /**
     * Get available rollback points
     */
    getRollbackPoints(): RollbackPoint[];
    /**
     * Delete a rollback point
     */
    deleteRollbackPoint(rollbackId: string): boolean;
    /**
     * Clear all rollback points
     */
    clearRollbackPoints(): void;
    /**
     * Get validation history
     */
    getValidationHistory(): ValidationResult[];
    /**
     * Get health history
     */
    getHealthHistory(): SystemHealth[];
    /**
     * Sanitize description to prevent injection attacks
     */
    private sanitizeDescription;
    /**
     * Sanitize component name to prevent injection attacks
     */
    private sanitizeComponentName;
    /**
     * Validate agent state structure
     */
    private validateAgentState;
    /**
     * Validate compatibility layer
     */
    private validateCompatibilityLayer;
    /**
     * Validate migration status
     */
    private validateMigrationStatus;
    /**
     * Validate rollback data with enhanced security
     */
    private validateRollbackData;
    /**
     * Calculate severity from issues
     */
    private calculateSeverity;
    /**
     * Generate recommendations from issues
     */
    private generateRecommendations;
    /**
     * Generate rollback ID
     */
    private generateRollbackId;
    /**
     * Get oldest rollback point
     */
    private getOldestRollbackPoint;
    /**
     * Check migration manager health
     */
    private checkMigrationManagerHealth;
    /**
     * Check profile adapter health
     */
    private checkProfileAdapterHealth;
    /**
     * Check compatibility layer health
     */
    private checkCompatibilityLayerHealth;
    /**
     * Calculate health metrics
     */
    private calculateHealthMetrics;
}
export declare const validationRollbackManager: ValidationRollbackManager;
export {};
//# sourceMappingURL=validation_rollback.d.ts.map
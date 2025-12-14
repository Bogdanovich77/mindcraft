/**
 * Validation and Rollback System - Comprehensive validation and rollback capabilities
 * Provides data integrity checks, system health monitoring, and safe rollback mechanisms
 */
import { MigrationManager } from './migration_manager.js';
import { ProfileAdapter } from './profile_adapter.js';
/**
 * Safe deep clone utility replacing unsafe JSON methods
 */
class SafeDeepCloner {
    /**
     * Safely deep clone an object with proper type preservation
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        // Handle Date objects
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        // Handle Array objects
        if (Array.isArray(obj)) {
            return obj.map(item => SafeDeepCloner.deepClone(item));
        }
        // Handle Map objects
        if (obj instanceof Map) {
            const clonedMap = new Map();
            for (const [key, value] of Array.from(obj.entries())) {
                clonedMap.set(key, SafeDeepCloner.deepClone(value));
            }
            return clonedMap;
        }
        // Handle Set objects
        if (obj instanceof Set) {
            const clonedSet = new Set();
            for (const value of Array.from(obj.values())) {
                clonedSet.add(SafeDeepCloner.deepClone(value));
            }
            return clonedSet;
        }
        // Handle plain objects with prototype safety
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && this.isSafeKey(key)) {
                cloned[key] = SafeDeepCloner.deepClone(obj[key]);
            }
        }
        return cloned;
    }
    /**
     * Check if a key is safe for cloning (prevents prototype pollution)
     */
    static isSafeKey(key) {
        const unsafeKeys = ['__proto__', 'constructor', 'prototype', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__'];
        return !unsafeKeys.includes(key) && typeof key === 'string';
    }
    /**
     * Validate that an object is safe for cloning
     */
    static validateForCloning(obj) {
        const issues = [];
        if (obj === null || typeof obj !== 'object') {
            return { isValid: true, issues };
        }
        // Check for prototype pollution attempts
        if (obj.__proto__ !== Object.prototype && obj.__proto__ !== null) {
            issues.push('Object has modified prototype');
        }
        // Check for circular references
        try {
            JSON.stringify(obj);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('circular')) {
                issues.push('Object contains circular references');
            }
        }
        // Check for unsafe keys
        const checkKeys = (currentObj, path = '') => {
            for (const key in currentObj) {
                const currentPath = path ? `${path}.${key}` : key;
                if (!this.isSafeKey(key)) {
                    issues.push(`Unsafe key detected: ${currentPath}`);
                }
                if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
                    if (path.length > 10) { // Prevent infinite recursion
                        continue;
                    }
                    checkKeys(currentObj[key], currentPath);
                }
            }
        };
        checkKeys(obj);
        return { isValid: issues.length === 0, issues };
    }
}
/**
 * Input validation utility
 */
class InputValidator {
    /**
     * Validate rollback point creation input
     */
    static validateRollbackInput(data, description, component) {
        const errors = [];
        // Validate data
        if (data === null || data === undefined) {
            errors.push('Data cannot be null or undefined');
        }
        else {
            const cloneValidation = SafeDeepCloner.validateForCloning(data);
            if (!cloneValidation.isValid) {
                errors.push(...cloneValidation.issues);
            }
        }
        // Validate description
        if (!description || typeof description !== 'string') {
            errors.push('Description must be a non-empty string');
        }
        else if (description.length > 500) {
            errors.push('Description must be less than 500 characters');
        }
        else if (!this.isValidString(description)) {
            errors.push('Description contains invalid characters');
        }
        // Validate component
        if (!component || typeof component !== 'string') {
            errors.push('Component must be a non-empty string');
        }
        else if (!this.isValidComponentName(component)) {
            errors.push('Component name contains invalid characters');
        }
        return { isValid: errors.length === 0, errors };
    }
    /**
     * Validate string for safety
     */
    static isValidString(str) {
        // Allow alphanumeric, spaces, and basic punctuation
        return /^[a-zA-Z0-9\s.,!?;:'"()-]+$/.test(str);
    }
    /**
     * Validate component name for safety
     */
    static isValidComponentName(name) {
        // Allow alphanumeric, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(name);
    }
}
/**
 * Validation and Rollback Manager
 */
export class ValidationRollbackManager {
    rollbackPoints = new Map();
    maxRollbackPoints = 10;
    validationHistory = [];
    healthHistory = [];
    // Component references
    migrationManager;
    profileAdapter;
    constructor() {
        this.migrationManager = new MigrationManager();
        this.profileAdapter = ProfileAdapterFactory.createForProduction();
    }
    /**
     * Validate the entire compatibility system
     */
    async validateSystem(profile, compatibilityLayer) {
        const issues = [];
        const recommendations = [];
        let totalScore = 100;
        try {
            console.log('Starting comprehensive system validation...');
            // Validate profile structure
            const profileValidation = this.validateProfile(profile);
            issues.push(...profileValidation.issues);
            totalScore -= profileValidation.issues.filter(i => i.severity === 'error').length * 10;
            totalScore -= profileValidation.issues.filter(i => i.severity === 'warning').length * 5;
            // Validate agent state if present
            if (profile.agentState) {
                const agentStateValidation = this.validateAgentState(profile.agentState);
                issues.push(...agentStateValidation.issues);
                totalScore -= agentStateValidation.issues.filter(i => i.severity === 'error').length * 10;
                totalScore -= agentStateValidation.issues.filter(i => i.severity === 'warning').length * 5;
            }
            // Validate compatibility layer if provided
            if (compatibilityLayer) {
                const compatibilityValidation = this.validateCompatibilityLayer(compatibilityLayer);
                issues.push(...compatibilityValidation.issues);
                totalScore -= compatibilityValidation.issues.filter(i => i.severity === 'error').length * 10;
                totalScore -= compatibilityValidation.issues.filter(i => i.severity === 'warning').length * 5;
            }
            // Validate migration status
            const migrationValidation = this.validateMigrationStatus(profile);
            issues.push(...migrationValidation.issues);
            totalScore -= migrationValidation.issues.filter(i => i.severity === 'error').length * 10;
            totalScore -= migrationValidation.issues.filter(i => i.severity === 'warning').length * 5;
            // Generate recommendations
            recommendations.push(...this.generateRecommendations(issues));
            const result = {
                isValid: issues.filter(i => i.severity === 'error' || i.severity === 'critical').length === 0,
                severity: this.calculateSeverity(issues),
                issues,
                recommendations,
                score: Math.max(0, totalScore)
            };
            // Store validation history
            this.validationHistory.push(result);
            if (this.validationHistory.length > 50) {
                this.validationHistory = this.validationHistory.slice(-50);
            }
            console.log(`System validation completed with score: ${result.score}/100`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorResult = {
                isValid: false,
                severity: 'critical',
                issues: [{
                        type: 'validation',
                        severity: 'critical',
                        message: `Validation system error: ${errorMessage}`,
                        component: 'validation_manager'
                    }],
                recommendations: ['Restart validation system', 'Check system logs'],
                score: 0
            };
            this.validationHistory.push(errorResult);
            return errorResult;
        }
    }
    /**
     * Create a rollback point with enhanced safety
     */
    async createRollbackPoint(data, description, component) {
        // Validate inputs
        const inputValidation = InputValidator.validateRollbackInput(data, description, component);
        if (!inputValidation.isValid) {
            throw new Error(`Invalid rollback input: ${inputValidation.errors.join(', ')}`);
        }
        const rollbackId = this.generateRollbackId();
        try {
            // Safe deep clone using SafeDeepCloner instead of JSON methods
            const clonedData = SafeDeepCloner.deepClone(data);
            const rollbackPoint = {
                id: rollbackId,
                timestamp: Date.now(),
                description: this.sanitizeDescription(description),
                data: clonedData,
                metadata: {
                    version: '1.0.0',
                    component: this.sanitizeComponentName(component),
                    reason: this.sanitizeDescription(description)
                }
            };
            this.rollbackPoints.set(rollbackId, rollbackPoint);
            // Cleanup old rollback points
            if (this.rollbackPoints.size > this.maxRollbackPoints) {
                const oldestId = this.getOldestRollbackPoint();
                if (oldestId) {
                    this.rollbackPoints.delete(oldestId);
                }
            }
            console.log(`Created rollback point ${rollbackId} for component ${component}`);
            return rollbackId;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create rollback point: ${errorMessage}`);
        }
    }
    /**
     * Rollback to a specific point with enhanced safety
     */
    async rollback(rollbackId) {
        // Validate rollback ID
        if (!rollbackId || typeof rollbackId !== 'string') {
            throw new Error('Invalid rollback ID');
        }
        const rollbackPoint = this.rollbackPoints.get(rollbackId);
        if (!rollbackPoint) {
            throw new Error(`Rollback point ${rollbackId} not found`);
        }
        try {
            console.log(`Rolling back to point ${rollbackId}: ${rollbackPoint.description}`);
            // Validate rollback data
            const validationResult = this.validateRollbackData(rollbackPoint.data);
            if (!validationResult.isValid) {
                throw new Error(`Rollback data validation failed: ${validationResult.issues.map(i => i.message).join(', ')}`);
            }
            // Safe deep clone the rollback data
            return SafeDeepCloner.deepClone(rollbackPoint.data);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Rollback failed: ${errorMessage}`);
        }
    }
    /**
     * Get system health status
     */
    async getSystemHealth(compatibilityLayer) {
        const components = [];
        let overallStatus = 'healthy';
        try {
            // Check migration manager health
            const migrationHealth = this.checkMigrationManagerHealth();
            components.push(migrationHealth);
            // Check profile adapter health
            const profileHealth = this.checkProfileAdapterHealth();
            components.push(profileHealth);
            // Check compatibility layer health if provided
            if (compatibilityLayer) {
                const compatibilityHealth = this.checkCompatibilityLayerHealth(compatibilityLayer);
                components.push(compatibilityHealth);
            }
            // Calculate overall status
            const criticalCount = components.filter(c => c.status === 'critical').length;
            const unhealthyCount = components.filter(c => c.status === 'unhealthy').length;
            const degradedCount = components.filter(c => c.status === 'degraded').length;
            if (criticalCount > 0) {
                overallStatus = 'critical';
            }
            else if (unhealthyCount > 0) {
                overallStatus = 'unhealthy';
            }
            else if (degradedCount > 0) {
                overallStatus = 'degraded';
            }
            const health = {
                overall: overallStatus,
                components,
                metrics: this.calculateHealthMetrics(components),
                lastCheck: Date.now()
            };
            // Store health history
            this.healthHistory.push(health);
            if (this.healthHistory.length > 100) {
                this.healthHistory = this.healthHistory.slice(-100);
            }
            return health;
        }
        catch (error) {
            console.error('System health check failed:', error);
            return {
                overall: 'critical',
                components: [{
                        name: 'health_monitor',
                        status: 'critical',
                        issues: ['Health monitoring system failed'],
                        performance: { cpu: 0, memory: 0, responseTime: 0, throughput: 0 }
                    }],
                metrics: {
                    memoryUsage: 0,
                    errorRate: 100,
                    responseTime: 0,
                    uptime: 0,
                    migrationSuccess: 0
                },
                lastCheck: Date.now()
            };
        }
    }
    /**
     * Get available rollback points
     */
    getRollbackPoints() {
        return Array.from(this.rollbackPoints.values()).sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Delete a rollback point
     */
    deleteRollbackPoint(rollbackId) {
        return this.rollbackPoints.delete(rollbackId);
    }
    /**
     * Clear all rollback points
     */
    clearRollbackPoints() {
        this.rollbackPoints.clear();
    }
    /**
     * Get validation history
     */
    getValidationHistory() {
        return [...this.validationHistory];
    }
    /**
     * Get health history
     */
    getHealthHistory() {
        return [...this.healthHistory];
    }
    /**
     * Sanitize description to prevent injection attacks
     */
    sanitizeDescription(description) {
        if (!description || typeof description !== 'string') {
            return '';
        }
        // Remove potentially dangerous characters
        return description
            .replace(/[<>]/g, '') // Remove HTML brackets
            .replace(/javascript:/gi, '') // Remove javascript protocol
            .replace(/data:/gi, '') // Remove data protocol
            .replace(/vbscript:/gi, '') // Remove vbscript protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
    /**
     * Sanitize component name to prevent injection attacks
     */
    sanitizeComponentName(component) {
        if (!component || typeof component !== 'string') {
            return 'unknown';
        }
        // Only allow alphanumeric, underscores, and hyphens
        return component.replace(/[^a-zA-Z0-9_-]/g, '');
    }
    /**
     * Validate agent state structure
     */
    validateAgentState(agentState) {
        const issues = [];
        if (!agentState.cognitive) {
            issues.push({
                type: 'data_integrity',
                severity: 'error',
                message: 'Agent state missing cognitive component',
                component: 'agent_state'
            });
        }
        if (!agentState.metadata) {
            issues.push({
                type: 'data_integrity',
                severity: 'warning',
                message: 'Agent state missing metadata',
                component: 'agent_state'
            });
        }
        if (agentState.cognitive?.goals) {
            const goalCount = agentState.cognitive.goals.operationalGoals?.length || 0;
            if (goalCount > 50) {
                issues.push({
                    type: 'performance',
                    severity: 'warning',
                    message: `High number of goals (${goalCount}) may impact performance`,
                    component: 'goals'
                });
            }
        }
        return {
            isValid: issues.filter(i => i.severity === 'error').length === 0,
            severity: this.calculateSeverity(issues),
            issues,
            recommendations: [],
            score: Math.max(0, 100 - issues.filter(i => i.severity === 'error').length * 10)
        };
    }
    /**
     * Validate compatibility layer
     */
    validateCompatibilityLayer(compatibilityLayer) {
        const issues = [];
        const status = compatibilityLayer.getStatus();
        if (status.errorCount > 5) {
            issues.push({
                type: 'performance',
                severity: 'warning',
                message: `High error count (${status.errorCount}) in compatibility layer`,
                component: 'compatibility_layer'
            });
        }
        if (!status.initialized) {
            issues.push({
                type: 'configuration',
                severity: 'error',
                message: 'Compatibility layer not initialized',
                component: 'compatibility_layer'
            });
        }
        return {
            isValid: issues.filter(i => i.severity === 'error').length === 0,
            severity: this.calculateSeverity(issues),
            issues,
            recommendations: [],
            score: Math.max(0, 100 - issues.filter(i => i.severity === 'error').length * 10)
        };
    }
    /**
     * Validate migration status
     */
    validateMigrationStatus(profile) {
        const issues = [];
        if (profile.compatibilityMode === 'new_only' && !profile.lastMigrated) {
            issues.push({
                type: 'migration',
                severity: 'warning',
                message: 'New-only mode without migration history',
                component: 'migration'
            });
        }
        if (profile.lastMigrated && Date.now() - profile.lastMigrated > 30 * 24 * 60 * 60 * 1000) {
            issues.push({
                type: 'migration',
                severity: 'info',
                message: 'Migration was performed over 30 days ago',
                component: 'migration'
            });
        }
        return {
            isValid: issues.filter(i => i.severity === 'error').length === 0,
            severity: this.calculateSeverity(issues),
            issues,
            recommendations: [],
            score: Math.max(0, 100 - issues.filter(i => i.severity === 'error').length * 10)
        };
    }
    /**
     * Validate rollback data with enhanced security
     */
    validateRollbackData(data) {
        const issues = [];
        if (!data || typeof data !== 'object') {
            issues.push({
                type: 'data_integrity',
                severity: 'critical',
                message: 'Invalid rollback data structure',
                component: 'rollback'
            });
        }
        else {
            // Check for unsafe cloning issues
            const cloneValidation = SafeDeepCloner.validateForCloning(data);
            if (!cloneValidation.isValid) {
                cloneValidation.issues.forEach(issue => {
                    issues.push({
                        type: 'data_integrity',
                        severity: 'error',
                        message: `Safety issue: ${issue}`,
                        component: 'rollback'
                    });
                });
            }
            // Check for prototype pollution
            if (data.__proto__ !== Object.prototype && data.__proto__ !== null) {
                issues.push({
                    type: 'data_integrity',
                    severity: 'critical',
                    message: 'Rollback data contains prototype pollution',
                    component: 'rollback'
                });
            }
        }
        return {
            isValid: issues.filter(i => i.severity === 'error' || i.severity === 'critical').length === 0,
            severity: this.calculateSeverity(issues),
            issues,
            recommendations: [],
            score: Math.max(0, 100 - issues.filter(i => i.severity === 'error').length * 10)
        };
    }
    /**
     * Calculate severity from issues
     */
    calculateSeverity(issues) {
        if (issues.some(i => i.severity === 'critical'))
            return 'critical';
        if (issues.some(i => i.severity === 'error'))
            return 'error';
        if (issues.some(i => i.severity === 'warning'))
            return 'warning';
        return 'info';
    }
    /**
     * Generate recommendations from issues
     */
    generateRecommendations(issues) {
        const recommendations = [];
        const errorTypes = new Set(issues.map(i => i.type));
        if (errorTypes.has('data_integrity')) {
            recommendations.push('Review and fix data integrity issues');
        }
        if (errorTypes.has('compatibility')) {
            recommendations.push('Check compatibility mode settings');
        }
        if (errorTypes.has('performance')) {
            recommendations.push('Optimize system performance settings');
        }
        if (errorTypes.has('migration')) {
            recommendations.push('Consider re-running migration process');
        }
        if (errorTypes.has('configuration')) {
            recommendations.push('Review system configuration');
        }
        return recommendations;
    }
    /**
     * Generate rollback ID
     */
    generateRollbackId() {
        return `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get oldest rollback point
     */
    getOldestRollbackPoint() {
        let oldestId = null;
        let oldestTime = Date.now();
        for (const [id, point] of this.rollbackPoints) {
            if (point.timestamp < oldestTime) {
                oldestTime = point.timestamp;
                oldestId = id;
            }
        }
        return oldestId;
    }
    /**
     * Check migration manager health
     */
    checkMigrationManagerHealth() {
        const issues = [];
        let status = 'healthy';
        try {
            const history = this.migrationManager.getMigrationHistory();
            const recentFailures = history.filter(h => !h.success && Date.now() - h.timestamp < 24 * 60 * 60 * 1000);
            if (recentFailures.length > 3) {
                issues.push('Multiple recent migration failures');
                status = 'unhealthy';
            }
        }
        catch (error) {
            issues.push('Migration manager health check failed');
            status = 'critical';
        }
        return {
            name: 'migration_manager',
            status,
            issues,
            performance: { cpu: 0, memory: 0, responseTime: 0, throughput: 0 }
        };
    }
    /**
     * Check profile adapter health
     */
    checkProfileAdapterHealth() {
        const issues = [];
        let status = 'healthy';
        try {
            // Basic health check - would include more sophisticated metrics in production
            const cachedProfiles = this.profileAdapter.getCachedProfiles();
            if (cachedProfiles.length > 100) {
                issues.push('High number of cached profiles');
                status = 'degraded';
            }
        }
        catch (error) {
            issues.push('Profile adapter health check failed');
            status = 'critical';
        }
        return {
            name: 'profile_adapter',
            status,
            issues,
            performance: { cpu: 0, memory: 0, responseTime: 0, throughput: 0 }
        };
    }
    /**
     * Check compatibility layer health
     */
    checkCompatibilityLayerHealth(compatibilityLayer) {
        const issues = [];
        let status = 'healthy';
        try {
            const layerStatus = compatibilityLayer.getStatus();
            if (!layerStatus.initialized) {
                issues.push('Compatibility layer not initialized');
                status = 'critical';
            }
            else if (layerStatus.errorCount > 5) {
                issues.push(`High error count: ${layerStatus.errorCount}`);
                status = 'unhealthy';
            }
            else if (layerStatus.errorCount > 0) {
                issues.push(`Some errors detected: ${layerStatus.errorCount}`);
                status = 'degraded';
            }
        }
        catch (error) {
            issues.push('Compatibility layer health check failed');
            status = 'critical';
        }
        return {
            name: 'compatibility_layer',
            status,
            issues,
            performance: { cpu: 0, memory: 0, responseTime: 0, throughput: 0 }
        };
    }
    /**
     * Calculate health metrics
     */
    calculateHealthMetrics(components) {
        const criticalCount = components.filter(c => c.status === 'critical').length;
        const unhealthyCount = components.filter(c => c.status === 'unhealthy').length;
        return {
            memoryUsage: 0, // Would be calculated from actual metrics
            errorRate: ((criticalCount + unhealthyCount) / components.length) * 100,
            responseTime: 0, // Would be calculated from actual metrics
            uptime: 100, // Would be calculated from actual uptime
            migrationSuccess: 95 // Would be calculated from migration history
        };
    }
}
/**
 * Profile adapter factory (re-export for convenience)
 */
class ProfileAdapterFactory {
    static createForProduction() {
        return new ProfileAdapter({
            autoMigrate: false,
            backupOriginal: true,
            validateOnLoad: true,
            validateOnSave: true,
            preserveLegacy: true
        });
    }
}
// Export singleton instance
export const validationRollbackManager = new ValidationRollbackManager();
//# sourceMappingURL=validation_rollback.js.map
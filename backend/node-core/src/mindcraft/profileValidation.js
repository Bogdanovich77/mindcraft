/**
 * Profile Validation Utilities
 * Provides comprehensive validation for agent profiles
 */

/**
 * Validate profile structure and content
 * @param {Object} profile - Profile to validate
 * @returns {Object} Validation result with isValid, errors, and warnings
 */
export function validateProfile(profile) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (!profile || typeof profile !== 'object') {
        result.isValid = false;
        result.errors.push('Profile must be a valid object');
        return result;
    }

    // Validate required fields
    validateRequiredFields(profile, result);
    
    // Validate agent state if present
    if (profile.agentState) {
        validateAgentState(profile.agentState, result);
    }

    // Validate agent type
    validateAgentType(profile.agentType, result);
    
    // Validate compatibility mode
    validateCompatibilityMode(profile.compatibilityMode, result);

    // Validate model configuration
    validateModelConfig(profile, result);

    // Check for deprecated fields
    checkDeprecatedFields(profile, result);

    return result;
}

/**
 * Validate required fields
 */
function validateRequiredFields(profile, result) {
    const requiredFields = ['name', 'model', 'agentType'];
    
    for (const field of requiredFields) {
        if (!profile[field]) {
            result.isValid = false;
            result.errors.push(`Missing required field: ${field}`);
        } else if (typeof profile[field] !== 'string' || profile[field].trim() === '') {
            result.isValid = false;
            result.errors.push(`Field ${field} must be a non-empty string`);
        }
    }

    // Validate name format
    if (profile.name && !/^[a-zA-Z0-9_-]+$/.test(profile.name)) {
        result.isValid = false;
        result.errors.push('Profile name must contain only alphanumeric characters, underscores, and hyphens');
    }

    // Validate name length
    if (profile.name && (profile.name.length < 3 || profile.name.length > 50)) {
        result.isValid = false;
        result.errors.push('Profile name must be between 3 and 50 characters');
    }
}

/**
 * Validate agent state structure
 */
function validateAgentState(agentState, result) {
    if (!agentState || typeof agentState !== 'object') {
        result.isValid = false;
        result.errors.push('agentState must be a valid object');
        return;
    }

    const requiredStateFields = ['worldContext', 'personality', 'goals', 'mandate', 'conversation', 'lastAction', 'response'];
    
    for (const field of requiredStateFields) {
        if (!(field in agentState)) {
            result.isValid = false;
            result.errors.push(`Missing required agentState field: ${field}`);
        }
    }

    // Validate world context
    if (agentState.worldContext) {
        validateWorldContext(agentState.worldContext, result);
    }

    // Validate conversation state
    if (agentState.conversation) {
        validateConversationState(agentState.conversation, result);
    }

    // Validate string fields
    const stringFields = ['personality', 'goals', 'mandate', 'lastAction', 'response'];
    for (const field of stringFields) {
        if (agentState[field] && typeof agentState[field] !== 'string') {
            result.isValid = false;
            result.errors.push(`agentState.${field} must be a string`);
        }
    }

    // Check personality length
    if (agentState.personality && agentState.personality.length > 500) {
        result.warnings.push('Personality description is very long (>500 characters), consider shortening it');
    }

    // Check goals length
    if (agentState.goals && agentState.goals.length > 500) {
        result.warnings.push('Goals description is very long (>500 characters), consider shortening it');
    }
}

/**
 * Validate world context structure
 */
function validateWorldContext(worldContext, result) {
    if (!worldContext || typeof worldContext !== 'object') {
        result.isValid = false;
        result.errors.push('worldContext must be a valid object');
        return;
    }

    // Validate position
    if (worldContext.position) {
        const pos = worldContext.position;
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number') {
            result.isValid = false;
            result.errors.push('worldContext.position.x, .y, and .z must be numbers');
        }
    }

    // Validate numerical fields
    const numericFields = ['health', 'food', 'experience', 'timeOfDay', 'lightLevel'];
    for (const field of numericFields) {
        if (worldContext[field] !== undefined && typeof worldContext[field] !== 'number') {
            result.isValid = false;
            result.errors.push(`worldContext.${field} must be a number`);
        }
    }

    // Validate health and food ranges
    if (worldContext.health !== undefined && (worldContext.health < 0 || worldContext.health > 20)) {
        result.warnings.push('worldContext.health should be between 0 and 20');
    }

    if (worldContext.food !== undefined && (worldContext.food < 0 || worldContext.food > 20)) {
        result.warnings.push('worldContext.food should be between 0 and 20');
    }

    // Validate inventory
    if (worldContext.inventory && !Array.isArray(worldContext.inventory.items)) {
        result.isValid = false;
        result.errors.push('worldContext.inventory.items must be an array');
    }
}

/**
 * Validate conversation state structure
 */
function validateConversationState(conversation, result) {
    if (!conversation || typeof conversation !== 'object') {
        result.isValid = false;
        result.errors.push('conversation must be a valid object');
        return;
    }

    // Validate boolean fields
    const booleanFields = ['isRequestForHelp', 'isOfferOfAssistance'];
    for (const field of booleanFields) {
        if (conversation[field] !== undefined && typeof conversation[field] !== 'boolean') {
            result.isValid = false;
            result.errors.push(`conversation.${field} must be a boolean`);
        }
    }

    // Validate timestamp
    if (conversation.timestamp !== undefined && typeof conversation.timestamp !== 'number') {
        result.isValid = false;
        result.errors.push('conversation.timestamp must be a number');
    }

    // Validate string fields
    const stringFields = ['message', 'sender', 'targetBot'];
    for (const field of stringFields) {
        if (conversation[field] !== undefined && typeof conversation[field] !== 'string') {
            result.isValid = false;
            result.errors.push(`conversation.${field} must be a string`);
        }
    }
}

/**
 * Validate agent type
 */
function validateAgentType(agentType, result) {
    const validAgentTypes = ['langgraph_simplified', 'langgraph_v2', 'legacy'];
    
    if (!validAgentTypes.includes(agentType)) {
        result.isValid = false;
        result.errors.push(`Invalid agentType. Must be one of: ${validAgentTypes.join(', ')}`);
    }

    // Check for deprecated agent types
    const deprecatedTypes = ['cognitive', 'hybrid_v1'];
    if (deprecatedTypes.includes(agentType)) {
        result.warnings.push(`Agent type '${agentType}' is deprecated. Consider using 'langgraph_simplified'`);
    }
}

/**
 * Validate compatibility mode
 */
function validateCompatibilityMode(compatibilityMode, result) {
    if (!compatibilityMode) {
        return; // Optional field
    }

    const validModes = ['simplified_only', 'hybrid', 'legacy_only'];
    
    if (!validModes.includes(compatibilityMode)) {
        result.isValid = false;
        result.errors.push(`Invalid compatibilityMode. Must be one of: ${validModes.join(', ')}`);
    }
}

/**
 * Validate model configuration
 */
function validateModelConfig(profile, result) {
    // Validate model format
    if (profile.model && !profile.model.includes('/')) {
        result.warnings.push('Model should include provider prefix (e.g., "ollama/model-name")');
    }

    // Validate embedding model format
    if (profile.embedding && !profile.embedding.includes('/')) {
        result.warnings.push('Embedding model should include provider prefix (e.g., "ollama/embedding-model")');
    }

    // Check for common model providers
    const validProviders = ['ollama', 'openai', 'anthropic', 'google'];
    if (profile.model) {
        const provider = profile.model.split('/')[0];
        if (!validProviders.includes(provider)) {
            result.warnings.push(`Model provider '${provider}' is not in the list of common providers: ${validProviders.join(', ')}`);
        }
    }
}

/**
 * Check for deprecated fields
 */
function checkDeprecatedFields(profile, result) {
    const deprecatedFields = [
        'legacyPrompts',
        'cognitiveComponents',
        'memorySystems',
        'socialContext',
        'skillsProgression'
    ];

    for (const field of deprecatedFields) {
        if (profile[field]) {
            result.warnings.push(`Field '${field}' is deprecated in simplified architecture and may be ignored`);
        }
    }

    // Check for legacy complex structures
    if (profile.agentState && profile.agentState.hierarchicalGoals) {
        result.warnings.push('Hierarchical goals are deprecated in simplified architecture');
    }

    if (profile.agentState && profile.agentState.skillLevels) {
        result.warnings.push('Skill levels are deprecated in simplified architecture');
    }
}

/**
 * Sanitize and normalize profile data
 * @param {Object} profile - Profile to sanitize
 * @returns {Object} Sanitized profile
 */
export function sanitizeProfile(profile) {
    const sanitized = JSON.parse(JSON.stringify(profile)); // Deep clone

    // Remove deprecated fields
    const deprecatedFields = [
        'legacyPrompts',
        'cognitiveComponents',
        'memorySystems',
        'socialContext',
        'skillsProgression'
    ];

    for (const field of deprecatedFields) {
        delete sanitized[field];
    }

    // Clean up agentState
    if (sanitized.agentState) {
        delete sanitized.agentState.hierarchicalGoals;
        delete sanitized.agentState.skillLevels;
        delete sanitized.agentState.memoryBanks;
        delete sanitized.agentState.socialRelationships;
    }

    // Trim string fields
    const stringFields = ['name', 'model', 'embedding', 'agentType', 'personality', 'goals', 'mandate'];
    for (const field of stringFields) {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
            sanitized[field] = sanitized[field].trim();
        }
    }

    // Ensure agentState fields exist
    if (sanitized.agentState) {
        const defaultAgentState = {
            worldContext: {
                position: { x: 0, y: 64, z: 0 },
                health: 20,
                food: 20,
                experience: 0,
                inventory: { items: [], slots: 36, usedSlots: 0, length: 0 },
                equipment: {},
                nearbyEntities: [],
                timeOfDay: 0,
                weather: 'clear',
                dimension: 'overworld',
                biome: 'plains',
                lightLevel: 15
            },
            personality: 'friendly and helpful personality',
            goals: 'survival and exploration',
            mandate: '',
            conversation: {
                message: '',
                sender: '',
                isRequestForHelp: false,
                isOfferOfAssistance: false,
                targetBot: '',
                timestamp: 0
            },
            lastAction: '',
            response: ''
        };

        sanitized.agentState = { ...defaultAgentState, ...sanitized.agentState };
    }

    // Add metadata
    sanitized.updatedAt = new Date().toISOString();
    if (!sanitized.createdAt) {
        sanitized.createdAt = sanitized.updatedAt;
    }

    return sanitized;
}

/**
 * Validate profile for migration compatibility
 * @param {Object} profile - Profile to validate
 * @returns {Object} Migration validation result
 */
export function validateForMigration(profile) {
    const result = {
        canMigrate: true,
        migrationType: 'simplified',
        issues: [],
        recommendations: []
    };

    // Check if already simplified
    if (profile.agentType === 'langgraph_simplified' && profile.compatibilityMode === 'simplified_only') {
        result.migrationType = 'none';
        result.recommendations.push('Profile is already in simplified format');
        return result;
    }

    // Check for complex features that need migration
    if (profile.agentState) {
        if (profile.agentState.hierarchicalGoals) {
            result.issues.push('Hierarchical goals will be flattened to simple goals string');
        }

        if (profile.agentState.skillLevels) {
            result.issues.push('Skill progression system will be removed');
        }

        if (profile.agentState.memoryBanks) {
            result.issues.push('Complex memory systems will be simplified');
        }

        if (profile.agentState.socialRelationships) {
            result.issues.push('Social relationship data will be removed');
        }
    }

    // Check for legacy prompts
    if (profile.legacyPrompts) {
        result.issues.push('Legacy prompts will be preserved but not used in simplified mode');
    }

    // Check agent type
    if (profile.agentType && profile.agentType !== 'langgraph_simplified') {
        result.recommendations.push('Agent type will be changed to langgraph_simplified');
    }

    return result;
}
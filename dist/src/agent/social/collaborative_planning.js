/**
 * Collaborative Planning System for Multi-Agent Coordination
 *
 * This module provides comprehensive collaborative planning capabilities including
 * goal formation, task decomposition, resource allocation, and coordination
 * meeting facilitation.
 *
 * Key Features:
 * - Multi-agent goal formation with consensus building
 * - Task decomposition and delegation algorithms
 * - Shared resource management and allocation
 * - Coordination meeting facilitation
 * - Progress tracking and synchronization
 */
import { MessageType, MessagePriority, CoordinationStatus } from './multi_agent_coordinator';
// ============================================================================
// COLLABORATIVE PLANNING CLASS
// ============================================================================
/**
 * Collaborative Planning System
 *
 * Manages multi-agent collaborative planning including goal formation,
 * task decomposition, resource allocation, and coordination meetings.
 */
export class CollaborativePlanning {
    getRelationship;
    getMentalState;
    sendMessage;
    agentId;
    activeGoals;
    taskDecompositions;
    collaborativeTasks;
    resourceAllocations;
    coordinationMeetings;
    goalTemplates;
    metrics;
    constructor(agentId, getRelationship, getMentalState, sendMessage) {
        this.getRelationship = getRelationship;
        this.getMentalState = getMentalState;
        this.sendMessage = sendMessage;
        this.agentId = agentId;
        this.activeGoals = new Map();
        this.taskDecompositions = new Map();
        this.collaborativeTasks = new Map();
        this.resourceAllocations = new Map();
        this.coordinationMeetings = new Map();
        this.goalTemplates = new Map();
        this.metrics = this.initializeMetrics(agentId);
        this.initializeGoalTemplates();
    }
    // ============================================================================
    // GOAL FORMATION
    // ============================================================================
    /**
     * Propose collaborative goal to other agents
     */
    async proposeCollaborativeGoal(templateId, customizations) {
        try {
            const template = this.goalTemplates.get(templateId);
            if (!template) {
                console.warn(`[COLLABORATIVE_PLANNING] Goal template ${templateId} not found`);
                return null;
            }
            // Create collaboration request from template
            const collaboration = {
                id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: template.category,
                title: template.name,
                description: template.description,
                priority: MessagePriority.MEDIUM,
                initiatorId: this.agentId,
                targetIds: [], // Will be populated with potential participants
                requirements: {
                    minParticipants: template.minParticipants,
                    maxParticipants: template.maxParticipants,
                    requiredSkills: template.requiredSkills,
                    minTrustLevel: 0.5, // Default trust threshold
                    resources: template.requiredResources
                },
                status: CoordinationStatus.PENDING,
                participants: [this.agentId],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                deadline: Date.now() + (template.estimatedDuration * 60 * 1000), // Convert to milliseconds
                ...customizations
            };
            // Store active goal
            this.activeGoals.set(collaboration.id, collaboration);
            // Identify potential participants
            const potentialParticipants = await this.identifyPotentialParticipants(collaboration);
            if (potentialParticipants.length < template.minParticipants - 1) {
                console.warn(`[COLLABORATIVE_PLANNING] Insufficient potential participants for ${template.name}`);
                collaboration.status = CoordinationStatus.FAILED;
                return null;
            }
            // Send goal proposals
            const proposalPromises = potentialParticipants.map(agentId => this.sendGoalProposal(collaboration, agentId));
            const proposalResults = await Promise.allSettled(proposalPromises);
            const acceptances = proposalResults.filter(result => result.status === 'fulfilled' && result.value).length;
            if (acceptances >= template.minParticipants - 1) {
                collaboration.status = CoordinationStatus.ACTIVE;
                collaboration.participants = [this.agentId, ...potentialParticipants.slice(0, acceptances)];
                collaboration.updatedAt = Date.now();
                // Decompose goal into tasks
                await this.decomposeGoalIntoTasks(collaboration);
                // Update metrics
                this.updateGoalMetrics(collaboration, 'initiated', true);
                console.log(`[COLLABORATIVE_PLANNING] Collaborative goal ${collaboration.id} formed with ${acceptances + 1} participants`);
                return collaboration.id;
            }
            else {
                collaboration.status = CoordinationStatus.FAILED;
                this.updateGoalMetrics(collaboration, 'initiated', false);
                return null;
            }
        }
        catch (error) {
            console.error(`[COLLABORATIVE_PLANNING] Error proposing collaborative goal:`, error);
            return null;
        }
    }
    /**
     * Decompose goal into executable tasks
     */
    async decomposeGoalIntoTasks(goal) {
        try {
            const template = this.goalTemplates.get(goal.type);
            if (!template) {
                return null;
            }
            // Generate task decomposition based on goal complexity
            const decomposition = this.generateTaskDecomposition(goal, template);
            // Store decomposition
            this.taskDecompositions.set(goal.id, decomposition);
            // Create collaborative tasks
            for (const task of decomposition.subtasks) {
                this.collaborativeTasks.set(task.id, task);
            }
            // Update metrics
            this.metrics.tasks.created += decomposition.subtasks.length;
            console.log(`[COLLABORATIVE_PLANNING] Goal ${goal.id} decomposed into ${decomposition.subtasks.length} tasks`);
            return decomposition;
        }
        catch (error) {
            console.error(`[COLLABORATIVE_PLANNING] Error decomposing goal:`, error);
            return null;
        }
    }
    /**
     * Generate task decomposition for goal
     */
    generateTaskDecomposition(goal, template) {
        const subtasks = [];
        const dependencies = new Map();
        // Generate tasks based on goal category
        switch (template.category) {
            case 'building':
                subtasks.push(this.createTask('gather_materials', goal.id, 'Gather required building materials', 1), this.createTask('prepare_site', goal.id, 'Prepare building site', 2, ['gather_materials']), this.createTask('construct_structure', goal.id, 'Construct main structure', 3, ['prepare_site']), this.createTask('finish_details', goal.id, 'Add finishing details', 4, ['construct_structure']));
                break;
            case 'resource_gathering':
                subtasks.push(this.createTask('locate_resources', goal.id, 'Locate resource deposits', 1), this.createTask('extract_resources', goal.id, 'Extract resources', 2, ['locate_resources']), this.createTask('transport_resources', goal.id, 'Transport to storage', 3, ['extract_resources']));
                break;
            case 'exploration':
                subtasks.push(this.createTask('plan_route', goal.id, 'Plan exploration route', 1), this.createTask('explore_area', goal.id, 'Explore designated area', 2, ['plan_route']), this.createTask('document_findings', goal.id, 'Document discoveries', 3, ['explore_area']));
                break;
            default:
                // Generic task decomposition
                const taskCount = Math.max(2, Math.min(5, Math.ceil(template.estimatedDuration / 30))); // 1 task per 30 minutes
                for (let i = 0; i < taskCount; i++) {
                    subtasks.push(this.createTask(`task_${i + 1}`, goal.id, `Task ${i + 1}: ${goal.description}`, i + 1));
                }
        }
        // Calculate critical path
        const criticalPath = this.calculateCriticalPath(subtasks, dependencies);
        // Calculate resource requirements
        const resourceRequirements = new Map();
        const skillRequirements = new Map();
        for (const task of subtasks) {
            for (const resource of task.requiredResources) {
                resourceRequirements.set(resource, (resourceRequirements.get(resource) || 0) + 1);
            }
            for (const skill of task.requiredSkills) {
                skillRequirements.set(skill, (skillRequirements.get(skill) || 0) + 1);
            }
        }
        return {
            originalGoal: goal.id,
            subtasks,
            dependencies,
            criticalPath,
            estimatedTotalDuration: subtasks.reduce((sum, task) => sum + task.estimatedDuration, 0),
            resourceRequirements,
            skillRequirements
        };
    }
    /**
     * Create collaborative task
     */
    createTask(id, goalId, description, priority, dependencies = []) {
        return {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            goalId,
            title: description,
            description,
            type: 'sequential',
            priority: priority,
            requiredSkills: [],
            requiredResources: [],
            estimatedDuration: 30, // 30 minutes default
            dependencies,
            status: CoordinationStatus.PENDING,
            progress: {
                percentage: 0,
                completedSteps: [],
                blockers: []
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    }
    /**
     * Calculate critical path for tasks
     */
    calculateCriticalPath(tasks, dependencies) {
        // Simple critical path calculation - longest path through dependency graph
        const visited = new Set();
        const criticalPath = [];
        const dfs = (taskId) => {
            if (visited.has(taskId))
                return 0;
            visited.add(taskId);
            const task = tasks.find(t => t.id === taskId);
            if (!task)
                return 0;
            const taskDeps = dependencies.get(taskId) || [];
            let maxDepDuration = 0;
            for (const depId of taskDeps) {
                maxDepDuration = Math.max(maxDepDuration, dfs(depId));
            }
            return task.estimatedDuration + maxDepDuration;
        };
        // Find task with maximum duration
        let maxDuration = 0;
        let criticalTaskId = '';
        for (const task of tasks) {
            const duration = dfs(task.id);
            if (duration > maxDuration) {
                maxDuration = duration;
                criticalTaskId = task.id;
            }
        }
        // Reconstruct critical path
        const reconstructPath = (taskId) => {
            if (visited.has(taskId) || !criticalPath.includes(taskId)) {
                criticalPath.unshift(taskId);
                return;
            }
            const taskDeps = dependencies.get(taskId) || [];
            for (const depId of taskDeps) {
                reconstructPath(depId);
            }
        };
        visited.clear();
        reconstructPath(criticalTaskId);
        return criticalPath;
    }
    // ============================================================================
    // TASK DELEGATION
    // ============================================================================
    /**
     * Delegate task to suitable agent
     */
    async delegateTask(taskId, preferredDelegateeId) {
        try {
            const task = this.collaborativeTasks.get(taskId);
            if (!task) {
                console.warn(`[COLLABORATIVE_PLANNING] Task ${taskId} not found`);
                return null;
            }
            // Identify suitable delegatees
            const suitableDelegatees = await this.identifySuitableDelegatees(task);
            if (suitableDelegatees.length === 0) {
                console.warn(`[COLLABORATIVE_PLANNING] No suitable delegatees found for task ${taskId}`);
                return null;
            }
            // Select delegatee
            const selectedDelegateeId = preferredDelegateeId &&
                suitableDelegatees.includes(preferredDelegateeId)
                ? preferredDelegateeId
                : suitableDelegatees[0];
            // Create task delegation
            const delegation = {
                id: `delegation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                delegatorId: this.agentId,
                delegateeId: selectedDelegateeId,
                taskId,
                title: task.title,
                description: task.description,
                priority: task.priority,
                requirements: {
                    skills: task.requiredSkills,
                    resources: task.requiredResources,
                    trustLevel: 0.6,
                    timeEstimate: task.estimatedDuration
                },
                status: CoordinationStatus.PENDING,
                progress: {
                    percentage: 0,
                    completedSteps: [],
                    blockers: []
                },
                feedback: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                deadline: task.deadline
            };
            // Send delegation request
            if (this.sendMessage) {
                const accepted = await this.sendMessage(selectedDelegateeId, MessageType.TASK_DELEGATION, delegation, task.priority);
                if (accepted) {
                    task.assigneeId = selectedDelegateeId;
                    task.status = CoordinationStatus.ACTIVE;
                    task.updatedAt = Date.now();
                    // Update metrics
                    this.updateTaskMetrics(task, 'assigned', true);
                    console.log(`[COLLABORATIVE_PLANNING] Task ${taskId} delegated to ${selectedDelegateeId}`);
                    return delegation.id;
                }
                else {
                    this.updateTaskMetrics(task, 'assigned', false);
                    return null;
                }
            }
            return delegation.id;
        }
        catch (error) {
            console.error(`[COLLABORATIVE_PLANNING] Error delegating task:`, error);
            return null;
        }
    }
    /**
     * Identify suitable delegatees for task
     */
    async identifySuitableDelegatees(task) {
        const suitableDelegatees = [];
        // Mock list of available agents
        const availableAgents = ['agent_001', 'agent_002', 'agent_003', 'agent_004', 'agent_005'];
        for (const agentId of availableAgents) {
            if (agentId === this.agentId)
                continue;
            // Check trust level
            const trustLevel = await this.getAgentTrustLevel(agentId);
            if (trustLevel < 0.5)
                continue; // Minimum trust for delegation
            // Check skill compatibility
            const hasRequiredSkills = await this.checkSkillCompatibility(agentId, task.requiredSkills);
            if (!hasRequiredSkills)
                continue;
            // Check availability
            const isAvailable = await this.checkAgentAvailability(agentId, task.estimatedDuration);
            if (!isAvailable)
                continue;
            suitableDelegatees.push(agentId);
        }
        return suitableDelegatees;
    }
    // ============================================================================
    // RESOURCE MANAGEMENT
    // ============================================================================
    /**
     * Allocate shared resources for collaborative goal
     */
    async allocateResources(goalId, resourceRequirements) {
        try {
            const goal = this.activeGoals.get(goalId);
            if (!goal) {
                console.warn(`[COLLABORATIVE_PLANNING] Goal ${goalId} not found`);
                return false;
            }
            // Create resource allocation
            const allocation = {
                resourceId: `allocation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                resourceName: `Resources for ${goal.title}`,
                totalAmount: Array.from(resourceRequirements.values()).reduce((sum, amount) => sum + amount, 0),
                allocatedAmount: 0,
                availableAmount: Array.from(resourceRequirements.values()).reduce((sum, amount) => sum + amount, 0),
                allocations: new Map(),
                priority: goal.priority,
                allocationStrategy: 'need_based',
                lastUpdated: Date.now()
            };
            // Allocate resources to participants
            for (const participantId of goal.participants) {
                const participantShare = this.calculateResourceShare(participantId, resourceRequirements);
                allocation.allocations.set(participantId, participantShare);
                allocation.allocatedAmount += participantShare;
            }
            // Store allocation
            this.resourceAllocations.set(allocation.resourceId, allocation);
            // Update metrics
            this.updateResourceMetrics(allocation, 'allocated');
            console.log(`[COLLABORATIVE_PLANNING] Resources allocated for goal ${goalId}: ${allocation.allocatedAmount}/${allocation.totalAmount}`);
            return true;
        }
        catch (error) {
            console.error(`[COLLABORATIVE_PLANNING] Error allocating resources:`, error);
            return false;
        }
    }
    /**
     * Calculate resource share for participant
     */
    calculateResourceShare(participantId, requirements) {
        // Simple equal distribution - could be enhanced with need/skill-based allocation
        const totalRequired = Array.from(requirements.values()).reduce((sum, amount) => sum + amount, 0);
        return totalRequired / Math.max(1, requirements.size); // Divide among participants
    }
    // ============================================================================
    // COORDINATION MEETINGS
    // ============================================================================
    /**
     * Organize coordination meeting
     */
    async organizeMeeting(type, topic, agenda, requiredParticipants, deadline) {
        try {
            const meeting = {
                id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type,
                topic,
                agenda,
                participants: [this.agentId],
                requiredParticipants,
                status: CoordinationStatus.PENDING,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                decisions: [],
                actionItems: []
            };
            // Identify potential participants
            const potentialParticipants = await this.identifyPotentialParticipants(collaboration);
            if (potentialParticipants.length < requiredParticipants - 1) {
                console.warn(`[COLLABORATIVE_PLANNING] Insufficient participants for meeting on ${topic}`);
                return null;
            }
            // Send meeting invitations
            const invitationPromises = potentialParticipants.slice(0, requiredParticipants - 1).map(agentId => this.sendMeetingInvitation(meeting, agentId));
            const invitationResults = await Promise.allSettled(invitationPromises);
            const acceptances = invitationResults.filter(result => result.status === 'fulfilled' && result.value).length;
            if (acceptances >= requiredParticipants - 1) {
                meeting.status = CoordinationStatus.ACTIVE;
                meeting.participants = [this.agentId, ...potentialParticipants.slice(0, acceptances)];
                meeting.updatedAt = Date.now();
                // Store meeting
                this.coordinationMeetings.set(meeting.id, meeting);
                // Update metrics
                this.updateMeetingMetrics(meeting, 'organized', true);
                console.log(`[COLLABORATIVE_PLANNING] Meeting ${meeting.id} organized: ${acceptances + 1}/${requiredParticipants - 1} invitations accepted`);
                return meeting.id;
            }
            else {
                meeting.status = CoordinationStatus.FAILED;
                this.updateMeetingMetrics(meeting, 'organized', false);
                return null;
            }
        }
        catch (error) {
            console.error(`[COLLABORATIVE_PLANNING] Error organizing meeting:`, error);
            return null;
        }
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    /**
     * Initialize goal templates
     */
    initializeGoalTemplates() {
        const templates = [
            {
                id: 'explore_new_area',
                name: 'Explore New Area',
                description: 'Systematically explore and map an uncharted area',
                category: 'exploration',
                complexity: 'medium',
                estimatedDuration: 120, // 2 hours
                requiredSkills: ['exploration', 'navigation', 'observation'],
                requiredResources: ['torch', 'food', 'map'],
                minParticipants: 2,
                maxParticipants: 4,
                successCriteria: ['Area mapped', 'Resources documented', 'Landmarks identified'],
                riskFactors: ['Hostile mobs', 'Environmental hazards', 'Getting lost']
            },
            {
                id: 'build_shelter',
                name: 'Build Group Shelter',
                description: 'Construct a shared shelter for multiple agents',
                category: 'building',
                complexity: 'complex',
                estimatedDuration: 180, // 3 hours
                requiredSkills: ['construction', 'gathering', 'crafting'],
                requiredResources: ['wood', 'stone', 'tools'],
                minParticipants: 3,
                maxParticipants: 6,
                successCriteria: ['Shelter built', 'All agents accommodated', 'Defenses established'],
                riskFactors: ['Resource shortage', 'Structural failure', 'Weather delays']
            },
            {
                id: 'gather_resources',
                name: 'Resource Gathering Operation',
                description: 'Coordinate large-scale resource collection and storage',
                category: 'resource_gathering',
                complexity: 'simple',
                estimatedDuration: 90, // 1.5 hours
                requiredSkills: ['mining', 'logging', 'transportation'],
                requiredResources: ['tools', 'storage', 'transport'],
                minParticipants: 2,
                maxParticipants: 8,
                successCriteria: ['Target resources collected', 'Efficient storage', 'Minimal waste'],
                riskFactors: ['Depletion', 'Competition', 'Transport issues']
            }
        ];
        for (const template of templates) {
            this.goalTemplates.set(template.id, template);
        }
    }
    /**
     * Identify potential participants for collaboration
     */
    async identifyPotentialParticipants(collaboration) {
        // This would integrate with agent discovery system
        // For now, return mock list based on trust and skills
        const allAgents = ['agent_001', 'agent_002', 'agent_003', 'agent_004', 'agent_005'];
        const potentialParticipants = [];
        for (const agentId of allAgents) {
            if (agentId === this.agentId)
                continue;
            const trustLevel = await this.getAgentTrustLevel(agentId);
            if (trustLevel >= collaboration.requirements.minTrustLevel) {
                // Check skill compatibility
                const hasRequiredSkills = await this.checkSkillCompatibility(agentId, collaboration.requirements.requiredSkills);
                if (hasRequiredSkills) {
                    potentialParticipants.push(agentId);
                }
            }
        }
        return potentialParticipants;
    }
    /**
     * Send goal proposal to agent
     */
    async sendGoalProposal(collaboration, agentId) {
        if (!this.sendMessage)
            return false;
        const proposalMessage = {
            collaborationId: collaboration.id,
            type: collaboration.type,
            title: collaboration.title,
            description: collaboration.description,
            requirements: collaboration.requirements,
            deadline: collaboration.deadline
        };
        return await this.sendMessage(agentId, MessageType.COLLABORATIVE, proposalMessage, collaboration.priority);
    }
    /**
     * Get agent trust level
     */
    async getAgentTrustLevel(agentId) {
        if (!this.getRelationship)
            return 0.5; // Default trust
        const relationship = await this.getRelationship(agentId);
        return relationship?.trust.level || 0.3; // Default for unknown agents
    }
    /**
     * Check skill compatibility
     */
    async checkSkillCompatibility(agentId, requiredSkills) {
        // This would integrate with agent skill system
        // For now, assume compatibility based on trust level
        const trustLevel = await this.getAgentTrustLevel(agentId);
        return trustLevel >= 0.4 && requiredSkills.length <= 3; // Simple compatibility check
    }
    /**
     * Check agent availability
     */
    async checkAgentAvailability(agentId, duration) {
        // This would integrate with agent availability system
        // For now, assume availability
        return true;
    }
    /**
     * Send meeting invitation
     */
    async sendMeetingInvitation(meeting, agentId) {
        if (!this.sendMessage)
            return false;
        const invitationMessage = {
            meetingId: meeting.id,
            type: meeting.type,
            topic: meeting.topic,
            agenda: meeting.agenda,
            // deadline: meeting.deadline
        };
        return await this.sendMessage(agentId, MessageType.COORDINATION, invitationMessage, MessagePriority.HIGH);
    }
    /**
     * Initialize metrics
     */
    initializeMetrics(agentId) {
        return {
            agentId,
            timestamp: Date.now(),
            goals: {
                initiated: 0,
                participated: 0,
                completed: 0,
                successRate: 0,
                averageParticipants: 0
            },
            tasks: {
                created: 0,
                assigned: 0,
                completed: 0,
                averageDuration: 0,
                onTimeCompletionRate: 0
            },
            resources: {
                allocated: 0,
                utilized: 0,
                efficiency: 0,
                conflicts: 0
            },
            meetings: {
                organized: 0,
                attended: 0,
                decisions: 0,
                consensusRate: 0
            }
        };
    }
    /**
     * Update goal metrics
     */
    updateGoalMetrics(goal, action, success) {
        if (action === 'initiated') {
            this.metrics.goals.initiated++;
            if (success) {
                this.metrics.goals.completed++;
            }
        }
        else {
            this.metrics.goals.participated++;
            if (success) {
                this.metrics.goals.completed++;
            }
        }
        // Update success rate
        const totalGoals = this.metrics.goals.initiated + this.metrics.goals.participated;
        if (totalGoals > 0) {
            this.metrics.goals.successRate = this.metrics.goals.completed / totalGoals;
        }
        // Update average participants
        this.metrics.goals.averageParticipants = (this.metrics.goals.averageParticipants * (totalGoals - 1) + goal.participants.length) / totalGoals;
    }
    /**
     * Update task metrics
     */
    updateTaskMetrics(task, action, success) {
        switch (action) {
            case 'created':
                this.metrics.tasks.created++;
                break;
            case 'assigned':
                this.metrics.tasks.assigned++;
                if (success) {
                    this.metrics.tasks.completed++;
                }
                break;
            case 'completed':
                this.metrics.tasks.completed++;
                break;
        }
        // Update average duration
        if (action === 'completed' && task.progress.percentage === 1.0) {
            const totalCompleted = this.metrics.tasks.completed;
            this.metrics.tasks.averageDuration = (this.metrics.tasks.averageDuration * (totalCompleted - 1) + task.estimatedDuration) / totalCompleted;
        }
    }
    /**
     * Update resource metrics
     */
    updateResourceMetrics(allocation, action) {
        if (action === 'allocated') {
            this.metrics.resources.allocated++;
        }
        else {
            this.metrics.resources.utilized++;
        }
        // Update efficiency
        if (allocation.totalAmount > 0) {
            this.metrics.resources.efficiency = allocation.allocatedAmount / allocation.totalAmount;
        }
    }
    /**
     * Update meeting metrics
     */
    updateMeetingMetrics(meeting, action, success) {
        if (action === 'organized') {
            this.metrics.meetings.organized++;
            if (success) {
                this.metrics.meetings.decisions += meeting.decisions.length;
            }
        }
        else {
            this.metrics.meetings.attended++;
        }
        // Update consensus rate
        if (meeting.decisions.length > 0) {
            const consensusDecisions = meeting.decisions.filter(d => d.consensus).length;
            this.metrics.meetings.consensusRate = consensusDecisions / meeting.decisions.length;
        }
    }
    // ============================================================================
    // PUBLIC API
    // ============================================================================
    /**
     * Get current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get active goals
     */
    getActiveGoals() {
        return Array.from(this.activeGoals.values());
    }
    /**
     * Get task decompositions
     */
    getTaskDecompositions() {
        return Array.from(this.taskDecompositions.values());
    }
    /**
     * Get collaborative tasks
     */
    getCollaborativeTasks() {
        return Array.from(this.collaborativeTasks.values());
    }
    /**
     * Get resource allocations
     */
    getResourceAllocations() {
        return Array.from(this.resourceAllocations.values());
    }
    /**
     * Get coordination meetings
     */
    getCoordinationMeetings() {
        return Array.from(this.coordinationMeetings.values());
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = this.initializeMetrics(this.agentId);
    }
}

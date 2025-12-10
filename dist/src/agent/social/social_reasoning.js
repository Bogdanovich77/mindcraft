/**
 * Social Reasoning Engine
 *
 * This component implements higher-level social cognition including group dynamics
 * prediction, social norm understanding, and cultural context modeling. It provides
 * sophisticated social decision-making support for cognitive components.
 */
import { SituationType, SocialRole, PowerSource, PowerBalance, InfluenceType, CommunicationFlow, CommunicationStyle, LeadershipType, SubgroupRelationship, ConflictLevel, DecisionType, ParticipationLevel, NormType, HierarchyType, MobilityLevel } from './tom_types.js';
/**
 * Types of social recommendations
 */
export var RecommendationType;
(function (RecommendationType) {
    RecommendationType["SOCIAL_APPROACH"] = "social_approach";
    RecommendationType["SOCIAL_AVOID"] = "social_avoid";
    RecommendationType["COOPERATE"] = "cooperate";
    RecommendationType["COMPETE"] = "compete";
    RecommendationType["LEAD"] = "lead";
    RecommendationType["FOLLOW"] = "follow";
    RecommendationType["MEDIATE"] = "mediate";
    RecommendationType["OBSERVE"] = "observe";
    RecommendationType["COMMUNICATE"] = "communicate";
    RecommendationType["WITHDRAW"] = "withdraw";
})(RecommendationType || (RecommendationType = {}));
/**
 * Main social reasoning engine class
 */
export class SocialReasoningEngine {
    config;
    situationPatterns;
    culturalContexts;
    socialNorms;
    reasoningHistory;
    lastUpdateTime;
    constructor(config) {
        this.config = config;
        this.situationPatterns = new Map();
        this.culturalContexts = new Map();
        this.socialNorms = new Map();
        this.reasoningHistory = new Map();
        this.lastUpdateTime = Date.now();
        this.initializeSituationPatterns();
        this.initializeCulturalContexts();
        this.initializeSocialNorms();
    }
    /**
     * Initialize social situation patterns
     */
    initializeSituationPatterns() {
        // Cooperation situation
        this.situationPatterns.set(SituationType.COOPERATION, {
            situationType: SituationType.COOPERATION,
            indicators: [
                { type: 'shared_goal', weight: 0.8, threshold: 0.6 },
                { type: 'resource_sharing', weight: 0.7, threshold: 0.5 },
                { type: 'coordinated_actions', weight: 0.6, threshold: 0.5 },
                { type: 'positive_communication', weight: 0.5, threshold: 0.4 }
            ],
            contextRequirements: ['common_goal', 'mutual_benefit', 'trust'],
            typicalRoles: [SocialRole.COLLABORATOR, SocialRole.LEADER, SocialRole.EXPERT],
            commonNorms: [NormType.CONVENTION, NormType.CUSTOM],
            powerStructure: PowerBalance.BALANCED
        });
        // Competition situation
        this.situationPatterns.set(SituationType.COMPETITION, {
            situationType: SituationType.COMPETITION,
            indicators: [
                { type: 'resource_scarcity', weight: 0.8, threshold: 0.6 },
                { type: 'opposition_behavior', weight: 0.7, threshold: 0.5 },
                { type: 'competitive_communication', weight: 0.6, threshold: 0.5 },
                { type: 'goal_conflict', weight: 0.9, threshold: 0.7 }
            ],
            contextRequirements: ['limited_resources', 'opposing_goals', 'scarcity'],
            typicalRoles: [SocialRole.COMPETITOR, SocialRole.LEADER],
            commonNorms: [NormType.CONVENTION],
            powerStructure: PowerBalance.CONTESTED
        });
        // Negotiation situation
        this.situationPatterns.set(SituationType.NEGOTIATION, {
            situationType: SituationType.NEGOTIATION,
            indicators: [
                { type: 'proposal_exchange', weight: 0.8, threshold: 0.5 },
                { type: 'compromise_seeking', weight: 0.7, threshold: 0.4 },
                { type: 'formal_communication', weight: 0.6, threshold: 0.5 },
                { type: 'resource_bargaining', weight: 0.9, threshold: 0.6 }
            ],
            contextRequirements: ['resource_distribution', 'conflict_resolution', 'agreement_needed'],
            typicalRoles: [SocialRole.MEDIATOR, SocialRole.LEADER, SocialRole.COLLABORATOR],
            commonNorms: [NormType.CONVENTION, NormType.ETIQUETTE],
            powerStructure: PowerBalance.BALANCED
        });
        // Conflict situation
        this.situationPatterns.set(SituationType.CONFLICT, {
            situationType: SituationType.CONFLICT,
            indicators: [
                { type: 'aggressive_behavior', weight: 0.9, threshold: 0.6 },
                { type: 'threat_communication', weight: 0.8, threshold: 0.5 },
                { type: 'resource_competition', weight: 0.7, threshold: 0.6 },
                { type: 'hostile_actions', weight: 0.8, threshold: 0.5 }
            ],
            contextRequirements: ['threat', 'resource_conflict', 'escalation'],
            typicalRoles: [SocialRole.COMPETITOR, SocialRole.LEADER],
            commonNorms: [NormType.MORAL],
            powerStructure: PowerBalance.CONTESTED
        });
        // Social gathering situation
        this.situationPatterns.set(SituationType.SOCIAL_GATHERING, {
            situationType: SituationType.SOCIAL_GATHERING,
            indicators: [
                { type: 'informal_communication', weight: 0.7, threshold: 0.4 },
                { type: 'social_bonding', weight: 0.8, threshold: 0.5 },
                { type: 'shared_activities', weight: 0.6, threshold: 0.4 },
                { type: 'positive_emotions', weight: 0.5, threshold: 0.4 }
            ],
            contextRequirements: ['social_space', 'leisure_time', 'voluntary_participation'],
            typicalRoles: [SocialRole.COLLABORATOR, SocialRole.OBSERVER, SocialRole.EXPERT],
            commonNorms: [NormType.CUSTOM, NormType.ETIQUETTE],
            powerStructure: PowerBalance.BALANCED
        });
        // Crisis situation
        this.situationPatterns.set(SituationType.CRISIS, {
            situationType: SituationType.CRISIS,
            indicators: [
                { type: 'emergency_signals', weight: 0.9, threshold: 0.7 },
                { type: 'rapid_coordination', weight: 0.8, threshold: 0.6 },
                { type: 'survival_focus', weight: 0.9, threshold: 0.8 },
                { type: 'urgency_communication', weight: 0.7, threshold: 0.5 }
            ],
            contextRequirements: ['danger', 'time_pressure', 'survival_need'],
            typicalRoles: [SocialRole.LEADER, SocialRole.EXPERT],
            commonNorms: [NormType.MORAL],
            powerStructure: PowerBalance.DOMINATED
        });
    }
    /**
     * Initialize cultural contexts
     */
    initializeCulturalContexts() {
        // Default/Western context
        this.culturalContexts.set('western', {
            background: {
                primaryCulture: 'western',
                secondaryCultures: [],
                acculturation: 0.8,
                identityStrength: 0.7
            },
            values: [
                { name: 'individualism', importance: 0.9, expression: 'personal_achievement', conflicts: ['collectivism'] },
                { name: 'equality', importance: 0.8, expression: 'fair_treatment', conflicts: ['hierarchy'] },
                { name: 'achievement', importance: 0.7, expression: 'goal_orientation', conflicts: [] },
                { name: 'freedom', importance: 0.8, expression: 'personal_choice', conflicts: ['authority'] }
            ],
            communicationNorms: [
                {
                    context: 'formal',
                    expectedStyle: CommunicationStyle.ASSERTIVE,
                    tabooTopics: ['personal_income', 'age'],
                    preferredTopics: ['work', 'weather'],
                    directness: 0.8
                },
                {
                    context: 'informal',
                    expectedStyle: CommunicationStyle.COLLABORATIVE,
                    tabooTopics: ['politics', 'religion'],
                    preferredTopics: ['hobbies', 'family'],
                    directness: 0.6
                }
            ],
            hierarchies: [
                {
                    type: HierarchyType.EXPERTISE,
                    levels: [
                        { name: 'expert', position: 3, privileges: ['decision_making'], obligations: ['mentoring', 'quality_assurance'] },
                        { name: 'skilled', position: 2, privileges: ['consultation'], obligations: ['continuous_learning', 'skill_sharing'] },
                        { name: 'novice', position: 1, privileges: ['learning'], obligations: ['following_guidance', 'practice'] }
                    ],
                    mobility: MobilityLevel.MODERATE,
                    importance: 0.7
                }
            ]
        });
        // Collectivist context
        this.culturalContexts.set('collectivist', {
            background: {
                primaryCulture: 'collectivist',
                secondaryCultures: [],
                acculturation: 0.9,
                identityStrength: 0.8
            },
            values: [
                { name: 'collectivism', importance: 0.9, expression: 'group_harmony', conflicts: ['individualism'] },
                { name: 'respect', importance: 0.8, expression: 'deference_to_elders', conflicts: ['equality'] },
                { name: 'harmony', importance: 0.8, expression: 'conflict_avoidance', conflicts: ['competition'] },
                { name: 'tradition', importance: 0.7, expression: 'cultural_practices', conflicts: ['innovation'] }
            ],
            communicationNorms: [
                {
                    context: 'formal',
                    expectedStyle: CommunicationStyle.PASSIVE,
                    tabooTopics: ['personal_criticism', 'direct_disagreement'],
                    preferredTopics: ['group_harmony', 'tradition'],
                    directness: 0.3
                },
                {
                    context: 'informal',
                    expectedStyle: CommunicationStyle.COLLABORATIVE,
                    tabooTopics: ['personal_failure', 'family_issues'],
                    preferredTopics: ['community', 'relationships'],
                    directness: 0.5
                }
            ],
            hierarchies: [
                {
                    type: HierarchyType.AGE,
                    levels: [
                        { name: 'elder', position: 3, privileges: ['respect', 'wisdom_sharing'], obligations: ['guidance', 'tradition_preservation'] },
                        { name: 'adult', position: 2, privileges: ['responsibility'], obligations: ['provision', 'leadership'] },
                        { name: 'youth', position: 1, privileges: ['learning', 'protection'], obligations: ['respect', 'obedience'] }
                    ],
                    mobility: MobilityLevel.LOW,
                    importance: 0.9
                }
            ]
        });
    }
    /**
     * Initialize social norms
     */
    initializeSocialNorms() {
        // General social norms
        this.socialNorms.set('general', [
            {
                id: 'personal_space',
                description: 'Maintain appropriate personal distance',
                type: NormType.CONVENTION,
                importance: 0.7,
                context: 'social_interaction',
                expectedBehavior: 'maintain_2-3_meter_distance',
                violationConsequences: ['discomfort', 'social_rejection'],
                compliance: 0.8
            },
            {
                id: 'turn_taking',
                description: 'Wait for others to finish speaking',
                type: NormType.ETIQUETTE,
                importance: 0.8,
                context: 'conversation',
                expectedBehavior: 'listen_before_speaking',
                violationConsequences: ['interruption', 'rudeness_perception'],
                compliance: 0.9
            },
            {
                id: 'resource_sharing',
                description: 'Share resources when others are in need',
                type: NormType.MORAL,
                importance: 0.6,
                context: 'cooperation',
                expectedBehavior: 'offer_help_when_possible',
                violationConsequences: ['social_disapproval', 'reduced_cooperation'],
                compliance: 0.7
            },
            {
                id: 'honesty',
                description: 'Be truthful in communications',
                type: NormType.MORAL,
                importance: 0.9,
                context: 'all_interactions',
                expectedBehavior: 'tell_truth',
                violationConsequences: ['trust_loss', 'reputation_damage'],
                compliance: 0.8
            }
        ]);
        // Emergency situation norms
        this.socialNorms.set('emergency', [
            {
                id: 'help_others',
                description: 'Assist others in danger',
                type: NormType.MORAL,
                importance: 0.9,
                context: 'crisis',
                expectedBehavior: 'provide_assistance',
                violationConsequences: ['social_condemnation', 'guilt'],
                compliance: 0.7
            },
            {
                id: 'follow_authority',
                description: 'Obey emergency instructions',
                type: NormType.LEGAL,
                importance: 0.8,
                context: 'crisis',
                expectedBehavior: 'comply_with_instructions',
                violationConsequences: ['danger', 'legal_consequences'],
                compliance: 0.9
            }
        ]);
    }
    /**
     * Perform social reasoning analysis
     */
    analyzeSocialContext(input) {
        const startTime = Date.now();
        try {
            // Assess current social situation
            const situationAssessment = this.assessSocialSituation(input);
            // Analyze group dynamics
            const groupDynamics = this.analyzeGroupDynamics(input, situationAssessment);
            // Identify applicable social norms
            const socialNorms = this.identifySocialNorms(situationAssessment, input);
            // Determine cultural context
            const culturalContext = this.determineCulturalContext(input);
            // Generate social recommendations
            const recommendations = this.generateRecommendations(situationAssessment, groupDynamics, socialNorms, culturalContext, input);
            // Calculate overall confidence
            const confidence = this.calculateOverallConfidence(situationAssessment, groupDynamics, socialNorms, recommendations);
            const output = {
                situationAssessment,
                groupDynamics,
                socialNorms,
                culturalContext,
                recommendations,
                confidence,
                processingTime: Date.now() - startTime
            };
            // Store in reasoning history
            this.storeReasoningHistory(input.agentId, output);
            this.lastUpdateTime = Date.now();
            return output;
        }
        catch (error) {
            console.error('[SOCIAL_REASONING] Error analyzing social context:', error);
            // Return minimal output on error
            return {
                situationAssessment: this.createDefaultSituation(),
                groupDynamics: this.createDefaultGroupDynamics(),
                socialNorms: [],
                culturalContext: this.createDefaultCulturalContext(),
                recommendations: [],
                confidence: 0.1,
                processingTime: Date.now() - startTime
            };
        }
    }
    /**
     * Assess the current social situation
     */
    assessSocialSituation(input) {
        const situationScores = new Map();
        // Score each situation type
        for (const [situationType, pattern] of this.situationPatterns.entries()) {
            const score = this.calculateSituationScore(pattern, input);
            situationScores.set(situationType, score);
        }
        // Find the best matching situation
        let bestSituation = SituationType.SOCIAL_GATHERING; // Default
        let bestScore = 0;
        for (const [situationType, score] of situationScores.entries()) {
            if (score > bestScore) {
                bestScore = score;
                bestSituation = situationType;
            }
        }
        const pattern = this.situationPatterns.get(bestSituation);
        // Create situation assessment
        const situation = {
            type: bestSituation,
            participants: input.nearbyAgents,
            roles: this.assignSocialRoles(input.nearbyAgents, pattern, input),
            powerDynamics: this.analyzePowerDynamics(input, pattern),
            communication: this.analyzeCommunicationPattern(input),
            assessedAt: Date.now()
        };
        return situation;
    }
    /**
     * Calculate situation score based on pattern matching
     */
    calculateSituationScore(pattern, input) {
        let indicatorScore = 0;
        let contextScore = 0;
        // Calculate indicator score
        const matchingIndicators = pattern.indicators.filter(indicator => this.hasIndicator(input, indicator));
        if (pattern.indicators.length > 0) {
            indicatorScore = matchingIndicators.reduce((sum, indicator) => sum + indicator.weight, 0) /
                pattern.indicators.reduce((sum, indicator) => sum + indicator.weight, 0);
        }
        // Calculate context score
        const contextString = JSON.stringify(input).toLowerCase();
        const matchingContext = pattern.contextRequirements.filter(requirement => contextString.includes(requirement.toLowerCase()));
        if (pattern.contextRequirements.length > 0) {
            contextScore = matchingContext.length / pattern.contextRequirements.length;
        }
        // Weighted combination
        return (indicatorScore * 0.7) + (contextScore * 0.3);
    }
    /**
     * Check if input has a specific indicator
     */
    hasIndicator(input, indicator) {
        const contextString = JSON.stringify(input).toLowerCase();
        switch (indicator.type) {
            case 'shared_goal':
                return contextString.includes('goal') && contextString.includes('shared');
            case 'resource_sharing':
                return contextString.includes('share') || contextString.includes('trade');
            case 'coordinated_actions':
                return contextString.includes('coordinate') || contextString.includes('together');
            case 'positive_communication':
                return contextString.includes('help') || contextString.includes('friendly');
            case 'resource_scarcity':
                return contextString.includes('scarce') || contextString.includes('limited');
            case 'opposition_behavior':
                return contextString.includes('oppose') || contextString.includes('compete');
            case 'aggressive_behavior':
                return contextString.includes('attack') || contextString.includes('hostile');
            case 'emergency_signals':
                return contextString.includes('danger') || contextString.includes('emergency');
            default:
                return false;
        }
    }
    /**
     * Assign social roles to participants
     */
    assignSocialRoles(participants, pattern, input) {
        const roles = new Map();
        // Simple role assignment based on relationships and personality
        for (const participant of participants) {
            const relationship = input.relationships.get(participant);
            const personality = input.personality;
            let role = SocialRole.OBSERVER; // Default role
            if (relationship) {
                if (relationship.trust.level > 0.8 && relationship.friendship.level > 0.7) {
                    role = SocialRole.COLLABORATOR;
                }
                else if (relationship.collaboration.effectiveness > 0.8) {
                    role = SocialRole.COLLABORATOR;
                }
                else if (relationship.trust.level > 0.7) {
                    role = SocialRole.EXPERT;
                }
            }
            if (personality) {
                if (personality.extraversion > 0.8) {
                    role = SocialRole.COLLABORATOR;
                }
                else if (personality.conscientiousness > 0.8) {
                    role = SocialRole.EXPERT;
                }
                else if (personality.agreeableness > 0.8) {
                    role = SocialRole.COLLABORATOR;
                }
            }
            roles.set(participant, role);
        }
        return roles;
    }
    /**
     * Analyze power dynamics in the situation
     */
    analyzePowerDynamics(input, pattern) {
        const distribution = new Map();
        const sources = new Map();
        // Calculate power distribution based on relationships
        for (const participant of input.nearbyAgents) {
            const relationship = input.relationships.get(participant);
            let powerLevel = 0.5; // Base power level
            const agentSources = [];
            if (relationship) {
                // Power from trust and reputation
                if (relationship.trust.level > 0.7) {
                    powerLevel += 0.2;
                    agentSources.push(PowerSource.AUTHORITY);
                }
                // Power from collaboration effectiveness
                if (relationship.collaboration.effectiveness > 0.8) {
                    powerLevel += 0.1;
                    agentSources.push(PowerSource.EXPERTISE);
                }
                // Power from respect
                if (relationship.respect.level > 0.7) {
                    powerLevel += 0.1;
                    agentSources.push(PowerSource.CHARISMA);
                }
            }
            // Power from personality
            if (input.personality) {
                if (input.personality.extraversion > 0.7) {
                    powerLevel += 0.1;
                    agentSources.push(PowerSource.CHARISMA);
                }
                if (input.personality.conscientiousness > 0.7) {
                    powerLevel += 0.1;
                    agentSources.push(PowerSource.EXPERTISE);
                }
            }
            distribution.set(participant, Math.min(1.0, powerLevel));
            sources.set(participant, agentSources);
        }
        // Create influence network
        const connections = new Map();
        const centrality = new Map();
        for (const sourceId of input.nearbyAgents) {
            for (const targetId of input.nearbyAgents) {
                if (sourceId !== targetId) {
                    const sourceRelationship = input.relationships.get(targetId);
                    if (sourceRelationship && sourceRelationship.trust.level > 0.5) {
                        const connection = {
                            from: sourceId,
                            to: targetId,
                            strength: sourceRelationship.trust.level,
                            type: InfluenceType.PERSUASIVE,
                            duration: 0 // Ongoing
                        };
                        connections.set(`${sourceId}_${targetId}`, connection);
                    }
                }
            }
            // Calculate centrality (simple degree centrality)
            let connectionCount = 0;
            for (const [key] of connections.entries()) {
                if (key.startsWith(sourceId + '_') || key.endsWith('_' + sourceId)) {
                    connectionCount++;
                }
            }
            centrality.set(sourceId, connectionCount / Math.max(1, input.nearbyAgents.length - 1));
        }
        const influenceNetwork = {
            connections,
            centrality,
            clusters: this.identifyInfluenceClusters(input.nearbyAgents, connections)
        };
        return {
            distribution,
            sources,
            balance: pattern.powerStructure,
            influence: influenceNetwork
        };
    }
    /**
     * Identify influence clusters
     */
    identifyInfluenceClusters(participants, connections) {
        // Simple clustering based on strong connections
        const clusters = [];
        const visited = new Set();
        for (const participant of participants) {
            if (!visited.has(participant)) {
                const cluster = [participant];
                visited.add(participant);
                // Find strongly connected agents
                for (const [key, connection] of connections.entries()) {
                    if ((connection.from === participant || connection.to === participant) &&
                        connection.strength > 0.7) {
                        const other = connection.from === participant ? connection.to : connection.from;
                        if (!visited.has(other)) {
                            cluster.push(other);
                            visited.add(other);
                        }
                    }
                }
                clusters.push(cluster);
            }
        }
        return clusters;
    }
    /**
     * Analyze communication pattern
     */
    analyzeCommunicationPattern(input) {
        // Simple communication analysis based on context
        let flow = CommunicationFlow.NETWORK;
        let styles = new Map();
        let topics = {
            mainTopics: ['general'],
            importance: new Map([['general', 0.5]]),
            sentiment: new Map([['general', 0.0]]),
            transitions: []
        };
        let nonVerbalCues = [];
        // Determine communication flow based on group size
        if (input.nearbyAgents.length <= 2) {
            flow = CommunicationFlow.NETWORK;
        }
        else if (input.nearbyAgents.length <= 5) {
            flow = CommunicationFlow.CIRCULAR;
        }
        else {
            flow = CommunicationFlow.DECENTRALIZED;
        }
        // Assign communication styles based on personality
        for (const participant of input.nearbyAgents) {
            let style = CommunicationStyle.COLLABORATIVE; // Default
            const relationship = input.relationships.get(participant);
            if (relationship) {
                if (relationship.trust.level > 0.8) {
                    style = CommunicationStyle.ASSERTIVE;
                }
                else if (relationship.trust.level < 0.3) {
                    style = CommunicationStyle.PASSIVE;
                }
            }
            if (input.personality) {
                if (input.personality.extraversion > 0.7) {
                    style = CommunicationStyle.ASSERTIVE;
                }
                else if (input.personality.neuroticism > 0.7) {
                    style = CommunicationStyle.PASSIVE_AGGRESSIVE;
                }
            }
            styles.set(participant, style);
        }
        return {
            flow,
            styles,
            topics,
            nonVerbalCues
        };
    }
    /**
     * Analyze group dynamics
     */
    analyzeGroupDynamics(input, situation) {
        let cohesion = 0.5; // Default cohesion
        let leadership;
        let subgroups = [];
        let conflict = ConflictLevel.LOW;
        let decisionMaking;
        // Calculate cohesion based on relationship quality
        if (input.nearbyAgents.length > 1) {
            let totalTrust = 0;
            let totalFriendship = 0;
            let relationshipCount = 0;
            for (const participant of input.nearbyAgents) {
                const relationship = input.relationships.get(participant);
                if (relationship) {
                    totalTrust += relationship.trust.level;
                    totalFriendship += relationship.friendship.level;
                    relationshipCount++;
                }
            }
            if (relationshipCount > 0) {
                cohesion = ((totalTrust / relationshipCount) + (totalFriendship / relationshipCount)) / 2;
            }
        }
        // Identify leadership structure
        let leaders = [];
        let leadershipType = LeadershipType.EMERGENT;
        let legitimacy = 0.5;
        let effectiveness = 0.5;
        for (const [participant, role] of situation.roles.entries()) {
            if (role === SocialRole.LEADER || role === SocialRole.COLLABORATOR) {
                leaders.push(participant);
            }
        }
        if (leaders.length > 0) {
            leadershipType = LeadershipType.SHARED;
            legitimacy = 0.7;
            effectiveness = 0.6;
        }
        else if (situation.powerDynamics.balance === PowerBalance.DOMINATED) {
            leadershipType = LeadershipType.AUTOCRATIC;
            legitimacy = 0.6;
            effectiveness = 0.7;
        }
        leadership = {
            type: leadershipType,
            leaders,
            legitimacy,
            effectiveness
        };
        // Identify subgroups based on influence clusters
        const clusters = situation.powerDynamics.influence.clusters;
        for (let i = 0; i < clusters.length; i++) {
            const cluster = clusters[i];
            if (cluster.length > 1) {
                subgroups.push({
                    id: `subgroup_${i}`,
                    members: cluster,
                    cohesion: 0.7,
                    purpose: 'natural_clustering',
                    relationship: SubgroupRelationship.INTEGRATED
                });
            }
        }
        // Assess conflict level
        if (situation.type === SituationType.CONFLICT || situation.type === SituationType.COMPETITION) {
            conflict = ConflictLevel.HIGH;
        }
        else if (situation.type === SituationType.NEGOTIATION) {
            conflict = ConflictLevel.MODERATE;
        }
        // Determine decision making process
        let decisionType = DecisionType.CONSENSUS;
        let participation = ParticipationLevel.FULL;
        let consensus = cohesion;
        let efficiency = 0.5;
        if (leadership.type === LeadershipType.AUTOCRATIC) {
            decisionType = DecisionType.AUTHORITY;
            participation = ParticipationLevel.MINORITY;
            efficiency = 0.8;
        }
        else if (situation.type === SituationType.CRISIS) {
            decisionType = DecisionType.DELEGATED;
            participation = ParticipationLevel.ELITE;
            efficiency = 0.9;
        }
        decisionMaking = {
            type: decisionType,
            participation,
            consensus,
            efficiency
        };
        return {
            cohesion,
            leadership,
            subgroups,
            conflict,
            decisionMaking
        };
    }
    /**
     * Identify applicable social norms
     */
    identifySocialNorms(situation, input) {
        const applicableNorms = [];
        // Get general norms
        const generalNorms = this.socialNorms.get('general') || [];
        applicableNorms.push(...generalNorms);
        // Get situation-specific norms
        let situationKey = 'general';
        if (situation.type === SituationType.CRISIS) {
            situationKey = 'emergency';
        }
        const specificNorms = this.socialNorms.get(situationKey) || [];
        applicableNorms.push(...specificNorms);
        // Filter norms based on context relevance
        return applicableNorms.filter(norm => norm.context === 'all_interactions' ||
            norm.context === situation.type ||
            this.isContextRelevant(norm.context, input));
    }
    /**
     * Check if a norm context is relevant to the input
     */
    isContextRelevant(context, input) {
        const inputString = JSON.stringify(input).toLowerCase();
        return inputString.includes(context.toLowerCase());
    }
    /**
     * Determine cultural context
     */
    determineCulturalContext(input) {
        const culturalKey = input.culturalBackground || 'western';
        return this.culturalContexts.get(culturalKey) || this.createDefaultCulturalContext();
    }
    /**
     * Generate social recommendations
     */
    generateRecommendations(situation, groupDynamics, socialNorms, culturalContext, input) {
        const recommendations = [];
        // Generate situation-specific recommendations
        switch (situation.type) {
            case SituationType.COOPERATION:
                recommendations.push(this.createCooperationRecommendation(situation, groupDynamics));
                break;
            case SituationType.COMPETITION:
                recommendations.push(this.createCompetitionRecommendation(situation, groupDynamics));
                break;
            case SituationType.CONFLICT:
                recommendations.push(this.createConflictResolutionRecommendation(situation, groupDynamics));
                break;
            case SituationType.SOCIAL_GATHERING:
                recommendations.push(this.createSocialEngagementRecommendation(situation, groupDynamics));
                break;
            case SituationType.CRISIS:
                recommendations.push(this.createCrisisResponseRecommendation(situation, groupDynamics));
                break;
        }
        // Generate cultural recommendations
        const culturalRec = this.createCulturalRecommendation(culturalContext, situation);
        if (culturalRec) {
            recommendations.push(culturalRec);
        }
        // Generate norm compliance recommendations
        const normRec = this.createNormComplianceRecommendation(socialNorms);
        if (normRec) {
            recommendations.push(normRec);
        }
        // Sort by priority and limit
        recommendations.sort((a, b) => b.priority - a.priority);
        return recommendations.slice(0, this.config.maxRecommendations);
    }
    /**
     * Create cooperation recommendation
     */
    createCooperationRecommendation(situation, groupDynamics) {
        return {
            type: RecommendationType.COOPERATE,
            priority: 0.8,
            description: 'Actively participate in cooperative activities',
            expectedOutcome: 'Improved group cohesion and shared success',
            risks: ['Resource expenditure', 'Dependency on others'],
            confidence: groupDynamics.cohesion,
            reasoning: `Situation requires cooperation. Current cohesion level is ${groupDynamics.cohesion.toFixed(2)}`
        };
    }
    /**
     * Create competition recommendation
     */
    createCompetitionRecommendation(situation, groupDynamics) {
        return {
            type: RecommendationType.COMPETE,
            priority: 0.7,
            description: 'Compete for limited resources while maintaining social boundaries',
            expectedOutcome: 'Resource acquisition with minimal social cost',
            risks: ['Relationship strain', 'Escalation to conflict'],
            confidence: 0.6,
            reasoning: 'Competitive situation requires strategic resource acquisition'
        };
    }
    /**
     * Create conflict resolution recommendation
     */
    createConflictResolutionRecommendation(situation, groupDynamics) {
        return {
            type: RecommendationType.MEDIATE,
            priority: 0.9,
            description: 'Seek to mediate conflict and find mutually acceptable solutions',
            expectedOutcome: 'Conflict de-escalation and relationship preservation',
            risks: ['Personal involvement', 'Taking sides'],
            confidence: 0.7,
            reasoning: `Conflict level is ${groupDynamics.conflict}, requires intervention`
        };
    }
    /**
     * Create social engagement recommendation
     */
    createSocialEngagementRecommendation(situation, groupDynamics) {
        return {
            type: RecommendationType.COMMUNICATE,
            priority: 0.6,
            description: 'Engage in positive social interactions',
            expectedOutcome: 'Improved relationships and social capital',
            risks: ['Time commitment', 'Social fatigue'],
            confidence: 0.8,
            reasoning: 'Social gathering provides opportunity for relationship building'
        };
    }
    /**
     * Create crisis response recommendation
     */
    createCrisisResponseRecommendation(situation, groupDynamics) {
        return {
            type: RecommendationType.FOLLOW,
            priority: 0.95,
            description: 'Follow established leadership and emergency procedures',
            expectedOutcome: 'Survival and effective crisis management',
            risks: ['Loss of autonomy', 'Following poor leadership'],
            confidence: 0.9,
            reasoning: 'Crisis situation requires coordinated response under leadership'
        };
    }
    /**
     * Create cultural recommendation
     */
    createCulturalRecommendation(culturalContext, situation) {
        const primaryCulture = culturalContext.background.primaryCulture;
        if (primaryCulture === 'collectivist') {
            return {
                type: RecommendationType.COOPERATE,
                priority: 0.7,
                description: 'Prioritize group harmony and avoid direct confrontation',
                expectedOutcome: 'Cultural alignment and social acceptance',
                risks: ['Personal goal suppression', 'Inefficiency'],
                confidence: 0.8,
                reasoning: 'Collectivist culture values group harmony over individual expression'
            };
        }
        else if (primaryCulture === 'western') {
            return {
                type: RecommendationType.COMMUNICATE,
                priority: 0.6,
                description: 'Express individual perspectives and engage in direct communication',
                expectedOutcome: 'Cultural alignment and effective self-advocacy',
                risks: ['Social friction', 'Perceived aggression'],
                confidence: 0.7,
                reasoning: 'Western culture values individual expression and directness'
            };
        }
        return null;
    }
    /**
     * Create norm compliance recommendation
     */
    createNormComplianceRecommendation(socialNorms) {
        const importantNorms = socialNorms.filter(norm => norm.importance > 0.7);
        if (importantNorms.length > 0) {
            const topNorm = importantNorms.sort((a, b) => b.importance - a.importance)[0];
            return {
                type: RecommendationType.OBSERVE,
                priority: topNorm.importance,
                description: `Follow social norm: ${topNorm.description}`,
                expectedOutcome: 'Social acceptance and norm compliance',
                risks: ['Restriction of behavior', 'Missed opportunities'],
                confidence: 0.8,
                reasoning: `Important social norm (importance: ${topNorm.importance}) should be followed`
            };
        }
        return null;
    }
    /**
     * Calculate overall confidence
     */
    calculateOverallConfidence(situation, groupDynamics, socialNorms, recommendations) {
        let confidenceSum = 0;
        let factorCount = 0;
        // Confidence from situation assessment
        confidenceSum += 0.7; // Based on pattern matching
        factorCount++;
        // Confidence from group dynamics
        confidenceSum += groupDynamics.cohesion;
        factorCount++;
        // Confidence from norm clarity
        if (socialNorms.length > 0) {
            const avgNormImportance = socialNorms.reduce((sum, norm) => sum + norm.importance, 0) / socialNorms.length;
            confidenceSum += avgNormImportance;
            factorCount++;
        }
        // Confidence from recommendations
        if (recommendations.length > 0) {
            const avgRecConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
            confidenceSum += avgRecConfidence;
            factorCount++;
        }
        return factorCount > 0 ? confidenceSum / factorCount : 0.5;
    }
    /**
     * Store reasoning history
     */
    storeReasoningHistory(agentId, output) {
        const history = this.reasoningHistory.get(agentId) || [];
        history.push(output);
        // Trim old history based on retention period
        const cutoffTime = Date.now() - this.config.contextRetentionPeriod;
        const filteredHistory = history.filter(output => Date.now() - output.processingTime < cutoffTime);
        this.reasoningHistory.set(agentId, filteredHistory);
    }
    /**
     * Create default situation
     */
    createDefaultSituation() {
        return {
            type: SituationType.SOCIAL_GATHERING,
            participants: [],
            roles: new Map(),
            powerDynamics: {
                distribution: new Map(),
                sources: new Map(),
                balance: PowerBalance.BALANCED,
                influence: {
                    connections: new Map(),
                    centrality: new Map(),
                    clusters: []
                }
            },
            communication: {
                flow: CommunicationFlow.NETWORK,
                styles: new Map(),
                topics: {
                    mainTopics: ['general'],
                    importance: new Map([['general', 0.5]]),
                    sentiment: new Map([['general', 0.0]]),
                    transitions: []
                },
                nonVerbalCues: []
            },
            assessedAt: Date.now()
        };
    }
    /**
     * Create default group dynamics
     */
    createDefaultGroupDynamics() {
        return {
            cohesion: 0.5,
            leadership: {
                type: LeadershipType.EMERGENT,
                leaders: [],
                legitimacy: 0.5,
                effectiveness: 0.5
            },
            subgroups: [],
            conflict: ConflictLevel.LOW,
            decisionMaking: {
                type: DecisionType.CONSENSUS,
                participation: ParticipationLevel.FULL,
                consensus: 0.5,
                efficiency: 0.5
            }
        };
    }
    /**
     * Create default cultural context
     */
    createDefaultCulturalContext() {
        return this.culturalContexts.get('western');
    }
    /**
     * Get reasoning history for an agent
     */
    getReasoningHistory(agentId) {
        return this.reasoningHistory.get(agentId) || [];
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Reset all reasoning state
     */
    reset() {
        this.reasoningHistory.clear();
        this.lastUpdateTime = Date.now();
    }
}
/**
 * Social Reasoning Engine Factory
 */
export class SocialReasoningEngineFactory {
    /**
     * Create default social reasoning engine
     */
    static createDefault() {
        const config = {
            enableGroupDynamics: true,
            enableNormUnderstanding: true,
            enableCulturalContext: true,
            enablePowerAnalysis: true,
            enableCommunicationAnalysis: true,
            maxRecommendations: 5,
            confidenceThreshold: 0.5,
            updateFrequency: 2000,
            contextRetentionPeriod: 15 * 60 * 1000 // 15 minutes
        };
        return new SocialReasoningEngine(config);
    }
    /**
     * Create high-performance social reasoning engine
     */
    static createHighPerformance() {
        const config = {
            enableGroupDynamics: true,
            enableNormUnderstanding: false,
            enableCulturalContext: false,
            enablePowerAnalysis: true,
            enableCommunicationAnalysis: false,
            maxRecommendations: 3,
            confidenceThreshold: 0.7,
            updateFrequency: 1000,
            contextRetentionPeriod: 5 * 60 * 1000 // 5 minutes
        };
        return new SocialReasoningEngine(config);
    }
    /**
     * Create detailed social reasoning engine
     */
    static createDetailed() {
        const config = {
            enableGroupDynamics: true,
            enableNormUnderstanding: true,
            enableCulturalContext: true,
            enablePowerAnalysis: true,
            enableCommunicationAnalysis: true,
            maxRecommendations: 10,
            confidenceThreshold: 0.3,
            updateFrequency: 3000,
            contextRetentionPeriod: 60 * 60 * 1000 // 1 hour
        };
        return new SocialReasoningEngine(config);
    }
}

/**
 * Theory of Mind Type Definitions
 *
 * This file contains all TypeScript interfaces and type definitions
 * for the theory of mind system, including mental states, beliefs,
 * intentions, emotions, and social reasoning components.
 */
/**
 * Types of social beliefs
 */
export var SocialBeliefType;
(function (SocialBeliefType) {
    SocialBeliefType["COMPETENCE"] = "competence";
    SocialBeliefType["TRUSTWORTHINESS"] = "trustworthiness";
    SocialBeliefType["INTENTIONS"] = "intentions";
    SocialBeliefType["CAPABILITIES"] = "capabilities";
    SocialBeliefType["RELATIONSHIP"] = "relationship";
    SocialBeliefType["EMOTIONS"] = "emotions";
    SocialBeliefType["KNOWLEDGE"] = "knowledge";
    SocialBeliefType["GOALS"] = "goals";
})(SocialBeliefType || (SocialBeliefType = {}));
/**
 * Source of a belief
 */
export var BeliefSource;
(function (BeliefSource) {
    BeliefSource["DIRECT_OBSERVATION"] = "direct_observation";
    BeliefSource["COMMUNICATION"] = "communication";
    BeliefSource["INFERENCE"] = "inference";
    BeliefSource["TESTIMONY"] = "testimony";
    BeliefSource["ASSUMPTION"] = "assumption";
    BeliefSource["MEMORY"] = "memory";
})(BeliefSource || (BeliefSource = {}));
/**
 * Types of evidence
 */
export var EvidenceType;
(function (EvidenceType) {
    EvidenceType["OBSERVATION"] = "observation";
    EvidenceType["COMMUNICATION"] = "communication";
    EvidenceType["ACTION"] = "action";
    EvidenceType["OUTCOME"] = "outcome";
    EvidenceType["TESTIMONY"] = "testimony";
})(EvidenceType || (EvidenceType = {}));
/**
 * Types of belief revisions
 */
export var RevisionType;
(function (RevisionType) {
    RevisionType["STRENGTHENING"] = "strengthening";
    RevisionType["WEAKENING"] = "weakening";
    RevisionType["REJECTION"] = "rejection";
    RevisionType["REPLACEMENT"] = "replacement";
    RevisionType["ADDITION"] = "addition";
})(RevisionType || (RevisionType = {}));
/**
 * Types of intentions
 */
export var IntentionType;
(function (IntentionType) {
    IntentionType["SURVIVAL"] = "survival";
    IntentionType["RESOURCE_ACQUISITION"] = "resource_acquisition";
    IntentionType["SOCIAL_INTERACTION"] = "social_interaction";
    IntentionType["EXPLORATION"] = "exploration";
    IntentionType["CONSTRUCTION"] = "construction";
    IntentionType["COMBAT"] = "combat";
    IntentionType["ESCAPE"] = "escape";
    IntentionType["COOPERATION"] = "cooperation";
    IntentionType["COMPETITION"] = "competition";
    IntentionType["COMMUNICATION"] = "communication";
})(IntentionType || (IntentionType = {}));
/**
 * Basic emotions
 */
export var Emotion;
(function (Emotion) {
    Emotion["JOY"] = "joy";
    Emotion["SADNESS"] = "sadness";
    Emotion["ANGER"] = "anger";
    Emotion["FEAR"] = "fear";
    Emotion["SURPRISE"] = "surprise";
    Emotion["DISGUST"] = "disgust";
    Emotion["TRUST"] = "trust";
    Emotion["ANTICIPATION"] = "anticipation";
})(Emotion || (Emotion = {}));
/**
 * Types of knowledge sources
 */
export var SourceType;
(function (SourceType) {
    SourceType["DIRECT_EXPERIENCE"] = "direct_experience";
    SourceType["OBSERVATION"] = "observation";
    SourceType["COMMUNICATION"] = "communication";
    SourceType["INFERENCE"] = "inference";
    SourceType["TESTIMONY"] = "testimony";
    SourceType["DOCUMENTATION"] = "documentation";
})(SourceType || (SourceType = {}));
/**
 * Types of social situations
 */
export var SituationType;
(function (SituationType) {
    SituationType["COOPERATION"] = "cooperation";
    SituationType["COMPETITION"] = "competition";
    SituationType["NEGOTIATION"] = "negotiation";
    SituationType["CONFLICT"] = "conflict";
    SituationType["TRADING"] = "trading";
    SituationType["CELEBRATION"] = "celebration";
    SituationType["CRISIS"] = "crisis";
    SituationType["SOCIAL_GATHERING"] = "social_gathering";
    SituationType["WORK"] = "work";
    SituationType["LEISURE"] = "leisure";
})(SituationType || (SituationType = {}));
/**
 * Social roles
 */
export var SocialRole;
(function (SocialRole) {
    SocialRole["LEADER"] = "leader";
    SocialRole["FOLLOWER"] = "follower";
    SocialRole["MEDIATOR"] = "mediator";
    SocialRole["EXPERT"] = "expert";
    SocialRole["NOVICE"] = "novice";
    SocialRole["COMPETITOR"] = "competitor";
    SocialRole["COLLABORATOR"] = "collaborator";
    SocialRole["OBSERVER"] = "observer";
})(SocialRole || (SocialRole = {}));
/**
 * Sources of power
 */
export var PowerSource;
(function (PowerSource) {
    PowerSource["EXPERTISE"] = "expertise";
    PowerSource["RESOURCES"] = "resources";
    PowerSource["AUTHORITY"] = "authority";
    PowerSource["CHARISMA"] = "charisma";
    PowerSource["PHYSICAL_STRENGTH"] = "physical_strength";
    PowerSource["SOCIAL_CONNECTIONS"] = "social_connections";
    PowerSource["INFORMATION"] = "information";
})(PowerSource || (PowerSource = {}));
/**
 * Power balance assessment
 */
export var PowerBalance;
(function (PowerBalance) {
    PowerBalance["BALANCED"] = "balanced";
    PowerBalance["DOMINATED"] = "dominated";
    PowerBalance["FRAGMENTED"] = "fragmented";
    PowerBalance["CONTESTED"] = "contested";
    PowerBalance["EMERGING"] = "emerging";
})(PowerBalance || (PowerBalance = {}));
/**
 * Types of influence
 */
export var InfluenceType;
(function (InfluenceType) {
    InfluenceType["DIRECT"] = "direct";
    InfluenceType["INDIRECT"] = "indirect";
    InfluenceType["COERCIVE"] = "coercive";
    InfluenceType["PERSUASIVE"] = "persuasive";
    InfluenceType["EXPERT"] = "expert";
    InfluenceType["REFERENT"] = "referent";
})(InfluenceType || (InfluenceType = {}));
/**
 * Communication flow patterns
 */
export var CommunicationFlow;
(function (CommunicationFlow) {
    CommunicationFlow["CENTRALIZED"] = "centralized";
    CommunicationFlow["DECENTRALIZED"] = "decentralized";
    CommunicationFlow["CIRCULAR"] = "circular";
    CommunicationFlow["CHAIN"] = "chain";
    CommunicationFlow["NETWORK"] = "network";
    CommunicationFlow["DOMINATED"] = "dominated";
})(CommunicationFlow || (CommunicationFlow = {}));
/**
 * Communication styles
 */
export var CommunicationStyle;
(function (CommunicationStyle) {
    CommunicationStyle["ASSERTIVE"] = "assertive";
    CommunicationStyle["AGGRESSIVE"] = "aggressive";
    CommunicationStyle["PASSIVE"] = "passive";
    CommunicationStyle["PASSIVE_AGGRESSIVE"] = "passive_aggressive";
    CommunicationStyle["COLLABORATIVE"] = "collaborative";
    CommunicationStyle["COMPETITIVE"] = "competitive";
})(CommunicationStyle || (CommunicationStyle = {}));
/**
 * Types of non-verbal cues
 */
export var CueType;
(function (CueType) {
    CueType["GESTURE"] = "gesture";
    CueType["FACIAL_EXPRESSION"] = "facial_expression";
    CueType["POSTURE"] = "posture";
    CueType["PROXEMICS"] = "proxemics";
    CueType["EYE_CONTACT"] = "eye_contact";
    CueType["TONE_OF_VOICE"] = "tone_of_voice";
})(CueType || (CueType = {}));
/**
 * Types of leadership
 */
export var LeadershipType;
(function (LeadershipType) {
    LeadershipType["AUTOCRATIC"] = "autocratic";
    LeadershipType["DEMOCRATIC"] = "democratic";
    LeadershipType["LAISSEZ_FAIRE"] = "laissez_faire";
    LeadershipType["TRANSFORMATIONAL"] = "transformational";
    LeadershipType["SITUATIONAL"] = "situational";
    LeadershipType["SHARED"] = "shared";
    LeadershipType["EMERGENT"] = "emergent";
})(LeadershipType || (LeadershipType = {}));
/**
 * Relationship between subgroup and main group
 */
export var SubgroupRelationship;
(function (SubgroupRelationship) {
    SubgroupRelationship["INTEGRATED"] = "integrated";
    SubgroupRelationship["SEPARATE"] = "separate";
    SubgroupRelationship["OPPOSITIONAL"] = "oppositional";
    SubgroupRelationship["DOMINANT"] = "dominant";
    SubgroupRelationship["SUBORDINATE"] = "subordinate";
})(SubgroupRelationship || (SubgroupRelationship = {}));
/**
 * Conflict level assessment
 */
export var ConflictLevel;
(function (ConflictLevel) {
    ConflictLevel["NONE"] = "none";
    ConflictLevel["LOW"] = "low";
    ConflictLevel["MODERATE"] = "moderate";
    ConflictLevel["HIGH"] = "high";
    ConflictLevel["SEVERE"] = "severe";
})(ConflictLevel || (ConflictLevel = {}));
/**
 * Types of decision making
 */
export var DecisionType;
(function (DecisionType) {
    DecisionType["CONSENSUS"] = "consensus";
    DecisionType["MAJORITY_VOTE"] = "majority_vote";
    DecisionType["AUTHORITY"] = "authority";
    DecisionType["COMPROMISE"] = "compromise";
    DecisionType["UNILATERAL"] = "unilateral";
    DecisionType["DELEGATED"] = "delegated";
})(DecisionType || (DecisionType = {}));
/**
 * Participation levels
 */
export var ParticipationLevel;
(function (ParticipationLevel) {
    ParticipationLevel["FULL"] = "full";
    ParticipationLevel["MAJORITY"] = "majority";
    ParticipationLevel["MINORITY"] = "minority";
    ParticipationLevel["ELITE"] = "elite";
    ParticipationLevel["NONE"] = "none";
})(ParticipationLevel || (ParticipationLevel = {}));
/**
 * Types of social norms
 */
export var NormType;
(function (NormType) {
    NormType["CONVENTION"] = "convention";
    NormType["MORAL"] = "moral";
    NormType["LEGAL"] = "legal";
    NormType["RELIGIOUS"] = "religious";
    NormType["CUSTOM"] = "custom";
    NormType["ETIQUETTE"] = "etiquette";
})(NormType || (NormType = {}));
/**
 * Types of social hierarchies
 */
export var HierarchyType;
(function (HierarchyType) {
    HierarchyType["AGE"] = "age";
    HierarchyType["GENDER"] = "gender";
    HierarchyType["STATUS"] = "status";
    HierarchyType["EXPERTISE"] = "expertise";
    HierarchyType["WEALTH"] = "wealth";
    HierarchyType["POLITICAL"] = "political";
    HierarchyType["RELIGIOUS"] = "religious";
})(HierarchyType || (HierarchyType = {}));
/**
 * Mobility levels
 */
export var MobilityLevel;
(function (MobilityLevel) {
    MobilityLevel["HIGH"] = "high";
    MobilityLevel["MODERATE"] = "moderate";
    MobilityLevel["LOW"] = "low";
    MobilityLevel["NONE"] = "none";
})(MobilityLevel || (MobilityLevel = {}));

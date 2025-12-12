/**
 * Relationship Types and Interfaces
 *
 * Core type definitions for the social relationship system
 * Following the established patterns from cognitive components
 */
export var RelationshipStatus;
(function (RelationshipStatus) {
    RelationshipStatus["UNKNOWN"] = "unknown";
    RelationshipStatus["ACQUAINTANCE"] = "acquaintance";
    RelationshipStatus["FRIEND"] = "friend";
    RelationshipStatus["CLOSE_FRIEND"] = "close_friend";
    RelationshipStatus["RIVAL"] = "rival";
    RelationshipStatus["ENEMY"] = "enemy";
    RelationshipStatus["MENTOR"] = "mentor";
    RelationshipStatus["MENTEE"] = "mentee";
    RelationshipStatus["COLLEAGUE"] = "colleague";
    RelationshipStatus["PARTNER"] = "partner";
})(RelationshipStatus || (RelationshipStatus = {}));
export var InteractionType;
(function (InteractionType) {
    InteractionType["COLLABORATION"] = "collaboration";
    InteractionType["CONVERSATION"] = "conversation";
    InteractionType["HELP"] = "help";
    InteractionType["TRADE"] = "trade";
    InteractionType["CONFLICT"] = "conflict";
    InteractionType["SUPPORT"] = "support";
    InteractionType["COMPETITION"] = "competition";
    InteractionType["CELEBRATION"] = "celebration";
    InteractionType["EXPLORATION"] = "exploration";
})(InteractionType || (InteractionType = {}));
export var TrendDirection;
(function (TrendDirection) {
    TrendDirection["IMPROVING"] = "improving";
    TrendDirection["STABLE"] = "stable";
    TrendDirection["DECLINING"] = "declining";
    TrendDirection["VOLATILE"] = "volatile";
})(TrendDirection || (TrendDirection = {}));
export var SocialRole;
(function (SocialRole) {
    SocialRole["LEADER"] = "leader";
    SocialRole["CONNECTOR"] = "connector";
    SocialRole["SPECIALIST"] = "specialist";
    SocialRole["PERIPHERAL"] = "peripheral";
    SocialRole["ISOLATED"] = "isolated";
    SocialRole["UNKNOWN"] = "unknown";
})(SocialRole || (SocialRole = {}));
export var NodeStatus;
(function (NodeStatus) {
    NodeStatus["ACTIVE"] = "active";
    NodeStatus["INACTIVE"] = "inactive";
    NodeStatus["DORMANT"] = "dormant";
    NodeStatus["UNKNOWN"] = "unknown";
})(NodeStatus || (NodeStatus = {}));
export var EdgeType;
(function (EdgeType) {
    EdgeType["FRIENDSHIP"] = "friendship";
    EdgeType["COLLABORATION"] = "collaboration";
    EdgeType["MENTORSHIP"] = "mentorship";
    EdgeType["RIVALRY"] = "rivalry";
    EdgeType["TRADE"] = "trade";
    EdgeType["COMMUNICATION"] = "communication";
})(EdgeType || (EdgeType = {}));
export var EdgeDirectionality;
(function (EdgeDirectionality) {
    EdgeDirectionality["UNIDIRECTIONAL"] = "unidirectional";
    EdgeDirectionality["BIDIRECTIONAL"] = "bidirectional";
    EdgeDirectionality["RECIPROCAL"] = "reciprocal";
})(EdgeDirectionality || (EdgeDirectionality = {}));
export var RelationshipEventType;
(function (RelationshipEventType) {
    RelationshipEventType["FORMATION"] = "formation";
    RelationshipEventType["STRENGTHENING"] = "strengthening";
    RelationshipEventType["WEAKENING"] = "weakening";
    RelationshipEventType["CONFLICT"] = "conflict";
    RelationshipEventType["RESOLUTION"] = "resolution";
    RelationshipEventType["TRANSFORMATION"] = "transformation";
})(RelationshipEventType || (RelationshipEventType = {}));
// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================
export var CommunicationChannel;
(function (CommunicationChannel) {
    CommunicationChannel["DIRECT"] = "direct";
    CommunicationChannel["GROUP"] = "group";
    CommunicationChannel["WRITTEN"] = "written";
    CommunicationChannel["VERBAL"] = "verbal";
    CommunicationChannel["NONVERBAL"] = "nonverbal";
})(CommunicationChannel || (CommunicationChannel = {}));
//# sourceMappingURL=relationship_types.js.map
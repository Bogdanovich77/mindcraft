/**
 * TypeScript interfaces for Multi-Agent Coordination System
 *
 * This file defines all types and interfaces for agent-to-agent communication,
 * collaborative planning, conflict resolution, and coordination management.
 */
export var ChannelType;
(function (ChannelType) {
    ChannelType["DIRECT"] = "direct";
    ChannelType["BROADCAST"] = "broadcast";
    ChannelType["MULTICAST"] = "multicast";
    ChannelType["TEAM"] = "team";
    ChannelType["EMERGENCY"] = "emergency";
})(ChannelType || (ChannelType = {}));
export var ChannelState;
(function (ChannelState) {
    ChannelState["ACTIVE"] = "active";
    ChannelState["INACTIVE"] = "inactive";
    ChannelState["MUTED"] = "muted";
    ChannelState["ENCRYPTED"] = "encrypted";
})(ChannelState || (ChannelState = {}));
export var MessageType;
(function (MessageType) {
    MessageType["COORDINATION_REQUEST"] = "coordination_request";
    MessageType["COORDINATION_RESPONSE"] = "coordination_response";
    MessageType["TASK_DELEGATION"] = "task_delegation";
    MessageType["TASK_ACCEPTANCE"] = "task_acceptance";
    MessageType["TASK_COMPLETION"] = "task_completion";
    MessageType["RESOURCE_SHARING"] = "resource_sharing";
    MessageType["RESOURCE_REQUEST"] = "resource_request";
    MessageType["CONFLICT_NOTIFICATION"] = "conflict_notification";
    MessageType["NEGOTIATION_PROPOSAL"] = "negotiation_proposal";
    MessageType["NEGOTIATION_RESPONSE"] = "negotiation_response";
    MessageType["TEAM_INVITATION"] = "team_invitation";
    MessageType["TEAM_JOIN"] = "team_join";
    MessageType["TEAM_LEAVE"] = "team_leave";
    MessageType["EMERGENCY_ALERT"] = "emergency_alert";
    MessageType["STATUS_UPDATE"] = "status_update";
    MessageType["SOCIAL_INTERACTION"] = "social_interaction";
})(MessageType || (MessageType = {}));
export var MessagePriority;
(function (MessagePriority) {
    MessagePriority[MessagePriority["CRITICAL"] = 0] = "CRITICAL";
    MessagePriority[MessagePriority["HIGH"] = 1] = "HIGH";
    MessagePriority[MessagePriority["MEDIUM"] = 2] = "MEDIUM";
    MessagePriority[MessagePriority["LOW"] = 3] = "LOW";
    MessagePriority[MessagePriority["BACKGROUND"] = 4] = "BACKGROUND"; // Non-urgent updates
})(MessagePriority || (MessagePriority = {}));
export var MessageDeliveryStatus;
(function (MessageDeliveryStatus) {
    MessageDeliveryStatus["PENDING"] = "pending";
    MessageDeliveryStatus["SENT"] = "sent";
    MessageDeliveryStatus["DELIVERED"] = "delivered";
    MessageDeliveryStatus["FAILED"] = "failed";
    MessageDeliveryStatus["TIMEOUT"] = "timeout";
    MessageDeliveryStatus["REJECTED"] = "rejected";
})(MessageDeliveryStatus || (MessageDeliveryStatus = {}));
export var ReadStatus;
(function (ReadStatus) {
    ReadStatus["UNREAD"] = "unread";
    ReadStatus["READ"] = "read";
    ReadStatus["PROCESSED"] = "processed";
    ReadStatus["ARCHIVED"] = "archived";
})(ReadStatus || (ReadStatus = {}));
export var BroadcastType;
(function (BroadcastType) {
    BroadcastType["ANNOUNCEMENT"] = "announcement";
    BroadcastType["ALERT"] = "alert";
    BroadcastType["STATUS"] = "status";
    BroadcastType["INVITATION"] = "invitation";
    BroadcastType["RESOURCE_OFFER"] = "resource_offer";
    BroadcastType["TASK_BROADCAST"] = "task_broadcast";
})(BroadcastType || (BroadcastType = {}));
export var BroadcastAudience;
(function (BroadcastAudience) {
    BroadcastAudience["ALL"] = "all";
    BroadcastAudience["TEAM"] = "team";
    BroadcastAudience["NEARBY"] = "nearby";
    BroadcastAudience["ROLE_BASED"] = "role_based";
    BroadcastAudience["RELATIONSHIP_BASED"] = "relationship_based";
})(BroadcastAudience || (BroadcastAudience = {}));
export var BroadcastFrequency;
(function (BroadcastFrequency) {
    BroadcastFrequency["ONCE"] = "once";
    BroadcastFrequency["RECURRING"] = "recurring";
    BroadcastFrequency["CONDITIONAL"] = "conditional";
})(BroadcastFrequency || (BroadcastFrequency = {}));
export var BroadcastStatus;
(function (BroadcastStatus) {
    BroadcastStatus["SCHEDULED"] = "scheduled";
    BroadcastStatus["ACTIVE"] = "active";
    BroadcastStatus["PAUSED"] = "paused";
    BroadcastStatus["COMPLETED"] = "completed";
    BroadcastStatus["CANCELLED"] = "cancelled";
})(BroadcastStatus || (BroadcastStatus = {}));
export var FilterOperator;
(function (FilterOperator) {
    FilterOperator["EQUALS"] = "equals";
    FilterOperator["NOT_EQUALS"] = "not_equals";
    FilterOperator["CONTAINS"] = "contains";
    FilterOperator["NOT_CONTAINS"] = "not_contains";
    FilterOperator["GREATER_THAN"] = "greater_than";
    FilterOperator["LESS_THAN"] = "less_than";
    FilterOperator["REGEX"] = "regex";
})(FilterOperator || (FilterOperator = {}));
export var CollaborationType;
(function (CollaborationType) {
    CollaborationType["TASK_FORCE"] = "task_force";
    CollaborationType["PROJECT_TEAM"] = "project_team";
    CollaborationType["ALLIANCE"] = "alliance";
    CollaborationType["PARTNERSHIP"] = "partnership";
    CollaborationType["TEMPORARY_COALITION"] = "temporary_coalition";
    CollaborationType["EMERGENCY_RESPONSE"] = "emergency_response";
})(CollaborationType || (CollaborationType = {}));
export var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["LEADER"] = "leader";
    ParticipantRole["COORDINATOR"] = "coordinator";
    ParticipantRole["CONTRIBUTOR"] = "contributor";
    ParticipantRole["OBSERVER"] = "observer";
    ParticipantRole["SPECIALIST"] = "specialist";
    ParticipantRole["LIAISON"] = "liaison";
})(ParticipantRole || (ParticipantRole = {}));
export var ParticipantStatus;
(function (ParticipantStatus) {
    ParticipantStatus["ACTIVE"] = "active";
    ParticipantStatus["INACTIVE"] = "inactive";
    ParticipantStatus["SUSPENDED"] = "suspended";
    ParticipantStatus["LEFT"] = "left";
    ParticipantStatus["BANNED"] = "banned";
})(ParticipantStatus || (ParticipantStatus = {}));
export var CollaborativeGoalStatus;
(function (CollaborativeGoalStatus) {
    CollaborativeGoalStatus["PROPOSED"] = "proposed";
    CollaborativeGoalStatus["APPROVED"] = "approved";
    CollaborativeGoalStatus["ACTIVE"] = "active";
    CollaborativeGoalStatus["COMPLETED"] = "completed";
    CollaborativeGoalStatus["FAILED"] = "failed";
    CollaborativeGoalStatus["CANCELLED"] = "cancelled";
})(CollaborativeGoalStatus || (CollaborativeGoalStatus = {}));
export var RequirementType;
(function (RequirementType) {
    RequirementType["LABOR"] = "labor";
    RequirementType["SKILL"] = "skill";
    RequirementType["RESOURCE"] = "resource";
    RequirementType["TIME"] = "time";
    RequirementType["EQUIPMENT"] = "equipment";
    RequirementType["LOCATION"] = "location";
})(RequirementType || (RequirementType = {}));
export var AssignmentStatus;
(function (AssignmentStatus) {
    AssignmentStatus["PROPOSED"] = "proposed";
    AssignmentStatus["ACCEPTED"] = "accepted";
    AssignmentStatus["REJECTED"] = "rejected";
    AssignmentStatus["IN_PROGRESS"] = "in_progress";
    AssignmentStatus["COMPLETED"] = "completed";
    AssignmentStatus["FAILED"] = "failed";
    AssignmentStatus["CANCELLED"] = "cancelled";
})(AssignmentStatus || (AssignmentStatus = {}));
export var ResourceType;
(function (ResourceType) {
    ResourceType["ITEM"] = "item";
    ResourceType["TOOL"] = "tool";
    ResourceType["EQUIPMENT"] = "equipment";
    ResourceType["LOCATION"] = "location";
    ResourceType["INFORMATION"] = "information";
    ResourceType["SKILL"] = "skill";
    ResourceType["TIME"] = "time";
})(ResourceType || (ResourceType = {}));
export var PolicyType;
(function (PolicyType) {
    PolicyType["OPEN"] = "open";
    PolicyType["RESTRICTED"] = "restricted";
    PolicyType["EXCLUSIVE"] = "exclusive";
    PolicyType["CONDITIONAL"] = "conditional";
})(PolicyType || (PolicyType = {}));
export var AccessAction;
(function (AccessAction) {
    AccessAction["REQUESTED"] = "requested";
    AccessAction["GRANTED"] = "granted";
    AccessAction["USED"] = "used";
    AccessAction["RETURNED"] = "returned";
    AccessAction["DENIED"] = "denied";
})(AccessAction || (AccessAction = {}));
export var DecisionMakingProcess;
(function (DecisionMakingProcess) {
    DecisionMakingProcess["CONSENSUS"] = "consensus";
    DecisionMakingProcess["MAJORITY_VOTE"] = "majority_vote";
    DecisionMakingProcess["LEADER_DECIDES"] = "leader_decides";
    DecisionMakingProcess["DELEGATED"] = "delegated";
    DecisionMakingProcess["HIERARCHICAL"] = "hierarchical";
})(DecisionMakingProcess || (DecisionMakingProcess = {}));
export var VotingType;
(function (VotingType) {
    VotingType["SIMPLE"] = "simple";
    VotingType["WEIGHTED"] = "weighted";
    VotingType["APPROVAL"] = "approval";
    VotingType["RANKED_CHOICE"] = "ranked_choice";
})(VotingType || (VotingType = {}));
export var TieBreakingMethod;
(function (TieBreakingMethod) {
    TieBreakingMethod["LEADER_DECIDES"] = "leader_decides";
    TieBreakingMethod["SENIORITY_WINS"] = "seniority_wins";
    TieBreakingMethod["RANDOM"] = "random";
    TieBreakingMethod["CONTINUE_DEBATE"] = "continue_debate";
})(TieBreakingMethod || (TieBreakingMethod = {}));
export var StrategyType;
(function (StrategyType) {
    StrategyType["NEGOTIATION"] = "negotiation";
    StrategyType["MEDIATION"] = "mediation";
    StrategyType["ARBITRATION"] = "arbitration";
    StrategyType["VOTING"] = "voting";
    StrategyType["COMPETITION"] = "competition";
    StrategyType["AVOIDANCE"] = "avoidance";
})(StrategyType || (StrategyType = {}));
export var RuleType;
(function (RuleType) {
    RuleType["RESPONSE_TIME"] = "response_time";
    RuleType["MESSAGE_FORMAT"] = "message_format";
    RuleType["TOPIC_RESTRICTION"] = "topic_restriction";
    RuleType["CONFLICT_RESOLUTION"] = "conflict_resolution";
})(RuleType || (RuleType = {}));
export var CommunicationMedium;
(function (CommunicationMedium) {
    CommunicationMedium["TEXT"] = "text";
    CommunicationMedium["VOICE"] = "voice";
    CommunicationMedium["VIDEO"] = "video";
    CommunicationMedium["SHARED_WORKSPACE"] = "shared_workspace";
})(CommunicationMedium || (CommunicationMedium = {}));
export var PenaltyType;
(function (PenaltyType) {
    PenaltyType["WARNING"] = "warning";
    PenaltyType["REPUTATION"] = "reputation";
    PenaltyType["RESOURCE"] = "resource";
    PenaltyType["EXCLUSION"] = "exclusion";
})(PenaltyType || (PenaltyType = {}));
export var EnforcementLevel;
(function (EnforcementLevel) {
    EnforcementLevel["WARNING"] = "warning";
    EnforcementLevel["STRICT"] = "strict";
    EnforcementLevel["AUTOMATIC"] = "automatic";
})(EnforcementLevel || (EnforcementLevel = {}));
export var SharingScope;
(function (SharingScope) {
    SharingScope["FULL"] = "full";
    SharingScope["NEED_TO_KNOW"] = "need_to_know";
    SharingScope["ROLE_BASED"] = "role_based";
    SharingScope["TASK_SPECIFIC"] = "task_specific";
})(SharingScope || (SharingScope = {}));
export var ConfidentialityLevel;
(function (ConfidentialityLevel) {
    ConfidentialityLevel["PUBLIC"] = "public";
    ConfidentialityLevel["INTERNAL"] = "internal";
    ConfidentialityLevel["CONFIDENTIAL"] = "confidential";
    ConfidentialityLevel["SECRET"] = "secret";
})(ConfidentialityLevel || (ConfidentialityLevel = {}));
export var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "pending";
    RequestStatus["APPROVED"] = "approved";
    RequestStatus["REJECTED"] = "rejected";
    RequestStatus["FULFILLED"] = "fulfilled";
    RequestStatus["EXPIRED"] = "expired";
    RequestStatus["CANCELLED"] = "cancelled";
})(RequestStatus || (RequestStatus = {}));
export var AllocationStatus;
(function (AllocationStatus) {
    AllocationStatus["ACTIVE"] = "active";
    AllocationStatus["COMPLETED"] = "completed";
    AllocationStatus["RETURNED"] = "returned";
    AllocationStatus["OVERDUE"] = "overdue";
    AllocationStatus["REVOKED"] = "revoked";
})(AllocationStatus || (AllocationStatus = {}));
export var DelegationStatus;
(function (DelegationStatus) {
    DelegationStatus["PROPOSED"] = "proposed";
    DelegationStatus["ACCEPTED"] = "accepted";
    DelegationStatus["REJECTED"] = "rejected";
    DelegationStatus["IN_PROGRESS"] = "in_progress";
    DelegationStatus["COMPLETED"] = "completed";
    DelegationStatus["FAILED"] = "failed";
    DelegationStatus["CANCELLED"] = "cancelled";
})(DelegationStatus || (DelegationStatus = {}));
export var AccessibilityLevel;
(function (AccessibilityLevel) {
    AccessibilityLevel["PUBLIC"] = "public";
    AccessibilityLevel["SHARED"] = "shared";
    AccessibilityLevel["RESTRICTED"] = "restricted";
    AccessibilityLevel["PRIVATE"] = "private";
})(AccessibilityLevel || (AccessibilityLevel = {}));
export var SynergyType;
(function (SynergyType) {
    SynergyType["COMPLEMENTARY"] = "complementary";
    SynergyType["ENHANCING"] = "enhancing";
    SynergyType["SUBSTITUTABLE"] = "substitutable";
})(SynergyType || (SynergyType = {}));
export var BalancingAlgorithm;
(function (BalancingAlgorithm) {
    BalancingAlgorithm["ROUND_ROBIN"] = "round_robin";
    BalancingAlgorithm["CAPABILITY_BASED"] = "capability_based";
    BalancingAlgorithm["WORKLOAD_BASED"] = "workload_based";
    BalancingAlgorithm["PRIORITY_BASED"] = "priority_based";
    BalancingAlgorithm["MACHINE_LEARNING"] = "machine_learning";
})(BalancingAlgorithm || (BalancingAlgorithm = {}));
export var ThresholdAction;
(function (ThresholdAction) {
    ThresholdAction["ALERT"] = "alert";
    ThresholdAction["REDISTRIBUTE"] = "redistribute";
    ThresholdAction["SCALE_UP"] = "scale_up";
    ThresholdAction["SCALE_DOWN"] = "scale_down";
})(ThresholdAction || (ThresholdAction = {}));
export var TeamType;
(function (TeamType) {
    TeamType["TASK_FORCE"] = "task_force";
    TeamType["PROJECT_TEAM"] = "project_team";
    TeamType["DEPARTMENT"] = "department";
    TeamType["SQUAD"] = "squad";
    TeamType["COMMITTEE"] = "committee";
    TeamType["ALLIANCE"] = "alliance";
})(TeamType || (TeamType = {}));
export var TeamRole;
(function (TeamRole) {
    TeamRole["LEADER"] = "leader";
    TeamRole["COORDINATOR"] = "coordinator";
    TeamRole["SPECIALIST"] = "specialist";
    TeamRole["CONTRIBUTOR"] = "contributor";
    TeamRole["LIAISON"] = "liaison";
    TeamRole["OBSERVER"] = "observer";
})(TeamRole || (TeamRole = {}));
export var MemberStatus;
(function (MemberStatus) {
    MemberStatus["ACTIVE"] = "active";
    MemberStatus["INACTIVE"] = "inactive";
    MemberStatus["SUSPENDED"] = "suspended";
    MemberStatus["LEFT"] = "left";
    MemberStatus["BANNED"] = "banned";
})(MemberStatus || (MemberStatus = {}));
export var FlowType;
(function (FlowType) {
    FlowType["TOP_DOWN"] = "top_down";
    FlowType["BOTTOM_UP"] = "bottom_up";
    FlowType["PEER_TO_PEER"] = "peer_to_peer";
    FlowType["CROSS_FUNCTIONAL"] = "cross_functional";
})(FlowType || (FlowType = {}));
export var ObjectiveStatus;
(function (ObjectiveStatus) {
    ObjectiveStatus["PROPOSED"] = "proposed";
    ObjectiveStatus["APPROVED"] = "approved";
    ObjectiveStatus["ACTIVE"] = "active";
    ObjectiveStatus["COMPLETED"] = "completed";
    ObjectiveStatus["FAILED"] = "failed";
    ObjectiveStatus["CANCELLED"] = "cancelled";
})(ObjectiveStatus || (ObjectiveStatus = {}));
export var CollaborationOutcome;
(function (CollaborationOutcome) {
    CollaborationOutcome["SUCCESS"] = "success";
    CollaborationOutcome["PARTIAL_SUCCESS"] = "partial_success";
    CollaborationOutcome["FAILURE"] = "failure";
    CollaborationOutcome["CANCELLED"] = "cancelled";
    CollaborationOutcome["TIMEOUT"] = "timeout";
})(CollaborationOutcome || (CollaborationOutcome = {}));
export var ConflictType;
(function (ConflictType) {
    ConflictType["RESOURCE"] = "resource";
    ConflictType["GOAL"] = "goal";
    ConflictType["PRIORITY"] = "priority";
    ConflictType["COMMUNICATION"] = "communication";
    ConflictType["AUTHORITY"] = "authority";
    ConflictType["VALUES"] = "values";
    ConflictType["STRATEGY"] = "strategy";
})(ConflictType || (ConflictType = {}));
export var ConflictPosition;
(function (ConflictPosition) {
    ConflictPosition["PROPOSING"] = "proposing";
    ConflictPosition["OPPOSING"] = "opposing";
    ConflictPosition["NEUTRAL"] = "neutral";
    ConflictPosition["MEDIATING"] = "mediating";
    ConflictPosition["OBSERVING"] = "observing";
})(ConflictPosition || (ConflictPosition = {}));
export var ConflictOutcome;
(function (ConflictOutcome) {
    ConflictOutcome["WIN"] = "win";
    ConflictOutcome["LOSE"] = "lose";
    ConflictOutcome["COMPROMISE"] = "compromise";
    ConflictOutcome["MEDIATION"] = "mediation";
    ConflictOutcome["AVOIDANCE"] = "avoidance";
})(ConflictOutcome || (ConflictOutcome = {}));
export var ConflictScope;
(function (ConflictScope) {
    ConflictScope["INDIVIDUAL"] = "individual";
    ConflictScope["TEAM"] = "team";
    ConflictScope["ORGANIZATIONAL"] = "organizational";
    ConflictScope["SYSTEM_WIDE"] = "system_wide";
})(ConflictScope || (ConflictScope = {}));
export var ConflictStatus;
(function (ConflictStatus) {
    ConflictStatus["PENDING"] = "pending";
    ConflictStatus["NEGOTIATING"] = "negotiating";
    ConflictStatus["MEDIATING"] = "mediating";
    ConflictStatus["RESOLVED"] = "resolved";
    ConflictStatus["ESCALATED"] = "escalated";
    ConflictStatus["ABANDONED"] = "abandoned";
})(ConflictStatus || (ConflictStatus = {}));
export var ResolutionMethod;
(function (ResolutionMethod) {
    ResolutionMethod["NEGOTIATION"] = "negotiation";
    ResolutionMethod["MEDIATION"] = "mediation";
    ResolutionMethod["ARBITRATION"] = "arbitration";
    ResolutionMethod["VOTING"] = "voting";
    ResolutionMethod["COMPETITION"] = "competition";
    ResolutionMethod["AVOIDANCE"] = "avoidance";
    ResolutionMethod["HIERARCHICAL"] = "hierarchical";
})(ResolutionMethod || (ResolutionMethod = {}));
export var StepStatus;
(function (StepStatus) {
    StepStatus["PENDING"] = "pending";
    StepStatus["IN_PROGRESS"] = "in_progress";
    StepStatus["COMPLETED"] = "completed";
    StepStatus["FAILED"] = "failed";
    StepStatus["CANCELLED"] = "cancelled";
})(StepStatus || (StepStatus = {}));
export var VerificationMethod;
(function (VerificationMethod) {
    VerificationMethod["SELF_REPORTING"] = "self_reporting";
    VerificationMethod["PEER_REVIEW"] = "peer_review";
    VerificationMethod["THIRD_PARTY"] = "third_party";
    VerificationMethod["AUTOMATED"] = "automated";
})(VerificationMethod || (VerificationMethod = {}));
export var MilestoneStatus;
(function (MilestoneStatus) {
    MilestoneStatus["PENDING"] = "pending";
    MilestoneStatus["IN_PROGRESS"] = "in_progress";
    MilestoneStatus["COMPLETED"] = "completed";
    MilestoneStatus["OVERDUE"] = "overdue";
})(MilestoneStatus || (MilestoneStatus = {}));
export var RoundOutcome;
(function (RoundOutcome) {
    RoundOutcome["AGREEMENT"] = "agreement";
    RoundOutcome["COUNTER_OFFER"] = "counter_offer";
    RoundOutcome["REJECTION"] = "rejection";
    RoundOutcome["TIMEOUT"] = "timeout";
    RoundOutcome["WALKAWAY"] = "walkaway";
})(RoundOutcome || (RoundOutcome = {}));
export var NegotiationResult;
(function (NegotiationResult) {
    NegotiationResult["AGREEMENT"] = "agreement";
    NegotiationResult["PARTIAL_AGREEMENT"] = "partial_agreement";
    NegotiationResult["NO_AGREEMENT"] = "no_agreement";
    NegotiationResult["BREAKDOWN"] = "breakdown";
    NegotiationResult["POSTPONED"] = "postponed";
})(NegotiationResult || (NegotiationResult = {}));
export var MediationResult;
(function (MediationResult) {
    MediationResult["AGREEMENT"] = "agreement";
    MediationResult["PARTIAL_AGREEMENT"] = "partial_agreement";
    MediationResult["NO_AGREEMENT"] = "no_agreement";
    MediationResult["REFERRED"] = "referred";
    MediationResult["TERMINATED"] = "terminated";
})(MediationResult || (MediationResult = {}));
export var EnforcementMechanism;
(function (EnforcementMechanism) {
    EnforcementMechanism["SELF_POLICING"] = "self_policing";
    EnforcementMechanism["THIRD_PARTY"] = "third_party";
    EnforcementMechanism["SYSTEM_AUTOMATED"] = "system_automated";
    EnforcementMechanism["PEER_REVIEW"] = "peer_review";
})(EnforcementMechanism || (EnforcementMechanism = {}));
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["ERROR"] = "error";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
export var CoordinationEventType;
(function (CoordinationEventType) {
    CoordinationEventType["COMMUNICATION_ESTABLISHED"] = "communication_established";
    CoordinationEventType["COMMUNICATION_LOST"] = "communication_lost";
    CoordinationEventType["COLLABORATION_FORMED"] = "collaboration_formed";
    CoordinationEventType["COLLABORATION_DISSOLVED"] = "collaboration_dissolved";
    CoordinationEventType["CONFLICT_DETECTED"] = "conflict_detected";
    CoordinationEventType["CONFLICT_RESOLVED"] = "conflict_resolved";
    CoordinationEventType["NEGOTIATION_STARTED"] = "negotiation_started";
    CoordinationEventType["NEGOTIATION_ENDED"] = "negotiation_ended";
    CoordinationEventType["TEAM_FORMED"] = "team_formed";
    CoordinationEventType["TEAM_DISSOLVED"] = "team_dolved";
    CoordinationEventType["RESOURCE_ALLOCATED"] = "resource_allocated";
    CoordinationEventType["RESOURCE_DEALLOCATED"] = "resource_deallocated";
    CoordinationEventType["PERFORMANCE_DEGRADED"] = "performance_degraded";
    CoordinationEventType["PERFORMANCE_IMPROVED"] = "performance_improved";
})(CoordinationEventType || (CoordinationEventType = {}));
export var EventPriority;
(function (EventPriority) {
    EventPriority[EventPriority["LOW"] = 0] = "LOW";
    EventPriority[EventPriority["MEDIUM"] = 1] = "MEDIUM";
    EventPriority[EventPriority["HIGH"] = 2] = "HIGH";
    EventPriority[EventPriority["CRITICAL"] = 3] = "CRITICAL";
})(EventPriority || (EventPriority = {}));
export var RequestType;
(function (RequestType) {
    RequestType["COMMUNICATION_CHANNEL"] = "communication_channel";
    RequestType["COLLABORATION_INVITATION"] = "collaboration_invitation";
    RequestType["TASK_DELEGATION"] = "task_delegation";
    RequestType["RESOURCE_SHARING"] = "resource_sharing";
    RequestType["CONFLICT_RESOLUTION"] = "conflict_resolution";
    RequestType["TEAM_FORMATION"] = "team_formation";
    RequestType["INFORMATION_REQUEST"] = "information_request";
    RequestType["NEGOTIATION_INITIATION"] = "negotiation_initiation";
})(RequestType || (RequestType = {}));
export var ResponseType;
(function (ResponseType) {
    ResponseType["ACCEPTANCE"] = "acceptance";
    ResponseType["REJECTION"] = "rejection";
    ResponseType["COUNTER_OFFER"] = "counter_offer";
    ResponseType["NEGOTIATION"] = "negotiation";
    ResponseType["ALTERNATIVE"] = "alternative";
    ResponseType["DEFERRAL"] = "deferral";
    ResponseType["ESCALATION"] = "escalation";
})(ResponseType || (ResponseType = {}));
// ============================================================================
// MISSING ENUM DEFINITIONS
// ============================================================================
export var ResolutionStrategy;
(function (ResolutionStrategy) {
    ResolutionStrategy["NEGOTIATION"] = "negotiation";
    ResolutionStrategy["MEDIATION"] = "mediation";
    ResolutionStrategy["ARBITRATION"] = "arbitration";
    ResolutionStrategy["VOTING"] = "voting";
    ResolutionStrategy["COMPETITION"] = "competition";
    ResolutionStrategy["AVOIDANCE"] = "avoidance";
    ResolutionStrategy["HIERARCHICAL"] = "hierarchical";
    ResolutionStrategy["COLLABORATIVE"] = "collaborative";
})(ResolutionStrategy || (ResolutionStrategy = {}));
export var CollaborativeStatus;
(function (CollaborativeStatus) {
    CollaborativeStatus["PROPOSED"] = "proposed";
    CollaborativeStatus["FORMING"] = "forming";
    CollaborativeStatus["ACTIVE"] = "active";
    CollaborativeStatus["COORDINATING"] = "coordinating";
    CollaborativeStatus["DISSOLVING"] = "dissolving";
    CollaborativeStatus["COMPLETED"] = "completed";
    CollaborativeStatus["FAILED"] = "failed";
    CollaborativeStatus["CANCELLED"] = "cancelled";
})(CollaborativeStatus || (CollaborativeStatus = {}));
export var LeadershipStructure;
(function (LeadershipStructure) {
    LeadershipStructure["FLAT"] = "flat";
    LeadershipStructure["HIERARCHICAL"] = "hierarchical";
    LeadershipStructure["MATRIX"] = "matrix";
    LeadershipStructure["NETWORK"] = "network";
    LeadershipStructure["CIRCULAR"] = "circular";
    LeadershipStructure["HOLARCHIC"] = "holarchic";
    LeadershipStructure["AGILE"] = "agile";
})(LeadershipStructure || (LeadershipStructure = {}));
export var DelegationOutcome;
(function (DelegationOutcome) {
    DelegationOutcome["SUCCESSFUL"] = "successful";
    DelegationOutcome["FAILED"] = "failed";
    DelegationOutcome["REJECTED"] = "rejected";
    DelegationOutcome["EXPIRED"] = "expired";
    DelegationOutcome["CANCELLED"] = "cancelled";
})(DelegationOutcome || (DelegationOutcome = {}));
//# sourceMappingURL=coordination_types.js.map
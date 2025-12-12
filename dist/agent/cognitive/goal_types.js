/**
 * Goal hierarchy levels
 */
export var GoalLevel;
(function (GoalLevel) {
    GoalLevel["STRATEGIC"] = "strategic";
    GoalLevel["TACTICAL"] = "tactical";
    GoalLevel["OPERATIONAL"] = "operational"; // Short-term actionable tasks
})(GoalLevel || (GoalLevel = {}));
/**
 * Goal status tracking
 */
export var GoalStatus;
(function (GoalStatus) {
    GoalStatus["PENDING"] = "pending";
    GoalStatus["ACTIVE"] = "active";
    GoalStatus["PAUSED"] = "paused";
    GoalStatus["COMPLETED"] = "completed";
    GoalStatus["FAILED"] = "failed";
    GoalStatus["CANCELLED"] = "cancelled";
    GoalStatus["BLOCKED"] = "blocked"; // Blocked by dependencies
})(GoalStatus || (GoalStatus = {}));
/**
 * Goal priority levels
 */
export var GoalPriority;
(function (GoalPriority) {
    GoalPriority[GoalPriority["CRITICAL"] = 0] = "CRITICAL";
    GoalPriority[GoalPriority["HIGH"] = 1] = "HIGH";
    GoalPriority[GoalPriority["MEDIUM"] = 2] = "MEDIUM";
    GoalPriority[GoalPriority["LOW"] = 3] = "LOW";
    GoalPriority[GoalPriority["BACKGROUND"] = 4] = "BACKGROUND"; // Long-term background goal
})(GoalPriority || (GoalPriority = {}));
/**
 * Goal dependency types
 */
export var DependencyType;
(function (DependencyType) {
    DependencyType["PREREQUISITE"] = "prerequisite";
    DependencyType["ENABLES"] = "enables";
    DependencyType["CONFLICTS"] = "conflicts";
    DependencyType["SUPPORTS"] = "supports";
    DependencyType["REQUIRES"] = "requires"; // Requires this resource/goal
})(DependencyType || (DependencyType = {}));
//# sourceMappingURL=goal_types.js.map
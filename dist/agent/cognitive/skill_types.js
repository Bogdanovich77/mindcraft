/**
 * Skill Type Definitions and Interfaces
 *
 * Comprehensive type system for dynamic skill progression with experience tracking,
 * proficiency metrics, learning characteristics, and skill synergies.
 */
// ============================================================================
// SKILL CATEGORIES AND TYPES
// ============================================================================
export var SkillCategory;
(function (SkillCategory) {
    SkillCategory["COMBAT"] = "combat";
    SkillCategory["CRAFTING"] = "crafting";
    SkillCategory["EXPLORATION"] = "exploration";
    SkillCategory["SOCIAL"] = "social";
    SkillCategory["BUILDING"] = "building";
    SkillCategory["MINING"] = "mining";
    SkillCategory["FARMING"] = "farming";
    SkillCategory["TRADING"] = "trading";
    SkillCategory["SURVIVAL"] = "survival";
    SkillCategory["MAGIC"] = "magic";
    SkillCategory["TOOL_USE"] = "tool_use";
    SkillCategory["NAVIGATION"] = "navigation";
})(SkillCategory || (SkillCategory = {}));
export var SkillType;
(function (SkillType) {
    // Combat
    SkillType["SWORD_COMBAT"] = "sword_combat";
    SkillType["AXE_COMBAT"] = "axe_combat";
    SkillType["ARCHERY"] = "archery";
    SkillType["CROSSBOW"] = "crossbow";
    SkillType["DEFENSE"] = "defense";
    SkillType["HEAVY_ARMOR"] = "heavy_armor";
    SkillType["LIGHT_ARMOR"] = "light_armor";
    SkillType["SHIELD_USE"] = "shield_use";
    // Crafting
    SkillType["CRAFTING"] = "crafting";
    SkillType["WOODWORKING"] = "woodworking";
    SkillType["STONEWORKING"] = "stoneworking";
    SkillType["SMITHING"] = "smithing";
    SkillType["COOKING"] = "cooking";
    SkillType["ALCHEMY"] = "alchemy";
    SkillType["ENCHANTING"] = "enchanting";
    SkillType["TAILORING"] = "tailoring";
    SkillType["JEWELRY"] = "jewelry";
    // Exploration
    SkillType["MAPPING"] = "mapping";
    SkillType["NAVIGATION"] = "navigation";
    SkillType["SWIMMING"] = "swimming";
    SkillType["DIVING"] = "diving";
    SkillType["CLIMBING"] = "climbing";
    SkillType["TRACKING"] = "tracking";
    SkillType["STEALTH"] = "stealth";
    // Social
    SkillType["TRADING"] = "trading";
    SkillType["PERSUASION"] = "persuasion";
    SkillType["LEADERSHIP"] = "leadership";
    SkillType["TEAMWORK"] = "teamwork";
    SkillType["NEGOTIATION"] = "negotiation";
    SkillType["TEACHING"] = "teaching";
    // Building
    SkillType["CONSTRUCTION"] = "construction";
    SkillType["ARCHITECTURE"] = "architecture";
    SkillType["DECORATION"] = "decoration";
    SkillType["LANDSCAPING"] = "landscaping";
    SkillType["REDSTONE"] = "redstone";
    // Mining
    SkillType["MINING"] = "mining";
    SkillType["PROSPECTING"] = "prospecting";
    SkillType["EXPLOSIVES"] = "explosives";
    SkillType["CAVE_NAVIGATION"] = "cave_navigation";
    // Farming
    SkillType["FARMING"] = "farming";
    SkillType["CROP_FARMING"] = "crop_farming";
    SkillType["ANIMAL_HUSBANDRY"] = "animal_husbandry";
    SkillType["BREEDING"] = "breeding";
    SkillType["COMPOSTING"] = "composting";
    // Survival
    SkillType["FIRE_STARTING"] = "fire_starting";
    SkillType["SHELTER_BUILDING"] = "shelter_building";
    SkillType["FORAGING"] = "foraging";
    SkillType["HUNTING"] = "hunting";
    SkillType["FIRST_AID"] = "first_aid";
    // Magic
    SkillType["MAGIC"] = "magic";
    SkillType["SPELLCASTING"] = "spellcasting";
    SkillType["POTION_MAKING"] = "potion_making";
    SkillType["RITUAL_MAGIC"] = "ritual_magic";
    // Tool Use
    SkillType["PICKAXE_USE"] = "pickaxe_use";
    SkillType["SHOVEL_USE"] = "shovel_use";
    SkillType["HOE_USE"] = "hoe_use";
    SkillType["AXE_USE"] = "axe_use";
    SkillType["FISHING"] = "fishing";
    // Navigation
    SkillType["WAYFINDING"] = "wayfinding";
    SkillType["LANDMARK_RECOGNITION"] = "landmark_recognition";
    SkillType["COMPASS_USE"] = "compass_use";
})(SkillType || (SkillType = {}));
export var ExperienceSource;
(function (ExperienceSource) {
    ExperienceSource["PRACTICE"] = "practice";
    ExperienceSource["SUCCESS"] = "success";
    ExperienceSource["FAILURE"] = "failure";
    ExperienceSource["TEACHING"] = "teaching";
    ExperienceSource["OBSERVATION"] = "observation";
    ExperienceSource["EXPERIMENTATION"] = "experimentation";
    ExperienceSource["SOCIAL"] = "social";
    ExperienceSource["BREAKTHROUGH"] = "breakthrough";
})(ExperienceSource || (ExperienceSource = {}));
export var SynergyType;
(function (SynergyType) {
    SynergyType["DIRECT"] = "direct";
    SynergyType["ANALOGICAL"] = "analogical";
    SynergyType["CREATIVE"] = "creative";
    SynergyType["TOOL_BASED"] = "tool_based";
    SynergyType["KNOWLEDGE_BASED"] = "knowledge_based";
    SynergyType["MOTOR_BASED"] = "motor_based"; // Shared motor patterns
})(SynergyType || (SynergyType = {}));
export var TransferMechanism;
(function (TransferMechanism) {
    TransferMechanism["IMMEDIATE"] = "immediate";
    TransferMechanism["PRACTICE_REQUIRED"] = "practice_required";
    TransferMechanism["THRESHOLD_BASED"] = "threshold_based";
    TransferMechanism["CONTEXT_DEPENDENT"] = "context_dependent";
    TransferMechanism["CONSCIOUS_APPLICATION"] = "conscious_application"; // Requires conscious effort
})(TransferMechanism || (TransferMechanism = {}));
export var MilestoneType;
(function (MilestoneType) {
    MilestoneType["ABILITY_UNLOCK"] = "ability_unlock";
    MilestoneType["SPECIALIZATION"] = "specialization";
    MilestoneType["MASTERY"] = "mastery";
    MilestoneType["BREAKTHROUGH"] = "breakthrough";
    MilestoneType["TEACHING"] = "teaching";
    MilestoneType["INNOVATION"] = "innovation";
})(MilestoneType || (MilestoneType = {}));
export var MilestoneTier;
(function (MilestoneTier) {
    MilestoneTier["NOVICE"] = "novice";
    MilestoneTier["APPRENTICE"] = "apprentice";
    MilestoneTier["JOURNEYMAN"] = "journeyman";
    MilestoneTier["EXPERT"] = "expert";
    MilestoneTier["MASTER"] = "master";
    MilestoneTier["GRANDMASTER"] = "grandmaster";
})(MilestoneTier || (MilestoneTier = {}));
export var PlateauType;
(function (PlateauType) {
    PlateauType["KNOWLEDGE"] = "knowledge";
    PlateauType["PRACTICAL"] = "practical";
    PlateauType["CREATIVE"] = "creative";
    PlateauType["MOTIVATIONAL"] = "motivational";
    PlateauType["TECHNICAL"] = "technical";
    PlateauType["PSYCHOLOGICAL"] = "psychological"; // Psychological barrier
})(PlateauType || (PlateauType = {}));
export var PlateauSeverity;
(function (PlateauSeverity) {
    PlateauSeverity["MINOR"] = "minor";
    PlateauSeverity["MODERATE"] = "moderate";
    PlateauSeverity["MAJOR"] = "major";
    PlateauSeverity["SEVERE"] = "severe"; // Nearly complete halt
})(PlateauSeverity || (PlateauSeverity = {}));
export var PlateauCause;
(function (PlateauCause) {
    PlateauCause["OVERPRACTICE"] = "overpractice";
    PlateauCause["UNDERCHALLENGE"] = "underchallenge";
    PlateauCause["POOR_TECHNIQUE"] = "poor_technique";
    PlateauCause["LACK_OF_FOUNDATION"] = "lack_of_foundation";
    PlateauCause["MOTIVATION_LOSS"] = "motivation_loss";
    PlateauCause["BURNOUT"] = "burnout";
    PlateauCause["INEFFICIENT_METHODS"] = "inefficient_methods";
})(PlateauCause || (PlateauCause = {}));
//# sourceMappingURL=skill_types.js.map
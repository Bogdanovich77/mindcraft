/**
 * Skill Synergy System
 *
 * Manages skill interactions, transfer learning, and synergy bonuses.
 * Implements direct, analogical, and creative transfer between related skills.
 */
import { SkillType, SynergyType } from './skill_types.js';
export var SynergyStrength;
(function (SynergyStrength) {
    SynergyStrength["VERY_WEAK"] = "very_weak";
    SynergyStrength["WEAK"] = "weak";
    SynergyStrength["MODERATE"] = "moderate";
    SynergyStrength["STRONG"] = "strong";
    SynergyStrength["VERY_STRONG"] = "very_strong";
})(SynergyStrength || (SynergyStrength = {}));
export class SkillSynergySystem {
    synergies = new Map();
    relationships = [];
    transferHistory = new Map();
    constructor() {
        this.initializeSynergies();
        this.initializeRelationships();
    }
    /**
     * Initialize predefined skill synergies
     */
    initializeSynergies() {
        // Combat synergies
        this.addSynergy({
            sourceSkill: SkillType.SWORD_COMBAT,
            targetSkill: SkillType.AXE_COMBAT,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.3,
            prerequisites: { sourceLevel: 20 },
            description: 'Melee combat principles transfer between weapons'
        });
        this.addSynergy({
            sourceSkill: SkillType.ARCHERY,
            targetSkill: SkillType.CROSSBOW,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.4,
            prerequisites: { sourceLevel: 15 },
            description: 'Ranged combat skills complement each other'
        });
        this.addSynergy({
            sourceSkill: SkillType.DEFENSE,
            targetSkill: SkillType.HEAVY_ARMOR,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.MODERATE,
            bonusMultiplier: 0.25,
            prerequisites: { sourceLevel: 10 },
            description: 'Defense knowledge improves armor usage'
        });
        // Crafting synergies
        this.addSynergy({
            sourceSkill: SkillType.WOODWORKING,
            targetSkill: SkillType.CONSTRUCTION,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.35,
            prerequisites: { sourceLevel: 25 },
            description: 'Woodworking skills directly apply to construction'
        });
        this.addSynergy({
            sourceSkill: SkillType.CRAFTING,
            targetSkill: SkillType.SMITHING,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.4,
            prerequisites: { sourceLevel: 20 },
            description: 'Metal preparation enhances blacksmithing'
        });
        this.addSynergy({
            sourceSkill: SkillType.ENCHANTING,
            targetSkill: SkillType.ALCHEMY,
            synergyType: SynergyType.ANALOGICAL,
            strength: SynergyStrength.MODERATE,
            bonusMultiplier: 0.2,
            prerequisites: { sourceLevel: 15 },
            description: 'Magical crafting principles apply to alchemy'
        });
        // Exploration synergies
        this.addSynergy({
            sourceSkill: SkillType.MAPPING,
            targetSkill: SkillType.NAVIGATION,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.5,
            prerequisites: { sourceLevel: 10 },
            description: 'Map creation directly improves navigation'
        });
        this.addSynergy({
            sourceSkill: SkillType.SWIMMING,
            targetSkill: SkillType.DIVING,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.6,
            prerequisites: { sourceLevel: 20 },
            description: 'Swimming is prerequisite for diving'
        });
        this.addSynergy({
            sourceSkill: SkillType.CLIMBING,
            targetSkill: SkillType.STEALTH,
            synergyType: SynergyType.ANALOGICAL,
            strength: SynergyStrength.MODERATE,
            bonusMultiplier: 0.3,
            prerequisites: { sourceLevel: 15 },
            description: 'Climbing principles apply to stealth movement'
        });
        // Social synergies
        this.addSynergy({
            sourceSkill: SkillType.TRADING,
            targetSkill: SkillType.PERSUASION,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.MODERATE,
            bonusMultiplier: 0.3,
            prerequisites: { sourceLevel: 15 },
            description: 'Trading experience improves persuasion'
        });
        this.addSynergy({
            sourceSkill: SkillType.LEADERSHIP,
            targetSkill: SkillType.TEAMWORK,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.4,
            prerequisites: { sourceLevel: 20 },
            description: 'Leadership enhances teamwork abilities'
        });
        // Building synergies
        this.addSynergy({
            sourceSkill: SkillType.ARCHITECTURE,
            targetSkill: SkillType.CONSTRUCTION,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.5,
            prerequisites: { sourceLevel: 15 },
            description: 'Architectural knowledge improves construction'
        });
        this.addSynergy({
            sourceSkill: SkillType.ARCHITECTURE,
            targetSkill: SkillType.DECORATION,
            synergyType: SynergyType.DIRECT,
            strength: SynergyStrength.STRONG,
            bonusMultiplier: 0.4,
            prerequisites: { sourceLevel: 10 },
            description: 'Design skills enhance decoration abilities'
        });
        // Farming synergies
        this.addSynergy({
            sourceSkill: SkillType.CROP_FARMING,
            targetSkill: SkillType.ANIMAL_HUSBANDRY,
            synergyType: SynergyType.ANALOGICAL,
            strength: SynergyStrength.WEAK,
            bonusMultiplier: 0.15,
            prerequisites: { sourceLevel: 20 },
            description: 'Farming principles apply to animal care'
        });
        this.addSynergy({
            sourceSkill: SkillType.COOKING,
            targetSkill: SkillType.ALCHEMY,
            synergyType: SynergyType.ANALOGICAL,
            strength: SynergyStrength.MODERATE,
            bonusMultiplier: 0.25,
            prerequisites: { sourceLevel: 15 },
            description: 'Cooking principles apply to alchemy'
        });
    }
    /**
     * Initialize skill relationships
     */
    initializeRelationships() {
        this.relationships = [
            // Direct relationships
            { skill1: SkillType.WOODWORKING, skill2: SkillType.CONSTRUCTION, relationship: 'direct', strength: 0.8, bidirectional: true },
            { skill1: SkillType.CRAFTING, skill2: SkillType.SMITHING, relationship: 'direct', strength: 0.9, bidirectional: true },
            { skill1: SkillType.MAPPING, skill2: SkillType.NAVIGATION, relationship: 'direct', strength: 0.9, bidirectional: true },
            { skill1: SkillType.SWIMMING, skill2: SkillType.DIVING, relationship: 'direct', strength: 0.95, bidirectional: false },
            // Analogical relationships
            { skill1: SkillType.SWORD_COMBAT, skill2: SkillType.AXE_COMBAT, relationship: 'analogical', strength: 0.7, bidirectional: true },
            { skill1: SkillType.ARCHERY, skill2: SkillType.CROSSBOW, relationship: 'analogical', strength: 0.8, bidirectional: true },
            { skill1: SkillType.ENCHANTING, skill2: SkillType.ALCHEMY, relationship: 'analogical', strength: 0.6, bidirectional: true },
            { skill1: SkillType.CLIMBING, skill2: SkillType.STEALTH, relationship: 'analogical', strength: 0.7, bidirectional: true },
            // Prerequisite relationships
            { skill1: SkillType.MINING, skill2: SkillType.PROSPECTING, relationship: 'prerequisite', strength: 0.8, bidirectional: false },
            { skill1: SkillType.CRAFTING, skill2: SkillType.ENCHANTING, relationship: 'prerequisite', strength: 0.9, bidirectional: false },
            { skill1: SkillType.WOODWORKING, skill2: SkillType.CONSTRUCTION, relationship: 'prerequisite', strength: 0.85, bidirectional: false }
        ];
    }
    /**
     * Add a new skill synergy
     */
    addSynergy(synergy) {
        const key = synergy.targetSkill.toString();
        if (!this.synergies.has(key)) {
            this.synergies.set(key, []);
        }
        this.synergies.get(key).push(synergy);
    }
    /**
     * Calculate synergy bonus for a skill based on all related skills
     */
    calculateSynergyBonus(targetSkill, allSkills) {
        const synergies = this.synergies.get(targetSkill.toString()) || [];
        let totalBonus = 0;
        const contributingSkills = [];
        const bonusByType = {
            [SynergyType.DIRECT]: 0,
            [SynergyType.ANALOGICAL]: 0,
            [SynergyType.CREATIVE]: 0,
            [SynergyType.TOOL_BASED]: 0,
            [SynergyType.KNOWLEDGE_BASED]: 0,
            [SynergyType.MOTOR_BASED]: 0
        };
        synergies.forEach(synergy => {
            const sourceSkill = allSkills.get(synergy.sourceSkill);
            if (!sourceSkill)
                return;
            // Check prerequisites
            if (sourceSkill.proficiency.level < synergy.prerequisites.sourceLevel) {
                return;
            }
            // Calculate bonus based on skill level and synergy strength
            const levelRatio = sourceSkill.proficiency.level / 100;
            const strengthMultiplier = this.getStrengthMultiplier(synergy.strength);
            const bonus = synergy.bonusMultiplier * levelRatio * strengthMultiplier;
            // Apply diminishing returns for frequent transfers
            const diminishingReturns = this.calculateDiminishingReturns(synergy.sourceSkill, targetSkill);
            const finalBonus = bonus * (1 - diminishingReturns);
            bonusByType[synergy.synergyType] += finalBonus;
            totalBonus += finalBonus;
            contributingSkills.push(synergy.sourceSkill);
            // Record transfer for diminishing returns calculation
            this.recordTransfer(synergy.sourceSkill, targetSkill);
        });
        // Determine primary synergy type
        const primaryType = Object.entries(bonusByType)
            .sort(([, a], [, b]) => b - a)[0][0];
        return {
            synergyType: primaryType,
            bonusAmount: totalBonus,
            contributingSkills,
            totalBonus
        };
    }
    /**
     * Calculate transfer learning from experience event
     */
    calculateTransferLearning(event, targetSkill, allSkills) {
        const synergyBonus = this.calculateSynergyBonus(targetSkill, allSkills);
        const baseTransfer = event.amount * 0.1; // 10% base transfer rate
        // Calculate transfer efficiency based on skill similarity
        let transferEfficiency = 1.0;
        if (synergyBonus.contributingSkills.length > 0) {
            transferEfficiency = 1.0 + (synergyBonus.totalBonus * 0.5);
        }
        // Apply diminishing returns
        const diminishingReturns = this.calculateTotalDiminishingReturns(targetSkill);
        const transferredExperience = Math.floor(baseTransfer * transferEfficiency * (1 - diminishingReturns));
        return {
            transferredExperience,
            bonusMultiplier: synergyBonus.totalBonus,
            contributingSkills: synergyBonus.contributingSkills,
            transferEfficiency,
            diminishingReturns
        };
    }
    /**
     * Get all synergies for a target skill
     */
    getSynergies(targetSkill) {
        return this.synergies.get(targetSkill.toString()) || [];
    }
    /**
     * Get skill relationship between two skills
     */
    getRelationship(skill1, skill2) {
        return this.relationships.find(rel => (rel.skill1 === skill1 && rel.skill2 === skill2) ||
            (rel.bidirectional && rel.skill1 === skill2 && rel.skill2 === skill1)) || null;
    }
    /**
     * Get related skills for a given skill
     */
    getRelatedSkills(skill, maxDistance = 2) {
        const related = [];
        const visited = new Set();
        const queue = [{ skill, distance: 0 }];
        while (queue.length > 0) {
            const { skill: currentSkill, distance } = queue.shift();
            if (visited.has(currentSkill) || distance >= maxDistance) {
                continue;
            }
            visited.add(currentSkill);
            // Find direct relationships
            this.relationships.forEach(rel => {
                let nextSkill = null;
                if (rel.skill1 === currentSkill && rel.bidirectional) {
                    nextSkill = rel.skill2;
                }
                else if (rel.skill2 === currentSkill) {
                    nextSkill = rel.skill1;
                }
                if (nextSkill && !visited.has(nextSkill)) {
                    related.push(nextSkill);
                    if (distance < maxDistance - 1) {
                        queue.push({ skill: nextSkill, distance: distance + 1 });
                    }
                }
            });
        }
        return [...new Set(related)]; // Remove duplicates
    }
    /**
     * Get multiplier for synergy strength
     */
    getStrengthMultiplier(strength) {
        switch (strength) {
            case SynergyStrength.VERY_WEAK: return 0.5;
            case SynergyStrength.WEAK: return 0.7;
            case SynergyStrength.MODERATE: return 1.0;
            case SynergyStrength.STRONG: return 1.3;
            case SynergyStrength.VERY_STRONG: return 1.6;
            default: return 1.0;
        }
    }
    /**
     * Calculate diminishing returns for skill transfer
     */
    calculateDiminishingReturns(sourceSkill, targetSkill) {
        const key = `${sourceSkill}-${targetSkill}`;
        const transfers = this.transferHistory.get(key) || [];
        if (transfers.length === 0)
            return 0;
        // Calculate diminishing returns based on recent transfers
        const recentTransfers = transfers.filter(time => Date.now() - time < 24 * 60 * 60 * 1000 // Last 24 hours
        ).length;
        // Diminishing returns kick in after 5 transfers in 24 hours
        if (recentTransfers <= 5)
            return 0;
        return Math.min(0.5, (recentTransfers - 5) * 0.1);
    }
    /**
     * Calculate total diminishing returns for a target skill
     */
    calculateTotalDiminishingReturns(targetSkill) {
        const synergies = this.getSynergies(targetSkill);
        let totalReturns = 0;
        synergies.forEach(synergy => {
            totalReturns += this.calculateDiminishingReturns(synergy.sourceSkill, targetSkill);
        });
        return Math.min(0.7, totalReturns);
    }
    /**
     * Record a skill transfer for diminishing returns calculation
     */
    recordTransfer(sourceSkill, targetSkill) {
        const key = `${sourceSkill}-${targetSkill}`;
        if (!this.transferHistory.has(key)) {
            this.transferHistory.set(key, []);
        }
        const transfers = this.transferHistory.get(key);
        transfers.push(Date.now());
        // Keep only recent transfers (last 7 days)
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        this.transferHistory.set(key, transfers.filter(time => time > cutoff));
    }
    /**
     * Get synergy recommendations for skill development
     */
    getSynergyRecommendations(currentSkills, targetSkill) {
        const synergies = this.getSynergies(targetSkill);
        const recommendations = [];
        synergies.forEach(synergy => {
            const sourceSkill = currentSkills.get(synergy.sourceSkill);
            if (!sourceSkill) {
                // Skill not yet developed - recommend learning it first
                if (synergy.strength === SynergyStrength.STRONG || synergy.strength === SynergyStrength.VERY_STRONG) {
                    recommendations.push(synergy);
                }
            }
            else if (sourceSkill.proficiency.level < synergy.prerequisites.sourceLevel) {
                // Skill not high enough - recommend improving it
                recommendations.push(synergy);
            }
        });
        // Sort by potential benefit
        return recommendations.sort((a, b) => {
            const aBenefit = this.calculatePotentialBenefit(a, currentSkills);
            const bBenefit = this.calculatePotentialBenefit(b, currentSkills);
            return bBenefit - aBenefit;
        });
    }
    /**
     * Calculate potential benefit of developing a synergy
     */
    calculatePotentialBenefit(synergy, currentSkills) {
        const sourceSkill = currentSkills.get(synergy.sourceSkill);
        if (!sourceSkill)
            return synergy.bonusMultiplier * 50; // Assume level 50 potential
        const levelGap = synergy.prerequisites.sourceLevel - sourceSkill.proficiency.level;
        if (levelGap <= 0)
            return 0; // Already met requirements
        return synergy.bonusMultiplier * levelGap * this.getStrengthMultiplier(synergy.strength);
    }
    /**
     * Reset synergy system
     */
    reset() {
        this.transferHistory.clear();
    }
    /**
     * Get transfer statistics
     */
    getTransferStatistics() {
        let totalTransfers = 0;
        const transferCounts = new Map();
        let totalReturns = 0;
        let returnCount = 0;
        this.transferHistory.forEach((times, key) => {
            const [from, to] = key.split('-').map(s => s);
            totalTransfers += times.length;
            const existing = transferCounts.get(key);
            if (existing) {
                existing.count += times.length;
            }
            else {
                transferCounts.set(key, { from, to, count: times.length });
            }
            // Calculate diminishing returns for this transfer pair
            const returns = this.calculateDiminishingReturns(from, to);
            if (returns > 0) {
                totalReturns += returns;
                returnCount++;
            }
        });
        const mostTransferred = Array.from(transferCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        return {
            totalTransfers,
            mostTransferred,
            averageDiminishingReturns: returnCount > 0 ? totalReturns / returnCount : 0
        };
    }
}

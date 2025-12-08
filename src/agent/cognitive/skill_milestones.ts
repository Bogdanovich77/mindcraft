/**
 * Skill Milestones and Specialization System
 * 
 * Manages skill progression milestones, achievement tracking, and specialization
 * unlocking. Provides structured advancement paths and ability unlocks.
 */

import {
  Skill,
  SkillType,
  SkillCategory,
  SkillMilestone,
  MilestoneType,
  MilestoneTier,
  MilestoneRequirement,
  MilestoneReward,
  SkillSpecialization,
  SpecializationModifiers,
  SpecializationRequirement,
  SpecializationEffect,
  ExperienceEvent,
  SkillProgress
} from './skill_types';

export interface MilestoneProgress {
  milestoneId: string;
  skillType: SkillType;
  progress: number;              // 0-1 progress toward milestone
  requirementsProgress: Record<string, number>; // Progress for each requirement
  estimatedTimeToComplete: number; // milliseconds
  isAchieved: boolean;
  achievedAt?: number;
}

export interface SpecializationProgress {
  specializationId: string;
  baseSkill: SkillType;
  progress: number;              // 0-1 progress toward unlocking
  requirementsProgress: Record<string, number>;
  isUnlocked: boolean;
  unlockedAt?: number;
  activeEffects: string[];       // Currently active effect names
}

export interface MilestoneSystemConfig {
  // Milestone settings
  enableMilestones: boolean;
  enableSpecializations: boolean;
  autoUnlockSpecializations: boolean;
  
  // Progress tracking
  progressUpdateInterval: number;
  milestoneNotificationThreshold: number;
  
  // Specialization settings
  maxActiveSpecializations: number;
  specializationSwitchCooldown: number;
  
  // Achievement tracking
  trackMilestoneHistory: boolean;
  trackSpecializationHistory: boolean;
  celebrateAchievements: boolean;
}

export class SkillMilestoneSystem {
  private config: MilestoneSystemConfig;
  private milestones: Map<SkillType, SkillMilestone[]> = new Map();
  private specializations: Map<SkillType, SkillSpecialization[]> = new Map();
  private milestoneProgress: Map<string, MilestoneProgress> = new Map();
  private specializationProgress: Map<string, SpecializationProgress> = new Map();
  private activeSpecializations: Set<string> = new Set();
  
  constructor(config?: Partial<MilestoneSystemConfig>) {
    this.config = {
      enableMilestones: true,
      enableSpecializations: true,
      autoUnlockSpecializations: false,
      progressUpdateInterval: 1000, // 1 second
      milestoneNotificationThreshold: 0.8,
      maxActiveSpecializations: 3,
      specializationSwitchCooldown: 30 * 60 * 1000, // 30 minutes
      trackMilestoneHistory: true,
      trackSpecializationHistory: true,
      celebrateAchievements: true,
      ...config
    };
    
    this.initializeMilestones();
    this.initializeSpecializations();
  }
  
  /**
   * Initialize predefined skill milestones
   */
  private initializeMilestones(): void {
    // Combat milestones
    this.addMilestones(SkillType.SWORD_COMBAT, [
      {
        id: 'sword_novice',
        skillType: SkillType.SWORD_COMBAT,
        level: 10,
        name: 'Novice Swordsman',
        description: 'Basic sword handling and attacks',
        type: MilestoneType.ABILITY_UNLOCK,
        tier: MilestoneTier.NOVICE,
        requirements: [
          { type: 'level', target: SkillType.SWORD_COMBAT, value: 10, description: 'Reach level 10' },
          { type: 'practice', target: 'successful_attacks', value: 50, description: 'Land 50 successful attacks' }
        ],
        rewards: [
          { type: 'ability', name: 'basic_combo', value: 'combo_attack_2', description: 'Unlock 2-hit combo' }
        ],
        unlocks: ['combo_attack_2'],
        progress: 0
      },
      {
        id: 'sword_apprentice',
        skillType: SkillType.SWORD_COMBAT,
        level: 25,
        name: 'Apprentice Swordsman',
        description: 'Advanced sword techniques and timing',
        type: MilestoneType.ABILITY_UNLOCK,
        tier: MilestoneTier.APPRENTICE,
        requirements: [
          { type: 'level', target: SkillType.SWORD_COMBAT, value: 25, description: 'Reach level 25' },
          { type: 'success_rate', target: 'combat', value: 0.7, description: '70% combat success rate' }
        ],
        rewards: [
          { type: 'ability', name: 'timing_attack', value: 'perfect_timing', description: 'Unlock timing-based attacks' },
          { type: 'bonus', name: 'damage_bonus', value: 1.1, description: '10% damage bonus' }
        ],
        unlocks: ['perfect_timing', 'damage_boost_10'],
        progress: 0
      },
      {
        id: 'sword_expert',
        skillType: SkillType.SWORD_COMBAT,
        level: 50,
        name: 'Expert Swordsman',
        description: 'Mastery of sword combat techniques',
        type: MilestoneType.MASTERY,
        tier: MilestoneTier.EXPERT,
        requirements: [
          { type: 'level', target: SkillType.SWORD_COMBAT, value: 50, description: 'Reach level 50' },
          { type: 'practice', target: 'perfect_blocks', value: 100, description: 'Perfect block 100 attacks' },
          { type: 'experience', target: SkillType.SWORD_COMBAT, value: 5000, description: 'Gain 5000 experience' }
        ],
        rewards: [
          { type: 'ability', name: 'sword_mastery', value: 'sword_flurry', description: 'Unlock sword flurry attack' },
          { type: 'specialization', name: 'sword_specialization', value: 'sword_master', description: 'Unlock sword specialization' }
        ],
        unlocks: ['sword_flurry', 'sword_master_specialization'],
        progress: 0
      }
    ]);
    
    // Crafting milestones
    this.addMilestones(SkillType.CRAFTING, [
      {
        id: 'crafting_novice',
        skillType: SkillType.CRAFTING,
        level: 10,
        name: 'Novice Crafter',
        description: 'Basic crafting knowledge and recipes',
        type: MilestoneType.ABILITY_UNLOCK,
        tier: MilestoneTier.NOVICE,
        requirements: [
          { type: 'level', target: SkillType.CRAFTING, value: 10, description: 'Reach level 10' },
          { type: 'practice', target: 'items_crafted', value: 25, description: 'Craft 25 items' }
        ],
        rewards: [
          { type: 'ability', name: 'basic_recipes', value: 'tier_2_recipes', description: 'Unlock tier 2 recipes' }
        ],
        unlocks: ['tier_2_recipes'],
        progress: 0
      },
      {
        id: 'crafting_journeyman',
        skillType: SkillType.CRAFTING,
        level: 35,
        name: 'Journeyman Crafter',
        description: 'Advanced crafting techniques and efficiency',
        type: MilestoneType.SPECIALIZATION,
        tier: MilestoneTier.JOURNEYMAN,
        requirements: [
          { type: 'level', target: SkillType.CRAFTING, value: 35, description: 'Reach level 35' },
          { type: 'success_rate', target: 'crafting', value: 0.8, description: '80% crafting success rate' },
          { type: 'experience', target: SkillType.CRAFTING, value: 3000, description: 'Gain 3000 experience' }
        ],
        rewards: [
          { type: 'ability', name: 'efficiency_crafting', value: 'resource_efficiency', description: '20% resource efficiency' },
          { type: 'bonus', name: 'speed_bonus', value: 1.25, description: '25% crafting speed bonus' }
        ],
        unlocks: ['resource_efficiency', 'crafting_speed_25'],
        progress: 0
      }
    ]);
    
    // Building milestones
    this.addMilestones(SkillType.CONSTRUCTION, [
      {
        id: 'construction_apprentice',
        skillType: SkillType.CONSTRUCTION,
        level: 15,
        name: 'Apprentice Builder',
        description: 'Basic construction and structural knowledge',
        type: MilestoneType.ABILITY_UNLOCK,
        tier: MilestoneTier.APPRENTICE,
        requirements: [
          { type: 'level', target: SkillType.CONSTRUCTION, value: 15, description: 'Reach level 15' },
          { type: 'practice', target: 'structures_built', value: 10, description: 'Build 10 structures' }
        ],
        rewards: [
          { type: 'ability', name: 'structural_analysis', value: 'stability_check', description: 'Check structure stability' }
        ],
        unlocks: ['stability_check'],
        progress: 0
      },
      {
        id: 'construction_master',
        skillType: SkillType.CONSTRUCTION,
        level: 60,
        name: 'Master Builder',
        description: 'Advanced architectural knowledge and design',
        type: MilestoneType.MASTERY,
        tier: MilestoneTier.MASTER,
        requirements: [
          { type: 'level', target: SkillType.CONSTRUCTION, value: 60, description: 'Reach level 60' },
          { type: 'practice', target: 'complex_structures', value: 5, description: 'Build 5 complex structures' },
          { type: 'experience', target: SkillType.CONSTRUCTION, value: 8000, description: 'Gain 8000 experience' }
        ],
        rewards: [
          { type: 'ability', name: 'architectural_mastery', value: 'advanced_design', description: 'Advanced design techniques' },
          { type: 'title', name: 'master_builder', value: 'Master Builder', description: 'Earn Master Builder title' }
        ],
        unlocks: ['advanced_design', 'master_builder_title'],
        progress: 0
      }
    ]);
  }
  
  /**
   * Initialize predefined skill specializations
   */
  private initializeSpecializations(): void {
    // Combat specializations
    this.addSpecializations(SkillType.SWORD_COMBAT, [
      {
        id: 'sword_dueling',
        baseSkill: SkillType.SWORD_COMBAT,
        name: 'Sword Dueling',
        description: 'Specialize in one-on-one sword combat',
        focusArea: 'single_target_combat',
        modifiers: {
          skillBonus: 1.2,
          learningBonus: 1.1,
          experienceBonus: 1.15,
          synergyBonus: 1.1,
          penalties: {
            'axe_combat': 0.8,
            'archery': 0.7
          }
        },
        requirements: [
          { type: 'skill_level', skill: SkillType.SWORD_COMBAT, value: 30, description: 'Sword combat level 30' },
          { type: 'milestone', skill: SkillType.SWORD_COMBAT, value: 1, description: 'Complete Apprentice Swordsman milestone' }
        ],
        unlocked: false,
        progress: 0,
        activeEffects: [
          { name: 'dueling_focus', type: 'passive', description: '15% bonus against single targets', value: 1.15 },
          { name: 'parry_master', type: 'active', description: 'Enhanced parrying ability', value: 1.3 }
        ]
      },
      {
        id: 'sword_crowd_control',
        baseSkill: SkillType.SWORD_COMBAT,
        name: 'Crowd Control',
        description: 'Specialize in fighting multiple opponents',
        focusArea: 'multi_target_combat',
        modifiers: {
          skillBonus: 1.15,
          learningBonus: 1.1,
          experienceBonus: 1.2,
          synergyBonus: 1.0,
          penalties: {
            'shield_use': 0.8,
            'stealth': 0.7
          }
        },
        requirements: [
          { type: 'skill_level', skill: SkillType.SWORD_COMBAT, value: 35, description: 'Sword combat level 35' },
          { type: 'practice', skill: SkillType.SWORD_COMBAT, value: 100, description: 'Fight 100 multiple enemies' }
        ],
        unlocked: false,
        progress: 0,
        activeEffects: [
          { name: 'wide_swings', type: 'passive', description: '20% area damage bonus', value: 1.2 },
          { name: 'whirlwind', type: 'active', description: 'Area attack ability', value: 2.0 }
        ]
      }
    ]);
    
    // Crafting specializations
    this.addSpecializations(SkillType.CRAFTING, [
      {
        id: 'weapon_crafting',
        baseSkill: SkillType.CRAFTING,
        name: 'Weapon Crafting',
        description: 'Specialize in crafting weapons and tools',
        focusArea: 'weapon_production',
        modifiers: {
          skillBonus: 1.25,
          learningBonus: 1.15,
          experienceBonus: 1.2,
          synergyBonus: 1.2,
          penalties: {
            'cooking': 0.6,
            'tailoring': 0.7
          }
        },
        requirements: [
          { type: 'skill_level', skill: SkillType.CRAFTING, value: 25, description: 'Crafting level 25' },
          { type: 'practice', skill: SkillType.CRAFTING, value: 50, description: 'Craft 50 weapons' }
        ],
        unlocked: false,
        progress: 0,
        activeEffects: [
          { name: 'weapon_quality', type: 'passive', description: '25% weapon quality bonus', value: 1.25 },
          { name: 'sharpening', type: 'active', description: 'Enhanced weapon sharpening', value: 1.3 }
        ]
      },
      {
        id: 'armor_crafting',
        baseSkill: SkillType.CRAFTING,
        name: 'Armor Crafting',
        description: 'Specialize in crafting armor and protection',
        focusArea: 'armor_production',
        modifiers: {
          skillBonus: 1.2,
          learningBonus: 1.1,
          experienceBonus: 1.15,
          synergyBonus: 1.1,
          penalties: {
            'alchemy': 0.7,
            'jewelry': 0.8
          }
        },
        requirements: [
          { type: 'skill_level', skill: SkillType.CRAFTING, value: 25, description: 'Crafting level 25' },
          { type: 'practice', skill: SkillType.CRAFTING, value: 40, description: 'Craft 40 armor pieces' }
        ],
        unlocked: false,
        progress: 0,
        activeEffects: [
          { name: 'armor_durability', type: 'passive', description: '20% armor durability bonus', value: 1.2 },
          { name: 'reinforcement', type: 'active', description: 'Armor reinforcement ability', value: 1.4 }
        ]
      }
    ]);
  }
  
  /**
   * Add milestones for a skill
   */
  public addMilestones(skillType: SkillType, milestones: SkillMilestone[]): void {
    if (!this.milestones.has(skillType)) {
      this.milestones.set(skillType, []);
    }
    this.milestones.get(skillType)!.push(...milestones);
    
    // Initialize progress tracking
    milestones.forEach(milestone => {
      this.milestoneProgress.set(milestone.id, {
        milestoneId: milestone.id,
        skillType: milestone.skillType,
        progress: 0,
        requirementsProgress: {},
        estimatedTimeToComplete: 0,
        isAchieved: false
      });
    });
  }
  
  /**
   * Add specializations for a skill
   */
  public addSpecializations(skillType: SkillType, specializations: SkillSpecialization[]): void {
    if (!this.specializations.has(skillType)) {
      this.specializations.set(skillType, []);
    }
    this.specializations.get(skillType)!.push(...specializations);
    
    // Initialize progress tracking
    specializations.forEach(specialization => {
      this.specializationProgress.set(specialization.id, {
        specializationId: specialization.id,
        baseSkill: specialization.baseSkill,
        progress: 0,
        requirementsProgress: {},
        isUnlocked: false,
        activeEffects: []
      });
    });
  }
  
  /**
   * Update milestone progress based on skill activity
   */
  public updateMilestoneProgress(
    skillType: SkillType,
    skillLevel: number,
    experience: number,
    practiceData: Record<string, number>,
    successRate: number = 0
  ): MilestoneProgress[] {
    const milestones = this.milestones.get(skillType) || [];
    const updatedProgress: MilestoneProgress[] = [];
    
    milestones.forEach(milestone => {
      const progress = this.milestoneProgress.get(milestone.id)!;
      
      if (progress.isAchieved) return;
      
      // Calculate progress for each requirement
      let totalProgress = 0;
      let completedRequirements = 0;
      
      milestone.requirements.forEach(req => {
        const reqKey = `${req.type}_${req.target}`;
        let reqProgress = 0;
        
        switch (req.type) {
          case 'level':
            reqProgress = Math.min(1, skillLevel / req.value);
            break;
          case 'experience':
            reqProgress = Math.min(1, experience / req.value);
            break;
          case 'practice':
            const practiceValue = practiceData[req.target] || 0;
            reqProgress = Math.min(1, practiceValue / req.value);
            break;
          case 'success_rate':
            reqProgress = Math.min(1, successRate / req.value);
            break;
        }
        
        progress.requirementsProgress[reqKey] = reqProgress;
        totalProgress += reqProgress;
        
        if (reqProgress >= 1) {
          completedRequirements++;
        }
      });
      
      // Update overall progress
      progress.progress = totalProgress / milestone.requirements.length;
      
      // Check if milestone is achieved
      if (completedRequirements === milestone.requirements.length && !progress.isAchieved) {
        progress.isAchieved = true;
        progress.achievedAt = Date.now();
        milestone.achievedAt = Date.now();
        milestone.progress = 1;
        
        // Handle milestone rewards
        this.handleMilestoneAchievement(milestone);
      }
      
      updatedProgress.push(progress);
    });
    
    return updatedProgress;
  }
  
  /**
   * Update specialization progress
   */
  public updateSpecializationProgress(
    skillType: SkillType,
    skillLevel: number,
    practiceData: Record<string, number>,
    completedMilestones: string[]
  ): SpecializationProgress[] {
    const specializations = this.specializations.get(skillType) || [];
    const updatedProgress: SpecializationProgress[] = [];
    
    specializations.forEach(specialization => {
      const progress = this.specializationProgress.get(specialization.id)!;
      
      if (progress.isUnlocked) return;
      
      // Calculate progress for each requirement
      let totalProgress = 0;
      let completedRequirements = 0;
      
      specialization.requirements.forEach(req => {
        const reqKey = `${req.type}_${req.skill}`;
        let reqProgress = 0;
        
        switch (req.type) {
          case 'skill_level':
            reqProgress = Math.min(1, skillLevel / req.value);
            break;
          case 'practice':
            const practiceValue = practiceData[req.skill.toString()] || 0;
            reqProgress = Math.min(1, practiceValue / req.value);
            break;
          case 'milestone':
            reqProgress = completedMilestones.includes(req.value.toString()) ? 1 : 0;
            break;
        }
        
        progress.requirementsProgress[reqKey] = reqProgress;
        totalProgress += reqProgress;
        
        if (reqProgress >= 1) {
          completedRequirements++;
        }
      });
      
      // Update overall progress
      progress.progress = totalProgress / specialization.requirements.length;
      
      // Check if specialization should be unlocked
      if (completedRequirements === specialization.requirements.length && 
          !progress.isUnlocked && 
          this.config.autoUnlockSpecializations) {
        this.unlockSpecialization(specialization.id);
      }
      
      updatedProgress.push(progress);
    });
    
    return updatedProgress;
  }
  
  /**
   * Unlock a specialization
   */
  public unlockSpecialization(specializationId: string): boolean {
    const progress = this.specializationProgress.get(specializationId);
    if (!progress || progress.isUnlocked) return false;
    
    // Check if we have room for more active specializations
    if (this.activeSpecializations.size >= this.config.maxActiveSpecializations) {
      return false; // Cannot unlock more specializations
    }
    
    progress.isUnlocked = true;
    progress.unlockedAt = Date.now();
    this.activeSpecializations.add(specializationId);
    
    // Find the specialization and update it
    this.specializations.forEach(specializations => {
      const specialization = specializations.find(s => s.id === specializationId);
      if (specialization) {
        specialization.unlocked = true;
        specialization.unlockedAt = Date.now();
        progress.activeEffects = specialization.activeEffects.map(effect => effect.name);
      }
    });
    
    return true;
  }
  
  /**
   * Get active specializations for a skill
   */
  public getActiveSpecializations(skillType: SkillType): SkillSpecialization[] {
    const specializations = this.specializations.get(skillType) || [];
    return specializations.filter(spec => 
      this.activeSpecializations.has(spec.id) && spec.baseSkill === skillType
    );
  }
  
  /**
   * Get available milestones for a skill
   */
  public getAvailableMilestones(skillType: SkillType): SkillMilestone[] {
    return this.milestones.get(skillType) || [];
  }
  
  /**
   * Get milestone progress
   */
  public getMilestoneProgress(milestoneId: string): MilestoneProgress | null {
    return this.milestoneProgress.get(milestoneId) || null;
  }
  
  /**
   * Get specialization progress
   */
  public getSpecializationProgress(specializationId: string): SpecializationProgress | null {
    return this.specializationProgress.get(specializationId) || null;
  }
  
  /**
   * Get next milestones for a skill
   */
  public getNextMilestones(skillType: SkillType, currentLevel: number): SkillMilestone[] {
    const milestones = this.milestones.get(skillType) || [];
    return milestones
      .filter(m => m.level > currentLevel && !this.milestoneProgress.get(m.id)?.isAchieved)
      .sort((a, b) => a.level - b.level)
      .slice(0, 3); // Return next 3 milestones
  }
  
  /**
   * Get available specializations for a skill
   */
  public getAvailableSpecializations(skillType: SkillType): SkillSpecialization[] {
    const specializations = this.specializations.get(skillType) || [];
    return specializations.filter(spec => !spec.unlocked);
  }
  
  /**
   * Handle milestone achievement
   */
  private handleMilestoneAchievement(milestone: SkillMilestone): void {
    // Apply rewards
    milestone.rewards.forEach(reward => {
      switch (reward.type) {
        case 'ability':
          // This would integrate with the skills system to unlock abilities
          console.log(`Unlocked ability: ${reward.name}`);
          break;
        case 'bonus':
          // This would apply bonuses to the skill
          console.log(`Applied bonus: ${reward.name} = ${reward.value}`);
          break;
        case 'specialization':
          // This could unlock specializations
          console.log(`Unlocked specialization: ${reward.name}`);
          break;
        case 'title':
          // This would grant titles
          console.log(`Granted title: ${reward.value}`);
          break;
      }
    });
    
    // Celebration if enabled
    if (this.config.celebrateAchievements) {
      console.log(`🎉 Milestone achieved: ${milestone.name}!`);
    }
  }
  
  /**
   * Calculate milestone bonuses for a skill
   */
  public calculateMilestoneBonuses(skillType: SkillType): {
    skillBonus: number;
    learningBonus: number;
    experienceBonus: number;
    abilityUnlocks: string[];
  } {
    const milestones = this.milestones.get(skillType) || [];
    const achievedMilestones = milestones.filter(m => 
      this.milestoneProgress.get(m.id)?.isAchieved
    );
    
    let skillBonus = 1.0;
    let learningBonus = 1.0;
    let experienceBonus = 1.0;
    const abilityUnlocks: string[] = [];
    
    achievedMilestones.forEach(milestone => {
      milestone.rewards.forEach(reward => {
        switch (reward.type) {
          case 'bonus':
            if (typeof reward.value === 'number') {
              if (reward.name.includes('skill')) skillBonus *= reward.value;
              if (reward.name.includes('learning')) learningBonus *= reward.value;
              if (reward.name.includes('experience')) experienceBonus *= reward.value;
            }
            break;
          case 'ability':
            abilityUnlocks.push(reward.value.toString());
            break;
        }
      });
    });
    
    return {
      skillBonus,
      learningBonus,
      experienceBonus,
      abilityUnlocks
    };
  }
  
  /**
   * Calculate specialization bonuses for a skill
   */
  public calculateSpecializationBonuses(skillType: SkillType): {
    skillBonus: number;
    learningBonus: number;
    experienceBonus: number;
    synergyBonus: number;
    penalties: Record<string, number>;
    activeEffects: SpecializationEffect[];
  } {
    const activeSpecializations = this.getActiveSpecializations(skillType);
    
    let skillBonus = 1.0;
    let learningBonus = 1.0;
    let experienceBonus = 1.0;
    let synergyBonus = 1.0;
    const penalties: Record<string, number> = {};
    const activeEffects: SpecializationEffect[] = [];
    
    activeSpecializations.forEach(specialization => {
      skillBonus *= specialization.modifiers.skillBonus;
      learningBonus *= specialization.modifiers.learningBonus;
      experienceBonus *= specialization.modifiers.experienceBonus;
      synergyBonus *= specialization.modifiers.synergyBonus;
      
      // Apply penalties
      Object.entries(specialization.modifiers.penalties).forEach(([skill, penalty]) => {
        penalties[skill] = penalty;
      });
      
      // Add active effects
      activeEffects.push(...specialization.activeEffects);
    });
    
    return {
      skillBonus,
      learningBonus,
      experienceBonus,
      synergyBonus,
      penalties,
      activeEffects
    };
  }
  
  /**
   * Reset milestone system
   */
  public reset(): void {
    this.milestoneProgress.clear();
    this.specializationProgress.clear();
    this.activeSpecializations.clear();
    
    // Reinitialize progress tracking
    this.milestones.forEach(milestones => {
      milestones.forEach(milestone => {
        this.milestoneProgress.set(milestone.id, {
          milestoneId: milestone.id,
          skillType: milestone.skillType,
          progress: 0,
          requirementsProgress: {},
          estimatedTimeToComplete: 0,
          isAchieved: false
        });
      });
    });
    
    this.specializations.forEach(specializations => {
      specializations.forEach(specialization => {
        this.specializationProgress.set(specialization.id, {
          specializationId: specialization.id,
          baseSkill: specialization.baseSkill,
          progress: 0,
          requirementsProgress: {},
          isUnlocked: false,
          activeEffects: []
        });
      });
    });
  }
  
  /**
   * Get system statistics
   */
  public getStatistics(): {
    totalMilestones: number;
    achievedMilestones: number;
    totalSpecializations: number;
    unlockedSpecializations: number;
    activeSpecializations: number;
    averageMilestoneProgress: number;
    averageSpecializationProgress: number;
  } {
    let totalMilestones = 0;
    let achievedMilestones = 0;
    let totalSpecializations = 0;
    let unlockedSpecializations = 0;
    let totalMilestoneProgress = 0;
    let totalSpecializationProgress = 0;
    
    this.milestoneProgress.forEach(progress => {
      totalMilestones++;
      if (progress.isAchieved) achievedMilestones++;
      totalMilestoneProgress += progress.progress;
    });
    
    this.specializationProgress.forEach(progress => {
      totalSpecializations++;
      if (progress.isUnlocked) unlockedSpecializations++;
      totalSpecializationProgress += progress.progress;
    });
    
    return {
      totalMilestones,
      achievedMilestones,
      totalSpecializations,
      unlockedSpecializations,
      activeSpecializations: this.activeSpecializations.size,
      averageMilestoneProgress: totalMilestones > 0 ? totalMilestoneProgress / totalMilestones : 0,
      averageSpecializationProgress: totalSpecializations > 0 ? totalSpecializationProgress / totalSpecializations : 0
    };
  }
}
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getSocketService } from '../../services/socketService';
import { streamingService } from '../../services/streamingService';
import type {
  SkillsState,
  Skill,
  SkillProgression,
  SkillSynergy,
  TransferLearningEvent,
  SkillMilestone,
  SkillAchievement,
  SkillAnalytics,
  SkillInsight,
  SkillRecommendation,
  SkillsVisualizationConfig,
  ExperienceEvent,
  SkillFilter
} from '../../types/skills';
import type {
  SkillDataUpdateEvent,
  SkillExperienceEvent,
  SkillMilestoneEvent,
  SkillSynergyEvent
} from '../../types/socketEvents';

const initialVisualizationConfig: SkillsVisualizationConfig = {
  progressionCharts: {
    showExperienceHistory: true,
    showLearningCurve: true,
    showMilestones: true,
    showPredictions: true,
    colorScheme: 'blue',
    animationEnabled: true,
  },
  learningAnalysis: {
    showPlateaus: true,
    showBreakthroughs: true,
    showEfficiency: true,
    showRetention: true,
    timeRange: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() }, // 30 days
    granularity: 'day',
  },
  synergyMapping: {
    showTransferPaths: true,
    showStrengthIndicators: true,
    showDirectionality: true,
    layoutAlgorithm: 'force',
    threshold: 0.1,
  },
  milestoneTracking: {
    showProgressBars: true,
    showDependencies: true,
    showTimeline: true,
    sortBy: 'level',
    showCompleted: true,
  },
  performanceTrends: {
    metrics: ['accuracy', 'efficiency', 'consistency', 'quality', 'speed'],
    showMovingAverage: true,
    showPredictions: true,
    timeWindow: 7, // 7 days
    smoothingFactor: 0.3,
  },
  skillComparison: {
    compareBy: 'proficiency',
    showSynergies: true,
    showDifferences: true,
    highlightStrengths: true,
    groupByCategory: true,
  },
  experienceAnalysis: {
    showSources: true,
    showContexts: true,
    showEfficiency: true,
    showRetention: true,
    aggregationLevel: 'daily',
  },
  recommendations: {
    showPriority: true,
    showDifficulty: true,
    showTimeEstimate: true,
    showBenefits: true,
    maxRecommendations: 10,
    filterByType: [],
  },
};

const initialState: SkillsState = {
  // Current data
  skills: [],
  selectedSkill: null,
  selectedSkillData: null,
  
  // Progression data
  progressions: {},
  
  // Synergy data
  synergies: [],
  transferEvents: [],
  
  // Milestone data
  milestones: [],
  achievements: [],
  
  // Analytics and insights
  analytics: {},
  insights: [],
  recommendations: [],
  
  // Visualization state
  visualizationConfig: initialVisualizationConfig,
  
  // UI state
  loading: false,
  error: null,
  lastUpdated: 0,
  
  // Real-time updates
  realTimeUpdates: true,
  updateFrequency: 5000, // 5 seconds
  subscribedSkills: [],
};

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    // Skill management
    setSkills: (state, action: PayloadAction<Skill[]>) => {
      state.skills = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    
    addSkill: (state, action: PayloadAction<Skill>) => {
      const existingIndex = state.skills.findIndex(s => s.id === action.payload.id);
      if (existingIndex >= 0) {
        state.skills[existingIndex] = action.payload;
      } else {
        state.skills.push(action.payload);
      }
      state.lastUpdated = Date.now();
    },
    
    updateSkill: (state, action: PayloadAction<{ skillId: string; updates: Partial<Skill> }>) => {
      const { skillId, updates } = action.payload;
      const skillIndex = state.skills.findIndex(s => s.id === skillId);
      if (skillIndex >= 0) {
        state.skills[skillIndex] = { ...state.skills[skillIndex], ...updates };
        state.lastUpdated = Date.now();
      }
    },
    
    removeSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter(s => s.id !== action.payload);
      delete state.progressions[action.payload];
      delete state.analytics[action.payload];
      if (state.selectedSkill === action.payload) {
        state.selectedSkill = null;
        state.selectedSkillData = null;
      }
      state.lastUpdated = Date.now();
    },
    
    // Skill selection
    selectSkill: (state, action: PayloadAction<string>) => {
      state.selectedSkill = action.payload;
      const skill = state.skills.find(s => s.id === action.payload);
      state.selectedSkillData = skill || null;
    },
    
    clearSkillSelection: (state) => {
      state.selectedSkill = null;
      state.selectedSkillData = null;
    },
    
    // Progression management
    setSkillProgression: (state, action: PayloadAction<{ skillId: string; progression: SkillProgression }>) => {
      const { skillId, progression } = action.payload;
      state.progressions[skillId] = progression;
      state.lastUpdated = Date.now();
    },
    
    updateSkillProgression: (state, action: PayloadAction<{ skillId: string; updates: Partial<SkillProgression> }>) => {
      const { skillId, updates } = action.payload;
      const existingProgression = state.progressions[skillId];
      if (existingProgression) {
        state.progressions[skillId] = { ...existingProgression, ...updates };
        state.lastUpdated = Date.now();
      }
    },
    
    addExperiencePoint: (state, action: PayloadAction<{ skillId: string; experience: ExperienceEvent }>) => {
      const { skillId, experience } = action.payload;
      const progression = state.progressions[skillId];
      const skill = state.skills.find(s => s.id === skillId);
      
      if (skill) {
        // Update skill total experience
        skill.metadata.totalExperience += experience.amount;
        
        // Update proficiency if learning gain is provided
        if (experience.learningGain > 0) {
          skill.proficiency.overall = Math.min(1, skill.proficiency.overall + experience.learningGain);
          skill.proficiency.totalExperience += experience.amount;
        }
      }
      
      if (progression) {
        const newPoint = {
          timestamp: experience.timestamp,
          amount: experience.amount,
          cumulative: skill?.metadata.totalExperience || 0,
          source: experience.source as any,
          context: experience.context.situation,
          efficiency: experience.efficiency,
        };
        progression.experienceHistory.push(newPoint);
        state.lastUpdated = Date.now();
      }
    },
    
    // Synergy management
    setSynergies: (state, action: PayloadAction<SkillSynergy[]>) => {
      state.synergies = action.payload;
      state.lastUpdated = Date.now();
    },
    
    addSynergy: (state, action: PayloadAction<SkillSynergy>) => {
      const existingIndex = state.synergies.findIndex(s => s.id === action.payload.id);
      if (existingIndex >= 0) {
        state.synergies[existingIndex] = action.payload;
      } else {
        state.synergies.push(action.payload);
      }
      state.lastUpdated = Date.now();
    },
    
    updateSynergy: (state, action: PayloadAction<{ synergyId: string; updates: Partial<SkillSynergy> }>) => {
      const { synergyId, updates } = action.payload;
      const synergyIndex = state.synergies.findIndex(s => s.id === synergyId);
      if (synergyIndex >= 0) {
        state.synergies[synergyIndex] = { ...state.synergies[synergyIndex], ...updates };
        state.lastUpdated = Date.now();
      }
    },
    
    removeSynergy: (state, action: PayloadAction<string>) => {
      state.synergies = state.synergies.filter(s => s.id !== action.payload);
      state.lastUpdated = Date.now();
    },
    
    // Transfer learning events
    addTransferEvent: (state, action: PayloadAction<TransferLearningEvent>) => {
      state.transferEvents.push(action.payload);
      state.lastUpdated = Date.now();
    },
    
    setTransferEvents: (state, action: PayloadAction<TransferLearningEvent[]>) => {
      state.transferEvents = action.payload;
      state.lastUpdated = Date.now();
    },
    
    // Milestone management
    setMilestones: (state, action: PayloadAction<SkillMilestone[]>) => {
      state.milestones = action.payload;
      state.lastUpdated = Date.now();
    },
    
    addMilestone: (state, action: PayloadAction<SkillMilestone>) => {
      const existingIndex = state.milestones.findIndex(m => m.id === action.payload.id);
      if (existingIndex >= 0) {
        state.milestones[existingIndex] = action.payload;
      } else {
        state.milestones.push(action.payload);
      }
      state.lastUpdated = Date.now();
    },
    
    updateMilestone: (state, action: PayloadAction<{ milestoneId: string; updates: Partial<SkillMilestone> }>) => {
      const { milestoneId, updates } = action.payload;
      const milestoneIndex = state.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex >= 0) {
        state.milestones[milestoneIndex] = { ...state.milestones[milestoneIndex], ...updates };
        state.lastUpdated = Date.now();
      }
    },
    
    achieveMilestone: (state, action: PayloadAction<{ milestoneId: string; achievedAt: number }>) => {
      const { milestoneId, achievedAt } = action.payload;
      const milestone = state.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        milestone.achievedAt = achievedAt;
        milestone.progress = 1.0;
      }
      
      // Update progression milestone progress
      Object.values(state.progressions).forEach(progression => {
        const milestoneProgress = (progression as any).milestoneProgress.find(mp => mp.milestoneId === milestoneId);
        if (milestoneProgress) {
          (milestoneProgress as any).currentProgress = 1.0;
          (milestoneProgress as any).achievedAt = achievedAt;
        }
      });
      
      state.lastUpdated = Date.now();
    },
    
    // Achievement management
    setAchievements: (state, action: PayloadAction<SkillAchievement[]>) => {
      state.achievements = action.payload;
      state.lastUpdated = Date.now();
    },
    
    addAchievement: (state, action: PayloadAction<SkillAchievement>) => {
      const existingIndex = state.achievements.findIndex(a => a.id === action.payload.id);
      if (existingIndex >= 0) {
        state.achievements[existingIndex] = action.payload;
      } else {
        state.achievements.push(action.payload);
      }
      state.lastUpdated = Date.now();
    },
    
    unlockAchievement: (state, action: PayloadAction<{ achievementId: string; achievedAt: number }>) => {
      const { achievementId, achievedAt } = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (achievement) {
        achievement.achieved = true;
        achievement.achievedAt = achievedAt;
        achievement.progress = 1.0;
      }
      state.lastUpdated = Date.now();
    },
    
    // Analytics management
    setSkillAnalytics: (state, action: PayloadAction<{ skillId: string; analytics: SkillAnalytics }>) => {
      const { skillId, analytics } = action.payload;
      state.analytics[skillId] = analytics;
      state.lastUpdated = Date.now();
    },
    
    updateSkillAnalytics: (state, action: PayloadAction<{ skillId: string; updates: Partial<SkillAnalytics> }>) => {
      const { skillId, updates } = action.payload;
      const existingAnalytics = state.analytics[skillId];
      if (existingAnalytics) {
        state.analytics[skillId] = { ...existingAnalytics, ...updates };
        state.lastUpdated = Date.now();
      }
    },
    
    // Insights and recommendations
    addInsight: (state, action: PayloadAction<SkillInsight>) => {
      state.insights.push(action.payload);
      // Keep only last 100 insights
      if (state.insights.length > 100) {
        state.insights = state.insights.slice(-100);
      }
      state.lastUpdated = Date.now();
    },
    
    setInsights: (state, action: PayloadAction<SkillInsight[]>) => {
      state.insights = action.payload;
      state.lastUpdated = Date.now();
    },
    
    clearInsights: (state) => {
      state.insights = [];
    },
    
    addRecommendation: (state, action: PayloadAction<SkillRecommendation>) => {
      state.recommendations.push(action.payload);
      // Keep only last 50 recommendations
      if (state.recommendations.length > 50) {
        state.recommendations = state.recommendations.slice(-50);
      }
      state.lastUpdated = Date.now();
    },
    
    setRecommendations: (state, action: PayloadAction<SkillRecommendation[]>) => {
      state.recommendations = action.payload;
      state.lastUpdated = Date.now();
    },
    
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
    
    acceptRecommendation: (state, action: PayloadAction<string>) => {
      const recommendationIndex = state.recommendations.findIndex(r => r.id === action.payload);
      if (recommendationIndex >= 0) {
        // Mark as accepted or remove - implementation depends on requirements
        state.recommendations.splice(recommendationIndex, 1);
      }
      state.lastUpdated = Date.now();
    },
    
    // Configuration management
    updateVisualizationConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig>>) => {
      state.visualizationConfig = { ...state.visualizationConfig, ...action.payload };
    },
    
    updateProgressionChartsConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig['progressionCharts']>>) => {
      state.visualizationConfig.progressionCharts = {
        ...state.visualizationConfig.progressionCharts,
        ...action.payload
      };
    },
    
    updateLearningAnalysisConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig['learningAnalysis']>>) => {
      state.visualizationConfig.learningAnalysis = {
        ...state.visualizationConfig.learningAnalysis,
        ...action.payload
      };
    },
    
    updateSynergyMappingConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig['synergyMapping']>>) => {
      state.visualizationConfig.synergyMapping = {
        ...state.visualizationConfig.synergyMapping,
        ...action.payload
      };
    },
    
    updateMilestoneTrackingConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig['milestoneTracking']>>) => {
      state.visualizationConfig.milestoneTracking = {
        ...state.visualizationConfig.milestoneTracking,
        ...action.payload
      };
    },
    
    updatePerformanceTrendsConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig['performanceTrends']>>) => {
      state.visualizationConfig.performanceTrends = {
        ...state.visualizationConfig.performanceTrends,
        ...action.payload
      };
    },
    
    updateSkillComparisonConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig['skillComparison']>>) => {
      state.visualizationConfig.skillComparison = {
        ...state.visualizationConfig.skillComparison,
        ...action.payload
      };
    },
    
    updateExperienceAnalysisConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig['experienceAnalysis']>>) => {
      state.visualizationConfig.experienceAnalysis = {
        ...state.visualizationConfig.experienceAnalysis,
        ...action.payload
      };
    },
    
    updateRecommendationsConfig: (state, action: PayloadAction<Partial<SkillsVisualizationConfig['recommendations']>>) => {
      state.visualizationConfig.recommendations = {
        ...state.visualizationConfig.recommendations,
        ...action.payload
      };
    },
    
    // Real-time updates management
    setRealTimeUpdates: (state, action: PayloadAction<boolean>) => {
      state.realTimeUpdates = action.payload;
    },
    
    setUpdateFrequency: (state, action: PayloadAction<number>) => {
      state.updateFrequency = action.payload;
    },
    
    subscribeToSkill: (state, action: PayloadAction<string>) => {
      if (!state.subscribedSkills.includes(action.payload)) {
        state.subscribedSkills.push(action.payload);
      }
    },
    
    unsubscribeFromSkill: (state, action: PayloadAction<string>) => {
      state.subscribedSkills = state.subscribedSkills.filter(id => id !== action.payload);
    },
    
    setSubscribedSkills: (state, action: PayloadAction<string[]>) => {
      state.subscribedSkills = action.payload;
    },
    
    // UI state management
    setSkillsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setSkillsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearSkillsError: (state) => {
      state.error = null;
    },
    
    // Socket.IO event handlers
    handleSkillDataUpdate: (state, action: PayloadAction<SkillDataUpdateEvent>) => {
      const { skillId, type, data } = action.payload;
      
      switch (type) {
        case 'experience_gained':
          // Handle experience gain
          const skill = state.skills.find(s => s.id === skillId);
          if (skill && data.experience) {
            skill.metadata.totalExperience += data.experience.amount;
            skill.proficiency.totalExperience += data.experience.amount;
          }
          break;
          
        case 'level_up':
          // Handle level up
          const leveledSkill = state.skills.find(s => s.id === skillId);
          if (leveledSkill && data.newLevel) {
            leveledSkill.proficiency.currentLevel = data.newLevel;
          }
          break;
          
        case 'milestone_achieved':
          // Handle milestone achievement
          const milestone = state.milestones.find(m => m.id === data.milestoneId);
          if (milestone) {
            milestone.achievedAt = Date.now();
            milestone.progress = 1.0;
          }
          break;
          
        case 'synergy_discovered':
          // Handle synergy discovery
          if (data.synergy) {
            const existingIndex = state.synergies.findIndex(s => s.id === data.synergy.id);
            if (existingIndex >= 0) {
              state.synergies[existingIndex] = data.synergy;
            } else {
              state.synergies.push(data.synergy);
            }
          }
          break;
          
        case 'proficiency_change':
          // Handle proficiency change
          const updatedSkill = state.skills.find(s => s.id === skillId);
          if (updatedSkill && data.newProficiency) {
            updatedSkill.proficiency.overall = data.newProficiency;
          }
          break;
      }
      
      state.lastUpdated = Date.now();
    },
    
    handleSkillExperienceEvent: (state, action: PayloadAction<SkillExperienceEvent>) => {
      const { skillId, experience, impact } = action.payload;
      
      // Update skill
      const skill = state.skills.find(s => s.id === skillId);
      if (skill) {
        skill.metadata.totalExperience += experience.amount;
        skill.proficiency.overall = Math.min(1, skill.proficiency.overall + impact.proficiencyGain);
        skill.proficiency.totalExperience += experience.amount;
      }
      
      // Update progression
      const progression = state.progressions[skillId];
      if (progression) {
        const newPoint = {
          timestamp: experience.timestamp,
          amount: experience.amount,
          cumulative: skill?.metadata.totalExperience || 0,
          source: experience.source as any,
          context: experience.context.situation,
          efficiency: experience.efficiency,
        };
        progression.experienceHistory.push(newPoint);
      }
      
      // Activate synergies if any
      impact.synergyActivation.forEach(synergyId => {
        const synergy = state.synergies.find(s => s.id === synergyId);
        if (synergy) {
          // Strengthen the synergy
          synergy.evolution.masteryLevel = Math.min(1, synergy.evolution.masteryLevel + 0.1);
        }
      });
      
      state.lastUpdated = Date.now();
    },
    
    handleSkillMilestoneEvent: (state, action: PayloadAction<SkillMilestoneEvent>) => {
      const { skillId, milestone, abilities } = action.payload;
      
      // Update or add milestone
      const existingIndex = state.milestones.findIndex(m => m.id === milestone.id);
      if (existingIndex >= 0) {
        state.milestones[existingIndex] = milestone;
      } else {
        state.milestones.push(milestone);
      }
      
      // Update skill abilities
      const skill = state.skills.find(s => s.id === skillId);
      if (skill) {
        // Add abilities to skill (implementation depends on skill structure)
        // This could unlock new sub-skills or improve existing ones
      }
      
      // Update progression
      const progression = state.progressions[skillId];
      if (progression) {
        const milestoneProgress = progression.milestoneProgress.find(mp => mp.milestoneId === milestone.id);
        if (milestoneProgress) {
          milestoneProgress.currentProgress = 1.0;
          milestoneProgress.achievedAt = Date.now();
        }
      }
      
      state.lastUpdated = Date.now();
    },
    
    handleSkillSynergyEvent: (state, action: PayloadAction<SkillSynergyEvent>) => {
      const { synergy, transferEvent } = action.payload;
      
      // Update or add synergy
      const existingIndex = state.synergies.findIndex(s => s.id === synergy.id);
      if (existingIndex >= 0) {
        state.synergies[existingIndex] = synergy;
      } else {
        state.synergies.push(synergy);
      }
      
      // Add transfer event
      state.transferEvents.push(transferEvent);
      
      // Update related skills based on transfer
      const sourceSkill = state.skills.find(s => s.id === transferEvent.sourceSkillId);
      const targetSkill = state.skills.find(s => s.id === transferEvent.targetSkillId);
      
      if (targetSkill && transferEvent.learningBoost > 0) {
        targetSkill.proficiency.overall = Math.min(1, targetSkill.proficiency.overall + transferEvent.learningBoost);
      }
      
      state.lastUpdated = Date.now();
    },
    
    // Reset state
    resetSkillsState: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setSkills,
  addSkill,
  updateSkill,
  removeSkill,
  selectSkill,
  clearSkillSelection,
  setSkillProgression,
  updateSkillProgression,
  addExperiencePoint,
  setSynergies,
  addSynergy,
  updateSynergy,
  removeSynergy,
  addTransferEvent,
  setTransferEvents,
  setMilestones,
  addMilestone,
  updateMilestone,
  achieveMilestone,
  setAchievements,
  addAchievement,
  unlockAchievement,
  setSkillAnalytics,
  updateSkillAnalytics,
  addInsight,
  setInsights,
  clearInsights,
  addRecommendation,
  setRecommendations,
  clearRecommendations,
  acceptRecommendation,
  updateVisualizationConfig,
  updateProgressionChartsConfig,
  updateLearningAnalysisConfig,
  updateSynergyMappingConfig,
  updateMilestoneTrackingConfig,
  updatePerformanceTrendsConfig,
  updateSkillComparisonConfig,
  updateExperienceAnalysisConfig,
  updateRecommendationsConfig,
  setRealTimeUpdates,
  setUpdateFrequency,
  subscribeToSkill,
  unsubscribeFromSkill,
  setSubscribedSkills,
  setSkillsLoading,
  setSkillsError,
  clearSkillsError,
  handleSkillDataUpdate,
  handleSkillExperienceEvent,
  handleSkillMilestoneEvent,
  handleSkillSynergyEvent,
  resetSkillsState,
} = skillsSlice.actions;

// Async thunks for Socket.IO integration
export const initializeSkillsSocket = createAsyncThunk(
  'skills/initializeSocket',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Note: Streams are now created centrally in App.tsx to avoid duplicates
      // await streamingService.createStream('skills', 'skills', {
      //   window: 1000,
      //   enabled: true,
      //   function: (events) => events[events.length - 1] // Keep latest
      // });

      // Register event handlers
      const socketService = getSocketService();
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Skill data updates (experience, level ups, milestones, etc.)
      socketService.on('skill:progress:update', (event: SkillDataUpdateEvent) => {
        dispatch(handleSkillDataUpdate(event));
      });

      // Skill experience events
      socketService.on('skill:experience:event', (event: SkillExperienceEvent) => {
        dispatch(handleSkillExperienceEvent(event));
      });

      // Skill milestone events
      socketService.on('skill:milestone:event', (event: SkillMilestoneEvent) => {
        dispatch(handleSkillMilestoneEvent(event));
      });

      // Skill synergy events
      socketService.on('skill:synergy:event', (event: SkillSynergyEvent) => {
        dispatch(handleSkillSynergyEvent(event));
      });

      // Individual skill updates
      socketService.on('skill:update', (event: { skillId: string; updates: Partial<Skill> }) => {
        dispatch(updateSkill({
          skillId: event.skillId,
          updates: event.updates
        }));
      });

      // New skill discovered
      socketService.on('skill:discovered', (event: { skill: Skill }) => {
        dispatch(addSkill(event.skill));
      });

      // Skill synergy discovered
      socketService.on('skill:synergy:discovered', (event: { synergy: SkillSynergy }) => {
        dispatch(addSynergy(event.synergy));
      });

      // Skill achievement unlocked
      socketService.on('skill:achievement:unlocked', (event: { achievement: SkillAchievement; achievedAt: number }) => {
        dispatch(addAchievement(event.achievement));
        dispatch(unlockAchievement({
          achievementId: event.achievement.id,
          achievedAt: event.achievedAt
        }));
      });

      // Skill insight generated
      socketService.on('skill:insight:generated', (event: { insight: SkillInsight }) => {
        dispatch(addInsight(event.insight));
      });

      // Skill recommendation generated
      socketService.on('skill:recommendation:generated', (event: { recommendation: SkillRecommendation }) => {
        dispatch(addRecommendation(event.recommendation));
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize skills socket:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const subscribeToSkillSocket = createAsyncThunk(
  'skills/subscribeToSkillSocket',
  async (skillId: string, { dispatch, rejectWithValue }) => {
    try {
      const socketService = getSocketService();
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Subscribe to skill-specific events
      socketService.send('skill:subscribe', { skillId });
      
      // Handle skill-specific updates
      const handleSkillUpdate = (event: any) => {
        if (event.skillId === skillId) {
          dispatch(handleSkillDataUpdate(event));
        }
      };

      socketService.on('skill:progress:update', handleSkillUpdate);

      return skillId;
    } catch (error) {
      console.error('Failed to subscribe to skill:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const unsubscribeFromSkillSocket = createAsyncThunk(
  'skills/unsubscribeFromSkillSocket',
  async (skillId: string, { dispatch, rejectWithValue }) => {
    try {
      const socketService = getSocketService();
      if (!socketService) {
        throw new Error('Socket service not initialized');
      }

      // Unsubscribe from skill-specific events
      socketService.send('skill:unsubscribe', { skillId });
      
      // Remove event listeners
      socketService.off('skill:progress:update');

      dispatch(unsubscribeFromSkill(skillId));

      return skillId;
    } catch (error) {
      console.error('Failed to unsubscribe from skill:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Export skills actions object for easier importing
export const skillsActions = {
  setSkills,
  addSkill,
  updateSkill,
  removeSkill,
  selectSkill,
  clearSkillSelection,
  setSkillProgression,
  updateSkillProgression,
  addExperiencePoint,
  setSynergies,
  addSynergy,
  updateSynergy,
  removeSynergy,
  addTransferEvent,
  setTransferEvents,
  setMilestones,
  addMilestone,
  updateMilestone,
  achieveMilestone,
  setAchievements,
  addAchievement,
  unlockAchievement,
  setSkillAnalytics,
  updateSkillAnalytics,
  addInsight,
  setInsights,
  clearInsights,
  addRecommendation,
  setRecommendations,
  clearRecommendations,
  acceptRecommendation,
  updateVisualizationConfig,
  updateProgressionChartsConfig,
  updateLearningAnalysisConfig,
  updateSynergyMappingConfig,
  updateMilestoneTrackingConfig,
  updatePerformanceTrendsConfig,
  updateSkillComparisonConfig,
  updateExperienceAnalysisConfig,
  updateRecommendationsConfig,
  setRealTimeUpdates,
  setUpdateFrequency,
  subscribeToSkill,
  unsubscribeFromSkill,
  setSubscribedSkills,
  setSkillsLoading,
  setSkillsError,
  clearSkillsError,
  handleSkillDataUpdate,
  handleSkillExperienceEvent,
  handleSkillMilestoneEvent,
  handleSkillSynergyEvent,
  resetSkillsState,
};

// Export the type for use in other components
export type { SkillsState };

export default skillsSlice.reducer;

// Selectors
export const selectSkills = (state: { skills: SkillsState }) => state.skills.skills;
export const selectSelectedSkillId = (state: { skills: SkillsState }) => state.skills.selectedSkill;
export const selectSelectedSkillData = (state: { skills: SkillsState }) => state.skills.selectedSkillData;
export const selectSkillById = (state: { skills: SkillsState }, skillId: string) => 
  state.skills.skills.find(s => s.id === skillId) || null;
export const selectSkillsByCategory = (state: { skills: SkillsState }, category: string) => 
  state.skills.skills.filter(s => s.category === category);
export const selectSkillsByType = (state: { skills: SkillsState }, type: string) => 
  state.skills.skills.filter(s => s.type === type);
export const selectSkillProgression = (state: { skills: SkillsState }, skillId: string) => 
  state.skills.progressions[skillId] || null;
export const selectSkillSynergies = (state: { skills: SkillsState }, skillId: string) => 
  state.skills.synergies.filter(s => s.sourceSkillId === skillId || s.targetSkillId === skillId);
export const selectSkillMilestones = (state: { skills: SkillsState }, skillId: string) => 
  state.skills.milestones.filter(m => m.requirements.proficiency > 0); // Filter by skill if needed
export const selectSkillAnalytics = (state: { skills: SkillsState }, skillId: string) => 
  state.skills.analytics[skillId] || null;
export const selectSkillsInsights = (state: { skills: SkillsState }) => state.skills.insights;
export const selectSkillsRecommendations = (state: { skills: SkillsState }) => state.skills.recommendations;
export const selectSkillsVisualizationConfig = (state: { skills: SkillsState }) => state.skills.visualizationConfig;
export const selectSkillsLoading = (state: { skills: SkillsState }) => state.skills.loading;
export const selectSkillsError = (state: { skills: SkillsState }) => state.skills.error;
export const selectSkillsLastUpdated = (state: { skills: SkillsState }) => state.skills.lastUpdated;
export const selectRealTimeUpdates = (state: { skills: SkillsState }) => state.skills.realTimeUpdates;
export const selectUpdateFrequency = (state: { skills: SkillsState }) => state.skills.updateFrequency;
export const selectSubscribedSkills = (state: { skills: SkillsState }) => state.skills.subscribedSkills;
export const selectTransferEvents = (state: { skills: SkillsState }) => state.skills.transferEvents;
export const selectAchievements = (state: { skills: SkillsState }) => state.skills.achievements;

// Complex selectors
export const selectTopSkillsByProficiency = (state: { skills: SkillsState }, limit: number = 10) => 
  [...state.skills.skills]
    .sort((a, b) => b.proficiency.overall - a.proficiency.overall)
    .slice(0, limit);

export const selectSkillsWithMilestones = (state: { skills: SkillsState }) => 
  state.skills.skills.filter(skill => 
    state.skills.milestones.some(milestone => 
      milestone.level <= skill.proficiency.currentLevel
    )
  );

export const selectActiveSynergies = (state: { skills: SkillsState }) => 
  state.skills.synergies.filter(synergy => synergy.evolution.masteryLevel > 0.1);

export const selectRecentExperience = (state: { skills: SkillsState }, skillId: string, hours: number = 24) => {
  const progression = state.skills.progressions[skillId];
  if (!progression) return [];
  
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
  return progression.experienceHistory.filter(point => point.timestamp > cutoffTime);
};

export const selectSkillPerformanceMetrics = (state: { skills: SkillsState }, skillId: string) => {
  const skill = state.skills.skills.find(s => s.id === skillId);
  if (!skill) return null;
  
  return {
    proficiency: skill.proficiency.overall,
    level: skill.proficiency.currentLevel,
    experience: skill.metadata.totalExperience,
    accuracy: skill.proficiency.accuracy,
    efficiency: skill.proficiency.efficiency,
    consistency: skill.proficiency.consistency,
  };
};

export const selectSkillsSummary = (state: { skills: SkillsState }) => {
  const skills = state.skills.skills;
  const totalSkills = skills.length;
  const averageProficiency = totalSkills > 0 
    ? skills.reduce((sum, skill) => sum + skill.proficiency.overall, 0) / totalSkills 
    : 0;
  const totalExperience = skills.reduce((sum, skill) => sum + skill.metadata.totalExperience, 0);
  const totalMilestones = skills.reduce((sum, skill) => 
    sum + state.skills.milestones.filter(m => m.level <= skill.proficiency.currentLevel).length, 0
  );
  
  return {
    totalSkills,
    averageProficiency,
    totalExperience,
    totalMilestones,
    lastUpdated: state.skills.lastUpdated,
  };
};
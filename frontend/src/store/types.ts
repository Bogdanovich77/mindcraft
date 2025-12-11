import type { AgentsState } from './slices/agentsSlice';
import type { UIState } from './slices/uiSlice';
import type { ConnectionState } from './slices/connectionSlice';
import type { DashboardState } from './slices/dashboardSlice';
import type { PersonalityState } from './slices/personalitySlice';
import type { MemoryState } from './slices/memorySlice';
import type { GoalHierarchyState } from './slices/goalsSlice';
import type { SocialState } from './slices/socialSlice';
import type { SkillsState } from './slices/skillsSlice';

export interface RootState {
  agents: AgentsState;
  ui: UIState;
  connection: ConnectionState;
  dashboard: DashboardState;
  personality: PersonalityState;
  memory: MemoryState;
  goals: GoalHierarchyState;
  social: SocialState;
  skills: SkillsState;
}

// Re-export commonly used types for convenience
export type { AppDispatch } from './index';
export type { DashboardState } from './slices/dashboardSlice';
export type { PersonalityState } from './slices/personalitySlice';
export type { MemoryState } from './slices/memorySlice';
export type { GoalHierarchyState } from './slices/goalsSlice';
export type { ConnectionState } from './slices/connectionSlice';
export type { UIState } from './slices/uiSlice';
export type { AgentsState } from './slices/agentsSlice';
export type { SocialState } from './slices/socialSlice';
export type { SkillsState } from './slices/skillsSlice';
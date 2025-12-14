import type { AgentsState } from './slices/agentsSlice';
import type { UIState } from './slices/uiSlice';
import type { ConnectionState } from './slices/connectionSlice';
import type { DashboardState } from './slices/dashboardSlice';

export interface RootState {
  agents: AgentsState;
  ui: UIState;
  connection: ConnectionState;
  dashboard: DashboardState;
}

// Re-export commonly used types for convenience
export type { AppDispatch } from './index';
export type { DashboardState } from './slices/dashboardSlice';
export type { ConnectionState } from './slices/connectionSlice';
export type { UIState } from './slices/uiSlice';
export type { AgentsState } from './slices/agentsSlice';

// Legacy types - marked as deprecated for backward compatibility
/** @deprecated No longer used in simplified architecture */
export type { MemoryState } from './slices/memorySlice';
/** @deprecated No longer used in simplified architecture */
export type { GoalHierarchyState } from './slices/goalsSlice';
/** @deprecated No longer used in simplified architecture */
export type { SocialState } from './slices/socialSlice';
/** @deprecated No longer used in simplified architecture */
export type { SkillsState } from './slices/skillsSlice';
/** @deprecated No longer used in simplified architecture */
export type { PersonalityState } from './slices/personalitySlice';
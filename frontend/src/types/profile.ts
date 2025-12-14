/**
 * Profile Management Type Definitions
 * 
 * This file contains comprehensive type definitions for profile management
 * in the Mindcraft frontend, aligning with the backend API structure.
 */

// Base profile interface matching backend profile structure
export interface Profile {
  name: string;
  model: string;
  personality: string;
  goals: string;
  mandate?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: 'available' | 'running' | 'error' | 'stopped';
}

// Extended profile with UI-specific properties
export interface ProfileWithStatus extends Profile {
  id: string; // Using name as ID for consistency
  isRunning: boolean;
  canBoot: boolean;
  lastUsed?: string;
  bootAttempts?: number;
  error?: string;
}

// Profile creation/editing form data
export interface ProfileFormData {
  name: string;
  model: string;
  personality: string;
  goals: string;
  mandate: string;
  description: string;
  tags: string[];
}

// Profile validation errors
export interface ProfileValidationError {
  field: keyof ProfileFormData;
  message: string;
}

// Profile API response types
export interface ProfileListResponse {
  success: boolean;
  data: Profile[];
  meta: {
    timestamp: string;
    count: number;
    requestId: string;
    version: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: Profile;
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface ProfileBootResponse {
  success: boolean;
  data: {
    agentId: string;
    profileName: string;
    status: 'booting' | 'running' | 'error';
    message: string;
  };
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Profile management state
export interface ProfilesState {
  profiles: Record<string, ProfileWithStatus>;
  selectedProfile: string | null;
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  
  // Boot operation state
  booting: {
    [profileName: string]: boolean;
  };
  
  // Form state for editing
  editing: {
    isEditing: boolean;
    profile: ProfileFormData | null;
    validationErrors: ProfileValidationError[];
    warnings: string[];
    suggestions: string[];
    hasUnsavedChanges: boolean;
    isSaving: boolean;
  };
  
  // Templates and presets
  templates: Array<{
    id: string;
    name: string;
    description: string;
    profile: Partial<ProfileFormData>;
  }>;
  templatesLoading: boolean;
  templatesError: string | null;
  
  // Personality analysis
  personalityAnalysis: {
    traits: string[];
    tone: string;
    socialStyle: string;
    confidence: 'high' | 'medium' | 'low';
  } | null;
  personalityAnalysisLoading: boolean;
  personalityAnalysisError: string | null;
  
  // Filtering and searching
  filters: {
    search: string;
    status: string[];
    model: string[];
    tags: string[];
  };
  
  // UI state
  ui: {
    view: 'grid' | 'list';
    sortBy: 'name' | 'createdAt' | 'lastUsed' | 'status';
    sortOrder: 'asc' | 'desc';
    showDetails: boolean;
    showEditDialog: boolean;
    showAdvancedOptions: boolean;
  };
}

// Socket.IO event types for profile management
export interface ProfileBootEvent {
  profileName: string;
  agentId: string;
  status: 'booting' | 'running' | 'error' | 'stopped';
  message?: string;
  timestamp: number;
}

export interface ProfileStatusEvent {
  profileName: string;
  status: 'available' | 'running' | 'error' | 'stopped';
  timestamp: number;
}

// Profile service interface
export interface ProfileService {
  // REST API methods
  getProfiles(): Promise<ProfileListResponse>;
  getProfile(name: string): Promise<ProfileResponse>;
  createProfile(profile: ProfileFormData): Promise<ProfileResponse>;
  updateProfile(name: string, profile: Partial<ProfileFormData>): Promise<ProfileResponse>;
  deleteProfile(name: string): Promise<void>;
  
  // Boot operations
  bootProfile(name: string): Promise<ProfileBootResponse>;
  stopProfile(name: string): Promise<void>;
  
  // Socket.IO integration
  subscribeToProfileEvents(): void;
  unsubscribeFromProfileEvents(): void;
}

// Redux action types
export interface ProfileAction {
  type: string;
  payload?: any;
  error?: boolean;
  meta?: any;
}

// Profile selectors return types
export interface ProfileSelectors {
  selectAllProfiles: () => ProfileWithStatus[];
  selectProfileById: (id: string) => ProfileWithStatus | undefined;
  selectSelectedProfile: () => ProfileWithStatus | undefined;
  selectProfilesLoading: () => boolean;
  selectProfilesError: () => string | null;
  selectFilteredProfiles: () => ProfileWithStatus[];
  selectProfilesByStatus: (status: string) => ProfileWithStatus[];
  selectProfilesByModel: (model: string) => ProfileWithStatus[];
}

// Profile component props
export interface ProfileCardProps {
  profile: ProfileWithStatus;
  onBoot: (profileName: string) => void;
  onStop: (profileName: string) => void;
  onEdit: (profile: ProfileWithStatus) => void;
  onDelete: (profileName: string) => void;
  onSelect: (profile: ProfileWithStatus) => void;
  isSelected: boolean;
  compact?: boolean;
}

export interface ProfileListProps {
  profiles: ProfileWithStatus[];
  loading: boolean;
  error: string | null;
  onBoot: (profileName: string) => void;
  onStop: (profileName: string) => void;
  onEdit: (profile: ProfileWithStatus) => void;
  onDelete: (profileName: string) => void;
  onSelect: (profile: ProfileWithStatus) => void;
  selectedProfile: string | null;
  onRefresh: () => void;
  onFilterChange: (filters: Partial<ProfilesState['filters']>) => void;
  onViewChange: (view: 'grid' | 'list') => void;
}

// Profile editor props
export interface ProfileEditorProps {
  profile: ProfileFormData | null;
  isEditing: boolean;
  validationErrors: ProfileValidationError[];
  onSave: (profile: ProfileFormData) => void;
  onCancel: () => void;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  loading: boolean;
}

// Available models for profiles
export interface AvailableModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  maxTokens?: number;
  isAvailable: boolean;
}

// Profile statistics
export interface ProfileStats {
  totalProfiles: number;
  runningProfiles: number;
  availableProfiles: number;
  errorProfiles: number;
  recentlyUsed: ProfileWithStatus[];
  popularModels: Array<{
    model: string;
    count: number;
  }>;
  commonTags: Array<{
    tag: string;
    count: number;
  }>;
}

// Export all types for easy importing
export type {
  Profile,
  ProfileWithStatus,
  ProfileFormData,
  ProfileValidationError,
  ProfileListResponse,
  ProfileResponse,
  ProfileBootResponse,
  ProfilesState,
  ProfileBootEvent,
  ProfileStatusEvent,
  ProfileService,
  ProfileAction,
  ProfileSelectors,
  ProfileCardProps,
  ProfileListProps,
  ProfileEditorProps,
  AvailableModel,
  ProfileStats,
};
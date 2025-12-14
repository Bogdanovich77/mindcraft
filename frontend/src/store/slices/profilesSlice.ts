/**
 * Profiles Redux Slice
 * 
 * Redux slice for managing profile state, including CRUD operations,
 * boot operations, and real-time updates via Socket.IO.
 */

import { createSlice, createAsyncThunk, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type {
  Profile,
  ProfileWithStatus,
  ProfileFormData,
  ProfileValidationError,
  ProfilesState,
  ProfileBootEvent,
  ProfileStatusEvent,
} from '../../types/profile';
import profileService from '../../services/profileService';

// Performance optimization: Memoized selectors to prevent unnecessary recalculations
const selectProfilesState = (state: { profiles: ProfilesState }) => state.profiles;
const selectProfilesObject = createSelector(
  [selectProfilesState],
  (profilesState) => profilesState.profiles
);

// Async thunks for profile operations
export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfiles();
      return response.data;
    } catch (error) {
      console.error('[ProfilesSlice] Failed to fetch profiles:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profiles');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'profiles/fetchProfile',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile(name);
      return response.data;
    } catch (error) {
      console.error(`[ProfilesSlice] Failed to fetch profile ${name}:`, error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile');
    }
  }
);

export const createProfile = createAsyncThunk(
  'profiles/createProfile',
  async (profile: ProfileFormData, { rejectWithValue }) => {
    try {
      // Validate profile before sending
      const validation = profileService.validateProfile(profile);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await profileService.createProfile(profile);
      return response.data;
    } catch (error) {
      console.error('[ProfilesSlice] Failed to create profile:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profiles/updateProfile',
  async ({ name, profile }: { name: string; profile: Partial<ProfileFormData> }, { rejectWithValue }) => {
    try {
      // Enhanced validation using the detailed validation method
      const validation = profileService.validateProfileDetailed(profile as ProfileFormData);
      if (!validation.isValid) {
        throw new Error(validation.errors.map(err => err.message).join(', '));
      }

      const response = await profileService.updateProfile(name, profile);
      return response.data;
    } catch (error) {
      console.error(`[ProfilesSlice] Failed to update profile ${name}:`, error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);

// New async thunk for fetching profile templates
export const fetchProfileTemplates = createAsyncThunk(
  'profiles/fetchProfileTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const templates = await profileService.getProfileTemplates();
      return templates;
    } catch (error) {
      console.error('[ProfilesSlice] Failed to fetch profile templates:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile templates');
    }
  }
);

// New async thunk for validating profile with detailed feedback
export const validateProfileDetailed = createAsyncThunk(
  'profiles/validateProfileDetailed',
  async (profile: ProfileFormData, { rejectWithValue }) => {
    try {
      const validation = profileService.validateProfileDetailed(profile);
      return { profileName: profile.name, validation };
    } catch (error) {
      console.error('[ProfilesSlice] Failed to validate profile:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to validate profile');
    }
  }
);

// New async thunk for personality analysis
export const analyzePersonality = createAsyncThunk(
  'profiles/analyzePersonality',
  async (personality: string, { rejectWithValue }) => {
    try {
      const analysis = profileService.analyzePersonality(personality);
      return analysis;
    } catch (error) {
      console.error('[ProfilesSlice] Failed to analyze personality:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to analyze personality');
    }
  }
);

export const deleteProfile = createAsyncThunk(
  'profiles/deleteProfile',
  async (name: string, { rejectWithValue }) => {
    try {
      await profileService.deleteProfile(name);
      return name;
    } catch (error) {
      console.error(`[ProfilesSlice] Failed to delete profile ${name}:`, error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete profile');
    }
  }
);

export const bootProfile = createAsyncThunk(
  'profiles/bootProfile',
  async (name: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await profileService.bootProfile(name);
      return { profileName: name, response: response.data };
    } catch (error) {
      console.error(`[ProfilesSlice] Failed to boot profile ${name}:`, error);
      // Update boot attempts on failure
      dispatch(updateProfileBootAttempts({ profileName: name, increment: true }));
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to boot profile');
    }
  }
);

export const stopProfile = createAsyncThunk(
  'profiles/stopProfile',
  async (name: string, { rejectWithValue }) => {
    try {
      await profileService.stopProfile(name);
      return name;
    } catch (error) {
      console.error(`[ProfilesSlice] Failed to stop profile ${name}:`, error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to stop profile');
    }
  }
);

export const restartProfile = createAsyncThunk(
  'profiles/restartProfile',
  async (name: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await profileService.restartProfile(name);
      return { profileName: name, response: response.data };
    } catch (error) {
      console.error(`[ProfilesSlice] Failed to restart profile ${name}:`, error);
      // Update boot attempts on failure
      dispatch(updateProfileBootAttempts({ profileName: name, increment: true }));
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to restart profile');
    }
  }
);

export const checkProfileStatus = createAsyncThunk(
  'profiles/checkProfileStatus',
  async (name: string, { rejectWithValue }) => {
    try {
      const status = await profileService.getProfileStatus(name);
      return { profileName: name, status };
    } catch (error) {
      console.error(`[ProfilesSlice] Failed to check profile status ${name}:`, error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to check profile status');
    }
  }
);

// Initialize Socket.IO listeners thunk
export const initializeProfilesSocket = createAsyncThunk(
  'profiles/initializeProfilesSocket',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Set up Socket.IO event listeners
      profileService.subscribeToProfileEvents();

      // Set up event handlers for real-time updates
      profileService.on('profileBoot', (data: ProfileBootEvent) => {
        console.log('[ProfilesSlice] Received profile boot event:', data);
        dispatch(handleProfileBootEvent(data));
      });

      profileService.on('profileStatus', (data: ProfileStatusEvent) => {
        console.log('[ProfilesSlice] Received profile status event:', data);
        dispatch(handleProfileStatusEvent(data));
      });

      // Agent lifecycle events for profile integration
      profileService.on('agent:connected', (data: any) => {
        console.log('[ProfilesSlice] Agent connected:', data);
        dispatch(updateProfileBootStatus({
          profileName: data.agentId,
          isRunning: true,
          status: 'running'
        }));
      });

      profileService.on('agent:disconnected', (data: any) => {
        console.log('[ProfilesSlice] Agent disconnected:', data);
        dispatch(updateProfileBootStatus({
          profileName: data.agentId,
          isRunning: false,
          status: 'stopped'
        }));
      });

      profileService.on('agent:status', (data: any) => {
        console.log('[ProfilesSlice] Agent status update:', data);
        dispatch(updateProfileBootStatus({
          profileName: data.agentName || data.agentId,
          isRunning: data.status === 'running' || data.status === 'online',
          status: data.status
        }));
      });

      profileService.on('profileCreated', (data: Profile) => {
        console.log('[ProfilesSlice] Received profile created event:', data);
        dispatch(addProfileFromSocket({ ...data, id: data.name }));
      });

      profileService.on('profileUpdated', (data: Profile) => {
        console.log('[ProfilesSlice] Received profile updated event:', data);
        dispatch(updateProfileFromSocket({ ...data, id: data.name }));
      });

      profileService.on('profileDeleted', (data: { name: string }) => {
        console.log('[ProfilesSlice] Received profile deleted event:', data);
        dispatch(removeProfileFromSocket(data.name));
      });

      console.log('✅ Profiles socket initialization completed');
      
      // Return serializable success payload instead of cleanup function
      // Note: Cleanup is now handled internally within the thunk
      return {
        success: true,
        message: 'Profiles socket initialization completed',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to initialize profiles socket:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize profiles socket');
    }
  }
);

// Initial state
const initialState: ProfilesState = {
  profiles: {},
  selectedProfile: null,
  loading: false,
  error: null,
  lastUpdate: null,
  
  // Boot operation state
  booting: {},
  
  // Form state for editing
  editing: {
    isEditing: false,
    profile: null,
    validationErrors: [],
    warnings: [],
    suggestions: [],
    hasUnsavedChanges: false,
    isSaving: false,
  },
  
  // Templates and presets
  templates: [],
  templatesLoading: false,
  templatesError: null,
  
  // Personality analysis
  personalityAnalysis: null,
  personalityAnalysisLoading: false,
  personalityAnalysisError: null,
  
  // Filtering and searching
  filters: {
    search: '',
    status: [],
    model: [],
    tags: [],
  },
  
  // UI state
  ui: {
    view: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    showDetails: false,
    showEditDialog: false,
    showAdvancedOptions: false,
  },
};

// Create the slice
const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    // Profile selection
    selectProfile: (state, action: PayloadAction<string>) => {
      state.selectedProfile = action.payload;
    },
    
    clearSelectedProfile: (state) => {
      state.selectedProfile = null;
    },
    
    // Loading and error states
    setProfilesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setProfilesError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearProfilesError: (state) => {
      state.error = null;
    },
    
    // Profile management
    addProfile: (state, action: PayloadAction<ProfileWithStatus>) => {
      const profile = action.payload;
      state.profiles[profile.id] = profile;
      state.lastUpdate = Date.now();
    },
    
    updateProfile: (state, action: PayloadAction<{ profileId: string; updates: Partial<ProfileWithStatus> }>) => {
      const { profileId, updates } = action.payload;
      const existingProfile = state.profiles[profileId];
      
      if (existingProfile) {
        state.profiles[profileId] = { ...existingProfile, ...updates };
        state.lastUpdate = Date.now();
      }
    },
    
    removeProfile: (state, action: PayloadAction<string>) => {
      delete state.profiles[action.payload];
      if (state.selectedProfile === action.payload) {
        state.selectedProfile = null;
      }
      state.lastUpdate = Date.now();
    },
    
    // Boot operations
    updateProfileBootStatus: (state, action: PayloadAction<{ profileName: string; isRunning: boolean; status?: string }>) => {
      const { profileName, isRunning, status } = action.payload;
      const profile = state.profiles[profileName];
      
      if (profile) {
        profile.isRunning = isRunning;
        if (status) {
          profile.status = status as any;
        }
        profile.lastUpdate = new Date().toISOString();
        state.lastUpdate = Date.now();
      }
    },
    
    updateProfileBootAttempts: (state, action: PayloadAction<{ profileName: string; increment: boolean }>) => {
      const { profileName, increment } = action.payload;
      const profile = state.profiles[profileName];
      
      if (profile) {
        profile.bootAttempts = (profile.bootAttempts || 0) + (increment ? 1 : 0);
      }
    },
    
    setProfileBooting: (state, action: PayloadAction<{ profileName: string; isBooting: boolean }>) => {
      const { profileName, isBooting } = action.payload;
      state.booting[profileName] = isBooting;
    },
    
    // Socket.IO event handlers
    handleProfileBootEvent: (state, action: PayloadAction<ProfileBootEvent>) => {
      const { profileName, status, message } = action.payload;
      const profile = state.profiles[profileName];
      
      if (profile) {
        profile.isRunning = status === 'running';
        profile.status = status as any;
        if (message) {
          profile.error = status === 'error' ? message : undefined;
        }
        profile.lastUpdate = new Date().toISOString();
      }
      
      // Clear booting state
      state.booting[profileName] = false;
      state.lastUpdate = Date.now();
    },
    
    handleProfileStatusEvent: (state, action: PayloadAction<ProfileStatusEvent>) => {
      const { profileName, status } = action.payload;
      const profile = state.profiles[profileName];
      
      if (profile) {
        profile.status = status as any;
        profile.isRunning = status === 'running';
        profile.lastUpdate = new Date().toISOString();
      }
      state.lastUpdate = Date.now();
    },
    
    addProfileFromSocket: (state, action: PayloadAction<ProfileWithStatus>) => {
      const profile = action.payload;
      state.profiles[profile.id] = {
        ...profile,
        isRunning: false,
        canBoot: true,
        bootAttempts: 0,
      };
      state.lastUpdate = Date.now();
    },
    
    updateProfileFromSocket: (state, action: PayloadAction<ProfileWithStatus>) => {
      const profile = action.payload;
      const existingProfile = state.profiles[profile.id];
      
      if (existingProfile) {
        state.profiles[profile.id] = { ...existingProfile, ...profile };
      } else {
        state.profiles[profile.id] = {
          ...profile,
          isRunning: false,
          canBoot: true,
          bootAttempts: 0,
        };
      }
      state.lastUpdate = Date.now();
    },
    
    removeProfileFromSocket: (state, action: PayloadAction<string>) => {
      delete state.profiles[action.payload];
      if (state.selectedProfile === action.payload) {
        state.selectedProfile = null;
      }
      state.lastUpdate = Date.now();
    },
    
    // Editing state
    startEditingProfile: (state, action: PayloadAction<ProfileWithStatus>) => {
      const profile = action.payload;
      state.editing.isEditing = true;
      state.editing.profile = {
        name: profile.name,
        model: profile.model,
        personality: profile.personality,
        goals: profile.goals,
        mandate: profile.mandate || '',
        description: profile.description || '',
        tags: profile.tags || [],
      };
      state.editing.validationErrors = [];
    },
    
    updateEditingProfile: (state, action: PayloadAction<Partial<ProfileFormData>>) => {
      if (state.editing.profile) {
        state.editing.profile = { ...state.editing.profile, ...action.payload };
      }
    },
    
    setValidationErrors: (state, action: PayloadAction<ProfileValidationError[]>) => {
      state.editing.validationErrors = action.payload;
    },
    
    stopEditingProfile: (state) => {
      state.editing.isEditing = false;
      state.editing.profile = null;
      state.editing.validationErrors = [];
      state.editing.warnings = [];
      state.editing.suggestions = [];
      state.editing.hasUnsavedChanges = false;
    },
    
    // Enhanced editing state management
    setEditingWarnings: (state, action: PayloadAction<string[]>) => {
      state.editing.warnings = action.payload;
    },
    
    setEditingSuggestions: (state, action: PayloadAction<string[]>) => {
      state.editing.suggestions = action.payload;
    },
    
    setHasUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.editing.hasUnsavedChanges = action.payload;
    },
    
    setEditingSaving: (state, action: PayloadAction<boolean>) => {
      state.editing.isSaving = action.payload;
    },
    
    // Template management
    setTemplates: (state, action: PayloadAction<ProfilesState['templates']>) => {
      state.templates = action.payload;
    },
    
    setTemplatesLoading: (state, action: PayloadAction<boolean>) => {
      state.templatesLoading = action.payload;
    },
    
    setTemplatesError: (state, action: PayloadAction<string | null>) => {
      state.templatesError = action.payload;
    },
    
    // Personality analysis
    setPersonalityAnalysis: (state, action: PayloadAction<ProfilesState['personalityAnalysis']>) => {
      state.personalityAnalysis = action.payload;
    },
    
    setPersonalityAnalysisLoading: (state, action: PayloadAction<boolean>) => {
      state.personalityAnalysisLoading = action.payload;
    },
    
    setPersonalityAnalysisError: (state, action: PayloadAction<string | null>) => {
      state.personalityAnalysisError = action.payload;
    },
    
    // Enhanced UI state
    setShowEditDialog: (state, action: PayloadAction<boolean>) => {
      state.ui.showEditDialog = action.payload;
    },
    
    setShowAdvancedOptions: (state, action: PayloadAction<boolean>) => {
      state.ui.showAdvancedOptions = action.payload;
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<Partial<ProfilesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: [],
        model: [],
        tags: [],
      };
    },
    
    // UI state
    setView: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.ui.view = action.payload;
    },
    
    setSortBy: (state, action: PayloadAction<ProfilesState['ui']['sortBy']>) => {
      state.ui.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.ui.sortOrder = action.payload;
    },
    
    toggleShowDetails: (state) => {
      state.ui.showDetails = !state.ui.showDetails;
    },
    
    // Bulk operations
    setProfiles: (state, action: PayloadAction<Profile[]>) => {
      const profilesObj: Record<string, ProfileWithStatus> = {};
      action.payload.forEach(profile => {
        profilesObj[profile.name] = {
          ...profile,
          id: profile.name,
          isRunning: false,
          canBoot: true,
          bootAttempts: 0,
        };
      });
      state.profiles = profilesObj;
      state.loading = false;
      state.error = null;
      state.lastUpdate = Date.now();
    },
    
    clearProfiles: (state) => {
      state.profiles = {};
      state.selectedProfile = null;
      state.booting = {};
      state.lastUpdate = Date.now();
    },
  },
  
  // Extra reducers for async thunks
  extraReducers: (builder) => {
    // Fetch profiles
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        const profilesObj: Record<string, ProfileWithStatus> = {};
        action.payload.forEach(profile => {
          profilesObj[profile.name] = {
            ...profile,
            id: profile.name,
            isRunning: false,
            canBoot: true,
            bootAttempts: 0,
          };
        });
        state.profiles = profilesObj;
        state.lastUpdate = Date.now();
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Fetch single profile
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        const profile = action.payload;
        state.profiles[profile.name] = {
          ...profile,
          id: profile.name,
          isRunning: false,
          canBoot: true,
          bootAttempts: 0,
        };
        state.lastUpdate = Date.now();
      });
    
    // Create profile
    builder
      .addCase(createProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.loading = false;
        const profile = action.payload;
        state.profiles[profile.name] = {
          ...profile,
          id: profile.name,
          isRunning: false,
          canBoot: true,
          bootAttempts: 0,
        };
        state.lastUpdate = Date.now();
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        const profile = action.payload;
        const existingProfile = state.profiles[profile.name];
        if (existingProfile) {
          state.profiles[profile.name] = { ...existingProfile, ...profile };
        }
        state.lastUpdate = Date.now();
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Delete profile
    builder
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.loading = false;
        const profileName = action.payload;
        delete state.profiles[profileName];
        if (state.selectedProfile === profileName) {
          state.selectedProfile = null;
        }
        state.lastUpdate = Date.now();
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Boot profile
    builder
      .addCase(bootProfile.pending, (state, action) => {
        const profileName = action.meta.arg;
        state.booting[profileName] = true;
        state.error = null;
      })
      .addCase(bootProfile.fulfilled, (state, action) => {
        const { profileName } = action.payload;
        state.booting[profileName] = false;
        const profile = state.profiles[profileName];
        if (profile) {
          profile.isRunning = true;
          profile.status = 'running';
          profile.lastUpdate = new Date().toISOString();
        }
        state.lastUpdate = Date.now();
      })
      .addCase(bootProfile.rejected, (state, action) => {
        const profileName = action.meta.arg;
        state.booting[profileName] = false;
        state.error = action.payload as string;
        const profile = state.profiles[profileName];
        if (profile) {
          profile.bootAttempts = (profile.bootAttempts || 0) + 1;
        }
      });
    
    // Stop profile
    builder
      .addCase(stopProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopProfile.fulfilled, (state, action) => {
        state.loading = false;
        const profileName = action.payload;
        const profile = state.profiles[profileName];
        if (profile) {
          profile.isRunning = false;
          profile.status = 'stopped';
          profile.lastUpdate = new Date().toISOString();
        }
        state.lastUpdate = Date.now();
      })
      .addCase(stopProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Restart profile
    builder
      .addCase(restartProfile.pending, (state, action) => {
        const profileName = action.meta.arg;
        state.booting[profileName] = true;
        state.error = null;
      })
      .addCase(restartProfile.fulfilled, (state, action) => {
        const { profileName } = action.payload;
        state.booting[profileName] = false;
        const profile = state.profiles[profileName];
        if (profile) {
          profile.isRunning = true;
          profile.status = 'running';
          profile.lastUpdate = new Date().toISOString();
        }
        state.lastUpdate = Date.now();
      })
      .addCase(restartProfile.rejected, (state, action) => {
        const profileName = action.meta.arg;
        state.booting[profileName] = false;
        state.error = action.payload as string;
        const profile = state.profiles[profileName];
        if (profile) {
          profile.bootAttempts = (profile.bootAttempts || 0) + 1;
        }
      });
    
    // Check profile status
    builder
      .addCase(checkProfileStatus.fulfilled, (state, action) => {
        const { profileName, status } = action.payload;
        const profile = state.profiles[profileName];
        if (profile) {
          profile.isRunning = status.isRunning;
          profile.status = status.status as any;
          profile.lastUpdate = new Date().toISOString();
        }
        state.lastUpdate = Date.now();
      })
      .addCase(checkProfileStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Initialize socket
    builder
      .addCase(initializeProfilesSocket.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeProfilesSocket.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initializeProfilesSocket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Fetch profile templates
    builder
      .addCase(fetchProfileTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(fetchProfileTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchProfileTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.payload as string;
      });
    
    // Validate profile detailed
    builder
      .addCase(validateProfileDetailed.fulfilled, (state, action) => {
        const { profileName, validation } = action.payload;
        // Only update if this is the currently editing profile
        if (state.editing.profile && state.editing.profile.name === profileName) {
          state.editing.validationErrors = validation.errors;
          state.editing.warnings = validation.warnings;
          state.editing.suggestions = validation.suggestions;
        }
      })
      .addCase(validateProfileDetailed.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Analyze personality
    builder
      .addCase(analyzePersonality.pending, (state) => {
        state.personalityAnalysisLoading = true;
        state.personalityAnalysisError = null;
      })
      .addCase(analyzePersonality.fulfilled, (state, action) => {
        state.personalityAnalysisLoading = false;
        state.personalityAnalysis = action.payload;
      })
      .addCase(analyzePersonality.rejected, (state, action) => {
        state.personalityAnalysisLoading = false;
        state.personalityAnalysisError = action.payload as string;
      });
  },
});

// Export actions
export const {
  selectProfile,
  clearSelectedProfile,
  setProfilesLoading,
  setProfilesError,
  clearProfilesError,
  addProfile,
  removeProfile,
  updateProfileBootStatus,
  updateProfileBootAttempts,
  setProfileBooting,
  handleProfileBootEvent,
  handleProfileStatusEvent,
  addProfileFromSocket,
  updateProfileFromSocket,
  removeProfileFromSocket,
  startEditingProfile,
  updateEditingProfile,
  setValidationErrors,
  stopEditingProfile,
  setEditingWarnings,
  setEditingSuggestions,
  setHasUnsavedChanges,
  setEditingSaving,
  setTemplates,
  setTemplatesLoading,
  setTemplatesError,
  setPersonalityAnalysis,
  setPersonalityAnalysisLoading,
  setPersonalityAnalysisError,
  setShowEditDialog,
  setShowAdvancedOptions,
  setFilters,
  clearFilters,
  setView,
  setSortBy,
  setSortOrder,
  toggleShowDetails,
  setProfiles,
  clearProfiles,
} = profilesSlice.actions;

// Export reducer
export default profilesSlice.reducer;

// Performance optimized selectors
export const selectAllProfiles = createSelector(
  [selectProfilesObject],
  (profiles) => Object.values(profiles)
);

export const selectProfileById = createSelector(
  [selectProfilesObject, (state: { profiles: ProfilesState }, profileId: string) => profileId],
  (profiles, profileId) => profiles[profileId]
);

export const selectSelectedProfile = createSelector(
  [selectProfilesObject, (state: { profiles: ProfilesState }) => state.profiles.selectedProfile],
  (profiles, selectedId) => selectedId ? profiles[selectedId] || null : null
);

export const selectProfilesLoading = (state: { profiles: ProfilesState }) => state.profiles.loading;

export const selectProfilesError = (state: { profiles: ProfilesState }) => state.profiles.error;

// Filtered and sorted profiles selector
export const selectFilteredProfiles = createSelector(
  [selectAllProfiles, (state: { profiles: ProfilesState }) => state.profiles.filters, (state: { profiles: ProfilesState }) => state.profiles.ui],
  (profiles, filters, ui) => {
    let filtered = profiles;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(searchLower) ||
        profile.personality.toLowerCase().includes(searchLower) ||
        profile.goals.toLowerCase().includes(searchLower) ||
        (profile.description && profile.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(profile => filters.status.includes(profile.status || 'available'));
    }

    // Apply model filter
    if (filters.model.length > 0) {
      filtered = filtered.filter(profile => filters.model.includes(profile.model));
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(profile =>
        profile.tags && filters.tags.some(tag => profile.tags!.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[ui.sortBy as keyof ProfileWithStatus];
      let bValue: any = b[ui.sortBy as keyof ProfileWithStatus];

      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      // Handle date comparison
      if (ui.sortBy === 'lastUsed' || ui.sortBy === 'createdAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (ui.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }
);

// Profile statistics selector
export const selectProfileStats = createSelector(
  [selectAllProfiles],
  (profiles) => ({
    totalProfiles: profiles.length,
    runningProfiles: profiles.filter(p => p.isRunning).length,
    availableProfiles: profiles.filter(p => !p.isRunning && p.status !== 'error').length,
    errorProfiles: profiles.filter(p => p.status === 'error').length,
    recentlyUsed: profiles
      .filter(p => p.lastUsed)
      .sort((a, b) => new Date(b.lastUsed || 0).getTime() - new Date(a.lastUsed || 0).getTime())
      .slice(0, 5),
    popularModels: Object.entries(
      profiles.reduce((acc, profile) => {
        acc[profile.model] = (acc[profile.model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    commonTags: Object.entries(
      profiles.reduce((acc, profile) => {
        profile.tags?.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  })
);

// Boot operation selectors
export const selectBootingProfiles = createSelector(
  [(state: { profiles: ProfilesState }) => state.profiles.booting],
  (booting) => Object.entries(booting).filter(([_, isBooting]) => isBooting).map(([name]) => name)
);

export const selectIsProfileBooting = createSelector(
  [(state: { profiles: ProfilesState }) => state.profiles.booting, (state: { profiles: ProfilesState }, profileName: string) => profileName],
  (booting, profileName) => booting[profileName] || false
);
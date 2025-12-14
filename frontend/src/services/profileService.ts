/**
 * Profile Service
 * 
 * Service layer for profile management operations, integrating with both
 * REST endpoints and Socket.IO events for real-time updates.
 */

import type {
  Profile,
  ProfileWithStatus,
  ProfileFormData,
  ProfileListResponse,
  ProfileResponse,
  ProfileBootResponse,
  ProfileBootEvent,
  ProfileStatusEvent,
  ProfileService as IProfileService,
} from '../types/profile';

import { getSocketService } from './socketService';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_TIMEOUT = 30000; // 30 seconds timeout

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * Utility function for API requests with retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // Retry logic for network errors and timeouts
    if (
      retryCount < RETRY_CONFIG.maxRetries &&
      (error instanceof Error) &&
      (error.name === 'AbortError' || error.message.includes('fetch') || error.message.includes('network'))
    ) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount),
        RETRY_CONFIG.maxDelay
      );
      
      console.warn(`[ProfileService] Request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries}):`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry<T>(url, options, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Profile Service implementation
 */
class ProfileService implements IProfileService {
  private socketService = getSocketService();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupSocketListeners();
  }

  /**
   * Set up Socket.IO event listeners for real-time profile updates
   */
  private setupSocketListeners(): void {
    if (!this.socketService) {
      console.warn('[ProfileService] Socket service not available');
      return;
    }

    // Profile boot events
    this.socketService.on('profile:boot', (data: ProfileBootEvent) => {
      console.log('[ProfileService] Profile boot event:', data);
      this.emit('profileBoot', data);
    });

    // Profile status events
    this.socketService.on('profile:status', (data: ProfileStatusEvent) => {
      console.log('[ProfileService] Profile status event:', data);
      this.emit('profileStatus', data);
    });

    // Profile created/updated/deleted events
    this.socketService.on('profile:created', (data: Profile) => {
      console.log('[ProfileService] Profile created event:', data);
      this.emit('profileCreated', data);
    });

    this.socketService.on('profile:updated', (data: Profile) => {
      console.log('[ProfileService] Profile updated event:', data);
      this.emit('profileUpdated', data);
    });

    this.socketService.on('profile:deleted', (data: { name: string }) => {
      console.log('[ProfileService] Profile deleted event:', data);
      this.emit('profileDeleted', data);
    });
  }

  /**
   * Event listener management
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const callbacks = this.eventListeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.eventListeners.set(event, []);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[ProfileService] Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * REST API Methods
   */

  async getProfiles(): Promise<ProfileListResponse> {
    try {
      console.log('[ProfileService] Fetching profiles...');
      const response = await fetchWithRetry<ProfileListResponse>(`${API_BASE_URL}/profiles`);
      
      // Transform backend profiles to include status information
      const profilesWithStatus: ProfileWithStatus[] = response.data.map(profile => ({
        ...profile,
        id: profile.name,
        isRunning: false, // Will be updated by Socket.IO events
        canBoot: true,
        bootAttempts: 0,
      }));

      return {
        ...response,
        data: profilesWithStatus as Profile[], // Return base Profile type for API compatibility
      };
    } catch (error) {
      console.error('[ProfileService] Failed to fetch profiles:', error);
      throw new Error(`Failed to fetch profiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProfile(name: string): Promise<ProfileResponse> {
    try {
      console.log(`[ProfileService] Fetching profile: ${name}`);
      const response = await fetchWithRetry<ProfileResponse>(`${API_BASE_URL}/profiles/${encodeURIComponent(name)}`);
      
      // Add ID field for frontend consistency
      const profileWithId = {
        ...response.data,
        id: response.data.name,
      };

      return {
        ...response,
        data: profileWithId,
      };
    } catch (error) {
      console.error(`[ProfileService] Failed to fetch profile ${name}:`, error);
      throw new Error(`Failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createProfile(profile: ProfileFormData): Promise<ProfileResponse> {
    try {
      console.log('[ProfileService] Creating profile:', profile.name);
      const response = await fetchWithRetry<ProfileResponse>(`${API_BASE_URL}/profiles`, {
        method: 'POST',
        body: JSON.stringify(profile),
      });

      // Add ID field for frontend consistency
      const profileWithId = {
        ...response.data,
        id: response.data.name,
      };

      return {
        ...response,
        data: profileWithId,
      };
    } catch (error) {
      console.error('[ProfileService] Failed to create profile:', error);
      throw new Error(`Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateProfile(name: string, profile: Partial<ProfileFormData>): Promise<ProfileResponse> {
    try {
      console.log(`[ProfileService] Updating profile: ${name}`);
      const response = await fetchWithRetry<ProfileResponse>(`${API_BASE_URL}/profiles/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });

      // Add ID field for frontend consistency
      const profileWithId = {
        ...response.data,
        id: response.data.name,
      };

      return {
        ...response,
        data: profileWithId,
      };
    } catch (error) {
      console.error(`[ProfileService] Failed to update profile ${name}:`, error);
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteProfile(name: string): Promise<void> {
    try {
      console.log(`[ProfileService] Deleting profile: ${name}`);
      await fetchWithRetry<void>(`${API_BASE_URL}/profiles/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`[ProfileService] Failed to delete profile ${name}:`, error);
      throw new Error(`Failed to delete profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Boot Operations
   */

  async bootProfile(name: string): Promise<ProfileBootResponse> {
    try {
      console.log(`[ProfileService] Booting profile: ${name}`);
      
      // Use Socket.IO for boot operation to get real-time feedback
      if (this.socketService) {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            this.socketService?.off('profile:boot', handleBootResponse);
            reject(new Error('Boot operation timeout'));
          }, 30000);

          const handleBootResponse = (data: any) => {
            if (data.profileName === name) {
              clearTimeout(timeout);
              this.socketService?.off('profile:boot', handleBootResponse);
              
              if (data.status === 'error') {
                reject(new Error(data.message || 'Boot failed'));
              } else {
                resolve({
                  success: true,
                  data: {
                    agentId: data.agentId || name,
                    profileName: data.profileName || name,
                    status: data.status as 'booting' | 'running' | 'error',
                    message: data.message || '',
                  },
                  meta: {
                    timestamp: new Date().toISOString(),
                    requestId: `boot_${Date.now()}`,
                    version: '1.0.0',
                  },
                });
              }
            }
          };

          this.socketService.on('profile:boot', handleBootResponse);
          this.socketService.send('create-agent-from-profile', { profileName: name });
        });
      } else {
        // Fallback to REST API
        const response = await fetchWithRetry<ProfileBootResponse>(`${API_BASE_URL}/profiles/${encodeURIComponent(name)}/boot`, {
          method: 'POST',
        });
        return response;
      }
    } catch (error) {
      console.error(`[ProfileService] Failed to boot profile ${name}:`, error);
      throw new Error(`Failed to boot profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopProfile(name: string): Promise<void> {
    try {
      console.log(`[ProfileService] Stopping profile: ${name}`);
      
      if (this.socketService) {
        // Use Socket.IO for real-time stop operation
        this.socketService.send('stop-agent', { agentName: name });
      } else {
        // Fallback to REST API
        await fetchWithRetry<void>(`${API_BASE_URL}/profiles/${encodeURIComponent(name)}/stop`, {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error(`[ProfileService] Failed to stop profile ${name}:`, error);
      throw new Error(`Failed to stop profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async restartProfile(name: string): Promise<ProfileBootResponse> {
    try {
      console.log(`[ProfileService] Restarting profile: ${name}`);
      
      // First stop the profile if it's running
      await this.stopProfile(name);
      
      // Wait a brief moment for the stop to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then boot it again
      return await this.bootProfile(name);
    } catch (error) {
      console.error(`[ProfileService] Failed to restart profile ${name}:`, error);
      throw new Error(`Failed to restart profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProfileStatus(name: string): Promise<{ status: string; isRunning: boolean; agentId?: string }> {
    try {
      console.log(`[ProfileService] Getting profile status: ${name}`);
      
      if (this.socketService) {
        // Use Socket.IO for real-time status check
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            this.socketService?.off('agent:status', handleStatusResponse);
            reject(new Error('Status check timeout'));
          }, 5000);

          const handleStatusResponse = (data: any) => {
            if (data.agentName === name || data.agentId === name) {
              clearTimeout(timeout);
              this.socketService?.off('agent:status', handleStatusResponse);
              
              resolve({
                status: data.status || 'unknown',
                isRunning: data.status === 'running' || data.status === 'online',
                agentId: data.agentId || name,
              });
            }
          };

          this.socketService.on('agent:status', handleStatusResponse);
          this.socketService.send('get-agent-status', { agentName: name });
        });
      } else {
        // Fallback to REST API
        const response = await fetchWithRetry<{ status: string; isRunning: boolean; agentId?: string }>(
          `${API_BASE_URL}/profiles/${encodeURIComponent(name)}/status`
        );
        return response;
      }
    } catch (error) {
      console.error(`[ProfileService] Failed to get profile status ${name}:`, error);
      throw new Error(`Failed to get profile status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Socket.IO Integration
   */

  subscribeToProfileEvents(): void {
    if (!this.socketService) {
      console.warn('[ProfileService] Cannot subscribe to profile events - socket service not available');
      return;
    }

    console.log('[ProfileService] Subscribing to profile events');
    
    // Request initial profile status
    this.socketService.send('get-profiles', {});
    
    // Subscribe to profile-specific events
    this.socketService.send('subscribe', { events: ['profile:*'] });
  }

  unsubscribeFromProfileEvents(): void {
    if (!this.socketService) return;

    console.log('[ProfileService] Unsubscribing from profile events');
    
    // Unsubscribe from profile events
    this.socketService.send('unsubscribe', { events: ['profile:*'] });
  }

  /**
   * Utility Methods
   */

  /**
   * Validate profile data before sending to API
   */
  validateProfile(profile: ProfileFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!profile.name || profile.name.trim().length === 0) {
      errors.push('Profile name is required');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(profile.name)) {
      errors.push('Profile name can only contain letters, numbers, underscores, and hyphens');
    }

    if (!profile.model || profile.model.trim().length === 0) {
      errors.push('Model selection is required');
    }

    if (!profile.personality || profile.personality.trim().length === 0) {
      errors.push('Personality description is required');
    }

    if (!profile.goals || profile.goals.trim().length === 0) {
      errors.push('Goals description is required');
    }

    if (profile.personality && profile.personality.length > 1000) {
      errors.push('Personality description must be less than 1000 characters');
    }

    if (profile.goals && profile.goals.length > 1000) {
      errors.push('Goals description must be less than 1000 characters');
    }

    if (profile.mandate && profile.mandate.length > 500) {
      errors.push('Mandate description must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get available models from the API
   */
  async getAvailableModels(): Promise<Array<{ id: string; name: string; provider: string }>> {
    try {
      const response = await fetchWithRetry<{ models: Array<{ id: string; name: string; provider: string }> }>(
        `${API_BASE_URL}/models`
      );
      return response.models;
    } catch (error) {
      console.error('[ProfileService] Failed to fetch available models:', error);
      // Return fallback models
      return [
        { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
        { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic' },
      ];
    }
  }

  /**
   * Get profile templates for quick setup
   */
  async getProfileTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    profile: Partial<ProfileFormData>;
  }>> {
    try {
      // In a real implementation, this would fetch from the API
      // For now, return hardcoded templates
      const templates = [
        {
          id: 'warrior',
          name: 'Warrior Bot',
          description: 'A combat-focused bot for protection and defense',
          profile: {
            personality: 'Aggressive, competitive, bold, and dominant. Focuses on combat and winning. Takes charge of situations and never backs down from a challenge.',
            goals: 'Protect the base, defeat enemies, gather weapons and armor',
            mandate: 'Defend the team and eliminate threats',
            description: 'Combat-focused bot for protection and defense',
            tags: ['warrior', 'combat', 'protection'],
          },
        },
        {
          id: 'builder',
          name: 'Builder Bot',
          description: 'A construction-focused bot for building and crafting',
          profile: {
            personality: 'Creative, skilled, focused on building and crafting. Takes pride in creating impressive structures.',
            goals: 'Build impressive structures, gather materials, improve construction techniques',
            mandate: 'Construct and maintain the base',
            description: 'Construction-focused bot for building and crafting',
            tags: ['builder', 'construction', 'crafting'],
          },
        },
        {
          id: 'explorer',
          name: 'Explorer Bot',
          description: 'An adventurous bot for exploration and discovery',
          profile: {
            personality: 'Curious, inquisitive, adventurous, and eager to learn. Loves exploring new areas and discovering interesting things.',
            goals: 'Explore new areas, discover resources, map the world',
            mandate: 'Explore and report back discoveries',
            description: 'Adventurous bot for exploration and discovery',
            tags: ['explorer', 'adventure', 'discovery'],
          },
        },
        {
          id: 'farmer',
          name: 'Farmer Bot',
          description: 'A hardworking bot for farming and resource gathering',
          profile: {
            personality: 'Hardworking, patient, reliable, and focused on sustainable growth. Takes pride in cultivating crops and managing resources.',
            goals: 'Grow crops, raise animals, manage food production',
            mandate: 'Ensure food security and resource sustainability',
            description: 'Hardworking bot for farming and resource gathering',
            tags: ['farmer', 'agriculture', 'resources'],
          },
        },
        {
          id: 'trader',
          name: 'Trader Bot',
          description: 'A social bot focused on trade and commerce',
          profile: {
            personality: 'Friendly, persuasive, sociable, and business-oriented. Enjoys negotiating deals and building trade relationships.',
            goals: 'Establish trade routes, negotiate deals, manage inventory',
            mandate: 'Maximize trade profits and build commercial relationships',
            description: 'Social bot focused on trade and commerce',
            tags: ['trader', 'commerce', 'social'],
          },
        },
      ];

      return templates;
    } catch (error) {
      console.error('[ProfileService] Failed to fetch profile templates:', error);
      return [];
    }
  }

  /**
   * Enhanced profile validation with detailed feedback
   */
  validateProfileDetailed(profile: ProfileFormData): {
    isValid: boolean;
    errors: ProfileValidationError[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: ProfileValidationError[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Name validation
    if (!profile.name || profile.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Profile name is required' });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(profile.name)) {
      errors.push({ field: 'name', message: 'Profile name can only contain letters, numbers, underscores, and hyphens' });
    } else if (profile.name.length < 3) {
      warnings.push('Profile name should be at least 3 characters long');
    } else if (profile.name.length > 50) {
      warnings.push('Profile name should be less than 50 characters');
    }

    // Model validation
    if (!profile.model || profile.model.trim().length === 0) {
      errors.push({ field: 'model', message: 'Model selection is required' });
    }

    // Personality validation
    if (!profile.personality || profile.personality.trim().length === 0) {
      errors.push({ field: 'personality', message: 'Personality description is required' });
    } else if (profile.personality.length < 20) {
      warnings.push('Personality description should be more detailed (at least 20 characters)');
    } else if (profile.personality.length > 1000) {
      errors.push({ field: 'personality', message: 'Personality description must be less than 1000 characters' });
    }

    // Goals validation
    if (!profile.goals || profile.goals.trim().length === 0) {
      errors.push({ field: 'goals', message: 'Goals description is required' });
    } else if (profile.goals.length < 10) {
      warnings.push('Goals description should be more specific (at least 10 characters)');
    } else if (profile.goals.length > 1000) {
      errors.push({ field: 'goals', message: 'Goals description must be less than 1000 characters' });
    }

    // Mandate validation
    if (profile.mandate && profile.mandate.length > 500) {
      errors.push({ field: 'mandate', message: 'Mandate description must be less than 500 characters' });
    }

    // Description validation
    if (profile.description && profile.description.length > 500) {
      warnings.push('Description should be less than 500 characters');
    }

    // Tags validation
    if (profile.tags && profile.tags.length > 10) {
      warnings.push('Consider using fewer than 10 tags for better organization');
    }

    // Generate suggestions
    if (profile.personality && !profile.personality.toLowerCase().includes('speaks') &&
        !profile.personality.toLowerCase().includes('talks') &&
        !profile.personality.toLowerCase().includes('communicates')) {
      suggestions.push('Consider adding information about how the bot speaks or communicates');
    }

    if (profile.goals && !profile.goals.toLowerCase().includes('help') &&
        !profile.goals.toLowerCase().includes('assist') &&
        !profile.goals.toLowerCase().includes('support')) {
      suggestions.push('Consider mentioning how the bot helps or assists others');
    }

    if (!profile.tags || profile.tags.length === 0) {
      suggestions.push('Add tags to help categorize and find this profile later');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Get personality analysis based on description
   */
  analyzePersonality(personality: string): {
    traits: string[];
    tone: string;
    socialStyle: string;
    confidence: 'high' | 'medium' | 'low';
  } {
    const lowerPersonality = personality.toLowerCase();
    
    // Extract traits
    const traits: string[] = [];
    const traitKeywords = {
      'friendly': ['friendly', 'helpful', 'cheerful', 'warm', 'welcoming'],
      'aggressive': ['aggressive', 'dominant', 'bold', 'competitive'],
      'curious': ['curious', 'inquisitive', 'eager to learn', 'exploring'],
      'lazy': ['lazy', 'laid-back', 'unmotivated', 'relaxed'],
      'nervous': ['nervous', 'anxious', 'cautious', 'worried'],
      'creative': ['creative', 'imaginative', 'artistic', 'innovative'],
      'reliable': ['reliable', 'dependable', 'trustworthy', 'consistent'],
    };

    Object.entries(traitKeywords).forEach(([trait, keywords]) => {
      if (keywords.some(keyword => lowerPersonality.includes(keyword))) {
        traits.push(trait);
      }
    });

    // Determine tone
    let tone = 'neutral';
    if (lowerPersonality.includes('cheerful') || lowerPersonality.includes('enthusiastic')) {
      tone = 'positive';
    } else if (lowerPersonality.includes('grumpy') || lowerPersonality.includes('irritable')) {
      tone = 'negative';
    } else if (lowerPersonality.includes('sarcastic') || lowerPersonality.includes('cynical')) {
      tone = 'sarcastic';
    }

    // Determine social style
    let socialStyle = 'balanced';
    if (lowerPersonality.includes('prefers working alone') || lowerPersonality.includes('introvert')) {
      socialStyle = 'introverted';
    } else if (lowerPersonality.includes('enjoys working in teams') || lowerPersonality.includes('sociable')) {
      socialStyle = 'extroverted';
    }

    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (lowerPersonality.includes('confident') || lowerPersonality.includes('assertive') ||
        lowerPersonality.includes('takes charge')) {
      confidence = 'high';
    } else if (lowerPersonality.includes('hesitant') || lowerPersonality.includes('uncertain') ||
        lowerPersonality.includes('nervous')) {
      confidence = 'low';
    }

    return {
      traits,
      tone,
      socialStyle,
      confidence,
    };
  }

  /**
   * Cleanup method to remove event listeners
   */
  destroy(): void {
    console.log('[ProfileService] Cleaning up service');
    this.eventListeners.clear();
    this.unsubscribeFromProfileEvents();
  }
}

// Create and export singleton instance
const profileService = new ProfileService();

export { ProfileService };
export default profileService;
import type { WorldContext, MemoryQuery } from '../langgraph/interfaces.js';
import type { MemorySystem } from './memory_system.js';

/**
 * Bridge for migrating from legacy MemoryBank to enhanced memory system
 */
export class MemoryBridge {
  private migrationLog: MigrationRecord[] = [];
  
  constructor() {
    console.log('MemoryBridge initialized for legacy compatibility');
  }
  
  /**
   * Migrate legacy memory bank data to new memory system
   */
  async migrateLegacyMemory(legacyMemoryBank: any, memorySystem: MemorySystem): Promise<void> {
    const migrationStart = Date.now();
    let migratedLocations = 0;
    let migratedConcepts = 0;
    let errors: string[] = [];
    let locationData: any = {};
    
    try {
      console.log('Starting legacy memory migration...');
      
      // Migrate location data (primary legacy function)
      if (legacyMemoryBank.memory && typeof legacyMemoryBank.memory === 'object') {
        locationData = legacyMemoryBank.memory;
        
        for (const [name, location] of Object.entries(locationData)) {
          try {
            await this.migrateLocation(name, location as any, memorySystem);
            migratedLocations++;
          } catch (error) {
            errors.push(`Failed to migrate location ${name}: ${error}`);
          }
        }
      }
      
      // Migrate any additional data structures
      if (legacyMemoryBank.locations) {
        for (const [name, data] of Object.entries(legacyMemoryBank.locations)) {
          try {
            await this.migrateExtendedLocationData(name, data as any, memorySystem);
            migratedConcepts++;
          } catch (error) {
            errors.push(`Failed to migrate extended data for ${name}: ${error}`);
          }
        }
      }
      
      // Create semantic concepts for important locations
      await this.createLocationConcepts(locationData, memorySystem);
      
      const migrationTime = Date.now() - migrationStart;
      
      // Record migration
      this.migrationLog.push({
        timestamp: migrationStart,
        duration: migrationTime,
        locationsMigrated: migratedLocations,
        conceptsCreated: migratedConcepts,
        errors: errors.length,
        success: errors.length === 0
      });
      
      console.log(`Migration completed in ${migrationTime}ms. ` +
                 `Migrated ${migratedLocations} locations, ` +
                 `created ${migratedConcepts} concepts, ` +
                 `${errors.length} errors.`);
      
      if (errors.length > 0) {
        console.warn('Migration errors:', errors);
      }
      
    } catch (error) {
      console.error('Critical migration error:', error);
      this.migrationLog.push({
        timestamp: migrationStart,
        duration: Date.now() - migrationStart,
        locationsMigrated: migratedLocations,
        conceptsCreated: migratedConcepts,
        errors: 1,
        success: false
      });
      throw error;
    }
  }
  
  /**
   * Create legacy-compatible wrapper for new memory system
   */
  createLegacyWrapper(memorySystem: MemorySystem): LegacyMemoryBankWrapper {
    return new LegacyMemoryBankWrapper(memorySystem);
  }
  
  /**
   * Get migration statistics
   */
  getMigrationStatistics(): MigrationStatistics {
    const successful = this.migrationLog.filter(log => log.success);
    const failed = this.migrationLog.filter(log => !log.success);
    
    const totalLocations = this.migrationLog.reduce((sum, log) => sum + log.locationsMigrated, 0);
    const totalConcepts = this.migrationLog.reduce((sum, log) => sum + log.conceptsCreated, 0);
    const totalErrors = this.migrationLog.reduce((sum, log) => sum + log.errors, 0);
    
    const lastLogEntry = this.migrationLog.length > 0 
      ? this.migrationLog[this.migrationLog.length - 1] 
      : null;
    
    return {
      totalMigrations: this.migrationLog.length,
      successfulMigrations: successful.length,
      failedMigrations: failed.length,
      totalLocationsMigrated: totalLocations,
      totalConceptsCreated: totalConcepts,
      totalErrors,
      lastMigration: lastLogEntry ? lastLogEntry.timestamp : 0
    };
  }
  
  /**
   * Export current memory state to legacy format
   */
  async exportToLegacyFormat(memorySystem: MemorySystem): Promise<any> {
    const legacyFormat: any = {
      memory: {}, // Primary location storage
      metadata: {
        exportedAt: Date.now(),
        version: '2.0',
        source: 'enhanced_memory_system'
      }
    };
    
    try {
      // Query semantic memory for location concepts
      const locationQuery: MemoryQuery = {
        query: 'location',
        type: 'semantic',
        criteria: {},
        filters: { type: 'semantic' },
        limit: 100
      };
      
      const semanticResults = await memorySystem.query(locationQuery);
      
      // Extract location data from semantic concepts
      if (semanticResults.semantic && Array.isArray(semanticResults.semantic)) {
        for (const concept of semanticResults.semantic) {
          if (concept.attributes && concept.attributes.location) {
            const location = concept.attributes.location;
            legacyFormat.memory[concept.name] = {
              x: location.x || 0,
              y: location.y || 64,
              z: location.z || 0,
              type: concept.attributes.type || 'unknown',
              importance: concept.importance,
              description: concept.attributes.description || ''
            };
          }
        }
      }
      
      // Add episodic location memories
      const episodicQuery: MemoryQuery = {
        query: 'location',
        type: 'episodic',
        criteria: {},
        filters: { type: 'episodic' },
        limit: 50
      };
      
      const episodicResults = await memorySystem.query(episodicQuery);
      
      if (episodicResults.episodic && Array.isArray(episodicResults.episodic)) {
        for (const event of episodicResults.episodic) {
          if (event.location && !legacyFormat.memory[`event_${event.id}`]) {
            legacyFormat.memory[`event_${event.id}`] = {
              x: event.location.x,
              y: event.location.y,
              z: event.location.z,
              type: 'event_location',
              timestamp: event.timestamp,
              importance: event.importance,
              description: `${event.tags && event.tags[0] ? event.tags[0] : 'event'}: ${event.actions && event.actions[0] ? event.actions[0].action : 'unknown action'}`
            };
          }
        }
      }
      
      console.log(`Exported ${Object.keys(legacyFormat.memory).length} locations to legacy format`);
      return legacyFormat;
      
    } catch (error) {
      console.error('Failed to export to legacy format:', error);
      throw error;
    }
  }
  
  /**
   * Private helper methods
   */
  private async migrateLocation(name: string, location: any, memorySystem: MemorySystem): Promise<void> {
    // Create semantic concept for location
    const locationConcept = {
      id: `location_${name}`,
      name,
      type: 'entity' as const,
      activation: 0.7,
      attributes: {
        location: {
          x: location.x || 0,
          y: location.y || 64,
          z: location.z || 0
        },
        type: location.type || 'location',
        discovered: Date.now(),
        legacy: true
      },
      relationships: [],
      lastAccessed: Date.now(),
      importance: location.importance || 0.5
    };
    
    await memorySystem.storeSemanticConcept(locationConcept);
    
    // Create episodic event for location discovery
    const discoveryEvent = {
      id: `discovery_${name}_${Date.now()}`,
      timestamp: Date.now(),
      duration: 0,
      location: {
        x: location.x || 0,
        y: location.y || 64,
        z: location.z || 0
      },
      participants: ['player'],
      actions: [{
        actor: 'player',
        action: 'discover_location',
        target: name,
        timestamp: Date.now(),
        result: 'location_found'
      }],
      outcomes: ['location_discovered'],
      emotionalImpact: 0.3,
      importance: location.importance || 0.5,
      tags: ['discovery', 'location', 'migration'],
      type: 'location_discovery',
      action: 'discover_location',
      outcome: 'location_discovered',
      success: true
    };
    
    await memorySystem.storeEvent(discoveryEvent);
  }
  
  private async migrateExtendedLocationData(name: string, data: any, memorySystem: MemorySystem): Promise<void> {
    // Create enhanced semantic concept with additional data
    const enhancedConcept = {
      id: `enhanced_${name}`,
      name,
      type: 'schema' as const,
      activation: 0.6,
      attributes: {
        ...data,
        migrated: true,
        migrationTime: Date.now()
      },
      relationships: [],
      lastAccessed: Date.now(),
      importance: data.importance || 0.4
    };
    
    await memorySystem.storeSemanticConcept(enhancedConcept);
  }
  
  private async createLocationConcepts(locationData: any, memorySystem: MemorySystem): Promise<void> {
    // Create general location concepts
    const locationTypes = new Set<string>();
    
    for (const [name, location] of Object.entries(locationData)) {
      const loc = location as any;
      if (loc.type) {
        locationTypes.add(loc.type);
      }
    }
    
    // Create concepts for each location type
    for (const type of Array.from(locationTypes)) {
      const typeConcept = {
        id: `location_type_${type}`,
        name: `${type}_location`,
        type: 'schema' as const,
        activation: 0.5,
        attributes: {
          category: 'location',
          locationType: type,
          count: Array.from(Object.values(locationData)).filter((loc: any) => loc.type === type).length
        },
        relationships: [],
        lastAccessed: Date.now(),
        importance: 0.6
      };
      
      await memorySystem.storeSemanticConcept(typeConcept);
    }
  }
}

/**
 * Legacy-compatible wrapper for the new memory system
 */
export class LegacyMemoryBankWrapper {
  private memorySystem: MemorySystem;
  private cache: Map<string, { x: number; y: number; z: number }> = new Map();
  private cacheTimeout: number = 60000; // 1 minute cache
  
  constructor(memorySystem: MemorySystem) {
    this.memorySystem = memorySystem;
  }
  
  /**
   * Legacy remember function - stores location
   */
  async remember(name: string, x: number, y: number, z: number): Promise<void> {
    try {
      // Store in new semantic memory
      const locationConcept = {
        id: `location_${name}`,
        name,
        type: 'entity' as const,
        activation: 0.8,
        attributes: {
          location: { x, y, z },
          type: 'remembered_location',
          rememberedAt: Date.now()
        },
        relationships: [],
        lastAccessed: Date.now(),
        importance: 0.7
      };
      
      await this.memorySystem.storeSemanticConcept(locationConcept);
      
      // Update cache
      this.cache.set(name, { x, y, z });
      
      // Create episodic event
      const rememberEvent = {
        id: `remember_${name}_${Date.now()}`,
        timestamp: Date.now(),
        duration: 0,
        location: { x, y, z },
        participants: ['player'],
        actions: [{
          actor: 'player',
          action: 'remember_location',
          target: name,
          timestamp: Date.now(),
          result: 'location_remembered'
        }],
        outcomes: ['location_stored'],
        emotionalImpact: 0.2,
        importance: 0.6,
        tags: ['memory', 'location', 'remember'],
        type: 'memory_remember',
        action: 'remember_location',
        outcome: 'location_stored',
        success: true
      };
      
      await this.memorySystem.storeEvent(rememberEvent);
      
    } catch (error) {
      console.error(`Failed to remember location ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Legacy recall function - retrieves location
   */
  async recall(name: string): Promise<{ x: number; y: number; z: number } | null> {
    try {
      // Check cache first
      const cached = this.cache.get(name);
      if (cached) {
        return cached;
      }
      
      // Query semantic memory
      const query: MemoryQuery = {
        query: name,
        type: 'semantic',
        criteria: {},
        filters: { type: 'semantic' },
        limit: 1
      };
      
      const results = await this.memorySystem.query(query);
      
      if (results.semantic && Array.isArray(results.semantic) && results.semantic.length > 0) {
        const concept = results.semantic[0];
        if (concept.attributes && concept.attributes.location) {
          const location = concept.attributes.location;
          this.cache.set(name, location);
          return location;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error(`Failed to recall location ${name}:`, error);
      return null;
    }
  }
  
  /**
   * Legacy forget function - removes location
   */
  async forget(name: string): Promise<boolean> {
    try {
      // Remove from cache
      this.cache.delete(name);
      
      // In a full implementation, this would mark the concept as forgotten
      // or reduce its importance significantly in semantic memory
      
      const forgetEvent = {
        id: `forget_${name}_${Date.now()}`,
        timestamp: Date.now(),
        duration: 0,
        location: { x: 0, y: 0, z: 0 }, // Unknown location
        participants: ['player'],
        actions: [{
          actor: 'player',
          action: 'forget_location',
          target: name,
          timestamp: Date.now(),
          result: 'location_forgotten'
        }],
        outcomes: ['location_removed'],
        emotionalImpact: -0.1,
        importance: 0.3,
        tags: ['memory', 'forget', 'location'],
        type: 'forget_action',
        action: 'forget_location',
        outcome: 'location_removed',
        success: true
      };
      
      await this.memorySystem.storeEvent(forgetEvent);
      
      return true;
      
    } catch (error) {
      console.error(`Failed to forget location ${name}:`, error);
      return false;
    }
  }
  
  /**
   * Legacy list function - lists all remembered locations
   */
  async list(): Promise<string[]> {
    try {
      const query: MemoryQuery = {
        query: 'location',
        type: 'semantic',
        criteria: {},
        filters: { type: 'semantic' },
        limit: 100
      };
      
      const results = await this.memorySystem.query(query);
      
      if (results.semantic && Array.isArray(results.semantic)) {
        return results.semantic
          .filter(concept => concept.attributes && concept.attributes.location)
          .map(concept => concept.name);
      }
      
      return [];
        
    } catch (error) {
      console.error('Failed to list locations:', error);
      return [];
    }
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Type definitions
export interface MigrationRecord {
  timestamp: number;
  duration: number;
  locationsMigrated: number;
  conceptsCreated: number;
  errors: number;
  success: boolean;
}

export interface MigrationStatistics {
  totalMigrations: number;
  successfulMigrations: number;
  failedMigrations: number;
  totalLocationsMigrated: number;
  totalConceptsCreated: number;
  totalErrors: number;
  lastMigration: number;
}
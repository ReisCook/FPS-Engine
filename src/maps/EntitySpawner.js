// src/maps/EntitySpawner.js
import { Vector3 } from 'three';

export class EntitySpawner {
    constructor(engine) {
        this.engine = engine;
        
        // Registry of entity types and their constructors
        this.entityRegistry = new Map();
        
        // Register built-in entity types
        this.registerDefaultEntities();
    }
    
    /**
     * Register an entity type with its constructor
     * @param {string} type - Entity type name
     * @param {Function} constructor - Entity constructor
     */
    registerEntity(type, constructor) {
        this.entityRegistry.set(type, constructor);
    }
    
    /**
     * Register default entity types
     */
    registerDefaultEntities() {
        // Target entity example
        this.registerEntity('target', (data) => {
            return {
                position: new Vector3(data.position.x, data.position.y, data.position.z),
                properties: data.properties || {},
                update: (deltaTime) => {
                    // Target update logic would go here
                },
                destroy: () => {
                    // Clean up resources
                }
            };
        });
        
        // Add more default entities here:
        // - Health pickups
        // - Weapon pickups
        // - Enemy entities
        // - Triggers
    }
    
    /**
     * Spawn entities from map data
     * @param {Array} entitiesData - Array of entity data objects
     */
    spawnEntities(entitiesData) {
        if (!entitiesData || !Array.isArray(entitiesData)) {
            console.warn('No valid entities data provided');
            return;
        }
        
        for (const entityData of entitiesData) {
            this.spawnEntity(entityData);
        }
    }
    
    /**
     * Spawn a single entity
     * @param {Object} entityData - Entity data
     * @returns {Object|null} - Created entity or null if failed
     */
    spawnEntity(entityData) {
        const { type } = entityData;
        
        if (!type) {
            console.error('Entity missing type:', entityData);
            return null;
        }
        
        // Get entity constructor
        const constructor = this.entityRegistry.get(type);
        
        if (!constructor) {
            console.error(`Unknown entity type: ${type}`);
            return null;
        }
        
        try {
            // Create entity
            const entity = constructor(entityData);
            
            // Add to entity manager
            this.engine.entityManager.addEntity(entity);
            
            return entity;
        } catch (error) {
            console.error(`Error spawning entity of type ${type}:`, error);
            return null;
        }
    }
}
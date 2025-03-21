// src/engine/Engine.js
import { Time } from './Time.js';
import { Input } from './Input.js';
import { Renderer } from '../renderer/Renderer.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { EntityManager } from '../entities/EntityManager.js';
import { MapLoader } from '../maps/MapLoader.js';
import { AssetManager } from '../assets/AssetManager.js';
import { Player } from '../player/Player.js';
import { PlayerCamera } from '../camera/PlayerCamera.js';
import { Debug } from './Debug.js';

export class Engine {
    constructor(config = {}) {
        this.config = { 
            targetFPS: 60,
            physicsFPS: 120,
            fov: 95,
            gravity: -20, // Higher gravity for better feel
            debug: false,
            ...config 
        };
        
        this.isRunning = false;
        this.isPaused = false;
        
        // Core systems
        this.time = new Time();
        this.input = new Input();
        this.assetManager = new AssetManager();
        this.renderer = new Renderer(this);
        this.physics = new PhysicsWorld(this);
        this.entityManager = new EntityManager(this);
        this.mapLoader = new MapLoader(this);
        this.debug = new Debug(this);
        
        // Player and camera
        this.player = null;
        this.camera = null;
        
        // Current map
        this.currentMap = null;
    }
    
    async init() {
        // Initialize all systems
        this.input.init();
        await this.assetManager.init();
        this.renderer.init();
        this.physics.init();
        
        // Create player and camera
        this.player = new Player(this);
        this.camera = new PlayerCamera(this);
        
        if (this.config.debug) {
            this.debug.enable();
        }
    }
    
    async loadMap(mapId) {
        // Unload current map if exists
        if (this.currentMap) {
            await this.unloadCurrentMap();
        }
        
        // Load new map
        this.currentMap = await this.mapLoader.load(mapId);
    }
    
    async unloadCurrentMap() {
        if (!this.currentMap) return;
        
        // Clear entities (except player)
        this.entityManager.clearNonPlayerEntities();
        
        // Clear physics objects
        this.physics.clear();
        
        // Unload map-specific assets
        await this.assetManager.unloadGroup(this.currentMap.id);
        
        this.currentMap = null;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.time.reset();
        
        // Start game loop
        this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    stop() {
        if (!this.isRunning) return;
        
        cancelAnimationFrame(this.gameLoopId);
        this.isRunning = false;
    }
    
    gameLoop(timestamp) {
        // Calculate delta time with cap to prevent physics issues
        const rawDeltaTime = this.time.update(timestamp);
        const deltaTime = Math.min(rawDeltaTime, 1/30); // Cap to 30fps minimum for stable physics
        
        if (!this.isPaused) {
            // Update player first to ensure responsive controls
            if (this.player) {
                this.player.update(deltaTime);
            }
            
            // Update physics after player input
            this.physics.update(deltaTime);
            
            // Update other entities
            this.entityManager.update(deltaTime);
            
            // Update camera last to follow updated player
            if (this.camera) {
                this.camera.update(deltaTime);
            }
        }
        
        // Always render even when paused
        this.renderer.render();
        
        // Debug
        if (this.config.debug) {
            this.debug.update(deltaTime);
        }
        
        // Process input events
        this.input.update();
        
        // Queue next frame
        this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    }
}
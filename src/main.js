// src/main.js
import { Engine } from './engine/Engine.js';

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const gameContainer = document.getElementById('game-container');

// Engine configuration
const config = {
    targetFPS: 60,
    physicsFPS: 120,
    fov: 95, // Modern FPS FOV
    gravity: -20, // Slightly higher for "arcadey" feel
    debug: false // Set to true to enable debug mode on startup
};

// Initialize and start the engine
async function initGame() {
    try {
        // Create engine instance
        const engine = new Engine(config);
        
        // Initialize engine
        await engine.init();
        
        // Lock pointer for FPS controls
        gameContainer.addEventListener('click', () => {
            gameContainer.requestPointerLock();
        });
        
        // Listen for pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            engine.input.setPointerLocked(
                document.pointerLockElement === gameContainer
            );
        });
        
        // Handle visibility changes (pause when tab not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                engine.isPaused = true;
            }
        });
        
        // Load the example map
        await engine.loadMap('example_map');
        
        // Hide loading screen
        loadingScreen.style.display = 'none';
        
        // Start the engine
        engine.start();
        
        console.log('Game started successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.querySelector('.loading-text').textContent = 
            'Error loading game: ' + error.message;
    }
}

// Start the game when page is loaded
window.addEventListener('load', initGame);
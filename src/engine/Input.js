// src/engine/Input.js
export class Input {
    constructor() {
        // Key states
        this.keys = new Map();
        this.previousKeys = new Map();
        
        // Mouse data
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        // Event callbacks
        this.keyDownCallbacks = new Map();
        this.keyUpCallbacks = new Map();
        this.mouseCallbacks = [];
    }
    
    init() {
        // Set up event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        console.log('Input system initialized');
    }
    
    update() {
        // Store previous key states for edge detection
        this.previousKeys = new Map(this.keys);
        
        // Reset mouse delta after processing
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
    }
    
    handleKeyDown(event) {
        // Prevent default for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
            event.preventDefault();
        }
        
        this.keys.set(event.code, true);
        
        // Trigger key down callbacks
        const callbacks = this.keyDownCallbacks.get(event.code);
        if (callbacks) {
            callbacks.forEach(callback => callback());
        }
    }
    
    handleKeyUp(event) {
        this.keys.set(event.code, false);
        
        // Trigger key up callbacks
        const callbacks = this.keyUpCallbacks.get(event.code);
        if (callbacks) {
            callbacks.forEach(callback => callback());
        }
    }
    
    handleMouseMove(event) {
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
        
        // Calculate delta when pointer is locked
        if (this.isPointerLocked) {
            this.mouseDelta.x += event.movementX;
            this.mouseDelta.y += event.movementY;
            
            // Trigger mouse move callbacks
            this.mouseCallbacks.forEach(callback => {
                callback(event.movementX, event.movementY);
            });
        }
    }
    
    isKeyDown(keyCode) {
        return this.keys.get(keyCode) === true;
    }
    
    isKeyUp(keyCode) {
        return this.keys.get(keyCode) !== true;
    }
    
    wasKeyPressed(keyCode) {
        return this.keys.get(keyCode) === true && this.previousKeys.get(keyCode) !== true;
    }
    
    wasKeyReleased(keyCode) {
        return this.keys.get(keyCode) !== true && this.previousKeys.get(keyCode) === true;
    }
    
    setPointerLocked(locked) {
        this.isPointerLocked = locked;
    }
    
    // Register event callbacks
    onKeyDown(keyCode, callback) {
        if (!this.keyDownCallbacks.has(keyCode)) {
            this.keyDownCallbacks.set(keyCode, []);
        }
        this.keyDownCallbacks.get(keyCode).push(callback);
    }
    
    onKeyUp(keyCode, callback) {
        if (!this.keyUpCallbacks.has(keyCode)) {
            this.keyUpCallbacks.set(keyCode, []);
        }
        this.keyUpCallbacks.get(keyCode).push(callback);
    }
    
    onMouseMove(callback) {
        this.mouseCallbacks.push(callback);
    }
}
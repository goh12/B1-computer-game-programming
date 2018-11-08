// ==========
// SHIP STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var g_livesLeft = 3;

// A generic contructor which accepts an arbitrary descriptor object
function Ship(descr) {
    this.setTag("player");
    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();
    
    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.ship;
    
    // Set normal drawing scale, and warp state off
    this._scale = {x:1, y:1};
    this._isWarping = false;
}

Ship.prototype = new Entity();

Ship.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.reset_rotation = this.rotation;
};

Ship.prototype.KEY_UP = 'W'.charCodeAt(0);
Ship.prototype.KEY_DOWN  = 'S'.charCodeAt(0);
Ship.prototype.KEY_LEFT   = 'A'.charCodeAt(0);
Ship.prototype.KEY_RIGHT  = 'D'.charCodeAt(0);

Ship.prototype.KEY_FIRE   = ' '.charCodeAt(0);

// Initial, inheritable, default values
Ship.prototype.rotation = Math.PI*0;
Ship.prototype.cx = 200;
Ship.prototype.cy = 200;
Ship.prototype.velX = 0;
Ship.prototype.velY = 0;
Ship.prototype.launchVel = 2;
Ship.prototype.numSubSteps = 1;


// HACKED-IN AUDIO (no preloading)
Ship.prototype.warpSound = new Audio(
    "sounds/shipWarp.ogg");

Ship.prototype.warp = function () {

    this._isWarping = true;
    this._scaleDirn = -1;
    this.warpSound.play();
    
    // Unregister me from my old posistion
    // ...so that I can't be collided with while warping
    spatialManager.unregister(this);
};

Ship.prototype._updateWarp = function (du) {

    var SHRINK_RATE = 3 / SECS_TO_NOMINALS;
    this._scale = {x: this._scale.x + this._scaleDirn * SHRINK_RATE * du,
                   y: this._scale.y + this._scaleDirn * SHRINK_RATE * du};
    
    if (this._scale.x < 0.2) {
    
        this._moveToASafePlace();
        this.halt();
        this._scaleDirn = 1;
        
    } else if (this._scale.x > 1) {
    
        this._scale = {x: 1, y: 1};
        this._isWarping = false;
        
        // Reregister me from my old posistion
        // ...so that I can be collided with again
        spatialManager.register(this);
        
    }
};

Ship.prototype._moveToASafePlace = function () {

    // Move to a safe place some suitable distance away
    var origX = this.cx,
        origY = this.cy,
        MARGIN = 40,
        isSafePlace = false;

    for (var attempts = 0; attempts < 100; ++attempts) {
    
        var warpDistance = 100 + Math.random() * g_canvas.width /2;
        var warpDirn = Math.random() * consts.FULL_CIRCLE;
        
        this.cx = origX + warpDistance * Math.sin(warpDirn);
        this.cy = origY - warpDistance * Math.cos(warpDirn);
        
        this.wrapPosition();
        
        // Don't go too near the edges, and don't move into a collision!
        if (!util.isBetween(this.cx, MARGIN, g_canvas.width - MARGIN)) {
            isSafePlace = false;
        } else if (!util.isBetween(this.cy, MARGIN, g_canvas.height - MARGIN)) {
            isSafePlace = false;
        } else {
            isSafePlace = !this.isColliding();
        }

        // Get out as soon as we find a safe place
        if (isSafePlace) break;
        
    }
};
    
Ship.prototype.update = function (du) {

    // Handle warping
    if (this._isWarping) {
        this._updateWarp(du);
        return;
    }
    
    // Unregister and check for death
    spatialManager.unregister(this);

    // if it's dead(inherited from Entity), return the kill me now value
    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }

    // Perform movement substeps
    var steps = this.numSubSteps;
    var dStep = du / steps;
    for (var i = 0; i < steps; ++i) {
        this.computeSubStep(dStep);
    }

    //Check if we are hitting the top or bottom of the level
    if(this.cy + this.getRadius() > ctx.canvas.height - g_levelGenerator.layerHeightInPixels ||
       this.cy - this.getRadius() < g_levelGenerator.layerHeightInPixels)
        this.warp();

    // Handle firing
    this.maybeFireBullet();
    
    const collisionEntity = this.isColliding();
    if (collisionEntity) {
        if(collisionEntity.getTag() !== "playerBullet") {
            this.warp();
            g_livesLeft--;
        } else {
            spatialManager.register(this);
        }
    } else {
        spatialManager.register(this);
    }
};

Ship.prototype.computeSubStep = function (du) {
    // represent edges of the ship
    const yUpperLimit = this.cy - this.getRadius();
    const yLowerLimit = this.cy + this.getRadius();
    const xLeftLimit = this.cx - this.getRadius();
    const xRightLimit = this.cx + this.getRadius();

    // allows the ship to move up within the canvas
    if (keys[this.KEY_UP] && yUpperLimit > 0) {
        this.cy -= 5 * du;
    }
          
    // allows the ship to move down within the canvas
    if (keys[this.KEY_DOWN] && yLowerLimit < g_canvas.height) {
        this.cy += 5 * du;
    }
            
    // allows the ship to move left within its boundaries    
    if(keys[this.KEY_LEFT] && xLeftLimit > 0 ) {
        this.cx -= 5 * du;
    }
          
    // allows the ship to move right within its boundaries
    if(keys[this.KEY_RIGHT]  && xRightLimit < g_canvas.width) {
        this.cx += 5 * du;
    }     
};

var NOMINAL_GRAVITY = 0.12;

Ship.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};

var NOMINAL_THRUST = +0.2;
var NOMINAL_RETRO  = -0.1;

Ship.prototype.computeThrustMag = function () {
    
    var thrust = 0;
    
    if (keys[this.KEY_THRUST]) {
        thrust += NOMINAL_THRUST;
    }
    if (keys[this.KEY_RETRO]) {
        thrust += NOMINAL_RETRO;
    }
    
    return thrust;
};

Ship.prototype.applyAccel = function (accelX, accelY, du) {
    
    // u = original velocity
    var oldVelX = this.velX;
    var oldVelY = this.velY;
    
    // v = u + at
    this.velX += accelX * du;
    this.velY += accelY * du; 

    // v_ave = (u + v) / 2
    var aveVelX = (oldVelX + this.velX) / 2;
    var aveVelY = (oldVelY + this.velY) / 2;
    
    // Decide whether to use the average or not (average is best!)
    var intervalVelX = g_useAveVel ? aveVelX : this.velX;
    var intervalVelY = g_useAveVel ? aveVelY : this.velY;
    
    // s = s + v_ave * t
    var nextX = this.cx + intervalVelX * du;
    var nextY = this.cy + intervalVelY * du;
    
    // bounce
    if (g_useGravity) {

	var minY = g_sprites.ship.height / 2;
	var maxY = g_canvas.height - minY;

	// Ignore the bounce if the ship is already in
	// the "border zone" (to avoid trapping them there)
	if (this.cy > maxY || this.cy < minY) {
	    // do nothing
	} else if (nextY > maxY || nextY < minY) {
            this.velY = oldVelY * -0.9;
            intervalVelY = this.velY;
        }
    }
    
    // s = s + v_ave * t
    this.cx += du * intervalVelX;
    this.cy += du * intervalVelY;
};

Ship.prototype.maybeFireBullet = function () {
    if (keys[this.KEY_FIRE]) {
        const BULLET_SPEED = 4;

        entityManager.fireBullet(
           this.cx + this.sprite.width/2, this.cy,
           BULLET_SPEED, 0,
           this.rotation,
           "playerBullet");
           
    }
    
};

Ship.prototype.getRadius = function () {
    return (this.sprite.width / 2) * 0.9;
};

Ship.prototype.takeBulletHit = function (bullet) {
    if(bullet.getTag() !== "playerBullet") {
        bullet.kill();
        this.warp();
        g_livesLeft--;
    }
};

Ship.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;
    
    this.halt();
};

Ship.prototype.halt = function () {
    this.velX = 0;
    this.velY = 0;
};

var NOMINAL_ROTATE_RATE = 0.1;

Ship.prototype.updateRotation = function (du) {
    if (keys[this.KEY_LEFT]) {
        this.rotation -= NOMINAL_ROTATE_RATE * du;
    }
    if (keys[this.KEY_RIGHT]) {
        this.rotation += NOMINAL_ROTATE_RATE * du;
    }
};

Ship.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;
    this.sprite.drawCentredAt(
	ctx, this.cx, this.cy, this.rotation
    );

    // Here just temporarily:   
    //gameManager.toggleSound(ctx);

    this.sprite.scale = origScale;

};

function extraLives () {
    return g_livesLeft;
}
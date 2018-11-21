// ==========
// SHIP STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// A generic contructor which accepts an arbitrary descriptor object
function Ship(descr) {
    this.setTag("player");
    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();
    
    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.ship;
    
    // Set normal drawing scale
    this._scale = {x:1, y:1};
    this._lives = 1;
    this._speed = 4;
    this._hasShotgun = false;
    this._fireRate = 10;
    this._invulnerable = false;

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
Ship.prototype.rotation = 0;
Ship.prototype.cx = 200;
Ship.prototype.cy = 200;
Ship.prototype.velX = 0;
Ship.prototype.velY = 0;
Ship.prototype.launchVel = 2;
Ship.prototype.numSubSteps = 1;
Ship.prototype.ammo = 0;

    
Ship.prototype.update = function (du) {
    
    // Unregister and check for death
    spatialManager.unregister(this);

    // if it's dead(inherited from Entity), return the kill me now value
    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }

    // if lives < 1 set the gameManager to game over
    if (this._lives < 1) {
        gameManager.toggleGameOver();
        gameManager.needUpdateHighScores();
        return;
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
        this.removeLife();

    // Handle firing
    this.maybeFireBullet();
    
    const collisionEntity = this.isColliding();
    if (collisionEntity) {

        // check if it is a powerup
        const isPowerUp = collisionEntity.hitByPlayer;

        if(isPowerUp) {
           isPowerUp.call(collisionEntity);
        } else if(collisionEntity.getTag() !== "playerBullet") {
            this.removeLife();
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

    let vert = false;
    let hor = false;

    let xAcc = 0;
    let yAcc = 0;

    // allows the ship to move up within the canvas
    if (keys[this.KEY_UP] && yUpperLimit > 0) {
        vert = true;
        yAcc -= 1 * du;
        if(this.velY > 0) this.velY = 0;
    }
          
    // allows the ship to move down within the canvas
    if (keys[this.KEY_DOWN] && yLowerLimit < g_canvas.height) {
        if(vert === true) {
            vert = false
        } else {
            vert = true;
            yAcc += 1 * du;
            if(this.velY < 0) this.velY = 0;
        }
    }
            
    // allows the ship to move left within its boundaries    
    if(keys[this.KEY_LEFT] && xLeftLimit > 0 ) {
        hor = true;
        xAcc -= 1 * du;
        if(this.velX > 0) this.velX = 0;
    }
          
    // allows the ship to move right within its boundaries
    if(keys[this.KEY_RIGHT]  && xRightLimit < g_canvas.width) {
        if(hor === true) {
            hor = false;
        } else {
            hor = true;
            xAcc += 1 * du;
            if(this.velX < 0) this.velX = 0;
        }
    }

    if(!vert) {
        yAcc = this.velY * (-1) * 1/2;
    }

    if(!hor) {
        xAcc = this.velX * (-1) * 1/2;
    }

    this.applyAccel(xAcc, yAcc, du);
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
    var intervalVelX = util.clampRange(aveVelX, -this._speed, this._speed);
    var intervalVelY = util.clampRange(aveVelY, -this._speed, this._speed);
    
    if(Math.abs(this.velX) < 0.2) this.velX = 0;
    if(Math.abs(this.velY) < 0.2 ) this.velY = 0;
    // s = s + v_ave * t
    this.cx = util.clampRange(this.cx + du * intervalVelX, 0 + this.getRadius()/2, g_canvas.width - this.getRadius()/2);
    this.cy += du * intervalVelY;
};

Ship.prototype.maybeFireBullet = function () {
    if (keys[this.KEY_FIRE]) {
        const BULLET_SPEED = 6;

        // if firing from a shotgun, decrease ammo and play shotgun sound
        if (this._hasShotgun) {
            this.ammo--;
            if (typeof g_audio.shotgunFire !== 'undefined') {
                util.playSound(g_audio.shotgunFire, 1);
            }
        } else if (typeof g_audio.bulletFire !== 'undefined') {
            util.playSound(g_audio.bulletFire, 1);
        }

        entityManager.fireBullet(
           this.cx + this.sprite.width/2, this.cy,
           BULLET_SPEED, 0,
           this.rotation,
           "playerBullet",
           g_sprites.bullet);

        // remove the shotgun powerup if ammo depleted
        if (this.ammo < 0) {
            this.toggleShotgun();
            this.ammo = 0;
        }
    }
};

Ship.prototype.getRadius = function () {
    return (this.sprite.width / 2) * 0.9;
};

Ship.prototype.takeBulletHit = function (bullet) {
    if(bullet.getTag() !== "playerBullet") {
        bullet.kill();
        this.removeLife();
    }
};

Ship.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;

    this._lives = 1;
    this._speed = 4;
    this._hasShotgun = false;
    this._fireRate = 10;
    
    this.halt();
};

Ship.prototype.halt = function () {
    this.velX = 0;
    this.velY = 0;
}

Ship.prototype.render = function (ctx) {

    if (this._lives > 0) {
        
        ctx.save();
    
        var origScale = this.sprite.scale;
        // pass my scale into the sprite, for drawing
        this.sprite.scale = this._scale;
    
        if (this._invulnerable) {
            ctx.globalAlpha = 0.3;
        }
    
        this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
        );
    
        this.sprite.scale = origScale;
    
        ctx.restore();
    }

};

Ship.prototype.addLife = function () {
    if (this._lives < 5) {
        this._lives++;
    }
}

Ship.prototype.removeLife = function () {
    // remove a life if the player isn't invulnerable
    if (!this._invulnerable) {
        this._lives--;
        // grant temporary invulnerability after losing a life
        this._invulnerable = true;
        spatialManager.unregister(this);

        // revert invulnerability after 3 secs.
        setInterval(() => {
            this._invulnerable = false;
            spatialManager.register(this);
        }, 3000);
    }
}

Ship.prototype.getLives = function () {
    return this._lives;
}

Ship.prototype.increaseSpeed = function () {
    this._speed++;
}

Ship.prototype.toggleShotgun = function () {
    this._hasShotgun = !this._hasShotgun;

    // if you're getting a shotgun add ammo
    if (this._hasShotgun) {
        this.ammo = 20;
    }
}

Ship.prototype.getHasShotgun = function () {
    return this._hasShotgun;
}

Ship.prototype.getFireRate = function () {
    return this._fireRate;
}

Ship.prototype.getAmmo = function () {
    return this.ammo;
}

Ship.prototype.setInvulnerable = function (invulnerable) {
    this._invulnerable = invulnerable
}
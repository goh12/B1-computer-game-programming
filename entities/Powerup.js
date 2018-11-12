//==============
// POWERUP STUFF
//==============

"use strict";

// A generic contructor which accepts an arbitrary descriptor object
function Powerup(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    if (this.type < 0.7) {
        this.isExtralife = true;
    } else if (this.type < 1) {
        this.isSpeedBoost = true;
    }
    
    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.powerup;
}


Powerup.prototype = new Entity();
Powerup.prototype.isExtralife = false;
Powerup.prototype.isSpeedBoost = false;
Powerup.prototype.isScoreMultiplier = false;
Powerup.prototype.isShield = false;

Powerup.prototype.update = function (du) {

    spatialManager.unregister(this);

    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }

    spatialManager.register(this);
};

Powerup.prototype.hitByPlayer = function () {
    
    const player = entityManager.getPlayer();

    if (this.isExtralife) {
        player.addLife();
    }

    if (this.isSpeedBoost) {
        player.increaseSpeed();
    }

    this.kill();
    
};

Powerup.prototype.getRadius = function () {
    return 13;
};

Powerup.prototype.render = function (ctx) {
    this.sprite.drawCentredAt(ctx, this.cx, this.cy);
};
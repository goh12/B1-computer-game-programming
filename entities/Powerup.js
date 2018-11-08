//==============
// POWERUP STUFF
//==============

"use strict";

// A generic contructor which accepts an arbitrary descriptor object
function Powerup(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
    
    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.powerup;
}


Powerup.prototype = new Entity();
Powerup.prototype.isExtralife = false;
Powerup.prototype.isSpeedBoost = false;
Powerup.prototype.isScoreMultiplier = false;
Powerup.prototype.isShield = false;
Powerup.prototype.loop = SECS_TO_NOMINALS;

Powerup.prototype.update = function (du) {

    spatialManager.unregister(this);

    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }

    spatialManager.register(this);
};

Powerup.prototype.takePlayerHit = function () {
    
    
    this.kill();
    
};

Powerup.prototype.getRadius = function () {
    return 8;
};

Powerup.prototype.render = function (ctx) {
    this.sprite.drawCentredAt(ctx, this.cx, this.cy);
};
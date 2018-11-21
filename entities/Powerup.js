//==============
// POWERUP STUFF
//==============

"use strict";

let g_greenOrbHasDropped = false;

// A generic contructor which accepts an arbitrary descriptor object
function Powerup(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
    
    // Default sprite
    this.sprite = this.sprite;

    if (this.type < 0.1 && !g_greenOrbHasDropped) {
        g_greenOrbHasDropped = true; // only get one green orb drop per game
        this.isGreenOrb = true;
        this.sprite = g_sprites.powerupGreenOrb;
    } else if (this.type < 0.2) {
        this.isShotgun = true;
        this.sprite = g_sprites.shotgun;
    } else if (this.type < 0.7) {
        this.isExtralife = true;
        this.sprite = g_sprites.powerupLife;
    } else if (this.type < 1) {
        this.isSpeedBoost = true;
        this.sprite = g_sprites.powerupSpeed;
    }
    
}


Powerup.prototype = new Entity();
Powerup.prototype.isExtralife = false;
Powerup.prototype.isSpeedBoost = false;
Powerup.prototype.isGreenOrb = false;
Powerup.prototype.isShotgun = false;

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

    if (this.isShotgun) {
        player.addShotgunAmmo();
    }

    this.kill();
    
};

Powerup.prototype.getRadius = function () {
    return 13;
};

Powerup.prototype.render = function (ctx) {
    this.sprite.drawCentredAt(ctx, this.cx, this.cy);
};
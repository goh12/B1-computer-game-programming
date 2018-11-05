// ====
// Enemy 
//
// Should only be inherited from, not used on its own. (see updateThis() function)
//
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Enemy(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.sprite = this.sprite || g_sprites.rock;
    this.scale  = this.scale  || {x:1, y:1};

/*
    // Diagnostics to check inheritance stuff
    this._EnemyProperty = true;
    console.dir(this);
*/
}

Enemy.prototype = new Entity();
Enemy.prototype.tag = "enemy";

Enemy.prototype.update = function (du) {

    // Unregister and check for death
    spatialManager.unregister(this);

    // if it's dead(inherited from Entity), return the kill me now value
    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW
    }

    this.updateThis(du); //Descendant specific update function.

    if(this.cx < -100) this.kill();
    
    // (Re-)Register
    spatialManager.register(this);
};

Enemy.prototype.getRadius = function () {
    return this.scale.x * (this.sprite.width / 2) * 0.9;
};

Enemy.prototype.takeBulletHit = function () {
    this.kill();
};


Enemy.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
    this.sprite.scale = origScale;
};


Enemy.prototype.setPosition = function(cx, cy) {
    this.cx = cx;
    this.cy = cy;
}

/**
 * Method should be defined by descendant type. 
 */
Enemy.prototype.updateThis = function(du) {
    throw new Error("Descendant of Enemy must implement this function");
}
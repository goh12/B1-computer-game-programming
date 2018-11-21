// ======
// BULLET
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Bullet(descr, laser = false) {

    // Common inherited setup logic from Entity
    this.setup(descr);
    this.laser = laser;
    
/*
    // Diagnostics to check inheritance stuff
    this._bulletProperty = true;
    console.dir(this);
*/

}

Bullet.prototype = new Entity();

Bullet.prototype.zappedSound = new Audio(
    "sounds/bulletZapped.ogg");
    
// Initial, inheritable, default values
Bullet.prototype.rotation = 0;
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.velX = 1;
Bullet.prototype.velY = 1;

// Convert times from milliseconds to "nominal" time units.
Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Bullet.prototype.update = function (du) {

    // Unregister and check for death
    spatialManager.unregister(this);

    // if it's dead(inherited from Entity), return the kill me now value
    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }

    if(this.cx < 0-this.getRadius()*1.5 ||
        this.cx > g_ctx.canvas.width + this.getRadius()*1.5)
        this._isDeadNow = true;

    this.lifeSpan -= du;
    if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    if (this.cx > g_canvas.width + 20
        || this.cx < 0 - 20) this.kill();


    

    // Handle collisions
    var hitEntity = this.findHitEntity();
    if (hitEntity && this.getTag() !== hitEntity.getTag()) {
        var canTakeHit = hitEntity.takeBulletHit;
        //Pass this bullet as extra parameter. (Might not be used.)
        if (canTakeHit) canTakeHit.call(hitEntity, this); 
    }
    
    // (Re-)Register
    spatialManager.register(this);

};

Bullet.prototype.getRadius = function () {
    return 4;
};

Bullet.prototype.takeBulletHit = function () {
    this.kill();
    
    // Make a noise when I am zapped by another bullet
    util.playSound(this.zappedSound,1);
};

Bullet.prototype.render = function (ctx) {
    if(this.laser) {
        g_sprites.laser.drawCentredAt(
            ctx, this.cx, this.cy, this.rotation
        );
    } else {
        g_sprites.bullet.drawCentredAt(
            ctx, this.cx, this.cy, this.rotation
        );
    }
    
};

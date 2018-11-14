// =====
// BLOCK
// =====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Block(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Default sprite and scale, if not otherwise specified
    this.sprite = this.sprite || g_sprites.block;
    this.scale  = this.scale || 1;
    this.velX = g_levelGenerator.moveSpeed;
    this.velY = this.velY || 0;
    this.isCollider = this.isCollider || false;
    this.isBackground = this.isBackground || false;

    /*
        // Diagnostics to check inheritance stuff
        this._BlockProperty = true;
        console.dir(this);
    */
}

Block.prototype = new Entity();

Block.prototype.update = function (du) {
    if(this.isCollider)
        spatialManager.unregister(this);


    if(!this.isBackground)
        this.velX = g_levelGenerator.moveSpeed;
    else
        this.velX = g_levelGenerator.backgroundMoveSpeed;
    this.isCircle = false;

    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW
    }

    if(this.cx < -100)
        this._isDeadNow = true;

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    if(this.isCollider)
        spatialManager.register(this);

};

Block.prototype.getWidth = function () {
    return this.sprite.width*this.scale.x;
};

Block.prototype.getHeight = function () {
    return this.sprite.height*this.scale.y;
};

Block.prototype.takeBulletHit = function () {
    //this.evaporateSound.play();
};

Block.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing

    this.sprite.scale = this.scale;
    this.sprite.drawCentredAt(ctx, this.cx, this.cy);
    this.sprite.scale = origScale;
};

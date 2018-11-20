/*

entityManager.js

A module which handles arbitrary entity-management for "R-Type"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

// "PRIVATE" DATA
_background : [],
_enemies   : [],
_bullets : [],
_ships   : [],
_walls   : [],
_powerups : [],

_bShowEnemies : true,
bgAlpha : 0,

_bulletDu : 0,


// "PRIVATE" METHODS

_generateEnemies : function() {

    const STATE_INTERVAL = 500;
    const NUM_ENEMIES = Math.floor(4 + Math.random() * 6);
    const FORMATION_SPEED = 1 + Math.random() * 2;
    const SPACE_BETWEEN = 60;

    const states = [{x: 0, y: 0}, {x: 0, y: 50}, {x: 0, y: 50}, {x: 0, y: 100}, {x: 0, y: 100}, {x: 0, y: 50}, {x: 0, y: 0}];
    const formation = new Formation(STATE_INTERVAL, NUM_ENEMIES, Grunt, -FORMATION_SPEED, SPACE_BETWEEN);
    formation.setStates(states);
    formation.init();

    this._enemies.push(formation);
},

_generateBoss : function () {
    this._enemies.push(new BossFalmer());
},

_findNearestShip : function(posX, posY) {
    var closestShip = null,
        closestIndex = -1,
        closestSq = 1000 * 1000;

    for (var i = 0; i < this._ships.length; ++i) {

        var thisShip = this._ships[i];
        var shipPos = thisShip.getPos();
        var distSq = util.wrappedDistSq(
            shipPos.posX, shipPos.posY, 
            posX, posY,
            g_canvas.width, g_canvas.height);

        if (distSq < closestSq) {
            closestShip = thisShip;
            closestIndex = i;
            closestSq = distSq;
        }
    }
    return {
        theShip : closestShip,
        theIndex: closestIndex
    };
},

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
    }
},

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [this._background, this._enemies,
                        this._powerups, this._bullets,
                        this._ships, this._walls];
},

init: function() {

},

fireBullet: function(cx, cy, velX, velY, rotation, tag, laser = false) {
    const player = this.getPlayer();
    if (this._bulletDu < player.getFireRate() && tag === 'playerBullet') {
        this._bulletDu++;
        return;
    }

    this._bulletDu = 0; // reset the bullet's du
    this._bullets.push(new Bullet({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,
        _tag : tag,
        rotation : rotation
    }, laser));

    if (player.getHasShotgun() && tag === 'playerBullet') {
        this._bullets.push(new Bullet({
            cx   : cx,
            cy   : cy - 5,
            velX : velX,
            velY : -velX,
            _tag : tag,
            rotation : rotation
        }));
        this._bullets.push(new Bullet({
            cx   : cx,
            cy   : cy + 5,
            velX : velX,
            velY : velX,
            _tag : tag,
            rotation : rotation
        }));
    }
},

debugEnemy: function() {
    this._enemies.push(new Stalker(700, 300));
},

generateEnemy : function(Type, descr = undefined) {
    this._enemies.push(new Type(descr));
},

generateShip : function(descr) {
    this._ships.push(new Ship(descr));
},

generateWall : function(descr) {
    this._walls.push(new Block(descr));
},

generateBackground : function(background) {
    this._background.push({
        update: function() {},
        render: function(ctx) {
            ctx.save();
            ctx.globalAlpha = entityManager.bgAlpha;
            ctx.drawImage(background, 0, 0);
            ctx.restore();
        }
    });
},

createPowerup : function (cx, cy) {
    const typeOfPowerUp = Math.random();

    this._powerups.push(new Powerup({cx, cy, type : typeOfPowerUp}));
},

update: function(du) {

    this._bulletDu += du;

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            var status = aCategory[i].update(du);

            if (status === this.KILL_ME_NOW) {
                // remove the dead guy, and shuffle the others down to
                // prevent a confusing gap from appearing in the array
                aCategory.splice(i,1);
            }
            else {
                ++i;
            }
        }
    }

},

getPlayer: function() {
    return this._ships[0];
},

render: function(ctx) {

    var debugX = 10, debugY = 100;

    if(this.bgAlpha < 1)
        this.bgAlpha += 0.01;

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        if (!this._bShowEnemies && 
            aCategory == this._enemies)
            continue;

        for (var i = 0; i < aCategory.length; ++i) {

            aCategory[i].render(ctx);
            //debug.text(".", debugX + i * 10, debugY);

        }
        debugY += 10;
    }
}

};

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();


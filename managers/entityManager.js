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

_enemies   : [],
_bullets : [],
_ships   : [],
_walls   : [],

_bShowEnemies : true,

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
    this._categories = [this._enemies, this._bullets, this._ships, this._walls];
},

init: function() {
    this._generateEnemies();
    //this._generateShip();
},

fireBullet: function(cx, cy, velX, velY, rotation, tag) {
    this._bullets.push(new Bullet({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,
        _tag : tag,
        rotation : rotation
    }));
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

killNearestShip : function(xPos, yPos) {
    var theShip = this._findNearestShip(xPos, yPos).theShip;
    if (theShip) {
        theShip.kill();
    }
},

yoinkNearestShip : function(xPos, yPos) {
    var theShip = this._findNearestShip(xPos, yPos).theShip;
    if (theShip) {
        theShip.setPos(xPos, yPos);
    }
},

resetShips: function() {
    this._forEachOf(this._ships, Ship.prototype.reset);
},

haltShips: function() {
    this._forEachOf(this._ships, Ship.prototype.halt);
},	

toggleEnemies: function() {
    this._bShowEnemies = !this._bShowEnemies;
},

update: function(du) {
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
    
    if (this._enemies.length === 0) this._generateEnemies();

},

getPlayer: function() {
    return this._ships[0];
},

render: function(ctx) {

    var debugX = 10, debugY = 100;

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


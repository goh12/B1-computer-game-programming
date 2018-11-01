/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var spatialManager = {

// "PRIVATE" DATA

_nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

_entities : [],

// "PRIVATE" METHODS
//
// <none yet>


// PUBLIC METHODS

getNewSpatialID : function() {

    // TODO: YOUR STUFF HERE!
    // increment the next spatial id to give a new slot in the entity array
    return this._nextSpatialID++;
},

register: function(entity) {
    var pos = entity.getPos();
    var spatialID = entity.getSpatialID();
    
    // TODO: YOUR STUFF HERE!
    this._entities[spatialID] = {
        entity : entity,
        posX : pos.posX,
        posY : pos.posY,
        radius : entity.getRadius()
    }

},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();

    // TODO: YOUR STUFF HERE!

    // "delete" is a good way of removing things from an array
    // since we know their index (spatialId)
    delete this._entities[spatialID];
},

findEntityInRange: function(posX, posY, radius) {

    // TODO: YOUR STUFF HERE!
    let minDistSq = Infinity;
    let minSpatialId;

    for (let i = 0; i < this._entities.length; i++) {
        const entity = this._entities[i];
        
        // deleting makes the entity undefined
        if (entity === undefined) {
            continue;
        }

        const currDistSq = util.wrappedDistSq(posX, posY, entity.posX,
                                            entity.posY, g_canvas.width, g_canvas.height);
        
        // determine the range using radius squared
        const rangeSq = util.square(radius + entity.radius);

        if (currDistSq < rangeSq) {

            // find the minimum distance

            if (minDistSq > currDistSq) {
                minDistSq = currDistSq;
                minSpatialId = i;
            }
        }
    }

    // return null if no entity was found
    if (minSpatialId === undefined) {
        return null;
    }

    // return the entity in range if it exists
    return this._entities[minSpatialId].entity;
},

render: function(ctx) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";
    
    for (var ID in this._entities) {
        var e = this._entities[ID];
        util.strokeCircle(ctx, e.posX, e.posY, e.radius);
    }
    ctx.strokeStyle = oldStyle;
}

}

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

    // increment the next spatial id to give a new slot in the entity array
    return this._nextSpatialID++;
},

register: function(entity) {
    var pos = entity.getPos();
    var spatialID = entity.getSpatialID();
    var hasCircleCollider = entity.isCircle;
    if(hasCircleCollider)
        this._entities[spatialID] = {
            entity: entity,
            posX: pos.posX,
            posY: pos.posY,
            radius: entity.getRadius()
        };
    else
        this._entities[spatialID] = {
            entity: entity,
            posX: pos.posX,
            posY: pos.posY,
            width : entity.getWidth(),
            height : entity.getHeight()
        };

},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();

    // "delete" is a good way of removing things from an array
    // since we know their index (spatialId)
    delete this._entities[spatialID];
},

findEntityInRange: function(posX, posY, radius) {
    let minDistSq = Infinity;
    let minSpatialId;

    for (let i = 0; i < this._entities.length; i++) {
        const entity = this._entities[i];
        
        // deleting makes the entity undefined
        if (entity === undefined) {
            continue;
        }

        if(entity.entity.isCircle){
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
        if(!entity.entity.isCircle){
            let distX = Math.abs(posX - entity.posX - entity.width / 2);
            let distY = Math.abs(posY - entity.posY);

            if (distX > (entity.width / 2 + radius)) {
                continue;
            }
            if (distY > (entity.height/ 2 + radius)) {
                continue;
            }

            if (distX <= (entity.width / 2)) {
                minSpatialId = i;
            }
            if (distY <= (entity.height / 2)) {
                minSpatialId = i;
            }

            let dx = distX - entity.width/ 2;
            let dy = distY - entity.height/ 2;
            if (dx * dx + dy * dy <= (radius * radius))
                minSpatialId = i;
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
        if(e.entity.isCircle)
            util.strokeCircle(ctx, e.posX, e.posY, e.radius);
        else
            util.strokeBox(ctx, e.posX-e.entity.getWidth()/2,
                                e.posY-e.entity.getHeight()/2,
                           e.width, e.height);
    }
    ctx.strokeStyle = oldStyle;
}
};

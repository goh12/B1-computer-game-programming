
/**
 * 
 * @param {{posX, posY}} startPos cx and cy of Tentacle
 * @param {*} initialStates (array of numbers between -500 and 500)
 *                          to set starting y offsets of entities in tentacle.
 */
function Tentacle(startPos, initialStates) {
    this.sectionCount = initialStates.length;

    this.yMaxOffset = 60;  //Max (absolute) offset of entites from this.cy
    this.yOffsetTime = 500;  //Time Between reaching full offsets

    this.sections = []; //Entities that make the "tentacle"
    this.sectionOffsets = []; //Y offsets from this.cy of entities

    this.cx = startPos.posX;
    this.cy = startPos.posY;

    if(initialStates.length && initialStates.length > 0) {
        
        const first = new Grunt();      //Create first section
        first.owner = this; //Set owner of section
        first.fireChance = 0;
        first.setPos(this.cx, this.cy);
        this.sections.push(first);
        
        for (let i = 1; i < initialStates.length; i++) { //Rest of sections
            const scale = 1 - i/initialStates.length;
            const section = new Grunt();        
            section.owner = this;       //Set owner of section.
            section.fireChance = 0;
            section.scale = { x: scale, y: scale };
            
            this.sections.push(section);
        }

        this._initSectionOffsets(initialStates); //Initialise section offsets
        this._updatePositions(); //Set positions of sections
        this._updateFireChance();
    }

}

/**
 * Initialises y offsets for sections.
 */
Tentacle.prototype._initSectionOffsets = function(states) {
    for(let i = 0; i < states.length; i++) {
        const maxOffs = this.yMaxOffset -this.sections[i].getRadius();
        const offs = maxOffs * (states[i]/this.yOffsetTime); 
        const asc = offs < 0 ? true : false; 
        this.sectionOffsets.push({
            offs,
            asc,
            state: states[i]
        });
    }
}

/**
 * Updates offsets for all sections.
 */
Tentacle.prototype._updateSectionOffsets = function(initial) {
    const dt = main.deltaTime();

    for(let i = 0; i < this.sectionOffsets.length; i++) {
        if(this.sections[i] === null) break;
        const maxOffs = this.yMaxOffset - this.sections[i].getRadius() * 2;
        const so = this.sectionOffsets[i];
        so.state = so.asc ? so.state + dt : so.state - dt;  //Update current state
        if(Math.abs(so.state) > this.yOffsetTime) {
            const backTrack = so.state % this.yOffsetTime; //Fix offset state so
            so.state -= backTrack;                          // !(Math.abs(so.state) > this.yOffsetTime)
            so.asc = !so.asc; //Start counting the other way.
        }
        so.offs = maxOffs * (so.state/this.yOffsetTime);  //Calculate new offset.
    }
}

/** 
 * Updates absolute positions of entities in tentacle
 */
Tentacle.prototype._updatePositions = function() {

    const first = this.sections[0]; //Update first position.
    if(!first) return;
    first.setPos(this.cx, this.cy + this.sectionOffsets[0].offs);

    for (let i = 1; i < this.sections.length; i++) { //Rest of sections
        if(this.sections[i] === null) break;
        const section = this.sections[i];
        const last = this.sections[i - 1];
        const xPos = last.cx  - last.getRadius() - section.getRadius();
        const yPos = this.cy + this.sectionOffsets[i].offs;
        this.sections[i].setPos(xPos, yPos);
    }
}

/**
 * Updates fire chance for tentacle.
 * (Fire chance should get higher for each Grunt on tentacle)
 * when they are fewer.
 */
Tentacle.prototype._updateFireChance = function() {
    const fireChance = 0.01;
    
    let i = this.sectionCount - 1;
    while(i >= 0) {
        if(this.sections[i]) {
            this.sections[i].fireChance = fireChance;
            break;
        }
        i--;
    }
}

Tentacle.prototype.setPos = function(cx, cy) {
    this.cx = cx;
    this.cy = cy;
}

Tentacle.prototype.update = function(du) {
    this._updateSectionOffsets();
    this._updatePositions();

    for(let i = 0; i < this.sections.length; i++) {
        if(!this.sections[i]) break; //Rest should be null

        if(this.sections[i].update(du) === entityManager.KILL_ME_NOW) {
            //Should only be able to be destroyed if the section
            //is the outermost one.
            this.sections[i] = null;
            this.sectionCount--;
            this._updateFireChance();
        };
    }

    if(this.sectionCount === 0) {
        this._isDeadNow = true;
        return entityManager.KILL_ME_NOW;
    }
}

Tentacle.prototype.render = function(ctx) {
    for(let i = 0; i < this.sections.length; i++) {
        if(!this.sections[i]) break; //Rest should be null.
        this.sections[i].render(ctx);
    }
}

/**
 * Check if allowed to kill object.
 */
Tentacle.prototype.canKill = function(ob) {
    for (let i = 0; i < this.sections.length; i++) {
        if(this.sections[i] === ob) { //Find object
            if(!this.sections[i + 1]) return true; //If outer section is destroyed,
        }                                          //kill object.
    }

    return false;
 }



/**
 * Big boss type enemy.
 */
function BossFalmer() {
    this.cx = g_canvas.width + 400;  //Starting positions
    this.cy = g_canvas.height/2;

    this.head = new Grunt();            //Boss head configuration
    this.head.scale = { x: 5, y: 5};
    this.head.setPos(this.cx, this.cy);
    this.head.owner = this;
    this.head.fireChance = 0;

    this.speed = -1;                //Boss speed configuration
    this.stopCx = 680;            //Where boss will stop

    this.tentacles = [];        //Tentacle container
    this.tentacleCount = 4;     //Tentacle count
    this.tentaclePos = null;

    this._updateChildrenPositions();  //Setup positions for children.
    this._initTentacles();            //Build tentacles.

}

BossFalmer.prototype = Entity.prototype;

/**
 * Creates the tentacles for this boss and pushes to container.
 */
BossFalmer.prototype._initTentacles = function() {
    
    this.tentacles.push( new Tentacle(this.tentaclePos[0],
        [-310, -330, -350, -300, -250, -200, -250, -300, -350]
    ));

    this.tentacles.push( new Tentacle(this.tentaclePos[1],
        [320, 250, 200, 260, 330, 400]
    ));

    this.tentacles.push( new Tentacle(this.tentaclePos[2],
        [-320, -250, -200, -260, -330, -400]
    ));

    this.tentacles.push( new Tentacle(this.tentaclePos[3],
        [310, 330, 350, 300, 250, 200, 250, 300, 350]
    ));

}

/**
 * Updates absolute positions for children.
 */
BossFalmer.prototype._updateChildrenPositions = function() {
    this.head.setPos(this.cx, this.cy);  //Set head positions

    const rad = this.head.getRadius();  
    const cxRad = this.cx - rad;
    const cy = this.cy;

    this.tentaclePos = [  //Update positions for tentacles.
        { posX: cxRad + 44, posY: cy - rad + 15 },
        { posX: cxRad, posY: cy - rad/2 + 30 },
        { posX: cxRad, posY: cy + rad/2 - 30 },
        { posX: cxRad + 44, posY: cy + rad - 15 }
    ];
}

BossFalmer.prototype.update = function(du) {
    //If dead
    if(this._isDeadNow) return entityManager.KILL_ME_NOW;

    //If boss hasn't moved to it's desired location.
    if(this.cx > this.stopCx) {
        this.cx += this.speed * du;
        this._updateChildrenPositions();
    }

    //Update head.
    if(this.head.update(du) === entityManager.KILL_ME_NOW) this.kill();

    //Update tentacles
    for(let i = 0; i < this.tentacles.length; i++) {//Update tentacles
        if(!this.tentacles[i]) continue; //if tentacle is destroyed

        const tPos = this.tentaclePos[i];
        this.tentacles[i].setPos(tPos.posX, tPos.posY);
        if(this.tentacles[i].update(du) === entityManager.KILL_ME_NOW) {
            this.tentacleCount--;
            this.tentacles[i] = null;
        };

    }

}

BossFalmer.prototype.render = function(ctx) {
    this.head.render(ctx);
    for(let i = 0; i < this.tentacles.length; i++) {
        if(!this.tentacles[i]) continue;

        this.tentacles[i].render(ctx);
    }
}

//Checks weather this.head can be killed.
BossFalmer.prototype.canKill = function(ob) {
    if(this.tentacleCount == 0) {
        return true;
    }
    return false;
}
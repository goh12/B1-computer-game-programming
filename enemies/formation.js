/**
 * 
 * @param {*} stateInterval Interval between entity states
 * @param {*} entityCount number of entities in fomration
 * @param {*} entityType constructor for an Entity
 * @param {*} xVel xVelocity of formation
 * @param {*} spaceBetween space between entities in formation.
 */
function Formation(stateInterval, entityCount, entityType, xVel, spaceBetween) {
    this.interval = stateInterval;//Time between formation states (in ms)

    this.cx = g_canvas.width + 50;
    this.cy = g_canvas.height/2;

    this.xVel = xVel;
    this.entityInterval = spaceBetween;
    this.entityCount = entityCount;
    this.entityType = entityType;
    
    this.entities = [];
}

Formation.prototype = new Entity();


/**
 * Sets states for entities in formation.
 */
Formation.prototype.setStates = function(states) {
    this.states = states;
}

/**
 * Initialise entities in formation.
 */
Formation.prototype.init = function() {
    //Initia
    for (let i = 0; i < this.entityCount; i++) {
        const entity = new this.entityType();
        entity.formationIntervalCount = 0 - this.interval * i;
        entity.formationCurrentState = 1;
        entity.formationLastState = 0;
        entity.inFormation = true;
        this.entities.push(entity);
    }
}

/**
 * Updates entities in fomration.
 */
Formation.prototype.update = function(du) {
    //Tell entityManager to kill formation.
    if(this._isDeadNow) return entityManager.KILL_ME_NOW;

    const deltaTime = main.deltaTime();

    //Update formation location.
    this.cx += this.xVel * du;

    //Update entities
    for(let i = 0; i < this.entities.length; i++) {
        const e = this.entities[i];
        
        if(e === null) continue; //Move on to next if already destroyed.
        spatialManager.unregister(e);

        if(e.update(du) === entityManager.KILL_ME_NOW) {
            //Destroy entity
            this.entities[i] = null;
            this.entityCount--;
            //kill formation
            if(this.entityCount === 0) return this.kill();
            continue;
        }
        
         //Update where entity is in its current interval.
         e.formationIntervalCount += deltaTime;

         //Check if passing into next state.
        if(e.formationIntervalCount > this.interval) {
            e.formationIntervalCount %= this.interval;
            e.formationLastState = e.formationCurrentState;
            e.formationCurrentState = (e.formationCurrentState + 1) % this.states.length;
        }

        //Set entities new position
        this.calculateAndSetNewEntityLocation(e, i);

        //Re register entity
        spatialManager.register(e);

    }
}


/**
 * Calculates position for 
 * 
 */
Formation.prototype.calculateAndSetNewEntityLocation = function(e, formationPosition) {
    //Calculate entity placement.
    const placement = e.formationIntervalCount / this.interval;

    //Get where entity was supposed to be.
    const lastPos = this.states[e.formationLastState];
    const currentPos = this.states[e.formationCurrentState];
    
    //Find location between states.
    const dx = (currentPos.x - lastPos.x) * placement;
    const dy = (currentPos.y - lastPos.y) * placement;

    //Set entity absolute location.
    e.setPosition(
        this.cx + lastPos.x + dx + this.entityInterval * formationPosition,
        this.cy + lastPos.y + dy
    )
}

Formation.prototype.render = function(ctx) {
    for(var i = 0; i < this.entities.length; i++) {
        const e = this.entities[i];
        if(e !== null) this.entities[i].render(ctx);
    }
}


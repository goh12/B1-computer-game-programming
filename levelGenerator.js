// ===============
// LEVEL GENERATOR
// ===============

let g_levelGenerator = {
    baseLayerAmount : 2, //How many blocks vertically stacked
                         //in base layer
    blocksPerRow : 8,
    layerHeightInPixels : 60, //Base layer height in pixels
    maxRockGrowth : 3, //How much does the rock growth deviate

    isInitialized : false, //Is the level initialized?
    seed : 1, //Random seed used for level generation

    //Timers for spawning new blocks and background
    timerBlock : 0,
    timerBackground : 0,

    moveSpeed : -1, //Move speed of blocks

    isMoving : true, //Is the environment moving?
    enemySpacing : 5, //Spacing between wave spawns in blocks
    currentBlock : 0, //Used for counting blocks until enemy spawn

    blockSprite : null, //What sprite are we using for our blocks?

    wavesLeft : 3 //How many waves are left until the boss
};

g_levelGenerator.blockDesc = function (i,j) {
    let blockLength = this.blockLength;
    let rows = this.baseLayerAmount;
    //Scale and position our blocks dynamically with respect
    //to sprite size
    return {scale: {x:1.0/this.blockSprite.width*blockLength*1.1,
            y:1.0/this.blockSprite.height*
                this.layerHeightInPixels/(rows)*1.1},
        cx : blockLength/2 + (j*blockLength),
        cy : this.layerHeightInPixels/(2*rows) +
            (i*2*this.layerHeightInPixels/(2*rows)),
        sprite : this.blockSprite};
};

g_levelGenerator.update = function (du) {
    //Initialize wall for play if not initialized
    if(!this.isInitialized) {
        this.blockLength = g_ctx.canvas.width/this.blocksPerRow;
        this.timerBlock = this.blockLength;
        this.timerBackground = this.blockLength;
        g_levelGenerator.init();
        this.isInitialized = true;
    }

    if(this.isMoving)
        this.moveSpeed = -1;
    else
        this.moveSpeed = 0;

    //Update the timer with the move speed.
    this.timerBlock += Math.abs(this.moveSpeed) * du;

    //Reset waves and boss. Not to be used for final version.
    //For testing purposes only.
    if(entityManager._enemies.length === 0 && this.wavesLeft < 0){
        this.blockSprite = g_sprites.blockHell;
        entityManager.bgAlpha = 0;
        entityManager.generateBackground(g_images.backgroundHell);

        this.wavesLeft = 4;
        this.currentBlock = this.enemySpacing;
        this.isMoving = true;
    }

    //See if we have moved the distance of a block length
    if(this.timerBlock >= this.blockLength){
        //Spawn a wave and decrement the waves left
        if(this.currentBlock === 0) {
            this.wavesLeft--;
            if(this.wavesLeft > 0) {
                entityManager._generateEnemies();
                this.currentBlock = this.enemySpacing;
            }
        }
        //Spawn the boss if we have no waves left
        if(this.wavesLeft === 0) {
            entityManager._generateBoss();
            this.wavesLeft--;
            this.isMoving = false;
        }

        //Decrement amount of blocks until next wave
        this.currentBlock--;

        let rows = this.baseLayerAmount;
        //Top rows
        for(let i = 0; i < rows; i++){
            entityManager.generateWall(this.blockDesc(i, this.blocksPerRow));
        }

        //Random extending blocks
        for(let i = 0; i < this.maxRockGrowth; i++){
        if(util.random() > Math.pow(0.5, i+1)) {
            let desc = this.blockDesc(rows+i, this.blocksPerRow);
            entityManager.generateWall({scale: desc.scale,
                cx: desc.cx,
                cy: desc.cy,
                isCollider : true,
                sprite : desc.sprite});

            desc = this.blockDesc(2*rows+i, this.blocksPerRow);
            entityManager.generateWall({scale: desc.scale,
                cx: desc.cx,
                cy: g_ctx.canvas.height - desc.cy + this.layerHeightInPixels,
                isCollider : true,
                sprite : desc.sprite});
            }
            else
                break;
        }

        //Bottom rows
        for(let i = 0; i < rows; i++){
            let desc = this.blockDesc(rows+i, this.blocksPerRow);
            entityManager.generateWall({scale: desc.scale,
                cx: desc.cx,
                cy: g_ctx.canvas.height - desc.cy + this.layerHeightInPixels,
                velX: desc.velX,
                sprite : desc.sprite});
        }
        //Reset timer
        this.timerBlock = 0;
    }

};

g_levelGenerator.reset = function () {
    //Kill all walls
    for(let i = 0; i < entityManager._walls.length; i++)
        entityManager._walls[i]._isDeadNow = true;

    //Kill all enemies
    for(let i = 0; i < entityManager._walls.length; i++) {
        if(entityManager._enemies[i] != null) {
            entityManager._enemies[i].inFormation = false;
            entityManager._enemies[i]._isDeadNow = true;
        }
    }

    //Kill all bullets.
    for(let i = 0; i < entityManager._bullets.length; i++)
        entityManager._bullets[i]._isDeadNow = true;


    //Reset spatial manager.
    spatialManager._entities = [];

    //Reset all relevant level generating values
    this.timerBlock = 0;
    this.timerBackground = 0;
    this.isMoving = true;
    this.enemySpacing = 5;
    this.currentBlock = 0;
    this.blockSprite = null;
    this.wavesLeft = 3;
    this.seed = 1;

    //Re-initialize
    this.isInitialized = false;
};

g_levelGenerator.toggleMoving = function () {
    this.isMoving = !this.isMoving;
};

//For initializing level generation. Generates two rows of blocks,
//one at the top and one at the bottom.
g_levelGenerator.init = function () {
    this.blockSprite = g_sprites.block;

    let rows = this.baseLayerAmount;
    let cols = this.blocksPerRow;

    //Top rows
    for(let i = 0; i < rows; i++)
        for(let j = 0; j < cols; j++){
            entityManager.generateWall(this.blockDesc(i,j));
        }

    //Bottom rows
    for(let i = 0; i < rows; i++)
        for(let j = 0; j < cols; j++){
            let desc = this.blockDesc(rows+i,j);
            entityManager.generateWall({scale: desc.scale,
                                        cx: desc.cx,
                                        cy: g_ctx.canvas.height - desc.cy + this.layerHeightInPixels,
                                        velX: desc.velX,
                                        sprite : desc.sprite});
        }

    //Background
    entityManager.generateBackground(g_images.background);
};
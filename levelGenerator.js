// ===============
// LEVEL GENERATOR
// ===============

let g_levelGenerator = {
    baseLayerAmount : 3,
    blocksPerRow : 10,
    layerHeightInPixels : 70,
    isInitialized : false,
    blocks : [],
    seed : 1,
    timer : 0,
    moveSpeed : -1,
    maxRockGrowth : 3,
    isMoving : true
};

g_levelGenerator.blockDesc = function (i,j) {
    let blockLength = this.blockLength;
    let rows = this.baseLayerAmount;
    return {scale: {x:1.0/g_sprites.block.width*blockLength*1.1,
            y:1.0/g_sprites.block.height*
                this.layerHeightInPixels/(rows)*1.1},
        cx : blockLength/2 + (j*blockLength),
        cy : this.layerHeightInPixels/(2*rows) +
            (i*2*this.layerHeightInPixels/(2*rows))};
};

g_levelGenerator.update = function (du) {
    //Initialize wall for play if not initialized
    if(!this.isInitialized) {
        this.blockLength = g_ctx.canvas.width/this.blocksPerRow;
        this.timer = this.blockLength;
        g_levelGenerator.init();
        this.isInitialized = true;
    }

    if(this.isMoving)
        this.moveSpeed = -1;
    else
        this.moveSpeed = 0;

    //Update the timer with the move speed.
    this.timer += Math.abs(this.moveSpeed) * du;
    //See if we have moved the distance of a block length
    if(this.timer >= this.blockLength){
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
                isCollider : true});

            desc = this.blockDesc(2*rows+i, this.blocksPerRow);
            entityManager.generateWall({scale: desc.scale,
                cx: desc.cx,
                cy: g_ctx.canvas.height - desc.cy + this.layerHeightInPixels,
                isCollider : true});
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
                velX: desc.velX});
        }
        //Reset timer
        this.timer = 0;
    }


};

g_levelGenerator.reset = function () {
    g_levelGenerator.init();
};

g_levelGenerator.toggleMoving = function () {
    this.isMoving = !this.isMoving;
};

g_levelGenerator.init = function () {
    let rows = this.baseLayerAmount;
    let cols = this.blocksPerRow;
    this.blocks = [];

    //Generate two sets of rows, one for top of screen and one for bottom.
    for (let i = 0; i < rows*2; i++ ) {
        this.blocks[i] = [];
    }
    //Iterate through the 2D array and create Block objects for each index (i, j)

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
                                        velX: desc.velX});
        }
};
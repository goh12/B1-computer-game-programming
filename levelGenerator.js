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
    moveSpeed : -1
};

g_levelGenerator.blockDesc = function (i,j) {
    let blockLength = this.blockLength;
    let rows = this.baseLayerAmount;
    return {scale: {x:1.0/g_sprites.block.width*blockLength*1.1,
            y:1.0/g_sprites.block.height*
                this.layerHeightInPixels/(rows)*1.1},
        cx : blockLength/2 + (j*blockLength),
        cy : this.layerHeightInPixels/(2*rows) +
            (i*2*this.layerHeightInPixels/(2*rows)),
        velX : this.moveSpeed};
};

g_levelGenerator.update = function (du) {
    //Initialize wall for play if not initialized
    if(!this.isInitialized) {
        this.blockLength = g_ctx.canvas.width/this.blocksPerRow;
        this.timer = this.blockLength;
        g_levelGenerator.init();
        this.isInitialized = true;
    }
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
        if(util.random() > 0.5) {
            entityManager.generateWall(this.blockDesc(rows, this.blocksPerRow));
            if(util.random() > 0.5)
                entityManager.generateWall(this.blockDesc(rows+1, this.blocksPerRow));
        }

        //Bottom rows
        for(let i = 0; i < rows; i++){
            let desc = this.blockDesc(rows+i, this.blocksPerRow);
            entityManager.generateWall({scale: desc.scale,
                cx: desc.cx,
                cy: g_ctx.canvas.height - desc.cy + this.layerHeightInPixels,
                velX: desc.velX});
        }

        if(util.random() > 0.5) {
            let desc = this.blockDesc(2*rows-1, this.blocksPerRow);
            entityManager.generateWall({scale: desc.scale,
                cx: desc.cx,
                cy: g_ctx.canvas.height - desc.cy + this.layerHeightInPixels,
                velX: desc.velX});

            if(util.random() > 0.5) {
                let desc = this.blockDesc(2*rows, this.blocksPerRow);
                entityManager.generateWall({
                    scale: desc.scale,
                    cx: desc.cx,
                    cy: g_ctx.canvas.height - desc.cy + this.layerHeightInPixels,
                    velX: desc.velX});
            }
        }
        //Reset timer
        this.timer = 0;
    }


};

g_levelGenerator.reset = function () {
    g_levelGenerator.init();
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
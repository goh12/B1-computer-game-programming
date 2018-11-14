
        //TODO VALIDATE PARAMETERS



/*

    Author: Frosti Grétarsson
    Date: October 4. 2018
    Description:

*/


/*

    ------- Animation --------
    Description:
        Animation object should hold frames and information 
        for rendering an animation with the Animator.
    
    Properties:
        int frameInterval: Animation should update every n-th update.
        int length: number of frames in animation
        int frames: all frames belonging to animation
*/


/**
 * @param {list} frames List of frames belonging to animation
 */
function Animation(frames) {
    this.frameInterval = 0;     //frame should update every x frames
    this.length = frames.length;
    this.frames = frames;
}


/*

    ------- Animator --------
    Description:
        Controller for animations. The Animator called when an animation
        should be rendered. It can be told which animation to render and
        where. Should hold animation logic for sprites.
        I.e. if a sprite has multiple animations f.x. walk left/right,
        the sprite should tell the animator weather to play the animation
        for left or the animation for right.

    Methods:
        addAnimation:(animationName, animation)
        playAnimation(animationName): plays the animation stored with the designated name.
        update(cx, cy, angle, scale): updates animation
    
    Properties:
        CanvasRenderingContext2D ctx: context to draw animation upon
        int frameIntervalStep: How many updates until new frame
        int nextFrame: The number for the animation frame to display next.
        Map animations: Animations that Animator can animate.


    Usage: 
        const an = new Animator(ctx);
        an.addAnimation("animationName", animation);
        an.playAnimation("animationName");
        setInterval(() => {
            an.update(cx, cy, angle, scale);
        }, 16.666);

        ....
*/

/**
 * Creates an animator that draws upon the corresponding context
 * @param {"2DDrawingContext"} ctx to draw upon
 */
function Animator(ctx) {
    this.ctx = ctx;             //Context to draw upon
    this.frameIntervalStep = 0; //Time spent on this animation frame
    this.nextFrame = 0;     //next frame to render for animation
    this.animations = {};   //Animations available to animator
    this.currentAnimation = null; //Current animation playing

    this.playOnce = false; //Play current animation once
    this.playOnceNextAnimation = null;  //Next animation to play after one shot animation
}

Animator.prototype.getCurrentFrame = function() {
    return this.nextFrame;
}

/**
 * Adds a an animation as playable by animator.
 * @param {str} animationName name to store animation
 * @param {Animation} animation to be stored.
 */
Animator.prototype.addAnimation = function(animationName, animation) {
    this.animations[animationName] = animation;
}

/**
 * The animator renders the animation with the given name (key).
 * @param {str} animationName name (key) of animation that should be played
 */
Animator.prototype.playAnimation = function(animationName) {
    this.currentAnimation = this.animations[animationName];
    this.nextFrame = 0;
    this.frameIntervalStep = 0;
}


/**
 * Plays animation once and then immediately changes to the next one.
 * @param {str} animationName Animation to play once
 * @param {str} nextAnimationName Next animation to transition to. If null
 *                                plays no animation after one shot has finished.
 */
Animator.prototype.playAnimationOnce = function(animationName, nextAnimationName) {
    this.playOnce = true;
    this.playOnceNextAnimation = nextAnimationName ? nextAnimationName : null;
    this.currentAnimation = this.animations[animationName];
    this.nextFrame = 0;
    this.frameIntervalStep = 0;
}


/**
 * Updates the current animation.
 * @param {float} dt time since last frame update
 * @param {int} cx 
 * @param {int} cy 
 * @param {float} angle
 * @param {float} scaleX
 * @param {float} scaleY
 */
Animator.prototype.update = function(dt, cx, cy, angle, scaleX, scaleY) {
    if (!this.currentAnimation) {
        return; //Don't update if there's no animation playing
    }

    if (angle == undefined) angle = 0;
    if (scaleX == undefined) scaleX = 1;
    if (scaleY == undefined) scaleY = 1;

    //Get frame to draw
    const frameToDraw = this.currentAnimation.frames[this.nextFrame];
    //Draw
    this._render(frameToDraw, cx, cy, angle, scaleX, scaleY);

    this._animationUpdate(dt);
}

/**
 * Updates the current state of the animation
 * @param {float} dt time since last frame update 
 */
Animator.prototype._animationUpdate = function(dt) {
    //Update animator status
    this.frameIntervalStep += dt;
    //Check if animation frame should update on next update call.
    if(this.frameIntervalStep >= this.currentAnimation.frameInterval) {
        this.frameIntervalStep = 0;
        this.nextFrame++;
        if(this.nextFrame >= this.currentAnimation.length) {
            this.nextFrame = 0;

            //This statement only runs if current animation should only be played once.
            if (this.playOnce) {    //Check if this is a one shot animation
                this.playOnce = false;  //Next animation should play continuously.
                if(!this.playOnceNextAnimation === null) {
                    this.currentAnimation = null;   //Play no animation
                } else {
                    this.playAnimation(this.playOnceNextAnimation)  //Play next animation after
                }
                this.playOnceNextAnimation = null;
            }
        }
    }
}

/**
 * Renders the Animators current animation at the specified coordinates.
 * @param {frameToDraw} animation frame to draw
 * @param {int} cx 
 * @param {int} cy 
 * @param {float} angle
 * @param {float} scaleX
 * @param {float} scaleY
 */
Animator.prototype._render = function(frameToDraw, cx, cy, angle, scaleX, scaleY) {
    var hw = frameToDraw.width / 2;
    var hh = frameToDraw.height / 2;

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(angle);
    this.ctx.scale(scaleX, scaleY);
    this.ctx.translate(-cx, -cy);
    this.ctx.drawImage(frameToDraw, cx - hw, cy - hh);
    this.ctx.restore();
}




        //TODO VALIDATE PUBLIC PARAMETERS

/*
 *  Author: Frosti Grétarsson 
 *  Date: October 2018
 * 
 */

/**
 * Main SpriteSheetManager object.
 * Contains logic for creating SpriteSheet objects.
 * 
 * -- Usage -- 
 *      Create sprite:  
 *          SpriteSheetManager.addSpriteSheetAnimation(animationName, imgSrc, frameWidth, frameHeight, frameCount, frameInterval);
 *          ... repeat for other animations ...
 * 
 *          SpriteSheetManager.loadAnimations((animations) => {
 *              -- do stuff --      
 *          });
 *                                                     
 */
const SpriteSheetManager = (function() {
    /* List of jobs, every attribute should be in format:
        { imgSrc, frameWidth, frameHeight, frameCount, onLoad }
    */
    const jobs = {};        //List of jobs
    const jobQueue = [];    //queue for jobs
    let jobsRun = false;    //Check if already called loadAnimations()

    let allAnimations = null;

    /**
     * Adds a spritesheet to the animation work queue. Animations get processed
     * when loadAnimations() is called
     * @param {str} animationName name of animation
     * @param {str} imgSrc image URL
     * @param {int} frameWidth width each animation frame
     * @param {int} frameHeight height of each animation frame
     * @param {int} frameCount number of frames in animation.
     * @param {int} animationLength length of animation (ms)
     */
    function addSpriteSheetAnimation(
        animationName, imgSrc, frameWidth, frameHeight, frameCount, animationLength
    ) 
    {                                                                 ///<---------------------PUBLIC-------------------------------------->
        //Check if animations are already processed
        if(jobsRun)
            return console.log('Animations have already been processed');
        //Check if there already is a job under the same name.
        if(jobs[animationName]) 
            return console.log(`Animation '${animationName}' already exists`);
        
        //Create job
        jobs[animationName] = { animationName, imgSrc, frameWidth, 
                                frameHeight, frameCount, animationLength };
        //Push job to queue
        jobQueue.push(animationName);
    }

    /**
     * Functions starts loading and creating all animations added to job queue.
     * When all animations have been created, callback function is called returning
     * an object holding all animations with original animationName.
     * @param {func} callback   callback function returning object.
     */
    function loadAnimations(callback) {                                         ///<---------------------PUBLIC-------------------------------------->
        if(jobsRun) return console.log("Animations already processed");
        jobsRun = true;
        const animations = {};
        animations._loadCount = jobQueue.length;
        for(var i = 0; i < jobQueue.length; i++) {
            const animationName = jobQueue[i];
            const job = jobs[animationName];
            createSpriteFromSpriteSheet(
                job.imgSrc,
                job.frameWidth,
                job.frameHeight,
                job.frameCount,
                (result) => {
                    result.frameInterval = job.animationLength / job.frameCount; //nr. of ms each frame.
                    animations[animationName] = result;

                    animations._loadCount--;
                    if(animations._loadCount == 0) {
                        allAnimations = animations;
                        callback(animations);
                    }
                }
            )
        }
    }

    /**
     * Function takes an imgSrc and splits it into frames and creates a Sprite. When done,
     * calls onLoad callback function and passes the resulting Sprite as a parameter.
     * @param {str} imgSrc src URL of image
     * @param {int} frameWidth width of sprite frame. Should be a factor of image width
     * @param {int} frameHeight height of sprite frame . Should be a factor of image height
     * @param {int} frameCount  How many frames are in the spritesheet.
     * @param {func} onLoad function that gets passed the animation object when all frames have been extracted.
     */
    function createSpriteFromSpriteSheet(imgSrc, frameWidth, frameHeight, frameCount, onLoad) {
        const img = new Image();
        img.crossOrigin = "Anonymous";  //Allow cross origin images
        img.onload = function() {   //Wait for image to load before working with it.   
            splitImage(img, frameWidth, frameHeight, frameCount, onLoad);
        }
        img.src = imgSrc;
    }


    /**
     * Takes an image(spritesheet) and splits it into frames. Image should already 
     * be loaded. Then creates a sprite. Calls onLoad callback function when done 
     * passing the resulting Sprite as a parameter.
     * @param {Image} img Spritesheet to split
     * @param {int} frameWidth width of sprite frame. Should be a factor of image width
     * @param {int} frameHeight height of sprite frame . Should be a factor of image height
     * @param {int} frameCount  How many frames in spritesheet
     * @param {func} onLoad function to call when task is done, should
     */
    function splitImage(img, frameWidth, frameHeight, frameCount, onLoad) {
        const frames = [];  //return object
        frames.loading = frameCount;  //no. of frames to load from dataURL.
        //Create canvas to use for splitting image into frames.
        const canv = document.createElement('canvas');
        const ctx = canv.getContext("2d");
        canv.width = frameWidth;
        canv.height = frameHeight;
        let srcX = 0; //sourceX for ctx.drawImage(...)
        let srcY = 0; //sourceY for ctx.drawImage(...)
        //Split into frames
        while(frameCount > 0) {
            if(srcX >= img.width) { //Start on next row
                srcX = 0;
                srcY += frameHeight;
            }
            ctx.clearRect(0, 0, frameWidth, frameHeight);
            ctx.drawImage(img, srcX, srcY, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
            createAndPushNewFrame(frames, canv, onLoad);
            
            srcX += frameWidth;
            frameCount--;
        }

    }


    /**
     * Creates a new Image object from a canvas appends to a list of frames
     * for an animation.
     * @param {list} list containing frames
     * @param {canvas} canvas
     * @param {onAllFramesLoaded} function called when last frame has loaded.
     */
    function createAndPushNewFrame(frames, canvas, onAllFramesLoaded) {
        const img = new Image();
        frames.push(img);
        img.src = canvas.toDataURL("image/png");
        img.onload = () => { 
            //When frames.loading == 0, all frames are ready.
            frames.loading--;    
            if(frames.loading == 0) {
                //source image has been split and loaded can be returned.
                frames.loading = undefined;
                const animation = new Animation(frames);
                onAllFramesLoaded(animation);
            }
        }
    }

    /**
     * Function returns an animation with given name OR if frame
     * is included, returns that frame (as an image) of the animation
     * with the given name.
     * @param {string} animationName
     * @param {int} frame get Image for specific frame of animation if included
     */
    function get(animationName, frame = -1) {
        if(frame !== -1) return allAnimations[animationName].frames[frame];
        return allAnimations[animationName];
    }



    /**
     * Development debug method. Should only be accessible
     * during development.
     */
    function _debug(obj) {
        
    }


    return {
        addSpriteSheetAnimation,
        loadAnimations,
        get,
    }

 })();

 SpriteSheetManager.addSpriteSheetAnimation("blinkeye",
    "https://res.cloudinary.com/frozenscloud/image/upload/v1541766941/blinkeye.png",
    300, 300, 17, 1000);


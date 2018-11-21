// =========
// R-TYPE
// =========
/*

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ====================
// CREATE INITIAL SHIPS
// ====================

function createInitialShips() {

    entityManager.generateShip({
        cx : 200,
        cy : 200
    });
    
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {
    
    processDiagnostics();

    if (gameManager.isInMenu()) {
        return;
    } if (gameManager.isGameOver()) {
        return;
    } if (gameManager.isInHighScoreMenu()) {
        return;
    } else  {

        if (!g_doPause) {
            entityManager.update(du);
            g_levelGenerator.update(du);
        }
    
        // Prevent perpetual firing!
        eatKey(Ship.prototype.KEY_FIRE);
    }

}

// GAME-SPECIFIC DIAGNOSTICS

var g_useAveVel = true;
var g_renderSpatialDebug = false;

var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');
var KEY_START = keyCode('R');

var KEY_STOPMOVING  = keyCode('H');

function processDiagnostics() {

    if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_STOPMOVING)) g_levelGenerator.toggleMoving();

    
    if (eatKey(KEY_START)) gameManager.startGame();	
}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {
    
    if (gameManager.isInMenu()) {

        gameManager.renderMenu(ctx);
    } else if(gameManager.isGameOver()) {

        gameManager.renderGameOver(ctx);
    }  else if (gameManager.isInHighScoreMenu()) {

        gameManager.renderHighScoreMenu(ctx);
    } else {
        
        entityManager.render(ctx);
        gameManager.renderUI(ctx);
    
        if (g_renderSpatialDebug) spatialManager.render(ctx);
    }
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};
var g_imagesLoadedFlag = false;
var g_audio = {};

function requestPreloads() {

    var requiredImages = {
        ship   : "images/player.png",
        bullet : "images/orb.png",
        block : "images/block.jpg",
        blockHell : "images/blockHell.jpg",
        soundOn : "images/soundon.png",
        soundOff : "images/soundoff.png",
        falmerHead : "https://notendur.hi.is/frg17/tlf/img/falmerbosshead.png",
        falmerSection : "https://notendur.hi.is/frg17/tlf/img/falmerbosssection.png",
        grunt : "https://notendur.hi.is/frg17/tlf/img/grunt.png",
        kamikazeye : "https://notendur.hi.is/frg17/tlf/img/yelloweye.png",
        stalker : "https://notendur.hi.is/frg17/tlf/img/stalker.png",
        powerupSpeed : "images/powerup-speed.png",
        powerupLife : "images/powerup-extralife.png",
        powerupGreenOrb : "images/powerup-greenorb.png",
        shotgunPowerup : "images/powerup_shotgun.png",
        laser : "images/laser.png",
        background : "images/backg.png",
        backgroundHell : "images/backg-hell.png",
        innards : "images/innards.png",
        gruntBullet : "images/gruntbullet.png",
    };

    SpriteSheetManager.loadAnimations(() => {
        imagesPreload(requiredImages, g_images, () => { g_imagesLoadedFlag = true });
    });

    var requiredAudio = {
        bulletFire : "sounds/bulletFire.ogg",
        shotgunFire : "sounds/shotgun.wav",
        gruntFire : "sounds/gruntFire.wav",
        stalkerFire : "sounds/stalkerFire.wav",
        kamikazeye : "sounds/splat.wav",
        death : "sounds/diesplat.wav",
    };

    audioPreload(requiredAudio, g_audio, audioLoadingCompleted);

}

function audioLoadingCompleted() {

    // we won't kick off the game until the images are all loaded as well
    if(!g_imagesLoadedFlag) {
        window.setTimeout(audioLoadingCompleted, 100); /* this checks the flag every 100 milliseconds*/
     } else {
        preloadDone();
     }
}

var g_sprites = {};

function preloadDone() {

    g_sprites.ship  = new Sprite(g_images.ship);
    g_sprites.block = new Sprite(g_images.block);
    g_sprites.blockHell = new Sprite(g_images.blockHell);
    g_sprites.soundOn = new Sprite(g_images.soundOn);
    g_sprites.soundOn.scale = {x:0.5, y:0.5};
    g_sprites.soundOff = new Sprite(g_images.soundOff);
    g_sprites.soundOff.scale = {x:0.5, y:0.5};

    g_sprites.powerupLife = new Sprite(g_images.powerupLife);
    g_sprites.powerupLife.scale = {x:0.045, y:0.045};
    g_sprites.powerupSpeed = new Sprite(g_images.powerupSpeed);
    g_sprites.powerupSpeed.scale = {x:0.3, y:0.3};
    g_sprites.powerupGreenOrb = new Sprite(g_images.powerupGreenOrb);
    g_sprites.powerupGreenOrb.scale = {x:0.3, y:0.3};
    
    g_sprites.background = new Sprite(g_images.background);

    g_sprites.falmerHead = new Sprite(g_images.falmerHead);
    g_sprites.falmerSection = new Sprite(g_images.falmerSection);
    g_sprites.grunt = new Sprite(g_images.grunt);
    g_sprites.kamikazeye = new Sprite(g_images.kamikazeye);
    g_sprites.stalker = new Sprite(g_images.stalker);

    g_sprites.bullet = new Sprite(g_images.bullet);
    g_sprites.laser = new Sprite(g_images.laser);
    g_sprites.innards = new Sprite(g_images.innards);
    g_sprites.gruntBullet = new Sprite(g_images.gruntBullet);
    g_sprites.laser.scale = {x:0.2, y:0.2};

    g_sprites.shotgun = new Sprite(g_images.shotgunPowerup);
    g_sprites.shotgun.scale = {x:0.035, y:0.035};
    entityManager.init();
    createInitialShips();

    main.init();
}


// Kick it off
requestPreloads();
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

var g_allowMixedActions = true;
var g_useGravity = false;
var g_useAveVel = true;
var g_renderSpatialDebug = false;

var KEY_MIXED   = keyCode('M');
var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');
var KEY_START = keyCode('R');

var KEY_STOPMOVING  = keyCode('H');

var KEY_0 = keyCode('0');

var KEY_1 = keyCode('1');
var KEY_2 = keyCode('2');

var KEY_K = keyCode('K');

function processDiagnostics() {

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_GRAVITY)) g_useGravity = !g_useGravity;

    if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_STOPMOVING)) g_levelGenerator.toggleMoving();

    
    if (eatKey(KEY_START)) gameManager.startGame();

    if (eatKey(KEY_0)) entityManager.toggleRocks();

    if (eatKey(KEY_1)) entityManager.generateShip({
        cx : g_mouseX,
        cy : g_mouseY,
        
        sprite : g_sprites.ship});

    if (eatKey(KEY_2)) entityManager.generateShip({
        cx : g_mouseX,
        cy : g_mouseY,
        
        sprite : g_sprites.ship2
        });

    if (eatKey(KEY_K)) entityManager.killNearestShip(
        g_mouseX, g_mouseY);
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

function requestPreloads() {

    var requiredImages = {
        ship   : "images/flappy.png",
        ship2  : "https://notendur.hi.is/~pk/308G/images/ship_2.png",
        rock   : "https://notendur.hi.is/~pk/308G/images/rock.png",
        bullet : "images/orb.png",
        block : "images/block.jpg",
        soundOn : "images/soundon.png",
        soundOff : "images/soundoff.png",
        falmerHead : "https://notendur.hi.is/frg17/tlf/img/falmerbosshead.png",
        falmerSection : "https://notendur.hi.is/frg17/tlf/img/falmerbosssection.png",
        grunt : "https://notendur.hi.is/frg17/tlf/img/yelloweye.png",
        powerup : "images/star-powerup-icon.png",
        background : "images/backg.png"
    };

    SpriteSheetManager.loadAnimations(() => {
        imagesPreload(requiredImages, g_images, preloadDone);
    });
}

var g_sprites = {};

function preloadDone() {

    g_sprites.ship  = new Sprite(g_images.ship);
    g_sprites.ship2 = new Sprite(g_images.ship2);
    g_sprites.rock  = new Sprite(g_images.rock);
    g_sprites.block = new Sprite(g_images.block);
    g_sprites.soundOn = new Sprite(g_images.soundOn);
    g_sprites.soundOff = new Sprite(g_images.soundOff);
    g_sprites.powerup = new Sprite(g_images.powerup);
    g_sprites.powerup.scale = {x:0.02, y:0.02};
    g_sprites.background = new Sprite(g_images.background);

    g_sprites.falmerHead = new Sprite(g_images.falmerHead);
    g_sprites.falmerSection = new Sprite(g_images.falmerSection);
    g_sprites.grunt = new Sprite(g_images.grunt);

    g_sprites.bullet = new Sprite(g_images.bullet);
    g_sprites.bullet.scale = {x:0.03, y:0.03};

    entityManager.init();
    createInitialShips();

    main.init();
}

// Kick it off
requestPreloads();
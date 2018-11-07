// ==============================
//  GAME MANAGER
// ==============================

/*

    gameManager.js

    A module which handles arbitrary game-management for "R-Type"


    We create this module as a single global object, and initialise it
    with suitable 'data' and 'methods'.

    "Private" properties are denoted by an underscore prefix convention.

*/


"use strict";

/*jslint nomen: true, white: true, plusplus: true*/


const gameManager = {

    _onMenu: true,
    _isGameOver: false,
    _isWon: false,
    
    startGame: function () {
        this._onMenu = false;
    },

    // ================
    // Main Menu stuff
    // ================

    isInMenu: function () {
        return this._onMenu;
    },

    renderMenu: function (ctx) {
        this.drawMenu(ctx, "ROBOTRON");
    },

    drawMenu: function (ctx) {

        const startMessage = "Press R to start the game";
        const halfHeight = g_canvas.height / 2;
        const halfWidth = g_canvas.width / 2; 
        
        ctx.save();
        ctx.fillStyle = "#333";
        ctx.fillRect(0, halfHeight / 2, halfWidth * 2, halfHeight);
        
        ctx.fillStyle = "#0bc3c3";
        ctx.textAlign = "center";
        
        ctx.font = "bold 55px sans-serif";
        ctx.fillText("R-TYPE", halfWidth, halfHeight);
        ctx.font = "bold 25px sans-serif";
        ctx.fillText(startMessage, halfWidth, halfHeight * 3 / 2 - 100);
        
        ctx.restore();
    },

    toggleSound: function(ctx) {
        this.sprite = g_sprites.soundOn;
        this.sprite.drawCentredAt(ctx, g_canvas.width - 40, g_canvas.height - 140, 0);
    },

    extraLives: function(ctx, livesLeft) {
        this.sprite = g_sprites.ship;
        var origScale = this.sprite.scale;
        this.sprite.scale = {x: 0.7, y: 0.7};
        for (var i=0; i<livesLeft; i++) {
            this.sprite.drawCentredAt(ctx, 30 + i*50, g_canvas.height - 70, Math.PI/4);
        }
        this.sprite.scale = origScale;
    }
}
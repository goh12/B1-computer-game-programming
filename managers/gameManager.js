// ==============================
//  GAME MANAGER
// ==============================

/*

    gameManager.js

    A module which handles arbitrary game-management for "iType: Kreyetos' Revenge"


    We create this module as a single global object, and initialise it
    with suitable 'data' and 'methods'.

    "Private" properties are denoted by an underscore prefix convention.

*/


"use strict";

/*jslint nomen: true, white: true, plusplus: true*/


const gameManager = {

    _onMenu: true,
    _isGameOver: false,
    _isInHighScoreMenu: false,
    _audioOn: true,
    _soundSpeaker: {x: g_canvas.width-20, y: g_canvas.height-20},
    _menuButtonWidth: 300,
    _menuButtonHeight: 80,
    _menuButtons: [],
    _score: 0,
    _highScore: [0],
    _highScoresFetched: false,
    _fetchingHighScores: false,
    _postingHighScore: false,

    setPostingHighScore: function(bool) {
        this._postingHighScore = bool;
    },

    startGame: function () {
        this._onMenu = false;
        this._isGameOver = false;
        this._isInHighScoreMenu = false;
        this._score = 0;

        this.getHighScoreData();

        this.resetGame();

        // play the background music if it exists
        if (typeof g_audio.backgroundMusic !== 'undefined') {
            g_audio.backgroundMusic.loop = true;
            g_audio.backgroundMusic.play();
            g_audio.backgroundMusic.volume = 0.5;
        }
    },
    
    resetGame : function () {
        // Reset the game
        const player = entityManager.getPlayer();
        entityManager.reset();
        spatialManager.reset();
        g_levelGenerator.reset();
        player.reset();
    },

    toggleSound: function() {
        this._audioOn = !this._audioOn;

        // either start or stop the background music
        if (!this._audioOn) {
            g_audio.backgroundMusic.pause();
        } else {
            g_audio.backgroundMusic.play();
        }
		console.log("sound toggled");
    },

    extraLives: function(ctx) {
        this.sprite = g_sprites.ship;
        var origScale = this.sprite.scale;
        this.sprite.scale = {x: 0.7, y: 0.7};

        const player = entityManager.getPlayer();
        for (var i=0; i< player.getLives(); i++) {
            this.sprite.drawCentredAt(ctx, 30 + i*50, g_canvas.height - 30, 0);
        }
        this.sprite.scale = origScale;
    },

    menuText: function(ctx) {
        ctx.save();

        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Press [P] for Pause Menu", g_canvas.width/2, g_canvas.height-20);

        // write if the player has shotgun ammo
        const player = entityManager.getPlayer();
        if (player.getHasShotgun()) {
            const ammo = player.getAmmo();
            ctx.fillText("Ammo: " + ammo, g_canvas.width * (3/4), g_canvas.height-20);
        }
        ctx.restore();
    },

    scoreText: function(ctx) {
        ctx.save()

        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";
        ctx.font = "bold 25px sans-serif";
        ctx.fillText("Score: " + this._score, g_canvas.width/2, 30);

        ctx.restore();
    },

    getScore : function(ctx) {
        return this._score;
    },

    soundSpeaker: function(ctx) {
        ctx.save();
        if (this._audioOn) {
            this.sprite = g_sprites.soundOn;
            this.sprite.drawCentredAt(ctx, this._soundSpeaker.x, this._soundSpeaker.y, 0);
        } else {
            this.sprite = g_sprites.soundOff;
            this.sprite.drawCentredAt(ctx, this._soundSpeaker.x, this._soundSpeaker.y, 0);
        }
        ctx.restore();
    },

    pauseMenu: function(ctx) {
        if (g_doPause) {
            ctx.save();

            // Grey overlay
            ctx.fillStyle = "black";
            ctx.globalAlpha = 0.2;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalAlpha = 1;

            ctx.fillStyle = "#FFF";
            ctx.textAlign = "center";
            ctx.font = "bold 20px sans-serif";
            var menuItems = ["Mute/unmute sound [M]", "Resume [P]"];
            for (var i=0; i<menuItems.length; i++) {
                var x = g_canvas.width/2 - this._menuButtonWidth/2;
                var y = g_canvas.height/1.7 + (menuItems.length-2*i)*(this._menuButtonHeight/2+5);
                util.fillBox(ctx, x, y, this._menuButtonWidth, this._menuButtonHeight, "#333");
                ctx.fillText(menuItems[i], g_canvas.width/2,
                    g_canvas.height/1.7 + (menuItems.length-2*i)*(this._menuButtonHeight/2+5)+40);
                this._menuButtons[i] = {name: menuItems[i], x: x, y: y};
            }
			this.displayHighScores(ctx);
            ctx.restore();
        }
    },

    mouseClick: function(mouseX, mouseY) {
        if (util.isBetween(mouseX, this._soundSpeaker.x, this._soundSpeaker.x+40)
                && util.isBetween(mouseY, this._soundSpeaker.y, this._soundSpeaker.y+40)) {
            this.toggleSound();
        }

        if (g_doPause) {
            for (var i=0; i<this._menuButtons.length; i++) {
                if (util.isBetween(mouseX, this._menuButtons[i].x, this._menuButtons[i].x+this._menuButtonWidth)
                    && util.isBetween(mouseY, this._menuButtons[i].y, this._menuButtons[i].y+this._menuButtonHeight)) {
                    if (i===0) this.toggleSound();
                    if (i===1) g_doPause = !g_doPause;
                }
            }
        }
    },

    displayHighScores: function(ctx) {
        ctx.font = "bold 30px sans-serif";
		ctx.fillText("HIGH SCORES", g_canvas.width/2, 75);
        ctx.font = "bold 20px sans-serif";
		for (var i=0; i<gameManager._highScore.length; i++) {
			if (gameManager._highScore[i] != undefined) {
				ctx.fillText(i+1 + ". " + this._highScore[i].player + " [" + this._highScore[i].score + "]", 
				g_canvas.width/2, 105 + 25*i);
			}
		}
    },

	getHighScoreData: function() {
        if(this._postingHighScore) return;
        if(this._highScoresFetched) return;

        this._fetchingHighScores = true;
        this._highScoresFetched = true;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var json = JSON.parse(xhttp.responseText);
				json.scores.sort(function(a,b) {
						return b.score - a.score;
				});
				for (var j=0; j<10; j++) {
					gameManager._highScore[j] = json.scores[j];
                }
                gameManager._fetchingHighScores = false;
			}
		};
		xhttp.open("GET", "https://riseofeyes-hs.herokuapp.com/", true);
		xhttp.send();
    },
	
    renderUI: function(ctx) {
        this.extraLives(ctx);
        this.scoreText(ctx);
        this.menuText(ctx);
        this.soundSpeaker(ctx);
        this.pauseMenu(ctx);
    },

    // ================
    // Main Menu stuff
    // ================

    isInMenu: function () {
        return this._onMenu;
    },

    renderMenu: function (ctx) {

        const startMessage = "Press [R] to start the game";
        const halfHeight = g_canvas.height / 2;
        const halfWidth = g_canvas.width / 2; 
        
        ctx.save();
        ctx.fillStyle = "#333";
        ctx.fillRect(0, halfHeight / 2, halfWidth * 2, halfHeight);
        
        ctx.fillStyle = "#0bc3c3";
        ctx.textAlign = "center";
        
        ctx.font = "bold 55px sans-serif";
        ctx.fillText("iType", halfWidth, halfHeight);
        ctx.font = "bold 25px sans-serif";
        ctx.fillText(startMessage, halfWidth, halfHeight * 3 / 2 - 100);
        
        ctx.restore();
    },

    // =======================
    // Game Over stuff
    // =======================

    isGameOver : function () {
        return this._isGameOver;
    },

    renderGameOver : function (ctx) {

        document.getElementById('PlayerName').type = 'text';

        const gameOverMessage = "Game Over";
        const gameOverInstructions = "Enter your name to submit your high score";
        const halfHeight = g_canvas.height / 2;
        const halfWidth = g_canvas.width / 2; 
        
        ctx.save();

        ctx.fillStyle = "#0bc3c3";
        ctx.textAlign = "center";
        
        ctx.font = "bold 55px sans-serif";
        ctx.fillText(gameOverMessage, halfWidth, halfHeight - 100);
        ctx.font = "bold 25px sans-serif";
        ctx.fillText(gameOverInstructions, halfWidth, halfHeight - 50);
        
        ctx.restore();
    },

    toggleGameOver : function () {
        this._isGameOver = !this._isGameOver;

        // if it's game over, stop the background music and reset it
        if (typeof g_audio.backgroundMusic !== 'undefined') {
            g_audio.backgroundMusic.pause();
            g_audio.backgroundMusic.currentTime = 0;            
        }
    },

    isInHighScoreMenu : function () {
        return this._isInHighScoreMenu;
    },

    toggleHighScoreMenu : function () {
        this._isInHighScoreMenu = !this._isInHighScoreMenu;
    },

    needUpdateHighScores : function() {
        this._highScoresFetched = false;
    },

    renderHighScoreMenu : function (ctx) {
        this.getHighScoreData();

        if(this._fetchingHighScores || this._postingHighScore) {
            ctx.save();

            ctx.textAlign = "center";

            
            ctx.font = "bold 25px sans-serif";
            ctx.fillText("Loading", g_canvas.width / 2, g_canvas.height / 2);
            
            ctx.restore();
        } else {
            const highScoreMessage = "Press [R] to restart the game";

            ctx.save();
            
            ctx.fillStyle = "#000";
            ctx.rect(0, 0, g_canvas.width, g_canvas.height);
            
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            this.displayHighScores(ctx);
            
            ctx.font = "bold 25px sans-serif";
            ctx.fillText(highScoreMessage, g_canvas.width / 2, g_canvas.height - 70);
            
            ctx.restore();
        }
    }
}
/**
 * 
 * @param {number} x x coordinate where stalker should stay to fire at player
 * @param {number} y y coordinate where stalker should stay to fire at player
 */
function Stalker(stayX, stayY) {
    this.speed = 7;
    this.speedSq = this.speed* this.speed;

    this.sprite = g_sprites.stalker;

    this.cx = g_canvas.width + this.getRadius() * 2;
    this.cy = g_canvas.height/2 + (-100 + Math.random() * 200);
    this.stayPosition = { posX: stayX, posY: stayY };

    this.gunTimer = 30; //Timer in nominals.

    const x = this.stayPosition.posX; //Calculate angle between start position
    const y = this.stayPosition.posY; //and blowPosition
    const angle = Math.atan2(y - this.cy, x - this.cx);

    //Calculate velocities using the angle.
    this.velX = Math.cos(angle) * this.speed;
    this.velY = Math.sin(angle) * this.speed;

}

Stalker.prototype = new Enemy();

Stalker.prototype.updateThis = function(du) {
    this.gunTimer--;

    const dx = this.stayPosition.posX - this.cx; //Calculate delta squared
    const dy = this.stayPosition.posY - this.cy;
    const deltaSq = (dx * dx) + (dy * dy);
    
    if(deltaSq < this.speedSq) { //Check if reached blowposition
        this.cx = this.stayPosition.posX;
        this.cy = this.stayPosition.posY;
        if(this.gunTimer < 0) {
            this.fire();
        }
    } else {  //Else keep moving.
        this.cx += this.velX * du;
        this.cy += this.velY * du;
    }
    
}


Stalker.prototype.fire = function() {
    const BULLET_SPEED = 8;
    const playerPos = entityManager.getPlayer().getPos();
    
    var angleRadians = Math.atan2(
        playerPos.posY - this.cy,
        playerPos.posX - this.cx
    );

    const bulletXVel = Math.cos(angleRadians) * BULLET_SPEED;
    const bulletYVel = Math.sin(angleRadians) * BULLET_SPEED;

    if (typeof g_audio.stalkerFire !== 'undefined') {
        util.playSound(g_audio.stalkerFire, 1);
    }

    entityManager.fireBullet(
        this.cx - this.getRadius(), this.cy,
        bulletXVel, bulletYVel,
        angleRadians,
        "enemyBullet",
        g_sprites.laser);

    this.gunTimer = 30;
}


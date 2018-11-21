function Kamikazeye() {
    this.sprite = g_sprites.kamikazeye;

    this.exploding = false;
    this.speed = 8;
    this.speedSq = this.speed * this.speed; //Used in checking for final position.

    this.cx = g_canvas.width + this.getRadius() * 2;
    this.cy = g_canvas.height/2 + (-100 + util.random() * 200   );

    this.blowPosition = entityManager.getPlayer().getPos(); //Position where to explode.

    const x = this.blowPosition.posX; //Calculate angle between start position
    const y = this.blowPosition.posY; //and blowPosition
    const angle = Math.atan2(y - this.cy, x - this.cx);

    //Calculate velocities using the angle.
    this.velX = Math.cos(angle) * this.speed;
    this.velY = Math.sin(angle) * this.speed;
}

Kamikazeye.prototype = new Enemy();

Kamikazeye.prototype.updateThis = function(du) {
    if(this.exploding) {
        if(this.scale.x > 1.3) { //Blow up
            const newScale = {
                x: this.scale.x * (1.01*du),
                y: this.scale.y * (1.01*du)
            }
            this.scale = newScale;
        } else {
            for(let i = 0; i < 8; i++) { //EXPLOSION OCCURRS
                entityManager.fireBullet(
                    this.cx, this.cy,
                    Math.cos((i/8) * Math.PI * 2) * 5,
                    Math.sin((i/8) * Math.PI * 2) * 5,
                    0,
                    "enemyBullet",
                    g_sprites.innards
                );
            }
            this.kill();
        }
    }

    //If entity is not exploding. Move it toward blowPosition.
    const dx = this.blowPosition.posX - this.cx; //Calculate delta squared
    const dy = this.blowPosition.posY - this.cy;
    const deltaSq = (dx * dx) + (dy * dy);
    
    if(deltaSq < this.speedSq) { //Check if reached blowposition
        this.cx = this.blowPosition.posX;
        this.cy = this.blowPosition.posY;
        this.explode();
    } else {  //Else keep moving.
        this.cx += this.velX * du;
        this.cy += this.velY * du;
    }
}

Kamikazeye.prototype.explode = function() {
    this.exploding = true;
}

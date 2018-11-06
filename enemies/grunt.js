function Grunt(descr) {
    this.setup(descr);

    this.sprite = this.sprite || g_sprites.rock;
    this.scale  = this.scale  || {x:1, y:1};
}

Grunt.prototype = Enemy.prototype;

//Object specific update function (called automatically in Enemy update function.)
Grunt.prototype.updateThis = function(du) {
    // Handle firing
    this.maybeFireBullet();
}

// Grunt has a half percent chance of firing

Grunt.prototype.maybeFireBullet = function () {
    if (this.cx > g_canvas.width || this.cx < 0) return;
    if (Math.random() < 0.005) {
        const BULLET_SPEED = 4;
        const playerPos = entityManager.getPlayer().getPos();
        
        var angleRadians = Math.atan2(
            playerPos.posY - this.cy,
            playerPos.posX - this.cx
        );

        const bulletXVel = Math.cos(angleRadians) * BULLET_SPEED;
        const bulletYVel = Math.sin(angleRadians) * BULLET_SPEED;

        entityManager.fireBullet(
           this.cx - this.sprite.width/2, this.cy,
           bulletXVel, bulletYVel,
           this.rotation,
           "enemyBullet");
    }
};
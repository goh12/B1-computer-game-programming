function Grunt(descr) {
    this.setup(descr);

    this.sprite = this.sprite || g_sprites.rock;
    this.scale  = this.scale  || {x:1, y:1};
}

Grunt.prototype = Enemy.prototype;

//Object specific update function (called automatically in Enemy update function.)
Grunt.prototype.updateThis = function(du) {
    this.cx += this.velX * du;
    this.cy += this.velY * du;

    // Handle firing
    this.maybeFireBullet();
}

// Grunt has a half percent chance of firing

Grunt.prototype.maybeFireBullet = function () {
    if (Math.random() < 0.005) {
        const BULLET_SPEED = 5;

        entityManager.fireBullet(
           this.cx - this.sprite.width/2, this.cy,
           -BULLET_SPEED, 0,
           this.rotation,
           "enemyBullet");
    }
};
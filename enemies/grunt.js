function Grunt(descr) {
    this.setup(descr);

    this.sprite = this.sprite || g_sprites.grunt;
    this.scale  = this.scale  || {x:1, y:1};
    this.fireChance = 0.005;
    this.bulletFireChecks = 0;
}

Grunt.prototype = new Enemy();

//Object specific update function (called automatically in Enemy update function.)
Grunt.prototype.updateThis = function(du) {
    // Handle firing
    
    this.maybeFireBullet(du);
}

// Grunt has a half percent chance of firing

Grunt.prototype.maybeFireBullet = function (du) {
    if (this.cx > g_canvas.width || this.cx < 0) return;
    this.bulletFireChecks += du;
    while(this.bulletFireChecks > 1) {
        this.bulletFireChecks -= 1;
        if (Math.random() < this.fireChance) {
            const BULLET_SPEED = 4;
            const playerPos = entityManager.getPlayer().getPos();
            
            var angleRadians = Math.atan2(
                playerPos.posY - this.cy,
                playerPos.posX - this.cx
            );
    
            const bulletXVel = Math.cos(angleRadians) * BULLET_SPEED;
            const bulletYVel = Math.sin(angleRadians) * BULLET_SPEED;
    
            entityManager.fireBullet(
               this.cx - this.getRadius(), this.cy,
               bulletXVel, bulletYVel,
               this.rotation,
               "enemyBullet");
            
            return; //Don't fire twice inside same frame
        }
    }
    
};
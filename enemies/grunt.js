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
}
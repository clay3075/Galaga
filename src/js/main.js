String.prototype.spliceForTimer = function() {
    delCount = 0;
    newSubStr = "."
    if (this.length === 5) {
        start = 2;
    }
    else if (this.length === 4) {
        start = 1
    }
    else {
        return 0;
    }
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};

var game = new Phaser.Game(600, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update });

function preload() {
    game.load.image('spaceship', 'assets/spaceship.png');
    game.load.image('alien', 'assets/alien.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.audio('bulletFire', 'sounds/laserBlast.mp3');
    game.load.audio('cheeringSound', 'sounds/cheering.mp3');
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically   = true;

}

class gameKeeper {
    constructor() {
        this.style      = {fill: "#ff0044", align: "center"};
        this.scoreText;
        this.timerText;
        this.score      = 0;
        this.enemies    = 15;
        this.difficulty = 1;
    }
    enemyKilled() {
        this.enemies--;
        this.score += 100;
        this.scoreText.text = this.score;
    }
    enemyMissed() {
        this.score -= 100;
        this.scoreText.text = this.score;
    }
    resetSoft() {
        alienG.render();
        this.enemies = 15;
        this.difficulty += .8;
        alienG.update();
    }
    resetHard() {
        console.log("good");
        var temp = game.add.text(game.world.width / 2 - 50, game.world.height / 2, "Times Up!!", this.style);
        setTimeout(function() {
            temp.kill();
            alienG.render();
            game.time.events.add(60000, gameMaster.gameOver, this);
        }, 3000);
        this.score      = 0;
        this.difficulty = 1;
        this.enemies    = 15;
        this.scoreText.text = 0;
        spaceship.x = game.world.width / 2;
        spaceship.y = game.world.height - 65;
    }
    gameOver() {
        //console.log('good')
        gameMaster.resetHard();
    };
}
var spaceship;
var aliens;
var bullets;
var gameMaster = new gameKeeper();
var alienG;
var blasterSound;
var cheeringSound;
var tempX;


function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.setBoundsToWorld();
    spaceship = game.add.sprite(game.world.width / 2, game.world.height - 65, 'spaceship');
    spaceship.scale.setTo(.5,.5);
    game.physics.arcade.enable(spaceship);
    spaceship.body.collideWorldBounds = true;
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    game.input.onDown.add(shoot);
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;
    alienG = new alienGroup();
    alienG.render();
    gameMaster.scoreText = game.add.text(15, 15, String(gameMaster.score), gameMaster.style);
    blasterSound  = game.add.audio('bulletFire');
    cheeringSound = game.add.audio('cheeringSound');
    tempX = game.world.x + aliens.x;
    game.time.events.add(Phaser.Timer.SECOND * 5, gameMaster.gameOver, this);
    gameMaster.timerText = game.add.text((game.world.width / 2) - 50, 15, "Time: " + String(game.time.events.duration).spliceForTimer(), gameMaster.style);
}

function update() {
    spaceship.x = game.input.x;
    gameMaster.timerText.text = "Time: " + String(game.time.events.duration).spliceForTimer();
    game.physics.arcade.collide(bullets, aliens, kill);
    if (gameMaster.enemies == 0){
        cheeringSound.play();
        gameMaster.resetSoft();
    }
    alienG.sway();
}

function kill(sprite1, sprite2) {
    sprite1.kill();
    if (sprite2){
        sprite2.kill();
    }
    gameMaster.enemyKilled();
}


function shoot() {
    let bullet;
    bullet = game.add.sprite(spaceship.x, spaceship.y, 'bullet');
    bullet.scale.setTo(.5,.5);
    game.physics.arcade.enable(bullet, Phaser.Physics.ARCADE);
    bullet.body.velocity.y = -400;
    bullet.body.velocity.x = 0;
    bullet.checkWorldBounds = true;
    bullet.events.onOutOfBounds.add(function(sprite){sprite.kill();gameMaster.enemyMissed()}, this);
    bullets.add(bullet);
    blasterSound.play();
}

class alienGroup {
    constructor () {
        this.rows     = 3;
        this.cols     = 5;
        this.paddingX = 70;
        this.paddingY = 70;
        this.x        = 135;
        this.y        = 100;
        this.swayS    = 'right';
        this.speed    = gameMaster.difficulty;
    }
    render () {
        let alien;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                alien = game.add.sprite((game.world.x + this.paddingX) * col + this.x, (game.world.y + this.paddingY) * row + this.y, 'alien');
                game.physics.arcade.enable(alien, Phaser.Physics.ARCADE);
                aliens.add(alien);
            }
        }
    }
    update () {
        this.speed = gameMaster.difficulty;
    }
    sway () {
        let motion = 75;
        if (this.swayS == 'right'){
            if (aliens.x >= tempX + motion){this.swayS = 'left'};
            aliens.x += this.speed;
        }
        else if (this.swayS == 'left'){
            if (aliens.x <= tempX - motion){this.swayS = 'right'};
            aliens.x -= this.speed;
        }
    }
}

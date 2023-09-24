let img;
let img2;
let rotationAngle = 0;
let bullets = []; // Array to store bullets
let game;
let enemies;
let pathkey;
let angleToMob;

const STOPSIGN = "."

const config = {
  'PATH': "RRUUUUUUURRRRDDDDRRRRUUUUUUURRRRDDDDDDDDRRR",
}

const IMAGE_DIR = "assets/images/"

class Enemy {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.size = 30;
    this.alive = true;
    this.health = 1
    this.moveAmount = 40;
    this.directions = ''; // Store the directions as a string
    this.currentDirectionIndex = 0; // Track the current direction
  }

  setDirections(directions) {
    // Set the directions for the enemy to follow
    this.directions = directions + STOPSIGN
    this.currentDirectionIndex = 0; // Reset the direction index
  }
  
  hit(){
    this.health -= 1
    if(this.health == 0) this.alive = false
    print("hit")
  }
  
  move() {
    if (!this.alive) return;
    if (this.directions.length > 0) {
      // Get the current direction
      var slowDown = 10;
      var index = floor(this.currentDirectionIndex/slowDown);
      const currentDirection = this.directions[index];

      if (currentDirection === 'R') this.x += this.moveAmount / slowDown;
      else if (currentDirection === 'L') this.x -= this.moveAmount / slowDown;
      else if (currentDirection === 'D') this.y += this.moveAmount / slowDown;
      else if (currentDirection === 'U') this.y -= this.moveAmount / slowDown;
      else if (currentDirection === STOPSIGN) { 
        this.alive = false;
        game.takeHit();
      }
      else throw new Error("Wrong character!")
      // Move to the next direction if possible
      if (index < this.directions.length - 1) {
        this.currentDirectionIndex++;
      }
    }
  }

  draw() {
    if(!this.alive) return
    push()
    fill(100)
    rect(this.x, this.y, this.size, this.size);
    pop();
  }
}

class Turret{
  constructor(x, y){
    this.damage = 1
    this.speed = 1
    this.range = 100
    this.size = 60
    this.x = x
    this.y = y
    this.startShooting();
  }

  startShooting() {
    setInterval(this.shoots, 500*this.speed)
  }
  
  shoots() {
    var target = targetEnemy();
    if (!target) return
    target.hit()
    push()
    fill(300,100,0)
    rect(350,100,100,100)
    pop()
}
  
  draw(){
    push();
    translate(this.x, this.y); // Move the image to the center of rotation
    rotate(angleToMob); // Rotate the turret to face the mob
    image(img, 0, 0, this.size * 2, this.size * 1.5);
    pop();
  }
  
}
  
class Path {
  constructor(path, x, y, size) {
    this.path = path.split("")
    this.x = x
    this.y = y
    this.size = size;
  }
  
  draw() {
    var x = this.x;
    var y = this.y;
    var size = this.size;
    rect(x,y,size);
    this.path.forEach(p => {
      if(p == "R")
        x += size
      if(p == "L")
        x -= size;
      if(p == "U")
        y -= size;
      if(p == "D")
        y += size

      rect(x,y,size,size);
    })
  }
  
}

class Game {
  constructor() {
    this.score = 10
  }
  
  takeHit() {
    this.score--;
  }
  
  gameOver() {
    return this.score <= 0;
  }
  
  draw() {
    text(this.score,10,20)
  }
}

function setup() {
  createCanvas(700, 550);
  imageMode(CENTER);
  rectMode(CENTER);
  path = new Path(config["PATH"],20,500,40);
  hits = 0
  enemies = [];
  game = new Game();
  angleToMob = 0
  
  createEnemy();
  setInterval(createEnemy, 400);
  turret = new Turret(340,300)
}

function preload() {
  img = loadImage(IMAGE_DIR + "turret.png");
  img2 = loadImage(IMAGE_DIR  + "bullet.png");
}

function createEnemy() {
  print("Creating enemy")
  var newEnemy = new Enemy(path.x, path.y);
  newEnemy.setDirections(config["PATH"]);
  enemies.push(newEnemy);
}

function targetEnemy() {
  var enemiesAlive = enemies.filter(enemy => enemy.alive);
  
  if(enemiesAlive.length == 0) return;
  var enemyToShoot = enemiesAlive[0];
  return enemyToShoot;
}


function draw() {
  background(200, 220);
  path.draw();
  turret.draw()

  enemies.map(enemy => {
    enemy.draw();
    enemy.move()
  })

  game.draw();

  var enemyToShoot = targetEnemy();
  if(!enemyToShoot) return;

  let dx = enemyToShoot.x - turret.x;
  let dy = enemyToShoot.y - turret.y;
  angleToMob = atan2(dy, dx);
}
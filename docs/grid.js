class Block extends MatterObject {
  static cursor;
  constructor(grid, row, col, type) {
    super();
    this.type = type;
    this.grid = grid;
    this.type = type;
    this.row = row;
    this.col = col;
    this.x = grid.x + col * grid.size 
    this.y = grid.y + row * grid.size
    var airAbove = true;
    this.health = 100;

  }

  serialize() {
    return {row: this.row, col: this.col, type: this.type};
  }
  
  addToWorld() {
    logIt("Creating body at ", this.row, this.col);
    if(this.body || !this.isVisible()) {
      logIt("... canceled - not visible or already has a body")
      return;
    }
    var grid = this.grid;
    this.body = Bodies.rectangle(this.x, this.y, grid.size, grid.size, 
                                 { isStatic: true, friction: 0 });
    World.add(world, this.body);        
  }
  
  isVisible() {
    return !this.isDestroyed() && this.type != config.blockTypes.AIR;
  }

  isTouchedByMouse() {
    if(!this.body) return false;
    var translate = MatterObject._translate;
    var coordinates = {x:mouseX-translate.x,y:mouseY-translate.y};
    var isInside = Matter.Vertices.contains(this.body.vertices,coordinates);
    return isInside;
  }

  isNearPlayer(radius = 3){
    var player = Game.player;
    var playerCords = player.getCoordinates()
    // print(playerCords)
    var blockCords = {row: this.row, col: this.col };//Game.grid.getCoordinates();
    if (!blockCords || !playerCords) return false;
    var distanceRow = blockCords.row-playerCords.row
    var distanceCol = blockCords.col-playerCords.col
    // print(distanceRow,distanceCol)
    if(abs(distanceRow) + abs(distanceCol) <= radius) return true;

  }

  mouseReleased() {
    // if it wasn't fully destroyed then restore it back to 100
    if(!this.isDestroyed())
      this.health = 100;
  }

  takeHit() {
    var typeName = config.blockTypesMap[this.type];
    var hit = config.hitSpeedByBlockType[typeName] * config.hitSpeed;
    if(hit == 0) console.error("Could not find blocktype");
    this.health -= hit;
    sounds.shovel();
  }

  isDestroyed() {
    return this.health<=0;   
  }

  shouldBePhysical() {
    if(!this.isVisible()) return false;
    var physical = false;
    this.neighbors().map(b => {
      if(physical) return;
      physical = !b.isVisible();
    })
    return physical;
  }

  neighbors() {
    var neighbors = [[1,0],[0,-1],[0,1],[-1,0]];
    logIt("Destroying block",this.row,this.col);
    return neighbors.map(neighbor => {
      var row = this.row + neighbor[0];
      var col = this.col + neighbor[1];
      // corner cases: top rows/cols
      if(row<0 || row == this.grid.rows) return;
      if(col<0 || col == this.grid.cols) return;
      return this.grid.grid[row][col];
    })
      // filter out empty blocks (i.e. out of grid)
      .filter(b => b);
  }

  mouseDown() {
    
    if (mouseButton != LEFT) return;
    if(this.isTouchedByMouse()&&this.isNearPlayer()) {
      this.takeHit();
      // take the hit and then return
      if(!this.isDestroyed())
        return;
      // create a physical body for all neighbors
      Game.inventory.addItem(this.type)
      this.type = config.blockTypes.AIR;
      this.neighbors().map(brick => brick.addToWorld());
      World.remove(world,this.body);
      delete(this.body);
    }
  }
  
  drawDamage() {
    if(this.health<100){
      // this.health goes from 100 to 0 => level got from 7 to 10 
      var level = map(this.health,100,0,7,10);
      level = floor(level);
      // image is too small otherwise
      scale(30,30)
      image(spriteCache[level],0,0)
    }
  }

  image() {
    return imageCache[this.type];
  }

  draw(wireFrame) {
    if(this.isTouchedByMouse()) {
      // Block.cursor = HAND;
    };
    if (this.isVisible()) {
      if(wireFrame) {
        if(!this.body) return
        rect(this.x,this.y,this.grid.size,this.grid.size);
        push();
        textSize(8);
        var label = `${this.row}/${this.col}`;
        text(label,this.x-this.grid.blockSize/50,this.y);

        pop();
        return;
      }
      push();
      translate(this.x,this.y);
      if(this.isNearPlayer(10)) {
        scale(this.grid.size/this.grid.blockSize)
        image(this.image(),0,0)
      }
      else {
        fill(200);
        rect(0,0,this.grid.size,this.grid.size);
      }
      this.drawDamage();
      pop();
    }
  }
}


//cols=collumns | size is the size of a single square
class Grid {
  constructor(x, y, rows, cols, size) {
    this.x = x;
    this.y = y;
    var mapBlocks = 10;
    var img = images.blocks;
    var blockSize = img.width / mapBlocks; // 287 or 10
    this.size = size;
    this.blockSize = blockSize;
    this.rows = rows;
    this.cols = cols;

    var grid = [];
    this.grid = grid;

    for (var i = 0; i < rows; i++) {
      var row = [];
      for (var j = 0; j < cols; j++) {
        var blockType = this.blockType(i, j);
        row.push(new Block(this, i, j, blockType));
      }
      grid.push(row);
    }

  }

  addPhysicalObjects() {
    var grid = this.grid;
    // 2nd pass to find out if some objects are physical
    for (var i = 0; i < this.rows; i++) {
      var row = [];
      for (var j = 0; j < this.cols; j++) {
        if(grid[i][j].shouldBePhysical())
          grid[i][j].addToWorld()
      }
    }
  }

  blockType(row, col) {
    col*=0.15
    var waveOne=Math.sin(col/2)
    var waveTwo=Math.cos(3*col/2)/2
    var waveThree=Math.sin(3*col/4)
      
    var h = -3.5*(-1.4+(waveOne+waveTwo)*waveThree);

    let blockType;

    const BLOCKTYPE = config.blockTypes;
    
    if (row < h){
      // air
      blockType = BLOCKTYPE.AIR;
    }
    else if(row<h+1){
      blockType = BLOCKTYPE.GRASS;
    }
    else if(row>h+3){
      blockType = BLOCKTYPE.STONE;
        // place iron with prob
      if (random() < 0.15) blockType = BLOCKTYPE.COAL;
      if (random() < 0.1) blockType = BLOCKTYPE.IRON;
      // place diamongs but only at a certain depth
      if (row > 12 && random() < 0.05)
        // if(random() < 0.005 * (10-row))
        blockType = BLOCKTYPE.DIAMOND;
    }
    else {
      blockType = BLOCKTYPE.DIRT;

    }

    return blockType;
  }

  serialize() {
    return JSON.stringify(this,(key,value) => {
      if(key == "grid") {
        var grid = value;
        var serialized = [];
        for(var i=0;i<this.rows;i++) {
          var row = [];
          for(var j=0;j<this.cols;j++) {
              row.push(grid[i][j].serialize())
          }
          serialized.push(row);
        }
        return serialized;
      }
      return value;
    })
  }

  printOut() {
    this.grid.map(row => console.log(row.map(c => (c.type=="11") ? " " : c.type).join("")))
  }

  applyMap(encodedMap) {
    var newGrid = JSON.parse(encodedMap);

    this.grid.map(row => row.map(b => b.cleanup()));
    console.log("Cleaned up");
    this.grid = [];
    for(var i = 0; i < newGrid.rows; i++) {
      var row = []
      for(var j = 0; j < newGrid.cols; j++) {
        var block = new Block(this, i, j, newGrid.grid[i][j].type);
        row.push(block);
      }
      this.grid.push(row);
    }

    this.rows = newGrid.rows;
    this.cols = newGrid.cols;
    this.addPhysicalObjects();
  }

  getCoordinates() {
    var col = round(( mouseX - this.x - MatterObject._translate.x ) / config.grid.blockSize);
    var row = round(( mouseY - this.y - MatterObject._translate.y ) / config.grid.blockSize);

    // if we are outside the grid, return nothing
    if(col < 0 || col >= this.cols || row < 0 || row >= this.rows)
      return;
    return {
      row, col
    }
  }

  activeBlock() {
    var coordinates = this.getCoordinates();
    if(!coordinates)
      return;
    return this.grid[coordinates.row][coordinates.col];
  }

  mouseIsOnBlock() {
    var block = this.activeBlock();
    if(!block) return false;
    return block.isVisible();
  }

  snappedXYcoordinates() {
    var coordinates = this.getCoordinates();
    if(!coordinates) return;
    var x = this.x + MatterObject._translate.x + config.grid.blockSize * coordinates.col;
    var y = this.y + MatterObject._translate.y + config.grid.blockSize * coordinates.row;

    return {x,y}
  }

  addItem(blockType){
    if(!Game.inventory.removeItem(blockType)) return;    
    var coordinates = this.getCoordinates();
    // that means we're out of the grid
    if(!coordinates)
      return; 
    this.grid[coordinates.row] [coordinates.col] = new Block(this, coordinates.row, coordinates.col, blockType)
  }

  createCavern() {
    for(var j = 0; j < this.cols; j++) {
      var start = 15;
      if(random()<0.4)
        continue;
      if(random()<0.2)
        start -= 4;
      if(random()<0.2)
        start += 4;

      for (var i = 0; i < random() * 5; i++)
        this.grid[i+start][j].type = blockTypes.AIR;
    }
  }
}

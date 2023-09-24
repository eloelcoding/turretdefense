var blockTypes = {
  "DIRT": 0,
  "GRASS": 1,
  "WOOD": 2,
  "LEAF": 3,
  "STONE": 4,
  "COAL": 5,
  "IRON": 6,
  "DIAMOND": 7,
  "AIR": 11,
};

var blockTypesMap = {};
Object.keys(blockTypes).map(k => {
  blockTypesMap[blockTypes[k]] = k
})

let config = {
    showGUI: true,
    log: false,
    gravity: 0.8,
    movement: {
      //in minecraft it takes .80 secs to fall 4 blocks
      jumpAmount: 4,
      speed: 5,
      shiftSpeedupFactor: 2,
    },
    startingMap: "startworld",
    grid : {
      translate: {
        x:100,
        y: 100,
      },
      rows: 30,
      cols: 40,
      blockSize: 20,
      snap: true,
    },
    player: {
      x: 100,
      y: 0,
      bodyOptions: { inertia: Infinity, restitution: 0.5, friction: 0}
    },
  backgroundColor: [100,200,400],
    wireFrame: false,
    images: {
      hotbar: "assets/images/hotbar.png",
      blocks: "assets/images/bitMap.png",
      sprites: "assets/images/sprites.png",
    },
    sounds: {
      shovel: "assets/sounds/flatten3-shovel.mp3",
    },
    blockTypes,
    blockTypesMap,
    hitSpeed: 100,
    hitSpeedByBlockType: {
      DIRT: 2,
      GRASS: 2,
      STONE: 1,
      WOOD: 0.7,
      COAL: 0.7,
      IRON: 0.5,
      DIAMOND: 0.2,
    }
  }

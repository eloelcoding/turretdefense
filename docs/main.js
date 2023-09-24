let images;
let wireFrames = config.wireFrame;
let spriteCache, imageCache;
let sounds;
let dropdown;

function preload() {

  images = {}
  Object.keys(config.images).map(name => {
    print("Loading image " + name);
    images[name] = loadImage(config.images[name]);
  })
  sounds = {};
  Object.keys(config.sounds).map(name => {
    var sound = loadSound(config.sounds[name]);
    sounds[name] = _.throttle(() => sound.play(), 1000);
  })
}



function mouseReleased() {
  MatterObject.mouseReleased();
}

function mouseDown() {
  logIt("Mouse pressed");
  MatterObject.mouseDown();
}


function setupWorld() {
  engine = Engine.create();
  world = engine.world;
  print(world.gravity.y);
  world.gravity.y = config.gravity;

  Matter.Runner.run(engine);
}

function refreshMapDropDown(dropdown) {
  MapSaver.listMaps().then(data => {
    // need to find out how to wipe out all options
    // dropdown.remove()
    data.map(m => dropdown.option(m))
  })
}

function saveMap(chooseName) {
  var name;
  if (chooseName)
    name = prompt("Name your map");
  else
    name = dropdown.value();
  MapSaver.saveMap(name, Game.grid.serialize());
  refreshMapDropDown(dropdown);
}

function deleteMap(chooseName) {
  var name;
  if (!chooseName)
    name = prompt("Name your map");
  else
    name = dropdown.value();
  MapSaver.deleteMap(name);
  refreshMapDropDown(dropdown);
}



function createGUI() {

  var buttons = [
    { label: "←", position: [20, 40], size: [30, 25], action: scrollLeft },
    { label: "→", position: [55, 40], size: [30, 25], action: scrollRight },
    { label: "💾", position: [500, 10], size: [30, 25], action: () => saveMap(false) },
    { label: "💾 As...", position: [530, 10], size: [70, 25], action: () => saveMap(true) },
  ];

  buttons.map(data => {
    var button = createButton(data.label);
    button.position(...data.position);
    button.size(...data.size);
    button.mousePressed(data.action);
  })

  //deactive inspect right click menu thing
  canvas = document.querySelector('canvas');
  canvas.addEventListener('contextmenu', event => event.preventDefault());
  if (!config.showGUI) return;

  dropdown = createSelect();
  refreshMapDropDown(dropdown)
  dropdown.changed(async () => {
    var mapName = dropdown.value();
    if (!mapName) {
      console.log("Could not load map ", mapName);
      return;
    }
    var map = await MapSaver.loadMap(dropdown.value());
    console.log(map.encodedMap)
    await Game.grid.applyMap(map.encodedMap);
  });
  dropdown.position(400, 10);
  dropdown.size(100, 25);

  slider = createSlider(50, 500, 50, 50);
  slider.position(170, 10);
  slider.style('width', '200px');

  checkbox = createCheckbox('Wireframes', wireFrames);
  checkbox.position(10, 10);
  checkbox.changed(onChange);
}

function onChange() {
  wireFrames = !wireFrames;
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    var game = Game;
    if (game.grid.mouseIsOnBlock()) return
    game.grid.addItem(game.inventory.selectedIdx)
    console.log("Right-click detected");
  }
}

function keyPressed() {
  if (key == " ") {
    wireFrames = !wireFrames;
  }
  if (key >= '1' && key <= '9') {
    Game.inventory.setActive(float(key) - 1);
  }
}

function createCache() {
  var spriteIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  spriteCache = {};
  spriteIndex.map(index => {
    spriteCache[index] = images.sprites.get(index * 10, 0, 10, 10)
  })

  imageCache = {};
  var mapBlocks = 10;
  var blockSize = images.blocks.width / mapBlocks;

  Object.keys(config.blockTypesMap).map(type => {
    imageCache[type] = images.blocks.get(type * blockSize, 0, blockSize, images.blocks.height)
  })
}



async function setup() {
  createCache();
  rectMode(CENTER);
  imageMode(CENTER);
  setupWorld();
  t = 0; fr = 0;
  setInterval(() => { fr = frameRate() }, 500);
  var pctScreenSize = .8;
  config.canvas = { width: windowWidth * pctScreenSize, height: windowHeight * pctScreenSize }
  createCanvas(config.canvas.width, config.canvas.height);
  createGUI();

  var grid = new Grid(
    config.grid.translate.x,
    config.grid.translate.y,
    config.grid.rows,
    config.grid.cols,
    config.grid.blockSize
  );

  var player = new Player(images.sprites, config.player.x, config.player.y);
  Game.create(grid, player);
  try {
    var map = await MapSaver.loadMap(config.startingMap);
    await Game.loadSettings(map);
  }
  catch {}

  setInterval(centerPlayerToMiddle, 5);
}

function centerPlayerToMiddle() {
  return;
  var playerPosition = player.absolutePosition().x;
  var middle = windowWidth / 2;
  var centeringSpeed = 0.005;
  var translation = 0;
  if (abs(playerPosition - middle) > 100)
    translation = centeringSpeed * (middle - playerPosition)

  MatterObject.translate(translation, 0);
}

function scrollRight() {
  t -= slider.value();
  print("Scrolling")
  MatterObject.translate(-slider.value(), 0)
}
function scrollLeft() {
  t += slider.value();
  print("Scrolling")
  MatterObject.translate(slider.value(), 0)
}

function draw() {
  background(...config.backgroundColor);
  if (config.showGUI) {
    text(floor(fr), 150, 25);
  }

  MatterObject.draw(wireFrames);

  // cursor
  var grid = Game.grid;
  if (!grid.mouseIsOnBlock()) {
    var coordinates = grid.snappedXYcoordinates();
    var snapGrid = config.grid.snap;
    if (coordinates != undefined) {
      var block = grid.activeBlock();
      if(block.isNearPlayer()) {
        push()
        if (snapGrid)
          translate(coordinates.x, coordinates.y);
        else
          translate(mouseX, mouseY);
        var scaling = 1 / 15 * config.grid.blockSize / 20;
        scale(scaling, scaling)
        image(imageCache[Game.inventory.selected], 0, 0);
        pop();
      }
    }
  }
  Game.player.checkMovement()
  if (mouseIsPressed)
    mouseDown();
  Game.draw()
}

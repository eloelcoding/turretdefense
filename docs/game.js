class Game {
    static grid;
    static player;
    static inventory;

    static create(grid, player) {
        Game.grid = grid;
        Game.player = player;
        Game.inventory = Game.generateInventory();
    }

    static async loadSettings(map) {
        if(!map) {
            console.log("Map is empty");
            return;
        }
        await Game.grid.applyMap(map.encodedMap);
        Game.inventory.items = map.inventory || {};
    }

    static generateInventory() {
        var inventory = new Inventory();
        for (var i = 0; i < 100; i++) {
            var randomBlockType = floor(random() * (Object.keys(config.blockTypes).length - 1));
            print(randomBlockType);
            inventory.addItem(randomBlockType);
        }
        return inventory;
    }

    static draw() {
        Game.inventory.draw();
    }
}
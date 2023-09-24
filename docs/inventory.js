class Inventory{
    constructor(items){
        items = items || {};
        this.items = items;
        this.selected = 0
        this.selectedIdx = 0;
    }
    addItem(type){
        if (!this.items[type]){
         this.items[type]=1 
        } else{
        this.items[type]++
        }
        logIt (this.items)  
    }

    setActive(index) {
        var items = Object.keys(this.items);
        var blockType = items[index];
        if(blockType == undefined) return;
        this.selectedIdx = index;
        this.selected = blockType;
        Block.cursor = imageCache[blockType];
    }

    removeItem(blockType) {
        if(!this.items[blockType])
            return false;
        this.items[blockType]--;
        if(this.items[blockType] == 0)
            delete(this.items[blockType]);
        return true;
    }
    
    draw(){
        var slotSize=60
        var itemSize=slotSize*0.75
        var black=80;
        var length = slotSize * 10;
        push()
            translate(config.canvas.width/2, config.canvas.height * 0.9);
            push()
            fill(black,black,black,180)
            rect(0,0,slotSize*10,slotSize,10);
            image(images.hotbar,0,0,slotSize*10,slotSize)
            pop()
            var items = Object.keys(this.items);
            var i = 0;
            
            fill(255);
            textSize(20);
            textStyle(BOLD);
            translate(-slotSize/10,0)
            items.map(itemType=>{
                var img=imageCache[itemType];
                image(img,slotSize*(i-4.4),0,itemSize,itemSize);
                textSize(14);
                textStyle(NORMAL);
                text(i+1,slotSize*(i-4.8),-slotSize*0.21);
                textSize(20);
                textStyle(BOLD);
                var itemCount = this.items[itemType];
                var offset = 0;
                if(itemCount>=10)
                    offset = -0.1
                text(this.items[itemType],slotSize*(i-4.3+offset),slotSize/3);
                i++
            })
            stroke(255);
            strokeWeight(5);
            noFill();
            rect(slotSize*(this.selectedIdx-4.4),0,itemSize*1.2,itemSize*1.2);

        pop()
    }
}
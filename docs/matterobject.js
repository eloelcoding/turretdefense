// Matter.js module aliases
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

class MatterObject {
	static objects = [];
    static _translate = {x:0,y:0};
	constructor() {
		MatterObject.objects.push(this);
	};	

  cleanup() {
    // console.log("Cleaning up");
    if(this.body)
      World.remove(world,this.body);
    var idx = MatterObject.objects.indexOf(this);
    MatterObject.objects.splice(idx,1);
  }

  absolutePosition() {
    return { 
      x: this.body.position.x + MatterObject._translate.x,
      y: this.body.position.y + MatterObject._translate.y,
    } 
  }

  static translate(x,y) {
    MatterObject._translate.x += x;
    MatterObject._translate.y += y;
  }

	static draw(wireFrame) {
    // Block.cursor = CROSS;
		MatterObject.objects.map(obj => {
          push();
          translate(MatterObject._translate.x, MatterObject._translate.y);
          obj.draw(wireFrame)
          pop();
        });
	}

  static mouseDown() {
    MatterObject.objects.map(obj => obj.mouseDown && obj.mouseDown());
  }

  static mouseReleased() {
    MatterObject.objects.map(obj => obj.mouseReleased && obj.mouseReleased());
  }

}
/*
    Author: ??
    Disclaimer: This is the first program the author has written in JavaScript
*/
var version = "v.0.1";
var title = "Little Cake Adventure";
document.getElementById("header").innerHTML = title + " " + version;
document.title = title;

var fps = 40;
var intervalId;

var aspectRatio = 0.567;
var insetRatio = 0.95;

var canvas = document.getElementById("gameCanvas");
var endImg = document.getElementById("endImg");
resizeCanvas();
var ctx = canvas.getContext("2d");

var debugText = document.getElementById("debugText");

var jumpSound = new Audio("Sounds/Hopp.mp3");
var bgMusic = new Audio("Sounds/Cooking%20by%20the%20book%208%20bit.mp3");

var BG_i = 0, PlayerSheet_i = 1, BushSheet_i = 2, ItemsSheet_i = 3, ButterflySheet_i = 4,
	Level_i = 5, LevelForeground_i = 6;
var img_names = ["Stationary/BEAN_BG.png","Animations/bean_sprite.png","Animations/buske_sheet.png","Animations/ITEMS_sheet.png","Animations/butterfly_sheet.png",
"Stationary/bean_lvl.png","Stationary/bean_lvl_bro.png"];
var imgs = [];
var loadingComplete = false;

loadImages(initialize);

var gravity = 0.198;
var camera;
var player;
var playerAnimation;
var playerWalkCycleRight = [18,19,20,21,22,23,24,25]; //0.1
var playerWalkCycleLeft = [27,28,29,30,31,32,33,34]; //0.1
var playerIdleCycleRight = [0,0,1,1,2,2,1,1]; //0.2
var playerIdleCycleLeft = [9,9,10,10,11,11,10,10]; //0.2
var playerJumpRight = [36,37,38,39,39,40]; //Jump
var playerJumpLeft = [45,46,47,48,48,49]; //Jump
var landFrames = 3;
var platforms = [];

var leftKeyDown = false;
var rightKeyDown = false;
var upKeyDown = false;
var downKeyDown = false;
var wKeyDown = false;
var aKeyDown = false;
var sKeyDown = false;
var dKeyDown = false;

var keysLeftDown; //(leftKeyDown || aKeyDown);
var keysRightDown; //(rightKeyDown || dKeyDown);
var keysUpDown; //(upKeyDown || wKeyDown);
var keysDownDown; // (downKeyDown || sKeyDown);

function loadImages(callback) {
  var n, count = img_names.length;
  var onload = function() { 
		if(--count === 0)
			callback();
	};
  
  for(n = 0 ; n < img_names.length ; n++) {
    name = img_names[n];
    imgs[n] = document.createElement('img');
	imgs[n].addEventListener('load', onload);
    imgs[n].src = name;
	//debugText.innerHTML = "Loading: " + (n+1) + "/" + img_names.length;
  }
  //debugText.innerHTML = "";

}

function moveTo(currentVal, targetVal){
	if(currentVal-targetVal < 0.5 && currentVal-targetVal > -0.5)
		return targetVal;
	return currentVal + (targetVal-currentVal)/40;
}

function initialize(){
	// Camera
	camera = new Entity(0,0,(imgs[Level_i].height)/aspectRatio,(imgs[Level_i].height),"#000000", 0, 0, 1.0);
	camera.update = function(){
		if(player.facingRight){
			camera.posX = moveTo(camera.posX,player.posX+player.width/2 - camera.width/3);
		}
		else if(!player.facingRight){
			camera.posX = moveTo(camera.posX, player.posX+player.width/2 - 2*camera.width/4);
		}
		if(camera.posX <= 0)
			camera.posX = 0;
		else if(camera.posX >= imgs[Level_i].width - camera.width){
			camera.posX = imgs[Level_i].width - camera.width;
		}
	};	
	// Player
	player = new Entity(10,10,52,58,"#111111", 0, 0, 1.1, true);
	playerAnimation = new animatedSprite(imgs[PlayerSheet_i], 52, 58, 6, 9, 0.1);
	
	// Entities
	
	
	// Platforms and Blocks
	var i = 0;
	platforms[i++] = new Block(0, 213, 316, 87);
	platforms[i++] = new Block(365, 183, 89, 177);
	platforms[i++] = new Block(546, 213, 88, 87);
	platforms[i++] = new Block(699, 213, 881, 87);
	platforms[i++] = new Platform(890, 140, 305, 2);
	platforms[i++] = new Platform(1075, 87, 108, 2);
	platforms[i++] = new Block(1653, 181, 90, 119);
	platforms[i++] = new Block(1808, 182, 89, 118);
	platforms[i++] = new Block(1955, 213, 169, 87);
	platforms[i++] = new Block(2186, 213, 594, 87);
	platforms[i++] = new Platform(2251, 139, 179, 2);
	platforms[i++] = new Platform(2412, 87, 140, 2);
	platforms[i++] = new Platform(2533, 140, 177, 2);
	platforms[i++] = new Block(2823, 182, 89, 118);
	platforms[i++] = new Block(2974, 182, 54, 118);
	platforms[i++] = new Block(3074, 140, 53, 160);
	platforms[i++] = new Block(3153, 87, 54, 213);
	platforms[i++] = new Block(3337, 213, 316, 87);
	
	// Done
	loadingComplete = true;
	intervalId = setInterval(mainLoop, 1000 / fps);
}

function mainLoop(){
    update();
    draw();
}

function collisionCheckElement(element, index, array){
	element.collision(player);
}

function update(){
    controlsCheck();
    player.update();
	platforms.forEach(collisionCheckElement);
				debugText.innerHTML = "TEST";
    camera.update();
	if(player.posY > camera.posY+camera.height-player.height){
		player.posY = camera.posY+camera.height-player.height;
		player.onGround = true;
		player.velY=0;
	}
	if(player.posX > camera.posX+camera.width-player.width){
		player.posX = camera.posX+camera.width-player.width;
	}
	if(player.posX < camera.posX){
		player.posX = camera.posX;
	}
	/*debugText.innerHTML = "Time: " + playerAnimation.currentTime +
						  "| FrameIndex: " + playerAnimation.currentFrameIndex +
						  "| VelX: " + player.velX + "| VelY: " + player.velY +
						  "| onGround: " + player.onGround + "| landCounter: " + player.landCounter;*/
}

function controlsCheck(){
	keysLeftDown = (leftKeyDown || aKeyDown);
	keysRightDown = (rightKeyDown || dKeyDown);
	keysUpDown = (upKeyDown || wKeyDown);
	keysDownDown = (downKeyDown || sKeyDown);
	
    //Camera
    /*if(wKeyDown){
        camera.posY-=camera.speed;
    }
    if(sKeyDown){
        camera.posY+=camera.speed;
    }
    if(aKeyDown){
        camera.posX-=camera.speed;
    }
    if(dKeyDown){
        camera.posX+=camera.speed;
    }*/
    
    //Player
    if(keysLeftDown&&!keysRightDown){
        if(player.velX > -player.speed)
            player.velX -= 0.3;
        else
            player.velX = -player.speed;
    }
    else if(keysRightDown&&!keysLeftDown){
        if(player.velX < player.speed)
            player.velX += 0.3;
        else
            player.velX = player.speed;
    }
    else{
        if(player.velX < -0.1)
            player.velX+=0.1;
        else if(player.velX > 0.1)
            player.velX-=0.1;
        else
            player.velX = 0;
    }
    if(keysUpDown){
			if(player.onGround){
				player.velY -= player.speed*5;
				player.onGround = false;
				player.landCounter = landFrames;
				jumpSound.play();
			}
			else if(player.velY <= 0)
				player.velY -= gravity/3;
    }
	if(keysDownDown){
        player.velY += gravity/2;
    }
}

function draw(){
	ctx.imageSmoothingEnabled = false;       /* standard */
    ctx.mozImageSmoothingEnabled = false;    /* Firefox */
    ctx.oImageSmoothingEnabled = false;      /* Opera */
    ctx.webkitImageSmoothingEnabled = false; /* Safari */
    ctx.msImageSmoothingEnabled = false;     /* IE */
	
    var widthScale = canvas.width/camera.width;
    var heightScale = canvas.height/camera.height;
    
	/* If no image has loaded this color will show instead */
    ctx.fillStyle = "#771133";
    ctx.fillRect(0,0,canvas.width,canvas.height);
	
	/* Sky */
	ctx.drawImage(imgs[BG_i],0,0,canvas.width,canvas.height);
	
	/* Far Background */
	
	
	/* Near Background */
	ctx.drawImage(imgs[Level_i],getDrawCoordinate(0, camera.posX, widthScale), getDrawCoordinate(0, camera.posY, heightScale), imgs[Level_i].width*widthScale, imgs[Level_i].height*heightScale);
    
	/* Player */
	if(player.landCounter > 0 || !player.onGround){
		if(player.facingRight){
			playerAnimation.updateAerial(playerJumpRight, player);
		}
		else if(!player.facingRight)
			playerAnimation.updateAerial(playerJumpLeft, player);
	}
	else if(player.facingRight && keysRightDown && player.velX > player.speed/10)
        playerAnimation.updateTime(playerWalkCycleRight);
	else if(!player.facingRight && keysLeftDown && player.velX < -player.speed/10)
        playerAnimation.updateTime(playerWalkCycleLeft);
    else{
		if(player.facingRight)
			playerAnimation.updateTime(playerIdleCycleRight);
		else if(!player.facingRight)
			playerAnimation.updateTime(playerIdleCycleLeft);
	}
	
    var frame = playerAnimation.getFrame();
    
    ctx.drawImage(playerAnimation.image, frame.x-1, frame.y+1, frame.width, frame.height, getDrawCoordinate(player.posX, camera.posX, widthScale), getDrawCoordinate(player.posY, camera.posY, heightScale), player.width*widthScale, player.height*heightScale);
	/* END PLAYER */
	
	/* Near Foreground */
	ctx.drawImage(imgs[LevelForeground_i],getDrawCoordinate(0, camera.posX, widthScale), getDrawCoordinate(0, camera.posY, heightScale), imgs[Level_i].width*widthScale, imgs[Level_i].height*heightScale);
	
	ctx.fillStyle = "#444411";
	ctx.fillRect(getDrawCoordinate(player.hitBox.posX, camera.posX, widthScale),
		getDrawCoordinate(player.hitBox.posY, camera.posY, heightScale),
		player.hitBox.width*widthScale,
		player.hitBox.height*heightScale);
	
	for( i = 0; i < platforms.length; ++i){
		ctx.fillStyle = "#441111";
		ctx.fillRect(getDrawCoordinate(platforms[i].posX, camera.posX, widthScale),
		getDrawCoordinate(platforms[i].posY, camera.posY, heightScale),
		platforms[i].width*widthScale,
		platforms[i].height*heightScale);
	}
}

function getDrawCoordinate(coordRef, cameraRef, scale){
    return ((coordRef-cameraRef)*scale);
}

function stop(){
    clearInterval(intervalId);
}

/*
    Method borrowed from the web.
*/
function getHexColor(number){
    return "#"+((number)>>>0).toString(16).slice(-6);
}

document.addEventListener('keydown', function(event){
    switch(event.keyCode){
        case 37: //Left
            event.preventDefault();
            leftKeyDown = true;
            break;
        case 39: //Right
            event.preventDefault();
            rightKeyDown = true;
            break;
        case 40: //Down
            event.preventDefault();
            downKeyDown = true;
            break;
        case 38: //Up
            event.preventDefault();
            upKeyDown = true;
            break;
        case 87: //W
            event.preventDefault();
            wKeyDown = true;
            break;
        case 65: //A
            event.preventDefault();
            aKeyDown = true;
            break;
        case 83: //S
            event.preventDefault();
            sKeyDown = true;
            break;
        case 68: //D
            event.preventDefault();
            dKeyDown = true;
            break;
        default:
            break;
    }  
});

document.addEventListener('keyup', function(event){
    switch(event.keyCode){
        case 37: //Left
            leftKeyDown = false;
            break;
        case 39: //Right
            rightKeyDown = false;
            break;
        case 40: //Down
            downKeyDown = false;
            break;
        case 38: //Up
            upKeyDown = false;
            break;
        case 87: //W
            wKeyDown = false;
            break;
        case 65: //A
            aKeyDown = false;
            break;
        case 83: //S
            sKeyDown = false;
            break;
        case 68: //D
            dKeyDown = false;
            break;
        default:
            break;
    }    
});

function Block(posX, posY, width, height){
	this.posX = posX;
	this.posY = posY;
	this.width = width;
	this.height = height;	
	
	this.collision = function(entity){
		var hitbox = entity.hitbox; 
		if(hitbox.posX+hitbox.width > this.posX && hitbox.posX < this.posX+this.width){
			if(hitbox.posY+hitbox.height > this.posY && hitbox.posY < this.posY+this.height){
				if(entity.velY > 0 && hitbox.posY+(9*hitbox.height/10)< this.posY){
					entity.posY = this.posY-(9*hitbox.height/10)-(hitbox.posY-entity.posY)-2;
					entity.onGround = true;
					entity.velY = 0;
				}
				else if(entity.posX < this.posX+this.width/2-entity.width/2){
					entity.posX = this.posX-(hitbox.posX-entity.posX)-hitbox.width;
				}
				else{
					entity.posX = this.posX+this.width-(hitbox.posX-entity.posX);
				}
			}
		}
	};
}

function Platform(posX, posY, width, height){
	this.posX = posX;
	this.posY = posY;
	this.width = width;
	this.height = height;
	
	this.collision = function(entity){
		var hitbox = entity.hitbox; 
		if(hitbox.posX+hitbox.width > this.posX && hitbox.posX < this.posX+this.width){
			if(hitbox.posY+hitbox.height > this.posY && hitbox.posY < this.posY+this.height){
				if(entity.velY > 0 && hitbox.posY+(9*hitbox.height/10)< this.posY){
					entity.posY = this.posY-(9*hitbox.height/10)-(hitbox.posY-entity.posY)-2;
					entity.onGround = true;
					entity.velY = 0;
				}
			}
		}
	};
}

function Entity(posX, posY, width, height, color, velX, velY, speed, gravityEffect){
    this.posX = posX || 0;
    this.posY = posY || 0;
    this.width = width || 10;
    this.height = height || 10;
	this.hitbox = new Block(this.posX+3*this.width/10, this.posY+this.height/10, 4*this.width/10, 9*this.height/10);
    this.color = color || "#000000";
    this.velX = velX || 0;
    this.velY = velY || 0;
	this.facingRight = true;
    this.speed = speed || 5;
	this.onGround = true;
	this.landCounter = 0;
	this.gravityEffect = gravityEffect || false;
    
    this.update = function (){
		if(this.gravityEffect){
			if(this.velY > 0.1)
				this.onGround = false;
			if(this.velY > 0)
				this.velY += gravity/3;
			else
				this.velY += gravity;
		}
		if(this.velX<0)
			this.facingRight=false;
		if(this.velX>0)
			this.facingRight=true;
        this.posX += this.velX;
        this.posY += this.velY;
		this.hitbox.posX = this.posX+3*this.width/10;
		this.hitbox.posY = this.posY+this.height/10;
    };
}

function animatedSprite(image, frameWidth, frameHeight, rows, columns, spf){
    this.image = image;
    this.frameWidth = frameWidth || 100;
    this.frameHeight = frameHeight || 100;
    this.rows = rows || 1;
    this.columns = columns || 1;
    this.currentFrame = 0;
    this.currentFrameIndex = 0;
    this.spf = spf;
    this.currentTime = 0;
    
    this.updateTime = function (frameList){
        this.currentTime++;
        if((this.currentTime >= (fps*this.spf))){
			this.currentTime = 0;
            this.currentFrame = this.getNextFrameIndex(frameList);
		}
    };
	
	this.updateAerial = function (frameList, entity){
		if(!entity.onGround){
			if(entity.velY < -0.2)
				this.currentFrameIndex = 0;
			else if(entity.velY > 0.2)
				this.currentFrameIndex = 2;
			else
				this.currentFrameIndex = 1;
			this.currentTime = 0;
		}else if(entity.landCounter > 0){
			this.currentTime++;
			if((this.currentTime >= (fps*this.spf))){
				this.currentTime = 0;
				this.currentFrameIndex = frameList.length-entity.landCounter;
				entity.landCounter--;
			}
		}
		this.currentFrame = frameList[this.currentFrameIndex];
			
	};
    
    this.getNextFrameIndex = function (frameList){
		if(++this.currentFrameIndex >= frameList.length)
			this.currentFrameIndex = 0;
        return frameList[this.currentFrameIndex];
    };
    
    this.getFrame = function (index){
        this.currentFrame = this.currentFrame%(this.columns*this.rows);
        var x = index || this.currentFrame;
        while(x>(this.rows*this.columns) && x >= 0){
            x -= this.rows*this.columns;
        }
        var y = 0;
        while(x >= this.columns){
            x -= this.columns;
            ++y;
        }
        return new frameInfo(x*this.frameWidth, y*this.frameHeight, this.frameWidth, this.frameHeight);
    };
}

function frameInfo(x,y,width,height){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
}
    
function resizeCanvas(){
    var webWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    var webHeight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    
    if(webHeight/webWidth > aspectRatio){
        canvas.width = webWidth*insetRatio;
        canvas.height = canvas.width*aspectRatio;
    }
    else{
        canvas.height = webHeight*insetRatio;
        canvas.width = canvas.height/aspectRatio;
    }
	endImg.height = canvas.height;
	endImg.width = canvas.width;
}
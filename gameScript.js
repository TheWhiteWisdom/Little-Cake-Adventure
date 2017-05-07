/*
    Author: ??
    Disclaimer: This is the first program the author has written in JavaScript
*/
var version = "v.0.03"
var title = "Little Cake Adventure"
document.getElementById("header").innerHTML = title + " " + version;
document.title = title;

var fps = 40;
var intervalId = setInterval(mainLoop, 1000 / fps)
var canvas = document.getElementById("gameCanvas");
var playerSheet = document.getElementById("playerSpritesheet");
var backgroundImage = document.getElementById("backgroundImage");
var ctx = canvas.getContext("2d");

var debug = document.getElementById("debugText");

var jumpSound = new Audio("Sounds/Hopp.mp3");

var gravity = 0.098;
var camera = new Entity(0,0,100,56,"#000000", 0, 0, 0.80);
var player = new Entity(10,10,8.9,10,"#111111", 0, 0, 0.35, true);
var playerAnimation = new animatedSprite(playerSheet, 52, 58, 6, 9, 0.1);
var playerWalkCycleRight = [18,19,20,21,22,23,24,25]; //0.1
var playerWalkCycleLeft = [27,28,29,30,31,32,33,34]; //0.1
var playerIdleCycleRight = [0,0,1,1,2,2,1,1]; //0.2
var playerIdleCycleLeft = [9,9,10,10,11,11,10,10]; //0.2
var playerJumpRight = [36,37,38,39,39,40]; //Jump
var playerJumpLeft = [45,46,47,48,48,49]; //Jump
var landFrames = 3;

var leftKeyDown = false;
var rightKeyDown = false;
var upKeyDown = false;
var downKeyDown = false;
var wKeyDown = false;
var aKeyDown = false;
var sKeyDown = false;
var dKeyDown = false;

function mainLoop(){
    update();
    draw();
}

function update(){
    controlsCheck();
    player.update();
    camera.update();
	if(player.posY > camera.posY+camera.height-player.height){
		player.posY = camera.posY+camera.height-player.height;
		player.onGround = true;
		player.velY=0;
	}
	/*debugText.innerHTML = "Time: " + playerAnimation.currentTime +
						  "| FrameIndex: " + playerAnimation.currentFrameIndex +
						  "| VelX: " + player.velX + "| VelY: " + player.velY +
						  "| onGround: " + player.onGround + "| landCounter: " + player.landCounter;*/
}

function controlsCheck(){
    //Camera
    if(wKeyDown){
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
    }
    
    //Player
    else if(leftKeyDown&&!rightKeyDown){
        if(player.velX > -player.speed)
            player.velX -= 0.3;
        else
            player.velX = -player.speed;
    }
    else if(rightKeyDown&&!leftKeyDown){
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
    if(upKeyDown){
			if(player.onGround){
				player.velY -= player.speed*5;
				player.onGround = false;
				player.landCounter = landFrames;
				jumpSound.play();
			}
    }
	if(downKeyDown){
        player.velY += player.speed/10;
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
    
    //ctx.fillStyle = "#771133";
    //ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.drawImage(backgroundImage,0,0,canvas.width,canvas.height);
    
	if(player.landCounter > 0 || !player.onGround){
		if(player.facingRight){
			playerAnimation.updateAerial(playerJumpRight, player);
		}
		else if(!player.facingRight)
			playerAnimation.updateAerial(playerJumpLeft, player);
	}
	else if(player.facingRight && rightKeyDown && player.velX > player.speed/10)
        playerAnimation.updateTime(playerWalkCycleRight);
	else if(!player.facingRight && leftKeyDown && player.velX < -player.speed/10)
        playerAnimation.updateTime(playerWalkCycleLeft);
    else{
		if(player.facingRight)
			playerAnimation.updateTime(playerIdleCycleRight);
		else if(!player.facingRight)
			playerAnimation.updateTime(playerIdleCycleLeft);
	}
	
    var frame = playerAnimation.getFrame();
    
    ctx.drawImage(playerAnimation.image, frame.x-1, frame.y+1, frame.width, frame.height, getDrawCoordinate(player.posX, camera.posX, widthScale), getDrawCoordinate(player.posY, camera.posY, heightScale), player.width*widthScale, player.height*heightScale);
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

function Entity(posX, posY, width, height, color, velX, velY, speed, gravityEffect){
    this.posX = posX || 0;
    this.posY = posY || 0;
    this.width = width || 10;
    this.height = height || 10;
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
			this.velY += gravity;
		}
		if(this.velX<0)
			this.facingRight=false;
		if(this.velX>0)
			this.facingRight=true;
        this.posX += this.velX;
        this.posY += this.velY;
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
    }
	
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
			
	}
    
    this.getNextFrameIndex = function (frameList){
		if(++this.currentFrameIndex >= frameList.length)
			this.currentFrameIndex = 0;
        return frameList[this.currentFrameIndex];
    }
    
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
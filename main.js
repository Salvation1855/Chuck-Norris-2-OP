var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

//this adds the variables for your game states
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;

//add the variable for your score
var score = 0;
//adds the lives
var lives = 3;

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;


// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// load an image to draw
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

var badguy = document.createElement("img");
badguy.src = "enemy.png";


//the width/height of a tile (in pixles). Your tile should be a square These dimensions refer to the map grid tiles. Our tileset tiles (the images) can be different dimensions.
var TILE = 35;
//abitrary choice for 1m
var METER = TILE;
//// very exaggerated gravity (6x)
var GRAVITY = METER * 9.8 * 6;
// max horizontal speed (10 tiles per second)
var MAXDX = METER * 10;
// max vertical speed (15 tiles per second)
var MAXDY = METER * 15;
// horizontal acceleration - take 1/2 second to reach maxdx
var ACCEL = MAXDX * 2;
// horizontal friction - take 1/6 second to stop from maxdx
var FRICTION = MAXDX * 6;
// (a large) instantaneous jump impulse
var JUMP = METER * 1500;

//-------------------- Don't modify anything below here
var player = new Player();
var enemy = new Enemy();
var keyboard = new Keyboard();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//physics for the game



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//the number of layers in your map
var LAYER_COUNT = 3;
//specifies how big your level is, etc: 60 tiles wide by 15 tiles high
var MAP = { tw: 60, th: 15 };
//the width/height of a tile in the tileset
var TILESET_TILE = TILE * 2;
//How many pixels are between the image border and the tile images in the tilemap
var TILESET_PADDING = 2;
//how many pixels are between tile images in the tilemap
var TILESET_SPACING = 2;
//How many columns of tile images are in the tileset 
var TILESET_COUNT_X = 14;
//How many rows of tile images are in the tileset 
var TILESET_COUNT_Y = 14;

//load the images to use for the level tiles
var tileset = document.createElement("img");
tileset.src = "tileset.png";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//this will make it the code will read the tile colission by using different collision functions (tileToPixel, pixelToTile)

function cellAtPixelCoord(layer, x, y)
{
    if (x < 0 || x > SCREEN_WIDTH || y < 0)
        return 1;
    // let the player drop of the bottom of the screen (this means death)
    if (y > SCREEN_HEIGHT)
        return 0;
    return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty)
{
    if (tx < 0 || tx >= MAP.tw || ty < 0)
        return 1;
    // let the player drop of the bottom of the screen (this means death)
    if (ty >= MAP.th)
        return 0;
    return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
    return tile * TILE;
};

function pixelToTile(pixel)
{
    return Math.floor(pixel / TILE);
};
//makes it so the player doesnt go over maxium speed.
function bound(value, min, max)
{
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}

var LAYER_COUNT = 3;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var cells = []; // the array that holds our simplified collision data
//this adds the variables for your music
var musicBackground;
var sfxFire;
function initialize()
{
    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
    { // initialize the collision map
        cells[layerIdx] = [];
        var idx = 0;
        for (var y = 0; y < level1.layers[layerIdx].height; y++)
        {
            cells[layerIdx][y] = [];
            for (var x = 0; x < level1.layers[layerIdx].width; x++)
            {
                if (level1.layers[layerIdx].data[idx] != 0)
                {
                    // for each tile we find in the layer data, we need to create 4 collisions
                    // (because our collision squares are 35x35 but the tile in the
                    // level are 70x70)
                    cells[layerIdx][y][x] = 1;
                    cells[layerIdx][y - 1][x] = 1;
                    cells[layerIdx][y - 1][x + 1] = 1;
                    cells[layerIdx][y][x + 1] = 1;
                }
                else if (cells[layerIdx][y][x] != 1)
                {
                    // if we haven't set this cell's value, then set it to 0 now
                    cells[layerIdx][y][x] = 0;
                }
                idx++;
            }
        }
    }
    //this adds the code to implent the music into the game.
            musicBackground = new Howl(
        {
            urls: ["background.ogg"],
            loop: true,
            buffer: true,
            volume: 0.5
         } );
            musicBackground.play();
            sfxFire = new Howl(
        {
             urls: ["fireEffect.ogg"],
             buffer: true,
             volume: 1,
             onend: function() 
             {
            isSfxPlaying = false;
            }
        } );
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var worldOffsetX = 0;
//this is so it will draw the tiles from a different software
function drawMap()
{
    //this adds the sidescrolling part of the map

    var startX = -1;
    //we need to calculate how many tiles can fit on the screen. Then add 2 to this number (for the overhang on the left and right). 
    //Because as we scroll left or right we need to draw part of the next tile in that direction
    var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
    //Calculate the tile the player is currently on. Here we use a utility function (pixelToTile) 
    //that takes a pixel coordinate and converts it to a tile coordinate.
    var tileX = pixelToTile(player.position.x);
    //Calculate the offset of the player from the origin of the tile it’s on. I’ve add the width of the tile to this, just to make the numbers work.
    var offsetX = TILE + Math.floor(player.position.x % TILE);
    //this will start the starting tile for the x-axis. we divide it by 2 because if the player is at the centre of the screen and moves to far left or right,
    //it will stop the screen from going left and will make the player move instead
    startX = tileX - Math.floor(maxTiles / 2);

    if (startX < -1)
    {
        startX = 0;
        offsetX = 0;
    }
    if (startX > MAP.tw - maxTiles)
    {
        startX = MAP.tw - maxTiles + 1;
        offsetX = TILE;
    }
    //this will calulate the world x-axis offset, (in pixels) so that we can use this value for drawing the player later on.
    worldOffsetX = startX * TILE + offsetX;
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
    {
        for (var y = 0; y < level1.layers[layerIdx].height; y++)
       {
            var idx = y * level1.layers[layerIdx].width + startX;

        for (var x = startX; x < startX + maxTiles; x++)
        {
                if (level1.layers[layerIdx].data[idx] != 0)
                {
                    // the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile), so subtract one from the tileset id to get the
                    // correct tile
                    var tileIndex = level1.layers[layerIdx].data[idx] - 1;
                    var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
                    var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
                    context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, (x - startX) * TILE - offsetX, (y - 1) * TILE, TILESET_TILE, TILESET_TILE);
                  }
                
                idx++;
            }
        }
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var splashTimer = 3;
function runSplash(deltaTime)
{
    //this adds the splash
    splashTimer -= deltaTime;
    if (splashTimer <= 0)
    {
        gameState = STATE_GAME;
        return;
    }
    //this customizies the splash 
    context.fillStyle = "#000";
    context.font = "35px Arial";
    context.fillText("Start Game", 200, 240);
}

function runGame(deltaTime)
{
    
    //update frame counter
    fpsTime += deltaTime;
    fpsCount++;
    if (fpsTime >= 1) {
        fpsTime -= 1;
        fps = fpsCount;
        fpsCount = 0;
    }

    //draw the FPS
    context.fillStyle = "#f00";
    context.font = "14px Arial";
    context.fillText("FPS:" + fps, 5, 20, 100);
    drawMap();

   

    

    enemy.update(deltaTime);
    
    // score
    context.fillStyle = "red";
    context.font = "24px Comic Sans ";
    var scoreText = "Score:" + score;
    context.fillText(scoreText, SCREEN_WIDTH - 170, 35);

    //life counter
    var heartImage = document.createElement("img");
    heartImage.src = "heartImage.png";  

    for (var i = 0; i < lives; i++)
    {
        context.drawImage(heartImage, 10 + ((heartImage.width + 5) * i), 30);
    }

    
}

function runGameOver(deltaTime)
{

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function run()
{
    context.fillStyle = "#ccc";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var deltaTime = getDeltaTime();

    player.update(deltaTime); // update the player before drawing the map

    drawMap();
    player.draw();

    switch(gameState)
    {
        case STATE_SPLASH:
            runSplash(deltaTime);
            break;
        case STATE_GAME:
            runGame(deltaTime);
            break;
        case STATE_GAMEOVER:
            runGameOver(deltaTime);
            break;
    }
  
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//this initlizied the function for collisons.
initialize();





///////////////////////////////////////////////////////////////////////////////////////////////////////

// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);

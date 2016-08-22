var x1 = 0;
var x2 = 0;
var y1 = 0;
var y2 = 0;

var Set = function ()
{
    x1 = 0;
    x2 = 0;
    y1 = 0;
    y2 = 0;
};

var Normalize = function ()
{
    x1 = 250;
    y1 = 160;

    var length = Math.sqrt(x * x + y * y);

    var normalX = x / length;
    var normalY = y / length;
};

var Add = function ()
{
    var x3 = x1 + x2;
    var y3 = y1 + y2;
};

var Subtract = function ()
{
    var x3 = x1 - x2;
    var y3 = y1 - y2;
};

var Multiply = function()
{
    var scalar;

    var x3 = x1 * scalar;
    var y3 = y1 * scalar;
}
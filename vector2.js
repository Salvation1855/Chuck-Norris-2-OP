
//constructor for the vector2 object
var Vector2 = function ()
{
    this.x = 0;
    this.y = 0;
}

//set the components of the vector object
Vector2.prototype.set = function (x, y)
{
    this.x = x;
    this.y = y;
}

//normalize the vector
Vector2.prototype.Normalize = function (x, y)
{
    var newVector = new Vector2();

    var length = Math.sqrt(this.x * this.x + this.y * this.y);

    var normalX = this.x / length;
    var normalY = this.y / length;

    return newVector;
}

//add two vectors together
Vector2.prototype.Add = function (otherVector)
{
    var newVector = new Vector2();
    newVector.Set(this.x + otherVector.x, this.y + otherVector.y);
    return newVector;
}

//add subtract and multiply functions here
Vector2.prototype.Subtract = function (otherVector)
{
    var newVector = new Vector2();
    newVector.Set(this.x - otherVector.x, this.y - otherVector.y);
    return newVector;
}

//MultiplyScaler(num)
Vector2.prototype.Multiply = function (x, y)
    {
    var newVector = new Vector2();

    var scalar;

    var x3 = this.x * scalar;
    var y3 = this.y * scalar;

    return newVector;
    }
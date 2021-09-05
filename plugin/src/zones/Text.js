/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A Text Zone. This is a special kind of zone that scans the pixel data of the given
* Text object and uses it to emit particles from.
*
* Based on the type of renderer being used with this Text zone you can emit particles
* based on the pixels in the text, optionally tinting and setting their alpha to match.
* 
* @class Phaser.ParticleStorm.Zones.Text
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {Phaser.Text} text - The Text object used to populate this zone.
*/
Phaser.ParticleStorm.Zones.Text = function (game, text) {

    Phaser.ParticleStorm.Zones.Base.call(this, game);

    /**
    * The BitmapData object which is used to populate this zone.
    * @property {Phaser.BitmapData} bmd
    */
    this.bmd = new Phaser.BitmapData(game, 'ParticleStorm.Text');

    /**
    * A reference to the Phaser.Text object that populates the data in this zone.
    * @property {Phaser.Text} text
    */
    this.text = text;

    /**
    * This array holds all of the pixel color data from the pixels that were
    * scanned (i.e. non-transparent pixels). It is used internally and should
    * not usually be modified directly.
    * @property {array} points
    */
    this.points = [];

    this.update(text);

};

Phaser.ParticleStorm.Zones.Text.prototype = Object.create(Phaser.ParticleStorm.Zones.Base.prototype);
Phaser.ParticleStorm.Zones.Text.prototype.constructor = Phaser.ParticleStorm.Zones.Text;

/**
* Updates the contents of this zone. It resets the `points` array, clearing previous
* pixel data. If a `text` argument was provided the new Text object is loaded, then it has all
* pixels scanned and stored in the points array.
*
* The scale of the Text object is reset to 1:1 before the pixel data is scanned. The scale
* is restored again once the scan is complete. This zone is also scaled to match the scale
* of the Text object given to it.
*
* If you don't provide a `text` argument then it has the effect of re-scanning the current
* Text object, which is useful if you've modified it in any way (for example by changing
* the text value.)
*
* @method Phaser.ParticleStorm.Zones.Text#update
* @param {Phaser.Text} [text] - The Text object used to populate this zone.
* @return {Phaser.ParticleStorm.Zones.Text} This zone.
*/
Phaser.ParticleStorm.Zones.Text.prototype.update = function (text) {

    if (text !== undefined)
    {
        this.text = text;
    }
    else
    {
        text = this.text;
    }

    //  Store the Text object properties before we reset them

    var tx = text.x;
    var ty = text.y;

    var sx = text.scale.x;
    var sy = text.scale.y;

    //  Write the Text to the bmd

    text.x = 0;
    text.y = 0;

    text.scale.set(1);

    this.points = [];

    this.bmd.load(text);

    this.bmd.processPixelRGB(this.addPixel, this);

    this.scale = new Phaser.Point(sx, sy);

    //  Restore the Text object properties

    text.x = tx;
    text.y = ty;

    text.scale.set(sx, sy);

    return this;

};

/**
* Internal method used by the processPixelRGB call. Checks if the given
* color alpha is above `alphaThreshold` and if so it adds it to the
* points array.
*
* @method Phaser.ParticleStorm.Zones.Text#addPixel
* @param {object} color - The color object created by the processPixelRGB method.
* @param {number} x - The x coordinate of the pixel within the image.
* @param {number} y - The y coordinate of the pixel within the image.
* @return {boolean} This method must always return false.
*/
Phaser.ParticleStorm.Zones.Text.prototype.addPixel = function (color, x, y) {

    if (color.a > this.alphaThreshold)
    {
        this.points.push( { x: x, y: y, color: { r: color.r, g: color.g, b: color.b, a: color.a / 255 } });
    }

    return false;

};

/**
* Gets a single random pixel data object from the text.
*
* The object contains x and y properties relating to its position within the text.
* It also contains a color object containing r, g, b and a properties for the red,
* green, blue and alpha values of the pixel respectively.
*
* @method Phaser.ParticleStorm.Zones.Text#getRandom
* @return {object} A pixel data object.
*/
Phaser.ParticleStorm.Zones.Text.prototype.getRandom = function () {

    var rnd = this.game.rnd.pick(this.points);

    rnd.x *= this.scale.x;
    rnd.y *= this.scale.y;

    return rnd;

};

/**
* Emits the `qty` number of particles on the given emitter.
* Each particle is given a random location from within this zone.
*
* @method Phaser.ParticleStorm.Zones.Text#emit
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter containing the particles to be emitted from this zone.
* @param {string} key - The key of the data that the particle will use to obtain its emission values from.
* @param {number} x - The x location of the new particle.
* @param {number} y - The y location of the new particle.
* @param {number} qty - The quantity of particles to emit.
* @param {boolean} setAlpha - Should the zone set the alpha of the particle?
* @param {boolean} setColor - Should the zone set the tint of the particle?
* @return {Phaser.ParticleStorm.Particle} The particle that was emitted. If more than one was emitted it returns the last particle.
*/
Phaser.ParticleStorm.Zones.Text.prototype.emit = function (emitter, key, x, y, qty, setAlpha, setColor) {

    //  ------------------------------------------------
    //  If the coordinates are arrays it uses them as min/max pairs
    //  ------------------------------------------------
    if (Array.isArray(x))
    {
        x = this.game.rnd.between(x[0], x[1]);
    }

    if (Array.isArray(y))
    {
        y = this.game.rnd.between(y[0], y[1]);
    }

    var rnd = null;
    var particle = null;

    for (var i = 0; i < qty; i++)
    {
        rnd = this.game.rnd.pick(this.points);

        particle = emitter.emitParticle(key, x + (rnd.x * this.scale.x), y + (rnd.y * this.scale.y));

        if (particle)
        {
            if (setAlpha && rnd.color.a < 1)
            {
                particle.color.alpha.value = rnd.color.a;
            }

            if (setColor)
            {
                particle.color.setColor(rnd.color.r, rnd.color.g, rnd.color.b, rnd.color.a);
            }
        }
    }

    return particle;

};

/**
* Emits a particle for every pixel in this text object.
* The step and spacing arguments control the iteration through the pixels.
*
* @method Phaser.ParticleStorm.Zones.Text#emitFull
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter containing the particles to be emitted from this zone.
* @param {string} key - The key of the data that the particle will use to obtain its emission values from.
* @param {number} x - The x location of the new particle.
* @param {number} y - The y location of the new particle.
* @param {number} step - Controls the iteration through the pixel data.
* @param {number|array} spacing - The spacing between the particle coordinates.
* @param {boolean} setAlpha - Should the zone set the alpha of the particle?
* @param {boolean} setColor - Should the zone set the tint of the particle?
* @return {Phaser.ParticleStorm.Particle} The particle that was emitted. If more than one was emitted it returns the last particle.
*/
Phaser.ParticleStorm.Zones.Text.prototype.emitFull = function (emitter, key, x, y, step, spacing, setAlpha, setColor) {

    if (step === undefined) { step = 1; }

    var sx = 1;
    var sy = 1;

    if (Array.isArray(spacing))
    {
        sx = spacing[0];
        sy = spacing[1];
    }
    else if (typeof spacing === 'number')
    {
        sx = spacing;
        sy = spacing;
    }

    //  ------------------------------------------------
    //  If the coordinates are arrays it uses them as min/max pairs
    //  ------------------------------------------------
    if (Array.isArray(x))
    {
        x = this.game.rnd.between(x[0], x[1]);
    }

    if (Array.isArray(y))
    {
        y = this.game.rnd.between(y[0], y[1]);
    }

    var point = null;
    var particle = null;

    for (var i = 0; i < this.points.length; i += step)
    {
        point = this.points[i];

        var px = x + (point.x * this.scale.x) * (sx / step);
        var py = y + (point.y * this.scale.y) * (sy / step);

        particle = emitter.emitParticle(key, px, py);

        if (particle)
        {
            if (setAlpha && point.color.a < 1)
            {
                particle.color.alpha.value = point.color.a;
            }

            if (setColor)
            {
                particle.color.setColor(point.color.r, point.color.g, point.color.b, point.color.a);
            }
        }
    }

    return particle;

};

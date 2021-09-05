/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A Spline Zone. A spline consists of a set of points through which a path is 
* constructed. Particles can be emitted anywhere along this path.
* 
* The points can be set from a variety of formats:
*
* - An array of Point objects: `[new Phaser.Point(x1, y1), ...]`
* - An array of objects with public x/y properties: `[ { x: 0, y: 0 }, ...]`
* - An array of objects with public x/y properties: `[obj1, obj2, ...]`
* 
* @class Phaser.ParticleStorm.Zones.Spline
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {integer} [mode=0] - The type of spline to create. 0 = linear, 1 = bezier and 2 = catmull.
* @param {number} [resolution=1000] - The resolution of the spline. Higher values generate more points during path interpolation.
* @param {boolean} [closed=true] - A closed path loops from the final point back to the start again.
* @param {Phaser.Point[]|number[]|...Phaser.Point|...number} points - An array of points to use for the spline.
*        These can also be set later via `ParticleStorm.Zones.Spline.setTo`.
*/
Phaser.ParticleStorm.Zones.Spline = function (game, mode, resolution, closed, points) {

    if (mode === undefined) { mode = 0; }
    if (resolution === undefined) { resolution = 1000; }
    if (closed === undefined) { closed = true; }

    Phaser.ParticleStorm.Zones.Base.call(this, game);

    /**
    * Reference to the Phaser.Math class.
    * @property {Phaser.Math} math
    */
    this.math = this.game.math;

    /**
    * An object holding the point values.
    * @property {object} points
    */
    this.points = { x: [], y: [] };

    /**
    * An array containing the interpolated path values.
    * @property {array} path
    */
    this.path = [];

    /**
    * The resolution controls how tightly packed together the interpolated results are.
    * @property {integer} resolution
    */
    this.resolution = resolution;

    /**
    * The type of spline. 0 = linear, 1 = bezier and 2 = catmull.
    * @property {integer} mode
    */
    this.mode = mode;

    /**
    * A closed path loops from the final point back to the start again.
    * @property {boolean} closed
    */
    this.closed = closed;

    /**
    * @property {number} mult - Internal index var.
    * @private
    */
    this.mult = 0;

    this.update(points);

};

Phaser.ParticleStorm.Zones.Spline.prototype = Object.create(Phaser.ParticleStorm.Zones.Base.prototype);
Phaser.ParticleStorm.Zones.Spline.prototype.constructor = Phaser.ParticleStorm.Zones.Spline;

/**
* Updates the spline path data. This clears the path and rebuilds it based on
* the points given.
* 
* @method Phaser.ParticleStorm.Zones.Spline#update
* @param {Phaser.Point[]|number[]|...Phaser.Point|...number} points - An array of points to use for the spline.
*        These can also be set later via `ParticleStorm.Zones.Spline.setTo`.
* @return {Phaser.ParticleStorm.Zones.Spline} This zone.
*/
Phaser.ParticleStorm.Zones.Spline.prototype.update = function (points) {

    this.points = { x: [], y: [] };
    this.path = [];

    for (var i = 0; i < points.length; i++)
    {
        this.points.x.push(points[i].x);
        this.points.y.push(points[i].y);
    }

    if (this.closed)
    {
        this.points.x.push(points[0].x);
        this.points.y.push(points[0].y);
    }

    //  Now loop through the points and build the path data
    var ix = 0;
    var x = 1 / this.resolution;

    for (var i = 0; i <= 1; i += x)
    {
        if (this.mode === 0)
        {
            var px = this.math.linearInterpolation(this.points.x, i);
            var py = this.math.linearInterpolation(this.points.y, i);
        }
        else if (this.mode === 1)
        {
            var px = this.math.bezierInterpolation(this.points.x, i);
            var py = this.math.bezierInterpolation(this.points.y, i);
        }
        else if (this.mode === 2)
        {
            var px = this.math.catmullRomInterpolation(this.points.x, i);
            var py = this.math.catmullRomInterpolation(this.points.y, i);
        }

        var node = { x: px, y: py, angle: 0 };

        if (ix > 0)
        {
            node.angle = this.math.angleBetweenPoints(this.path[ix - 1], node);
        }

        this.path.push(node);

        ix++;
    }

    this.mult = this.path.length / 100;

    return this;

};

/**
* Gets a random point from this path.
* 
* @method Phaser.ParticleStorm.Zones.Spline#getRandom
* @return {object} A point from the path. The object contains public x, y and angle properties.
*/
Phaser.ParticleStorm.Zones.Spline.prototype.getRandom = function () {

    return this.game.rnd.pick(this.path);

};

/**
* Emits the `qty` number of particles on the given emitter.
* 
* Each particle has a random location from the path of this spline.
*
* @method Phaser.ParticleStorm.Zones.Spline#emit
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter containing the particles to be emitted from this zone.
* @param {string} key - The key of the data that the particle will use to obtain its emission values from.
* @param {number} x - The x location of the new particle.
* @param {number} y - The y location of the new particle.
* @param {number} qty - The quantity of particles to emit.
* @return {Phaser.ParticleStorm.Particle} The particle that was emitted. If more than one was emitted it returns the last particle.
*/
Phaser.ParticleStorm.Zones.Spline.prototype.emit = function (emitter, key, x, y, qty) {

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
        rnd = this.game.rnd.pick(this.path);

        particle = emitter.emitParticle(key, x + rnd.x, y + rnd.y);
    }

    return particle;

};

/**
* Emits the `qty` number of particles on the given emitter.
* 
* Each particle has its location based on the percent argument.
* For example a percent value of 0 will emit a particle right at the
* start of the spline, where-as a percent value of 50 will emit a 
* particle half-way along the spline.
*
* @method Phaser.ParticleStorm.Zones.Spline#emit
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter containing the particles to be emitted from this zone.
* @param {string} key - The key of the data that the particle will use to obtain its emission values from.
* @param {number} x - The x location of the new particle.
* @param {number} y - The y location of the new particle.
* @param {number} qty - The quantity of particles to emit.
* @param {number} percent - The distance along the path to emit the particles from. Between 0 and 100.
* @return {Phaser.ParticleStorm.Particle} The particle that was emitted. If more than one was emitted it returns the last particle.
*/
Phaser.ParticleStorm.Zones.Spline.prototype.emitPercent = function (emitter, key, x, y, qty, percent) {

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

    var particle = null;

    percent = Math.floor(percent * this.mult);

    for (var i = 0; i < qty; i++)
    {
        var path = this.path[percent];

        if (path)
        {
            particle = emitter.emitParticle(key, x + path.x, y + path.y);
        }
    }

    return particle;

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @author       Richard Lord
* @copyright    2015 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Gravity Well creates a force on the particles to draw them towards a single point.
* The force applied is inversely proportional to the square of the distance from the particle to the point, 
* in accordance with Newton's law of gravity.
* 
* A Gravity Well only effects particles owned by the emitter that created it.
*
* Gravity Wells don't have any display properties, i.e. they are not Sprites.
*
* This class was directly inspired by the work of Richard Lord and some of the jsdocs
* use his original text. As such this class is released under an MIT License.
* 
* @class Phaser.ParticleStorm.GravityWell
* @constructor
* @param {Phaser.ParticleStorm.Emitter} emitter - The Emitter that owns this Gravity Well.
* @param {number} [x=0] - The x coordinate of the Gravity Well, the point towards which particles are drawn.
* @param {number} [y=0] - The y coordinate of the Gravity Well, the point towards which particles are drawn.
* @param {number} [power=0] - The strength of the gravity well. Larger numbers create stronger forces. Start with low values like 1.
* @param {number} [epsilon=100] - The minimum distance for which gravity is calculated. 
*                               Particles closer than this distance experience a gravity force as if 
*                               they were this distance away. This stops the gravity effect blowing 
*                               up as distances get small. For realistic gravity effects you will want 
*                               a small epsilon (~1), but for stable visual effects a larger
*                               epsilon (~100) is often better.
* @param {number} [gravity=50] - The gravity constant.
*/
Phaser.ParticleStorm.GravityWell = function (emitter, x, y, power, epsilon, gravity) {

    if (x === undefined) { x = 0; }
    if (y === undefined) { y = 0; }
    if (power === undefined) { power = 0; }
    if (epsilon === undefined) { epsilon = 100; }
    if (gravity === undefined) { gravity = 50; }

    /**
    * @property {Phaser.ParticleStorm.Emitter} emitter - The Emitter that this Gravity Well belongs to.
    */
    this.emitter = emitter;

    /**
    * @property {Phaser.Time} time - A reference to the Phaser.Time system.
    */
    this.time = emitter.game.time;

    /**
    * @property {Phaser.Point} position - The position of the Gravity Well in world space.
    */
    this.position = new Phaser.Point(x, y);

    /**
    * @property {boolean} active - When `true` the Gravity Well is in effect. When `false` it doesn't influence particles.
    */
    this.active = true;

    /**
    * @property {number} _gravity - Internal gravity var.
    * @private
    */
    this._gravity = gravity;

    /**
    * @property {number} _power - Internal power var.
    * @private
    */
    this._power = 0;

    /**
    * @property {number} _epsilon - Internal epsilon var.
    * @private
    */
    this._epsilon = 0;

    this.power = power;
    this.epsilon = epsilon;

};

Phaser.ParticleStorm.GravityWell.prototype = {

    /**
    * Applies the influence of this Gravity Well to the given Particle.
    *
    * This is called automatically by the Emitter the Gravity Well belongs to.
    * 
    * @method Phaser.ParticleStorm.GravityWell#step
    * @param {Phaser.ParticleStorm.Particle} particle - The particle to adjust based on this Gravity Well.
    */
    step: function (particle) {

        var x = this.position.x - particle.transform.x;
        var y = this.position.y - particle.transform.y;
        var dSq = x * x + y * y;

        if (dSq === 0)
        {
            return;
        }

        var d = Math.sqrt(dSq);

        if (dSq < this._epsilon)
        {
            dSq = this._epsilon;
        }

        var factor = (this._power * this.time.elapsed) / (dSq * d);

        particle.transform.velocity.x.value += x * factor;
        particle.transform.velocity.y.value += y * factor;

    }

};

/**
* The minimum distance for which the gravity force is calculated. 
* Particles closer than this distance experience the gravity as if
* they were this distance away. This stops the gravity effect blowing 
* up as distances get small.  For realistic gravity effects you will want 
* a small epsilon (~1), but for stable visual effects a larger
* epsilon (~100) is often better.
* 
* @name Phaser.ParticleStorm.GravityWell#epsilon
* @property {number} epsilon
*/
Object.defineProperty(Phaser.ParticleStorm.GravityWell.prototype, "epsilon", {

    get: function () {

        return Math.sqrt(this._epsilon);

    },

    set: function (value) {

        this._epsilon = value * value;

    }

});

/**
* The strength of the gravity force - larger numbers produce a stronger force.
* 
* @name Phaser.ParticleStorm.GravityWell#power
* @property {number} power
*/
Object.defineProperty(Phaser.ParticleStorm.GravityWell.prototype, "power", {

    get: function () {

        return this._power / this.gravity;

    },

    set: function (value) {

        this._power = value * this.gravity;

    }

});

/**
* The gravity constant against which the forces are calculated.
* 
* @name Phaser.ParticleStorm.GravityWell#gravity
* @property {number} gravity
*/
Object.defineProperty(Phaser.ParticleStorm.GravityWell.prototype, "gravity", {

    get: function () {

        return this._gravity;

    },

    set: function (value) {

        var pwr = this.power;
        this._gravity = value;
        this.power = pwr;

    }

});

Phaser.ParticleStorm.GravityWell.prototype.constructor = Phaser.ParticleStorm.GravityWell;

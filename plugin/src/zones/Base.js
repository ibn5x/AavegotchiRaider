/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

Phaser.ParticleStorm.Zones = {};

/**
* The base class which all ParticleStorm zones must extend.
*
* @class Phaser.ParticleStorm.Zones.Base
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.ParticleStorm.Zones.Base = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the Phaser Game instance.
    */
    this.game = game;

    /**
    * The active state of this Zone. If set to `false` it won't emit or process any particles.
    * @property {boolean} active
    */
    this.active = true;

    /**
    * The scale of this zone. You can scale a zone, which influences the position of
    * emitted particles and the overall dimensions of the zone.
    * @property {Phaser.Point} scale
    */
    this.scale = new Phaser.Point(1, 1);

    /**
    * When scanning the pixels of image based zones you can set it to ignore any pixel
    * with an alpha value *below* the threshold. This is a value between 0 (fully
    * transparent) to 255 (fully opaque). If you change this value you need to call
    * `update` afterwards to re-scan the zone.
    * @property {integer} alphaThreshold
    * @default
    */
    this.alphaThreshold = 0;

    /**
    * @property {Phaser.Point} _rnd - Internal point property.
    * @private
    */
    this._rnd = new Phaser.Point();

};

Phaser.ParticleStorm.Zones.Base.prototype = {

    /**
    * Gets a random point from within this zone.
    * Takes the scale of the zone into account.
    * 
    * Internally this method uses the private _rnd property
    * of this zone, so what is returned is a reference to
    * that Phaser.Point object. So if you need to store
    * the result rather than use it immediately you should
    * clone the Point or extract its values.
    *
    * @method Phaser.ParticleStorm.Zones.Base#getRandom
    * @return {Phaser.Point} A random point within this zone.
    */
    getRandom: function () {

        if (this.shape === Phaser.Point)
        {
            this._rnd = this.shape;
        }
        else
        {
            this.shape.random(this._rnd);
        }

        this._rnd.x *= this.scale.x;
        this._rnd.y *= this.scale.y;

        return this._rnd;

    },

    /**
    * Emits the `qty` number of particles on the given emitter.
    * Each particle is given a random location from within this zone.
    *
    * @method Phaser.ParticleStorm.Zones.Base#emit
    * @param {Phaser.ParticleStorm.Emitter} emitter - The emitter containing the particles to be emitted from this zone.
    * @param {string} key - The key of the data that the particle will use to obtain its emission values from.
    * @param {number|array} x - The x location of the new particle.
    * @param {number|array} y - The y location of the new particle.
    * @param {number} qty - The quantity of particles to emit.
    * @return {Phaser.ParticleStorm.Particle} The particle that was emitted. If more than one was emitted it returns the last particle.
    */
    emit: function (emitter, key, x, y, qty) {

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

        for (var i = 0; i < qty; i++)
        {
            this.shape.random(this._rnd);

            particle = emitter.emitParticle(key, x + (this._rnd.x * this.scale.x), y + (this._rnd.y * this.scale.y), null);
        }

        return particle;

    }

};

Phaser.ParticleStorm.Zones.Base.prototype.constructor = Phaser.ParticleStorm.Zones.Base;

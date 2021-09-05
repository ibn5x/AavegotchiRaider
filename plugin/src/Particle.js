/**
* @author       Richard Davey <rich@photonstorm.com>
* @author       Pete Baron <pete@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A single particle created and updated by a Particle Emitter.
* 
* It can belong to only one Emitter at any one time.
*
* Particles themselves don't have any display properties, i.e. they are not Sprites. If a Particle
* is added to an Emitter Renderer that uses Sprites, then a new Sprite object will be created and
* assigned to the Particles `sprite` property. Not all types of renderer do this, for example the
* Pixel renderer doesn't use sprites at all.
* 
* Particles are frequently pooled, so don't add any parameter initialization into the constructor should you extend it.
* Instead place it inside the Particle.reset method.
*
* @class Phaser.ParticleStorm.Particle
* @constructor
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter that owns this particle.
*/
Phaser.ParticleStorm.Particle = function (emitter) {

    /**
    * The emitter that owns this particle.
    * @property {Phaser.ParticleStorm.Emitter} emitter
    */
    this.emitter = emitter;

    /**
    * The renderer responsible for rendering this particle.
    * @property {Phaser.ParticleStorm.Renderer.Base} renderer
    */
    this.renderer = null;

    /**
    * A set of useful common static functions.
    * @property {Phaser.ParticleStorm.Graph} graph
    */
    this.graph = Phaser.ParticleStorm.Graph;

    /**
    * The transform control for this particle. Contains properties such as position, velocity and acceleration.
    * @property {Phaser.ParticleStorm.Controls.Transform} transform
    */
    this.transform = new Phaser.ParticleStorm.Controls.Transform(this);

    /**
    * The color control for this particle. Contains color related properties including red, green, blue, alpha, tint and blendMode.
    * @property {Phaser.ParticleStorm.Controls.Color} color
    */
    this.color = new Phaser.ParticleStorm.Controls.Color(this);

    /**
    * The texture control for this particle. Contains texture related properties including key, frame and animation handling.
    * @property {Phaser.ParticleStorm.Controls.Texture} texture
    */
    this.texture = new Phaser.ParticleStorm.Controls.Texture(this);

    /**
    * @property {Phaser.ParticleStorm.Particle} parent - The parent particle, if it has one.
    * @default
    */
    this.parent = null;

    /**
    * The lifespan of the particle is the length of time in milliseconds that it will live for once spawned.
    * Set the lifespan to zero to allow it to live forever. However particles cannot live forever if you use
    * any parameter controls at all, as they require an expiry date.
    * @property {number} lifespan
    * @default
    */
    this.lifespan = 2000;

    /**
    * Should the particle be kept alive and rendering once it has completed its lifespan?
    * This can only be set to true if lifespan is a value above zero.
    * When a particle is 'kept alive' it will never dispatch an onKill event.
    * @property {boolean} keepAlive
    * @default
    */
    this.keepAlive = false;

    /**
    * The delay in milliseconds that the particle will wait for until spawning.
    * @property {number} delay
    * @default
    */
    this.delay = 0;

    /**
    * Controls if the particle should still be rendered or not, even when delayed.
    * This allows you to display a particle in place before its lifecycle starts.
    * @property {boolean} delayVisible
    * @default
    */
    this.delayVisible = false;

    /**
    * The current age of this particle as a percentage of its total lifespan. A value between 0 and 1.
    * @property {number} life
    * @default
    */
    this.life = 0;

    /**
    * If this particle is part of a Sprite based renderer then the sprite associated with this particle is referenced
    * in this property. Otherwise this value is `null`.
    * @property {Phaser.Sprite} sprite
    * @default
    */
    this.sprite = null;

    /**
    * The visible state of this particle.
    * @property {boolean} visible
    */
    this.visible = false;

    /**
    * A particle is considered 'complete' when it reaches 100% of its lifespan.
    * If it has no lifespan it is never 'complete'.
    * @property {boolean} isComplete
    */
    this.isComplete = false;

    /**
    * Should this particle ignore any force applied by its emitter?
    * @property {boolean} ignoreForce
    * @default
    */
    this.ignoreForce = false;

    /**
    * Should this particle ignore any scrollSpeed applied by its emitter?
    * @property {boolean} ignoreScrollSpeed
    * @default
    */
    this.ignoreScrollSpeed = false;

    /**
    * @property {object} emit - The emit data of this particle.
    * @private
    */
    this.emit = {};

    /**
    * @property {number} _age - Internal helper for tracking the current age of this particle.
    * @private
    */
    this._age = 0;

    /**
    * @property {number} _lastPercent - Internal tracking var for previous lifePercent.
    * @private
    */
    this._lastPercent = 0;

    /**
    * @property {number} _numToEmit - Internal accumulator to track the fractions of a particle to be emitted across multiple frames.
    * @private
    */
    this._numToEmit = 0;

};

Phaser.ParticleStorm.Particle.prototype = {

    /**
    * Reset all of the particle properties back to their defaults, ready for spawning.
    * 
    * If the optional `data` parameter is provided then Particle.create will be automatically called.
    *
    * @method Phaser.ParticleStorm.Particle#reset
    * @param {Phaser.ParticleStorm.Renderer.Base} renderer - The renderer responsible for rendering this particle.
    * @param {number} x - The x position of this Particle in world space.
    * @param {number} y - The y position of this Particle in world space.
    * @param {object} [data] - The data this particle will use when emitted.
    * @return {Phaser.ParticleStorm.Particle} This Particle object.
    */
    reset: function (renderer, x, y, data) {

        this.renderer = renderer;

        this.transform.reset();
        this.color.reset();
        this.texture.reset();

        this.emit = Object.create(Phaser.ParticleStorm.BASE_EMIT);

        this.isComplete = false;
        this.keepAlive = false;

        this.delay = 0;
        this.delayVisible = false;

        this.ignoreForce = false;
        this.ignoreScrollSpeed = false;

        this.alive = false;
        this.lifespan = 2000;
        this.life = 0;
        this.visible = false;

        this._age = 0;
        this._lastPercent = 0;
        this._numToEmit = 0;

        if (data !== undefined)
        {
            this.create(x, y, data);
        }

        return this;

    },

    /**
    * Activates this Particle. Should be called only after the particle has been reset.
    * 
    * It works by populating all of the local settings with the values contained in the `data` object.
    * It's then added to the renderer and drawn once with its initial values.
    *
    * @method Phaser.ParticleStorm.Particle#create
    * @param {number} x - The x position of this Particle in world space.
    * @param {number} y - The y position of this Particle in world space.
    * @param {object} data - The data this particle will use to populate its settings.
    * @return {Phaser.ParticleStorm.Particle} This Particle object.
    */
    create: function (x, y, data) {

        //  ------------------------------------------------
        //  Lifespan
        //  ------------------------------------------------

        if (data.hasOwnProperty('lifespan'))
        {
            this.lifespan = this.graph.getMinMax(data.lifespan);
        }

        this.keepAlive = data.keepAlive;

        //  ------------------------------------------------
        //  Delay
        //  ------------------------------------------------

        if (data.hasOwnProperty('delay'))
        {
            this.delay = this.graph.getMinMax(data.delay);
        }

        this.ignoreForce = data.ignoreForce;
        this.ignoreScrollSpeed = data.ignoreScrollSpeed;

        //  ------------------------------------------------
        //  Update controls
        //  ------------------------------------------------

        this.transform.init(x, y, data);
        this.color.init(data);
        this.texture.init(data);

        //  ------------------------------------------------
        //  Emit child
        //  ------------------------------------------------

        if (data.emit)
        {
            this.emit = Object.create(data.emit);
        }

        this.visible = (data.visible === false) ? false : true;

        this.alive = true;

        if (this.parent && this.parent.emit && this.parent.emit.inherit)
        {
            this.alive = this.onInherit(this.parent);
        }

        if (this.alive)
        {
            //  Make sure all parameters are set
            this.transform.step();
            this.color.step();

            //  Add a display system object for this particle
            var sprite = this.renderer.add(this);

            if (sprite)
            {
                //  Only the TextureControl has a post-add step (which defines the animation frames)
                this.texture.step(data, sprite);
            }

            this.onEmit();

            if (this.emitter.onEmit)
            {
                this.emitter.onEmit.dispatch(this.emitter, this);
            }

            //  Draw the particle in its initial state
            this.renderer.update(this);
        }

        return this;

    },

    /**
    * Update this particle for a single time step.
    * 
    * Decides when to emit particles and when to die.
    *
    * @method Phaser.ParticleStorm.Particle#step
    * @param {number} elapsedTime - How long has it been since the last time this was updated (in milliseconds)
    * @param {Phaser.Point} [force] - A force which is applied to this particle as acceleration on every update call.
    * @return {boolean} True to continue living, false if this particle should die now.
    */
    step: function (elapsedTime, force) {

        //  Keep track of the particles age
        this._age += elapsedTime;

        //  If there's a delay
        if (this.delay)
        {
            if (this._age < this.delay)
            {
                this.renderer.update(this);

                //  Exit (but don't kill the particle)
                return true;
            }
            else
            {
                //  The delay has expired. Clear the delay value and reset the particle _age to zero (newborn)
                this.delay = 0;
                this._age = 0;
            }
        }

        this._lastPercent = this.life;

        //  Calculate lifespan of this particle, commencing when delay expired (if there was one)
        if (this.lifespan > 0)
        {
            this.life = Math.min(this._age / this.lifespan, 1.0);
        }

        if (force && !this.ignoreForce)
        {
            this.transform.velocity.x.value += force.x;
            this.transform.velocity.y.value += force.y;
        }

        this.transform.step();
        this.color.step();

        this.onUpdate();

        if (this.alive)
        {
            //  How many should we release in this time interval (summed with any fractions we didn't emit previously)
            this._numToEmit += this.emitter.updateFrequency(this.emit, elapsedTime, this._lastPercent, this.life);

            //  Create all the 'whole' emissions
            while (this._numToEmit >= 1.0)
            {
                this.emitChild();
            }

            this.renderer.update(this);
        }

        if (!this.isComplete && this.life === 1.0)
        {
            this.isComplete = true;

            if (this.emitter.onComplete)
            {
                this.emitter.onComplete.dispatch(this.emitter, this);
            }
        }

        //  Return false if this particle should die, otherwise true
        return (this.life < 1.0 || this.keepAlive);

    },

    /**
    * Emit a child particle from this one.
    *
    * @method Phaser.ParticleStorm.Particle#emitChild
    * @private
    */
    emitChild: function () {

        var x = this.graph.getMinMax(this.emit.offsetX) | 0;
        var y = this.graph.getMinMax(this.emit.offsetY) | 0;

        //  Does this emitter specify a creation circle or rect?
        if (this.emit.rect)
        {
            // pick a random location inside the rectangle
            var rect = this.emit.rect;
            x = Math.random() * rect.width + rect.x;
            y = Math.random() * rect.height + rect.y;
        }
        else if (this.emit.circle)
        {
            var radius = this.emit.circle;
            // randomly pick a y coordinate inside the circle
            y = Math.random() * radius * 2 - radius;
            // calculate the horizontal span from the point (0, y) to the circumference (Pythagoras: x2 + y2 = r2)
            var span = Math.sqrt(radius * radius - y * y);
            // randomly pick an x coordinate in that span on either side of the x = 0 line
            x = Math.random() * span * 2 - span;
        }

        var key = this.emit.name;

        if (typeof key !== 'string')
        {
            key = this.getChildKey(this.emit.name);
        }

        if (key)
        {
            var p = this.emitter.emitParticle(key, this.transform.x + x, this.transform.y + y, this);

            //  Apply any overwrite parameters to the new child particle
            if (p && this.emit.overwrite)
            {
                this.applyOverwrite(this.emit.overwrite, p);
            }
        }

        this._numToEmit -= 1.0;

    },

    /**
    * A blank method that allows you to control overwriting specific particle properties
    * on emission. Extend the Particle class then use this method as required.
    *
    * @method Phaser.ParticleStorm.Particle#applyOverwrite
    * @param {object} data - The overwrite data.
    * @param {Phaser.ParticleStorm.Particle} particle - The Particle object.
    * @return {Phaser.ParticleStorm.Particle} This Particle object.
    */
    applyOverwrite: function (data, particle) {

        return particle;

    },

    /**
    * Work out what child particle should be emitted by this particle.
    * Handles simple name string, lists of name strings, and the "at" format.
    *
    * @method Phaser.ParticleStorm.Particle#getChildKey
    * @param {object} param - A child defining data structure.
    * @returns {string|null} The name of the child to emit.
    */
    getChildKey: function (param) {

        if (Array.isArray(param))
        {
            return this.emitter.game.rnd.pick(param);
        }

        if (param.at !== undefined && param.at.length > 0)
        {
            //  It's a list of child types over time using the "at" list syntax, find the appropriate one
            var ret = param.at[0].value;

            for (var i = 0; i < param.at.length; i++)
            {
                if (param.at[i].time > this.life)
                {
                    break;
                }

                ret = param.at[i].value;
            }

            return ret;
        }

        return null;

    },

    /**
    * Set this particles velocity components to radiate away from its current position by the given angle.
    *
    * @method Phaser.ParticleStorm.Particle#radiate
    * @param {object} velocity - An object containing a min/max pair, an array of strings containing discrete values, or a single discrete value.
    * @param {number} [from=0] - If both arc variables are undefined, radiate in all directions.
    * @param {number} [to=359] - If both arc variables are defined the particle will radiate within the arc range defined.
    * @return {Phaser.ParticleStorm.Particle} This Particle object.
    */
    radiate: function (velocity, from, to) {

        //  If `from` is defined, but `to` isn't, we set `to` to match `from`
        if (to === undefined && from !== undefined)
        {
            to = from;
        }
        else
        {
            if (from === undefined) { from = 0; }
            if (to === undefined) { to = 359; }
        }

        var v = velocity;

        if (velocity.hasOwnProperty("min"))
        {
            v = this.graph.getMinMax(velocity);
        }
        else if (Array.isArray(velocity))
        {
            v = parseFloat(this.emitter.game.rnd.pick(velocity), 10);
        }

        var angle = (Math.random() * (to - from) + from) * Math.PI / 180.0;

        this.transform.velocity.x.value = Math.sin(angle) * v;
        this.transform.velocity.y.value = -Math.cos(angle) * v;

        return this;

    },

    /**
    * Set this particles velocity components to radiate away from a given point.
    *
    * @method Phaser.ParticleStorm.Particle#radiateFrom
    * @param {number} x - The central x location to radiate from.
    * @param {number} y - The central y location to radiate from.
    * @param {object} velocity - An object containing a min/max pair, an array of strings containing discrete values, or a single discrete value.
    * @return {Phaser.ParticleStorm.Particle} This Particle object.
    */
    radiateFrom: function (x, y, velocity) {

        var v = velocity;

        if (velocity.hasOwnProperty("min"))
        {
            v = this.graph.getMinMax(velocity);
        }
        else if (Array.isArray(velocity))
        {
            v = parseFloat(this.emitter.game.rnd.pick(velocity), 10);
        }

        var dx = (this.transform.x - x);
        var dy = (this.transform.y - y);
        var d = Math.sqrt(dx * dx + dy * dy);

        this.transform.velocity.x.value = dx * v / d;
        this.transform.velocity.y.value = dy * v / d;

        return this;

    },

    /**
    * Set this particles velocity components to _approximately_ head towards the given coordinates.
    * 
    * It will set the velocity to ensure it arrives within the lifespan of this particle.
    * However it does not factor in other forces acting on the particle such as
    * Emitter.force or Gravity Wells.
    *
    * If you specify a zone it will pick a random point from anywhere within the zone and
    * add the x and y values to it, using the x and y values as the placement of the zone.
    *
    * @method Phaser.ParticleStorm.Particle#target
    * @param {object} data - The target data.
    * @param {number} [data.x] - The x location to head to. Must be specified if no zone is given.
    * @param {number} [data.y] - The y location to head to. Must be specified if no zone is given.
    * @param {Phaser.ParticleStorm.Zones.Base} [data.zone] - A zone. A random point within the zone will be selected as the target.
    * @param {string} [data.speed] - Either 'linear', 'reverse' or 'yoyo'.
    * @return {Phaser.ParticleStorm.Particle} This Particle object.
    */
    target: function (data) {

        var x = 0;
        var y = 0;
        var t = this.transform;

        if (data.x)
        {
            x = data.x;
        }

        if (data.y)
        {
            y = data.y;
        }

        if (data.zone)
        {
            var p = data.zone.getRandom();

            x += p.x;
            y += p.y;
        }

        var angle = Math.atan2(y - t.y, x - t.x);

        var dx = t.x - x;
        var dy = t.y - y;

        var speed = Math.sqrt(dx * dx + dy * dy) / (this.lifespan / 1000);

        var vx = (Math.cos(angle) * speed) * t.time.physicsElapsed;
        var vy = (Math.sin(angle) * speed) * t.time.physicsElapsed;

        if (data.speed)
        {
            this.graph.fromControl({ value: vx * 2, control: data.speed }, t.velocity.x);
            this.graph.fromControl({ value: vy * 2, control: data.speed }, t.velocity.y);
        }
        else
        {
            t.velocity.x.value = vx;
            t.velocity.y.value = vy;
        }

        return this;

    },

    /**
    * Sets a new lifespan for this particle.
    * 
    * The current age of the particle is reset to zero when this is called.
    *
    * @method Phaser.ParticleStorm.Particle#setLife
    * @param {number|object} lifespan - The new lifespan of this particle in ms. Either a value or a min/max pair.
    * @param {boolean} [keepAlive=false] - Should the particle be kept alive at the end of its lifespan?
    * @return {Phaser.ParticleStorm.Particle} This Particle object.
    */
    setLife: function (lifespan, keepAlive) {

        this.lifespan = this.graph.getMinMax(lifespan);

        this.life = 0;
        this._age = 0;
        this._lastPercent = 0;

        this.isComplete = false;
        this.keepAlive = keepAlive;

        return this;

    },

    /**
    * Turns off this particle, leaving it ready to be restarted with reset().
    *
    * @method Phaser.ParticleStorm.Particle#kill
    */
    kill: function () {

        this.alive = false;

        this.renderer.kill(this);

        this.onKill();

    },

    /**
    * Called when this Particle is first emitted.
    * 
    * This is a blank method for you to override in your own classes that extend Particle.
    *
    * @method Phaser.ParticleStorm.Particle#onEmit
    * @param {Phaser.ParticleStorm.Particle} [parent] - The parent particle that emitted this one, if any.
    */
    onEmit: function () {},

    /**
    * Called when this Particle is updated by the Particle Manager.
    *
    * It is called at the end of the Particle.step method, just before this particle emits
    * any children and before it's sent to the renderer. If you set Particle.alive to false
    * in this method then the particle will not emit any children or be rendered.
    * 
    * This is a blank method for you to override in your own classes that extend Particle.
    *
    * @method Phaser.ParticleStorm.Particle#onUpdate
    */
    onUpdate: function () {},

    /**
    * Called when this Particle inherits values from a parent particle.
    *
    * This method must return a boolean value. If you wish for this particle to be used
    * by the Particle Manager and rendered then return `true`. If you want the particle
    * to be immediately killed then return `false`.
    * 
    * This is method is for you to override in your own classes that extend Particle.
    *
    * @method Phaser.ParticleStorm.Particle#onInherit
    * @param {Phaser.ParticleStorm.Particle} parent - The parent particle that emitted this one.
    * @return {boolean} True if this particle should be added to the pool and rendered, otherwise false if it should be killed.
    */
    onInherit: function () {

        return true;

    },

    /**
    * Called when this Particle is killed by its emitter, or directly in code.
    * 
    * A killed particle is moved from the active particle list back to the pool, ready
    * for use again in the future. It is not destroyed, it is hibernated for later use.
    * 
    * This is a blank method for you to override in your own classes that extend Particle.
    *
    * @method Phaser.ParticleStorm.Particle#onKill
    */
    onKill: function () {}

};

/**
* The life percent value of this particle rounded between 0 and 100.
* 
* If you need a value between 0 and 1 then use `Particle.life` instead.
*
* @name Phaser.ParticleStorm.Particle#lifePercent
* @property {integer} lifePercent - The current life percentage of this particle. Rounded between 0 and 100.
* @readOnly
*/
Object.defineProperty(Phaser.ParticleStorm.Particle.prototype, "lifePercent", {

    get: function () {

        return Math.round(this.life * 100);

    }

});

/**
* Sets the frequency at which this particle emits children.
*
* @name Phaser.ParticleStorm.Particle#frequency
* @property {number|object} value - A value/control type object defining a set rate or a graph of rates across lifespan.
*/
Object.defineProperty(Phaser.ParticleStorm.Particle.prototype, "frequency", {

    get: function () {

        return this.emit.value;

    },

    set: function (value) {

        this.emit.value = value;

    }

});

Phaser.ParticleStorm.Particle.prototype.constructor = Phaser.ParticleStorm.Particle;

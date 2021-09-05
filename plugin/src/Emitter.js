/**
* @author       Richard Davey <rich@photonstorm.com>
* @author       Pete Baron <pete@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* An instance of a Particle Storm Emitter.
* 
* This class is responsible for updating and managing all active particles created by this emitter.
*
* Add it to your game via the plugin:
*
* `this.manager = this.game.plugins.add(Phaser.ParticleStorm);`
* `this.emitter = this.manager.createEmitter();`
*
* You can have multiple emitters running, each controlling their own set of particles.
*
* Emitters are not display objects and you cannot add it to the display list or position it.
* The renderer created by this emitter is the entity that lives on the display list.
*
* @class Phaser.ParticleStorm.Emitter
* @constructor
* @param {Phaser.ParticleStorm} parent - The ParticleStorm Plugin.
* @param {Phaser.ParticleStorm.SPRITE|Phaser.ParticleStorm.PIXEL|Phaser.ParticleStorm.RENDERTEXTURE|Phaser.ParticleStorm.SPRITE_BATCH} [renderType=Phaser.ParticleStorm.SPRITE] - The Particle Renderer type constant.
* @param {Phaser.Point} [force] - Amount of force to be applied to all particles every update.
* @param {Phaser.Point} [scrollSpeed] - All particles can be scrolled. This offsets their positions by the amount in this Point each update.
*     This is different to force which is applied as a velocity on the particle, where-as scrollSpeed directly adjusts their final position.
*/
Phaser.ParticleStorm.Emitter = function (parent, renderType, force, scrollSpeed) {

    /**
    * @property {Phaser.Game} game - A reference to the Phaser Game instance.
    */
    this.game = parent.game;

    /**
    * @property {Phaser.ParticleStorm} parent - The Particle Storm plugin.
    */
    this.parent = parent;

    /**
    * The Particle Renderer this emitter is using.
    * @property {Phaser.ParticleStorm.Renderer.Base} renderer
    * @default
    */
    this.renderer = null;

    /**
    * The type of renderer this emitter is using.
    * @property {string} renderType
    */
    this.renderType = null;

    /**
    * A set of useful common static functions.
    * @property {Phaser.ParticleStorm.Graph} graph
    */
    this.graph = Phaser.ParticleStorm.Graph;

    /**
    * The enabled state of this emitter. If set to `false` it won't emit any new particles or update
    * alive particles. You can toggle this directly or via Emitter.paused.
    * @property {boolean} enabled
    */
    this.enabled = false;

    /**
    * Is this emitter updated automatically by the Particle Storm plugin, or should it be 
    * updated manually via the game code?
    * 
    * If `false` (the default) the plugin will update this emitter automatically for you.
    * If `true` then you need to call the `update` method directly from your game code.
    * 
    * @property {boolean} manualUpdate
    * @default
    */
    this.manualUpdate = false;

    /**
    * The scrolling speed of the particles in pixels per frame.
    * The amount specified in this Point object is added to the particles position each frame 
    * after their internal velocities and calculations have taken place.
    *
    * @property {Phaser.Point} scrollSpeed
    */
    this.scrollSpeed = new Phaser.Point();

    /**
    * Amount of force to be applied to all particles every update.
    * This is in addition to any particle velocities or forces defined in the particle data.
    * This object can be manipulated in real-time to provide for effects such as varying wind 
    * or gravity.
    * 
    * @property {Phaser.Point} force
    */
    this.force = new Phaser.Point();

    /**
    * This signal is dispatched each time a particle is emitted by this emitter.
    *
    * By default this signal is set to `null`. This is because it can generate
    * extremely high numbers of callbacks in busy particle systems. To enable it
    * add: `emitter.onEmit = new Phaser.Signal()` to your code.
    * 
    * It is sent two parameters: a reference to this emitter and a reference to the 
    * particle that was emitted.
    *
    * This signal is dispatched BEFORE the first time the particle is rendered, so
    * you can adjust positions, colors, textures and other properties the callback.
    * 
    * @property {Phaser.Signal} onEmit
    * @default
    */
    this.onEmit = null;

    /**
    * This signal is dispatched each time a particle enters a 'complete' state.
    * A particle can only do this if it has a fixed lifespan (i.e. a lifespan value
    * greater than 0) and has its `keepAlive` property set to `true`. This enables
    * you to emit particles with timespan based events that when they complete are
    * not immediately killed ready for re-use, but instead enter an 'idle' completed 
    * state.
    *
    * By default this signal is set to `null`. This is because it can generate
    * extremely high numbers of callbacks in busy particle systems. To enable it
    * add: `emitter.onComplete = new Phaser.Signal()` to your code.
    * 
    * It is sent two parameters: a reference to this emitter and a reference to the 
    * particle that was killed.
    * 
    * @property {Phaser.Signal} onComplete
    * @default
    */
    this.onComplete = null;

    /**
    * This signal is dispatched each time a particle is killed.
    *
    * By default this signal is set to `null`. This is because it can generate
    * extremely high numbers of callbacks in busy particle systems. To enable it
    * add: `emitter.onKill = new Phaser.Signal()` to your code.
    * 
    * It is sent two parameters: a reference to this emitter and a reference to the 
    * particle that was killed.
    * 
    * @property {Phaser.Signal} onKill
    * @default
    */
    this.onKill = null;

    /**
    * The class type of the Particle that is emitted.
    * 
    * You can change this to your own custom object, as long as it extends ParticleStorm.Particle.
    * 
    * If you change it in an emitter that has already emitted some particles then you will create
    * a mixed data-type emitter. You are recommended to clear this emitter first before changing
    * the particleClass.
    * 
    * @property {object} particleClass
    * @default Phaser.ParticleStorm.Particle
    */
    this.particleClass = Phaser.ParticleStorm.Particle;

    /**
    * The Timer used by this emitter for repeated and looped emissions.
    * 
    * @property {Phaser.Timer} timer
    */
    this.timer = this.game.time.create(false);

    /**
    * The Phaser.TimerEvent object that was created by the last call to emit that had a repeat value set.
    * If you set-up multiple repeated emits then this property will be overwritten each time, so it's up
    * to you to store your own reference locally before creating another repeated emitter.
    * 
    * @property {Phaser.TimerEvent} timerEvent
    * @default
    */
    this.timerEvent = null;

    /**
    * Contains all active particles being managed by this emitter.
    * When a particle is killed it is moved to the `pool` array.
    * 
    * @property {array} list
    * @protected
    */
    this.list = [];

    /**
    * A pool of particle objects waiting to be used. When a particle is activated it moves from the
    * pool to the `list` array. It moves back to the pool when killed.
    * 
    * @property {array} pool
    * @protected
    */
    this.pool = [];

    /**
    * Contains references to all particles that were emitted in the last call to Emitter.emit.
    * The contents of this array are reset every single time `Emitter.emit` is called, so if
    * you need to retain references to the particles that were just emitted you should make
    * a shallow copy of this array in your own game code.
    * 
    * @property {array} batch
    * @protected
    */
    this.batch = [];

    /**
    * An array containing all active GravityWells belonging to this emitter.
    * 
    * @property {array} wells
    * @protected
    */
    this.wells = [];

    /**
    * Internal Point object used by the emit methods.
    * @property {Phaser.Point} _rnd
    * @private
    */
    this._rnd = new Phaser.Point();

    /**
    * Internal Point object used by the emit methods for particle spacing.
    * @property {Phaser.Point} _step
    * @private
    */
    this._step = new Phaser.Point();

    /**
    * Internal counter for the number of parent particles emitted this batch.
    * @property {integer} _pCount
    * @private
    */
    this._pCount = 0;

    /**
    * Internal var holding the delay properties for this batch.
    * @property {object} _delay
    * @private
    */
    this._delay = { enabled: false, start: 0, inc: 0, visible: false };

    this.init(renderType, force, scrollSpeed);

};

Phaser.ParticleStorm.Emitter.prototype = {

    /**
    * Establishes the renderer and clears the particle list and pool ready for use.
    *
    * This is called automatically by the Phaser PluginManager.
    *
    * @method Phaser.ParticleStorm.Emitter#init
    * @protected
    * @param {Phaser.ParticleStorm.SPRITE|Phaser.ParticleStorm.PIXEL|Phaser.ParticleStorm.RENDERTEXTURE|Phaser.ParticleStorm.SPRITE_BATCH} [renderType=Phaser.ParticleStorm.SPRITE] - The Particle Renderer type constant.
    * @param {Phaser.Point} [force] - Amount of force to be applied to all particles every update.
    * @param {Phaser.Point} [scrollSpeed] - All particles can be scrolled. This offsets their positions by the amount in this Point each update.
    *     This is different to force which is applied as a velocity on the particle, where-as scrollSpeed directly adjusts their final position.
    */
    init: function (renderType, force, scrollSpeed) {

        if (renderType === undefined) { renderType = Phaser.ParticleStorm.SPRITE; }

        var w = this.game.width;
        var h = this.game.height;

        switch (renderType)
        {
            case Phaser.ParticleStorm.SPRITE:
                this.renderer = new Phaser.ParticleStorm.Renderer.Sprite(this);
                break;

            case Phaser.ParticleStorm.PIXEL:
                this.renderer = new Phaser.ParticleStorm.Renderer.Pixel(this, w, h);
                break;

            case Phaser.ParticleStorm.RENDERTEXTURE:
                this.renderer = new Phaser.ParticleStorm.Renderer.RenderTexture(this, w, h);
                break;

            case Phaser.ParticleStorm.SPRITE_BATCH:
                this.renderer = new Phaser.ParticleStorm.Renderer.SpriteBatch(this);
                break;

            case Phaser.ParticleStorm.BITMAP_DATA:
                this.renderer = new Phaser.ParticleStorm.Renderer.BitmapData(this, w, h);
                break;

            default:
                console.warn("ParticleManager.init - Invalid renderType given");
                return false;
        }
        
        this.renderType = renderType;

        if (force)
        {
            this.force.set(force.x, force.y);
        }

        if (scrollSpeed)
        {
            this.scrollSpeed.set(scrollSpeed.x, scrollSpeed.y);
        }

        this.list = [];
        this.pool = [];
        this.wells = [];

        this.enabled = true;

    },

    /**
    * Adds the Particle Renderer to the game world.
    *
    * You can optionally specify a Phaser.Group for the renderer to be added to.
    * If not provided it will be added to the World group.
    *
    * @method Phaser.ParticleStorm.Emitter#addToWorld
    * @param {Phaser.Group} [group] - The group to add the renderer to. If not specified it will be added to the World.
    * @return {Phaser.Image|Phaser.Sprite|Phaser.Group} The display object that contains the particle renderer.
    */
    addToWorld: function (group) {

        if (group === undefined) { group = this.game.world; }

        return this.renderer.addToWorld(group);

    },

    /**
    * Adds a Gravity Well to this Particle Manager. A Gravity Well creates a force on the 
    * particles to draw them towards a single point.The force applied is inversely proportional 
    * to the square of the distance from the particle to the point, in accordance with Newton's
    * law of gravity.
    * 
    * A Gravity Well only effects particles owned by the emitter that created it.
    *
    * Gravity Wells don't have any display properties, i.e. they are not Sprites.
    * 
    * @method Phaser.ParticleStorm.Emitter#createGravityWell
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
    * @return {Phaser.ParticleStorm.GravityWell} The GravityWell object.
    */
    createGravityWell: function (x, y, power, epsilon, gravity) {

        var well = new Phaser.ParticleStorm.GravityWell(this, x, y, power, epsilon, gravity);

        this.wells.push(well);

        return well;

    },

    /**
    * Seeds this emitter with `qty` number of Particle objects, and places them in the pool ready for use.
    * This allows you to pre-seed the pool and avoid object creation in hot parts of your game code.
    *
    * @method Phaser.ParticleStorm.Emitter#seed
    * @param {integer} qty - The amount of Particle objects to create in the pool.
    * @return {Phaser.ParticleStorm.Emitter} This Emitter.
    */
    seed: function (qty) {

        for (var i = 0; i < qty; i++)
        {
            var particle = new Phaser.ParticleStorm.Particle(this);

            this.pool.push(particle);
        }

        return this;

    },

    /**
    * Tells the Emitter to emit one or more particles, with a delay before it starts.
    *
    * The key refers to the ParticleData already set-up within Particle Storm via `ParticleStorm.addDdata`.
    * 
    * You must have added or created the data referenced by key before you can call `emit`.
    *
    * The `config` argument is an object that contains additional emission settings.
    *
    * @method Phaser.ParticleStorm.Emitter#emitDelayed
    * @param {number} delay - The delay (in ms) before this emit will be run. It's added to an internal timed queue.
    * @param {string} key - The key of the data that the particle will use to obtain its emission values from.
    * @param {number|array} [x=0] - The x location of the particle. Either a discrete value or an array consisting of 2 elements, the min and max, it will pick a point at random between them.
    * @param {number|array} [y=0] - The y location of the particle. Either a discrete value or an array consisting of 2 elements, the min and max, it will pick a point at random between them.
    * @param {object} [config] - An emitter configuration object. See `Emitter.emit` for the full object property docs.
    * @return {Phaser.TimerEvent} The TimerEvent object created for this delayed emit.
    */
    emitDelayed: function (delay, key, x, y, config) {

        if (!this.enabled || !this.parent.dataList[key] || delay <= 0)
        {
            return null;
        }

        this.timerEvent = this.timer.add(delay, this.emit, this, key, x, y, config);

        this.timer.start();

        return this.timerEvent;

    },

    /**
    * Tells the Emitter to emit one or more particles.
    *
    * The key refers to the ParticleData already set-up within Particle Storm via `ParticleStorm.addDdata`.
    * 
    * You must have added or created the data referenced by key before you can call `emit`.
    *
    * The `config` argument is an object that contains additional emission settings.
    *
    * @method Phaser.ParticleStorm.Emitter#emit
    * @param {string} key - The key of the data that the particle will use to obtain its emission values from.
    * @param {number|array} [x=0] - The x location of the particle. Either a discrete value or an array consisting of 2 elements, the min and max, it will pick a point at random between them.
    * @param {number|array} [y=0] - The y location of the particle. Either a discrete value or an array consisting of 2 elements, the min and max, it will pick a point at random between them.
    * @param {object} [config] - An emitter configuration object.
    * @param {number} [config.total] - The number of particles to emit (-1 means 'all' when the zone distribution is 'full')
    * @param {number} [config.repeat] - How many times this emit should repeat. A value of -1 means 'forever'.
    * @param {number} [config.frequency] - If `repeat` is -1 or > 0 this controls the ms that will elapse between each repeat.
    * @param {number} [config.xStep=0] - The amount of horizontal spacing in pixels to add between each particle emitted in this call. This is in addition to the `x` argument.
    * @param {number} [config.yStep=0] - The amount of vertical spacing in pixels to add between each particle emitted in this call. This is in addition to the `y` argument.
    * @param {number|object} [config.delay] - If a number it sets the delay of the first particle to `delay` ms. This is in addition to any delay set in the particle data.
    * @param {number} [config.delay.start=0] - A starting delay value in ms before any particle in this emit call is activated.
    * @param {number} [config.delay.step=0] - If this emit call will emit multiple particles the step controls how many ms to add between each ones delay.
    * @param {boolean} [config.delay.visible=false] - Should particles render and be visible, even when delayed?
    * @param {Phaser.ParticleStorm.Zones.Base} [config.zone] - The zone to emit the particles from.
    * @param {number} [config.percent] - If a spline based zone this value tells the emitter how far along the spline to emit the particles from. Between 0 and 100.
    * @param {boolean} [config.random] - If a zone is set this will emit the particles from random locations within the zone.
    * @param {boolean} [config.full] - If a zone is set this will emit the particles from all locations in the zone (only applies to specific types of zone like Images)
    * @param {boolean} [config.setAlpha] - If the zone supports it will the particle alpha be set?
    * @param {boolean} [config.setColor] - If the zone supports it will the particle color be set?
    * @param {integer} [config.step] - Controls the iteration through the pixel data. Only for 'full' zone emissions.
    * @param {integer|array} [config.spacing] - The pixel spacing between each emitted particle.
    * @param {object} [config.radiate] - Emits the particle in a radial arc.
    * @param {number} [config.radiate.velocity] - The speed to emit the particle when radiating.
    * @param {number} [config.radiate.from] - The starting angle to radiate from.
    * @param {number} [config.radiate.to] - The angle to radiate to.
    * @param {object} [config.radiateFrom] - Emits the particle radiating away from a given point.
    * @param {number} [config.radiateFrom.x] - The x coordinate of the point to radiate away from.
    * @param {number} [config.radiateFrom.y] - The y coordinate of the point to radiate away from.
    * @param {number} [config.radiateFrom.velocity] - The speed to emit the particle when radiating.
    * @return {Phaser.ParticleStorm.Particle|array} The particle or an array of particles that were emitted, 
    *     or null if no particle could be created.
    */
    emit: function (key, x, y, config) {

        if (!this.enabled || !this.parent.dataList[key])
        {
            return null;
        }

        this.batch = [];

        this._pCount = 0;

        this._step.x = 0;
        this._step.y = 0;

        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }

        //  ------------------------------------------------
        //  Fast-exit: No config object
        //  ------------------------------------------------

        if (!config)
        {
            return this.emitParticle(key, x, y, null);
        }

        //  ------------------------------------------------
        //  The number of particles to emit
        //  ------------------------------------------------

        var total = (config.hasOwnProperty('total')) ? config.total : 1;

        //  ------------------------------------------------
        //  Batch position spacing
        //  ------------------------------------------------

        if (config.xStep > 0)
        {
            this._step.x = config.xStep;
        }
        else
        {
            this._step.x = 0;
        }

        if (config.yStep > 0)
        {
            this._step.y = config.yStep;
        }
        else
        {
            this._step.y = 0;
        }

        //  ------------------------------------------------
        //  The particle delays per emit
        //  ------------------------------------------------

        this._delay.enabled = false;

        if (config.delay)
        {
            this._delay.enabled = true;

            if (typeof config.delay === 'number')
            {
                this._delay.start = config.delay;
                this._delay.step = 0;
                this._delay.visible = false;
            }
            else
            {
                this._delay.start = (config.delay.start) ? config.delay.start : 0;
                this._delay.step = (config.delay.step) ? config.delay.step : 0;
                this._delay.visible = (config.delay.visible) ? true : false;
            }
        }

        //  ------------------------------------------------
        //  Zone
        //  ------------------------------------------------
        if (config.zone)
        {
            if ((config.random === undefined && config.full === undefined && config.percent === undefined) || config.random)
            {
                //  Neither 'random' or 'full' are set, so we default to 'random'
                config.zone.emit(this, key, x, y, total, config.setAlpha, config.setColor);
            }
            else if (config.percent === undefined && (config.full !== undefined || !config.random))
            {
                //  'full' is set, or 'random' is specifically set to false
                config.zone.emitFull(this, key, x, y, config.step, config.spacing, config.setAlpha, config.setColor);
            }
            else if (config.percent !== undefined)
            {
                //  'percent' is set for a Spline zone
                var pnt = 0;

                if (typeof config.percent === 'number')
                {
                    pnt = config.percent;
                }
                else
                {
                    //  min/max?
                    if (config.percent.hasOwnProperty('min'))
                    {
                        pnt = this.game.rnd.between(config.percent.min, config.percent.max);
                    }
                    else if (config.percent.callback)
                    {
                        pnt = config.percent.callback.call(config.percent.context, this);
                    }
                }
                
                config.zone.emitPercent(this, key, x, y, total, pnt);
            }
        }
        else
        {
            //  ------------------------------------------------
            //  No zone
            //  ------------------------------------------------
            for (var i = 0; i < total; i++)
            {
                this.emitParticle(key, x, y, null);
            }
        }

        if (config.radiate)
        {
            //  ------------------------------------------------
            //  Radiate
            //  ------------------------------------------------
            for (var c = 0; c < this.batch.length; c++)
            {
                this.batch[c].radiate(config.radiate.velocity, config.radiate.from, config.radiate.to);
            }
        }
        else if (config.radiateFrom)
        {
            //  ------------------------------------------------
            //  RadiateFrom
            //  ------------------------------------------------
            for (var c = 0; c < this.batch.length; c++)
            {
                this.batch[c].radiateFrom(config.radiateFrom.x, config.radiateFrom.y, config.radiateFrom.velocity);
            }
        }

        //  ------------------------------------------------
        //  Repeat
        //  ------------------------------------------------
        var repeat = (config.hasOwnProperty('repeat')) ? config.repeat : 0;

        if (repeat !== 0)
        {
            var frequency = (config.hasOwnProperty('frequency')) ? config.frequency : 250;

            //  Or the repeats will stack-up
            delete config.repeat;

            if (repeat === -1)
            {
                this.timerEvent = this.timer.loop(frequency, this.emit, this, key, x, y, config);
            }
            else if (repeat > 0)
            {
                this.timerEvent = this.timer.repeat(frequency, repeat, this.emit, this, key, x, y, config);
            }

            this.timer.start();
        }

        //  Reset the pCounter
        this._pCount = 0;

        return this.batch;

    },

    /**
    * Tells the Emitter to emit one single particle.
    *
    * **This method shouldn't usually be called directly. See `Emitter.emit`.**
    *
    * The key refers to the ParticleData already set-up within Particle Storm via `ParticleStorm.addDdata`.
    * 
    * You must have added or created the data referenced by key before you can call `emit`.
    *
    * @method Phaser.ParticleStorm.Emitter#emitParticle
    * @param {string} key - The key of the data that the particle will use to obtain its emission values from.
    * @param {number|array} [x=0] - The x location of the particle. Either a discrete value or an array consisting of 2 elements, the min and max, it will pick a point at random between them.
    * @param {number|array} [y=0] - The y location of the particle. Either a discrete value or an array consisting of 2 elements, the min and max, it will pick a point at random between them.
    * @param {Phaser.ParticleStorm.Particle} [parent=null] - The parent of this particle, if any.
    * @return {Phaser.ParticleStorm.Particle} The particle that was emitted.
    */
    emitParticle: function (key, x, y, parent) {

        var particle = this.pool.pop();

        if (!particle)
        {
            particle = new this.particleClass(this);
        }

        particle.parent = parent;

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

        //  ------------------------------------------------
        //  If the coordinates are sequential based on previous particle
        //  ------------------------------------------------

        x += (this._step.x * this._pCount);
        y += (this._step.y * this._pCount);

        particle.reset(this.renderer, x, y, this.parent.dataList[key]);

        if (particle.alive)
        {
            //  Apply delay (in addition to any set in the particle data)

            if (!parent && this._delay.enabled)
            {
                particle.delay += this._delay.start + (this._pCount * this._delay.step);
                particle.delayVisible = this._delay.visible;
            }

            this.list.push(particle);

            this.batch.push(particle);

            if (!parent)
            {
                this._pCount++;
            }
        }
        else
        {
            particle.kill();

            if (this.onKill)
            {
                this.onKill.dispatch(this, particle);
            }

            this.pool.push(particle);
        }

        return particle;

    },

    /**
    * Update all particles in this emitter.
    *
    * This method is called by the Particle Storm plugin automatically unless
    * `manualUpdate` has been set to `true`.
    *
    * @method Phaser.ParticleStorm.Emitter#update
    * @return {number} The number of active particles in this manager.
    */
    update: function () {

        var elapsed = this.game.time.elapsed;

        this.renderer.preUpdate();

        //  Update all the particles and destroy those that request it
        for (var i = this.list.length - 1; i >= 0; i--)
        {
            var p = this.list[i];

            if (!p.ignoreScrollSpeed)
            {
                p.transform.x += this.scrollSpeed.x;
                p.transform.y += this.scrollSpeed.y;
            }

            for (var w = 0; w < this.wells.length; w++)
            {
                if (this.wells[w].active)
                {
                    this.wells[w].step(p);
                }
            }

            if (!p.step(elapsed, this.force))
            {
                p.kill();
                this.pool.push(p);
                this.list.splice(i, 1);
            }
        }

        this.renderer.postUpdate();

        return this.list.length;

    },

    /**
    * This is an internal method that takes a emission data object, time value and
    * life percentage and calculates the new number of child particles that should be emitted.
    *
    * @method Phaser.ParticleStorm.Emitter#updateFrequency
    * @protected
    * @param {object} emit - The emission data object describing what and when to emit.
    * @param {number} elapsedTime - How long has it been since the last time this was updated (in milliseconds)
    * @param {number} lastPercent - The lifePercent last time this was updated.
    * @param {number} lifePercent - How far through its life is this particle (from 0 to 1)
    * @return {number} The number of children for this particle to emit.
    */
    updateFrequency: function (emit, elapsedTime, lastPercent, lifePercent) {

        //  If the emit frequency is specified as a list of time intervals
        //  and number of children then ...
        if (emit.at)
        {
            //  Total is the number to be created for all time intervals 
            //  between lastPercent and lifePercent
            var total = 0;

            for (var i = 0; i < emit.at.length; i++)
            {
                var o = emit.at[i];

                //  Inclusive at the low end for time == 0 only, always inclusive at the high end
                if ((o.time > lastPercent || (o.time === 0 && lastPercent === 0)) && o.time <= lifePercent)
                {
                    //  If emit.at.value is between 0 and 1 then it expresses a 
                    //  percentage random chance to create a child at this time
                    if (o.value > 0 && o.value < 1.0)
                    {
                        if (Math.random() < o.value)
                        {
                            total += 1;
                        }
                    }
                    else
                    {
                        //  All other values are taken literally
                        total += o.value;
                    }
                }
            }

            return total;
        }

        //  Alternatively, we have a fixed emission frequency or a control graph
        return this.graph.getParamArea(emit, lastPercent, lifePercent) * elapsedTime;

    },

    /**
    * Call a function on each _alive_ particle in this emitter.
    *
    * Additional arguments for the callback can be specified after the context parameter.
    * For example:
    *
    * `Emitter.forEach(headTowards, this, 100, 500)`
    *
    * .. would invoke the `headTowards` function with the arguments `(particle, 100, 500)`.
    *
    * @method Phaser.ParticleStorm.Emitter#forEach
    * @param {function} callback - The function that will be called for each alive particle. The particle will be passed as the first argument.
    * @param {object} callbackContext - The context in which the function should be called (usually 'this').
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback function, after the particle.
    */
    forEach: function (callback, callbackContext) {

        if (arguments.length <= 2)
        {
            for (var i = 0; i < this.list.length; i++)
            {
                callback.call(callbackContext, this.list[i]);
            }
        }
        else
        {
            var args = [null];

            for (var i = 2; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }

            for (var i = 0; i < this.list.length; i++)
            {
                args[0] = this.list[i];
                callback.apply(callbackContext, args);
            }
        }

    },

    /**
    * Call a function on each _alive_ particle that was emitted in the last call.
    * When you call `emit` the particles that are emitted are temporarily added to the
    * Emitter.batch array. This method allows you to call a function on all particles
    * within that array.
    *
    * Additional arguments for the callback can be specified after the context parameter.
    * For example:
    *
    * `Emitter.forEach(headTowards, this, 100, 500)`
    *
    * .. would invoke the `headTowards` function with the arguments `(particle, 100, 500)`.
    *
    * @method Phaser.ParticleStorm.Emitter#forEachNew
    * @param {function} callback - The function that will be called for each alive particle. The particle will be passed as the first argument.
    * @param {object} callbackContext - The context in which the function should be called (usually 'this').
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback function, after the particle.
    */
    forEachNew: function (callback, callbackContext) {

        if (this.batch.length === 0)
        {
            return;
        }

        if (arguments.length <= 2)
        {
            for (var i = 0; i < this.batch.length; i++)
            {
                callback.call(callbackContext, this.batch[i]);
            }
        }
        else
        {
            var args = [null];

            for (var i = 2; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }

            for (var i = 0; i < this.batch.length; i++)
            {
                args[0] = this.batch[i];
                callback.apply(callbackContext, args);
            }
        }

    },

    /**
    * Gets a Particle from this emitter based on the given index.
    *
    * Only 'live' particles are checked.
    *
    * @method Phaser.ParticleStorm.Emitter#getParticle
    * @param {integer} [index=0] - The index of the particle to get.
    * @return {Phaser.ParticleStorm.Particle} The particle that was emitted.
    */
    getParticle: function (index) {

        if (index === undefined) { index = 0; }

        if (this.list[index])
        {
            return this.list[index];
        }
        else
        {
            return null;
        }

    },

    /**
    * Renders a Debug panel for this Emitter using the Phaser.Debug class.
    *
    * It displays the force, scroll speed and numbers of alive and dead particles.
    *
    * The size of the rendered debug panel is 360x70.
    * 
    * You should **never** use this in a production game, as it costs CPU/GPU time to display it.
    *
    * @method Phaser.ParticleStorm.Emitter#debug
    * @param {number} [x=0] - The x coordinate to render the Debug panel at.
    * @param {number} [y=0] - The y coordinate to render the Debug panel at.
    */
    debug: function (x, y) {

        var d = this.game.debug;

        if (d)
        {
            d.start(x + 4, y + 16, 'rgb(255, 255, 255)', 132);

            d.context.fillStyle = 'rgba(0, 74, 128, 0.5)';
            d.context.fillRect(x, y, 360, 70);

            var fx = this.force.x + '';
            var fy = this.force.y + '';

            d.line('Force:', fx.substr(0, 8), fy.substr(0, 8));
            d.line('Scroll Speed:', this.scrollSpeed.x, this.scrollSpeed.y);
            d.line('Alive:', 'Dead:', 'Total:');
            d.line(this.alive, this.dead, this.total);

            d.stop();
        }

    },

    /**
    * Destroys this emitter.
    * 
    * Calls `clear` on the renderer and kills all particles in its lists.
    *
    * @method Phaser.ParticleStorm.Emitter#destroy
    */
    destroy: function () {

        if (this.renderer.clear)
        {
            this.renderer.clear();
        }

        this.renderer.destroy();
        this.renderer = null;

        for (var i = this.list.length - 1; i >= 0; i--)
        {
            this.list[i].kill();
            this.list.splice(i, 1);
        }

        this.list = [];
        this.pool = [];
        this.batch = [];
        this.wells = [];

    }

};

/**
* The paused state of the Emitter.
*
* If paused is set to `true` then no calls to `emit` or `update` will be processed.
*
* Set to `false` to resume updating of the particles.
* 
* @name Phaser.ParticleStorm.Emitter#paused
* @property {boolean} paused
*/
Object.defineProperty(Phaser.ParticleStorm.Emitter.prototype, "paused", {

    get: function () {

        return !this.enabled;

    },

    set: function (value) {

        this.enabled = !value;

    }

});

/**
* The total number of particles being managed by this emitter, including both
* alive and dead particles.
* 
* @name Phaser.ParticleStorm.Emitter#total
* @property {integer} total
* @readOnly
*/
Object.defineProperty(Phaser.ParticleStorm.Emitter.prototype, "total", {

    get: function () {

        return this.alive + this.dead;

    }

});

/**
* The total number of active (alive) particles being managed by this emitter.
* 
* @name Phaser.ParticleStorm.Emitter#alive
* @property {integer} alive
* @readOnly
*/
Object.defineProperty(Phaser.ParticleStorm.Emitter.prototype, "alive", {

    get: function () {

        return this.list.length;

    }

});

/**
* The total number of dead particles in the pool, ready to be re-used by this emitter.
* 
* @name Phaser.ParticleStorm.Emitter#dead
* @property {integer} dead
* @readOnly
*/
Object.defineProperty(Phaser.ParticleStorm.Emitter.prototype, "dead", {

    get: function () {

        return this.pool.length;

    }

});

Phaser.ParticleStorm.Emitter.prototype.constructor = Phaser.ParticleStorm.Emitter;

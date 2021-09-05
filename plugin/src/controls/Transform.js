/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* The Transform control belongs to a single particle and controls all aspects of its transformation.
* It allows you to control the position, scale, rotation, velocity and other properties.
*
* @class Phaser.ParticleStorm.Controls.Transform
* @constructor
* @param {Phaser.ParticleStorm.Particle} particle - The particle this control belongs to.
*/
Phaser.ParticleStorm.Controls.Transform = function (particle) {

    /**
    * The particle this control belongs to.
    * @property {Phaser.ParticleStorm.Particle} particle
    */
    this.particle = particle;

    /**
    * A reference to the Phaser.Time class.
    * @property {Phaser.Time} time
    */
    this.time = particle.emitter.game.time;

    /**
    * @property {Phaser.ParticleStorm.Graph} graph - A set of useful common static functions.
    */
    this.graph = Phaser.ParticleStorm.Graph;

    /**
    * The horizontal position of this particle.
    * @property {number} x
    */
    this.x = 0;

    /**
    * The vertical position of this particle.
    * @property {number} y
    */
    this.y = 0;

    /**
    * The velocity control object. Contains x, y and facing properties.
    * They inherits all properties of the Phaser.ParticleStorm.BASE object.
    * @property {object} velocity
    */
    this.velocity = { x: null, y: null, facing: null };

    /**
    * The acceleration control object. Contains x, y and facing properties.
    * They inherits all properties of the Phaser.ParticleStorm.BASE object.
    * @property {object} acceleration
    */
    this.acceleration = { x: null, y: null, facing: null };

    /**
    * The scale control object. Contains x and y and properties.
    * They inherits all properties of the Phaser.ParticleStorm.BASE_1 object.
    * @property {object} scale
    */
    this.scale = { x: null, y: null };

    /**
    * The rotation control object.
    * This inherits all properties of the Phaser.ParticleStorm.BASE object.
    * @property {object} rotation
    */
    this.rotation = {};

    /**
    * The anchor of the particle. By default particles all have anchors set to
    * 0.5 (i.e. their center) to assist with rotation.
    * @property {Phaser.Point} anchor
    */
    this.anchor = new Phaser.Point();

};

Phaser.ParticleStorm.Controls.Transform.prototype = {

    /**
    * Resets this control and all properties of it. This is called automatically
    * when its parent particle is spawned.
    *
    * @method Phaser.ParticleStorm.Controls.Transform#reset
    */
    reset: function () {

        this.velocity.x = Object.create(Phaser.ParticleStorm.BASE);
        this.velocity.y = Object.create(Phaser.ParticleStorm.BASE);
        this.velocity.facing = Object.create(Phaser.ParticleStorm.BASE_NULL);

        this.acceleration.x = Object.create(Phaser.ParticleStorm.BASE);
        this.acceleration.y = Object.create(Phaser.ParticleStorm.BASE);
        this.acceleration.facing = Object.create(Phaser.ParticleStorm.BASE_NULL);

        this.scale.x = Object.create(Phaser.ParticleStorm.BASE_1);
        this.scale.y = Object.create(Phaser.ParticleStorm.BASE_1);

        this.rotation = Object.create(Phaser.ParticleStorm.BASE);

        this.anchor.set(0.5);

    },

    /**
    * Takes a particle data object and populates all aspects of this control
    * that it applies to.
    *
    * @method Phaser.ParticleStorm.Controls.Transform#init
    * @param {number} x - The horizontal position of the particle.
    * @param {number} y - The vertical position of the particle.
    * @param {object} data - The particle data.
    */
    init: function (x, y, data) {

        this.x = x;
        this.y = y;

        //  ------------------------------------------------
        //  Anchor
        //  ------------------------------------------------

        if (data.hasOwnProperty('anchor'))
        {
            this.anchor.set(data.anchor);
        }
        else
        {
            if (data.hasOwnProperty('anchorX'))
            {
                this.anchor.x = data.anchorX;
            }

            if (data.hasOwnProperty('anchorY'))
            {
                this.anchor.y = data.anchorY;
            }
        }

        //  ------------------------------------------------
        //  Velocity
        //  ------------------------------------------------

        //  Use 'velocity' instead or in addition to 'vx' and 'vy' when those two are interlinked
        //  (eg. when creating a radial vector from the creation point)

        if (data.hasOwnProperty('velocity'))
        {
            if (this.graph.isNumeric(data.velocity))
            {
                //  velocity: 2
                this.velocity.x.value = data.velocity;
                this.velocity.y.value = data.velocity;
            }
            else if (data.velocity.hasOwnProperty('min'))
            {
                //  velocity: { min: -2, max: 2 }
                this.velocity.x.value = this.graph.getMinMax(data.velocity);
                this.velocity.y.value = this.velocity.x.value;
            }
            else if (data.velocity.radial)
            {
                //  radial velocity
                var v = this.graph.getMinMaxInitial(data.velocity);

                var arcs = data.velocity.radial.arcStart;
                var arce = data.velocity.radial.arcEnd;

                if (arcs !== undefined && arce !== undefined)
                {
                    //  Radiate within an arc
                    var angle = (Math.random() * (arce - arcs) + arcs) * Math.PI / 180.0;
                    var dx = Math.sin(angle);
                    var dy = -Math.cos(angle);
                    this.velocity.x.value = dx * v;
                    this.velocity.y.value = dy * v;
                }
            }
            else
            {
                //  velocity: { initial: 2, value: 3, delta: 0.1, control: {} }
                this.velocity.x.initial = this.graph.getMinMaxInitial(data.velocity);
                this.velocity.y.initial = this.velocity.x.initial;

                this.velocity.x.value = this.graph.getMinMax(data.velocity.value);
                this.velocity.y.value = this.velocity.x.value;
            }

            if (data.velocity.hasOwnProperty('delta'))
            {
                this.velocity.x.delta = this.graph.getMinMax(data.velocity.delta);
                this.velocity.y.delta = this.velocity.x.delta;
            }

            if (data.velocity.hasOwnProperty('control'))
            {
                this.velocity.x.control = data.velocity.control;
                this.velocity.y.control = data.velocity.control;
            }

            //  If they defined vx/vy AND velocity then the vx/vy settings over-ride velocity
            if (data.hasOwnProperty('vx'))
            {
                this.graph.fromData(data.vx, this.velocity.x);
            }

            if (data.hasOwnProperty('vy'))
            {
                this.graph.fromData(data.vy, this.velocity.y);
            }
        }
        else if (data.hasOwnProperty('target'))
        {
            //  ------------------------------------------------
            //  Target
            //  ------------------------------------------------

            this.particle.target(data.target);
        }
        else
        {
            //  ------------------------------------------------
            //  vx / vy
            //  ------------------------------------------------

            //  Avoids calling fromData if we know we're just dealing with a number
            if (typeof data.vx === 'number')
            {
                this.velocity.x.value = data.vx;
            }
            else
            {
                this.graph.fromData(data.vx, this.velocity.x);
            }

            if (typeof data.vy === 'number')
            {
                this.velocity.y.value = data.vy;
            }
            else
            {
                this.graph.fromData(data.vy, this.velocity.y);
            }
        }

        //  ------------------------------------------------
        //  Facing Acceleration / Velocity
        //  ------------------------------------------------

        //  Avoids calling fromData if we know we're just dealing with a number
        if (typeof data.facingVelocity === 'number')
        {
            this.velocity.facing.value = data.facingVelocity;
        }
        else
        {
            this.graph.fromData(data.facingVelocity, this.velocity.facing);
        }

        if (typeof data.facingAcceleration === 'number')
        {
            this.acceleration.facing.value = data.facingAcceleration;
        }
        else
        {
            this.graph.fromData(data.facingAcceleration, this.acceleration.facing);
        }

        //  ------------------------------------------------
        //  Acceleration
        //  ------------------------------------------------

        if (data.hasOwnProperty('acceleration'))
        {
            //  Use 'acceleration' when the ax and ay are interlinked
            this.graph.fromData(data.acceleration, this.acceleration.x);
            this.graph.fromData(data.acceleration, this.acceleration.y);
        }
        else
        {
            //  Avoids calling fromData if we know we're just dealing with a number
            if (typeof data.ax === 'number')
            {
                this.acceleration.x.value = data.ax;
            }
            else
            {
                this.graph.fromData(data.ax, this.acceleration.x);
            }

            if (typeof data.ay === 'number')
            {
                this.acceleration.y.value = data.ay;
            }
            else
            {
                this.graph.fromData(data.ay, this.acceleration.y);
            }
        }

        //  ------------------------------------------------
        //  Scale and Rotation
        //  ------------------------------------------------

        if (data.hasOwnProperty('scale'))
        {
            this.graph.fromData(data.scale, this.scale.x);
            this.graph.clone(this.scale.x, this.scale.y);
        }
        else
        {
            if (typeof data.scaleX === 'number')
            {
                this.scale.x.value = data.scaleX;
            }
            else
            {
                this.graph.fromData(data.scaleX, this.scale.x);
            }

            if (typeof data.scaleY === 'number')
            {
                this.scale.y.value = data.scaleY;
            }
            else
            {
                this.graph.fromData(data.scaleY, this.scale.y);
            }
        }

        if (typeof data.rotation === 'number')
        {
            this.rotation.value = data.rotation;
        }
        else
        {
            this.graph.fromData(data.rotation, this.rotation);
        }

        var parent = this.particle.parent;

        if (parent && parent.emit && parent.emit.inherit)
        {
            this.inherit(parent);
        }

    },

    /**
    * Adjust Particle parameters according to the inheritable properties
    * of the parent particle.
    *
    * @method Phaser.ParticleStorm.Controls.Transform#inherit
    * @param {Phaser.ParticleStorm.Particle} - The Parent particle to inherit from.
    */
    inherit: function (parent) {

        var inherit = parent.emit.inherit;
        var all = false;

        if (typeof inherit === 'boolean')
        {
            all = true;
        }

        if (all || inherit.vx || inherit.velocity)
        {
            this.graph.clone(parent.transform.velocity.x, this.velocity.x);
        }

        if (all || inherit.vy || inherit.velocity)
        {
            this.graph.clone(parent.transform.velocity.y, this.velocity.y);
        }

        if (all || inherit.facingVelocity)
        {
            this.graph.clone(parent.transform.velocity.facing, this.velocity.facing);
        }

        if (all || inherit.scaleX || inherit.scale)
        {
            this.graph.clone(parent.transform.scale.x, this.scale.x);
        }

        if (all || inherit.scaleY || inherit.scale)
        {
            this.graph.clone(parent.transform.scale.y, this.scale.y);
        }

        if (all || inherit.rotation)
        {
            this.graph.clone(parent.transform.rotation, this.rotation);
        }

        if (inherit.angularVelocity)
        {
            var r = (parent.transform.rotation.initial + parent.transform.rotation.value) * Math.PI / 180;
            this.velocity.x.initial = Math.sin(r);
            this.velocity.y.initial = -Math.cos(r);
        }

    },

    /**
    * Called automatically when the parent particle updates. It applies
    * all transform controls to the particle based on its lifespan.
    *
    * @method Phaser.ParticleStorm.Controls.Transform#step
    */
    step: function () {

        var life = this.particle.life;

        this.scale.x.value += this.scale.x.delta;
        this.scale.y.value += this.scale.y.delta;

        this.rotation.value += this.rotation.delta;

        this.rotation.calc = (this.rotation.initial + this.graph.getValue(this.rotation, life)) * Math.PI / 180;

        this.scale.x.calc = this.scale.x.initial + this.graph.getValue(this.scale.x, life);
        this.scale.y.calc = this.scale.y.initial + this.graph.getValue(this.scale.y, life);

        //  Bail out if fresh
        if (life === 0)
        {
            return;
        }

        var r = 0;
        var v = 0;

        if (this.acceleration.facing.value !== null)
        {
            //  Add 90 degrees because particle rotation 0 is right-handed
            this.acceleration.facing.value += this.acceleration.facing.delta;
            r = this.rotation.calc + ((90 + this.acceleration.facing.offset) * Math.PI / 180);
            v = this.acceleration.facing.initial + this.graph.getValue(this.acceleration.facing, life);
            this.velocity.x.value += v * Math.sin(r);
            this.velocity.y.value += v * -Math.cos(r);
        }

        this.acceleration.x.value += this.acceleration.x.delta;
        this.acceleration.y.value += this.acceleration.y.delta;

        this.velocity.x.value += this.velocity.x.delta + this.acceleration.x.initial + this.graph.getValue(this.acceleration.x, life);
        this.velocity.y.value += this.velocity.y.delta + this.acceleration.y.initial + this.graph.getValue(this.acceleration.y, life);

        if (this.velocity.facing.value !== null)
        {
            //  Add 90 degrees because particle rotation 0 is right-handed
            this.velocity.facing.value += this.velocity.facing.delta;
            r = this.rotation.calc + ((90 + this.velocity.facing.offset) * Math.PI / 180);
            v = this.velocity.facing.initial + this.graph.getValue(this.velocity.facing, life);
            this.x += v * Math.sin(r);
            this.y += v * -Math.cos(r);
        }

        this.x += this.velocity.x.initial + this.graph.getValue(this.velocity.x, life);
        this.y += this.velocity.y.initial + this.graph.getValue(this.velocity.y, life);

    }

};

Phaser.ParticleStorm.Controls.Transform.prototype.constructor = Phaser.ParticleStorm.Controls.Transform;

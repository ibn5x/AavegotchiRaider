/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* The Color control belongs to a single particle and controls all aspects of its color.
* It allows you to control the color channels, alpha, tint, hsv and other properties.
*
* @class Phaser.ParticleStorm.Controls.Color
* @constructor
* @param {Phaser.ParticleStorm.Particle} particle - The particle this control belongs to.
*/
Phaser.ParticleStorm.Controls.Color = function (particle) {

    /**
    * The particle this control belongs to.
    * @property {Phaser.ParticleStorm.Particle} particle
    */
    this.particle = particle;

    /**
    * @property {Phaser.ParticleStorm.Graph} graph - A set of useful common static functions.
    */
    this.graph = Phaser.ParticleStorm.Graph;

    /**
    * The red color channel control object.
    * This inherits all properties of the Phaser.ParticleStorm.BASE_255 object.
    * @property {object} red
    */
    this.red = {};

    /**
    * The green color channel control object.
    * This inherits all properties of the Phaser.ParticleStorm.BASE_255 object.
    * @property {object} green
    */
    this.green = {};

    /**
    * The blue color channel control object.
    * This inherits all properties of the Phaser.ParticleStorm.BASE_255 object.
    * @property {object} blue
    */
    this.blue = {};

    /**
    * The alpha channel control object.
    * This inherits all properties of the Phaser.ParticleStorm.BASE_1 object.
    * @property {object} alpha
    */
    this.alpha = {};

    /**
    * The hsv control object.
    * This inherits all properties of the Phaser.ParticleStorm.BASE_359 object.
    * @property {object} hsv
    */
    this.hsv = {};

    /**
    * A local helper object which stores HSV color modes for emitter renderers to use.
    * This is a reference to the array stored in Phaser.ParticleStorm.
    * 
    * @property {array} hsvData
    * @protected
    */
    this.hsvData = this.particle.emitter.parent.hsv;

    /**
    * This pre-calculated tint value.
    * @property {integer} tint
    */
    this.tint = 0;

    /**
    * A flag telling the renderer if a tint should be applied or not.
    * @property {boolean} isTinted
    */
    this.isTinted = false;

    /**
    * This pre-calculated rgba string.
    * @property {string} rgba
    */
    this.rgba = 'rgba(0, 0, 0, 1)';

    /**
    * The blend mode being used by the particle.
    * This is a reference to a ParticleStorm.blendModeMap entry.
    * @property {array} blendMode
    */
    this.blendMode = this.particle.emitter.parent.blendModeMap.NORMAL;

};

Phaser.ParticleStorm.Controls.Color.prototype = {

    /**
    * Resets this control and all properties of it. This is called automatically
    * when its parent particle is spawned.
    *
    * @method Phaser.ParticleStorm.Controls.Color#reset
    */
    reset: function () {

        this.red = Object.create(Phaser.ParticleStorm.BASE_255);
        this.green = Object.create(Phaser.ParticleStorm.BASE_255);
        this.blue = Object.create(Phaser.ParticleStorm.BASE_255);

        this.alpha = Object.create(Phaser.ParticleStorm.BASE_1);

        this.tint = 0xffffff;
        this.isTinted = false;

        this.isHSV = false;
        this.hsv = Object.create(Phaser.ParticleStorm.BASE_359);

        this.rgba = 'rgba(0, 0, 0, 1)';

        this.blendMode = this.particle.emitter.parent.blendModeMap.NORMAL;

    },

    /**
    * Takes a particle data object and populates all aspects of this control
    * that it applies to.
    *
    * @method Phaser.ParticleStorm.Controls.Color#init
    * @param {object} data - The particle data.
    */
    init: function (data) {

        var tint = false;

        //  ------------------------------------------------
        //  HSV
        //  ------------------------------------------------

        if (data.hasOwnProperty('hsv'))
        {
            if (typeof data.hsv === 'number')
            {
                this.hsv.value = data.hsv;
            }
            else
            {
                this.graph.fromData(data.hsv, this.hsv);
            }

            tint = true;
            this.isHSV = true;
        }
        else
        {
            //  ------------------------------------------------
            //  RGB
            //  ------------------------------------------------

            if (data.hasOwnProperty('red'))
            {
                if (typeof data.red === 'number')
                {
                    this.red.value = data.red;
                }
                else
                {
                    this.graph.fromData(data.red, this.red);
                }

                tint = true;
            }

            if (data.hasOwnProperty('green'))
            {
                if (typeof data.green === 'number')
                {
                    this.green.value = data.green;
                }
                else
                {
                    this.graph.fromData(data.green, this.green);
                }

                tint = true;
            }

            if (data.hasOwnProperty('blue'))
            {
                if (typeof data.blue === 'number')
                {
                    this.blue.value = data.blue;
                }
                else
                {
                    this.graph.fromData(data.blue, this.blue);
                }

                tint = true;
            }
        }

        //  ------------------------------------------------
        //  Alpha
        //  ------------------------------------------------

        if (data.hasOwnProperty('alpha'))
        {
            if (typeof data.alpha === 'number')
            {
                this.alpha.value = data.alpha;
            }
            else
            {
                this.graph.fromData(data.alpha, this.alpha);
            }
        }

        this.red.value = Phaser.Math.clamp(this.red.value, 0, 255);
        this.green.value = Phaser.Math.clamp(this.green.value, 0, 255);
        this.blue.value = Phaser.Math.clamp(this.blue.value, 0, 255);
        this.alpha.value = Phaser.Math.clamp(this.alpha.value, 0, 1);
        this.hsv.value = Phaser.Math.clamp(this.hsv.value, 0, 359);

        if (this.particle.emitter.renderType !== Phaser.ParticleStorm.PIXEL)
        {
            //  We don't tint pixels
            this.isTinted = tint;
        }

        if (data.blendMode)
        {
            this.blendMode = this.particle.emitter.parent.blendModeMap[data.blendMode.toUpperCase()];
        }

    },

    /**
    * Called automatically when the parent particle updates. It applies
    * all color controls to the particle based on its lifespan.
    *
    * @method Phaser.ParticleStorm.Controls.Color#step
    */
    step: function () {

        var life = this.particle.life;

        if (this.isHSV)
        {
            this.hsv.value += this.hsv.delta;
            this.hsv.calc = Phaser.Math.clamp(Math.floor(this.hsv.initial + this.graph.getValue(this.hsv, life)), 0, 359);

            this.red.value = this.hsvData[this.hsv.calc].r;
            this.green.value = this.hsvData[this.hsv.calc].g;
            this.blue.value = this.hsvData[this.hsv.calc].b;
        }
        else
        {
            this.red.value += this.red.delta;
            this.green.value += this.green.delta;
            this.blue.value += this.blue.delta;
        }

        this.red.calc = this.graph.getClampedValue(this.red, life);
        this.green.calc = this.graph.getClampedValue(this.green, life);
        this.blue.calc = this.graph.getClampedValue(this.blue, life);

        if (this.isTinted)
        {
            this.tint = this.red.calc << 16 | this.green.calc << 8 | this.blue.calc;
        }

        this.alpha.value += this.alpha.delta;
        this.alpha.calc = Phaser.Math.clamp(this.alpha.initial + this.graph.getValue(this.alpha, life), 0, 1);

        this.rgba = 'rgba(' + this.red.calc + ',' + this.green.calc + ',' + this.blue.calc + ',' + this.alpha.calc + ')';

    },

    /**
    * Sets the color values of the red, green and blue controls.
    *
    * @method Phaser.ParticleStorm.Controls.Color#setColor
    * @param {integer} r - The red color value. Between 1 and 255.
    * @param {integer} g - The green color value. Between 1 and 255.
    * @param {integer} b - The blue color value. Between 1 and 255.
    * @param {integer} a - The alpha color value. Between 1 and 255.
    */
    setColor: function (r, g, b, a) {

        this.red.value = r;
        this.green.value = g;
        this.blue.value = b;
        this.alpha.value = a;

        if (this.particle.emitter.renderType !== Phaser.ParticleStorm.PIXEL)
        {
            //  We don't tint pixels
            this.isTinted = true;
        }

        this.step();

    }

};

Phaser.ParticleStorm.Controls.Color.prototype.constructor = Phaser.ParticleStorm.Controls.Color;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* The Texture control belongs to a single particle and controls all aspects of its texture.
* It allows you to control the texture, animation frame and z-index in display lists.
*
* @class Phaser.ParticleStorm.Controls.Texture
* @constructor
* @param {Phaser.ParticleStorm.Particle} particle - The particle this control belongs to.
*/
Phaser.ParticleStorm.Controls.Texture = function (particle) {

    /**
    * The particle this control belongs to.
    * @property {Phaser.ParticleStorm.Particle} particle
    */
    this.particle = particle;

    /**
    * A reference to the Phaser.RandomDataGenerator which several methods in this
    * control require.
    * @property {Phaser.RandomDataGenerator} rnd
    */
    this.rnd = particle.emitter.game.rnd;

    /**
    * @property {Phaser.ParticleStorm.Graph} graph - A set of useful common static functions.
    */
    this.graph = Phaser.ParticleStorm.Graph;

    /**
    * Particles that are spawned within a display list (such as Sprite particles) can
    * optionally be 'sent to the back' of the list upon being spawned.
    * @property {boolean} sendToBack
    * @default
    */
    this.sendToBack = false;

    /**
    * Particles that are spawned within a display list (such as Sprite particles) can
    * optionally be 'bought to the front' of the list upon being spawned.
    * @property {boolean} bringToTop
    * @default
    */
    this.bringToTop = true;

    /**
    * The key of the image this particle uses for rendering, if any.
    * @property {string} key
    * @default
    */
    this.key = null;

    /**
    * The current numeric frame of this particle texture, if using a sprite sheet.
    * @property {number} frame
    * @default
    */
    this.frame = undefined;

    /**
    * The current frame name of this particles texture, if using an atlas.
    * @property {string} frameName
    * @default
    */
    this.frameName = undefined;

    /**
    * The scale mode used by the texture.
    * @property {integer} scaleMode
    * @default
    */
    this.scaleMode = Phaser.scaleModes.DEFAULT;

};

Phaser.ParticleStorm.Controls.Texture.prototype = {

    /**
    * Resets this control and all properties of it. This is called automatically
    * when its parent particle is spawned.
    *
    * @method Phaser.ParticleStorm.Controls.Texture#reset
    */
    reset: function () {

        this.sendToBack = false;
        this.bringToTop = true;

        this.key = '__default';

        this.frame = undefined;
        this.frameName = undefined;

        this.scaleMode = Phaser.scaleModes.DEFAULT;

    },

    /**
    * Populates all aspects of this control to its particle that apply.
    *
    * @method Phaser.ParticleStorm.Controls.Texture#init
    */
    init: function (data) {

        //  ------------------------------------------------
        //  Send to Back / Bring to Front (boolean)
        //  ------------------------------------------------

        if (data.sendToBack)
        {
            this.sendToBack = data.sendToBack;
        }
        else if (data.bringToTop)
        {
            this.bringToTop = data.bringToTop;
        }

        //  ------------------------------------------------
        //  Particle image (string or array) with optional Frame
        //  ------------------------------------------------

        if (data.image)
        {
            if (Array.isArray(data.image))
            {
                this.key = this.rnd.pick(data.image);
            }
            else
            {
                this.key = data.image;
            }
        }

        //  Allows for single frame setting (index or string based, both work)
        if (data.frame !== undefined)
        {
            var f = data.frame;

            if (Array.isArray(data.frame))
            {
                f = this.rnd.pick(data.frame);
            }

            if (this.graph.isNumeric(f))
            {
                this.frame = f;
            }
            else
            {
                this.frameName = f;
            }
        }

        //  ------------------------------------------------
        //  Scale Mode
        //  ------------------------------------------------

        if (data.scaleMode)
        {
            var sm = data.scaleMode.toUpperCase();

            if (sm === 'LINEAR')
            {
                this.scaleMode = Phaser.scaleModes.LINEAR;
            }
            else if (sm === 'NEAREST')
            {
                this.scaleMode = Phaser.scaleModes.NEAREST;
            }
        }

    },

    /**
    * Called automatically when the parent particle updates. It applies
    * all texture controls to the particle based on its lifespan.
    *
    * @method Phaser.ParticleStorm.Controls.Texture#step
    * @param {object} data - The particle data object.
    * @param {Phaser.Sprite} [sprite] - The particle sprite.
    */
    step: function (data, sprite) {

        //  ------------------------------------------------
        //  Animation
        //  ------------------------------------------------

        if (this.particle.emitter.renderType === Phaser.ParticleStorm.SPRITE && data.animations !== undefined)
        {
            var names = [];

            for (var name in data.animations)
            {
                var anim = data.animations[name];

                var frames = null;
                var numeric = true;

                if (anim.frames !== undefined)
                {
                    if (Array.isArray(anim.frames))
                    {
                        frames = anim.frames;
                    }
                    else
                    {
                        frames = Phaser.Animation.generateFrameNames(anim.frames.prefix, anim.frames.start, anim.frames.stop, anim.frames.suffix, anim.frames.zeroPad);
                    }

                    if (typeof frames[0] === 'string')
                    {
                        numeric = false;
                    }
                }

                var frameRate = (anim.frameRate === undefined) ? 60 : anim.frameRate;
                var loop = (anim.loop === undefined) ? false : anim.loop;

                sprite.animations.add(name, frames, frameRate, loop, numeric);

                names.push(name);
            }

            if (names.length > 0)
            {
                if (data.play !== undefined)
                {
                    sprite.play(this.rnd.pick(names));
                }
                else
                {
                    sprite.play(names[0]);
                }
            }
        }

        //  ------------------------------------------------
        //  Z Order
        //  ------------------------------------------------

        if (this.sendToBack)
        {
            sprite.sendToBack();
        }
        else if (this.bringToTop)
        {
            sprite.bringToTop();
        }

    }

};

Phaser.ParticleStorm.Controls.Texture.prototype.constructor = Phaser.ParticleStorm.Controls.Texture;

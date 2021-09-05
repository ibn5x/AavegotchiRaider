/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

Phaser.ParticleStorm.Renderer = {};

/**
* The base class which all ParticleStorm renderers must extend.
*
* @class Phaser.ParticleStorm.Renderer.Base
* @constructor
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter that this renderer belongs to.
*/
Phaser.ParticleStorm.Renderer.Base = function (emitter) {

    /**
    * @property {Phaser.Game} game - A reference to the Phaser Game instance.
    */
    this.game = emitter.game;

    /**
    * @property {Phaser.ParticleStorm.Emitter} emitter - The emitter that owns this renderer.
    */
    this.emitter = emitter;

    /**
    * @property {Phaser.ParticleStorm} parent - The Particle Storm plugin.
    */
    this.parent = emitter.parent;

    /**
    * The size of a 'pixel' as used by the Pixel renderer and others that extend
    * it. It can be any positive value from 1 up. A value of 2 means a 2x2 pixel,
    * 3 is a 3x3 pixel and so on. At a size of 1 or 2 it uses setPixel to
    * draw to the BitmapData. At 3+ it uses a fillRect operation.
    * @property {integer} pixelSize
    */
    this.pixelSize = 1;

};

Phaser.ParticleStorm.Renderer.Base.prototype = {

    /**
    * Adds this Particle Renderer to the display list.
    * 
    * You can specify a Group to add it to. If none is given it will use Phaser.World instead.
    * If this renderer emits particle display objects such as Phaser.Sprites they will be added to the same Group.
    *
    * @method Phaser.ParticleStorm.Renderer.Base#addToWorld
    * @param {Phaser.Group} [group] - The Group to add this renderer to. If not specified Phaser.World is used.
    * @return {Phaser.Image|Phaser.Sprite|Phaser.Group} The display object that contains the particle renderer.
    */
    addToWorld: function (group) {

        group.add(this.display);

        return this.display;

    },

    /**
    * The preUpdate method of this renderer.
    *
    * @method Phaser.ParticleStorm.Renderer.Base#preUpdate
    */
    preUpdate: function () {

    },

    /**
    * Adds the given particle to this renderer, to be rendered in the next update.
    *
    * @method Phaser.ParticleStorm.Renderer.Base#add
    * @param {Phaser.ParticleStorm.Particle} particle - Adds a particle to this renderer.
    */
    add: function () {

        return null;

    },

    /**
    * Updates the given particle within this renderer.
    *
    * @method Phaser.ParticleStorm.Renderer.Base#update
    * @param {Phaser.ParticleStorm.Particle} particle - The particle to be updated.
    */
    update: function (particle) {

        return particle;

    },

    /**
    * The postUpdate method of this renderer.
    * Called after all updates have taken place, before the render pass.
    *
    * @method Phaser.ParticleStorm.Renderer.Base#postUpdate
    */
    postUpdate: function () {

    },

    /**
    * Kills the given particle from this renderer.
    *
    * @method Phaser.ParticleStorm.Renderer.Base#kill
    * @param {Phaser.ParticleStorm.Particle} particle - The particle to be killed.
    */
    kill: function (particle) {

        return particle;

    },

    /**
    * Destroys this renderer.
    *
    * @method Phaser.ParticleStorm.Renderer.Base#destroy
    */
    destroy: function () {

        this.game = null;

    }

};

Phaser.ParticleStorm.Renderer.Base.prototype.constructor = Phaser.ParticleStorm.Renderer.Base;

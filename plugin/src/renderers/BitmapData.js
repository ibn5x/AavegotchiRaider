/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A BitmapData based renderer. A single BitmapData is created onto which all
* particles are rendered directly. The renderer can be resized using the resize method.
*
* @class Phaser.ParticleStorm.Renderer.BitmapData
* @constructor
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter that this renderer belongs to.
* @param {integer} width - The width of the renderer. Defaults to Game.width.
* @param {integer} height - The height of the renderer. Defaults to Game.height.
*/
Phaser.ParticleStorm.Renderer.BitmapData = function (emitter, width, height) {

    Phaser.ParticleStorm.Renderer.Base.call(this, emitter);

    /**
    * The BitmapData object which is used to render the particles to.
    * @property {Phaser.BitmapData} bmd
    */
    this.bmd = this.game.make.bitmapData(width, height);

    /**
    * A Phaser.Image that has this BitmapData set as its texture.
    * When you add this renderer to the display list it is this image
    * that is added.
    * @property {Phaser.Image} display
    */
    this.display = this.game.make.image(0, 0, this.bmd);

    /**
    * If true then all pixel coordinates will be rounded before being rendered.
    * This avoids sub-pixel anti-aliasing.
    * @property {boolean} roundPx
    * @default
    */
    this.roundPx = true;

    /**
    * If true then this renderer automatically clears itself each update, before
    * new particles are rendered to it. You can disable this and then call the
    * `clear` method directly to control how and when it's cleared.
    * @property {boolean} autoClear
    * @default
    */
    this.autoClear = true;

};

Phaser.ParticleStorm.Renderer.BitmapData.prototype = Object.create(Phaser.ParticleStorm.Renderer.Base.prototype);
Phaser.ParticleStorm.Renderer.BitmapData.prototype.constructor = Phaser.ParticleStorm.Renderer.BitmapData;

/**
* Resizes the dimensions of the BitmapData used for rendering.
*
* @method Phaser.ParticleStorm.Renderer.BitmapData#resize
* @param {integer} width - The width of the renderer. Defaults to Game.width.
* @param {integer} height - The height of the renderer. Defaults to Game.height.
* @return {Phaser.ParticleStorm.Renderer.BitmapData} This renderer.
*/
Phaser.ParticleStorm.Renderer.BitmapData.prototype.resize = function (width, height) {

    this.bmd.resize(width, height);

    return this;

};

/**
* Clears this BitmapData. An optional `alpha` value allows you to specify
* the amount of alpha to use when clearing. By setting values lower than 1
* you can leave behind previous particle images, creating 'trail' like effects.
*
* @method Phaser.ParticleStorm.Renderer.BitmapData#clear
* @param {number} [alpha=1] - The alpha color value, between 0 and 1.
* @return {Phaser.ParticleStorm.Renderer.BitmapData} This renderer.
*/
Phaser.ParticleStorm.Renderer.BitmapData.prototype.clear = function (alpha) {

    this.bmd.fill(0, 0, 0, alpha);

    return this;

};

/**
* The preUpdate method of this renderer. This is called automatically by
* the Emitter.
*
* @method Phaser.ParticleStorm.Renderer.BitmapData#preUpdate
*/
Phaser.ParticleStorm.Renderer.BitmapData.prototype.preUpdate = function () {

    if (this.autoClear)
    {
        this.bmd.clear();
    }

};

/**
* Updates and renders the given particle to this renderer.
*
* @method Phaser.ParticleStorm.Renderer.BitmapData#update
* @param {Phaser.ParticleStorm.Particle} particle - The particle to be updated.
*/
Phaser.ParticleStorm.Renderer.BitmapData.prototype.update = function (particle) {

    //  If the particle is delayed AND should be hidden when delayed ...
    if (particle.delay > 0 && !particle.delayVisible)
    {
        return;
    }

    //  We need whole numbers to render pixels
    var t = particle.transform;

    this.bmd.copy(particle.texture.key, 
        0, 0, null, null, 
        t.x, t.y, null, null, 
        t.rotation.calc, 
        t.anchor.x, t.anchor.y, 
        t.scale.x.calc, t.scale.y.calc, 
        particle.color.alpha.calc, 
        particle.color.blendMode[1], 
        this.roundPx);

};

/**
* Destroys this renderer.
*
* @method Phaser.ParticleStorm.Renderer.BitmapData#destroy
*/
Phaser.ParticleStorm.Renderer.BitmapData.prototype.destroy = function () {

    this.game = null;

    this.display.destroy();

    this.bmd.destroy();

};

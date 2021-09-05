/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A Pixel renderer. This is a special form of the BitmapData renderer which is
* dedicated to rendering pixel particles, rather than images or sprites.
*
* The size of the pixels can be controlled with the `pixelSize` property, which can
* be changed in real-time.
*
* @class Phaser.ParticleStorm.Renderer.Pixel
* @constructor
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter that this renderer belongs to.
* @param {integer} width - The width of the renderer. Defaults to Game.width.
* @param {integer} height - The height of the renderer. Defaults to Game.height.
*/
Phaser.ParticleStorm.Renderer.Pixel = function (emitter, width, height) {

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
    * If true then this renderer automatically clears itself each update, before
    * new particles are rendered to it. You can disable this and then call the
    * `clear` method directly to control how and when it's cleared.
    * @property {boolean} autoClear
    * @default
    */
    this.autoClear = true;

};

Phaser.ParticleStorm.Renderer.Pixel.prototype = Object.create(Phaser.ParticleStorm.Renderer.Base.prototype);
Phaser.ParticleStorm.Renderer.Pixel.prototype.constructor = Phaser.ParticleStorm.Renderer.Pixel;

/**
* Resizes the dimensions of the BitmapData used for rendering.
*
* @method Phaser.ParticleStorm.Renderer.Pixel#resize
* @param {integer} width - The width of the renderer. Defaults to Game.width.
* @param {integer} height - The height of the renderer. Defaults to Game.height.
* @return {Phaser.ParticleStorm.Renderer.Pixel} This renderer.
*/
Phaser.ParticleStorm.Renderer.Pixel.prototype.resize = function (width, height) {

    this.bmd.resize(width, height);

    return this;

};

/**
* Clears this BitmapData. An optional `alpha` value allows you to specify
* the amount of alpha to use when clearing. By setting values lower than 1
* you can leave behind previous particle images, creating 'trail' like effects.
*
* @method Phaser.ParticleStorm.Renderer.Pixel#clear
* @param {number} [alpha=1] - The alpha color value, between 0 and 1.
* @return {Phaser.ParticleStorm.Renderer.Pixel} This renderer.
*/
Phaser.ParticleStorm.Renderer.Pixel.prototype.clear = function (alpha) {

    this.bmd.fill(0, 0, 0, alpha);
    this.bmd.update();

    return this;

};

/**
* The preUpdate method of this renderer. This is called automatically by
* the Emitter.
*
* @method Phaser.ParticleStorm.Renderer.Pixel#preUpdate
*/
Phaser.ParticleStorm.Renderer.Pixel.prototype.preUpdate = function () {

    if (this.autoClear)
    {
        this.bmd.clear();
        this.bmd.update();
    }

};

/**
* Updates and renders the given particle to this renderer.
*
* @method Phaser.ParticleStorm.Renderer.Pixel#update
* @param {Phaser.ParticleStorm.Particle} particle - The particle to be updated.
*/
Phaser.ParticleStorm.Renderer.Pixel.prototype.update = function (particle) {

    //  If the particle is delayed AND should be hidden when delayed ...
    if (particle.delay > 0 && !particle.delayVisible)
    {
        return;
    }

    //  We need whole numbers to render pixels
    var x = Math.floor(particle.transform.x);
    var y = Math.floor(particle.transform.y);

    var r = particle.color.red.calc;
    var g = particle.color.green.calc;
    var b = particle.color.blue.calc;
    var a = Math.floor(particle.color.alpha.calc * 255);

    if (this.pixelSize > 2)
    {
        this.bmd.rect(x, y, this.pixelSize, this.pixelSize, particle.color.rgba);
    }
    else
    {
        this.bmd.setPixel32(x, y, r, g, b, a, false);

        //  2x2
        if (this.pixelSize === 2)
        {
            this.bmd.setPixel32(x + 1, y, r, g, b, a, false);
            this.bmd.setPixel32(x, y + 1, r, g, b, a, false);
            this.bmd.setPixel32(x + 1, y + 1, r, g, b, a, false);
        }
    }

};

/**
* The postUpdate method is called automatically when all particles have
* been rendered.
*
* @method Phaser.ParticleStorm.Renderer.Pixel#postUpdate
*/
Phaser.ParticleStorm.Renderer.Pixel.prototype.postUpdate = function () {

    if (this.pixelSize <= 2)
    {
        this.bmd.context.putImageData(this.bmd.imageData, 0, 0);
    }

    this.bmd.dirty = true;

};

/**
* Destroys this renderer.
*
* @method Phaser.ParticleStorm.Renderer.Pixel#destroy
*/
Phaser.ParticleStorm.Renderer.Pixel.prototype.destroy = function () {

    this.game = null;

    this.display.destroy();

    this.bmd.destroy();

};

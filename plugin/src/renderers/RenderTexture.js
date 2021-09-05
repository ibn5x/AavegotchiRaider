/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A RenderTexture based renderer. Render Textures are highly optimised (under WebGL)
* for rendering images to. This renderer works by creating a 'stamp', which takes on
* the form of each particle and then 'stamps' itself on this RenderTexture. This avoids
* each particle needing to have its own sprite instance.
*
* @class Phaser.ParticleStorm.Renderer.RenderTexture
* @constructor
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter that this renderer belongs to.
* @param {integer} width - The width of the renderer. Defaults to Game.width.
* @param {integer} height - The height of the renderer. Defaults to Game.height.
*/
Phaser.ParticleStorm.Renderer.RenderTexture = function (emitter, width, height) {

    Phaser.ParticleStorm.Renderer.Base.call(this, emitter);

    /**
    * The RenderTexture object which is used to render the particles to.
    * @property {Phaser.RenderTexture} renderTexture
    */
    this.renderTexture = this.game.make.renderTexture(width, height);

    /**
    * A Phaser.Image that has this RenderTexture set as its texture.
    * When you add this renderer to the display list it is this image
    * that is added.
    * @property {Phaser.Image} display
    */
    this.display = this.game.make.image(0, 0, this.renderTexture);

    /**
    * A Phaser.Image that is used as the stamp for this RenderTexture. When a
    * particle is rendered to this RenderTexture the stamp takes on the texture 
    * and form of the particle, then 'stamps' itself on the RenderTexture.
    * @property {Phaser.Image} stamp
    * @protected
    */
    this.stamp = this.game.make.image(0, 0);

    /**
    * If true then this renderer automatically clears itself each update, before
    * new particles are rendered to it. You can disable this and then call the
    * `clear` method directly to control how and when it's cleared.
    * @property {boolean} autoClear
    * @default
    */
    this.autoClear = true;

};

Phaser.ParticleStorm.Renderer.RenderTexture.prototype = Object.create(Phaser.ParticleStorm.Renderer.Base.prototype);
Phaser.ParticleStorm.Renderer.RenderTexture.prototype.constructor = Phaser.ParticleStorm.Renderer.RenderTexture;

/**
* Clears the RenderTexture being used by this renderer. This happens automatically
* if `autoClear` is enabled.
*
* @method Phaser.ParticleStorm.Renderer.RenderTexture#clear
*/
Phaser.ParticleStorm.Renderer.RenderTexture.prototype.clear = function () {

    this.renderTexture.clear();

};

/**
* The preUpdate method of this renderer. This is called automatically by
* the Emitter.
*
* @method Phaser.ParticleStorm.Renderer.RenderTexture#preUpdate
*/
Phaser.ParticleStorm.Renderer.RenderTexture.prototype.preUpdate = function () {

    if (this.autoClear)
    {
        this.renderTexture.clear();
    }

};

/**
* Updates and renders the given particle to this renderer.
*
* @method Phaser.ParticleStorm.Renderer.RenderTexture#update
* @param {Phaser.ParticleStorm.Particle} particle - The particle to be updated.
*/
Phaser.ParticleStorm.Renderer.RenderTexture.prototype.update = function (particle) {

    //  If the particle is delayed AND should be hidden when delayed ...
    if ((particle.delay > 0 && !particle.delayVisible) || !particle.visible || particle.color.alpha.calc === 0)
    {
        return;
    }

    //  Transfer settings to the drawing object
    var key = particle.texture.key;
    var frame = particle.texture.frame;

    if (frame === undefined && particle.texture.frameName !== undefined)
    {
        //  String frame
        frame = particle.texture.frameName;
    }

    if (this.stamp.key !== key)
    {
        this.stamp.loadTexture(key, frame);
    }
    else
    {
        if (particle.texture.frame !== undefined)
        {
            this.stamp.frame = frame;
        }
        else if (particle.texture.frameName !== undefined)
        {
            this.stamp.frameName = frame;
        }
    }

    this.stamp.anchor.set(particle.transform.anchor.x, particle.transform.anchor.y);

    this.stamp.alpha = particle.color.alpha.calc;

    this.stamp.rotation = particle.transform.rotation.calc;

    if (particle.color.isTinted)
    {
        this.stamp.tint = particle.color.tint;
    }

    this.stamp.blendMode = particle.color.blendMode[0];

    this.stamp.texture.baseTexture.scaleMode = particle.texture.scaleMode;

    this.stamp.scale.setTo(particle.transform.scale.x.calc, particle.transform.scale.y.calc);

    this.renderTexture.renderXY(this.stamp, particle.transform.x, particle.transform.y, false);

};

/**
* Destroys this renderer.
*
* @method Phaser.ParticleStorm.Renderer.RenderTexture#destroy
*/
Phaser.ParticleStorm.Renderer.RenderTexture.prototype.destroy = function () {

    this.display.destroy();

    this.stamp.destroy();

    this.renderTexture.destroy();

    this.emitter = null;

    this.game = null;

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A Sprite based renderer.
*
* @class Phaser.ParticleStorm.Renderer.Sprite
* @constructor
* @param {Phaser.ParticleStorm.Emitter} emitter - The emitter that this renderer belongs to.
*/
Phaser.ParticleStorm.Renderer.Sprite = function (emitter) {

    Phaser.ParticleStorm.Renderer.Base.call(this, emitter);

    /**
    * A Phaser.Group that contains all particles created by this renderer.
    * @property {Phaser.Group} display
    */
    this.display = this.game.make.group(null, 'particleStormSpriteRenderer');

};

Phaser.ParticleStorm.Renderer.Sprite.prototype = Object.create(Phaser.ParticleStorm.Renderer.Base.prototype);
Phaser.ParticleStorm.Renderer.Sprite.prototype.constructor = Phaser.ParticleStorm.Renderer.Sprite;

/**
* Adds the given particle to this renderer. If the particle has a sprite property
* then its reset and updated. If it doesn't then a new Phaser.Sprite is created,
* belonging to this renderers display group.
*
* @method Phaser.ParticleStorm.Renderer.Sprite#add
* @param {Phaser.ParticleStorm.Particle} particle - The particle to be updated.
* @return {Phaser.Sprite} This particles sprite property.
*/
Phaser.ParticleStorm.Renderer.Sprite.prototype.add = function (particle) {

    var spr = particle.sprite;
    var key = particle.texture.key;
    var frame = particle.texture.frame;

    if (frame === undefined && particle.texture.frameName !== undefined)
    {
        //  String frame
        frame = particle.texture.frameName;
    }

    if (spr)
    {
        spr.reset(particle.transform.x, particle.transform.y);

        if (spr.key !== key)
        {
            spr.loadTexture(key, frame);
        }
        else
        {
            if (particle.texture.frame !== undefined)
            {
                spr.frame = frame;
            }
            else if (particle.texture.frameName !== undefined)
            {
                spr.frameName = frame;
            }
        }
    }
    else
    {
        spr = this.display.create(particle.transform.x, particle.transform.y, key, frame);
    }

    spr.anchor.set(particle.transform.anchor.x, particle.transform.anchor.y);

    if (particle.color.isTinted)
    {
        spr.tint = particle.color.tint;
    }

    spr.blendMode = particle.color.blendMode[0];
    spr.texture.baseTexture.scaleMode = particle.texture.scaleMode;

    spr.visible = particle.visible;

    particle.sprite = spr;

    return spr;

};

/**
* Updates and renders the given particle to this renderer.
*
* @method Phaser.ParticleStorm.Renderer.Sprite#update
* @param {Phaser.ParticleStorm.Particle} particle - The particle to be updated.
*/
Phaser.ParticleStorm.Renderer.Sprite.prototype.update = function (particle) {

    var spr = particle.sprite;

    //  If the particle is delayed AND should be hidden when delayed ...
    if (particle.delay > 0 && !particle.delayVisible)
    {
        spr.visible = false;
        return;
    }

    spr.visible = particle.visible;

    spr.alpha = particle.color.alpha.calc;

    spr.rotation = particle.transform.rotation.calc;

    if (particle.color.isTinted)
    {
        spr.tint = particle.color.tint;
    }

    spr.scale.setTo(particle.transform.scale.x.calc, particle.transform.scale.y.calc);

    spr.x = particle.transform.x;
    spr.y = particle.transform.y;

};

/**
* Kills the given particle from this renderer.
*
* @method Phaser.ParticleStorm.Renderer.SpriteBatch#kill
* @param {Phaser.ParticleStorm.Particle} particle - The particle to be killed.
*/
Phaser.ParticleStorm.Renderer.Sprite.prototype.kill = function (particle) {

    if (particle.sprite)
    {
        particle.sprite.kill();
    }

};

/**
* Destroys this renderer.
*
* @method Phaser.ParticleStorm.Renderer.SpriteBatch#destroy
*/
Phaser.ParticleStorm.Renderer.Sprite.prototype.destroy = function () {

    this.display.destroy(true);

    this.emitter = null;

    this.game = null;

};

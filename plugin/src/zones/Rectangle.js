/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A Rectangle Zone defines a rectangle object from within which particles can be emitted.
* 
* @class Phaser.ParticleStorm.Zones.Rectangle
* @constructor
* @extends Phaser.ParticleStorm.Zones.Base
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} [width=0] - The width of the Rectangle. Should always be either zero or a positive value.
* @param {number} [height=0] - The height of the Rectangle. Should always be either zero or a positive value.
*/
Phaser.ParticleStorm.Zones.Rectangle = function (game, width, height) {

    Phaser.ParticleStorm.Zones.Base.call(this, game);

    /**
    * The Phaser geometry primitive this zone uses.
    * @property {Phaser.Rectangle} shape
    */
    this.shape = new Phaser.Rectangle(0, 0, width, height);

};

Phaser.ParticleStorm.Zones.Rectangle.prototype = Object.create(Phaser.ParticleStorm.Zones.Base.prototype);
Phaser.ParticleStorm.Zones.Rectangle.prototype.constructor = Phaser.ParticleStorm.Zones.Rectangle;

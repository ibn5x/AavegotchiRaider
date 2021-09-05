/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A Circle Zone defines a circular area from within which particles can be emitted.
* 
* @class Phaser.ParticleStorm.Zones.Circle
* @constructor
* @extends Phaser.ParticleStorm.Zones.Base
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} [radius=0] - The radius of the circle in pixels.
*/
Phaser.ParticleStorm.Zones.Circle = function (game, radius) {

    Phaser.ParticleStorm.Zones.Base.call(this, game);

    /**
    * The Phaser geometry primitive this zone uses.
    * @property {Phaser.Circle} shape
    */
    this.shape = new Phaser.Circle(0, 0, radius * 2);

};

Phaser.ParticleStorm.Zones.Circle.prototype = Object.create(Phaser.ParticleStorm.Zones.Base.prototype);
Phaser.ParticleStorm.Zones.Circle.prototype.constructor = Phaser.ParticleStorm.Zones.Circle;

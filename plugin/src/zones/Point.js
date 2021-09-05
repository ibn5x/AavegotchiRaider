/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A Point Zone defines a point object from within which particles can be emitted.
* 
* @class Phaser.ParticleStorm.Zones.Point
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} [x=0] - The horizontal position of this Point Zone.
* @param {number} [y=0] - The vertical position of this Point Zone.
*/
Phaser.ParticleStorm.Zones.Point = function (game, x, y) {

    Phaser.ParticleStorm.Zones.Base.call(this, game);

    /**
    * The Phaser geometry primitive this zone uses.
    * @property {Phaser.Point} shape
    */
    this.shape = new Phaser.Point(x, y);

};

Phaser.ParticleStorm.Zones.Point.prototype = Object.create(Phaser.ParticleStorm.Zones.Base.prototype);
Phaser.ParticleStorm.Zones.Point.prototype.constructor = Phaser.ParticleStorm.Zones.Point;

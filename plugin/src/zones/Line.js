/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* A Line Zone defines a line segment from within which particles can be emitted.
* 
* @class Phaser.ParticleStorm.Zones.Line
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} [x1=0] - The x coordinate of the start of the line.
* @param {number} [y1=0] - The y coordinate of the start of the line.
* @param {number} [x2=0] - The x coordinate of the end of the line.
* @param {number} [y2=0] - The y coordinate of the end of the line.
*/
Phaser.ParticleStorm.Zones.Line = function (game, x1, y1, x2, y2) {

    Phaser.ParticleStorm.Zones.Base.call(this, game);

    /**
    * The Phaser geometry primitive this zone uses.
    * @property {Phaser.Line} shape
    */
    this.shape = new Phaser.Line(x1, y1, x2, y2);

};

Phaser.ParticleStorm.Zones.Line.prototype = Object.create(Phaser.ParticleStorm.Zones.Base.prototype);
Phaser.ParticleStorm.Zones.Line.prototype.constructor = Phaser.ParticleStorm.Zones.Line;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
* An Ellipse Zone defines an elliptical area from within which particles can be emitted.
* 
* @class Phaser.ParticleStorm.Zones.Ellipse
* @constructor
* @extends Phaser.ParticleStorm.Zones.Base
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} [width=0] - The overall width of this ellipse.
* @param {number} [height=0] - The overall height of this ellipse.
*/
Phaser.ParticleStorm.Zones.Ellipse = function (game, width, height) {

    Phaser.ParticleStorm.Zones.Base.call(this, game);

    /**
    * The Phaser geometry primitive this zone uses.
    * @property {Phaser.Ellipse} shape
    */
    this.shape = new Phaser.Ellipse(0, 0, width, height);

};

Phaser.ParticleStorm.Zones.Ellipse.prototype = Object.create(Phaser.ParticleStorm.Zones.Base.prototype);
Phaser.ParticleStorm.Zones.Ellipse.prototype.constructor = Phaser.ParticleStorm.Zones.Ellipse;

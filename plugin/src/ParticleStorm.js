/**
* @author       Richard Davey <rich@photonstorm.com>
* @author       Pete Baron <pete@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
* @version      1.0.0 - October 7th 2015
*/

/**
* @namespace Phaser
*/

/**
* An instance of a Particle Storm Plugin.
* 
* This class is responsible for updating and managing all active emitters created by this plugin.
*
* Add it to your game via the Phaser Plugin Manager:
*
* `this.manager = this.game.plugins.add(Phaser.ParticleStorm);`
*
* You only need one instance of this plugin installed. It can create multiple emitters, each
* capable of controlling their own sets of particles.
*
* The plugin is not a display object itself, you cannot add it to the display list or position it.
*
* @class Phaser.ParticleStorm
* @constructor
* @param {Phaser.Game} game - A reference to the current Phaser.Game instance.
* @param {Phaser.PluginManager} parent - The Phaser Plugin Manager which looks after this plugin.
*/
Phaser.ParticleStorm = function (game, parent) {

    Phaser.Plugin.call(this, game, parent);

    /**
    * An array of Emitter objects.
    * 
    * @property {array} emitters
    * @protected
    */
    this.emitters = [];

    /**
    * An object containing references or copies of all the Particle data that has been added via `addData` and `cloneData`.
    * 
    * Clear this list by calling `clearData()`.
    * 
    * @property {object} dataList
    * @protected
    */
    this.dataList = {};

    var useNew = PIXI.canUseNewCanvasBlendModes();

    /**
    * A local helper object which stores blend mode string to blend mode mappings.
    * 
    * @property {object} blendModeMap
    * @protected
    */
    this.blendModeMap = {
        "NORMAL": [0, 'source-over'],
        "ADD": [1, 'lighter'],
        "MULTIPLY": [2 , (useNew) ? 'multiply' : 'source-over'],
        "SCREEN": [3, (useNew) ? 'screen' : 'source-over'],
        "OVERLAY": [4, (useNew) ? 'overlay' : 'source-over'],
        "DARKEN": [5, (useNew) ? 'darken' : 'source-over'],
        "LIGHTEN": [6, (useNew) ? 'lighten' : 'source-over'],
        "COLOR_DODGE": [7, (useNew) ? 'color-dodge' : 'source-over'],
        "COLOR_BURN": [8, (useNew) ? 'color-burn' : 'source-over'],
        "HARD_LIGHT": [9, (useNew) ? 'hard-light' : 'source-over'],
        "SOFT_LIGHT": [10, (useNew) ? 'soft-light' : 'source-over'],
        "DIFFERENCE": [11, (useNew) ? 'difference' : 'source-over'],
        "EXCLUSION": [12, (useNew) ? 'exclusion' : 'source-over'],
        "HUE": [13, (useNew) ? 'hue' : 'source-over'],
        "SATURATION": [14, (useNew) ? 'saturation' : 'source-over'],
        "COLOR": [15, (useNew) ? 'color' : 'source-over'],
        "LUMINOSITY": [16, (useNew) ? 'luminosity' : 'source-over']
    };

    /**
    * A local helper object which stores HSV color modes for emitter renderers to use.
    * 
    * @property {array} hsv
    * @protected
    */
    this.hsv = Phaser.Color.HSVColorWheel();

};

Phaser.ParticleStorm.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.ParticleStorm.prototype.constructor = Phaser.ParticleStorm;

/**
* A constant used for the Sprite Renderer.
* @constant
* @type {string}
*/
Phaser.ParticleStorm.SPRITE = 'sprite';

/**
* A constant used for the BitmapData based Pixel Renderer.
* @constant
* @type {string}
*/
Phaser.ParticleStorm.PIXEL = 'pixel';

/**
* A constant used for the Render Texture based Renderer.
* @constant
* @type {string}
*/
Phaser.ParticleStorm.RENDERTEXTURE = 'render texture';

/**
* A constant used for the Sprite Batch based Renderer.
* @constant
* @type {string}
*/
Phaser.ParticleStorm.SPRITE_BATCH = 'sprite batch';

/**
* A constant used for the Bitmap Data based Renderer.
* @constant
* @type {string}
*/
Phaser.ParticleStorm.BITMAP_DATA = 'bitmap data';

/**
* A constant that contains the base object properties.
* @constant
* @type {object}
*/
Phaser.ParticleStorm.BASE = { value: 0, initial: 0, delta: 0, offset: 0, control: null, calc: 0 };

/**
* A constant that contains the base 1 object properties.
* @constant
* @type {object}
*/
Phaser.ParticleStorm.BASE_1 = { value: 1, initial: 0, delta: 0, offset: 0, control: null, calc: 1 };

/**
* A constant that contains the base 255 object properties.
* @constant
* @type {object}
*/
Phaser.ParticleStorm.BASE_255 = { value: 0, initial: 0, delta: 0, offset: 0, min: 0, max: 255, control: null, calc: 0 };

/**
* A constant that contains the base 359 object properties.
* @constant
* @type {object}
*/
Phaser.ParticleStorm.BASE_359 = { value: 0, initial: 0, delta: 0, offset: 0, min: 0, max: 359, control: null, calc: 0 };

/**
* A constant that contains the null base object properties.
* @constant
* @type {object}
*/
Phaser.ParticleStorm.BASE_NULL = { value: null, initial: 0, delta: 0, offset: 0, control: null, calc: 0 };

/**
* A constant that contains the base object used by the emit property.
* @constant
* @type {object}
*/
Phaser.ParticleStorm.BASE_EMIT = { name: null, value: 0, initial: 0, control: null, at: null, inherit: true, offsetX: 0, offsetY: 0 };

Phaser.ParticleStorm.Controls = {};

Phaser.ParticleStorm.Zones = {};

/**
* Creates a new Particle Emitter. You can specify the type of renderer the emitter will use. By default it uses
* the Sprite emitter, meaning each particle it creates is its own sprite object.
*
* `this.manager = this.game.plugins.add(Phaser.ParticleStorm);`
* `this.emitter = this.manager.createEmitter();`
* 
* The emitter is added to the ParticleStorm.emitters array and is updated every frame.
*
* @method Phaser.ParticleStorm#createEmitter
* @param {Phaser.ParticleStorm.SPRITE|Phaser.ParticleStorm.PIXEL|Phaser.ParticleStorm.RENDERTEXTURE|Phaser.ParticleStorm.SPRITE_BATCH} [renderType=Phaser.ParticleStorm.SPRITE] - The Particle Renderer type constant.
* @param {Phaser.Point} [force] - Amount of force to be applied to all particles every update.
* @param {Phaser.Point} [scrollSpeed] - All particles can be scrolled. This offsets their positions by the amount in this Point each update.
*     This is different to force which is applied as a velocity on the particle, where-as scrollSpeed directly adjusts their final position.
* @return {Phaser.ParticleStorm.Emitter} The Emitter object.
*/
Phaser.ParticleStorm.prototype.createEmitter = function (renderType, force, scrollSpeed) {

    var emitter = new Phaser.ParticleStorm.Emitter(this, renderType, force, scrollSpeed);

    this.emitters.push(emitter);

    return emitter;

};

/**
* Removes the given Particle Emitter from the plugin. Stops it from being updated.
*
* Note that this does not destroy the emitter, or any objects it may in turn have created.
*
* @method Phaser.ParticleStorm#removeEmitter
* @param {Phaser.ParticleStorm.Emitter} emitter - The Emitter object you wish to remove.
*/
Phaser.ParticleStorm.prototype.removeEmitter = function (emitter) {

    for (var i = 0; i < this.emitters.length; i++)
    {
        if (this.emitters[i] === emitter)
        {
            this.emitters.splice(i, 1);
            return;
        }
    }

};

/**
* Particle Storm works by taking a specially formatted JavaScript object that contains all of the settings the
* emitter needs to emit a particle. The settings objects each have a unique string-based key and are stored
* within the plugin itself, making them available for any Emitter to access.
*
* You can either pass in a JavaScript object to this method, or a string. If you pass a string it will use that
* to look in the Phaser.Cache for a matching JSON object and use that instead, allowing you to externally load
* particle data rather than create it all at run-time. If you are loading JSON data from the cache then you can
* also provide an array of strings, and it will load each of them in turn. Note that when doing this the `obj`
* argument is ignored.
*
* @method Phaser.ParticleStorm#addData
* @param {string|array} key - The unique key for this set of particle data. If no `obj` argument is provided it will use
*     Phaser.Cache.getJSON to try and get a matching entry. Can be either a string or an Array of strings.
*     When using an array of strings the `obj` argument is ignored.
* @param {object} [obj] - The particle data. This is optional and if not provided the `key` argument will be used to look
*     for the data in the Phaser.Cache. If provided it will be used instead of looking in the Cache.
*     This should be a well formed object matching the ParticleStorm object structure.
*     A reference to the object is stored internally, so if you manipulate the original object all freshly emitted particles
*     will use the new values. To avoid this you can use `ParticleStorm.cloneData` instead.
* @return {Phaser.ParticleStorm} This ParticleManager.
*/
Phaser.ParticleStorm.prototype.addData = function (key, obj) {

    if (key === undefined)
    {
        return this;
    }

    if (Array.isArray(key))
    {
        for (var i = 0; i < key.length; i++)
        {
            this.dataList[key[i]] = this.game.cache.getJSON(key[i]);
        }
    }
    else
    {
        if (obj !== undefined)
        {
            this.dataList[key] = obj;
        }
        else
        {
            this.dataList[key] = this.game.cache.getJSON(key);
        }
    }

    return this;

};

/**
* Gets the particle data based on the given key.
*
* @method Phaser.ParticleStorm#getData
* @memberOf Phaser.ParticleStorm
* @param {string} [key] - The unique key of the particle data that was added.
* @return {object} The particle data.
*/
Phaser.ParticleStorm.prototype.getData = function (key) {

    return this.dataList[key];

};

/**
* Clears particle data sets from memory.
* 
* You can provide a specific key, or array of keys to remove.
* 
* If no key is provided it will remove all data sets currently held.
*
* @method Phaser.ParticleStorm#clearData
* @memberOf Phaser.ParticleStorm
* @param {string|array} [key] - A string or array of strings that map to the data to be removed. If not provided all data sets are removed.
* @return {Phaser.ParticleStorm} This ParticleManager.
*/
Phaser.ParticleStorm.prototype.clearData = function (key) {

    if (key === undefined)
    {
        //  Nuke them all
        this.dataList = {};
    }
    else
    {
        if (Array.isArray(key))
        {
            for (var i = 0; i < key.length; i++)
            {
                delete this.dataList[key[i]];
            }
        }
        else
        {
            delete this.dataList[key];
        }
    }

    return this;

};

/**
* This method works in exactly the same way as ParticleStorm.addData, with the exception that clones of
* the particle data objects are stored internally, instead of references to the original objects.
* 
* @method Phaser.ParticleStorm#cloneData
* @memberOf Phaser.ParticleStorm
* @param {string|array} key - The unique key for this set of particle data. If no `obj` argument is provided it will use
*     Phaser.Cache.getJSON to try and get a matching entry. Can be either a string or an Array of strings.
*     When using an array of strings the `obj` argument is ignored.
* @param {object} [obj] - The particle data. This is optional and if not provided the `key` argument will be used to look
*     for the data in the Phaser.Cache. If provided it will be used instead of looking in the Cache.
*     This should be a well formed object matching the ParticleStorm object structure.
*     The settings object, whether from the Cache or given as an argument, is cloned before being stored locally.
*     If you wish to add a reference to an object instead of cloning it then see `addData`.
* @return {Phaser.ParticleStorm} This ParticleManager.
*/
Phaser.ParticleStorm.prototype.cloneData = function (key, obj) {

    if (key === undefined)
    {
        return this;
    }

    if (Array.isArray(key))
    {
        for (var i = 0; i < key.length; i++)
        {
            this.dataList[key[i]] = Phaser.Utils.extend(true, this.game.cache.getJSON(key[i]));
        }
    }
    else
    {
        if (obj !== undefined)
        {
            this.dataList[key] = Phaser.Utils.extend(true, obj);
        }
        else
        {
            this.dataList[key] = Phaser.Utils.extend(true, this.game.cache.getJSON(key));
        }
    }

    return this;

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Point Zone. This is a zone consisting of a single coordinate from which particles
* are emitted.
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createPointZone
* @memberOf Phaser.ParticleStorm
* @param {number} [x=0] - The x coordinate of the zone.
* @param {number} [y=0] - The y coordinate of the zone.
* @return {Phaser.ParticleStorm.Zones.Point} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createPointZone = function (x, y) {

    return new Phaser.ParticleStorm.Zones.Point(this.game, x, y);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Line Zone. This is a zone consisting of two sets of points, the start
* and end of the line respectively. Particles can be emitted from anywhere on this line segment.
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createLineZone
* @memberOf Phaser.ParticleStorm
* @param {number} [x1=0] - The x coordinate of the start of the line.
* @param {number} [y1=0] - The y coordinate of the start of the line.
* @param {number} [x2=0] - The x coordinate of the end of the line.
* @param {number} [y2=0] - The y coordinate of the end of the line.
* @return {Phaser.ParticleStorm.Zones.Line} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createLineZone = function (x1, y1, x2, y2) {

    return new Phaser.ParticleStorm.Zones.Line(this.game, x1, y1, x2, y2);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Rectangle Zone. This is a zone consisting of a rectangle shape.
* Particles can be emitted from anywhere within this rectangle.
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createRectangleZone
* @memberOf Phaser.ParticleStorm
* @param {number} [width=0] - The width of the Rectangle. Should always be a positive value.
* @param {number} [height=0] - The height of the Rectangle. Should always be a positive value.
* @return {Phaser.ParticleStorm.Zones.Rectangle} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createRectangleZone = function (width, height) {

    return new Phaser.ParticleStorm.Zones.Rectangle(this.game, width, height);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Circle Zone. This is a zone consisting of a circle shape.
* Particles can be emitted from anywhere within this circle.
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createCircleZone
* @memberOf Phaser.ParticleStorm
* @param {number} [radius=0] - The radius of the circle.
* @return {Phaser.ParticleStorm.Zones.Circle} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createCircleZone = function (radius) {

    return new Phaser.ParticleStorm.Zones.Circle(this.game, radius);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Ellipse Zone. This is a zone consisting of an ellipse shape.
* Particles can be emitted from anywhere within this ellipse.
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createEllipseZone
* @memberOf Phaser.ParticleStorm
* @param {number} [width=0] - The overall width of this ellipse.
* @param {number} [height=0] - The overall height of this ellipse.
* @return {Phaser.ParticleStorm.Zones.Ellipse} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createEllipseZone = function (width, height) {

    return new Phaser.ParticleStorm.Zones.Ellipse(this.game, width, height);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Linear Spline Zone. A Linear Spline consists of a set of points through
* which a linear path is constructed. Particles can be emitted anywhere along this path.
* 
* The points can be set from a variety of formats:
*
* - An array of Point objects: `[new Phaser.Point(x1, y1), ...]`
* - An array of objects with public x/y properties: `[ { x: 0, y: 0 }, ...]`
* - An array of objects with public x/y properties: `[obj1, obj2, ...]`
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createLinearSplineZone
* @memberOf Phaser.ParticleStorm
* @param {number} [resolution=1000] - The resolution of the spline. Higher values generate more points during path interpolation.
* @param {boolean} [closed=true] - A closed path loops from the final point back to the start again.
* @param {Phaser.Point[]|number[]|...Phaser.Point|...number} points - An array of points to use for the spline.
*        These can also be set later via `ParticleStorm.Zones.Spline.setTo`.
* @return {Phaser.ParticleStorm.Zones.Spline} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createLinearSplineZone = function (resolution, closed, points) {

    return new Phaser.ParticleStorm.Zones.Spline(this.game, 0, resolution, closed, points);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Bezier Spline Zone. A Bezier Spline consists of a set of points through
* which a bezier curved path is constructed. Particles can be emitted anywhere along this path.
* 
* The points can be set from a variety of formats:
*
* - An array of Point objects: `[new Phaser.Point(x1, y1), ...]`
* - An array of objects with public x/y properties: `[ { x: 0, y: 0 }, ...]`
* - An array of objects with public x/y properties: `[obj1, obj2, ...]`
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createBezierSplineZone
* @memberOf Phaser.ParticleStorm
* @param {number} [resolution=1000] - The resolution of the spline. Higher values generate more points during path interpolation.
* @param {boolean} [closed=true] - A closed path loops from the final point back to the start again.
* @param {Phaser.Point[]|number[]|...Phaser.Point|...number} points - An array of points to use for the spline.
*        These can also be set later via `ParticleStorm.Zones.Spline.setTo`.
* @return {Phaser.ParticleStorm.Zones.Spline} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createBezierSplineZone = function (resolution, closed, points) {

    return new Phaser.ParticleStorm.Zones.Spline(this.game, 1, resolution, closed, points);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Catmull Rom Spline Zone. A Catmull Spline consists of a set of points through
* which a catmull curved path is constructed. Particles can be emitted anywhere along this path.
* 
* The points can be set from a variety of formats:
*
* - An array of Point objects: `[new Phaser.Point(x1, y1), ...]`
* - An array of objects with public x/y properties: `[ { x: 0, y: 0 }, ...]`
* - An array of objects with public x/y properties: `[obj1, obj2, ...]`
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createCatmullSplineZone
* @memberOf Phaser.ParticleStorm
* @param {number} [resolution=1000] - The resolution of the spline. Higher values generate more points during path interpolation.
* @param {boolean} [closed=true] - A closed path loops from the final point back to the start again.
* @param {Phaser.Point[]|number[]|...Phaser.Point|...number} points - An array of points to use for the spline.
*        These can also be set later via `ParticleStorm.Zones.Spline.setTo`.
* @return {Phaser.ParticleStorm.Zones.Spline} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createCatmullSplineZone = function (resolution, closed, points) {

    return new Phaser.ParticleStorm.Zones.Spline(this.game, 2, resolution, closed, points);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Spline Zone. A spline consists of a set of points through
* which a path is constructed. Particles can be emitted anywhere along this path.
* 
* The points can be set from a variety of formats:
*
* - An array of Point objects: `[new Phaser.Point(x1, y1), ...]`
* - An array of objects with public x/y properties: `[ { x: 0, y: 0 }, ...]`
* - An array of objects with public x/y properties: `[obj1, obj2, ...]`
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createSplineZone
* @memberOf Phaser.ParticleStorm
* @param {integer} [mode=0] - The type of spline to create. 0 = linear, 1 = bezier and 2 = catmull.
* @param {number} [resolution=1000] - The resolution of the spline. Higher values generate more points during path interpolation.
* @param {boolean} [closed=true] - A closed path loops from the final point back to the start again.
* @param {Phaser.Point[]|number[]|...Phaser.Point|...number} points - An array of points to use for the spline.
*        These can also be set later via `ParticleStorm.Zones.Spline.setTo`.
* @return {Phaser.ParticleStorm.Zones.Spline} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createSplineZone = function (mode, resolution, closed, points) {

    return new Phaser.ParticleStorm.Zones.Spline(this.game, mode, resolution, closed, points);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates a Text Zone. This is a zone consisting of a Phaser.Text object.
* Particles can be emitted from anywhere within the Text object.
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createTextZone
* @memberOf Phaser.ParticleStorm
* @param {Phaser.Text} text - The Text object that is used to create this zone.
* @return {Phaser.ParticleStorm.Zones.Text} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createTextZone = function (text) {

    return new Phaser.ParticleStorm.Zones.Text(this.game, text);

};

/**
* Zones allow you to define an area within which particles can be emitted.
*
* This method creates an Image Zone. This is a zone consisting of an image which certain types of
* Emitter renderer can read from in order to extract pixel data, which can then be used to tint
* or otherwise modify the properties of the particles if emits.
*
* All zones extend Phaser.ParticleStorm.Zones.Base, which you can use to create your own custom
* zones if required.
* 
* @method Phaser.ParticleStorm#createImageZone
* @memberOf Phaser.ParticleStorm
* @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapData|Image|HTMLCanvasElement|string} key - The object that 
*     will be used to create this Image zone. If you give a string it will try and find the Image in the Game.Cache first.
* @return {Phaser.ParticleStorm.Zones.Image} The zone that was created.
*/
Phaser.ParticleStorm.prototype.createImageZone = function (key) {

    return new Phaser.ParticleStorm.Zones.Image(this.game, key);

};

/**
* Update all emitters in this plugin. Only emitters that have `enabled` set will be updated.
* 
* You can tell an emitter to never be updated by the plugin by setting its `manualUpdate` property
* to `true`. This allows you to update it as you see fit, rather than have the plugin do it
* automatically.
*
* Set ParticleStorm.active to `false` to stop the plugin from updating _all_ emitters.
*
* @method Phaser.ParticleStorm#update
* @memberOf Phaser.ParticleStorm
* @protected
*/
Phaser.ParticleStorm.prototype.update = function () {

    if (!this.active)
    {
        return;
    }

    for (var i = 0; i < this.emitters.length; i++)
    {
        if (this.emitters[i].enabled && !this.emitters[i].manualUpdate)
        {
            this.emitters[i].update();
        }
    }

};

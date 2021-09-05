/**
* @author       Richard Davey <rich@photonstorm.com>
* @author       Pete Baron <pete@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link http://choosealicense.com/licenses/no-license/|No License}
*/

/**
 * A collection of common functions.
 *
 * @class Phaser.ParticleStorm.Graph
 * @static
 */
Phaser.ParticleStorm.Graph = {

    /**
    * A constant used for the Linear control sets.
    * @constant
    * @type {array}
    */
    CONTROL_LINEAR: [ { x: 0, y: 1 }, { x: 1, y: 0 } ],

    /**
    * A constant used for the reversed linear control sets.
    * @constant
    * @type {array}
    */
    CONTROL_REVERSE: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],

    /**
    * A constant used for yoyo'd linear control sets.
    * @constant
    * @type {array}
    */
    CONTROL_YOYO: [ { x: 0, y: 0 }, { x: 0.5, y: 1 }, { x: 1, y: 0 } ],

    /**
    * Get the control value by linear interpolation of points in the control array
    * for the current percent "x" value.
    * 
    * NOTE: The control array must contain at least points with x = 0 and x = 1, 
    * other points may lie between those.
    *
    * @method Phaser.ParticleStorm.Graph#getControlValue
    * @param {object} control - The control curve for a parameter.
    * @param {number} percent - A value between 0 and 1.
    * @return {number} The control value at 'percent'.
    */
    getControlValue: function (control, percent) {

        var index = 0;
        var point = control[index];

        if (point.x === percent)
        {
            return point.y;
        }

        while (point.x <= percent)
        {
            if (index >= control.length - 1)
            {
                return point.x;
            }

            point = control[++index];
        }

        var prev = control[index - 1];

        //  Linear interpolation: f(x) = y0 + (y1 - y0) * (x - x0) / (x1 - x0)
        return prev.y + (percent - prev.x) * (point.y - prev.y) / (point.x - prev.x);

    },

    /**
    * Create a list of all control values between the start and end times given.
    *
    * @method Phaser.ParticleStorm.Graph#getControlValues
    * @param {object} control - The control graph.
    * @param {number} previousPercent - The starting "x" value.
    * @param {number} nowPercent - The ending "x" value.
    * @return {array} An array of point objects: {x: number, y: number}[]
    */
    getControlValues: function (control, previousPercent, nowPercent) {

        // create a list containing the starting point at previousPercent, interpolated if necessary
        var firsty = Phaser.ParticleStorm.Graph.getControlValue(control, previousPercent);
        var points = [ { x: previousPercent, y: firsty } ];

        // no time has elapsed, that's all she wrote
        if (previousPercent >= nowPercent)
        {
            return points;
        }

        // scan the control array for x values between previousPercent and nowPercent, add them to the list
        for (var i = 0; i < control.length; i++)
        {
            if (control[i].x > previousPercent)
            {
                if (control[i].x < nowPercent)
                {
                    points.push(control[i]);
                }
                else
                {
                    // early out, array is in ascending order so there's no need to search the rest
                    break;
                }
            }
        }

        // push the terminal point at nowPercent, interpolated if necessary
        points.push({ x: nowPercent, y: Phaser.ParticleStorm.Graph.getControlValue(control, nowPercent) });

        return points;

    },

    /**
    * Get a value for the area under a control graph (if there is one on param)
    * Otherwise just return the "value" field of param.
    *
    * @method Phaser.ParticleStorm.Graph#getParamArea
    * @param {object} param - The parameter to evaluate.
    * @param {number} previousPercent - The life percent to begin the calculation from (0 .. 1).
    * @param {number} nowPercent - The life percent where the calculation ends (0 .. 1).
    * @return {number} The area found.
    */
    getParamArea: function (param, previousPercent, nowPercent) {

        if (param.control)
        {
            return param.value * Phaser.ParticleStorm.Graph.getControlArea(param.control, previousPercent, nowPercent);
        }

        return param.value;

    },

    /**
    * Calculate the area under a graph between two points.
    *
    * @method Phaser.ParticleStorm.Graph#getControlArea
    * @param {object} control - The graph definition as a list of objects with "x" and "y" fields.
    * @param {number} previousPercent - The starting "x" value.
    * @param {number} nowPercent - The ending "x" value.
    * @return {number} The area.
    */
    getControlArea: function (control, previousPercent, nowPercent) {

        // find all the points where the control array changes slope (including the points at previousPercent and nowPercent)
        var points = Phaser.ParticleStorm.Graph.getControlValues(control, previousPercent, nowPercent);

        if (previousPercent >= nowPercent)
        {
            return points[0].y;
        }

        // the total area under the lines is the sum areas of each trapezoid formed by a line segment, two verticals and the (y = 0) axis
        //
        //    /|\ __
        //   /A|B|C |
        //  |__|_|__|
        //
        var area = points.length > 1 ? 0 : points.y;
        var prev = points[0];

        for (var i = 1; i < points.length; i++)
        {
            var next = points[i];
            // area of a trapezoid is .5 * b * (h1 + h2)
            area += 0.5 * (next.x - prev.x) * (prev.y + next.y);
            prev = next;
        }

        return area;

    },

    /**
    * Return a value for an object which has an "initial" field.
    * The field can be either a number or a min-max range.
    * 
    * Number (eg. 1900.123)
    * Range (eg. { "min":-4.0, "max":123.45 })
    * Object with initial Number (eg. { "initial": 1900.123, ... })
    * Object with initial Range (eg. { "initial": { "min":-4.0, "max":123.45 }, ... })
    * Object without initial value at all (returns 0)
    * 
    * If there is no "initial" field, this function will return 0.
    *
    * @method Phaser.ParticleStorm.Graph#getMinMaxInitial
    * @param {object} object - The object to evaluate.
    * @return {number} The value found or zero if not found.
    */
    getMinMaxInitial: function (object) {

        if (object.initial !== undefined)
        {
            return Phaser.ParticleStorm.Graph.getMinMax(object.initial);
        }
        else
        {
            return 0;
        }

    },

    /**
    * Checks if the given value is numeric or not.
    *
    * @method Phaser.ParticleStorm.Graph#isNumeric
    * @param {object|number} n - The value to be checked.
    * @return {boolean} True if the value given is numeric, otherwise false.
    */
    isNumeric: function (n) {

        return !isNaN(parseFloat(n)) && isFinite(n);

    },

    /**
    * Pick a random number in the range between "min" and "max".
    * If the 'value' is not an object with "min" and "max" in it, return 'value'.
    *
    * @method Phaser.ParticleStorm.Graph#getMinMax
    * @param {object|number} value - An object with "min" and "max" values, or a plain number.
    * @return {number} The number picked.
    */
    getMinMax: function (value) {

        if (value !== undefined && value !== null && value.min !== undefined && value.max !== undefined)
        {
            return value.min + Math.random() * (value.max - value.min);
        }

        return value;

    },

    /**
    * Takes a source and destination graph control object and copies the values from `src` to `dest`.
    *
    * @method Phaser.ParticleStorm.Graph#clone
    * @param {object} src - The source control object from which the values are copied.
    * @param {object} dest - The destination control object into which the values are set.
    * @return {object} The destination object.
    */
    clone: function (src, dest) {

        dest.value = src.value;
        dest.initial = src.initial;
        dest.delta = src.delta;
        dest.offset = src.offset;
        dest.min = src.min;
        dest.max = src.max;
        dest.control = src.control;

        return dest;

    },

    /**
    * Takes a particle data setting and extracts just its value and control properties.
    *
    * @method Phaser.ParticleStorm.Graph#fromControl
    * @param {number|object} data - The source value or object from which the values are extracted.
    * @param {object} obj - The destination control object into which the values are set.
    */
    fromControl: function (data, obj) {

        if (data.value !== undefined)
        {
            obj.value = Phaser.ParticleStorm.Graph.getMinMax(data.value);
        }

        if (data.control)
        {
            if (data.control === 'linear')
            {
                obj.control = Phaser.ParticleStorm.Graph.CONTROL_LINEAR;
            }
            else if (data.control === 'reverse')
            {
                obj.control = Phaser.ParticleStorm.Graph.CONTROL_REVERSE;
            }
            else if (data.control === 'yoyo')
            {
                obj.control = Phaser.ParticleStorm.Graph.CONTROL_YOYO;
            }
            else
            {
                //  Reference the original object - could use Object.create here, but would rather
                //  save some memory and just use references.
                obj.control = data.control;
            }
        }

    },

    /**
    * Takes a particle data setting and extracts its values into the graph control object.
    *
    * @method Phaser.ParticleStorm.Graph#fromData
    * @param {number|object} data - The source value or object from which the values are extracted.
    * @param {object} obj - The destination control object into which the values are set.
    * @return {boolean} True if it was able to extract any data, false if it couldn't find any.
    */
    fromData: function (data, obj) {

        if (data === undefined || data === null)
        {
            return false;
        }

        if (typeof data === 'number')
        {
            obj.value = data;
            return true;
        }

        if (data.min !== undefined)
        {
            //  Allows you to do: rotation: { min: 0, max: 90 }
            //  assumes assignment to the value property only.
            obj.value = Phaser.ParticleStorm.Graph.getMinMax(data);
        }
        else if (data.value !== undefined)
        {
            //  Allows rotation: { value: { min: 0, max: 90 } }
            obj.value = Phaser.ParticleStorm.Graph.getMinMax(data.value);
        }

        if (data.initial !== undefined)
        {
            obj.initial = Phaser.ParticleStorm.Graph.getMinMax(data.initial);
        }

        if (data.delta !== undefined)
        {
            obj.delta = Phaser.ParticleStorm.Graph.getMinMax(data.delta);
        }

        if (data.offset !== undefined)
        {
            obj.offset = Phaser.ParticleStorm.Graph.getMinMax(data.offset);
        }

        if (data.control)
        {
            if (data.control === 'linear')
            {
                obj.control = Phaser.ParticleStorm.Graph.CONTROL_LINEAR;
            }
            else if (data.control === 'reverse')
            {
                obj.control = Phaser.ParticleStorm.Graph.CONTROL_REVERSE;
            }
            else if (data.control === 'yoyo')
            {
                obj.control = Phaser.ParticleStorm.Graph.CONTROL_YOYO;
            }
            else
            {
                //  Reference the original object - could use Object.create here, but would rather
                //  save some memory and just use references.
                obj.control = data.control;
            }
        }

        return true;

    },

    /**
    * Return the value of this parameter object.
    * 
    * Get the control value by linear interpolation of points in the control array for the current percent "x" value.
    * 
    * NOTE: The control array must contain at least points with x = 0 and x = 1, other points may lie between those
    *
    * @method Phaser.ParticleStorm.Graph#getValue
    * @param {number|object} obj - The source graph control object from which the value is extracted.
    * @param {number} percent - The current lifePercent value of a particle.
    * @return {number} The value of the parameter object at this point in the particles life.
    */
    getValue: function (obj, percent) {

        if (!obj.control || percent === undefined)
        {
            return obj.value;
        }

        var point = obj.control[0];

        //  Very start of the graph?
        if (point.x === percent)
        {
            return point.y;
        }

        var index = obj.control.length - 1;

        //  Very end of the graph?
        var last = obj.control[index];

        if (last.x === percent)
        {
            return last.y;
        }

        index = 0;

        while (point.x <= percent)
        {
            if (index >= obj.control.length - 1)
            {
                return point.y;
            }

            point = obj.control[++index];
        }

        var prev = obj.control[index - 1];

        //  Linear interpolation: f(x) = y0 + (y1 - y0) * (x - x0) / (x1 - x0)
        return obj.value * (prev.y + (percent - prev.x) * (point.y - prev.y) / (point.x - prev.x));

    },

    /**
    * Return the value of this parameter object, clamped to be within the range obj.min to obj.max.
    * 
    * Get the control value by linear interpolation of points in the control array for the current percent "x" value.
    * 
    * NOTE: The control array must contain at least points with x = 0 and x = 1, other points may lie between those
    *
    * @method Phaser.ParticleStorm.Graph#getClampedValue
    * @param {number|object} obj - The source graph control object from which the value is extracted.
    * @param {number} percent - The current lifePercent value of a particle.
    * @return {number} The clammped value of the parameter object at this point in the particles life.
    */
    getClampedValue: function (obj, percent) {

        return Phaser.Math.clamp(Math.floor(obj.initial + this.getValue(obj, percent)), obj.min, obj.max);

    }

};

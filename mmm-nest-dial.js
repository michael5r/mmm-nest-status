var mmmNestDial = (function() {

    // create an element with proper SVG namespace, optionally setting its attributes and appending it to another element
    function createSVGElement(tag, attributes, appendTo) {
        var element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        attr(element, attributes);
        if (appendTo) {
            appendTo.appendChild(element);
        }
        return element;
    }

    // set attributes for an element
    function attr(element,attrs) {
        for (var i in attrs) {
            element.setAttribute(i,attrs[i]);
        }
    }

    // rotate a cartesian point about given origin by X degrees
    function rotatePoint(point, angle, origin) {
        var radians = angle * Math.PI/180;
        var x = point[0]-origin[0];
        var y = point[1]-origin[1];
        var x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
        var y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
        return [x1,y1];
    }

    // rotate an array of cartesian points about a given origin by X degrees
    function rotatePoints(points, angle, origin) {
        return points.map(function(point) {
            return rotatePoint(point, angle, origin);
        });
    }

    // given an array of points, return an SVG path string representing the shape they define
    function pointsToPath(points) {
        return points.map(function(point, iPoint) {
            return (iPoint > 0 ? 'L' : 'M') + point[0] + ' ' + point[1];
        }).join(' ') + 'Z';
    }

    // restrict a number to a min + max range
    function restrictToRange(val,min,max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }

    // round a number to the nearest 0.5
    function roundHalf(num) {
        return Math.round(num * 2)/2;
    }

    // build the circular dial
    return function(targetElement, options) {

        var self = this;

        // options
        options = options || {};
        options = {
            temperatureScale: options.temperatureScale || 'F',
            size: options.size || 'large',
            minValue: (options.temperatureScale === 'F') ? 50 : 10,
            maxValue: (options.temperatureScale === 'F') ? 90 : 30,
            hasLeaf: options.hasLeaf || false,
            targetTemp: options.targetTemp ? restrictTargetTemperature(+options.targetTemp) : options.minValue,
            targetTempCool: options.targetTempCool || options.minValue,
            targetTempHeat: options.targetTempHeat || options.maxValue,
            ambientTemp: options.ambientTemp ? roundHalf(+options.ambientTemp) : options.minValue,
            ecoTempLow: options.ecoTempLow || options.minValue,
            ecoTempHigh: options.ecoTempHigh || options.maxValue,
            isEcoMode: options.isEcoMode || false,
            isOffMode: options.isOffMode || false,
            isHeatCoolMode: options.isHeatCoolMode || false
        };

        // default options are for the `large` size
        var circleDiameter = 240;    // container size
        var numTicks = 120;          // number of ticks around the circle
        var tickOffset = 9;          // ambient temp marker tick size
        var tickRadius = 0.75;       // thickness of regular ticks
        var tickRadiusLarge = 2;     // thickness of marker ticks

        if (options.size === 'medium') {
            circleDiameter = 160;
            numTicks = 80;
            tickOffset = 6;
            tickRadius = 0.75;
            tickRadiusLarge = 1;
        } else if (options.size === 'small') {
            circleDiameter = 80;
            numTicks = 40;
            tickOffset = 3;
            tickRadius = 1;
            tickRadiusLarge = 1;
        }

        // used for offsetting the ambient temperature text correctly
        var labelPosArr = {
            right: [
                { ft: 50, ct: 10,   x: -3.00, y: -4.00 },
                { ft: 51, ct: 10.5, x: -3.00, y: -4.00 },
                { ft: 52, ct: 11,   x: -2.50, y: -3.25 },
                { ft: 53, ct: 11.5, x: -2.00, y: -2.50 },
                { ft: 54, ct: 12,   x: -1.50, y: -1.75 },
                { ft: 55, ct: 12.5, x: -1.00, y: -1.00 },
                { ft: 56, ct: 13,   x: -0.60, y: -1.20 },
                { ft: 57, ct: 13.5, x: -0.20, y: -1.40 },
                { ft: 58, ct: 14,   x: 0.20,  y: -1.60 },
                { ft: 59, ct: 14.5, x: 0.60,  y: -1.80 },
                { ft: 60, ct: 15,   x: 1.00,  y: -2.00 },
                { ft: 61, ct: 15.5, x: 1.60,  y: -1.80 },
                { ft: 62, ct: 16,   x: 2.20,  y: -1.60 },
                { ft: 63, ct: 16.5, x: 2.80,  y: -1.40 },
                { ft: 64, ct: 17,   x: 3.60,  y: -1.20 },
                { ft: 65, ct: 17.5, x: 4.00,  y: -1.00 },
                { ft: 66, ct: 18,   x: 3.80,  y: -0.60 },
                { ft: 67, ct: 18.5, x: 3.60,  y: -0.20 },
                { ft: 68, ct: 19,   x: 3.40,  y: 0.20 },
                { ft: 69, ct: 19.5, x: 3.20,  y: 0.60 },
                { ft: 70, ct: 20,   x: 3.00,  y: 1.00 },   // <- middle of dial
                { ft: 71, ct: 20.5, x: 3.20,  y: 1.60 },
                { ft: 72, ct: 21,   x: 3.40,  y: 2.20 },
                { ft: 73, ct: 21.5, x: 3.60,  y: 2.80 },
                { ft: 74, ct: 22,   x: 3.80,  y: 3.40 },
                { ft: 75, ct: 22.5, x: 4.00,  y: 4.00 },
                { ft: 76, ct: 23,   x: 3.40,  y: 3.80 },
                { ft: 77, ct: 23.5, x: 2.80,  y: 3.60 },
                { ft: 78, ct: 24,   x: 2.20,  y: 3.40 },
                { ft: 79, ct: 24.5, x: 1.60,  y: 3.20 },
                { ft: 80, ct: 25,   x: 1.00,  y: 3.00 },
                { ft: 81, ct: 25.5, x: 0.60,  y: 3.20 },
                { ft: 82, ct: 26,   x: 0.20,  y: 3.40 },
                { ft: 83, ct: 26.5, x: -0.20, y: 3.60 },
                { ft: 84, ct: 27,   x: -0.60, y: 3.80 },
                { ft: 85, ct: 27.5, x: -1.00, y: 4.00 },
                { ft: 86, ct: 28,   x: -1.50, y: 3.25 },
                { ft: 87, ct: 28.5, x: -2.00, y: 2.50 },
                { ft: 88, ct: 29,   x: -2.50, y: 1.75 },
                { ft: 89, ct: 29.5, x: -3.00, y: 1.00 },
                { ft: 90, ct: 30,   x: -3.00, y: 1.00 }
            ],
            left: [
                { ft: 50, ct: 10,   x: 3.00,  y: 1.00 },
                { ft: 51, ct: 10.5, x: 3.00,  y: 1.00 },
                { ft: 52, ct: 11,   x: 2.50,  y: 1.75 },
                { ft: 53, ct: 11.5, x: 2.00,  y: 2.50 },
                { ft: 54, ct: 12,   x: 1.50,  y: 3.25 },
                { ft: 55, ct: 12.5, x: 1.00,  y: 4.00 },
                { ft: 56, ct: 13,   x: 0.60,  y: 3.80 },
                { ft: 57, ct: 13.5, x: 0.20,  y: 3.60 },
                { ft: 58, ct: 14,   x: -0.20, y: 3.40 },
                { ft: 59, ct: 14.5, x: -0.60, y: 3.20 },
                { ft: 60, ct: 15,   x: -1.00, y: 3.00 },
                { ft: 61, ct: 15.5, x: -1.60, y: 3.20 },
                { ft: 62, ct: 16,   x: -2.20, y: 3.40 },
                { ft: 63, ct: 16.5, x: -2.80, y: 3.60 },
                { ft: 64, ct: 17,   x: -3.40, y: 3.80 },
                { ft: 65, ct: 17.5, x: -4.00, y: 4.00 },
                { ft: 66, ct: 18,   x: -3.80, y: 3.40 },
                { ft: 67, ct: 18.5, x: -3.60, y: 2.80 },
                { ft: 68, ct: 19,   x: -3.40, y: 2.20 },
                { ft: 69, ct: 19.5, x: -3.20, y: 1.60 },
                { ft: 70, ct: 20,   x: -3.00, y: 1.00 },   // <- middle of dial
                { ft: 71, ct: 20.5, x: -3.20, y: 0.60 },
                { ft: 72, ct: 21,   x: -3.40, y: 0.20 },
                { ft: 73, ct: 21.5, x: -3.60, y: -0.20 },
                { ft: 74, ct: 22,   x: -3.80, y: -0.60 },
                { ft: 75, ct: 22.5, x: -4.00, y: -1.00 },
                { ft: 76, ct: 23,   x: -3.40, y: -1.20 },
                { ft: 77, ct: 23.5, x: -2.80, y: -1.40 },
                { ft: 78, ct: 24,   x: -2.20, y: -1.60 },
                { ft: 79, ct: 24.5, x: -1.60, y: -1.80 },
                { ft: 80, ct: 25,   x: -1.00, y: -2.00 },
                { ft: 81, ct: 25.5, x: -0.60, y: -1.80 },
                { ft: 82, ct: 26,   x: -0.20, y: -1.60 },
                { ft: 83, ct: 26.5, x: 0.20,  y: -1.40 },
                { ft: 84, ct: 27,   x: 0.60,  y: -1.20 },
                { ft: 85, ct: 27.5, x: 1.00,  y: -1.00 },
                { ft: 86, ct: 28,   x: 1.50,  y: -1.75 },
                { ft: 87, ct: 28.5, x: 2.00,  y: -2.50 },
                { ft: 88, ct: 29,   x: 2.50,  y: -3.25 },
                { ft: 89, ct: 29.5, x: 3.00,  y: -4.00 },
                { ft: 90, ct: 30,   x: 3.00,  y: -4.00 }
            ]
        };

        // properties
        var properties = {
            circleDiameter,
            numTicks,
            tickOffset,
            tickRadius,
            tickRadiusLarge,
            tickDegrees: 300, // degrees of the dial that should be covered in tick lines
            rangeValue: options.maxValue - options.minValue,
            radius: circleDiameter / 2,
            ticksOuterRadius: circleDiameter / 30,
            ticksInnerRadius: circleDiameter / 8,
            labelPosArr
        };

        properties.labelPosition = [properties.radius, properties.ticksOuterRadius-(properties.ticksOuterRadius-properties.ticksInnerRadius)/2];
        properties.offsetDegrees = 180-(360-properties.tickDegrees)/2;

        // outer circle SVG
        var svg = createSVGElement('svg', {
            width: properties.circleDiameter + 'px',
            height: properties.circleDiameter + 'px',
            viewBox: '0 0 '+ properties.circleDiameter + ' ' + properties.circleDiameter,
            class: 'dial-classic'
        }, targetElement);

        // gradients SVG
        var offGradient = createSVGElement('linearGradient', {
            id: 'dial-off-gradient',
            x2: 1,
            y2: 1
        }, svg);

        var offStop1 = createSVGElement('stop', {
            offset: '0%',
            'stop-color': '#4a535b'
        }, offGradient);

        var offStop2 = createSVGElement('stop', {
            offset: '100%',
            'stop-color': '#283037'
        }, offGradient);

        var heatingGradient = createSVGElement('linearGradient', {
            id: 'dial-heating-gradient',
            x2: 1,
            y2: 1
        }, svg);

        var heatingStop1 = createSVGElement('stop', {
            offset: '0%',
            'stop-color': '#E36304'
        }, heatingGradient);

        var heatingStop2 = createSVGElement('stop', {
            offset: '100%',
            'stop-color': '#e55928'
        }, heatingGradient);

        var coolingGradient = createSVGElement('linearGradient', {
            id: 'dial-cooling-gradient',
            x2: 1,
            y2: 1
        }, svg);

        var coolingStop1 = createSVGElement('stop', {
            offset: '0%',
            'stop-color': '#007AF1'
        }, coolingGradient);

        var coolingStop2 = createSVGElement('stop', {
            offset: '100%',
            'stop-color': '#0139ff'
        }, coolingGradient);

        // dial SVG
        var circle = createSVGElement('circle', {
            cx: properties.radius,
            cy: properties.radius,
            r: properties.radius,
            class: 'dial-circle'
        }, svg);

        // ticks SVG
        var ticks = createSVGElement('g', {
            class: 'dial-ticks'
        }, svg);

        var tickPoints = [
            [properties.radius - properties.tickRadius, properties.ticksOuterRadius],
            [properties.radius + properties.tickRadius, properties.ticksOuterRadius],
            [properties.radius + properties.tickRadius, properties.ticksInnerRadius],
            [properties.radius - properties.tickRadius, properties.ticksInnerRadius]
        ];

        var tickPointsLarge = [
            [properties.radius - properties.tickRadiusLarge, properties.ticksOuterRadius],
            [properties.radius + properties.tickRadiusLarge, properties.ticksOuterRadius],
            [properties.radius + properties.tickRadiusLarge, properties.ticksInnerRadius + properties.tickOffset],
            [properties.radius - properties.tickRadiusLarge, properties.ticksInnerRadius + properties.tickOffset]
        ];

        var theta = properties.tickDegrees/properties.numTicks;
        var tickArray = [];
        for (var iTick = 0; iTick < properties.numTicks; iTick++) {
            tickArray.push(createSVGElement('path',{d:pointsToPath(tickPoints)},ticks));
        };

        // leaf SVG
        if (options.hasLeaf) {
            var leafScale = properties.radius/5/100;
            var leafDef = ["M", 3, 84, "c", 24, 17, 51, 18, 73, -6, "C", 100, 52, 100, 22, 100, 4, "c", -13, 15, -37, 9, -70, 19, "C", 4, 32, 0, 63, 0, 76, "c", 6, -7, 18, -17, 33, -23, 24, -9, 34, -9, 48, -20, -9, 10, -20, 16, -43, 24, "C", 22, 63, 8, 78, 3, 84, "z"].map(function(x) {
                return isNaN(x) ? x : x * leafScale;
            }).join(' ');

            var translate = [properties.radius - (leafScale * 100 * 0.5),properties.radius * 1.5];
            var icoLeaf = createSVGElement('path', {
                class: 'icn-leaf',
                d: leafDef,
                transform: 'translate(' + translate[0] + ',' + translate[1] + ')'
            }, svg);
        }

        function renderTicks() {

            var vMin, vMax;

            if (options.isEcoMode) {
                vMin = options.ecoTempLow;
                vMax = options.ecoTempHigh;
            } else if (options.isHeatCoolMode) {
                vMin = options.targetTempCool;
                vMax = options.targetTempHeat;
            } else if (options.isOffMode) {
                vMin = options.ambientTemp;
                vMax = vMin;
            } else {
                vMin = Math.min(options.ambientTemp, options.targetTemp);
                vMax = Math.max(options.ambientTemp, options.targetTemp);
            }

            var min = restrictToRange(Math.round((vMin-options.minValue)/properties.rangeValue * properties.numTicks),0,properties.numTicks - 1);
            var max = restrictToRange(Math.round((vMax-options.minValue)/properties.rangeValue * properties.numTicks),0,properties.numTicks - 1);
            var amb = restrictToRange(Math.round((options.ambientTemp-options.minValue)/properties.rangeValue * properties.numTicks),0,properties.numTicks - 1);

            tickArray.forEach(function(tick,iTick) {

                var isLarge = iTick == min || iTick == max;
                var isActive = iTick >= min && iTick <= max;

                if ((options.isEcoMode) && (iTick === amb)) {
                    // in eco mode, we want a tick for the ambient temperature as well
                    isLarge = true;
                }

                var tickClass = isActive ? 'active' : '';
                tickClass += isLarge ? ' lrg' : '';

                attr(tick,{
                    d: pointsToPath(
                        rotatePoints(
                            isLarge
                                ? tickPointsLarge
                                : tickPoints,
                            iTick * theta-properties.offsetDegrees,
                            [properties.radius, properties.radius])),
                    class: tickClass
                });
            });
        }

        function renderAmbientTemperature() {

            var ambTemp = options.ambientTemp;
            var tarTemp = options.targetTemp;

            // ambient text isn't shown if ambient temperature is within 1 degree of target temperature
            // in ECO mode target temperature is ecoTempLow and ecoTempHigh

            var showAmbTemp = true;

            if (options.isEcoMode) {
                if ((ambTemp === options.ecoTempLow) || (1 + ambTemp === options.ecoTempLow) || (ambTemp === 1 + options.ecoTempLow)) {
                    showAmbTemp = false;
                } else if ((ambTemp === options.ecoTempHigh) || (1 + ambTemp === options.ecoTempHigh) || (ambTemp === 1 + options.ecoTempHigh)) {
                    showAmbTemp = false;
                }
            } else if (options.isOffMode) {
                showAmbTemp = true; // always shown in off mode
            } else if ((ambTemp === tarTemp) || (1 + ambTemp === tarTemp) || (ambTemp === 1 + tarTemp)) {
                showAmbTemp = false;
            }

            if (showAmbTemp) {

                var ambPos = 'left';
                var peggedValue = restrictToRange(ambTemp, options.minValue, options.maxValue);

                if (!options.isEcoMode) { // always shown on the left side in eco mode
                    if (peggedValue > tarTemp) {
                        ambPos = 'right';
                    } else {
                        ambPos = 'left';
                    }
                }

                // svg for ambient temperature label
                var ambData = getLabelData(ambTemp, ambPos);
                getLabelSvg(ambData.x, ambData.y, ambData.text);

            }

            if (options.isEcoMode) {

                // svg for eco low temperature label
                var ecoLowData = getLabelData(options.ecoTempLow, 'left');
                getLabelSvg(ecoLowData.x, ecoLowData.y, ecoLowData.text);

                // svg for eco high temperature label
                var ecoHighData = getLabelData(options.ecoTempHigh, 'right');
                getLabelSvg(ecoHighData.x, ecoHighData.y, ecoHighData.text);

            }

        }

        function getLabelData(val, pos) {

            var isFahrenheit = (options.temperatureScale === 'F');
            var posModsArr;
            var text = Math.floor(val);
            var valToCheck = val; // only used for checking the position array

            // to handle half degrees (only used for C temperatures)
            if (val%1 != 0) {
                text += '⁵';
                valToCheck = (!isFahrenheit) ? val + 0.5 : val;
            }

            var peggedValue = restrictToRange(val, options.minValue, options.maxValue);
            var degs = properties.tickDegrees * (peggedValue - options.minValue)/properties.rangeValue - properties.offsetDegrees;

            if (pos === 'right') {
                degs += 8;
                // ambient text is on the right
                posModsArr = properties.labelPosArr.right;
            } else {
                degs -= 8;
                // ambient text is on the left
                posModsArr = properties.labelPosArr.left;
            }

            var xMod = 0;
            var yMod = 0;

            // check position modifier from position array
            posModsArr.forEach(function(mod) {
                var valFound = isFahrenheit ? mod.ft : mod.ct;
                if (valFound === valToCheck) {
                    xMod = mod.x;
                    yMod = mod.y;
                }
            });

            var pos = rotatePoint(properties.labelPosition,degs,[properties.radius, properties.radius]);

            return {
                x: pos[0] + xMod,
                y: pos[1] + yMod,
                text
            }

        }

        function getLabelSvg(x, y, text) {

            // background text
            var labelBack = createSVGElement('text',{
                class: 'label-temp label-back',
                x,
                y
            },svg);

            var labelBackText = document.createTextNode(text);
            labelBack.appendChild(labelBackText);

            // foreground text
            var label = createSVGElement('text',{
                class: 'label-temp',
                x,
                y
            },svg);

            var labelText = document.createTextNode(text);
            label.appendChild(labelText);

        }

        function restrictTargetTemperature(t) {
            return restrictToRange(roundHalf(t),options.minValue,options.maxValue);
        }

        function angle(point) {

            var dx = point[0] - properties.radius;
            var dy = point[1] - properties.radius;
            var theta = Math.atan(dx/dy) / (Math.PI/180);

            if (point[0] >= properties.radius && point[1] < properties.radius) {
                theta = 90-theta - 90;
            } else if (point[0] >= properties.radius && point[1] >= properties.radius) {
                theta = 90-theta + 90;
            } else if (point[0] < properties.radius && point[1] >= properties.radius) {
                theta = 90-theta + 90;
            } else if (point[0] < properties.radius && point[1] < properties.radius) {
                theta = 90-theta + 270;
            }
            return theta;
        };

        renderTicks();
        renderAmbientTemperature();
    };
})();
/* global Module */

/* Magic Mirror
 * Module: mmm-nest-status
 *
 * By Michael Schmidt
 * https://github.com/michael5r
 *
 * MIT Licensed.
 */

Module.register('mmm-nest-status', {

    defaults: {
        token: '',
        displayType: 'grid',
        displayMode: 'all',
        showNames: true,
        thermostatsToShow: 'all',
        protectsToShow: 'all',
        alignment: 'left',
        groupTogether: true,
        thermostatSize: 'regular',
        protectSize: 'regular',
        protectDarkMode: false,
        protectShowOk: true,
        units: config.units,
        updateInterval: 60 * 1000,
        animationSpeed: 2 * 1000,
        initialLoadDelay: 0,
        version: '1.0.1'
    },

    getScripts: function() {
        return [
            'handlebars.runtime.min-v4.0.12.js',
            'mmm-nest-status-templates.js'
        ];
    },

    getStyles: function() {
        return [
            'mmm-nest-status.css'
        ];
    },

    start: function() {

        Log.info('Starting module: ' + this.name + ', version ' + this.config.version);

        // TODO: change, so this only happens if small protects are used with large thermostats
        // if the small protect size option is chosen, groupTogether becomes false
        // so the smaller version of the Protects are shown in their own container
        if (this.config.protectSize === 'small') {
            this.config.groupTogether = false;
        }

        this.errMsg = '';

        this.loaded = false;
        this.scheduleUpdate(this.config.initialLoadDelay);

        this.thermostats = [];
        this.protects = [];

    },

    getDom: function() {

        var displayMode = this.config.displayMode;
        var displayType = this.config.displayType;
        var alignment = this.config.alignment;
        var groupTogether = this.config.groupTogether;

        var numberOfThermostats = this.thermostats.length;
        var numberOfProtects = this.protects.length;

        var thermostatsToShow = this.config.thermostatsToShow;
        var protectsToShow = this.config.protectsToShow;

        var outer_wrapper = document.createElement('div');

        // show error message
        if (this.errMsg !== '') {
            outer_wrapper.innerHTML = this.errMsg;
            outer_wrapper.className = 'normal regular small';
            return outer_wrapper;
        }

        // show loading message
        if (!this.loaded) {
            outer_wrapper.innerHTML = 'Loading ...';
            outer_wrapper.className = 'bright light small';
            return outer_wrapper;
        }

        if ((displayType === 'list') || (displayType === 'list-id')) {
            // list mode view

            outer_wrapper.className = 'nest-wrapper list';

            // gets a list view of Nest thermostats
            if ((displayMode !== 'protect') && (numberOfThermostats > 0)) {
                outer_wrapper.appendChild(this.renderList('thermostat'));
            }

            // gets a list view of Nest protects
            if ((displayMode !== 'thermostat') && (numberOfProtects > 0)) {
                outer_wrapper.appendChild(this.renderList('protect'));
            }

        } else {
            // grid mode view

            if ((alignment === 'center') || (alignment ==='left') || (alignment ==='right')) {
                outer_wrapper.className = 'nest-wrapper ' + alignment;
            } else {
                outer_wrapper.className = 'nest-wrapper center';
            }

            // grouping or splitting apart
            var thermostat_outer_wrapper = outer_wrapper.cloneNode(false);
            var protect_outer_wrapper = outer_wrapper.cloneNode(false);
            if ((displayMode === 'all') && (!groupTogether)) {
                outer_wrapper.className = '';
            }

            // gets a grid view of Nest thermostats
            if ((displayMode !== 'protect') && (numberOfThermostats > 0)) {

                if (this.isString(thermostatsToShow)) {
                    // we only allow options of 'first' and 'all'

                    if (thermostatsToShow === 'first') {
                        thermostat_outer_wrapper.appendChild(this.renderThermostatGrid(0));
                    } else {
                        for (i = 0; i < numberOfThermostats; i++) {
                            thermostat_outer_wrapper.appendChild(this.renderThermostatGrid(i));
                        }
                    }

                } else if (this.isArray(thermostatsToShow)) {
                    // show selected thermostats

                    for (i = 0; i < thermostatsToShow.length; i++) {
                        var val = thermostatsToShow[i];
                        if ((this.isNumber(val)) && (val < numberOfThermostats)) {
                            thermostat_outer_wrapper.appendChild(this.renderThermostatGrid(val));
                        }
                    }

                }

                if ((displayMode === 'all') && (!groupTogether)) {
                    outer_wrapper.appendChild(thermostat_outer_wrapper);
                } else {
                    while (thermostat_outer_wrapper.childNodes.length > 0) {
                        outer_wrapper.appendChild(thermostat_outer_wrapper.childNodes[0]);
                    }
                }
            }

            // gets a grid view of Nest protects
            if ((displayMode !== 'thermostat') && (numberOfProtects > 0)) {

                if (this.isString(protectsToShow)) {
                    // we only allow options of 'first' and 'all'

                    if (protectsToShow === 'first') {
                        protect_outer_wrapper.appendChild(this.renderProtectGrid(0));
                    } else {
                        for (i = 0; i < numberOfProtects; i++) {
                            protect_outer_wrapper.appendChild(this.renderProtectGrid(i));
                        }
                    }

                } else if (this.isArray(protectsToShow)) {
                    // show selected protects

                    for (i = 0; i < protectsToShow.length; i++) {
                        var val = protectsToShow[i];
                        if ((this.isNumber(val)) && (val < numberOfProtects)) {
                            protect_outer_wrapper.appendChild(this.renderProtectGrid(val));
                        }
                    }

                }

                if ((displayMode === 'all') && (!groupTogether)) {
                    outer_wrapper.appendChild(protect_outer_wrapper);
                } else {
                    while (protect_outer_wrapper.childNodes.length > 0) {
                        outer_wrapper.appendChild(protect_outer_wrapper.childNodes[0]);
                    }
                }

            }
        }

        return outer_wrapper;
    },

    renderThermostatGrid: function(id) {
        // renders a single Nest thermostat

        var t = this.thermostats[id];
        var showNames = this.config.showNames;

        var thermostatSize = this.config.thermostatSize;

        var hbWrapper = document.createElement('div');
        var statusClass = '';
        var targetTemp = t.targetTemp;

        if (t.isOff) {
            if ((!t.isHeatCoolMode) && (!t.isEcoMode)) {
                if (parseInt(t.ambientTemp) < parseInt(t.targetTemp)) {
                    statusClass = 'heat';
                } else if (parseInt(t.ambientTemp) > parseInt(t.targetTemp)) {
                    statusClass = 'cool';
                } else {
                    statusClass = 'hidden';
                }
            }
        }

        if (t.isHeatCoolMode) {
            targetTemp = t.targetTempLow + '<small>&bull;</small>' + t.targetTempHigh;
        } else if (t.isEcoMode) {
            targetTemp = 'ECO';
        }

        // create handlebars data object
        var hbData = {
            id,
            name: t.name.replace(/ *\([^)]*\) */g, ''),
            classSize: (thermostatSize === 'small') ? 'sml' : 'reg',
            classState: t.hvacState,
            classMode: (t.hvacMode !== 'off') ? t.hvacMode : '',
            showNames,
            ambientTemp: t.ambientTemp,
            targetTemp,
            statusClass,
            humidity: t.humidity + '%',
            fanOn: t.fanOn,
            leafOn: t.leafOn
        };

        // generate html from template
        var hbTemplate = Handlebars.templates['grid_thermostat.hbs'];
        var hbHtml     = hbTemplate(hbData);
        hbWrapper.innerHTML = hbHtml;

        return hbWrapper.firstChild;

    },

    renderProtectGrid: function(id) {
        // renders a single Nest protect

        var p = this.protects[id];
        var showNames = this.config.showNames;
        var protectSize = this.config.protectSize;
        var protectShowOk = this.config.protectShowOk;
        var protectDarkMode = this.config.protectDarkMode;
        var protectSmallMode = protectSize === 'small';

        // if we're splitting thermostats and protects into
        // 2 different containers, the Protect title should move to the bottom
        var moveTitle = this.config.displayMode === 'all' && !this.config.groupTogether;
        var moveClass = moveTitle ? ' title-bot' : '';

        // generate status text
        var statusText = (protectShowOk && p.uiColor !== 'gray') ? 'OK' : '';
        if (p.uiColor !== 'green') {
            // add emergency or warning texts
            if ((p.coState === 'emergency') && (p.smokeState === 'emergency')) {
                statusText = '<b>Smoke & CO2</b>' + (protectSmallMode ? '' : 'Emergency');
            } else if (p.coState === 'emergency') {
                statusText = '<b>CO2</b>' + (protectSmallMode ? '' : 'Emergency');
            } else if (p.smokeState === 'emergency') {
                statusText = '<b>Smoke</b>' + (protectSmallMode ? '' : 'Emergency');
            } else if ((p.coState === 'warning') && (p.smokeState === 'warning')) {
                statusText = '<b>Smoke & CO2</b>' + (protectSmallMode ? '' : 'Warning');
            } else if (p.coState === 'warning') {
                statusText = '<b>CO2</b>' + (protectSmallMode ? '' : 'Warning');
            } else if (p.smokeState === 'warning') {
                statusText = '<b>Smoke</b>' + (protectSmallMode ? '' : 'Warning');
            } else if (p.batteryHealth === 'replace') {
                statusText = '<span class="icon-battery"></span>' + (protectSmallMode ? '' : 'Replace <b>Battery</b>');
            } else if (!p.isOnline) {
                statusText = (protectSmallMode ? '' : 'Protect') + '<b>Offline</b>';
            }
        }

        var hbWrapper = document.createElement('div');

        // create handlebars data object
        var hbData = {
            id,
            name: p.name.replace(/ *\([^)]*\) */g, ''),
            classColor: p.uiColor,
            classMove: moveTitle ? ' title-bot' : '',
            classDark: protectDarkMode ? ' dark' : '',
            classSize: (protectSize === 'small') ? 'sml' : 'reg',
            showNames,
            moveTitle,
            statusText
        };

        // generate html from template
        var hbTemplate = Handlebars.templates['grid_protect.hbs'];
        var hbHtml     = hbTemplate(hbData);
        hbWrapper.innerHTML = hbHtml;

        return hbWrapper.firstChild;

    },

    renderList: function(type) {
        // renders a list of all Nest thermostats or protects

        var displayMode = this.config.displayMode;
        var displayType = this.config.displayType;

        var isThermostat = (type === 'thermostat');
        var itemsToShow = isThermostat ? this.config.thermostatsToShow : this.config.protectsToShow;
        var numberOfItems = isThermostat ? this.thermostats.length : this.protects.length;

        var hbWrapper = document.createElement('div');

        // create handlebars data object
        var hbData = {
            type,
            showId: displayType === 'list-id',
            c2Title: isThermostat ? 'Current' : 'Battery',
            c3Title: isThermostat ? 'Target' : 'CO2',
            c4Title: isThermostat ? 'Humidity' : 'Smoke',
            tableClass: (isThermostat && (displayMode === 'all') && (this.protects.length > 0)) ? 'with-protects' : '',
            rows: []
        };

        // add rows
        if (this.isString(itemsToShow)) {
            // we only allow options of 'first' and 'all'

            if (itemsToShow === 'first') {
                hbData.rows.push(this.formatListRow(0,type));
            } else {
                for (i = 0; i < numberOfItems; i++) {
                    hbData.rows.push(this.formatListRow(i,type));
                }
            }

        } else if (this.isArray(itemsToShow)) {
            // show selected thermostats

            for (i = 0; i < itemsToShow.length; i++) {
                var val = itemsToShow[i];
                if ((this.isNumber(val)) && (val < numberOfItems)) {
                    hbData.rows.push(this.formatListRow(val,type));
                }
            }

        }

        // generate html from template
        var hbTemplate = Handlebars.templates['list_table.hbs'];
        var hbHtml     = hbTemplate(hbData);
        hbWrapper.innerHTML = hbHtml;

        return hbWrapper.firstChild;

    },

    formatListRow: function(id,type) {
        // generates a single thermostat or protect object
        // only used in the list view

        var isThermostat = (type === 'thermostat');
        var item = isThermostat ? this.thermostats[id] : this.protects[id];
        var name = item.name;

        var c2Text = '';
        var c2Class = false;
        var c3Text = '';
        var c3Class = false;
        var c4Text = '';
        var c4Class = false;

        if (isThermostat) {

            c2Text = item.isEcoMode ? 'ECO' : item.ambientTemp + '&deg;';
            c3Text = item.targetTemp + '&deg;';
            c4Text = item.humidity + '%';

            if (item.isHeating) {
                c3Class = 'heating';
            } else if (item.isCooling) {
                c3Class = 'cooling';
            }

            if (item.isHeatCoolMode) {
                c3Text = item.targetTempLow + '&deg &bull; ' + item.targetTempHigh + '&deg;';
            } else if (item.isEcoMode) {
                c3Text = item.ecoTempLow + '&deg &bull; ' + item.ecoTempHigh + '&deg;';
            }

        } else {

            c2Text = item.isOnline ? item.batteryHealth.toUpperCase() : 'OFFLINE';
            c2Class = ((item.batteryHealth === 'replace') || (!item.isOnline)) ? 'warning' : false;
            c3Text = item.coState.toUpperCase();
            c3Class = item.coState;
            c4Text = item.smokeState.toUpperCase();
            c4Class = item.smokeState;

        }

        var row = {
            id,
            name,
            c2Text,
            c2Class,
            c3Text,
            c3Class,
            c4Text,
            c4Class
        };

        return row;

    },

    updateNests: function() {
        // use the Nest API to get the data

        if (this.config.token === '') {
            this.errMsg = 'Please run getToken.sh and add your Nest API token to the MagicMirror config.js file.';
            this.updateDom(this.config.animationSpeed);
        } else {

            var token = this.config.token;
            var url = 'https://developer-api.nest.com/?auth=' + token;
            var self = this;
            var xhr = new XMLHttpRequest();

            xhr.addEventListener('readystatechange', function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        if (this.response == '{}') {
                            self.errMsg = 'Token works, but no data was received.<br>Make sure you are using the master account for your Nest.';
                            self.updateDom(self.config.animationSpeed);
                        } else {
                            self.processNestData(JSON.parse(this.response));
                        }
                    } else {
                        console.log('Nest API Error: ' + this.status);
                    }
                }
            });

            xhr.open('GET', url, true);
            xhr.send();

            self.scheduleUpdate(self.updateInterval);
        }
    },

    processNestData: function(data) {

        this.thermostats = [];
        this.protects = [];
        this.awayState = 'unknown'; // 'home', 'away'

        var numberOfThermostats = (data.devices && data.devices.thermostats) ? Object.keys(data.devices.thermostats).length : 0;
        var numberOfProtects = (data.devices && data.devices.smoke_co_alarms) ? Object.keys(data.devices.smoke_co_alarms).length : 0;

        // check for away state
        if (data.devices && data.structures) {
            var sId = Object.keys(data.structures)[0];
            var sObj = data.structures[sId];
            this.awayState = sObj.away;
        }

        var displayMode = this.config.displayMode;
        var units = this.config.units;

        if ((displayMode !== 'protect') && (numberOfThermostats > 0)) {

            for (i = 0; i < numberOfThermostats; i++) {

                var tId = Object.keys(data.devices.thermostats)[i];
                var tObj = data.devices.thermostats[tId];

                var thermostat = {
                    name: tObj.name,
                    humidity: tObj.humidity,
                    fanOn: tObj.fan_timer_active, // displayed when either the fan or the humidifier is on
                    leafOn: tObj.has_leaf,        // displayed when the thermostat is set to an energy-saving temperature
                    hvacMode: tObj.hvac_mode,     // "heat", "cool", "heat-cool", "eco", "off"
                    hvacState: tObj.hvac_state,   // "heating", "cooling", "off"
                    targetTempLow: (units === 'imperial') ? tObj.target_temperature_low_f : tObj.target_temperature_low_c,
                    targetTempHigh: (units === 'imperial') ? tObj.target_temperature_high_f : tObj.target_temperature_high_c,
                    ambientTemp: (units === 'imperial') ? tObj.ambient_temperature_f : tObj.ambient_temperature_c,
                    targetTemp: (units === 'imperial') ? tObj.target_temperature_f : tObj.target_temperature_c,
                    ecoTempLow: (units === 'imperial') ? tObj.eco_temperature_low_f : tObj.eco_temperature_low_c,
                    ecoTempHigh: (units === 'imperial') ? tObj.eco_temperature_high_f : tObj.eco_temperature_high_c,
                    isHeatCoolMode: tObj.hvac_mode === 'heat-cool',
                    isEcoMode: tObj.hvac_mode === 'eco',
                    isOff: tObj.hvac_state === 'off',
                    isHeating: tObj.hvac_state === 'heating',
                    isCooling: tObj.hvac_state === 'cooling'
                }

                this.thermostats.push(thermostat);

            }

        }

        if ((displayMode !== 'thermostat') && (numberOfProtects > 0)) {

            for (i = 0; i < numberOfProtects; i++) {

                var pId = Object.keys(data.devices.smoke_co_alarms)[i];
                var pObj = data.devices.smoke_co_alarms[pId];

                var protect = {
                    name: pObj.name,
                    batteryHealth: pObj.battery_health,     // "ok", "replace"
                    coState: pObj.co_alarm_state,           // "ok", "warning", "emergency"
                    smokeState: pObj.smoke_alarm_state,     // "ok", "warning", "emergency"
                    uiColor: pObj.ui_color_state,           // "gray", "green", "yellow", "red"
                    isOnline: pObj.is_online                // true, false
                }

                this.protects.push(protect);

            }
        }

        this.loaded = true;

        if ((numberOfProtects === 0) && (numberOfThermostats === 0)) {
            this.errMsg = 'There are no Nest Thermostats or Protects in this account.';
        } else {
            this.errMsg = '';
        }

        this.updateDom(this.config.animationSpeed);

    },

    isString: function(val) {
        return typeof val === 'string' || val instanceof String;
    },

    isArray: function(val) {
        return Array.isArray(val);
    },

    isNumber: function(val) {
        return typeof val === 'number' && isFinite(val);
    },

    scheduleUpdate: function(delay) {

        var nextLoad = this.config.updateInterval;
        if (typeof delay !== 'undefined' && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        setTimeout(function() {
            self.updateNests();
        }, nextLoad);
    }

});

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
        clientId: '',
        clientSecret: '',
        refreshToken: '',
        projectId: '',
        tokenData: {},
        displayType: 'grid',
        displayMode: 'all',
        showNames: true,
        thermostatsToShow: 'all',
        protectsToShow: 'all',
        alignment: 'center',
        groupTogether: false,
        thermostatSize: 'large',
        thermostatClassic: true,
        protectSize: 'small',
        protectDark: false,
        protectShowOk: true,
        motionSleep: false,
        motionSleepSeconds: 300, // this is in seconds (not ms)
        units: config.units,
        updateInterval: 120 * 1000,
        animationSpeed: 2 * 1000,
        initialLoadDelay: 0,
        version: '2.0.0'
    },

    getScripts: function() {
        return [
            'handlebars.runtime.min-v4.0.12.js',
            'mmm-nest-status-templates.js',
            this.file('mmm-nest-dial.js')
        ];
    },

    getStyles: function() {
        return [
            'mmm-nest-status.css'
        ];
    },

    start: function() {

        Log.info('Starting module: ' + this.name + ', version ' + this.config.version);

        // make sure thermostats and protects of different sizes
        // aren't in the same box
        if ((this.config.displayMode === 'all') && (this.config.protectSize !== this.config.thermostatSize)) {
            this.config.groupTogether = false;
        }

        this.errMsg = '';
        this.loaded = false;

        this.sleepTimer = null;
        this.sleeping = false;

        this.thermostats = [];
        this.protects = [];
        this.nestTransmitter = false;

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
        var nestHome = '<svg viewBox="0 0 19.5 18.2" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path transform="translate(-6.2 -6.7)" d="M18.1,24.9H13.8V19.4a2.1,2.1,0,0,1,4.2,0v5.5Zm6-8.1-1.8-1.5v9.5H19.9V19.3a3.9,3.9,0,1,0-7.8,0v5.5H9.6V15.3L7.8,16.8l-1.6-2L16,6.7l4.3,3.6V9.1h2V12l3.4,2.8Z" fill="#999999"/></svg><br>';

        // show error message
        if (this.errMsg !== '') {
            outer_wrapper.innerHTML = nestHome + this.errMsg;
            outer_wrapper.className = 'normal regular small';
            return outer_wrapper;
        }

        // show loading message
        if (!this.loaded) {
            outer_wrapper.innerHTML = nestHome + '... loading ...';
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
                outer_wrapper.className = this.classNames('nest-wrapper',alignment);
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
        var units = this.config.units;

        var thermostatSize = this.config.thermostatSize;
        var isClassic = this.config.thermostatClassic;

        var statusClass = '';
        var targetTemp = t.targetTemp;

        var dialSvgNode;
        var dialSvg = '';

        if ((t.isEcoMode) || (t.isOffMode)) {
            // default is fine
        } else if (parseInt(t.ambientTemp) < parseInt(t.targetTemp)) {
            statusClass = 'status-left';
        } else if (parseInt(t.ambientTemp) > parseInt(t.targetTemp)) {
            statusClass = 'status-right';
        } else {
            statusClass = 'hidden';
        }

        if (t.isHeatCoolMode) {
            targetTemp = t.targetTempHeat + '<small class="dot">&bull;</small>' + t.targetTempCool;
        } else if (t.isEcoMode) {
            targetTemp = 'ECO';
        } else if (t.isOffMode) {
            targetTemp = 'OFF';
        }

        // add 'heat set to' / 'cool set to' label (not for small sizes, eco mode and the non-classic version of thermostat)
        var showTempStatus = false;
        var tempStatusText = '';
        if ((thermostatSize !== 'small') && (isClassic) && (!t.isEcoMode)) {
            if (t.isHeating || t.isCooling) {
                showTempStatus = true;
                tempStatusText = (t.isHeating) ? 'HEATING' : 'COOLING';
            } else if ((t.thermostatMode === 'heat') || (t.thermostatMode === 'cool')) {
                showTempStatus = true;
                tempStatusText = (t.thermostatMode === 'heat') ? 'HEAT SET TO' : 'COOL SET TO';
            }
        }

        if (isClassic) {

            dialSvgNode = document.createElement('div');
            new mmmNestDial(dialSvgNode, {
                size: thermostatSize,
                temperatureScale: (units === 'imperial') ? 'F' : 'C',
                hasLeaf: !t.fanOn && t.leafOn,
                targetTemp: t.targetTemp,
                targetTempCool: t.targetTempCool,
                targetTempHeat: t.targetTempHeat,
                ambientTemp: t.ambientTemp,
                ecoTempLow: t.ecoTempLow,
                ecoTempHigh: t.ecoTempHigh,
                isEcoMode: t.isEcoMode,
                isOffMode: t.isOffMode,
                isHeatCoolMode: t.isHeatCoolMode
            });

            dialSvg = dialSvgNode.innerHTML;

        }

        var classes = this.classNames(
            'thermostat',
            t.thermostatHvac !== 'off' ? t.thermostatHvac : false,
            'size-' + thermostatSize,
            t.thermostatMode,
            isClassic ? 'classic' : false,
            t.isEcoMode ? 'eco': false
        );

        var statusClasses = this.classNames(
            'status',
            statusClass
        );

        var hbWrapper = document.createElement('div');

        // create handlebars data object
        var hbData = {
            classes,
            name: t.name.replace(/ *\([^)]*\) */g, ''),
            showNames,
            ambientTemp: t.ambientTemp,
            targetTemp,
            statusClasses,
            humidity: t.humidity + '%',
            fanOn: t.fanOn,
            leafOn: isClassic ? false : t.leafOn,
            isClassic,
            dialSvg,
            showTempStatus,
            tempStatusText
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
        var protectSmallMode = protectSize === 'small';

        // if we're splitting thermostats and protects into
        // 2 different containers, the Protect title should move to the bottom
        var moveTitle = this.config.displayMode === 'all' && !this.config.groupTogether;

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

        var classes = this.classNames(
            'protect',
            p.uiColor,
            moveTitle ? 'title-bot' : '',
            'size-' + protectSize,
            this.config.protectDark ? 'dark' : ''
        );

        var hbWrapper = document.createElement('div');

        // create handlebars data object
        var hbData = {
            classes,
            name: p.name.replace(/ *\([^)]*\) */g, ''),
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
                c3Text = item.targetTempHeat + '&deg &bull; ' + item.targetTempCool + '&deg;';
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

    getData: function() {

        if (!this.sleeping) {

            if ((this.config.clientId === '') || (this.config.clientSecret === '') || (this.config.refreshToken === '') || (this.config.projectId === '')) {
                this.errMsg = 'Please add your Google Device Access client ID, client secret, refresh token and project ID to the MagicMirror config.js file.';
                this.updateDom(this.config.animationSpeed);
            } else {
                this.sendSocketNotification('MMM_NEST_STATUS_GET', {
                    clientId: this.config.clientId,
                    clientSecret: this.config.clientSecret,
                    refreshToken: this.config.refreshToken,
                    projectId: this.config.projectId,
                    tokenData: this.config.tokenData
                });
            }

        }

    },

    notificationReceived(notification, payload, sender) {

        /*
            In case we have multiple `mmm-nest-status` modules with the same refreshToken running, we'll use just one
            data stream to update all modules.
        */

        var self = this;

        if (notification === 'ALL_MODULES_STARTED') {

            // check if multiple `mmm-nest-status` modules are installed
            var nestStatusModules = MM.getModules().withClass('mmm-nest-status');
            var nestStatusModulesNum = nestStatusModules.length;

            var refreshToken = this.config.refreshToken;
            var identifier = this.identifier;
            var refreshTokensMatch = true;
            var nestTransmitter = false; // whether this is the instance that should transmit data

            if (nestStatusModulesNum > 1) {

                // yep, we have more than one instance
                // let's see if their refreshTokens match
                for (i = 0; i < nestStatusModulesNum; i++) {

                    if ((i < 1) && (identifier === nestStatusModules[i].data.identifier)) {
                        // this is the first instance of this module
                        nestTransmitter = true;
                    }

                    if (refreshToken !== nestStatusModules[i].config.refreshToken) {
                        // no match on refreshTokens, unfortunately
                        refreshTokensMatch = false;
                    }

                }

                if (refreshTokensMatch && nestTransmitter) {
                    // this is the instance that should be transmitting data
                    this.nestTransmitter = true;
                    this.scheduleUpdate(this.config.initialLoadDelay);
                }

            } else {
                // there is only mmm-nest-status module instance or the refreshTokens didn't
                // match between instances
                this.nestTransmitter = true;
                this.scheduleUpdate(this.config.initialLoadDelay);
            }

        } else if (notification === 'MMM_NEST_STATUS_UPDATE') {
            // use the data from another `mmm-nest-status` module
            this.processNestData(payload);

        } else if ((notification === 'USER_PRESENCE') && (this.config.motionSleep)) {

            if (payload === true) {
                if (this.sleeping) {
                    this.show(this.config.animationSpeed);
                } else {
                    clearTimeout(this.sleepTimer);
                    this.sleepTimer = setTimeout(function() {
                        self.hide(self.config.animationSpeed);
                    }, self.config.motionSleepSeconds * 1000);
                }
            }

        }
    },

    socketNotificationReceived: function(notification, payload) {

        var self = this;

        if (notification === 'MMM_NEST_STATUS_DATA') {
            // broadcast Nest data update
            self.sendNotification('MMM_NEST_STATUS_UPDATE', payload);
            // process the data
            self.config.tokenData = payload.tokenData;
            self.processNestData(payload);
            self.scheduleUpdate(self.config.updateInterval);
        } else if (notification === 'MMM_NEST_STATUS_ACCESS_EXPIRED') {
            // the access token has expired
            // so we get the data again, but this time we add the old token data
            self.sendSocketNotification('MMM_NEST_STATUS_GET', {
                clientId: this.config.clientId,
                clientSecret: this.config.clientSecret,
                refreshToken: this.config.refreshToken,
                projectId: this.config.projectId,
                tokenData: payload
            });
        } else if (notification === 'MMM_NEST_STATUS_DATA_ERROR') {
            self.errMsg = 'Nest API Error: ' + payload;
            self.updateDom(self.config.animationSpeed);
        } else if (notification === 'MMM_NEST_STATUS_DATA_BLOCKED') {
            // this is a specific error that occurs when the API rate limit has been exceeded.
            // https://developers.google.com/nest/device-access/reference/errors/api
            // we'll try again after 10 minutes
            setTimeout(function() {
                self.scheduleUpdate(self.config.updateInterval);
            }, 10 * 60 * 1000);
            self.errMsg = 'The Device Access API rate limit has been exceeded.<br>This module will try to load data again in 10 minutes.';
            self.updateDom(self.config.animationSpeed);
        }

    },

    suspend: function() {
        // this method is triggered when a module is hidden using this.hide()

        this.sleeping = true;

    },

    resume: function() {
        // this method is triggered when a module is shown using this.show()

        var self = this;

        if (this.sleeping) {

            this.sleeping = false;

            // get new data
            if (this.nestTransmitter) {
                this.getData();
            }

            // restart timer
            if (this.config.motionSleep) {
                clearTimeout(this.sleepTimer);
                this.sleepTimer = setTimeout(function() {
                    self.hide(self.config.animationSpeed);
                }, self.config.motionSleepSeconds * 1000);
            }
        }

    },

    processNestData: function(data) {

        var renderUi = true;
        var thermostats = [];
        var protects = [];  // the Device Access API doesn't currently support Nest Protects :(

        var devices = data.devices;
        var devicesThermostats = [];
        var devicesProtects = [];
        var thermostatType = 'sdm.devices.types.THERMOSTAT';
        var protectType = 'sdm.devices.types.PROTECT'; // hoping this actually gets added at some point

        var numberOfThermostats = 0;
        var numberOfProtects = 0;

        for (var d = 0; d < devices.length; d++) {
            var device = devices[d];
            if (device.type === thermostatType) {
                numberOfThermostats++;
                devicesThermostats.push(device);
            } else if (device.type === protectType) {
                numberOfProtects++;
                devicesProtects.push(device);
            }
        }

        var displayMode = this.config.displayMode;
        var units = this.config.units;

        if ((displayMode !== 'protect') && (numberOfThermostats > 0)) {

            for (var i = 0; i < numberOfThermostats; i++) {

                var tObj = devicesThermostats[i];
                var tObjTraits = tObj.traits;
                var tObjParent = tObj.parentRelations;

                // device name
                var thermostatName = 'Nest Thermostat';
                if (tObjTraits['sdm.devices.traits.Info'].customName && (tObjTraits['sdm.devices.traits.Info'].customName.length > 0)) {
                    // use the custom name
                    thermostatName = tObjTraits['sdm.devices.traits.Info'].customName;
                } else if (tObjParent && tObjParent[0] && tObjParent[0].displayName) {
                    // use the parent display name
                    thermostatName = tObjParent[0].displayName;
                }

                // humidity settings
                var humiditySettings = tObjTraits['sdm.devices.traits.Humidity'];
                var humidity = humiditySettings && humiditySettings.ambientHumidityPercent ? humiditySettings.ambientHumidityPercent : 'na';

                // fan settings
                var fanSettings = tObjTraits['sdm.devices.traits.Fan'];
                var fanOn = fanSettings && fanSettings.timerMode === 'ON';

                // eco settings
                var ecoSettings = tObjTraits['sdm.devices.traits.ThermostatEco'];
                var leafOn = false;
                var ecoTempLow = 0;
                var ecoTempHigh = 0;

                if (ecoSettings) {
                    leafOn = ecoSettings.mode === 'MANUAL_ECO';
                    ecoTempLow = this.normalizeTemp(units, ecoSettings.coolCelsius);
                    ecoTempHigh = this.normalizeTemp(units, ecoSettings.heatCelsius);
                }

                // thermostat mode settings
                var thermostatModeSettings = tObjTraits['sdm.devices.traits.ThermostatMode'];
                var thermostatMode = thermostatModeSettings.mode.toLowerCase();

                // thermostat hvac settings
                var thermostatHvacSettings = tObjTraits['sdm.devices.traits.ThermostatHvac'];
                var thermostatHvac = thermostatHvacSettings.status.toLowerCase();

                // target high/low temperature settings
                var targetTemperatureSettings = tObjTraits['sdm.devices.traits.ThermostatTemperatureSetpoint'];
                var targetTempCool = 0; // Target temperature in Celsius for thermostat COOL and HEATCOOL modes.
                var targetTempHeat = 0; // Target temperature in Celsius for thermostat HEAT and HEATCOOL modes.

                if (targetTemperatureSettings) {
                    targetTempCool = this.normalizeTemp(units, targetTemperatureSettings.coolCelsius);
                    targetTempHeat = this.normalizeTemp(units, targetTemperatureSettings.heatCelsius);
                }

                // target temperature setting
                var targetTemp = 0;
                if (thermostatMode === 'heat') {
                    targetTemp = targetTempHeat;
                } else if (thermostatMode === 'cool') {
                    targetTemp = targetTempCool;
                }

                // ambient temperature settings
                var temperatureSettings = tObjTraits['sdm.devices.traits.Temperature'];
                var ambientTemp = this.normalizeTemp(units, temperatureSettings.ambientTemperatureCelsius);

                var thermostat = {
                    name: thermostatName,
                    humidity,
                    fanOn,
                    leafOn,         // displayed when the thermostat is set to an energy-saving temperature
                    ecoTempLow,
                    ecoTempHigh,
                    thermostatMode, // "heat", "cool", "heatcool", "off" ("off" means thermostat is turned off)
                    thermostatHvac, // "heating", "cooling", "off" ("off" means thermostat is dormant)
                    targetTempCool,
                    targetTempHeat,
                    ambientTemp,
                    targetTemp,
                    isHeatCoolMode: thermostatMode === 'heatcool',
                    isEcoMode: leafOn,
                    isOffMode: thermostatMode === 'off',
                    isHeating: thermostatHvac === 'heating',
                    isCooling: thermostatHvac === 'cooling'
                }

                thermostats.push(thermostat);

            }

        }

        // code below is commented out till Nest Protect support is added
        /*

        if ((displayMode !== 'thermostat') && (numberOfProtects > 0)) {

            for (i = 0; i < numberOfProtects; i++) {

                var pId = Object.keys(devices.smoke_co_alarms)[i];
                var pObj = devices.smoke_co_alarms[pId];

                var protect = {
                    name: pObj.name,
                    batteryHealth: pObj.battery_health,     // "ok", "replace"
                    coState: pObj.co_alarm_state,           // "ok", "warning", "emergency"
                    smokeState: pObj.smoke_alarm_state,     // "ok", "warning", "emergency"
                    uiColor: pObj.ui_color_state,           // "gray", "green", "yellow", "red"
                    isOnline: pObj.is_online                // true, false
                }

                protects.push(protect);

            }
        }

        */

        // check old data to make sure we're not re-rendering the UI for no reason
        if ((this.loaded) && ((this.thermostats.length > 0) || (this.protects.length > 0))) {

            var oldThermostats = this.thermostats;
            var oldProtects = this.protects;

            if ((this.jsonEqual(oldThermostats,thermostats)) && (this.jsonEqual(oldProtects,protects))) {
                // everything's the same
                renderUi = false;
            }

        }

        this.loaded = true;
        this.thermostats = thermostats;
        this.protects = protects;

        if (renderUi) {

            if ((numberOfProtects === 0) && (numberOfThermostats === 0)) {
                this.errMsg = 'There are no Nest Thermostats or Protects in this account.';
            } else {
                this.errMsg = '';
            }

            this.updateDom(this.config.animationSpeed);

        }

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

    // https://github.com/JedWatson/classnames/
    classNames: function() {
        var classes = [];

        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (!arg) continue;

            var argType = typeof arg;

            if (argType === 'string' || argType === 'number') {
                classes.push(arg);
            } else if (Array.isArray(arg) && arg.length) {
                var inner = classNames.apply(null, arg);
                if (inner) {
                    classes.push(inner);
                }
            } else if (argType === 'object') {
                for (var key in arg) {
                    if (hasOwn.call(arg, key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }
        }

        return classes.join(' ');
    },

    jsonEqual: function(a,b) {
        return JSON.stringify(a) === JSON.stringify(b);
    },

    celsiusToFahrenheit: function(temp) {
        return temp * 9 / 5 + 32;
    },

    normalizeTemp: function(units, celsius) {
        var temp = 0;
        if (celsius) {
            if (units === 'imperial') {
                temp = this.celsiusToFahrenheit(celsius);
            } else {
                temp = celsius;
            }
        }
        return Math.round(temp);
    },

    scheduleUpdate: function(delay) {

        var nextLoad = this.config.updateInterval;
        if (typeof delay !== 'undefined' && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        setTimeout(function() {
            self.getData();
        }, nextLoad);
    }

});

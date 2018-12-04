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
        protectSize: 'regular',
        protectDarkMode: false,
        protectShowOk: true,
        units: config.units,
        updateInterval: 60 * 1000,
        animationSpeed: 2 * 1000,
        initialLoadDelay: 0
    },

    getStyles: function() {
        return ['mmm-nest-status.css'];
    },

    start: function() {

        Log.info('Starting module: ' + this.name);

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
                outer_wrapper.appendChild(this.renderThermostatTable());
            }

            // gets a list view of Nest protects
            if ((displayMode !== 'thermostat') && (numberOfProtects > 0)) {
                outer_wrapper.appendChild(this.renderProtectTable());
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

    renderThermostatGrid: function(tId) {
        // renders a single Nest thermostat

        var thermostat = this.thermostats[tId];
        var showNames = this.config.showNames;

        var isHeating = thermostat.hvacState === 'heating';
        var isCooling = thermostat.hvacState === 'cooling';
        var isNotDoingAnything = thermostat.hvacState === 'off';

        var isHeatCoolMode = thermostat.hvacMode === 'heat-cool';
        var isEcoMode = thermostat.hvacMode === 'eco';

        var wrapper = document.createElement('div');
        wrapper.id = 'wrapper-thermostat-' + tId;

        // set up master classes
        wrapper.classList.add('thermostat', thermostat.hvacState);
        if (thermostat.hvacMode !== 'off') {
            wrapper.classList.add(thermostat.hvacMode);
        }

        // set up elements
        var circle = document.createElement('div');
        var dial = document.createElement('div');
        var status = document.createElement('span');
        var temperature = document.createElement('div');
        var humidity = document.createElement('div');

        // add title
        if (showNames) {
            var title = document.createElement('header');
            title.innerHTML = thermostat.name.replace(/ *\([^)]*\) */g, '');
            title.className = 'title';
            wrapper.appendChild(title);
        }

        // add dial to circle
        dial.className = 'dial';
        circle.appendChild(dial);

        // add status to circle
        status.classList.add('status');
        status.innerHTML = thermostat.ambientTemp;

        if (isNotDoingAnything) {
            if ((!isHeatCoolMode) && (!isEcoMode)) {
                if (parseInt(thermostat.ambientTemp) < parseInt(thermostat.targetTemp)) {
                    status.classList.add('heat');
                } else if (parseInt(thermostat.ambientTemp) > parseInt(thermostat.targetTemp)) {
                    status.classList.add('cool');
                } else {
                    status.classList.add('hidden');
                }
            }
        }
        circle.appendChild(status);

        // add temperature to circle
        var innerTemp = thermostat.targetTemp;
        if (isHeatCoolMode) {
            innerTemp = thermostat.targetTempLow + '<small>&bull;</small>' + thermostat.targetTempHigh;
        } else if (isEcoMode) {
            innerTemp = 'ECO';
        }
        temperature.innerHTML = innerTemp;
        temperature.className = 'temp';
        circle.appendChild(temperature);

        // add circle
        circle.className = 'circle';
        wrapper.appendChild(circle);

        // add humidity
        humidity.innerHTML = thermostat.humidity + '%';
        humidity.className = 'humidity';
        wrapper.appendChild(humidity);

        if ((thermostat.fanOn) || (thermostat.leafOn)) {
            var icon = document.createElement('span');
            icon.className = thermostat.fanOn ? 'icn fan' : 'icn leaf';
            wrapper.appendChild(icon);
        }

        return wrapper;

    },

    renderThermostatTable: function() {
        // renders a list of all Nest thermostats

        var displayMode = this.config.displayMode;
        var displayType = this.config.displayType;

        var numberOfThermostats = this.thermostats.length;
        var numberOfProtects = this.protects.length;

        var thermostatsToShow = this.config.thermostatsToShow;

        var table = document.createElement('table');
        table.classList.add('nest-list', 'xsmall', 'table');

        var headerRow = document.createElement('tr');

        var nameLabel = document.createElement('th');
        var currentLabel = document.createElement('th');
        var targetLabel = document.createElement('th');
        var humidityLabel = document.createElement('th');

        // set up header labels
        nameLabel.className = 'name';
        nameLabel.innerHTML = 'Thermostat Name';
        currentLabel.innerHTML = 'Current';
        targetLabel.innerHTML = 'Target';
        humidityLabel.innerHTML = 'Humidity';

        if (displayType === 'list-id') {
            // add list ID to table
            var idLabel = document.createElement('th');
            idLabel.className = 'nest-id';
            idLabel.innerHTML = 'ID';
            headerRow.appendChild(idLabel);
        }

        // append header labels
        headerRow.appendChild(nameLabel);
        headerRow.appendChild(currentLabel);
        headerRow.appendChild(targetLabel);
        headerRow.appendChild(humidityLabel);

        // append header to table
        table.appendChild(headerRow);

        // render rows
        if (this.isString(thermostatsToShow)) {
            // we only allow options of 'first' and 'all'

            if (thermostatsToShow === 'first') {
                table.appendChild(this.renderThermostatRow(0));
            } else {
                for (i = 0; i < numberOfThermostats; i++) {
                    table.appendChild(this.renderThermostatRow(i));
                }
            }

        } else if (this.isArray(thermostatsToShow)) {
            // show selected thermostats

            for (i = 0; i < thermostatsToShow.length; i++) {
                var val = thermostatsToShow[i];
                if ((this.isNumber(val)) && (val < numberOfThermostats)) {
                    table.appendChild(this.renderThermostatRow(val));
                }
            }

        }

        if ((displayMode === 'all') && (numberOfProtects > 0)) {
            table.classList.add('with-protects');
        }

        return table;

    },

    renderThermostatRow: function(tId) {
        // renders a row with a single Nest thermostat

        var displayType = this.config.displayType;

        var thermostat = this.thermostats[tId];

        var isHeating = thermostat.hvacState === 'heating';
        var isCooling = thermostat.hvacState === 'cooling';

        var isHeatCoolMode = thermostat.hvacMode === 'heat-cool';
        var isEcoMode = thermostat.hvacMode === 'eco';

        var row = document.createElement('tr');

        if (displayType === 'list-id') {
            // add id
            var idCell = document.createElement('td');
            idCell.className = 'nest-id';
            idCell.innerHTML = tId;
            row.appendChild(idCell);
        }

        // add name
        var nameCell = document.createElement('td');
        nameCell.className = 'name';
        nameCell.innerHTML = thermostat.name;
        row.appendChild(nameCell);

        // add current temperature
        var currentCell = document.createElement('td');
        if (isEcoMode) {
            currentCell.innerHTML = 'ECO';
        } else {
            currentCell.innerHTML = thermostat.ambientTemp + '&deg;';
        }
        row.appendChild(currentCell);

        // add target temperature
        var targetCell = document.createElement('td');
        var targetText = thermostat.targetTemp + '&deg;'

        if (isHeating) {
            targetCell.className = 'heating';
        } else if (isCooling) {
            targetCell.className = 'cooling';
        }

        if (isHeatCoolMode) {
            targetText = thermostat.targetTempLow + '&deg &bull; ' + thermostat.targetTempHigh + '&deg;';
        } else if (isEcoMode) {
            targetText = thermostat.ecoTempLow + '&deg &bull; ' + thermostat.ecoTempHigh + '&deg;';
        }

        targetCell.innerHTML = targetText;
        row.appendChild(targetCell);

        // add humidity
        var humidityCell = document.createElement('td');
        humidityCell.innerHTML = thermostat.humidity + '%';
        row.appendChild(humidityCell);

        return row;

    },

    renderProtectGrid: function(pId) {
        // renders a single Nest protect

        var protect = this.protects[pId];
        var showNames = this.config.showNames;
        var protectSize = this.config.protectSize;
        var protectShowOk = this.config.protectShowOk;
        var protectDarkMode = this.config.protectDarkMode;
        var protectSmallMode = protectSize === 'small';

        // check to see if we're using the dark version of the protects
        var darkClass = protectDarkMode ? ' dark' : '';

        // check to see if we're using the small version of the protects
        var smallClass = protectSmallMode ? ' sml' : '';

        // if we're splitting thermostats and protects into
        // 2 different containers, the Protect title should move to the bottom
        var moveTitle = this.config.displayMode === 'all' && !this.config.groupTogether;
        var moveClass = moveTitle ? ' title-bot' : '';

        var wrapper = document.createElement('div');
        wrapper.id = 'wrapper-protect-' + pId;
        wrapper.className = 'protect ' + protect.uiColor + moveClass + smallClass + darkClass;

        // set up elements
        var title = document.createElement('header');
        var circle = document.createElement('div');
        var ring = document.createElement('div');
        var status = document.createElement('span');

        // add title (top)
        if (showNames) {
            title.innerHTML = protect.name.replace(/ *\([^)]*\) */g, '');
            title.className = 'title';
            if (!moveTitle) {
                wrapper.appendChild(title);
            }
        }

        // add ring to circle
        ring.className = 'ring';
        circle.appendChild(ring);

        // add status to circle
        var statusText = (protectShowOk && protect.uiColor !== 'gray') ? 'OK' : '';

        if (protect.uiColor !== 'green') {

            // add emergency or warning texts
            if ((protect.coState === 'emergency') && (protect.smokeState === 'emergency')) {
                statusText = '<b>Smoke & CO2</b>' + (protectSmallMode ? '' : 'Emergency');
            } else if (protect.coState === 'emergency') {
                statusText = '<b>CO2</b>' + (protectSmallMode ? '' : 'Emergency');
            } else if (protect.smokeState === 'emergency') {
                statusText = '<b>Smoke</b>' + (protectSmallMode ? '' : 'Emergency');
            } else if ((protect.coState === 'warning') && (protect.smokeState === 'warning')) {
                statusText = '<b>Smoke & CO2</b>' + (protectSmallMode ? '' : 'Warning');
            } else if (protect.coState === 'warning') {
                statusText = '<b>CO2</b>' + (protectSmallMode ? '' : 'Warning');
            } else if (protect.smokeState === 'warning') {
                statusText = '<b>Smoke</b>' + (protectSmallMode ? '' : 'Warning');
            } else if (protect.batteryHealth === 'replace') {
                statusText = '<span class="icon-battery"></span>' + (protectSmallMode ? '' : 'Replace <b>Battery</b>');
            } else if (!protect.isOnline) {
                statusText = (protectSmallMode ? '' : 'Protect') + '<b>Offline</b>';
            }

        }

        status.className = 'status';
        status.innerHTML = statusText;
        circle.appendChild(status);

        // add circle
        circle.className = 'circle';
        wrapper.appendChild(circle);

        // add title (bottom)
        if (showNames && moveTitle) {
            wrapper.appendChild(title);
        }

        return wrapper;

    },

    renderProtectTable: function() {
        // renders a list of all Nest protects

        var displayType = this.config.displayType;

        var numberOfProtects = this.protects.length;
        var protectsToShow = this.config.protectsToShow;

        var table = document.createElement('table');
        table.classList.add('nest-list', 'xsmall', 'table');

        var headerRow = document.createElement('tr');

        var nameLabel = document.createElement('th');
        var batteryLabel = document.createElement('th');
        var coLabel = document.createElement('th');
        var smokeLabel = document.createElement('th');

        // set up header labels
        nameLabel.className = 'name';
        nameLabel.innerHTML = 'Protect Name';
        batteryLabel.innerHTML = 'Battery';
        coLabel.innerHTML = 'CO2';
        smokeLabel.innerHTML = 'Smoke';

        if (displayType === 'list-id') {
            // add list ID to table
            var idLabel = document.createElement('th');
            idLabel.className = 'nest-id';
            idLabel.innerHTML = 'ID';
            headerRow.appendChild(idLabel);
        }

        // append header labels
        headerRow.appendChild(nameLabel);
        headerRow.appendChild(batteryLabel);
        headerRow.appendChild(coLabel);
        headerRow.appendChild(smokeLabel);

        // append header to table
        table.appendChild(headerRow);

        // render rows
        if (this.isString(protectsToShow)) {
            // we only allow options of 'first' and 'all'

            if (protectsToShow === 'first') {
                table.appendChild(this.renderProtectRow(0));
            } else {
                for (i = 0; i < numberOfProtects; i++) {
                    table.appendChild(this.renderProtectRow(i));
                }
            }

        } else if (this.isArray(protectsToShow)) {
            // show selected protects

            for (i = 0; i < protectsToShow.length; i++) {
                var val = protectsToShow[i];
                if ((this.isNumber(val)) && (val < numberOfProtects)) {
                    table.appendChild(this.renderProtectRow(val));
                }
            }

        }

        return table;

    },

    renderProtectRow: function(pId) {
        // renders a row with a single Nest protect

        var displayType = this.config.displayType;

        var protect = this.protects[pId];
        var row = document.createElement('tr');

        if (displayType === 'list-id') {
            // add id
            var idCell = document.createElement('td');
            idCell.className = 'nest-id';
            idCell.innerHTML = pId;
            row.appendChild(idCell);
        }

        // add name
        var nameCell = document.createElement('td');
        nameCell.className = 'name';
        nameCell.innerHTML = protect.name;
        row.appendChild(nameCell);

        // add battery status
        var batteryCell = document.createElement('td');
        batteryCell.innerHTML = protect.batteryHealth.toUpperCase();

        if (protect.batteryHealth === 'replace') {
            batteryCell.className = 'warning';
        } else if (!protect.isOnline) {
            batteryCell.className = 'warning';
            batteryCell.innerHTML = 'OFFLINE';
        }
        row.appendChild(batteryCell);

        // add Co2 status
        var coCell = document.createElement('td');
        coCell.innerHTML = protect.coState.toUpperCase();
        if (protect.coState === 'warning') {
            coCell.className = 'warning';
        } else if (protect.coState === 'emergency') {
            coCell.className = 'emergency';
        }
        row.appendChild(coCell);

        // add smoke status
        var smokeCell = document.createElement('td');
        smokeCell.innerHTML = protect.smokeState.toUpperCase();
        if (protect.smokeState === 'warning') {
            smokeCell.className = 'warning';
        } else if (protect.smokeState === 'emergency') {
            smokeCell.className = 'emergency';
        }
        row.appendChild(smokeCell);

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
                    ecoTempHigh: (units === 'imperial') ? tObj.eco_temperature_high_f : tObj.eco_temperature_high_c
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

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({

    start: function() {
        console.log('Starting node_helper for module [' + this.name + ']');
    },

    getDeviceData: function(dataUrl, dataOptions, tokenData) {

        var self = this;

        request(dataUrl, dataOptions, function(err, res, body) {

            if ((res.statusCode === 401) && (res.statusMessage === 'Unauthorized')) {
                // access token has expired
                self.sendSocketNotification('MMM_NEST_STATUS_ACCESS_EXPIRED', tokenData);
            } else if (res.statusCode === 429) {
                self.sendSocketNotification('MMM_NEST_STATUS_DATA_BLOCKED', err);
            } else if ((err) || (res.statusCode !== 200)) {
                self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', err);
            } else {
                if (body === {}) {
                    self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', 'Token works, but no data was received.<br>Make sure you are using the master account for your Nest.');
                } else {
                    var data = JSON.parse(body);
                    data.tokenData = tokenData;
                    self.sendSocketNotification('MMM_NEST_STATUS_DATA', data);
                }
            }

        });

    },

    socketNotificationReceived: function(notification, payload) {

        if (notification === 'MMM_NEST_STATUS_GET') {

            var self = this;
            var clientId = payload.clientId;
            var clientSecret = payload.clientSecret;
            var refreshToken = payload.refreshToken;
            var projectId = payload.projectId;
            var tokenData = payload.tokenData;

            var dataUrl = 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + projectId + '/devices';
            var dataOptions = {};

            var refreshUrl = 'https://www.googleapis.com/oauth2/v4/token?client_id=' + clientId + '&client_secret=' + clientSecret + '&refresh_token=' + refreshToken + '&grant_type=refresh_token';
            var refreshOptions = {
                'method': 'POST'
            };

            // the access token expires after an hour, so there's really no reason to update it every time
            // we want to refresh the Nest data

            // there are three scenarios:
            // 1. we have token data, and the access token is still valid
            // 2. we have token data, but the access token has expired
            // 3. we have no token data and therefore no access token

            var tokenStillValid = false;
            var currentTimeInSeconds = new Date().getTime() / 1000;

            if ((tokenData) && (tokenData.access_token) && (tokenData.expires_in_time)) {
                // check to see if access token has more than 5 mins of expiry time left
                if (tokenData.expires_in_time > (300 + currentTimeInSeconds)) {
                    tokenStillValid = true;
                }
            }

            if (tokenStillValid) {
                // token is still valid, so no need to get a new one

                dataOptions = {
                    'method': 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + tokenData.access_token,
                        'Content-Type': 'application/json'
                    }
                };

                self.getDeviceData(dataUrl, dataOptions, tokenData);

            } else if (!tokenStillValid || !tokenData || (tokenData && Object.keys(tokenData).length === 0)) {
                // token is either expired or we have no token data, so time to use the refresh token
                // to get a new access token

                request(refreshUrl, refreshOptions, function(err, res, body) {
                    var bodyData = JSON.parse(body);

                    if (bodyData && bodyData.access_token) {

                        tokenData = bodyData;
                        tokenData.refresh_token = refreshToken;
                        tokenData.expires_in_time = currentTimeInSeconds + bodyData.expires_in;

                        dataOptions = {
                            'method': 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + tokenData.access_token,
                                'Content-Type': 'application/json'
                            }
                        };

                        self.getDeviceData(dataUrl, dataOptions, tokenData);

                    } else {
                        // don't know how you'd get here
                        self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', 'Authentication failed.<br>Please double-check that your refresh token is correct and try again in a minute or two.');
                    }
                });

            }
        }
    }
});
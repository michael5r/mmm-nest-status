var NodeHelper = require('node_helper');
var axios = require('axios').default;

module.exports = NodeHelper.create({

    start: function() {
        console.log('Starting node_helper for module [' + this.name + ']');
    },

    getDeviceData: function(dataOptions, tokenData) {

        var self = this;

        axios(dataOptions)
            .then(function (res) {

                if ((res.status === 401) && (res.statusText === 'Unauthorized')) {
                    // access token has expired
                    self.sendSocketNotification('MMM_NEST_STATUS_ACCESS_EXPIRED', tokenData);
                } else if (res.status === 429) {
                    self.sendSocketNotification('MMM_NEST_STATUS_DATA_BLOCKED', err);
                } else if (res.status !== 200) {
                    self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', err);
                } else {
                    if (res.data === {}) {
                        self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', 'Token works, but no data was received.<br>Make sure you are using the master account for your Nest.');
                    } else {
                        var data = res.data;
                        data.tokenData = tokenData;
                        self.sendSocketNotification('MMM_NEST_STATUS_DATA', data);
                    }
                }

            })
            .catch(function (err) {
                self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', err);
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
                method: 'POST',
                url: refreshUrl
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
                    url: dataUrl,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + tokenData.access_token,
                        'Content-Type': 'application/json'
                    }
                };

                self.getDeviceData(dataOptions, tokenData);

            } else if (!tokenStillValid || !tokenData || (tokenData && Object.keys(tokenData).length === 0)) {
                // token is either expired or we have no token data, so time to use the refresh token
                // to get a new access token

                axios(refreshOptions)
                    .then(function (res) {

                        if (res && res.data && res.data.access_token) {

                            var bodyData = res.data;
                            tokenData = bodyData;
                            tokenData.refresh_token = refreshToken;
                            tokenData.expires_in_time = currentTimeInSeconds + bodyData.expires_in;
                            
                            dataOptions = {
                                url: dataUrl,
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Bearer ' + tokenData.access_token,
                                    'Content-Type': 'application/json'
                                }
                            };
    
                            self.getDeviceData(dataOptions, tokenData);
    
                        } else {
                            // don't know how you'd get here
                            self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', 'Authentication failed.<br>Please double-check that your refresh token is correct and try again in a minute or two.');
                        }

                    })
                    .catch(function (err) {
                        self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', 'Authentication failed.<br>Please double-check that your refresh token is correct and try again in a minute or two.');
                    });

            }
        }
    }
});